import type { Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { dangerAt } from "../danger.ts";

const DEFAULTS = { fleeRetreat: 100, fleeDistance: 1, dangerK: 0.05, fleeExitDistance: 0.1 };

registerPolicy({
  id: "flee", band: 1,
  propose(ctx, agent) {
    const { q, view } = ctx;
    const pos = view.units[agent.unit]?.pos;
    if (!pos) return [];
    const candidates: Candidate[] = [];
    if (view.rt?.exits.some((cell) => q.distance(cell, pos) === 0)) candidates.push({ cmd: { kind: "retreat", actor: agent.unit } });
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
    const cell = c.cmd.path.at(-1) ?? ctx.view.units[agent.unit]!.pos;
    const enemies = Object.keys(ctx.view.units).sort().filter((id) => id !== agent.unit
      && ctx.q.isActive(ctx.view, id) && ctx.q.hostile(ctx.view, agent.unit, id));
    // SPEC-GAP：看不到敵人時距離項為 0，避免 Infinity 分數被抽選器剔除。
    const distance = enemies.length ? Math.min(...enemies.map((id) => ctx.q.distance(cell, ctx.view.units[id]!.pos))) : 0;
    const exits = ctx.view.rt?.exits ?? [];
    const exitDistance = exits.length ? Math.min(...exits.map((exit) => ctx.q.distance(cell, exit))) : 0;
    return distance * (ctx.params.fleeDistance ?? DEFAULTS.fleeDistance)
      - (ctx.params.dangerK ?? DEFAULTS.dangerK) * dangerAt(ctx.danger, cell)
      - exitDistance * (ctx.params.fleeExitDistance ?? DEFAULTS.fleeExitDistance);
  },
});
