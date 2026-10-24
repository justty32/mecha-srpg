import type { ContentDB } from "../../src/content/contentdb.ts";
import type { BattleState, Command } from "../../src/core/types-state.ts";
import { createRng, nextInt } from "../../src/core/rng.ts";
import { abilitiesOf, checkAbility, commanderOf, createBattle, evalCtxFor, isActive, seatsOf, startBattle, tryCommand, rt } from "../../src/rules/index.ts";
import { evalNum } from "../../src/core/numexpr.ts";
import { runBattle } from "../../src/sim/run.ts";
import type { SimSetup } from "../../src/sim/run.ts";
import { createSession } from "../../src/sim/session.ts";
import type { AbilityTarget, BattleSession, LegalActions } from "../../src/sim/session.ts";
import { generate } from "./gen.ts";
import type { Mode } from "./gen.ts";
import { aiDeterminism, aiLegal, checkState, errorText, groupKey, legalEnum, newMemory, noThrow, previewPure,
  replayHash, saveRoundtrip, termination } from "./invariants.ts";
import type { Add, Issue } from "./invariants.ts";

export type Finding = Issue & { seed: number; mode: Mode; step: number; round?: number; command?: Command };
export type Trial = { seed: number; mode: Mode; scenario: string | null; steps: number; round: number; issues: Finding[]; midSaveStep: number | null };
export const MAX_STEPS = 4000;

/** 與 session 同順序；大圖只枚舉射程方框，存活目標仍交 checkAbility 判定。 */
export function boundedLegalActions(session: BattleSession): LegalActions {
  const actor = session.currentActor(), s = session.state, db = session.contentDb, ctx = { db, s };
  const actions: LegalActions = { actor, reachable: {}, abilities: [], wait: false, retreat: false, eject: false, end: false };
  if (actor === null || session.outcome()) return actions;
  const unit = s.units[actor]!;
  if (!["none", "disabled"].includes(unit.controlMode)) actions.reachable = session.rulesQuery.reachable(s, actor);
  const living = Object.keys(s.units).sort().filter(id => isActive(ctx, id));
  for (const ability of abilitiesOf(ctx, actor)) {
    const def = db.require("ability", ability), targets: AbilityTarget[] = [];
    if (def.mode === "reaction" || def.mode === "passive") continue;
    const add = (target: AbilityTarget): void => { if (checkAbility(ctx, actor, ability, target) === null) targets.push(target); };
    if (def.target.kind === "self") add({ unit: actor });
    else if (def.target.kind === "unit" || def.target.kind === "part") {
      for (const target of living) {
        if (def.target.kind === "unit") add({ unit: target });
        if (def.partAim?.allowed) for (const part of Object.keys(s.units[target]!.parts).sort()) add({ unit: target, part });
      }
    } else {
      // actorRole 可與 commander 不同，求值上下文須與 checkAbility 相同。
      const person = def.actorRole ? seatsOf(ctx, actor).find(seat => seat.role === def.actorRole)?.person : commanderOf(ctx, actor);
      const range = evalNum(def.target.range.max, evalCtxFor(ctx, { unit: actor, ...(person ? { person } : {}) }));
      const x0 = Math.max(0, Math.ceil(unit.pos.x - range)), x1 = Math.min(s.map.width - 1, Math.floor(unit.pos.x + range));
      const y0 = Math.max(0, Math.ceil(unit.pos.y - range)), y1 = Math.min(s.map.height - 1, Math.floor(unit.pos.y + range));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) add({ cell: { x, y } });
    }
    actions.abilities.push({ ability, targets });
  }
  for (const kind of ["wait", "retreat", "eject", "end"] as const) actions[kind] = session.preview({ kind, actor }).result.ok;
  return actions;
}

export function runTrial(db: ContentDB, seed: number, mode: Mode): Trial {
  const trial: Trial = { seed, mode, scenario: null, steps: 0, round: 0, issues: [], midSaveStep: null }, seen = new Set<string>();
  let state: BattleState | undefined, command: Command | undefined;
  const add: Add = (invariant, message, warning = false) => {
    const key = groupKey(invariant, message);
    if (seen.has(key)) return;
    seen.add(key);
    trial.issues.push({ seed, mode, invariant, message, warning, step: trial.steps,
      ...(state ? { round: state.round } : {}), ...(command ? { command: structuredClone(command) } : {}) });
  };
  let sim: SimSetup;
  try { sim = generate(db, seed, mode); trial.scenario = sim.scenario; }
  catch (error) { add("gen-error", errorText(error)); return trial; }
  // 分開初始化拒絕與 startBattle／AI 的例外，避免把工具生成錯誤混成規則錯誤。
  try { state = createBattle(db, sim.setup, seed); }
  catch (error) { add("setup-rejected", errorText(error)); add("no-throw", `createBattle: ${errorText(error)}`); return trial; }
  const memory = newMemory();
  const inspect = (): void => { trial.round = state!.round; checkState({ db, s: state! }, add, memory); };
  const saveStep = seed % Math.max(1, sim.setup.units.length);
  let checkpoint: { state: BattleState; commands: Command[]; step: number } | undefined;
  const saveMidway = (): void => {
    if (!checkpoint || trial.midSaveStep !== null) return;
    trial.midSaveStep = checkpoint.step;
    try { saveRoundtrip(db, sim.setup, seed, checkpoint.commands, checkpoint.state, add); }
    catch (error) { add("save-roundtrip", `midway: ${errorText(error)}`); add("no-throw", `save-roundtrip midway: ${errorText(error)}`); }
    checkpoint = undefined;
  };
  const remember = (prefix: readonly Command[]): void => {
    if (trial.midSaveStep !== null || rt(state!).outcome) return;
    checkpoint = { state: structuredClone(state!), commands: structuredClone([...prefix]), step: trial.steps };
    if (trial.steps >= saveStep) saveMidway();
  };
  let commands: Command[] = [], original: BattleState | undefined;
  if (mode === "ai") {
    const run = noThrow(add, "AI runBattle", () => runBattle({ db, sim, seed, maxSteps: MAX_STEPS }));
    if (!run) return trial;
    commands = run.value.commands; original = run.value.state;
    aiLegal(run.value.rejected, add);
    if (!noThrow(add, "startBattle", () => startBattle({ db, s: state! }))) return trial;
    inspect();
    remember([]);
    for (const cmd of commands) {
      command = cmd;
      const result = noThrow(add, "tryCommand/previewCommand", () => trial.steps % 10 === 0
        ? previewPure({ db, s: state! }, cmd, () => tryCommand({ db, s: state! }, cmd), add)
        : tryCommand({ db, s: state! }, cmd));
      if (!result) return trial;
      if (!result.value.ok) { add("replay-hash", "recorded AI command rejected during reconstruction"); break; }
      trial.steps++; inspect(); remember(commands.slice(0, trial.steps));
    }
    state = original;
    if (seed % 5 === 0) noThrow(add, "ai-determinism", () => aiDeterminism(db, sim, seed, run.value.hash, MAX_STEPS, add));
  } else {
    const created = noThrow(add, "createSession/startBattle", () => createSession({ db, sim, seed,
      human: [...new Set([...Object.keys(sim.setup.factions ?? {}), ...sim.setup.units.map(u => u.owner), "berserk"])], maxSteps: MAX_STEPS }));
    if (!created) return trial;
    const session = created.value, rng = createRng(seed, 802), counts = new Map<string, number>();
    state = session.state; inspect(); remember(session.commands);
    for (let attempt = 0; attempt < MAX_STEPS && !session.outcome(); attempt++) {
      const actor = session.currentActor();
      if (actor === null) break;
      const key = `${state.round}:${actor}`, count = counts.get(key) ?? 0;
      const result = noThrow(add, "legalActions/previewCommand/submit", () => {
        const legal = mode === "scenario" ? boundedLegalActions(session) : session.legalActions(), candidates: Command[] = [];
        if (mode === "scenario" && attempt % 50 === 0) legalEnum(legal, session.legalActions(), add);
        if (count >= 12) candidates.push({ kind: "end", actor });
        else {
          // 每個目的格／能力目標／簡單動作各是一個候選，均勻抽取。
          for (const cell of Object.keys(legal.reachable).sort()) {
            const [x, y] = cell.split(",").map(Number);
            candidates.push({ kind: "move", actor, path: [{ x: x!, y: y! }] });
          }
          for (const a of legal.abilities) for (const target of a.targets) candidates.push({ kind: "useAbility", actor, ability: a.ability, target });
          for (const kind of ["wait", "end", "retreat", "eject"] as const) if (legal[kind]) candidates.push({ kind, actor });
        }
        if (!candidates.length) { add("legal-rejected", `no legal actions for actor ${actor}`); return false; }
        command = candidates[nextInt(rng, candidates.length)]!;
        if (command.kind === "move") {
          const target = command.path[0]!, path = session.rulesQuery.pathTo(state!, actor, target);
          if (!path) { add("legal-rejected", `reachable destination has no path ${actor} ${target.x},${target.y}`); return false; }
          command.path = path;
        }
        const cmd = command;
        const submitted = attempt % 10 === 0 ? previewPure({ db, s: state! }, cmd, () => session.submit(cmd), add) : session.submit(cmd);
        if (!submitted.ok) add("legal-rejected", `legal action rejected ${cmd.kind}: ${"rejection" in submitted ? JSON.stringify(submitted.rejection) : "rejected"}`);
        return submitted.ok;
      });
      if (!result) return trial;
      counts.set(key, count + 1);
      if (result.value) { trial.steps++; inspect(); remember(session.commands); }
    }
    commands = [...session.commands];
  }
  command = undefined;
  // 比預定步數更早結束的場，使用最後一個非終局前綴，仍與終局存檔分開驗。
  saveMidway();
  if (!rt(state).outcome) add("no-termination", `battle did not terminate round=${state.round} steps=${trial.steps} limit=${MAX_STEPS}`);
  noThrow(add, "battleResult", () => termination({ db, s: state! }, add));
  // 終局比較即使未完場也執行，檢查可保存的已成功指令前綴。
  for (const [name, check] of [["replay-hash", replayHash], ["save-roundtrip", saveRoundtrip]] as const) {
    try { check(db, sim.setup, seed, commands, state, add); }
    catch (error) { add(name, errorText(error)); add("no-throw", `${name}: ${errorText(error)}`); }
  }
  return trial;
}
