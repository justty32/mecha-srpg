# content-format-ops／crew-text — 市場、服務、招募、背景、科研、工種、命名、族別、事件、房間、對白、模板、鍵位、開局

[content-format-ops 入口](../content-format-ops.md)｜型別在 [data-model-economy-research](../data-model-economy-research.md)、[data-model-roster-repair](../data-model-roster-repair.md)、[data-model-beasts](../data-model-beasts.md)、[text-ui-contract](../text-ui-contract.md)

**市場**（`ammo` 列：`def` 是矢池 id、價是每矢單價，停泊時補滿）　**服務**
```json
{"id":"market/dhaka","place":"place/dhaka","refreshOn":"quarter","buysBack":false,
 "lists":[{"kind":"component","items":[{"def":"component/autocannon-30","weight":3,"stockMax":2}]},{"kind":"ammo","items":[{"def":"ammo-30","weight":1,"stockMax":200,"price":2}]},
          {"kind":"material","items":[{"def":"stock:flesh","weight":1,"stockMax":40}]}]}
```
```json
{"id":"service/medbay","room":"medbay","hpRegenMult":3,"cleanse":{"whitelist":["effect/injury-scar-lung"],"price":1500}}
```

**招募池**　**背景**（`beastKin` 獸緣、`shellKin` 殼緣目前是背景的屬性範圍，升格與否見規劃線 REPORT）
```json
{"id":"recruit/dhaka-camp","place":"place/dhaka","size":4,"refreshOn":"quarter","sources":[{"background":"background/refugee-kid","weight":5}]}
```
```json
{"id":"background/refugee-kid","name":"難民孩子","culture":"bengal","attrRanges":{"resolve":[40,60],"beastKin":[50,80]},"hireFee":{"pick":[80,160]}}
```

**科研**　**工種係數**　**命名表**
```json
{"id":"research/soul-calc-2","name":"算·戰場預判","direction":"soul-calc","cost":{"coin":900,"techHours":80},"unlocks":[{"kind":"soul-node","id":"soulnode/calc-foresight"}]}
```
```json
{"id":"job/repair","kind":"repair","hoursPerHp":{"armor":0.5,"chitin":0.8,"flesh":1.2,"organ":2},"material":{"armor":"stock:scrap","chitin":"stock:chitin","flesh":"stock:flesh"},"rebuildMult":{"hours":3,"material":2}}
```
```json
{"id":"names/mythic-norse","culture":"norse","names":["Sleipnir","Gungnir","Fenrir"],"epithets":["之殼"]}
```

**族別拘束／維持**
```json
{"id":"beasts/insect","family":"insect","restraint":["component/shell-pin"],"wearPerDay":{"D":3,"C":5,"B":8,"A":15},"registryPattern":"蟲-{n}",
 "sustain":{"kind":"devour","stock":"stock:flesh","amount":{"D":1,"C":2,"B":4,"A":8}}}
```

**事件**（`where`：`place`／`field`／`lane`／`ship`／`ruin`）　**房間片語**
```json
{"id":"event/funeral","where":"ship","when":{"all":[{"flag":"pilot-died-today"}]},"weight":100,"text":"{dead.name} 被捲進防火毯推出貨艙口。",
 "choices":[{"text":"說幾句話。","effects":[{"mood":{"all":1}}]},{"text":"回去工作。","effects":[{"techHours":4}]}]}
```
```json
{"id":"event/drift-whiteglove","where":"field","when":{"all":[{"shipDrifting":true},{"terrain":"wterrain/tidesea"}]},"weight":30,"text":"一艘白得發亮的船從雲裡降下來。「請確認償還意願。」",
 "choices":[{"text":"付一期利息。","requires":{"cashAtLeast":{"ref":"ledger.interestDue"}},"effects":[{"ledger":{"account":"cash","delta":{"ref":"ledger.interestDue","neg":true}}}]},{"text":"關掉天網。","effects":[{"rep":{"faction":"faction/selene-whitegloves","delta":-10}}],"next":"event/collection-visit-1"}]}
```
```json
{"id":"room/restraint","title":"拘束艙","base":["低矮、潮濕，拘束架的鐵鍊從天花板垂下來。"],"exits":["hangar","cargo"],
 "phrases":[{"when":{"all":[{"beastCount":0}]},"text":"拘束架是空的。"},{"when":{"any":[{"beastWear":{">=":50}}]},"text":"{beast.name} 在撞拘束架。"}]}
```

**對白**　**事件文字模板**
```json
{"person":"person/a-jiu","topics":[{"topic":"達卡","when":{"all":[{"contractOffered":"contract/clear-nest"}]},"lines":["廠房窄，蟲會擠在一起……適合拘束。"],"effects":[{"mood":{"person/a-jiu":1}}]}]}
```
```json
{"WageOwed":{"kind":"warn","text":"付不出薪水，全團欠 {amount} 幣（第 {days} 天）。"},"Named":{"kind":"soul","text":"{by.name} 叫它「{name}」。"},"Sighted":{"kind":"warn","text":"殼目看見 {actor.name}，在 {dir} 方 {dist} 格。"}}
```

**鍵位**（與戰場 `keymap.json` 同文法，多 `context`：`room`／`prompt`／`map`）　**開局**（與 `content/base/world/campaign-start/default.json` 同形）
```json
{"id":"keymap/ops","bindings":[{"action":"go:hangar","keys":["F2"],"label":"機庫","context":"room"},{"action":"sail:cursor","keys":["Enter"],"label":"航向游標","context":"map"},{"action":"choose:1","keys":["1"],"label":"選 1","context":"prompt"}]}
```
```json
{"id":"start/default","day":0,"place":"place/dhaka","ship":"ship/migrant-bird","calendar":"calendar/tide","cash":1200,"debt":24000,
 "mechs":[{"frame":"frame/moji-tern-guard","components":{"right-weapon":"component/autocannon-30","left-weapon":"component/arc-emitter"}},{"frame":"frame/hound-mk2","components":{"right-weapon":"component/autocannon-30"}}],
 "persons":[{"role":"pilot","wage":70,"def":"person/ren-kasai"},{"role":"technician","wage":90,"def":"person/mara-okoye"},{"role":"crew","wage":50,"def":"person/glove"}],
 "stocks":{"stock:fuel":40,"stock:scrap":20},"tickets":{"airstrike":0,"restraint":4},"flags":["opening-funeral"],"pressure":0}
```
