# 任務：改寫 ui-adapter 的 vm 層以落實試玩回饋（演出佇列、行動流程、結束回合確認、敵方部件、選部位、層中文名、新快捷鍵）並補 14 個 node 測試

> 領導 `lead-ui-fix` 寫給 codex 工人 `cx-uifix-vm`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md` 的 §1、§2（照抄行為）。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/feedback.md`（使用者原話）、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/contract.md`（§1 §2 是你的規格）、`src/ui-adapter/vm/types.ts`（已凍結，標 `[lead-ui-fix]` 的是新欄位）、`src/ui-adapter/vm/` 全部現有檔——親自讀。

## 背景與唯一目標

網頁戰鬥畫面已可玩，但使用者試玩後列了九項手感問題。DOM 層由另一條線 `cx-uifix-dom` 同時改，它只看 types.ts。唯一目標：讓 `BattleController`／`BattleViewModel`／`BattleSession`／keymap 產出符合新 types.ts 與 contract §1–§2 的 `UiSnapshot`，`tsc --noEmit`（root tsconfig）零錯誤。

## 範圍（排除法寫死）

- 只做：改 `src/ui-adapter/vm/` 底下現有檔（`session.ts`、`controller.ts`、`viewmodel.ts`、`keymap.json`、`keymap.ts`、`labels.ts`、`text.ts`、`index.ts`、既有 `*.test.ts`）；可新建最多 3 個模組（例 `fx.ts`、`flow.ts`）與最多 2 個測試檔；外加你的 REPORT。
- 不做：`src/ui-adapter/vm/types.ts`（凍結；不夠用寫 REPORT 的 SPEC-GAP）、`src/ui-adapter/dom/`（別線）、`src/ui-adapter/content-browser.ts`、`e2e/`、`index.html`、各 config／tsconfig、`package.json`、`src/rules/`、`src/ai/`、`src/sim/`、`src/core/`、`src/content/`、`src/ops/`、`content/`、`test/`、`wf/`（除了你的 REPORT 與 inbox 回報）。**不改規則語意**：需要的資料規則層沒有就從 state／事件流／knowledge 推導。
- 件數 gate：新檔超過 5 個就停下回報；容量 gate：`src/ui-adapter/vm/` 非測試檔合計超過 90 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

既有 vm 測試若因語意改變（`wait`→`standby`／`defer`、`commands` 恆有固定按鈕、session 新選項）而失敗，**改寫到符合新契約**，條數不變。另**新增恰好 14 個 `test()`**：
1. `stepAi` 逐步跑與 `advanceAi` 一口氣跑：同 seed 同玩家指令，`commands` 逐筆相同。
2. `autoAdvance:false`：建構後若輪到 AI，`snapshot().busy` 非 null；連續 `step` 直到 busy null 後 `playerTurn` 為 true。
3. `step` 第一次只聚焦（AI 單位落在 viewport 內、指令數不變），第二次才執行。
4. `skip`：busy 立即變 null、`fx.epoch` +1、`fx.items` 空；busy 時 `cancel` 等同 skip。
5. 移動產生一筆 `path` fx，cells 首尾＝起點、終點；log 只多一行移動。
6. 攻擊產生 `attack` fx，命中時有 `float` tone damage 含部位中文名與「−」；未命中有「未命中」。
7. 玩家指令成功後 `selected` 仍是該機、`quickMenu` 非 null 且含 `standby`。
8. idle 選中行動中我方時點可達格直接移動。
9. 無可用移動與能力時自動待機並出 message「行動點用完，自動待機」。
10. `endTurn` 有未行動我方時：第一次只出 `confirm`（文字含台數），其他 action 會清掉它；第二次推進到本輪不再輪到我方。
11. `commands` 恆含 move／standby／defer／end／eject／retreat／skip；敵方回合時 reason 含「敵方回合中」，`end` 仍 enabled。
12. 敵方在視野內 `unit()` 每層 hp 非 null 且 `stale:false`；移出視野（直接改 knowledge.visible 模擬）後 `stale:true` 且數值保留。
13. part 模式：對可瞄部位能力點目標進 `part` 模式、`pickPart` 送出的指令帶 part；`cancel` 回 target。（若基礎內容包沒有 partAim 能力，用測試內自建 setup 或 SPEC-GAP 說明並改測 `target.kind==="part"` 情形。）
14. keymap：`validateKeymap(DEFAULT_KEYMAP)` 為空；`resolveKey` 對 `{key:"+"}`、`{key:"+",shiftKey:true}`、`{key:"="}` 都回 `zoom` dir 1；`{key:"w"}` 回 `standby`、`{key:"d"}` 回 `defer`；`layerTypeLabel` 對 `armor` 回「裝甲」。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；`npx tsc --noEmit`（root tsconfig；`src/ui-adapter/dom/` 被排除，不必管它）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-uifix-vm --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc --noEmit`、`npm run check`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不跑 Playwright、不起 dev server。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-uifix-vm/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的 `src/rules`、`src/ai`、`src/sim` 改動，**不要碰、不要還原**；它們造成的非 ui-adapter 錯誤不是你的事，寫進 REPORT 即可。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. session：`autoAdvance`、`stepAi`，`advanceAi` 改走同邏輯；測試 1；`inbox_poll --once`。
2. controller：busy／step／skip、fx 產生、log 合併與 `at`、`focusLog`；測試 2–6；`inbox_poll --once`。
3. 行動流程、quickMenu、固定 commands、endTurn 確認、standby／defer；測試 7–11；`inbox_poll --once`。
4. viewmodel 敵方部件與殘影、part 模式、`layerTypeLabel`、keymap；測試 12–14。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-vm/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-vm/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」與「新快捷鍵表」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `src/ui-adapter/vm/*.test.ts` 全過，且比開工前多恰好 14 個 `test()`（由領導重算）。
2. `npx tsc --noEmit` 對 `src/ui-adapter/vm/` 零錯誤（由領導重跑）。
3. `npm test` 中 vm 以外的測試不因你而新增失敗（由領導對照）。
4. 範圍外檔案沒被你改（`git status --short src/ui-adapter/vm` 以外不見你的改動）。
5. REPORT 存在且有四段＋SPEC-GAP 清單＋新快捷鍵表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 起不來、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-uifix-vm`。本線團隊：`teams/uifix`。上線先發 `wf/tools/inbox_mail.sh cx-uifix-vm --up PROGRESS 'cx-uifix-vm 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-uifix-vm --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-vm/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-uifix-vm --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
