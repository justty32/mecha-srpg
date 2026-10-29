# 手機布局、雙平台地圖拖曳與快捷操作契約

母交接： [lead-mobile-1029](../../dispatch/handoffs/done/2026-10-29/lead-mobile-1029.md)。不改玩法、數值、迷霧權限、座標投影與命令確認規則。

## 方案與取捨

共用 Pointer Events helper，轉既有視野動作。維持格子化視野，不加慣性／雙指縮放；保留縮放按鈕、滾輪、鍵盤。手機資訊垂直捲動，地圖固定高度。快捷只存穩定 id，不存命令、操作者、目標、座標。

## 手勢契約

`dom/render.ts` 的 `mountBattle` 綁 `.board-viewport`；`ops/dom/world-map.ts` 的 `mountWorldMap` 綁 `.world-scroll`。地圖格子／空白可開始，按鈕、選單、輸入、連結、縮圖除外。限單一主要 pointer，滑鼠主鍵或單指。起始至當前直線距離達 8 CSS px 才拖曳，不累計 move 距離；pointerdown 不發命令並暫停 hoverCell／mapHover，避免移游標或重建目標。

跨閾值才 capture 至穩定容器，保留輕點原生 click。以起始指標、起始視野及固定格寬算總位移，格數向零截斷；手指右移，視野左移，只於格數改變派動作。邊界由控制器 clamp。戰場 `setViewport` 是左上座標；世界 `worldAction` 的 **mapViewport 是中心跳轉，不能當左上 setter**，應以 mapScroll 送目標左上減最新快照左上的差。世界格寬 `24 * zoom`，戰場用 cellSize；實際 viewport 必須變化。

容器 capture 階段吞該拖曳產生的 click／dblclick（世界 dblclick 會 map:sail），不吞下一次正常 pointerdown 後輕點與鍵盤 click。即使邊界不能移動，超閾值仍吞點擊。pointercancel、lostpointercapture、失焦、隱藏／銷毀清狀態；capture 後離開仍接 up，未 capture 離開可取消。多指加入取消，全部放開前不發命令。縮放、resize、切圖取消舊手勢，下次重算格寬。

僅地圖表面設 touch-action:none／文字選取防護，不套 body、整頁或按鈕區；圖外 swipe 正常捲頁。全顯示小圖與世界¼全圖沒有可平移空間，超閾值仍吞點擊；全圖輕點用 worldMapContentRect 扣 object-fit 留白再跳轉。縮圖保留原點選，不加拖曳。

## 手機布局

760px 以下單欄，保留既有深色視覺與資訊名稱。全站容器 `min-width:0`，長標題與數值可換行；禁止以 body overflow-x:hidden 掩蓋溢出。點擊控制目標至少約 44px 高，地圖格子除外。主要互動不能只藏在 hover tooltip；disabled 原因可在快捷列、檢視區或可展開說明直接閱讀。

戰鬥順序：回合／操作者、地圖、訊息、指令／快捷、部位與記錄。地圖直向約 clamp(240px,45dvh,420px)，短橫向約 200px，其餘垂直流。快捷不覆蓋地圖；指令兩欄或換行，部位／記錄可收合。確認、選部位與 quick-menu 限寬可捲，邊緣格觸發也不可出螢幕。

營運日期、位置、推進可達，facts／分頁／工具換行，次要裂縫／佇列不占首屏大半。世界圖在細節之前；`.world-map-col` 固定可量測高度，`.world-wrap` 手機自動高度。`ops/dom/battle-host.ts` 返回鈕須留空間，不壓戰鬥縮放／指令。

百科沿用 `wiki/mount.ts` 的側欄開關，不增功能。窄窗搜尋、返回、側欄開關都可見；表格在區域內橫捲、長鍵值換行。全站導航在 360px 可達，使用者頁面縮放不受 viewport meta 禁止。

## 最近使用與我的最愛

戰鬥／營運分 scope，各最近 6 筆、最愛 8 筆。最近新使用移首、去重；釘選保持使用者加入順序，滿額時提示先取消其他項，不擅自替換。預設一行可展開的「快捷操作」，展開含我的最愛、最近使用與可釘選操作；無資料時顯示簡短空狀態。星號是獨立 button、明確 aria-label 與 aria-pressed，不使用長按、不巢狀 button；釘選事件不執行命令、不改最近。

第一版戰鬥白名單為 `move`、`ability:<abilityId>`、`standby`、`defer`、`end`；能力必須解析至當前 commands 的 `beginAbility`，不能只靠 id 前綴放行。沿現有控制器決定操作者、選目標與合法性。排除 attackFeature、interact、throwDebris、engagePresence、eject、retreat 與確認／選部位。`end` 仍走當前 enabled 與既有 onAction／確認路徑（10/29 主線裁決），不新增確認。

營運第一版白名單是既有 `tab:<tab>` 導航與世界的 `map:center`、`map:layers`、`map:maps`（對應 `mapCenter`、`mapLayers`、`mapMaps`）。不納入 sail、dock、wait、accept、交易、存讀檔、出戰或舊目標。不納 mapMinimap（缺 OpsButton 可用性資料）；不可掃描所有 DOM 按鈕建立可重播 catalog。

顯示與啟用都查最新 snapshot catalog。最愛不在本次操作者／頁面的命令集合時保留但 disabled，顯示「目前無此操作」，仍可取消釘選。busy、確認框、營運 prompt／sortie／report／showHelp 等會擋一般操作時，快捷同步禁用，不以 stale enabled 執行。按下快捷要再解 id→當前 option、核 enabled、送現有 onAction；不得捕捉上次 action closure 後長期重用。

記錄語義是「使用者實際啟用一個目前允許的白名單操作」，包括按鈕、快捷列與鍵盤；僅 render、釘選、disabled click、取消與系統自動 step 不記。進入選目標即算啟用能力，不假稱已命中；同一入口只記一次。在 `dom/main.ts`、`ops/dom/main.ts`、`ops/dom/battle-host.ts` 的統一 send 於 dispatch 前查當前 option 與可用性，再派發並記錄。其他接法也須涵蓋鍵盤與營運出戰。

持久化 key 建議 `mecha-srpg.ui.shortcuts.v1`，內容只含版本與 scope 的 id 陣列。讀寫 localStorage 連取得 property 都 catch；格式驗證、去重、限長、移除不允許 id；惡意字串只 textContent。storage 不可用時以記憶體維持本次操作，遊戲不得因此中止；刷新保留僅在儲存可用時成立。

## 整合邊界

`dom/command-preferences.ts` 管 scope、record、togglePin、訂閱與儲存；`dom/command-shortcuts.ts` 畫 `{id,label,enabled,reason}` catalog 並回呼 `onActivate(id)`。render 不攜帶持久化動作；DOM 只 import vm types。實際 API 名稱依實作，安全契約不變。

A 手勢、B 快捷、C responsive 的正式交接書是唯一寫入領地來源，不在此重列。戰鬥 render 已由領導於 A 完工後移交 B；CSS 同時只由 C 寫，B 提供 class 契約。統一 send 須涵蓋獨立戰鬥、營運與營運出戰，避免重複記錄。

## 步驟與驗證

先凍結 helper／快捷 API 再實作；測試由領導唯一 runner 排程，規劃線不跑。以下對照母交接五條驗收。

1. 用真mouse／CDP touch驗兩圖視野、無誤命令、輕點、取消、邊界、縮放與圖外捲頁；保留迷霧及¼圖投影。
2. 驗最近去重、釘選／滿額／刷新、當前可用性、end確認與storage故障；audit核對命令不重送。
3. 驗360／390／430、844×390與桌面控制可達、無整頁橫溢，保留三頁流程並由astra審少量圖。
4. 跑相關UI／手勢／偏好、typecheck／build及有界headless，strict無新增硬違規，不重跑無關核心套件。
5. 明列路徑commit／push，核遠端一致、工作樹、原logs、自有服務及子線終局；回hash與報告。
