import type { Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { dangerAt } from "../danger.ts";
import { retreatCells, mobile } from "../intent.ts";

const DEFAULTS = { fleeRetreat: 100, fleeDistance: 1, dangerK: 0.05, fleeExitDistance: 4 };

registerPolicy({
  id: "flee", band: 1,
  propose(ctx, agent) {
    const { q, view } = ctx;
    const pos = view.units[agent.unit]?.pos;
    if (!pos) return [];
    const candidates: Candidate[] = [];
    if (!mobile(q, view, agent.unit)) return [];
    if (retreatCells(view).some((cell) => q.distance(cell, pos) === 0)) candidates.push({ cmd: { kind: "retreat", actor: agent.unit } });
    for (const key of Object.keys(q.reachable(view, agent.unit)).sort()) {
      const [x, y] = key.split(",").map(Number);
      const path = q.pathTo(view, agent.unit, { x: x!, y: y! });
      if (path) candidates.push({ cmd: { kind: "move", actor: agent.unit, path } });
    }
    return candidates;
  },
  score(ctx, agent, c) {
    if (c.cmd.kind === "retreat") return ctx.params.fleeRetreat ?? DEFAULTS.fleeRetreat;
    if (c.cmd.kind !== "move") return 0;
    const from = ctx.view.units[agent.unit]!.pos;
    const cell = c.cmd.path.at(-1) ?? from;
    const enemies = Object.keys(ctx.view.units).sort().filter((id) => id !== agent.unit
      && ctx.q.isActive(ctx.view, id) && ctx.q.hostile(ctx.view, agent.unit, id));
    // SPEC-GAP：看不到敵人時距離項為 0，避免 Infinity 分數被抽選器剔除。
    const distance = (at: typeof cell): number => enemies.length ? Math.min(...enemies.map((id) => ctx.q.distance(at, ctx.view.units[id]!.pos))) : 0;
    const exits = retreatCells(ctx.view);
    const exitDistance = (at: typeof cell): number => exits.length ? Math.min(...exits.map((exit) => ctx.q.distance(at, exit))) : 0;
    // 只評估相對現在位置的進展；出口再遠也不會讓所有候選一律負分。
    return (distance(cell) - distance(from)) * (ctx.params.fleeDistance ?? DEFAULTS.fleeDistance)
      - (ctx.params.dangerK ?? DEFAULTS.dangerK) * (dangerAt(ctx.danger, cell) - dangerAt(ctx.danger, from))
      + (exitDistance(from) - exitDistance(cell)) * (ctx.params.fleeExitDistance ?? DEFAULTS.fleeExitDistance);
  },
});
