# 任務：把 ui-adapter 的 vm/session.ts 改成包裝 sim 的 BattleSession，行為不變

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（含 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。背景：`wf/workflows/planning/specs/core/architecture.md`（第 16 行與「ui-adapter 的介面契約」段：ui-adapter 只依賴 core＋sim）、`wf/workflows/dispatch/handoffs/lead-ui-fix/REPORT.md`（九項功能，必須全保留）。

## 背景與唯一目標

`src/ui-adapter/vm/session.ts` 現在直接 import `src/rules`、`src/ai` 自己跑局；`src/sim/session.ts` 已有逐指令 API（`createSession`／`submit`／`stepAi`，全 AI 與 `runBattle` 同 hash，見 `test/sim/session.test.ts`）。唯一目標：**vm/session.ts 變成 sim `BattleSession` 的薄包裝，`src/ui-adapter/**` 不再 import `src/rules`／`src/ai`（含 `import type`），UI 行為不變**。

## 設計（領導已定，照做；實作細節你自己判斷）

1. **vm 包裝類別保留現有公開介面**（`BattleSession` 名稱、建構參數 `{db, sim, seed, playerSlot?, autoAdvance?}`、`db`、`state`、`playerSlot`、`commands`、`autoAdvance`、`batches`、`observers`（指令**前後**各呼叫一次，前一次給 viewmodel 拍敵方部件快照）、`query`、`activeUnit()`、`isPlayerTurn()`、`outcome()`、`submit()`、`stepAi()`、`advanceAi()`），controller／viewmodel／presentation／dom 盡量零改動。內部持有一個 sim `BattleSession`（`human: [playerSlot]`），所有推進只經 sim 的 `submit`／`stepAi`。
2. **vm `stepAi()` 維持「一次跑完一台 AI 的單位回合」語意**（controller 的 `step()` 依賴它：先聚焦、再整台執行）：迴圈呼叫 sim `stepAi()` 直到行動者換人（用回合鍵判斷：同 actor 的最新 `TurnStart` seq 改變也算換人）、分勝負或回 null；回傳 `{actor, events}` 形狀不變。每一個成功指令都要照舊推 `batches`（`visible` 取指令前後聯集）並呼叫 observers 前後兩次——前一次在呼叫 sim `stepAi()`／`submit()` 之前由包裝層自己呼叫。
3. **新增一個全 AI 選項**（例：`spectate?: boolean`，true 時 sim `human: []`、`playerSlot` 仍是視角）：讓 controller 能全 AI 打完一場。
4. **sim 側只新增、不改既有**（`src/sim/session.ts`）：
   - `export type SessionQuery = RulesQuery`（re-export 型別），`get query(): SessionQuery`、`get db(): ContentDB`。
   - 玩家知識：新增方法（例 `trackKnowledge(slot)`）——建立時與之後每個成功指令（submit 與 stepAi 都算）用 ai 的 `updateKnowledge`／`observe`／`emptyKnowledge` 更新 `state.knowledge[slot]`，時機先於之後註冊的 observer。邏輯照搬現行 vm `refreshKnowledge`。knowledge 不進 `hashLog`、AI 不讀 `state.knowledge`（已查：只有 `rules/flow.ts` 初始化寫），所以不影響 hash。
   - 若有其他缺口，只新增函式／方法／型別，並在 `test/sim/session.test.ts` **追加**測試；既有程式與既有測試一行不改。
   - 若包裝層需要不設上限，sim 建構參數 `maxSteps` 可傳 `Number.MAX_SAFE_INTEGER`；全 AI 對 `runBattle` 的測試用預設值。
5. `src/ui-adapter/vm/text.test.ts` 的 `createBattle` 改從 sim 取得初始 state（例：`createSession(...).state`）。

## 範圍（排除法寫死）

- 只寫：`src/ui-adapter/**`、`e2e/**`、`src/sim/session.ts`（只新增）、`test/sim/session.test.ts`（只追加）、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-session/op-uis-migrate/REPORT.md`。
- 不做：`src/sim/` 其他檔、`src/rules/`、`src/ai/`、`src/core/`、`src/content/`、`content/base/`、`test/` 其他檔（另一條線 `lead-ops-bio-balance` 正在寫這些，**碰了就會互相覆蓋**）；不修 lead-ui-fix REPORT 裡的試玩問題；不加功能；`wf/` 其他檔、code-map、testing 文件由領導更新。
- 遷移後完全沒用的 ui-adapter 內部程式可刪（直接在檔內刪程式碼）；**整檔刪除先不做**，列進 REPORT 由領導決定。
- 件數 gate：改動檔案超過 15 個就停下回報；容量 gate：新增程式碼超過 600 行就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm test`、`npm run check`、`npm run typecheck` | 每改一段後 |
| `npm run test:dom`、`npm run build`、`npm run test:e2e` | 收尾（e2e 自動 build＋preview 在 4174 埠，headless） |
| `git status --short`、`git diff --stat` | 收尾核只動到範圍內的檔 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑上表指令。**不 commit**（領導 commit），只在 REPORT 列改了哪些檔。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗（Playwright 只准 headless，照現有 config）；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`、不刪整檔；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`、`package.json`；整檔改寫用單一寫入操作；子代理上限 0 個。若別線未提交的改動讓測試在你沒碰的地方紅燈，**不要修它的檔**，在 REPORT 記紅在哪、哪條測試、是否與本線無關。

**分清錯誤來源**：工具或環境出錯 → 停下回報 BLOCKED；自己寫的程式出錯 → 自己修。

## 工作

1. 讀現行 `src/ui-adapter/vm/session.ts` 與其使用者（controller、viewmodel、presentation、dom/main.ts、各測試）及 `src/sim/session.ts`；跑一次 `npm run test:dom` 記基準數。
2. sim 側新增（設計第 4 點）＋在 `test/sim/session.test.ts` 追加測試（至少：`trackKnowledge` 更新 visible、`query`／`db` 可用）。
3. 改寫 vm/session.ts 為包裝層；改 text.test.ts；必要時微調呼叫端。
4. 新增 `src/ui-adapter/vm/boundary.test.ts`：掃 `src/ui-adapter/**/*.ts` 的 import／export from／動態 import，指到 `src/rules` 或 `src/ai`（相對路徑解析後）就失敗；**同檔內附自測**：餵三行應被擋的樣本（`import {x} from "../../rules/index.ts"`、`import type {y} from "../../ai/index.ts"`、`export * from "../../ai/x.ts"`）確認判定為違規、一行 `../../sim/session.ts` 確認放行。
5. 在 `src/ui-adapter/vm/session.test.ts` 追加：用 `BattleController`（`spectate` 全 AI、`autoAdvance:false`）以 skirmish seed 1（`scenarioToSetup(db, "scenario/skirmish-whitegloves", 1, { rounds: 3 })` 或預設輪數，與 runBattle 用同一個 sim）透過 controller 的 step／skip 動作打到 `outcome` 非 null，斷言 `hashLog(state.log) === runBattle({db, sim, seed:1}).hash`、commands 相同。
6. 跑全部驗收指令，寫 REPORT。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-session/op-uis-migrate/REPORT.md`。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 包裝層 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/session.ts` |
| sim 新增 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/sim/session.ts` |
| 邊界測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/boundary.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-session/op-uis-migrate/REPORT.md` |

REPORT 四段（做了什麼／產出（含改動檔清單、sim 新增的每個 API 一行）／沒做到或證據不足的／需要決定的事），末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `grep -rnE "from ['\"][./]*(\.\./)+(rules|ai)/" src/ui-adapter` 零命中，且 `boundary.test.ts` 存在、其自測證明樣本會被擋。
2. `npm test`、`npm run check`、`npm run typecheck` 皆 exit 0（REPORT 寫 `npm test` 的 pass／fail 數）。
3. `npm run test:dom` exit 0，數量 ≥ 基準＋2（REPORT 寫前後數字）。
4. `npm run build`、`npm run test:e2e` exit 0（e2e 7／7）。
5. 全 AI controller 測試通過：hash 等於 `runBattle`。
6. `git diff --stat` 只含範圍內的檔；`git diff src/sim/session.ts test/sim/session.test.ts` 只有新增行（`-` 行為 0，或僅 import 行合併——若有須在 REPORT 說明）。

## 失敗怎麼處置

- **測出來是壞的**且修不好 → 不刪你的改動，REPORT 寫證據與卡點，回覆標 FAILED。
- **測不出來**（環境跑不動）→ 保持現狀，回覆標 BLOCKED，寫解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報

- 我是誰：`op-uis-migrate`（Claude Opus 子 agent，行程內，不走 inbox）。
- 結束時在回覆給 STATUS（DONE／BLOCKED／FAILED）＋5 行摘要＋REPORT 路徑。
