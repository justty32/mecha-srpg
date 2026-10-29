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
  active: boolean;                  // 現在輪到它（行動中高亮；敵方回合也是 true，與 CellView.selected 用不同色）
  hpRatio: number | null;                  // 0..1，僅 structural 層完整度；任一結構層未知或無結構則 null
  blood?: { cur: number; max: number | null; min?: number; vital?: boolean; bleeding?: boolean };
  seenRound?: number | null;
  status: "active" | "derelict" | "presence";
  selectable?: boolean;
  notice?: string;
  stale?: boolean;                  // [lead-ui-fix] 不在視野內：畫在最後所見位置、灰色殘影（不擋點擊）
};

/** reach＝可移動（藍底）；range＝攻擊射程內（淡紅底）；target＝射程內合法目標（紅框＋紅底）；path＝游標所指的移動路徑。 */
export type Highlight = "reach" | "path" | "target" | "range";

export type CellView = {
  x: number; y: number;
  terrain: { id: Id; name: string; glyph: string; color: string };
  feature?: { hp: number; max: number };
  objects?: { id: string; name: string; kind: string; note: string }[];
  travelNote?: string;              // 選中單位的靜態地形通行說明；不代表實際可達
  unit?: UnitBadge;
  selectable?: boolean;
  highlight?: Highlight;
  cursor?: boolean;                 // 鍵盤游標所在格
  selected?: boolean;               // 被選取單位所在格
  intent?: boolean;                 // 有敵方意圖宣告指向此格
};

export type LayerView = { type: string; hp: number | null; max: number; broken: boolean; structural: boolean };   // type＝中文名；hp null＝未偵察
export type PartView = { id: string; name: string; broken: boolean; layers: LayerView[];
  functions?: string[]; components?: { id: Id; slot: string; name: string; functions: string[] }[] };
export type PoolView = { id: string; name: string; cur: number; max: number | null; min?: number; vital?: boolean };         // max null＝無上限
export type EffectView = { id: Id; name: string; stacks: number; remaining: number | null; part?: string };
export type PersonView = { id: Id; name: string; seat: string; role: string; morale: string };

/** 單位詳情面板：全部來自玩家陣營的 FactionKnowledge（看不到的就是 null／省略）。 */
export type UnitView = {
  selectable?: boolean;
  id: Id; name: string; frameName: string; owner: FactionSlot; side: Side;
  pos: Cell; controlMode: string; status: string;
  movementName?: string; frameClassName?: string;
  movement?: { remaining: number; limit: number; spent: number; notes: string[] };
  familyName?: string; ecologyNotes?: string[];
  presenceNote?: string; auraNotes?: string[]; defenseNote?: string;
  persons: PersonView[]; parts: PartView[]; pools: PoolView[]; effects: EffectView[];
  /** [lead-ui-fix] 敵方：視野內＝全部部件與每層即時血量（stale false）；離開視野＝最後所見快照（stale true、seenRound 為所見輪）。
   *  我方恆為 false／null。從未見過的敵方：stale true、parts 只有結構、hp null。 */
  stale: boolean; seenRound: number | null;
};

/** 指令按鈕：DOM 把它畫成 <button>，標上 key 與 tooltip，點了就送 action。 */
export type CommandOption = {
  id: string;                       // 穩定 id（測試與 e2e 用）：move／standby／defer／end／eject／retreat／ability:<abilityId>／cancel／skip
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
export type LogLine = { seq: number; round: number; text: string; kind: LogKind; at?: Cell };   // at：點這行時鏡頭要去的格（有就可點）

export type Mode =
  | { kind: "idle" }
  | { kind: "move" }
  | { kind: "target"; ability: Id; abilityName: string }
  /** [lead-ui-fix] 選部位：點了合法目標、且能力可瞄部位（partAim.allowed 或 target.kind "part"）→ 列出部位，數字鍵或點選決定。 */
  | { kind: "part"; ability: Id; abilityName: string; target: Id; options: PartOption[] };

/** 可瞄的部位；auto 為「不指定（交給規則）」——只在 target.kind 不是 "part" 時出現。n＝數字鍵（1 起算）。 */
export type PartOption = { n: number; part: string | null; label: string; enabled: boolean; reason?: string;
  chance: number | null; protection: LayerView[]; functions: string[]; consequences: string[]; aimNote: string; defenseNote?: string; hitNotes?: string[];
};

/** 游標格的資訊卡（點格顯示資訊）。 */
export type CellInfo = { x: number; y: number; terrainName: string; terrainNote: string; objects?: CellView["objects"]; feature?: CellView["feature"]; unit?: UnitView };

export type KeyHint = { action: string; label: string; keys: string[] };

/** [lead-ui-fix] 戰場演出：純資料，DOM 畫在方格上方的疊層。id 單調遞增；DOM 記住已播到哪個 id。
 *  group＝同一批事件內的先後（0 起）；DOM 依動畫設定錯開（開：每組約 350ms；快：約 120ms；關：不錯開）。
 *  關動畫時 DOM 只播 kind "path" 與 "float"（tone damage／miss），其餘略過。 */
export type Fx =
  | { id: number; group: number; kind: "path"; cells: Cell[] }                       // 起點→終點的路徑箭頭，約 500ms 淡出；棋子已在終點
  | { id: number; group: number; kind: "attack"; from: Cell; to: Cell; hit: boolean } // 攻擊線；hit 時命中格閃一下
  | { id: number; group: number; kind: "float"; at: Cell; text: string; tone: "damage" | "miss" | "status" | "break" }; // 浮字：「左臂 −12」「未命中」「過熱」「左臂損毀」

/** 戰場演出佇列狀態：busy 非 null 時 DOM 宿主（main.ts）要依動畫設定延遲後持續送 { type: "step" }，直到 busy 為 null。 */
export type Busy = { kind: "ai"; actor: Id | null; name: string | null };

export type AnimMode = "on" | "fast" | "off";

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
  operator?: UnitView | null;
  partsUnit?: UnitView | null;
  selected: UnitView | null;        // 選取中的單位（預設＝輪到的玩家單位）
  inspect: CellInfo;                // 游標格資訊
  /** [lead-ui-fix] 固定指令面板：恆含 move／standby／defer／end／eject／retreat（＋選取單位的能力、模式中的 cancel、播放中的 skip），
   *  不因未選、敵方回合、捲動縮放而消失；不能按的 enabled false＋reason（「敵方回合中」「尚未選擇棋子」…）。 */
  commands: CommandOption[];
  log: LogLine[];                   // 最近 200 行，舊→新
  message: string | null;           // 最近一則提示（例：指令被拒的原因）
  keyHints: KeyHint[];              // 快捷鍵說明（說明面板用）
  showHelp: boolean;
  /** [lead-ui-fix] 行動後浮出的下一步選單（錨在行動中我方棋子格上）：能力＋待機（＋還能動時的移動）；mode 非 idle 或非玩家回合時為 null。 */
  quickMenu: { at: Cell; options: CommandOption[] } | null;
  /** [lead-ui-fix] 待確認提示（例：「還有 N 台未行動，確定結束？（再按 E 確認）」）；任何其他操作都會取消它。 */
  confirm: { action: "endTurn" | "engagePresence"; target?: Id; text: string } | null;
  busy: Busy | null;
  /** [lead-ui-fix] 最近的演出（最多 64 筆，舊→新）；epoch 變了＝被跳過，DOM 立刻清掉播放中的演出。 */
  fx: { epoch: number; items: Fx[] };
};

export type UiAction =
  | { type: "navigate"; page: "battle" | "wiki" | "ops" }
  | { type: "clickCell"; x: number; y: number }   // 點格：idle＝選取／查看；move＝移動；target＝施放
  | { type: "hoverCell"; x: number; y: number }   // 滑鼠移入：游標移過去（不捲動）
  | { type: "cursor"; dx: number; dy: number }    // 鍵盤移游標，游標出可視區時 viewport 跟著捲
  | { type: "confirm" }                           // 對游標格做 clickCell
  | { type: "cancel" }                            // 離開 move／target 模式；idle 時關說明
  | { type: "scroll"; dx: number; dy: number }    // 捲可視區（格）
  | { type: "setViewport"; x: number; y: number }
  | { type: "resize"; w: number; h: number }      // DOM 依容器大小回報可視格數
  | { type: "nextUnit" }                          // 選下一個我方單位；輪到的那台優先（只查看；行動仍是輪到的那台）
  | { type: "centerActive" }                      // 可視區置中到輪到的單位
  | { type: "beginMove" }
  | { type: "beginAbility"; ability: Id }
  | { type: "abilitySlot"; n: number }            // 第 n 個（1 起算）能力按鈕
  | { type: "standby" }                           // 待機＝這台行動結束（規則 end 指令）
  | { type: "defer" }                             // 延後＝移到本輪隊尾（規則 wait 指令；每輪一次）
  | { type: "endTurn" }                           // 結束我方本輪：未行動者全部待機；有未行動者先要求再按一次確認
  | { type: "attackFeature"; ability: Id; cell: Cell }
  | { type: "throwDebris"; target: Id }
  | { type: "interact"; object: string }
  | { type: "engagePresence"; target: Id }
  | { type: "eject" }
  | { type: "retreat" }
  | { type: "toggleHelp" }
  | { type: "step" }                              // 演出佇列推進一步（busy 時由 DOM 宿主依計時送）
  | { type: "skip" }                              // 跳過演出：AI 一路跑到輪到我方或分出勝負，fx.epoch+1；busy 時 cancel／confirm 也等同 skip
  | { type: "focusLog"; seq: number }             // 點戰鬥記錄：鏡頭置中到該行的 at
  | { type: "pickPart"; n: number }               // part 模式選第 n 個部位（part 模式時 abilitySlot:n 也等同此）
  // 以下是畫面設定（DOM 自己處理；controller 收到不改戰局，只回 snapshot）：
  | { type: "zoom"; dir: 1 | -1 | 0 }             // 放大／縮小／回到自動貼合；以游標格（或滑鼠所在格）為中心
  | { type: "cycleAnim" };                        // 動畫 開→快→關→開

/** keymap.json 的形狀（資料驅動快捷鍵；改綁只改 JSON）。 */
export type KeyBinding = { action: string; keys: string[]; label: string };
export type KeymapFile = { version: 1; bindings: KeyBinding[] };
/** 正規化後的按鍵：修飾鍵順序固定 Ctrl+Alt+Shift+<key>，key 用 KeyboardEvent.key（單一字母一律小寫）。 */
export type KeyInput = { key: string; ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean };
