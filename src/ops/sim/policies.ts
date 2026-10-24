import { encounterOptions, estimateShipStrength } from "../world/encounter.ts";
import { nextInt } from "../../core/rng.ts";
import type { CampaignState, OpsCommand, OpsCtx, Sortie } from "../state/types.ts";
import { evalOpsCond } from "../content/cond.ts";
import { shortestPath } from "../world/index.ts";
import { applyCommand } from "../time/index.ts";
import { joinForce, joinOperation, joinRejection } from "../war/merc.ts";
import { placeAt } from "../war/loc.ts";
import { availableFuel, isDocked } from "../world/move.ts";
import { marketListings, marketPrice } from "../world/market.ts";
import type { MarketState } from "../world/market.ts";
import { placeDef, worldRules } from "../world/places.ts";
export type Policy = (s: CampaignState, ctx: OpsCtx) => OpsCommand;
export type PolicyName = "idle" | "greedy" | "random" | "merc";
function battleAvailable(ctx: OpsCtx): boolean { return (ctx as OpsCtx & { battleAvailable?: boolean }).battleAvailable !== false; }
function encounterChoice(s: CampaignState, ctx: OpsCtx, policy: "idle" | "greedy" | "random" = "idle"): OpsCommand | undefined {
  if (!s.pendingEncounter) return;
  const legal = encounterOptions(s, ctx).filter(c => !c.disabled && (battleAvailable(ctx) || c.n === 1 || c.n === 3));
  if (!legal.length && estimateShipStrength(s, ctx) <= 0) return { v: "choose", choice: 4 };
  if (!legal.length) throw new Error("encounter-without-resolvable-choice");
  const target = s.actors[s.pendingEncounter.actor];
  const canFight = battleAvailable(ctx) && allUnits(s, ctx).length > 0;
  const preferred = policy === "random" ? legal[nextInt({ ...s.rng }, legal.length)]!.n
    : policy === "greedy" && canFight && target && target.str < estimateShipStrength(s, ctx) ? 4
    : (policy === "idle" || !canFight || !legal.some(c => c.n === 1)) && target?.kind !== "swarm" && legal.some(c => c.n === 3) ? 3 : 1;
  return { v: "choose", choice: legal.find(c => c.n === preferred)?.n ?? legal[0]!.n };
}
function choice(s: CampaignState, ctx: OpsCtx): OpsCommand | undefined {
  const prompt = s.pendingChoices[0]; if (!prompt) return undefined;
  const index = prompt.choices.findIndex(c => !c.requires || evalOpsCond(s, ctx, c.requires, { place: placeAt(s, ctx, s.ship.pos), faction: prompt.faction, ...(prompt.person ? { person: prompt.person } : {}) }));
  if (index < 0) throw new Error("prompt-without-legal-choice");
  return { v: "choose", choice: index + 1 };
}
function fuelSupply(s: CampaignState, ctx: OpsCtx, returnToSafety = false): OpsCommand | undefined {
  if (s.ship.hull.cur <= 0 || s.pendingBattle || s.ship.path?.lane) return;
  const travel = worldRules(ctx).travel, fuel = availableFuel(s), reserve = travel.retreatFuel * 2 + travel.fuelPerDay;
  const candidates = ctx.world.all("market").filter(m => !s.places[m.place]?.flags.some(f => ["recovering", "blight-lost", "blockaded"].includes(f)))
    .filter(m => !returnToSafety || ["city", "port", "lunar-base"].includes(placeDef(s, ctx, m.place)?.kind ?? ""))
    .flatMap(market => {
      const item = marketListings(s, ctx, market).find(i => i.item.def === "stock:fuel")?.item;
      if (!item || ((s as MarketState).markets?.[market.id]?.stock["stock:fuel"] ?? item.stockMax) <= 0) return [];
      const path = item && shortestPath(s, ctx, s.ship.pos, market.place);
      return item && path ? [{ market, item, path }] : [];
    }).sort((a, b) => a.path.fuel - b.path.fuel || a.market.id.localeCompare(b.market.id));
  const nearest = candidates[0]; if (!nearest) return;
  const active = Object.values(s.contracts).find(c => ["active", "stage"].includes(c.status));
  const mission = active ? shortestPath(s, ctx, s.ship.pos, active.target.place) : undefined;
  const homeward = active ? shortestPath(s, ctx, active.target.place, nearest.market.place) : undefined;
  const missionReserve = mission && homeward ? 2 * (mission.fuel + homeward.fuel)
    + travel.retreatFuel * 2 * (mission.days + homeward.days) + reserve : reserve;
  const returnReserve = nearest.path.fuel * 2 + travel.retreatFuel * 2 * nearest.path.days + reserve;
  if ((!returnToSafety || isDocked(s, ctx, nearest.market.place)) && fuel > returnReserve && fuel >= missionReserve) return;
  if (!isDocked(s, ctx, nearest.market.place)) {
    const at = placeAt(s, ctx, s.ship.pos);
    if (at === nearest.market.place) return { v: "dock" };
    if (s.ship.path && "place" in s.ship.path.to && s.ship.path.to.place === nearest.market.place) return { v: "wait", days: 1 };
    const sail: OpsCommand = { v: "sail", to: nearest.market.place };
    return applyCommand(s, ctx.db, ctx.world, sail).result.ok ? sail : undefined;
  }
  const price = marketPrice(s, ctx, nearest.market, nearest.item);
  let count = Math.floor(Math.min(s.ship.fuel.max - fuel, nearest.item.stockMax, price > 0 ? s.ledger.balances.cash / price : s.ship.fuel.max));
  while (count > 0) {
    const trade: OpsCommand = { v: "trade", market: nearest.market.id, buy: Array<string>(count).fill("stock:fuel") };
    if (applyCommand(s, ctx.db, ctx.world, trade).result.ok) return trade;
    count = Math.floor(count / 2);
  }
  return undefined;
}
export const idle: Policy = (s, ctx) => {
  const pending = encounterChoice(s, ctx) ?? choice(s, ctx); if (pending) return pending;
  if (s.pendingBattle?.trigger === "ambush" || s.pendingBattle?.actors?.length) {
    const units = allUnits(s, ctx);
    return battleAvailable(ctx) && availableFuel(s) < worldRules(ctx).travel.retreatFuel && units.length ? { v: "sortie", sortie: { ...s.pendingBattle, units } } : { v: "drift" };
  }
  return { v: "wait", days: 1 };
};

function combatReady(s: CampaignState, ctx: OpsCtx, id: string): boolean {
  const mech = s.mechs[id]; if (!mech) return false;
  const frame = ctx.db.require("frame", mech.frame), body = ctx.db.require("bodyplan", frame.bodyPlan);
  if (body.parts.some(p => (p.functions.includes("core") || p.functions.includes("locomotion"))
    && (!mech.parts[p.id] || mech.parts[p.id]!.broken))) return false;
  if (s.jobs.some(j => j.target === id && (j.paid || j.doneHours > 0) && j.doneHours < j.needHours)) return false;
  const abilities = [...frame.innateAbilities];
  for (const part of body.parts) {
    const state = mech.parts[part.id]; if (!state || state.broken) continue;
    const components = Object.keys(state.components).sort().flatMap(slot => {
      const id = state.components[slot];
      const def = id && ctx.db.get("component", s.inventory.components.find(c => c.id === id)?.def ?? id);
      return def ? [def] : [];
    });
    // 營運實例把有 HP 的部件層接在部位層尾，順序與槽位一致。
    let layerIndex = state.layers.length - components.filter(c => c.hp !== undefined).length;
    for (const component of components) {
      const layer = component.hp === undefined ? undefined : state.layers[layerIndex++];
      if (component.hp !== undefined && (!layer || layer.broken || layer.hp <= 0)) continue;
      abilities.push(...component.abilities);
    }
  }
  return abilities.some(id => {
    const ability = ctx.db.require("ability", id);
    if (ability.mode !== "activated") return false;
    const ammo = new Set([...(ability.ammoPool ? [ability.ammoPool] : []),
      ...ability.costs.filter(c => c.pool.startsWith("ammo")).map(c => c.pool)]);
    // SPEC-GAP：營運沒有補彈指令；只檢查現有彈藥，不自動補滿或假設能採買。
    return [...ammo].every(pool => (mech.pools[pool]?.cur ?? 0) > 0);
  });
}

function repairJob(s: CampaignState, ctx: OpsCtx): OpsCommand | undefined {
  for (const id of [...new Set(s.hangar.bays.filter((id): id is string => !!id))].sort()) {
    const mech = s.mechs[id]; if (!mech) continue;
    const body = ctx.db.require("bodyplan", ctx.db.require("frame", mech.frame).bodyPlan);
    for (const part of [...body.parts].sort((a, b) => a.id < b.id ? -1 : 1)) {
      for (const [layer, def] of part.layers.entries()) {
        const state = mech.parts[part.id]?.layers[layer];
        if (!state || state.hp >= def.hp || s.jobs.some(j => j.target === id && j.part === part.id && j.layer === layer
          && (j.kind === "repair" || j.kind === "rebuild"))) continue;
        const cmd: OpsCommand = { v: "queue", job: { kind: def.structural && state.hp <= 0 ? "rebuild" : "repair", target: id, part: part.id, layer } };
        // 工時與材料沿用既有 queue 計價；無支援配方就略過，避免每天重送非法 job。
        if (applyCommand(s, ctx.db, ctx.world, cmd).result.ok) return cmd;
      }
    }
  }
  return undefined;
}

function allUnits(s: CampaignState, ctx: OpsCtx, requireSteadyCrew = false): Sortie["units"] {
  const available = Object.keys(s.roster.persons).sort().filter(id => !s.roster.dead.some(d => d.person === id) && s.roster.persons[id]!.pools.hp?.cur !== 0
    // 與 scenario 的 morale-shaken 注入門檻一致；僅 greedy 啟用。
    && (!requireSteadyCrew || (s.roster.employment[id]?.mood ?? 0) >= 0));
  const used = new Set<string>();
  return [...new Set(s.hangar.bays.filter((id): id is string => !!id))].sort().filter(id => !s.hangar.dormant.includes(id) && combatReady(s, ctx, id)).map(id => {
    const mech = s.mechs[id]!, frame = ctx.db.require("frame", mech.frame);
    const captured = s.flags[`captured:${id}`] === 1 || ctx.db.all("species").some(sp => sp.capture.frame === frame.id);
    const seats: Record<string, string | null> = {};
    if (!captured) for (const seat of ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []).sort((a, b) => a.id < b.id ? -1 : 1)) {
      const compatible = (person: string) => !used.has(person) && seat.accepts.includes(ctx.db.require("person", s.roster.persons[person]!.def).kind === "soul" ? "soul" : "pilot");
      const occupant = mech.seats[seat.id], person = occupant && available.includes(occupant) && compatible(occupant) ? occupant : available.find(compatible);
      seats[seat.id] = person ?? null; if (person) used.add(person);
    }
    const kinds = Object.values(seats).filter((person): person is string => !!person).map(person => ctx.db.require("person", s.roster.persons[person]!.def).kind);
    const controlMode = captured ? "instinct" : kinds.includes("human") ? (kinds.includes("soul") ? "shared" : "pilot") : kinds.includes("soul") ? "soul" : "none";
    return { mech: id, seats, controlMode } as Sortie["units"][number];
  }).filter(unit => unit.controlMode !== "none");
}
export const greedy: Policy = (s, ctx) => {
  const contact = encounterChoice(s, ctx, "greedy"); if (contact) return contact;
  const pending = choice(s, ctx); if (pending) return pending;
  if (s.pendingBattle?.actors?.length) {
    const units = allUnits(s, ctx);
    return battleAvailable(ctx) && units.length ? { v: "sortie", sortie: { ...s.pendingBattle, units } } : { v: "drift" };
  }
  const fuel = fuelSupply(s, ctx, !allUnits(s, ctx, true).length); if (fuel) return fuel;
  const drawn = Object.keys(s.contracts).sort().map(id => s.contracts[id]!).find(c =>
    !c.operation && ["active", "stage"].includes(c.status) && (c.consecutiveDraws ?? 0) >= 2);
  if (drawn) return { v: "drop", contract: drawn.id };
  const repair = repairJob(s, ctx); if (repair) return repair;
  if (s.ship.path && !s.pendingBattle) return { v: "wait", days: 1 };
  const active = Object.keys(s.contracts).sort().map(id => s.contracts[id]!).find(c => !c.operation && ["active", "stage"].includes(c.status));
  const units = allUnits(s, ctx, true);
  // SPEC-GAP：validateSortie 尚未拒絕全空座位；無可控制機體時等待，避免反覆跑到 battle-maxSteps。
  if (!units.length) return s.pendingBattle?.trigger === "ambush" ? { v: "drift" } : { v: "wait", days: 1 };
  if (units.length === 1) {
    const mech = s.mechs[units[0]!.mech]!, body = ctx.db.require("bodyplan", ctx.db.require("frame", mech.frame).bodyPlan);
    // 領導授權的單機殘破判準：任一部位毀損，或任一結構層剩餘不超過半血。
    if (body.parts.some(part => !mech.parts[part.id] || mech.parts[part.id]!.broken || part.layers.some((layer, i) =>
      layer.structural && (mech.parts[part.id]!.layers[i]?.hp ?? 0) <= (mech.parts[part.id]!.layers[i]?.maxHp ?? layer.hp) * 0.5))) {
      return s.pendingBattle?.trigger === "ambush" ? { v: "drift" } : { v: "wait", days: 1 };
    }
  }
  if (s.pendingBattle || active && active.target.place === placeAt(s, ctx, s.ship.pos)) return { v: "sortie", sortie: {
    ...s.pendingBattle, ...(active && !s.pendingBattle ? { contract: active.id, place: active.target.place, loc: structuredClone(s.ship.pos),
      ...(active.target.rift ? { rift: active.target.rift } : {}), trigger: "contract" as const } : {}), units,
  } };
  if (active) return { v: "sail", to: active.target.place };
  const offers = Object.keys(s.contracts).sort().map(id => s.contracts[id]!).filter(c => !c.operation && c.status === "offered")
    .map(c => ({ c, path: shortestPath(s, ctx, s.ship.pos, c.target.place) })).filter(item => item.path)
    .sort((a, b) => a.path!.days - b.path!.days || (a.c.id < b.c.id ? -1 : 1));
  for (const { c } of offers) {
    const cmd: OpsCommand = { v: "accept", contract: c.id };
    if (applyCommand(s, ctx.db, ctx.world, cmd).result.ok) return cmd;
  }
  return { v: "wait", days: 1 };
};
export const random: Policy = (s, ctx) => {
  const contact = encounterChoice(s, ctx, "random"); if (contact) return contact;
  if (s.pendingBattle?.actors?.length || s.pendingBattle?.trigger === "ambush") {
    const units = allUnits(s, ctx);
    return battleAvailable(ctx) && units.length ? { v: "sortie", sortie: { ...s.pendingBattle, units } } : { v: "drift" };
  }
  const pending = choice(s, ctx); if (pending) return pending;
  const fuelPrices = ctx.world.all("market").flatMap(market => {
    const item = marketListings(s, ctx, market).find(i => i.item.def === "stock:fuel")?.item;
    const price = item ? marketPrice(s, ctx, market, item) : Infinity;
    return Number.isFinite(price) ? [price] : [];
  });
  const fuelCash = fuelPrices.length ? Math.min(...fuelPrices) * s.ship.fuel.max : s.ledger.balances.cash;
  const affordVoyage = s.ledger.balances.cash >= fuelCash;
  const fuel = fuelSupply(s, ctx, !affordVoyage); if (fuel) return fuel;
  if (s.pendingBattle?.contract) {
    const drop: OpsCommand = { v: "drop", contract: s.pendingBattle.contract };
    if (applyCommand(s, ctx.db, ctx.world, drop).result.ok) return drop;
  }
  const candidates: OpsCommand[] = [{ v: "wait", days: 1 }, { v: "map" }, { v: "dock" }, { v: "drift" }, { v: "board" }];
  for (const id of Object.keys(s.contracts).sort()) {
    if (s.contracts[id]!.status === "offered") candidates.push({ v: "accept", contract: id });
    if (s.contracts[id]!.status === "active") candidates.push({ v: "drop", contract: id });
  }
  if (s.ledger.balances.cash > fuelCash && s.ledger.balances.debt > 0) candidates.push({ v: "pay", account: "debt", amount: Math.min(s.ledger.balances.cash - fuelCash, s.ledger.balances.debt) });
  const travel = worldRules(ctx).travel;
  // 隨機政策不主動打遭遇戰，航行預留深蝕日耗與脫離燃料。
  const journeys = Object.keys(s.places).sort().map(id => ({ id, path: shortestPath(s, ctx, s.ship.pos, id) }))
    .filter(entry => entry.path && entry.path.days > 0 && availableFuel(s) >= 2 * (entry.path.fuel + travel.fuelPerDay) + travel.retreatFuel)
    .sort((a, b) => a.path!.days - b.path!.days || a.id.localeCompare(b.id));
  // 補給現金不足時留在安全港，避免隨機遠航後無錢補油。
  if (affordVoyage) for (const { id } of journeys) candidates.push({ v: "sail", to: id });
  const legal = candidates.filter(cmd => applyCommand(s, ctx.db, ctx.world, cmd).result.ok);
  // 政策只讀 RNG 快照：抽籤不改營運 state，記錄的指令即可完整重播。
  return legal[nextInt({ ...s.rng }, legal.length)]!;
};
export const merc: Policy = (s, ctx) => {
  const contact = encounterChoice(s, ctx, "greedy"); if (contact) return contact;
  const pending = choice(s, ctx); if (pending) return pending;
  if (s.pendingBattle) {
    const units = allUnits(s, ctx);
    if (battleAvailable(ctx) && units.length) {
      // SPEC-GAP（lead-impl-war 12:18）：不擴充 Sortie.ai，違令由真實 AI 戰果自然判定。
      return { v: "sortie", sortie: { ...s.pendingBattle, units } };
    }
    if (s.pendingBattle.trigger === "ambush" || s.pendingBattle.actors?.length) return { v: "drift" };
    if (s.pendingBattle.trigger === "operation" && s.pendingBattle.contract) return { v: "drop", contract: s.pendingBattle.contract };
  }
  const fuel = fuelSupply(s, ctx); if (fuel) return fuel;
  const active = Object.values(s.contracts).find(c => c.operation && c.status === "active");
  if (active) {
    if (s.ship.path) return { v: "wait", days: 1 };
    const op = joinOperation(s, active)!;
    const loc = ["muster", "march"].includes(op.phase) ? op.target.loc : joinForce(s, active, op).pos;
    const to = placeAt(s, ctx, loc) ?? loc.cell;
    if (s.ship.pos.map !== loc.map || s.ship.pos.cell.x !== loc.cell.x || s.ship.pos.cell.y !== loc.cell.y) {
      const sail: OpsCommand = { v: "sail", to };
      if (applyCommand(s, ctx.db, ctx.world, sail).result.ok) return sail;
    }
    const repair = repairJob(s, ctx); if (repair) return repair;
    return { v: "wait", days: 1 };
  }
  const offers = Object.values(s.contracts).filter(c => c.operation && c.status === "offered" && !joinRejection(s, ctx, c))
    .map(c => ({ c, path: shortestPath(s, ctx, s.ship.pos, c.target.place) })).filter(v => v.path)
    .sort((a, b) => a.path!.days - b.path!.days || a.c.id.localeCompare(b.c.id));
  if (offers.length) return { v: "accept", contract: offers[0]!.c.id };
  return greedy(s, ctx);
};
export const policies: Record<PolicyName, Policy> = { idle, greedy, random, merc };
