import type { Id } from "../../core/ids.ts";
import type { Agent, AiCtx, Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { scoreCandidate } from "../score.ts";
import { proposeTactical, stationarySupport } from "./tactical.ts";

const DEFAULTS = { leash: 3, swarmReturn: 1 };

function parentOf(ctx: AiCtx, agent: Agent): Id | undefined {
  const { q, view } = ctx;
  const self = view.units[agent.unit];
  if (!self) return undefined;
  const friends = Object.keys(view.units).sort().filter((id) => id !== agent.unit
    && view.units[id]!.owner === self.owner && q.isActive(view, id));
  if (ctx.assignment?.intentMode === "gather" && ctx.assignment.protect && friends.includes(ctx.assignment.protect)) return ctx.assignment.protect;
  if (typeof agent.memory.parent === "string" && friends.includes(agent.memory.parent)) return agent.memory.parent;
  const spawners = friends.filter((id) => q.unitTags(view, id).includes("spawner"));
  return (spawners.length ? spawners : friends).sort((a, b) => q.distance(self.pos, view.units[a]!.pos)
    - q.distance(self.pos, view.units[b]!.pos) || (a < b ? -1 : a > b ? 1 : 0))[0];
}

registerPolicy({
  id: "swarm",
  propose(ctx, agent) {
    const parent = parentOf(ctx, agent);
    if (!parent) return proposeTactical(ctx, agent);
    const home = ctx.view.units[parent]!.pos;
    const pos = ctx.view.units[agent.unit]!.pos;
    const distance = ctx.q.distance(pos, home);
    const leash = ctx.params.leash ?? DEFAULTS.leash;
    if (distance > leash) {
      const candidates: Candidate[] = stationarySupport(ctx, agent);
      for (const key of Object.keys(ctx.q.reachable(ctx.view, agent.unit)).sort()) {
        const [x, y] = key.split(",").map(Number);
        const cell = { x: x!, y: y! };
        if (ctx.q.distance(cell, home) >= distance) continue;
        const path = ctx.q.pathTo(ctx.view, agent.unit, cell);
        if (path) candidates.push({ cmd: { kind: "move", actor: agent.unit, path } });
      }
      return candidates;
    }
    return proposeTactical(ctx, agent, { allowMove: cell => ctx.q.distance(cell, home) <= leash });
  },
  score(ctx, agent, c) {
    const parent = parentOf(ctx, agent);
    if (parent && c.cmd.kind === "move") {
      const home = ctx.view.units[parent]!.pos;
      if (ctx.q.distance(ctx.view.units[agent.unit]!.pos, home) > (ctx.params.leash ?? DEFAULTS.leash)) {
        return (ctx.params.swarmReturn ?? DEFAULTS.swarmReturn) / (1 + ctx.q.distance(c.cmd.path.at(-1) ?? ctx.view.units[agent.unit]!.pos, home));
      }
    }
    return scoreCandidate(ctx, agent, c);
  },
});
