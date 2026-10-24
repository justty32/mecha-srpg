import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import type { UiAction, KeyInput } from "../vm/types.ts";
import { mountBattle } from "./render.ts";
import { snapshotFixture } from "./fixtures.ts";

function setup(t: TestContext) {
  const win = new Window();
  const root = win.document.createElement("main");
  win.document.body.append(root);
  const actions: UiAction[] = [];
  const keys: KeyInput[] = [];
  const view = mountBattle(root as unknown as HTMLElement, {
    onAction: action => actions.push(action), onKey: key => { keys.push(key); return true; },
  });
  t.after(() => { view.destroy(); win.close(); });
  view.render(snapshotFixture());
  return { win, root, actions, keys };
}

test("點格傳出絕對座標的 clickCell", t => {
  const { root, win, actions } = setup(t);
  root.querySelector('[data-x="12"][data-y="18"] .unit-badge')!
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, [{ type: "clickCell", x: 12, y: 18 }]);
});

test("點指令按鈕傳出對應 action", t => {
  const { root, win, actions } = setup(t);
  root.querySelector('button[data-cmd="end"] kbd')!
    .dispatchEvent(new win.MouseEvent("click", { bubbles: true }));
  assert.deepEqual(actions, [{ type: "endTurn" }]);
});

test("按 e 呼叫 onKey，回 true 時阻止預設行為", t => {
  const { win, keys } = setup(t);
  const event = new win.KeyboardEvent("keydown", { key: "e", bubbles: true, cancelable: true });
  win.document.dispatchEvent(event);
  assert.deepEqual(keys, [{ key: "e", ctrlKey: false, altKey: false, shiftKey: false }]);
  assert.equal(event.defaultPrevented, true);
});

test("input 有焦點時不攔截快捷鍵", t => {
  const { root, win, keys } = setup(t);
  const input = win.document.createElement("input");
  root.append(input);
  input.focus();
  const event = new win.KeyboardEvent("keydown", { key: "e", bubbles: true, cancelable: true });
  input.dispatchEvent(event);
  assert.deepEqual(keys, []);
  assert.equal(event.defaultPrevented, false);
});

test("滾輪傳出 scroll，Shift 改為水平捲動", t => {
  const { root, win, actions } = setup(t);
  const board = root.querySelector('[data-ui="board"]')!;
  const vertical = new win.WheelEvent("wheel", { deltaY: 100, bubbles: true, cancelable: true });
  board.dispatchEvent(vertical);
  // happy-dom 的 WheelEvent 尚未繼承 MouseEvent，明確補上瀏覽器會提供的修飾鍵。
  const horizontal = new win.WheelEvent("wheel", { deltaY: -100, bubbles: true, cancelable: true });
  Object.defineProperty(horizontal, "shiftKey", { value: true });
  board.dispatchEvent(horizontal);
  assert.deepEqual(actions, [{ type: "scroll", dx: 0, dy: 3 }, { type: "scroll", dx: -3, dy: 0 }]);
  assert.equal(vertical.defaultPrevented, true);
});
