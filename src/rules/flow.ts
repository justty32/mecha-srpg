import type { ContentDB } from "../content/contentdb.ts";
import type { Id } from "../core/ids.ts";
import { cellKey } from "../core/ids.ts";
import type { Cell, FactionSlot, NumExpr, Objective } from "../core/types-def.ts";
import type { BattleState, MechState, PersonState } from "../core/types-state.ts";
import type { GameEvent } from "../core/events.ts";
import { createRng } from "../core/rng.ts";
import { createLog, hashLog } from "../core/eventlog.ts";
import type { Ctx, Rejection, UnitInit } from "./state.ts";
import { commanderOf, constant, distance, emit, inBounds, isActive, makeUnit, newRuntime, partDefs, person, rt, seatsOf, unit, unitAt, unitTags } from "./state.ts";
import { canPay, pay } from "./pools.ts";
import { onSignal, registerCommand, registerVerb, signal } from "./hooks.ts";
import { killPerson } from "./injury.ts";
import { setControl } from "./control.ts";

export type BattleSetup = { id: string;
  allies?: Record<FactionSlot, FactionSlot[]>; factions?: Record<FactionSlot, Id>;
  map: { width: number; height: number; fill: Id; cells?: { at: Cell; terrain: Id; hp?: number }[]; exits: Cell[];
    globals?: { tide?: NumExpr; light?: number } };
  units: UnitInit[]; objectives: Objective[]; maxRounds?: number; noRetreat?: boolean };
export type BattleResult = { winner: FactionSlot | null; reason: string; rounds: number;
  events?: GameEvent[];
  units: { id: Id; status: "alive" | "dead" | "retreated" | "derelict-recovered" | "derelict-lost" | "captured"; state: MechState }[];
  persons: { id: Id; status: "alive" | "dead"; state: PersonState; xpGained: number }[];
  loot: { fromUnit: Id; components: Id[]; materials: Record<string, number> }[]; log: { events: number; hash: string } };

export function createBattle(db: ContentDB, setup: BattleSetup, seed: number): BattleState {
  const s: BattleState = { round: 0, order: [], units: {}, persons: {},
    map: { def: setup.id, width: setup.map.width, height: setup.map.height,
      terrain: Array(setup.map.width * setup.map.height).fill(db.require("terrain", setup.map.fill).id), featureHp: {} },
    factions: {}, knowledge: {}, rng: createRng(seed), pending: [], log: createLog(), rt: newRuntime() };
  const ctx = { db, s }, runtime = rt(s);
  runtime.objectives = structuredClone(setup.objectives);
  runtime.maxRounds = setup.maxRounds ?? null;
  runtime.noRetreat = setup.noRetreat ?? false;
  runtime.exits = structuredClone(setup.map.exits);
  runtime.globals = structuredClone(setup.map.globals ?? {});
  for (const [slot, allies] of Object.entries(setup.allies ?? {})) for (const ally of allies) {
    runtime.allies[slot] = [...new Set([...(runtime.allies[slot] ?? []), ally])].sort();
    runtime.allies[ally] = [...new Set([...(runtime.allies[ally] ?? []), slot])].sort();
  }
  const featureHp: Record<string, number | undefined> = {};
  for (const c of setup.map.cells ?? []) {
    if (!inBounds(s, c.at)) throw new Error("地形座標超出地圖");
    s.map.terrain[c.at.y * s.map.width + c.at.x] = db.require("terrain", c.terrain).id;
    featureHp[cellKey(c.at.x, c.at.y)] = c.hp;
  }
  for (const [index, terrain] of s.map.terrain.entries()) {
    const destructible = db.require("terrain", terrain).destructible;
    if (!destructible) continue;
    const key = cellKey(index % s.map.width, Math.floor(index / s.map.width));
    s.map.featureHp[key] = featureHp[key] ?? destructible.hp;
  }
  for (const slot of [...new Set([...Object.keys(setup.factions ?? {}), ...setup.units.map(u => u.owner), ...setup.objectives.map(o => o.for)])].sort()) {
    s.factions[slot] = { faction: setup.factions?.[slot] ?? slot, retreated: [], lost: [], captured: [] };
    s.knowledge[slot] = { visible: [], lastSeen: {}, revealed: {} };
  }
  for (const init of setup.units) {
    if (s.units[init.id] || !inBounds(s, init.pos) || unitAt(ctx, init.pos)) throw new Error(`非法部署：${init.id}`);
    makeUnit(ctx, init);
    s.order.push(init.id);
  }
  for (const id of Object.keys(s.persons).sort()) person(ctx, id).will.burden = person(ctx, id).pools.burden?.cur ?? 0;
  return s;
}

function adjacent(ctx: Ctx, cell: Cell): Cell | undefined {
  return [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
    .map(([x, y]) => ({ x: cell.x + x!, y: cell.y + y! })).find(at => inBounds(ctx.s, at) && unitAt(ctx, at) === null);
}

export function eject(ctx: Ctx, unitId: Id): Rejection | null {
  if (!ctx.s.units[unitId]) return { code: "bad-actor" };
  if (!isActive(ctx, unitId)) return { code: "not-active" };
  const u = unit(ctx, unitId), seats = seatsOf(ctx, unitId), commander = commanderOf(ctx, unitId);
  if (!commander || !seats.length) return { code: "no-commander" };
  const infantry = `${unitId}-inf`, pos = adjacent(ctx, u.pos);
  if (!pos || ctx.s.units[infantry]) return { code: "no-space" };
  const cost = [{ owner: "person" as const, pool: "ap", amount: constant(ctx, "ejectApCost") }];
  if (!canPay(ctx, unitId, commander, cost)) return { code: "cannot-pay" };
  const f = ctx.db.require("frame", "frame/infantry"), declarations = ctx.db.require("bodyplan", f.bodyPlan).parts.flatMap(p => p.seats ?? []);
  const occupied = new Set<string>();
  const transfers = seats.map(s => {
    const seat = declarations.find(d => !occupied.has(d.id) && d.accepts.includes(s.role));
    if (seat) occupied.add(seat.id);
    return { ...s, destination: seat?.id };
  });
  if (transfers.some(s => !s.destination)) return { code: "no-space", detail: "infantry seats" };
  pay(ctx, unitId, commander, cost, "eject");
  const inf = makeUnit(ctx, { id: infantry, frame: f.id, owner: u.owner, pos });
  for (const transfer of transfers) {
    inf.seats[transfer.destination!] = transfer.person;
    person(ctx, transfer.person).seat = { mech: infantry, role: transfer.role };
    u.seats[transfer.seat] = null;
  }
  rt(ctx.s).commander[infantry] = commander;
  setControl(ctx, infantry, seats.some(s => s.role === "pilot") ? "pilot" : "soul", "eject");
  rt(ctx.s).unitStatus[unitId] = "derelict";
  setControl(ctx, unitId, "none", "eject");
  ctx.s.order.push(infantry);
  emit(ctx, "Ejected", { unit: unitId, infantry, persons: seats.map(s => s.person) });
  signal(ctx, "unitRemoved", { unit: unitId, status: "derelict" });
  return null;
}

export function retreat(ctx: Ctx, unitId: Id): Rejection | null {
  if (!ctx.s.units[unitId]) return { code: "bad-actor" };
  if (!isActive(ctx, unitId)) return { code: "not-active" };
  const runtime = rt(ctx.s), u = unit(ctx, unitId);
  if (runtime.noRetreat) return { code: "no-retreat" };
  if (!runtime.exits.some(c => distance(c, u.pos) === 0)) return { code: "not-at-exit" };
  runtime.unitStatus[unitId] = "retreated";
  ctx.s.factions[u.owner]?.retreated.push(unitId);
  emit(ctx, "Retreated", { unit: unitId });
  signal(ctx, "unitRemoved", { unit: unitId, status: "retreated" });
  return null;
}

export function canCapture(ctx: Ctx, target: Id): boolean {
  const monster = rt(ctx.s).monsters[target];
  if (!monster || !isActive(ctx, target) || !unitTags(ctx, target).includes("kaiju")) return false;
  const capture = ctx.db.require("species", monster.species).capture, u = unit(ctx, target), parts = partDefs(ctx, target);
  return capture.requireIntact.every(fn => {
    const matching = parts.filter(p => p.functions.includes(fn));
    return matching.length > 0 && matching.every(p => !u.parts[p.id]!.broken);
  }) && capture.requireBroken.every(fn => {
    const matching = parts.filter(p => p.functions.includes(fn));
    return matching.length > 0 && matching.every(p => u.parts[p.id]!.broken);
  });
}

export function capture(ctx: Ctx, actor: Id, target: Id): void {
  if (!canCapture(ctx, target)) return;
  const runtime = rt(ctx.s), u = unit(ctx, target), def = ctx.db.require("species", runtime.monsters[target]!.species);
  const frame = ctx.db.require("frame", def.capture.frame).id;
  runtime.unitStatus[target] = "captured";
  u.owner = unit(ctx, actor).owner;
  u.frame = frame;
  delete runtime.monsters[target];
  ctx.s.factions[u.owner]?.captured.push(target);
  emit(ctx, "Captured", { unit: target, by: actor, frame });
  signal(ctx, "unitRemoved", { unit: target, status: "captured" });
}

export function battleResult(ctx: Ctx): BattleResult | null {
  const runtime = rt(ctx.s), outcome = runtime.outcome;
  if (!outcome) return null;
  const units: BattleResult["units"] = Object.keys(ctx.s.units).sort().map(id => {
    const u = unit(ctx, id), status = runtime.unitStatus[id];
    const recovered = status === "derelict" && outcome.winner !== null && Object.keys(ctx.s.units).sort().some(other =>
      isActive(ctx, other) && unit(ctx, other).owner === outcome.winner && distance(u.pos, unit(ctx, other).pos) <= constant(ctx, "derelictRecoverRange"));
    return { id, status: status === "derelict" ? recovered ? "derelict-recovered" : "derelict-lost" : status === "active" || status === undefined ? "alive" : status,
      state: structuredClone(u) };
  });
  const persons: BattleResult["persons"] = Object.keys(ctx.s.persons).sort().map(id => ({ id,
    status: ctx.s.log.events.some(e => e.type === "PersonDied" && e.payload.person === id) || person(ctx, id).pools.hp?.cur === 0 ? "dead" : "alive",
    state: structuredClone(person(ctx, id)), xpGained: runtime.xpGained[id] ?? 0 }));
  // SPEC-GAP：凍結內容沒有可連結單位的 lootTables；不臆造掉落。
  return { ...outcome, rounds: ctx.s.round, units, persons, loot: [], log: { events: ctx.s.log.events.length, hash: hashLog(ctx.s.log) } };
}

registerCommand("eject", (ctx, cmd) => eject(ctx, cmd.actor));
registerCommand("retreat", (ctx, cmd) => retreat(ctx, cmd.actor));
registerVerb("spawn", (ctx, action, hc) => {
  if (action.do !== "spawn") return;
  const uid = hc.self.unit ?? (hc.self.person ? person(ctx, hc.self.person).seat?.mech : undefined);
  const origin = hc.self.cell ?? (uid ? unit(ctx, uid).pos : undefined);
  if (!origin) return;
  const pos = action.at === "adjacent" ? adjacent(ctx, origin) : inBounds(ctx.s, origin) && !unitAt(ctx, origin) ? origin : undefined;
  if (!pos) return;
  // SPEC-GAP：spawn 沒有命名／owner 欄；依來源與最小空序號決定。
  const stem = `${uid ?? hc.source}-spawn-`;
  let n = 1;
  while (ctx.s.units[`${stem}${n}`]) n++;
  const spawned = makeUnit(ctx, { id: `${stem}${n}`, owner: uid ? unit(ctx, uid).owner : hc.self.faction ?? "berserk", pos,
    monster: { species: action.species, grade: action.grade } });
  ctx.s.order.push(spawned.id);
});
onSignal("abilityResolved", "people.flow.capture", 0, (ctx, p) => {
  if (p.hit === true && typeof p.actor === "string" && typeof p.target === "string" && typeof p.ability === "string"
    && ctx.db.require("ability", p.ability).tags.includes("capture") && canCapture(ctx, p.target)) capture(ctx, p.actor, p.target);
});
onSignal("unitDied", "people.flow.infantry-death", 10, (ctx, p) => {
  if (typeof p.unit === "string" && unit(ctx, p.unit).frame === ctx.db.get("frame", "frame/infantry")?.id) {
    for (const seat of seatsOf(ctx, p.unit)) killPerson(ctx, seat.person, p.unit);
  }
});
