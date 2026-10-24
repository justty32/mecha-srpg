# code-map — 程式碼導航 index（哪個檔負責什麼）

[common/README](README.md)｜[INDEX](../../INDEX.md)

碰原始碼前先查這張表，只讀相關領域列出的檔；動完再照維護鏈把表更新回去。寫碼慣例本身在 [conventions](conventions.md)。

## 領域表

程式碼尚未落地的模組標「規劃中」，落地後把該列改成實際檔名與測試位置。模組邊界與允許的依賴方向以 spec 的 [architecture](../planning/specs/core/architecture.md) 為準。

| 領域 | 檔案 | 職責 | 測試在哪 |
|------|------|------|---------|
| core | `src/core/` | 型別（Def／State）、`Id`、`BattleState`、事件型別、seeded RNG、`EventLog`、NumExpr 求值器；不依賴任何模組 | `src/core/*.test.ts`|
| content | `src/content/`、`schemas/`、`content/base/` | 載入 pack、schema 驗證、id 解析、唯讀 `ContentDB`；內容資料與 schema | `src/content/*.test.ts`|
| rules | `src/rules/`（17 模組＋`index.ts`）| 全部結算；對外只暴露 `tryCommand`／`previewCommand`／查詢 | `src/rules/*.test.ts`、黃金 `test/golden.test.ts` |
| ai | `src/ai/`（含 `policies/`、`adapters/`）| 知識、估值、可插拔策略；只經 adapter 接 rules；敵我走 `hostility.ts`（RulesQuery 可選 `hostileSlots`，slot 同盟）| `test/ai/`（平衡回歸 `balance.test.ts`）|
| sim | `src/sim/{run,replay,save,cli,measure}.ts` | 跑局、重播、存檔、`npm run sim`；`scenarioToSetup` 把情境翻成 BattleSetup（slot→faction、`allies`、objective `target`→unit id、map globals／feature hp）；`measure.ts` AI 平衡量測 | `test/sim/`（接縫 `seams.test.ts`）|
| ops | `src/ops/`、`content/base/world/` | 營運層：tick、帳本、世界、契約、船務、文字層、出戰、戰役 CLI（見 [契約](../dispatch/handoffs/lead-impl-ops/contract.md)）| `src/ops/**/*.test.ts` |
| ui-adapter | `src/ui-adapter/{vm,dom}/` | vm 純邏輯→`UiSnapshot`；dom 唯一碰 DOM | 同目錄 `*.test.ts`、`e2e/` |

**ui-adapter 細節**（2026-10-24 落地；同日 lead-ui-fix 依試玩回饋改版）：`vm/types.ts` 是 vm↔dom 凍結契約；`vm/session.ts` 逐步跑局（唯一直接呼叫 rules／ai 處；`autoAdvance`、`stepAi` 一次一台 AI）、`viewmodel.ts`（含敵方部件即時／最後所見快照）、`controller.ts`（`UiAction`→`UiSnapshot`；演出佇列 busy／step／skip、浮出選單、結束回合確認、選部位）、`presentation.ts`（可見事件篩選、log 合併、fx 產生）、`keymap.json`＋`keymap.ts`（資料驅動快捷鍵）、`text.ts`（事件→中文）、`labels.ts`（含層種類中文對照）、`debug-maps.ts`（>120×120 大地圖）；`content-browser.ts` 在瀏覽器載內容。`dom/render.ts`（`mountBattle`；三欄佈局、固定指令面板）、`board.ts`、`panels.ts`、`menus.ts`（浮出選單／選部位／確認框）、`fx.ts`（戰場演出疊層）、`zoom.ts`（自動貼合與縮放純函式）、`tooltip.ts`、`style.css`、`main.ts`（入口與接線；localStorage 設定、演出計時）；dom 只 import `vm/types.ts` 的型別（main.ts 例外）。根目錄 `index.html`、`vite.config.ts`、`playwright.config.ts`、`tsconfig.ui.json`。

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
