import { nextFloat, nextInt } from "../../core/rng.ts";
import type { UnitSpawn, Objective, Cell } from "../../core/types-def.ts";
import type { CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { ForceState } from "../war/types.ts";
import type { SortieScenario } from "./scenario.ts";
import { instantiatePerson } from "../content/instantiate.ts";
import { modelPower, strength } from "../war/forces.ts";
import { joinForce, joinTerms, joinOperation, mercRules, forceUnitId } from "../war/merc.ts";

export function generateOperationScenario(s: CampaignState, ctx: OpsCtx, sortie: Sortie,
  standard: (s: CampaignState, ctx: OpsCtx, sortie: Sortie) => SortieScenario): SortieScenario {
  const c = s.contracts[sortie.contract ?? ""], op = c && joinOperation(s, c);
  if (!c || !op) throw new Error("operation-contract-missing");
  const scenario = standard(s, ctx, sortie), terms = joinTerms(ctx, c), cfg = mercRules(ctx, c), def = ctx.world.require("operation", op.def);
  const force = joinForce(s, c, op), power = modelPower(ctx);
  const ratio = cfg.allyFraction[0] + nextFloat(s.rng) * (cfg.allyFraction[1] - cfg.allyFraction[0]);
  const ids: Record<string, string> = {}; scenario.ops.forceIds = ids;
  const persons = scenario.personStates!;
  function spawn(model: string, id: string): UnitSpawn {
    const frame = ctx.db.require("frame", ctx.world.require("model", model).frame);
    const unit: UnitSpawn = { mech: frame.id, at: "zone", persons: [] };
    for (const seat of ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? [])) {
      const backgrounds = ctx.world.all("background").filter(b => b.person && seat.accepts.includes(ctx.db.require("person", b.person).kind === "soul" ? "soul" : "pilot"));
      const background = backgrounds.length ? backgrounds[nextInt(s.rng, backgrounds.length)] : undefined;
      const personDef = background?.person ? ctx.db.require("person", background.person) : ctx.db.all("person").find(p => p.id !== ctx.db.rules.cockpit?.growth?.awakenSoulTemplate && seat.accepts.includes(p.kind === "soul" ? "soul" : "pilot"));
      if (!personDef) continue;
      const pid = `${id}/${seat.id}`, p = instantiatePerson(ctx.db, pid, personDef.id);
      if (background) for (const [attr, [lo, hi]] of Object.entries(background.attrRanges)) p.attrsBase[attr] = lo + nextInt(s.rng, hi - lo + 1);
      persons[pid] = p; unit.persons!.push({ id: pid, seat: personDef.kind === "soul" ? "soul" : "pilot" });
    }
    return unit;
  }
  function select(f: ForceState, budget: number): string[] {
    const out: string[] = []; let used = 0;
    const pool = f.units.filter(u => u.count > 0 && u.readiness > 0).sort((a, b) => (power[b.model] ?? 0) - (power[a.model] ?? 0) || a.model.localeCompare(b.model));
    for (const u of pool) for (let i = 0; i < u.count && used + power[u.model]! * u.readiness <= budget; i++) {
      out.push(u.model); used += power[u.model]! * u.readiness;
    }
    if (!out.length && pool.length) out.push(pool.at(-1)!.model);
    return out;
  }
  const friendly = select(force, strength(force, power) * ratio);
  const attached = terms.command === "independent" ? 0 : Math.min(cfg.attachedMax, terms.command === "mixed" ? Math.max(1, Math.floor(friendly.length / 2)) : friendly.length);
  // attached 僅撥 1–3 台；其餘只在 mixed/independent 加入 AI slot。
  const allyModels = terms.command === "attached" ? [] : friendly.slice(attached);
  const player = scenario.slots.player!;
  for (const [i, model] of friendly.slice(0, attached).entries()) {
    const id = forceUnitId(sortie.id, "friend", model, i, true), key = `player-${player.units.length}`;
    ids[key] = id; player.units.push(spawn(model, id));
  }
  const coreFaction = ctx.db.require("faction", ctx.world.require("faction-ops", c.issuer).faction);
  if (allyModels.length) {
    player.allies = ["ally"];
    // SPEC-GAP：現有 FactionDef.strategy 為 strategy/default，尚非 aiprofile；無對應時沿用 sim 預設 tactical。
    scenario.slots.ally = { faction: coreFaction.id, ...(ctx.db.get("aiprofile", coreFaction.strategy) ? { ai: coreFaction.strategy } : {}), allies: ["player"], units: allyModels.map((model, i) => {
      const id = forceUnitId(sortie.id, "friend", model, i + attached); ids[`ally-${i}`] = id; return spawn(model, id);
    }) };
  }
  const enemyFaction = c.side === "target" ? op.actor : op.target.faction;
  const enemyForce = c.side === "target" ? op.force : op.reliefOf ? s.operations?.[op.reliefOf]?.force : enemyFaction ? s.factions[enemyFaction]?.forces : undefined;
  if (enemyForce) {
    const models = select(enemyForce, (c.side === "target" ? strength(op.force, power) : op.enemyStr) * ratio);
    const faction = ctx.db.require("faction", ctx.world.require("faction-ops", enemyFaction ?? s.operations![op.reliefOf!]!.actor).faction);
    scenario.slots.enemy = { faction: faction.id, ...(ctx.db.get("aiprofile", faction.strategy) ? { ai: faction.strategy } : {}), units: models.map((model, i) => {
      const id = forceUnitId(sortie.id, "enemy", model, i); ids[`enemy-${i}`] = id; return spawn(model, id);
    }) };
  }
  // SPEC-GAP：節點版沒有格圖模板；沿用 ScenarioGen 地形配方，擴展部署列以容納分遣隊。
  const map = scenario.ops.map, height = Math.max(map.height, player.units.length, allyModels.length, scenario.slots.enemy!.units.length);
  if (height > map.height) {
    const cells = typeof map.cells === "string" ? Array.from(map.cells) : [...map.cells.rle.replace(/\s+/gu, "").matchAll(/([1-9][0-9]*)([^0-9])/gu)].flatMap(m => Array<string>(Number(m[1])).fill(m[2]!));
    map.cells = Array.from({ length: height * map.width }, (_, i) => cells[i % cells.length]!).join(""); map.height = height;
  }
  map.deployZones.player = Array.from({ length: height }, (_, y) => ({ x: 1, y }));
  map.deployZones.ally = Array.from({ length: height }, (_, y) => ({ x: 2, y }));
  map.deployZones.enemy = Array.from({ length: height }, (_, y) => ({ x: map.width - 1, y }));
  map.exits = Array.from({ length: height }, (_, y) => ({ x: ["escort", "relic-hunt"].includes(def.kind) ? map.width - 1 : 0, y }));
  const defaultObjective = (): Objective => {
    const kind = def.kind;
    if (kind === "relic-hunt") return { kind: "reachExit", params: { unit: "player-0" }, for: "player", onComplete: "win" };
    if (kind === "escort") return { kind: "escort", params: { units: ["player-0"] }, for: "player", onComplete: "win" };
    if (["contain", "seize", "relief"].includes(kind) || kind === "siege" && op.progress > 0) return { kind: "hold", params: { rounds: 2, zone: map.deployZones.enemy }, for: "player", onComplete: "win" };
    if (kind === "assault") {
      const rift = s.rifts[op.target.rift ?? ""], family = rift && (ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(r => r.family === rift.family));
      if (family?.anchor && scenario.slots.enemy!.units.some(u => u.monster === family.anchor)) return { kind: "killTarget", params: { target: family.anchor }, for: "player", onComplete: "win" };
    }
    return { kind: "eliminate", params: { slots: ["enemy"] }, for: "player", onComplete: "win" };
  };
  const objective = def.phases.find(p => p.phase === "engage")?.objective;
  const expand = (o: typeof objective & {}): Objective => ({ kind: o.kind, params: { ...structuredClone(o.params),
    ...(o.kind === "hold" && !Array.isArray(o.params.zone) ? { zone: map.deployZones.enemy as Cell[] } : {}) }, for: "player", onComplete: o.optional ? "continue" : "win" });
  scenario.objectives = [objective ? expand(objective) : defaultObjective(), ...terms.orders.map(o => expand({ ...o, optional: true })),
    { kind: "eliminate", params: { slots: ["player", ...(allyModels.length ? ["ally"] : [])] }, for: "enemy", onComplete: "win" }];
  return scenario;
}
