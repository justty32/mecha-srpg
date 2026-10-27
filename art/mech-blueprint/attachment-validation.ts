import type { Attachment, Diagnostic, Region, WorkOrder } from './schema.ts';
import {
  assertConvex,
  expandRegion,
  regionArea,
  regionDifference,
  regionIntersection,
} from './geometry.ts';
const failure = (code: string, message: string, ids: string[], region?: Region): Diagnostic => ({
  code,
  severity: 'error',
  message,
  ids,
  ...(region ? { region } : {}),
});
export function validateAttachmentGeometry(
  attachment: Attachment,
  order: WorkOrder,
  actual: Region,
): Diagnostic[] {
  const out: Diagnostic[] = [];
  if (attachment.workOrderRevision !== order.revision)
    out.push(
      failure(
        'work-order-revision',
        'Attachment was not made for the current work order revision',
        [attachment.id],
      ),
    );
  for (const p of attachment.occupancy)
    try {
      assertConvex(p);
    } catch (e) {
      out.push(failure('occupancy', String(e), [attachment.id]));
    }
  if (
    attachment.id !== order.id ||
    attachment.layout !== order.layout ||
    attachment.source !== order.source ||
    attachment.element !== order.element
  )
    out.push(
      failure('attachment-reference', 'Attachment differs from its work order', [attachment.id]),
    );
  if (JSON.stringify(attachment.viewBox) !== JSON.stringify(order.viewBox))
    out.push(failure('viewbox', 'Attachment viewBox differs from work order', [attachment.id]));
  const outside = regionDifference(actual, expandRegion(order.localEnvelope, 2));
  if (regionArea(outside) > 1e-5)
    out.push(
      failure(
        'art-envelope',
        'Actual SVG geometry exceeds work envelope',
        [attachment.id],
        outside,
      ),
    );
  const unreported = regionDifference(actual, expandRegion(attachment.occupancy, 0.75));
  if (regionArea(unreported) > 1e-5)
    out.push(
      failure(
        'occupancy-underreport',
        'Actual SVG geometry extends beyond reported occupancy',
        [attachment.id],
        unreported,
      ),
    );
  const blocked = regionIntersection(actual, order.keepOut);
  if (regionArea(blocked) > 1e-5)
    out.push(
      failure('keepout', 'Actual SVG geometry intrudes into keepOut', [attachment.id], blocked),
    );
  if (attachment.contacts.length !== order.sockets.length)
    out.push(
      failure('contacts', 'Attachment must declare every work order socket', [attachment.id]),
    );
  for (const s of order.sockets) {
    const matches = attachment.contacts.filter((c) => c.socket === s.id),
      c = matches[0];
    if (matches.length !== 1 || !c || Math.hypot(c.at[0] - s.at[0], c.at[1] - s.at[1]) > 1)
      out.push(
        failure('contact-alignment', `Socket ${s.id} mismatch exceeds 1 unit`, [
          attachment.id,
          s.id,
        ]),
      );
  }
  return out;
}
