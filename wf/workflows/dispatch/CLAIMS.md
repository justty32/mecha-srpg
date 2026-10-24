# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `lead-content-battle`（工人 `cx-bat-field`、`cx-bat-scen*`）| `content/base/terrains/`、`content/base/maps/`、`content/base/scenarios/`、`content/base/aiprofiles/`（只新增）、`content/base/effects/bf-*`、`wf/workflows/dispatch/handoffs/lead-content-battle/` | `src/`、`content/base/world/`、單位內容、既有 `skirmish-*`／`rift-edge-*`、spec | 2026-10-24 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

2026-10-23 收線：`lead-techstack`、`lead-combat-ref`、`plan-world`、`lead-tome4-ref`；2026-10-24 收線：`plan-spec`、`lead-legacy-archive`、`plan-world-v2`、`lead-impl-foundation`、`lead-impl-content-base`、`lead-impl-rules`、`lead-impl-ai`、`lead-impl-sim`、`lead-integ-battle`（`handoffs/lead-integ-battle/`）、`lead-impl-ops`、`lead-impl-ui`（`cx-ui-*`）、`lead-fix-scenario-ai`（`cx-fix-*`）、`lead-ui-fix`（`cx-uifix-*`）、`plan-ops-spec`、`plan-spec-sync`、`lead-ops-bio-balance`（`cx-bio`、`cx-bal`、`cx-bal2`）、`lead-ui-session`（四線交接書與 REPORT 在各自 `handoffs/<線名>/`，領地列已移除）（`handoffs/done/2026-10-24/`；sim 線無交接書，契約與工人交接書在 `handoffs/lead-impl-sim/`）（交接書與完成證據在 `handoffs/done/2026-10-23/`）。

收線後的線記在 `handoffs/done/<日期>/`（交接書檔尾附完成證據）；堆多了在 `handoffs/done/README.md` 開索引表，只准追加。
