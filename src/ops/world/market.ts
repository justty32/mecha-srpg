import { nextInt, pickWeighted } from "../../core/rng.ts";
import type { Account, CampaignState, MarketDef, OpsCommand, OpsCtx } from "../state/types.ts";
import { evalOpsNum } from "../content/cond.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { nextId } from "../state/ids.ts";
import { isAccount, post } from "../state/ledger.ts";
import { worldRules } from "./nodes.ts";
import type { CmdResult } from "./nodes.ts";

type MarketItem = MarketDef["lists"][number]["items"][number];
type Listing = { kind: MarketDef["lists"][number]["kind"]; item: MarketItem };
// SPEC-GAP：市場庫存與刷新日未入 CampaignState，採延遲初始化、可 JSON 化的局部擴充。
export type MarketState = CampaignState & { markets?: Record<string, { refreshedDay: number; stock: Record<string, number> }> };
function listings(market: MarketDef): Listing[] { return market.lists.flatMap(list => list.items.map(item => ({ kind: list.kind, item }))).sort((a, b) => a.item.def < b.item.def ? -1 : a.item.def > b.item.def ? 1 : 0); }
export function marketPrice(s: CampaignState, ctx: OpsCtx, market: MarketDef, item: MarketItem, condition = 1): number {
  const cfg = worldRules(ctx).market, node = s.nodes[market.node], def = ctx.world.require("node", market.node);
  const owner = node?.ownerOverride ?? def.owner;
  const faction = ctx.world.all("faction-ops").find(f => f.faction === owner);
  const rep = faction ? s.factions[faction.id]?.rep ?? 0 : 0;
  let price = (item.basePrice ?? 0) * Math.max(0, Math.min(1, condition)) * Math.max(cfg.minimumMultiplier, 1 - rep * cfg.repDiscount);
  for (const mod of market.priceMods) if (node?.flags.includes(mod.tag)) price *= evalOpsNum(s, ctx, mod.mult, { node: market.node, ...(faction ? { faction: faction.id } : {}) });
  return Math.max(0, price);
}
function defaultStock(market: MarketDef): Record<string, number> {
  return Object.fromEntries(listings(market).map(({ item }) => [item.def, item.stockMax]));
}
export function marketsDaily7(s: CampaignState, ctx: OpsCtx): void {
  const state = s as MarketState;
  for (const market of ctx.world.all("market")) {
    const old = state.markets?.[market.id];
    if (old && (s.clock.phase !== "neap" || old.refreshedDay === s.clock.day)) continue;
    const stock = defaultStock(market);
    if (s.clock.phase === "neap") {
      for (const id of Object.keys(stock).sort()) stock[id] = 0;
      for (const list of market.lists) {
        const pool = [...list.items].filter(i => i.weight > 0 && i.stockMax > 0).sort((a, b) => a.def < b.def ? -1 : a.def > b.def ? 1 : 0);
        for (let i = 0; i < pool.length; i++) {
          const item = pickWeighted(s.rng, pool, item => item.weight);
          stock[item.def] = Math.min(item.stockMax, stock[item.def]! + 1 + nextInt(s.rng, item.stockMax));
        }
      }
    }
    (state.markets ??= {})[market.id] = { refreshedDay: s.clock.day, stock };
  }
}
function physicalCondition(s: CampaignState, ctx: OpsCtx, id: string): number {
  const component = s.inventory.components.find(c => c.id === id);
  if (component) {
    const def = ctx.db.require("component", component.def), hp = def.hp ?? def.layersAdd?.reduce((sum, l) => sum + l.layer.hp, 0);
    return component.layerHp === undefined || !hp ? 1 : component.layerHp / hp;
  }
  const mech = s.mechs[id];
  if (!mech) return 1;
  const body = ctx.db.require("bodyplan", ctx.db.require("frame", mech.frame).bodyPlan);
  const maximum = body.parts.reduce((sum, p) => sum + p.layers.reduce((n, l) => n + l.hp, 0), 0);
  const current = Object.keys(mech.parts).sort().reduce((sum, p) => sum + mech.parts[p]!.layers.reduce((n, l) => n + Math.max(0, l.hp), 0), 0);
  return (maximum ? current / maximum : 1) * worldRules(ctx).market.frameReadiness;
}
export function cmdTrade(s: CampaignState, ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "trade" }>): CmdResult {
  const market = ctx.world.get("market", cmd.market);
  if (!market) return { ok: false, error: "unknown-market" };
  if (s.ship.at !== market.node || s.ship.route || (s as CampaignState & { drifting?: boolean }).drifting) return { ok: false, error: "not-docked" };
  if (s.pendingBattle || s.pendingChoices.length) return { ok: false, error: "pending-encounter" };
  if ((cmd.sell?.length ?? 0) && !market.buysBack) return { ok: false, error: "no-buyback" };
  const items = listings(market), state = s as MarketState;
  const stock = { ...(state.markets?.[market.id]?.stock ?? defaultStock(market)) }, balances = { ...s.ledger.balances };
  const physicalSold = new Set<string>();
  const trades: { buy: boolean; id: string; listing: Listing; price: number; account: Account; physical: boolean }[] = [];
  for (const buy of [false, true]) for (const id of (buy ? cmd.buy : cmd.sell) ?? []) {
    const component = !buy ? s.inventory.components.find(c => c.id === id) : undefined, mech = !buy ? s.mechs[id] : undefined;
    const ref = component?.def ?? mech?.frame ?? id;
    const listing = items.find(i => i.item.def === ref || ctx.db.get("component", ref)?.id === i.item.def || ctx.db.get("frame", ref)?.id === i.item.def);
    if (!listing || listing.item.basePrice === undefined) return { ok: false, error: "unknown-item" };
    const physical = ["component", "frame"].includes(listing.kind);
    if (!physical && (!isAccount(listing.item.def) || !listing.item.def.startsWith("stock:"))) return { ok: false, error: "unsupported-item" };
    if (physical && !buy) {
      if ((!component && !mech) || physicalSold.has(id) || component?.boundTo || mech && (!s.inventory.mechs.includes(id) || Object.values(mech.seats).some(Boolean) || s.jobs.some(j => j.target === id) || s.restraint.slots.includes(id))) return { ok: false, error: "item-unavailable" };
      physicalSold.add(id);
    }
    // SPEC-GAP：有身分的實物不在存量帳；以零數量 stock:inventory 對帳，實體仍只存 Inventory。
    const account: Account = physical ? "stock:inventory" : listing.item.def as Account;
    const price = marketPrice(s, ctx, market, listing.item, buy ? 1 : physicalCondition(s, ctx, id));
    if (!Number.isFinite(price)) return { ok: false, error: "invalid-price" };
    if (buy) {
      if ((stock[listing.item.def] ?? 0) < 1) return { ok: false, error: "out-of-stock" };
      stock[listing.item.def]!--;
    } else if (!physical && (balances[account] ?? 0) < 1) return { ok: false, error: "insufficient-stock" };
    balances.cash += buy ? -price : price;
    if (!physical) balances[account] = (balances[account] ?? 0) + (buy ? 1 : -1);
    trades.push({ buy, id, listing, price, account, physical });
  }
  if (balances.cash < 0 && trades.some(t => t.buy)) return { ok: false, error: "insufficient-cash" };
  for (const t of trades) {
    post(s, ctx, { account: "cash", delta: t.buy ? -t.price : t.price, counter: t.account, reason: "trade" });
    post(s, ctx, { account: t.account, delta: t.physical ? 0 : t.buy ? 1 : -1, counter: "cash", reason: "trade" });
    if (t.physical && t.buy) {
      const id = nextId(s, t.listing.kind === "frame" ? "mech" : "component");
      if (t.listing.kind === "component") s.inventory.components.push({ id, def: t.listing.item.def, origin: "bought" });
      else {
        s.mechs[id] = instantiateMech(ctx.db, id, t.listing.item.def); s.inventory.mechs.push(id);
        const empty = s.hangar.bays.indexOf(null); if (empty < 0) s.hangar.bays.push(id); else s.hangar.bays[empty] = id;
      }
    } else if (t.physical) {
      s.inventory.components = s.inventory.components.filter(c => c.id !== t.id);
      s.inventory.mechs = s.inventory.mechs.filter(id => id !== t.id); delete s.mechs[t.id];
      s.hangar.bays = s.hangar.bays.map(id => id === t.id ? null : id); s.hangar.dormant = s.hangar.dormant.filter(id => id !== t.id);
      for (const room of Object.keys(s.ship.rooms).sort()) s.ship.rooms[room]!.items = s.ship.rooms[room]!.items.filter(id => id !== t.id);
    }
    if (t.account === "stock:fuel") s.ship.fuel.cur = Math.min(s.ship.fuel.max, s.ledger.balances["stock:fuel"] ?? 0);
  }
  (state.markets ??= {})[market.id] = { refreshedDay: state.markets?.[market.id]?.refreshedDay ?? s.clock.day, stock };
  return { ok: true };
}
