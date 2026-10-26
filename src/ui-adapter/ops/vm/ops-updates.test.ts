import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../../../ops/world/test-support.ts";
import { placeLoc } from "../../../ops/war/loc.ts";
import { factionId } from "../../../ops/war/relations.ts";
import { marketListings } from "../../../ops/world/market.ts";
import { buildSnapshot, type ViewState } from "./snapshot.ts";
import { label, rejection, tideName } from "./labels.ts";
import { clock, skyAt } from "../../../ops/state/clock.ts";
import { nextGreatTide, GREAT_TIDE_LOOKAHEAD } from "./calendar.ts";
const ui: ViewState = { tab: "ship", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false };

test("R01 市場聲望原因與常駐門檻取自交易查詢；可見商品不擴張", () => {
  const { s, ctx } = fixture(), market = ctx.world.require("market", "market/war-armory");
  const model = ctx.world.require("model", "model/union-fr7"), maker = factionId(s, ctx, model.maker)!;
  s.ship.pos = placeLoc(s, ctx, market.place); s.ship.drifting = false;
  s.places[market.place]!.ownerOverride = model.maker;
  const before = structuredClone(s), listings = marketListings(s, ctx, market);
  const snapshot = buildSnapshot(s, ctx, ui), item = snapshot.market.items.find(i => i.id === model.frame)!;
  assert(item.reputation?.blocked);
  assert.equal(item.reputation.have, s.factions[maker]!.rep);
  assert.equal(item.buttons[0]!.reason, `需要${item.reputation.factionName}聲望 ${item.reputation.need}（目前 ${item.reputation.have}）`);
  assert.equal(item.buttons[0]!.enabled, false);
  assert.deepEqual(s, before);
  assert.deepEqual(snapshot.market.items.filter(i => !i.kindName.includes("持有")).map(i => i.id), listings.map(l => l.item.def));
  s.factions[maker]!.rep = item.reputation.need;
  assert.equal(buildSnapshot(s, ctx, ui).market.items.find(i => i.id === model.frame)!.reputation!.blocked, false);
  assert.equal(rejection("reputation-required"), "聲望未達購買門檻");
});

test("R02 朔望 spring 與喚醒限制統一稱漲潮", () => {
  assert.equal(label("spring"), "漲潮");
  assert.equal(rejection("not-spring-night"), "須等到漲潮之夜");
});

test("R03 頂列與逐日潮候／潮級含天象修正，區分漲潮、大潮與連珠潮", () => {
  const { s, ctx } = fixture(), cal = ctx.world.require("calendar", s.calendar);
  for (const day of [0, 1, 7, 70, 1120]) {
    s.clock = clock(day, cal, ctx.world.all("omen"));
    const snap = buildSnapshot(s, ctx, ui), daily = snap.calendar.days.find(d => d.today)!;
    assert.equal(snap.header.tide, s.clock.tide); assert.equal(snap.header.stage, s.clock.stage);
    assert.equal(daily.tide, s.clock.tide); assert.equal(daily.stage, s.clock.stage);
    for (const d of snap.calendar.days) {
      const expected = clock(day - s.clock.dom + d.dom, cal, ctx.world.all("omen"));
      assert.equal(d.tide, expected.tide); assert.equal(d.stage, expected.stage);
    }
  }
  assert.deepEqual([0, 1, 2, 3, 4].map(tideName), ["平潮", "枯潮", "漲潮", "大潮", "連珠潮"]);
});

test("R04 天象短標、說明、潮級修正與百科連結源自現有定義", () => {
  const { s, ctx } = fixture(), cal = ctx.world.require("calendar", s.calendar), defs = ctx.world.all("omen");
  s.clock = clock(1120, cal, defs);
  const snap = buildSnapshot(s, ctx, ui);
  assert.deepEqual(snap.header.omens.map(o => o.id), skyAt(1120, cal, defs).omens);
  assert(snap.header.omens.length > 0);
  assert.deepEqual(snap.calendar.omens, snap.header.omens);
  for (const o of snap.header.omens) {
    const def = defs.find(d => d.id === o.id)!;
    assert.equal(o.name, def.name); assert.equal(o.text, def.text ?? "");
    assert.equal(decodeURIComponent(o.href), `#/wiki/e/${o.id}`);
    if (def.setTide !== undefined) assert.match(o.tideEffect, /潮級設為/);
  }
  const noOmens = { ...ctx, world: { ...ctx.world, all: ((kind) => kind === "omen" ? [] : ctx.world.all(kind)) as typeof ctx.world.all } };
  assert.deepEqual(buildSnapshot(s, noOmens, ui).header.omens, []);
});

test("R05 真正大潮預報找 day70、包含今日、區別朔望並有 800 日上限", () => {
  const { s, ctx } = fixture(), cal = ctx.world.require("calendar", s.calendar), defs = ctx.world.all("omen");
  const snap = buildSnapshot(s, ctx, ui), next = snap.calendar.nextGreatTide!;
  assert.equal(snap.calendar.nextSpringIn, 0); assert.equal(next.day, 70); assert.equal(next.daysAway, 70);
  assert.equal(next.tide, clock(70, cal, defs).tide);
  assert.deepEqual(next.omens.map(o => o.id), skyAt(70, cal, defs).omens);
  assert.equal(nextGreatTide(70, cal, defs)!.daysAway, 0);
  assert.equal(nextGreatTide(0, cal, []), null);
  const def = defs[0]!;
  // 簡化曆每一天都是漲潮，精確驗證搜尋邊界。
  const dailyCal = { ...cal, daysPerMonth: 1, spring: [1], neap: [] };
  const delayed = (day: number) => [{ ...def, cycle: undefined, emerge: undefined, at: [{ month: day, dom: 1 }], setTide: 3 }];
  assert.equal(nextGreatTide(0, dailyCal, delayed(GREAT_TIDE_LOOKAHEAD))!.daysAway, GREAT_TIDE_LOOKAHEAD);
  assert.equal(nextGreatTide(0, dailyCal, delayed(GREAT_TIDE_LOOKAHEAD + 1)), null);
});


import { lordScripts, namedLordsDaily4 } from "../../../ops/world/lords.ts";
import { locAt } from "../../../ops/war/loc.ts";
import { syncOmenFlags } from "../../../ops/state/omens.ts";
import { applyCommand } from "../../../ops/time/index.ts";
import { createOpsCtx } from "../../../ops/content/start.ts";
import { draftSortie } from "./formation.ts";
import { scenarioToSetup } from "../../../sim/run.ts";
import { BattleSession } from "../../vm/session.ts";
import { BattleController } from "../../vm/controller.ts";
import { BattleViewModel } from "../../vm/viewmodel.ts";

test("K1 艦橋王跡三態原文與最後目擊日、守牆邀請與灰按鈕原因", () => {
  const { s, ctx } = fixture(), script = lordScripts(ctx)[0]!, lord = s.namedLords![script.lord]!;
  for (const [i, status] of (["present", "northward", "gone"] as const).entries()) {
    lord.status = status; lord.sinceDay = i * 100;
    const snap = buildSnapshot(s, ctx, ui);
    assert(snap.room.desc.includes(`王跡　${script.trace[status]}（最後目擊第 ${i * 100} 天）`));
  }
  s.clock = clock(1120, ctx.world.require("calendar", s.calendar), ctx.world.all("omen"));
  syncOmenFlags(s.flags, skyAt(1120, ctx.world.require("calendar", s.calendar), ctx.world.all("omen")).omens);
  s.ship.pos = locAt(ctx, script.gate.map, { x: 126, y: 100 });
  namedLordsDaily4(s, ctx);
  const offered = buildSnapshot(s, ctx, ui);
  assert.equal(offered.prompt!.text, script.gate.text);
  assert.equal(offered.prompt!.choices.find(c => c.n === 2)!.enabled, true);
  assert.equal(offered.roomButtons.find(b => b.id === "sortieOpen")!.reason, "先回應事件");
  const accepted = applyCommand(s, ctx.db, ctx.world, { v: "choose", choice: 2 });
  assert(accepted.result.ok);
  const next = accepted.state, nextCtx = createOpsCtx(next, ctx.db, ctx.world), draft = draftSortie(next, nextCtx);
  assert.equal(draft.lordEncounter!.lord, script.lord); assert.equal(draft.supplies.shipOverhead, false);
  assert.equal(buildSnapshot(next, nextCtx, { ...ui, draft }).sortie!.error, null);
  const bad = { ...draft, id: "expired-invitation" };
  const rejected = buildSnapshot(next, nextCtx, { ...ui, draft: bad }).sortie!;
  assert.equal(rejected.error, "守牆邀請已失效或出戰編成不符");
  assert.equal(rejected.buttons[0]!.enabled, false); assert.equal(rejected.buttons[0]!.reason, rejected.error);
  assert.equal(rejection("lord-observation-expired"), "王跡觀測期限已過");
});

test("K1 營運共用戰鬥 controller 迎戰須確認；灰鈕有原因，取消不迎戰", () => {
  const { ctx } = fixture(), base = scenarioToSetup(ctx.db, "scenario/skirmish-whitegloves", 1).setup;
  const player = structuredClone(base.units.find(u => u.id === "player-2")!);
  player.id = "p"; player.pos = { x: 1, y: 1 };
  const setup: typeof base = { ...base, id: "ops-presence-ui-test", maxRounds: 3,
    map: { width: 6, height: 4, fill: "terrain/plain", exits: [] },
    units: [player, { id: "e", owner: "enemy", pos: { x: 5, y: 3 }, monster: { species: "species/hound", grade: "D" as const } },
      { id: "lord", owner: "enemy", pos: { x: 2, y: 1 }, monster: { species: "species/tidespine", grade: "S" as const, def: "monster/tidespine-chittagong" },
        presence: { aura: "effect/kx-tidal-dread", engageable: true } }],
    objectives: [{ kind: "survive", params: { rounds: 3 }, for: "player", onComplete: "win" as const },
      { kind: "eliminate", params: { slots: ["player"] }, for: "enemy", onComplete: "win" as const }] };
  const session = new BattleSession({ db: ctx.db, sim: { scenario: setup.id, setup, slotProfiles: {}, unitPolicies: {} }, seed: 1, autoAdvance: false });
  const c = new BattleController({ session }), option = c.snapshot().commands.find(cmd => cmd.id === "engagePresence:lord")!;
  assert(option.enabled);
  const disabled = new BattleViewModel(session).commands(null).find(cmd => cmd.id === option.id)!;
  assert.equal(disabled.enabled, false); assert.equal(disabled.reason, "尚未選擇棋子");
  assert.match(disabled.tooltip, /尚未選擇棋子/);
  assert.equal(c.dispatch(option.action).confirm!.action, "engagePresence");
  assert.equal(session.state.rt!.unitStatus.lord, "presence");
  c.dispatch({ type: "cancel" }); assert.equal(session.state.rt!.unitStatus.lord, "presence");
  c.dispatch(option.action); c.dispatch({ type: "confirm" });
  assert.equal(session.state.rt!.unitStatus.lord, "active");
});
