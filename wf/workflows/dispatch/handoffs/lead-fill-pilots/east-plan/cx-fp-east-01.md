# 任務：照計畫新增東亞與北亞人物第 01 批（恰好38檔，batch fp-east-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/cx-fp-east-01.md`。AGENTS.md 與 fp-common.md **親自讀，不靠交接摘要**；REPORT 開頭列「已讀清單」，本行每個路徑原樣列出。相對路徑以 worktree 為根；east-plan 稿若不在該快照，讀主 repo 同路徑。三個範本目錄全部讀。用 tabledb 按 batch=fp-east-01 查 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/people.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/pools.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/batch-files.json` 與 review-draft 對應檔名，不整份讀大表。

## 背景與唯一目標

這是待領導審定的產出交接稿；領導審過 plan 並填 manifest.base、備妥 worktree 後才派工。你依指定12人三件套與2池做**恰好38個新檔**，只把 lore 三段要點展開為250–450字，不重新設計。數值照同級暫填，不調平衡。每人要能從現有營運地點雇用；lore 地方只表示出身與經歷，兩者不得混用。

## 方法與禁忌（必守）

共同規格 `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md` 原文：

1. **節點優先、不暴力產**：每件掛到既有節點（N01–N10）、主線（A–H）、年表條目或「崩年的底色」某一句，有因有果；掛不上就不寫。每件的 lore 檔 `places`／`faction` 欄必須指向既有 lore 的地方與勢力。
2. **基調**（Fable 審查 `wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第 3–4 點）：少寫帳務與法理，多寫人、畫面、獸、神話的光。**每人一個站起來的瞬間與一句能吼出來的話**（招牌話、誓、招式名；角色自己知道很誇張照樣吼）。模板句「地契押給月亮」「商團出糧傭兵守港」不再用；意象（鞋、繩、乾衣、杯、梯、燈）每種全計畫最多一件。
3. **不拿其他作品類比**；**中文命名避免直譯**（先想原意再取中文；古代機本體就叫古代機、外層叫裝甲；潮→蝕；用語照 `content/lore/style.md`）。**不用真實歷史人名**；姓名照該文化的常見構詞自創，不撞現有人名（先 `ls` 與 grep 全庫，包括 `content/lore/characters/` 與 `content/base/persons/`）。
4. **國家、塞勒涅、巨頭只削弱不萬能**；古代機與 S 級高高在上（不寫被打倒、操縱、交易；駕駛員可以是「候選」但不預決誰認主）；S 領主不出場；怪獸無臉、不是畜牲。
5. **已裁示不推翻**：`wf/workflows/dispatch/handoffs/fill-rulings.md`、既有 lore、年表。矛盾記 REPORT「需要決定」，不改舊檔。
6. **真相用可見度**；新專名標「（提案）」；文筆不強求。
7. 不做：萬潮葬王相關、AI（aiprofiles）、數值平衡、`src/`、`specs/`、design-notes、effects 新檔、刪檔、裝依賴、push、建分支。


另依 `wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md` 第3–4點：每人站起來一次、吼一句；沿既有機型，不創古代機認主或新特質。所有新專名在 review-rows 標（提案）；實際姓名照 people 的純姓名。人物 kind=human。trait 僅 person，背景 traits=[]。船員 tags 不暗示尚無的職業加成；culture 是相容值不是國籍。

## 範圍（排除法寫死）

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-east-01/` 新增 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/fp-east-01.manifest.json` 的 files 與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/batch-files.json` 的 batch=fp-east-01 白名單，12背景＋12person＋12character＋2池，共38檔。以下逐人段落明列36檔，池段列其餘2檔，範圍不作遞移展開。

不做：修改／刪除既有檔；`src/`、`schemas/`、`test/`、`specs/`、design-notes、effects、aiprofiles、`content/index/`、`content/batches/`、其他 `wf/` 一律不碰；不改既有四池，不改年表，不 commit。需要既有檔插入只記報告 inserts.json，不自行套。

worktree 內不留 scratch／log，臨時檔全部放 `/tmp/cx-fp-east-01/`。件數 gate：超過38新檔停止回報，manifest 的42是平台上限，不是加寫額度。容量 gate：單內容檔超過16KB或總內容超過1MB停止回報。不得自行擴充。

### 逐檔人物規格

### xu-jingcen（徐景岑，提案）

三檔：`content/base/world/backgrounds/xu-jingcen-recruit.json`、`content/base/persons/xu-jingcen.json`、`content/lore/characters/xu-jingcen.json`。

女，age=22，born=2086；activeYears=省略。崩前：崩年前是成都糧站職員的幼女，只記得父親肩上的稻穗。 崩後：在縮城後的糧隊長大，2106 才學開堅盾，護運到達卡後接短約。 性格：嘴上嫌人拖拉，總把步子放慢等最後一車。

站起來：護糧隊在沿海遇掘犬，她把堅盾半跪在翻覆糧車前，讓人從機膝下過。 招牌話：「糧過去，我才過！」

背景 background/xu-jingcen-recruit「行在糧隊新駕駛」，culture=han；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/court-seat、faction/imperial-court；底色1.4／C、F、G：內陸糧必須有人跨線運；池 recruit/dhaka-east-court。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### he-yanxu（何彥序，提案）

三檔：`content/base/world/backgrounds/he-yanxu-recruit.json`、`content/base/persons/he-yanxu.json`、`content/lore/characters/he-yanxu.json`。

男，age=24，born=2084；activeYears=省略。崩前：崩前是江口港工家的孩子，記得全家在樓頂吃晚飯。 崩後：江口夜後遷內陸，修倉多年，2106 加入護運隊學操機砲，現於達卡待雇。 性格：怕把話說滿，報方位卻從不含糊。

站起來：沿海接應時獸甲映紅水面，他在抖動的機身上補出最後一矢，打開撤離口。 招牌話：「讓這一矢替人開路！」

背景 background/he-yanxu-recruit「江口流亡砲手」，culture=han；hireFee=780／wageMult=1.5。駕駛／砲手，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/yangtze-mouth、faction/imperial-court；event/jiangkou-night 的流亡後果／底色1.5；池 recruit/dhaka-east-court。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### luo-shuqin（羅淑芹，提案）

三檔：`content/base/world/backgrounds/luo-shuqin-recruit.json`、`content/base/persons/luo-shuqin.json`、`content/lore/characters/luo-shuqin.json`。

女，age=31，born=2077；activeYears=省略。崩前：崩前在成都讀小學，常偷看母親替貨車換輪。 崩後：斷鏈後跟母親守工棚，轉修衍型機，隨糧隊南來為傷機找活。 性格：愛挑毛病，修好才肯說一句辛苦。

站起來：沿海傷機的腿架裂開時，她敲響整塊備用裝甲，指揮同伴借它撐住機身。 招牌話：「骨頭借你，給我站直！」

背景 background/luo-shuqin-recruit「行在流動修甲師」，culture=han；hireFee=600／wageMult=1.2。技師，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/trait-steady-hands。掛 place/court-seat、faction/imperial-court；底色1.3／C：工匠把斷掉的知識帶進船上；池 recruit/dhaka-east-court。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### duan-chengye（段承業，提案）

三檔：`content/base/world/backgrounds/duan-chengye-recruit.json`、`content/base/persons/duan-chengye.json`、`content/lore/characters/duan-chengye.json`。

男，age=39，born=2069；activeYears=16。崩前：崩前在沿海工坊當學徒，覺得國家大得走不完。 崩後：2092 起駕堅盾，參與赴牆後長守沿海，2107 傷後離隊到達卡接護運。 性格：說話像訓人，卻會先承認自己害怕。

站起來：赴牆後一次撤退，他把破盾橫在海獸與傷員之間，喊完才發現自己哭了。 招牌話：「我這一面，還沒倒！」

背景 background/duan-chengye-recruit「赴牆老駕駛」，culture=han；hireFee=850／wageMult=1.6。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/court-seat、faction/imperial-court；event/court-conscription-writ 後續／底色1.6；池 recruit/dhaka-east-court。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### pan-yuehe（潘月禾，提案）

三檔：`content/base/world/backgrounds/pan-yuehe-recruit.json`、`content/base/persons/pan-yuehe.json`、`content/lore/characters/pan-yuehe.json`。

女，age=53，born=2055；activeYears=省略。崩前：崩前管理糧車隊的行程，能背出沿途每家的飯味。 崩後：斷鏈後改跑近程糧路，2106 才進座艙；隨新糧抵達達卡後兼接護運。 性格：對小事寬容，對餓著肚子硬撐的人很兇。

站起來：海岸卸糧遇蟲群，她駕通用機把車廂推成弧形，將最後一袋米留在人群中央。 招牌話：「有飯的地方，先守住！」

背景 background/pan-yuehe-recruit「糧運轉職守車手」，culture=han；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/court-seat、faction/imperial-court；底色1.4／G：長鏈斷後近程糧路；池 recruit/dhaka-east-court。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### qiu-ninglan（邱寧嵐，提案）

三檔：`content/base/world/backgrounds/qiu-ninglan-recruit.json`、`content/base/persons/qiu-ninglan.json`、`content/lore/characters/qiu-ninglan.json`。

女，age=18，born=2090；activeYears=省略。崩前：2090 出生，沒有崩前記憶；父母在斷鏈初期已遷入成都周邊產糧村。 崩後：村中接生婆與共食灶讓她活過出生斷層，長大學包紮，隨糧隊到達卡。 性格：不信大人的沒事，會蹲下把傷問完。

站起來：沿海收傷時甲片落滿棚頂，她把傷員的手按在自己脈上，讓他跟著數。 招牌話：「跟著我數，別先停！」

背景 background/qiu-ninglan-recruit「山地接生戶醫護助手」，culture=han；hireFee=600／wageMult=1.2。醫護，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/ax-trait-names-before-orders。掛 place/court-seat、faction/imperial-court；底色1.1、1.2／C、G：出生斷層的少數倖存者；池 recruit/dhaka-east-court。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### fujimoto-sayo（藤本 紗世，提案）

三檔：`content/base/world/backgrounds/fujimoto-sayo-recruit.json`、`content/base/persons/fujimoto-sayo.json`、`content/lore/characters/fujimoto-sayo.json`。

女，age=23，born=2085；activeYears=省略。崩前：崩前是仙台托幼所的孩子，只記得接她的人總是老人。 崩後：在空班表旁長大，2106 才上機；受派到新加坡護送修造件，短期可雇。 性格：討厭被稱作希望，只肯答應眼前一班。

站起來：仙台外岸砂扇展腹時，她首次坐進有人驅動的核心艙，把同伴的傷機護出扇影。 招牌話：「這個座位，我來坐！」

背景 background/fujimoto-sayo-recruit「仙台借調新人」，culture=yamato；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/sendai-wall、faction/japan-umbrella；底色1.1、1.2／C：日本缺駕駛員；place/sendai-bell-cliff；池 recruit/singapore-east-relief。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### arase-kento（荒瀨 健斗，提案）

三檔：`content/base/world/backgrounds/arase-kento-recruit.json`、`content/base/persons/arase-kento.json`、`content/lore/characters/arase-kento.json`。

男，age=34，born=2074；activeYears=14。崩前：崩前是船塢工人的兒子，在退潮泥灘找落下的鉚釘。 崩後：2094 起駕堅盾護拖機船，現隨修造件出差新加坡，等回程貨時接約。 性格：臉仍年輕，說笑卻總用過時的比喻。

站起來：外洋浪裡升起獸背，他讓受損機先靠自己的裝甲，再帶它一步步退到船旁。 招牌話：「借我一程，還你一岸！」

背景 background/arase-kento-recruit「瀨戶內長役護航手」，culture=yamato；hireFee=850／wageMult=1.6。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/setouchi、faction/japan-umbrella；event/setouchi-lock 後續／底色1.2、1.3；池 recruit/singapore-east-relief。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### nishimura-touko（西村 燈子，提案）

三檔：`content/base/world/backgrounds/nishimura-touko-recruit.json`、`content/base/persons/nishimura-touko.json`、`content/lore/characters/nishimura-touko.json`。

女，age=46，born=2062；activeYears=省略。崩前：崩前在仙台做港口調度，習慣催別人快一點。 崩後：崩後在後方接天網班，2106 才改當有人駕駛，今護件南來接替輪守。 性格：從不催傷員，會催那些替傷員作決定的人。

站起來：矢櫛的背架在外岸亮起，她第一次把通用機的肩轉向來矢，讓拖機手離岸。 招牌話：「別替我說來不及！」

背景 background/nishimura-touko-recruit「仙台晚入艙守備」，culture=yamato；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/sendai-wall、faction/japan-umbrella；底色1.2／C：後方年資不算駕駛年資；池 recruit/singapore-east-relief。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### morita-shunpei（森田 俊平，提案）

三檔：`content/base/world/backgrounds/morita-shunpei-recruit.json`、`content/base/persons/morita-shunpei.json`、`content/lore/characters/morita-shunpei.json`。

男，age=27，born=2081；activeYears=省略。崩前：崩前跟祖父住船塢邊，最早的記憶是大船把天空遮住。 崩後：鎖海後隨祖父改修機甲筋組，與修造件一起到新加坡找短約。 性格：笑得大聲，手上工作一出錯就立刻認。

站起來：傷機在塢口失去支撐，他將備用筋組抬進裂甲，讓駕駛再屈一次膝。 招牌話：「再彎一次，就能回家！」

背景 background/morita-shunpei-recruit「乾塢筋組修補手」，culture=yamato；hireFee=600／wageMult=1.2。技師，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/trait-steady-hands。掛 place/setouchi、faction/japan-umbrella；event/setouchi-lock／底色1.3：船匠轉修機甲；池 recruit/singapore-east-relief。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### ogata-miharu（緒方 美晴，提案）

三檔：`content/base/world/backgrounds/ogata-miharu-recruit.json`、`content/base/persons/ogata-miharu.json`、`content/lore/characters/ogata-miharu.json`。

女，age=58，born=2050；activeYears=省略。崩前：崩前在仙台病房輪夜班，盼退休後學畫海。 崩後：斷鏈時病房縮了又縮，今隨護航船照顧傷員，到新加坡替家人等返鄉船。 性格：不愛聽英雄故事，會記住英雄怕疼的樣子。

站起來：外岸獸鳴壓過傷員聲，她把整張空白畫紙撕成醒目的指向，帶擔架隊穿過濃霧。 招牌話：「疼就喊，喊給我聽！」

背景 background/ogata-miharu-recruit「仙台老醫護」，culture=yamato；hireFee=600／wageMult=1.2。醫護，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/trait-steady-hands。掛 place/sendai-wall、faction/japan-umbrella；底色1.1、1.8／E：活下來的老醫護與被叫回的人；池 recruit/singapore-east-relief。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### takeda-masatsugu（武田 正嗣，提案）

三檔：`content/base/world/backgrounds/takeda-masatsugu-recruit.json`、`content/base/persons/takeda-masatsugu.json`、`content/lore/characters/takeda-masatsugu.json`。

男，age=63，born=2045；activeYears=省略。崩前：崩前領拖船穿過內海，在船頭認潮汐與岸影。 崩後：鎖海後改領拖機船，現把修造隊送到新加坡，趁候貨受雇領航。 性格：方向說得極準，自己的家事卻總岔開話題。

站起來：外洋獸群割斷熟路，他把舊航圖翻面，沿親眼看見的空水面帶船退走。 招牌話：「圖沒有路，人還有眼！」

背景 background/takeda-masatsugu-recruit「瀨戶內老船領航」，culture=yamato；hireFee=700／wageMult=1.4。導航，沿導航範本 accuracy／evasion／initiative 傾向與六屬性骰；trait=effect/ax-trait-watchful。掛 place/setouchi、faction/japan-umbrella；event/setouchi-lock 後續／底色1.4；池 recruit/singapore-east-relief。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### 兩個招募池規格

`content/base/world/recruit-pools/dhaka-east-court.json`：`recruit/dhaka-east-court`，place=`place/dhaka`，size=3，refreshOn=quarter，主題「朝廷出身的南行糧隊與流亡者」。sources 精確為 background/xu-jingcen-recruit weight=3；background/he-yanxu-recruit weight=3；background/luo-shuqin-recruit weight=3；background/duan-chengye-recruit weight=1；background/pan-yuehe-recruit weight=2；background/qiu-ninglan-recruit weight=2。六名範本抽三名、不重複；人已在名冊或其他候選池則略過；可用少於三人時不補匿名人。老手權重1，僅本池供應。

`content/base/world/recruit-pools/singapore-east-relief.json`：`recruit/singapore-east-relief`，place=`place/singapore`，size=3，refreshOn=quarter，主題「日傘派來護件的少數駕駛與隨船人員」。sources 精確為 background/fujimoto-sayo-recruit weight=2；background/arase-kento-recruit weight=1；background/nishimura-touko-recruit weight=2；background/morita-shunpei-recruit weight=3；background/ogata-miharu-recruit weight=2；background/takeda-masatsugu-recruit weight=2。六名範本抽三名、不重複；人已在名冊或其他候選池則略過；可用少於三人時不補匿名人。老手權重1，僅本池供應。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 寫完本批後，末行0 errors；新警告列REPORT |
| `node content/lore/check.ts` | 本批lore完整後，0 errors |
| `npm run typecheck` | 收尾0 |
| `npm test` | 收尾一次；新增池改營運亂數，黃金紅列確切檔名；非黃金失敗照實處理 |
| `python3 wf/tools/tabledb.py` | 依batch或id讀寫wf-table資料；不整份灌入context |
| `git status --short` | 核對worktree只有白名單新增檔；不拿它操作提交 |
| `grep` | 新id與中文名對全庫核名；扣除已核配的計畫引用 |

不准上網，不用 MCP；不跑 probe／playtest／GOLDEN_UPDATE／rerecord。領導整合時統一重錄黃金。

## 資源與禁區

**可寫程式碼線**：只新增範圍列出的worktree內容檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-01/`，scratch `/tmp/cx-fp-east-01/`；不寫主repo content。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、建分支、rebase／reset；不commit；不rm -rf；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`。整檔改寫用單一Update操作。

**子代理上限2個**：僅為本批推進，模型隨意；子代理也親讀AGENTS.md與fp-common.md，同範圍同禁區，REPORT記是否使用與品質。自己打錯指令／路徑／臨時腳本要自己修；點名工具本身壞掉、權限被擋才停下回報BLOCKED。

## 工作

1. 親讀先讀清單，核本批12列人物、2列池、38列檔案；不可自行替換名字或補造文化表。
2. 依personSpec／backgroundSpec原樣建JSON；loreSpec加body，展開loreOutline三段，保留瞬間與吼話。新池精確照spec；不碰既有檔。
3. 按必用工具收尾，交REPORT、review-rows.json、inserts.json；只執行下面固定四條。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-01/REPORT.md`。新檔在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-east-01/content/`；逐檔白話審查表寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-01/review-rows.json`（wf-table/1，columns=["檔","類別","名稱","白話","掛到"]，38列，白話≤60字）；插入草稿寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-01/inserts.json`（wf-table/1，columns=["file","jsonPath","op","value","why"]，目前預期0列；若有op僅append、setKey）。不得將plan草稿當產出REPORT冒交。

REPORT第一段「已讀清單」；接著做了什麼、產出與掛點、驗證結果與新警告／黃金紅檔名、沒做到或證據不足、需要決定與引擎支援；再列子代理；末尾「以後交接書該點名的工具」（無則無）。manifest由領導維護，工人不動content/batches。

## 驗收（固定4條，一條不多，做完就停）

1. worktree變動只有白名單38個新檔（node_modules既有連結除外），三件套同名，池地點與所有lore掛點存在；0個新effect、AI、萬潮葬王相關內容。
2. check 0 errors、lore 0 errors、typecheck 0；npm test結果照實記錄，只有新增池造成的營運黃金紅可列明豁免，不重錄。
3. review-rows.json合法38列、白話≤60字、inserts.json合法；人物age／born／activeYears與本批已核配表一致，body每人至少200字並含三段要點、站起來瞬間與吼話。
4. REPORT存在，第一段逐項列先讀全部路徑，列證據、未完成項與需要決定；最後訊息5行摘要＋REPORT路徑。

不要為了更保險加驗其他東西。

## 失敗怎麼處置

測出壞的只在核定新檔範圍修正；修不好留下檔與證據，回FAILED。測不出來回BLOCKED，列解除條件；不拿舊輸出冒充新證據，不改別線檔來湊綠燈。

## 完成／阻塞回報（必做）

本線是 `cx-fp-east-01`，領導 lead-fill-pilots。本輪共同規格明示**不用 inbox**，由行程結束＋最後訊息＋檔案驗收；不要照舊範本寄信。終局訊息標DONE／BLOCKED／NEEDS-USER／FAILED之一，五行摘要加REPORT路徑。領導負責派工與領地登記。

唯一目標是上述38新內容檔＋報告目錄交付檔＋固定驗收；任何既有檔一律不動。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。
