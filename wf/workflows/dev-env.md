# dev-env — 開發環境、指令、外部工具

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

這台機器上要能開發需要什麼、怎麼裝、跑什麼指令；外部工具設定與 env var 也收在這裡。

**何時用**：fresh clone、換機器、裝不起來、忘了指令、要加一個外部工具或環境變數。
**何時不用**：驗證 / 測試怎麼跑 → [testing](testing.md)；程式碼慣例 → [common/conventions](common/conventions.md)。

## Done when

- 照「流程（fresh clone 後）」走完，`node --version` 為 v24 以上，且 [testing](testing.md) 的快速驗證回傳 0。
- 下面三張表沒有空欄；要使用者親自做的（帳號、授權、金鑰）在 [WAIT_USER](../WAIT_USER.md) 各佔一行。

**目前環境（2026-10-29）**：使用者指定後續在 Ubuntu WSL 執行；PowerShell 曾找不到 vite，WSL 已正常。請在 WSL 的專案根執行 `npm run dev`，沿用既有依賴；不為此重裝 Windows 工具。啟動前檢查既有 Vite 與埠，保留使用者服務。

## 流程（fresh clone 後）

1. 確認 node 24（fnm 管理；專案根 `.nvmrc` 由實作線建立）：node 24 可原生執行 `.ts`（type stripping），不必 tsc 編譯。
2. `npm ci`：只有開發依賴（`typescript`、`vite`、`happy-dom`、`@playwright/test`，2026-10-24 使用者安裝，`-E` 釘版），沒有執行期依賴；再加任何套件屬「一定先問」。Playwright 用本機快取的 `~/.cache/ms-playwright/chromium_headless_shell-1248`（Manjaro 上跑 ubuntu24.04 fallback build，2026-10-24 實測可跑）。
3. 無 env var。
4. 冒煙：照 [testing](testing.md) 跑快速驗證。

## 指令表

| 做什麼 | 指令 | 備註 |
|--------|------|------|
| 跑單一 TS 檔 | `node <檔>.ts` | node 24 原生 type stripping |
| 跑測試 | `node --test` | 程式碼落地後的確切 glob 與 npm script 由實作線寫進 [testing](testing.md) |
| 本機開網頁版 | `npm run dev`，瀏覽器開 `http://localhost:5173/`（`?scenario=<id>&seed=<n>`；大地圖 `?scenario=debug-big&size=160`；百科 `#/wiki`，快捷鍵 F1／Shift+W；營運 `#/ops`（`?seed=<n>`；`&spectate=1` 出戰時全 AI 打））| vite 不自動開瀏覽器；agent 只准背景跑、不開 GUI |
| 內容索引 | `npm run content:index` | 流程 [content/batch](content/batch.md) |
| MCP server | `npm run mcp`（stdio；`.mcp.json` 讓 Claude Code 掛上）| 用法與無用戶端時的 `cli.ts` 見 [src/mcp/README](../../src/mcp/README.md) |
| 打包／預覽 | `npm run build`（輸出 `dist/`）→ `npm run preview`（`http://localhost:4173/`）| `node:fs` 外部化警告無害（瀏覽器只用 `loadPacks`）|

驗證與測試指令不列這裡——連同「誰跑」一起在 [testing](testing.md)。

## 外部工具與 env var

| 名稱 | 用途 | 怎麼取得 / 設定 |
|------|------|----------------|
| `codex`（codex-cli 0.163.0）| 工人線：`codex exec` 派 gpt 線 | 系統已裝；config 不改，旗標見 [codex-exec](dispatch/codex-exec.md)|
| `godot-mono` 4.7.2.stable.mono | Godot 驗證，**只准 `--headless`** | 系統已裝|
| `node` v24.14.1／`pnpm` 11.6.0 | 執行 TS 與 `node --test`（主要執行環境）| fnm 管理|
| `tmux` 3.7c | 互動式 codex 線（`wf/tools/cx_launch.sh`）| 系統已裝|

`codex`／`godot-mono`／`node`／`pnpm`／`tmux` 的版本是 2026-10-23 用各自的 `--version`（`godot-mono --headless --version`、`command -v tmux`）實查的。

需要帳號、付費、授權才能取得的：守鐵律 2（授權來源），並在 [WAIT_USER](../WAIT_USER.md) 記一行。

## 公司 WSL 局部環境（2026-10-28）

本機 Node v24.19.0（nvm）、Python 3.12.3；上表版本保留原家中歷史，不套用為公司現況。今天兩作沿用既有 Chromium 1243／Node 24 WebSocket 直接 CDP；Canvas 的官方 Ubuntu noble 函式庫只解壓在 ignored `node_modules/.canvas-headless/root`，不改系統。Konva 10.9.0、Three 0.186.1／esbuild 0.28.2 的局部工具及 npm cache 留在 ignored node_modules，收工不清除。來源與核驗細節見 [Canvas REPORT](../../art/canvas-mech/viewer/REPORT.md)／[3D REPORT](../../art/mech-3d/viewer/REPORT.md)。這些局部驗證不代表遊戲整合驗收；本次收尾不安裝、不重跑模型／瀏覽器／npm。

## 交接

- 環境就緒要開工 → [feature-dev](feature-dev/README.md)；先確認驗證跑得動 → [testing](testing.md)。
- 同一個裝機坑第二次撞到 → [common/gotchas](common/gotchas.md)。
