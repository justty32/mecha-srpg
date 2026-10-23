# INDEX — mecha-srpg 專案地圖

mecha-srpg = **回合制機甲戰術 SRPG 起手專案＋11 章教學：Python 主體、可選 C++ 熱點（mtcore，pybind11）、python-tcod 打底**。本檔只描述**頂層**：每列一句話＋連結；目錄內部複雜就放它自己的 README / INDEX。

## Repo 佈局

| 路徑 | 內容 |
|------|------|
| `src/mecha_srpg/` | Python 遊戲套件（狀態機、系統、資料／生成）；領域分工見 [code-map](workflows/common/code-map.md) |
| `cpp/` | C++ 熱點 `mtcore`（命中／傷害／AI 評分／批次視線）＋ pybind11 綁定；選用 |
| `docs/` | 11 章教學 part0–part10，入口 [docs/README.md](../docs/README.md) |
| `workflows/` | 工作流（派發見 [WORKFLOWS.md](WORKFLOWS.md)；共享區 [workflows/common/](workflows/common/README.md)）|
| `.claude/commands/` | slash 指令適配層（可選）。Claude Code 為例：只讀專案根的這層，非侵入式佈局也留在根；沒有 slash 機制的工具忽略本目錄，直接跑 `tools/wf-lint.sh` |
| `tools/` | kernel 工具：`wf-lint.sh`（檢查）、`tabledb.py`（資料檔 CRUD／連結）、`find_big_lists.py`、`fix_moved_links.py`；非侵入式佈局在 `wf/tools/`；資料檔契約見 [workflows/common/data-files.md](workflows/common/data-files.md) |
| 頂層 `SPEC.md`／`PROJECT.md`／`INTEGRATION_NOTES.md` | 設計契約（唯一真相）／背景／介面分歧待辦 |
| `wf/archive/` | 封存：建立期的 [session_log](archive/session_log-2026-06-26.md)（2026-06-26，只讀）|
| 頂層 `pyproject.toml`／`CMakeLists.txt`／`requirements.txt` | 建置設定（scikit-build-core＋CMake）|
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
