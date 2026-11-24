import test from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../../../ops/content/load.ts";
import { createOpsCtx } from "../../../ops/content/start.ts";
import { OpsController } from "./controller.ts";
import { buildSnapshot, type ViewState } from "./snapshot.ts";
import { bindButtons, mergedBindings } from "./keymap.ts";
import type { OpsKeyInput } from "./types.ts";
const { db, world } = loadWorldDirs(["content/base"]);
const opts = { db, world, seed: 3, spectate: true };
function prompts(c: OpsController): void {
  for (let i = 0; i < 30; i++) {
    const snapshot = c.snapshot(); if (!snapshot.prompt) return;
    const choice = snapshot.prompt.choices.find(c => c.enabled && c.text === "交涉") ?? snapshot.prompt.choices.find(c => c.enabled);
    assert.ok(choice); c.dispatch({ type: "cmd", cmd: { v: "choose", choice: choice.n } });
  }
  assert.fail("開場事件應可處理完畢");
}
function input(key: string): OpsKeyInput {
  const parts = key.split("+"), last = parts.pop()!;
  return { key: last === "Esc" ? "Escape" : last, altKey: parts.includes("Alt"), ctrlKey: parts.includes("Ctrl"), shiftKey: parts.includes("Shift") };
}

test("契約詳情選取沿用指令驗證，快照與完整建構等價且戰役不變", () => {
  const c = new OpsController(opts); prompts(c);
  c.dispatch({ type: "advance", until: "day" }); prompts(c);
  const before = c.dispatch({ type: "tab", tab: "contracts" }), state = c.state;
  assert.ok(before.contracts.length >= 2);
  const originalClone = globalThis.structuredClone;
  let campaignCopies = 0;
  globalThis.structuredClone = ((value: unknown) => {
    if (value && typeof value === "object" && "rng" in value && "ship" in value && "contracts" in value) campaignCopies++;
    return originalClone(value);
  }) as typeof structuredClone;
  const complete = (contract: string, tab: ViewState["tab"] = "contracts", showHelp = false) => {
    const snapshot = buildSnapshot(state, createOpsCtx(state, db, world), {
      tab, contract, showHelp, node: null, mech: null, person: null, draft: null, battle: null, report: null, message: null,
    });
    bindButtons(snapshot, mergedBindings(world)); return snapshot;
  };
  try {
    for (const contract of [before.contracts[0]!.id, before.contracts[1]!.id, before.contracts[1]!.id]) {
      campaignCopies = 0;
      const selected = c.dispatch({ type: "selectContract", contract });
      assert.equal(campaignCopies, 0, "純選詳情不得試跑真戰役命令");
      assert.deepEqual(selected, complete(contract));
      assert.deepEqual(c.state, state, "包含RNG與事件的戰役狀態不變");
      const generic = selected.roomButtons.find(b => b.id === "sortieOpen")!;
      assert.deepEqual(generic.action, { type: "sortieOpen", contract });
      for (const b of selected.contracts.find(item => item.selected)!.buttons) {
        if (b.enabled && b.key) assert.deepEqual(c.key(input(b.key)), b.action);
      }
      selected.contracts.length = 0;
      assert.equal(c.snapshot().contracts.length, before.contracts.length, "公開副本隔離");
    }
    const contract = before.contracts[0]!.id;
    c.dispatch({ type: "tab", tab: "ship" });
    campaignCopies = 0;
    const ship = c.dispatch({ type: "selectContract", contract });
    assert.ok(campaignCopies > 0, "其它頁維持完整路徑");
    assert.deepEqual(ship, complete(contract, "ship"));
    const sortie = ship.roomButtons.find(b => b.id === "sortieOpen")!;
    if (sortie.enabled && sortie.key) assert.deepEqual(c.key(input(sortie.key)), sortie.action);
    c.dispatch({ type: "tab", tab: "contracts" });
    campaignCopies = 0;
    const missing = c.dispatch({ type: "selectContract", contract: "missing" });
    assert.ok(campaignCopies > 0, "未知ID不走快路徑");
    assert.deepEqual(missing, complete("missing"));
    c.dispatch({ type: "toggleHelp" }); campaignCopies = 0;
    const overlay = c.dispatch({ type: "selectContract", contract });
    assert.ok(campaignCopies > 0, "遮罩中沿用原有完整路徑");
    assert.deepEqual(overlay, complete(contract, "contracts", true));
  } finally { globalThis.structuredClone = originalClone; }
  const pending = new OpsController(opts);
  const rejected = pending.dispatch({ type: "selectContract", contract: before.contracts[0]!.id });
  assert.equal(rejected.message, "先回應事件"); assert.ok(rejected.prompt);
});
