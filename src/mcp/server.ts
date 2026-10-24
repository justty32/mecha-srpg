import { createEnv } from "./tool.ts";
import type { McpEnv } from "./tool.ts";
import { createServer } from "./protocol.ts";
import { createBattleHub, createBattleTools } from "./battle.ts";
import { createCampaignTools } from "./campaign.ts";
import { createUiTools, closeUi } from "./ui.ts";

export function createMcpServer(env: McpEnv = createEnv()) {
  const hub = createBattleHub(env);
  return createServer({ name: "mecha-srpg", version: "0.1.0",
    tools: [...createBattleTools(env, hub), ...createCampaignTools(env, hub), ...createUiTools(env)] });
}

if (import.meta.main) {
  const io = process as typeof process & McpProcess;
  const server = createMcpServer();
  const input = createInterface({ input: io.stdin, crlfDelay: Infinity });
  try {
    for await (const line of input) {
      const response = await server.handle(line);
      if (response !== null) io.stdout.write(`${response}\n`);
    }
  } finally { await closeUi(); }
}
import { createInterface } from "node:readline";
