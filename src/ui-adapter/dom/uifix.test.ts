import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import type { AnimMode, UiAction } from "../vm/types.ts";
import { mountBattle } from "./render.ts";
import { snapshotFixture } from "./fixtures.ts";
import { anchorViewport, fitCellSize, zoomStep } from "./zoom.ts";

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

test("指令 enabled 切換重用同 id 節點，停用提示包含原因", t => {
  const { root, view, snapshot } = setup(t);
  const before = root.querySelector('[data-ui="commands"] button[data-cmd="move"]')!;
  snapshot.commands[0]!.enabled = false;
  snapshot.commands[0]!.reason = "敵方回合中";
  view.render(snapshot);
  const after = root.querySelector('[data-ui="commands"] button[data-cmd="move"]')!;
  assert.equal(before, after);
  assert.equal(after.hasAttribute("disabled"), true);
  assert.match(after.getAttribute("data-tip")!, /敵方回合中/);
});

test("行動、選取、範圍與殘影使用獨立 class", t => {
  const { root, view, snapshot } = setup(t);
  snapshot.cells[0]!.unit!.stale = true;
  for (const [i, highlight] of (["reach", "range", "target", "path"] as const).entries()) snapshot.cells[i]!.highlight = highlight;
  view.render(snapshot);
  const selected = root.querySelector(".battle-cell.selected")!;
  assert.ok(selected.querySelector(".unit-badge.active.stale"));
  assert.equal(selected.classList.contains("active"), false);
  for (const highlight of ["reach", "range", "target", "path"]) assert.ok(root.querySelector(`.highlight-${highlight}`));
});

test("貼合放大小圖、大圖最低 24；手動每步 1.25 並夾 12–96", () => {
  assert.equal(fitCellSize(1000, 800, 10, 10), 72);
  assert.equal(fitCellSize(600, 400, 10, 10), 40);
  assert.equal(fitCellSize(600, 400, 160, 160), 24);
  assert.equal(zoomStep(32, 1), 40);
  assert.equal(zoomStep(40, -1), 32);
  assert.equal(zoomStep(90, 1), 96);
  assert.equal(zoomStep(12, -1), 12);
});

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

test("動畫設定循環 on→fast→off→on 並更新按鈕與回呼", t => {
  const { root, view, settings } = setup(t);
  for (const label of ["快", "關", "開"]) {
    assert.equal(view.apply({ type: "cycleAnim" }), true);
    assert.match(root.querySelector('[data-ui="anim-toggle"]')!.textContent, new RegExp(`動畫：${label}`));
  }
  assert.deepEqual(settings.map(s => s.anim), ["fast", "off", "on"]);
  assert.equal(view.apply({ type: "endTurn" }), false);
});

test("quickMenu 顯示指令、kbd；null 或格在視野外時隱藏", t => {
  const { root, win, view, snapshot, actions } = setup(t);
  const menu = root.querySelector('[data-ui="quick-menu"]')!;
  assert.equal(menu.hasAttribute("hidden"), true);
  snapshot.quickMenu = { at: snapshot.cursor, options: snapshot.commands };
  view.render(snapshot);
  assert.equal(menu.hasAttribute("hidden"), false);
  const button = menu.querySelector('button[data-cmd="move"]')!;
  assert.equal(button.querySelector("kbd")!.textContent, "M");
  button.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, [{ type: "beginMove" }]);
  snapshot.quickMenu.at = { x: 159, y: 159 };
  view.render(snapshot);
  assert.equal(menu.hasAttribute("hidden"), true);
  snapshot.quickMenu = null;
  view.render(snapshot);
  assert.equal(menu.hasAttribute("hidden"), true);
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

test("part 模式顯示部位選單，數字 2 按鈕送 pickPart", t => {
  const { root, win, view, snapshot, actions } = setup(t);
  snapshot.mode = { kind: "part", ability: "test:beam", abilityName: "光束", target: "test:enemy", options: [
    { n: 1, part: null, label: "不指定", enabled: true },
    { n: 2, part: "arm", label: "左臂 命中 −10", enabled: true },
  ] };
  view.render(snapshot);
  const picker = root.querySelector('[data-ui="part-picker"]')!;
  assert.equal(picker.hasAttribute("hidden"), false);
  const button = picker.querySelector('button[data-part-n="2"]')!;
  assert.equal(button.querySelector("kbd")!.textContent, "2");
  button.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, [{ type: "pickPart", n: 2 }]);
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

test("動畫關閉只畫 path 與 damage／miss float，不畫攻擊與狀態", t => {
  const { root, view, snapshot } = setup(t, "off");
  const at = snapshot.cursor, to = { x: at.x + 1, y: at.y };
  snapshot.fx.items = [
    { id: 1, group: 0, kind: "path", cells: [at, to] },
    { id: 2, group: 1, kind: "attack", from: at, to, hit: true },
    { id: 3, group: 2, kind: "float", at, text: "過熱", tone: "status" },
    { id: 4, group: 2, kind: "float", at, text: "−12", tone: "damage" },
    { id: 5, group: 2, kind: "float", at, text: "未命中", tone: "miss" },
  ];
  view.render(snapshot);
  const layer = root.querySelector('[data-ui="fx-layer"]')!;
  assert.equal(layer.children.length, 3);
  assert.ok(layer.querySelector('.fx-path'));
  assert.ok(layer.querySelector('.tone-damage'));
  assert.ok(layer.querySelector('.tone-miss'));
  assert.equal(layer.querySelector('.fx-attack, .tone-status'), null);
});

test("有 at 的 log 行可點並送 focusLog seq", t => {
  const { root, win, view, snapshot, actions } = setup(t);
  snapshot.log[1]!.at = snapshot.cursor;
  view.render(snapshot);
  const line = root.querySelector('[data-ui="log"] li[data-seq="2"]')!;
  assert.equal(line.getAttribute("role"), "button");
  line.dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, [{ type: "focusLog", seq: 2 }]);
  assert.equal(root.querySelector('[data-ui="log"] li[data-seq="1"]'), null);
});
