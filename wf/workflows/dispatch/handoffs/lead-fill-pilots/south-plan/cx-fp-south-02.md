# 任務：照南亞計畫新增第 02 批駕駛員與船員（恰好 31 檔，batch fp-south-02）

先讀（親自讀，不靠摘要；REPORT 開頭「已讀清單」原樣列全部路徑）：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`AGENTS.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/people.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/pools.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/batch-files.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/review-draft.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/cx-fp-south-02.md`。相對路徑以主repo /home/lorkhan/repo/game_dev/mecha-srpg 為準，worktree既有檔可讀其相同版本；規劃產物讀上列主repo路徑。people／pools／batch-files 用 tabledb 依 batch=fp-south-02 查，不整份讀大表。三個範本目錄內全部既有檔都親讀。開工前領導須已提供隔離worktree，並把manifest的base=TBD換為實際起點；本稿本身不表示已派工。

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

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-02/` 新增 batch-files.json 內 batch=fp-south-02 的恰好 31 個路徑。三類人物各 9 檔、招募池4檔，沒有跨批背景依賴。檔案清單與完整規格由people.json、pools.json、batch-files.json三表組合，無需自由補題。

不做：不改或刪任何既有檔，不改既有4池；src、schemas、test、specs、design-notes、content/index、content/batches、wf其他檔不碰。不commit。需要既有檔插入只寫報告目錄inserts.json，op只准append/setKey；本批inserts為空表；不重複其他批的插入。

worktree只留核定新檔；scratch、log放 /tmp/cx-fp-south-02/。件數 gate：超過31或42檔立即停下回報；容量 gate：單檔超過16KB或新增合計超過1MB立即停下回報，不擴張範圍。

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

可寫程式碼線：只寫上列隔離worktree核定新檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-02/`；scratch只在 /tmp/cx-fp-south-02/。不寫主repo的content、src、test、specs與其他wf檔。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、建分支、rebase、reset、commit、刪檔、rm -rf；不改 ~/.codex/config.toml、.gitignore；不安裝依賴、不上網、不用MCP。子代理上限2個，模型隨意；親自讀AGENTS.md與fp-common.md，與主工人合計只能寫本批清單，REPORT記錄成本與品質。

分清錯誤來源：點名工具本身壞掉或權限拒絕才停下報BLOCKED；自己打錯路徑或臨時腳本錯誤，自己修正繼續。

## 工作

1. 親讀先讀清單；用tabledb查本批列，核主repo與跨區名字，讀明列範本。
2. 按下列逐人規格寫三檔組，照pools.json本批四列寫新池，不增設史事或效果。
3. 完成固定驗收，寫REPORT、review-rows.json、inserts.json；直接交檔，不寄inbox。

### 逐檔規格

各人背景檔為content/base/world/backgrounds/背景id末段.json；person為content/base/persons/姓名kebab.json；lore為content/lore/characters/同名.json。完整可寫路徑也列於manifest.files與batch-files.json。
### firoza-sikdar／菲羅扎・西克達爾（提案）

女，age=37，born=2071，activeYears=省略；職能：拆船技師。背景 `background/firoza-sikdar-trade`／拆船幫斷骨接手（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/chittagong-breakers-yard`。

崩前段：崩前在吉大港拆船場學辨舊船接縫，靠工班互相喊停保命。 崩後段：船少後改拆獸甲與報廢腿架，2105 災後把新工棚的停工口令教給所有散工。 性格：生氣時反而壓低聲音，討厭別人稱她膽大。 現在段與站起來的瞬間：倒下的燕鷗腿架壓住工友時，她先敲斷自己剛做好的接頭，讓整片鐵骨向空灘倒去。 招牌話：「鐵可以重接，人先出來！」

掛點：place/chittagong／faction/chittagong-breakers；底色1.3；C；獵犬-II型拼裝供應的工班側面；events=["event/hound-ii-license"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "technician"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### tapan-biswas／塔潘・比斯瓦斯（提案）

男，age=48，born=2060，activeYears=省略；職能：新轉職駕駛。背景 `background/tapan-biswas-trade`／拆屍場轉駕的扶機工（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/chittagong-breakers-yard`。

崩前段：崩前在拆船灘負責拖運重料，從不讓兒子進切割區。 崩後段：2105 解拘災失去工班後幫忙重建，2107 才學駕獵犬-II型，不是年輕外貌老手。 性格：對孩子囉嗦，對自己的傷卻總說再等一下。 現在段與站起來的瞬間：工棚試吊時支座滑走，他第一次主動坐進借來的機甲，把晃動屋架推回坑內。 招牌話：「我來托，別拿命墊！」

掛點：place/chittagong／faction/chittagong-breakers；底色1.2/1.8；C/E；2105毀場到2106重建的轉職者；events=["event/chittagong-hoisted-roof"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### mukul-sarker／穆庫爾・薩爾克（提案）

男，age=23，born=2085，activeYears=省略；職能：機甲砲手。背景 `background/mukul-sarker-trade`／長槍工棚試矢學徒（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/chittagong-breakers-yard`。

崩前段：崩前四歲，記得拆船灘有比街道還寬的船腹。 崩後段：崩後替工棚磨料，2106 長槍-V4開工才進試矢班，尚無長期出擊年資。 性格：愛替每次試射取誇張名字，收工後卻把失敗件留下研究。 現在段與站起來的瞬間：靶架被風掀成一片白，他取消最後一矢，直到工友趴進掩體才重新舉槍。 招牌話：「天讓半寸，我只取半寸！」

掛點：place/chittagong／faction/chittagong-breakers；底色1.3；C；2106長槍量產後的年輕試矢員；events=["event/lance-v4"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/mitali-das.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 45, "evasion": 15, "resolve": 42, "initiative": 8, "perception": 7, "control": 40}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "gunner"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### jamil-barua／賈米爾・巴魯阿（提案）

男，age=31，born=2077，activeYears=省略；職能：碼頭護船駕駛。背景 `background/jamil-barua-trade`／碼頭幫換雇護船手（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/chittagong-dock-gang`。

崩前段：崩前替吉大港碼頭家人傳話，知道不同船旗有不同口音。 崩後段：黑幫接管後替散工押貨，近年才駕犁護船，短雇到期就另找工。 性格：能把爭吵說成笑話，但碰到工友受傷就不笑了。 現在段與站起來的瞬間：兩批帶火氣的貨隊在窄埠相撞，他把機甲空掌平舉，讓眾人看清裡面只有被踩扁的飯盒。 招牌話：「要過這手，先把火收了！」

掛點：place/chittagong／faction/chittagong-breakers；底色1.6；G；吉大港不入盟、工人仍得共用一座港；events=["event/chittagong-gang-rule"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### malati-kar／瑪拉蒂・卡爾（提案）

女，age=45，born=2063，activeYears=省略；職能：碼頭醫護。背景 `background/malati-kar-trade`／拆屍場止血醫護（提案），culture=bengal，hireFee=600，wageMult=1.2；所屬池 `recruit/chittagong-dock-gang`。

崩前段：崩前在港區診所做清創助手，每週等藥船補貨。 崩後段：藥船停後學會挑揀能救的傷，2105 起跟拆屍工班隨船，拒替幫派打手先治。 性格：說話毫不安慰人，手卻一直留在傷者看得到的位置。 現在段與站起來的瞬間：盾甲留下的碎甲割開工人頸側，她趴上血污的鐵槽按住傷口，叫旁人先報他的名字。 招牌話：「你還能罵我，就不准停！」

掛點：place/chittagong／faction/chittagong-breakers；底色1.1/1.8；E/G；斷藥與2105解拘災後的醫護缺口；events=["event/chittagong-unbinding"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/selene-soul-mender.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "medic"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### shapla-nandi／莎普拉・南迪（提案）

女，age=20，born=2088，activeYears=省略；職能：蘆葦澤獵手駕駛。背景 `background/shapla-nandi-trade`／船屋新獵手（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/reed-marsh-hunters`。

崩前段：崩前一歲，沒有可靠記憶；那個有陸上院子的家只活在長輩說法裡。 崩後段：2102 逃路上的船屋是她的家，成年才學駕犁，替第七哨帶路但不駐澤設哨。 性格：討厭別人叫澤地空無一人，卻不肯出賣船民的藏身處。 現在段與站起來的瞬間：蛙聲突然斷掉，她先讓犁停步，眼見水下的節肢刮過底泥，才示意後船散開。 招牌話：「別跟我的影子，跟我的聲音！」

掛點：place/reed-marsh／faction/bay-seventh-post；底色1.1/1.5；F/G；2102逃路留下的流動船民；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/mitali-das.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 45, "evasion": 15, "resolve": 42, "initiative": 8, "perception": 7, "control": 40}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/trait-beast-sense"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### harun-talukdar／哈倫・塔盧克達爾（提案）

男，age=55，born=2053，activeYears=省略；職能：獵手與拘束砲手。背景 `background/harun-talukdar-trade`／蘆葦口退役捕手（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/reed-marsh-hunters`。

崩前段：崩前在達卡西南替村落修魚閘，習慣看水色決定開口。 崩後段：魚閘廢後替過路獵團帶路與操作拘束砲，沒有駕駛年資；從不聲稱找到養裂者。 性格：嘴上嫌人多，出發前總多留一份糧。 現在段與站起來的瞬間：一次退路被陌生蝕斑截住，他把自家的舊魚閘撞開，讓船隊穿過自己最後的家產。 招牌話：「我的閘，我自己開！」

掛點：place/reed-marsh／faction/league；底色1.5/1.11；F；蘆葦澤養裂僅傳聞，寫撤離的選擇；events=["event/bay-of-bengal-campaign"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "gunner"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### nalin-perera／納林・佩雷拉（提案）

男，age=29，born=2079，activeYears=省略；職能：海上護航駕駛。背景 `background/nalin-perera-trade`／錫蘭來的岸勤駕駛（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/salt-flat-shorehands`。

崩前段：崩前在錫蘭港區跟家人剝椰纖，記得海上貨船從不一起停。 崩後段：斷航後沿南亞港口流落，成年在鹽鷗做岸勤，2107才轉駕獵犬-II型。 性格：不愛提遠方故鄉，誰問家在哪就指當天同桌的人。 現在段與站起來的瞬間：登岸時死獸背甲在浪裡翻起，他側轉機肩托住拖架，讓岸上的人離開碎甲落點。 招牌話：「岸在這裡，站到我後面！」

掛點：place/salt-flat／faction/salt-gull；底色1.4/1.8；E/F；鹽灘交換屍體背後的流動船民；events=["event/gull-anvil-truce"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### suriya-menon／蘇莉雅・梅農（提案）

女，age=39，born=2069，activeYears=16；職能：海上老手駕駛。背景 `background/suriya-menon-trade`／鹽鷗輪休老舵甲（提案），culture=bengal，hireFee=850，wageMult=1.6；所屬池 `recruit/salt-flat-shorehands`。

崩前段：崩前在印度西岸學修小艇，二十歲時看著航路一條條停掉。 崩後段：2092 起持續駕機，2104 攻勢撤下後仍護送傷員；如今在輪休季接受短雇。 性格：笑聲比新人響，拒絕別人把她當成不會累的傳奇。 現在段與站起來的瞬間：2104 退船旁鐮肢的刃貼近舷側，她讓舊堅盾側身吃下擦擊，只吼船再後退半步。 招牌話：「把海退給牠，把人帶回來！」

掛點：place/salt-flat／faction/salt-gull；底色1.2/1.11；F；2104首次歸還攻勢被棄者的餘生；events=["event/first-return-offensive"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/irina-sokolova.json`，背景價格/範圍範本 `content/base/world/backgrounds/selene-test-retiree.json`。attrs={"accuracy": 62, "evasion": 9, "resolve": 61, "initiative": 6, "perception": 7, "control": 56}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "pilot", "veteran"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### recruit/chittagong-breakers-yard（新池）

路徑content/base/world/recruit-pools/chittagong-breakers-yard.json；place=place/chittagong，size=2，refreshOn=quarter，sources=[{"background": "background/firoza-sikdar-trade", "weight": 5}, {"background": "background/tapan-biswas-trade", "weight": 4}, {"background": "background/mukul-sarker-trade", "weight": 3}]。主題：拆船工棚。每個退潮刷新點從3名未占用者抽2名；三選二，工棚有時偏修造、有時偏駕駛。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/chittagong-dock-gang（新池）

路徑content/base/world/recruit-pools/chittagong-dock-gang.json；place=place/chittagong，size=1，refreshOn=quarter，sources=[{"background": "background/jamil-barua-trade", "weight": 4}, {"background": "background/malati-kar-trade", "weight": 3}]。主題：碼頭幫短雇。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/reed-marsh-hunters（新池）

路徑content/base/world/recruit-pools/reed-marsh-hunters.json；place=place/reed-marsh，size=1，refreshOn=quarter，sources=[{"background": "background/shapla-nandi-trade", "weight": 4}, {"background": "background/harun-talukdar-trade", "weight": 3}]。主題：蘆葦獵手過船。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/salt-flat-shorehands（新池）

路徑content/base/world/recruit-pools/salt-flat-shorehands.json；place=place/salt-flat，size=1，refreshOn=quarter，sources=[{"background": "background/nalin-perera-trade", "weight": 5}, {"background": "background/suriya-menon-trade", "weight": 1}]。主題：鹽鷗岸勤與輪休。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 老手權重1，只有此池；雇走後由普通岸勤頂上。 新池只引用本批新增背景，互不重用person，不插進舊池。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-02/REPORT.md`。白話表寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-02/review-rows.json`，inserts寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-02/inserts.json`。新content寫 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-02/content/` 內核定路徑；完整檔案清單由manifest.files提供。review-rows採wf-table/1、columns=[檔,類別,名稱,白話,掛到]，本批恰好31列、白話≤60字；inserts採wf-table/1、columns=[file,jsonPath,op,value,why]。

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

我是cx-fp-south-02。按fp-common.md本輪不用inbox；把DONE／BLOCKED／FAILED寫進REPORT與最後訊息，領導按行程結束和檔案驗收收線。回覆只要5行摘要＋REPORT絕對路徑。

> 唯一目標是新增本批31個content檔＋報告目錄交付物＋固定驗收；任何既有檔一律不動。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。
