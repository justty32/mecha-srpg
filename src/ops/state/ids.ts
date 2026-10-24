import type { CampaignState } from "./types.ts";

export function nextId(s: Pick<CampaignState, "idCounter">, prefix: string): string {
  if (!/^[a-z][a-z0-9-]*$/.test(prefix)) throw new Error(`無效實體前綴：${prefix}`);
  if (!Number.isSafeInteger(s.idCounter) || s.idCounter < 0 || s.idCounter === Number.MAX_SAFE_INTEGER) throw new Error("idCounter 超界");
  return `${prefix}-${++s.idCounter}`;
}
