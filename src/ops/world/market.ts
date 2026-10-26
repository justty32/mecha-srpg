import { isDocked } from "../world/move.ts";
import { placeAt } from "../war/loc.ts";
import { requirePlace } from "../world/places.ts";
import { nextInt, pickWeighted } from "../../core/rng.ts";
import type { Account, CampaignState, MarketDef, OpsCommand, OpsCtx } from "../state/types.ts";
import { evalOpsNum } from "../content/cond.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { nextId } from "../state/ids.ts";
import { isAccount, post } from "../state/ledger.ts";
import { worldRules } from "./places.ts";
import type { CmdResult } from "./places.ts";
import type { ModelDef } from "../war/types.ts";
import { factionId, hasTreaty } from "../war/relations.ts";
import { isModelGeneric, leakModel, modelVisibleAt, repGate, repGateBlocked } from "../war/rnd.ts";

type MarketItem = MarketDef["lists"][number]["items"][number];
type MarketFilter = NonNullable<MarketDef["lists"][number]["filters"]>[number];
type FixedItem = MarketItem & { model?: string; imported?: boolean };
type Listing = { kind: MarketDef["lists"][number]["kind"]; item: FixedItem };
// SPEC-GAP：市場庫存與刷新日未入 CampaignState，採延遲初始化、可 JSON 化的局部擴充。
export type MarketState = CampaignState & { markets?: Record<string, { refreshedDay: number; stock: Record<string, number>; dynamic?: Listing[] }> };
function tradePartners(s: CampaignState, ctx: OpsCtx, market: MarketDef): string[] {
  const raw = s.places[market.place]?.ownerOverride ?? requirePlace(s, ctx, market.place).owner;
  const owner = raw ? factionId(s, ctx, raw) : Object.keys(s.factions).find(id => s.factions[id]!.territoryNow.includes(market.place));
  return Object.values(s.relations ?? {}).filter(r => (r.a === owner || r.b === owner) && hasTreaty(s, ctx, r, "trade"))
    .map(r => r.a === owner ? r.b : r.a).sort();
}
function matches(ctx: OpsCtx, model: ModelDef, item: MarketFilter): boolean {
  const { lineage, maker, tierMax } = item.filter;
  return (!lineage || ctx.world.get("lineage", lineage)?.id === model.lineage) &&
    (!maker || maker === model.maker || ctx.world.get("faction-ops", maker)?.faction === model.maker || ctx.db.get("faction", maker)?.id === model.maker) &&
    ["D", "C", "B", "A", "S", "SS", "SSS"].indexOf(model.tier) <= ["D", "C", "B", "A", "S", "SS", "SSS"].indexOf(tierMax);
}
function marketModelVisible(s: CampaignState, ctx: OpsCtx, model: ModelDef, place: string): boolean {
  return modelVisibleAt(s, ctx, model, place) || model.role !== "captain" &&
    s.models?.[model.id]?.releasedDay !== undefined && repGate(s, ctx, model) !== undefined && !repGateBlocked(s, ctx, model);
}
function frameRepBlocked(s: CampaignState, ctx: OpsCtx, item: FixedItem): boolean {
  if (item.model) return !!repGateBlocked(s, ctx, ctx.world.require("model", item.model));
  const models = ctx.world.all("model").filter(m => m.frame === item.def);
  if (!models.length || models.some(m => repGate(s, ctx, m) === undefined)) return false;
  const easiest = models.sort((a, b) => repGate(s, ctx, a)! - repGate(s, ctx, b)! || a.id.localeCompare(b.id))[0]!;
  return !!repGateBlocked(s, ctx, easiest);
}
/** 唯讀購買門檻；固定機架沿用交易的最低門檻與通用登記豁免。 */
export function marketReputation(s: CampaignState, ctx: OpsCtx, item: FixedItem): { faction: string; need: number; have: number; blocked: boolean } | null {
  const models = item.model ? [ctx.world.require("model", item.model)] : ctx.world.all("model").filter(m => m.frame === item.def);
  if (!models.length || models.some(m => repGate(s, ctx, m) === undefined)) return null;
  const model = [...models].sort((a, b) => repGate(s, ctx, a)! - repGate(s, ctx, b)! || a.id.localeCompare(b.id))[0]!;
  const blocked = repGateBlocked(s, ctx, model);
  if (blocked) return { ...blocked, blocked: true };
  const faction = factionId(s, ctx, model.maker) ?? model.maker;
  return { faction, need: repGate(s, ctx, model)!, have: s.factions[faction]?.rep ?? 0, blocked: false };
}
function listings(s: CampaignState, ctx: OpsCtx, market: MarketDef, resale = false, includeImports = true): Listing[] {
  const result: Listing[] = [];
  for (const list of market.lists) {
    for (const item of list.items) result.push({ kind: list.kind, item });
    if (list.kind !== "frame") continue;
    for (const item of list.filters ?? []) for (const model of ctx.world.all("model")) if (matches(ctx, model, item) && (resale || marketModelVisible(s, ctx, model, market.place))) {
      result.push({ kind: "frame", item: { def: model.frame, weight: item.weight, stockMax: item.stockMax, ...(item.basePrice === undefined ? {} : { basePrice: item.basePrice }), model: model.id } });
    }
  }
  const partners = includeImports ? tradePartners(s, ctx, market) : [];
  if (partners.length) {
    // SPEC-GAP：條約沒有專屬報價；沿用內容中第一份可售的 frame 篩選器報價與庫存。
    const template = ctx.world.all("market").flatMap(m => m.lists.filter(l => l.kind === "frame").flatMap(l => l.filters ?? [])).find(i => i.basePrice !== undefined);
    if (template) for (const model of ctx.world.all("model")) {
      const maker = factionId(s, ctx, model.maker);
      const released = s.models?.[model.id]?.releasedDay !== undefined || Object.values(s.factions).some(f => f.rnd?.released.includes(model.id));
      if (!maker || !partners.includes(maker) || !released || model.role === "captain" || model.exportPolicy === "restricted" && !isModelGeneric(s, model)) continue;
      const existing = result.find(l => l.item.def === model.frame);
      if (existing) existing.item = { ...existing.item, imported: true };
      else result.push({ kind: "frame", item: { def: model.frame, weight: template.weight, stockMax: template.stockMax, basePrice: template.basePrice, model: model.id, imported: true } });
    }
  }
  return result.sort((a, b) => a.item.def < b.item.def ? -1 : a.item.def > b.item.def ? 1 : 0);
}
export function marketListings(s: CampaignState, ctx: OpsCtx, market: MarketDef): Listing[] {
  const old = (s as MarketState).markets?.[market.id];
  if (!old) return listings(s, ctx, market);
  const dynamic = (old.dynamic ?? []).filter(l => !l.item.model || marketModelVisible(s, ctx, ctx.world.require("model", l.item.model), market.place));
  const dynamicIds = new Set(dynamic.map(l => l.item.def));
  return [...market.lists.flatMap(list => list.items.filter(item => !dynamicIds.has(item.def)).map(item => ({ kind: list.kind, item }))), ...dynamic]
    .sort((a, b) => a.item.def < b.item.def ? -1 : a.item.def > b.item.def ? 1 : 0);
}
function dynamicState(items: Listing[]): { dynamic?: Listing[] } {
  const dynamic = items.filter(l => l.item.model !== undefined || l.item.imported);
  return dynamic.length ? { dynamic } : {};
}
export function marketPrice(s: CampaignState, ctx: OpsCtx, market: MarketDef, item: MarketItem, condition = 1): number {
  if (s.places[market.place]?.flags.includes("blockaded")) return Infinity;
  const cfg = worldRules(ctx).market, node = s.places[market.place], def = requirePlace(s, ctx, market.place);
  const owner = node?.ownerOverride ?? def.owner;
  const faction = ctx.world.all("faction-ops").find(f => f.faction === owner);
  const rep = faction ? s.factions[faction.id]?.rep ?? 0 : 0;
  let price = (item.basePrice ?? 0) * Math.max(0, Math.min(1, condition)) * Math.max(cfg.minimumMultiplier, 1 - rep * cfg.repDiscount);
  const resolved = item as FixedItem, releasedDay = resolved.model ? s.models?.[resolved.model]?.releasedDay : undefined;
  if (releasedDay !== undefined && releasedDay > 0 && s.clock.day - releasedDay < ctx.world.require("calendar", s.calendar).daysPerMonth) price *= 1.5;
  // SPEC-GAP：trade 折價與 scarcity 減貨未定量；借用既有市場最低倍率作折減比例（目前九折）。
  if (resolved.imported) price *= 1 - cfg.minimumMultiplier;
  for (const mod of market.priceMods) if (node?.flags.includes(mod.tag)) price *= evalOpsNum(s, ctx, mod.mult, { node: market.place, ...(faction ? { faction: faction.id } : {}) });
  return Math.max(0, price);
}
function defaultStock(items: Listing[]): Record<string, number> {
  return Object.fromEntries(items.map(({ item }) => [item.def, item.stockMax]));
}
export function marketsDaily7(s: CampaignState, ctx: OpsCtx): void {
  const state = s as MarketState;
  const scarcityStarted = new Set<string>(), supplied = new Set<string>();
  for (const node of Object.values(s.places)) {
    const key = `market-scarcity:${node.def}`;
    if (node.flags.includes("war-supplied") && !node.flags.includes("blockaded")) supplied.add(node.def);
    if (node.flags.includes("scarcity") && s.flags[key] === undefined) { s.flags[key] = s.clock.day + ctx.world.require("calendar", s.calendar).daysPerMonth; scarcityStarted.add(node.def); }
    if (s.flags[key] !== undefined && (s.flags[key]! <= s.clock.day || supplied.has(node.def))) { node.flags = node.flags.filter(f => f !== "scarcity"); delete s.flags[key]; }
  }
  for (const market of ctx.world.all("market")) {
    const node = s.places[market.place];
    if (node?.flags.includes("blockaded")) continue;
    const restock = supplied.has(market.place), scarce = node?.flags.includes("scarcity");
    if (restock && node) node.flags = node.flags.filter(f => !market.priceMods.some(m => m.tag === f));
    const old = state.markets?.[market.id];
    if (old && !restock && (s.clock.phase !== "neap" || old.refreshedDay === s.clock.day)) {
      if (scarce && scarcityStarted.has(market.place)) for (const id of Object.keys(old.stock)) old.stock[id] = Math.floor(old.stock[id]! * (1 - worldRules(ctx).market.minimumMultiplier));
      continue;
    }
    const items = listings(s, ctx, market), stock = defaultStock(items);
    if (s.clock.phase === "neap" && !restock) {
      for (const id of Object.keys(stock).sort()) stock[id] = 0;
      const groups = market.lists.map(list => listings(s, ctx, { ...market, lists: [list] }, false, false).map(l => l.item));
      const domestic = new Set(groups.flatMap(group => group.map(item => item.def)));
      const imports = items.filter(l => !domestic.has(l.item.def)).map(l => l.item);
      if (imports.length) groups.push(imports);
      for (const group of groups) {
        const pool = group.filter(i => i.weight > 0 && i.stockMax > 0);
        for (let i = 0; i < pool.length; i++) {
          const item = pickWeighted(s.rng, pool, item => item.weight);
          stock[item.def] = Math.min(item.stockMax, stock[item.def]! + 1 + nextInt(s.rng, item.stockMax));
        }
      }
    }
    if (scarce) for (const id of Object.keys(stock)) stock[id] = Math.floor(stock[id]! * (1 - worldRules(ctx).market.minimumMultiplier));
    (state.markets ??= {})[market.id] = { refreshedDay: s.clock.day, stock, ...dynamicState(items) };
  }
  for (const id of supplied) s.places[id]!.flags = s.places[id]!.flags.filter(f => f !== "war-supplied");
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
  if (s.places[market.place]?.flags.some(f => f === "recovering" || f === "blight-lost")) return { ok: false, error: "recovering" };
  if ((cmd.buy?.length ?? 0) > 0 && (s.debtState?.arrears ?? 0) >= 3 &&
    ctx.world.require("faction-ops", "faction-ops/selene-whitegloves").territory.includes(market.place)) return { ok: false, error: "selene-embargo" };
  if (s.places[market.place]?.flags.includes("blockaded")) return { ok: false, error: "blockaded" };
  if (!isDocked(s, ctx, market.place)) return { ok: false, error: "not-docked" };
  if (s.pendingBattle || s.pendingChoices.length) return { ok: false, error: "pending-encounter" };
  if ((cmd.sell?.length ?? 0) && !market.buysBack) return { ok: false, error: "no-buyback" };
  const items = marketListings(s, ctx, market), resale = listings(s, ctx, market, true), state = s as MarketState;
  const stock = { ...(state.markets?.[market.id]?.stock ?? defaultStock(items)) }, balances = { ...s.ledger.balances };
  const physicalSold = new Set<string>();
  const trades: { buy: boolean; id: string; listing: Listing; price: number; account: Account; physical: boolean }[] = [];
  for (const buy of [false, true]) for (const id of (buy ? cmd.buy : cmd.sell) ?? []) {
    const component = !buy ? s.inventory.components.find(c => c.id === id) : undefined, mech = !buy ? s.mechs[id] : undefined;
    const ref = component?.def ?? mech?.frame ?? id;
    const listing = (buy ? items : resale).find(i => i.item.def === ref || ctx.db.get("component", ref)?.id === i.item.def || ctx.db.get("frame", ref)?.id === i.item.def);
    if (!listing || listing.item.basePrice === undefined) return { ok: false, error: "unknown-item" };
    if (buy && listing.kind === "frame" && frameRepBlocked(s, ctx, listing.item)) return { ok: false, error: "reputation-required" };
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
      const frame = s.mechs[t.id]?.frame;
      if (frame) {
        // 同一機體可登記多代機型；沒有實例機型欄時取最近已釋出者，每台只流出一次。
        const model = ctx.world.all("model").filter(m => m.frame === frame && m.exportPolicy !== "open").sort((a, b) =>
          (s.models?.[b.id]?.releasedDay ?? -1) - (s.models?.[a.id]?.releasedDay ?? -1) || b.mark - a.mark || a.id.localeCompare(b.id))[0];
        if (model && !isModelGeneric(s, model)) leakModel(s, ctx, model.id, "player");
      }
      s.inventory.components = s.inventory.components.filter(c => c.id !== t.id);
      s.inventory.mechs = s.inventory.mechs.filter(id => id !== t.id); delete s.mechs[t.id];
      s.hangar.bays = s.hangar.bays.map(id => id === t.id ? null : id); s.hangar.dormant = s.hangar.dormant.filter(id => id !== t.id);
      for (const room of Object.keys(s.ship.rooms).sort()) s.ship.rooms[room]!.items = s.ship.rooms[room]!.items.filter(id => id !== t.id);
    }
    if (t.account === "stock:fuel") s.ship.fuel.cur = Math.min(s.ship.fuel.max, s.ledger.balances["stock:fuel"] ?? 0);
  }
  (state.markets ??= {})[market.id] = { refreshedDay: state.markets?.[market.id]?.refreshedDay ?? s.clock.day, stock, ...dynamicState(items) };
  return { ok: true };
}
