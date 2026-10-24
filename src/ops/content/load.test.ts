import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { readPackDir } from "../../content/loader.ts";
import type { PackFiles } from "../../content/loader.ts";
import type { MapDef, PlaceDef, LaneDef, WTerrainDef } from "../state/types.ts";
import { loadWorldDirs, loadWorldPacks } from "./load.ts";
import { checkWorld } from "./check.ts";

test("load/check：base world 零錯且 pack 覆寫順序一致", () => {
  const result = loadWorldDirs(["content/base"]);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(checkWorld(result.db, result.world), { errors: [], warnings: [] });
  assert.equal(result.world.all("place").length, 10);
  const original = result.world.require("place", "place/dhaka");
  assert.ok(Object.isFrozen(original));
  const mod = { root: "/tmp/cx-ops-foundation/mod", files: { "pack.json": { id: "mod", version: "1", depends: ["base"] },
    "world/places/dhaka.json": { ...original, name: "覆寫達卡" } } };
  const merged = loadWorldPacks([mod, readPackDir("content/base")]);
  assert.deepEqual(merged.errors, []);
  assert.equal(merged.world.require("place", "base:place/dhaka").name, "覆寫達卡");
  assert.equal(original.name, "達卡");
});
test("check：壞航道端點被抓", () => {
  const pack = readPackDir("content/base");
  (pack.files["world/lanes/selene.json"] as { b: string }).b = "place/missing";
  const { db, world } = loadWorldPacks([pack]);
  assert.match(checkWorld(db, world).errors.join(), /missing reference base:place\/missing/);
});
test("check：舊地點鍵與引用拒絕，修回 place 後通過", () => {
  const pack = readPackDir("content/base");
  const start = pack.files["world/campaign-start/default.json"] as Record<string, unknown>;
  const place = start.place; delete start.place; start.node = "node/dhaka";
  let loaded = loadWorldPacks([pack]);
  assert(checkWorld(loaded.db, loaded.world).errors.some(e => e.includes("obsolete")));
  delete start.node; start.place = place; loaded = loadWorldPacks([pack]);
  assert.deepEqual(checkWorld(loaded.db, loaded.world).errors, []);
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

const fixture = "src/ops/world/fixtures/grid40";
const map40 = (pack: PackFiles) => pack.files["world/maps/test40.json"] as MapDef;
const moon = (pack: PackFiles) => pack.files["world/maps/test-moon.json"] as MapDef;
const city = (pack: PackFiles) => pack.files["world/places/city.json"] as PlaceDef;
const brokenCases: { name: string; mutate: (pack: PackFiles) => void; error: RegExp }[] = [
  { name: "base 列長錯", mutate: p => { map40(p).base.rows[0] = ".39"; }, error: /row length/ },
  { name: "base 列數錯", mutate: p => { map40(p).base.rows.pop(); }, error: /base row count/ },
  { name: "base 未知字元", mutate: p => { map40(p).base.rows[0] = "?40"; }, error: /base unknown glyph/ },
  { name: "region 列長錯", mutate: p => { map40(p).region!.rows[0] = "a39"; }, error: /row length/ },
  { name: "region 列數錯", mutate: p => { map40(p).region!.rows.pop(); }, error: /region row count/ },
  { name: "region 未知字元", mutate: p => { map40(p).region!.rows[0] = "?40"; }, error: /region unknown glyph/ },
  { name: "圖例地形不存在", mutate: p => { map40(p).legend["."] = "wterrain/missing"; }, error: /missing (reference|wterrain).*missing/ },
  { name: "地點 at 越界", mutate: p => { city(p).at.x = -1; city(p).footprint = [{ x: 3, y: 3 }]; }, error: /outside map/ },
  { name: "地點 footprint 越界", mutate: p => { city(p).footprint = [{ x: 40, y: 3 }]; }, error: /outside map/ },
  { name: "地點在雲嶂", mutate: p => { city(p).at = { x: 17, y: 9 }; city(p).size = 1; }, error: /forbidden terrain.*cloudwall/ },
  { name: "非港地點在潮海", mutate: p => { city(p).at = { x: 28, y: 3 }; city(p).size = 1; }, error: /forbidden terrain.*tidesea/ },
  { name: "地點 footprint 在雲嶂", mutate: p => { city(p).footprint = [{ x: 17, y: 9 }]; }, error: /forbidden terrain.*cloudwall/ },
  { name: "兩層皆不可進地形", mutate: p => {
    const terrain = p.files["world/wterrains/plain.json"] as WTerrainDef;
    terrain.airCost = null; terrain.groundCost = null;
  }, error: /forbidden terrain.*plain/ },
  { name: "航道 a 不存在", mutate: p => { (p.files["world/lanes/moon.json"] as LaneDef).a = "place/missing"; }, error: /missing reference.*place\/missing/ },
  { name: "航道 b 不存在", mutate: p => { (p.files["world/lanes/moon.json"] as LaneDef).b = "place/missing"; }, error: /missing reference.*place\/missing/ },
  { name: "dark 圖無 charted 登陸點", mutate: p => { moon(p).darkRects = []; }, error: /requires a place on a charted cell/ },
  { name: "矩形暗區涵蓋所有登陸點", mutate: p => {
    moon(p).fog = "charted"; moon(p).darkRects = [{ x: 0, y: 0, w: 12, h: 12 }];
  }, error: /requires a place on a charted cell/ },
  { name: "同圖 footprint 重疊", mutate: p => {
    (p.files["world/places/ruin.json"] as PlaceDef).at = { x: 4, y: 4 };
  }, error: /footprint overlaps/ },
];
for (const example of brokenCases) test(`grid check 雙向：${example.name}`, () => {
  const bad = readPackDir(fixture);
  example.mutate(bad);
  const loaded = loadWorldPacks([bad]);
  assert.deepEqual(loaded.errors, []);
  assert.match(checkWorld(loaded.db, loaded.world).errors.join("\n"), example.error);
  const good = loadWorldDirs([fixture]);
  assert.deepEqual(good.errors, []);
  assert.deepEqual(checkWorld(good.db, good.world).errors, []);
});
test("grid check：港可在潮海、不同圖 footprint 可同座標", () => {
  const pack = readPackDir(fixture);
  (pack.files["world/places/port.json"] as PlaceDef).at = { x: 28, y: 3 };
  (pack.files["world/places/moon.json"] as PlaceDef).at = { ...city(pack).at };
  const loaded = loadWorldPacks([pack]);
  assert.deepEqual(loaded.errors, []);
  assert.deepEqual(checkWorld(loaded.db, loaded.world).errors, []);
});
test("grid check CLI：壞圖 exit 1、修正後 exit 0", async () => {
  // 專案的最小 node 宣告未含這些 API；所需簽名只留本測試，不改共用 shim。
  const fsModule = "node:fs", childModule = "node:child_process";
  const { mkdtempSync, openSync, closeSync } = await import(fsModule) as {
    mkdtempSync(prefix: string): string; openSync(path: string, flags: string): number; closeSync(fd: number): void;
  };
  const { spawnSync } = await import(childModule) as {
    spawnSync(command: string, args: string[], options: { stdio: ["ignore", number, number] }): { status: number | null; error?: Error };
  };
  const pack = readPackDir(fixture), root = mkdtempSync("/tmp/cx-grid-core-check-");
  const goodRows = [...map40(pack).base.rows];
  map40(pack).base.rows[0] = ".39";
  for (const [relative, value] of Object.entries(pack.files)) {
    const file = join(root, relative);
    mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(value));
  }
  const run = () => {
    // 用檔案承接 CLI 輸出，沙箱不允許 child_process 建 pipe。
    const log = join(root, "check.log"), fd = openSync(log, "w");
    try {
      const result = spawnSync("node", ["src/ops/content/check.ts", root], { stdio: ["ignore", fd, fd] });
      assert.equal(result.error, undefined);
      return { status: result.status, output: readFileSync(log, "utf8") };
    } finally { closeSync(fd); }
  };
  const bad = run();
  assert.equal(bad.status, 1, bad.output);
  assert.match(bad.output, /row length/);
  map40(pack).base.rows = goodRows;
  writeFileSync(join(root, "world/maps/test40.json"), JSON.stringify(map40(pack)));
  const good = run();
  assert.equal(good.status, 0, good.output);
  assert.match(good.output, /OK 0 errors/);
});
