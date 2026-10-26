# 任務：在隔離 worktree 只新增 10 個 lore 檔，補深海上與殘聯（環太平洋）的人與畫面（batch bf-deep-06）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書摘要**；REPORT 開頭「已讀清單」，以下每個路徑原樣列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/base/bodyplans/alien-dusk-fold.json`、`content/base/bodyplans/alien-hollow-sail.json`、`content/base/bodyplans/beast-trench-maw.json`、`content/base/bodyplans/insect-brinepin.json`、`content/base/bodyplans/insect-lantern-keel.json`、`content/base/bodyplans/insect-needle-rack.json`、`content/base/bodyplans/insect-silt-mother.json`、`content/base/bodyplans/insect-sluice-mother.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/frames/bulwark-i.json`、`content/base/species/brinepin.json`、`content/base/species/dusk-fold.json`、`content/base/species/hollow-sail.json`、`content/base/species/lantern-keel.json`、`content/base/species/needle-rack.json`、`content/base/species/silt-mother.json`、`content/base/species/sluice-mother.json`、`content/base/species/tidewolf.json`、`content/base/species/trench-maw.json`、`content/base/world/models/bulwark-i.json`、`content/lore/eras/league.json`、`content/lore/eras/tide-line.json`、`content/lore/factions/league.json`、`content/lore/factions/sydney.json`、`content/lore/places/auckland-empty-berths.json`、`content/lore/places/auckland.json`、`content/lore/places/batangas-outer-sluices.json`、`content/lore/places/makassar.json`、`content/lore/places/uluru-heart.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-06.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`。相對路徑相對 worktree 根；本稿與共同規格從主 repo 唯讀。本輪必讀 deep-rulings.md；與第一輪計畫或其他規格衝突時，以該裁定為準。

## 背景與唯一目標

本批只完成下列 10 件（海上與殘聯（環太平洋））。既有基調修正已補過的二名夜、哀悼與制度不重演；用地方人物補深已有畫面。只新增 content 檔，所有年表與反向關聯改動寫成報告資料，領導最後合併。人物、事件與地點同批可直接互引，其他批新檔不得直接引用。

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

只新增下列逐檔規格列明的 10 個 content 檔，完整清單同交付的 manifest `files`。**不改任何既有檔**，包含年表、勢力、人物、地點、索引與 manifest。

不做：本批清單以外任何檔；不寫 content/base、src、test、specs、content/index、content/batches；wf 只准寫報告目錄；不寫月面、塞勒涅本部、萬潮葬王與吉大港北行；不刪檔、不 commit。筆記與臨時腳本放 `/tmp/cx-bf-deep-06/`。

件數 gate：content 新檔固定 10，修改既有檔固定 0；超出就停下回報。容量 gate：每件 body 300–1500 字；超過 1500 字先精簡，無法縮回則停下回報，不擴寫旁支。

## 逐檔規格

光代號：a＝獸有形體與動作；b＝引號內能吼出的話；c＝古代機／墟／骸片的光或聲被看見、聽見。a、b可並存。燈腹是物種，不是照明物件；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈每種全計畫核心最多一件。僅01的鳴崖碎燈夜獲配燈，其餘配額皆不使用；禁止擅自把背景小物升為核心。

格式照 lore README。每檔 id、name 由本節標題指定；summary 與關聯欄位值照規格，body 才由工人寫成全文。事件不加 gameRefs／aka；人物與地點可有 gameRefs。所有人物為 human，born 不明，不捏造出生年。地點 world earth；地方為既有城內設施或危險區外小據點，不增加新城邦、新裂縫。事件 body 用三至五個小節；地點沿用「地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼」。

### 1. `content/lore/characters/yani-saleh.json`「雅妮・薩利赫」（提案）

id `character/yani-saleh`；類型 `characters`；類別 A。定位：人：雅妮在望加錫開護航機守住船頭，吼「破船也有船頭！」。 掛點：G／F；底色1.4、1.8；環太平洋護航生活。

光與核心：`{"光":["a","b"],"核心":"雅妮在望加錫開護航機守住船頭，吼「破船也有船頭！」。","受限物件":[],"獸在世界裡":false,"物種":["species/tidewolf"],"戰鬥職":true,"招牌話":"破船也有船頭！"}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/makassar.json`。

body 要點（依下列三至五句展開，不加新具名角色）：雅妮替望加錫的小船護航，機甲甲縫補得難看，進艙前仍會先把同伴的名字叫一遍。 站起來的瞬間是潮狼貼近港邊，她讓堅盾-I型站穩乾岸船首一側，吼「破船也有船頭！」。 她只護到泊位，不追獸入海，不宣稱修好所有窮船；接糧長夜的原有功勞不重分。

固定欄位值：
```json
{"born":"不明","faction":null,"role":"望加錫護航駕駛","kind":"human","relations":[],"events":["event/makassar-spark-keel"],"aka":[],"tags":["人物","海上與殘聯（環太平洋）"],"gameRefs":["base:species/tidewolf","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"雅妮在望加錫開護航機守住船頭，吼「破船也有船頭！」。"}
```

本文需自然連至：`place/makassar`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：雅妮在望加錫開護航機守住船頭，吼「破船也有船頭！」。

### 2. `content/lore/events/makassar-mud-brood.json`「望加錫泥口」（提案）

id `event/makassar-mud-brood`；類型 `events`；類別 A。定位：獸：泥母在望加錫海灘張開單囊口，鹽針從泥背下湧出，修船者立刻停工。 掛點：E／G；底色1.8、1.12。

光與核心：`{"光":["a"],"核心":"泥母在望加錫海灘張開單囊口，鹽針從泥背下湧出，修船者立刻停工。","受限物件":[],"獸在世界裡":true,"物種":["species/silt-mother","species/brinepin"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/silt-mother.json`、`content/base/bodyplans/insect-silt-mother.json`、`content/base/species/brinepin.json`、`content/base/bodyplans/insect-brinepin.json`、`content/lore/places/makassar.json`。

body 要點（依下列三至五句展開，不加新具名角色）：B級泥母由近海泥灘上岸，單囊口吐出D級鹽針，細刺和泥背一起向修船棚前移。 不具名修船者放下工具跑回內岸，護航機守住乾地；泥母不是有戰術口令的母后。 只寫既有母子物種關係，不寫鹽針長大變泥母；本夜未清除獸群，外灘修船停工。

固定欄位值：
```json
{"date":"2107-04","period":"era/league","kind":"其他","factions":[],"characters":[],"places":["place/makassar"],"consequences":["望加錫海側修船棚暫停作業，人員退回內岸。"],"tags":["地方史","tide"],"visibility":"public","summary":"泥母在望加錫海灘張開單囊口，鹽針從泥背下湧出，修船者立刻停工。"}
```

本文需自然連至：`place/makassar`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-04","title":"望加錫泥口","summary":"泥母在望加錫海灘張開單囊口，鹽針從泥背下湧出，修船者立刻停工。","event":"event/makassar-mud-brood","era":"era/league","factions":[],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：泥母在望加錫海灘張開單囊口，鹽針從泥背下湧出，修船者立刻停工。

### 3. `content/lore/events/makassar-spark-keel.json`「船底再鳴」（提案）

id `event/makassar-spark-keel`；類型 `events`；類別 A。定位：光：望加錫破船的修造聲壓過風聲，雅妮帶頭吼「把這條船敲回海上！」。 掛點：E／G；底色1.4、1.8。

光與核心：`{"光":["b"],"核心":"望加錫破船的修造聲壓過風聲，雅妮帶頭吼「把這條船敲回海上！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"把這條船敲回海上！"}`。來源：`content/lore/places/makassar.json`。

body 要點（依下列三至五句展開，不加新具名角色）：護航後的小船在望加錫靠岸，船腹傷口一處接一處，修造者用鉚錘讓旁人知道自己還在裡面。 雅妮從機甲下來也拿起工具，帶頭吼「把這條船敲回海上！」，回港者跟著敲出亂拍。 船要修很久，這次吼聲不立新節慶、不重演接糧長夜，也不把乾衣或救援小物寫成主角。

固定欄位值：
```json
{"date":"2107-08","period":"era/league","kind":"其他","factions":[],"characters":["character/yani-saleh"],"places":["place/makassar"],"consequences":["護航船在望加錫停泊修復，船員一同參與修造。"],"tags":["地方史"],"visibility":"public","summary":"望加錫破船的修造聲壓過風聲，雅妮帶頭吼「把這條船敲回海上！」。"}
```

本文需自然連至：`place/makassar`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-08","title":"船底再鳴","summary":"望加錫破船的修造聲壓過風聲，雅妮帶頭吼「把這條船敲回海上！」。","event":"event/makassar-spark-keel","era":"era/league","factions":[],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：望加錫破船的修造聲壓過風聲，雅妮帶頭吼「把這條船敲回海上！」。

### 4. `content/lore/events/batangas-wing-rain.json`「八打雁翼雨」（提案）

id `event/batangas-wing-rain`；類型 `events`；類別 B。定位：獸：八打雁外閘上空，燈腹的亮囊排成低低一片，光滴落在舊閘輪上。 掛點：F／G；2104第三回閉港之後的海口目擊；底色1.4。

光與核心：`{"光":["a"],"核心":"八打雁外閘上空，燈腹的亮囊排成低低一片，光滴落在舊閘輪上。","受限物件":[],"獸在世界裡":true,"物種":["species/lantern-keel"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/lantern-keel.json`、`content/base/bodyplans/insect-lantern-keel.json`、`content/lore/places/batangas-outer-sluices.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沿八打雁通海渠看向海口，C級燈腹低飛，薄翼不斷遮住亮囊，落光使閘輪忽明忽暗。 搬運者看清飛群後停在內側拱道，沒有以肉食引開牠們，也不把牠們當信使。 這是2104閉港命名之後另一夜的低階獸目擊，不重命名閘母，不讓燈腹升階成閘母。

固定欄位值：
```json
{"date":"2107-11","period":"era/league","kind":"其他","factions":[],"characters":[],"places":["place/batangas-outer-sluices"],"consequences":["八打雁搬運隊在燈腹低飛時暫停通過外閘。"],"tags":["地方史","tide"],"visibility":"public","summary":"八打雁外閘上空，燈腹的亮囊排成低低一片，光滴落在舊閘輪上。"}
```

本文需自然連至：`place/batangas-outer-sluices`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-11","title":"八打雁翼雨","summary":"八打雁外閘上空，燈腹的亮囊排成低低一片，光滴落在舊閘輪上。","event":"event/batangas-wing-rain","era":"era/league","factions":[],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：八打雁外閘上空，燈腹的亮囊排成低低一片，光滴落在舊閘輪上。

### 5. `content/lore/events/batangas-third-closure.json`「第三回閉港」（提案）

id `event/batangas-third-closure`；類型 `events`；類別 B。定位：獸：閘母的囊閘堵住八打雁外渠，搬運者喊「閉港千扉！」，只守住內岸路。 掛點：F／G；2103井工錯班過閘的次年；底色1.4。

光與核心：`{"光":["a","b"],"核心":"閘母的囊閘堵住八打雁外渠，搬運者喊「閉港千扉！」，只守住內岸路。","受限物件":[],"獸在世界裡":false,"物種":["species/sluice-mother"],"戰鬥職":false,"招牌話":"閉港千扉！"}`。來源：`content/base/species/sluice-mother.json`、`content/base/bodyplans/insect-sluice-mother.json`、`content/lore/places/batangas-outer-sluices.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沿用2103井工錯班過閘的次年第三次堵港，2104閘母六柱足抵在海口，左右囊閘壓住外渠。 搬運者從冠節下的亮影裡看見一層又一層閉合的通路，喊「閉港千扉！」後先把井工接回。 本件只保住內岸路、不殺死A級個體；新年表2104一條，不覆蓋2103舊事。

固定欄位值：
```json
{"date":"2104","period":"era/tide-line","kind":"其他","factions":[],"characters":[],"places":["place/batangas-outer-sluices"],"consequences":["閉港千扉的二名留在輪守圖上，內岸繼續通行。"],"tags":["地方史","tide"],"visibility":"public","summary":"閘母的囊閘堵住八打雁外渠，搬運者喊「閉港千扉！」，只守住內岸路。"}
```

本文需自然連至：`place/batangas-outer-sluices`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2104","title":"第三回閉港","summary":"閘母的囊閘堵住八打雁外渠，搬運者喊「閉港千扉！」，只守住內岸路。","event":"event/batangas-third-closure","era":"era/tide-line","factions":[],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：閘母的囊閘堵住八打雁外渠，搬運者喊「閉港千扉！」，只守住內岸路。

### 6. `content/lore/places/batangas-needle-ledge.json`「八打雁懸矢檐」（提案）

id `place/batangas-needle-ledge`；類型 `places`；類別 B。定位：獸：八打雁海側的矢櫛伏在高檐，背矢架張開時，整條外岸先聽見刮響。 掛點：F／G；2104閉港後果；底色1.4。

光與核心：`{"光":["a"],"核心":"八打雁海側的矢櫛伏在高檐，背矢架張開時，整條外岸先聽見刮響。","受限物件":[],"獸在世界裡":true,"物種":["species/needle-rack"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/needle-rack.json`、`content/base/bodyplans/insect-needle-rack.json`、`content/lore/places/batangas-outer-sluices.json`。

body 要點（依下列三至五句展開，不加新具名角色）：檐是既有外閘海側廢樓的高處，B級矢櫛以伏足攀住，背矢架從長背甲上展開。 內側的巡看者先聽見硬片相刮，再看見外岸落矢，於是讓搬運隊貼著遮蔽處停下。 只觀測既有物種與棲位，不在檐上開新據點、不替B級獸取二名，內岸也不是永久安全區。

固定欄位值：
```json
{"region":"亞洲・八打雁通海渠內岸","continent":"亞洲","world":"earth","kind":"其他","status2108":"海側高檐有矢櫛出沒；內岸通行須觀察","factions":[],"aka":[],"tags":["地方","海上與殘聯（環太平洋）"],"gameRefs":["base:species/needle-rack"],"visibility":"public","summary":"八打雁海側的矢櫛伏在高檐，背矢架張開時，整條外岸先聽見刮響。"}
```

本文需自然連至：`place/batangas-outer-sluices`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：八打雁海側的矢櫛伏在高檐，背矢架張開時，整條外岸先聽見刮響。

### 7. `content/lore/events/auckland-hollow-overhead.json`「奧克蘭缺帆」（提案）

id `event/auckland-hollow-overhead`；類型 `events`；類別 B。定位：獸：奧克蘭回收隊抬頭看見空帆，半邊硬帆遮天，另半邊像被海風掏空。 掛點：F／E；2107覆幕之後辨別不同異形的地方後果；底色1.4。

光與核心：`{"光":["a"],"核心":"奧克蘭回收隊抬頭看見空帆，半邊硬帆遮天，另半邊像被海風掏空。","受限物件":[],"獸在世界裡":true,"物種":["species/hollow-sail"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/hollow-sail.json`、`content/base/bodyplans/alien-hollow-sail.json`、`content/lore/places/auckland-empty-berths.json`。

body 要點（依下列三至五句展開，不加新具名角色）：C級空帆由海面飄進奧克蘭空泊外側，一硬一空的兩帆高低錯開，長鬚垂在廢船上方。 回收隊先看清牠與垂幕不同的帆心核輪廓，再伏到遮蔽處等牠移出回船方向。 不把空帆與掩舟暮帷當同一隻，也不將牠人格化成替人巡港的訪客。

固定欄位值：
```json
{"date":"2107-12","period":"era/league","kind":"其他","factions":["faction/sydney"],"characters":[],"places":["place/auckland-empty-berths"],"consequences":["奧克蘭巡守增記空帆輪廓，與垂幕分開辨識。"],"tags":["地方史","tide"],"visibility":"public","summary":"奧克蘭回收隊抬頭看見空帆，半邊硬帆遮天，另半邊像被海風掏空。"}
```

本文需自然連至：`place/auckland-empty-berths`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-12","title":"奧克蘭缺帆","summary":"奧克蘭回收隊抬頭看見空帆，半邊硬帆遮天，另半邊像被海風掏空。","event":"event/auckland-hollow-overhead","era":"era/league","factions":["faction/sydney"],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：奧克蘭回收隊抬頭看見空帆，半邊硬帆遮天，另半邊像被海風掏空。

### 8. `content/lore/events/auckland-dusk-canopy.json`「舊船覆幕夜」（提案）

id `event/auckland-dusk-canopy`；類型 `events`；類別 B。定位：獸：垂幕的三處亮核升在空船旁，回收者把掩舟暮帷的名字帶回奧克蘭內泊。 掛點：F／E；既有年表2107舊船覆幕，內泊留燈。

光與核心：`{"光":["a","b"],"核心":"垂幕的三處亮核升在空船旁，回收者把掩舟暮帷的名字帶回奧克蘭內泊。","受限物件":[],"獸在世界裡":false,"物種":["species/dusk-fold"],"戰鬥職":false,"招牌話":"掩舟暮帷！"}`。來源：`content/base/species/dusk-fold.json`、`content/base/bodyplans/alien-dusk-fold.json`、`content/lore/places/auckland-empty-berths.json`、`content/lore/places/auckland.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沿用2107既有同夜，垂幕的低核、側核、高核錯落在海面上，硬幕整片壓住空船。 巡守先讓回收工沿岸退回，在最後一人應聲後喊「掩舟暮帷！」，將這道輪廓與群喉分開記。 外泊仍封、內泊繼續卸貨；既有年表只補event，不再造一次首見或宣稱獸已被清除。

固定欄位值：
```json
{"date":"2107","period":"era/league","kind":"其他","factions":["faction/sydney","faction/league"],"characters":[],"places":["place/auckland-empty-berths","place/auckland"],"consequences":["外泊停止回收作業。","內泊保留逐一收回答聲的交班做法。"],"tags":["地方史","tide"],"visibility":"public","summary":"垂幕的三處亮核升在空船旁，回收者把掩舟暮帷的名字帶回奧克蘭內泊。"}
```

本文需自然連至：`place/auckland-empty-berths`、`place/auckland`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"處理":"既有條目補event，不進timeline-add","date":"2107","title":"舊船覆幕，內泊留燈","定位快照":160,"event":"event/auckland-dusk-canopy"}`。

插入需求（僅寫報告）：`[{"file":"content/lore/timeline.json","jsonPath":"$.entries[160]","op":"setKey","value":{"event":"event/auckland-dusk-canopy"},"why":"既有同夜不重複加列；合併時以 date=2107、title=舊船覆幕，內泊留燈 重定位，只在event缺鍵時新增，已有異值交領導裁定。"}]`。

review 白話：垂幕的三處亮核升在空船旁，回收者把掩舟暮帷的名字帶回奧克蘭內泊。

### 9. `content/lore/places/auckland-maw-shelf.json`「奧克蘭顎影岸」（提案）

id `place/auckland-maw-shelf`；類型 `places`；類別 B。定位：獸：奧克蘭外泊岸下，淵顎的溝甲先露出水面，深處張口才讓人看見牠有多大。 掛點：F／E；2106無人應答、2107覆幕的相接後果。

光與核心：`{"光":["a"],"核心":"奧克蘭外泊岸下，淵顎的溝甲先露出水面，深處張口才讓人看見牠有多大。","受限物件":[],"獸在世界裡":true,"物種":["species/trench-maw"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/trench-maw.json`、`content/base/bodyplans/beast-trench-maw.json`、`content/lore/places/auckland-empty-berths.json`。

body 要點（依下列三至五句展開，不加新具名角色）：從既有外泊的陸側觀察，B級淵顎先露溝甲，再沿破船下方張口，水面像忽然缺掉一塊。 岸隊站在乾地看牠的前足攀住殘骸，回收者停止下岸；若要交戰只能從岸上打。 本處不設水下據點、無馴養或新二名，也不改變奧克蘭內泊可用的既有狀態。

固定欄位值：
```json
{"region":"大洋洲・奧克蘭內泊卸貨處","continent":"大洋洲","world":"earth","kind":"其他","status2108":"外泊陸側可遠觀；淵顎出沒時停止靠近殘骸","factions":["faction/sydney","faction/league"],"aka":[],"tags":["地方","海上與殘聯（環太平洋）"],"gameRefs":["base:species/trench-maw"],"visibility":"public","summary":"奧克蘭外泊岸下，淵顎的溝甲先露出水面，深處張口才讓人看見牠有多大。"}
```

本文需自然連至：`place/auckland-empty-berths`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/sydney.json","jsonPath":"$.places","op":"append","value":"place/auckland-maw-shelf","why":"只增加地點導航，不賦予古代機所有權。"},{"file":"content/lore/factions/league.json","jsonPath":"$.places","op":"append","value":"place/auckland-maw-shelf","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：奧克蘭外泊岸下，淵顎的溝甲先露出水面，深處張口才讓人看見牠有多大。

### 10. `content/lore/characters/mara-keene.json`「瑪拉・基恩」（提案）

id `character/mara-keene`；類型 `characters`；類別 C。定位：人：瑪拉看著紅心露脊由紅轉綠，站到來客前喊「看見，不等於拿走！」。 掛點：B；2105烏魯魯對峙、2107南天守土後果；底色1.9。

光與核心：`{"光":["b","c"],"核心":"瑪拉看著紅心露脊由紅轉綠，站到來客前喊「看見，不等於拿走！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"看見，不等於拿走！"}`。來源：`content/lore/places/uluru-heart.json`。

body 要點（依下列三至五句展開，不加新具名角色）：紅心既有露脊在月光下由紅轉紫、再轉成難以命名的綠，瑪拉陪來客在外圈看完整段變色。 站起來的瞬間是有人以為看見光便能越界，她擋到前面吼「看見，不等於拿走！」，不替在地信仰創造儀式。 露脊屬彩虹蛇仍是傳聞，紅心未開、脊不新增動作；她不帶人偷挖，也不許帶走殘片。

固定欄位值：
```json
{"born":"不明","faction":"faction/sydney","role":"紅心外圈引路人","kind":"human","relations":[],"events":[],"aka":[],"tags":["人物","海上與殘聯（環太平洋）"],"gameRefs":[],"visibility":"public","summary":"瑪拉看著紅心露脊由紅轉綠，站到來客前喊「看見，不等於拿走！」。","secrets":[{"visibility":"rumor","text":"來客沿用學會的說法，把紅心變色的露脊稱作彩虹蛇的背；本體未經開挖證實。"}]}
```

本文需自然連至：`place/uluru-heart`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public為既有露脊變色；露脊屬彩虹蛇的解釋維持rumor，不補真身或新動作。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：瑪拉看著紅心露脊由紅轉綠，站到來客前喊「看見，不等於拿走！」。

### 既有檔的插入需求

本批不套用插入。把逐檔建議中的物件依原值寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/inserts.json`：wf-table/1，columns `['file','jsonPath','op','value','why']`；op 只有 append／setKey。新年表條目寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/timeline-add.json`：wf-table/1，columns `['date','title','summary','event','era','factions','tags']`。沒有資料也交空表。

年表「既有條目補event」只進 inserts，不重複進 timeline-add；索引為盤點快照，why 保留 date＋title，由合併線重新定位且只加缺少的鍵。possible 事件不進確定年表。跨批新引用只可提出插入需求，本批 content 不直接引用；本稿目前沒有跨批依賴。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree 開始前留基線，每寫完一檔及收尾跑；對照新增警告來源 |
| `npm run check` | 全部寫完跑一次，末行 OK 0 errors；不跑 npm test，領導收批時跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查索引與年表、寫報告資料表；timeline 用 load 後取 meta.entries 的唯讀視圖 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-06 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/`。只可新增本批清單與報告四檔，.git 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 rm -rf；不改 ~/.codex/config.toml；不安裝依賴；不碰 .gitignore；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親讀先讀清單，受相同範圍約束，REPORT 記使用情況。
- **分清錯誤來源**：點名工具本身壞掉、沙箱拒寫發 BLOCKED；自己打錯指令或暫存腳本出錯自己修。

## 工作

1. 讀先讀清單，記錄 lore check 基線，確認領導已準備隔離 worktree 與正式 manifest；上線發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-06 --up PROGRESS '已讀完先讀清單，開始寫 bf-deep-06' < /dev/null`。
2. 依逐檔規格寫檔；有同批互引時先建齊最小合法 JSON 再補 body，過程的尚未建立引用須於收尾清零。不修改原檔解決引用。
3. 跑下列固定檢查，寫四份報告資料。
4. 發終局回報；每完成一步讀 orders。

## 交付

REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/REPORT.md`（如檔名被擋則同目錄 report.md）。另交 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/review-rows.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/inserts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/timeline-add.json`。新增內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/`，清單如下：

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/characters/yani-saleh.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/events/makassar-mud-brood.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/events/makassar-spark-keel.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/events/batangas-wing-rain.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/events/batangas-third-closure.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/places/batangas-needle-ledge.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/events/auckland-hollow-overhead.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/events/auckland-dusk-canopy.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/places/auckland-maw-shelf.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-06/content/lore/characters/mara-keene.json`

review-rows 契約 wf-table/1，columns `['檔','類別','名稱','白話','掛到']`；10 列，檔為 repo 相對路徑、名稱加（提案）、白話 ≤60 字。REPORT 開頭逐行列已讀路徑，再四段「做了什麼」「產出」「沒做到或證據不足的」「需要決定的事」，末尾「以後交接書該點名的工具」。新名字、矛盾、年表待併警告逐項列出，不把它們隱藏成全庫已無警告。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree `node content/lore/check.ts` errors=0；新增警告只容許本批尚待合併年表之事件未列年表，白名單 ["event/makassar-mud-brood","event/makassar-spark-keel","event/batangas-wing-rain","event/batangas-third-closure","event/auckland-hollow-overhead","event/auckland-dusk-canopy"]，逐件在 REPORT 附來源與 timeline-add／inserts 對應，不容許其他新增警告。
2. worktree `npm run check` 末行含 OK 0 errors。
3. 固定 10 個新 content 檔存在，檔名=id name段；本線沒有改任何既有檔，差異範圍僅本批檔與報告（領導以 content_gate 驗）。
4. REPORT 有已讀清單；review-rows 合法、10 列、白話≤60字；inserts 與 timeline-add 合法且符合上述欄位，沒有直接寫入既有檔。

不要為了更保險加驗其他東西。上述年表警告是只新增與延後合併的已知結果，領導套用後再消除；不能先改 timeline 讓本批警告變少。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**：在授權檔內修到過，修不好發 FAILED 並寫證據。
- **測不出來**：指令未跑成或拿不到證據，不回滾，保持現狀發 BLOCKED，寫卡點與解除條件；不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-deep-06`；團隊 `teams/bigfill`；上游 lead-bigfill。上線先發 PROGRESS。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-06 --up DONE 'bf-deep-06 新增 10 件，lore check 0 錯，插入需求已列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-06/REPORT.md`。STATUS 與標題照實際結果換。

結束必發 DONE／BLOCKED／NEEDS-USER／FAILED 之一；卡住超過十分鐘先發 BLOCKED，不可無聲等候。回覆只要五行摘要加 REPORT 路徑。
