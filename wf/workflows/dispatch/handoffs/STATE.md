# STATE — 交棒：新 session 的起點（2026-10-26 段落）

[handoffs](README.md)｜非 codex 工作 [engine-backlog](engine-backlog.md)｜下次整理 [next-tidy](next-tidy.md)｜[roadmap](../../planning-roadmap.json)

## 現況一屏

**遊戲**：2108 地月機甲 SRPG 網頁版（TypeScript＋Vite，邏輯與 DOM 分離）。戰鬥（BB 式部位／層／多資源池、意圖撤退、指揮者）、營運（方格大地圖、契約、債務、勢力作戰／外交／傭兵參戰／研發）、百科、MCP 都已落地。

**測試**：[本輪基準](lead-tidy2/baseline.md)：`npm test` 966／966、`npm run check` 0 錯 10 警告、`npm run typecheck` 0、`npm run test:e2e` 13／13；lore check 舊值 0 錯 2 警告（2026-10-25）。

**網頁**：`npm run dev` → `http://localhost:5173/`：`#/` 戰鬥（`?scenario=<id>&seed=<n>`）、`#/wiki` 百科（F1／Shift+W）、`#/ops` 營運（`?seed=<n>`，`&spectate=1` 全 AI 出戰）。

**MCP**：`.mcp.json` 已掛 `mecha-srpg`（`npm run mcp`，stdio）；codex 試玩可自起 socket（`node src/mcp/cli.ts serve --socket <名>.sock`），沙箱改 stdio；用法 `src/mcp/README.md`。

**主要指令**：`npm test`、`npm run check`、`npm run typecheck`、`npm run test:e2e`、`npm run sim -- …`、`npm run sim:campaign -- --months N`、`npm run fuzz -- --runs N --mode mix`、`npm run content:probe -- <id…>`、`npm run content:index`、`npm run build`。見 [testing](../../testing.md)、[dev-env](../../dev-env.md)。

**團隊**：頂層 Fable → 領導 Opus → 工人 codex（預設 sol；內容計畫 astra → 產出 sol）；規劃 Fable，見 [team-model](../../team-model.md)。

## 現役

依 [CLAIMS](../CLAIMS.md) 與 [SESSION-LOG](../../../SESSION-LOG.md)：

- **lead-engine-next**：AI 自護／友方支援招（68、73）、萬潮葬王副線引擎（57–61）、黃金重錄。
- **lead-bigfill**：下一輪大填充（月面、可玩內容、加深）。

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
