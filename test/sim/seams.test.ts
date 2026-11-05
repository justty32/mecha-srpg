import test from "node:test";
import assert from "node:assert/strict";
import { createContentDB } from "../../src/content/contentdb.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import type { ScenarioDef } from "../../src/core/types-def.ts";
import { evalNum } from "../../src/core/numexpr.ts";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import { createRulesQuery } from "../../src/ai/adapters/rules-adapter.ts";
import { createBattle, checkAbility, hostile, rt, objectiveDone, evaluateObjectives, signal, evalCtxFor } from "../../src/rules/index.ts";
import { scenarioToSetup } from "../../src/sim/run.ts";
import { createSession } from "../../src/sim/index.ts";
import type { BattleSession } from "../../src/sim/session.ts";
import { db } from "./helpers.ts";

const nest = "scenario/rift-edge-nest";
function nestContext() {
  return { db, s: createBattle(db, scenarioToSetup(db, nest, 1).setup, 1) };
}

test("同盟：rift ally 的 friendly:no 能力拒絕玩家目標", () => {
  const setup = scenarioToSetup(db, nest, 1).setup;
  // 裝上正式能力，避免原情境的空武裝掩蓋目標合法性。
  setup.units.find(u => u.id === "ally-0")!.components = { "right-weapon": "component/autocannon-30" };
  const ctx = { db, s: createBattle(db, setup, 1) };
  assert.equal(db.require("ability", "ability/burst-30").target.friendly, "no");
  assert.equal(checkAbility(ctx, "ally-0", "ability/burst-30", { unit: "player-0" })?.code, "bad-target");
});

test("同盟：對稱映射、世界 ally 聯集、skirmish 敵對與舊存檔相容", () => {
  const ctx = nestContext(), q = createRulesQuery(db);
  assert.equal(hostile(ctx, "player-0", "ally-0"), false);
  assert.equal(hostile(ctx, "ally-0", "player-0"), false);
  assert.equal(hostile(ctx, "player-0", "enemy-0"), true);
  assert.equal(q.hostileSlots?.(ctx.s, "player", "ally"), false);
  assert.equal(q.hostileSlots?.(ctx.s, "player", "player"), false);
  assert.equal(q.hostileSlots?.(ctx.s, "berserk", "berserk"), true);
  assert.equal(ctx.s.factions.player!.faction, db.require("faction", "faction/migrant-crew").id);
  const skirmish = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1);
  assert.equal(hostile({ db, s: createBattle(db, skirmish.setup, 1) }, "player-0", "enemy-0"), true);
  const old = structuredClone(ctx.s);
  Reflect.deleteProperty(old.rt!, "allies");
  assert.equal(hostile({ db, s: old }, "player-0", "ally-0"), true);

  const defs = structuredClone(Object.fromEntries(CONTENT_KINDS.map(kind =>
    [kind, Object.fromEntries(db.all(kind).map(d => [d.id, d]))]))) as Parameters<typeof createContentDB>[3];
  defs.faction!["base:faction/selene-whitegloves"]!.relations["base:faction/migrant-crew"] = "ally";
  const alliedDb = createContentDB([...db.packs], db.registries, db.rules, defs);
  const setup = scenarioToSetup(alliedDb, "scenario/skirmish-whitegloves", 1).setup;
  const world = { db: alliedDb, s: createBattle(alliedDb, setup, 1) };
  assert.equal(hostile(world, "player-0", "enemy-0"), false);
  assert.equal(hostile(world, "enemy-0", "player-0"), false);
});

test("同盟：eliminate 預設忽略盟友並保留明列 slots 的語意", () => {
  const ctx = nestContext();
  const objective = { kind: "eliminate" as const, params: {}, for: "player", onComplete: "win" as const };
  assert.equal(objectiveDone(ctx, objective), false);
  for (const u of Object.values(ctx.s.units)) if (u.owner === "enemy") rt(ctx.s).unitStatus[u.id] = "dead";
  assert.equal(objectiveDone(ctx, objective), true);
  assert.equal(objectiveDone(ctx, { ...objective, params: { slots: ["ally"] } }), false);
  rt(ctx.s).objectives = [objective];
  assert.deepEqual(evaluateObjectives(ctx, false), { winner: "player", reason: "eliminate" });
});

test("killTarget：rift 目標解析為 units，死亡信號產生 player 勝利 BattleEnd", () => {
  const sim = scenarioToSetup(db, nest, 1), objective = sim.setup.objectives[0]!;
  assert.deepEqual(objective.params.units, ["enemy-0"]);
  assert.equal(objective.params.target, db.require("monster", "monster/nestmother-landlord").id);
  const ctx = { db, s: createBattle(db, sim.setup, 1) };
  assert.equal(objectiveDone(ctx, objective), false);
  rt(ctx.s).unitStatus["enemy-0"] = "dead";
  signal(ctx, "unitDied", { unit: "enemy-0", killer: "player-0" });
  assert.deepEqual(rt(ctx.s).outcome, { winner: "player", reason: "killTarget" });
  assert.deepEqual(ctx.s.log.events.find(e => e.type === "BattleEnd")?.payload,
    { winner: "player", reason: "killTarget" });
});

test("killTarget：重複 def 解析為排序集合，units 與 unit 全死才達成", () => {
  const sc = structuredClone(db.require("scenario", nest));
  sc.objectives[0]!.params = { target: "base:monster/reaper-c" };
  const setup = scenarioToSetup(db, sc, 1).setup, objective = setup.objectives[0]!;
  assert.deepEqual(objective.params.units, ["enemy-1", "enemy-2", "enemy-3"]);
  const ctx = { db, s: createBattle(db, setup, 1) };
  objective.params.unit = "enemy-0";
  for (const id of ["enemy-1", "enemy-2", "enemy-3"]) {
    assert.equal(objectiveDone(ctx, objective), false);
    rt(ctx.s).unitStatus[id] = "dead";
  }
  assert.equal(objectiveDone(ctx, objective), false);
  rt(ctx.s).unitStatus["enemy-0"] = "dead";
  assert.equal(objectiveDone(ctx, objective), true);
  assert.equal(objectiveDone(ctx, { ...objective, params: { units: [] } }), false);
  sc.objectives[0]!.params = { target: "enemy-0" };
  assert.equal(scenarioToSetup(db, sc, 1).setup.objectives[0]!.params.unit, "enemy-0");
  sc.objectives[0]!.params = { target: "base:frame/moji-tern" };
  assert.deepEqual(scenarioToSetup(db, sc, 1).setup.objectives[0]!.params.units,
    ["ally-0", "ally-1", "ally-2", "ally-3", "ally-4", "ally-5", "player-0"]);
});

test("killTarget：未知 target 明確拒絕且不修改內容", () => {
  const sc = structuredClone(db.require("scenario", nest));
  sc.objectives[0]!.params = { target: "missing-unit" };
  const before = structuredClone(sc);
  assert.throws(() => scenarioToSetup(db, sc, 1), { message: "objective 目標不存在：missing-unit" });
  assert.deepEqual(sc, before);
});

test("地圖：scenarioToSetup 傳遞 globals 與 feature hp，包括零值及地形預設", () => {
  const loaded = loadContentDirs(["content/base", "test/scenarios/pack"]);
  assert.deepEqual(loaded.errors, []);
  const scenario: ScenarioDef = { id: "scenario/seams", map: "rtest:map/seams-globals",
    slots: { player: { faction: "faction/migrant-crew", units: [{ mech: "frame/infantry", at: "zone" }] } }, objectives: [] };
  const setup = scenarioToSetup(loaded.db, scenario, 1).setup;
  assert.deepEqual(setup.map.globals, { tide: { ref: "battle.round", mul: 2, add: 1 }, light: 0.4 });
  const s = createBattle(loaded.db, setup, 1), ctx = { db: loaded.db, s };
  s.round = 3;
  assert.equal(evalNum({ ref: "battle.tide" }, evalCtxFor(ctx, {})), 7);
  assert.equal(evalNum({ ref: "battle.light" }, evalCtxFor(ctx, {})), 0.4);
  const hp = loaded.db.require("terrain", "base:terrain/ruin-wall").destructible!.hp;
  assert.deepEqual(s.map.featureHp, { "1,0": 17, "2,0": hp, "3,0": hp, "0,1": 0 });
});

test("地圖：setup globals 隨 round 求值，未宣告或舊存檔回零，tide 只認 round", () => {
  const setup = scenarioToSetup(db, nest, 1).setup;
  setup.map.globals = { tide: { ref: "battle.round", mul: 3 }, light: 0.6 };
  const ctx = { db, s: createBattle(db, setup, 1) }, ev = evalCtxFor(ctx, {});
  ctx.s.round = 2;
  assert.equal(evalNum({ ref: "battle.tide" }, ev), 6);
  ctx.s.round = 4;
  assert.equal(evalNum({ ref: "battle.tide" }, ev), 12);
  assert.equal(evalNum({ ref: "battle.light" }, ev), 0.6);
  rt(ctx.s).globals.tide = { ref: "battle.light" };
  assert.throws(() => evalNum({ ref: "battle.tide" }, ev), /不支援路徑：battle.light/u);
  rt(ctx.s).globals = {};
  assert.equal(evalNum({ ref: "battle.tide" }, ev), 0);
  assert.equal(evalNum({ ref: "battle.light" }, ev), 0);
  Reflect.deleteProperty(ctx.s.rt!, "globals");
  assert.equal(evalNum({ ref: "battle.tide" }, ev), 0);
  assert.equal(evalNum({ ref: "battle.light" }, ev), 0);
});

test("地圖：destructible fill 沒有 feature 時每格使用預設 hp", () => {
  const s = createBattle(db, { id: "seams-fill", map: { width: 2, height: 2,
    fill: "terrain/ruin-wall", cells: [{ at: { x: 1, y: 1 }, terrain: "terrain/plain" }], exits: [] },
    units: [], objectives: [] }, 1);
  const hp = db.require("terrain", "terrain/ruin-wall").destructible!.hp;
  assert.deepEqual(s.map.featureHp, { "0,0": hp, "1,0": hp, "0,1": hp });
});

// 常規車對地物的互動（原 combined-arms 情境的兩條地形案）。
const combined = "scenario/combined-arms-battlefield";
function combinedSession(move: Record<string, { x: number; y: number }> = {}): BattleSession {
  const sim = scenarioToSetup(db, combined, 2108);
  for (const [id, pos] of Object.entries(move)) sim.setup.units.find(u => u.id === id)!.pos = pos;
  return createSession({ db, sim, seed: 2108, human: ["player", "enemy"] });
}
function turnTo(session: BattleSession, actor: string): void {
  for (let i = 0; session.currentActor() !== actor && i < 20; i++) {
    const active = session.currentActor(); assert.ok(active);
    assert.equal(session.submit({ kind: "end", actor: active }).ok, true);
  }
  assert.equal(session.currentActor(), actor);
}

test("地圖：常規戰車的一般機砲可經原session點格拆牆", () => {
  const session = combinedSession(); turnTo(session, "player-0");
  const hp = session.state.map.featureHp["9,6"]!;
  const cmd = { kind: "useAbility" as const, actor: "player-0", ability: "ability/burst-30", target: { cell: { x: 9, y: 6 } } };
  const preview = session.preview(cmd);
  assert.equal(preview.result.ok, true);
  assert.equal(session.state.map.featureHp["9,6"], hp);
  assert.equal(session.submit(cmd).ok, true);
  assert.ok(session.state.map.featureHp["9,6"]! < hp);
  assert.ok(session.state.log.events.some(e => e.type === "FeatureDamaged"));
});

test("地圖：常規迫砲確實越過阻視殘牆，直射機砲在相同線路被擋", () => {
  const session = combinedSession({ "player-0": { x: 5, y: 6 }, "enemy-4": { x: 10, y: 6 } });
  turnTo(session, "player-0");
  // 同一目標向西一格的殘牆，確實位於車與目標之間。
  const throughWall = session.preview({ kind: "useAbility", actor: "player-0", ability: "ability/burst-30", target: { unit: "enemy-4" } });
  assert.equal(throughWall.result.ok, false);
  assert.ok(!throughWall.result.ok && throughWall.result.rejection.code === "no-los");
  const ammo = session.state.units["player-0"]!.pools["star-shell"]!.cur;
  const lob = session.submit({ kind: "useAbility", actor: "player-0", ability: "ability/mx-falling-star", target: { cell: { x: 10, y: 6 } } });
  assert.equal(lob.ok, true);
  assert.equal(session.state.units["player-0"]!.pools["star-shell"]!.cur, ammo - 1);
});
