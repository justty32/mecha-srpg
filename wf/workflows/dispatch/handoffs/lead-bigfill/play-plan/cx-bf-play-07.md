# 任務：照可玩內容計畫新增第 07 批——候鳥號的嘴硬與誇口（恰好 15 檔，batch bf-play-07）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠摘要**；REPORT 開頭「已讀清單」要列本行所有路徑），`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ops-content.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-07.md`。相對路徑相對 worktree；本稿與 plan、review-draft 可從主 repo 唯讀。用 tabledb 查 templates.json、engine-facts.json 與 review-draft.json 本批15列，不整份讀。逐檔 lore 與範本也要親讀。領導裁決 play-rulings.md 已存在，必讀；與本稿、plan、review-draft衝突時以裁決為準。

## 背景與唯一目標

讓玩家在現有地球營運中遇到 lore。你只產出本批 15 個新檔與報告，不再另設計件數、地圖或引擎。逐檔欄位定案與觸發完整存於 `review-draft.json` 的「掛到」物件；下面逐檔規格給寫手直接落稿。數值沿用同級範本，文字依要點展開，不能新增專名來填空。

**是否改黃金：預期不會改既有未談話黃金；晚期談話碰到新話題會改旗標／士氣與後續狀態，屬條件性風險。** 黃金紅時列檔名，不改期望、不跑 GOLDEN_UPDATE／rerecord。領導最後整批重錄一次；不要為了維持hash把新內容藏起來。

## 方法與禁忌（必守）

1. **節點優先、不暴力產 lore**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（`wf/workflows/planning/design-notes/world/history-lines.md`），有因有果。不掛得上就不寫。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`）：**少寫帳務與法理、多一點人、畫面、獸、神話的光**。「地契押給月亮」「商團出糧傭兵守港」「井＋糧倉＋公司排班」這類模板句已經寫過很多遍，不再重複。每件要有一個人、一個畫面或一句能吼出來的話。
3. **不拿其他作品類比**：不寫任何外部作品名、角色、電影或遊戲比喻；量級用世界內的詞。
4. **中文命名避免直譯**：兩步命名（先想原意，再取中文，不逐字翻）；古代機本體就叫古代機、外層叫裝甲；潮→蝕（蝕潮、漲潮、大潮、連珠潮）；用語與禁用詞照 `content/lore/style.md`。新中文名不要回譯成英文 aka。
5. **國家、塞勒涅、巨頭只削弱不萬能**：有錢有法理，但到不了每一座城、買不到古代機；塞勒涅不當主謀。富豪、家族、公司群像不點名（職稱可寫）。
6. **古代機與 S 級高高在上**：不寫它們被打倒、被操縱、被交易；古代機周邊寫人（守寢人、學會、村子、看守的崗），古代機本身不動（除既有 lore 已寫的）、不預決誰認主。S 領主不出場（萬潮葬王是唯一例外，本輪不碰）。
7. **對面無臉**：怪獸沒有人格化指揮者、不談、不怕；怪獸不是畜牲（不寫餵、馴、乖、寵物）。A 級以上才有二名。
8. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md` 全部、既有 lore、年表。矛盾記 REPORT「需要決定」，不自己改舊檔。
9. **真相用可見度**：外界不知道的放 `secrets`（`visibility: hidden`）或 `rumor`；`summary`／`body` 照外界口吻。
10. **開局（2108-01）後可能發生、日期不定的事件**用 `occurs: possible`（見 `content/lore/README.md`）。
11. **新名詞標提案**：規格外新造的專名或概念詞，在 REPORT「需要決定」與 review 列「名稱」後加「（提案）」。能不造就不造。
12. **文筆不強求**：只查禁忌與掛點，不為了文采加長。

本輪裁決必守：`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`；事件每件有光且全批至少三分之二有獸／奇觀或吼句；六類限額物件各最多兩件核心畫面，依review標記；每組契約明列獸與此刻接戰理由。

本批補充：遠方地點只經地球港口的來信、抵港者或回憶呈現，不聲稱玩家已到該洲。lore id 只留報告掛點，不把 `character/` 當 `person/`、不把同名 lore place 當 world place。不得加未實作 `loreRefs`、`location`、`requiresFlag` 欄。純敘事指名勢力／地方要用其既有完整顯示名。

## 範圍（排除法寫死）

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-07/` 新增下面 **恰好 15 檔**；完整白名單亦在本批 manifest 的 files。只新增、不改既有檔。報告另寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-07/`。

- `content/base/world/dialogues/bf-ren-kasai-needle.json`
- `content/base/world/dialogues/bf-ren-kasai-mugyeom.json`
- `content/base/world/dialogues/bf-ren-kasai-ironmouth.json`
- `content/base/world/dialogues/bf-ren-kasai-kamchatka.json`
- `content/base/world/dialogues/bf-chen-xiaohai-seventh.json`
- `content/base/world/dialogues/bf-chen-xiaohai-keys.json`
- `content/base/world/dialogues/bf-chen-xiaohai-silas.json`
- `content/base/world/dialogues/bf-chen-xiaohai-lira.json`
- `content/base/world/dialogues/bf-ilse-brandt-lena.json`
- `content/base/world/dialogues/bf-ilse-brandt-watch.json`
- `content/base/world/dialogues/bf-ilse-brandt-names.json`
- `content/base/world/dialogues/bf-ilse-brandt-paid-window.json`
- `content/base/world/dialogues/bf-mara-okoye-nadia.json`
- `content/base/world/dialogues/bf-mara-okoye-temo.json`
- `content/base/world/dialogues/bf-mara-okoye-farida.json`

不做：不修改或刪除任何既有檔（含池、factions-ops、places、lore、timeline、索引、manifest）；不碰 `src/`、`test/`、`schemas/`、`specs/`、`wf/`（報告目錄除外）、`content/batches/`、`content/index/`；不做數值平衡，不做月面營運、萬潮葬王相關與 AI；不 commit。manifest 由領導預置，工人不可為了驗收改它。worktree 外不寫主 content；scratch/log 放 `/tmp/cx-bf-play-07/`。

件數 gate：content 新檔超過15或修改任一既有檔即停下回報；容量 gate：任一新content檔超過12 KB、合計超過180 KB即停下回報。REPORT ≤20 KB；其餘同質清單用資料檔。任一觸發都停。

### 逐檔規格

#### bf-ren-kasai-needle.json — 第一針不是第一刀

`content/base/world/dialogues/bf-ren-kasai-needle.json`；類別 `dialogues`。蓮嘲笑自己能拆巨甲卻穿不了針，談羅凱婭讓學徒先下針。 掛到 character/ren-kasai, character/rokeya-karim, place/dhaka-sail-court；崩年底色1.1、1.3。範本 `content/base/world/dialogues/ren-kasai-empty-chair.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ren-kasai-needle"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。嘴硬工頭；先誇自己拆甲利落，再被針眼難住，最後肯讓學徒接手。 必含代表語氣「我能拆一頭獸，這個針眼倒管起我了。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；我能拆一頭獸，這個針眼倒管起我了。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ren-kasai-mugyeom.json — 零分的好手藝

`content/base/world/dialogues/bf-ren-kasai-mugyeom.json`；類別 `dialogues`。蓮拿吊具重演崔武謙撐門，嘴上嫌零擊殺，手卻把救人那欄畫得最大。 掛到 character/ren-kasai, character/choi-mugyeom, place/busan；崩年底色1.2。範本 `content/base/world/dialogues/ren-kasai-empty-chair.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ren-kasai-mugyeom"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。工頭式評工；嫌報表只算擊殺，吹噓吊重物比擺英雄姿勢難。 必含代表語氣「零擊殺？那活人都是誰吊回來的？」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；零擊殺？那活人都是誰吊回來的？。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ren-kasai-ironmouth.json — 鐵嘴也有拆不動的

`content/base/world/dialogues/bf-ren-kasai-ironmouth.json`；類別 `dialogues`。蓮認出鐵嘴的鉚法，毒舌說能拆的他會拆，拆不回來的別勸他放下。 掛到 character/ren-kasai, character/rashid-ironmouth, faction/chittagong-breakers；崩年底色1.3、1.8。範本 `content/base/world/dialogues/ren-kasai-empty-chair.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ren-kasai-ironmouth"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。刻薄、護短，不忽然原諒；擦工具時先罵舊老闆，再收住涉及家人的一句。 必含代表語氣「鐵嘴會拆價錢，我會拆甲。別教我拆心。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；鐵嘴會拆價錢，我會拆甲。別教我拆心。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ren-kasai-kamchatka.json — 北方的手比火硬

`content/base/world/dialogues/bf-ren-kasai-kamchatka.json`；類別 `dialogues`。蓮談妮娜與堪察加，誇北方修機人不怕凍，轉頭把自己的手藏進袖子。 掛到 character/ren-kasai, character/nina-belova, place/kamchatka-wells；崩年底色1.5、1.8。範本 `content/base/world/dialogues/ren-kasai-empty-chair.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ren-kasai-kamchatka"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。吹噓後露怯；保留北方來信與妮娜話題，不再讓空衣袖當主角。 必含代表語氣「凍住就敲開。別看我，我只是手冷。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；凍住就敲開。別看我，我只是手冷。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-chen-xiaohai-seventh.json — 我也喊得動一座牆

`content/base/world/dialogues/bf-chen-xiaohai-seventh.json`；類別 `dialogues`。小海談努爾與哈米德，吹噓自己也能把警號吼過城牆，卻被鐵姨叫低聲。 掛到 character/chen-xiaohai, character/captain-hamid, character/nur, place/bay-tide-line；崩年底色1.1、1.2。範本 `content/base/world/dialogues/chen-xiaohai-watch-rain.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-chen-xiaohai-seventh"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。年輕人的逞強，拿自己與第七哨孩子比，不能保證穿獸群安全。 必含代表語氣「我也喊得動一座牆！先別叫鐵姨來。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；我也喊得動一座牆！先別叫鐵姨來。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-chen-xiaohai-keys.json — 門要連人一起開

`content/base/world/dialogues/bf-chen-xiaohai-keys.json`；類別 `dialogues`。小海拋起還鄉院鑰匙，問德維卡若只接回機甲，還算不算回家。 掛到 character/chen-xiaohai, character/devika-rao, place/surat-key-court；崩年底色1.8、1.11。範本 `content/base/world/dialogues/chen-xiaohai-watch-rain.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-chen-xiaohai-keys"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。直球、嘴硬；顯出歸還黨善意與棄傭兵的矛盾，不只溫柔發問。 必含代表語氣「門敢只認機甲，我就站門中間。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；門敢只認機甲，我就站門中間。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-chen-xiaohai-silas.json — 走音也要到最後

`content/base/world/dialogues/bf-chen-xiaohai-silas.json`；類別 `dialogues`。小海學賽拉斯唱名唱到走音，還吹噓最後一個字一定比雪響。 掛到 character/chen-xiaohai, character/silas-mercer, place/winnipeg；崩年底色1.8。範本 `content/base/world/dialogues/chen-xiaohai-watch-rain.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-chen-xiaohai-silas"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。不擅唱仍逞強；由故意學腔變成認真，不讓整則只是念名單。 必含代表語氣「我走音又沒少喊人。你來，你也會破。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；我走音又沒少喊人。你來，你也會破。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-chen-xiaohai-lira.json — 鈴小，嗓子借妳

`content/base/world/dialogues/bf-chen-xiaohai-lira.json`；類別 `dialogues`。小海替莉拉的尋人信敲鈴，嫌鈴太小，說先借他的嗓子。 掛到 character/chen-xiaohai, character/lira-santos, place/zamboanga；崩年底色1.5、1.8。範本 `content/base/world/dialogues/chen-xiaohai-watch-rain.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-chen-xiaohai-lira"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。急性子又認真，承認喊大聲不等於人找到了；未找到不能造團圓。 必含代表語氣「鈴小，嗓子借妳。找不到也得有人聽見。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；鈴小，嗓子借妳。找不到也得有人聽見。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ilse-brandt-lena.json — 退路也算我的戰績

`content/base/world/dialogues/bf-ilse-brandt-lena.json`；類別 `dialogues`。伊爾瑟談莉娜的卸傷岸，嘴硬說自己不是會退，是會讓人回來。 掛到 character/ilse-brandt, character/lena-visser, place/rotterdam-roost；崩年底色1.4、1.8。範本 `content/base/world/dialogues/ilse-brandt-return-knot.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ilse-brandt-lena"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。冷笑、王牌自尊；不為鹽鷗洗白，不寫全面和解。 必含代表語氣「退路？叫它我替你們打下來的路。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；退路？叫它我替你們打下來的路。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ilse-brandt-watch.json — 接班機要長腿

`content/base/world/dialogues/bf-ilse-brandt-watch.json`；類別 `dialogues`。伊爾瑟讀賽芙娜的換班記錄，嘲笑蓋章不會長腿，自己站到門口演一遍。 掛到 character/ilse-brandt, character/saevna-suren, place/suez；崩年底色1.6。範本 `content/base/world/dialogues/ilse-brandt-return-knot.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ilse-brandt-watch"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。軍人冷幽默；說話短促，自己最後撤的毛病也被玩家戳到。 必含代表語氣「章不會長腿。接班的機甲到了再叫我。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；章不會長腿。接班的機甲到了再叫我。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ilse-brandt-names.json — 別把活人鑄死

`content/base/world/dialogues/bf-ilse-brandt-names.json`；類別 `dialogues`。伊爾瑟談徐海謙的像，嫌英雄姿勢難維修，還是把同伴的名字讀出聲。 掛到 character/ilse-brandt, character/seo-haegyeom, place/incheon；崩年底色1.2、1.8。範本 `content/base/world/dialogues/ilse-brandt-return-knot.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ilse-brandt-names"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。吐槽雕像姿勢再尊敬同伴，反對只記一個英雄；不新造雕像史實。 必含代表語氣「姿勢倒好看。真這樣站，排燼片誰換？」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；姿勢倒好看。真這樣站，排燼片誰換？。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-ilse-brandt-paid-window.json — 挪盾也算贏

`content/base/world/dialogues/bf-ilse-brandt-paid-window.json`；類別 `dialogues`。伊爾瑟談伊沃的挪盾，嗤笑他小氣，卻說肯留出活路就值得記。 掛到 character/ilse-brandt, character/ivo-serrin, faction/inner-sea-houses；崩年底色1.11。範本 `content/base/world/dialogues/ilse-brandt-return-knot.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-ilse-brandt-paid-window"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。不裝溫柔、不展開帳單；既笑付費原則也承認戰場留路。 必含代表語氣「小氣。可他那面盾，確實挪得漂亮。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；小氣。可他那面盾，確實挪得漂亮。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-mara-okoye-nadia.json — 水不會替妳殺獸

`content/base/world/dialogues/bf-mara-okoye-nadia.json`；類別 `dialogues`。瑪拉談娜迪雅放閘，拿手邊壞件演水困機殺，罵你別把水當免費機甲。 掛到 character/mara-okoye, character/nadia-sabri, place/aswan；崩年底色1.4、1.11。範本 `content/base/world/dialogues/mara-okoye-watch-lamp.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-mara-okoye-nadia"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。短、準、護短式罵人；2091水困與2093後機殺分開；不混成娜迪雅馬斯里。 必含代表語氣「水會困獸，不會替你上班。機甲開出去。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；水會困獸，不會替你上班。機甲開出去。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-mara-okoye-temo.json — 光漂亮，先接穩

`content/base/world/dialogues/bf-mara-okoye-temo.json`；類別 `dialogues`。瑪拉看泰莫的金山井口舊影，誇光好看只半句，下一句先問修的人睡了沒。 掛到 character/mara-okoye, character/temo-moruen, place/gold-reef；崩年底色1.3、1.4。範本 `content/base/world/dialogues/mara-okoye-watch-lamp.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-mara-okoye-temo"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。技工黑色幽默；內陸井有墟無獸，照顧值班人比神話機理重要。 必含代表語氣「光漂亮。接不好，修的人先見祖宗。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；光漂亮。接不好，修的人先見祖宗。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

#### bf-mara-okoye-farida.json — 先喊回來再算錢

`content/base/world/dialogues/bf-mara-okoye-farida.json`；類別 `dialogues`。瑪拉談法莉妲的燃夜援船，罵唱名的人別搶著替活人送葬。 掛到 character/mara-okoye, character/farida-naseri, place/hormuz；崩年底色1.8。範本 `content/base/world/dialogues/mara-okoye-watch-lamp.json`。

觸發定案：`{"入口":"既有房間與人物談話按鈕；須本人在當前房間","when":{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"any":[{"tag":"bf-receive-dhaka"},{"tag":"bf-receive-chittagong"},{"tag":"bf-receive-singapore"}]},{"cmp":{"a":{"ref":"flags.seen-bf-mara-okoye-farida"},"op":"==","b":0}}]},"順序":"bf-排在所有舊人物話題前；只一次，無永真後話"}`。硬派長輩口吻，先罵後接唱名；不混成法麗達拉赫曼，不給港口優惠。 必含代表語氣「船沒回來，先喊。葬詞不急著省工。」，但其餘2–4句由工人展開，每句≤40字。具名旁人僅既有記憶／轉述，未上船，不創新人物id。兩選項皆設seen；無永真後話。 光與代價：；船沒回來，先喊。葬詞不急著省工。。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：預期否（既有未談話軌跡）；指定新話題或晚期談話時會改狀態，列為條件性黃金風險。

排序例外是本批的明示設計：用新前綴bf-，先於既有永真話題；month>=1、地球port tag與seen==0都成立才顯示。每檔僅一topic、必有兩個choices，皆設seen；不可寫永真後話。這讓按鈕有機會顯示新內容且談完恢復舊內容。舊workflow要求新話題排後會讓ren/chen永遠抽不到，故以本交接書的可達性定案為準。具名旁人只有歷史轉述，不創作base person；不要把娜迪雅・薩布里與娜迪雅・馬斯里、法莉妲・納賽里與法麗達・拉赫曼混為同一人。

### 既有檔插入交接

本批每列「插入需求」合併去重後寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-07/inserts.json`，wf-table/1，columns `["file","jsonPath","op","value","why"]`；op只用append／setKey。本批僅append，完整值在review-draft。**工人不能套入既有檔**。合併線只在舊值不含該值時append，不能覆寫陣列；port tag與contractKinds接好才算可遇到。無年表插入。跨批新引用一律不要寫進content；若審定另有需求，列inserts等待合併線，不追改別批。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | worktree內寫完本批後，末行OK 0 errors；新警告原文進REPORT |
| `node src/ops/content/check.ts content/base` | 營運格式與引用，0 errors |
| `npm run typecheck` | worktree收尾，exit 0 |
| `npm test` | worktree收尾一次；黃金例外逐檔列證據 |
| `python3 wf/tools/tabledb.py` | 查範本、引擎事實、review本批；不整表讀 |
| `python3 wf/tools/content_index.py refs` | 只查既有引用，不重產索引 |
| `git status --short` | 記錄自己新增檔，node_modules為領導預置例外 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-play-07 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局 |

不上網、不用MCP、不跑GUI。本批不跑probe或自加戰役長測；不執行content_accept（那會建立基準worktree），領導收線處理。

## 資源與禁區

**可寫程式碼線**：實際只寫「範圍」的content白名單與報告目錄，worktree為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-07/`，不改程式、不commit。報告路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-07/`；臨時檔放 `/tmp/cx-bf-play-07/`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不使用外部服務。單檔整體改寫用單一操作。

**子代理上限 1 個**，模型隨意；只為本批實質工作，親自讀AGENTS.md、bf-common.md與本線先讀，同一可寫範圍、不得擴批，REPORT記成本品質。

**分清錯誤來源**：點名工具壞掉、worktree／manifest未備妥、沙箱拒寫→BLOCKED；自己指令或腳本錯→自己修。不得以沙箱失敗概括所有紅測試。

## 工作

1. 讀先讀、15列規格、逐檔範本與lore；確認領導預置manifest的base不為TBD、worktree存在；發PROGRESS。
2. 只新增15檔。報告中的插入需求去重，保留可觀察的接入方法，不套既有檔。
3. 跑上表指定檢查；寫review-rows.json、naming.json、inserts.json、REPORT；回報終局。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-07/REPORT.md`，回覆只要5行摘要＋REPORT路徑。新檔位置 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-07/content/base/world/`；其餘產物都在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-07/`。

`review-rows.json`：wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，恰好15列、白話≤60字；將草稿結構化掛點縮成lore id＋節點即可。`naming.json`：wf-table/1，columns `["id","nameEn","meaning","nameZh","method","status"]`；無新概念詞寫現有詞組合，nameEn可空，不將中文名回譯成aka。`inserts.json`採上一段格式；不需要timeline-add。

REPORT第一段「已讀清單」原樣列先讀路徑；再四段「做了什麼」「產出」（逐檔定位、掛點、git status原文、檢查exit與新警告、黃金紅的測試及fixture檔名）「沒做到或證據不足的」（尚未套inserts不得冒稱已上主線可達）「需要決定的事」（新專名提案／引擎缺口／衝突）；再「子代理」與「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree內自己改動恰好上列15個新content檔，沒有修改既有檔；以git status --short記錄，領導預置node_modules不算工人產物。
2. worktree內npm run check末行OK 0 errors、node src/ops/content/check.ts content/base為0 errors、npm run typecheck exit 0。
3. worktree內npm test exit 0；若只剩本批抽選／對話造成的黃金或寫死軌跡差異，可豁免但列測試與fixture檔名、原始錯誤，不改期望、不跑GOLDEN_UPDATE／rerecord；非黃金錯誤修到符合。
4. review-rows.json恰好15列且白話≤60字，naming.json與inserts.json合法；逐檔掛點、觸發與文字要點完成，沒有萬潮葬王／AI／月面營運件。
5. REPORT存在且開頭已讀清單完整，記本批是否改黃金與未套插入需求。

不要加驗其他東西；全批合併與黃金重錄歸領導。

## 失敗怎麼處置

- **測出來是壞的**→自己修到符合；修不好保留改動，REPORT寫哪條不符，發FAILED。
- **測不出來**→保持現狀，REPORT寫解除條件，發BLOCKED，不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-play-07`。本線團隊：`teams/bigfill`。上線先發PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-07 --up PROGRESS '已讀完，開始寫 bf-play-07' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-07 --up DONE 'bf-play-07 15檔完成，插入需求交合併線' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-07/REPORT.md`，STATUS與標題照實換。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡住超過10分鐘先發BLOCKED。

ROSTER由領導代登記。本稿不授權改既有檔、改黃金、建worktree或安裝套件。
