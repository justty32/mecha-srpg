import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "./load.ts";
import { createWorldDB } from "./worlddb.ts";
import { checkWorld } from "./check.ts";
import type { ContractTemplate, EncounterDef } from "../state/types.ts";

const { db, world } = loadWorldDirs(["content/base"]);
const valid: EncounterDef = { ...world.require("encounter", "encounter/league-blight-checkpoint"),
  units: [{ frame: "frame/union-fr7", pilots: ["person/adewale-balogun"], components: { "left-weapon": "component/mx-iron-repeater" } }] };
const checks: [string, (e: EncounterDef) => void][] = [
  ["壞 frame", e => { e.units![0]!.frame = "frame/missing"; }],
  ["frame 欄放其他 kind", e => { e.units![0]!.frame = "person/adewale-balogun"; }],
  ["壞 pilot", e => { e.units![0]!.pilots = ["person/missing"]; }],
  ["pilot 欄放其他 kind", e => { e.units![0]!.pilots = ["frame/union-fr7"]; }],
  ["壞 component", e => { e.units![0]!.components = { "left-weapon": "component/missing" }; }],
  ["壞 slot", e => { e.units![0]!.components = { nowhere: "component/mx-iron-repeater" }; }],
  ["slot 型別不符", e => { e.units![0]!.components = { cockpit: "component/mx-iron-repeater" }; }],
  ["壞 faction", e => { e.faction = "faction/missing"; }],
  ["faction 欄放其他 kind", e => { e.faction = "person/adewale-balogun"; }],
];
for (const [label, breakIt] of checks) test(`遭遇檢查雙向：${label}`, () => {
  const bad = structuredClone(valid); breakIt(bad);
  const errors = (e: EncounterDef) => checkWorld(db, createWorldDB(world.packs, { encounter: { [e.id]: e } })).errors;
  assert.ok(errors(bad).length > 0, `${label} 必須回錯`);
  assert.deepEqual(errors(valid), []);
});

for (const id of ["encounter/missing", "frame/union-fr7"]) test(`契約 encounter 引用雙向：${id}`, () => {
  const template: ContractTemplate = { ...world.require("contract", "contract/clear"), encounter: [id] };
  const errors = () => checkWorld(db, createWorldDB(world.packs, { contract: { [template.id]: template },
    encounter: { [valid.id]: valid }, "faction-ops": Object.fromEntries(world.all("faction-ops").map(f => [f.id, f])) })).errors.filter(e => e.startsWith(template.id));
  assert.ok(errors().length > 0);
  template.encounter = [valid.id]; assert.deepEqual(errors(), []);
});
