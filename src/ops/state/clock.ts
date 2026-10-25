import type { CalendarDef, Clock, OmenDef } from "./types.ts";
import { eclipseYear, omens, stage, tide } from "./omens.ts";

/** 曆日 → Clock；defs 是天象定義（決定漲潮日的潮勢），省略時只有基本潮級。 */
export function clock(day: number, cal: CalendarDef, defs: readonly OmenDef[] = []): Clock {
  return skyAt(day, cal, defs).clock;
}
/** 同時回傳 Clock 與當日進行中的天象 id，避免日結重算。 */
export function skyAt(day: number, cal: CalendarDef, defs: readonly OmenDef[] = []): { clock: Clock; omens: string[] } {
  if (!Number.isSafeInteger(day) || day < 0 || !Number.isSafeInteger(cal.daysPerMonth) || cal.daysPerMonth <= 0) throw new Error("無效曆日或週期");
  const dom = day % cal.daysPerMonth + 1, active = omens(day, cal, defs);
  return { omens: active, clock: { day, month: Math.floor(day / cal.daysPerMonth), dom, phase: cal.spring.includes(dom) ? "spring" : cal.neap.includes(dom) ? "neap" : "ordinary",
    stage: stage(dom, cal), tide: tide(day, cal, defs, active), year: eclipseYear(day, cal) } };
}
