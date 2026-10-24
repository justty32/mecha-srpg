import { runBattle, scenarioToSetup } from "../../sim/index.ts";
import type { SimSetup } from "../../sim/index.ts";
import type { CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { CmdResult } from "../crew/index.ts";
import { validateSortie } from "./validate.ts";
import { generateScenario } from "./scenario.ts";
import type { SortieScenario } from "./scenario.ts";
import { applyBattleResult } from "./apply.ts";
import type { BattleResult, SortieBattleResult } from "./apply.ts";

type BattleSetup = SimSetup["setup"];

function prepareSetup(s: CampaignState, ctx: OpsCtx, sortie: Sortie, scenario: SortieScenario, sim: SimSetup): void {
  const setup: BattleSetup = sim.setup, ids = new Map<string, string>();
  for (const unit of setup.units) {
    const before = unit.id;
    if (unit.owner !== "player") { unit.id = `${sortie.id}/${before}`; ids.set(before, unit.id); continue; }
    const mechId = scenario.ops.unitIds[Number(before.slice("player-".length))]!;
    const mech = s.mechs[mechId]!, selected = sortie.units.find(u => u.mech === mechId)!;
    unit.id = mechId; ids.set(before, mechId);
    unit.components = {};
    for (const part of Object.keys(mech.parts).sort()) for (const slot of Object.keys(mech.parts[part]!.components).sort()) {
      const component = mech.parts[part]!.components[slot]; if (component) unit.components[slot] = component;
    }
    for (const person of unit.persons ?? []) {
      const pid = selected.seats[person.seat];
      if (!pid) throw new Error(`missing sortie seat: ${person.seat}`);
      person.id = pid;
    }
    // 非傷勢機體池可帶入；hp 與人物 hp 留滿值供 apply 差分。controlMode 尚無 UnitInit 入口。
    unit.pools = Object.fromEntries(Object.keys(mech.pools).sort().filter(id => id !== "hp").map(id => [id, mech.pools[id]!.cur]));
  }
  for (const slot of Object.keys(sim.unitPolicies).sort()) sim.unitPolicies[slot] = Object.fromEntries(
    Object.keys(sim.unitPolicies[slot]!).sort().map(id => [ids.get(id) ?? id, sim.unitPolicies[slot]![id]!]));
  for (const objective of setup.objectives) {
    if (typeof objective.params.unit === "string") objective.params.unit = ids.get(objective.params.unit) ?? objective.params.unit;
    if (Array.isArray(objective.params.units)) objective.params.units = objective.params.units.map(id => typeof id === "string" ? ids.get(id) ?? id : id);
  }
  void ctx;
}

export function runSortie(s: CampaignState, ctx: OpsCtx, sortie: Sortie, opts: { maxSteps?: number } = {}): CmdResult & { result?: BattleResult } {
  const valid = validateSortie(s, ctx, sortie); if (!valid.ok) return valid;
  if (opts.maxSteps !== undefined && (!Number.isInteger(opts.maxSteps) || opts.maxSteps < 0)) return { ok: false, error: "invalid-max-steps" };
  const oldRng = structuredClone(s.rng), oldCounter = s.effectCounter, oldDB = ctx.db;
  try {
    const scenario = generateScenario(s, ctx, sortie) as SortieScenario;
    const sim = scenarioToSetup(ctx.db, scenario, scenario.seed!);
    prepareSetup(s, ctx, sortie, scenario, sim);
    const run = runBattle({ db: ctx.db, sim, seed: scenario.seed!, maxSteps: opts.maxSteps,
      players: { player: { kind: "ai" }, enemy: { kind: "ai" } } });
    if (!run.result) {
      s.rng = oldRng; s.effectCounter = oldCounter;
      return { ok: false, error: `battle-${run.stopped}` };
    }
    // 成功指令才會出現在 commands；不碰戰鬥內部 state，保留 BattleResult 作為狀態出口。
    const result: SortieBattleResult = { ...run.result, events: run.commands.flatMap(cmd => cmd.kind === "useAbility"
      ? [{ type: "AbilityUsed", payload: { unit: cmd.actor, ability: cmd.ability } }] : []) };
    // 臨時內容 id 不流出戰鬥入口；回傳的人物與活捕機體仍用營運原始 Def。
    for (const person of result.persons) {
      const original = s.roster.persons[person.id];
      if (original) person.state.def = original.def;
    }
    for (const unit of result.units) {
      const original = s.mechs[unit.id];
      if (original && sortie.units.some(u => u.mech === unit.id && u.controlMode === "instinct")) unit.state.frame = original.frame;
    }
    // 排隊中可出戰，成功跑完才退至尾端，失敗的指令不能改佇列。
    const selected = new Set(sortie.units.map(u => u.mech));
    let priority = Math.max(0, ...s.jobs.map(j => j.priority));
    for (const job of [...s.jobs].sort((a, b) => a.id < b.id ? -1 : 1)) if (selected.has(job.target) && !job.paid && job.doneHours === 0) job.priority = ++priority;
    ctx.db = oldDB;
    applyBattleResult(s, ctx, sortie, result);
    return { ok: true, result };
  } catch (error) {
    s.rng = oldRng; s.effectCounter = oldCounter;
    throw error;
  } finally { ctx.db = oldDB; }
}
