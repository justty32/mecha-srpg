import { isContentKind, parseId, qualifyId } from "../../core/ids.ts";
import { loadPacks, readPackDir } from "../../content/loader.ts";
import type { LoadIssue, PackFiles } from "../../content/loader.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import type { WorldDefByKind, WorldKind } from "../state/types.ts";
import { createWorldDB, keymapErrors } from "./worlddb.ts";
import type { WorldDB, WorldTables } from "./worlddb.ts";

export const WORLD_FOLDERS = { operations: "operation", treaties: "treaty", lineages: "lineage", models: "model", forces: "forces", rifts: "rift", encounters: "encounter", "factions-ops": "faction-ops",
  actors: "actor", maps: "map", places: "place", lanes: "lane", regions: "regions", wterrains: "wterrain",
  contracts: "contract", actions: "action", markets: "market", services: "service", "recruit-pools": "recruit", backgrounds: "background",
  beasts: "beasts", omens: "omen", research: "research", jobs: "job", names: "names", events: "event", dialogues: "dialogue", rooms: "room", templates: "templates", "campaign-start": "start" } as const;
export const WORLD_KINDS: readonly WorldKind[] = ["calendar", "ship", "keymap", "affinity", ...Object.values(WORLD_FOLDERS)];
export type WorldLoadResult = { db: ContentDB; world: WorldDB; errors: LoadIssue[]; warnings: LoadIssue[] };

function normalize(value: unknown, pack: string, field = ""): unknown {
  // 文字與 ref 路徑不可當內容引用改寫；Record 的 id 鍵仍需補前綴。
  if (["text", "name", "title", "topic", "pattern", "flavor", "ref", "base", "lines", "names", "epithets"].includes(field)) return value;
  if (typeof value === "string") {
    const parsed = parseId(value);
    return parsed && (isContentKind(parsed.kind) || WORLD_KINDS.includes(parsed.kind as WorldKind)) ? qualifyId(value, pack) : value;
  }
  if (Array.isArray(value)) return value.map(item => normalize(item, pack));
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [normalize(key, pack) as string, normalize(item, pack, key)]));
  return value;
}

export function loadWorldPacks(packs: PackFiles[]): WorldLoadResult {
  // core 已依 pack.json depends 排序；營運層沿用同一順序，避免兩個 DB 覆寫結果分歧。
  const core = loadPacks(packs), errors = [...core.errors], warnings = [...core.warnings];
  const tables: WorldTables = {};
  for (const pack of core.db.packs) {
    const source = packs.find(p => (p.files["pack.json"] as { id?: string } | undefined)?.id === pack.id)!;
    for (const relative of Object.keys(source.files).sort()) {
      if (!relative.startsWith("world/")) continue;
      const file = `${source.root}/${relative}`;
      const parts = relative.slice(6).split("/");
      const single = parts.length === 1 ? parts[0]!.replace(/\.json$/, "") : undefined;
      const kind = single === "keymap-ops" ? "keymap" : single && ["calendar", "ship", "affinity"].includes(single) ? single as WorldKind
        : parts.length === 2 ? WORLD_FOLDERS[parts[0] as keyof typeof WORLD_FOLDERS] : undefined;
      if (!kind) { errors.push({ file, path: "$", message: "unknown world path" }); continue; }
      const value = source.files[relative];
      if (!value || typeof value !== "object" || Array.isArray(value)) { errors.push({ file, path: "$", message: "world definition must be an object" }); continue; }
      const raw = structuredClone(value) as Record<string, unknown>;
      if (kind === "event") { if (raw.where === "node") raw.where = "place"; if (raw.where === "route") raw.where = "field"; }
      // SPEC-GAP：勢力、對白、模板範例省略 id；以檔名補；裸模板表包成 entries。
      const basename = parts.at(-1)!.replace(/\.json$/, "");
      if (kind === "templates" && !raw.entries) {
        const explicitId = raw.id;
        const entries = Object.fromEntries(Object.entries(raw).filter(([key]) => key !== "id"));
        Object.keys(raw).forEach(key => { delete raw[key]; });
        raw.entries = entries;
        if (explicitId !== undefined) raw.id = explicitId;
      }
      raw.id ??= `${kind}/${basename}`;
      const parsed = typeof raw.id === "string" ? parseId(raw.id) : null;
      if (!parsed || parsed.kind !== kind || !single && parsed.name !== basename) { errors.push({ file, path: "$.id", message: "id differs from world kind/filename" }); continue; }
      const normalized = normalize(raw, pack.id) as WorldDefByKind[typeof kind];
      if (kind === "keymap") for (const message of keymapErrors(normalized as WorldDefByKind["keymap"])) errors.push({ file, path: "$", message });
      const table = (tables as Partial<Record<WorldKind, Record<string, WorldDefByKind[WorldKind]>>>)[kind] ??= {};
      if (Object.hasOwn(table, normalized.id)) warnings.push({ file, path: "$.id", message: `overrides ${normalized.id}` });
      table[normalized.id] = normalized;
    }
  }
  const sourceWorld = createWorldDB(core.db.packs, tables);
  // 內容 DB 不可變；日結大量重查相同定義，快取查找結果而不快取可變 campaign 狀態。
  const lists = new Map<WorldKind, WorldDefByKind[WorldKind][]>();
  const lookup = new Map<string, WorldDefByKind[WorldKind] | undefined>();
  const world: WorldDB = Object.freeze({ packs: sourceWorld.packs,
    get<K extends WorldKind>(kind: K, id: string): WorldDefByKind[K] | undefined {
      const key = `${kind}|${id}`;
      if (!lookup.has(key)) lookup.set(key, sourceWorld.get(kind, id));
      return lookup.get(key) as WorldDefByKind[K] | undefined;
    },
    require<K extends WorldKind>(kind: K, id: string): WorldDefByKind[K] {
      const result = world.get(kind, id);
      if (!result) throw new Error(`missing ${kind}: ${id}`);
      return result;
    },
    all<K extends WorldKind>(kind: K): WorldDefByKind[K][] {
      if (!lists.has(kind)) lists.set(kind, sourceWorld.all(kind));
      return [...lists.get(kind)!] as WorldDefByKind[K][];
    },
  });
  return { db: core.db, world, errors, warnings };
}
export function loadWorldDirs(dirs: string[]): WorldLoadResult {
  const packs = dirs.map(readPackDir), result = loadWorldPacks(packs);
  result.errors.unshift(...packs.flatMap(pack => pack.errors));
  return result;
}
