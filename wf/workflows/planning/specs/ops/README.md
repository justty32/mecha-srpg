# ops — 營運層 spec（第一版）

[planning](../../../planning.md)｜裁示原文 [design-notes](../../design-notes.md)｜決策 [decisions](../../../decisions.md)｜世界觀 [world](../world/README.md)｜核心引擎 [core](../core/README.md)

核心引擎 spec 只管一場戰鬥；本 spec 管**戰鬥之間的一切**：方格大地圖與浮船、勢力與聲望、裂縫與蝕域、契約、帳本與市場、科研與機魂練熟、修理與拘束艙（生物系的活捕／屍體改裝、磨損與失控）、人員、蝕月時鐘、與戰鬥層的接口、指令語意層與呈現契約（按鈕、列表、面板、快捷鍵）、內容格式、`src/ops/` 的邊界與測試。讀完要能切線實作。不可違反的裁示抄在 `constraints-ops.json`（wf-table/1，每列有來源與對應節，查法見 common 的資料檔契約）。**數值只給量級**；劇情文本、數值平衡、SS／SSS、戰鬥規則不在這裡。

目標與非目標、模組圖、讀法（切線順序）在 [overview.md](overview.md)。

## 一句話模型

**獵團**（名冊＋浮船）在**方格大地圖**（每大洲一張＋月面）上一格一格移動，每天 `tick()` 結算世界、船務與帳本；玩家開著浮船去任何想去的格與地點（沙盒、無主線門），路上會與勢力部隊、商隊、裂獸群、別的獵團**遭遇**，用 27 個動詞（按鈕與快捷鍵的語意）看、談、接、派、修、壓、投、陪、航、泊、探、喚、出戰；**裂縫**是會長的狀態機，**契約**是對它的反應，**帳本**是所有錢與存量的唯一入口；出戰把營運狀態以 Effect 注入情境，戰果以 `BattleResult` 回寫。

## 與 core 的接口一句

營運層把 `Sortie` 翻成 `ScenarioDef`（含注入的 Effect）交給 `sim.runBattle`，只拿 `BattleResult` 回寫；core 型別（`MechState`、`PersonState`、`PoolDecl`、`Effect`、`Cond`、`NumExpr`）原樣沿用，不複製一套。

## 子檔導航

<!-- wf-nav -->
| 檔 | 回答什麼 |
|---|---|
| [overview.md](overview.md) | 目標與非目標、模組圖、讀法（切線順序） |
| [world-grid/](world-grid/README.md) | **方格大地圖**：六張圖與尺度、地形層與迷霧、地點 PlaceDef、航道 LaneDef、移動點與尋路、行動者與遭遇、蝕塊擴散、遷移對照、大地圖 UI |
| [data-model-world-map.md](data-model-world-map.md) | 裂縫七態狀態機、蝕壓、浮船 ShipState、遺跡入口、渡月船併入航道（節點／路線兩節已標取代） |
| [data-model-factions-contracts.md](data-model-factions-contracts.md) | FactionOpsDef 與逐勢力聲望、契約模板與生命週期、談判、世界行動牌、競爭獵團；子檔 [contracts](data-model-factions-contracts/contracts.md)（契約與談判） |
| [data-model-economy-research.md](data-model-economy-research.md) | 帳本（唯一入口、守恆）、庫存、市場與價格、債與催收、科研、機魂「開／練熟」、育魂 |
| [data-model-roster-repair.md](data-model-roster-repair.md) | 名冊、薪水與 mood、招募、休養、工時佇列（修理／重建／移植／育魂／拘束維護）、機庫、古代機甲的認主與命名 |
| [data-model-beasts.md](data-model-beasts.md) | 生物系營運：拘束艙、活捕（磨損、失控、同調、族行為）、族別維持（吞屍／蝕浸／修剪）、屍體改裝、登記號／小名／凶名／二名 |
| [time-and-tick.md](time-and-tick.md) | 曆、tick 八段順序、大潮與弦月、跨日逐日補算、長程時鐘量級、終局 |
| [battle-interface.md](battle-interface.md) | 出戰編成→情境生成→戰果回寫（回寫欄位清單）、與 core 的差異；子檔 [apply-result](battle-interface/apply-result.md)（戰果回寫） |
| [text-ui-contract.md](text-ui-contract.md) | OpsCommand 語意層（27 個動詞）、快捷鍵 keymap、房間與狀態片語、對白與事件、`Screen` 按鈕／列表契約、戰場入口；子檔 [presentation](text-ui-contract/presentation.md)（房間、對話、`Screen`、戰場入口） |
| [content-format-ops.md](content-format-ops.md) | `content/<pack>/world/` 佈局（含 maps／places／lanes／actors／lineages／models／operations／treaties）、「新增 X 要改哪些檔」；JSON 範例分三個子檔 |
| [architecture-ops.md](architecture-ops.md) | `src/ops/` 模組與依賴、CampaignState 與事件、重播、存檔、六類 headless 測試 |
| [data-model-operations-war.md](data-model-operations-war.md) | 勢力自主作戰：常備軍與分遣隊（地圖上會動）、作戰十種、階段、抽象結算、tick 第 2 段順序、古代機的爭奪；子檔 [resolution](data-model-operations-war/resolution.md)（抽象結算、參戰、tick 順序、後果詞彙） |
| [data-model-diplomacy.md](data-model-diplomacy.md) | 勢力間關係值＋六態、條約（停火／同盟／代理…）、變化驅動、防退化三閘、與 core 戰場陣營的銜接 |
| [mercenary-contracts.md](mercenary-contracts.md) | 參戰型契約 `join`：友軍 slot 與指揮權三式、勢力補給四檔、軍令與結算、選邊與背叛、作戰情境生成 |
| [data-model-faction-rnd.md](data-model-faction-rnd.md) | 勢力研發推進：藍本血統、通用系列、ModelDef 機型池隨時間擴大（部隊／市場／敵方）、技術流出 |
| [war-testing.md](war-testing.md) | 上四檔的 headless 測試：單元、24 蝕月模擬、不退化不變量、五條黃金戰役 |

資料檔：`constraints-ops.json`（不可違反清單，欄位 `id`／`source`／`constraint`／`spec_section`／`note`）、`operations-kinds.json`（作戰十種）、`diplomacy-drivers.json`（外交驅動 17 列）、`world-grid/continents.json`（六張圖）、`world-grid/terrain-layers.json`（大地圖地形 14 列）。用語照 `content/lore/style.md`（太空歌劇）：機制識別字不改（`heat`、`charge`、`fuel`…），顯示名與敘述用風格名，對照表在 [core README](../core/README.md)。

## 替使用者做掉的決定

本檔無；各子檔見各自結尾，彙整在規劃線 REPORT。
