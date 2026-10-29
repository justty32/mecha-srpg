# 任務：完成手機頁面與雙平台地圖拖曳及快捷操作

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，依入口親自讀 feature-dev、dispatch、team-model、testing、conventions、code-map、common/user 及 working 偏好；實質工人亦須親讀，簡單雜活除外。

## 背景與唯一目標

使用者接受上一輪畫面與玩法「合格、先這樣」，本輪完成手機可用的遊戲頁面。最高優先為戰場與營運世界地圖都可手指／滑鼠拖曳；加入最近使用與自行釘選的我的最愛，桌面亦可用。不重新設計玩法或平衡。

## 範圍（排除法寫死）

可寫產品只限 `src/ui-adapter/dom/`（含 wiki）、`src/ui-adapter/ops/dom/`、`src/ui-adapter/vm/` 的非 wiki 現有控制器及視圖型別、`src/ui-adapter/ops/vm/`、`e2e/battle.spec.ts`、`e2e/ops-map.spec.ts`、`e2e/ops-campaign.spec.ts`、`e2e/wiki.spec.ts`、`index.html`。領導先據實盤點，在子線交接書明列檔案，避免同檔多人寫。

產品件數 gate 40 檔、容量 gate 5 MB。超過任一先回報主線；不是要求湊滿。隊長可寫本 brief、本輪 `lead-mobile-1029/` 與 `mobile-1029-*` 交接附件、`wf/workflows/planning/specs/mobile-ui-1029.md`、既有 specs/core 導航、code-map.json、SESSION-LOG、WAIT_USER、CLAIMS 與 done 索引；本輪文件附件最多 30 檔、10 MB。資料清單超過 1 KB 用 tabledb 契約，導航留 md。

不做：core/rules/sim/AI、content、art/legacy、套件／lock／Vite 設定、跨裝置帳號同步、PWA／原生 app、網際網路部署、全新百科功能。不擴張到其他 workflow 的歷史待辦。原有三份 10/28 untracked review logs 不動。

## 必用工具

| 工具 | 用途 |
|---|---|
| 原生 collaboration 工具 | 派工、監看與終局回報，不走外部 inbox |
| `python3 wf/tools/brief_lint.py` | 每份交接書 strict 驗證 |
| `node --test` | testing 規定且受本輪影響的測試，串行 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件驗證，既有兩條 legacy 外部壞鏈獨立記錄 |
| `git log --oneline`、`git status --short` | 明確路徑提交與收線核對 |

## 資源與禁區

可寫程式碼線。領導 gpt-6.1-sol；規劃／視覺設計 gpt-6-astra；普通實作 gpt-6.1-sol；簡單盤點與雜活 gpt-6.1-terra。子代理上限 5 個，平行工人最多 3。先讓 astra 給可實作的手機／觸控設計，再實作；盤點可並行。

全隊測試／重工作同時最多一個，由領導發時段；nice19、單 worker。可用現有 Playwright/Chromium headless，禁止桌面 GUI、OS 鍵鼠或截取使用者畫面。不安裝依賴，不停止使用者 dev server；開始先盤點 5173／5174，需測試服務則自己持有並收工關閉。無外部查證需要，不上網搜尋。

可明列路徑 commit 到 main 並 push（使用者已授權）；禁止 git add -A、目錄級 add、branch、rebase/reset 他人改動、刪檔、改全域設定。沿用既有依賴與 Vite 掃描入口修正。

## 工作

先設計手勢與快捷操作契約：手機單指及桌面主鍵拖地圖，閾值區分點選／拖曳；拖曳不能攻擊、移動單位或下航行命令；取消／指標離開後可恢復正常操作。地圖外正常頁面捲動，保留既有縮放與鍵盤操作。世界地圖一區一文字、迷霧權限與座標投影必須保留。是否需要雙指縮放由設計依既有能力判斷，非必做門檻。

最近使用自動記錄實際啟用的常用操作；我的最愛可釘選／取消，使用穩定指令身分存於當前瀏覽器，刷新保留，儲存不可用時仍可操作。戰鬥／營運使用適當的操作集合，禁止儲存上次目標或直接重送舊遊戲命令。可用性及目標選擇沿現有控制器；釘選手勢不可執行指令，危險操作保留既有確認。避免新面板擠占手機地圖。

手機範圍包含戰鬥、營運及百科既有頁面的基本可讀與可操作；主力在前兩者，百科不做功能擴充。普通手機 360／390／430px、橫向及桌面回歸，避免橫向溢出、遮蔽必要控制、依賴 hover 才能使用。astra 審最終 headless 頁面產物，圖檔保持少量。

## 交付

REPORT 直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mobile-1029/REPORT.md`，含做了什麼／產出／證據不足／需要決定四段，保留精簡可追溯測試結果。設計寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/planning/specs/mobile-ui-1029.md`。開工登記 SESSION／CLAIMS；使用者已驗收上一輪遊玩頁面，清除 WAIT_USER 的對應 10/29 待評閱，其他待辦不動。

## 驗收（固定 5 條）

1. 戰場與世界地圖在滑鼠及 touch 均能真正拖曳改變視野；實測拖後無誤命令、輕點仍正確、取消後正常，含邊界／縮放後座標。
2. 最近使用可更新去重，我的最愛可增減並刷新保留；切換操作者／頁面不重送舊目標或繞過禁用條件，儲存故障仍可使用。
3. 360／390／430px 與手機橫向的主操作可達、無整頁水平溢出；桌面戰鬥／營運／百科既有主流程可用，astra 最終圖審無阻擋。
4. 相關 UI／手勢／偏好測試、必要 typecheck/build 與有界 headless 回歸通過；全程唯一測試 runner，不重跑無關 33 分鐘核心套件，無新 wf-lint 硬違規。
5. 明確路徑 commit/push，HEAD 與遠端一致，本輪工作樹無遺留，原三 logs 保留；自身測試服務全停，子線收線與連結有效，回報最終 hash／報告位置。

## 完成／阻塞回報

原生工具向 root 回報，需擴範圍或遇實際阻礙先說具體證據。測出問題先修本輪，不任意回滾別人檔案。領導持續監看至全部工人終局，收尾只做必要紀錄，避免冗長文件潤飾。

## 完成證據

產品7478bd35已push；本線原生工具已終局。UI DOM231/231、正式批次28/29；最後touch三連1/3，圖外模擬pointerdown觀測限制未宣稱全綠，依主線16:48裁示帶限制交付。精確證據及主線後續見lead-mobile-1029/REPORT.md。
