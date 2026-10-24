# cx-ib-step — sim 逐指令互動 session

## 做了什麼

新增 `createSession`／`BattleSession`，人類 slot 透過 `submit` 下單一指令，AI 每次 `stepAi` 只套用一個成功指令。建立時不自動推進；`runAiUntilHuman` 回傳本次成功指令數。成功指令後呼叫 observer，並提供取消訂閱函式。

AI 使用真正的 FactionAI 在 `structuredClone(state)` 上產生單位回合佇列，讓 RNG、代理記憶、知識與策略 closure 僅前進一次。真狀態逐筆重放後，才在整個單位回合結束時通知其他 AI；新陣營與 startRound 時機沿用 runBattle。佇列包含失敗嘗試，maxSteps 與 runBattle 同樣以指令嘗試計數，規劃時達上限也保留其中斷語義。

legalActions 回傳不含起點的可達格成本、能力目標與四個回合操作旗標。能力目標經 checkAbility，排除 passive／reaction，支援 self、unit、part 與格子型目標；回合操作合法性來自規則 preview。preview 直接回規則層的結果、事件與副本狀態。

固定驗收證據：`node --test --test-reporter=tap test/sim/session.test.ts` 與 `node --test test/sim/session.test.ts` 均 exit 0、0 fail；原始碼恰好 6 個 test()。`npm test` exit 0、77 檔 pass、0 fail（約 27.8 秒）；`npm run typecheck` exit 0。全 AI skirmish seed 1、3 輪的 hash 與指令序列等於 runBattle；其餘五項依交接書涵蓋單步、人類權限、合法目標、preview 不變與終局拒絕。

## 產出（檔清單）

工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt/step`。

- `src/sim/session.ts`：新增 API 與公開型別，199 行。
- `src/sim/index.ts`：新增 session 匯出，1 行。
- `test/sim/session.test.ts`：新增恰好六個測試，107 行。
- 本 REPORT：主 repo 的 `wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-step/REPORT.md`。

完整程式 diff：3 files changed、307 insertions、16,322 bytes，未超過 5 檔／40 KB gate。新檔未追蹤，故使用 `/tmp/cx-ib-step/review.index` 與暫存 objects 做 intent-to-add，再執行 git diff --stat；實際 repo index 未改動、未 commit。全套測試輸出留在 `/tmp/cx-ib-step/npm-test.log`。工作開始已有未追蹤 node_modules 與交接書目錄，均未改動。

## 沒做到或證據不足的

沙箱 runner 將單一測試檔回報為 1 項；六個 test() 由原始碼計數確認，依交接書不視為阻塞。尚未遷移 ui-adapter，也未改 runBattle、rules、ai、core 或內容；UI 現有玩家知識刷新、可見事件批次仍由 UI 負責，這次沒有驗證 UI 遷移後行為。

state 與 commands 為唯讀用途的參照（型別僅頂層 readonly），不做深層凍結；呼叫者不得直接修改。maxSteps 耗盡或 stalled 時 stepAi 回 null，只有規則正式結束時 result 才非 null。observer 內禁止重入推進：submit 回 busy，stepAi 回 null。依固定驗收未另外執行 check、wf-lint 或 UI 驗證。

## 需要決定的事

本線無阻塞、無需修改規則查詢匯出。後續 UI 遷移仍需決定玩家知識／可見事件批次的持有位置；目前新 API 刻意只提供交接書指定的成功指令事件，沒有複製舊 UI 的 presentation 狀態。

## API 簽名表

型別完整定義以 `src/sim/session.ts` 為準；SessionOptions 含 db、sim、seed、human?、maxSteps?。

| 簽名 | 回傳／意義 |
|---|---|
| createSession(opts) | BattleSession |
| state / commands | 唯讀用途狀態／成功指令 |
| currentActor() | Id 或 null |
| isHumanTurn() | boolean |
| outcome() / result() | BattleOutcome／BattleResult 或 null |
| hash() | 事件日誌 hash |
| legalActions(unit?) | LegalActions |
| preview(cmd) | { result, state }；events 在成功 result 內 |
| submit(cmd) | SessionSubmitResult |
| stepAi() | { actor, cmd, events } 或 null |
| runAiUntilHuman() | 成功指令數 |
| observe(fn) | 取消訂閱函式 |

## ui-adapter 遷移對照

以下涵蓋舊 vm/session.ts 的所有方法；query、batches、playerSlot、autoAdvance 是舊屬性，並非新 session 的公開成員。

| 現有方法 | 新 API／處理方式 |
|---|---|
| constructor | createSession；playerSlot 改 human 陣列 |
| activeUnit | currentActor |
| isPlayerTurn | isHumanTurn |
| outcome | outcome |
| refreshKnowledge（私有） | 無直接對應；後續處理玩家視野 |
| execute（私有） | submit／stepAi 內部執行 |
| submit | submit；自動推進改由呼叫端決定 |
| stepAi | stepAi；一次由整台改成一個指令 |
| runAiTurn（私有） | 新 session 的佇列規劃與重放 |
| advanceAi | runAiUntilHuman；上限改在建立時指定 |

舊 observers 的執行前／後通知改為 observe 的成功後通知；若 UI 需前後可見集合，須由呼叫端在推進前保存並於回呼後組合。既有 query 各方法不全等同 legalActions，後續搬遷需按 viewmodel 的讀取需求處理。

## 以後交接書該點名的工具

保留 node --test（含 tap）、npm test、npm run typecheck、inbox_poll.sh 與 inbox_mail.sh。若要求未追蹤新檔也出現在 git diff --stat，應點名暫存 GIT_INDEX_FILE／GIT_OBJECT_DIRECTORY 的 intent-to-add，避免為檢視差異而改動實際 index；測試件數應同時看 test() 數與 runner fail 數。
