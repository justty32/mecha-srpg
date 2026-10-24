# cx-ui-vm：純邏輯層與固定 24 個測試完成

## 做了什麼

依 contract §3／§4 實作互動 session、玩家視角 ViewModel、controller、資料驅動快捷鍵、中文事件／拒絕原因與決定性大地圖。session 記錄玩家及 AI 成功指令，支援 replay hash 驗證；controller 可純靠 dispatch 將 skirmish-whitegloves 玩至結局。未新增驗收條目或測試數。

固定驗收證據：vm 五支測試恰好 24 個 `test()`，24／24 通過，最後一次耗時 6287.99 ms（與全專案測試同時執行）。`npm run typecheck` 在本線程式完成時通過，但 REPORT 收尾時因其他線新增 RulesRuntime.allies 而在範圍外的測試替身失敗，見下段。`npm test` exit 0，沙箱回報 59／59 檔案項目通過、fail 0、17046.08 ms。依交接書，沙箱外的最終計數及型別驗收由領導重跑。

匯出介面與 contract §3 一致，`index.ts` re-export 全部模組與共用型別。非測試檔的 `rules/`／`ai/` 命中只在 `session.ts`。每個檔案完成後均執行 typecheck 及 inbox_poll；依交接書未 commit。

格子只顯示我方及玩家 visible 內的敵人；敵方層 HP 僅讀 revealed，未偵察為 null。敵方人物、資源池、效果不輸出；日誌略過完全不可見敵方的事件。短名規則：可見人物駕駛機體取駕駛員名首字＋機體名首字；無駕駛員時取機體名前兩字；怪獸取 species 名前兩字（以 Unicode 字元切分）。

## 產出（檔清單）

以下 12 檔均在 `src/ui-adapter/vm/`，程式與測試合計 49,396 bytes；連本 REPORT 共 13 個新檔，總量低於 120 KB。

- `keymap.ts`、`text.ts`、`session.ts`、`debug-maps.ts`
- `viewmodel.ts`、`controller.ts`、`index.ts`
- `keymap.test.ts`（6）、`text.test.ts`（2）、`session.test.ts`（5）
- `viewmodel.test.ts`（5）、`controller.test.ts`（6）

REPORT：`wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-vm/REPORT.md`。
完整測試輸出：`/tmp/cx-ui-vm/vm-tests.log`、`/tmp/cx-ui-vm/npm-test.log`。

## 沒做到或證據不足的

沙箱外計數未執行，由領導依契約重跑。共享工作區開工時已存在 package、tsconfig、wf 等改動，作業期間也有其他線的 ops／content／DOM／e2e 變更，因此整個 `git status --short` 不可能只列本線新檔；本線實際寫入只限上列 12 檔、REPORT 與授權 inbox 回報，沒有修改凍結的 `types.ts`、`keymap.json` 或其他線檔案。未執行 GUI／瀏覽器操作。

收尾重現：專案根執行 `npm run typecheck`，出現 `test/ai/stub-rules.ts(34,5): error TS2741: Property 'allies' is missing ... but required in type 'RulesRuntime'.` 本線無權修改該測試或 core 型別；需由變更 RulesRuntime 的線同步其 fixture，才可宣告最新整合型別驗收通過。

## 需要決定的事

無設計決策。請領導協調 RulesRuntime.allies 的 fixture 接縫修復並重跑 typecheck；code-map 與提交亦由領導統一處理，本線遵守不改其他 wf 文件與不 commit 的範圍。

## SPEC-GAP 清單

1. sim 尚無逐步互動 API：依領導契約將直接規則／AI 存取集中於 session。
2. 規則不維護玩家陣營知識：session 沿用 AI 的 updateKnowledge／observe，在初始化及成功指令後更新玩家知識，不新增事件或消耗 RNG。
3. FactionKnowledge 未提供敵方人物、池、效果、控制權：省略這些詳情，控制權標未知；不可見位置取 lastSeen，完全未知用 (-1,-1)。可見單位的短名依交接書使用內容定義。
4. UiAction 沒有部位選擇：部位能力採宣告順序第一個合法部位，仍透過 checkAbility 驗證；不改 types.ts。
5. ScenarioDef 沒有 name：controllerForScenario 的標題用情境完整內容 id；沒有寫死中文情境名稱。

## snapshot 效能

Node v24.14.1，`bigMapSim(db, 160, 1)`，viewport 40×25。建立 controller 後先暖身 10 次，再量 101 次 `snapshot()`；時間使用 `node:perf_hooks` 的 performance.now，排序取第 51 筆，無效能斷言。

中位數 **1.791094 ms**（門檻 < 20 ms），最小 1.319093 ms、最大 17.844397 ms。此為同一狀態的 idle snapshot，包含 1000 格產生、dirty 比對、資訊卡、指令與日誌；指令可用性依回合／actionSeq／事件長度快取，不包含 AI 推演。大地圖使用 base 地形、兩台玩家及兩台敵人，雙方距離 > 100 格；決定性與 createBattle／session 可建立已包含在既定 viewport 測試。

## 以後交接書該點名的工具

無。
