# 任務：照南亞計畫新增第 03 批駕駛員與船員（恰好 28 檔，batch fp-south-03）

先讀（親自讀，不靠摘要；REPORT 開頭「已讀清單」原樣列全部路徑）：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`AGENTS.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/people.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/pools.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/batch-files.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/review-draft.json`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/south-plan/cx-fp-south-03.md`。相對路徑以主repo /home/lorkhan/repo/game_dev/mecha-srpg 為準，worktree既有檔可讀其相同版本；規劃產物讀上列主repo路徑。people／pools／batch-files 用 tabledb 依 batch=fp-south-03 查，不整份讀大表。三個範本目錄內全部既有檔都親讀。開工前領導須已提供隔離worktree，並把manifest的base=TBD換為實際起點；本稿本身不表示已派工。

## 背景與唯一目標

把本區的地方故事變成能雇到的人。本批 8 組背景＋person＋character、4個新池，共 28 檔；逐檔清單在 batch-files.json 的本批列（與manifest.files完全一致）。數值照同級暫填，不做平衡。每人下列敘事規格＋people.json的personSpec/backgroundSpec為唯一設計，工人只展寫250–450字lore與微調文筆，不再設計年齡、職能或掛點。所有新池會改營運亂數軌跡。

## 方法與禁忌（必守）

每件先掛既有節點 N01–N10、主線 A–H、年表條目或崩年底色；本批依 people.hook，不為掛點創造新史事。每個 lore 的 places／faction 必指既有地方與勢力。少寫帳務法理，多寫人、畫面、獸、神話的光；每人有站起來的瞬間與一句能吼出的話，角色知道誇張仍照樣吼。「地契押給月亮」「商團出糧傭兵守港」不再用；鞋、繩／索、乾衣、杯、梯、扶手、熱水、燈，每種全計畫核心畫面最多一件，本案均未選作核心。

不拿其他作品類比；中文命名先想原意，不直譯；不用真實歷史人名，姓名用常見構詞自創。古代機本體叫古代機、外層叫裝甲；世界觀潮詞改蝕，遵守 style.md。新專名在審查資料標「（提案）」，遊戲name依people.name；不另創招式/effect來兌現角色口號。

國家、塞勒涅、巨頭只削弱不萬能。古代機與S級高高在上，不寫被打倒、操縱或交易，不預決認主，S領主不出場。獸無臉、不是畜牲；不寫馴養、餵食或低階二名。既有裁示不推翻，矛盾記REPORT「需要決定」。真相以visibility／secrets分可見度；本案全為public見證，不證實蘆葦養裂、北脊藏機或迦梨真相。

不做萬潮葬王相關、AI/aiprofiles、新effect、數值平衡、src、specs、design-notes、刪檔、依賴安裝、push、建分支。本輪26組、每批不超過12組與42檔；26人全為human，16–19歲1人（3.85%），老手僅2人。方法與基調另遵循 wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md 第3–4點；其深填線事件件數要求不擴張本線範圍。

personSpec與backgroundSpec已列全欄，逐字值採用；不要把lore性別、出身或born塞到person未知欄。person.age必填，activeYears只給已指定老手；不把外貌年齡當age。背景person指向同名人，traits背景為空，person帶指定既有effect。船員tag只表達主題，沒有職業加成或禁駕機制，REPORT必列此限制。

lore用id=character/姓名kebab、name、aka=[]、kind=human、born、faction、role、relations、events、summary、body、tags、gameRefs=[base:person/姓名kebab]與places=[指定place]。summary取職能＋瞬間摘要；body三段順序已定。places是共同規格要求、現行check未知欄警告須照實列，不改check。事件引用表示生命背景，不把幼兒寫成當年戰役參戰者。野地池都是短停船上求工，不建立定居村或駐軍；孟買兩池place用base place/mumbai，人物lore用place/mumbai-gate，歸還黨總部仍在蘇拉特。

## 範圍（排除法寫死）

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-03/` 新增 batch-files.json 內 batch=fp-south-03 的恰好 28 個路徑。三類人物各 8 檔、招募池4檔，沒有跨批背景依賴。檔案清單與完整規格由people.json、pools.json、batch-files.json三表組合，無需自由補題。

不做：不改或刪任何既有檔，不改既有4池；src、schemas、test、specs、design-notes、content/index、content/batches、wf其他檔不碰。不commit。需要既有檔插入只寫報告目錄inserts.json，op只准append/setKey；本批inserts為空表；不重複其他批的插入。

worktree只留核定新檔；scratch、log放 /tmp/cx-fp-south-03/。件數 gate：超過28或42檔立即停下回報；容量 gate：單檔超過16KB或新增合計超過1MB立即停下回報，不擴張範圍。

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

可寫程式碼線：只寫上列隔離worktree核定新檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-03/`；scratch只在 /tmp/cx-fp-south-03/。不寫主repo的content、src、test、specs與其他wf檔。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、建分支、rebase、reset、commit、刪檔、rm -rf；不改 ~/.codex/config.toml、.gitignore；不安裝依賴、不上網、不用MCP。子代理上限2個，模型隨意；親自讀AGENTS.md與fp-common.md，與主工人合計只能寫本批清單，REPORT記錄成本與品質。

分清錯誤來源：點名工具本身壞掉或權限拒絕才停下報BLOCKED；自己打錯路徑或臨時腳本錯誤，自己修正繼續。

## 工作

1. 親讀先讀清單；用tabledb查本批列，核主repo與跨區名字，讀明列範本。
2. 按下列逐人規格寫三檔組，照pools.json本批四列寫新池，不增設史事或效果。
3. 完成固定驗收，寫REPORT、review-rows.json、inserts.json；直接交檔，不寄inbox。

### 逐檔規格

各人背景檔為content/base/world/backgrounds/背景id末段.json；person為content/base/persons/姓名kebab.json；lore為content/lore/characters/同名.json。完整可寫路徑也列於manifest.files與batch-files.json。
### vedika-kamat／維迪卡・卡馬特（提案）

女，age=32，born=2076，activeYears=省略；職能：歸來者護送駕駛。背景 `background/vedika-kamat-trade`／橙旗外的撤民護手（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/mumbai-returners-camp`。

崩前段：崩前在孟買跟母親擺花攤，最熟的是市場開門的聲音。 崩後段：失城後跟歸還黨難民走到蘇拉特，近年學開堅盾，現在到孟買門外接尋親人。 性格：不相信勝利宣告，卻會把每張尋親口信念完。 現在段與站起來的瞬間：一次尋親隊在外緣退卻，她把橙漆刮成箭頭留在廢牆，讓後到的人沿痕跡找到撤船。 招牌話：「回家先帶活人，別帶捷報！」

掛點：place/mumbai-gate／faction/mumbai-returners；底色1.11；F/G；N06放棄收復後與N08退線的矛盾；events=["event/first-return-offensive"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### imran-kelkar／伊姆蘭・凱爾卡爾（提案）

男，age=50，born=2058，activeYears=省略；職能：歸還軍技師。背景 `background/imran-kelkar-trade`／孟買歸來的修掌匠（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/mumbai-returners-camp`。

崩前段：崩前在孟買修載貨車，家人知道他總能從廢件拼出可用的東西。 崩後段：失城後替難民修器具，歸還軍買機後改修堅盾；短雇所得帶回蘇拉特家屬。 性格：見到新機會興奮，聽到催攻便先問撤人安排。 現在段與站起來的瞬間：帶傷機甲退到門外時鐵掌攥住不放，他逐節卸掉卡死的指甲，把掌心傷員抱下來。 招牌話：「手能放開，人才回得來！」

掛點：place/mumbai-gate／faction/mumbai-returners；底色1.3/1.11；C/F；N09買機後仍缺能修機的人；events=["event/first-return-offensive"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "technician"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### nandita-shetty／南迪塔・謝蒂（提案）

女，age=27，born=2081，activeYears=省略；職能：教團外圍護送駕駛。背景 `background/nandita-shetty-trade`／孟買門焚香護送人（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/mumbai-creed-fringe`。

崩前段：崩前八歲，在西岸親族的小店學分香料，聽不懂大人為何爭走或留。 崩後段：靠難民灶活下來，替門外供糧人護送，最近學開犁；是外圍信徒，未加入解拘者。 性格：會為受傷的人停步，也會固執地替自己沒見過的神蹟辯護。 現在段與站起來的瞬間：酸風捲過缺口時她把供糧車推出倒塌的牌樓，額上灰印被汗沖成兩道黑痕。 招牌話：「神若看著，就讓我先把人送完！」

掛點：place/mumbai-gate／faction/tide-creed；底色1.9；H/B；N06後難民信仰與N07無肉教義的裂口；events=["event/fleshless-declaration"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### suhas-bendre／蘇哈斯・本德雷（提案）

男，age=19，born=2089，activeYears=省略；職能：醫護學徒（非駕駛）。背景 `background/suhas-bendre-trade`／難民灶長大的醫護徒（提案），culture=bengal，hireFee=100，wageMult=0.6；所屬池 `recruit/mumbai-creed-fringe`。

崩前段：2089 年生於已避往內陸親族家的孕婦身邊，對崩前沒有記憶。 崩後段：親族以自存糧撐過斷鏈，後來進難民灶；他跟流動醫護學止血，只在門外接短雇。 性格：一緊張就背誦步驟，會為承認不知道而臉紅。 現在段與站起來的瞬間：年長病人叫他別管時，他把敲傷的藥臼擺到人前，請對方幫他數完壓傷的呼吸。 招牌話：「我還在學，你先別走！」

掛點：place/mumbai-gate／faction/tide-creed；底色1.1/1.9；C/H；出生斷層的罕見倖存者，不製造新一代大軍；events=["event/fleshless-declaration"]。relations依people該列；可見度public。26人中唯一16–19歲：2089出生，孕婦先避往內陸親族家、自存糧使母嬰撐過斷鏈，後進難民灶；稀少倖存個案，非成熟駕駛。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/seventh-watch-child.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/trait-steady-hands"]；tags=["human", "medic", "apprentice", "crew"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### kalyani-deshmukh／卡莉亞妮・德什穆克（提案）

女，age=41，born=2067，activeYears=省略；職能：探勘技師。背景 `background/kalyani-deshmukh-trade`／浦那撤出的拓痕技師（提案），culture=bengal，hireFee=180，wageMult=0.7；所屬池 `recruit/old-array-survey-rest`。

崩前段：崩前在浦那修觀天陣列的支架，記得每座碗影落在哪塊草地。 崩後段：2103替稽古學會整理拓痕工具，2106隨撤民離開，現在只在遺跡外臨時整備。 性格：把傳聞說得很清楚，輪到自己的夢卻一句也不肯多說。 現在段與站起來的瞬間：撤離時內殿刻痕的餘光照到她的拓紙，她將紙捲回匣裡，轉身扶起落後的同伴。 招牌話：「字可以明天讀，人得今天走！」

掛點：place/old-array／faction/shell-society；底色1.3；A/B；N08浦那撤離留下的見證，不證實刑天新動作；events=["event/pune-falls"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/leila-nasser.json`，背景價格/範圍範本 `content/base/world/backgrounds/shell-field-student.json`。attrs={"accuracy": 45, "evasion": 5, "resolve": 44, "initiative": 5, "perception": 8, "control": 38}；levelDice={"perception": [1, 1, 2], "resolve": [1, 2]}；traits=["effect/ax-bg-ruin-cartographer"]；tags=["human", "technician", "researcher"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### pranab-bhowmik／普拉納布・鮑米克（提案）

男，age=25，born=2083，activeYears=省略；職能：探勘隊守夜駕駛。背景 `background/pranab-bhowmik-trade`／舊陣列短雇守夜人（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/old-array-survey-rest`。

崩前段：崩前六歲，在孟加拉跟家人製陶，只知道火窯能把泥變硬。 崩後段：隨流動工班到浦那，2106幫撤民搬負重，2107才學開堅盾-I護送拓本隊。 性格：說話像在催人睡覺，值夜時卻從不接受代班。 現在段與站起來的瞬間：歪倒陣列下有蝕斑一齊亮起，他壓低機身讓探勘人越過背甲，自己最後退出。 招牌話：「今晚我醒著，你們都回去！」

掛點：place/old-array／faction/anvil；底色1.2/1.8；C/G；N08後舊陣列探勘需要能帶人回去的新人；events=["event/pune-falls"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### sumon-debnath／蘇蒙・德布納特（提案）

男，age=35，born=2073，activeYears=省略；職能：山路偵察駕駛。背景 `background/sumon-debnath-trade`／北脊短途看路人（提案），culture=bengal，hireFee=620，wageMult=1.3；所屬池 `recruit/ridge-trail-rest`。

崩前段：崩前在達卡北丘茶園搬茶，知道雨後哪塊紅土會滑。 崩後段：茶園散後當過路嚮導，2107學開犁；只在山腳短停，不替學會宣告山底有古代機。 性格：寧可被叫膽小，也不肯用猜的路帶人下山。 現在段與站起來的瞬間：紅土崩落時他讓犁側跪成一道踏面，等最後一人越過才拔出陷在泥裡的腿。 招牌話：「山不給路，我借它一膝！」

掛點：place/ridge／faction/shell-society；底色1.5；A/F；北脊座標仍為傳聞，寫地表嚮導的代價；events=["event/dhaka-unbinding"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/adewale-balogun.json`，背景價格/範圍範本 `content/base/world/backgrounds/anvil-salvager.json`。attrs={"accuracy": 59, "evasion": 10, "resolve": 58, "initiative": 7, "perception": 6, "control": 49}；levelDice={"accuracy": [1, 2, 3], "evasion": [1, 2], "resolve": [1, 2, 3], "initiative": [0, 1], "perception": [0, 1], "control": [1, 2]}；traits=["effect/ax-trait-watchful"]；tags=["human", "pilot"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### padma-bora／帕德瑪・博拉（提案）

女，age=63，born=2045，activeYears=省略；職能：探路隊廚務船員。背景 `background/padma-bora-trade`／北丘隨船炊事婆（提案），culture=bengal，hireFee=600，wageMult=1.2；所屬池 `recruit/ridge-trail-rest`。

崩前段：崩前在東北印度茶工食堂掌灶，能從腳步分出哪班工人回來。 崩後段：斷糧後隨親族到達卡，替公會的短程運糧隊做飯；從未駕機，手指與背脊照常變老。 性格：愛把份量罵得很小，盛出來卻總比嘴上多。 現在段與站起來的瞬間：暴雨打熄山腳的爐火時，她把未熟的糧分進每人懷裡，自己抱走最後一鍋重新生火。 招牌話：「人齊了，這頓才算飯！」

掛點：place/ridge／faction/dhaka-weavers；底色1.4/1.8；E/G；糧要跨線、守住的城仍靠流動船員；events=["event/dhaka-contraction"]。relations依people該列；可見度public。

數值採people該列personSpec與backgroundSpec整體；person範本 `content/base/persons/hana-sato.json`，背景價格/範圍範本 `content/base/world/backgrounds/selene-soul-mender.json`。attrs={"accuracy": 46, "evasion": 5, "resolve": 40, "initiative": 5, "perception": 7, "control": 44}；levelDice={"control": [1, 2, 3], "resolve": [1, 2]}；traits=["effect/ax-trait-oathbound"]；tags=["human", "cook", "crew"]。perks=[]，無新abilities；will、pools、growth其餘欄已在personSpec定好，不沿用範本的外國身份或古代機候選設定。

### recruit/mumbai-returners-camp（新池）

路徑content/base/world/recruit-pools/mumbai-returners-camp.json；place=place/mumbai，size=1，refreshOn=quarter，sources=[{"background": "background/vedika-kamat-trade", "weight": 4}, {"background": "background/imran-kelkar-trade", "weight": 3}]。主題：歸來者門外集結。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/mumbai-creed-fringe（新池）

路徑content/base/world/recruit-pools/mumbai-creed-fringe.json；place=place/mumbai，size=1，refreshOn=quarter，sources=[{"background": "background/nandita-shetty-trade", "weight": 4}, {"background": "background/suhas-bendre-trade", "weight": 2}]。主題：教團外圍求工。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/old-array-survey-rest（新池）

路徑content/base/world/recruit-pools/old-array-survey-rest.json；place=place/old-array，size=1，refreshOn=quarter，sources=[{"background": "background/kalyani-deshmukh-trade", "weight": 3}, {"background": "background/pranab-bhowmik-trade", "weight": 4}]。主題：探勘整備短停。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

### recruit/ridge-trail-rest（新池）

路徑content/base/world/recruit-pools/ridge-trail-rest.json；place=place/ridge，size=1，refreshOn=quarter，sources=[{"background": "background/sumon-debnath-trade", "weight": 4}, {"background": "background/padma-bora-trade", "weight": 3}]。主題：山腳換工短停。每個退潮刷新點從2名未占用者抽1名；二選一，換季可能換職能，也可能抽回同一人。 新池只引用本批新增背景，互不重用person，不插進舊池。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-03/REPORT.md`。白話表寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-03/review-rows.json`，inserts寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-south-03/inserts.json`。新content寫 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-south-03/content/` 內核定路徑；完整檔案清單由manifest.files提供。review-rows採wf-table/1、columns=[檔,類別,名稱,白話,掛到]，本批恰好28列、白話≤60字；inserts採wf-table/1、columns=[file,jsonPath,op,value,why]。

REPORT第一段「已讀清單」列先讀全部路徑，後續依範本記做了什麼、產出及每人掛點、檢查證據與暫值來源、未做到或證據不足、需要決定與引擎缺口、子代理、以後交接書該點名的工具。沒用子代理寫0。不把manifest草稿的TBD當驗收基準；實際base由領導啟動時提供。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree只新增本批28個核定檔（8組三檔＋4池）；每人places/faction及背景person/池sources引用存在，沒有修改舊檔。
2. npm run check 0 errors、node content/lore/check.ts 0 errors、npm run typecheck exit 0；npm test如實記錄。只有新池造成的營運黃金差異可列檔豁免，其他失敗不冒充通過；不跑GOLDEN_UPDATE或rerecord。
3. review-rows.json恰好28列、每列白話≤60字；inserts.json合法；人物遵照指定出生年/年齡/年資，敘事無萬潮葬王、AI、新effect，名稱全庫不撞。
4. REPORT開頭已讀清單完整，附上面三條證據；列出船員職類/禁駕與character places現有引擎限制，最後訊息5行摘要＋REPORT路徑。

不要追加驗收；沒有probe或MCP試玩要求。

## 失敗怎麼處置

測出來是壞的就修本批核定檔；修不好保留檔案、REPORT寫證據並回FAILED，不改舊檔湊綠燈。測不出來就寫BLOCKED與解除條件，不拿舊輸出代替新證據。

## 完成／阻塞回報（必做）

我是cx-fp-south-03。按fp-common.md本輪不用inbox；把DONE／BLOCKED／FAILED寫進REPORT與最後訊息，領導按行程結束和檔案驗收收線。回覆只要5行摘要＋REPORT絕對路徑。

> 唯一目標是新增本批28個content檔＋報告目錄交付物＋固定驗收；任何既有檔一律不動。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。
