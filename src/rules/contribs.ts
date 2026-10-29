import type { Id } from "../core/ids.ts";
import type { AttrId, AttrRole, Contribution } from "../core/types-def.ts";
import type { ContributionInstance } from "../core/types-state.ts";
import { evalNum } from "../core/numexpr.ts";
import { attrByRole } from "../content/registry.ts";
import { evalCtxFor, frameView, person, rt, unit } from "./state.ts";
import type { Ctx, Subject } from "./state.ts";
import { recomputePool } from "./pools.ts";

export type Owner = { unit: Id } | { person: Id };
export function statValue(base: number, contribs: readonly ContributionInstance[], key: string): number {
  const cs = contribs.filter(c => c.path === key);
  const value = (c: ContributionInstance): number => {
    if (typeof c.value !== "number") throw new Error("貢獻值尚未求值");
    return c.value;
  };
  let n = base;
  for (const c of cs) if (c.op === "set") n = value(c);
  n += cs.filter(c => c.op === "add").reduce((sum, c) => sum + value(c), 0);
  n *= cs.filter(c => c.op === "mul").reduce((product, c) => product * value(c), 1);
  // SPEC-GAP：min/max 同時出現時依宣告序套 Math.min/Math.max。
  for (const c of cs) {
    if (c.op === "min") n = Math.min(n, value(c));
    if (c.op === "max") n = Math.max(n, value(c));
  }
  return n;
}
function container(ctx: Ctx, owner: Owner) { return "person" in owner ? person(ctx, owner.person) : unit(ctx, owner.unit); }
function changed(ctx: Ctx, owner: Owner, path: string): void {
  const match = /^self\.pools\.(.+)\.(max|regen)$/.exec(path);
  if (match) recomputePool(ctx, owner, match[1]!);
}
export function addContrib(ctx: Ctx, owner: Owner, c: Contribution): string {
  const value = evalNum(c.value, evalCtxFor(ctx, owner));
  const id = `c${rt(ctx.s).nextContrib++}`;
  container(ctx, owner).contribs.push({ ...c, value, id });
  changed(ctx, owner, c.path);
  return id;
}
export function removeContrib(ctx: Ctx, owner: Owner, id: string): boolean {
  const cs = container(ctx, owner).contribs, index = cs.findIndex(c => c.id === id);
  if (index < 0) return false;
  const [c] = cs.splice(index, 1);
  changed(ctx, owner, c!.path);
  return true;
}
export function removeContribsBySource(ctx: Ctx, owner: Owner, source: Id): string[] {
  const ids = container(ctx, owner).contribs.filter(c => c.source === source).map(c => c.id);
  for (const id of ids) removeContrib(ctx, owner, id);
  return ids;
}
export function personAttr(ctx: Ctx, personId: Id, attr: AttrId): number {
  const p = person(ctx, personId);
  return statValue(p.attrsBase[attr] ?? 0, p.contribs, `self.attrs.${attr}`);
}
export function unitAttr(ctx: Ctx, unitId: Id, attr: AttrId): number {
  return statValue(frameView(ctx, unitId).baseAttrs[attr] ?? 0, unit(ctx, unitId).contribs, `self.attrs.${attr}`);
}
export function roleAttr(ctx: Ctx, s: Subject, role: AttrRole): number {
  const attr = attrByRole(ctx.db.registries, role);
  if (!attr) return 0;
  const uid = s.unit ?? (s.person ? person(ctx, s.person).seat?.mech : undefined);
  // 無人遙控單位的命中底值由內容提供；顯式機體值（包括0）與人物皆優先。
  if (role === "accuracy" && !s.person && uid && unit(ctx, uid).controlMode === "scripted"
    && !Object.hasOwn(frameView(ctx, uid).baseAttrs, attr)) {
    return statValue(rt(ctx.s).scriptedAccuracyBase ?? ctx.db.rules.constants.scriptedAccuracyBase ?? 0, unit(ctx, uid).contribs, `self.attrs.${attr}`);
  }
  return (s.person ? personAttr(ctx, s.person, attr) : 0) + (uid ? unitAttr(ctx, uid, attr) : 0);
}
