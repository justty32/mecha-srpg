# 已讀清單

以下逐檔親讀。`AGENTS.md` 親讀的是交接書點名的主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`；其餘清單路徑相對隔離 worktree。

- `AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`
- `wf/workflows/dispatch/handoffs/lead-fill-am/am-plan/PLAN.md`
- `content/lore/places/denver.json`
- `content/lore/places/montreal.json`
- `content/lore/places/brasilia.json`
- `content/lore/places/cartagena.json`
- `content/lore/events/renaming-day.json`
- `content/lore/events/trade-route-charter.json`
- `content/lore/factions/quito.json`
- `wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-03.md`

另讀開場進度、等待事項與工作流入口，以及用語改名表相關列、G 傘政治線、世界支柱的基調／勢力／怪獸子檔、資料檔與 inbox 協議。用語表經 tabledb 查詢，未整份載入。

## 做了什麼

cx-am-03 依領導已審計畫與本線補充完成五個地點、一個事件，逐檔掛點如下；路徑皆相對 worktree。

- `content/lore/places/seattle.json`：縮守接糧碼頭，寫丹佛糧車、民兵與獵團守夜；太平洋來源與歷年大潮留下的獸交代西岸受創。掛 N01、底色 1.4。
- `content/lore/places/winnipeg.json`：加拿大草原糧城納入美國調度，議會另存加拿大登記簿，徵召與歸屬並存。掛 G 線、底色 1.6、改名的日子，對照蒙特婁。
- `content/lore/places/havana.json`：古巴國屬港縮守後靠近岸交易續糧，古巴在拉美傘內；與卡塔赫納交易但各辦各的文書。掛 G 線、底色 1.4。
- `content/lore/places/valparaiso.json`：智利民兵與受雇獵團守貨場，向基多買備件，守夜缺口仍須自己補。掛 G 線、底色 1.4、商路約；維拉科查不離安地斯、基多不出洲。
- `content/lore/places/belem.json`：限定亞馬遜河口灣區的潮湧開裂例外，轉運內陸糧與海邊精粹，接巴西利亞糧帳。掛 F／G 線、底色 1.4。
- `content/lore/events/estuary-exchange.json`：二一〇七年九月貝倫港商照扣抽成，從當批糧貨先撥護航口糧，承擔少賣或補交的代價，成為地方慣例。掛 N09、底色 1.4；依領導補充不引用另批事件 id。

`content/lore/timeline.json` 僅插入一筆 `2107-09`「河口換糧」，位於既有 `2107-09-21` 之前；event、era、factions、tags 與事件檔對齊。沒有反向補寫其他地點或勢力。

通讀六檔後完成潤稿，刪去事件中的開場措辭，改為世界內年月。正文以貨場、麻袋、飯盒、修理件等可見事物呈現群像。未派子代理，沒有新增子代理成本。

## 產出

內容根目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-am/wt-am-03/`。

新增與修改為上述七檔。六個新檔 body 字數依序為 481、491、491、485、514、462，均未觸發容量 gate。五個地點均沿用五段，world 為 earth，gameRefs 為空陣列。

報告與審查表目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-am/am-03/`，僅交 `REPORT.md`、`review-rows.json`。審查表先建 wf-table/1 空表頭，再逐列使用交接書指定的 tabledb add 寫入。

固定四條驗收的證據：

1. `node content/lore/check.ts`：改前 `errors=0 warnings=8`；每個地點完成後均為同值，事件與年表配套寫入後亦同；潤稿後末行仍為 `errors=0 warnings=8`。新事件有年表引用，警告未增加。最終輸出在 `/tmp/cx-am-03/check-final.log`。
2. `npm run check`：全批完成後跑一次，退出碼 0，末行 `OK 0 errors, 8 warnings`。輸出在 `/tmp/cx-am-03/npm-check.log`。
3. 六個新檔存在，檔名與 id name 段一致；本批變更剛好七檔。將年表唯一新增區塊移除後，全文與 `git show HEAD:content/lore/timeline.json` 逐字相同，既有元素及順序未動。開工即有的未追蹤 `node_modules` 保留原狀。領導可據此執行交接書約定的 content_gate 驗收。
4. 本 REPORT 開頭列完整已讀清單；`review-rows.json` 六列，白話字數依序 23、26、24、26、23、27，均不超過 60 字。

逐檔檢查輸出另存 `/tmp/cx-am-03/check-*.log`。只執行本批固定驗收，沒有另跑 npm test、wf-lint、試玩或其他驗收鏈。

## 沒做到或證據不足的

無本線未完成事項。沒有 commit，也沒有帶回主工作樹；依交接書由領導收件。年表既有內容逐字保留，其他既有 lore 未改。

## 需要決定的事

- 既有張力：`content/lore/factions/quito.json` 的環線首航段寫高原衛護送聖保羅外圍車隊、伊內絲隨車；`content/lore/events/trade-route-charter.json` 與本線裁示則限制高原衛／維拉科查不離安地斯。計畫書已揭示這項張力，本批未沿用出山敘述，未替舊事自訂生效年，也未改舊檔。是否整理既有段落留領導另案處理，本批不需等待。
- 偏離計畫書：僅依領導補充解除 E6 對另批 `event/another-ledger` 的引用依賴，改寫為可見的內陸財團抽成；其餘依第 4、5、6 節落地。城市狀態、古巴傘屬與事件年月均沿用交接書核定值。
- 沒有規格外具名人物、地名、事件、機體、招式、公司或幫派，沒有新概念詞需要命名裁定。
- 沒有新增機型或怪獸資料的需求；本批以既有泛稱、備件與守港活動完成。

## 以後交接書該點名的工具

現有工具足夠：保留每檔 lore check、末次 npm run check、審查表 tabledb add、每步 inbox_poll 與終局 inbox_mail。需要工人附既有檔逐字保留證據時，可直接點名 git show／git diff；仍屬既有第三條驗收，不擴增驗收條數。
