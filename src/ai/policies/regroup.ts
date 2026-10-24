import { registerPolicy } from "../policy.ts";
import type { Candidate } from "../policy.ts";
import { dangerAt } from "../danger.ts";

const DEFAULTS = { rearDistance: 1, rearCohesion: 0.2, rearDanger: 0.05 };
registerPolicy({
  id: "regroup", band: 1,
  propose(ctx, agent) {
    const candidates: Candidate[] = [];
    for (const key of Object.keys(ctx.q.reachable(ctx.view, agent.unit)).sort()) {
      const [x, y] = key.split(",").map(Number);
      const path = ctx.q.pathTo(ctx.view, agent.unit, { x: x!, y: y! });
      if (path) candidates.push({ cmd: { kind: "move", actor: agent.unit, path } });
    }
    return candidates;
  },
  score(ctx, agent, candidate) {
    if (candidate.cmd.kind !== "move") return 0;
    const { q, view } = ctx, p = { ...DEFAULTS, ...ctx.params }, from = view.units[agent.unit]!.pos;
    const to = candidate.cmd.path.at(-1) ?? from;
    const enemies = Object.keys(view.units).filter(id => q.isActive(view, id) && q.hostile(view, agent.unit, id));
    if (!enemies.length) return 0;
    const distance = (cell: typeof from) => Math.min(...enemies.map(id => q.distance(cell, view.units[id]!.pos)));
    const friends = Object.keys(view.units).filter(id => id !== agent.unit && q.isActive(view, id) && !q.hostile(view, agent.unit, id));
    const rear = friends.sort((a, b) => distance(view.units[b]!.pos) - distance(view.units[a]!.pos) || a.localeCompare(b))[0];
    return p.rearDistance * (distance(to) - distance(from))
      + (rear ? p.rearCohesion * (q.distance(from, view.units[rear]!.pos) - q.distance(to, view.units[rear]!.pos)) : 0)
      - p.rearDanger * (dangerAt(ctx.danger, to) - dangerAt(ctx.danger, from));
  },
});
