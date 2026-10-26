# src/mcp — 給 agent 玩與測的 MCP server

stdio MCP server（JSON-RPC 2.0，一行一則；協定版本 `2025-06-18`，也接受 `2025-03-26`／`2024-11-05`）。**零執行期依賴**：協定層自己寫，只用 node 24 內建。戰鬥工具走 `src/sim/session.ts`（不 import rules／ai），營運工具走 `src/ops/` 對外 API，截圖用已安裝的 Playwright headless Chromium。

<!-- wf-nav -->
- [README/tools.md](README/tools.md)：列出戰鬥、批次戰鬥、營運、畫面與戰役互動出戰工具。
- [README/play.md](README/play.md)：說明戰鬥指揮、觀察資訊與戰役互動出戰的操作流程。

## 啟用

- **Claude Code**：專案根 `.mcp.json` 已登記 `mecha-srpg`（`node src/mcp/server.ts`，cwd＝專案根）。重開 Claude Code，第一次會問要不要啟用這個專案 MCP server，選同意；之後 `/mcp` 看得到 `mecha-srpg`，工具名是 `mcp__mecha-srpg__battle_new` 這類。
- **手動**：`npm run mcp`（stdin／stdout 走協定；log 只寫 stderr）。
- **沒有 MCP 用戶端**（別的 agent、shell）：`node src/mcp/cli.ts serve --socket m.sock` 背景常駐，再 `node src/mcp/cli.ts call --socket m.sock battle_new '{"scenario":"scenario/skirmish-whitegloves"}'`、`node src/mcp/cli.ts list --socket m.sock`。unix socket 路徑有長度上限（約 100 字元），用短的相對路徑。

## 量平衡（不經 MCP）

填完內容想先知道數值有沒有失衡，跑 `npm run content:probe -- <id…>`（frame／monster／ability／scenario，自動配同級基準對手，印勝率、平手率、結算原因、能力使用次數、超出數值帶的欄位；`--json -` 給機器讀）；用法列在 testing 資料檔「內容平衡探針」列。數字可疑再用上面的 `battle_*` 親手打一場。

## 檔案

`server.ts` 入口；`protocol.ts` JSON-RPC 與 MCP 方法；`schema.ts` 參數檢查；`tool.ts` 工具契約與內容載入；`battle.ts`＋`battle-view.ts`；`campaign.ts`＋`campaign-view.ts`；`ui.ts`；`cli.ts` socket 客戶端；`node-shim.d.ts` 補 node 型別（專案沒有 `@types/node`）。測試：`node --test 'src/mcp/*.test.ts'`（`e2e.test.ts` 以子行程走 stdio 打一整場，hash 等於 `runBattle`）。
