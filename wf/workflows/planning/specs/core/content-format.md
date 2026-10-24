# content-format — 資料夾佈局、id 命名、JSON 範例、「新增 X 要改哪些檔」

[core README](README.md)｜型別定義在各 data-model 檔｜載入器邊界 [architecture](architecture.md)

## 資料夾佈局（內容包）

```
content/<pack>/
  pack.json            # { id, version, depends: [packId], registries: {...} }
  registries/          # 列舉值登記：attrs.json, layer-types.json, damage-types.json, part-functions.json,
                       #   slot-types.json, locomotion.json, tactics.json（程式不寫死任何列舉）
  rules/               # constants.json（命中上下限、XP 比例…）、damage-modifiers.json、morale-events.json、injuries.json
  bodyplans/  frames/  components/  abilities/  effects/  persons/  soultrees/
  terrains/   maps/    factions/    species/    monsters/  scenarios/  loot/  aiprofiles/  curves/
```

每個資料夾一檔一筆（`<name>.json`），檔名＝id 的 name 段。**id 格式** `pack:kind/name`（例：`base:frame/hound-mk2`、`base:effect/burn`）；同 pack 內可省 `pack:`。載入器把所有 pack 依 `depends` 排序後合併成一個唯讀 `ContentDB`；後載入的 pack 可用同 id **覆寫**前者（mod 友善）。每種 kind 有一份 JSON Schema（`schemas/<kind>.schema.json`，由 TS 型別產生），載入時驗證：欄位型別、必填、id 參照存在、NumExpr 的 `ref` 路徑合法、池 id 已被某處宣告。

## 五個最小範例（省略選填欄；`name` 用太空歌劇風格名，id 不受限，對照見 [README](README.md)）

**機甲（frame）** `frames/hound-mk2.json`
```json
{"id":"frame/hound-mk2","name":"獵犬-II型","cls":"mechanical","grade":"C","bodyPlan":"bodyplan/biped-light",
 "baseAttrs":{"initiative":6,"perception":5},"pools":[{"id":"heat","name":"燼","min":0,"max":100,"capKind":"soft",
 "inverted":true,"initial":0,"regen":-15,"bands":[{"from":100,"to":125,"effects":["effect/overheat-1"]},{"from":125,"to":null,"effects":["effect/overheat-2"]}]}],
 "innateAbilities":[],"repairPolicy":"repair-or-replace","tags":["mech","human"]}
```

**部件（component）** `components/autocannon-30.json`
```json
{"id":"component/autocannon-30","name":"雷雞連吼","slot":"weaponMount","size":2,"mass":3,"origin":"mechanical",
 "pools":[{"id":"ammo-30","name":"殼矢","min":0,"max":12,"capKind":"hard","inverted":false,"initial":12,"regen":0,"bands":[]}],
 "abilities":["ability/burst-30"],"hp":20,"onBroken":["effect/weapon-jammed"],"tags":["ranged","kinetic"]}
```

**駕駛員（person）** `persons/ren-kasai.json`
```json
{"id":"person/ren-kasai","name":"葛西 蓮","kind":"human","attrs":{"accuracy":55,"evasion":10,"resolve":48,"initiative":7,"perception":5,"control":40},
 "traits":["effect/trait-vengeful"],"perks":[],
 "pools":[{"id":"ap","name":"AP","min":0,"max":9,"capKind":"hard","inverted":false,"initial":9,"regen":9,"bands":[]},
          {"id":"fatigue","name":"疲勞","min":0,"max":100,"capKind":"hard","inverted":true,"initial":0,"regen":-15,"bands":[]},
          {"id":"hp","name":"生命","min":0,"max":60,"capKind":"hard","inverted":false,"initial":60,"regen":0,"bands":[],"onDepleted":["effect/dead"]}],
 "will":{"beliefs":["revenge","protect-kin"],"burdenLimit":{"ref":"self.attrs.resolve"}},
 "growth":{"xpCurve":"curve/bb-default","levelDice":{},"perkPointsAt":[2,3,4,5,6,7,8,9,10,11]},"tags":[]}
```

**地形（terrain）** `terrains/acid-marsh.json`
```json
{"id":"terrain/acid-marsh","name":"酸沼","glyph":"~","color":"#6a8","moveCost":{"leg":3,"track":null,"hover":1,"flight":1,"burrow":null},
 "height":0,"cover":0,"blocksLos":false,"onEnter":[],"onTurnStart":["effect/acid-corrode"],"tags":["water","hazard"]}
```

**怪獸族（species）** `species/tidewolf.json`
```json
{"id":"species/tidewolf","name":"潮狼","family":"beast","bodyPlan":"bodyplan/quadruped-beast","gradeRange":["D","C","B"],
 "baseAttrsByGrade":{"D":{"initiative":8,"perception":6},"C":{"initiative":9,"perception":6},"B":{"initiative":10,"perception":7}},
 "pools":[{"id":"instinct","name":"本能","min":0,"max":100,"capKind":"soft","inverted":true,"initial":20,"regen":5,"bands":[]}],
 "abilities":["ability/bite","ability/pounce"],
 "capture":{"requireIntact":["core"],"requireBroken":["locomotion"],"ability":"ability/restrain","frame":"frame/bio-tidewolf"},
 "behaviors":{"telegraph":true},"aiProfile":"aiprofile/pack-hunter","tags":["kaiju","beast"]}
```

## 新增 X 要改哪些檔

**新增一台機甲**：① `frames/<name>.json`（必）；② 若部位佈局是新的，加 `bodyplans/<name>.json`（含每部位的層序列、槽、onBroken、conduct）；③ 若用到新池 id 或新層種類，先在 `registries/` 登記；④ 古代機甲另加 `abilities/`（神異能力）與 `effects/`（其效果），並填 `frame.resonance`；⑤ 想讓情境用到：`scenarios/` 的 `UnitSpawn` 加一筆。程式零修改。

**新增一個部件**：① `components/<name>.json`（必）；② 授予能力→ `abilities/<name>.json`、能力掛的效果→ `effects/`；③ 新槽型／新傷害型→ `registries/`；④ 生物／古代部件填 `burden`／`resonance`；⑤ 要讓 AI 會用：能力的 `ai.tactics` 必填（schema 強制）。

**新增一個駕駛員（或機魂）**：① `persons/<name>.json`（必；機魂 `kind:"soul"`、`growth` 用 `SoulGrowth` 並指向 `soultrees/<tree>.json`）；② 新特質→ `effects/trait-*.json`；③ 新信念標籤不用登記（開放字串），但 `rules/morale-events.json` 若要對該人物特別觸發，加條件列。

**新增一種地形**：① `terrains/<name>.json`（必，`moveCost` 要覆蓋 `registries/locomotion.json` 的每個鍵，缺的視為 null）；② 進格／站格效果→ `effects/`；③ 要出現在地圖：`maps/<map>.json` 的 `legend` 加一個 glyph 對應。

**新增一族怪獸**：① `species/<name>.json`（必）；② `bodyplans/<name>.json`（必，怪獸 body plan 的 `core` 功能部位要有 `structural` 的 organ 層當「核」，並預留 `restraint`／`cockpit` 槽給捕捉後用）；③ 族能力→ `abilities/`＋`effects/`；④ 捕後的生物機甲 `frames/bio-<name>.json`（`cls:"bio"`，`burden` 必填）；⑤ 命名個體→ `monsters/<name>.json`；⑥ 有 spawner／molt／territorial 行為填 `behaviors`，子體族與目標族要各自存在；⑦ 新 `aiProfile` 若只是參數不同，加 `aiprofiles/<name>.json` 即可，不改程式。

## 替使用者做掉的決定

1. **一檔一筆、檔名即 id 名段**：git diff 可讀、mod 覆寫一目了然；代價是檔案多。
2. **後載入 pack 可覆寫同 id**：mod 友善；衝突由 `depends` 順序決定，載入器印警告。
3. **Schema 由 TS 型別產生、不手寫兩份**：型別是唯一真相。
4. **能力的 `ai.tactics` 必填**：防止「AI 不會用新能力」這類靜默缺陷。
5. **信念標籤開放、其餘列舉登記**：信念是敘事層詞彙會一直長，列舉則需要被程式與 UI 認得。
