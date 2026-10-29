import type { Id } from "../core/ids.ts";
import type { PartId, PartPattern } from "../core/types-def.ts";
import { applyPacketDetailed } from "./layers.ts";
import type { PacketIn } from "./layers.ts";
import type { DefenseInfo } from "./defense.ts";
import type { Ctx } from "./state.ts";
import { emit, frameView, isActive, partDefs, unit } from "./state.ts";

export type PartHitInfo = { pattern: "single" | "spread" | "penetrate"; maxParts: number;
  partHits: { part: PartId; fraction: number | null; conditional: boolean; primary: boolean }[]; possibleParts: PartId[] };

export function nextParts(ctx: Ctx, target: Id, from: PartId, selection: "adjacent" | "exposed", visited: ReadonlySet<PartId>): PartId[] {
  const body = ctx.db.require("bodyplan", frameView(ctx, target).bodyPlan), adjacency = body.partAdjacency ?? {};
  const neighbors = new Set(adjacency[from] ?? []);
  for (const [part, edges] of Object.entries(adjacency)) if (edges.includes(from)) neighbors.add(part);
  return partDefs(ctx, target).filter(p => !visited.has(p.id) && !unit(ctx, target).parts[p.id]!.broken && (selection === "exposed" || neighbors.has(p.id)))
    .sort((a, b) => b.exposure - a.exposure || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map(p => p.id);
}

/** 只列可能入口與有限份額，不預測命中骰／暴擊／穿出餘量。 */
function redirectSpread(hits: PartHitInfo["partHits"], defense?: DefenseInfo | null): PartHitInfo["partHits"] {
  const merged = new Map<PartId, PartHitInfo["partHits"][number]>();
  for (const hit of hits) {
    const guarded = hit.primary && defense?.applies;
    const part = guarded ? defense.part : hit.part, fraction = (hit.fraction ?? 0) * (guarded ? defense.damageFactor : 1);
    const existing = merged.get(part);
    if (existing) { existing.fraction = (existing.fraction ?? 0) + fraction; existing.primary ||= hit.primary; }
    else merged.set(part, { ...hit, part, fraction });
  }
  return [...merged.values()];
}

export function partHitInfo(ctx: Ctx, target: Id, primary?: PartId, pattern?: PartPattern, defense?: DefenseInfo | null): PartHitInfo {
  const maxParts = pattern?.kind === "spread" ? pattern.fractions.length : pattern?.kind === "penetrate" ? pattern.maxParts : 1;
  if (primary === undefined) return { pattern: pattern?.kind ?? "single", maxParts, partHits: [], possibleParts: partDefs(ctx, target).filter(p => !unit(ctx, target).parts[p.id]!.broken).map(p => p.id) };
  const first = defense?.applies ? defense.part : primary, parts = [pattern?.kind === "spread" ? primary : first], visited = new Set(parts);
  if (pattern?.kind === "spread") parts.push(...nextParts(ctx, target, primary, pattern.selection, visited).slice(0, maxParts - 1));
  if (pattern?.kind === "penetrate") while (parts.length < maxParts) {
    const next = defense?.applies && parts.length === 1 && !visited.has(primary) ? primary : nextParts(ctx, target, parts.at(-1)!, "adjacent", visited)[0];
    if (!next) break; parts.push(next); visited.add(next);
  }
  let hits = parts.map((part, index) => ({ part, fraction: pattern?.kind === "spread" ? pattern.fractions[index]! : index === 0 ? defense?.applies ? defense.damageFactor : 1 : null, conditional: pattern?.kind === "penetrate" && index > 0, primary: index === 0 }));
  if (pattern?.kind === "spread") hits = redirectSpread(hits, defense);
  return { pattern: pattern?.kind ?? "single", maxParts, partHits: hits, possibleParts: hits.map(hit => hit.part) };
}


export function applyPartHits(ctx: Ctx, actor: Id, target: Id, primary: PartId, packet: PacketIn, pattern?: PartPattern, defense?: DefenseInfo | null, frozenPlan?: PartHitInfo): void {
  const guarded = defense?.applies === true, first = guarded ? defense.part : primary;
  const factor = guarded ? defense.damageFactor : 1;
  const apply = (part: PartId, amount: number): number => {
    if (!isActive(ctx, target) || amount <= 0) return 0;
    const result = applyPacketDetailed(ctx, target, part, { ...packet, amount }, actor);
    if (result.steps.length) emit(ctx, "PartHit", { unit: target, actor, part, amount, remaining: result.remaining, damageType: packet.type });
    return result.remaining;
  };
  if (pattern?.kind === "spread") {
    const plan = frozenPlan ?? partHitInfo(ctx, target, primary, pattern);
    const amounts = new Map<PartId, number>();
    for (const hit of redirectSpread(plan.partHits, defense)) {
      const part = hit.part;
      const amount = packet.amount * (hit.fraction ?? 0);
      amounts.set(part, (amounts.get(part) ?? 0) + amount);
    }
    for (const [part, amount] of amounts) {
      if (!isActive(ctx, target)) break;
      if (!unit(ctx, target).parts[part]!.broken) apply(part, amount);
    }
    return;
  }
  if (pattern?.kind === "penetrate") {
    const visited = new Set<PartId>();
    let part: PartId | undefined = first, amount = packet.amount * factor;
    while (part && visited.size < pattern.maxParts && amount > 0 && isActive(ctx, target)) {
      visited.add(part);
      const remaining = apply(part, amount);
      if (remaining <= 0 || !isActive(ctx, target)) break;
      amount = remaining * pattern.falloff;
      // 真正穿出攔截臂才可走向原瞄準入口；其後只走身體明示圖。
      part = guarded && part === first && !visited.has(primary) ? primary
        : nextParts(ctx, target, part, "adjacent", visited)[0];
    }
    return;
  }
  apply(first, packet.amount * factor);
}
