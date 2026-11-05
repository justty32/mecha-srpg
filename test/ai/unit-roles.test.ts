import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createRng } from "../../src/core/rng.ts";
import { createBattle, startBattle, tryCommand } from "../../src/rules/index.ts";
import { createRulesQuery, createRulesExec } from "../../src/ai/adapters/rules-adapter.ts";
import { createAgent, emptyKnowledge, updateKnowledge, takeTurn, registerPolicy } from "../../src/ai/index.ts";
import type { TurnEnv } from "../../src/ai/agent.ts";
import type { AiCtx } from "../../src/ai/policy.ts";
import { rangeGap } from "../../src/ai/score.ts";

const { db, errors } = loadContentDirs(["content/base"]);
assert.deepEqual(errors, []);
function fixture(frame: string, distance = 2, allyDistance = 2) {
  const s = createBattle(db, { id: "roles", map: { width: 18, height: 11, fill: "terrain/plain", exits: [] },
    objectives: [], maxRounds: 20, noRetreat: true, units: [
      { id: "a", owner: "player", frame: `frame/${frame}`, components: { ...db.require("frame", `frame/${frame}`).defaultLoadout }, pos: { x: 6, y: 5 }, persons: [{ id: "pa", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "ally", owner: "player", frame: "frame/battlefield-tank", components: { ...db.require("frame", "frame/battlefield-tank").defaultLoadout }, pos: { x: 6, y: 5 + allyDistance }, persons: [{ id: "pc", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "enemy", owner: "enemy", frame: "frame/battlefield-tank", components: { ...db.require("frame", "frame/battlefield-tank").defaultLoadout }, pos: { x: 6 + distance, y: 5 }, persons: [{ id: "pe", def: "person/ren-kasai", seat: "pilot" }] },
    ] }, 3);
  startBattle({ db, s });
  for (let i = 0; s.rt!.active !== "a" && i < 12; i++) {
    const actor = s.rt!.active; assert.ok(actor); assert.equal(tryCommand({ db, s }, { kind: "end", actor }).ok, true);
  }
  assert.equal(s.rt!.active, "a");
  const q = createRulesQuery(db);
  // 固定局面明示已觀察敵方，距離評分仍只讀這份情報快照。
  const know = updateKnowledge(q, s, "player", emptyKnowledge()); know.visible = ["enemy"];
  const params = { band: 1, maxMoves: 4, maxSupportMoves: 4, retreatMinRound: 999, intentMinRound: 999, ejectBelow: 0 };
  const env: TurnEnv = { q, s, slot: "player", know, assignment: null, params, rng: createRng(3, 101), exec: createRulesExec(db) };
  return { env, ctx: (): AiCtx => ({ ...env, view: s, danger: {}, params: { ...params, ...q.frameAiProfile?.(s, "a")?.params } }) };
}
function act(f: ReturnType<typeof fixture>, actions = 1) {
  return takeTurn(f.env, createAgent("a", "tactical"), { maxActions: actions });
}

test("工程AP不足或扶架毀不硬施放", () => {
  for (const broken of [false, true]) {
    const f = fixture("battlefield-engineer", 5); f.env.s.units.ally!.pools.heat!.cur = 120;
    if (broken) f.env.s.units.a!.parts.turret!.broken = true;
    else f.env.s.persons.pa!.pools.ap!.cur = 2;
    assert.ok(!act(f, 2).some(c => c.kind === "useAbility" && c.ability.endsWith("m2-relieve-ally")));
  }
});

test("缺選填query與rangeWeight0同seed命令相同；不讀未知敵距", () => {
  const a = fixture("battlefield-tank", 5), b = fixture("battlefield-tank", 5);
  a.env.q.frameAiProfile = undefined;
  b.env.q.frameAiProfile = () => ({ policy: "tactical", params: { rangeWeight: 0 } });
  assert.deepEqual(act(a, 2), act(b, 2));
  const unmarked = fixture("hound-mk2", 5), legacy = fixture("hound-mk2", 5);
  assert.equal(unmarked.env.q.frameAiProfile!(unmarked.env.s, "a"), undefined);
  legacy.env.q.frameAiProfile = undefined;
  assert.deepEqual(act(unmarked, 2), act(legacy, 2));
  const ctx = fixture("battlefield-missile-truck", 2).ctx(); ctx.know.visible = [];
  assert.equal(rangeGap(ctx, "a", ctx.view.units.a!.pos), null);
});

test("角色合併不改共享params，scripted/berserk與withdraw優先", () => {
  let calls = 0;
  registerPolicy({ id: "role-unit-probe", propose: (ctx, agent) => { calls++; assert.equal(ctx.params.attack, 9); return [{ cmd: { kind: "end", actor: agent.unit } }]; }, score: () => 1 });
  const f = fixture("battlefield-tank", 5), before = structuredClone(f.env.params);
  f.env.q.frameAiProfile = () => ({ policy: "role-unit-probe", params: { attack: 9 } });
  act(f); assert.equal(calls, 1); assert.deepEqual(f.env.params, before);
  for (const policy of ["scripted", "berserk"]) {
    const special = fixture("battlefield-tank", 5); special.env.q.frameAiProfile = f.env.q.frameAiProfile;
    takeTurn(special.env, createAgent("a", policy), { maxActions: 1 });
  }
  for (const intentMode of ["retreat", "regroup"] as const) {
    const special = fixture("battlefield-tank", 5); special.env.q.frameAiProfile = f.env.q.frameAiProfile;
    special.env.s.rt!.noRetreat = false;
    special.env.assignment = { unit: "a", stance: "attack", allowRetreat: true, intentMode };
    takeTurn(special.env, createAgent("a", "tactical"), { maxActions: 1 });
  }
  assert.equal(calls, 1);
});

 test("不存在或inactive單位不讀frame profile", () => {
  const f = fixture("battlefield-tank", 5);
  f.env.q.frameAiProfile = () => { throw new Error("不得查詢"); };
  assert.deepEqual(takeTurn(f.env, createAgent("missing", "tactical")), []);
  f.env.s.rt!.unitStatus.a = "dead";
  assert.deepEqual(takeTurn(f.env, createAgent("a", "tactical")), []);
});
