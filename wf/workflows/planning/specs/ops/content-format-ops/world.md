# content-format-ops／world — 曆、浮船、方格圖、區域、地點、航道、行動者、裂縫族、戰場生成

[content-format-ops 入口](../content-format-ops.md)｜型別在 [world-grid/map-and-terrain](../world-grid/map-and-terrain.md)、[world-grid/actors-and-encounters](../world-grid/actors-and-encounters.md)、[data-model-world-map](../data-model-world-map.md)

**曆**　**浮船**
```json
{"id":"calendar/tide","daysPerMonth":28,"monthsPerYear":13,"epochMonth":247,"spring":[1,15],"neap":[7,21]}
```
天象（`world/omens/<名>.json`，kind `omen`；週期與潮級規則見 [time-and-tick/calendar](../time-and-tick/calendar.md)）
```json
{"id":"omen/perigee","name":"迫月","nameEn":"Perigee","layer":"distance","cycle":{"periodMonths":7.5,"offsetDays":0,"durationDays":1},"tideDelta":1,"text":"月亮貼得太近，門拉得更開。","effects":[],"tags":["tide"]}
```
```json
{"id":"ship/migrant-bird","name":"候鳥號","rooms":["bridge","hangar","restraint","medbay","galley","cargo"],"capacity":{"mechBays":4,"restraintSlots":2,"berths":10,"cargo":60},
 "mp":100,"fuelPerDay":2,"sight":5,"fuel":{"name":"浮料","max":120,"initial":40},"hull":{"max":100,"initial":70},"gun":{"name":"老實人","shotsPerBattle":2}}
```

**方格圖**（一張一檔；`rows` 每列一字串、字元查 `legend`、字元後可接重複數；40×40 測試圖節錄）
```json
{"id":"map/test40","name":"測試圖","size":{"w":40,"h":40},"cellKm":40,"fog":"charted","riftRate":1.0,
 "legend":{"~":"wterrain/tidesea",",":"wterrain/shoal",".":"wterrain/plain","\"":"wterrain/forest","^":"wterrain/ridge","#":"wterrain/urban"},
 "base":{"rows":["~40","~8,2.30","~6,2.4#3.23^2","…共 40 列"]},
 "region":{"legend":{"a":"region/ganges-mouth","b":"region/bay-tide-line"},"rows":["a20b20","…"]},
 "road":[[12,7],[13,7],[14,8]]}
```

**區域**（一圖一檔：區域 id→名字與描述片語）
```json
{"id":"regions/test40","map":"map/test40","regions":{"region/ganges-mouth":{"name":"恆河口","phrase":"泥與蘆葦，潮退時露出斷鐵路。"},
 "region/bay-tide-line":{"name":"孟加拉灣蝕線","phrase":"每個漲潮往北推一塊。"}}}
```

**地點**（原 `nodes/`；`footprint` 省略＝只佔 `at`）
```json
{"id":"place/dhaka","name":"達卡","map":"map/test40","at":{"x":14,"y":8},"footprint":[{"x":13,"y":7},{"x":14,"y":7},{"x":15,"y":7},{"x":13,"y":8},{"x":15,"y":8},{"x":13,"y":9},{"x":14,"y":9},{"x":15,"y":9}],
 "kind":"city","owner":"faction/dhaka-weavers","pop":3,"services":["market","recruit","repair-dock","medbay","uplink"],"tags":["coastal","tide-line"]}
```
```json
{"id":"place/old-array","name":"舊陣列","map":"map/test40","at":{"x":30,"y":22},"kind":"ruin","services":[],"ruin":{"depth":4,"seedTable":"loot/ruin-old-array","discovered":true},"tags":["shell"]}
```

**航道**（原 `routes/` 與 `ferry.json`；只接不同圖或不相連的島）
```json
{"id":"lane/singapore-tranquility","a":"place/singapore","b":"place/tranquility-city","kind":"orbital","days":3,"departDays":[7,21],"fare":{"sum":[2800,{"product":[0.1,{"ref":"ledger.debt"}]}]},
 "carriesShip":false,"capacity":{"mechs":4,"persons":8},"requires":["component/sealed-pod"],"hazards":["eventtable/orbital"],"tags":["selene"]}
```
```json
{"id":"lane/suez","a":"place/port-said","b":"place/suez-south","kind":"land-bridge","days":1,"carriesShip":true,"hazards":[],"tags":[]}
```

**行動者 AI 表**（五種 kind 各一檔；`aiChoice` 是對方在遭遇四選的權重）
```json
{"id":"actors/patrol","kind":"patrol","mp":60,"contact":1,"loop":{"placesPerLoop":[2,4],"stayDays":1},
 "chase":{"when":{"any":[{"playerRepBelow":-30},{"actorTag":"blight-bandit"}]},"days":3,"needStrRatio":1.2},
 "aiChoice":{"evade":1,"intercept":3,"parley":2,"fight":2},"onSight":"Sighted"}
```
```json
{"id":"actors/swarm-insect","kind":"swarm","family":"insect","mp":50,"contact":2,"beats":{"spring":"raid","dom7":"return"},"target":"nearest-city-or-caravan",
 "strDecayPerDay":0.05,"openingCandidateIfFarther":6,"aiChoice":{"evade":0,"intercept":4,"parley":0,"fight":4}}
```

**裂縫族模板**　**戰場生成模板**（`$cell` ＝該格與八鄰的 `battle_pool`，取代 `$node`）
```json
{"id":"rift/insect","family":"insect","anchor":"monster/nestmother","vanguard":["species/mite","species/reaper"],
 "spreadPerTide":{"sum":[1,{"product":[0.5,{"ref":"rift.anchorAge"}]}]},"patchSize":[7,12],"selfClose":false,"tether":true,"gradeByWidth":{"D":["D"],"C":["D","C"]}}
```
```json
{"id":"encounter/insect-deep","family":"insect","depth":"deep","size":{"w":48,"h":48},
 "terrainMix":[{"terrain":"terrain/hive-wall","w":4},{"terrain":"terrain/tunnel","w":3},{"terrain":"$cell","w":2}],"budgetByGrade":{"C":6,"B":2},"anchorHere":false}
```
```json
{"id":"encounter/place-city","kind":"city","overlay":[{"feature":"terrain/ruin-wall","along":"footprint-edge"},{"unit":"conventional-arms","count":2,"slot":"ally"}]}
```


## SPEC-GAP 補（2026-10-26 lead-engine-next）

`WorldActionDef.lordScript?` 是單一具名 S 的資料腳本，沿既有 action kind 載入，不進隨機行動牌（`actor:"world",valid:{any:[]},weight:0,cooldownDays:0,effects:[]`）。形狀如下；所有內容引用照 loader 正規化，區域鍵保留裸字串。

```ts
lordScript: {
  lord: Id; startIds: Id[]; windowMonths: [number,number]; minTide: number;
  route: {loc: Loc; place: Id}[]; routeDelta: 1; gradeCap: "A"; observationDays: number;
  branchRiftAt: Cell; branchRadius: number;
  blight: {area: string; map: Id; cells: Cell[]; to: "shallow"};
  aura: Id; trace: Record<"present"|"northward"|"gone",string>;
  routePrompts: {regions: string[]; text: string; choices: Choice[]}[];
  contracts: {template: Id; issuer: Id; place: Id}[]; news: string[];
  gate: {month: number; dom: number; omen: Id; map: Id; place: Id;
    allowedRegions: string[]; text: string; choices: Choice[]};
}
```

`checkWorld` 必須驗 lord／aura／start／world map／place／omen／contract／issuer 引用、四站合法 Loc、月份與潮級候選、改區格合法且連通。北行候選由 skyAt 按零起算 `clock.month=8..24` 取大潮（tide≥3），且此前已有大潮；空候選拒絕。開局以原始主 RNG 複本抽一次並存 northwardDay，不消耗主／war／actor RNG，讀檔不重抽。只為 startIds 命中的戰役新增 namedLords。

每日段 2 在 world 後、contracts 前依腳本一次走完四站；不要求接約或在灣內。每站記位置、日期與 visited，沿途普通出獸上限當日加一、cap A，隔日失效。終站在 branchRiftAt=(132,92) 曼哈頓距離≤4 查既有未 sealed／receding／closed 裂縫，按距離、id 字典序取一個 width 上移一級 cap A，記 northBranch=raised；沒有則 passed。命中裂縫不再疊沿途第二級；不新增開局裂縫。

北行完成套一次 blightShift（契約見 [rifts-on-grid](../world-grid/rifts-on-grid.md)），再發五則 TemplatesDef news、三筆指定 issuer/place 的合約請求。契約仍驗 alive／rep／scale／contractKinds，不掛平日隨機發包牌。`ContractTemplate.text?` 承接原文，顯示於板上詳情及 scenario.brief；scout 觀測窗外失效，不生成舊 presence。

每日段 4 優先提供所在路段的 routePrompts；文字與選項照內容，問清河口以 `lordChoice:{lord,choice:"inquire"}` 回報已保存的 raised／passed 見聞，不混進主文。王跡三句固定原文並另列 sinceDay；gone 只表示最後目擊失效，不推論死亡。

守牆只在 `clock.month=40,dom=1` 的連珠潮夜（現成曆 day1120）檢查 gate.map／allowedRegions；全 UI 月份序號統一留後續。gate choices 用 `lordChoice:{lord,choice:"decline"|"accept"}`，runtime 驗當日、offered、灣內且無其他 pendingBattle。拒絕關閉窗口；接受建唯一 pending sortie，loc=吉大港、shipOverhead=false，船留原格。錯過當夜不重發；接受尚非迎戰。
