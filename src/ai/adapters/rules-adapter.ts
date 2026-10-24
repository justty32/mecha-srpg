// ai/adapters/rules-adapter — 把真規則層（src/rules/）包成 RulesQuery／ExecCommand。
// src/ai/ 內唯一 import rules 與 content 的地方；其餘 AI 檔只依賴 core 與 rules-query.ts。
// 介面對照見 wf/workflows/dispatch/handoffs/lead-impl-ai/REPORT.md「RulesQuery 介面與規則線的對照」。

import { cellKey } from "../../core/ids.ts";
import type { Id } from "../../core/ids.ts";
import type { Cell } from "../../core/types-def.ts";
import type { BattleState } from "../../core/types-state.ts";
import { evalNum } from "../../core/numexpr.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import * as R from "../../rules/index.ts";
import type { Ctx, Subject } from "../../rules/index.ts";
import type { ExecCommand, RulesQuery } from "../rules-query.ts";

function subjectOf(ctx: Ctx, unitId: Id): Subject {
  const pid = R.commanderOf(ctx, unitId);
  return pid ? { unit: unitId, person: pid } : { unit: unitId };
}

/** 兩格中心 Bresenham 線、不含兩端，地形 blocksLos 即擋（同 rules command.ts 的私有 los；SPEC-GAP：rules 未匯出）。 */
function los(ctx: Ctx, from: Cell, to: Cell): boolean {
  let x = from.x, y = from.y;
  const dx = Math.abs(to.x - x), dy = -Math.abs(to.y - y), sx = x < to.x ? 1 : -1, sy = y < to.y ? 1 : -1;
  let error = dx + dy;
  while (x !== to.x || y !== to.y) {
    const twice = 2 * error;
    if (twice >= dy) { error += dy; x += sx; }
    if (twice <= dx) { error += dx; y += sy; }
    if (x === to.x && y === to.y) break;
    if (R.terrainAt(ctx, { x, y }).blocksLos) return false;
  }
  return true;
}

export function createRulesQuery(db: ContentDB): RulesQuery {
  const c = (s: BattleState): Ctx => ({ db, s });
  return {
    inBounds: (s, cell) => R.inBounds(s, cell),
    distance: (a, b) => R.distance(a, b),
    unitAt: (s, cell) => R.unitAt(c(s), cell),
    isActive: (s, id) => !!s.units[id] && R.isActive(c(s), id),
    hostile: (s, a, b) => R.hostile(c(s), a, b),
    hostileSlots: (s, a, b) => R.hostileSlots(c(s), a, b),
    commanderOf: (s, id) => R.commanderOf(c(s), id),
    los: (s, from, to) => los(c(s), from, to),
    perception: (s, id) => R.roleAttr(c(s), subjectOf(c(s), id), "perception"),
    unitGrade: (s, id) => R.frameView(c(s), id).grade,
    unitTags: (s, id) => R.unitTags(c(s), id),
    partDefs: (s, id) => R.partDefs(c(s), id),
    layerDefs: (s, id, part) => R.layerDefs(c(s), id, part),
    reachable(s, id) {
      // rules 的 reachable 含起點（成本 0）；RulesQuery 契約不含起點。
      const all = R.reachable(c(s), id), pos = s.units[id]!.pos, start = cellKey(pos.x, pos.y);
      const out: Record<string, number> = {};
      for (const k of Object.keys(all).sort()) if (k !== start) out[k] = all[k]!;
      return out;
    },
    pathTo(s, id, to) {
      // 由 reachable 的成本表沿 stepCost 回溯（rules 沒有匯出路徑；SPEC-GAP）。
      const ctx = c(s), cost = R.reachable(ctx, id), pos = s.units[id]!.pos;
      if (cost[cellKey(to.x, to.y)] === undefined || (to.x === pos.x && to.y === pos.y)) return null;
      const path: Cell[] = [];
      let cur = { x: to.x, y: to.y };
      while (cur.x !== pos.x || cur.y !== pos.y) {
        path.unshift(cur);
        const here = cost[cellKey(cur.x, cur.y)]!;
        let prev: Cell | null = null;
        for (let dy = -1; dy <= 1 && !prev; dy++) for (let dx = -1; dx <= 1 && !prev; dx++) {
          const n = { x: cur.x + dx, y: cur.y + dy }, nc = cost[cellKey(n.x, n.y)];
          if ((dx || dy) && nc !== undefined && nc + (R.stepCost(ctx, id, n, cur) ?? Infinity) === here) prev = n;
        }
        if (!prev) return null;
        cur = prev;
      }
      return path;
    },
    abilitiesOf: (s, id) => R.abilitiesOf(c(s), id),
    abilityDef: (abilityId) => db.require("ability", abilityId),
    abilityRange(s, id, abilityId) {
      const a = db.require("ability", abilityId), ev = R.evalCtxFor(c(s), subjectOf(c(s), id));
      return { min: evalNum(a.target.range.min, ev), max: evalNum(a.target.range.max, ev) };
    },
    checkAbility: (s, id, abilityId, target) => R.checkAbility(c(s), id, abilityId, target),
    hitChance: (s, actor, abilityId, target, part) => R.hitChance(c(s), actor, abilityId, target, part),
    evalNum: (s, expr, self, target) =>
      evalNum(expr, R.evalCtxFor(c(s), subjectOf(c(s), self), target ? { unit: target } : undefined)),
    previewCommand: (s, cmd) => R.previewCommand(c(s), cmd),
  };
}

/** 真規則的行動入口（tryCommand，就地改 s）。 */
export function createRulesExec(db: ContentDB): ExecCommand {
  return (s, cmd) => R.tryCommand({ db, s }, cmd);
}
