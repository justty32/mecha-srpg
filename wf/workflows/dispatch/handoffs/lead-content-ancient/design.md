# lead-content-ancient 設計表（三個工人共用）

[交接書目錄](../lead-content-ancient/)｜領導 `lead-content-ancient` 2026-10-24 定。工人照本檔做，與本檔衝突時以本檔為準；本檔沒寫的細節自行決定，風格大膽、有梗。

## 一、引擎實況（照這個寫，否則資料是死的）

- 範本：`content/base/frames/ancient-rearguard.json`（刑天）、`bodyplans/ancient-warden.json`、`abilities/rearguard-oath.json`、`abilities/shell-lance.json`、`effects/rearguard-oath.json`、`persons/ilse-brandt.json`、`persons/glove.json`、`soultrees/moji-std.json`、`effects/perk-soul-calc-1.json`、`effects/injury-concussion.json`。型別在 `src/core/types-def.ts`，驗證 `npm run check`。
- **`mode` 只用 `activated` 或 `sustained`**。`passive` 引擎直接拒用（死資料）；`reaction` 只支援 `trigger.event:"enemyLeavesAdjacent"` 且 tags 含 `melee`。
- target.kind：`self`／`unit`／`ball`（radius，以目標格為心）／`line`／`cone`；`friendly`：`no`／`yes`／`only`。`self` 能力的 `effects.on:"self"` 會掛到機體（scope mech）或駕駛員（scope person）。
- NumExpr ref 只支援：`self|target` 的 `.attrs.<attr>`、`.pools.<id>.cur|max|regen`、`.grade`（D=0…S=4…SSS=6）、`.resonance`；`battle.round`、`battle.light`、`battle.tide`。
- 屬性只有六個：`accuracy evasion resolve initiative perception control`（機體 baseAttrs 與駕駛員屬性**相加**）。contribs 的 path：`self.attrs.<attr>` 或 `self.pools.<id>.max|regen`。
- HookName：`onApply onExpire onHit onBeingHit onTurnStart onTurnEnd onPartBroken onLayerBroken onMove`；動詞只有 `damage`(target self/source/adjacent/seats) `pool` `apply`(self/source/seats/cell) `remove`(tags) `moraleCheck` `spawn` `emit`。**不要用 `setControl`**（無法自動復原）。
- 池：沒有該池＝付不起。反向池（`inverted:true`）成本是往上加、超過 max 就不能付（soft＋`allowOverload` 例外）。池的 `bands`（`from`／`to`／`effects`）是被動效果的唯一正途——要「被動」就用池帶。
- 傷害型：`kinetic acid energy thermal pierce`；層型用既有登記（古代系層：`resonant-shell`→`flesh`→`organ`，見刑天）。**古代能力不得帶 `conventional-arms` 標籤**（那是十分律）。
- 古代神異能力 `require` 寫 `{"cmp":{"a":{"ref":"self.resonance"},"op":">=","b":<threshold>}}`；每台留至少一個**無共鳴要求的基本攻擊**，讓未認主者也能動。共鳴＝(駕駛員信念命中數＋resonanceAffinity)/(信念數＋deeds 數)。
- 每個能力 `ai.tactics` 必填，用 `attack attackArea disable heal buff debuff escape protect capture scout`。
- 量級（對照刑天）：S 級古代機總層 HP 550–750；baseAttrs 各 4–10；基本攻擊約 4 AP、24–34 傷；招牌爆發單體 ≤ 48、範圍 ≤ 26／目標；buff 2–3 回合、屬性 +5～+20。AP 每回合 9。

## 二、信念標籤字典（人物線與機體線共用，英文 kebab）

既有：`never-retreat bring-them-home revenge protect-kin survive`。新增：`break-chains judge-the-dead reborn defy-the-father wild-storm outwit-fate seek-truth atonement devotion keep-oaths hunger-for-glory bear-the-weight keep-watch`。

## 三、12 台古代機甲（刑天已存在，不重做）

檔名 `frames/ancient-<代號>.json`；能力 `abilities/ax-<代號>-<招>.json`；效果 `effects/ax-<代號>-<名>.json`；池 id `ax-<名>`。每台 `cls:"ancient"`、`grade:"S"`、`repairPolicy:"repair-only"`、tags 含 `ancient`（飛行的再加 `flight`）。resonance 一律 `threshold:0.5`、兩個信念＋一個 deed。

| # | 代號 | 稱號（文化） | bodyplan | 池 | 信念／deed | 能力構想（2–3 個，名字可自取） | 保有勢力 → 摹機藍本 | 工人 |
|---|---|---|---|---|---|---|---|---|
| 1 | chainbreaker | 芬里爾（北歐） | ancient-hound（新，四足） | `ax-wrath` 怒，0..100，regen +10，60 以上帶加命中 | break-chains, revenge／slipped-the-leash | 噬日之顎（近戰，產怒）；斷鏈（耗怒 60，自身狂化 2 回合）；嗥月（ball 降敵 resolve＋士氣檢定） | 潮信會奉為聖物無人能認 → 鐵砧獵團偷拓的四足突擊「斷索」系列 | A |
| 2 | psychopomp | 阿努比斯（埃及） | ancient-warden（沿用） | `ax-ka` 卡，initial 3、不回復（吃屍體的有限資源） | judge-the-dead, bring-them-home／buried-the-fallen | 秤心（標記：每回合 energy 小傷＋命中降）；喚屍（耗 ka 1，spawn `species/mite` D 於相鄰當肉盾，usesPerBattle 3）；冥途步（閃避大增 1 回合） | 殼學會保有 → 殼學會搜救回收機「引路」系列 | A |
| 3 | lotus | 哪吒（中國） | ancient-slender（新，輕型人形高閃避低 HP） | **無池**，全靠 cooldown | reborn, defy-the-father／cut-the-flesh | 乾坤圈（中距 kinetic）；混天綾（line，降 initiative/evasion）；蓮花化身（usesPerBattle 1，大幅 evasion＋resolve 3 回合） | 殘聯重慶城邦 → 高機動「風火」系列 | A |
| 4 | stormblade | 須佐之男（日本） | ancient-warden | `ax-storm` 嵐，0..60，regen +15 | wild-storm, protect-kin／slew-the-serpent | 天叢雲（cone pierce）；八岐斬（耗嵐 45，近身 ball 重擊，cooldown 3）；荒神（sustained，鎖嵐上限、每回合 drain，加命中加先攻） | 殘聯大阪城邦 → 近戰斬艦「叢雲」系列 | A |
| 5 | brinemother | 提亞瑪特（美索不達米亞） | ancient-serpent（新，蛇身：頭／前環／後環／尾） | `ax-brine` 鹹水，initial 100，regen 0（原初之海用一點少一點） | protect-kin, revenge／mourned-apsu | 鹹潮（cone acid）；生十一怪（耗鹹水 30，spawn `species/tidewolf` D 相鄰，usesPerBattle 2）；混沌之淵（ball 降敵 perception/accuracy） | 孟加拉灣第七哨（沉在海底遺跡，睡著）→ 兩棲噴酸「鹹潮」系列 | A |
| 6 | sunsnarer | 毛伊（玻里尼西亞） | ancient-slender | `ax-trick` 詭計，0..3，regen +1 | outwit-fate, survive／snared-the-sun | 祖母顎骨（近戰 pierce）；縛日（耗詭計 2，目標 initiative −8、evasion −10，2 回合）；變鷹（自身 evasion＋、escape） | 「背面」黑市拍賣中、沒人叫得醒 → 背面走私機「鉤日」系列 | A |
| 7 | plumed | 魁札爾科亞特爾（阿茲特克） | ancient-winged（新，有翼：翼為 locomotion） | `ax-sun` 太陽，0..100，regen `{"sum":[10,{"ref":"battle.light","mul":5}]}`，80 以上帶加 perception | seek-truth, atonement／returned-from-exile | 晨星之矢（長射程 energy）；羽風（ball friendly only，友軍 evasion＋）；第五太陽（耗太陽 80，大範圍 thermal） | 塞勒涅工業（月面遺跡帶）→ 塞勒涅飛行型錄「晨星」系列 | B |
| 8 | serpenteater | 迦樓羅（印度） | ancient-winged | `ax-amrita` 甘露，initial 30，regen 0 | devotion, break-chains／freed-the-mother | 金翅撲擊（傷害隨 `target.grade` 上升：專打大怪）；啖蛇（耗甘露，對目標 acid＋破甲）；甘露（耗甘露，自身 resolve/accuracy 長 buff） | 殘聯孟買城邦 → 反巨獸專用「金翅」系列 | B |
| 9 | thunderoak | 佩倫（斯拉夫） | ancient-colossus（新，六部位巨像、慢、HP 高） | **熱量** `heat`（12 台中唯一發熱的，帶沿用 `effect/overheat-1`／`overheat-2`）＋ `ax-thunder` 雷荷 0..3 regen +1 | never-retreat, keep-oaths／stood-under-the-oak | 雷斧（line energy，耗雷荷 1、產熱 30）；橡根（sustained，evasion −10、resolve/accuracy ＋，drain 少量）；天罰（耗雷荷 3，ball thermal，產熱大） | 鐵砧獵團 → 重砲「雷橡」系列（發熱的血統從這來） | B |
| 10 | riastrad | 庫丘林（凱爾特） | ancient-warden | **無機體池**：吃駕駛員 `fatigue` 與 `hp` | hunger-for-glory, keep-oaths／kept-a-geis | 迦耶伯格（pierce 高破甲＋crit，耗駕駛員 hp 5）；扭曲狂（sustained，drain 駕駛員 fatigue，命中先攻大增）；守淺灘（reaction：enemyLeavesAdjacent melee） | 鹽鷗獵團（認主者已死，殼睡、帶怨）→ 狂暴近戰「赤槍」系列 | B |
| 11 | skybearer | 阿特拉斯（希臘） | ancient-colossus | `ax-sky` 天穹之重，反向池 0..100 soft，越高越慢（帶：60+ initiative −3，100+ evasion −15） | bear-the-weight, atonement／held-up-the-sky | 擎天（unit friendly only，給友軍大 evasion buff，產天穹 25）；地動（ball 近身 kinetic）；卸重（self，耗…→ 實作為減天穹：用 effect onApply pool delta 負值） | 塞勒涅工業（靜海市地底承重核）→ 白手套盾衛「擎天」系列 | B |
| 12 | watchhorn | 海姆達爾（北歐） | ancient-warden | `ax-vigil` 守望，0..5，regen +1 | keep-watch, bring-them-home／sounded-the-horn | 加拉爾號角（usesPerBattle 1，ball friendly only 大範圍 initiative/accuracy buff）；千里眼（長射程 scout 標記，降 evasion）；虹橋守（sustained，drain 守望，自身 perception/evasion＋） | 殘聯總部 → 偵察指揮「號角」系列 | B |

新 bodyplan 檔名 `bodyplans/ancient-<形>.json`：A 做 `ancient-hound`、`ancient-slender`、`ancient-serpent`；B 做 `ancient-winged`、`ancient-colossus`。每個都要有 `core`＋`cockpit`（座位 `pilot`）的部位（可同一部位）與 `locomotion` 部位。

## 四、人物線（工人 C）

- **persons 30 件**（檔名自然命名、kebab，例 `persons/sigrun-hallvard.json`；新建前 `ls` 確認不存在）。名字多元文化（北歐、孟加拉、約魯巴、蒙古、日本、墨西哥、愛爾蘭、波蘭、波斯、毛利、泰米爾、阿拉伯、中國……）。
  - 古代機駕駛候選 12 人：上表 1–12 每台一人，`will.beliefs` 含該台兩個信念（或一個＋`resonanceAffinity` 該信念外的另一信念 0.5），tags 加 `ancient-candidate`。
  - 其他駕駛員 6 人（各勢力：殘聯、塞勒涅退役、潮信會叛教者、第七哨難民孩子、競爭獵團、殼學會學生）。
  - 技師 5 人（tags 含 `technician`）、科研員 3 人（tags 含 `researcher`）——仍是 `kind:"human"`、有 hp 池。
  - 機魂 4 人（`kind:"soul"`，池 `ap`／`fatigue`／`calc`，growth 指向下述新樹之一，各一棵；性格寫成 traits）。
- **獸緣／殼緣**（spec 只有詞、尚無欄位，本線暫定）：殼緣＝`will.resonanceAffinity`（0.1–0.5）＋高者 tag `shell-touched`；獸緣＝`will.burdenLimit` 寫 `{"ref":"self.attrs.resolve","add":N}`（N −10…+25）＋高者 tag `beast-kin`。
- **人物 effects 24 件**（前綴 `ax-`，scope person）：特質 `ax-trait-*` 約 14（含古代前任遺留的如「一萬年的孤獨」、機魂性格如「怕水」「記仇」）、背景 `ax-bg-*` 約 4、傷勢 `ax-injury-*` 約 6（暫時 `clock days`＋`tags:["injury:temporary"]`；永久 `permanent`＋`injury:permanent`）。特質盡量有 contribs（有利有弊），純敘事的可空 contribs。
- **soultrees 4 棵**（`soultrees/ax-<方向>.json`，各 4 節點，其中至少一棵含 `research` 鍵 `autonomy` 的節點＝可獨駕）＋ **perk effects 12 件** `effects/ax-perk-<樹>-<n>.json`（每棵 3 件新 perk，第 4 節點沿用既有 `effect/perk-soul-*`）。方向：`ax-sentinel`（守護／協作，heart）、`ax-hunter`（算／彈道預判）、`ax-solo`（autonomy 獨駕）、`ax-feral`（野魂，contested 爭奪向，含 autonomy）。

## 五、件數

A：frames 6＋bodyplans 3＋abilities ≤ 17＋effects ≤ 11 ≈ 37；B：frames 6＋bodyplans 2＋abilities ≤ 17＋effects ≤ 11 ≈ 36；C：persons 30＋effects 24＋perks 12＋soultrees 4 = 70。總 ≤ 143，本線 gate 140：A、B 各以 abilities 16、effects 10 為上限。
