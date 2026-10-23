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
import { MORALE_STAGES, moraleCheck, moraleEvent, setMorale } from "./morale.ts";
import { runActions } from "./hooks.ts";

test("DN-M-02 士氣階段只替換自己來源的效果", () => {
  const ctx = fixture();
  assert.deepEqual(MORALE_STAGES, ["steady", "shaken", "breaking", "fleeing"]);
  setMorale(ctx, "p", "shaken"); setMorale(ctx, "p", "breaking");
  assert.equal(person(ctx, "p").effects.length, 1);
  assert.equal(person(ctx, "p").effects[0]!.effect, "rtest:effect/morale-breaking");
  const n = ctx.s.log.events.length; setMorale(ctx, "p", "breaking"); assert.equal(ctx.s.log.events.length, n);
  setMorale(ctx, "p", "steady"); assert.equal(person(ctx, "p").effects.length, 0);
});
test("DN-M-04 失敗逐階下降，逃跑不再越界", () => {
  const ctx = fixture(); person(ctx, "p").attrsBase.resolve = 0;
  for (let i = 0; i < 5; i++) assert.equal(moraleCheck(ctx, "p", 100, "test"), false);
  assert.equal(person(ctx, "p").morale, "fleeing");
  assert.equal(ctx.s.log.events.filter(e => e.type === "MoraleChanged").length, 3);
});
test("連續成功回穩且失敗清除 streak", () => {
  const ctx = fixture(); setMorale(ctx, "p", "breaking");
  assert.equal(moraleCheck(ctx, "p", -1000, "success"), true);
  moraleCheck(ctx, "p", 1000, "failure"); assert.equal(rt(ctx.s).moraleStreak.p, 0);
  for (let i = 0; i < ctx.db.rules.constants.moraleRecoverStreak!; i++) moraleCheck(ctx, "p", -1000, "success");
  assert.equal(person(ctx, "p").morale, "breaking"); assert.equal(rt(ctx.s).moraleStreak.p, 0);
});
test("士氣表按 tags、immuneTags、when 過濾並支援 moraleCheck 動詞", () => {
  const ctx = fixture((_, rules) => { rules.moraleEvents = [{ id: "fear", event: "fear", personTags: ["soul"], immuneTags: ["immune"], when: { tag: "soul" }, dc: 1000 }]; });
  moraleEvent(ctx, "fear", ["p", "s", "s"]);
  assert.equal(person(ctx, "p").morale, "steady"); assert.equal(person(ctx, "s").morale, "shaken");
  runActions(ctx, [{ do: "moraleCheck", dc: 1000 }], { inst: null, self: { person: "p" }, source: "test" });
  assert.equal(person(ctx, "p").morale, "shaken");
});
test("部位毀損與友軍死亡只影響適用的座位人物", () => {
  const ctx = fixture(); person(ctx, "p").attrsBase.resolve = -1000; person(ctx, "s").attrsBase.resolve = -1000;
  signal(ctx, "partBroken", { unit: "u", part: "legs", attacker: "v" });
  assert.equal(person(ctx, "p").morale, "shaken");
  unit(ctx, "v").owner = "player"; rt(ctx.s).unitStatus.v = "dead";
  signal(ctx, "unitDied", { unit: "v", killer: null });
  assert.equal(person(ctx, "p").morale, "breaking"); assert.equal(person(ctx, "q").morale, "steady");
});
