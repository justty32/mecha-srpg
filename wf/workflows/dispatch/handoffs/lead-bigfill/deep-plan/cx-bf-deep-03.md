# 任務：在隔離 worktree 只新增 10 個 lore 檔，補深歐洲／內海的人與畫面（batch bf-deep-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書摘要**；REPORT 開頭「已讀清單」，以下每個路徑原樣列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/base/bodyplans/alien-breakwater-clinger.json`、`content/base/frames/anvil-hoist-ii.json`、`content/base/frames/bulwark-i.json`、`content/base/frames/innersea-counterseal-ii.json`、`content/base/species/breakwater-clinger.json`、`content/base/world/models/anvil-hoist-ii.json`、`content/base/world/models/bulwark-i.json`、`content/base/world/models/innersea-counterseal-ii.json`、`content/lore/characters/claire-renaud.json`、`content/lore/characters/lena-visser.json`、`content/lore/characters/marta-bellini.json`、`content/lore/characters/oskar-lind.json`、`content/lore/eras/league.json`、`content/lore/factions/anvil.json`、`content/lore/factions/euro-umbrella.json`、`content/lore/factions/inner-sea-houses.json`、`content/lore/factions/salt-gull.json`、`content/lore/places/genoa-yards.json`、`content/lore/places/hamburg.json`、`content/lore/places/rotterdam-roost.json`、`content/lore/places/saint-malo.json`、`content/lore/places/skagerrak-shell.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/cx-bf-deep-03.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`。相對路徑相對 worktree 根；本稿與共同規格從主 repo 唯讀。本輪必讀 deep-rulings.md；與第一輪計畫或其他規格衝突時，以該裁定為準。

## 背景與唯一目標

本批只完成下列 10 件（歐洲／內海）。既有基調修正已補過的二名夜、哀悼與制度不重演；用地方人物補深已有畫面。只新增 content 檔，所有年表與反向關聯改動寫成報告資料，領導最後合併。人物、事件與地點同批可直接互引，其他批新檔不得直接引用。

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

不做：本批清單以外任何檔；不寫 content/base、src、test、specs、content/index、content/batches；wf 只准寫報告目錄；不寫月面、塞勒涅本部、萬潮葬王與吉大港北行；不刪檔、不 commit。筆記與臨時腳本放 `/tmp/cx-bf-deep-03/`。

件數 gate：content 新檔固定 10，修改既有檔固定 0；超出就停下回報。容量 gate：每件 body 300–1500 字；超過 1500 字先精簡，無法縮回則停下回報，不擴寫旁支。

## 逐檔規格

光代號：a＝獸有形體與動作；b＝引號內能吼出的話；c＝古代機／墟／骸片的光或聲被看見、聽見。a、b可並存。燈腹是物種，不是照明物件；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈每種全計畫核心最多一件。僅01的鳴崖碎燈夜獲配燈，其餘配額皆不使用；禁止擅自把背景小物升為核心。

格式照 lore README。每檔 id、name 由本節標題指定；summary 與關聯欄位值照規格，body 才由工人寫成全文。事件不加 gameRefs／aka；人物與地點可有 gameRefs。所有人物為 human，born 不明，不捏造出生年。地點 world earth；地方為既有城內設施或危險區外小據點，不增加新城邦、新裂縫。事件 body 用三至五個小節；地點沿用「地貌與氣味／誰在這裡／發生過什麼／2108 的狀態／獵團能在這裡幹什麼」。

### 1. `content/lore/characters/niek-vos.json`「尼克・沃斯」（提案）

id `character/niek-vos`；類型 `characters`；類別 A。定位：人：怕水的護駁駕駛把機甲踏向浪邊，喊「岸還在！」。 掛點：G／F；底色1.4；鹿特丹沉堤後果。

光與核心：`{"光":["b"],"核心":"怕水的護駁駕駛把機甲踏向浪邊，喊「岸還在！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"岸還在！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/rotterdam-roost.json`。

body 要點（依下列三至五句展開，不加新具名角色）：尼克在鹿特丹交班時從不看腳下深水，莉娜知道他怕水仍把護駁位置留給他。 站起來的瞬間是糧駁撞偏，他讓堅盾-I型踏到岸緣承住船側，吼「岸還在！」讓船員重新靠岸。 他的機甲沒有水下作戰能力，這份勇氣只夠他站住岸邊；人物篇不重寫下一件抱樁退船夜。

固定欄位值：
```json
{"born":"不明","faction":"faction/salt-gull","role":"鹿特丹護駁駕駛","kind":"human","relations":[{"character":"character/lena-visser","relation":"地方往來","note":"莉娜指泊位，尼克在岸上替偏航糧駁穩住船側。"}],"events":["event/roost-pier-grip"],"aka":[],"tags":["人物","歐洲／內海"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"怕水的護駁駕駛把機甲踏向浪邊，喊「岸還在！」。"}
```

本文需自然連至：`place/rotterdam-roost`、`character/lena-visser`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/lena-visser.json","jsonPath":"$.relations","op":"append","value":{"character":"character/niek-vos","relation":"地方往來","note":"莉娜指泊位，尼克在岸上替偏航糧駁穩住船側。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：怕水的護駁駕駛把機甲踏向浪邊，喊「岸還在！」。

### 2. `content/lore/events/roost-pier-grip.json`「鷗巢纏樁夜」（提案）

id `event/roost-pier-grip`；類型 `events`；類別 A。定位：獸：抱樁從鹿特丹海側纏上樁腳，糧駁的船腹開始往牠那邊斜。 掛點：G／F；底色1.4；自由城市的一夜到。

光與核心：`{"光":["a"],"核心":"抱樁從鹿特丹海側纏上樁腳，糧駁的船腹開始往牠那邊斜。","受限物件":[],"獸在世界裡":true,"物種":["species/breakwater-clinger"],"戰鬥職":false,"招牌話":""}`。來源：`content/base/species/breakwater-clinger.json`、`content/base/bodyplans/alien-breakwater-clinger.json`、`content/lore/places/rotterdam-roost.json`。

body 要點（依下列三至五句展開，不加新具名角色）：C級抱樁從海側繞住殘樁，裸露的肢體壓向糧駁，船板發出長裂聲。 尼克在乾岸用堅盾-I型頂正船側，莉娜先把卸糧工撤離，留給獵手處置獸體。 本夜保住人與一條退船路，不清空整個港灣，不給抱樁新增二名。

固定欄位值：
```json
{"date":"2107-05","period":"era/league","kind":"其他","factions":["faction/salt-gull"],"characters":["character/niek-vos","character/lena-visser"],"places":["place/rotterdam-roost"],"consequences":["鹿特丹暫停使用被抱樁侵入的殘樁泊位。"],"tags":["tide"],"visibility":"public","summary":"抱樁從鹿特丹海側纏上樁腳，糧駁的船腹開始往牠那邊斜。"}
```

本文需自然連至：`place/rotterdam-roost`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-05","title":"鷗巢纏樁夜","summary":"抱樁從鹿特丹海側纏上樁腳，糧駁的船腹開始往牠那邊斜。","event":"event/roost-pier-grip","era":"era/league","factions":["faction/salt-gull"],"tags":["tide"]}`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/lena-visser.json","jsonPath":"$.events","op":"append","value":"event/roost-pier-grip","why":"補參與人反向事件引用；possible不轉成既定歷史。"}]`。

review 白話：抱樁從鹿特丹海側纏上樁腳，糧駁的船腹開始往牠那邊斜。

### 3. `content/lore/characters/solene-le-goff.json`「索蓮・勒戈夫」（提案）

id `character/solene-le-goff`；類型 `characters`；類別 A。定位：人：索蓮把拐杖留給同伴，重新開上守門機，喊「門缺一人，我補！」。 掛點：F；既有九門同喪後果；底色1.11、1.12。

光與核心：`{"光":["b"],"核心":"索蓮把拐杖留給同伴，重新開上守門機，喊「門缺一人，我補！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"門缺一人，我補！"}`。來源：`content/base/world/models/bulwark-i.json`、`content/base/frames/bulwark-i.json`、`content/lore/places/saint-malo.json`。

body 要點（依下列三至五句展開，不加新具名角色）：索蓮舊傷使她走路不穩，克萊兒替她看住拐杖，她不把傷說成光榮勳章。 站起來的瞬間是輪守缺人，她爬進堅盾-I型座艙，吼「門缺一人，我補！」，機腳比她自己的腳先站直。 她復役只做有限巡牆，不冒領九門同喪的命名與戰果，換班後仍得用杖。

固定欄位值：
```json
{"born":"不明","faction":"faction/euro-umbrella","role":"聖馬洛傷後復役駕駛","kind":"human","relations":[{"character":"character/claire-renaud","relation":"地方往來","note":"雷諾在城內替她保管下機要用的拐杖。"}],"events":["event/malo-return-to-the-breach"],"aka":[],"tags":["人物","歐洲／內海"],"gameRefs":["base:frame/bulwark-i"],"visibility":"public","mech":"堅盾-I型","summary":"索蓮把拐杖留給同伴，重新開上守門機，喊「門缺一人，我補！」。"}
```

本文需自然連至：`place/saint-malo`、`character/claire-renaud`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/claire-renaud.json","jsonPath":"$.relations","op":"append","value":{"character":"character/solene-le-goff","relation":"地方往來","note":"雷諾在城內替她保管下機要用的拐杖。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：索蓮把拐杖留給同伴，重新開上守門機，喊「門缺一人，我補！」。

### 4. `content/lore/events/malo-return-to-the-breach.json`「缺門有人」（提案）

id `event/malo-return-to-the-breach`；類型 `events`；類別 A。定位：光：聖馬洛守門機再度跨過舊缺口，索蓮喊「人回來了，門就有！」。 掛點：F；2107九門同喪後果；底色1.12。

光與核心：`{"光":["b"],"核心":"聖馬洛守門機再度跨過舊缺口，索蓮喊「人回來了，門就有！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"人回來了，門就有！"}`。來源：`content/lore/places/saint-malo.json`。

body 要點（依下列三至五句展開，不加新具名角色）：九門同喪之後的有限巡牆，索蓮把堅盾-I型停在舊缺門，機足不自覺停了很久。 她終於吼「人回來了，門就有！」，克萊兒在牆後應聲，既有傷口沒有因此消失。 本夜不新增獸襲，畫面止於一台傷後復役的機甲跨過缺口；不把人聲變成異能。

固定欄位值：
```json
{"date":"2107-11","period":"era/league","kind":"其他","factions":["faction/euro-umbrella"],"characters":["character/solene-le-goff","character/claire-renaud"],"places":["place/saint-malo"],"consequences":["聖馬洛在舊缺門恢復有限的機甲巡守。"],"tags":["地方史"],"visibility":"public","summary":"聖馬洛守門機再度跨過舊缺口，索蓮喊「人回來了，門就有！」。"}
```

本文需自然連至：`place/saint-malo`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-11","title":"缺門有人","summary":"聖馬洛守門機再度跨過舊缺口，索蓮喊「人回來了，門就有！」。","event":"event/malo-return-to-the-breach","era":"era/league","factions":["faction/euro-umbrella"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/claire-renaud.json","jsonPath":"$.events","op":"append","value":"event/malo-return-to-the-breach","why":"補參與人反向事件引用；possible不轉成既定歷史。"}]`。

review 白話：聖馬洛守門機再度跨過舊缺口，索蓮喊「人回來了，門就有！」。

### 5. `content/lore/characters/anke-rehm.json`「安珂・雷姆」（提案）

id `character/anke-rehm`；類型 `characters`；類別 A。定位：人：安珂將機甲肩架扛進倒塌的機庫，喊「先卸人，再卸鐵！」。 掛點：C／G；底色1.3、1.12；鐵砧修造生活。

光與核心：`{"光":["b"],"核心":"安珂將機甲肩架扛進倒塌的機庫，喊「先卸人，再卸鐵！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"先卸人，再卸鐵！"}`。來源：`content/base/world/models/anvil-hoist-ii.json`、`content/base/frames/anvil-hoist-ii.json`、`content/lore/places/hamburg.json`。

body 要點（依下列三至五句展開，不加新具名角色）：安珂是漢堡拖機駕駛，平時只惦記機庫工人的站位，奧斯卡認得她滿袖的鉚釘屑。 站起來的瞬間是吊架歪倒，她開鐵砧-II型・吊鉚頂住架身，吼「先卸人，再卸鐵！」，不肯先保全機件。 人全出來後她才承認肩架已壞；她是修造生活裡的駕駛，不取代鐵砧既有王牌。

固定欄位值：
```json
{"born":"不明","faction":"faction/anvil","role":"漢堡機庫拖機駕駛","kind":"human","relations":[{"character":"character/oskar-lind","relation":"地方往來","note":"交機時替對方指認工人真正卡住的傷件。"}],"events":["event/hamburg-ember-shoulder"],"aka":[],"tags":["人物","歐洲／內海"],"gameRefs":["base:frame/anvil-hoist-ii"],"visibility":"public","mech":"鐵砧-II型・吊鉚","summary":"安珂將機甲肩架扛進倒塌的機庫，喊「先卸人，再卸鐵！」。"}
```

本文需自然連至：`place/hamburg`、`character/oskar-lind`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/oskar-lind.json","jsonPath":"$.relations","op":"append","value":{"character":"character/anke-rehm","relation":"地方往來","note":"交機時替對方指認工人真正卡住的傷件。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：安珂將機甲肩架扛進倒塌的機庫，喊「先卸人，再卸鐵！」。

### 6. `content/lore/events/hamburg-ember-shoulder.json`「燼肩托架」（提案）

id `event/hamburg-ember-shoulder`；類型 `events`；類別 A。定位：光：漢堡機庫的燼從機肩噴出，工人吼「鐵可以再造！」，把同伴拖離架底。 掛點：C；底色1.3、1.12。

光與核心：`{"光":["b"],"核心":"漢堡機庫的燼從機肩噴出，工人吼「鐵可以再造！」，把同伴拖離架底。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"鐵可以再造！"}`。來源：`content/lore/places/hamburg.json`。

body 要點（依下列三至五句展開，不加新具名角色）：歪倒的吊架壓住鐵砧-II型・吊鉚肩部，排燼噴口在機庫頂畫出一道紅痕。 安珂留在座艙，奧斯卡帶著工人吼「鐵可以再造！」，把尚未爬出的同伴從架底拖走。 燼光沒有治好受傷的人，肩架報廢、修造停工，代價照留。

固定欄位值：
```json
{"date":"2107-03","period":"era/league","kind":"其他","factions":["faction/anvil"],"characters":["character/anke-rehm","character/oskar-lind"],"places":["place/hamburg"],"consequences":["漢堡機庫停工更換吊架與報廢機肩。"],"tags":["地方史"],"visibility":"public","summary":"漢堡機庫的燼從機肩噴出，工人吼「鐵可以再造！」，把同伴拖離架底。"}
```

本文需自然連至：`place/hamburg`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-03","title":"燼肩托架","summary":"漢堡機庫的燼從機肩噴出，工人吼「鐵可以再造！」，把同伴拖離架底。","event":"event/hamburg-ember-shoulder","era":"era/league","factions":["faction/anvil"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/oskar-lind.json","jsonPath":"$.events","op":"append","value":"event/hamburg-ember-shoulder","why":"補參與人反向事件引用；possible不轉成既定歷史。"}]`。

review 白話：漢堡機庫的燼從機肩噴出，工人吼「鐵可以再造！」，把同伴拖離架底。

### 7. `content/lore/characters/elia-conti.json`「埃利亞・孔蒂」（提案）

id `character/elia-conti`；類型 `characters`；類別 A。定位：人：埃利亞替別人的合印試機，出塢前總喊「把名字留在這一步！」。 掛點：C／G；底色1.3、1.12；內海工坊的地方生活。

光與核心：`{"光":["b"],"核心":"埃利亞替別人的合印試機，出塢前總喊「把名字留在這一步！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":true,"招牌話":"把名字留在這一步！"}`。來源：`content/base/world/models/innersea-counterseal-ii.json`、`content/base/frames/innersea-counterseal-ii.json`、`content/lore/places/genoa-yards.json`。

body 要點（依下列三至五句展開，不加新具名角色）：埃利亞是買不起自己所試機型的雇工，每回都先讓瑪塔報出修造者的位置。 站起來的瞬間是機腳偏斜，他制住合印-II型等工人離開，再吼「把名字留在這一步！」讓修它的人看第一次落足。 豪語出自駕駛，不是低階機魂；他不取得家族繼承權，也不發表新機型。

固定欄位值：
```json
{"born":"不明","faction":"faction/inner-sea-houses","role":"熱那亞工坊試機駕駛","kind":"human","relations":[{"character":"character/marta-bellini","relation":"地方往來","note":"瑪塔修造，他在座艙裡把接縫受力的感覺報回。"}],"events":["event/genoa-first-footfall"],"aka":[],"tags":["人物","歐洲／內海"],"gameRefs":["base:frame/innersea-counterseal-ii"],"visibility":"public","mech":"合印-II型","summary":"埃利亞替別人的合印試機，出塢前總喊「把名字留在這一步！」。"}
```

本文需自然連至：`place/genoa-yards`、`character/marta-bellini`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/marta-bellini.json","jsonPath":"$.relations","op":"append","value":{"character":"character/elia-conti","relation":"地方往來","note":"瑪塔修造，他在座艙裡把接縫受力的感覺報回。"},"why":"既有人物反向連到本地新人物，不變更其職業。"}]`。

review 白話：埃利亞替別人的合印試機，出塢前總喊「把名字留在這一步！」。

### 8. `content/lore/events/genoa-first-footfall.json`「出塢一踏」（提案）

id `event/genoa-first-footfall`；類型 `events`；類別 A。定位：光：若合印跨出熱那亞乾塢，修造者會齊喊「我們造的，站起來！」。 掛點：C；底色1.3、1.12。

光與核心：`{"光":["b"],"核心":"若合印跨出熱那亞乾塢，修造者會齊喊「我們造的，站起來！」。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":"我們造的，站起來！"}`。來源：`content/lore/places/genoa-yards.json`。

body 要點（依下列三至五句展開，不加新具名角色）：可能的一次試機中，埃利亞先停下偏斜的合印-II型，讓瑪塔與工人重排墊木。 機甲若終於落足，工人便喊「我們造的，站起來！」，乾塢積水映出從下方望去的大影子。 結果保持possible；落足只是修復後首試，不新增機型能力或必然成功的典禮。

固定欄位值：
```json
{"date":"2108-02","period":"era/league","kind":"其他","factions":["faction/inner-sea-houses"],"characters":["character/elia-conti","character/marta-bellini"],"places":["place/genoa-yards"],"consequences":["若發生，工坊會保留首試的磨痕供下次修造參照。"],"tags":["rumor"],"visibility":"public","occurs":"possible","summary":"若合印跨出熱那亞乾塢，修造者會齊喊「我們造的，站起來！」。"}
```

本文需自然連至：`place/genoa-yards`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：是；正文用「可能／若發生」，不回寫成已發生歷史。

年表建議：`"不入確定年表；possible只留候選鉤子"`。

插入需求（僅寫報告）：`[{"file":"content/lore/characters/marta-bellini.json","jsonPath":"$.events","op":"append","value":"event/genoa-first-footfall","why":"補參與人反向事件引用；possible不轉成既定歷史。"}]`。

review 白話：若合印跨出熱那亞乾塢，修造者會齊喊「我們造的，站起來！」。

### 9. `content/lore/events/skagerrak-black-ridge.json`「黑脊映面」（提案）

id `event/skagerrak-black-ridge`；類型 `events`；類別 C。定位：光：接哨者在北海退潮時看見埃吉爾的濕亮刻痕，整船人忽然不再爭誰先靠岸。 掛點：B；N04後果；2102出土、2105爭奪後守望。

光與核心：`{"光":["c"],"核心":"接哨者在北海退潮時看見埃吉爾的濕亮刻痕，整船人忽然不再爭誰先靠岸。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/skagerrak-shell.json`。

body 要點（依下列三至五句展開，不加新具名角色）：沿既有斯卡蓋拉克地貌，退潮露出的黑脊覆著海藻，月光使裝甲刻痕濕亮如一道冷刃。 一船接哨工原本擠著要先上礁，看清海下古代機的尺度後靜下來，輪流把人送岸。 黑脊未移、埃吉爾未認人；不新增抵押或拆件，不預占既有possible事件裡的丹麥技工。

固定欄位值：
```json
{"date":"2107-09","period":"era/league","kind":"其他","factions":["faction/salt-gull"],"characters":[],"places":["place/skagerrak-shell"],"consequences":["接哨者留下退潮時看清黑脊刻痕的共同記憶。"],"tags":["地方史"],"visibility":"public","summary":"接哨者在北海退潮時看見埃吉爾的濕亮刻痕，整船人忽然不再爭誰先靠岸。"}
```

本文需自然連至：`place/skagerrak-shell`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`{"date":"2107-09","title":"黑脊映面","summary":"接哨者在北海退潮時看見埃吉爾的濕亮刻痕，整船人忽然不再爭誰先靠岸。","event":"event/skagerrak-black-ridge","era":"era/league","factions":["faction/salt-gull"],"tags":["地方史"]}`。

插入需求（僅寫報告）：`"無既有欄位要補；以本文連結作地方入口，不擴充schema。"`。

review 白話：接哨者在北海退潮時看見埃吉爾的濕亮刻痕，整船人忽然不再爭誰先靠岸。

### 10. `content/lore/places/skagerrak-cold-reflection.json`「北海冷照屋」（提案）

id `place/skagerrak-cold-reflection`；類型 `places`；類別 C。定位：光：北海外圈浮屋的開口對著古墟，月光中的裝甲刻痕映在換哨者臉上。 掛點：B；N04後果；2105斯卡蓋拉克事件。

光與核心：`{"光":["c"],"核心":"北海外圈浮屋的開口對著古墟，月光中的裝甲刻痕映在換哨者臉上。","受限物件":[],"獸在世界裡":false,"物種":[],"戰鬥職":false,"招牌話":""}`。來源：`content/lore/places/skagerrak-shell.json`。

body 要點（依下列三至五句展開，不加新具名角色）：浮屋是既有警戒外側的短停處，開口朝向海下黑脊，能看見埃吉爾濕亮刻痕映出的冷光。 哨工在木面上描下自己看見的一筆，另一人指給他看真正刻痕的大小，兩個人的手影都小得可笑。 屋不作開採站，不新增古代機動作、聲音或認主，風浪時也不能保證可用。

固定欄位值：
```json
{"region":"歐洲・斯卡蓋拉克之墟警戒外側水面","continent":"歐洲","world":"earth","kind":"其他","status2108":"換哨時有人停靠，不能保證風浪時可用","factions":["faction/salt-gull"],"aka":[],"tags":["地方","歐洲／內海"],"gameRefs":[],"visibility":"public","summary":"北海外圈浮屋的開口對著古墟，月光中的裝甲刻痕映在換哨者臉上。"}
```

本文需自然連至：`place/skagerrak-shell`。地點只作本文連結，不擅加人物 places 或地點 characters 欄。

可見度：public；可見現象不解釋來源，不另造秘密。occurs: possible：否；省略 occurs。

年表建議：`"不新增年表；人物／地點接既有歷史"`。

插入需求（僅寫報告）：`[{"file":"content/lore/factions/salt-gull.json","jsonPath":"$.places","op":"append","value":"place/skagerrak-cold-reflection","why":"只增加地點導航，不賦予古代機所有權。"}]`。

review 白話：北海外圈浮屋的開口對著古墟，月光中的裝甲刻痕映在換哨者臉上。

### 既有檔的插入需求

本批不套用插入。把逐檔建議中的物件依原值寫到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/inserts.json`：wf-table/1，columns `['file','jsonPath','op','value','why']`；op 只有 append／setKey。新年表條目寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/timeline-add.json`：wf-table/1，columns `['date','title','summary','event','era','factions','tags']`。沒有資料也交空表。

年表「既有條目補event」只進 inserts，不重複進 timeline-add；索引為盤點快照，why 保留 date＋title，由合併線重新定位且只加缺少的鍵。possible 事件不進確定年表。跨批新引用只可提出插入需求，本批 content 不直接引用；本稿目前沒有跨批依賴。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree 開始前留基線，每寫完一檔及收尾跑；對照新增警告來源 |
| `npm run check` | 全部寫完跑一次，末行 OK 0 errors；不跑 npm test，領導收批時跑 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查索引與年表、寫報告資料表；timeline 用 load 後取 meta.entries 的唯讀視圖 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-03 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/`；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/`。只可新增本批清單與報告四檔，.git 唯讀，不 commit。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 rm -rf；不改 ~/.codex/config.toml；不安裝依賴；不碰 .gitignore；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它做實質工作也要親讀先讀清單，受相同範圍約束，REPORT 記使用情況。
- **分清錯誤來源**：點名工具本身壞掉、沙箱拒寫發 BLOCKED；自己打錯指令或暫存腳本出錯自己修。

## 工作

1. 讀先讀清單，記錄 lore check 基線，確認領導已準備隔離 worktree 與正式 manifest；上線發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-03 --up PROGRESS '已讀完先讀清單，開始寫 bf-deep-03' < /dev/null`。
2. 依逐檔規格寫檔；有同批互引時先建齊最小合法 JSON 再補 body，過程的尚未建立引用須於收尾清零。不修改原檔解決引用。
3. 跑下列固定檢查，寫四份報告資料。
4. 發終局回報；每完成一步讀 orders。

## 交付

REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/REPORT.md`（如檔名被擋則同目錄 report.md）。另交 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/review-rows.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/inserts.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/timeline-add.json`。新增內容檔位於 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/`，清單如下：

- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/characters/niek-vos.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/events/roost-pier-grip.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/characters/solene-le-goff.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/events/malo-return-to-the-breach.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/characters/anke-rehm.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/events/hamburg-ember-shoulder.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/characters/elia-conti.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/events/genoa-first-footfall.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/events/skagerrak-black-ridge.json`
- `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-03/content/lore/places/skagerrak-cold-reflection.json`

review-rows 契約 wf-table/1，columns `['檔','類別','名稱','白話','掛到']`；10 列，檔為 repo 相對路徑、名稱加（提案）、白話 ≤60 字。REPORT 開頭逐行列已讀路徑，再四段「做了什麼」「產出」「沒做到或證據不足的」「需要決定的事」，末尾「以後交接書該點名的工具」。新名字、矛盾、年表待併警告逐項列出，不把它們隱藏成全庫已無警告。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree `node content/lore/check.ts` errors=0；新增警告只容許本批尚待合併年表之事件未列年表，白名單 ["event/roost-pier-grip","event/malo-return-to-the-breach","event/hamburg-ember-shoulder","event/skagerrak-black-ridge"]，逐件在 REPORT 附來源與 timeline-add／inserts 對應，不容許其他新增警告。
2. worktree `npm run check` 末行含 OK 0 errors。
3. 固定 10 個新 content 檔存在，檔名=id name段；本線沒有改任何既有檔，差異範圍僅本批檔與報告（領導以 content_gate 驗）。
4. REPORT 有已讀清單；review-rows 合法、10 列、白話≤60字；inserts 與 timeline-add 合法且符合上述欄位，沒有直接寫入既有檔。

不要為了更保險加驗其他東西。上述年表警告是只新增與延後合併的已知結果，領導套用後再消除；不能先改 timeline 讓本批警告變少。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**：在授權檔內修到過，修不好發 FAILED 並寫證據。
- **測不出來**：指令未跑成或拿不到證據，不回滾，保持現狀發 BLOCKED，寫卡點與解除條件；不拿舊輸出當新證據。

## 完成／阻塞回報（必做）

我是誰：`cx-bf-deep-03`；團隊 `teams/bigfill`；上游 lead-bigfill。上線先發 PROGRESS。

終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-03 --up DONE 'bf-deep-03 新增 10 件，lore check 0 錯，插入需求已列' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-03/REPORT.md`。STATUS 與標題照實際結果換。

結束必發 DONE／BLOCKED／NEEDS-USER／FAILED 之一；卡住超過十分鐘先發 BLOCKED，不可無聲等候。回覆只要五行摘要加 REPORT 路徑。
