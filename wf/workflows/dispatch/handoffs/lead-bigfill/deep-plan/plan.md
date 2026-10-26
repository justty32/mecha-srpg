# 地球 lore 加深計畫（cx-bf-deep-plan，第2輪）

本輪依 [領導裁定](../deep-rulings.md) 重寫。62件、六批；人物24（戰鬥職19）、事件29、地點9。每件都有光，54件有獸或吼聲；14件為「獸在世界裡」的事件／地點。內容只到計畫與交接稿，正式產出仍由領導派工。

## 1. 已讀清單

本線已親讀原交接書先讀資料，並重讀裁定、style總綱及people；大型表用tabledb條件查詢或程式介面取所需欄位。下列使用現存路徑（已封存的來源統一指向done/2026-10-26）。

`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`。

`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`、`content/lore/README.md`、`content/lore/style.md`。

`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/verdicts.json`。

`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/review-all.json`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`。

`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`。

`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`、`content/batches/2026-10/am-01.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`。

另讀 `wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/dispatch/README.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md` 與 world-pillars 三個分層入口。逐件所用物種、bodyplan、既有機型與地方檔列於 new-items 的「依據檔」，也已納入相應交接書與manifest mustRead。

開場已跑SESSION／WAIT計數及inbox_read；本線open沿用SESSION-LOG的lead-bigfill項，不越界改日誌。上線已寄PROGRESS，每完成步驟讀orders。新人物設計前與驗收前都實際ls人物目錄，包含lead-fill-pilots目前已落地的人物，未借用該線id；正式開批前仍須按新base重核。

## 2. 盤點

以下保留第一輪2026-10-26、HEAD `7a005919d5afb1bc7583d9c73130452dddd72365` 的盤點快照與判讀，不把同期新人物混入歷史計數。第二輪只更新新件建議；新id碰撞檢查則以驗收當下工作樹為準。


完整逐 id 盤點在 [六區盤點](region-inventory.json)；[二名與古代機對照](beasts-ancients.json) 共25列（16個A級二名個體、9台古代機）。六區地點按 region 互斥歸類；人物按主要舞台人工歸類，含古代機人物、機魂及已故者；事件依 places 關聯，可跨區重計。只計索引 active，不把數字相加當全庫總量；東亞含俄羅斯東部，海上含東南亞、大洋洲、南極與候鳥號，月面／軌道／中亞及全球學術人物未列六區。

| 區 | 地點／人物／事件 |
|---|---|
| 東亞 | 12／14／21 |
| 南亞 | 14／11／35 |
| 歐洲／內海 | 8／8／12 |
| 非洲／西亞 | 15／15／23 |
| 美洲 | 24／10／21 |
| 海上與殘聯 | 13／14／19 |

各區代表件與冷處隨逐 id 清單一起列入 region-inventory。東亞從仙台、真瀨 友則與守燈向江口和行在延伸；南亞從補天院、羅凱婭與唱名夜補到新駕駛與蘆網、潮狼；非洲西亞從荷姆茲、法莉妲與燃夜轉向吉布地雙影、杜拜空帆及亞斯文護岸。海上從望加錫、莉拉與接糧長夜補到泥母、燈腹、矢櫛、空帆與淵顎。美洲與歐洲的審查指定缺口如下。

審查文字說「五座模板地點」，verdicts 實列六城：西雅圖、溫尼伯、哈瓦那、瓦爾帕萊索、貝倫、巴西利亞。本輪六城都補到人：五城有人物，巴西利亞改用沿岸來客群像事件，不再額外造縫衣人。tone-fix 已替這些城加記號，不能再宣稱當下沒有獸、沒有人味；不重寫歸船斷座夜、斷纜夜、借山空返、雪底留名、空碗迎船。尤其溫尼伯守簿人艾妲已在文內，新增角色改為雪路護送駕駛。

四位文書角色是莉娜・菲瑟（鹿特丹）、克萊兒・雷諾（聖馬洛）、奧斯卡・林德（漢堡）、瑪塔・貝里尼（熱那亞）。城市本來已有其他駕駛，不能把審查讀成整城無人開機；新件是補這四位生活中能實際開機的人，不改他們的職業。

### 二名個體 × 夜事件

16個 A 級 named 個體中，12個已有專屬命名事件，對照逐隻列於 beasts-ancients。kaiju2 六隻的新名裡，折桅白冠、斷纜青鬣已被 tone-fix 採用；餘四隻的地方正文也已寫出命名場景，只欠獨立事件檔。B類仍12件：四個命名夜、兩名當夜人物與六個相接的事件／地點。後者改為低階獸的可見場景，並非再造十二次首見。

碎燈鳴塚：2105「仙台外崖燈盞盡碎，內港換班未斷」，既有年表快照 entries[122]。掩舟暮帷：2107「舊船覆幕，內泊留燈」，entries[160]。斷橋骸林：2107「白汊空橋斷後另繫回程索」，entries[161]。三者都只 setKey 加 event，不另添同夜條目。閉港千扉：既有2103條是井工錯班；地點說次年第三次堵港才命名，因此新事件與新年表用2104。年級日期不自行加成漲潮日或新的大潮。

`content/lore/timeline.json` 是 entries 容器，直接 tabledb CLI grep 會得到空 rows；本線用 tabledb.load 的 meta.entries 建唯讀查詢視圖核實，未以空結果判成缺史。合併時需 date＋title 重定位，不能照抄快照索引。


### 古代機 × 周邊

[對照表](beasts-ancients.json)保留古代機的既有地點、人物、事件與排除理由，recommendation已全換成本輪id。夸父以窩口刻痕穿霜、裝甲映日補兩件；處容仍在釜山，韓寶羅留在慶州空陵，看骸片亮、為訪客敲鼓。刑天留在蒙特婁學會地下沉睡，呂克看見裝甲裂紋微光；城外國家崗仍沒有地下鑰匙。

維拉科查在基多，的的喀喀留空寢床，本輪讓引船者看水下刻痕之光，不把本體移回湖裡。迦梨兩件寫孟買門外的紅光目擊與骸片紫光，光可被看見、歸因迦梨只作rumor，不把先民聲音的真相公開。恩凱仍未認主，娜莉見骸片亮，崖崗聽既有風穿骨縫的鳴聲，沒有古代機說話。

埃吉爾以既有月光下濕亮刻痕補接哨事件與浮屋，不搶既有possible認主事件或丹麥技工。彩虹蛇延續既有露脊紅、紫、綠的變色，瑪拉在圈外見證，本體未開、沒有新隆起。赫卡忒與恩底彌翁屬月面，只列盤點排除、不產出。八組共12件全有c，不增加認主、交易或身體動作。

## 3. 設計理念

每件先給讀者能看見或聽見的一瞬，再放進那個地方的後果。獸有肢體、光色與動作，不能只在結尾掛一個名字。人敢把誇張的話吼出來，說完仍要付修機、失地與受傷的代價。人物的站起來是自己作決定，不由普通機魂代說口號。海岸的獸源仍在海上，內陸只留五湖與既有淡水通道的菌絲。古代機不替人解答，周邊人的目光仍必須碰到它的光或遺留之物。已有命名夜只展開同一夜，英雄與地區不互相搶功。每區留下不同聲音，日常小善意只作底色，不再用一組小物件撐整批。

### 共通方法與禁忌（原樣採用）

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

裁定優先：`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`。a＝獸在畫面上；b＝引號內可吼出的話；c＝古代機、墟、骸片或異能被看見／聽見。本輪引號都是人物口號或既有二名，不新增遊戲技能。每件有光、人物每人有招牌話與站起來的瞬間；戰鬥職按實際駕駛／拘束職計，不把引路或探路自動算戰鬥職。

受限物件全計畫配額：燈只分給〈鳴崖碎燈夜〉一件；鞋、繩／索、乾衣、杯、梯、扶手、熱水皆0件核心。白汊原年表題名與一次撤離動作可以保留索，不能再以繫索為主畫面。燈腹是既有物種，亮囊是獸的器官，不是照明物件。修鼓、拐杖、鉚錘等仍服務各自人物，工人不得把同一物件擴成另一件的核心。

## 4. 新件表

[new-items.json](new-items.json)是62件唯一逐件設計來源，具有原交接書要求的id、類型、名、定位、掛點、可見度、possible、年表建議、插入建議、新名詞，以及三至五句body要點與固定關聯欄位。新增「光／光證據」「核心畫面／受限物件」「站起來的瞬間／招牌話」「戰鬥職」「獸在世界裡／物種」「依據檔」，讓裁定能逐件核對。精簡人審版為 [review-draft.json](review-draft.json)；裁定核對視圖為 [ruling-coverage.json](ruling-coverage.json)。

構成A38／B12／C12；人物24／事件29／地點9，不新增勢力。24人全有招牌話與站起來瞬間，其中18名駕駛加1名拘束手，合計19名戰鬥職。機型僅用既有堅盾-I型、合印-II型、鐵砧-II型・吊鉚、NR-03，對應model與frame路徑已列入規格。非人物事件裡的駕駛以不具名群像處理，不偷增人物檔。

62件均有a／b／c之一，54件有a或b（87.1%，高於三分之二）；12件C類全有c。14件「獸在世界裡」以事件或地點呈現，含kaiju2的沫顎、扣甲、燈腹、蘆網、雙影、空帆、泥母與鹽針、矢櫛、淵顎，以及既有C級潮狼、抱樁。14件中8件在環太平洋海岸；其餘落在既有近海港岸與兩處淡水菌絲路徑，不增加內陸獸災。B以下無二名，只有四個既有A級命名夜用二名。

所有新增id均無deep-前綴，人物以原文拼寫或姓名拼音，事件與地點按畫面命名；檔名與id name段一致。新中文名標提案，不回譯英文aka。人物／地點用本文自然連至舞台，不擅增characters.places或places.characters欄；反向需求只寫既有relations／events、勢力places及年表event。沒有跨批新引用依賴。

三個possible事件為〈仁川咬岸〉2108-03、〈庫爾納蘆口〉2108-04、〈出塢一踏〉2108-02，均帶rumor tag、occurs: possible，不入確定年表。26個過往事件中，三個既有同夜只補event，其餘23個列timeline-add建議；不把年級日期擅定成新大潮。

## 5. 分批

完整檔案清單在 [batches.json](batches.json) 的files，六份交接書「交付」逐檔列絕對路徑，manifest清單由相同逐件資料產生。每區至少10件，每批最多11檔，低於15檔上限。

| 批 | 地區 | 件數 | A／B／C |
|---|---|---:|---|
| bf-deep-01 | 東亞 | 11 | 5／3／3 |
| bf-deep-02 | 南亞 | 10 | 8／0／2 |
| bf-deep-03 | 歐洲／內海 | 10 | 8／0／2 |
| bf-deep-04 | 非洲／西亞 | 10 | 8／0／2 |
| bf-deep-05 | 美洲 | 11 | 6／3／2 |
| bf-deep-06 | 海上與殘聯（環太平洋） | 10 | 3／6／1 |

領導準備worktree後可各批平行產出；本線只交草稿，不啟動工人。每批先建齊最小JSON解開同批互引，再展開body。正式啟動前對照最新人物目錄及lead-fill-pilots清單；若新增碰撞，領導只改本計畫新id並同步全部稿件，不改對方人物。

## 6. 產出交接書稿

交接書：[01東亞](cx-bf-deep-01.md)、[02南亞](cx-bf-deep-02.md)、[03歐洲內海](cx-bf-deep-03.md)、[04非洲西亞](cx-bf-deep-04.md)、[05美洲](cx-bf-deep-05.md)、[06海上殘聯](cx-bf-deep-06.md)。沿用現存cx-am-01骨架：先讀、背景、方法、範圍、逐檔規格、工具、資源、工作、交付、固定四條驗收、失敗處置、終局回報。身分cx-bf-deep-NN、teams/bigfill、子代理上限1，worktree及報告目錄與原交接書完全相同。

每份「方法與禁忌」明列deep-rulings路徑；mustRead含現存範本、裁定與逐件物種／機型來源。規格給body要點及固定欄位，不替工人寫全文。只新增、不改任何既有檔；inserts欄位為[file,jsonPath,op,value,why]、op限append/setKey，timeline-add欄位為[date,title,summary,event,era,factions,tags]；無資料亦交空表。

年表缺列警告只允許交接書明列的本批過往事件，須附timeline-add／inserts對應；possible不列此警告白名單。合併線按date＋title重定位三條舊年表，僅補缺鍵，有異值交領導，不以快照索引直接覆蓋。

## 7. manifest 稿

六份草稿：[01](bf-deep-01.manifest.json)、[02](bf-deep-02.manifest.json)、[03](bf-deep-03.manifest.json)、[04](bf-deep-04.manifest.json)、[05](bf-deep-05.manifest.json)、[06](bf-deep-06.manifest.json)。contract content-batch/1，mode add、status draft、base TBD，allow.modify空、namePrefix空；allow.kinds只列該批實際lore目錄，files／ids及maxFiles用實際清單，reportDir指lead-bigfill/bf-deep-NN。

領導建隔離worktree後填base，移正式稿至content/batches；本線不寫該目錄、不commit。manifest checks供領導收批，工人仍只跑交接書固定四條，不自行追加檢查。mustRead與交接書先讀清單一致，無已搬走的來源路徑。

## 8. 營運鉤子建議

以下只建議契約、事件或對話，本線不產出base、不承諾遭遇系統已支援。

- 江口回收契約：沫顎封住舊渡口，與江燕選另一個撤回點。
- 仁川換防事件：扣甲可能咬住排水口，尹海真請玩家護送清淤工撤離。
- 庫爾納採收事件：看見蘆網白冠時，可改道或停止回收。
- 蘇拉特後送對話：傷兵仍想返浦那，阿娜雅先問玩家能接走多少人。
- 鹿特丹護駁契約：抱樁侵入泊位，尼克要守住糧駁退路。
- 聖馬洛對話：索蓮願意接有限巡守，傷勢不因一次鼓舞消失。
- 漢堡救援事件：吊架將倒，安珂請玩家先清出架底工人。
- 吉布地觀測事件：雙影兩核錯落，辨對輪廓才決定岸隊站位。
- 白汊探路契約：米拉帶隊辨認蘆網接岸的位置，不把採收寫成收復菌床。
- 望加錫修船事件：泥母出現時停工退岸，回港後再與雅妮修船。
- 八打雁巡看契約：矢櫛據住高檐，搬運者等待安全空檔，不必全殲。
- 紅心圈外對話：與瑪拉觀看既有露脊變色，任何選項都不換取開挖或認主。

## 9. 需求與待決

62個新件名與人物新口號仍為提案，產出REPORT逐條列出；不提出新機型、技能、勢力、具名公司或世界規則。角色吼聲可以浪漫誇張，但不讓句子本身觸發未定能力。普通機魂無鮮明個性，人物不替全球發言。lead-fill-pilots與本線可同時存在：本線人物是地方lore，不自行宣稱可雇用，也不寫person或招募池。

迦梨紅光與骸片的歸屬、彩虹蛇露脊解釋維持rumor，不新增hidden答案。恩凱骨鳴與埃吉爾濕亮刻痕沿用既有可見現象；夸父窩口、空陵骸片、刑天微光與空寢床刻痕是本輪地方畫面提案，均不伴隨古代機動作。正式合併如有與其他線的新內容矛盾，由領導裁定，不反改既有檔。

原交接書驗收固定四條不變，第2條件數按本輪裁定60–75。後續worktree、base與報告目錄準備是產出前置，不阻塞本次計畫稿。原盤點、古代機對照、三條年表重定位與八打雁2104判讀均保留。

### 本線固定四條驗收結果

1. 通過：plan.md含1–9段；填入結果前18523 bytes，填入後仍小於50KB。
2. 通過：review-draft為合法wf-table/1，62列（60–75內）、白話最長34字；全部新id及name段全計畫唯一，無deep-前綴、不撞現有檔；逐名grep content無撞名。24人物都有站起來瞬間與招牌話，其中19人為戰鬥職。
3. 通過：六份交接書brief_lint --strict為0違規／6檔；六份manifest合法JSON，files／ids／maxFiles／allow.kinds、固定欄位、年表與插入需求、先讀清單和現存mustRead路徑全部一致；附表無第一輪id殘留。
4. 通過：逐件語意審閱及排除核對，以帳／地契／城約為主角0件、新增古代機認主或交易0件、月面或萬潮葬王0件。62件皆有光，54件a／b，14件獸在世界裡，12件古代機周邊皆c；受限物件核心僅燈1件，其餘0。

驗收於2026-10-26第二輪執行；未改content或其他工作流檔、未commit。完成後按原交接書寄出DONE，不追加驗收。
