# code-map — 程式碼導航 index（哪個檔負責什麼）

[common/README](README.md)｜[INDEX](../../INDEX.md)

碰原始碼前先查這張表，只讀相關領域列出的檔；動完再照維護鏈把表更新回去。寫碼慣例本身在 [conventions](conventions.md)。

## 領域表

程式碼尚未落地的模組標「規劃中」，落地後把該列改成實際檔名與測試位置。模組邊界與允許的依賴方向以 spec 的 [architecture](../planning/specs/core/architecture.md) 為準。

已抽到 [code-map.json](code-map.json)（9 列：core、content、rules、ai、sim、ops、ui-adapter、ui-ops、mcp）。

欄位：`領域`（模組領域）、`檔案`（路徑）、`職責`（做什麼、對外介面）、`測試在哪`。查法見資料檔說明（[data-files](data-files.md)）。

**ui-adapter 細節**（2026-10-24 落地；同日 lead-ui-fix 依試玩回饋改版）：`vm/types.ts` 是 vm↔dom 凍結契約；`vm/session.ts`（sim `BattleSession` 的薄包裝，2026-10-24 lead-ui-session 遷移；`autoAdvance`、`stepAi` 一次一台 AI、`spectate` 全 AI 觀戰；`batches`／observers 給演出與敵方快照）、`vm/boundary.test.ts`（靜態檢查 ui-adapter 不 import rules／ai）、`viewmodel.ts`（含敵方部件即時／最後所見快照）、`controller.ts`（`UiAction`→`UiSnapshot`；演出佇列 busy／step／skip、浮出選單、結束回合確認、選部位）、`presentation.ts`（可見事件篩選、log 合併、fx 產生）、`keymap.json`＋`keymap.ts`（資料驅動快捷鍵）、`text.ts`（事件→中文）、`labels.ts`（含層種類中文對照）、`debug-maps.ts`（>120×120 大地圖）；`content-browser.ts` 在瀏覽器載內容。`dom/render.ts`（`mountBattle`；三欄佈局、固定指令面板）、`board.ts`、`panels.ts`、`menus.ts`（浮出選單／選部位／確認框）、`fx.ts`（戰場演出疊層）、`zoom.ts`（自動貼合與縮放純函式）、`tooltip.ts`、`style.css`、`main.ts`（入口與接線；localStorage 設定、演出計時）；dom 只 import `vm/types.ts` 的型別（main.ts 例外）。根目錄 `index.html`、`vite.config.ts`、`playwright.config.ts`、`tsconfig.ui.json`。

**網頁殼與百科**（2026-10-24 lead-wiki）：`dom/main.ts` 改成殼——`dom/shell.ts`（導航列 `[data-ui="app-nav"]`、三個 `[data-page]` 容器、hash 路由、全域按鍵分流）＋戰鬥懶掛載（第一次進戰鬥頁才 `mountBattle`，切走只隱藏）＋百科動態 `import("./wiki/boot.ts")`；`vm/route.ts`（`parseHash`／`formatRoute`／`wikiHref`）。百科 vm `vm/wiki/`：`types.ts`（vm↔dom 凍結契約）、`index.ts`（`buildWikiIndex`：所有 `content/<pack>/**/*.json`→條目、分類、引用／反向引用、壞引用、年表）、`kinds.ts`（kind 中文名與排序）、`list.ts`、`search.ts`、`timeline.ts`、`relations.ts`、`home.ts`、`cards.ts`（`entryPage` 資料卡組裝）＋`card-builder.ts`（共用欄位、部位與關係建構）、`markdown.ts`（最小 markdown→AST）、`visibility.ts`（lore 可見度過濾：hidden 在建索引前剔除、rumor 標傳聞；2026-10-26 lead-secret）、`keymap-wiki.json`＋`keys.ts`；百科 dom `dom/wiki/`：`mount.ts`（`mountWiki`）、`pages.ts`、`card-dom.ts`、`markdown-dom.ts`（只用 textContent）、`wiki.css`、`boot.ts`（唯一接線處）；`mount.test.ts` 驗掛載／導航／搜尋／生命週期，`pages.test.ts` 驗詳情／markdown／年表／關係頁。lore 格式契約見 `content/lore/README.md`。

**MCP 工具**：`src/mcp/battle.ts` 保留工具與原有匯出，`battle-hub.ts` 負責共用戰鬥 session 表、建構、觀察與 AI 推進；`campaign.ts` 保留營運工具，`campaign-support.ts` 負責出戰候選、參數驗證與戰果記錄。

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
