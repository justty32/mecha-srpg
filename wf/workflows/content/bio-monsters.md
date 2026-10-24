# bio-monsters — 怪獸四族與生物系機甲的設計原則

[content README](README.md)｜裁示 [design-notes/bio-mechs](../planning/design-notes/bio-mechs.md)｜世界觀 [monsters](../planning/specs/world/monsters.md)、[bio-mechs](../planning/specs/world/bio-mechs.md)｜營運 [data-model-beasts](../planning/specs/ops/data-model-beasts.md)｜設計契約 `wf/workflows/dispatch/handoffs/done/2026-10-24/lead-content-monster/design.md`（引擎事實與各族表）

怪獸是天氣也是神話。寫牠先寫**二名怎麼來的**，再寫數字；數字照 [numeric-bands](numeric-bands.md) 怪獸列。一族一組四檔：`species/`＋`bodyplans/`＋`frames/bio-*`＋`monsters/`，再加 `abilities/kx-*`、`effects/kx-*`；要出現在營運還要 `world/rifts/<family>`、`encounters/rift-<family>-*`、`world/beasts/<family>`（四族已有，新族才建）。

## 四族骨架與行為差異

| 族 `family` | 骨架與層 | 行為欄 | 拘束 | AI profile |
|---|---|---|---|---|
| `insect` 蟲族 | 多節多足、晶冠；chitin→flesh→organ | `spawner`（只巢母）、繫、潮汐式出巢 | 殼釘節鎖，同調慢、最不易暴走 | reaper-vanguard／swarm-mite／nest-anchor |
| `beast` 獸族 | 脊椎四足、骨板、顎；厚 chitin 厚 flesh | `molt`（只掘犬→盾甲）、不繫、衝鋒 | 軛與鞍，同調最快、本能漲最快 | pack-hunter／kx-beast-alpha |
| `alien` 異形 | 不對稱、每隻不同；一側高抗一側 0 | 無錨（群喉例外）、debuff、變異是營運事 | 量身懸囊、工時三倍 | kx-alien-stalker |
| `mycelium` 菌絲 | 地形不是個體；chitin／flesh **無 organ 核** | 不動或拔根一格、多核錨；燒才有用（kinetic／pierce 0.5、acid 0.8、thermal 0） | 不可拘束只能採（`harvest-only`） | kx-mycel-creep（sentinel） |

每族至少一種傷害型 resist 0（燒菌絲、戳鏡肢裸側、刺蟲的腹節）——沒有弱點的怪是設計錯誤。意圖可見 `behaviors.telegraph:true` 全族都寫。`territorial` 不要寫（需要地形 id 與引擎支援）。

## 等級與血量

等級不是成長階段（B 不是 C 長成的）：`gradeRange` 列出本族各自過來的級，**不同級要不同血量就得不同 species＋bodyplan**（EF-13：`partsOverride` 未實作、grade 只換屬性）。HP 帶：D 60–180、C 300–480、B 800–1400、A 1500–2000、S 3500–4500；屬性 D `{8,4–6,50,5}` C `{9,6,55,8}` B `{10,7,60,10}` A `{3–8,8,65,12}` S `{8,9,70,12}`（initiative／perception／accuracy／evasion）。同族內 ±2 做個性。能力數 D 1–2、C–B 2–3、A–S 3；每招傷害 D 5–9、C 12–20、B 18–26、A 24–34、S 30–40，範圍招打六七成。怪獸能力 `costs` 寫 AP（約每 6 傷 1 AP，增益 2–3、孵生 4），強招 cooldown 2–4，`produces:[]`、`require:[]`。

## 核心部位

死亡＝所有 `core` 部位 broken。**每個 bodyplan 至少一個 core 部位、每部位最後一層 `structural:true`**。單核藏在裡面（exposure 0.5）＝要先打破外面才摸得到；多核（菌床五結、群喉五喉）＝潮錨的「全滅才死」。可捕族的 core 部位帶 `slots:[restraint, cockpit]`、`seats:[{id:"pilot",accepts:["pilot"]}]`、functions 含 `core`、`cockpit`。捕捉條件寫在 species：預設 `requireIntact:["core"]`、`requireBroken:["locomotion"]`；要「先打斷顎」就加 `manipulator`；列的 function 必須存在於 bodyplan；不可捕族寫互斥 `core`／`core`。

## 怪獸個體 monster

只寫 `id, species, grade, name?, epithet?, tags`。**A 級以上必有 name（俗名或人叫法）＋ epithet（二名）**，tags 加 `named`；B 以下不寫兩者。二名中二、四字為主（赤眼兇星、千囊房東、萬潮葬王、鏽誓葬騎），寫法「牠做過的事＋牠的樣子」，不是形容詞堆疊；備選詞庫 `world/names/epithet-<family>.json`。S 只做「每個大型蝕域一隻、人取名『XX的那隻』」。同族同級 A 目前**只能一隻**（ops 用 species＋grade 反查二名；第二隻要等引擎缺口線 BattleResult 帶 monster id）。

## 生物系機甲：活捕與屍體

**活捕** `frames/bio-<species>.json`：`cls:"bio"`、grade＝某個 monster 的 grade、同 bodyplan、`pools` 只有 `instinct`、`innateAbilities`＝species abilities、`burden` D2／C5–6／B8–9／A12–13／S16、tags `["bio","<族>","kaiju"]`。`name` 用登記號式「生物機甲・<族名>」，真正的名字走營運層四種稱號（登記號／小名／凶名／二名），不要在 frame 取寵物名。一族一台專屬，不共用。

**屍體改裝** `frames/corpse-<species>.json`：同 bodyplan、**無 instinct 池、burden 0**、肉層不再生，與摹機同規則；開銷大在營運層（吃一顆同級核），不在戰鬥數值。14 族都有了，新族補一台。

**怪獸意識不是人物**：不給 bio frame 座位以外的 soul 座、不寫 person 檔；拘束器與駕駛艙是 `origin:"mechanical"` 部件插 `restraint`／`cockpit` 槽。**沒有餵養**：營運 `world/beasts/<family>.json` 只有磨損（wearPerDay D3…S20）、族別維持（蟲獸 `devour` 一潮月一次、異形 `tide-soak`、菌絲 `prune`）、同調 bond；文字不出現餵、飼料、獸欄、寵物——拘束艙是壓制與對抗。

## 能力與效果的族風格

招式名寫動作與畫面（斷崖之吻、赤祈撕界、五聲葬月），不寫生物學名詞（外骨骼、酸液、甲殼素）。效果 `ui.badge` 中文 2–4 字。族招的 AI 鍵：咬／撞 attack、踏地／孢霧 attackArea、仰頭／費洛蒙 buff（`friendly:"only"`、ball radius 3–4、自己也吃）、瞪視／嘶鳴 debuff、豎甲 protect、孵生 buff＋tags spawn。對怪獸的減益效果一律 `scope:"mech"`。

## 常見錯誤

family 拼錯（ops 找 `beasts/<family>` 會炸）；capture.frame 共用或 grade 對不上 monster；B 以下寫二名；tags 漏 `kaiju`；bodyplan 無 core 或結構層；菌絲寫 organ 核；bio frame 寫 heat 池；corpse 寫 instinct；寫 `territorial`／`partsOverride`／`attrMods`／`extraAbilities`（死資料）；新增 registry 值。
