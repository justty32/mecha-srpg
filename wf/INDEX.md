# INDEX — mecha-srpg 專案地圖

mecha-srpg = **2108 地月機甲戰爭網頁文字 SRPG：純 TypeScript＋Vite、邏輯與 DOM 分離、node 裡 headless 可測**。本檔只描述**頂層**：每列一句話＋連結；目錄內部複雜就放它自己的 README / INDEX。

## Repo 佈局

| 路徑 | 內容 |
|------|------|
| `src/{core,content,rules,ai,sim,ui-adapter}/` | TypeScript 引擎，模組邊界依 spec architecture；領域分工見 [code-map](workflows/common/code-map.md)（未落地的模組標「規劃中」）|
| `content/base/`／`schemas/`／`test/scenarios/` | 內容資料包（JSON）／內容 schema／情境黃金測試；格式見 spec 的 content-format |
| `legacy/` | 舊版 Python 專案（程式碼、11 章教學、舊 SPEC）原樣封存，只讀、不維護 |
| `workflows/` | 工作流（派發見 [WORKFLOWS.md](WORKFLOWS.md)；共享區 [workflows/common/](workflows/common/README.md)）|
| `.claude/commands/` | slash 指令適配層（可選）。Claude Code 為例：只讀專案根的這層，非侵入式佈局也留在根；沒有 slash 機制的工具忽略本目錄，直接跑 `tools/wf-lint.sh` |
| `tools/` | kernel 工具：`wf-lint.sh`（檢查）、`tabledb.py`（資料檔 CRUD／連結）、`find_big_lists.py`、`fix_moved_links.py`；非侵入式佈局在 `wf/tools/`；資料檔契約見 [workflows/common/data-files.md](workflows/common/data-files.md) |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約入口（指向 [specs/core](workflows/planning/specs/core/README.md)）／定位與狀態／給人看的導覽 |
| `wf/archive/` | 封存：建立期的 [session_log](archive/session_log-2026-06-26.md)（2026-06-26，只讀）|
| 頂層 `package.json`／`tsconfig.json`／`.nvmrc` | 專案設定（無執行期依賴；由實作線建立）|
| `wf/inbox/` | agent 之間的信件放信處：`new/`＝給頂層的終局回報、`mail/`／`teams/`／`orders/`／`topics/` 用到才長出來、`done/`＝已處理；使用方式 [workflows/inbox/](workflows/inbox/README.md) |
| `wf/tools/`（multi-agent 部分）| inbox 腳本 `inbox_send.sh`／`inbox_read.sh`／`inbox_mail.sh`／`inbox_poll.sh`／`inbox_team.sh`／`inbox_ack.sh`／`notify_watch.sh`／`test_inbox.sh`；派線 `cx_launch.sh`／`cx_watch.sh`；交接書自查 `brief_lint.py`。對照表見 [dispatch/tool-index](workflows/dispatch/tool-index.md) |
<!-- wf-insert:INDEX -->

## 頂層文件

| 檔案 | 角色 |
|------|------|
| [WORKFLOWS.md](WORKFLOWS.md) | 派發器：意圖 → 工作流入口 |
| [STRUCTURE.md](STRUCTURE.md) | 結構整理參考（被動）：分層、膨脹即拆、四級成長、archive、工作流形式 |
| [SESSION-LOG.md](SESSION-LOG.md) | 我的 open 進度 |
| [WAIT_USER.md](WAIT_USER.md) | 等使用者親自做 / 驗證的事 |
