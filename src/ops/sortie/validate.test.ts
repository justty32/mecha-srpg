import test from "node:test";
import assert from "node:assert/strict";
import { validateSortie } from "./validate.ts";
import { fixture } from "./test-support.ts";

test("validate 拒絕已死人員，且不修改狀態", () => {
  const { s, ctx, sortie, person } = fixture();
  assert.deepEqual(validateSortie(s, ctx, sortie), { ok: true });
  s.roster.dead.push({ person, day: s.clock.day, cause: "battle" });
  const before = structuredClone(s);
  assert.deepEqual(validateSortie(s, ctx, sortie), { ok: false, error: "person-dead" });
  assert.deepEqual(s, before);
});
test("validate 拒絕不在機庫的機甲", () => {
  const { s, ctx, sortie, mech } = fixture();
  s.hangar.bays = s.hangar.bays.map(id => id === mech ? null : id);
  const before = structuredClone(s);
  assert.deepEqual(validateSortie(s, ctx, sortie), { ok: false, error: "mech-not-in-hangar" });
  assert.deepEqual(s, before);
});
