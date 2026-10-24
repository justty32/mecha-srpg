import type { ContentDB } from "../../content/contentdb.ts";
import type { CampaignEvent, CampaignState, Screen } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { evalOpsCond } from "../content/cond.ts";
import { currentRoom, describeRoom } from "./rooms.ts";
import { eventLog } from "./templates.ts";
import { entityName } from "./parse.ts";

export function render(state: CampaignState, events: CampaignEvent[], world: WorldDB, db: ContentDB): Screen {
  const room = describeRoom(currentRoom(state), state, world, db);
  const screen: Screen = { room, log: events.map(event => eventLog(event, state, world)), panels: {
    ledger: ["cash", "debt", "stock:feed", "stock:fuel"].map(account => ({ account, balance: state.ledger.balances[account as keyof typeof state.ledger.balances] ?? 0 })),
    roster: Object.keys(state.roster.persons).sort().map(id => ({ id, name: entityName(id, state, world),
      role: state.roster.employment[id]?.role ?? "", owed: state.roster.employment[id]?.owed ?? 0 })),
    rifts: Object.keys(state.rifts).sort().map(id => ({ id, node: state.rifts[id]!.node, phase: state.rifts[id]!.phase, width: state.rifts[id]!.width })),
    queue: [...state.jobs].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id)).map(j => ({ id: j.id, kind: j.kind, target: j.target, done: j.doneHours, need: j.needHours, priority: j.priority })),
    ship: [{ at: state.ship.at, destination: state.ship.route?.to ?? null, daysLeft: state.ship.route?.daysLeft ?? 0, fuel: state.ship.fuel.cur, hull: state.ship.hull.cur }],
  }, actions: [{ label: "環顧四周", cmd: { v: "look" } }, { label: "存檔", cmd: { v: "save" } }, { label: "指令說明", cmd: { v: "help" } }] };
  const pending = state.pendingChoices[0];
  if (pending) {
    screen.prompt = { text: pending.text, choices: pending.choices.map((choice, i) => {
      const allowed = !choice.requires || evalOpsCond(state, { world, db }, choice.requires, { person: pending.person });
      if (allowed) screen.actions.push({ label: choice.text, cmd: { v: "choose", choice: i + 1 } });
      return { n: i + 1, text: choice.text, ...(!allowed ? { disabled: "條件尚未成立" } : {}) };
    }) };
    return screen;
  }
  // SPEC-GAP：pendingBattle 是 Sortie 而非 ScenarioDef；handoff 留給階段 3 產生戰場。
  if (state.pendingBattle) return screen;
  for (const exit of room.exits) screen.actions.push({ label: `走到${describeRoom(exit, state, world, db).title}`, cmd: { v: "go", room: exit } });
  const occupants = state.ship.rooms[room.id]?.persons ?? [];
  for (const id of [...occupants].sort()) if (state.roster.persons[id]) screen.actions.push({ label: `與${entityName(id, state, world)}談話`, cmd: { v: "talk", who: id } });
  if (room.id === "bridge") {
    screen.actions.push({ label: "查看世界圖", cmd: { v: "map" } }, { label: "查看契約板", cmd: { v: "board" } });
    for (const id of Object.keys(state.contracts).sort()) if (["offered", "active", "stage"].includes(state.contracts[id]!.status)) screen.actions.push({ label: `查看契約 ${id}`, cmd: { v: "board", contract: id } });
  }
  if (room.id === "hangar") for (const id of [...state.hangar.bays, ...state.hangar.dormant].filter((id): id is string => id !== null).sort()) {
    if (state.mechs[id] && !screen.actions.some(a => a.cmd.v === "look" && a.cmd.target === id)) screen.actions.push({ label: `查看${entityName(id, state, world)}`, cmd: { v: "look", target: id } });
  }
  if (room.id === "stable" && (state.ledger.balances["stock:feed"] ?? 0) > 0) for (const pen of [...state.stable.pens].sort((a, b) => a.mech.localeCompare(b.mech))) {
    if (state.mechs[pen.mech] && pen.hunger > 0) screen.actions.push({ label: `餵${entityName(pen.mech, state, world)}`, cmd: { v: "feed", pen: pen.mech, amount: 1 } });
  }
  screen.actions.push({ label: state.ship.route ? "航行一天" : "等待一天", cmd: { v: "wait", days: 1 } });
  return screen;
}
