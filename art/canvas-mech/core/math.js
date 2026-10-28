// Canvas 六元仿射矩陣；欄向量，mul(a,b) 代表先 b 再 a。
export const IDENTITY = Object.freeze([1, 0, 0, 1, 0, 0]);
export const finite = value => typeof value === 'number' && Number.isFinite(value);
export const pointValid = p => p && finite(p.x) && finite(p.y);
export const transformValid = t => t && ['x', 'y', 'rotationDeg', 'scaleX', 'scaleY'].every(k => finite(t[k])) && t.scaleX > 0 && t.scaleY > 0;
export const transform = (x = 0, y = 0, rotationDeg = 0) => ({ x, y, rotationDeg, scaleX: 1, scaleY: 1 });
export function mul(a, b) {
  return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
}
export const apply = (m, p) => ({ x: m[0]*p.x+m[2]*p.y+m[4], y: m[1]*p.x+m[3]*p.y+m[5] });
export function inverse(m) {
  const d = m[0]*m[3]-m[1]*m[2];
  if (!finite(d) || Math.abs(d) < 1e-12) throw new Error('不可逆矩陣');
  return [m[3]/d, -m[1]/d, -m[2]/d, m[0]/d, (m[2]*m[5]-m[3]*m[4])/d, (m[1]*m[4]-m[0]*m[5])/d];
}
export function matrix(t, pivot = { x: 0, y: 0 }, deltaDeg = 0) {
  const a = (t.rotationDeg+deltaDeg)*Math.PI/180;
  const c = Math.cos(a), s = Math.sin(a);
  const m = [c*t.scaleX, s*t.scaleX, -s*t.scaleY, c*t.scaleY, 0, 0];
  m[4] = t.x+pivot.x-m[0]*pivot.x-m[2]*pivot.y;
  m[5] = t.y+pivot.y-m[1]*pivot.x-m[3]*pivot.y;
  return m;
}
export const corners = b => [{x:b.x,y:b.y},{x:b.x+b.width,y:b.y},{x:b.x+b.width,y:b.y+b.height},{x:b.x,y:b.y+b.height}];
export const inBounds = (p, b, epsilon = 1e-7) => p.x >= b.x-epsilon && p.y >= b.y-epsilon && p.x <= b.x+b.width+epsilon && p.y <= b.y+b.height+epsilon;
export function worldBounds(m, bounds) {
  const ps = corners(bounds).map(p => apply(m, p));
  const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs)-Math.min(...xs), height: Math.max(...ys)-Math.min(...ys) };
}
