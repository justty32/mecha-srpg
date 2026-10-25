# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| lead-ironsword（engine-backlog 25）| `content/base/world/models/ix-*.json`、`content/base/world/models/cx3-flyingfish-*.json`（飛魚 models 新檔）、`content/base/world/lineages/universal-ironsword.json`、`src/ops/war/`、`content/index/`（重產）、`content/lore/factions/third-blade.json` 只動 mechSeries 欄、黃金檔 `test/golden/`＋`test/campaigns/*.hash.json`＋`src/ops/sim/fixtures/campaign-hash.json`（重產；在 HEAD 隔離 worktree 跑，與 resist／tide-cal 錯開）、軌跡寫死數字的測試 `src/ops/sim/{campaign,health}.test.ts`、`src/mcp/campaign.test.ts`、`wf/workflows/dispatch/handoffs/lead-ironsword/` | rules/damage、武器標記（lead-resist）；曆／天象（lead-tide-cal）；lore 隱藏標記（lead-secret）| 2026-10-26 |
| lead-resist（engine-backlog 28＋近遠增傷）| `src/rules/{attack,layers,resistance}.ts`＋同名 test、`src/rules/flow.ts`（BattleSetup.rules）、`src/core/types-state.ts`（RulesRuntime 一欄）、`src/sim/{run,session}.ts`、`src/mcp/battle.ts`、`src/mcp/README.md`、`src/mcp/battle-info.test.ts`、`test/scenarios/combat-tenth.json`、`src/content/lint.test.ts`、`content/base/rules/{constants,damage-modifiers}.json`、`content/base/registries/layer-types.json`、`content/base/effects/pa-{melee,ranged}-boost.json`、`content/base/abilities/` 精粹等級欄（只加欄）、`test/scenarios/pack/`（只加欄）、戰鬥黃金 `test/golden/`＋`test/campaigns/*.hash.json`＋`src/ops/sim/fixtures/campaign-hash.json`（重產；與 ironsword／tide-cal 錯開）、types-def／content.schema 的 `AbilityDef.essence` 一欄（等 sonnet 提交後）、`specs/core/{rules-attack-resolution.md,rules-battle-flow.md,data-model-world/scenario.md,glossary.json,constraints.json}`、`specs/world/{resistance,operations}.md`、`code-map.json` rules 列、`wf/workflows/dispatch/handoffs/lead-resist/`、engine-backlog.json 第 28 列 | war（ironsword）、曆天象與 cockpit-growth（tide-cal）、lore（secret）| 2026-10-26 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

已收線的線一律在 [handoffs/done/README.md](handoffs/done/README.md)（日期、線名、一句結論、交接書與 REPORT 位置；只准追加）。2026-10-23 收 4 線、2026-10-24 收 39 線（含本表最後移除的 `lead-content-battle`、`lead-content-mech`、`lead-gaps-ops`），各線的附件夾已移 `handoffs/done/<收線日>/<線名>/`。
