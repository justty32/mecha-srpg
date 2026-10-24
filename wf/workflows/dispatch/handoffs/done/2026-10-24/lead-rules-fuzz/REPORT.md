# REPORT — lead-rules-fuzz：約 1.6 萬場 fuzz、修 13 個規則 bug、ISS-001 裝配欄（頂層代存，2026-10-24）

STATUS：**DONE**。commit `494a3aa`、`5d59141`、`3d2af7a`、`0d16dd5`、`3049172`（裝配欄）、`0fd7568`、`ed66d6a`（收線）。最終 mix 1500 場硬違規 0（`final-mix-1500.txt`）。工人大型 JSON 證據檔已移到本目錄 `trash/`（不追蹤）。

## ISS-001 裝配欄（`3049172`）
`scenarioToSetup`：情境 `UnitSpawn.components` 給了就整組取代（`{}`＝不裝），沒給就套 `FrameDef.defaultLoadout`。載入器擋槽不存在、slot 型別不符、怪獸 spawn 帶 components。測試 `test/sim/loadout.test.ts`。ops 出戰先清空 components 再填機體實裝。

## 不變量（18，`test/fuzz/invariants.ts`，各有竄改自測）
no-throw、preview-pure、pool-bounds、layer-hp、death-consistency、dead-dont-act、positions、seats、contrib-valid、effects-valid、cooldowns、events、termination、replay-hash、ai-determinism、save-roundtrip、legal-enum；驅動層 legal-rejected、no-termination、setup-rejected、gen-error（ai-rejected 僅警告）。

## 規模
累計約 1.6 萬場（全 AI、隨機合法指令、24 真情境）；1500 場中 LayerBroken 885、PartBroken 631、UnitDied 321。每場從 DB 列舉內容，新內容自動進抽樣池。`npm run fuzz -- --runs N --seed S [--mode ai|random|scenario|mix] [--jobs J] [--max-ms T] [--json F] [--verbose]`。

## 修掉（回歸測試 `test/rules/regress.test.ts` 12 條）
- 「貢獻值尚未求值」：根因 ops（`src/ops/sortie/scenario.ts` 把 mastery 寫成 `{product:[…]}`、`opseffect.ts` 塞未求值貢獻）；規則端改匯入時求值（`494a3aa`）。
- `494a3aa`：撤離定勝負後仍寫 TurnEnd；produces 指向機體沒有的池時拋錯（改判不可用）；person-scope 效果打無駕駛怪獸拋錯；雙方無可下令單位時停住（改照輪推進至 timeout）。
- `5d59141`：最後一擊後續結算落在 BattleEnd 之後；已毀部位結構層再生；`do:"pool"` 缺池拋錯；多方局敗北勝方挑到盟軍。
- `0d16dd5`：情境初始池未夾限。
- `0fd7568`：ISS-011 步兵可再棄機；ISS-012 友方限定增益仍擲命中。
黃金 6 個與 ops 黃金皆未變。

## 給其他線
- AI：對無指令權單位下 `eject`（2–5% 場，`eject:no-commander`）；重現 `node test/fuzz/cli.ts --seed 900111 --runs 1 --mode ai --verbose`。
- 內容：ISS-023 instinct 120/100 是 soft 池無閾值帶（改 hard 或補超載帶）；機械部件裝生物機時產熱能力不可用（需宣告 heat 池）；傳導 1500 場只 11 場，確認座艙層與 conduct。

## 剩餘工作
1. ISS-011 前半「滿血也能棄機」：spec 寫 Eject 任何位置合法 → 頂層定：維持規則，確認框交 UI。
2. 捕捉與失控覆蓋不足：`test/fuzz/gen.ts` `stress()` 補捕捉與超限承擔情境。
3. 效能：`clone-state` 佔 36%（AI 預覽）；真情境約 13 秒一場。
4. ops 端貢獻值源頭求值：`src/ops/sortie/scenario.ts` 約第 104 行、`src/ops/content/opseffect.ts`。
