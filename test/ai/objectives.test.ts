import test from "node:test";
import assert from "node:assert/strict";
import type { Cell, Objective } from "../../src/core/types-def.ts";
import type { AiCtx, Candidate } from "../../src/ai/index.ts";
import { createAgent, createDefaultStrategy, emptyKnowledge, maskedState, updateKnowledge,
  objectiveInfo, objectiveMoveValue, OBJECTIVE_DEFAULTS, scoreCandidate, selectCandidate, targetValue } from "../../src/ai/index.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";
import { createRng } from "../../src/core/rng.ts";
import { createStubRules, loadStubAbilities, makeStubBattle } from "./stub-rules.ts";
import type { StubUnit } from "./stub-rules.ts";

const rifle = "stub:ability/rifle";
const unit = (id: string, owner: string, x: number, y: number, abilities: string[] = []): StubUnit =>
  ({ id, owner, pos: { x, y }, abilities, perception: 30, ap: 2 });
const objective = (kind: Objective["kind"], params: Objective["params"], owner = "p"): Objective =>
  ({ kind, params, for: owner, onComplete: "win" });
function context(objectives: Objective[], units = [unit("a", "p", 2, 2, [rifle]), unit("b", "e", 4, 1, [rifle]), unit("z", "e", 4, 3, [rifle])], slot = "p"): AiCtx {
  const { q } = createStubRules();
  // 同盟只擴充本測試查詢，保留共用替身的既有行為。
  q.hostileSlots = (s, a, b) => a === "berserk" || b === "berserk" || a !== b && !s.rt!.allies[a]?.includes(b);
  q.hostile = (s, a, b) => q.hostileSlots!(s, s.units[a]!.owner, s.units[b]!.owner);
  const s = makeStubBattle({ width: 10, height: 5, exits: [{ x: 0, y: 2 }], units }, 1);
  s.rt!.objectives = objectives;
  s.rt!.allies = { p: ["ally"], ally: ["p"] };
  const know = updateKnowledge(q, s, slot, emptyKnowledge());
  return { q, s, view: maskedState(q, s, slot, know), slot, know, danger: {}, assignment: null,
    params: { maxMoves: 0 }, rng: createRng(1, 101) };
}
function refresh(ctx: AiCtx): void { ctx.view = maskedState(ctx.q, ctx.s, ctx.slot, ctx.know); }
const shot = (id: string, move?: Cell): Candidate => ({ ...(move ? { move } : {}),
  cmd: { kind: "useAbility", actor: "a", ability: rifle, target: { unit: id } } });
const move = (ctx: AiCtx, to: Cell): Candidate => ({ cmd: { kind: "move", actor: "a", path: ctx.q.pathTo(ctx.view, "a", to)! } });
function choose(ctx: AiCtx, candidates?: Candidate[]): Candidate | null {
  const agent = createAgent("a", "tactical");
  return selectCandidate(ctx.rng, (candidates ?? proposeTactical(ctx, agent)).map(c => ({ c, score: scoreCandidate(ctx, agent, c) })), 1);
}
function destination(c: Candidate | null, from: Cell): Cell {
  return c?.move ?? (c?.cmd.kind === "move" ? c.cmd.path.at(-1) : undefined) ?? from;
}

test("killTarget 選目標而非等值另一個，集火 priority 同步且 params 可覆寫", () => {
  const ctx = context([objective("killTarget", { unit: "z", units: ["z"] })]);
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("z"));
  assert.equal(createDefaultStrategy().roundPlan(ctx)[0]!.target, "z");
  assert.equal(targetValue(ctx.q, ctx.view, "z", undefined, { slot: "p", params: { objKill: 7 } }), targetValue(ctx.q, ctx.view, "b") * 8);
  assert.equal(objectiveInfo(ctx.q, ctx.view, "p"), objectiveInfo(ctx.q, ctx.view, "p"));
  ctx.params.objKill = 0;
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("b"));
});

for (const source of ["part", "unitTag", "spawn", "summon"] as const) test(`孵化源優先：${source}，只讀 view`, () => {
  const ctx = context([]);
  const base = ctx.q;
  ctx.q = { ...base,
    partDefs: (s, id) => base.partDefs(s, id).map(p => ({ ...p, functions: source === "part" && id === "z" ? [...p.functions, "spawner"] : p.functions })),
    unitTags: (s, id) => source === "unitTag" && id === "z" ? ["spawner"] : base.unitTags(s, id),
    abilitiesOf: (s, id) => [...base.abilitiesOf(s, id), ...(["spawn", "summon"].includes(source) && id === "z" ? ["spawn-test"] : [])],
    abilityDef: id => id === "spawn-test" ? { ...loadStubAbilities()[rifle]!, id, tags: [source], ai: { tactics: {} } } : base.abilityDef(id),
  };
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("z"));
  ctx.params.objSpawner = 0;
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("b"));
  const hidden = structuredClone(ctx.view);
  delete hidden.units.z;
  assert.equal(objectiveInfo(ctx.q, hidden, "p").killBonus.z, undefined);
});

test("hold 進區：目標候選突破 maxMoves 截斷", () => {
  const zone = [{ x: 0, y: 2 }], ctx = context([objective("hold", { zone, rounds: 2 })], [unit("a", "p", 2, 2), unit("b", "e", 8, 2)]);
  const c = choose(ctx);
  assert.deepEqual(destination(c, ctx.view.units.a!.pos), zone[0]);
  ctx.params.objMoves = 0;
  assert.equal(choose(ctx)?.cmd.kind, "end");
});

test("hold 在區內不離區追擊，移動後出手也扣離區分", () => {
  const ctx = context([objective("hold", { zone: [{ x: 2, y: 2 }], rounds: 2 })]);
  ctx.params.maxMoves = 8;
  assert.deepEqual(destination(choose(ctx), ctx.view.units.a!.pos), ctx.view.units.a!.pos);
  const advancing = shot("b", { x: 3, y: 2 });
  // 此候選需要剩餘 AP 才能射擊。
  ctx.s.units.a!.pools.ap!.cur = 4; refresh(ctx);
  const protectedScore = scoreCandidate(ctx, createAgent("a", "tactical"), advancing);
  ctx.params.objHold = 0; ctx.params.objHoldStay = 0;
  assert.ok(scoreCandidate(ctx, createAgent("a", "tactical"), advancing) > protectedScore);
  assert.notDeepEqual(destination(choose(ctx), ctx.view.units.a!.pos), ctx.view.units.a!.pos);
});

test("hold 優先攻擊區內敵人", () => {
  const ctx = context([objective("hold", { zone: [{ x: 4, y: 3 }], rounds: 2 })]);
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("z"));
  ctx.params.objZoneClear = 0;
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("b"));
});

for (const kind of ["escort", "reachExit"] as const) test(`${kind} 往出口走並在出口撤離`, () => {
  const ctx = context([objective(kind, kind === "escort" ? { units: ["a"] } : { unit: "a" })], [unit("a", "p", 2, 2), unit("b", "e", 8, 2)]);
  assert.deepEqual(destination(choose(ctx), ctx.view.units.a!.pos), { x: 0, y: 2 });
  ctx.params.objExit = 0;
  assert.equal(choose(ctx)?.cmd.kind, "end");
  ctx.params.objExit = OBJECTIVE_DEFAULTS.objExit;
  ctx.s.units.a!.pos = { x: 0, y: 2 }; refresh(ctx);
  assert.equal(choose(ctx)?.cmd.kind, "retreat");
  ctx.params.objExit = 0;
  assert.equal(choose(ctx)?.cmd.kind, "end");
});

test("escort 護衛不離被護送者超過 escortRange", () => {
  const ctx = context([objective("escort", { unit: "passenger" })],
    [unit("a", "p", 2, 2), unit("passenger", "p", 0, 2), unit("b", "e", 8, 2)]);
  ctx.params.maxMoves = 8;
  const to = destination(choose(ctx), ctx.view.units.a!.pos);
  assert.ok(ctx.q.distance(to, ctx.view.units.passenger!.pos) <= OBJECTIVE_DEFAULTS.escortRange);
  ctx.params.objEscort = 0;
  assert.ok(ctx.q.distance(destination(choose(ctx), ctx.view.units.a!.pos), ctx.view.units.passenger!.pos) > OBJECTIVE_DEFAULTS.escortRange);
});

test("敵方 escort 優先攻擊並攔截出口，敵方 hold 向區內爭奪", () => {
  const ctx = context([objective("escort", { unit: "z" }, "e")]);
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("z"));
  ctx.params.objIntercept = 0;
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("b"));
  const blocking = context([objective("escort", { unit: "b" }, "e")], [unit("a", "p", 2, 2), unit("b", "e", 8, 2)]);
  assert.deepEqual(destination(choose(blocking), blocking.view.units.a!.pos), { x: 0, y: 2 });
  blocking.params.objBlock = 0;
  assert.equal(choose(blocking)?.cmd.kind, "end");
  const contest = context([objective("hold", { zone: [{ x: 0, y: 2 }], rounds: 2 }, "e")], [unit("a", "p", 2, 2), unit("b", "e", 8, 2)]);
  assert.deepEqual(destination(choose(contest), contest.view.units.a!.pos), { x: 0, y: 2 });
  contest.params.objContest = 0;
  assert.equal(choose(contest)?.cmd.kind, "end");
});

test("盟軍 slot 共享玩家 killTarget", () => {
  const ctx = context([objective("killTarget", { units: ["z"] })], [unit("a", "ally", 2, 2, [rifle]), unit("b", "e", 4, 1, [rifle]), unit("z", "e", 4, 3, [rifle])], "ally");
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("z"));
  ctx.params.objKill = 0;
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("b"));
});

test("盟軍不打死 capture 目標，但可打殘", () => {
  const target = unit("z", "e", 4, 3, [rifle]);
  target.parts = [{ id: "core", functions: ["core"], layers: [{ type: "structure", hp: 25 }] }];
  const ctx = context([objective("capture", { unit: "z" })], [unit("a", "ally", 2, 2, [rifle]), unit("b", "e", 4, 1, [rifle]), target], "ally");
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("b"));
  assert.ok(scoreCandidate(ctx, createAgent("a", "tactical"), shot("z")) < 0);
  ctx.params.objSpare = 0;
  assert.deepEqual(choose(ctx, [shot("b"), shot("z")]), shot("z"));
  const healthy = context([objective("capture", { unit: "z" })]);
  assert.ok(scoreCandidate(healthy, createAgent("a", "tactical"), shot("z")) > 0);
});

test("盟軍不停在玩家護送出口格", () => {
  const ctx = context([objective("escort", { unit: "passenger" })],
    [unit("a", "ally", 2, 2), unit("passenger", "p", 2, 0), unit("b", "e", 8, 2)], "ally");
  ctx.s.rt!.exits = [{ x: 4, y: 2 }]; refresh(ctx);
  ctx.params.objEscort = 0;
  const exit = move(ctx, { x: 4, y: 2 }), side = move(ctx, { x: 3, y: 2 });
  assert.deepEqual(choose(ctx, [exit, side]), side);
  ctx.params.objNoBlock = 0;
  assert.deepEqual(choose(ctx, [exit, side]), exit);
});

test("目標全空或只有 eliminate 時分數逐位元等於舊公式", () => {
  for (const objectives of [[], [objective("eliminate", {})], [{ ...objective("killTarget", { unit: "z" }), onComplete: "lose" as const }]]) {
    const ctx = context(objectives), agent = createAgent("a", "tactical");
    const from = ctx.view.units.a!.pos, to = { x: 3, y: 2 };
    assert.equal(objectiveMoveValue(ctx, "a", from, to), 0);
    assert.equal(scoreCandidate(ctx, agent, move(ctx, to)), 0.3);
    // C 級索引 1、rifle 威脅 2、滿血 0.5、30/110 傷害、兩點 attack、0.8 命中。
    assert.equal(scoreCandidate(ctx, agent, shot("b")), (2 * 3 * 0.5 * (30 / 110)) * 2 * 0.8);
    assert.equal(scoreCandidate(ctx, agent, { cmd: { kind: "end", actor: "a" } }), 0.01);
    assert.equal(targetValue(ctx.q, ctx.view, "b", undefined, { slot: "p", params: {} }), targetValue(ctx.q, ctx.view, "b"));
  }
});
