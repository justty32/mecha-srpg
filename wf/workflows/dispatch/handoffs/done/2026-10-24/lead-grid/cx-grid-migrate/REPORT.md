# cx-grid-migrate 交付報告

日期：2026-10-24。上線：lead-grid；團隊：teams/grid。驗收僅採交接書固定六條；件數 gate 採 orders 的 200 件。未 commit。

## 做了什麼

營運狀態改為 version 2：船用 `pos/path/mpCarry/drifting`，地點用 `places`；每張圖初始化稀疏 `blight/known`，`patches/actors` 初始化空表。加入動態地點入口 `placeDef/requirePlace/allPlaces`，讀取優先採 `PlaceState.dyn`。

移動改為逐格尋路與每日 MP、一次燃料扣款、蝕域成本／遭遇、跨圖等船與到站票價；航行設定不推進時間。停泊、服務、契約、裂縫、常備軍、戰場地形抽樣改用格位置。文字支援地點／座標／actor 與 via，MCP 回傳座標，UI 依地點座標縮放且不畫舊路線。模擬政策及不變量、黃金戰役同步更新。

完整檔清單按模組排序於 [files.json](files.json)，包含內容結構、程式、測試與本報告。用 `python3 wf/tools/tabledb.py wf/workflows/dispatch/handoffs/lead-grid/cx-grid-migrate/files.json --slice 0 12` 分頁讀取；所有表均為 `wf-table/1`。件數與新檔容量見下方最終驗收記錄。上游預搬地圖／地點／航道、`worldgen.test.ts` 路徑修正與別線改動未算入本線。

內容只改結構鍵與引用，未改名稱、敘事文字、events 檔。沒有實作第三波蝕塊、行動者、迷霧或 GridView。`travel.ts`、`nodes.ts` 保留單行 re-export；新實作在 `move.ts`、`places.ts`。這符合 orders 對唯讀 `.git` 的處理指示。

## 產出

固定八類新測試的精確名稱與檔案在 [tests.json](tests.json)：連續天數、分段不會更快、每日燃料、等 7 與七次等 1、遭遇／選項凍結、不可進格、跨圖等船、三型 sail 格式往返。前七類在 `world/travel.test.ts`，第八類在 `text/format.test.ts`，均通過；模擬另覆蓋位置不變量正反例。

固定六條驗收記錄如下。

驗收 1：`npm run typecheck` exit 0；交接書指定舊型別／`ship.at`／`ship.route`／`s.nodes` grep 零命中。證據 `/tmp/cx-grid-migrate/final-typecheck.log`、`obsolete-references.log`；最後測試 fixture 的 requirePlace 等價替換亦通過 typecheck，見 `/tmp/war-api-typecheck.log`。

驗收 2：`npm run check` exit 0；戰鬥內容 0 errors／12 warnings，營運內容 0 errors／8 warnings，警告為既有內容數值／捕獲層等問題。證據 `/tmp/cx-grid-migrate/check-final.log`。

驗收 3：完整 `npm test` 跑完，137 個測試檔中 134 通過、3 失敗、0 cancelled，exit 1；失敗僅為下述 MCP CLI／MCP stdio／worldgen 的 sandbox 類型，依交接書例外交領導於沙箱外重跑。證據 `/tmp/cx-grid-migrate/final-test.log`。原 18 組戰爭不變量全過，未減 seed／月份／timeout；完整該檔 5/5 的細項證據 `/tmp/interfaces-war-final.log`。測試檔級計數是交接書已知的 sandbox 顯示方式。

驗收 4：12 潮月模擬 exit 0、末行 OK，末三行附於下方。

驗收 5：八類測試存在並通過；精確名稱見 tests.json，證據 `/tmp/cx-grid-migrate/move-final.log` 與 `/tmp/interfaces-fast-final.log`。

驗收 6：REPORT 與附表已落盤，本線共 140 檔，皆在允許範圍；低於 orders 的 200 件 gate，單一新檔最大不足 19 KB，低於 60 KB gate。SPEC-GAP 見本報告及索引。`npm run build` 亦 exit 0，證據 `/tmp/cx-grid-migrate/final-build.log`；這是交接書必用工具，未增加驗收條件。

`npm run sim:campaign -- --months 12` exit 0，最新證據 `/tmp/cx-grid-migrate/sim-final.log`，末三行原文：

```text
潮月 12 day=336 cash=29048.687999999995 debt=24000 人數=7 拘束艙生物機甲數=0 蝕化節點數=7 裂縫數=3 作戰=2 war=0 allied=0 釋出=25 join=0
war統計 {"enteredWar":1,"ceasefires":1,"PlaceTransferred":1,"OperationResolved":23,"maxOperations":3,"maxDays":28,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.6370370370370371,"errors":[]}
OK
```

已依指令執行 `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts`，五個戰役通過；前後 hash、事件數與天數見 [goldens.json](goldens.json)，執行證據 `/tmp/war-golden-final.log`。地點引用、事件名／位置 payload、逐格時間與外交作戰選取改變序列，因此重產 hash；沒有把 assertion 刪掉來接受失敗。

攻堅與尋殼維持 168 天；洩密維持第 6 天。背叛依新路程在第 10 天接到可用契約，保留 Betrayed、關係 −40 與黑名單驗證。傭兵參戰改用 salt-flat 可達戰場、顯式航行／等待，第 20 天完成；保留參戰／戰果／付款的順序驗證。其合成戰果在前三場增加敵軍擊破紀錄，使新護送路程下既有四場劇本達到成功進度，並更新 attachedLoss 預期。模擬黃金仍為第 31 天；遭遇黃金變動來自本格與八鄰格 terrainMix。

修正兩處模擬測試替身：假 runner 回報成功時也清除 pendingBattle，避免新凍結規則下無限停留。random 政策保留蝕域及撤離燃料，無可出戰單位的 greedy／merc 伏擊改為撤離；後者由原本 18 組戰爭模擬中的 merc seed 17、第 154 天重現，避免待處理伏擊下反覆 wait。

最後把測試 fixture 的地點讀取也統一為 requirePlace，相關 8 個測試檔通過（`/tmp/war-api-tests.log`），tick 單檔通過（`/tmp/cx-grid-migrate/tick-final.log`）。僅 DB 載入／檢查器與 grid 的資料載入測試保留直接讀取靜態 place，因該處尚無 CampaignState。

## 沒做到或證據不足的

完整 `npm test` 的 sandbox 限制依交接書例外交上游重跑，未宣稱沙箱外全綠。MCP CLI 未等到 socket ready，MCP stdio server 提前退出，worldgen 明確回報 `spawnSync node EPERM`；診斷分別在 `/tmp/cx-grid-migrate/mcp-cli-env.log`、`mcp-e2e-env.log`、`worldgen-env.log`。`npm run test:e2e` 的 webServer 啟動 exit 1，尚無瀏覽器驗證證據，見 `/tmp/interfaces-e2e.log`。未碰 GUI。

本波新增／承接的 SPEC-GAP：

蝕域暫由地點 footprint 外擴半徑查詢；裂縫保留 site/zones；maps/patches/actors 空容器留給第三波。`KnownCell` 採可序列化地形／地點／蝕域快照形狀，後續由迷霧線實際填值。

`carriesShip:false` 仍攜船跨圖，未分離月面載具。

常備軍 `speed` 是 `groundMp` 倍率；護送仍是同圖地盤地點間的抽象格路線，尚無商隊行動者。

野戰溢出戰利品暫寄裂縫 site，因殘骸容器仍掛地點。

`accompany.place` 依交接書改鍵，但值保留原靈魂樹節點意義；尚待契約釐清，不擅改陪伴玩法。

`waitRemaining` 區分使用者等待與路程估計 `pendingTicks`；沿用可序列化 `time.resume` 續完當日後半，確保批次等待一致。

世界係數沿用 `action/ops-world.rules`；core 地點失陷仍只對應現有蟲族勢力；作戰效果脈絡改為 `$place` 並保留 `$node` 相容。

修改檔中全部既有與新增的 SPEC-GAP 註解索引在 [spec-gaps.json](spec-gaps.json)，包含原有戰果、研發、效果與 ScenarioGen 的未定規格；既有缺口本波未擴做。舊 event.where 的 node/route 與條件 `$node` 別名是交接書要求的相容行為。

## 需要決定的事

領導在 sandbox 外重跑完整 `npm test` 與瀏覽器 E2E；收件時整理 `travel.ts → move.ts`、`nodes.ts → places.ts` 的 Git rename 與相容殼。code-map、spec 正文與第三波接口文件在本線寫入範圍外，由領導決定更新。上述 SPEC-GAP 不在本線追加實作。

## 以後交接書該點名的工具

`wf/tools/tabledb.py` 用於檔案、測試與 hash 清單；`node 某測試.test.ts` 可在 node --test 只顯示檔級失敗時取得實際 assertion；指令使用 stdout/stderr 重導檔案保留可交接證據。其餘已列必用工具，無新增驗收項目。
