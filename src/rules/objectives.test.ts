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
import { objectiveDone, evaluateObjectives } from "./objectives.ts";

test("目標依宣告序決定且 BattleEnd 只寫一次，預設排除 berserk 與非 active", () => {
  const ctx = fixture(); rt(ctx.s).objectives = [
    { kind: "killTarget", params: { unit: "v" }, for: "player", onComplete: "continue" },
    { kind: "eliminate", params: { slots: ["enemy"] }, for: "player", onComplete: "win" }];
  rt(ctx.s).unitStatus.v = "dead";
  signal(ctx, "unitDied", { unit: "v", killer: "u" });
  assert.deepEqual(evaluateObjectives(ctx, true), { winner: "player", reason: "eliminate" });
  assert.equal(ctx.s.log.events.filter(e => e.type === "BattleEnd").length, 1);
  const defaults = fixture(); unit(defaults, "v").owner = "berserk";
  assert.deepEqual(evaluateObjectives(defaults, false), { winner: "player", reason: "eliminate" });
});
test("survive 只在輪末判定，hold／escort 永不完成，達上限 timeout", () => {
  const ctx = fixture(); rt(ctx.s).objectives = [{ kind: "survive", params: { rounds: 2 }, for: "player", onComplete: "win" }];
  ctx.s.round = 2; assert.equal(evaluateObjectives(ctx, false), null);
  signal(ctx, "roundEnd", { round: 2 }); assert.equal(rt(ctx.s).outcome!.winner, "player");
  const timeout = fixture(); timeout.s.round = 3; rt(timeout.s).maxRounds = 3;
  rt(timeout.s).objectives = [{ kind: "hold", params: {}, for: "player", onComplete: "win" }, { kind: "escort", params: {}, for: "player", onComplete: "win" }];
  assert.equal(objectiveDone(timeout, rt(timeout.s).objectives[0]!), false);
  assert.equal(evaluateObjectives(timeout, false), null);
  assert.deepEqual(evaluateObjectives(timeout, true), { winner: null, reason: "timeout" });
});
test("reachExit、capture、killTarget 與 lose 結算", () => {
  const ctx = fixture();
  const objective = { kind: "reachExit" as const, params: { unit: "u" }, for: "player", onComplete: "win" as const };
  assert.equal(objectiveDone(ctx, objective), false); unit(ctx, "u").pos = { x: 0, y: 0 }; assert.equal(objectiveDone(ctx, objective), true);
  rt(ctx.s).unitStatus.v = "captured"; unit(ctx, "v").owner = "player";
  assert.equal(objectiveDone(ctx, { ...objective, kind: "capture", params: { unit: "v" } }), true);
  rt(ctx.s).unitStatus.v = "dead"; assert.equal(objectiveDone(ctx, { ...objective, kind: "killTarget", params: { unit: "v" } }), true);
  rt(ctx.s).unitStatus.v = "active"; unit(ctx, "v").owner = "enemy";
  rt(ctx.s).objectives = [{ ...objective, onComplete: "lose" }];
  assert.deepEqual(evaluateObjectives(ctx, false), { winner: "enemy", reason: "reachExit" });
});
