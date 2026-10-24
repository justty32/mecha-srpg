// ui_screenshot：直接呼叫 handler（不經協定層）；跑不起 Chromium／沒有 playwright 時 skip。
import test, { after } from "node:test";
import assert from "node:assert/strict";
import { createEnv } from "./tool.ts";
import { closeUi, createUiTools } from "./ui.ts";

const tool = createUiTools(createEnv()).find(t => t.name === "ui_screenshot")!;
after(async () => { await closeUi(); });

async function shot(t: { skip(msg?: string): void }, args: Record<string, unknown>) {
  const r = await tool.handler(args);
  if (r.isError && /Chromium|vite preview/.test(JSON.stringify(r.content))) { t.skip(`環境跑不起 headless Chromium／preview：${JSON.stringify(r.content[0])}`); return null; }
  return r;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function png(r: Awaited<ReturnType<typeof tool.handler>>): Uint8Array {
  const img = r.content.find(c => c.type === "image");
  assert.ok(img && img.type === "image" && img.mimeType === "image/png");
  return (globalThis as any).Buffer.from(img.data, "base64");
}
const text = (r: Awaited<ReturnType<typeof tool.handler>>): string => r.content.filter(c => c.type === "text").map(c => (c as { text: string }).text).join("\n");

test("ui_screenshot：預設戰場回 PNG 與回合資訊", async t => {
  const r = await shot(t, { query: "seed=1" }); if (!r) return;
  assert.notEqual(r.isError, true);
  assert.deepEqual([...png(r).subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.match(text(r), /回合/); assert.ok(!/頁面錯誤/.test(text(r)), text(r));
});

test("ui_screenshot：?spectate=1 全 AI 觀戰，steps 後仍有回合資訊", async t => {
  const r = await shot(t, { query: "scenario=scenario/skirmish-whitegloves&seed=1&spectate=1", steps: 2, settleMs: 50, width: 800, height: 600 }); if (!r) return;
  assert.deepEqual([...png(r).subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  assert.match(text(r), /非玩家回合|已分勝負/); assert.match(text(r), /spectate=1/);
});
