import { test } from "node:test";
import assert from "node:assert/strict";
import { Window, type HTMLButtonElement as HappyButton } from "happy-dom";
import { snapshotFixture } from "./fixtures.ts";
import { opsFixture, promptFixture } from "../ops/dom/fixtures.ts";
import { createCommandPreferenceStore } from "./command-preferences.ts";
import { battleShortcutCatalog, battleShortcutForAction, mountCommandShortcuts, opsShortcutCatalog, type ShortcutOption } from "./command-shortcuts.ts";

test("戰鬥allowlist核對action、end仍走endTurn；busy/confirm/選部位不能啟用", () => {
  const s = snapshotFixture();
  s.commands = [
    { id: "move", label: "移動", group: "move", tooltip: "", enabled: true, action: { type: "beginMove" } },
    { id: "ability:a", label: "能力", group: "ability", tooltip: "", enabled: true, action: { type: "beginAbility", ability: "a" } },
    { id: "ability:forged", label: "偽造", group: "ability", tooltip: "", enabled: true, action: { type: "eject" } },
    { id: "end", label: "結束", group: "turn", tooltip: "", enabled: true, action: { type: "endTurn" } },
  ];
  assert.deepEqual(battleShortcutCatalog(s).map(c => c.id), ["move", "ability:a", "end"]);
  assert.equal(battleShortcutForAction(s, { type: "abilitySlot", n: 1 }), "ability:a");
  assert.equal(battleShortcutForAction(s, { type: "endTurn" }), "end");
  assert.equal(battleShortcutForAction(s, { type: "eject" }), null);
  s.confirm = { action: "endTurn", text: "確認" }; assert.ok(battleShortcutCatalog(s).every(c => !c.enabled));
  s.confirm = null; s.busy = { kind: "ai", actor: null, name: null }; assert.equal(battleShortcutForAction(s, { type: "beginMove" }), null);
  s.busy = null; s.mode = { kind: "part", ability: "a", abilityName: "a", target: "b", options: [] };
  assert.equal(battleShortcutForAction(s, { type: "abilitySlot", n: 1 }), null);
});
test("營運只取當前分頁導航／安全世界動作，prompt禁用", () => {
  const s = opsFixture("world");
  assert.ok(opsShortcutCatalog(s).every(c => c.action.type !== "cmd"));
  s.prompt = promptFixture();
  assert.ok(opsShortcutCatalog(s).every(c => !c.enabled));
});
test("釘選不執行或記最近；live catalog重解、缺席保留取消、額滿可讀", t => {
  const win = new Window(), root = win.document.createElement("div"); win.document.body.append(root);
  const store = createCommandPreferenceStore("battle", null); const sent: string[] = [];
  let catalog: ShortcutOption[] = [{ id: "move", label: "<img src=x>", enabled: true }];
  const panel = mountCommandShortcuts(root as unknown as HTMLElement, { store, catalog: () => catalog, onActivate: id => sent.push(id) });
  t.after(() => { panel.destroy(); win.close(); });
  root.querySelector<HappyButton>(".shortcut-pin")!.click();
  assert.deepEqual(store.state.favorites, ["move"]); assert.deepEqual(store.state.recent, []); assert.deepEqual(sent, []);
  assert.equal(root.querySelector("img"), null);
  const old = root.querySelector<HappyButton>(".shortcut-activate")!;
  catalog = [{ id: "move", label: "移動", enabled: false, reason: "敵方回合" }]; old.click(); assert.deepEqual(sent, []);
  catalog = []; panel.render(); assert.match(root.textContent!, /目前無此操作/);
  root.querySelector<HappyButton>(".shortcut-pin")!.click(); assert.deepEqual(store.state.favorites, []);
  for (let i = 0; i < 8; i++) store.togglePin(`ability:${i}`);
  catalog = [{ id: "move", label: "移動", enabled: true }]; panel.render();
  const pins = root.querySelectorAll<HappyButton>(".shortcut-pin"); pins[pins.length - 1]!.click();
  assert.match(root.querySelector('[role="status"]')!.textContent!, /已滿 8 項/);
  assert.deepEqual(sent, []);
});
