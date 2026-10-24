# content-format-ops／factions-war — 勢力營運側、契約、行動牌、作戰、條約、血統、機型、補員、親和

[content-format-ops 入口](../content-format-ops.md)｜型別在 [data-model-factions-contracts](../data-model-factions-contracts.md)、[data-model-operations-war](../data-model-operations-war.md)、[data-model-diplomacy](../data-model-diplomacy.md)、[data-model-faction-rnd](../data-model-faction-rnd.md)、[mercenary-contracts](../mercenary-contracts.md)

**勢力營運側**（`territory` 填地點；`roster` 填機型）
```json
{"faction":"faction/dhaka-weavers","scale":"guild","territory":["place/dhaka"],"stance":{"player":0,"bio":-1,"ancient":0,"soul":0,"league":1},
 "contractKinds":["contract/clear-nest"],"services":["market"],"roster":[{"model":"model/bulwark-i","count":6}],"reputationTiers":[{"at":20,"name":"熟客","grants":[]}],
 "naming":{"mechStages":[{"grade":["D"],"pattern":"{code}"},{"grade":["C","B"],"pattern":"{series}-{mark}型"}],"ancient":"mythic-by-finder","flavor":"工會記帳體"}}
```

**契約模板**（清剿；目標由快照 `phase` 決定，見 factions-contracts「清剿打什麼」）　**參戰型**
```json
{"id":"contract/clear-nest","kind":"clear","issuerKinds":["city","guild","league"],"requiresRep":-10,"gradeRange":["D","C","B"],
 "objectives":[{"kind":"eliminate","params":{"tags":["kaiju"]},"whenPhase":["opening"]},{"kind":"eliminate","params":{"killTarget":"anchor"},"whenPhase":["anchored","unanchored"]}],
 "pay":{"base":{"product":[400,{"ref":"rift.widthIndex"}]},"bonus":[{"cond":{"snapshotPhase":"opening"},"amount":{"product":[0.5,{"ref":"pay.base"}]}}]},
 "advanceMax":0.3,"deadlineDays":{"ref":"calendar.daysToNextSpring"},"onComplete":["opseffect/rep-issuer-plus-5"]}
```
```json
{"id":"contract/join-clear","kind":"join","issuerKinds":["state","city","league"],"requiresRep":0,"gradeRange":["C","B","A"],"objectives":[],
 "join":{"command":"attached","supply":"field","share":0.3,"fee":600,"orders":["no-capture"],"exclusive":true,"loan":{"models":["model/bulwark-ii"],"max":1}},
 "pay":{"base":600},"advanceMax":0.5,"deadlineDays":{"ref":"operation.daysLeft"},"onComplete":[],"onFail":[],"onCancel":["opseffect/rep-issuer-minus-40"]}
```

**世界行動牌**（發契約；發起作戰）
```json
{"id":"action/post-clear-contract","actor":"faction","valid":{"all":[{"factionHasTerritoryNear":"anchored"}]},
 "weight":{"sum":[1,{"ref":"faction.threatNearby"}]},"cooldownDays":3,"effects":[{"spawnContract":"contract/clear-nest","near":"territory"}]}
```
```json
{"id":"action/war-clear","actor":"faction","lane":"war","valid":{"all":[{"forceStrRatioAtLeast":0.8},{"supplyAtLeast":40}]},"weight":1,"cooldownDays":12,"effects":[{"startOperation":"operation/clear"}]}
```

**作戰**（`targetSel` 值：`blight-edge`／`rift-core`／`lane`／`enemy-place`／`ruin-shell`／`port`）
```json
{"id":"operation/clear","kind":"clear","actorScales":["state","city","company","guild"],"valid":{"all":[]},"weight":1,"targetSel":"blight-edge","commit":0.7,
 "phases":[{"phase":"muster","days":3},{"phase":"march","days":{"ref":"path.days"}},{"phase":"engage","days":7,"objective":{"kind":"eliminate","params":{"tags":["kaiju"]}}},{"phase":"resolve","days":1},{"phase":"aftermath","days":2}],
 "merc":{"minRep":0,"share":0.15,"supply":"field","slots":2,"sides":"actor"},"onSuccess":[{"recedePatch":{"rift":"$target.rift","count":1}}],"onFail":[{"prestige":-5}],"onAbort":[]}
```

**條約**　**親和基線**（每對勢力的起點與驅動係數）
```json
{"id":"treaty/alliance","kind":"alliance","days":168,"requires":{"minState":"friendly","cond":{"cmp":{"a":{"ref":"relation.value"},"op":">=","b":40}}},"terms":[],"onExpire":[],"breakIf":{"any":[]}}
```
```json
{"id":"affinity/default","pairs":[{"a":"faction/residual-league","b":"faction/tide-faith","baseline":-20,"value":-70,"rivalry":true}],
 "rules":{"drift":2,"decay":0.5,"borderBlight":-4,"sharedThreat":2,"against":-20,"broken":-30,"weariness":1,"truceAt":40}}
```

**血統**　**機型**（`frame` 指既有 core `frames/`；`maker:"generic"`＝通用系列）
```json
{"id":"lineage/universal-bulwark","name":"堅盾系列（通用）","source":"generic","traits":{"partsBias":["torso","shield"],"pools":["heat"],"abilityTags":["guard"],"silhouette":"矮、寬、肩上一面殼","naming":"league"},"tags":["generic"]}
```
```json
{"id":"model/bulwark-ii","frame":"frame/bulwark-ii","lineage":"lineage/universal-bulwark","maker":"generic","series":"堅盾","mark":"II型","role":"line","tier":"C","cost":15,
 "requires":["model/bulwark-i"],"availableFrom":{"month":0},"exportPolicy":"open","generic":true,"tags":[]}
```

**補員與戰力點**（單檔）
```json
{"id":"forces/replenish","replenish":{"state":15,"city":6,"company":10,"guild":2,"band":2,"cult":6},"gp":{"D":1,"C":3,"B":9,"A":27,"S":81},"readiness":0.25,"homeSupply":5,"initialSupply":100,"maxDays":45,
 "shells":[{"id":"shell/xingtian","frame":"frame/ancient-rearguard","holder":"faction/residual-league","awakened":false,"knownBy":[]}]}
```
