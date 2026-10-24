// mcp/tool — MCP 工具契約（lead-mcp 寫死）：每個工具模組匯出 `create<X>Tools(env): ToolDef[]`，
// server.ts 只負責把各模組的工具串起來；工具狀態（session 表）由各模組的 closure 自己持有。
// 回傳慣例：content[0] 是一段中文摘要、content[1] 是精簡 JSON（同 structuredContent），給 agent 好讀。
import { resolve } from "node:path";
import type { ContentDB } from "../content/contentdb.ts";
import { loadContentDirs } from "../content/loader.ts";
import type { WorldDB } from "../ops/content/worlddb.ts";
import { loadWorldDirs } from "../ops/content/load.ts";

/** 本專案用到的 JSON Schema 子集（server 端的參數檢查也只認這些關鍵字）。 */
export type JsonSchema = {
  type?: "object" | "string" | "integer" | "number" | "boolean" | "array";
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: readonly (string | number)[];
  minimum?: number;
  maximum?: number;
  additionalProperties?: boolean;
  /** 任一子 schema 通過即可；用於「物件或字串」這類參數。 */
  anyOf?: JsonSchema[];
  default?: unknown;
};
export type ToolContent = { type: "text"; text: string } | { type: "image"; data: string; mimeType: string };
export type ToolResult = { content: ToolContent[]; structuredContent?: Record<string, unknown>; isError?: boolean };
export type ToolDef = {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema & { type: "object" };
  /** args 已經過 inputSchema 檢查。丟出 ToolError（或任何 Error）→ server 包成 isError 結果。 */
  handler: (args: Record<string, unknown>) => ToolResult | Promise<ToolResult>;
};

/** 工具共用環境：內容只載一次（lazy）。root 為專案根，與 cwd 無關。 */
export type McpEnv = {
  root: string;
  packs: string[];
  /** 戰鬥用 ContentDB（同 `npm run sim`：loadContentDirs，存檔的 pack hash 一致）。 */
  battleDb(): ContentDB;
  /** 營運用 {db, world}（同 `npm run sim:campaign`：loadWorldDirs）。 */
  world(): { db: ContentDB; world: WorldDB };
};

/** 預期內的使用錯誤（找不到 session、指令不合法…）；訊息直接給 agent 看，用中文。 */
export class ToolError extends Error {}

export function okResult(summary: string, data: Record<string, unknown>): ToolResult {
  return { content: [{ type: "text", text: summary }, { type: "text", text: JSON.stringify(data) }], structuredContent: data };
}

export function errorResult(message: string, data?: Record<string, unknown>): ToolResult {
  return { content: [{ type: "text", text: message }, ...(data ? [{ type: "text" as const, text: JSON.stringify(data) }] : [])],
    ...(data ? { structuredContent: data } : {}), isError: true };
}

export function createEnv(opts: { root?: string; packs?: string[] } = {}): McpEnv {
  const root = opts.root ?? resolve(import.meta.dirname, "../.."), packs = opts.packs ?? ["content/base"];
  const dirs = packs.map(pack => resolve(root, pack));
  let battle: ContentDB | undefined, world: { db: ContentDB; world: WorldDB } | undefined;
  return {
    root, packs,
    battleDb() {
      if (!battle) {
        const loaded = loadContentDirs(dirs);
        if (loaded.errors.length) throw new Error(`內容載入失敗：${JSON.stringify(loaded.errors.slice(0, 3))}`);
        battle = loaded.db;
      }
      return battle;
    },
    world() {
      if (!world) {
        const loaded = loadWorldDirs(dirs);
        if (loaded.errors.length) throw new Error(`世界內容載入失敗：${JSON.stringify(loaded.errors.slice(0, 3))}`);
        world = { db: loaded.db, world: loaded.world };
      }
      return world;
    },
  };
}
