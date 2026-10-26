# 任務：在隔離 worktree 只新增 12 個月面 lore 檔——穹頂奇觀、月弓與罷工對峙（batch bf-moon-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要；REPORT 開頭列「已讀清單」，每個路徑原樣出現）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/d-moon.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`、`content/lore/places/tranquility-city.json`、`content/lore/places/moonbow.json`、`content/lore/events/chaebol-ascent.json`、`content/lore/events/tranquility-strike.json`、`content/lore/events/whiteglove-incident.json`、`content/lore/factions/whitegloves.json`、`content/lore/factions/selene.json`、`content/lore/factions/ground-union.json`；另在主 repo 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/cx-bf-moon-01.md`。相對路徑都相對 worktree；若檔案已由整理線搬移，以主 repo 查現存同份檔並在 REPORT 記替代路徑，不跳過內容。

## 背景與唯一目標

塞勒涅是中型公司，替穹頂下的錢當管家。錢的主人是三股匿名富豪群像，不是公司的無限金庫。本批依已審月面計畫補「穹頂奇觀、月弓與罷工對峙」，只新增下面12檔；已有歷史不推翻，古代機不動，不替任何人指定認主。不新增地球人物、城市或第四個渡月港。靜海仍是唯一月城，所有月面新地點都是既有城區或封鎖線外勤務點。本稿已依第2輪 moon-rulings.md 重寫；與計畫有衝突時裁定優先，不自行增件。

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

新增只限 worktree 下這12檔：`content/lore/places/tranquility-ferry-port.json`、`content/lore/places/earthward-gallery.json`、`content/lore/places/prism-stair.json`、`content/lore/places/moonbow-shift-house.json`、`content/lore/places/lunar-glass-garden.json`、`content/lore/factions/dome-households.json`、`content/lore/characters/eira-vey.json`、`content/lore/characters/han-yeon.json`、`content/lore/characters/lin-shuqin.json`、`content/lore/events/rain-under-glass.json`、`content/lore/events/moonbow-silent-line.json`、`content/lore/events/whitewall-at-gate.json`。

**只新增、不改既有檔**，含年表、勢力places、索引與manifest都不改。對既有檔的需求寫報告 `inserts.json` 與 `timeline-add.json`，領導合併。只引用 HEAD 已有 id 或同批新檔；跨批新 id 不寫進內容，改列 inserts。

不做：上列以外的任何 content 檔、content/base、content/index、content/batches、src、test、schemas、specs、設定筆記、wf其他檔；不新增規格外人名、公司名、機體名與招式。不要寫地球新地點與人物、不要碰萬潮葬王。筆記腳本只放 `/tmp/cx-bf-moon-01/`。不 commit。

件數 gate：新增超過12檔或碰到任何既有內容檔，停下回報，不靠擴範圍處理；本批不超過15檔上限。容量 gate：任一新檔 body 超過1500字，停下回報；本文目標300–1500字。任一 gate 觸發都停。

## 逐檔規格

格式照 content/lore/README.md。下列欄位值固定；通用 `body` 依要點寫，`summary` 一句世界內敘述，`name` 使用指定中文；`aka: []` 不自行填回譯英文。地點用「地貌與氣味／誰在這裡／發生過什麼／2108的狀態／獵團能在這裡幹什麼」五節，事件3–5小節，人物先一件做過的事；小群體不是大勢力，不補古代機藍本或機甲血統。新角色在月面居住與工作，往返船員仍以靜海為家。尚未發生的事件只寫條件與可能後果。

### 1. `content/lore/places/tranquility-ferry-port.json`「靜海渡月港」（提案）

id：`place/tranquility-ferry-port`；類型：地點。一句定位：渡月船拖光尾落進靜海，地勤舉起雙臂，把離家的人接進白城。 掛點：D；2066 定班、2096 赤道港協定；N07。

欄位值：`region`＝`"月面・靜海市港區"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"港"`；`status2108`＝`"弦月通航，地勤在白光中接班"`；`factions`＝`["faction/selene","faction/ground-union","faction/whitegloves"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「靜海渡月港」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：渡月船拖光尾落架，灰原與接船者的雙臂一同亮起。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）從渡月船落架寫起，光尾把整片灰原照白，地勤舉臂指向泊位。 （2）旅客在密封踏板上分流，富客有人領路，返工者自己扛行李；畫面只收在港。 （3）它是既有靜海市港區的近景，不增第四個地球港、不取代城市主檔。 （4）七號回港只提原事件留下的空泊位記憶，不再演一次回港或新增醒魂。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「靜海渡月港」（提案）；英文原意 Tranquility Arrival，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/selene.json","jsonPath":"$.places","op":"append","value":"place/tranquility-ferry-port","why":"補同一勢力的月面活動地點；若已存在則略過"},{"file":"content/lore/factions/ground-union.json","jsonPath":"$.places","op":"append","value":"place/tranquility-ferry-port","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 2. `content/lore/places/earthward-gallery.json`「望地長廊」（提案）

id：`place/earthward-gallery`；類型：地點。一句定位：富戶把整顆地球框進長廊，受僱者抬著巨幕，把別人的故鄉遮住。 掛點：D；2041 靜海市、2092 財閥上月；magnates。

欄位值：`region`＝`"月面・靜海市觀景穹頂"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"住戶宴會與迎客時局部專用"`；`factions`＝`["faction/selene"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「望地長廊」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：地球被宮門般的窗框與鏡面長河包圍。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先讓巨幕沿長廊升起，窗框像宮門，懸在黑天的地球成了廳內最大的畫。 （2）廳裡的鏡面把藍光折成長河，住戶為一次迎客就讓受僱者重排整座廳。 （3）錢表現在能獨占景色與耗費人力，不列價格，不點名富戶或公司品牌。 （4）散場時工人把幕落回去，地球仍懸在原處；靜海不寫成日常地球升落。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「望地長廊」（提案）；英文原意 Terra Framed，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 3. `content/lore/places/prism-stair.json`「分光階」（提案）

id：`place/prism-stair`；類型：地點。一句定位：穹頂的七色光落在侍役搬景的階上，台上換一個白晝，階下便換一班人。 掛點：D；2092 財閥上月；底色 1.2、1.13 D。

欄位值：`region`＝`"月面・靜海市住宅穹頂內勤層"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"受僱者輪班搬景，階頂接住戶廳堂"`；`factions`＝`["faction/selene","faction/ground-union"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「分光階」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：搬景工沿穹頂分出的七色光帶上階。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）彩色幕片從階頂放下，穹頂白光被切成滿階色帶，搬景工沿光帶向上走。 （2）此處是住宅穹頂的內勤通道，連到接待廳與花房，不是新城市或神祕設施。 （3）富戶想換季就換布景，侍役的汗與同一張排班單留在階下。 （4）艾拉先把笨重幕架接住再放同伴通過，光很奢侈，承重的仍是人的肩。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「分光階」（提案）；英文原意 Prismatic Stair，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/ground-union.json","jsonPath":"$.places","op":"append","value":"place/prism-stair","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 4. `content/lore/places/moonbow-shift-house.json`「月弓換班屋」（提案）

id：`place/moonbow-shift-house`；類型：地點。一句定位：月弓的光環逐節亮起，換班屋裡的人先喊清場，再看月壤奔向地球。 掛點：D；2043 月弓初射、2098 罷工；N04。

欄位值：`region`＝`"月面・靜海西緣月弓維修區"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"仍在換班，持工牌出入"`；`factions`＝`["faction/selene","faction/ground-union"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「月弓換班屋」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：月弓光環逐節亮起，月壤拖光奔向地球。 指定可吼句：弓要開了，退線！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）窗外光環接連亮起，屋裡的人把當班手牌翻面，喊「弓要開了，退線！」。 （2）從這道窗看月壤拖光遠去，不解釋月弓的機制或速度。 （3）舊屋在靜海西緣維修區，兩次停機留下空手牌；不改停機時長。 （4）下一班接住手牌，寫工人敬畏自己照看的巨弓，也知道它不會替人爭待遇。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「月弓換班屋」（提案）；英文原意 Bow Watch，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/ground-union.json","jsonPath":"$.places","op":"append","value":"place/moonbow-shift-house","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 5. `content/lore/places/lunar-glass-garden.json`「穹頂花房」（提案）

id：`place/lunar-glass-garden`；類型：地點。一句定位：巨樹的枝冠在穹頂藍光裡連成異鄉，園丁從樹影下推過自己的工具車。 掛點：D；2092 財閥上月；magnates 三股資本。

欄位值：`region`＝`"月面・靜海市住宅穹頂"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"富戶的移植庭園，園丁輪值"`；`factions`＝`["faction/selene"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「穹頂花房」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：穹頂藍光穿過巨樹枝冠，葉影碎成星。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）富戶把故鄉的樹移到月面，枝冠連成遮住廳頂的林，穹頂藍光在葉間碎成星。 （2）花房屬住宅區，沒有新增月面氣候或能養活全城的農業奇蹟。 （3）三股資本各留一片舊庭院，名字不出場，園丁每日穿過不屬於自己的樹影。 （4）韓妍讓工具車繞過垂枝；昂貴的故鄉由領薪的人維持，古代機與長生藥不涉入。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「穹頂花房」（提案）；英文原意 Canopy of Exiles，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 6. `content/lore/factions/dome-households.json`「穹頂住戶」（提案）

id：`faction/dome-households`；類型：勢力。一句定位：同一顆地球照著各家的舞廳，主人隔窗舉手，管家替他們把門打開。 掛點：D；N04、N09；magnates 穹頂下的錢。

欄位值：`type`＝`"其他"`；`scale`＝`"三股匿名資本的月面住戶群像，沒有共同首領"`；`founded`＝`"崩年陸續上月，非成立日"`；`hq`＝`"靜海市住宅穹頂"`；`ideology`＝`"窗外是地球，門內是家。"`；`places`＝`["place/lunar-glass-garden","place/earthward-gallery"]`；`relations`＝`[{"faction":"faction/selene","stance":"友好","note":"各家委託公司照管生活與款項，錢不歸公司統一持有。"},{"faction":"faction/ground-union","stance":"緊張","note":"靠受僱者維持穹頂，對工人的態度並不一致。"}]`；`leaders`＝`[]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「穹頂住戶」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：相鄰穹頂的舞廳一齊亮起，藍色地球映在每一道窗。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）從相鄰穹頂同時亮起的舞廳寫群像，有人不看地球，有人整夜要窗前留空。 （2）歐洲老錢、美國上月的資本與韓國財閥各自持有錢；合稱不是新公司或統一議會。 （3）受僱管事與保全替住戶開門，塞勒涅是中型管家公司，不變成操縱世界的幕後首腦。 （4）封鎖後住戶也害怕月面破裂；不讓他們知道人口真相，更不讓財富買到恩底彌翁的回應。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「穹頂住戶」（提案）；英文原意 Dome Households，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/places/tranquility-city.json","jsonPath":"$.factions","op":"append","value":"faction/dome-households","why":"補匿名住戶群像，不改公司實質統治"}]`。僅寫報告建議檔，不直接套用。
### 7. `content/lore/characters/eira-vey.json`「艾拉・維伊」（提案）

id：`character/eira-vey`；類型：人物。一句定位：艾拉在地球藍光裡截住滑落的巨幕，喊人退開；她管一座廳，錢卻不歸她。 掛點：D；N09；底色 1.2、1.13 D。

欄位值：`born`＝`"2071"`；`faction`＝`"faction/selene"`；`role`＝`"住宅穹頂受僱管事"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/han-yeon","relation":"同事","note":"共同維持廳堂與花房，都是領薪者。"}]`；`events`＝`["event/rain-under-glass"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「艾拉・維伊」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：地球藍光照著托住巨幕的管事。 指定可吼句：讓開，我接著！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先寫她在分光階托住滑下的幕架，喊「讓開，我接著！」，同伴才得以抽身。 （2）她是領薪的宅邸管事，負責廳堂與換景，沒有家族繼承權、股權或放款權。 （3）她能讓一場迎客準時開門，不能讓主人替受傷侍役多付一筆錢。 （4）望地長廊的藍光照著她重新站回門旁；她的果斷只及於身邊這班人。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「艾拉・維伊」（提案）；英文原意 Eira Vey，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 8. `content/lore/characters/han-yeon.json`「韓妍」（提案）

id：`character/han-yeon`；類型：人物。一句定位：韓妍攀上穹頂樹冠剪去病枝，身後是整片藍色地球，腳下是別人的故鄉。 掛點：D；2092 財閥上月；底色 1.4、1.8。

欄位值：`born`＝`"2068"`；`faction`＝`null`；`role`＝`"穹頂花房受僱園丁"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/eira-vey","relation":"同事","note":"管事調換景班，她管樹冠與植栽。"}]`；`events`＝`["event/rain-under-glass"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「韓妍」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：園丁立在樹冠間，背後一片地球藍光。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）她從枝架間接住落枝，手勢叫同伴避開，藍色地球的光穿過她身後的葉。 （2）她隨受僱工作來月面，照顧移植巨樹，不是富戶親族，也沒有新公司。 （3）住戶要樹冠永遠像崩前，她知道樹會病、工人會累，庭園並不會把過去變回來。 （4）她在玻璃雨宴後先照看被壓折的枝，不替任何家族把園丁的勞動署成主人恩賜。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「韓妍」（提案）；英文原意 Han Yeon，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 9. `content/lore/characters/lin-shuqin.json`「林淑琴」（提案）

id：`character/lin-shuqin`；類型：人物。一句定位：罷工後林淑琴敲響飯盆，朝月弓復亮的窗喊：活著的，坐過來！ 掛點：D；2098 靜海大罷工、2105 白手套事變；N07。

欄位值：`born`＝`"2059"`；`faction`＝`"faction/ground-union"`；`role`＝`"地勤會炊事員"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/park-incheol","relation":"工會同伴","note":"聽過兩次罷工的號召，沒有領導職。"}]`；`events`＝`["event/tranquility-strike","event/whiteglove-incident"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「林淑琴」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：復亮月弓的光照進傷者接飯的窗。 指定可吼句：活著的，坐過來！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）本計畫唯一以吃食為核心的一件：復工後她把飯盆敲響，喊「活著的，坐過來！」。 （2）月弓的光重回窗上，傷者伸手接飯，她不把復亮當成工人贏了。 （3）她是地勤會普通炊事員，不代替朴仁哲領導、洩影像或定死者名單。 （4）以她一面催人吃、一面為下一班留位置收尾；不另開飯堂地點與吃飯事件來重複此畫面。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「林淑琴」（提案）；英文原意 Lin Shuqin，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 10. `content/lore/events/rain-under-glass.json`「玻璃上的雨」（提案）

id：`event/rain-under-glass`；類型：事件。一句定位：富戶為一夜歡宴落下滿廳光雨，侍役在地球的倒影裡把巨幕拉到天頂。 掛點：D；2092 財閥上月；magnates。

欄位值：`date`＝`"2092"`；`period`＝`"era/mimic-dawn"`；`kind`＝`"其他"`；`factions`＝`["faction/selene","faction/dome-households"]`；`characters`＝`["character/eira-vey","character/han-yeon"]`；`places`＝`["place/earthward-gallery","place/lunar-glass-garden","place/prism-stair"]`；`consequences`＝`["受僱者記住了為一夜歡宴搭起整片雨景的工作。","移植庭園與迎客廳成了上月富戶維持舊生活的舞台。"]`；`tags`＝`["moon"]`。`name` 用「玻璃上的雨」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：整廳光雨與腳下地球倒影，巨幕被拉到天頂。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）財閥上月後的一場宴，以艾拉帶人把巨幕升到廳頂開場，地球的倒影鋪滿腳下。 （2）花房的水沿高玻璃落下，穹頂光把水痕照成銀色長雨，住戶在雨影裡起舞。 （3）核心是舞廳、光雨與造景人力，不寫菜餚、酒杯或後廚；錢讓人能在月上買一場故鄉雨。 （4）韓妍照看被布景壓折的枝，宴後工人拆回景片；不命名主人，不把雨寫成月面天候或古代異能。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「玻璃上的雨」（提案）；英文原意 Rain of Glass，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 11. `content/lore/events/moonbow-silent-line.json`「弓前不返工」（提案）

id：`event/moonbow-silent-line`；類型：事件。一句定位：月弓停亮後，地勤在人駕白甲前喊不返工，最後先退的是血肉那一排。 掛點：D；2098 靜海大罷工；N04→N07。

欄位值：`date`＝`"2098"`；`period`＝`"era/yoke-years"`；`kind`＝`"政治"`；`factions`＝`["faction/ground-union","faction/whitegloves","faction/selene"]`；`characters`＝`[]`；`places`＝`["place/tranquility-city","place/moonbow"]`；`consequences`＝`["港口人牆被盾列逼退，仍沿靜海大罷工既有結局。","不新增勝敗、死傷數或輪班讓步。"]`；`tags`＝`["moon"]`。`name` 用「弓前不返工」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：停亮的月弓在遠方，人牆喊聲撞上白色盾列。 指定可吼句：井裡有人，別叫我們回去！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）把鏡頭限在2098既有港口鎮壓的一段：月弓暗在遠方，人牆與白色盾列相對。 （2）人群喊「井裡有人，別叫我們回去！」，對面仍是有人坐在座艙裡的無核心女武神原型。 （3）盾向前，人群先退；工人扶著同伴退離通道，不新增反殺、死亡名單或反敗為勝。 （4）收束到原事件的罷工終結、輪班縮短與影像外洩，不重定先後細節，不把人駕原型改成鐵偶。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「弓前不返工」（提案）；英文原意 Before the Silent Bow，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 12. `content/lore/events/whitewall-at-gate.json`「白牆先踏一步」（提案）

id：`event/whitewall-at-gate`；類型：事件。一句定位：鐵偶從港閘白光裡踏出，人牆喊別退；凡鐵矢落下，地勤先退進維修井。 掛點：D；2105 白手套事變；N07。

欄位值：`date`＝`"2105"`；`period`＝`"era/tide-line"`；`kind`＝`"戰役"`；`factions`＝`["faction/ground-union","faction/whitegloves","faction/selene"]`；`characters`＝`["character/park-incheol"]`；`places`＝`["place/tranquility-ferry-port","place/moonbow"]`；`consequences`＝`["地勤先退進維修井，沿白手套事變原有敗局。","這一刻留下人牆面對無魂鐵偶的記憶，不另立戰役。"]`；`tags`＝`["moon"]`。`name` 用「白牆先踏一步」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：鐵偶從港閘白光中列隊踏出，凡鐵矢打散工具。 指定可吼句：人還在這裡，別退！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）取2105罷工弦月夜港口進場的一刻，白手套無人鐵偶從閘光裡列成白牆。 （2）地勤喊「人還在這裡，別退！」，鐵偶同聲通告「請確認償還意願」，不是機魂合唱或招式。 （3）依原史凡鐵矢落向工具、門與腿，人牆先退入月弓維修井；不寫成擊潰鐵偶或逼公司認輸。 （4）後果接原事件的通氣閥被關、罷工被鎮壓與朴仁哲失去一腿；不補斷腿機制，不揭搬魂秘密，不給後方操作者新面孔。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「白牆先踏一步」（提案）；英文原意 The White Wall Steps，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree寫前記baseline，12檔齊後跑；0錯，warnings不得高於baseline |
| `npm run check` | 12檔齊後一次，末行OK 0 errors；工人不用npm test，領導按manifest驗收 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查資料表、寫review與插入建議；年表entries可先用tabledb.load＋Table在記憶體轉接後條件查，不整份輸出 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-moon-01 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：只寫 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/` 中明列的12個新檔，以及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-01/`；`.git` 唯讀、不 commit。報告目錄只放 REPORT.md、review-rows.json、inserts.json、timeline-add.json 與檢查輸出。
- 共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不用 MCP；不上網。
- 子代理上限 1 個，模型隨意；若派實質工作，必親讀先讀清單與bf-common，受相同範圍與閘門約束，REPORT記成本與品質。
- 點名工具本身壞掉、沙箱拒寫 → BLOCKED；自己打錯路徑或臨時腳本錯 → 自己修。worktree未備好由領導準備，不自行建分支、worktree或改manifest的TBD。

## 工作

1. 讀先讀；上線：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-01 --up PROGRESS '已讀先讀清單，開始寫bf-moon-01的12件月面lore' < /dev/null`。
2. 記lore check baseline；先 ls 主 repo 與 worktree 的 content/lore/characters/，並逐名查全部新id，避開 lead-fill-pilots 並行新增；撞名先回報領導協調，不覆寫、不自改規格；按逐檔規格新增，先人物與地點，再群像與事件。同批引用在12檔齊後統一驗證，不用空殼內容冒充完成。
3. 寫完只跑指定lore check與npm run check；依逐檔建議製作inserts及timeline-add，沒有建議也交空rows的合法表。
4. 寫REPORT、白話表並回報。每完成一步讀orders。

## 交付

新內容在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/content/lore/` 明列12檔。REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-01/REPORT.md`；檔名若被擋，改同目錄report.md並在回報指實際路徑。回覆只要5行摘要＋REPORT路徑。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-01/review-rows.json`：wf-table/1，source為本交接書絕對路徑，extracted為2026-10-26，columns固定 `["檔","類別","名稱","白話","掛到"]`，12列、白話≤60字；新名在名稱後加「（提案）」。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-01/inserts.json`：wf-table/1，columns `["file","jsonPath","op","value","why"]`。op只用append（向該jsonPath陣列加一元素）、setKey（向該jsonPath物件增加value所帶的新鍵）。路徑索引由領導套用前重找，已存在相同元素不重加，已存在不同鍵值不覆寫。檔與每筆內容依逐檔規格；跨批引用只加建議，不直接改。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-01/timeline-add.json`：wf-table/1，columns `["date","title","summary","event","era","factions","tags","visibility"]`。只交本批指定候選，無則空rows；possible事件不入年表。所有建議仍待領導批准與合併。

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

- 我是誰：`cx-bf-moon-01`。團隊：`teams/bigfill`，上游lead-bigfill，上線先PROGRESS。領導派出前登記ROSTER。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-01 --up DONE 'bf-moon-01新增12檔、既有檔未改，lore check 0錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-01/REPORT.md`（STATUS與標題照實際結果換）。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡超過10分鐘先BLOCKED。標題自足，不能只說完成。
