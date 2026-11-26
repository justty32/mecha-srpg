import test from "node:test";
import assert from "node:assert/strict";
import { forceRatio } from "../../src/ai/score.ts";
import { createRng } from "../../src/core/rng.ts";
import { createAgent, emptyKnowledge, takeTurn, getPolicy } from "../../src/ai/index.ts";
import type { AiCtx, Assignment } from "../../src/ai/policy.ts";
import type { GameEvent } from "../../src/core/events.ts";
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

test("達得到繼續；不可達且戰況不利才整隊撤離，模式跨輪保留", () => {
  const { ctx, plans } = fixture(), memory: IntentMemory = {};
  let a = plans(); planIntent(ctx, memory, a);
  assert.equal(a[0]!.intentMode, undefined);
  ctx.s.round = 29;
  memory.stalled = 6;
  a = plans(); planIntent(ctx, memory, a);
  assert.equal(a[0]!.intentMode, undefined, "不可達但勢均力敵不撤");
  assert.equal(memory.retreat, undefined);
  hurt(ctx, "a", 0.2);
  a = plans(); planIntent(ctx, memory, a);
  assert.equal(a[0]!.intentMode, "retreat");
  assert.equal(memory.retreat, true);
  ctx.s.round++;
  ctx.s.rt!.maxRounds = 100;
  ctx.s.rt!.objectives = [{ kind: "survive", for: "p", params: { rounds: ctx.s.round }, onComplete: "win" }];
  hurt(ctx, "a", 1);
  const fresh = plans(); planIntent(ctx, {}, fresh);
  assert.equal(fresh[0]!.intentMode, undefined, "新記憶確認此輪真正可達且戰況恢復");
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
  ctx.s.rt!.maxRounds = ctx.s.round + 1;
  let a = plans(); planIntent(ctx, { stalled: 6 }, a); assert.equal(a[0]!.intentMode, undefined);
  ctx.s.round = 8;
  ctx.s.rt!.maxRounds = 30;
  a = plans(); planIntent(ctx, {}, a); assert.equal(a[0]!.intentMode, undefined, "達得到時比例門檻再高也不撤");
  ctx.s.rt!.maxRounds = ctx.s.round + 1;
  a = plans(); planIntent(ctx, { stalled: 6 }, a); assert.equal(a[0]!.intentMode, "retreat");
  ctx.params = { intentGiveUpRatio: 0, intentGiveUpLoss: 0.1 };
  hurt(ctx, "a", 0.8);
  a = plans(); planIntent(ctx, { stalled: 6 }, a); assert.equal(a[0]!.intentMode, "retreat");
  ctx.params.intentGiveUpLoss = 0.9;
  a = plans(); planIntent(ctx, { stalled: 6 }, a); assert.equal(a[0]!.intentMode, undefined);
});

test("hold／survive 達得到時即使戰況差也不撤；hold 不可達才撤", () => {
  for (const kind of ["hold", "survive"] as const) {
    const { ctx, plans } = fixture();
    ctx.s.round = 12; ctx.s.rt!.maxRounds = 15;
    hurt(ctx, "a", 0.2);
    const objective = { kind, for: "p", params: { rounds: kind === "hold" ? 5 : 15 }, onComplete: "win" as const };
    ctx.s.rt!.objectives = [objective];
    ctx.s.rt!.holdProgress = { [JSON.stringify(objective)]: { round: 12, count: 2 } };
    const memory: IntentMemory = {};
    let a = plans(); planIntent(ctx, memory, a);
    assert.equal(a[0]!.intentMode, undefined, kind);
    assert.equal(memory.retreat, undefined, kind);
    if (kind === "hold") {
      ctx.s.rt!.holdProgress[JSON.stringify(objective)]!.count = 1;
      a = plans(); planIntent(ctx, memory, a);
      assert.equal(a[0]!.intentMode, "retreat");
      assert.equal(memory.retreat, true);
    }
  }
});

test("禁撤時不可達且戰況差也不寫整隊撤退", () => {
  const { ctx, plans } = fixture();
  ctx.s.round = 12; ctx.s.rt!.maxRounds = 13; ctx.s.rt!.noRetreat = true;
  hurt(ctx, "a", 0.2);
  const memory: IntentMemory = { stalled: 6 };
  const a = plans(); planIntent(ctx, memory, a);
  assert.equal(memory.retreat, undefined);
  assert.equal(a[0]!.intentMode, undefined);
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

test("berserk 設定檔仍遵守撤退意圖，真正失控才忽略撤退", () => {
  for (const berserk of [false, true]) {
    const { ctx, rules } = fixture([unit("a", "p", 0), unit("e", "e", 6)]);
    if (berserk) ctx.s.units.a!.controlMode = "berserk";
    ctx.assignment = { unit: "a", stance: "hold", allowRetreat: true, intentMode: "retreat" };
    const commands = takeTurn({ ...ctx, exec: rules.exec }, createAgent("a", "berserk"));
    assert.equal(commands.some(c => c.kind === "retreat"), !berserk);
  }
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
    ctx.s.round = 12; ctx.s.rt!.maxRounds = 13;
    memory.stalled = 6; ctx.params.intentGiveUpRatio = 100;
    ctx.params.commanderScatter = 1; ctx.params.humanCommanderScatter = 1;
    let a = plans(); planIntent(ctx, memory, a); assert.equal(a[0]!.intentMode, "retreat");
    ctx.params.commanderScatter = 0; ctx.params.humanCommanderScatter = 0;
    a = plans(); planIntent(ctx, memory, a); assert.equal(a[0]!.intentMode, "instinct");
    assert.equal(memory.retreat, undefined, "指揮者陣亡仍只走潰散，不寫整隊撤退");
  }
});

test("多目標仍可守住或生存時，不因斬首打不完而撤", () => {
  for (const kind of ["survive", "hold"] as const) {
    const { ctx, plans } = fixture();
    ctx.s.round = 12;
    ctx.params.intentGiveUpRatio = 100;
    const objective = { kind, for: "p", params: { rounds: kind === "survive" ? 30 : 3 }, onComplete: "win" as const };
    ctx.s.rt!.objectives = [{ kind: "killTarget", for: "p", params: { unit: "e" }, onComplete: "win" }, objective];
    const a = plans(); planIntent(ctx, { stalled: 10 }, a);
    assert.notEqual(a[0]!.intentMode, "retreat", kind);
    ctx.s.rt!.objectives = ctx.s.rt!.objectives.slice(0, 1);
    const b = plans(); planIntent(ctx, { stalled: 10 }, b);
    assert.equal(b[0]!.intentMode, "retreat", `${kind} 移除後只剩不可達斬首`);
  }
});

test("killTarget 只用目標剩餘 HP 估輪數，不把護衛 HP 算進去", () => {
  const { ctx, plans } = fixture([unit("a", "p", 2), unit("e", "e", 6), unit("guard", "e", 7)]);
  ctx.params = { intentGiveUpRatio: 100, intentDamageAlpha: 1 };
  ctx.s.round = 8;
  ctx.s.rt!.objectives = [{ kind: "killTarget", for: "p", params: { units: ["e"] }, onComplete: "win" }];
  hurt(ctx, "e", 0.3);
  const memory: IntentMemory = {};
  planIntent(ctx, memory, plans());
  ctx.s.round++;
  ctx.s.rt!.maxRounds = 15;
  hurt(ctx, "e", 0.2);
  const a = plans(); planIntent(ctx, memory, a);
  assert.notEqual(a[0]!.intentMode, "retreat");
  ctx.s.rt!.objectives[0]!.params.units = ["e", "guard"];
  const b = plans(); planIntent(ctx, memory, b);
  assert.equal(b[0]!.intentMode, "retreat", "兩個指定目標都要納入");
});

test("profile params 覆寫戰況比例門檻與傷害平滑權重生效", () => {
  const { ctx, plans } = fixture();
  ctx.s.round = 12;
  ctx.params.intentGiveUpRatio = 0.9;
  let a = plans(); planIntent(ctx, { stalled: 10 }, a);
  assert.notEqual(a[0]!.intentMode, "retreat");
  ctx.params.intentGiveUpRatio = 1.1;
  a = plans(); planIntent(ctx, { stalled: 10 }, a);
  assert.equal(a[0]!.intentMode, "retreat");
  const decision = (alpha: number) => {
    const { ctx, plans } = fixture();
    ctx.params = { intentDamageAlpha: alpha, intentGiveUpRatio: 100, intentStallRounds: 1 };
    ctx.s.round = 8;
    const memory: IntentMemory = {};
    ctx.params.intentMinRound = 10;
    planIntent(ctx, memory, plans());
    ctx.s.round++; hurt(ctx, "e", 0.6); planIntent(ctx, memory, plans());
    ctx.s.round++; ctx.s.rt!.maxRounds = 15;
    const a = plans(); planIntent(ctx, memory, a);
    return a[0]!.intentMode;
  };
  assert.equal(decision(0), undefined, "保留上一輪傷害後仍有機會");
  assert.equal(decision(1), "retreat", "只看單輪零傷害且達自訂停滯門檻時放棄");
});

test("進場重傷與低士氣首輪未受壓時不自行撤離，護送出口仍有效", () => {
  for (const morale of ["steady", "breaking", "fleeing"] as const) {
    const { ctx, rules } = fixture([unit("a", "p", 0), unit("e", "e", 6)]);
    ctx.s.round = 1; hurt(ctx, "a", 0.1);
    ctx.s.persons["a-pilot"]!.morale = morale;
    assert.equal(individualRetreat(ctx, "a"), false, morale);
    assert.equal(takeTurn({ ...ctx, exec: rules.exec }, createAgent("a", "tactical")).some(c => c.kind === "retreat"), false, morale);
  }
  const { ctx, rules } = fixture([unit("a", "p", 0), unit("e", "e", 6)]);
  ctx.s.round = 1;
  ctx.s.rt!.objectives = [{ kind: "escort", for: "p", params: { unit: "a" }, onComplete: "win" }];
  assert.ok(takeTurn({ ...ctx, exec: rules.exec }, createAgent("a", "tactical")).some(c => c.kind === "retreat"));
});

test("首輪實際受火、受創或士氣惡化仍能撤；友軍出手不算自身受壓", () => {
  const events: Pick<GameEvent, "type" | "payload">[] = [
    { type: "Miss", payload: { unit: "e", target: "a" } },
    { type: "LayerDamaged", payload: { unit: "a", amount: 10 } },
    { type: "MoraleChanged", payload: { person: "a-pilot", from: "shaken", to: "breaking" } },
  ];
  for (const event of events) {
    const { ctx, rules } = fixture([unit("a", "p", 0), unit("e", "e", 6)]);
    ctx.s.round = 1; hurt(ctx, "a", 0.1); ctx.s.persons["a-pilot"]!.morale = "breaking";
    ctx.s.log.events.push({ seq: 1, round: 1, type: "Miss", payload: { unit: "a", target: "e" } });
    assert.equal(individualRetreat(ctx, "a"), false);
    ctx.s.log.events.push({ seq: 2, round: 1, ...event });
    assert.equal(individualRetreat(ctx, "a"), true, event.type);
    assert.ok(takeTurn({ ...ctx, exec: rules.exec }, createAgent("a", "tactical")).some(c => c.kind === "retreat"), event.type);
  }
});

test("profile params 可覆寫個體撤退觀察輪數並傳到 fleeing 策略與撤退評分", () => {
  const { ctx, rules } = fixture([unit("a", "p", 0), unit("e", "e", 6)]);
  ctx.s.round = 3; ctx.s.persons["a-pilot"]!.morale = "fleeing";
  ctx.params.individualRetreatMinRound = 4;
  assert.equal(individualRetreat(ctx, "a"), false);
  assert.equal(takeTurn({ ...ctx, exec: rules.exec }, createAgent("a", "tactical")).some(c => c.kind === "retreat"), false);
  const next = fixture([unit("a", "p", 0), unit("e", "e", 6)]);
  next.ctx.s.round = 1; next.ctx.s.persons["a-pilot"]!.morale = "fleeing";
  next.ctx.params.individualRetreatMinRound = 1;
  assert.equal(individualRetreat(next.ctx, "a"), true);
  assert.ok(takeTurn({ ...next.ctx, exec: next.rules.exec }, createAgent("a", "tactical")).some(c => c.kind === "retreat"));
});

test("致死 HP：斬首與捕獲只估所有核心到最後結構層，殲滅仍估全身", () => {
  for (const kind of ["killTarget", "capture"] as const) {
    const enemy = unit("e", "e", 6);
    enemy.parts = [
      { id: "core", functions: ["core"], layers: [
        { type: "armor", hp: 12 }, { type: "structure", hp: 14 },
        { type: "structure", hp: 16 }, { type: "component", hp: 200 },
      ] },
      { id: "trunk", functions: [], layers: [{ type: "structure", hp: 1000 }] },
    ];
    const { ctx, plans } = fixture([unit("a", "p", 2), enemy]);
    ctx.s.round = 8; ctx.s.rt!.maxRounds = 13;
    ctx.params = { intentGiveUpRatio: 100 };
    ctx.s.rt!.objectives = [{ kind, for: "p", params: { unit: "e" }, onComplete: "win" }];
    const decide = () => {
      const a = plans(); planIntent(ctx, { lastRound: 8, damageRate: 15 }, a);
      return a[0]!.intentMode;
    };
    assert.notEqual(decide(), "retreat", kind);
    ctx.s.rt!.objectives[0]!.kind = "eliminate";
    assert.equal(decide(), "retreat", "非斬首／捕獲保留全身估算");
  }
});

test("致死 HP：多核心合計、已毀核心略過，缺部位情報退回原估算", () => {
  const enemy = unit("e", "e", 6);
  enemy.parts = [
    { id: "first", functions: ["core"], layers: [{ type: "structure", hp: 20 }] },
    { id: "second", functions: ["core"], layers: [{ type: "structure", hp: 20 }] },
    { id: "trunk", functions: [], layers: [{ type: "structure", hp: 1000 }] },
  ];
  const { ctx, plans } = fixture([unit("a", "p", 2), enemy]);
  ctx.s.round = 8; ctx.s.rt!.maxRounds = 13;
  ctx.params = { intentGiveUpRatio: 100 };
  ctx.s.rt!.objectives = [{ kind: "killTarget", for: "p", params: { units: ["e"] }, onComplete: "win" }];
  ctx.view = structuredClone(ctx.s);
  const decide = (damageRate: number) => {
    const a = plans(); planIntent(ctx, { lastRound: 8, damageRate }, a);
    return a[0]!.intentMode;
  };
  assert.notEqual(decide(15), "retreat", "40 HP 可在三輪內打完");
  assert.equal(decide(10), "retreat", "必須合計兩核，不只取其中一核");
  ctx.view.units.e!.parts.first!.broken = true;
  assert.notEqual(decide(10), "retreat", "只讀 view 的已毀核心，不讀 s 的完整核心");
  delete ctx.view.units.e!.parts.second;
  assert.equal(decide(15), "retreat", "缺核心快照時退回全身 HP");
});

test("整隊撤退的 ratio 嚴格小於與 loss 大於等於精確邊界", () => {
  const { ctx, plans } = fixture();
  ctx.s.round = 12; ctx.s.rt!.maxRounds = 13;
  const ratio = forceRatio(ctx.q, ctx.s, ctx.view, ctx.slot);
  ctx.params = { intentGiveUpRatio: ratio, intentGiveUpLoss: 1 };
  let a = plans(); planIntent(ctx, { stalled: 10 }, a);
  assert.equal(a[0]!.intentMode, undefined, "ratio 相等不可撤");
  ctx.params.intentGiveUpRatio = ratio + 0.001;
  a = plans(); planIntent(ctx, { stalled: 10 }, a);
  assert.equal(a[0]!.intentMode, "retreat");
  hurt(ctx, "a", 0.5);
  ctx.params = { intentGiveUpRatio: 0, intentGiveUpLoss: 0.5 };
  a = plans(); planIntent(ctx, { stalled: 10 }, a);
  assert.equal(a[0]!.intentMode, "retreat", "loss 恰達門檻即撤");
  ctx.params.intentGiveUpLoss = 0.501;
  a = plans(); planIntent(ctx, { stalled: 10 }, a);
  assert.equal(a[0]!.intentMode, undefined);
});

test("目標路程依 for 出口及被護送者位置，不借最近友軍位置", () => {
  for (const kind of ["reachExit", "escort"] as const) {
    const { ctx, plans } = fixture([unit("a", "p", 7), unit("near", "p", 0), unit("e", "e", 6)]);
    ctx.s.round = 12; ctx.s.rt!.maxRounds = 15;
    ctx.params = { intentGiveUpRatio: 100, intentTravelPerRound: 1, intentExitReserve: 0 };
    ctx.s.rt!.exitsBySlot = { p: [{ x: 8, y: 2 }], e: [{ x: 0, y: 2 }] };
    ctx.s.rt!.objectives = [{ kind, for: "p", params: { unit: "a" }, onComplete: "win" }];
    let a = plans(); planIntent(ctx, {}, a);
    assert.equal(a.find(a => a.unit === "a")!.intentMode, undefined, "己方出口一格且預留逃逸一格");
    ctx.s.rt!.exitsBySlot.p = [{ x: 0, y: 2 }];
    a = plans(); planIntent(ctx, {}, a);
    assert.equal(a.find(a => a.unit === "a")!.intentMode, "retreat", "不能借已在出口的 near 宣稱 a 可達");
  }
});

test("無目標出口仍可由合法撤離完成；已撤離與未知位置保護保留", () => {
  const { ctx, plans } = fixture();
  ctx.s.round = 12; ctx.s.rt!.maxRounds = 30;
  ctx.params.intentGiveUpRatio = 100;
  ctx.s.rt!.exits = [];
  ctx.s.rt!.objectives = [{ kind: "escort", for: "p", params: { unit: "a" }, onComplete: "win" }];
  let a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, undefined, "舊空出口可由 owner 四邊撤離完成護送");
  ctx.s.rt!.unitStatus.a = "retreated";
  const memory: IntentMemory = {};
  planIntent(ctx, memory, []);
  assert.equal(memory.retreat, undefined, "全已撤離即達成，不被空出口判不可達");
  delete ctx.s.rt!.unitStatus.a;
  ctx.view = structuredClone(ctx.s); delete ctx.view.units.a;
  const hidden: IntentMemory = {};
  planIntent(ctx, hidden, plans());
  assert.equal(hidden.retreat, undefined, "不偷讀未知目標位置");
});

test("slot 明列空出口時不寫整隊撤退，不捏造四邊", () => {
  const { ctx, plans } = fixture();
  ctx.s.round = 12; ctx.s.rt!.maxRounds = 13;
  ctx.params.intentGiveUpRatio = 100; ctx.s.rt!.exitsBySlot = { p: [] };
  const memory: IntentMemory = {};
  const a = plans(); planIntent(ctx, memory, a);
  assert.equal(memory.retreat, undefined);
  assert.equal(a[0]!.intentMode, undefined);
});

test("跨 owner 護送：for 無目標出口時仍可由目標 owner 撤離完成", () => {
  const { ctx, plans } = fixture([unit("a", "p", 2), unit("passenger", "ally", 7), unit("e", "e", 6)]);
  ctx.s.round = 12; ctx.s.rt!.maxRounds = 18;
  ctx.params = { intentGiveUpRatio: 100, intentTravelPerRound: 1, intentExitReserve: 0 };
  ctx.s.rt!.exits = [];
  ctx.s.rt!.exitsBySlot = { ally: [{ x: 8, y: 2 }] };
  ctx.s.rt!.objectives = [{ kind: "escort", for: "p", params: { unit: "passenger" }, onComplete: "win" }];
  assert.deepEqual(ctx.q.exitsFor(ctx.view, "p"), []);
  let a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, undefined, "一格後可撤，不能因 for 空出口宣布不可能");
  ctx.s.rt!.exitsBySlot.ally = [];
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, "retreat", "目標 owner 也禁撤時才無完成路徑");
  ctx.s.rt!.unitStatus.passenger = "retreated";
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, undefined, "已撤離不再需要出口");
  ctx.s.rt!.objectives[0]!.kind = "reachExit";
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, "retreat", "reachExit 即使已撤仍須 owner 等於 for");
});

test("已知死亡或不存在的護送目標不被未知目標保護；隱藏死亡不偷讀", () => {
  const { ctx, plans } = fixture([unit("a", "p", 2), unit("passenger", "ally", 7), unit("e", "e", 6)]);
  ctx.s.round = 12; ctx.s.rt!.maxRounds = 30;
  ctx.params = { intentGiveUpRatio: 100, intentGiveUpLoss: 0 };
  ctx.s.rt!.objectives = [{ kind: "escort", for: "p", params: { units: ["e", "passenger"] }, onComplete: "win" }];
  ctx.view = structuredClone(ctx.s);
  delete ctx.view.units.e; delete ctx.view.rt!.unitStatus.e;
  ctx.s.rt!.unitStatus.e = "dead";
  let a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, undefined, "完整 s 隱藏敵人死亡不能用來判不可達");
  ctx.s.rt!.objectives[0]!.params.units = ["e"];
  ctx.s.rt!.maxRounds = 12;
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, undefined, "時間不足仍不憑未知位置判不可達");
  ctx.s.rt!.maxRounds = 30;
  ctx.s.rt!.objectives[0]!.params.units = ["e", "passenger"];
  ctx.view.rt!.unitStatus.passenger = "dead";
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, "retreat", "公開死亡即不可完成，未知 e 不掩護它");
  delete ctx.view.units.passenger; delete ctx.view.rt!.unitStatus.passenger;
  delete ctx.s.units.passenger;
  a = plans(); planIntent(ctx, {}, a);
  assert.equal(a[0]!.intentMode, "retreat", "不存在 id 不等同於不可見位置");
});
