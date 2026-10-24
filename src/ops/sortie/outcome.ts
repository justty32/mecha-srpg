import type { BattleResult } from "./apply.ts";
import type { BattleOutcome } from "../../core/types-state.ts";
import type { OpsCtx, ServiceDef, Sortie } from "../state/types.ts";

export type Outcome = "win" | "repelled" | "withdrew" | "lost" | "timeout";
// 規則戰果已展開 BattleOutcome，但 BattleResult 型別尚未列 detail；withdrawn 相容舊結果。
type RetreatResult = BattleResult & Pick<BattleOutcome, "detail"> & { withdrawn?: readonly string[] };
export function classifyOutcome(result: RetreatResult, sortie: Sortie): { outcome: Outcome; killRatio: number } {
  const enemy = result.units.filter(u => u.state.owner === "enemy");
  const killRatio = enemy.length ? enemy.filter(u => u.status === "dead").length / enemy.length : 0;
  const ordered = [...sortie.units].sort((a, b) => a.mech < b.mech ? -1 : 1);
  const own = ordered.map((unit, i) => result.units.find(u => u.id === unit.mech || u.id === `player-${i}`));
  let outcome: Outcome;
  if (result.detail === "repelled") outcome = result.winner === "player" || result.winner === "ally" ? "repelled" : "withdrew";
  else if (result.withdrawn?.includes("player") || result.reason === "withdrew") outcome = "withdrew";
  else if (result.withdrawn?.includes("enemy") || result.reason === "repelled") outcome = "repelled";
  else if (enemy.length && enemy.every(u => u.status === "dead" || u.status === "retreated") && enemy.some(u => u.status === "retreated")) outcome = "repelled";
  else if (own.length && own.every(u => u?.status === "retreated")) outcome = "withdrew";
  else if (result.winner === null && result.reason === "timeout") outcome = "timeout";
  else outcome = result.winner === "player" || result.winner === "ally" ? "win" : "lost";
  return { outcome, killRatio };
}

type RetreatRules = { clearBase: number; clearKillShare: number; progressLoss: number; moraleLoss: number; relationDelta: number };
export function retreatRules(ctx: OpsCtx): RetreatRules {
  return (ctx.world.require("service", "service/retreat") as ServiceDef & { retreat: RetreatRules }).retreat;
}
