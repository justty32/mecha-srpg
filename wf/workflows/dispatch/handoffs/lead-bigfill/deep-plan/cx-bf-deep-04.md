# 任務：在隔離 worktree 只新增 10 個 lore 檔，補深非洲／西亞的人與畫面（batch bf-deep-04）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書摘要**；REPORT 開頭「已讀清單」，以下每個路徑原樣列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/base/bodyplans/alien-hollow-sail.json`、`content/base/bodyplans/alien-paired-wake.json`、`content/base/frames/bulwark-i.json`、`content/base/species/hollow-sail.json`、`content/base/species/paired-wake.json`、`content/base/world/models/bulwark-i.json`、`content/lore/characters/wanjiku-kamau.json`、`content/lore/eras/league.json`、`content/lore/factions/accra.json`、`content/lore/factions/nairobi.json`、`content/lore/factions/north-africa-umbrella.json`、`content/lore/factions/west-asia-umbrella.json`、`content/lore/places/accra.json`、`content/lore/places/aswan.json`、`content/lore/places/djibouti.json`、`content/lore/places/dubai.json`、`content/lore/places/rift-valley-seat.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-04.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`。相對路徑相對 worktree 根；本稿與共同規格從主 repo 唯讀。本輪必讀 deep-rulings.md；與第一輪計畫或其他規格衝突時，以該裁定為準。

## 背景與唯一目標

本批只完成下列 10 件（非洲／西亞）。既有基調修正已補過的二名夜、哀悼與制度不重演；用地方人物補深已有畫面。只新增 content 檔，所有年表與反向關聯改動寫成報告資料，領導最後合併。人物、事件與地點同批可直接互引，其他批新檔不得直接引用。

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

不做：本批清單以外任何檔；不寫 content/base、src、test、specs、content/index、content/batches；wf 只准寫報告目錄；不寫月面、塞勒涅本部、萬潮葬王與吉大港北行；不刪檔、不 commit。筆記與臨時腳本放 `/tmp/cx-bf-deep-04/`。

件數 gate：content 新檔固定 10，修改既有檔固定 0；超出就停下回報。容量 gate：每件 body 300–1500 字；超過 1500 字先精簡，無法縮回則停下回報，不擴寫旁支。

## 逐檔規格

光代號：a＝獸有形體與動作；b＝引號內能吼出的話；c＝古代機／墟／骸片的光或聲被看見、聽見。a、b可並存。燈腹是物種，不是照明物件；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈每種全計畫核心最多一件。僅01的鳴崖碎燈夜獲配燈，其餘配額皆不使用；禁止擅自把背景小物升為核心。

格式照 lore README。每檔 id、name 由本節標題指定；summary 與關聯欄位值照規格，body 才由工人寫成全文。事件不加 gameRefs／aka；人物與地點可有 gameRefs。所有人物為 human，born 不明，不捏造出生年。地點 world earth；地方為既有城內設施或危險區外小據點，不增加新城邦、新裂縫。事件 body 用三至五個小節；地點沿用「地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼」。

### 1. `content/lore/characters/esi-ampofo.json`「埃西・安波福」（提案）

id `character/esi-ampofo`；類型 `characters`；類別 A。定位：人：埃西把阿克拉門外的人護在機腹後，喊「退進來，別替我死！」。 掛點：F；2107阿克拉留門之戰後果；底色1.8、1.11。

光與核心：`{"光":["b"],"核心":"埃西把阿克拉門外的人護在機腹後，喊「退進來，別替我死！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"退進來，別替我死！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/accra.json`。

body 要點（依下列三至五句展開，不加新具名角色）：埃西是留門之戰後守城的普通民兵，會把走不動的人先安置在堅盾-I型機腹後側。 站起來的瞬間是同伴還要出門替她擋矢，她吼「退進來，別替我死！」後獨自把機甲橫在缺口。 本段回憶不替既有戰役換主將，守住後她仍要出艙面對發抖的人。

固定欄位值：
```json
{"born":"不明","faction":"faction/accra","role":"阿克拉民兵駕駛","kind":"human","relations":[],"events":["event/accra-open-throat"],"aka":[],"tags":["人物","非洲／西亞"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"埃西把阿克拉門外的人護在機腹後，喊「退進來，別替我死！」。"}
```

本文需自然連至：`place/accra`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：埃西把阿克拉門外的人護在機腹後，喊「退進來，別替我死！」。

### 2. `content/lore/events/accra-open-throat.json`「城門放聲」（提案）

id `event/accra-open-throat`；類型 `events`；類別 A。定位：光：阿克拉孩子不敢穿過門影，民兵把「回家的人不用低頭！」吼過整條街。 掛點：F；2107留門之戰後續；底色1.11。

光與核心：`{"光":["b"],"核心":"阿克拉孩子不敢穿過門影，民兵把「回家的人不用低頭！」吼過整條街。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"回家的人不用低頭！"}`。來源：`content/lore/places/accra.json`。

body 要點（依下列三至五句展開，不加新具名角色）：留門之戰後的一次返城，孩子停在門影前，埃西先把堅盾-I型轉開，讓天空露出來。 守門民兵吼「回家的人不用低頭！」，人群各讓一步，孩子自己走過去而不是被扛過去。 同一句豪語不替所有人消除恐懼，門外仍有人等親屬；不寫新的勝仗。

固定欄位值：
```json
{"date":"2107-12","period":"era/league","kind":"其他","factions":["faction/accra"],"characters":["character/esi-ampofo"],"places":["place/accra"],"consequences":["阿克拉返城隊學會在機甲旁留下看得到天空的通道。"],"tags":["地方史"],"visibility":"public","summary":"阿克拉孩子不敢穿過門影，民兵把「回家的人不用低頭！」吼過整條街。"}
```

本文需自然連至：`place/accra`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-12","title":"城門放聲","summary":"阿克拉孩子不敢穿過門影，民兵把「回家的人不用低頭！」吼過整條街。","event":"event/accra-open-throat","era":"era/league","factions":["faction/accra"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：阿克拉孩子不敢穿過門影，民兵把「回家的人不用低頭！」吼過整條街。

### 3. `content/lore/characters/aden-hersi.json`「阿登・赫爾西」（提案）

id `character/aden-hersi`；類型 `characters`；類別 A。定位：人：阿登聽見破船裡還有人，將機掌壓進船腹，喊「海別想替你收聲！」。 掛點：G／F；運河夜後護航輪值；底色1.4、1.12。

光與核心：`{"光":["b"],"核心":"阿登聽見破船裡還有人，將機掌壓進船腹，喊「海別想替你收聲！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"海別想替你收聲！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/djibouti.json`。

body 要點（依下列三至五句展開，不加新具名角色）：阿登在吉布地岸上駕堅盾-I型救援，最怕的不是受傷，而是聽錯最後一聲喊。 站起來的瞬間是船腹將合攏，他從岸上撐開裂口，吼「海別想替你收聲！」，給裡面的人多一次答聲機會。 他沒有讓機甲下深海，也不追問被救者的來路，換班後才請同伴替自己止住發抖。

固定欄位值：
```json
{"born":"不明","faction":null,"role":"吉布地岸上救援駕駛","kind":"human","relations":[],"events":["event/djibouti-crossed-shadows"],"aka":[],"tags":["人物","非洲／西亞"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"阿登聽見破船裡還有人，將機掌壓進船腹，喊「海別想替你收聲！」。"}
```

本文需自然連至：`place/djibouti`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：阿登聽見破船裡還有人，將機掌壓進船腹，喊「海別想替你收聲！」。

### 4. `content/lore/events/djibouti-crossed-shadows.json`「吉布地錯影」（提案）

id `event/djibouti-crossed-shadows`；類型 `events`；類別 A。定位：獸：雙影的厚臂先出海，裸核卻從另一邊亮起，岸上人把兩個輪廓認成一隻。 掛點：G／F；運河夜輪值後果；底色1.4。

光與核心：`{"光":["a"],"核心":"雙影的厚臂先出海，裸核卻從另一邊亮起，岸上人把兩個輪廓認成一隻。","受限物件":[],"獸在世界裡":true,"物種":["species/paired-wake"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/paired-wake.json`、`content/base/bodyplans/alien-paired-wake.json`、`content/lore/places/djibouti.json`。

body 要點（依下列三至五句展開，不加新具名角色）：B級雙影從近岸浮起，左披核與右裸核高低錯落，厚臂遮住細臂，把兩道影子投在破船兩側。 阿登以堅盾-I型護住岸邊落水者，觀察員看清共束足後才喊停錯誤的兩獸警報。 只讓人撤回岸上，怪獸不對話、不被嚇退；雙影是物種名，不新增二名。

固定欄位值：
```json
{"date":"2107-07","period":"era/league","kind":"其他","factions":[],"characters":["character/aden-hersi"],"places":["place/djibouti"],"consequences":["吉布地輪守者在這次接應後留下雙影的雙核輪廓圖。"],"tags":["地方史","tide"],"visibility":"public","summary":"雙影的厚臂先出海，裸核卻從另一邊亮起，岸上人把兩個輪廓認成一隻。"}
```

本文需自然連至：`place/djibouti`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-07","title":"吉布地錯影","summary":"雙影的厚臂先出海，裸核卻從另一邊亮起，岸上人把兩個輪廓認成一隻。","event":"event/djibouti-crossed-shadows","era":"era/league","factions":[],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：雙影的厚臂先出海，裸核卻從另一邊亮起，岸上人把兩個輪廓認成一隻。

### 5. `content/lore/events/aswan-stone-singing.json`「亞斯文石聲」（提案）

id `event/aswan-stone-singing`；類型 `events`；類別 A。定位：光：亞斯文搬石工喊「把河留給後人！」，機甲踏著號子把護岸石送回缺口。 掛點：G／C；放閘夜後果；底色1.4。

光與核心：`{"光":["b"],"核心":"亞斯文搬石工喊「把河留給後人！」，機甲踏著號子把護岸石送回缺口。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"把河留給後人！"}`。來源：`content/lore/places/aswan.json`。

body 要點（依下列三至五句展開，不加新具名角色）：在沒有獸襲的一天，不具名護岸駕駛操堅盾-I型，與工人一同把舊石推回河岸缺口。 搬石工喊「把河留給後人！」，號子沿石面傳到遠處，老人想起昔日放閘夜的人聲。 只寫放閘夜之後護岸者的生活，不把普通河水寫成能殺獸，也不追加內陸裂縫。

固定欄位值：
```json
{"date":"2107-02","period":"era/league","kind":"其他","factions":["faction/north-africa-umbrella"],"characters":[],"places":["place/aswan"],"consequences":["護岸工在亞斯文把鬆動石塊送回岸線缺口。"],"tags":["地方史"],"visibility":"public","summary":"亞斯文搬石工喊「把河留給後人！」，機甲踏著號子把護岸石送回缺口。"}
```

本文需自然連至：`place/aswan`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-02","title":"亞斯文石聲","summary":"亞斯文搬石工喊「把河留給後人！」，機甲踏著號子把護岸石送回缺口。","event":"event/aswan-stone-singing","era":"era/league","factions":["faction/north-africa-umbrella"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：亞斯文搬石工喊「把河留給後人！」，機甲踏著號子把護岸石送回缺口。

### 6. `content/lore/events/aswan-hand-above-water.json`「河上托掌」（提案）

id `event/aswan-hand-above-water`；類型 `events`；類別 A。定位：光：亞斯文岸邊滑塌，護運駕駛舉起整片機掌，喊「站住，我在下面！」。 掛點：G／C；底色1.4；放閘夜生活後續。

光與核心：`{"光":["b"],"核心":"亞斯文岸邊滑塌，護運駕駛舉起整片機掌，喊「站住，我在下面！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"站住，我在下面！"}`。來源：`content/lore/places/aswan.json`。

body 要點（依下列三至五句展開，不加新具名角色）：護運隊過岸時舊石面滑塌，一位不具名駕駛用堅盾-I型機掌承住跌落工人。 他吼「站住，我在下面！」，工人自己找回平衡，岸上同伴把重物一件件卸開。 事故止於內陸護運，無獸災、無異能，損壞的石面翌日仍要修。

固定欄位值：
```json
{"date":"2107-04","period":"era/league","kind":"其他","factions":["faction/north-africa-umbrella"],"characters":[],"places":["place/aswan"],"consequences":["亞斯文護運隊暫停通過鬆動石岸，先修好卸貨立足處。"],"tags":["地方史"],"visibility":"public","summary":"亞斯文岸邊滑塌，護運駕駛舉起整片機掌，喊「站住，我在下面！」。"}
```

本文需自然連至：`place/aswan`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-04","title":"河上托掌","summary":"亞斯文岸邊滑塌，護運駕駛舉起整片機掌，喊「站住，我在下面！」。","event":"event/aswan-hand-above-water","era":"era/league","factions":["faction/north-africa-umbrella"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：亞斯文岸邊滑塌，護運駕駛舉起整片機掌，喊「站住，我在下面！」。

### 7. `content/lore/events/dubai-tidal-visor.json`「杜拜浪面」（提案）

id `event/dubai-tidal-visor`；類型 `events`；類別 A。定位：獸：杜拜海側空樓前，空帆一硬一空的翼影把沙地切成明暗兩半。 掛點：F／G；底色1.5。

光與核心：`{"光":["a"],"核心":"杜拜海側空樓前，空帆一硬一空的翼影把沙地切成明暗兩半。","受限物件":[],"獸在世界裡":true,"物種":["species/hollow-sail"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/hollow-sail.json`、`content/base/bodyplans/alien-hollow-sail.json`、`content/lore/places/dubai.json`。

body 要點（依下列三至五句展開，不加新具名角色）：C級空帆從海側掠過杜拜空樓，右硬帆遮住天色，左空帆漏出一片碎亮，長鬚垂向沙地。 不具名回收隊靠牆伏下，直到牠離開外岸才背起失散同伴，不向牠喊話。 空城仍是斷鏈後棄置之城，不因此改成新蝕域核心，獸源只落在海側。

固定欄位值：
```json
{"date":"2107-06","period":"era/league","kind":"其他","factions":["faction/west-asia-umbrella"],"characters":[],"places":["place/dubai"],"consequences":["杜拜回收隊停止通過空帆仍在盤旋的外岸。"],"tags":["地方史","tide"],"visibility":"public","summary":"杜拜海側空樓前，空帆一硬一空的翼影把沙地切成明暗兩半。"}
```

本文需自然連至：`place/dubai`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-06","title":"杜拜浪面","summary":"杜拜海側空樓前，空帆一硬一空的翼影把沙地切成明暗兩半。","event":"event/dubai-tidal-visor","era":"era/league","factions":["faction/west-asia-umbrella"],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：杜拜海側空樓前，空帆一硬一空的翼影把沙地切成明暗兩半。

### 8. `content/lore/events/dubai-last-shadow.json`「最後一片門影」（提案）

id `event/dubai-last-shadow`；類型 `events`；類別 A。定位：光：杜拜回收隊將機甲留在最後一片門影，吼「空城也要帶人回去！」。 掛點：F／G；底色1.5、1.12。

光與核心：`{"光":["b"],"核心":"杜拜回收隊將機甲留在最後一片門影，吼「空城也要帶人回去！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"空城也要帶人回去！"}`。來源：`content/lore/places/dubai.json`。

body 要點（依下列三至五句展開，不加新具名角色）：午後空街有人失散，不具名接應駕駛將堅盾-I型立在能遮住集合處的一段門影前。 回收者還在猶豫要不要折返，他吼「空城也要帶人回去！」，帶最後一隊穿過日曬的路面。 結尾保留空城的空，不新增定居或清剿結果；不用本件再重畫空帆的同一幕。

固定欄位值：
```json
{"date":"2107-10","period":"era/league","kind":"其他","factions":["faction/west-asia-umbrella"],"characters":[],"places":["place/dubai"],"consequences":["杜拜回收隊留下最後集合處的門影位置。"],"tags":["地方史"],"visibility":"public","summary":"杜拜回收隊將機甲留在最後一片門影，吼「空城也要帶人回去！」。"}
```

本文需自然連至：`place/dubai`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-10","title":"最後一片門影","summary":"杜拜回收隊將機甲留在最後一片門影，吼「空城也要帶人回去！」。","event":"event/dubai-last-shadow","era":"era/league","factions":["faction/west-asia-umbrella"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：杜拜回收隊將機甲留在最後一片門影，吼「空城也要帶人回去！」。

### 9. `content/lore/characters/nali-otieno.json`「娜莉・奧蒂諾」（提案）

id `character/nali-otieno`；類型 `characters`；類別 C。定位：人：娜莉看見孩子手裡的骸片亮起，仍喊「先放下，先活著！」。 掛點：B；2094大裂谷掘墟後果；底色1.9。

光與核心：`{"光":["b","c"],"核心":"娜莉看見孩子手裡的骸片亮起，仍喊「先放下，先活著！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"先放下，先活著！"}`。來源：`content/lore/places/rift-valley-seat.json`。

body 要點（依下列三至五句展開，不加新具名角色）：孩子拾起恩凱之座外原地碎片，斷面光沿掌紋爬開，娜莉看見血與光混在一起。 站起來的瞬間是旁人只想看異象，她吼「先放下，先活著！」，把孩子帶離碎片讓巡看者接手。 骸片並非從恩凱身上切下，她不帶走、不交易；恩凱未認主，研究判斷仍留給萬吉庫。

固定欄位值：
```json
{"born":"不明","faction":"faction/nairobi","role":"恩凱之座外的護送人","kind":"human","relations":[{"character":"character/wanjiku-kamau","relation":"地方往來","note":"替來往遺址的人護送傷者，研究內容仍由萬吉庫自行判斷。"}],"events":[],"aka":[],"tags":["人物","非洲／西亞"],"gameRefs":[],"visibility":"public","summary":"娜莉看見孩子手裡的骸片亮起，仍喊「先放下，先活著！」。"}
```

本文需自然連至：`place/rift-valley-seat`、`character/wanjiku-kamau`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/wanjiku-kamau.json","jsonPath":"$.relations","op":"append","value":{"character":"character/nali-otieno","relation":"地方往來","note":"替來往遺址的人護送傷者，研究內容仍由萬吉庫自行判斷。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：娜莉看見孩子手裡的骸片亮起，仍喊「先放下，先活著！」。

### 10. `content/lore/places/rift-valley-bone-echo.json`「座外骨鳴崗」（提案）

id `place/rift-valley-bone-echo`；類型 `places`；類別 C。定位：光：恩凱骨縫裡的長鳴穿過崖崗，來朝訪的人終於抬頭看見那排巨骨。 掛點：B；2094掘墟後果；底色1.9。

光與核心：`{"光":["c"],"核心":"恩凱骨縫裡的長鳴穿過崖崗，來朝訪的人終於抬頭看見那排巨骨。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/rift-valley-seat.json`。

body 要點（依下列三至五句展開，不加新具名角色）：崗在恩凱之座外緣，沿既有地貌寫風穿骨縫的低響，不將其改成古代機說話。 來客原本看著腳下灰土，聲音掠過時一同抬頭，看見不成比例的獸身與軛形巨骨。 娜莉只在崗上指路；聲音不宣布認主，恩凱不動，也沒有骸片交易攤。

固定欄位值：
```json
{"region":"非洲・東非大裂谷恩凱之座外緣","continent":"非洲","world":"earth","kind":"其他","status2108":"谷口外可短留；可聽風穿骨縫，古代機仍未認主","factions":["faction/nairobi"],"aka":[],"tags":["地方","非洲／西亞"],"gameRefs":[],"visibility":"public","summary":"恩凱骨縫裡的長鳴穿過崖崗，來朝訪的人終於抬頭看見那排巨骨。"}
```

本文需自然連至：`place/rift-valley-seat`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/nairobi.json","jsonPath":"$.places","op":"append","value":"place/rift-valley-bone-echo","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：恩凱骨縫裡的長鳴穿過崖崗，來朝訪的人終於抬頭看見那排巨骨。

### 既有檔的插入需求

本批不套用插入。把逐檔建議中的物件依原值寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/inserts.json`：wf-table/1，columns `['file','jsonPath','op','value','why']`；op 只有 append／setKey。新年表條目寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/timeline-add.json`：wf-table/1，columns `['date','title','summary','event','era','factions','tags']`。沒有資料也交空表。

年表「既有條目補event」只進 inserts，不重複進 timeline-add；索引為盤點快照，why 保留 date＋title，由合併線重新定位且只加缺少的鍵。possible 事件不進確定年表。跨批新引用只可提出插入需求，本批 content 不直接引用；本稿目前沒有跨批依賴。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree 開始前留基線，每寫完一檔及收尾跑；對照新增警告來源 |
| `npm run check` | 全部寫完跑一次，末行 OK 0 errors；不跑 npm test，領導收批時跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查索引與年表、寫報告資料表；timeline 用 load 後取 meta.entries 的唯讀視圖 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-04 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/`。只可新增本批清單與報告四檔，.git 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 rm -rf；不改 ~/.codex/config.toml；不安裝依賴；不碰 .gitignore；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親讀先讀清單，受相同範圍約束，REPORT 記使用情況。
- **分清錯誤來源**：點名工具本身壞掉、沙箱拒寫發 BLOCKED；自己打錯指令或暫存腳本出錯自己修。

## 工作

1. 讀先讀清單，記錄 lore check 基線，確認領導已準備隔離 worktree 與正式 manifest；上線發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-04 --up PROGRESS '已讀完先讀清單，開始寫 bf-deep-04' < /dev/null`。
2. 依逐檔規格寫檔；有同批互引時先建齊最小合法 JSON 再補 body，過程的尚未建立引用須於收尾清零。不修改原檔解決引用。
3. 跑下列固定檢查，寫四份報告資料。
4. 發終局回報；每完成一步讀 orders。

## 交付

REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/REPORT.md`（如檔名被擋則同目錄 report.md）。另交 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/review-rows.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/inserts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/timeline-add.json`。新增內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/`，清單如下：

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/characters/esi-ampofo.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/events/accra-open-throat.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/characters/aden-hersi.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/events/djibouti-crossed-shadows.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/events/aswan-stone-singing.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/events/aswan-hand-above-water.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/events/dubai-tidal-visor.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/events/dubai-last-shadow.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/characters/nali-otieno.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-04/content/lore/places/rift-valley-bone-echo.json`

review-rows 契約 wf-table/1，columns `['檔','類別','名稱','白話','掛到']`；10 列，檔為 repo 相對路徑、名稱加（提案）、白話 ≤60 字。REPORT 開頭逐行列已讀路徑，再四段「做了什麼」「產出」「沒做到或證據不足的」「需要決定的事」，末尾「以後交接書該點名的工具」。新名字、矛盾、年表待併警告逐項列出，不把它們隱藏成全庫已無警告。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree `node content/lore/check.ts` errors=0；新增警告只容許本批尚待合併年表之事件未列年表，白名單 ["event/accra-open-throat","event/djibouti-crossed-shadows","event/aswan-stone-singing","event/aswan-hand-above-water","event/dubai-tidal-visor","event/dubai-last-shadow"]，逐件在 REPORT 附來源與 timeline-add／inserts 對應，不容許其他新增警告。
2. worktree `npm run check` 末行含 OK 0 errors。
3. 固定 10 個新 content 檔存在，檔名=id name段；本線沒有改任何既有檔，差異範圍僅本批檔與報告（領導以 content_gate 驗）。
4. REPORT 有已讀清單；review-rows 合法、10 列、白話≤60字；inserts 與 timeline-add 合法且符合上述欄位，沒有直接寫入既有檔。

不要為了更保險加驗其他東西。上述年表警告是只新增與延後合併的已知結果，領導套用後再消除；不能先改 timeline 讓本批警告變少。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**：在授權檔內修到過，修不好發 FAILED 並寫證據。
- **測不出來**：指令未跑成或拿不到證據，不回滾，保持現狀發 BLOCKED，寫卡點與解除條件；不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-deep-04`；團隊 `teams/bigfill`；上游 lead-bigfill。上線先發 PROGRESS。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-04 --up DONE 'bf-deep-04 新增 10 件，lore check 0 錯，插入需求已列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-04/REPORT.md`。STATUS 與標題照實際結果換。

結束必發 DONE／BLOCKED／NEEDS-USER／FAILED 之一；卡住超過十分鐘先發 BLOCKED，不可無聲等候。回覆只要五行摘要加 REPORT 路徑。
