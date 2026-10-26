# 任務：在隔離 worktree 只新增 10 個 lore 檔，補深南亞的人與畫面（batch bf-deep-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書摘要**；REPORT 開頭「已讀清單」，以下每個路徑原樣列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/base/bodyplans/mycel-reed-lace.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/frames/bulwark-i.json`、`content/base/species/reed-lace.json`、`content/base/species/tidewolf.json`、`content/base/world/models/bulwark-i.json`、`content/lore/eras/league.json`、`content/lore/factions/bay-seventh-post.json`、`content/lore/factions/dhaka-weavers.json`、`content/lore/factions/mumbai-returners.json`、`content/lore/factions/tide-creed.json`、`content/lore/places/bay-tide-line.json`、`content/lore/places/dhaka-sail-court.json`、`content/lore/places/dhaka.json`、`content/lore/places/khulna.json`、`content/lore/places/mumbai-gate.json`、`content/lore/places/surat-key-court.json`、`content/lore/places/surat.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-02.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`。相對路徑相對 worktree 根；本稿與共同規格從主 repo 唯讀。本輪必讀 deep-rulings.md；與第一輪計畫或其他規格衝突時，以該裁定為準。

## 背景與唯一目標

本批只完成下列 10 件（南亞）。既有基調修正已補過的二名夜、哀悼與制度不重演；用地方人物補深已有畫面。只新增 content 檔，所有年表與反向關聯改動寫成報告資料，領導最後合併。人物、事件與地點同批可直接互引，其他批新檔不得直接引用。

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

不做：本批清單以外任何檔；不寫 content/base、src、test、specs、content/index、content/batches；wf 只准寫報告目錄；不寫月面、塞勒涅本部、萬潮葬王與吉大港北行；不刪檔、不 commit。筆記與臨時腳本放 `/tmp/cx-bf-deep-02/`。

件數 gate：content 新檔固定 10，修改既有檔固定 0；超出就停下回報。容量 gate：每件 body 300–1500 字；超過 1500 字先精簡，無法縮回則停下回報，不擴寫旁支。

## 逐檔規格

光代號：a＝獸有形體與動作；b＝引號內能吼出的話；c＝古代機／墟／骸片的光或聲被看見、聽見。a、b可並存。燈腹是物種，不是照明物件；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈每種全計畫核心最多一件。僅01的鳴崖碎燈夜獲配燈，其餘配額皆不使用；禁止擅自把背景小物升為核心。

格式照 lore README。每檔 id、name 由本節標題指定；summary 與關聯欄位值照規格，body 才由工人寫成全文。事件不加 gameRefs／aka；人物與地點可有 gameRefs。所有人物為 human，born 不明，不捏造出生年。地點 world earth；地方為既有城內設施或危險區外小據點，不增加新城邦、新裂縫。事件 body 用三至五個小節；地點沿用「地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼」。

### 1. `content/lore/characters/rupa-das.json`「魯帕・達斯」（提案）

id `character/rupa-das`；類型 `characters`；類別 A。定位：人：魯帕托起塌向補天院的帆骨，明知誇張仍喊「借我一片天！」。 掛點：C／G；底色1.1、1.2；達卡補天院後續。

光與核心：`{"光":["b"],"核心":"魯帕托起塌向補天院的帆骨，明知誇張仍喊「借我一片天！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"借我一片天！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/dhaka-sail-court.json`、`content/lore/places/dhaka.json`。

body 要點（依下列三至五句展開，不加新具名角色）：魯帕第一次獨自當班便遇到帆骨斷裂，她用堅盾-I型肩架接住，膝甲幾乎沒入院泥。 站起來的瞬間是她不再等師傅替自己下令，吼「借我一片天！」叫同伴撤開；她自己也知道名字太大。 她出生在崩年後的年齡缺口邊緣，不補確切出生年；機甲守住院落，並未長出新異能。

固定欄位值：
```json
{"born":"不明","faction":"faction/dhaka-weavers","role":"達卡護帆隊駕駛","kind":"human","relations":[],"events":["event/sail-ribs-hold-the-sky"],"aka":[],"tags":["人物","南亞"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"魯帕托起塌向補天院的帆骨，明知誇張仍喊「借我一片天！」。"}
```

本文需自然連至：`place/dhaka-sail-court`、`place/dhaka`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：魯帕托起塌向補天院的帆骨，明知誇張仍喊「借我一片天！」。

### 2. `content/lore/events/sail-ribs-hold-the-sky.json`「帆骨撐天」（提案）

id `event/sail-ribs-hold-the-sky`；類型 `events`；類別 A。定位：光：補天院的破帆壓下來，院內工匠把「撐到人走完！」喊成一聲。 掛點：G／C；底色1.3、1.4；補天院的地方後果。

光與核心：`{"光":["b"],"核心":"補天院的破帆壓下來，院內工匠把「撐到人走完！」喊成一聲。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"撐到人走完！"}`。來源：`content/lore/places/dhaka-sail-court.json`。

body 要點（依下列三至五句展開，不加新具名角色）：舊帆的骨架被風扯斷，魯帕的堅盾-I型頂住下墜的一角，染料沿機肩流成彩痕。 工匠齊喊「撐到人走完！」，一邊卸下會再壓垮機甲的重物；浪漫落在一群人共同撐住的形狀。 帆最後仍破了，院子停工修補，沒有永久罩住整座城的神蹟。

固定欄位值：
```json
{"date":"2107-06","period":"era/league","kind":"其他","factions":["faction/dhaka-weavers"],"characters":["character/rupa-das"],"places":["place/dhaka-sail-court"],"consequences":["補天院停工修補帆骨，工匠保住了撤離通道。"],"tags":["地方史"],"visibility":"public","summary":"補天院的破帆壓下來，院內工匠把「撐到人走完！」喊成一聲。"}
```

本文需自然連至：`place/dhaka-sail-court`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-06","title":"帆骨撐天","summary":"補天院的破帆壓下來，院內工匠把「撐到人走完！」喊成一聲。","event":"event/sail-ribs-hold-the-sky","era":"era/league","factions":["faction/dhaka-weavers"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：補天院的破帆壓下來，院內工匠把「撐到人走完！」喊成一聲。

### 3. `content/lore/characters/sajid-ali.json`「薩吉德・阿里」（提案）

id `character/sajid-ali`；類型 `characters`；類別 A。定位：人：薩吉德對著庫爾納空街喊「有活口，就回聲！」，再把機甲轉進死巷。 掛點：F；底色1.5、1.8。

光與核心：`{"光":["b"],"核心":"薩吉德對著庫爾納空街喊「有活口，就回聲！」，再把機甲轉進死巷。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"有活口，就回聲！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/khulna.json`。

body 要點（依下列三至五句展開，不加新具名角色）：薩吉德習慣敲座艙側板聽同伴回答，不把空城回聲當作死者傳話。 站起來的瞬間是打撈隊以為全員已退，他還聽見一個人，開堅盾-I型折回死巷，吼「有活口，就回聲！」。 他托出卡在舊水槽旁的傷員後才退，並非循聲找到新的墟或城市核心。

固定欄位值：
```json
{"born":"不明","faction":null,"role":"庫爾納打撈隊駕駛","kind":"human","relations":[],"events":["event/khulna-reed-mouth"],"aka":[],"tags":["人物","南亞"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"薩吉德對著庫爾納空街喊「有活口，就回聲！」，再把機甲轉進死巷。"}
```

本文需自然連至：`place/khulna`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：薩吉德對著庫爾納空街喊「有活口，就回聲！」，再把機甲轉進死巷。

### 4. `content/lore/events/khulna-reed-mouth.json`「庫爾納蘆口」（提案）

id `event/khulna-reed-mouth`；類型 `events`；類別 A。定位：獸：若淡水渠裡的蘆網結成白冠，打撈者會在庫爾納死巷前折返。 掛點：F；底色1.5、1.8。

光與核心：`{"光":["a"],"核心":"若淡水渠裡的蘆網結成白冠，打撈者會在庫爾納死巷前折返。","受限物件":[],"獸在世界裡":true,"物種":["species/reed-lace"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/reed-lace.json`、`content/base/bodyplans/mycel-reed-lace.json`、`content/lore/places/khulna.json`。

body 要點（依下列三至五句展開，不加新具名角色）：可能的一次回收中，沿淡水延伸的蘆網在庫爾納舊渠結出蘆冠，上中下游的白結依次露出。 薩吉德可能停下堅盾-I型，將撤隊方向改到乾地，不讓隊員把白絲當成普通蘆根。 只沿既有淡水通道描寫菌絲，不補海獸深入內陸；可撤退不等於確定清除。

固定欄位值：
```json
{"date":"2108-04","period":"era/league","kind":"其他","factions":[],"characters":["character/sajid-ali"],"places":["place/khulna"],"consequences":["若發生，打撈隊會避開長出蘆冠的舊渠口。"],"tags":["rumor","tide"],"visibility":"public","occurs":"possible","summary":"若淡水渠裡的蘆網結成白冠，打撈者會在庫爾納死巷前折返。"}
```

本文需自然連至：`place/khulna`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：是；正文用「可能／若發生」，不回寫成已發生歷史。

年表建議：`"不入確定年表；possible只留候選鉤子"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：若淡水渠裡的蘆網結成白冠，打撈者會在庫爾納死巷前折返。

### 5. `content/lore/characters/anaya-patel.json`「阿娜雅・帕特爾」（提案）

id `character/anaya-patel`；類型 `characters`；類別 A。定位：人：阿娜雅把還想返戰場的傷兵拖回蘇拉特，喊「罵我也得活著罵！」。 掛點：F；N08浦那撤離後果；底色1.11。

光與核心：`{"光":["b"],"核心":"阿娜雅把還想返戰場的傷兵拖回蘇拉特，喊「罵我也得活著罵！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"罵我也得活著罵！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/surat.json`、`content/lore/places/surat-key-court.json`。

body 要點（依下列三至五句展開，不加新具名角色）：阿娜雅開堅盾-I型作後送，坐進艙前先數拖架能載幾個傷員，自己從不挑安靜的那架。 站起來的瞬間是兩派傷兵互罵、拖架卻開始往斜坡滑，她撐住機腳吼「罵我也得活著罵！」。 她曾跟浦那撤離人群走到蘇拉特，不用一次救援勸人原諒棄城者，也不成為歸還黨領袖。

固定欄位值：
```json
{"born":"不明","faction":"faction/mumbai-returners","role":"蘇拉特後送駕駛","kind":"human","relations":[],"events":["event/surat-voices-on-the-slope"],"aka":[],"tags":["人物","南亞"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"阿娜雅把還想返戰場的傷兵拖回蘇拉特，喊「罵我也得活著罵！」。"}
```

本文需自然連至：`place/surat`、`place/surat-key-court`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：阿娜雅把還想返戰場的傷兵拖回蘇拉特，喊「罵我也得活著罵！」。

### 6. `content/lore/events/surat-voices-on-the-slope.json`「坡上還聲」（提案）

id `event/surat-voices-on-the-slope`；類型 `events`；類別 A。定位：人：蘇拉特後送拖架滑向斜坡，傷兵把「我還在！」一聲聲吼給駕駛。 掛點：F；N08後果；底色1.11。

光與核心：`{"光":["b"],"核心":"蘇拉特後送拖架滑向斜坡，傷兵把「我還在！」一聲聲吼給駕駛。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"我還在！"}`。來源：`content/lore/places/surat.json`、`content/lore/places/surat-key-court.json`。

body 要點（依下列三至五句展開，不加新具名角色）：在還鄉院外的坡路，阿娜雅頂住正在倒滑的拖架，傷員握著擔架邊緣互相穩住。 她要每個還清醒的人吼「我還在！」，好分辨該先抬誰，守線者與歸還者暫時喊同一句。 人入院後仍會爭吵，這夜留下共同答聲，不抹平浦那撤離的裂痕。

固定欄位值：
```json
{"date":"2107-09","period":"era/league","kind":"其他","factions":["faction/mumbai-returners"],"characters":["character/anaya-patel"],"places":["place/surat","place/surat-key-court"],"consequences":["還鄉院的後送者用逐一答聲分辨拖架上的傷員。"],"tags":["地方史"],"visibility":"public","summary":"蘇拉特後送拖架滑向斜坡，傷兵把「我還在！」一聲聲吼給駕駛。"}
```

本文需自然連至：`place/surat`、`place/surat-key-court`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-09","title":"坡上還聲","summary":"蘇拉特後送拖架滑向斜坡，傷兵把「我還在！」一聲聲吼給駕駛。","event":"event/surat-voices-on-the-slope","era":"era/league","factions":["faction/mumbai-returners"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：蘇拉特後送拖架滑向斜坡，傷兵把「我還在！」一聲聲吼給駕駛。

### 7. `content/lore/characters/bina-sen.json`「比娜・森」（提案）

id `character/bina-sen`；類型 `characters`；類別 A。定位：人：比娜拖著裂盾還敢喊「缺口算我的！」，把退潮的哨線守到換班。 掛點：E／F；底色1.8、1.12；唱名夜的日常後續。

光與核心：`{"光":["a","b"],"核心":"比娜拖著裂盾還敢喊「缺口算我的！」，把退潮的哨線守到換班。","受限物件":[],"獸在世界裡":false,"物種":["species/tidewolf"],"戰鬥職":true,"招牌話":"缺口算我的！"}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/bay-tide-line.json`。

body 要點（依下列三至五句展開，不加新具名角色）：比娜既開堅盾-I型也替同伴修盾，唱名夜常唱錯調，活人交班卻不漏答聲。 站起來的瞬間是潮狼把盾緣咬裂，她將缺口轉向自己的機肩，吼「缺口算我的！」讓另一台傷機先退。 她只守到換班，不成為新王牌，也不讓普通機魂突然長出個性。

固定欄位值：
```json
{"born":"不明","faction":"faction/bay-seventh-post","role":"第七哨修盾駕駛","kind":"human","relations":[],"events":["event/seventh-post-salt-jaws"],"aka":[],"tags":["人物","南亞"],"gameRefs":["base:species/tidewolf","base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"比娜拖著裂盾還敢喊「缺口算我的！」，把退潮的哨線守到換班。"}
```

本文需自然連至：`place/bay-tide-line`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：比娜拖著裂盾還敢喊「缺口算我的！」，把退潮的哨線守到換班。

### 8. `content/lore/events/seventh-post-salt-jaws.json`「第七哨白齒」（提案）

id `event/seventh-post-salt-jaws`；類型 `events`；類別 A。定位：獸：C級潮狼的牙從浪裡一排排露出，比娜拖著裂盾替換防隊擋住缺口。 掛點：E／F；底色1.8、1.12；第七哨唱名夜後續。

光與核心：`{"光":["a"],"核心":"C級潮狼的牙從浪裡一排排露出，比娜拖著裂盾替換防隊擋住缺口。","受限物件":[],"獸在世界裡":true,"物種":["species/tidewolf"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/tidewolf.json`、`content/base/bodyplans/quadruped-beast.json`、`content/lore/places/bay-tide-line.json`。

body 要點（依下列三至五句展開，不加新具名角色）：海口退浪時，C級潮狼仍沿濕岸突進，鹽白的牙與黑色四足交錯出現在第七哨前。 比娜的堅盾-I型盾面裂開，她與後班交錯退到內線，靠精粹兵器擋獸，不宣稱凡鐵穿核。 換防完成而獸未清盡，哨線縮回可守的一段；沿用物種名，不取二名。

固定欄位值：
```json
{"date":"2107-12","period":"era/league","kind":"其他","factions":["faction/bay-seventh-post"],"characters":["character/bina-sen"],"places":["place/bay-tide-line"],"consequences":["第七哨將當晚換防線後縮到可接應傷機的位置。"],"tags":["tide"],"visibility":"public","summary":"C級潮狼的牙從浪裡一排排露出，比娜拖著裂盾替換防隊擋住缺口。"}
```

本文需自然連至：`place/bay-tide-line`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-12","title":"第七哨白齒","summary":"C級潮狼的牙從浪裡一排排露出，比娜拖著裂盾替換防隊擋住缺口。","event":"event/seventh-post-salt-jaws","era":"era/league","factions":["faction/bay-seventh-post"],"tags":["tide"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：C級潮狼的牙從浪裡一排排露出，比娜拖著裂盾替換防隊擋住缺口。

### 9. `content/lore/events/mumbai-ash-halo.json`「門內灰虹」（提案）

id `event/mumbai-ash-halo`；類型 `events`；類別 C。定位：光：孟買門的朝聖者隔著灰霧看見一圈暗紅光，爭著說那就是迦梨。 掛點：B／H；2096迦梨現身後果；底色1.9。

光與核心：`{"光":["c"],"核心":"孟買門的朝聖者隔著灰霧看見一圈暗紅光，爭著說那就是迦梨。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/mumbai-gate.json`。

body 要點（依下列三至五句展開，不加新具名角色）：朝聖者隔著既有缺口看到灰霧裡的暗紅弧光，沒有人看清古代機輪廓；public只寫目擊到的光。 一位不具名信徒扶起跪倒的同行者，沒有跟著人群往更深處走。 迦梨在裡面與聲音來歷仍非外界已知；把將紅光歸給迦梨的說法放rumor，不寫它移動或選人。

固定欄位值：
```json
{"date":"2107-08","period":"era/league","kind":"其他","factions":["faction/tide-creed"],"characters":[],"places":["place/mumbai-gate"],"consequences":["孟買門外留下紅光目擊與彼此不同的解釋。"],"tags":["地方史"],"visibility":"public","secrets":[{"visibility":"rumor","text":"門外朝聖者把灰霧中的暗紅弧光稱作迦梨的光，沒有人能指出本體的位置。"}],"summary":"孟買門的朝聖者隔著灰霧看見一圈暗紅光，爭著說那就是迦梨。"}
```

本文需自然連至：`place/mumbai-gate`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public為灰霧中紅光的目擊；歸因迦梨只在secrets.visibility=rumor，不增hidden答案。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-08","title":"門內灰虹","summary":"孟買門的朝聖者隔著灰霧看見一圈暗紅光，爭著說那就是迦梨。","event":"event/mumbai-ash-halo","era":"era/league","factions":["faction/tide-creed"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：孟買門的朝聖者隔著灰霧看見一圈暗紅光，爭著說那就是迦梨。

### 10. `content/lore/places/mumbai-resonant-wall.json`「孟買聽壁」（提案）

id `place/mumbai-resonant-wall`；類型 `places`；類別 C。定位：光：門外殘牆的骸片泛出紫光，等候者把掌心懸在牆前，沒有拿走它。 掛點：B／H；底色1.9；2096迦梨傳聞的地方後果。

光與核心：`{"光":["c"],"核心":"門外殘牆的骸片泛出紫光，等候者把掌心懸在牆前，沒有拿走它。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/mumbai-gate.json`。

body 要點（依下列三至五句展開，不加新具名角色）：殘牆位於孟買門外等候區，牆腳原有骸片的斷面泛紫，照出朝聖者掌心而非古代機真容。 public寫人止步觀看；教徒說這是迦梨仍聽得見他們，這個歸因另入rumor。 碎片維持原地、不鑿取、不交易，光不回答誰會歸來，也不使蝕域邊緣安全。

固定欄位值：
```json
{"region":"亞洲・孟買門外側","continent":"亞洲","world":"earth","kind":"其他","status2108":"門外仍有等候者；骸片原地保留，無開採","factions":["faction/tide-creed"],"aka":[],"tags":["地方","南亞"],"gameRefs":[],"visibility":"public","summary":"門外殘牆的骸片泛出紫光，等候者把掌心懸在牆前，沒有拿走它。","secrets":[{"visibility":"rumor","text":"等候者把殘牆骸片的紫光說成迦梨在聽，學會沒有證實其歸屬。"}]}
```

本文需自然連至：`place/mumbai-gate`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public為骸片可見之光；與迦梨的關係只存rumor，不證實聲音來源。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/tide-creed.json","jsonPath":"$.places","op":"append","value":"place/mumbai-resonant-wall","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：門外殘牆的骸片泛出紫光，等候者把掌心懸在牆前，沒有拿走它。

### 既有檔的插入需求

本批不套用插入。把逐檔建議中的物件依原值寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/inserts.json`：wf-table/1，columns `['file','jsonPath','op','value','why']`；op 只有 append／setKey。新年表條目寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/timeline-add.json`：wf-table/1，columns `['date','title','summary','event','era','factions','tags']`。沒有資料也交空表。

年表「既有條目補event」只進 inserts，不重複進 timeline-add；索引為盤點快照，why 保留 date＋title，由合併線重新定位且只加缺少的鍵。possible 事件不進確定年表。跨批新引用只可提出插入需求，本批 content 不直接引用；本稿目前沒有跨批依賴。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree 開始前留基線，每寫完一檔及收尾跑；對照新增警告來源 |
| `npm run check` | 全部寫完跑一次，末行 OK 0 errors；不跑 npm test，領導收批時跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查索引與年表、寫報告資料表；timeline 用 load 後取 meta.entries 的唯讀視圖 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/`。只可新增本批清單與報告四檔，.git 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 rm -rf；不改 ~/.codex/config.toml；不安裝依賴；不碰 .gitignore；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親讀先讀清單，受相同範圍約束，REPORT 記使用情況。
- **分清錯誤來源**：點名工具本身壞掉、沙箱拒寫發 BLOCKED；自己打錯指令或暫存腳本出錯自己修。

## 工作

1. 讀先讀清單，記錄 lore check 基線，確認領導已準備隔離 worktree 與正式 manifest；上線發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-02 --up PROGRESS '已讀完先讀清單，開始寫 bf-deep-02' < /dev/null`。
2. 依逐檔規格寫檔；有同批互引時先建齊最小合法 JSON 再補 body，過程的尚未建立引用須於收尾清零。不修改原檔解決引用。
3. 跑下列固定檢查，寫四份報告資料。
4. 發終局回報；每完成一步讀 orders。

## 交付

REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/REPORT.md`（如檔名被擋則同目錄 report.md）。另交 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/review-rows.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/inserts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/timeline-add.json`。新增內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/`，清單如下：

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/characters/rupa-das.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/events/sail-ribs-hold-the-sky.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/characters/sajid-ali.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/events/khulna-reed-mouth.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/characters/anaya-patel.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/events/surat-voices-on-the-slope.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/characters/bina-sen.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/events/seventh-post-salt-jaws.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/events/mumbai-ash-halo.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-02/content/lore/places/mumbai-resonant-wall.json`

review-rows 契約 wf-table/1，columns `['檔','類別','名稱','白話','掛到']`；10 列，檔為 repo 相對路徑、名稱加（提案）、白話 ≤60 字。REPORT 開頭逐行列已讀路徑，再四段「做了什麼」「產出」「沒做到或證據不足的」「需要決定的事」，末尾「以後交接書該點名的工具」。新名字、矛盾、年表待併警告逐項列出，不把它們隱藏成全庫已無警告。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree `node content/lore/check.ts` errors=0；新增警告只容許本批尚待合併年表之事件未列年表，白名單 ["event/sail-ribs-hold-the-sky","event/surat-voices-on-the-slope","event/seventh-post-salt-jaws","event/mumbai-ash-halo"]，逐件在 REPORT 附來源與 timeline-add／inserts 對應，不容許其他新增警告。
2. worktree `npm run check` 末行含 OK 0 errors。
3. 固定 10 個新 content 檔存在，檔名=id name段；本線沒有改任何既有檔，差異範圍僅本批檔與報告（領導以 content_gate 驗）。
4. REPORT 有已讀清單；review-rows 合法、10 列、白話≤60字；inserts 與 timeline-add 合法且符合上述欄位，沒有直接寫入既有檔。

不要為了更保險加驗其他東西。上述年表警告是只新增與延後合併的已知結果，領導套用後再消除；不能先改 timeline 讓本批警告變少。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**：在授權檔內修到過，修不好發 FAILED 並寫證據。
- **測不出來**：指令未跑成或拿不到證據，不回滾，保持現狀發 BLOCKED，寫卡點與解除條件；不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-deep-02`；團隊 `teams/bigfill`；上游 lead-bigfill。上線先發 PROGRESS。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-02 --up DONE 'bf-deep-02 新增 10 件，lore check 0 錯，插入需求已列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-02/REPORT.md`。STATUS 與標題照實際結果換。

結束必發 DONE／BLOCKED／NEEDS-USER／FAILED 之一；卡住超過十分鐘先發 BLOCKED，不可無聲等候。回覆只要五行摘要加 REPORT 路徑。
