import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createBattle } from "./flow.ts";
import { startBattle, beginTurn } from "./turn.ts";
import { tryCommand, previewCommand } from "./command.ts";
import { resolveAbility } from "./attack.ts";
import { inspectDefense } from "./defense.ts";
import { layerDefs, rt, unit, person } from "./state.ts";
import type { Ctx } from "./state.ts";
const { db, errors } = loadContentDirs(["content/base"]);
assert.deepEqual(errors, []);
function fixture(): Ctx {
  const s = createBattle(db, { id: "defense-test", map: { width: 5, height: 5, fill: "terrain/plain", exits: [] }, units: [
    { id: "defender", owner: "player", frame: "frame/moji-tern", pos: { x: 2, y: 2 },
      components: { "right-weapon": "component/mx-singing-blade", "left-weapon": "component/battlefield-shield" }, persons: [{ id: "pilot", def: "person/ren-kasai", seat: "pilot" }] },
    { id: "attacker", owner: "enemy", frame: "frame/moji-tern", pos: { x: 3, y: 2 }, core: false, crew: "remote" },
  ], objectives: [] }, 1);
  const ctx = { db, s }; startBattle(ctx); rt(s).active = "defender"; return ctx;
}
const hp = (ctx: Ctx, part: string) => unit(ctx, "defender").parts[part]!.layers.reduce((sum, l) => sum + l.hp, 0);
const guard = (ctx: Ctx, ability = "ability/mx-guard-stance") => tryCommand(ctx, { kind: "useAbility", actor: "defender", ability, target: { unit: "defender" } });
const shoot = (ctx: Ctx, ability = "ability/mx-radiant-shot") => resolveAbility(ctx, "attacker", ability, { unit: "defender", part: "torso" });

test("預付真盾兩次：Hit送盾臂、盾hp減，耗完後原軀幹才受傷", () => {
  const ctx = fixture(), torso = hp(ctx, "torso");
  const command = { kind: "useAbility" as const, actor: "defender", ability: "ability/mx-guard-stance", target: { unit: "defender" } };
  const before = structuredClone(ctx.s), preview = previewCommand(ctx, command);
  assert.equal(preview.result.ok, true); assert.deepEqual(ctx.s, before);
  assert.equal(guard(ctx).ok, true); assert.deepEqual(ctx.s, preview.state);
  assert.equal(person(ctx, "pilot").pools.ap!.cur, before.persons.pilot!.pools.ap!.cur - 3);
  const shield = layerDefs(ctx, "defender", "left-arm").findIndex(l => l.type === "shield");
  shoot(ctx);
  assert.ok(unit(ctx, "defender").parts["left-arm"]!.layers[shield]!.hp < 60);
  assert.equal(hp(ctx, "torso"), torso);
  assert.equal(unit(ctx, "defender").defense!.charges, 1);
  shoot(ctx); assert.equal(unit(ctx, "defender").defense, undefined);
  shoot(ctx); assert.ok(hp(ctx, "torso") < torso);
  assert.equal(ctx.s.log.events.filter(e => e.type === "AttackBlocked").length, 2);
});

test("破盾超額傷進臂甲，盾破立刻清準備，斷盾臂無資格不扣費", () => {
  const ctx = fixture(); assert.equal(guard(ctx).ok, true);
  const shield = layerDefs(ctx, "defender", "left-arm").findIndex(l => l.type === "shield");
  const arm = unit(ctx, "defender").parts["left-arm"]!, armor = arm.layers[shield + 1]!.hp;
  arm.layers[shield]!.hp = 1;
  shoot(ctx);
  assert.equal(arm.layers[shield]!.broken, true);
  assert.ok(arm.layers[shield + 1]!.hp < armor);
  assert.equal(unit(ctx, "defender").defense, undefined);
  arm.broken = true; unit(ctx, "defender").cooldowns = {};
  const before = structuredClone(ctx.s);
  assert.equal(guard(ctx).ok, false); assert.deepEqual(ctx.s, before);
});

test("有限招架只攔近戰實體並真傷武器臂，光束不耗招架", () => {
  const ctx = fixture(); assert.equal(guard(ctx, "ability/battlefield-parry").ok, true);
  const ranged = inspectDefense(ctx, "attacker", "ability/mx-radiant-shot", "defender")!;
  assert.equal(ranged.applies, false);
  shoot(ctx); assert.equal(unit(ctx, "defender").defense!.charges, 1);
  const melee = inspectDefense(ctx, "attacker", "ability/mx-singing-slash", "defender")!;
  assert.equal(melee.applies, true); assert.equal(melee.damageFactor, 0.5);
  const arm = hp(ctx, "right-arm"), torso = hp(ctx, "torso");
  shoot(ctx, "ability/mx-singing-slash");
  assert.ok(hp(ctx, "right-arm") < arm); assert.equal(hp(ctx, "torso"), torso);
  assert.equal(unit(ctx, "defender").defense, undefined);
  assert.equal(ctx.s.log.events.filter(e => e.type === "AttackParried").length, 1);
});

test("過載照傷原部位、清準備並失衡；新自身回合準備失效", () => {
  const ctx = fixture(); assert.equal(guard(ctx).ok, true);
  const ability = { ...db.require("ability", "ability/mx-radiant-shot"), packets: [{ type: "energy", amount: 100 }] };
  ctx.db = { ...db, require: ((kind: string, id: string) => kind === "ability" && [ability.id, "ability/mx-radiant-shot"].includes(id) ? ability : db.require(kind as "frame", id)) as typeof db.require };
  const torso = hp(ctx, "torso"); shoot(ctx);
  assert.ok(hp(ctx, "torso") < torso); assert.equal(unit(ctx, "defender").defense, undefined);
  assert.ok(unit(ctx, "defender").effects.some(e => e.effect.endsWith("effect/battlefield-off-balance")));
  const fresh = fixture(); assert.equal(guard(fresh).ok, true);
  beginTurn(fresh, "defender", false); assert.equal(unit(fresh, "defender").defense, undefined);
});

test("spread只攔主片，旁波真傷頭，整招多packet只耗一次準備", () => {
  const ctx = fixture(); assert.equal(guard(ctx).ok, true);
  const baseAbility = db.require("ability", "ability/mx-radiant-shot");
  const ability = { ...baseAbility, partPattern: { kind: "spread" as const, fractions: [0.5, 0.25, 0.25], selection: "exposed" as const }, packets: [{ type: "energy", amount: 40 }, { type: "energy", amount: 20 }] };
  ctx.db = { ...db, require: ((kind: string, id: string) => kind === "ability" && [ability.id, "ability/mx-radiant-shot"].includes(id) ? ability : db.require(kind as "frame", id)) as typeof db.require };
  const head = hp(ctx, "head"), torso = hp(ctx, "torso"); shoot(ctx);
  assert.ok(hp(ctx, "head") < head); assert.equal(hp(ctx, "torso"), torso);
  assert.equal(unit(ctx, "defender").defense!.charges, 1);
  assert.equal(ctx.s.log.events.filter(e => e.type === "AttackBlocked").length, 1);
});
