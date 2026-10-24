# 任務：把 sortie.test.ts 的出戰點改成在營運內容變動下仍穩定的固定程序

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-sortie`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。前一位工人：`wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-mcp/REPORT.md`。程式：`src/mcp/sortie.test.ts`（目前工作樹版）、`src/mcp/campaign.ts`（`campaign_actions` 列出的 accept／sail／sortie 項）。乾淨對照工作樹（HEAD＋本隊改動、**沒有** lead-gaps-ops 未提交的營運改動）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/wt-v1`。

## 背景與唯一目標

上一版把 greedy 搜尋換成寫死的指令清單（`contract-13`、`chittagong`、`mech-8`…），在主工作樹會過，但在乾淨 HEAD（營運內容不同）第一步承接就被拒 `not-offered`——寫死 id 一改營運就壞。**唯一目標：`sortie.test.ts` 用不依賴政策、也不寫死契約／節點 id 的固定程序找出戰點，在兩個工作樹都通過。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：改 `src/mcp/sortie.test.ts` 的 fixture 建立：固定 seed；派第一台可派的機與第一位可派駕駛（從 `campaign_view`／`campaign_actions` 的結構化輸出取，依 id 排序取第一）；待選事件一律選第一個未停用選項；每次 `wait 1` 天後查 `campaign_actions`，出現第一個未停用的 `accept`（依契約 id 排序）就承接，之後照 actions 裡的航行項前往（若需要），直到出現可出戰的 sortie 項，以它的 sortie 參數作為 `command`；整段上限 60 步，超過就 throw 並印出最後畫面摘要。三個原測試的斷言不變。
- 不做：其他任何檔（含 `src/mcp/` 其他檔、`src/ops/`）；不 commit。
- 件數 gate：改動檔超過 1 個就停下回報；容量 gate：diff 超過 20 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-sortie --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `node --test --test-isolation=none src/mcp/sortie.test.ts` | 在主工作樹跑 |
| `cd /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/wt-v1 && node --test --test-isolation=none src/mcp/sortie.test.ts` | 在乾淨工作樹跑（先把你改好的 sortie.test.ts 拷進去：`cp /home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/sortie.test.ts /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/wt-v1/src/mcp/`） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-sortie/`；臨時檔只放 `/tmp/cx-gb-sortie/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ai/`、`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；讀程式；`inbox_poll --once`。
2. 改 fixture；兩個工作樹各跑一次；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-sortie/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/mcp/sortie.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-sortie/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. 主工作樹與 `wt-v1` 兩邊 `node --test --test-isolation=none src/mcp/sortie.test.ts` 都 3/3 pass（REPORT 貼兩段輸出尾）。
2. `grep -cE 'greedy|contract-[0-9]|mech-[0-9]|node/' src/mcp/sortie.test.ts` 為 0。
3. REPORT 存在且有四段。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-sortie`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-sortie --up PROGRESS 'cx-gb-sortie 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-sortie --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-sortie/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-sortie --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。
