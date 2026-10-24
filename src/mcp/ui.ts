// mcp/ui — `ui_screenshot`：headless Chromium 對網頁版戰場截圖（MCP image content）。
// playwright 動態 import（沒裝只讓本工具回 isError）；vite preview 子行程與瀏覽器在 server 行程內只起一次、重用。
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { errorResult, type McpEnv, type ToolDef, type ToolResult } from "./tool.ts";

// test/types/node-shim.d.ts（本線不可改）尚未宣告 child_process／net 與 fetch／Buffer 等：以變數specifier動態載入、globalThis 取用，執行期等價。
/* eslint-disable @typescript-eslint/no-explicit-any */
type Proc = { exitCode: number | null; stderr: { on(ev: string, fn: (d: unknown) => void): void } | null; kill(): boolean;
  on(ev: string, fn: (...a: any[]) => void): void; once(ev: string, fn: (...a: any[]) => void): void };
const G = globalThis as any;
const sleep = (ms: number): Promise<void> => new Promise(r => G.setTimeout(r, ms));
const nodeMod = (name: string): Promise<any> => import(name);
const nodePath = (): string => G.process.execPath;

type Page = {
  goto(url: string, o?: object): Promise<unknown>; evaluate<T>(fn: string | (() => T)): Promise<T>;
  screenshot(o?: object): Promise<Uint8Array>; waitForTimeout(ms: number): Promise<void>; waitForSelector(s: string, o?: object): Promise<unknown>;
  on(ev: string, fn: (arg: never) => void): void; close(): Promise<void>; setViewportSize(s: { width: number; height: number }): Promise<void>;
};
type Browser = { newPage(o?: object): Promise<Page>; close(): Promise<void> };

let preview: { proc: Proc; port: number } | null = null;
let starting: Promise<number> | null = null;
let browser: Promise<Browser> | null = null;

async function freePort(): Promise<number> {
  const { createServer } = await nodeMod("node:net");
  return new Promise((ok, fail) => {
    const s = createServer();
    s.once("error", fail);
    s.listen(0, "127.0.0.1", () => { const p = s.address().port as number; s.close(() => ok(p)); });
  });
}

async function runBuild(root: string): Promise<void> {
  const { spawn } = await nodeMod("node:child_process");
  return new Promise((ok, fail) => {
    const p: Proc = spawn(nodePath(), ["node_modules/vite/bin/vite.js", "build"], { cwd: root, stdio: ["ignore", "ignore", "pipe"] });
    let err = ""; p.stderr!.on("data", (d: unknown) => { err += String(d); });
    p.on("error", fail);
    p.on("exit", (code: number | null) => code === 0 ? ok() : fail(new Error(`vite build 失敗（exit ${code}）：${err.slice(-400)}`)));
  });
}

async function ensurePreview(root: string, rebuild: boolean): Promise<number> {
  if (rebuild || !existsSync(resolve(root, "dist/index.html"))) await runBuild(root);
  if (preview && preview.proc.exitCode === null) return preview.port;
  starting ??= (async () => {
    const port = await freePort();
    const { spawn } = await nodeMod("node:child_process");
    // 子行程輸出一律丟棄：MCP 的 stdout 只能放協定訊息。
    const proc: Proc = spawn(nodePath(), ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
      { cwd: root, stdio: ["ignore", "ignore", "ignore"] });
    const dead = new Promise<never>((_, fail) => proc.once("exit", (c: number | null) => fail(new Error(`vite preview 提前結束（exit ${c}）`))));
    dead.catch(() => undefined);
    for (let i = 0; i < 100; i++) {
      if (proc.exitCode !== null) throw new Error(`vite preview 提前結束（exit ${proc.exitCode}）`);
      try { if ((await G.fetch(`http://127.0.0.1:${port}/`)).ok) { preview = { proc, port }; return port; } } catch { /* 還沒好 */ }
      await sleep(100);
    }
    proc.kill();
    throw new Error("vite preview 10 秒內未就緒");
  })().finally(() => { starting = null; });
  return starting;
}

function ensureBrowser(): Promise<Browser> {
  browser ??= (async () => {
    const mod = await import("playwright") as unknown as { chromium: { launch(o: object): Promise<Browser> } };
    return mod.chromium.launch({ headless: true });
  })();
  browser.catch(() => { browser = null; });
  return browser;
}

/** 測試／server 收尾：關瀏覽器、殺 preview 子行程。 */
export async function closeUi(): Promise<void> {
  const b = browser, p = preview;
  browser = null; preview = null;
  if (b) { try { await (await b).close(); } catch { /* 沒啟動成功 */ } }
  if (p && p.proc.exitCode === null) {
    await new Promise<void>(ok => { p.proc.once("exit", () => ok()); p.proc.kill(); G.setTimeout(ok, 2000); });
  }
}

G.process.on("exit", () => { if (preview && preview.proc.exitCode === null) preview.proc.kill(); });

function buildUrl(port: number, query: string): string {
  const params = new G.URLSearchParams(query.replace(/^\?/, ""));
  if (!params.has("anim")) params.set("anim", "off");
  return `http://127.0.0.1:${port}/?${params.toString()}`;
}

async function screenshot(env: McpEnv, args: Record<string, unknown>): Promise<ToolResult> {
  const width = typeof args.width === "number" ? args.width : 1280, height = typeof args.height === "number" ? args.height : 800;
  const settleMs = typeof args.settleMs === "number" ? args.settleMs : 300, steps = typeof args.steps === "number" ? args.steps : 0;
  let b: Browser;
  try { b = await ensureBrowser(); }
  catch (e) { return errorResult(`ui_screenshot 無法啟動 headless Chromium（playwright 未安裝或瀏覽器缺失）：${e instanceof Error ? e.message : String(e)}`); }
  let port: number;
  try { port = await ensurePreview(env.root, args.rebuild === true); }
  catch (e) { return errorResult(`ui_screenshot 無法起 vite preview：${e instanceof Error ? e.message : String(e)}`); }
  const url = buildUrl(port, typeof args.query === "string" ? args.query : ""), errors: string[] = [];
  const page = await b.newPage({ viewport: { width, height } });
  try {
    page.on("pageerror", ((e: Error) => { errors.push(e.message); }) as never);
    page.on("console", ((m: { type(): string; text(): string }) => { if (m.type() === "error") errors.push(m.text()); }) as never);
    await page.goto(url, { waitUntil: "load" });
    await page.waitForSelector('[data-ui="board"]', { timeout: 5000 }).catch(() => undefined);
    for (let i = 0; i < steps; i++) {
      await page.evaluate("window.__battle && window.__battle.settle()");
      await page.waitForTimeout(settleMs);
    }
    if (steps === 0) await page.waitForTimeout(settleMs);
    const snap = await page.evaluate("window.__battle ? window.__battle.snapshot() : null") as
      { round: number; maxRounds: number | null; activeUnit: string | null; playerTurn: boolean; outcome: { text: string } | null } | null;
    const png = await page.screenshot({ type: "png" });
    const info = snap
      ? `第 ${snap.round}${snap.maxRounds ? `／${snap.maxRounds}` : ""} 回合；行動者 ${snap.activeUnit ?? "無"}；${snap.playerTurn ? "玩家回合" : "非玩家回合"}；${snap.outcome ? `已分勝負：${snap.outcome.text}` : "戰鬥進行中"}`
      : "頁面沒有 window.__battle（可能啟動失敗）";
    const text = `${url}（${width}×${height}）\n${info}${errors.length ? `\n頁面錯誤：${errors.slice(0, 5).join(" | ")}` : ""}`;
    return { content: [{ type: "image", data: G.Buffer.from(png).toString("base64"), mimeType: "image/png" }, { type: "text", text }],
      ...(snap ? {} : { isError: true }) };
  } finally { await page.close().catch(() => undefined); }
}

export function createUiTools(env: McpEnv): ToolDef[] {
  return [{
    name: "ui_screenshot",
    title: "網頁戰場截圖",
    description: "用 headless Chromium 開網頁版戰場並截圖（PNG）。query 為 URL 查詢字串，例 scenario=scenario/skirmish-whitegloves&seed=1&spectate=1（自動補 anim=off）；"
      + "spectate=1 為全 AI 觀戰，steps 每次呼叫 window.__battle.settle() 並等 settleMs 毫秒，讓 AI 往下跑。回傳圖片＋回合／行動者／勝負摘要。",
    inputSchema: { type: "object", additionalProperties: false, properties: {
      query: { type: "string", description: "URL 查詢字串（不含 ?）" },
      width: { type: "integer", minimum: 320, maximum: 3840, default: 1280 },
      height: { type: "integer", minimum: 240, maximum: 2160, default: 800 },
      settleMs: { type: "integer", minimum: 0, maximum: 10000, default: 300, description: "載入後（及每個 step 後）等待毫秒" },
      rebuild: { type: "boolean", description: "先重跑 vite build（dist 不存在時一定會跑）" },
      steps: { type: "integer", minimum: 0, maximum: 200, default: 0, description: "載入後呼叫 settle() 的次數" },
    } },
    handler: args => screenshot(env, args),
  }];
}
