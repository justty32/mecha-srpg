import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import type { AbilityDef, EffectDef, Objective } from "../../src/core/types-def.ts";
import { createRng } from "../../src/core/rng.ts";
import { createContentDB } from "../../src/content/contentdb.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createBattle } from "../../src/rules/index.ts";
import { createRulesQuery } from "../../src/ai/adapters/rules-adapter.ts";
import { createAgent, emptyKnowledge, scoreCandidate, selectCandidate } from "../../src/ai/index.ts";
import type { AiCtx, Candidate } from "../../src/ai/index.ts";
import { proposeTactical } from "../../src/ai/policies/tactical.ts";

const base = loadContentDirs(["content/base"]).db;
const agent = createAgent("a", "tactical");
const fx: EffectDef = { id: "base:effect/tactics-test", name: "測試抑制", scope: "mech",
  clock: { kind: "ownerTurns", n: 2 }, stack: { policy: "refresh" },
  contribs: [{ path: "self.attrs.evasion", op: "add", value: -10, source: "test" }],
  hooks: {}, tags: ["suppressed"], ui: { badge: "測" } };
const buff: EffectDef = { ...fx, id: "base:effect/tactics-buff", name: "測試防護", tags: [],
  contribs: [{ path: "self.attrs.evasion", op: "add", value: 10, source: "test" }] };
function ability(name: string, changes: Partial<AbilityDef> = {}): AbilityDef {
  return { id: `base:ability/tactics-${name}`, name, mode: "activated", costs: [], produces: [], require: [],
    target: { kind: "unit", range: { min: 0, max: 9 }, los: false, friendly: "no" }, accuracy: 1000,
    packets: [{ type: "physical", amount: 21 }], effects: [], tags: [], ai: { tactics: { attack: 1 } }, ...changes };
}
function context(abilities: AbilityDef[], objectives: Objective[] = []): AiCtx {
  const defs = Object.fromEntries(CONTENT_KINDS.map(k => [k, Object.fromEntries(base.all(k).map(d => [d.id, d]))]));
  for (const a of abilities) defs.ability![a.id] = a;
  defs.effect![fx.id] = fx;
  defs.effect![buff.id] = buff;
  const frame = structuredClone(base.require("frame", "frame/hound-mk2"));
  frame.innateAbilities = abilities.map(a => a.id);
  defs.frame![frame.id] = frame;
  const db = createContentDB([...base.packs], base.registries, base.rules, defs);
  const s = createBattle(db, { id: "tactics-test", map: { width: 12, height: 8, fill: "terrain/plain", exits: [] },
    objectives, maxRounds: 10, units: [
      { id: "a", owner: "player", frame: frame.id, pos: { x: 1, y: 3 }, persons: [{ id: "pa", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "b", owner: "enemy", frame: frame.id, pos: { x: 4, y: 3 }, persons: [{ id: "pb", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "c", owner: "player", frame: frame.id, pos: { x: 4, y: 4 }, persons: [{ id: "pc", def: "person/ren-kasai", seat: "pilot" }] },
    ] }, 1);
  s.rt!.active = "a";
  const q = createRulesQuery(db);
  // 只限制候選清單；合法性、幾何、效果與持續開關均由真規則驗證。
  const original = q.abilitiesOf;
  q.abilitiesOf = (view, id) => id === "a" ? abilities.map(a => a.id) : original(view, id);
  return { s, view: s, q, slot: "player", know: emptyKnowledge(), danger: {}, assignment: null,
    params: { maxMoves: 0, objMoves: 0 }, rng: createRng(1, 101) };
}
const use = (a: AbilityDef, target: { unit?: string; cell?: { x: number; y: number } }): Candidate =>
  ({ cmd: { kind: "useAbility", actor: "a", ability: a.id, target } });
const score = (ctx: AiCtx, c: Candidate): number => scoreCandidate(ctx, agent, c);
const choose = (ctx: AiCtx): Candidate | null => selectCandidate(ctx.rng,
  proposeTactical(ctx, agent).map(c => ({ c, score: score(ctx, c) })), 1);
const obj = (kind: Objective["kind"], unit: string): Objective => ({ kind, for: "player", params: { unit }, onComplete: "win" });

for (const kind of ["line", "cone"] as const) test(`${kind} 攻擊會提出並選中`, () => {
  const a = ability(kind, { target: { kind, radius: 1, range: { min: 1, max: 9 }, los: false, friendly: "no" }, ai: { tactics: { attackArea: 1 } } });
  const ctx = context([a]), expected = use(a, { cell: ctx.view.units.b!.pos });
  assert.ok(proposeTactical(ctx, agent).some(c => JSON.stringify(c) === JSON.stringify(expected)));
  assert.deepEqual(choose(ctx), expected);
});

test("友軍範圍增益候選、多人加分與敵方受益扣分", () => {
  for (const kind of ["ball", "line", "cone"] as const) {
    const a = ability(kind, { packets: [], target: { kind, radius: 1, range: { min: 0, max: 9 }, los: false, friendly: "only" },
      effects: [{ on: "always", apply: [buff.id] }], ai: { tactics: { buff: 1, heal: 1, protect: 1 } } });
    const ctx = context([a]);
    ctx.danger = { "4,3": 6, "5,3": 6 };
    ctx.assignment = { unit: "a", stance: "hold", protect: "c", allowRetreat: false };
    ctx.view.units.c!.pos = { x: 5, y: 3 };
    const c = use(a, { cell: { ...ctx.view.units.c!.pos } });
    assert.ok(proposeTactical(ctx, agent).some(x => JSON.stringify(x) === JSON.stringify(c)));
    const one = score(ctx, c);
    ctx.view.units.b!.owner = "player";
    const two = score(ctx, c);
    assert.ok(two > one && one > 0);
    // 另建 yes 的 DB 檢查敵方受益對稱扣分。
    const mixed = context([{ ...a, target: { ...a.target, friendly: "yes" } }]);
    mixed.danger = { "4,3": 6, "5,3": 6 };
    mixed.view.units.c!.pos = { x: 5, y: 3 };
    const penalized = score(mixed, c);
    mixed.params.enemyBuffPenalty = 0;
    assert.ok(score(mixed, c) > penalized);
  }
});

test("sustained 未維持會開、已維持不再提出；passive 不提出", () => {
  const a = ability("sustain", { mode: "sustained", packets: [],
    target: { kind: "self", range: { min: 0, max: 0 }, los: false, friendly: "only" }, ai: { tactics: { buff: 2 } } });
  const passive = ability("passive", { ...a, id: "base:ability/tactics-passive", mode: "passive" });
  const ctx = context([a, passive]), selected = choose(ctx);
  assert.deepEqual(selected, use(a, { unit: "a" }));
  const preview = ctx.q.previewCommand(ctx.view, selected!.cmd);
  assert.ok(preview.result.ok);
  assert.ok(preview.state.units.a!.sustained.includes(a.id));
  ctx.view = preview.state;
  assert.ok(proposeTactical(ctx, agent).every(c => c.cmd.kind !== "useAbility"));
});

test("capture 目標提高同傷害捕獲技，locomotion 已損越多價值越高", () => {
  const normal = ability("normal"), capture = ability("capture", { ai: { tactics: { capture: 1 } } });
  const ctx = context([normal, capture], [obj("capture", "b")]);
  const c = use(capture, { unit: "b" }), n = use(normal, { unit: "b" });
  assert.ok(score(ctx, c) > score(ctx, n));
  const healthy = score(ctx, c);
  for (const p of ctx.q.partDefs(ctx.view, "b").filter(p => p.functions.includes("locomotion"))) {
    for (const l of ctx.view.units.b!.parts[p.id]!.layers) l.hp /= 2;
  }
  const damaged = score(ctx, c);
  ctx.params.captureValue = 0;
  assert.ok(damaged > score(ctx, c) && damaged > healthy);
  ctx.params.objCapture = 0;
  assert.equal(score(ctx, c), 0);
  ctx.params.capture = 1;
  assert.equal(score(ctx, c), score(ctx, n));
  const ordinary = context([normal, capture]);
  assert.equal(score(ordinary, c), 0);
});

test("純減益正分、高威脅更高，已有不可疊加效果不重複計價", () => {
  for (const tactic of ["debuff", "disable"] as const) {
    const a = ability("debuff", { packets: [], effects: [{ on: "hit", apply: [fx.id] }], ai: { tactics: { [tactic]: 1 } } });
    const threat = ability("threat", { ai: { tactics: { attack: 10 } } });
    const ctx = context([a, threat]);
    ctx.view.units.c!.owner = "enemy";
    ctx.view.units.c!.pos = { x: 4, y: 2 };
    const original = ctx.q.abilitiesOf;
    ctx.q.abilitiesOf = (s, id) => id === "b" ? [threat.id] : id === "c" ? [] : original(s, id);
    const high = use(a, { unit: "b" }), low = use(a, { unit: "c" });
    assert.ok(score(ctx, high) > score(ctx, low) && score(ctx, low) > 0);
    const value = score(ctx, high);
    ctx.params.debuffControl = 0;
    assert.ok(score(ctx, high) < value && score(ctx, high) > 0);
    ctx.params.debuffAttr = 0;
    assert.equal(score(ctx, high), 0);
    ctx.params = { maxMoves: 0, objMoves: 0 };
    const preview = ctx.q.previewCommand(ctx.view, high.cmd);
    assert.ok(preview.result.ok && preview.state.units.b!.effects.some(e => e.effect === fx.id));
    ctx.view = preview.state;
    assert.equal(score(ctx, high), 0);
  }
});

test("大血量任務目標在同等條件下勝過小目標", () => {
  const a = ability("shot");
  const ctx = context([a], [obj("killTarget", "b")]);
  ctx.view.units.c!.owner = "enemy";
  ctx.view.units.c!.pos = { x: 4, y: 2 };
  // 同威脅、同血量比例、同預估傷害，只改公開最大 HP 與目標標記。
  const q = ctx.q, originalParts = q.partDefs, originalLayers = q.layerDefs;
  q.layerDefs = (s, id, part) => originalLayers(s, id, part).map(l => ({ ...l, hp: id === "b" ? l.hp * 10 : l.hp }));
  q.partDefs = (s, id) => originalParts(s, id).map(p => ({ ...p, layers: q.layerDefs(s, id, p.id) }));
  for (const p of Object.values(ctx.view.units.b!.parts)) for (const l of p.layers) l.hp *= 10;
  const big = use(a, { unit: "b" }), small = use(a, { unit: "c" });
  assert.ok(score(ctx, big) > score(ctx, small));
  ctx.params.objHpScale = 1e9;
  assert.ok(score(ctx, big) < score(ctx, small));
});

test("啟用追擊時只追近 view 中最近的 killTarget／孵化源，不讀真實隱藏位置", () => {
  for (const spawner of [false, true]) {
    const ctx = context([], spawner ? [] : [obj("killTarget", "b")]);
    const original = ctx.q.unitTags;
    if (spawner) ctx.q.unitTags = (s, id) => [...original(s, id), ...(id === "b" ? ["spawner"] : [])];
    ctx.params.objMoves = 4; ctx.params.objHunt = 0.3;
    const selected = choose(ctx);
    assert.equal(selected?.cmd.kind, "move");
    if (selected?.cmd.kind !== "move") return;
    assert.ok(ctx.q.distance(selected.cmd.path.at(-1)!, ctx.view.units.b!.pos)
      < ctx.q.distance(ctx.view.units.a!.pos, ctx.view.units.b!.pos));
    ctx.params.objHunt = 0;
    assert.equal(choose(ctx)?.cmd.kind, "end");
    ctx.params.objHunt = 0.3;
    ctx.view = structuredClone(ctx.s);
    delete ctx.view.units.b;
    assert.ok(ctx.s.units.b);
    assert.equal(choose(ctx)?.cmd.kind, "end");
  }
});
