import type { Blueprint, Design, Matrix, Region, WorkOrder } from './schema.ts';
import { transformPoint } from './rig.ts';
import { transformRegion } from './geometry.ts';
export function drawLayout(
  design: Design,
  rig: Blueprint['rig'],
  orders: WorkOrder[],
  nodeWorld: Record<string, Matrix>,
  worlds: Record<string, Matrix>,
): { svg: string; workOrdersSvg: string } {
  const colors = { machine: '#64748b', major: '#3b82f6', assembly: '#10b981', part: '#eab308' };
  const paths = design.nodes
    .filter((n) => nodeWorld[n.id])
    .map((n) => {
      const r = transformRegion(n.envelope, nodeWorld[n.id]!);
      return `<g id="layout-${escapeXml(n.id)}" fill="${colors[n.level]}" fill-opacity="${n.level === 'part' ? '.2' : '.025'}" stroke="${colors[n.level]}" stroke-width="${n.level === 'part' ? 1 : 2}">${r.map((p) => `<polygon points="${p.map((v) => v.join(',')).join(' ')}"/>`).join('')}<title>${escapeXml(n.id)}</title></g>`;
    })
    .join('\n');
  const boneOverlay = rig.bones
    .filter((b) => worlds[b.id])
    .map((b) => {
      const p = transformPoint(worlds[b.id]!, [0, 0]),
        parent = b.parent && worlds[b.parent] ? transformPoint(worlds[b.parent]!, [0, 0]) : p;
      return `<g fill="#f472b6" stroke="#f472b6"><line x1="${parent[0]}" y1="${parent[1]}" x2="${p[0]}" y2="${p[1]}" stroke-width="1.5"/><circle cx="${p[0]}" cy="${p[1]}" r="4"/><text x="${p[0] + 6}" y="${p[1] - 7}" font-size="9" stroke="none">${escapeXml(b.id)} (${p.map((n) => Math.round(n)).join(',')})</text></g>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${design.canvas.width} ${design.canvas.height}"><rect width="100%" height="100%" fill="#0c1423"/>${paths}<g id="bone-chain-overlay">${boneOverlay}</g></svg>\n`;
  const tileWidth = 240,
    tileHeight = 250;
  const tiles = orders
    .map((o, i) => {
      const [x, y, w, h] = o.viewBox,
        scale = Math.min(200 / w, 175 / h),
        tx = 20 - x * scale,
        ty = 38 - y * scale;
      const shapes = (r: Region, fill: string, stroke: string) =>
        r
          .map(
            (p) =>
              `<polygon points="${p.map((v) => v.join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${1 / scale}"/>`,
          )
          .join('');
      return `<g transform="translate(${(i % 8) * tileWidth},${Math.floor(i / 8) * tileHeight})"><rect x="2" y="2" width="236" height="246" fill="#111e31" stroke="#334155"/><text x="12" y="20" fill="#f8fafc" font-size="10">${escapeXml(o.id)}</text><g transform="translate(${tx},${ty}) scale(${scale})">${shapes(o.localEnvelope, '#36526b', '#67e8f9')}${shapes(o.keepOut, '#991b1b', '#ef4444')}<path d="M -8 0 L 8 0 M 0 -8 L 0 8" stroke="#fbbf24" stroke-width="${1.5 / scale}"/>${o.contacts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="${3 / scale}" fill="#f472b6"/>`).join('')}</g><text x="12" y="231" fill="#94a3b8" font-size="9">${escapeXml(o.frame.bone)} · ${escapeXml(o.revision)}</text></g>`;
    })
    .join('\n');
  const workOrdersSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${8 * tileWidth} ${Math.ceil(orders.length / 8) * tileHeight}"><rect width="100%" height="100%" fill="#07111e"/>${tiles}</svg>\n`;
  return { svg, workOrdersSvg };
}
const escapeXml = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!,
  );
