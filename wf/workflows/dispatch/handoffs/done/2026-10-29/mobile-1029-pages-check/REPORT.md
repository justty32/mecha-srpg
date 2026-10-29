# GitHub Pages 可行性盤點

## 做了什麼

唯讀查 remote、GitHub 倉庫可見性、Vite／入口、路由、內容與儲存；未測試、建置或部署。

## 產出

`origin` 是 `justty32/mecha-srpg`，`gh repo view --json nameWithOwner,visibility` 回報 PUBLIC。`vite.config.ts` 未設定 base，預設根路徑；若發布為專案 Pages 子路徑，需設定 `/mecha-srpg/` 或適合的相對 base，再 build 並驗證產物資源路徑。`index.html` 的 `/src/ui-adapter/dom/main.ts` 是 Vite 編譯入口，應檢查 build 後輸出而非假設它原樣部署。沒有發現 `.github/workflows` 內既有部署工作流。

`src/ui-adapter/dom/main.ts`、`ops/dom/main.ts` 和 `dom/wiki/boot.ts` 以 `import.meta.glob` 打包內容，glob 的 `/content/` 為 Vite 專案檔案匹配鍵，不直接代表瀏覽器 fetch；現有 UI 未發現伺服器 API 呼叫。`vm/route.ts` 與 `dom/shell.ts` 使用 hash 路由，重新載入深連結不需要服務端 SPA rewrite。`ops/dom/main.ts` 使用 localStorage 保存戰役，戰鬥設定及快捷也在本機儲存；不同 origin 的 localhost 與 Pages 資料不共享，無跨裝置同步。

靜態 hosting 從程式結構看可行；最小工作是設定 base、建立授權的 build／Pages 發布流程、實際驗證子路徑資源與三頁流程，並確認使用者同意對外發布。此盤點沒有執行部署。

## 證據不足

未 build、未訪問網站、未驗 Pages 設定與子路徑下資源；`node:fs` 外部化由 Vite 設定註明瀏覽器不使用，仍需實際瀏覽器驗證。Pages 平台限制由 root 另查官方文件。

## 需要決定

使用者是否授權公開發布及採用的部署方式；同時確認既有 localhost 存檔不會自動轉移是否可接受。
