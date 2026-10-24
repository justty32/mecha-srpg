# content-format-ops — `content/<pack>/world/` 佈局、id 命名、驗證、「新增 X 要改哪些檔」

[ops README](README.md)｜core 的內容包規則 [core/content-format](../core/content-format.md)（id 格式、覆寫、schema 由 TS 型別產生，全部沿用）｜圖檔格式細則 [world-grid/map-and-terrain](world-grid/map-and-terrain.md)

2026-10-24 由單檔拆成資料夾型：本檔留佈局、規則與導航；每種資料一個 JSON 範例在 `content-format-ops/` 三個子檔（範例省略選填欄，`PoolDecl` 只寫 `max`／`initial`）。用語照 `content/lore/style.md`——`name` 與文本用風格名，id 不受限。

## 佈局（與 core 的 kind 資料夾並列在同一 pack 內）

```
content/<pack>/world/
  calendar.json  ship.json  affinity.json  keymap-ops.json   # 單檔：曆、浮船、外交親和基線、鍵位
  maps/  regions/  places/  lanes/  actors/        # 方格圖（字元圖＋RLE）、區域名、地點（原 nodes/）、航道（原 routes/＋ferry.json）、行動者 AI 表
  rifts/  encounters/                              # 裂縫族模板、戰場生成模板
  factions-ops/  contracts/  actions/              # FactionOpsDef、ContractTemplate、WorldActionDef
  operations/  treaties/  lineages/  models/  forces/   # 作戰十種、條約七種、血統、機型、補員（forces/replenish.json）
  markets/  services/  recruit-pools/  backgrounds/
  research/  jobs/  names/  beasts/                # ResearchDef、job 工時係數、命名表、族別拘束／磨損／維持
  events/  dialogues/  rooms/  templates/          # 事件鏈、對白、房間片語、CampaignEvent→文字
  campaign-start/<id>.json                         # 開局
```

id 沿用 `pack:kind/name`，kind＝資料夾名。schema 由 TS 型別產生；`npm run check` 另驗引用完整性：圖檔每列長度＝width、字元都在圖例、地點座標在圖內且不在雲嶂／潮海（港例外）、航道兩端存在、`fog:"dark"` 的圖至少一個 `charted` 地點；`battle_pool`、`issuerKinds`、事件 `next` 鏈、account 名、`templates/` 覆蓋每個事件型別；`ModelDef.frame` 存在且 `cls:"mechanical"`、`requires` 無環、`lineage.holder` 是活勢力、每個勢力至少能抽到一型（通用保底）。

## 子檔導航

<!-- wf-nav -->
| 檔 | 範例 |
|---|---|
| [content-format-ops/world.md](content-format-ops/world.md) | 曆、浮船、方格圖、區域、地點、航道（含渡潮船）、行動者 AI 表、裂縫族模板、戰場生成模板 |
| [content-format-ops/factions-war.md](content-format-ops/factions-war.md) | 勢力營運側、契約（含參戰 `join`）、世界行動牌、作戰、條約、血統、機型、補員、親和基線 |
| [content-format-ops/crew-text.md](content-format-ops/crew-text.md) | 市場（含 `ammo` 列）、服務、招募池、背景、科研、工種、命名表、族別、事件、房間片語、對白、事件文字模板、鍵位、開局 |

## 新增 X 要改哪些檔

一座城：`places/`（座標落在某張 `maps/`）；可選 `markets/`、`recruit-pools/`、`factions-ops/`、`rooms/`，`regions/` 補區域名；是港就加一條 `lanes/`。一張圖：`maps/<map>.json`＋`regions/<map>.json`＋至少一個 `charted` 地點＋一條出口航道。一種契約：`contracts/`＋發它的 `actions/`。一族裂縫：core 先有 `species/`，再 `rifts/<family>.json`＋每深度一個 `encounters/`＋`actors/swarm-<family>.json`。一種作戰：`operations/<kind>.json`＋發它的 `actions/`。一條血統：`lineages/`＋至少一個 `models/`；一型機：`models/`（指既有 core `frames/`）。一條事件鏈：`events/` 用 `next` 串。一種文化的命名：`names/mythic-<culture>.json`，背景填 `culture`。一族的生物系營運：`beasts/<family>.json`；A 級個體的二名在 core `monsters` 填 `epithet`。零程式。

## 替使用者做掉的決定

1. **`world/` 住在同一個 pack 內**：mod 一包同時改戰場與世界。
2. **ops 的 `Cond` 詞彙自己登記**：與 core 同形、不同詞彙表，schema 各自驗。
3. **開局是資料檔**：換開局＝換一個 json，測試用固定開局。
4. **`{dead.name}` 插值**：最小模板語法，不引入模板引擎。
5. **市場列直接寫 `stock:flesh` 等帳名**：可數的東西不另造 ItemDef；沒有飼料帳，屍體就是材料。
6. **範例拆三子檔、本檔留入口**（2026-10-24）：佈局與規則一處可查，範例可以長；外部連結不斷。
