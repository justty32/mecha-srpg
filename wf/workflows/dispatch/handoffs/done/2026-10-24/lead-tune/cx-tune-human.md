# 任務：下修六份人類遭遇的編成，讓營運玩家隊打人類對手有合理勝率

> 領導 `lead-tune` 寫給 codex 工人 `cx-tune-human`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容規矩：`content/README.md`。來源：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/REPORT.md`（「人類遭遇偏難」）。程式（只讀）：`src/ops/sortie/scenario.ts`（`budgetByGrade` 怎麼變成敵方名額、`units[].w` 權重）、`src/ops/sortie/encounter.test.ts`（六份人類遭遇的固定 seed 戰鬥測試）、`src/ops/sortie/test-support.ts`（`fixture()`）、`src/sim/`（`scenarioToSetup`、`runBattle`）。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-human`（乾淨 git worktree，HEAD `b95dcd4`；`node_modules` 是指向主 repo 的連結；下文相對路徑都以它為根）。

## 背景與唯一目標

人類對手遭遇（`content/base/world/encounters/` 的 `league-blight-checkpoint`、`rival-anvil-carcass`、`rival-saltgull-ambush`、`selene-whiteglove-audit`、`smuggler-farside-ship`、`tide-unshacklers`）上一輪 6 份固定 seed 測試玩家全敗；`smuggler-farside-ship` 是 A 級×4、`tide-unshacklers` 是 B 級×5，當初是為了湊 `budgetByGrade` 與手上只有的 frame 等級。**唯一目標：只改這六個檔的編成數值，讓營運玩家隊（default 開局整個機庫，見下方第二輪）打每份人類遭遇在 seed 1–10 的勝率（勝＋對方撤退都算玩家勝）落在 3/10–8/10，六份合計 40%–75%。**

**第二輪（領導修訂，優先於上文與前一版 REPORT）**：第一輪（REPORT 在交付目錄，worktree 留有它的六檔改動）用 `fixture()` 的 **1 台** C 級獵犬當玩家隊，把每份遭遇都砍成 1 台敵機——但營運實際出戰是**整個機庫**（`content/base/world/campaign-start/default.json` 的全部機體與駕駛，greedy 策略 `src/ops/sim/policies.ts` 的 `allUnits` 一次全派），1 對 1 量出來的編成放進營運會太弱。這一輪：**玩家隊改成 default 開局機庫全部機體（照開局的配裝與駕駛）**，從 worktree 現狀出發重調（名額可以加回去），目標數字不變；REPORT 覆寫為第二輪版本，前後數字表的「舊」欄用 HEAD `b95dcd4` 原編成在新玩家隊下的結果。量測腳本可以用 `src/ops/content/` 的開局建構（例：`src/ops/sim/campaign.ts` 怎麼建初始狀態）取得機庫，再組 sortie 呼叫 `generateScenario`。

注意：另一位工人 `cx-tune-intent` 同時在另一個 worktree 改 `src/ai/`（撤退判斷），合併後勝率會再變；領導會在合併後重量。你不碰 `src/`。

## 範圍（排除法寫死）

- 只做：上述六個 `content/base/world/encounters/*.json` 的 `budgetByGrade`（等級鍵與名額）與 `units` 陣列（`w` 權重；可追加引用**既有** frame／person 的條目，不新增檔）；量測腳本只放 `/tmp/cx-tune-human/` 與 REPORT 目錄。
- 不做：`src/` 任何檔（含測試）、其他 encounter 檔、frame／component／person／faction 檔、文字欄（`name`、描述等，lead-rename 的領地）、`content/index/`、黃金檔（不准設 `GOLDEN_UPDATE`）、spec。
- 件數 gate：改動檔超過 6 個就停下回報；容量 gate：diff 超過 20 KB 就停下回報。任一觸發都停。
- 時間 gate：第二輪上線起 60 分鐘內回報；到時沒達標也停，回報最好的一版與數字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tune-human --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test --test-isolation=none src/ops/sortie/encounter.test.ts` | 每次改完驗證編成合法（測試斷言敵方名額＝`budgetByGrade` 總和） |
| `npm run check` | 內容驗證（0 錯；警告數不得比開工時多） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的六個檔（在工作目錄 worktree 內）與 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-human/`；臨時檔只放 `/tmp/cx-tune-human/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT 與量測腳本）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；你自己寫的量測腳本出錯 → 自己修。

## 工作

1. 上線 PROGRESS；自寫量測腳本 `/tmp/cx-tune-human/human-bench.ts`（import 用絕對路徑指向 worktree 的 `src/`，**不可**從主 repo 目錄執行或 import 主 repo 的 `src/`——主 repo 的 `src/ops/` 正被別線改；收尾時複製一份到交付表的路徑；照 `encounter.test.ts` 第 84 行起的人類遭遇測試組法，對每份遭遇跑 seed 1–10，印勝方與輪數；以 worktree 為根執行），跑開工基準（六份×seed 1–10）；REPORT 記玩家隊伍組成（幾台、哪些 frame、等級、駕駛）；`inbox_poll --once`。
2. 調六個檔的 `budgetByGrade` 與 `units`，反覆量到目標；`inbox_poll --once`。
3. 跑 `encounter.test.ts` 與 `npm run check`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-human/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-human/content/base/world/encounters/` 的六個檔 |
| 量測腳本 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-human/human-bench.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-human/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），另附「前後數字表」（每份遭遇：舊編成→新編成、舊勝場→新勝場、平均輪數），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `human-bench.ts` 最終輸出：每份遭遇玩家勝 3/10–8/10，六份合計 40%–75%；未達標的寫卡在哪份與原因。
2. `node --test --test-isolation=none src/ops/sortie/encounter.test.ts` 全過。
3. `npm run check` 0 錯，警告數不多於開工時。
4. REPORT 存在且有四段＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tune-human`。本線團隊：`teams/tune`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tune-human --up STATUS '一句自足結論' 正文檔`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
