# 任務：在隔離 worktree 新增 14 個 lore 檔，寫成撒南、北非、西亞三把傘與五個群像夜（batch af-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要原樣出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`content/lore/style/people.md`、`content/lore/README.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（「框架」與「崩年的底色」）、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/history-lines/g-umbrella.md`、`content/lore/factions/nairobi.json`、`content/lore/factions/accra.json`、`content/lore/factions/green-line.json`、`content/lore/places/lagos-blight.json`、`content/lore/places/rift-valley-seat.json`、`content/lore/events/green-line-purge.json`、`content/lore/events/lagos-night.json`、`content/lore/factions/league.json`、`content/lore/factions/remnant-wings.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/cx-af-01.md`（本檔）。相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同。

## 背景與唯一目標

lore 已有撒南的奈洛比、阿克拉、拉哥斯蝕域、綠線、恩凱之座，但**北非與西亞一筆都沒有**，三把傘也沒有勢力檔。設定層已定（before-collapse-powers「其餘區域」）：撒南人口最年輕、崩年後是駕駛員最多的傘、向全球輸出駕駛員與獵團、生物系主流；北非靠內海、以水為牆；西亞石油衰落後靠海峽與內海口岸、君主國多（歐洲老家族以外第二群崩前就是貴族的人，**他們沒有上月**——穹頂下的錢只有歐洲老家族、美國資本一半、韓國財閥三股）。本批唯一目標：照「逐檔規格」新增 14 檔，並把年表增列寫成一個資料檔交給領導，**既有 lore 一字不改**。

## 方法與禁忌（每條都適用）

- **節點優先、不暴力產 lore**：每件都要掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句（下面每檔都寫了掛點，body 裡要讀得出前因與後果）；不新增規格以外的具名人物、地名、事件、機體名、招式名、組織名。需要新詞時在 REPORT 列出、正文標「（提案名）」不必，但只能用規格裡已給的詞。
- **不拿其他作品類比**：不寫任何外部作品、電影、遊戲名；量級用世界內的詞（蝕潮、大潮夜、核心、崩年）。
- **中文命名避免直譯**；用語照 `content/lore/style.md` 與 `wf/workflows/planning/design-notes/terms-rename.json`：古代機本體叫古代機、外層叫裝甲；蝕潮（口語蝕）、漲潮、大潮；矢、衍型機、機魂、墟、骸片、裂晶、精粹、軛騎。禁用詞照 style.md。
- **國家、塞勒涅、巨頭、君主只削弱不萬能**：國家縮而不死（保住法理、徵召、天花板，失去沿海）；塞勒涅不當主謀；君主國有海峽與口岸，但守不住大洋岸、買不到古代機。
- **已裁示不推翻**：蝕線＝海岸線，怪獸多從海洋來、內陸少；墟在內陸高處；河口潮湧例外（獸沿大河上溯）成立；**2093 以前幾乎沒有機甲**（2091 衍一下線只有一台、2093 堅盾公刻後才普及），凡鐵碰不到核；正式的傘多半在 2101 新加坡會議之後成立，撒南傘例外在 2100；殘聯是南亞傘、兼全球獵牌發行者，2107 綠線清剿由撒南傘委託；奈洛比、蒙巴薩、三蘭港是殘聯與撒南傘的雙籤城（日常行政歸撒南傘）；恩凱至今無人能認；2089–2092 出生的孩子極少。
- **真相用可見度標**：外界不知道的放 `secrets`（`hidden`），只是傳聞的標 `rumor`；`summary`／`body` 照外界口吻寫。
- **群像為主**：本批**不新增任何具名人物**；君主、王室、議員、礦工、閘工一律群像不點名，不寫真實國名以外的真實人名。可引用既有人物（萬吉庫・卡馬烏、科菲・門薩、巴巴圖德、哈坎・德米爾），不改他們的設定。
- 不引用別線還沒進主 repo 的檔（例：`faction/euro-umbrella` 尚未存在，**不要引用**）；所有交叉引用必須指向 worktree 裡已存在的檔或本批新檔。

## 範圍（排除法寫死）

- 新增只限這 14 檔（在 worktree 的 `content/lore/` 下）：`factions/{sub-saharan-umbrella,north-africa-umbrella,west-asia-umbrella,yoke-saddle-works}.json`、`events/{aswan-sluice-night,hormuz-burning-night,gold-reef-night,twin-rivers-night,suez-canal-night}.json`、`places/{aswan,hormuz,gold-reef,suez,twin-rivers}.json`。
- **白話介紹（使用者要求，必交）**：14 檔每檔一列，寫進 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/review-add.json`，格式 `{"rows":[{"檔":"content/lore/…json","類別":"勢力｜事件｜地點","名稱":"顯示名","白話":"…","掛到":"…"}]}`。`白話`一到兩句、**不超過 60 字**，給人看的白話：說它是什麼、為什麼存在，不堆術語；`掛到`寫節點／主線／年表／崩年底色條（例「N05；G 線；底色 1.1」）。之後會交 Fable 與使用者審敘事基調。
- 年表**不要改** `timeline.json`；改把要增列的條目寫成 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/timeline-add.json`（格式：`{"entries":[…]}`，每筆照 content/lore/README 的 timeline 格式；領導帶回時插入）。
- 不做：上列以外的任何檔（含 `timeline.json`、既有 lore、`content/index/`、`content/batches/`、`content/base/`、`src/`、`wf/` 除報告目錄）；不刪檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-af-01/`）。
- 件數 gate：新增超過 14 檔就停下回報；容量 gate：任一新檔 `body` 超過 1500 字就停下回報。任一觸發都停。

## 逐檔規格

格式照 `content/lore/README.md` 欄位表；`body` 300–1500 字、markdown、可用 `## ` 小標；`gameRefs` 一律 `[]`。名字照下面用，不另取。大勢力 body 必含四小節：`## 軍事組織與作戰風格`、`## 對傭兵：態度與補給`、`## 藍本古代機與研發路線`、`## 外交`。每檔 body 第一段都寫「崩前是什麼→崩年怎麼了→2108-01 是什麼」。

### 勢力（4）

1. `factions/sub-saharan-umbrella.json`「撒哈拉以南非洲那把傘」，`aka ["撒南傘"]`，`type` 大勢力，`founded` `"2100"`，`hq`「無固定總部：席位在奈洛比與金山之間輪」，`leaders []`。掛點：崩年底色 1.1（中間厚兩頭薄；崩前最年輕，所以 2108 能開機的年紀最厚）、1.2（能驅動核心的人貴）、N05（2099 拉哥斯之夜失城，同年金山夜得墟，2100 成傘）、G 線（撒南傘結合港口與軛鞍行調獸群）、N09（2107 委託殘聯發清剿令）。兩根柱：奈洛比軛鞍行（獸）與金山深井（墟出精粹）。**向全球輸出駕駛員與獵團**寫成一節群像：撒南的年輕騎手跟著外洋的契約走，匯錢回家，傘從駕駛員的契約抽成；這與日本那把傘（最缺駕駛員、用遙控機與傳統 AI 機守牆）正相反，可提一句。`relations`：`faction/league` 友好（雙籤城、委託清剿）、`faction/nairobi` 同盟、`faction/accra` 同盟、`faction/yoke-saddle-works` 同盟、`faction/green-line` 敵對、`faction/tide-creed` 敵對、`faction/selene` 緊張（渡月船拒載獸）、`faction/remnant-wings` 友好、`faction/north-africa-umbrella` 中立。`places`：`place/nairobi`、`place/accra`、`place/gold-reef`、`place/lagos-blight`。`mercPolicy` generosity 3、reliability 4。`mechSeries` 只寫既有：`牧杖-III型（C）`、`牧者（B）`、`堅盾-I`。藍本古代機段：恩凱無人能認，傘的路線是學它的軛骨而不是叫醒它；不寫 `ancientMech` 欄。

2. `factions/north-africa-umbrella.json`「北非那把傘」，`aka ["北非傘"]`，`type` 大勢力，`founded` `"約 2102（水務自 2091 起）"`，`hq`「開羅（尼羅河谷）」，`leaders []`。掛點：崩年底色 1.4（糧在內陸、尼羅河谷是糧）、1.6（國家縮而不死：地中海岸挨打、政府退進河谷）、河口潮湧例外（獸沿尼羅河上溯）、2091 放閘夜（以水為牆的起點）、2106 運河夜（與西亞爭護航權）。作戰風格：以水為牆——閘、渠、淹地把獸困住或逼退，機甲一隻隻殺（2093 後才有機甲可殺）；地中海是內海、少見獸上岸，最險的是三角洲河口與紅海口。對傭兵：付糧不付現的契約多，護糧船、守閘、清渠。藍本古代機：沒有；用公刻堅盾與買來的型錄件。`relations`：`faction/west-asia-umbrella` 緊張（運河夜）、`faction/sub-saharan-umbrella` 中立、`faction/league` 中立（採用殘聯評等）、`faction/selene` 中立、`faction/remnant-wings` 中立。`places`：`place/aswan`、`place/suez`。`mercPolicy` generosity 2、reliability 4。

3. `factions/west-asia-umbrella.json`「西亞那把傘」，`aka ["西亞傘"]`，`type` 大勢力，`founded` `"約 2102（海峽盟約自 2096 起）"`，`hq`「無固定總部：席位輪在海峽口岸的王城」，`leaders []`。掛點：magnates「西亞國家本身就是能源巨頭」、before-collapse-powers 西亞段、崩年底色 1.6、2096 燃夜（以海峽通行權換援軍，傘的前身）、2100 斷橋夜（第一次有人破大潮默契；N10「兩河破約的先例」）、2106 運河夜。要寫清楚：君主國的錢是地、油與海峽，**放不進穹頂**，所以他們留在地上；石油崩前已衰、崩年後燒掉一部分換命（燃夜）；傘的收入是海峽與內海口岸的通行費。軍事：口岸與海峽守備＋受雇獵團＋殘翼空援；大潮停戰默契在這把傘裡最不被信任。藍本古代機：沒有。`relations`：`faction/north-africa-umbrella` 緊張、`faction/remnant-wings` 友好、`faction/league` 中立、`faction/selene` 中立（君主沒上月，與穹頂不同路）、`faction/sub-saharan-umbrella` 中立。`places`：`place/hormuz`、`place/twin-rivers`、`place/suez`。`mercPolicy` generosity 4、reliability 2（note：出價高，但兩河那一夜之後，誰都知道他們的停戰可以被撕）。

4. `factions/yoke-saddle-works.json`「軛鞍行」，`type` 企業，`founded` `"2095"`，`hq`「奈洛比」，`leaders ["character/wanjiku-kamau"]`（她是後台；body 說清楚她是市長、軛鞍行的後台，日常由群像的技師管）。`scale`、`ideology` 各一句（方向：能捕的別殺）。掛點：2094 大裂谷掘墟→2095 拾號初陣與軛鞍行開張（年表）、magnates「崩年後的新巨頭不是公司」、history-lines.json 「蛻皮歸撒南傘奈洛比軛鞍行」、voices「軛鞍行養著的獸蛻一次升一級」、2103 牧杖-III 下線。內容：賣軛、鞍、拘束矢、拘束艙維護；養獸、等蛻；訓練騎手，騎手跟獸一起被外洋獵團租走（輸出駕駛員的實際管道）。不重寫 nairobi.json 已寫的拾號故事，只引一句。`secrets` 一列 `visibility: "rumor"`，text 方向「軛鞍行的獸總要有地方來：有人說它默許、甚至收購某些養裂帶的子體」，`knownBy ["faction/league"]`。`relations`：`faction/nairobi` 同盟、`faction/sub-saharan-umbrella` 同盟、`faction/league` 友好、`faction/tide-creed` 敵對、`faction/unbinders` 敵對、`faction/green-line` 敵對、`faction/selene` 緊張。`places`：`place/nairobi`、`place/rift-valley-seat`。

### 事件（5）

共通：`kind`、`tags` 照 README；`consequences` 3–5 條、一句一條；`characters` 多半 `[]`。

5. `events/aswan-sluice-night.json`「放閘夜」，`date` `"2091"`，`period` `era/mimic-dawn`，`kind` 災難，tags `["tide"]`。內容：大潮夜獸沿尼羅河三角洲上溯（河口潮湧例外）；那時**沒有機甲**、凡鐵殺不死；亞斯文的水閘總控照順序開閘，水淹河谷、把獸困在泥水裡，獸撲不到城、意圖受挫，退潮時退回三角洲（不是被殺）。代價：下游的田與村是自己淹的。後果：北非「以水為牆」從這夜開始；2093 堅盾普及後才變成「水困住、機甲一隻隻殺」；水務的人成了北非的「一夜到」；三角洲海岸成蝕線。`factions`：`faction/north-africa-umbrella`；`places`：`place/aswan`。

6. `events/hormuz-burning-night.json`「燃夜」，`aka` 不適用（event 無 aka 欄；可在 body 寫口語「荷姆茲燃夜」），`date` `"2096"`，`period` `era/yoke-years`，`kind` 戰役，tags `["tide", "diplomacy"]`。內容：大潮夜獸從外洋壓進海峽；海峽兩岸的君主國把崩前存下、已不值錢的原油倒在水面點火，燒出一道火牆；同時廣播：今夜來的，船永遠免費過海峽。來的是受雇獵團、殘翼與幾支別區的船隊（不點名）。後果：海峽守住；「燃夜名冊」（今夜來了誰）至今照兌現；通行權成了西亞的貨幣、海峽盟約是西亞傘的前身；燒掉的是崩前的錢。`factions`：`faction/west-asia-umbrella`、`faction/remnant-wings`；`places`：`place/hormuz`。

7. `events/gold-reef-night.json`「金山夜」，`date` `"2099"`，`period` `era/yoke-years`，`kind` 挖掘，tags `["dig", "tide"]`。內容：金山（約翰尼斯堡）的舊金礦是世上最深的井，崩年後改當地熱井與避難隧道（「誰握地熱井誰是城主」）；2099 大潮夜，最深的井底塌穿，下面是墟——刻痕、骸片、裂晶，**沒有古代機**；井底當班的人沒上來（群像）。同年拉哥斯之夜失城，同一把傘一年內一失一得。後果：墟出精粹成了撒南傘第二根柱（第一根是軛鞍行的獸），2100 撒南傘成立；稽古學會要讀刻痕得付錢；井口由傘與國家共管（國家有法理、傘有人）。`secrets` 一列 `visibility: "rumor"`：井底更深處還有一道沒打開的門。`factions`：`faction/sub-saharan-umbrella`、`faction/shell-society`；`places`：`place/gold-reef`。

8. `events/twin-rivers-night.json`「斷橋夜」，`date` `"2100"`，`period` `era/yoke-years`，`kind` 戰役，tags `["war", "tide"]`。內容：兩河下游兩個縮小的國家（不寫國名、不點名，寫「上游的一方」「下游的一方」）為水與橋打了兩年；大潮夜獸從河口上溯，兩邊照慣例停手各自打獸——這慣例那時剛在別處成形（不要引用他區事件 id，只寫「大潮夜不打人的默契」）；其中一方趁對方的隊伍在橋那頭打獸，炸了身後的橋。第一次有人在大潮夜破默契。後果：橋至今不修，成了停戰線；「大潮夜停戰」從此在條文以外沒人敢單靠默契；這一夜是日後各方談全面停戰時一定會被提起的先例；西亞諸國把海峽盟約擴成傘。**不寫哪一方是誰、不寫誰贏**——寫兩邊都輸。`factions`：`faction/west-asia-umbrella`；`places`：`place/twin-rivers`。

9. `events/suez-canal-night.json`「運河夜」，`date` `"2106"`，`period` `era/league`，`kind` 戰役，tags `["war", "diplomacy"]`。內容：北非傘與西亞傘各自雇獵團、各自宣稱運河護航權（收護航費）；一夜兩邊的護航隊在運河中段為同一支船隊對峙，紅海口的獸趁漲潮上來，船隊沉了一半。後果：同年殘聯頒獵牌法，兩把傘第一次用殘聯評等解決傘際爭端——運河護航改成持殘聯獵牌、評等夠的獵團輪值，護航費兩傘分（提案）；北非與西亞至今緊張；護航成了獵團在這一區最穩的活。`factions`：`faction/north-africa-umbrella`、`faction/west-asia-umbrella`、`faction/league`；`places`：`place/suez`。

### 地點（5）

body 照既有地點檔四到五小節：`## 地貌與氣味`、`## 誰在這裡`、`## 發生過什麼`（條列，年份對年表）、`## 2108 的狀態`、`## 獵團能在這裡幹什麼`。`world` 一律 `earth`。

10. `places/aswan.json`「亞斯文城邦」，`region`「非洲・尼羅河上游」，`continent` 非洲，`kind` 城邦，`status2108`「守住（水閘在手）」，`factions` `["faction/north-africa-umbrella"]`。重點：水閘總控、從三角洲退上來的人、水務的人比兵有權。獵團的活：守閘、清渠裡卡住的獸屍、護糧船。

11. `places/hormuz.json`「荷姆茲海峽」，`region`「亞洲・波斯灣口」，`continent` 亞洲，`kind` 港，`status2108`「守住（大潮夜燒油）」，`factions` `["faction/west-asia-umbrella", "faction/remnant-wings"]`。重點：燒過的海面、燃夜名冊、通行費、海峽口岸的王城（不點名）。獵團的活：大潮前守海峽、護油輪改裝的運糧船、名冊上的船免費。

12. `places/gold-reef.json`「金山深井」，`region`「非洲・南非高原」，`continent` 非洲，`kind` 遺跡，`status2108`「開採中（墟出）」，`factions` `["faction/sub-saharan-umbrella", "faction/shell-society"]`。重點：地熱、深井、墟出裂晶、礦工群像。獵團的活：護送裂晶出井、陪學會下井讀刻痕、井下偶有從墟裡出來的東西（低階、少見，寫「偶有」即可）。

13. `places/suez.json`「蘇伊士運河」，`region`「非洲・蘇伊士地峽」，`continent` 非洲，`kind` 其他，`status2108`「開航（評等獵團輪值護航）」，`factions` `["faction/north-africa-umbrella", "faction/west-asia-umbrella"]`。重點：一條運河兩把傘、紅海口是蝕線、地中海口是內海。獵團的活：輪值護航（要殘聯獵牌與評等）。

14. `places/twin-rivers.json`「兩河斷橋」，`region`「亞洲・底格里斯河與幼發拉底河下游」，`continent` 亞洲，`kind` 野地，`status2108`「停戰線（斷橋未修）」，`factions` `["faction/west-asia-umbrella"]`。重點：斷橋、渡船、兩岸的哨。獵團的活：大潮夜替兩岸之一守渡口（接了會被另一岸記住）、清河口上溯的獸。

### 年表增列（寫進 timeline-add.json，不改 timeline.json）

四筆：`2091`「放閘夜」（event、era `era/mimic-dawn`、factions 北非傘、tags `["tide"]`）、`2096`「燃夜」（`era/yoke-years`、西亞傘＋殘翼、`["tide","diplomacy"]`）、`2100`「斷橋夜」（`era/yoke-years`、西亞傘、`["war","tide"]`）、`2106`「運河夜」（`era/league`、北非傘＋西亞傘＋殘聯、`["war","diplomacy"]`）。另一筆 `2100`「撒南傘成立」（不帶 event、era `era/yoke-years`、factions 撒南傘、tags `["diplomacy"]`，summary 寫明金山夜之後成傘）。**金山夜不進年表**（2026-10-24 裁示）。`summary` 一句、外界口吻。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node content/lore/check.ts`（在 worktree 根跑，0 錯；新增事件因金山夜不進年表會多 1 則「未出現在 timeline」警告，其餘警告不得增加） | 每寫完一檔跑 |
| `npm run check`（末行 `OK 0 errors`） | 全部寫完跑一次；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-af-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

注意：worktree 裡 timeline 沒有新增的四個事件，所以這四個事件在 worktree 內也會報「未出現在 timeline」警告——**這是預期的**，REPORT 記下警告數即可，不要為了消警告去改 timeline.json。

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列 14 檔（在 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/` 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/`（只放 REPORT.md、timeline-add.json、review-add.json）；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不用 MCP；不上網。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-01 --up PROGRESS '已讀完先讀清單，開始寫 af-01' < /dev/null`）。
2. 先寫四個勢力檔，再寫五個地點、五個事件，最後寫 timeline-add.json 與 review-add.json。
3. 跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。若檔名含 REPORT 被擋，改寫同目錄 `report.md`。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-af/wt-af-01/content/lore/…`（上列 14 檔） |
| 年表增列 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/timeline-add.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/REPORT.md` |

REPORT：開頭「已讀清單」（逐行列先讀的每個路徑）；再四段（做了什麼：逐檔一句＋掛到哪個節點／主線／年表；產出；沒做到或證據不足的；需要決定的事：發現與既有 lore 或設定筆記矛盾的地方逐條列）；末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內 `node content/lore/check.ts` 末行 `errors=0`，warnings 不多於 7（既有 2＋本批 5 個事件未進 worktree 年表）。
2. worktree 內 `npm run check` 末行含 `OK 0 errors`。
3. 14 個新檔存在、檔名＝id name 段；`timeline-add.json` 是合法 JSON、5 筆；`review-add.json` 是合法 JSON、14 列、每列`白話`≤ 60 字。
4. REPORT 存在且開頭有「已讀清單」。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 在 worktree 內修到過；修不好就發 `FAILED`，REPORT 寫證據。
- **測不出來**（指令沒跑成、拿不到證據）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-af-01`。本線團隊：`teams/fill-af`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-af-01 --up DONE 'af-01 新增 14 檔、年表增列 5 筆，lore check 0 錯' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-af/af-01/REPORT.md`（STATUS 與標題照實際結果換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
