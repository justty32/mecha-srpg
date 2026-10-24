# cx-sim-engine：sim 跑局、重播、存檔與 CLI

STATUS：DONE。sim 實作、22 項測試與 CLI 實測完成，最新全專案 typecheck exit 0；沙箱外重算由領導執行。未 commit。

收尾紀錄：初次 DONE 信與 typecheck 在同一 shell 依序執行，當時其他線正在新增的 ops 檔使 typecheck 暫時失敗，shell 未中止而先送出了信。發現後獨立重跑確認錯誤，準備阻塞回報期間最新 typecheck 已恢復 exit 0，故未寄出 BLOCKED；再補送此更新版 REPORT，維持 DONE。sim 測試／CLI 證據不受影響。

## 做了什麼

依 contract §2 實作情境轉換、AI／script 跑局、指令重播、AI 重跑比對、內容包 hash、存檔與 CLI。部署先保留固定格，再由 seeded PCG32 分配區域格；人物實例按單位與座位分開。跑局只記錄成功指令，回傳拒絕數、停止原因與規則層的戰果。maxSteps 計算實際嘗試送出的指令，防止拒絕迴圈；預設 10000。

五支測試恰好 22 個 test()，分配為 run 5、replay 4、save 5、cli 3、invariants 5。最終測試只載入 content/base；Infinity 案例使用 base 的記憶體複本，把 hound 的 heat.max 設為 null，由規則正常產生 Infinity，未修改內容檔。

不變量使用固定 seed 1–20、隨機 2–6 單位及位置、2×3 地圖、最多五輪。從 base 的 hound／infantry／tidewolf／nestmother 組合出情境，以 previewCommand／checkAbility 篩合法候選再隨機抽取；每單位每輪最多十六個動作後送 end，不抽召喚能力，維持小情境。逐指令保存狀態，五個測試分別遍歷同一批軌跡。包含真實 broken 層與貢獻，並以損壞 source 的負例確認檢查會失敗。

contrib source 的「存在」定義：當前狀態仍記錄的 unit／person id（含已死亡但未刪除的實例）、已載入的內容定義 id、目前 unit／person／pending／fieldEffects 中 EffectInstance 的 `fx:<uid>`，或單位 sustained 清單仍包含該能力的 `sustain:<unit>:<ability>`。不接受已消失的效果或只因字串前綴相同就算存在。

固定驗收證據：

1. `node --test --test-isolation=none --test-reporter=tap 'test/sim/*.test.ts'` exit 0：22 tests／22 pass／0 fail／0 skipped，35.240 秒。五項不變量單跑為 7.282 秒（20 seeds）；完整輸出在 `/tmp/cx-sim-engine/sim-tests.tap` 與 `/tmp/cx-sim-engine/invariants.tap`。每個檔完成後均跑 typecheck 與 inbox_poll；最新 typecheck exit 0，收尾曾出現的並行 ops 錯誤已消失。`npm test` exit 0、0 fail；沙箱預設 isolation 的摘要是 36 個檔案，不將它誤報成完整 test() 數，輸出在 `/tmp/cx-sim-engine/npm-test.tap`。
2. 匯出名稱／簽名與 contract §2 一致，index 統一 re-export；rules／ai 只從指定入口匯入。src/sim 無 ui-adapter import 或 DOM 型別，test/sim 無測試內容包路徑命中。
3. `npm run sim -- --scenario scenario/skirmish-whitegloves --seed 1` 連跑兩次 exit 0，hash 均為 `f754e05183afd077`；20 輪 timeout 平手，enemy／player 各存活 4。輸出在 `/tmp/cx-sim-engine/skirmish-{1,2}.log`。
4. `git diff -- package.json` 只有新增 `"sim": "node src/sim/cli.ts"` 一行，dependencies／devDependencies 不變。
5. 本 REPORT 含四段、SPEC-GAP 清單與實測段落。新增 12 檔，程式與測試共 41,931 bytes，加 REPORT 仍低於 120 KB gate。

## 產出（檔清單）

所有路徑以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根。新增程式為 `src/sim/run.ts`、`src/sim/replay.ts`、`src/sim/save.ts`、`src/sim/cli.ts`、`src/sim/index.ts`。

新增測試為 `test/sim/run.test.ts`、`test/sim/replay.test.ts`、`test/sim/save.test.ts`、`test/sim/cli.test.ts`、`test/sim/invariants.test.ts`，輔助為 `test/sim/helpers.ts`。加上本檔 `wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-engine/REPORT.md`，共 12 個新檔。修改 `package.json` 僅新增一行 sim script，依賴不變。

## 沒做到或證據不足的

曾短暫見到 `src/ops/state/ledger.ts(28,41): error TS18048: 'value' is possibly 'undefined'.`，當時 `git status --short -- src/ops/state/ledger.ts` 為 `??`。本線未寫入該檔；之後全專案 typecheck 已恢復 exit 0，因此此項目前不構成阻塞。

沙箱外的測試計數與耗時由領導重跑，本線不宣稱已完成沙箱外驗收。未修改 rules、ai、content、core、schemas、其他測試線或 wf 導航；code-map 的 sim 導航仍由領導更新。

## 需要決定的事

BattleSetup 沒有 faction Def 對照、外交關係、map globals 或 scenario.rules 接收欄位，因此 sim 沿用既有規則行為。rift-edge-nest 的 ally 不是規則層明確的同盟，hostile 目前只比較 owner；需後續決定如何承接 faction relations。

rift-edge-nest 的 killTarget 使用 `params.target = monster/nestmother-landlord`，規則 objectiveDone 只讀 `params.unit` 的實例 id。sim 依契約原樣複製 objectives，未擅改目標；該目標目前不會完成，另有 survive 目標可結束戰鬥。重現入口是 scenarioToSetup 產生的 setup.objectives 與 rules/objectives.ts 的 objectiveDone。

## SPEC-GAP 清單

RLE 文法未指定，採「正整數＋單一非數字 glyph」，允許空白分隔；展開後長度必須恰為 width×height。

人物 Def 可重複出場，人物實例 id 採 `<unitId>-<seatId>`，角色轉成 bodyplan 中可接受該角色的第一個空座位。部署及 slot 遍歷順序固定。

features 原樣附於 map.cells 覆蓋列表；BattleSetup 沒有 featureHp 接口，既有 createBattle 只讀 at／terrain，feature.hp 暫不生效。faction、globals 與情境規則覆蓋同樣沒有規則層入口，未改範圍外介面。

ContentDB 不保留每包規則／登記表的來源。packHash 對該包完整定義及 metadata，加上合併後的有效規則／登記表做 canonicalJson＋fnv1a64；因此其他包改規則也會保守地令此包 hash 改變。需要精確的單包原始 hash 時，應由 content 層保留來源資料。

JSON 非有限數字編碼為 `{"$sim":"number","value":"Infinity"}`，亦支援 -Infinity／NaN；本來帶 $sim 欄位的物件用 object 標記及 entries 轉義，避免 campaignBlob 撞碼。snapshot 驗證比對完整編碼狀態，不只比較日誌；包不符且有 snapshot 時採 snapshot 並明確警告未重播驗證。

## rift-edge-nest 50 輪實測

指令：`npm run sim -- --scenario scenario/rift-edge-nest --seed 1 --rounds 50`，exit 0。以 shell 的 `date +%s` 前後差計時，牆鐘耗時 119 秒；本環境沒有 /usr/bin/time，改用上述計時後只執行一次此 CLI 實測。

第 30 輪由 player 達成 survive 勝利，所以未用滿 50 輪上限。存活數為 ally 0、enemy 18、player 4；事件共 7,123 筆，包括 AbilityUsed 416、LayerBroken 26、PartBroken 9、UnitDied 3、Retreated 3。日誌 hash 為 `1cba515912ff7f91`。輸出與耗時在 `/tmp/cx-sim-engine/rift-50.log`、`/tmp/cx-sim-engine/rift-50.time`。此實測不計入 22 個 test()；完整 test/sim 仍為 35.240 秒。

## 以後交接書該點名的工具

無。
