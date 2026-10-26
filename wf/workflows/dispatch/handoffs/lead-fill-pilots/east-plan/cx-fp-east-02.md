# 任務：照計畫新增東亞與北亞人物第 02 批（恰好38檔，batch fp-east-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/deep-rulings.md`、`wf/workflows/planning/design-notes/world/pilots.md`、`wf/workflows/planning/design-notes/world/history-lines.md`、`wf/workflows/planning/specs/ops/content-format-ops/crew-text.md`、`src/ops/crew/recruit.ts`、`content/base/world/recruit-pools/`、`content/base/world/backgrounds/`、`content/base/persons/`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/cx-fp-east-02.md`。AGENTS.md 與 fp-common.md **親自讀，不靠交接摘要**；REPORT 開頭列「已讀清單」，本行每個路徑原樣列出。相對路徑以 worktree 為根；east-plan 稿若不在該快照，讀主 repo 同路徑。三個範本目錄全部讀。用 tabledb 按 batch=fp-east-02 查 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/people.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/pools.json`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/batch-files.json` 與 review-draft 對應檔名，不整份讀大表。

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

只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-east-02/` 新增 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/fp-east-02.manifest.json` 的 files 與 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/east-plan/batch-files.json` 的 batch=fp-east-02 白名單，12背景＋12person＋12character＋2池，共38檔。以下逐人段落明列36檔，池段列其餘2檔，範圍不作遞移展開。

不做：修改／刪除既有檔；`src/`、`schemas/`、`test/`、`specs/`、design-notes、effects、aiprofiles、`content/index/`、`content/batches/`、其他 `wf/` 一律不碰；不改既有四池，不改年表，不 commit。需要既有檔插入只記報告 inserts.json，不自行套。

worktree 內不留 scratch／log，臨時檔全部放 `/tmp/cx-fp-east-02/`。件數 gate：超過38新檔停止回報，manifest 的42是平台上限，不是加寫額度。容量 gate：單內容檔超過16KB或總內容超過1MB停止回報。不得自行擴充。

### 逐檔人物規格

### baek-junseo（白俊序，提案）

三檔：`content/base/world/backgrounds/baek-junseo-recruit.json`、`content/base/persons/baek-junseo.json`、`content/lore/characters/baek-junseo.json`。

男，age=22，born=2086；activeYears=省略。崩前：崩前是仁川廠工家的幼子，只記得飯盒上的廠徽。 崩後：守備養成後2106入艙，解役後持獵牌南到吉大港，靠護運養家。 性格：見到崇拜他的孩子便緊張，見到獸反而話多。

站起來：沿海護運時掘犬翻過殘牆，他把自己的機影擋在孩子畫的守城像前。 招牌話：「像不能動，我能！」

背景 background/baek-junseo-recruit「仁川解役新獵手」，culture=han；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/incheon、faction/korea-umbrella；底色1.6、1.12／C、G：守城者的崇拜與人力；池 recruit/chittagong-east-charter。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### jang-yeorin（張汝潾，提案）

三檔：`content/base/world/backgrounds/jang-yeorin-recruit.json`、`content/base/persons/jang-yeorin.json`、`content/lore/characters/jang-yeorin.json`。

女，age=29，born=2079；activeYears=省略。崩前：崩前在仁川學校學跳繩，最怕體育課落在最後。 崩後：崩後先搬傷機，2106學駕通用機，解役到吉大港接拘束與護送。 性格：每次出門都先練撤退，嫌逞強的人吵。

站起來：海岸扣甲合攏雙鉗，她把拘束矢打向關節，替被卡住的友機爭到轉身空隙。 招牌話：「退路我留，回頭跟上！」

背景 background/jang-yeorin-recruit「韓傘解役拘束手」，culture=han；hireFee=780／wageMult=1.5。駕駛／拘束手，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/incheon、faction/korea-umbrella；底色1.2／C、G：軍籍轉獵牌而非免徵召；池 recruit/chittagong-east-charter。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### im-taegwon（林泰權，提案）

三檔：`content/base/world/backgrounds/im-taegwon-recruit.json`、`content/base/persons/im-taegwon.json`、`content/lore/characters/im-taegwon.json`。

男，age=41，born=2067；activeYears=省略。崩前：崩前在財閥廠房當見習工，連廠門口都不敢大聲說話。 崩後：財閥上月後守著舊工位修機，現離廠到吉大港，以補甲換回家資本。 性格：說話很慢，別人打斷工人時卻會吼回去。

站起來：港邊落下的獸甲壓住修理位，他站到裂縫旁指揮同事頂開甲面，先抬出傷者。 招牌話：「讓做事的人把話說完！」

背景 background/im-taegwon-recruit「仁川離廠補甲師」，culture=han；hireFee=600／wageMult=1.2。技師，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/trait-steady-hands。掛 place/incheon、faction/korea-umbrella；底色1.3、1.6／C：財閥離去後的工匠；池 recruit/chittagong-east-charter。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### seo-damyeong（徐多明，提案）

三檔：`content/base/world/backgrounds/seo-damyeong-recruit.json`、`content/base/persons/seo-damyeong.json`、`content/lore/characters/seo-damyeong.json`。

女，age=25，born=2083；activeYears=省略。崩前：崩前是釜山魚市的小孩，跟母親把魚鱗掃成一堆銀色。 崩後：在處容之舞旁長大，2106學駕通用機，循獵牌窗口到吉大港待雇。 性格：愛給普通動作取大名字，笑完仍會練到熟。

站起來：海口蟲影壓船時，她用通用機流刃削開一截擋路甲肢，吼得比砲還大。 招牌話：「今夜一刀，替你開海！」

背景 background/seo-damyeong-recruit「雙籤城外出獵手」，culture=han；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/busan、faction/busan；底色1.2／C、G；釜山雙籤城既定讀法；池 recruit/chittagong-east-charter。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### moon-hyejin（文惠珍，提案）

三檔：`content/base/world/backgrounds/moon-hyejin-recruit.json`、`content/base/persons/moon-hyejin.json`、`content/lore/characters/moon-hyejin.json`。

女，age=37，born=2071；activeYears=省略。崩前：崩前在釜山修戲臺，總躲在幕後聽觀眾拍手。 崩後：崩後長年做機庫工，2106才學駕，外勤差事結束後獲准在吉大港接短約。 性格：怕人看見自己緊張，便把每個口令說兩遍。

站起來：船側甲被獸肢扯開，她將機砲轉向開口，在同伴撤入艙內前守完那一段。 招牌話：「拍子別亂，下一聲是我！」

背景 background/moon-hyejin-recruit「第三刃外勤替補砲手」，culture=han；hireFee=780／wageMult=1.5。駕駛／砲手，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/busan、faction/third-blade；底色1.2、1.12／C：第三刃也缺坐艙的人；池 recruit/chittagong-east-charter。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### oh-seongmi（吳成美，提案）

三檔：`content/base/world/backgrounds/oh-seongmi-recruit.json`、`content/base/persons/oh-seongmi.json`、`content/lore/characters/oh-seongmi.json`。

女，age=52，born=2056；activeYears=省略。崩前：崩前替魚市叫價，半條街都認得她的嗓子。 崩後：崩後改報進港與收傷，隨外勤船到吉大港後接通訊短約。 性格：罵人不留情，點名卻從不把姓省掉。

站起來：獸吼淹過港口人聲，她連喊三遍陌生傷員的全名，讓接應者終於認出那架殘機。 招牌話：「名字報完，一個也別吞！」

背景 background/oh-seongmi-recruit「釜山港天網值守」，culture=han；hireFee=700／wageMult=1.4。通訊，沿導航範本 accuracy／evasion／initiative 傾向與六屬性骰；trait=effect/ax-trait-names-before-orders。掛 place/busan、faction/busan；底色1.8／E、F：哀悼與點名相連；池 recruit/chittagong-east-charter。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### pavel-ryabinin（帕維爾・里亞比寧，提案）

三檔：`content/base/world/backgrounds/pavel-ryabinin-recruit.json`、`content/base/persons/pavel-ryabinin.json`、`content/lore/characters/pavel-ryabinin.json`。

男，age=24，born=2084；activeYears=省略。崩前：崩前是河谷木工家的幼子，只記得冬天窗上的霜。 崩後：2100失城時十六歲，跟南逃隊走出河谷，2106入艙，護運到蘆葦澤後待雇。 性格：見白光會停半拍，停完總先替別人探路。

站起來：南側接應時菌毯在水溝亮起，他把通用機停在硬地，逐車報出能走的缺口。 招牌話：「別追亮處，跟我的腳印！」

背景 background/pavel-ryabinin-recruit「白夜南逃新駕駛」，culture=norse；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-watchful。掛 place/yakutsk-bed、faction/russia-umbrella；2100白夜初見年表＋底色1.11／F：走出來的人；池 recruit/reed-marsh-east-southbound。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### vera-korovina（薇拉・科羅維娜，提案）

三檔：`content/base/world/backgrounds/vera-korovina-recruit.json`、`content/base/persons/vera-korovina.json`、`content/lore/characters/vera-korovina.json`。

女，age=32，born=2076；activeYears=省略。崩前：崩前在雅庫茨克讀小學，認得河岸結冰前的聲音。 崩後：2100跟妮娜撤離，先運糧，2106學駕，隨返南貨隊到蘆葦澤找接應約。 性格：討厭別人把逃走說成輕鬆，仍會幫想回去的人收行囊。

站起來：一次燒季後的撤離，菌光從灰裡重新透出，她用機身遮住恐慌人群的視線，指向尚暗的地帶。 招牌話：「想回去的，先活到明年！」

背景 background/vera-korovina-recruit「南側火帶護運手」，culture=norse；hireFee=780／wageMult=1.5。駕駛／護運，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/yakutsk-bed、faction/russia-umbrella；2100白夜首燒後續＋底色1.11／F、H；池 recruit/reed-marsh-east-southbound。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### kirill-nefedov（基里爾・涅費多夫，提案）

三檔：`content/base/world/backgrounds/kirill-nefedov-recruit.json`、`content/base/persons/kirill-nefedov.json`、`content/lore/characters/kirill-nefedov.json`。

男，age=43，born=2065；activeYears=省略。崩前：崩前是井港的貨運修工，熟悉熄工後的空倉。 崩後：斷鏈後修港多年，2106才接受駕駛訓練，押送舊件南來到蘆葦澤等回程。 性格：看起來冷淡，總把最麻煩的活留給自己。

站起來：沿海護岸時獸背頂碎泊臺，他把通用機的肩抵住漂向救生艇的廢梁。 招牌話：「海再推，我還在這裡！」

背景 background/kirill-nefedov-recruit「井港轉職護岸手」，culture=norse；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/kamchatka-wells、faction/russia-umbrella；底色1.6／G：俄國保住港卻救不到每處；池 recruit/reed-marsh-east-southbound。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### alina-trofimova（阿麗娜・特羅菲莫娃，提案）

三檔：`content/base/world/backgrounds/alina-trofimova-recruit.json`、`content/base/persons/alina-trofimova.json`、`content/lore/characters/alina-trofimova.json`。

女，age=48，born=2060；activeYears=省略。崩前：崩前在遠東做裝卸調度，總以為下一班船會準時來。 崩後：棄東後遷提克西，2106才入艙護貨；跟向南的護運隊抵蘆葦澤待雇。 性格：承諾說得少，答應的換班從不忘。

站起來：南行靠岸遇扣甲擋住貨口，她操機撬開側面空隙，把受困搬工托到安全處。 招牌話：「下一班不到，我接這班！」

背景 background/alina-trofimova-recruit「遠東轉港晚學駕駛」，culture=norse；hireFee=780／wageMult=1.5。駕駛，accuracy／resolve 偏高，成長採駕駛六屬性骰；trait=effect/ax-trait-oathbound。掛 place/tiksi、faction/russia-umbrella；event/eastern-abandonment 後續＋底色1.6；池 recruit/reed-marsh-east-southbound。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### denis-chernov（丹尼斯・切爾諾夫，提案）

三檔：`content/base/world/backgrounds/denis-chernov-recruit.json`、`content/base/persons/denis-chernov.json`、`content/lore/characters/denis-chernov.json`。

男，age=55，born=2053；activeYears=省略。崩前：崩前是雅庫茨克修車匠，習慣替熟客留一隻舊工具。 崩後：2100背著工具南逃，在火帶外修機，護送傷機到蘆葦澤後留船待雇。 性格：一談故鄉便倔，替別人修東西卻願意重來。

站起來：撤離車的輪陷進發亮泥邊，他拆下自己的工具箱墊住輪下，把唯一家當留在菌光外沿。 招牌話：「人先走，鐵留下！」

背景 background/denis-chernov-recruit「失城南逃修甲師」，culture=norse；hireFee=600／wageMult=1.2。技師，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/trait-steady-hands。掛 place/yakutsk-bed、faction/russia-umbrella；2100雅庫茨克失守＋底色1.3、1.11；池 recruit/reed-marsh-east-southbound。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### mikhail-zorin（米哈伊爾・佐林，提案）

三檔：`content/base/world/backgrounds/mikhail-zorin-recruit.json`、`content/base/persons/mikhail-zorin.json`、`content/lore/characters/mikhail-zorin.json`。

男，age=67，born=2041；activeYears=省略。崩前：崩前在提克西貨船煮飯，能聽出船員餓著肚子的笑。 崩後：崩後跟貨隊往南，停在蘆葦澤照料換船的人，已很久沒有領自己的返程差事。 性格：不講安慰話，誰不肯吃就直接坐到誰旁邊。

站起來：獸影掠過南方外港時，他把大鍋推入內艙，敲鍋叫散在各處的人循聲回來。 招牌話：「回來吃這口，才准說再見！」

背景 background/mikhail-zorin-recruit「提克西南行船廚」，culture=norse；hireFee=600／wageMult=1.2。廚／老船員，control 偏向，成長 control [1,2,3]／resolve [1,2]；trait=effect/ax-trait-names-before-orders。掛 place/tiksi、faction/russia-umbrella；底色1.4、1.8／E：遠港的糧與船上的家；池 recruit/reed-marsh-east-southbound。其餘 attrs、levelDice、tags、結構欄位與三段要點精確照 people.json 此 id 的 personSpec／backgroundSpec／loreSpec／loreOutline；不得帶入範本的舊人名、勢力、故事。

### 兩個招募池規格

`content/base/world/recruit-pools/chittagong-east-charter.json`：`recruit/chittagong-east-charter`，place=`place/chittagong`，size=3，refreshOn=quarter，主題「韓傘解役者與釜山持牌外勤」。sources 精確為 background/baek-junseo-recruit weight=3；background/jang-yeorin-recruit weight=3；background/im-taegwon-recruit weight=2；background/seo-damyeong-recruit weight=3；background/moon-hyejin-recruit weight=2；background/oh-seongmi-recruit weight=2。六名範本抽三名、不重複；人已在名冊或其他候選池則略過；可用少於三人時不補匿名人。駕駛與船員按來源權重換組。

`content/base/world/recruit-pools/reed-marsh-east-southbound.json`：`recruit/reed-marsh-east-southbound`，place=`place/reed-marsh`，size=3，refreshOn=quarter，主題「北亞失城者與南行護運船員」。sources 精確為 background/pavel-ryabinin-recruit weight=3；background/vera-korovina-recruit weight=3；background/kirill-nefedov-recruit weight=2；background/alina-trofimova-recruit weight=3；background/denis-chernov-recruit weight=2；background/mikhail-zorin-recruit weight=2。六名範本抽三名、不重複；人已在名冊或其他候選池則略過；可用少於三人時不補匿名人。駕駛與船員按來源權重換組。

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

**可寫程式碼線**：只新增範圍列出的worktree內容檔與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-02/`，scratch `/tmp/cx-fp-east-02/`；不寫主repo content。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開GUI；不push、建分支、rebase／reset；不commit；不rm -rf；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`。整檔改寫用單一Update操作。

**子代理上限2個**：僅為本批推進，模型隨意；子代理也親讀AGENTS.md與fp-common.md，同範圍同禁區，REPORT記是否使用與品質。自己打錯指令／路徑／臨時腳本要自己修；點名工具本身壞掉、權限被擋才停下回報BLOCKED。

## 工作

1. 親讀先讀清單，核本批12列人物、2列池、38列檔案；不可自行替換名字或補造文化表。
2. 依personSpec／backgroundSpec原樣建JSON；loreSpec加body，展開loreOutline三段，保留瞬間與吼話。新池精確照spec；不碰既有檔。
3. 按必用工具收尾，交REPORT、review-rows.json、inserts.json；只執行下面固定四條。

## 交付

REPORT直接寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-02/REPORT.md`。新檔在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-pilots/wt-fp-east-02/content/`；逐檔白話審查表寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-02/review-rows.json`（wf-table/1，columns=["檔","類別","名稱","白話","掛到"]，38列，白話≤60字）；插入草稿寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-east-02/inserts.json`（wf-table/1，columns=["file","jsonPath","op","value","why"]，目前預期0列；若有op僅append、setKey）。不得將plan草稿當產出REPORT冒交。

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

本線是 `cx-fp-east-02`，領導 lead-fill-pilots。本輪共同規格明示**不用 inbox**，由行程結束＋最後訊息＋檔案驗收；不要照舊範本寄信。終局訊息標DONE／BLOCKED／NEEDS-USER／FAILED之一，五行摘要加REPORT路徑。領導負責派工與領地登記。

唯一目標是上述38新內容檔＋報告目錄交付檔＋固定驗收；任何既有檔一律不動。

## 領導追加（必讀）

另讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-rulings.md`（與本稿衝突以它為準）。**資源禁令**：不得跑全套 `npm test`／e2e／sim／fuzz，只跑單檔 `node --test`、`node content/lore/check.ts`、`npm run check`、`npm run typecheck`；驗收中任何「npm test」改為「領導跑」。
