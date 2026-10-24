import test from "node:test";
import assert from "node:assert/strict";
import { fnv1a64 } from "../../core/eventlog.ts";
import { scenarioToSetup, runBattle } from "../../sim/index.ts";
import { createWorldDB } from "../content/worlddb.ts";
import type { WorldTables } from "../content/worlddb.ts";
import type { ContractTemplate, EncounterDef } from "../state/types.ts";
import { fixture } from "./test-support.ts";
import { generateScenario } from "./scenario.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { instantiatePerson } from "../content/instantiate.ts";
import { evalNum } from "../../core/numexpr.ts";
import { sortieBattleSetup } from "./run.ts";

function overlay(ctx: ReturnType<typeof fixture>["ctx"], tables: WorldTables): void {
  const original = ctx.world, patch = createWorldDB(original.packs, tables);
  ctx.world = { ...original, get: (kind, id) => patch.get(kind, id) ?? original.get(kind, id),
    require: (kind, id) => patch.get(kind, id) ?? original.require(kind, id),
    all: kind => [...original.all(kind).filter(d => !patch.get(kind, d.id)), ...patch.all(kind)] };
}
function humanFixture() {
  const f = fixture(), { ctx, contract } = f;
  const encounter: EncounterDef = { id: "base:encounter/test-human", family: "insect", depth: "core", size: { w: 6, h: 6 },
    terrainMix: [{ terrain: "terrain/tidal-flat", w: 1 }], budgetByGrade: { D: 3 }, anchorHere: true,
    faction: "faction/residual-league", units: [{ frame: "frame/union-fr7", pilots: ["person/adewale-balogun", "person/arun-velan"] }] };
  const template: ContractTemplate = { ...ctx.world.require("contract", contract.template), encounter: [encounter.id], objectives: [{ kind: "eliminate", params: {} }] };
  overlay(ctx, { encounter: { [encounter.id]: encounter }, contract: { [template.id]: template } });
  return { ...f, encounter, template };
}

test("怪獸遭遇與改前情境及 RNG 逐位元指紋相同", () => {
  const { s, ctx, sortie } = fixture();
  s.rng = { state: "0522a486b3bda0d1", inc: "000000000000006d" };
  const sc = generateScenario(s, ctx, sortie);
  assert.equal(fnv1a64(JSON.stringify({ sc, rng: s.rng })), "ad61107c8bdab823");
});

test("契約明選人類編成跳過裂縫與錨，人物模板先不重複且不撞名冊", () => {
  const { s, ctx, sortie, contract } = humanFixture();
  contract.target.snapshot!.phase = "opening";
  s.roster.persons[`enemy-${sortie.id}-0`] = structuredClone(Object.values(s.roster.persons)[0]!);
  const sc = generateScenario(s, ctx, sortie), enemies = sc.slots.enemy!.units;
  assert.equal(enemies.length, 3);
  assert.equal(sc.slots.enemy!.faction, ctx.db.require("faction", "faction/residual-league").id);
  assert.ok(enemies.every(u => u.mech === ctx.db.require("frame", "frame/union-fr7").id && !u.monster && !Object.hasOwn(u, "components")));
  const people = enemies.flatMap(u => u.persons!).map(p => sc.personStates![p.id]!);
  assert.equal(new Set(people.slice(0, 2).map(p => p.def)).size, 2);
  assert.equal(new Set(people.map(p => p.id)).size, 3);
  assert.ok(people.every(p => !s.roster.persons[p.id] && p.id.startsWith(`enemy-${sortie.id}-`)));
  assert.doesNotThrow(() => scenarioToSetup(ctx.db, sc, sc.seed!));
});

test("加權編成按每級預算抽，components 明列空表也整組保留", () => {
  const { s, ctx, sortie, encounter } = humanFixture();
  encounter.units!.push({ frame: "frame/union-at12", w: 0 });
  encounter.units![0]!.components = {};
  overlay(ctx, { encounter: { [encounter.id]: encounter } });
  const sc = generateScenario(s, ctx, sortie);
  assert.ok(sc.slots.enemy!.units.every(u => u.mech?.endsWith("/union-fr7")));
  for (const u of sc.slots.enemy!.units) assert.deepEqual(u.components, {});
});

test("同契約從候選遭遇穩定挑一份，不受 RNG 位置影響", () => {
  const { s, ctx, sortie, encounter, template } = humanFixture();
  const other = { ...encounter, id: "base:encounter/test-other", faction: "faction/anvil-hunters" };
  template.encounter = [encounter.id, other.id];
  overlay(ctx, { encounter: { [other.id]: other }, contract: { [template.id]: template } });
  const first = generateScenario(s, ctx, sortie);
  const second = generateScenario(s, ctx, sortie);
  assert.equal(first.slots.enemy!.faction, second.slots.enemy!.faction);
});

test("只有 target.node 的契約由節點蝕域與第一裂縫族回退", () => {
  for (const blighted of [true, false]) {
    const { s, ctx, sortie, contract } = fixture();
    delete sortie.rift; contract.target = { node: sortie.node };
    if (!blighted) delete s.nodes[sortie.node]!.blight;
    const sc = generateScenario(s, ctx, sortie);
    const family = blighted ? "insect" : ctx.world.all("rift")[0]!.family;
    assert.ok(sc.slots.enemy!.units.every(u => ctx.db.require("species", ctx.db.require("monster", u.monster!).species).family === family));
  }
});

for (const name of ["league-blight-checkpoint", "rival-anvil-carcass", "rival-saltgull-ambush", "selene-whiteglove-audit", "smuggler-farside-ship", "tide-unshacklers"]) {
  test(`人類遭遇 ${name} 編成、配裝、勢力與固定 seed 戰鬥`, () => {
    const { s, ctx, sortie, contract } = fixture();
    const encounter = ctx.world.require("encounter", `encounter/${name}`);
    const template: ContractTemplate = { ...ctx.world.require("contract", contract.template), encounter: [encounter.id], objectives: [{ kind: "eliminate", params: {} }] };
    overlay(ctx, { contract: { [template.id]: template } });
    const forbidden = new Set([...ctx.world.all("start").flatMap(x => x.persons.map(p => typeof p === "string" ? p : p.def)),
      ...ctx.world.all("recruit").flatMap(r => r.sources.map(x => ctx.world.require("background", x.background).person))]);
    for (const entry of encounter.units!) for (const pilot of entry.pilots ?? []) assert.ok(!forbidden.has(pilot));
    const sc = generateScenario(s, ctx, sortie), seed = 1701;
    assert.equal(sc.slots.enemy!.faction, encounter.faction);
    assert.equal(sc.slots.enemy!.units.length, Object.values(encounter.budgetByGrade).reduce((a, b) => a + b, 0));
    for (const spawn of sc.slots.enemy!.units) {
      const entry = encounter.units!.find(u => u.frame === spawn.mech);
      assert.ok(entry && !spawn.monster);
      if (entry.components !== undefined) assert.deepEqual(spawn.components, entry.components);
      else assert.ok(!Object.hasOwn(spawn, "components"));
    }
    const sim = scenarioToSetup(ctx.db, sc, seed);
    for (const [index, spawn] of sc.slots.enemy!.units.entries()) {
      const loadout = spawn.components ?? ctx.db.require("frame", spawn.mech!).defaultLoadout;
      assert.deepEqual(sim.setup.units.find(u => u.id === `enemy-${index}`)!.components,
        loadout ? Object.fromEntries(Object.entries(loadout).map(([slot, id]) => [slot, ctx.db.require("component", id).id])) : undefined);
    }
    const run = runBattle({ db: ctx.db, sim, seed });
    assert.ok(run.result, `${name}: ${run.stopped}`);
    console.log(`ENCOUNTER ${name}: winner=${run.result.winner ?? "draw"} rounds=${run.result.rounds} seed=${seed}`);
  });
}

test("護送目標帶玩家戰鬥單位 id，人物使用獨立實例", () => {
  const { s, ctx, sortie, contract, template } = humanFixture();
  template.objectives = [{ kind: "escort", params: { role: "convoy" } }];
  overlay(ctx, { contract: { [template.id]: template } });
  const sc = generateScenario(s, ctx, sortie), sim = scenarioToSetup(ctx.db, sc, sc.seed!);
  const objective = sim.setup.objectives!.find(o => o.kind === "escort")!;
  assert.equal(objective.params.unit, `player-${sortie.units.length}`);
  const escorted = sim.setup.units.find(u => u.id === objective.params.unit)!;
  assert.equal(escorted.owner, "player");
  assert.ok(escorted.persons?.length);
  assert.ok(escorted.persons!.every(p => !s.roster.persons[p.id]));
  const prepared = sortieBattleSetup(s, ctx, sortie);
  assert.ok(prepared.ok);
  const mapped = prepared.sim.setup.objectives.find(o => o.kind === "escort")!.params.unit;
  assert.equal(mapped, `${sortie.id}/escort-${sortie.units.length}`);
  assert.ok(prepared.sim.setup.units.some(u => u.id === mapped));
  assert.equal(contract.stageIdx, 0);
});

test("獵殺二名怪補 A 級有 epithet 目標且不重複補既有目標", () => {
  for (const existing of [false, true]) {
    const { s, ctx, sortie, contract } = fixture();
    if (existing) contract.target.snapshot!.depth = "core";
    const template: ContractTemplate = { ...ctx.world.require("contract", contract.template), objectives: [{ kind: "killTarget", params: { tags: ["epithet"] } }] };
    overlay(ctx, { contract: { [template.id]: template } });
    const sc = generateScenario(s, ctx, sortie), sim = scenarioToSetup(ctx.db, sc, sc.seed!);
    const objective = sim.setup.objectives!.find(o => o.kind === "killTarget")!;
    const unit = sim.setup.units.find(u => u.id === objective.params.unit)!;
    assert.equal(unit.owner, "enemy"); assert.equal(unit.monster!.grade, "A");
    const spawn = sc.slots.enemy!.units[Number(String(objective.params.unit).split("-").at(-1))]!;
    assert.ok(ctx.db.require("monster", spawn.monster!).epithet);
    assert.equal(sc.slots.enemy!.units.filter(u => ctx.db.require("monster", u.monster!).epithet).length, 1);
  }
});

test("營運效果與天賦 mastery 在源頭求值，出戰人物貢獻全部是 number", () => {
  const { s, ctx, sortie, person } = fixture();
  const original = ctx.db, effect = structuredClone(original.require("effect", "effect/perk-soul-heart-1"));
  effect.contribs[0]!.value = { product: [{ ref: "params.factor" }, { ref: "self.attrs.resolve" }] };
  ctx.db = { ...original, require: (kind, id) => (kind === "effect" && id === effect.id ? effect : original.require(kind, id)) as ReturnType<typeof original.require<typeof kind>> };
  applyOpsEffect(s, ctx, { applyEffect: { target: "person", id: person, effect: { effect: effect.id, params: { factor: 0.5 } } } });
  assert.equal(s.roster.persons[person]!.contribs.at(-1)!.value, s.roster.persons[person]!.attrsBase.resolve! * 0.5);
  ctx.db = original;
  const soul = instantiatePerson(ctx.db, "test-soul", "person/ash"), def = ctx.db.require("person", soul.def);
  assert.ok("tree" in def.growth);
  const node = ctx.db.require("soultree", def.growth.tree).nodes[0]!;
  soul.will.soulTree!.nodes = [node.id]; s.roster.persons[soul.id] = soul;
  s.roster.mastery[soul.id] = { [node.id]: 0.25 }; sortie.units[0]!.seats.soul = soul.id;
  const sc = generateScenario(s, ctx, sortie);
  assert.ok(Object.values(sc.personStates!).flatMap(p => p.contribs).every(c => typeof c.value === "number"));
  const perk = ctx.db.require("effect", node.perk);
  assert.equal(sc.personStates![soul.id]!.contribs[0]!.value, evalNum(perk.contribs[0]!.value, { ref: () => 0 }) * 0.25);
});
