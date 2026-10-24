import test from "node:test";
import assert from "node:assert/strict";
import { GRADES } from "../../src/core/types-def.ts";
import { createRng, d100 } from "../../src/core/rng.ts";
import type { BattleState, Command } from "../../src/core/types-state.ts";
import type { AiCtx, Agent } from "../../src/ai/policy.ts";
import { TACTICS, tacticWeights, hpFraction, targetValue, forceRatio, want, previewOutcome, scoreCandidate } from "../../src/ai/score.ts";
import { emptyKnowledge, updateKnowledge, maskedState } from "../../src/ai/knowledge.ts";
import { createStubRules, makeStubBattle, loadStubAbilities } from "./stub-rules.ts";
import type { StubUnit } from "./stub-rules.ts";

const agent: Agent = { unit: "a", policy: "tactical", memory: {} };
function context(units?: StubUnit[], seed = 1): AiCtx {
  const { q } = createStubRules();
  const s = makeStubBattle({ width: 10, height: 5, units: units ?? [
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle", "stub:ability/mortar", "stub:ability/scan", "stub:ability/repair"] },
    { id: "b", owner: "e", pos: { x: 2, y: 0 }, abilities: ["stub:ability/rifle"] },
  ] }, seed);
  const know = updateKnowledge(q, s, "p", emptyKnowledge());
  return { q, s, view: maskedState(q, s, "p", know), slot: "p", know, danger: {}, assignment: null, params: {}, rng: createRng(seed, 101) };
}
function scaleHp(s: BattleState, id: string, fraction: number): void {
  for (const key of Object.keys(s.units[id]!.parts).sort()) {
    for (const l of s.units[id]!.parts[key]!.layers) l.hp *= fraction;
  }
}
const shot: Command = { kind: "useAbility", actor: "a", ability: "stub:ability/rifle", target: { unit: "b" } };

test("targetValue 表格：grade × threat × hp × focus", () => {
  const { q } = createStubRules();
  const threats = [{ abilities: [], threat: 0 }, { abilities: ["stub:ability/claw"], threat: 1.5 },
    { abilities: ["stub:ability/rifle", "stub:ability/mortar"], threat: 4 }];
  for (const grade of GRADES) for (const row of threats) for (const fraction of [1, 0.5, 0.1]) for (const focus of [false, true]) {
    const s = makeStubBattle({ width: 1, height: 1, units: [
      { id: "b", owner: "e", pos: { x: 0, y: 0 }, abilities: row.abilities, grade },
    ] }, 1);
    scaleHp(s, "b", fraction);
    const expected = (1 + GRADES.indexOf(grade)) * (1 + row.threat) * (1.5 - fraction) * (focus ? 1.5 : 1);
    assert.ok(Math.abs(targetValue(q, s, "b", focus ? "b" : "elsewhere") - expected) < 1e-10, `${grade}/${row.threat}/${fraction}/${focus}`);
  }
});

test("want 表格：低血量 survive 上升、兵力劣勢與指令權者低士氣觸發 retreat", () => {
  const rows = [
    { hp: 1, enemy: 1, morale: "steady" as const, survive: 0, retreat: 0 },
    { hp: 0.25, enemy: 1, morale: "steady" as const, survive: 1.5, retreat: 3 },
    { hp: 1, enemy: 3, morale: "steady" as const, survive: 0, retreat: 3 },
    { hp: 1, enemy: 1, morale: "breaking" as const, survive: 0, retreat: 3 },
    { hp: 1, enemy: 1, morale: "fleeing" as const, survive: 0, retreat: 3 },
  ];
  for (const row of rows) {
    const ctx = context([
      { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle"], commander: { id: "pilot", morale: row.morale } },
      ...Array.from({ length: row.enemy }, (_, i) => ({ id: `e${i}`, owner: "e", pos: { x: 2 + i, y: 0 }, abilities: ["stub:ability/rifle"] })),
    ]);
    scaleHp(ctx.s, "a", row.hp);
    ctx.params = { survive: 2, retreat: 3, scout: 5, protect: 7 };
    ctx.assignment = { unit: "a", stance: "defend", protect: "ally", allowRetreat: true };
    const w = want(ctx, "a");
    assert.equal(w.survive, row.survive);
    assert.equal(w.escape, row.survive);
    assert.equal(w.retreat, row.retreat);
    assert.equal(w.scout, 1);
    assert.equal(w.protect, 7);
    assert.equal(forceRatio(ctx.q, ctx.s, ctx.view, "p"), row.hp / row.enemy);
    ctx.know.visible = [];
    assert.equal(want(ctx, "a").scout, 5);
  }
});

test("previewOutcome 只在有 Hit 的次數平均，包含擊殺聯集與不可達移動零結果", () => {
  const ctx = context();
  const q = { ...ctx.q, hitChance: () => 50 };
  // 替身 exec 閉包使用自己的 q，直接改該查詢以控制命中率。
  ctx.q.hitChance = q.hitChance;
  const before = structuredClone(ctx.view);
  const tries = 20;
  const expectedHits = Array.from({ length: tries }, (_, i) => d100(createRng(1000 + i, 7))).filter(roll => roll < 50).length;
  assert.ok(expectedHits > 0 && expectedHits < tries);
  const result = previewOutcome(ctx.q, ctx.view, shot, undefined, tries);
  assert.equal(result.runs, tries);
  assert.equal(result.hitRuns, expectedHits);
  assert.equal(result.damage.b, 30);
  assert.deepEqual(result.killed, []);
  assert.deepEqual(ctx.view, before);
  assert.deepEqual(previewOutcome(ctx.q, ctx.view, shot, { x: 9, y: 4 }), { damage: {}, killed: [], hitRuns: 0, runs: 0 });
  ctx.view.units.b!.parts.torso!.layers = [{ hp: 5, broken: false }, { hp: 5, broken: false }];
  const kill = previewOutcome(ctx.q, ctx.view, shot, undefined, tries);
  assert.deepEqual(kill.killed, ["b"]);
  assert.equal(kill.damage.b, 10);
});

test("scoreCandidate attackArea 依 friendlyFirePenalty 扣友傷分數", () => {
  const ctx = context([
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: ["stub:ability/mortar"] },
    { id: "b", owner: "e", pos: { x: 3, y: 0 }, abilities: ["stub:ability/rifle"] },
    { id: "friend", owner: "p", pos: { x: 3, y: 1 }, abilities: ["stub:ability/rifle"] },
  ]);
  const c = { cmd: { kind: "useAbility", actor: "a", ability: "stub:ability/mortar", target: { cell: { x: 3, y: 0 } } } } as const;
  assert.ok((previewOutcome(ctx.q, ctx.view, c.cmd).damage.friend ?? 0) > 0);
  ctx.params.friendlyFirePenalty = 0;
  const noPenalty = scoreCandidate(ctx, agent, c);
  ctx.params.friendlyFirePenalty = 1;
  const penalty = scoreCandidate(ctx, agent, c);
  assert.ok(noPenalty > penalty);
  ctx.params.friendlyFirePenalty = 2;
  assert.ok(Math.abs(scoreCandidate(ctx, agent, c) - (2 * penalty - noPenalty)) < 1e-10);
});

test("scoreCandidate 高價值目標分數更高，focusBonus 從 params 讀取", () => {
  const ctx = context([
    { id: "a", owner: "p", pos: { x: 0, y: 0 }, abilities: ["stub:ability/rifle"] },
    { id: "b", owner: "e", pos: { x: 2, y: 0 }, abilities: ["stub:ability/rifle"], grade: "D" },
    { id: "high", owner: "e", pos: { x: 2, y: 2 }, abilities: ["stub:ability/rifle"], grade: "S" },
  ]);
  const low = scoreCandidate(ctx, agent, { cmd: shot });
  const high = scoreCandidate(ctx, agent, { cmd: { ...shot, kind: "useAbility", actor: "a", ability: "stub:ability/rifle", target: { unit: "high" } } });
  assert.ok(low > 0 && high > low);
  ctx.assignment = { unit: "a", stance: "attack", target: "b", allowRetreat: false };
  ctx.params.focusBonus = 4;
  assert.equal(scoreCandidate(ctx, agent, { cmd: shot }), low * 4);
});

test("previewOutcome 不同戰局 seed 決定性相同，移動後預覽不消耗原 RNG", () => {
  const a = context(undefined, 1), b = context(undefined, 987654);
  const beforeA = structuredClone({ s: a.s, view: a.view, rng: a.rng });
  const beforeB = structuredClone({ s: b.s, view: b.view, rng: b.rng });
  assert.deepEqual(previewOutcome(a.q, a.view, shot, { x: 1, y: 1 }), previewOutcome(b.q, b.view, shot, { x: 1, y: 1 }));
  assert.deepEqual(a.s, beforeA.s);
  assert.deepEqual(a.view, beforeA.view);
  assert.deepEqual(a.rng, beforeA.rng);
  assert.deepEqual({ s: b.s, view: b.view, rng: b.rng }, beforeB);
});

test("tacticWeights 求值 NumExpr；hpFraction 加總全部層並限制 0..1", () => {
  const abilities = loadStubAbilities();
  abilities["stub:ability/rifle"]!.ai.tactics = { attack: { sum: [1, 2] }, disable: { ref: "self.attrs.accuracy", add: 4 } };
  const { q } = createStubRules(abilities), ctx = context();
  assert.deepEqual(tacticWeights(q, ctx.view, "a", "stub:ability/rifle"), { attack: 3, disable: 4 });
  assert.deepEqual(TACTICS, ["attack", "attackArea", "disable", "heal", "buff", "debuff", "escape", "protect", "capture", "scout"]);
  ctx.view.units.b!.parts.torso!.layers[0]!.hp = 0;
  assert.equal(hpFraction(q, ctx.view, "b"), 70 / 110);
  for (const fraction of [0, 0.25, 2]) {
    const fresh = context();
    scaleHp(fresh.view, "b", fraction);
    assert.equal(hpFraction(q, fresh.view, "b"), Math.min(1, fraction));
  }
});

test("scoreCandidate 移動、支援、偵察及結束候選依固定公式估值", () => {
  const ctx = context();
  ctx.danger = { "1,0": 2 };
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "move", actor: "a", path: [{ x: 1, y: 0 }] } }), 0.3 - 0.01 * 2);
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "wait", actor: "a" } }), 0);
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "end", actor: "a" } }), 0.01);
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "retreat", actor: "a" } }), 0);
  const repair: Command = { kind: "useAbility", actor: "a", ability: "stub:ability/repair", target: { unit: "a" } };
  assert.ok(scoreCandidate(ctx, agent, { cmd: repair }) > 0);
  const scan: Command = { kind: "useAbility", actor: "a", ability: "stub:ability/scan", target: { unit: "b" } };
  const initialScan = scoreCandidate(ctx, agent, { cmd: scan });
  ctx.know.lastSeen.hidden = { cell: { x: 8, y: 4 }, round: 0 };
  assert.equal(scoreCandidate(ctx, agent, { cmd: scan }), initialScan * 2);
  scaleHp(ctx.s, "a", 0.1);
  ctx.assignment = { unit: "a", stance: "hold", allowRetreat: true };
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "eject", actor: "a" } }), 4.5);
  assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "retreat", actor: "a" } }), 10);
});
