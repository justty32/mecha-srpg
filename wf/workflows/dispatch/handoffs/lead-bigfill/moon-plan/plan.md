# 月面大填充計畫（cx-bf-moon-plan，第2輪修訂）

## 1. 已讀清單

本輪先讀 [moon-rulings.md](../moon-rulings.md)、[style.md](../../../../../../content/lore/style.md) 與 [people.md](../../../../../../content/lore/style/people.md)，再對照原交接書與中斷後所有產物。裁決優先於首輪計畫；本稿維持36件、3批各12檔，只設計lore，不寫content。

完整已讀及查詢來源見 [read-list.json](read-list.json)（95列）。保留首輪已讀的盤點依據，本輪重讀AGENTS、使用者規則、content流程與欄位契約、共同規格、裁決、風格、D線與相關史實；沿用既有盤點時不把它宣稱為本輪重新全文閱讀。年表與節點仍走條件查詢。範本現存於 `wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-am/cx-am-01.md`，manifest骨架仍是 `content/batches/2026-10/am-01.json`。

產物與暫存只寫授權目錄，通信只用原交接書指定信箱。未動content、src、test、其他wf檔或git，未啟動產出工人。開場已讀SESSION-LOG／WAIT_USER與orders；上線PROGRESS與終局DONE依原交接書回報。

## 2. 盤點


逐件盤點在 [inventory.json](inventory.json)（61列：id、類型、名稱、一句、掛點、範圍、檔），核心五地之外，列出直接月面人物、組織、事件與地月橋接的既有件。三港城邦與候鳥號是橋接，不是本輪新增地球內容的許可。grep命中的遠方型錄客戶若只提塞勒涅，不能一律當作月面缺口；本計畫不沿關係圖無限展開。

五個 `world: moon` 地點各有明確職責：`place/tranquility-city` 是唯一月城與統治全景；`place/moonbow` 是舊世界地月工業與罷工停機的可見弧光；`place/farside-ruin-belt` 是N04封鎖與走私的起點；`place/endymion-vault` 是不可自由進入、古代機仍永眠的中心；`place/dark-quay` 是暗面與地勤共用的舊貨棧。新增不得把這五個主檔再寫一份。

### D線與節點

完整按來源分列的年表與節點摘錄在 [history-map.json](history-map.json)（58列）。history-timeline的「掛線理由」是掛點來源，lore/timeline用來核已落地事件與日期；lore年表採entries容器，tabledb直接grep得到空列，後改用tabledb.load取得entries，在記憶體包成Table後條件查詢，不修改原資料。

D前史：2029創立→2041靜海→2043月弓→2066定班→2077軌道中立；崩年富戶買船票上月，2092財閥上月已落地，2093格爾木分家把人才送上月。2096船廠出售與赤道港協定鎖定既有三港。公司是管家，不能從運輸優勢推論它事先安排蝕潮。

N04（2097）：重蝕同夜露墟、三個月內封鎖，恩底彌翁永眠，學會抗議，月之暗面誕生。封鎖也是富人的牆；月海是月亮的「海」，不新造月面海洋或持續獸潮。2098大罷工、2099赫卡忒傳聞與銀環入冊、2102拒載及長槍流出都是其後果；外圍工人可以有故事，古墓本身不因此新開門。

N07（2104–2105）：七號回港是罕見、無解的歷史，最早登錄仍是2101老爹。2105搬魂及複製失敗、無魂鐵偶鎮壓、無籤會與無肉者宣言，連到「機魂算裝備」的層次。2098仍是人駕原型，不把它提前改成2105鐵偶軍；本輪不新增醒魂，不替罷工改寫勝負。

N09（2107）：富豪資本經公司窗口放出，白手套取得受協定約束的地球催收權；地上仍有其他貸方與造機競爭。去程貴、回程便宜讓窮工人離月，富戶留下。2107-03-20無月撤棧、03-24藏燈之盟已有有限互助，06-20暗埠留票已有單筆交割，不能再創一次同義盟約。2108-01船債接候鳥號；阿鏽與M-3後續維持傳聞，N10公司的動作與方舟結局不定。


### 缺口表

[gap-table.json](gap-table.json)仍按地點、勢力、人物群像、事件、日常畫面分五類。第2輪補的是穹頂豪奢、月弓與渡月船的尺度、白甲在動作中的壓迫，以及暗面的疾行交接。既有主檔與大事件不重寫；新件把鏡頭放近，不另定誰贏了歷史。

## 3. 設計理念

月面先讓人看見渡月船拖光落進灰原，再看接船的人舉起雙臂。穹頂下的錢可以把整顆地球框成一幅畫，升起那幅畫的巨幕仍靠領薪者的肩。月弓的光要照到換班屋，也要留下罷工時不再亮起的空處。白手套列隊走出白庫、踏下地球港口的舷梯，受僱的手不因此變成世界的主謀。人牆敢向鐵偶喊話，先退的仍是血肉，兩次罷工的既有結局不改。暗面一趟貨要跑過夜棧、正式船班與港口，快的是交接，三天航程照舊。背面遠光照著待救的人，古代機不回應，這道距離本身就是神話。

### 方法與禁忌

依 [bf-common.md](../bf-common.md) 原樣適用：

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

本輪另必照 [moon-rulings.md](../moon-rulings.md)。36件各指定至少一道光；a為月面奇觀、b為一句能吼的話、c為不回應人的古代遺產之光。全計畫吃食、鞋、家書、擦窗各最多一件核心畫面，不把相同物件拆成地點、人物、事件重複交差。鐵偶無魂無核心、沒有招式；有核心遙控機只普通開；手套是獨一個人，其罕見人格與轉傳聲音不可寫成鐵偶共有的魂。

## 4. 新件表

[design-table.json](design-table.json)是36件唯一逐件設計來源；[review-draft.json](review-draft.json)是同源短版，每列白話不超過60字。每列含id、類型、名稱、定位、掛點、可見度、occurs、timeline-add、inserts、新名詞提案、英文原意、四句body要點與完整欄位值；新增tone欄記錄指定光景、可吼句與裁決核對標記。tone不寫入正式lore，不新增schema。

配比維持地點12、群像3、人物10、事件11。11個月面地點都是既有區域細部，望鄉號是world orbit的一艘渡月船。三個群像用type其他、leaders空，不設新公司、軍隊或古代機血統。十位新人物全是居住月面的受僱人類；索拉是渡月船副駕，許霽是暗埠現場接應，伊沃改為貨艙領班，陳月河改為港區引導員，皆非新富豪或可雇用base人物。

逐件證據見 [rulings-audit.json](rulings-audit.json)：36件都有光，35件有a或b（門檻24件），其餘1件以c承擔。白手套在動作中出現7件，其中無魂鐵偶6件、2098人駕原型1件；暗面5件；直接展示豪奢奇觀2件。吃食核心僅林淑琴，家書核心僅候領處，鞋與擦窗均0。這是設計證據，產出工人必須在正文落實指定畫面，不以標記數字代替創作。

罷工有兩個對峙近景：〈弓前不返工〉的2098人駕原型與〈白牆先踏一步〉的2105鐵偶；兩者都是工人先退，結局、死傷、輪班讓步及洩影像仍照舊事件。無魂鐵偶的同聲通告不是機魂合唱，更不是無人機招式。暗埠查貨只發生在入口的一次局部行動，不改2105白手套止步之謎，也不替無月撤棧重打一仗。

〈借月弓的光〉從月面轉運到既有新加坡港舷梯，暗面依附塞勒涅正班船，沒有自有地月航道；月弓只是照亮出貨，不運人、不開門。〈白手套下船〉也只止於既有新加坡渡月港，時點在既有第一通催收之後，不替第一通另指定城市，不延伸地球人物、街區或新港檔。

可見度均為public、secrets空，不新造人口、機魂或幕後放行真相；暗面已結束的一次捎運用外界可講述的近景，不公布永久逃查規程。9件歷史側景沿既有年份，兩件possible為〈空位留到開船〉2108-02與〈墟外待救〉2108-03，均為代表日期、tags帶rumor、不入年表。所有timeline-add空；僅〈弦月啟航〉建議向2066現存定班條目補event鍵，領導重找日期＋標題後再判是否能插入。

新增前已ls各類目錄，人物特別對照lead-fill-pilots並行新增；終局再核全部id與中文名。每批交接書亦要求工人動筆前重查主repo與worktree，若撞名先協調，不覆寫、不自行變更規格。新名皆標提案，正式name與body不加設計標籤，英文只存manifest命名表。

## 5. 營運鉤子建議（本線不產出base）

[ops-hooks.json](ops-hooks.json)有10條：修船件、唯一家書轉交、回程人潮、罷工舊影、暗面捎貨、查貨改約、白甲下船、開船令、穹頂換景與墟外接班。每條列一句場景、所需base類別與前提；前九條從現有地球港或消息遇見月面，無須先讓玩家登月。

月面營運地圖、封鎖通行、班期與艙位屬engine-backlog候選。領導先核既有支援，能用內容表達者直接轉內容，確實缺引擎者才另開線。本計畫不新增backlog實檔、不動數值、不宣布引擎已支援。

## 6. 分批

三批各12件，合計36；每批小於15檔，只新增places／factions／characters／events。欄位只引用HEAD已有id或同批新id；不依賴其他批先合併，不以跨批新id造成工人無法單獨通過檢查。

### bf-moon-01：穹頂奇觀、月弓與罷工對峙（12檔）

完整新增檔案清單（與manifest一致）：

```text
content/lore/places/tranquility-ferry-port.json
content/lore/places/earthward-gallery.json
content/lore/places/prism-stair.json
content/lore/places/moonbow-shift-house.json
content/lore/places/lunar-glass-garden.json
content/lore/factions/dome-households.json
content/lore/characters/eira-vey.json
content/lore/characters/han-yeon.json
content/lore/characters/lin-shuqin.json
content/lore/events/rain-under-glass.json
content/lore/events/moonbow-silent-line.json
content/lore/events/whitewall-at-gate.json
```

### bf-moon-02：渡月起落、船員與白手套下船（12檔）

完整新增檔案清單（與manifest一致）：

```text
content/lore/places/ferry-nostos.json
content/lore/places/tranquility-repair-dock.json
content/lore/places/lunar-letter-counter.json
content/lore/factions/lunar-ferry-crews.json
content/lore/characters/aliya-nasser.json
content/lore/characters/ivo-marot.json
content/lore/characters/chen-yuehe.json
content/lore/characters/sara-kett.json
content/lore/events/ferry-first-departure.json
content/lore/events/return-fare-queue.json
content/lore/events/whitegloves-come-ashore.json
content/lore/events/last-empty-berth.json
```

### bf-moon-03：暗面疾行、白甲出庫與背面遠光（12檔）

完整新增檔案清單（與manifest一致）：

```text
content/lore/places/grey-edge-rest-stop.json
content/lore/places/farside-light-ridge.json
content/lore/places/white-armour-loading-hall.json
content/lore/places/dark-quay-night-slip.json
content/lore/factions/farside-shift-workers.json
content/lore/characters/sora-maen.json
content/lore/characters/xu-ji.json
content/lore/characters/tomo-vell.json
content/lore/events/dark-run-under-bow.json
content/lore/events/white-armour-departure.json
content/lore/events/dark-quay-inspection.json
content/lore/events/help-outside-the-belt.json
```

跨批的地理歸屬以既有靜海市、港區與暗埠描述即可；若要追加新港檔的反向引用，另交inserts由領導合併。所有插入建議只有append或setKey，不修改已有值。

## 7. 產出交接書稿

- [cx-bf-moon-01.md](cx-bf-moon-01.md)：穹頂奇觀與兩次罷工對峙。
- [cx-bf-moon-02.md](cx-bf-moon-02.md)：渡月起落、船員與白手套下船。
- [cx-bf-moon-03.md](cx-bf-moon-03.md)：暗面疾行、白甲出庫與背面遠光。

三稿保留原範本的先讀、背景、方法與禁忌、排除範圍、逐檔規格、工具、資源、工作、交付、四條驗收、失敗處置與回報。方法段均明列moon-rulings現存路徑，逐件同時列指定光景與body四句要點。交接書與manifest從同一設計表生成，工人不必再設計題目。

每批身份cx-bf-moon-NN、團隊teams/bigfill、子代理上限1，worktree與報告絕對路徑照原交接書。只新增，不commit；inserts與timeline-add即使無建議也交合法空表。工人驗收仍固定4條；本計畫驗收不跑content測試。

## 8. manifest稿

- [bf-moon-01.manifest.json](bf-moon-01.manifest.json)
- [bf-moon-02.manifest.json](bf-moon-02.manifest.json)
- [bf-moon-03.manifest.json](bf-moon-03.manifest.json)

均為content-batch/1，mode add、status draft、base TBD、maxFiles 12、allow.modify空。allow.kinds僅該批實用目錄；checks照範本為check、lore、typecheck、test、readlist。files、ids、命名表與設計表逐項一致；mustRead全部指現存路徑，主repo裁決與計畫使用絕對路徑，避免隔離worktree未帶入交接區。

領導審定後填實際base、準備worktree、登記工人與正式manifest再派工；本線未代做。2066條目索引僅供建議定位，若已存在不同event鍵，回報領導，不覆寫。

## 9. 需求與待決

36個新名仍是提案，逐名與英文原意見design-table的terms及manifest命名表。人物出生年、地方細部與本次歷史側景同屬創作提案；口號為當場話語，不是新增招式、制度或永遠有效的承諾。不另造富豪、家族與公司姓名；不加古代機移動、認主、操縱或交易結果。靜海仍是唯一月城，第二月城與全月人口分布留設定層。

既有歧異交領導記錄，新增先採最小共同事實：朴仁哲的腿在人物檔是被盾撞碎、事件檔是閘門夾斷，本輪只寫失去一腿；古墓有「只有蔡明珠可入」也有秦望舒入墓記述，本輪人物只在外圍；背面裂口持續時間有一天與下一大潮兩種寫法，本輪不再定時長。N07筆記提壓艙阻家屬，原事件列的是安全／撫卹／免進危險井道，本輪不把家屬要求增寫成2105罷工的唯一原因，只在2107票價之後寫團聚壓力。

D線仍稱知情時間未定，但selene.secrets已有2086報告、2095相關性、2097知道降人口關不了門的分層；本輪不追加一個知道真相的人，不讓富戶或船員說出祕密。舊檔有把古代機列擔保與交易後方的語句，當作人類主張與既有文本看待，新件不演成可買、可操縱的古代機。年表女武神2106條目的era仍是tide-line，與一般2106起league邊界有歧異，本輪既有條目不改，新增2107均用league。


本輪取消首輪7條新增地方年表候選，改為9件歷史近景沿既有錨點；這是timeline-add提案的收斂，不刪既有年表。領導若希望某一側景獨立入年表，再另審，不讓工人擴大本批範圍。與lead-fill-pilots的協調限人物id避免撞名，本輪不為角色加base人物或招募鉤子。

### 完成驗收（固定4條）

1. plan.md存在，含1–9段，容量不超過45KB。
2. review-draft.json合法wf-table/1、36–45列（本版36），每列白話≤60字；新id全計畫唯一、不撞既有檔。
3. 三批各有交接書與合法manifest；每份brief_lint --strict 0，各稿、表與manifest一致。
4. 新件逐件審核：0個點名富豪／家族／新公司，0個古代機受操縱或交易情節，0個萬潮葬王相關件；裁決指定光景、對峙與動作已逐件核對。

驗收證據見 [acceptance.json](acceptance.json)；只有以上四條，完成即停並依原交接書發DONE。
