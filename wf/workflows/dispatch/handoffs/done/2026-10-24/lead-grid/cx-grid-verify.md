# 任務：修大地圖遭遇的兩個手感缺陷、把 24 潮月營運調到合理，並把退化判準做成可重跑的量測

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`——**親自讀，不靠本交接書的摘要**。接著讀 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/PLAN.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-blight/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-actors/REPORT.md`，以及 spec `wf/workflows/planning/specs/ops/world-grid/actors-and-encounters.md`、`migration-and-testing.md`（只讀，不改）。

## 背景與唯一目標

方格大地圖四波都已落地（地點、逐格移動、蝕塊、行動者、大地圖面板）。領導收件時發現：(a) 船**停泊在城裡**也會被巡邏「進入接觸範圍」攔下，玩家按迴避就被趕出城、契約出戰鈕永遠灰（`e2e/ops-campaign.spec.ts` 因此紅）；(b) 初始聲望下的本地巡邏一再攔船；(c) 24 潮月 greedy 第二年蝕格指數成長（第 24 潮月約長陸陸格 41%、每月 +600 格以上）且現金從第 8 潮月起單調下滑。**唯一目標：營運在 24 潮月內玩得下去、`npm run test:e2e` 全綠**，並留下可重跑的量測。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做（可寫路徑清單）：`src/ops/**`（只為下列四件事）；`content/base/world/actions/ops-world.json` 的 `rules`、`content/base/world/actors/*.json` 的數值、`content/base/world/actions/board-*.json` 的 `weight`／`cooldownDays` 數值、`content/base/world/contracts/*.json` 的 `pay`／`deadlineDays` 數值、`content/base/world/rifts/*.json` 的 `spreadPerTide` 數值（都不動文字欄）；`test/campaigns/`（黃金重產）；`e2e/ops-campaign.spec.ts`、`e2e/ops-map.spec.ts`；`package.json` 的 scripts（只可加一條量測腳本）；REPORT 目錄 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/`。
- 四件事：
  1. **停泊安全**：船停泊（在地點 footprint 內、無路徑、非懸停）時不做接觸檢查、不擲蝕域遭遇；行動者 AI 不把停泊中的船當攔截目標。例外：該地點已失守（`ownerOverride` 為裂獸）時照常。
  2. **敵意判定照 spec**：巡邏只在玩家對其勢力 `rep ≤ −30` 或雙方 war 時 `hostile`；商隊、獵團依表 `stance`；只有 `hostile` 會停船並開遭遇四選，`wary` 只發 `Sighted`、且 wary 行動者的 AI 繞開船（標 `SPEC-GAP`：spec 原寫 wary 也停船）。
  3. **24 潮月合理**：greedy、seed 1–3、`--months 24`：都不在第 24 潮月前終局；第 24 潮月蝕格 < 長陸陸格 25%，第 13–24 潮月每月蝕格增量 < 陸格 3%；現金在第 13–24 潮月的月均變化 ≥ 0 至少 2 個 seed；12 潮月判準（蝕格 < 15%、行動者 ∈ [40,200]、遭遇 0.1–0.4／天）仍成立。旋鈕一次只動一個並記錄；蝕域優先考慮潮壓的正回饋（每塊 `+k2`）與收縮速度，經濟優先考慮契約供給（板牌權重、冷卻）與報酬。可參考 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/day-tally.ts`（lead-tune 量到 greedy 約 75% 天數在「無契約等待」）。
  4. **可重跑量測**：`npm run sim:grid-health`（新腳本，可放 `src/ops/sim/health.ts`）跑 idle／greedy／random × seed 1–3 × 12 潮月（另可 `--months 24`），每組印一行：終局與否、12／24 潮月蝕格比、最大月增量、行動者最小／最大、遭遇率、現金首末，並以退化判準判 PASS／FAIL、全 PASS 才 exit 0；另加一個輕量 `node --test` 測試（greedy seed 1、12 潮月）斷言同一組判準。
- 不做：新功能（護送綁商隊、join 綁 force、交涉對白、其他地球圖）；`src/ai/`、`src/rules/`、`src/core/`、`src/ui-adapter/`（UI 若因遭遇改動壞掉寫進 REPORT）；`content/` 文字欄與 `content/lore/`；`wf/`（除 REPORT 目錄）。
- 件數 gate：改＋新增檔超過 50 件就停下回報（黃金檔不計）；容量 gate：單一新檔超過 40 KB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run typecheck`、`npm test`、`npm run check` | 每完成一件事跑 |
| `npm run sim:campaign -- --months 24 --seed N` | 量第 3 件事 |
| `GOLDEN_UPDATE=1 node --test test/campaigns/*.test.ts` | 行為變更後重產黃金 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-grid-verify --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 testing 工作流列的驗證指令與測試；**不 commit**（commit 由領導做；REPORT 列出改了哪些檔）。`npm run test:e2e` 在沙箱內起不了伺服器，由領導在外面跑；你只需讓兩支 e2e 的邏輯對得上新行為。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；不 commit；不 `rm -rf`（要丟的檔搬 `/tmp/cx-grid-verify-trash/` 並在 REPORT 列出）；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 2 個，只准為推進正事開（例如並行跑不同 seed 的量測），它若做實質工作也要親自讀 AGENTS.md 與上列規矩。工作樹裡有其他領導線在寫 `src/ai/`、`content/` 文字欄與新內容檔；看到別人的未提交改動不要還原。

**分清錯誤來源**：工具或環境出錯（指令不存在、權限被擋、沙箱拒寫）→ 停下發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修，不算阻塞。沙箱內 `node --test` 計數不準是已知現象。**沙箱禁止 Unix socket listen 與部分子行程（`spawnSync` 也可能 EPERM），`src/mcp/` 的 cli／e2e 測試、Playwright 與會開子行程的測試在沙箱內可能失敗，這是已知環境限制、不算阻塞、不要因此停工**；REPORT 註明，由領導在沙箱外重跑。測試／fixture 只為跟上新行為的改動不必另行請示，REPORT 列出即可。

## 工作

1. 讀「先讀」，重現 (a)：`seed=3` 接首張契約、航向吉大港、抵達時被巡邏攔下（可用 `src/ops/sim` 寫一段重現）。
2. 做第 1、2 件事，各加測試：停泊中有敵對行動者在接觸範圍內也不開遭遇（失守城例外）；初始聲望巡邏不停船、`rep ≤ −30` 會停船；wary 只發 `Sighted`。
3. 做第 4 件事（量測腳本與輕量測試），先記下調參前的基線表。
4. 做第 3 件事：逐旋鈕調到判準全過，每次調整記一行（旋鈕、舊值→新值、三 seed 結果）。
5. 跑「必用工具」全部、黃金重產，寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 量測腳本 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/health.ts` |
| 調參紀錄與基線／最終表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/tuning.json`（wf-table/1） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-grid/cx-grid-verify/REPORT.md` |

REPORT 四段（做了什麼——改動檔清單；產出——新測試名、`sim:grid-health` 最終輸出全文、調參前後對照；沒做到或證據不足的——含 `SPEC-GAP`；需要決定的事），末尾加一段「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` 0 錯；`npm run check` 0 錯。
2. `npm test` 全過（沙箱外由領導重跑）。
3. 第 2 步三類測試存在且通過（REPORT 列測試名）。
4. `npm run sim:grid-health` 對 12 潮月全組 PASS、exit 0（REPORT 附全文）。
5. greedy seed 1–3 `--months 24` 符合第 3 件事全部判準（REPORT 附表；`tuning.json` 有每次調整的一行）。
6. REPORT 存在，改動檔全在「範圍」清單內。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就保留現狀、REPORT 寫證據（哪條判準差多少），發 `FAILED`。
- **測不出來**（沒跑成、拿不到證據）→ **不回滾、保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-grid-verify`。本線團隊：`teams/grid`。上線先發 `PROGRESS`；每完成「工作」一步發一封 `PROGRESS`（一句話）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-grid-verify --up DONE '一句自足結論' /tmp/cx-grid-verify/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-grid-verify --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「24 潮月玩得下去、e2e 全綠、量測可重跑」；新功能一律不做——此條優先於工作步驟與 spec 原文。
