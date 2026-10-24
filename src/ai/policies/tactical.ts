import { cellKey } from "../../core/ids.ts";
import type { Cell } from "../../core/types-def.ts";
import type { Agent, AiCtx, Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { dangerAt } from "../danger.ts";
import { lethalParts, scoreCandidate } from "../score.ts";
import { OBJECTIVE_DEFAULTS, objectiveMoveValue } from "../objectives.ts";
import { pursuitCells } from "../knowledge.ts";
import { mobile } from "../intent.ts";

const DEFAULTS = { maxMoves: 8 };
// 經 AiCtx 取 RulesQuery 的目標型別（policies 不直接 import rules-query，讓「rules 只在 adapters/」的 grep 乾淨）。
type AbilityTarget = NonNullable<Parameters<AiCtx["q"]["checkAbility"]>[3]>;

export function proposeTactical(ctx: AiCtx, agent: Agent, opts?: { maxMoves?: number; hostileOnly?: boolean; allowMove?: (cell: Cell) => boolean }): Candidate[] {
  const { q, view } = ctx;
  const actor = agent.unit;
  const self = view.units[actor];
  if (!self || !q.isActive(view, actor)) return [];
  const others = Object.keys(view.units).sort().filter((id) => id !== actor && q.isActive(view, id));
  const enemies = others.filter((id) => opts?.hostileOnly === false || q.hostile(view, actor, id));
  const targets = pursuitCells(ctx, actor, opts?.hostileOnly !== false);
  const nearest = (cell: Cell): number => Math.min(...targets.map(target => q.distance(cell, target)));
  const reachCosts = q.reachable(view, actor);
  const reachable = Object.keys(reachCosts).sort().map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x: x!, y: y! };
  }).filter(cell => !opts?.allowMove || opts.allowMove(cell));
  const moves = [...reachable].sort((a, b) => nearest(a) - nearest(b) || dangerAt(ctx.danger, a) - dangerAt(ctx.danger, b)
    || a.x - b.x || a.y - b.y)
    .slice(0, Math.max(0, Math.floor(opts?.maxMoves ?? ctx.params.maxMoves ?? DEFAULTS.maxMoves)));
  // 最近敵人的格子可能花光 AP；另保留低移動成本的射程內格，合法性仍交規則預覽。
  const isAttack = (ability: string): boolean => {
    const def = q.abilityDef(ability);
    return def.mode === "activated" && ["attack", "attackArea", "disable"].some(t => q.evalNum(view, def.ai.tactics[t] ?? 0, actor) > 0);
  };
  const firingMoves: Cell[] = [];
  const moveLimit = Math.max(0, Math.floor(opts?.maxMoves ?? ctx.params.maxMoves ?? DEFAULTS.maxMoves));
  for (const ability of [...q.abilitiesOf(view, actor)].sort().filter(isAttack)) {
    if (firingMoves.length >= moveLimit) break;
    const def = q.abilityDef(ability), range = q.abilityRange(view, actor, ability);
    if (!["unit", "ball", "line", "cone"].includes(def.target.kind)) continue;
    for (const id of enemies) {
      if (firingMoves.length >= moveLimit) break;
      const target = view.units[id]!.pos;
      const aim = def.target.kind === "unit" ? { unit: id } : { cell: target };
      if (q.checkAbility(view, actor, ability, aim) === null) continue;
      const cell = reachable.filter(c => {
        const d = q.distance(c, target);
        return d >= range.min && d <= range.max && (!def.target.los || q.los(view, c, target));
      }).sort((a, b) => reachCosts[cellKey(a.x, a.y)]! - reachCosts[cellKey(b.x, b.y)]!
        || q.distance(a, target) - q.distance(b, target) || a.x - b.x || a.y - b.y)[0];
      if (cell && firingMoves.length < moveLimit && !firingMoves.some(c => q.distance(c, cell) === 0)) firingMoves.push(cell);
    }
  }
  for (const cell of firingMoves) if (!moves.some(c => q.distance(c, cell) === 0)) moves.push(cell);
  // berserk 共用候選產生器，但仍維持只追敵的原有行為。
  if (agent.policy !== "berserk" && opts?.hostileOnly !== false) {
    const objectiveMoves = reachable.map(cell => ({ cell, value: objectiveMoveValue(ctx, actor, self.pos, cell) }))
      .filter(c => c.value > 0).sort((a, b) => b.value - a.value || a.cell.x - b.cell.x || a.cell.y - b.cell.y)
      .slice(0, Math.max(0, Math.floor(ctx.params.objMoves ?? OBJECTIVE_DEFAULTS.objMoves)));
    for (const { cell } of objectiveMoves) if (!moves.some(c => q.distance(c, cell) === 0)) moves.push(cell);
  }
  const candidates: Candidate[] = [];
  for (const move of [undefined, ...moves]) {
    let state = view;
    if (move) {
      const path = q.pathTo(view, actor, move);
      if (!path) continue;
      const cmd = { kind: "move" as const, actor, path };
      const preview = q.previewCommand(view, cmd);
      if (!preview.result.ok) continue;
      state = preview.state;
      candidates.push({ cmd });
    }
    for (const ability of [...q.abilitiesOf(state, actor)].sort()) {
      const def = q.abilityDef(ability);
      if (def.mode !== "activated" && def.mode !== "sustained") continue;
      if (def.mode === "sustained" && state.units[actor]!.sustained.includes(ability)) continue;
      const targets: AbilityTarget[] = [];
      if (def.target.kind === "self") targets.push({ unit: actor });
      else if (["cell", "ball", "line", "cone"].includes(def.target.kind)) {
        const seen = new Set<string>();
        const friends = def.target.kind !== "cell" && def.target.friendly !== "no"
          ? Object.keys(state.units).sort().filter(id => q.isActive(state, id) && !q.hostile(state, actor, id)) : [];
        for (const id of [...enemies, ...friends]) {
          const cell = state.units[id]!.pos;
          const key = cellKey(cell.x, cell.y);
          if (!seen.has(key)) targets.push({ cell: { ...cell } });
          seen.add(key);
        }
      } else if (def.target.kind === "unit" || def.target.kind === "part") {
        // 友方治療／支援仍由規則判定合法；hostileOnly=false 供失控策略擴大攻擊對象。
        const ids = Object.keys(state.units).sort().filter((id) => q.isActive(state, id)
          && (opts?.hostileOnly === false || q.hostile(state, actor, id) || def.target.friendly !== "no"));
        for (const id of ids) {
          if (def.target.kind === "unit") targets.push({ unit: id });
          if (def.partAim?.allowed) {
            const lethal = q.hostile(state, actor, id) ? lethalParts(q, state, id) : [];
            for (const part of q.partDefs(state, id)) {
              if (!state.units[id]!.parts[part.id]?.broken && (lethal.some(core => core.id === part.id)
                || def.ai.targetPref?.parts?.some((fn) => part.functions.includes(fn)))) {
                targets.push({ unit: id, part: part.id });
              }
            }
          }
        }
      }
      for (const target of targets) {
        if (q.checkAbility(state, actor, ability, target) === null) {
          candidates.push({ ...(move ? { move: { ...move } } : {}), cmd: { kind: "useAbility", actor, ability, target } });
        }
      }
    }
  }
  // 已有合法出手位置時，不選走光 AP 的純追敵移動；護送／守區等任務進展仍保留。
  const attacks = candidates.filter(c => c.cmd.kind === "useAbility" && isAttack(c.cmd.ability));
  if (attacks.length) {
    const ready = new Set(attacks.map(c => cellKey((c.move ?? self.pos).x, (c.move ?? self.pos).y)));
    for (let i = candidates.length - 1; i >= 0; i--) {
      const c = candidates[i]!;
      if (c.cmd.kind !== "move") continue;
      const dest = c.cmd.path.at(-1) ?? self.pos;
      if (!ready.has(cellKey(dest.x, dest.y)) && objectiveMoveValue(ctx, actor, self.pos, dest) <= 0) candidates.splice(i, 1);
    }
  }
  // 本輪已用過 Wait 就不提（真規則會拒絕 wait-used；stub 無 rt.waitUsed 簿記時照舊）。
  if (!view.rt?.waitUsed.includes(actor)) candidates.push({ cmd: { kind: "wait", actor } });
  candidates.push({ cmd: { kind: "end", actor } });
  if (mobile(q, view, actor) && view.rt?.exits.some((cell) => q.distance(cell, self.pos) === 0)) candidates.push({ cmd: { kind: "retreat", actor } });
  // 沒有握指令權的人物（無人機、失去駕駛）不能棄機；不提出必被規則以 no-commander 拒絕的候選。
  if (q.commanderOf(view, actor) !== null) candidates.push({ cmd: { kind: "eject", actor } });
  return candidates;
}

registerPolicy({ id: "tactical", propose: proposeTactical, score: scoreCandidate });
