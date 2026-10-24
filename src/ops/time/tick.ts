import { blightedCells } from "../world/blight.ts";
import { placeAt } from "../war/loc.ts";
import { pickWeighted } from "../../core/rng.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { clock } from "../state/clock.ts";
import { evalOpsCond, evalOpsNum } from "../content/cond.ts";
import { worldDaily2, moveDaily3, marketsDaily7, resupplyDaily7 } from "../world/index.ts";
import { contractsDaily2, contractsDaily7 } from "../contracts/index.ts";
import { restraintDaily5, shipDaily5, ledgerDaily6, recruitsDaily7, rosterDaily7 } from "../crew/index.ts";

// SPEC-GAP：用可序列化續點區分「當日後半」與尚未開始的 pendingTicks。
export type TimeState = CampaignState & { time?: { resume: 5 }; waitRemaining?: number };
export type TickCtx = OpsCtx & { onDay?: (s: CampaignState) => void };
export function stageCtx(ctx: OpsCtx, stage: number): OpsCtx {
  return { ...ctx, emit: (type, payload) => ctx.emit(type, { ...payload, stage }) };
}
export function offerEvent(s: CampaignState, ctx: OpsCtx, id: string): void {
  const event = ctx.world.require("event", id);
  s.pendingChoices.push({ event: event.id, text: event.text, choices: structuredClone(event.choices) });
  ctx.emit("EventOffered", { event: event.id, node: (placeAt(s, ctx, s.ship.pos) ?? "") });
}
export function queuedEvents(s: CampaignState, ctx: OpsCtx): void {
  while (!s.pendingChoices.length && s.pendingEvents.length) offerEvent(s, ctx, s.pendingEvents.shift()!);
}
function eventsDaily4(s: CampaignState, ctx: OpsCtx): void {
  queuedEvents(s, ctx);
  if (s.pendingChoices.length) return;
  const all = ctx.world.all("event");
  // SPEC-GAP：next 的目標只由鏈進入，避免催收續篇每天獨立抽到。
  const chained = new Set(all.flatMap(e => [e.next, ...e.choices.map(c => c.next)].filter((id): id is string => !!id)));
  const cards = all.filter(e => !chained.has(e.id) && (e.where === "ship" || e.where === (s.ship.path?.lane ? "lane" : placeAt(s, ctx, s.ship.pos) && !s.ship.path ? "place" : "field")) &&
    evalOpsCond(s, ctx, e.when, { node: (placeAt(s, ctx, s.ship.pos) ?? "") })).map(event => ({ event, weight: evalOpsNum(s, ctx, event.weight, { node: (placeAt(s, ctx, s.ship.pos) ?? "") }) })).filter(c => c.weight > 0);
  if (cards.length) offerEvent(s, ctx, pickWeighted(s.rng, cards, c => c.weight).event.id);
}
export function dailySummary(s: CampaignState, ctx: OpsCtx) {
  const bays = [...new Set(s.hangar.bays.filter((id): id is string => id !== null))];
  return { ...(s.operations ? { operations: Object.values(s.operations).filter(o => !["done", "failed", "aborted"].includes(o.phase)).length, war: Object.values(s.relations ?? {}).filter(r => r.state === "war").length, allied: Object.values(s.relations ?? {}).filter(r => r.state === "allied").length, released: Object.values(s.models ?? {}).filter(m => m.releasedDay !== undefined).length, joins: s.log.filter(e => e.type === "ContractAccepted" && e.payload.kind === "join").length } : {}), cash: s.ledger.balances.cash, debt: s.ledger.balances.debt, persons: Object.keys(s.roster.persons).length,
    beasts: Object.keys(s.restraint.beasts).length,
    blighted: blightedCells(s),
    rifts: Object.values(s.rifts).filter(r => r.phase !== "closed").length };
}
function finishDay(s: TimeState, ctx: TickCtx): void {
  shipDaily5(s, stageCtx(ctx, 5));
  restraintDaily5(s, stageCtx(ctx, 5));
  ledgerDaily6(s, stageCtx(ctx, 6));
  const seventh = stageCtx(ctx, 7);
  contractsDaily7(s, seventh); marketsDaily7(s, seventh); resupplyDaily7(s, seventh); recruitsDaily7(s, seventh); rosterDaily7(s, seventh);
  delete s.time;
  stageCtx(ctx, 8).emit("DaySummary", dailySummary(s, ctx));
  ctx.onDay?.(s);
}
// tick 的契約為就地編排；外層 applyCommand 擁有 clone 與拒絕回滾。
export function tick(s: TimeState, ctx: TickCtx): void {
  if (s.pendingChoices.length || s.pendingBattle) return;
  if (s.time) { finishDay(s, ctx); return; }
  s.clock = clock(s.clock.day + 1, ctx.world.require("calendar", s.calendar));
  s.flags.anchorable = s.clock.phase === "spring" ? 1 : 0;
  stageCtx(ctx, 1).emit("DayStart", { month: s.clock.month, dom: s.clock.dom });
  const second = stageCtx(ctx, 2);
  worldDaily2(s, second); contractsDaily2(s, second);
  moveDaily3(s, stageCtx(ctx, 3));
  eventsDaily4(s, stageCtx(ctx, 4));
  s.time = { resume: 5 };
  if (!s.pendingChoices.length) finishDay(s, ctx);
}
export function advanceDays(s: TimeState, ctx: TickCtx, n: number): void {
  if (!Number.isSafeInteger(n) || n < 0 || !Number.isSafeInteger(s.pendingTicks + n)) throw new RangeError("invalid-days");
  s.waitRemaining = (s.waitRemaining ?? 0) + n;
  while (!s.pendingChoices.length && !s.pendingBattle && (s.time || s.waitRemaining > 0)) {
    if (!s.time) { s.waitRemaining--; if (s.ship.path) s.pendingTicks = Math.max(0, s.pendingTicks - 1); }
    tick(s, ctx);
    if (s.log.some(e => e.type === "CampaignEnd")) { s.pendingTicks = 0; s.waitRemaining = 0; break; }
  }
  if (!s.waitRemaining) delete s.waitRemaining;
}
