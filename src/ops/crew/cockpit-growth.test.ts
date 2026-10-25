import test from "node:test";
import assert from "node:assert/strict";
import { fixture, result } from "../sortie/test-support.ts";
import { applyBattleResult } from "../sortie/apply.ts";
import { instantiateMech, instantiatePerson } from "../content/instantiate.ts";
import { createContentDB } from "../../content/contentdb.ts";
import { CONTENT_KINDS } from "../../core/ids.ts";
import { sortieBattleSetup } from "../sortie/run.ts";
import { controlMode, draftError } from "../../ui-adapter/ops/vm/formation.ts";
import type { Grade } from "../../core/types-def.ts";

function setup(soul = false) {
  const f = fixture(), { s, ctx, sortie, mech, person } = f;
  ctx.db = { ...ctx.db, rules: structuredClone(ctx.db.rules) };
  if (soul) s.roster.persons[person] = instantiatePerson(ctx.db, person, "person/awakened-soul");
  const seat = soul ? "soul" : "pilot";
  sortie.units[0]!.seats = { [seat]: person }; sortie.units[0]!.controlMode = soul ? "soul" : "pilot";
  s.mechs[mech]!.seats = { pilot: null, soul: null, [seat]: person };
  s.roster.persons[person]!.seat = { mech, role: seat };
  const battle = result();
  battle.units.push({ id: mech, state: structuredClone(s.mechs[mech]!), status: "alive" });
  battle.persons.push({ id: person, state: structuredClone(s.roster.persons[person]!), status: "alive", xpGained: 0 });
  return { ...f, battle, growth: ctx.db.rules.cockpit!.growth! };
}

test("驅動時數只給有核心且在座的活人與機魂；無核心、遠端、AI 與未上機者不增加", () => {
  for (const mode of ["human", "soul", "no-core", "remote", "ai"] as const) {
    const { s, ctx, sortie, mech, person, battle, growth } = setup(mode === "soul");
    if (mode === "no-core") battle.units[0]!.state.core = false;
    if (mode === "remote" || mode === "ai") { battle.units[0]!.state.seats = {}; battle.units[0]!.state.crew = mode; sortie.units[0]!.seats = {}; }
    const others = Object.keys(s.roster.persons).filter(id => id !== person);
    applyBattleResult(s, ctx, sortie, battle);
    assert.equal(s.roster.persons[person]!.driveHours ?? 0, ["human", "soul"].includes(mode) ? battle.rounds * growth.driveHoursPerRound : 0, mode);
    assert(others.every(id => !s.roster.persons[id]!.driveHours));
    const after = structuredClone(s); applyBattleResult(s, ctx, sortie, battle); assert.deepEqual(s, after);
    assert(s.mechs[mech]);
  }
});

test("第一門檻獲得能力且受最高驅動等級與 S 上限限制；人物能力去重並受個數上限限制", () => {
  for (const grade of ["D", "SSS"] as Grade[]) {
    const { s, ctx, sortie, mech, person, battle, growth } = setup();
    const defs = structuredClone(Object.fromEntries(CONTENT_KINDS.map(kind => [kind, Object.fromEntries(ctx.db.all(kind).map(d => [d.id, d]))]))) as Parameters<typeof createContentDB>[3];
    const ids = growth.abilityPool;
    defs.frame![s.mechs[mech]!.frame]!.grade = grade;
    defs.ability![ids[0]!]!.grade = "D"; defs.ability![ids[1]!]!.grade = "S"; defs.ability![ids[2]!]!.grade = "SS";
    growth.abilityPool = ids.slice(0, 3);
    if (grade === "SSS") growth.abilityPool = [ids[2]!, ids[1]!];
    ctx.db = createContentDB([...ctx.db.packs], ctx.db.registries, ctx.db.rules, defs);
    s.roster.persons[person]!.driveHours = growth.abilityHours[0]! - battle.rounds * growth.driveHoursPerRound;
    applyBattleResult(s, ctx, sortie, battle);
    const p = s.roster.persons[person]!;
    assert.deepEqual(p.abilities, [grade === "D" ? ids[0] : ids[1]]);
    assert.equal(p.maxDrivenGrade, grade);
    assert(s.log.some(e => e.type === "AbilityGained" && e.payload.person === person && e.payload.ability === p.abilities![0]));
    p.abilities = [...ids.slice(0, growth.abilityCap)]; p.driveHours = 10000;
    sortie.id += "-again"; applyBattleResult(s, ctx, sortie, battle);
    assert.equal(s.roster.persons[person]!.abilities!.length, growth.abilityCap);
  }
});

test("機魂能力門檻以人的十分之一速度累積，滿門檻才長出", () => {
  for (const reached of [false, true]) {
    const { s, ctx, sortie, person, battle, growth } = setup(true);
    s.roster.persons[person]!.driveHours = growth.abilityHours[0]! / (reached ? growth.soulGrowthFactor : 1) - battle.rounds * growth.driveHoursPerRound;
    applyBattleResult(s, ctx, sortie, battle);
    assert.equal(s.roster.persons[person]!.abilities?.length ?? 0, reached ? 1 : 0);
  }
});

test("編隊 AI 空座自駕傳入 crew 並成 scripted；有人時仍由 human 驅動，後天能力進入戰鬥", () => {
  const { s, ctx, sortie, person } = setup();
  const unit = sortie.units[0]!; unit.crew = "ai";
  s.roster.persons[person]!.abilities = [ctx.db.require("ability", "ability/pa-quick-thought").id];
  assert.equal(controlMode(s, ctx, unit), "pilot");
  let prepared = sortieBattleSetup(s, ctx, sortie); assert(prepared.ok);
  assert.deepEqual(prepared.sim.setup.units.find(u => u.owner === "player")!.persons![0]!.state!.abilities, s.roster.persons[person]!.abilities);
  unit.seats = {}; unit.controlMode = "none";
  assert.equal(controlMode(s, ctx, unit), "scripted"); assert.equal(draftError(s, ctx, sortie), null);
  prepared = sortieBattleSetup(s, ctx, sortie); assert(prepared.ok);
  const player = prepared.sim.setup.units.find(u => u.owner === "player")!;
  assert.equal(player.controlMode, "scripted"); assert.equal(player.crew, "ai");
  assert.equal(prepared.scenario.slots.player!.units[0]!.crew, "ai");
});

test("AI 醒魂機率一：大潮與古代機各自能醒，事件、名冊、登記名、座位及計數歸零", () => {
  for (const trigger of ["tide", "ancient"] as const) {
    const { s, ctx, sortie, mech, battle, growth } = setup();
    sortie.units[0]!.crew = "ai"; battle.units[0]!.state.crew = "ai";
    s.mechs[mech]!.aiBattles = growth.awakenMinAiBattles - 1;
    growth.awakenChanceTide = 1; growth.awakenChanceAncient = 1;
    s.clock.phase = "spring"; s.clock.tide = trigger === "tide" ? 3 : 2;
    if (trigger === "ancient") {
      const frame = ctx.db.all("frame").find(f => f.cls === "ancient")!;
      battle.units.push({ id: "ancient", status: "alive", state: instantiateMech(ctx.db, "ancient", frame.id) });
    }
    const count = Object.keys(s.roster.persons).length;
    applyBattleResult(s, ctx, sortie, battle);
    const event = s.log.find(e => e.type === "SoulAwakened")!; assert(event);
    const id = event.payload.person as string;
    assert.equal(Object.keys(s.roster.persons).length, count + 1);
    assert.equal(event.payload.mech, mech); assert.equal(s.roster.persons[id]!.def, growth.awakenSoulTemplate);
    assert.equal(s.roster.employment[id]!.role, "pilot"); assert(s.roster.names[id]!.length);
    assert.equal(s.mechs[mech]!.seats.soul, id); assert.equal(s.roster.persons[id]!.seat?.mech, mech);
    assert.equal(s.mechs[mech]!.aiBattles, 0); assert.equal(s.mechs[mech]!.crew, "ai");
  }
});

test("AI 醒魂機率零或條件不成立不醒；漲潮日但非大潮、無古代機不耗醒魂骰", () => {
  for (const reason of ["zero", "no-trigger", "too-few", "no-core", "no-ai", "dead"] as const) {
    const { s, ctx, sortie, mech, battle, growth } = setup();
    sortie.units[0]!.crew = "ai"; s.mechs[mech]!.aiBattles = growth.awakenMinAiBattles - 1;
    s.clock.phase = "spring"; s.clock.tide = reason === "no-trigger" ? 2 : 3;
    growth.awakenChanceTide = reason === "zero" ? 0 : 1; growth.awakenChanceAncient = growth.awakenChanceTide;
    if (reason === "too-few") s.mechs[mech]!.aiBattles = 0;
    if (reason === "no-core") battle.units[0]!.state.core = false;
    if (reason === "no-ai") delete sortie.units[0]!.crew;
    if (reason === "dead") battle.units[0]!.status = "dead";
    const rng = structuredClone(s.rng);
    applyBattleResult(s, ctx, sortie, battle);
    assert(!s.log.some(e => e.type === "SoulAwakened"), reason);
    if (reason === "no-trigger") assert.deepEqual(s.rng, rng);
  }
});
