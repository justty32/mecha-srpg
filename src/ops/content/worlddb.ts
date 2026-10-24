import { parseId } from "../../core/ids.ts";
import type { PackDef } from "../../core/types-def.ts";
import type { WorldDefByKind, WorldKind } from "../state/types.ts";

export type WorldTables = { [K in WorldKind]?: Record<string, WorldDefByKind[K]> };
export type WorldDB = {
  readonly packs: readonly PackDef[];
  get<K extends WorldKind>(kind: K, id: string): WorldDefByKind[K] | undefined;
  require<K extends WorldKind>(kind: K, id: string): WorldDefByKind[K];
  all<K extends WorldKind>(kind: K): WorldDefByKind[K][];
};
function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
export function createWorldDB(packs: readonly PackDef[], tables: WorldTables): WorldDB {
  const data = freeze(structuredClone({ packs, tables }));
  const get = <K extends WorldKind>(kind: K, id: string): WorldDefByKind[K] | undefined => {
    const parsed = parseId(id);
    if (!parsed || parsed.kind !== kind) return undefined;
    const table = data.tables[kind];
    const lookup = (key: string) => table && Object.hasOwn(table, key) ? table[key] : undefined;
    if (parsed.pack) return lookup(id);
    for (const pack of [...data.packs].reverse()) { const found = lookup(`${pack.id}:${id}`); if (found) return found; }
    return undefined;
  };
  return Object.freeze({ packs: data.packs, get,
    require<K extends WorldKind>(kind: K, id: string): WorldDefByKind[K] {
      const value = get(kind, id);
      if (!value) throw new Error(`missing ${kind}: ${id}`);
      return value;
    },
    all<K extends WorldKind>(kind: K): WorldDefByKind[K][] { return Object.keys(data.tables[kind] ?? {}).sort().map(id => get(kind, id)!); },
  });
}
