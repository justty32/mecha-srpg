# lead-content-battle REPORT — 戰場內容堆料（地形／地圖／情境／AI 設定）（頂層代存，2026-10-24）

一覽表 [catalog.json](catalog.json)（wf-table/1，73 列，含每情境 seed 1/2/3 結果）｜工人報告 [cx-bat-field](cx-bat-field/REPORT.md)、[cx-bat-scen-a](cx-bat-scen-a/REPORT.md)、[cx-bat-scen-b](cx-bat-scen-b/REPORT.md)、[cx-bat-scen-c](cx-bat-scen-c/REPORT.md)

## 做了什麼
四個 codex 工人（gpt-6-astra）：`cx-bat-field`（地形＋效果＋地圖，含 python 產生器）、`cx-bat-scen-a`／`-b`（各 8 情境）、`cx-bat-scen-c`（6 個用 mech／monster 新單位的情境）；勢力 7、AI 設定 6 由領導自寫。參戰型為主、太空歌劇風格兩則裁示已落實。件數 73 > gate 70 收線。commit `fee6916`、`1e7c689`、`9dfff4e`、`2f39f61`、`0e5cb29`。

## 產出（73）
| 類別 | 件數 | 說明 |
|---|---|---|
| terrains | 17 | 四族深蝕、月面、潮間、廢城、路障、補給碑；可破壞 5 種 |
| effects `bf-*` | 6 | 首次引用 `battle.tide`、`battle.light` |
| maps | 15 | 16×16～80×20 與一張 128×128；5 張光照、3 張潮汐 |
| factions | 7 | 第七哨、達卡紡織公會、潮信會、鐵砧、鹽鷗、殼學會、殘聯蝕線守備隊 |
| aiprofiles | 6 | focus-fire、guerrilla、bodyguard、sniper-perch、tide-cultist、convoy-runner |
| scenarios | 22 | 參戰型 14、勢力交火／下注 3、三方以上混戰 5、人對人 3；目標涵蓋 eliminate／killTarget／hold／escort／reachExit／survive |

最得意：荒原群王的獵宴（`badlands-sweep`，128×128）、剜去深淵之心（`nest-core-assault`）、折翼天橋・雙旗賭命（`overpass-wager`）、灰燼渦・三王無冠（`crater-three-way`）、退潮之喉／潮神裂渠（潮汐曲線）。

## 驗證
66 筆 measure 全不拋錯：有勝方 34、20 輪 timeout 32。乾淨 worktree：check 0、`npm test` 476/476、typecheck 綠；lint 只剩 legacy 兩個既有壞連結。

## 平衡
- 既有 `moji-tern`、`hound-mk2` 無內建能力且 `UnitSpawn` 無裝配欄 → 情境中空手（黃金 `skirmish-whitegloves` 白手套不開火）。
- timeout 多：measure 固定 20 輪、AI 不守點／不護送／不追斬首；hold 6 筆 0 達成、escort 15 筆 1 達成。
- 過難：mirror-survive、mirror-choir-vigil、tidal-flat-evac；過易：lunar-blockade-run、waste-encirclement、quarry-duel。
- 補給碑只發事件：對缺池單位 `do:"pool"` 拋錯（`src/rules/pools.ts`）。

## 需要決定（頂層 2026-10-24）
1. 情境裝配 → 引擎缺口線。
2. AI 目標意識 → lead-ai-objective 進行中。
3. 多方局敗北勝方語意（字典序第一 slot 可能是盟軍）→ 轉 lead-rules-fuzz。
4. 戰中補給 `do:"pool"` 缺池略過 → 轉 lead-rules-fuzz。
5. measure 尊重情境 `rounds` → 引擎缺口線。
6. 情境 `name`／`brief` 欄 → 引擎缺口線。

## 以後交接書該點名的工具
`git ls-tree --name-only HEAD content/base/frames/`、frame `innateAbilities` 檢查、`src/rules/objectives.ts`＋`scenarioToSetup`、`content/lore/style.md`。
