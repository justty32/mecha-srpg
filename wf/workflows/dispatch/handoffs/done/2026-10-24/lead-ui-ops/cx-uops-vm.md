# 任務：實作營運畫面的 vm 層 OpsController（CampaignState → OpsSnapshot、按鈕與快捷鍵、出戰銜接），node 可測

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。spec：`wf/workflows/planning/specs/ops/text-ui-contract.md`（OpsCommand、Keymap、Screen.actions）、`wf/workflows/planning/specs/ops/battle-interface.md`。背景：`wf/workflows/dispatch/handoffs/lead-ops-bio-balance/REPORT.md` 第二節（ops 對外型別最新版）。

## 背景與唯一目標

營運層（`src/ops/`）已能在 node 跑整場戰役，但沒有網頁畫面。另一個工人同時在寫 DOM（`src/ui-adapter/ops/dom/`），兩邊只經**凍結契約** `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/vm/types.ts` 往來（領導寫的，**你不可改**；覺得不夠就寫進 REPORT「需要決定的事」，用 SPEC-GAP 註解選最小解法）。唯一目標：**在 `src/ui-adapter/ops/vm/` 實作 `OpsController`，產出完全符合 types.ts 的 `OpsSnapshot`，並能從營運接約出戰 → 交給現有戰鬥 vm → 戰果回寫回營運**。

## 設計（領導已定，照做；細節你判斷）

1. **公開 API**（`src/ui-adapter/ops/vm/index.ts` 匯出）：
   - `new OpsController({ db, world, start?: string /* 預設 "start/default" */, seed: number, spectate?: boolean })`；`static fromSave(opts, text): OpsController`（用 `src/ops/sim/save.ts` 的 `loadCampaign`）；`serialize(): string`（`createCampaignBlob`＋`serializeCampaign`）。
   - `snapshot(): OpsSnapshot`、`dispatch(a: OpsUiAction): OpsSnapshot`、`key(k: OpsKeyInput): OpsUiAction | null`（解析快捷鍵；按鍵對應的按鈕 disabled 時回 null）、`battleController(): BattleController | null`（戰場進行中才非 null）、`get state(): Readonly＜CampaignState＞`。
2. **指令一律經 ops 對外 API**：`applyCommand(state, db, world, cmd, { battle })`（`src/ops/time/index.ts`）；不直接改 state。被拒時 `message` 寫中文原因（從 `src/ops/**` 的 `fail("…")` 錯誤碼整理一張對照表，找不到就「指令被拒：（錯誤碼）」）。指令紀錄存成 `CampaignCommand[]`（`src/ops/sim/campaign.ts`；出戰要帶 `battle` 紀錄，形狀照 `runCampaign` 的 recording，`Infinity` 池轉 `Number.MAX_SAFE_INTEGER`），讓 `serialize`／`fromSave` 能重播。
3. **按鈕**：房間動作取 `render(state, events, world, db).actions`（`src/ops/text/render.ts`）轉 `OpsButton`（`disabled`→`enabled:false`＋`reason`）；render 沒給的指令由 vm 自己組 `OpsCommand` 按鈕：接約（含談判 `ask` 三種：total／advance／perHead）、放棄、航向（選取節點 `sail`）、泊／懸、出戰（開編成）、市場買賣（`trade`）、招募（`hire`，候選人在 `src/ops/crew/shared.ts` 的 crew runtime `candidates`）。這些按鈕的可用與否用 `applyCommand` 試跑（`result.ok`，比照 `src/ops/sim/policies.ts` 的作法；**不要試跑 wait**），不可用時寫原因。prompt 未回應時，非 prompt 按鈕一律 `enabled:false`、reason「先回應事件」。
4. **快捷鍵**：讀 `content/base/world/keymap-ops.json`（世界 DB 的 `keymap` 類，`world.all("keymap")`；context room／prompt）＋ vm 自己的 `src/ui-adapter/ops/vm/keymap-ui.json`（給 ops keymap 沒有的：分頁切換、到下個事件、出戰、接約、取消…；格式同 keymap-ops）。同 context 同鍵衝突要有測試擋。按鈕 `key` 用顯示字（`F2`、`W`、`Esc`、`1`；可參考 `src/ui-adapter/vm/keymap.ts` 的 `keyLabel`）。**同一動作：按鈕 action 與快捷鍵 `key()` 回傳的 action 必須相同**（測試斷言，spec 測試第 5 類）。
5. **推進時間**：`advance:day` ＝ `{v:"wait",days:1}`；`advance:event` ＝ 連續 `wait 1`（每天一條指令），遇到 prompt、新的 offered 契約、抵達、裂縫 phase 變化、`pendingBattle`、`CampaignEnd` 或滿 28 天即停。
6. **世界圖排版**：NodeDef 沒有座標（SPEC-GAP）→ vm 用決定性演算法（例：依 id 排序放圓上＋固定迭代次數的力導向，月面節點放右側帶）算 0..1 座標，留 6% 邊界；同輸入同輸出，任兩點距離 ≥ 0.08（測試）。
7. **編成與出戰**（核心，務必做通）：
   - `sortieOpen`：建編成草稿，預設自動帶入可出戰機體與座位（邏輯可參考 policies.ts 的 `allUnits`／`combatReady`，但**在 vm 內自寫，不改 src/ops**）；有 `pendingBattle` 時以它為底。`error` 用 `validateSortie`（`src/ops/sortie/validate.ts`）的結果翻中文。
   - `sortieLaunch mode:"command"`：**第一段**：`applyCommand(state, …, {v:"sortie", sortie: 草稿}, { battle: 捕捉 runner })`，runner 內呼叫 `sortieBattleSetup(s, ctx, sortie)`（`src/ops/sortie/run.ts`，領導新增的唯讀查詢）取得 `{sim, seed}` 並記下 runner 收到的 `sortie`，然後回 `{ok:false,error:"ui-deferred"}` 讓 state 回滾。再建戰鬥 vm：`new BattleSession({ db, sim, seed, autoAdvance:false, spectate })`＋`new BattleController({ session, title })`（`src/ui-adapter/vm/index.ts`）。`snapshot.battle` 非 null。
   - `battleDone`：要求 `session.outcome()` 非 null（否則 message）；`result = session.result()`（領導已在 vm session 加了 `result()`）。**第二段**：對同一個 state 再送同一條 sortie 指令，runner 為：`validateSortie` → `generateScenario(s, ctx, sortie)`（消耗與第一段相同的 RNG）→ 照 `runSortie` 的作法修正 instinct 單位 frame → `applySortieResult(s, ctx, sortie, result)` → 回 `{ok:true, result}`；兩段的 sortie 以 `canonicalJson` 比對必須相同。外面包 recording 存進 `CampaignCommand.battle`。之後 `battle=null`、`report` 非 null。
   - `sortieLaunch mode:"auto"`：直接用 `defaultBattleRunner`（`src/ops/sim/battle.ts`）＋recording，結算後出 `report`。
   - `report`：比對回寫前後（cash 差、契約狀態、裂縫 phase、`result.units`／`persons` 狀態、戰利品數、`BattleResolved`）組中文行。
   - `spectate:true` 時戰鬥 vm 的 session 用 `spectate:true`（全 AI 觀戰）。
8. **命名 prompt**：`pendingChoices[0]` 有 `naming`（`src/ops/crew/names.ts` 的 `NamingPrompt`）時 `prompt.naming` 非 null；`nameSubmit` 在 state 副本上呼叫 `applyName`，prompt 清空後 `advanceDays(s, ctx, 0)`（`src/ops/time/index.ts`）。這不是 OpsCommand、無法重播（SPEC-GAP）：之後 `serialize` 要拋出可讀錯誤，`message` 告知「自填命名尚無指令形式，本局無法存檔」，寫進 REPORT。
9. 中文顯示名：節點、人物、機體、部位、池從內容 def 取（`entityName`、`db.require("frame"…).name` 等）；列舉值（潮相、角色、裂縫七態、稱號種類、契約狀態、帳戶）放 `labels.ts`。不寫死內容 id。
10. 模組邊界：`src/ui-adapter/**` 不得 import `src/rules`、`src/ai`（`src/ui-adapter/vm/boundary.test.ts` 會掃到你的檔）。

## 範圍（排除法寫死）

- 只寫：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/vm/` 底下的新檔（**`types.ts` 除外，不可改**）、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/cx-uops-vm/REPORT.md`。
- 不做：`src/ui-adapter/ops/dom/`（另一個工人在寫）、`src/ui-adapter/` 其他任何檔、`src/ops/`（API 不夠就在 REPORT 寫需要什麼，**不要改**）、`content/`、`e2e/`、`package.json`、`tsconfig*.json`、`wf/` 其他檔、code-map／testing 文件（領導更新）。
- 件數 gate：新檔超過 14 個就停下回報；容量 gate：新增程式碼（含測試）超過 2200 行就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `cd /home/lorkhan/repo/game_dev/mecha-srpg && node --test 'src/ui-adapter/ops/vm/*.test.ts'` | 每改一段後（沙箱內計數可能不準，以 exit code 為主） |
| `cd /home/lorkhan/repo/game_dev/mecha-srpg && npm run typecheck` | 收尾 |
| `cd /home/lorkhan/repo/game_dev/mecha-srpg && node --test src/ui-adapter/vm/boundary.test.ts` | 收尾（邊界） |
| `wf/tools/inbox_poll.sh cx-uops-vm --once` | 每完成一步讀 orders |
| `wf/tools/inbox_mail.sh cx-uops-vm --up DONE|BLOCKED|FAILED '一句結論' 正文檔路徑` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑上表指令。**不 commit**（`.git` 在沙箱可能唯讀；commit 由領導做），REPORT 列出新增檔清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`、不刪整檔；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一寫入操作（見 `wf/workflows/dispatch/lessons.md` 第 4 條）；子代理上限 1 個，只准為推進正事開。別線未提交的改動讓你沒碰的測試紅燈時**不要修它的檔**，在 REPORT 記下。不上網。

**分清錯誤來源**：工具或環境出錯（指令不存在、沙箱拒寫）→ 停下發 `BLOCKED`；自己寫的程式出錯 → 自己修。

## 工作

1. 讀 types.ts 與上列 ops 檔；寫一支試探腳本（放 `/tmp`）確認：`start/default` seed 3 約第 14 天出現 offered 契約，可接約、航行、出戰。
2. 實作 labels／keymap／layout／snapshot 組裝／controller。
3. 實作編成與兩段式出戰、auto 結算、report、命名。
4. 寫測試（同目錄 `*.test.ts`，內容用 `loadWorldDirs(["content/base"])`，cwd 為專案根），至少涵蓋驗收列的情境。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/cx-uops-vm/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| vm 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/vm/*.ts`、`keymap-ui.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/cx-uops-vm/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `node --test 'src/ui-adapter/ops/vm/*.test.ts'` exit 0，且含一條**完整流程測試**：`start/default` seed 3 → 回應 prompt → `advance:event` 直到有 offered 契約 → 接約 → 航行到目標 → `sortieOpen` → `sortieLaunch command`（`spectate:true`）→ 經 `battleController()` 的 `dispatch({type:"skip"})` 打到 outcome → `battleDone` → `report` 非 null、state.log 有 `BattleResolved`、契約不再是 active。
2. 同上流程改用 `sortieLaunch auto` 也通過；且出戰後 `serialize()`→`fromSave()` 的 state 用 `campaignHash` 比對相同。
3. 測試斷言：每個 enabled 且有 key 的按鈕，`key()` 解析出的 action 與按鈕的 action 深相等；keymap 合併後同 context 無重複鍵。
4. 測試斷言：snapshot 每個欄位都有值且形狀符合 types.ts（`npm run typecheck` exit 0）；世界圖排版決定性、任兩點距離 ≥ 0.08。
5. `node --test src/ui-adapter/vm/boundary.test.ts` exit 0。
6. `git status --short` 顯示你只新增了 `src/ui-adapter/ops/vm/` 內的檔與自己的 REPORT（`types.ts` 未被修改）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 回報 `FAILED`，REPORT 寫證據。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-uops-vm`。本線團隊：`teams/ui-ops`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-uops-vm --up 終局STATUS '一句自足結論' 正文檔路徑`（沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
