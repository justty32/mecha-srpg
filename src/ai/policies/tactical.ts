import { cellKey } from "../../core/ids.ts";
import type { Cell } from "../../core/types-def.ts";
import type { AbilityTarget } from "../rules-query.ts";
import type { Agent, AiCtx, Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { dangerAt } from "../danger.ts";
import { scoreCandidate } from "../score.ts";

const DEFAULTS = { maxMoves: 8 };

export function proposeTactical(ctx: AiCtx, agent: Agent, opts?: { maxMoves?: number; hostileOnly?: boolean }): Candidate[] {
  const { q, view } = ctx;
  const actor = agent.unit;
  const self = view.units[actor];
  if (!self || !q.isActive(view, actor)) return [];
  const others = Object.keys(view.units).sort().filter((id) => id !== actor && q.isActive(view, id));
  const enemies = others.filter((id) => opts?.hostileOnly === false || q.hostile(view, actor, id));
  const nearest = (cell: Cell): number => enemies.length
    ? Math.min(...enemies.map((id) => q.distance(cell, view.units[id]!.pos))) : 0;
  const moves = Object.keys(q.reachable(view, actor)).sort().map((key) => {
    const [x, y] = key.split(",").map(Number);
    return { x: x!, y: y! };
  }).sort((a, b) => nearest(a) - nearest(b) || dangerAt(ctx.danger, a) - dangerAt(ctx.danger, b)
    || a.x - b.x || a.y - b.y)
    .slice(0, Math.max(0, Math.floor(opts?.maxMoves ?? ctx.params.maxMoves ?? DEFAULTS.maxMoves)));
  const candidates: Candidate[] = [];
  for (const move of [undefined, ...moves]) {
    let state = view;
    if (move) {
      const path = q.pathTo(view, actor, move);
      if (!path) continue;
      const cmd = { kind: "move" as const, actor, path };
      const preview = q.previewCommand(view, cmd);
      if (!preview.result.ok) continue;
      state = preview.state;
      candidates.push({ cmd });
    }
    for (const ability of [...q.abilitiesOf(state, actor)].sort()) {
      const def = q.abilityDef(ability);
      if (def.mode !== "activated") continue;
      const targets: AbilityTarget[] = [];
      if (def.target.kind === "self") targets.push({ unit: actor });
      else if (def.target.kind === "cell" || def.target.kind === "ball") {
        const seen = new Set<string>();
        for (const id of enemies) {
          const cell = state.units[id]!.pos;
          const key = cellKey(cell.x, cell.y);
          if (!seen.has(key)) targets.push({ cell: { ...cell } });
          seen.add(key);
        }
      } else if (def.target.kind === "unit" || def.target.kind === "part") {
        // 友方治療／支援仍由規則判定合法；hostileOnly=false 供失控策略擴大攻擊對象。
        const ids = Object.keys(state.units).sort().filter((id) => q.isActive(state, id)
          && (opts?.hostileOnly === false || q.hostile(state, actor, id) || def.target.friendly !== "no"));
        for (const id of ids) {
          if (def.target.kind === "unit") targets.push({ unit: id });
          if (def.partAim?.allowed) {
            for (const part of q.partDefs(state, id)) {
              if (def.ai.targetPref?.parts?.some((fn) => part.functions.includes(fn))) {
                targets.push({ unit: id, part: part.id });
              }
            }
          }
        }
      }
      for (const target of targets) {
        if (q.checkAbility(state, actor, ability, target) === null) {
          candidates.push({ ...(move ? { move: { ...move } } : {}), cmd: { kind: "useAbility", actor, ability, target } });
        }
      }
    }
  }
  candidates.push({ cmd: { kind: "wait", actor } }, { cmd: { kind: "end", actor } });
  if (view.rt?.exits.some((cell) => q.distance(cell, self.pos) === 0)) candidates.push({ cmd: { kind: "retreat", actor } });
  candidates.push({ cmd: { kind: "eject", actor } });
  return candidates;
}

registerPolicy({ id: "tactical", propose: proposeTactical, score: scoreCandidate });
