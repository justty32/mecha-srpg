# 任務：調 AI 陣營意圖的放棄門檻與可達性評估，讓撤退只在「明顯打不過」時發生

> 領導 `lead-tune-battle` 寫給 codex 工人 `cx-tb-intent`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。使用者裁示：`wf/workflows/planning/design-notes/mechanics.md` 末三段（意圖受挫撤退、勝利不必全殲、個體意圖與指揮者）。前一條線：`wf/workflows/dispatch/handoffs/lead-gaps-battle/REPORT.md`、`wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-intent/REPORT.md`。程式：`src/ai/intent.ts`（`DEFAULTS`、`inferIntent`、`planIntent`）、`src/ai/retreat.ts`、`src/ai/score.ts`（`forceRatio`）、`src/ai/strategy.ts`、`content/base/aiprofiles/`。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/wt-intent`（乾淨 git worktree，HEAD `0baa1c4`；下文相對路徑都以它為根）。

## 背景與唯一目標

上一輪加了意圖撤退，平手率從 41.7% 降到 2.5%，但 AI 放棄太早：24 情境×5 seed 平均 7.95 輪收場，`rift-edge-nest` 從玩家方 5 勝變 5 敗（玩家方 AI 第 4 輪就撤）。領導看過的成因假說（你要自己驗證，可推翻）：
- `inferIntent` 只取該 slot 第一個 objective；`rift-edge-nest` 玩家方有 killTarget＋survive(30)，取到 killTarget＝進攻型，`needed = 敵方全體總層 HP ÷ 上一輪傷害` 遠超剩餘輪數 → `impossible` → 第 4 輪（`intentMinRound`）撤。應評估該 slot 全部 objective，**全部都達不到才算達不到**；survive／hold 這類守勢目標本身就不該因「打不完」而撤。
- `needed` 用單輪傷害估，雜訊大；killTarget 該用目標本身的剩餘 HP，不是敵方全體。
- `impossible` 單獨就能觸發撤退；可考慮要求同時戰力比不佔優，或提高門檻（`intentGiveUpRatio 0.55`、`intentGiveUpLoss 0.6`、`intentMinRound 4`、`intentStallRounds 5`）。

**唯一目標：撤退只在明顯打不過時發生，並同時滿足下面四個數字**（24 情境×5 seed，sweep 量）：timeout 平手率 < 10%；平均輪數 10–16；`rift-edge-nest` 玩家方勝 ≥ 3/5；勝方分布任一方 < 70%（分母＝非平手場次）。新門檻與新權重全部放 `DEFAULTS` 並可由 aiprofile `params`（只接受數字）覆寫。

注意：另一位工人 `cx-tb-aim` 同時在另一個 worktree 改 `src/ai/score.ts`、`src/ai/policies/tactical.ts`（AI 瞄核心部位）；你**不碰那兩個檔**。巢母（`monster/nestmother-landlord`）核心 HP 已在 HEAD 降到 105。

## 範圍（排除法寫死）

- 只做：`src/ai/intent.ts`、`src/ai/retreat.ts`（門檻與評估公式；必要時 `src/ai/strategy.ts` 只做傳參的最小改動）；`content/base/aiprofiles/*.json` 的 `params` 數值；測試 `test/ai/intent.test.ts`（既有，可改可加；或新檔 `test/ai/intent-tune.test.ts`）。
- 不做：`src/ai/score.ts`、`src/ai/policies/`、`src/rules/`、`src/sim/`、`src/ops/`、`src/mcp/`、`src/content/`、`schemas/`、spec、`content/` 除 aiprofiles 以外全部（**不改情境**）、黃金檔（不准設 `GOLDEN_UPDATE`）。
- 件數 gate：改動＋新增檔超過 12 個就停下回報；容量 gate：diff 超過 60 KB 就停下回報。任一觸發都停。
- 時間 gate：上線起 75 分鐘內回報；到時沒達標也停，回報最好的一組參數與數字。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tb-intent --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/psweep.sh 工作目錄 輸出檔.jsonl` | 24 情境×5 seed 平行 sweep（8 並行，約 1 分鐘）；可改成只跑幾個情境的私人副本放你的臨時目錄 |
| `python3 /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/sum.py 輸出檔.jsonl [all]` | 印平手率、平均輪數、勝方分布、每情境結果 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/frozen-base.json --phase anchored` | 營運 anchored 凍結戰場（開工／完成各一次，只報數字） |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | Wait 比例回歸（須全 `pass:true`） |
| `npm run typecheck`、`node --test --test-isolation=none test/ai/*.test.ts` | 每步驗證 |

開工基準（領導已在 HEAD 前一版量過，供對照）：平手 2.5%、平均 7.95 輪、勝方 player 46／enemy 55／ally 8／third 8、rift-edge-nest enemy 5（全在第 9 輪 eliminate）。你開工自己重跑一次當正式基準。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑（在工作目錄 worktree 內）、REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-intent/`；臨時檔只放 `/tmp/cx-tb-intent/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）。

## 工作

1. 上線 PROGRESS；開工 sweep＋bench；`inbox_poll --once`。
2. 追 `rift-edge-nest` 與幾個 5–7 輪就收場的情境，確認誰在第幾輪因哪個條件（ratio／loss／impossible）撤；`inbox_poll --once`。
3. 改評估公式與 DEFAULTS，反覆 sweep 到四個數字達標（或時間 gate 到）；`inbox_poll --once`。
4. 測試：至少新增 3 條（多目標時守勢目標不因打不完而撤、killTarget 用目標 HP 估、aiprofile params 覆寫新門檻生效），全過且能變紅。
5. 跑 `node --test --test-isolation=none test/golden.test.ts` 與 `test/ai/`、`test/sim/`；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-intent/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-tune-battle/wt-intent/src/ai/`、`.../wt-intent/test/ai/` |
| 最終 sweep | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-intent/sweep-final.jsonl` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune-battle/cx-tb-intent/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），另附「參數表」（每個門檻：舊值→新值、意義、aiprofile 覆寫鍵名）與「前後數字表」（平手率、平均輪數、勝方分布、rift-edge-nest、anchored bench 勝場與 nmHits），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 最終 sweep（全 24 情境×5 seed）：timeout 平手率 < 10%、平均輪數 10–16、`rift-edge-nest` 玩家方勝 ≥ 3/5、勝方任一方 < 70%；未達標的項目寫卡在哪幾個情境與原因。
2. 新增 ≥3 條測試全過，REPORT 一句說怎麼證它們能變紅。
3. `test/golden.test.ts` 結果：不變，或逐個列出變的黃金與原因（不重產）。
4. skirmish seed 1–5 全 `pass:true`；`npm run typecheck` 0 錯。
5. REPORT 存在且有四段＋參數表＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tb-intent`。本線團隊：`teams/tune-battle`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tb-intent --up STATUS '一句自足結論' 正文檔`（STATUS 為 PROGRESS／DONE／BLOCKED／NEEDS-USER／FAILED）（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
