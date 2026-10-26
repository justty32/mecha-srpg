# 任務：照可玩內容計畫新增第 02 批——守住交班的岸（恰好 18 檔，batch bf-play-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠摘要**；REPORT 開頭「已讀清單」要列本行所有路徑），`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ops-content.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-02.md`。相對路徑相對 worktree；本稿與 plan、review-draft 可從主 repo 唯讀。用 tabledb 查 templates.json、engine-facts.json 與 review-draft.json 本批18列，不整份讀。逐檔 lore 與範本也要親讀。領導裁決 play-rulings.md 已存在，必讀；與本稿、plan、review-draft衝突時以裁決為準。

## 背景與唯一目標

讓玩家在現有地球營運中遇到 lore。你只產出本批 18 個新檔與報告，不再另設計件數、地圖或引擎。逐檔欄位定案與觸發完整存於 `review-draft.json` 的「掛到」物件；下面逐檔規格給寫手直接落稿。數值沿用同級範本，文字依要點展開，不能新增專名來填空。

**是否改黃金：會：接入 port tags／contractKinds 後加入世界抽選與新契約軌跡；新檔孤立尚未接線時預期不變。** 黃金紅時列檔名，不改期望、不跑 GOLDEN_UPDATE／rerecord。領導最後整批重錄一次；不要為了維持hash把新內容藏起來。

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

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-02/` 新增下面 **恰好 18 檔**；完整白名單亦在本批 manifest 的 files。只新增、不改既有檔。報告另寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-02/`。

- `content/base/world/encounters/rift-z-bf-nairobi-yoke-return.json`
- `content/base/world/contracts/bf-nairobi-yoke-return.json`
- `content/base/world/actions/board-bf-nairobi-yoke-return.json`
- `content/base/world/encounters/rift-z-bf-dhaka-first-stitch.json`
- `content/base/world/contracts/bf-dhaka-first-stitch.json`
- `content/base/world/actions/board-bf-dhaka-first-stitch.json`
- `content/base/world/encounters/rift-z-bf-anvil-shield-turn.json`
- `content/base/world/contracts/bf-anvil-shield-turn.json`
- `content/base/world/actions/board-bf-anvil-shield-turn.json`
- `content/base/world/encounters/rift-z-bf-saltgull-tide-ramp.json`
- `content/base/world/contracts/bf-saltgull-tide-ramp.json`
- `content/base/world/actions/board-bf-saltgull-tide-ramp.json`
- `content/base/world/encounters/rift-z-bf-league-lantern-keel.json`
- `content/base/world/contracts/bf-league-lantern-keel.json`
- `content/base/world/actions/board-bf-league-lantern-keel.json`
- `content/base/world/encounters/rift-z-bf-breakers-salt-needle.json`
- `content/base/world/contracts/bf-breakers-salt-needle.json`
- `content/base/world/actions/board-bf-breakers-salt-needle.json`

不做：不修改或刪除任何既有檔（含池、factions-ops、places、lore、timeline、索引、manifest）；不碰 `src/`、`test/`、`schemas/`、`specs/`、`wf/`（報告目錄除外）、`content/batches/`、`content/index/`；不做數值平衡，不做月面營運、萬潮葬王相關與 AI；不 commit。manifest 由領導預置，工人不可為了驗收改它。worktree 外不寫主 content；scratch/log 放 `/tmp/cx-bf-play-02/`。

件數 gate：content 新檔超過18或修改任一既有檔即停下回報；容量 gate：任一新content檔超過12 KB、合計超過180 KB即停下回報。REPORT ≤20 KB；其餘同質清單用資料檔。任一觸發都停。

### 逐檔規格

#### rift-z-bf-nairobi-yoke-return.json — 東非破軛待裝船：驅除伏耳・戰場

`content/base/world/encounters/rift-z-bf-nairobi-yoke-return.json`；類別 `encounters`。伏耳伏在岸石旁，東非騎手扛起破軛，請你替返程船清岸。 掛到 faction/nairobi, faction/yoke-saddle-works, place/mombasa；C/G；底色1.2、1.4。範本 `content/base/world/encounters/rift-beast-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-nairobi-yoke-return","地點":"place/chittagong"}`。破軛待裝回東非，伏耳壓住吉大港接應岸；借岸作戰，不是把獸帶去內陸；拘束不是馴化。 指定獸 伏耳（species/shell-ear／monster/shell-ear-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/shell-ear-d","物種":"species/shell-ear","族":"beast","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-nairobi-yoke-return.json — 東非破軛待裝船：驅除伏耳

`content/base/world/contracts/bf-nairobi-yoke-return.json`；類別 `contracts`。伏耳伏在岸石旁，東非騎手扛起破軛，請你替返程船清岸。 掛到 faction/nairobi, faction/yoke-saddle-works, place/mombasa；C/G；底色1.2、1.4。範本 `content/base/world/contracts/scout-rift-margin.json`。

觸發定案：`{"發包牌":"action/board-bf-nairobi-yoke-return","雇主":"faction-ops/nairobi","落點":"place/chittagong","門檻":-10}`。破軛待裝回東非，伏耳壓住吉大港接應岸；借岸作戰，不是把獸帶去內陸；拘束不是馴化。 指定獸 伏耳（species/shell-ear／monster/shell-ear-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/shell-ear-d","物種":"species/shell-ear","族":"beast","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-nairobi-yoke-return.json — 東非破軛待裝船：驅除伏耳・發包

`content/base/world/actions/board-bf-nairobi-yoke-return.json`；類別 `actions`。伏耳伏在岸石旁，東非騎手扛起破軛，請你替返程船清岸。 掛到 faction/nairobi, faction/yoke-saddle-works, place/mombasa；C/G；底色1.2、1.4。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":19}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.bf-posted-nairobi-yoke-return"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/nairobi.rep"},"op":">=","b":-10}}]}`。破軛待裝回東非，伏耳壓住吉大港接應岸；借岸作戰，不是把獸帶去內陸；拘束不是馴化。 指定獸 伏耳（species/shell-ear／monster/shell-ear-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/shell-ear-d","物種":"species/shell-ear","族":"beast","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-dhaka-first-stitch.json — 補天院撤料：守住蘆網河岸・戰場

`content/base/world/encounters/rift-z-bf-dhaka-first-stitch.json`；類別 `encounters`。蘆網把淡水岸織成陷阱；補天院喊這一針補天，要你守住撤料區。 掛到 faction/dhaka-weavers, place/dhaka-sail-court；N03；底色1.1、1.3。範本 `content/base/world/encounters/rift-mycelium-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-dhaka-first-stitch","地點":"place/dhaka"}`。達卡淡水河岸的蘆網截住撤料隊；守區六回合給學徒撤離，非虛構護送單位；不寫菌絲出海。 指定獸 蘆網（species/reed-lace／monster/reed-lace-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/reed-lace-c","物種":"species/reed-lace","族":"mycelium","等級":"C","生態位":"淡水河岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-dhaka-first-stitch.json — 補天院撤料：守住蘆網河岸

`content/base/world/contracts/bf-dhaka-first-stitch.json`；類別 `contracts`。蘆網把淡水岸織成陷阱；補天院喊這一針補天，要你守住撤料區。 掛到 faction/dhaka-weavers, place/dhaka-sail-court；N03；底色1.1、1.3。範本 `content/base/world/contracts/defend-citywall.json`。

觸發定案：`{"發包牌":"action/board-bf-dhaka-first-stitch","雇主":"faction-ops/dhaka-weavers","落點":"place/dhaka","門檻":-5}`。達卡淡水河岸的蘆網截住撤料隊；守區六回合給學徒撤離，非虛構護送單位；不寫菌絲出海。 指定獸 蘆網（species/reed-lace／monster/reed-lace-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/reed-lace-c","物種":"species/reed-lace","族":"mycelium","等級":"C","生態位":"淡水河岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-dhaka-first-stitch.json — 補天院撤料：守住蘆網河岸・發包

`content/base/world/actions/board-bf-dhaka-first-stitch.json`；類別 `actions`。蘆網把淡水岸織成陷阱；補天院喊這一針補天，要你守住撤料區。 掛到 faction/dhaka-weavers, place/dhaka-sail-court；N03；底色1.1、1.3。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":26}},{"tag":"bf-receive-dhaka"},{"cmp":{"a":{"ref":"flags.bf-posted-dhaka-first-stitch"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/dhaka-weavers.rep"},"op":">=","b":-5}}]}`。達卡淡水河岸的蘆網截住撤料隊；守區六回合給學徒撤離，非虛構護送單位；不寫菌絲出海。 指定獸 蘆網（species/reed-lace／monster/reed-lace-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/reed-lace-c","物種":"species/reed-lace","族":"mycelium","等級":"C","生態位":"淡水河岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-anvil-shield-turn.json — 鐵砧換盾空檔：擋住沫顎・戰場

`content/base/world/encounters/rift-z-bf-anvil-shield-turn.json`；類別 `encounters`。沫顎噴白沫時鐵砧正在換盾，老手嘴硬地請你頂住這班。 掛到 faction/anvil, place/hamburg；N08；底色1.11。範本 `content/base/world/encounters/rift-beast-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-anvil-shield-turn","地點":"place/chittagong"}`。鐵砧外派修甲班在吉大港通海斜坡換盾；嘴上說只借半步，傷機卻整列退到你身後。 指定獸 沫顎（species/foam-jaw／monster/foam-jaw-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/foam-jaw-c","物種":"species/foam-jaw","族":"beast","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-anvil-shield-turn.json — 鐵砧換盾空檔：擋住沫顎

`content/base/world/contracts/bf-anvil-shield-turn.json`；類別 `contracts`。沫顎噴白沫時鐵砧正在換盾，老手嘴硬地請你頂住這班。 掛到 faction/anvil, place/hamburg；N08；底色1.11。範本 `content/base/world/contracts/defend-citywall.json`。

觸發定案：`{"發包牌":"action/board-bf-anvil-shield-turn","雇主":"faction-ops/anvil-hunters","落點":"place/chittagong","門檻":-5}`。鐵砧外派修甲班在吉大港通海斜坡換盾；嘴上說只借半步，傷機卻整列退到你身後。 指定獸 沫顎（species/foam-jaw／monster/foam-jaw-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/foam-jaw-c","物種":"species/foam-jaw","族":"beast","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-anvil-shield-turn.json — 鐵砧換盾空檔：擋住沫顎・發包

`content/base/world/actions/board-bf-anvil-shield-turn.json`；類別 `actions`。沫顎噴白沫時鐵砧正在換盾，老手嘴硬地請你頂住這班。 掛到 faction/anvil, place/hamburg；N08；底色1.11。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":5}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.bf-posted-anvil-shield-turn"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/anvil-hunters.rep"},"op":">=","b":-5}}]}`。鐵砧外派修甲班在吉大港通海斜坡換盾；嘴上說只借半步，傷機卻整列退到你身後。 指定獸 沫顎（species/foam-jaw／monster/foam-jaw-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/foam-jaw-c","物種":"species/foam-jaw","族":"beast","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-saltgull-tide-ramp.json — 鹽鷗換班未到：岔鰭前守坡・戰場

`content/base/world/encounters/rift-z-bf-saltgull-tide-ramp.json`；類別 `encounters`。岔鰭拖著長尾出河口；鹽鷗的接班機未到，你得把坡守住。 掛到 faction/salt-gull, place/rotterdam-roost；N08；底色1.8。範本 `content/base/world/encounters/rift-beast-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-saltgull-tide-ramp","地點":"place/chittagong"}`。吉大港通海河口的岔鰭逼近卸甲坡；守區六回合換班，殺獸可選；不改2106停火，不把全殲當交班。 指定獸 岔鰭（species/split-fin／monster/split-fin-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/split-fin-c","物種":"species/split-fin","族":"beast","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-saltgull-tide-ramp.json — 鹽鷗換班未到：岔鰭前守坡

`content/base/world/contracts/bf-saltgull-tide-ramp.json`；類別 `contracts`。岔鰭拖著長尾出河口；鹽鷗的接班機未到，你得把坡守住。 掛到 faction/salt-gull, place/rotterdam-roost；N08；底色1.8。範本 `content/base/world/contracts/defend-citywall.json`。

觸發定案：`{"發包牌":"action/board-bf-saltgull-tide-ramp","雇主":"faction-ops/salt-gull-hunters","落點":"place/chittagong","門檻":-5}`。吉大港通海河口的岔鰭逼近卸甲坡；守區六回合換班，殺獸可選；不改2106停火，不把全殲當交班。 指定獸 岔鰭（species/split-fin／monster/split-fin-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/split-fin-c","物種":"species/split-fin","族":"beast","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-saltgull-tide-ramp.json — 鹽鷗換班未到：岔鰭前守坡・發包

`content/base/world/actions/board-bf-saltgull-tide-ramp.json`；類別 `actions`。岔鰭拖著長尾出河口；鹽鷗的接班機未到，你得把坡守住。 掛到 faction/salt-gull, place/rotterdam-roost；N08；底色1.8。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":12}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.bf-posted-saltgull-tide-ramp"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/salt-gull-hunters.rep"},"op":">=","b":-5}}]}`。吉大港通海河口的岔鰭逼近卸甲坡；守區六回合換班，殺獸可選；不改2106停火，不把全殲當交班。 指定獸 岔鰭（species/split-fin／monster/split-fin-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/split-fin-c","物種":"species/split-fin","族":"beast","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-league-lantern-keel.json — 殘聯夜班起航：擊落燈腹・戰場

`content/base/world/encounters/rift-z-bf-league-lantern-keel.json`；類別 `encounters`。燈腹倒掛在港上，殘聯夜航隊喊別把獸光當航燈，請你擊落牠。 掛到 faction/league, place/chittagong；F/G；底色1.4、1.6。範本 `content/base/world/encounters/insect-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-league-lantern-keel","地點":"place/chittagong"}`。吉大港借桌的殘聯窗口發約，燈腹正擋住本班起航；不宣稱殘聯擁有港口。 指定獸 燈腹（species/lantern-keel／monster/lantern-keel-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/lantern-keel-c","物種":"species/lantern-keel","族":"insect","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-league-lantern-keel.json — 殘聯夜班起航：擊落燈腹

`content/base/world/contracts/bf-league-lantern-keel.json`；類別 `contracts`。燈腹倒掛在港上，殘聯夜航隊喊別把獸光當航燈，請你擊落牠。 掛到 faction/league, place/chittagong；F/G；底色1.4、1.6。範本 `content/base/world/contracts/scout-rift-margin.json`。

觸發定案：`{"發包牌":"action/board-bf-league-lantern-keel","雇主":"faction-ops/residual-league","落點":"place/chittagong","門檻":-10}`。吉大港借桌的殘聯窗口發約，燈腹正擋住本班起航；不宣稱殘聯擁有港口。 指定獸 燈腹（species/lantern-keel／monster/lantern-keel-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/lantern-keel-c","物種":"species/lantern-keel","族":"insect","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-league-lantern-keel.json — 殘聯夜班起航：擊落燈腹・發包

`content/base/world/actions/board-bf-league-lantern-keel.json`；類別 `actions`。燈腹倒掛在港上，殘聯夜航隊喊別把獸光當航燈，請你擊落牠。 掛到 faction/league, place/chittagong；F/G；底色1.4、1.6。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":19}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.bf-posted-league-lantern-keel"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/residual-league.rep"},"op":">=","b":-10}}]}`。吉大港借桌的殘聯窗口發約，燈腹正擋住本班起航；不宣稱殘聯擁有港口。 指定獸 燈腹（species/lantern-keel／monster/lantern-keel-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/lantern-keel-c","物種":"species/lantern-keel","族":"insect","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-breakers-salt-needle.json — 拆船班急停：拔掉坡上鹽針・戰場

`content/base/world/encounters/rift-z-bf-breakers-salt-needle.json`；類別 `encounters`。鹽針把尾針插滿拆船坡，工頭喊先拆會動的，死鐵晚點再算。 掛到 faction/chittagong-breakers, place/chittagong；N03；底色1.3、1.4。範本 `content/base/world/encounters/insect-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-breakers-salt-needle","地點":"place/chittagong"}`。拆船班透過殘聯借桌窗口委託；聲望只加殘聯。仍開放的內側拆船坡出現鹽針，當班吊臂已停；不引用或另開外灘禁區劇情。 指定獸 鹽針（species/brinepin／monster/brinepin-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/brinepin-d","物種":"species/brinepin","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-breakers-salt-needle.json — 拆船班急停：拔掉坡上鹽針

`content/base/world/contracts/bf-breakers-salt-needle.json`；類別 `contracts`。鹽針把尾針插滿拆船坡，工頭喊先拆會動的，死鐵晚點再算。 掛到 faction/chittagong-breakers, place/chittagong；N03；底色1.3、1.4。範本 `content/base/world/contracts/scout-rift-margin.json`。

觸發定案：`{"發包牌":"action/board-bf-breakers-salt-needle","雇主":"faction-ops/residual-league","落點":"place/chittagong","門檻":-10}`。拆船班透過殘聯借桌窗口委託；聲望只加殘聯。仍開放的內側拆船坡出現鹽針，當班吊臂已停；不引用或另開外灘禁區劇情。 指定獸 鹽針（species/brinepin／monster/brinepin-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/brinepin-d","物種":"species/brinepin","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-breakers-salt-needle.json — 拆船班急停：拔掉坡上鹽針・發包

`content/base/world/actions/board-bf-breakers-salt-needle.json`；類別 `actions`。鹽針把尾針插滿拆船坡，工頭喊先拆會動的，死鐵晚點再算。 掛到 faction/chittagong-breakers, place/chittagong；N03；底色1.3、1.4。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":26}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.bf-posted-breakers-salt-needle"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/residual-league.rep"},"op":">=","b":-10}}]}`。拆船班透過殘聯借桌窗口委託；聲望只加殘聯。仍開放的內側拆船坡出現鹽針，當班吊臂已停；不引用或另開外灘禁區劇情。 指定獸 鹽針（species/brinepin／monster/brinepin-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/brinepin-d","物種":"species/brinepin","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

同組三檔互相引用，沒有跨批新 id。每組出場獸、species／monster id、生態位及主目標見本列「出場怪獸」；契約的 killTarget.params.target 使用既有 monster id，現有 scenario.ts 先匹配、缺席時補入；optional:true 也會展開目標，所以守區／撐回合組仍有明確出場獸。不得把 monster id 寫成不存在的 encounter 欄位，也不得把生物 frame 當野獸。encounter 的 D:2/C:1、尺寸、地形權重照同族淺層範本；明選 encounter 的快照 width=D，現況只抽兩隻同族 D；指定獸未抽到才補一隻，總量2–3（C目標固定補一隻）。這是既有接法的結果，不更改舊數值或假稱C預算自動生效。此輪沒有深海／內陸海獸任務，菌絲只在達卡淡水岸；16組共用14種既有D/C物種，12種來自kaiju2，礁背與抱樁為既有獸。不得額外加B/A/S獸。

三組 hold 主目標為6回合、不填zone，引擎展開可達區；killTarget為可選，殺獸不提前完成主守區。survive組8回合、指定獸可選；其他組只需擊破指定獸，不必全殲。目標欄位結構參照現有epithet-bounty／seal-anchor-watch，報酬門檻仍沿本列同級主範本。兩件以拆船班／核交易所為敘事請託者，由殘聯現有窗口代接，聲望只加殘聯；不可新增不存在的營運勢力引用。

### 既有檔插入交接

本批每列「插入需求」合併去重後寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-02/inserts.json`，wf-table/1，columns `["file","jsonPath","op","value","why"]`；op只用append／setKey。本批僅append，完整值在review-draft。**工人不能套入既有檔**。合併線只在舊值不含該值時append，不能覆寫陣列；port tag與contractKinds接好才算可遇到。無年表插入。跨批新引用一律不要寫進content；若審定另有需求，列inserts等待合併線，不追改別批。

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
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-play-02 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局 |

不上網、不用MCP、不跑GUI。本批不跑probe或自加戰役長測；不執行content_accept（那會建立基準worktree），領導收線處理。

## 資源與禁區

**可寫程式碼線**：實際只寫「範圍」的content白名單與報告目錄，worktree為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-02/`，不改程式、不commit。報告路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-02/`；臨時檔放 `/tmp/cx-bf-play-02/`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不使用外部服務。單檔整體改寫用單一操作。

**子代理上限 1 個**，模型隨意；只為本批實質工作，親自讀AGENTS.md、bf-common.md與本線先讀，同一可寫範圍、不得擴批，REPORT記成本品質。

**分清錯誤來源**：點名工具壞掉、worktree／manifest未備妥、沙箱拒寫→BLOCKED；自己指令或腳本錯→自己修。不得以沙箱失敗概括所有紅測試。

## 工作

1. 讀先讀、18列規格、逐檔範本與lore；確認領導預置manifest的base不為TBD、worktree存在；發PROGRESS。
2. 只新增18檔。報告中的插入需求去重，保留可觀察的接入方法，不套既有檔。
3. 跑上表指定檢查；寫review-rows.json、naming.json、inserts.json、REPORT；回報終局。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-02/REPORT.md`，回覆只要5行摘要＋REPORT路徑。新檔位置 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-02/content/base/world/`；其餘產物都在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-02/`。

`review-rows.json`：wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，恰好18列、白話≤60字；將草稿結構化掛點縮成lore id＋節點即可。`naming.json`：wf-table/1，columns `["id","nameEn","meaning","nameZh","method","status"]`；無新概念詞寫現有詞組合，nameEn可空，不將中文名回譯成aka。`inserts.json`採上一段格式；不需要timeline-add。

REPORT第一段「已讀清單」原樣列先讀路徑；再四段「做了什麼」「產出」（逐檔定位、掛點、git status原文、檢查exit與新警告、黃金紅的測試及fixture檔名）「沒做到或證據不足的」（尚未套inserts不得冒稱已上主線可達）「需要決定的事」（新專名提案／引擎缺口／衝突）；再「子代理」與「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree內自己改動恰好上列18個新content檔，沒有修改既有檔；以git status --short記錄，領導預置node_modules不算工人產物。
2. worktree內npm run check末行OK 0 errors、node src/ops/content/check.ts content/base為0 errors、npm run typecheck exit 0。
3. worktree內npm test exit 0；若只剩本批抽選／對話造成的黃金或寫死軌跡差異，可豁免但列測試與fixture檔名、原始錯誤，不改期望、不跑GOLDEN_UPDATE／rerecord；非黃金錯誤修到符合。
4. review-rows.json恰好18列且白話≤60字，naming.json與inserts.json合法；逐檔掛點、觸發與文字要點完成，沒有萬潮葬王／AI／月面營運件。
5. REPORT存在且開頭已讀清單完整，記本批是否改黃金與未套插入需求。

不要加驗其他東西；全批合併與黃金重錄歸領導。

## 失敗怎麼處置

- **測出來是壞的**→自己修到符合；修不好保留改動，REPORT寫哪條不符，發FAILED。
- **測不出來**→保持現狀，REPORT寫解除條件，發BLOCKED，不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-play-02`。本線團隊：`teams/bigfill`。上線先發PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-02 --up PROGRESS '已讀完，開始寫 bf-play-02' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-02 --up DONE 'bf-play-02 18檔完成，插入需求交合併線' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-02/REPORT.md`，STATUS與標題照實換。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡住超過10分鐘先發BLOCKED。

ROSTER由領導代登記。本稿不授權改既有檔、改黃金、建worktree或安裝套件。
