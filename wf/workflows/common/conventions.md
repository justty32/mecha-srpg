# conventions — 程式碼慣例（碰原始碼的工作流共用）

[common/README](README.md)｜[INDEX](../../INDEX.md)

碰原始碼的工作流（feature-dev / refactor / investigation）共用這套規矩：**寫碼時要遵守什麼**。哪個檔負責什麼領域、測試在哪 → [code-map](code-map.md)；真相層優先序也在 [code-map](code-map.md)。結構整理原則 → [STRUCTURE](../../STRUCTURE.md)。

## 慣例

| 項目 | 規矩 |
|------|------|
| 語言與模組 | TypeScript `strict`、ESM；純邏輯不碰 DOM，DOM 只在 ui-adapter |
| 模組邊界 | 依 spec 的 [architecture](../planning/specs/core/architecture.md)；新增模組先改 spec |
| 檔名 | kebab-case；測試同目錄 `*.test.ts` |
| 識別字與註解 | 識別字英文；註解與文件繁中 |
| 相依 | 不加執行期依賴；開發工具要加先問|
| 數值與平衡 | 不寫死在程式碼，走 `content/` 的 JSON |
| breaking change | 改公開簽名前 grep 全引用一起改 |
| spec 缺口 | 註解標 `SPEC-GAP`、選最小解法、寫進 REPORT |
