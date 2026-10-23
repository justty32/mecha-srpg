# dev-env — 開發環境、指令、外部工具

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

這台機器上要能開發需要什麼、怎麼裝、跑什麼指令；外部工具設定與 env var 也收在這裡。

**何時用**：fresh clone、換機器、裝不起來、忘了指令、要加一個外部工具或環境變數。
**何時不用**：驗證 / 測試怎麼跑 → [testing](testing.md)；程式碼慣例 → [common/conventions](common/conventions.md)。

## Done when

- 照「流程（fresh clone 後）」走完，`python3 -m compileall -q src` 回傳 0。
- 下面三張表沒有空欄；要使用者親自做的（帳號、授權、金鑰）在 [WAIT_USER](../WAIT_USER.md) 各佔一行。

## 流程（fresh clone 後）

1. 建虛擬環境：`python3 -m venv .venv && . .venv/bin/activate`（或 `uv venv`）。
2. 安裝依賴：`pip install tcod numpy`（純 Python 路線）；要 C++ 加速改 `pip install -e .`。
3. 無 env var。
4. 冒煙：`python3 -m compileall -q src`，再 `PYTHONPATH=src python -m mecha_srpg` 開得出視窗。

## 指令表

| 做什麼 | 指令 | 備註 |
|--------|------|------|
| 安裝依賴 | `pip install tcod numpy` | 換 Python 版本或新 venv 時 |
| build（C++ 選用）| `pip install -e .` | 改 `cpp/` 後重跑；需 C++17、CMake ≥ 3.18 |
| 跑起來 | `PYTHONPATH=src python -m mecha_srpg` | 開 tcod 視窗；安裝後也可 `mecha-srpg` |
| 語法檢查 | `python3 -m compileall -q src` | 尚無 linter |

驗證與測試指令不列這裡——連同「誰跑」一起在 [testing](testing.md)。

## 外部工具與 env var

| 名稱 | 用途 | 怎麼取得 / 設定 |
|------|------|----------------|
| `tcod`（python-tcod）| 渲染、輸入、FOV、尋路、noise、亂數 | `pip install tcod`，≥ 16 |
| C++17 編譯器＋CMake ≥ 3.18 | 編譯選用的 `mtcore` | 系統套件；`pybind11`／`scikit-build-core` 由 `pip install -e .` 自動拉 |
| python-tcod API 分析 | 寫碼時的 API 依據 | `~/repo/pas/analysis/python-tcod/`（本專案外，唯讀參考）|
| `codex`（codex-cli 0.163.0）| 工人線：`codex exec` 派 gpt 線 | 系統已裝；config 不改，旗標見 [codex-exec](dispatch/codex-exec.md)|
| `godot-mono` 4.7.2.stable.mono | Godot 驗證，**只准 `--headless`** | 系統已裝|
| `node` v24.14.1／`pnpm` 11.6.0 | 前端或工具腳本（目前未用）| fnm 管理|
| `tmux` 3.7c | 互動式 codex 線（`wf/tools/cx_launch.sh`）| 系統已裝|

`codex`／`godot-mono`／`node`／`pnpm`／`tmux` 的版本是 2026-10-23 用各自的 `--version`（`godot-mono --headless --version`、`command -v tmux`）實查的。

需要帳號、付費、授權才能取得的：守鐵律 2（授權來源），並在 [WAIT_USER](../WAIT_USER.md) 記一行。

## 交接

- 環境就緒要開工 → [feature-dev](feature-dev/README.md)；先確認驗證跑得動 → [testing](testing.md)。
- 同一個裝機坑第二次撞到 → [common/gotchas](common/gotchas.md)。
