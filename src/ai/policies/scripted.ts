import type { Command } from "../../core/types-state.ts";
import { registerPolicy } from "../policy.ts";

const DEFAULTS = { scriptedScore: 1 };

registerPolicy({
  id: "scripted", band: 1,
  propose(_ctx, agent) {
    const script = (agent.memory.script ?? []) as Command[];
    const step = typeof agent.memory.step === "number" ? agent.memory.step : 0;
    const cmd = script[step];
    return [{ cmd: cmd ? { ...structuredClone(cmd), actor: agent.unit } : { kind: "end", actor: agent.unit } }];
  },
  score(ctx) { return ctx.params.scriptedScore ?? DEFAULTS.scriptedScore; },
  onExecuted(agent) {
    agent.memory.step = (typeof agent.memory.step === "number" ? agent.memory.step : 0) + 1;
  },
});
