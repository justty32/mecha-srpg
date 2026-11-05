import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window, type HTMLButtonElement as HappyButton } from "happy-dom";
import { mountOps } from "./render.ts";
import { mountWorldMap, worldMapContentRect } from "./world-map.ts";
import { opsFixture, promptFixture, sortieFixture } from "./fixtures.ts";
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
