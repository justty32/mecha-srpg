import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window, type HTMLButtonElement as HappyButton, type HTMLDetailsElement as HappyDetails, type HTMLElement as HappyElement } from "happy-dom";
import { mountOps } from "./render.ts";
import { mountWorldMap, worldMapContentRect } from "./world-map.ts";
import { opsFixture, promptFixture, sortieFixture } from "./fixtures.ts";
import type { OpsKeyInput, OpsSnapshot, OpsUiAction } from "../vm/types.ts";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { OpsController } from "../vm/controller.ts";

// 開局第 0 天先處理開場劇情，畫面才回到可操作的營運頁。
function opened(c: OpsController): OpsController {
  for (let i = 0; c.snapshot().prompt && i < 5; i++) c.dispatch({ type: "cmd", cmd: { v: "choose", choice: 1 } });
  return c;
}
test("全圖contain留白不屬於世界座標：600×450圖在600×240盒的25%位置為220", () => {
  const rect = worldMapContentRect({ x: 0, y: 0, width: 600, height: 240 }, { w: 600, h: 450 });
  assert.deepEqual(rect, { x: 140, y: 0, width: 320, height: 240 });
  assert.equal(rect.x + rect.width * .25, 220);
  const wide = worldMapContentRect({ x: 10, y: 20, width: 240, height: 600 }, { w: 600, h: 450 });
  assert.deepEqual(wide, { x: 10, y: 230, width: 240, height: 180 });
});

test("全圖真click(220,120)投影為(150,225)，留白不導航", t => {
  const { db, world } = loadWorldDirs(["content/base"]), controller = opened(new OpsController({ db, world, seed: 3 }));
  const source = controller.dispatch({ type: "tab", tab: "world" }).world;
  const grid = source.grid!;
  grid.size = { w: 600, h: 450 }; grid.zoom = .25; grid.regionLabels = [];
  const win = new Window(), root = win.document.createElement("div"); win.document.body.append(root);
  const actions: OpsUiAction[] = [];
  const view = mountWorldMap(root as unknown as HTMLElement, { onAction: action => actions.push(action) });
  t.after(() => { view.destroy(); win.close(); });
  const canvas = root.querySelector('[data-ui="world-overview"]')!;
  canvas.getBoundingClientRect = () => new win.DOMRect(0, 0, 600, 240);
  view.render(source);
  canvas.dispatchEvent(new win.MouseEvent("click", { clientX: 70, clientY: 120, bubbles: true }));
  assert.deepEqual(actions, []);
  canvas.dispatchEvent(new win.MouseEvent("click", { clientX: 220, clientY: 120, bubbles: true }));
  assert.deepEqual(actions, [{ type: "mapZoom", dir: 1 }, { type: "mapViewport", x: 150, y: 225 }]);
});

function setup(t: TestContext, snapshot: OpsSnapshot = opsFixture()) {
  const win = new Window();
  const root = win.document.createElement("div");
  win.document.body.append(root);
  const actions: OpsUiAction[] = [];
  const keys: OpsKeyInput[] = [];
  const view = mountOps(root as unknown as HTMLElement, { onAction: a => actions.push(a), onKey: k => { keys.push(k); return true; } });
  t.after(() => { view.destroy(); win.close(); });
  view.render(snapshot);
  const q = (sel: string) => root.querySelector(sel) as unknown as HTMLElement | null;
  const click = (sel: string) => { const n = q(sel); assert.ok(n, `找不到 ${sel}`); n.dispatchEvent(new win.MouseEvent("click", { bubbles: true }) as unknown as Event); };
  return { root, win, view, actions, keys, q, click };
}

test("契約空板提示既有推進一天；進行中與歷史契約不誤導等待", t => {
  const empty = opsFixture("contracts"); empty.contracts = [];
  const { root, view } = setup(t, empty);
  assert.match(root.querySelector(".pane-contracts")!.textContent!, /「推進一天」.*是否有新委託/);
  assert.equal(root.querySelectorAll('button[data-action-id="advance:day"]').length, 1);
  for (const status of ["active", "done"] as const) {
    const next = opsFixture("contracts");
    next.contracts = [next.contracts[0]!]; next.contracts[0]!.status = status;
    view.render(next);
    assert.doesNotMatch(root.querySelector(".pane-contracts")!.textContent!, /是否有新委託/);
    assert.match(root.querySelector(".pane-contracts")!.textContent!, /清剿：沼原/);
  }
});

test("契約板先列進行中與依期限穩定排序的可接取，終局四態收進原生歷史", t => {
  const s = opsFixture("contracts"), base = s.contracts[0]!;
  s.contracts = [
    { ...base, id: "late", title: "晚約", deadlineDay: 40, selected: false },
    ...(["done", "failed", "cancelled", "expired"] as const).map(status => ({ ...base, id: status, title: status, status, selected: false })),
    { ...base, id: "near-a", title: "近約甲", deadlineDay: 20, selected: false },
    { ...base, id: "active", title: "已接", status: "active", selected: false },
    { ...base, id: "near-b", title: "近約乙", deadlineDay: 20, selected: false },
    { ...base, id: "stage", title: "階段", status: "stage", selected: false },
  ];
  const { root, win, click, actions } = setup(t, s);
  const groups = root.querySelector(".ops-contract-groups")!;
  assert.deepEqual([...groups.querySelectorAll("h3")].map(n => n.textContent), ["進行中", "可接取"]);
  assert.deepEqual([...groups.querySelectorAll(":scope > ul > li strong")].map(n => n.textContent), ["已接", "階段", "近約甲", "近約乙", "晚約"]);
  const history = groups.querySelector("details")!;
  assert.equal(history.open, false);
  assert.equal(history.querySelector("summary")!.textContent, "已結束（4）");
  assert.equal(history.querySelectorAll('li[role="button"][tabindex="0"]').length, 4);
  history.open = true;
  click(".ops-contract-history li");
  assert.deepEqual(actions, [{ type: "selectContract", contract: "done" }]);
  history.querySelector("li")!.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.deepEqual(actions[1], { type: "selectContract", contract: "done" });
});

test("契約選取跨接受與過期保留，轉歷史自動展開且一般重繪尊重手動開關", t => {
  const s = opsFixture("contracts"); s.contracts = [s.contracts[0]!];
  const { root, view } = setup(t, s);
  const selected = () => root.querySelector('.pane-contracts li[aria-pressed="true"] strong')!.textContent;
  s.contracts[0]!.status = "active"; view.render(s);
  assert.equal(selected(), s.contracts[0]!.title);
  assert.equal(root.querySelector(".ops-contract-groups h3")!.textContent, "進行中");
  s.contracts[0]!.status = "expired"; view.render(s);
  assert.equal(selected(), s.contracts[0]!.title);
  let history = root.querySelector<HappyDetails>(".ops-contract-history")!;
  assert.equal(history.hasAttribute("open"), true);
  assert.match(root.querySelector(".pane-contracts")!.textContent!, /目前沒有可接取的契約/);
  assert.equal(root.querySelectorAll(".ops-contract-groups > h3").length, 0);
  history.toggleAttribute("open", false);
  s.contracts[0]!.daysLeft--; view.render(s);
  history = root.querySelector<HappyDetails>(".ops-contract-history")!; assert.equal(history.hasAttribute("open"), false);
  history.toggleAttribute("open", true);
  s.contracts[0]!.daysLeft--; view.render(s);
  assert.equal(root.querySelector<HappyDetails>(".ops-contract-history")!.hasAttribute("open"), true);
  assert.equal(root.querySelector(".ops-detail h2")!.textContent, s.contracts[0]!.title);
});

test("契約焦點：歷史列 Enter／空白經 controller 選取並重繪後保留同列", t => {
  const { db, world } = loadWorldDirs(["content/base"]);
  const controller = opened(new OpsController({ db, world, seed: 3 }));
  controller.dispatch({ type: "advance", until: "day" }); opened(controller);
  const initial = controller.dispatch({ type: "tab", tab: "contracts" });
  assert.ok(initial.contracts.length >= 2);
  const id = initial.contracts.find(c => !c.selected)!.id;
  // 只固定歷史分組資料；選取與詳情快照仍走真 controller.dispatch。
  const historySnapshot = (s: OpsSnapshot) => {
    s.contracts.find(c => c.id === id)!.status = "expired";
    return s;
  };
  const win = new Window(), root = win.document.createElement("div"); win.document.body.append(root);
  let dispatches = 0;
  const view = mountOps(root as unknown as HTMLElement, { onKey: () => false, onAction: action => {
    dispatches++;
    view.render(historySnapshot(controller.dispatch(action)));
  } });
  t.after(() => { view.destroy(); win.close(); });
  view.render(historySnapshot(initial));
  for (const key of ["Enter", " "]) {
    const details = root.querySelector<HappyDetails>(".ops-contract-history")!;
    details.open = true;
    const before = details.querySelector("li")!;
    before.focus(); assert.ok(win.document.activeElement === before);
    before.dispatchEvent(new win.KeyboardEvent("keydown", { key, bubbles: true }));
    const after = root.querySelector<HappyElement>(".ops-contract-history li")!;
    assert.equal(after.getAttribute("aria-pressed"), "true");
    assert.equal(root.querySelector(".ops-detail h2")!.textContent, initial.contracts.find(c => c.id === id)!.title);
    assert.ok(win.document.activeElement === after, "重繪後焦點應在同一契約列");
    if (key === "Enter") assert.ok(before !== after, "第一次選取必須真的重建契約頁");
  }
  assert.equal(dispatches, 2);
});

test("契約焦點：summary 日期更新、列消失與收合採可見 fallback，外部焦點不搶", t => {
  const s = opsFixture("contracts"), base = s.contracts[0]!;
  s.contracts = [{ ...base, id: "offered", selected: true }, { ...base, id: "history", status: "expired", selected: false }];
  const { root, win, view } = setup(t, s);
  const summary = () => root.querySelector<HappyElement>(".ops-contract-history summary")!;
  const update = () => { s.contracts[0]!.daysLeft--; view.render(s); };
  summary().focus(); update();
  assert.ok(win.document.activeElement === summary(), "日期更新仍停在 summary");
  root.querySelector<HappyDetails>(".ops-contract-history")!.open = true;
  root.querySelector<HappyElement>(".ops-contract-history li")!.focus();
  root.querySelector<HappyDetails>(".ops-contract-history")!.open = false;
  update();
  assert.ok(win.document.activeElement === summary(), "收合後不得聚焦隱藏歷史列");
  root.querySelector<HappyDetails>(".ops-contract-history")!.open = true;
  root.querySelector<HappyElement>(".ops-contract-history li")!.focus();
  s.contracts.pop(); update();
  assert.ok(win.document.activeElement === root.querySelector('.pane-contracts li[aria-pressed="true"]'), "列消失回到可見選取列");
  root.querySelector<HappyElement>(".pane-contracts li")!.focus();
  s.contracts = []; view.render(s);
  assert.ok(win.document.activeElement === root.querySelector(".pane-contracts h2"), "空板回到契約標題");
  const outside = win.document.createElement("button"); root.before(outside); outside.focus();
  s.contracts = [base]; view.render(s);
  assert.ok(win.document.activeElement === outside);
  const outsidePane = root.querySelector("button")!;
  assert.ok(!outsidePane.closest(".pane-contracts"));
  outsidePane.focus(); update();
  assert.ok(win.document.activeElement === outsidePane, "契約頁外的營運按鈕也不搶");
});

test("只建立目前頁內容，隱藏頁首開使用最新快照", t => {
  const first = opsFixture("world");
  const { root, view } = setup(t, first);
  for (const pane of root.querySelectorAll(".ops-pane:not(.pane-world)")) assert.equal(pane.childNodes.length, 0);
  const next = opsFixture("ship"); next.room.title = "更新後的艦橋";
  view.render(next);
  assert.equal(root.querySelector(".pane-ship h2")?.textContent, "更新後的艦橋");
  assert.equal(root.querySelector(".pane-contracts")?.childNodes.length, 0);
  view.render(opsFixture("contracts"));
  assert.ok(root.querySelector(".pane-contracts h2"));
});

test("按鈕標 kbd 與 tooltip；disabled 按鈕 tooltip 末行寫 reason", t => {
  const { q, win, root } = setup(t);
  const go = q('button[data-action-id="go:hangar"]')!;
  assert.equal(go.querySelector("kbd")!.textContent, "2");
  assert.match(go.getAttribute("data-tip")!, /快捷鍵：2/);
  const dock = q('button[data-action-id="room:dock"]') as HTMLButtonElement;
  assert.equal(dock.disabled, true);
  assert.equal(dock.getAttribute("data-tip")!.split("\n").at(-1), "已經停泊");
  dock.parentElement!.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }) as unknown as Event);
  const tip = root.querySelector('[data-ui="tooltip"]')!;
  assert.equal(tip.hasAttribute("hidden"), false);
  assert.match(tip.textContent!, /已經停泊/);
});

test("點按鈕送出該按鈕的 action；disabled 不送", t => {
  const { click, actions } = setup(t);
  click('button[data-action-id="go:hangar"]');
  click('button[data-action-id="tab:world"]');
  click('button[data-action-id="advance:event"]');
  click('button[data-action-id="room:dock"]');
  assert.deepEqual(actions, [
    { type: "cmd", cmd: { v: "go", room: "hangar" } }, { type: "tab", tab: "world" }, { type: "advance", until: "event" },
  ]);
});

test("世界方格：格數等於 viewport、切圖層改 class、Enter 送 sail", t => {
  const { db, world } = loadWorldDirs(["content/base"]), c = opened(new OpsController({ db, world, seed: 3 }));
  const win = new Window(), root = win.document.createElement("div"); win.document.body.append(root);
  const actions: OpsUiAction[] = [];
  const view = mountOps(root as unknown as HTMLElement, {
    onAction(a) { actions.push(a); view.render(c.dispatch(a)); },
    onKey(k) { const a = c.key(k); if (!a) return false; actions.push(a); view.render(c.dispatch(a)); return true; },
  });
  t.after(() => { view.destroy(); win.close(); });
  const s = c.dispatch({ type: "tab", tab: "world" }); view.render(s);
  assert.equal(root.querySelectorAll(".world-cell").length, s.world.grid!.viewport.w * s.world.grid!.viewport.h);
  assert.equal(root.querySelectorAll(".world-glyph, .world-age, .world-region").length, 0);
  assert.ok([...root.querySelectorAll(".world-cell")].every(cell => !cell.textContent || cell.querySelector(".world-badge")));
  const labels = [...root.querySelectorAll("[data-region-label]")];
  assert.equal(new Set(labels.map(label => label.getAttribute("data-region-label"))).size, labels.length);
  assert.ok(labels.length <= s.world.grid!.regionLabels!.length);
  const first = root.querySelector(".world-cell")!;
  assert.match(first.className, /terrain-/);
  view.render(c.dispatch({ type: "mapLayer", layer: "terrain" }));
  assert.doesNotMatch(first.className, /terrain-/);
  const p = world.require("place", "place/chittagong");
  view.render(c.dispatch({ type: "mapCursor", ...p.at }));
  win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.deepEqual(actions.at(-1), { type: "cmd", cmd: { v: "sail", to: p.id } });
  assert.ok(c.state.ship.path);
});

test("prompt 疊層：選項標鍵、disabled 有 reason、點選送 choose", t => {
  const s = opsFixture();
  s.prompt = promptFixture();
  const { q, click, actions } = setup(t, s);
  assert.ok(q('[data-ui="ops-prompt"]'));
  const one = q('[data-ui="ops-prompt"] button[data-choice="1"]')!;
  assert.equal(one.querySelector("kbd")!.textContent, "1");
  const two = q('button[data-choice="2"]') as HTMLButtonElement;
  assert.equal(two.disabled, true);
  assert.equal(two.getAttribute("data-tip")!.split("\n").at(-1), "現金不足");
  assert.equal(q('input[data-ui="ops-name-input"]'), null);
  click('button[data-choice="1"]');
  click('button[data-choice="2"]');
  assert.deepEqual(actions, [{ type: "cmd", cmd: { v: "choose", choice: 1 } }]);
});

test("naming：輸入框＋送出鈕送 nameSubmit；Enter 也送", t => {
  const s = opsFixture();
  s.prompt = promptFixture(true);
  const { q, click, actions, win, keys } = setup(t, s);
  const input = q('input[data-ui="ops-name-input"]') as HTMLInputElement;
  input.value = "黑潮";
  click('[data-ui="ops-name-submit"]');
  input.value = " 白鴉 ";
  input.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Enter", bubbles: true }) as unknown as Event);
  input.dispatchEvent(new win.KeyboardEvent("keydown", { key: "x", bubbles: true }) as unknown as Event);
  assert.deepEqual(actions, [{ type: "nameSubmit", name: "黑潮" }, { type: "nameSubmit", name: "白鴉" }]);
  assert.deepEqual(keys, [], "輸入框打字不送快捷鍵");
});

test("鍵盤：交給 onKey；setActive(false) 時不收且隱藏；select 焦點只放 Esc", t => {
  const { win, view, keys, q } = setup(t);
  const doc = win.document;
  doc.dispatchEvent(new win.KeyboardEvent("keydown", { key: "F2" }));
  view.setActive(false);
  assert.equal(q('[data-ui="ops"]')!.hasAttribute("hidden"), true);
  doc.dispatchEvent(new win.KeyboardEvent("keydown", { key: "F3" }));
  view.setActive(true);
  const s = opsFixture();
  s.sortie = sortieFixture();
  view.render(s);
  const select = q('select[data-seat="pilot"]')!;
  select.dispatchEvent(new win.KeyboardEvent("keydown", { key: "a", bubbles: true }) as unknown as Event);
  select.dispatchEvent(new win.KeyboardEvent("keydown", { key: "Escape", bubbles: true }) as unknown as Event);
  assert.deepEqual(keys.map(k => k.key), ["F2", "Escape"]);
});

test("快捷安全解析當前snapshot；prompt禁用、釘選不dispatch", t => {
  const { root, view, actions, win } = setup(t);
  const panel = root.querySelector(".command-shortcuts")!;
  const catalog = [...panel.querySelectorAll(".shortcut-section")].find(s => s.querySelector("h3")?.textContent === "可釘選操作")!;
  const row = [...catalog.querySelectorAll(".shortcut-row")].find(r => r.querySelector("button")?.getAttribute("data-shortcut-id") === "tab:world")!;
  row.querySelector(".shortcut-pin")!.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, []);
  const stale = row.querySelector(".shortcut-activate")!;
  const snapshot = opsFixture(); snapshot.prompt = promptFixture(); view.render(snapshot);
  stale.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, []);
  assert.ok([...panel.querySelectorAll<HappyButton>(".shortcut-activate")].every(b => b.disabled));
});


test("通知分類原生選單：送分類 action，空狀態與模態鎖定保留事件", t => {
  const s = opsFixture();
  s.log = [];
  const { q, root, win, view, actions, keys } = setup(t, s);
  const select = q('[data-ui="ops-log-filter"]') as HTMLSelectElement;
  assert.equal(select.getAttribute("aria-label"), "通知分類");
  assert.equal(select.value, "important");
  assert.equal(select.options.length, 6);
  assert.equal(q('[data-ui="ops-log-empty"]')!.textContent, "目前沒有重點通知");
  select.focus();
  for (const key of ["ArrowDown", "Enter", " ", ".", "1"]) {
    const event = new win.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    select.dispatchEvent(event as unknown as Event);
    assert.equal(event.defaultPrevented, false, `原生選單保留 ${key}`);
  }
  assert.deepEqual(keys, []);
  select.value = "money";
  select.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  assert.deepEqual(actions, [{ type: "logFilter", filter: "money" }]);
  s.logFilter = "money"; s.tab = "ledger";
  view.render(s);
  assert.equal(select.value, "money");
  assert.equal(q('[data-ui="ops-log-empty"]')!.textContent, "此分類尚無記錄");
  assert.equal(win.document.activeElement, select, "重繪保留選單節點與焦點");
  s.prompt = promptFixture(); view.render(s);
  const prompt = root.querySelector('[data-ui="ops-prompt"]');
  assert.equal(select.disabled, true);
  select.value = "all";
  select.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  assert.equal(actions.length, 1, "模態底下的控制項不可送操作");
  assert.equal(root.querySelector('[data-ui="ops-prompt"]'), prompt);
  s.prompt = null; s.log = [{ day: 14, text: "薪資結算", kind: "money" }];
  view.render(s);
  assert.equal(select.disabled, false);
  assert.equal(q('[data-ui="ops-log-empty"]')!.hidden, true);
});


test("所在港口：一般停泊沿用原文，失守停泊在待選事件下仍警示遇襲", t => {
  const s = opsFixture(); s.prompt = promptFixture();
  const { q, view } = setup(t, s);
  assert.match(q('[data-ui="ops-header"]')!.textContent!, /嶺口（停泊）/);
  assert.doesNotMatch(q('[data-ui="ops-header"]')!.textContent!, /仍可能遇襲/);
  s.header.unsafeDocked = true;
  view.render(s);
  assert.match(q('[data-ui="ops-header"]')!.textContent!, /嶺口（停泊・失守，仍可能遇襲）/);
  assert.ok(q('[data-ui="ops-prompt"]'));
});
