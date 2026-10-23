# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `lead-impl-ai`（Opus，`ai`）| `src/ai/`、`test/ai/`、`package.json`（只 scripts）| `src/rules/`、`src/core/`、`src/content/`、`content/base/` 禁；可 commit `ai: ` | 2026-10-24 10:30 |
| `plan-ops-spec`（Fable 規劃）| `wf/workflows/planning/specs/ops/` | 其餘唯讀；不 commit | 2026-10-24 10:30 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

2026-10-23 收線：`lead-techstack`、`lead-combat-ref`、`plan-world`、`lead-tome4-ref`；2026-10-24 收線：`plan-spec`、`lead-legacy-archive`、`plan-world-v2`、`lead-impl-foundation`、`lead-impl-content-base`、`lead-impl-rules`（`handoffs/done/2026-10-24/`）（交接書與完成證據在 `handoffs/done/2026-10-23/`）。

收線後的線記在 `handoffs/done/<日期>/`（交接書檔尾附完成證據）；堆多了在 `handoffs/done/README.md` 開索引表，只准追加。
