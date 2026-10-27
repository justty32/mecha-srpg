# STATE — 交棒：新 session 的起點（2026-10-27 公司 WSL 校正）

[handoffs](README.md)｜非 codex 工作 [engine-backlog](engine-backlog.md)｜下次整理 [next-tidy](next-tidy.md)｜[roadmap](../../planning-roadmap.json)

## 現況一屏

**遊戲**：2108 地月機甲 SRPG 網頁版（TypeScript＋Vite，邏輯與 DOM 分離）。戰鬥（BB 式部位／層／多資源池、意圖撤退、指揮者）、營運（方格大地圖、契約、債務、勢力作戰／外交／傭兵參戰／研發）、百科、MCP 都已落地。

**測試（歷史，不代表 HEAD 綠燈）**：[2026-10-26 整理基準](lead-tidy2/baseline.md)：`npm test` 966／966、`npm run check` 0 錯 10 警告、`npm run typecheck` 0、`npm run test:e2e` 13／13；lore check 舊值 0 錯 2 警告（2026-10-25）。目前核對 HEAD `c9ce4e8`（內容提交 `8ba72b4` 後補記錄）；沒有涵蓋目前 HEAD 的新整合驗收證據。本輪不執行測試或黃金重錄，回家再驗收。

**網頁**：`npm run dev` → `http://localhost:5173/`：`#/` 戰鬥（`?scenario=<id>&seed=<n>`）、`#/wiki` 百科（F1／Shift+W）、`#/ops` 營運（`?seed=<n>`，`&spectate=1` 全 AI 出戰）。

**MCP**：`.mcp.json` 已掛 `mecha-srpg`（`npm run mcp`，stdio）；codex 試玩可自起 socket（`node src/mcp/cli.ts serve --socket <名>.sock`），沙箱改 stdio；用法 `src/mcp/README.md`。

**主要指令**：`npm test`、`npm run check`、`npm run typecheck`、`npm run test:e2e`、`npm run sim -- …`、`npm run sim:campaign -- --months N`、`npm run fuzz -- --runs N --mode mix`、`npm run content:probe -- <id…>`、`npm run content:index`、`npm run build`。見 [testing](../../testing.md)、[dev-env](../../dev-env.md)。

**團隊**：現行配置依 [team-model](../../team-model.md)：頂層／規劃 `gpt-6-astra`，領導／普通工 `gpt-6.1-sol`，簡單工作 `gpt-6.1-terra`。歷史 Fable／Opus 記錄保留；本任務的困難架構問題另由使用者開 Claude Fable 做報告，裁決後才實作。

## 待接續（四線暫停，未收線）

[CLAIMS](../CLAIMS.md) 與 [SESSION-LOG](../../../SESSION-LOG.md) 保留四線未收事項；登記不代表目前有行程正在跑。續線與驗收由主線接手，原生 agent 用工具回報。

**bigfill**：[報告](lead-bigfill/report.md) 存在。215 件入庫在目前歷史的提交是 `c8e0e0a`，報告所載 `634e7ad0` 是舊識別；去重、基調送審與引擎缺口仍待處理。

**pilots**：[報告](lead-fill-pilots/report.md) 存在。148 組人物與 40 招募池為 `299d084`；黃金／軌跡相依測試已由 `de65154` 入庫，接續不用舊 `a3c53115` 或報告舊內容提交 `f3592fef`。其 [golden 報告](lead-fill-pilots/golden/REPORT.md) 的 31 pass 是舊 worktree 指定五檔結果，不是目前 HEAD 全套通過。

**gear**：[報告](lead-fill-gear/report.md) 存在。第一輪 `fbe0a33`、第二輪 `a66cd46`；四市場 13 列已在第二輪提交。`4b0db24` 新增的 `markets-residue.patch` 是 0 bytes，不能當待套市場改動；目前無市場／index 未提交殘檔。舊 fg-golden 產出不得直接覆蓋 `de65154`；被動修正與槽位等問題仍待裁決。

**small**：`lead-small/report.md` 不存在，不能以缺失報告作驗收。第三刃營運、北岸改區、勢力數 7→8 與 index 已在 `69924b0`；提交訊息只記當時單檔／check／typecheck 結果，並明寫全套與戰役黃金待處理，不再視為未提交半成品。

**公司 WSL 邊界**：公司已完成七輪 lore 創作與限定查重；本整理只做交接校正與文件歸位；不安裝、不跑整合驗收或重錄 golden、不改遊戲內容、不刪檔或清 worktree。文件以 `git diff --check` 與 wf-lint 檢查；內容審閱見 [盤點入口](../../../notes/investigations/content-review-2026-10-27/README.md)。

## 七輪世界觀交付與待驗收

82 概念／124 新 JSON 與六條年表已於 `8ba72b4` 提交，`c9ce4e8` 補記錄；創作與限定查重已完成，無活躍創作工人，全部 draft。36 警告、年表 MODE 一次例外、legacy broken2 與回家整合邊界見 [待驗收摘要](tidy-world-1027/pending.md)。舊報告的未 commit 等敘述是當時快照，既有 worktrees 與歷史證據保留。P01 與 Fable 待裁決，四舊線未收線。

## 本段落（2026-10-26）做了什麼

完整列見 [done 索引](done/README.md)；以下連到各線 REPORT。

<!-- wf-nav -->
- [secret](done/2026-10-26/lead-secret/REPORT.md)：lore 可見度與百科隱藏真相落地（45）。
- [tide-cal](done/2026-10-26/lead-tide-cal/REPORT.md)：曆函式與天象旗落地，醒魂改讀大潮（38）。
- [ironsword](done/2026-10-26/lead-ironsword/REPORT.md)／[resist](done/2026-10-26/lead-resist/REPORT.md)：鐵劍與飛魚入庫、抵抗性與近遠增傷落地，黃金依各線重錄。
- [epic-land](done/2026-10-26/lead-epic-land/REPORT.md)：plan-epic 已裁示部分落地到世界觀與 lore。
- 填充七線 [fill](done/2026-10-26/lead-fill/REPORT.md)／[am](done/2026-10-26/lead-fill-am/REPORT.md)／[aegir](done/2026-10-26/lead-aegir/REPORT.md)／[af](done/2026-10-26/lead-fill-af/REPORT.md)／[ea](done/2026-10-26/lead-fill-ea/REPORT.md)／[mech](done/2026-10-26/lead-fill-mech/REPORT.md)／[kaiju](done/2026-10-26/lead-fill-kaiju/REPORT.md)：各區、機甲與怪獸填充收線。
- [dedup](done/2026-10-26/lead-dedup/REPORT.md)／[tone-fix](done/2026-10-26/lead-tone-fix/report.md)：去重、矛盾統一與 Fable 基調方向 1–5 落地。
- [rep](done/2026-10-26/lead-rep/REPORT.md)：勢力招牌機聲望門檻、七家營運資料與舊廠件上架（55、56）。
- [wanchao](done/2026-10-26/lead-wanchao/report.md)：副線 lore 與文案草稿完成，引擎轉 backlog 57–61。
- [tidy2](lead-tidy2/REPORT.md)：已收線 32 線資料夾移 done、inbox 歸檔、近 8 KB 文件 15 份拆檔、src 四檔行為不變拆檔。
- [kaiju2](done/2026-10-26/lead-kaiju2/report.md)／[mech2](done/2026-10-26/lead-mech2/report.md)：各增 24 種怪獸／機甲，缺口轉 backlog 62–73。

上段未另存的紀錄：2026-10-25 tidy commits 01735b4／ff7f3a4／4b21a50（驗收證據／inbox／收尾）；當時無現役線、CLAIMS 空、worktree 只主目錄、無本專案 cx-* tmux、inbox 無未 ack 信。

## 新 session 的第一步

1. 照 `AGENTS.md` 開場；讀本檔、[codex-handover](codex-handover.md)、[engine-backlog](engine-backlog.md)，再核對 CLAIMS、worktree、tmux 現役與領地。
2. 先讀 [fill-rulings](fill-rulings.md) 的已定與落地記錄；世界觀未裁示 v1 殘項 A2／A4／A5／A6／A7／B2／B4、城邦類型欄待開；阿鏽早熟支線需使用者定方向再寫（codex-batches 第 15 列）。
3. 使用者已試玩、尚無具體回饋；有回饋先派修正，見 [WAIT_USER](../../../WAIT_USER.md)（戰鬥九項、cockpit 四點）。數值微調等使用者開口：B1 經濟目標、B2 出戰前士氣、黃金 month>=7 閘門、通用血統拖慢招牌機、A 級頭目難殺與 ×1.1 增傷；使用者 2026-10-26：「數值微調這塊可以後期再做」。醒魂機率維持極稀少，不調。
4. 內容批次先查生效表；引擎缺口照 engine-backlog，整理照 [next-tidy](next-tidy.md)。

> ack 流水自 2026-10-24（lead-tidy）起預設寫 `wf/inbox/done/ack-log.md`；之前在 `wf/inbox/done/2026-10-24/`。
