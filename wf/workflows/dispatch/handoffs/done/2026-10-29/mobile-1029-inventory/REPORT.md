# 手機介面唯讀盤點

## 做了什麼

讀取交接與工作流、查實際 DOM、測試及本機瀏覽器檔案；未執行測試、npm、服務或瀏覽器。

## 產出

- 戰鬥：`src/ui-adapter/dom/render.ts` 的 `mountBattle` 管 `.board-viewport`、委派 click→`clickCell`、wheel→`scroll`、resize；`board.ts` 畫格，`zoom.ts` 算縮放，`panels.ts`／`menus.ts` 管指令和選單。`style.css` 已有 759px 以下規則，但後段多次覆寫，手機應檢查最終 cascade。建議一線持有 `render.ts`、`style.css`、對應 `dom/input.test.ts`、`e2e/battle.spec.ts`。
- 營運：`src/ui-adapter/ops/dom/world-map.ts` 的 `mountWorldMap` 管 `world-scroll`、click→`mapCursor`、雙擊→`map:sail`、wheel→`mapZoom`；格尺寸 `24 * zoom`，`paintLabels`／overview 投影及 `ResizeObserver` 需保留。`ops.css` 已有 760px 規則。建議另一線持有 `world-map.ts`、`ops.css`、`ops/dom/render.test.ts`、`e2e/ops-map.spec.ts`；拖曳後需攔 click 和 dblclick，否則可能航行。
- 快捷操作與偏好牽涉 `dom/render.ts` 的 `command.enabled`／`command.action`、`ops/dom/render.ts` 的 `registeredAction`、`ops/dom/ui.ts` registry；穩定 id 與當前可用 action 必須重新解析。建議獨立檔保存偏好，由上述兩線各自接入各自 render，或由單一整合者接入，避免同檔並寫。戰鬥同時掛在 `dom/main.ts` 與 `ops/dom/battle-host.ts`，偏好須覆蓋兩個入口。`localStorage` 既有容錯可參考後者。
- 外殼及百科 `dom/shell.css`、`dom/wiki/wiki.css` 可獨立一線，搭配 `e2e/wiki.spec.ts`；營運流程 `e2e/ops-campaign.spec.ts` 留領導整合。測試集中由領導串行，避免與實作寫檔衝突。
- 本機存在 `node_modules/@playwright/test`、`playwright`、`playwright-core`，快取有 `chromium-1243` 和 `chromium_headless_shell-1243`；`playwright.config.ts` 設單 worker headless、4174 build/preview，註解卻稱 1248，實際可啟動性和版本匹配未驗。可用工具清單沒有專用瀏覽器互動工具，已有專案 Playwright 可供領導實測。

## 證據不足

未執行瀏覽器與測試，無法宣稱觸控、視覺、快取版本相容及頁面寬度通過；現有 e2e 多為桌面流程及世界地圖座標／標籤，須補滑鼠、touch、取消、縮放、誤命令、儲存故障與手機尺寸驗證。

## 需要決定

由設計線決定具體手勢閾值、快捷集合與手機布局；領導確定偏好共用檔及各 render 接線的檔案持有權。overview ¼ 倍及雙指行為依設計契約明定，避免破壞現有點選放大。
