import type { CalendarDef, OmenDef } from "../../../ops/state/types.ts";
import { skyAt } from "../../../ops/state/clock.ts";
import { GREAT_TIDE } from "../../../ops/state/omens.ts";
import { wikiHref } from "../../vm/route.ts";
import type { CalendarView, OmenView } from "./types.ts";
import { tideName } from "./labels.ts";

const layers: Record<OmenDef["layer"], string> = { moon: "月相", distance: "月距", eclipse: "蝕象", sky: "天象", season: "時令", scripted: "特殊天象" };
export function omenViews(ids: readonly string[], defs: readonly OmenDef[]): OmenView[] {
  return ids.flatMap(id => {
    const def = defs.find(d => d.id === id);
    return def ? [{ id, name: def.name, layer: def.layer, layerName: layers[def.layer], text: def.text ?? "",
      tideEffect: def.setTide !== undefined ? `漲潮日潮級設為 ${def.setTide}（${tideName(def.setTide)}）` : def.tideDelta !== undefined ? `漲潮日潮級 ${def.tideDelta >= 0 ? "+" : ""}${def.tideDelta}` : "無潮級修正",
      href: wikiHref({ v: "entry", key: id }) }] : [];
  });
}

/** UI 預報最多看未來 800 天；包含今天，與 nextSpringIn 的語意一致。 */
export const GREAT_TIDE_LOOKAHEAD = 800;
export function nextGreatTide(day: number, cal: CalendarDef, defs: readonly OmenDef[]): CalendarView["nextGreatTide"] {
  for (let daysAway = 0; daysAway <= GREAT_TIDE_LOOKAHEAD; daysAway++) {
    const sky = skyAt(day + daysAway, cal, defs);
    if (sky.clock.tide >= GREAT_TIDE) return { day: day + daysAway, daysAway, tide: sky.clock.tide, omens: omenViews(sky.omens, defs) };
  }
  return null;
}
