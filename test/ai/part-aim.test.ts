import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import type { AbilityDef } from "../../src/core/types-def.ts";
import { createRng } from "../../src/core/rng.ts";
import { createContentDB } from "../../src/content/contentdb.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createBattle } from "../../src/rules/index.ts";
import { createRulesQuery } from "../../src/ai/adapters/rules-adapter.ts";
import { createAgent, emptyKnowledge, previewOutcome, scoreCandidate, selectCandidate } from "../../src/ai/index.ts";
import type { AiCtx, Candidate } from "../../src/ai/index.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";

const base = loadContentDirs(["content/base"]).db;
const agent = createAgent("a", "tactical");
function context(allowed = true, smallCore = false): AiCtx {
  const ability: AbilityDef = { id: "base:ability/aim-test", name: "測試瞄準", mode: "activated",
    costs: [], produces: [], require: [], effects: [], tags: [], accuracy: 30,
    target: { kind: "unit", range: { min: 1, max: 6 }, los: false, friendly: "no" },
    packets: [{ type: "kinetic", amount: 21 }], ai: { tactics: { attack: 1 } },
    ...(allowed ? { partAim: { allowed: true, penalty: 10 } } : {}),
    ...(smallCore ? { aim: { dispersion: .5, trackingDelay: 0, projectileSpeed: 20 } } : {}) };
  const defs = Object.fromEntries(CONTENT_KINDS.map(k => [k, Object.fromEntries(base.all(k).map(d => [d.id, d]))]));
  const frame = structuredClone(base.require("frame", "frame/hound-mk2"));
  frame.innateAbilities = [ability.id];
  defs.frame![frame.id] = frame; defs.ability![ability.id] = ability;
  if (smallCore) {
    const body = structuredClone(base.require("bodyplan", base.require("species", "species/nestmother").bodyPlan));
    body.targetRadius = 1;
    body.parts.find(part => part.id === "core-belly")!.targetRadius = .001;
    defs.bodyplan![body.id] = body;
  }
  const db = createContentDB([...base.packs], base.registries, base.rules, defs);
  const s = createBattle(db, { id: "aim-test", map: { width: 8, height: 6, fill: "terrain/plain", exits: [] },
    objectives: [], maxRounds: 20, units: [
      { id: "a", owner: "player", frame: frame.id, pos: { x: 1, y: 3 }, persons: [{ id: "pa", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "b", owner: "enemy", monster: { species: "species/nestmother", grade: "A", def: "monster/nestmother-landlord" }, pos: { x: 3, y: 3 } },
    ] }, 1);
  s.rt!.active = "a";
  const q = createRulesQuery(db), original = q.abilitiesOf;
  q.abilitiesOf = (view, id) => id === "a" ? [ability.id] : original(view, id);
  return { s, view: s, q, slot: "player", know: emptyKnowledge(), danger: {}, assignment: null,
    params: { maxMoves: 0, objMoves: 0 }, rng: createRng(1, 101) };
}
const aim = (part?: string): Candidate => ({ cmd: { kind: "useAbility", actor: "a", ability: "base:ability/aim-test",
  target: { unit: "b", ...(part ? { part } : {}) } } });
const choose = (ctx: AiCtx): Candidate | null => selectCandidate(ctx.rng,
  proposeTactical(ctx, agent).map(c => ({ c, score: scoreCandidate(ctx, agent, c) })), 1);

test("partAim 不需 targetPref 即產生合法核心候選，保留不瞄候選並略過毀損核心", () => {
  const ctx = context(), candidates = proposeTactical(ctx, agent);
  assert.ok(candidates.some(c => JSON.stringify(c) === JSON.stringify(aim("core-belly"))));
  assert.ok(candidates.some(c => JSON.stringify(c) === JSON.stringify(aim())));
  assert.equal(ctx.q.checkAbility(ctx.view, "a", "base:ability/aim-test", { unit: "b", part: "core-belly" }), null);
  ctx.view.units.b!.parts["core-belly"]!.broken = true;
  assert.ok(proposeTactical(ctx, agent).every(c => c.cmd.kind !== "useAbility" || !c.cmd.target?.part));
});

test("核心快破選瞄核心；核心進度權重可覆寫且小核心幾何低命中會選不瞄", () => {
  const ctx = context();
  // 巢母另有spawner目標分下限；此案隔離核心進度權重，避免下限令瞄準／不瞄變同分。
  ctx.params.objSpawner = 0;
  // 不進入本發即死的情況，避免舊有 killed bonus 掩蓋剩餘核心 HP 的估值缺口。
  for (const layer of ctx.view.units.b!.parts["core-belly"]!.layers) layer.hp = 20;
  assert.ok(!previewOutcome(ctx.q, ctx.view, aim("core-belly").cmd).killed.includes("b"), "核心進度測試不得混入單發擊殺獎勵");
  assert.ok((previewOutcome(ctx.q, ctx.view, aim().cmd).damage.b ?? 0) > 0, "不瞄準必須有實際正傷害");
  assert.deepEqual(choose(ctx), aim("core-belly"));
  const before = scoreCandidate(ctx, agent, aim("core-belly"));
  ctx.params.partAimProgress = 0;
  assert.ok(scoreCandidate(ctx, agent, aim("core-belly")) < before);
  assert.ok(scoreCandidate(ctx, agent, aim()) > scoreCandidate(ctx, agent, aim("core-belly")), "關閉核心進度後，不瞄準必須嚴格勝出而非同分抽樣");
  assert.deepEqual(choose(ctx), aim());
  const costly = context(true, true);
  assert.ok(costly.q.hitChance(costly.view, "a", "base:ability/aim-test", "b", "core-belly") < 1);
  assert.ok(costly.q.hitChance(costly.view, "a", "base:ability/aim-test", "b", "core-belly")
    < costly.q.hitChance(costly.view, "a", "base:ability/aim-test", "b"));
  assert.deepEqual(choose(costly), aim());
});

test("無 partAim 能力不提出任何部位候選（即使合法性 stub 放行）", () => {
  const ctx = context(false);
  // 特意不靠規則的 bad-part 過濾：證明候選產生器本身有守 allowed。
  ctx.q.checkAbility = () => null;
  const candidates = proposeTactical(ctx, agent);
  assert.ok(candidates.some(c => c.cmd.kind === "useAbility"));
  assert.ok(candidates.every(c => c.cmd.kind !== "useAbility" || !c.cmd.target?.part));
});
