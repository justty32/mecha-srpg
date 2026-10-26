# 任務：在隔離 worktree 只新增 11 個 lore 檔，補深東亞的人與畫面（batch bf-deep-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書摘要**；REPORT 開頭「已讀清單」，以下每個路徑原樣列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/base/bodyplans/beast-foam-jaw.json`、`content/base/bodyplans/insect-bell-borer.json`、`content/base/bodyplans/insect-hinge-crab.json`、`content/base/bodyplans/insect-lantern-keel.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/frames/bulwark-i.json`、`content/base/species/bell-borer.json`、`content/base/species/foam-jaw.json`、`content/base/species/hinge-crab.json`、`content/base/species/lantern-keel.json`、`content/base/species/tidewolf.json`、`content/base/world/models/bulwark-i.json`、`content/lore/characters/kim-haneul.json`、`content/lore/eras/league.json`、`content/lore/eras/tide-line.json`、`content/lore/factions/busan.json`、`content/lore/factions/imperial-court.json`、`content/lore/factions/japan-umbrella.json`、`content/lore/factions/korea-umbrella.json`、`content/lore/factions/shell-society.json`、`content/lore/factions/shell-wardens.json`、`content/lore/places/court-seat.json`、`content/lore/places/golmud-nest.json`、`content/lore/places/gyeongju-tombs.json`、`content/lore/places/incheon.json`、`content/lore/places/sendai-bell-cliff.json`、`content/lore/places/sendai-wall.json`、`content/lore/places/yangtze-mouth.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-01.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`。相對路徑相對 worktree 根；本稿與共同規格從主 repo 唯讀。本輪必讀 deep-rulings.md；與第一輪計畫或其他規格衝突時，以該裁定為準。

## 背景與唯一目標

本批只完成下列 11 件（東亞）。既有基調修正已補過的二名夜、哀悼與制度不重演；用地方人物補深已有畫面。只新增 content 檔，所有年表與反向關聯改動寫成報告資料，領導最後合併。人物、事件與地點同批可直接互引，其他批新檔不得直接引用。

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

不做：本批清單以外任何檔；不寫 content/base、src、test、specs、content/index、content/batches；wf 只准寫報告目錄；不寫月面、塞勒涅本部、萬潮葬王與吉大港北行；不刪檔、不 commit。筆記與臨時腳本放 `/tmp/cx-bf-deep-01/`。

件數 gate：content 新檔固定 11，修改既有檔固定 0；超出就停下回報。容量 gate：每件 body 300–1500 字；超過 1500 字先精簡，無法縮回則停下回報，不擴寫旁支。

## 逐檔規格

光代號：a＝獸有形體與動作；b＝引號內能吼出的話；c＝古代機／墟／骸片的光或聲被看見、聽見。a、b可並存。燈腹是物種，不是照明物件；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈每種全計畫核心最多一件。僅01的鳴崖碎燈夜獲配燈，其餘配額皆不使用；禁止擅自把背景小物升為核心。

格式照 lore README。每檔 id、name 由本節標題指定；summary 與關聯欄位值照規格，body 才由工人寫成全文。事件不加 gameRefs／aka；人物與地點可有 gameRefs。所有人物為 human，born 不明，不捏造出生年。地點 world earth；地方為既有城內設施或危險區外小據點，不增加新城邦、新裂縫。事件 body 用三至五個小節；地點沿用「地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼」。

### 1. `content/lore/characters/jiang-yan.json`「江燕」（提案）

id `character/jiang-yan`；類型 `characters`；類別 A。定位：人：江口回收駕駛把機甲跪成一道堤，喊「這條街還有人！」。 掛點：N01後果；F；底色1.5、1.8。

光與核心：`{"光":["a","b"],"核心":"江口回收駕駛把機甲跪成一道堤，喊「這條街還有人！」。","受限物件":[],"獸在世界裡":false,"物種":["species/tidewolf"],"戰鬥職":true,"招牌話":"這條街還有人！"}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/yangtze-mouth.json`。

body 要點（依下列三至五句展開，不加新具名角色）：先寫江燕在江口舊渡口用堅盾-I型攔住潮狼，機膝陷進鹽泥仍不讓開。 站起來的瞬間是她承認自己也怕空街，仍朝撤退的同伴吼「這條街還有人！」。 她曾修渡船，會記每個回收者的去向；任務只接人離岸，不宣布收復空城。

固定欄位值：
```json
{"born":"不明","faction":null,"role":"江口回收隊駕駛","kind":"human","relations":[],"events":["event/estuary-white-maw"],"aka":[],"tags":["人物","東亞"],"gameRefs":["base:species/tidewolf","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"江口回收駕駛把機甲跪成一道堤，喊「這條街還有人！」。"}
```

本文需自然連至：`place/yangtze-mouth`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：江口回收駕駛把機甲跪成一道堤，喊「這條街還有人！」。

### 2. `content/lore/events/estuary-white-maw.json`「江口白沫夜」（提案）

id `event/estuary-white-maw`；類型 `events`；類別 A。定位：獸：沫顎把白沫鋪滿舊渡口，江燕以機肩撞開一條回船路。 掛點：N01後果；F；底色1.5、1.8。

光與核心：`{"光":["a"],"核心":"沫顎把白沫鋪滿舊渡口，江燕以機肩撞開一條回船路。","受限物件":[],"獸在世界裡":true,"物種":["species/foam-jaw"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/foam-jaw.json`、`content/base/bodyplans/beast-foam-jaw.json`、`content/lore/places/yangtze-mouth.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沫顎從近海口上灘，四足拖著白沫，張顎時舊渡口像被白牙合住。 江燕以堅盾-I型的機肩迎上第一撞，讓回收隊從獸側撤回船，不靠凡鐵傷核。 清晨渡口仍封著，回收者把沫痕留在岸圖上；只記物種中文名，不給C級獸二名。

固定欄位值：
```json
{"date":"2107-08","period":"era/league","kind":"其他","factions":[],"characters":["character/jiang-yan"],"places":["place/yangtze-mouth"],"consequences":["舊渡口停止當作回收隊的上船點。"],"tags":["地方史","tide"],"visibility":"public","summary":"沫顎把白沫鋪滿舊渡口，江燕以機肩撞開一條回船路。"}
```

本文需自然連至：`place/yangtze-mouth`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-08","title":"江口白沫夜","summary":"沫顎把白沫鋪滿舊渡口，江燕以機肩撞開一條回船路。","event":"event/estuary-white-maw","era":"era/league","factions":[],"tags":["地方史","tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：沫顎把白沫鋪滿舊渡口，江燕以機肩撞開一條回船路。

### 3. `content/lore/characters/yun-haejin.json`「尹海真」（提案）

id `character/yun-haejin`；類型 `characters`；類別 A。定位：人：仁川守牆駕駛把自己補過的肩架頂回戰線，喊「肩還能借！」。 掛點：G／C；底色1.2、1.12；既有眾肩擎城後續。

光與核心：`{"光":["b"],"核心":"仁川守牆駕駛把自己補過的肩架頂回戰線，喊「肩還能借！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"肩還能借！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/incheon.json`。

body 要點（依下列三至五句展開，不加新具名角色）：尹海真平時怕把內街窄門撞壞，操練時總是最後一個把機甲轉正。 站起來的瞬間是同伴撤下傷機，她讓堅盾-I型以補過的肩架接住防線空口，吼「肩還能借！」。 她只是眾肩擎城之後的換防者，不取代既有主將，不讓普通機魂替她說豪語。

固定欄位值：
```json
{"born":"不明","faction":"faction/korea-umbrella","role":"仁川民兵駕駛","kind":"human","relations":[],"events":["event/incheon-biting-surf"],"aka":[],"tags":["人物","東亞"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"仁川守牆駕駛把自己補過的肩架頂回戰線，喊「肩還能借！」。"}
```

本文需自然連至：`place/incheon`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：仁川守牆駕駛把自己補過的肩架頂回戰線，喊「肩還能借！」。

### 4. `content/lore/events/incheon-biting-surf.json`「仁川咬岸」（提案）

id `event/incheon-biting-surf`；類型 `events`；類別 A。定位：獸：若扣甲爬上仁川堤腳，尹海真會以補過的機肩守住排水口。 掛點：N08後果；G／C；底色1.12。

光與核心：`{"光":["a"],"核心":"若扣甲爬上仁川堤腳，尹海真會以補過的機肩守住排水口。","受限物件":[],"獸在世界裡":true,"物種":["species/hinge-crab"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/hinge-crab.json`、`content/base/bodyplans/insect-hinge-crab.json`、`content/lore/places/incheon.json`。

body 要點（依下列三至五句展開，不加新具名角色）：一次可能的換防中，扣甲從海側爬上堤腳，厚鉗咬住排水口外沿，薄鉗刮出一串碎石。 尹海真可能用堅盾-I型卡住牠側身，讓清淤工退入牆後；正文全程保留若發生的語氣。 這只是一段堤腳的救援，不預定殺獸成功，也不重寫眾肩擎城戰果。

固定欄位值：
```json
{"date":"2108-03","period":"era/league","kind":"其他","factions":["faction/korea-umbrella"],"characters":["character/yun-haejin"],"places":["place/incheon"],"consequences":["若發生，民兵會在排水口換防時增派近岸觀察者。"],"tags":["rumor","tide"],"visibility":"public","occurs":"possible","summary":"若扣甲爬上仁川堤腳，尹海真會以補過的機肩守住排水口。"}
```

本文需自然連至：`place/incheon`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：是；正文用「可能／若發生」，不回寫成已發生歷史。

年表建議：`"不入確定年表；possible只留候選鉤子"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：若扣甲爬上仁川堤腳，尹海真會以補過的機肩守住排水口。

### 5. `content/lore/events/court-yard-first-roar.json`「行在初吼」（提案）

id `event/court-yard-first-roar`；類型 `events`；類別 A。定位：人：成都行在的新駕駛第一次喊「替活人開路！」，老兵跟著吼了回去。 掛點：G／C；底色1.1、1.6。

光與核心：`{"光":["b"],"核心":"成都行在的新駕駛第一次喊「替活人開路！」，老兵跟著吼了回去。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"替活人開路！"}`。來源：`content/lore/places/court-seat.json`。

body 要點（依下列三至五句展開，不加新具名角色）：在成都行在的演練場，一名不具名新駕駛把堅盾-I型卡在倒塌的練習門框下。 他原本嫌口號丟臉，機甲抬頭時仍吼「替活人開路！」，老兵接聲，工人趁空撤開。 只寫內陸操練與世代缺口，不安排獸襲成都，也不新增朝廷徵召制度。

固定欄位值：
```json
{"date":"2107-02","period":"era/league","kind":"其他","factions":["faction/imperial-court"],"characters":[],"places":["place/court-seat"],"consequences":["行在老兵開始陪新駕駛喊出出艙前不敢說的口號。"],"tags":["地方史"],"visibility":"public","summary":"成都行在的新駕駛第一次喊「替活人開路！」，老兵跟著吼了回去。"}
```

本文需自然連至：`place/court-seat`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-02","title":"行在初吼","summary":"成都行在的新駕駛第一次喊「替活人開路！」，老兵跟著吼了回去。","event":"event/court-yard-first-roar","era":"era/league","factions":["faction/imperial-court"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：成都行在的新駕駛第一次喊「替活人開路！」，老兵跟著吼了回去。

### 6. `content/lore/characters/senda-chiyo.json`「千田 千代」（提案）

id `character/senda-chiyo`；類型 `characters`；類別 B。定位：人：千代在胸鐘震響時推起傷機，喊「把背交過來！」。 掛點：F；既有年表2105仙台外崖燈盞盡碎。

光與核心：`{"光":["a","b"],"核心":"千代在胸鐘震響時推起傷機，喊「把背交過來！」。","受限物件":[],"獸在世界裡":false,"物種":["species/bell-borer"],"戰鬥職":true,"招牌話":"把背交過來！"}`。來源：`content/base/species/bell-borer.json`、`content/base/bodyplans/insect-bell-borer.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/sendai-bell-cliff.json`。

body 要點（依下列三至五句展開，不加新具名角色）：先給千代一雙因長年操機而顯得年輕的手，讓她自己提起比外表長得多的輪守年資。 站起來的瞬間是碎燈鳴塚胸鐘響起，她把堅盾-I型背甲塞到傷機下，吼「把背交過來！」後沿崖拖退。 命名由整班人帶回，不讓她單殺鐘蠹；人物篇集中在她怕漏掉同伴的習慣，不重演事件全景。

固定欄位值：
```json
{"born":"不明","faction":"faction/japan-umbrella","role":"仙台外岸輪守駕駛","kind":"human","relations":[],"events":["event/bell-cliff-shattered-lights"],"aka":[],"tags":["人物","東亞"],"gameRefs":["base:monster/bell-borer-a","base:species/bell-borer","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"千代在胸鐘震響時推起傷機，喊「把背交過來！」。"}
```

本文需自然連至：`place/sendai-bell-cliff`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：千代在胸鐘震響時推起傷機，喊「把背交過來！」。

### 7. `content/lore/events/bell-cliff-shattered-lights.json`「鳴崖碎燈夜」（提案）

id `event/bell-cliff-shattered-lights`；類型 `events`；類別 B。定位：獸：鐘蠹的胸鐘震碎仙台崖燈，輪守者喊出了碎燈鳴塚。 掛點：F；既有年表2105仙台外崖燈盞盡碎。

光與核心：`{"光":["a","b"],"核心":"鐘蠹的胸鐘震碎仙台崖燈，輪守者喊出了碎燈鳴塚。","受限物件":["燈"],"獸在世界裡":false,"物種":["species/bell-borer"],"戰鬥職":false,"招牌話":"碎燈鳴塚！"}`。來源：`content/base/species/bell-borer.json`、`content/base/bodyplans/insect-bell-borer.json`、`content/lore/places/sendai-bell-cliff.json`、`content/lore/places/sendai-wall.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沿用2105既有同夜：鐘蠹以掘足抵住崖面，胸鐘一震，外崖燈盞接連炸成碎光。 千代與輪守者撤回內港，有人在最後一聲鐘響後喊「碎燈鳴塚！」，名字由這個畫面留下。 內港換班未斷、外岸仍不可回收；既有年表只補event，燈是本計畫唯一以照明物件為核心的一件。

固定欄位值：
```json
{"date":"2105","period":"era/tide-line","kind":"其他","factions":["faction/japan-umbrella"],"characters":["character/senda-chiyo"],"places":["place/sendai-bell-cliff","place/sendai-wall"],"consequences":["仙台把新引路燈移到牆內。","碎燈鳴塚的二名留在輪守圖上。"],"tags":["地方史","tide"],"visibility":"public","summary":"鐘蠹的胸鐘震碎仙台崖燈，輪守者喊出了碎燈鳴塚。"}
```

本文需自然連至：`place/sendai-bell-cliff`、`place/sendai-wall`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"處理":"既有條目補event，不進timeline-add","date":"2105","title":"仙台外崖燈盞盡碎，內港換班未斷","定位快照":122,"event":"event/bell-cliff-shattered-lights"}`。

插入需求（僅寫報告）：`[{"file":"content/lore/timeline.json","jsonPath":"$.entries[122]","op":"setKey","value":{"event":"event/bell-cliff-shattered-lights"},"why":"既有同夜不重複加列；合併時以 date=2105、title=仙台外崖燈盞盡碎，內港換班未斷 重定位，只在event缺鍵時新增，已有異值交領導裁定。"}]`。

review 白話：鐘蠹的胸鐘震碎仙台崖燈，輪守者喊出了碎燈鳴塚。

### 8. `content/lore/places/sendai-low-eaves.json`「仙台低簷」（提案）

id `place/sendai-low-eaves`；類型 `places`；類別 B。定位：獸：仙台牆根的低簷下能看見燈腹薄翼掠海，搬運工貼牆讓過亮囊。 掛點：F；2105碎燈夜之後的仙台內港輪守；底色1.4。

光與核心：`{"光":["a"],"核心":"仙台牆根的低簷下能看見燈腹薄翼掠海，搬運工貼牆讓過亮囊。","受限物件":[],"獸在世界裡":true,"物種":["species/lantern-keel"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/lantern-keel.json`、`content/base/bodyplans/insect-lantern-keel.json`、`content/lore/places/sendai-wall.json`、`content/lore/places/sendai-bell-cliff.json`。

body 要點（依下列三至五句展開，不加新具名角色）：低簷是仙台內港牆內的避讓處，外側海面偶有燈腹薄翼成片掠過，亮囊把磚縫照得發青。 搬運工從簷底觀察牠們滴落的光跡，待牠們離開卸貨上空才出牆作業。 這是C級物種在既有海岸出現的地方，不設新裂縫，不把亮囊寫成可馴的照明工具。

固定欄位值：
```json
{"region":"亞洲・仙台內港牆內","continent":"亞洲","world":"earth","kind":"其他","status2108":"牆內可避讓；外側遇燈腹掠海即暫停卸貨","factions":["faction/japan-umbrella"],"aka":[],"tags":["地方","東亞"],"gameRefs":["base:species/lantern-keel"],"visibility":"public","summary":"仙台牆根的低簷下能看見燈腹薄翼掠海，搬運工貼牆讓過亮囊。"}
```

本文需自然連至：`place/sendai-wall`、`place/sendai-bell-cliff`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/japan-umbrella.json","jsonPath":"$","op":"setKey","value":{"places":["place/sendai-low-eaves"]},"why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：仙台牆根的低簷下能看見燈腹薄翼掠海，搬運工貼牆讓過亮囊。

### 9. `content/lore/events/sun-script-on-frost.json`「霜壁留日」（提案）

id `event/sun-script-on-frost`；類型 `events`；類別 C。定位：光：夸父窩口的刻痕透過霜層泛亮，抄寫者停筆看見一個追日的人。 掛點：B／A；N02後果；2100夸父負山之夜後互存抄本。

光與核心：`{"光":["c"],"核心":"夸父窩口的刻痕透過霜層泛亮，抄寫者停筆看見一個追日的人。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/golmud-nest.json`。

body 要點（依下列三至五句展開，不加新具名角色）：抄本互存之後一次寒夜，窩口井壁的先民刻痕隔著霜層泛亮，追日的人形落在抄寫者臉上。 守寢人叫他們把手放下，先看清眼前形狀；無人聽懂一條新命令，也沒有古代機身體移動。 抄本只記看見的紋樣與光色，不解出先民答案；夸父和丹增既有關係保持原狀。

固定欄位值：
```json
{"date":"2107-01","period":"era/league","kind":"其他","factions":["faction/shell-wardens"],"characters":[],"places":["place/golmud-nest"],"consequences":["窩口抄寫者留下霜中刻痕的目擊記錄，未解出新答案。"],"tags":["地方史"],"visibility":"public","summary":"夸父窩口的刻痕透過霜層泛亮，抄寫者停筆看見一個追日的人。"}
```

本文需自然連至：`place/golmud-nest`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-01","title":"霜壁留日","summary":"夸父窩口的刻痕透過霜層泛亮，抄寫者停筆看見一個追日的人。","event":"event/sun-script-on-frost","era":"era/league","factions":["faction/shell-wardens"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：夸父窩口的刻痕透過霜層泛亮，抄寫者停筆看見一個追日的人。

### 10. `content/lore/places/golmud-dawn-recess.json`「窩口映日龕」（提案）

id `place/golmud-dawn-recess`；類型 `places`；類別 C。定位：光：窩口石龕正對夸父裝甲，斜照的金光讓學者與守寢人同時住口。 掛點：B／A；2100抄本互存；底色1.3。

光與核心：`{"光":["c"],"核心":"窩口石龕正對夸父裝甲，斜照的金光讓學者與守寢人同時住口。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/golmud-nest.json`。

body 要點（依下列三至五句展開，不加新具名角色）：把石龕放在既有窩口的短留處，從這裡能望見夸父靜止裝甲上的金色刻痕。 學者正在爭抄本次序，日光掠過裝甲，整面石壁映出巨大的半身輪廓，兩邊都停了口。 只寫人看見古代機之光的尺度，不把日照固定成甦醒時刻，也不新增內殿或朝聖儀式。

固定欄位值：
```json
{"region":"亞洲・格爾木外夸父之窩入口","continent":"亞洲","world":"earth","kind":"其他","status2108":"供抄本交接者短留；不作新內殿","factions":["faction/shell-wardens","faction/shell-society"],"aka":[],"tags":["地方","東亞"],"gameRefs":[],"visibility":"public","summary":"窩口石龕正對夸父裝甲，斜照的金光讓學者與守寢人同時住口。"}
```

本文需自然連至：`place/golmud-nest`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/shell-wardens.json","jsonPath":"$.places","op":"append","value":"place/golmud-dawn-recess","why":"只增加地點導航，不賦予古代機所有權。"},{"file":"content/lore/factions/shell-society.json","jsonPath":"$.places","op":"append","value":"place/golmud-dawn-recess","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：窩口石龕正對夸父裝甲，斜照的金光讓學者與守寢人同時住口。

### 11. `content/lore/characters/han-bora.json`「韓寶羅」（提案）

id `character/han-bora`；類型 `characters`；類別 C。定位：人：修鼓人看見處容空陵的骸片泛亮，仍吼「這一拍，替活人！」。 掛點：B；2100慶州古陵之爭後果；底色1.9。

光與核心：`{"光":["b","c"],"核心":"修鼓人看見處容空陵的骸片泛亮，仍吼「這一拍，替活人！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"這一拍，替活人！"}`。來源：`content/lore/places/gyeongju-tombs.json`。

body 要點（依下列三至五句展開，不加新具名角色）：韓寶羅替慶州訪客修鼓，空內殿外原地留下的骸片在她繃鼓時泛亮，照出她掌上的舊疤。 站起來的瞬間是喪親訪客停手，她接過鼓吼「這一拍，替活人！」，再將鼓交還，不宣稱替死者代言。 處容在釜山，空陵不迎回本體；鼓聲不喚醒古代機，骸片不被取走或出售。

固定欄位值：
```json
{"born":"不明","faction":"faction/busan","role":"慶州古陵外的修鼓人","kind":"human","relations":[{"character":"character/kim-haneul","relation":"地方往來","note":"金河娜經過古陵時認得修鼓人，韓寶羅留在空陵照看訪客。"}],"events":[],"aka":[],"tags":["人物","東亞"],"gameRefs":[],"visibility":"public","summary":"修鼓人看見處容空陵的骸片泛亮，仍吼「這一拍，替活人！」。"}
```

本文需自然連至：`place/gyeongju-tombs`、`character/kim-haneul`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/kim-haneul.json","jsonPath":"$.relations","op":"append","value":{"character":"character/han-bora","relation":"地方往來","note":"金河娜經過古陵時認得修鼓人，韓寶羅留在空陵照看訪客。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：修鼓人看見處容空陵的骸片泛亮，仍吼「這一拍，替活人！」。

### 既有檔的插入需求

本批不套用插入。把逐檔建議中的物件依原值寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/inserts.json`：wf-table/1，columns `['file','jsonPath','op','value','why']`；op 只有 append／setKey。新年表條目寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/timeline-add.json`：wf-table/1，columns `['date','title','summary','event','era','factions','tags']`。沒有資料也交空表。

年表「既有條目補event」只進 inserts，不重複進 timeline-add；索引為盤點快照，why 保留 date＋title，由合併線重新定位且只加缺少的鍵。possible 事件不進確定年表。跨批新引用只可提出插入需求，本批 content 不直接引用；本稿目前沒有跨批依賴。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree 開始前留基線，每寫完一檔及收尾跑；對照新增警告來源 |
| `npm run check` | 全部寫完跑一次，末行 OK 0 errors；不跑 npm test，領導收批時跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查索引與年表、寫報告資料表；timeline 用 load 後取 meta.entries 的唯讀視圖 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/`。只可新增本批清單與報告四檔，.git 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 rm -rf；不改 ~/.codex/config.toml；不安裝依賴；不碰 .gitignore；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親讀先讀清單，受相同範圍約束，REPORT 記使用情況。
- **分清錯誤來源**：點名工具本身壞掉、沙箱拒寫發 BLOCKED；自己打錯指令或暫存腳本出錯自己修。

## 工作

1. 讀先讀清單，記錄 lore check 基線，確認領導已準備隔離 worktree 與正式 manifest；上線發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-01 --up PROGRESS '已讀完先讀清單，開始寫 bf-deep-01' < /dev/null`。
2. 依逐檔規格寫檔；有同批互引時先建齊最小合法 JSON 再補 body，過程的尚未建立引用須於收尾清零。不修改原檔解決引用。
3. 跑下列固定檢查，寫四份報告資料。
4. 發終局回報；每完成一步讀 orders。

## 交付

REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/REPORT.md`（如檔名被擋則同目錄 report.md）。另交 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/review-rows.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/inserts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/timeline-add.json`。新增內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/`，清單如下：

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/characters/jiang-yan.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/events/estuary-white-maw.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/characters/yun-haejin.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/events/incheon-biting-surf.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/events/court-yard-first-roar.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/characters/senda-chiyo.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/events/bell-cliff-shattered-lights.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/places/sendai-low-eaves.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/events/sun-script-on-frost.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/places/golmud-dawn-recess.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-01/content/lore/characters/han-bora.json`

review-rows 契約 wf-table/1，columns `['檔','類別','名稱','白話','掛到']`；11 列，檔為 repo 相對路徑、名稱加（提案）、白話 ≤60 字。REPORT 開頭逐行列已讀路徑，再四段「做了什麼」「產出」「沒做到或證據不足的」「需要決定的事」，末尾「以後交接書該點名的工具」。新名字、矛盾、年表待併警告逐項列出，不把它們隱藏成全庫已無警告。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree `node content/lore/check.ts` errors=0；新增警告只容許本批尚待合併年表之事件未列年表，白名單 ["event/estuary-white-maw","event/court-yard-first-roar","event/bell-cliff-shattered-lights","event/sun-script-on-frost"]，逐件在 REPORT 附來源與 timeline-add／inserts 對應，不容許其他新增警告。
2. worktree `npm run check` 末行含 OK 0 errors。
3. 固定 11 個新 content 檔存在，檔名=id name段；本線沒有改任何既有檔，差異範圍僅本批檔與報告（領導以 content_gate 驗）。
4. REPORT 有已讀清單；review-rows 合法、11 列、白話≤60字；inserts 與 timeline-add 合法且符合上述欄位，沒有直接寫入既有檔。

不要為了更保險加驗其他東西。上述年表警告是只新增與延後合併的已知結果，領導套用後再消除；不能先改 timeline 讓本批警告變少。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**：在授權檔內修到過，修不好發 FAILED 並寫證據。
- **測不出來**：指令未跑成或拿不到證據，不回滾，保持現狀發 BLOCKED，寫卡點與解除條件；不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-deep-01`；團隊 `teams/bigfill`；上游 lead-bigfill。上線先發 PROGRESS。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-01 --up DONE 'bf-deep-01 新增 11 件，lore check 0 錯，插入需求已列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-01/REPORT.md`。STATUS 與標題照實際結果換。

結束必發 DONE／BLOCKED／NEEDS-USER／FAILED 之一；卡住超過十分鐘先發 BLOCKED，不可無聲等候。回覆只要五行摘要加 REPORT 路徑。
