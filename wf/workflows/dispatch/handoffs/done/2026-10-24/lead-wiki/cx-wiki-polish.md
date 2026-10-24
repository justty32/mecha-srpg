# 任務：第二輪：百科 DOM 排版修正（物件值 kv、勢力關係表、側欄與分類卡、清單列）並補 4 個 happy-dom 測試

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-polish`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。第二輪兩條線並行：cx-wiki-lore（vm）、cx-wiki-polish（DOM）；第一輪五條線的 REPORT 在同目錄 cx-wiki-*/REPORT.md。第一輪百科 DOM 已落地且綠燈。領導看了 headless 截圖，排版問題：①資料卡巢狀物件畫成一長串圓點清單，難讀；②勢力關係表欄頭與列頭被擠成直排一字一行；③側欄分類連結整段帶底線、件數括號換行；④分類卡片與清單列偏鬆。types.ts 已由領導加 `CardValue` 的 `kv` 變體與 `RelationCell.label／tone／note`（標 `[lead-wiki r2]`；vm 由別線 cx-wiki-lore 同時改成產出這些）。唯一目標：DOM 把新型別畫好、修掉上述排版。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：改 `src/ui-adapter/dom/wiki/` 的 `mount.ts`、`pages.ts`、`card-dom.ts`、`markdown-dom.ts`（若需要）、`wiki.css`、`fixtures.ts` 與既有 `mount.test.ts`（新增恰好 4 個 `test()`，既有 10 個只為配合新型別調整）；外加你的 REPORT。
- 不做：`src/ui-adapter/vm/`（全部，別線同時在改）、`dom/wiki/boot.ts`、`dom/shell.ts`、`dom/main.ts`、戰鬥 DOM 檔；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 1 個就停下回報；容量 gate：`src/ui-adapter/dom/wiki/` 非測試檔合計超過 90 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- `kv` CardValue：畫成緊湊的 `dl.wiki-kv`（CSS grid 兩欄，標籤 muted 小字、值正常字；巢狀 kv 縮排），在表格格子裡也要可讀（不要圓點）。`list` CardValue 若每項都是短文字或 ref，畫成以「、」分隔的行內清單而不是 `ul`；長清單（>8 項或含 kv）才用 `ul`。
- 勢力關係：表格外包一層可水平捲動的容器；欄頭用正常橫書（`white-space: nowrap`；過長時欄頭文字可斜 45° 或截斷加 title，二擇一），列頭 `nowrap`、sticky 左欄；格子顯示 `label`（中文）＋小字來源（世界觀／遊戲），依 `tone` 上 class `rel-{tone}`（hostile 紅 `#ba414f`、tense 橙 `#d08a3a`、neutral 灰、friendly 淡綠、allied 綠 `#2c885b`、other accent），note 進 title。表格下方再列「關係清單」：每個勢力一段，列出它的所有關係（對象連結＋label＋note），手機上只看得到這份清單也夠用。
- 側欄：連結不加底線（hover 才加）、名稱與件數分開（件數用 muted 小徽章靠右）、群組標題（戰鬥內容／營運／世界觀）間距清楚；目前分類高亮保留。首頁分類卡片：名稱＋件數徽章、卡片內距收緊、無底線。清單列：名稱連結＋等級徽章＋summary 一行（有才顯示）＋tags 行內小字，列高收緊。
- 仍然**不用 innerHTML** 等寫入；仍然只 import `vm/wiki/types.ts` 型別。配色照 contract §7。手機（< 760px）時表格可橫捲、側欄抽屜照舊。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 4 個 `test()`；`node:test`＋`node:assert/strict`）

1. kv CardValue 畫成 `dl.wiki-kv`，巢狀 kv 也是 dl，表格格子裡的 kv 不含 `ul`。
2. 短 list 畫成行內「、」分隔（無 `ul`），長 list（9 項）畫 `ul`。
3. 勢力關係：格子帶 `rel-{tone}` class、文字是 label、note 在 title；下方關係清單段數＝有關係的勢力數。
4. 側欄：分類連結內件數在獨立徽章元素（`.wiki-count`）、連結文字不含括號件數。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/wiki/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-polish --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-polish/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server、不跑 Playwright。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-polish/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-polish/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-polish/REPORT.md` |

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

- 我是誰：`cx-wiki-polish`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-polish --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-polish/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
