# 任務：第二輪：百科 vm 層對齊正式 lore 格式契約（content/lore/README.md）、分類排序與中文名、資料卡物件值與部位層表格、勢力關係中文標籤，並補 6 個測試

> 領導 `lead-wiki` 寫給 codex 工人 `cx-wiki-lore`。**交接書是唯一契約**：沒寫的授權等於沒有。共用規格在同目錄 `contract.md`（§1–§7），本交接書與它衝突時以本交接書為準。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/contract.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/types.ts`（凍結契約）、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/vm/wiki/markdown.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/architecture.md` 的 ui-adapter 段——親自讀。

## 背景與唯一目標

使用者要在現有網頁裡加一個百科（wiki）總覽世界觀（勢力、人物、大事件、地點、年表）與遊戲資料。第二輪兩條線並行：cx-wiki-lore（vm）、cx-wiki-polish（DOM）；第一輪五條線的 REPORT 在同目錄 cx-wiki-*/REPORT.md。第一輪 vm（index／list／search／timeline／relations／home／cards）已落地且綠燈，但當時 lore 格式只是草案；規劃線已交出正式契約 `content/lore/README.md`（**親自讀**），欄位名與草案不同。另外領導看了截圖：資料卡把巢狀物件畫成一長串 key／value 清單（部位與層表格最明顯）、分類順序雜亂、`registries`／`rules`／`base`（pack.json）沒有中文名、勢力關係顯示英文 hostile。types.ts 已由領導加了 `CardValue` 的 `kv` 變體、`RelationCell.label／tone／note`、`EntryRef.note`（標 `[lead-wiki r2]`）。唯一目標：vm 層照下面規則補齊，對正式 lore 格式與真實 content/base 都產出乾淨的 view model。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：改 `src/ui-adapter/vm/wiki/` 的 `kinds.ts`、`index.ts`、`list.ts`、`search.ts`、`timeline.ts`、`relations.ts`、`home.ts`、`cards.ts`（含已拆出的 cards-*.ts，若有）與既有測試檔 `index.test.ts`、`views.test.ts`、`cards.test.ts`（只為配合新行為調整斷言），新建恰好 1 個測試檔 `src/ui-adapter/vm/wiki/lore.test.ts`；外加你的 REPORT。
- 不做：`types.ts`（已凍結；不夠用寫 REPORT）、`markdown.ts`、`keys.ts`、`keymap-wiki.json`、`src/ui-adapter/dom/`（別線 cx-wiki-polish 同時在改 DOM）、`src/ui-adapter/vm/` 其他檔；`content/`（唯讀，不建任何檔）、`src/` 其他目錄、`package.json`、各 tsconfig、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新檔超過 2 個就停下回報；容量 gate：`src/ui-adapter/vm/wiki/` 非測試檔合計超過 120 KB 就停下回報。任一觸發都停。

## 規則補充（寫死）

- 正式 lore 格式（以 README 為準，以下是重點）：relations 是陣列 `[{faction, stance, note}]`（勢力）或 `[{character, relation, note}]`（人物）——目標鍵可能是 `faction`／`character`／`place`／`event`／`id`／`target`，關係詞鍵 `stance`／`relation`／`type`／`kind`／`rel`，`note` 進 `EntryRef.note`；events 用 `period` 指時代（facet era 與 timeline 都要認 `period`）；日期可為負數年（`-8900`）與自由字串（`約 2037`、`不明`、`現在`）——sortKey 要讓負數年排在正數年之前、自由字串抽出其中第一個 4 位以內年份、抽不到排最後；era 段落依 era 條目的 `from` 排序（同樣用 sortKey 規則），沒有 era 條目的排最後。
- lore 概要欄位（cards）：依 kind 列出存在的欄位並給中文標籤——faction：type 類型、scale 規模、founded 成立、hq 總部、leaders 領袖（ref 清單）、ideology 信條、places 據點、mechSeries 摹機系列、mercPolicy 對傭兵（generosity 大方度／reliability 守約度 用 `n／5`，note）、ancientMech 藍本古代機（kv：name、foundAt、foundDate、pilot、gameRef、doctrine）；character：born 生、died 歿、faction 所屬、role 身分、kind 類型、mech 座機；event：date 日期、period 時代、kind 類型、factions／characters／places（ref 清單）、consequences 後果（清單段）；place：region 地區、continent 大洲、world 天體、kind 類型、status2108 2108 現況、factions；era：from、to。relations 段為表格（對象 ref｜關係｜備註）。已用掉的欄不再進 raw。
- 物件值：凡是值是物件的地方（raw 段、kv 段、表格格子），改產 `CardValue` 的 `kv`（遞迴，深度 > 3 才退回 text JSON 摘要），**不要**再產「交錯的 key、value list」。
- 部位與層（frame／species／bodyplan 展開構型時）：表格改成**一層一列**：`部位｜暴露｜槽位｜功能｜層｜種類｜HP｜抗性｜備註`；同一部位的第 2 層起部位欄留空字串；種類用 `src/ui-adapter/vm/labels.ts` 既有的層種類中文對照（只 import 它的匯出、不改它），抗性用 kv（傷害型別鍵若在 registries 有中文名就用中文，從 index 讀 `base:file/registries/damage-types` 之類的資料檔，讀不到用原字）。
- 分類順序與中文：kinds.ts 加排序權重：game 組依 機體、部件、能力、效果、構型、怪獸族、怪獸、人物、機魂天賦樹、勢力、地形、地圖、情境、AI 策略、成長曲線、登記表（registries）、規則常數（rules）、內容包（pack.json 那個 base 分類）；lore 組依 勢力、人物、大事件、地點、時代；ops 組依 節點、契約、勢力營運、市場、營運事件，其餘依中文名。未知 kind 排各組最後。
- 勢力關係：`label` 中文（hostile 敵對、neutral 中立、allied／ally 同盟、friendly 友好、tense 緊張；中文值原樣），`tone` 依中文對應（同盟 allied、友好 friendly、中立 neutral、緊張 tense、敵對 hostile、其他 other）；lore relations 的 note 帶進 cell。
- **不寫死內容 id**；lore 測試資料寫在測試檔裡（照 README 欄位表手刻 5 種 kind 各 1–2 筆＋timeline），不在 `content/` 建檔。
- 型別：TypeScript strict、ESM、import 帶 `.ts` 副檔名、`import type` 用於純型別（`verbatimModuleSyntax`）；識別字英文、註解繁中；vm 檔不得用 DOM 型別（`npx tsc --noEmit` 在無 DOM lib 下檢查 vm）。
- 契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停、不要改 types.ts。

## 測試（寫死條數：恰好 6 個 `test()`；`node:test`＋`node:assert/strict`）

1. lore 勢力 relations 陣列（`faction`＋`stance`＋`note`）與人物 relations（`character`＋`relation`）都成 refs，rel 與 note 正確；relationsView 有 lore cell 且 label／tone 對。
2. events 的 `period` 進 facet era 與 timeline era；timeline sortKey：`-8900` < `-120` < `2037` < `2108-03` < `約 2110`，`不明` 排最後。
3. era 段落依 era 條目 `from` 排序。
4. cards：lore faction 概要含類型／總部／領袖 ref／ancientMech kv；event 有後果清單段；已用欄位不出現在 raw。
5. cards：真實 `content/base/` 任一有 bodyPlan 的 frame（動態挑第一個，不寫死 id）展開表格是一層一列、欄位 9 欄、resist 是 kv；整份 EntryPage JSON 中不存在「list 交錯 key/value」的舊形狀（任何 list 的 items 都不是 text 鍵＋值交替的結構——用一個結構性斷言：不存在 kv 以外的值含 `{t:"list",items:[{t:"text",v:欄名},…]}` 的成對形狀即可，自行設計判準並在註解說明）。
6. 整合：用 `node:fs` 讀真實 `content/base/` 與 `content/lore/`（若存在）→ `buildWikiIndex` → 對每個條目跑 `entryPage` 與 `searchWiki(name)`，零例外、自己在結果內；categories 中 game 組前三個依序是 機體、部件、能力（若存在）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/vm/wiki/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；型別：`npx tsc --noEmit` 與 `npx tsc --noEmit -p tsconfig.ui.json`（別線同時在改；錯誤只出在別人檔案或 `src/mcp/` 不是你的事，REPORT 註明）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-wiki-lore --once` | 每完成工作的一步跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npx tsc --noEmit -p tsconfig.ui.json` | 每個檔改完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npx tsc`、`npx vite build --outDir /tmp/cx-wiki-lore/dist`。**不要 commit**（領導收線時 commit）；不開瀏覽器、不起 dev server、不跑 Playwright。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`（暫存放 `/tmp/cx-wiki-lore/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。工作樹裡有別線未提交的改動，**不要碰、不要還原**。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。

## 工作

1. 讀完先讀清單；上線發 `PROGRESS`；`inbox_poll --once`。
2. 實作範圍內的檔；每個檔完成跑 tsc；`inbox_poll --once`。
3. 寫測試到恰好上列條數並跑綠；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-lore/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/`（範圍列出的檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-lore/REPORT.md` |

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

- 我是誰：`cx-wiki-lore`。本線團隊：`teams/lead-wiki`。上線先發 `PROGRESS`。
- 終局：`wf/tools/inbox_mail.sh cx-wiki-lore --up DONE|BLOCKED|FAILED '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-wiki/cx-wiki-lore/REPORT.md`——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：[inbox/PROTOCOL.md](../../../../../inbox/PROTOCOL.md)。

codex 工人的 ROSTER 格由領導代登記。
