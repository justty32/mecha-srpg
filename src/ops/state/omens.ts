import type { CalendarDef, OmenDef, TideStage } from "./types.ts";

/** 潮級語意：≥ 3 為大潮（含連珠潮 4）；是曆的定義，不是平衡數值。 */
export const GREAT_TIDE = 3;
const DELTA_CAP = 3, TIDE_MAX = 4;

function mod(a: number, n: number): number { return ((a % n) + n) % n; }
/** 蝕曆元年第一日起算的日序（開局 day 0 ＝ epochMonth 蝕月初一）。 */
export function epochDay(day: number, cal: CalendarDef): number { return day + (cal.epochMonth ?? 0) * cal.daysPerMonth; }
export function eclipseYear(day: number, cal: CalendarDef): number {
  return Math.floor(Math.floor(epochDay(day, cal) / cal.daysPerMonth) / (cal.monthsPerYear ?? 13)) + 1;
}

/** 潮候：漲潮日＝spring 表、平潮日＝neap 表；漲潮前 window 日潮前、後 window 日退潮；其餘小潮。 */
export function stage(dom: number, cal: CalendarDef): TideStage {
  if (cal.spring.includes(dom)) return "spring";
  if (cal.neap.includes(dom)) return "slack";
  const window = cal.stageWindow ?? 3, n = cal.daysPerMonth;
  if (!cal.spring.length) return "neap";
  const toNext = Math.min(...cal.spring.map(s => mod(s - dom, n) || n)), since = Math.min(...cal.spring.map(s => mod(dom - s, n) || n));
  if (toNext <= window) return "rising";
  if (since <= window) return "ebb";
  return "neap";
}

export function cyclePeriodDays(def: OmenDef, cal: CalendarDef): number { return Math.round(def.cycle!.periodMonths * cal.daysPerMonth); }
function windowActive(def: OmenDef, day: number, cal: CalendarDef): boolean {
  if (def.cycle) {
    const period = cyclePeriodDays(def, cal);
    if (period > 0 && mod(epochDay(day, cal) - def.cycle.offsetDays, period) < def.cycle.durationDays) return true;
  }
  const month = Math.floor(day / cal.daysPerMonth), dom = mod(day, cal.daysPerMonth) + 1;
  return !!def.at?.some(a => a.month === month && a.dom === dom);
}

/** 當日進行中的天象 id（排序）；湧現型只在漲潮日、看其餘天象的窗判定。 */
export function omens(day: number, cal: CalendarDef, defs: readonly OmenDef[]): string[] {
  const active = new Set(defs.filter(d => windowActive(d, day, cal)).map(d => d.id));
  if (stage(mod(day, cal.daysPerMonth) + 1, cal) === "spring") {
    for (const def of defs) {
      if (!def.emerge || active.has(def.id)) continue;
      const { requires, layer, min } = def.emerge;
      const count = defs.filter(d => d.layer === layer && active.has(d.id)).length;
      if (requires.every(id => active.has(id)) && count >= min) active.add(def.id);
    }
  }
  return [...active].sort();
}

/** 潮級 0–4：平潮 0、小潮／潮前／退潮 1、漲潮 2；漲潮日再疊天象——delta 相加後上限 3，setTide 優先（多個取最大，連珠 4 壓過枯潮 1）。 */
export function tide(day: number, cal: CalendarDef, defs: readonly OmenDef[], active = omens(day, cal, defs)): number {
  const st = stage(mod(day, cal.daysPerMonth) + 1, cal);
  if (st !== "spring") return st === "slack" ? 0 : 1;
  const on = defs.filter(d => active.includes(d.id));
  const sets = on.flatMap(d => d.setTide === undefined ? [] : [d.setTide]);
  const value = sets.length ? Math.max(...sets) : Math.min(DELTA_CAP, 2 + on.reduce((n, d) => n + (d.tideDelta ?? 0), 0));
  return Math.max(0, Math.min(TIDE_MAX, value));
}

/** 天象旗名：`omen:<名>`（去 pack 前綴與 `omen/`）。 */
export function omenFlag(id: string): string { return `omen:${id.replace(/^[^:]*:/, "").replace(/^omen\//, "")}`; }
/** 日結段 1：把進行中天象寫成 `flags["omen:<名>"]=1`，窗外的刪掉（旗也是 Cond 的 tag）。 */
export function syncOmenFlags(flags: Record<string, number>, active: readonly string[]): void {
  const on = new Set(active.map(omenFlag));
  for (const key of Object.keys(flags)) if (key.startsWith("omen:") && !on.has(key)) delete flags[key];
  for (const key of [...on].sort()) flags[key] = 1;
}
