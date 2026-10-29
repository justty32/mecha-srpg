import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window, type HTMLButtonElement as HappyButton } from "happy-dom";
import { mountOps } from "./render.ts";
import { mountWorldMap, worldMapContentRect } from "./world-map.ts";
import { opsFixture, promptFixture, reportFixture, sortieFixture } from "./fixtures.ts";
import { TAB_ORDER } from "./tabs.ts";
import type { OpsKeyInput, OpsSnapshot, OpsUiAction } from "../vm/types.ts";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { OpsController } from "../vm/controller.ts";

test("全圖contain留白不屬於世界座標：600×450圖在600×240盒的25%位置為220", () => {
  const rect = worldMapContentRect({ x: 0, y: 0, width: 600, height: 240 }, { w: 600, h: 450 });
  assert.deepEqual(rect, { x: 140, y: 0, width: 320, height: 240 });
  assert.equal(rect.x + rect.width * .25, 220);
  const wide = worldMapContentRect({ x: 10, y: 20, width: 240, height: 600 }, { w: 600, h: 450 });
  assert.deepEqual(wide, { x: 10, y: 230, width: 240, height: 180 });
});

test("全圖真click(220,120)投影為(150,225)，留白不導航", t => {
  const { db, world } = loadWorldDirs(["content/base"]), controller = new OpsController({ db, world, seed: 3 });
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

test("根元素與常駐面板：頂列、分頁、主區、記錄五色", t => {
  const { q, root } = setup(t);
  const shell = q('[data-ui="ops"]')!;
  assert.ok(shell.classList.contains("ops-view"));
  assert.match(q('[data-ui="ops-header"]')!.textContent!, /第 1 蝕月 第 15 日.*漲潮.*12,400.*30,000.*嶺口/);
  assert.equal(root.querySelectorAll('[data-ui="ops-tabs"] button[data-action-id^="tab:"]').length, 8);
  assert.ok(q('[data-ui="ops-header"] button[data-action-id="advance:event"]'));
  assert.match(q('[data-ui="ops-rifts"]')!.textContent!, /沼原/);
  assert.match(q('[data-ui="ops-queue"]')!.textContent!, /修理左臂/);
  const kinds = [...root.querySelectorAll('[data-ui="ops-log"] li')].map(li => li.getAttribute("data-kind"));
  assert.deepEqual(kinds, ["money", "info", "warn", "blood", "soul"]);
});

test("八個分頁各畫出主區，且只顯示當前分頁", t => {
  const { view, root } = setup(t);
  const expect: Record<string, RegExp> = {
    ship: /艦橋.*主螢幕/, world: /嶺口.*服務/, contracts: /清剿：沼原.*犬族/, roster: /林霧.*燼七/,
    mechs: /蒼鷹.*登記號|R-0451/, ledger: /船債.*預付款/, market: /嶺口市集.*燃料/, calendar: /第 1 蝕月.*今天是漲潮/,
  };
  for (const tab of TAB_ORDER) {
    view.render(opsFixture(tab));
    const visible = [...root.querySelectorAll('[data-ui="ops-main"] > [data-tab]')].filter(p => !p.hasAttribute("hidden"));
    assert.equal(visible.length, 1, tab);
    assert.equal(visible[0]!.getAttribute("data-tab"), tab);
    assert.match(visible[0]!.textContent!, expect[tab]!, tab);
  }
  const beast = opsFixture("mechs");
  beast.mechs[0]!.selected = false;
  beast.mechs[1]!.selected = true;
  view.render(beast);
  assert.match(root.querySelector('[data-ui="beast"]')?.textContent ?? "", /磨損 55 \/ 100.*活性 70 \/ 100/);
  view.render(opsFixture("calendar"));
  assert.ok(root.querySelector('.ops-day.phase-spring.today[data-dom="15"]'));
  assert.ok(root.querySelector('.ops-day.phase-neap[data-dom="8"]'));
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
  const { db, world } = loadWorldDirs(["content/base"]), c = new OpsController({ db, world, seed: 3 });
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

test("列表選取：契約、機甲、名冊", t => {
  const { view, click, actions } = setup(t, opsFixture("contracts"));
  click('[data-tab="contracts"] li.ops-pick:not(.selected)');
  view.render(opsFixture("roster"));
  click('tr[data-person="p2"]');
  view.render(opsFixture("mechs"));
  click('[data-tab="mechs"] li.ops-pick:not(.selected)');
  assert.deepEqual(actions, [{ type: "selectContract", contract: "contract-19" }, { type: "selectPerson", person: "p2" }, { type: "selectMech", mech: "m2" }]);
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

test("編成疊層：勾選、座位下拉、錯誤訊息、按鈕", t => {
  const s = opsFixture();
  s.sortie = sortieFixture();
  const { q, root, win, actions, click } = setup(t, s);
  assert.ok(q('[data-ui="ops-sortie"]'));
  assert.match(q('[data-ui="sortie-error"]')!.textContent!, /至少要有一台有駕駛/);
  const disabled = root.querySelector('[data-mech="m2"] input[type="checkbox"]') as unknown as HTMLInputElement;
  assert.equal(disabled.disabled, true);
  const check = root.querySelector('[data-mech="m1"] input[type="checkbox"]') as unknown as HTMLInputElement;
  check.checked = false;
  check.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  const seat = q('select[data-seat="pilot"]') as HTMLSelectElement;
  const ai = q('input[data-ui="sortie-ai"][data-mech="m1"]') as HTMLInputElement;
  assert.equal(ai.type, "checkbox"); assert.equal(ai.disabled, false); assert.equal(ai.tabIndex, 0);
  ai.checked = true; ai.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  assert.equal(seat.value, "p1");
  seat.value = "p3";
  seat.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  seat.value = "";
  seat.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  assert.equal((q('button[data-action-id="sortie:command"]') as HTMLButtonElement).disabled, true);
  click('button[data-action-id="sortie:auto"]');
  assert.deepEqual(actions, [
    { type: "sortieToggle", mech: "m1" },
    { type: "sortieAi", mech: "m1", enabled: true },
    { type: "sortieSeat", mech: "m1", seat: "pilot", person: "p3" },
    { type: "sortieSeat", mech: "m1", seat: "pilot", person: null },
    { type: "sortieLaunch", mode: "auto" },
  ]);
});

test("戰果報告與說明疊層；提示列", t => {
  const s = opsFixture();
  s.report = reportFixture();
  s.message = "燃料不足";
  const { q, view, click, actions } = setup(t, s);
  assert.match(q('[data-ui="ops-report"]')!.textContent!, /我方勝利.*7 輪.*\+14000.*左臂損毀/);
  assert.equal(q('[data-ui="ops-message"]')!.textContent, "燃料不足");
  click('[data-ui="ops-report-dismiss"]');
  const h = opsFixture();
  h.showHelp = true;
  view.render(h);
  assert.equal(q('[data-ui="ops-report"]')?.closest("[hidden]") !== null, true);
  assert.match(q('[data-ui="ops-help"]')!.textContent!, /推進一天.*說明/);
  assert.equal(q('[data-ui="ops-message"]')!.hasAttribute("hidden"), true);
  click('[data-ui="ops-help-toggle"]');
  assert.deepEqual(actions, [{ type: "dismissReport" }, { type: "toggleHelp" }]);
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

test("U01 蝕曆標題與頂列同為顯示月序，來源 month 維持零起算", t => {
  const s = opsFixture("calendar"), { view, q } = setup(t, s);
  for (const month of [0, 2, 40]) {
    s.header.month = month; s.calendar.month = month;
    s.header.dateText = `第 ${month + 1} 蝕月 第 15 日（漲潮）`;
    view.render(s);
    assert.match(q('[data-ui="ops-date"]')!.textContent!, new RegExp(`第 ${month + 1} 蝕月`));
    assert.match(q('[data-tab="calendar"] h2')!.textContent!, new RegExp(`第 ${month + 1} 蝕月`));
    assert.equal(s.calendar.month, month);
  }
});

test("R01 市場常駐聲望門檻、達標數字與購買灰鈕原因", t => {
  const s = opsFixture("market"), item = s.market.items[0]!;
  item.reputation = { faction: "f/test", factionName: "聯合", need: 10, have: 3, blocked: true };
  item.buttons[0] = { ...item.buttons[0]!, enabled: false, reason: "需要聯合聲望 10（目前 3）", tooltip: "需要聯合聲望 10（目前 3）" };
  const { q, view } = setup(t, s);
  assert.match(q('[data-tab="market"]')!.textContent!, /聲望門檻.*聯合聲望 10（目前 3）/);
  const buy = q('[data-action-id="buy:fuel"]') as HTMLButtonElement;
  assert(buy.disabled); assert.match(buy.dataset.tip!, /需要聯合聲望 10（目前 3）/);
  item.reputation.have = 10; item.reputation.blocked = false;
  view.render(s);
  assert.match(q('[data-tab="market"]')!.textContent!, /聯合聲望 10（目前 10）/);
});

test("R03／R04 頂列潮候潮級與天象短標；蝕曆有說明及可導航百科連結", t => {
  const s = opsFixture("calendar");
  s.header.stage = "spring"; s.header.stageName = "漲潮"; s.header.tide = 4; s.header.tideName = "連珠潮";
  const omen = { id: "base:omen/test", name: "連珠", layer: "sky", layerName: "天象", text: "天上諸月排成一直線。", tideEffect: "漲潮日潮級設為 4（連珠潮）", href: "#/wiki/e/base%3Aomen%2Ftest" };
  s.header.omens = [omen]; s.calendar.omens = [omen];
  const today = s.calendar.days.find(d => d.today)!;
  today.tide = 4; today.tideName = "連珠潮";
  const { q, view } = setup(t, s);
  assert.match(q('[data-ui="ops-header"]')!.textContent!, /天象連珠.*潮候漲潮.*潮級4・連珠潮/);
  assert.match(q('[data-ui="calendar-omens"]')!.textContent!, /連珠.*潮級設為 4.*天上諸月/);
  assert.equal(q('[data-ui="calendar-omens"] a')!.getAttribute("href"), omen.href);
  const cell = q('[data-ui="calendar-grid"] [data-dom="15"]')!;
  assert.equal(cell.dataset.stage, "spring"); assert.equal(cell.dataset.tide, "4");
  assert.match(cell.textContent!, /漲潮.*連珠潮（4）/);
  s.header.omens = []; s.calendar.omens = []; view.render(s);
  assert.match(q('[data-ui="ops-header"]')!.textContent!, /天象無/);
  assert.match(q('[data-ui="calendar-omens"]')!.textContent!, /無天象/);
});

test("R02／R05 蝕曆區分漲潮與下一次大潮，含今天與期限內無", t => {
  const s = opsFixture("calendar"), { q, view } = setup(t, s);
  const text = () => q('[data-tab="calendar"]')!.textContent!;
  assert.match(text(), /今天是漲潮日/); assert.match(text(), /下一次大潮：期限內無（未來 800 天）/);
  s.calendar.nextSpringIn = 4;
  s.calendar.nextGreatTide = { day: 70, daysAway: 56, tide: 3, omens: [] }; view.render(s);
  assert.match(text(), /距下次漲潮 4 天/); assert.match(text(), /下一次大潮：第 70 日（距今 56 天）・潮級 3/);
  s.calendar.nextGreatTide.daysAway = 0; view.render(s);
  assert.match(text(), /下一次大潮：今天/);
});

test("K1 艦橋保留王跡原文與最後目擊日，守牆邀請與中文灰鈕原因可見", t => {
  const s = opsFixture();
  const { q, view } = setup(t, s);
  for (const trace of ["吉大港外灘：在。", "第七哨外海：往北。", "北岸哨所：不見了。燈收起來了。這一夜以後，船照常走。誰也沒有再問。 "]) {
    s.room.desc = [`王跡　${trace}（最後目擊第 490 天）`]; view.render(s);
    assert(q('[data-tab="ship"]')!.textContent!.includes(s.room.desc[0]!));
  }
  s.prompt = { text: "守牆邀請", choices: [{ n: 1, text: "留下守牆", enabled: false, reason: "守牆邀請已失效或出戰編成不符" }], naming: null };
  view.render(s);
  assert.match(q('[data-ui="ops-prompt"]')!.textContent!, /守牆邀請/);
  const choice = q('[data-choice="1"]') as HTMLButtonElement;
  assert(choice.disabled); assert.match(choice.dataset.tip!, /守牆邀請已失效或出戰編成不符/);
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
