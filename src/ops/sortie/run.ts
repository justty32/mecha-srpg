import { runBattle, scenarioToSetup } from "../../sim/index.ts";
import type { SimSetup } from "../../sim/index.ts";
import type { CampaignState, OpsCtx, Sortie } from "../state/types.ts";
import type { CmdResult } from "../crew/index.ts";
import { validateSortie } from "./validate.ts";
import { generateScenario } from "./scenario.ts";
import type { SortieScenario } from "./scenario.ts";
import { applyBattleResult } from "./apply.ts";
import type { BattleResult } from "./apply.ts";

type BattleSetup = SimSetup["setup"];

function prepareSetup(s: CampaignState, ctx: OpsCtx, sortie: Sortie, scenario: SortieScenario, sim: SimSetup): void {
  const setup: BattleSetup = sim.setup, ids = new Map<string, string>();
  for (const unit of setup.units) {
    const before = unit.id;
    const forceId = scenario.ops.forceIds?.[before];
    if (forceId) { unit.id = forceId; ids.set(before, forceId); continue; }
    if (unit.owner !== "player") { unit.id = `${sortie.id}/${before}`; ids.set(before, unit.id); continue; }
    const mechId = scenario.ops.unitIds[Number(before.slice("player-".length))]!;
    const mech = s.mechs[mechId]!, selected = sortie.units.find(u => u.mech === mechId)!;
    unit.id = mechId; ids.set(before, mechId);
    unit.components = {};
    for (const part of Object.keys(mech.parts).sort()) for (const slot of Object.keys(mech.parts[part]!.components).sort()) {
      const component = mech.parts[part]!.components[slot]; if (component) unit.components[slot] = s.inventory.components.find(c => c.id === component)?.def ?? component;
    }
    for (const person of unit.persons ?? []) {
      const pid = selected.seats[person.seat];
      if (!pid) throw new Error(`missing sortie seat: ${person.seat}`);
      person.id = pid;
    }
    unit.parts = Object.fromEntries(Object.entries(mech.parts).map(([id, part]) => [id, structuredClone({ layers: part.layers, broken: part.broken })]));
    unit.controlMode = selected.controlMode;
    unit.effects = structuredClone(mech.effects);
    unit.pools = { ...Object.fromEntries(Object.keys(mech.pools).sort().map(id => [id, mech.pools[id]!.cur])), ...unit.pools };
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
  const oldRng = structuredClone(s.rng), oldCounter = s.effectCounter;
  try {
    const scenario = generateScenario(s, ctx, sortie);
    const sim = scenarioToSetup(ctx.db, scenario, scenario.seed!);
    prepareSetup(s, ctx, sortie, scenario, sim);
    const run = runBattle({ db: ctx.db, sim, seed: scenario.seed!, maxSteps: opts.maxSteps,
      players: { player: { kind: "ai" }, enemy: { kind: "ai" } } });
    if (!run.result) {
      s.rng = oldRng; s.effectCounter = oldCounter;
      return { ok: false, error: `battle-${run.stopped}` };
    }
    const result = run.result;
    for (const unit of result.units) {
      const original = s.mechs[unit.id];
      if (original && sortie.units.some(u => u.mech === unit.id && u.controlMode === "instinct")) unit.state.frame = original.frame;
    }
    applySortieResult(s, ctx, sortie, result);
    return { ok: true, result };
  } catch (error) {
    s.rng = oldRng; s.effectCounter = oldCounter;
    throw error;
  }
}

/** 唯讀查詢（lead-ui-ops 新增）：在 state 副本上做出戰檢查、情境生成與 setup 對位，回傳可交給互動戰場的 sim setup。
 *  輸入 state 不變；同一 state 稍後經 `sortie` 指令實際回寫時，情境生成消耗的 RNG 與此相同（seed 一致）。 */
export function sortieBattleSetup(input: CampaignState, ctx: OpsCtx, sortie: Sortie): { ok: true; scenario: SortieScenario; sim: SimSetup; seed: number } | { ok: false; error: string } {
  const s = structuredClone(input);
  const valid = validateSortie(s, ctx, sortie); if (!valid.ok) return valid;
  const scenario = generateScenario(s, ctx, sortie);
  const sim = scenarioToSetup(ctx.db, scenario, scenario.seed!);
  prepareSetup(s, ctx, sortie, scenario, sim);
  return { ok: true, scenario, sim, seed: scenario.seed! };
}

// 正常出戰與營運重播共用戰後入口，確保排隊與回寫次序一致。
export function applySortieResult(s: CampaignState, ctx: OpsCtx, sortie: Sortie, result: BattleResult): void {
  if (s.log.some(e => e.type === "BattleResolved" && e.payload.sortie === sortie.id)) return;
  const selected = new Set(sortie.units.map(u => u.mech));
  let priority = Math.max(0, ...s.jobs.map(j => j.priority));
  for (const job of [...s.jobs].sort((a, b) => a.id < b.id ? -1 : 1)) if (selected.has(job.target) && !job.paid && job.doneHours === 0) job.priority = ++priority;
  applyBattleResult(s, ctx, sortie, result);
}
