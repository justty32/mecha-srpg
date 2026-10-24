# 任務：實作百科索引層：buildWikiIndex、分類清單與面向篩選、全文搜尋、年表、勢力關係、首頁（vm/wiki，node 可測）並補 12 個測試

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-index`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。五條工人線並行：cx-wiki-index（索引層）、cx-wiki-md（markdown）、cx-wiki-cards（資料卡）、cx-wiki-dom（百科 DOM）、cx-wiki-shell（殼、路由、快捷鍵、e2e）。百科的資料骨幹：把 content/ 底下所有 JSON（base 的戰鬥與 world/ 營運資料、日後的 lore）建成 `WikiIndex`（條目、分類、引用與反向引用、壞引用、年表），再提供清單／搜尋／年表／關係／首頁的 view model。唯一目標：contract §2 標 cx-wiki-index 的七個檔照簽名落地、對真實 `content/base/` 建索引零例外。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：新建 `src/ui-adapter/vm/wiki/kinds.ts`、`index.ts`、`list.ts`、`search.ts`、`timeline.ts`、`relations.ts`、`home.ts`，以及恰好 2 個測試檔 `src/ui-adapter/vm/wiki/index.test.ts`、`src/ui-adapter/vm/wiki/views.test.ts`；外加你的 REPORT。
- 不做：`types.ts`、`markdown.ts`（只 import `extractLinkTargets`，不改）、`cards*.ts`、`keys.ts`、`keymap-wiki.json`、`src/ui-adapter/vm/route.ts`（別線同時在寫）；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 9 個就停下回報；容量 gate：你的非測試檔合計超過 60 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- lore 測試資料寫在測試檔裡（inline RawFile），**不在 `content/` 建任何檔**。真實資料測試用 `node:fs` 讀 `content/base/`（遞迴，`pack:"base"`），只斷言結構性質（零例外、條目數＝含 id 檔數＋無 id 檔數、每個 refs 的 target 若非 null 必在 entries 裡），**不斷言具體 id 或件數**（別線正在大量新增內容）。
- `buildWikiIndex` 不拋錯：壞結構（非 object、id 非字串、重複 key）記進 `issues` 後略過或後蓋前。
- `search` 的 snippet：命中處前後各約 30 字，body 先 `plainText(parseMarkdown(body))`（parseMarkdown 目前是暫行骨架，別線在補，不影響你）。
- kind 中文對照至少含：frame 機體、component 部件、ability 能力、effect 效果、bodyplan 構型、person 人物（駕駛員／機魂）、soultree 機魂天賦樹、terrain 地形、map 地圖、scenario 情境、faction 勢力、species 怪獸族、monster 怪獸、aiprofile AI 策略、curve 成長曲線、node 節點、contract 契約、faction-ops 勢力營運、market 市場、event 事件、room 艙室、job 工作、research 研究、route 航線、rift 裂隙、service 設施、encounter 遭遇、dialogue 對話、name 命名表、beast 生物系、character 人物、place 地點、era 時代；lore 的 event 與 base 的 event 同名不同分類（category key 帶 pack），lore 側標「大事件」、base 側標「營運事件」。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 12 個 `test()`；`node:test`＋`node:assert/strict`）

1. 空輸入：entries 0、categories []、timeline []、issues []。
2. id 檔 key＝`pack:id`、無 id 檔 key＝`pack:file/{path}`，category 對；world/ 底下的分到 group ops。
3. 名稱推導：無 name 有 species 的條目得「物種名＋grade」。
4. 遞迴引用：陣列、巢狀物件值、物件 key（relations）都收；rel 帶上值。
5. 壞引用：id 形狀但不存在 → target null；非 id 形狀字串（例 `"hostile"`、`"never-retreat"`、含空白中文）不算引用。
6. lore bare id 先找 lore 再找 base；`base:` 前綴直達；backlinks 雙向（lore gameRefs → base 條目的 backlinks 有它）。
7. body 的 `[[...]]`／`[文字](...)` 進 refs（field "body"）。
8. timeline：sortKey 讓 "2061" < "2108-03" < "2108-03-14"；era／event／factions 解析；缺欄位不炸。
9. listCategory：依 grade（GRADE_ORDER）、name 排序與 desc；facet 篩選；facets 只列出現的。
10. searchWiki：名稱完全相符排第一、別名可命中、body 命中有 snippet、空字串回 []。
11. relationsView：base factions relations object 與 lore relations array 兩種都進 cells，rels 去重；homeView totals 與 broken 數一致。
12. 真實 `content/base/`：零例外、條目數＝檔數、所有非 null target 存在、每個條目 category 在 categories 裡、對每個條目跑 searchWiki(name) 都能找到自己。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-index --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-index/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server、不跑 Playwright。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-index/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-index/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-index/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 3 條，一條不多，做完就停）

1. 沙箱外 `node --test --test-reporter=tap 'src/ui-adapter/vm/wiki/*.test.ts'` 全過，`test()` 恰好上列條數（由領導重算）。
2. `npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json` 對你範圍內的檔零錯誤（由領導重跑）。
3. REPORT 存在於上表路徑、四段齊全；`git status --short` 中你造成的改動只在範圍列出的路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到綠；修不了就發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-wiki-index`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-index --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-index/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
