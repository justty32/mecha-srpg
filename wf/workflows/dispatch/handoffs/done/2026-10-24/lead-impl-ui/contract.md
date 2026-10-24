# lead-impl-ui 契約：ui-adapter 的 vm／dom 分層、controller 介面、快捷鍵

[CLAIMS](../../../../CLAIMS.md)｜spec [architecture](../../../../../planning/specs/core/architecture.md)「ui-adapter 的介面契約」與「headless 測試策略 (5)」

領導 `lead-impl-ui` 凍結。工人照抄名稱與簽名；契約有洞 → 註解 `SPEC-GAP`＋最小解＋寫進 REPORT，不要停。

## §0 呈現方針（使用者 2026-10-24 裁示，凌駕 spec 的「MUD 風文字區」字樣）

一般網頁遊戲的標準元件：**按鈕、列表、面板、tooltip**；指令一律點選按鈕或點格下達，**每個主要操作都有快捷鍵**，按鈕上標鍵、tooltip 也寫鍵；鍵位只在 `src/ui-adapter/vm/keymap.json`（資料驅動，改綁只改 JSON）。戰場是 DOM／CSS 真方格；無美術，用色塊、文字符號、單位短名。**不做文字指令列。** 戰鬥文字（事件 → 中文句子）仍顯示在「戰鬥記錄」列表面板。

## §1 已由領導先做（工人不可改）

- `src/ui-adapter/vm/types.ts`：`UiSnapshot`、`UiAction`、`CommandOption`、`KeymapFile`、`KeyInput` 等**全部共用型別**。
- `src/ui-adapter/vm/keymap.json`：預設鍵位。action 字串文法：`<type>` 或 `<type>:<參數>`，`cursor:dx,dy`、`scroll:dx,dy`、`abilitySlot:n`，其餘直接是 `UiAction.type`。
- `src/ui-adapter/content-browser.ts`：瀏覽器端用 `import.meta.glob` 結果餵 `loadPacks`。
- `tsconfig.json`（排除 `src/ui-adapter/dom/**`）、`tsconfig.ui.json`（DOM lib＋@types/node，含 dom／e2e／設定檔）、`vite.config.ts`、`playwright.config.ts`、`package.json` scripts（`dev`／`build`／`preview`／`test:dom`／`test:e2e`；`typecheck` 兩段）。
- 之後由領導做：`index.html`、`src/ui-adapter/dom/main.ts`（接線）、`e2e/`。

## §2 分層與依賴

| 目錄 | 內容 | 可 import |
|---|---|---|
| `src/ui-adapter/vm/` | 純邏輯：session、ViewModel、controller、keymap、事件文字、除錯大地圖 | core、content、sim、rules（`src/rules/index.ts`）、ai（`src/ai/index.ts`、`src/ai/adapters/rules-adapter.ts`）；**不准 DOM 型別**（root tsconfig 無 DOM lib，會擋）|
| `src/ui-adapter/dom/` | DOM 渲染、事件轉 `UiAction`／`KeyInput`、CSS | **只准** `../vm/types.ts`（type-only）與瀏覽器 API；不 import rules／ai／sim／content |

SPEC-GAP（領導記）：spec 寫 ui-adapter 只依賴 core、sim；但 sim 沒有「逐步互動」API（`runBattle` 一口氣跑完），所以 `vm/session.ts` 是**唯一**直接呼叫 rules／ai 的檔，照 `src/sim/run.ts` 的 `runBattle` 迴圈拆成逐步版。建議日後把 session 搬進 sim。

## §3 vm 匯出介面（給 `cx-ui-vm`）

```ts
// vm/session.ts —— 互動跑局：玩家 slot 由 UI 下指令，其餘 slot（含 berserk）由 AI 跑
export type SessionOptions = { db: ContentDB; sim: SimSetup; seed: number; playerSlot?: FactionSlot /* 預設 "player" */ };
export class BattleSession {
  constructor(opts: SessionOptions);          // createBattle＋startBattle，然後 advanceAi()
  readonly db: ContentDB; readonly state: BattleState; readonly playerSlot: FactionSlot;
  readonly commands: Command[];               // 成功指令（含 AI 的），可交給 sim replay 驗
  readonly query: RulesQuery;                 // createRulesQuery(db)
  activeUnit(): Id | null;
  isPlayerTurn(): boolean;                    // 有 active 且 owner === playerSlot 且無 outcome
  submit(cmd: Command): Result;               // 只接受玩家回合；成功後自動 advanceAi()
  advanceAi(maxSteps?: number): number;       // 跑 AI 直到輪到玩家或分出勝負；回傳 AI 送出的成功指令數
  outcome(): BattleOutcome | null;
}
// vm/viewmodel.ts —— spec 的 ViewModel（玩家視角，資訊只取 FactionKnowledge）
export class BattleViewModel {
  constructor(session: BattleSession);
  viewport: { x: number; y: number; w: number; h: number };
  setViewport(x: number, y: number, w?: number, h?: number): void;   // 夾在地圖內
  cell(x: number, y: number): CellView;     // 不含 cursor／selected／highlight（controller 疊）
  dirty(): Set<string>;                      // 自上次呼叫起，由新事件推導出變動的格（cellKey）
  unit(id: Id): UnitView;
  text(evt: GameEvent): LogLine | null;      // null＝不顯示的事件（例 PoolChanged 可略）
  commands(unitId: Id): CommandOption[];    // 用 checkAbility／reachable 判 enabled；key 由 keymap 填
}
// vm/keymap.ts
export const DEFAULT_KEYMAP: KeymapFile;                    // 讀 keymap.json
export function normalizeKey(k: KeyInput): string;          // "Shift+ArrowUp"、"e"、"Shift+x"
export function parseAction(action: string): UiAction | null;
export function resolveKey(map: KeymapFile, k: KeyInput): UiAction | null;
export function keyLabel(map: KeymapFile, action: string): string | undefined;  // 顯示用："E"、"Esc"、"⇧R"、"1"
export function validateKeymap(map: KeymapFile): string[];  // 重複鍵、未知 action → 錯誤訊息
// vm/controller.ts
export type ControllerOptions = { session: BattleSession; title?: string; keymap?: KeymapFile; viewport?: { w: number; h: number } };
export class BattleController {
  constructor(opts: ControllerOptions);
  readonly session: BattleSession; readonly vm: BattleViewModel;
  snapshot(): UiSnapshot;
  dispatch(a: UiAction): UiSnapshot;
  key(k: KeyInput): UiSnapshot | null;      // 未綁定的鍵回 null（DOM 據此決定要不要 preventDefault）
}
export function controllerForScenario(db: ContentDB, scenario: Id, seed: number, opts?: { viewport?: { w: number; h: number } }): BattleController;
// vm/debug-maps.ts —— 大地圖（> 120×120）除錯情境：純函式產 SimSetup，決定性
export function bigMapSim(db: ContentDB, size: number /* 例 160 */, seed: number): SimSetup;
```

## §4 controller 行為（寫死）

- 模式：`idle` → 按「移動」進 `move`（高亮 `reach` 格）→ 點可達格送 `{kind:"move", path: query.pathTo(...)}`；`beginAbility`／`abilitySlot:n` 進 `target`（高亮射程內 `range`、合法目標 `target`）；`target.kind === "self"` 的能力直接施放不進模式。`cancel` 回 `idle`。
- `clickCell` 在 `idle`：游標移過去、`inspect` 換成該格、點到我方單位就 `selected` 換成它（查看用）。
- 指令被拒：`message` 寫中文原因（rejection code 對照表在 vm），模式不變。
- 非玩家回合（理論上 submit 後 AI 已跑完）`commands` 為空；分出勝負時 `outcome.text` 有中文結語、`commands` 只剩空。
- `cursor` 移出可視區時 viewport 捲到讓游標在內；`centerActive` 置中；`resize` 改 w/h 後重夾。viewport 變動 → `dirty:"all"`。
- 每個 `CommandOption` 的 `key` 由 `keyLabel` 填，`tooltip` 末行附「快捷鍵：X」。能力按鈕依 `abilitiesOf` 順序編 1..9。
