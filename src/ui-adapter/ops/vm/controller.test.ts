import { placeAt, placeLoc } from "../../../ops/war/loc.ts";
import { allPlaces } from "../../../ops/world/places.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { campaignHash, parseCampaign } from "../../../ops/sim/save.ts";
import { buildSnapshot } from "./snapshot.ts";
import { createOpsCtx } from "../../../ops/content/start.ts";
import { eventLog } from "../../../ops/text/index.ts";
import { OpsController } from "./index.ts";
import { WorldViewModel } from "./world.ts";
import type { WorldDB } from "../../../ops/content/worlddb.ts";
import type { WorldKind, WorldDefByKind } from "../../../ops/state/types.ts";
import { allButtons } from "./keymap.ts";
import type { OpsSnapshot, OpsKeyInput } from "./types.ts";
const { db, world } = loadWorldDirs(["content/base"]);
const opts = { db, world, seed: 3, spectate: true };

test("快照與快捷鍵共用計算，回傳副本隔離，所有dispatch使快取失效", () => {
  let reads = 0;
  const observedDb = new Proxy(db, { get(target, property, receiver) {
    if (property === "require") reads++;
    return Reflect.get(target, property, receiver);
  } });
  const c = new OpsController({ ...opts, db: observedDb });
  prompts(c); // 開局第 0 天先處理開場劇情
  const first = c.snapshot(), computed = reads;
  assert.ok(computed > 0);
  const originalCash = first.header.cash;
  first.header.cash = -999;
  first.tabs.length = 0;
  const action = c.key({ key: "k" });
  assert.deepEqual(action, { type: "tab", tab: "mechs" });
  if (action?.type === "tab") action.tab = "ledger";
  assert.deepEqual(c.key({ key: "k" }), { type: "tab", tab: "mechs" });
  const again = c.snapshot();
  assert.equal(again.header.cash, originalCash);
  assert.ok(again.tabs.length > 0);
  assert.equal(reads, computed, "同狀態讀取／按鍵不得再查內容建快照");

  const changed = c.dispatch({ type: "tab", tab: "mechs" });
  assert.equal(changed.tab, "mechs");
  assert.equal(reads, computed, "純切頁沿用已驗證資料，不重試契約／市場指令");
  changed.tab = "ledger";
  assert.equal(c.snapshot().tab, "mechs");
  const afterTab = reads;
  c.dispatch({ type: "toggleHelp" });
  assert.ok(reads > afterTab);
  assert.equal(c.snapshot().showHelp, true);
  assert.equal(c.key({ key: "k" }), null);
  assert.deepEqual(c.key({ key: "Escape" }), { type: "cancel" });
  c.dispatch({ type: "cancel" });
  assert.equal(c.snapshot().showHelp, false);
  assert.deepEqual(c.key({ key: "k" }), { type: "tab", tab: "mechs" });

  const rejected = c.dispatch({ type: "cmd", cmd: { v: "accept", contract: "missing" } });
  assert.equal(rejected.message, "契約已非待接狀態");
  assert.equal(c.snapshot().message, rejected.message);
  c.dispatch({ type: "tab", tab: "ship" });
  assert.equal(c.snapshot().message, null);
  const restored = OpsController.fromSave({ ...opts, db: observedDb }, c.serialize());
  assert.equal(campaignHash(restored.state), campaignHash(c.state));
  assert.equal(restored.snapshot().tab, "ship");
  assert.equal(restored.snapshot().message, null);
});

test("首次世界頁沿用非地圖快照，切回船艙恢復快捷鍵且無重複鍵提示", () => {
  const c = new OpsController(opts); prompts(c);
  const before = c.snapshot();
  const originalClone = globalThis.structuredClone;
  let campaignCopies = 0;
  globalThis.structuredClone = ((value: unknown) => {
    if (value && typeof value === "object" && "rng" in value && "ship" in value && "contracts" in value) campaignCopies++;
    return originalClone(value);
  }) as typeof structuredClone;
  try {
    const map = c.dispatch({ type: "tab", tab: "world" });
    assert.ok(map.world.grid);
    assert.deepEqual(map.contracts.map(c => c.buttons.map(b => [b.enabled, b.reason])), before.contracts.map(c => c.buttons.map(b => [b.enabled, b.reason])));
    assert.ok(campaignCopies <= map.world.grid.actions.filter(b => b.action.type === "cmd").length, "首開只可驗證地圖命令，不得為隱藏契約／市場再深拷貝戰役試跑");
    assert.deepEqual(c.key({ key: "ArrowRight" }), { type: "mapMove", dx: 1, dy: 0 });
    for (let i = 0; i < 2; i++) {
      c.dispatch({ type: "tab", tab: "ship" });
      assert.deepEqual(c.key({ key: "k" }), { type: "tab", tab: "mechs" });
      c.dispatch({ type: "tab", tab: "world" });
    }
    for (const b of allButtons(c.snapshot())) assert.ok((b.tooltip.match(/快捷鍵：/g) ?? []).length <= 1);
  } finally { globalThis.structuredClone = originalClone; }
});

test("離開世界頁不公開地圖，隱藏頁地圖動作使模型失效", () => {
  const hidden = new OpsController(opts), visible = new OpsController(opts);
  prompts(hidden); prompts(visible);
  // 船艙原有 map:{"v":"map"} 是「查看世界圖」合法命令，不能靠 id 前綴排除。
  const shipButtons = allButtons(hidden.snapshot()).map(b => ({ id: b.id, action: b.action }));
  const first = hidden.dispatch({ type: "tab", tab: "world" }).world.grid!;
  visible.dispatch({ type: "tab", tab: "world" });
  const ship = hidden.dispatch({ type: "tab", tab: "ship" });
  assert.equal(ship.world.grid, undefined);
  assert.deepEqual(allButtons(ship).map(b => ({ id: b.id, action: b.action })), shipButtons);
  const actions = [
    { type: "mapCursor", x: Math.min(first.cursor.x + 1, first.size.w - 1), y: first.cursor.y },
    { type: "mapScroll", dx: 1, dy: 1 },
    { type: "mapLayer", layer: "territory" },
    { type: "mapCancel" },
  ] as const;
  for (const action of actions) {
    assert.equal(hidden.dispatch(action).world.grid, undefined);
    const expected = visible.dispatch(action).world.grid;
    const actual = hidden.dispatch({ type: "tab", tab: "world" }).world.grid;
    assert.deepEqual(actual, expected, `${action.type} 回世界頁須與直接操作的游標／可視格／路徑一致`);
    assert.equal(hidden.dispatch({ type: "tab", tab: "ship" }).world.grid, undefined);
  }
});

test("編隊 AI 駕駛切換可開關，清空座位後仍可自駕", () => {
  const c = new OpsController(opts); prompts(c);
  const opened = c.dispatch({ type: "sortieOpen" });
  const unit = opened.sortie!.units.find(u => u.included)!;
  assert(unit);
  c.dispatch({ type: "sortieAi", mech: unit.mech, enabled: true });
  for (const seat of unit.seats) c.dispatch({ type: "sortieSeat", mech: unit.mech, seat: seat.seat, person: null });
  assert.equal(c.snapshot().sortie!.units.find(u => u.mech === unit.mech)!.ai, true);
  assert.notEqual(c.snapshot().sortie!.error, "機體尚未配置駕駛或機魂");
  c.dispatch({ type: "sortieAi", mech: unit.mech, enabled: false });
  assert.equal(c.snapshot().sortie!.units.find(u => u.mech === unit.mech)!.ai, false);
});
function input(key: string): OpsKeyInput {
  const parts = key.split("+"), last = parts.pop()!;
  return { key: last === "Esc" ? "Escape" : last, altKey: parts.includes("Alt"), ctrlKey: parts.includes("Ctrl"), shiftKey: parts.includes("Shift") };
}
function verifySnapshot(c: OpsController, s: OpsSnapshot = c.snapshot()): void {
  const fields = ["header", "tab", "tabs", "timeButtons", "room", "roomButtons", "world", "contracts", "roster", "mechs", "ledger", "market", "calendar", "panels", "logFilter", "logFilters", "log", "prompt", "sortie", "battle", "report", "message", "keyHints", "showHelp", "over"];
  assert.deepEqual(Object.keys(s).sort(), fields.sort());
  function defined(value: unknown): void {
    assert.notEqual(value, undefined);
    if (value && typeof value === "object") for (const child of Object.values(value)) defined(child);
  }
  defined(s);
  for (const b of allButtons(s)) {
    assert.equal(typeof b.enabled, "boolean");
    if (!b.enabled) assert.ok(b.reason);
    if (b.enabled && b.key) assert.deepEqual(c.key(input(b.key)), b.action, b.id);
  }
  if (s.prompt) for (const b of allButtons(s)) if (!(b.action.type === "cmd" && b.action.cmd.v === "choose")) {
    assert.equal(b.enabled, false); assert.equal(b.reason, "先回應事件");
  }
  assert.equal(s.world.nodes.length, allPlaces(c.state, { world }).length);
  assert.equal(s.calendar.days.length, s.calendar.daysPerMonth);
}
function prompts(c: OpsController): void {
  for (let i = 0; c.snapshot().prompt && i < 30; i++) {
    const s = c.snapshot(); verifySnapshot(c, s);
    const choice = s.prompt!.choices.find(c => c.enabled && c.text === "交涉") ?? s.prompt!.choices.find(c => c.enabled); assert.ok(choice);
    c.dispatch({ type: "cmd", cmd: { v: "choose", choice: choice.n } });
  }
  assert.equal(c.snapshot().prompt, null);
}
function prepared(): { c: OpsController; contract: string } {
  const c = new OpsController(opts); verifySnapshot(c);
  for (let i = 0; !Object.values(c.state.contracts).some(c => c.status === "offered") && i < 30; i++) {
    prompts(c); c.dispatch({ type: "advance", until: "event" });
  }
  prompts(c);
  const contract = Object.values(c.state.contracts).find(c => c.status === "offered"); assert.ok(contract);
  c.dispatch({ type: "selectContract", contract: contract.id }); verifySnapshot(c);
  const accepted = c.dispatch({ type: "cmd", cmd: { v: "accept", contract: contract.id } }); assert.equal(accepted.message, null);
  c.dispatch({ type: "cmd", cmd: { v: "sail", to: contract.target.place } });
  for (let i = 0; placeAt(c.state, { world }, c.state.ship.pos) !== contract.target.place && i < 60; i++) {
    prompts(c);
    if (!c.state.ship.path) c.dispatch({ type: "cmd", cmd: { v: "sail", to: contract.target.place } });
    c.dispatch({ type: "advance", until: "event" });
  }
  prompts(c); assert.equal(placeAt(c.state, { world }, c.state.ship.pos), contract.target.place);
  c.dispatch({ type: "selectNode", node: contract.target.place }); verifySnapshot(c);
  const s = c.dispatch({ type: "sortieOpen", contract: contract.id });
  assert.ok(s.sortie); assert.equal(s.sortie.error, null); assert.ok(s.sortie.units.some(u => u.included)); verifySnapshot(c, s);
  return { c, contract: contract.id };
}
function finished(c: OpsController, contract: string): void {
  const s = c.snapshot(); assert.ok(s.report); assert.ok(s.report.lines.length);
  assert.equal(s.battle, null); assert.equal(c.battleController(), null);
  assert.ok(c.state.log.some(e => e.type === "BattleResolved"));
  assert.notEqual(c.state.contracts[contract]!.status, "active");
  verifySnapshot(c, s);
  const saved = c.serialize(), restored = OpsController.fromSave(opts, saved);
  assert.equal(campaignHash(restored.state), campaignHash(c.state));
  assert.ok(parseCampaign(saved).commands.some(cmd => cmd.battle?.result));
}
test("快照唯讀、鍵盤 disabled、編成取消與錯誤原因", () => {
  const c = new OpsController(opts), before = campaignHash(c.state);
  const s = c.snapshot(); s.header.cash = -999; const copy = c.state; copy.ledger.balances.cash = -999;
  assert.equal(campaignHash(c.state), before);
  // 開局第 0 天就是開場劇情的待選畫面：推進鍵停用，選完才可下其他指令。
  assert.ok(c.snapshot().prompt); assert.equal(c.state.clock.day, 0);
  assert.equal(c.key({ key: "w" }), null); verifySnapshot(c);
  prompts(c);
  assert.equal(c.dispatch({ type: "cmd", cmd: { v: "accept", contract: "missing" } }).message, "契約已非待接狀態");
  c.dispatch({ type: "toggleHelp" }); verifySnapshot(c);
  assert.deepEqual(c.key({ key: "Escape" }), { type: "cancel" }); c.dispatch({ type: "cancel" });
  c.dispatch({ type: "sortieOpen" }); verifySnapshot(c); c.dispatch({ type: "sortieCancel" }); assert.equal(c.snapshot().sortie, null);
});
test("ISS-042：spectate 互動出戰回寫含完整事件，計功／耗材與 auto 出戰一致", () => {
  const auto = prepared(), live = prepared();
  assert.equal(campaignHash(live.c.state), campaignHash(auto.c.state));
  auto.c.dispatch({ type: "sortieLaunch", mode: "auto" });
  live.c.dispatch({ type: "sortieLaunch", mode: "command" });
  const battle = live.c.battleController()!; assert.ok(battle);
  for (let i = 0; !battle.session.outcome() && i < 1000; i++) battle.dispatch({ type: "skip" });
  live.c.dispatch({ type: "battleDone" }); finished(live.c, live.contract);
  const recorded = (c: OpsController) => parseCampaign(c.serialize()).commands.findLast(cmd => cmd.battle?.result)!.battle!.result!;
  const a = recorded(auto.c), b = recorded(live.c);
  assert.ok(b.events?.length, "互動回寫的 BattleResult 應附 events");
  assert.equal(b.events!.length, a.events!.length);
  assert.deepEqual(live.c.state.contracts[live.contract], auto.c.state.contracts[auto.contract]);
  assert.deepEqual(live.c.state.inventory, auto.c.state.inventory);
  assert.deepEqual(live.c.state.ledger.balances, auto.c.state.ledger.balances);
  assert.equal(campaignHash(live.c.state), campaignHash(auto.c.state));
});

test("營運記錄：先移除地圖日常訊息再限200行，開場與警報不被洗掉", () => {
  const c = new OpsController(opts), state = c.state;
  const opening = state.log.find(e => e.type !== "Posted" && e.type !== "ActorSpawned")!;
  const seq = state.log.length;
  state.log.push(...Array.from({ length: 250 }, (_, i) => ({ seq: seq + i, day: 0, type: "ActorSpawned", payload: {} })));
  const before = structuredClone(state.log);
  const snapshot = buildSnapshot(state, createOpsCtx(state, db, world), {
    tab: "ship", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false,
  });
  assert.ok(snapshot.log.some(row => row.text === eventLog(opening, state, world).text));
  assert.ok(!snapshot.log.some(row => row.text.includes("行動訊號")));
  assert.equal(snapshot.logFilter, "important");
  assert.ok(snapshot.log.length <= 200);
  assert.deepEqual(state.log, before);
});


test("地圖 hover 沿用格子縮圖與非地圖快照，指令後重新產生", () => {
  const c = new OpsController(opts); prompts(c);
  c.dispatch({ type: "tab", tab: "world" });
  let minis = 0;
  const original = WorldViewModel.prototype.minimap;
  WorldViewModel.prototype.minimap = function () { minis++; return original.call(this); };
  try {
    const before = c.snapshot(), at = before.world.grid!.cursor;
    const first = c.dispatch({ type: "mapHover", x: at.x, y: at.y });
    const second = c.dispatch({ type: "mapHover", x: at.x, y: at.y });
    assert.equal(minis, 0, "移動滑鼠不應重建全圖縮圖");
    assert.deepEqual(second.contracts, before.contracts);
    assert.deepEqual(second.world.grid!.actions, first.world.grid!.actions, "快捷鍵提示不累加");
    first.world.grid!.cells.length = 0;
    assert.ok(c.snapshot().world.grid!.cells.length > 0, "公開快照隔離");
    c.dispatch({ type: "mapZoom", dir: -1 });
    assert.equal(minis, 0, "縮放只重新建立可視格，不重畫全圖縮圖");
    c.dispatch({ type: "mapScroll", dx: 1, dy: 0 });
    c.dispatch({ type: "mapResize", w: 12, h: 9 });
    c.dispatch({ type: "mapViewport", x: at.x, y: at.y });
    assert.equal(minis, 0, "視窗移動與尺寸改變不重建縮圖");
    c.dispatch({ type: "tab", tab: "ship" });
    c.dispatch({ type: "tab", tab: "world" });
    assert.equal(minis, 0, "純切頁保留同一戰役的地圖模型");
  } finally { WorldViewModel.prototype.minimap = original; }
});


test("地圖高頻操作不重驗非地圖契約與市場按鈕", () => {
  let contractReads = 0;
  const observedWorld: WorldDB = { ...world,
    require<K extends WorldKind>(kind: K, id: string): WorldDefByKind[K] {
      if (kind === "contract") contractReads++;
      return world.require(kind, id);
    },
  };
  const c = new OpsController({ ...opts, world: observedWorld }); prompts(c);
  c.dispatch({ type: "advance", until: "day" }); prompts(c);
  assert.ok(contractReads > 0, "日結確實建立並讀取契約資料");
  contractReads = 0;
  const before = c.dispatch({ type: "tab", tab: "world" });
  assert.ok(before.contracts.length > 0, "有契約才可驗證沒有重建契約卡");
  assert.equal(contractReads, 0, "首次切進世界頁沿用已驗證的契約");
  contractReads = 0;
  const at = before.world.grid!.cursor;
  c.dispatch({ type: "mapHover", ...at });
  c.dispatch({ type: "mapScroll", dx: 1, dy: 0 });
  assert.equal(contractReads, 0);
  c.dispatch({ type: "tab", tab: "contracts" });
  assert.equal(contractReads, 0, "純切頁沿用已驗證的契約資料");
  c.dispatch({ type: "advance", until: "day" });
  assert.ok(contractReads > 0, "真正日結後須重新產生契約資料");
});


test("世界圖說明遮罩中反覆選格不累加快捷鍵提示", () => {
  const c = new OpsController(opts); prompts(c);
  c.dispatch({ type: "tab", tab: "world" });
  const opened = c.dispatch({ type: "toggleHelp" });
  const at = opened.world.grid!.cursor;
  const original = opened.roomButtons.find(b => b.id === "cancel")!.tooltip;
  c.dispatch({ type: "mapCursor", ...at });
  const after = c.dispatch({ type: "mapCursor", ...at });
  assert.equal(after.roomButtons.find(b => b.id === "cancel")!.tooltip, original);
});


test("通知篩選不改戰役、待選事件或提示，跨頁與推日保留本次選擇", () => {
  const c = new OpsController(opts);
  const opening = c.snapshot(), state = c.state;
  assert.equal(opening.logFilter, "important");
  assert.ok(opening.prompt);
  const filtered = c.dispatch({ type: "logFilter", filter: "all" });
  assert.equal(filtered.logFilter, "all");
  assert.deepEqual(c.state, state, "篩選不得改模擬狀態或待選事件");
  assert.deepEqual(filtered.prompt, opening.prompt);
  assert.equal(filtered.message, opening.message);
  prompts(c);
  assert.equal(c.dispatch({ type: "tab", tab: "ledger" }).logFilter, "all");
  c.dispatch({ type: "advance", until: "day" });
  assert.equal(c.snapshot().logFilter, "all");
  prompts(c);
  const rejected = c.dispatch({ type: "cmd", cmd: { v: "accept", contract: "missing" } });
  const before = c.state;
  const changed = c.dispatch({ type: "logFilter", filter: "money" });
  assert.equal(changed.message, rejected.message);
  assert.deepEqual(c.state, before);
  assert.equal(OpsController.fromSave(opts, c.serialize()).snapshot().logFilter, "important", "新載入還原預設分類");
});


test("所在港口停泊保護依失守規則顯示，待選事件仍可看到警示", () => {
  const c = new OpsController(opts), state = c.state, ctx = createOpsCtx(state, db, world);
  const initialPos = structuredClone(state.ship.pos);
  assert.equal(placeAt(state, ctx, initialPos), "base:place/dhaka");
  state.ship.pos = placeLoc(state, ctx, "base:place/chittagong");
  assert.equal(placeAt(state, ctx, state.ship.pos), "base:place/chittagong");
  assert.notDeepEqual(state.ship.pos, initialPos);
  const ui = { tab: "ship" as const, node: null, contract: null, mech: null, person: null,
    draft: null, battle: null, report: null, message: null, showHelp: false };
  const safe = buildSnapshot(state, ctx, ui);
  assert.ok(safe.prompt, "開場事件仍待選");
  assert.equal(safe.header.docked, true);
  assert.equal(safe.header.unsafeDocked, false);
  state.ship.pos = initialPos;
  const before = structuredClone(state);
  const fallen = buildSnapshot(state, ctx, ui);
  assert.equal(fallen.header.docked, true);
  assert.equal(fallen.header.unsafeDocked, true);
  assert.deepEqual(fallen.prompt, safe.prompt);
  assert.deepEqual(state, before, "呈現警示不改模擬狀態");
});
