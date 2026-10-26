# 任務：在隔離 worktree 只新增 12 個月面 lore 檔——渡月起落、船員與白手套下船（batch bf-moon-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要；REPORT 開頭列「已讀清單」，每個路徑原樣出現）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/d-moon.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`、`content/lore/places/ferry-lane.json`、`content/lore/places/tranquility-city.json`、`content/lore/events/equator-ports-accord.json`、`content/lore/events/nairobi-port-incident.json`、`content/lore/events/whiteglove-incident.json`、`content/lore/events/credit-accord.json`、`content/lore/factions/whitegloves.json`、`content/lore/places/singapore.json`、`content/lore/characters/old-pigeon.json`、`content/lore/characters/mina-darzi.json`、`content/lore/factions/migrant-crew.json`；另在主 repo 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/cx-bf-moon-02.md`。相對路徑都相對 worktree；若檔案已由整理線搬移，以主 repo 查現存同份檔並在 REPORT 記替代路徑，不跳過內容。

## 背景與唯一目標

塞勒涅是中型公司，替穹頂下的錢當管家。錢的主人是三股匿名富豪群像，不是公司的無限金庫。本批依已審月面計畫補「渡月起落、船員與白手套下船」，只新增下面12檔；已有歷史不推翻，古代機不動，不替任何人指定認主。不新增地球人物、城市或第四個渡月港。靜海仍是唯一月城，所有月面新地點都是既有城區或封鎖線外勤務點。本稿已依第2輪 moon-rulings.md 重寫；與計畫有衝突時裁定優先，不自行增件。

## 方法與禁忌（引用 bf-common.md，原樣適用）

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

本輪必照 `wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`（主 repo 現存裁決）；每件至少一道光、全計畫至少三分之二為月面奇觀或可吼句，吃食／鞋／家書／擦窗各最多一件核心。逐檔指定的光景、口令與動作不可縮回靜態小善意；各批不得另添重複物件核心。

本批補充：2098 為人駕原型，2105 為無魂鐵偶；無核心鐵偶只能打人，有核心遙控機也只能普通開，機魂不可複製。手套是一個人，不是所有鐵偶共同的人格。月面人口、公司知情、M-3與阿鏽來源不加新答案。背面是地理，暗面是走私網；藏燈之盟只約束簽約當次撤離。既有信用協定的紙面古代機擔保，不等於古代機可被支配、出售即能駕駛。

## 範圍（排除法寫死）

新增只限 worktree 下這12檔：`content/lore/places/ferry-nostos.json`、`content/lore/places/tranquility-repair-dock.json`、`content/lore/places/lunar-letter-counter.json`、`content/lore/factions/lunar-ferry-crews.json`、`content/lore/characters/aliya-nasser.json`、`content/lore/characters/ivo-marot.json`、`content/lore/characters/chen-yuehe.json`、`content/lore/characters/sara-kett.json`、`content/lore/events/ferry-first-departure.json`、`content/lore/events/return-fare-queue.json`、`content/lore/events/whitegloves-come-ashore.json`、`content/lore/events/last-empty-berth.json`。

**只新增、不改既有檔**，含年表、勢力places、索引與manifest都不改。對既有檔的需求寫報告 `inserts.json` 與 `timeline-add.json`，領導合併。只引用 HEAD 已有 id 或同批新檔；跨批新 id 不寫進內容，改列 inserts。

不做：上列以外的任何 content 檔、content/base、content/index、content/batches、src、test、schemas、specs、設定筆記、wf其他檔；不新增規格外人名、公司名、機體名與招式。不要寫地球新地點與人物、不要碰萬潮葬王。筆記腳本只放 `/tmp/cx-bf-moon-02/`。不 commit。

件數 gate：新增超過12檔或碰到任何既有內容檔，停下回報，不靠擴範圍處理；本批不超過15檔上限。容量 gate：任一新檔 body 超過1500字，停下回報；本文目標300–1500字。任一 gate 觸發都停。

## 逐檔規格

格式照 content/lore/README.md。下列欄位值固定；通用 `body` 依要點寫，`summary` 一句世界內敘述，`name` 使用指定中文；`aka: []` 不自行填回譯英文。地點用「地貌與氣味／誰在這裡／發生過什麼／2108的狀態／獵團能在這裡幹什麼」五節，事件3–5小節，人物先一件做過的事；小群體不是大勢力，不補古代機藍本或機甲血統。新角色在月面居住與工作，往返船員仍以靜海為家。尚未發生的事件只寫條件與可能後果。

### 1. `content/lore/places/ferry-nostos.json`「望鄉號」（提案）

id：`place/ferry-nostos`；類型：地點。一句定位：望鄉號從赤道港拖光尾升起，窗裡的人看著地球漸小，月亮漸滿。 掛點：D；2066 定班、2096 赤道港協定；N09。

欄位值：`region`＝`"地月之間・既有渡月航路"`；`continent`＝`"軌道"`；`world`＝`"orbit"`；`kind`＝`"船"`；`status2108`＝`"現役定班船，母港靜海"`；`factions`＝`["faction/selene"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["渡月船","航程"]`。`name` 用「望鄉號」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：赤道港光尾升空，窗外地球漸小、月亮漸滿。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先寫船離開赤道港的一刻，光尾穿過星哨與墳帶，乘客貼窗看地球退遠。 （2）它只是塞勒涅現役渡月船的一艘，母港靜海、輪值既有三港，不另建公司或獨立航路。 （3）弦月開船、單程三天，窄艙裡富客與搬工各守自己的位置，船名不替所有旅人承諾返鄉。 （4）不追認它是2066首航船，不佔老鴿未指名的固定座位，不改拘束艙不得登船的規矩。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「望鄉號」（提案）；英文原意 Nostos，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/selene.json","jsonPath":"$.places","op":"append","value":"place/ferry-nostos","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 2. `content/lore/places/tranquility-repair-dock.json`「靜海修船塢」（提案）

id：`place/tranquility-repair-dock`；類型：地點。一句定位：渡月船在塢裡展開白色艙板，工人站在巨影下喊撤架，讓它再升上黑天。 掛點：D；2066 定班；N07；底色 1.2。

欄位值：`region`＝`"月面・靜海港既有修造區"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"港"`；`status2108`＝`"依弦月班期修造，地勤人手不足"`；`factions`＝`["faction/selene","faction/ground-union"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「靜海修船塢」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：白艙板展如翼，塢工撤架後船影升向黑天。 指定可吼句：架撤了，人先走！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）白色艙板沿吊架展開，修船工的影子被船腹照得細小，寫手勢與巨物同框。 （2）船塢位於靜海既有港區，不另建自治港，也不羅列維修機制。 （3）莎拉確認門能閉合才喊「架撤了，人先走！」，工人逐個離架，船才被交回當班船員。 （4）罷工曾讓吊架空停；今日再送船起落，不代表工作條件已經變好。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「靜海修船塢」（提案）；英文原意 White Hull Dock，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/ground-union.json","jsonPath":"$.places","op":"append","value":"place/tranquility-repair-dock","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 3. `content/lore/places/lunar-letter-counter.json`「靜海家書候領處」（提案）

id：`place/lunar-letter-counter`；類型：地點。一句定位：渡月船升空的光掃過候領櫃，沒人來取的家書仍朝地球擺著。 掛點：D；2066 定班；底色 1.8；N09。

欄位值：`region`＝`"月面・靜海港候船區"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"弦月前後領取，未領物繼續保管"`；`factions`＝`["faction/selene"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「靜海家書候領處」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：渡月船升空的光掃過朝向地球的未領封套。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）本計畫唯一以家書為核心的一件：船起飛的光掃過窄櫃，未領封套像一排朝向地球的小窗。 （2）這是靜海港既有候船區的便民櫃，人們要摸到親人的筆跡，不是天網消失。 （3）匿名值班人按舊約繼續保管未領物，不據此替地球人物立傳或判定生死。 （4）光退後封套仍留著；不把它改成暗面售名處、不新增鞋與食物意象。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「靜海家書候領處」（提案）；英文原意 Letters in Departure Light，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 4. `content/lore/factions/lunar-ferry-crews.json`「渡月船員」（提案）

id：`faction/lunar-ferry-crews`；類型：勢力。一句定位：開船令從艙首傳到艙尾，渡月船員把同一船人的姓名喊進離港白光。 掛點：D；2066 定班；底色 1.2、1.4。

欄位值：`type`＝`"其他"`；`scale`＝`"塞勒涅渡月船上的受僱船員，無共同首領"`；`founded`＝`"2066 定班後逐代接班"`；`hq`＝`"靜海港及渡月船"`；`ideology`＝`"人齊，才開船！"`；`places`＝`["place/ferry-nostos","place/tranquility-repair-dock"]`；`relations`＝`[{"faction":"faction/selene","stance":"中立","note":"領薪工作，個人立場不同。"},{"faction":"faction/ground-union","stance":"友好","note":"靠地勤維持船班，不是工會合併。"},{"faction":"faction/backside","stance":"中立","note":"有人替暗面捎貨，群像不替黑市作保。"}]`；`leaders`＝`[]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「渡月船員」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：船員接力唱名，船的光尾在艙外亮起。 指定可吼句：人齊，才開船！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）在船起落時寫船員接力傳令，搬工先下踏板，旅客的名字逐個被喊回艙內。 （2）這是常住靜海的職業群像，不是新航運公司、工會或常備軍。 （3）有人同情地勤停工，有人怕停航無薪，不替全體宣布同盟或同心反抗。 （4）「人齊，才開船！」只是當班人的責任口號，不是能壓過公司班期的永久法律；暗面熟客也不能靠一句話免查。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「渡月船員」（提案）；英文原意 Ferry Hands，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/places/ferry-lane.json","jsonPath":"$.factions","op":"append","value":"faction/lunar-ferry-crews","why":"補受僱船員的存在"}]`。僅寫報告建議檔，不直接套用。
### 5. `content/lore/characters/aliya-nasser.json`「阿莉雅・納瑟」（提案）

id：`character/aliya-nasser`；類型：人物。一句定位：最後一個搬工退出踏板，阿莉雅才抬手吼開船，把望鄉號送向藍色地球。 掛點：D；2066 定班；N09。

欄位值：`born`＝`"2069"`；`faction`＝`"faction/selene"`；`role`＝`"望鄉號船長，常住靜海"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/ivo-marot","relation":"當班同事","note":"他清踏板，她發開船令。"}]`；`events`＝`["event/last-empty-berth"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「阿莉雅・納瑟」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：船長抬手，望鄉號拖光離開靜海，向藍色地球去。 指定可吼句：踏板收，向地球！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）她把手停在半空等搬工離開，接著吼「踏板收，向地球！」，港光從窗上向後退。 （2）她是常住靜海的望鄉號船長，受僱掌舵，沒有公司股權或暗面領袖身分。 （3）她能爭取一個當班停頓，不能取消票價或替所有未到者延誤航班。 （4）最後空位的去留仍是possible事件，不提前寫她必然違令、被捕或丟職。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「阿莉雅・納瑟」（提案）；英文原意 Aliya Nasser，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 6. `content/lore/characters/ivo-marot.json`「伊沃・馬洛」（提案）

id：`character/ivo-marot`；類型：人物。一句定位：伊沃在渡月船白光裡割斷卡住的空貨網，吼人退後，自己最後離開踏板。 掛點：D；2066 定班；底色 1.2、1.4。

欄位值：`born`＝`"2072"`；`faction`＝`"faction/lunar-ferry-crews"`；`role`＝`"望鄉號貨艙領班，常住靜海"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/aliya-nasser","relation":"當班同事","note":"清空踏板後向船長示意。"}]`；`events`＝`[]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「伊沃・馬洛」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：船腹白光照著割開空網、最後離開踏板的領班。 指定可吼句：人退後，網給我！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先寫他沿踏板拉開打結的空貨網，船腹白光照滿密封服，他喊「人退後，網給我！」。 （2）他是望鄉號的貨艙領班，常住靜海，領船員薪；本輪改寫為搬運與離港動作。 （3）他切開的是已卸空的貨網，既不徒手抓飛船，也不使用新裝備招式。 （4）網落下後他最後離開踏板，把清空手勢交給船長；不把一次果斷擴成全船英雄傳。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「伊沃・馬洛」（提案）；英文原意 Ivo Marot，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 7. `content/lore/characters/chen-yuehe.json`「陳月河」（提案）

id：`character/chen-yuehe`；類型：人物。一句定位：滿牆離港光照著逆流的人潮，陳月河爬上欄杆喊方向，把回程隊伍帶到船邊。 掛點：D；2107 渡月船票價調漲；N09。

欄位值：`born`＝`"2083"`；`faction`＝`"faction/selene"`；`role`＝`"靜海港候船引導員"`；`kind`＝`"human"`；`relations`＝`[]`；`events`＝`["event/return-fare-queue"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「陳月河」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：渡月船離港光鋪滿候船牆，引路旗從人潮上方立起。 指定可吼句：回地球的，跟這面旗！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）她攀上候船欄杆，高舉引路旗，朝人潮喊「回地球的，跟這面旗！」。 （2）她在靜海長大，是港區引導員，不兼任家書保管或黑市交割，沒有地球人口名冊。 （3）去程漲價、回程便宜後，想接親人上月與想離月的人擠在同一道口，她只替人指明方向。 （4）離港光退後她把旗放回欄邊；不替任何家庭指定結果，也不知道壓艙的隱藏真相。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「陳月河」（提案）；英文原意 Chen Yuehe，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 8. `content/lore/characters/sara-kett.json`「莎拉・凱特」（提案）

id：`character/sara-kett`；類型：人物。一句定位：莎拉站在渡月船巨大的艙門下，喊先撤人再撤架，自己的影子被白船吞沒。 掛點：D；N07；底色 1.2。

欄位值：`born`＝`"2074"`；`faction`＝`"faction/ground-union"`；`role`＝`"靜海修船塢艙門地勤"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/park-incheol","relation":"工會同伴","note":"敬重會長，沒有領導職。"}]`；`events`＝`["event/whiteglove-incident"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「莎拉・凱特」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：巨艙門與小小地勤同框，出塢光尾掠過掌心。 指定可吼句：架撤了，人先走！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）她仰頭看艙門在塢裡合攏，先數同伴都離開吊架，再喊「架撤了，人先走！」。 （2）她是普通艙門地勤，不駕機甲，不解開魂核試驗，也不替工會作全局決策。 （3）兩次罷工的記憶讓她不肯把少一人當作班表小事，仍要面對下一班催工。 （4）船體滑出塢口時，光尾掠過她空著的掌心，留下的是下一扇待修門。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「莎拉・凱特」（提案）；英文原意 Sara Kett，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 9. `content/lore/events/ferry-first-departure.json`「弦月啟航」（提案）

id：`event/ferry-first-departure`；類型：事件。一句定位：定班首日，無名船員朝全船吼下一班還回來，渡月船的光尾越過赤道港。 掛點：D；2066 渡月航路定班。

欄位值：`date`＝`"2066"`；`period`＝`"era/old-world"`；`kind`＝`"其他"`；`factions`＝`["faction/selene","faction/lunar-ferry-crews"]`；`characters`＝`[]`；`places`＝`["place/ferry-lane"]`；`consequences`＝`["定班讓船員與移民可以等下一個弦月。","此為既有渡月航路定班條目的離港近景。"]`；`tags`＝`["moon"]`。`name` 用「弦月啟航」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：定班首日的光尾越過赤道港，船窗中的地球開始退遠。 指定可吼句：下一班，我們還回來！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）從2066定班首日的赤道港離船畫面切入，船員向離岸人群喊「下一班，我們還回來！」。 （2）光尾照亮岸邊，窗裡地球慢慢退遠；移民夢從一去不知何時回，變成能等下一班。 （3）當事人全匿名，不讓尚未出生的新角色出場，也不追認望鄉號就是首航船。 （4）弦月開船、單程三天照既定；2066不提前出現2096三港分班協定，不新造港名。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「弦月啟航」（提案）；英文原意 Departure at Half Moon，留manifest，不自動放aka。

年表：`[]`；只建議補既有2066條目的event鍵，不另增條目。 插入建議：`[{"file":"content/lore/timeline.json","jsonPath":"$.entries[5]","op":"setKey","value":{"event":"event/ferry-first-departure"},"why":"補2066既有定班條目的event；領導按日期與標題重找位置，已有不同event則回報，不覆寫。"}]`。僅寫報告建議檔，不直接套用。
### 10. `content/lore/events/return-fare-queue.json`「回程排到門外」（提案）

id：`event/return-fare-queue`；類型：事件。一句定位：回程隊伍擠進靜海港的離船白光，有人朝穹頂喊這次換月亮送我走。 掛點：D；2107 渡月船票價調漲；N09。

欄位值：`date`＝`"2107"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/selene","faction/ground-union"]`；`characters`＝`["character/chen-yuehe"]`；`places`＝`["place/tranquility-city","place/ferry-lane"]`；`consequences`＝`["便宜回程使部分工人離月，未讓穹頂富戶一同搬走。","引導員在候船區分開兩股方向不同的人潮。"]`；`tags`＝`["moon"]`。`name` 用「回程排到門外」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：離船白光裡兩股人潮分開，一人回望穹頂高喊。 指定可吼句：這次換月亮送我走！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）陳月河在兩股人潮間舉旗，想接親人上月的人停在窗口，付得起回程的人朝船走。 （2）船在架上亮起，有人轉身向白穹頂喊「這次換月亮送我走！」，旁人拉著他繼續前進。 （3）只寫票價調漲後的人流，不替新群像宣布強制遣返，不把人口政策寫成能減弱蝕潮。 （4）門裡隊伍向地球去，富戶仍在穹頂看景；不追加事故、勝利或地球人物生平。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「回程排到門外」（提案）；英文原意 The Homeward Queue，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 11. `content/lore/events/whitegloves-come-ashore.json`「白手套下船」（提案）

id：`event/whitegloves-come-ashore`；類型：事件。一句定位：渡月船停進新加坡港，白手套鐵偶踏下舷梯，催收聲先於白甲走進人群。 掛點：D；2107 信貸協定；N09。

欄位值：`date`＝`"2107"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/selene","faction/whitegloves"]`；`characters`＝`["character/ivo-marot"]`；`places`＝`["place/singapore","place/ferry-nostos"]`；`consequences`＝`["船員在既有港看見催收權化為踏下船的鐵偶。","不改第一通催收的地點、順序或協定適用範圍。"]`；`tags`＝`["moon"]`。`name` 用「白手套下船」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：渡月船餘光映白甲，鐵偶列隊踏下新加坡舷梯。 指定可吼句：請確認償還意願。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）時間在信貸協定生效與既有第一通催收之後，地點限既有新加坡渡月港，不新增地球地點或人物。 （2）從望鄉號當班船員視角寫白手套鐵偶列隊下舷梯，船尾餘光映著白甲，港工收回正在搬貨的手。 （3）鐵偶轉來「請確認償還意願」；若提手套，必說它是唯一催收機魂、罕見S級以上人格，聲音轉達不是分魂，也不是鐵偶的招式。 （4）只見受僱的執行者催問並攔住一件待交貨物，不跟進債戶住所，不新增債主主謀、戰鬥或奪取古代機的結果。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「白手套下船」（提案）；英文原意 White Gloves Ashore，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 12. `content/lore/events/last-empty-berth.json`「空位留到開船」（提案）

id：`event/last-empty-berth`；類型：事件。一句定位：若最後一人趕不上踏板，望鄉號的開船令便卡在船長舉起的手裡。 掛點：D；2107 票價調漲的後果；N09。

欄位值：`date`＝`"2108-02"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/selene","faction/lunar-ferry-crews"]`；`characters`＝`["character/aliya-nasser"]`；`places`＝`["place/ferry-nostos"]`；`consequences`＝`["若延候，當班船員須承擔班期壓力。","若照班離港，未到者可能留下；結果待觸發。"]`；`tags`＝`["moon","rumor"]`；`occurs`＝`"possible"`。`name` 用「空位留到開船」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：光尾亮起，船長的手停在半空，空位對著地球。 指定可吼句：踏板收，向地球！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）可能在開局後某個弦月出現：最後一位持票者未到，船外光尾已亮，空位仍留在窗邊。 （2）阿莉雅可能把手壓住再等片刻，也可能照班開船，兩種選擇都要有人承擔。 （3）她要喊的是「踏板收，向地球！」，故事停在是否發令的分岔，不替她定罪或定善。 （4）代表日期不排定新史實，不給登船者姓名或古代機身分，也不改全航路班期。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：possible。沒有隱藏真相授權的，不補秘密。新名詞僅「空位留到開船」（提案）；英文原意 The Last Berth，留manifest，不自動放aka。

年表：`[]`；不加年表：occurs: possible，代表日期不排定發生。 插入建議：`[]`。僅寫報告建議檔，不直接套用。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree寫前記baseline，12檔齊後跑；0錯，warnings不得高於baseline |
| `npm run check` | 12檔齊後一次，末行OK 0 errors；工人不用npm test，領導按manifest驗收 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查資料表、寫review與插入建議；年表entries可先用tabledb.load＋Table在記憶體轉接後條件查，不整份輸出 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-moon-02 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：只寫 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/` 中明列的12個新檔，以及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-02/`；`.git` 唯讀、不 commit。報告目錄只放 REPORT.md、review-rows.json、inserts.json、timeline-add.json 與檢查輸出。
- 共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不用 MCP；不上網。
- 子代理上限 1 個，模型隨意；若派實質工作，必親讀先讀清單與bf-common，受相同範圍與閘門約束，REPORT記成本與品質。
- 點名工具本身壞掉、沙箱拒寫 → BLOCKED；自己打錯路徑或臨時腳本錯 → 自己修。worktree未備好由領導準備，不自行建分支、worktree或改manifest的TBD。

## 工作

1. 讀先讀；上線：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-02 --up PROGRESS '已讀先讀清單，開始寫bf-moon-02的12件月面lore' < /dev/null`。
2. 記lore check baseline；先 ls 主 repo 與 worktree 的 content/lore/characters/，並逐名查全部新id，避開 lead-fill-pilots 並行新增；撞名先回報領導協調，不覆寫、不自改規格；按逐檔規格新增，先人物與地點，再群像與事件。同批引用在12檔齊後統一驗證，不用空殼內容冒充完成。
3. 寫完只跑指定lore check與npm run check；依逐檔建議製作inserts及timeline-add，沒有建議也交空rows的合法表。
4. 寫REPORT、白話表並回報。每完成一步讀orders。

## 交付

新內容在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-02/content/lore/` 明列12檔。REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-02/REPORT.md`；檔名若被擋，改同目錄report.md並在回報指實際路徑。回覆只要5行摘要＋REPORT路徑。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-02/review-rows.json`：wf-table/1，source為本交接書絕對路徑，extracted為2026-10-26，columns固定 `["檔","類別","名稱","白話","掛到"]`，12列、白話≤60字；新名在名稱後加「（提案）」。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-02/inserts.json`：wf-table/1，columns `["file","jsonPath","op","value","why"]`。op只用append（向該jsonPath陣列加一元素）、setKey（向該jsonPath物件增加value所帶的新鍵）。路徑索引由領導套用前重找，已存在相同元素不重加，已存在不同鍵值不覆寫。檔與每筆內容依逐檔規格；跨批引用只加建議，不直接改。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-02/timeline-add.json`：wf-table/1，columns `["date","title","summary","event","era","factions","tags","visibility"]`。只交本批指定候選，無則空rows；possible事件不入年表。所有建議仍待領導批准與合併。

REPORT開頭為已讀清單；其後四段：做了什麼（逐件一句與掛點、插入候選）；產出（路徑與兩項檢查結果）；沒做到或證據不足的；需要決定的事（新名、矛盾、不足）。末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree內 `node content/lore/check.ts` 末行errors=0，warnings不多於改前。
2. worktree內 `npm run check` 末行含OK 0 errors。
3. 明列12新檔存在、檔名等於id name段，沒有修改既有檔；領導以content_gate核範圍。
4. REPORT存在且開頭已讀清單齊；review-rows.json合法12列且白話≤60字；inserts.json與timeline-add.json依上述契約存在（可空）。

不要加碼驗證。領導後續的typecheck、test與readlist照manifest自行執行，不加到工人條數。

## 失敗怎麼處置（兩種要分開）

- 測出來是壞的 → 在範圍內修到過；修不好發FAILED，REPORT寫哪條不符。
- 測不出來 → 保持現狀，不回滾，發BLOCKED，寫卡點與解除條件，不拿舊輸出充證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-moon-02`。團隊：`teams/bigfill`，上游lead-bigfill，上線先PROGRESS。領導派出前登記ROSTER。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-02 --up DONE 'bf-moon-02新增12檔、既有檔未改，lore check 0錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-02/REPORT.md`（STATUS與標題照實際結果換）。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡超過10分鐘先BLOCKED。標題自足，不能只說完成。
