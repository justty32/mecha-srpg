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

test("B02／B04／B06：單位卡與格子呈現 VM 提供的中文資料", t => {
  const { root, view, snapshot } = setup(t), unit = snapshot.selected!;
  unit.movementName = "潮行"; unit.frameClassName = "古代機";
  unit.familyName = "菌絲"; unit.ecologyNotes = ["蛻皮：條件成熟時會蛻變成另一形態。", "育幼：會孵育子獸加入戰場。", "預告：具備攻擊前兆；並非當下攻擊意圖。"];
  unit.parts[0]!.functions = ["移動"];
  unit.parts[0]!.components = [{ id: "component/test", slot: "插槽 1", name: "潮行足", functions: ["能力：踏潮"] }];
  snapshot.cells[0]!.travelNote = "地形基礎通行（潮行）：成本 1；實際可達格依移動預覽";
  snapshot.dirty = "all"; view.render(snapshot);
  const panel = root.querySelector('[data-ui="unit"]')!.textContent!;
  assert.match(panel, /古代機 · 潮行/); assert.match(panel, /怪獸家族：菌絲/);
  assert.match(panel, /蛻皮/); assert.match(panel, /育幼/); assert.match(panel, /並非當下攻擊意圖/);
  assert.match(panel, /部位功能：移動/); assert.match(panel, /插槽 1：潮行足 · 能力：踏潮/);
  const cell = root.querySelector('[data-x="12"][data-y="18"]')!;
  assert.match(cell.getAttribute("data-tip")!, /地形基礎通行（潮行）：成本 1/);
});

test("K2：在場棋盤標記與查看卡說明、潮懼光環及灰鈕原因", t => {
  const { root, view, snapshot } = setup(t), unit = snapshot.selected!;
  unit.name = "吉大港的那隻「萬潮葬王」"; unit.status = "在場／不可交戰";
  unit.presenceNote = "在場／不可交戰：迎戰前不能攻擊或捕捉，仍佔據此格。";
  unit.auraNotes = ["光環：滅港潮懼（影響全場敵我作戰單位）"];
  snapshot.inspect.unit = unit;
  const badge = snapshot.cells[0]!.unit!;
  badge.status = "presence"; badge.selectable = false; badge.name = unit.name;
  badge.notice = [unit.presenceNote, ...unit.auraNotes].join("\n");
  snapshot.commands.push({ id: "engagePresence:lord", label: "迎戰萬潮葬王", group: "system",
    tooltip: "確認後迎戰", enabled: false, reason: "此戰場不可主動迎戰", action: { type: "engagePresence", target: "lord" } });
  snapshot.dirty = "all"; view.render(snapshot);
  assert.equal(root.querySelector(".unit-badge.status-presence .presence-marker")!.textContent, "在場");
  assert.match(root.querySelector('[data-ui="inspect"]')!.textContent!, /不可交戰.*不能攻擊或捕捉/);
  assert.match(root.querySelector('[data-ui="inspect"]')!.textContent!, /滅港潮懼.*全場敵我/);
  const button = root.querySelector('[data-cmd="engagePresence:lord"]')!;
  assert.equal(button.hasAttribute("disabled"), true);
  assert.match(button.parentElement!.getAttribute("data-tip")!, /此戰場不可主動迎戰/);
});
