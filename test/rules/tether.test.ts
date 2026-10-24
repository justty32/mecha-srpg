import test from "node:test";
import assert from "node:assert/strict";
import { loadPacks, readPackDir } from "../../src/content/loader.ts";
import { createBattle, partDefs, rt } from "../../src/rules/index.ts";
import { resolveAbility } from "../../src/rules/attack.ts";
import { runActions } from "../../src/rules/hooks.ts";
import type { SpeciesDef } from "../../src/core/types-def.ts";

function fixture(tether: "dieWithParent" | "freeOnParentDeath") {
  const pack = readPackDir("content/base");
  const species = pack.files["species/nestmother.json"] as SpeciesDef;
  species.behaviors!.spawner!.tether = tether;
  const { db, errors } = loadPacks([pack]);
  assert.deepEqual(errors, []);
  const s = createBattle(db, { id: "tether", map: { width: 8, height: 8, fill: "terrain/plain", exits: [] }, objectives: [], units: [
    { id: "mother", owner: "enemy", pos: { x: 4, y: 4 }, monster: { species: "species/nestmother", grade: "A" } },
    { id: "other", owner: "enemy", pos: { x: 7, y: 7 }, monster: { species: "species/mite", grade: "D" } },
  ] }, 1);
  const ctx = { db, s };
  for (let i = 0; i < 2; i++) runActions(ctx, [{ do: "spawn", species: "species/mite", grade: "D", at: "adjacent" }],
    { inst: null, self: { unit: "mother" }, source: "mother" });
  return ctx;
}
function die(ctx: ReturnType<typeof fixture>) {
  // 真攻擊結算讀到毀核後發 UnitDied；使用必中 self 能力消除命中骰變因。
  for (const p of partDefs(ctx, "mother").filter(p => p.functions.includes("core"))) ctx.s.units.mother!.parts[p.id]!.broken = true;
  const selfAbility = ctx.db.all("ability").find(a => a.target.kind === "self")!;
  resolveAbility(ctx, "mother", selfAbility.id, {});
}

test("spawn 記母體，dieWithParent 依固定順序發死亡事件且不波及無關單位", () => {
  const ctx = fixture("dieWithParent");
  assert.deepEqual(rt(ctx.s).spawnParents, { "mother-spawn-1": "mother", "mother-spawn-2": "mother" });
  const copy = { db: ctx.db, s: structuredClone(ctx.s) };
  die(ctx); die(copy);
  assert.deepEqual(ctx.s, copy.s);
  assert.deepEqual(ctx.s.log.events.filter(e => e.type === "UnitDied").map(e => e.payload.unit),
    ["mother", "mother-spawn-1", "mother-spawn-2"]);
  assert.equal(rt(ctx.s).unitStatus["mother-spawn-1"], "dead");
  assert.equal(rt(ctx.s).unitStatus["mother-spawn-2"], "dead");
  assert.equal(rt(ctx.s).unitStatus.other, "active");
});
test("freeOnParentDeath 母體死亡不殺子單位", () => {
  const ctx = fixture("freeOnParentDeath");
  die(ctx);
  assert.deepEqual(ctx.s.log.events.filter(e => e.type === "UnitDied").map(e => e.payload.unit), ["mother"]);
  assert.equal(rt(ctx.s).unitStatus["mother-spawn-1"], "active");
  assert.equal(rt(ctx.s).unitStatus["mother-spawn-2"], "active");
});
