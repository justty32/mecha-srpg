import test from "node:test";
import assert from "node:assert/strict";
import { createRng } from "../../src/core/rng.ts";
import { createAgent, emptyKnowledge, takeTurn, getPolicy } from "../../src/ai/index.ts";
import type { AiCtx, Assignment } from "../../src/ai/policy.ts";
import { inferIntent, individualRetreat, mobile, planIntent, selectCommander } from "../../src/ai/intent.ts";
import type { IntentMemory } from "../../src/ai/intent.ts";
import { createStubRules, makeStubBattle } from "./stub-rules.ts";
import type { StubUnit } from "./stub-rules.ts";

const rifle = "stub:ability/rifle";
const unit = (id: string, owner: string, x: number, tags: string[] = []): StubUnit => ({ id, owner, pos: { x, y: 2 },
  abilities: [rifle], ap: 3, perception: 30, tags, commander: tags.includes("kaiju") ? undefined : { id: `${id}-pilot` } });
function fixture(units = [unit("a", "p", 2), unit("e", "e", 6)]) {
  const rules = createStubRules(), s = makeStubBattle({ width: 9, height: 5, exits: [{ x: 0, y: 2 }], units }, 1);
  s.round = 4; s.rt!.maxRounds = 30;
  const ctx: AiCtx = { q: rules.q, s, view: s, slot: "p", know: emptyKnowledge(), assignment: null,
    danger: {}, params: {}, rng: createRng(1) };
  const plans = (): Assignment[] => Object.keys(s.units).filter(id => s.units[id]!.owner === "p" && rules.q.isActive(s, id))
    .map(unit => ({ unit, stance: "attack", allowRetreat: false }));
  return { ctx, rules, plans };
}
function hurt(ctx: AiCtx, id: string, ratio: number) {
  for (const p of ctx.q.partDefs(ctx.s, id)) ctx.s.units[id]!.parts[p.id]!.layers.forEach((l, i) => { l.hp = ctx.q.layerDefs(ctx.s, id, p.id)[i]!.hp * ratio; });
}

test("意圖依 objective、數值 profile、族行為、勢力預設推導", () => {
  const { ctx } = fixture();
  assert.equal(inferIntent(ctx).source, "default");
  ctx.params.intent = 1;
  assert.equal(inferIntent(ctx).kind, "hunt");
  ctx.s.rt!.objectives = [{ kind: "escort", for: "p", params: { unit: "a" }, onComplete: "win" }];
  assert.equal(inferIntent(ctx).kind, "escort");
  const beast = fixture([unit("a", "p", 2, ["kaiju", "spawner"]), unit("e", "e", 6)]).ctx;
  assert.equal(inferIntent(beast).kind, "guardNest");
  beast.q.unitTags = () => ["kaiju", "territorial"];
  assert.equal(inferIntent(beast).kind, "hold");
  beast.q.unitTags = () => ["kaiju"];
  assert.equal(inferIntent(beast).kind, "hunt");
});

test("達得到繼續；無進展且時間不足才整隊撤離，模式跨輪保留", () => {
  const { ctx, plans } = fixture(), memory: IntentMemory = {};
  let a = plans(); planIntent(ctx, memory, a);
  assert.equal(a[0]!.intentMode, undefined);
  ctx.s.round = 29;
  memory.stalled = 6;
  a = plans(); planIntent(ctx, memory, a);
  assert.equal(a[0]!.intentMode, "retreat");
  ctx.s.rt!.maxRounds = 100;
  a = plans(); planIntent(ctx, memory, a);
  assert.equal(a[0]!.intentMode, "retreat");
});

test("固定單位不撤，母體的可動護衛照撤", () => {
  const { ctx, plans } = fixture([unit("nest", "p", 2, ["kaiju", "nest", "spawner"]), unit("a", "p", 3, ["kaiju"]), unit("e", "e", 6)]);
  const a = plans(); planIntent(ctx, { retreat: true }, a);
  assert.equal(mobile(ctx.q, ctx.s, "nest"), false);
  assert.equal(a.find(a => a.unit === "nest")!.intentMode, undefined);
  assert.equal(a.find(a => a.unit === "a")!.intentMode, "retreat");
  hurt(ctx, "nest", 0.1);
  assert.equal(individualRetreat(ctx, "nest"), false);
});

test("giveUpRatio、giveUpLoss、minRound 門檻由 params 生效", () => {
  const { ctx, plans } = fixture();
  ctx.params = { intentGiveUpRatio: 2, intentMinRound: 8 };
  let a = plans(); planIntent(ctx, {}, a); assert.equal(a[0]!.intentMode, undefined);
  ctx.s.round = 8;
  a = plans(); planIntent(ctx, {}, a); assert.equal(a[0]!.intentMode, "retreat");
  ctx.params = { intentGiveUpRatio: 0, intentGiveUpLoss: 0.1 };
  hurt(ctx, "a", 0.8);
  a = plans(); planIntent(ctx, {}, a); assert.equal(a[0]!.intentMode, "retreat");
  ctx.params.intentGiveUpLoss = 0.9;
  a = plans(); planIntent(ctx, {}, a); assert.equal(a[0]!.intentMode, undefined);
});

test("怪獸重傷逃跑並撤離；族門檻與駕駛士氣有效，berserk 維持本能", () => {
  const { ctx, rules } = fixture([unit("a", "p", 2, ["kaiju"]), unit("e", "e", 6)]);
  hurt(ctx, "a", 0.2);
  assert.equal(individualRetreat(ctx, "a"), true);
  ctx.q.speciesIntent = () => ({ behaviors: [], params: { individualFleeHp: 0.1 } });
  assert.equal(individualRetreat(ctx, "a"), false);
  ctx.params.individualFleeHp = 0.3;
  const commands = takeTurn({ ...ctx, exec: rules.exec }, createAgent("a", "tactical"));
  assert.ok(commands.some(c => c.kind === "move"));
  assert.ok(commands.some(c => c.kind === "retreat"));
  const pilot = fixture().ctx;
  pilot.s.persons["a-pilot"]!.morale = "breaking";
  assert.equal(individualRetreat(pilot, "a"), true);
  pilot.s.units.a!.controlMode = "berserk";
  assert.equal(individualRetreat(pilot, "a"), false);
});

test("人類指揮者把受損單位後撤輪替，輪到再前壓；缺補給與負面狀態也輪替", () => {
  const { ctx, plans } = fixture([unit("leader", "p", 1), unit("a", "p", 4), unit("e", "e", 6)]);
  ctx.s.persons["leader-pilot"]!.attrsBase.resolve = 80;
  assert.equal(selectCommander(ctx), "leader");
  hurt(ctx, "a", 0.4);
  const memory: IntentMemory = {};
  let a = plans(); planIntent(ctx, memory, a);
  assert.equal(a.find(a => a.unit === "a")!.intentMode, "regroup");
  const agent = createAgent("a", "regroup"), policy = getPolicy("regroup");
  const candidate = policy.propose(ctx, agent).sort((a, b) => policy.score(ctx, agent, b) - policy.score(ctx, agent, a))[0]!;
  assert.equal(candidate.cmd.kind, "move");
  if (candidate.cmd.kind === "move") assert.ok(ctx.q.distance(candidate.cmd.path.at(-1)!, ctx.s.units.e!.pos) > 2);
  assert.equal(policy.propose(ctx, agent).some(c => c.cmd.kind === "retreat"), false);
  ctx.s.round += 2;
  a = plans(); planIntent(ctx, memory, a);
  assert.equal(a.find(a => a.unit === "a")!.intentMode, undefined);
  hurt(ctx, "a", 1);
  ctx.s.persons["a-pilot"]!.morale = "shaken";
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a.find(a => a.unit === "a")!.intentMode, "regroup");
  ctx.s.persons["a-pilot"]!.morale = "steady";
  ctx.s.units.a!.pools.ammo = { cur: 0, max: 10, regen: 0, band: 0 };
  const abilityDef = ctx.q.abilityDef;
  ctx.q.abilityDef = id => ({ ...abilityDef(id), costs: [...abilityDef(id).costs, { owner: "mech", pool: "ammo", amount: 1 }] });
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a.find(a => a.unit === "a")!.intentMode, "regroup");
  ctx.s.units.a!.pools.ammo.cur = 10;
  const tags = ctx.q.unitTags;
  ctx.q.unitTags = (s, id) => id === "a" ? [...tags(s, id), "jammed"] : tags(s, id);
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a.find(a => a.unit === "a")!.intentMode, "regroup");
});

test("怪獸與人類指揮者陣亡後依參數潰散，其餘退化為個體本能", () => {
  for (const beast of [true, false]) {
    const { ctx, plans } = fixture([unit("leader", "p", 1, beast ? ["kaiju", "spawner"] : []), unit("a", "p", 3, beast ? ["kaiju"] : []), unit("e", "e", 6)]);
    if (!beast) ctx.s.persons["leader-pilot"]!.attrsBase.resolve = 80;
    const memory: IntentMemory = {};
    planIntent(ctx, memory, plans());
    assert.equal(memory.commander, "leader");
    ctx.s.rt!.unitStatus.leader = "dead";
    ctx.params.commanderScatter = 1; ctx.params.humanCommanderScatter = 1;
    let a = plans(); planIntent(ctx, memory, a); assert.equal(a[0]!.intentMode, "retreat");
    ctx.params.commanderScatter = 0; ctx.params.humanCommanderScatter = 0;
    a = plans(); planIntent(ctx, memory, a); assert.equal(a[0]!.intentMode, "instinct");
  }
});
