# 1. 已讀清單

路徑縮記相對 repo 根：R=`wf/workflows`、W=`wf/workflows/planning/design-notes/world`、H=`wf/workflows/dispatch/handoffs/lead-fill-am`、L=`content/lore`；LF=L/factions、LP=L/places、LE=L/events、LC=L/characters。逐檔親讀；史表用tabledb grep。

- AGENTS.md
- R/common/user.md
- R/content/README.md
- R/content/lore-text.md
- R/content/world-pillars.md
- L/style.md
- L/style/people.md
- L/README.md
- W/history-lines.md（含底色十三句）
- W/history-nodes.json（N01、N03、N06、N08、N09）
- W/history-orphans.json（借火催曉、鏽旗出殯）
- W/history-timeline.json（環線、刑天、聖保羅、信貸、兩孤兒）
- W/before-collapse-powers.md
- W/magnates.md
- W/polity.md
- W/city-types.md
- W/history-lines/g-umbrella.md
- W/history-lines/f-rift-line.md
- H/cx-am-01.md
- H/am-01/REPORT.md
- LF/north-american-umbrella.json
- LF/heartland-capital.json
- LF/latam-umbrella.json
- LP/denver.json
- LP/new-york-hollow.json
- LP/houston-wells.json
- LP/panama-locks.json
- LP/rio.json
- LP/brasilia.json
- LE/renaming-day.json
- LE/trade-route-charter.json
- LE/xingtian-registry.json
- LP/montreal.json
- LP/mexico-city.json
- LP/great-lakes-mycelium.json
- LP/sao-paulo-blight.json
- LP/ring-road.json
- LP/yukon-shell.json
- LP/cartagena.json
- LP/phoenix.json
- LF/quito.json
- LF/ring-caravan.json
- LF/shell-society.json
- LF/remnant-wings.json
- LC/xingtian.json
- LC/eugenia-ferrero.json
- LE/bellless-dawn.json
- LE/rust-banner.json
- LE/credit-accord.json
- L/timeline.json（本區條目）

指定grep -rl命中檔均讀相關摘要／段落。

## 2. 設計理念

am-02：玩家從護送、守崗、收殮碰見徵召與地契代價。底色1.6、1.7長成歸屬裂痕，1.8留下叫不回的人；五名地方人物各做有限的事。

am-03：底色1.4、1.5、1.6長成五處守港、調糧與轉運缺口，讓玩家看見海岸與內陸互相依存。

## 3. 相關概念

傘、徵召、國籍／評等：W/polity.md、before-collapse-powers.md；城約、一夜到：W/city-types.md；空城、地契：W/polity.md；穹頂下的錢：W/magnates.md；哀悼點名、兩種內陸例外：W/history-lines.md。沿用詞保留提案地位。

縮記：北=faction/north-american-umbrella、地=faction/heartland-capital、拉=faction/latam-umbrella、環=faction/ring-caravan。其餘名稱段按欄位補id類別；C/E/P編號指下表檔的id。

## 4. 逐檔規格表

共通：名／日期為提案；通用欄照L/README.md，body 300–1500字。人物kind=human、gameRefs=[]、relations未列=[]。事件date／period見第6節，characters未列=[]、consequences取後果。地點world=earth、kind=港（P2=城邦）、gameRefs=[]，末欄即status2108，沿am-01五段。禁止額外反向插入。

### am-02：新增10＋插入5＝15檔；人物5

|編號／檔名|名稱；原名／意涵；類別|掛到；前因→後果|2108-01／引用限制／必填重點|
|---|---|---|---|
|C1 `content/lore/characters/maelle-bellerive.json`|瑪艾爾・貝勒里夫；Maëlle Bellerive；人物|N08、1.6；戶籍未決。→分開簽查驗與入館許可。|仍守montreal城外崗；born=2070，faction=北，role=法語裔加拿大崗長；relations=[eugenia-ferrero：交接爭執]，events=[xingtian-registry]；不管地下、不寫刑天動。|
|C2 `content/lore/characters/evan-cresswell.json`|伊文・克雷斯維爾；Evan Cresswell；人物|D、1.7；E2抵押未清。→替返鄉者抄舊門牌。|仍估價new-york-hollow；born=2072，faction=地，role=地契估價員，events=[E2]；事後查帳、無權贖地。|
|C3 `content/lore/characters/dario-urena.json`|達里奧・烏雷尼亞；Darío Ureña；人物|N03、1.4；港費不足。→E3交出優先泊位換庇護費。|仍任panama-locks議長；born=2068，faction=null，role=商團出身議長，events=[E3,E5]；不准通緝船入港。|
|C4 `content/lore/characters/silas-mercer.json`|賽拉斯・默瑟；Silas Mercer；人物|1.8；借火與鏽旗留下空匣。→接家屬名冊逐名念完。|仍在great-lakes-mycelium岸收殮；born=2066，faction=null，role=收殮人，events=[bellless-dawn,rust-banner]；事後收冊，不命名舊英雄、不補屍骨。|
|C5 `content/lore/characters/livia-avelar.json`|莉維亞・阿維拉爾；Lívia Avelar；人物|N09、1.4；護糧缺款。→E4以糧運抽成換開行。|仍坐brasilia巴西席位；born=2064，faction=拉，role=糧商代表，relations=[joao-ferreira：運糧議價]，events=[E4]；國家席位非私產。|
|E1 `content/lore/events/government-inland.json`|政府進山；Government Inland／搬印章；事件|N01、1.6；兩岸斷鏈。→政府遷丹佛重排糧車。|遷址有效；factions=[北,地]，places=[denver]；承丹佛舊文，非新國成立。|
|E2 `content/lore/events/new-york-deeds.json`|紐約地契；New York Deeds／抵押故鄉；事件|D、1.7；無繼承產權歸國庫。→抵押地契借守線款。|未贖清；factions=[北,地,selene]，places=[new-york-hollow,denver]，characters=[C2]（後續查帳）；塞勒涅是窗口、不買死債。|
|E3 `content/lore/events/lock-city-charter.json`|閘城立約；Lock City Charter／港費買守夜；事件|N03、1.4；國家未來守港。→商團獵團立城約。|約仍行；factions=[]，characters=[C3]，places=[panama-locks]；環線、拉美傘未立，不作創約方。|
|E4 `content/lore/events/another-ledger.json`|另一本帳；Another Ledger／另一貸方；事件|N09、D/G；護糧須借款。→財團收礦糧港抽成。|抽成續行；factions=[地,拉,環]，characters=[C5]，places=[brasilia]；對照credit-accord，不要求催收權。|
|E5 `content/lore/events/mexico-muster.json`|墨西哥城徵召令；Mexico Muster／同紙異讀；事件|G、1.6；調度歸屬未解。→議會爭排班、獵團南躲。|徵召仍有效；factions=[北,league,remnant-wings]，characters=[C3]，places=[mexico-city,panama-locks]；承renaming-day；墨西哥城非自由城。|

### am-03：新增6＋插入1＝7檔；人物0

|編號／檔名|名稱；原名／意涵；類別|掛到；前因→後果|2108-01／引用限制／必填重點|
|---|---|---|---|
|P1 `content/lore/places/seattle.json`|西雅圖；Seattle；地點|N01、1.4；太平洋岸受創。→縮守接糧碼頭。|蝕線上守住；region=美國西北太平洋岸，continent=北美，factions=[北,地]；接denver糧；不用潮差、不添核心。|
|P2 `content/lore/places/winnipeg.json`|溫尼伯；Winnipeg；地點|G、1.6；糧運納美國調度。→議會另留本國登記。|守住、歸屬有爭；region=加拿大內陸草原，continent=北美，factions=[北]；承renaming-day、對照montreal；非自由城、無常態獸災。|
|P3 `content/lore/places/havana.json`|哈瓦那；Havana；地點|G、1.4；遠洋斷鏈。→古巴縮守港區以近岸續糧。|國屬港守住；region=加勒比海古巴，continent=北美，factions=[拉]；與cartagena交易不共城約，大陸分張非傘歸屬。|
|P4 `content/lore/places/valparaiso.json`|瓦爾帕萊索；Valparaíso；地點|G、1.4；海港靠內陸糧。→智利民兵雇獵團共守貨場。|國屬港守住；region=智利中部太平洋岸，continent=南美，factions=[拉]；承trade-route-charter，向quito購件、不借古代機。|
|P5 `content/lore/places/belem.json`|貝倫；Belém；地點|F/G、1.4；河口連海。→轉運內陸糧與沿海精粹。|河口蝕線上守住；region=巴西亞馬遜河口灣區，continent=南美，factions=[拉]；接brasilia糧帳，限河口例外、不寫全流域獸災。|
|E6 `content/lore/events/estuary-exchange.json`|河口換糧；Estuary Exchange／先付護航糧；事件|N09、1.4；抽成先扣令護航缺糧。→商團從當批貨先撥口糧。|地方慣例續行；factions=[拉,地]，characters=[]，places=[P5,brasilia]；承E4，照付債款、不改全洲制度。|

## 5. 既有檔的純插入清單

以下接L/；02改5檔，03僅改timeline。只添鍵／陣列元素，舊值與相對順序不動；已有項不重加。

|檔|插入|
|---|---|
|timeline.json|第6節，依date排序，年-only插同年既有年-only後。|
|factions/quito.json|relations加拉／同盟／坐國家席位，不交古代機調度權。|
|factions/ring-caravan.json|relations加拉／同盟／按商路互保，仍守自己的約。|
|places/great-lakes-mycelium.json|factions加北，僅岸邊燒季存在。|
|places/sao-paulo-blight.json|factions加拉，僅外圍商路存在。|

蝕域加勢力不代表收復；兩孤兒、史表、卡塔赫納、鳳凰城只讀。共22檔次、21路徑。

## 6. 年表插入清單

event對應E編號、factions同事件、summary取因果。僅插6筆。

|批／event|date|title|era|tags|
|---|---|---|---|---|
|02／E1|2089-06|政府進山|era/first-tide|diplomacy|
|02／E2|2098|紐約地契|era/yoke-years|diplomacy|
|02／E3|2094|閘城立約|era/mimic-dawn|diplomacy|
|02／E4|2107|另一本帳|era/league|diplomacy|
|02／E5|2107-06|墨西哥城徵召令|era/league|diplomacy|
|03／E6|2107-09|河口換糧|era/league|diplomacy|

## 7. review.json 草稿

內嵌16列；「檔」按第4節編號展開完整路徑。產出線轉wf-table/1，columns即以下五欄。

|檔|類別|名稱|白話|掛到|
|---|---|---|---|---|
|C1|人物|瑪艾爾・貝勒里夫|替美國守崗的加拿大人，無權打開刑天的門。|N08；1.6|
|C2|人物|伊文・克雷斯維爾|替財團估空樓，也替返鄉者抄舊門牌。|D；1.7|
|C3|人物|達里奧・烏雷尼亞|拿自家泊位換守夜費的閘城議長。|N03；1.4|
|C4|人物|賽拉斯・默瑟|骨頭帶不回來，就替家屬念完名字。|1.8；兩孤兒|
|C5|人物|莉維亞・阿維拉爾|坐國家席位的糧商，用未來收成換今天護航。|N09；1.4|
|E1|事件|政府進山|印章搬進丹佛，沿海的求援仍會遲到。|N01；1.6|
|E2|事件|紐約地契|國庫拿空城借錢，返鄉者遇上債主封條。|D；1.7|
|E3|事件|閘城立約|商團與獵團共付守夜費，城有了自己的約。|N03；1.4|
|E4|事件|另一本帳|地上的錢不討催收權，改拿礦糧港抽成。|N09；1.7|
|E5|事件|墨西哥城徵召令|獵團南躲閘城，國家的徵召令仍有效。|G；1.6|
|P1|地點|西雅圖|太平洋邊的守港人，等內陸糧車續命。|N01；1.4|
|P2|地點|溫尼伯|糧車聽美國調度，城留加拿大登記簿。|G；1.6|
|P3|地點|哈瓦那|遠洋貨斷了，古巴縮守島港換近岸糧。|G；1.4|
|P4|地點|瓦爾帕萊索|智利守港靠糧車，借不到安地斯的神。|G；1.4|
|P5|地點|貝倫|河口小船換糧與精粹，每次交貨都得守。|F/G；1.4|
|E6|事件|河口換糧|港商先撥護航口糧，欠債照付。|N09；1.4|

## 8. 風險與需要領導決定的事

待核定：人名、日期、五城狀態與古巴傘屬。人名未撞庫內，未查網；富豪、總統、公司不具名。無新概念詞。

既有張力：維拉科查環線出山與禁令不合，不沿用、不自訂生效年；刑天亮動舊文不續寫。兩孤兒只接1.8，不改史表或硬掛F線；腐衛來源留專線。am-03只配一件事件避免灌水；E6依賴E4，先02後03。

產出線：節點優先、不暴力產lore；不類比他作、中文不直譯；用古代機／裝甲、蝕潮／蝕。國家、塞勒涅、巨頭只削弱不萬能；真相放secrets標hidden／rumor；群像、不寫真實歷史人名。不造機甲型號與怪獸資料，需求交專線。

am-01「已裁示不推翻」整節及背景逐句納入本計畫，須讀H/cx-am-01.md。尤其：美國只改名、國家不死；2101是各區代表；2090聖保羅核心在桑托斯灣區，巴西退守原內陸首都；2106費雷羅運回刑天；刑天沉睡、認不認伊爾瑟不預決，不寫動醒；維拉科查不離安地斯、基多不出洲。

只交PLAN.md；表依交接書內嵌，原定三條驗收通過即停。
