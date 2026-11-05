import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import type { AnimMode, UiAction } from "../vm/types.ts";
import { mountBattle } from "./render.ts";
import { snapshotFixture } from "./fixtures.ts";
import { anchorViewport } from "./zoom.ts";

function setup(t: TestContext, anim: AnimMode = "on") {
  const win = new Window();
  const root = win.document.createElement("main");
  win.document.body.append(root);
  const actions: UiAction[] = [];
  const settings: { anim: AnimMode; zoom: number | "auto" }[] = [];
  const view = mountBattle(root as unknown as HTMLElement, {
    onAction: a => actions.push(a), onKey: () => false, anim, onSettings: s => settings.push(s),
  });
  t.after(() => { view.destroy(); win.close(); });
  const snapshot = snapshotFixture();
  view.render(snapshot);
  return { win, root, actions, view, snapshot, settings };
}

test("縮放後錨格留在可視區內並維持相對位置", () => {
  const old = { x: 40, y: 50, w: 30, h: 20 }, at = { x: 60, y: 55 };
  for (const next of [{ w: 24, h: 16 }, { w: 38, h: 25 }]) {
    const origin = anchorViewport(old, next, at, { width: 160, height: 160 });
    assert.ok(at.x >= origin.x && at.x < origin.x + next.w);
    assert.ok(at.y >= origin.y && at.y < origin.y + next.h);
    assert.ok(Math.abs((at.x - old.x + .5) / old.w * next.w - (at.x - origin.x + .5)) <= 1);
    assert.ok(Math.abs((at.y - old.y + .5) / old.h * next.h - (at.y - origin.y + .5)) <= 1);
  }
});

test("Ctrl 滾輪改格大小並回報設定，一般滾輪仍捲動", t => {
  const { root, win, actions, settings } = setup(t);
  const board = root.querySelector('[data-ui="board"]')!;
  const event = new win.WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true });
  Object.defineProperty(event, "ctrlKey", { value: true });
  board.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.deepEqual(actions, []);
  assert.equal(board.getAttribute("style")!.includes("--cell-size: 40px"), true);
  assert.deepEqual(settings, [{ anim: "on", zoom: 40 }]);
  board.dispatchEvent(new win.WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true }));
  assert.deepEqual(actions, [{ type: "scroll", dx: 0, dy: 3 }]);
});

test("confirm 顯示文字，確定與取消分別送 endTurn 與 cancel", t => {
  const { root, win, view, snapshot, actions } = setup(t);
  snapshot.confirm = { action: "endTurn", text: "還有 2 台未行動，確定結束？" };
  view.render(snapshot);
  const panel = root.querySelector('[data-ui="confirm"]')!;
  assert.equal(panel.getAttribute("role"), "alertdialog");
  assert.equal(panel.hasAttribute("hidden"), false);
  assert.match(panel.textContent, /還有 2 台未行動/);
  for (const name of ["confirm-accept", "confirm-cancel"]) panel.querySelector(`[data-ui="${name}"]`)!
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, [{ type: "endTurn" }, { type: "cancel" }]);
  snapshot.confirm = null; view.render(snapshot);
  assert.equal(panel.hasAttribute("hidden"), true);
});

test("fx path 與 float 進疊層，同 id 不重播，epoch 改變與 skip 清空計時器", t => {
  const { root, view, snapshot } = setup(t);
  snapshot.fx.items = [
    { id: 1, group: 0, kind: "path", cells: [snapshot.cursor, { x: 13, y: 18 }] },
    { id: 2, group: 2, kind: "float", at: snapshot.cursor, text: "左臂 −12", tone: "damage" },
  ];
  view.render(snapshot);
  const layer = root.querySelector('[data-ui="fx-layer"]')!;
  const path = layer.querySelector('[data-fx-kind="path"]')!;
  assert.ok(path.querySelector("path[marker-end]"));
  assert.match(layer.querySelector('[data-fx-kind="float"]')!.textContent, /左臂 −12/);
  assert.ok(view.fxBusyMs() > 900);
  view.render(snapshot);
  assert.equal(layer.children.length, 2);
  assert.equal(layer.querySelector('[data-fx-kind="path"]'), path);
  view.skipFx();
  assert.equal(layer.children.length, 0);
  assert.equal(view.fxBusyMs(), 0);
  view.render(snapshot);
  assert.equal(layer.children.length, 0, "跳過後相同 id 不重播");
  snapshot.fx.items.push({ id: 3, group: 0, kind: "float", at: snapshot.cursor, text: "−1", tone: "damage" });
  view.render(snapshot);
  assert.equal(layer.children.length, 1);
  snapshot.fx = { epoch: 1, items: [] };
  view.render(snapshot);
  assert.equal(layer.children.length, 0);
  assert.equal(view.fxBusyMs(), 0);
});

test("格內裝飾在按下與放開間hover重繪，仍只派一個正常格子click", t => {
  const { root, win, view, snapshot, actions } = setup(t);
  snapshot.cells[0]!.feature = { hp: 60, max: 60 }; snapshot.dirty = "all"; view.render(snapshot);
  const cell = root.querySelector('[data-x="12"][data-y="18"]')!;
  cell.dispatchEvent(new win.MouseEvent("mousedown", { bubbles: true }));
  cell.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
  snapshot.dirty = "all"; view.render(snapshot);
  cell.querySelector(".feature-marker")!.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
  cell.dispatchEvent(new win.MouseEvent("mouseup", { bubbles: true }));
  cell.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.equal(actions.filter(action => action.type === "hoverCell").length, 1);
  assert.deepEqual(actions.filter(action => action.type === "clickCell"), [{ type: "clickCell", x: 12, y: 18 }]);
});
