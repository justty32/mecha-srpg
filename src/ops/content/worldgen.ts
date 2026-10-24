import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

type Cell = { x: number; y: number };
type Rect = Cell & { w: number; h: number };
type Layer = { rows: string[] };
export type WorldMap = {
  id: string; name: string; oldName: string; width: number; height: number; cellKm: number;
  fog: "charted" | "dark"; darkRects: Rect[]; riftRate: number;
  legend: Record<string, string>; base: Layer;
  region?: Layer & { legend: Record<string, string> };
};
export type GeneratorConfig = {
  map: Omit<WorldMap, "base" | "region">;
  sketch: string; scale: number; seed: number; noiseRate: number;
  regionSketch?: string; regionLegend?: Record<string, string>;
  // 地點的地表先畫入，再鎖定整個 footprint，交界擾動不能覆蓋它。
  sites: { at: Cell; size?: number; glyph: string }[];
};
type Place = { id: string; map: string; at: Cell; kind: string; size?: number; footprint?: Cell[] };
type JsonObject = Record<string, unknown>;

function requireThat(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(message);
}

function validGlyph(glyph: string): boolean {
  return [...glyph].length === 1 && !/[0-9\r\n]/u.test(glyph);
}

export function encodeRow(cells: readonly string[]): string {
  let result = "";
  for (let start = 0; start < cells.length;) {
    const glyph = cells[start]!;
    requireThat(validGlyph(glyph), `invalid RLE glyph: ${JSON.stringify(glyph)}`);
    let end = start + 1;
    while (cells[end] === glyph) end++;
    result += glyph + (end - start === 1 ? "" : String(end - start));
    start = end;
  }
  return result;
}

export function decodeRow(row: string, width: number): string[] {
  requireThat(typeof row === "string", "RLE row must be a string");
  requireThat(Number.isSafeInteger(width) && width > 0, "invalid row width");
  const chars = [...row], cells: string[] = [];
  for (let i = 0; i < chars.length;) {
    const glyph = chars[i++]!;
    requireThat(validGlyph(glyph), `invalid RLE glyph: ${JSON.stringify(glyph)}`);
    let digits = "";
    while (i < chars.length && /^[0-9]$/u.test(chars[i]!)) digits += chars[i++];
    const count = digits ? Number(digits) : 1;
    requireThat(Number.isSafeInteger(count) && count > 0 && cells.length + count <= width, "invalid RLE count/width");
    for (let n = 0; n < count; n++) cells.push(glyph);
  }
  requireThat(cells.length === width, `row width ${cells.length} != ${width}`);
  return cells;
}

// 自帶 Mulberry32；不讀時鐘、不用 Math.random，同種子與遍歷順序位元相同。
function randomSource(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sketchRows(text: string, width: number, height: number, legend: Record<string, string>, blank = false): string[][] {
  const rows = text.replace(/\r\n/gu, "\n").replace(/\n$/u, "").split("\n").map(row => [...row]);
  requireThat(rows.length === height && rows.every(row => row.length === width), `sketch must be ${width}×${height}`);
  requireThat(Object.keys(legend).every(validGlyph), "legend keys must be non-digit single characters");
  for (const row of rows) for (const glyph of row) {
    requireThat(blank && glyph === " " || Object.hasOwn(legend, glyph), `unknown sketch glyph ${JSON.stringify(glyph)}`);
  }
  return rows;
}

export function footprintOf(place: Pick<Place, "at" | "size" | "footprint">): Cell[] {
  if (place.footprint !== undefined) {
    requireThat(Array.isArray(place.footprint) && place.footprint.length > 0, "empty/invalid footprint");
    return place.footprint;
  }
  const size = place.size ?? 1;
  requireThat(Number.isSafeInteger(size) && size > 0 && size % 2 === 1, "size must be a positive odd integer");
  const cells: Cell[] = [], half = (size - 1) / 2;
  for (let y = place.at.y - half; y <= place.at.y + half; y++) {
    for (let x = place.at.x - half; x <= place.at.x + half; x++) cells.push({ x, y });
  }
  return cells;
}

function inBounds(map: { width: number; height: number }, c: Cell): boolean {
  return !!c && Number.isInteger(c.x) && Number.isInteger(c.y) && c.x >= 0 && c.y >= 0 && c.x < map.width && c.y < map.height;
}

export function generateMap(config: GeneratorConfig, terrainText: string, regionText?: string): WorldMap {
  const { map, scale, noiseRate } = config;
  requireThat(Number.isSafeInteger(map.width) && map.width > 0 && Number.isSafeInteger(map.height) && map.height > 0, "invalid dimensions");
  requireThat(Number.isSafeInteger(scale) && scale > 0, "invalid scale");
  requireThat(Number.isSafeInteger(config.seed), "seed must be an integer");
  requireThat(Number.isFinite(noiseRate) && noiseRate >= 0 && noiseRate <= 1, "noiseRate must be in [0,1]");
  const sw = Math.ceil(map.width / scale), sh = Math.ceil(map.height / scale);
  const sketch = sketchRows(terrainText, sw, sh, map.legend);
  const source = Array.from({ length: map.height }, (_, y) =>
    Array.from({ length: map.width }, (_, x) => sketch[Math.floor(y / scale)]![Math.floor(x / scale)]!));
  const locked = new Set<string>();
  for (const site of config.sites) {
    const terrain = map.legend[site.glyph];
    requireThat(terrain && !["wterrain/tidesea", "wterrain/cloudwall"].includes(terrain), "site glyph must be stoppable");
    for (const c of footprintOf(site)) {
      requireThat(inBounds(map, c), "site outside map");
      source[c.y]![c.x] = site.glyph;
      locked.add(`${c.x},${c.y}`);
    }
  }
  const random = randomSource(config.seed);
  const noisy = source.map((row, y) => row.map((glyph, x) => {
    if (locked.has(`${x},${y}`)) return glyph;
    // 只讀放大後的原圖；避免逐格回寫令雜訊向內陸連鎖擴散。
    const boundary = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]
      .filter(([nx, ny]) => inBounds(map, { x: nx!, y: ny! }))
      .map(([nx, ny]) => source[ny!]![nx!]!).filter(other => other !== glyph);
    return boundary.length && random() < noiseRate ? boundary[Math.floor(random() * boundary.length)]! : glyph;
  }));
  const result: WorldMap = { ...structuredClone(map), base: { rows: noisy.map(encodeRow) } };
  if (config.regionSketch !== undefined) {
    requireThat(regionText !== undefined && config.regionLegend !== undefined, "missing region sketch/legend");
    const regions = sketchRows(regionText, sw, sh, config.regionLegend, true);
    result.region = { legend: { ...config.regionLegend }, rows: Array.from({ length: map.height }, (_, y) =>
      encodeRow(Array.from({ length: map.width }, (_, x) => regions[Math.floor(y / scale)]![Math.floor(x / scale)]!))) };
  }
  return result;
}

export function generateFile(configPath: string, out: string): string {
  const config = JSON.parse(readFileSync(configPath, "utf8")) as GeneratorConfig;
  const root = dirname(configPath);
  const map = generateMap(config, readFileSync(resolve(root, config.sketch), "utf8"),
    config.regionSketch ? readFileSync(resolve(root, config.regionSketch), "utf8") : undefined);
  requireThat(/^map\/[a-z0-9-]+$/u.test(map.id), "invalid map id");
  const text = JSON.stringify(map, null, 2) + "\n";
  requireThat(new TextEncoder().encode(text).length <= 40 * 1024, "map exceeds 40 KB gate");
  mkdirSync(out, { recursive: true });
  const file = join(out, map.id.slice(4) + ".json");
  writeFileSync(file, text);
  return file;
}

function object(value: unknown): value is JsonObject {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** 暫存區獨立自驗；不依賴正在遷移的遊戲載入器。 */
export function checkWorld(root: string): string[] {
  const errors: string[] = [];
  function attempt(label: string, fn: () => void): void {
    try { fn(); } catch (error) { errors.push(`${label}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  function readFolder(folder: string, kind: string): JsonObject[] {
    const values: JsonObject[] = [], ids = new Set<string>();
    attempt(folder, () => {
      for (const file of readdirSync(join(root, folder)).filter(file => file.endsWith(".json")).sort()) {
        attempt(`${folder}/${file}`, () => {
          const value: unknown = JSON.parse(readFileSync(join(root, folder, file), "utf8"));
          requireThat(object(value), "expected object");
          requireThat(value.id === `${kind}/${file.slice(0, -5)}`, "id differs from kind/filename");
          requireThat(!ids.has(String(value.id)), "duplicate id");
          ids.add(String(value.id)); values.push(value);
        });
      }
    });
    return values;
  }
  const terrains = readFolder("wterrains", "wterrain"), maps = readFolder("maps", "map");
  const regions = readFolder("regions", "regions"), places = readFolder("places", "place"), lanes = readFolder("lanes", "lane");
  const terrainIds = new Set(terrains.map(t => t.id));
  const decoded = new Map<string, { map: WorldMap; rows: string[][] }>();
  requireNonempty(maps, "maps"); requireNonempty(terrains, "wterrains");
  function requireNonempty(items: unknown[], label: string): void {
    if (!items.length) errors.push(`${label}: no definitions`);
  }
  for (const raw of maps) attempt(String(raw.id), () => {
    const map = raw as unknown as WorldMap;
    requireThat(Number.isSafeInteger(map.width) && map.width > 0 && Number.isSafeInteger(map.height) && map.height > 0, "invalid dimensions");
    requireThat(object(map.legend) && Object.keys(map.legend).length > 0, "missing legend");
    for (const [glyph, terrain] of Object.entries(map.legend)) {
      requireThat(validGlyph(glyph), "invalid legend glyph");
      requireThat(terrainIds.has(terrain), `missing terrain ${terrain}`);
    }
    requireThat(map.fog === "charted" || map.fog === "dark", "invalid fog");
    requireThat(Array.isArray(map.darkRects ?? []), "invalid darkRects");
    for (const rect of map.darkRects ?? []) {
      requireThat(inBounds(map, rect) && Number.isInteger(rect.w) && rect.w > 0 && Number.isInteger(rect.h) && rect.h > 0
        && rect.x + rect.w <= map.width && rect.y + rect.h <= map.height, "invalid dark rectangle");
    }
    const decodeLayer = (layer: Layer, legend: Record<string, string>, blank = false): string[][] => {
      requireThat(layer && Array.isArray(layer.rows) && layer.rows.length === map.height, "wrong row count");
      return layer.rows.map(row => {
        const cells = decodeRow(row, map.width);
        requireThat(cells.every(c => blank && c === " " || Object.hasOwn(legend, c)), "unknown layer glyph");
        return cells;
      });
    };
    const rows = decodeLayer(map.base, map.legend);
    if (map.region) {
      requireThat(object(map.region.legend) && Object.keys(map.region.legend).every(validGlyph), "invalid region legend");
      decodeLayer(map.region, map.region.legend, true);
      const definitions = regions.find(r => r.map === map.id)?.regions;
      requireThat(object(definitions), "missing regions definition");
      for (const key of Object.values(map.region.legend)) requireThat(Object.hasOwn(definitions, key), `missing region ${key}`);
    }
    decoded.set(map.id, { map, rows });
  });
  const occupied = new Map<string, string>();
  const validPlaces = new Set<string>();
  const chartedMaps = new Set<string>();
  for (const raw of places) attempt(String(raw.id), () => {
    const place = raw as unknown as Place, grid = decoded.get(place.map);
    requireThat(grid, "missing/invalid map");
    requireThat(["city", "port", "ruin", "outpost", "rift-site", "lunar-base", "beacon"].includes(place.kind), "invalid place kind");
    requireThat(inBounds(grid.map, place.at), "place outside map");
    const footprint = footprintOf(place);
    requireThat(footprint.some(c => c.x === place.at.x && c.y === place.at.y), "footprint must contain at");
    for (const c of footprint) {
      requireThat(inBounds(grid.map, c), "footprint outside map");
      const terrain = grid.map.legend[grid.rows[c.y]![c.x]!];
      requireThat(terrain !== "wterrain/cloudwall" && (terrain !== "wterrain/tidesea" || place.kind === "port"), "place on forbidden terrain");
      const key = `${place.map}:${c.x},${c.y}`;
      requireThat(!occupied.has(key), `footprint overlap with ${occupied.get(key)}`);
      // 兩個 footprint 之間至少留一格；也查斜角接觸。
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const neighbor = occupied.get(`${place.map}:${c.x + dx},${c.y + dy}`);
        requireThat(!neighbor || neighbor === place.id, `footprints need one-cell gap from ${neighbor}`);
      }
      occupied.set(key, place.id);
    }
    validPlaces.add(place.id);
    if (grid.map.fog === "charted" && !(grid.map.darkRects ?? []).some(r =>
      place.at.x >= r.x && place.at.x < r.x + r.w && place.at.y >= r.y && place.at.y < r.y + r.h)) chartedMaps.add(place.map);
  });
  for (const lane of lanes) attempt(String(lane.id), () => {
    requireThat(typeof lane.a === "string" && validPlaces.has(lane.a), "missing/invalid lane endpoint a");
    requireThat(typeof lane.b === "string" && validPlaces.has(lane.b), "missing/invalid lane endpoint b");
  });
  for (const { map } of decoded.values()) {
    if ((map.fog === "dark" || map.darkRects?.length) && !chartedMaps.has(map.id)) errors.push(`${map.id}: dark map needs a charted place`);
  }
  return errors;
}

export function main(args: string[]): number {
  try {
    if (args.length === 2 && args[0] === "--check") {
      requireThat(existsSync(args[1]!), "world directory does not exist");
      const errors = checkWorld(args[1]!);
      for (const error of errors) console.error(error);
      console.log(`worldgen --check: ${errors.length} errors`);
      return errors.length ? 1 : 0;
    }
    requireThat(args.length === 3 && args[1] === "--out", "usage: worldgen.ts CONFIG --out MAPS | --check WORLD");
    console.log(generateFile(resolve(args[0]!), resolve(args[2]!)));
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (import.meta.main) process.exitCode = main(process.argv.slice(2));
