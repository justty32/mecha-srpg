import test from "node:test";
import assert from "node:assert/strict";
import { createBattle, battleResult, rt } from "../../rules/index.ts";
import { runBattle, scenarioToSetup } from "../../sim/run.ts";
import { generateScenario } from "./scenario.ts";
import { runSortie } from "./run.ts";
import { fixture } from "./test-support.ts";
import { runCampaign } from "../sim/campaign.ts";
import { defaultBattleRunner } from "../sim/battle.ts";
import { replayCampaign } from "../sim/replay.ts";
import { campaignHash, createCampaignBlob, serializeCampaign, parseCampaign, loadCampaign } from "../sim/save.ts";

function setup() {
  const f = fixture();
  const scenario = generateScenario(f.s, f.ctx, f.sortie);
  const sim = scenarioToSetup(f.ctx.db, scenario, scenario.seed!);
  const unit = sim.setup.units.find(u => u.owner === "player")!;
  return { ...f, scenario, sim, unit };
}

test("UnitInit 部位現況未受攻擊時原樣進入 BattleResult", () => {
  const { s, ctx, sim, unit, mech } = setup();
  unit.parts = Object.fromEntries(Object.entries(s.mechs[mech]!.parts).map(([id, p]) => [id, structuredClone({ layers: p.layers, broken: p.broken })]));
  const part = Object.values(unit.parts)[0]!;
  part.layers[0]!.hp -= 7;
  part.layers[1] = { hp: 0, broken: true }; part.broken = true;
  const state = createBattle(ctx.db, sim.setup, 7);
  rt(state).outcome = { winner: "player", reason: "test" };
  const result = battleResult({ db: ctx.db, s: state })!;
  for (const [id, p] of Object.entries(unit.parts)) {
    assert.deepEqual(result.units.find(u => u.id === unit.id)!.state.parts[id]!.layers, p.layers);
    assert.equal(result.units.find(u => u.id === unit.id)!.state.parts[id]!.broken, p.broken);
  }
  assert.notStrictEqual(state.units[unit.id]!.parts, unit.parts);
});

test("不在 ContentDB 的人物實例帶入池、效果與完整現況", () => {
  const { ctx, scenario, person } = setup();
  const p = scenario.personStates![person]!;
  p.pools.hp!.cur -= 4; p.morale = "shaken"; p.xp = 9; p.level = 2;
  p.attrsBase.resolve = 12;
  p.will.resonance.example = 17;
  p.effects.push({ uid: 42, effect: ctx.db.require("effect", "effect/morale-shaken").id, source: "test",
    scope: "person", owner: { person }, remaining: null, magnitude: 1, stacks: 1, contribIds: ["c42"] });
  p.contribs.push({ id: "c42", source: "test", path: "self.attrs.resolve", op: "add", value: 3 });
  assert.equal(ctx.db.get("person", person), undefined);
  const sim = scenarioToSetup(ctx.db, scenario, scenario.seed!);
  const state = createBattle(ctx.db, sim.setup, 7), actual = state.persons[person]!;
  for (const key of ["pools", "effects", "contribs", "morale", "will", "attrsBase", "xp", "level"] as const) assert.deepEqual(actual[key], p[key]);
  assert.notStrictEqual(actual.effects, p.effects);
  assert.equal(rt(state).nextUid, 43); assert.equal(rt(state).nextContrib, 43);
});

test("UnitInit 明示 controlMode 與單位效果優先於座位推導", () => {
  const { ctx, sim, unit } = setup();
  unit.controlMode = "none";
  unit.effects = [{ uid: 10, effect: "effect/morale-shaken", source: "test", scope: "mech", owner: { unit: unit.id },
    remaining: null, magnitude: 1, stacks: 1, contribIds: [] }];
  const state = createBattle(ctx.db, sim.setup, 7);
  assert.equal(state.units[unit.id]!.controlMode, "none");
  assert.deepEqual(state.units[unit.id]!.effects, unit.effects);
  assert.notStrictEqual(state.units[unit.id]!.effects, unit.effects);
});

test("runBattle 的 BattleResult.events 與 state.log.events 相同且獨立", () => {
  const { ctx, sim } = setup();
  sim.setup.maxRounds = 1;
  const run = runBattle({ db: ctx.db, sim, seed: 7, players: { player: { kind: "script", commands: [] }, enemy: { kind: "script", commands: [] } } });
  assert.ok(run.result);
  assert.ok(run.state.log.events.length > 0);
  assert.deepEqual(run.result.events, run.state.log.events);
  assert.notStrictEqual(run.result.events, run.state.log.events);
});

test("ops 出戰全程保留 ctx.db 同一物件且不加入 ops 地圖", () => {
  const { s, ctx, sortie } = fixture();
  const original = ctx.db;
  Object.defineProperty(ctx, "db", { get: () => original, set: () => { throw new Error("db replacement"); } });
  const run = runSortie(s, ctx, sortie);
  assert.equal(run.ok, true); assert.ok(run.result);
  assert.strictEqual(ctx.db, original);
  assert.equal(ctx.db.ids("map").some(id => id.startsWith("ops:")), false);
});

let campaign: ReturnType<typeof runCampaign> | undefined;
function recordedCampaign() {
  const { ctx } = fixture();
  campaign ??= runCampaign({ ...ctx, start: "default", seed: 7, months: 2, policy: "greedy", battle: defaultBattleRunner });
  assert.ok(campaign.commands.some(cmd => cmd.battle?.result));
  return { ctx, run: campaign };
}

test("營運重播套用戰果：會拋錯的 runner 呼叫零次且 state hash 相同", () => {
  const { ctx, run } = recordedCampaign();
  let calls = 0;
  const replayed = replayCampaign(ctx.db, ctx.world, "default", 7, run.commands, () => { calls++; throw new Error("戰鬥不得重跑"); });
  assert.equal(calls, 0);
  assert.equal(campaignHash(replayed), campaignHash(run.state));
  const bad = structuredClone(run.commands);
  bad.find(cmd => cmd.battle?.result)!.battle!.sortie.id = "wrong-sortie";
  assert.throws(() => replayCampaign(ctx.db, ctx.world, "default", 7, bad), /battle-record-sortie-mismatch/);
});

test("含戰果的營運存檔 JSON 來回後仍無須戰鬥且 hash 相同", () => {
  const { ctx, run } = recordedCampaign();
  const blob = createCampaignBlob("default", 7, run.commands, run.state);
  const source = serializeCampaign(blob);
  assert.deepEqual(parseCampaign(source), blob);
  const loaded = loadCampaign(ctx.db, ctx.world, source, () => { throw new Error("載檔不得重跑戰鬥"); });
  assert.equal(campaignHash(loaded), campaignHash(run.state));
  const missing = structuredClone(blob);
  for (const cmd of missing.commands) delete cmd.battle;
  assert.throws(() => loadCampaign(ctx.db, ctx.world, missing), /snapshot-hash-mismatch/);
  const invalid = structuredClone(blob);
  invalid.commands.find(cmd => cmd.battle)!.battle!.effectCounter = -1;
  assert.throws(() => parseCampaign(serializeCampaign(invalid)), /invalid-campaign-battle-record/);
});
