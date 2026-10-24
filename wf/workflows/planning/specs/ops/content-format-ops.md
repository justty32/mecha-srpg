# content-format-ops — `content/<pack>/world/` 佈局、id 命名、每種資料一個 JSON 範例

[ops README](README.md)｜core 的內容包規則 [core/content-format](../core/content-format.md)（id 格式、覆寫、schema 由 TS 型別產生，全部沿用）

## 佈局（與 core 的 kind 資料夾並列在同一 pack 內）

```
content/<pack>/world/
  calendar.json  ferry.json  ship.json          # 單檔：曆、渡輪、浮船
  nodes/  routes/  rifts/  encounters/           # 世界圖、路線、裂縫族模板、戰場生成模板
  factions-ops/  contracts/  actions/            # FactionOpsDef、ContractTemplate、WorldActionDef
  markets/  services/  recruit-pools/  backgrounds/
  research/  jobs/  names/                       # ResearchDef、job 工時係數、命名表
  events/  dialogues/  rooms/  templates/        # 事件鏈、對白、房間片語、CampaignEvent→文字
  campaign-start/<id>.json                       # 開局
```

id 沿用 `pack:kind/name`，kind＝資料夾名。schema 由 TS 型別產生；`npm run check` 另驗：路線兩端存在、`terrainPool` 存在、契約 `issuerKinds` 有勢力匹配、事件 `next` 無斷點、`OpsEffect` 的 account 合法、`templates/` 覆蓋每個事件型別。範例省略選填欄，`PoolDecl` 只寫 `max`／`initial`。

## 範例

**曆**　**渡輪**　**浮船**
```json
{"id":"calendar/tide","daysPerMonth":28,"spring":[1,15],"neap":[7,21],"special":[{"dom":1,"month":3,"event":"event/farside-day"}]}
```
```json
{"id":"ferry/selene","ports":["node/quito","node/nairobi","node/singapore"],"departDays":[7,21],"transit":3,"capacity":{"mechs":4,"persons":8},
 "fare":{"product":[2800,{"sum":[1,{"ref":"debt.ratio"}]}]},"requires":["component/sealed-pod"]}
```
```json
{"id":"ship/migrant-bird","rooms":["bridge","hangar","stable","medbay","galley","cargo"],"capacity":{"mechBays":4,"stablePens":2,"berths":10,"cargo":60},
 "fuel":{"max":120,"initial":40},"hull":{"max":100,"initial":70},"gun":{"shotsPerBattle":2}}
```

**節點**　**路線**
```json
{"id":"node/dhaka","name":"達卡","body":"earth","kind":"city","owner":"faction/dhaka-weavers","services":["market","recruit","repair-dock","medbay"],
 "terrainPool":["terrain/urban","terrain/mudflat"],"tags":["coastal","tide-line"]}
```
```json
{"id":"route/dhaka-chittagong","a":"node/dhaka","b":"node/chittagong","days":2,"kind":"air","hazards":["eventtable/bay-wild"]}
```

**裂縫族模板**　**戰場生成模板**
```json
{"id":"rift/insect","family":"insect","anchor":"monster/nestmother","vanguard":["species/mite","species/reaper"],
 "spreadPerTide":{"sum":[1,{"product":[0.5,{"ref":"rift.anchorAge"}]}]},"selfClose":false,"tether":true,"gradeByWidth":{"D":["D"],"C":["D","C"]}}
```
```json
{"id":"encounter/insect-deep","family":"insect","depth":"deep","size":{"w":{"pick":[40,60]},"h":{"pick":[40,60]}},
 "terrainMix":[{"terrain":"terrain/hive-wall","w":4},{"terrain":"terrain/tunnel","w":3},{"terrain":"$node","w":2}],"budgetByGrade":{"C":6,"B":2},"anchorHere":false}
```

**勢力營運側**
```json
{"faction":"faction/dhaka-weavers","scale":"guild","territory":["node/dhaka"],"stance":{"player":0,"bio":-1,"ancient":0,"soul":0,"league":1},
 "contractKinds":["contract/clear-nest"],"services":["market"],"reputationTiers":[{"at":20,"name":"熟客","grants":["service/escort-contracts"]}],
 "lifecycle":{"shrinkOn":{"all":[{"nodeBlighted":"node/dhaka"}]}},
 "naming":{"mechStages":[{"grade":["D"],"pattern":"{code}"},{"grade":["C","B"],"pattern":"{series}-{mark}型"}],"ancient":"mythic-by-finder","flavor":"工會記帳體"}}
```

**契約模板**　**世界行動牌**
```json
{"id":"contract/clear-nest","kind":"clear","issuerKinds":["city","guild","league"],"requiresRep":-10,"gradeRange":["D","C","B"],
 "objectives":[{"kind":"eliminate","params":{"tags":["kaiju"]}},{"kind":"killTarget","params":{"role":"anchor"},"optional":true}],
 "pay":{"base":{"product":[400,{"ref":"rift.widthIndex"}]}},"advanceMax":0.3,"deadlineDays":{"ref":"calendar.daysToNextSpring"},"onComplete":["opseffect/rep-issuer-plus-5"]}
```
```json
{"id":"action/post-clear-contract","actor":"faction","valid":{"all":[{"factionHasTerritoryNear":"anchored"}]},
 "weight":{"sum":[1,{"ref":"faction.threatNearby"}]},"cooldownDays":3,"effects":[{"spawnContract":"contract/clear-nest","near":"territory"}]}
```

**市場**　**服務**
```json
{"id":"market/dhaka","node":"node/dhaka","refreshOn":"quarter","buysBack":false,"priceMods":[{"tag":"besieged","mult":1.5}],
 "lists":[{"kind":"component","items":[{"def":"component/autocannon-30","weight":3,"stockMax":2}]},{"kind":"feed","items":[{"def":"stock:feed","weight":1,"stockMax":40}]}]}
```
```json
{"id":"service/medbay","room":"medbay","hpRegenMult":3,"cleanse":{"whitelist":["effect/injury-scar-lung"],"price":{"product":[1500,{"ref":"person.level"}]}}}
```

**招募池**　**背景**
```json
{"id":"recruit/dhaka-camp","node":"node/dhaka","size":4,"refreshOn":"quarter","sources":[{"background":"background/refugee-kid","weight":5}]}
```
```json
{"id":"background/refugee-kid","name":"難民孩子","culture":"bengal","attrRanges":{"resolve":[40,60],"beastKin":[50,80]},"hireFee":{"pick":[80,160]},"wageMult":{"pick":[0.7,0.9]}}
```

**科研**　**工種係數**　**命名表**
```json
{"id":"research/soul-calc-2","name":"算·戰場預判","direction":"soul-calc","cost":{"coin":900,"techHours":80},"requires":["research/soul-calc-1"],"unlocks":[{"kind":"soul-node","id":"soulnode/calc-foresight"}]}
```
```json
{"id":"job/repair","kind":"repair","hoursPerHp":{"armor":0.5,"chitin":0.8,"flesh":1.2,"organ":2},"material":{"armor":"stock:scrap","chitin":"stock:chitin","flesh":"stock:flesh"},"rebuildMult":{"hours":3,"material":2}}
```
```json
{"id":"names/mythic-norse","culture":"norse","names":["Sleipnir","Gungnir","Fenrir"],"epithets":["之殼"]}
```

**事件**　**房間片語**
```json
{"id":"event/funeral","where":"ship","when":{"all":[{"flag":"pilot-died-today"}]},"weight":100,"text":"{dead.name} 被捲進防火毯，從貨艙口推出去。",
 "choices":[{"text":"說幾句話。","effects":[{"mood":{"all":1}}]},{"text":"回去工作。","effects":[{"techHours":4}]}]}
```
```json
{"id":"room/stable","title":"獸欄","base":["低矮、潮濕，鐵鍊從天花板垂下來。"],"exits":["hangar","cargo"],
 "phrases":[{"when":{"all":[{"penCount":0}]},"text":"欄是空的。"},{"when":{"any":[{"penHunger":{">=":50}}]},"text":"{pen.name} 在抓欄門。"}]}
```

**對白**　**事件文字模板**
```json
{"person":"person/a-jiu","topics":[{"topic":"達卡","when":{"all":[{"contractOffered":"contract/clear-nest"}]},"lines":["廠房窄，蟲會擠在一起……適合拘束。"],"effects":[{"mood":{"person/a-jiu":1}}]}]}
```
```json
{"WageOwed":{"kind":"warn","text":"付不出薪水，全團欠 {amount} 幣（第 {days} 天）。"},"Named":{"kind":"soul","text":"{by.name} 叫它「{name}」。"}}
```

**開局**
```json
{"id":"start/default","day":0,"node":"node/dhaka","ship":"ship/migrant-bird","cash":1200,"debt":24000,"mechs":["frame/plough-mk1","frame/plough-mk1","frame/patchwork"],
 "persons":["person/a-jiu","person/iron-aunt","person/rusty-soul"],"stocks":{"stock:feed":6,"stock:fuel":40},"tickets":{"restraint":4},"flags":["opening-funeral"]}
```

## 新增 X 要改哪些檔

一座城：`nodes/`＋一條 `routes/`，可選 `markets/`、`recruit-pools/`、`factions-ops/`、`rooms/`。一種契約：`contracts/`＋發它的 `actions/`。一族裂縫：core 先有 `species/`，再 `rifts/<family>.json`＋每深度一個 `encounters/`。一條事件鏈：`events/` 用 `next` 串。一種文化的命名：`names/mythic-<culture>.json`，背景填 `culture`。零程式。

## 替使用者做掉的決定

1. **`world/` 住在同一個 pack 內**：mod 一包同時改戰場與世界。
2. **ops 的 `Cond` 詞彙自己登記**：與 core 同形、不同詞彙表，schema 各自驗。
3. **開局是資料檔**：換開局＝換一個 json，測試用固定開局。
4. **`{dead.name}` 插值**：最小模板語法，不引入模板引擎。
5. **市場列直接寫 `stock:feed`**：可數的東西不另造 ItemDef。
