import test from "node:test";
import assert from "node:assert/strict";
import { createRng, d100 } from "../../src/core/rng.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

test("stub reachable：牆與單位擋路，AP 限制八方向 BFS", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 5, height: 1, walls: [{ x: 2, y: 0 }], units: [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: [], ap: 4 },
    { id: "b", owner: "e", pos: { x: 4, y: 0 }, abilities: [] },
  ] }, 1);
  assert.deepEqual(q.reachable(s, "a"), { "1,0": 1 });
  assert.equal(q.pathTo(s, "a", { x: 3, y: 0 }), null);
  s.units.b!.pos = { x: 1, y: 0 };
  assert.deepEqual(q.reachable(s, "a"), {});
  const open = makeStubBattle({ width: 4, height: 4, units: [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: [], ap: 1 },
  ] }, 1);
  assert.deepEqual(q.reachable(open, "a"), { "0,1": 1, "1,0": 1, "1,1": 1 });
});

test("stub 命中：由外往內扣層，核心全毀死亡並寫事件", () => {
  const { q, exec } = createStubRules();
  const s = makeStubBattle({ width: 2, height: 1, units: [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: ["stub:ability/claw"] },
    { id: "b", owner: "e", pos: { x: 1, y: 0 }, abilities: [], parts: [
      { id: "core", functions: ["core"], layers: [{ type: "armor", hp: 10 }, { type: "structure", hp: 20 }] },
    ] },
  ] }, 1);
  let seed = 0;
  while (d100(createRng(seed)) >= q.hitChance(s, "a", "stub:ability/claw", "b")) seed++;
  s.rng = createRng(seed);
  const cmd = { kind: "useAbility", actor: "a", ability: "stub:ability/claw", target: { unit: "b" } } as const;
  const first = exec(s, cmd);
  assert.equal(first.ok, true);
  assert.deepEqual(s.units.b!.parts.core!.layers, [{ hp: 0, broken: true }, { hp: 5, broken: false }]);
  assert.equal(q.isActive(s, "b"), true);
  s.rng = createRng(seed);
  const second = exec(s, cmd);
  assert.equal(second.ok, true);
  assert.equal(q.isActive(s, "b"), false);
  assert.equal(s.units.b!.parts.core!.broken, true);
  assert.deepEqual(s.log.events.filter(e => e.type === "LayerDamaged").map(e => e.payload.amount), [10, 15, 5]);
  assert.equal(s.log.events.filter(e => e.type === "UnitDied").length, 1);
});

test("stub previewCommand 不改原狀態，合法性依成本、射程、LOS、陣營檢查", () => {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 5, height: 2, walls: [{ x: 1, y: 0 }], units: [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle", "stub:ability/repair"] },
    { id: "b", owner: "e", pos: { x: 2, y: 0 }, abilities: [] },
  ] }, 42);
  assert.equal(q.checkAbility(s, "a", "stub:ability/rifle", { unit: "b" })?.code, "no-los");
  assert.equal(q.checkAbility(s, "a", "stub:ability/repair", { unit: "b" })?.code, "bad-target");
  assert.equal(q.checkAbility(s, "a", "stub:ability/repair", { unit: "a" }), null);
  const before = structuredClone(s);
  const preview = q.previewCommand(s, { kind: "move", actor: "a", path: [{ x: 1, y: 1 }] });
  assert.equal(preview.result.ok, true);
  assert.deepEqual(s, before);
  assert.deepEqual(preview.state.units.a!.pos, { x: 1, y: 1 });
  assert.equal(preview.state.units.a!.pools.ap!.cur, 3);
  const shotBefore = structuredClone(preview.state);
  assert.equal(q.previewCommand(preview.state, { kind: "useAbility", actor: "a", ability: "stub:ability/rifle", target: { unit: "b" } }).result.ok, true);
  assert.deepEqual(preview.state, shotBefore);
});

test("stub retreat 只在 exit 合法，startRound 只回復 active 的 AP", () => {
  const { q, exec, startRound } = createStubRules();
  const s = makeStubBattle({ width: 2, height: 1, exits: [{ x: 1, y: 0 }], units: [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: [] },
  ] }, 1);
  assert.deepEqual(exec(s, { kind: "retreat", actor: "a" }), { ok: false, rejection: { code: "not-at-exit" } });
  assert.equal(exec(s, { kind: "end", actor: "a" }).ok, true);
  startRound(s);
  assert.equal(s.round, 1);
  assert.equal(s.units.a!.pools.ap!.cur, 4);
  assert.equal(exec(s, { kind: "move", actor: "a", path: [{ x: 1, y: 0 }] }).ok, true);
  assert.equal(exec(s, { kind: "retreat", actor: "a" }).ok, true);
  assert.equal(q.isActive(s, "a"), false);
  startRound(s);
  assert.equal(s.units.a!.pools.ap!.cur, 3);
  assert.equal(s.log.events.at(-1)?.type, "Retreated");
});
