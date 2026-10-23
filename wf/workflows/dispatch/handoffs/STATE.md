# STATE — 調度者交棒（2026-10-24，使用者重開 Claude Code）

**誰在跑**：無。`plan-ops-spec`（Fable 規劃線，營運層 spec）被中止；`wf/workflows/planning/specs/ops/` 有它寫到一半的檔（未 commit），lint 曾報其中三處條列 >1 KB，屬它自己的驗收範圍。

**已收線、已 commit**：rules（164 測試、6 黃金、typecheck）、ai（接上真規則）、content-base。main 上 `npm test` 164 過 0 敗、`npm run check` 0 錯、`npm run typecheck` 0 錯。

**下一步**：
1. 重派 `plan-ops-spec`（交接書 `handoffs/plan-ops-spec.md` 仍有效）：告訴它接手 `specs/ops/` 半成品、已轉達的補充裁示（沙盒自由航行、古代無名以神話命名、機械系命名分階段）要吃進去。
2. 開整合＋模擬器線（spec 切線 7）：`src/sim/{run,replay,save,cli}.ts`、不變量測試、重播一致性；一併處理三個整合缺口——無駕駛員怪獸 controlMode `none` 不行動（改「本能控制」交 AI）、13 個常數從 `test/scenarios/pack/` 回到 `content/base/`（含步兵／士氣／失控內容，刪測試包重複、重產黃金 hash）、`aiprofile/pack-hunter` 指向既有 policy 或新寫。領地：`src/sim/`、`src/rules/`（修正）、`src/ai/`（修正）、`content/base/`、`test/`。
3. UI 線等使用者授權 vite／happy-dom／Playwright。

**誰監看**：無人。接手者讀完本檔即刪。
