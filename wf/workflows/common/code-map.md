# code-map — 程式碼導航 index（哪個檔負責什麼）

[common/README](README.md)｜[INDEX](../../INDEX.md)

碰原始碼前先查這張表，只讀相關領域列出的檔；動完再照維護鏈把表更新回去。寫碼慣例本身在 [conventions](conventions.md)。

## 領域表

程式碼尚未落地的模組標「規劃中」，落地後把該列改成實際檔名與測試位置。模組邊界與允許的依賴方向以 spec 的 [architecture](../planning/specs/core/architecture.md) 為準。

| 領域 | 檔案 | 職責 | 測試在哪 |
|------|------|------|---------|
| core | `src/core/` | 型別（Def／State）、`Id`、`BattleState`、事件型別、seeded RNG、`EventLog`、NumExpr 求值器；不依賴任何模組 | `src/core/*.test.ts`（已落地 2026-10-24）|
| content | `src/content/`、`schemas/`、`content/base/` | 載入 pack、schema 驗證、id 解析、唯讀 `ContentDB`；內容資料與 schema | `src/content/*.test.ts`（已落地 2026-10-24）|
| rules | `src/rules/` | 回合、攻擊、資源、效果、人物、戰局結算；對外只暴露 `tryCommand`／`previewCommand`／查詢 | 規劃中 |
| ai | `src/ai/` | 陣營知識、候選生成、估值、可插拔策略；只用 rules 的查詢與 preview | 規劃中 |
| sim | `src/sim/` | headless 跑局、重播、存檔序列化、驗收模擬 | `test/scenarios/`（規劃中）|
| ui-adapter | `src/ui-adapter/` | ViewModel、可視區、指令輸入、DOM 渲染（唯一碰 DOM 處）| 規劃中 |

## 真相層優先序

各專案可以改自己的優先序，但必須明確。預設：

```text
code/tests > spec（specs/core）> code map > docs > generated
```

- 上層與下層衝突時，**以上層為準並修正下層**。
- generated（產生出來的檔、html）永遠不是唯一真相。
- 原始來源與摘要衝突時，以**原始來源**為準。
- code map 是**導航不是規格**；行為以 code/tests 為準。

## 維護鏈：程式碼 > code map > 文檔

**優先級**（衝突或時間不夠時，依序保持一致）：程式碼 > code map > 文檔。
**code map 與程式碼衝突時以程式碼為準，立刻改 code map。**

1. **修改前**：先讀本表找到相關領域，只讀清單裡的檔——不讀無關領域的檔。
2. **修改後**：新增／刪除了原始碼檔案，或某檔職責顯著改變，必須同步更新本表。
3. 原始碼裡**不加**「對應 code map」的註釋（維護成本過高）；反向查找直接 grep 本檔。
4. 迭代期間本表可暫時落後，**commit 前必須對齊**（見 [feature-dev](../feature-dev/README.md)）。
