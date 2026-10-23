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
import { injuryCandidates, resolveConductInjury, killPerson } from "./injury.ts";
import "./control.ts";

test("傷勢候選依傷害、層、永久旗標過濾", () => {
  const ctx = fixture();
  assert.equal(injuryCandidates(ctx, "kinetic", "cockpit-shell", false).length, 1);
  assert.equal(injuryCandidates(ctx, "kinetic", "flesh", false).length, 0);
  assert.equal(injuryCandidates(ctx, "kinetic", null, false).length, 0);
  assert.equal(injuryCandidates(ctx, "kinetic", "organ", true).length, 0);
});
test("conducted 扣人物 HP 並安裝暫時傷，沒有 HP 仍可受效果", () => {
  const ctx = fixture(); const from = person(ctx, "p").pools.hp!.cur;
  signal(ctx, "conducted", { unit: "u", person: "p", part: "torso", when: "layerHit", layerType: "cockpit-shell", damageType: "kinetic", amount: 20 });
  assert.equal(person(ctx, "p").pools.hp!.cur, from - 20 * ctx.db.rules.constants.conductDamageFactor!);
  assert.ok(person(ctx, "p").effects.some(e => e.effect === "base:effect/injury-concussion"));
  resolveConductInjury(ctx, "s", { damageType: "kinetic", layerType: "organ", amount: 20 });
  assert.equal(person(ctx, "s").pools.hp, undefined); assert.equal(person(ctx, "s").effects.length, 1);
});
test("重傷成功改抽永久列，缺永久列則保留暫時傷", () => {
  const ctx = fixture((defs, rules) => {
    rules.constants.permanentChance = 1;
    defs.effect!["base:effect/pp-permanent"] = { ...defs.effect!["base:effect/injury-concussion"]!, id: "base:effect/pp-permanent", clock: { kind: "permanent" }, tags: ["injury:permanent"] };
    rules.injuries.push({ effect: "base:effect/pp-permanent", damageTypes: ["kinetic"], layerTypes: ["organ"], weight: 1, permanent: true });
  });
  person(ctx, "p").attrsBase.resolve = -1000;
  resolveConductInjury(ctx, "p", { damageType: "kinetic", layerType: "organ", amount: 120 });
  assert.ok(person(ctx, "p").effects.some(e => e.effect === "base:effect/pp-permanent"));
  assert.equal(person(ctx, "p").morale, "shaken");
  const fallback = fixture((_, rules) => { rules.constants.permanentChance = 1; });
  resolveConductInjury(fallback, "p", { damageType: "kinetic", layerType: "organ", amount: 120 });
  assert.ok(person(fallback, "p").effects.some(e => e.effect === "base:effect/injury-concussion"));
});
test("DC-C10 HP 見底清座位、PersonDied 與接手且死亡冪等", () => {
  const ctx = fixture();
  resolveConductInjury(ctx, "p", { damageType: "kinetic", layerType: "organ", amount: 1000 });
  assert.equal(person(ctx, "p").seat, undefined); assert.equal(unit(ctx, "u").seats.pilot, null);
  assert.equal(unit(ctx, "u").controlMode, "disabled");
  killPerson(ctx, "p", "u");
  assert.equal(ctx.s.log.events.filter(e => e.type === "PersonDied").length, 1);
});
