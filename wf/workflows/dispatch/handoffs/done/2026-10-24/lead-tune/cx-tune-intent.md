# 任務：查出並修掉營運出戰「玩家方第 1 輪就撤退」，同時不破壞戰鬥 sweep 的四個數字

> 領導 `lead-tune` 寫給 codex 工人 `cx-tune-intent`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。使用者裁示：`wf/workflows/planning/design-notes/mechanics.md` 末三段（意圖受挫撤退、勝利不必全殲、個體意圖與指揮者）。前一條線：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/REPORT.md` 與其 `cx-tb-intent/REPORT.md`；`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/REPORT.md` 剩餘工作第 1 條。程式：`src/ai/intent.ts`（`DEFAULTS`、`planIntent`、`individualRetreat`）、`src/ai/agent.ts`（`withdraw` 判斷）、`src/ai/retreat.ts`、`src/ai/policies/`（flee 等）、`src/ops/sortie/outcome.ts`（只讀：戰果分類）、`src/ops/sortie/scenario.ts`（只讀：出戰情境怎麼組）。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-intent`（乾淨 git worktree，HEAD `b95dcd4`；`node_modules` 是指向主 repo 的連結；量測工具已複製在 worktree 內 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/`；下文相對路徑都以它為根）。

## 背景與唯一目標

領導在 HEAD 量的基準（greedy 營運 seed 1–5 × 12 潮月，`ops-tally.ts`）：出戰 89 場，勝 29、擊退 6、**撤退 54，其中 48 場第 1 輪就有玩家單位 Retreated**，平均 4.0 輪；anchored 4 場全數第 1 輪撤；分布在 clear／defend-citywall／scout-rift-margin／escort-sealed-convoy 等模板（逐場明細 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/baseline/ops-seed*.jsonl`）。`intentMinRound` 是 8，所以陣營意圖撤退不該在第 1 輪觸發——兇手更可能是**個體撤退**（`individualRetreat`：駕駛 HP<`pilotFleeHp`、士氣 breaking／fleeing；營運帶傷進場的機體可能一開場就低於門檻）、flee 策略本身、或出戰情境把玩家放在出口格旁。一例（seed 1 第一個符合者，`r1-probe.ts 1 1`）：escort 契約裡護送步兵與 `mech-8` 第 1 輪各走 7 格到邊緣撤離，`mech-9` 落單戰死。**以上是假說，你要自己驗證，可推翻。**

**唯一目標：讓第 1 輪撤退只在合理情況發生（護送對象抵達出口本來就該離場不算），並在不破壞戰鬥 sweep 四數字的前提下，回報營運出戰數、勝場、anchored 的前後變化。** 新門檻全部放 `DEFAULTS`，可由 aiprofile `params`（只接受數字）覆寫。

## 範圍（排除法寫死）

- 只做：`src/ai/` 底下的檔（以 `intent.ts`、`agent.ts`、`retreat.ts`、`policies/` 為主）；`test/ai/*.test.ts`（可改可加）；`content/base/aiprofiles/*.json` 的 `params` 數值。
- 不做：`src/ops/`（另一條線 lead-grid 的領地，**一個字都不准改**）、`src/rules/`、`src/sim/`、`src/mcp/`、`src/content/`、`schemas/`、spec、`content/` 除 aiprofiles 以外全部（不改情境、不改怪物數值）、黃金檔（不准設 `GOLDEN_UPDATE`）。
- **若查出根因在 `src/ops/`**（例：出戰情境把玩家放在出口、戰果分類把護送成功算成撤退）：不修，REPORT 寫證據（重現指令、哪一行）與建議改法，發 `DONE` 並在標題講明「根因在 ops」。
- 件數 gate：改動＋新增檔超過 12 個就停下回報；容量 gate：diff 超過 60 KB 就停下回報。任一觸發都停。
- 時間 gate：上線起 90 分鐘內回報；到時沒達標也停，回報最好的一版與數字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tune-intent --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/ops-tally.ts --detail 1`（seed 換 1–5）（worktree 內；5 個 seed 各開一個行程並行，每個數分鐘） | 營運量測：每場戰果分類、`firstRetreat`、模板；彙總用下一列 |
| `python3 wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/ops-sum.py 檔…` | 營運彙總（`withdrewR1`、各模板分布） |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/r1-probe.ts 1 2`（參數＝seed、第幾個符合者） | 印第 n 個「第 1 輪撤退」出戰的第 1–2 輪事件 |
| `bash wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/psweep.sh /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-intent /tmp/cx-tune-intent/sweep.jsonl` | 戰鬥 24 情境×5 seed sweep（8 並行） |
| `python3 wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/sweep-sum.py /tmp/cx-tune-intent/sweep.jsonl` | sweep 彙總 |
| `npm run typecheck`、`node --test --test-isolation=none test/ai/*.test.ts` | 每步驗證 |

戰鬥 sweep 基準（領導在 HEAD 量）：平手 7.7%、平均 12.45 輪、勝方 player 55%／ally 22%／enemy 21%／third 2%。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑（在工作目錄 worktree 內）、REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-intent/`；臨時檔只放 `/tmp/cx-tune-intent/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；你自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 上線 PROGRESS；在 worktree 重跑一次 ops-tally（5 seed）與 sweep 當你的正式基準；`inbox_poll --once`。
2. 用 `r1-probe.ts` 看至少 4 個不同模板的第 1 輪撤退場，確認每場是誰、因哪個條件（個體 HP／士氣／陣營意圖／策略／情境）撤；REPORT 寫成表；`inbox_poll --once`。
3. 在範圍內修（例：開場不因帶傷立刻個體撤退、需要先受過火或戰況惡化；flee 不帶著整隊離場）；反覆量到 `withdrewR1` 明顯下降且 sweep 四數字仍達標；`inbox_poll --once`。
4. 測試：至少新增 3 條（例：帶傷但未交火的駕駛第 1 輪不撤、受重創時仍會撤、aiprofile params 覆寫新門檻生效），全過且能變紅。
5. 跑 `node --test --test-isolation=none test/golden.test.ts` 與 `test/ai/`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-intent/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-intent/src/ai/`、`.../wt-intent/test/ai/` |
| 最終量測 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-intent/ops-final-seed{1..5}.jsonl`、同目錄 `sweep-final.jsonl` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-intent/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），另附「根因表」（模板、場次、誰撤、觸發條件）、「參數表」（舊值→新值、意義、aiprofile 覆寫鍵名）與「前後數字表」（營運：出戰數、勝、擊退、撤退、`withdrewR1`、平均輪數、anchored；戰鬥 sweep：平手率、平均輪數、勝方分布、rift-edge-nest），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 營運最終量測（seed 1–5×12 潮月）：`withdrewR1` 佔出戰數 ≤10%（基準 48/89）；或寫明剩下的都是哪類、為何合理或根因在 ops。
2. 戰鬥最終 sweep（24 情境×5 seed）：timeout 平手率 <10%、平均輪數 10–16、`rift-edge-nest` 玩家方勝 ≥3/5、勝方任一方 <70%。
3. 新增 ≥3 條測試全過，REPORT 一句說怎麼證它們能變紅。
4. `test/golden.test.ts` 結果：不變，或逐個列出變的黃金與原因（不重產）；`npm run typecheck` 0 錯。
5. REPORT 存在且有四段＋根因表＋參數表＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tune-intent`。本線團隊：`teams/tune`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tune-intent --up STATUS '一句自足結論' 正文檔`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
