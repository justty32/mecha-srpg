import test from "node:test";
import assert from "node:assert/strict";
import { resistance, weaponEssence } from "../../src/rules/resistance.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createSession, scenarioToSetup } from "../../src/sim/index.ts";
import type { BattleSession } from "../../src/sim/session.ts";

const { db, errors } = loadContentDirs(["content/base"]);
assert.deepEqual(errors, []);
const make = () => createSession({ db, sim: scenarioToSetup(db, "scenario/combined-arms-battlefield", 2108), seed: 2108, human: ["player", "enemy"] });
function turn(session: BattleSession, actor: string): void {
  for (let i = 0; session.currentActor() !== actor && i < 20; i++) {
    const active = session.currentActor(); assert.ok(active);
    assert.equal(session.submit({ kind: "end", actor: active }).ok, true);
  }
  assert.equal(session.currentActor(), actor);
}

test("代表編組是真實無核心常規車，五名玩家單位與三種怪獸同場", () => {
  const session = make(), s = session.state;
  assert.equal(Object.values(s.units).filter(u => u.owner === "player").length, 5);
  assert.equal(Object.values(s.units).filter(u => u.owner === "enemy").length, 5);
  for (const id of ["player-0", "player-1", "player-2"]) {
    const unit = s.units[id]!;
    assert.equal(unit.core, false);
    assert.equal(unit.pools.charge, undefined);
    assert.equal(Object.hasOwn(unit.seats, "soul"), false);
    assert.ok(session.rulesQuery.commanderOf(s, id));
    assert.ok(session.rulesQuery.abilitiesOf(s, id).some(id => id.endsWith("ability/burst-30")));
  }
  assert.equal(db.require("scenario", "scenario/combined-arms-battlefield").rules?.conventionalFactor, undefined);
  assert.deepEqual(["mite", "spitter", "hinge-crab"].map(id => db.require("species", `species/${id}`).aiProfile),
    ["base:aiprofile/swarm-mite", "base:aiprofile/kx-alien-stalker", "base:aiprofile/bodyguard"]);
});

test("常規戰車的一般機砲可經原session點格拆牆", () => {
  const session = make(); turn(session, "player-0");
  const hp = session.state.map.featureHp["9,6"]!;
  const cmd = { kind: "useAbility" as const, actor: "player-0", ability: "ability/burst-30", target: { cell: { x: 9, y: 6 } } };
  const preview = session.preview(cmd);
  assert.equal(preview.result.ok, true);
  assert.equal(session.state.map.featureHp["9,6"], hp);
  assert.equal(session.submit(cmd).ok, true);
  assert.ok(session.state.map.featureHp["9,6"]! < hp);
  assert.ok(session.state.log.events.some(e => e.type === "FeatureDamaged"));
});

test("工程車確實降低友軍熱量，飛彈車有合法遠距實彈命令", () => {
  const support = make(); turn(support, "player-2");
  const before = support.state.units["player-0"]!.pools.heat!.cur;
  const result = support.submit({ kind: "useAbility", actor: "player-2", ability: "ability/m2-relieve-ally", target: { unit: "player-0" } });
  assert.equal(result.ok, true);
  assert.equal(support.state.units["player-0"]!.pools.heat!.cur, Math.max(0, before - 15));
  const sim = scenarioToSetup(db, "scenario/combined-arms-battlefield", 2108);
  sim.setup.units.find(u => u.id === "enemy-4")!.pos = { x: 8, y: 10 };
  const missile = createSession({ db, sim, seed: 2108, human: ["player", "enemy"] });
  turn(missile, "player-1");
  const ammo = missile.state.units["player-1"]!.pools["hunter-dart"]!.cur;
  assert.equal(missile.submit({ kind: "useAbility", actor: "player-1", ability: "ability/mx-hunter-launch", target: { unit: "enemy-4" } }).ok, true);
  assert.equal(missile.state.units["player-1"]!.pools["hunter-dart"]!.cur, ammo - 1);
});

test("群獸近咬、射手遠攻、重甲自護都有實際可用命令", () => {
  for (const [actor, ability, pos, target] of [
    ["enemy-0", "ability/mite-swarm-bite", { x: 4, y: 6 }, { unit: "player-0" }],
    ["enemy-3", "ability/kx-thorn-snipe", { x: 7, y: 6 }, { unit: "player-0" }],
    ["enemy-4", "ability/kx-hinge-crab-shelter", { x: 17, y: 6 }, { cell: { x: 17, y: 6 } }],
  ] as const) {
    const sim = scenarioToSetup(db, "scenario/combined-arms-battlefield", 2108);
    sim.setup.units.find(u => u.id === actor)!.pos = { ...pos };
    const session = createSession({ db, sim, seed: 2108, human: ["player", "enemy"] });
    turn(session, actor);
    const result = session.submit({ kind: "useAbility", actor, ability, ...(target ? { target } : {}) });
    assert.equal(result.ok, true, `${actor} / ${ability}`);
    assert.ok(result.ok && result.events.some(e => e.type === "AbilityUsed"));
  }
});

test("常規迫砲確實越過阻視殘牆，直射機砲在相同線路被擋", () => {
  const sim = scenarioToSetup(db, "scenario/combined-arms-battlefield", 2108);
  sim.setup.units.find(u => u.id === "player-0")!.pos = { x: 5, y: 6 };
  sim.setup.units.find(u => u.id === "enemy-4")!.pos = { x: 10, y: 6 };
  const session = createSession({ db, sim, seed: 2108, human: ["player", "enemy"] });
  turn(session, "player-0");
  // 同一目標向西一格的殘牆，確實位於車與目標之間。
  const throughWall = session.preview({ kind: "useAbility", actor: "player-0", ability: "ability/burst-30", target: { unit: "enemy-4" } });
  assert.equal(throughWall.result.ok, false);
  assert.ok(!throughWall.result.ok && throughWall.result.rejection.code === "no-los");
  const ammo = session.state.units["player-0"]!.pools["star-shell"]!.cur;
  const lob = session.submit({ kind: "useAbility", actor: "player-0", ability: "ability/mx-falling-star", target: { cell: { x: 10, y: 6 } } });
  assert.equal(lob.ok, true);
  assert.equal(session.state.units["player-0"]!.pools["star-shell"]!.cur, ammo - 1);
});

test("兩新情境爆破步兵無核心仍有basic攻擊，凡鐵不能穿怪獸內層", () => {
  for (const scenario of ["playable-battlefield", "combined-arms-battlefield"]) {
    const sim = scenarioToSetup(db, `scenario/${scenario}`, 2108);
    const spawn = sim.setup.units.find(u => u.frame?.endsWith("frame/battlefield-support"))!;
    assert.equal(spawn.core, false);
    const session = createSession({ db, sim, seed: 2108, human: ["player", "enemy"] });
    turn(session, spawn.id);
    assert.equal(session.state.units[spawn.id]!.core, false);
    assert.ok(session.rulesQuery.abilitiesOf(session.state, spawn.id).some(id => id.endsWith("ability/battlefield-support")));
    const at = { x: spawn.pos.x + 1, y: spawn.pos.y };
    const index = at.y * session.state.map.width + at.x;
    session.state.map.terrain[index] = db.require("terrain", "terrain/ruin-wall").id;
    session.state.map.featureHp[`${at.x},${at.y}`] = 60;
    assert.equal(session.submit({ kind: "useAbility", actor: spawn.id, ability: "ability/battlefield-support", target: { cell: at } }).ok, true);
    assert.equal(session.state.map.featureHp[`${at.x},${at.y}`], 40);
  }
  let hitVerified = false;
  for (let seed = 1; seed <= 20 && !hitVerified; seed++) {
    const sim = scenarioToSetup(db, "scenario/combined-arms-battlefield", seed);
    sim.setup.units.find(u => u.id === "enemy-4")!.pos = { x: 5, y: 11 };
    const session = createSession({ db, sim, seed, human: ["player", "enemy"] });
    turn(session, "player-4");
    const ctx = { db, s: session.state };
    assert.equal(weaponEssence(ctx, "player-4", "ability/battlefield-support"), null);
    const protectedLayers = resistance(ctx, "player-4", "ability/battlefield-support", "enemy-4")!;
    assert.ok(protectedLayers.reach?.length);
    const target = session.state.units["enemy-4"]!;
    for (const [id, part] of Object.entries(target.parts)) for (const [index, layer] of part.layers.entries()) {
      const def = session.rulesQuery.layerDefs(session.state, target.id, id)[index]!;
      if (protectedLayers.reach!.includes(def.type)) { layer.hp = 0; layer.broken = true; }
    }
    const before = JSON.stringify(target.parts);
    const command = { kind: "useAbility" as const, actor: "player-4", ability: "ability/battlefield-support", target: { cell: { x: 5, y: 11 } } };
    const preview = session.preview(command);
    assert.equal(preview.result.ok, true);
    if (!preview.result.ok || !preview.result.events.some(e => e.type === "Hit" && e.payload.target === "enemy-4")) continue;
    assert.equal(session.submit(command).ok, true);
    assert.equal(JSON.stringify(target.parts), before, "已確認命中，凡鐵爆破仍不得傷害暴露內層");
    hitVerified = true;
  }
  assert.equal(hitVerified, true, "至少驗到一次真正命中，避免未命中造成假零傷害");
});

// 本輪固定樣本，僅驗完整指令路徑與有界終局，不聲稱三樣本證明全面平衡。
for (const seed of [3, 17, 41]) test(`角色AI完整交戰 seed=${seed}`, () => {
  const session = createSession({ db, sim: scenarioToSetup(db, "scenario/combined-arms-battlefield", seed), seed, human: [], maxSteps: 1200 });
  // Session尚無公開拒絕計數；只在測試攔截既有執行入口，產品API維持不變。
  const execution = session as unknown as { execute(cmd: Parameters<BattleSession["submit"]>[0]): ReturnType<BattleSession["submit"]> };
  const original = execution.execute.bind(session); let rejected = 0;
  execution.execute = cmd => { const result = original(cmd); if (!result.ok) rejected++; return result; };
  let steps = 0;
  while (steps < 1200 && session.stepAi() !== null) steps++;
  const result = session.result();
  console.log(JSON.stringify({ rolesSample: seed, steps, rejected, round: session.state.round,
    winner: result?.winner ?? null, reason: result?.reason ?? "stalled-or-limit", hash: session.hash() }));
  assert.ok(result, `seed=${seed}未終局；steps=${steps} rejected=${rejected}`);
  assert.equal(rejected, 0, `seed=${seed}出現非法候選`);
});
