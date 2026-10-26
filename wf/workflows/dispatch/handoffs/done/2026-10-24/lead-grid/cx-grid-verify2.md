# 任務：接續 cx-grid-verify——修兩個紅測試、遭遇率改按航行日計並補足、24 潮月 greedy 不終局

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/PLAN.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-blight/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-actors/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/REPORT.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/actors-and-encounters.md`、`migration-and-testing.md`（只讀，不改）。

## 背景與唯一目標

前一條線 `cx-grid-verify` 已做完停泊安全、敵意判定、`sim:grid-health` 與蝕域調參（REPORT：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/REPORT.md`，調參紀錄 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/tuning.json`），但以 FAILED 收：`npm test` 兩條紅（`src/mcp/campaign.test.ts` 的「campaign_act sortie：真實 AI 戰果與記錄可存檔重播」收到 `inactive-contract`；`grid-health` 輕量測試），greedy 遭遇率幾乎為 0，seed 3 在第 420 天終局。領導裁示調整判準如下，本線**唯一目標：`npm test` 全綠且新判準下 `sim:grid-health` 全 PASS**。第二年現金斜率改列 engine-backlog「第二年經濟」另案處理，本線不追。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：`src/ops/**`、`src/mcp/**`（只為下列四件事）；`content/base/world/actions/ops-world.json` 的 `rules`、`content/base/world/actors/*.json` 的數值、`content/base/world/actions/board-*.json` 的 `weight`／`cooldownDays` 數值、`content/base/world/contracts/*.json` 的 `pay`／`deadlineDays` 數值、`content/base/world/rifts/*.json` 的 `spreadPerTide` 數值（都不動文字欄）；`test/campaigns/`（黃金重產）；`e2e/ops-campaign.spec.ts`、`e2e/ops-map.spec.ts`；`package.json` 的 scripts（只可加一條量測腳本）；REPORT 目錄 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify2/`。
- 四件事（判準以此為準，取代前一線交接書）：
  1. **修 MCP 重播測試**：查出 `inactive-contract` 的根因（測試前提過期或真實接線錯），修根因；不可刪測試或放寬斷言到失去意義。可寫 `src/mcp/**`。
  2. **遭遇率按航行日計**：`sim:grid-health` 與其輕量測試的遭遇率改為「遭遇數 ÷ 船實際移動的天數」，greedy／random 須落在 0.1–0.4；另要求 greedy 每 seed 12 潮月內遭遇 ≥ 3 次；單日 ≤ 2（若前一線改成上限 1 也可）；idle 只查上限。仍不足時，優先讓敵對裂獸群在船航經的蝕域邊緣出沒（群的 AI 目標、`swarm` 接觸半徑、蝕域每日遭遇率），一次一個旋鈕、記進 `tuning.json`。
  3. **24 潮月不終局**：greedy seed 1–3 `--months 24` 都不在第 24 潮月前 `CampaignEnd`、第 24 潮月末現金 > 0；蝕格判準（24 潮月 < 25%、13–24 月增量 < 3%）與 12 潮月判準照舊。前一線把潮壓蝕格係數設 0：若要恢復正回饋，必須仍過蝕格判準。
  4. `sim:grid-health` 加上新判準、輕量測試同步，全 PASS 才 exit 0。
- 不做：新功能（護送綁商隊、join 綁 force、交涉對白、其他地球圖）；`src/ai/`、`src/rules/`、`src/core/`、`src/ui-adapter/`（UI 若因遭遇改動壞掉寫進 REPORT）；`content/` 文字欄與 `content/lore/`；`wf/`（除 REPORT 目錄）。
- 件數 gate：改＋新增檔超過 50 件就停下回報（黃金檔不計）；容量 gate：單一新檔超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run typecheck`、`npm test`、`npm run check` | 每完成一件事跑 |
| `npm run sim:campaign -- --months 24 --seed N` | 量第 3 件事 |
| `GOLDEN_UPDATE=1 node --test test/campaigns/*.test.ts` | 行為變更後重產黃金 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-verify2 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。`npm run test:e2e` 在沙箱內起不了伺服器，由領導在外面跑；你只需讓兩支 e2e 的邏輯對得上新行為。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（要丟的檔搬 `/tmp/cx-grid-verify2-trash/` 並在 REPORT 列出）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 2 個，只准為推進正事開（例如並行跑不同 seed 的量測），它若做實質工作也要親自讀 AGENTS.md 與上列規矩。工作樹裡有其他領導線在寫 `src/ai/`、`content/` 文字欄與新內容檔；看到別人的未提交改動不要還原。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準是已知現象。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 的 cli／e2e 測試、Playwright 與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**；REPORT 註明，由領導在沙箱外重跑。測試／fixture 只為跟上新行為的改動不必另行請示，REPORT 列出即可。

## 工作

1. 讀「先讀」與前一線 REPORT、`tuning.json`、`final-months.json`。
2. 第 1 件事（MCP 測試根因），定向跑該測試通過。
3. 第 2、4 件事：改量測定義，記基線，再逐旋鈕補遭遇。
4. 第 3 件事：24 潮月 greedy 三 seed 不終局。
5. 跑「必用工具」全部、黃金重產，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify2/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 量測腳本 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/health.ts` |
| 調參紀錄與基線／最終表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify2/tuning.json`（wf-table/1，接續前一線的列） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify2/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單；產出——新測試名、`sim:grid-health` 最終輸出全文、調參前後對照；沒做到或證據不足的——含 `SPEC-GAP`；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run typecheck` 0 錯；`npm run check` 0 錯。
2. `npm test` 全過（沙箱外由領導重跑；REPORT 附你在沙箱內的定向結果）。
3. `npm run sim:grid-health` 12 潮月全組 PASS、exit 0（REPORT 附全文）。
4. greedy seed 1–3 `--months 24` 不終局、末現金 > 0、蝕格判準全過（REPORT 附表；`tuning.json` 每次調整一行）。
5. REPORT 存在，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據（哪條判準差多少），發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-verify2`。本線團隊：`teams/grid`。上線先發 `PROGRESS`；每完成「工作」一步發一封 `PROGRESS`（一句話）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-verify2 --up DONE '一句自足結論' /tmp/cx-grid-verify2/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-verify2 --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「npm test 全綠且新判準全 PASS」；新功能與第二年現金斜率一律不做——此條優先於工作步驟與 spec 原文。
