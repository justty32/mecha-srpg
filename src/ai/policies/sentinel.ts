import type { Cell } from "../../core/types-def.ts";
import type { Candidate } from "../policy.ts";
import { registerPolicy } from "../policy.ts";
import { scoreCandidate } from "../score.ts";
import { proposeTactical } from "./tactical.ts";

function isCell(value: unknown): value is Cell {
  return typeof value === "object" && value !== null && "x" in value && "y" in value
    && typeof value.x === "number" && typeof value.y === "number";
}

registerPolicy({
  id: "sentinel",
  propose(ctx, agent) {
    const pos = ctx.view.units[agent.unit]?.pos;
    if (!pos) return [];
    if (!isCell(agent.memory.home)) agent.memory.home = { ...pos };
    const home = ctx.assignment?.hold ?? agent.memory.home as Cell;
    const distance = ctx.q.distance(pos, home);
    if (distance === 0) {
      return proposeTactical(ctx, agent, { maxMoves: 0 }).filter((c) => c.cmd.kind === "useAbility" || c.cmd.kind === "end");
    }
    const candidates: Candidate[] = [];
    for (const key of Object.keys(ctx.q.reachable(ctx.view, agent.unit)).sort()) {
      const [x, y] = key.split(",").map(Number);
      const cell = { x: x!, y: y! };
      if (ctx.q.distance(cell, home) >= distance) continue;
      const path = ctx.q.pathTo(ctx.view, agent.unit, cell);
      if (path) candidates.push({ cmd: { kind: "move", actor: agent.unit, path } });
    }
    return candidates;
  },
  // 不在守點時只有回防移動：通用評分會因「遠離敵人」給負分而永遠不回去（cx-ai-policies REPORT 待決事項），
  // 領導裁定回防移動改給 1/(1+到守點距離) 的正分；在守點時沿用通用評分。
  score(ctx, agent, c) {
    const pos = ctx.view.units[agent.unit]?.pos;
    const home = ctx.assignment?.hold ?? (isCell(agent.memory.home) ? agent.memory.home : pos);
    if (c.cmd.kind === "move" && pos && home && ctx.q.distance(pos, home) > 0) {
      const dest = c.cmd.path.at(-1) ?? pos;
      return 1 / (1 + ctx.q.distance(dest, home));
    }
    return scoreCandidate(ctx, agent, c);
  },
});
