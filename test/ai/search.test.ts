import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import type { AiCtx } from "../../src/ai/policy.ts";
import { createAgent, emptyKnowledge, getPolicy, maskedState, updateKnowledge } from "../../src/ai/index.ts";
import { knownPursuitCells, pursuitCells, searchCells } from "../../src/ai/knowledge.ts";
import { buildSearchRoute, readSearchMemory, reduceSearchProgress, searchAllowed, pursuitHostileOnly } from "../../src/ai/search.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

function setup(count = 3) {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 30, height: 12, deployZones: {
    red: [0, 2, 4, 6, 8].map(y => ({ x: 27, y })), blue: [{ x: 0, y: 0 }, { x: 0, y: 11 }],
  }, units: Array.from({ length: count }, (_, i) => ({ id: `a${i}`, owner: "blue", pos: { x: 1, y: i },
    abilities: [], perception: 1 })) }, 1);
  const ctx: AiCtx = { q, s, view: s, slot: "blue", know: emptyKnowledge(), assignment: null,
    danger: {}, params: {}, rng: createRng(1), searchEnabled: true };
  return { ctx, agent: createAgent("a0", "tactical", { unrelated: { keep: 7 } }) };
}

test("search：按格距分散、排序去重越界、容量不足仍有終點", () => {
  const { ctx } = setup();
  const routes = [0, 1, 2].map(i => buildSearchRoute(ctx, createAgent(`a${i}`, "tactical")));
  const cells = routes.map(m => m.route[0]!.cell);
  for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
    assert.ok(ctx.q.distance(cells[i]!, cells[j]!) >= 2);
  }
  ctx.view.rt!.deployZones!.red!.push({ x: -1, y: 0 }, { x: 27, y: 0 });
  assert.deepEqual(buildSearchRoute(ctx, createAgent("a0", "tactical")), routes[0]);
  ctx.view.rt!.deployZones = { red: [{ x: 27, y: 0 }] };
  for (let i = 0; i < 3; i++) assert.equal(buildSearchRoute(ctx, createAgent(`a${i}`, "tactical")).route.length, 2);
  ctx.view.rt!.deployZones = { red: [] };
  assert.deepEqual(buildSearchRoute(ctx, createAgent("a0", "tactical")).route, []);
  ctx.view.rt!.deployZones = undefined;
  assert.deepEqual(buildSearchRoute(ctx, createAgent("a0", "tactical")).route, []);
});

test("search：三站進度冪等、換站不退、完成不重開與其他鍵保留", () => {
  const { ctx, agent } = setup(1);
  const route = buildSearchRoute(ctx, agent);
  assert.deepEqual(route.route.map(w => w.cell), [{ x: 27, y: 0 }, { x: 15, y: 6 }, { x: 0, y: 11 }]);
  agent.memory.search = route;
  assert.deepEqual(searchCells(ctx, agent), [{ x: 27, y: 0 }]);
  for (const w of route.route) {
    ctx.view.units.a0!.pos = { ...w.cell };
    agent.memory.search = reduceSearchProgress(ctx, agent, readSearchMemory(agent)!);
    assert.deepEqual(reduceSearchProgress(ctx, agent, readSearchMemory(agent)!), agent.memory.search);
  }
  ctx.view.units.a0!.pos = { x: 8, y: 3 };
  assert.deepEqual(searchCells(ctx, agent), [{ x: 8, y: 3 }]);
  assert.equal(readSearchMemory(agent)!.visited.length, 3);
  assert.deepEqual(agent.memory.unrelated, { keep: 7 });
  ctx.searchEnabled = false;
  assert.deepEqual(searchCells(ctx, agent), [ctx.view.units.a0!.pos]);
  ctx.searchEnabled = true;
  const copy = readSearchMemory(agent)!;
  copy.route[0]!.cell.x = 99;
  assert.equal(readSearchMemory(agent)!.route[0]!.cell.x, 27);
});

test("search：同次提交可連過感知內航點、離站不退", () => {
  const { ctx, agent } = setup(1);
  const memory = { version: 1 as const, route: [
    { id: "enemy", cell: { x: 1, y: 0 } }, { id: "center", cell: { x: 2, y: 0 } },
    { id: "home", cell: { x: 28, y: 11 } },
  ], visited: ["enemy", "enemy"] };
  const next = reduceSearchProgress(ctx, agent, memory);
  assert.deepEqual(next.visited, ["center", "enemy"]);
  ctx.view.units.a0!.pos = { x: 10, y: 5 };
  assert.deepEqual(reduceSearchProgress(ctx, agent, next), next);
  assert.deepEqual(memory.visited, ["enemy", "enemy"]);
});

test("search：友軍增減不改既有路線，隱藏敵位置與RNG不影響建構", () => {
  const { ctx, agent } = setup();
  agent.memory.search = buildSearchRoute(ctx, agent);
  const before = structuredClone(agent.memory);
  ctx.view.rt!.unitStatus.a1 = "dead";
  ctx.view.units.a2!.pos = { x: 20, y: 10 };
  assert.deepEqual(searchCells(ctx, agent), [readSearchMemory(agent)!.route[0]!.cell]);
  assert.deepEqual(agent.memory, before);
  ctx.s.units.newFriend = { ...structuredClone(ctx.s.units.a0!), id: "newFriend", pos: { x: 5, y: 5 } };
  ctx.s.rt!.unitStatus.newFriend = "active";
  assert.deepEqual(searchCells(ctx, agent), [readSearchMemory(agent)!.route[0]!.cell]);
  assert.deepEqual(agent.memory, before);
  const initial = buildSearchRoute(ctx, agent), rng = structuredClone(ctx.rng);
  ctx.s.units.hidden = { ...structuredClone(ctx.s.units.a0!), id: "hidden", owner: "red", pos: { x: 18, y: 3 } };
  ctx.s.rt!.unitStatus.hidden = "active";
  assert.deepEqual(buildSearchRoute(ctx, agent), initial);
  ctx.s.units.hidden!.pos = { x: 28, y: 8 };
  assert.deepEqual(buildSearchRoute(ctx, agent), initial);
  assert.deepEqual(ctx.rng, rng);
});

test("search：守區意圖、模式、固定策略與search=0禁搜，stance hold不禁搜", () => {
  const { ctx, agent } = setup();
  assert.equal(searchAllowed(ctx, agent, "tactical", {}), true);
  for (const intent of [2, 3, 4, 5, 8]) assert.equal(searchAllowed(ctx, agent, "tactical", { intent }), false);
  ctx.params.intent = 3;
  assert.equal(searchAllowed(ctx, agent, "tactical", {}), true);
  ctx.params.search = 0;
  assert.equal(searchAllowed(ctx, agent, "tactical", {}), false);
  ctx.params = {};
  for (const mode of ["gather", "regroup", "retreat"] as const) {
    ctx.assignment = { unit: agent.unit, stance: "attack", allowRetreat: false, intentMode: mode };
    assert.equal(searchAllowed(ctx, agent, "tactical", {}), false);
  }
  ctx.assignment = { unit: agent.unit, stance: "hold", allowRetreat: false };
  assert.equal(searchAllowed(ctx, agent, "tactical", {}), true);
  for (const policy of ["sentinel", "swarm", "regroup", "flee", "scripted"]) assert.equal(searchAllowed(ctx, agent, policy, {}), false);
  ctx.view.units.a0!.parts.legs!.broken = true;
  assert.equal(searchAllowed(ctx, agent, "tactical", {}), false);
});

test("search：可見優先lastSeen再搜索，TTL恢復，禁搜仍追情報", () => {
  const { ctx, agent } = setup(1);
  agent.memory.search = buildSearchRoute(ctx, agent);
  ctx.s.units.e = { ...structuredClone(ctx.s.units.a0!), id: "e", owner: "red", pos: { x: 2, y: 0 } };
  ctx.s.rt!.unitStatus.e = "active";
  ctx.know = updateKnowledge(ctx.q, ctx.s, ctx.slot, emptyKnowledge());
  ctx.view = maskedState(ctx.q, ctx.s, ctx.slot, ctx.know);
  assert.deepEqual(searchCells(ctx, agent), [{ x: 2, y: 0 }]);
  ctx.s.units.e!.pos = { x: 29, y: 11 };
  ctx.s.round = 3;
  ctx.know = updateKnowledge(ctx.q, ctx.s, ctx.slot, ctx.know);
  ctx.view = maskedState(ctx.q, ctx.s, ctx.slot, ctx.know);
  ctx.searchEnabled = false;
  assert.deepEqual(searchCells(ctx, agent), [{ x: 2, y: 0 }]);
  ctx.s.round = 4;
  ctx.know = updateKnowledge(ctx.q, ctx.s, ctx.slot, ctx.know);
  ctx.view = maskedState(ctx.q, ctx.s, ctx.slot, ctx.know);
  assert.deepEqual(knownPursuitCells(ctx, agent.unit), []);
  assert.deepEqual(pursuitCells(ctx, agent.unit), [ctx.view.units.a0!.pos]);
  ctx.searchEnabled = true;
  assert.deepEqual(searchCells(ctx, agent), [readSearchMemory(agent)!.route[0]!.cell]);
});

test("search：tactical/berserk候選與評分純讀、友傷目標阻止第三層", () => {
  for (const policy of ["tactical", "berserk"]) {
    const { ctx, agent } = setup(1);
    agent.policy = policy;
    agent.memory.search = buildSearchRoute(ctx, agent);
    const before = structuredClone({ agent });
    // q含函式，深比只取可序列化的決策輸入。
    const snapshot = () => JSON.stringify({ s: ctx.s, view: ctx.view, know: ctx.know, params: ctx.params,
      assignment: ctx.assignment, memory: agent.memory, rng: ctx.rng });
    const input = snapshot(), p = getPolicy(policy);
    const candidates = p.propose(ctx, agent);
    candidates.forEach(c => p.score(ctx, agent, c));
    assert.equal(snapshot(), input);
    assert.deepEqual(agent.memory, before.agent.memory);
  }
  const { ctx, agent } = setup(2);
  const original = ctx.q.abilitiesOf;
  ctx.q = { ...ctx.q, abilitiesOf: (s, id) => id === agent.unit ? ["stub:ability/mortar"] : original(s, id) };
  assert.equal(pursuitHostileOnly(ctx, agent, "berserk"), false);
  assert.deepEqual(knownPursuitCells(ctx, agent.unit, false), [ctx.view.units.a1!.pos]);
});
