# architecture — 模組邊界、事件日誌與重播、RNG、存檔、headless 測試、可視區介面

[core README](README.md)｜技術棧決策見 [decisions](../../../decisions.md)｜內容載入 [content-format](content-format.md)

裁示：純 TS＋Vite、無框架；邏輯與 DOM 完全分離；node 內建 test runner＋happy-dom 測邏輯與 DOM，Playwright headless 端對端；地圖 >120×120 用可視區渲染；盡量解耦、資料驅動。

## 模組與允許的依賴（只能往下）

| 模組 | 內容 | 可依賴 |
|---|---|---|
| `core` | 型別（Def／State）、`Id`、`BattleState`、`Event` 型別、seeded RNG、`EventLog`、NumExpr 求值器 | 無 |
| `content` | 載入 pack、schema 驗證、id 解析、`ContentDB`（唯讀） | core |
| `rules` | 所有結算：turn／attack／resources／effects／people／flow；對外只暴露 `tryCommand`、`previewCommand`、查詢函式 | core, content |
| `ai` | Strategy／Agent／Policy、知識模型、估值 | core, rules（只用查詢與 preview） |
| `sim` | `runBattle(scenario, content, seed, players)`、重播、存檔序列化、headless 驗收腳本 | core, content, rules, ai |
| `ui-adapter` | `ViewModel`、可視區、keymap、按鈕／面板／tooltip 的 DOM 渲染（唯一碰 DOM 處） | core, sim（經 `BattleSession`） |

`rules` 內部再分檔對應各 spec 子檔；`BattleState` 是純資料（可 structuredClone），**所有改動只經 `rules` 的函式**；`ai` 與 `ui-adapter` 拿到的是唯讀視圖。ESLint 規則或 `tsconfig` paths 強制依賴方向。

## 狀態與事件

```ts
type BattleState = { round: number; order: Id[]; units: Record<Id, MechState>; persons: Record<Id, PersonState>;
  map: MapState; factions: Record<FactionSlot, FactionState>; knowledge: Record<FactionSlot, FactionKnowledge>;
  rng: RngState; pending: EffectInstance[]; log: EventLog };
type Event = { seq: number; round: number; turn?: Id; type: string; payload: Record<string, unknown> };
```

**每個狀態變化都對應一個事件**（`PoolChanged`、`LayerDamaged`、`LayerBroken`、`PartBroken`、`EffectApplied`、`EffectExpired`、`Moved`、`AbilityUsed`、`Hit`、`Miss`、`Conducted`、`MoraleChanged`、`ControlChanged`、`UnitDied`、`Retreated`、`Ejected`、`Captured`、`IntentDeclared`、`RoundStart/End`、`TurnStart/End`、`BattleStart/End`…）。事件是 UI 動畫、戰鬥文字、測試斷言的**唯一**資料來源；`payload` 只放 id 與數字，文字由 ui-adapter 用內容包的名稱組。

## 決定性與重播

- RNG：`core/rng` 用 PCG32（或 xoshiro128**），`RngState` 存在 `BattleState`；所有隨機只經 `state.rng`，`rules` 以外不可持有 RNG。
- 排序一律有決定性 tie-break（id 字典序）；`Record` 迭代前先排序鍵。
- **重播**：`replay(scenario, content, seed, commands[]) → EventLog`；同輸入必得逐位元相同的日誌（測試斷言 `hash(log)`）。AI 的決策也是指令，重播時記錄的指令直接餵入、不重跑 AI；`sim` 另提供「重跑 AI 並比對」模式驗 AI 決定性。

## 存檔格式

```ts
type SaveFile = { version: 1; contentPacks: { id: Id; version: string; hash: string }[]; scenario: Id; seed: number;
  commands: Command[];                    // 真相：重播用
  snapshot?: BattleState;                 // 加速載入；載入時可選擇驗證 replay(commands) 等於 snapshot
  campaignBlob?: unknown };               // 營運層自己的資料，戰鬥引擎不解讀
```

內容包版本或 hash 不符時拒載（或以 snapshot 模式載入並警告）。存檔沒有任何 DOM 或 UI 狀態。

## headless 測試策略

**（1）單元**（`node --test`，`src/**/*.test.ts`）：每條規則一組——層序列演算法（表格驅動：層配置 × packet → 期望各層 hp）、NumExpr 求值、池更新時機、效果時鐘、疊加政策、命中夾限、全局修正表。

**（2）情境黃金測試**：`test/scenarios/*.json` 小情境（2–6 單位、固定 seed、固定指令序列）→ 事件日誌 hash 與**關鍵事件序列**（例：`LayerBroken(leg) → PartBroken → EffectApplied(immobile)`）存成黃金檔；改規則時 diff 日誌即 review 材料。

**（3）不變量／屬性測試**：隨機情境＋隨機合法指令跑 N 輪，斷言：池在 hard 範圍內、broken 層 hp=0、每個 contrib 的 source 存在、事件 seq 連續、重播一致。

**（4）AI 煙霧**：每個 Policy 對每個情境跑完不拋錯、不出現非法指令（`tryCommand` 拒絕次數＝0）。

**（5）DOM**（happy-dom）：ViewModel → DOM 渲染、點格顯示資訊、指令輸入；**Playwright headless** 只跑 2–3 條端對端（載入、結束回合、大地圖捲動），版本釘本機可用的那版。

**（6）驗收模擬跑法**：`npm run sim -- --scenario <id> --seed <n> [--ai-vs-ai] [--rounds 50] --out log.json`，印勝負、輪數、每陣營存活、事件計數；dispatch 的驗收用這條指令與日誌 hash。

## ui-adapter 的介面契約

```ts
interface ViewModel {
  viewport: { x: number; y: number; w: number; h: number };       // 格座標；>120×120 只渲染這個矩形＋1 格邊
  cell(x, y): { terrain: TerrainView; unit?: UnitView; intents?: IntentView[]; highlight?: string };
  dirty(): Set<CellKey>;                                           // 自上次 render 起變過的格（由事件推導）
  unit(id): UnitView;                                              // 部位×層的 hp 條、池、效果 badge、控制模式——全部來自 FactionKnowledge（玩家視角）
  text(evt: Event): string;                                        // 事件→戰鬥文字（內容包名稱 + 模板）
  commands(unitId): CommandOption[];                              // 合法指令清單（用 previewCommand 預估）
}
```

呈現方針（使用者 2026-10-24 裁示）：一般網頁遊戲的標準元件——**按鈕、列表、面板、tooltip**，不做文字指令列、不走 MUD 風；每個主要操作有**快捷鍵**，鍵位在資料檔 `keymap.json`（`{ action, keys[], label }`，可改綁），按鈕上標鍵、tooltip 末行寫鍵；`CommandOption` 帶 `key`、`tooltip`（成本、射程、不可用原因）、`disabled`，按鈕分移動／能力／回合／系統四組。DOM 層只做：把 `dirty()` 的格重畫（每格一個 `div`，CSS class 表示地形／單位／意圖）、把事件文字推進「戰鬥記錄」列表面板、把點格、按鈕點擊與按鍵轉成 `Command`。無框架、無虛擬 DOM；視窗捲動改 `viewport` 後全量重畫可視區。逐步互動：`sim/session.ts` 的 `BattleSession`（逐指令推進、AI 回合自動跑、`trackKnowledge`、全 AI 觀戰 `spectate`）是 ui-adapter 的唯一入口，`vm/session.ts` 只是它的薄包裝；`vm/boundary.test.ts` 禁止 ui-adapter import `rules`／`ai`（2026-10-24 lead-ui-session 落地）。可視區渲染抽成 `GridView` 共用模組吃 `GridSource` 介面，營運層大地圖的 `WorldViewModel` 另實作一份、兩者不互 import（ops spec `world-grid/ui-contract`）。

## 替使用者做掉的決定

1. **指令序列是存檔真相、snapshot 只是快取**：重播即驗證，也讓 bug 回報只需 seed＋指令。
2. **`payload` 只放 id 與數字、文字在 ui-adapter 組**：日誌小、可比對、可多語。
3. **RNG 選 PCG32**：小、快、可序列化、跨平台一致；不用 `Math.random`。
4. **黃金日誌當 review 材料**：規則改動的影響用 diff 看，比讀程式快。
5. **ViewModel 以 dirty set 驅動局部重繪**：120×120 全量重繪 65 ms 已可接受，更大地圖靠可視區＋dirty 不靠框架。
