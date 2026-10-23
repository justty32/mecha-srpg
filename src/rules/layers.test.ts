import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createContentDB } from "../content/contentdb.ts";
import { createRng } from "../core/rng.ts";
import { createLog } from "../core/eventlog.ts";
import type { AbilityDef, BodyPlanDef, EffectDef, FrameDef, PersonDef, TerrainDef } from "../core/types-def.ts";
import { newRuntime, makeUnit, rt, unit, person } from "./state.ts";
import type { Ctx } from "./state.ts";
const base = loadContentDirs(["content/base", "test/scenarios/pack"]).db;
function fixture(edit?: (d: { body: BodyPlanDef; frame: FrameDef; ability: AbilityDef; effect: EffectDef; pilot: PersonDef; terrain: TerrainDef }) => void): Ctx {
  const body: BodyPlanDef = { id: "cb:bodyplan/test", parts: [{ id: "core", name: "核心", exposure: 1,
    layers: [{ type: "armor", hp: 10, ablative: true, resist: {}, passThrough: {}, structural: false },
      { type: "cockpit-shell", hp: 20, ablative: true, resist: {}, passThrough: {}, structural: true }],
    slots: [], functions: ["core", "locomotion", "cockpit"], onLayerBroken: {}, onBroken: [], conduct: [],
    seats: [{ id: "pilot", accepts: ["pilot"] }] }] };
  const frame: FrameDef = { id: "cb:frame/test", name: "測試", cls: "mechanical", grade: "D", bodyPlan: body.id,
    baseAttrs: { initiative: 5 }, pools: [], innateAbilities: ["cb:ability/test"], repairPolicy: "repair-or-replace", tags: [] };
  const ability: AbilityDef = { id: "cb:ability/test", name: "測試攻擊", mode: "activated", costs: [{ owner: "person", pool: "ap", amount: 2 }],
    produces: [], require: [], target: { kind: "unit", range: { min: 1, max: 6 }, los: true, friendly: "no" }, accuracy: 0,
    partAim: { allowed: true, penalty: 10 }, packets: [{ type: "kinetic", amount: 12 }], effects: [], tags: [], ai: { tactics: {} } };
  const effect: EffectDef = { id: "cb:effect/test", name: "測試效果", scope: "person", clock: { kind: "ownerTurns", n: 1 },
    stack: { policy: "refresh" }, contribs: [], hooks: {}, tags: [], ui: { badge: "測" } };
  const pilot = structuredClone(base.require("person", "base:person/ren-kasai"));
  pilot.id = "cb:person/test"; pilot.attrs = { initiative: 10, accuracy: 70, evasion: 0 };
  const terrain = structuredClone(base.require("terrain", "terrain/plain")); terrain.id = "cb:terrain/test";
  edit?.({ body, frame, ability, effect, pilot, terrain });
  const db = createContentDB([{ id: "cb", version: "1", depends: [] }], base.registries, { ...base.rules, moraleEvents: [], injuries: [] },
    { bodyplan: { [body.id]: body }, frame: { [frame.id]: frame }, ability: { [ability.id]: ability },
      effect: { [effect.id]: effect }, person: { [pilot.id]: pilot }, terrain: { [terrain.id]: terrain } });
  const ctx: Ctx = { db, s: { round: 1, order: ["a", "b"], units: {}, persons: {},
    map: { def: "test", width: 5, height: 5, terrain: Array(25).fill(terrain.id), featureHp: {} },
    factions: {}, knowledge: {}, rng: createRng(42), pending: [], log: createLog(), rt: newRuntime() } };
  for (const [i, id] of ["a", "b"].entries()) makeUnit(ctx, { id, frame: frame.id, owner: id, pos: { x: i + 1, y: 1 },
    persons: [{ id: `${id}-pilot`, def: pilot.id, seat: "pilot" }] });
  rt(ctx.s).active = "a";
  return ctx;
}

import { runLayers, applyPacket, isDead } from "./layers.ts";
import type { LayerSlot, PacketIn } from "./layers.ts";
function slot(hp = 10, extra: Partial<LayerSlot["def"]> = {}): LayerSlot {
  return { def: { type: "armor", hp, ablative: true, resist: {}, passThrough: {}, structural: true, ...extra }, hp, broken: false };
}
function rows(cases: { layers: LayerSlot[]; packet: PacketIn; hp: number[]; remaining: number }[]): void {
  for (const c of cases) {
    const before = structuredClone(c.layers), out = runLayers(c.layers, c.packet);
    assert.deepEqual(out.layers.map(l => l.hp), c.hp); assert.equal(out.remaining, c.remaining);
    assert.deepEqual(c.layers, before);
  }
}
test("DN-M-07 ablative 磨損與純函式", () => {
  rows([{ layers: [slot()], packet: { type: "kinetic", amount: 4 }, hp: [6], remaining: 0 },
    { layers: [slot(), slot(20)], packet: { type: "kinetic", amount: 15 }, hp: [0, 15], remaining: 0 }]);
});
test("DN-M-09 非消耗 flat／pct 減傷", () => {
  rows([{ layers: [slot(10, { ablative: false, reduce: { flat: 2, pct: 0.5 } })], packet: { type: "kinetic", amount: 10 }, hp: [10], remaining: 4 },
    { layers: [slot(10, { ablative: false, reduce: { flat: 20 } })], packet: { type: "kinetic", amount: 10 }, hp: [10], remaining: 0 }]);
});
test("DC-C03 passThrough 與 armorPen 先分流", () => {
  rows([{ layers: [slot(10, { passThrough: { kinetic: 0.5 } })], packet: { type: "kinetic", amount: 8 }, hp: [6], remaining: 4 },
    { layers: [slot(10, { passThrough: { kinetic: 0.5 } })], packet: { type: "kinetic", amount: 8, armorPen: 0.5 }, hp: [8], remaining: 6 },
    { layers: [slot()], packet: { type: "kinetic", amount: 8, armorPen: 2 }, hp: [10], remaining: 8 }]);
});
test("resist 與 resistPen", () => {
  rows([{ layers: [slot(10, { resist: { kinetic: 0.75 } })], packet: { type: "kinetic", amount: 8, resistPen: 0.25 }, hp: [6], remaining: 0 },
    { layers: [slot(10, { resist: { kinetic: 0.75 } })], packet: { type: "kinetic", amount: 8, resistPen: 1 }, hp: [2], remaining: 0 }]);
});
test("layerFilter 與擊穿後同擊後續 packet 跳過", () => {
  rows([{ layers: [slot(), slot(20, { type: "flesh" })], packet: { type: "kinetic", amount: 7, layerFilter: ["flesh"] }, hp: [10, 13], remaining: 0 },
    { layers: [{ ...slot(), hp: 0, broken: true }, slot(20)], packet: { type: "kinetic", amount: 7 }, hp: [0, 13], remaining: 0 }]);
  const first = runLayers([slot(), slot(20)], { type: "kinetic", amount: 12 });
  rows([{ layers: first.layers, packet: { type: "kinetic", amount: 5 }, hp: [0, 13], remaining: 0 }]);
});
test("DN-M-10 溢出丟棄、層與部位事件、核心死亡", () => {
  rows([{ layers: [slot()], packet: { type: "kinetic", amount: 50 }, hp: [0], remaining: 40 }]);
  const ctx = fixture(d => { const extra = structuredClone(d.body.parts[0]!); extra.id = "leg"; extra.functions = ["locomotion"]; extra.seats = []; d.body.parts.push(extra); });
  applyPacket(ctx, "b", "core", { type: "kinetic", amount: 100 }, "a");
  assert.deepEqual(unit(ctx, "b").parts.leg!.layers.map(l => l.hp), [10, 20]);
  assert.deepEqual(ctx.s.log.events.map(e => e.type), ["LayerDamaged", "LayerBroken", "LayerDamaged", "LayerBroken", "PartBroken"]);
  assert.equal(isDead(ctx, "b"), true);
});
