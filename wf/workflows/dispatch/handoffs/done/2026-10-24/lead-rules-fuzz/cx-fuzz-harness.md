# 任務：寫零依賴、可重現 seed 的戰鬥 fuzz 工具 `test/fuzz/`，只找 bug、不修 bug

> 領導 `lead-rules-fuzz` 寫給 codex 工人 `cx-fuzz-harness`。**交接書是唯一契約**。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 spec `wf/workflows/planning/specs/core/` 的 `architecture.md`（§headless 測試策略 (3)）、`rules-turn-and-actions.md`、`rules-attack-resolution.md`、`rules-resources-effects.md`、`rules-battle-flow.md`——親自讀。

## 背景與唯一目標

戰鬥規則（`src/rules/`）只有手寫單元測試與 20 個 2×3 小情境的不變量測試（`test/sim/invariants.test.ts`、`test/sim/helpers.ts`，先讀這兩個當範例）。唯一目標：做出一支 fuzz 工具，**隨機組合 `content/base/` 的全部內容**生成戰鬥、跑完、逐條檢查不變量，**把違規以「seed＋模式＋不變量名＋訊息」列出**。修 bug 不是你的事（領導會修），你**不得修改 `src/` 任何檔**。

## 範圍（排除法寫死）

- 只做：新目錄 `test/fuzz/` 底下的檔（建議 `gen.ts` 情境生成、`invariants.ts` 不變量、`drive.ts` 兩種驅動、`cli.ts` 指令列、`fuzz.test.ts` 快速版）；以及你的 REPORT。
- 不做：`src/**`、`content/**`、`test/` 其他目錄、`package.json`（npm script 由領導加）、`wf/`（REPORT 除外）。發現 bug **不修**、不為了讓 fuzz 綠而在工具裡吞掉違規（只准用明列、有理由的 `KNOWN` 白名單，且白名單項要寫進 REPORT）。
- 件數 gate：`test/fuzz/` 超過 8 個檔就停下回報；容量 gate：`test/fuzz/` 總大小超過 80 KB 就停下回報。

## 規格

**零依賴**：只 import node 內建模組與本 repo 的 `src/`（`src/content/loader.ts` 的 `loadContentDirs`、`src/core/rng.ts`、`src/rules/index.ts`、`src/sim/{run,replay,save,session}.ts`、`src/core/eventlog.ts`）。node 24 原生跑 `.ts`。

**自動吃新內容**：一律用 `db.ids(kind)`／`db.all(kind)` 列舉，**不寫死任何內容 id**（`terrain/plain` 之類的 fallback 也不准）。其他線正在大量新增 `content/base/` 檔，新檔要自動進入抽樣池。

**可重現**：單場以 `(seed, mode)` 完全決定；所有隨機只用 `createRng(seed, 某常數 stream)`，不准用 `Math.random`、`Date`。違規輸出要附一行可直接重跑的指令：`node test/fuzz/cli.ts --seed SEED --runs 1 --mode MODE --verbose`。

**情境生成器**（`gen.ts`，產出 `BattleSetup`，見 `src/rules/flow.ts` 的型別與 `test/sim/helpers.ts` 的作法）：
- 地圖：寬高各 3～24 隨機（約 5% 機率放大到 40～64）；每格從 `db.ids("terrain")` 隨機抽（可偏重前幾種讓地圖可走）；`exits` 隨機取部分邊緣格；`globals` 偶爾給 `tide`／`light`。
- 陣營數 2～4，slot 名 `s0`..`s3`；隨機兩兩結盟（`setup.allies`，對稱）；`factions` 從 `db.ids("faction")` 抽；保證至少兩個互相敵對的陣營。
- 單位 2～12 隻，各陣營至少 1：一半機率機甲（`db.ids("frame")` 抽一個；每個 slot 從 `db.all("component")` 中 `slot` 型別相符的隨機裝或留空；每個座位依 `accepts` 從 `db.all("person")` 中 kind 相容的隨機放人或留空——pilot 座放 human、soul 座放 soul），一半機率怪獸（`db.ids("monster")` 抽，用其 species 與 grade，參考 `src/sim/run.ts` 的 `scenarioToSetup`）。
- 位置不重疊、在界內。`objectives` 隨機：空陣列（預設殲滅）或從 eliminate／survive／reachExit／killTarget 中抽 1～2 個合法的；`maxRounds` 3～12。
- 生成本身拋例外（例如內容組合不合法）要分兩類記：`gen-error`（工具自己的錯，你要修工具）與 `setup-rejected`（`createBattle` 拋錯——這是可能的規則／內容 bug，記為違規）。

**兩種驅動**（`drive.ts`）：
- `ai`：全 AI。用 `scenarioToSetup` 的 `SimSetup` 形狀包你生成的 setup（`slotProfiles` 每 slot `{policy:"tactical", params:{}}`，怪獸單位依 species `aiProfile` 填 `unitPolicies`），呼叫 `runBattle`（`src/sim/run.ts`）；同時記錄每條成功指令後的狀態快照（可用 `runBattle` 的指令紀錄再 `replay` 逐條重建，或自己照 `runBattle` 的迴圈寫）。
- `random`：隨機合法指令玩家：每步從 `createSession(...).legalActions()`（`src/sim/session.ts`，`human` 設為全部 slot）列出的合法動作中均勻抽一個（move 從 `reachable` 抽目的格、abilities 從 targets 抽、加 wait／end／retreat／eject），`submit` 送出；每單位每輪動作數上限 12 次後強制 end；`legalActions` 說合法但 `submit` 被拒＝違規 `legal-rejected`。
- 另加 `scenario` 模式：對 `db.ids("scenario")` 每個真情境用 `scenarioToSetup` 生成 setup，跑 `random` 驅動（seed 決定挑哪個情境）。
- 每場步數上限（例如 4000 指令）到頂＝違規 `no-termination`（附輪數）。

**不變量**（`invariants.ts`；每條一個具名函式，每條指令後檢查，整場結束再跑終局類）——至少這些，名稱照抄：
1. `no-throw`：生成後的 `createBattle`／`startBattle`／`tryCommand`／`previewCommand`／AI／`battleResult` 不拋例外（抓到要記 stack 前 5 行）。
2. `preview-pure`：`previewCommand` 前後 `canonicalJson(state)` 不變；且 preview 的 ok 與隨後 `tryCommand` 的 ok 相同（抽樣每 10 步一次即可）。
3. `pool-bounds`：所有 unit／person 池 `cur`、`max`、`regen` 為數字且非 NaN；hard 池 `min ≤ cur ≤ max`；soft 池 `cur ≥ min`（宣告查法照 `invariants.test.ts`）。
4. `layer-hp`：每層 `0 ≤ hp ≤ 該層定義 hp`（定義來自 frame／bodyplan／component layersAdd，可用 `layerDefs(ctx, unit, part)`）；`broken ⇒ hp==0`；部位有 structural 層時 `part.broken ⇔ 全部 structural 層 broken`（只在單位非 derelict／captured 時檢查，若有例外寫理由）。
5. `death-consistency`：`rt(s).unitStatus` 為 `active` 的單位，其 core 功能部位不得全毀（用 `isDead`）；status 為 dead／retreated／captured 的單位不在 `order` 的後續行動中出現。
6. `dead-dont-act`：單位一旦 status 非 active（dead／retreated／captured；derelict 例外如何處理自行判斷並寫 REPORT），之後的事件日誌中不得再有以它為 `turn` 的 `TurnStart`／`AbilityUsed`／`Moved`，`currentActor` 不得回傳它。
7. `positions`：active 單位位置在界內、兩兩不同格。
8. `seats`：`unit.seats[seat] == p.id ⇔ persons[p].seat.mech == unit.id`。
9. `contrib-valid`：每筆 contrib 的 `value` 是有限數字、`source` 存在（照 `invariants.test.ts`）。
10. `effects-valid`：效果實例 `remaining` 為 null 或 ≥ 0、`stacks ≥ 1` 且 ≤ 定義的 `stack.max`（有宣告時）、owner 存在。
11. `cooldowns`：所有 cooldown ≥ 0。
12. `events`：`seq` 連續從 0、`round` 不遞減、payload 中所有 number 皆有限（`Infinity` 只允許出現在池 max 類欄位，自行判斷並寫 REPORT）；`BattleEnd` 至多一筆且為最後一筆（之後無事件）。
13. `termination`：有 outcome 時 `s.round ≤ maxRounds`（或 maxRounds+1，看規則寫法，寫 REPORT）；winner 為 null 或存在的 slot；`battleResult` 非 null 且每個 unit status 與 `rt(s).unitStatus` 一致。
14. `replay-hash`：用記錄的指令 `replay(db, setup, seed, commands)` 得到的 `hashLog` 等於原場 hash，且 `canonicalJson` 整個 state 相同。
15. `ai-determinism`（只 ai 模式）：同 seed 再 `runBattle` 一次，hash 相同。
16. `save-roundtrip`：`createSave(db,{scenario:null, seed, commands, setup, snapshot})` → `serializeSave` → `parseSave` → `loadSave(db, save, {verifySnapshot:true})` 不拋錯且狀態與原 state 相同。
17. `ai-legal`（只 ai 模式，僅記錄不算硬違規）：`runBattle` 的 `rejected` 次數 > 0 時記為 `ai-rejected` 警告（這是 AI 線的問題）。

**輸出與 CLI**（`cli.ts`）：`node test/fuzz/cli.ts --runs N --seed S [--mode ai|random|scenario|mix] [--verbose] [--json out.json] [--max-ms T]`；`mix`（預設）輪流三種模式。結束印：場數、各模式場數、總耗時、每個不變量的違規場數、前 20 筆違規（seed、mode、不變量、訊息首行、重跑指令），**相同 (不變量, 訊息首行去掉數字) 的違規歸成一組並計數**。有任何硬違規 exit 1，否則 0。`--max-ms` 到時就停並如實回報跑了幾場。

**快速版**（`fuzz.test.ts`，給 `npm test`）：固定 seed，跑約 30 場 mix，整檔 15 秒內；斷言零硬違規——**但目前規則有 bug，所以快速版先以 `test.todo` 或 `{ skip: "原因字串" }` 標記為未啟用，領導修完再打開**；另寫一條一定會跑的「工具自我測試」：故意餵一個被竄改的狀態（例如把某 hard 池 cur 改成 max+1、把某 broken 層 hp 改成 5、刪掉一筆事件讓 seq 斷號）確認對應不變量會報錯（testing.md「證明檢查會變紅」規則）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node test/fuzz/cli.ts --runs 200 --seed 1` | 開發中反覆跑；最後跑一輪 `--runs 2000 --seed 1 --max-ms 600000` 交數字 |
| `node --test test/fuzz/fuzz.test.ts` | 驗快速版與自我測試 |
| `npm run typecheck` | 你的檔要過型別檢查（tsconfig.json 的 include 已涵蓋 test 目錄） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fuzz-harness --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/test/fuzz/` 與你的 REPORT 目錄；**不要 commit**（REPORT 列檔案清單，領導 commit）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-fuzz-harness/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- 工作樹裡有其他線未提交的半成品（`src/ui-adapter`、`src/ops`、`content/base` 新檔）；它們造成的 `npm test` 紅燈不是你的事，**不要碰**。
- **分清錯誤來源**：沙箱拒寫、node 跑不了 → `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 讀範例與 spec，寫 `gen.ts`，`--runs 50` 確認 `gen-error` 為 0。`inbox_poll --once`。
2. 寫 `invariants.ts` 與 `drive.ts`、`cli.ts`；寫自我測試確認每條不變量能變紅（至少 3、4、9、12、14 五條要有竄改測試）。
3. 跑 `--runs 2000 --seed 1 --max-ms 600000`，把輸出存 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-harness/run-2000.txt`。
4. 對每一組違規，挑一個 seed 用 `--verbose` 看細節，在 REPORT 寫一句你判斷的成因（規則 bug／AI bug／內容資料錯誤／工具誤報），**不修**。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-harness/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| fuzz 工具 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/fuzz/` |
| 2000 場輸出 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-harness/run-2000.txt` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-harness/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「違規分組表」（不變量、訊息、場數、一個重跑 seed、成因判斷），加「白名單與誤報判斷」，末尾加「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node test/fuzz/cli.ts --runs 50 --seed 7` 兩次輸出的違規清單逐字相同（可重現），且 `gen-error` 為 0。
2. `node --test test/fuzz/fuzz.test.ts` 0 fail（快速版可為 skip／todo，自我測試必須實跑且通過）。
3. `grep -rE "\"(frame|component|person|monster|terrain|faction|species)/" test/fuzz/` 零命中（沒有寫死內容 id）；`grep -rn "Math.random\|Date.now" test/fuzz/gen.ts test/fuzz/drive.ts test/fuzz/invariants.ts` 零命中。
4. `run-2000.txt` 存在，記載實際跑的場數與耗時。
5. REPORT 存在且有四段＋違規分組表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（工具跑成了但不可重現、或自我測試紅）→ 修工具；修不好發 `FAILED`，REPORT 寫證據。
- **測不出來**（node 跑不了、沙箱擋寫）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。
- fuzz 抓到大量規則違規**是預期的成功結果**，不是失敗。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fuzz-harness`。本線團隊：`teams/rules-fuzz`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fuzz-harness --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。
