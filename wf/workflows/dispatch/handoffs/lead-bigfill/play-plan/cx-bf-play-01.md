# 任務：照可玩內容計畫新增第 01 批——外派船抵港，先過獸關（恰好 18 檔，batch bf-play-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠摘要**；REPORT 開頭「已讀清單」要列本行所有路徑），`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/ops-content.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-rep/REPORT.md`、`wf/workflows/planning/specs/ops/content-format-ops.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`wf/workflows/planning/specs/ops/content-format-ops/factions-war.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-01.md`。相對路徑相對 worktree；本稿與 plan、review-draft 可從主 repo 唯讀。用 tabledb 查 templates.json、engine-facts.json 與 review-draft.json 本批18列，不整份讀。逐檔 lore 與範本也要親讀。領導裁決 play-rulings.md 已存在，必讀；與本稿、plan、review-draft衝突時以裁決為準。

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

只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-01/` 新增下面 **恰好 18 檔**；完整白名單亦在本批 manifest 的 files。只新增、不改既有檔。報告另寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-01/`。

- `content/base/world/encounters/rift-z-bf-court-grain.json`
- `content/base/world/contracts/bf-court-grain.json`
- `content/base/world/actions/board-bf-court-grain.json`
- `content/base/world/encounters/rift-z-bf-tiksi-raincoat.json`
- `content/base/world/contracts/bf-tiksi-raincoat.json`
- `content/base/world/actions/board-bf-tiksi-raincoat.json`
- `content/base/world/encounters/rift-z-bf-sendai-gate.json`
- `content/base/world/contracts/bf-sendai-gate.json`
- `content/base/world/actions/board-bf-sendai-gate.json`
- `content/base/world/encounters/rift-z-bf-seattle-return-gun.json`
- `content/base/world/contracts/bf-seattle-return-gun.json`
- `content/base/world/actions/board-bf-seattle-return-gun.json`
- `content/base/world/encounters/rift-z-bf-genoa-shared-forge.json`
- `content/base/world/contracts/bf-genoa-shared-forge.json`
- `content/base/world/actions/board-bf-genoa-shared-forge.json`
- `content/base/world/encounters/rift-z-bf-quito-coast-beacon.json`
- `content/base/world/contracts/bf-quito-coast-beacon.json`
- `content/base/world/actions/board-bf-quito-coast-beacon.json`

不做：不修改或刪除任何既有檔（含池、factions-ops、places、lore、timeline、索引、manifest）；不碰 `src/`、`test/`、`schemas/`、`specs/`、`wf/`（報告目錄除外）、`content/batches/`、`content/index/`；不做數值平衡，不做月面營運、萬潮葬王相關與 AI；不 commit。manifest 由領導預置，工人不可為了驗收改它。worktree 外不寫主 content；scratch/log 放 `/tmp/cx-bf-play-01/`。

件數 gate：content 新檔超過18或修改任一既有檔即停下回報；容量 gate：任一新content檔超過12 KB、合計超過180 KB即停下回報。REPORT ≤20 KB；其餘同質清單用資料檔。任一觸發都停。

### 逐檔規格

#### rift-z-bf-court-grain.json — 朝廷糧船待卸：頂住鹽針・戰場

`content/base/world/encounters/rift-z-bf-court-grain.json`；類別 `encounters`。鹽針伏在卸船坡；朝廷外派人吼著赴牆詔，請你頂住這一班。 掛到 faction/imperial-court, place/court-seat；C/G；底色1.4、1.6。範本 `content/base/world/encounters/insect-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-court-grain","地點":"place/singapore"}`。外派糧船已抵新加坡，卸船坡的鹽針正讓換班停住；喊「糧先進門！」。 指定獸 鹽針（species/brinepin／monster/brinepin-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/brinepin-d","物種":"species/brinepin","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-court-grain.json — 朝廷糧船待卸：頂住鹽針

`content/base/world/contracts/bf-court-grain.json`；類別 `contracts`。鹽針伏在卸船坡；朝廷外派人吼著赴牆詔，請你頂住這一班。 掛到 faction/imperial-court, place/court-seat；C/G；底色1.4、1.6。範本 `content/base/world/contracts/defend-citywall.json`。

觸發定案：`{"發包牌":"action/board-bf-court-grain","雇主":"faction-ops/imperial-court","落點":"place/singapore","門檻":-5}`。外派糧船已抵新加坡，卸船坡的鹽針正讓換班停住；喊「糧先進門！」。 指定獸 鹽針（species/brinepin／monster/brinepin-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/brinepin-d","物種":"species/brinepin","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-court-grain.json — 朝廷糧船待卸：頂住鹽針・發包

`content/base/world/actions/board-bf-court-grain.json`；類別 `actions`。鹽針伏在卸船坡；朝廷外派人吼著赴牆詔，請你頂住這一班。 掛到 faction/imperial-court, place/court-seat；C/G；底色1.4、1.6。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":5}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.bf-posted-court-grain"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/imperial-court.rep"},"op":">=","b":-5}}]}`。外派糧船已抵新加坡，卸船坡的鹽針正讓換班停住；喊「糧先進門！」。 指定獸 鹽針（species/brinepin／monster/brinepin-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/brinepin-d","物種":"species/brinepin","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-tiksi-raincoat.json — 北方傷機待卸：擊破砂扇・戰場

`content/base/world/encounters/rift-z-bf-tiksi-raincoat.json`；類別 `encounters`。北方船拖著傷機抵港，砂扇攤開棘面；先破牠，才有岸可卸。 掛到 faction/russia-umbrella, place/tiksi, place/kamchatka-wells；E/F；底色1.8。範本 `content/base/world/encounters/insect-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-tiksi-raincoat","地點":"place/chittagong"}`。北方來船只能在吉大港接應岸停靠；砂扇堵坡，不能再等一班；不寫空袖物件。 指定獸 砂扇（species/grit-fan／monster/grit-fan-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/grit-fan-d","物種":"species/grit-fan","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-tiksi-raincoat.json — 北方傷機待卸：擊破砂扇

`content/base/world/contracts/bf-tiksi-raincoat.json`；類別 `contracts`。北方船拖著傷機抵港，砂扇攤開棘面；先破牠，才有岸可卸。 掛到 faction/russia-umbrella, place/tiksi, place/kamchatka-wells；E/F；底色1.8。範本 `content/base/world/contracts/scout-rift-margin.json`。

觸發定案：`{"發包牌":"action/board-bf-tiksi-raincoat","雇主":"faction-ops/russia-umbrella","落點":"place/chittagong","門檻":-10}`。北方來船只能在吉大港接應岸停靠；砂扇堵坡，不能再等一班；不寫空袖物件。 指定獸 砂扇（species/grit-fan／monster/grit-fan-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/grit-fan-d","物種":"species/grit-fan","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-tiksi-raincoat.json — 北方傷機待卸：擊破砂扇・發包

`content/base/world/actions/board-bf-tiksi-raincoat.json`；類別 `actions`。北方船拖著傷機抵港，砂扇攤開棘面；先破牠，才有岸可卸。 掛到 faction/russia-umbrella, place/tiksi, place/kamchatka-wells；E/F；底色1.8。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":12}},{"tag":"bf-receive-chittagong"},{"cmp":{"a":{"ref":"flags.bf-posted-tiksi-raincoat"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/russia-umbrella.rep"},"op":">=","b":-10}}]}`。北方來船只能在吉大港接應岸停靠；砂扇堵坡，不能再等一班；不寫空袖物件。 指定獸 砂扇（species/grit-fan／monster/grit-fan-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/grit-fan-d","物種":"species/grit-fan","族":"insect","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-sendai-gate.json — 仙台傷機待卸：抱樁下守住坡口・戰場

`content/base/world/encounters/rift-z-bf-sendai-gate.json`；類別 `encounters`。抱樁攀住新加坡泊位，仙台船員要你守區，讓傷機撤進港。 掛到 faction/japan-umbrella, place/sendai-wall；C；底色1.1、1.2。範本 `content/base/world/encounters/rift-alien-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-sendai-gate","地點":"place/singapore"}`。傷機自仙台抵港；抱樁在卸甲坡外張開肢體。守區六回合，殺獸可選；守燈只作故鄉傳聞，絕不分身。 指定獸 抱樁（species/breakwater-clinger／monster/breakwater-clinger-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/breakwater-clinger-c","物種":"species/breakwater-clinger","族":"alien","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-sendai-gate.json — 仙台傷機待卸：抱樁下守住坡口

`content/base/world/contracts/bf-sendai-gate.json`；類別 `contracts`。抱樁攀住新加坡泊位，仙台船員要你守區，讓傷機撤進港。 掛到 faction/japan-umbrella, place/sendai-wall；C；底色1.1、1.2。範本 `content/base/world/contracts/defend-citywall.json`。

觸發定案：`{"發包牌":"action/board-bf-sendai-gate","雇主":"faction-ops/japan-umbrella","落點":"place/singapore","門檻":-5}`。傷機自仙台抵港；抱樁在卸甲坡外張開肢體。守區六回合，殺獸可選；守燈只作故鄉傳聞，絕不分身。 指定獸 抱樁（species/breakwater-clinger／monster/breakwater-clinger-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/breakwater-clinger-c","物種":"species/breakwater-clinger","族":"alien","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-sendai-gate.json — 仙台傷機待卸：抱樁下守住坡口・發包

`content/base/world/actions/board-bf-sendai-gate.json`；類別 `actions`。抱樁攀住新加坡泊位，仙台船員要你守區，讓傷機撤進港。 掛到 faction/japan-umbrella, place/sendai-wall；C；底色1.1、1.2。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":19}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.bf-posted-sendai-gate"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/japan-umbrella.rep"},"op":">=","b":-5}}]}`。傷機自仙台抵港；抱樁在卸甲坡外張開肢體。守區六回合，殺獸可選；守燈只作故鄉傳聞，絕不分身。 指定獸 抱樁（species/breakwater-clinger／monster/breakwater-clinger-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。守區用hold、rounds=6且不填zone，既有引擎展開可達區；不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/breakwater-clinger-c","物種":"species/breakwater-clinger","族":"alien","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"hold","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-seattle-return-gun.json — 歸船砲件待入港：截下濺蹄・戰場

`content/base/world/encounters/rift-z-bf-seattle-return-gun.json`；類別 `encounters`。濺蹄掠過卸砲坡，西雅圖來客喊歸船仍朝海，請你截住牠。 掛到 faction/north-american-umbrella, place/seattle；F/G；底色1.6、1.8。範本 `content/base/world/encounters/rift-beast-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-seattle-return-gun","地點":"place/singapore"}`。運的是既有歸船斷座夜留下的砲座紀念件；戰鬥在新加坡海岸，不重演或改寫西雅圖勝負。 指定獸 濺蹄（species/surf-runner／monster/surf-runner-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/surf-runner-d","物種":"species/surf-runner","族":"beast","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-seattle-return-gun.json — 歸船砲件待入港：截下濺蹄

`content/base/world/contracts/bf-seattle-return-gun.json`；類別 `contracts`。濺蹄掠過卸砲坡，西雅圖來客喊歸船仍朝海，請你截住牠。 掛到 faction/north-american-umbrella, place/seattle；F/G；底色1.6、1.8。範本 `content/base/world/contracts/scout-rift-margin.json`。

觸發定案：`{"發包牌":"action/board-bf-seattle-return-gun","雇主":"faction-ops/north-american-umbrella","落點":"place/singapore","門檻":-10}`。運的是既有歸船斷座夜留下的砲座紀念件；戰鬥在新加坡海岸，不重演或改寫西雅圖勝負。 指定獸 濺蹄（species/surf-runner／monster/surf-runner-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/surf-runner-d","物種":"species/surf-runner","族":"beast","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-seattle-return-gun.json — 歸船砲件待入港：截下濺蹄・發包

`content/base/world/actions/board-bf-seattle-return-gun.json`；類別 `actions`。濺蹄掠過卸砲坡，西雅圖來客喊歸船仍朝海，請你截住牠。 掛到 faction/north-american-umbrella, place/seattle；F/G；底色1.6、1.8。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":26}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.bf-posted-seattle-return-gun"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/north-american-umbrella.rep"},"op":">=","b":-10}}]}`。運的是既有歸船斷座夜留下的砲座紀念件；戰鬥在新加坡海岸，不重演或改寫西雅圖勝負。 指定獸 濺蹄（species/surf-runner／monster/surf-runner-d）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/surf-runner-d","物種":"species/surf-runner","族":"beast","等級":"D","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-genoa-shared-forge.json — 熱那亞修甲班開工：拆掉扣甲・戰場

`content/base/world/encounters/rift-z-bf-genoa-shared-forge.json`；類別 `encounters`。扣甲夾住卸料道，熱那亞工匠賭你比牠先拆開那副甲。 掛到 faction/inner-sea-houses, place/genoa-yards；N03；底色1.3。範本 `content/base/world/encounters/insect-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-genoa-shared-forge","地點":"place/singapore"}`。外派工匠在新加坡等當班材料；先打扣甲再開工。喊「今晚輪到我們拆你！」，是人的挑釁，不寫獸回話。 指定獸 扣甲（species/hinge-crab／monster/hinge-crab-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/hinge-crab-c","物種":"species/hinge-crab","族":"insect","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-genoa-shared-forge.json — 熱那亞修甲班開工：拆掉扣甲

`content/base/world/contracts/bf-genoa-shared-forge.json`；類別 `contracts`。扣甲夾住卸料道，熱那亞工匠賭你比牠先拆開那副甲。 掛到 faction/inner-sea-houses, place/genoa-yards；N03；底色1.3。範本 `content/base/world/contracts/scout-rift-margin.json`。

觸發定案：`{"發包牌":"action/board-bf-genoa-shared-forge","雇主":"faction-ops/inner-sea-houses","落點":"place/singapore","門檻":-10}`。外派工匠在新加坡等當班材料；先打扣甲再開工。喊「今晚輪到我們拆你！」，是人的挑釁，不寫獸回話。 指定獸 扣甲（species/hinge-crab／monster/hinge-crab-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/hinge-crab-c","物種":"species/hinge-crab","族":"insect","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-genoa-shared-forge.json — 熱那亞修甲班開工：拆掉扣甲・發包

`content/base/world/actions/board-bf-genoa-shared-forge.json`；類別 `actions`。扣甲夾住卸料道，熱那亞工匠賭你比牠先拆開那副甲。 掛到 faction/inner-sea-houses, place/genoa-yards；N03；底色1.3。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":5}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.bf-posted-genoa-shared-forge"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/inner-sea-houses.rep"},"op":">=","b":-10}}]}`。外派工匠在新加坡等當班材料；先打扣甲再開工。喊「今晚輪到我們拆你！」，是人的挑釁，不寫獸回話。 指定獸 扣甲（species/hinge-crab／monster/hinge-crab-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/hinge-crab-c","物種":"species/hinge-crab","族":"insect","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"killTarget","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### rift-z-bf-quito-coast-beacon.json — 基多接應燈將熄：撐過空帆・戰場

`content/base/world/encounters/rift-z-bf-quito-coast-beacon.json`；類別 `encounters`。空帆遮住接應燈，基多外站請你撐到傷機離開外泊位。 掛到 faction/quito, place/valparaiso；F/G；底色1.11。範本 `content/base/world/encounters/rift-alien-shallow.json`。

觸發定案：`{"由契約指定":"contract/bf-quito-coast-beacon","地點":"place/singapore"}`。新加坡外泊位的浮空異形遮燈，現在是離岸窗口；維拉科查不出洲。 指定獸 空帆（species/hollow-sail／monster/hollow-sail-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 遭遇本身不加monster/species白名單假欄；出場保證由同組契約提供。 出場怪獸：{"指定出場":"monster/hollow-sail-c","物種":"species/hollow-sail","族":"alien","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### bf-quito-coast-beacon.json — 基多接應燈將熄：撐過空帆

`content/base/world/contracts/bf-quito-coast-beacon.json`；類別 `contracts`。空帆遮住接應燈，基多外站請你撐到傷機離開外泊位。 掛到 faction/quito, place/valparaiso；F/G；底色1.11。範本 `content/base/world/contracts/defend-citywall.json`。

觸發定案：`{"發包牌":"action/board-bf-quito-coast-beacon","雇主":"faction-ops/quito","落點":"place/singapore","門檻":-5}`。新加坡外泊位的浮空異形遮燈，現在是離岸窗口；維拉科查不出洲。 指定獸 空帆（species/hollow-sail／monster/hollow-sail-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 金額、聲望、期限沿主範本；killTarget結構參照epithet-bounty、hold結構參照seal-anchor-watch，不挪用其高階報酬。 出場怪獸：{"指定出場":"monster/hollow-sail-c","物種":"species/hollow-sail","族":"alien","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

#### board-bf-quito-coast-beacon.json — 基多接應燈將熄：撐過空帆・發包

`content/base/world/actions/board-bf-quito-coast-beacon.json`；類別 `actions`。空帆遮住接應燈，基多外站請你撐到傷機離開外泊位。 掛到 faction/quito, place/valparaiso；F/G；底色1.11。範本 `content/base/world/actions/board-rival-carcass-claim.json`。

觸發定案：`{"all":[{"cmp":{"a":{"ref":"calendar.month"},"op":">=","b":1}},{"cmp":{"a":{"ref":"calendar.dom"},"op":"==","b":12}},{"tag":"bf-receive-singapore"},{"cmp":{"a":{"ref":"flags.bf-posted-quito-coast-beacon"},"op":"==","b":0}},{"cmp":{"a":{"ref":"campaign.factions.base:faction-ops/quito.rep"},"op":">=","b":-5}}]}`。新加坡外泊位的浮空異形遮燈，現在是離岸窗口；維拉科查不出洲。 指定獸 空帆（species/hollow-sail／monster/hollow-sail-c）必須寫在契約name；此name亦要保留現在必須接戰的理由。不造獸二名或新招式專名。 只發同組一份；不添加全域事件或怪獸池。 出場怪獸：{"指定出場":"monster/hollow-sail-c","物種":"species/hollow-sail","族":"alien","等級":"C","生態位":"港口／通海河口／海岸","保證接法":"契約 killTarget.params.target；先匹配，缺席時補入；optional亦執行此展開","主目標":"survive","隨機伴隨":"沿範本D級同族池；明示encounter的width=D，目前C預算不執行，不宣稱所有同族種固定出場","總量":"範本D:2；指定獸未抽到時額外1，故共2–3；C指定獸固定額外1；不是改舊數值"}。 欄位按本列「欄位定案」照抄；其中文字方向是給寫手的要求，不能把「choice1」「text方向」「lines的規格字串」當遊戲欄位或全文輸出。光、角色脾氣、代表句、出場怪獸與限額分類是寫作要求，不能新增到遊戲JSON。id 固定為 manifest 本檔對應 id。是否改黃金：是（接線後）；孤立新檔未啟用時否。

同組三檔互相引用，沒有跨批新 id。每組出場獸、species／monster id、生態位及主目標見本列「出場怪獸」；契約的 killTarget.params.target 使用既有 monster id，現有 scenario.ts 先匹配、缺席時補入；optional:true 也會展開目標，所以守區／撐回合組仍有明確出場獸。不得把 monster id 寫成不存在的 encounter 欄位，也不得把生物 frame 當野獸。encounter 的 D:2/C:1、尺寸、地形權重照同族淺層範本；明選 encounter 的快照 width=D，現況只抽兩隻同族 D；指定獸未抽到才補一隻，總量2–3（C目標固定補一隻）。這是既有接法的結果，不更改舊數值或假稱C預算自動生效。此輪沒有深海／內陸海獸任務，菌絲只在達卡淡水岸；16組共用14種既有D/C物種，12種來自kaiju2，礁背與抱樁為既有獸。不得額外加B/A/S獸。

三組 hold 主目標為6回合、不填zone，引擎展開可達區；killTarget為可選，殺獸不提前完成主守區。survive組8回合、指定獸可選；其他組只需擊破指定獸，不必全殲。目標欄位結構參照現有epithet-bounty／seal-anchor-watch，報酬門檻仍沿本列同級主範本。兩件以拆船班／核交易所為敘事請託者，由殘聯現有窗口代接，聲望只加殘聯；不可新增不存在的營運勢力引用。

### 既有檔插入交接

本批每列「插入需求」合併去重後寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-01/inserts.json`，wf-table/1，columns `["file","jsonPath","op","value","why"]`；op只用append／setKey。本批僅append，完整值在review-draft。**工人不能套入既有檔**。合併線只在舊值不含該值時append，不能覆寫陣列；port tag與contractKinds接好才算可遇到。無年表插入。跨批新引用一律不要寫進content；若審定另有需求，列inserts等待合併線，不追改別批。

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
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-play-01 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局 |

不上網、不用MCP、不跑GUI。本批不跑probe或自加戰役長測；不執行content_accept（那會建立基準worktree），領導收線處理。

## 資源與禁區

**可寫程式碼線**：實際只寫「範圍」的content白名單與報告目錄，worktree為 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-01/`，不改程式、不commit。報告路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-01/`；臨時檔放 `/tmp/cx-bf-play-01/`。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不使用外部服務。單檔整體改寫用單一操作。

**子代理上限 1 個**，模型隨意；只為本批實質工作，親自讀AGENTS.md、bf-common.md與本線先讀，同一可寫範圍、不得擴批，REPORT記成本品質。

**分清錯誤來源**：點名工具壞掉、worktree／manifest未備妥、沙箱拒寫→BLOCKED；自己指令或腳本錯→自己修。不得以沙箱失敗概括所有紅測試。

## 工作

1. 讀先讀、18列規格、逐檔範本與lore；確認領導預置manifest的base不為TBD、worktree存在；發PROGRESS。
2. 只新增18檔。報告中的插入需求去重，保留可觀察的接入方法，不套既有檔。
3. 跑上表指定檢查；寫review-rows.json、naming.json、inserts.json、REPORT；回報終局。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-01/REPORT.md`，回覆只要5行摘要＋REPORT路徑。新檔位置 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-01/content/base/world/`；其餘產物都在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-01/`。

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

- 我是誰：`cx-bf-play-01`。本線團隊：`teams/bigfill`。上線先發PROGRESS：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-01 --up PROGRESS '已讀完，開始寫 bf-play-01' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-01 --up DONE 'bf-play-01 18檔完成，插入需求交合併線' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-01/REPORT.md`，STATUS與標題照實換。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡住超過10分鐘先發BLOCKED。

ROSTER由領導代登記。本稿不授權改既有檔、改黃金、建worktree或安裝套件。
