import { createMcpServer } from "./server.ts";
import { closeUi } from "./ui.ts";

const runtime = process as typeof process & McpProcess;

export async function serve(socketPath: string): Promise<Server> {
  const mcp = createMcpServer(), sockets = new Set<McpSocket>();
  // 全部連線共用一個戰鬥表；一個指令完成後才處理下一個。
  let pending = Promise.resolve();
  const server = createServer(socket => {
    sockets.add(socket); socket.on("close", () => sockets.delete(socket));
    socket.on("error", (error: Error) => console.error(error.message));
    const input = createInterface({ input: socket, crlfDelay: Infinity });
    input.on("line", (line: string) => {
      pending = pending.then(async () => {
        const response = await mcp.handle(line);
        if (response !== null && !socket.destroyed) socket.write(`${response}\n`);
      }).catch((error: Error) => { console.error(error.message); socket.destroy(); });
    });
  });
  await new Promise<void>((ok, fail) => { server.once("error", (e: Error) => fail(socketError(e, socketPath))); server.listen(socketPath, ok); });
  console.error(`MCP socket 就緒：${socketPath}`);
  let closing = false;
  const close = () => {
    if (closing) return; closing = true;
    for (const socket of sockets) socket.destroy();
    server.close(); void pending.finally(() => closeUi());
  };
  runtime.on("SIGINT", close); runtime.on("SIGTERM", close);
  return server;
}

/** 連線／監聽錯誤轉成一行中文；路徑太長（約 100 字元以上）時 Unix socket 會 EINVAL。 */
export function socketError(error: Error, socketPath: string): Error {
  const code = (error as Error & { code?: string }).code;
  const reason = code === "ENOENT" ? "socket 不存在（serve 沒啟動或路徑打錯？）"
    : code === "ECONNREFUSED" ? "連線被拒（serve 已停止？可刪掉殘留 socket 檔後重啟）"
    : code === "EADDRINUSE" ? "socket 已被佔用（另一個 serve 還在跑，或殘留 socket 檔）"
    : code === "EINVAL" || code === "ENAMETOOLONG" ? "路徑無效" : error.message;
  return new Error(`socket ${socketPath} 失敗：${reason}；socket 路徑過長？請改用短的相對路徑（${socketPath.length} 字元，建議 < 100）。`);
}

export async function request(socketPath: string, method: string, params?: object): Promise<any> {
  const socket = createConnection(socketPath);
  const input = createInterface({ input: socket, crlfDelay: Infinity });
  let next = 1;
  const pending = new Map<number, { resolve(value: any): void; reject(error: Error): void }>();
  const fail = (error: Error) => { for (const item of pending.values()) item.reject(error); pending.clear(); };
  // readline 會轉發 socket 的 error 事件；不接住會變成未處理例外印出 Node 堆疊。
  const failed = (error: Error) => fail(socketError(error, socketPath));
  socket.on("error", failed); input.on("error", failed); socket.on("close", () => fail(new Error("socket 已關閉")));
  input.on("line", (line: string) => {
    try {
      const reply = JSON.parse(line), item = pending.get(reply.id);
      if (!item) return;
      pending.delete(reply.id);
      if (reply.error) item.reject(new Error(`${reply.error.code}：${reply.error.message}`)); else item.resolve(reply.result);
    } catch (e) { fail(e instanceof Error ? e : new Error(String(e))); }
  });
  const call = (method: string, params?: object) => new Promise<any>((resolve, reject) => {
    const id = next++; pending.set(id, { resolve, reject });
    socket.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
  try {
    await call("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "mecha-srpg-cli", version: "0.1.0" } });
    socket.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    return await call(method, params);
  } finally { input.close(); socket.end(); socket.destroy(); }
}

export async function main(argv: string[]): Promise<number> {
  try {
    const [mode, option, path, tool, json, ...extra] = argv;
    if (!["serve", "list", "call"].includes(mode ?? "") || option !== "--socket" || !path || extra.length
      || (mode !== "call" && tool !== undefined) || (mode === "call" && !tool)) {
      throw new Error("用法：cli.ts serve|list --socket SOCK，或 cli.ts call --socket SOCK TOOL ['JSON']");
    }
    if (mode === "serve") { await serve(path); return 0; }
    const result = await request(path, mode === "list" ? "tools/list" : "tools/call", mode === "list" ? undefined : { name: tool, arguments: json ? JSON.parse(json) : {} });
    if (mode === "list") for (const tool of result.tools) console.log(`${tool.name}\t${tool.description}`);
    else for (const content of result.content) if (content.type === "text") console.log(content.text);
    return result.isError ? 1 : 0;
  } catch (e) { console.error(e instanceof Error ? e.message : String(e)); return 1; }
}

if (import.meta.main) process.exitCode = await main(process.argv.slice(2));
import { createServer, createConnection } from "node:net";
import type { Server } from "node:net";
import { createInterface } from "node:readline";
