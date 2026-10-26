import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import type { AbilityDef, EffectDef } from "../../src/core/types-def.ts";
import { createRng } from "../../src/core/rng.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createContentDB } from "../../src/content/contentdb.ts";
import { createBattle, applyEffect, removeEffect } from "../../src/rules/index.ts";
import { createRulesQuery, createRulesExec } from "../../src/ai/adapters/rules-adapter.ts";
import { createAgent, emptyKnowledge, getPolicy, selectCandidate, takeTurn, updateKnowledge } from "../../src/ai/index.ts";
import type { AiCtx, Agent, Candidate } from "../../src/ai/policy.ts";
import { scoreCandidate } from "../../src/ai/score.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";
import { rememberSupport } from "../../src/ai/support.ts";

const base = loadContentDirs(["content/base"]).db;
const guard = "base:ability/kx-shield-raise", dodge = "base:ability/kx-surf-runner-skip";
const relief = "base:ability/m2-relieve-ally", rise = "base:ability/kx-storm-mane-rise";
function context(ids: string[] = [guard], extra: { abilities?: AbilityDef[]; effects?: EffectDef[]; monster?: boolean } = {}) {
  const defs = Object.fromEntries(CONTENT_KINDS.map(k => [k, Object.fromEntries(base.all(k).map(d => [d.id, d]))]));
  for (const a of extra.abilities ?? []) defs.ability![a.id] = a;
  for (const e of extra.effects ?? []) defs.effect![e.id] = e;
  const frame = structuredClone(base.require("frame", "frame/hound-mk2"));
  frame.innateAbilities = ids;
  defs.frame![frame.id] = frame;
  const db = createContentDB([...base.packs], base.registries, base.rules, defs);
  const s = createBattle(db, { id: "support", map: { width: 16, height: 8, fill: "terrain/plain", exits: [] }, objectives: [], maxRounds: 10,
    units: [
      extra.monster ? { id: "a", owner: "player", monster: { species: "species/storm-mane", grade: "A" }, pos: { x: 2, y: 3 } }
        : { id: "a", owner: "player", frame: frame.id, pos: { x: 2, y: 3 }, persons: [{ id: "pa", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "ally", owner: "player", frame: "frame/bulwark-i", pos: { x: 3, y: 3 }, persons: [{ id: "pc", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "enemy", owner: "enemy", frame: "frame/bulwark-i", pos: { x: 4, y: 3 }, persons: [{ id: "pb", def: "person/ren-kasai", seat: "pilot" }] },
    ] }, 1);
  s.rt!.active = "a";
  const q = createRulesQuery(db), original = q.abilitiesOf;
  q.abilitiesOf = (view, id) => id === "a" ? ids : original(view, id);
  q.forSnapshot = undefined;
  const know = updateKnowledge(q, s, "player", emptyKnowledge());
  const ctx: AiCtx = { q, s, view: s, slot: "player", know, danger: {}, assignment: null,
    params: { maxMoves: 0, objMoves: 0, band: 1 }, rng: createRng(1, 101) };
  return { ctx, db, exec: createRulesExec(db) };
}
function use(ability: string, unit = "a"): Candidate {
  return { cmd: { kind: "useAbility", actor: "a", ability, target: { unit } } };
}
function choose(ctx: AiCtx, agent = createAgent("a", "tactical")) {
  const p = getPolicy(agent.policy);
  return selectCandidate(ctx.rng, p.propose(ctx, agent).map(c => ({ c, score: p.score(ctx, agent, c) })), 1);
}
function ap(ctx: AiCtx, value: number) {
  const person = ctx.q.commanderOf(ctx.view, "a");
  (person ? ctx.view.persons[person]! : ctx.view.units.a!).pools.ap!.cur = value;
}

test("無威脅滿血不自護，有合法攻擊或僅 End，任務移動不能救回無收益施法", () => {
  for (const attack of [false, true]) {
    const shot = "base:ability/kx-storm-mane-bite";
    const { ctx } = context([guard, ...(attack ? [shot] : [])]);
    ctx.view.units.enemy!.pos = { x: 3, y: 2 };
    if (attack) assert.equal(ctx.q.checkAbility(ctx.view, "a", shot, { unit: "enemy" }), null);
    const a = createAgent("a", "tactical");
    assert.equal(scoreCandidate(ctx, a, use(guard)), -Infinity);
    assert.notEqual(choose(ctx, a)?.cmd.kind === "useAbility" ? (choose(ctx, a)!.cmd as { ability: string }).ability : "end", guard);
    ctx.view.rt!.objectives.push({ kind: "hold", for: "player", params: { cell: { x: 3, y: 4 }, radius: 0 }, onComplete: "win" });
    assert.equal(scoreCandidate(ctx, a, { ...use(guard), move: { x: 3, y: 4 } }), -Infinity);
  }
});

test("無護衛指派時滿血／低血受威脅會選原地 protect 與 escape", () => {
  for (const ability of [guard, dodge]) for (const wounded of [false, true]) {
    const { ctx, exec } = context([ability]);
    ctx.danger = { "2,3": 6 };
    if (wounded) for (const part of Object.values(ctx.view.units.a!.parts)) for (const layer of part.layers) layer.hp /= 2;
    const before = structuredClone(ctx.view), c = choose(ctx);
    assert.deepEqual(ctx.view, before);
    assert.deepEqual(c, use(ability));
    assert.ok(exec(ctx.s, c!.cmd).ok);
  }
});

test("隊友高燼用、低燼不用：同一快照只改目標 heat；沒有治療不能以負傷灌分", () => {
  const { ctx, exec } = context([relief]);
  ctx.danger = { "3,3": 6 };
  const low = structuredClone(ctx.view);
  ctx.view.units.ally!.pools.heat!.cur = 100;
  const high = choose(ctx);
  assert.deepEqual(high, use(relief, "ally"));
  assert.ok(exec(ctx.s, high!.cmd).ok);
  assert.equal(ctx.s.units.ally!.pools.heat!.cur, 85);
  ctx.s = ctx.view = low;
  assert.notDeepEqual(choose(ctx), use(relief, "ally"));
  for (const part of Object.values(ctx.view.units.ally!.parts)) for (const layer of part.layers) layer.hp /= 2;
  assert.equal(scoreCandidate(ctx, createAgent("a", "tactical"), use(relief, "ally")), -Infinity);
  assert.notDeepEqual(choose(ctx), use(relief, "ally"));
});

test("卸燼沒有對應池、超射程、AP 不足與毀損來源維持無效", () => {
  const { ctx } = context([relief]);
  delete ctx.view.units.ally!.pools.heat;
  assert.equal(scoreCandidate(ctx, createAgent("a", "tactical"), use(relief, "ally")), -Infinity);
  ctx.view.units.ally!.pos = { x: 12, y: 3 };
  assert.notEqual(ctx.q.checkAbility(ctx.view, "a", relief, { unit: "ally" }), null);
  ctx.view.units.ally!.pos = { x: 3, y: 3 };
  ap(ctx, 2);
  assert.notEqual(ctx.q.checkAbility(ctx.view, "a", relief, { unit: "ally" }), null);
  // 真內容從部件取能力，不繞過毀損來源檢查。
  const real = createRulesQuery(base);
  const s = createBattle(base, { id: "broken-support", map: { width: 5, height: 5, fill: "terrain/plain", exits: [] }, objectives: [], units: [
    { id: "a", owner: "player", frame: "frame/cn-yoke-i", components: base.require("frame", "frame/cn-yoke-i").defaultLoadout,
      pos: { x: 1, y: 1 }, persons: [{ id: "p", def: "person/ren-kasai", seat: "pilot" }] },
    { id: "b", owner: "enemy", frame: "frame/bulwark-i", pos: { x: 4, y: 4 } },
  ] }, 1);
  assert.ok(real.abilitiesOf(s, "a").includes(relief));
  for (const part of Object.values(s.units.a!.parts)) part.broken = true;
  assert.ok(!real.abilitiesOf(s, "a").includes(relief));
});

test("berserk 青鬣 AP8 先 self buff 後仍能主攻；已生效／無敵／不足後續 AP 不放", () => {
  const bite = "base:ability/kx-storm-mane-bite";
  for (const blocked of ["none", "existing", "no-enemy", "ap"] as const) {
    const { ctx, db, exec } = context([rise, bite], { monster: true });
    ctx.view.units.ally!.pos = { x: 10, y: 7 };
    ctx.view.units.enemy!.pos = { x: 3, y: 3 };
    ap(ctx, blocked === "ap" ? 5 : 8);
    if (blocked === "existing") applyEffect({ db, s: ctx.view }, "base:effect/kx-storm-mane-risen", { unit: "a" }, "a");
    if (blocked === "no-enemy") delete ctx.view.units.enemy;
    const a = createAgent("a", "berserk"), c = choose(ctx, a);
    if (blocked === "none") {
      assert.deepEqual(c, use(rise));
      assert.ok(exec(ctx.s, c!.cmd).ok);
      const next = choose(ctx, a);
      assert.equal(next?.cmd.kind, "useAbility");
      assert.ok(next?.cmd.kind === "useAbility" && next.cmd.ability === bite);
      assert.ok(exec(ctx.s, next!.cmd).ok);
    } else assert.ok(c?.cmd.kind !== "useAbility" || c.cmd.ability !== rise);
    assert.ok(getPolicy("berserk").propose(ctx, a).every(c => c.cmd.kind !== "useAbility" || c.cmd.target?.unit !== "ally"));
  }
});

test("同輪 Wait 再入不重放；不同能力共用 refresh 效果不灌分，過期下輪可用", () => {
  const duplicate = structuredClone(base.require("ability", guard));
  duplicate.id = "base:ability/support-copy";
  duplicate.cooldown = 0;
  const { ctx, db, exec } = context([guard, duplicate.id], { abilities: [duplicate] });
  ctx.danger = { "2,3": 6 };
  const a = createAgent("a", "tactical");
  const commands = takeTurn({ ...ctx, exec: (s, cmd) => {
    const result = exec(s, cmd);
    if (result.ok && cmd.kind === "useAbility") ctx.params.waitScore = 100;
    return result;
  } }, a, { maxActions: 2 });
  const used = commands.find(c => c.kind === "useAbility");
  assert.ok(used && used.kind === "useAbility");
  assert.ok(commands.some(c => c.kind === "wait"));
  // 同一 agent 記憶跨 Wait 重入保留；不以 cooldown 代替防線。
  ctx.view = ctx.s;
  ctx.view.rt!.active = "a";
  ctx.params.waitScore = 0;
  const remembered = a.memory.supportUsed;
  rememberSupport(a, ctx.view.round, used.ability);
  assert.deepEqual(a.memory.supportUsed, remembered);
  const candidates = proposeTactical(ctx, a);
  assert.ok(candidates.every(c => c.cmd.kind !== "useAbility" || c.cmd.ability !== used.ability));
  assert.equal(scoreCandidate(ctx, a, use(duplicate.id)), -Infinity);
  const effect = ctx.view.units.a!.effects.find(e => e.effect.includes("bulwark") || e.effect.includes("shield"));
  assert.ok(effect);
  removeEffect({ db, s: ctx.view }, effect.uid, "test-expire");
  ctx.view.round++;
  ap(ctx, 8);
  assert.ok(scoreCandidate(ctx, a, use(duplicate.id)) > 0);
});

test("既有緩燼 refresh 不重跑卸燼，不同招共用效果也不重放", () => {
  const duplicate = structuredClone(base.require("ability", relief));
  duplicate.id = "base:ability/relief-copy";
  const { ctx, exec } = context([relief, duplicate.id], { abilities: [duplicate] });
  ctx.view.units.ally!.pools.heat!.cur = 110;
  ctx.danger = { "3,3": 6 };
  assert.ok(exec(ctx.s, use(relief, "ally").cmd).ok);
  ap(ctx, 8);
  assert.equal(scoreCandidate(ctx, createAgent("a", "tactical"), use(duplicate.id, "ally")), -Infinity);
  const before = ctx.view.units.ally!.pools.heat!.cur;
  const after = ctx.q.previewCommand(ctx.view, use(duplicate.id, "ally").cmd);
  assert.ok(after.result.ok);
  assert.equal(after.state.units.ally!.pools.heat!.cur, before);
});

test("tactical 額外保留最低成本支援格並留足施放 AP，低燼不追友方", () => {
  const { ctx } = context([relief]);
  ctx.view.units.ally!.pos = { x: 6, y: 3 };
  ctx.view.units.enemy!.pos = { x: 1, y: 1 };
  ctx.view.units.ally!.pools.heat!.cur = 110;
  ap(ctx, 4);
  ctx.params = { maxMoves: 1, maxSupportMoves: 1, objMoves: 0 };
  const candidates = proposeTactical(ctx, createAgent("a", "tactical"));
  const c = candidates.find(c => c.move && c.cmd.kind === "useAbility" && c.cmd.ability === relief && c.cmd.target?.unit === "ally");
  assert.ok(c?.move);
  const path = ctx.q.pathTo(ctx.view, "a", c.move)!;
  const moved = ctx.q.previewCommand(ctx.view, { kind: "move", actor: "a", path });
  assert.ok(moved.result.ok);
  assert.equal(ctx.q.checkAbility(moved.state, "a", relief, { unit: "ally" }), null);
  ctx.view.units.ally!.pools.heat!.cur = 0;
  assert.ok(proposeTactical(ctx, createAgent("a", "tactical")).every(c => !c.move || c.cmd.kind !== "useAbility" || c.cmd.ability !== relief));
});

test("sentinel 回防、regroup、swarm 回巢都有不移位支援，不越守點或 leash", () => {
  for (const policy of ["sentinel", "regroup", "swarm"]) {
    const { ctx } = context([relief]);
    ctx.view.units.ally!.pools.heat!.cur = 110;
    ctx.params = { maxMoves: 0, objMoves: 4, leash: 0 };
    const a = createAgent("a", policy, { home: { x: 0, y: 3 }, parent: "ally" });
    const candidates = getPolicy(policy).propose(ctx, a);
    assert.ok(candidates.some(c => c.cmd.kind === "useAbility" && c.cmd.ability === relief));
    assert.ok(candidates.filter(c => c.cmd.kind === "useAbility").every(c => !c.move));
    if (policy === "sentinel") {
      a.memory.home = { ...ctx.view.units.a!.pos };
      assert.ok(getPolicy(policy).propose(ctx, a).every(c => !c.move && c.cmd.kind !== "move"));
    }
  }
});
