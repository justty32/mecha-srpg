import type { Cell } from "../core/types-def.ts";
import type { Agent, AiCtx, AiParams } from "./policy.ts";
import { inferIntent, mobile } from "./intent.ts";
import { isHostileSlot } from "./hostility.ts";

export type Waypoint = { id: string; cell: Cell };
export type SearchMemory = { version: 1; route: Waypoint[]; visited: string[] };
const DEFAULTS = { search: 1, searchSpread: 2 };
const byCell = (a: Cell, b: Cell) => a.y - b.y || a.x - b.x;

export function readSearchMemory(agent: Agent): SearchMemory | undefined {
  const value = agent.memory.search as SearchMemory | undefined;
  if (!value || value.version !== 1 || !Array.isArray(value.route) || !Array.isArray(value.visited)
    || !value.route.every(w => w && typeof w.id === "string" && w.cell
      && Number.isInteger(w.cell.x) && Number.isInteger(w.cell.y))
    || !value.visited.every(id => typeof id === "string")) return undefined;
  return structuredClone(value);
}

/** 候選、評分與協調層共用失控友傷判定，不讀隱藏目標。 */
export function pursuitHostileOnly(ctx: AiCtx, agent: Agent, policy = agent.policy): boolean {
  if (policy !== "berserk") return true;
  return !ctx.q.abilitiesOf(ctx.view, agent.unit).some(id => {
    const def = ctx.q.abilityDef(id);
    return (def.mode === "activated" || def.mode === "sustained") && def.target.kind !== "self"
      && def.target.friendly !== "no" && (["attack", "attackArea"] as const).some(t =>
        ctx.q.evalNum(ctx.view, def.ai.tactics[t] ?? 0, agent.unit) > 0);
  });
}

export function searchAllowed(ctx: AiCtx, agent: Agent, policy: string, factionParams: AiParams): boolean {
  return ["tactical", "berserk"].includes(policy) && (ctx.params.search ?? DEFAULTS.search) !== 0
    && !!ctx.view.units[agent.unit] && ctx.q.isActive(ctx.view, agent.unit)
    && mobile(ctx.q, ctx.view, agent.unit)
    && !["gather", "regroup", "retreat"].includes(ctx.assignment?.intentMode ?? "")
    && !["guardNest", "hold", "survive", "escort", "reachExit"].includes(inferIntent({ ...ctx, params: factionParams }).kind);
}

export function buildSearchRoute(ctx: AiCtx, agent: Agent): SearchMemory {
  const { q, view, slot } = ctx, zones = view.rt?.deployZones ?? {};
  const cells = (owner: string): Cell[] => {
    const seen = new Set<string>();
    return [...(zones[owner] ?? [])].sort(byCell).filter(c => {
      const key = JSON.stringify([c.x, c.y]);
      if (!Number.isInteger(c.x) || !Number.isInteger(c.y) || c.x < 0 || c.y < 0
        || c.x >= view.map.width || c.y >= view.map.height || seen.has(key)) return false;
      seen.add(key); return true;
    });
  };
  const seen = new Set<string>();
  const targets = Object.keys(zones).sort().filter(owner => isHostileSlot(q, view, slot, owner))
    .flatMap(owner => cells(owner).map(cell => ({ owner, cell }))).filter(({ cell }) => {
      const key = JSON.stringify([cell.x, cell.y]);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  const memory: SearchMemory = { version: 1, route: [], visited: [] };
  if (!targets.length) return memory;
  const friends = Object.keys(view.units).sort().filter(id => view.units[id]!.owner === slot
    && q.isActive(view, id) && mobile(q, view, id));
  const assigned: Cell[] = [];
  let chosen = targets[0]!;
  const spread = Math.max(0, ctx.params.searchSpread ?? DEFAULTS.searchSpread);
  for (let i = 0; i < friends.length; i++) {
    const start = Math.floor(i * targets.length / friends.length);
    let index = start;
    for (let scan = 0; scan < targets.length; scan++) {
      const candidate = (start + scan) % targets.length;
      if (assigned.every(cell => q.distance(cell, targets[candidate]!.cell) >= spread)) { index = candidate; break; }
    }
    assigned.push(targets[index]!.cell);
    if (friends[i] === agent.unit) { chosen = targets[index]!; break; }
  }
  const waypoint = (kind: string, owner: string, cell: Cell): Waypoint =>
    ({ id: JSON.stringify([kind, owner, cell.x, cell.y]), cell: { ...cell } });
  memory.route.push(waypoint("enemy", chosen.owner, chosen.cell), waypoint("center", "", {
    x: Math.floor(view.map.width / 2), y: Math.floor(view.map.height / 2),
  }));
  const pos = view.units[agent.unit]!.pos;
  const home = cells(slot).sort((a, b) => q.distance(pos, b) - q.distance(pos, a) || byCell(a, b))[0];
  if (home) memory.route.push(waypoint("home", slot, home));
  return memory;
}

/** 只依實際終點與當下感知推進；情報與適用性由協調層先行檢查。 */
export function reduceSearchProgress(ctx: AiCtx, agent: Agent, memory: SearchMemory): SearchMemory {
  const next = structuredClone(memory), visited = new Set(next.visited);
  const actor = ctx.view.units[agent.unit];
  if (!actor) return next;
  for (let count = 0; count < next.route.length; count++) {
    const current = next.route.find(w => !visited.has(w.id));
    if (!current || ctx.q.distance(actor.pos, current.cell) > ctx.q.perception(ctx.view, agent.unit)) break;
    visited.add(current.id);
  }
  next.visited = [...visited].sort();
  return next;
}

export function searchFallbackCells(ctx: AiCtx, agent: Agent): Cell[] {
  const pos = ctx.view.units[agent.unit]?.pos;
  if (!pos) return [];
  const memory = ctx.searchEnabled === true ? readSearchMemory(agent) : undefined;
  const current = memory?.route.find(w => !memory.visited.includes(w.id));
  return [{ ...(current?.cell ?? pos) }];
}
