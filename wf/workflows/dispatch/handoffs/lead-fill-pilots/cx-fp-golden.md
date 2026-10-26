# 任務：黃金與時序相依測試重錄（新增 40 個招募池後，招募抽樣軌跡改變）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`、`test/campaigns/rerecord.ts`（檔頭說明）、`test/campaigns/golden-spec.ts`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`（資源禁令）。REPORT 開頭列已讀清單。

## 背景
隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-golden/`（HEAD＝f3592fef，已含新增的 148 個背景／person／lore 與 40 個新招募池，每季招募抽樣的亂數軌跡因此改變）。以下 5 個測試檔現在紅，原因都是軌跡相依，**內容本身沒錯**：
- `src/ops/crew/crew.test.ts`：「recruit：弦月候選決定性…」
- `src/ops/sim/campaign.test.ts`：「idle 12 蝕月：每天不變量全空」
- `src/ops/sim/golden.test.ts`：「黃金戰役固定指令的事件日誌 hash 相符」
- `src/mcp/campaign.test.ts`：「campaign_act sortie：真實 AI 戰果與記錄可存檔重播」（錯誤：抵達時契約已失效 contract-261 day=40）
- `test/campaigns/campaigns.test.ts`：黃金戰役 ops-war-assault、ops-relic、ops-merc-join、ops-betrayal（`node test/campaigns/rerecord.ts <name>` 對 ops-merc-join 報 #41 accept contract-126 被拒；ops-relic 要逐日延長）。

## 任務
在 worktree 內讓上面 5 個檔全綠，**只改**：`test/campaigns/*`、`test/golden/*`、`src/**/*.test.ts` 與 `src/ops/sim/` 下的測試用 fixtures／hash 檔（找出寫死軌跡的期望值、契約 id、日期；改成跟著新軌跡，或改成不依賴亂數軌跡的寫法）。**不准**改任何非測試的 src 程式碼、不准改 `content/`、不准刪除斷言（只可換期望或換成同等強度的不變量檢查）。黃金 hash 用 `GOLDEN_UPDATE=1` 重產，並說明每個 hash 為何變（招募軌跡）。ops-merc-join 若 rerecord 工具做不到，手動調整其指令序列（例如以新軌跡下的契約 id 取代 contract-126，保留該黃金戰役的原意：傭兵加入）。

## 資源禁令（使用者：CPU 記憶體被弄爆）
**不跑** `npm test`／e2e／sim／fuzz；只跑 `node --test <單檔>`（逐檔）。沒有其他工人要求的測試。

## 範圍與禁區
可寫：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-golden/` 與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/golden/`。不 commit、不 push、不碰主工作樹、不 `rm -rf`、不裝依賴、不碰鍵鼠螢幕。子代理上限 1。

## 驗收（固定 3 條）
1. 上述 5 個測試檔各自 `node --test <檔>` 全綠（貼 pass/fail 數）。
2. `git -C worktree status --short` 只有 test／`src/**/*.test.ts`／fixtures 變更（貼清單）。
3. REPORT.md（報告目錄）列每個改動檔與原因。

最後訊息 5 行摘要。
