import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { mountOps } from "./render.ts";
import { opsFixture, promptFixture, reportFixture, sortieFixture } from "./fixtures.ts";
import { TAB_ORDER } from "./tabs.ts";
import type { OpsKeyInput, OpsSnapshot, OpsUiAction } from "../vm/types.ts";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { OpsController } from "../vm/controller.ts";

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
  assert.match(q('[data-ui="ops-header"]')!.textContent!, /第 1 蝕月 第 15 日.*大潮.*12,400.*30,000.*嶺口/);
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
    mechs: /蒼鷹.*登記號|R-0451/, ledger: /船債.*預付款/, market: /嶺口市集.*燃料/, calendar: /第 1 蝕月.*今天是大潮/,
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
  assert.equal(seat.value, "p1");
  seat.value = "p3";
  seat.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  seat.value = "";
  seat.dispatchEvent(new win.Event("change", { bubbles: true }) as unknown as Event);
  assert.equal((q('button[data-action-id="sortie:command"]') as HTMLButtonElement).disabled, true);
  click('button[data-action-id="sortie:auto"]');
  assert.deepEqual(actions, [
    { type: "sortieToggle", mech: "m1" },
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
