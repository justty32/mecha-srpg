# cx-grid-blight 交付報告

2026-10-24；團隊 teams/grid，上游 lead-grid。未 commit。依交接書固定六條驗收；採 16:45、16:50、17:01 orders 的必要相容範圍與 70 件 gate（黃金不計入）。

## 做了什麼

蝕域改存 `s.patches`，`RiftState.patches` 保持開裂順序；移除 `PlaceState.blight` 與 `RiftState.zones`。`blightAt` 查格索引，深度由核身分與塊齡推導；開局及讀檔重建索引。裂縫核由一格擴成裁地形的 3×3，擴散按族別與地形權重洪水填充；封印後每潮月 LIFO 退塊，菌絲最年輕塊未燃燒便不退。

新裂縫按各圖陸格數與 riftRate 分配泊松均值，落於邊緣或遠城野地；開裂建立動態裂縫口，閉合三分之一留下遺跡，其餘移除。城邦失守、收復與一潮月 recovering 由 footprint 判斷，市場／招募拒絕恢復中的服務。契約快照、作戰清蝕、效果清蝕、潮壓、文字與 MCP 改讀格上資料。孟買以 5×5 核、A 級蟲族、錨齡 8、40 個預長蝕塊開局。

完整改動檔清單在 [files.json](files.json)：共 61 件，扣除 9 件黃金後 gate 計 52 件；最大新原始碼檔約 8.4 KB，低於 40 KB。清單包含本報告與兩份資料表；其他線的 UI、keymap、map-panel、AI、inbox 改動不列入本線，也未還原。所有變更均在交接書或上游 orders 准許範圍。

## 產出

固定八類測試與兩掛鉤的精確名稱收在 [tests.json](tests.json)，另含孟買及動態裂縫口測試，共 12 條；執行證據 `/tmp/cx-grid-blight/blight-final.log`。索引不變量驗證包含刻意清空索引使檢查變紅，再重建變綠。小於七格的蝕塊為地形與已占用蝕塊封閉的餘隙，仍連通且最多十二格；三 seed 開局的短塊大小分別為 `1,2,2,1`、`1,1`、`1,6,4`。核塊依規格另採 1／9／25 格。

三個 seed 都以 `npm run sim:campaign -- --months 12 --seed N` 跑到 day 336 並印 OK。以下為最終版蝕格數；長陸陸格 16,300，15% 門檻為 2,445 格、每月 3% 為 489 格。

| 潮月 | seed 1 | seed 2 | seed 3 |
|---|---:|---:|---:|
| 1 | 363 | 445 | 419 |
| 2 | 392 | 499 | 471 |
| 3 | 440 | 569 | 536 |
| 4 | 492 | 628 | 608 |
| 5 | 573 | 731 | 690 |
| 6 | 657 | 806 | 792 |
| 7 | 733 | 917 | 908 |
| 8 | 823 | 1031 | 1028 |
| 9 | 929 | 1188 | 1199 |
| 10 | 1046 | 1339 | 1344 |
| 11 | 1169 | 1529 | 1529 |
| 12 | 1331 | 1727 | 1746 |

末月占比 8.17%／10.60%／10.71%；最大月增量 162／198／217 格。最終證據為 `/tmp/cx-grid-blight/sim1-final.log`、`sim2-final.log`、`sim3-final.log`。開局蝕格 373／394／388，孟買核各 25 格、半徑 25／24／22 格。

係數紀錄：新增 `rules.blight.patchSize=[7,12]`、菌絲每潮 2 塊、族別偏好、裂縫口命名及遺跡機率；深度採交接書要求的 `rules.nodes.deepMonths=2`。初次移除「只有九個地點可開裂」的上限時，先把 `pressure.poissonScale` 從 0.025 調到 0.0002。第一輪量測末月 2678／2527／2931 超標，之後只把蟲／獸 `spreadPerTide` 的錨齡係數 0.5 改為 0.25。複核發現潮海與雲嶂仍有 airCost，修正為蝕域專用禁入判斷後，完整重跑得到上表；先前量測不作最終證據。開局預長塊由試算 80 改為 40，使半徑符合要求。

黃金以指定 `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts` 重產並通過五戰役，證據 `/tmp/cx-grid-blight/golden-final.log`；營運短黃金另以其既有更新入口重產。攻堅 fixture 把孟買裂縫設 D 級／錨齡 0，維持成功拔錨與作戰完成的檢查，交手由三次變兩次；參戰以新世界重錄指令與合成戰果，維持附屬損失、勝利、付款與重播一致；背叛仍檢查 −40 聲望及黑名單。五黃金結束日依序為攻堅 158、尋殼 168、參戰 28、背叛 10、洩密 6。

固定六條驗收：

1. 指定舊欄位 grep 無命中；`npm run typecheck` exit 0（`obsolete-references.log`、`final-typecheck.log`）。
2. `npm run check` exit 0，營運 0 errors／8 既有 warnings；完整 `npm test` 跑完 140 個測試檔：137 過、3 個已知沙箱失敗、0 cancelled，exit 1（`/tmp/cx-grid-blight/final-test.log`）；依交接書例外交領導在沙箱外重跑。
3. 八類屬性測試與兩天象掛鉤全部通過（`blight-final.log`、測試名資料表）。
4. 三 seed 12 潮月全部 OK，末月與月增量皆低於門檻（上表）。
5. 孟買 footprint 5×5 全核、三 seed 半徑 25／24／22 格，測試通過。
6. REPORT 與改動清單已落盤；全在交接書／orders 範圍內，件數與新檔容量未達 gate。

## 沒做到或證據不足的

`SPEC-GAP`：本線依交接書而非舊 spec，城邦失守僅將 offered 契約 expired；active 契約不擅自 failed。閉合裂縫口採三分之一變 ruin、其餘移除。現有世界只有蟲族裂獸勢力，其他族占領仍共用該 owner。收復金搜尋未找到按退塊付款入口，依 16:50 orders 保留每退塊一筆 PlaceReclaimed，不新增金錢。

`SPEC-GAP`：孟買約東經 73°、北緯 19°，依地圖線投影約 (109,102)；為使 5×5 footprint 不含海，沿用該線允許 ±4 格挪動的原則落在 (111,101)。未改地圖。作戰舊欄 `containedPlaces` 暫存蝕塊 id，避免擴動戰爭型別；事件 PlaceBlighted／PlaceReclaimed 沿用既有名稱，以 patch 欄區分蝕塊增退。

新增蝕塊的 RNG 序列揭露 random 政策在 seed 7／day 80 的 pending operation 永遠選 map。依 17:01 orders，改成優先合法 drop，解除待出戰。原卡住的兩輪測試已中斷；最終測試另行完整執行。`src/ops/sim/campaign.test.ts` 原有三 seed × 六潮月不變量測試修後全過，未縮減 seed／月份。

完整測試僅 MCP socket CLI、MCP stdio、worldgen 子行程失敗，分別是等待 socket ready 的 assertion、stdio server 提前退出，以及 `spawnSync node EPERM`，符合交接書已知沙箱限制；診斷分別在 `/tmp/cx-grid-blight/env-cli.log`、`env-e2e.log`、`env-worldgen.log`。本線不宣稱沙箱外完整 suite 已綠。

## 需要決定的事

領導於沙箱外重跑完整 `npm test`，並在收線 commit 時同步 code-map／spec：這些 wf 路徑在本線禁區。未增加其他驗收項；不含 actors、fog、UI、其他大陸或內容文案。

## 以後交接書該點名的工具

`node 某測試.test.ts`：沙箱內 `node --test` 只列檔級失敗時顯示實際 assertion；`wf/tools/tabledb.py`：寫檔案與測試清單。其他必用工具已列，無新增。
