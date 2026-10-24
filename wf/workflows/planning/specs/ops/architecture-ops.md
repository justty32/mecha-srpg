# architecture-ops — `src/ops/` 的模組邊界、狀態與事件、存檔、headless 測試策略

[ops README](README.md)｜core 的架構 [core/architecture](../core/architecture.md)（依賴方向、事件日誌、RNG、存檔格式沿用）｜環境與指令見 testing 工作流

裁示：純 TS＋Vite、邏輯與 DOM 分離、node 內 headless 可測；盡量解耦、資料驅動；存檔的 `campaignBlob` 由營運層自己解讀（core 架構）。

## 模組與允許的依賴

| 模組 | 內容 | 可依賴 |
|---|---|---|
| `ops/state` | CampaignState／Event／OpsCommand 型別、RNG、Ledger | core |
| `ops/content` | 載入 `world/`、schema、WorldDB、Cond／OpsEffect 詞彙 | core, content |
| `ops/world` | 節點、路線、裂縫、潮壓、行動牌、市場 | state, content |
| `ops/crew` | 名冊、薪水、招募、醫務、佇列、機庫、獸欄、科研、練熟 | state, content |
| `ops/contracts` | 契約生命週期、談判、計功 | state, content |
| `ops/time` | `tick()` 八段編排（只呼叫純函式） | 上列全部 |
| `ops/sortie` | validateSortie、generateScenario、applyBattleResult | 上列＋`sim` |
| `ops/text` | parse、render(Screen)、模板；無 DOM | state, content |
| `ops/sim` | runCampaign、重播、不變量、存檔序列化 | 上列全部 |
| `ui-ops` | DOM：畫 Screen、收輸入、切到 core ViewModel 再切回 | text, sim, ui-adapter |

表中依賴欄省略 `ops/` 前綴；`ops/sortie` 對 `sim` 只用 `runBattle` 與 `BattleResult`。依賴只能往下；`ops/*` **不得** import `rules`／`ai`（戰鬥內部），只經 `sim`。`CampaignState` 純資料、可 `structuredClone`，所有改動只經各模組的 `(state, input) → (state', events)`。

## 狀態與事件

```ts
type CampaignState = { version: 1; clock: Clock; rng: RngState; pressure: number;
  nodes: Record<Id, NodeState>; rifts: Record<Id, RiftState>; factions: Record<Id, FactionState>;
  ship: ShipState; roster: RosterState; hangar: HangarState; stable: StableState; mechs: Record<Id, MechState>;
  inventory: Inventory; ledger: Ledger; research: Record<Id, ResearchState>; jobs: Job[];
  contracts: Record<Id, ContractState>; pendingChoices: Prompt[]; pendingTicks: number; pendingBattle?: Sortie;
  lore: string[]; flags: Record<string, number>; log: CampaignEvent[] };
type CampaignEvent = { seq: number; day: number; type: string; payload: Record<string, unknown> };
```

事件類型（節選）：`DayStart`、`DaySummary`、`RiftPhase`、`NodeBlighted`、`NodeReclaimed`、`Arrived`、`Encounter`、`EventOffered`、`Chosen`、`JobDone`、`Tamed`、`Molted`、`Brooded`, `Mutated`、`Accompanied`、`NodeMastered`、`WagePaid`、`WageOwed`、`InterestPosted`、`Posted`（每筆帳）、`ContractOffered/Accepted/Done/Failed/Cancelled/Expired`、`Hired`、`Left`、`Died`、`BattleResolved`、`Woken`、`Named`、`CampaignEnd`。payload 只放 id 與數字；文字由 `ops/text` 組。

## 決定性與重播

營運 RNG 是獨立 PCG32 串流（`campaign.rng`），每場戰鬥的 seed 由它抽出；`OpsCommand` 序列是存檔真相。`replayCampaign(start, commands) → CampaignEvent[]`，同輸入逐位元相同；戰鬥結果在重播時**不重跑**，從 `BattleResolved.payload` 內嵌的 `BattleResult` 摘要（狀態差分）回放——完整戰鬥日誌另存，驗 hash 即可。

## 存檔

沿用 core `SaveFile`：`campaignBlob = { state: CampaignState（snapshot）, commands: OpsCommand[], battles: { sortie: Id; seed: number; commands: Command[]; logHash: string }[] }`。載入時可選「重播校驗」：重跑 commands 比對 snapshot hash。內容包版本不符拒載。

## headless 測試策略

**(1) 單元**（`src/ops/**/*.test.ts`）：曆函式、裂縫狀態機每條轉移（表格驅動：phase × 事件 → 期望 phase）、潮壓更新、帳本 `post` 的拒絕政策、欠薪等比例分配、工時佇列灌注順序、價格公式、談判檢定、`parse` 的每個動詞與模糊比對、房間片語選取。

**(2) 潮月模擬**（`npm run sim:campaign -- --start default --months 12 --seed 7 --policy greedy`）：內建兩個 policy（`idle`：只等；`greedy`：接最近契約、全員出戰、戰鬥用 `ai-vs-ai` 跑）跑 N 個潮月**不拋錯**，印每潮月一行（cash、debt、人數、獸數、蝕化節點數、裂縫數）。dispatch 驗收用這條。

**(3) 不變量／屬性測試**（隨機 policy × 隨機 seed × 6 潮月）：**帳本守恆**（重算 `balances` 等於折疊；每筆外源 `Posted` 有對應來源事件；`stock:*` 永不為負）；每個 `seat`／`boundTo`／`PenState.mech` 指到存在的實體；裂縫 `phase` 轉移只發生在大潮日或 `BattleResolved` 同日；`等 7` 與七次 `等 1` 的事件序列相同；`pendingChoices` 非空時 `day` 不前進；mastery ∈ [0,1]；重播一致。

**(4) 黃金戰役**：`test/campaigns/*.json`（固定開局、固定指令 30–60 條、固定 seed）→ 事件日誌 hash 與關鍵事件序列（例：`ContractAccepted → Arrived → BattleResolved → RiftPhase(unanchored) → RiftPhase(anchored, fedCount=1)` 證明養裂）存黃金檔。

**(5) 指令列／選單恆等**：對每個 `Screen.actions` 的按鈕，找一行能 `parse` 成同一 `OpsCommand` 的文字，兩路執行比對 state hash。

**(6) DOM**（happy-dom）：`Screen` → DOM 的房間、log、按鈕；Playwright 只跑一條端對端（開局→接約→航行→進戰場→回營運）。

## 替使用者做掉的決定

1. **`ops/time` 只編排、不含規則**：八段各自是其他模組的純函式，順序一眼可查。
2. **重播不重跑戰鬥**：營運重播秒級完成；戰鬥各自有 hash 可單獨驗。
3. **兩個內建 policy 當模擬驅動**：`idle` 測世界自己會不會壞、`greedy` 測迴圈會不會卡。
4. **帳本守恆寫成三條不變量**：折疊相等、外源有來源、存量非負——比「錢對得上」可斷言。
5. **ui-ops 與 ui-adapter 分開**：營運畫面與方格戰場是兩個 DOM 模組，互不 import，只在 `sortie` 交接。
