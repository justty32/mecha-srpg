# 任務：在隔離 worktree 只新增 12 個月面 lore 檔——暗面疾行、白甲出庫與背面遠光（batch bf-moon-03）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（親自讀，不靠摘要；REPORT 開頭列「已讀清單」，每個路徑原樣出現）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/design-notes/world/history-lines/d-moon.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`、`content/lore/places/farside-ruin-belt.json`、`content/lore/places/endymion-vault.json`、`content/lore/places/dark-quay.json`、`content/lore/factions/backside.json`、`content/lore/factions/whitegloves.json`、`content/lore/events/moonless-evacuation.json`、`content/lore/events/hidden-lantern-pact.json`、`content/lore/events/dark-quay-surety.json`、`content/lore/characters/lu-zhaoyin.json`、`content/lore/characters/shen-yanqiao.json`、`content/lore/characters/m3.json`、`content/lore/places/ferry-lane.json`、`content/lore/places/singapore.json`；另在主 repo 讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/cx-bf-moon-03.md`。相對路徑都相對 worktree；若檔案已由整理線搬移，以主 repo 查現存同份檔並在 REPORT 記替代路徑，不跳過內容。

## 背景與唯一目標

塞勒涅是中型公司，替穹頂下的錢當管家。錢的主人是三股匿名富豪群像，不是公司的無限金庫。本批依已審月面計畫補「暗面疾行、白甲出庫與背面遠光」，只新增下面12檔；已有歷史不推翻，古代機不動，不替任何人指定認主。不新增地球人物、城市或第四個渡月港。靜海仍是唯一月城，所有月面新地點都是既有城區或封鎖線外勤務點。本稿已依第2輪 moon-rulings.md 重寫；與計畫有衝突時裁定優先，不自行增件。

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

新增只限 worktree 下這12檔：`content/lore/places/grey-edge-rest-stop.json`、`content/lore/places/farside-light-ridge.json`、`content/lore/places/white-armour-loading-hall.json`、`content/lore/places/dark-quay-night-slip.json`、`content/lore/factions/farside-shift-workers.json`、`content/lore/characters/sora-maen.json`、`content/lore/characters/xu-ji.json`、`content/lore/characters/tomo-vell.json`、`content/lore/events/dark-run-under-bow.json`、`content/lore/events/white-armour-departure.json`、`content/lore/events/dark-quay-inspection.json`、`content/lore/events/help-outside-the-belt.json`。

**只新增、不改既有檔**，含年表、勢力places、索引與manifest都不改。對既有檔的需求寫報告 `inserts.json` 與 `timeline-add.json`，領導合併。只引用 HEAD 已有 id 或同批新檔；跨批新 id 不寫進內容，改列 inserts。

不做：上列以外的任何 content 檔、content/base、content/index、content/batches、src、test、schemas、specs、設定筆記、wf其他檔；不新增規格外人名、公司名、機體名與招式。不要寫地球新地點與人物、不要碰萬潮葬王。筆記腳本只放 `/tmp/cx-bf-moon-03/`。不 commit。

件數 gate：新增超過12檔或碰到任何既有內容檔，停下回報，不靠擴範圍處理；本批不超過15檔上限。容量 gate：任一新檔 body 超過1500字，停下回報；本文目標300–1500字。任一 gate 觸發都停。

## 逐檔規格

格式照 content/lore/README.md。下列欄位值固定；通用 `body` 依要點寫，`summary` 一句世界內敘述，`name` 使用指定中文；`aka: []` 不自行填回譯英文。地點用「地貌與氣味／誰在這裡／發生過什麼／2108的狀態／獵團能在這裡幹什麼」五節，事件3–5小節，人物先一件做過的事；小群體不是大勢力，不補古代機藍本或機甲血統。新角色在月面居住與工作，往返船員仍以靜海為家。尚未發生的事件只寫條件與可能後果。

### 1. `content/lore/places/grey-edge-rest-stop.json`「灰沿歇腳站」（提案）

id：`place/grey-edge-rest-stop`；類型：地點。一句定位：背面墟帶的遠光壓在窗上，外圍工人停下車，誰也不把那道光當作招手。 掛點：D；2097 月面封鎖；N04。

欄位值：`region`＝`"月面・背面墟帶封鎖線外勤務路"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"外圍轉班點，禁止越線"`；`factions`＝`["faction/selene","faction/ground-union"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「灰沿歇腳站」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：墟帶遠光照滿轉班站小窗，沉睡裝甲在遠方不動。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）從外圍勤務車停在灰原寫起，密封站的小窗被墟帶遠光照亮，乘員先抬頭再下車。 （2）歇腳站只在封鎖線外供轉班與拖車，不開墟內捷徑，不新增城鎮。 （3）遠方古代裝甲仍保持原姿態，光可見卻無回應；不替恩底彌翁說話或招認駕駛。 （4）工人交換下一段勤務的手牌便出門，站小得只接住一班人，沒有解救整個月面的本事。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「灰沿歇腳站」（提案）；英文原意 Grey Verge，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/ground-union.json","jsonPath":"$.places","op":"append","value":"place/grey-edge-rest-stop","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 2. `content/lore/places/farside-light-ridge.json`「望墟脊」（提案）

id：`place/farside-light-ridge`；類型：地點。一句定位：外圍測路人爬上灰脊，看見墟帶像一列沒走完的星，然後轉身回報可走的路。 掛點：D；N04；底色 1.2。

欄位值：`region`＝`"月面・背面封鎖線外灰脊"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"野地"`；`status2108`＝`"勤務測路點，不通往墟帶內部"`；`factions`＝`["faction/selene","faction/ground-union"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「望墟脊」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：灰脊外的墟帶如破碎星列，古代裝甲仍停在原處。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）測路工爬上封鎖線外的灰脊，遠方墟帶的光排成破碎長列，像隊伍停在半途。 （2）這是外圍勤務視野，不給古墓新增入口、可用座標或穩定越線方法。 （3）他們只回報拖車路況，不由光推知古代機的心意、身分或甦醒時間。 （4）背面看不見地球；測路人朝身後的勤務車揮手，讓人的回程與不動的古代裝甲分開。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「望墟脊」（提案）；英文原意 Ridge of Distant Stars，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 3. `content/lore/places/white-armour-loading-hall.json`「白甲候裝廳」（提案）

id：`place/white-armour-loading-hall`；類型：地點。一句定位：白庫開門，女武神鐵偶整排走向貨架，搬工只敢在它們停步後收回吊帶。 掛點：D；2105 白手套事變→2107 信貸協定；N07、N09。

欄位值：`region`＝`"月面・靜海港保全貨場"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"催收鐵偶整備候裝"`；`factions`＝`["faction/selene","faction/whitegloves"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「白甲候裝廳」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：白庫開門，鐵偶整排走出，銀線與庫光同步移動。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先寫白庫大門開啟，白色女武神鐵偶列隊步上貨架，銀線在同一片庫光裡移動。 （2）這是靜海港既有保全貨場的候裝廳，不增軍工企業、型號或軍隊。 （3）這一批專為鎮壓催收，無機甲核心、無魂；不要和有核心但只能普通開的守牆遙控機混寫。 （4）搬工等停步後才收吊帶，聽到通告不搭話；受僱白手套依單出貨，不安排幕後富豪出鏡指揮。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「白甲候裝廳」（提案）；英文原意 White Armour Hall，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/whitegloves.json","jsonPath":"$.places","op":"append","value":"place/white-armour-loading-hall","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 4. `content/lore/places/dark-quay-night-slip.json`「暗埠夜棧」（提案）

id：`place/dark-quay-night-slip`；類型：地點。一句定位：暗埠的黃光跟著貨車一路奔到密封門，接貨人喊換手，名字留在光照不到的地方。 掛點：D；2097 封鎖、2107 藏燈之盟；N04。

欄位值：`region`＝`"月面・靜海暗埠內部轉運平台"`；`continent`＝`"月面"`；`world`＝`"moon"`；`kind`＝`"其他"`；`status2108`＝`"夜間分批轉運，接現有港區貨流"`；`factions`＝`["faction/backside","faction/ground-union"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","日常"]`。`name` 用「暗埠夜棧」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：暗埠黃光掠過奔行的貨車，貨物在密封門前換手。 指定可吼句：換手，別回頭！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）從地下舊貨棧一段轉運平台寫起，攤燈的黃光在車邊掠過，搬工接力推貨。 （2）這是暗埠內部夜間交接處，不是第二座暗埠、外露發射港或直通地球的航道。 （3）接貨人喊「換手，別回頭！」，只寫當夜的急促動作，不公開可重用的暗號規程。 （4）暗面替這趟人貨開路，也可能賣旁人的消息；藏燈之盟只保護簽約當次撤離，夜棧沒有讓黑市普遍守義。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「暗埠夜棧」（提案）；英文原意 Night Slip，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[{"file":"content/lore/factions/backside.json","jsonPath":"$.places","op":"append","value":"place/dark-quay-night-slip","why":"補同一勢力的月面活動地點；若已存在則略過"}]`。僅寫報告建議檔，不直接套用。
### 5. `content/lore/factions/farside-shift-workers.json`「背面輪班人」（提案）

id：`faction/farside-shift-workers`；類型：勢力。一句定位：灰原上的勤務車向墟光排開，輪班人喊把這一班帶回去，才放下車尾的扶欄。 掛點：D；2097 封鎖、2098 大罷工；N04→N07。

欄位值：`type`＝`"其他"`；`scale`＝`"背面封鎖線外的輪班勤務者，無共同領袖或兵力"`；`founded`＝`"2097 封鎖後逐班形成"`；`hq`＝`"背面外圍勤務站"`；`ideology`＝`"這一班，一個都帶回去！"`；`places`＝`["place/grey-edge-rest-stop","place/farside-light-ridge"]`；`relations`＝`[{"faction":"faction/ground-union","stance":"友好","note":"部分是工會成員，不取代地勤會。"},{"faction":"faction/selene","stance":"緊張","note":"受僱進外圍工作，仍要面對封鎖與班期。"},{"faction":"faction/backside","stance":"中立","note":"個別工人借接應通路，不等於全體加入暗面。"}]`；`leaders`＝`[]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「背面輪班人」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：灰原勤務車朝墟帶遠光排開，車尾的人喊回程。 指定可吼句：這一班，一個都帶回去！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）一班勤務車面向墟帶遠光排開，車尾的人朝同伴喊「這一班，一個都帶回去！」。 （2）這是外圍測路、修車與接班的職業群像，不是新工會、探索軍或暗面部隊。 （3）他們多與地勤會有關，也有人只求領薪；2098縮短輪班的讓步沿原史，不重寫成工人取得封鎖權。 （4）車隊仍須依許可停在外圍，喊得再大聲也叫不醒恩底彌翁；公司的封鎖沒有因此消失。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「背面輪班人」（提案）；英文原意 Farside Watches，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 6. `content/lore/characters/sora-maen.json`「索拉・梅恩」（提案）

id：`character/sora-maen`；類型：人物。一句定位：索拉替暗面捎貨，手仍按正式船班掌舵；離開靜海那一刻，她只喊向地球。 掛點：D；2097 封鎖→2107 藏燈之盟；N04、N09。

欄位值：`born`＝`"2075"`；`faction`＝`"faction/backside"`；`role`＝`"渡月船受僱副駕，替暗面捎貨，常住靜海"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/xu-ji","relation":"接應同伴","note":"只替約定這一趟接貨，互不掌握整張網。"}]`；`events`＝`["event/dark-run-under-bow"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「索拉・梅恩」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：副駕接班時光尾離開靜海，白城退成一點。 指定可吼句：向地球，別看貨艙！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先寫她在受僱渡月船的副駕席接過一段當班，光尾把靜海壓成白點，她喊「向地球，別看貨艙！」。 （2）她常住靜海，是替暗面捎貨的船員駕駛，不是新航運老闆、偷天駕駛或暗面領袖。 （3）暗面的生意依附塞勒涅正式航路，弦月單程三天；她靠熟面孔交接，不靠超常航速或新船型。 （4）她在一次已結束的捎運中帶貨出港，公開只留被人講起的往事，不給可複用的藏貨位置，也不保證每次能脫查。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「索拉・梅恩」（提案）；英文原意 Sora Maen，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 7. `content/lore/characters/xu-ji.json`「許霽」（提案）

id：`character/xu-ji`；類型：人物。一句定位：許霽在暗埠黃光裡推貨穿過人群，喊接住這趟，下一趟不作保。 掛點：D；2107 藏燈之盟、暗埠留票；N04。

欄位值：`born`＝`"2080"`；`faction`＝`"faction/backside"`；`role`＝`"暗埠夜間轉運接應人"`；`kind`＝`"human"`；`relations`＝`[{"character":"character/sora-maen","relation":"接應同伴","note":"在港前換手，船上由她自己承擔風險。"}]`；`events`＝`["event/dark-run-under-bow","event/dark-quay-inspection"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「許霽」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：黃光掠過奔行貨車，接應人轉身喊換手。 指定可吼句：接住這趟，別問下一趟！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）他把滑走的貨車轉向接手人，喊「接住這趟，別問下一趟！」，黃光從臉旁連續掠過。 （2）他是暗埠的現場接應人，負責轉運，不再新增照音、雁橋那類押票驗貨中人。 （3）他與索拉只約一次貨程，無權替全網保密，地勤互助也不會抹去黑市售名的生意。 （4）遇查先把搬工帶離白甲前方，不揭誰私下放行，也不替白手套創造人格或陰謀首腦。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「許霽」（提案）；英文原意 Xu Ji，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 8. `content/lore/characters/tomo-vell.json`「陶莫・維爾」（提案）

id：`character/tomo-vell`；類型：人物。一句定位：白甲走上貨架時，陶莫喊停，把同伴從鐵偶腳下的吊帶拖出來。 掛點：D；2105 白手套事變→2107 信貸協定；N07、N09。

欄位值：`born`＝`"2070"`；`faction`＝`"faction/selene"`；`role`＝`"靜海保全貨場受僱搬工"`；`kind`＝`"human"`；`relations`＝`[]`；`events`＝`["event/white-armour-departure"]`；`aka`＝`[]`；`gameRefs`＝`[]`；`tags`＝`["月面","群像"]`。`name` 用「陶莫・維爾」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：白庫光裡搬工拖出同伴，鐵偶停步後再次上架。 指定可吼句：吊帶有人，停步！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）先寫他朝候裝廳喊「吊帶有人，停步！」，把被勾住的同伴拖回庫光裡。 （2）鐵偶按整備停步流程停下，不是被吼出良心、醒成機魂或有人駕核心施術。 （3）他是保全貨場受僱搬工，知道裝出去的是無魂催收鐵偶，沒有權力決定它們去哪裡。 （4）白甲再次走上架時，他只把吊帶收得更遠；不替後方僱主補姓名、不寫他秘密控制整隊。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不適用。沒有隱藏真相授權的，不補秘密。新名詞僅「陶莫・維爾」（提案）；英文原意 Tomo Vell，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 9. `content/lore/events/dark-run-under-bow.json`「借月弓的光」（提案）

id：`event/dark-run-under-bow`；類型：事件。一句定位：暗面的貨在月弓光下趕上正班船，三天後隨新加坡舷梯落地，沒有另一條天路。 掛點：D；2097 封鎖、2096 赤道港協定、2107 藏燈之盟；N04、N09。

欄位值：`date`＝`"2107"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/backside","faction/selene"]`；`characters`＝`["character/sora-maen","character/xu-ji"]`；`places`＝`["place/dark-quay-night-slip","place/ferry-lane","place/singapore"]`；`consequences`＝`["這次普通備件依附定班渡月船完成交接。","暗面仍沒有獨立航路，也沒有保證下次安全的通行權。"]`；`tags`＝`["moon"]`。`name` 用「借月弓的光」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：月弓光把急行貨車影子拉長，正式渡月船拖光離港。 指定可吼句：向地球，別看貨艙！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）2107藏燈之盟後的一趟既成捎運：許霽從夜棧把封好的普通備件推向港區，月弓一引，貨車影子被光拉長。 （2）索拉值正式渡月船副駕當班，貨混在當次正常轉運裡；不把月弓當作運人方法或安全偷渡機制。 （3）起落兩端寫快節奏交接，航程照弦月單程三天，最後只在既有新加坡港的舷梯交貨，不展開地球街區與人物。 （4）這次貨到不代表暗面永不失手，也不新訂盟約；不販古代機、不運活獸，不在公開文字教一條永久逃查捷徑。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「借月弓的光」（提案）；英文原意 Under the Bowlight，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 10. `content/lore/events/white-armour-departure.json`「白甲離月」（提案）

id：`event/white-armour-departure`；類型：事件。一句定位：白庫的鐵偶一路列隊進船，地球掛在艙口外，搬工拉下最後一道攔繩。 掛點：D；2107 信貸協定；N09。

欄位值：`date`＝`"2107"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/selene","faction/whitegloves"]`；`characters`＝`["character/tomo-vell"]`；`places`＝`["place/white-armour-loading-hall","place/tranquility-city","place/ferry-lane"]`；`consequences`＝`["催收鐵偶隨正式船班外派，沿信貸協定既有權限。","貨場工人留下這次裝船的記憶，不改首次地球催收史。"]`；`tags`＝`["moon"]`。`name` 用「白甲離月」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：白甲列隊入艙，地球懸在艙口外，離船光尾掠過攔繩。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）信貸協定後的一次日常出貨，鐵偶從白甲候裝廳走上貨架，再按搬工手勢列隊入船。 （2）地球掛在開啟的艙口外，陶莫拉下攔繩，把仍在路徑上的同伴叫回。 （3）搬工聽見催收通告的試播，只知這批無核心鐵偶將去地球，不知是哪一戶出錢、哪一座城先收到它們。 （4）以船離靜海的光尾收束，不宣稱首次外派，不讓古代機裝船，不替受僱執行者寫成主謀。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「白甲離月」（提案）；英文原意 White Armour Outbound，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 11. `content/lore/events/dark-quay-inspection.json`「暗埠收燈」（提案）

id：`event/dark-quay-inspection`；類型：事件。一句定位：白手套在暗埠入口展開白甲，黃燈一盞盞背過身，接應人把搬工帶離查貨線。 掛點：D；2105 入口止步、2107 藏燈之盟後續；N04、N09。

欄位值：`date`＝`"2107"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/backside","faction/whitegloves"]`；`characters`＝`["character/xu-ji"]`；`places`＝`["place/dark-quay","place/dark-quay-night-slip"]`；`consequences`＝`["部分普通箱件被查扣，暗埠仍運作。","這次局部查貨不取代既有無月撤棧，也不更改2105止步之謎。"]`；`tags`＝`["moon"]`。`name` 用「暗埠收燈」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：白甲在入口截住黃燈，鐵偶夾箱後撤走。 指定可吼句：收燈，人先散！。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）時間在2107既有盟約之後的一次局部查貨，鐵偶只到暗埠外側入口展開攔線，白甲刮過黃光邊緣。 （2）許霽喊「收燈，人先散！」，搬工先退，貨主把待查的普通箱件停在白甲前，不能把所有貨都變沒。 （3）鐵偶夾起查扣箱件撤走，查扣限這一次；暗埠仍開著，不改2105追兵止步的原因，也不新增清剿暗埠的戰役。 （4）不補無名上司的密令或賄賂真相，不讓鐵偶使招；夜棧又亮燈時，被扣的人貨風險仍要各自承擔。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：不設；已發生。沒有隱藏真相授權的，不補秘密。新名詞僅「暗埠收燈」（提案）；英文原意 When the Quay Dims，留manifest，不自動放aka。

年表：`[]`；不新增年表；沿掛點既有條目，這件只拉近當地畫面。 插入建議：`[]`。僅寫報告建議檔，不直接套用。
### 12. `content/lore/events/help-outside-the-belt.json`「墟外待救」（提案）

id：`event/help-outside-the-belt`；類型：事件。一句定位：若勤務車困在封鎖線外，墟帶遠光只照著它，回應呼救的仍得是人。 掛點：D；N04 封鎖的日常後果；底色 1.2。

欄位值：`date`＝`"2108-03"`；`period`＝`"era/league"`；`kind`＝`"其他"`；`factions`＝`["faction/ground-union","faction/farside-shift-workers"]`；`characters`＝`[]`；`places`＝`["place/grey-edge-rest-stop","place/farside-light-ridge"]`；`consequences`＝`["若能接到拖車，受困者可能返回歇腳站。","若無人接應，當班人必須繼續等待；不預定死傷。"]`；`tags`＝`["moon","rumor"]`；`occurs`＝`"possible"`。`name` 用「墟外待救」，正文與名稱欄不附設計標籤「提案」；`summary` 依一句定位化成世界內的一句話。

指定光景：受困車頂被墟帶遠光照著，古代裝甲不回應呼救。 指定可吼句：無；以畫面承擔光。規劃標記只供寫作核對，不新增到lore欄位。

body 要點（照順序展開，非正文全文）：（1）可能在開局後某班出現：外圍勤務車停住，墟帶遠光越過車頂，受困者呼叫接班車。 （2）只在封鎖線外接人，能否湊到拖車、願不願冒班期風險，由後續選擇決定。 （3）遠處古代裝甲不動，恩底彌翁不指路、不認主；不能用神蹟替人解圍。 （4）代表日期不排定事故或死傷，救成與救不成只列可能後果，不強迫暗面全網守義。

可見度：`{"visibility":"public","secrets":[]}`；`occurs`：possible。沒有隱藏真相授權的，不補秘密。新名詞僅「墟外待救」（提案）；英文原意 Help Beyond the Cordon，留manifest，不自動放aka。

年表：`[]`；不加年表：occurs: possible，代表日期不排定發生。 插入建議：`[]`。僅寫報告建議檔，不直接套用。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts` | worktree寫前記baseline，12檔齊後跑；0錯，warnings不得高於baseline |
| `npm run check` | 12檔齊後一次，末行OK 0 errors；工人不用npm test，領導按manifest驗收 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` | 查資料表、寫review與插入建議；年表entries可先用tabledb.load＋Table在記憶體轉接後條件查，不整份輸出 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-moon-03 --once` | 每完成一步讀orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容）：只寫 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-03/` 中明列的12個新檔，以及報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-03/`；`.git` 唯讀、不 commit。報告目錄只放 REPORT.md、review-rows.json、inserts.json、timeline-add.json 與檢查輸出。
- 共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`、`.gitignore`；不安裝依賴；不用 MCP；不上網。
- 子代理上限 1 個，模型隨意；若派實質工作，必親讀先讀清單與bf-common，受相同範圍與閘門約束，REPORT記成本與品質。
- 點名工具本身壞掉、沙箱拒寫 → BLOCKED；自己打錯路徑或臨時腳本錯 → 自己修。worktree未備好由領導準備，不自行建分支、worktree或改manifest的TBD。

## 工作

1. 讀先讀；上線：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-03 --up PROGRESS '已讀先讀清單，開始寫bf-moon-03的12件月面lore' < /dev/null`。
2. 記lore check baseline；先 ls 主 repo 與 worktree 的 content/lore/characters/，並逐名查全部新id，避開 lead-fill-pilots 並行新增；撞名先回報領導協調，不覆寫、不自改規格；按逐檔規格新增，先人物與地點，再群像與事件。同批引用在12檔齊後統一驗證，不用空殼內容冒充完成。
3. 寫完只跑指定lore check與npm run check；依逐檔建議製作inserts及timeline-add，沒有建議也交空rows的合法表。
4. 寫REPORT、白話表並回報。每完成一步讀orders。

## 交付

新內容在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-03/content/lore/` 明列12檔。REPORT 直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-03/REPORT.md`；檔名若被擋，改同目錄report.md並在回報指實際路徑。回覆只要5行摘要＋REPORT路徑。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-03/review-rows.json`：wf-table/1，source為本交接書絕對路徑，extracted為2026-10-26，columns固定 `["檔","類別","名稱","白話","掛到"]`，12列、白話≤60字；新名在名稱後加「（提案）」。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-03/inserts.json`：wf-table/1，columns `["file","jsonPath","op","value","why"]`。op只用append（向該jsonPath陣列加一元素）、setKey（向該jsonPath物件增加value所帶的新鍵）。路徑索引由領導套用前重找，已存在相同元素不重加，已存在不同鍵值不覆寫。檔與每筆內容依逐檔規格；跨批引用只加建議，不直接改。

`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-03/timeline-add.json`：wf-table/1，columns `["date","title","summary","event","era","factions","tags","visibility"]`。只交本批指定候選，無則空rows；possible事件不入年表。所有建議仍待領導批准與合併。

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

- 我是誰：`cx-bf-moon-03`。團隊：`teams/bigfill`，上游lead-bigfill，上線先PROGRESS。領導派出前登記ROSTER。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-03 --up DONE 'bf-moon-03新增12檔、既有檔未改，lore check 0錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-03/REPORT.md`（STATUS與標題照實際結果換）。
- 結束必發DONE／BLOCKED／NEEDS-USER／FAILED之一；卡超過10分鐘先BLOCKED。標題自足，不能只說完成。
