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
import { resonanceScore, refreshResonance, burdenOf, burdenTick, goBerserk, recoverBerserk } from "./will.ts";
import { makeUnit } from "./state.ts";
import { setControl } from "./control.ts";

function withBurden(defs: Defs): void {
  defs.person!["base:person/ren-kasai"]!.pools.push({ id: "burden", name: "承擔", min: 0, max: 100, capKind: "soft", inverted: true, initial: 0, regen: 0, bands: [] });
}
test("DN-W-02 DN-W-03 共鳴依信念與 affinity 算分並刷新", () => {
  const ctx = fixture(defs => {
    defs.person!["base:person/ren-kasai"]!.will.resonanceAffinity = { revenge: 0.5 };
    defs.frame!["base:frame/hound-mk2"]!.resonance = { beliefs: ["revenge", "unknown"], threshold: 0.5 };
  });
  assert.equal(resonanceScore(ctx, "p", { beliefs: ["revenge", "unknown"], threshold: 0 }), 0.75);
  assert.equal(resonanceScore(ctx, "p", { beliefs: [], threshold: 0 }), 1);
  signal(ctx, "turnStartPre", { unit: "u" }); refreshResonance(ctx, "u");
  assert.equal(person(ctx, "p").will.resonance[unit(ctx, "u").frame], 0.75);
});
test("DN-W-04 DN-W-09 機械框架也累加異系部件，毀損部件略過", () => {
  const ctx = fixture(defs => { withBurden(defs); defs.component!["base:component/autocannon-30"]!.burden = 7; });
  makeUnit(ctx, { id: "mixed", frame: "base:frame/hound-mk2", owner: "player", pos: { x: 3, y: 1 }, components: { "left-weapon": "base:component/autocannon-30" }, persons: [{ id: "mixed-p", def: "base:person/ren-kasai", seat: "pilot" }] });
  assert.equal(burdenOf(ctx, "mixed"), 7); burdenTick(ctx, "mixed");
  assert.equal(person(ctx, "mixed-p").will.burden, 7);
  unit(ctx, "mixed").parts["left-arm"]!.layers.at(-1)!.broken = true;
  assert.equal(burdenOf(ctx, "mixed"), 0);
});
test("DN-W-05 DN-W-06 硬上限失控並精確還原 owner 與 shared 模式", () => {
  const ctx = fixture(withBurden); setControl(ctx, "u", "shared", "test");
  person(ctx, "p").pools.burden!.cur = 150;
  signal(ctx, "turnStartPost", { unit: "u", resumed: false });
  assert.equal(unit(ctx, "u").owner, "berserk"); assert.equal(unit(ctx, "u").controlMode, "berserk");
  assert.equal(person(ctx, "p").will.burden, 150);
  goBerserk(ctx, "u"); assert.equal(rt(ctx.s).berserkFrom.u, "player");
  person(ctx, "p").pools.burden!.cur = 0; burdenTick(ctx, "u");
  assert.equal(unit(ctx, "u").owner, "player"); assert.equal(unit(ctx, "u").controlMode, "shared");
  recoverBerserk(ctx, "u"); assert.equal(rt(ctx.s).berserkFrom.u, undefined);
});
test("承擔軟上限檢定、成功回穩與無承擔池略過", () => {
  const ctx = fixture(withBurden); person(ctx, "p").pools.burden!.cur = 110; person(ctx, "p").attrsBase.resolve = -1000;
  burdenTick(ctx, "u"); assert.equal(unit(ctx, "u").controlMode, "berserk");
  person(ctx, "p").attrsBase.resolve = 1000; burdenTick(ctx, "u"); assert.equal(unit(ctx, "u").owner, "player");
  const noPool = fixture(); const before = structuredClone(noPool.s);
  burdenTick(noPool, "u"); assert.deepEqual(noPool.s, before);
});
