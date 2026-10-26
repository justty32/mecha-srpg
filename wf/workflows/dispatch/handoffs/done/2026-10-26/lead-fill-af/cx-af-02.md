# 任務：在隔離 worktree 新增 11 個 lore 檔，寫成撒南、北非、西亞的城邦類型代表地、輸出駕駛員與三個人物（batch af-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（「框架」與「崩年的底色」）、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`content/lore/factions/sub-saharan-umbrella.json`、`content/lore/factions/north-africa-umbrella.json`、`content/lore/factions/west-asia-umbrella.json`、`content/lore/factions/yoke-saddle-works.json`、`content/lore/events/aswan-sluice-night.json`、`content/lore/events/hormuz-burning-night.json`、`content/lore/places/aswan.json`、`content/lore/places/hormuz.json`、`content/lore/factions/green-line.json`、`content/lore/factions/mumbai-returners.json`、`content/lore/factions/accra.json`、`content/lore/places/lagos-blight.json`、`content/lore/characters/babatunde.json`、`content/lore/characters/adebayo-oluwaseyi.json`、`content/lore/places/cotonou.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/PLAN.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/cx-af-02.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

上一批（af-01）已立三把傘（撒南、北非、西亞）、軛鞍行、放閘夜／燃夜／金山夜／斷橋夜／運河夜與五個地點。本批補**周邊與缺口**：城邦類型在本區的代表地（自由城市、公司城、空城、雙籤城；本區的黑幫城市科托努已由別線寫好，**不要再寫科托努、不新增它的幫派或當家**）、撒南「向全球輸出駕駛員與獵團」的實際樣子、拉哥斯難民那一支歸還黨，以及三個掛在節點上的具名人物。本批唯一目標：照「逐檔規格」新增 11 檔，年表增列與白話介紹寫成資料檔交給領導，**既有 lore 一字不改**。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件都要掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（每檔都寫了掛點，body 裡要讀得出前因與後果）；不新增規格以外的具名人物、地名、事件、機體名、招式名、組織名。
- **不拿其他作品類比**：不寫任何外部作品名；量級用世界內的詞。
- **中文命名避免直譯**；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機、裝甲、蝕潮、漲潮、大潮、矢、衍型機、機魂、墟、骸片、裂晶、精粹、軛騎。禁用詞照 style.md。
- **國家、塞勒涅、巨頭、幫派只削弱不萬能**：自由城市守得住靠「沒人值得為它打一仗」；黑幫城市沒有傘救、繼承就是內戰；公司城法理仍屬國家；空城產權歸國庫、多半已抵押（搜刮規則「國家默許、債主不許」）。
- **已裁示不推翻**：city-types 已定的數量與規則（黑幫城市不認獵牌評等、白手套催收權管不到；自由城市國家徵召令無效、獵牌效力最高）；綠線幫是蝕匪幫不是黑幫城市；拉哥斯外圍綠線殘部蝕匪邦（在蝕線之內）已定；歸還黨三支（孟買、桑托斯灣區、拉哥斯難民），拉哥斯支**只寫存在與起源**，不寫它打過的仗；2089–2092 出生的孩子極少；渡月船拒載獸（2102 奈洛比港事件）；奈洛比、蒙巴薩、三蘭港是殘聯與撒南傘的雙籤城，日常行政歸撒南傘，大潮夜向誰求援自選、求援紀錄是政治表態。
- **人物**：只寫規格裡的三個；每人要有崩前（或崩年）→節點→2108-01 狀態，有因有果。不寫真實人名；不給他們古代機或新機型——需要機體就寫既有的（`堅盾-I`、`牧杖-III型（C）`、`牧者（B）`）或「拘束的掘犬」這類既有獸名；外表與口頭禪照 `content/lore/style/people.md`。
- **真相用可見度標**：外界不知道的放 `secrets`（`hidden`），只是傳聞的標 `rumor`；`summary`／`body` 照外界口吻。
- 所有交叉引用必須指向 worktree 裡已存在的檔或本批新檔（不要引用 `faction/euro-umbrella` 等主 repo 沒有的檔）。

**計畫在先**：領導已審過的計畫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/PLAN.md`；本交接書與計畫衝突時以本交接書為準，計畫裡的設計理念、與既有 lore 的關係、review 草稿照用並微調文筆口吻。

**領導對計畫書「風險與矛盾」的裁定（優先於上面的逐檔規格）**：(1) 城約段只寫商團與不具名庇護團，獵牌效力留在 2108 狀態；(2) 吉布地寫成「這一帶最早立城約的港之一」，不寫「第一座」；(3) 朱瑪帶的騎手以崩年前出生、二十出頭為主，不新增具名團員、不寫精確人數；(4) 渡月船拒載只說明「這次出洋走海路」，不推成世上只有海運能載獸；(5) 法莉妲崩年時的職務寫「港務的通訊員」；`gameRefs` 只給 faction／character／place（`[]`），event 不加；place 不加 `aka`；(6) 拉哥斯歸還黨只展開起源，不借阿克拉戰績與既有人物當黨魁；(7) 本批不新增 hidden 真相以外的 secrets，軛鞍行的養裂傳聞不推到遠牧。

## 範圍（排除法寫死）

- 新增只限這 11 檔（在 worktree 的 `content/lore/` 下）：`places/{djibouti,dhahran,dubai,mombasa}.json`、`factions/{lagos-returners,far-herd}.json`、`events/{djibouti-charter,yoke-riders-abroad}.json`、`characters/{nadia-sabri,juma-kiprop,farida-naseri}.json`。
- **白話介紹（使用者要求，必交）**：11 檔每檔一列，寫進 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/review-add.json`，格式 `{"rows":[{"檔":"content/lore/…json","類別":"勢力｜事件｜地點｜人物","名稱":"顯示名","白話":"…","掛到":"…"}]}`。`白話`一到兩句、**不超過 60 字**，給人看的白話：說它是什麼、為什麼存在，不堆術語；`掛到`寫節點／主線／年表／崩年底色條。
- 年表**不要改** `timeline.json`；增列寫成 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/timeline-add.json`（`{"entries":[…]}`，照 README 的 timeline 格式）。
- 不做：上列以外的任何檔（含 `timeline.json`、既有 lore、`content/index/`、`content/batches/`、`content/base/`、`src/`、`wf/` 除報告目錄）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-af-02/`）。
- 件數 gate：新增超過 11 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。任一觸發都停。

## 逐檔規格

格式照 `content/lore/README.md`；`body` 300–1500 字；`gameRefs` 一律 `[]`；`world` 一律 `earth`。地點 body 用 `## 地貌與氣味`、`## 誰在這裡`、`## 發生過什麼`、`## 2108 的狀態`、`## 獵團能在這裡幹什麼`；第一段或「發生過什麼」要寫出「崩前是什麼→崩年怎麼了→2108 是什麼」。

### 地點（4）

1. `places/djibouti.json`「吉布地」，`region`「非洲・曼德海峽西岸」，`continent` 非洲，`kind` 城邦，`status2108`「守住（自由城市）」，`factions` `["faction/far-herd"]`。掛點：city-types 自由城市三條成因（國家沒來的港＋跨線市場＋獵團母港，三條都疊在這裡）、崩年底色 1.4（糧在內陸、精粹在海邊、要有人跨線運）、2106 運河夜（紅海南口；北非、西亞、撒南三把傘誰都吞不下它）。城約（提案名，city-types 已有）議會由商團與庇護獵團坐席；國家徵召令無效、獵牌效力最高。崩前是外國兵營與轉運港。


3. `places/dhahran.json`「達蘭」，`region`「亞洲・波斯灣西岸」，`continent` 亞洲，`kind` 港，`status2108`「守住（公司城）」，`factions` `["faction/west-asia-umbrella"]`。掛點：magnates 能源類（崩年後轉成城邦，誰握地熱井誰是城主；允許少數守港城是公司城）、polity 公司城（法理仍屬國家，日常由公司管）、西亞「國家本身就是能源巨頭」。崩前是王國油公司的公司鎮；2108 油井改地熱井、公司管水電糧與城牆、王室只派一位代表。公司不點名，寫「舊油公司」。

4. `places/dubai.json`「杜拜空城」，`region`「亞洲・波斯灣南岸」，`continent` 亞洲，`kind` 遺跡，`status2108`「空城（國庫產權，已抵押）」，`factions` `["faction/west-asia-umbrella"]`。掛點：崩年底色 1.5 空城（不是蝕域，只是沒人了）、1.4（遠而便宜→近而能吃到：一座水、電、糧全靠外面的城，鏈一斷就死）、polity「債與地契」（地契押給穹頂下的錢）。崩年海水淡化與冷氣停擺，人往內陸與海峽口岸走（不寫死亡數字）；2108 玻璃塔、沙、拾荒者與債主的告示牌。

5. `places/mombasa.json`「蒙巴薩」，`region`「非洲・東非海岸」，`continent` 非洲，`kind` 港，`status2108`「守住（雙籤城）」，`factions` `["faction/sub-saharan-umbrella", "faction/league", "faction/far-herd", "faction/yoke-saddle-works"]`。掛點：R08 雙籤城（大潮夜求援紀錄是政治表態，可寫它歷年向哪邊求援被人拿來算帳）、2102 奈洛比港事件（渡月船拒載獸，所以軛騎出洋只能走海路，從這裡上船）、2103 軛騎出洋。

### 勢力（2）


7. `factions/lagos-returners.json`「拉哥斯歸還黨」，`aka ["歸還黨"]`，`type` 小勢力，`founded` `"2101"`，`hq`「阿克拉」，`leaders []`，`ideology` 一句。**只寫存在與起源**：2099 拉哥斯之夜逃到阿克拉的難民；2101 新加坡會議三地代表一起走出會場，拉哥斯支由此生；法理是「國家把我家抵押給了月亮」（polity）；它窮、不養大軍，跟孟買支的雜牌軍不同；它的人有的進了阿克拉民兵、有的去了外洋當騎手匯錢回來。不寫它打過的仗、不寫領袖名。`relations`：`faction/mumbai-returners` 友好、`faction/accra` 友好、`faction/league` 緊張、`faction/green-line` 敵對、`faction/sub-saharan-umbrella` 緊張。`places ["place/accra", "place/lagos-blight"]`。

8. `factions/far-herd.json`「遠牧獵團」，`type` 獵團，`scale` 一句，`founded` `"2103"`，`hq`「吉布地（母港）」，`leaders ["character/juma-kiprop"]`，`ideology` 一句。掛點：before-collapse-powers「撒南是駕駛員最多的傘、向全球輸出獵團」、崩年底色 1.1 與 1.2、2103 軛騎出洋、軛鞍行訓練騎手。它是撒南軛騎出洋的群像代表：拘束的獸族生物系＋牧杖-III，接殘聯、群島、南亞的契約，錢匯回家鄉；母港在自由城市吉布地（躲國家徵召、獵牌效力最高）。`relations`：`faction/yoke-saddle-works` 友好、`faction/sub-saharan-umbrella` 友好、`faction/league` 友好、`faction/unbinders` 敵對、`faction/selene` 緊張（渡月船不載牠們的獸）。`places ["place/djibouti", "place/mombasa"]`。`mercPolicy` 不適用（獵團不寫）。

### 事件（2）

9. `events/djibouti-charter.json`「吉布地城約」，`date` `"2097"`，`period` `era/yoke-years`，`kind` 政治，tags `["diplomacy"]`。內容：崩年後守著這座港的一直是幾支獵團與跨線商團，國家沒來、也沒付過錢；2097 他們立了城約，不再繳稅、不認徵召，議會由出錢的商團與庇護獵團坐席。後果：本區第一座自由城市；國家在登記簿上從未放棄這塊地；2106 運河夜後它成了護航獵團的補給港。`factions`：`faction/far-herd` 不適用（2103 才成軍，**不要列**），列 `[]`；`places ["place/djibouti"]`；`characters []`。

10. `events/yoke-riders-abroad.json`「軛騎出洋」，`date` `"2103"`，`period` `era/tide-line`，`kind` 其他，tags `["campaign"]`。內容：2102 渡月船拒載獸之後，軛鞍行與撒南傘改走海路：第一船拘束的獸與年輕騎手從蒙巴薩出港，接外洋的守城契約；撒南崩前最年輕，2108 能開機的年紀最厚，別處（日本那把傘最缺）缺的正是這個。後果：遠牧獵團成軍；撒南傘從騎手契約抽成；騎手匯錢回家養活內陸城邦；解拘者開始在外洋盯上軛騎。`factions`：`faction/yoke-saddle-works`、`faction/sub-saharan-umbrella`、`faction/far-herd`；`places ["place/mombasa"]`；`characters ["character/juma-kiprop"]`。

### 人物（3）

共通：`relations` 至少 1 列指向既有或本批人物（沒有就 `[]` 也可）；`events` 只列本批或既有事件 id。

11. `characters/nadia-sabri.json`「娜迪雅・薩布里」，`kind` human，`born` `"2049"`，`faction` `faction/north-africa-umbrella`，`role`「亞斯文水閘總控的老閘長」。掛點：2091 放閘夜——那一夜照順序開閘、淹了下游的人就是她當班；2108 她五十九歲，仍坐在總控室，北非傘的水務比兵有權。不浪漫化：她淹過自己人的田，有人至今不原諒她（崩年底色 1.11 守住的與走出來的互不原諒）。`events ["event/aswan-sluice-night"]`。


13. `characters/juma-kiprop.json`「朱瑪・基普羅普」，`kind` human，`born` `"2081"`，`faction` `faction/far-herd`，`role`「遠牧獵團團長、軛騎」，`mech`「拘束的掘犬」。掛點：崩年八歲、在內陸活下來（中間厚的那一層）；軛鞍行訓出來的騎手，2103 軛騎出洋第一船；2108 二十七歲、駕駛時數使外貌比實際年輕（只寫一句「看起來不到二十」即可，不展開機制）。帶一團比他更年輕的騎手在外洋接約，匯錢回家。`relations`：`character/wanjiku-kamau`（note：送他上第一艘船的人）。`events ["event/yoke-riders-abroad"]`。

14. `characters/farida-naseri.json`「法莉妲・納賽里」，`kind` human，`born` `"2058"`，`faction` `faction/west-asia-umbrella`，`role`「荷姆茲海峽的名冊官」。掛點：2096 燃夜她是港務的無線電員，那一夜廣播「今夜來的，船永遠免費過海峽」的是她，記下來船名字的也是她；2108 她保管燃夜名冊，名冊上的船至今免費，有人想買名冊上的名字、有人想偽造——她一個都沒放進去。可提 2100 斷橋夜後她對大潮停戰的看法（一句）。`events ["event/hormuz-burning-night"]`。

### 年表增列（timeline-add.json）

兩筆：`2097`「吉布地城約」（event、era `era/yoke-years`、factions `[]`、tags `["diplomacy"]`）、`2103`「軛騎出洋」（event、era `era/tide-line`、factions 軛鞍行＋撒南傘＋遠牧獵團、tags `["campaign"]`）。`summary` 一句、外界口吻。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-af-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

worktree 裡 timeline 沒有本批兩個事件，會多 2 則「未出現在 timeline」警告——**預期的**，不要為消警告改 timeline.json。

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列 11 檔（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-02/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/`（只放 REPORT.md、timeline-add.json、review-add.json）；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-02 --up PROGRESS '已讀完先讀清單，開始寫 af-02' < /dev/null`）。
2. 先寫兩個勢力與四個地點，再寫兩個事件、三個人物，最後寫 timeline-add.json 與 review-add.json。
3. 跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-02/content/lore/…`（上列 11 檔） |
| 年表增列、白話介紹 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/{timeline-add,review-add}.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/REPORT.md` |

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋掛到哪；產出；沒做到或證據不足的；需要決定的事：與既有 lore 或設定筆記的矛盾逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 比開工前多不超過 2。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 11 個新檔存在、檔名＝id name 段；`timeline-add.json` 合法、2 筆；`review-add.json` 合法、11 列、每列`白話`≤ 60 字。
4. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-af-02`。本線團隊：`teams/fill-af`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-02 --up DONE 'af-02 新增 11 檔、年表 2 筆、白話 11 列，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-02/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
