# 任務：實作 ui-adapter 的純邏輯層 src/ui-adapter/vm/（session、ViewModel、controller、keymap、事件文字、大地圖）與 24 個 node 測試

> 領導 `lead-impl-ui` 寫給 codex 工人 `cx-ui-vm`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`——§3 是你的匯出介面、§4 是 controller 行為，名稱與簽名照抄。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/contract.md`、`src/ui-adapter/vm/types.ts`、`src/ui-adapter/vm/keymap.json`、spec `wf/workflows/planning/specs/core/architecture.md`（ui-adapter 的介面契約）、`src/sim/run.ts`（runBattle 迴圈，你的 session 是它的逐步版）、`src/ai/rules-query.ts`、`src/ai/index.ts`、`src/rules/index.ts` 與它 re-export 的 `state.ts`／`command.ts`／`turn.ts`／`flow.ts`、`src/core/{ids,types-def,types-state,events}.ts`；事件 payload 長相從 `src/rules/*.ts` 的 `emit(` 呼叫點讀——親自讀。

## 背景與唯一目標

規則、AI、sim 都已落地，網頁畫面還沒有。使用者裁示：一般網頁遊戲的按鈕／列表／面板／tooltip，指令用點選＋快捷鍵，不做文字指令列（contract §0）。DOM 層由另一條線 `cx-ui-dom` 同時寫，它只吃 `UiSnapshot`、只吐 `UiAction`／`KeyInput`。唯一目標：交出 contract §3 的五個模組，讓 `controllerForScenario(db, "scenario/skirmish-whitegloves", 1)` 能從頭玩到分出勝負，全部在 node 裡可測。

## 範圍（排除法寫死）

- 只做（新建）：`src/ui-adapter/vm/session.ts`、`viewmodel.ts`、`controller.ts`、`keymap.ts`、`text.ts`（事件→LogLine、rejection code→中文）、`debug-maps.ts`、`index.ts`（re-export），測試 `src/ui-adapter/vm/session.test.ts`、`viewmodel.test.ts`、`controller.test.ts`、`keymap.test.ts`、`text.test.ts`；外加你的 REPORT。
- 不做：`src/ui-adapter/vm/types.ts` 與 `keymap.json`（領導凍結；型別不夠用 → 在你自己的檔裡擴充型別並寫進 REPORT，不改 types.ts）；`src/ui-adapter/dom/`（別線）；`src/ui-adapter/content-browser.ts`；`src/core`、`src/content`、`src/rules`、`src/ai`、`src/sim`、`src/ops`、`content/`、`test/`、`schemas/`、`package.json`、各 tsconfig、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）。別線檔案有 bug → 不改，REPORT 附重現步驟。
- 件數 gate：新檔超過 13 個就停下回報；容量 gate：新檔合計超過 120 KB 就停下回報。

## 規格補充（寫死）

- 資訊只取玩家視角：敵方單位的層 hp 用 `state.knowledge[playerSlot].revealed`（null＝未偵察），不在 `visible` 裡的敵方單位**不出現在格子上**（`lastSeen` 可在格上標 `intent` 以外的東西就免了，忽略）。
- 單位短名 `label`：人物駕駛的取駕駛員名首字＋機體名首字以內 2 字；怪獸取 species 名前 2 字。你定規則寫進 REPORT。
- `text()`：至少涵蓋 TurnStart、Moved、AbilityUsed、Hit、Miss、LayerDamaged、LayerBroken、PartBroken、EffectApplied、UnitDied、MoraleChanged、RoundStart、BattleEnd；名稱一律從內容包取（`db` 的 def.name），不寫死；其他型別回 null 或通用句。
- `bigMapSim(db, 160, seed)`：160×160，地形用 base 已有的 terrain id 決定性鋪（例：雜訊或條紋），玩家 2 台、敵方 2 台以上放在地圖兩端相距 > 100 格，objectives 用情境已有的形狀（看 base scenario 怎麼寫）。必須能被 `createBattle` 吃下且 `BattleSession` 能跑。
- 效能：160×160 地圖上 `snapshot()`（viewport 40×25）在 node 內 < 20 ms（測試量中位數，寫進 REPORT 不寫成斷言）。

## 測試（寫死條數；`node:test`＋`node:assert/strict`；內容一律 `loadContentDirs(["content/base"])`）

共 **24** 個 `test()`：
- `keymap.test.ts` 6：預設 keymap `validateKeymap` 為空；`normalizeKey` 修飾鍵順序與大小寫；`resolveKey` 對 e／1／Shift+ArrowUp／Escape 得正確 UiAction；未綁定鍵回 null；重複鍵被 validate 抓到；`keyLabel("endTurn")` 為 "E"。
- `session.test.ts` 5：建 session 後輪到玩家（或已分勝負）；玩家送 end 後 AI 跑到再次輪到玩家；非玩家回合 submit 被拒；同 seed 同指令兩個 session 的 `hashLog` 相同；`session.commands` 交給 `replay`（src/sim/replay.ts）得到同一 hash。
- `viewmodel.test.ts` 5：viewport 夾在地圖內（含 160×160）；`cell()` 的地形來自內容；敵方未見單位不出現；移動一台後 `dirty()` 含起訖兩格；`unit()` 對敵方未偵察層 hp 為 null。
- `controller.test.ts` 6：`beginMove` 後 snapshot 有 `reach` 高亮、點可達格後單位位置改變；能力目標模式點合法目標 → 日誌出現 Hit 或 Miss 文字；被拒時 `message` 非空；`key({key:"e"})` 等同 `endTurn`；`cursor` 移出可視區 viewport 跟著捲；用指令只靠 `dispatch` 把 skirmish-whitegloves 玩到 outcome 或 30 輪（玩家每回合 end 也可）不拋錯。
- `text.test.ts` 2：上列事件型別各至少一筆產出非空中文；文字裡的名稱與內容包 def.name 一致。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數會不準；最終計數由領導在沙箱外重算）、`npm run typecheck`（vm 在 root tsconfig 下無 DOM lib，用到 DOM 型別會紅——這是故意的）。整個 vm 測試 < 30 秒。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ui-vm --once` | 每完成一個檔跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run typecheck` | 每個檔寫完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run typecheck`、`npm run sim`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI、不開瀏覽器；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ui-vm/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修；別線檔案的 bug → 不改，REPORT 附重現步驟。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `keymap.ts`、`text.ts`＋兩支測試；`inbox_poll --once`。
2. `session.ts`、`debug-maps.ts`＋session 測試；`inbox_poll --once`。
3. `viewmodel.ts`、`controller.ts`、`index.ts`＋兩支測試；`npm test` 既有測試不得因你變紅。
4. 量 snapshot 效能、寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-vm/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-vm/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」、「snapshot 效能」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `src/ui-adapter/vm/` 5 支測試恰好 24 個 `test()` 全過、總耗時 < 30 秒；`npm run typecheck` exit 0（由領導重跑）。
2. 匯出名與 contract §3 一致；`grep -rn "rules/\|ai/" src/ui-adapter/vm/*.ts` 的非測試命中只在 `session.ts`（以及 controller／viewmodel 透過 `session.query` 取用，不直接 import rules）。
3. `npm test` 全綠（含既有測試）。
4. `types.ts`、`keymap.json` 與範圍外檔案沒被改（`git status --short` 只見範圍內新檔）。
5. REPORT 存在且有四段＋SPEC-GAP 清單＋snapshot 效能。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ui-vm`。本線團隊：`teams/ui`。上線先發 `wf/tools/inbox_mail.sh cx-ui-vm --up PROGRESS 'cx-ui-vm 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ui-vm --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-vm/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
