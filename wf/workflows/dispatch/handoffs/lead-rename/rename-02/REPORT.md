## 已讀清單

- `AGENTS.md`（親自讀主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`

相對路徑以本線 worktree 為根。terms-rename.json 使用 `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/terms-rename.json find 類別=…`，分別讀完古代機、機甲、蝕、專有名詞、保留五類。

另讀：wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/WORKFLOWS.md、wf/workflows/inbox/README.md、wf/workflows/inbox/PROTOCOL.md、wf/workflows/dispatch/lessons.md、world-pillars/world.md、world-pillars/mechs.md、world-pillars/world/tone-and-rules.md、world-pillars/mechs/bonds.md、world-pillars/mechs/ancient.md。後六個 world-pillars 路徑皆位於 wf/workflows/content/。

## 做了什麼

cx-rn-02／rename-02：逐檔處理指定 19 檔，實際修改 18 檔；kofi-mensah.json 只有定案保留的「大潮」，原檔未改。只換授權文字欄，保留人物、事件、數字與引用。未 commit。

worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-02`。容量 gate 最大增幅 2.8528%，未觸及 20%；件數未超過 19。

固定五條驗收如下（未加跑其他驗收）：

1. `git status --short` 除開場即存在的 `?? node_modules`，只有允許清單內 18 個修改檔，無新增或刪除內容檔。
2. `npm run check` exit 0，末行 `OK 0 errors, 12 warnings`；`node content/lore/check.ts` exit 0，末行 `errors=0 warnings=2`。
3. 已執行交接書指定的 `git -C <worktree> grep -nE '殼|摹|潮|鞘' -- content`，本批每處殘留逐一記於下節；19 檔無「古機」「蝕盛」「蝕歇」「原鞘」。
4. 下節包含 19 檔逐檔對照，包含唯一未改檔的理由。
5. 開頭已讀清單逐行包含交接書先讀全部 10 個路徑。

## 逐檔對照

下列依欄位、原半句出現順序逐處列出；同一舊詞重複出現也逐處記錄。

### content/lore/characters/ines-huaman.json

`body`（片段 5）：「第一次潮那年她二十一歲，」 → 「第一次蝕潮那年她二十一歲，」

`body`（片段 10）：「基多的挖掘隊和殼學會的人一起趕來。」 → 「基多的挖掘隊和稽古學會的人一起趕來。」

`body`（片段 18）：「裡面跪著一具殼——不是站著，」 → 「裡面跪著一台古代機——不是站著，」

`body`（片段 31）：「她走到殼前面，」 → 「她走到它面前，」

`body`（片段 35）：「殼抬起了頭。」 → 「它抬起了頭。」

`body`（片段 58）：「摹出了「安地斯壁」——後來全世界每座城邦都有的堅盾，」 → 「仿造出了「安地斯壁」——後來全世界每座城邦都有的堅盾，」

`body`（片段 69）：「一半不是任何語言——殼學會錄了她三百小時的話，」 → 「一半不是任何語言——稽古學會錄了她三百小時的話，」

`body`（片段 88）：「他替她擋掉塞勒涅的合約、殘聯的徵調、殼學會的研究申請。」 → 「他替她擋掉塞勒涅的合約、殘聯的徵調、稽古學會的研究申請。」

`tags[0]`（片段 1）：「摹機黎明」 → 「衍型黎明」


### content/lore/characters/irina-voronina.json

`body`（片段 9）：「她以為是殼目壞了，」 → 「她以為是靈目壞了，」

`body`（片段 28）：「第一次潮之後，」 → 「第一次蝕潮之後，」

`body`（片段 33）：「潮信會也偷偷買。」 → 「沐蝕會也偷偷買。」

`body`（片段 50）：「我看得到潮。」 → 「我看得到蝕潮。」


### content/lore/characters/joao-ferreira.json

`body`（片段 1）：「第一次潮的那一夜，」 → 「第一次蝕潮的那一夜，」


### content/lore/characters/jonas-halvorsen.json

`summary`（片段 2）：「死在第一次潮之前十八年，」 → 「死在第一次蝕潮之前十八年，」

`body`（片段 48）：「十八年後第一次潮來了，」 → 「十八年後第一次蝕潮來了，」

`body`（片段 49）：「再二十六年背面裂開、兩百公里的殼帶露出來，」 → 「再二十六年背面裂開、兩百公里的墟帶露出來，」

`body`（片段 51）：「潮信會說他早就知道；」 → 「沐蝕會說他早就知道；」


### content/lore/characters/kim-haneul.json

`summary`（片段 1）：「慶州殼陵裡被處容認主的巫堂之女；」 → 「慶州古陵裡被處容認主的巫堂之女；」

`body`（片段 4）：「第一次潮那年河娜十五歲，」 → 「第一次蝕潮那年河娜十五歲，」

`body`（片段 6）：「潮來以後找上門的人多了一倍，」 → 「蝕潮來以後找上門的人多了一倍，」

`body`（片段 7）：「每一戶都想請巫堂把潮趕走。」 → 「每一戶都想請巫堂把蝕潮趕走。」

`body`（片段 16）：「## 慶州殼之爭」 → 「## 慶州古陵之爭」

`body`（片段 18）：「2100 年的大潮在慶州古墳群底下露出一角殼。」 → 「2100 年的大潮在慶州古墳群底下露出古代機的一角裝甲。」

`body`（片段 32）：「她後來說她沒有在跳給殼看，」 → 「她後來說她沒有在跳給古代機看，」

`body`（片段 34）：「殼開了。」 → 「古代機打開了。」

`body`（片段 37）：「殼學會替刻痕作解讀：」 → 「稽古學會替刻痕作解讀：」

`body`（片段 56）：「離開處容超過一個潮月就會衰弱。」 → 「離開處容超過一個蝕月就會衰弱。」

`body`（片段 60）：「型錄採購、渡潮配額、和塞勒涅的「友好」條款。」 → 「型錄採購、渡月配額、和塞勒涅的「友好」條款。」

`body`（片段 70）：「意圖一條一條亮在殼目上，」 → 「意圖一條一條亮在靈目上，」

`body`（片段 80）：「在殼的面前跳一場——沒有鼓。」 → 「在它面前跳一場——沒有鼓。」

`relations[1].note`（片段 1）：「慶州時是搶殼的對手，」 → 「慶州時是爭奪古代機的對手，」


### content/lore/characters/kofi-mensah.json

未改。body 的「每個大潮都會亮起來的綠燈」屬表 index 66／規則 3 的強弱起落用語。

### content/lore/characters/kuafu.json

`aka[2]`（片段 1）：「第一台醒的殼」 → 「第一台醒的古代機」

`role`（片段 1）：「第一台醒來的古代機甲——一個先民、一隻獸、一層殼」 → 「第一台醒來的古代機甲——一個先民、一隻獸、一層裝甲」

`body`（片段 2）：「殼守不說「那台夸父」，」 → 「守寢人不說「那台夸父」，」

`body`（片段 5）：「每一台古代機甲都是一個人、一隻獸、一層殼，」 → 「每一台古代機甲都是一個人、一隻獸、一層裝甲，」

`body`（片段 11）：「一萬一千年前上一次潮來的時候，」 → 「一萬一千年前上一次蝕潮來的時候，」

`body`（片段 13）：「再披上一層誰也說不出成分的殼。」 → 「再披上一層誰也說不出成分的裝甲。」

`body`（片段 15）：「潮從地上裂開，」 → 「蝕潮從地上裂開，」

`body`（片段 20）：「殼守的抄本裡有一句只屬於他：」 → 「守寢人的抄本裡有一句只屬於他：」

`body`（片段 31）：「殼守說，」 → 「守寢人說，」

`body`（片段 34）：「夸父的殼甲至今帶著獸的骨形，」 → 「夸父的鎧甲至今帶著獸的骨形，」

`body`（片段 39）：「2089 年三月的潮夜，」 → 「2089 年三月的蝕夜，」

`body`（片段 52）：「秦望舒看著他「就懂了」怎麼摹。」 → 「秦望舒看著他「就懂了」怎麼仿造。」

`body`（片段 53）：「摹一、長槍，」 → 「衍一、長槍，」

`body`（片段 54）：「往後一切摹機的血統，」 → 「往後一切衍型機的血統，」

`body`（片段 65）：「殼守說那不是能力，」 → 「守寢人說那不是能力，」

`body`（片段 72）：「殼守最怕的不是她死，」 → 「守寢人最怕的不是她死，」

`body`（片段 78）：「## 殼守的寫法」 → 「## 守寢人的寫法」

`body`（片段 79）：「殼守的名冊把他當人寫：」 → 「守寢人的名冊把他當人寫：」

`body`（片段 80）：「生於潮前，」 → 「生於蝕潮前，」

`relations[2].relation`（片段 1）：「摹他的人」 → 「仿造他的人」

`relations[2].note`（片段 1）：「看著他就懂了怎麼摹；」 → 「看著他就懂了怎麼仿造；」

`relations[2].note`（片段 2）：「一切摹機血統的起點。」 → 「一切衍型機血統的起點。」

`relations[3].note`（片段 1）：「同一場上一次潮裡的人：」 → 「同一場上一次蝕潮裡的人：」

`tags[2]`（片段 1）：「殼守」 → 「守寢人」


### content/lore/characters/lobsang.json

`role`（片段 1）：「殼守長老、挖掘隊工頭、刻痕抄本的掌管者」 → 「守寢人長老、挖掘隊工頭、刻痕抄本的掌管者」

`body`（片段 16）：「殼看過他，」 → 「古代機看過他，」

`body`（片段 32）：「殼學會的人來了，」 → 「稽古學會的人來了，」

`body`（片段 33）：「用殼目掃描三天就走了；」 → 「用靈目掃描三天就走了；」

`body`（片段 39）：「殼守的刻痕抄本由他掌管，」 → 「守寢人的刻痕抄本由他掌管，」

`body`（片段 42）：「殼守付給傭兵的報酬也是這兩樣：」 → 「守寢人付給傭兵的報酬也是這兩樣：」

`body`（片段 54）：「年輕的殼守問他，」 → 「年輕的守寢人問他，」

`body`（片段 58）：「殼等了一萬年，」 → 「古代機等了一萬年，」

`tags[0]`（片段 1）：「第一次潮」 → 「第一次蝕潮」

`tags[1]`（片段 1）：「殼守」 → 「守寢人」


### content/lore/characters/m3.json

`summary`（片段 2）：「據說 2099 年在月面背面深處被第二台殼認主，」 → 「據說 2099 年在月面背面深處被第二台古代機認主，」

`summary`（片段 4）：「「背面」說他／她從沒離開過殼。」 → 「「背面」說他／她從沒離開過古代機。」

`body`（片段 3）：「也從未承認背面遺跡帶裡有第二台殼。」 → 「也從未承認背面遺跡帶裡有第二台古代機。」

`body`（片段 11）：「挖出的恩底彌翁永眠不醒——於是公司學會了「不靠認主也能摹」，」 → 「挖出的恩底彌翁永眠不醒——於是公司學會了「不靠認主也能仿造」，」

`body`（片段 12）：「殼目、無人化、魂核介面全是從那具不醒的殼上學來的。」 → 「靈目、無人化、魂核介面全是從那台不醒的古代機上學來的。」

`body`（片段 23）：「大潮之夜站在殼前的，」 → 「大潮之夜站在古代機前的，」

`body`（片段 27）：「殼認了他／她。」 → 「它認了他／她。」

`body`（片段 28）：「公司叫那台殼「赫卡忒」：」 → 「公司叫那台古代機「赫卡忒」：」

`body`（片段 35）：「- 有人說 M-3 從沒離開過殼，」 → 「- 有人說 M-3 從沒離開過古代機，」

`body`（片段 42）：「像有人舉著火把在殼帶裡走。」 → 「像有人舉著火把在墟帶裡走。」

`body`（片段 58）：「殼學會的人提到這件事時會壓低聲音；」 → 「稽古學會的人提到這件事時會壓低聲音；」


### content/lore/characters/mara-okoye.json

`body`（片段 41）：「她的手不抖——在搖晃的機庫裡接流光脈管、在連吼的座艙裡校殼目，」 → 「她的手不抖——在搖晃的機庫裡接流光脈管、在連吼的座艙裡校靈目，」

`body`（片段 80）：「「殼不是在對我們說話，」 → 「「古代機不是在對我們說話，」

`body`（片段 83）：「但每次修完機甲都會拍一下殼甲，」 → 「但每次修完機甲都會拍一下鎧甲，」


### content/lore/characters/markus-njoroge.json

`body`（片段 7）：「第一次潮後保護區被蝕域吃掉一半，」 → 「第一次蝕潮後保護區被蝕域吃掉一半，」


### content/lore/characters/mina-darzi.json

`role`（片段 1）：「渡潮船貨布縫補工與押貨人」 → 「渡月船貨布縫補工與押貨人」

`body`（片段 11）：「她在赤道港替渡潮船補貨布，」 → 「她在赤道港替渡月船補貨布，」


### content/lore/characters/molly-van-den-berg.json

`body`（片段 5）：「第一次潮後北海也開了裂縫，」 → 「第一次蝕潮後北海也開了裂縫，」

`body`（片段 7）：「港務局決定自己買摹機。」 → 「港務局決定自己買衍型機。」

`body`（片段 8）：「她是唯一會同時讀潮汐表和摹機維修手冊的人，」 → 「她是唯一會同時讀潮汐表和衍型機維修手冊的人，」

`body`（片段 48）：「2100 年慶州殼之爭，」 → 「2100 年慶州古陵之爭，」

`body`（片段 49）：「鹽鷗和釜山、塞勒涅三方搶殼，」 → 「鹽鷗和釜山、塞勒涅三方爭奪古代機，」

`body`（片段 55）：「裂縫旁露出一具殼。」 → 「裂縫旁露出一台古代機。」

`body`（片段 57）：「殼沒有認任何人——它到今天也沒有認過誰。」 → 「它沒有認任何人——它到今天也沒有認過誰。」

`body`（片段 61）：「她讓工坊把它掉下來的殼矢殘片嫁接到自己的長槍上。」 → 「她讓工坊把它掉下來的矢殘片嫁接到自己的長槍上。」


### content/lore/characters/not-yet.json

`body`（片段 44）：「哪座死星哨還能住、哪條天網訊路沒有白手套在聽、哪個背面的商人肯把一顆魂核偷偷帶上渡潮船。」 → 「哪座死星哨還能住、哪條天網訊路沒有白手套在聽、哪個背面的商人肯把一顆魂核偷偷帶上渡月船。」

`body`（片段 56）：「- 潮信會把它當「沒有肉的殼」裡最大的那個，」 → 「- 沐蝕會把它當「沒有肉的軀殼」裡最大的那個，」


### content/lore/characters/nur.json

`body`（片段 22）：「殼學會派人來看過她，」 → 「稽古學會派人來看過她，」

`body`（片段 24）：「潮信會也派人來過，」 → 「沐蝕會也派人來過，」

`body`（片段 25）：「說她是被潮祝福的，」 → 「說她是被蝕潮祝福的，」


### content/lore/characters/ogun-adeyemi.json

`role`（片段 1）：「神經學者、「遺跡誘導」理論提出者、殼學會共同創辦人」 → 「神經學者、「遺跡誘導」理論提出者、稽古學會共同創辦人」

`summary`（片段 2）：「是因為 23 處殼同夜露出」的拉哥斯神經學者；」 → 「是因為 23 處古代機同夜露出」的拉哥斯神經學者；」

`body`（片段 7）：「一個巨大的、站著的、有殼的東西。」 → 「一個巨大的、站著的、披著裝甲的東西。」

`body`（片段 16）：「夢的密度在 23 個點上最濃——正好是第一次潮那一夜塌出殼來的 23 處。」 → 「夢的密度在 23 個點上最濃——正好是第一次蝕潮那一夜塌出古代機來的 23 處。」

`body`（片段 21）：「」** 獵團後來把這件事叫殼訊，」 → 「」** 獵團後來把這件事叫夢召，」

`body`（片段 26）：「## 殼學會」 → 「## 稽古學會」

`body`（片段 29）：「和考古學家尤金妮亞・費雷羅在一間地下室裡創了殼學會。」 → 「和考古學家尤金妮亞・費雷羅在一間地下室裡創了稽古學會。」

`body`（片段 33）：「這條規矩到 2108 年殼學會還在用。」 → 「這條規矩到 2108 年稽古學會還在用。」

`body`（片段 46）：「殼學會在阿克拉替他留了位子。」 → 「稽古學會在阿克拉替他留了位子。」

`body`（片段 56）：「殼學會在蒙特婁的地下室牆上掛著他的一句話，」 → 「稽古學會在蒙特婁的地下室牆上掛著他的一句話，」

`relations[0].note`（片段 1）：「2092 年在蒙特婁地下室一起創了殼學會；」 → 「2092 年在蒙特婁地下室一起創了稽古學會；」

`tags[0]`（片段 1）：「第一次潮」 → 「第一次蝕潮」

`tags[1]`（片段 1）：「殼學會」 → 「稽古學會」

`tags[2]`（片段 1）：「殼訊」 → 「夢召」


### content/lore/characters/okamoto-mayu.json

`summary`（片段 2）：「她懷疑有些刻痕畫的是沒有人的殼。」 → 「她懷疑有些刻痕畫的是沒有人的古代機。」

`body`（片段 4）：「第一次潮那年二十八歲，」 → 「第一次蝕潮那年二十八歲，」

`body`（片段 17）：「」** 殼學會為了這句話開了三個月的會——兩樣東西是什麼？」 → 「」** 稽古學會為了這句話開了三個月的會——兩樣東西是什麼？」

`body`（片段 19）：「殼和人？」 → 「古代機和人？」

`body`（片段 28）：「殼在大潮之夜認了拉吉夫。」 → 「古代機在大潮之夜認了拉吉夫。」

`body`（片段 29）：「她在殼的背甲上讀到一組反覆的刻紋：」 → 「她在它的背甲上讀到一組反覆的刻紋：」

`body`（片段 32）：「她替那台殼取名「刑天」——斷頭還戰的神。」 → 「她替那台古代機取名「刑天」——斷頭還戰的神。」

`body`（片段 33）：「殼學會有人嫌這名字不吉利，」 → 「稽古學會有人嫌這名字不吉利，」

`body`（片段 38）：「## 沒有人的殼」 → 「## 沒有人的古代機」

`body`（片段 41）：「某些刻痕畫的殼，」 → 「某些刻痕畫的古代機，」

`body`（片段 43）：「殼不認機魂，」 → 「古代機不認機魂，」

`body`（片段 45）：「但先民為什麼要畫一個空的殼？」 → 「但先民為什麼要畫一台空的古代機？」

`body`（片段 49）：「大潮讓南極羅斯冰棚底下露出一處殼。」 → 「大潮讓南極羅斯冰棚底下露出一處古墟。」

`body`（片段 54）：「一個殼，」 → 「一台古代機，」

`relations[0].note`（片段 3）：「替殼取了名。」 → 「替古代機取了名。」

`tags[0]`（片段 1）：「殼學會」 → 「稽古學會」


### content/lore/characters/old-man.json

`body`（片段 2）：「老爹 2100 年在釜山育成——那一年慶州殼之爭，」 → 「老爹 2100 年在釜山育成——那一年慶州古陵之爭，」

`body`（片段 32）：「四個字的又太像殼技，」 → 「四個字的又太像異能，」

`body`（片段 67）：「鹽鷗守住了殼。」 → 「鹽鷗守住了古代機。」

`body`（片段 69）：「沒有一個換來殼。」 → 「沒有一個換來古代機。」


### content/lore/characters/old-pigeon.json

`role`（片段 1）：「「背面」的殼販子」 → 「「背面」的骸片販子」

`summary`（片段 1）：「渡潮船上永遠坐同一個位子的老頭；」 → 「渡月船上永遠坐同一個位子的老頭；」

`summary`（片段 2）：「賣殼殘片、野魂複本與座標，」 → 「賣骸片、野魂複本與座標，」

`body`（片段 1）：「從赤道港開往靜海市的渡潮船，」 → 「從赤道港開往靜海市的渡月船，」

`body`（片段 14）：「- **殼殘片**：」 → 「- **骸片**：」

`body`（片段 16）：「裝得上摹機的那種，」 → 「裝得上衍型機的那種，」

`body`（片段 28）：「哪裡的殼剛露出來、哪裡的封鎖線有洞。」 → 「哪裡的古墟剛露出來、哪裡的封鎖線有洞。」

`body`（片段 44）：「2102 年斯卡蓋拉克的殼出土，」 → 「2102 年斯卡蓋拉克的古代機出土，」

`tags[3]`（片段 1）：「渡潮船」 → 「渡月船」

## 殘留

以檔案、JSON 欄位及該欄位命中序號定位每一處「殼／摹／潮／鞘」。新詞「蝕潮」也一併列出，避免將 grep 命中誤認成未換舊詞。表列號使用 tabledb 的零起算 index。

### content/lore/characters/ines-huaman.json

`summary` 第 1 處：「2092 年大潮之夜在的的喀喀遺跡被維拉科查認主的女」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 1 處：「父親撐船、母親織布。第一次蝕潮那年她二十一歲，在普諾的港口扛貨。2」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 2 處：「2 年，湖東岸的淺灘在一次大潮後塌了一角，露出一面刻滿太陽紋的石牆」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 3 處：「## 認主之夜／／那一夜是大潮。挖掘隊打開了石室，裡面跪著一台古代」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 4 處：「大概是「爺爺」。／／## 逆潮之息／／維拉科查的異能是「逆潮之息」」——規則 3：保留水流意象的既有異能專名；本段是湖泊古代機的呼吸意象，未將「潮」用作裂縫週期名詞。

`body` 第 5 處：「之息／／維拉科查的異能是「逆潮之息」：高處無氣也能呼吸，而它站的那」——規則 3：保留水流意象的既有異能專名；本段是湖泊古代機的呼吸意象，未將「潮」用作裂縫週期名詞。

`body` 第 6 處：「己不確定。她只知道，每一次大潮的晚上，她都會夢見一片湖，湖底有一個」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。


### content/lore/characters/irina-voronina.json

`body` 第 1 處：「在同一分鐘裡亮起，像有人在地殼底下同時劃了 37 根火柴。她以為是」——表「保留」index 61、規則 2：地殼本義。

`body` 第 2 處：「票的軌道工人的氣話。第一次蝕潮之後，它成了唯一看得見全局的地方：大」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 3 處：「成了唯一看得見全局的地方：大潮前三天，哨所知道哪裡會開。伊麗娜接掌」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 4 處：「下面的人看得到牆，我看得到蝕潮。各有各的病。」兩百個哨所居民叫她「」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/joao-ferreira.json

`body` 第 1 處：「第一次蝕潮的那一夜，若昂・費雷拉三十五歲，正開」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/jonas-halvorsen.json

`summary` 第 1 處：「、拉開月弓的人；死在第一次蝕潮之前十八年，留下一句沒人聽懂的遺言。」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 1 處：「老人的囈語。十八年後第一次蝕潮來了，再二十六年背面裂開、兩百公里的」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/kim-haneul.json

`body` 第 1 處：「的母親是影島的巫堂。第一次蝕潮那年河娜十五歲，已經跟著母親的鼓跳了」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 2 處：「跟著母親的鼓跳了十年的祭；蝕潮來以後找上門的人多了一倍，每一戶都想」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 3 處：「了一倍，每一戶都想請巫堂把蝕潮趕走。母親每一場都跳，每一場都收錢，」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 4 處：「古陵之爭／／2100 年的大潮在慶州古墳群底下露出古代機的一角裝甲」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 5 處：「那年病了，來的是女兒。／／大潮之夜，炮火打到陵口，河娜還在跳。她後」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 6 處：「她只是先把門打開。／／每個大潮前夜，她會一個人走進港邊處容的機庫，」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。


### content/lore/characters/kofi-mensah.json

`body` 第 1 處：「塔，專門看蝕域邊上那盞每個大潮都會亮起來的綠燈。／」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。


### content/lore/characters/kuafu.json

`body` 第 1 處：「個先民。一萬一千年前上一次蝕潮來的時候，他和一隻長腿的獸同調到底、」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 2 處：「。刻痕說他「追著太陽走」：蝕潮從地上裂開，他就一路追，追到裂縫的另」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 3 處：「我一眼，才看她」。那一夜是大潮，他認了地質學家丹增・卓瑪——一個一」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 4 處：「寢人的名冊把他當人寫：生於蝕潮前，無卒年，籍貫青藏，職業一欄只有一」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`relations[0].note` 第 1 處：「2089 年大潮之夜認了她；她衰弱，他仍醒。」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`relations[3].note` 第 1 處：「同一場上一次蝕潮裡的人：一個追到天上，一個守到最後。」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/lobsang.json

`body` 第 1 處：「人。2089 年 5 月，大潮之夜，他的人鑿穿夸父之窩最後一層夯土」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`tags[0]` 第 1 處：「第一次蝕潮」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/m3.json

`body` 第 1 處：「台醒了。／／## 三號／／大潮之夜站在古代機前的，據說是一個編號 」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。


### content/lore/characters/mara-okoye.json

`body` 第 1 處：「，說的下一句話是：「下一次大潮三天後。」不是安慰，是提醒。／／##」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。


### content/lore/characters/markus-njoroge.json

`body` 第 1 處：「過，左腿走路有點拐。第一次蝕潮後保護區被蝕域吃掉一半，他失業了，去」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/mina-darzi.json

無命中。


### content/lore/characters/molly-van-den-berg.json

`mech` 第 1 處：「潮鷗-長槍」——表「保留」index 63、規則 3：海洋意象機體專名；mech 欄亦不在可改欄位。

`body` 第 1 處：「每一個會賴帳的船東。第一次蝕潮後北海也開了裂縫，港口的鐵翼炸不動從」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 2 處：「己買衍型機。她是唯一會同時讀潮汐表和衍型機維修手冊的人，於是成了第」——表「保留」index 62、規則 3：港務海洋潮汐。

`body` 第 3 處：「的口頭禪從港務局帶來：**「潮不等人，帳也不等。」**／／## 鹽」——規則 3／表「保留」index 62：源自港務的海潮俗語，海洋本義。

`body` 第 4 處：「天收工後去機庫跟它說話——說潮汐、說天氣、說今天哪個船東又賴帳了。」——表「保留」index 62、規則 3：港務海洋潮汐。

`body` 第 5 處：「來的那一個。／／她的隊長機「潮鷗-長槍」是鹽婆的家。茉莉坐在前座，」——表「保留」index 63、規則 3：海洋意象機體專名；mech 欄亦不在可改欄位。


### content/lore/characters/not-yet.json

`body` 第 1 處：「- 沐蝕會把它當「沒有肉的軀殼」裡最大的那個，懸賞它的位置。被問到」——規則 2／表「保留」index 61 的非古代機外殼本義：教派把機魂比作沒有血肉的容器；補成通行詞「軀殼」，不將機魂改設定為古代機。


### content/lore/characters/nur.json

`body` 第 1 處：「沐蝕會也派人來過，說她是被蝕潮祝福的，被哈米德用槍托趕走。她自己對」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/ogun-adeyemi.json

`body` 第 1 處：「個點上最濃——正好是第一次蝕潮那一夜塌出古代機來的 23 處。他把」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`tags[0]` 第 1 處：「第一次蝕潮」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。


### content/lore/characters/okamoto-mayu.json

`body` 第 1 處：「都出身的古文字學者，第一次蝕潮那年二十八歲，在研究甲骨文的殘片綴合」——定案新詞「蝕潮」，表 index 28／29；不是舊詞殘留。

`body` 第 2 處：「3 年舊陣列挖掘，古代機在大潮之夜認了拉吉夫。她在它的背甲上讀到一」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。

`body` 第 3 處：「古代機？／／2105 年，大潮讓南極羅斯冰棚底下露出一處古墟。她帶」——表「保留」index 66、規則 3：蝕潮強弱起落用語，大潮照用。


### content/lore/characters/old-man.json

無命中。


### content/lore/characters/old-pigeon.json

無命中。

## 沒做到或證據不足的

無任務範圍內未完成項。依交接書不跑 npm test、MCP、content_accept、wf-lint，不更新索引或 manifest，不改範圍外檔案。跨批同名用語由領導整合；本線沒有驗證其他批次。

npm run check 的 12 警告均指向未改的 content/base：8 個捕捉層 HP 差異、mx-faded 迴避值超帶、tidewolf instinct 超上限缺 band、kx-tide-crush 傷害超帶、infantry 未配裝；lore 的 2 警告是 events/busan-returned-seal.json 與 events/dark-quay-surety.json 未出現在 timeline，均不在本批允許範圍。沒有改動這些檔，也未為消除警告增加驗收。

本次新跑輸出：

```text
> mecha-srpg@0.1.0 check
> node src/content/loader.ts content/base

pack base 0.1.0
frame: 89
bodyplan: 39
component: 54
ability: 128
effect: 124
person: 37 (human 30, soul 7)
soultree: 6
terrain: 23
map: 17
faction: 10
species: 18
monster: 28
scenario: 26
aiprofile: 16
curve: 1
registries: 7/7
rules: 4/4
WARNING [content-load] content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING [content-load] content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING [content-load] content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING [content-load] content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING [content-load] content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING [content-load] content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING [content-load] content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [content-load] content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING [band-evasion] content/base/effects/mx-faded.json $.contribs[0].value value 25 exceeds upper limit 22; source numeric-bands.json rows[18]
WARNING [soft-overflow-band] content/base/species/tidewolf.json $.pools[1].bands instinct: no band covers values above max
WARNING [band-damage] content/base/abilities/kx-tide-crush.json $.packets value 28 exceeds upper limit 26; source numeric-bands.json rows[7]
WARNING [mechanical-unarmed] content/base/frames/infantry.json $.defaultLoadout mechanical frame has no defaultLoadout or innate attack
OK 0 errors, 12 warnings
```

```text
places per continent: {"非洲":5,"大洋洲":3,"亞洲":17,"南極":3,"月面":5,"軌道":3,"北美":4,"歐洲":5,"南美":4}
counts: {"faction":31,"character":63,"event":56,"place":49,"era":7} timeline=112
WARN events/busan-returned-seal.json: 未出現在 timeline
WARN events/dark-quay-surety.json: 未出現在 timeline
errors=0 warnings=2
```

## 需要決定的事

無阻塞待決事項；以下依交接書規則 5 記錄語境選擇，供跨批統一：

「渡潮配額」→「渡月配額」：依表 index 35 的地月渡運構詞，非新增專名。

「沒有肉的殼」→「沒有肉的軀殼」：這裡是沐蝕會對機魂的蔑稱，與「古代機本體」不同；用通行詞保留容器意象，不新增專名。其「殼」按規則 2 留存。

「一處殼」（南極冰棚的探勘地點）→「一處古墟」、「哪裡的殼剛露出來」（販售遺跡座標）→「哪裡的古墟剛露出來」：依規則 2 的遺跡義與規則 5 的古／墟構詞。相對地，「斯卡蓋拉克的殼出土」明指埃吉爾本體，改「斯卡蓋拉克的古代機出土」（表 index 52 備註）。

「露出一角殼」→「露出古代機的一角裝甲」：表 index 1／規則 2 的外層義，保留只露出一角的畫面。

「逆潮之息」保留：表未列該專名，依湖泊、呼吸的意象判作規則 3 的水流意象，不另造招式名。跨批若有同名處，請採一致判斷。

名字本身不含舊詞者，未發現需要另提的明顯翻譯腔改名建議。

## 子代理

未使用子代理；子代理成本為 0。全部指定閱讀、換詞及殘留判讀均由 cx-rn-02 親自完成。品質證據為上述固定五條驗收。

## 以後交接書該點名的工具

無。交接書已列出本次所需工具；臨時腳本、對照中間檔與原始檢查輸出均留在 /tmp/cx-rn-02/，未寫入 worktree。
