import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

test("socket CLI：serve、call 共用 session；list 與錯誤 exit 1", { timeout: 30000 }, async () => {
  const proc = process as typeof process & McpProcess;
  mkdirSync("/tmp/cx-mcp-core", { recursive: true });
  const socket = `/tmp/cx-mcp-core/cli-${proc.pid}.sock`;
  const server = spawn(proc.execPath, ["src/mcp/cli.ts", "serve", "--socket", socket], { stdio: ["ignore", "pipe", "pipe"] });
  let stderr = "";
  const stopped = new Promise<void>(ok => server.once("exit", () => ok()));
  try {
    const ready = await new Promise<boolean>((ok, fail) => {
      server.on("error", fail);
      server.stderr.on("data", (data: unknown) => { stderr += String(data); if (stderr.includes("MCP socket 就緒")) ok(true); });
      server.once("exit", () => ok(false));
    });
    assert.ok(ready, stderr);
    const run = (args: string[]) => new Promise<{ code: number; stdout: string; stderr: string }>((ok, fail) => {
      const child = spawn(proc.execPath, ["src/mcp/cli.ts", ...args], { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "", stderr = "";
      child.on("error", fail); child.stdout.on("data", (d: unknown) => { stdout += String(d); }); child.stderr.on("data", (d: unknown) => { stderr += String(d); });
      child.once("exit", (code: number) => ok({ code, stdout, stderr }));
    });
    const call = (tool: string, args: object) => run(["call", "--socket", socket, tool, JSON.stringify(args)]);
    const created = await call("battle_new", { scenario: "scenario/skirmish-whitegloves", seed: 1, autoAdvance: false });
    assert.equal(created.code, 0, created.stderr);
    const id = JSON.parse(created.stdout.trim().split("\n").at(-1)!).id;
    assert.match((await call("battle_observe", { id })).stdout, /第 1/u);
    assert.match((await run(["list", "--socket", socket])).stdout, /battle_act/u);
    assert.equal((await call("battle_observe", { id: "missing" })).code, 1);
    // 連不上 socket：一行中文、exit 1、不印 Node 堆疊。
    const missing = await run(["call", "--socket", `${socket}.missing`, "battle_list_scenarios"]);
    assert.equal(missing.code, 1); assert.equal(missing.stderr.trim().split("\n").length, 1, missing.stderr);
    assert.match(missing.stderr, /socket 路徑過長？/u); assert.ok(!/\n\s+at /u.test(missing.stderr), missing.stderr);
  } finally { server.kill(); await stopped; }
});
