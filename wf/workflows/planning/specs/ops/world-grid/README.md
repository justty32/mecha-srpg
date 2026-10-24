# world-grid — 方格大地圖：每大洲一張、船自由行動、格上地點與移動物件

[ops README](../README.md)｜裁示原文 [design-notes/world](../../../design-notes/world.md)（2026-10-24 末段「大地圖方格化、自由行動」「可以每大洲一張地圖」）｜時鐘 [time-and-tick](../time-and-tick.md)｜作戰的位置型別 [data-model-operations-war](../data-model-operations-war.md)｜戰場方格 [core/data-model-world](../../core/data-model-world.md)

裁示：營運層的世界圖**本身也是方格**，船（獵團）在格上自由移動、時間隨移動流逝；城市、港口、裂縫、遺跡、據點、作戰中的部隊是格上位置或移動物件；可在野外遭遇、追擊、迴避；**每大洲一張地圖**（月面另成一張），洲際以渡輪／航線切換；沙盒、無主線門；太空歌劇風格。本資料夾**取代** `data-model-world-map.md` 的「節點／路線」兩節（其餘：裂縫七態、蝕壓、浮船房間、遺跡入口、渡輪沿用，位置欄改格；既有 ops 檔已於 2026-10-24 整合，`transferNode`→`transferPlace`、`NodeTransferred`→`PlaceTransferred`）。數值只給量級；程式碼、內容、lore、world／core spec 不在這裡。尺度詞照 `content/lore/style.md`：文本只說「格」與「天」，不說公里。

## 一句話模型

世界是**六張方格圖**（五大洲＋月面；南極「白淵」已被蝕潮吞沒、只在 lore）。每張圖有靜態**地形層**（內容檔，字元圖＋圖例、逐列 RLE）、動態**蝕域層**（存檔，裂縫一塊塊「蝕化」的格群）、**地點**（城邦、港、遺跡、據點、裂縫口——格上物件，取代節點）與**行動者**（勢力部隊、巡邏、商隊、裂獸群、別的獵團、你的船——每天用移動點在格上走）。船每天拿一份移動點、照 A\* 路徑走，每過一天照常跑 tick 八段；兩個行動者碰到接觸範圍就是**遭遇**，選迴避／追擊／交涉／開打，開打才由 ScenarioGen 用那一格的地形、蝕深與周圍物件生成戰場。洲際靠**航道**（陸橋、海航、渡月船軌道）接到另一張圖。

## 子檔導航

<!-- wf-nav -->
| 檔 | 回答什麼 |
|---|---|
| [map-and-terrain.md](map-and-terrain.md) | 六張圖與尺度（一格＝船一天航程的十分之一、120–250 格邊長）、地形層與區域層、可視區與天網迷霧、地點 PlaceDef、航道 LaneDef、內容檔格式（字元圖＋RLE） |
| [movement.md](movement.md) | 船的移動：移動點、八方向 A\*、速度受地形／船況影響、與 tick 的銜接（每天一段）、中途停下與改道、燃料、徒步與月面 |
| [actors-and-encounters.md](actors-and-encounters.md) | 行動者 ActorState 與五種簡化 AI、接觸範圍、遭遇四選（迴避／追擊／交涉／戰鬥）、ScenarioGen 從格生成戰場 |
| [rifts-on-grid.md](rifts-on-grid.md) | 裂縫落在格上、蝕域以「蝕塊」擴散／收縮、深度、城邦失守、新裂縫落點、蝕壓對照 |
| [migration-and-testing.md](migration-and-testing.md) | 節點→地點、路線→尋路的遷移、哪些 ops 模組要改、存檔欄位、headless 測試策略（尋路、時間守恆、N 蝕月不退化） |
| [ui-contract.md](ui-contract.md) | 大地圖畫面：沿用戰場的方格渲染（可視區、縮放、捲動、高亮），大地圖專屬圖層與快捷鍵、`sail` 參數擴充 |

資料檔：`continents.json`（六張圖：名字、舊名、尺寸、迷霧模式、蝕核、出口）、`terrain-layers.json`（大地圖地形：移動成本、視野、遭遇、對應戰場地形池）。欄位說明見各自 md 的「資料檔」段。

## 與既有 ops spec 的關係

`Loc = { map; region; cell }`（operations-war 已預留）在本版定死：`map`＝六張圖之一、`region`＝區域層的格群 id（給契約與文字用）、`cell`＝真位置。契約 `target.node`→`target.place`；`Sortie.node`→`Sortie.loc`；渡輪 `FerryDef` 併入 `LaneDef`（`kind:"orbital"`）；`ShipState.at`→`pos: Loc`＋`path`。蝕域從「節點狀態」改為「格群（蝕塊）」，裂縫狀態機七態不變。整合既有檔的清單在規劃線 REPORT。

## 讀法與切線

先 [map-and-terrain](map-and-terrain.md) 與 [movement](movement.md)（型別與尋路，可先用一張 40×40 測試圖落地），再 [rifts-on-grid](rifts-on-grid.md)（改 `ops/world/rifts`）、[actors-and-encounters](actors-and-encounters.md)（新模組），最後 [ui-contract](ui-contract.md)。切線順序與測試在 [migration-and-testing](migration-and-testing.md)。

## 替使用者做掉的決定（總表前五；各子檔結尾另有）

1. **一格＝十分之一日程、八方向、移動點制**：長陸 250 格寬、船一天 8–10 格 → 橫跨一洲約一蝕月，與既有「趕漲潮」節拍相合（2026-10-24 晚：每月兩次的潮改叫漲潮）。
2. **地形永遠看得見、物件與蝕域才有迷霧**（天網模式）：2108 還有星哨，不該讓玩家去「探索地球」；月面背面與霧陸北部是真迷霧。
3. **蝕域以「蝕塊」為單位長退**（7–12 格一塊）：「退一區」「每漲潮蝕化 N 區」原句不用改，只是區變成格群。
4. **洲際不自己飛、走航道**：圖與圖之間的海洋不畫格，船走固定航道（天數、票價或燃料），渡月船是其中一種航道。
5. **不加動詞**：`sail` 的 `to` 可以是地點、格或行動者（追擊＝航向會動的目標），迴避＝`drift`，交涉＝遭遇 `prompt`＋`choose`，27 個動詞不變。
