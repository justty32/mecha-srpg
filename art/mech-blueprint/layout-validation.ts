import type { Blueprint, Diagnostic, Region } from './schema.ts';
export const failure = (
  code: string,
  message: string,
  ids: string[],
  region?: Region,
): Diagnostic => ({
  code,
  severity: 'error',
  message,
  ids,
  ...(region ? { region } : {}),
});
export function duplicates(ids: string[], kind: string): Diagnostic[] {
  const seen = new Set<string>(),
    out: Diagnostic[] = [];
  for (const id of ids) {
    if (!id || seen.has(id))
      out.push(failure('duplicate-id', `Invalid or duplicate ${kind}: ${id}`, [id]));
    seen.add(id);
  }
  return out;
}
export function validateOrder(blueprint: Blueprint): Diagnostic[] {
  const {
      slots: { slots },
      order,
    } = blueprint,
    out = duplicates(order.base, 'draw order slot'),
    expected = new Set(slots.map((s) => s.id));
  for (const id of order.base)
    if (!expected.has(id))
      out.push(failure('unknown-order-slot', `Unknown slot in draw order: ${id}`, [id]));
  for (const id of expected)
    if (!order.base.includes(id))
      out.push(failure('missing-order-slot', `Slot missing from draw order: ${id}`, [id]));
  const edges = new Map<string, string[]>();
  for (const [a, b] of order.before) {
    if (!expected.has(a) || !expected.has(b))
      out.push(failure('unknown-order-constraint', 'Unknown before constraint', [a, b]));
    if (order.base.indexOf(a) >= order.base.indexOf(b))
      out.push(failure('draw-order', 'before constraint violated', [a, b]));
    edges.set(a, [...(edges.get(a) ?? []), b]);
  }
  const visiting = new Set<string>(),
    done = new Set<string>();
  function visit(id: string): void {
    if (visiting.has(id)) throw new Error(id);
    if (done.has(id)) return;
    visiting.add(id);
    for (const child of edges.get(id) ?? []) visit(child);
    visiting.delete(id);
    done.add(id);
  }
  try {
    for (const id of expected) visit(id);
  } catch (e) {
    out.push(failure('order-cycle', `Draw order cycle: ${String(e)}`, []));
  }
  return out;
}
