import { readFileSync } from "node:fs";
import { cellKey } from "../../src/core/ids.ts";
import type { Id, CellKey } from "../../src/core/ids.ts";
import type { AbilityDef, Cell, ControlMode, FactionSlot, Grade, MoraleStage, PartDef, PartId } from "../../src/core/types-def.ts";
import type { BattleState } from "../../src/core/types-state.ts";
import type { EventPayload } from "../../src/core/events.ts";
import { createLog, appendEvent } from "../../src/core/eventlog.ts";
import { createRng, d100 } from "../../src/core/rng.ts";
import { evalNum } from "../../src/core/numexpr.ts";
import type { RulesQuery, ExecCommand, QueryResult } from "../../src/ai/rules-query.ts";

export type StubPart = { id: PartId; functions: string[]; layers: { type: string; hp: number }[] };
export type StubUnit = { id: Id; owner: FactionSlot; pos: Cell; abilities: Id[]; ap?: number; perception?: number;
  grade?: Grade; parts?: StubPart[]; tags?: string[]; controlMode?: ControlMode; commander?: { id: Id; morale?: MoraleStage } };
export type StubBattle = { width: number; height: number; walls?: Cell[]; exits?: Cell[]; units: StubUnit[] };

const DEFAULT_PARTS: StubPart[] = [
  { id: "torso", functions: ["core"], layers: [{ type: "armor", hp: 40 }, { type: "structure", hp: 30 }] },
  { id: "legs", functions: ["locomotion"], layers: [{ type: "armor", hp: 20 }, { type: "structure", hp: 20 }] },
];
// SPEC-GAP：替身公開定義沒有 ContentDB，純資料隨 state 保存以支援 structuredClone 預覽。
type StubState = BattleState & { stub: { units: Record<Id, StubUnit>; walls: Cell[] } };
function metadata(s: BattleState): StubState["stub"] { return (s as StubState).stub; }

export function loadStubAbilities(): Record<Id, AbilityDef> {
  return JSON.parse(readFileSync("test/ai/fixtures/abilities.json", "utf8")) as Record<Id, AbilityDef>;
}

export function makeStubBattle(spec: StubBattle, seed: number): BattleState {
  const s: StubState = {
    round: 0, order: [], units: {}, persons: {}, factions: {}, knowledge: {}, rng: createRng(seed), pending: [], log: createLog(),
    map: { def: "stub:map/test", width: spec.width, height: spec.height,
      terrain: Array<string>(spec.width * spec.height).fill("stub:plain"), featureHp: {} },
    rt: { nextUid: 1, nextContrib: 1, actionSeq: 0, active: null, acted: [], waited: [], waitUsed: [], reactUsed: {},
      commander: {}, unitStatus: {}, monsters: {}, moraleStreak: {}, berserkFrom: {}, xpGained: {}, fieldEffects: [],
      objectives: [], maxRounds: null, exits: structuredClone(spec.exits ?? []), noRetreat: false, outcome: null,
      allies: {}, globals: {} },
    stub: { units: {}, walls: structuredClone(spec.walls ?? []) },
  };
  for (const u of [...spec.units].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)) {
    s.stub.units[u.id] = structuredClone(u);
    s.units[u.id] = {
      id: u.id, core: true, frame: `stub:frame/${u.id}`, owner: u.owner, pos: { ...u.pos },
      parts: Object.fromEntries((u.parts ?? DEFAULT_PARTS).map(p => [p.id, {
        layers: p.layers.map(l => ({ hp: l.hp, broken: l.hp <= 0 })), broken: p.layers.every(l => l.hp <= 0), components: {},
      }])),
      pools: { ap: { cur: u.ap ?? 4, max: u.ap ?? 4, regen: 0, band: 0 } }, contribs: [], effects: [], seats: {},
      controlMode: u.controlMode ?? "pilot", cooldowns: {}, sustained: [],
    };
    s.order.push(u.id);
    s.rt!.unitStatus[u.id] = "active";
    s.rt!.commander[u.id] = u.commander?.id ?? null;
    s.factions[u.owner] ??= { faction: u.owner, retreated: [], lost: [], captured: [] };
    s.knowledge[u.owner] ??= { visible: [], lastSeen: {}, revealed: {} };
    if (u.commander) {
      const id = u.commander.id;
      s.units[u.id]!.seats.pilot = id;
      s.persons[id] = { id, def: `stub:person/${id}`, attrsBase: { perception: u.perception ?? 5 }, contribs: [], pools: {},
        effects: [], morale: u.commander.morale ?? "steady", will: { burden: 0, resonance: {} }, xp: 0, level: 1,
        seat: { mech: u.id, role: "pilot" } };
    }
  }
  return s;
}

export function createStubRules(abilities: Record<Id, AbilityDef> = loadStubAbilities()): { q: RulesQuery; exec: ExecCommand; startRound(s: BattleState): void } {
  const blocked = (s: BattleState, c: Cell): boolean => metadata(s).walls.some(w => q.distance(w, c) === 0);
  function paths(s: BattleState, id: Id): Record<CellKey, Cell[]> {
    const u = s.units[id];
    if (!u || !q.isActive(s, id)) return {};
    const found: Record<CellKey, Cell[]> = { [cellKey(u.pos.x, u.pos.y)]: [] };
    const queue = [u.pos];
    for (let i = 0; i < queue.length; i++) {
      const from = queue[i]!;
      const path = found[cellKey(from.x, from.y)]!;
      if (path.length >= (u.pools.ap?.cur ?? 0)) continue;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const c = { x: from.x + dx, y: from.y + dy }, key = cellKey(c.x, c.y);
        if (found[key] || !q.inBounds(s, c) || blocked(s, c) || q.unitAt(s, c) !== null) continue;
        found[key] = [...path, c];
        queue.push(c);
      }
    }
    return found;
  }
  const q: RulesQuery = {
    inBounds: (s, c) => c.x >= 0 && c.y >= 0 && c.x < s.map.width && c.y < s.map.height,
    distance: (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)),
    unitAt: (s, c) => Object.keys(s.units).sort().find(id =>
      !["dead", "retreated", "captured"].includes(s.rt?.unitStatus[id] ?? "active") && q.distance(s.units[id]!.pos, c) === 0) ?? null,
    isActive: (s, id) => !!s.units[id] && (s.rt?.unitStatus[id] ?? "active") === "active",
    hostile: (s, a, b) => !!s.units[a] && !!s.units[b] &&
      (s.units[a]!.owner !== s.units[b]!.owner || s.units[a]!.owner === "berserk"),
    commanderOf: (s, id) => s.rt?.commander[id] ?? null,
    los(s, from, to) {
      let x = from.x, y = from.y;
      const dx = Math.abs(to.x - x), dy = -Math.abs(to.y - y), sx = x < to.x ? 1 : -1, sy = y < to.y ? 1 : -1;
      let err = dx + dy;
      while (x !== to.x || y !== to.y) {
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x += sx; }
        if (e2 <= dx) { err += dx; y += sy; }
        if (x === to.x && y === to.y) break;
        if (blocked(s, { x, y })) return false;
      }
      return true;
    },
    perception: (s, id) => metadata(s).units[id]?.perception ?? 5,
    unitGrade: (s, id) => metadata(s).units[id]?.grade ?? "C",
    unitTags: (s, id) => [...(metadata(s).units[id]?.tags ?? [])],
    partDefs: (s, id): PartDef[] => (metadata(s).units[id]?.parts ?? DEFAULT_PARTS).map(p => ({
      id: p.id, name: p.id, exposure: 1, slots: [], functions: [...p.functions], onLayerBroken: {}, onBroken: [], conduct: [],
      layers: p.layers.map(l => ({ ...l, ablative: true, resist: {}, passThrough: {}, structural: l.type === "structure" })),
    })),
    layerDefs: (s, id, part) => q.partDefs(s, id).find(p => p.id === part)?.layers ?? [],
    reachable(s, id) {
      return Object.fromEntries(Object.entries(paths(s, id)).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
        .filter(([, path]) => path.length > 0).map(([key, path]) => [key, path.length]));
    },
    pathTo: (s, id, to) => paths(s, id)[cellKey(to.x, to.y)] ?? null,
    abilitiesOf: (s, id) => [...new Set(metadata(s).units[id]?.abilities ?? [])].sort(),
    abilityDef(id) { const def = abilities[id]; if (!def) throw new Error(`未知替身能力：${id}`); return def; },
    abilityRange(s, id, ability) {
      const r = q.abilityDef(ability).target.range;
      return { min: q.evalNum(s, r.min, id), max: q.evalNum(s, r.max, id) };
    },
    checkAbility(s, id, ability, target) {
      if (!q.isActive(s, id)) return { code: "bad-actor" };
      if (!q.abilitiesOf(s, id).includes(ability) || !abilities[ability]) return { code: "unknown-ability" };
      const def = q.abilityDef(ability), actor = s.units[id]!;
      const cost = def.costs.reduce((sum, c) => sum + (c.pool === "ap" && typeof c.amount === "number" ? c.amount : 0), 0);
      if ((actor.pools.ap?.cur ?? 0) < cost) return { code: "cannot-pay" };
      const targetId = def.target.kind === "self" ? id : target?.unit;
      const pos = targetId ? s.units[targetId]?.pos : target?.cell;
      if (!pos || !q.inBounds(s, pos)) return { code: "bad-target" };
      const r = q.abilityRange(s, id, ability), dist = q.distance(actor.pos, pos);
      if (dist < r.min || dist > r.max) return { code: "out-of-range" };
      if (def.target.los && !q.los(s, actor.pos, pos)) return { code: "no-los" };
      if (["unit", "part", "self"].includes(def.target.kind) && (!targetId || !q.isActive(s, targetId))) return { code: "bad-target" };
      if (["ball", "cell"].includes(def.target.kind) && !target?.cell) return { code: "bad-target" };
      if (targetId && ((def.target.friendly === "no" && !q.hostile(s, id, targetId)) ||
        (def.target.friendly === "only" && q.hostile(s, id, targetId)))) return { code: "bad-target" };
      if (target?.part && (!targetId || !s.units[targetId]?.parts[target.part] || !def.partAim?.allowed)) return { code: "bad-part" };
      return null;
    },
    hitChance(s, actor, ability, target) {
      const accuracy = q.abilityDef(ability).accuracy;
      return Math.max(5, Math.min(95, 75 - 5 * (q.distance(s.units[actor]!.pos, s.units[target]!.pos) - 1) +
        (typeof accuracy === "number" ? accuracy : 0)));
    },
    evalNum: (_s, expr, _self, _target) => evalNum(expr, { ref: () => 0 }),
    previewCommand(s, cmd) { const state = structuredClone(s); return { result: exec(state, cmd), state }; },
  };
  const exec: ExecCommand = (s, cmd): QueryResult => {
    const reject = (code: string): QueryResult => ({ ok: false, rejection: { code } });
    if (!q.isActive(s, cmd.actor)) return reject("bad-actor");
    const actor = s.units[cmd.actor]!, start = s.log.events.length;
    const emit = (type: string, payload: EventPayload): void => { appendEvent(s.log, { round: s.round, turn: cmd.actor, type, payload }); };
    if (cmd.kind === "eject") return reject("unsupported");
    if (cmd.kind === "move") {
      if (cmd.path.length > (actor.pools.ap?.cur ?? 0)) return reject("cannot-pay");
      let from = actor.pos;
      for (const c of cmd.path) {
        const at = q.unitAt(s, c);
        if (q.distance(from, c) !== 1 || !q.inBounds(s, c) || blocked(s, c) || (at !== null && at !== cmd.actor)) return reject("bad-path");
        from = c;
      }
      for (const c of cmd.path) {
        const old = actor.pos;
        actor.pos = { ...c }; actor.pools.ap!.cur -= 1;
        emit("Moved", { unit: cmd.actor, from: [old.x, old.y], to: [c.x, c.y], cost: 1 });
      }
    } else if (cmd.kind === "useAbility") {
      const rejection = q.checkAbility(s, cmd.actor, cmd.ability, cmd.target);
      if (rejection) return { ok: false, rejection };
      const def = q.abilityDef(cmd.ability);
      for (const cost of def.costs) if (cost.pool === "ap" && typeof cost.amount === "number") actor.pools.ap!.cur -= cost.amount;
      const targetId = def.target.kind === "self" ? cmd.actor : cmd.target?.unit;
      emit("AbilityUsed", { unit: cmd.actor, ability: cmd.ability, target: targetId ?? null, part: cmd.target?.part ?? null });
      const center = cmd.target?.cell;
      const targets = center ? Object.keys(s.units).sort().filter(id => q.isActive(s, id) &&
        q.distance(s.units[id]!.pos, center) <= (typeof def.target.radius === "number" ? def.target.radius : 0)) : targetId ? [targetId] : [];
      for (const id of targets) {
        const unit = s.units[id]!, defs = q.partDefs(s, id);
        const partId = cmd.target?.part ?? defs.find(p => !unit.parts[p.id]?.broken)?.id;
        const hit = q.hitChance(s, cmd.actor, cmd.ability, id, partId), roll = d100(s.rng);
        emit(roll < hit ? "Hit" : "Miss", { unit: cmd.actor, target: id, ability: cmd.ability, chance: hit, roll, part: roll < hit ? partId ?? null : null });
        if (roll >= hit || !partId) continue;
        const part = unit.parts[partId]!;
        let damage = def.packets.reduce((sum, p) => sum + (typeof p.amount === "number" ? p.amount : 0), 0);
        const layers = q.layerDefs(s, id, partId);
        for (let i = 0; i < part.layers.length && damage > 0; i++) {
          const layer = part.layers[i]!, amount = Math.min(layer.hp, damage);
          if (amount <= 0) continue;
          layer.hp -= amount; damage -= amount;
          emit("LayerDamaged", { unit: id, part: partId, layer: i, layerType: layers[i]!.type,
            damageType: def.packets[0]?.type ?? "physical", amount, hp: layer.hp });
          if (layer.hp === 0) { layer.broken = true; emit("LayerBroken", { unit: id, part: partId, layer: i, layerType: layers[i]!.type }); }
        }
        if (!part.broken && part.layers.every(l => l.broken)) {
          part.broken = true; emit("PartBroken", { unit: id, part: partId });
        }
        const core = defs.filter(p => p.functions.includes("core"));
        if (core.length > 0 && core.every(p => unit.parts[p.id]!.broken)) {
          s.rt!.unitStatus[id] = "dead"; emit("UnitDied", { unit: id, killer: cmd.actor });
        }
      }
    } else if (cmd.kind === "retreat") {
      if (!s.rt!.exits.some(c => q.distance(c, actor.pos) === 0)) return reject("not-at-exit");
      s.rt!.unitStatus[cmd.actor] = "retreated"; emit("Retreated", { unit: cmd.actor });
    } else if (cmd.kind === "end") actor.pools.ap!.cur = 0;
    s.rt!.actionSeq += 1;
    return { ok: true, events: s.log.events.slice(start) };
  };
  return { q, exec, startRound(s) {
    s.round += 1;
    for (const id of Object.keys(s.units).sort()) if (q.isActive(s, id)) s.units[id]!.pools.ap!.cur = s.units[id]!.pools.ap!.max;
  } };
}
