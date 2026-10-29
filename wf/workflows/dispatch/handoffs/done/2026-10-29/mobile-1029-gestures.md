# 任務：實作戰場與世界地圖雙平台安全拖曳

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，親讀 feature-dev、dispatch、testing、common/conventions、common/code-map、common/user、user/working，再讀母交接 `wf/workflows/dispatch/handoffs/lead-mobile-1029.md` 與設計 `wf/workflows/planning/specs/mobile-ui-1029.md`。

## 背景與唯一目標

實作戰場與世界地圖雙平台安全拖曳。使用者已接受玩法，禁止改玩法及數值。原生 collaboration 派工回報；普通實作 sol，簡單CSS收斂terra。

## 範圍（排除法寫死）

只寫：src/ui-adapter/dom/map-drag.ts、map-drag.test.ts、render.ts、input.test.ts（均在dom）；src/ui-adapter/ops/dom/world-map.ts；e2e/battle.spec.ts、e2e/ops-map.spec.ts，及自有 REPORT。不做：沒列的任何檔案不寫，尤其core/content/art/legacy/package/Vite配置和其他wf。件數 gate 14 檔；容量 gate 2 MB；任一超過停下回報。不刪檔。

## 必用工具

| 工具 | 用途 |
|---|---|
| `rg` | 讀引用與現有契約 |
| 原生 collaboration | 協調檔案移交與終局 |
| `git diff --check` | 本線空白驗證 |

## 資源與禁區

可寫程式碼線，只寫明列路徑。子代理上限0，全隊平行最多3工人。禁止任何測試／npm／typecheck／build／瀏覽器啟動，由領導唯一runner串行驗證。不得停止使用者5173/5174服務；不GUI、不碰鍵鼠螢幕、不上網、不安裝依賴、不改全域配置、不刪檔、不commit/push、不branch/rebase/reset。

## 工作

依 mobile-ui-1029 設計接 Pointer Events 8px 閾值、capture、cancel、離開與click/dblclick抑制。CSS由layout線持有，請用helper設element.style.touchAction/cursor等必要手勢屬性，或傳需求由layout改。不要寫CSS。render.ts最後釋出予shortcuts。新增真Chromium mouse及CDP touch測試，包含拖後無命令、輕點恢復、cancel/邊界/zoom座標。不得啟動任何測試，領導統一跑。

## 交付

REPORT 直接寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/mobile-1029-gestures/REPORT.md`，四段：做了什麼／產出／證據不足／需要決定。寫完明列修改路徑與建議領導跑的有界測試。

## 驗收（固定3條）

1. 產品符合母交接與設計，保持既有控制器可用性與遊戲行為。
2. 測試程式覆蓋本線正反例，未啟動測試；diff check無空白錯誤。
3. 自有報告存在，工具回報DONE與路徑，禁止留下自行服務。

## 完成／阻塞回報

原生 collaboration 回報DONE/BLOCKED，問題先修本線，不能回滾別人修改。等別線持續用工具，不結束回合假等待。

## 完成證據

產品7478bd35已push；本線原生工具已終局。UI DOM231/231、正式批次28/29；最後touch三連1/3，圖外模擬pointerdown觀測限制未宣稱全綠，依主線16:48裁示帶限制交付。精確證據及主線後續見lead-mobile-1029/REPORT.md。
