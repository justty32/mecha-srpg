# 任務：在 sim 寫逐步互動戰鬥 API（session），讓 UI 之後能從 ui-adapter 的自製 session 遷移過來

> 領導 `lead-integ-battle` 寫給 codex 工人 `cx-ib-step`。**交接書是唯一契約**；同目錄 [contract.md](contract.md) 屬本交接書的一部分。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/contract.md`、`src/sim/run.ts`（`runBattle` 的 AI 建立、startRound、observeEvents 時機）、`src/ui-adapter/vm/session.ts`（**唯讀**：UI 現在自己繞的那一份，看它需要什麼）、spec `wf/workflows/planning/specs/core/architecture.md`（模組邊界）——親自讀。

## 背景與唯一目標

`src/ui-adapter/vm/session.ts` 因 sim 缺逐步 API 而直接呼叫 rules／ai（SPEC-GAP）；頂層已決定 session 要搬進 sim、敵方回合改逐步播放。唯一目標：新檔 `src/sim/session.ts`＋測試，提供一次推進**一個指令**的互動 API；本線不改 ui-adapter，也不改 `runBattle`。

## 範圍（排除法寫死）

- 只做：
  - `src/sim/session.ts`：`createSession({ db, sim, seed, human?: FactionSlot[] /*由外部下指令的 slot，預設無*/ , maxSteps? })` 回傳物件（或 class），至少有：
    - `state`（唯讀用途）、`currentActor()`、`isHumanTurn()`、`outcome()`、`result()`（結束後回 `battleResult`）、`hash()`、`commands`（已成功指令）；
    - `legalActions(unit?)`：當前行動單位可做的事——可達格（含成本）、各能力的合法目標（經規則層 `checkAbility`）、可否 wait／retreat／eject／end；
    - `preview(cmd)`：不改狀態，回規則層預覽的結果與事件；
    - `submit(cmd)`：人類 slot 的單一指令，回 `{ ok, events | rejection }`；不是人類回合時拒絕；
    - `stepAi()`：**只推進 AI 的一個指令**並回 `{ actor, cmd, events } | null`（人類回合或已結束回 null）。做法提示：輪到 AI 單位時，在 `state` 的 `structuredClone` 上跑一次 `runUnitTurn` 收集這個單位回合的指令佇列，再逐一套到真狀態；AI 自己的 RNG 與知識必須和 `runBattle` 完全同步（佇列計算後要把 AI 內部狀態設成「在真狀態上跑完」的樣子，或改用其他能保證等價的做法）；
    - `runAiUntilHuman()`：連續 `stepAi()` 直到人類回合、結束或步數上限；
    - `observe(fn)`：每個成功指令後回呼（給 UI 動畫用）。
  - `src/sim/index.ts`：匯出 session API 與型別。
  - 測試 `test/sim/session.test.ts`：新增恰好 **6** 個 `test()`——①全 AI 的 session 以 `stepAi` 跑到底，`hash()` 與同 seed `runBattle` 的 hash 相同（skirmish seed 1，`--rounds 3` 縮短）；②`stepAi` 每次恰好推進一個成功指令；③人類 slot：`submit` 非人類回合被拒、人類回合合法指令成功；④`legalActions` 列出的每個能力目標送 `submit` 都不會因合法性被拒（抽樣）；⑤`preview` 不改 `state`（前後 canonical JSON 相同）；⑥結束後 `submit`／`stepAi` 都拒絕且 `result()` 非 null。
- 不做：`src/sim/run.ts`、`src/rules/`、`src/ai/`、`src/core/`（缺查詢就在 session.ts 內以既有匯出組合，真的缺才寫進 REPORT「需要決定的事」）；`src/ui-adapter/`（唯讀）、`src/ops/`、`content/`、`package.json`、`wf/`（REPORT 除外）。
- 件數 gate：新增或改動檔超過 5 個就停下回報；容量 gate：diff 超過 40 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node --test --test-reporter=tap test/sim/session.test.ts` | 每次改完 |
| `npm run typecheck` | 收尾前 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ib-step --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

注意：效能線還沒合，skirmish 一輪要約 1 秒；測試一律用 `scenarioToSetup(db, id, seed, { rounds: 3 })` 之類縮短。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；工作目錄是你的 worktree（`-C`）。**不要 commit**，在 REPORT 列檔案清單。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ib-step/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- **分清錯誤來源**：沙箱拒寫、node 跑不了 → `BLOCKED`；沙箱內測試計數不準不算阻塞。

## 工作

1. 讀 run.ts 與 ui-adapter session，定 API 形狀（寫進 REPORT）。`inbox_poll --once`。
2. 實作 `session.ts`＋`index.ts` 匯出；寫 6 個測試。`inbox_poll --once`。
3. `npm test`、`npm run typecheck` 全綠。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-step/REPORT.md`（主 repo 的路徑），不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | 你的 worktree 內 `src/sim/session.ts`、`src/sim/index.ts`、`test/sim/session.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-step/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「API 簽名表」與「ui-adapter 遷移對照」（現在 `vm/session.ts` 的每個方法對應到新 API 的哪個），末尾加「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. `node --test test/sim/session.test.ts` 恰好 6 個 test、0 fail。
2. worktree 內 `npm test` 0 fail、`npm run typecheck` exit 0。
3. `git diff --stat` 只有範圍內 3 個檔。
4. REPORT 存在且有四段＋兩個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（例如 hash 對不上且修不好）→ 發 `FAILED`，REPORT 附差異所在的第一個事件。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ib-step`。本線團隊：`teams/integ-battle`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ib-step --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。
