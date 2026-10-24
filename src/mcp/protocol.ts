import { errorResult } from "./tool.ts";
import type { ToolDef } from "./tool.ts";
import { isObject, validateSchema } from "./schema.ts";

const versions = ["2025-06-18", "2025-03-26", "2024-11-05"];
export function createServer(opts: { tools: ToolDef[]; name: string; version: string }) {
  const tools = new Map(opts.tools.map(tool => [tool.name, tool]));
  return { async handle(line: string): Promise<string | null> {
    const error = (id: unknown, code: number, message: string) => JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
    let request: unknown;
    try { request = JSON.parse(line); } catch { return error(null, -32700, "無法解析 JSON"); }
    if (!isObject(request) || request.jsonrpc !== "2.0" || typeof request.method !== "string"
      || (Object.hasOwn(request, "id") && request.id !== null && typeof request.id !== "string" && typeof request.id !== "number")) {
      return error(null, -32600, "不是合法 JSON-RPC request");
    }
    if (!Object.hasOwn(request, "id")) return null;
    const id = request.id;
    const reply = (result: unknown) => JSON.stringify({ jsonrpc: "2.0", id, result });
    if (request.params !== undefined && !isObject(request.params)) return error(id, -32602, "params 必須是物件");
    const params = request.params ?? {};
    switch (request.method) {
      case "initialize": return reply({ protocolVersion: versions.includes(String(params.protocolVersion)) ? params.protocolVersion : versions[0],
        capabilities: { tools: { listChanged: false } }, serverInfo: { name: opts.name, version: opts.version },
        instructions: "先用 battle_list_scenarios 選情境，再 battle_new 建立戰鬥；battle_observe 看戰況、battle_legal_actions 查合法動作，把 action 原樣送入 battle_act。AI 回合可用 battle_step_ai；battle_auto 可全自動測試。" });
      case "ping": return reply({});
      case "tools/list": return reply({ tools: opts.tools.map(({ name, title, description, inputSchema }) => ({ name, title, description, inputSchema })) });
      case "tools/call": {
        if (typeof params.name !== "string" || (params.arguments !== undefined && !isObject(params.arguments))) return error(id, -32602, "工具呼叫需要 name 字串與 arguments 物件");
        const tool = tools.get(params.name);
        if (!tool) return error(id, -32602, `未知工具：${params.name}`);
        const args = (params.arguments ?? {}) as Record<string, unknown>;
        try {
          const errors = validateSchema(tool.inputSchema, args);
          return reply(errors.length ? errorResult(errors.join("；")) : await tool.handler(args));
        } catch (e) { return reply(errorResult(e instanceof Error ? e.message : String(e))); }
      }
      default: return error(id, -32601, `未知方法：${request.method}`);
    }
  } };
}
