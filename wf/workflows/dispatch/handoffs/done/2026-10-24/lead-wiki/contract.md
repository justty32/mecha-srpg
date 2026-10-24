# lead-wiki 共用契約（五條工人線都照這份）

[lead-wiki 交接書目錄](.)｜型別：`src/ui-adapter/vm/wiki/types.ts`（**凍結**，要改先寫 REPORT 問領導）

使用者原話：「勢力呢？時間線年表呢？大事件呢？人物呢？可以做一個 wiki 頁面，這樣我可以總覽這些內容。」「wiki 頁面要整合到現有網頁」「對，都整合到一起。」

## §1 總體

- 同一個 Vite app：頂部導航在「戰鬥」「百科」「營運（預留，顯示尚未開放）」之間切換；**hash 路由**，`location.search` 的 `?scenario=`／`?seed=`／`?size=`／`?anim=`（以及 lead-mcp 可能加的 `?spectate=`）照舊由戰鬥讀。
- 無框架、不裝任何套件。DOM 一律 `createElement`＋`textContent`，**不用 `innerHTML`／`insertAdjacentHTML`／`outerHTML` 寫入**（測試會 grep）。
- 資料：DOM 入口用 `import.meta.glob("/content/**/*.json", { eager: true })` 收所有 pack → `RawFile[]`（`pack`＝`content/` 下一層目錄名，`path`＝其後相對路徑）。`content/lore/` 目前**還不存在**（規劃線 plan-lore 正在寫），一切要在沒有 lore、只有部分 lore、lore 欄位缺漏時都正常。**不寫死任何內容 id**；kind 中文名對照表可以寫（未知 kind 用原字）。
- lore 格式草案（`content/lore/README.md` 出現前以此為準；未知可選欄位要容錯）：`factions/ characters/ events/ places/ eras/` 一檔一筆 JSON，欄位 `id`（`<kind>/<name>`，kind＝faction／character／event／place／era）、`name`、`aka`（字串或陣列）、`summary`、`body`（markdown）、`relations`（object `{目標id: 關係}` 或 array `[{id|target, type|kind|rel}]`，都要收）、`tags`、`gameRefs`（`base:...` 遊戲內容 id 陣列）；可能還有 `era`、`faction`／`factions`、`date`、`place`、`members` 之類，一律走通用引用掃描。`timeline.json`＝`{contract:"lore-timeline/1", entries:[{date,title,summary,event?,era,factions,tags}]}`（不當條目，進 `WikiIndex.timeline`）。
- 引用：**任何 JSON 字串值**只要是 id 形狀（見 types.ts `resolve` 註解）就是引用，遞迴掃整份 data（含物件的 key，例 base factions 的 `relations: {"faction/x": "hostile"}` 的 key 是引用、值是 rel）。解析得到＝連結，解析不到＝壞引用（灰色「XXX（未建立）」）。lore 的 bare id 先找 lore 再找 base；base 的 bare id 只找 base 再找其他。

## §2 vm 模組與函式簽名（`src/ui-adapter/vm/wiki/`）

| 檔 | 匯出 | 線 |
|---|---|---|
| `types.ts` | 全部型別（凍結） | 領導 |
| `kinds.ts` | `kindLabel(kind)`、`categoryGroup(pack, path)`、`facetLabel(name)`、`GRADE_ORDER` | cx-wiki-index |
| `index.ts` | `buildWikiIndex(files: RawFile[]): WikiIndex` | cx-wiki-index |
| `list.ts` | `listCategory(index, q: ListQuery): ListView \| null` | cx-wiki-index |
| `search.ts` | `searchWiki(index, q: string, limit = 50): SearchHit[]`（空字串回 []；名稱完全相符＞名稱前綴＞名稱包含＞別名＞id＞tag＞summary＞body；中文不分詞，用子字串；大小寫不敏感） | cx-wiki-index |
| `timeline.ts` | `timelineView(index, q: TimelineQuery): TimelineView` | cx-wiki-index |
| `relations.ts` | `relationsView(index): RelationsView` | cx-wiki-index |
| `home.ts` | `homeView(index): HomeView` | cx-wiki-index |
| `markdown.ts` | `parseMarkdown(src, resolve?: LinkResolver): MdBlock[]`、`plainText(blocks)`、`extractLinkTargets(src)`（後者已由領導寫好，不改簽名） | cx-wiki-md |
| `cards.ts`（可拆 `cards-game.ts`、`cards-lore.ts`）| `entryPage(index, key): EntryPage \| null` | cx-wiki-cards |
| `keymap-wiki.json`、`keys.ts` | 百科鍵位與 `resolveWikiKey(k: KeyInput): WikiKeyAction \| null`、`wikiKeyHints()` | cx-wiki-shell |
| `../route.ts` | `parseHash(hash): AppRoute`、`formatRoute(r: AppRoute): string`、`wikiHref(v: WikiView): string` | cx-wiki-shell |

`index.ts` 的名稱推導：`name` → `title` → 若有 `species` 引用則「物種名＋grade」→ id 最後一段。summary：`summary` → `description` → 空字串。facets：`grade`（`grade` 欄；`gradeRange` 陣列全收）、`family`（`family` 欄，或經 `species` 引用取物種的 family）、`faction`（所有指向 kind＝faction 條目的引用 key，及 lore 的 `faction`／`factions` 欄）、`era`（`era` 欄引用）、`cls`、`kind`（data 的 `kind` 欄，例 node 的 city／wild）、`tag`（tags）。

## §3 DOM 模組（`src/ui-adapter/dom/`）

- `wiki/mount.ts`：`mountWiki(root, opts: WikiMountOptions): WikiMount`，`WikiMountOptions = { api: WikiApi; href(v: WikiView): string; navigate(hash: string, replace?: boolean): void; keyHints: { label: string; keys: string[] }[] }`；`WikiApi = { home(): HomeView; list(q): ListView | null; search(q: string): SearchHit[]; entry(key): EntryPage | null; timeline(q): TimelineView; relations(): RelationsView }`；`WikiMount = { show(view: WikiView): void; focusSearch(): void; toggleHelp(): void; toggleSidebar(): void; destroy(): void }`。**dom/wiki 只 import `vm/wiki/types.ts` 的型別**（`boot.ts` 例外），測試用假 api。這兩個型別寫在 `dom/wiki/mount.ts` 裡匯出。
- `wiki/markdown-dom.ts`：`renderBlocks(doc, blocks, href): DocumentFragment`。`wiki/wiki.css`。可再拆 `wiki/pages.ts`、`wiki/card-dom.ts`。
- `wiki/boot.ts`（cx-wiki-shell）：唯一接線處：glob → RawFile[] → `buildWikiIndex` → `WikiApi`；由 `main.ts` **動態 import**（百科獨立 chunk，戰鬥首屏不載）。
- `shell.ts`、`shell.css`（cx-wiki-shell）：導航列、三個頁面容器、路由切換；`main.ts` 改成殼＋戰鬥懶掛載（第一次進戰鬥頁才 `mountBattle`，之後隱藏不銷毀，戰鬥狀態保留）。

## §4 路由（hash）

| hash | AppRoute |
|---|---|
| 空、`#`、`#/`、`#/battle` | battle |
| `#/ops` | ops |
| `#/wiki` | wiki home |
| `#/wiki/c/<encodeURIComponent(category)>?sort=grade&desc=1&<facet>=<值>…` | cat |
| `#/wiki/e/<encodeURIComponent(key)>` | entry |
| `#/wiki/s?q=<encodeURIComponent>` | search |
| `#/wiki/timeline?faction=<key>&era=<key>&tag=<t>` | timeline |
| `#/wiki/relations` | relations |
| 其他 `#/wiki…` → wiki home；其他 → battle | |

`formatRoute(parseHash(x))` 對上表正規形式要等於 x（round-trip 測試）。搜尋框輸入時 `navigate(href, true)`（replaceState，不灌歷史）。

## §5 快捷鍵

- 戰鬥 `vm/keymap.json` 加一列 `{ "action": "nav:wiki", "keys": ["F1", "Shift+w"], "label": "開百科" }`；`UiAction` 加 `{ type: "navigate"; page: "battle" | "wiki" | "ops" }`，`parseAction` 收 `nav:<page>`，controller 對它 no-op，`main.ts` 的 `send` 先攔下交給殼。戰鬥說明表自動多一列。
- 百科 `vm/wiki/keymap-wiki.json`（同 `KeymapFile` 形狀，action 是百科字串）：`nav:battle`＝`F1`、`Shift+b`；`wiki:search`＝`/`；`wiki:home`＝`g`；`wiki:timeline`＝`t`；`wiki:relations`＝`r`；`wiki:sidebar`＝`s`；`wiki:help`＝`Shift+?`、`?`；`wiki:blur`＝`Escape`（離開搜尋框）。
- 只在當前頁生效：戰鬥 `render.ts` 的 keydown 在 shell 有隱藏祖先（`closest("[hidden]")`）時直接 return；百科 keydown 同理；焦點在 input／textarea／select 時只處理 Escape 與 F1。

## §6 DOM 錨點（e2e 用，凍結）

導航 `[data-ui="app-nav"] a[data-nav="battle|wiki|ops"]`（目前頁 `aria-current="page"`）；頁面容器 `[data-page="battle|wiki|ops"]`（非目前頁有 `hidden`）。百科：根 `[data-ui="wiki"]`、側欄 `[data-ui="wiki-sidebar"]`（分類連結 `a[data-cat]`）、側欄開關 `button[data-ui="wiki-sidebar-toggle"]`、搜尋 `input[data-ui="wiki-search"]`、主區 `[data-ui="wiki-main"]`、首頁 `[data-ui="wiki-home"]`、清單 `[data-ui="wiki-list"]`（列 `[data-ui="wiki-row"][data-key]`、面向篩選 `select[data-facet="<name>"]`、排序 `select[data-ui="wiki-sort"]`）、搜尋結果 `[data-ui="wiki-results"] a[data-key]`、詳情 `[data-ui="wiki-entry"][data-key]`、內部連結 `a[data-ref="<目標 key>"]`、壞引用 `span.wiki-broken[data-broken="<raw>"]`（文字含「未建立」）、反向引用 `[data-ui="wiki-backlinks"]`、年表 `[data-ui="wiki-timeline"]`（段 `[data-era]`、項 `[data-ui="wiki-tl-item"]`、勢力篩選 `select[data-ui="wiki-tl-faction"]`）、關係 `[data-ui="wiki-relations"]`、說明 `[data-ui="wiki-help"]`。

## §7 風格

配色沿用戰鬥（`style.css` 的 `.battle-view` 色票：bg `#0c121d`、panel `#151f2e`、border `#35465d`、text `#e5edf8`、muted `#acbcd1`、accent `#85c6ff`、enemy `#ba414f`、ally `#2c885b`），字體 system-ui。百科兩欄（側欄 220px＋主區），寬度 < 760px 側欄收合成抽屜。壞引用 muted 灰＋虛線底線。殼導航列高 40px，戰鬥頁高改 `calc(100dvh - 40px)`。
