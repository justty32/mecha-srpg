import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { createContentDB } from "../content/contentdb.ts";
import type { RulesTables } from "../content/contentdb.ts";
import { CONTENT_KINDS } from "../core/ids.ts";
import { createBattle, eject } from "./flow.ts";
import { commanderOf, makeUnit, person, unit, rt } from "./state.ts";
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
import { autonomyNodes, controlCheck, handOver, setControl, cockpitOf, isDriven } from "./control.ts";
import { cloneRng, d100 } from "../core/rng.ts";
import { runActions } from "./hooks.ts";
import { killPerson } from "./injury.ts";
import { beginTurn, currentActor, startBattle } from "./turn.ts";
import { abilitiesOf, checkAbility, tryCommand } from "./command.ts";

test("人物能力：驅動時合併天生與後天能力，普通開與死亡人物不併入", () => {
  const ctx = fixture(defs => { defs.person!["base:person/ren-kasai"]!.abilities = ["ability/pa-quick-thought"]; });
  person(ctx, "s").abilities = ["ability/pa-tame-instinct"];
  const human = "base:ability/pa-quick-thought", soul = "base:ability/pa-tame-instinct";
  assert(abilitiesOf(ctx, "u").includes(human)); assert(abilitiesOf(ctx, "u").includes(soul));
  unit(ctx, "u").core = false;
  assert(!abilitiesOf(ctx, "u").includes(human)); assert(!abilitiesOf(ctx, "u").includes(soul));
  unit(ctx, "u").core = true; person(ctx, "p").pools.hp!.cur = 0;
  assert(!abilitiesOf(ctx, "u").includes(human)); assert(abilitiesOf(ctx, "u").includes(soul));
  const other = makeUnit(ctx, { id: "new-mech", frame: "frame/hound-mk2", owner: "player", pos: { x: 3, y: 3 },
    persons: [{ id: "new-pilot", def: "person/ren-kasai", seat: "pilot", state: { abilities: [soul] } }] });
  assert(abilitiesOf(ctx, other.id).includes(soul));
});

test("DC-C02 contested 依雙方骰與控制值選指令權者", () => {
  const ctx = fixture(); unit(ctx, "u").controlMode = "contested";
  const rng = cloneRng(ctx.s.rng), a = d100(rng) + 40, b = d100(rng) + 45;
  const expected = a >= b ? "p" : "s";
  signal(ctx, "turnStartPre", { unit: "u" });
  assert.equal(rt(ctx.s).commander.u, expected); assert.deepEqual(ctx.s.rng, rng);
});
test("DC-C05 DC-C06 shared、soul、disabled 與 setControl 動詞", () => {
  const ctx = fixture(); setControl(ctx, "u", "shared", "test");
  assert.equal(controlCheck(ctx, "u"), "p");
  runActions(ctx, [{ do: "setControl", mode: "soul" }], { inst: null, self: { person: "p" }, source: "test" });
  assert.equal(rt(ctx.s).commander.u, "s");
  setControl(ctx, "u", "disabled", "test"); assert.equal(controlCheck(ctx, "u"), null);
  const event = ctx.s.log.events.at(-1)!;
  assert.deepEqual(event.payload, { unit: "u", from: "soul", to: "disabled", commander: null });
});
test("DC-C08 autonomy 只計已解鎖且 research 有該鍵的節點", () => {
  const ctx = fixture(defs => {
    defs.soultree!["base:soultree/standard"]!.nodes = [
      { id: "auto", perk: "base:effect/trait-vengeful", research: { autonomy: 0 }, requires: [] },
      { id: "assist", perk: "base:effect/trait-vengeful", research: { assist: 1 }, requires: [] },
      { id: "locked", perk: "base:effect/trait-vengeful", research: { autonomy: 1 }, requires: [] }];
  });
  person(ctx, "s").will.soulTree!.nodes = ["auto", "assist", "auto"];
  assert.equal(autonomyNodes(ctx, "s"), 1); assert.equal(autonomyNodes(ctx, "p"), 0);
  killPerson(ctx, "p", "u"); assert.equal(unit(ctx, "u").controlMode, "soul"); assert.equal(rt(ctx.s).commander.u, "s");
});
test("駕駛員死亡後無自主節點則停機，所有座位清空則 none", () => {
  const ctx = fixture(); killPerson(ctx, "p", "u"); assert.equal(unit(ctx, "u").controlMode, "disabled");
  killPerson(ctx, "s", "u"); handOver(ctx, "u"); assert.equal(unit(ctx, "u").controlMode, "none");
  assert.equal(rt(ctx.s).commander.u, null);
});

test("無座位人物的怪獸以 instinct 控制，交接後仍無人物指令權者", () => {
  const ctx = fixture();
  const wolf = makeUnit(ctx, { id: "wolf", owner: "enemy", pos: { x: 2, y: 1 },
    monster: { species: "species/tidewolf", grade: "C" } });
  assert.equal(wolf.controlMode, "instinct");
  assert.equal(commanderOf(ctx, "wolf"), null);
  setControl(ctx, "wolf", "none", "test");
  handOver(ctx, "wolf");
  assert.equal(wolf.controlMode, "instinct");
  assert.equal(controlCheck(ctx, "wolf"), null);
  assert.equal(commanderOf(ctx, "wolf"), null);
});

test("instinct 怪獸可移動與使用能力，扣機體 AP 並於下一回合恢復", () => {
  const ctx = fixture(defs => {
    // 測試成本歸屬，不變更正式能力的平衡資料。
    defs.ability!["base:ability/bite"]!.costs = [
      { owner: "person", pool: "ap", amount: 2 }, { owner: "mech", pool: "ap", amount: 1 }];
  });
  ctx.s = createBattle(ctx.db, { id: "instinct-turn", map: { width: 5, height: 5, fill: "terrain/plain", exits: [] },
    units: [{ id: "wolf", owner: "player", pos: { x: 1, y: 1 }, monster: { species: "species/tidewolf", grade: "C" } },
      { id: "target", owner: "enemy", pos: { x: 3, y: 1 }, monster: { species: "species/tidewolf", grade: "D" } }],
    objectives: [], maxRounds: 3 }, 42);
  startBattle(ctx);
  const wolf = unit(ctx, "wolf"), initial = wolf.pools.ap!.cur;
  assert.equal(currentActor(ctx.s), "wolf");
  assert.equal(tryCommand(ctx, { kind: "move", actor: "wolf", path: [{ x: 2, y: 1 }] }).ok, true);
  assert.deepEqual(wolf.pos, { x: 2, y: 1 });
  assert.equal(wolf.pools.ap!.cur, initial - 1);
  const cmd = { kind: "useAbility" as const, actor: "wolf", ability: "ability/bite", target: { unit: "target" } };
  assert.equal(tryCommand(ctx, cmd).ok, true);
  assert.equal(wolf.pools.ap!.cur, initial - 4);
  assert.ok(ctx.s.log.events.some(e => e.type === "AbilityUsed" && e.payload.unit === "wolf"));
  wolf.pools.ap!.cur = 2;
  assert.equal(checkAbility(ctx, "wolf", cmd.ability, cmd.target)?.code, "cannot-pay");
  const ap = wolf.pools.ap!;
  delete wolf.pools.ap;
  assert.equal(checkAbility(ctx, "wolf", cmd.ability, cmd.target)?.code, "cannot-pay");
  wolf.pools.ap = ap;
  assert.equal(tryCommand(ctx, { kind: "end", actor: "wolf" }).ok, true);
  assert.equal(currentActor(ctx.s), "target");
  assert.equal(tryCommand(ctx, { kind: "end", actor: "target" }).ok, true);
  assert.equal(ctx.s.round, 2);
  assert.equal(currentActor(ctx.s), "wolf");
  assert.equal(wolf.pools.ap!.cur, initial);
});

test("棄機後 derelict 保持 none，beginTurn 自動結束其回合", () => {
  const ctx = fixture();
  assert.equal(eject(ctx, "u"), null);
  handOver(ctx, "u");
  assert.equal(rt(ctx.s).unitStatus.u, "derelict");
  assert.equal(unit(ctx, "u").controlMode, "none");
  assert.equal(commanderOf(ctx, "u"), null);
  beginTurn(ctx, "u", false);
  assert.ok(rt(ctx.s).acted.includes("u"));
  assert.notEqual(currentActor(ctx.s), "u");
  assert.ok(ctx.s.log.events.some(e => e.type === "TurnEnd" && e.payload.unit === "u"));
});


test("座艙五態：human、soul 優先於 ai／remote，死亡人物不驅動核心", () => {
  const ctx = fixture();
  assert.equal(cockpitOf(ctx, "u"), "human"); assert.equal(isDriven(ctx, "u"), true);
  unit(ctx, "u").crew = "ai";
  killPerson(ctx, "p", "u");
  assert.equal(cockpitOf(ctx, "u"), "soul"); assert.equal(isDriven(ctx, "u"), true);
  killPerson(ctx, "s", "u");
  assert.equal(cockpitOf(ctx, "u"), "ai"); assert.equal(isDriven(ctx, "u"), false);
  unit(ctx, "u").crew = "remote"; assert.equal(cockpitOf(ctx, "u"), "remote");
  delete unit(ctx, "u").crew; assert.equal(cockpitOf(ctx, "u"), "empty");
  const wolf = makeUnit(ctx, { id: "wolf", owner: "enemy", pos: { x: 2, y: 2 }, monster: { species: "species/tidewolf", grade: "C" } });
  assert.equal(isDriven(ctx, wolf.id), true);
  unit(ctx, "v").core = false; assert.equal(cockpitOf(ctx, "v"), "human"); assert.equal(isDriven(ctx, "v"), false);
});

test("普通開只留基本動作與武器，擋機體招式、actorRole 與 drivenOnlyTags", () => {
  const ctx = fixture(defs => {
    const frame = defs.frame!["base:frame/hound-mk2"]!;
    frame.innateAbilities = ["base:ability/mx-frame-strike", "base:ability/bite"];
    const weapon = defs.component!["base:component/autocannon-30"]!;
    const plain = defs.ability!["base:ability/burst-30"]!;
    weapon.abilities = [plain.id];
    for (const tag of ["ancient", "soul", "captain", "command"]) {
      const id = `base:ability/driven-${tag}`;
      defs.ability![id] = { ...plain, id, tags: [tag] }; weapon.abilities.push(id);
    }
    defs.ability!["base:ability/role-test"] = { ...plain, id: "base:ability/role-test", actorRole: "pilot" };
    weapon.abilities.push("base:ability/role-test");
  });
  makeUnit(ctx, { id: "drone", frame: "frame/hound-mk2", crew: "remote", owner: "player", pos: { x: 0, y: 1 },
    components: { "left-weapon": "component/autocannon-30" } });
  assert.deepEqual(abilitiesOf(ctx, "drone"), ["base:ability/burst-30", "base:ability/mx-frame-strike"]);
  assert.equal(checkAbility(ctx, "drone", "ability/bite")?.code, "unknown-ability");
  unit(ctx, "drone").seats.pilot = "p";
  assert.equal(abilitiesOf(ctx, "drone").length, 8);
  unit(ctx, "drone").core = false;
  assert.deepEqual(abilitiesOf(ctx, "drone"), ["base:ability/burst-30", "base:ability/mx-frame-strike"]);
});

test("駕駛死亡或棄機後 crew 接手 scripted；自主機魂仍優先", () => {
  const ctx = fixture(defs => {
    defs.soultree!["base:soultree/standard"]!.nodes = [
      { id: "auto", perk: "base:effect/trait-vengeful", research: { autonomy: 1 }, requires: [] }];
  });
  unit(ctx, "u").crew = "ai";
  person(ctx, "s").will.soulTree!.nodes = ["auto"];
  killPerson(ctx, "p", "u"); assert.equal(unit(ctx, "u").controlMode, "soul");
  killPerson(ctx, "s", "u"); assert.equal(unit(ctx, "u").controlMode, "scripted");
  assert.equal(commanderOf(ctx, "u"), null);
  unit(ctx, "v").crew = "remote";
  assert.equal(eject(ctx, "v"), null);
  assert.equal(unit(ctx, "v").controlMode, "scripted");
  assert.equal(rt(ctx.s).unitStatus.v, "active"); assert.equal(cockpitOf(ctx, "v"), "remote");
  const second = fixture(); unit(second, "u").crew = "ai";
  killPerson(second, "p", "u"); assert.equal(unit(second, "u").controlMode, "scripted");
});

test("scripted 用機體 AP 移動與基本動作，下一回合回復 crewPools", () => {
  const ctx = fixture();
  ctx.s = createBattle(ctx.db, { id: "scripted-turn", map: { width: 5, height: 5, fill: "terrain/plain", exits: [] },
    units: [{ id: "drone", owner: "player", frame: "frame/hound-mk2", crew: "ai", pos: { x: 1, y: 1 } },
      { id: "target", owner: "enemy", monster: { species: "species/tidewolf", grade: "D" }, pos: { x: 3, y: 1 } }],
    objectives: [], maxRounds: 3 }, 42);
  const drone = unit(ctx, "drone");
  beginTurn(ctx, "drone", false);
  assert.equal(drone.controlMode, "scripted"); assert.equal(drone.pools.ap!.cur, 7);
  assert.equal(tryCommand(ctx, { kind: "move", actor: "drone", path: [{ x: 2, y: 1 }] }).ok, true);
  const before = drone.pools.ap!.cur;
  assert.equal(tryCommand(ctx, { kind: "useAbility", actor: "drone", ability: "ability/mx-head-vulcan", target: { unit: "target" } }).ok, true);
  assert.equal(drone.pools.ap!.cur, before - 2);
  drone.pools.fatigue!.cur = 40;
  beginTurn(ctx, "drone", false);
  assert.equal(drone.pools.ap!.cur, 7); assert.equal(drone.pools.fatigue!.cur, 0);
});
