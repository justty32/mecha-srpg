# architecture-ops — `src/ops/` 的模組邊界、狀態與事件、存檔、headless 測試策略

[ops README](README.md)｜core 的架構 [core/architecture](../core/architecture.md)（依賴方向、事件日誌、RNG、存檔格式沿用）｜環境與指令見 testing 工作流

裁示：純 TS＋Vite、邏輯與 DOM 分離、node 內 headless 可測；盡量解耦、資料驅動；存檔的 `campaignBlob` 由營運層自己解讀（core 架構）。

## 模組與允許的依賴

| 模組 | 內容 | 可依賴 |
|---|---|---|
| `ops/state` | CampaignState／Event／OpsCommand 型別、RNG、Ledger | core |
| `ops/content` | 載入 `world/`、schema、WorldDB、Cond／OpsEffect 詞彙 | core, content |
| `ops/world` | `grid`（尋路／幾何）、`places`、`move`、`rifts`／`pressure`、`actors`、`fog`、行動牌、市場 | state, content |
| `ops/crew` | 名冊、薪水、招募、醫務、佇列、機庫、拘束艙、科研、練熟 | state, content |
| `ops/contracts` | 契約生命週期、談判、計功 | state, content |
| `ops/time` | `tick()` 八段編排（只呼叫純函式） | 上列全部 |
| `ops/sortie` | validateSortie、generateScenario、applyBattleResult | 上列＋`sim` |
| `ops/text` | OpsCommand 語意層、render(Screen)、模板、keymap；無 DOM | state, content |
| `ops/sim` | runCampaign、重播、不變量、存檔序列化 | 上列全部 |
| `ui-ops` | DOM：畫 Screen、收點擊與快捷鍵、與 core ViewModel 交接 | text, sim, ui-adapter |

第二輪新增 `ops/war`（常備軍、作戰、外交、勢力研發；可依賴 state、content、world），`ops/contracts` 的參戰型 `join` 與 `ops/sortie` 的友軍 slot 可依賴它。表中依賴欄省略 `ops/` 前綴；`ops/sortie` 對 `sim` 只用 `runBattle` 與 `BattleResult`。依賴只能往下；`ops/*` **不得** import `rules`／`ai`（戰鬥內部），只經 `sim`。`CampaignState` 純資料、可 `structuredClone`，所有改動只經各模組的 `(state, input) → (state', events)`。

## 狀態與事件

見 [狀態、事件與重播存檔](architecture-ops/state-and-replay.md#狀態與事件)：營運狀態與事件、決定性重播及存檔格式。

## 決定性與重播

見 [狀態、事件與重播存檔](architecture-ops/state-and-replay.md#決定性與重播)。

## 存檔

見 [狀態、事件與重播存檔](architecture-ops/state-and-replay.md#存檔)。

## headless 測試策略

見 [headless 測試策略](architecture-ops/headless-testing.md#headless-測試策略)：單元、模擬、不變量、黃金戰役、操作恆等與 DOM 測試。

## 替使用者做掉的決定

1. **`ops/time` 只編排、不含規則**：八段各自是其他模組的純函式。
2. **重播不重跑戰鬥**：營運重播秒級完成；戰鬥各自有 hash。
3. **內建 policy 當模擬驅動**：`idle` 測世界會不會壞、`greedy` 測迴圈會不會卡。
4. **帳本守恆寫成三條不變量**：折疊相等、外源有來源、存量非負。
5. **ui-ops 與 ui-adapter 分開**：營運畫面與方格戰場是兩個 DOM 模組，互不 import，只在 `sortie` 交接；共用 keymap 載入器與 `GridView` 方格渲染（兩個 ViewModel 不互認）。
