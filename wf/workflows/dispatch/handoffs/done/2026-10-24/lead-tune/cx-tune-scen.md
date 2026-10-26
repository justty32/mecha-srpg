# 任務：把第 4 輪就穩贏的護送／突圍情境調到有懸念

> 領導 `lead-tune` 寫給 codex 工人 `cx-tune-scen`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容規矩：`content/README.md`。來源：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/issues.json` 的 ISS-043（用 `python3 wf/tools/tabledb.py wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/issues.json grep ISS-043` 查）、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/REPORT.md`。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-scen`（乾淨 git worktree，HEAD `326c40b`；`node_modules` 是指向主 repo 的連結；量測工具已複製到 worktree 內 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/`；下文相對路徑都以它為根）。

## 背景與唯一目標

戰鬥 sweep（AI 對 AI，seed 1–5）裡六個情境玩家方 5/5 勝且平均 4–5 輪收場：`convoy-run`、`siege-beetle-convoy`、`tidal-flat-evac`、`shell-excavation-escort`（護送四情境，車隊直奔出口撤離）、`lunar-blockade-run`、`mirror-choir-vigil`。**唯一目標：只改這六個情境檔的數值／座標欄，讓每個情境在 seed 1–10 玩家方勝 3/10–8/10、平均輪數 ≥7，且全 sweep 四數字仍達標。** 護送四情境是必做；後兩個若 30 分鐘內調不動可留下，REPORT 寫原因。

注意：另一位工人 `cx-tune-anchor` 同時在別的 worktree 改 `src/ai/` 與巢母數值；合併後數字會小幅變，領導合併後重量。另一條線 lead-rename 稍後會潤飾這些檔的**文字欄**，你不碰文字欄，領導用三方合併。

## 範圍（排除法寫死）

- 只做：`content/base/scenarios/` 下上述六個檔的**非文字欄**：單位座標 `at`、敵方 `units` 的增減與換成既有 monster／frame（引用既有 id）、出口與區域座標、`rounds`、`objectives` 的數值參數。
- 不做：`name`、`brief` 等文字欄；其他情境檔；`src/` 任何檔；aiprofile、monster、frame、map 檔；`content/index/`；黃金檔（不准設 `GOLDEN_UPDATE`）；spec。
- 件數 gate：改動檔超過 6 個就停下回報；容量 gate：diff 超過 30 KB 就停下回報。任一觸發都停。
- 時間 gate：上線起 75 分鐘內回報；到時沒達標也停，回報最好的一版與數字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tune-scen --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/sweep.ts --seeds 1,2,3,4,5,6,7,8,9,10 scenario/convoy-run`（worktree 內跑；情境 id 可列多個） | 單情境量測（每情境一行 JSON：勝方分布、逐場輪數與原因） |
| `bash wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/psweep.sh /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-scen /tmp/cx-tune-scen/sweep.jsonl` | 全 26 情境×5 seed sweep（開工與最終各一次） |
| `python3 wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/sweep-sum.py /tmp/cx-tune-scen/sweep.jsonl` | sweep 彙總 |
| `npm run check` | 內容驗證（0 錯；警告不多於開工時） |

全 sweep 起點（領導量）：平手 7.7%（10/130）、平均 12.45 輪、勝方 player 55%／ally 22.5%／enemy 20.8%／third 1.7%、rift-edge-nest 玩家陣營 4/5。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的六個檔（在工作目錄 worktree 內）與 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-scen/`；臨時檔只放 `/tmp/cx-tune-scen/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；你自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 上線 PROGRESS；跑全 sweep 與六情境 seed 1–10 當基準；`inbox_poll --once`。
2. 看每個情境為什麼第 4 輪就贏（車隊離出口幾格、敵人追不追得上），REPORT 寫一行一情境；`inbox_poll --once`。
3. 調六個檔，反覆量到目標；`inbox_poll --once`。
4. 跑最終全 sweep 與 `npm run check`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-scen/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-scen/content/base/scenarios/` 的六個檔 |
| 最終量測 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-scen/six-final.jsonl`（六情境 seed 1–10）、同目錄 `sweep-final.jsonl` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-scen/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），另附「前後數字表」（每情境：改了什麼、舊勝場→新勝場、舊平均輪數→新；全 sweep 四數字前後），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 六情境 seed 1–10 最終：護送四情境各玩家勝 3/10–8/10 且平均輪數 ≥7；另兩個達標或寫明原因。
2. 全 sweep 最終：timeout 平手率 <10%、平均輪數 10–16、`rift-edge-nest` 玩家陣營勝 ≥3/5、勝方任一方 <70%。
3. `npm run check` 0 錯，警告不多於開工時。
4. REPORT 存在且有四段＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tune-scen`。本線團隊：`teams/tune`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tune-scen --up STATUS '一句自足結論' 正文檔`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
