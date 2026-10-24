# 任務：讓 AI 用 partAim 瞄準可致死的核心部位，使營運 anchored 期的潮錨巢母打得贏

> 領導 `lead-tune-battle` 寫給 codex 工人 `cx-tb-aim`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`（數值帶規矩；`numeric-bands.json` 用 python 查，不整份貼進 context）——**親自讀，不靠本交接書的摘要**。規格：`wf/workflows/planning/specs/core/rules-attack-resolution.md`（指定部位：`cmd.target.part`＋`ability.partAim.allowed`，命中減 `partAim.penalty`）、`wf/workflows/planning/specs/core/ai.md` 第 2 步（候選含 part 選項）。前一條線：`wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md`（期望命中算法）、`wf/workflows/dispatch/handoffs/lead-ai-objective/REPORT.md`。程式：`src/ai/policies/tactical.ts`（候選生成：目前只有 `def.ai.targetPref.parts` 命中部位功能才產生 part 候選）、`src/ai/score.ts`（`damageValue` 用全機剩餘 HP 算比例；只有 `disable` 戰術對偏好部位 ×1.5）、`src/rules/attack.ts`、`src/rules/command.ts`（`bad-part`）。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/wt-aim`（乾淨 git worktree，HEAD `0baa1c4`；下文相對路徑都以它為根）。

## 背景與唯一目標

營運 anchored 期要打潮錨巢母 `monster/nestmother-landlord`（8 部位、等 exposure；致死部位 `core-belly`，HEAD 已用 `partsOverride` 把它降到 30／35／40＝105）。開局機 `frame/moji-tern-guard`×2（`component/autocannon-30` → `ability/burst-30` 單體 24 動能、矢 12 發每次 3；`component/arc-emitter` → `ability/arc-pulse` 球形 21 熱能，不能瞄部位）＋`frame/hound-mk2`（autocannon-30），見 `content/base/world/campaign-start/default.json`（唯讀）。內容裡目前只有三個能力有 `partAim`（`mx-starscar-shot`、`mx-hunter-launch`、`ax-riastrad-gae-bolg`），開局機一個都沒有。

**唯一目標：AI 在值得時瞄準致死部位（core／唯一 structural 致死部位），開局機有可瞄部位的武器，並達到頂層判準：開局兩台 20 輪內打完錨的期望命中數 ≤ 40（算法照 cx-gb-ai REPORT，另算「AI 實際瞄核心比例」版本），且 `sim:campaign` greedy seed 1–5 的 anchored 期至少有勝場。**

注意：另一位工人 `cx-tb-intent` 同時在另一個 worktree 改 `src/ai/intent.ts`、`src/ai/retreat.ts`（AI 放棄太早）——目前玩家方 AI 常在第 4–5 輪就撤，anchored 勝場會被它壓住；你**不碰那兩個檔**，anchored 勝場未達標時寫清楚是撤退造成還是火力造成（例如用 `--no-retreat` 類的私人量測腳本對照，腳本放 `/tmp/cx-tb-aim/`）。

## 範圍（排除法寫死）

- 只做：
  1. **AI 瞄部位**：`src/ai/policies/tactical.ts` 的候選生成——能力 `partAim.allowed` 時，對敵方單位產生「致死部位」候選（部位功能含 `core`，或你定義的致死判準，寫進 REPORT），不必依賴 `targetPref.parts`；`src/ai/score.ts` 的估值——瞄致死部位時用該部位剩餘層 HP 估擊殺進度、命中率含 penalty，讓 AI 只在期望值較高時才瞄（例如核心快破、或對大血量目標）。新權重放 score 的預設參數並可由 aiprofile `params` 覆寫。
  2. **內容**：給開局機能用的單體武器加 `partAim`（至少 `content/base/abilities/burst-30.json`；其他既有單體槍砲是否也加由你判斷並列表），penalty 數值照 numeric-bands 與既有三個能力的區間（10–15）；必要時加 `ai.targetPref.parts`。只動這些能力檔的 `partAim`／`ai` 欄位，不改傷害、成本。
  3. 測試 `test/ai/part-aim.test.ts`（新）：至少 3 條（有 partAim 時會產生核心候選、核心快破時選瞄核心、無 partAim 能力不產生 part 候選）。
- 不做：`src/ai/intent.ts`、`src/ai/retreat.ts`、`src/rules/`、`src/sim/`、`src/ops/`、`src/mcp/`、`src/content/`、`schemas/`、spec、`content/base/world/`、`content/base/monsters/`（巢母 HP 由領導定，你只在 REPORT 建議）、能力以外的內容；黃金檔（不准設 `GOLDEN_UPDATE`）。
- 件數 gate：改動＋新增檔超過 15 個就停下回報；容量 gate：diff 超過 60 KB 就停下回報。任一觸發都停。
- 時間 gate：上線起 75 分鐘內回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tb-aim --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/frozen-base.json --phase anchored` | 營運 anchored 凍結 26 場：勝場、對巢母命中 `nmHits`（開工／完成） |
| `node wf/workflows/dispatch/handoffs/lead-tune-battle/anchored-tally.ts` | greedy 營運 seed 1–5 各 12 潮月，每潮相出戰數／勝場／錨被殺／對巢母命中（約 1 分鐘） |
| `npm run content:probe -- ability/burst-30 --n 20` | 加 partAim 後看能力是否被 AI 使用、有無超帶 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | Wait 比例回歸（須全 `pass:true`） |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 效能：ms／步 ≤ 開工 1.5 倍（候選變多要注意） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none test/ai/*.test.ts` | 每步驗證 |

開工基準（領導已量）：bench anchored 26 場 7 勝、nmHits 48；anchored-tally anchored 26 場 7 勝、錨被殺 0。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑（在工作目錄 worktree 內）、REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-aim/`；臨時檔只放 `/tmp/cx-tb-aim/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）。

## 工作

1. 上線 PROGRESS；開工 bench／tally；`inbox_poll --once`。
2. 候選生成＋估值＋測試；`inbox_poll --once`。
3. 能力內容加 partAim；check／probe；`inbox_poll --once`。
4. 量 bench／tally，算兩版期望命中；跑 `test/ai/`、`test/sim/`、`test/golden.test.ts`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-aim/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、內容、測試 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/wt-aim/` 下的 `src/ai/`、`content/base/abilities/`、`test/ai/part-aim.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-aim/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），另附「期望命中」段（兩版算法與數字）、「前後數字表」（bench 勝場與 nmHits、tally anchored 勝場與錨被殺、bench-ops ms／步），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `test/ai/part-aim.test.ts` ≥3 條全過，REPORT 一句說怎麼證它們能變紅。
2. 期望命中（開局兩台、20 輪）兩版數字，判斷是否 ≤ 40；bench anchored 與 anchored-tally 開工／完成數字；anchored 勝場為 0 時寫清楚是撤退還是火力造成。
3. `npm run check` 0 錯且沒有新增 `band-*` 警告；`npm run typecheck` 0 錯。
4. skirmish seed 1–5 全 `pass:true`；bench-ops ms／步 ≤ 開工 1.5 倍；`test/golden.test.ts` 不變或逐個列出變的黃金與原因（不重產）。
5. REPORT 存在且有四段＋期望命中段＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tb-aim`。本線團隊：`teams/tune-battle`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tb-aim --up STATUS '一句自足結論' 正文檔`（STATUS 為 PROGRESS／DONE／BLOCKED／NEEDS-USER／FAILED）（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
