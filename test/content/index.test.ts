// 內容索引一致性：content/index/ 各分片必須等於 wf/tools/content_index.py 依實際檔案重產的結果。
// 過時就紅——新增／改了內容檔後跑 `npm run content:index` 重產並一起 commit。
import { test } from "node:test";
import assert from "node:assert/strict";

type Spawn = (cmd: string, args: string[], opts: { encoding: "utf8" }) => { status: number | null; stdout: string; stderr: string };

test("content/index 分片與 content/ 實際檔案一致", async () => {
  // test/types/node-shim.d.ts 未宣告 child_process：以變數 specifier 動態載入（同 src/mcp/ui.ts 作法）。
  const mod = "node:child_process";
  const { spawnSync } = (await import(mod)) as { spawnSync: Spawn };
  const r = spawnSync("python3", ["-I", "wf/tools/content_index.py", "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
});
