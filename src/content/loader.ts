import * as fs from "node:fs";
import * as path from "node:path";
import { CONTENT_KINDS, KIND_FOLDERS, isContentKind, parseId, qualifyId } from "../core/ids.ts";
import type { ContentKind, Id } from "../core/ids.ts";
import { REGISTRY_KINDS, RULE_FILES } from "../core/types-def.ts";
import type { DefByKind, PackDef, RegistryKind, RegistryFile, RulesConstants, DamageModifiersFile, MoraleEventsFile, InjuriesFile } from "../core/types-def.ts";
import { emptyRegistries, mergeRegistry, hasEntry } from "./registry.ts";
import type { Registries } from "./registry.ts";
import { createContentDB } from "./contentdb.ts";
import type { ContentDB, RulesTables } from "./contentdb.ts";
import { validateAgainst } from "./schema.ts";
import type { SchemaName } from "./schema.ts";

export type LoadIssue = { file: string; path: string; message: string };
export type PackFiles = { root: string; files: Record<string, unknown> };
export type LoadResult = { db: ContentDB; errors: LoadIssue[]; warnings: LoadIssue[] };
type ObjectValue = Record<string, unknown>;
type DefTables = { [K in ContentKind]?: Record<Id, DefByKind[K]> };
type Source = { file: string; value: unknown; path: string };

export function readPackDir(dir: string): PackFiles & { errors: LoadIssue[] } {
  const files: Record<string, unknown> = Object.create(null);
  const errors: LoadIssue[] = [];
  const read = (relative: string): void => {
    const absolute = path.join(dir, relative);
    try {
      for (const entry of fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
        const name = relative ? `${relative}/${entry.name}` : entry.name;
        if (entry.isDirectory()) read(name);
        else if (entry.isFile() && entry.name.endsWith(".json")) {
          try { files[name] = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")); }
          catch (error) { errors.push({ file: `${dir}/${name}`, path: "$", message: String(error) }); }
        }
      }
    } catch (error) { errors.push({ file: absolute, path: "$", message: String(error) }); }
  };
  read("");
  return { root: dir, files, errors };
}

function object(value: unknown): value is ObjectValue {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalize(value: unknown, pack: string): unknown {
  if (typeof value === "string") {
    const parsed = parseId(value);
    return parsed && isContentKind(parsed.kind) && !parsed.pack ? qualifyId(value, pack) : value;
  }
  if (Array.isArray(value)) return value.map(item => normalize(item, pack));
  if (object(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [normalize(key, pack) as string, normalize(item, pack)]));
  return value;
}

function sortedPacks(packs: PackFiles[], errors: LoadIssue[]): { source: PackFiles; def: PackDef }[] {
  const byId = new Map<string, { source: PackFiles; def: PackDef }>();
  for (const source of packs) {
    const file = `${source.root}/pack.json`;
    if (!Object.hasOwn(source.files, "pack.json")) {
      errors.push({ file, path: "$", message: "missing pack.json" });
      continue;
    }
    const issues = validateAgainst("pack", source.files["pack.json"]);
    errors.push(...issues.map(issue => ({ file, ...issue })));
    if (issues.length) continue;
    const def = source.files["pack.json"] as PackDef;
    // pack id 必須能組成 ids.ts 所接受的完整 id。
    if (parseId(`${def.id}:frame/probe`)?.pack !== def.id) {
      errors.push({ file, path: "$.id", message: `invalid pack id ${def.id}` });
      continue;
    }
    if (byId.has(def.id)) errors.push({ file, path: "$.id", message: `duplicate pack ${def.id}` });
    else byId.set(def.id, { source, def });
  }
  for (const { source, def } of byId.values()) def.depends.forEach((dependency, index) => {
    if (!byId.has(dependency)) errors.push({ file: `${source.root}/pack.json`, path: `$.depends[${index}]`, message: `missing dependency ${dependency}` });
  });
  const pending = [...byId.keys()].sort(), loaded = new Set<string>();
  const result: { source: PackFiles; def: PackDef }[] = [];
  while (pending.length) {
    const index = pending.findIndex(id => byId.get(id)!.def.depends.every(dependency => loaded.has(dependency) || !byId.has(dependency)));
    if (index < 0) {
      for (const id of pending) errors.push({ file: `${byId.get(id)!.source.root}/pack.json`, path: "$.depends", message: "cyclic dependency prevents loading" });
      break;
    }
    const id = pending.splice(index, 1)[0]!;
    loaded.add(id);
    result.push(byId.get(id)!);
  }
  return result;
}

function checkMerged(db: ContentDB, definitions: Map<string, Source>, ruleSources: Source[], errors: LoadIssue[]): void {
  const pools = new Set<string>();
  for (const kind of ["frame", "component", "person", "species"] as const) {
    for (const def of db.all(kind)) for (const pool of def.pools) pools.add(pool.id);
  }
  const visit = (value: unknown, at: string, file: string): void => {
    const error = (path: string, message: string) => errors.push({ file, path, message });
    const reference = (id: string, location: string) => {
      const parsed = parseId(id);
      if (parsed?.pack && isContentKind(parsed.kind) && !db.get(parsed.kind, id)) error(location, `missing reference ${id}`);
    };
    const entry = (kind: RegistryKind, id: unknown, location: string) => {
      if (typeof id === "string" && !hasEntry(db.registries, kind, id)) error(location, `unregistered ${kind}: ${id}`);
    };
    const keys = (kind: RegistryKind, record: unknown, location: string) => {
      if (object(record)) for (const key of Object.keys(record)) entry(kind, key, `${location}.${key}`);
    };
    const entries = (kind: RegistryKind, list: unknown, location: string) => {
      if (Array.isArray(list)) list.forEach((item, index) => entry(kind, item, `${location}[${index}]`));
    };
    if (typeof value === "string") reference(value, at);
    else if (Array.isArray(value)) value.forEach((item, index) => visit(item, `${at}[${index}]`, file));
    else if (object(value)) {
      if (typeof value.ref === "string" && !["self", "target", "part", "layer", "battle"].includes(value.ref.split(".")[0]!)) error(`${at}.ref`, `invalid NumExpr root: ${value.ref}`);
      for (const key of ["pool", "ammoPool", "regenPool"]) {
        const id = value[key];
        if (typeof id === "string" && !pools.has(id)) error(`${at}.${key}`, `undeclared pool ${id}`);
      }
      if (at === "$") {
        keys("attrs", value.attrs, "$.attrs");
        keys("attrs", value.baseAttrs, "$.baseAttrs");
        if (object(value.baseAttrsByGrade)) for (const [grade, attrs] of Object.entries(value.baseAttrsByGrade)) keys("attrs", attrs, `$.baseAttrsByGrade.${grade}`);
      }
      if (Object.hasOwn(value, "structural")) entry("layer-types", value.type, `${at}.type`);
      if (Object.hasOwn(value, "amount") && Object.hasOwn(value, "type")) entry("damage-types", value.type, `${at}.type`);
      if (typeof value.when === "string") entry("layer-types", value.layer, `${at}.layer`);
      if (Object.hasOwn(value, "size") && Object.hasOwn(value, "type")) entry("slot-types", value.type, `${at}.type`);
      entry("slot-types", value.slot, `${at}.slot`);
      entries("layer-types", value.layerFilter, `${at}.layerFilter`);
      entries("layer-types", value.layerTypes, `${at}.layerTypes`);
      entries("damage-types", value.damageTypes, `${at}.damageTypes`);
      keys("damage-types", value.resist, `${at}.resist`);
      keys("damage-types", value.passThrough, `${at}.passThrough`);
      entries("part-functions", value.functions, `${at}.functions`);
      entries("part-functions", value.requireIntact, `${at}.requireIntact`);
      entries("part-functions", value.requireBroken, `${at}.requireBroken`);
      keys("locomotion", value.moveCost, `${at}.moveCost`);
      keys("tactics", value.tactics, `${at}.tactics`);
      for (const [key, item] of Object.entries(value)) {
        reference(key, `${at}.${key}`);
        visit(item, `${at}.${key}`, file);
      }
    }
  };
  for (const source of [...definitions.values(), ...ruleSources]) visit(source.value, source.path, source.file);
}

export function loadPacks(packs: PackFiles[]): LoadResult {
  const errors: LoadIssue[] = [], warnings: LoadIssue[] = [];
  const sorted = sortedPacks(packs, errors);
  const registries: Registries = emptyRegistries();
  const rules: RulesTables = { constants: Object.create(null), damageModifiers: [], moraleEvents: [], injuries: [] };
  const defs: DefTables = {};
  const definitions = new Map<string, Source>(), ruleSources: Source[] = [];
  const folders = new Map(Object.entries(KIND_FOLDERS).map(([kind, folder]) => [folder, kind as ContentKind]));
  for (const { source, def: pack } of sorted) {
    for (const relative of Object.keys(source.files).sort()) {
      if (relative === "pack.json") continue;
      const file = `${source.root}/${relative}`, value = source.files[relative];
      const match = /^([^/]+)\/([^/]+)\.json$/.exec(relative);
      if (!match) { errors.push({ file, path: "$", message: "invalid content file path" }); continue; }
      const [, folder, name] = match;
      const validate = (schema: SchemaName): boolean => {
        const issues = validateAgainst(schema, value);
        errors.push(...issues.map(issue => ({ file, ...issue })));
        return issues.length === 0;
      };
      if (folder === "registries") {
        if (!validate("registry")) continue;
        const registry = value as RegistryFile;
        if (registry.kind !== name) { errors.push({ file, path: "$.kind", message: "registry kind differs from filename" }); continue; }
        mergeRegistry(registries, registry);
      } else if (folder === "rules") {
        if (!(RULE_FILES as readonly string[]).includes(name!)) { errors.push({ file, path: "$", message: "unknown rules file" }); continue; }
        if (!validate(`rules-${name}` as SchemaName)) continue;
        const normalized = normalize(value, pack.id);
        // SPEC-GAP：規則表合併未指定；常數後到覆寫同鍵，列式表依載入順序附加。
        if (name === "constants") Object.assign(rules.constants, (normalized as RulesConstants).constants);
        else {
          const rows = (normalized as DamageModifiersFile | MoraleEventsFile | InjuriesFile).rows;
          if (name === "damage-modifiers") rules.damageModifiers.push(...(normalized as DamageModifiersFile).rows);
          if (name === "morale-events") rules.moraleEvents.push(...(normalized as MoraleEventsFile).rows);
          if (name === "injuries") rules.injuries.push(...(normalized as InjuriesFile).rows);
          rows.forEach((row, index) => ruleSources.push({ file, value: row, path: `$.rows[${index}]` }));
        }
      } else {
        const kind = folders.get(folder!);
        if (!kind) { errors.push({ file, path: "$", message: "unknown content folder" }); continue; }
        if (!validate(kind)) continue;
        const parsed = parseId((value as { id: string }).id);
        if (!parsed || parsed.kind !== kind || parsed.name !== name) { errors.push({ file, path: "$.id", message: "id kind or name differs from file path" }); continue; }
        const normalized = normalize(value, pack.id) as DefByKind[typeof kind];
        // 每張表的 kind 已由資料夾與 schema 核對，這裡統一存入對應的表。
        const tables = defs as Partial<Record<ContentKind, Record<Id, DefByKind[ContentKind]>>>;
        const table = tables[kind] ??= Object.create(null);
        if (Object.hasOwn(table, normalized.id)) warnings.push({ file, path: "$.id", message: `overrides ${normalized.id}` });
        table[normalized.id] = normalized;
        definitions.set(normalized.id, { file, path: "$", value: normalized });
      }
    }
  }
  const db = createContentDB(sorted.map(({ def }) => def), registries, rules, defs);
  checkMerged(db, definitions, ruleSources, errors);
  return { db, errors, warnings };
}

export function loadContentDirs(dirs: string[]): LoadResult {
  const packs = dirs.map(readPackDir);
  const result = loadPacks(packs);
  result.errors.unshift(...packs.flatMap(pack => pack.errors));
  return result;
}

if (import.meta.main) {
  const dirs = process.argv.length > 2 ? process.argv.slice(2) : ["content/base"];
  const packs = dirs.map(readPackDir);
  const { db, errors, warnings } = loadPacks(packs);
  errors.unshift(...packs.flatMap(pack => pack.errors));
  for (const pack of db.packs) console.log(`pack ${pack.id} ${pack.version}`);
  const counts = db.counts();
  for (const kind of CONTENT_KINDS) {
    if (!counts[kind]) continue;
    const persons = kind === "person" ? db.all("person") : [];
    const detail = kind === "person" ? ` (human ${persons.filter(person => person.kind === "human").length}, soul ${persons.filter(person => person.kind === "soul").length})` : "";
    console.log(`${kind}: ${counts[kind]}${detail}`);
  }
  console.log(`registries: ${REGISTRY_KINDS.filter(kind => Object.keys(db.registries[kind]).length > 0).length}/7`);
  console.log(`rules: ${RULE_FILES.filter(name => packs.some(pack => Object.hasOwn(pack.files, `rules/${name}.json`))).length}/4`);
  for (const warning of warnings) console.log(`WARNING ${warning.file} ${warning.path} ${warning.message}`);
  for (const error of errors) console.log(`ERROR ${error.file} ${error.path} ${error.message}`);
  if (errors.length) { console.log(`FAIL ${errors.length} errors`); process.exitCode = 1; }
  else console.log(`OK 0 errors, ${warnings.length} warnings`);
}
