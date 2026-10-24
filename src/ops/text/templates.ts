import type { CampaignEvent, CampaignState, Screen, TemplatesDef } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { entityName } from "./parse.ts";

export function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{([\w.-]+)\}/g, (_match, path: string) => {
    let value: unknown = values;
    for (const key of path.split(".")) {
      if (!value || typeof value !== "object" || ["__proto__", "prototype", "constructor"].includes(key) || !Object.hasOwn(value, key)) return "";
      value = (value as Record<string, unknown>)[key];
    }
    if (value && typeof value === "object" && "name" in value) value = value.name;
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : "";
  });
}
export function templateEntries(world: WorldDB): TemplatesDef["entries"] {
  const entries: TemplatesDef["entries"] = {};
  // 後載 pack 優先；同 pack 依模板 id 排序，允許補充模板覆蓋地基佔位句。
  for (const pack of world.packs) for (const def of world.all("templates").filter(d => d.id.startsWith(`${pack.id}:`))) Object.assign(entries, def.entries);
  return entries;
}
export function eventLog(event: CampaignEvent, state: CampaignState, world: WorldDB): Screen["log"][number] {
  const template = templateEntries(world)[event.type];
  const values: Record<string, unknown> = { ...event.payload, day: event.day };
  for (const [key, value] of Object.entries(event.payload)) if (typeof value === "string") values[key] = { id: value, name: entityName(value, state, world) };
  if (event.type === "Named" && typeof event.payload.mech === "string") {
    const index = typeof event.payload.index === "number" ? event.payload.index : undefined;
    const names = state.roster.names[event.payload.mech];
    values.name = index === undefined ? names?.at(-1)?.name : names?.[index]?.name;
  }
  return { day: event.day, text: template ? interpolate(template.text, values) : `未登錄事件：${event.type}。`, kind: template?.kind ?? "info" };
}
