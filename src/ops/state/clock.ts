import type { CalendarDef, Clock } from "./types.ts";

export function clock(day: number, cal: CalendarDef): Clock {
  if (!Number.isSafeInteger(day) || day < 0 || !Number.isSafeInteger(cal.daysPerMonth) || cal.daysPerMonth <= 0) throw new Error("無效曆日或週期");
  const dom = day % cal.daysPerMonth + 1;
  return { day, month: Math.floor(day / cal.daysPerMonth), dom, phase: cal.spring.includes(dom) ? "spring" : cal.neap.includes(dom) ? "neap" : "ordinary" };
}
