// core/ids — 內容 id 的格式與解析（content-format §資料夾佈局）。
// id 格式 `pack:kind/name`；同 pack 內可省 `pack:`。ContentDB 一律以完整 id 為鍵。

export type Id = string;
export type PackId = string;

/** 一檔一筆的內容種類（id 中間那段）。資料夾名見 KIND_FOLDERS。 */
export const CONTENT_KINDS = [
  "frame", "bodyplan", "component", "ability", "effect", "person", "soultree",
  "terrain", "map", "faction", "species", "monster", "scenario", "loot", "aiprofile", "curve",
] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

/** kind → 內容包裡的資料夾名（content-format 的佈局）。 */
export const KIND_FOLDERS: Record<ContentKind, string> = {
  frame: "frames", bodyplan: "bodyplans", component: "components", ability: "abilities",
  effect: "effects", person: "persons", soultree: "soultrees", terrain: "terrains", map: "maps",
  faction: "factions", species: "species", monster: "monsters", scenario: "scenarios",
  loot: "loot", aiprofile: "aiprofiles", curve: "curves",
};

export type ParsedId = { pack: PackId | null; kind: string; name: string };

const ID_RE = /^(?:([a-z0-9][a-z0-9-]*):)?([a-z][a-z0-9-]*)\/([a-z0-9][a-z0-9._-]*)$/;

export function isContentKind(k: string): k is ContentKind {
  return (CONTENT_KINDS as readonly string[]).includes(k);
}

/** 解析 id；格式不合回傳 null（不丟例外，給 loader 收集錯誤用）。 */
export function parseId(id: string): ParsedId | null {
  const m = ID_RE.exec(id);
  if (!m) return null;
  return { pack: m[1] ?? null, kind: m[2]!, name: m[3]! };
}

/** 補上 pack 前綴；已帶前綴原樣回傳。格式不合丟 Error。 */
export function qualifyId(id: string, pack: PackId): Id {
  const p = parseId(id);
  if (!p) throw new Error(`bad id: ${id}`);
  return p.pack ? id : `${pack}:${id}`;
}

/** 取 id 的 kind 段；格式不合回傳 null。 */
export function kindOf(id: string): string | null {
  return parseId(id)?.kind ?? null;
}

/** 格子座標字串鍵（`x,y`），給 Record 與 Set 用。 */
export type CellKey = string;
export function cellKey(x: number, y: number): CellKey {
  return `${x},${y}`;
}
