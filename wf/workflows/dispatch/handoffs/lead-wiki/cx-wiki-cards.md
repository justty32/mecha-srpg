# 任務：實作百科詳情頁資料卡生成（vm/wiki/cards*.ts：entryPage，遊戲資料自動卡片＋lore 條目＋通用 raw 欄位）並補 10 個測試

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-cards`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。五條工人線並行：cx-wiki-index（索引層）、cx-wiki-md（markdown）、cx-wiki-cards（資料卡）、cx-wiki-dom（百科 DOM）、cx-wiki-shell（殼、路由、快捷鍵、e2e）。使用者要總覽遊戲內容：機甲 frames、部件、能力、效果、怪獸族與個體、人物、機魂天賦樹、地形、地圖、情境、勢力、營運資料（節點、契約…），以及 lore 的勢力、人物、事件、地點、時代。唯一目標：`entryPage(index, key)` 為任何條目產 `EntryPage`（數值、部位與層、資源池、能力列表、等級、命名、二名／稱號等），**不寫死任何內容 id**，新 kind、新欄位自然落進 raw 段不漏。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：新建 `src/ui-adapter/vm/wiki/cards.ts`，可再拆最多 2 個（`cards-game.ts`、`cards-lore.ts`），新建恰好 1 個測試檔 `src/ui-adapter/vm/wiki/cards.test.ts`；外加你的 REPORT。
- 不做：`types.ts`、`index.ts` 等索引層檔（別線 cx-wiki-index 同時在寫；你的測試**手刻假 WikiIndex**（entries Map＋resolve 函式），不 import index.ts）、`markdown.ts`（只 import `parseMarkdown`，它目前是暫行骨架，別線在補）；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 4 個就停下回報；容量 gate：你的非測試檔合計超過 60 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- 先讀 `content/base/` 各目錄的實際 JSON（和 `wf/workflows/planning/specs/core/content-format.md`、`specs/ops/` 若有）掌握欄位，對常見 kind 做專屬段：frame（cls、grade、bodyPlan 引用並**展開該構型的部位與層**成表格、pools 表、innateAbilities 引用清單、baseAttrs kv）、bodyplan（部位×層表、座位）、component（slot、size、mass、hp、abilities、onBroken）、ability（mode、成本／產出表、射程與目標、packets 傷害表、effects）、effect、person（kind、attrs、pools、traits／perks、will、growth.tree）、soultree（節點清單）、species（family、gradeRange、baseAttrsByGrade 表、pools、bodyPlan 展開）、monster（species 展開、grade、epithet 二名／稱號若有）、terrain、map（尺寸、部署區）、scenario（參戰單位、目標）、faction（relations 表帶 rel）、world 的 node／contract／faction-ops 等用通用 kv。名稱類欄位（`epithet`、`title`、`nickname`、`aka`、命名表）放概要。
- lore 條目：概要 kv（aka、era、faction(s)、date、place 等有就列）、`md` 段＝`parseMarkdown(body, resolver)`（resolver 用 `index.resolve(raw, entry.pack)` 包成 EntryRef）、關係段（relations 表：對象＋關係詞）、gameRefs 清單。
- **每個條目都有 `raw` 段**：data 裡沒被專屬段用掉的頂層欄位全部遞迴列出（id 形狀字串 → ref CardValue），保證新欄位不漏；`id`／`name` 不重複列。
- backlinks：從 `index.backlinks.get(key)` 依來源條目的 category 分組，label 用 `index.categories` 的 label；breadcrumbs：百科 › 分類 label › 名稱。
- 數值用 `num`，引用用 `ref`（target null 時 DOM 會畫灰色未建立）；未知 key 不存在 → 回 null。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 10 個 `test()`；`node:test`＋`node:assert/strict`）

1. 未知 key → null；任何條目都有 raw 段且不含 id／name。
2. frame：概要含 grade／cls；bodyPlan 展開成部位×層表格；pools 表；innateAbilities 成 ref 清單。
3. 構型引用壞掉（bodyplan 不存在）時不炸、出現 target null 的 ref。
4. ability：成本表、射程、packets 表。
5. species／monster：monster 展開物種的 family 與 gradeRange；epithet 有就進概要與 badges。
6. person：attrs kv、pools 表、growth.tree ref。
7. faction：relations 表每列帶 rel。
8. lore 條目：md 段存在、relations 兩種格式（object／array）都成表、gameRefs 成 ref 清單。
9. backlinks 依分類分組、label 是中文分類名。
10. 用 `node:fs` 讀真實 `content/base/` 的每個 JSON 手刻成假 index（key＝`base:`＋id 或 `base:file/…`），對每個條目跑 entryPage 都不拋錯且 sections 非空（不斷言具體 id 或件數）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/cards.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-cards --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-cards/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server、不跑 Playwright。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-cards/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-cards/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-cards/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. 沙箱外 `node --test --test-reporter=tap 'src/ui-adapter/vm/wiki/cards.test.ts'` 全過，`test()` 恰好上列條數（由領導重算）。
2. `npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 對你範圍內的檔零錯誤（由領導重跑）。
3. REPORT 存在於上表路徑、四段齊全；`git status --short` 中你造成的改動只在範圍列出的路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到綠；修不了就發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wiki-cards`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-cards --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-cards/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
