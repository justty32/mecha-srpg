import test from "node:test";
import assert from "node:assert/strict";
import { modelPower, strength } from "../war/forces.ts";
import { checkLedger } from "../state/ledger.ts";
import { canonicalJson } from "../../core/eventlog.ts";
import { scenarioToSetup } from "../../sim/index.ts";
import { WORLD_KINDS } from "../content/load.ts";
import { createWorldDB } from "../content/worlddb.ts";
import type { WorldTables } from "../content/worlddb.ts";
import { createOpsCtx } from "../content/start.ts";
import type { ActorState, CampaignState, WorldActionDef } from "../state/types.ts";
import { applyCommand } from "../time/commands.ts";
import { generateScenario } from "../sortie/scenario.ts";
import { fixture as battleFixture, result as battleResult } from "../sortie/test-support.ts";
import { parse } from "../text/parse.ts";
import { render } from "../text/render.ts";
import { greedy, random } from "../sim/policies.ts";
import { locAt, placeAt } from "../war/loc.ts";
import { planActor } from "./actors.ts";
import { relationKey, factionId } from "../war/relations.ts";
import { chebyshev } from "./grid.ts";
import { addRift, fixture } from "./test-support.ts";
import { checkActorContacts, chooseEncounter, encounterOptions, estimateShipStrength, settleEncounterActors, speedCheck } from "./encounter.ts";
import { cmdSail, moveDaily3, shipMover } from "./move.ts";
import type { WorldRules } from "./places.ts";

test("停泊安全：敵對接觸不開遭遇且 AI 不追船，失守城例外", () => {
  const { s, ctx } = fixture(3), place = placeAt(s, ctx, s.ship.pos)!;
  const actor = Object.values(s.actors).find(a => a.kind === "band")!;
  actor.stance = "hostile"; actor.pos = structuredClone(s.ship.pos); actor.str = 10000;
  actor.goal = { type: "hunt", target: structuredClone(s.ship.pos) }; actor.flags = ["hunting-player"];
  actor.lastPlanDay = undefined; s.actors = { [actor.id]: actor };
  checkActorContacts(s, ctx); assert.equal(s.pendingEncounter, undefined);
  assert.equal(planActor(actor, s, ctx, structuredClone(s.rng)).flags.includes("hunting-player"), false);
  // 當天曾移過蝕格、最後進港，也不能在 Arrived 後擲野群。
  const destination = structuredClone(s.ship.pos);
  const riftAt = locAt(ctx, destination.map, { x: destination.cell.x - 2, y: destination.cell.y });
  addRift(s, ctx, { site: place, at: riftAt });
  s.ship.pos.cell.x -= 3; s.actors = {};
  const cells = [riftAt.cell, { x: destination.cell.x - 1, y: destination.cell.y }];
  s.ship.path = { cells, legs: [{ map: destination.map, cells }], to: { place }, via: [] };
  const rng = structuredClone(s.rng); moveDaily3(s, ctx);
  assert.equal(s.ship.path, undefined); assert.equal(s.pendingEncounter, undefined);
  assert.deepEqual(s.rng, rng); assert.equal(s.flags.blightEncounterDay, undefined);
  s.actors = { [actor.id]: actor };
  s.places[place]!.ownerOverride = ctx.db.require("faction", "faction/rift-insects").id;
  checkActorContacts(s, ctx); assert.equal((s as CampaignState).pendingEncounter?.actor, actor.id);
  assert.equal(planActor(actor, s, ctx, structuredClone(s.rng)).flags.includes("hunting-player"), true);
});

function setup() {
  const { s, ctx: base } = fixture();
  const tables = Object.fromEntries(WORLD_KINDS.map(k => [k, Object.fromEntries(base.world.all(k).map(d => [d.id, structuredClone(d)]))])) as WorldTables;
  tables.map!["base:map/encounter-test"] = { id: "base:map/encounter-test", name: "遭遇測試", width: 40, height: 40, cellKm: 40, fog: "charted", riftRate: 0,
    legend: { ".": "base:wterrain/plain" }, base: { rows: Array(40).fill(".40") } };
  (tables.action!["base:action/ops-world"] as WorldActionDef & { rules: WorldRules }).rules.grid.mpMods = { damaged: 1, spring: 1, neap: 1 };
  const world = createWorldDB(base.world.packs, tables), ctx = createOpsCtx(s, base.db, world);
  s.actors = {}; s.ship.pos = locAt(ctx, "base:map/encounter-test", { x: 1, y: 1 });
  s.maps[s.ship.pos.map] = { known: {}, blight: {} };
  const actor: ActorState = { id: "actor-test", kind: "patrol", faction: world.require("faction-ops", "faction-ops/migrant-crew").id,
    pos: locAt(ctx, s.ship.pos.map, { x: 6, y: 1 }), mp: 60, str: 10, goal: { type: "idle" }, stance: "hostile", born: 0, flags: [], contact: 1, layer: "ground" };
  s.actors[actor.id] = actor;
  s.factions[actor.faction]!.rep = -30;
  return { s, ctx, actor };
}
test("巡邏敵意：初始聲望與 hostile 外交不停船，rep −30 或 war 才攔截", () => {
  for (const [rep, diplomacy, hostile] of [[0, "neutral", false], [-29, "hostile", false], [-30, "neutral", true], [0, "war", true]] as const) {
    const { s, ctx, actor } = setup();
    const player = factionId(s, ctx, "faction/migrant-crew")!;
    actor.faction = Object.keys(s.factions).find(id => id !== player)!;
    s.factions[actor.faction]!.rep = rep;
    s.relations![relationKey(actor.faction, player)] = { a: actor.faction, b: player, state: diplomacy,
      value: 0, baseline: 0, treaties: [], grievances: [], weariness: 0, since: 0 };
    actor.pos = structuredClone(s.ship.pos); checkActorContacts(s, ctx);
    assert.equal(!!s.pendingEncounter, hostile, `${rep}/${diplomacy}`);
    assert.equal(s.log.some(e => e.type === "Sighted" && e.payload.actor === actor.id), !hostile);
  }
});
test("wary 只發 Sighted：商隊與獵團依 stance、不停船且 AI 繞船", () => {
  for (const kind of ["caravan", "band"] as const) {
    const { s, ctx, actor } = setup(); actor.kind = kind; actor.stance = "wary";
    actor.pos.cell = { x: 3, y: 1 }; s.ship.drifting = true;
    checkActorContacts(s, ctx); assert.equal(s.pendingEncounter, undefined);
    assert.equal(s.log.filter(e => e.type === "Sighted" && e.payload.actor === actor.id).length, 1);
    const planned = planActor(actor, s, ctx, structuredClone(s.rng));
    assert.equal(planned.goal.type, "flee"); assert.ok(planned.path?.length);
    assert.ok(planned.path!.every(c => chebyshev(c, s.ship.pos.cell) > 2));
    actor.stance = "hostile"; actor.flags = [];
    checkActorContacts(s, ctx); assert.equal((s as CampaignState).pendingEncounter?.actor, actor.id);
  }
});
test("actors：逐格接觸停船，pendingEncounter 凍結 pos 並保留 pendingTicks，同一對一天只一次", () => {
  const { s, ctx, actor } = setup();
  assert.equal(cmdSail(s, ctx, { v: "sail", to: { x: 35, y: 1 } }).ok, true);
  const ticks = s.pendingTicks; moveDaily3(s, ctx);
  assert.equal(s.pendingEncounter?.actor, actor.id); assert.deepEqual(s.ship.pos.cell, { x: 4, y: 1 }); assert.equal(s.pendingTicks, ticks);
  const before = structuredClone(s.ship); moveDaily3(s, ctx); assert.deepEqual(s.ship, before);
  delete s.pendingEncounter; checkActorContacts(s, ctx); assert.equal(s.pendingEncounter, undefined);
  s.clock.day++; checkActorContacts(s, ctx); assert.equal(s.pendingEncounter, undefined);
  actor.pos.cell.x = 20; checkActorContacts(s, ctx); actor.pos.cell.x = 6; checkActorContacts(s, ctx);
  assert.equal((s as CampaignState).pendingEncounter?.actor, actor.id);
  // 18:22 orders：終局後不接觸、不擲蝕域遭遇，亦不消耗玩家 RNG 或生臨時群。
  delete s.pendingEncounter; delete s.ship.path; actor.lastContactDay = undefined; actor.flags = [];
  s.patches.ended = { id: "ended", rift: "ended-rift", map: s.ship.pos.map, cells: [structuredClone(s.ship.pos.cell)], sinceDay: s.clock.day };
  s.maps[s.ship.pos.map]!.blight[`${s.ship.pos.cell.x},${s.ship.pos.cell.y}`] = { rift: "ended-rift", patch: "ended" };
  // 18:30 orders：未終局時停泊／懸停在蝕格同樣不擲；有航線但沒油也不擲。
  for (const drifting of [false, true]) {
    s.ship.drifting = drifting;
    const stopped = canonicalJson(s); moveDaily3(s, ctx); assert.equal(canonicalJson(s), stopped);
  }
  const nextCell = { x: s.ship.pos.cell.x + 1, y: s.ship.pos.cell.y }, nextLoc = locAt(ctx, s.ship.pos.map, nextCell);
  s.maps[s.ship.pos.map]!.blight[`${nextCell.x},${nextCell.y}`] = { rift: "ended-rift", patch: "ended" };
  s.patches.ended!.cells.push(nextCell);
  s.ship.path = { cells: [nextCell], legs: [{ map: s.ship.pos.map, cells: [nextCell] }], to: nextLoc, via: [] };
  s.ship.fuel.cur = 0; s.ledger.balances["stock:fuel"] = 0;
  const stoppedPos = structuredClone(s.ship.pos), stoppedRng = structuredClone(s.rng), stoppedActors = canonicalJson(s.actors);
  moveDaily3(s, ctx);
  assert.deepEqual(s.ship.pos, stoppedPos); assert.deepEqual(s.rng, stoppedRng);
  assert.equal(canonicalJson(s.actors), stoppedActors); assert.equal(s.flags.blightEncounterDay, undefined);
  assert.equal(s.pendingEncounter, undefined);
  ctx.emit("CampaignEnd", { reason: "ship-seized" });
  const ended = canonicalJson(s); checkActorContacts(s, ctx); moveDaily3(s, ctx);
  assert.equal(canonicalJson(s), ended);
});
test("actors：迴避速度恰為 1.2 倍自動成功、不耗 RNG；未達門檻擲骰，燃料乘二", () => {
  const { s, ctx, actor } = setup(), before = structuredClone(s.rng);
  assert.equal(speedCheck(s, ctx, 72, 60), true); assert.deepEqual(s.rng, before);
  speedCheck(s, ctx, 71.999, 60); assert.notDeepEqual(s.rng, before);
  actor.pos = structuredClone(s.ship.pos); checkActorContacts(s, ctx); const fuel = s.ship.fuel.cur;
  assert.deepEqual(chooseEncounter(s, ctx, 1), { ok: true, days: 1 }); assert.equal(s.ship.fuel.cur, fuel - 2);
  assert.equal(s.pendingEncounter, undefined); assert.equal(s.pendingBattle, undefined); assert.equal(s.log.at(-1)?.type, "Evaded");
});
test("actors：sail actor 每天追新位置，速度相等即下令拒絕 cannot-catch", () => {
  const { s, ctx, actor } = setup(); actor.pos.cell = { x: 35, y: 1 }; actor.mp = shipMover(s, ctx).mp;
  const before = canonicalJson(s);
  assert.deepEqual(cmdSail(s, ctx, { v: "sail", to: { actor: actor.id } }), { ok: false, error: "cannot-catch" }); assert.equal(canonicalJson(s), before);
  actor.mp = 60; assert.equal(cmdSail(s, ctx, { v: "sail", to: { actor: actor.id } }).ok, true);
  actor.pos.cell = { x: 1, y: 35 }; moveDaily3(s, ctx); assert.equal(s.ship.pos.cell.x, 1); assert.ok(s.ship.pos.cell.y > 1);
  actor.pos.cell = { x: 35, y: 35 }; s.clock.day++; moveDaily3(s, ctx); assert.ok(s.ship.pos.cell.x > 1);
});
test("actors：四選 prompt 列出禁用理由，交涉讀表，航 @名解析到行動者，政策只選合法項", () => {
  const { s, ctx, actor } = setup(); actor.pos = structuredClone(s.ship.pos); checkActorContacts(s, ctx);
  s.pendingEncounter!.aiChoice = "fight";
  const screen = render(s, [], ctx.world, ctx.db); assert.equal(screen.prompt?.choices.length, 4); assert.ok(screen.prompt!.choices[1]!.disabled);
  assert.deepEqual(chooseEncounter(s, ctx, 2), { ok: false, error: "choice-disabled" });
  assert.equal(greedy(s, ctx).v, "choose");
  const command = random(s, ctx); assert.equal(command.v, "choose"); if (command.v === "choose") assert.equal(encounterOptions(s, ctx)[command.choice - 1]!.disabled, undefined);
  assert.deepEqual(parse('航 "@巡邏隊 test"', s, ctx.world), { v: "sail", to: { actor: actor.id } });
  assert.equal(chooseEncounter(s, ctx, 3).ok, true); assert.equal(s.pendingChoices[0]?.faction, actor.faction);
  assert.ok(applyCommand(s, ctx.db, ctx.world, { v: "choose", choice: 1 }).result.ok);
});
test("actors：AI aiChoice 使用表權重，swarm 禁交涉，逃跑失敗產生 ambush", () => {
  const { s, ctx, actor } = setup(); actor.kind = "swarm"; actor.mp = 1000; actor.pos = structuredClone(s.ship.pos);
  const full = estimateShipStrength(s, ctx), damaged = structuredClone(s);
  assert.ok(full > 0);
  for (const mech of Object.values(damaged.mechs)) for (const part of Object.values(mech.parts)) for (const layer of part.layers) layer.hp *= 0.5;
  assert.ok(estimateShipStrength(damaged, ctx) < full);
  damaged.roster.persons = {}; assert.equal(estimateShipStrength(damaged, ctx), 0);
  checkActorContacts(s, ctx); assert.ok(["pursue", "fight"].includes(s.pendingEncounter!.aiChoice)); assert.ok(encounterOptions(s, ctx)[2]!.disabled);
  assert.equal(chooseEncounter(s, ctx, 1).ok, true); assert.equal(s.pendingBattle?.trigger, "ambush"); assert.deepEqual(s.pendingBattle?.actors, [actor.id]);
  // 18:10 orders：無機組且無脫離燃料，舊待戰與新接觸皆被劫，交易可回滾、不移船也不送油。
  s.roster.persons = {}; s.ship.fuel.cur = 0; s.ledger.balances["stock:fuel"] = 0;
  const pos = structuredClone(s.ship.pos), cash = s.ledger.balances.cash;
  const settled = applyCommand(s, ctx.db, ctx.world, { v: "drift" });
  assert.equal(settled.result.ok, true); assert.equal(settled.state.pendingBattle, undefined);
  assert.deepEqual(settled.state.ship.pos, pos); assert.equal(settled.state.ship.fuel.cur, 0);
  assert.equal(settled.state.ledger.balances.cash, cash * 0.9); assert.equal(s.ledger.balances.cash, cash);
  assert.equal(settled.events.filter(e => e.type === "Plundered").length, 1);
  // 此 fixture 人工清空燃料帳，只核對被劫現金帳與事件來源。
  assert.ok(!checkLedger(settled.state).some(error => error.includes("cash") || error.includes("missing source")));
  const next = settled.state, freshCtx = createOpsCtx(next, ctx.db, ctx.world);
  next.clock.day++; next.actors[actor.id]!.lastContactDay = undefined; next.actors[actor.id]!.flags = [];
  checkActorContacts(next, freshCtx); assert.equal(next.pendingEncounter, undefined); assert.equal(next.pendingBattle, undefined);
  assert.deepEqual(next.ship.pos, pos); assert.equal(next.ledger.balances.cash, cash * 0.9 * 0.9);
  assert.equal(next.log.filter(e => e.type === "Plundered").length, 2);
  next.pendingEncounter = { actor: actor.id, day: next.clock.day, loc: pos, aiChoice: "fight", initiator: "actor" };
  assert.equal(encounterOptions(next, freshCtx)[0]!.disabled, "燃料不足");
});
test("actors：同 seed 接觸與四選事件重播相同", () => {
  const run = () => { const { s, ctx, actor } = setup(); actor.pos = structuredClone(s.ship.pos); checkActorContacts(s, ctx); chooseEncounter(s, ctx, 1); return canonicalJson(s); };
  assert.equal(run(), run());
});
test("actors：intercept 由 force 展開、swarm 預算生成，第三方敵對 third、友軍 ally 可載入", () => {
  const { s, ctx, sortie } = battleFixture(); s.ship.pos = structuredClone(sortie.loc); s.actors = {};
  const faction = Object.keys(s.factions).find(id => s.factions[id]!.forces?.units.length)!, force = s.factions[faction]!.forces!;
  force.units.find(unit => unit.readiness > 0)!.count += 100;
  const base: ActorState = { id: "force-enemy", kind: "force", faction, pos: structuredClone(s.ship.pos), mp: 60, str: 30, stance: "hostile", goal: { type: "idle" }, born: 0, flags: [] };
  s.actors[base.id] = base;
  s.actors.third = { ...structuredClone(base), id: "third", kind: "swarm", faction: "third-faction", swarm: { rift: "rift-test", family: "insect", grades: ["D"] }, str: 10 };
  s.actors.ally = { ...structuredClone(base), id: "ally", kind: "band", stance: "friendly" };
  const input = { ...sortie, contract: undefined, rift: undefined, trigger: "intercept" as const, actors: [base.id, "third", "ally"] };
  const sc = generateScenario(s, ctx, input);
  assert.ok(sc.slots.enemy!.units.length <= force.units.reduce((n, u) => n + (u.readiness > 0 ? u.count : 0), 0));
  assert.ok(sc.slots.third!.units.length); assert.ok(sc.slots.ally!.units.length); assert.deepEqual(sc.slots.player!.allies, ["ally"]);
  assert.doesNotThrow(() => scenarioToSetup(ctx.db, sc, sc.seed!));
  s.actors.ally!.str = 180; s.actors.ally!.kind = "caravan";
  s.actors.ally2 = { ...structuredClone(s.actors.ally!), id: "ally2" };
  s.actors.third2 = { ...structuredClone(s.actors.third!), id: "third2" };
  input.actors.push("ally2", "third2");
  const crowded = generateScenario(s, ctx, input), occupied = new Set<string>();
  for (const [slot, data] of Object.entries(crowded.slots)) {
    const zone = crowded.ops.map.deployZones[slot]!;
    assert.ok(zone.length >= data.units.length);
    for (const cell of zone) {
      const key = `${cell.x},${cell.y}`; assert.ok(!occupied.has(key)); occupied.add(key);
      assert.ok(cell.x > 0 && cell.x < crowded.ops.map.width && cell.y < crowded.ops.map.height);
    }
  }
  assert.ok(crowded.slots.ally!.units.length <= 2);
  assert.ok(crowded.slots.third!.units.length <= 4);
  assert.ok(Object.values(crowded.slots).reduce((n, slot) => n + slot.units.length, 0) <= 16);
  assert.ok(Object.values(crowded.ops.forceIds ?? {}).every(id => !id.includes("/ally2/") && !id.includes("/third2/")));
  const referenced = new Set(Object.values(crowded.slots).flatMap(slot => slot.units.flatMap(unit => unit.persons?.map(p => p.id) ?? [])));
  assert.ok(Object.keys(crowded.personStates ?? {}).every(id => referenced.has(id)));
  assert.doesNotThrow(() => scenarioToSetup(ctx.db, crowded, crowded.seed!));
  const sent = Object.values(sc.ops.forceIds ?? {}).filter(id => id.includes("/force-enemy/"));
  assert.ok(sent.length > 0);
  const beforeCount = force.units.reduce((n, unit) => n + unit.count, 0);
  settleEncounterActors(s, ctx, input, { ...battleResult(), units: sent.map(id => ({ id, status: "dead", state: s.mechs[sortie.units[0]!.mech]! })) });
  assert.equal(force.units.reduce((n, unit) => n + unit.count, 0), beforeCount - sent.length);
  assert.ok(s.actors[base.id]); assert.equal(s.actors[base.id]!.str, strength(force, modelPower(ctx)));
  assert.ok(s.actors[base.id]!.str > 0);
});
