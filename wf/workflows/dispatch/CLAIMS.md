# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `lead-techstack`（Opus 領導，團隊 `techstack`）| `wf/workflows/dispatch/handoffs/lead-techstack/`、`/tmp/lead-techstack-spike/`、ROSTER 自己那格、`wf/inbox/` | 其餘全部唯讀；不 commit | 2026-10-23 21:40 |
| `plan-world`（Fable 規劃線）| `wf/workflows/planning/specs/world/`、`wf/workflows/dispatch/handoffs/plan-world/` | 其餘全部唯讀；不 commit | 2026-10-23 22:20 |
| `lead-combat-ref`（Opus 領導，團隊 `combatref`）| `wf/workflows/dispatch/handoffs/lead-combat-ref/`、ROSTER 自己那格、`wf/inbox/` | 其餘全部唯讀；`~/repo/moddings/battle-brothers` 唯讀；不 commit | 2026-10-23 21:40 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

收線後的線記在 `handoffs/done/<日期>/`（交接書檔尾附完成證據）；堆多了在 `handoffs/done/README.md` 開索引表，只准追加。
