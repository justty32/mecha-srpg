// 整合：真的 controller（content/base）＋真的 DOM（happy-dom），只靠鍵盤事件操作——驗快捷鍵整條線接通。
import { test } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { loadContentDirs } from "../../content/loader.ts";
import { controllerForScenario } from "../vm/index.ts";
import { mountBattle } from "./render.ts";

test("鍵盤快捷鍵經 keymap → controller → DOM：M 顯示可達格、Esc 取消、E 結束回合並寫記錄", () => {
  const { db, errors } = loadContentDirs(["content/base"]);
  assert.equal(errors.length, 0);
  const controller = controllerForScenario(db, "scenario/skirmish-whitegloves", 1, { viewport: { w: 20, h: 20 } });
  const win = new Window();
  const root = win.document.createElement("main");
  win.document.body.append(root);
  const view = mountBattle(root as unknown as HTMLElement, {
    onAction: a => view.render(controller.dispatch(a)),
    onKey: k => { const s = controller.key(k); if (!s) return false; view.render(s); return true; },
  });
  view.render(controller.snapshot());
  const press = (key: string) => {
    const e = new win.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    win.document.dispatchEvent(e);
    return e.defaultPrevented;
  };
  try {
    assert.ok(root.querySelector('button[data-cmd="end"] kbd')?.textContent?.match(/E/i), "結束回合按鈕標 E");
    assert.equal(press("m"), true);
    assert.ok(root.querySelectorAll(".highlight-reach").length > 0, "M 之後有可達格高亮");
    press("Escape");
    assert.equal(root.querySelectorAll(".highlight-reach").length, 0, "Esc 取消移動模式");
    const before = root.querySelectorAll('[data-ui="log"] li').length, actor = controller.snapshot().activeUnit;
    assert.equal(press("e"), true);
    const after = controller.snapshot();
    assert.ok(root.querySelectorAll('[data-ui="log"] li').length > before, "E 之後戰鬥記錄變多");
    assert.ok(after.activeUnit !== actor || after.outcome !== null || after.round > 1, "E 之後換人行動");
    assert.equal(press("F12"), false, "未綁定的鍵不攔");
  } finally { view.destroy(); win.close(); }
});
