import { initWar } from "../war/state.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import { createRng } from "../../core/rng.ts";
import type { PoolDecl } from "../../core/types-def.ts";
import type { Account, CampaignState, OpsCtx, ShipPoolDecl } from "../state/types.ts";
import { clock } from "../state/clock.ts";
import { emit, eventRef } from "../state/events.ts";
import { nextId } from "../state/ids.ts";
import { post } from "../state/ledger.ts";
import type { WorldDB } from "./worlddb.ts";
import { instantiateMech, instantiatePerson, instantiatePools } from "./instantiate.ts";
import { registerTextDB } from "../text/names.ts";
import { registerPersonName } from "../crew/names.ts";

export function createOpsCtx(s: CampaignState, db: ContentDB, world: WorldDB): OpsCtx {
  registerTextDB(world, db);
  return { db, world, emit: (type, payload) => emit(s, type, payload) };
}
function shipPool(id: string, def: ShipPoolDecl): PoolDecl {
  return { id, name: id, min: def.min ?? 0, max: def.max, initial: def.initial, regen: def.regen ?? 0, capKind: def.capKind ?? "hard", inverted: false, bands: [] };
}
export function newCampaign(db: ContentDB, world: WorldDB, startId: string, seed: number): CampaignState {
  const start = world.require("start", startId), ship = world.require("ship", start.ship);
  const calendar = start.calendar ? world.require("calendar", start.calendar) : world.all("calendar")[0];
  if (!calendar) throw new Error("缺少開局曆");
  const node = world.require("node", start.node);
  const pools = instantiatePools([shipPool("fuel", ship.fuel), shipPool("hull", ship.hull)], {});
  if (start.persons.length > ship.capacity.berths || start.mechs.length > ship.capacity.mechBays) throw new Error("開局超出船容量");
  const s: CampaignState = { version: 1, clock: clock(start.day, calendar), rng: createRng(seed), pressure: start.pressure ?? 0,
    nodes: {}, rifts: {}, factions: {}, ship: { frame: ship.id, at: node.id, rooms: Object.fromEntries(ship.rooms.map(room => [room, { persons: [], items: [] }])),
      capacity: { ...ship.capacity }, fuel: pools.fuel!, hull: pools.hull!, upgrades: [] },
    roster: { persons: {}, employment: {}, trust: {}, mastery: {}, names: {}, dead: [] }, hangar: { bays: Array.from({ length: ship.capacity.mechBays }, () => null), dormant: [] },
    restraint: { slots: Array(ship.capacity.restraintSlots).fill(null), beasts: {}, carcasses: [] }, mechs: {}, inventory: { components: [], mechs: [], relics: [], tickets: { airstrike: start.tickets.airstrike ?? 0, restraint: start.tickets.restraint ?? 0 } },
    ledger: { entries: [], balances: { cash: 0, debt: 0 } }, research: {}, jobs: [], contracts: {}, pendingChoices: [], pendingTicks: 0,
    lore: [], flags: Object.fromEntries(start.flags.map(flag => [flag, 1])), log: [], idCounter: 0, effectCounter: 0, calendar: calendar.id, techHours: 0, pendingContracts: [], pendingEvents: [] };
  for (const def of world.all("node")) s.nodes[def.id] = { def: def.id, wreckage: [], flags: [], ...(def.id === node.id ? { lastVisit: start.day } : {}) };
  for (const def of world.all("faction-ops")) s.factions[def.id] = { def: def.id, rep: 0, scaleNow: def.scale, territoryNow: [...def.territory], alive: true, memory: [] };
  for (const def of world.all("research")) s.research[def.id] = { def: def.id, hoursDone: 0, coinPaid: false, done: false };
  for (const rift of start.rifts ?? []) {
    if (!s.nodes[rift.node]) throw new Error(`開局裂縫節點不存在：${rift.node}`);
    s.rifts[rift.id] = structuredClone(rift);
  }
  for (const entry of start.persons) {
    const def = typeof entry === "string" ? entry : entry.def, id = nextId(s, "person");
    const person = instantiatePerson(db, id, def);
    s.roster.persons[id] = person;
    registerPersonName(s, { db, world }, id);
    const terms = typeof entry === "string" ? start.employment : entry;
    if (!terms) throw new Error(`開局人物缺少僱用條件：${def}`);
    s.roster.employment[id] = { since: start.day, wage: terms.wage, owed: 0, mood: 0, role: terms.role };
    if (person.will.soulTree) {
      const d = db.require("person", def);
      const tree = "tree" in d.growth ? db.require("soultree", d.growth.tree) : undefined;
      const nodes = typeof entry !== "string" && entry.soulNodes ? entry.soulNodes : tree?.nodes.filter(n => d.perks.includes(n.perk)).map(n => n.id) ?? [];
      person.will.soulTree.nodes = [...nodes];
      s.roster.trust[id] = {};
      s.roster.mastery[id] = Object.fromEntries(nodes.map(n => [n, 0]));
    }
    const room = s.ship.rooms[terms.role === "technician" ? "hangar" : "galley"];
    room?.persons.push(id);
  }
  for (const [index, entry] of start.mechs.entries()) {
    const frame = typeof entry === "string" ? entry : entry.frame;
    const id = nextId(s, "mech"), mech = instantiateMech(db, id, frame, typeof entry === "string" ? {} : entry.components);
    s.mechs[id] = mech; s.hangar.bays[index] = id; s.inventory.mechs.push(id);
    s.ship.rooms.hangar?.items.push(id);
    if (db.require("frame", frame).cls === "ancient") s.hangar.dormant.push(id);
  }
  const ctx = createOpsCtx(s, db, world), ref = eventRef(ctx.emit("CampaignStarted", { start: start.id, seed }));
  for (const account of ["cash", "debt"] as const) post(s, ctx, { account, delta: start[account], reason: "opening", ref });
  for (const key of Object.keys(start.stocks).sort()) {
    const account = key as Account;
    if (!account.startsWith("stock:")) throw new Error(`開局 stocks 非存量帳：${account}`);
    if (!post(s, ctx, { account, delta: start.stocks[account]!, reason: "opening", ref })) throw new Error(`開局存量不可負：${account}`);
  }
  initWar(s, ctx, seed);
  return s;
}
