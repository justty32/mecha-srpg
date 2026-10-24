import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { checkWorld, decodeRow, encodeRow, generateMap } from "./worldgen.ts";
import type { GeneratorConfig } from "./worldgen.ts";

const assets = join(import.meta.dirname, "worldgen");
const stage = resolve(import.meta.dirname, "../../../wf/workflows/dispatch/handoffs/lead-grid/stage/world");
const cli = join(import.meta.dirname, "worldgen.ts");

test("RLE 往返：單字元省略數字、空白區域、長列與不合法輸入", () => {
  for (const row of ["~".repeat(250), "~,,..^", "   aaab ", "-oooMM", "#".repeat(37500)]) {
    assert.deepEqual(decodeRow(encodeRow([...row]), [...row].length), [...row]);
  }
  assert.equal(encodeRow(["~", ".", ".", "^"]), "~.2^");
  assert.throws(() => encodeRow(["1"]), /glyph/u);
  for (const row of ["3~", "~0", "~251", "~249", "~9999999999999999999999"]) {
    assert.throws(() => decodeRow(row, 250));
  }
});

test("同設定同種子逐位元相同；交界雜訊不擴散，地點 footprint 不被覆蓋", () => {
  for (const name of ["longland", "lunar"]) {
    const config = JSON.parse(readFileSync(join(assets, `${name}.json`), "utf8")) as GeneratorConfig;
    const terrain = readFileSync(join(assets, config.sketch), "utf8");
    const region = readFileSync(join(assets, config.regionSketch!), "utf8");
    const a = generateMap(config, terrain, region), b = generateMap(config, terrain, region);
    assert.equal(JSON.stringify(a), JSON.stringify(b));
    assert.equal(JSON.stringify(a, null, 2) + "\n", readFileSync(join(stage, "maps", `${name}.json`), "utf8"));
    const original = generateMap({ ...config, noiseRate: 0 }, terrain, region).base.rows.map(row => decodeRow(row, a.width));
    const noisy = a.base.rows.map(row => decodeRow(row, a.width));
    let changed = 0;
    for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
      if (noisy[y]![x] === original[y]![x]) continue;
      changed++;
      assert.ok([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
        .some(([nx, ny]) => original[ny!]?.[nx!] === noisy[y]![x]), "changed cell must take an original neighbor");
    }
    assert.ok(changed > 0);
    for (const site of config.sites) {
      const half = ((site.size ?? 1) - 1) / 2;
      for (let y = site.at.y - half; y <= site.at.y + half; y++) {
        for (let x = site.at.x - half; x <= site.at.x + half; x++) assert.equal(noisy[y]![x], site.glyph);
      }
    }
  }
});

// 現有專案只提供最小 node 宣告；將本測試使用的標準庫簽名留在本線檔案內。
type Spawn = (command: string, args: string[], options: { encoding: "utf8" }) => {
  status: number | null; stdout: string; stderr: string; error?: Error;
};

test("--check 實際 CLI：暫存區通過、壞輸入非零，修回後重新通過", async () => {
  const childModule = "node:child_process", fsModule = "node:fs";
  const { spawnSync } = await import(childModule) as { spawnSync: Spawn };
  const { mkdtempSync } = await import(fsModule) as { mkdtempSync: (prefix: string) => string };
  const root = mkdtempSync("/tmp/cx-grid-maps-test-");
  const run = (world: string) => {
    const result = spawnSync("node", [cli, "--check", world], { encoding: "utf8" });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, null);
    return result;
  };
  const good = run(stage);
  assert.equal(good.status, 0, good.stderr);
  assert.match(good.stdout, /0 errors/u);
  assert.deepEqual(checkWorld(stage), []);

  for (const folder of ["maps", "regions", "wterrains", "places", "lanes"]) mkdirSync(join(root, folder));
  const put = (file: string, value: unknown) => writeFileSync(join(root, file), JSON.stringify(value));
  const config: GeneratorConfig = {
    map: { id: "map/test", name: "測試", oldName: "", width: 8, height: 8, cellKm: 40,
      fog: "charted", darkRects: [{ x: 4, y: 0, w: 4, h: 8 }], riftRate: 1, legend: { ".": "wterrain/plain", "~": "wterrain/tidesea", "A": "wterrain/cloudwall" } },
    sketch: "unused", scale: 4, seed: 1, noiseRate: 0, sites: [],
    regionSketch: "unused", regionLegend: { a: "test" },
  };
  const cleanMap = generateMap(config, "..\n..\n", "aa\naa\n");
  const cleanPlace = { id: "place/test", name: "測試", kind: "city", at: { x: 1, y: 1 }, size: 3, map: "map/test", services: [], tags: [] };
  const cleanLane = { id: "lane/test", a: "place/test", b: "place/test", kind: "orbital" };
  for (const name of ["plain", "tidesea", "cloudwall"]) put(`wterrains/${name}.json`, { id: `wterrain/${name}` });
  put("regions/test.json", { id: "regions/test", map: "map/test", regions: { test: { name: "測試" } } });
  const reset = () => {
    put("maps/test.json", cleanMap); put("places/test.json", cleanPlace); put("lanes/test.json", cleanLane);
  };
  reset();
  assert.equal(run(root).status, 0);
  const mutations: { label: string; mutate: () => void; pattern: RegExp }[] = [
    { label: "列寬", mutate: () => put("maps/test.json", { ...cleanMap, base: { rows: [".7", ...cleanMap.base.rows.slice(1)] } }), pattern: /width/u },
    { label: "列數", mutate: () => put("maps/test.json", { ...cleanMap, base: { rows: cleanMap.base.rows.slice(1) } }), pattern: /row count/u },
    { label: "未知字元", mutate: () => put("maps/test.json", { ...cleanMap, base: { rows: ["x8", ...cleanMap.base.rows.slice(1)] } }), pattern: /unknown layer glyph/u },
    { label: "不存在地形", mutate: () => put("maps/test.json", { ...cleanMap, legend: { ".": "wterrain/missing" } }), pattern: /missing terrain/u },
    { label: "地點越界", mutate: () => put("places/test.json", { ...cleanPlace, at: { x: 8, y: 0 } }), pattern: /outside map/u },
    { label: "footprint 越界", mutate: () => put("places/test.json", { ...cleanPlace, at: { x: 0, y: 0 } }), pattern: /footprint outside/u },
    { label: "潮海", mutate: () => put("maps/test.json", { ...cleanMap, base: { rows: Array(8).fill("~8") } }), pattern: /forbidden terrain/u },
    { label: "雲嶂", mutate: () => put("maps/test.json", { ...cleanMap, base: { rows: Array(8).fill("A8") } }), pattern: /forbidden terrain/u },
    { label: "航道端點", mutate: () => put("lanes/test.json", { ...cleanLane, b: "place/missing" }), pattern: /lane endpoint/u },
    { label: "無 charted 地點", mutate: () => put("places/test.json", { ...cleanPlace, at: { x: 5, y: 1 } }), pattern: /charted place/u },
  ];
  for (const { label, mutate, pattern } of mutations) {
    reset(); mutate();
    const bad = run(root);
    assert.equal(bad.status, 1, label);
    assert.match(bad.stderr, pattern, label);
  }
  reset();
  put("places/other.json", { ...cleanPlace, id: "place/other", at: { x: 2, y: 1 } });
  assert.equal(run(root).status, 1);
  assert.ok(checkWorld(root).some(error => /overlap|one-cell gap/u.test(error)));
  // 不刪測試檔：修成不重疊且留一格的 footprint，再驗綠燈。
  put("places/other.json", { ...cleanPlace, id: "place/other", at: { x: 5, y: 5 } });
  const repaired = run(root);
  assert.equal(repaired.status, 0, repaired.stderr);
});
