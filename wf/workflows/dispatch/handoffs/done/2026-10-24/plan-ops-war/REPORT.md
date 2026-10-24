# REPORT — plan-ops-war：勢力自主作戰、外交、傭兵參戰與補給、勢力研發推進（spec）（頂層代存，2026-10-24）

STATUS：**DONE**，commit `2ced432`（13 檔）。中途吃進頂層五次補充裁示（古代機爭奪／研發藍本、研發隨時間推進、通用系列、太空歌劇風格、方格大地圖＋每大洲一張）。

## 一、檔案（`wf/workflows/planning/specs/ops/`）
新增：`data-model-operations-war.md`、`data-model-diplomacy.md`、`mercenary-contracts.md`、`data-model-faction-rnd.md`、`war-testing.md`、`operations-kinds.json`（10 列）、`diplomacy-drivers.json`（17 列）。
修改：`README.md`、`constraints-ops.json`（61→68：DN-W-16～20、USR-10 風格、USR-11 方格大地圖）、`time-and-tick.md`（2a～2f）、`battle-interface.md`（`Sortie.trigger:"operation"`、ScenarioGen 第 7 步）、`data-model-factions-contracts.md`（`kind:"join"`）、`architecture-ops.md`（`ops/war` 模組）。`content-format-ops.md` 已近 8 KB 未動，新資料夾佈局寫在 rnd 檔末節。

## 二、核心設計
- **作戰**：`FactionState.forces`（戰力點 D1／C3／B9／A27，每潮月補員）；行動牌切出分遣隊（地圖物件 `ActorState`）走 muster→march→engage→resolve→aftermath；engage 日以 √(戰力比) 抽象結算，補給歸零退兵；玩家參戰當天進戰術戰鬥，勝一場進度 +0.4。十種作戰；古代殼是世界物件 `ShellState`，尋殼／失殼停研。位置經 `Loc { map, region, cell? }` 與 world-grid 對齊。
- **外交**：每對勢力 `Relation { value −100..100, 六態, treaties, grievances, weariness, baseline }`；數值＋滯後，`war` 需宿怨或宣戰牌、`allied` 需盟約；條約七種；驅動 17 列；防退化三閘（漂移、厭戰、同盟負擔）。玩家只用 rep，不進關係表。
- **參戰**：`kind:"join"`＋`JoinTerms`（指揮權 independent／attached／mixed、補給 none／field／full／arsenal、分成＋出場費、軍令、exclusive、借機）；補給為營運層外源入帳、守恆照跑；三種可判定背叛 → rep −40、殘聯 −15、blacklist；代理戰爭曝光機率。不加動詞與房間。
- **研發**：`LineageDef`（源自殼或 `generic`）＋`ModelDef`（maker、series、mark、role、tier、cost、requires、availableFrom、exportPolicy、generic），core `FrameDef` 不改；每潮月研發點推進與釋出；部隊／市場／敵方情境從已釋出池抽；隊長機只從勝仗誕生；取殼 2 潮月後開新血統；技術流出四來源；通用「堅盾」「長槍」為共同底層。

## 三、替使用者做掉的決定（前 5）
1. 作戰是行動牌效果、分遣隊是地圖物件、√ 戰力比抽象結算，玩家一場 0.4 進度。
2. 外交值＋滯後六態，戰爭與同盟要憑證；防退化用三閘。
3. 玩家不進勢力關係表，選邊後果落在逐勢力 rep；參戰是契約的一種，27 動詞不變。
4. 指揮權三式、玩家不碰友軍 AI。
5. ModelDef 與 FrameDef 分家、市場列篩選器、隊長機只從勝仗出、玩家轉賣是流出來源。

## 四、實作切線
1. ops-war-core：`src/ops/war/{loc,forces,operations,resolve}.ts`、`world/{operations/,forces/replenish.json}`、tick 2c。
2. ops-diplomacy：`src/ops/war/{relations,treaties,drivers}.ts`、`treaties/`、`affinity.json`、tick 2b。
3. ops-merc：contracts `join`、補給、借機、`scenario.ts` 第 7 步、`apply.ts` 回寫、政策 `merc`、黃金 `ops-merc-join`／`ops-betrayal`。
4. ops-rnd：`src/ops/war/{lineages,models,rnd}.ts`、`lineages/`、`models/`、市場篩選器、`leakModel`、tick 2f。
5. ops-war-sim：`war-testing.md` 不變量與五條黃金。
順序 1→2→(3∥4)→5；1、2 可用 `Loc.region＝節點 id` 先做。

## 五、需要裁示（頂層 2026-10-24 處理）
- core 建議：(a) `BattleResult.units` 涵蓋所有 slot（含 ally）；(b) 沿用 `UnitSpawn.effects?`；(c) `FrameDef` 可選 `series?`／`mark?` → 三條都採用，交實作線（只新增可選欄）。
- `content-format-ops.md` 已滿 → 拆資料夾型，交 world-grid 整合線。
- `transferNode`／`NodeTransferred` 改名 → 交 world-grid 整合線。
- 太空歌劇風格改寫清單（spec 與內容）：`world/setting.md`、`world/README.md`、`world/factions.md`、`world/operations.md`、`world/opening.md`、`world/machine-souls.md`、`world/monsters.json`、「電能」池名散見 world／core／design-notes、`ops/data-model-economy-research.md`（氦與電）、`ops/constraints-ops.json` WV-03、`content/base/components/arc-emitter.json`、`abilities/arc-pulse.json` → 交風格改寫線。
