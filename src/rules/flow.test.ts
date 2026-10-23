import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createContentDB } from "../content/contentdb.ts";
import type { RulesTables } from "../content/contentdb.ts";
import { CONTENT_KINDS } from "../core/ids.ts";
import { createBattle } from "./flow.ts";
import { person, unit, rt } from "./state.ts";
import type { Ctx } from "./state.ts";
import { signal } from "./hooks.ts";

type Defs = Parameters<typeof createContentDB>[3];
const base = loadContentDirs(["content/base", "test/scenarios/pack"]).db;
function fixture(edit?: (defs: Defs, rules: RulesTables) => void): Ctx {
  const defs = structuredClone(Object.fromEntries(CONTENT_KINDS.map(kind => [kind, Object.fromEntries(base.all(kind).map(d => [d.id, d]))]))) as Defs;
  const rules = structuredClone(base.rules);
  for (const stage of ["shaken", "breaking", "fleeing"]) {
    defs.effect![`rtest:effect/morale-${stage}`] = { id: `rtest:effect/morale-${stage}`, name: stage, scope: "person",
      clock: { kind: "permanent" }, stack: { policy: "refresh" }, contribs: [], hooks: {}, tags: ["morale"], ui: { badge: stage } };
  }
  edit?.(defs, rules);
  const db = createContentDB([...base.packs], base.registries, rules, defs);
  return { db, s: createBattle(db, { id: "people-unit", map: { width: 5, height: 5, fill: "terrain/plain", exits: [{ x: 0, y: 0 }] },
    units: [{ id: "u", owner: "player", frame: "base:frame/hound-mk2", pos: { x: 1, y: 1 },
      persons: [{ id: "p", def: "base:person/ren-kasai", seat: "pilot" }, { id: "s", def: "base:person/unit-07", seat: "soul" }] },
      { id: "v", owner: "enemy", frame: "base:frame/hound-mk2", pos: { x: 4, y: 4 }, persons: [{ id: "q", def: "base:person/ren-kasai", seat: "pilot" }] }],
    objectives: [] }, 42) };
}
import { battleResult, canCapture, capture, eject, retreat } from "./flow.ts";
import { commandHandler, runActions } from "./hooks.ts";
import { makeUnit } from "./state.ts";
import { hashLog } from "../core/eventlog.ts";

function infantry(defs: Defs): void {
  defs.frame!["rtest:frame/infantry"] = { ...defs.frame!["base:frame/hound-mk2"]!, id: "rtest:frame/infantry", bodyPlan: "rtest:bodyplan/infantry", pools: [] };
  defs.bodyplan!["rtest:bodyplan/infantry"] = { id: "rtest:bodyplan/infantry", parts: [{
    ...defs.bodyplan!["base:bodyplan/biped-light"]!.parts[0]!, id: "body", seats: [{ id: "pilot", accepts: ["pilot"] }, { id: "soul", accepts: ["soul"] }], slots: [] }] };
}
test("PW-07 createBattle 複製部署、零回合零事件、初始化陣營", () => {
  const ctx = fixture(); assert.equal(ctx.s.round, 0); assert.equal(ctx.s.log.events.length, 0);
  assert.deepEqual(ctx.s.order, ["u", "v"]); assert.deepEqual(Object.keys(ctx.s.factions), ["enemy", "player"]);
  assert.equal(battleResult(ctx), null);
  const setup = { id: "copy", map: { width: 2, height: 2, fill: "terrain/plain", exits: [{ x: 0, y: 0 }] }, units: [], objectives: [], maxRounds: 3 };
  const s = createBattle(ctx.db, setup, 42); setup.map.exits[0]!.x = 1;
  assert.equal(rt(s).exits[0]!.x, 0); assert.equal(rt(s).maxRounds, 3);
});
test("DC-T07 棄機拒絕不改狀態，成功搬人物保留池並排隊尾", () => {
  const ctx = fixture(infantry); person(ctx, "p").pools.ap!.cur = 0;
  const before = structuredClone(ctx.s); assert.equal(eject(ctx, "u")?.code, "cannot-pay"); assert.deepEqual(ctx.s, before);
  person(ctx, "p").pools.ap!.cur = 9;
  assert.equal(commandHandler("eject")!(ctx, { kind: "eject", actor: "u" }), null);
  assert.equal(rt(ctx.s).unitStatus.u, "derelict"); assert.equal(unit(ctx, "u").controlMode, "none");
  assert.deepEqual(unit(ctx, "u-inf").pos, { x: 1, y: 0 });
  assert.equal(person(ctx, "p").pools.ap!.cur, 9 - ctx.db.rules.constants.ejectApCost!);
  assert.equal(person(ctx, "s").seat!.mech, "u-inf"); assert.equal(ctx.s.order.at(-1), "u-inf");
  assert.deepEqual(ctx.s.log.events.find(e => e.type === "Ejected")!.payload, { unit: "u", infantry: "u-inf", persons: ["p", "s"] });
});
test("PW-15 撤離限制與戰後狀態保留，不補血也不修改 live 狀態", () => {
  const ctx = fixture(); const before = structuredClone(ctx.s);
  assert.equal(retreat(ctx, "u")?.code, "not-at-exit"); assert.deepEqual(ctx.s, before);
  unit(ctx, "u").pos = { x: 0, y: 0 }; rt(ctx.s).noRetreat = true;
  assert.equal(retreat(ctx, "u")?.code, "no-retreat"); rt(ctx.s).noRetreat = false;
  person(ctx, "p").pools.hp!.cur = 23;
  assert.equal(commandHandler("retreat")!(ctx, { kind: "retreat", actor: "u" }), null);
  rt(ctx.s).outcome = { winner: "enemy", reason: "eliminate" };
  const result = battleResult(ctx)!;
  assert.equal(result.units.find(u => u.id === "u")!.status, "retreated");
  assert.equal(result.persons.find(p => p.id === "p")!.state.pools.hp!.cur, 23);
  assert.equal(result.log.hash, hashLog(ctx.s.log));
  result.persons.find(p => p.id === "p")!.state.pools.hp!.cur = 60;
  assert.equal(person(ctx, "p").pools.hp!.cur, 23);
});
test("捕捉需核完整與全行動部位毀損，命中 capture 後保留 HP，spawn 入隊", () => {
  const ctx = fixture();
  makeUnit(ctx, { id: "wolf", owner: "enemy", monster: { species: "base:species/tidewolf", grade: "C" }, pos: { x: 2, y: 1 } });
  assert.equal(canCapture(ctx, "wolf"), false);
  for (const id of ["front-left", "front-right", "rear-left", "rear-right"]) unit(ctx, "wolf").parts[id]!.broken = true;
  assert.equal(canCapture(ctx, "wolf"), true);
  unit(ctx, "wolf").parts.core!.broken = true; assert.equal(canCapture(ctx, "wolf"), false); unit(ctx, "wolf").parts.core!.broken = false;
  const hp = unit(ctx, "wolf").parts.core!.layers[0]!.hp;
  signal(ctx, "abilityResolved", { actor: "u", target: "wolf", ability: "base:ability/restrain", hit: false });
  assert.equal(rt(ctx.s).unitStatus.wolf, "active");
  signal(ctx, "abilityResolved", { actor: "u", target: "wolf", ability: "base:ability/restrain", hit: true });
  assert.equal(rt(ctx.s).unitStatus.wolf, "captured"); assert.equal(rt(ctx.s).monsters.wolf, undefined);
  assert.equal(unit(ctx, "wolf").owner, "player"); assert.equal(unit(ctx, "wolf").parts.core!.layers[0]!.hp, hp);
  capture(ctx, "u", "wolf"); assert.equal(ctx.s.log.events.filter(e => e.type === "Captured").length, 1);
  runActions(ctx, [{ do: "spawn", species: "base:species/tidewolf", grade: "D", at: "adjacent" }], { inst: null, self: { unit: "u" }, source: "test" });
  assert.equal(ctx.s.order.at(-1), "u-spawn-1"); assert.deepEqual(unit(ctx, "u-spawn-1").pos, { x: 1, y: 0 });
});
