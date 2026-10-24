import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { Window } from "happy-dom";
import { mountShell } from "./shell.ts";
import { mountBattle } from "./render.ts";
import { snapshotFixture } from "./fixtures.ts";
import type { AppRoute } from "../vm/wiki/types.ts";

function setup(t: TestContext, hash = "#/battle") {
  const win = new Window({ url: `http://localhost/?seed=17&anim=off${hash}` });
  const root = win.document.createElement("div");
  win.document.body.append(root);
  const routes: AppRoute[] = [];
  const shell = mountShell(root as unknown as HTMLElement, { onRoute: route => routes.push(route), getWiki: () => null });
  t.after(() => { shell.destroy(); win.close(); });
  return { win, root, shell, routes };
}

test("shell：三個導航與頁面，route 切換 hidden 與 aria-current", t => {
  const { win, root, shell, routes } = setup(t);
  assert.equal(root.querySelectorAll('[data-ui="app-nav"] a[data-nav]').length, 3);
  assert.equal(root.querySelectorAll("[data-page]").length, 3);
  for (const page of ["wiki", "ops", "battle"] as const) {
    shell.navigate(`#/${page}`, true);
    assert.equal(routes.at(-1)?.page, page);
    const visible = [...root.querySelectorAll("[data-page]")].filter(el => !el.hasAttribute("hidden"));
    assert.equal(visible.length, 1);
    assert.equal(visible[0]!.getAttribute("data-page"), page);
    const active = root.querySelectorAll('[aria-current="page"]');
    assert.equal(active.length, 1);
    assert.equal(active[0]!.getAttribute("data-nav"), page);
  }
  assert.equal(win.location.search, "?seed=17&anim=off");
  assert.equal(shell.pages.ops.textContent, "營運畫面尚未開放");
});

test("shell：隱藏戰鬥頁時 mountBattle 不接收快捷鍵", t => {
  const { win, shell } = setup(t);
  let calls = 0;
  const battle = mountBattle(shell.pages.battle, { onAction() {}, onKey: () => { calls++; return true; } });
  t.after(() => battle.destroy());
  battle.render(snapshotFixture());
  win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "e", bubbles: true }));
  assert.equal(calls, 1);
  shell.pages.battle.hidden = true;
  win.document.dispatchEvent(new win.KeyboardEvent("keydown", { key: "e", bubbles: true }));
  assert.equal(calls, 1);
});

test("shell：百科 input 焦點時 t 不導航，F1 回戰鬥", t => {
  const { win, shell, routes } = setup(t, "#/wiki");
  const input = win.document.createElement("input");
  shell.pages.wiki.append(input as unknown as HTMLElement);
  input.focus();
  assert.equal(win.document.activeElement, input);
  const count = routes.length;
  input.dispatchEvent(new win.KeyboardEvent("keydown", { key: "t", bubbles: true, cancelable: true }));
  assert.equal(routes.length, count);
  assert.equal(win.location.hash, "#/wiki");
  input.dispatchEvent(new win.KeyboardEvent("keydown", { key: "F1", bubbles: true, cancelable: true }));
  assert.equal(win.location.hash, "#/battle");
  win.dispatchEvent(new win.HashChangeEvent("hashchange"));
  assert.equal(routes.at(-1)?.page, "battle");
  assert.equal(shell.pages.battle.hidden, false);
});
