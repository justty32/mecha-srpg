import type { Blueprint, Matrix, OverlapIntent, OverlapRule, Region, Vec2 } from './schema.ts';
import {
  frameMatrix,
  inverse,
  multiply,
  sampleTransition,
  slotMatrices,
  worldMatrices,
} from './rig.ts';
import {
  assertConvex,
  convexHull,
  expandRegion,
  regionArea,
  regionDifference,
  regionIntersection,
  transformRegion,
} from './geometry.ts';
import { buildLayout } from './layout.ts';
export function allowedOverlap(
  intersection: Region,
  a: string,
  b: string,
  pose: string,
  rules: OverlapRule[],
  worlds: Record<string, Matrix>,
): Region {
  let unexplained = intersection;
  for (const rule of rules)
    if (
      ((rule.a === a && rule.b === b) || (rule.a === b && rule.b === a)) &&
      rule.poses.includes(pose) &&
      rule.reason.trim()
    ) {
      unexplained = regionDifference(
        unexplained,
        transformRegion(rule.zone.region, frameMatrix(rule.zone.frame, worlds)),
      );
    }
  return unexplained;
}
/** 只重建明列機構意圖的有界zone；不得由actual碰撞建立新pair。 */
export function planOverlapRules(blueprint: Blueprint, intents: OverlapIntent[]): OverlapRule[] {
  const orders = new Map(buildLayout(blueprint).workOrders.orders.map((o) => [o.id, o])),
    seen = new Set<string>(),
    rules: OverlapRule[] = [];
  const bind = blueprint.poses.poses.find((p) => p.id === 'bind') ?? { id: 'bind', angles: {} };
  const poses = blueprint.poses.poses.map((pose) => ({
    pose,
    samples: (pose.id === 'bind' ? [pose] : sampleTransition(bind, pose)).map((p) => {
      const worlds = worldMatrices(blueprint.rig.bones, p);
      return { worlds, slots: slotMatrices(blueprint.slots.slots, worlds) };
    }),
  }));
  for (const intent of intents) {
    const key = [intent.a, intent.b].sort().join('|'),
      a = orders.get(intent.a),
      b = orders.get(intent.b);
    if (!a || !b || a === b || seen.has(key) || !intent.reason.trim())
      throw new Error(`Invalid explicit overlap intent: ${key}`);
    seen.add(key);
    const ar = intent.regionA ?? a.localEnvelope,
      br = intent.regionB ?? b.localEnvelope;
    for (const p of [...ar, ...br]) assertConvex(p);
    const expandedA = expandRegion(ar, 2),
      expandedB = expandRegion(br, 2);
    for (const { pose, samples } of poses) {
      const points: Vec2[] = [];
      for (const sample of samples) {
        // a包絡已在a.frame；只把b轉到a局部，免交集走世界再逆轉造成排序雜訊。
        const relative = multiply(
          inverse(frameMatrix(a.frame, sample.worlds)),
          sample.slots[b.slot]!,
        );
        const intersection = regionIntersection(expandedA, transformRegion(expandedB, relative));
        if (regionArea(intersection) > 1e-5) points.push(...intersection.flat());
      }
      if (points.length)
        rules.push({
          id: `zone-${a.id}--${b.id}--${pose.id}`,
          a: a.id,
          b: b.id,
          kind: intent.kind,
          reason: intent.reason,
          zone: { frame: a.frame, region: [convexHull(points)] },
          poses: [pose.id],
        });
    }
  }
  return rules;
}
