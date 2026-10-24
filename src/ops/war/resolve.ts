import { nextFloat } from "../../core/rng.ts";
import type { RngState } from "../../core/types-state.ts";
import type { OperationState } from "./types.ts";
import { strength } from "./forces.ts";
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export function engageFactors(r: number, m: number) {
  return { progress: clamp(0.25 * Math.sqrt(r) * m, 0.05, 0.6), loss: clamp(0.12 / r, 0.03, 0.25), enemyLoss: clamp(0.2 * r, 0.05, 0.4) };
}
export function terminalPhase(op: OperationState): "resolve" | "failed" | "aborted" | undefined {
  if (op.progress >= 1) return "resolve";
  if (op.force.morale <= -2 || strength(op.force, op.power ?? {}) < 0.3 * (op.initialStr ?? 0)) return "failed";
  if (op.force.supply <= 0) return "aborted";
  return undefined;
}
// 輸入作戰與 RNG 均不改動；呼叫端每交手消耗一個 warRng 擲值。
export function resolveEngage(op: OperationState, rng: RngState): OperationState {
  const next = structuredClone(op), power = op.power ?? {};
  const r = strength(op.force, power) / Math.max(Number.EPSILON, op.enemyStr);
  const f = engageFactors(r, 0.7 + nextFloat({ ...rng }) * 0.6);
  next.progress = Math.min(1, op.progress + f.progress);
  next.force.units = op.force.units.map(u => ({ ...u, readiness: u.readiness * (1 - f.loss), count: Math.max(0, Math.round(u.count * (1 - f.loss))) }));
  next.enemyStr *= 1 - f.enemyLoss; next.force.supply = Math.max(0, next.force.supply - 10); next.engagesLeft--;
  next.phase = terminalPhase(next) ?? (next.engagesLeft <= 0 ? "failed" : "engage");
  return next;
}
