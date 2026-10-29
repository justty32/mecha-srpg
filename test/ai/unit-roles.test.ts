import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createContentDB } from "../../src/content/contentdb.ts";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import { createRng } from "../../src/core/rng.ts";
import { createBattle, startBattle, tryCommand } from "../../src/rules/index.ts";
import { createRulesQuery, createRulesExec } from "../../src/ai/adapters/rules-adapter.ts";
import { createAgent, emptyKnowledge, updateKnowledge, takeTurn, registerPolicy } from "../../src/ai/index.ts";
import type { TurnEnv } from "../../src/ai/agent.ts";
import type { AiCtx } from "../../src/ai/policy.ts";
import { rangeGap, scoreCandidate } from "../../src/ai/score.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";

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

test("正式三frame各自讀到角色profile；錯種類/不存在引用由adapter拒絕", () => {
  for (const [frame, role] of [["tank", "frontline"], ["missile-truck", "standoff"], ["engineer", "heat-support"]]) {
    const f = fixture(`battlefield-${frame}`);
    assert.deepEqual(f.env.q.frameAiProfile!(f.env.s, "a"), {
      policy: "tactical", params: db.require("aiprofile", `aiprofile/battlefield-${role}`).params,
    });
  }
  for (const id of ["base:aiprofile/missing-role", "base:ability/mx-head-vulcan"]) {
    const defs = Object.fromEntries(CONTENT_KINDS.map(k => [k, Object.fromEntries(db.all(k).map(d => [d.id, d]))]));
    const frame = { ...db.require("frame", "frame/battlefield-tank"), aiProfile: id }; defs.frame![frame.id] = frame;
    const invalid = createContentDB([...db.packs], db.registries, db.rules, defs);
    const f = fixture("battlefield-tank");
    assert.throws(() => createRulesQuery(invalid).frameAiProfile!(f.env.s, "a"));
  }
});

test("前線敵距8會前推；遠射被貼身會退距且保留合法出手", () => {
  const front = fixture("battlefield-tank", 8); const before = front.env.s.units.a!.pos;
  const commands = act(front);
  assert.equal(commands[0]?.kind, "move");
  assert.ok(front.env.q.distance(front.env.s.units.a!.pos, front.env.s.units.enemy!.pos) < 8);
  assert.notDeepEqual(front.env.s.units.a!.pos, before);
  const back = fixture("battlefield-missile-truck", 2); const moves = act(back);
  assert.equal(moves[0]?.kind, "move");
  assert.ok(back.env.q.distance(back.env.s.units.a!.pos, back.env.s.units.enemy!.pos) > 2);
  assert.ok(back.env.q.abilitiesOf(back.env.s, "a").some(ability => back.env.q.abilityDef(ability).packets.length
    && back.env.q.checkAbility(back.env.s, "a", ability, { unit: "enemy" }) === null));
});

test("理想距離不為距離往返，追矢耗盡仍有機砲自衛；後方堵死不造非法候選", () => {
  const f = fixture("battlefield-missile-truck", 5); const ctx = f.ctx(), agent = createAgent("a", "tactical");
  assert.equal(rangeGap(ctx, "a", ctx.view.units.a!.pos), 0);
  const pure = proposeTactical(ctx, agent).filter(c => c.cmd.kind === "move");
  for (const c of pure) assert.ok(scoreCandidate(ctx, agent, c) <= 0);
  f.env.s.units.a!.pools["hunter-dart"]!.cur = 0;
  assert.ok(f.env.q.abilitiesOf(f.env.s, "a").some(id => f.env.q.abilityDef(id).packets.length && f.env.q.checkAbility(f.env.s, "a", id, { unit: "enemy" }) === null));
  const selfDefense = act(f, 2);
  const gun = db.require("component", "component/autocannon-30").abilities;
  assert.ok(selfDefense.some(c => c.kind === "useAbility" && gun.includes(c.ability)), "追矢空匣仍真正施放機砲");
  const blocked = fixture("battlefield-missile-truck", 2);
  blocked.env.q.reachable = () => ({}); blocked.env.q.forSnapshot = undefined;
  let rejected = 0; const exec = blocked.env.exec; blocked.env.exec = (s, cmd) => { const r = exec(s, cmd); if (!r.ok) rejected++; return r; };
  act(blocked, 3); assert.equal(rejected, 0);
});

test("工程高熱優先排熱且真降15，冷友軍不施放；距4可移動支援", () => {
  for (const distance of [2, 4]) {
    const hot = fixture("battlefield-engineer", 5, distance); hot.env.s.units.ally!.pools.heat!.cur = 120;
    const before = hot.env.s.units.ally!.pools.heat!.cur; let afterRelief: number | undefined;
    const exec = hot.env.exec; hot.env.exec = (s, cmd) => { const r = exec(s, cmd);
      if (r.ok && cmd.kind === "useAbility" && cmd.ability.endsWith("m2-relieve-ally")) afterRelief = s.units.ally!.pools.heat!.cur; return r; };
    const commands = act(hot, 2);
    assert.ok(commands.some(c => c.kind === "useAbility" && c.ability.endsWith("m2-relieve-ally")));
    assert.equal(afterRelief, before - 15);
  }
  const cold = fixture("battlefield-engineer", 5); const commands = act(cold, 2);
  assert.ok(!commands.some(c => c.kind === "useAbility" && c.ability.endsWith("m2-relieve-ally")));
});

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
