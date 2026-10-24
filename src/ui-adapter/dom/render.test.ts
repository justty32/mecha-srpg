import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { mountBattle } from "./render.ts";
import { snapshotFixture } from "./fixtures.ts";

function setup(t: TestContext) {
  const win = new Window();
  const root = win.document.createElement("main");
  win.document.body.append(root);
  const view = mountBattle(root as unknown as HTMLElement, { onAction() {}, onKey: () => false });
  t.after(() => { view.destroy(); win.close(); });
  const snapshot = snapshotFixture();
  view.render(snapshot);
  return { root, win, view, snapshot };
}

test("格數等於 viewport 面積且座標為絕對座標", t => {
  const { root } = setup(t);
  const cells = root.querySelectorAll('[data-ui="board"] > [data-x][data-y]');
  assert.equal(cells.length, 30 * 20);
  assert.equal(cells[0]!.getAttribute("data-x"), "12");
  assert.equal(cells[0]!.getAttribute("data-y"), "18");
  assert.equal(cells[599]!.getAttribute("data-x"), "41");
  assert.equal(cells[599]!.getAttribute("data-y"), "37");
});

test("格子顯示地形色與單位徽章 label、side class", t => {
  const { root } = setup(t);
  const cell = root.querySelector('[data-x="12"][data-y="18"]')! as unknown as HTMLElement;
  assert.equal(cell.style.backgroundColor, "#334455");
  assert.equal(cell.querySelector(".terrain-glyph")!.textContent, "·");
  assert.equal(cell.querySelector(".unit-badge.side-self")!.textContent, "蒼鷹");
  assert.match(cell.title, /平原.*蒼鷹一號/);
});

test("dirty 只更新指定格並重用其他格與子節點", t => {
  const { root, view, snapshot } = setup(t);
  const first = root.querySelector('[data-x="12"][data-y="18"]')!;
  const second = root.querySelector('[data-x="13"][data-y="18"]')!;
  const untouchedGlyph = second.firstChild;
  const oldGlyph = first.firstChild;
  snapshot.cells[0]!.terrain = { ...snapshot.cells[0]!.terrain, glyph: "山" };
  snapshot.cells[1]!.terrain = { ...snapshot.cells[1]!.terrain, glyph: "不應更新" };
  snapshot.dirty = ["12,18"];
  view.render(snapshot);
  assert.equal(root.querySelector('[data-x="12"][data-y="18"]'), first);
  assert.notEqual(first.firstChild, oldGlyph);
  assert.equal(first.querySelector(".terrain-glyph")!.textContent, "山");
  assert.equal(root.querySelector('[data-x="13"][data-y="18"]'), second);
  assert.equal(second.firstChild, untouchedGlyph);
  assert.equal(second.textContent, "·");
});

test("viewport 移動後重用格節點並更新絕對座標", t => {
  const { root, view } = setup(t);
  const first = root.querySelector('[data-ui="board"]')!.firstChild;
  view.render(snapshotFixture(70, 80));
  assert.equal(root.querySelector('[data-ui="board"]')!.firstChild, first);
  assert.equal(root.querySelector('[data-x="70"][data-y="80"]'), first);
  assert.equal(root.querySelector('[data-x="12"][data-y="18"]'), null);
  assert.equal(root.querySelector('[data-ui="viewport-pos"]')!.textContent, "70,80");
});

test("指令顯示 data-cmd、快捷鍵、disabled 與含 reason 的 tooltip", t => {
  const { root, win } = setup(t);
  const move = root.querySelector('button[data-cmd="move"]')!;
  const ability = root.querySelector('button[data-cmd="ability:test:beam"]')!;
  assert.equal(move.querySelector("kbd")!.textContent, "M");
  assert.ok(move.classList.contains("active"));
  assert.equal(move.hasAttribute("disabled"), false);
  assert.equal(ability.hasAttribute("disabled"), true);
  assert.match(ability.getAttribute("title")!, /能源不足/);
  assert.equal(ability.getAttribute("data-tip"), ability.getAttribute("title"));
  ability.dispatchEvent(new win.MouseEvent("mouseover", { bubbles: true }));
  const tooltip = root.querySelector('[data-ui="tooltip"]')!;
  assert.equal(tooltip.hasAttribute("hidden"), false);
  assert.equal(tooltip.textContent, ability.getAttribute("title"));
});

test("單位面板未知 hp 顯示問號", t => {
  const { root } = setup(t);
  const unit = root.querySelector('[data-ui="unit"]')!;
  assert.match(unit.textContent, /core ？ \/ 40/);
  assert.match(unit.textContent, /主駕：林霧.*士氣 穩定/);
});

test("戰鬥記錄行數與 kind 對應快照且新行在下", t => {
  const { root } = setup(t);
  const lines = root.querySelectorAll('[data-ui="log"] li[data-kind]');
  assert.equal(lines.length, 2);
  assert.equal(lines[0]!.getAttribute("data-kind"), "turn");
  assert.equal(lines[1]!.getAttribute("data-kind"), "damage");
  assert.equal(lines[1]!.textContent, "蒼鷹受到傷害");
});

test("結算面板依 outcome 顯示結語", t => {
  const { root, view, snapshot } = setup(t);
  const panel = root.querySelector('[data-ui="outcome"]')!;
  assert.equal(panel.hasAttribute("hidden"), true);
  snapshot.outcome = { winner: "player", reason: "victory", text: "我方勝利" };
  view.render(snapshot);
  assert.equal(panel.hasAttribute("hidden"), false);
  assert.equal(panel.textContent, "我方勝利");
});

test("showHelp 顯示 keyHints 表與 kbd", t => {
  const { root, view, snapshot } = setup(t);
  const help = root.querySelector('[data-ui="help"]')!;
  assert.equal(help.hasAttribute("hidden"), true);
  snapshot.showHelp = true;
  view.render(snapshot);
  assert.equal(help.hasAttribute("hidden"), false);
  assert.equal(help.querySelector("table th")!.textContent, "結束回合");
  assert.equal(help.querySelector("table kbd")!.textContent, "e");
});
