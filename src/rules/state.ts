import type { ContentDB } from "../content/contentdb.ts";
import type { Id } from "../core/ids.ts";
import { GRADES } from "../core/types-def.ts";
import type { Cell, Dir, FactionSlot, FrameDef, Grade, LayerDef, PartDef, PartId, PoolDecl, PoolId, SeatId, SeatRole, SlotId, TerrainDef } from "../core/types-def.ts";
import type { BattleState, MechState, PersonState, RulesRuntime } from "../core/types-state.ts";
import type { EventPayload, EventType, GameEvent } from "../core/events.ts";
import { appendEvent } from "../core/eventlog.ts";
import { evalNum, NumExprError } from "../core/numexpr.ts";
import type { EvalCtx } from "../core/numexpr.ts";
import { personAttr, unitAttr } from "./contribs.ts";

export type Ctx = { db: ContentDB; s: BattleState };
export type RejectCode = "battle-over" | "not-active" | "bad-actor" | "no-commander" | "unknown-ability" | "require-failed"
  | "out-of-range" | "no-los" | "bad-target" | "bad-part" | "cannot-pay" | "cooldown" | "uses-exhausted" | "bad-path"
  | "no-locomotion" | "wait-used" | "not-at-exit" | "no-retreat" | "no-space" | "unsupported";
export type Rejection = { code: RejectCode; detail?: string };
export type Result = { ok: true; events: GameEvent[] } | { ok: false; rejection: Rejection };
export type Subject = { unit?: Id; person?: Id };
export type UnitInit = { id: Id; owner: FactionSlot; pos: Cell; facing?: Dir;
  frame?: Id; monster?: { species: Id; grade: Grade };
  components?: Record<SlotId, Id>; persons?: { id: Id; def: Id; seat: SeatId;
    state?: Partial<Pick<PersonState, "pools" | "effects" | "contribs" | "morale" | "will" | "attrsBase" | "xp" | "level">> }[];
  parts?: Record<PartId, Pick<MechState["parts"][string], "layers" | "broken">>;
  controlMode?: MechState["controlMode"]; effects?: MechState["effects"];
  pools?: Record<PoolId, number> };

export function newRuntime(): RulesRuntime {
  return { allies: {}, globals: {}, nextUid: 0, nextContrib: 0, actionSeq: 0, active: null,
    acted: [], waited: [], waitUsed: [], reactUsed: {}, commander: {}, unitStatus: {}, monsters: {},
    moraleStreak: {}, berserkFrom: {}, xpGained: {}, fieldEffects: [], objectives: [], maxRounds: null,
    exits: [], noRetreat: false, outcome: null };
}
export function rt(s: BattleState): RulesRuntime {
  if (!s.rt) throw new Error("缺少 rules runtime");
  return s.rt;
}
export function emit(ctx: Ctx, type: EventType, payload?: EventPayload): GameEvent {
  const active = rt(ctx.s).active;
  return appendEvent(ctx.s.log, { round: ctx.s.round, type, payload, ...(active === null ? {} : { turn: active }) });
}
export function constant(ctx: Ctx, key: string): number {
  const value = ctx.db.rules.constants[key];
  if (value === undefined) throw new Error(`缺少常數：${key}`);
  return value;
}
export function unit(ctx: Ctx, id: Id): MechState {
  const value = Object.hasOwn(ctx.s.units, id) ? ctx.s.units[id] : undefined;
  if (!value) throw new Error(`缺少單位：${id}`);
  return value;
}
export function person(ctx: Ctx, id: Id): PersonState {
  const value = Object.hasOwn(ctx.s.persons, id) ? ctx.s.persons[id] : undefined;
  if (!value) throw new Error(`缺少人物：${id}`);
  return value;
}
export function unitTags(ctx: Ctx, unitId: Id): string[] {
  return [...new Set([...frameView(ctx, unitId).tags,
    ...unit(ctx, unitId).effects.flatMap(e => ctx.db.require("effect", e.effect).tags)])].sort();
}
export function personTags(ctx: Ctx, personId: Id): string[] {
  const p = person(ctx, personId);
  return [...new Set([...ctx.db.require("person", p.def).tags,
    ...p.effects.flatMap(e => ctx.db.require("effect", e.effect).tags)])].sort();
}
export function frameView(ctx: Ctx, unitId: Id): FrameDef {
  const u = unit(ctx, unitId), monster = rt(ctx.s).monsters[unitId];
  if (!monster) return ctx.db.require("frame", u.frame);
  const species = ctx.db.require("species", monster.species);
  // SPEC-GAP：怪獸沒有修復政策，採生物機體的 repair-or-replace。
  return { id: species.id, name: species.name, cls: "bio", grade: monster.grade,
    bodyPlan: species.bodyPlan, baseAttrs: species.baseAttrsByGrade[monster.grade] ?? {},
    pools: species.pools, innateAbilities: species.abilities, repairPolicy: "repair-or-replace", tags: species.tags };
}
export function partDefs(ctx: Ctx, unitId: Id): PartDef[] {
  return ctx.db.require("bodyplan", frameView(ctx, unitId).bodyPlan).parts;
}
export function layerDefs(ctx: Ctx, unitId: Id, partId: PartId): LayerDef[] {
  const part = partDefs(ctx, unitId).find(p => p.id === partId);
  if (!part) throw new Error(`缺少部位：${partId}`);
  const u = unit(ctx, unitId), layers = [...part.layers];
  const installed = Object.keys(u.parts).sort().flatMap(id => Object.keys(u.parts[id]!.components).sort()
    .flatMap(slot => { const c = u.parts[id]!.components[slot]; return c ? [{ slot, part: id, def: ctx.db.require("component", c) }] : []; }))
    .sort((a, b) => a.slot < b.slot ? -1 : a.slot > b.slot ? 1 : 0);
  for (const c of installed) for (const add of c.def.layersAdd ?? []) {
    if (add.part === partId) layers.splice(add.insertAt, 0, add.layer);
  }
  // SPEC-GAP（契約）：部件層附加於最內側，且非結構層。
  for (const c of installed) if (c.part === partId && c.def.hp !== undefined) {
    layers.push({ type: "component", hp: c.def.hp, ablative: true, resist: {}, passThrough: {}, structural: false });
  }
  return layers;
}
export function seatsOf(ctx: Ctx, unitId: Id): { seat: SeatId; role: SeatRole; person: Id }[] {
  const u = unit(ctx, unitId), declarations = partDefs(ctx, unitId).flatMap(p => p.seats ?? []);
  return Object.keys(u.seats).sort().flatMap(seat => {
    const occupant = u.seats[seat], role = declarations.find(d => d.id === seat)?.accepts[0];
    return occupant && role ? [{ seat, role, person: occupant }] : [];
  });
}
export function isActive(ctx: Ctx, unitId: Id): boolean { return rt(ctx.s).unitStatus[unitId] === "active"; }
export function unitAt(ctx: Ctx, cell: Cell): Id | null {
  return Object.keys(ctx.s.units).sort().find(id => {
    const status = rt(ctx.s).unitStatus[id], pos = unit(ctx, id).pos;
    return (status === "active" || status === "derelict") && pos.x === cell.x && pos.y === cell.y;
  }) ?? null;
}
export function terrainAt(ctx: Ctx, cell: Cell): TerrainDef {
  if (!inBounds(ctx.s, cell)) throw new Error("座標超出地圖");
  return ctx.db.require("terrain", ctx.s.map.terrain[cell.y * ctx.s.map.width + cell.x]!);
}
export function inBounds(s: BattleState, cell: Cell): boolean {
  return Number.isInteger(cell.x) && Number.isInteger(cell.y) && cell.x >= 0 && cell.y >= 0 && cell.x < s.map.width && cell.y < s.map.height;
}
export function distance(a: Cell, b: Cell): number { return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)); }
export function hostile(ctx: Ctx, a: Id, b: Id): boolean {
  return hostileSlots(ctx, unit(ctx, a).owner, unit(ctx, b).owner);
}
export function hostileSlots(ctx: Ctx, a: FactionSlot, b: FactionSlot): boolean {
  if (a === "berserk" || b === "berserk") return true;
  if (a === b || rt(ctx.s).allies?.[a]?.includes(b)) return false;
  // SPEC-GAP：世界 neutral 在戰場仍敵對；舊存檔沒有 allies 時視為空。
  return true;
}
export function commanderOf(ctx: Ctx, unitId: Id): Id | null {
  const commanders = rt(ctx.s).commander;
  if (Object.hasOwn(commanders, unitId)) return commanders[unitId]!;
  const seats = seatsOf(ctx, unitId);
  return seats.find(s => s.role === "pilot")?.person ?? seats.find(s => s.role === "soul")?.person ?? null;
}
export function evalCtxFor(ctx: Ctx, self: Subject, target?: Subject): EvalCtx {
  return {
    ref(path) {
      if (path === "battle.round") return ctx.s.round;
      // SPEC-GAP：未宣告的地圖全局值（含舊存檔）以 0 求值。
      if (path === "battle.light") return rt(ctx.s).globals?.light ?? 0;
      if (path === "battle.tide") return evalNum(rt(ctx.s).globals?.tide ?? 0, {
        ref(globalPath) {
          if (globalPath === "battle.round") return ctx.s.round;
          throw new NumExprError(`不支援路徑：${globalPath}`);
        },
      });
      const [root, kind, key, field, ...rest] = path.split(".");
      const subject = root === "self" ? self : root === "target" ? target : undefined;
      if (!subject || rest.length) throw new NumExprError(`不支援路徑：${path}`);
      const p = subject.person ? person(ctx, subject.person) : undefined;
      const uid = subject.unit ?? p?.seat?.mech;
      if (kind === "attrs" && key && field === undefined) {
        return p ? personAttr(ctx, p.id, key) : uid ? unitAttr(ctx, uid, key) : 0;
      }
      if (kind === "pools" && key && (field === "cur" || field === "max" || field === "regen")) {
        const pool = p?.pools[key] ?? (uid ? unit(ctx, uid).pools[key] : undefined);
        if (pool) return pool[field];
      }
      if (kind === "grade" && key === undefined && uid) return GRADES.indexOf(frameView(ctx, uid).grade);
      if (kind === "resonance" && key === undefined && uid) {
        const commander = commanderOf(ctx, uid);
        return commander ? person(ctx, commander).will.resonance[unit(ctx, uid).frame] ?? 0 : 0;
      }
      throw new NumExprError(`不支援路徑：${path}`);
    },
    hasTag: tag => (self.person ? personTags(ctx, self.person) : self.unit ? unitTags(ctx, self.unit) : []).includes(tag),
  };
}

function initializePools(ctx: Ctx, self: Subject, declarations: PoolDecl[]): void {
  const state = self.person ? person(ctx, self.person) : unit(ctx, self.unit!);
  const grouped = new Map<string, PoolDecl[]>();
  for (const d of declarations) grouped.set(d.id, [...(grouped.get(d.id) ?? []), d]);
  const ev = evalCtxFor(ctx, self);
  for (const id of [...grouped.keys()].sort()) state.pools[id] = { cur: 0, max: 0, regen: 0, band: -1 };
  for (const id of [...grouped.keys()].sort()) {
    const ds = grouped.get(id)!, d = ds[0]!, p = state.pools[id]!;
    p.max = ds.some(v => v.max === null) ? Infinity : ds.reduce((n, v) => n + evalNum(v.max!, ev), 0);
    p.regen = ds.reduce((n, v) => n + evalNum(v.regen, ev), 0);
    // SPEC-GAP：同名池只有 max/regen 指定相加；initial 及其他欄位採第一個宣告。
    p.cur = Math.max(d.min, evalNum(d.initial, ev));
    if (d.capKind === "hard") p.cur = Math.min(p.cur, p.max);
  }
}
export function makePerson(ctx: Ctx, id: Id, def: Id): PersonState {
  const d = ctx.db.require("person", def);
  const p: PersonState = { id, def: d.id, attrsBase: { ...d.attrs }, contribs: [], pools: {}, effects: [],
    morale: "steady", will: { burden: 0, resonance: {}, ...(d.kind === "soul" ? { soulTree: { nodes: [], research: 0, companionship: 0 } } : {}) }, xp: 0, level: 1 };
  ctx.s.persons[id] = p;
  initializePools(ctx, { person: id }, d.pools);
  return p;
}
export function makeUnit(ctx: Ctx, init: UnitInit): MechState {
  if ((!init.frame) === (!init.monster)) throw new Error("frame 與 monster 必須二擇一");
  const frame = init.monster ? ctx.db.require("species", init.monster.species).id : ctx.db.require("frame", init.frame!).id;
  const u: MechState = { id: init.id, frame, owner: init.owner, pos: { ...init.pos },
    ...(init.facing ? { facing: init.facing } : {}), parts: {}, pools: {}, contribs: [], effects: [], seats: {},
    controlMode: "none", cooldowns: {}, sustained: [] };
  ctx.s.units[init.id] = u;
  rt(ctx.s).unitStatus[init.id] = "active";
  if (init.monster) rt(ctx.s).monsters[init.id] = { species: frame, grade: init.monster.grade };
  for (const p of partDefs(ctx, u.id)) {
    u.parts[p.id] = { layers: [], broken: false, components: {} };
    for (const slot of [...p.slots].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) {
      const installed = init.components?.[slot.id];
      u.parts[p.id]!.components[slot.id] = installed ? ctx.db.require("component", installed).id : null;
    }
    for (const seat of p.seats ?? []) u.seats[seat.id] = null;
  }
  for (const p of partDefs(ctx, u.id)) u.parts[p.id]!.layers = layerDefs(ctx, u.id, p.id).map(d => ({ hp: d.hp, broken: false }));
  const declarations = [...frameView(ctx, u.id).pools];
  const components = Object.keys(u.parts).sort().flatMap(p => Object.keys(u.parts[p]!.components).sort()
    .map(slot => ({ slot, id: u.parts[p]!.components[slot] }))).sort((a, b) => a.slot < b.slot ? -1 : a.slot > b.slot ? 1 : 0);
  for (const c of components) if (c.id) declarations.push(...ctx.db.require("component", c.id).pools);
  initializePools(ctx, { unit: u.id }, declarations);
  for (const entry of init.persons ?? []) {
    const seat = partDefs(ctx, u.id).flatMap(p => p.seats ?? []).find(s => s.id === entry.seat);
    if (!seat?.accepts[0]) throw new Error(`缺少座位：${entry.seat}`);
    const p = makePerson(ctx, entry.id, entry.def);
    p.seat = { mech: u.id, role: seat.accepts[0] };
    u.seats[entry.seat] = p.id;
  }
  const seats = seatsOf(ctx, u.id);
  u.controlMode = seats.some(s => s.role === "pilot") ? "pilot" : seats.some(s => s.role === "soul") ? "soul" : init.monster ? "instinct" : "none";
  for (const id of Object.keys(init.pools ?? {}).sort()) {
    if (u.pools[id]) u.pools[id]!.cur = init.pools![id]!;
    for (const seat of seats) if (person(ctx, seat.person).pools[id]) person(ctx, seat.person).pools[id]!.cur = init.pools![id]!;
  }
  // 現況優先於預設值與舊版 pools 捷徑，所有容器皆複製以免回寫呼叫端。
  for (const [id, state] of Object.entries(init.parts ?? {})) {
    if (!u.parts[id]) throw new Error(`缺少部位：${id}`);
    Object.assign(u.parts[id]!, structuredClone(state));
  }
  if (init.controlMode !== undefined) u.controlMode = init.controlMode;
  if (init.effects) u.effects = structuredClone(init.effects);
  for (const entry of init.persons ?? []) {
    if (entry.state) Object.assign(person(ctx, entry.id), structuredClone(entry.state));
  }
  // 匯入的 contrib 值型別是 NumExpr（營運層可能尚未求值）；貢獻在掛上時求值（rules-resources-effects），
  // 匯入即掛上，故此處以人物自身為 self 一次求值。先求全部再寫回，避免同批貢獻互相引用時讀到物件值。
  for (const entry of init.persons ?? []) {
    const p = person(ctx, entry.id), pending = p.contribs.filter(c => typeof c.value !== "number");
    if (!pending.length) continue;
    const kept = p.contribs.filter(c => typeof c.value === "number"), all = p.contribs;
    p.contribs = kept;
    const values = pending.map(c => evalNum(c.value, evalCtxFor(ctx, { person: p.id })));
    p.contribs = all;
    pending.forEach((c, i) => { c.value = values[i]!; });
  }
  // 匯入效果的流水號不能與戰鬥內新產生的效果／貢獻撞號。
  for (const state of [u, ...(init.persons ?? []).map(p => person(ctx, p.id))]) {
    for (const effect of state.effects) rt(ctx.s).nextUid = Math.max(rt(ctx.s).nextUid, effect.uid + 1);
    for (const c of state.contribs) if (/^c\d+$/.test(c.id)) rt(ctx.s).nextContrib = Math.max(rt(ctx.s).nextContrib, Number(c.id.slice(1)) + 1);
  }
  return u;
}
