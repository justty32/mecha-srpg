# 任務：實作百科 DOM 層（dom/wiki/：mountWiki 六種頁面、markdown 繪製、資料卡、側欄與手機抽屜、wiki.css）並補 10 個 happy-dom 測試

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-dom`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。五條工人線並行：cx-wiki-index（索引層）、cx-wiki-md（markdown）、cx-wiki-cards（資料卡）、cx-wiki-dom（百科 DOM）、cx-wiki-shell（殼、路由、快捷鍵、e2e）。把 vm 給的 view model 畫成百科頁：首頁、分類清單（排序／篩選）、搜尋結果、詳情（資料卡、markdown 本文、交叉連結、壞引用灰色未建立、反向引用）、年表（依時代分段、勢力篩選）、勢力關係（表格）。唯一目標：`mountWiki` 照 contract §3 簽名落地、§6 錨點齊全、風格照 §7，手機寬度側欄收合。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：新建 `src/ui-adapter/dom/wiki/mount.ts`、`markdown-dom.ts`、`wiki.css`，可再拆最多 3 個模組（例 `pages.ts`、`card-dom.ts`、`relations-dom.ts`），新建恰好 2 個測試檔 `src/ui-adapter/dom/wiki/mount.test.ts`、`src/ui-adapter/dom/wiki/fixtures.ts`（假 api 與假 view model，fixtures 不算測試數）；外加你的 REPORT。
- 不做：`src/ui-adapter/vm/`（全部；dom/wiki 只 `import type` `vm/wiki/types.ts`）、`dom/wiki/boot.ts`、`dom/shell.ts`、`dom/main.ts`、`dom/render.ts` 等戰鬥檔（別線 cx-wiki-shell 同時在寫）；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 8 個就停下回報；容量 gate：你的非測試檔合計超過 70 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- 只用 `root.ownerDocument`／`.defaultView`，不碰全域 `document`／`window`／`localStorage`／`location`；換頁一律呼叫 `opts.navigate(opts.href(view))`，連結 `a` 元素的 `href` 用 `opts.href(...)`，點擊攔下 `preventDefault` 後 navigate（保留中鍵／Ctrl 點擊的預設行為）。
- **絕不用 innerHTML／insertAdjacentHTML／outerHTML 寫入**，一律 createElement＋textContent；外部連結加 `rel="noopener noreferrer"`、`target="_blank"`。
- 搜尋框：輸入時（debounce 120ms，用 `defaultView.setTimeout`）`navigate(href({v:"search",q}), true)`；`show()` 重畫主區時**不重建搜尋框**（焦點與游標位置保留）。
- 鍵盤：`mountWiki` 在 `doc` 掛 keydown，root 有隱藏祖先（`root.closest("[hidden]")`）時不處理；焦點在 input／select／textarea 時只處理 Escape（blur）。按鍵本身怎麼對應動作由殼決定——你提供 `focusSearch()`、`toggleHelp()`、`toggleSidebar()`；說明表由 `opts.keyHints` 畫成 `[data-ui="wiki-help"]`（預設隱藏，toggleHelp 切換）。**你不自己綁任何快捷鍵**（殼會在 doc 上另掛 keydown 呼叫你的方法）。
- 版面：根 `.wiki-view`；頂部標題列（百科標題、搜尋框、側欄開關、說明鈕）；左側欄＝首頁／年表／勢力關係連結＋依 group 分組的分類清單（顯示件數）；主區。`@media (max-width: 760px)` 側欄變抽屜（預設收合，`toggleSidebar` 或開關鈕打開，點分類後自動收合）。頁高 `calc(100dvh - 40px)`、主區自己捲動。
- 詳情：標題、subtitle、badges、aka、summary、breadcrumbs；各 CardSection（kv＝dl、table＝table、list＝ul、md＝renderBlocks、raw＝可摺疊 details 預設收合）；ref 解析到 → `a[data-ref]`，target null → `span.wiki-broken[data-broken]` 文字「（label）（未建立）」；反向引用分組列在最下。
- 年表：每個 EraSection 一段 `[data-era]`（era null 用 "none"），項目顯示 date、title、summary、勢力 ref；頂部勢力 select＋時代 select，變更就 navigate。
- 關係：勢力×勢力表格，格子顯示 rel（hostile 紅、allied 綠、neutral 灰，其他 accent）＋來源（lore／game）小標；列頭／欄頭是勢力連結。
- 首頁：totals、各 group 分類卡片（件數）、壞引用清單（給內容作者看；來源條目連結＋壞的 raw）。lore 為 0 時顯示一句「世界觀資料尚未建立（content/lore/）」。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 10 個 `test()`；`node:test`＋`node:assert/strict`）

1. 首頁：`[data-ui="wiki-home"]` 出現、分類卡片數＝fixture 分類數、lore 0 時有提示句。
2. 側欄：`a[data-cat]` 數＝分類數，點擊呼叫 navigate 帶 href；toggleSidebar 切換開合 class。
3. 清單：列數＝rows、`select[data-facet]` 只出現 fixture 有的面向、改排序／篩選呼叫 navigate（帶 query）。
4. 搜尋：輸入後（推進計時器）以 replace=true 呼叫 navigate；show search 畫 `[data-ui="wiki-results"] a[data-key]`；重畫時搜尋框是同一節點。
5. 詳情：kv／table／list／raw 各段都畫出；`a[data-ref]` 的 href 是 href(entry)；壞引用 `span.wiki-broken` 含「未建立」。
6. markdown-dom：h／p／strong／em／code／ul 巢狀／table 對齊／quote／pre／hr 結構正確；含 script 標籤的 text 節點以文字呈現、DOM 中 `script` 元素數為 0。
7. 年表：段數＝sections、`[data-ui="wiki-tl-item"]` 數＝總項數、改勢力 select 呼叫 navigate 帶 faction。
8. 關係：表格格子數與 cells 對應、rel class 正確。
9. 鍵盤與說明：root 在 hidden 祖先下時 keydown 不觸發任何 navigate；toggleHelp 切換 `[data-ui="wiki-help"]` 的 hidden，表列數＝keyHints 數；焦點在搜尋框按 Escape 會 blur。
10. 靜態：掃 `src/ui-adapter/dom/wiki/*.ts`（測試檔除外）原文不含 `innerHTML`、`insertAdjacentHTML`、`outerHTML`，且 import 只有 `vm/wiki/types.ts`（type-only）與本目錄檔；destroy 後 root 清空、keydown 解除。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/wiki/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-dom --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-dom/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server、不跑 Playwright。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-dom/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-dom/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-dom/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. 沙箱外 `node --test --test-reporter=tap 'src/ui-adapter/dom/wiki/*.test.ts'` 全過，`test()` 恰好上列條數（由領導重算）。
2. `npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 對你範圍內的檔零錯誤（由領導重跑）。
3. REPORT 存在於上表路徑、四段齊全；`git status --short` 中你造成的改動只在範圍列出的路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到綠；修不了就發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wiki-dom`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-dom --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-dom/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
