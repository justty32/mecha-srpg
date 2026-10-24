import test from "node:test";
import assert from "node:assert/strict";
import { readPackDir } from "../../content/loader.ts";
import { loadWorldPacks } from "./load.ts";
import { checkWorld } from "./check.ts";

for (const [field, value, message] of [["kind", "unknown", /unknown actor kind/], ["mp", 0, /mp: must be positive/]] as const) {
  test(`行動者表雙向驗證：${field} 壞值被拒、修正通過`, () => {
    const pack = readPackDir("content/base"), actor = pack.files["world/actors/patrol.json"] as Record<string, unknown>;
    const original = actor[field]; actor[field] = value;
    let loaded = loadWorldPacks([pack]);
    assert.match(checkWorld(loaded.db, loaded.world).errors.join("\n"), message);
    actor[field] = original; loaded = loadWorldPacks([pack]);
    assert.deepEqual(loaded.errors, []);
    assert.deepEqual(checkWorld(loaded.db, loaded.world).errors, []);
    assert.equal(loaded.world.all("actor").length, 5);
  });
}
