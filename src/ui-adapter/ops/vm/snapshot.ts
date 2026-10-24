import type { CampaignState, OpsCtx, OpsCommand, Sortie } from "../../../ops/state/types.ts";
import { applyCommand } from "../../../ops/time/index.ts";
import { render } from "../../../ops/text/render.ts";
import { clock } from "../../../ops/state/clock.ts";
import { placeAt } from "../../../ops/war/loc.ts";
import { allPlaces, requirePlace } from "../../../ops/world/places.ts";
import { isDocked, shortestPath } from "../../../ops/world/move.ts";
import { marketPrice, marketListings } from "../../../ops/world/market.ts";
import type { MarketState } from "../../../ops/world/market.ts";
import { peekCrew } from "../../../ops/crew/shared.ts";
import type { NamingPrompt } from "../../../ops/crew/names.ts";
import type { BattleReport, OpsButton, OpsSnapshot, OpsTab, OpsUiAction } from "./types.ts";
import { layoutNodes } from "./layout.ts";
import { displayName, label, rejection } from "./labels.ts";
import { formationView, draftSortie, draftError } from "./formation.ts";
import { allButtons } from "./keymap.ts";
import { WorldViewModel, createWorldUi, type WorldUi } from "./world.ts";
import { blightAt } from "../../../ops/world/blight.ts";

export type ViewState = {
  map?: WorldUi;
  tab: OpsTab; node: string | null; contract: string | null; mech: string | null; person: string | null;
  draft: Sortie | null; battle: OpsSnapshot["battle"]; report: BattleReport | null; message: string | null; showHelp: boolean;
};
export function button(id: string, text: string, group: string, action: OpsUiAction, reason?: string): OpsButton {
  return { id, label: text, group, tooltip: `${text}${reason ? `\n${reason}` : ""}`, enabled: !reason, ...(reason ? { reason } : {}), action };
}
export function buildSnapshot(s: CampaignState, ctx: OpsCtx, ui: ViewState): OpsSnapshot {
  const { db, world } = ctx, name = (id: string) => displayName(s, db, world, id);
  // 帳目明細（Posted）在帳本分頁看，記錄列表略過以免洗版。
  const screen = render(s, s.log.filter(e => e.type !== "Posted").slice(-200), world, db), cal = world.require("calendar", s.calendar);
  const over = s.log.some(e => e.type === "CampaignEnd"), pending = s.pendingChoices[0];
  const cmdButton = (id: string, text: string, group: string, cmd: OpsCommand, disabled?: string): OpsButton => {
    const result = cmd.v === "wait" ? { ok: true as const } : applyCommand(s, db, world, cmd).result;
    return button(id, text, group, { type: "cmd", cmd }, disabled ?? (!result.ok ? rejection(result.error) : undefined));
  };
  const openButton = (id: string, group: string, contract?: string): OpsButton => {
    const draft = draftSortie(s, ctx, contract);
    const result = applyCommand(s, db, world, { v: "sortie", sortie: draft }, { battle: (copy, context, sortie) => {
      const error = draftError(copy, context, sortie); return error ? { ok: false, error } : { ok: true };
    } }).result;
    return button(id, "出戰編成", group, { type: "sortieOpen", ...(contract ? { contract } : {}) }, !result.ok ? result.error === "pending-choice" ? rejection(result.error) : result.error : undefined);
  };
  const pathState = s.ship.path, here = placeAt(s, ctx, s.ship.pos), docked = isDocked(s, ctx);
  const destination = pathState?.to;
  const targetPlace = destination && "place" in destination ? destination.place : undefined;
  const targetName = destination ? "place" in destination ? name(destination.place) : "actor" in destination ? name(destination.actor) : `${destination.cell.x},${destination.cell.y}` : "";
  const route = pathState ? { to: targetPlace ?? targetName, toName: targetName, daysLeft: s.pendingTicks } : undefined;
  const roomButtons = screen.actions.map(a => cmdButton(a.id, a.label, a.group, a.cmd, a.disabled));
  roomButtons.push(cmdButton("dock", "停泊", "world", { v: "dock" }), cmdButton("drift", "懸停", "world", { v: "drift" }));
  roomButtons.push(openButton("sortieOpen", "sortie", ui.contract ?? undefined));
  if (ui.showHelp || ui.report) roomButtons.push(button("cancel", "關閉", "system", { type: "cancel" }));
  for (const c of Object.values(peekCrew(s)?.candidates ?? {}).filter(c => c.place === here))
    roomButtons.push(cmdButton(`hire:${c.id}`, `招募${db.require("person", c.person.def).name}（${c.fee}，月薪${c.wage}）`, "market", { v: "hire", candidate: c.id }));
  const nodes = allPlaces(s, ctx), points = layoutNodes(nodes);
  const contracts = Object.values(s.contracts).sort((a, b) => a.id.localeCompare(b.id)).map(c => {
    const kind = world.require("contract", c.template).kind, target = c.target.snapshot;
    const buttons = [cmdButton(`accept:${c.id}`, "接約", "contract", { v: "accept", contract: c.id }),
      ...(["total", "advance", "perHead"] as const).map((ask, i) => cmdButton(`ask:${c.id}:${ask}`, ["談總價", "談預付", "談按頭"][i]!, "contract", { v: "accept", contract: c.id, ask })),
      cmdButton(`drop:${c.id}`, "放棄", "contract", { v: "drop", contract: c.id }),
      cmdButton(`sail:contract:${c.id}`, "航向目標", "contract", { v: "sail", to: c.target.place }),
      openButton(`sortieOpen:${c.id}`, "contract", c.id)];
    return { id: c.id, title: `${label(kind)}：${name(c.target.place)}`, kind, kindName: label(kind), issuerName: name(c.issuer), nodeId: c.target.place,
      nodeName: name(c.target.place), status: c.status, statusName: label(c.status), ...c.terms, deadlineDay: c.deadlineDay,
      daysLeft: Math.max(0, c.deadlineDay - s.clock.day), enemy: target ? `${label(target.family)}／${target.width}／${label(target.depth)}${target.phase ? `／${label(target.phase)}` : ""}` : null,
      selected: ui.contract === c.id, buttons };
  });
  const worldNodes = nodes.map(n => {
    const current = s.places[n.id], owner = current?.ownerOverride ?? n.owner ?? null;
    const blight = blightAt(s, ctx, { map: n.map, region: "", cell: n.at });
    const rift = Object.values(s.rifts).find(r => r.site === n.id && r.phase !== "closed");
    return { id: n.id, name: n.name, ...points.get(n.id)!, body: n.kind === "lunar-base" ? "moon" as const : "earth" as const, kind: n.kind, kindName: label(n.kind), owner, ownerName: owner ? name(owner) : null,
      blight: blight ? { depth: blight.depth, depthName: label(blight.depth) } : null,
      rift: rift ? { id: rift.id, phase: rift.phase, phaseName: label(rift.phase), width: rift.width } : null,
      here: n.id === here, destination: n.id === targetPlace, selected: n.id === ui.node,
      contracts: contracts.filter(c => c.nodeId === n.id && ["offered", "active", "stage"].includes(c.status)).length };
  });
  const selected = worldNodes.find(n => n.selected), selectedDef = selected && requirePlace(s, ctx, selected.id);
  const path = selected && shortestPath(s, ctx, s.ship.pos, selected.id);
  const market = world.all("market").find(m => m.place === here);
  const marketReason = route ? "航行中" : !market ? "此地沒有市場" : !docked ? "須先停泊" : null;
  const marketItems: OpsSnapshot["market"]["items"] = market ? marketListings(s, ctx, market).map(({ kind, item }) => ({
    id: item.def, name: name(item.def), kind, kindName: label(kind), price: marketPrice(s, ctx, market, item),
    stock: (s as MarketState).markets?.[market.id]?.stock[item.def] ?? item.stockMax,
    buttons: [cmdButton(`buy:${market.id}:${item.def}`, "買一件", "market", { v: "trade", market: market.id, buy: [item.def] }),
      ...(["component", "frame"].includes(kind) ? [] : [cmdButton(`sell:${market.id}:${item.def}`, "賣一件", "market", { v: "trade", market: market.id, sell: [item.def] })])],
  })) : [];
  if (market) for (const owned of [...s.inventory.components.map(c => ({ id: c.id, def: c.def, kind: "component" })), ...s.inventory.mechs.filter(id => s.mechs[id]).map(id => ({ id, def: s.mechs[id]!.frame, kind: "frame" }))]) {
    const item = marketListings(s, ctx, market).map(l => l.item).find(i => i.def === owned.def); if (!item) continue;
    marketItems.push({ id: owned.id, name: name(owned.def), kind: owned.kind, kindName: `${label(owned.kind)}（持有）`, price: marketPrice(s, ctx, market, item), stock: 1,
      buttons: [cmdButton(`sell:${market.id}:${owned.id}`, "出售", "market", { v: "trade", market: market.id, sell: [owned.id] })] });
  }
  const mechs = Object.values(s.mechs).map(m => {
    const frame = db.require("frame", m.frame), body = db.require("bodyplan", frame.bodyPlan), beast = s.restraint.beasts[m.id];
    const pools = [...frame.pools, ...Object.values(m.parts).flatMap(p => Object.values(p.components).flatMap(id => id ? db.get("component", s.inventory.components.find(c => c.id === id)?.def ?? id)?.pools ?? [] : []))];
    const where = s.hangar.dormant.includes(m.id) ? "dormant" : s.restraint.slots.includes(m.id) ? "restraint" : "hangar";
    return { id: m.id, name: name(m.id), titles: (s.roster.names[m.id] ?? []).map(n => ({ name: n.name, kind: n.kind, kindName: label(n.kind) })),
      frameName: frame.name, grade: frame.grade, where, whereName: label(where),
      parts: Object.entries(m.parts).map(([id, p]) => ({ id, name: body.parts.find(d => d.id === id)?.name ?? id, broken: p.broken,
        hp: p.layers.reduce((n, l) => n + l.hp, 0), max: p.layers.reduce((n, l, i) => n + (l.maxHp ?? body.parts.find(d => d.id === id)?.layers[i]?.hp ?? l.hp), 0) })),
      pools: Object.entries(m.pools).map(([id, p]) => ({ id, name: pools.find(d => d.id === id)?.name ?? label(id), cur: p.cur, max: Number.isFinite(p.max) ? p.max : null })),
      seats: body.parts.flatMap(p => p.seats ?? []).map(seat => ({ seat: seat.id, seatName: seat.accepts.map(label).join("／"), person: m.seats[seat.id] ?? null, personName: m.seats[seat.id] ? name(m.seats[seat.id]!) : null })),
      beast: beast ? { kind: beast.kind, kindName: label(beast.kind), wear: beast.wear, vitality: beast.vitality, sustainDue: beast.sustainDue ?? null } : null,
      jobs: s.jobs.filter(j => j.target === m.id).map(j => `${label(j.kind)} ${j.doneHours}/${j.needHours}`), selected: ui.mech === m.id,
      buttons: screen.actions.filter(a => a.cmd.v === "devour" && a.cmd.beast === m.id || a.cmd.v === "queue" && a.cmd.job.target === m.id).map(a => cmdButton(`mech:${m.id}:${a.id}`, a.label, "mech", a.cmd, a.disabled)) };
  });
  const sortie = ui.draft ? formationView(s, ctx, ui.draft) : null;
  if (sortie) sortie.buttons = [button("sortieLaunch:command", "親自指揮", "sortie", { type: "sortieLaunch", mode: "command" }, sortie.error ?? undefined),
    button("sortieLaunch:auto", "自動結算", "sortie", { type: "sortieLaunch", mode: "auto" }, sortie.error ?? undefined), button("sortieCancel", "取消編成", "sortie", { type: "sortieCancel" })];
  const days = Array.from({ length: cal.daysPerMonth }, (_, i) => {
    const day = s.clock.day - s.clock.dom + i + 1;
    return { dom: i + 1, phase: clock(day, cal).phase, today: i + 1 === s.clock.dom, deadline: contracts.some(c => ["active", "stage"].includes(c.status) && c.deadlineDay === day) };
  });
  const prompt = screen.prompt ? { text: screen.prompt.text, choices: screen.prompt.choices.map(c => ({ n: c.n, text: c.text, enabled: !c.disabled, ...(c.disabled ? { reason: c.disabled } : {}) })),
    naming: (pending as Partial<NamingPrompt>)?.naming ? { placeholder: "請輸入名字" } : null } : null;
  const snapshot: OpsSnapshot = {
    header: { ...s.clock, daysPerMonth: cal.daysPerMonth, phaseName: label(s.clock.phase), dateText: `第 ${s.clock.month + 1} 潮月 第 ${s.clock.dom} 日（${label(s.clock.phase)}）`,
      cash: s.ledger.balances.cash, debt: s.ledger.balances.debt, location: route ? `航行中 → ${targetName}` : here ? name(here) : `${s.ship.pos.cell.x},${s.ship.pos.cell.y}`,
      route: route ?? null, docked, pressure: s.pressure,
      fuel: { cur: s.ship.fuel.cur, max: s.ship.fuel.max }, hull: { cur: s.ship.hull.cur, max: s.ship.hull.max } },
    tab: ui.tab, tabs: (["ship", "world", "contracts", "roster", "mechs", "ledger", "market", "calendar"] as const).map(tab => ({ ...button(`tab:${tab}`, label(tab), "tabs", { type: "tab", tab }), active: tab === ui.tab })),
    timeButtons: [button("advance:day", "推進一天", "time", { type: "advance", until: "day" }), button("advance:event", "到下個事件", "time", { type: "advance", until: "event" })],
    room: { id: screen.room.id, title: screen.room.title, desc: screen.room.desc }, roomButtons,
    world: { nodes: worldNodes, routes: [],
      ...(ui.tab === "world" ? { grid: new WorldViewModel(s, ctx, ui.map ?? createWorldUi(s)).snapshot() } : {}),
      selected: selected ? { id: selected.id, name: selected.name,
        lines: [`座標：${name(selectedDef!.map)} ${selectedDef!.at.x},${selectedDef!.at.y}`, `所有權：${selected.ownerName ?? "無"}`, `服務：${selectedDef!.services.map(id => world.get("room", world.get("service", id)?.room ?? id)?.title ?? label(id)).join("、") || "無"}`,
          `蝕域：${selected.blight?.depthName ?? "無"}`, `裂縫：${selected.rift ? `${selected.rift.phaseName}／${selected.rift.width}` : "無"}`, path ? `航程 ${path.days} 天／燃料 ${path.fuel}` : "沒有可通行航線"],
        buttons: [cmdButton(`sail:${selected.id}`, "航向此地", "world", { v: "sail", to: selected.id })] } : null },
    contracts, mechs,
    roster: Object.values(s.roster.persons).map(p => {
      const e = s.roster.employment[p.id], seat = Object.values(s.mechs).find(m => Object.values(m.seats).includes(p.id));
      return { id: p.id, name: name(p.id), kind: db.require("person", p.def).kind, role: e?.role ?? "soul", roleName: label(e?.role ?? "soul"),
        hp: p.pools.hp ? { cur: p.pools.hp.cur, max: p.pools.hp.max } : null, mood: e?.mood ?? 0, wage: e?.wage ?? 0, owed: e?.owed ?? 0,
        seat: seat ? name(seat.id) : null, status: s.roster.dead.some(d => d.person === p.id) ? "死亡" : p.pools.hp && p.pools.hp.cur < p.pools.hp.max ? "負傷" : ui.battle && ui.draft?.units.some(u => Object.values(u.seats).includes(p.id)) ? "出戰中" : "待命", selected: ui.person === p.id };
    }),
    ledger: { accounts: Object.entries(s.ledger.balances).map(([account, balance]) => ({ account, name: label(account), balance })),
      recent: s.ledger.entries.slice(-30).reverse().map(e => ({ day: e.day, account: e.account, name: label(e.account), delta: e.delta, reason: label(e.reason) })) },
    market: { available: !marketReason, reason: marketReason, name: market ? `${name(market.place)}市場` : null, items: marketItems },
    calendar: { dom: s.clock.dom, daysPerMonth: cal.daysPerMonth, month: s.clock.month, days,
      nextSpringIn: Array.from({ length: cal.daysPerMonth }, (_, i) => i).find(i => clock(s.clock.day + i, cal).phase === "spring") ?? cal.daysPerMonth,
      upcoming: [...contracts.filter(c => ["active", "stage"].includes(c.status)).map(c => ({ day: c.deadlineDay, text: `${c.title}到期` })),
        { day: s.clock.day + cal.daysPerMonth - s.clock.dom + 1, text: "新潮月：薪資結算" }].sort((a, b) => a.day - b.day) },
    panels: { rifts: Object.values(s.rifts).map(r => ({ id: r.id, nodeName: name(r.site), phaseName: label(r.phase), width: r.width })),
      queue: s.jobs.map(j => ({ id: j.id, text: `${label(j.kind)}：${name(j.target)} ${j.doneHours}/${j.needHours}`, progress: j.needHours ? Math.min(1, j.doneHours / j.needHours) : 1 })) },
    log: screen.log, prompt, sortie, battle: ui.battle, report: ui.report, message: ui.message, keyHints: [], showHelp: ui.showHelp, over,
  };
  for (const b of snapshot.world.grid?.actions ?? []) {
    if (b.enabled && b.action.type === "cmd") {
      const checked = cmdButton(b.id, b.label, b.group, b.action.cmd);
      b.enabled = checked.enabled;
      if (checked.reason) { b.reason = checked.reason; b.tooltip += `\n${checked.reason}`; }
    }
  }
  for (const b of allButtons(snapshot)) {
    const isChoice = b.action.type === "cmd" && b.action.cmd.v === "choose";
    const locked = (pending || s.pendingEncounter) && !isChoice ? "先回應事件" : ui.battle ? "戰鬥進行中" : s.pendingBattle && (b.action.type === "advance" || b.action.type === "cmd" && b.action.cmd.v === "wait") ? "先處理待命戰鬥" : over && (b.action.type === "advance" || b.action.type === "cmd") ? "戰役已結束" : undefined;
    if (locked) { b.enabled = false; b.reason = locked; b.tooltip += `\n${locked}`; }
  }
  // prompt 的可用狀態以真正指令試跑為準（包含自填選項需要文字的拒絕）。
  if (snapshot.prompt) for (const c of snapshot.prompt.choices) {
    const b = roomButtons.find(b => b.action.type === "cmd" && b.action.cmd.v === "choose" && b.action.cmd.choice === c.n);
    if (b) { c.enabled = b.enabled; if (b.reason) c.reason = b.reason; }
  }
  return snapshot;
}
