import type { CockpitGrowth, PersonDef } from "./types-def.ts";
import type { PersonState } from "./types-state.ts";

/** 開局年資與其後驅動時數只折抵老化；沒有年齡資料或機魂不推算。 */
export function apparentAge(def: Pick<PersonDef, "age" | "activeYears" | "kind">, state: Pick<PersonState, "driveHours">, day: number,
  growth: Pick<CockpitGrowth, "daysPerYear" | "driveHoursPerYear" | "agingRate">): number | null {
  if (def.age === undefined || def.kind === "soul") return null;
  const realAge = def.age + Math.floor(day / growth.daysPerYear);
  const active = (def.activeYears ?? 0) + (state.driveHours ?? 0) / growth.driveHoursPerYear;
  return Math.round(realAge - active * (1 - growth.agingRate));
}
