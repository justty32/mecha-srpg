import type { FactionSlot } from "../core/types-def.ts";
import type { BattleState } from "../core/types-state.ts";
import type { RulesQuery } from "./rules-query.ts";

/** 同盟交由規則查詢；舊 adapter／替身沒有查詢時保留 slot 與失控語意。 */
export function isHostileSlot(q: RulesQuery, s: BattleState, a: FactionSlot, b: FactionSlot): boolean {
  const query = q as { hostileSlots?: (s: BattleState, a: FactionSlot, b: FactionSlot) => boolean };
  return query.hostileSlots ? query.hostileSlots(s, a, b) : a === "berserk" || b === "berserk" || a !== b;
}
