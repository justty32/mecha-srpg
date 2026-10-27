import type {
  Blueprint,
  Diagnostic,
  LayoutData,
  Matrix,
  WorkOrder,
  WorkOrdersData,
} from './schema.ts';
import {
  frameMatrix,
  inverse,
  multiply,
  slotMatrices,
  transformPoint,
  worldMatrices,
} from './rig.ts';
import { assertConvex, bounds, regionArea, regionDifference, transformRegion } from './geometry.ts';
import { failure, duplicates, validateOrder } from './layout-validation.ts';
import { validateLayoutMotion } from './layout-motion.ts';
import { drawLayout } from './layout-drawing.ts';
export { validateOrder } from './layout-validation.ts';
import { createHash } from 'node:crypto';
import { allocateDesign } from './layout-allocation.ts';
export { allocateDesign } from './layout-allocation.ts';
export { validateAttachmentGeometry } from './attachment-validation.ts';
export { allowedOverlap, planOverlapRules } from './layout-overlap.ts';
export type LayoutResult = {
  layout: LayoutData;
  workOrders: WorkOrdersData;
  diagnostics: Diagnostic[];
  svg: string;
  workOrdersSvg: string;
};
export function buildLayout(blueprint: Blueprint): LayoutResult {
  const {
      rig,
      slots: { slots },
    } = blueprint,
    design = allocateDesign(blueprint.design, rig.bones),
    diagnostics: Diagnostic[] = [...validateOrder(blueprint)];
  diagnostics.push(
    ...duplicates(
      design.nodes.map((n) => n.id),
      'layout',
    ),
    ...duplicates(
      slots.map((s) => s.id),
      'slot',
    ),
    ...duplicates(
      design.parts.map((p) => p.id),
      'part',
    ),
  );
  let worlds: Record<string, Matrix> = {},
    slotWorld: Record<string, Matrix> = {};
  try {
    worlds = worldMatrices(rig.bones);
    slotWorld = slotMatrices(slots, worlds);
  } catch (e) {
    diagnostics.push(failure('rig', String(e), []));
  }
  const nodes = new Map(design.nodes.map((n) => [n.id, n])),
    nodeWorld: Record<string, Matrix> = {},
    visited = new Set<string>(),
    visiting = new Set<string>();
  const levels = ['machine', 'major', 'assembly', 'part'];
  function visit(id: string): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Layout cycle: ${id}`);
    const n = nodes.get(id);
    if (!n) throw new Error(`Unknown layout parent: ${id}`);
    visiting.add(id);
    if (n.parent !== null) visit(n.parent);
    try {
      if (!n.envelope.length) throw new Error('Empty envelope');
      for (const p of n.envelope) assertConvex(p);
      nodeWorld[id] = frameMatrix(n.frame, worlds);
      if (n.parent !== null) {
        const parent = nodes.get(n.parent)!;
        if (levels.indexOf(n.level) !== levels.indexOf(parent.level) + 1)
          diagnostics.push(
            failure('layout-level', 'Layout must descend machine → major → assembly → part', [
              id,
              n.parent,
            ]),
          );
        const local = transformRegion(
          n.envelope,
          multiply(inverse(nodeWorld[n.parent]!), nodeWorld[id]!),
        );
        const outside = regionDifference(local, parent.envelope);
        if (regionArea(outside) > 1e-5)
          diagnostics.push(
            failure(
              'parent-envelope',
              'Child envelope extends outside parent union',
              [id, n.parent],
              transformRegion(outside, nodeWorld[n.parent]!),
            ),
          );
      }
      diagnostics.push(
        ...duplicates(
          n.sockets.map((s) => s.id),
          `socket in ${id}`,
        ),
      );
      for (const s of n.sockets)
        if (!s.at.every(Number.isFinite) || !Number.isFinite(s.axis))
          diagnostics.push(failure('socket', 'Invalid socket', [id, s.id]));
    } catch (e) {
      diagnostics.push(failure('layout-geometry', `${id}: ${String(e)}`, [id]));
    }
    visiting.delete(id);
    visited.add(id);
  }
  try {
    for (const n of design.nodes) visit(n.id);
  } catch (e) {
    diagnostics.push(failure('layout-tree', String(e), []));
  }
  const orders: WorkOrder[] = [],
    usedSlots = new Set<string>(),
    usedLayouts = new Set<string>();
  for (const p of design.parts) {
    const node = nodes.get(p.layout),
      slot = slots.find((s) => s.id === p.slot);
    if (
      !node ||
      node.level !== 'part' ||
      !slot ||
      slot.attachment !== p.id ||
      !nodeWorld[p.layout] ||
      !slotWorld[p.slot]
    ) {
      diagnostics.push(
        failure(
          'part-reference',
          'Part requires one leaf layout, valid slot and matching attachment',
          [p.id, p.layout, p.slot],
        ),
      );
      continue;
    }
    if (usedSlots.has(slot.id) || usedLayouts.has(node.id))
      diagnostics.push(
        failure('part-duplicate', 'Parts must own unique slots and leaf layouts', [
          p.id,
          slot.id,
          node.id,
        ]),
      );
    usedSlots.add(slot.id);
    usedLayouts.add(node.id);
    const toLocal = multiply(inverse(slotWorld[p.slot]!), nodeWorld[p.layout]!);
    const localEnvelope = transformRegion(node.envelope, toLocal),
      contacts = node.sockets.map((s) => transformPoint(toLocal, s.at));
    for (const socket of node.sockets)
      if (socket.targetBone || socket.targetAt) {
        const target = socket.targetBone ? worlds[socket.targetBone] : undefined;
        if (!target || !socket.targetAt) {
          diagnostics.push(
            failure('socket-target', 'Socket must identify a valid target bone and local point', [
              p.id,
              socket.id,
            ]),
          );
          continue;
        }
        const expected = transformPoint(target, socket.targetAt),
          actual = transformPoint(nodeWorld[p.layout]!, socket.at);
        if (Math.hypot(actual[0] - expected[0], actual[1] - expected[1]) > 1)
          diagnostics.push(
            failure('socket-target', 'Socket is more than 1 unit from its target bone point', [
              p.id,
              socket.id,
              socket.targetBone!,
            ]),
          );
      }
    if (
      localEnvelope.every(
        (poly) =>
          poly.length === 4 &&
          poly.every((a, i) => {
            const b = poly[(i + 1) % 4]!;
            return Math.abs(a[0] - b[0]) < 1e-6 || Math.abs(a[1] - b[1]) < 1e-6;
          }),
      )
    )
      diagnostics.push(
        failure('rectangle-part', 'Part needs a meaningful nonrectangular silhouette', [p.id]),
      );
    try {
      for (const region of p.keepOut) assertConvex(region);
    } catch (e) {
      diagnostics.push(failure('keepout', String(e), [p.id]));
    }
    if (!p.source.endsWith(`/${p.id}.svg`) || !p.element)
      diagnostics.push(
        failure('source', 'Each attachment must own an SVG named by its ID', [p.id]),
      );
    const [x, y, w, h] = bounds(localEnvelope),
      padding = 4;
    orders.push({
      id: p.id,
      revision: design.revision,
      layout: node.id,
      slot: slot.id,
      localEnvelope,
      keepOut: p.keepOut,
      contacts,
      viewBox: [
        Math.floor(x - padding),
        Math.floor(y - padding),
        Math.ceil(w + padding * 2),
        Math.ceil(h + padding * 2),
      ],
      role: p.role,
      material: p.material,
      silhouette: p.silhouette,
      source: p.source,
      element: p.element,
      frame: { bone: slot.bone, transform: slot.local },
      sockets: node.sockets.map((s, i) => ({ ...s, at: contacts[i]! })),
    });
  }
  for (const slot of slots)
    if (!usedSlots.has(slot.id))
      diagnostics.push(failure('missing-part', 'Slot lacks a work order', [slot.id]));
  for (const node of design.nodes)
    if (node.level === 'part' && !usedLayouts.has(node.id))
      diagnostics.push(failure('missing-part', 'Leaf layout lacks a work order', [node.id]));
  validateLayoutMotion(blueprint, design, orders, diagnostics);
  const sourceHash = createHash('sha256').update(canonical(blueprint)).digest('hex');
  const layout: LayoutData = {
    version: design.version,
    revision: design.revision,
    sourceHash,
    canvas: design.canvas,
    nodes: design.nodes,
  };
  const workOrders: WorkOrdersData = {
    version: design.version,
    revision: design.revision,
    sourceHash,
    orders,
  };
  const { svg, workOrdersSvg } = drawLayout(design, rig, orders, nodeWorld, worlds);
  return { layout, workOrders, diagnostics, svg, workOrdersSvg };
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => JSON.stringify(k) + ':' + canonical(v))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
