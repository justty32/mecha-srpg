import { placeLoc } from "../war/loc.ts";
import { placeAt } from "../war/loc.ts";
import type { CampaignState, Loc, OpsCtx, RiftDef, RiftState } from "../state/types.ts";
import { nextFloat } from "../../core/rng.ts";
import { evalOpsNum } from "../content/cond.ts";
import { nextId } from "../state/ids.ts";
import { nearbyPlaces, worldRules } from "./places.ts";
import { ensureCore, growPatch, removePatch } from "./patches.ts";

// 天象掛鉤：wf/workflows/planning/design-notes/tide-sky/mechanics.md；本線不實作規則。
export function spreadDelta(_s: CampaignState, _ctx: OpsCtx, _day: number): number { return 0; }
export function anchorInstant(_s: CampaignState, _ctx: OpsCtx, _rift: RiftState): boolean { return false; }
export type RiftHooks = { spreadDelta: typeof spreadDelta; anchorInstant: typeof anchorInstant };

export function openRift(s: CampaignState, ctx: OpsCtx, at: Loc, family: RiftDef, width: RiftState["width"]): RiftState {
  const id = nextId(s, "rift"), site = nextId(s, "rift-site"), cfg = worldRules(ctx).blight;
  const region = ctx.world.all("regions").find(r => r.map === at.map)?.regions[at.region]?.name ?? ctx.world.require("map", at.map).name;
  const name = cfg.siteName.template.replace("{region}", region).replace("{family}", cfg.siteName.families[family.family] ?? family.family);
  s.places[site] = { def: site, flags: [], wreckage: [], dyn: { id: site, name, map: at.map, at: { ...at.cell }, kind: "rift-site", services: [], tags: [] } };
  const rift: RiftState = { id, site, at: structuredClone(at), family: family.id, width, phase: "opening", openedDay: s.clock.day,
    anchorAge: 0, patches: [], fedCount: 0, nextCheck: nextSpring(s, ctx) };
  s.rifts[id] = rift; ensureCore(s, ctx, rift);
  ctx.emit("RiftPhase", { rift: id, node: site, phase: "opening" });
  return rift;
}

export type RiftBattleOutcome = "anchor-killed" | "anchor-captured" | "defended" | "lost" | "vanguard-killed" | "repelled";
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
  for (const id of [...rift.patches].reverse()) removePatch(s, ctx, id);
  delete rift.anchor;
  phase(s, ctx, rift, "closed");
  // 目標消失後撤下尚未接取的同裂縫契約，避免舊快照繼續提供重複清剿。
  for (const id of Object.keys(s.contracts).sort()) {
    const contract = s.contracts[id]!;
    if (contract.target.rift !== rift.id || contract.status !== "offered") continue;
    contract.status = "expired"; contract.settled = true;
    ctx.emit("ContractExpired", { contract: id, rift: rift.id });
  }
  const site = s.places[rift.site];
  if (site?.dyn?.kind === "rift-site") {
    const cfg = worldRules(ctx).blight;
    if (nextFloat(s.rng) < cfg.ruinChance) {
      site.dyn.kind = "ruin";
      site.dyn.ruin = { depth: 1, discovered: true, seedTable: ctx.world.require("event", cfg.seedTables[riftDefinition(ctx, rift).family] ?? "event/ruin-entry").id };
    } else delete s.places[rift.site];
  }
}
function anchor(s: CampaignState, ctx: OpsCtx, rift: RiftState, fed: boolean): void {
  const def = riftDefinition(ctx, rift);
  if (def.anchor) rift.anchor = def.anchor;
  if (fed) rift.fedCount++;
  phase(s, ctx, rift, "anchored");
  ensureCore(s, ctx, rift, 1);
}
export function onBattleRift(s: CampaignState, ctx: OpsCtx, riftId: string, outcome: RiftBattleOutcome): void {
  const rift = s.rifts[riftId] as BattleRiftState | undefined;
  if (!rift || rift.phase === "closed") return;
  if ((outcome === "vanguard-killed" || outcome === "repelled") && rift.phase === "opening") close(s, ctx, rift);
  else if (outcome === "repelled" && rift.phase === "anchored") {
    // SPEC-GAP：跳過最近一次待處理大潮；同潮重打不疊加延後，錨與 phase 保留。
    const cal = ctx.world.require("calendar", s.calendar);
    const due = s.clock.phase === "spring" && rift.nextCheck <= s.clock.day ? s.clock.day : nextSpring(s, ctx);
    const dom = (s.clock.dom - 1 + due - s.clock.day) % cal.daysPerMonth + 1;
    const after = nextSpring({ ...s, clock: { ...s.clock, day: due, dom } }, ctx);
    rift.nextCheck = Math.max(rift.nextCheck, after);
  }
  else if ((outcome === "anchor-killed" || outcome === "anchor-captured") && rift.phase === "anchored") {
    delete rift.anchor;
    phase(s, ctx, rift, "unanchored");
  } else if (outcome === "defended" && s.clock.phase === "spring" && rift.defendedDay !== s.clock.day) {
    if (rift.phase === "unanchored") { rift.defendedDay = s.clock.day; phase(s, ctx, rift, "sealing"); }
    else if (rift.phase === "sealing" && s.clock.day >= rift.nextCheck) { rift.defendedDay = s.clock.day; phase(s, ctx, rift, "sealed"); }
  } else if (outcome === "lost" && ["unanchored", "sealing"].includes(rift.phase)) anchor(s, ctx, rift, true);
}
export function riftsDaily2(s: CampaignState, ctx: OpsCtx, hooks: RiftHooks = { spreadDelta, anchorInstant }): void {
  for (const id of Object.keys(s.rifts).sort()) {
    const rift = s.rifts[id]! as BattleRiftState, def = riftDefinition(ctx, rift);
    if (rift.phase === "closed") continue;
    if (rift.phase === "opening" && (hooks.anchorInstant(s, ctx, rift) || s.clock.day - rift.openedDay >= worldRules(ctx).rifts.openingDays) && !def.selfClose) {
      anchor(s, ctx, rift, false); continue;
    }
    if (s.clock.phase !== "spring" || s.clock.day < rift.nextCheck) continue;
    if (def.selfClose && s.clock.day > rift.openedDay) { close(s, ctx, rift); continue; }
    switch (rift.phase) {
      case "opening":
        if (s.clock.day - rift.openedDay >= worldRules(ctx).rifts.openingDays) anchor(s, ctx, rift, false);
        break;
      case "anchored": {
        const base = def.family === "mycelium" ? worldRules(ctx).blight.myceliumPerTide : evalOpsNum(s, ctx, def.spreadPerTide, { rift: id });
        const count = Math.max(0, Math.floor(base + hooks.spreadDelta(s, ctx, s.clock.day)));
        for (let n = 0; n < count; n++) if (!growPatch(s, ctx, rift)) break;
        rift.anchorAge++;
        break;
      }
      case "unanchored": case "sealing": {
        // SPEC-GAP：段 2 早於當天戰鬥；有就位的封裂契約時先派防守戰，戰果決定轉移。
        const defense = Object.keys(s.contracts).sort().map(k => s.contracts[k]!).find(c =>
          ["active", "stage"].includes(c.status) && c.target.rift === id && c.deadlineDay >= s.clock.day &&
          ["seal", "defend"].includes(ctx.world.require("contract", c.template).kind));
        // 核區斷路，守軍由鄰節點出戰；浮船不必駛入核心。
        const inPosition = (placeAt(s, ctx, s.ship.pos) ?? "") === rift.site || nearbyPlaces(s, ctx, rift.site).includes((placeAt(s, ctx, s.ship.pos) ?? ""));
        if (defense && inPosition && !s.ship.path && !s.pendingBattle) {
          s.pendingBattle = { id: nextId(s, "sortie"), day: s.clock.day, place: rift.site, loc: placeLoc(s, ctx, rift.site), rift: id, contract: defense.id,
            trigger: "defend", units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: placeAt(s, ctx, s.ship.pos) === rift.site }, injected: [] };
          ctx.emit("Encounter", { node: rift.site, rift: id, sortie: s.pendingBattle.id });
        } else if (s.pendingBattle?.rift !== id) anchor(s, ctx, rift, true);
        // 當日守軍尚未打完，不能提前把 nextCheck 改到下一潮，否則第二次勝利無法 sealed。
        if (s.pendingBattle?.rift === id) continue;
        break;
      }
      case "sealed": case "receding": {
        if (s.clock.day < (rift.recedeDay ?? rift.nextCheck)) break;
        const youngest = s.patches[rift.patches.at(-1) ?? ""];
        if (youngest && (def.family !== "mycelium" || youngest.burned)) removePatch(s, ctx, youngest.id);
        if (rift.patches.length) phase(s, ctx, rift, "receding");
        else close(s, ctx, rift);
        rift.recedeDay = s.clock.day + ctx.world.require("calendar", s.calendar).daysPerMonth;
        break;
      }
    }
    rift.nextCheck = nextSpring(s, ctx);
  }
}
