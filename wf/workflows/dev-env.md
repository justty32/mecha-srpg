# dev-env — 開發環境、指令、外部工具

[WORKFLOWS](../WORKFLOWS.md)｜[INDEX](../INDEX.md)

這台機器上要能開發需要什麼、怎麼裝、跑什麼指令；外部工具設定與 env var 也收在這裡。

**何時用**：fresh clone、換機器、裝不起來、忘了指令、要加一個外部工具或環境變數。
**何時不用**：驗證 / 測試怎麼跑 → [testing](testing.md)；程式碼慣例 → [common/conventions](common/conventions.md)。

## Done when

- 照「流程（fresh clone 後）」走完，`node --version` 為 v24 以上，且 [testing](testing.md) 的快速驗證回傳 0。
- 下面三張表沒有空欄；要使用者親自做的（帳號、授權、金鑰）在 [WAIT_USER](../WAIT_USER.md) 各佔一行。

## 流程（fresh clone 後）

1. 確認 node 24（fnm 管理；專案根 `.nvmrc` 由實作線建立）：node 24 可原生執行 `.ts`（type stripping），不必 tsc 編譯。
2. 不安裝任何套件：沒有執行期依賴，測試用 node 內建 test runner。之後要加開發工具（Vite、happy-dom、Playwright）屬「一定先問」。
3. 無 env var。
4. 冒煙：照 [testing](testing.md) 跑快速驗證。

## 指令表

| 做什麼 | 指令 | 備註 |
|--------|------|------|
| 跑單一 TS 檔 | `node <檔>.ts` | node 24 原生 type stripping |
| 跑測試 | `node --test` | 程式碼落地後的確切 glob 與 npm script 由實作線寫進 [testing](testing.md) |

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

## 交接

- 環境就緒要開工 → [feature-dev](feature-dev/README.md)；先確認驗證跑得動 → [testing](testing.md)。
- 同一個裝機坑第二次撞到 → [common/gotchas](common/gotchas.md)。
