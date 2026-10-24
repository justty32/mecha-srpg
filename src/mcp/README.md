# src/mcp — 給 agent 玩與測的 MCP server

stdio MCP server（JSON-RPC 2.0，一行一則；協定版本 `2025-06-18`，也接受 `2025-03-26`／`2024-11-05`）。**零執行期依賴**：協定層自己寫，只用 node 24 內建。戰鬥工具走 `src/sim/session.ts`（不 import rules／ai），營運工具走 `src/ops/` 對外 API，截圖用已安裝的 Playwright headless Chromium。

## 啟用

- **Claude Code**：專案根 `.mcp.json` 已登記 `mecha-srpg`（`node src/mcp/server.ts`，cwd＝專案根）。重開 Claude Code，第一次會問要不要啟用這個專案 MCP server，選同意；之後 `/mcp` 看得到 `mecha-srpg`，工具名是 `mcp__mecha-srpg__battle_new` 這類。
- **手動**：`npm run mcp`（stdin／stdout 走協定；log 只寫 stderr）。
- **沒有 MCP 用戶端**（別的 agent、shell）：`node src/mcp/cli.ts serve --socket m.sock` 背景常駐，再 `node src/mcp/cli.ts call --socket m.sock battle_new '{"scenario":"scenario/skirmish-whitegloves"}'`、`node src/mcp/cli.ts list --socket m.sock`。unix socket 路徑有長度上限（約 100 字元），用短的相對路徑。

## 工具

回傳都是「一段中文摘要＋一段精簡 JSON」（JSON 也放在 `structuredContent`）。參數錯誤或遊戲拒絕時回 `isError`，訊息說原因與下一步。

**戰鬥**（session id `b1`…，可多場並存）：`battle_list_scenarios` 列情境；`battle_new(scenario, seed?, playerSlot?, spectate?, rounds?, autoAdvance?)` 開一場，預設玩家 `player`、AI 自動推進到輪到玩家；`battle_observe(id, detail?, map?, window?)` 看回合、輪到誰、我方與已知敵方（部件層血量、資源、效果、位置）與 ASCII 地圖；`battle_legal_actions(id, unit?)` 列可達格（`"x,y:cost"`＋移動範本）、能力與合法目標（命中率、不可用原因）、待機／結束／撤離／棄機，每項附可直接送出的 `action`；`battle_act(id, action)` 送指令（`move` 可用 `to:{x,y}`），回本步與 AI 推進的事件；`battle_step_ai(id, until?, max?)` 推進 AI（command／unit／human／end）；`battle_auto(scenario, seed?, rounds?)` 全 AI 跑完，hash 與 `npm run sim` 相同；`battle_save`／`battle_load`（重播並驗 hash）、`battle_events(id, since?, limit?)`、`battle_close`。

**營運**（session id `c1`…）：`campaign_new(seed, start?)`；`campaign_view(id, log?, map?)` 看日期、房間、待選項、面板、新 log、待出戰；`campaign_actions(id, verbs?)` 列畫面動作（`cmd` 可原樣送出）、可接契約、現成出戰指令；`campaign_act(id, command? | text?)` 送營運指令（物件或中文文字指令），出戰由 AI 結算；`campaign_advance(id, days)` 等 N 天（遇待選事件提早停）；`campaign_auto(seed, months, policy, start?, battles?)` 全自動跑 N 潮月回每月摘要與 hash；`campaign_save`／`campaign_load`／`campaign_close`。

**畫面**：`ui_screenshot(query?, width?, height?, steps?, settleMs?, rebuild?)` 用 headless Chromium 截網頁版戰場（PNG）；`query` 例 `scenario=scenario/skirmish-whitegloves&seed=1&spectate=1`（`spectate=1` 為全 AI 觀戰，`steps` 讓演出往下跑）。

## 典型流程

1. `battle_new {scenario:"scenario/skirmish-whitegloves", seed:1}` → `b1`。
2. `battle_observe {id:"b1", map:true}` 看地圖與單位。
3. `battle_legal_actions {id:"b1"}` → 挑一個 `action` → `battle_act {id:"b1", action}`；重複到 `outcome` 非 null。
4. 回歸測試直接 `battle_auto`／`campaign_auto` 比 hash。

## 檔案

`server.ts` 入口；`protocol.ts` JSON-RPC 與 MCP 方法；`schema.ts` 參數檢查；`tool.ts` 工具契約與內容載入；`battle.ts`＋`battle-view.ts`；`campaign.ts`＋`campaign-view.ts`；`ui.ts`；`cli.ts` socket 客戶端；`node-shim.d.ts` 補 node 型別（專案沒有 `@types/node`）。測試：`node --test 'src/mcp/*.test.ts'`（`e2e.test.ts` 以子行程走 stdio 打一整場，hash 等於 `runBattle`）。
