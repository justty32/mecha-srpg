# 任務：讓營運 anchored（巢母坐鎮）戰場打得下來，凍結戰場勝率過半

> 領導 `lead-tune` 寫給 codex 工人 `cx-tune-anchor`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。前線：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/REPORT.md`（「剩餘工作」第 1、2 條）與其 `cx-tb-aim/REPORT.md`、`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ai-objective/REPORT.md`；本線前一位工人 `wf/workflows/dispatch/handoffs/lead-tune/cx-tune-intent/REPORT.md`。程式：`src/ai/score.ts`（`partAim`／`partAimProgress`）、`src/ai/policies/tactical.ts`、`src/ai/intent.ts`；內容：`content/base/monsters/nestmother-landlord.json`、`content/base/abilities/arc-pulse.json`、`content/base/abilities/burst-30.json`。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-anchor`（git worktree，HEAD `b95dcd4`，**工作樹已含領導尚未提交的前兩位工人改動**：`src/ai/` 四檔、`test/ai/` 三檔、`content/base/world/encounters/` 五檔——那是你的起點，不要還原；`node_modules` 是指向主 repo 的連結；下文相對路徑都以它為根）。

## 背景與唯一目標

巢母核心已從 370 降到 105、`burst-30` 有 `partAim`，但凍結的 26 場營運 anchored 戰場（同一批出戰前狀態，用目前程式重打）在起點只勝 **9/26**（平均 8.96 輪，玩家方多在第 8–9 輪撤）；lead-tune-battle 算過開局能傷巢母的只有**不能瞄部位**的範圍技 `arc-pulse`，實際選招加權期望命中 42 >40。**唯一目標：凍結 anchored 戰場玩家勝 ≥13/26，同時不破壞戰鬥 sweep 四數字。** 可用的槓桿（擇一或組合，自己量了再決定）：巢母核心各層 HP、弧光系能力可瞄部位（`partAim` 或新增單體變體欄位，只改既有檔）、AI 對錨／核心的瞄準與 killTarget 撤退判斷（新門檻放 `DEFAULTS`，可由 aiprofile `params` 覆寫）。

**第二輪（領導修訂，優先於上文與第一輪 REPORT）**：第一輪把巢母核心砍到 6/7/8＝21 HP，剛好 13/26，但核心被一發 21 點的 `arc-pulse` 就打穿、`nest-core-assault` 變成第 4–7 輪 5/5 速勝——A 級首領一發秒殺是退化解，**不採用**。這一輪的硬限制：**核心三層合計 ≥42**（全身總層 HP 維持 1580，挪到 trunk 可以）。領導看到的 AI 側缺口供你驗證（可推翻）：`src/ai/intent.ts` 的 `unreachable` 對 killTarget／capture 用 `hpOf` 加總目標**全部部位**的層 HP（巢母 1580），但規則 `src/rules/layers.ts` 的 `isDead` 是「所有 `core` 功能部位都 broken」即死——所以估「打完需要幾輪」高估十幾倍，第 8 輪就判不可達撤退。請改成「致死 HP」（各 core 部位打穿全部 structural 層所需 HP 的合計；看不到部位時退回原算法），必要時再調瞄核心的評分。目標數字不變（≥13/26、sweep 四數字），另加一條：`nest-core-assault` 平均輪數 ≥8。REPORT 覆寫為第二輪版本；工作樹現有的 21 HP 改動由你改回符合硬限制的值。

## 範圍（排除法寫死）

- 只做：`src/ai/` 底下的檔；`test/ai/*.test.ts`（可改可加）；`content/base/monsters/nestmother-landlord.json` 的數值欄；`content/base/abilities/arc-pulse.json`、`content/base/abilities/burst-30.json` 的數值與 `partAim` 相關欄；`content/base/aiprofiles/*.json` 的 `params` 數值。
- 不做：`src/ops/`（另一條線的領地，一個字都不准改）、`src/rules/`、`src/sim/`、`src/content/`、`schemas/`、spec、其他 content 檔、任何檔的文字欄（`name`、描述，另一條線在潤飾）、黃金檔（不准設 `GOLDEN_UPDATE`）。不要還原工作樹裡前兩位工人的改動。
- 件數 gate：在起點之外再改動＋新增超過 10 個檔就停下回報；容量 gate：你新增的 diff 超過 50 KB 就停下回報。任一觸發都停。
- 時間 gate：第二輪上線起 90 分鐘內回報；到時沒達標也停，回報最好的一版與數字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tune-anchor --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node wf/workflows/dispatch/handoffs/done/2026-10-24/lead-ai-objective/battle-bench.ts /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/frozen-base.json --phase anchored`（worktree 內跑，約數分鐘） | 主指標：凍結 anchored 26 場；每場一行（含 `nmHits`、`ownRetreated`、`remaining`），末行彙總 |
| `bash wf/workflows/dispatch/handoffs/lead-tune/tools/psweep.sh /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-anchor /tmp/cx-tune-anchor/sweep.jsonl` | 戰鬥 26 情境×5 seed sweep |
| `python3 wf/workflows/dispatch/handoffs/done/2026-10-24/lead-tune-battle/sweep-sum.py /tmp/cx-tune-anchor/sweep.jsonl` | sweep 彙總（另印 rift-edge-nest、nest-core-assault 逐場） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none test/ai/*.test.ts` | 每步驗證 |

起點數字（領導量）：凍結 anchored 9/26、nmHits 113；sweep 平手 7.7%（10/130）、平均 12.45 輪、勝方 player 55%／ally 22.5%／enemy 20.8%／third 1.7%、rift-edge-nest 玩家陣營 4/5。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑（在工作目錄 worktree 內）、REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-anchor/`；臨時檔只放 `/tmp/cx-tune-anchor/`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`、不 `git checkout -- 檔`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；你自己寫的臨時腳本出錯 → 自己修。

## 工作

1. 上線 PROGRESS；跑起點 bench 與 sweep 當正式基準；`inbox_poll --once`。
2. 從 bench 逐場看輸的原因（巢母剩多少、誰在第幾輪因什麼撤、對巢母命中多少），REPORT 寫成表；`inbox_poll --once`。
3. 調槓桿，反覆量到 ≥13/26 且 sweep 四數字仍達標；`inbox_poll --once`。
4. 若改了 `src/ai/`：新增 ≥2 條測試全過且能變紅；只改內容數值則免。
5. 跑 `node --test --test-isolation=none test/golden.test.ts test/ai/*.test.ts`、`npm run check`、`npm run typecheck`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-anchor/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、測試、內容 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-anchor/` 內「範圍」列的路徑 |
| 最終量測 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-anchor/bench-final.jsonl`、同目錄 `sweep-final.jsonl` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-anchor/REPORT.md` |

REPORT 四段（做了什麼／產出（你改動的檔清單）／沒做到或證據不足的／需要決定的事），另附「輸因表」、「參數／數值表」（舊值→新值、意義、覆寫鍵名）與「前後數字表」（bench 勝場、nmHits、平均輪數；sweep 平手率、平均輪數、勝方分布、rift-edge-nest、nest-core-assault），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 凍結 anchored bench 最終：玩家勝 ≥13/26，且巢母核心三層合計 ≥42、`nest-core-assault` 平均輪數 ≥8；未達標寫卡在哪幾場與原因。
2. 戰鬥最終 sweep：timeout 平手率 <10%、平均輪數 10–16、`rift-edge-nest` 玩家陣營勝 ≥3/5、勝方任一方 <70%。
3. `test/golden.test.ts` 結果：不變，或逐個列出變的黃金與原因（不重產）；`test/ai/` 全過（改了 `src/ai/` 時新增 ≥2 條且說明怎麼證能變紅）。
4. `npm run check` 0 錯且警告不多於起點；`npm run typecheck` 0 錯。
5. REPORT 存在且有四段＋輸因表＋參數／數值表＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tune-anchor`。本線團隊：`teams/tune`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tune-anchor --up STATUS '一句自足結論' 正文檔`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
