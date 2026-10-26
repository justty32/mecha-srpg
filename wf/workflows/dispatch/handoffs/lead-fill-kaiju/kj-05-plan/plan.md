# 1. 已讀清單

本線 `cx-kj-05p`，2026-10-26；以下路徑相對 `/home/lorkhan/repo/game_dev/mecha-srpg`，均由本線親讀。此為 kj-05 計畫段，只交本計畫與 [review-draft.json](review-draft.json)，不產出 base 資料。

入口與內容規矩：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/polish.md`（含「首要標準」）。

風格與世界：`content/lore/style.md`、`wf/workflows/planning/specs/world/monsters.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（含「海洋與潮汐」及底色 1.1–1.13）、`wf/workflows/planning/design-notes/world/great-tide.md`、`content/lore/factions/rift-beasts.json`、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-02/REPORT.md`。

補讀：`wf/WORKFLOWS.md`、`wf/SESSION-LOG.md`、`wf/WAIT_USER.md`、`wf/workflows/common/data-files.md`、`wf/workflows/inbox/README.md`、本線交接書 `wf/workflows/dispatch/handoffs/lead-fill-kaiju/cx-kj-05p.md`；world-pillars 的 world、bio-battle 導航與其 world/monsters、bio-battle/bio 子檔；`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`。

資料查讀：依 `tabledb.py grep` 查 `wf/workflows/content/` 下的 `templates.json`、`numeric-bands.json`、`ability-forms.json`、`engine-facts.json`，以及 kj-02 的 `naming.json`；親讀第 6 段所列範本、`species/cliffjaw.json`、`species/tidespine.json`、`bodyplans/insect-mite.json`、`bodyplans/quadruped-beast.json`、`frames/bio-mite.json`、`frames/bio-cliffjaw.json`、`frames/corpse-cliffjaw.json`、`monsters/cliffjaw-red-eye.json`、`abilities/pounce.json`、`aiprofiles/pack-hunter.json`、`world/rifts/beast.json`，以及 layer-types／damage-types／part-functions／slot-types／locomotion／tactics 六份 registries（本段簡寫路徑皆在 `content/base/`）。

kj-02 的 REPORT 仍使用舊名「攀堤者／纏足」；命名表已改「抱樁」。本次依交接書所載 agy 結論避開「～者」直譯及「纏足」聯想，不把舊報告誤當最終命名，也未另啟外部審查。

# 2. 設計理念

礁背（提案）是從近岸裂縫上來的 D 級獸族，低伏在環太平洋舊港的碎堤與卸貨坡道間，啃開殘留構造、吞食物質，讓每天有人通行的岸線一直需要清理。崩年前貨物在岸邊換手，崩年斷鏈、城往內陸退後，回收隊與護送海邊精粹的獵團仍得穿過這些缺口，最常先撞見牠隆起的背板。潮狼用撕咬與撲擊威脅一個目標，礁背則先壓低寬顎，再側翻背板碾過近處一片，玩家可用分散站位降低同時受擊的人數。牠是常見的先鋒與消耗，不承擔某場失城的全部罪名，也沒有具名敵首或可交流的心思。

# 3. 族別選擇與理由

蟲族的優點是可補蝕蟲以外的子體輪廓，缺點是本批不改巢母時，新的產出關係容易只留在敘述。

獸族的優點是能直接從海岸裂縫過來、用現成群獵 AI 表達近身範圍威脅，缺點是要明確區別潮狼，不能只換皮沿用撕咬與撲擊。

**選獸族 `beast`**：以兩個 D 帶新招與四部位骨架完成差異；不依賴新增母子關係或 AI 行為。這是獨立 D 種，不是潮脊、掘犬或盾甲的幼體。

# 4. 掛點表

| 設定段落／底色／主線 | 本種為何掛在這裡 |
|---|---|
| history-lines「海洋與潮汐」 | 常見於環太平洋近岸舊港，隨漲潮上岸，出沒頻度不由潮差推算。 |
| 底色 1.4「糧」 | 精粹在海邊、糧在內陸，護送與回收隊必須經過牠占住的卸貨口。 |
| 底色 1.5「空城」 | 遭遇可在被棄港區外緣，不能因此把每座空城都改成蝕域。 |
| F 線「築牆／守線」 | 蝕線即海岸線，清理通路有日常價值，無須新增歷史戰役或指定收復結果。 |
| monsters「等級觀／獸族」 | D 是從裂縫過來的先鋒，獸族不繫；體型與招式不暗示成長升級。 |
| great-tide「全球同一時刻」 | 大潮抬的是裂縫通行上限，既有 D 個體不當場升級；晝潮也能上岸。 |
| rift-beasts「獸族：遊獵」 | 寫可觀察的啃蝕、移動與威脅，人類替牠取種名，對面始終無臉。 |

# 5. 設計表

本段數字皆為同級暫填，不是平衡結論；全部新命名均為提案。下列是給產出工人的欄位方案，不是已建立的資料。

## 身分與命名

| 項目 | 方案 |
|---|---|
| 英文原名與意涵 | Breaksurf：浪間露出硬背、上岸碾過碎堤的低伏獸；先定可見輪廓與動作。 |
| 中文兩案 | 首選「礁背」（提案），以岸上人先看見的背形命名；備選「磨礁」（提案），取啃磨碎岸之動作，不逐字翻成破浪。 |
| 識別字 | `species/breaksurf`；檔名 `breaksurf.json`；英文 kebab 格式。 |
| 族與等級 | `family:"beast"`、`gradeRange:["D"]`。 |
| 外形 | 寬顎貼地，四條短粗肢撐起礁石般的骨板背，翻身時腹側濕肉整片露出。 |
| 對戰個體 | `id:"monster/breaksurf-d"`、`species:"species/breaksurf"`、`grade:"D"`、`tags:[]`，僅這四鍵。 |

已先 `ls content/base/species`，並用 `grep -rn` 查全 `content` 的「礁背／磨礁／伏顎一拱／翻背碾岸／breaksurf」，均未命中；另查同族既有寫法。識別字不是 registry 值。

## 部位、層與 HP

`bodyPlan:"bodyplan/quadruped-breaksurf"`；雙側對稱，四部位一核，總層 HP **180**，與潮狼現有骨架總量相同，落在 D 60–180。各層按外到內排列；表中末層全部 `structural:true`，前層全部 `structural:false`。

| 部位 id／顯示文字 | functions | exposure | 層型與 HP（外→內） |
|---|---|---|---|
| `heart`／腹心 | `core,cockpit` | 0.5 | chitin 10 → flesh 10 → organ 10 |
| `back`／礁背板 | 空陣列 | 2 | chitin 25 → flesh 35 |
| `jaw`／寬顎 | `manipulator,sensor` | 1 | chitin 15 → flesh 25 |
| `legs`／四短肢 | `locomotion` | 1 | chitin 15 → flesh 35 |

每層 `ablative:true`、`passThrough:{}`，不寫再生；chitin 的 `resist:{kinetic:0.2,pierce:0}`，flesh／organ 的 `resist:{pierce:0}`。其他傷害型依省略即 0；**全身 pierce 明示為 0**，外甲抗性不超 D 帶 0.2。腹心自己的外肉層保護 organ，不宣稱別的部位會替它擋傷；毀掉唯一 core 才是死亡條件。

腹心沿獸族範本放 `restraint` 槽 size 2、`cockpit` 槽 size 1，座位僅 `[{id:"pilot",accepts:["pilot"]}]`。其他部位 slots 空；各部位的 `onLayerBroken:{}`、`onBroken:[]`、`conduct:[]` 沿範本。四肢合為一部位，捕捉時不會產生「到底須斷幾條腿」的歧義。

## 屬性、池、行為與 AI

| 項目 | 方案 |
|---|---|
| D 屬性 | `baseAttrsByGrade.D={initiative:8,perception:6,accuracy:50,evasion:5}`，沿潮狼 D。 |
| species 池 | 沿潮狼：ap 0–9、hard、initial/regen 9；instinct 0–100、soft、inverted true、initial 20、regen 5；bands 空。 |
| 行為 | `behaviors:{telegraph:true}`；species tags 為 `["kaiju","beast"]`。 |
| 巢母子體 | 本案為獸族，不是巢母子體；不改既有巢母或孵生效果，不加 spawned。 |
| AI profile | `aiprofile/pack-hunter`，既有 `policy:"swarm"`；不建新 profile。 |
| 可見差異 | 單體拱擊搭配近身小範圍碾壓，分散目標能減少範圍招收益；不承諾 AI 每次固定選哪招。 |

## 捕捉與兩類機體

capture 完整寫法：`{requireIntact:["core"],requireBroken:["locomotion"],ability:"ability/restrain",frame:"frame/bio-breaksurf"}`。兩個 function 都在本骨架；斷腿保核後可拘束，以獸族的軛與鞍表達壓制，不增加駕駛人物或機魂資料。

活捕 `frame/bio-breaksurf` 與屍體 `frame/corpse-breaksurf` 均 `cls:"bio"`、`grade:"D"`、同一新 bodyPlan，`baseAttrs:{initiative:8,perception:6}`、`innateAbilities` 引用下列兩招，`repairPolicy:"repair-or-replace"`。活捕只有 instinct 池（0–100、soft、inverted true、initial 20、regen 5、bands 空），burden 2，tags `["bio","beast","kaiju"]`；屍體 `pools:[]`、burden 0，tags `["bio","beast","corpse"]`，同骨架各層無再生。屍體不另帶本能池；這兩類 frame 的 AP 由駕駛員供應，species 自有 AP 供野生單位使用。

## 兩招與零效果

| id 尾段／中文提案 | 英文原名與意涵 | 形態／傷害／成本 | AI 與冷卻 |
|---|---|---|---|
| `kx-breaksurf-gore`／伏顎一拱 | Low Gore；低顎向上掀撞 | unit、range 1–1；kinetic 8；2 AP | attack 1；不寫冷卻 |
| `kx-breaksurf-roll`／翻背碾岸 | Shore Roll；背板側翻碾過近處 | ball、range 1–1、radius 1；每目標 kinetic 5；2 AP | attackArea 0.8；cooldown 2 |

完整引用為 `ability/<id尾段>`。兩招共用 `mode:"activated"`、`costs:[{pool:"ap",owner:"person",amount:2}]`、`produces:[]`、`require:[]`、`effects:[]`；target 均 `los:true,friendly:"no"`，不加穿甲或命中加值。拱擊 tags 沿 bite 的 `["melee"]`，碾岸沿 ground-stomp 的 `["beast","telegraph"]`。形態分別採 ability-forms 的「單體攻擊」與「範圍攻擊」，EF-07 支持兩種 AI 候選；這是可用形態依據，尚未宣稱已跑實戰。

範圍傷害 5 為單體 8 的 62.5%，兩招均在 D 傷害 5–9／AP 2–3 帶內。側翻只是動作意象，實際是鄰近目標格為中心的 ball；不宣稱位移、推人、翻面增傷、破堤或地形改造。**效果檔 0 個**，不另設減益與新 registry 值。

## 使用的既有 registry 值

| registry | 本方案使用值 |
|---|---|
| layer-types | chitin、flesh、organ |
| damage-types | kinetic、pierce |
| part-functions | core、cockpit、manipulator、sensor、locomotion |
| slot-types | restraint、cockpit |
| tactics | attack、attackArea |
| locomotion | 不新增或另填移動類型，沿四足獸骨架既有寫法 |

# 6. 檔案清單

**產出段新增恰好 7 檔，無既有檔修改；下表兩欄路徑均以 `content/base/` 為根。** templates.json 的「怪獸族」列提供四檔配套契約，「屍體改裝」列補第五檔，「能力」列提供單體／ball 形態；以下用同族檔具體落地。

| 新檔路徑 | 範本路徑 |
|---|---|
| species/breaksurf.json | species/tidewolf.json |
| bodyplans/quadruped-breaksurf.json | bodyplans/quadruped-cliffjaw.json |
| frames/bio-breaksurf.json | frames/bio-tidewolf.json |
| frames/corpse-breaksurf.json | frames/corpse-tidewolf.json |
| monsters/breaksurf-d.json | monsters/tidewolf-d.json |
| abilities/kx-breaksurf-gore.json | abilities/bite.json |
| abilities/kx-breaksurf-roll.json | abilities/kx-ground-stomp.json |

範本只定格式與族別，不原封照抄高級數值：潮狼有 D/C/B 共用 species，其 180 HP 可參照，但 bite 18、pounce 12 超出本批 D 傷害帶，bio／corpse-tidewolf 亦為 C；全部依第 5 段改為新種 D 值。cliffjaw 骨架只取獸族分層、槽與部位格式，縮成上述四部位 180 HP；不沿用 A 級個體的任何命名欄。mite 的 60 HP 三部位與 6 傷／2 AP 作 D 帶另一端對照，不改既有資料。

不含新效果、AI profile、地圖、情境、人物、lore、營運接入、manifest 或 index；這七檔構成野生個體、捕獲機體、屍體機體及其引用閉合的能力組。本計畫段實際只寫 plan.md 與 review-draft.json。

# 7. 營運接入建議

建議領導在產出整合後，向 `content/base/world/rifts/beast.json` 的 `monsters` 追加 `monster/breaksurf-d`，向 `vanguard` 追加 `species/breaksurf`：前者供 D 級遭遇選用，後者補充岸線先鋒種類。保留既有潮狼、掘犬與錨，不改 gradeByWidth、數量、權重或潮汐強度。此檔不在七檔清單內，只是給領導的建議，本線與下一位內容工人均不因此取得修改授權。

現有獸族營運維持可沿用 `world/beasts/beast`，不另造族別資料。裂縫家族清單本身不保證限定岸線地點，地理仍由既有裂縫位置與遭遇系統決定；「環太平洋岸線常見」在本批是創作定位，不假稱已加地理過濾。

# 8. 需求與待決

領導審過計畫後再派產出段，採首選「礁背」（提案）即可；備選不代表第二個物種。產出時 species／bodyplan／能力／frame 必填的顯示欄照既有格式寫 `name`，例如「礁背」「礁背體」「生物機甲・礁背」「屍體改裝・礁背」；**D 級 monster 本身只用第 5 段四鍵，絕不寫 `name`／`epithet`**。英文原名與意涵留在本計畫；後續領導若建 manifest 可轉錄，不為此在本線增檔。

數值最後統一調；目前無需新引擎欄位或 registry。尚待領導決定的是中文首選與營運接入時機；沒有妨礙七檔產出的設計缺口。兩招尚未實作或驗證 AI 實際出手，不把計畫驗收當成遊戲內容驗收，也不沿用 kj-02 的環境阻塞為本線結論。

以下為交接書「方法與禁忌」原樣轉交，下一個工人同樣遵守：

- 掛到設定：海洋與潮汐裁示、底色句（1.1–1.13）、F 線（蝕線＝海岸線）或其他主線；寫明牠在世界裡為什麼存在、平常在哪裡被看見、誰最常遇到牠。
- **對面無臉**；怪獸不是畜牲（不寫餵、馴、乖）；D 級**不寫** `name`／`epithet`。
- 不用潮差、潮高推凶度；等級不是成長階段；蛻皮只屬掘犬→盾甲，不給新物種 `molt`。
- 不新增 registries 值；不寫 `territorial`、`molt`（死資料）。
- **數值照同級暫填，不做平衡**（使用者：數值最後統一調）：HP、屬性、傷害照 bio-monsters.md 與 numeric-bands D 帶，對照 `species/mite.json`、`species/tidewolf.json`。
- 不拿其他作品類比；**中文命名避免直譯**（兩步命名；上一批 agy 審查：「～者」字尾是 -er 直譯腔、「纏足」撞裹小腳——避開這類）；全庫物種名多為二到三字（潮狼、掘犬、鏡肢、群喉、抱樁）；招式名寫動作與畫面。新名詞標「提案」。

本線驗收固定三條，做完就停；件數與 20 KB 容量 gate 併入第 1 條，不追加遊戲測試、MCP、平衡或外部命名審查：

1. plan.md 存在，含「計畫必含」1–8 段，檔案清單 ≤ 8。
2. review-draft.json 是合法 JSON、1 列。
3. 設計表裡 0 個 `name`／`epithet`、0 個新 registry 值、0 個 `molt`／`territorial`。
