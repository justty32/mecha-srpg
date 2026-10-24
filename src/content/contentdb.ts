import { CONTENT_KINDS, parseId } from "../core/ids.ts";
import type { ContentKind, Id } from "../core/ids.ts";
import type { DefByKind, PackDef, DamageModifierRow, MoraleEventRow, InjuryRow } from "../core/types-def.ts";
import type { Registries } from "./registry.ts";

export type RulesTables = { constants: Record<string, number>; damageModifiers: DamageModifierRow[]; moraleEvents: MoraleEventRow[]; injuries: InjuryRow[] };
export type ContentDB = {
  readonly packs: readonly PackDef[]; readonly registries: Registries; readonly rules: RulesTables;
  get<K extends ContentKind>(kind: K, id: Id): DefByKind[K] | undefined;
  require<K extends ContentKind>(kind: K, id: Id): DefByKind[K];
  all<K extends ContentKind>(kind: K): DefByKind[K][];
  ids(kind: ContentKind): Id[];
  counts(): Record<ContentKind, number>;
};

function deepFreeze<T>(value: T): T {
  if (value !== null && (typeof value === "object" || typeof value === "function") && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export function createContentDB(packs: PackDef[], registries: Registries, rules: RulesTables,
  defs: { [K in ContentKind]?: Record<Id, DefByKind[K]> }): ContentDB {
  // 複製後凍結，避免純載入流程凍結呼叫端的輸入。
  const data = deepFreeze(structuredClone({ packs, registries, rules, defs }));
  const lookupDef = <K extends ContentKind>(kind: K, id: Id): DefByKind[K] | undefined => {
    const parsed = parseId(id);
    if (!parsed || parsed.kind !== kind) return undefined;
    const table = data.defs[kind];
    const lookup = (key: Id) => table && Object.hasOwn(table, key) ? table[key] : undefined;
    if (parsed.pack) return lookup(id);
    for (let i = data.packs.length - 1; i >= 0; i--) {
      const found = lookup(`${data.packs[i]!.id}:${id}`);
      if (found) return found;
    }
    return undefined;
  };
  // 資料已凍結，查詢結果（含未找到）在此 DB 的生命週期內不變。
  const cache = new Map<ContentKind, Map<Id, DefByKind[ContentKind] | undefined>>();
  const get = <K extends ContentKind>(kind: K, id: Id): DefByKind[K] | undefined => {
    let table = cache.get(kind);
    if (!table) { table = new Map(); cache.set(kind, table); }
    if (!table.has(id)) table.set(id, lookupDef(kind, id));
    return table.get(id) as DefByKind[K] | undefined;
  };
  const ids = (kind: ContentKind): Id[] => Object.keys(data.defs[kind] ?? {}).sort();
  return deepFreeze({
    packs: data.packs, registries: data.registries, rules: data.rules, get,
    require<K extends ContentKind>(kind: K, id: Id): DefByKind[K] {
      const found = get(kind, id);
      if (!found) throw new Error(`missing ${kind}: ${id}`);
      return found;
    },
    all<K extends ContentKind>(kind: K): DefByKind[K][] { return ids(kind).map(id => get(kind, id)!); },
    ids,
    counts(): Record<ContentKind, number> {
      return Object.fromEntries(CONTENT_KINDS.map(kind => [kind, ids(kind).length])) as Record<ContentKind, number>;
    },
  });
}
