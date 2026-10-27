import type { Matrix, Polygon, Region, Vec2 } from './schema.ts';
import { transformPoint } from './rig.ts';
const EPS = 1e-7;
const cross = (a: Vec2, b: Vec2, c: Vec2): number =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
export const signedArea = (p: Polygon): number =>
  p.reduce((sum, a, i) => {
    const b = p[(i + 1) % p.length]!;
    return sum + a[0] * b[1] - a[1] * b[0];
  }, 0) / 2;
export const regionArea = (r: Region): number => r.reduce((s, p) => s + Math.abs(signedArea(p)), 0);
function clean(p: Polygon): Polygon {
  const out = p.filter((a, i) => {
    const b = p[(i + p.length - 1) % p.length];
    return !b || Math.hypot(a[0] - b[0], a[1] - b[1]) > EPS;
  });
  return out.length >= 3 && Math.abs(signedArea(out)) > EPS
    ? signedArea(out) < 0
      ? out.reverse()
      : out
    : [];
}
export function assertConvex(p: Polygon): void {
  if (
    p.length < 3 ||
    p.some((v) => v.length !== 2 || !v.every(Number.isFinite)) ||
    Math.abs(signedArea(p)) < EPS
  )
    throw new Error('Invalid polygon');
  const sign = Math.sign(signedArea(p));
  for (let i = 0; i < p.length; i++)
    if (cross(p[i]!, p[(i + 1) % p.length]!, p[(i + 2) % p.length]!) * sign < -EPS)
      throw new Error('Region polygon must be convex');
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++) {
      if (j === i + 1 || (i === 0 && j === p.length - 1)) continue;
      if (segmentsCross(p[i]!, p[(i + 1) % p.length]!, p[j]!, p[(j + 1) % p.length]!))
        throw new Error('Self-intersecting polygon');
    }
}
export function segmentsCross(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  return cross(a, b, c) * cross(a, b, d) < -EPS && cross(c, d, a) * cross(c, d, b) < -EPS;
}
function halfPlane(poly: Polygon, a: Vec2, b: Vec2, inside: boolean): Polygon {
  if (!poly.length) return [];
  const out: Polygon = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!,
      q = poly[(i + 1) % poly.length]!,
      dp = cross(a, b, p),
      dq = cross(a, b, q);
    const pi = inside ? dp >= -EPS : dp <= EPS,
      qi = inside ? dq >= -EPS : dq <= EPS;
    if (pi) out.push(p);
    if (pi !== qi) {
      const t = dp / (dp - dq);
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return clean(out);
}
export function polygonIntersection(a: Polygon, b: Polygon): Polygon {
  let result = clean(a.map((p) => [...p] as Vec2));
  const clip = clean(b.map((p) => [...p] as Vec2));
  for (let i = 0; i < clip.length && result.length; i++)
    result = halfPlane(result, clip[i]!, clip[(i + 1) % clip.length]!, true);
  return result;
}
export function polygonDifference(a: Polygon, b: Polygon): Region {
  let remaining = clean(a.map((p) => [...p] as Vec2));
  const clip = clean(b.map((p) => [...p] as Vec2)),
    out: Region = [];
  for (let i = 0; i < clip.length && remaining.length; i++) {
    const p = clip[i]!,
      q = clip[(i + 1) % clip.length]!,
      outside = halfPlane(remaining, p, q, false);
    if (outside.length) out.push(outside);
    remaining = halfPlane(remaining, p, q, true);
  }
  return out;
}
export function regionDifference(a: Region, b: Region): Region {
  let pieces = a.map((p) => clean(p.map((v) => [...v] as Vec2)));
  for (const clip of b) pieces = pieces.flatMap((p) => polygonDifference(p, clip));
  return pieces.filter((p) => p.length >= 3);
}
export function regionIntersection(a: Region, b: Region): Region {
  return a.flatMap((p) => b.map((q) => polygonIntersection(p, q))).filter((p) => p.length >= 3);
}
export const contains = (outer: Region, inner: Region): boolean =>
  regionArea(regionDifference(inner, outer)) < EPS;
export const transformRegion = (r: Region, m: Matrix): Region =>
  r.map((p) => p.map((v) => transformPoint(m, v)));
export function bounds(r: Region): [number, number, number, number] {
  const p = r.flat();
  if (!p.length) throw new Error('Empty region');
  const xs = p.map((v) => v[0]),
    ys = p.map((v) => v[1]),
    x = Math.min(...xs),
    y = Math.min(...ys);
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
}
export function circle(cx: number, cy: number, rx: number, ry = rx, outer = false): Polygon {
  if (![cx, cy, rx, ry].every(Number.isFinite) || rx <= 0 || ry <= 0)
    throw new Error('Invalid ellipse');
  const radius = Math.max(rx, ry),
    n = Math.max(
      16,
      Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - Math.min(0.25, radius / 4) / radius))),
    );
  const scale = outer ? 1 / Math.cos(Math.PI / n) : 1;
  return Array.from(
    { length: n },
    (_, i) =>
      [
        cx + rx * scale * Math.cos((i * 2 * Math.PI) / n),
        cy + ry * scale * Math.sin((i * 2 * Math.PI) / n),
      ] as Vec2,
  );
}
/** 凸片加圓形筆刷，保守涵蓋 round cap/join；展平誤差 <0.75。 */
export function expandRegion(r: Region, amount: number): Region {
  if (amount === 0) return r;
  if (amount < 0) throw new Error('Negative region expansion');
  const brush = circle(0, 0, amount, amount, true);
  return r.map((p) =>
    convexHull(p.flatMap((v) => brush.map((b) => [v[0] + b[0], v[1] + b[1]] as Vec2))),
  );
}
export function convexHull(points: Polygon): Polygon {
  // 世界／局部矩陣的浮點雜訊不能改變同x點的排序，否則近共線刪點會吞掉真正端點。
  const grid = 1e8,
    unique = new Map<string, Vec2>();
  const quantize = (n: number): number => Math.round(n * grid) / grid || 0; // JSON不保留-0，統一後記憶體／重讀結果才一致。
  for (const p of points) {
    const v: Vec2 = [quantize(p[0]), quantize(p[1])];
    unique.set(v.join(','), v);
  }
  const sorted = [...unique.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    lower: Polygon = [],
    upper: Polygon = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower.at(-2)!, lower.at(-1)!, p) <= EPS) lower.pop();
    lower.push(p);
  }
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2)!, upper.at(-1)!, p) <= EPS) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return clean([...lower, ...upper]);
}
/** 可見簡單凹 polygon 以耳切拆成凸片；拒絕自交及洞，避免假驗證。 */
export function triangulate(poly: Polygon): Region {
  const p = clean(poly);
  if (p.length < 3) throw new Error('Degenerate SVG polygon');
  for (let i = 0; i < p.length; i++)
    for (let j = i + 1; j < p.length; j++) {
      if (j === i + 1 || (i === 0 && j === p.length - 1)) continue;
      if (segmentsCross(p[i]!, p[(i + 1) % p.length]!, p[j]!, p[(j + 1) % p.length]!))
        throw new Error('Self-intersecting SVG geometry');
    }
  if (p.every((_, i) => cross(p[i]!, p[(i + 1) % p.length]!, p[(i + 2) % p.length]!) >= -EPS))
    return [p];
  const work = [...p],
    out: Region = [];
  while (work.length > 3) {
    let found = false;
    for (let i = 0; i < work.length; i++) {
      const a = work[(i + work.length - 1) % work.length]!,
        b = work[i]!,
        c = work[(i + 1) % work.length]!;
      if (cross(a, b, c) <= EPS) continue;
      if (
        work.some(
          (v) =>
            v !== a &&
            v !== b &&
            v !== c &&
            cross(a, b, v) >= -EPS &&
            cross(b, c, v) >= -EPS &&
            cross(c, a, v) >= -EPS,
        )
      )
        continue;
      out.push([a, b, c]);
      work.splice(i, 1);
      found = true;
      break;
    }
    if (!found) throw new Error('Cannot triangulate SVG polygon');
  }
  out.push(work);
  return out;
}
export { parseSvgGeometry } from './svg-geometry.ts';
