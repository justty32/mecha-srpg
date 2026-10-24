# cx-uifix-vm：VM 回饋功能完成，38 條測試與 root 型別檢查通過

## 做了什麼

依交接書及 contract §1–§2 完成逐台 AI 推進、先聚焦再執行、跳過與 epoch 清除、按指令分批的路徑／攻擊／浮字、合併移動記錄及點記錄聚焦。Session 預設保留 autoAdvance true；controllerForScenario 使用 false。stepAi 與 advanceAi 共用 AI 初始化、startRound 與 runUnitTurn 邏輯，保留原本 advanceAi 的指令嘗試上限語意。

玩家行動後保留選取並提供 quickMenu；idle 點可達格移動；移動與主動能力皆不可用時自動待機。固定七個指令與不可用原因、standby／defer 語意、結束本輪確認及跨 AI 行動的自動 end 已接上。自動 end 仍記錄事件，但不排玩家待機演出。

敵方可見時保存即時部件／層血量，離開視野使用最後快照及 lastSeen 殘影。選部位流程、取消回目標模式、數字選部位、層種類中文名與新快捷鍵均已實作。types.ts 保持領導凍結版本，本線沒有修改。

驗證證據：開工前指定 VM 測試 24／24 通過；最後執行 `node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/*.test.ts'` 為 38／38 通過、0 失敗。既有 24 條保留，新增檔恰好 14 個 test()；宣告總數為 38。每次程式檔修改後執行 `npx tsc --noEmit`，最終 exit 0。最後輸出在 `/tmp/cx-uifix-vm-final.tap`，基準在 `/tmp/cx-uifix-vm-baseline.tap`。

新程式模組 1 個、新測試檔 1 個，加本 REPORT 共新增 3 個交付檔。VM 非測試檔合計 67,274 bytes，包含凍結 types.ts 與 keymap.json，低於 90 KB。

## 產出（檔清單）

以下路徑均相對 `/home/lorkhan/repo/game_dev/mecha-srpg/`：

- `src/ui-adapter/vm/session.ts`：逐台推進、事件批次及觀測通知。
- `src/ui-adapter/vm/controller.ts`：演出推進、行動流程、確認、選部位與快照。
- `src/ui-adapter/vm/presentation.ts`（新增）：共用可見事件篩選、記錄與演出整理。
- `src/ui-adapter/vm/viewmodel.ts`：敵方快照／殘影與固定指令選項。
- `src/ui-adapter/vm/keymap.ts`、`keymap.json`：新操作與加號解析。
- `src/ui-adapter/vm/labels.ts`、`text.ts`：層中文名與延後提示。
- `src/ui-adapter/vm/controller.test.ts`、`viewmodel.test.ts`：調整既有契約預期，條數不變。
- `src/ui-adapter/vm/feedback.test.ts`（新增）：交接書指定的 14 條測試。
- `wf/workflows/dispatch/handoffs/lead-ui-fix/cx-uifix-vm/REPORT.md`：本報告。

## 沒做到或證據不足的

交接書指定領導執行的沙箱外測試重算、root tsc 重跑、`npm test` 中 VM 以外的失敗對照，仍由領導收線時完成。本線沒有額外擴增驗收條數，也沒有跑瀏覽器、Playwright、dev server 或 commit。

工作樹開工時已有 types.ts、ops、wf 等其他線改動；本線僅寫上述程式／測試、REPORT 及指定 inbox 回報。全域 git status 的其他差異不屬本線，未還原。

## 需要決定的事

無阻塞、無需使用者裁示。領導可收線並進行交接書所列外部驗收。

## SPEC-GAP 清單

基礎內容包沒有 partAim 能力。依交接書允許的最小解，測試內建立 ContentDB 變體，分別驗證 target.kind unit 搭配 partAim.allowed，以及 target.kind part；正式內容與規則未改。測試註解已標 SPEC-GAP。

沿用既有界線：互動式逐步 API 與玩家知識刷新仍集中在 session；敵方池、人物、效果與控制權沒有對應知識，維持省略／未知。新需求的部件快照保存在 VM，透過指令前後觀測更新，不改規則知識語意。

## 新快捷鍵表

| 鍵 | 操作 |
|---|---|
| W | 待機：結束這台行動 |
| D | 延後：移到本輪隊尾 |
| E | 結束我方本輪；有未行動者再按 E 確認 |
| K | 跳過演出 |
| Esc | 取消；播放中跳過 |
| Enter／Space | 確認游標格；播放中跳過 |
| +／Shift++／= | 放大 |
| - | 縮小 |
| 0 | 自動貼合 |
| A | 切換動畫 |
| 1–9 | 能力；選部位模式改為選對應部位 |

固定 skip 按鈕依契約顯示 Esc，說明表亦保留 K 的獨立綁定；其餘既有快捷鍵不變。step 為宿主演出排程操作，parseAction 支援但無使用者鍵位。

## 以後交接書該點名的工具

無。
