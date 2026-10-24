# cx-aio-core：目標評分完成，六條驗收依領導修訂基準交付

## 做了什麼

已親讀 AGENTS.md、指定 wf 工作流、AI spec、同盟規格、全部 src/ai、規則目標判定與情境組裝。新增公開目標解析、知識快照快取、目標倍率、捕捉保留、位置進展、出口撤離與額外目標候選；候選評分與 strategy 集火共用倍率。所有權重可由 aiprofile params 覆寫，沒有更動內容與規則。

實作微調：WeakMap 以 view 為鍵、slot 為次鍵，快取公開事實；killBonus 保存預設加成，bonusReasons 讓不同 profile 在取用時套用權重，避免快取被參數污染。另存 friendlyExitUnits，讓盟軍也避開玩家的出口；exitUnits 仍只收自己 slot 的目標。berserk 呼叫共用產生器時不加目標候選。空目標與明列 eliminate 都不增加分數。

驗收仍為交接書固定六條。第 1 條：沙箱內 `npm run typecheck` exit 0；`node --test --test-isolation=none 'test/ai/*.test.ts' 'test/sim/*.test.ts'` 實際 108 tests／108 pass／0 fail。沙箱外複驗由領導依契約執行。第 2 條：領導 orders 已修訂基準，五 seed 與同工作樹的改前 AI 逐一相同，全部 pass:true。第 3 條：下述 16 條測試與反證覆蓋指定行為。第 4 條：rift 五 seed 都有 winner、Wait 比例全 0。第 5 條：3.08 ≤ 2.81 × 1.5 = 4.215 ms／步。第 6 條：本 REPORT 四段與兩表齊備。

調參第 1 輪：採下表起始權重；rift 全有勝負、Wait 全 0，anchored 對巢母命中由 10 增至 19，效能合格，保留本輪權重作最終值，不為 anchored 勝率追加調整。

參數表：

| 名稱 | 預設 | 意義 |
|---|---:|---|
| objKill | 4 | 指定擊殺 |
| objSpawner | 3 | 孵化源 |
| objZoneClear | 2 | 清除守區敵人 |
| objIntercept | 3 | 攻擊敵方撤離目標 |
| objSpare | 4 | 擊殺捕捉目標扣分 |
| objExit | 4 | 前往出口／撤離 |
| objHold | 2 | 接近守區 |
| objHoldStay | 4 | 留在守區 |
| objContest | 1 | 爭奪敵方守區 |
| objEscort | 2 | 維持護送距離 |
| escortRange | 2 | 護送半徑 |
| objBlock | 1 | 攔截敵方出口 |
| objNoBlock | 8 | 不佔友軍出口 |
| objMoves | 4 | 額外移動候選數 |

量測表：rift 欄位為「winner／reason／輪數／Wait 比例」；P＝player，E＝enemy，S＝survive，X＝eliminate。第 1 輪即最終，未重複跑無變動版本。

| 量測 | 改前 | 第 1 輪 | 最終 |
|---|---|---|---|
| rift seed 1 | P/S/30/0 | P/S/30/0 | P/S/30/0 |
| rift seed 2 | P/S/30/0 | P/S/30/0 | P/S/30/0 |
| rift seed 3 | E/X/22/0 | E/X/22/0 | E/X/22/0 |
| rift seed 4 | P/S/30/0 | P/S/30/0 | P/S/30/0 |
| rift seed 5 | P/S/30/0 | P/S/30/0 | P/S/30/0 |
| anchored 勝場／15 | 0 | 0 | 0 |
| anchored nmHits 合計 | 10 | 19 | 19 |
| skirmish hash | 修訂基準 | 5/5 相同 | 5/5 相同 |
| bench ms／步 | 2.81 | 3.08 | 3.08 |

改前 bench 359 commands、1010 ms；最終同 359 commands、1105 ms，hash 均為 `4cebde6a9b8ac4e3`，耗時比例 1.096。anchored 改前平均 3.6 輪，最終 3.8 輪；0 勝如實保留。

第 2 條授權來源是 `wf/inbox/orders/cx-aio-core.md` 的「2026-10-24 lead-ai-objective 裁定」：以目前工作樹（含別線未 commit 的 rules/turn.ts）＋改前 AI 為基準；不用再追規則差異。

原交接書 seed 1–5 hash 依序為 `8f41a98a49c552af`、`c55508653aa6fc8e`、`127ed772412326a5`、`cee385ea5a5937b8`、`c45430b95d7e7da8`。

同工作樹改前 AI 與新版 seed 1–5 均為 `cf880776eb4efe51`、`f7d262c08fce635e`、`127ed772412326a5`、`cee385ea5a5937b8`、`c45430b95d7e7da8`。seed 1、2 的來源是別線 rules/turn.ts「勝負已定後不再跑回合末鉤子／寫事件」；僅在診斷程序用 loader 讀取 HEAD 的該檔，即恢復原兩個 hash，未改動工作樹規則檔。

## 產出（檔清單）

本線共 7 檔；未 commit，未改其他線檔案：

- `src/ai/objectives.ts`：新增目標解析、倍率與移動價值。
- `src/ai/score.ts`：整合傷害、捕捉保留、移動及撤離評分。
- `src/ai/strategy.ts`：集火 priority 納入目標。
- `src/ai/policies/tactical.ts`：補入目標移動候選。
- `src/ai/index.ts`：匯出。
- `test/ai/objectives.test.ts`：16 條行為測試。
- `wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-core/REPORT.md`：本報告。

測試逐項對照（均在 objectives.test.ts）：

擊殺指定目標與集火：`killTarget 選目標而非等值另一個，集火 priority 同步且 params 可覆寫`。孵化源四種來源：`孵化源優先：part，只讀 view`、`孵化源優先：unitTag，只讀 view`、`孵化源優先：spawn，只讀 view`、`孵化源優先：summon，只讀 view`；同時確認不可見單位不列入孵化源。

守區三項：`hold 進區：目標候選突破 maxMoves 截斷`、`hold 在區內不離區追擊，移動後出手也扣離區分`、`hold 優先攻擊區內敵人`。

護送及撤離三項：`escort 往出口走並在出口撤離`、`reachExit 往出口走並在出口撤離`、`escort 護衛不離被護送者超過 escortRange`。敵方護送攻擊與攔截：`敵方 escort 優先攻擊並攔截出口，敵方 hold 向區內爭奪`，也檢查 contest 權重。

盟軍三項：`盟軍 slot 共享玩家 killTarget`、`盟軍不打死 capture 目標，但可打殘`、`盟軍不停在玩家護送出口格`。空目標相容性：`目標全空或只有 eliminate 時分數逐位元等於舊公式`，也檢查 onComplete:lose 不加權。

反證是實際執行的記憶體 mutation，未寫回原始碼：令倍率回傳 1 得 8 fail；令位置加分回傳 0 得 7 fail；移除 spare 懲罰得 1 fail；移除出口 retreat 優先得 2 fail；對位置價值強加 1 得 4 fail（含空目標舊公式）。五次程序均 exit 1，聯集涵蓋全部 16 條；原版直接執行 `node test/ai/objectives.test.ts` 為 16 pass／0 fail。測試本身亦逐項將相關 params 歸零作反事實比較。

原始證據在 `/tmp/cx-aio-core/`：`objectives-direct.log`、`red-{target,move,spare,retreat,empty}.log`、`ai-sim-tests.log`、`typecheck-final.log`、`npm-test.log`；量測為 `rift-before.log`、`rift-round1.log`、`anchored-old-ai.log`、`anchored-round1.log`、`skirmish-old-ai.log`、`skirmish-step1.log`、`skirmish-old-turn.log`、`bench-before.log`、`bench-final.log`。改前 AI 對照透過 `/tmp` 的 Node registerHooks 載入 git HEAD 四個舊 AI 模組，不覆蓋工作樹；mutation.mjs 同樣僅在程序中替換源碼。凍結檔已複製至 `/tmp/cx-aio-core/frozen.json`。

## 沒做到或證據不足的

未能聲稱沙箱外驗收已完成：交接書指定由領導重跑。沙箱預設 node --test 只列測試檔層級（objectives 顯示 1 test），因此以直接執行及 --test-isolation=none 取得實際斷言計數。

`npm test` exit 1：104 個檔案層級結果，101 pass、3 fail，失敗檔為 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/sim/golden.test.ts`。未越界修改或宣稱全套通過；此輸出不足以判定每個失敗的根因。依交接書另跑本線與 test/ai、test/sim，實際 108 條全過。

anchored 沒有增加勝場，只有巢母命中增加；未調整內容、規則、十分律或傷害公式。測試採確定性最高分選擇，並非宣稱任何隨機 band、參數或戰場下都強制滿足護送半徑。sentinel／swarm 保留原有守點／母體距離限制，透過共用評分與候選入口取得目標資訊。

依交接書禁區未更新 spec、code map 或其他 wf 文件，未跑超出六條驗收的檢查。

## 需要決定的事

無新增決策。hash 基準已由領導 orders 裁定；領導依原約重跑沙箱外 AI／sim 與 typecheck，並負責 commit。

以後交接書該點名的工具：`node --test --test-isolation=none`（避免沙箱僅回報測試檔計數）；Node `registerHooks`（同工作樹改前 AI 對照與反證，無須改動其他線檔案）。
