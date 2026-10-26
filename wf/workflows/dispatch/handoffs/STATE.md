# STATE — 交棒：新 session 的起點（2026-10-25 段落收尾）

[handoffs](README.md)｜非 codex 工作 [engine-backlog](engine-backlog.md)｜下次整理 [next-tidy](next-tidy.md)｜roadmap [planning-roadmap.json](../../planning-roadmap.json)

## 現況一屏

**遊戲**：2108 地月機甲 SRPG 網頁版（TypeScript＋Vite，邏輯與 DOM 分離）。戰鬥（BB 式部位／層／多資源池、意圖撤退、指揮者）、營運（節點圖世界、契約、債務、勢力作戰／外交／傭兵參戰／研發）、百科、MCP 都已落地；方格大地圖已落地（lead-grid）。

**測試**：`npm test` 935／935、`npm run check` 0 錯 8 警告（2026-10-25，lead-cockpit 收線時）；`npm run typecheck` 0；`node content/lore/check.ts` 0 錯 2 警告；`npm run test:e2e` 13／13。

**網頁**：`npm run dev` → `http://localhost:5173/`：`#/` 戰鬥（`?scenario=<id>&seed=<n>`）、`#/wiki` 百科（F1／Shift+W）、`#/ops` 營運（`?seed=<n>`，`&spectate=1` 全 AI 出戰）。

**MCP**：`.mcp.json` 已掛 `mecha-srpg`（`npm run mcp`，stdio）；codex 試玩用自起 socket（`node src/mcp/cli.ts serve --socket <名>.sock`）。用法 `src/mcp/README.md`。

**主要指令**：`npm test`、`npm run check`、`npm run typecheck`、`npm run test:e2e`、`npm run sim -- …`、`npm run sim:campaign -- --months N`、`npm run fuzz -- --runs N --mode mix`、`npm run content:probe -- <id…>`、`npm run content:index`、`npm run build`。驗證表全貌見 [testing](../../testing.md)，環境見 [dev-env](../../dev-env.md)。

**團隊**：頂層 Fable → 領導 Opus → 工人 codex `gpt-6-astra`（reasoning high）；規劃 Fable（[team-model](../../team-model.md)）。

## 現役

- **無現役線**（2026-10-25 收尾）；CLAIMS 現役表空、`git worktree list` 只有主目錄、無本專案 `cx-*` tmux、inbox 無未 ack 信。
- 使用者 2026-10-25 已試玩但沒給具體回饋，見 [WAIT_USER](../../../WAIT_USER.md)。延後不派：B1 經濟目標、B2 出戰前士氣、黃金 month>=7 閘門等數值微調。

## 本段落（2026-10-25）做了什麼

各線 REPORT 見 [done 索引](done/README.md)：

- tidy：01735b4（收線驗收證據入版控）、ff7f3a4（inbox 歸檔）、4b21a50（收尾整理）。
- [talk-decide](talk-decide/REPORT.md)：Fable 對談八題拍板（機甲核心不耗損、機魂能獨駕、AI 醒魂、精粹改人、大潮全球同一時刻）。
- [lead-decide-land](lead-decide-land/REPORT.md)：裁示落地到 design-notes／specs／守則／style（頂層代存 4b6992d）。
- [lead-cockpit](lead-cockpit/REPORT.md)：引擎——機甲核心與座艙、無人機普通開、人帶能力、驅動時數與外貌年齡、AI 醒魂、no-pilots 終局；暫值在 `content/base/rules/cockpit.json`（代存 62ca3ed）。
- [lead-polish](lead-polish/REPORT.md)：翻譯腔五批 225 檔審、161 檔改。
- lead-lore-fix（218b154）：阿鏽人格早熟記為特例伏筆；老爹維持釜山育成（身世提案不採）；montreal 學會為買方。

## 新 session 的第一步

1. 照 `AGENTS.md` 開場（SESSION-LOG／WAIT_USER 計數、`inbox_read.sh wf/inbox/new`）。
2. 讀本檔 → [codex-handover](codex-handover.md) → [engine-backlog](engine-backlog.md)。
3. 確認沒有殘留現役線（[CLAIMS](../CLAIMS.md)、`git worktree list`、`tmux ls | grep '^cx-'`）。
4. 使用者回饋到了先派修正線（見 WAIT_USER，含 cockpit REPORT 四點）。
5. 下一批可派：engine-backlog 剩餘列——第 38 列大潮曆已完成（2026-10-26 lead-tide-cal，醒魂已改讀大潮；天象效果接 39–43，醒魂潮骰機率待使用者定，見 [lead-tide-cal REPORT](lead-tide-cal/REPORT.md)）、第 28 列抵抗性（順帶把強化打擊／遠程分近戰遠程增傷）；第 45 列隱藏真相標記已完成（2026-10-26 lead-secret，lore 可見度欄見 content/lore/README「可見度」）；P2 `nameEn`／`etymology` 可另開小線；鐵劍（與飛魚）models 入庫已完成（2026-10-26 lead-ironsword，黃金戰役已重錄，以後軌跡變了用 `node test/campaigns/rerecord.ts` 重錄，見 lead-ironsword REPORT（待頂層代存）、done 索引）。
6. 內容：阿鏽人格早熟支線待寫（[codex-batches](codex-batches.json) 第 15 列，需使用者定方向再動筆）；其餘 add／polish 批次照 codex-handover。
7. 整理：設定筆記 `world/essence.md`、`world/scale.md`、`terms.md` 逼近 8 KB，下次動它們前先按主題拆；其餘照 [next-tidy](next-tidy.md)。
8. 延後的數值微調（B1 經濟目標、B2 出戰前士氣、黃金 month>=7 閘門）等使用者開口再排。

> `inbox_ack.sh --state` 的 ack 流水自 2026-10-24（lead-tidy）起預設寫 `wf/inbox/done/ack-log.md`，不再追加到本檔；之前的流水在 `wf/inbox/done/2026-10-24/`。
