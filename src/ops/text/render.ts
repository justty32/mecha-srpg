import type { ContentDB } from "../../content/contentdb.ts";
import type { CampaignEvent, CampaignState, Screen, OpsCommand } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { evalOpsCond } from "../content/cond.ts";
import { currentRoom, describeRoom } from "./rooms.ts";
import { eventLog } from "./templates.ts";
import { entityName } from "./parse.ts";
import { shortestPath } from "../world/move.ts";
import { allPlaces } from "../world/places.ts";
import { placeAt } from "../war/loc.ts";
import { registerTextDB } from "./names.ts";

export function render(state: CampaignState, events: CampaignEvent[], world: WorldDB, db: ContentDB, showMap = false): Screen {
  registerTextDB(world, db);
  const ctx = { db, world, emit: () => { throw new Error("唯讀查詢"); } };
  const room = describeRoom(currentRoom(state), state, world, db);
  const usedKeys = new Set<string>();
  const action = (label: string, cmd: OpsCommand, disabled?: string): Screen["actions"][number] => {
    const specific = cmd.v === "go" ? `go:${cmd.room}` : cmd.v === "choose" ? `choose:${cmd.choice}` : cmd.v;
    const context = state.pendingChoices.length ? "prompt" : "room";
    const bindings = world.all("keymap").flatMap(k => k.bindings).filter(b => (b.context ?? (b.action.startsWith("choose:") ? "prompt" : "room")) === context);
    const binding = bindings.find(b => b.action === specific) ?? bindings.find(b => b.action === cmd.v);
    const key = binding?.keys.find(k => !usedKeys.has(k.toLowerCase()));
    if (key) usedKeys.add(key.toLowerCase());
    const group = cmd.v === "go" ? "rooms" : cmd.v === "choose" ? "choices" : ["save", "help"].includes(cmd.v) ? "system" : room.id;
    return { id: `${specific}:${JSON.stringify(cmd)}`, label, cmd, group, ...(key ? { key } : {}), tooltip: `${label}${key ? `（${key}）` : ""}${disabled ? `：${disabled}` : ""}`, ...(disabled ? { disabled } : {}) };
  };
  const screen: Screen = { room, log: events.map(event => eventLog(event, state, world)), panels: {
    ...(showMap ? { map: allPlaces(state, ctx).map(place => {
      const path = shortestPath(state, ctx, state.ship.pos, place.id);
      return { id: place.id, name: place.name, map: place.map, x: place.at.x, y: place.at.y,
        days: path?.days ?? null, travel: path ? `${path.days} 天` : "無法抵達" };
    }) } : {}),
    ledger: ["cash", "debt", "stock:flesh", "stock:fuel"].map(account => ({ account, balance: state.ledger.balances[account as keyof typeof state.ledger.balances] ?? 0 })),
    roster: Object.keys(state.roster.persons).sort().map(id => ({ id, name: entityName(id, state, world),
      role: state.roster.employment[id]?.role ?? "", owed: state.roster.employment[id]?.owed ?? 0 })),
    rifts: Object.keys(state.rifts).sort().map(id => ({ id, place: state.rifts[id]!.site, map: state.rifts[id]!.at.map, x: state.rifts[id]!.at.cell.x, y: state.rifts[id]!.at.cell.y, phase: state.rifts[id]!.phase, width: state.rifts[id]!.width })),
    queue: [...state.jobs].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id)).map(j => ({ id: j.id, kind: j.kind, target: j.target, done: j.doneHours, need: j.needHours, priority: j.priority })),
    ship: [{ place: placeAt(state, ctx, state.ship.pos) ?? null, map: state.ship.pos.map, x: state.ship.pos.cell.x, y: state.ship.pos.cell.y, destination: state.ship.path ? JSON.stringify(state.ship.path.to) : null, daysLeft: state.ship.path ? state.pendingTicks : 0, fuel: state.ship.fuel.cur, hull: state.ship.hull.cur }],
  }, actions: [action("環顧四周", { v: "look" }), action("存檔", { v: "save" }), action("指令說明", { v: "help" })] };
  const pending = state.pendingChoices[0];
  if (pending) {
    screen.prompt = { text: pending.text, choices: pending.choices.map((choice, i) => {
      const allowed = !choice.requires || evalOpsCond(state, { world, db }, choice.requires, { person: pending.person });
      if (allowed) screen.actions.push(action(choice.text, { v: "choose", choice: i + 1 }));
      return { n: i + 1, text: choice.text, ...(!allowed ? { disabled: "條件尚未成立" } : {}) };
    }) };
    return screen;
  }
  // SPEC-GAP：pendingBattle 是 Sortie 而非 ScenarioDef；handoff 留給階段 3 產生戰場。
  if (state.pendingBattle) return screen;
  for (const exit of room.exits) screen.actions.push(action(`走到${describeRoom(exit, state, world, db).title}`, { v: "go", room: exit }));
  const occupants = state.ship.rooms[room.id]?.persons ?? [];
  for (const id of [...occupants].sort()) if (state.roster.persons[id]) screen.actions.push(action(`與${entityName(id, state, world)}談話`, { v: "talk", who: id }));
  if (room.id === "bridge") {
    screen.actions.push(action("查看世界圖", { v: "map" }), action("查看契約板", { v: "board" }));
    for (const id of Object.keys(state.contracts).sort()) if (["offered", "active", "stage"].includes(state.contracts[id]!.status)) {
      const contract = state.contracts[id]!;
      screen.actions.push(action(`查看${entityName(id, state, world)}`, { v: "board", contract: id }));
      if (contract.status === "offered") screen.actions.push(action(`承接${entityName(id, state, world)}`, { v: "accept", contract: id },
        shortestPath(state, { db, world, emit: () => { throw new Error("唯讀查詢"); } }, state.ship.pos, contract.target.place) ? undefined : "沒有可抵達目標的航線"));
    }
  }
  if (room.id === "hangar") for (const id of [...state.hangar.bays, ...state.hangar.dormant].filter((id): id is string => id !== null).sort()) {
    if (state.mechs[id] && !screen.actions.some(a => a.cmd.v === "look" && a.cmd.target === id)) screen.actions.push(action(`查看${entityName(id, state, world)}`, { v: "look", target: id }));
  }
  if (room.id === "restraint") {
    screen.panels.beasts = Object.keys(state.restraint.beasts).sort().map(id => {
      const beast = state.restraint.beasts[id]!;
      return { id, name: entityName(id, state, world), kind: beast.kind, wear: beast.wear, vitality: beast.vitality };
    });
    screen.panels.names = Object.keys(state.roster.names).sort().flatMap(id => state.roster.names[id]!.map(n => ({ mech: id, ...n })));
    for (const id of Object.keys(state.restraint.beasts).sort()) {
      const beast = state.restraint.beasts[id]!, mech = state.mechs[id]; if (!mech) continue;
      const frame = db.require("frame", mech.frame), species = db.all("species").find(sp => sp.capture.frame === frame.id);
      const cfg = species && world.get("beasts", `beasts/${species.family}`);
      if (beast.kind === "live" && cfg?.sustain.kind === "devour") {
        const amount = cfg.sustain.amount[frame.grade]!;
        const disabled = state.flags[`devourDue:${id}`] === beast.sustainDue ? "本期已投屍" : (state.ledger.balances[cfg.sustain.stock] ?? 0) < amount ? "屍體材料不足" : undefined;
        screen.actions.push(action(`投屍給${entityName(id, state, world)}`, { v: "devour", beast: id, amount }, disabled));
      }
      const kind = beast.kind === "live" ? "restrain" : "embalm";
      screen.actions.push(action(beast.kind === "live" ? "維護拘束器" : "防腐", { v: "queue", job: { kind, target: id } }, state.jobs.some(j => j.kind === kind && j.target === id) ? "已排入工時佇列" : undefined));
    }
    for (const carcass of state.restraint.carcasses) screen.actions.push(action("改裝整屍", { v: "queue", job: { kind: "mount", target: carcass.id } }, state.jobs.some(j => j.kind === "mount" && j.target === carcass.id) ? "已排入工時佇列" : undefined));
  }
  screen.actions.push(action(state.ship.path ? "航行一天" : "等待一天", { v: "wait", days: 1 }));
  return screen;
}
