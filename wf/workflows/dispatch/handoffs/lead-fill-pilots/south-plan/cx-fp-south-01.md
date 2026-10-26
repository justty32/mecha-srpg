# 任務：照南亞計畫新增第 01 批駕駛員與船員（恰好 31 檔，batch fp-south-01）

先讀（親自讀，不靠摘要；REPORT 開頭「已讀清單」原樣列全部路徑）：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`AGENTS.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/people.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/pools.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/batch-files.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/review-draft.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/cx-fp-south-01.md`。相對路徑以主repo /home/lorkhan/repo/game_dev/mecha-srpg 為準，worktree既有檔可讀其相同版本；規劃產物讀上列主repo路徑。people／pools／batch-files 用 tabledb 依 batch=fp-south-01 查，不整份讀大表。三個範本目錄內全部既有檔都親讀。開工前領導須已提供隔離worktree，並把manifest的base=TBD換為實際起點；本稿本身不表示已派工。

## 背景與唯一目標

把本區的地方故事變成能雇到的人。本批 9 組背景＋person＋character、4個新池，共 31 檔；逐檔清單在 batch-files.json 的本批列（與manifest.files完全一致）。數值照同級暫填，不做平衡。每人下列敘事規格＋people.json的personSpec/backgroundSpec為唯一設計，工人只展寫250–450字lore與微調文筆，不再設計年齡、職能或掛點。所有新池會改營運亂數軌跡。

## 方法與禁忌（必守）

每件先掛既有節點 N01–N10、主線 A–H、年表條目或崩年底色；本批依 people.hook，不為掛點創造新史事。每個 lore 的 places／faction 必指既有地方與勢力。少寫帳務法理，多寫人、畫面、獸、神話的光；每人有站起來的瞬間與一句能吼出的話，角色知道誇張仍照樣吼。「地契押給月亮」「商團出糧傭兵守港」不再用；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈，每種全計畫核心畫面最多一件，本案均未選作核心。

不拿其他作品類比；中文命名先想原意，不直譯；不用真實歷史人名，姓名用常見構詞自創。古代機本體叫古代機、外層叫裝甲；世界觀潮詞改蝕，遵守 style.md。新專名在審查資料標「（提案）」，遊戲name依people.name；不另創招式/effect來兌現角色口號。

國家、塞勒涅、巨頭只削弱不萬能。古代機與S級高高在上，不寫被打倒、操縱或交易，不預決認主，S領主不出場。獸無臉、不是畜牲；不寫馴養、餵食或低階二名。既有裁示不推翻，矛盾記REPORT「需要決定」。真相以visibility／secrets分可見度；本案全為public見證，不證實蘆葦養裂、北脊藏機或迦梨真相。

不做萬潮葬王相關、AI/aiprofiles、新effect、數值平衡、src、specs、design-notes、刪檔、依賴安裝、push、建分支。本輪26組、每批不超過12組與42檔；26人全為human，16–19歲1人（3.85%），老手僅2人。方法與基調另遵循 wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md 第3–4點；其深填線事件件數要求不擴張本線範圍。

personSpec與backgroundSpec已列全欄，逐字值採用；不要把lore性別、出身或born塞到person未知欄。person.age必填，activeYears只給已指定老手；不把外貌年齡當age。背景person指向同名人，traits背景為空，person帶指定既有effect。船員tag只表達主題，沒有職業加成或禁駕機制，REPORT必列此限制。

lore用id=character/姓名kebab、name、aka=[]、kind=human、born、faction、role、relations、events、summary、body、tags、gameRefs=[base:person/姓名kebab]與places=[指定place]。summary取職能＋瞬間摘要；body三段順序已定。places是共同規格要求、現行check未知欄警告須照實列，不改check。事件引用表示生命背景，不把幼兒寫成當年戰役參戰者。野地池都是短停船上求工，不建立定居村或駐軍；孟買兩池place用base place/mumbai，人物lore用place/mumbai-gate，歸還黨總部仍在蘇拉特。

## 範圍（排除法寫死）

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-01/` 新增 batch-files.json 內 batch=fp-south-01 的恰好 31 個路徑。三類人物各 9 檔、招募池4檔，沒有跨批背景依賴。檔案清單與完整規格由people.json、pools.json、batch-files.json三表組合，無需自由補題。

不做：不改或刪任何既有檔，不改既有4池；src、schemas、test、specs、design-notes、content/index、content/batches、wf其他檔不碰。不commit。需要既有檔插入只寫報告目錄inserts.json，op只准append/setKey；本批照inserts-draft.json保留1列供合併線處理。

worktree只留核定新檔；scratch、log放 /tmp/cx-fp-south-01/。件數 gate：超過31或42檔立即停下回報；容量 gate：單檔超過16KB或新增合計超過1MB立即停下回報，不擴張範圍。

## 必用工具

| 工具 | 用途 |
|---|---|
| `python3 wf/tools/tabledb.py` | 查本批人物、池、逐檔清單與白話草稿；寫review-rows/inserts |
| `grep` | 核新名與既有content、其他區names-claimed無撞名 |
| `npm run check` | 收尾0 errors，新警告列REPORT |
| `node content/lore/check.ts` | 收尾0 errors，places未知欄警告列REPORT |
| `npm run typecheck` | 收尾exit 0 |
| `npm test` | 收尾一次，結果如實記錄；不重錄黃金 |

不准上網、不用MCP；不跑probe／playtest。不用inbox；本輪領導按行程終止、最後訊息、產物驗收。

## 資源與禁區

可寫程式碼線：只寫上列隔離worktree核定新檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-01/`；scratch只在 /tmp/cx-fp-south-01/。不寫主repo的content、src、test、specs與其他wf檔。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、建分支、rebase、reset、commit、刪檔、rm -rf；不改 ~/.codex/config.toml、.gitignore；不安裝依賴、不上網、不用MCP。子代理上限2個，模型隨意；親自讀AGENTS.md與fp-common.md，與主工人合計只能寫本批清單，REPORT記錄成本與品質。

分清錯誤來源：點名工具本身壞掉或權限拒絕才停下報BLOCKED；自己打錯路徑或臨時腳本錯誤，自己修正繼續。

## 工作

1. 親讀先讀清單；用tabledb查本批列，核主repo與跨區名字，讀明列範本。
2. 按下列逐人規格寫三檔組，照pools.json本批四列寫新池，不增設史事或效果。
3. 完成固定驗收，寫REPORT、review-rows.json、inserts.json；直接交檔，不寄inbox。

### 逐檔規格

各人背景檔為content/base/world/backgrounds/背景id末段.json；person為content/base/persons/姓名kebab.json；lore為content/lore/characters/同名.json。完整可寫路徑也列於manifest.files與batch-files.json。
### tahmina-sarker／塔赫米娜・薩爾克（提案）

女，age=42，born=2066，activeYears=17；職能：守牆駕駛。背景 `background/tahmina-sarker-trade`／織工衛換班老手（提案），culture=bengal，hireFee=850，wageMult=1.6；所屬池 `recruit/dhaka-weavers-yard`。

崩前段：崩前在達卡替出口布驗染色，記得全廠停工仍等船的早晨。 崩後段：2091 起駕機守廠，2102 在老桂守線旁護送工班，如今交班後接短雇。 性格：平時刻薄，遇到比自己膽小的人就先報自己的名字。 現在段與站起來的瞬間：2102 堅盾-I跪進染渠，她讓機臂撐住倒落的鋸齒屋頂，讓工班從臂下爬過。 招牌話：「廠還有人，天就不准塌！」

掛點：place/dhaka／faction/dhaka-weavers；底色1.2；C/G；2102孟加拉灣戰役的守廠側面；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/irina-sokolova.json`，背景價格/範圍範本 `content/base/world/backgrounds/selene-test-retiree.json`。attrs={"accuracy": 62, "evasion": 9, "resolve": 61, "initiative": 6, "perception": 7, "control": 56}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "pilot", "veteran"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### ratan-majumdar／拉坦・馬朱姆達（提案）

男，age=52，born=2056，activeYears=省略；職能：技師。背景 `background/ratan-majumdar-trade`／織機轉行的接筋匠（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/dhaka-weavers-yard`。

崩前段：崩前是達卡織機修理工，靠遠洋零件維持一整排梭機。 崩後段：斷件後拆舊機養新機，公刻傳開才轉到機甲工棚，現在接隨船修理短工。 性格：愛挑剔別人的手法，修好後卻會把功勞推給學徒。 現在段與站起來的瞬間：一台犁在工棚門口失去動作，他伏在尚未熄的流光旁接回筋組，讓鐵掌重新攤開。 招牌話：「這隻手，還能把人托起來！」

掛點：place/dhaka／faction/dhaka-weavers；底色1.3；C；2093堅盾公刻後的修造知識；events=["event/bulwark-first-workshops"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "technician"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### jhuma-pal／朱瑪・帕爾（提案）

女，age=22，born=2086，activeYears=省略；職能：獵團學徒駕駛。背景 `background/jhuma-pal-trade`／染坊換班學駕人（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/dhaka-weavers-yard`。

崩前段：崩前只有三歲，記得母親衣袖上的染味，不記得成衣賣到哪裡。 崩後段：在縮小的達卡長大，先替織工衛傳口令，2107 才學開犁。 性格：怕被說年輕，真正出事時反而肯承認自己不懂。 現在段與站起來的瞬間：演練撤退時老機失足，她停下考核，把犁的背轉向工友，硬扛整車散落的棉包。 招牌話：「我還沒學完，誰都別先走！」

掛點：place/dhaka／faction/dhaka-weavers；底色1.1/1.2；C/G；補天院缺徒與駕駛搶人的後果；events=["event/dhaka-contraction"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/mitali-das.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 45, "evasion": 15, "resolve": 42, "initiative": 8, "perception": 7, "control": 40}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### sabir-mondal／薩比爾・蒙達爾（提案）

男，age=28，born=2080，activeYears=省略；職能：難民駕駛。背景 `background/sabir-mondal-trade`／北郊拆灶的新駕駛（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/dhaka-camp-berth`。

崩前段：崩前在達卡北郊上小學，記得午飯每人有一份。 崩後段：2103 解拘災後拆下自家灶磚搬入守區，直到2107才借獵團的犁學駕。 性格：看起來什麼都肯讓，唯獨討厭別人替他決定回不回家。 現在段與站起來的瞬間：撤鄰里時他把犁橫在排水口，鐮肢的刃一節節敲上鎧甲，後面的人終於敢起跑。 招牌話：「家可以拆，人不准拆散！」

掛點：place/dhaka／faction/league；底色1.5/1.11；F/G；2103達卡解拘後失去房屋的人；events=["event/dhaka-unbinding"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/trait-beast-sense"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### arpita-biswas／阿爾皮塔・比斯瓦斯（提案）

女，age=14，born=2094，activeYears=省略；職能：船修學徒（非駕駛）。背景 `background/arpita-biswas-trade`／補天院轉船修學徒（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/dhaka-camp-berth`。

崩前段：2094 才出生，崩前只有師傅說的遠洋商標，沒有親歷記憶。 崩後段：在補天院學縫帆，輪到機甲工棚只做器具清點與外甲補片，不接觸核心駕駛。 性格：嘴硬又愛問到底，把被糾正的地方一一重做。 現在段與站起來的瞬間：補帆試風時接縫裂開，她爬到桌上把錯針當眾拆光，請大家再給她一遍。 招牌話：「錯在我這一針，就從我這一針補！」

掛點：place/dhaka-sail-court／faction/dhaka-weavers；底色1.1/1.3；C；補天院空學徒桌的崩後一代；events=["event/dhaka-contraction"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "technician", "apprentice", "crew"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### shahana-mitra／莎哈娜・米特拉（提案）

女，age=33，born=2075，activeYears=省略；職能：船民護航駕駛。背景 `background/shahana-mitra-trade`／庫爾納船民護航手（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/delta-boatfolk`。

崩前段：崩前在庫爾納河埠替家中渡船收票，熟悉滿船工人的換班歌。 崩後段：渡口斷糧後跟撈屍船走，近年學開獵犬-II型，只受短期護送雇用。 性格：肯陪陌生人唱歌，卻不肯說自己原來住哪一條街。 現在段與站起來的瞬間：通海支流冒出掘犬的礦牙時，她讓機甲踩住沉船船首，把船身扳回能通行的角度。 招牌話：「河口借我一肩！」

掛點：place/delta／faction/chittagong-breakers；底色1.4/1.5；F/G；庫爾納斷鏈後的小船與2102三角洲逃路；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### bimal-haldar／比馬爾・哈爾達爾（提案）

男，age=61，born=2047，activeYears=省略；職能：船員領航。背景 `background/bimal-haldar-trade`／三角洲退渡老舵手（提案），culture=bengal，hireFee=700，wageMult=1.4；所屬池 `recruit/delta-boatfolk`。

崩前段：崩前在恆河口領渡船，能靠岸邊炊煙分辨各個村子。 崩後段：村子散後替第七哨的糧船帶路，從未驅動機甲核心，年老就是年老。 性格：話說得慢，遇到逞強的年輕船長會突然大笑。 現在段與站起來的瞬間：一片礦化紅樹根在船旁響起，他把舊航圖整張翻面，沿尚未硬化的水色帶隊轉出去。 招牌話：「舊河死了，我們走活水！」

掛點：place/delta／faction/bay-seventh-post；底色1.4；F/G；蝕後水道變形與哨所補給；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/leila-nasser.json`，背景價格/範圍範本 `content/base/world/backgrounds/farside-navigator.json`。attrs={"accuracy": 45, "evasion": 5, "resolve": 44, "initiative": 5, "perception": 8, "control": 38}；levelDice={"perception": [1, 1, 2], "resolve": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "navigator"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### parul-mandal／帕魯爾・曼達爾（提案）

女，age=24，born=2084，activeYears=省略；職能：拘束駕駛。背景 `background/parul-mandal-trade`／泥灘拘束學駕人（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/delta-hunters-rest`。

崩前段：崩前五歲，在河邊跟父親削船槳，尚不知道村外還有城市。 崩後段：2102 隨逃難船離開，成年後在鐵砧地方工班學拘束，剛獲准獨駕犁。 性格：緊張時數自己的呼吸，不把別人的害怕拿來開玩笑。 現在段與站起來的瞬間：掘犬拖著拘束器衝過泥脊，她放棄補射，跪機把側向拉力吃回自己一側。 招牌話：「要拖，先拖我！」

掛點：place/delta／faction/anvil；底色1.2/1.8；C/E；2102逃民成年後成為獵團新人；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/mitali-das.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 45, "evasion": 15, "resolve": 42, "initiative": 8, "perception": 7, "control": 40}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/trait-beast-sense"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### riyaz-bhuiyan／里亞茲・布伊揚（提案）

男，age=21，born=2087，activeYears=省略；職能：偵察砲手。背景 `background/riyaz-bhuiyan-trade`／河口趴灘砲手（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/delta-hunters-rest`。

崩前段：崩前兩歲，只記得顛簸船腹，不把父親講的舊港當自己的回憶。 崩後段：在哨所長大，先搬矢箱，現在只操作有精粹矢的護航砲位，未獨駕核心。 性格：喜歡誇口，射偏時卻會第一個認。 現在段與站起來的瞬間：盾甲掀起黑水擋住歸船，他忍到船影偏離才放出僅有的一矢，逼牠讓出窄口。 招牌話：「這一矢，給回家的人讓路！」

掛點：place/delta／faction/bay-seventh-post；底色1.1/1.4；C/F；第七哨缺新手但仍守糧路；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/mitali-das.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 45, "evasion": 15, "resolve": 42, "initiative": 8, "perception": 7, "control": 40}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "gunner"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### recruit/dhaka-weavers-yard（新池）

路徑content/base/world/recruit-pools/dhaka-weavers-yard.json；place=place/dhaka，size=2，refreshOn=quarter，sources=[{"background": "background/tahmina-sarker-trade", "weight": 5}, {"background": "background/ratan-majumdar-trade", "weight": 4}, {"background": "background/jhuma-pal-trade", "weight": 3}]。主題：織工衛工棚。每個退潮刷新點從3名未占用者抽2名；三選二，工棚有時偏修造、有時偏駕駛。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/dhaka-camp-berth（新池）

路徑content/base/world/recruit-pools/dhaka-camp-berth.json；place=place/dhaka，size=1，refreshOn=quarter，sources=[{"background": "background/sabir-mondal-trade", "weight": 4}, {"background": "background/arpita-biswas-trade", "weight": 2}]。主題：北郊撤民與學徒。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/delta-boatfolk（新池）

路徑content/base/world/recruit-pools/delta-boatfolk.json；place=place/delta，size=1，refreshOn=quarter，sources=[{"background": "background/shahana-mitra-trade", "weight": 4}, {"background": "background/bimal-haldar-trade", "weight": 3}]。主題：船民護糧隊。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/delta-hunters-rest（新池）

路徑content/base/world/recruit-pools/delta-hunters-rest.json；place=place/delta，size=1，refreshOn=quarter，sources=[{"background": "background/parul-mandal-trade", "weight": 4}, {"background": "background/riyaz-bhuiyan-trade", "weight": 3}]。主題：獵團短停酒艙。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-01/REPORT.md`。白話表寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-01/review-rows.json`，inserts寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-01/inserts.json`。新content寫 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-01/content/` 內核定路徑；完整檔案清單由manifest.files提供。review-rows採wf-table/1、columns=[檔,類別,名稱,白話,掛到]，本批恰好31列、白話≤60字；inserts採wf-table/1、columns=[file,jsonPath,op,value,why]。

REPORT第一段「已讀清單」列先讀全部路徑，後續依範本記做了什麼、產出及每人掛點、檢查證據與暫值來源、未做到或證據不足、需要決定與引擎缺口、子代理、以後交接書該點名的工具。沒用子代理寫0。不把manifest草稿的TBD當驗收基準；實際base由領導啟動時提供。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree只新增本批31個核定檔（9組三檔＋4池）；每人places/faction及背景person/池sources引用存在，沒有修改舊檔。
2. npm run check 0 errors、node content/lore/check.ts 0 errors、npm run typecheck exit 0；npm test如實記錄。只有新池造成的營運黃金差異可列檔豁免，其他失敗不冒充通過；不跑GOLDEN_UPDATE或rerecord。
3. review-rows.json恰好31列、每列白話≤60字；inserts.json合法；人物遵照指定出生年/年齡/年資，敘事無萬潮葬王、AI、新effect，名稱全庫不撞。
4. REPORT開頭已讀清單完整，附上面三條證據；列出船員職類/禁駕與character places現有引擎限制，最後訊息5行摘要＋REPORT路徑。

不要追加驗收；沒有probe或MCP試玩要求。

## 失敗怎麼處置

測出來是壞的就修本批核定檔；修不好保留檔案、REPORT寫證據並回FAILED，不改舊檔湊綠燈。測不出來就寫BLOCKED與解除條件，不拿舊輸出代替新證據。

## 完成／阻塞回報（必做）

我是cx-fp-south-01。按fp-common.md本輪不用inbox；把DONE／BLOCKED／FAILED寫進REPORT與最後訊息，領導按行程結束和檔案驗收收線。回覆只要5行摘要＋REPORT絕對路徑。

> 唯一目標是新增本批31個content檔＋報告目錄交付物＋固定驗收；任何既有檔一律不動。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。
