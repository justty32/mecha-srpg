# 已讀清單

以下路徑相對 repo 根，均親自讀取。這是 cx-af-02p 的計畫段；只涵蓋指定 11 件，供領導審閱，規格衝突另列、不自行改定。

- `AGENTS.md`
- `wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/WORKFLOWS.md`
- `wf/workflows/common/user.md`、`wf/workflows/planning.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `wf/workflows/content/world-pillars/world.md`、`mechs.md`、`bio-battle.md`（同目錄）
- `wf/workflows/content/world-pillars/world/tone-and-rules.md`、`factions-and-sandbox.md`、`monsters.md`（同目錄）
- `wf/workflows/content/world-pillars/mechs/bonds.md`
- `wf/workflows/content/world-pillars/bio-battle/bio.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `content/lore/factions/sub-saharan-umbrella.json`
- `content/lore/factions/north-africa-umbrella.json`
- `content/lore/factions/west-asia-umbrella.json`
- `content/lore/factions/yoke-saddle-works.json`
- `content/lore/events/aswan-sluice-night.json`
- `content/lore/events/hormuz-burning-night.json`
- `content/lore/places/aswan.json`
- `content/lore/places/hormuz.json`
- `content/lore/factions/green-line.json`
- `content/lore/factions/mumbai-returners.json`
- `content/lore/factions/accra.json`
- `content/lore/places/lagos-blight.json`
- `content/lore/characters/babatunde.json`
- `content/lore/characters/adebayo-oluwaseyi.json`
- `content/lore/places/cotonou.json`
- `wf/workflows/dispatch/handoffs/lead-fill-af/cx-af-02p.md`
- `wf/workflows/dispatch/handoffs/lead-fill-af/cx-af-02.md`（全文）
- `wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`

查引用補讀：`content/lore/characters/wanjiku-kamau.json`；`content/lore/events/` 下的 `nairobi-port-incident.json`、`equator-ports-accord.json`、`suez-canal-night.json`、`twin-rivers-night.json`、`singapore-conference.json`；`wf/workflows/planning/design-notes/world/history-lines/lines.md`；用 tabledb 查 `history-reconcile.json` 的 R08 列。產出交接書點名的 `wf/workflows/dispatch/handoffs/lead-fill-af/af-02/PLAN.md` 開工時不存在，即本次產物，沒有可先讀的舊版。

## 設計理念

把三把傘已有的戰史落到人怎麼活：水閘決定誰的田要淹、海峽用通行權換援軍、內陸家庭靠騎手出海寄錢。四座城各呈現一種守城與法理的關係；兩個事件交代城市與獵團如何形成；兩個勢力與三個人物承接代價。每件都有崩前或崩年的起點、既有節點造成的轉折及 2108-01 的處境，不再增加戰爭與救世人物。文字以閘門、舊船單、拘束艙與空塔入手，讓制度留在行動裡。

## 相關概念

國家／傘／城邦：法理、救援分配、當夜到場各有主人。出處：`polity.md`「三層」。
自由城市／城約（提案名）：商團與獵團庇護，徵召無效、獵牌效力最高，沒有傘必救。出處：`city-types.md`。
公司城（提案名）：舊能源巨頭管日常，國家保留法理。出處：`magnates.md`「能源」、`polity.md`。
空城（沿用提案名）：斷鏈後無人居住，不等於蝕域；國庫產權可已抵押。出處：`history-lines.md` 底色 1.4、1.5、1.7，`polity.md`。
雙籤城：日常歸撒南，大潮向誰求援自選且留下政治紀錄。出處：`history-reconcile.json` R08 已裁示欄。
騎手人口缺口：成年層厚，崩年出生層薄；撒南輸出人力，日傘最缺人。出處：`history-lines.md` 1.1、1.2，`before-collapse-powers.md`。
拘束與不老：活捕獸始終反抗；現役駕駛老得慢，不是返老還童。出處：`world-pillars/bio-battle/bio.md`、`content/lore/style/people.md`。
可見度：公開敘述不洩漏隱情；未證實用 rumor，隱情放 secrets 並標 hidden。出處：`content/lore/README.md`。

上述設定筆記簡名均指 `wf/workflows/planning/design-notes/world/`；本批不新增設定術語，具體名稱沿用交接書。C／D／F／G／H 線沿用 `history-lines/lines.md`，不自造節點編號。

## 逐件

### 1. 吉布地

檔：`content/lore/places/djibouti.json`

掛到：G、F 線；底色 1.4、1.6；2097 城約→2106 運河夜→2108 母港。

要達成什麼：把崩前兵營與轉運港寫成國家失約後由商團付錢守下的城。貨棧接內陸糧與沿海精粹，獵團家眷需要泊地；城約固定庇護關係，運河輪值又帶來補給生意。中立靠攻取不划算，並有大潮前買不到援軍的風險。

與既有 lore 的關係與引用：查無同名。引用本批 `event/djibouti-charter`、`faction/far-herd`，承接既有 `event/suez-canal-night`；後者仍發生在蘇伊士，吉布地只接後續補給。地點 factions 照規格只列遠牧。

白話草稿：沒等到國家救援的港，由商團和獵團合資守城；船能躲徵召，城卻得自己買援軍。

### 2. 達蘭

檔：`content/lore/places/dhahran.json`

掛到：G、C 線；巨頭能源類；底色 1.4、1.6。

要達成什麼：從王國油公司的鎮，經崩年斷貨，落到地熱井、供水與城牆都靠舊油公司的 2108。以領糧和維修排班呈現公司管日常、王室代表守法理；能源仍需糧路、零件與守備配合，不能靠一口井全能自足。

與既有 lore 的關係與引用：查無同名。引用 `faction/west-asia-umbrella`；補其「國家本身是能源巨頭」的地方樣本，不新增公司名、領袖或藍本。王室代表不具名。

白話草稿：舊油公司握著井、糧倉和城牆，養活整座達蘭；王室還在，但日常得找公司辦。

### 3. 杜拜空城

檔：`content/lore/places/dubai.json`

掛到：F、G、D 線；底色 1.4、1.5、1.7；築牆期地契抵押。

要達成什麼：以崩前依賴外來水電糧、崩年淡水與冷氣停擺、人向內陸與海峽移走，解釋空塔。2108 有沙、拾荒者與債主告示；搜刮受到產權阻力，不靠常態獸災解釋棄城，也不寫死亡數字。

與既有 lore 的關係與引用：查無同名。引用 `faction/west-asia-umbrella`，與 `place/hormuz` 的守住形成區域對照。月面資金經窗口放貸，不把 `faction/selene` 寫成買下全城或買死人的債。

白話草稿：補給斷了，居民離開玻璃高樓；國家把空城押給債主，拾荒者如今還得看告示牌。

### 4. 蒙巴薩

檔：`content/lore/places/mombasa.json`

掛到：G 線／R08（N06、N08）；2102 奈洛比港事件→2103 軛騎出洋。

要達成什麼：崩前貨港在斷鏈後縮成守得住的港牆，後來接拘束艙與騎手出海。2108 的港務辦日常行政，大潮求援簿則讓兩把傘算政治帳；碼頭與家書呈現騎手輸出的成本。

與既有 lore 的關係與引用：`faction/sub-saharan-umbrella` 已指名雙籤城，新增地點承接、不另立身分。引用該傘、`faction/league`、`faction/yoke-saddle-works`、本批 `faction/far-herd`、`event/yoke-riders-abroad`；以 `event/nairobi-port-incident` 說明改走地上海路。

白話草稿：蒙巴薩把騎手和拘束的獸送往外洋；大潮夜向哪邊求救，兩把傘都記在帳上。

### 5. 拉哥斯歸還黨

檔：`content/lore/factions/lagos-returners.json`

掛到：F、G 線／N06、N08；底色 1.7、1.11；2099 失城→2101 離席。

要達成什麼：只補拉哥斯難民那一支如何在阿克拉出現，讓返鄉訴求落在家產被抵押的法理上。2108 仍窮，成員進民兵或出洋寄錢；既受阿克拉庇護，又不接受守線等於放棄家園。

與既有 lore 的關係與引用：名稱未命中，但 `event/singapore-conference`、`place/lagos-blight`、`faction/mumbai-returners` 已寫三支起源。關係沿用規格五方：孟買支、`faction/accra`、`faction/league`、`faction/green-line`、`faction/sub-saharan-umbrella`；地點另引 `place/accra`。不借 `character/adebayo-oluwaseyi` 當領袖，不搬孟買的軍隊或戰績。

白話草稿：逃到阿克拉的拉哥斯人不肯承認故鄉被放棄；他們沒有大軍，只能一邊討生活一邊喊歸還。

### 6. 遠牧獵團

檔：`content/lore/factions/far-herd.json`

掛到：C、G 線；底色 1.1、1.2、1.4；2103 軛騎出洋。

要達成什麼：把撒南人力輸出寫成一支自營傭兵團：工棚受訓、海路接約、拘束維護、匯錢回內陸；以吉布地為母港，仍與撒南傘合作。獸始終要壓制，牧杖-III型是既有支援裝備，不造專屬血統。

與既有 lore 的關係與引用：查無同名。與 `faction/yoke-saddle-works` 分工為供應訓練者／接約者。引用 `faction/sub-saharan-umbrella`、`faction/league`、`faction/unbinders`、`faction/selene`，關係照規格；本批引用 `character/juma-kiprop`、`place/djibouti`、`place/mombasa`、`event/yoke-riders-abroad`。不寫 mercPolicy。

白話草稿：一群撒南騎手帶著拘束的獸出海替別城守夜，錢寄回家，自己的落腳港也得付錢守。

### 7. 吉布地城約

檔：`content/lore/events/djibouti-charter.json`

掛到：G、F 線；底色 1.4、1.6；2097／`era/yoke-years`。

要達成什麼：從崩年以來商團與獵團守港、國家未付帳，寫到 2097 立約拒稅拒徵；後果是城自己買庇護、國家仍主張產權。2106 後成護航補給港，保留交接書「本區第一座」說法並列待界定風險。

與既有 lore 的關係與引用：查無同名。只列 `place/djibouti`；factions、characters 均空，不能讓 2103 才成立的遠牧參與立約。後果接 `event/suez-canal-night`，不重寫其衝突。

白話草稿：守港的人等不到國家付帳，便立約自己收稅、自己買守軍；國家的地契卻一直沒撤。

### 8. 軛騎出洋

檔：`content/lore/events/yoke-riders-abroad.json`

掛到：C、D、G 線；底色 1.1、1.2；2102 拒載→2103／`era/tide-line`。

要達成什麼：從月面租約被拒，轉到蒙巴薩首船承接外洋守城契約，寫出傘抽成、家庭收匯款、遠牧成軍與解拘者盯上船貨的後果。事件聚焦轉向的那一船，不替整個撒南補全球作戰史。

與既有 lore 的關係與引用：查無同名；是 `event/nairobi-port-incident` 的後續。列 `faction/yoke-saddle-works`、`faction/sub-saharan-umbrella`、`faction/far-herd`、`place/mombasa`、`character/juma-kiprop`；解拘者引用 `faction/unbinders` 作後果背景，不擅加參戰者。

白話草稿：渡月船不載獸，騎手改從蒙巴薩出海替別城守牆；契約養活家鄉，也把仇家帶到外洋。

### 9. 娜迪雅・薩布里

檔：`content/lore/characters/nadia-sabri.json`

掛到：G、F、H 線；2091 放閘夜；底色 1.11。

要達成什麼：以她當班送出開閘次序起筆；2049 生，崩前年代就在河谷水務生活，崩年變成決定淹哪片田的人。2108 五十九歲仍在總控，權力來自工作而非英雄光環；留受災者不肯原諒她的具體場合。

與既有 lore 的關係與引用：查姓未命中；`event/aswan-sluice-night` 已有總控與眾閘工，補一位當班者，不包辦全夜功勞。引用 `faction/north-africa-umbrella`、`place/aswan`；events 僅放閘夜，relations 可空，不硬造熟人。

白話草稿：她開閘救了城，也淹了自己人的田；多年後仍守著總控室，有人至今不肯原諒她。

### 10. 朱瑪・基普羅普

檔：`content/lore/characters/juma-kiprop.json`

掛到：C、G 線；底色 1.1、1.2；2103 軛騎出洋。

要達成什麼：2081 生、崩年八歲逃在內陸，經軛鞍行受訓，在首船出洋；2108 二十七歲帶年輕騎手接約。用寄款前核對家鄉名單的行動刻畫團長，外貌只留「看起來不到二十」，掘犬仍在拘束中反抗。

與既有 lore 的關係與引用：查姓未命中。引用 `faction/far-herd`、`event/yoke-riders-abroad`；relations 指 `character/wanjiku-kamau`，沿規格「送他上第一艘船的人」，不改寫成恩凱認主者或拾號騎手。mech 沿用拘束的掘犬。

白話草稿：童年逃進內陸的朱瑪，如今帶騎手出海賺錢寄回家；他看著年輕，卻已送過不少人上船。

### 11. 法莉妲・納賽里

檔：`content/lore/characters/farida-naseri.json`

掛到：G 線；2096 燃夜→2100 斷橋夜→2108 名冊官。

要達成什麼：2058 生，從崩前港務與崩年斷航交代履歷；燃夜由她廣播並記船名，承諾得以延續成今日的核對工作。拒絕買名、冒名的是名冊官的職責，不讓她一人保證全海峽信用；斷橋夜只留一句對承諾的看法。

與既有 lore 的關係與引用：查姓未命中。`event/hormuz-burning-night` 已寫兩岸廣播與收費人記名，補她在其中的職務，不抹掉群像。引用 `faction/west-asia-umbrella`、`place/hormuz`；events 僅燃夜，`event/twin-rivers-night` 可作背景、不宣稱親歷。

白話草稿：燃夜是她喊船來救，也是她記下船名；如今有人想買那份免通行費的承諾，她不肯添名。

## 風險與矛盾

1. **制度與組織不可提前。** 城約定在 2097，遠牧 2103 成軍；正式獵牌與評等制度見 2106 運河夜及新加坡會議後續。建議城約成立段只寫商團與未具名庇護團，獵牌效力留給 2108 地點狀態。三把正式傘也不能倒灌進崩年守港史。
2. **「本區第一座」範圍未定。** city-types 未定吉布地的先後排名，本次查無同名不等於證成第一座。建議領導界定為本批撒南、北非、西亞範圍的提案，不擴成非洲第一；本線不自行刪改交接書。
3. **年齡層易撞裁示。** 朱瑪比他更年輕的團員不能全落在 2089–2092 生育缺口。建議以崩年前出生、約二十至二十六歲者為主；不新增具名團員，也不補精確人數。
4. **拒載不等於封鎖地球全部運輸。** 奈洛比港事件是渡月船拒載生物系，規格「只能走海路」應限本次出洋方案。建議不推成世界上只有海運能載獸，亦不把朱瑪寫成 2102 那個未具名買賣的騎手。
5. **用語與欄位有落差。** 法莉妲規格的「無線電員」與 style 替代詞衝突，建議產出正文用港務天網通訊員；交接書「gameRefs／world 一律」與 README 各類適用欄位不一致，建議領導明確按類型填，事件不自行加未登記欄位。
6. **既有內容不可借用成新戰績。** 科托努已有黑幫城；拉哥斯支已在會議、蝕域與孟買支出現；阿克拉清剿也已有歸屬。建議新增條目只展開拉哥斯支的起源，不把阿克拉民兵戰績算成黨史，不把巴巴圖德或議長借作黨魁。娜迪雅、法莉妲也只補群像中的職務。
7. **合作、自治與傳聞需分清。** 遠牧躲徵召但與撒南友好並不矛盾，契約抽成不等於國家徵召；吉布地自由也不代表債務免責。軛鞍行收購養裂子體僅為既有 rumor，不能推成遠牧的公開貨源；本批無必要新增 hidden 真相。

## 建議（可選）

產出依交接書順序做勢力與地點，再做事件與人物；同一史實分別落在制度、地方生活、當夜轉折與個人後果，避免四檔重述首船故事。兩筆年表只是既定事件的摘要，不增為第十二、十三件。本線僅驗收 PLAN.md 的存在／容量／已讀清單、11 件白話字數與終局 STATUS 三條，不啟動產出段驗收。
