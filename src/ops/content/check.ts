import { isContentKind, parseId } from "../../core/ids.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import { checkCond, checkNumExpr } from "../../core/numexpr.ts";
import { EVENT_TYPES } from "../state/events.ts";
import { isAccount } from "../state/ledger.ts";
import type { WorldKind } from "../state/types.ts";
import { stage } from "../state/omens.ts";
import type { WorldDB } from "./worlddb.ts";
import { keymapErrors } from "./worlddb.ts";
import { loadWorldDirs, WORLD_KINDS } from "./load.ts";
import { OPS_REF_ROOTS } from "./cond.ts";
import { instantiateMech } from "./instantiate.ts";
import { buildGridMap, cellKey, footprintOf, idx, inBounds, terrainAt } from "../world/grid.ts";
import type { GridMap } from "../world/grid.ts";

export type WorldCheckResult = { errors: string[]; warnings: string[] };
const EFFECT_KEYS = ["spawnActor", "setGoal", "reveal", "startOperation", "opProgress", "transferPlace", "transferShell", "relation", "treaty", "declareWar", "leakModel", "forceLoss","ledger", "rep", "flag", "mood", "techHours", "spawnContract", "spawnEvent", "setPlace", "setRift", "nameMech", "applyEffect", "restraintChoice", "salvage"];
const REQUIRED_ARRAYS: Partial<Record<WorldKind, string[]>> = {
  operation: ["actorScales", "phases", "onSuccess", "onFail", "onAbort"], treaty: ["terms", "onExpire"], lineage: ["tags"], model: ["requires", "tags"], forces: ["shells"], affinity: ["pairs"],
  actor: ["parley"], place: ["services", "tags"], lane: ["hazards", "tags"], rift: ["vanguard"], encounter: ["terrainMix"],
  "faction-ops": ["territory", "contractKinds", "services", "reputationTiers", "tags"], contract: ["issuerKinds", "gradeRange", "objectives", "onComplete", "onFail", "onCancel"],
  action: ["effects"], market: ["lists", "priceMods"], recruit: ["sources"], research: ["requires", "unlocks"], names: ["names", "epithets"],
  event: ["choices"], dialogue: ["topics"], room: ["base", "exits", "phrases"], start: ["mechs", "persons", "flags"], ship: ["rooms"], calendar: ["spring", "neap"], omen: ["effects", "tags"],
};
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }

export function checkWorld(db: ContentDB, world: WorldDB): WorldCheckResult {
  const errors: string[] = [], warnings: string[] = [];
  for (const def of world.all("keymap")) errors.push(...keymapErrors(def));
  const reference = (value: unknown, at: string, expected?: WorldKind | "terrain" | "frame" | "person" | "effect" | "faction" | "component", warning = false) => {
    if (typeof value !== "string") { errors.push(`${at}: missing reference`); return; }
    const p = parseId(value), kind = expected ?? p?.kind;
    // map 同時是戰場與大地圖的 kind；地點／區域的 map 明確查 WorldDB，舊引用仍查 core。
    const found = expected === "map" ? world.get("map", value)
      : kind && isContentKind(kind) ? db.get(kind, value) : kind && WORLD_KINDS.includes(kind as WorldKind) ? world.get(kind as WorldKind, value) : undefined;
    if (!found) (warning ? warnings : errors).push(`${at}: missing reference ${value}`);
  };
  const walk = (value: unknown, at: string, kind: WorldKind, field = "") => {
    if (["text", "name", "title", "base", "lines", "topic", "pattern", "flavor", "names", "epithets", "id"].includes(field)) return;
    if (typeof value === "number" && !Number.isFinite(value)) errors.push(`${at}: non-finite number`);
    if (typeof value === "string") {
      const parsed = parseId(value);
      if (parsed && ["node", "route", "ferry"].includes(parsed.kind)) errors.push(`${at}: obsolete world reference ${value}`);
      if (parsed && (isContentKind(parsed.kind) || WORLD_KINDS.includes(parsed.kind as WorldKind))) reference(value, at,
        (kind === "place" || kind === "regions") && field === "map" ? "map" : undefined, kind === "faction-ops" && field === "faction");
      if (["account", "counter"].includes(field) && !isAccount(value)) errors.push(`${at}: invalid account ${value}`);
    } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${at}[${i}]`, kind));
    else if (object(value)) {
      if ("ledger" in value && (!object(value.ledger) || !isAccount(value.ledger.account))) errors.push(`${at}.ledger.account: invalid account`);
      if ("counter" in value && !isAccount(value.counter)) errors.push(`${at}.counter: invalid account`);
      const numericRef = "ref" in value && !["account", "reason", "kind"].some(key => key in value);
      if (numericRef) {
        if (typeof value.ref !== "string" || !(OPS_REF_ROOTS as readonly string[]).includes(value.ref.split(".")[0]!)) errors.push(`${at}.ref: invalid ops ref root`);
      }
      if (["materials", "consumes", "stocks"].includes(field)) for (const key of Object.keys(value)) if (!isAccount(key)) errors.push(`${at}: invalid account ${key}`);
      if (["effects", "onComplete", "onFail", "onCancel", "onSuccess", "onAbort", "terms", "onExpire"].some(key => at.includes(`.${key}[`)) && at.endsWith("]") && !(kind === "omen" && /^[^.]*\.effects\[\d+\]$/.test(at))) {
        if (EFFECT_KEYS.filter(key => key in value).length !== 1) errors.push(`${at}: unknown OpsEffect`);
      }
      // core 的結構檢查器限定戰鬥 ref 根；營運根另由 cond.ts 登記，這裡仍驗 NumExpr/Cond 形狀。
      if (numericRef || "sum" in value || "product" in value || "pick" in value) {
        errors.push(...checkNumExpr(value, at).filter(e => !e.endsWith("必須是字串且根屬於 REF_ROOTS")));
      }
      if (["when", "valid", "requires", "cond", "growOn", "shrinkOn", "breakIf"].includes(field) && !(kind === "treaty" && field === "requires")) {
        errors.push(...checkCond(value, at).filter(e => !e.endsWith("必須是字串且根屬於 REF_ROOTS")));
      }
      for (const [key, item] of Object.entries(value)) {
        if (parseId(key)) reference(key, `${at}.${key}`);
        walk(item, `${at}.${key}`, kind, key);
      }
    }
  };
  for (const kind of WORLD_KINDS) for (const def of world.all(kind)) {
    const raw = def as unknown as Record<string, unknown>;
    if (["start", "market", "recruit"].includes(kind)) {
      reference(raw.place, `${def.id}.place`, "place");
      if ("node" in raw) errors.push(`${def.id}.node: obsolete key; use place`);
    }
    for (const key of REQUIRED_ARRAYS[kind] ?? []) if (!Array.isArray(raw[key])) errors.push(`${def.id}.${key}: expected array`);
    walk(def, def.id, kind);
  }
  for (const actor of world.all("actor")) {
    const at = actor.id;
    if (!["force", "patrol", "caravan", "swarm", "band"].includes(actor.kind)) errors.push(`${at}.kind: unknown actor kind`);
    if (!Number.isFinite(actor.mp) || actor.mp <= 0) errors.push(`${at}.mp: must be positive`);
    if (!["air", "ground"].includes(actor.layer)) errors.push(`${at}.layer: unknown layer`);
    if (!Number.isInteger(actor.contact) || actor.contact < 0) errors.push(`${at}.contact: must be nonnegative integer`);
    if (!Array.isArray(actor.str) || actor.str.length !== 2 || actor.str.some(n => !Number.isFinite(n) || n <= 0) || actor.str[1] < actor.str[0]) errors.push(`${at}.str: invalid range`);
    if (!object(actor.spawn)) errors.push(`${at}.spawn: expected object`);
    if (!object(actor.behavior)) errors.push(`${at}.behavior: expected object`);
    if (!object(actor.aiChoice) || ["evade", "pursue", "parley", "fight"].some(key => typeof (actor.aiChoice as Record<string, number>)[key] !== "number" || (actor.aiChoice as Record<string, number>)[key]! < 0) || Object.values(actor.aiChoice).reduce((n, v) => n + v, 0) <= 0) errors.push(`${at}.aiChoice: invalid weights`);
  }
  const grids = new Map<string, GridMap>();
  for (const def of world.all("map")) {
    for (const [glyph, id] of Object.entries(def.legend ?? {})) reference(id, `${def.id}.legend.${glyph}`, "wterrain");
    try { grids.set(def.id, buildGridMap(def, world.all("wterrain"))); }
    catch (error) { errors.push(`${def.id}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  const occupied = new Map<string, Map<string, string>>(), charted = new Set<string>();
  for (const place of world.all("place")) {
    reference(place.map, `${place.id}.map`, "map");
    const mapDef = world.get("map", place.map), map = mapDef && grids.get(mapDef.id);
    if (!map) continue;
    try {
      const footprint = footprintOf(place);
      for (const cell of [place.at, ...footprint]) {
        if (!inBounds(map, cell)) { errors.push(`${place.id}: cell ${cellKey(cell)} outside map`); continue; }
        const terrain = terrainAt(map, cell), name = parseId(terrain.id)?.name;
        if (terrain.airCost === null && terrain.groundCost === null || name === "cloudwall" || name === "tidesea" && place.kind !== "port") {
          errors.push(`${place.id}: forbidden terrain ${terrain.id} at ${cellKey(cell)}`);
        }
      }
      let cells = occupied.get(map.id);
      if (!cells) { cells = new Map(); occupied.set(map.id, cells); }
      for (const cell of footprint) {
        const key = cellKey(cell), other = cells.get(key);
        if (other && other !== place.id) errors.push(`${place.id}: footprint overlaps ${other} at ${key}`);
        cells.set(key, place.id);
      }
      if (inBounds(map, place.at) && !map.dark[idx(map, place.at)]) charted.add(map.id);
    } catch (error) { errors.push(`${place.id}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  for (const def of world.all("map")) if ((def.fog === "dark" || def.darkRects?.length) && grids.has(def.id) && !charted.has(def.id)) {
    errors.push(`${def.id}: dark map requires a place on a charted cell`);
  }
  for (const lane of world.all("lane")) {
    reference(lane.a, `${lane.id}.a`, "place"); reference(lane.b, `${lane.id}.b`, "place");
    if (!Number.isInteger(lane.days) || lane.days <= 0) errors.push(`${lane.id}.days: must be positive integer`);
  }
  for (const encounter of world.all("encounter")) {
    if (encounter.faction !== undefined) reference(encounter.faction, `${encounter.id}.faction`, "faction");
    for (const [i, unit] of (encounter.units ?? []).entries()) {
      const at = `${encounter.id}.units[${i}]`;
      reference(unit.frame, `${at}.frame`, "frame");
      if (unit.core !== undefined && typeof unit.core !== "boolean") errors.push(`${at}.core: must be boolean`);
      if (unit.crew !== undefined && !["ai", "remote"].includes(unit.crew)) errors.push(`${at}.crew: must be ai or remote`);
      for (const pilot of unit.pilots ?? []) reference(pilot, `${at}.pilots`, "person");
      const frame = db.get("frame", unit.frame), body = frame && db.get("bodyplan", frame.bodyPlan);
      for (const [slotId, id] of Object.entries(unit.components ?? {})) {
        reference(id, `${at}.components.${slotId}`, "component");
        const slot = body?.parts.flatMap(p => p.slots).find(s => s.id === slotId), component = db.get("component", id);
        // core loader 的 loadout 檢查是私有函式；沿用槽存在與型別相符兩條契約。
        if (body && !slot) errors.push(`${at}.components.${slotId}: unknown slot`);
        else if (slot && component && slot.type !== component.slot) errors.push(`${at}.components.${slotId}: incompatible slot type`);
      }
    }
  }
  for (const contract of world.all("contract")) for (const id of contract.encounter ?? []) reference(id, `${contract.id}.encounter`, "encounter");
  for (const contract of world.all("contract")) if (!world.all("faction-ops").some(f => contract.issuerKinds?.includes(f.scale))) errors.push(`${contract.id}.issuerKinds: no matching faction`);
  for (const event of world.all("event")) {
    if (event.next) reference(event.next, `${event.id}.next`, "event");
    for (const choice of event.choices ?? []) if (choice.next) reference(choice.next, `${event.id}.choices.next`, "event");
  }
  for (const ship of world.all("ship")) for (const room of ship.rooms ?? []) reference(room.includes("/") ? room : `room/${room}`, `${ship.id}.rooms`, "room");
  for (const cal of world.all("calendar")) {
    if (!Number.isSafeInteger(cal.daysPerMonth) || cal.daysPerMonth < 1) errors.push(`${cal.id}: invalid calendar period`);
    if ([...(cal.spring ?? []), ...(cal.neap ?? [])].some(n => !Number.isInteger(n) || n < 1 || n > cal.daysPerMonth)) errors.push(`${cal.id}: invalid phase day`);
    if (cal.monthsPerYear !== undefined && (!Number.isSafeInteger(cal.monthsPerYear) || cal.monthsPerYear < 1)) errors.push(`${cal.id}.monthsPerYear: invalid`);
    if (cal.epochMonth !== undefined && (!Number.isSafeInteger(cal.epochMonth) || cal.epochMonth < 0)) errors.push(`${cal.id}.epochMonth: invalid`);
    if (cal.stageWindow !== undefined && (!Number.isSafeInteger(cal.stageWindow) || cal.stageWindow < 0)) errors.push(`${cal.id}.stageWindow: invalid`);
    if ("special" in cal) errors.push(`${cal.id}.special: obsolete, use world/omens/`);
  }
  errors.push(...omenErrors(world));
  const rules = world.get("action", "action/ops-world") as unknown as { rules?: { repGate?: { overrides?: Record<string, unknown> } } } | undefined;
  for (const [id, value] of Object.entries(rules?.rules?.repGate?.overrides ?? {})) {
    reference(id, "action/ops-world.rules.repGate.overrides", "model");
    if (typeof value !== "number" || !Number.isFinite(value) || value < -100 || value > 100) errors.push(`action/ops-world.rules.repGate.overrides.${id}: must be number in -100..100`);
  }
  for (const f of world.all("faction-ops")) {
    if (f.presence !== undefined && !Array.isArray(f.presence)) errors.push(`${f.id}.presence: expected array`);
    else for (const id of f.presence ?? []) reference(id, `${f.id}.presence`, "place");
  }
  for (const model of world.all("model")) {
    reference(model.frame, `${model.id}.frame`, "frame");
    if (db.get("frame", model.frame)?.cls !== "mechanical") errors.push(`${model.id}.frame: must be mechanical`);
    reference(model.lineage, `${model.id}.lineage`, "lineage");
    for (const id of model.requires ?? []) reference(id, `${model.id}.requires`, "model");
  }
  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) { errors.push(`${id}.requires: cycle`); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dep of world.get("model", id)?.requires ?? []) visit(dep);
    visiting.delete(id); visited.add(id);
  };
  for (const m of world.all("model")) visit(m.id);
  const liveFaction = (id: string) => world.all("faction-ops").some(f => (f.id === id || f.faction === id) && !f.lifecycle?.absorbedBy && !db.get("faction", f.faction)?.tags.includes("kaiju"));
  for (const lineage of world.all("lineage")) if (lineage.source !== "generic") {
    reference(lineage.source, `${lineage.id}.source`, "frame");
    if (db.get("frame", lineage.source)?.cls !== "ancient") errors.push(`${lineage.id}.source: must be ancient`);
    if (!lineage.holder || !liveFaction(lineage.holder)) errors.push(`${lineage.id}.holder: must be live faction`);
  }
  if (world.all("operation").length) for (const f of world.all("faction-ops")) {
    if (db.get("faction", f.faction)?.tags.includes("kaiju") || f.faction.endsWith("/migrant-crew")) continue;
    const pool = world.all("model").filter(m => (m.generic || m.maker === f.faction || m.maker === f.id) && "month" in m.availableFrom && m.availableFrom.month <= 0);
    if (!pool.length) errors.push(`${f.id}: empty opening model pool`);
    const held = world.all("lineage").filter(l => l.source === "generic" || world.all("forces").some(cfg => cfg.shells.some(sh =>
      typeof sh.holder === "string" && (sh.holder === f.id || sh.holder === f.faction) &&
      (l.tags.some(t => t.startsWith("shell:")) ? l.tags.includes(`shell:${sh.id}`) : sh.frame === l.source && world.all("lineage").filter(other => other.source === l.source).length === 1))));
    if (!pool.some(m => m.role !== "captain" && held.some(l => l.id === m.lineage))) errors.push(`${f.id}: no opening model in held lineage`);
    for (const u of f.roster ?? []) if ("model" in u) {
      reference(u.model, `${f.id}.roster`, "model");
      if (!pool.some(m => m.id === u.model)) errors.push(`${f.id}.roster: model unavailable at opening ${u.model}`);
      if (!Number.isInteger(u.count) || u.count < 0) errors.push(`${f.id}.roster: invalid count`);
    }
  }
  for (const cfg of world.all("forces")) for (const shell of cfg.shells ?? []) {
    reference(shell.frame, `${shell.id}.frame`, "frame");
    if (db.get("frame", shell.frame)?.cls !== "ancient") errors.push(`${shell.id}: shell frame must be ancient`);
    if (typeof shell.holder === "object") reference(shell.holder.ruin, `${shell.id}.holder.ruin`, "place");
    else if (shell.holder !== "player" && !liveFaction(shell.holder)) errors.push(`${shell.id}.holder: must be live faction`);
  }
  const templates = new Set(world.all("templates").flatMap(t => Object.keys(t.entries ?? {})));
  for (const market of world.all("market")) for (const list of market.lists ?? []) for (const item of list.filters ?? []) {
    if (item.filter.lineage) reference(item.filter.lineage, `${market.id}.filter.lineage`, "lineage");
    if (item.filter.maker && item.filter.maker !== "generic" && !liveFaction(item.filter.maker)) errors.push(`${market.id}.filter.maker: missing faction`);
    if (!["D", "C", "B", "A", "S", "SS", "SSS"].includes(item.filter.tierMax)) errors.push(`${market.id}.filter.tierMax: invalid grade`);
    if (!["frame", "component"].includes(list.kind)) errors.push(`${market.id}.filter: expected frame or component list`);
  }
  for (const start of world.all("start")) for (const [index, entry] of (start.mechs ?? []).entries()) {
    try {
      if (typeof entry !== "string" && (!object(entry) || typeof entry.frame !== "string"
        || entry.components !== undefined && (!object(entry.components) || Object.values(entry.components).some(id => typeof id !== "string")))) {
        throw new Error("expected frame id or { frame, components? }");
      }
      instantiateMech(db, "check-start", typeof entry === "string" ? entry : entry.frame, typeof entry === "string" ? {} : entry.components);
    } catch (error) { errors.push(`${start.id}.mechs[${index}]: ${error instanceof Error ? error.message : String(error)}`); }
  }
  for (const type of EVENT_TYPES) if (!templates.has(type)) warnings.push(`templates: missing ${type}`);
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

const OMEN_LAYERS = ["moon", "distance", "eclipse", "sky", "season", "scripted"];
const OMEN_EFFECT_KINDS = ["tide", "spawn", "blight", "unitEffect", "ops", "event", "rule", "faction"];
/** 天象週期驗證：窗形狀、排定日、湧現引用、潮級修正要落得到漲潮日（否則永不生效）。 */
export function omenErrors(world: WorldDB): string[] {
  const errors: string[] = [], cals = world.all("calendar");
  for (const def of world.all("omen")) {
    const at = def.id;
    if (!OMEN_LAYERS.includes(def.layer)) errors.push(`${at}.layer: invalid`);
    if (!def.cycle && !def.at?.length && !def.emerge) errors.push(`${at}: needs cycle, at or emerge`);
    for (const effect of def.effects ?? []) if (!OMEN_EFFECT_KINDS.includes(String(effect.kind))) errors.push(`${at}.effects: unknown kind ${String(effect.kind)}`);
    if (def.tideDelta !== undefined && !Number.isInteger(def.tideDelta)) errors.push(`${at}.tideDelta: invalid`);
    if (def.setTide !== undefined && (!Number.isInteger(def.setTide) || def.setTide < 0 || def.setTide > 4)) errors.push(`${at}.setTide: must be 0..4`);
    if (def.emerge) {
      if (!OMEN_LAYERS.includes(def.emerge.layer) || !Number.isSafeInteger(def.emerge.min) || def.emerge.min < 0) errors.push(`${at}.emerge: invalid`);
      for (const id of def.emerge.requires ?? []) if (!world.get("omen", id)) errors.push(`${at}.emerge.requires: missing reference ${id}`);
    }
    for (const cal of cals) {
      if (def.cycle) {
        const { periodMonths, offsetDays, durationDays } = def.cycle, period = periodMonths * cal.daysPerMonth;
        if (!(periodMonths > 0) || !Number.isSafeInteger(period)) errors.push(`${at}.cycle.periodMonths: must give whole days under ${cal.id}`);
        else if (!Number.isSafeInteger(durationDays) || durationDays < 1 || durationDays > period) errors.push(`${at}.cycle.durationDays: must be 1..${period}`);
        if (!Number.isSafeInteger(offsetDays)) errors.push(`${at}.cycle.offsetDays: invalid`);
        else if ((def.tideDelta || def.setTide !== undefined) && Number.isSafeInteger(period) && period > 0 && Number.isSafeInteger(durationDays)) {
          // 潮級修正只在漲潮日生效：窗內至少要有一個漲潮日。
          const epoch = (cal.epochMonth ?? 0) * cal.daysPerMonth;
          const hits = Array.from({ length: Math.min(durationDays, period) }, (_, i) => offsetDays + i).some(d => stage(((d - epoch) % cal.daysPerMonth + cal.daysPerMonth) % cal.daysPerMonth + 1, cal) === "spring");
          if (!hits) errors.push(`${at}.cycle: tide modifier window never covers a spring day (${cal.id})`);
        }
      }
      for (const [i, a] of (def.at ?? []).entries()) if (!Number.isSafeInteger(a.month) || a.month < 0 || !Number.isInteger(a.dom) || a.dom < 1 || a.dom > cal.daysPerMonth) errors.push(`${at}.at[${i}]: invalid month/dom`);
    }
  }
  return errors;
}

if (import.meta.main) {
  const loaded = loadWorldDirs(process.argv.length > 2 ? process.argv.slice(2) : ["content/base"]);
  const checked = checkWorld(loaded.db, loaded.world);
  const errors = [...loaded.errors.map(e => `${e.file} ${e.path} ${e.message}`), ...checked.errors];
  const warnings = [...loaded.warnings.map(e => `${e.file} ${e.path} ${e.message}`), ...checked.warnings];
  for (const kind of WORLD_KINDS) console.log(`${kind}: ${loaded.world.all(kind).length}`);
  warnings.forEach(w => console.log(`WARNING ${w}`)); errors.forEach(e => console.log(`ERROR ${e}`));
  console.log(errors.length ? `FAIL ${errors.length} errors, ${warnings.length} warnings` : `OK 0 errors, ${warnings.length} warnings`);
  if (errors.length) process.exitCode = 1;
}
