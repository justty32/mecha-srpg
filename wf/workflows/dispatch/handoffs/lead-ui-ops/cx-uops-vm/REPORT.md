# cx-uops-vm — DONE：營運 VM、兩段式出戰與存檔重播已完成

## 做了什麼

2026-10-24 第二次啟動，親自重讀更新交接書、orders、適用工作流、兩份 spec 與 ops／戰鬥 VM 原始碼；已發上線 PROGRESS，步驟邊界均輪詢。沿用上一輪檔案繼續實作，採更新後 glob 測試指令，沒有增加驗收項目。

實作 OpsController 公開 API、完整 OpsSnapshot、內容中文名／拒絕原因、房間與補充指令按鈕、快捷鍵、逐日／到事件推進、契約／市場／招募、獨立 layout.ts、編成與座位選擇、命名、兩段式互動出戰、auto 結算、戰果報告與存檔。出戰第一段捕捉 setup 後回滾；第二段 canonicalJson 比對 sortie、重現情境 RNG 消耗再回寫。所有正常指令走 applyCommand；戰果依 runCampaign 形狀記錄，Infinity 池上限轉 MAX_SAFE_INTEGER。

固定驗收第 1 條：`node --test 'src/ui-adapter/ops/vm/*.test.ts'` 最後一次 exit 0。完整 command 測試走 start/default seed 3、回應 prompt、advance:event、第 14 天 offered、接約、航行、編成、spectate:true 互動戰場、battleController().dispatch({type:"skip"}) 至 outcome、battleDone。斷言 report 非 null、BattleResolved 存在、契約不再 active，並檢查戰鬥未結束不能回寫、第一段 campaign 雜湊不變。

固定驗收第 2 條：相同流程 auto 通過；command 與 auto 戰後均 serialize→fromSave，以 campaignHash 斷言 state 相同，並確認存檔含戰果紀錄。

固定驗收第 3、4 條：測試在初始、prompt、契約、世界選取、編成與報告等快照檢查 enabled 且有 key 的按鈕 action 與 key() 深相等；合併鍵表無衝突，重複綁定反例能被擋。快照必填欄位與遞迴非 undefined 檢查通過；排版在反向輸入時一致、留 6% 邊界、任兩點距離至少 0.08。`npm run typecheck` 最後一次 exit 0（兩份 tsconfig 均通過）。

固定驗收第 5 條：`node --test src/ui-adapter/vm/boundary.test.ts` exit 0。沒有 import rules／ai。

固定驗收第 6 條：已查 `git status --short` 與本線展開清單。本線只新增下列 VM 檔、覆寫自己的 REPORT；另依授權使用 inbox 回報及輪詢。types.ts 是領導既有未追蹤檔，本線沒有改動，開場／收尾 SHA256 均為 `eac3fb486f51b8dc28b03238abfcce3c4c3881ecce5eb9c0fc461dd3c9326a65`。共享工作樹開場就有大量其他線變更，不能把整份 status 宣稱為本線獨占；完整收尾輸出保存於 `/tmp/cx-uops-vm-status.txt`。

## 產出

路徑前綴：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/vm/`。以下 10 個程式／資料／測試檔（含上一輪 5 檔），總計 728 行（連 JSON 計入），未觸發 14 檔／2200 行 gate。

- `index.ts`
- `controller.ts`
- `snapshot.ts`
- `formation.ts`
- `labels.ts`
- `keymap.ts`
- `keymap-ui.json`
- `layout.ts`
- `controller.test.ts`
- `viewmodel.test.ts`

本 REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/cx-uops-vm/REPORT.md`。試探腳本 `/tmp/cx-uops-vm-probe.ts` 本輪重新執行成功：第 14 天 offered，第 16 天抵達嶺口並能出戰；正式驗收證據來自上述 controller 測試。

## 沒做到或證據不足的

固定六條的本線驗收均取得證據。Node 沙箱摘要按兩個測試檔計數，因此不把摘要的「tests 2」宣稱為只有兩個情境；controller.test.ts 包含 command、auto、快照／快捷鍵三組，viewmodel.test.ts 包含鍵表與排版。失敗診斷曾直接執行同一 controller.test.ts 查看子測試斷言；不是新增驗收。

未跑 GUI、DOM、build、e2e 或額外全專案測試，遵守交接書固定範圍。未修改 types.ts、其他線檔案、內容或 ops API；未 commit。code-map／testing 文件仍由領導更新。

## 需要決定的事

無阻塞決策。依交接書保留三個 SPEC-GAP：節點缺座標採依 id 的簡單格點（月面右側），layoutNodes 接 nodes/routes，WorldView 只經此函式取得座標；自填命名成功後明確提示「自填命名尚無指令形式，本局無法存檔」，serialize 拋可讀錯誤，日後需 ops 增加可重播命名指令；ops 允許空控制機體，UI 編成拒絕 controlMode:none，避免無法操作的出戰。以上均有原始碼註解，未擅改凍結契約。

## 以後交接書該點名的工具

沿用本次修正的 `node --test 'src/ui-adapter/ops/vm/*.test.ts'`。沙箱只顯示檔級失敗時，可直接 `node src/ui-adapter/ops/vm/controller.test.ts` 查看相同測試的子斷言；驗收仍以原定 glob 指令的 exit code 為準，各指令個別保存回傳碼。
