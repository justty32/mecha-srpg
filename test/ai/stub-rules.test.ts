import test from "node:test";
import assert from "node:assert/strict";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";

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
