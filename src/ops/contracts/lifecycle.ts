import { placeDef, requirePlace } from "../world/places.ts";
import type { CampaignState, ContractState, ContractTemplate, OpsCommand, OpsCtx } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import { evalOpsNum } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";
import { negotiate, negotiationPolicy } from "./negotiate.ts";
import { settleContract } from "./tally.ts";
import { acceptJoin, dropJoin } from "../war/merc.ts";
import { chebyshev, footprintOf } from "../world/grid.ts";
import { worldRules } from "../world/places.ts";
import { shortestPath } from "../world/move.ts";
import { blightAt } from "../world/blight.ts";

export type CmdResult = { ok: true } | { ok: false; error: string };
// SPEC-GAP：行動牌生成請求需保留 actor 脈絡；地基原佇列只有 template/near。
export type ContractRequest = CampaignState["pendingContracts"][number] & { issuer?: string; rift?: string; place?: string };
export type ContractsState = CampaignState & { contractsRepMonth?: number };
function eligible(s: CampaignState, ctx: OpsCtx, template: ContractTemplate, issuer: string): boolean {
  const faction = s.factions[issuer], def = ctx.world.get("faction-ops", issuer);
  return !!faction?.alive && !!def && template.issuerKinds.includes(faction.scaleNow) && faction.rep >= template.requiresRep && def.contractKinds.includes(template.id);
}
export function offerContract(s: CampaignState, ctx: OpsCtx, templateId: string, issuerId: string, target: { place: string; rift?: string }): ContractState | undefined {
  const template = ctx.world.get("contract", templateId), issuer = ctx.world.get("faction-ops", issuerId), node = placeDef(s, ctx, (target.rift ? s.rifts[target.rift]?.site : undefined) ?? target.place);
  if (!template || !issuer || !node || !eligible(s, ctx, template, issuer.id)) return undefined;
  const rift = target.rift ? s.rifts[target.rift] : undefined;
  if (!rift && ["clear", "seal", "reclaim"].includes(template.kind)) return undefined;
  if (target.rift && (!rift || !template.gradeRange.includes(rift.width) || ["closed", "sealed", "receding"].includes(rift.phase))) return undefined;
  const family = rift ? ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(d => d.family === rift.family) : undefined;
  const scope = { faction: issuer.id, node: node.id, ...(rift ? { rift: rift.id } : {}) };
  const total = evalOpsNum(s, ctx, template.pay.base, scope), perHead = template.pay.perHead === undefined ? 0 : evalOpsNum(s, ctx, template.pay.perHead, scope);
  const deadline = s.clock.day + Math.ceil(evalOpsNum(s, ctx, template.deadlineDays, scope));
  if (![total, perHead, deadline].every(Number.isFinite) || total < 0 || perHead < 0 || deadline < s.clock.day) return undefined;
  const id = nextId(s, "contract");
  const contract: ContractState = { id, template: template.id, issuer: issuer.id, target: { place: node.id, ...(rift ? { rift: rift.id,
    snapshot: { family: family?.family ?? rift.family, width: rift.width, depth: blightAt(s, ctx, rift.at)?.depth ?? "shallow",
      anchorAge: rift.anchorAge, monsters: [...(family?.monsters ?? [])], phase: rift.phase } } : {}) },
    status: "offered", terms: { total, advance: 0, perHead }, paidAdvance: false, heads: {}, offeredDay: s.clock.day, deadlineDay: deadline, stageIdx: 0, annoyance: 0 };
  s.contracts[id] = contract;
  ctx.emit("ContractOffered", { contract: id, issuer: issuer.id, node: node.id });
  return contract;
}
function issuerPlaces(s: CampaignState, ctx: OpsCtx, issuer: string): string[] {
  return [...new Set([...s.factions[issuer]!.territoryNow, ...(ctx.world.require("faction-ops", issuer).presence ?? [])])];
}
function nearby(s: CampaignState, ctx: OpsCtx, issuer: string, node: string): boolean {
  const territory = issuerPlaces(s, ctx, issuer);
  const target = requirePlace(s, ctx, node);
  return territory.includes(node) || territory.some(id => {
    const home = placeDef(s, ctx, id);
    return !!home && home.map === target.map && footprintOf(home).some(a => footprintOf(target).some(b => chebyshev(a, b) <= worldRules(ctx).grid.nearbyRadius));
  });
}
export function contractsDaily2(s: CampaignState, ctx: OpsCtx): void {
  // SPEC-GAP：本線契約以交接書為準，只撤銷失守城邦尚未接取的委託。
  for (const c of Object.values(s.contracts)) if (c.status === "offered" && s.places[c.target.place]?.flags.includes("blight-lost")) {
    c.status = "expired"; c.settled = true; ctx.emit("ContractExpired", { contract: c.id, place: c.target.place });
  }
  // muster 已建立的參戰契約沿用原作戰與補給條款，只套用雇主選用的具名模板。
  // 不另外發 join；可選模板仍守 issuerKinds／聲望／contractKinds 門檻。
  for (const c of Object.values(s.contracts)) {
    if (!c.operation || c.status !== "offered" || c.offeredDay !== s.clock.day || !c.merc) continue;
    const template = ctx.world.require("faction-ops", c.issuer).contractKinds.map(id => ctx.world.get("contract", id))
      .find(t => t?.kind === "join" && t.join && eligible(s, ctx, t, c.issuer));
    if (template?.join) {
      c.template = template.id;
      c.merc.terms = { ...structuredClone(template.join), supply: c.merc.terms.supply, share: c.merc.terms.share };
      c.terms.total = evalOpsNum(s, ctx, template.pay.base, { faction: c.issuer, node: c.target.place });
    }
  }
  // SPEC-GAP：world 不依賴 contracts；段 2 在 actionsDaily2 之後呼叫此函式，消化契約部分，事件佇列留段 4。
  const requests = s.pendingContracts.splice(0) as ContractRequest[];
  for (const request of requests) {
    const template = ctx.world.get("contract", request.template);
    if (!template) continue;
    const issuers = (request.issuer ? [request.issuer] : Object.keys(s.factions).sort((a, b) => Number(!s.factions[a]!.territoryNow.length) - Number(!s.factions[b]!.territoryNow.length) || a.localeCompare(b))).filter(id => eligible(s, ctx, template, id));
    for (const issuer of issuers) {
      const explicitNode = request.place ?? (request.near && request.near !== "territory" ? placeDef(s, ctx, request.near)?.id : undefined);
      const targets = request.rift ? [s.rifts[request.rift]].filter(r => !!r) : Object.keys(s.rifts).sort().map(id => s.rifts[id]!).filter(r =>
        !["closed", "sealed", "receding"].includes(r.phase) && template.gradeRange.includes(r.width) && (!explicitNode || r.site === explicitNode) && (request.near !== "territory" || nearby(s, ctx, issuer, r.site)));
      const needsRift = ["clear", "seal", "reclaim"].includes(template.kind);
      const rift = request.rift || needsRift ? targets[0] : undefined;
      const node = rift?.site ?? explicitNode ?? (!needsRift ? issuerPlaces(s, ctx, issuer)
        .filter(id => !s.places[id]?.flags.includes("blight-lost") && shortestPath(s, ctx, s.ship.pos, id)).sort()[0] : undefined);
      if (!node || !rift && needsRift || template.kind === "join") continue;
      const duplicate = Object.keys(s.contracts).sort().some(id => { const c = s.contracts[id]!; return c.template === template.id && c.issuer === issuer && c.target.place === node && ["offered", "active", "stage"].includes(c.status); });
      if (!duplicate && offerContract(s, ctx, template.id, issuer, { place: node, ...(rift ? { rift: rift.id } : {}) })) break;
    }
  }
}
export function cmdBoard(s: CampaignState, _ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "board" }>): CmdResult {
  return cmd.contract && !s.contracts[cmd.contract] ? { ok: false, error: "unknown-contract" } : { ok: true };
}
export function cmdAccept(s: CampaignState, ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "accept" }>): CmdResult {
  const c = s.contracts[cmd.contract];
  if (!c || c.status !== "offered") return { ok: false, error: "not-offered" };
  if (s.clock.day > c.deadlineDay) return { ok: false, error: "expired" };
  if (!shortestPath(s, ctx, s.ship.pos, c.target.place)) return { ok: false, error: "unreachable" };
  const template = ctx.world.require("contract", c.template);
  if (template.kind === "join") return acceptJoin(s, ctx, c, cmd.ask);
  if (!eligible(s, ctx, template, c.issuer)) return { ok: false, error: "issuer-unavailable" };
  if (cmd.ask) {
    const policy = negotiationPolicy(ctx);
    const result = negotiate({ contract: c, issuerRep: s.factions[c.issuer]!.rep, advanceMax: template.advanceMax, annoyanceMax: template.annoyanceMax ?? policy.annoyanceMax, policy }, cmd.ask, s.rng);
    s.contracts[c.id] = result.state.contract; s.factions[c.issuer]!.rep = result.state.issuerRep; s.rng = result.rng;
    ctx.emit(result.withdrawn ? "ContractCancelled" : "ContractNegotiated", { contract: c.id, success: result.success ? 1 : 0, annoyance: result.state.contract.annoyance });
    return { ok: true };
  }
  c.status = "active";
  const ref = eventRef(ctx.emit("ContractAccepted", { contract: c.id }));
  if (!c.paidAdvance && c.terms.advance > 0) post(s, ctx, { account: "cash", delta: c.terms.advance, reason: "contract-advance", ref });
  c.paidAdvance = true;
  return { ok: true };
}
export function cmdDrop(s: CampaignState, ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "drop" }>): CmdResult {
  const c = s.contracts[cmd.contract];
  if (!c || c.settled || !["active", "stage"].includes(c.status)) return { ok: false, error: "not-active" };
  if (ctx.world.require("contract", c.template).kind === "join") { dropJoin(s, ctx, c); return { ok: true }; }
  c.status = "cancelled"; c.settled = true;
  const ref = eventRef(ctx.emit("ContractCancelled", { contract: c.id }));
  if (c.paidAdvance && c.terms.advance > 0) {
    const recover = Math.min(c.terms.advance, Math.max(0, s.ledger.balances.cash));
    if (recover > 0) post(s, ctx, { account: "cash", delta: -recover, reason: "advance-recovery", ref });
    const debt = c.terms.advance - recover;
    if (debt > 0) post(s, ctx, { account: "debt", delta: debt, reason: "advance-recovery", ref });
  }
  applyOpsEffects(s, ctx, ctx.world.require("contract", c.template).onCancel, { contract: c.id, faction: c.issuer, node: c.target.place, ...(c.target.rift ? { rift: c.target.rift } : {}) });
  return { ok: true };
}
export function contractsDaily7(s: CampaignState, ctx: OpsCtx): void {
  for (const id of Object.keys(s.contracts).sort()) {
    const c = s.contracts[id]!;
    if (s.clock.day <= c.deadlineDay || c.settled) continue;
    if (c.status === "offered") { c.status = "expired"; c.settled = true; ctx.emit("ContractExpired", { contract: id }); }
    else if (["active", "stage"].includes(c.status)) settleContract(s, ctx, id, "failed");
  }
  const state = s as ContractsState;
  if (s.clock.dom === 1 && s.clock.day > 0 && state.contractsRepMonth !== s.clock.month) {
    for (const id of Object.keys(s.factions).sort()) { const f = s.factions[id]!; f.rep -= Math.sign(f.rep); }
    state.contractsRepMonth = s.clock.month;
  }
}
