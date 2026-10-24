# cx-ib-perf REPORT

## 做了什麼

完成純效能優化，最終 bench **2.51 ms／步**，低於 3 ms 門檻；bench 與 skirmish hash 均與基準相同。未 commit。

`reachable` 改用同排序規則的最小堆積，單次搜尋重用 locomotion、佔位與地形資料。AI 在一次唯讀決策內共用 reachable／pathTo 成本表、遮罩與危險圖；每次嘗試執行指令前都清除決策快照，包含拒絕分支。ContentDB 按 kind／id 快取唯讀查詢結果。

BattleState 依純資料契約複製，歷史 payload 依純量／扁平陣列結構複製，維持副本隔離。grep 確認規則仍會讀歷史：injury／flow 讀 PersonDied、will 讀 ControlChanged。因此僅 AI 決策內部預測副本縮減其餘歷史，保留上述兩類事件與順序，新增可選 `EventLog.seqOffset` 維持後續事件序號。正式日誌、一般 maskedState、一般 previewCommand 仍保留完整歷史。

新增 5 個回歸案例，涵蓋副本隔離、死亡去重與失控恢復、堆積搜尋相對原排序搜尋的成本與格子順序、查詢快照邊界，以及 AI 移動後遭拒時的快取失效。既有測試與斷言完全未改。

固定四條驗收結果：

1. `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500`：1254 ms、2.51 ms／步、500 commands、round 19、maxSteps，hash 與基準相同。
2. `node src/sim/measure.ts scenario/skirmish-whitegloves 1`：hash `0613183bba2e5c5f`；427 commands、133 unitTurns、67 hits、108 misses、3 deaths，與基準一致。
3. `npm test`：exit 0、77 pass、0 fail；`npm run typecheck`：exit 0；`npm run check`：exit 0、0 errors、0 warnings。既有黃金 hash 斷言由原測試套件驗證，未更新任何 fixture。
4. 本 REPORT 已直接寫入交接書指定的主 repo 絕對路徑，包含四段與前後數字表。

## 產出（檔清單）

程式改動全部位於 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt/perf`。

- `src/ai/adapters/rules-adapter.ts`
- `src/ai/agent.ts`
- `src/ai/knowledge.ts`
- `src/ai/rules-query.ts`
- `src/content/contentdb.ts`
- `src/core/clone-state.ts`（新增）
- `src/core/eventlog.ts`
- `src/core/events.ts`
- `src/rules/command.ts`
- `src/rules/movement.ts`
- `src/rules/perf.test.ts`（新增）

共 11 個程式／測試檔；tracked diff 加新增檔案內容為 23,098 bytes，完整 patch 亦低於 80 KB。`git diff --stat` 已確認修改範圍；新增兩檔需由領導一併納入。開場已有的 untracked `node_modules` 與交接資料目錄未修改。`src/ai/score.ts`（含 want／DEFAULTS）未修改。

### 前後數字表

| 項目 | 前 | 後 |
|---|---:|---:|
| bench 500 ms | 19361 | 1254 |
| bench ms／步 | 38.72 | 2.51 |
| bench hash | 4780fd9dc8109210 | 4780fd9dc8109210 |
| skirmish 秒 | 20.376 | 1.339 |
| skirmish hash | 0613183bba2e5c5f | 0613183bba2e5c5f |
| npm test 秒 | 21.578 | 6.008 |
| npm test fail | 0 | 0 |

每項後均跑 bench 500 與 skirmish seed 1，hash 全部相同；中途 ms／步依序為 21.98、7.11、6.64、5.83、7.47、5.29、3.94、2.48，最後驗收為 2.51。整份狀態與歷史均走通用遞迴複製的 7.47 ms 版本較慢，已撤回；最終採狀態遞迴複製搭配日誌專用複製。

原始量測／測試輸出在 `/tmp/cx-ib-perf/`：`baseline-bench.log`、`baseline-skirmish.log`／`.time`、`baseline-test-clean.log`／`.time`，以及 `final-bench.log`、`final-skirmish.log`／`.time`、`final-test.log`／`.time`、`final-typecheck.log`、`final-check.log`。必用 `node --cpu-prof --cpu-prof-dir=/tmp/cx-ib-perf/prof …/bench-ops.ts 200` 已於基準與優化中執行，profile 存於該目錄。每一步完成均執行指定 inbox_poll。

## 沒做到或證據不足的

無未完成的契約驗收。沙箱 test runner 依檔案計數，因此 76→77 是增加一個測試檔，不代表只新增一項斷言。

時間以 Python `time.monotonic` 包住子程序；bench 的 ms 則為腳本內 runBattle 計時。基準 skirmish 與 CPU profile 曾同時執行，耗時可能受競爭影響；最終 bench、skirmish、npm test 均依序執行。為避免初次 npm test 與編輯時間重疊影響基準，暫存修改並還原 tracked 原始碼後重測基準 npm test，再完整恢復修改，採 21.578 秒那次結果。

預測歷史縮減依據目前規則讀取點；日後若新增讀取其他歷史事件的規則，需同步更新 adapter 的保留條件。純資料複製器依 BattleState 契約處理物件／陣列與純量，未擴充支援 Date／Map 等契約外型別。快照查詢只用於唯讀決策；一般可變狀態查詢不使用該快取。

## 需要決定的事

無；達成固定四條驗收後停止。由領導整合上述 11 檔並依團隊流程 commit。

**以後交接書該點名的工具**

Python `time.monotonic`／`subprocess`：本環境沒有 `/usr/bin/time`，可用來記錄程序耗時與 exit code。Python `json`／`collections.Counter`：彙總 Node `.cpuprofile` 的 samples，按函式與位置列出熱點。`git diff --stat` 不含 untracked 新檔，交接時要合看 `git status --short` 與新檔容量。
