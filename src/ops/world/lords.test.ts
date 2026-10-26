import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { createWorldDB } from "../content/worlddb.ts";
import type { WorldTables } from "../content/worlddb.ts";
import { checkWorld } from "../content/check.ts";
import { lordScripts, shiftBlight, initNamedLords, lordTrace, northwardCandidates, namedLordsDaily2, namedLordsDaily4, applyLordChoice, routeGrades } from "./lords.ts";
import { patchDepth, rebuildBlightIndex } from "./blight.ts";
import { pressureDaily2 } from "./pressure.ts";
import { checkInvariants } from "../sim/invariants.ts";
import { skyAt } from "../state/clock.ts";
import { cellKey } from "./grid.ts";
import { createRng } from "../../core/rng.ts";
import { render } from "../text/render.ts";
import { contractsDaily2 } from "../contracts/lifecycle.ts";
import { locAt } from "../war/loc.ts";

const loaded = loadWorldDirs(["content/base"]), { db, world } = loaded;
const LORD = "base:monster/tidespine-chittagong";
function setup(seed = 1) {
  const s = newCampaign(db, world, "start/default", seed), ctx = createOpsCtx(s, db, world), script = lordScripts(ctx)[0]!;
  return { s, ctx, script, lord: s.namedLords![LORD]! };
}
function clearCoast(f: ReturnType<typeof setup>) {
  const keys = new Set(f.script.blight.cells.map(cellKey));
  for (const p of Object.values(f.s.patches)) if (p.map === f.script.blight.map) {
    if (p.cells.some(c => keys.has(cellKey(c)))) { for (const r of Object.values(f.s.rifts)) r.patches = r.patches.filter(id => id !== p.id); delete f.s.patches[p.id]; }
  }
  rebuildBlightIndex(f.s);
}
function atDay(f: ReturnType<typeof setup>, day: number) {
  f.s.clock = skyAt(day, world.require("calendar", f.s.calendar), world.all("omen")).clock;
}

describe("萬潮世界：E4 事件改區", () => {
  test("開局不建事件塊，北岸新建永久淺蝕；去重、索引、pressure 排除", () => {
    const f = setup(), { s, ctx, script } = f; clearCoast(f);
    assert(!Object.values(s.patches).some(p => p.origin === "event"));
    assert.equal(shiftBlight(s, ctx, { ...script.blight, cells: [{ x: 136, y: 99 }] }), false);
    assert(shiftBlight(s, ctx, script.blight));
    const patch = s.patches[`event:${script.blight.area}`]!;
    assert.equal(patch.cells.length, 9); assert.equal(patch.rift, ""); assert.equal(patch.origin, "event");
    const since = patch.sinceDay, events = s.log.length;
    assert(shiftBlight(s, ctx, script.blight)); assert.equal(s.log.length, events);
    rebuildBlightIndex(s); assert.deepEqual(checkInvariants(s, world), []);
    atDay(f, 1000); assert.equal(patchDepth(s, ctx, patch), "shallow"); assert.equal(patch.sinceDay, since);
    const without = structuredClone(s); delete without.patches[patch.id]; rebuildBlightIndex(without);
    pressureDaily2(s, ctx); pressureDaily2(without, createOpsCtx(without, db, world)); assert.equal(s.pressure, without.pressure);
    assert.equal(shiftBlight(s, ctx, { ...script.blight, area: "absent" }), false);
    assert.equal(shiftBlight(s, ctx, { ...script.blight, cells: [{ x: 129, y: 97 }] }), true);
  });
  test("占格不覆寫；不連通取最大塊；無可用格記事件且重送不重發", () => {
    const f = setup(); clearCoast(f); const { s, ctx, script } = f;
    const occupied = script.blight.cells.filter(c => c.x === 130);
    s.patches.blocker = { id: "blocker", rift: "", origin: "event", depthOverride: "shallow", map: script.blight.map, cells: occupied, sinceDay: 0 };
    rebuildBlightIndex(s); const before = structuredClone(s.patches.blocker);
    assert(shiftBlight(s, ctx, script.blight)); assert.deepEqual(s.patches.blocker, before);
    assert.equal(s.patches[`event:${script.blight.area}`]!.cells.length, 3);
    const other = setup(); clearCoast(other); other.s.patches.blocker = { ...before, cells: structuredClone(script.blight.cells) }; rebuildBlightIndex(other.s);
    assert(shiftBlight(other.s, other.ctx, other.script.blight)); assert(!other.s.patches[`event:${script.blight.area}`]);
    assert(other.s.log.some(e => e.type === "WanchaoBlightSkipped")); const n = other.s.log.length;
    assert(shiftBlight(other.s, other.ctx, other.script.blight)); assert.equal(other.s.log.length, n);
  });
});

describe("萬潮世界：E1 王跡", () => {
  test("原文、啟用範圍、候選日與三條 RNG 獨立", () => {
    const { s, ctx, script } = setup();
    assert.equal(lordTrace(s, ctx)[0]!.text, "吉大港外灘：在。");
    const panel = render(s, [], world, db); assert.equal(panel.panels.namedLords![0]!.text, script.trace.present);
    assert(panel.room.desc.some(t => t.includes(script.trace.present)));
    const before = { rng: structuredClone(s.rng), war: structuredClone(s.warRng), actor: structuredClone(s.actorRng) };
    initNamedLords(s, ctx, "base:start/default", 1);
    assert.deepEqual({ rng: s.rng, war: s.warRng, actor: s.actorRng }, before);
    const copy = structuredClone(s); delete copy.namedLords;
    initNamedLords(copy, createOpsCtx(copy, db, world), "test:start/no-script", 1); assert.equal(copy.namedLords, undefined);
    const candidates = northwardCandidates(ctx, script, world.require("calendar", s.calendar));
    assert.deepEqual(candidates, [280, 490]);
    for (const d of candidates) { const sky = skyAt(d, world.require("calendar", s.calendar), world.all("omen")); assert(sky.clock.month >= 8 && sky.clock.month <= 24 && sky.clock.tide >= 3); }
    assert.equal(setup().lord.northwardDay, s.namedLords![LORD]!.northwardDay);
  });
});

describe("萬潮世界：E2 腳本北行", () => {
  test("無合約也依日四站北行；重送不重發、三約五消息與王跡失效", () => {
    const f = setup(), { s, ctx, script, lord } = f;
    atDay(f, lord.northwardDay); namedLordsDaily2(s, ctx);
    assert(lord.moved); assert.deepEqual(lord.visited, [0, 1, 2, 3]); assert.deepEqual(lord.loc, script.route[3]!.loc);
    assert.equal(lord.sinceDay, lord.northwardDay); assert.equal(lordTrace(s, ctx)[0]!.text, script.trace.northward);
    assert.equal(s.pendingContracts.length, 3);
    for (const type of script.news.slice(0, 4)) assert.equal(s.log.filter(e => e.type === type).length, 1);
    const n = s.log.length; namedLordsDaily2(s, ctx); assert.equal(s.log.length, n); assert.equal(s.pendingContracts.length, 3);
    contractsDaily2(s, ctx); assert.equal(Object.values(s.contracts).filter(c => c.template.includes("wanchao-")).length, 3);
    atDay(f, lord.northwardDay + script.observationDays + 1); namedLordsDaily2(s, ctx);
    assert.equal(lordTrace(s, ctx)[0]!.text, script.trace.gone);
    assert.equal(Object.values(s.contracts).find(c => c.template === script.contracts[0]!.template)?.status, "expired");
  });
  test("批次逐日同結果；北郊最近有效裂縫同距取字典序，封閉不抬，cap A且不疊第二級", () => {
    const a = setup(), b = setup(), day = a.lord.northwardDay;
    const rift = Object.values(a.s.rifts)[0]!;
    for (const f of [a, b]) {
      for (const [id, dx, width, phase] of [["z-near", 1, "C", "opening"], ["a-near", -1, "B", "opening"], ["sealed", 0, "D", "sealed"]] as const)
        f.s.rifts[id] = { ...structuredClone(rift), id, at: locAt(f.ctx, f.script.route[3]!.loc.map, { x: 132 + dx, y: 92 }), width, phase };
    }
    atDay(a, day); namedLordsDaily2(a.s, a.ctx);
    for (let d = day - 2; d <= day; d++) { atDay(b, d); namedLordsDaily2(b.s, b.ctx); }
    assert.deepEqual(a.lord, b.lord); assert.equal(a.lord.northRift, "a-near"); assert.equal(a.s.rifts["a-near"]!.width, "A");
    assert.equal(a.s.rifts["z-near"]!.width, "C"); assert.equal(a.s.rifts.sealed!.width, "D");
    assert.deepEqual(routeGrades(a.s, a.script, a.lord.loc, ["D", "C"], "a-near"), ["D", "C"]);
    assert.deepEqual(routeGrades(a.s, a.script, a.lord.loc, ["D", "C"]), ["D", "C", "B"]);
    assert.deepEqual(routeGrades(a.s, a.script, a.lord.loc, ["A"]), ["D", "C", "B", "A"]);
    atDay(a, day + 1); assert.deepEqual(routeGrades(a.s, a.script, a.lord.loc, ["D"]), ["D"]);
    const passed = setup(); atDay(passed, passed.lord.northwardDay); namedLordsDaily2(passed.s, passed.ctx); assert.equal(passed.lord.northBranch, "passed");
  });
  test("checkWorld 以真實資料驗正反例：空候選、越界、不連通與錯引用", () => {
    assert.deepEqual(checkWorld(db, world).errors, []);
    const action = world.require("action", "action/wanchao-script");
    for (const mutate of [
      (c: typeof action.lordScript) => { c!.windowMonths = [0, 0]; },
      (c: typeof action.lordScript) => { c!.blight.cells[0] = { x: 9999, y: 99 }; },
      (c: typeof action.lordScript) => { c!.blight.cells = [{ x: 129, y: 97 }, { x: 131, y: 99 }]; },
      (c: typeof action.lordScript) => { c!.blight.map = "base:map/absent"; },
      (c: typeof action.lordScript) => { c!.lord = "base:monster/absent"; },
      (c: typeof action.lordScript) => { c!.aura = "base:effect/absent"; },
    ]) {
      const tables: WorldTables = {};
      for (const kind of ["actor","wterrain","map","regions","place","lane","operation","treaty","lineage","model","forces","affinity","calendar","omen","ship","rift","encounter","faction-ops","contract","action","market","service","recruit","background","research","job","names","event","dialogue","room","templates","start","beasts","keymap"] as const) {
        (tables as Record<string, unknown>)[kind] = Object.fromEntries(world.all(kind).map(def => [def.id, structuredClone(def)]));
      }
      mutate(tables.action![action.id]!.lordScript);
      assert(checkWorld(db, createWorldDB(world.packs, tables)).errors.length > 0);
    }
  });
});



// E3／E5 戰鬥接縫：正式 base 個體與既有情境配裝，不造替身數值。
import * as PB from "../../rules/index.ts";
import { loadContentDirs as pbLoad } from "../../content/loader.ts";
import { scenarioToSetup as pbScenario } from "../../sim/run.ts";
import { replay as pbReplay } from "../../sim/replay.ts";
import { createSave as pbSave, serializeSave as pbSerialize, parseSave as pbParse, loadSave as pbRestore } from "../../sim/save.ts";
import { hashLog as pbHash } from "../../core/eventlog.ts";
import type { Command as PBCommand } from "../../core/types-state.ts";
import { BattleSession as PBSession } from "../../ui-adapter/vm/session.ts";
import { BattleController as PBController } from "../../ui-adapter/vm/controller.ts";
import { createRulesQuery as pbQuery } from "../../ai/adapters/rules-adapter.ts";
import { termination as pbTermination } from "../../../test/fuzz/invariants.ts";
const pbDb = pbLoad(["content/base"]).db;
function pbSetup(engageable = false): PB.BattleSetup {
  const setup = pbScenario(pbDb, "scenario/skirmish-whitegloves", 1).setup;
  const player = structuredClone(setup.units.find(u => u.id === "player-2")!);
  player.id = "p"; player.pos = { x: 1, y: 1 };
  return { ...setup, id: "wanchao-presence-test", maxRounds: 3,
    map: { width: 6, height: 4, fill: "terrain/plain", exits: [] },
    units: [player, { id: "e", owner: "enemy", pos: { x: 5, y: 3 }, monster: { species: "species/hound", grade: "D" } },
      { id: "lord", owner: "enemy", pos: { x: 2, y: 1 },
        monster: { species: "species/tidespine", grade: "S", def: "monster/tidespine-chittagong" },
        presence: { aura: "effect/kx-tidal-dread", engageable } }],
    objectives: [{ kind: "survive", params: { rounds: 3 }, for: "player", onComplete: "win" },
      { kind: "eliminate", params: { slots: ["player"] }, for: "enemy", onComplete: "win" }] };
}
function pbContext(engageable = false) {
  const setup = pbSetup(engageable), ctx = { db: pbDb, s: PB.createBattle(pbDb, setup, 1) };
  PB.startBattle(ctx); return { setup, ctx };
}
test("presence：不入隊列／不行動、阻格，單體／部位／AoE 與偽造指令均不能傷牠", () => {
  const { ctx } = pbContext(), q = pbQuery(pbDb), before = structuredClone(ctx.s.units.lord!.parts);
  assert.equal(PB.currentActor(ctx.s), "p"); assert.ok(!ctx.s.order.includes("lord"));
  assert.equal(q.isActive(ctx.s, "lord"), false); assert.equal(PB.unitAt(ctx, { x: 2, y: 1 }), "lord");
  assert.equal(PB.checkAbility(ctx, "p", "ability/reaper-cleave", { unit: "lord" })?.code, "bad-target");
  assert.equal(PB.checkAbility(ctx, "p", "ability/reaper-cleave", { unit: "lord", part: "heart" })?.code, "bad-target");
  assert.equal(PB.tryCommand(ctx, { kind: "useAbility", actor: "p", ability: "ability/reaper-cleave", target: { unit: "lord" } }).ok, false);
  assert.equal(PB.tryCommand(ctx, { kind: "end", actor: "lord" }).ok, false);
  PB.tryCommand(ctx, { kind: "move", actor: "p", path: [{ x: 2, y: 1 }] });
  assert.deepEqual(ctx.s.units.p!.pos, { x: 1, y: 1 });
  PB.resolveAbility(ctx, "e", "ability/kx-spine-sweep", { cell: { x: 2, y: 1 } });
  assert.deepEqual(ctx.s.units.lord!.parts, before);
  const forced = pbSetup();
  forced.objectives.push({ kind: "killTarget", params: { unit: "lord" }, for: "player", onComplete: "win" });
  assert.throws(() => PB.createBattle(pbDb, forced, 1), /在場單位不可/);
});
test("presence：敵我沿用潮懼 -10，wait resumed 不重施；勝負與戰果忽略在場者", () => {
  const { ctx } = pbContext();
  for (const id of ["p", "e"]) {
    const aura = ctx.s.units[id]!.effects.find(e => e.effect === "base:effect/kx-tidal-dread");
    assert.ok(aura); assert.equal(aura.source, "lord");
    assert.equal(ctx.s.units[id]!.contribs.find(c => aura.contribIds.includes(c.id))?.value, -10);
  }
  const count = ctx.s.log.events.filter(e => e.type === "EffectApplied").length;
  PB.beginTurn(ctx, "p", true);
  assert.equal(ctx.s.log.events.filter(e => e.type === "EffectApplied").length, count);
  PB.rt(ctx.s).unitStatus.e = "dead";
  assert.equal(PB.objectiveDone(ctx, { kind: "eliminate", params: {}, for: "player", onComplete: "win" }), true);
  PB.rt(ctx.s).outcome = { winner: "player", reason: "survive" };
  assert.ok(!PB.battleResult(ctx)!.units.some(u => u.id === "lord"));
  const issues: string[] = []; pbTermination(ctx, (name, detail) => issues.push(`${name}:${detail}`));
  assert.deepEqual(issues, []);
});
test("迎戰：拍二拒絕，gate 顯式命令只插隊一次、不扣 AP、不搶目前回合", () => {
  const second = pbContext().ctx;
  assert.equal(PB.tryCommand(second, { kind: "engagePresence", actor: "p", target: "lord" }).ok, false);
  const { ctx } = pbContext(true), pools = structuredClone(ctx.s.units.p!.pools);
  assert.equal(PB.canCapture(ctx, "lord"), false);
  assert.equal(PB.tryCommand(ctx, { kind: "engagePresence", actor: "p", target: "lord" }).ok, true);
  assert.equal(PB.currentActor(ctx.s), "p"); assert.deepEqual(ctx.s.units.p!.pools, pools);
  assert.equal(PB.rt(ctx.s).unitStatus.lord, "active"); assert.equal(ctx.s.order.filter(id => id === "lord").length, 1);
  assert.ok(PB.rt(ctx.s).objectives.some(o => o.kind === "killTarget" && o.params.unit === "lord"));
  assert.ok(PB.rt(ctx.s).objectives.some(o => o.kind === "capture" && o.params.unit === "lord"));
  assert.equal(PB.tryCommand(ctx, { kind: "engagePresence", actor: "p", target: "lord" }).ok, false);
  assert.equal(ctx.s.log.events.filter(e => e.type === "PresenceEngaged").length, 1);
  assert.equal(PB.canCapture(ctx, "lord"), false);
  PB.killUnit(ctx, "lord", "p");
  assert.ok(["p", "e"].every(id => !ctx.s.units[id]!.effects.some(e => e.effect === "base:effect/kx-tidal-dread")));
});
test("捕捉：保留潮脊原部位條件，首次成功即 runtime 鎖定並停止光環", () => {
  const { ctx } = pbContext(true);
  assert.equal(PB.tryCommand(ctx, { kind: "engagePresence", actor: "p", target: "lord" }).ok, true);
  const capture = pbDb.require("species", "species/tidespine").capture;
  for (const part of PB.partDefs(ctx, "lord")) if (part.functions.some(fn => capture.requireBroken.includes(fn))) {
    const state = ctx.s.units.lord!.parts[part.id]!; state.broken = true;
    for (const layer of state.layers) { layer.broken = true; layer.hp = 0; }
  }
  assert.equal(PB.canCapture(ctx, "lord"), true);
  PB.capture(ctx, "p", "lord");
  assert.equal(PB.rt(ctx.s).presences!.lord!.captureLocked, true);
  assert.equal(PB.canCapture(ctx, "lord"), false);
  PB.capture(ctx, "p", "lord");
  assert.equal(ctx.s.log.events.filter(e => e.type === "Captured").length, 1);
  assert.ok(["p", "e"].every(id => !ctx.s.units[id]!.effects.some(e => e.effect === "base:effect/kx-tidal-dread")));
  assert.equal(PB.battleResult(ctx)!.units.find(u => u.id === "lord")!.monster, "base:monster/tidespine-chittagong");
});
test("presence／迎戰指令：save snapshot 與 replay hash 相等", () => {
  const { setup, ctx } = pbContext(true), commands: PBCommand[] = [{ kind: "engagePresence", actor: "p", target: "lord" }];
  assert.equal(PB.tryCommand(ctx, commands[0]!).ok, true);
  const loaded = pbRestore(pbDb, pbParse(pbSerialize(pbSave(pbDb, { scenario: null, seed: 1, commands, setup, snapshot: ctx.s }))), { verifySnapshot: true });
  assert.deepEqual(loaded.warnings, []); assert.deepEqual(loaded.state, ctx.s);
  assert.equal(pbHash(pbReplay(pbDb, setup, 1, commands).log), pbHash(ctx.s.log));
  const pre = pbContext().ctx;
  const before = pbRestore(pbDb, pbParse(pbSerialize(pbSave(pbDb, { scenario: null, seed: 1, commands: [], setup: pbSetup(), snapshot: pre.s }))), { verifySnapshot: true });
  assert.deepEqual(before.state.rt!.presences, pre.s.rt!.presences);
  const malformed = JSON.parse(pbSerialize(pbSave(pbDb, { scenario: null, seed: 1, commands: [], setup: pbSetup(), snapshot: pre.s })));
  malformed.snapshot.rt.presences.lord.captureLocked = "wrong";
  assert.throws(() => pbParse(JSON.stringify(malformed)), /存檔形狀/);
  delete malformed.snapshot;
  malformed.setup.units.find((u: { id: string }) => u.id === "lord").presence.engageable = "wrong";
  assert.throws(() => pbParse(JSON.stringify(malformed)), /存檔形狀/);
});
test("UI：presence 公開標記不可點選／循環選取，確認迎戰後才送命令，auto 不迎戰", () => {
  const setup = pbSetup(true), sim = { scenario: "wanchao-test", setup, slotProfiles: {}, unitPolicies: {} };
  const session = new PBSession({ db: pbDb, sim, seed: 1, autoAdvance: false });
  const c = new PBController({ session }), first = c.snapshot();
  const marker = first.cells.find(cell => cell.unit?.id === "lord")!;
  assert.equal(marker.unit!.selectable, false); assert.equal(marker.unit!.status, "presence");
  const selected = first.selected!.id;
  assert.equal(c.dispatch({ type: "clickCell", x: marker.x, y: marker.y }).selected!.id, selected);
  assert.notEqual(c.dispatch({ type: "nextUnit" }).selected?.id, "lord");
  const option = c.snapshot().commands.find(cmd => cmd.id === "engagePresence:lord")!;
  assert.ok(option.enabled); assert.equal(session.state.rt!.unitStatus.lord, "presence");
  assert.equal(c.dispatch(option.action).confirm?.action, "engagePresence");
  assert.equal(session.state.rt!.unitStatus.lord, "presence");
  c.dispatch({ type: "confirm" });
  assert.equal(session.state.rt!.unitStatus.lord, "active");
  assert.equal(c.snapshot().cells.find(cell => cell.unit?.id === "lord")?.unit?.selectable, undefined);
  const auto = new PBSession({ db: pbDb, sim, seed: 1, spectate: true });
  assert.equal(auto.state.rt!.presences!.lord!.engaged, undefined);
  assert.ok(!auto.commands.some(cmd => cmd.kind === "engagePresence"));
});

import { syncOmenFlags } from "../state/omens.ts";
import { applyCommand } from "../time/commands.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { applySortieResult, sortieBattleSetup } from "../sortie/run.ts";
import { generateScenario } from "../sortie/scenario.ts";
import { validateSortie } from "../sortie/validate.ts";
import { draftSortie, defaultUnit } from "../../ui-adapter/ops/vm/formation.ts";
import { buildSnapshot } from "../../ui-adapter/ops/vm/snapshot.ts";
import { campaignHash, createCampaignBlob, serializeCampaign, loadCampaign } from "../sim/save.ts";
import type { Sortie } from "../state/types.ts";
function gateContext() {
  const f = setup(); atDay(f, 1120);
  const sky = skyAt(1120, world.require("calendar", f.s.calendar), world.all("omen")); syncOmenFlags(f.s.flags, sky.omens);
  f.s.ship.pos = locAt(f.ctx, f.script.gate.map, { x: 126, y: 100 });
  namedLordsDaily4(f.s, f.ctx); return f;
}
describe("萬潮世界：E5 守牆與一次捕捉", () => {
  test("邀請可拒可接，拒絕不出戰；灣內遠端援防船不傳送，未明確迎戰仍不可打", () => {
    const decline = gateContext(); assert.equal(decline.s.pendingChoices[0]!.text, decline.script.gate.text);
    assert(applyLordChoice(decline.s, decline.ctx, { lord: LORD, choice: "decline" }));
    assert.equal(decline.s.pendingBattle, undefined); assert(!decline.s.log.some(e => e.type === "BattleResolved"));
    const f = gateContext(), before = structuredClone(f.s.ship.pos);
    const accepted = applyCommand(f.s, db, world, { v: "choose", choice: 2 }); assert(accepted.result.ok);
    assert.deepEqual(accepted.state.ship.pos, before);
    const ctx = createOpsCtx(accepted.state, db, world), draft = draftSortie(accepted.state, ctx);
    assert(draft.units.length > 0);
    assert(validateSortie(accepted.state, ctx, draft).ok); assert.equal(draft.supplies.shipOverhead, false);
    const battle = sortieBattleSetup(accepted.state, ctx, draft); assert(battle.ok);
    const source = battle.sim.setup.units.find(u => u.presence)!; assert.equal(source.presence!.engageable, true);
    const runtime = PB.createBattle(db, battle.sim.setup, battle.seed); assert.equal(runtime.rt!.unitStatus[source.id], "presence");
    assert(!runtime.order.includes(source.id)); assert.equal(PB.canCapture({ db, s: runtime }, source.id), false);
    let seen: Sortie | undefined;
    const run = applyCommand(accepted.state, db, world, { v: "sortie", sortie: draft }, { battle(_s, _ctx, sortie) { seen = sortie; return { ok: true }; } });
    assert(run.result.ok); assert.deepEqual(seen!.lordEncounter, draft.lordEncounter);
    assert.equal(validateSortie(accepted.state, ctx, { ...draft, id: "forged" }).ok, false);
    const away = gateContext(); away.s.pendingChoices = []; away.lord.gate = "unseen"; away.s.ship.pos.region = "absent";
    namedLordsDaily4(away.s, away.ctx); assert.equal(away.lord.gate, "closed"); assert.equal(away.s.pendingBattle, undefined);
  });
  test("偵察部署不可迎戰presence、守牆但牠不來沒有S，契約原文呈現", () => {
    const f = setup(); atDay(f, f.lord.northwardDay); namedLordsDaily2(f.s, f.ctx); contractsDaily2(f.s, f.ctx);
    for (const c of Object.values(f.s.contracts).filter(c => c.template.includes("wanchao-"))) {
      c.status = "active";
      const sortie = draftSortie(f.s, f.ctx, c.id); assert(sortie.units.length > 0);
      const scenario = generateScenario(f.s, f.ctx, sortie), present = scenario.slots.enemy!.units.filter(u => u.presence);
      assert.equal(present.length, c.template === f.script.contracts[0]!.template ? 1 : 0);
      if (present[0]) assert.equal(present[0].presence!.engageable, false);
      assert.equal(scenario.brief, world.require("contract", c.template).text);
    }
    const ui = buildSnapshot(f.s, f.ctx, { tab: "ship", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false });
    for (const c of ui.contracts.filter(c => c.text)) assert.equal(c.text, world.require("contract", f.s.contracts[c.id]!.template).text);
  });
  test("捕捉戰果只入庫一次；不同sortie／非gate偽造拒絕；wallOutcome不改城市歸屬", () => {
    const f = gateContext(); assert(applyLordChoice(f.s, f.ctx, { lord: LORD, choice: "accept" })); f.s.pendingChoices = [];
    const sortie = structuredClone(f.s.pendingBattle!); sortie.units = [defaultUnit(f.s, f.ctx, f.s.hangar.bays.find(Boolean)!, new Set())];
    const { ctx } = pbContext(true); assert(PB.tryCommand(ctx, { kind: "engagePresence", actor: "p", target: "lord" }).ok);
    const capture = db.require("species", "species/tidespine").capture;
    for (const part of PB.partDefs(ctx, "lord")) if (part.functions.some(fn => capture.requireBroken.includes(fn))) {
      const p = ctx.s.units.lord!.parts[part.id]!; p.broken = true; for (const l of p.layers) { l.hp = 0; l.broken = true; }
    }
    PB.capture(ctx, "p", "lord"); const result = PB.battleResult(ctx)!; result.events = structuredClone(ctx.s.log.events);
    result.units = result.units.filter(u => u.id === "lord"); result.persons = [];
    const city = structuredClone(f.s.places[f.script.gate.place]);
    applySortieResult(f.s, f.ctx, sortie, result);
    assert(f.lord.captured); assert(f.lord.battleFinished); assert.equal(f.lord.gate, "closed"); assert.equal(f.lord.wallOutcome, "won");
    assert.deepEqual(f.s.places[f.script.gate.place], city);
    const after = campaignHash(f.s), count = Object.keys(f.s.mechs).length;
    applySortieResult(f.s, f.ctx, sortie, result); assert.equal(campaignHash(f.s), after); assert.equal(Object.keys(f.s.mechs).length, count);
    assert.throws(() => applySortieResult(f.s, f.ctx, { ...sortie, id: "second-sortie" }, result), /invalid lord/);
    assert.throws(() => applySortieResult(f.s, f.ctx, { ...sortie, id: "fake", lordEncounter: undefined }, result), /invalid named lord result|requires gate/);
    const copy = JSON.parse(JSON.stringify(f.s)); rebuildBlightIndex(copy); assert.equal(copy.namedLords[LORD].captured, true);
    const initial = setup(); const saved = serializeCampaign(createCampaignBlob("start/default", 1, [], initial.s));
    assert.equal(campaignHash(loadCampaign(db, world, saved)), campaignHash(initial.s));
  });
});

import { WORLD_KINDS } from "../content/load.ts";
import { policies } from "../sim/policies.ts";
import type { CampaignCommand } from "../sim/campaign.ts";
test("營運存讀：北行、gate待選、接受與capture鎖沿指令重播，不重跑戰鬥", () => {
  // 短曆測試包保留真實地圖與指令鏈；正式28日曆的日期由41月sim驗。
  const tables: WorldTables = {};
  for (const kind of WORLD_KINDS) (tables as Record<string, unknown>)[kind] = Object.fromEntries(world.all(kind).map(d => [d.id, structuredClone(d)]));
  const cal = Object.values(tables.calendar!)[0]!; cal.daysPerMonth = 1; cal.spring = [1]; cal.neap = [];
  for (const omen of Object.values(tables.omen!)) { delete omen.emerge; delete omen.at; omen.cycle = { periodMonths: 1, offsetDays: 0, durationDays: 1 }; omen.setTide = 3; delete omen.tideDelta; }
  const start = tables.start!["base:start/default"]!; start.cash = 1e9; start.debt = 0;
  tables.action!["base:action/wanchao-script"]!.lordScript!.gate.allowedRegions = [...new Set(Object.values(tables.map!["base:map/longland"]!.region!.legend))];
  const short = createWorldDB(world.packs, tables), records: CampaignCommand[] = [];
  let state = newCampaign(db, short, "start/default", 1), savedNorth = false;
  const verify = () => {
    const text = serializeCampaign(createCampaignBlob("start/default", 1, records, state));
    const restored = loadCampaign(db, short, text, () => { throw new Error("不可重跑戰鬥"); });
    assert.equal(campaignHash(restored), campaignHash(state));
  };
  for (let i = 0; i < 200 && state.clock.month <= 40; i++) {
    if (state.pendingChoices.some(p => p.text === tables.action!["base:action/wanchao-script"]!.lordScript!.gate.text)) break;
    const cmd = policies.idle(state, createOpsCtx(state, db, short));
    const out = applyCommand(state, db, short, cmd); assert(out.result.ok); records.push(cmd); state = out.state;
    if (!savedNorth && state.namedLords![LORD]!.moved) { verify(); savedNorth = true; }
  }
  assert(savedNorth); assert.equal(state.namedLords![LORD]!.gate, "offered"); verify();
  const accept: CampaignCommand = { v: "choose", choice: 2 }; const out = applyCommand(state, db, short, accept); assert(out.result.ok); records.push(accept); state = out.state; verify();
  const sortie = draftSortie(state, createOpsCtx(state, db, short)); assert(sortie.units.length);
  const captured = pbContext(true).ctx; PB.tryCommand(captured, { kind: "engagePresence", actor: "p", target: "lord" });
  const required = db.require("species", "species/tidespine").capture.requireBroken;
  for (const p of PB.partDefs(captured, "lord")) if (p.functions.some(f => required.includes(f))) {
    captured.s.units.lord!.parts[p.id]!.broken = true;
    for (const layer of captured.s.units.lord!.parts[p.id]!.layers) { layer.hp = 0; layer.broken = true; }
  }
  PB.capture(captured, "p", "lord"); const result = PB.battleResult(captured)!; result.events = structuredClone(captured.s.log.events); result.units = result.units.filter(u => u.id === "lord"); result.persons = [];
  const record: CampaignCommand = { v: "sortie", sortie };
  const settled = applyCommand(state, db, short, record, { battle(s, ctx, actual) {
    record.battle = { sortie: structuredClone(actual), outcome: { ok: true }, result: structuredClone(result), rng: structuredClone(s.rng), effectCounter: s.effectCounter };
    applySortieResult(s, ctx, actual, result); return { ok: true };
  } });
  assert(settled.result.ok); records.push(record); state = settled.state;
  assert(state.namedLords![LORD]!.captured); verify();
});
