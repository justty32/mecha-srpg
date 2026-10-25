// 百科的「外界看得到的版本」：lore 資料的隱藏真相標記（engine-backlog 45，格式見 content/lore/README.md「可見度」）。
// hidden 一律在建索引之前拿掉（整筆、整個物件、整欄、指向 hidden 條目的引用與本文連結），
// 所以搜尋、反向引用、年表、原始資料區都看不到；rumor 原樣保留，由 cards 呈現為「傳聞」。
import type { RawFile } from "./types.ts";

export type Visibility = "public" | "rumor" | "hidden";
export const VISIBILITIES: readonly Visibility[] = ["public", "rumor", "hidden"];

type Data = Record<string, unknown>;
const record = (v: unknown): v is Data => typeof v === "object" && v !== null && !Array.isArray(v);
const isHidden = (v: unknown): boolean => record(v) && v.visibility === "hidden";
const REF_KEYS = ["faction", "character", "place", "event", "era"];

/** 物件或欄位的可見度；沒標就是 public。 */
export function visibilityOf(value: unknown): Visibility {
  const v = record(value) ? value.visibility : undefined;
  return v === "rumor" || v === "hidden" ? v : "public";
}

/** 條目頂層某欄的可見度：欄位本身是物件時看它的 visibility，否則看根的 fieldVisibility。 */
export function fieldVisibility(data: unknown, field: string): Visibility {
  if (!record(data)) return "public";
  const own = visibilityOf(data[field]);
  if (own !== "public") return own;
  const map = data.fieldVisibility;
  const v = record(map) ? map[field] : undefined;
  return v === "rumor" || v === "hidden" ? v : "public";
}

function strip(value: unknown, hiddenIds: Set<string>): unknown {
  const gone = (v: unknown): boolean => isHidden(v) || (typeof v === "string" && hiddenIds.has(v))
    // 關係列的對象是 hidden 條目時整列拿掉（只剩關係詞會洩漏有這個對象）。
    || (record(v) && REF_KEYS.some(k => typeof v[k] === "string" && hiddenIds.has(v[k] as string)));
  if (Array.isArray(value)) return value.filter(v => !gone(v)).map(v => strip(v, hiddenIds));
  if (!record(value)) return value;
  const out: Data = {};
  for (const [k, v] of Object.entries(value)) if (!gone(v)) out[k] = strip(v, hiddenIds);
  return out;
}

function unlink(body: string, hiddenIds: Set<string>): string {
  return body
    .replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/gu, (m, id: string, text?: string) => hiddenIds.has(id.trim()) ? (text ?? "") : m)
    .replace(/\[([^\]]*)\]\(([^)\s]+)\)/gu, (m, text: string, id: string) => hiddenIds.has(id.trim()) ? text : m);
}

/** lore 條目轉成外界版本；整筆 hidden 回傳 null。 */
export function publicRecord(data: unknown, hiddenIds: Set<string> = new Set()): unknown {
  if (!record(data)) return data;
  if (isHidden(data)) return null;
  const map = record(data.fieldVisibility) ? data.fieldVisibility : {};
  const hiddenFields = new Set(Object.entries(map).filter(([, v]) => v === "hidden").map(([k]) => k));
  const out = strip(Object.fromEntries(Object.entries(data).filter(([k]) => !hiddenFields.has(k))), hiddenIds) as Data;
  if (record(out.fieldVisibility)) {
    const rest = Object.fromEntries(Object.entries(out.fieldVisibility).filter(([k]) => !hiddenFields.has(k)));
    if (Object.keys(rest).length) out.fieldVisibility = rest; else delete out.fieldVisibility;
  }
  if (typeof out.body === "string") out.body = unlink(out.body, hiddenIds);
  return out;
}

/** 整包檔案轉成外界版本：只動 lore pack；其他 pack 原樣通過。不改輸入物件。 */
export function publicFiles(files: RawFile[]): RawFile[] {
  const hiddenIds = new Set<string>();
  for (const f of files) if (f.pack === "lore" && isHidden(f.data) && typeof (f.data as Data).id === "string") {
    const id = (f.data as Data).id as string;
    hiddenIds.add(id);
    hiddenIds.add(`lore:${id}`);
  }
  return files.flatMap((f): RawFile[] => {
    if (f.pack !== "lore") return [f];
    const data = publicRecord(f.data, hiddenIds);
    return data === null ? [] : [{ ...f, data }];
  });
}
