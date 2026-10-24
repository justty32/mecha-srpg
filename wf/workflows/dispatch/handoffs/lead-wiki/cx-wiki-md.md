# 任務：實作百科最小 markdown 解析器（vm/wiki/markdown.ts：標題、段落、粗斜體、行內碼、清單、連結、表格、引用、程式碼塊、分隔線）並補 10 個測試

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-md`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。五條工人線並行：cx-wiki-index（索引層）、cx-wiki-md（markdown）、cx-wiki-cards（資料卡）、cx-wiki-dom（百科 DOM）、cx-wiki-shell（殼、路由、快捷鍵、e2e）。百科的 lore 本文是 markdown。唯一目標：`parseMarkdown(src, resolve?)` 把 contract 的最小子集轉成 types.ts 的 `MdBlock[]` AST（DOM 端只用 textContent 畫，所以 AST 裡**不能有任何會被當 HTML 的東西**；原始 HTML 標籤一律當文字）。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：改寫 `src/ui-adapter/vm/wiki/markdown.ts`（保留 `extractLinkTargets`、`plainText` 的簽名與行為；`parseMarkdown` 換成完整實作），新建恰好 1 個測試檔 `src/ui-adapter/vm/wiki/markdown.test.ts`；外加你的 REPORT。
- 不做：`types.ts`、vm/wiki 其他檔（別線同時在寫）；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 2 個就停下回報；容量 gate：`markdown.ts` 超過 20 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- 子集：ATX 標題 `#`～`######`；段落（連續行合併、行尾兩空白或 `\` 換行成 br）；`**粗**`／`__粗__`、`*斜*`／`_斜_`（底線在字中不算，例 `snake_case`）、`` `碼` ``；`-`／`*`／`+` 與 `1.` 清單（縮排 2–4 格巢狀）；`[文字](目標)`、`[[id]]`、`[[id|文字]]`；GFM 表格（`|` 分隔＋`---`／`:--:` 對齊列）；`>` 引用（可巢狀 block）；```` ``` ```` 圍欄程式碼塊（內容原樣）；`---`／`***` 分隔線；`\*` 跳脫。
- 連結：目標是 http(s):// → `extlink`；其他 scheme（`javascript:`、`data:`…）→ 只留文字；其餘交給 `resolve(raw)`：回 EntryRef → `link`，回 undefined → 只留文字。沒給 resolve 時內部連結做成 `{raw, target:null, label: 文字或 raw, field:"body"}` 的 link。`[[id]]` 沒給文字時連結文字用 `ref.label`。
- 不拋錯：任意輸入（未閉合的 `**`、`[`、表格欄數不齊）都產出合理 AST；未閉合標記當文字。
- `script` 標籤之類原始 HTML 一律留在 text 節點（DOM 用 textContent 就安全）。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 10 個 `test()`；`node:test`＋`node:assert/strict`）

1. 標題 1–6 級與段落合併、空行分段。
2. 粗、斜、行內碼、巢狀（`**粗*斜*粗**`）；`snake_case` 不變斜體。
3. 跳脫 `\*` 與未閉合 `**` 留文字。
4. 無序、有序清單與兩層巢狀。
5. `[文字](kind/name)` 走 resolve → link；resolve 回 undefined → 文字；`[[id]]` 與 `[[id|文字]]`。
6. http(s) → extlink；`javascript:alert(1)` → 只有文字。
7. 表格：表頭、對齊、欄數不齊補空格。
8. 引用（內含清單）、圍欄程式碼塊原樣（內含 `**` 不解析）、分隔線。
9. 原始 HTML（`«script»alert(1)«/script»（實際測試用真的角括號標籤）`、`<b>`）完整留在 text 節點的 v。
10. plainText 與 extractLinkTargets 對一段混合文件的輸出（保持既有行為）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/markdown.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-md --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-md/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server、不跑 Playwright。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-md/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-md/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-md/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. 沙箱外 `node --test --test-reporter=tap 'src/ui-adapter/vm/wiki/markdown.test.ts'` 全過，`test()` 恰好上列條數（由領導重算）。
2. `npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 對你範圍內的檔零錯誤（由領導重跑）。
3. REPORT 存在於上表路徑、四段齊全；`git status --short` 中你造成的改動只在範圍列出的路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到綠；修不了就發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wiki-md`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-md --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-md/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
