## 已讀清單

以下均由 cx-wl-02 親自閱讀；`AGENTS.md` 實際讀取主 repo 絕對路徑，其餘相對路徑讀取隔離 worktree 版本。

- `AGENTS.md`（`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/world/essence.md`
- `wf/workflows/planning/design-notes/world/scale.md`
- `wf/workflows/dispatch/handoffs/lead-world-land/guide.md`

另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`，以及 world-pillars 的 `world.md`、`mechs.md`、`world/tone-and-rules.md`、`mechs/bonds.md`。交接書已讀：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-world-land/cx-wl-02.md`。

## 做了什麼

依 guide.md 檢視指定 19 檔，修改 12 檔，另 7 檔無需修改。只動命中主題的文字欄；數字、鍵、陣列長度、引用與識別字不動。編輯時逐節點限制變更，未新增或刪除內容檔，未 commit。最大單檔容量增幅為 1.53%，件數與容量閘門皆未觸發。沒有殘翼舊口號命中；第七哨的空援券已明寫為一券一發昂貴精粹矢，破甲不保證收命。

工作目錄：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wl/wt-wl-02`。腳本、原始檢查輸出與全庫 grep 輸出只存於 `/tmp/cx-wl-02/`；報告目錄只寫本 REPORT.md。

指定的 `tabledb.py ... terms-rename.json grep '十分|漲潮|大潮|精粹'` 已執行，依定案列 69–72 與 guide.md 改寫；每步均跑主 repo 的 `inbox_poll.sh cx-wl-02 --once`，未收到新指示。開工 PROGRESS 已投遞上游。

固定五條驗收結果：

1. `git status --short` 只有下列對照中的 12 個修改檔與開場即存在的 `?? node_modules`；沒有越界檔。
2. `npm run check` exit 0，末行 `OK 0 errors, 8 warnings`（第一階段另報 12 warnings）；`node content/lore/check.ts` exit 0，`errors=0 warnings=2`。交接書另外指定的 `node src/ops/content/check.ts content/base` 亦 exit 0，末行 `OK 0 errors, 8 warnings`。
3. 指定全庫 `git grep -nE '十分|複本|獨駕|白手套|租|大潮' -- content` 已執行並逐檔判讀本批命中。19 檔內無「十分律」「十分之一」「十分之一也是火」「複本」「獨駕」或例行「每個大潮」；其餘命中逐處說明於「殘留」。
4. 下列逐檔對照涵蓋全部 19 檔，每處改動列舊、新半句；無需改的檔附理由。
5. 首段已讀清單涵蓋交接書「先讀」的全部 11 個路徑。

未加跑 npm test、wf-lint、MCP、試玩或其他驗收。

## 逐檔對照

### content/lore/factions/accra.json

`body`：「城牆上架十分律砲台」→「城牆上架凡鐵砲台」。殘翼駐場、出兵與券的敘述未宣稱凡鐵殺獸，保留。

### content/lore/factions/bay-seventh-post.json

`scale`：「兩座十分律砲台」→「兩座凡鐵砲台」。

`body` 開場：「兩座十分律砲台」→「兩座凡鐵砲台」。

`body` 戰役：「十分律之下，砲台只能打出十分之一」→「獸的抵抗性讓凡鐵砲台只刮得動外甲」；同句「砲手專打外甲的最後一層，替……機甲把獸剝開」→「砲手便專打最後一層，剝開獸甲，交給……機甲收命」。

`body` 空援券：「殘聯配給、殘翼兌現的那種」→「殘聯配給、殘翼兌現，一券一發昂貴的精粹矢，破甲卻不保證收命」。

### content/lore/factions/busan.json

`body`：「孩子們在大潮前一晚」→「孩子們在漲潮前一晚」。例行戴面具跳舞改用漲潮；兩處歷史大潮保留，見殘留。

### content/lore/factions/green-line.json

`body`：「每到大潮，巢母生出」→「每到漲潮，巢母生出」。

`body`：「但大潮夜裡仍有人」→「但漲潮夜裡仍有人」。清剿後仍有捕獸活動，屬反覆漲潮。

### content/lore/factions/mumbai-returners.json

`body`：「難民兵背著十分律之下只剩十分之一的舊兵器跟進」→「難民兵背著只刮得動獸甲、碰不到核的凡鐵舊兵器跟進」。保留難民不肯留在後方與撤走空援的情節。

### content/lore/factions/orbital-post.json

`summary`：「大潮前三天就知道」→「漲潮前三天就知道」。

`body`：「看大潮前地殼的光」→「看漲潮前地殼的光」；「大潮前三天就知道」→「漲潮前三天就知道」。均為例行預報。

### content/lore/factions/quito.json

`body`：「身邊一格之內十分律失效」→「身邊一格之內抵抗性失效」；「傳統兵器打得出全額」→「凡鐵也打得進肉」。

`ancientMech.doctrine`：「一格內十分律失效」→「一格內抵抗性失效」。

### content/lore/factions/rift-beasts.json

以下均在 `body`，描述週期活動，七處全改為漲潮：

蟲族：「大潮時生出子體」→「漲潮時生出子體」；「大潮出巢」→「漲潮出巢」；「每個大潮都要繳稅」→「每個漲潮都要繳稅」。

獸族：「牠們大潮時直接從裂縫過來」→「牠們漲潮時直接從裂縫過來」。

異形：「開一個大潮就自己閉上」→「開一個漲潮就自己閉上」；「每大潮開一次」→「每漲潮開一次」。

菌絲：「每個大潮往外長」→「每個漲潮往外長」。

### content/lore/factions/shell-society.json

`body`：「大潮前三天進場」→「漲潮前三天進場」，例行探勘。

`body`：「大潮那幾夜，刑天胸口」→「漲潮那幾夜，刑天胸口」，反覆亮起而非單一歷史事件；原文未說明只在末日級夜晚亮起，依 guide.md 拿不準就改漲潮。兩處具體歷史大潮保留。

### content/lore/factions/sydney.json

`body`：「大潮時露出一道彎曲的脊」→「漲潮時露出一道彎曲的脊」。此句泛指現象，未限定某一歷史夜晚；雖後文提及 2105 年露出地面，未足以判定前句專指末日級大潮，依 guide.md 改漲潮，年份與事件不動。

### content/base/aiprofiles/glove-line.json

無需改。`name`「白手套戰列」只是名稱，沒有宣稱機甲、機魂或殺獸；其餘為行為識別字、數值。

### content/base/factions/selene-whitegloves.json

無需改可改文字欄。`name`「塞勒涅白手套」可保留；`soul-driven` 是禁止修改的英文標籤，另列「需要決定的事」。

### content/base/world/dialogues/glove-debt-form.json

`topics[1].lines[0]`：「來源複本未簽收」→「來源紀錄未簽收」。保留手套的催收措辭、封存紀錄來源未明的情節，未暗示機魂可複製。

### content/base/world/events/debt-collection.json

無需改。白手套登船扣押符合 guide.md；選項記下執行人姓名並未指認鐵偶內有機魂，亦可指扣押執行的負責人，保留。

### content/base/world/events/news-selene-courtesy.json

無需改。白手套例行通話與術式重複相容；新衍型機是型錄商品，原文沒有把白手套本身稱作衍型機。

### content/base/world/events/ruin-coordinate-sale.json

無需改。白手套逐攤問價與封口交易不涉及精粹核、機魂或殺獸。

### content/base/world/events/ruin-empty-shell-rubbing.json

無需改。空座艙屬拓本中的古代機，白手套只是街外的影子，未描寫機魂獨駕或鐵偶有魂。

### content/base/world/events/soul-stray-log.json

`text`：「你照例抄錄租賃魂核」→「你照例抄錄租來那位機魂的值勤紀錄」，明確指向一位真的機魂。

`text`：「這段紀錄不是這份複本的」→「這段紀錄不在租約附的履歷裡」，保留租賃者過去未明、陌生回航紀錄與後續追查，不再指稱複本。

### content/base/world/templates/debt.json

無需改。`MechSeized.text` 與 `DebtCollection.text` 僅寫白手套扣押、登船；被扣押的是玩家機甲，沒有把執行扣押的白手套稱作機甲。

## 殘留

以下為指定 grep 在本批 19 檔的全部命中，共 15 處；同一文字值內兩個「租」分列。全庫其他檔命中不屬本線允許修改範圍，未動。

`content/lore/factions/busan.json` 的 `body`：

「慶州的古墳群在大潮裡塌開」：2100 年古陵露出的具體歷史事件，guide.md 允許保留。

「到了大潮之夜，古代機沒有認任何一支部隊」：同一歷史戰事中處容認主的夜晚，guide.md 允許保留；不拿來定義例行認主頻率。

`content/lore/factions/quito.json` 的 `body`：「2092 年……在大潮之夜站在古代機前」：維拉科查認主的具體歷史夜晚，保留。

`content/lore/factions/shell-society.json` 的 `body`：

「2105 年大潮露出南極冰下古墟」：古墟露出、探勘隊失蹤一半的具體歷史事件，保留。

「2103 年……大潮之夜，刑天認了」：刑天認主的具體歷史夜晚，保留。

`content/base/aiprofiles/glove-line.json` 的 `name`：「白手套戰列」：名稱可沿用，沒有機甲或機魂斷言。

`content/base/factions/selene-whitegloves.json` 的 `name`：「塞勒涅白手套」：勢力名稱可沿用。

`content/base/world/events/debt-collection.json` 的 `text`：「白手套踏上甲板」：對人的扣押行動，符合新設定。

`content/base/world/events/news-selene-courtesy.json` 的 `text`：「塞勒涅白手套的例行通話」：術式問候與催收，未寫個性或複本。

`content/base/world/events/ruin-coordinate-sale.json` 的 `text`：「塞勒涅白手套正在逐攤問價」：交易行動，未寫殺獸。

`content/base/world/events/ruin-empty-shell-rubbing.json` 的 `text`：「街外白手套的影子」：僅點名；空座艙是另一個主體的拓本。

`content/base/world/events/soul-stray-log.json` 的 `text`：

「租來那位機魂」：租的是一個不可複製的人，符合 copy／rent 規則。

「租約附的履歷」：契約所附歷史資料，不是機魂的複本。

`content/base/world/templates/debt.json` 的 `entries.MechSeized.text`：「白手套扣押」：扣押人的資產，符合新設定。

同檔 `entries.DebtCollection.text`：「白手套已帶著扣押令登船」：guide.md 明列可保留的敘述。

## 沒做到或證據不足的

本批文字改寫與固定五條驗收已完成。未驗證遊戲實際戰鬥數值或白手套標籤的執行效果；本批禁止改引擎與非文字欄，且明定不加碼驗收。

檢查有警告，沒有錯誤：content 載入階段 12 warnings 包含 8 個怪獸 capture layer HP 差異、閃避／傷害區間、池區間覆蓋、無武器配裝；ops 階段 8 warnings 為相同怪獸 HP 差異。lore 的 2 warnings 是 `events/busan-returned-seal.json`、`events/dark-quay-surety.json` 未出現在 timeline。警告檔均非本批修改檔；未另跑基線比對，不宣稱已證明警告歷史。

新跑的證據在 `/tmp/cx-wl-02/check.log`、`lore-check.log`、`ops-check.log`；全庫 grep 在 `/tmp/cx-wl-02/residuals-full.txt`，編輯記錄在 `/tmp/cx-wl-02/edit-evidence.json`。未把全文輸出放進報告目錄。

## 需要決定的事

`content/base/factions/selene-whitegloves.json` 的 `tags[1]` 仍是 `soul-driven`，字面與「無魂鐵偶」衝突（M4 與 guide.md glove）。英文標籤不在本批可改範圍，保留並交上游決定是否另派非文字資料修正；與裂獸 hostile 的關係只表達敵對，並不等於有殺獸能力，未改。

本批沒有自擬人物傳聞，亦未為精粹、源流、裂晶的關係或古代機認主頻率新增定案。刑天反覆發光與雪梨脊背露出的「漲潮」採 guide.md 的保守讀法，已於逐檔對照列出，無需本線另定數值或結構。

## 子代理

未使用子代理；子代理成本為 0，沒有委派品質風險。全部指定閱讀、逐句改寫與檢查由 cx-wl-02 親自執行；本次工具未提供可核實的整體 token／金額統計。

## 以後交接書該點名的工具

無。
