import type { Blueprint, Design, Diagnostic, Region, WorkOrder } from './schema.ts';
import { sampleTransition, slotMatrices, transformPoint, worldMatrices } from './rig.ts';
import { regionArea, regionDifference, transformRegion } from './geometry.ts';
import { failure } from './layout-validation.ts';
export function validateLayoutMotion(
  blueprint: Blueprint,
  design: Design,
  orders: WorkOrder[],
  diagnostics: Diagnostic[],
): void {
  const {
    rig,
    slots: { slots },
  } = blueprint;
  const poseReports = new Set<string>(),
    canvas: Region = [
      [
        [0, 0],
        [design.canvas.width, 0],
        [design.canvas.width, design.canvas.height],
        [0, design.canvas.height],
      ],
    ];
  for (const pose of blueprint.poses.poses) {
    const bind = blueprint.poses.poses.find((p) => p.id === 'bind') ?? { id: 'bind', angles: {} };
    for (const [sample, sampled] of (pose.id === 'bind'
      ? [pose]
      : sampleTransition(bind, pose)
    ).entries())
      try {
        const sampledWorld = worldMatrices(rig.bones, sampled),
          sampledSlots = slotMatrices(slots, sampledWorld);
        for (const order of orders) {
          const outside = regionDifference(
              transformRegion(order.localEnvelope, sampledSlots[order.slot]!),
              canvas,
            ),
            key = `${pose.id}:${order.id}`;
          if (regionArea(outside) > 1e-5 && !poseReports.has(key)) {
            diagnostics.push({
              ...failure(
                'layout-canvas',
                'Allocated part leaves canvas along sampled motion',
                [order.id],
                outside,
              ),
              pose: pose.id,
              sample,
            });
            poseReports.add(key);
          }
          for (const s of order.sockets)
            if (s.targetBone && s.targetAt) {
              const p = transformPoint(sampledSlots[order.slot]!, s.at),
                q = transformPoint(sampledWorld[s.targetBone]!, s.targetAt),
                socketKey = key + ':' + s.id;
              if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 1 && !poseReports.has(socketKey)) {
                diagnostics.push({
                  ...failure('moving-socket', 'Cross-bone socket drifts more than 1 unit', [
                    order.id,
                    s.id,
                    s.targetBone,
                  ]),
                  pose: pose.id,
                  sample,
                });
                poseReports.add(socketKey);
              }
            }
        }
      } catch (e) {
        const key = 'limits:' + pose.id;
        if (!poseReports.has(key)) {
          diagnostics.push({ ...failure('pose-rig', String(e), []), pose: pose.id, sample });
          poseReports.add(key);
        }
      }
  }
}
