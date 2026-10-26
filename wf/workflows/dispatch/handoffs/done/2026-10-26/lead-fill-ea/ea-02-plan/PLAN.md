## ① 已讀清單

cx-ea-02p 親讀如下；相對路徑以主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/` 為準。review 與其他 wf-table 資料均以條件／分段查詢讀取；需求初稿只作骨架，未執行其產出、測試或寫檔指令。

- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `content/lore/style/people.md`
- `content/lore/README.md`
- `wf/workflows/planning/design-notes/world/history-lines.md`
- `wf/workflows/planning/design-notes/world/history-lines/lines.md`
- `wf/workflows/planning/design-notes/world/before-collapse.md`
- `wf/workflows/planning/design-notes/world/before-collapse-powers.md`
- `wf/workflows/planning/design-notes/world/polity.md`
- `wf/workflows/planning/design-notes/world/city-types.md`
- `wf/workflows/planning/design-notes/world/magnates.md`
- `wf/workflows/planning/design-notes/world/drive.md`
- `wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`
- `wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/review.json`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/ea-01/REPORT.md`
- `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/cx-ea-02.md`

另讀交接書 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-ea/cx-ea-02p.md`、`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、`wf/workflows/inbox/PROTOCOL.md`、`wf/workflows/content/polish.md` 與 `wf/workflows/dispatch/CLAIMS.md`。查詢 world 目錄的 `history-nodes.json`、`history-timeline.json`、`history-lines.json`、`history-orphans.json`、`scale-v2.json`；親讀 world-pillars 的世界與機甲相關守則。

ea-01 十四檔已整檔讀：`content/lore/factions/{imperial-court,japan-umbrella,korea-umbrella,russia-umbrella}.json`；`content/lore/events/{jiangkou-night,chaebol-ascent,eastern-abandonment,mandate-of-kuafu,setouchi-lock,karafuto-understanding,court-parade}.json`；`content/lore/places/{yangtze-mouth,setouchi,kamchatka-wells}.json`。另依交接關鍵詞讀本區既有 lore 的 summary、可用的 2108 段與 status2108；重點整讀 `characters/{old-man,unit-07,kim-haneul,tenzin-dolma,lobsang,hakan-demir}.json`、`places/yakutsk-bed.json`、`events/white-night-first-seen.json`（均在 content/lore）。已列 events／places／characters 目錄，搜尋各線 manifest 的 files、goal 及 CLAIMS；白夜孤兒列現已由怪獸線填妥，不另寫二名起源。

## ② 設計理念

這批讓第一批的國家與城牆長出「還有人願意站上去」的理由：朝廷官員把求不來的天命換成自己送得到的詔令，日本老駕駛把空座艙等成一位新同伴，韓國人把崇拜的重量交還整條牆，俄國守將帶著失守城的鑰匙繼續護人，中亞商隊則看見金錢買不動古代機。沿用初稿的一勢力、四事件、五地、五人，共十五件；人物只在各自地方發光，沒有跨區救世主。事件負責轉折，地點負責當下生活，人物負責一個難以收回的選擇，避免三份檔重述同一篇戰報。光是燈、山影、吶喊與被叫出的名字；欠薪、斷糧、寒冷仍留在畫面裡，文書只是代價，不做整篇的主角。

## ③ 相關概念與產出邊界

**節點與底色。** N03 是公刻、分家與防線私有化，N07 是魂的意志與處境，N08 是獵牌法及守線，N09 是信貸與高階軍售；本批寫它們的地方前因或後果，不把同年事件強說成節點成因（出處：history-nodes.json、history-timeline.json）。底色 1.1 的人口缺口、1.2 的駕駛員稀缺、1.4 的糧路、1.6 的國家、1.8 的哀悼、1.11 的去留、1.12 的人入資產欄，分別落在人與事上（出處：history-lines.md）。

**國家與傘。** 中、俄為國家型，日、韓為單國小傘，境內無自由城市；中亞席位屬縮小的國家，傘分援軍、城與獵團負責當夜能到（出處：polity.md、city-types.md）。中亞規模沿用六千五百萬人、十二城；新地點都是既有總數內的填名，不能加總成新城額（出處：scale-v2.json）。

**錢與墟。** 塞勒涅是穹頂資本的窗口，沒有任何祕法；買墟不能保證認主，中亞墟多獸少不等於手握免費高階精粹（出處：magnates.md、B 線、world-pillars/world/tone-and-rules.md）。「中亞那把傘」沿用描述句；成都行在、季克西的本批定位、四事件的細節、五位人物及「守燈」稱呼全是提案。既有地名的譯名不是新世界制度名。

**魂與人。** 傳統算核能普通開、精粹武器仍傷獸，未醒時不能驅動核心使用招式或附魔；醒魂不可複製、能獨駕而成長慢，鮮明人格限 S 級以上（出處：drive.md、style/people.md）。本批不造 S 級例外，不沿用「AI＝機魂」的簡化替詞；玩家文本稱算核自走機。老爹 2100 育成、2101 最早登錄，七號 2104 首次被認為有意志，錨點不變。

**可見度與命名。** 每節英文工作原名先界定意涵，中文再意譯或沿用專名音譯；新人物以羅馬字姓名作英文原名，漢字姓名不逐字翻譯。新名詞在本計畫標提案，產出時沿命名紀錄保存；不要把「提案」誤當世界內傳聞。未公開真相放 secrets.hidden，未證消息放 secrets.rumor，summary／body 不洩密（出處：polish.md、lore README 可見度）。本批醒魂的內情與賣墟後續採下述分層，不擅自解答裏側或認主。

**交給產出工人的寫法。** 每檔由本節指定的一件事起筆，保留前因、後果與 2108-01 落點；事件 body 用三至五小節、consequences 一句一條，人物各有 events 與至少一列 relations，地點帶 world=earth、status2108。faction 的四個規定小節照用；無藍本持有權就省略可選 ancientMech，不憑欄位慣例新造古代機。敘述用古代機／裝甲／蝕；海洋潮汐照用。不用其他作品比喻，不取真實歷史人名、朝名、年號或君主名；國家、公司與巨頭都有到不了的地方。處容與金河娜不擔主角，夸父不替朝廷出征。五位之外只用無名群像，不造機型、怪獸或額外 lore 檔。

**相對初稿的偏離。** 保留十五件結構與成都提案；只把摩爾曼斯克換成季克西（tiksi），保留俄北極岸國屬港的功能，因前者在歐洲，與本交接「不碰歐洲」及初稿五地皆亞洲不相容。雅庫茨克守將改為失守後在南側防火帶工作的舊守將，因既有地點開場已無城。守牆機事件及人物的公開敘述收窄為可觀察的守牆與登錄，醒魂確因放 hidden，對齊 ea-01 的 rumor；不用初稿可選的 S 級「我」方案，避免新例外。官員、人名、事件名與出生年是填實初稿空位；事件選 2103、2107-08 落在其允許區間。既有檔三處插入保留為建議，不擴出第四處。

## ④ 新檔清單（十五件；字數指 body 繁中文字，非 JSON 位元組）

### 01｜中亞那把傘

預定檔名／類別：`content/lore/factions/central-asia-umbrella.json`／勢力。

顯示名與兩步命名：Central Asian Umbrella → 以後方商路互保的分配層 → 中亞那把傘；描述句沿用，組織細節提案。

欄位：type=大勢力；scale=6500 萬人、12 城、聯盟型；founded=新加坡會議後逐步成形（不釘成立年）；hq=阿拉木圖的輪值議事處（提案），leaders=[]。

**掛到**：G、B、C、D 線；N06 後果、N09；底色 1.4、1.6。

**前因→後果**：崩前依長鏈輸出物資→沿海需求與運輸斷裂，各國把糧路與墟交易湊成互保→賣墟案暴露收益可分、研究權與地方守備卻不能由商人一口賣完。

**2108-01 狀態**：阿拉木圖仍交易；各國派席位分護運與救援，向中俄或月面窗口買精粹、高階件；沒有自己的祕法，不能靠賣墟擺脫所有貸方。

**與既有 lore 的關係**：引 faction/imperial-court、faction/russia-umbrella、faction/selene、faction/shell-society；前三者 relations 可中立，學會緊張（本案爭議）。新 place/almaty、event/kazakh-ruin-sale 承接。不得宣稱買到整台可開的古代機；不替西亞新增事件或設席。

**這件的光**：大風掀起議事帳的布頂，各國來客一齊按住，遠山的輪廓像一把無主的冠。

預估字數：800–1000 字。四節分寫護糧守路、傭兵現貨補給、通用堅盾圖與外購上限、賣墟後交涉。信條提案：「山不替人開門，路要自己守。」不列新血統、具名領袖、自由城市；不為湊勢力史詩另造戰役。

### 02｜哈薩克賣墟案

預定檔名／類別：`content/lore/events/kazakh-ruin-sale.json`／事件。

顯示名與兩步命名：The Ruin Deed → 一紙可買地，買不到認主 → 哈薩克賣墟案；沿用 B 線提案名。

欄位：date=2104；period=era/tide-line；kind=政治；places=[place/almaty]，墟位於哈薩克境內天山高地，未另建墟檔。

**掛到**：B、D、G 線；N04 封鎖後的買墟路徑；B 線〈2104 哈薩克賣墟案〉；底色 1.6。

**前因→後果**：塞勒涅缺祕法、學會受月面封鎖→國家授權、城邦交割、發現者討分成的整墟交易在阿拉木圖成交→學會爭取保留抄讀，地方發現守路義務沒有跟售價一起消失。

**2108-01 狀態**：已成交的契約仍在；公開可知交割與學會抗議，研究所得、古代機是否醒、實際搬走了什麼一律未定。

**與既有 lore 的關係**：引 faction/selene、faction/shell-society、event/lunar-blockade；新 faction/central-asia-umbrella。法理由哈薩克國家授權，傘不是地主；不給新古代機名字、能力、主人，不影射已取得祕法。

**這件的光**：買家在山下讀完整份契約，雪線之上始終沒有回話；山風吹過落印的紙角。

預估字數：650–800 字。敘事四段：上山的貨隊／三方蓋印／學會索抄／留守路口。含古代機是作者依 B 線保留的前提；外界只聞其事，以 secrets.rumor 保存，不在 summary 確認。後續最多一句傳聞「買家仍在等它認人」，不可寫認主成功、運抵月面或新增祕法。

### 03｜空艙有名

預定檔名／類別：`content/lore/events/wall-soul-waking.json`／事件。

顯示名與兩步命名：A Name for the Empty Seat → 空座艙被當成有人回應 → 空艙有名；提案事件名。

欄位：date=2107-08；period=era/league；kind=其他；places=[place/sendai-wall]；characters=[character/mase-tomonori, character/wall-tomori]。年月為提案；只說該月一次大潮，不自造日序或天象。

**掛到**：E、C、G 線；N07、N08 的地方後果；底色 1.1、1.2、1.12；2094 瀨戶內鎖海。

**前因→後果**：日傘缺駕駛員，長年用有核心的算核自走機普通開→一台經歷許多戰場的守牆機在大潮時醒魂→守備增加一位需教的新手，登錄欄卻仍把它列成裝備。

**2108-01 狀態**：守燈與真瀨友則仍在仙台搭班；能獨駕、學得慢，沒有同批複本。官方記錄承認一顆機魂，外界對其究竟如何醒來仍只有守備口述。

**與既有 lore 的關係**：引 faction/japan-umbrella、event/setouchi-lock、event/hunter-license-act、event/first-registered-soul；老爹與七號只用於日期界線。普通開本就能以精粹武器傷獸，不能把射中怪獸當醒魂證明；不重演死者回港。

**這件的光**：真瀨把寫有「守燈」的布條繫在空艙扶手上，整排老兵對著沒有臉的艙門敬禮。

預估字數：650–800 字。public：大潮守備、事後空艙下核心被驅動的檢驗、登錄及稱呼；hidden：確由長期算核守牆在大潮偶然醒魂。測試只是辨認既成事實，不是醒魂技術。沒有古代機到仙台；不說話的魂也有人格以外的人之地位。

### 04｜赴牆詔

預定檔名／類別：`content/lore/events/court-conscription-writ.json`／事件。

顯示名與兩步命名：The Muster at the Wall → 詔令必須與送令者一同抵達城牆 → 赴牆詔；提案，不另立法典。

欄位：date=2105；period=era/tide-line；kind=政治；places=[place/court-seat]（發詔地）；characters=[character/wen-zhaoheng]。受援地為守得到的東部國屬沿海城，無名、不新增地點。

**掛到**：G、C 線；N03 外包防線的後果，N08 前的國家徵召樣本；底色 1.2、1.6。

**前因→後果**：國家仍有徵召權，境內受雇獵團卻各有守約地→溫照衡把徵召與補給送往缺人的牆，獵團在原約、國籍與傷員之間爭吵→救下一段撤人通道，欠薪與被抽走的人手留到後來。

**2108-01 狀態**：詔令仍是有效先例，部分款項未結；當年被抽援的地方仍有怨，官員繼續逐筆核付，不能以一夜獲救說徵召沒有代價。

**與既有 lore 的關係**：引 faction/imperial-court、event/jiangkou-night、event/mandate-of-kuafu；江口仍是最後一道全國徵召，本詔只及守得到的省。2105 不發殘聯獵牌、不引用尚未頒布的獵牌法；不取君主與朝號。

**這件的光**：捧詔的人迎著海上的黑影走上牆，終於不再只叫別人往前。

預估字數：600–750 字。採政治史中的一次守備，不寫新機甲招式；徵召對象是國家法理可及的人，不把所有外籍來客一律徵成國民。

### 05｜眾肩擎城

預定檔名／類別：`content/lore/events/incheon-roll-call.json`／事件。

顯示名與兩步命名：Many Shoulders Hold the Gate → 城由許多人抬住 → 眾肩擎城；提案事件名，不取「唱名夜」。

欄位：date=2103；period=era/tide-line；kind=戰役；places=[place/incheon]；characters=[character/seo-haegyeom]；factions=[faction/korea-umbrella]。

**掛到**：G、F 線；財閥上月的地方後果；底色 1.6、1.8、1.11。

**前因→後果**：財閥離去、國家接管工廠並把港門交給守備→大潮時徐海謙帶隊讓裝甲相抵，替修門與退入內牆的人爭時間→倖存者把整隊功勞集中在一張臉上，守城崇拜開始壓住活人。

**2108-01 狀態**：仁川仍守住；紀念像與值班名冊並存，徐海謙要求補齊同伴姓名，居民仍拿他的像祈求下一夜平安。

**與既有 lore 的關係**：引 event/chaebol-ascent、faction/korea-umbrella；釜山與 event/hundred-lanterns 只作讀者背景，不進本役。處容、金河娜、第三刃不救場；不重演同旗之約，也不寫新怪獸二名。

**這件的光**：海謙吼「肩借給城！」，一排傷機的肩甲抵在城門下，像一座會流血的山。

預估字數：650–800 字。吶喊是人說的話，不設計同名能力；獸潮被拖住、民眾退入內牆即可，不全殲、不把仁川寫成國家之外的神權城。

### 06｜成都行在

預定檔名／類別：`content/lore/places/court-seat.json`／地點。

顯示名與兩步命名：The Inland Court at Chengdu → 君主與政務退入內陸而法統未斷 → 成都行在；行在定位提案。

欄位：region=亞洲・中國四川盆地成都；continent=亞洲；kind=城邦；world=earth。

**掛到**：G、C 線；N01 後果、N09；底色 1.4、1.6；江口夜、朝廷閱兵。

**前因→後果**：崩前工業與內陸糧倉支撐沿海→朝廷及內閣退到成都，接回議會、工業與省間糧路→徵召、欠款與新軍售在同一座城交會。

**2108-01 狀態**：國屬城邦、朝廷與內閣所在地；君主提供法理，內閣辦政務，議會仍在，護糧隊與請餉者來往。成都不是全國都救得到的證據。

**與既有 lore 的關係**：引 faction/imperial-court、event/jiangkou-night、event/court-parade；新 event/court-conscription-writ。只把閱兵的消息與採購寫進城，不擅定既有閱兵必在成都。夸父仍在 place/golmud-nest，朝廷不是守寢人。

**這件的光**：陰雨裡宮門升起舊旗，城外滿載新糧的車隊像一條穿山而來的金河。

預估字數：500–650 字。

### 07｜仙台

預定檔名／類別：`content/lore/places/sendai-wall.json`／地點。

顯示名與兩步命名：Sendai, the Watch on the Pacific → 太平洋岸輪守的城 → 仙台；沿用地名，城邦定位提案。

欄位：region=亞洲・日本仙台太平洋岸；continent=亞洲；kind=城邦；world=earth。

**掛到**：C、E、G 線；N03 後果、N07 後果；底色 1.1、1.2、1.3；瀨戶內鎖海。

**前因→後果**：崩前高齡沿海城市仰賴外來供應→斷鏈後縮成能護住的城，瀨戶內轉來修造能力→機能到、人不夠，老駕駛和空艙守牆機輪班。

**2108-01 狀態**：日傘十城之一，國家法理與調援下的守牆城；普通開仍是多數，新魂只有這一個被本篇記下的個案，訓練缺口未填平。

**與既有 lore 的關係**：引 faction/japan-umbrella、place/setouchi、event/setouchi-lock；新 event/wall-soul-waking。仙台不在瀨戶內，不把鎖海的安全圈擴到太平洋；不變成新獨立勢力或新增第十一城。

**這件的光**：海風掀開一排空艙的布罩，老兵把每架艙梯都放下，像在等尚未出生的人回家。

預估字數：500–650 字。

### 08｜仁川

預定檔名／類別：`content/lore/places/incheon.json`／地點。

顯示名與兩步命名：Incheon, a City Kept by Its Own → 留下的人握住港門 → 仁川；沿用地名，守城細節提案。

欄位：region=亞洲・韓國仁川黃海岸；continent=亞洲；kind=城邦；world=earth。

**掛到**：G、F、D 線；底色 1.4、1.6、1.11；財閥上月、眾肩擎城。

**前因→後果**：崩前財閥倉廠與港路掌握日常→資本上月後國家接收、地方修造與守備續命→守城者成街口偶像，仍須用採購與護糧維持牆。

**2108-01 狀態**：韓傘八城之一、守住；國家分援軍，地方守港，紀念像旁有未修完的機庫；崇拜不能抵料錢或徵召。

**與既有 lore 的關係**：引 faction/korea-umbrella、event/chaebol-ascent；新 event/incheon-roll-call。place/busan 是另一城，不把同旗之約補給、處容血統、第三刃特許移植到仁川；國家法理仍在。

**這件的光**：潮霧把守城者的像遮住時，孩子仍能循著牆上此起彼落的喊聲找到機庫。

預估字數：500–650 字。

### 09｜季克西

預定檔名／類別：`content/lore/places/tiksi.json`／地點。

顯示名與兩步命名：Tiksi, the Winter Anchorage → 極地仍有人接纜的港 → 季克西；既有地名音譯，國屬港定位提案。

欄位：region=亞洲・俄羅斯拉普捷夫海岸季克西；continent=亞洲；kind=港；world=earth。

**掛到**：G、F 線；底色 1.4、1.6；棄東令的腹地／北極岸對照。

**前因→後果**：崩前資源國的北極運補港→北極岸整體因冰封受創較小，國家保住的腹地經此補給→港能留、人能活，冬季與長路仍切斷它對其他地方的援手。

**2108-01 狀態**：俄國法理下仍運轉的北極港，計入既有十四城體系；國家調撥與地方接纜分開，能雇護運，無法保證雅庫茨克收復或遠東援軍必到。

**與既有 lore 的關係**：引 faction/russia-umbrella、event/eastern-abandonment、place/yakutsk-bed。棄東令的「只留雅庫茨克」指遠東守備收縮，不抹掉北極岸；不新定全球行政邊界，不把冰封當免災結界。

**這件的光**：極夜裡繫船柱上一盞燈不熄，歸船的人先看見它，才看見整座國家留下的岸。

預估字數：500–650 字。取代初稿 places/murmansk.json；不敘歐傘、不借用歐洲新人物。只寫虛構年代的守港與糧路，不用現實航運資料補設定。

### 10｜阿拉木圖

預定檔名／類別：`content/lore/places/almaty.json`／地點。

顯示名與兩步命名：Almaty, the Mountain Threshold → 商隊在山前換貨、學者從這裡進墟 → 阿拉木圖；地名沿用，交易定位提案。

欄位：region=亞洲・中亞哈薩克天山北麓；continent=亞洲；kind=城邦；world=earth。

**掛到**：B、C、D、G 線；N04 後果、N09 採購壓力；底色 1.4、1.6。

**前因→後果**：崩前長鏈商路→崩年沿海斷鏈、內陸後方重新接糧與高地墟→交易城以貨隊和探墟接應維持生計，賣墟後貨價與抄讀權分道。

**2108-01 狀態**：中亞十二城之一，哈薩克國家法理下的後方交易城；傘在此輪值議事，國家登記、城邦守路、學會索抄各有桌子，無常態內陸獸潮。

**與既有 lore 的關係**：引 faction/shell-society、faction/selene；新 faction/central-asia-umbrella、event/kazakh-ruin-sale。學會來研究不等於城已取得聚煉祕法；不把整座天山或所有中亞墟賣給公司，不寫自由城市。

**這件的光**：天山影子越過集市，背拓片的人和背糧的人在同一盞門燈下避雪。

預估字數：500–650 字。

### 11｜溫照衡

預定檔名／類別：`content/lore/characters/wen-zhaoheng.json`／人物。

顯示名與兩步命名：Wen Zhaoheng → 照見兩端、掂量承諾的文官 → 溫照衡；虛構漢字人名，提案。

欄位：born=2057；faction=faction/imperial-court；role=內閣徵調官、天命詔舊使；kind=human。

**掛到**：G、B 線；N03 後果；底色 1.6；2094 天命詔、2105 赴牆詔。

**前因→後果**：2094 捧天命詔入山，被洛桑請茶、原封帶回禮箱→明白國家無法命令認主→2105 起草並親送徵召，這回到的是他與糧，留下的是欠薪。

**2108-01 狀態**：約五十一歲，成都行在核付守備欠款，仍信詔令能救人；不是內閣首腦、國家反派或夸父代理人。

**與既有 lore 的關係**：events=[event/mandate-of-kuafu, event/court-conscription-writ]；relations 指 character/lobsang，關係「被拒的使者與接待者」（新提案）。接既有天命詔無名使者，不改拒封、禮箱全數帶回、朝廷未動兵。

**這件的光**：他把退回的詔紙攤在海風吹濕的牆上，用自己的手按住，不再等天命替他壓紙。

預估字數：550–700 字。

### 12｜真瀨 友則

預定檔名／類別：`content/lore/characters/mase-tomonori.json`／人物。

顯示名與兩步命名：Mase Tomonori → 舊班表裡還願意等新人的友伴 → 真瀨 友則；虛構日文姓名羅馬字對應，提案。

欄位：born=2038；faction=faction/japan-umbrella；role=仙台現役守牆駕駛員兼教習；kind=human；所駕只稱既有堅盾系列，不定新型號。

**掛到**：C、E、G 線；N03 後果、N07 後果；底色 1.1、1.2；瀨戶內鎖海、空艙有名。

**前因→後果**：崩前將老的造船工，崩年後轉為守備，公刻後才上衍型機→開機多年老得慢，接班一代卻有崩年出生缺口→大潮後主動擔新魂教習，讓守牆不只剩延長自己的班。

**2108-01 狀態**：約七十歲，外貌比同齡人年輕許多（不硬填青春年齡），在仙台現役並教守燈；有傷、有疲勞，不因不老而無敵，退役會回常速。

**與既有 lore 的關係**：events=[event/wall-soul-waking]；relations 指 character/wall-tomori，關係「教習與新同伴」。引 faction/japan-umbrella、place/setouchi；不把崩前工程機當機甲，不把遙控年資算成驅動時數。

**這件的光**：同齡人扶杖來看他換班，他卻把艙梯讓給看不見的新兵，笑說「這回有人比我年輕了」。

預估字數：550–700 字。

### 13｜守燈

預定檔名／類別：`content/lore/characters/wall-tomori.json`／人物。

顯示名與兩步命名：Tomori / Lamplight → 別人為新生者留的燈 → 守燈；意譯的機魂呼名，提案，非型號。

欄位：born=2107-08 醒來（仙台）；faction=faction/japan-umbrella；role=仙台守牆機的新生機魂；kind=soul；不標 S 級。

**掛到**：E、C、G 線；N07、N08 後果；底色 1.12；空艙有名。

**前因→後果**：長期算核自走的有核心守牆機遇大潮機緣→出現不可複製的新魂→真瀨教它操作，城裡替它取名，登錄仍列裝備。

**2108-01 狀態**：在仙台，醒來不足一年；回答短、照本宣科，可獨駕而成長慢，平日與真瀨同駕。沒有口頭禪、怪癖、執念、宣言、自取招式名或裏側聲音。

**與既有 lore 的關係**：events=[event/wall-soul-waking]；relations 指 character/mase-tomonori，關係「教習」，note 描寫教導而不虛構魂的愛憎。承 faction/japan-umbrella 的醒魂傳聞；與 character/old-man、character/unit-07 不設親屬或複本關係。

**這件的光**：守燈只答「收到」，城上的人卻第一次為這句平常的答覆歡呼。

預估字數：450–600 字。public 寫登錄、同駕、教習與被取名；secrets.hidden 記大潮中由算核醒魂；born 只列年月與「醒來」，不把其機緣確因洩進 summary。魂核與原機甲核心如何轉變仍未決，不自行給容器學答案。

### 14｜徐海謙

預定檔名／類別：`content/lore/characters/seo-haegyeom.json`／人物。

顯示名與兩步命名：Seo Haegyeom → 把榮耀退回眾人肩上的守門者 → 徐海謙；虛構韓文姓名羅馬字對應，提案。

欄位：born=2066；faction=faction/korea-umbrella；role=仁川守備隊領隊、被塑像的守城者；kind=human；只駕既有通用衍型機。

**掛到**：G、F 線；底色 1.6、1.8、1.11；財閥上月、眾肩擎城。

**前因→後果**：崩前在財閥廠房搬料，資產接收後加入守備→2103 與同伴共撐城門而被塑像→他把休整時間拿去補刻同伴名，居民的崇拜卻使離開比守城更難。

**2108-01 狀態**：約四十二歲，仍在仁川輪守；現役開機老得慢，傷痛未消；想休假探望遷居內陸的家人，不追求城主位子，也不重複金河娜想跳舞的願望。

**與既有 lore 的關係**：events=[event/incheon-roll-call]；relations 指 character/yoon-seoyoung，關係「2107 守備交流的通信對象」（提案、限一句：互談修甲，非師徒）。不替第三刃洗白、不把她寫進本役，不讓金河娜出場。

**這件的光**：他夜裡爬上自己的像，把一塊塊同伴姓名牌掛在石肩上，天亮時整座像都在風裡響。

預估字數：550–700 字。

### 15｜妮娜・別洛娃

預定檔名／類別：`content/lore/characters/nina-belova.json`／人物。

顯示名與兩步命名：Nina Belova → 扛著失守故城的鑰匙繼續護人的舊守將 → 妮娜・別洛娃；虛構俄文姓名音譯，提案。

欄位：born=2059；faction=faction/russia-umbrella；role=雅庫茨克舊守將、南側防火帶護運指揮；kind=human。

**掛到**：G、F 線；底色 1.4、1.6、1.11；2091 棄東令、2100 白夜初見的地方背景。

**前因→後果**：2091 被留在國家指定的保留點→菌絲沿淡水使城市後來失守，她從守門變成帶撤離者走路→如今替防火帶與護運雇人，不再許諾國家下令就會有援軍。

**2108-01 狀態**：約四十九歲，在雅庫茨克南側安全地帶的流動營地；不是在菌床核心繼續治理的城主，不新增第十五城，不定精確失守年或收復日期。

**與既有 lore 的關係**：events=[event/eastern-abandonment]；relations 指 character/hakan-demir，關係「燒季空援買方與承包者」（提案）。引 place/yakutsk-bed、faction/remnant-wings、event/white-night-first-seen 作時序背景；不接管怪獸線的洗衣工、命名功勞與首次燒夷矢。

**這件的光**：她把回不去的城門鑰匙掛在領口，帶撤離隊轉身時，鑰匙還朝著北方亮。

預估字數：550–700 字。

## ⑤ 既有檔只插入的修改建議（三件；本線不動手）

`content/lore/places/golmud-nest.json`：在 factions 陣列尾追加 `faction/imperial-court`，表示所在地的法理與往來；保留守寢人的控制、現有狀態和所有原值，不能讀成朝廷已接管窩。

`content/lore/places/yakutsk-bed.json`：在 factions 陣列尾追加 `faction/russia-umbrella`，表示俄國仍主張法理、在外緣活動；保留「失守、菌絲核心」，不能讀成俄軍已收復。若領導認為 factions 只能表現實際控制，寧可不採此建議，不以改舊文硬解。

`content/lore/places/busan.json`：在 factions 陣列尾追加 `faction/korea-umbrella`，讓國家法理與城邦守備並列；保留既有勢力、同旗之約與殘聯契約。三處都只補原陣列未有的元素，不重複追加，不改字串值。

## ⑥ 需求

lead-fill-mech：無必需的新型號需求。既有通用堅盾系列足以承載仙台故事；已看到 mf-01 的日傘 D 級普通開守牆機規劃，若領導之後提供已入庫 id，可在產出任務允許時引用，這份計畫不先占型號、不依賴其完成。老駕駛、仁川守備與中亞修造同樣只用既有通用機或等級通稱，無新增能力數值。

lead-fill-kaiju：無。白夜及其淡水菌絲例外已有 lore，白夜初見歸 kj-01，本批只寫棄東令下的人；仙台、仁川、赴牆詔只用未具名的既有裂獸群，不造物種、二名、數值或能力。

## ⑦ 風險與需要領導決定的事

**待審的創作選擇。** 建議照本稿批准十五件、季克西替換、成都行在、五人姓名與各出生年、三事件新中文名及中亞輪值議事處；這些是填充提案，不是新裁示。四事件依日期先後為仁川 2103、賣墟 2104、赴牆詔 2105、空艙有名 2107-08；只在計畫保留，未產年表檔。阿拉木圖國家授權賣墟的三方分工、徐海謙與尹瑞英通信均是可刪的地方細節；若刪通信，產出派工時另指定一位現有角色作自然關係，不能臨時加第六人。本計畫待領導審，不授權執行初稿的 lore 產出流程。

**可見度的取捨。** 日傘既有 secrets 把醒魂列 rumor，drive 已定其可能性；本稿採公共層記錄登錄與可觀察能力、hidden 記確因，保留兩者。賣墟是 B 線提案，後續仍未定；不要把「未公開」當成自己已獲授權補完真相。中亞不編領袖、不增自有古代機；先以交易案呈現政治轉折，避免為滿足大勢力範本的史詩格式越線造戰役與血統。

**雅庫茨克的兩個問題要分開。** 棄東令「只留」與開場「失守」是先後結果，本計畫已分開；但 `places/yakutsk-bed.json` 說殘翼燒季從成立起未停，`events/white-night-first-seen.json` 及 history-timeline 以 2100 為首次燒夷矢，年代仍有張力。舊守將不參與首次燒季、不替白夜命名、不定失守年，將這處留給領導與怪獸線協調。

**角色年代與代價。** `characters/old-man.json` 明載 2100 育成，本文卻有「十年沒變」；開場 2108 不滿十年。`characters/tenzin-dolma.json` 的「被夸父抽乾」與 style/people、M13 的古代系趨神性讀法有張力。本批不仿寫抽乾代價，不沿用老爹十年的計數，也不改來源。真瀨的不老只寫現役比同齡年輕，不把七十歲寫成沒有老傷的少年。

**魂規則的未決處。** drive.md 仍列原算核與醒後魂核的容器關係未決，機率相乘與引擎任一骰成功亦有待裁決；本批只寫既定的偶然醒來、不可複製與成長慢，不給機率、半徑、升級或容器的新答案。七號獨駕回港的謎不等於所有機魂都不能獨駕。

**舊 lore 與新政治讀法。** `faction/selene` 的「也是月亮本身」是既有誇張口吻，不能當成它獨占所有財富的證據；依 magnates 寫資本管家。ea-01 REPORT 另列釜山與殘聯關係、早期長槍公刻年代、劍魚-V5 等級等張力；本批不依賴其未解部分，仁川不繼承釜山契約，中亞只接堅盾公刻，不涉及長槍早期下線或劍魚定級。

**查重與範圍。** 已用現有同類目錄、全部 2026-10 manifest 的 files／goal 及 CLAIMS 比對；十五個預定檔名及五人顯示名沒有碰到既有或已列佔檔。ag-03、fill-03、mf 與 kj 的部分 draft files 尚空，故這是本次可見宣告的結果，領導派產出時應以最新 manifest 定實際寫域。主題鄰近不等於重做：美洲 mexico-muster 寫其國家徵召，赴牆詔專寫天命被拒後的文官與守得到的省；唱名夜歸他線，本批仁川寫活人的崇拜；白夜命名不重寫。沒有規劃歐洲、美洲、非洲、西亞、南亞或東南亞的新檔，既有區外 id 只作制度來歷與關係引用。

本線交付限 PLAN.md 與 review-draft.json；調查暫存與交接要求的 inbox 回報／輪詢狀態另依指定工具保存。不寫 lore、manifest、索引、SESSION-LOG 或 CLAIMS，不 commit、不上網；驗收只做 cx-ea-02p 交接書固定五條，不套初稿六條或內容產出測試。
