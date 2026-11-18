import type { CampaignState, OpsCtx, Loc, OpsCommand, PlaceDef } from "../../../ops/state/types.ts";
import { gridOf, terrainAt, footprintOf, cellKey, cellsWithin, stepCost, type GridMap } from "../../../ops/world/grid.ts";
import { allPlaces, worldRules } from "../../../ops/world/places.ts";
import { shortestPath, availableFuel, shipMover } from "../../../ops/world/move.ts";
import { visibleCells, knownActors } from "../../../ops/world/fog.ts";
import type { MapCell, WorldLayer, WorldMapAction, WorldGridSnapshot, WorldCellView, WorldPathPreview, OpsButton } from "./types.ts";

export const WORLD_LAYERS: WorldLayer[] = ["terrain", "blight", "places", "actors", "path", "region", "fog", "sight", "territory"];

/** 每區最大四連通片取最接近片內平均位置的實際格；不把標籤放在區外的幾何中心。 */
export function regionLabelAnchors(grid: { width: number; height: number; region: Uint16Array; regionKeys: string[] }): { id: string; at: MapCell }[] {
  const visited = new Uint8Array(grid.region.length), largest = new Map<number, number[]>();
  for (let start = 0; start < grid.region.length; start++) {
    const region = grid.region[start]!;
    if (!region || visited[start]) continue;
    const cells = [start]; visited[start] = 1;
    for (let head = 0; head < cells.length; head++) {
      const cell = cells[head]!, x = cell % grid.width, y = Math.floor(cell / grid.width);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx! < 0 || nx! >= grid.width || ny! < 0 || ny! >= grid.height) continue;
        const next = ny! * grid.width + nx!;
        if (!visited[next] && grid.region[next] === region) { visited[next] = 1; cells.push(next); }
      }
    }
    if (cells.length > (largest.get(region)?.length ?? 0)) largest.set(region, cells);
  }
  return [...largest].sort(([a], [b]) => a - b).map(([region, cells]) => {
    const cx = cells.reduce((sum, cell) => sum + cell % grid.width, 0) / cells.length;
    const cy = cells.reduce((sum, cell) => sum + Math.floor(cell / grid.width), 0) / cells.length;
    const score = (cell: number) => (cell % grid.width - cx) ** 2 + (Math.floor(cell / grid.width) - cy) ** 2;
    const anchor = cells.reduce((best, cell) => score(cell) < score(best) || score(cell) === score(best) && cell < best ? cell : best);
    return { id: grid.regionKeys[region]!, at: { x: anchor % grid.width, y: Math.floor(anchor / grid.width) } };
  });
}
const anchorCache = new WeakMap<object, ReturnType<typeof regionLabelAnchors>>();
export type WorldUi = {
  map: string; cursor: MapCell; hover: MapCell | null; viewport: { x: number; y: number; w: number; h: number };
  zoom: 1 | .5 | .25; layers: Record<WorldLayer, boolean>; layerMenu: boolean; mapMenu: boolean; showMinimap: boolean; preview: boolean;
};
const clamp = (n: number, max: number) => Math.max(0, Math.min(n, max));
const placeGlyph: Record<string, string> = { city: "■", port: "▲", ruin: "◇", outpost: "●", "rift-site": "✶", "lunar-base": "■", beacon: "△" };
const actorGlyph = { force: "⚑", patrol: "▷", caravan: "◆", swarm: "✳", band: "◇" };
const colors: Record<string, string> = { tidesea: "#233e54", shoal: "#396371", plain: "#4c5941", waste: "#655b45", forest: "#2e5141", ridge: "#706861", cloudwall: "#666d80", sandsea: "#826d46", mire: "#3b625d", ice: "#8d9caa", urban: "#737169", regolith: "#686477", crater: "#494352", lunarridge: "#85818c" };
export function createWorldUi(s: CampaignState): WorldUi {
  return { map: s.ship.pos.map, cursor: { ...s.ship.pos.cell }, hover: null,
    viewport: { x: Math.max(0, s.ship.pos.cell.x - 15), y: Math.max(0, s.ship.pos.cell.y - 10), w: 30, h: 20 },
    zoom: 1, layers: Object.fromEntries(WORLD_LAYERS.map(l => [l, true])) as Record<WorldLayer, boolean>,
    layerMenu: false, mapMenu: false, showMinimap: true, preview: true };
}

/** SPEC-GAP：本線不能改 ops/text，故 map 面板純資料由這個 vm 產生。 */
export class WorldViewModel {
  readonly size: { w: number; h: number };
  readonly viewport: WorldUi["viewport"];
  private readonly grid: GridMap;
  private readonly places: PlaceDef[];
  private readonly placeCells = new Map<string, PlaceDef>();
  private readonly territory = new Map<string, string>();
  private readonly sight = new Set<string>();
  private readonly observed: ReturnType<typeof knownActors>;
  private readonly path = new Set<string>();
  private readonly preview: WorldPathPreview;
  private readonly s: CampaignState;
  private readonly ctx: OpsCtx;
  readonly ui: WorldUi;
  private routeCache = new Map<string, WorldPathPreview>();
  constructor(s: CampaignState, ctx: OpsCtx, ui: WorldUi, previous?: WorldViewModel) {
    this.s = s; this.ctx = ctx; this.ui = ui;
    this.observed = knownActors(s).filter(({ actor }) => actor.pos.map === ui.map);
    this.grid = gridOf(ctx.world, ui.map);
    if (previous?.s === s && previous.grid === this.grid) this.routeCache = previous.routeCache;
    this.size = { w: this.grid.width, h: this.grid.height };
    this.viewport = { w: Math.min(ui.viewport.w, this.size.w), h: Math.min(ui.viewport.h, this.size.h), x: 0, y: 0 };
    this.viewport.x = clamp(ui.viewport.x, this.size.w - this.viewport.w);
    this.viewport.y = clamp(ui.viewport.y, this.size.h - this.viewport.h);
    this.places = allPlaces(s, ctx).filter(p => p.map === ui.map);
    for (const p of this.places) for (const c of footprintOf(p)) {
      this.placeCells.set(cellKey(c), p);
      const owner = s.places[p.id]?.ownerOverride ?? p.owner;
      if (owner) for (const t of cellsWithin(this.grid, c, 2)) this.territory.set(cellKey(t), owner);
    }
    for (const key of visibleCells(s, ctx, ui.map)) this.sight.add(key);
    this.preview = ui.preview ? this.pathPreview({ map: ui.map, region: "", cell: ui.cursor }) : { cells: [], days: 0, fuel: 0, risk: [], reachable: false, note: "已取消預覽" };
    for (const c of this.preview.cells) this.path.add(cellKey(c));
    if (s.ship.pos.map === ui.map) for (const c of s.ship.path?.cells ?? []) this.path.add(cellKey(c));
  }
  get map() { return this.ui.map; }
  get layers() { return this.ui.layers; }
  get cursor() { return this.ui.cursor; }
  get ship() { return this.s.ship.pos.cell; }
  dirty(): Set<string> | "all" { return "all"; }
  private unexplored(c: MapCell): boolean {
    return !!this.grid.dark[c.y * this.size.w + c.x] && !this.s.maps[this.map]?.known[cellKey(c)];
  }
  private unknown(c: MapCell): boolean { return this.ui.layers.fog && this.unexplored(c); }
  private depth(c: MapCell) {
    return this.s.maps[this.map]?.known[cellKey(c)]?.blight?.depth;
  }
  private actors() { return this.observed; }

  cell(x: number, y: number): WorldCellView {
    const c = { x, y }, key = cellKey(c), layers = this.ui.layers, unknown = this.unknown(c);
    const t = terrainAt(this.grid, c), p = this.placeCells.get(key), age = Math.max(0, this.s.clock.day - (this.s.maps[this.map]?.known[key]?.day ?? this.s.clock.day));
    const region = this.grid.regionKeys[this.grid.region[y * this.size.w + x]!] ?? "";
    const regionName = this.ctx.world.all("regions").find(r => r.map === this.map)?.regions[region]?.name ?? region;
    const depth = this.depth(c), owner = this.territory.get(key);
    const actor = this.actors().find(({ actor: a }) => cellKey(a.pos.cell) === key)?.actor;
    const classes = ["world-cell", ...(layers.terrain ? [`terrain-${t.id.split("/").at(-1)}`] : []),
      ...(unknown ? ["fog-unknown"] : []), ...(layers.fog && age ? ["fog-stale"] : []),
      ...(layers.blight && depth && !unknown ? [`blight-${depth}`] : []),
      ...(layers.places && p && !unknown ? ["has-place"] : []), ...(layers.actors && actor && !unknown ? ["has-actor"] : []),
      ...(layers.path && this.path.has(key) && !unknown ? ["world-path"] : []),
      ...(layers.territory && owner && !unknown ? ["territory", `owner-${owner.replace(/[^a-zA-Z0-9-]/g, "-")}`] : []),
      ...(layers.sight && this.sight.has(key) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !this.sight.has(`${x + dx!},${y + dy!}`)) ? ["sight-edge"] : []),
      ...(cellKey(this.cursor) === key ? ["cursor"] : []), ...(this.s.ship.pos.map === this.map && cellKey(this.ship) === key ? ["ship"] : [])];
    const glyph = !unknown && layers.terrain ? t.glyph : "";
    const badge = unknown ? "" : this.s.ship.pos.map === this.map && cellKey(this.ship) === key ? "船" : layers.actors && actor ? actorGlyph[actor.kind] : layers.places && p ? `${placeGlyph[p.kind] ?? "●"}${this.s.places[p.id]?.flags.includes("lost") ? "×" : ""}` : "";
    return { x, y, classes, glyph, badge, age, place: unknown || !layers.places ? null : p?.id ?? null,
      title: unknown ? `${x},${y} 未知` : `${x},${y} ${t.name}${p ? ` · ${p.name}` : ""}`,
      color: unknown ? "#050608" : layers.blight && depth ? ({ shallow: "#78634a", deep: "#784366", core: "#9c344f" })[depth] : layers.terrain ? colors[t.id.split("/").at(-1)!] ?? "#555e61" : "#242b34",
      region: !unknown && layers.region && this.ui.zoom < 1 ? regionName : "" };
  }
  pathPreview(to: Loc | { actor: string }): WorldPathPreview {
    const target = "actor" in to ? this.actors().find(({ actor }) => actor.id === to.actor)?.actor.pos : to;
    if (!target) return { cells: [], days: 0, fuel: 0, risk: [], reachable: false, note: "目標不存在" };
    const p = target.map === this.map && !this.unexplored(target.cell) ? this.placeCells.get(cellKey(target.cell)) : undefined;
    const cacheKey = `${target.map}:${cellKey(target.cell)}:${p?.id ?? ""}`;
    const cached = this.routeCache.get(cacheKey);
    if (cached) return cached;
    const remember = (preview: WorldPathPreview) => {
      if (this.routeCache.size >= 16) this.routeCache.delete(this.routeCache.keys().next().value!);
      this.routeCache.set(cacheKey, preview); return preview;
    };
    const route = shortestPath(this.s, this.ctx, this.s.ship.pos, p?.id ?? target);
    if (!route) return remember({ cells: [], days: 0, fuel: 0, risk: [], reachable: false, note: "沒有可通行航線" });
    let cells = route.legs.filter(l => l.map === this.map).flatMap(l => l.cells);
    let days = route.days, fuel = route.fuel;
    // 實際航向地點在首次進入城域便抵達，並非一路走到地點中心。
    // 只估同圖直航；航道仍沿用既有時刻／票價估算，不另造時刻規則。
    if (route.legs.length === 1 && !route.legs[0]!.lane && this.s.ship.pos.map === this.map) {
      if (p) {
        const footprint = new Set(footprintOf(p).map(cellKey));
        const end = footprint.has(cellKey(this.ship)) ? -1 : cells.findIndex(c => footprint.has(cellKey(c)));
        if (end >= 0) cells = cells.slice(0, end + 1);
        else if (footprint.has(cellKey(this.ship))) cells = [];
      }
      const estimate = estimateDirectTravel(this.s, this.ctx, this.map, cells);
      if (!Number.isFinite(estimate.days) || !Number.isFinite(estimate.fuel)) return remember({ cells: [], days: 0, fuel: 0, risk: [], reachable: false, note: "沒有可通行航線" });
      days = estimate.days; fuel = estimate.fuel;
    }
    const enough = availableFuel(this.s) >= fuel;
    return remember({ cells, days, fuel, risk: cells.map(c => ({ shallow: 1, deep: 2, core: 3 })[this.depth(c) ?? "shallow"] * (this.depth(c) ? 1 : 0)),
      reachable: enough, note: !cells.length && p ? `已在${p.name}` : enough ? "" : `預估燃料不足：缺 ${Math.ceil(fuel - availableFuel(this.s))} 氦` });
  }
  hover(x: number, y: number): { lines: string[] } {
    const c = { x, y }, cell = this.cell(x, y);
    if (this.unknown(c)) return { lines: [`座標：${x},${y}`, "未知區域"] };
    const t = terrainAt(this.grid, c), p = this.placeCells.get(cellKey(c));
    const region = this.grid.regionKeys[this.grid.region[y * this.size.w + x]!] ?? "";
    const regionName = this.ctx.world.all("regions").find(r => r.map === this.map)?.regions[region]?.name ?? region;
    const route = cellKey(c) === cellKey(this.cursor) && this.ui.preview ? this.preview : this.pathPreview({ map: this.map, region: "", cell: c });
    return { lines: [`座標：${x},${y}`, `地形：${t.name}`, `區域：${regionName || "無"}`, `蝕深：${this.depth(c) ?? "無"}`, `地點：${p?.name ?? "無"}`,
      ...this.actors().filter(({ actor }) => cellKey(actor.pos.cell) === cellKey(c)).map(({ actor, day }) => `行動者：${actor.id}（最後所見第 ${day} 天）`),
      route.reachable ? `到此 ${route.days} 天 ${route.fuel} 燃料` : route.note] };
  }
  sail(): Extract<OpsCommand, { v: "sail" }> {
    const p = !this.unexplored(this.cursor) && this.placeCells.get(cellKey(this.cursor));
    return { v: "sail", to: p ? p.id : { ...this.cursor } };
  }
  actions(): OpsButton[] {
    const blocked = this.s.pendingChoices.length ? "先回應事件" : this.s.log.some(e => e.type === "CampaignEnd") ? "戰役已結束" : undefined;
    const button = (id: string, label: string, action: OpsButton["action"], reason?: string): OpsButton => ({ id: `map:${id}`, label, group: "map", action,
      enabled: !(blocked ?? reason), ...((blocked ?? reason) ? { reason: blocked ?? reason } : {}),
      tooltip: [label, ...(id === "sail" ? [`預估航程 ${preview.days} 天／燃料 ${preview.fuel}`, preview.note] : []), blocked ?? reason].filter(Boolean).join("\n") });
    const here = allPlaces(this.s, this.ctx).some(p => p.map === this.s.ship.pos.map && footprintOf(p).some(c => cellKey(c) === cellKey(this.ship)));
    const preview = this.ui.preview ? this.preview : this.pathPreview({ map: this.map, region: "", cell: this.cursor });
    const sailReason = this.map !== this.s.ship.pos.map && typeof this.sail().to !== "string" ? "跨圖航行請選地點" : (preview.reachable || preview.note.startsWith("預估燃料不足：")) ? undefined : preview.note;
    return [button("sail", "航", { type: "cmd", cmd: this.sail() }, sailReason),
      button("dock", "泊", { type: "cmd", cmd: { v: "dock" } }, !here ? "不在地點範圍內" : undefined),
      button("drift", "懸", { type: "cmd", cmd: { v: "drift" } }, this.s.ship.drifting && !this.s.ship.path ? "已經懸停" : undefined),
      button("wait", "等", { type: "cmd", cmd: { v: "wait", days: 1 } }),
      button("maps", "切圖", { type: "mapMaps" }), button("layers", "圖層", { type: "mapLayers" }), button("center", "回船", { type: "mapCenter" })];
  }
  minimap(): { w: number; h: number; classes: string[][]; colors: string[] } {
    // 每個縮圖像素代表最多 4×4 格，避免日結序列化整張地圖。
    const w = Math.ceil(this.size.w / 4), h = Math.ceil(this.size.h / 4), colors: string[] = [], classes: string[][] = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = this.cell(Math.min(this.size.w - 1, x * 4), Math.min(this.size.h - 1, y * 4));
      colors.push(c.color); classes.push(c.classes);
    }
    const mark = (c: MapCell, color: string, cls: string) => {
      if (this.unknown(c)) return;
      const i = Math.floor(c.y / 4) * w + Math.floor(c.x / 4);
      colors[i] = color; classes[i]!.push(cls);
    };
    if (this.layers.places) for (const p of this.places) mark(p.at, "#d5dae2", "has-place");
    if (this.layers.actors) for (const { actor } of this.actors()) mark(actor.pos.cell, "#dc976b", "has-actor");
    if (this.layers.path) for (const c of this.preview.cells) mark(c, "#6ef0da", "world-path");
    if (this.s.ship.pos.map === this.map) mark(this.ship, "#ffe17d", "ship");
    return { w, h, colors, classes };
  }
  private cachedGrid: WorldGridSnapshot | undefined;
  snapshot(reuseGrid = false, actions?: OpsButton[]): WorldGridSnapshot {
    if (reuseGrid && this.cachedGrid) {
      const hover = this.ui.hover ?? this.cursor;
      const old = this.cachedGrid, source = this.ui.viewport;
      const v = { w: Math.min(source.w, this.size.w), h: Math.min(source.h, this.size.h), x: 0, y: 0 };
      v.x = clamp(source.x, this.size.w - v.w); v.y = clamp(source.y, this.size.h - v.h);
      const changed = old.zoom !== this.ui.zoom || v.x !== old.viewport.x || v.y !== old.viewport.y || v.w !== old.viewport.w || v.h !== old.viewport.h;
      const cells = changed ? [] : old.cells;
      if (changed) for (let y = v.y; y < v.y + v.h; y++) for (let x = v.x; x < v.x + v.w; x++) cells.push(this.cell(x, y));
      Object.assign(this.viewport, v);
      return this.cachedGrid = { ...old, viewport: v, cells, zoom: this.ui.zoom,
        layerMenu: this.ui.layerMenu, mapMenu: this.ui.mapMenu, showMinimap: this.ui.showMinimap,
        actions: actions ?? this.actions(), hover: { at: { ...hover }, ...this.hover(hover.x, hover.y) } };
    }
    const cells: WorldCellView[] = [], v = this.viewport;
    for (let y = v.y; y < v.y + v.h; y++) for (let x = v.x; x < v.x + v.w; x++) cells.push(this.cell(x, y));
    const hover = this.ui.hover ?? this.cursor, mini = this.minimap();
    let anchors = anchorCache.get(this.grid);
    if (!anchors) { anchors = regionLabelAnchors(this.grid); anchorCache.set(this.grid, anchors); }
    const names = this.ctx.world.all("regions").find(region => region.map === this.map)?.regions;
    const regionLabels = this.layers.region ? anchors.filter(label => !this.grid.dark[label.at.y * this.size.w + label.at.x]
      || !!this.s.maps[this.map]?.known[cellKey(label.at)]).map(label => ({
      ...label, name: names?.[label.id]?.name ?? label.id, at: { ...label.at },
    })) : [];
    return this.cachedGrid = { map: this.map, name: this.ctx.world.require("map", this.map).name, size: this.size, viewport: v, cells, regionLabels,
      cursor: this.cursor, ship: this.ship, zoom: this.ui.zoom, layers: this.layers, layerMenu: this.ui.layerMenu, mapMenu: this.ui.mapMenu, showMinimap: this.ui.showMinimap,
      maps: this.ctx.world.all("map").map(m => ({ id: m.id, name: m.name })), hover: { at: hover, ...this.hover(hover.x, hover.y) }, preview: this.preview,
      actions: actions ?? this.actions(), minimap: { w: mini.w, h: mini.h, colors: mini.colors } };
  }
}

export function updateWorldUi(s: CampaignState, ctx: OpsCtx, ui: WorldUi, action: WorldMapAction): void {
  const center = (c: MapCell) => { ui.viewport.x = c.x - Math.floor(ui.viewport.w / 2); ui.viewport.y = c.y - Math.floor(ui.viewport.h / 2); };
  switch (action.type) {
    case "mapCursor": ui.cursor = { x: action.x, y: action.y }; ui.hover = null; ui.preview = true; break;
    case "mapHover": ui.hover = { x: action.x, y: action.y }; break;
    case "mapMove": ui.cursor = { x: ui.cursor.x + action.dx, y: ui.cursor.y + action.dy }; ui.hover = null; ui.preview = true; break;
    case "mapScroll": ui.viewport.x += action.dx; ui.viewport.y += action.dy; break;
    case "mapViewport": center(action); break;
    case "mapResize": ui.viewport.w = action.w; ui.viewport.h = action.h; break;
    case "mapZoom": ui.zoom = action.dir === 0 ? 1 : ([.25, .5, 1] as const)[clamp([.25, .5, 1].indexOf(ui.zoom) + action.dir, 2)]!; center(ui.cursor); break;
    case "mapNext": {
      const places = allPlaces(s, ctx).filter(p => p.map === ui.map);
      const index = places.findIndex(p => footprintOf(p).some(c => cellKey(c) === cellKey(ui.cursor)));
      const p = places[(index + action.dir + places.length) % places.length];
      if (p) { ui.cursor = { ...p.at }; ui.hover = null; ui.preview = true; center(ui.cursor); } break;
    }
    case "mapLayer": ui.layers[action.layer] = !ui.layers[action.layer]; break;
    case "mapSwitch": if (ctx.world.get("map", action.map)) { ui.map = action.map; ui.cursor = { ...s.ship.pos.cell }; ui.hover = null; center(ui.cursor); ui.mapMenu = false; } break;
    case "mapCenter": ui.map = s.ship.pos.map; ui.cursor = { ...s.ship.pos.cell }; ui.hover = null; center(ui.cursor); ui.preview = true; break;
    case "mapLayers": ui.layerMenu = !ui.layerMenu; break;
    case "mapMaps": ui.mapMenu = !ui.mapMenu; break;
    case "mapMinimap": ui.showMinimap = !ui.showMinimap; break;
    case "mapCancel": ui.preview = false; ui.layerMenu = false; ui.mapMenu = false; break;
  }
  const grid = gridOf(ctx.world, ui.map);
  ui.cursor.x = clamp(ui.cursor.x, grid.width - 1); ui.cursor.y = clamp(ui.cursor.y, grid.height - 1);
  if (action.type === "mapMove" || action.type === "mapCursor") {
    ui.viewport.x = Math.max(ui.cursor.x - ui.viewport.w + 1, Math.min(ui.cursor.x, ui.viewport.x));
    ui.viewport.y = Math.max(ui.cursor.y - ui.viewport.h + 1, Math.min(ui.cursor.y, ui.viewport.y));
  }
  ui.viewport.w = Math.max(1, Math.min(ui.viewport.w, grid.width)); ui.viewport.h = Math.max(1, Math.min(ui.viewport.h, grid.height));
  ui.viewport.x = clamp(ui.viewport.x, grid.width - ui.viewport.w); ui.viewport.y = clamp(ui.viewport.y, grid.height - ui.viewport.h);
}

/** 依目前已知情報估算；不預演遭遇、不讀取未知蝕塊或推進戰役。 */
export function estimateDirectTravel(s: CampaignState, ctx: OpsCtx, map: string, cells: MapCell[], initialCarry = 0): { days: number; fuel: number } {
  const grid = gridOf(ctx.world, map);
  const mover = shipMover(s, ctx), rules = worldRules(ctx);
  if (!Number.isFinite(mover.mp) || mover.mp <= 0) return { days: Infinity, fuel: Infinity };
  let days = 0, fuel = 0, carry = initialCarry, index = 0, previous = s.ship.pos.cell;
  while (index < cells.length) {
    days++; let mp = mover.mp + carry, moved = false, deep = false;
    while (index < cells.length) {
      const cell = cells[index]!, depth = s.maps[map]?.known[cellKey(cell)]?.blight?.depth;
      const cost = stepCost(grid, mover, previous, cell, (_at, terrain) => depth ? Math.max(terrain, rules.grid.blightCost[depth]) : terrain);
      if (cost === undefined) return { days: Infinity, fuel: Infinity };
      if (cost > mp) break;
      mp -= cost; moved = true; deep ||= depth === "deep" || depth === "core";
      previous = cell; index++;
    }
    if (moved && s.ship.hull.cur > 0) fuel += rules.travel.fuelPerDay * (deep ? 2 : 1);
    carry = mp;
  }
  return { days, fuel };
}


/** 已排定的同圖地點直航；不重尋路，也不改引擎的保守預支／排程。 */
export function remainingPlaceDays(s: CampaignState, ctx: OpsCtx): number | undefined {
  const path = s.ship.path;
  if (!path || path.lane || path.via.length || path.legs.length !== 1 || path.legs[0]!.lane
    || path.legs[0]!.map !== s.ship.pos.map || !("place" in path.to)) return undefined;
  const place = allPlaces(s, ctx).find(p => p.id === ("place" in path.to ? path.to.place : ""));
  if (!place || place.map !== s.ship.pos.map) return undefined;
  const grid = gridOf(ctx.world, place.map), footprint = footprintOf(place);
  if (!footprint.some(c => !grid.dark[c.y * grid.width + c.x] || !!s.maps[place.map]?.known[cellKey(c)])) return undefined;
  const keys = new Set(footprint.map(cellKey));
  if (keys.has(cellKey(s.ship.pos.cell))) return 0;
  const end = path.cells.findIndex(c => keys.has(cellKey(c)));
  if (end < 0) return undefined;
  const estimate = estimateDirectTravel(s, ctx, place.map, path.cells.slice(0, end + 1), s.ship.mpCarry);
  return Number.isFinite(estimate.days) ? estimate.days : undefined;
}
