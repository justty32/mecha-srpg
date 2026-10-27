import type { Polygon, Region } from './schema.ts';
import { circle, expandRegion, regionDifference, triangulate } from './geometry.ts';
function numbers(s: string): number[] {
  const token = s.match(/[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g) ?? [];
  if (s.replace(/[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g, '').replace(/[\s,]/g, ''))
    throw new Error('Invalid SVG numeric syntax');
  const result = token.map(Number);
  if (!result.every(Number.isFinite)) throw new Error('Non-finite SVG number');
  return result;
}
function pathPolygons(d: string): Polygon[] {
  const tokens = d.match(/[A-Za-z]|[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g) ?? [];
  if (d.replace(/[A-Za-z]|[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?/g, '').replace(/[\s,]/g, ''))
    throw new Error('Invalid path syntax');
  const out: Polygon[] = [];
  let p: Polygon = [],
    command = '',
    closed = true;
  for (let i = 0; i < tokens.length;) {
    const t = tokens[i]!;
    if (/^[A-Za-z]$/.test(t)) {
      if (!['M', 'L', 'Z'].includes(t)) throw new Error(`Unsupported path command: ${t}`);
      command = t;
      i++;
      if (t === 'Z') {
        if (p.length < 3) throw new Error('Invalid closed path');
        out.push(p);
        p = [];
        closed = true;
        command = '';
        continue;
      }
      if (t === 'M') {
        if (!closed) throw new Error('Every SVG path subpath must close');
        closed = false;
      }
    }
    if (command !== 'M' && command !== 'L') throw new Error('Path requires M/L/Z');
    const x = Number(tokens[i]),
      y = Number(tokens[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Incomplete path point');
    p.push([x, y]);
    i += 2;
    if (command === 'M') command = 'L';
  }
  if (!closed || p.length) throw new Error('Open SVG paths are not supported');
  if (out.length > 1) throw new Error('Use separate shapes instead of compound SVG paths');
  return out;
}
type Attrs = Record<string, string>;
function attributes(s: string): Attrs {
  const out: Attrs = {};
  let end = 0;
  const re = /([\w:-]+)\s*=\s*(["'])(.*?)\2/gs;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (s.slice(end, m.index).trim()) throw new Error('Malformed SVG attribute');
    if (out[m[1]!] !== undefined) throw new Error('Duplicate SVG attribute');
    out[m[1]!] = m[3]!;
    end = re.lastIndex;
  }
  if (s.slice(end).trim()) throw new Error('Malformed SVG attributes');
  return out;
}
/** 僅解析本批約定素材語法；所有未支援可見幾何均明確拒絕。 */
export function parseSvgGeometry(svg: string, elementId: string): Region {
  if (/<!DOCTYPE|<!ENTITY|<script\b|<foreignObject\b/i.test(svg))
    throw new Error('Unsupported SVG document content');
  const stack: {
    tag: string;
    active: boolean;
    defs: boolean;
    attrs: Attrs;
    depth: number;
  }[] = [];
  let rootCount = 0;
  const result: Region = [];
  const tags =
    svg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\?[\s\S]*?\?>/g, '')
      .match(/<[^>]*>/g) ?? [];
  for (const token of tags) {
    const closing = /^<\//.test(token),
      self = /\/\s*>$/.test(token),
      match = token.match(/^<\/?([\w:-]+)([\s\S]*?)\/?\s*>$/);
    if (!match) throw new Error('Malformed SVG tag');
    const tag = match[1]!;
    if (closing) {
      if (stack.pop()?.tag !== tag) throw new Error('Unbalanced SVG tags');
      continue;
    }
    const own = attributes(match[2]!),
      parent = stack.at(-1),
      defs = tag === 'defs' || (parent?.defs ?? false);
    if (own.id === elementId) {
      if (tag !== 'g') throw new Error('Attachment root must be g');
      rootCount++;
    }
    const active = (parent?.active ?? false) || own.id === elementId;
    const inherited: Attrs = {};
    for (const k of [
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'opacity',
      'fill-opacity',
      'stroke-opacity',
    ])
      if (parent?.attrs[k] !== undefined) inherited[k] = parent.attrs[k]!;
    const attrs = { ...inherited, ...own },
      depth = (parent?.depth ?? 0) + (active && tag === 'g' ? 1 : 0);
    if (
      ['transform', 'clip-path', 'mask', 'filter', 'style', 'vector-effect'].some(
        (k) => own[k] !== undefined,
      )
    )
      throw new Error(`Unsupported SVG presentation on ${tag}`);
    if (
      [
        'use',
        'image',
        'text',
        'polyline',
        'line',
        'clipPath',
        'mask',
        'filter',
        'symbol',
        'pattern',
        'style',
        'animate',
        'animateTransform',
        'set',
      ].includes(tag)
    )
      throw new Error(`Unsupported SVG element: ${tag}`);
    if (
      defs &&
      !['defs', 'linearGradient', 'radialGradient', 'stop', 'title', 'desc'].includes(tag)
    )
      throw new Error(`Unsupported SVG defs: ${tag}`);
    if (
      !defs &&
      ![
        'svg',
        'g',
        'path',
        'polygon',
        'circle',
        'ellipse',
        'rect',
        'title',
        'desc',
        'metadata',
      ].includes(tag)
    )
      throw new Error(`Unsupported SVG element: ${tag}`);
    if (depth > 2) throw new Error('Attachment g depth exceeds two');
    if (!active && !defs && ['path', 'polygon', 'circle', 'ellipse', 'rect'].includes(tag))
      throw new Error('Geometry outside attachment root');
    if (active && !defs && ['path', 'polygon', 'circle', 'ellipse', 'rect'].includes(tag)) {
      const num = (k: string, fallback = 0): number => {
        const ns = numbers(attrs[k] ?? String(fallback));
        if (ns.length !== 1) throw new Error(`Invalid ${tag}.${k}`);
        return ns[0]!;
      };
      let shape: Region = [];
      if (tag === 'polygon') {
        const ns = numbers(attrs.points ?? '');
        if (ns.length % 2) throw new Error('Odd polygon coordinate count');
        shape = triangulate(
          Array.from({ length: ns.length / 2 }, (_, i) => [ns[i * 2]!, ns[i * 2 + 1]!]),
        );
      }
      if (tag === 'path') shape = pathPolygons(attrs.d ?? '').flatMap(triangulate);
      if (tag === 'circle' || tag === 'ellipse') {
        const rx = num(tag === 'circle' ? 'r' : 'rx'),
          ry = tag === 'circle' ? rx : num('ry');
        shape = [circle(num('cx'), num('cy'), rx, ry, true)];
      }
      if (tag === 'rect') {
        if (num('rx') !== 0 || num('ry') !== 0) throw new Error('Rounded rect unsupported');
        const x = num('x'),
          y = num('y'),
          w = num('width'),
          h = num('height');
        if (w <= 0 || h <= 0) throw new Error('Invalid rect');
        shape = [
          [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
          ],
        ];
      }
      if (attrs['fill-rule'] && attrs['fill-rule'] !== 'nonzero')
        throw new Error('Unsupported SVG fill rule');
      const fill = (attrs.fill ?? 'black') !== 'none' && num('fill-opacity', 1) > 0,
        stroke =
          attrs.stroke !== undefined && attrs.stroke !== 'none' && num('stroke-opacity', 1) > 0;
      const width = num('stroke-width', 1);
      if (width < 0) throw new Error('Negative stroke width');
      if (
        stroke &&
        width > 0 &&
        (attrs['stroke-linejoin'] !== 'round' || attrs['stroke-linecap'] !== 'round')
      )
        throw new Error('SVG stroke requires round join and cap');
      if (num('opacity', 1) > 0) {
        if (fill) result.push(...shape);
        if (stroke && width > 0) {
          const expanded = expandRegion(shape, width / 2);
          result.push(...(fill ? expanded : regionDifference(expanded, shape)));
        }
      }
    }
    if (!self) stack.push({ tag, active, defs, attrs, depth });
  }
  if (stack.length || rootCount !== 1) throw new Error(`Expected one attachment root ${elementId}`);
  if (!result.length) throw new Error(`No visible geometry: ${elementId}`);
  return result;
}
