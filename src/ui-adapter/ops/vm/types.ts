// ui-adapter/ops/vm/types — 營運畫面 vm↔dom 凍結契約（lead-ui-ops 寫死；改動要領導同意）。
// 方向：OpsController（純邏輯，node 可測）把 ops 的 CampaignState＋render(Screen) 轉成 OpsSnapshot（純資料）；
// DOM 只負責畫 OpsSnapshot，點擊與按鍵一律轉成 OpsUiAction 交回 controller。DOM 層不 import ops／rules／ai／sim／content。
// 呈現方針（使用者 2026-10-24 裁示）：按鈕／列表／面板／tooltip＋快捷鍵；面板常駐、不能按的按鈕變灰並寫原因；不做文字指令列。
// 戰鬥：snapshot.battle 非 null 時 DOM 改掛戰鬥畫面（BattleController 由 controller.battleController() 取得），
// 戰鬥分出勝負後玩家按「返回營運」→ 送 { type: "battleDone" }，controller 回寫戰果並在 snapshot.report 顯示。

import type { OpsCommand } from "../../../ops/state/types.ts";

/** 營運畫面的分頁（面板常駐，分頁只切主區內容）。 */
export type OpsTab = "ship" | "world" | "contracts" | "roster" | "mechs" | "ledger" | "market" | "calendar";

/** 按鈕：DOM 畫成 <button data-action-id=id>，標上 key、tooltip；enabled false 時灰掉、tooltip 末行寫 reason。 */
export type OpsButton = {
  id: string;                       // 穩定 id（測試與 e2e 用），例 "tab:world"、"advance:event"、"accept:contract-18"、"sail:base:place/ridge"
  label: string;                    // 中文按鈕字
  group: string;                    // 分組：tabs／rooms／room／time／world／contract／sortie／prompt／market／system…
  key?: string;                     // 顯示用快捷鍵（keymap 取得；例 "W"、"F2"、"1"、"Esc"）
  tooltip: string;                  // 說明；多行用 \n；有 key 時末行「快捷鍵：X」
  enabled: boolean;
  reason?: string;                  // 不能按的原因（中文）
  active?: boolean;                 // 目前狀態就是它（例：所在分頁、已選取）
  tone?: "primary" | "danger";      // 外觀提示（出戰＝primary；放棄契約＝danger）
  action: OpsUiAction;
};

export type OpsUiAction =
  | WorldMapAction
  | { type: "cmd"; cmd: OpsCommand }                       // 任何 ops 指令（經 ops applyCommand 送出；按鈕、快捷鍵、文字形式結果恆等）
  | { type: "tab"; tab: OpsTab }
  | { type: "advance"; until: "day" | "event" }            // 推進一天／到下個事件（連續 wait 1，遇 prompt、新契約、抵達、裂縫變化、戰鬥待命或上限日數停）
  | { type: "selectNode"; node: string }                   // 世界圖點地點（顯示詳情與航行按鈕）
  | { type: "selectContract"; contract: string }
  | { type: "selectMech"; mech: string }
  | { type: "selectPerson"; person: string }
  | { type: "sortieOpen"; contract?: string }              // 打開編成畫面（預設自動帶入可出戰的機體與駕駛）
  | { type: "sortieToggle"; mech: string }                 // 編成：加入／移出一台
  | { type: "sortieAi"; mech: string; enabled: boolean }
  | { type: "sortieSeat"; mech: string; seat: string; person: string | null }   // 編成：換座位上的人
  | { type: "sortieLaunch"; mode: "command" | "auto" }     // command＝進戰場親自指揮；auto＝AI 自動結算（不進戰場）
  | { type: "sortieCancel" }
  | { type: "nameSubmit"; name: string }                   // 命名 prompt 的「自填」：送出輸入的名字
  | { type: "battleDone" }                                 // 戰鬥已分勝負，回營運並回寫戰果
  | { type: "dismissReport" }                              // 關閉戰果報告
  | { type: "toggleHelp" }
  | { type: "cancel" };                                    // Esc：關說明／關報告／取消編成（依序）

/** 頂列常駐資訊。 */
export type OpsHeader = {
  day: number; month: number; dom: number; daysPerMonth: number;
  phase: "spring" | "neap" | "ordinary"; phaseName: string;   // 大潮／小潮／平潮
  dateText: string;                 // 例「第 1 潮月 第 15 日（大潮）」
  cash: number; debt: number;
  location: string;                 // 所在地點名（航行中為「航行中 → 目的地」）
  route: { to: string; toName: string; daysLeft: number } | null;
  docked: boolean;                  // 停泊（進城）或懸停
  pressure: number;                 // 潮壓
  fuel: { cur: number; max: number }; hull: { cur: number; max: number };
};

/** 世界圖。座標 0..1（vm 決定性排版；依地點座標縮放）。 */
export type WorldNodeView = {
  id: string; name: string; x: number; y: number;
  body: "earth" | "moon"; kind: string; kindName: string;
  owner: string | null; ownerName: string | null;
  blight: { depth: "shallow" | "deep" | "core"; depthName: string } | null;   // 蝕域
  rift: { id: string; phase: string; phaseName: string; width: string } | null;
  here: boolean; destination: boolean; selected: boolean;
  contracts: number;                // 以此為目標的 offered／active 契約數
};
export type WorldRouteView = { id: string; a: string; b: string; days: number; kind: string; open: boolean; onPath: boolean };
export type WorldView = {
  grid?: WorldGridSnapshot;
  nodes: WorldNodeView[]; routes: WorldRouteView[];
  selected: { id: string; name: string; lines: string[]; buttons: OpsButton[] } | null;   // 選取地點詳情：所有權、服務、蝕域、裂縫、航程天數與燃料
};

export type WorldLayer = "terrain" | "blight" | "places" | "actors" | "path" | "region" | "fog" | "sight" | "territory";
export type MapCell = { x: number; y: number };
export type WorldMapAction =
  | { type: "mapCursor"; x: number; y: number }
  | { type: "mapHover"; x: number; y: number }
  | { type: "mapMove"; dx: number; dy: number }
  | { type: "mapScroll"; dx: number; dy: number }
  | { type: "mapViewport"; x: number; y: number }
  | { type: "mapResize"; w: number; h: number }
  | { type: "mapZoom"; dir: -1 | 0 | 1 }
  | { type: "mapNext"; dir: -1 | 1 }
  | { type: "mapLayer"; layer: WorldLayer }
  | { type: "mapSwitch"; map: string }
  | { type: "mapCenter" | "mapLayers" | "mapMaps" | "mapMinimap" | "mapCancel" };
export type WorldCellView = {
  x: number; y: number; classes: string[]; glyph: string; badge: string; title: string;
  color: string; age: number; place: string | null; region: string;
};
export type WorldPathPreview = { cells: MapCell[]; days: number; fuel: number; risk: number[]; reachable: boolean; note: string };
export type WorldGridSnapshot = {
  map: string; name: string; size: { w: number; h: number }; viewport: { x: number; y: number; w: number; h: number };
  cells: WorldCellView[]; cursor: MapCell; ship: MapCell; zoom: 1 | .5 | .25;
  layers: Record<WorldLayer, boolean>; layerMenu: boolean; mapMenu: boolean; showMinimap: boolean;
  maps: { id: string; name: string }[]; hover: { at: MapCell; lines: string[] }; preview: WorldPathPreview;
  actions: OpsButton[]; minimap: { w: number; h: number; colors: string[] };
};

/** 船艙房間（ops Screen.room）。 */
export type RoomView = { id: string; title: string; desc: string[] };

export type ContractView = {
  id: string; title: string;        // 「清剿：嶺口」
  kind: string; kindName: string;
  issuerName: string; nodeId: string; nodeName: string;
  status: string; statusName: string;
  total: number; advance: number; perHead: number;
  deadlineDay: number; daysLeft: number;
  enemy: string | null;             // 敵情快照一句（族、寬度、深度、phase）
  selected: boolean;
  buttons: OpsButton[];             // 接約、談判三種、放棄、航向、出戰
};

export type PersonRow = {
  id: string; name: string; kind: "human" | "soul" | string;
  role: string; roleName: string;
  hp: { cur: number; max: number } | null;
  mood: number; wage: number; owed: number;
  driveHours?: number; apparentAge?: number | null; realAge?: number | null;
  seat: string | null;              // 坐在哪台（機甲名）
  status: string;                   // 「待命」「出戰中」「負傷」「死亡」…
  selected: boolean;
};

export type MechRow = {
  id: string; name: string;         // 顯示名（稱號／小名／登記號，沒有就機體名）
  titles: { name: string; kind: string; kindName: string }[];   // 全部稱號（title／registry／nickname／dread／epithet）
  frameName: string; grade: string;
  where: "hangar" | "restraint" | "dormant" | string; whereName: string;
  parts: { id: string; name: string; broken: boolean; hp: number; max: number }[];
  pools: { id: string; name: string; cur: number; max: number | null }[];
  seats: { seat: string; seatName: string; person: string | null; personName: string | null }[];
  beast: { kind: "live" | "corpse"; kindName: string; wear: number; vitality: number; sustainDue: number | null } | null;   // 生物系：磨損／活性
  jobs: string[];                   // 佇列中與它有關的工作（文字）
  selected: boolean;
  buttons: OpsButton[];
};

export type LedgerView = {
  accounts: { account: string; name: string; balance: number }[];
  recent: { day: number; account: string; name: string; delta: number; reason: string }[];   // 新→舊，最多 30
};

export type MarketView = {
  available: boolean; reason: string | null;   // 例「此地沒有市場」「航行中」
  name: string | null;
  items: { id: string; name: string; kind: string; kindName: string; price: number; stock: number; buttons: OpsButton[] }[];
};

export type CalendarView = {
  dom: number; daysPerMonth: number; month: number;
  days: { dom: number; phase: "spring" | "neap" | "ordinary"; today: boolean; deadline: boolean }[];   // 本潮月逐日
  nextSpringIn: number;             // 距下個大潮天數（今天是大潮＝0）
  upcoming: { day: number; text: string }[];   // 契約期限、薪水日等
};

export type PromptView = {
  text: string;
  choices: { n: number; text: string; key?: string; enabled: boolean; reason?: string }[];
  naming: { placeholder: string } | null;      // 命名 prompt：DOM 另畫輸入框＋送出（nameSubmit）；「自填」選項即此
};

export type SortieView = {
  contract: string | null; title: string; nodeName: string;
  units: { mech: string; name: string; included: boolean; ai?: boolean; enabled: boolean; reason?: string;
    seats: { seat: string; seatName: string; person: string | null; options: { id: string; name: string }[] }[] }[];
  error: string | null;             // validateSortie 的拒絕原因（中文）；null＝可出戰
  buttons: OpsButton[];             // 親自指揮、AI 自動結算、取消
};

/** 戰果回寫報告（battleDone 或 auto 結算後出現，dismissReport 關掉）。 */
export type BattleReport = {
  title: string; winnerText: string; rounds: number;
  lines: string[];                  // 契約結果、報酬、機體與人員狀態、戰利品、裂縫變化
  cashDelta: number;
};

export type OpsLogLine = { day: number; text: string; kind: "info" | "warn" | "money" | "blood" | "soul" };

export type OpsSnapshot = {
  header: OpsHeader;
  tab: OpsTab;
  tabs: OpsButton[];                // 分頁按鈕（常駐）
  timeButtons: OpsButton[];         // 推進一天、到下個事件（常駐）
  room: RoomView;
  roomButtons: OpsButton[];         // 船艙：走到各房間（group rooms）＋本房動作（group room，來自 ops Screen.actions）
  world: WorldView;
  contracts: ContractView[];
  roster: PersonRow[];
  mechs: MechRow[];
  ledger: LedgerView;
  market: MarketView;
  calendar: CalendarView;
  panels: { rifts: { id: string; nodeName: string; phaseName: string; width: string }[]; queue: { id: string; text: string; progress: number }[] };   // 側欄常駐小表
  log: OpsLogLine[];                // 最近 200 行，舊→新
  prompt: PromptView | null;        // 事件／對話／命名；非 null 時多數按鈕 disabled（reason「先回應事件」）
  sortie: SortieView | null;        // 編成畫面
  battle: { title: string; spectate: boolean } | null;   // 戰場進行中
  report: BattleReport | null;
  message: string | null;           // 最近一則提示（指令被拒的中文原因等）
  keyHints: { label: string; keys: string[] }[];
  showHelp: boolean;
  over: boolean;                    // 戰役終局（CampaignEnd）
};

/** 正規化按鍵（與戰鬥 vm 同文法：修飾鍵順序 Ctrl+Alt+Shift+<key>，單字母小寫）。 */
export type OpsKeyInput = { key: string; ctrlKey?: boolean; altKey?: boolean; shiftKey?: boolean };
