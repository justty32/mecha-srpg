import type { CampaignState, OpsCtx, RiftDef, RiftState } from "../state/types.ts";
import { evalOpsNum } from "../content/cond.ts";
import { nextId } from "../state/ids.ts";
import { adjacentNodes, blightNode, reclaimNode, worldRules } from "./nodes.ts";

export type RiftBattleOutcome = "anchor-killed" | "anchor-captured" | "defended" | "lost" | "vanguard-killed";
// SPEC-GAP：記錄最後守住的大潮，避免同一天重複戰果跳過第二次防守。
export type BattleRiftState = RiftState & { defendedDay?: number; recedeDay?: number };
export function riftDefinition(ctx: OpsCtx, rift: RiftState): RiftDef {
  const def = ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(d => d.family === rift.family);
  if (!def) throw new Error(`missing rift family: ${rift.family}`);
  return def;
}
export function nextSpring(s: CampaignState, ctx: OpsCtx): number {
  const cal = ctx.world.require("calendar", s.calendar);
  return s.clock.day + (cal.spring.length ? Math.min(...cal.spring.map(dom => (dom - s.clock.dom + cal.daysPerMonth) % cal.daysPerMonth || cal.daysPerMonth)) : cal.daysPerMonth);
}
function phase(s: CampaignState, ctx: OpsCtx, rift: BattleRiftState, to: RiftState["phase"]): void {
  if (rift.phase === to) return;
  rift.phase = to;
  rift.nextCheck = nextSpring(s, ctx);
  if (to === "sealed") {
    s.pressure = Math.max(0, s.pressure - worldRules(ctx).pressure.sealedRelief);
    rift.recedeDay = s.clock.day + ctx.world.require("calendar", s.calendar).daysPerMonth;
  }
  ctx.emit("RiftPhase", { rift: rift.id, phase: to, fedCount: rift.fedCount });
}
function close(s: CampaignState, ctx: OpsCtx, rift: RiftState): void {
  for (const id of [...rift.zones].sort()) reclaimNode(s, ctx, id, rift.id);
  delete rift.anchor;
  phase(s, ctx, rift, "closed");
}
function anchor(s: CampaignState, ctx: OpsCtx, rift: RiftState, fed: boolean): void {
  const def = riftDefinition(ctx, rift);
  if (def.anchor) rift.anchor = def.anchor;
  if (fed) rift.fedCount++;
  phase(s, ctx, rift, "anchored");
  blightNode(s, ctx, rift.node, rift.id);
}
export function onBattleRift(s: CampaignState, ctx: OpsCtx, riftId: string, outcome: RiftBattleOutcome): void {
  const rift = s.rifts[riftId] as BattleRiftState | undefined;
  if (!rift || rift.phase === "closed") return;
  if (outcome === "vanguard-killed" && rift.phase === "opening") close(s, ctx, rift);
  else if ((outcome === "anchor-killed" || outcome === "anchor-captured") && rift.phase === "anchored") {
    delete rift.anchor;
    phase(s, ctx, rift, "unanchored");
  } else if (outcome === "defended" && s.clock.phase === "spring" && rift.defendedDay !== s.clock.day) {
    if (rift.phase === "unanchored") { rift.defendedDay = s.clock.day; phase(s, ctx, rift, "sealing"); }
    else if (rift.phase === "sealing" && s.clock.day >= rift.nextCheck) { rift.defendedDay = s.clock.day; phase(s, ctx, rift, "sealed"); }
  } else if (outcome === "lost" && ["unanchored", "sealing"].includes(rift.phase)) anchor(s, ctx, rift, true);
}
export function riftsDaily2(s: CampaignState, ctx: OpsCtx): void {
  if (s.clock.phase !== "spring") return;
  for (const id of Object.keys(s.rifts).sort()) {
    const rift = s.rifts[id]! as BattleRiftState, def = riftDefinition(ctx, rift);
    if (rift.phase === "closed" || s.clock.day < rift.nextCheck) continue;
    if (def.selfClose && s.clock.day > rift.openedDay) { close(s, ctx, rift); continue; }
    switch (rift.phase) {
      case "opening":
        if (s.clock.day - rift.openedDay >= worldRules(ctx).rifts.openingDays) anchor(s, ctx, rift, false);
        break;
      case "anchored": {
        const count = Math.max(0, Math.floor(evalOpsNum(s, ctx, def.spreadPerTide, { rift: id })));
        const candidates = [...new Set([rift.node, ...rift.zones].flatMap(n => adjacentNodes(ctx, n)))].filter(n => !s.nodes[n]?.blight).sort();
        for (const n of candidates.slice(0, count)) blightNode(s, ctx, n, id);
        rift.anchorAge++;
        break;
      }
      case "unanchored": case "sealing": {
        // SPEC-GAP：段 2 早於當天戰鬥；有就位的封裂契約時先派防守戰，戰果決定轉移。
        const defense = Object.keys(s.contracts).sort().map(k => s.contracts[k]!).find(c =>
          ["active", "stage"].includes(c.status) && c.target.rift === id && c.deadlineDay >= s.clock.day &&
          ["seal", "defend"].includes(ctx.world.require("contract", c.template).kind));
        // 核區斷路，守軍由鄰節點出戰；浮船不必駛入核心。
        const inPosition = s.ship.at === rift.node || adjacentNodes(ctx, rift.node).includes(s.ship.at);
        if (defense && inPosition && !s.ship.route && !s.pendingBattle) {
          s.pendingBattle = { id: nextId(s, "sortie"), day: s.clock.day, node: rift.node, rift: id, contract: defense.id,
            trigger: "defend", units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: true }, injected: [] };
          ctx.emit("Encounter", { node: rift.node, rift: id, sortie: s.pendingBattle.id });
        } else if (s.pendingBattle?.rift !== id) anchor(s, ctx, rift, true);
        // 當日守軍尚未打完，不能提前把 nextCheck 改到下一潮，否則第二次勝利無法 sealed。
        if (s.pendingBattle?.rift === id) continue;
        break;
      }
      case "sealed": case "receding": {
        if (s.clock.day < (rift.recedeDay ?? rift.nextCheck)) break;
        const node = [...rift.zones].sort().find(n => def.family !== "mycelium" || s.nodes[n]?.flags.includes("burned"));
        if (node) reclaimNode(s, ctx, node, id);
        phase(s, ctx, rift, rift.zones.length ? "receding" : "closed");
        rift.recedeDay = s.clock.day + ctx.world.require("calendar", s.calendar).daysPerMonth;
        break;
      }
    }
    rift.nextCheck = nextSpring(s, ctx);
  }
}
