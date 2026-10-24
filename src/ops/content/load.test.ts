import { test } from "node:test";
import assert from "node:assert/strict";
import { readPackDir } from "../../content/loader.ts";
import { loadWorldDirs, loadWorldPacks } from "./load.ts";
import { checkWorld } from "./check.ts";

test("load/check：base world 零錯且 pack 覆寫順序一致", () => {
  const result = loadWorldDirs(["content/base"]);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(checkWorld(result.db, result.world), { errors: [], warnings: [] });
  assert.equal(result.world.all("node").length, 8);
  const original = result.world.require("node", "node/dhaka");
  assert.ok(Object.isFrozen(original));
  const mod = { root: "/tmp/cx-ops-foundation/mod", files: { "pack.json": { id: "mod", version: "1", depends: ["base"] },
    "world/nodes/dhaka.json": { ...original, name: "覆寫達卡" } } };
  const merged = loadWorldPacks([mod, readPackDir("content/base")]);
  assert.deepEqual(merged.errors, []);
  assert.equal(merged.world.require("node", "base:node/dhaka").name, "覆寫達卡");
  assert.equal(original.name, "達卡");
});
test("check：壞路線端點被抓", () => {
  const pack = readPackDir("content/base");
  (pack.files["world/routes/dhaka-delta.json"] as { b: string }).b = "node/missing";
  const { db, world } = loadWorldPacks([pack]);
  assert.match(checkWorld(db, world).errors.join(), /missing reference base:node\/missing/);
});
test("check：事件 next 斷點被抓", () => {
  const pack = readPackDir("content/base");
  (pack.files["world/events/ruin-entry.json"] as { choices: { next?: string }[] }).choices[0]!.next = "event/missing";
  const { db, world } = loadWorldPacks([pack]);
  assert.match(checkWorld(db, world).errors.join(), /missing reference base:event\/missing/);
});
test("check：OpsEffect 非法 account 被抓", () => {
  const pack = readPackDir("content/base");
  (pack.files["world/actions/post-clear.json"] as { effects: unknown[] }).effects = [{ ledger: { account: "gold", delta: 1, reason: "bad" } }];
  const { db, world } = loadWorldPacks([pack]);
  assert.match(checkWorld(db, world).errors.join(), /invalid account gold/);
});
