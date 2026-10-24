# 任務：實作網頁殼與 hash 路由（導航列、戰鬥懶掛載、百科動態載入、營運預留頁）、百科鍵位、戰鬥導航整合的最小改動，並補 8 個 node 測試與 3 條 e2e

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-shell`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。五條工人線並行：cx-wiki-index（索引層）、cx-wiki-md（markdown）、cx-wiki-cards（資料卡）、cx-wiki-dom（百科 DOM）、cx-wiki-shell（殼、路由、快捷鍵、e2e）。把百科整合進現有 Vite app：頂部導航在「戰鬥」「百科」「營運（預留）」之間切換，`?scenario=`／`?seed=`／`?size=`／`?anim=` 照舊可用、既有 7 條 e2e 不破；F1／Shift+W 開百科、百科裡 F1／Shift+B 回戰鬥，快捷鍵只在當前頁生效。唯一目標：contract §3 的 shell／boot、§4 路由、§5 快捷鍵落地。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：新建 `src/ui-adapter/vm/route.ts`、`src/ui-adapter/vm/wiki/keymap-wiki.json`、`src/ui-adapter/vm/wiki/keys.ts`、`src/ui-adapter/dom/shell.ts`、`src/ui-adapter/dom/shell.css`、`src/ui-adapter/dom/wiki/boot.ts`、測試檔 `src/ui-adapter/vm/route.test.ts`、`src/ui-adapter/dom/shell.test.ts`、`e2e/wiki.spec.ts`；最小改動 `src/ui-adapter/vm/types.ts`（只加 UiAction 的 navigate 變體）、`src/ui-adapter/vm/keymap.ts`（parseAction 收 `nav:{page}`）、`src/ui-adapter/vm/keymap.json`（加一列）、`src/ui-adapter/vm/controller.ts`（navigate no-op）、`src/ui-adapter/dom/render.ts`（keydown 隱藏祖先 guard 一行）、`src/ui-adapter/dom/style.css`（戰鬥頁高）、`src/ui-adapter/dom/main.ts`（改成殼＋戰鬥懶掛載＋百科動態 import）、`index.html`（title 改「機甲 SRPG」）；外加你的 REPORT。
- 不做：`src/ui-adapter/vm/wiki/` 的 index／list／search／timeline／relations／home／markdown／cards／types（別線同時在寫；boot.ts 只 import 它們的匯出名，依 contract §2 簽名）、`src/ui-adapter/dom/wiki/mount.ts` 等百科 DOM（別線 cx-wiki-dom；你只 import `mountWiki`）、既有戰鬥測試的斷言（新增 navigate 後若有 exhaustive 測試要調，只改到能過）、`vite.config.ts`／`playwright.config.ts`（不需要就不改）；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 10 個就停下回報；容量 gate：你的非測試檔合計超過 40 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- **main.ts 合併注意**：lead-mcp 線可能同時在 `main.ts` 加 `?spectate=1` 參數（只讀 URL、改 controller 建法）。動 main.ts 前後都 `git diff src/ui-adapter/dom/main.ts` 看，若出現 spectate 相關程式碼**原樣保留**並搬進你的戰鬥掛載函式；不要整檔覆寫掉別人的行。
- 戰鬥懶掛載：第一次 route 到 battle 才跑原本 start() 的內容（`loadBrowserContent`、controller、`mountBattle`、`window.__battle`），之後切走只把 `[data-page="battle"]` 設 `hidden`，不 destroy；切回來時送一次 resize（`dispatchEvent(new Event("resize"))` 即可，讓 ResizeObserver／measure 重量）。直接開 `#/wiki` 時戰鬥不掛載。
- 百科：第一次 route 到 wiki 才 `await import("./wiki/boot.ts")`，boot 用 `import.meta.glob("/content/**/*.json", { eager: true })` 建 `RawFile[]`（`pack` 取 `content/` 下一層）、`buildWikiIndex`、組 `WikiApi`（contract §3）、`mountWiki(...)`；載入中顯示「百科載入中…」。之後 hashchange 只呼叫 `show(view)`。
- 殼的 keydown（掛在 document、capture 階段）：只處理全域導航——在戰鬥頁時交給既有戰鬥 keymap（`nav:wiki` 走 `send` 攔截）；在百科頁時用 `resolveWikiKey` 對應 `WikiMount` 的方法或 navigate；焦點在 input／textarea／select 時只認 F1 與 Escape。百科鍵位說明 `wikiKeyHints()` 傳給 `mountWiki` 的 `keyHints`。
- 導航列 `[data-ui="app-nav"]` 高 40px，三個 `a[data-nav]`（戰鬥、百科、營運），目前頁 `aria-current="page"`，標上快捷鍵（百科 F1）；營運頁顯示「營運畫面尚未開放」。配色照 contract §7。
- e2e（`e2e/wiki.spec.ts`，恰好 3 條；既有 `battle.spec.ts` 不改）：①從 `/?anim=off` 按 F1 進百科（`[data-ui="wiki-home"]` 可見）再按 F1 回戰鬥、戰鬥 `round` 仍在；②`/#/wiki` 直接開，在搜尋框輸入「某個從 `content/base` 用 `node:fs` 讀出來的 frame name」，結果出現、點進去 `[data-ui="wiki-entry"]` 可見（不寫死 id）；③詳情頁點一個 `a[data-ref]` 交叉連結後 `[data-ui="wiki-entry"]` 的 data-key 變成該 ref，瀏覽器返回（`page.goBack()`）回到原條目，再點導航「戰鬥」回到戰鬥方格。三條都收集 pageerror／console error 要為空。
- 百科的 DOM／vm 是別線同時在寫：若到你要跑 build／e2e 時 `mountWiki` 或 vm 匯出還不存在，**不要自己寫替代實作**，照常交付並在 REPORT 註明「整合待領導」；只要你的 node 測試與 tsc（排除缺檔錯誤）過就算。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 8 個 `test()`；`node:test`＋`node:assert/strict`）

1. parseHash：contract §4 表每一列（含空 hash、未知 → battle、`#/wiki/xxx` → home）。
2. formatRoute(parseHash(x)) round-trip 正規形式；key 含 `:` 與 `/` 經 encodeURIComponent 來回不變；category query 的 sort／desc／facet。
3. wikiHref 與 formatRoute 一致；search q 含中文與空白。
4. 戰鬥 keymap：`validateKeymap(DEFAULT_KEYMAP)` 無錯、`resolveKey` 對 F1 與 Shift+W 都回 `{type:"navigate",page:"wiki"}`、W（無 Shift）仍是 standby；controller.dispatch(navigate) 不改 snapshot。
5. 百科 keymap：`keymap-wiki.json` 無重複鍵、每個 action 都認得；`resolveWikiKey` 對 F1／Shift+B／`/`／`t`／Escape 的結果；`wikiKeyHints()` 列數＝bindings 數。
6. shell（happy-dom）：mountShell 產出 `[data-ui="app-nav"]` 三個連結與三個 `[data-page]`；切換 route 時只有目前頁沒 hidden、aria-current 跟著變。
7. shell：戰鬥頁隱藏時，戰鬥 `mountBattle` 的 keydown 不送 action（用 `dom/fixtures.ts` 現成的 snapshot 掛一個 battle，把容器設 hidden 後送 `e` 鍵，onKey 不被呼叫）。
8. shell：在百科頁、焦點在 input 時，按 `t` 不觸發 navigate、按 F1 觸發回戰鬥。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/route.test.ts' 'src/ui-adapter/dom/shell.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-shell --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-shell/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server。可跑 `npx playwright test e2e/wiki.spec.ts`（headless，設定檔已寫死不開視窗）；跑不起來（沙箱擋埠或瀏覽器）不算失敗，REPORT 註明，由領導在沙箱外跑。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-shell/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-shell/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-shell/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. 沙箱外 `node --test --test-reporter=tap 'src/ui-adapter/vm/route.test.ts' 'src/ui-adapter/dom/shell.test.ts'` 全過，`test()` 恰好上列條數（由領導重算）。
2. `npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 對你範圍內的檔零錯誤（由領導重跑）。
3. REPORT 存在於上表路徑、四段齊全；`git status --short` 中你造成的改動只在範圍列出的路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到綠；修不了就發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wiki-shell`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-shell --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-shell/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
