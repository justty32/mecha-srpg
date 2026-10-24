import { isContentKind, parseId } from "../../core/ids.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import { checkCond, checkNumExpr } from "../../core/numexpr.ts";
import { EVENT_TYPES } from "../state/events.ts";
import { isAccount } from "../state/ledger.ts";
import type { WorldKind } from "../state/types.ts";
import type { WorldDB } from "./worlddb.ts";
import { loadWorldDirs, WORLD_KINDS } from "./load.ts";
import { OPS_REF_ROOTS } from "./cond.ts";

export type WorldCheckResult = { errors: string[]; warnings: string[] };
const EFFECT_KEYS = ["ledger", "rep", "flag", "mood", "techHours", "spawnContract", "spawnEvent", "setNode", "setRift", "nameMech", "applyEffect"];
const REQUIRED_ARRAYS: Partial<Record<WorldKind, string[]>> = {
  node: ["services", "terrainPool", "tags"], route: ["hazards", "tags"], rift: ["vanguard"], encounter: ["terrainMix"],
  "faction-ops": ["territory", "contractKinds", "services", "reputationTiers", "tags"], contract: ["issuerKinds", "gradeRange", "objectives", "onComplete", "onFail", "onCancel"],
  action: ["effects"], market: ["lists", "priceMods"], recruit: ["sources"], research: ["requires", "unlocks"], names: ["names", "epithets"],
  event: ["choices"], dialogue: ["topics"], room: ["base", "exits", "phrases"], start: ["mechs", "persons", "flags"], ship: ["rooms"], ferry: ["ports", "departDays", "requires"], calendar: ["spring", "neap", "special"],
};
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }

export function checkWorld(db: ContentDB, world: WorldDB): WorldCheckResult {
  const errors: string[] = [], warnings: string[] = [];
  const reference = (value: unknown, at: string, expected?: WorldKind | "terrain" | "frame" | "person" | "effect", warning = false) => {
    if (typeof value !== "string") { errors.push(`${at}: missing reference`); return; }
    const p = parseId(value), kind = expected ?? p?.kind;
    const found = kind && isContentKind(kind) ? db.get(kind, value) : kind && WORLD_KINDS.includes(kind as WorldKind) ? world.get(kind as WorldKind, value) : undefined;
    if (!found) (warning ? warnings : errors).push(`${at}: missing reference ${value}`);
  };
  const walk = (value: unknown, at: string, kind: WorldKind, field = "") => {
    if (["text", "name", "title", "base", "lines", "topic", "pattern", "flavor", "names", "epithets", "id"].includes(field)) return;
    if (typeof value === "number" && !Number.isFinite(value)) errors.push(`${at}: non-finite number`);
    if (typeof value === "string") {
      const parsed = parseId(value);
      if (parsed && (isContentKind(parsed.kind) || WORLD_KINDS.includes(parsed.kind as WorldKind))) reference(value, at, undefined, kind === "faction-ops" && field === "faction");
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
      if (["effects", "onComplete", "onFail", "onCancel"].some(key => at.includes(`.${key}[`)) && at.endsWith("]")) {
        if (EFFECT_KEYS.filter(key => key in value).length !== 1) errors.push(`${at}: unknown OpsEffect`);
      }
      // core 的結構檢查器限定戰鬥 ref 根；營運根另由 cond.ts 登記，這裡仍驗 NumExpr/Cond 形狀。
      if (numericRef || "sum" in value || "product" in value || "pick" in value) {
        errors.push(...checkNumExpr(value, at).filter(e => !e.endsWith("必須是字串且根屬於 REF_ROOTS")));
      }
      if (["when", "valid", "requires", "cond", "growOn", "shrinkOn"].includes(field)) {
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
    for (const key of REQUIRED_ARRAYS[kind] ?? []) if (!Array.isArray(raw[key])) errors.push(`${def.id}.${key}: expected array`);
    walk(def, def.id, kind);
  }
  for (const route of world.all("route")) { reference(route.a, `${route.id}.a`, "node"); reference(route.b, `${route.id}.b`, "node"); if (!(route.days > 0)) errors.push(`${route.id}.days: must be positive`); }
  for (const node of world.all("node")) for (const terrain of node.terrainPool ?? []) reference(terrain, `${node.id}.terrainPool`, "terrain");
  for (const contract of world.all("contract")) if (!world.all("faction-ops").some(f => contract.issuerKinds?.includes(f.scale))) errors.push(`${contract.id}.issuerKinds: no matching faction`);
  for (const event of world.all("event")) {
    if (event.next) reference(event.next, `${event.id}.next`, "event");
    for (const choice of event.choices ?? []) if (choice.next) reference(choice.next, `${event.id}.choices.next`, "event");
  }
  for (const ship of world.all("ship")) for (const room of ship.rooms ?? []) reference(room.includes("/") ? room : `room/${room}`, `${ship.id}.rooms`, "room");
  for (const cal of world.all("calendar")) {
    if (!Number.isSafeInteger(cal.daysPerMonth) || cal.daysPerMonth < 1) errors.push(`${cal.id}: invalid calendar period`);
    if ([...(cal.spring ?? []), ...(cal.neap ?? [])].some(n => !Number.isInteger(n) || n < 1 || n > cal.daysPerMonth)) errors.push(`${cal.id}: invalid phase day`);
  }
  const templates = new Set(world.all("templates").flatMap(t => Object.keys(t.entries ?? {})));
  for (const type of EVENT_TYPES) if (!templates.has(type)) warnings.push(`templates: missing ${type}`);
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
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
