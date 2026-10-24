# cx-content-world 完成回報

## 做了什麼

依凍結契約 §0、§2 新建 31 個 JSON：蟲族三族與三個個體、四個 AI 設定、四種地形、八個效果、摹機魂樹、五名人物與三個勢力。巢母保留子體生成與母亡繫結；手套只帶契約指定的三項 perk，灰保留陪伴成長。

每寫完一類均執行 `npm run check` 與 `wf/tools/inbox_poll.sh cx-content-world --once`。最後一次內容檢查 exit 0，零錯誤、零警告。指定 31 檔均存在，檔名及 id 與契約一致，合計 16,121 bytes，未超過 200 KB。

本線只新增以下 31 個內容檔及本 REPORT（另有交接書要求的 inbox 回報）；未修改任何既有檔、未 commit，未追加驗收項目。

## 產出（31 個檔的清單）

以下路徑相對專案根目錄：

```text
content/base/aiprofiles/glove-line.json
content/base/aiprofiles/nest-anchor.json
content/base/aiprofiles/reaper-vanguard.json
content/base/aiprofiles/swarm-mite.json
content/base/effects/erosion-gnaw.json
content/base/effects/perk-soul-calc-1.json
content/base/effects/perk-soul-calc-2.json
content/base/effects/perk-soul-hand-1.json
content/base/effects/perk-soul-heart-1.json
content/base/effects/trait-beast-sense.json
content/base/effects/trait-copied.json
content/base/effects/trait-steady-hands.json
content/base/factions/migrant-crew.json
content/base/factions/rift-insects.json
content/base/factions/selene-whitegloves.json
content/base/monsters/mite-d.json
content/base/monsters/nestmother-landlord.json
content/base/monsters/reaper-c.json
content/base/persons/ash.json
content/base/persons/chen-xiaohai.json
content/base/persons/glove.json
content/base/persons/ilse-brandt.json
content/base/persons/mara-okoye.json
content/base/soultrees/moji-std.json
content/base/species/mite.json
content/base/species/nestmother.json
content/base/species/reaper.json
content/base/terrains/erosion.json
content/base/terrains/rubble.json
content/base/terrains/ruin-wall.json
content/base/terrains/shallows.json
```

REPORT：`wf/workflows/dispatch/handoffs/lead-impl-content-base/cx-content-world/REPORT.md`。

## 沒做到或證據不足的

無。本次證據限於交接書固定驗收：內容檔、載入檢查與 REPORT；合併後由領導重跑檢查。過程中其他線逐批寫入造成的暫時參照與 charge 池錯誤，最後一次檢查已全部消失。

## 需要決定的事

無。

## SPEC-GAP 清單

無；契約要求的欄位均可用既有 schema 表達。

最後一次 `npm run check` 輸出（exit 0）：

```text
> mecha-srpg@0.1.0 check
> node src/content/loader.ts content/base

pack base 0.1.0
frame: 7
bodyplan: 7
component: 1
ability: 14
effect: 20
person: 7 (human 4, soul 3)
soultree: 2
terrain: 5
faction: 3
species: 4
monster: 3
aiprofile: 5
curve: 1
registries: 7/7
rules: 4/4
OK 0 errors, 0 warnings
```
