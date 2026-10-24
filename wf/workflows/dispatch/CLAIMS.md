# CLAIMS — 領地登記（活狀態）

[dispatch](README.md)｜交接書 [handoffs](handoffs/README.md)

由 [dispatch/README](README.md) 拆出：三張表是活狀態，隨每輪派線增減；線只能追加自己那一格。

## 現役

| 線 | 可寫目錄 | 唯讀 / 禁區 | 上線時間 |
|----|---------|------------|---------|
| `plan-ops-spec`（Fable 規劃）**中止（使用者重開程式），待重派，領地保留** | `wf/workflows/planning/specs/ops/` | 其餘唯讀；不 commit | 2026-10-24 10:30 |
| `lead-impl-ops`（Opus 領導；工人 `cx-ops-*`） | `src/ops/`、`content/base/world/`、`src/content/loader.ts`（只加一行略過 `world/`）、`wf/workflows/dispatch/handoffs/lead-impl-ops/`、code-map／testing 的 ops 段 | core 型別、`package.json`、`test/`、`content/base/`（world/ 以外）唯讀 | 2026-10-24 |
| `lead-impl-ui`（Opus 領導；工人 `cx-ui-*`） | `src/ui-adapter/`、`index.html`、`vite.config.ts`、`playwright.config.ts`、`tsconfig.ui.json`、`e2e/`、`tsconfig.json`（只加 exclude）、`package.json`（只加 ui scripts＋使用者裝的 devDependencies）、`wf/workflows/dispatch/handoffs/lead-impl-ui/`、dev-env／testing／code-map 的 UI 段 | 其餘唯讀 | 2026-10-24 |
| `lead-fix-scenario-ai`（Opus 領導；工人 `cx-fix-*`） | `src/rules/`、`src/ai/`、`src/sim/`、`schemas/content.schema.json`（只加 scenario `allies`）、`src/core/types-*.ts`（只新增欄位）、`content/base/`（world/ 以外）、`test/`、`wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/`、code-map／testing／roadmap 相應段 | core 型別（只新增）、spec、`package.json`／lock、`src/ops/`、`src/ui-adapter/` 唯讀 | 2026-10-24 |

## 保留給調度者，任何線都不得寫

| 目錄 | 理由 |
|------|------|
| `AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore` | 入口與適配層；多條線同時動會互相打架 |
| 頂層 `SPEC.md`／`PROJECT.md`／`README.md` | 設計契約與對外說明；改動走頂層決策 |
| `wf/`（含本表、`handoffs/`）| 線只能追加 ROSTER 與領地表自己那一格、寫自己的 REPORT |

## 歷史

2026-10-23 收線：`lead-techstack`、`lead-combat-ref`、`plan-world`、`lead-tome4-ref`；2026-10-24 收線：`plan-spec`、`lead-legacy-archive`、`plan-world-v2`、`lead-impl-foundation`、`lead-impl-content-base`、`lead-impl-rules`、`lead-impl-ai`、`lead-impl-sim`（`handoffs/done/2026-10-24/`；sim 線無交接書，契約與工人交接書在 `handoffs/lead-impl-sim/`）（交接書與完成證據在 `handoffs/done/2026-10-23/`）。

收線後的線記在 `handoffs/done/<日期>/`（交接書檔尾附完成證據）；堆多了在 `handoffs/done/README.md` 開索引表，只准追加。
