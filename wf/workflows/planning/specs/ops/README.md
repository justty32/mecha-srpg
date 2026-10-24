# ops — 營運層 spec（第一版）

[planning](../../../planning.md)｜裁示原文 [design-notes](../../design-notes.md)｜決策 [decisions](../../../decisions.md)｜世界觀 [world](../world/README.md)｜核心引擎 [core](../core/README.md)

核心引擎 spec 只管一場戰鬥；本 spec 管**戰鬥之間的一切**：世界圖與浮船、勢力與聲望、裂縫與蝕域、契約、帳本與市場、科研與機魂練熟、修理與獸欄、人員、潮月時鐘、與戰鬥層的接口、文字介面契約、內容格式、`src/ops/` 的邊界與測試。讀完要能切線實作。不可違反的裁示抄在 `constraints-ops.json`（wf-table/1，每列有來源與對應節，查法見 common 的資料檔契約）。**數值只給量級**；劇情文本、數值平衡、SS／SSS、戰鬥規則不在這裡。

## 目標與非目標

**目標**：(1) 一個純 TS、與 DOM 分離的回合制營運模擬——一天一 tick、二十八天一潮月，世界圖上的裂縫會長、勢力會動、債會到期；(2) 一切內容是資料：節點、路線、裂縫模板、契約模板、事件鏈、對白、房間片語、科研、市場、開局全是 JSON；(3) 與戰鬥層只經 `Sortie → ScenarioDef → runBattle → BattleResult → applyBattleResult` 往來，core 零修改（一欄建議除外）；(4) `OpsCommand` 序列＋seed 可在 node 裡重播整場戰役、跑 N 個潮月不拋錯、帳本守恆可斷言；(5) 指令列與選單結果恆等。

**非目標**：戰鬥規則（core）；數值平衡；程式碼；劇情文本（只給格式與樣例）；SS／SSS；改 world／core spec（衝突列 REPORT）。

## 一句話模型

**獵團**（名冊＋浮船）在**世界圖**上移動，每天 `tick()` 結算世界、船務與帳本；玩家開著浮船去任何想去的節點（沙盒、無主線門），用 27 個動詞看、談、接、派、修、餵、陪、航、泊、探、喚、出戰；**裂縫**是會長的狀態機，**契約**是對它的反應，**帳本**是所有錢與存量的唯一入口；出戰把營運狀態以 Effect 注入情境，戰果以 `BattleResult` 回寫。

## 模組圖

```mermaid
flowchart LR
  wcontent[ops/content<br/>world/ 載入・WorldDB] --> state[ops/state<br/>CampaignState・Ledger・事件]
  state --> world[ops/world<br/>節點・裂縫・潮壓・行動牌・市場]
  state --> crew[ops/crew<br/>名冊・佇列・機庫・獸欄・科研・練熟]
  state --> contracts[ops/contracts<br/>契約・談判・計功]
  world --> time[ops/time<br/>tick 八段編排]
  crew --> time
  contracts --> time
  time --> sortie[ops/sortie<br/>編成→情境→回寫]
  sortie -. 只經 runBattle／BattleResult .-> sim[(core sim)]
  time --> text[ops/text<br/>parse・Screen・模板]
  sortie --> osim[ops/sim<br/>runCampaign・重播・不變量]
  text --> uiops[ui-ops<br/>DOM 只在這裡]
  uiops -. sortie 交接 .-> uiadapter[(core ui-adapter)]
```

依賴只能往右；`ops/*` 不 import `rules`／`ai`。細節見 [architecture-ops.md](architecture-ops.md)。

## 與 core 的接口一句

營運層把 `Sortie` 翻成 `ScenarioDef`（含注入的 Effect）交給 `sim.runBattle`，只拿 `BattleResult` 回寫；core 型別（`MechState`、`PersonState`、`PoolDecl`、`Effect`、`Cond`、`NumExpr`）原樣沿用，不複製一套。

## 子檔導航

<!-- wf-nav -->
| 檔 | 回答什麼 |
|---|---|
| [data-model-world-map.md](data-model-world-map.md) | 節點與路線、蝕域是節點狀態、裂縫七態狀態機、潮壓、浮船、遺跡入口、地月渡輪 |
| [data-model-factions-contracts.md](data-model-factions-contracts.md) | FactionOpsDef 與逐勢力聲望、契約模板與生命週期、談判、世界行動牌、競爭獵團 |
| [data-model-economy-research.md](data-model-economy-research.md) | 帳本（唯一入口、守恆）、庫存、市場與價格、債與催收、科研、機魂「開／練熟」、育魂 |
| [data-model-roster-repair.md](data-model-roster-repair.md) | 名冊、薪水與 mood、招募、休養、工時佇列（修理／重建／移植／育魂）、機庫、獸欄與族行為、古代機甲的認主與命名 |
| [time-and-tick.md](time-and-tick.md) | 曆、tick 八段順序、大潮與弦月、跨日逐日補算、長程時鐘量級、終局 |
| [battle-interface.md](battle-interface.md) | 出戰編成→情境生成→戰果回寫（回寫欄位清單）、與 core 的差異 |
| [text-ui-contract.md](text-ui-contract.md) | 27 個動詞、房間與狀態片語、對白與事件、`Screen` 輸出契約、戰場入口 |
| [content-format-ops.md](content-format-ops.md) | `content/<pack>/world/` 佈局、每種資料一個 JSON 範例、「新增 X 要改哪些檔」 |
| [architecture-ops.md](architecture-ops.md) | `src/ops/` 模組與依賴、CampaignState 與事件、重播、存檔、六類 headless 測試 |

資料檔：`constraints-ops.json`（不可違反清單，欄位 `id`／`source`／`constraint`／`spec_section`／`note`）。

## 讀法

實作按模組切線：先 `ops/state`＋`ops/content`（型別、帳本、載入器），再 `ops/world` 與 `ops/crew` 並行，`ops/contracts`→`ops/time`→`ops/sortie`，`ops/text` 可與 `ops/time` 並行，`ops/sim` 最後收攏。每個子檔結尾都有「替使用者做掉的決定」，可逐條推翻；推翻後只改該節與 `constraints-ops.json` 對應列。

## 替使用者做掉的決定

本檔無；各子檔見各自結尾，彙整在規劃線 REPORT。
