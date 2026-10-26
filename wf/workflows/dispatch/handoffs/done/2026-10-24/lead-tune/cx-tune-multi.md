# 任務：查出並修掉多方混戰情境的 timeout 平手

> 領導 `lead-tune` 寫給 codex 工人 `cx-tune-multi`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。使用者裁示：`wf/workflows/planning/design-notes/mechanics.md` 末三段（意圖受挫撤退、勝利不必全殲、個體意圖與指揮者）。前線：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/REPORT.md`（剩餘工作第 4 條）、本線前兩位 AI 工人 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-intent/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-anchor/REPORT.md`。程式：`src/ai/`（`hostility.ts`、`strategy.ts`、`intent.ts`、`score.ts`、`policies/`）。情境：`content/base/scenarios/crater-three-way.json`、`content/base/scenarios/delta-four-way.json`。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-multi`（乾淨 git worktree，HEAD `45f33ab`；`node_modules` 是指向主 repo 的連結；量測工具已複製到 worktree 內 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/`；下文相對路徑都以它為根）。

## 背景與唯一目標

戰鬥 sweep（26 情境×5 seed）的 10 場 timeout 裡 7 場集中在兩個多方混戰：`crater-three-way`（player 2／enemy 2／third 3，平手 3/5、平均 22.6 輪）與 `delta-four-way`（player 2＋ally 4／enemy 6／third 3，平手 4/5、平均 26.4 輪），兩者皆 30 輪上限、各方 eliminate 互為勝利條件。成因未知（可能：互相敵對的多方只打最近的、意圖撤退後躲在角落、第三方只守不攻、殲滅目標要求殺光所有敵方而有人撤退後算不算……），**你要先查清再修**。**唯一目標：兩情境 seed 1–10 的 timeout 各 ≤2/10，同時全 sweep 四數字仍達標、其他情境不出現新的 timeout 集中。**

注意：另一位工人 `cx-tune-scen` 同時在別的 worktree 改六個護送／突圍情境檔（不含這兩個）；你不碰那六個檔。

## 範圍（排除法寫死）

- 只做：`src/ai/` 底下的檔；`test/ai/*.test.ts`（可改可加）；`content/base/aiprofiles/*.json` 的 `params` 數值；上述兩個情境檔的**非文字欄**（座標、編成引用既有 id；**不准改 `rounds` 上限**）。
- 不做：`src/rules/`、`src/sim/`、`src/ops/`、`src/content/`、`schemas/`、spec、其他 content 檔、任何文字欄、黃金檔（不准設 `GOLDEN_UPDATE`）。
- **若查出根因在 `src/rules/`**（例：殲滅判定把撤離者算成仍存活）：不修，REPORT 寫證據（重現指令、哪一行）與建議改法，發 `DONE` 並在標題講明「根因在 rules」。
- 件數 gate：改動＋新增檔超過 10 個就停下回報；容量 gate：diff 超過 50 KB 就停下回報。任一觸發都停。
- 時間 gate：上線起 90 分鐘內回報；到時沒達標也停，回報最好的一版與數字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tune-multi --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-playtest/sweep.ts --seeds 1,2,3,4,5,6,7,8,9,10 scenario/crater-three-way scenario/delta-four-way`（worktree 內跑） | 主指標：兩情境 seed 1–10 |
| `bash wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/tools/psweep.sh /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-multi /tmp/cx-tune-multi/sweep.jsonl` | 全 26 情境×5 seed sweep（開工與最終各一次） |
| `python3 wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/sweep-sum.py /tmp/cx-tune-multi/sweep.jsonl` | sweep 彙總 |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ai-objective/battle-bench.ts /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/frozen-base.json --phase anchored` | 回歸：凍結 anchored 26 場（開工與最終各一次，不得低於 13/26） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none test/ai/*.test.ts` | 每步驗證 |

起點（領導量，HEAD 前一版）：全 sweep 平手 7.7%、平均 12.19 輪、勝方 player 57.5%／ally 20%／enemy 20.8%／third 1.7%、rift-edge-nest 玩家陣營 4/5；凍結 anchored 14/26。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑（在工作目錄 worktree 內）、REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-multi/`；臨時檔只放 `/tmp/cx-tune-multi/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；你自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 上線 PROGRESS；跑兩情境 seed 1–10、全 sweep、anchored bench 當基準；`inbox_poll --once`。
2. 挑至少 4 場 timeout，追最後 10 輪各方在做什麼（誰還活著、在哪、有沒有交火、誰撤了），REPORT 寫成「根因表」；`inbox_poll --once`。
3. 在範圍內修，反覆量到目標；`inbox_poll --once`。
4. 若改了 `src/ai/`：新增 ≥2 條測試全過且能變紅。
5. 跑 `node --test --test-isolation=none test/golden.test.ts test/ai/*.test.ts`、`npm run check`、`npm run typecheck`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-multi/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、測試、內容 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-multi/` 內「範圍」列的路徑 |
| 最終量測 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-multi/two-final.jsonl`、同目錄 `sweep-final.jsonl`、`bench-final.jsonl` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune/cx-tune-multi/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），另附「根因表」、「參數表」（舊值→新值、意義、覆寫鍵名）與「前後數字表」（兩情境 timeout 與勝方；全 sweep 四數字；anchored bench），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 兩情境 seed 1–10 最終：timeout 各 ≤2/10；未達標寫卡在哪幾場與原因（或根因在 rules）。
2. 全 sweep 最終：timeout 平手率 <10%、平均輪數 10–16、`rift-edge-nest` 玩家陣營勝 ≥3/5、勝方任一方 <70%；其他情境 timeout 不比起點多。
3. 凍結 anchored bench 最終 ≥13/26。
4. `test/golden.test.ts` 不變或逐個列出變的黃金與原因（不重產）；`test/ai/` 全過（改了 `src/ai/` 時新增 ≥2 條並說明怎麼證能變紅）；`npm run check` 0 錯、警告不多於起點；`npm run typecheck` 0 錯。
5. REPORT 存在且有四段＋根因表＋參數表＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tune-multi`。本線團隊：`teams/tune`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tune-multi --up STATUS '一句自足結論' 正文檔`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
