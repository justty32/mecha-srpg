# plan-02：舊軍工非核心件與機甲史設計計畫

## 已讀清單

本線 `cx-mf-plan02`／`teams/mech`，2026-10-26。下列指定材料均由本線親自讀取；路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg`。資料表分段讀取；年表只查相關條目，未整份讀入。

規矩與創作入口：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`（21 條）、`wf/workflows/content/templates.json`（19 條）、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/polish.md`。

設定與文體：`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/mechs.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/c-essence.md`。

既有內容：`content/lore/timeline.json`（指定九個節點及前後關聯）、`content/lore/factions/mimic-works.json`、`content/lore/factions/league-armory.json`、`content/lore/factions/selene.json`、`content/lore/events/mimic-one.json`、`content/lore/events/shield-open-carving.json`、`content/lore/events/longspear-leak.json`、`content/lore/events/lance-v4.json`、`content/lore/events/ironsword-open-pattern.json`、`wf/workflows/dispatch/handoffs/lead-fill-mech/mf-01/review-rows.json`（6 列）、交接書 `wf/workflows/dispatch/handoffs/lead-fill-mech/cx-mf-plan02.md`。

補讀路由與工具契約：`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`、`wf/workflows/planning.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`。補讀機械系裁示與守則的 `mechs/mechanical.md` 子檔；各部件、frame、bodyplan 與 era 出處列於下文。另讀 templates 指定的機械部件範本、`content/lore/factions/anvil.json`、`content/lore/events/antarctic-shell.json`。

本次只交 `PLAN.md` 與 `review-draft.json`；依交接書寄上線與終局信，不寫內容、全域進度或名冊。未使用子代理，子代理成本為零；本線未取得可核對的 token／金額統計，不估填。下文是待領導審閱的產出方案，所有新顯示名均為「提案名」。

## 一、設計理念

**mf-02** 補的是「舊軍工怎麼活到今天」的地球型錄。崩前的軍工靠凡鐵訂單和專利吃飯；抵抗性令其對獸兵器失效，公刻又拆掉圖紙的獨占，留下的工廠改賣能換、能修的非核心件。本批選六種不同用途：護腿骨架、液壓助力、臂甲、靈目座、座艙隔板、排燼背架。既有凡鐵連吼等已足以承接「人打人便宜」的武器經濟，因此不再複製一批槍砲。新件只用現有部件欄位，數值暫借相近 D／C 配裝；不替舊企業發明精粹煉法，也不增加核心產能。

**mf-03** 補「有圖、能造、買得起、修得動」之間的歷史。公刻事件已寫公開圖紙，本批著重圖紙如何走到城市工坊、C 級供應如何仍受制、舊軍械庫如何變成發型錄與授權的機構。七個事件接住 C 精粹與產能線，再以一個企業群像收攏崩前至 2108 的轉身。銀環入型錄替 mf-01 銀環-G1 補歷史入口，其餘事件接既有堅盾、長槍、燕鷗、FR-7、AT-12、獵犬；不重述公刻全文，不接管別線的地域故事。

給產出線的共同要求：每件須有既有節點、勢力或崩年底色，以及能說清的前因→後果。先英文原名與意涵，再做中文意譯／音譯；沒有適用命名欄的部件與事件，把英文留在產出交接命名表，不擅加 schema 欄。古代機本體叫古代機、外層叫裝甲，蝕潮系用語照 terms 最新裁示。不借其他作品類比，不寫真實公司、武器型號或人名。群像不另立全球主角，不把國家或塞勒涅寫成萬能。

舊軍工「沒有一家死，沒有一家還是原來的樣子」；衍一聯合工程師一半來自舊軍工，這與後來一半隨秦望舒上月是兩件事。格爾木坑邊的舊軍工保全是既有設定，不替它指定真實公司或新增獨家身分。公刻只給 D 級地板；公開 C 級圖紙不等於取得 C 級精粹與量產件，仍須向國家型傘或塞勒涅買。凡鐵對獸只刮外甲，碰不到核；非核心件不替武器附魔，也不能讓普通 AI／遙控手驅動機甲核心。

本批數值最後統一調，目前只暫填。mf-02 為 **6 components、0 abilities、0 effects，共 6 件**；mf-03 為 **7 events、1 faction，共 8 件**。不產出安地斯壁、牧杖、朝廷閱兵、瀨戶內鎖海內容。計畫不授權修改 timeline、既有 frame／defaultLoadout、市場、索引或衝突來源；需要的連結整合交領導另列範圍。

## 二、相關概念與出處

**崩前軍工、崩年斷鏈、舊企業縮身。** `wf/workflows/planning/design-notes/world/before-collapse.md` 的冷戰庫存、長鏈與崩前無機甲，接 `world/magnates.md`「軍工」與 `world/history-lines.md` 崩年底色。群像內的買賣、工坊、人員遷移是填充提案，不能把舊企業都寫成已滅亡或都已上月。

**公刻、地板與天花板。** `wf/workflows/planning/design-notes/world/history-lines/c-essence.md`：N03 讓圖紙流通，N06 能守線，N08 把產能接上獵牌與補給；C 級外購限制已定。`content/lore/events/shield-open-carving.json`、`longspear-leak.json`、`lance-v4.json`、`ironsword-open-pattern.json` 分別承載公開、逆向、量產、共用修造冊。新件不新增一條萬能產線。

**三條通用系列與血統。** `wf/workflows/planning/design-notes/mechs/mechanical.md`、`wf/workflows/content/world-pillars/mechs/mechanical.md`：堅盾防守、長槍遠程、鐵劍均衡。`content/lore/factions/league-armory.json` 與 `content/base/frames/moji-tern.json` 把燕鷗掛夸父；長槍血統另有衝突，見第五節。新件是通用接口上的非核心配件，不另創藍本古代機或專屬血統。

**機甲核心、精粹核、凡鐵。** `wf/workflows/planning/design-notes/terms.md`、`content/lore/style.md`、`wf/workflows/content/numeric-bands.md`。核心是成品，精粹核是原料；非核心件可裝上已有核心的機體，但不產精粹。本批沒有凡鐵武器；後續若另開武器批，名稱帶「凡」，部件及傷害能力均須 `conventional-arms`。

**現有欄位與裝配。** `content/base/registries/slot-types.json` 的槽有 `weaponMount`、`restraint`、`cockpit`、`soulCore`、`armorMount`、`sensorMount`、`backMount`、`systemMount`。本批使用其中六種，不增加 registry。`wf/workflows/content/engine-facts.json` EF-02、EF-04、EF-05、EF-12、EF-17 支持 attrMods、既有池與外掛層的寫法；不寫 passive、自造維修減價欄或更換骨架功能。D／C 是本計畫的適用配裝帶，ComponentDef 範本本身沒有 grade，不擅加。

**年代、命名與群像。** `content/lore/README.md`、`content/lore/style.md`、`wf/workflows/content/lore-text.md`、`polish.md` 規定事件欄位與文體。日期沿年表原精度：不替只有年份的節點捏月份。事件只用已存在的 faction／place／character id；無人名證據就 `characters:[]`。不把本批新群像 faction 塞進事件引用，以免把鬆散產業寫成當時已有統一組織。

## 三、mf-02：六件非核心件

盤點以 `ls`、`grep` 查 `content/base/components/` 全部名稱與 id。已有 `autocannon-30`／`mx-iron-repeater`（同名凡鐵連吼）、`mx-iron-gatling`、`mx-hunter-darts`、`mx-shard-grenade`、`mx-ember-pod`、`mx-falling-star-mortar`，本批均不複製。也避開完整的鷹瞳靈目、胸前複合裝甲、霜鰭排燼片：下面的新件分別改為純校準座、腿／臂局部防護與占背槽的排燼架，功能範圍與槽位取捨明確。

共同落檔規則：`component/oa-…` 對應 `content/base/components/oa-….json`；全部 `origin:mechanical`、`pools:[]`、`abilities:[]`，不是凡鐵武器，不加 `conventional-arms`。需要來源的 attrMods.source 改為本件 id。層一律 `type:armor`、`ablative:true`、`structural:false`、`resist:{}`、`passThrough:{}`；不能增加 core 部位、改座位或改斷肢判定。裝配列是「可替換安裝」，不是要修改既有預設配裝，也不承諾六件同裝。

本次實讀 `content/base/bodyplans/mx-biped-d.json`、`mx-biped-c.json`：兩者均有 `legs`、`right-arm`、`head`、`torso`；槽分別為 `armor-mount`、`right-weapon`、`sensor-mount`、`cockpit`、`system-1`，C 另有 `back-1`。以下 frame 引用均在本次工作區存在。mf-01 六台有交付 review，但本次主目錄尚未見六台檔案，因此不把它們算成已驗明可裝的對象。

### 02-01｜component/oa-leg-brace

**提案名：承步腿架。** 英文原名 *Loadbearer Brace*；意涵是替老雙腿接住重量，中文取「承步」，不是整副可替換 bodyplan。類別非核心件（骨架護架），D 配裝帶；`slot:armorMount`、size 1、mass 2。比照 `content/base/components/composite-plate.json` 的 25 HP 裝甲層，改掛 `legs`、insertAt 0；保留範本未列部件 hp 的寫法，不自造耐久值。

白話：替老機的雙腿加一道護架，保住走回修理棚的本錢。

掛到：`event/ironsword-open-pattern`、`faction/dhaka-weavers` 與舊軍工群像。舊廠失去整機訂單→按共用修造冊做腿架→小工坊也能換件；不寫減價或修復引擎效果。可裝 `frame/bulwark-i`、`frame/union-fr7`、`frame/ix-01` 的 `armor-mount`。取捨：放棄該槽的胸甲，保腿而非再堆 torso HP，與既有複合裝甲不同。

### 02-02｜component/oa-hydraulic-assist

**提案名：順行液壓組。** 英文原名 *Yieldstep Hydraulics*；意涵是關節受力時順勢讓步，中文取「順行」。類別非核心件（液壓），C 配裝帶；`slot:systemMount`。比照 `content/base/components/mx-tide-leap.json` 的 size 1、mass 1、hp 10，僅借 `self.attrs.evasion +2`，abilities 留空；不複製躍潮主動技、飛行或位移。

白話：讓關節轉向順一些；它不會讓機甲飛，也不替人打仗。

掛到：`faction/league-armory`、2107 獵犬授權與非核心件維修供應。舊液壓工廠轉接衍型接口→補新件給疲舊機架→買不起整機的工坊仍可接單。可裝 `frame/bulwark-ii`、`frame/longspear-v4`、`frame/ix-ii` 的 `system-1`。取捨：占系統槽，替換排燼件或流光囊；不動移動成本、不讓腿架自修。

### 02-03｜component/oa-arm-mantlet

**提案名：擋矢臂甲。** 英文原名 *Armward Mantlet*；意涵是把舊甲板做成遮住持械臂的護面，中文取用途。類別非核心件（鎧甲板），D 配裝帶；`slot:weaponMount`、size 1、mass 2。比照 `content/base/components/composite-plate.json` 的 25 HP 裝甲層與耐久欄處理，改掛 `right-arm`、insertAt 0，不新增攻擊能力。

白話：少掛一把武器，換右臂多挨一下；甲板壞了仍能在地上換。

掛到：`faction/anvil`、2093-09 堅盾首批仿造、舊軍工庫存改作。大批凡鐵庫存失去對獸殺傷用途→甲板仍能護住機械構件→守牆工坊接續採購。可裝 `frame/bulwark-i`、`frame/union-fr7`、`frame/ix-01` 的 `right-weapon`；只列右槽，避免掛左槽卻保右臂的敘事。保留左槽對獸武器，不承諾護甲能無視獸攻擊或使凡鐵穿核。

### 02-04｜component/oa-sight-cradle

**提案名：定準靈目座。** 英文原名 *Truepoint Cradle*；意涵是固定並校準原有靈目，中文取「定準」。類別非核心件（靈目座），C 配裝帶；`slot:sensorMount`、size 1、mass 1、hp 8，照 `content/base/components/mx-hawk-eye.json`；僅沿用 `self.attrs.accuracy +6`，不複製 perception +1。

白話：把原有靈目固定準一些；不會多看見一片戰場。

掛到：2100 堅盾-II 定版與 2104 長槍-V4 定版，舊軍工由專利整套販售轉為接口加工。圖紙已公開→工坊能做安裝座→精粹與高階靈目仍外購。可裝 `frame/bulwark-ii`、`frame/longspear-v4`、`frame/ix-ii` 的 `sensor-mount`。只寫校準座，不寫舊廠已複製塞勒涅的核心感知技術；與鷹瞳完整靈目的差別是沒有感知加值。

### 02-05｜component/oa-cockpit-baffle

**提案名：護艙隔板。** 英文原名 *Hearthguard Baffle*；意涵是替有人坐著的位置留一道阻隔，中文不用直譯「爐衛」。類別非核心件（座艙件），D 配裝帶；`slot:cockpit`、size 1、mass 2。以 `content/base/components/composite-plate.json` 的 25 HP 裝甲層為數值範本，放 `torso`、insertAt 1，位於原本外甲之後、cockpit-shell 之前；不新增 structural 層或改既有 conduct。

白話：在座艙前多放一道隔板；保的是坐在裡面的人，不是另一顆核心。

掛到：崩年人員損失底色、`faction/league-armory`、2106 FR-7／AT-12 公發。舊廠保留座艙件工藝→供應 D 級公發機的保護配件→駕駛員仍必須親自坐進去。可裝 `frame/bulwark-i`、`frame/union-fr7`、`frame/ix-01` 的 `cockpit`。不把此件寫成駕駛席本體，不提供免傷保證、撤離或傷勢治療。與外甲的差別是占座艙槽、內側隔板位置；不因換件改人機關係。

### 02-06｜component/oa-vent-rack

**提案名：敞背排燼架。** 英文原名 *Openback Vent Rack*；意涵是把可替換排燼件掛在背上，中文取敞開的背架。類別非核心件（排燼架），C 配裝帶；`slot:backMount`、size 1、mass 1、hp 8，`poolMods:[{pool:heat,regen:-8}]`，數值整組比照 `content/base/components/mx-frost-fins.json`，改背槽，不另給主動排燼。

白話：背上多掛一組排燼片，空出系統槽；背架也就掛不了別的。

掛到：`event/lance-v4`、`faction/chittagong-breakers` 與舊軍工群像。拆船場需要就地可換的排燼架→舊廠接非核心加工→長槍量產仍靠外購 C 級精粹與量產件。可裝 `frame/bulwark-ii`、`frame/longspear-v4`、`frame/ix-ii` 的 `back-1`，三台均有 heat 池。與霜鰭的差別是背槽和配裝取捨；不用「新煉法」「免耗核心」解釋排燼。

## 四、mf-03：逐條取捨與八件清單

九個年表候選逐條處理：**2092 衍二・堅盾下線不另立檔**，`shield-open-carving.json` 第一節已有下線前因，再寫會重複且擴散定位矛盾；保留年表，後續可由領導另授權回連既有事件。**2093-09 堅盾-I型普及寫**，著重三地首批仿造，而非再次公刻。**2099 銀環-G1 入型錄寫**，補 mf-01 與 2102 逆向的前因。**2100 堅盾-II型定版寫**，分清圖紙公開和 C 級供應。**2101 堅盾-I普及不另立檔**，是早期仿造擴散至民兵普及的結果，放 2093 事件的後續段，不把八年過程壓成同一天。**2104 長槍-V4定版寫**，與現有 2106 `event/lance-v4` 量產事件分開。**2105 燕鷗下線寫**，補軍械庫前身的哨戒需求，血統矛盾不擅自定案。**2106 FR-7／AT-12公發寫**，兩款同一公發節點只算一件。**2107 獵犬-II型授權寫**，區別授權重組與長槍的公刻默許。

以下七個事件目標檔均為 `content/lore/events/<id 的 name 段>.json`；`kind:科技`，tags 可沿既有 `tech`、`mech`。新中文事件名均標提案名，機型名沿既有。各項 consequences 是草稿，body 是段落大綱，並非已完成正文；落地時每件 300–1500 字、第三人稱過去式、具體場景，不寫型錄宣傳。

### 03-01｜event/bulwark-first-workshops

**提案名：堅盾-I型・三城出廠。** 英文原名 *One Pattern, Three Workshops*；意涵是同一張公開圖在三座城成為實物。`date:2093-09`，`period:era/mimic-dawn`；`factions:[faction/anvil,faction/remnant-wings,faction/dhaka-weavers]`；`places:[place/hamburg,place/istanbul,place/dhaka]`；`characters:[]`。沿年表三個勢力，不捏造領袖在三城會面的共同典禮。

白話：圖紙公開後，三座城真的造出了堅盾；舊工廠開始靠零件接單。

掛到：年表 2093-09、N03／C 線、`event/shield-open-carving`；公刻→各城仿造→民兵與維修供應擴散。

consequences 草稿：① 公刻堅盾首次在漢堡、伊斯坦堡、達卡形成跨城仿造的實例。② 舊軍工從爭整套圖紙轉向承接骨架與鎧甲等非核心件。③ 後續擴散到 2101 民兵普及，但不使 C 級精粹和量產件隨圖紙免費流通。

body 大綱：① 三處工坊各守一張公刻圖，窗外是斷鏈後的城市；② 工人把舊加工設備轉去做堅盾，成品用途是守牆；③ 公開圖給新工坊機會，也迫使舊專利持有人改做備件；④ 後續段明示 2093 是首批，2101 才是普及，把鏡頭收在民兵的舊機與換件上。

### 03-02｜event/silverring-g1-catalogue

**提案名：銀環-G1・型錄開頁。** 英文原名 *Silverring on the Ledger*；意涵是量產機第一次作為有價格、有供應條件的商品入冊。`date:2099`，`period:era/yoke-years`；`factions:[faction/selene]`；`places:[place/tranquility-city]`；`characters:[]`。

白話：銀環第一次能照型錄買到；好靈目連著原廠件和一筆帳。

掛到：年表 2099、N04 後的 C 線、mf-01 銀環-G1、`event/longspear-leak`；2097 月面藍本與封鎖→2099 型錄供貨→2102 墜機被逆向。

consequences 草稿：① 銀環-G1 成為塞勒涅第一款量產型錄衍型機。② 買主取得機體，也依賴原廠件與公司的記帳關係。③ 2102 墜落的同型機後來成為長槍逆向來源，公開圖仍未消除高階物資門檻。

body 大綱：① 月面工坊把銀環列入型錄，以靈目與骨架寫出「靜海」特色；② 買主能照冊訂機，零件與付款仍從同一窗口走；③ 保留公司中型巨頭、管別人的錢的限度，不提前寫成 2107 信貸協定已生效；④ 後續提及同型機在 2102 流入拆船場，止於既有事件入口。不展開安地斯壁故事，不引用尚未進庫的 G1 frame 作硬依賴。

### 03-03｜event/bulwark-ii-standard

**提案名：堅盾-II型・圖紙之外。** 英文原名 *The Drawing and the Supply*；意涵是人人看得見圖，卻不是人人湊得齊料。`date:2100`，`period:era/yoke-years`；`factions:[]`、`places:[]`、`characters:[]`。年表未指名公刻社群的召集者或定版地點，維持空陣列，正文用群像工坊。

白話：C 級堅盾的圖公開了，核心所需精粹和量產件仍得向大買家買。

掛到：年表 2100、C 線 R14、`event/shield-open-carving`；D 級守牆經驗→C 級推進版定版→供應依賴延續。

consequences 草稿：① 公刻社群定版並公開堅盾-II型 C 級圖紙。② C 級精粹與量產件仍向國家型傘或塞勒涅採購。③ 舊軍工可承作非核心件，無法憑一張公開圖獨立交付完整 C 級機。

body 大綱：① 工坊把多年改圖對成共同版本；② 圖紙上的推進版與庫房裡的缺料並列；③ 鎧甲、液壓等本地加工能補上部分需求，核心與受控量產件仍得等貨；④ 窮城保留 D 級守牆機，C 級推進沒有取代所有堅盾。

### 03-04｜event/longspear-v4-standard

**提案名：長槍-V4・共版成圖。** 英文原名 *A Common Reach*；意涵是散出的逆向圖形成可共同改造的遠程版本。`date:2104`，`period:era/tide-line`；`factions:[faction/salt-gull,faction/chittagong-breakers]`；`places:[]`、`characters:[]`。勢力是年表點名的本地改型承接者，不寫它們獨占定版或同地簽約。

白話：各地把長槍改圖收成 V4；會造遠程機，仍不等於買得起 C 級料。

掛到：年表 2104、`event/longspear-leak`→本件→`event/lance-v4`、C 線。取用既定遠程定位；不在本事件解決刑天／靜海血統爭議。

consequences 草稿：① 長槍 C 級 V4 圖紙成為公刻社群共同版本。② 鹽鷗與拆船幫各自發展本地改型，並非同一條量產線。③ 2106 拆船幫依此量產，C 級精粹與量產件依然外購。

body 大綱：① 回看 2102 撈起銀環後散出的圖；② 把遠程用途下的各地改圖整理成 V4；③ 鹽鷗的兩棲需求與拆船場的維修需求各走一支；④ 圖成之年仍未變成最便宜量產貨，尾段把後果交給 2106 既有事件。

### 03-05｜event/tern-rollout

**提案名：燕鷗・巡哨先行。** 英文原名 *Tern Takes Watch*；意涵是先有需要巡哨的人與機，後有殘聯的名冊。`date:2105`，`period:era/tide-line`；`factions:[faction/league-armory]`；`places:[]`、`characters:[]`。faction id 沿年表指繼承機構，正文此年稱「殘軍軍械庫／各國殘軍聯絡處」，不提前成立殘聯。

白話：殘聯成立前，軍械庫已造出燕鷗巡哨；它的舊腿後來又成了獵犬。

掛到：年表 2105、`faction/league-armory`、C 線到 N08、2107 獵犬授權；前身檔案與守線需求→哨戒機→後來的標準機與回收件。

consequences 草稿：① 殘軍軍械庫推出輕型哨戒機燕鷗。② 2106 殘聯成立後，燕鷗成為其標準哨戒機。③ 後續報廢腿架成為 2107 獵犬重組授權的材料。

body 大綱：① 聯絡處先處理守線巡哨需求，機庫裡尚無殘聯旗號；② 下線場景寫輕型機如何接替日常差事，不新增「前代機」；③ 舊廠供應液壓與座艙件，未握完整高階產線；④ 後續收束到標準機和報廢件去向。血統正文暫用「承自軍械庫既有檔案」，不寫長槍血統改；領導若採第五節建議，才明寫夸父血統。

### 03-06｜event/fr7-at12-public-issue

**提案名：FR-7／AT-12・公發之日。** 英文原名 *The First Public Issue*；意涵是把軍械庫能供應的 D 級機型公開列冊。`date:2106`，`period:era/league`；`factions:[faction/league-armory,faction/league]`；`places:[place/nairobi]`；`characters:[]`。地點依既有殘聯成立會議與總庫，不補月份。

白話：軍械庫把兩款 D 級機公開列冊；有型錄可買，不是人人免費領一台。

掛到：年表 2106、`event/league-founded`、`event/hunter-license-act`、C 線 N08；殘軍檔案→兩款 D 級公發→型錄與聯絡官補給制度。

consequences 草稿：① FR-7 與 AT-12 在殘聯成立當天公發。② FR-7 延續堅盾-I軍用改型，AT-12 承接哨戒任務，不能寫成兩款 C 級機。③ 軍械庫型錄與修理件供應有了共同對象，但參戰補給仍不等於發機甲。

body 大綱：① 奈洛比成立會議外，總庫整理舊殘軍檔案；② 同一張公發名單上有 FR-7 與 AT-12，分別交代用途；③ 訂機、備件與聯絡官補給的責任分開，不把公發當公刻或贈送；④ 尾段讓獵團拿到修理件而非天降新機，接往 2107 參戰制度。

### 03-07｜event/hound-ii-license

**提案名：獵犬-II型・舊架新籤。** 英文原名 *A Licence for Old Legs*；意涵是報廢腿架經授權重新成機，不是發現新藍本。`date:2107`，`period:era/league`；`factions:[faction/league-armory,faction/chittagong-breakers]`；`places:[place/chittagong]`；`characters:[]`。

白話：拆船幫獲准把報廢燕鷗腿架重組成獵犬，省的是機件，不是精粹門檻。

掛到：年表 2107、燕鷗下線、`event/lance-v4` 的工場背景、C 線；報廢件累積→軍械庫授權→廉價 C 級重組機。前因不改成軍械庫授權長槍。

consequences 草稿：① 軍械庫授權拆船幫以報廢燕鷗腿架重組獵犬-II型。② 新液壓、護架與舊骨架共同延長機件用途，舊軍工有非核心訂單。③ 省下機件費不降低 C 級精粹與量產件的外購門檻。

body 大綱：① 拆船場分開能用與不能用的燕鷗腿架；② 授權認可重組用途，不把報廢機寫成免費完整 C 級；③ 換液壓、補護架，新舊件並列；④ 對照長槍是公刻後的默許，獵犬才是本次明確授權，尾段留在待交貨的機腿。

### 03-08｜faction/old-arms-makers

目標 `content/lore/factions/old-arms-makers.json`。**提案名：舊廠諸家。** 英文原名 *The Old Arsenal Houses*；意涵是許多仍握招牌、機床與舊帳的軍工殘部，中文以「諸家」維持群像，不造統一財團。`type:企業`；`founded:崩前各自創立，非同年結盟`；`hq:散在地球各城的舊廠與修造棚，無共同總部`；`scale:各地殘存軍工企業及其加工、維修與保全支系，無共同軍隊`；`leaders:[]`、`places:[]`、`gameRefs:[]`。`aka` 可收英文原名；`ideology` 提案：「招牌還在，接的已不是原來的活。」不新增公司名、人名或共同創立日，不設 ancientMech、獨有機魂或 mechSeries。

白話：崩前賣整套軍備的老公司，如今靠凡鐵對人武器和機甲零件續命。

掛到：`world/magnates.md` 軍工、`before-collapse.md`、C 線 N02→N03→N08、六件 oa 型錄。崩前靠冷戰庫存與專利→崩年凡鐵對獸失效、工程師流向衍一聯合→2108 靠對人武器與非核心件供應存活。沒有一家消失，也沒有一家還能照崩前方式運作；各家不同，不寫一紙命令統一轉型。

body 四小節大綱（正式標題沿 lore 契約）：

1. `## 軍事組織與作戰風格`：從崩前庫房、保全與各國訂單寫起；格爾木坑邊保全只承認既有事實，不替它定公司名。崩年後保全守庫護貨，凡鐵仍會對人開火，對獸只刮外甲；沒有共同軍隊或萬能救援。
2. `## 對傭兵：態度與補給`：2108 的修造棚賣六件 oa 零件，凡鐵武器用既有型錄名承接，不另添商品檔。付錢、賒帳、舊件換件皆可作群像場景提案，但不造全體一致價格或契約機制。
3. `## 藍本古代機與研發路線`：舊廠沒有共同藍本。衍一聯合工程師一半出自舊軍工；2093 公刻打掉專利邏輯，留下的技工轉作非核心加工。D 級地板與 C 級外購門檻並存，不能因有機床就會煉精粹或複製古代機。
4. `## 外交`：各家對國家徵購、軍械庫授權、拆船場仿件、塞勒涅供貨各有盤算；用下列 2108 關係作產業整體讀法，具體爭執不一律等於宣戰。尾聲停在同一塊舊招牌下換過幾次的訂單，不下復興宣言。

relations 草稿僅用既有 id：`faction/league-armory`／中立／接修理與非核心訂單，仍受型錄和授權約束；`faction/chittagong-breakers`／中立／既賣新配件又被回收件壓價，各家選擇不同；`faction/selene`／緊張／需要它的高階供貨，卻在型錄與專利上爭生意；`faction/dhaka-weavers`／中立／共用修造冊打開接修市場，也削弱專用件綁售；`faction/north-american-umbrella`／中立／在國家調度與徵購下供貨，不能代表國家掌握天花板。這些 stance 都是提案，不回改對方 relations；不將 2093 已解散的衍一聯合寫成 2108 活客戶。

## 五、既有矛盾與建議讀法（只記，不改）

**燕鷗血統兩說。** `content/lore/timeline.json` 2105 稱「長槍血統改」，`content/lore/factions/league-armory.json`、`content/base/frames/moji-tern.json` 和 `wf/workflows/content/mechs.md` 則屬夸父。建議領導採夸父／衍一檔案系；未裁定前本批事件不寫具體血統，不自行發明「兩系混血」和解。

**堅盾與長槍角色殘留互換。** 年表 2092 是重裝守牆；`content/lore/events/shield-open-carving.json` 前段卻稱細長、射擊與突擊，`content/lore/factions/mimic-works.json` 同樣稱衍二為射擊突擊原型。`longspear-leak.json`、`lance-v4.json` 又反覆稱長槍突擊。與 `wf/workflows/planning/design-notes/mechs/mechanical.md` 最新三定位不合。新稿依已裁示：堅盾防守、長槍遠程、鐵劍均衡；來源留待另外潤飾。

**衍一聯合把堅盾公刻寫成長槍。** `content/lore/factions/mimic-works.json`「格爾木分家」稱堅盾公刻後「長槍從此」通用，relations 又說交付「衍一與長槍檔案」，遺產稱每城民兵的長槍。與 `shield-open-carving.json` 的 2093 堅盾、`longspear-leak.json` 的 2102 長槍衝突。建議把該處理解成未完成的系列更名殘留，不倒改年表。

**長槍藍本互撞且有先後問題。** `wf/workflows/content/mechs.md` 稱長槍 `lineage-xingtian`（刑天刻痕），`content/lore/events/longspear-leak.json` 則明記 2102 由靜海血統銀環逆向，刑天到 2103 才出土（`world/history-lines/c-essence.md`）。建議保留已定的銀環逆向史，將刑天 tag／後期刻痕是否另有授權交領導判讀；本批不宣稱 2102 長槍已用刑天，也不自創補丁事件。

**兩次堅盾「普及」不必刪一條。** `content/lore/timeline.json` 2093-09 的摘要是三地首批下線，2101 則是每城民兵都有。建議讀成首次跨城仿造與多年後普遍列裝；03-01 明確分兩階段，2101 不另開一篇相同事件。

**堅盾-I與V1混稱。** `content/lore/events/shield-open-carving.json` 春季仿造段叫「堅盾-V1」，同檔血統段、年表與 `content/base/frames/bulwark-i.json` 叫堅盾-I型。新稿沿後者，不把 V1 再寫成不同新機；「春天已有初造」與「九月三城成批下線」可並存，不把九月宣稱全球第一台。

**長槍定版、量產與授權混稱。** `content/lore/events/lance-v4.json` 名稱「下線」卻 date 2106；年表及 C 線清楚分 2104 定版、2106 拆船幫量產。`content/lore/eras/league.json` 又稱軍械庫授權廉價長槍，而 `lance-v4.json` 是沒有授權、僅默許。建議 03-04 只寫 2104 定版，03-07 才寫獵犬正式授權；不把既有量產事件搬年。

**C 級外購在舊正文被略去。** `content/lore/events/lance-v4.json` 主要寫拆殘骸湊出產線，容易讀成回收件能自行完成 C 級；年表 2106 與 `world/history-lines/c-essence.md` 已明定外購精粹和量產件。新稿與舊廠勢力都補明這個限制，不寫回收燕鷗腿架就能免掉 C 級供應。

**供應商與巨頭量級的舊表述。** `content/lore/factions/selene.json` body 仍稱「少數沒有破產的大企業」，summary 的「月亮上唯一的公司」也可能被讀成其他巨頭全死；`world/magnates.md` 明定沒有一家死、塞勒涅是替富豪管錢的中型巨頭。建議區分企業縮身、資產損失與消失，不能用舊口氣抹掉地球供應商；新群像不得反向改成塞勒涅附屬公司。

**工具說明與現況有差。** `engine-facts.json` EF-14 及 `content/mechs.md` 稱尚無 defaultLoadout；本次讀的 `frames/bulwark-i.json`、`bulwark-ii.json` 等已有配裝。部件沒有 grade 欄，故同級參照採實際 D／C frame 已用部件，不聲稱元件自帶等級。`numeric-bands.md` 的凡鐵「補刀」口氣與最新只刮外甲衝突，新稿不用。另 `tabledb.py` 以 rows 讀表，timeline 是 entries 契約，直接 grep 子命令不會查到 entries；本次依交接書明准的 grep 查年表，不把空結果當不存在，也不改工具或資料格式。

**mf-01 的交付與本目錄可見性。** `mf-01/review-rows.json` 有六台交付，但本次 `ls content/base/frames` 尚未見其檔案。這是整合狀態而非新設定矛盾；銀環史可照年表規劃，裝配清單則使用本目錄確實存在的機體。產出線不可自行重造六台。

## 六、review 草稿、執行順序與固定驗收

[review-draft.json](review-draft.json) 是 `wf-table/1`，欄位固定「檔／類別／名稱／白話／掛到」，先建空表再用指定 tabledb 的 add 逐列寫入。共十四列：六件 components、七件 events、一件 faction；每列對應上面一件實際產出提案，兩個不另立檔的年表候選不列。所有新名稱標提案名，白話各一至兩句、至多六十字。檔欄為未來內容檔的 repo 相對路徑，不宣稱已存在。

領導先審第五節讀法與提案名，再交產出線：mf-02 依六件清單造檔、mf-03 依八件清單造檔，衝突仍只記錄；命名語意與數值參照隨件保留。新事件可獨立引用既有勢力，不依賴新群像先落地。timeline 回連、既有 lore 修字、mf-01 整合與營運可購買性均由領導另外列明授權，不靠本計畫擴張檔數。

本線驗收固定三條，不另跑內容檢查、平衡、煙霧、MCP、全庫 lint 或額外 gate。交接書的容量上限四十 KB 與件數上限在產出時約束；超過立即停，不擴充清單。

1. `PLAN.md` 存在，開頭有「已讀清單」，含本六節。
2. mf-02 為六件、mf-03 為八件；每件具 id、提案名、掛點、白話。
3. `review-draft.json` 為 `wf-table/1`，十四列等於兩批合計，每列白話至多六十字。

### 以後交接書該點名的工具

`grep` 查 `lore-timeline/1` 的 entries；`tabledb.py` 查寫 `wf-table/1` 的 rows。兩者本次皆已點名，建議明說契約差異，避免把 timeline 的空查詢誤認為沒有節點。其他無。
