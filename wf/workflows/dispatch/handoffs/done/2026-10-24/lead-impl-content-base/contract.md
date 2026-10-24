# content/base 第一批內容：id 命名表與跨檔引用（lead-impl-content-base 凍結）

[lead-impl-content-base 交接書](../lead-impl-content-base.md)

本檔是 `cx-content-mechs`、`cx-content-world`、`cx-content-scenarios` 三份交接書**共同引用的契約**。下面每個 id、檔名、件數**照抄**，不得改名、不得增減；欄位形狀以 `schemas/content.schema.json` 為準，風格照 `content/base/` 既有檔（兩空格縮排、一檔一筆、檔名＝id 的 name 段）。數值只求「載入零錯誤、量級合理」，不做平衡。

## 0. 全域規則

- **既有檔一律不改**（含 `bodyplans/biped-light.json`、`quadruped-beast.json`、`frames/hound-mk2.json` 等）：規則線的測試釘住它們。`registries/` 已由領導追加完畢，工人不碰。
- **檔名禁區**：不得建立 `cb-*`、`pp-*`、`infantry.json`、`morale-*.json`、`berserk.json`（規則線工人保留）。
- id 在檔內一律省略 `base:` 前綴（`"frame/moji-tern"`）。
- 已登記可用值：layer-types `shield armor chitin flesh organ cockpit-shell component structure resonant-shell`；damage-types `kinetic acid energy thermal pierce`；part-functions `core cockpit manipulator sensor locomotion weaponMount spawner`；slot-types `weaponMount restraint cockpit soulCore armorMount sensorMount`；locomotion `leg track hover flight burrow`；tactics `attack attackArea disable heal buff debuff escape protect capture scout`；attrs `accuracy evasion resolve initiative perception control`。
- 池 id：既有 `heat ammo-30 instinct ap fatigue hp`；新增 `charge`（mechs 線宣告於 `frame/moji-tern`）、`brood`（mechs 線宣告於 `frame/bio-nestmother`）、`calc`（world 線宣告於兩個機魂人物）。能力成本只准點名這九個池。
- NumExpr 的 `ref` 根只准 `self target part layer battle`；古代能力門檻寫 `{"cmp":{"a":{"ref":"self.resonance"},"op":">=","b":0.5}}`。
- 每個能力的 `ai.tactics` 必填且鍵須是已登記 tactics。

## 1. mechs 線（cx-content-mechs）——31 檔

**bodyplans（5）**：`bodyplan/biped-standard`（標準雙足；部位 `torso head left-arm right-arm legs`）、`bodyplan/ancient-warden`（守殼者；部位 `shell-core left-arm right-arm legs`）、`bodyplan/insect-mite`（蝕蟲體；部位 `body legs mouth`）、`bodyplan/insect-reaper`（鐮肢體；部位 `thorax head left-scythe right-scythe abdomen legs`）、`bodyplan/insect-nestmother`（巢母體；部位 `shoulder skull trunk sac-1 sac-2 sac-3 roots core-belly`）。
每個部位 **≥ 2 層**（由外到內），且**恰好最內一層 `structural: true`**。功能與槽：
- biped-standard：`torso` 功能 `core cockpit`、層 armor→cockpit-shell、槽 `cockpit`(cockpit,1)＋`soul-core`(soulCore,1)＋`armor-mount`(armorMount,1)、座位 `pilot`[pilot]＋`soul`[soul]、conduct 一筆（layerHit cockpit-shell → pilot，`effect/injury-concussion`，chance 0.2）；`head` 功能 `sensor`、層 armor→structure、槽 `sensor-mount`(sensorMount,1)；兩臂功能 `manipulator weaponMount`、層 armor→structure、槽 `left-weapon`/`right-weapon`(weaponMount,2)；`legs` 功能 `locomotion`、層 armor→structure、無槽。
- ancient-warden：`shell-core` 功能 `core cockpit`、層 resonant-shell→flesh→organ、無槽、座位只有 `pilot`[pilot]（殼不認機魂）；兩臂 `manipulator`、層 resonant-shell→flesh；`legs` `locomotion`、層 resonant-shell→flesh。
- 三個蟲族體：核部位（mite `body`、reaper `thorax`、nestmother `core-belly`）功能 `core cockpit`、層 chitin→flesh→organ、槽 `restraint`(restraint, mite 1／reaper 2／nestmother 4)＋`cockpit`(cockpit,1)、座位 `pilot`[pilot]；行動部位（mite `legs`、reaper `legs`、nestmother `roots`）功能 `locomotion`；reaper 兩鐮 `manipulator weaponMount`，`right-scythe` 另有槽 `graft`(weaponMount,2)；reaper `head`、nestmother `skull` 功能 `sensor`；mite `mouth` 功能 `manipulator`；nestmother `sac-1..3` 功能 `spawner`；其餘部位 `functions: []`。層類型只用 chitin／flesh／organ。
- 量級：biped 各層 15–50；ancient 各層 40–90；mite 各層 5–15；reaper 各層 15–50；nestmother 各層 40–150。

**frames（5）**：
| id | name | cls／grade | bodyPlan | pools | innateAbilities | 其他 |
|---|---|---|---|---|---|---|
| `frame/moji-tern` | 摹機・燕鷗 | mechanical／C | biped-standard | `heat`（照 hound-mk2 的帶）＋`charge`（0..60，initial 60，regen 10，hard，非反向） | [] | tags `mech human` |
| `frame/bio-reaper` | 生物機甲・鐮肢 | bio／C | insect-reaper | `instinct`（照 bio-tidewolf） | reaper-cleave、reaper-charge | `burden: 6`；tags `bio insect kaiju` |
| `frame/bio-mite` | 生物機甲・蝕蟲 | bio／D | insect-mite | `instinct` | mite-swarm-bite | `burden: 2` |
| `frame/bio-nestmother` | 生物機甲・巢母 | bio／A | insect-nestmother | `instinct`＋`brood`（0..6，initial 0，regen 1） | nest-birth、root-drag | `burden: 12` |
| `frame/ancient-rearguard` | 刑天（調度者補充裁示：古代機甲原始無名，name 是人取的神話稱號；frame schema 無描述／別名欄 → SPEC-GAP） | ancient／S | ancient-warden | **[]（不宣告任何池）** | rearguard-oath、shell-lance | `resonance: {beliefs:["never-retreat","bring-them-home"], threshold:0.5, deeds:["held-the-line"]}`；`repairPolicy: "repair-only"`；tags `ancient` |
其餘 frame `repairPolicy: "repair-or-replace"`；baseAttrs 只用 `initiative perception`。

**components（6）**：
| id | name | slot／size | origin | 要點 |
|---|---|---|---|---|
| `component/soul-core-std` | 魂核（標準） | soulCore／1 | mechanical | hp 10，無能力，tags `soul-core` |
| `component/heat-lance` | 熱矛 | weaponMount／2 | mechanical | abilities [heat-lance-thrust]，hp 15，onBroken [`effect/weapon-jammed`] |
| `component/composite-plate` | 外掛複合裝甲 | armorMount／1 | mechanical | `layersAdd:[{part:"torso",insertAt:0,layer:{armor 25}}]` |
| `component/shell-pin-restraint` | 殼釘節鎖 | restraint／1 | mechanical | hp 20，onBroken [`effect/restraint-broken`] |
| `component/reaper-scythe-graft` | 鐮肢移植臂 | weaponMount／2 | **bio** | **`burden: 3`**，abilities [scythe-graft-cleave]，hp 25 |
| `component/shell-shard-lens` | 殼片透鏡 | sensorMount／1 | **ancient** | **`resonance: {beliefs:["seek-truth"], threshold:0.4}`**，attrMods perception +3，abilities [shard-gaze] |

**abilities（10）**：`ability/heat-lance-thrust`（近戰 thermal 28；costs ap 4 person＋charge 10 mech；produces heat 20 mech）、`ability/scythe-graft-cleave`（近戰 pierce 22；costs ap 4 person）、`ability/shard-gaze`（scout；range 1–8；costs ap 2 person；on hit apply `effect/shard-marked`；無 packets）、`ability/rearguard-oath`（**古代獨有**；target self；costs fatigue 20 person；require 共鳴 ≥ 0.5；on self apply `effect/rearguard-oath`；tactics buff＋protect）、`ability/shell-lance`（energy 32；range 1–4；costs ap 4 person；require 共鳴 ≥ 0.5）、`ability/mite-swarm-bite`（kinetic 6，range 1）、`ability/reaper-cleave`（pierce 20，range 1，tags 含 `telegraph`）、`ability/reaper-charge`（kinetic 14，range 1–3，cooldown 2）、`ability/nest-birth`（target self；on self apply `effect/nest-birth`；tactics buff）、`ability/root-drag`（kinetic 10，range 1–2，on hit apply `effect/rooted`）。怪獸能力（後五個）`costs: []`。

**effects（5）**：`effect/rearguard-oath`（mech，ownerTurns 2，contribs evasion +10、initiative +3）、`effect/shard-marked`（mech，ownerTurns 2，contribs evasion −10）、`effect/restraint-broken`（mech，permanent，hooks.onApply `{do:"pool",owner:"mech",pool:"instinct",delta:30}`）、`effect/nest-birth`（mech，ownerTurns 1，hooks.onApply `{do:"spawn",species:"species/mite",grade:"D",at:"adjacent"}`）、`effect/rooted`（mech，ownerTurns 1，contribs initiative −3）。contribs 的 `path` 寫 `self.attrs.<attr>`，`source` 寫該效果 id。

## 2. world 線（cx-content-world）——31 檔

**species（3）**，取自 `specs/world/monsters.json` 蟲族三列（名稱一致）：
| id | name | gradeRange | bodyPlan | abilities | capture.frame | behaviors | aiProfile |
|---|---|---|---|---|---|---|---|
| `species/mite` | 蝕蟲 | ["D"] | insect-mite | mite-swarm-bite | `frame/bio-mite` | telegraph | swarm-mite |
| `species/reaper` | 鐮肢 | ["C"] | insect-reaper | reaper-cleave、reaper-charge | `frame/bio-reaper` | telegraph | reaper-vanguard |
| `species/nestmother` | 巢母 | ["A"] | insect-nestmother | nest-birth、root-drag | `frame/bio-nestmother` | telegraph＋**`spawner:{child:"species/mite",cadence:3,max:6,tether:"dieWithParent"}`** | nest-anchor |
`family: "insect"`；`pools` 皆 `instinct`（照 tidewolf）；capture `requireIntact:["core"]`、`requireBroken:["locomotion"]`、`ability:"ability/restrain"`；tags 含 `kaiju insect`，mite／reaper 另加 `spawned`。

**monsters（3）**：`monster/mite-d`（species/mite，D）、`monster/reaper-c`（species/reaper，C）、`monster/nestmother-landlord`（species/nestmother，A，name「房東」，tags `named`）。

**aiprofiles（4）**：`aiprofile/swarm-mite`（policy `swarm`）、`aiprofile/reaper-vanguard`（`tactical`）、`aiprofile/nest-anchor`（`sentinel`）、`aiprofile/glove-line`（`tactical`）。形狀照 `pack-hunter`。

**terrains（4）**：`terrain/ruin-wall`（殘牆，glyph `#`，blocksLos true，cover 30，height 1，`destructible:{hp:60,becomes:"terrain/rubble"}`）、`terrain/rubble`（瓦礫，`:`，cover 15）、`terrain/shallows`（淺灘，`≈`，tags water）、`terrain/erosion`（蝕地，`%`，onTurnStart [`effect/erosion-gnaw`]，tags rift hazard）。`moveCost` 五鍵齊全。

**effects（8）**：`effect/erosion-gnaw`（layer，ownerTurns 1，onTick damage acid 2，layerFilter armor component）；特質 `effect/trait-steady-hands`（accuracy +5）、`effect/trait-beast-sense`（perception +2）、`effect/trait-copied`（resolve −5）；機魂 perk `effect/perk-soul-calc-1`（perception +2）、`effect/perk-soul-calc-2`（initiative +2）、`effect/perk-soul-hand-1`（accuracy +3）、`effect/perk-soul-heart-1`（resolve +5）。全為 person scope、permanent（erosion-gnaw 除外），tags 含 `trait` 或 `perk`。

**soultrees（1）**：`soultree/moji-std`（摹機魂樹）四節點：`calc-1`（perk-soul-calc-1，research {calc:10}，requires []）、`calc-2`（perk-soul-calc-2，research {calc:25}，requires ["calc-1"]）、`hand-1`（perk-soul-hand-1，research {hand:10}，requires []）、`heart-1`（perk-soul-heart-1，research {heart:10}，companionship 20，requires []）。

**persons（5）**：人類 `person/mara-okoye`（瑪拉・奧可耶，beliefs protect-kin，trait steady-hands）、`person/chen-xiaohai`（陳小海，beliefs survive，trait beast-sense）、`person/ilse-brandt`（伊爾瑟・布蘭特，**beliefs never-retreat、bring-them-home**）——形狀照 `ren-kasai`（pools ap／fatigue／hp）；機魂 `person/glove`（手套，塞勒涅登錄機魂，**部分天賦樹**：perks [perk-soul-calc-1, perk-soul-calc-2, perk-soul-hand-1]，traits [trait-copied]，growth `{tree:"soultree/moji-std", researchPerDirection:{calc:25,hand:10}, companionshipRate:0}`）、`person/ash`（灰，野魂，perks []，growth `{tree:"soultree/moji-std", researchPerDirection:{heart:5}, companionshipRate:1.5}`）——形狀照 `unit-07`，pools ap／fatigue＋`calc`（0..50，initial 50，regen 10，hard，非反向），tags 含 `soul`。

**factions（3）**：`faction/migrant-crew`（候鳥號獵團，scale band，tags human）、`faction/selene-whitegloves`（塞勒涅白手套，company，tags human soul-driven）、`faction/rift-insects`（裂獸・蟲群，swarm，tags kaiju）。relations 兩兩互填（獵團與白手套 neutral、與蟲群 hostile；白手套與蟲群 hostile）；`strategy: "strategy/default"`；`sensing: "shared"`。

## 3. scenarios 線（cx-content-scenarios）——4 檔＋README

- `map/skirmish-20`（20×20）、`map/rift-edge-60`（60×60）：`cells` 為 width×height 個 glyph 的單一字串（逐列由上到下串接）；legend 鍵：`.` plain、`#` ruin-wall、`:` rubble、`≈` shallows、`%` erosion、`~` acid-marsh（60 圖才用 `~ %`）。`deployZones` 鍵 `player`、`enemy`（60 圖另有 `ally`），每區格數 ≥ 該 slot 單位數且都落在非 `#` 格；`exits` 給 player 部署側整條邊。
- `scenario/skirmish-whitegloves`（map skirmish-20，4 對 4）：player＝faction/migrant-crew 四台：moji-tern［ren-kasai pilot、unit-07 soul］、hound-mk2［mara-okoye pilot］、bio-reaper［chen-xiaohai pilot］、ancient-rearguard［ilse-brandt pilot］；enemy＝faction/selene-whitegloves 四台 moji-tern，各一座位［glove soul］。objectives：player eliminate→win、enemy eliminate→win。`seed` 2108、`rounds` 20。
- `scenario/rift-edge-nest`（map rift-edge-60，十對十）：player 同上四台；ally＝faction/selene-whitegloves 六台 moji-tern［glove soul］（第一台改［ash soul］）；enemy＝faction/rift-insects 十隻：monster/nestmother-landlord ×1、monster/reaper-c ×3、monster/mite-d ×6。objectives：player killTarget（params `{target:"monster/nestmother-landlord"}`）→win、player survive（params `{rounds:30}`）→win、enemy eliminate→win。`seed` 2109、`rounds` 30。
- 單位 `at` 一律 `"zone"`。`content/README.md` 一頁（見該線交接書）。
