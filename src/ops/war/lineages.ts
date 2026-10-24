import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { LineageDef } from "./types.ts";
import { factionId, hasTreaty } from "./relations.ts";
import { drive } from "./drivers.ts";

export function monthDays(s: CampaignState, ctx: OpsCtx): number { return ctx.world.require("calendar", s.calendar).daysPerMonth; }
// 多個殼可共用戰鬥 frame；內容的 shell: 標籤才是世界身分。唯一 source 的舊內容仍可用。
export function lineageShells(s: CampaignState, ctx: OpsCtx, lineage: LineageDef) {
  const tags = lineage.tags.filter(t => t.startsWith("shell:"));
  return Object.values(s.shells ?? {}).filter(shell => tags.length ? tags.includes(`shell:${shell.id}`) :
    shell.frame === lineage.source && ctx.world.all("lineage").filter(l => l.source === lineage.source).length === 1);
}
export function heldLineages(s: CampaignState, ctx: OpsCtx, faction: string): string[] {
  return ctx.world.all("lineage").filter(l => l.source === "generic" || lineageShells(s, ctx, l).some(shell =>
    typeof shell.holder === "string" && factionId(s, ctx, shell.holder) === faction)).map(l => l.id);
}
function sharedLineages(s: CampaignState, ctx: OpsCtx, faction: string): string[] {
  return Object.values(s.relations ?? {}).filter(r => [r.a, r.b].includes(faction) && hasTreaty(s, ctx, r, "shell-pact"))
    .flatMap(r => heldLineages(s, ctx, r.a === faction ? r.b : r.a));
}
export function openLineage(s: CampaignState, ctx: OpsCtx, faction: string, lineage: string): void {
  const rnd = s.factions[faction]?.rnd; if (!rnd) return;
  const fresh = !rnd.lineages.includes(lineage), stalled = rnd.stalled.includes(lineage);
  if (!fresh && !stalled) return;
  if (fresh) rnd.lineages.push(lineage);
  rnd.lineages.sort(); rnd.stalled = rnd.stalled.filter(id => id !== lineage);
  ctx.emit("LineageOpened", { faction, lineage });
  if (ctx.world.all("affinity").length) drive(s, ctx, "shell-envy", faction, faction);
}
export function shareTreatyLineages(s: CampaignState, ctx: OpsCtx, a: string, b: string): void {
  for (const [from, to] of [[a, b], [b, a]]) for (const lineage of heldLineages(s, ctx, from!)) openLineage(s, ctx, to!, lineage);
}
// 條約日結也需撤銷共享資格，因此統一在該處同步；研發點仍只由月初入口推進。
export function syncLineages(s: CampaignState, ctx: OpsCtx): void {
  for (const id of Object.keys(s.factions).sort()) {
    const f = s.factions[id]!, rnd = f.rnd; if (!rnd || !f.alive) continue;
    const held = heldLineages(s, ctx, id), shared = sharedLineages(s, ctx, id);
    const progress = f.rndProgress ??= { acquired: {}, held: [...held] };
    for (const lineage of ctx.world.all("lineage")) {
      if (lineage.source === "generic") continue;
      const has = held.includes(lineage.id), had = progress.held.includes(lineage.id);
      if (has && !had) {
        const shells = lineageShells(s, ctx, lineage);
        const acquisition = s.log.findLast(e => e.type === "ShellSeized" && e.payload.to === id && shells.some(sh => sh.id === e.payload.shell));
        progress.acquired[lineage.id] = acquisition?.day ?? s.clock.day;
      }
      if (!has) delete progress.acquired[lineage.id];
      if (!has && !shared.includes(lineage.id) && rnd.lineages.includes(lineage.id) && !rnd.stalled.includes(lineage.id)) rnd.stalled.push(lineage.id);
      if (shared.includes(lineage.id) || has && progress.acquired[lineage.id] !== undefined && s.clock.day >= progress.acquired[lineage.id]! + 2 * monthDays(s, ctx))
        openLineage(s, ctx, id, lineage.id);
    }
    rnd.stalled.sort(); progress.held = held;
  }
}
