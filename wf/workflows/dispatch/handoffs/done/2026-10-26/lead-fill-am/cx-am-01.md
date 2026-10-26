# 任務：在隔離 worktree 新增 12 個 lore 檔並對 3 個既有檔做純插入，寫成南北美洲 2108-01 的第一盤（batch am-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（含「崩年的底色」十三句）、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`wf/workflows/planning/design-notes/world/history-lines/d-moon.md`、`content/lore/places/montreal.json`、`content/lore/places/mexico-city.json`、`content/lore/places/sao-paulo-blight.json`、`content/lore/places/ring-road.json`、`content/lore/places/great-lakes-mycelium.json`、`content/lore/factions/quito.json`、`content/lore/factions/ring-caravan.json`、`content/lore/factions/shell-society.json`、`content/lore/factions/remnant-wings.json`、`content/lore/characters/xingtian.json`、`content/lore/events/pune-falls.json`、`content/lore/events/singapore-conference.json`、`content/lore/events/credit-accord.json`、`content/lore/events/hunter-license-act.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

使用者 2026-10-26 定案（見 before-collapse-powers、polity、magnates、city-types）：崩年殺的是國家的沿海，不是國家。**美國沒有縮多少**：北美傘是美國把加拿大、墨西哥諸城納入調度的名字，美國拒用「傘」字、以國家名義調度，「舊旗」是別人叫的；它沒有誕生日，只有**改名的日子**；「墨西哥城／加拿大諸城歸屬」是裂痕，刑天就睡在蒙特婁這道裂痕上。美國資本一半跟塞勒涅上了月（穹頂下的錢），另一半留在地上，是月面資本的對手、N09 的另一個貸方。拉美是**商人當政的聯盟型傘**：巴西首都本在內陸、退得從容；基多與維拉科查高高在上、絕不出洲。自由城市約 20（國家型傘境內沒有）、黑幫城市約 10（拉美沿岸空城帶有）、公司城是少數守港城、空城數以百計。本批唯一目標：照「逐檔規格」新增 12 檔、對 3 個既有檔做純插入，讓百科裡有南北美洲那一盤，而**既有 lore 一字不改**。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件都掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（下面每檔都寫了掛點），有因有果；REPORT 逐檔寫掛點。不新增規格以外的具名人物、地名、事件、機體名、招式名、公司名。
- **不拿其他作品類比**：不寫任何外部作品名、角色名、電影或遊戲的比喻；量級用世界內的詞。
- **中文命名避免直譯**；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機本體叫古代機、外層叫裝甲；蝕潮（口語蝕）、漲潮、大潮；矢、衍型機、機魂、魂核、墟、骸片。禁用詞照 style.md。名字是領導定的提案名，照用，不另取。
- **國家、塞勒涅、巨頭只削弱不萬能**：美國保住法理、徵召、天花板，但兩岸照樣挨打、到不了每一座城；內陸財團有錢，買不到月面型錄與古代機；塞勒涅不出場當主謀。
- **已裁示不推翻**：上面「背景」每一句；2090 聖保羅失守（核心在桑托斯灣區）、巴西退守巴西利亞；2101 第一次新加坡會議由「各區代表」畫蝕線、正式的傘多半其後才成立；2106 刑天沉睡後由費雷羅運回蒙特婁；**刑天維持沉睡、認不認伊爾瑟不預決**（不寫它醒、不寫它動、不暗示答案）；維拉科查不得離開安地斯。
- **不寫真實歷史人名**；富豪、總統、家族、公司維持群像不點名（職稱可寫，如「總統」「總督」「城主」）。
- **新名詞標提案**：你若不得不造一個規格外的概念詞，REPORT「需要決定」逐條列出；能不造就不造。
- **真相用可見度標**：外界不知道的放 `secrets`（`visibility: hidden`）或 `rumor`；`summary`／`body` 照外界口吻。
- **群像為主**：本批**不新增具名人物**（characters 不在本批範圍）。

## 範圍（排除法寫死）

- 新增只限這 12 檔（在 worktree 的 `content/lore/` 下）：`factions/north-american-umbrella.json`、`factions/heartland-capital.json`、`factions/latam-umbrella.json`、`places/denver.json`、`places/new-york-hollow.json`、`places/houston-wells.json`、`places/panama-locks.json`、`places/rio.json`、`places/brasilia.json`、`events/renaming-day.json`、`events/trade-route-charter.json`、`events/xingtian-registry.json`。
- 修改只限這 3 檔且**只准插入**（物件加新鍵、陣列加新元素；既有鍵與既有元素一個字都不動，閘門逐節點比對）：`timeline.json`、`places/montreal.json`、`places/mexico-city.json`。
- 不做：上列以外的任何檔（含 `content/index/`、`content/batches/`、`content/base/`、`src/`、`wf/` 除報告目錄、`characters/`）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-am-01/`）。
- 件數 gate：新增加修改超過 15 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。任一觸發都停。

## 逐檔規格

格式照 `content/lore/README.md` 欄位表；`body` 300–1500 字、markdown、可用 `## ` 小標。地點檔照既有地點檔的五段（`## 地貌與氣味`／`## 誰在這裡`／`## 發生過什麼`／`## 2108 的狀態`／`## 獵團能在這裡幹什麼`）。所有地點 `world` earth。`gameRefs` 一律 `[]`。

### 1. `factions/north-american-umbrella.json`「北美那把傘」

- `aka` `["北美傘", "舊旗"]`；`type` 大勢力；`founded` `"崩前（美國）；2102 改名"`；`hq` `place/denver` 的顯示文字（「丹佛（政府搬進山裡）」這類）；`leaders` `[]`；`ideology` 一句（方向：美國不是傘，美國就是美國）。
- 掛點：G 線（國家型、拒用傘字、改名的日子）、N09（俄與北美跟進 B 級，提案；北美是另一個貸方）、崩年的底色 1.6（崩年殺的是沿海不是國家）、1.13 G 句。
- `body`：先一段崩前（最強國家、雙洋岸巨型城市、內陸工業農業完整）→崩年（兩岸同時挨打，政府搬進洛磯山，內陸機器完整，縮得最少）→2108。再**必含四小節**：`## 軍事組織與作戰風格`（國家軍＋徵召；守內陸工業帶與糧道；沿海城靠城邦民兵與受雇獵團；殘翼的燒季它付一部分燃料）、`## 對傭兵：態度與補給`（付得慢、守法理、能徵召——玩家在北美境內可能被徵；殘聯獵牌它採用評等，但國籍另一本）、`## 藍本古代機與研發路線`（北美沒有一台認了主的古代機：刑天睡在蒙特婁、屬於誰沒定案；育空之墟只是傳聞；研發走國家實驗室與內陸工廠的天花板，N09 跟進 B 級量產屬提案；**不新增機體名**）、`## 外交`（與塞勒涅：資本一半在穹頂下，是對手；與殘聯：採評等、不認發牌權凌駕國籍；與加拿大、墨西哥諸城：調度與歸屬的裂痕）。
- `relations`（2108 當下）：`faction/heartland-capital` 同盟、`faction/selene` 緊張、`faction/league` 中立、`faction/shell-society` 緊張（刑天的戶籍）、`faction/remnant-wings` 友好、`faction/latam-umbrella` 中立。
- `places`：`place/denver`、`place/houston-wells`、`place/new-york-hollow`、`place/mexico-city`、`place/montreal`、`place/great-lakes-mycelium`。`mercPolicy`：generosity 2、reliability 4，note 一句（付得慢、從不賴，但可能徵你）。
- `secrets` 一列：`visibility: "rumor"`，text 方向「北美的國家實驗室在試做自己的 B 級，月面型錄之外的另一條路」，`knownBy` `["faction/selene"]`。

### 2. `factions/heartland-capital.json`「內陸財團」

- `aka` `["地上的錢"]`；`type` 企業；`scale`：美國留在地上那一半資本的群像（糧、重工、鐵路、內陸銀行），不點名；`founded` `"崩前（不明）"`；`hq`：丹佛與內陸平原諸城；`leaders` `[]`；`ideology` 一句（方向：錢要落地才算錢）。
- 掛點：magnates「穹頂下的錢」（三股之一是美國資本的一半；另一半留在地上）、before-collapse-powers 咬合第二條（月面資本對地面對手）、N09（北美是另一個貸方）、D 線（塞勒涅從「全球貸方」改讀「最大的單一貸方窗口」）、崩年的底色 1.7（債與地契）。
- `body`：崩前（美國國強企也強、並肩）→崩年（一半人與錢買船票上月，留下的這一半押在內陸糧倉、鐵路、工廠，與國家綁得更緊）→2108（替北美傘出錢；想從穹頂下的錢手上贖回沿海空城的地契，例如紐約；放款給拉美諸城的條件和信貸協定不同——不要求催收權，但要礦、糧或港口抽成；兩邊的錢互相叫對方「逃兵」與「土財主」）。**不點名任何公司或富豪**。
- `relations`：`faction/north-american-umbrella` 同盟、`faction/selene` 敵對（note：對手，不是戰爭，是帳）、`faction/latam-umbrella` 友好（債主）、`faction/ring-caravan` 中立。`places`：`place/denver`、`place/houston-wells`、`place/new-york-hollow`。`mercPolicy`：generosity 3、reliability 3。
- `secrets` 一列：`visibility: "hidden"`，text 方向「財團與穹頂下的錢其實常是同一個家族的兩房：一房上了月、一房留在地上」，`knownBy` `[]`。

### 3. `factions/latam-umbrella.json`「拉美那把傘」

- `aka` `["拉美傘"]`；`type` 大勢力；`founded` `"2102"`；`hq`：無固定總部，席位輪在巴西利亞與商路上的城；`leaders` `[]`；`ideology` 一句（方向：路通，城就活）。
- 掛點：G 線（聯盟型、縮小的國家共組、席位是國家的；〔2101｜環線護航〕提供「按商路分配保護」的接點）、before-collapse-powers 拉美段（商人當政、巴西退得從容、基多「總督」是國家派駐職稱）、崩年的底色 1.4（糧在內陸、精粹在海邊，必須有人跨線運）、city-types（拉美有自由城市與黑幫城市）。
- `body` 先一段崩前→崩年（2090 聖保羅失守、巴西退守巴西利亞）→2102 商路約→2108，再**必含四小節**：`## 軍事組織與作戰風格`（各國的兵守各國的城；商路由商團出錢雇獵團護；基多高原衛是最硬的牆但只守安地斯）、`## 對傭兵：態度與補給`（護商路、護糧的契約最多；補給跟著商隊走）、`## 藍本古代機與研發路線`（維拉科查在基多、不出洲，傘調不動它；基多的安地斯壁、禿鷲-II、雷鳥是拉美唯一自有血統；**不新增機體名**）、`## 外交`（內陸財團是債主、塞勒涅握渡月港、殘聯是評等；北美是鄰居也是裂痕的另一邊——墨西哥城歸北美調度）。
- `relations`：`faction/quito` 同盟（note：基多坐席，但維拉科查不聽傘的）、`faction/ring-caravan` 同盟、`faction/heartland-capital` 友好、`faction/selene` 友好、`faction/league` 同盟、`faction/north-american-umbrella` 中立。
- `places`：`place/brasilia`、`place/quito`、`place/ring-road`、`place/panama-locks`、`place/sao-paulo-blight`。`mercPolicy`：generosity 4、reliability 3，note 一句（商團付現，但路斷了合約也跟著斷）。

### 4. `places/denver.json`「丹佛」

- `region`「北美・洛磯山東麓」、`continent` 北美、`kind` 城邦、`status2108`「守住（北美傘政府所在）」、`factions` `["faction/north-american-umbrella", "faction/heartland-capital"]`。
- 掛點：polity「首都在海邊的把政府搬進山裡（通則）」；1.6。**政府遷到丹佛是本批提案**，body 照外界口吻寫成既成事實，REPORT「需要決定」列一條。
- 內容：高原山城、離兩洋都遠；舊首都在東岸（不必點名舊首都城市）；聯邦機關、國家登記簿、徵召處都在這裡；內陸財團的帳房；平原的糧從這裡排程。獵團能做：徵召處登記（評等是護照、國籍是另一本）、護糧車隊、北上燒季的燃料護送。

### 5. `places/new-york-hollow.json`「紐約空城」

- `region`「北美・大西洋岸」、`continent` 北美、`kind` 遺跡、`status2108`「空城（地契押在月上）」、`factions` `["faction/north-american-umbrella", "faction/heartland-capital", "faction/selene"]`。
- 掛點：polity「空城」（不是蝕域，只是沒人了；產權歸國庫、多半已抵押；搜刮規則「國家默許、債主不許」）、「債與地契」（築牆期各國拿沿海空城地契向穹頂下的錢抵押借款）、1.5、1.7、D 線。
- 內容：崩年斷鏈後撤空（不是被獸佔的蝕域，海岸偶有獸上岸）；築牆期國家把地契押給了穹頂下的錢——反諷：押給的正是崩年搭船走的那一半美國資本；內陸財團想贖回；拾荒隊、打撈隊、偶爾的歸鄉者。獵團能做：打撈（國家默許、債主不許——白手套偶爾來查）、護送財團的估價員、清上岸的零星獸。

### 6. `places/houston-wells.json`「休士頓井城」

- `region`「北美・墨西哥灣西北岸」、`continent` 北美、`kind` 港、`status2108`「守住（公司城）」、`factions` `["faction/north-american-umbrella", "faction/heartland-capital"]`。
- 掛點：magnates 能源類（石油轉月壤與地熱；握地熱井者為城主；少數守港城是公司城）、polity 公司城（法理仍屬國家，日常由公司管）、1.4。
- 內容：舊石油港改握地熱井；城主是一家舊能源公司，城裡人只叫它「公司」（**不取公司名**）；牆、民兵、配給都是公司的；國家的徵召處在城裡但要跟公司排班；墨西哥灣上岸的獸。獵團能做：公司的守港契約（準時付、規矩多）、護井、護送往內陸的燃料。

### 7. `places/panama-locks.json`「巴拿馬閘城」

- `region`「中美・巴拿馬地峽」、`continent` 北美（大地圖分張用）、`kind` 港、`status2108`「守住（自由城市）」、`factions` `["faction/ring-caravan", "faction/latam-umbrella"]`。
- 掛點：city-types 自由城市三條成因（國家沒來的港、跨線的市場、獵團的母港）與「怎麼運作」（城約、議會由出錢的商團與庇護的獵團坐席、庇護是契約）、1.4。
- 內容：運河閘門當牆，兩洋之間的中繼市場；國家在登記簿上仍主張它，城立了自己的城約（「城約」是提案名，照用）；沒有傘有義務來救；環線商隊在這裡有席位（它也是自由城市的一種）。對玩家照 city-types「對玩家」四條：契約公開掛板、補給最齊最自由、國家徵召令無效、獵牌效力最高。不指名庇護獵團（可寫「三支獵團」之類群像）。

### 8. `places/rio.json`「里約」

- `region`「南美・巴西東南岸」、`continent` 南美、`kind` 港、`status2108`「黑幫城市」、`factions` `["faction/latam-umbrella"]`（只放既有勢力；幫派不建勢力檔）。
- 掛點：city-types 黑幫城市（成因：走私路成命脈、死人財產無主、空城搜刮；幫規是法；賣別處不准賣的；常是蝕域的出海口與帳房）、聖保羅蝕域與環線、1.5。
- 內容：桑托斯灣區失守後沿岸空城帶上長出的城；幫派握一夜到、收保護費、抽走私稅；聖保羅蝕域的骸片、來路不明的精粹從這裡出海；環線商隊表面不進城，私下有人進。**避免刻板印象**：不寫貧民窟、毒品這類套路，寫崩年邏輯。對玩家照 city-types「對玩家」：灰色契約、黑市件帶來路風險、白手套催收權管不到、獵牌不認評等。幫派不取名。

### 9. `places/brasilia.json`「巴西利亞」

- `region`「南美・巴西中部高原」、`continent` 南美、`kind` 城邦、`status2108`「守住（巴西政府所在）」、`factions` `["faction/latam-umbrella", "faction/ring-caravan"]`。
- 掛點：年表〔2090｜聖保羅失守〕（巴西放棄沿海、退守巴西利亞）、before-collapse-powers（巴西首都本在內陸、退得從容）、1.6。
- 內容：本來就是內陸首都，崩年沒有搬家的狼狽；巴西的登記簿、徵召、席位都在；商人當政——糧商、運商坐在議會裡；環線的貨在這裡結帳。

### 10. `events/renaming-day.json`「改名的日子」

- `date` `"2102"`、`period` `era/tide-line`、`kind` 政治；tags `["diplomacy"]`。
- 掛點：N06〔2101｜新加坡會議與蝕線協定〕之後正式的傘多半成立；G 線「美國沒有誕生日，只有改名的日子」；1.6、1.10（傘名是描述句）。
- 內容：別的地方在這一年成立「傘」，美國只做了一件事——把國家調度的名稱換成涵蓋加拿大、墨西哥諸城的名字（**不給新名字的字面**，只說「換了一個名字」），並在文件上拒用「傘」字；外界照樣叫它北美傘、舊旗。裂痕在這天寫上紙：加拿大、墨西哥諸城是「被調度」還是「被併入」，各城讀法不同；蒙特婁與墨西哥城的議會各發一份聲明。
- `factions`：`faction/north-american-umbrella`、`faction/league`；`places`：`place/denver`、`place/montreal`、`place/mexico-city`；`characters` `[]`。`consequences` 3–4 條。

### 11. `events/trade-route-charter.json`「商路約」

- `date` `"2102"`、`period` `era/tide-line`、`kind` 政治；tags `["diplomacy"]`。
- 掛點：G 線「〔2101｜環線護航〕提供拉美按商路分配保護的接點」；N06 之後聯盟型傘成立；1.4。
- 內容：拉美傘的成立文件——保護按商路分、不按國界分：誰的商路經過，誰出錢雇獵團守；席位是國家的，但出錢的是商團，所以商人當政。基多簽了字，但總督加了一條：高原衛與維拉科查不離安地斯——傘調不動它。環線商隊是範本。
- `factions`：`faction/latam-umbrella`、`faction/quito`、`faction/ring-caravan`；`places`：`place/brasilia`、`place/quito`、`place/ring-road`；`characters`：`character/esteban-quiroga`（只能寫他加那一條，不寫對白）。`consequences` 3–4 條。

### 12. `events/xingtian-registry.json`「刑天的戶籍」

- `date` `"2106"`、`period` `era/league`、`kind` 政治；tags `["diplomacy"]`。
- 掛點：N08〔2106｜浦那陷落〕之後刑天被運回蒙特婁；〔2106｜獵牌法〕（登錄機魂算裝備，但古代機不是機魂，條文沒寫它）；before-collapse-powers「美國把刑天放在自家裂痕上」；B 線（古代機高高在上有政治理由）。
- 內容：刑天運進蒙特婁地下後，美國的國家登記簿要把它登成國家資產（蒙特婁在北美調度之內）；稽古學會說古代機是棺材、不登任何簿；殘聯的獵牌法沒有古代機這一欄；鐵砧說是它挖的。結果是**沒有結果**：刑天留在學會的地下、誰的簿上都沒有，國家在城外駐了一個看守的崗；蒙特婁的歸屬裂痕從此和刑天綁在一起。**不寫刑天動、醒、選人**。
- `factions`：`faction/north-american-umbrella`、`faction/shell-society`、`faction/league`、`faction/anvil`；`characters`：`character/xingtian`、`character/eugenia-ferrero`；`places`：`place/montreal`。`consequences` 3–4 條。

### 13. 既有檔的純插入

- `timeline.json`：插三條到正確排序位置（不動既有條目、不重排）：`2102`「改名的日子」（`event/renaming-day`、era `era/tide-line`、factions `["faction/north-american-umbrella"]`、tags `["diplomacy"]`）；`2102`「商路約」（`event/trade-route-charter`、era `era/tide-line`、factions `["faction/latam-umbrella", "faction/quito"]`、tags `["diplomacy"]`）；`2106`「刑天的戶籍」（`event/xingtian-registry`、era `era/league`、factions `["faction/north-american-umbrella", "faction/shell-society"]`、tags `["diplomacy"]`）。同年內插在該年既有年-only 條目之後、該年第一個帶月份條目之前（照 check.ts 的排序規則；check 會驗）。
- `places/montreal.json`：`factions` 尾端加 `faction/north-american-umbrella`。不動其他欄。
- `places/mexico-city.json`：`factions` 尾端加 `faction/north-american-umbrella`。不動其他欄。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯；警告數不得比改前多） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-am-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-am/wt-am-01/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/am-01/`；**不 commit**（沙箱下 `.git` 唯讀）。報告目錄只放 REPORT.md 與 review-rows.json。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-am-01 --up PROGRESS '已讀完先讀清單，開始寫 am-01' < /dev/null`）。
2. 先寫三個勢力檔，再寫六個地點、三個事件，最後做第 13 節插入。
3. 跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/am-01/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增與插入的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-am/wt-am-01/content/lore/…`（上列 15 檔） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/am-01/REPORT.md` |

**白話審查表（必交）**：同目錄寫 `review-rows.json`（契約 wf-table/1：`{"contract": "wf-table/1", "source": "../cx-am-01.md", "extracted": "2026-10-26", "columns": ["檔", "類別", "名稱", "白話", "掛到"], "rows": [...]}`），本批每個**新增**檔一列（12 列）：`檔`＝repo 相對路徑（如 `content/lore/places/rio.json`）、`類別`（勢力／地點／事件）、`名稱`、`白話`（一到兩句、**不超過 60 字**、給人看的白話：它是什麼、為什麼存在，不堆術語）、`掛到`（節點／主線／年表／底色條，如「N09；D 線；底色 1.7」）。可用 `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/am-01/review-rows.json add 檔=… 類別=… …` 追加（先寫好空表頭）。

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋掛到哪個節點／主線／年表／底色、做了什麼插入；產出；沒做到或證據不足的；需要決定的事：發現與既有 lore 或設定筆記矛盾的地方、你造的規格外概念詞，逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 不多於改前。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 12 個新檔存在、檔名＝id name 段；3 個既有檔只有插入（領導用 `content_gate` 驗）。
4. REPORT 存在且開頭有「已讀清單」；`review-rows.json` 存在、12 列、每列白話 ≤ 60 字。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-am-01`。本線團隊：`teams/fill-am`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-am-01 --up DONE 'am-01 新增 12 檔、插入 3 檔，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/am-01/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
