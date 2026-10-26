# 任務：在隔離 worktree 只新增 11 個 lore 檔，補深美洲的人與畫面（batch bf-deep-05）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書摘要**；REPORT 開頭「已讀清單」，以下每個路徑原樣列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/base/bodyplans/mycel-drowned-grove.json`、`content/base/bodyplans/mycel-reed-lace.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/bodyplans/quadruped-hound.json`、`content/base/frames/bulwark-i.json`、`content/base/frames/na-sled-03.json`、`content/base/species/drowned-grove.json`、`content/base/species/hound.json`、`content/base/species/reed-lace.json`、`content/base/species/tidewolf.json`、`content/base/world/models/bulwark-i.json`、`content/base/world/models/na-sled-03.json`、`content/lore/characters/eugenia-ferrero.json`、`content/lore/eras/league.json`、`content/lore/factions/latam-umbrella.json`、`content/lore/factions/north-american-umbrella.json`、`content/lore/factions/quito.json`、`content/lore/factions/rift-beasts.json`、`content/lore/factions/shell-society.json`、`content/lore/places/belem.json`、`content/lore/places/brasilia.json`、`content/lore/places/five-lakes-white-ford.json`、`content/lore/places/havana.json`、`content/lore/places/montreal.json`、`content/lore/places/seattle-outer-grain-quay.json`、`content/lore/places/seattle.json`、`content/lore/places/titicaca-ruin.json`、`content/lore/places/valparaiso.json`、`content/lore/places/winnipeg.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-05.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`。相對路徑相對 worktree 根；本稿與共同規格從主 repo 唯讀。本輪必讀 deep-rulings.md；與第一輪計畫或其他規格衝突時，以該裁定為準。

## 背景與唯一目標

本批只完成下列 11 件（美洲）。既有基調修正已補過的二名夜、哀悼與制度不重演；用地方人物補深已有畫面。只新增 content 檔，所有年表與反向關聯改動寫成報告資料，領導最後合併。人物、事件與地點同批可直接互引，其他批新檔不得直接引用。

## 方法與禁忌（每條都適用）

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

裁定必遵：`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`。每件至少一種光，人物的站起來瞬間與招牌話必留；受限小物只可按逐件配額使用，不自行加第二件核心畫面。

本批新增名字都是提案，review 名稱後加「（提案）」、REPORT「需要決定」列出；content name／body 不帶設計層標記。古代機周邊必把規格中的可見光、骸片或骨鳴寫進畫面，維持靜止、不新增認主或交易；禁止句不照貼正文。大潮全球同時、並非同一夜；本批不另造一次大潮。沒有精粹的凡鐵不殺獸。機械駕駛在座艙內驅動核心，引號是人物口號，不新增技能或可玩數值。

## 範圍（排除法寫死）

只新增下列逐檔規格列明的 11 個 content 檔，完整清單同交付的 manifest `files`。**不改任何既有檔**，包含年表、勢力、人物、地點、索引與 manifest。

不做：本批清單以外任何檔；不寫 content/base、src、test、specs、content/index、content/batches；wf 只准寫報告目錄；不寫月面、塞勒涅本部、萬潮葬王與吉大港北行；不刪檔、不 commit。筆記與臨時腳本放 `/tmp/cx-bf-deep-05/`。

件數 gate：content 新檔固定 11，修改既有檔固定 0；超出就停下回報。容量 gate：每件 body 300–1500 字；超過 1500 字先精簡，無法縮回則停下回報，不擴寫旁支。

## 逐檔規格

光代號：a＝獸有形體與動作；b＝引號內能吼出的話；c＝古代機／墟／骸片的光或聲被看見、聽見。a、b可並存。燈腹是物種，不是照明物件；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈每種全計畫核心最多一件。僅01的鳴崖碎燈夜獲配燈，其餘配額皆不使用；禁止擅自把背景小物升為核心。

格式照 lore README。每檔 id、name 由本節標題指定；summary 與關聯欄位值照規格，body 才由工人寫成全文。事件不加 gameRefs／aka；人物與地點可有 gameRefs。所有人物為 human，born 不明，不捏造出生年。地點 world earth；地方為既有城內設施或危險區外小據點，不增加新城邦、新裂縫。事件 body 用三至五個小節；地點沿用「地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼」。

### 1. `content/lore/characters/jo-marlow.json`「喬・馬洛」（提案）

id `character/jo-marlow`；類型 `characters`；類別 A。定位：人：喬在西雅圖裂座岸砲旁開機，喊「這回船頭朝家！」。 掛點：F；2106歸船斷座夜後果；底色1.4、1.12。

光與核心：`{"光":["a","b"],"核心":"喬在西雅圖裂座岸砲旁開機，喊「這回船頭朝家！」。","受限物件":[],"獸在世界裡":false,"物種":["species/tidewolf"],"戰鬥職":true,"招牌話":"這回船頭朝家！"}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/seattle.json`、`content/lore/places/seattle-outer-grain-quay.json`。

body 要點（依下列三至五句展開，不加新具名角色）：喬在歸船斷座夜之後接班，巡守時先看岸砲裂座，再看船能不能轉身。 站起來的瞬間是零星潮狼逼近卸糧處，她用堅盾-I型堵住側岸，吼「這回船頭朝家！」讓船員調頭。 她沒有擊倒折桅白冠，也不冒領既有命名夜；怕水的船工離岸前會向她揮手。

固定欄位值：
```json
{"born":"不明","faction":"faction/north-american-umbrella","role":"西雅圖守港駕駛","kind":"human","relations":[],"events":[],"aka":[],"tags":["人物","美洲"],"gameRefs":["base:species/tidewolf","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"喬在西雅圖裂座岸砲旁開機，喊「這回船頭朝家！」。"}
```

本文需自然連至：`place/seattle`、`place/seattle-outer-grain-quay`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：喬在西雅圖裂座岸砲旁開機，喊「這回船頭朝家！」。

### 2. `content/lore/characters/anne-bellerose.json`「安・貝勒羅斯」（提案）

id `character/anne-bellerose`；類型 `characters`；類別 A。定位：人：安在溫尼伯雪路上把護運機開回逆風處，喊「雪埋不了這一隊！」。 掛點：F／G；雪底留名後續；底色1.8。

光與核心：`{"光":["b"],"核心":"安在溫尼伯雪路上把護運機開回逆風處，喊「雪埋不了這一隊！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"雪埋不了這一隊！"}`。來源：`content/base/world/models/na-sled-03.json`、`content/base/frames/na-sled-03.json`、`content/lore/places/winnipeg.json`。

body 要點（依下列三至五句展開，不加新具名角色）：安駕既有NR-03護運，習慣讓落後的人看見機甲背影，而不是催他們追上。 站起來的瞬間是車隊在雪路掉頭，她開回逆風處推正陷車，吼「雪埋不了這一隊！」。 不重寫雪底留名，不另造姓名簿；內陸困境是雪與斷補給，沒有海獸翻山而來。

固定欄位值：
```json
{"born":"不明","faction":"faction/north-american-umbrella","role":"溫尼伯雪路護送駕駛","kind":"human","relations":[],"events":[],"aka":[],"tags":["人物","美洲"],"gameRefs":["base:frame/na-sled-03"],"visibility":"public","mech":"NR-03","summary":"安在溫尼伯雪路上把護運機開回逆風處，喊「雪埋不了這一隊！」。"}
```

本文需自然連至：`place/winnipeg`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：安在溫尼伯雪路上把護運機開回逆風處，喊「雪埋不了這一隊！」。

### 3. `content/lore/characters/luz-aranda.json`「露絲・阿蘭達」（提案）

id `character/luz-aranda`；類型 `characters`；類別 A。定位：人：露絲以機甲攔住哈瓦那近岸的獸，喊「港還沒閉眼！」。 掛點：G／F；空碗迎船後續；底色1.4、1.8。

光與核心：`{"光":["a","b"],"核心":"露絲以機甲攔住哈瓦那近岸的獸，喊「港還沒閉眼！」。","受限物件":[],"獸在世界裡":false,"物種":["species/tidewolf"],"戰鬥職":true,"招牌話":"港還沒閉眼！"}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/havana.json`。

body 要點（依下列三至五句展開，不加新具名角色）：空碗迎船之後露絲接手近岸護衛，平時會記住船工從哪邊看得見機甲的手勢。 站起來的瞬間是潮狼撞向卸貨口，她操堅盾-I型抵住牠，吼「港還沒閉眼！」讓最後一艘船靠岸。 不再把碗或照明物件當核心畫面，也不將這個小班的守岸功勞寫成加勒比全域復原。

固定欄位值：
```json
{"born":"不明","faction":"faction/latam-umbrella","role":"哈瓦那護岸駕駛","kind":"human","relations":[],"events":[],"aka":[],"tags":["人物","美洲"],"gameRefs":["base:species/tidewolf","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"露絲以機甲攔住哈瓦那近岸的獸，喊「港還沒閉眼！」。"}
```

本文需自然連至：`place/havana`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：露絲以機甲攔住哈瓦那近岸的獸，喊「港還沒閉眼！」。

### 4. `content/lore/characters/ines-vidal.json`「伊內絲・維達爾」（提案）

id `character/ines-vidal`；類型 `characters`；類別 A。定位：人：瓦港拘束手站上傷機的背，喊「還會咬，就還沒完！」。 掛點：F／B；借山空返、斷纜夜後果；底色1.12。

光與核心：`{"光":["a","b"],"核心":"瓦港拘束手站上傷機的背，喊「還會咬，就還沒完！」。","受限物件":[],"獸在世界裡":false,"物種":["species/hound"],"戰鬥職":true,"招牌話":"還會咬，就還沒完！"}`。來源：`content/base/species/hound.json`、`content/base/bodyplans/quadruped-hound.json`、`content/lore/places/valparaiso.json`。

body 要點（依下列三至五句展開，不加新具名角色）：伊內絲是瓦港岸隊拘束手，接應傷機時要先確認戰場上的獸還能不能回頭咬人。 站起來的瞬間是掘犬的前肢已傷仍撲向傷員，她站到機背引導拘束矢，吼「還會咬，就還沒完！」。 她不駕未登記新機，不以凡鐵鎖獸核；此為後續接應，不搶斷纜青鬣與借山空返的既有主場。

固定欄位值：
```json
{"born":"不明","faction":null,"role":"瓦爾帕萊索岸隊拘束手","kind":"human","relations":[],"events":[],"aka":[],"tags":["人物","美洲"],"gameRefs":["base:species/hound"],"visibility":"public","summary":"瓦港拘束手站上傷機的背，喊「還會咬，就還沒完！」。"}
```

本文需自然連至：`place/valparaiso`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：瓦港拘束手站上傷機的背，喊「還會咬，就還沒完！」。

### 5. `content/lore/characters/davi-moura.json`「達維・莫拉」（提案）

id `character/davi-moura`；類型 `characters`；類別 A。定位：人：達維守在貝倫近海河口，吼「這口飯，從我身後過！」。 掛點：G／F；底色1.4；貝倫既有河口生活。

光與核心：`{"光":["a","b"],"核心":"達維守在貝倫近海河口，吼「這口飯，從我身後過！」。","受限物件":[],"獸在世界裡":false,"物種":["species/tidewolf"],"戰鬥職":true,"招牌話":"這口飯，從我身後過！"}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/belem.json`。

body 要點（依下列三至五句展開，不加新具名角色）：達維只在河口近海一段值守，潮狼的前足從鹹水裡踏上卸貨岸，他以堅盾-I型迫牠偏開。 站起來的瞬間是糧船還來不及轉入內側，他把機甲留在獸與船之間，吼「這口飯，從我身後過！」。 獸源不推進內陸河網，回到岸上他才問有沒有人替他留晚飯；不變成糧商或城約代表。

固定欄位值：
```json
{"born":"不明","faction":"faction/latam-umbrella","role":"貝倫河口駕駛","kind":"human","relations":[],"events":[],"aka":[],"tags":["人物","美洲"],"gameRefs":["base:species/tidewolf","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"達維守在貝倫近海河口，吼「這口飯，從我身後過！」。"}
```

本文需自然連至：`place/belem`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：達維守在貝倫近海河口，吼「這口飯，從我身後過！」。

### 6. `content/lore/events/brasilia-salt-chorus.json`「高原回海聲」（提案）

id `event/brasilia-salt-chorus`；類型 `events`；類別 A。定位：人：巴西利亞的沿岸來客站到人群前，吼「我家的海，還在我嘴裡！」。 掛點：G／F；底色1.5、1.6；巴西退守內陸高原後果。

光與核心：`{"光":["b"],"核心":"巴西利亞的沿岸來客站到人群前，吼「我家的海，還在我嘴裡！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"我家的海，還在我嘴裡！"}`。來源：`content/lore/places/brasilia.json`。

body 要點（依下列三至五句展開，不加新具名角色）：一場普通的接待晚間，沿岸來客被問何必還唱海上的舊歌，有人終於站到人群前。 他吼「我家的海，還在我嘴裡！」，別人接著唱錯的半句，讓高原院落響起不整齊的回聲。 這是桑托斯失守與退居高原留下的人的後果，不是新宗派、代表大會或內陸獸災。

固定欄位值：
```json
{"date":"2107-05","period":"era/league","kind":"其他","factions":["faction/latam-umbrella"],"characters":[],"places":["place/brasilia"],"consequences":["巴西利亞接待院落裡有人接唱沿岸來客的舊歌。"],"tags":["地方史"],"visibility":"public","summary":"巴西利亞的沿岸來客站到人群前，吼「我家的海，還在我嘴裡！」。"}
```

本文需自然連至：`place/brasilia`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-05","title":"高原回海聲","summary":"巴西利亞的沿岸來客站到人群前，吼「我家的海，還在我嘴裡！」。","event":"event/brasilia-salt-chorus","era":"era/league","factions":["faction/latam-umbrella"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：巴西利亞的沿岸來客站到人群前，吼「我家的海，還在我嘴裡！」。

### 7. `content/lore/characters/mila-reed.json`「米拉・里德」（提案）

id `character/mila-reed`；類型 `characters`；類別 B。定位：人：米拉聽見白汊空橋折斷，轉身吼「別踩白色的地！」。 掛點：F；2107五湖白汊斷橋；底色1.4。

光與核心：`{"光":["a","b"],"核心":"米拉聽見白汊空橋折斷，轉身吼「別踩白色的地！」。","受限物件":[],"獸在世界裡":false,"物種":["species/drowned-grove"],"戰鬥職":false,"招牌話":"別踩白色的地！"}`。來源：`content/base/species/drowned-grove.json`、`content/base/bodyplans/mycel-drowned-grove.json`、`content/lore/places/five-lakes-white-ford.json`。

body 要點（依下列三至五句展開，不加新具名角色）：米拉是五湖採菌隊探路人，會先蹲下看菌絲的白與土色，再讓採收者前行。 站起來的瞬間是沉林撐斷空橋，白枝結露到水面，她回頭吼「別踩白色的地！」，帶後隊轉向乾岸。 她沒有獨自封住菌床，也不是掌握先民答案的人；她的本領是認出今天不該走的地方。

固定欄位值：
```json
{"born":"不明","faction":null,"role":"五湖採菌隊探路人","kind":"human","relations":[],"events":["event/white-ford-fallen-bridge"],"aka":[],"tags":["人物","美洲"],"gameRefs":["base:monster/drowned-grove-a","base:species/drowned-grove"],"visibility":"public","summary":"米拉聽見白汊空橋折斷，轉身吼「別踩白色的地！」。"}
```

本文需自然連至：`place/five-lakes-white-ford`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：米拉聽見白汊空橋折斷，轉身吼「別踩白色的地！」。

### 8. `content/lore/events/white-ford-fallen-bridge.json`「白汊斷橋夜」（提案）

id `event/white-ford-fallen-bridge`；類型 `events`；類別 B。定位：獸：沉林的白結撐斷空橋，採菌者沿乾岸撤退，將斷橋骸林叫進岸圖。 掛點：F；既有年表2107白汊空橋斷後另繫回程索。

光與核心：`{"光":["a","b"],"核心":"沉林的白結撐斷空橋，採菌者沿乾岸撤退，將斷橋骸林叫進岸圖。","受限物件":[],"獸在世界裡":false,"物種":["species/drowned-grove"],"戰鬥職":false,"招牌話":"斷橋骸林！"}`。來源：`content/base/species/drowned-grove.json`、`content/base/bodyplans/mycel-drowned-grove.json`、`content/lore/places/five-lakes-white-ford.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沿用2107既有同夜：白結沿舊橋墩抬起，沉林的白冠從斷木後露出，橋先折、人後撤。 米拉引隊離開白色地面，回程索只作既有撤離動作的一筆，不另開繫索畫面；當事人喊「斷橋骸林！」。 菌絲沿五湖淡水，核心未封、空橋不復原；原年表只補event，不能再造首見。

固定欄位值：
```json
{"date":"2107","period":"era/league","kind":"其他","factions":["faction/north-american-umbrella","faction/rift-beasts"],"characters":["character/mila-reed"],"places":["place/five-lakes-white-ford"],"consequences":["白汊採菌隊避開斷橋與白結相接的路段。"],"tags":["地方史","tide"],"visibility":"public","summary":"沉林的白結撐斷空橋，採菌者沿乾岸撤退，將斷橋骸林叫進岸圖。"}
```

本文需自然連至：`place/five-lakes-white-ford`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"處理":"既有條目補event，不進timeline-add","date":"2107","title":"白汊空橋斷後另繫回程索","定位快照":161,"event":"event/white-ford-fallen-bridge"}`。

插入需求（僅寫報告）：`[{"file":"content/lore/timeline.json","jsonPath":"$.entries[161]","op":"setKey","value":{"event":"event/white-ford-fallen-bridge"},"why":"既有同夜不重複加列；合併時以 date=2107、title=白汊空橋斷後另繫回程索 重定位，只在event缺鍵時新增，已有異值交領導裁定。"}]`。

review 白話：沉林的白結撐斷空橋，採菌者沿乾岸撤退，將斷橋骸林叫進岸圖。

### 9. `content/lore/places/white-ford-reed-crown.json`「白汊蘆冠岸」（提案）

id `place/white-ford-reed-crown`；類型 `places`；類別 B。定位：獸：白汊乾岸外的蘆網結成蒼白冠頂，採菌者看見白絲在淡水中接成一片。 掛點：F；2107斷橋後果；底色1.4。

光與核心：`{"光":["a"],"核心":"白汊乾岸外的蘆網結成蒼白冠頂，採菌者看見白絲在淡水中接成一片。","受限物件":[],"獸在世界裡":true,"物種":["species/reed-lace"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/reed-lace.json`、`content/base/bodyplans/mycel-reed-lace.json`、`content/lore/places/five-lakes-white-ford.json`。

body 要點（依下列三至五句展開，不加新具名角色）：在既有白汊警戒外的乾岸觀察，蘆網的上游結與下游結貼著淡水相接，蘆冠高過腐木。 採菌者把能踩的褐土指給新人看，白絲一旦連到岸邊便換地方，不伸手採亮處。 只寫C級蘆網沿淡水的可見擴張，無新核心、無新二名；米拉可在同批人物頁作入口。

固定欄位值：
```json
{"region":"北美・五湖白汊封鎖外乾岸","continent":"北美","world":"earth","kind":"其他","status2108":"乾岸可觀察；遇白絲接岸即撤離","factions":["faction/north-american-umbrella"],"aka":[],"tags":["地方","美洲"],"gameRefs":["base:species/reed-lace"],"visibility":"public","summary":"白汊乾岸外的蘆網結成蒼白冠頂，採菌者看見白絲在淡水中接成一片。"}
```

本文需自然連至：`place/five-lakes-white-ford`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/north-american-umbrella.json","jsonPath":"$.places","op":"append","value":"place/white-ford-reed-crown","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：白汊乾岸外的蘆網結成蒼白冠頂，採菌者看見白絲在淡水中接成一片。

### 10. `content/lore/characters/luc-morin.json`「呂克・莫蘭」（提案）

id `character/luc-morin`；類型 `characters`；類別 C。定位：人：刑天沉睡的裝甲映亮地下門口，呂克守住門檻，喊「到這裡，別再往下！」。 掛點：B；N08浦那後刑天移存蒙特婁；底色1.8。

光與核心：`{"光":["b","c"],"核心":"刑天沉睡的裝甲映亮地下門口，呂克守住門檻，喊「到這裡，別再往下！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"到這裡，別再往下！"}`。來源：`content/lore/places/montreal.json`。

body 要點（依下列三至五句展開，不加新具名角色）：呂克值守蒙特婁學會地下入口，換班時能看見刑天靜止裝甲裂紋裡的微光，映得人影比門更高。 站起來的瞬間是來訪者以為那是召喚，他跨到門檻前吼「到這裡，別再往下！」，保住被推擠的同行者。 刑天始終沉睡，微光不等於認主；國家城外崗沒有地下鑰匙，他也不替任何人解釋先民記憶。

固定欄位值：
```json
{"born":"不明","faction":"faction/shell-society","role":"蒙特婁地下入口夜班看守","kind":"human","relations":[{"character":"character/eugenia-ferrero","relation":"地方往來","note":"費雷羅來往地下時由他接衣引路，研究仍由她主持。"}],"events":[],"aka":[],"tags":["人物","美洲"],"gameRefs":[],"visibility":"public","summary":"刑天沉睡的裝甲映亮地下門口，呂克守住門檻，喊「到這裡，別再往下！」。"}
```

本文需自然連至：`place/montreal`、`character/eugenia-ferrero`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/eugenia-ferrero.json","jsonPath":"$.relations","op":"append","value":{"character":"character/luc-morin","relation":"地方往來","note":"費雷羅來往地下時由他接衣引路，研究仍由她主持。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：刑天沉睡的裝甲映亮地下門口，呂克守住門檻，喊「到這裡，別再往下！」。

### 11. `content/lore/places/titicaca-empty-dawn.json`「空寢向曙岸」（提案）

id `place/titicaca-empty-dawn`；類型 `places`；類別 C。定位：光：的的喀喀空寢床旁的刻痕在水下泛亮，引船老人讓訪客看完整片升日之形。 掛點：B；2092的的喀喀掘墟後果；底色1.9。

光與核心：`{"光":["c"],"核心":"的的喀喀空寢床旁的刻痕在水下泛亮，引船老人讓訪客看完整片升日之形。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/titicaca-ruin.json`。

body 要點（依下列三至五句展開，不加新具名角色）：岸在既有遺跡外，老人引船到能看見水下石階的位置，升日起形的刻痕隔水泛亮。 他不講神諭，只讓訪客看光沿空寢床邊緣落下，再把船轉回有人居住的岸。 維拉科查仍在基多，不回湖、不出洲；空床的光不代表另一台古代機或新認主。

固定欄位值：
```json
{"region":"南美・的的喀喀遺跡外湖岸","continent":"南美","world":"earth","kind":"其他","status2108":"有人照看，僅供短留","factions":["faction/quito"],"aka":[],"tags":["地方","美洲"],"gameRefs":[],"visibility":"public","summary":"的的喀喀空寢床旁的刻痕在水下泛亮，引船老人讓訪客看完整片升日之形。"}
```

本文需自然連至：`place/titicaca-ruin`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/quito.json","jsonPath":"$.places","op":"append","value":"place/titicaca-empty-dawn","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：的的喀喀空寢床旁的刻痕在水下泛亮，引船老人讓訪客看完整片升日之形。

### 既有檔的插入需求

本批不套用插入。把逐檔建議中的物件依原值寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/inserts.json`：wf-table/1，columns `['file','jsonPath','op','value','why']`；op 只有 append／setKey。新年表條目寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/timeline-add.json`：wf-table/1，columns `['date','title','summary','event','era','factions','tags']`。沒有資料也交空表。

年表「既有條目補event」只進 inserts，不重複進 timeline-add；索引為盤點快照，why 保留 date＋title，由合併線重新定位且只加缺少的鍵。possible 事件不進確定年表。跨批新引用只可提出插入需求，本批 content 不直接引用；本稿目前沒有跨批依賴。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree 開始前留基線，每寫完一檔及收尾跑；對照新增警告來源 |
| `npm run check` | 全部寫完跑一次，末行 OK 0 errors；不跑 npm test，領導收批時跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查索引與年表、寫報告資料表；timeline 用 load 後取 meta.entries 的唯讀視圖 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-05 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/`。只可新增本批清單與報告四檔，.git 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 rm -rf；不改 ~/.codex/config.toml；不安裝依賴；不碰 .gitignore；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親讀先讀清單，受相同範圍約束，REPORT 記使用情況。
- **分清錯誤來源**：點名工具本身壞掉、沙箱拒寫發 BLOCKED；自己打錯指令或暫存腳本出錯自己修。

## 工作

1. 讀先讀清單，記錄 lore check 基線，確認領導已準備隔離 worktree 與正式 manifest；上線發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-05 --up PROGRESS '已讀完先讀清單，開始寫 bf-deep-05' < /dev/null`。
2. 依逐檔規格寫檔；有同批互引時先建齊最小合法 JSON 再補 body，過程的尚未建立引用須於收尾清零。不修改原檔解決引用。
3. 跑下列固定檢查，寫四份報告資料。
4. 發終局回報；每完成一步讀 orders。

## 交付

REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/REPORT.md`（如檔名被擋則同目錄 report.md）。另交 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/review-rows.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/inserts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/timeline-add.json`。新增內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/`，清單如下：

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/jo-marlow.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/anne-bellerose.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/luz-aranda.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/ines-vidal.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/davi-moura.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/events/brasilia-salt-chorus.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/mila-reed.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/events/white-ford-fallen-bridge.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/places/white-ford-reed-crown.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/characters/luc-morin.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-05/content/lore/places/titicaca-empty-dawn.json`

review-rows 契約 wf-table/1，columns `['檔','類別','名稱','白話','掛到']`；11 列，檔為 repo 相對路徑、名稱加（提案）、白話 ≤60 字。REPORT 開頭逐行列已讀路徑，再四段「做了什麼」「產出」「沒做到或證據不足的」「需要決定的事」，末尾「以後交接書該點名的工具」。新名字、矛盾、年表待併警告逐項列出，不把它們隱藏成全庫已無警告。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree `node content/lore/check.ts` errors=0；新增警告只容許本批尚待合併年表之事件未列年表，白名單 ["event/brasilia-salt-chorus","event/white-ford-fallen-bridge"]，逐件在 REPORT 附來源與 timeline-add／inserts 對應，不容許其他新增警告。
2. worktree `npm run check` 末行含 OK 0 errors。
3. 固定 11 個新 content 檔存在，檔名=id name段；本線沒有改任何既有檔，差異範圍僅本批檔與報告（領導以 content_gate 驗）。
4. REPORT 有已讀清單；review-rows 合法、11 列、白話≤60字；inserts 與 timeline-add 合法且符合上述欄位，沒有直接寫入既有檔。

不要為了更保險加驗其他東西。上述年表警告是只新增與延後合併的已知結果，領導套用後再消除；不能先改 timeline 讓本批警告變少。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**：在授權檔內修到過，修不好發 FAILED 並寫證據。
- **測不出來**：指令未跑成或拿不到證據，不回滾，保持現狀發 BLOCKED，寫卡點與解除條件；不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-deep-05`；團隊 `teams/bigfill`；上游 lead-bigfill。上線先發 PROGRESS。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-05 --up DONE 'bf-deep-05 新增 11 件，lore check 0 錯，插入需求已列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-05/REPORT.md`。STATUS 與標題照實際結果換。

結束必發 DONE／BLOCKED／NEEDS-USER／FAILED 之一；卡住超過十分鐘先發 BLOCKED，不可無聲等候。回覆只要五行摘要加 REPORT 路徑。
