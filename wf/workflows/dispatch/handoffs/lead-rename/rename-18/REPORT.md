## 已讀清單

- `AGENTS.md`（親讀主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`）
- `wf/workflows/common/user.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/polish.md`
- `wf/workflows/content/lore-text.md`
- `wf/workflows/content/world-pillars.md`
- `content/lore/style.md`
- `wf/workflows/planning/design-notes/terms.md`
- `wf/workflows/planning/design-notes/terms-rename.json`（用 tabledb.py 分次讀完古代機、機甲、蝕、專有名詞、保留五類）

另讀：交接書 cx-rn-18.md、wf/SESSION-LOG.md、wf/WAIT_USER.md、wf/WORKFLOWS.md、wf/workflows/inbox/PROTOCOL.md、wf/workflows/dispatch/lessons.md，以及唯讀參照 content/lore/events/fleshless-declaration.json、content/lore/events/antarctic-shell.json。

## 做了什麼

cx-rn-18 完成 rename-18；檢視指定 10 檔及年表全部 127 條，修改 8 檔、70 個文字欄位。兩個 base 檔只含保留詞「潮鷗」，維持原文。不 commit。

固定五條驗收：

1. git status --short：只有允許的 7 個 event 檔與 timeline.json 變更，另有開工前已存在的 ?? node_modules。容量最大增幅為 kuafu-mountain-vigil.json 的 27 bytes（約 0.97%），未觸發件數或容量 gate。
2. npm run check：exit 0，末行 OK 0 errors, 8 warnings；node content/lore/check.ts：exit 0，errors=0 warnings=2，timeline=127。
3. 指定 git grep 已執行；本批所有殘留逐處列於下節，無「殼／摹／鞘／古機／蝕盛／蝕歇／原鞘」。
4. 下節列齊 10 檔逐檔對照，含無須修改者。
5. 第一段已讀清單列齊先讀指定的 10 個路徑。

僅執行指定驗收；未跑 npm test、content_accept、wf-lint 或另加測試。工作暫存與新檢查輸出在 /tmp/cx-rn-18/；check.log、lore-check.log、residual-all.txt 為本次實跑。

## 逐檔對照

欄位路徑與陣列索引使用零起算；片段逐處列出，無改動的半句省略。

### content/base/frames/saltgull-tidegull-longspear.json

無換詞：「潮鷗」屬保留專名（表 index 65）。

### content/base/scenarios/nairobi-joint-cordon.json

無換詞：「潮鷗」屬保留專名（表 index 65）。

### content/lore/events/accra-unbarred-gate.json

- `summary`：「阿克拉民兵在蝕盛夜替難民與受雇獵團留住城門，」 → 「阿克拉民兵在大潮夜替難民與受雇獵團留住城門，」

### content/lore/events/bellless-dawn.json

- `body`：「那夜蝕盛，」 → 「那夜大潮，」

### content/lore/events/hundred-lanterns.json

- `body`：「蝕盛之夜，」 → 「大潮之夜，」

### content/lore/events/kuafu-mountain-vigil.json

- `summary`：「殼守兌現護衛報酬，」 → 「守寢人兌現護衛報酬，」
- `summary`：「並與殼學會約定抄本互存而不移走古代機。」 → 「並與稽古學會約定抄本互存而不移走古代機。」
- `body`：「蝕盛夜的流獸闖進夸父之窩外圍，」 → 「大潮夜的流獸闖進夸父之窩外圍，」
- `body`：「殼學會的人在石屋裡攤開濕拓紙，」 → 「稽古學會的人在石屋裡攤開濕拓紙，」
- `body`：「殼守與殼學會約定將新拓本分存兩地。」 → 「守寢人與稽古學會約定將新拓本分存兩地。」
- `consequences[0]`：「殼守沒有因此接受外界徵調。」 → 「守寢人沒有因此接受外界徵調。」
- `consequences[1]`：「殼守照約支付護衛刻痕抄本，」 → 「守寢人照約支付護衛刻痕抄本，」
- `consequences[2]`：「殼守與殼學會約定拓本分存兩地，」 → 「守寢人與稽古學會約定拓本分存兩地，」

### content/lore/events/nine-gates.json

- `body`：「那夜蝕盛，」 → 「那夜大潮，」

### content/lore/events/southern-sky-vigil.json

- `summary`：「與殼學會暫定救傷互保，」 → 「與稽古學會暫定救傷互保，」
- `body`：「殼學會交出營地傷者的位置，」 → 「稽古學會交出營地傷者的位置，」
- `consequences[1]`：「雪梨與殼學會建立遇襲通報和救傷互保，」 → 「雪梨與稽古學會建立遇襲通報和救傷互保，」

### content/lore/events/wreck-crown.json

- `body`：「蝕盛已過了入夜最亮的時候，」 → 「大潮已過了入夜最亮的時候，」

### content/lore/timeline.json

- `entries[0].title`：「先民封潮」 → 「先民封蝕」
- `entries[0].summary`：「先民輸了上一次潮，」 → 「先民輸了上一次蝕潮，」
- `entries[0].summary`：「把潮的另一端推上月亮；」 → 「把蝕潮的另一端推上月亮；」
- `entries[0].summary`：「最後一批殼站在原地，」 → 「最後一批古代機站在原地，」
- `entries[5].title`：「渡潮航路定班」 → 「渡月航路定班」
- `entries[8].title`：「第一次潮」 → 「第一次蝕潮」
- `entries[12].summary`：「青藏遺跡的殼在大潮之夜認了地質學家丹增・卓瑪——人類第一台機甲是挖出來的。」 → 「青藏遺跡的古代機在大潮之夜認了地質學家丹增・卓瑪——人類第一台機甲是挖出來的。」
- `entries[13].title`：「殼訊之夜」 → 「夢召之夜」
- `entries[14].summary`：「第一次潮四十天後，」 → 「第一次蝕潮四十天後，」
- `entries[18].title`：「摹一聯合成立」 → 「衍一聯合成立」
- `entries[18].summary`：「以夸父為藍本開始摹。」 → 「以夸父為藍本開始仿造。」
- `entries[19].title`：「摹一下線」 → 「衍一下線」
- `entries[19].summary`：「機械系從此叫摹機。」 → 「機械系從此叫衍型機。」
- `entries[20].title`：「摹二・堅盾下線」 → 「衍二・堅盾下線」
- `entries[20].summary`：「摹一聯合第二型，」 → 「衍一聯合第二型，」
- `entries[21].title`：「殼學會成立」 → 「稽古學會成立」
- `entries[21].summary`：「殼不是遺物，」 → 「古代機不是遺物，」
- `entries[22].title`：「的的喀喀挖殼」 → 「的的喀喀掘墟」
- `entries[23].summary`：「秦望舒把摹二・堅盾整套圖公刻在天網：」 → 「秦望舒把衍二・堅盾整套圖公刻在天網：」
- `entries[24].summary`：「財政崩潰、摹一聯合解散：」 → 「財政崩潰、衍一聯合解散：」
- `entries[28].summary`：「第一批照公刻圖摹出來的堅盾-I型在漢堡、伊斯坦堡、達卡同時下線。」 → 「第一批照公刻圖仿造出來的堅盾-I型在漢堡、伊斯坦堡、達卡同時下線。」
- `entries[29].title`：「大裂谷挖殼」 → 「大裂谷掘墟」
- `entries[30].summary`：「基多以維拉科查為藍本造出第一台重裝摹機；」 → 「基多以維拉科查為藍本造出第一台重裝衍型機；」
- `entries[34].summary`：「基多把船廠賣給塞勒涅換渡潮港；」 → 「基多把船廠賣給塞勒涅換渡月港；」
- `entries[35].summary`：「基多、奈洛比、新加坡三港分渡潮船航班；」 → 「基多、奈洛比、新加坡三港分渡月船航班；」
- `entries[36].summary`：「潮信會成教。」 → 「沐蝕會成教。」
- `entries[38].title`：「斷臂殼」 → 「斷臂」
- `entries[38].summary`：「鐵砧卻從那條手臂摹出自己的血統。」 → 「鐵砧卻從那條手臂仿造出自己的血統。」
- `entries[39].title`：「月面潮殼同夜」 → 「月面蝕墟同夜」
- `entries[39].summary`：「同夜露出兩百公里殼帶。」 → 「同夜露出兩百公里墟帶。」
- `entries[40].summary`：「殼學會抗議、「背面」誕生。」 → 「稽古學會抗議、「背面」誕生。」
- `entries[41].summary`：「潮信會的騎手騎著沒有拘束裝置的掘犬衝進浦那外的拘束場。」 → 「沐蝕會的騎手騎著沒有拘束裝置的掘犬衝進浦那外的拘束場。」
- `entries[45].summary`：「（傳聞）背面深處第二台殼認了測試員 M-3；」 → 「（傳聞）背面深處第二台古代機認了測試員 M-3；」
- `entries[46].summary`：「塞勒涅第一款量產型錄摹機，」 → 「塞勒涅第一款量產型錄衍型機，」
- `entries[46].summary`：「從靜海殼摹出的骨架；」 → 「從靜海仿造出的骨架；」
- `entries[46].summary`：「殼目最好、最貴、記帳。」 → 「靈目最好、最貴、記帳。」
- `entries[49].title`：「慶州殼之爭」 → 「慶州古陵之爭」
- `entries[49].summary`：「釜山、鹽鷗、塞勒涅三方搶殼；」 → 「釜山、鹽鷗、塞勒涅三方爭搶古代機；」
- `entries[51].title`：「殼守拒絕殘軍」 → 「守寢人拒絕殘軍」
- `entries[53].summary`：「殼守兌現護衛報酬，」 → 「守寢人兌現護衛報酬，」
- `entries[53].summary`：「並與殼學會約定抄本互存而不移走古代機。」 → 「並與稽古學會約定抄本互存而不移走古代機。」
- `entries[60].summary`：「獸族＋蟲族雙潮壓達卡；」 → 「獸族與蟲族兩股蝕潮壓向達卡；」
- `entries[61].title`：「斯卡蓋拉克殼出土」 → 「斯卡蓋拉克的古代機出土」
- `entries[61].summary`：「北海裂縫旁的殼「埃吉爾」，」 → 「北海裂縫旁的古代機「埃吉爾」，」
- `entries[62].summary`：「渡潮船拒載生物機甲，」 → 「渡月船拒載生物機甲，」
- `entries[64].summary`：「第三刃以處容（潮鰭殼）為藍本的 C 級近戰兩棲機；」 → 「第三刃以處容（潮鰭）為藍本的 C 級近戰兩棲機；」
- `entries[66].summary`：「浦那外舊陣列底下的殼大潮之夜認了拉吉夫；」 → 「浦那外舊陣列底下的古代機在大潮之夜認了拉吉夫；」
- `entries[68].summary`：「奈洛比帶獸部件接口的摹機；」 → 「奈洛比帶獸部件接口的衍型機；」
- `entries[69].summary`：「殘聯前身與潮信會同時派人來看。」 → 「殘聯前身與沐蝕會同時派人來看。」
- `entries[74].summary`：「鐵砧用斷臂殼血統與刑天刻痕改出自己的 C 級重裝機；」 → 「鐵砧用斷臂血統與刑天刻痕改出自己的 C 級重裝機；」
- `entries[79].summary`：「潮信會宣布機魂是沒有肉的殼，」 → 「沐蝕會宣布機魂是沒有肉的軀體，」
- `entries[82].title`：「冰下殼」 → 「冰下古墟」
- `entries[82].summary`：「大潮露出南極殼；」 → 「大潮露出南極古墟；」
- `entries[82].summary`：「殼學會探勘隊失蹤一半；」 → 「稽古學會探勘隊失蹤一半；」
- `entries[82].summary`：「「沒有人的殼」刻痕。」 → 「「沒有人的裝甲」刻痕。」
- `entries[83].summary`：「雪梨拒絕任何人挖彩虹蛇殼；」 → 「雪梨拒絕任何人挖彩虹蛇；」
- `entries[106].title`：「渡潮船票價調漲」 → 「渡月船票價調漲」
- `entries[106].summary`：「塞勒涅把去程票調到一個潮月薪水、回程照舊便宜——公司要壓艙。」 → 「塞勒涅把去程票調到一個蝕月薪水、回程照舊便宜——公司要壓艙。」
- `entries[109].summary`：「殼學會派第二批人去冰下殼；」 → 「稽古學會派第二批人去冰下古墟；」
- `entries[115].summary`：「與殼學會暫定救傷互保，」 → 「與稽古學會暫定救傷互保，」
- `entries[116].summary`：「阿克拉民兵在蝕盛夜替難民與受雇獵團留住城門，」 → 「阿克拉民兵在大潮夜替難民與受雇獵團留住城門，」
- `entries[121].summary`：「殼學會的人在吉大港打聽伊爾瑟・布蘭特。」 → 「稽古學會的人在吉大港打聽伊爾瑟・布蘭特。」
- `entries[123].summary`：「殼學會的喬杜里在達卡酒艙賣一組座標，」 → 「稽古學會的喬杜里在達卡酒艙賣一組座標，」
- `entries[124].summary`：「背面說有個從不摘頭盔的人搭渡潮船回程，」 → 「背面說有個從不摘頭盔的人搭渡月船回程，」

## 殘留

以下逐處列出本批 10 檔的「殼|摹|潮|鞘」命中；實際僅剩「潮」。表編號為 tabledb 輸出的零起算 index。全 content 的 grep 原始輸出只作範圍篩選，不對其他檔動手。

### content/base/frames/saltgull-tidegull-longspear.json

- `name`「潮鷗-長槍」：海洋意象專名，保留表 index 65、規則 3。

### content/base/scenarios/nairobi-joint-cordon.json

- `brief`「獸爪；牧者掩護包抄，潮鷗貼水穿行，犁守著舊」：海洋意象專名，保留表 index 65、規則 3。

### content/lore/events/accra-unbarred-gate.json

- `summary`「阿克拉民兵在大潮夜替難民與受雇獵團留」：大潮形容強弱起落，保留表 index 68、規則 3。

### content/lore/events/bellless-dawn.json

- `body`「認舊碼頭領錢。那夜大潮，採菌船停在五湖菌海」：大潮形容強弱起落，保留表 index 68、規則 3。

### content/lore/events/hundred-lanterns.json

- `body`「## 燈下的船  大潮之夜，釜山外港的吊臂」：大潮形容強弱起落，保留表 index 68、規則 3。

### content/lore/events/kuafu-mountain-vigil.json

- `body`「自己轉身去扶傷者。大潮夜的流獸闖進夸父之窩」：大潮形容強弱起落，保留表 index 68、規則 3。

### content/lore/events/nine-gates.json

- `body`「便要核一次貨。那夜大潮，外院的蟲足聲混在雨」：大潮形容強弱起落，保留表 index 68、規則 3。

### content/lore/events/southern-sky-vigil.json

無殘留。

### content/lore/events/wreck-crown.json

- `summary`「的拖船纜工喊出了「萬潮葬王」。」：海獸二名；正文明說船經歷多次海上潮水，屬海洋意象，依規則 3 保留（表 index 65 同類）。
- `body`「底下露出了腿。  大潮已過了入夜最亮的時候」：大潮形容強弱起落，保留表 index 68、規則 3。
- `body`「夜最亮的時候，海上的潮水仍往岸邊湧。吉大港」：海水本義，保留表 index 64、規則 3。
- `body`「在海面的斷桅說：「萬潮葬王。吉大港的那隻。」：海獸二名；正文明說船經歷多次海上潮水，屬海洋意象，依規則 3 保留（表 index 65 同類）。
- `body`「釋，那些船熬過多少次潮水都沒沉透，卻在牠腳」：海水本義，保留表 index 64、規則 3。
- `consequences[0]`「港的那隻」與二名「萬潮葬王」並記。」：海獸二名；正文明說船經歷多次海上潮水，屬海洋意象，依規則 3 保留（表 index 65 同類）。

### content/lore/timeline.json

- `entries[0].summary`「先民輸了上一次蝕潮，把裂縫與答案一起埋」：已是定案新詞「蝕潮」，表 index 28／29、規則 3。
- `entries[0].summary`「案一起埋進地下，把蝕潮的另一端推上月亮；最」：已是定案新詞「蝕潮」，表 index 28／29、規則 3。
- `entries[8].title`「第一次蝕潮」：已是定案新詞「蝕潮」，表 index 28／29、規則 3。
- `entries[12].summary`「青藏遺跡的古代機在大潮之夜認了地質學家丹增」：大潮形容強弱起落，保留表 index 68、規則 3。
- `entries[14].summary`「第一次蝕潮四十天後，一個人從孟」：已是定案新詞「蝕潮」，表 index 28／29、規則 3。
- `entries[49].summary`「涅三方爭搶古代機；大潮之夜處容認了巫堂之女」：大潮形容強弱起落，保留表 index 68、規則 3。
- `entries[57].summary`「C 的蟲族裂縫，每大潮賣 D 級子體。」：大潮形容強弱起落，保留表 index 68、規則 3。
- `entries[60].summary`「獸族與蟲族兩股蝕潮壓向達卡；鐵砧受雇、」：已是定案新詞「蝕潮」，表 index 28／29、規則 3。
- `entries[64].summary`「第三刃以處容（潮鰭）為藍本的 C 級」：海洋意象專名，保留表 index 65、規則 3。
- `entries[66].summary`「陣列底下的古代機在大潮之夜認了拉吉夫；岡本」：大潮形容強弱起落，保留表 index 68、規則 3。
- `entries[82].summary`「大潮露出南極古墟；稽古學」：大潮形容強弱起落，保留表 index 68、規則 3。
- `entries[116].summary`「阿克拉民兵在大潮夜替難民與受雇獵團留」：大潮形容強弱起落，保留表 index 68、規則 3。
- `entries[117].summary`「的拖船纜工喊出了「萬潮葬王」。」：海獸二名；正文明說船經歷多次海上潮水，屬海洋意象，依規則 3 保留（表 index 65 同類）。
- `entries[123].summary`「酒艙賣一組座標，說大潮時山脊會「呼吸」。」：大潮形容強弱起落，保留表 index 68、規則 3。

## 沒做到或證據不足的

無未完成的固定驗收項。檢查警告涉及範圍外檔案，未修改也未另跑基準檢查，因此不宣稱已證明警告早於本批；本次原始輸出如下。

```text
> mecha-srpg@0.1.0 check
> node src/content/loader.ts content/base && node src/ops/content/check.ts content/base

pack base 0.1.0
frame: 96
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
scenario: 28
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
calendar: 1
ferry: 1
ship: 1
keymap: 1
affinity: 1
operation: 10
treaty: 7
lineage: 10
model: 32
forces: 1
node: 8
route: 12
rift: 4
encounter: 17
faction-ops: 10
map: 0
place: 0
lane: 0
regions: 0
wterrain: 0
contract: 17
action: 28
market: 6
service: 4
recruit: 4
background: 13
beasts: 4
research: 17
job: 6
names: 27
event: 56
dialogue: 19
room: 7
templates: 3
start: 1
WARNING content/base/monsters/lancewing-b.json $.partsOverride capture layer HP differs: heart-shrine, crown, left-wing, right-wing, sting, lantern
WARNING content/base/monsters/mirror-a.json $.partsOverride capture layer HP differs: mirror-side, bare-side, hidden-core, folded-limb, trailing-limb
WARNING content/base/monsters/nestmother-landlord.json $.partsOverride capture layer HP differs: shoulder, trunk, core-belly
WARNING content/base/monsters/rotwarden-a.json $.partsOverride capture layer HP differs: torso, arm, legs, head
WARNING content/base/monsters/siegebeetle-a.json $.partsOverride capture layer HP differs: gate-mantle, horn, heart-shrine, fore-legs, mid-legs, hind-legs
WARNING content/base/monsters/stalk-b.json $.partsOverride capture layer HP differs: pillar, roots, crown
WARNING content/base/monsters/tidewolf-b.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
WARNING content/base/monsters/tidewolf-c.json $.partsOverride capture layer HP differs: core, front-left, front-right, rear-left, rear-right
OK 0 errors, 8 warnings
```

```text
places per continent: {"非洲":5,"大洋洲":3,"亞洲":17,"南極":3,"月面":5,"軌道":3,"北美":4,"歐洲":5,"南美":4}
counts: {"faction":31,"character":65,"event":71,"place":49,"era":7} timeline=127
WARN events/busan-returned-seal.json: 未出現在 timeline
WARN events/dark-quay-surety.json: 未出現在 timeline
errors=0 warnings=2
```

## 需要決定的事

無需阻塞本批的決定，沒有自創新專名。以下語境選擇留供領導核閱：

- timeline entries[79]「沒有肉的殼」→「沒有肉的軀體」：指機魂所據軀體，沿用既有 event/fleshless-declaration 的同句，非新增專名。
- timeline entries[82]「南極殼」→「南極古墟」、「沒有人的殼」→「沒有人的裝甲」：分別指遺跡與刻痕中的外層，與既有 event/antarctic-shell 內容一致；依規則 2 與冰下古墟定案。
- timeline entries[60]「獸族＋蟲族雙潮壓達卡」→「獸族與蟲族兩股蝕潮壓向達卡」：「壓」在此為動詞，不能把跨詞邊界的「潮壓」誤換成「蝕壓」；保留兩股侵襲的原意。
- 「萬潮葬王」依海洋意象保留，沒有另改二名。未發現需要另提的翻譯腔名字建議。

## 子代理

未使用。子代理成本為 0；規矩、逐處語境判讀、換詞與固定驗收由 cx-rn-18 親自完成。

## 以後交接書該點名的工具

無。現有指定工具足以完成本批。
