import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../world/test-support.ts";
import { applyCommand } from "./commands.ts";
test("被拒指令連同 runner 的部分改動全部回滾", () => {
  const { s, ctx } = fixture(), before = structuredClone(s);
  const denied = applyCommand(s, ctx.db, ctx.world, { v: "sail", to: "missing" });
  assert.equal(denied.result.ok, false); assert.deepEqual(denied.state, before); assert.deepEqual(denied.events, []);
  const partial = applyCommand(s, ctx.db, ctx.world, { v: "sortie", sortie: {} }, { battle(state, context) {
    state.flags.bad = 1; context.emit("Bad"); return { ok: false, error: "denied" };
  } });
  assert.deepEqual(partial.state, before); assert.deepEqual(partial.events, []); assert.deepEqual(s, before);
});
test("sortie 未注入 battle 回 no-battle-runner", () => {
  const { s, ctx } = fixture();
  const result = applyCommand(s, ctx.db, ctx.world, { v: "sortie", sortie: {} });
  assert.deepEqual(result.result, { ok: false, error: "no-battle-runner" }); assert.deepEqual(result.state, s);
});
