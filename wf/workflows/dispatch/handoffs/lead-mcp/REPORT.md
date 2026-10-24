# REPORT — lead-mcp：遊戲 MCP server（頂層代存，2026-10-24）

STATUS：**DONE**。commit `f6272b4`（本體）、`ab2cf3f`（收線）。工人 REPORT：[cx-mcp-core](cx-mcp-core/REPORT.md)、[cx-mcp-ops](cx-mcp-ops/REPORT.md)、[op-mcp-ui](op-mcp-ui/REPORT.md)；試玩子 agent `op-mcp-play` 的 REPORT 未落檔（要點併入本檔）。用法 `src/mcp/README.md`。

## 工具（21）
- 戰鬥 11：`battle_list_scenarios`、`battle_new`、`battle_observe`（可帶 ASCII 地圖、敵方只給視野內）、`battle_legal_actions`、`battle_act`、`battle_step_ai`、`battle_auto`、`battle_save`／`battle_load`（重播核對 hash）、`battle_events`、`battle_close`；可多場並開；只走 sim `BattleSession`。
- 營運 9：`campaign_new`、`campaign_view`、`campaign_actions`、`campaign_act`（指令物件或中文文字；出戰由 AI 打完）、`campaign_advance`、`campaign_auto`、`campaign_save`／`campaign_load`／`campaign_close`；只用 ops 對外 API。
- 截圖 1：`ui_screenshot`（headless Chromium）；網頁支援 `?spectate=1`。
- 協定自寫、零依賴、版本 `2025-06-18`；無 MCP 用戶端時 `node src/mcp/cli.ts serve/call` 走 unix socket。

## 試玩（Opus 子 agent 經 socket CLI）
skirmish seed 5 第 2 輪勝、seed 3 六輪平手；戰役玩到第 33 天、2 約 2 勝。修 15 處：`battle_legal_actions` 14,265→2,213 字（可達格壓成 `"x,y:cost"`）、`battle_observe` 2,154→1,505 字；被擊毀敵機誤顯示作戰中；能力無合法目標時說明原因；同名敵機附 id；營運補世界圖與出戰入口。修前後同場 hash 一致。

## 測試（乾淨 worktree）
`npm test` 492/492；MCP 15/15（子行程 stdio 打完一場 hash＝`runBattle`、`battle_auto` hash＝`npm run sim`）；e2e 12/12；check、typecheck 0。畸形 JSON 回 -32700、未知方法 -32601。

## 啟用
專案根重開 Claude Code → 啟用 `.mcp.json` 的 `mecha-srpg` → `/mcp` 確認 → 工具名 `mcp__mecha-srpg__battle_new` 等。

## 需要決定（頂層 2026-10-24）
1. `reaper-cleave`、`reaper-charge` `costs: []` 可無限攻擊 → 交 lead-content-polish 補成本。
2. skirmish 燕鷗／獵犬無能力 → lead-content-polish 已在補 innateAbilities。
3. ops 文案缺漏與 `board`／`map` 輸出移進 ops 畫面 → 交下一條 ops UI／文案線（事件模板已交 lead-content-world）。
4. 戰役內互動出戰（兩段式，起點 `sortieBattleSetup`）→ 併入試玩改進線。
附註：`src/mcp/ui.ts` 以 `globalThis` 繞型別，`src/mcp/node-shim.d.ts` 已有，可改乾淨。
