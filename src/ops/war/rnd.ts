import { placeDef, worldRules } from "../world/places.ts";
import type { Id } from "../../core/ids.ts";
import { nextFloat, pickWeighted } from "../../core/rng.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { ModelDef, OperationState, Relation, TreatyState } from "./types.ts";
import { factionId, hasTreaty, relation, relationRank } from "./relations.ts";
import { drive } from "./drivers.ts";
import { heldLineages, monthDays, syncLineages } from "./lineages.ts";
import { placeAt } from "./loc.ts";

export function initRnd(s: CampaignState, ctx: OpsCtx, ids: string[]): void {
  for (const id of ids) {
    const f = s.factions[id]!, lineages = heldLineages(s, ctx, id);
    const released = ctx.world.all("model").filter(m => m.role !== "captain" && makerCanResearch(s, ctx, id, m) && lineages.includes(m.lineage) &&
      "month" in m.availableFrom && m.availableFrom.month <= 0).map(m => m.id);
    f.rnd = { points: 0, released, lineages, stalled: [] };
    f.rndProgress = { acquired: {}, held: [...lineages], lastDay: s.clock.day };
    for (const model of released) (s.models ??= {})[model] ??= { def: model, releasedDay: s.clock.day, by: id };
  }
}
export function isModelGeneric(s: CampaignState, model: ModelDef): boolean {
  return model.generic || s.models?.[model.id]?.genericSince !== undefined;
}
// 通用血統上的私有衍型只授權造機勢力；流出後重新加入通用池。
function makerCanResearch(s: CampaignState, ctx: OpsCtx, faction: string, model: ModelDef): boolean {
  return ctx.world.get("lineage", model.lineage)?.source !== "generic" || isModelGeneric(s, model) ||
    model.maker === "generic" || factionId(s, ctx, model.maker) === faction;
}
export function repGate(s: CampaignState, ctx: OpsCtx, model: ModelDef): number | undefined {
  if (isModelGeneric(s, model) || model.maker === "generic") return undefined;
  const gates = worldRules(ctx).repGate;
  return gates.overrides[model.id] ?? gates.byTier[model.tier];
}
export function repGateBlocked(s: CampaignState, ctx: OpsCtx, model: ModelDef): { faction: string; need: number; have: number } | undefined {
  const need = repGate(s, ctx, model);
  if (need === undefined) return undefined;
  const faction = factionId(s, ctx, model.maker) ?? model.maker, have = s.factions[faction]?.rep ?? 0;
  return have < need ? { faction, need, have } : undefined;
}
export function modelVisibleAt(s: CampaignState, ctx: OpsCtx, model: ModelDef, node: string): boolean {
  if (model.role === "captain" || s.models?.[model.id]?.releasedDay === undefined) return false;
  if (isModelGeneric(s, model) || model.exportPolicy === "open") return true;
  const raw = s.places[node]?.ownerOverride ?? placeDef(s, ctx, node)?.owner;
  const owner = raw ? factionId(s, ctx, raw) : Object.keys(s.factions).find(id => s.factions[id]!.territoryNow.includes(node));
  const maker = factionId(s, ctx, model.maker);
  if (!owner || !maker) return false;
  if (owner === maker) return true;
  const r = relation(s, owner, maker);
  return model.exportPolicy === "licensed" && !!r && (relationRank[r.state] >= relationRank.friendly || hasTreaty(s, ctx, r, "trade"));
}
export function rndIncome(s: CampaignState, ctx: OpsCtx, id: string): number {
  const f = s.factions[id]!, rnd = f.rnd!, def = ctx.world.require("faction-ops", f.def);
  const relations = Object.values(s.relations ?? {}).filter(r => r.a === id || r.b === id);
  // SPEC-GAP：規格未定 cult，按 city；其餘數值照研發公式，待獨立研發設定表。
  const base: Record<string, number> = { state: 12, company: 10, city: 5, cult: 5, guild: 1, band: 1 };
  return Math.max(0, (base[f.scaleNow] ?? 1) + rnd.lineages.filter(l => !rnd.stalled.includes(l)).length * 2 +
    relations.reduce((n, r) => n + r.treaties.filter(t => !t.broken && t.endDay > s.clock.day && ctx.world.get("treaty", t.def)?.kind === "trade").length, 0) -
    (relations.some(r => r.state === "war") ? 3 : 0) - ((f.forces?.supply ?? 100) < 30 ? 2 : 0) - def.territory.filter(n => !f.territoryNow.includes(n)).length);
}
export function modelAvailable(s: CampaignState, ctx: OpsCtx, faction: string, model: ModelDef): boolean {
  const rnd = s.factions[faction]?.rnd; if (!rnd) return false;
  const from = model.availableFrom;
  if ("month" in from) return s.clock.month >= from.month;
  if ("lineage" in from) return rnd.lineages.includes(from.lineage) && !rnd.stalled.includes(from.lineage);
  // SPEC-GAP：milestone 與 event 首次登場共用旗標；事件必須已選結束，僅 offered 不算。
  return !!s.flags[from.event] || s.log.some(e => (e.type === "Chosen" || e.type === "EventResolved") && (e.payload.event === from.event || e.payload.def === from.event));
}
export function rndCandidates(s: CampaignState, ctx: OpsCtx, faction: string): ModelDef[] {
  const rnd = s.factions[faction]?.rnd; if (!rnd) return [];
  return ctx.world.all("model").filter(m => m.role !== "captain" && makerCanResearch(s, ctx, faction, m) && !rnd.released.includes(m.id) &&
    m.requires.every(id => rnd.released.includes(id)) && rnd.lineages.includes(m.lineage) && !rnd.stalled.includes(m.lineage) && modelAvailable(s, ctx, faction, m));
}
export function researchWeight(s: CampaignState, ctx: OpsCtx, faction: string, model: ModelDef): number {
  const lineage = ctx.world.get("lineage", model.lineage), def = ctx.world.require("faction-ops", faction);
  const style = lineage?.traits.naming === def.faction.split("/").at(-1) || factionId(s, ctx, model.maker) === faction ? 2 : 1;
  // 最近一潮月各型現存整備缺額，作為沒有獨立折損帳時的戰損訊號。
  const loss = Object.values(s.operations ?? {}).filter(o => o.actor === faction && o.startDay >= s.clock.day - monthDays(s, ctx))
    .flatMap(o => o.force.units).filter(u => ctx.world.get("model", u.model)?.tier === model.tier)
    .reduce((n, u) => n + u.count * (1 - u.readiness), 0);
  return style * (1 + loss);
}
function release(s: CampaignState, ctx: OpsCtx, faction: string, model: ModelDef): void {
  const rnd = s.factions[faction]!.rnd!;
  if (!rnd.released.includes(model.id)) rnd.released.push(model.id);
  rnd.released.sort();
  (s.models ??= {})[model.id] ??= { def: model.id, by: faction };
  s.models[model.id]!.releasedDay ??= s.clock.day;
  ctx.emit("ModelReleased", { faction, model: model.id });
}
export function rndMonthly2f(s: CampaignState, ctx: OpsCtx): void {
  if (!s.warRng) return;
  syncLineages(s, ctx);
  if (s.clock.dom !== 1) return;
  for (const id of Object.keys(s.factions).sort()) {
    const f = s.factions[id]!, rnd = f.rnd;
    if (!f.alive || !rnd || f.rndProgress?.lastDay === s.clock.day) continue;
    (f.rndProgress ??= { acquired: {}, held: heldLineages(s, ctx, id) }).lastDay = s.clock.day;
    rnd.points += rndIncome(s, ctx, id);
    const pool = rndCandidates(s, ctx, id);
    if (rnd.current && !pool.some(m => m.id === rnd.current!.model)) {
      // 失殼只停該血統；保留進度，讓其他血統仍可研發。
      (f.rndProgress!.suspended ??= {})[rnd.current.model] = rnd.current.done;
      delete rnd.current;
    }
    if (!rnd.current && pool.length) {
      const model = pickWeighted(s.warRng, pool, m => researchWeight(s, ctx, id, m)).id;
      rnd.current = { model, done: f.rndProgress!.suspended?.[model] ?? 0 };
      if (f.rndProgress!.suspended) delete f.rndProgress!.suspended[model];
    }
    if (!rnd.current) continue;
    rnd.current.done += rnd.points; rnd.points = 0;
    const model = ctx.world.require("model", rnd.current.model);
    if (rnd.current.done >= model.cost) { release(s, ctx, id, model); delete rnd.current; }
  }
}
export function replenishWeight(s: CampaignState, ctx: OpsCtx, model: ModelDef): number {
  if (model.role === "captain") return 0;
  const age = Math.max(0, s.clock.day - (s.models?.[model.id]?.releasedDay ?? s.clock.day));
  const tierMult = 1 / (ctx.world.all("forces")[0]?.gp[model.tier] ?? 1);
  // SPEC-GAP：規格倒數公式與驗收「舊多新少」相反，沿前線採機齡正比；tierMult 取內容 gp 倒數。
  return (age + monthDays(s, ctx)) * tierMult;
}
function modelParameter(model: ModelDef, key: string, fallback: number): number {
  const tag = model.tags.find(t => t.startsWith(`${key}:`)), value = tag ? Number(tag.slice(key.length + 1)) : fallback;
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}
export function onOperationSuccess(s: CampaignState, ctx: OpsCtx, op: OperationState): void {
  if (!s.warRng || !s.factions[op.actor]?.rnd) return;
  syncLineages(s, ctx);
  const models = op.force.units.filter(u => u.count > 0).map(u => ctx.world.require("model", u.model));
  const candidates = ctx.world.all("model").filter(m => m.role === "captain" && !s.models?.[m.id] && modelAvailable(s, ctx, op.actor, m) &&
    m.requires.every(id => s.factions[op.actor]!.rnd!.released.includes(id)) &&
    models.some(base => base.series === m.series && base.mark + 1 === m.mark) &&
    m.mark === Math.max(...models.filter(base => base.series === m.series).map(base => base.mark)) + 1);
  if (candidates.length) {
    const model = pickWeighted(s.warRng, candidates, () => 1);
    if (nextFloat(s.warRng) < modelParameter(model, "captain-chance", 0)) {
      release(s, ctx, op.actor, model);
      op.force.units.push({ model: model.id, count: 1, readiness: 1 });
      // 返還部隊按 contributions 分配，新增隊長機也要歸入主攻方，避免勝後消失。
      if (op.contributions) (op.contributions[op.actor] ??= []).push({ model: model.id, count: 1, readiness: 1 });
      ctx.emit("CaptainCreated", { operation: op.id, faction: op.actor, model: model.id, count: 1, name: ctx.db.require("frame", model.frame).name });
    }
  }
  const kind = ctx.world.require("operation", op.def).kind, node = placeDef(s, ctx, (placeAt(s, ctx, op.target.loc) ?? ""));
  if (!["seize", "raid"].includes(kind) || !node?.tags.includes("workshop") || !op.target.faction) return;
  for (const model of ctx.world.all("model")) if (!isModelGeneric(s, model) && model.exportPolicy !== "open" && s.models?.[model.id]?.releasedDay !== undefined &&
    factionId(s, ctx, model.maker) === op.target.faction && nextFloat(s.warRng) < 0.3 / Math.sqrt(ctx.world.all("forces")[0]?.gp[model.tier] ?? 1)) leakModel(s, ctx, model.id, op.actor);
}
export function leakModel(s: CampaignState, ctx: OpsCtx, id: Id, by?: Id): void {
  const model = ctx.world.require("model", id);
  if (isModelGeneric(s, model)) return;
  const maker = factionId(s, ctx, model.maker), state = (s.models ??= {})[model.id] ??= { def: model.id, by: maker ?? by ?? "generic" };
  state.genericSince = s.clock.day; state.releasedDay ??= s.clock.day;
  for (const f of Object.values(s.factions)) if (f.alive && f.rnd) {
    if (!f.rnd.released.includes(model.id)) f.rnd.released.push(model.id);
    f.rnd.released.sort();
  }
  if (maker && by === "player") s.factions[maker]!.rep = Math.max(-100, s.factions[maker]!.rep - 15);
  else if (maker && by && factionId(s, ctx, by) && ctx.world.all("affinity").length) drive(s, ctx, "tech-leak", maker, factionId(s, ctx, by)!);
  ctx.emit("TechLeaked", { model: model.id, ...(by ? { by } : {}) });
}
export function treatyResearch(s: CampaignState, ctx: OpsCtx, r: Relation, treaty: TreatyState): void {
  const kind = ctx.world.require("treaty", treaty.def).kind;
  if (treaty.broken || kind !== "shell-pact" && kind !== "trade") return;
  if (kind === "trade" ? s.clock.day - treaty.signedDay < 6 * monthDays(s, ctx) : s.clock.day < treaty.endDay) return;
  for (const model of ctx.world.all("model")) if (model.exportPolicy === "licensed" && s.models?.[model.id]?.releasedDay !== undefined &&
    [r.a, r.b].includes(factionId(s, ctx, model.maker) ?? "")) leakModel(s, ctx, model.id);
}
export function factionModelPool(s: CampaignState, ctx: OpsCtx, faction: Id): Id[] {
  const def = ctx.world.get("faction-ops", faction) ?? ctx.world.all("faction-ops").find(f => f.faction === faction);
  if (!def) return [];
  const released = s.factions[def.id]?.rnd?.released;
  if (released) return [...released].sort();
  return ctx.world.all("model").filter(m => (m.maker === def.faction || m.maker === def.id || m.generic) &&
    m.role !== "captain" && "month" in m.availableFrom && m.availableFrom.month <= 0).map(m => m.id);
}
