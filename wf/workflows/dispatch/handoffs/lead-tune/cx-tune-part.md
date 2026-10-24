# 任務：讓 `src/rules/effects.ts` 不再把 `part: undefined` 之類的空鍵寫進效果實例，並加回歸測試

> 領導 `lead-tune` 寫給 codex 工人 `cx-tune-part`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。來源：`wf/workflows/dispatch/handoffs/done/2026-10-24/lead-gaps-ops/REPORT.md` 剩餘工作第 4 條。

工作目錄（唯一可寫的程式碼樹）：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-part`（乾淨 git worktree，HEAD `668d2a1`；`node_modules` 是指向主 repo 的連結；下文相對路徑都以它為根）。

## 背景與唯一目標

`applyEffect` 建效果實例時，`location` 以物件字面值組出 `{ unit, part: target.part }` 等，呼叫端沒給 `part`／`layer`／`cell` 時實例 `owner` 會帶著值為 `undefined` 的鍵。營運存檔前靠 JSON 正規化繞過，回放與存讀檔有潛在不一致（`structuredClone` 與 JSON 往返結果不同）。**唯一目標：效果實例（與 `EffectApplied` 事件 payload）不含值為 `undefined` 的鍵，行為與既有 hash 不變。**

## 範圍（排除法寫死）

- 只做：`src/rules/effects.ts`（`location` 的組法：未定義的欄位省略，不改語意）、`src/rules/effects.test.ts`（加測試）。
- 不做：`src/ops/` 裡既有的 JSON 正規化繞法（別線領地，**不准碰**）、`src/rules/` 其他檔、`src/ai/`、`content/`、黃金檔（不准設 `GOLDEN_UPDATE`）、spec。
- 件數 gate：改動檔超過 3 個就停下回報；容量 gate：diff 超過 10 KB 就停下回報。任一觸發都停。
- 時間 gate：上線起 30 分鐘內回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-tune-part --once`（在主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 跑） | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh`（主 repo） | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `node --test --test-isolation=none src/rules/effects.test.ts` | 每步驗證 |
| `node --test --test-isolation=none test/golden.test.ts`、`npm run typecheck` | 收尾驗證 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的兩個檔（在工作目錄 worktree 內）與 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-part/`；臨時檔只放 `/tmp/cx-tune-part/`。**不要 commit**（領導做）；REPORT 列出改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；不碰主 repo `/home/lorkhan/repo/game_dev/mecha-srpg` 的程式碼與內容（只用它跑 inbox 腳本、寫 REPORT）；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）。

## 工作

1. 上線 PROGRESS；`inbox_poll --once`。
2. 改 `location` 組法：只放有定義的欄位（`cell` 照舊複製）；`EffectApplied` 的 `part: … ?? null` 維持原樣。`inbox_poll --once`。
3. 加測試 ≥2 條：part 作用域不給 part 時實例 `owner` 無 `part` 鍵（`Object.hasOwn` 為 false）；layer 作用域不給 layer 時同理；並證明測試能變紅（先在舊碼上跑一次看到失敗）。
4. 跑收尾驗證；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-part/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-part/src/rules/effects.ts`、同目錄 `effects.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-part/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. `node --test --test-isolation=none src/rules/effects.test.ts` 全過，新增 ≥2 條，REPORT 一句說怎麼證它們能變紅。
2. `test/golden.test.ts` 全過（黃金不變）。
3. `npm run typecheck` 0 錯。
4. REPORT 存在且有四段。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tune-part`。本線團隊：`teams/tune`。上線先發 `PROGRESS`。
- 終局：在主 repo 跑 `wf/tools/inbox_mail.sh cx-tune-part --up STATUS '一句自足結論' 正文檔`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
