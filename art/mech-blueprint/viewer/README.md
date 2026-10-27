# 展示腳本片段

公開入口仍為上層 `viewer.js`：初始化資料、選件、結構樹及共用繪圖工具。`drawing.js` 負責舞台與疊圖，`controls.js` 負責模式與動作控制，`diagnostics.js` 負責診斷清單。

這些是同一閉包的建置期片段，共享入口的資料與函式；不是瀏覽器獨立載入的 ESM。`build-viewer.ts` 依入口的 `@inline` 標記順序讀取並展開，最後交給 `render.ts` 內嵌於 HTML。不要加入執行期 import、fetch 或外部 script。
