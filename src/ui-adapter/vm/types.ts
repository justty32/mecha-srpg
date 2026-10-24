// ui-adapter/vm/types — ViewModel 層與 DOM 層之間的凍結契約（lead-impl-ui 寫死；改動要領導同意）。
// 方向：BattleController（純邏輯，node 可測）產出 UiSnapshot（純資料）→ DOM 只負責把 UiSnapshot 畫出來；
// DOM 的點擊與按鍵一律轉成 UiAction 交回 controller。DOM 層不 import rules／ai／sim／content。
// 呈現方針（使用者 2026-10-24 裁示）：一般網頁遊戲的按鈕／列表／面板／tooltip，指令用點選與快捷鍵下達，不走 MUD 文字指令列。

import type { Id } from "../../core/ids.ts";
import type { Cell, FactionSlot } from "../../core/types-def.ts";

export type Side = "self" | "ally" | "enemy" | "neutral";

/** 方格上的單位徽章（只放畫格子需要的東西）。 */
export type UnitBadge = {
  id: Id; label: string;            // 格內顯示的短名（1–2 個字）
  name: string;                     // 全名（tooltip 用）
  owner: FactionSlot; side: Side;
  active: boolean;                  // 現在輪到它
  hpRatio: number;                  // 0..1，所有可見層 hp 和／max 和；未偵察的層不計
  status: "active" | "derelict";
};

export type Highlight = "reach" | "path" | "target" | "range";

export type CellView = {
  x: number; y: number;
  terrain: { id: Id; name: string; glyph: string; color: string };
  unit?: UnitBadge;
  highlight?: Highlight;
  cursor?: boolean;                 // 鍵盤游標所在格
  selected?: boolean;               // 被選取單位所在格
  intent?: boolean;                 // 有敵方意圖宣告指向此格
};

export type LayerView = { type: string; hp: number | null; max: number; broken: boolean };   // hp null＝未偵察
export type PartView = { id: string; name: string; broken: boolean; layers: LayerView[] };
export type PoolView = { id: string; name: string; cur: number; max: number | null };         // max null＝無上限
export type EffectView = { id: Id; name: string; stacks: number; remaining: number | null };
export type PersonView = { id: Id; name: string; seat: string; role: string; morale: string };

/** 單位詳情面板：全部來自玩家陣營的 FactionKnowledge（看不到的就是 null／省略）。 */
export type UnitView = {
  id: Id; name: string; frameName: string; owner: FactionSlot; side: Side;
  pos: Cell; controlMode: string; status: string;
  persons: PersonView[]; parts: PartView[]; pools: PoolView[]; effects: EffectView[];
};

/** 指令按鈕：DOM 把它畫成 <button>，標上 key 與 tooltip，點了就送 action。 */
export type CommandOption = {
  id: string;                       // 穩定 id（測試與 e2e 用）：move／wait／end／eject／retreat／ability:<abilityId>／cancel
  label: string;                    // 按鈕文字（中文）
  group: "move" | "ability" | "turn" | "system";
  key?: string;                     // 顯示用快捷鍵（取自 keymap，例 "M"、"1"、"Esc"）
  tooltip: string;                  // 成本、射程、命中率等說明；多行用 \n
  enabled: boolean;
  reason?: string;                  // 不可用時的原因（中文；同時併進 tooltip）
  active?: boolean;                 // 目前模式就是這個指令（例：正在選移動目的地）
  action: UiAction;
};

export type LogKind = "turn" | "move" | "hit" | "miss" | "damage" | "break" | "death" | "effect" | "morale" | "system";
export type LogLine = { seq: number; round: number; text: string; kind: LogKind };

export type Mode =
  | { kind: "idle" }
  | { kind: "move" }
  | { kind: "target"; ability: Id; abilityName: string };

/** 游標格的資訊卡（點格顯示資訊）。 */
export type CellInfo = { x: number; y: number; terrainName: string; terrainNote: string; unit?: UnitView };

export type KeyHint = { action: string; label: string; keys: string[] };

export type UiSnapshot = {
  title: string;                    // 情境名
  round: number; maxRounds: number | null;
  activeUnit: Id | null;            // 現在輪到的單位
  playerTurn: boolean;              // 輪到玩家陣營（slot "player"）的單位
  outcome: { winner: FactionSlot | null; reason: string; text: string } | null;
  map: { width: number; height: number };
  viewport: { x: number; y: number; w: number; h: number };   // 格座標；cells 只含這個矩形
  cells: CellView[];                // viewport 內 row-major，長度 w*h
  dirty: string[] | "all";          // 自上一份 snapshot 起變過的格（cellKey "x,y"）；viewport 變了就是 "all"
  cursor: Cell;
  mode: Mode;
  selected: UnitView | null;        // 選取中的單位（預設＝輪到的玩家單位）
  inspect: CellInfo;                // 游標格資訊
  commands: CommandOption[];        // 選取單位可下的指令（非玩家回合時為空）
  log: LogLine[];                   // 最近 200 行，舊→新
  message: string | null;           // 最近一則提示（例：指令被拒的原因）
  keyHints: KeyHint[];              // 快捷鍵說明（說明面板用）
  showHelp: boolean;
};

export type UiAction =
  | { type: "clickCell"; x: number; y: number }   // 點格：idle＝選取／查看；move＝移動；target＝施放
  | { type: "hoverCell"; x: number; y: number }   // 滑鼠移入：游標移過去（不捲動）
  | { type: "cursor"; dx: number; dy: number }    // 鍵盤移游標，游標出可視區時 viewport 跟著捲
  | { type: "confirm" }                           // 對游標格做 clickCell
  | { type: "cancel" }                            // 離開 move／target 模式；idle 時關說明
  | { type: "scroll"; dx: number; dy: number }    // 捲可視區（格）
  | { type: "setViewport"; x: number; y: number }
  | { type: "resize"; w: number; h: number }      // DOM 依容器大小回報可視格數
  | { type: "nextUnit" }                          // 選下一個玩家單位（只查看；行動仍是輪到的那台）
  | { type: "centerActive" }                      // 可視區置中到輪到的單位
  | { type: "beginMove" }
  | { type: "beginAbility"; ability: Id }
  | { type: "abilitySlot"; n: number }            // 第 n 個（1 起算）能力按鈕
  | { type: "wait" }
  | { type: "endTurn" }
  | { type: "eject" }
  | { type: "retreat" }
  | { type: "toggleHelp" };

/** keymap.json 的形狀（資料驅動快捷鍵；改綁只改 JSON）。 */
export type KeyBinding = { action: string; keys: string[]; label: string };
export type KeymapFile = { version: 1; bindings: KeyBinding[] };
/** 正規化後的按鍵：修飾鍵順序固定 Ctrl+Alt+Shift+<key>，key 用 KeyboardEvent.key（單一字母一律小寫）。 */
export type KeyInput = { key: string; ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean };
