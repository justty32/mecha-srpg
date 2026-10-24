// ui-adapter/ops/dom/fixtures — 手造 OpsSnapshot（階段一：不靠 vm，只照凍結契約 types.ts）。
// 涵蓋八個分頁、disabled 按鈕、prompt＋naming、編成、戰果報告。
import type { BattleReport, OpsButton, OpsSnapshot, OpsTab, OpsUiAction, PromptView, SortieView } from "../vm/types.ts";

const btn = (id: string, label: string, group: string, action: OpsUiAction, extra: Partial<OpsButton> = {}): OpsButton => ({
  id, label, group, action, enabled: true,
  tooltip: extra.key ? `${label}\n快捷鍵：${extra.key}` : label, ...extra,
});

const TAB_NAMES: [OpsTab, string, string][] = [["ship", "船艙", "F1"], ["world", "世界圖", "F2"], ["contracts", "契約", "F3"], ["roster", "名冊", "F4"],
  ["mechs", "機甲", "F5"], ["ledger", "帳本", "F6"], ["market", "市場", "F7"], ["calendar", "日曆", "F8"]];

export function opsFixture(tab: OpsTab = "ship"): OpsSnapshot {
  return {
    header: {
      day: 15, month: 1, dom: 15, daysPerMonth: 28, phase: "spring", phaseName: "大潮", dateText: "第 1 蝕月 第 15 日（大潮）",
      cash: 12400, debt: 30000, location: "嶺口", route: null, docked: true, pressure: 3,
      fuel: { cur: 40, max: 60 }, hull: { cur: 85, max: 100 },
    },
    tab,
    tabs: TAB_NAMES.map(([t, label, key]) => btn(`tab:${t}`, label, "tabs", { type: "tab", tab: t }, { key, active: t === tab })),
    timeButtons: [
      btn("advance:day", "推進一天", "time", { type: "advance", until: "day" }, { key: "." }),
      btn("advance:event", "到下個事件", "time", { type: "advance", until: "event" }, { key: "Shift+." }),
    ],
    room: { id: "bridge", title: "艦橋", desc: ["主螢幕亮著航線圖。", "通訊台有一則未讀委託。"] },
    roomButtons: [
      btn("go:hangar", "機庫", "rooms", { type: "cmd", cmd: { v: "go", room: "hangar" } }, { key: "2" }),
      btn("go:galley", "酒艙", "rooms", { type: "cmd", cmd: { v: "go", room: "galley" } }, { key: "5" }),
      btn("room:dock", "停泊進城", "room", { type: "cmd", cmd: { v: "dock" } }, { key: "D", enabled: false, reason: "已經停泊" }),
      btn("room:save", "存檔", "room", { type: "cmd", cmd: { v: "save" } }, { key: "Ctrl+s" }),
    ],
    world: {
      nodes: [
        { id: "place/ridge", name: "嶺口", x: .2, y: .3, body: "earth", kind: "city", kindName: "城邦", owner: "fac/union", ownerName: "聯合", blight: null, rift: null,
          here: true, destination: false, selected: true, contracts: 1 },
        { id: "place/marsh", name: "沼原", x: .6, y: .5, body: "earth", kind: "wild", kindName: "荒野", owner: null, ownerName: null,
          blight: { depth: "deep", depthName: "深層" }, rift: { id: "rift/1", phase: "open", phaseName: "張開", width: "中" },
          here: false, destination: true, selected: false, contracts: 0 },
        { id: "place/luna", name: "靜海站", x: .9, y: .1, body: "moon", kind: "port", kindName: "港", owner: "fac/lunar", ownerName: "月港", blight: null, rift: null,
          here: false, destination: false, selected: false, contracts: 0 },
      ],
      routes: [
        { id: "r1", a: "place/ridge", b: "place/marsh", days: 3, kind: "陸路", open: true, onPath: true },
        { id: "r2", a: "place/marsh", b: "place/luna", days: 6, kind: "渡輪", open: false, onPath: false },
      ],
      selected: { id: "place/ridge", name: "嶺口", lines: ["聯合所屬城邦", "服務：市場、酒館、登記處"], buttons: [
        btn("sail:place/marsh", "航向沼原", "world", { type: "cmd", cmd: { v: "sail", to: "place/marsh" } }, { key: "S" }),
        btn("dock:place/ridge", "停泊", "world", { type: "cmd", cmd: { v: "dock" } }, { enabled: false, reason: "已經停泊" }),
      ] },
    },
    contracts: [
      { id: "contract-18", title: "清剿：沼原", kind: "clear", kindName: "清剿", issuerName: "聯合", nodeId: "place/marsh", nodeName: "沼原",
        status: "offered", statusName: "可接", total: 18000, advance: 4000, perHead: 300, deadlineDay: 30, daysLeft: 15,
        enemy: "犬族・中寬・深層・張開", selected: true, buttons: [
          btn("accept:contract-18", "接約", "contract", { type: "cmd", cmd: { v: "accept", contract: "contract-18" } }, { key: "A", tone: "primary" }),
          btn("drop:contract-18", "放棄", "contract", { type: "cmd", cmd: { v: "drop", contract: "contract-18" } }, { tone: "danger", enabled: false, reason: "尚未接約" }),
          btn("sortie:contract-18", "出戰", "contract", { type: "sortieOpen", contract: "contract-18" }, { key: "B", enabled: false, reason: "不在目標地點" }),
        ] },
      { id: "contract-19", title: "護送：靜海站", kind: "escort", kindName: "護送", issuerName: "月港", nodeId: "place/luna", nodeName: "靜海站",
        status: "active", statusName: "進行中", total: 9000, advance: 0, perHead: 0, deadlineDay: 40, daysLeft: 25, enemy: null, selected: false, buttons: [] },
    ],
    roster: [
      { id: "p1", name: "林霧", kind: "human", role: "pilot", roleName: "駕駛", hp: { cur: 20, max: 24 }, mood: 6, wage: 300, owed: 0, seat: "蒼鷹", status: "待命", selected: true },
      { id: "p2", name: "燼七", kind: "soul", role: "soul", roleName: "機魂", hp: null, mood: 3, wage: 0, owed: 0, seat: null, status: "沉睡", selected: false },
    ],
    mechs: [
      { id: "m1", name: "蒼鷹", titles: [{ name: "蒼鷹", kind: "nickname", kindName: "小名" }, { name: "R-0451", kind: "registry", kindName: "登記號" }],
        frameName: "斥候機", grade: "B", where: "hangar", whereName: "機庫",
        parts: [{ id: "body", name: "軀幹", broken: false, hp: 50, max: 60 }, { id: "arm-l", name: "左臂", broken: true, hp: 0, max: 30 }],
        pools: [{ id: "energy", name: "能源", cur: 8, max: 10 }],
        seats: [{ seat: "pilot", seatName: "主駕", person: "p1", personName: "林霧" }],
        beast: null, jobs: ["修理左臂（40%）"], selected: true,
        buttons: [btn("queue:repair:m1", "排修理", "mech", { type: "cmd", cmd: { v: "queue", job: {} } }, { enabled: false, reason: "佇列已滿" })] },
      { id: "m2", name: "犬三", titles: [{ name: "犬三", kind: "nickname", kindName: "小名" }], frameName: "活捕獸", grade: "C", where: "restraint", whereName: "拘束艙",
        parts: [{ id: "body", name: "軀幹", broken: false, hp: 80, max: 80 }], pools: [], seats: [],
        beast: { kind: "live", kindName: "活捕", wear: 55, vitality: 70, sustainDue: 20 }, jobs: [], selected: false, buttons: [] },
    ],
    ledger: {
      accounts: [{ account: "cash", name: "現金", balance: 12400 }, { account: "debt", name: "船債", balance: -30000 }],
      recent: [{ day: 14, account: "cash", name: "現金", delta: -900, reason: "薪水" }, { day: 12, account: "cash", name: "現金", delta: 4000, reason: "預付款" }],
    },
    market: {
      available: true, reason: null, name: "嶺口市集",
      items: [{ id: "fuel", name: "燃料", kind: "supply", kindName: "補給", price: 50, stock: 99, buttons: [
        btn("buy:fuel", "買", "market", { type: "cmd", cmd: { v: "trade", market: "mk/ridge", buy: ["fuel"] } }),
      ] }],
    },
    calendar: {
      dom: 15, daysPerMonth: 28, month: 1, nextSpringIn: 0,
      days: Array.from({ length: 28 }, (_, i) => ({ dom: i + 1, phase: (i + 1 === 15 || i + 1 === 1 ? "spring" : i + 1 === 8 || i + 1 === 22 ? "neap" : "ordinary") as "spring" | "neap" | "ordinary",
        today: i + 1 === 15, deadline: i + 1 === 28 })),
      upcoming: [{ day: 28, text: "薪水日" }, { day: 30, text: "契約期限：清剿：沼原" }],
    },
    panels: { rifts: [{ id: "rift/1", nodeName: "沼原", phaseName: "張開", width: "中" }], queue: [{ id: "j1", text: "修理左臂", progress: .4 }] },
    log: [
      { day: 14, text: "付了薪水 900。", kind: "money" },
      { day: 15, text: "大潮來了。", kind: "info" },
      { day: 15, text: "沼原的裂縫張開。", kind: "warn" },
      { day: 15, text: "林霧手上的傷口又裂了。", kind: "blood" },
      { day: 15, text: "燼七在夢裡說話。", kind: "soul" },
    ],
    prompt: null, sortie: null, battle: null, report: null, message: null,
    keyHints: [{ label: "推進一天", keys: ["."] }, { label: "說明", keys: ["?"] }, { label: "取消", keys: ["Escape"] }],
    showHelp: false, over: false,
  };
}

export function promptFixture(naming = false): PromptView {
  return {
    text: naming ? "這台機體該叫什麼？" : "酒艙裡有人吵起來了。",
    choices: [
      { n: 1, text: "勸架", key: "1", enabled: true },
      { n: 2, text: "賞一杯酒", key: "2", enabled: false, reason: "現金不足" },
      ...(naming ? [{ n: 3, text: "自填", key: "3", enabled: true }] : []),
    ],
    naming: naming ? { placeholder: "輸入名字" } : null,
  };
}

export function sortieFixture(): SortieView {
  return {
    contract: "contract-18", title: "清剿：沼原", nodeName: "沼原",
    units: [
      { mech: "m1", name: "蒼鷹", included: true, enabled: true, seats: [{ seat: "pilot", seatName: "主駕", person: "p1", options: [{ id: "p1", name: "林霧" }, { id: "p3", name: "阿岳" }] }] },
      { mech: "m2", name: "犬三", included: false, enabled: false, reason: "活捕獸不能出戰", seats: [] },
    ],
    error: "至少要有一台有駕駛",
    buttons: [
      { id: "sortie:command", label: "親自指揮", group: "sortie", key: "Enter", tooltip: "進戰場親自指揮\n快捷鍵：Enter", enabled: false, reason: "至少要有一台有駕駛", tone: "primary", action: { type: "sortieLaunch", mode: "command" } },
      { id: "sortie:auto", label: "AI 自動結算", group: "sortie", tooltip: "不進戰場", enabled: true, action: { type: "sortieLaunch", mode: "auto" } },
      { id: "sortie:cancel", label: "取消", group: "sortie", key: "Esc", tooltip: "取消編成\n快捷鍵：Esc", enabled: true, action: { type: "sortieCancel" } },
    ],
  };
}

export function reportFixture(): BattleReport {
  return { title: "戰果：清剿：沼原", winnerText: "我方勝利", rounds: 7, lines: ["契約完成，報酬 14000", "蒼鷹 左臂損毀", "戰利品：犬族整屍 ×1"], cashDelta: 14000 };
}
