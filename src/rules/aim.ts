import type { Id } from "../core/ids.ts";
import type { PartId } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { canMove, stepCost } from "./movement.ts";
import { attackKind } from "./resistance.ts";
import { roleAttr } from "./contribs.ts";
import { commanderOf, distance, evalCtxFor, frameView, partDefs, seatsOf, terrainAt, unit } from "./state.ts";
import type { Ctx } from "./state.ts";

export type AimInfo = { chance: number; aim: { radius: number; error: number; distance: number; lateral: number; maneuver: number; cover: number; skill: number } };
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** 中心對齊等效圓：同一純函式供預覽與實判，不再疊加舊命中加值或上下限。 */
export function aimInfo(ctx: Ctx, actor: Id, abilityId: Id, target: Id, part?: PartId): AimInfo {
  const ability = ctx.db.require("ability", abilityId), from = unit(ctx, actor), to = unit(ctx, target);
  const body = ctx.db.require("bodyplan", frameView(ctx, target).bodyPlan);
  const bodyRadius = body.targetRadius ?? 1;
  const targetRadius = part === undefined ? bodyRadius : partDefs(ctx, target).find(p => p.id === part)?.targetRadius ?? bodyRadius * 0.35;
  const cover = clamp(terrainAt(ctx, to.pos).cover / 100, 0, 1), radius = Math.max(0, targetRadius) * Math.sqrt(1 - cover);
  const d = distance(from.pos, to.pos), dx = to.pos.x - from.pos.x, dy = to.pos.y - from.pos.y, length = Math.hypot(dx, dy);
  const motion = to.motion ?? { dx: 0, dy: 0 }, constants = ctx.db.rules.constants;
  const lateral = !canMove(ctx, target) ? 0 : Math.min(constants.aimMaxLateralSpeed ?? 1.5, length === 0 ? 0 : Math.abs(motion.dx * dy / length - motion.dy * dx / length));
  const defender = commanderOf(ctx, target), commander = ability.actorRole ? seatsOf(ctx, actor).find(s => s.role === ability.actorRole)?.person : commanderOf(ctx, actor);
  const maneuver = canManeuver(ctx, target, from.pos) ? Math.max(0, roleAttr(ctx, { unit: target, ...(defender ? { person: defender } : {}) }, "maneuver")) : 0;
  const speed = Math.min(2, lateral + maneuver);
  const accuracy = roleAttr(ctx, { unit: actor, ...(commander ? { person: commander } : {}) }, "accuracy");
  const skill = clamp(50 / Math.max(1, accuracy), 0.5, 2);
  const dispersion = ability.aim?.dispersion ?? constants.aimDispersion ?? 0.08;
  const delay = ability.aim?.trackingDelay ?? constants.aimTrackingDelay ?? 0.1;
  const projectileSpeed = Math.max(Number.EPSILON, ability.aim?.projectileSpeed ?? constants.aimProjectileSpeed ?? 20);
  const travel = attackKind(ctx, actor, abilityId) === "melee" ? ability.aim?.windup ?? constants.aimMeleeWindup ?? 0.8 : d / projectileSpeed;
  let error = (d * dispersion + speed * (delay + travel)) * skill;
  if (part !== undefined) {
    // 既有partAim.penalty為NumExpr，維持可求值而不把它當固定百分點。
    error *= 1 + aimPenalty(ctx, actor, target, abilityId) / 100;
  }
  const friendly = ability.target.kind === "self" || ability.target.friendly === "only";
  const chance = friendly ? 100 : radius === 0 && error === 0 ? 0 : error <= radius ? 100 : 100 * (radius / error) ** 2;
  return { chance, aim: { radius, error, distance: d, lateral, maneuver, cover, skill } };
}

function aimPenalty(ctx: Ctx, actor: Id, target: Id, abilityId: Id): number {
  const ability = ctx.db.require("ability", abilityId);
  const commander = ability.actorRole ? seatsOf(ctx, actor).find(s => s.role === ability.actorRole)?.person : commanderOf(ctx, actor);
  return evalNum(ctx.db.require("ability", abilityId).partAim?.penalty ?? 0,
    evalCtxFor(ctx, { unit: actor, ...(commander ? { person: commander } : {}) }, { unit: target }));
}

/** 付費閃身必須有健康移動部位及可側移空格；不真的移動到該格。 */
export function canManeuver(ctx: Ctx, id: Id, from?: { x: number; y: number }): boolean {
  if (!canMove(ctx, id)) return false;
  const pos = unit(ctx, id).pos, shotX = from ? pos.x - from.x : 0, shotY = from ? pos.y - from.y : 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy || from && dx * shotY === dy * shotX) continue;
    if (stepCost(ctx, id, pos, { x: pos.x + dx, y: pos.y + dy }) !== null) return true;
  }
  return false;
}
