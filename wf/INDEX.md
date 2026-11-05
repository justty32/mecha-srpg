# INDEX — mecha-srpg 專案地圖

mecha-srpg = **2108 地月機甲戰爭網頁文字 SRPG：純 TypeScript＋Vite、邏輯與 DOM 分離、node 裡 headless 可測**。本檔只描述**頂層**：每列一句話＋連結；目錄內部複雜就放它自己的 README / INDEX。舊版 Python 專案已從工作樹刪除，要看就到 git 歷史。

## Repo 佈局

| 路徑 | 內容 |
|------|------|
| `src/{core,content,rules,ai,sim,ops,mcp,ui-adapter}/` | TypeScript 引擎（戰鬥核心、內容載入、規則、AI、模擬、營運層、MCP server、UI 轉接），模組邊界依 spec architecture；領域分工見 [code-map](workflows/common/code-map.md) |
| `content/{base,lore,index,batches}/` | 內容資料包（JSON）／世界觀 lore／生成式索引（`npm run content:index` 重建，不手改）／批次帳本；入口 [content/README](../content/README.md) |
| `schemas/` | 內容 schema；格式見 spec 的 content-format |
| `test/`、`e2e/` | node 測試（情境黃金、戰役、AI、fuzz）／Playwright 瀏覽器測試；跑法見 [testing](workflows/testing.md) |
| `scripts/` | `heavy-lock.sh`（重負載互斥）與 `content/` 量測腳本（stats、sweep、scenario-measure）|
| [art/](../art/README.md) | 美術試作（SVG、mech-blueprint、Canvas、3D），未接遊戲 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約入口（指向 [specs/core](workflows/planning/specs/core/README.md)）／定位與狀態／給人看的導覽 |
| 頂層 `package.json`／`tsconfig*.json`／`vite.config.ts`／`playwright.config.ts`／`.nvmrc`／`.github/` | 專案設定與 Pages 部署（見 [dev-env](workflows/dev-env.md)）|
| `.claude/` | Claude Code 適配層（slash 指令、隔離 worktree）；沒有 slash 機制的工具忽略本目錄 |
| `wf/workflows/` | 工作流（派發見 [WORKFLOWS.md](WORKFLOWS.md)；共享區 [workflows/common/](workflows/common/README.md)；規劃與 engine-backlog 在 [planning](workflows/planning.md)）|
| `wf/tools/` | kernel 工具：`wf-lint.sh`（檢查，在地 hook `wf-lint-local.sh`）、`tabledb.py`（資料檔 CRUD／連結）、`find_big_lists.py`、`fix_moved_links.py`；內容閘門 `content_gate.py`／`content_accept.sh`／`content_index.py`；inbox 與派線腳本（對照表見 [dispatch/tool-index](workflows/dispatch/tool-index.md)）；資料檔契約見 [data-files](workflows/common/data-files.md) |
| `wf/inbox/` | agent 之間的信件放信處：`new/`＝給頂層的終局回報、`mail/`／`teams/`／`orders/`／`topics/` 用到才長出來、`done/`＝已處理（只留本機）；使用方式 [workflows/inbox/](workflows/inbox/README.md) |
| [wf/notes/](notes/README.md) | 調查證據與待審閱問題；不代替設計契約或驗收結果 |
<!-- wf-insert:INDEX -->

## 頂層文件

| 檔案 | 角色 |
|------|------|
| [WORKFLOWS.md](WORKFLOWS.md) | 派發器：意圖 → 工作流入口 |
| [STRUCTURE.md](STRUCTURE.md) | 結構整理參考（被動）：分層、膨脹即拆、四級成長、過時就刪、工作流形式 |
| [SESSION-LOG.md](SESSION-LOG.md) | 我的 open 進度 |
| [WAIT_USER.md](WAIT_USER.md) | 等使用者親自做 / 驗證的事 |
