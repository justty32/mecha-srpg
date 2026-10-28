# overview — STATE 補充

[STATE](../STATE.md)

## 現況一屏

**遊戲**：2108 地月機甲 SRPG 網頁版（TypeScript＋Vite，邏輯與 DOM 分離）。戰鬥（BB 式部位／層／多資源池、意圖撤退、指揮者）、營運（方格大地圖、契約、債務、勢力作戰／外交／傭兵參戰／研發）、百科、MCP 都已落地。

**測試（歷史，不代表 HEAD 綠燈）**：[2026-10-26 整理基準](../lead-tidy2/baseline.md)：`npm test` 966／966、`npm run check` 0 錯 10 警告、`npm run typecheck` 0、`npm run test:e2e` 13／13；lore check 舊值 0 錯 2 警告（2026-10-25）。舊 SVG 試作機甲百層／演出交付為 `04bf2dd`；最新獨立[機甲配置原型](../../../../../art/mech-blueprint/README.md)實作在 `6cc5a1b2`，報告與歸檔另見 git log。這兩項美術局部驗證都不構成目前 HEAD 的遊戲整合驗收；目前為 2026-10-28 公司 WSL 收工，整合驗收與黃金核對仍留回家接續。今日另交付 Canvas `69403bc2` 與真 3D `573575ec`，均為獨立展示；見 [美術](art.md)。

**網頁**：`npm run dev` → `http://localhost:5173/`：`#/` 戰鬥（`?scenario=<id>&seed=<n>`）、`#/wiki` 百科（F1／Shift+W）、`#/ops` 營運（`?seed=<n>`，`&spectate=1` 全 AI 出戰）。

**MCP**：`.mcp.json` 已掛 `mecha-srpg`（`npm run mcp`，stdio）；codex 試玩可自起 socket（`node src/mcp/cli.ts serve --socket <名>.sock`），沙箱改 stdio；用法 `src/mcp/README.md`。

**主要指令**：`npm test`、`npm run check`、`npm run typecheck`、`npm run test:e2e`、`npm run sim -- …`、`npm run sim:campaign -- --months N`、`npm run fuzz -- --runs N --mode mix`、`npm run content:probe -- <id…>`、`npm run content:index`、`npm run build`。見 [testing](../../../testing.md)、[dev-env](../../../dev-env.md)。

**團隊**：現行配置依 [team-model](../../../team-model.md)：頂層／規劃 `gpt-6-astra`，領導／普通工 `gpt-6.1-sol`，簡單工作 `gpt-6.1-terra`。歷史 Fable／Opus 記錄保留；本任務的困難架構問題另由使用者開 Claude Fable 做報告，裁決後才實作。
