# lead-content-monster 設計表（四個工人共用；領導 2026-10-24 定）

本檔是四條工人線 `cx-mon-insect`／`cx-mon-beast`／`cx-mon-alien`／`cx-mon-mycel` 的共同設計契約。**你只做你那一族的段落**；共通規則每條都適用。id、等級、HP 總量、能力數值是寫死的；名字（中文）、二名、部位命名細節、風味 tags、效果的具體 contribs 數值在給定範圍內由你發揮（使用者：「未裁示的都隨意，想看 AI 的創造力」——要大膽、有梗、與世界觀一致）。

## 〇、風格（頂層 2026-10-24 新裁示，優先於下表的中文暫名）

使用者要**太空歌劇、不要硬科幻**（「不要電磁學那套，想想 Warframe 那樣」「不要太過現實」；原文 `wf/workflows/planning/design-notes/world.md` 末段）。所以：
- 怪獸的**中文名、能力名、效果名、bodyplan／部位名、二名**往**神秘、異界、半有機、華麗**寫：裂獸是「裏側」來的東西，殼像礦也像聖物，核是一顆裂晶、會發光會唱。少用生物學／物理學術語（不寫「外骨骼、胸節、腹節、酸液、動能、甲殼素、電磁、口徑」這類詞當名字；「胸節」可以叫「晶冠」「心龕」之類）。
- 下表的中文名（翅鞘蜂、攻城甲…）只是**暫名**，你可以換成更有異界感的名字；**spec 已指名的照用**：蝕蟲、鐮肢、巢母、潮狼、掘犬、盾甲、崖牙（赤眼兇星）、浮囊、吐棘者、鏡肢、孢囊、菌柱、菌床（白夜）。
- id（英文 kebab）、數值、傷害型（`acid` 等是程式詞，不用改）照表寫死，不因風格改。
- 用語以 `content/lore/README.md` 的「風格與用語」節或 `content/lore/style.md` 為準（`plan-lore` 線即將 commit）：**開工前與收尾前各跑一次 `git -C /home/lorkhan/repo/game_dev/mecha-srpg log --oneline -- content/lore`**，有了就讀它照改你寫的名字。

## 一、引擎事實（領導已讀過原始碼，照做，不要再去改 src）

1. **怪獸的血量只來自 species 的 bodyPlan**（`src/rules/state.ts` 的 `frameView`）；`grade` 只換 `baseAttrsByGrade`。`MonsterDef` 的 `attrMods`／`extraAbilities`／`partsOverride` **戰鬥裡沒有實作**——monster 檔只寫 `id, species, grade, name?, epithet?, tags`，不要寫那三個欄位。
2. **死亡**＝所有 `functions` 含 `"core"` 的部位都 broken；**沒有 core 部位的單位永遠不死**——每個 bodyplan 至少一個 core 部位。多個 core 部位＝要全打爆才死（菌床、群喉就靠這個）。
3. **部位 broken**＝該部位的 `structural:true` 層被打穿。每部位最後一層設 `structural:true`，外層 `false`。
4. **捕捉條件**（`src/rules/flow.ts canCapture`）：`requireIntact` 列的每個 function，該 function 的部位全部完好；`requireBroken` 列的每個 function，該 function 的部位全部 broken；**列了的 function 在 bodyplan 裡必須存在**，否則永遠不成立。**不可捕捉**的族寫 `"requireIntact":["core"],"requireBroken":["core"]`（互斥，永遠不成立）。
5. **每個 species 的 `capture.frame` 必須指向一個專屬、不與他族共用的 `frame/bio-*`**（ops 用 `capture.frame` 反查 species；共用會串錯）；且該 frame 的 `grade` 必須等於該 species 某個 monster 的 grade（ops 出戰時用 species＋frame.grade 找 monster，找不到會拋錯）。
6. 層的 `resist`（0–1，`{"kinetic":0.3}`＝該型減 30%，負值無效）、`passThrough`、`reduce{flat,pct}`（`ablative:false` 才用）、`regen`（數字，每回合回血）都有實作。傷害型只有 `kinetic`／`acid`／`energy`／`thermal`／`pierce`；層種類只有 `shield, armor, chitin, flesh, organ, cockpit-shell, component, structure, resonant-shell`；部位 function 只有 `core, cockpit, manipulator, sensor, locomotion, weaponMount, spawner`；槽型只有 `weaponMount, restraint, cockpit, soulCore, armorMount, sensorMount`。**不新增任何 registry 值**。
7. 能力 `target.kind` 只用 `unit`／`self`／`ball`（AI 只會用這三種＋cell；不要用 line／cone）。`ball` 以目標格為中心、`radius` 內所有合法單位都吃，`friendly:"no"` 只打敵、`"only"` 只給友（含自己以外的同陣營）。AI tactics 只用 `attack, attackArea, disable, heal, buff, debuff, escape, protect, capture, scout`；`attack` 給單體、`attackArea` 給 ball 傷害、`buff`／`protect` 給自身或友方增益、`debuff` 給純減益。
8. 怪獸能力照既有範本：`"costs":[]`、`"produces":[]`、`"require":[]`，強招用 `cooldown`（2–4）。
9. 效果 hooks 動詞只有 `damage`（target `self|source|adjacent|seats`）、`pool`（owner `mech|person`，例 `{"do":"pool","owner":"mech","pool":"instinct","delta":10}`）、`apply`、`remove`（依 tags）、`spawn`（`{"do":"spawn","species":"species/mite","grade":"D","at":"adjacent"}`）、`moraleCheck`、`emit`、`setControl`。鉤子名用 `onApply／onTick／onExpire／onTurnStart／onTurnEnd／onHit／onBeingHit／onPartBroken`。**沒有治療動詞**（回血只能靠層的 `regen`）。contribs `path` 只用 `self.attrs.{accuracy,evasion,initiative,perception,resolve,control}` 或 `self.pools.{池}.max|regen`，`source` 填該效果自己的 id。
10. **十分律**：`rules/damage-modifiers.json` 有一列 `conventional-arms × kaiju → 0.1`。所以每個 species 的 `tags` 都要有 `"kaiju"`＋族名 tag；bio frame 的 tags 是 `["bio","<族>","kaiju"]`（照既有 `bio-reaper`）。怪獸能力**不要**帶 `conventional-arms` tag。
11. 意圖可見：每族 `behaviors.telegraph:true`（異形也 true，「只顯示一半」是 UI 的事）。spawner／molt 行為照下表寫，`molt.when` 用 `{"tag":"molt-ready"}`，`duringMoltEffects` 指向本族的效果。`territorial` 不要寫（要地形 id，地形線還沒交）。

## 二、共通格式

- **family 字串**（ops 用它找 `world/beasts/<family>`，拼錯營運層會炸）：`insect`、`beast`、`alien`、`mycelium`。
- **pools**：每個 species 與 bio frame 都抄 `content/base/species/mite.json` 的 `instinct`＋`ap` 兩池（bio frame 只要 `instinct`，照 `frames/bio-reaper.json`）。
- **baseAttrsByGrade** 量級：D `{initiative:8, perception:4~6, accuracy:50, evasion:5}`；C `{9, 6, 55, 8}`；B `{10, 7, 60, 10}`；A `{6~8, 8, 65, 12}`（坐地型 A 可低到 3）；S `{8, 9, 70, 12}`。同族內可 ±2 做個性，但不要超出下一級。
- **bodyplan**：照既有 `bodyplans/insect-reaper.json` 的完整欄位寫法（`exposure, layers[{type,hp,ablative,resist,passThrough,structural}], slots, functions, onLayerBroken, onBroken, conduct`）。可捕捉族的 core 部位要有 `structural:true` 的 `organ` 層，並帶 `slots:[{"id":"restraint","type":"restraint","size":2},{"id":"cockpit","type":"cockpit","size":1}]` 與 `seats:[{"id":"pilot","accepts":["pilot"]}]`、functions 含 `"core","cockpit"`。**HP 總量**（所有部位所有層相加）照各族表，±10%。`exposure` 控制被打中機率（大部位 2、小部位 1、藏起來的核 0.5）。
- **bio frame**：照 `frames/bio-reaper.json`：`cls:"bio"`、`grade`、`bodyPlan`（同 species）、`baseAttrs`（取該 grade 的 initiative／perception）、`pools`（instinct）、`innateAbilities`（＝species abilities）、`repairPolicy:"repair-or-replace"`、`burden`（D 2、C 5–6、B 8–9、A 12–13、S 16）。`name` 用登記號式：`"生物機甲・<族中文名>"`（照既有）。
- **monster**：`{"id","species","grade","tags":[] }`；A 級以上**必有** `name`（物種俗名或人取的叫法）與 `epithet`（二名，中二、四字為主，例「赤眼兇星」「千囊房東」）；B 以下不寫 epithet、不寫 name。A 以上 tags 加 `"named"`。
- **檔名**：能力與效果一律 `abilities/kx-*.json`、`effects/kx-*.json`（id `ability/kx-…`、`effect/kx-…`），只用下面分給你那族的 id。新建前 `ls` 確認不存在。
- **ability 範本**：`content/base/abilities/{reaper-cleave,root-drag,nest-birth,arc-pulse}.json`；**effect 範本**：`content/base/effects/{rooted,acid-corrode,nest-birth,shard-marked}.json`。每個效果都要 `ui.badge`（中文 2–4 字）。
- 傷害量級（每次命中）：D 5–9、C 12–20、B 18–26、A 24–34、S 30–40；ball 範圍招打 6–7 成。

## 三、各族

### 蟲族 insect（cx-mon-insect）—— 殼釘節鎖、多節多足、繫、意圖最老實

既有不動：`species/{mite,reaper,nestmother}`、`monsters/{mite-d,reaper-c,nestmother-landlord}`。

| 新增 | 內容 |
|---|---|
| `species/lancewing` 翅鞘蜂 | gradeRange `["C","B"]`；飛行刺擊者，酸針；aiProfile `aiprofile/reaper-vanguard`；abilities `kx-acid-sting`、`kx-wing-dive`、`kx-brood-call`；bodyplan `insect-lancewing` HP≈420：胸節（core，chitin／flesh／organ）、頭（sensor）、雙翅鞘（兩部位，**都**是 locomotion，chitin 薄、exposure 2）、尾針（weaponMount）、腹節。capture `requireIntact:["core"]`、`requireBroken:["locomotion"]`、`ability/restrain`、`frame/bio-lancewing`（C，burden 6） |
| `species/siegebeetle` 攻城甲 | gradeRange `["B","A"]`；重甲撞城蟲，多足（6 足分三部位 locomotion）；aiProfile `aiprofile/reaper-vanguard`；abilities `kx-horn-ram`、`kx-carapace-brace`、`kx-tremor-stamp`；bodyplan `insect-siegebeetle` HP≈1400：前胸甲殼 chitin 厚且 `resist:{"kinetic":0.3,"pierce":0.2}`、角（manipulator）、核在腹下（exposure 0.5）、三對足。capture 同上＋`frame/bio-siegebeetle`（B，burden 9） |
| 能力（6） | `kx-acid-sting`（unit 1–3，acid 14，on hit `effect/kx-acid-drench`）；`kx-wing-dive`（unit 1–4，pierce 18，cd 2）；`kx-horn-ram`（unit 1–2，kinetic 26，cd 2，on hit `effect/kx-shell-cracked`）；`kx-carapace-brace`（self，apply `effect/kx-carapace-braced`，cd 3，tactics protect）；`kx-tremor-stamp`（ball range 1–1 radius 1，kinetic 15，cd 3，attackArea）；`kx-brood-call`（ball 友方 radius 3，apply `effect/kx-hive-pheromone`，cd 3，buff——掛在 lancewing 上：「翅鞘蜂是巢的傳令」） |
| 效果（4） | `kx-acid-drench`（mech，2 回合 onTick acid 4，tags acid）；`kx-shell-cracked`（mech，2 回合 evasion −8，debuff）；`kx-carapace-braced`（mech，1 回合 evasion +18、initiative −3）；`kx-hive-pheromone`（mech，2 回合 accuracy +8、initiative +2，buff） |
| monsters（5） | `lancewing-c`、`lancewing-b`、`siegebeetle-b`、`siegebeetle-a`（name＋epithet）、`nestmother-<你取名>`（第二隻 A 巢母，name＋epithet，species/nestmother） |

### 獸族 beast（cx-mon-beast）—— 軛與鞍、四足脊椎、遊獵、會蛻皮

既有不動：`species/tidewolf`（D／C／B，用 `bodyplan/quadruped-beast`）。

| 新增 | 內容 |
|---|---|
| `species/hound` 掘犬 | gradeRange `["C"]`；前肢鏟、脊背骨板；aiProfile `aiprofile/pack-hunter`；abilities `kx-shovel-ram`、`kx-burrow-flank`、`kx-carrion-gulp`；behaviors `molt:{to:"species/bulwark",when:{"tag":"molt-ready"},duringMoltEffects:["effect/kx-molting"]}`；bodyplan `quadruped-hound` HP≈420：胸腔核（core）、頭、脊板（chitin）、前肢鏟兩部位（chitin＋flesh，manipulator＋locomotion）、後肢（locomotion）。frame `bio-hound`（C，5） |
| `species/bulwark` 盾甲 | gradeRange `["B"]`；蛻皮後的掘犬，前盾兩層；aiProfile `aiprofile/kx-beast-alpha`；abilities `kx-shield-raise`、`kx-wall-charge`、`ability/bite`（既有可共用）；bodyplan `quadruped-bulwark` HP≈950：前盾部位兩層 chitin `resist:{"kinetic":0.25,"pierce":0.25}` exposure 3（擋在前面最常被打）、整面背甲、軀幹核（exposure 0.5）、後肢。frame `bio-bulwark`（B，8） |
| `species/cliffjaw` 崖牙 | gradeRange `["A"]`；獸族潮錨，背馱舊蛻，下顎像崖；aiProfile `aiprofile/kx-beast-alpha`；abilities `kx-cliff-bite`、`kx-star-howl`、`kx-ground-stomp`；bodyplan `quadruped-cliffjaw` HP≈1900：舊蛻背甲（chitin 厚）、顎甲（chitin，resist pierce 0.2；顎是 manipulator）、顎後核、頸、四肢分前後兩部位。capture `requireIntact:["core"]`、`requireBroken:["locomotion","manipulator"]`（＝打破顎），frame `bio-cliffjaw`（A，12） |
| `species/tidespine` 潮脊 | gradeRange `["S"]`；**S 領主**，孟加拉灣的那隻：脊背像一道潮牆的巨獸，一個大型蝕域一隻；aiProfile `aiprofile/kx-beast-alpha`；abilities `kx-tide-crush`、`kx-spine-sweep`、`kx-star-howl`；bodyplan `quadruped-tidespine` HP≈4000：脊潮甲（多層 chitin，resist kinetic 0.3）、核（exposure 0.5，organ 厚）、頭顎、四肢兩部位、尾。capture `requireIntact:["core"]`、`requireBroken:["locomotion","manipulator","sensor"]`（劇情級難度），frame `bio-tidespine`（S，16） |
| 能力（9） | `kx-shovel-ram`（unit 1，kinetic 16，on hit `kx-staggered`）；`kx-burrow-flank`（unit 1–4，pierce 14，cd 3，「刨地鑽入繞後」）；`kx-carrion-gulp`（self，apply `kx-gorged`，cd 4，buff——吞屍保活性）；`kx-shield-raise`（self，apply `kx-shield-wall`，cd 2，protect）；`kx-wall-charge`（unit 1–3，kinetic 22，cd 2）；`kx-cliff-bite`（unit 1，pierce 32，on hit `kx-deep-wound`）；`kx-star-howl`（ball 友方 radius 4，range 0–0，apply `kx-pack-frenzy`，cd 3，buff——「仰頭＝獸族全衝鋒」）；`kx-ground-stomp`（ball range 1–1 radius 1，kinetic 20，cd 2，attackArea）；`kx-tide-crush`（ball range 1–4 radius 2，kinetic 28，cd 3，attackArea，on hit `kx-tidal-dread`）；`kx-spine-sweep`（unit 1–2，kinetic 38） |
| 效果（7） | `kx-staggered`（1 回合 initiative −3、evasion −5）；`kx-gorged`（3 回合 accuracy +6、instinct regen −3）；`kx-molting`（permanent，tags molt；evasion −10、initiative −4，蛻皮期不動不吃的味道）；`kx-shield-wall`（1 回合 evasion +22）；`kx-deep-wound`（3 回合 onTick kinetic 4，layerFilter flesh）；`kx-pack-frenzy`（2 回合 accuracy +10、initiative +3）；`kx-tidal-dread`（mech，onApply `moraleCheck` dc 40＋1 回合 accuracy −10） |
| monsters（8） | `tidewolf-d`、`tidewolf-c`、`tidewolf-b`、`hound-c`、`bulwark-b`、`cliffjaw-red-eye`（A，name「崖牙」、epithet「赤眼兇星」——spec 指名）、`cliffjaw-<你取名>`（第二隻 A）、`tidespine-chittagong`（S，name「吉大港的那隻」，epithet 你取） |

### 異形 alien（cx-mon-alien）—— 量身懸囊、不對稱、每隻不同、變異

| 新增 | 內容 |
|---|---|
| `species/sac` 浮囊 | gradeRange `["D"]`；漂浮半透明囊、觸鬚；aiProfile `aiprofile/kx-alien-stalker`；abilities `kx-tendril-lash`、`kx-glare-pulse`；bodyplan `alien-sac` HP≈110：囊（core，flesh＋organ，exposure 2）、三條觸鬚（三部位，flesh，各 locomotion——「靠觸鬚划空氣」）。frame `bio-sac`（D，2） |
| `species/spitter` 吐棘者 | gradeRange `["C"]`；三腳囊體、背刺叢、永遠偏一邊；aiProfile `aiprofile/kx-alien-stalker`；abilities `kx-thorn-volley`、`kx-thorn-snipe`；bodyplan `alien-spitter` HP≈380：背刺叢（chitin，weaponMount，exposure 2）、囊底核、三足（各一部位 locomotion，**三條長短不同、HP 不同**）。capture `requireIntact:["core"]`、`requireBroken:["weaponMount"]`（先打空背刺），frame `bio-spitter`（C，6） |
| `species/mirror` 鏡肢 | gradeRange `["B","A"]`；人形輪廓的錯誤版本，一側鏡甲一側裸肉；aiProfile `aiprofile/kx-alien-stalker`；abilities `kx-mirror-turn`、`kx-bare-rend`；bodyplan `alien-mirror` HP≈950：鏡甲側（chitin，`resist:{"energy":0.6,"thermal":0.4}`，exposure 2，反光武器剋星）、裸肉側（flesh，`resist:{}`，manipulator）、核（organ，exposure 0.5）、雙肢。frame `bio-mirror`（B，9） |
| `species/choir` 群喉 | gradeRange `["A"]`；**異形潮錨**（新設）：一團不對稱的肉，表面開著五到七張喉嚨同時唱歌；aiProfile `aiprofile/nest-anchor`；abilities `kx-dissonant-hymn`、`kx-mutation-surge`、`kx-throat-swallow`；bodyplan `alien-choir` HP≈1800：**五個喉部位都是 core**（各 flesh＋organ），全啞才死；外膜（chitin）、基座（locomotion）。capture `requireIntact:["core"]`、`requireBroken:["locomotion"]`，frame `bio-choir`（A，13） |
| 能力（9） | `kx-tendril-lash`（unit 1–2，kinetic 7）；`kx-glare-pulse`（unit 1–6，無傷害，on hit `kx-glare-marked`，scout＋debuff）；`kx-thorn-volley`（ball range 2–6 radius 1，pierce 12，cd 2，attackArea）；`kx-thorn-snipe`（unit 2–7，pierce 18）；`kx-mirror-turn`（self，apply `kx-mirrored`，cd 2，protect）；`kx-bare-rend`（unit 1，pierce 24，on hit `kx-flesh-rend`）；`kx-dissonant-hymn`（ball range 1–5 radius 2，energy 16，cd 2，on hit `kx-dissonance`，attackArea）；`kx-mutation-surge`（self，apply `kx-mutation`，cd 4，buff）；`kx-throat-swallow`（unit 1，kinetic 30） |
| 效果（5） | `kx-glare-marked`（2 回合 evasion −10、perception −2）；`kx-mirrored`（2 回合 evasion +16）；`kx-flesh-rend`（3 回合 onTick pierce 4 layerFilter flesh）；`kx-dissonance`（2 回合 accuracy −10、resolve −10）；`kx-mutation`（3 回合，正負並存：accuracy +12、evasion −10、initiative +3，tags mutate） |
| monsters（6） | `sac-d`、`spitter-c`、`mirror-b`、`mirror-a`（name＋epithet）、`choir-a`（name＋epithet）、`choir-<你取名>`（第二隻 A） |

### 菌絲 mycelium（cx-mon-mycel）—— 不是個體是地形、沒有核、燒才有用、修剪維持

菌絲**沒有 organ 核**：core 部位用 flesh／chitin 當最後一層（structural）。全族的 flesh／chitin 層 `resist:{"kinetic":0.5,"pierce":0.5,"acid":0.8}`、thermal 不減（燒才有用），可捕捉的兩族 core 部位仍要 restraint／cockpit 槽與 pilot 座。可捕捉族的皮層加 `regen`（每回合 3–8）。

| 新增 | 內容 |
|---|---|
| `species/pod` 孢囊 | gradeRange `["D"]`；膝蓋高的囊，不動（**沒有 locomotion 部位**）；aiProfile `aiprofile/kx-mycel-creep`；abilities `kx-spore-burst`；bodyplan `mycel-pod` HP≈70：囊（core，囊皮 chitin＋孢肉 flesh）。**不可捕捉**（互斥條件），frame `bio-pod`（D，2，tags 加 `"harvest-only"`；它是營運層「採」的佔位機體，戰鬥裡捕不到） |
| `species/stalk` 菌柱 | gradeRange `["C","B"]`；三公尺柱、會拔根走一格；aiProfile `aiprofile/kx-mycel-creep`；abilities `kx-root-snare`、`kx-spore-fog`；bodyplan `mycel-stalk` HP≈450：皮層＋柱體（core）、根（locomotion）、孢冠（sensor）。frame `bio-stalk`（C，5） |
| `species/rotwarden` 腐衛 | gradeRange `["B","A"]`；**新設**：菌絲裹住一具舊機甲殘骸站起來行走的「騎士」——外層是生鏽的機甲裝甲（layer type `armor`，無 resist），裡面是菌肉；aiProfile `aiprofile/kx-mycel-creep`；abilities `kx-rot-blade`、`kx-spore-shroud`；bodyplan `mycel-rotwarden` HP≈1000：殘甲軀幹（armor＋flesh，core）、殘臂（armor＋flesh，manipulator）、菌化雙腿（locomotion）、殘頭（sensor）。frame `bio-rotwarden`（B，9） |
| `species/bed` 菌床 | gradeRange `["A"]`；菌絲潮錨：整片地面，看得見的只有幾個「結」；aiProfile `aiprofile/kx-mycel-creep`；abilities `kx-knot-flare`、`kx-pod-bloom`；bodyplan `mycel-bed` HP≈1800：**五個結部位都是 core**（結皮 chitin＋flesh），沒有 locomotion（不動）；結全毀即死。**不可捕捉**，frame `bio-bed`（A，12，tags `"harvest-only"`） |
| 能力（7） | `kx-spore-burst`（ball range 0–1 radius 1，acid 8，on hit `effect/rooted`（既有），cd 2，attackArea）；`kx-root-snare`（unit 1–2，kinetic 8，on hit `effect/rooted`）；`kx-spore-fog`（ball range 1–4 radius 1，acid 10，on hit `kx-sporeload`，cd 2，attackArea）；`kx-rot-blade`（unit 1，pierce 24，on hit `kx-sporeload`）；`kx-spore-shroud`（self，apply `kx-spore-veil`，cd 3，protect）；`kx-knot-flare`（ball range 0–6 radius 2，acid 16，on hit `kx-sporeload`，cd 2，attackArea）；`kx-pod-bloom`（self，apply `kx-pod-bloom`，cd 3，buff，tags spawn——菌床長孢囊） |
| 效果（4） | `kx-sporeload`（mech，3 回合 onTick acid 3＋perception −2，tags spore；「孢子在你的關節裡長」）；`kx-spore-veil`（2 回合 evasion +15）；`kx-pod-bloom`（照 `effects/nest-birth.json`：onApply `spawn species/pod D adjacent`）；`kx-overgrowth`（permanent，tags mycelium,trait：perception −1、resolve −3——共生層往駕駛艙長的徵兆；**目前只建檔不掛載**，REPORT 註明給營運線用） |
| monsters（7） | `pod-d`、`stalk-c`、`stalk-b`、`rotwarden-b`、`rotwarden-a`（name＋epithet）、`bed-white-night`（A，name「菌床」、epithet「白夜」——spec 指名）、`bed-<你取名>`（第二隻 A） |

## 四、aiprofile（各族工人只建自己那份，`policy`／`params` 照 `aiprofiles/*.json` 範本）

- `aiprofile/kx-beast-alpha`（beast 工人）：`policy:"tactical"`，`params {attack:1, buff:0.8, protect:0.6}`。
- `aiprofile/kx-alien-stalker`（alien 工人）：`policy:"tactical"`，`params {attack:1, disable:1, debuff:0.8}`。
- `aiprofile/kx-mycel-creep`（mycel 工人）：`policy:"sentinel"`，`params {attack:0.8, debuff:1, buff:1, protect:0.6}`。

## 五、煙霧測試（每族都做）

範本 runner：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/kx-smoke/run.ts`（**只讀，複製**到你的 `/tmp/<線名>/run.ts`，並在 `/tmp/<線名>/pack/` 建 `pack.json`＝`{"id":"kxsmoke","version":"0.0.1","depends":["base"]}` 與 `scenarios/*.json`）。在 repo 根跑 `node /tmp/<線名>/run.ts scenario/<名> 1 2 3`。情境範本 `content/base/scenarios/rift-edge-nest.json`（map 用 `map/rift-edge-60`，玩家方抄它的四台機與駕駛員；`base:` 前綴在 scratch pack 裡要寫全，例 `"map":"base:map/rift-edge-60"`、`"monster":"base:monster/hound-c"`、`"faction":"base:faction/rift-insects"`）。至少兩場：
1. **野怪場**：敵方放你族每個新 monster 至少一隻，玩家方用 rift-edge-nest 的陣容。
2. **生物機甲場**：玩家方把你族每台新 `bio-*`（`harvest-only` 的除外）各放一台、駕駛員 `base:person/chen-xiaohai` 座 `pilot`，敵方放幾隻 `base:monster/reaper-c`。
3 個 seed 都不得 THROW；能力表裡你族新能力至少 2/3 出現過。
