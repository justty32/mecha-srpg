import { test } from "node:test";
import assert from "node:assert/strict";
import type { Command } from "../core/types-state.ts";
import { createEnv } from "./tool.ts";
import { runBattle, scenarioToSetup } from "../sim/run.ts";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

const scenario = "scenario/skirmish-whitegloves";
async function withServer(fn: (call: (name: string, args: object) => Promise<any>) => Promise<void>) {
  const runtime = process as typeof process & McpProcess;
  const child = spawn(runtime.execPath, ["src/mcp/server.ts"], { stdio: ["pipe", "pipe", "pipe"] });
  const input = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const pending = new Map<number, { resolve(value: any): void; reject(error: Error): void }>();
  let next = 1, stderr = "";
  child.stderr.on("data", (d: unknown) => { stderr += String(d); });
  const exited = new Promise<number | null>(resolve => child.once("exit", (code: number | null) => {
    for (const p of pending.values()) p.reject(new Error(`server 提前退出 ${code}：${stderr}`)); resolve(code);
  }));
  child.on("error", (e: Error) => { for (const p of pending.values()) p.reject(e); });
  input.on("line", (line: string) => {
    try {
      const response = JSON.parse(line), p = pending.get(response.id);
      assert.ok(p, `意外協定訊息：${line}`); pending.delete(response.id);
      if (response.error) p.reject(new Error(JSON.stringify(response.error))); else p.resolve(response.result);
    } catch (e) { for (const p of pending.values()) p.reject(e as Error); }
  });
  const rpc = (method: string, params?: object) => new Promise<any>((resolve, reject) => {
    const id = next++; pending.set(id, { resolve, reject }); child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
  try {
    await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "e2e", version: "1" } });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    const listed = await rpc("tools/list");
    for (const tool of listed.tools) { assert.ok(tool.name && tool.description); assert.equal(tool.inputSchema.type, "object"); }
    await fn(async (name, args) => {
      const result = await rpc("tools/call", { name, arguments: args });
      assert.ok(!result.isError, JSON.stringify(result)); return result.structuredContent;
    });
    child.stdin.end(); assert.equal(await exited, 0, stderr);
  } finally { child.kill(); input.close(); }
}

test("stdio 端對端：agent 玩三輪，玩家成功指令重播 hash 等於 runBattle", { timeout: 60000 }, async () => {
  await withServer(async call => {
    let observed = await call("battle_new", { scenario, seed: 1, rounds: 3, autoAdvance: false });
    const id = observed.id, commands: Command[] = [];
    let moved = false, turn = "";
    for (let guard = 0; guard < 500 && !observed.outcome; guard++) {
      if (observed.current?.playerTurn) {
        observed = await call("battle_observe", { id });
        const key = `${observed.round}:${observed.current.id}`;
        if (turn !== key) { turn = key; moved = false; }
        const legal = await call("battle_legal_actions", { id });
        const target = legal.abilities.flatMap((a: { targets: { target: { unit?: string }; action: unknown }[] }) => a.targets)
          .find((t: { target: { unit?: string } }) => t.target.unit && !t.target.unit.startsWith("player-"));
        let action = target?.action;
        if (!action && !moved && legal.moves.length) {
          const [x, y] = (legal.moves[0] as string).split(":")[0]!.split(",").map(Number); action = { kind: "move", to: { x, y } }; moved = true;
        }
        action ??= legal.options.find((o: { action: { kind: string } }) => o.action.kind === "end").action;
        observed = await call("battle_act", { id, action }); commands.push(observed.command);
      } else observed = await call("battle_step_ai", { id, until: "human" });
    }
    assert.ok(observed.outcome, "必須走到勝負或輪數上限"); assert.ok(commands.length >= 3);
    const db = createEnv().battleDb(), sim = scenarioToSetup(db, scenario, 1, { rounds: 3 });
    const run = runBattle({ db, sim, seed: 1, players: { player: { kind: "script", commands } } });
    assert.equal(observed.hash, run.hash);
  });
});

test("stdio 端對端：battle_auto hash 等於直接 runBattle", { timeout: 60000 }, async () => {
  await withServer(async call => {
    const automated = await call("battle_auto", { scenario, seed: 1 });
    const db = createEnv().battleDb(), sim = scenarioToSetup(db, scenario, 1);
    assert.equal(automated.hash, runBattle({ db, sim, seed: 1 }).hash);
  });
});
