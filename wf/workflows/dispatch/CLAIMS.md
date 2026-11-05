# CLAIMS — 領地登記（活狀態，只列現役）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出。**只列現役線**：線上線時追加自己那一列，收線時由調度者整列刪掉；不留歷史表（收線證據在收線 commit 訊息，git log 可查）。

## 現役線

| 線 | 誰 | 可寫 | 備註 |
|----|----|------|------|
| fix-playtest-1105 | Opus（隔離 worktree `.claude/worktrees/`）| 該 worktree 內 `src/`、`content/`、`code-map.json` 等試玩修正範圍 | 完成後由頂層 merge；依據 [playtest-1105](handoffs/playtest-1105/REPORT.md) |
| test-prune-1105 | 原生 agent | `test/`、`src/**/*.test.ts`、`wf/workflows/testing.md`、`wf/notes/investigations/test-prune-1105/` | 測試刪減 |
| slim-1105 | 原生 agent（調度者授權）| `wf/`（上兩列除外）、`art/*/evidence`、`legacy/`、頂層文件的 legacy 句、`.gitignore` | 文件瘦身；不動 `src/`、`test/`、`e2e/` |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與本表自己那一列、寫自己的 REPORT |
