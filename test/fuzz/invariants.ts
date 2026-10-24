import type { ContentDB } from "../../src/content/contentdb.ts";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import type { BattleState, Command, EffectInstance } from "../../src/core/types-state.ts";
import { canonicalJson, hashLog } from "../../src/core/eventlog.ts";
import { battleResult, currentActor, isDead, layerDefs, poolDecls, previewCommand, rt } from "../../src/rules/index.ts";
import type { Ctx, BattleSetup } from "../../src/rules/index.ts";
import { replay } from "../../src/sim/replay.ts";
import { runBattle } from "../../src/sim/run.ts";
import type { SimSetup } from "../../src/sim/run.ts";
import { createSave, serializeSave, parseSave, loadSave } from "../../src/sim/save.ts";
import type { LegalActions } from "../../src/sim/session.ts";

export type Issue = { invariant: string; message: string; warning?: boolean };
export type Add = (invariant: string, message: string, warning?: boolean) => void;
export const NAMES = ["no-throw", "preview-pure", "pool-bounds", "layer-hp", "death-consistency", "dead-dont-act",
  "positions", "seats", "contrib-valid", "effects-valid", "cooldowns", "events", "termination", "replay-hash",
  "ai-determinism", "save-roundtrip", "ai-legal", "legal-enum"] as const;
export const firstLine = (s: string): string => s.split("\n")[0]!;
export const groupKey = (name: string, message: string): string => `${name}:${firstLine(message).replace(/\d+/g, "#")}`;
export function errorText(error: unknown): string {
  return error instanceof Error ? (error.stack ?? error.message).split("\n").slice(0, 5).join("\n") : String(error);
}
/** canonicalJson 拒 Infinity；保留型別標記再 canonicalize，不能把無上限池誤判成規則例外。 */
export function stateJson(s: BattleState): string {
  const encode = (v: unknown): unknown => {
    if (typeof v === "number" && !Number.isFinite(v)) return ["fuzz-number", String(v)];
    if (Array.isArray(v)) return v.map(encode);
    if (v !== null && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, encode(x)]));
    return v;
  };
  return canonicalJson(encode(s));
}
export function noThrow<T>(add: Add, phase: string, fn: () => T): { value: T } | undefined {
  try { return { value: fn() }; }
  catch (error) { add("no-throw", `${phase}: ${errorText(error)}`); return undefined; }
}
export function previewPure(ctx: Ctx, cmd: Command, execute: () => { ok: boolean }, add: Add): { ok: boolean } {
  const before = stateJson(ctx.s), preview = previewCommand(ctx, cmd);
  if (stateJson(ctx.s) !== before) add("preview-pure", `preview mutated state: ${cmd.kind}`);
  const result = execute();
  if (result.ok !== preview.result.ok) add("preview-pure", `preview/execute disagree: ${cmd.kind}`);
  return result;
}
export function poolBounds(ctx: Ctx, add: Add): void {
  const owners = [...Object.keys(ctx.s.units).map(unit => ({ unit })), ...Object.keys(ctx.s.persons).map(person => ({ person }))];
  for (const owner of owners) {
    const container = "unit" in owner ? ctx.s.units[owner.unit]! : ctx.s.persons[owner.person]!;
    const fallback = "unit" in owner ? Object.values(ctx.s.units[owner.unit]!.parts).flatMap(p =>
      Object.values(p.components).flatMap(id => id ? ctx.db.require("component", id).pools : [])) : [];
    const declarations = poolDecls(ctx, owner);
    for (const [id, pool] of Object.entries(container.pools)) {
      const decl = declarations.find(d => d.id === id) ?? fallback.find(d => d.id === id);
      if (!decl) { add("pool-bounds", `missing pool declaration ${container.id}.${id}`); continue; }
      for (const key of ["cur", "max", "regen"] as const) {
        if (typeof pool[key] !== "number" || Number.isNaN(pool[key]) || (key !== "max" && !Number.isFinite(pool[key])))
          add("pool-bounds", `invalid pool number ${container.id}.${id}.${key}=${pool[key]}`);
      }
      if (pool.cur < decl.min || (decl.capKind === "hard" && pool.cur > pool.max))
        add("pool-bounds", `pool outside bounds ${container.id}.${id}: ${pool.cur} [${decl.min},${pool.max}] ${decl.capKind}`);
    }
  }
}
export function layerHp(ctx: Ctx, add: Add): void {
  for (const u of Object.values(ctx.s.units)) for (const [id, part] of Object.entries(u.parts)) {
    // 捕捉會更換 frame，保留舊身體：此時不存在可對照的原始 layerDefs。
    const captured = rt(ctx.s).unitStatus[u.id] === "captured";
    const defs = captured ? undefined : layerDefs(ctx, u.id, id);
    for (const [i, layer] of part.layers.entries()) {
      if (!Number.isFinite(layer.hp) || layer.hp < 0 || (defs && (!defs[i] || layer.hp > defs[i]!.hp)))
        add("layer-hp", `layer hp outside definition ${u.id}.${id}[${i}]=${layer.hp}, max=${defs?.[i]?.hp}`);
      if (layer.broken && layer.hp !== 0) add("layer-hp", `broken layer has hp ${u.id}.${id}[${i}]=${layer.hp}`);
    }
    const structural = defs?.flatMap((d, i) => d.structural ? [i] : []) ?? [];
    if (!captured && rt(ctx.s).unitStatus[u.id] !== "derelict" && structural.length
      && part.broken !== structural.every(i => part.layers[i]?.broken)) add("layer-hp", `structural/part mismatch ${u.id}.${id}`);
  }
}
export function deathConsistency(ctx: Ctx, add: Add): void {
  for (const id of Object.keys(ctx.s.units)) if (rt(ctx.s).unitStatus[id] === "active" && isDead(ctx, id))
    add("death-consistency", `active unit has destroyed cores ${id}`);
  // order 是整輪歷史，規則會跳過其中的死者；真正後續行動由 deadDontAct 追蹤。
  const actor = currentActor(ctx.s);
  if (actor && ["dead", "retreated", "captured"].includes(rt(ctx.s).unitStatus[actor]!))
    add("death-consistency", `inactive unit selected from order ${actor}`);
}
export type Memory = { eventIndex: number; lastRound: number; ended: boolean; inactive: Set<string> };
export const newMemory = (): Memory => ({ eventIndex: 0, lastRound: 0, ended: false, inactive: new Set() });
export function deadDontAct(ctx: Ctx, add: Add, memory: Memory): void {
  for (const e of ctx.s.log.events.slice(memory.eventIndex)) {
    if (e.turn && memory.inactive.has(e.turn) && ["TurnStart", "AbilityUsed", "Moved"].includes(e.type))
      add("dead-dont-act", `inactive unit acts ${e.turn} ${e.type} seq=${e.seq}`);
    if (["UnitDied", "Retreated", "Captured", "Ejected"].includes(e.type) && typeof e.payload.unit === "string")
      memory.inactive.add(e.payload.unit);
  }
  for (const [id, status] of Object.entries(rt(ctx.s).unitStatus)) {
    if (status !== "active") memory.inactive.add(id);
    // occupy 可能讓棄機恢復 active；復活後重新允許行動。
    else memory.inactive.delete(id);
  }
  const actor = currentActor(ctx.s);
  if (actor && memory.inactive.has(actor)) add("dead-dont-act", `currentActor is inactive ${actor}`);
}
export function positions(ctx: Ctx, add: Add): void {
  const occupied = new Set<string>();
  for (const u of Object.values(ctx.s.units)) if (rt(ctx.s).unitStatus[u.id] === "active") {
    const { x, y } = u.pos, key = `${x},${y}`;
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= ctx.s.map.width || y >= ctx.s.map.height)
      add("positions", `out of bounds ${u.id} ${key}`);
    if (occupied.has(key)) add("positions", `overlap ${u.id} ${key}`);
    occupied.add(key);
  }
}
export function seats(ctx: Ctx, add: Add): void {
  const seen = new Set<string>();
  for (const u of Object.values(ctx.s.units)) for (const [seat, id] of Object.entries(u.seats)) if (id !== null) {
    if (seen.has(id) || ctx.s.persons[id]?.seat?.mech !== u.id) add("seats", `seat link mismatch ${u.id}.${seat} ${id}`);
    seen.add(id);
  }
  for (const p of Object.values(ctx.s.persons)) if (p.seat && !Object.values(ctx.s.units[p.seat.mech]?.seats ?? {}).includes(p.id))
    add("seats", `person seat missing reverse link ${p.id}`);
}
const effectsOf = (s: BattleState): EffectInstance[] => [...Object.values(s.units).flatMap(u => u.effects),
  ...Object.values(s.persons).flatMap(p => p.effects), ...s.pending, ...rt(s).fieldEffects];
const definitionCache = new WeakMap<ContentDB, Set<string>>();
export function contribValid(ctx: Ctx, add: Add): void {
  let definitions = definitionCache.get(ctx.db);
  if (!definitions) { definitions = new Set(CONTENT_KINDS.flatMap(k => ctx.db.ids(k))); definitionCache.set(ctx.db, definitions); }
  const sources = new Set([...Object.keys(ctx.s.units), ...Object.keys(ctx.s.persons), ...effectsOf(ctx.s).map(e => `fx:${e.uid}`),
    ...Object.values(ctx.s.units).flatMap(u => u.sustained.map(a => `sustain:${u.id}:${a}`))]);
  for (const owner of [...Object.values(ctx.s.units), ...Object.values(ctx.s.persons)]) for (const c of owner.contribs) {
    if (!Number.isFinite(c.value)) add("contrib-valid", `nonfinite contribution ${owner.id} ${c.id}`);
    if (!definitions.has(c.source) && !sources.has(c.source)) add("contrib-valid", `missing source ${c.source} on ${owner.id}`);
  }
}
export function effectsValid(ctx: Ctx, add: Add): void {
  for (const e of effectsOf(ctx.s)) {
    const def = ctx.db.get("effect", e.effect), o = e.owner;
    if (!def || (e.remaining !== null && (!Number.isFinite(e.remaining) || e.remaining < 0))
      || !Number.isFinite(e.stacks) || e.stacks < 1 || (def?.stack.max !== undefined && e.stacks > def.stack.max))
      add("effects-valid", `invalid effect ${e.effect} remaining=${e.remaining} stacks=${e.stacks}`);
    if ((o.unit !== undefined && !ctx.s.units[o.unit]) || (o.person !== undefined && !ctx.s.persons[o.person])
      || (o.faction !== undefined && !ctx.s.factions[o.faction])
      || (o.part !== undefined && (!o.unit || !ctx.s.units[o.unit]?.parts[o.part]))
      || (o.layer !== undefined && (!o.unit || !o.part || !ctx.s.units[o.unit]?.parts[o.part]?.layers[o.layer]))
      || (o.cell && (o.cell.x < 0 || o.cell.y < 0 || o.cell.x >= ctx.s.map.width || o.cell.y >= ctx.s.map.height))
      || (e.scope !== "battle" && Object.keys(o).length === 0)) add("effects-valid", `missing effect owner ${e.effect} uid=${e.uid}`);
  }
}
export function cooldowns(ctx: Ctx, add: Add): void {
  for (const u of Object.values(ctx.s.units)) for (const [id, n] of Object.entries(u.cooldowns))
    if (!Number.isFinite(n) || n < 0) add("cooldowns", `invalid cooldown ${u.id} ${id}=${n}`);
}
export function events(ctx: Ctx, add: Add, memory: Memory): void {
  const numbers = (v: unknown, path: string): void => {
    if (typeof v === "number" && !Number.isFinite(v)) add("events", `nonfinite event payload ${path}=${v}`);
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) numbers(x, `${path}.${k}`);
  };
  for (let i = memory.eventIndex; i < ctx.s.log.events.length; i++) {
    const e = ctx.s.log.events[i]!;
    if (e.seq !== i) add("events", `event sequence gap index=${i} seq=${e.seq}`);
    if (!Number.isFinite(e.round) || e.round < memory.lastRound) add("events", `event round went backwards seq=${e.seq}`);
    if (memory.ended) add("events", `event after BattleEnd ${e.type} seq=${e.seq}`);
    if (e.type === "BattleEnd") memory.ended = true;
    memory.lastRound = e.round;
    numbers(e.payload, e.type);
  }
  memory.eventIndex = ctx.s.log.events.length;
}
export function termination(ctx: Ctx, add: Add): void {
  const runtime = rt(ctx.s), result = battleResult(ctx);
  if (!runtime.outcome) return;
  if (runtime.maxRounds !== null && ctx.s.round > runtime.maxRounds) add("termination", `round ${ctx.s.round} > maxRounds ${runtime.maxRounds}`);
  if (runtime.outcome.winner !== null && !ctx.s.factions[runtime.outcome.winner]) add("termination", `unknown winner ${runtime.outcome.winner}`);
  if (!result) { add("termination", "outcome without battleResult"); return; }
  for (const [id, status] of Object.entries(runtime.unitStatus)) {
    const actual = result.units.find(u => u.id === id)?.status;
    const valid = status === "active" ? actual === "alive" : status === "derelict"
      ? actual === "derelict-recovered" || actual === "derelict-lost" : actual === status;
    if (!valid) add("termination", `result status mismatch ${id} ${status}/${actual}`);
  }
}
export function replayHash(db: ContentDB, setup: BattleSetup, seed: number, commands: Command[], s: BattleState, add: Add): void {
  const actual = replay(db, setup, seed, commands);
  if (hashLog(actual.log) !== hashLog(s.log)) add("replay-hash", "replay log hash mismatch");
  if (stateJson(actual) !== stateJson(s)) add("replay-hash", "replay whole state mismatch");
}
export function aiDeterminism(db: ContentDB, sim: SimSetup, seed: number, hash: string, maxSteps: number, add: Add): void {
  if (runBattle({ db, sim, seed, maxSteps }).hash !== hash) add("ai-determinism", "AI rerun hash mismatch");
}
export function saveRoundtrip(db: ContentDB, setup: BattleSetup, seed: number, commands: Command[], s: BattleState, add: Add): void {
  const save = createSave(db, { scenario: null, seed, commands, setup, snapshot: s });
  const loaded = loadSave(db, parseSave(serializeSave(save)), { verifySnapshot: true });
  if (loaded.warnings.length || stateJson(loaded.state) !== stateJson(s)) add("save-roundtrip", "saved state mismatch or verification skipped");
}
export function aiLegal(rejected: number, add: Add): void {
  if (rejected > 0) add("ai-rejected", `AI rejected ${rejected} commands`, true);
}
export function legalEnum(bounded: LegalActions, full: LegalActions, add: Add): void {
  if (bounded.actor !== full.actor) add("legal-enum", "actor differs from session enumeration");
  for (const [cell, cost] of Object.entries(bounded.reachable))
    if (full.reachable[cell] !== cost) add("legal-enum", `reachable differs from session enumeration ${cell}`);
  for (const kind of ["wait", "retreat", "eject", "end"] as const)
    if (bounded[kind] && !full[kind]) add("legal-enum", `action absent from session enumeration ${kind}`);
  for (const a of bounded.abilities) {
    const targets = new Set(full.abilities.find(b => b.ability === a.ability)?.targets.map(t => canonicalJson(t)));
    for (const target of a.targets) if (!targets.has(canonicalJson(target)))
      add("legal-enum", `target absent from session enumeration ${a.ability} ${canonicalJson(target)}`);
  }
}
export function checkState(ctx: Ctx, add: Add, memory: Memory): void {
  for (const check of [poolBounds, layerHp, deathConsistency, positions, seats, contribValid, effectsValid, cooldowns])
    noThrow(add, `invariant ${check.name}`, () => check(ctx, add));
  noThrow(add, "invariant deadDontAct", () => deadDontAct(ctx, add, memory));
  noThrow(add, "invariant events", () => events(ctx, add, memory));
}
