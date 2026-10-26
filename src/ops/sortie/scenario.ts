import { lordScripts, routeGrades } from "../world/lords.ts";
import { blightAt } from "../world/blight.ts";
import { gridOf, neighbors, terrainAt } from "../world/grid.ts";
import { requirePlace, worldRules } from "../world/places.ts";
import type { Cell, EffectRef, MapDef, Objective, UnitSpawn } from "../../core/types-def.ts";
import type { DynamicScenario } from "../../sim/run.ts";
import type { PersonState } from "../../core/types-state.ts";
import { GRADES } from "../../core/types-def.ts";
import { chance, nextInt, nextU32, pickWeighted } from "../../core/rng.ts";
import { evalNum, objectRefs } from "../../core/numexpr.ts";
import { evalOpsNum } from "../content/cond.ts";
import { instantiatePerson, instantiatePools } from "../content/instantiate.ts";
import type { ActorState, CampaignState, EnemySnapshot, OpsCtx, Sortie } from "../state/types.ts";
import { generateOperationScenario } from "./operation-scenario.ts";
import { actorHostile, inShipContact } from "../world/encounter.ts";
import { factionId, relation } from "../war/relations.ts";
import { factionModelPool } from "../war/rnd.ts";

export type SortieScenario = DynamicScenario & { ops: { map: MapDef; unitIds: string[]; forceIds?: Record<string, string> } };

function reachableHoldZone(ctx: OpsCtx, map: MapDef, player: UnitSpawn[]): Cell[] {
  const glyphs = typeof map.cells === "string" ? [...map.cells]
    : [...map.cells.rle.replace(/\s+/gu, "").matchAll(/([1-9][0-9]*)([^0-9])/gu)].flatMap(m => Array<string>(Number(m[1])).fill(m[2]!));
  const terrain = glyphs.map(glyph => ctx.db.require("terrain", map.legend[glyph]!));
  for (const feature of map.features ?? []) terrain[feature.at.y * map.width + feature.at.x] = ctx.db.require("terrain", feature.terrain);
  const key = (c: Cell) => c.y * map.width + c.x;
  const enemy = new Set(map.deployZones.enemy!.map(key));
  const classes = new Set(player.map(spawn => {
    const tags = spawn.mech ? ctx.db.require("frame", spawn.mech).tags
      : ctx.db.require("species", ctx.db.require("monster", spawn.monster!).species).tags;
    return tags.find(tag => Object.hasOwn(ctx.db.registries.locomotion, tag)) ?? "leg";
  }));
  const reachable = new Map<number, Cell>();
  for (const movement of classes) {
    const queue = [...map.deployZones.player!], visited = new Set(queue.map(key));
    for (let i = 0; i < queue.length; i++) {
      const at = queue[i]!, cost = terrain[key(at)]?.moveCost[movement];
      if (cost !== null && cost !== undefined && !enemy.has(key(at))) reachable.set(key(at), at);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const cell = { x: at.x + dx, y: at.y + dy }, index = key(cell);
        if (cell.x < 0 || cell.x >= map.width || cell.y < 0 || cell.y >= map.height || visited.has(index) || enemy.has(index)) continue;
        const step = terrain[index]!.moveCost[movement];
        if (step === null || step === undefined) continue;
        visited.add(index); queue.push(cell);
      }
    }
  }
  // SPEC-GAP：缺地圖專屬戰略地標，取最靠近中線且可達的格為中心，再取半徑 2 格群。
  const cells = [...reachable.values()], distance = (c: Cell) => Math.abs(c.x - Math.floor(map.width / 2)) + Math.abs(c.y - Math.floor(map.height / 2));
  cells.sort((a, b) => distance(a) - distance(b) || a.y - b.y || a.x - b.x);
  const center = cells[0];
  if (!center) throw new Error("hold zone has no reachable terrain");
  return cells.filter(c => Math.max(Math.abs(c.x - center.x), Math.abs(c.y - center.y)) <= 2).sort((a, b) => a.y - b.y || a.x - b.x);
}

function inject(s: CampaignState, ctx: OpsCtx, person: PersonState, effectRef: EffectRef, source: string): void {
  const ref = typeof effectRef === "string" ? { effect: effectRef } : effectRef;
  const scope = { person: person.id, mech: person.seat?.mech };
  if (ref.chance !== undefined && !chance(s.rng, evalOpsNum(s, ctx, ref.chance, scope))) return;
  const def = ctx.db.require("effect", ref.effect);
  const params = Object.fromEntries(Object.keys(ref.params ?? {}).sort().map(k => [k, evalOpsNum(s, ctx, ref.params![k]!, scope)]));
  const ev = { ref: objectRefs({ self: { attrs: person.attrsBase, pools: person.pools }, params }), hasTag: (tag: string) => ctx.db.require("person", person.def).tags.includes(tag) };
  const uid = ++s.effectCounter, ids: string[] = [];
  for (const [i, c] of def.contribs.entries()) {
    const id = `sortie-${uid}-${i}`; ids.push(id);
    person.contribs.push({ ...c, id, source, value: evalNum(c.value, ev) });
  }
  person.effects.push({ uid, effect: def.id, source, scope: def.scope, owner: { person: person.id }, remaining:
    def.clock.kind === "permanent" || def.clock.kind === "whileSource" ? null : evalNum(def.clock.n ?? 0, ev),
    magnitude: evalNum(def.magnitude ?? 1, ev), stacks: 1, params, contribIds: ids });
}

export function generateScenario(s: CampaignState, ctx: OpsCtx, sortie: Sortie): SortieScenario {
  if (sortie.trigger === "operation") return generateOperationScenario(s, ctx, sortie, generateStandardScenario);
  const scenario = generateStandardScenario(s, ctx, sortie);
  if (sortie.actors?.length) interceptScenario(s, ctx, sortie, scenario);
  return scenario;
}
function interceptScenario(s: CampaignState, ctx: OpsCtx, sortie: Sortie, scenario: SortieScenario): void {
  const primary = s.actors[sortie.actors![0]!];
  if (!primary) throw new Error("missing intercept actor");
  const gp = ctx.world.all("forces")[0]!.gp;
  const rules = (worldRules(ctx) as ReturnType<typeof worldRules> & { actors: { maxJoinUnits: number; caravanEscort: number; maxBattleUnits: number } }).actors;
  const primaryBudget = scenario.slots.enemy!.units.reduce((n, unit) => n + gp[unit.monster
    ? ctx.db.require("monster", unit.monster).grade : ctx.db.require("frame", unit.mech!).grade], 0);
  let remaining = rules.maxBattleUnits - scenario.slots.player!.units.length;
  if (remaining < 1) throw new Error("intercept-player-capacity");
  const coreFaction = (a: ActorState) => ctx.db.get("faction", ctx.world.get("faction-ops", a.faction)?.faction ?? a.faction)?.id
    ?? ctx.db.all("faction").find(f => f.tags.includes(a.kind === "swarm" ? "kaiju" : "human"))?.id ?? scenario.slots.enemy!.faction;
  function units(a: ActorState, slot: string, limit: number, maxBudget = Infinity): UnitSpawn[] {
    const out: UnitSpawn[] = [];
    limit = Math.max(0, Math.min(limit, a.kind === "caravan" ? rules.caravanEscort : limit));
    if (!limit) return out;
    let budget = Math.min(a.str, maxBudget);
    if (a.kind === "swarm") {
      const family = a.swarm?.family ?? ctx.world.get("rift", s.rifts[a.swarm?.rift ?? ""]?.family ?? "")?.family;
      const candidates = ctx.db.all("monster").filter(m => (!family || ctx.db.require("species", m.species).family === family)
        && (!a.swarm?.grades.length || a.swarm.grades.includes(m.grade))).sort((x, y) => gp[y.grade] - gp[x.grade] || x.id.localeCompare(y.id));
      while (candidates.length && out.length < limit) {
        const pool = candidates.filter(m => gp[m.grade] <= budget);
        if (!pool.length) break;
        const monster = pool[nextInt(s.rng, pool.length)]!; out.push({ monster: monster.id, at: "zone" }); budget -= gp[monster.grade];
      }
      if (!out.length && candidates.length && gp[candidates.at(-1)!.grade] <= maxBudget) out.push({ monster: candidates.at(-1)!.id, at: "zone" });
      return out;
    }
    const spawn = (frameId: string) => {
      const frame = ctx.db.require("frame", frameId), spawn: UnitSpawn = { mech: frame.id, at: "zone", persons: [] };
      for (const seat of ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? [])) {
        const defs = ctx.db.all("person").filter(p => p.id !== ctx.db.rules.cockpit?.growth?.awakenSoulTemplate && seat.accepts.includes(p.kind === "soul" ? "soul" : "pilot"));
        if (!defs.length) continue;
        const def = defs[nextInt(s.rng, defs.length)]!, id = `${sortie.id}/${slot}/${a.id}/${out.length}/${seat.id}`;
        scenario.personStates![id] = instantiatePerson(ctx.db, id, def.id);
        spawn.persons!.push({ id, seat: def.kind === "soul" ? "soul" : "pilot" });
      }
      out.push(spawn);
    };
    const force = a.operation ? s.operations?.[a.operation]?.force : a.kind === "force" ? s.factions[a.faction]?.forces : undefined;
    if (force) {
      for (const unit of [...force.units].sort((x, y) => x.model.localeCompare(y.model))) {
        if (unit.readiness <= 0) continue;
        const model = ctx.world.require("model", unit.model);
        for (let i = 0; i < unit.count; i++) {
          if (out.length >= limit || gp[model.tier] > budget) return out;
          spawn(model.frame); budget -= gp[model.tier];
        }
      }
    } else {
      const models = ctx.world.all("model").filter(m => !a.roster || m.id === a.roster);
      const faction = factionId(s, ctx, a.faction), allowed = faction ? factionModelPool(s, ctx, faction) : [];
      const own = models.filter(m => allowed.includes(m.id));
      const pool = (own.length ? own : models).sort((x, y) => gp[x.tier] - gp[y.tier] || x.id.localeCompare(y.id));
      while (pool.length && out.length < limit) {
        const affordable = pool.filter(m => gp[m.tier] <= budget);
        if (!affordable.length) break;
        const model = affordable[nextInt(s.rng, affordable.length)]!; spawn(model.frame); budget -= gp[model.tier];
      }
      if (!out.length && pool.length && a.kind !== "caravan" && gp[pool[0]!.tier] <= maxBudget) spawn(pool[0]!.frame);
    }
    return out;
  }
  const counts: Record<string, number> = {};
  function actorUnits(a: ActorState, slot: string, limit: number, budget = Infinity): UnitSpawn[] {
    const spawns = units(a, slot, Math.min(limit, remaining), budget), offset = counts[slot] ?? 0;
    scenario.ops.forceIds ??= {};
    for (let i = 0; i < spawns.length; i++) scenario.ops.forceIds[`${slot}-${offset + i}`] = `${sortie.id}/actor/${a.id}/${i}`;
    counts[slot] = offset + spawns.length; remaining -= spawns.length;
    return spawns;
  }
  // SPEC-GAP（18:10 orders）：主敵受原 encounter GP 預算約束；加入者每方一支、最多四機，總量十六。
  scenario.slots.enemy = { faction: coreFaction(primary), units: actorUnits(primary, "enemy", remaining, primaryBudget) };
  const joined = new Set<string>();
  const playerFaction = factionId(s, ctx, "faction/migrant-crew");
  for (const id of [...new Set(sortie.actors!.slice(1))].sort()) {
    const a = s.actors[id]; if (!a || !inShipContact(s, ctx, a)) continue;
    const relationToPlayer = playerFaction ? relation(s, a.faction, playerFaction) : undefined;
    const hostile = actorHostile(s, ctx, a);
    const friendly = !hostile && (a.stance === "friendly" || a.faction === playerFaction || !!relationToPlayer && ["friendly", "allied"].includes(relationToPlayer.state));
    if (!friendly && !hostile) continue;
    const slot = friendly ? "ally" : "third";
    if (joined.has(slot) || remaining <= 0) continue;
    const spawns = actorUnits(a, slot, rules.maxJoinUnits);
    if (!spawns.length) continue;
    joined.add(slot);
    scenario.slots[slot] = { faction: coreFaction(a), units: spawns,
      ...(friendly ? { allies: ["player"] } : a.faction === primary.faction ? { allies: ["enemy"] } : {}) };
    if (!friendly && a.faction === primary.faction) scenario.slots.enemy!.allies = ["third"];
  }
  if (scenario.slots.ally) scenario.slots.player!.allies = ["ally"];
  const people = new Set(Object.values(scenario.slots).flatMap(slot => slot.units.flatMap(unit => unit.persons?.map(p => p.id) ?? [])));
  for (const id of Object.keys(scenario.personStates ?? {})) if (!people.has(id)) delete scenario.personStates![id];
  const map = scenario.ops.map, oldWidth = map.width, oldHeight = map.height;
  const cells = typeof map.cells === "string" ? [...map.cells] : [...map.cells.rle.replace(/\s+/gu, "").matchAll(/([1-9][0-9]*)([^0-9])/gu)].flatMap(m => Array<string>(Number(m[1])).fill(m[2]!));
  // SPEC-GAP：同格軍力超出模板容量時保留全部單位，以互不重疊的矩形部署區擴圖。
  // 各區近似正方形，區間留一格、左邊保留出口，避免單欄部署把戰場拉成數百列。
  let nextX = 1;
  const zones = (["player", "ally", "third", "enemy"] as const).flatMap(slot => {
    const count = scenario.slots[slot]?.units.length ?? 0;
    if (!count) { delete map.deployZones[slot]; return []; }
    const cols = Math.ceil(Math.sqrt(count)), rows = Math.ceil(count / cols), x = nextX;
    nextX += cols + 1;
    return [{ slot, x, cols, rows }];
  });
  map.width = Math.max(6, map.width, nextX);
  map.height = Math.max(map.height, ...zones.map(zone => zone.rows + 2));
  map.cells = Array.from({ length: map.width * map.height }, (_, i) => cells[(Math.floor(i / map.width) % oldHeight) * oldWidth + i % map.width % oldWidth]!).join("");
  for (const { slot, x, cols, rows } of zones)
    map.deployZones[slot] = Array.from({ length: cols * rows }, (_, i) => ({ x: x + i % cols, y: 1 + Math.floor(i / cols) }));
  map.exits = Array.from({ length: map.height }, (_, y) => ({ x: 0, y }));
  map.globals = { ...map.globals, tide: s.clock.phase === "spring" ? 1 : s.clock.phase === "neap" ? -1 : 0 };
  scenario.objectives = [{ kind: "eliminate", params: { slots: ["enemy", ...(scenario.slots.third ? ["third"] : [])] }, for: "player", onComplete: "win" },
    { kind: "eliminate", params: { slots: ["player", ...(scenario.slots.ally ? ["ally"] : [])] }, for: "enemy", onComplete: "win" }];
}
function generateStandardScenario(s: CampaignState, ctx: OpsCtx, sortie: Sortie): SortieScenario {
  const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
  const template = contract ? ctx.world.require("contract", contract.template) : undefined;
  const explicit = template?.encounter;
  // 契約 id 的 FNV-1a 雜湊不消耗 RNG；重打保持同一份遭遇。
  let hash = 2166136261;
  for (const char of contract?.id ?? "") hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const selected = explicit?.length ? ctx.world.require("encounter", explicit[hash % explicit.length]!) : undefined;
  const rift = selected ? undefined : s.rifts[sortie.rift ?? contract?.target.rift ?? ""];
  // SPEC-GAP：只有節點的契約借用節點蝕域裂縫族，再退回第一族的 shallow 配方。
  const fallbackRift = !rift && !selected ? s.rifts[blightAt(s, ctx, sortie.loc)?.rift ?? ""] : undefined;
  const sourceRift = rift ?? fallbackRift;
  const riftDef = sourceRift ? ctx.world.get("rift", sourceRift.family) ?? ctx.world.all("rift").find(d => d.family === sourceRift.family) : ctx.world.all("rift")[0];
  const grid = gridOf(ctx.world, sortie.loc.map);
  const snapshot: EnemySnapshot = selected ? { family: selected.family, width: "D", depth: selected.depth, anchorAge: 0 } : contract?.target.snapshot ?? { family: riftDef?.family ?? ctx.world.all("encounter")[0]!.family,
    width: sourceRift?.width ?? "D", depth: rift || fallbackRift ? blightAt(s, ctx, sortie.loc)?.depth ?? "shallow" : "shallow", anchorAge: sourceRift?.anchorAge ?? 0,
    ...(riftDef?.monsters ? { monsters: riftDef.monsters } : {}) };
  const templates = ctx.world.all("encounter").filter(e => e.family === snapshot.family);
  // SPEC-GAP：base 缺 core 遭遇，沿用同族 deep（再 shallow）的地圖配方，仍生成錨本體。
  const encounter = selected ?? templates.find(e => e.depth === snapshot.depth) ?? templates.find(e => e.depth === "deep") ?? templates[0];
  if (!encounter) throw new Error(`missing encounter: ${snapshot.family}/${snapshot.depth}`);
  const scope = { place: sortie.place, node: sortie.place, ...(rift ? { rift: rift.id } : {}) };
  const width = Math.max(4, Math.floor(evalOpsNum(s, ctx, encounter.size.w, scope))), height = Math.max(1, Math.floor(evalOpsNum(s, ctx, encounter.size.h, scope)));
  const mix = encounter.terrainMix.flatMap(entry => entry.terrain === "$node"
    ? [sortie.loc.cell, ...neighbors(grid, sortie.loc.cell)].flatMap((cell, i) => { const pool = terrainAt(grid, cell).battlePool; return pool.map(terrain => ({ terrain, w: entry.w * (i === 0 ? 1 : 0.5) / pool.length })); }) : [entry]);
  const terrains = [...new Set(mix.map(e => ctx.db.require("terrain", e.terrain).id))].sort();
  const glyph = (id: string) => String.fromCodePoint(0xE000 + terrains.indexOf(ctx.db.require("terrain", id).id));
  const map: MapDef = encounter.map ? structuredClone(ctx.db.require("map", encounter.map)) : {
    id: `ops:map/${sortie.id}`, width, height,
    cells: Array.from({ length: width * height }, () => glyph(pickWeighted(s.rng, mix, e => e.w).terrain)).join(""),
    legend: Object.fromEntries(terrains.map(id => [glyph(id), id])),
    deployZones: {},
    exits: Array.from({ length: height }, (_, y) => ({ x: 0, y })) };
  map.id = `ops:map/${sortie.id}`;
  if (map.width < 4) throw new Error("ops map needs separate exit, player and enemy columns");
  map.deployZones.player = Array.from({ length: map.height }, (_, y) => [{ x: 1, y }, { x: 2, y }]).flat();
  map.deployZones.enemy = Array.from({ length: map.height }, (_, y) => ({ x: map.width - 1, y }));
  map.exits = Array.from({ length: map.height }, (_, y) => ({ x: 0, y }));
  const enemy: UnitSpawn[] = [];
  const persons: Record<string, PersonState> = {};
  const usedPilots = new Set<string>();
  let pilotSerial = 0;
  const familyDef = ctx.world.all("rift").find(d => d.family === snapshot.family);
  const baseGrades = familyDef?.gradeByWidth[snapshot.width] ?? GRADES.slice(0, GRADES.indexOf(snapshot.width) + 1);
  const scripts = lordScripts(ctx);
  const allowed = !contract?.target.snapshot && !selected ? scripts.reduce((grades, script) => routeGrades(s, script, sortie.loc, grades, sourceRift?.id), baseGrades) : baseGrades;
  const candidates = (snapshot.monsters ?? ctx.db.ids("monster")).map(id => ctx.db.require("monster", id))
    .filter(m => ctx.db.require("species", m.species).family === snapshot.family).sort((a, b) => a.id < b.id ? -1 : 1);
  // SPEC-GAP：budgetByGrade 沒有單價與 anchorAge 係數，採各級名額，不按玩家強弱縮放。
  for (const grade of GRADES) {
    if (encounter.units) {
      const pool = encounter.units.filter(u => ctx.db.require("frame", u.frame).grade === grade);
      const count = Math.max(0, Math.floor(encounter.budgetByGrade[grade] ?? 0));
      if (count && !pool.length) throw new Error(`missing encounter frame grade: ${grade}`);
      for (let i = 0; i < count; i++) {
        const entry = pickWeighted(s.rng, pool, u => u.w ?? 1), frame = ctx.db.require("frame", entry.frame);
        const spawn: UnitSpawn = { mech: frame.id, at: "zone", persons: [],
          ...(entry.core !== undefined ? { core: entry.core } : {}), ...(entry.crew ? { crew: entry.crew } : {}),
          ...(entry.components !== undefined ? { components: structuredClone(entry.components) } : {}) };
        for (const seat of ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? [])) {
          const candidates = (entry.pilots ?? []).map(id => ctx.db.require("person", id)).filter(p => seat.accepts.includes(p.kind === "soul" ? "soul" : "pilot"));
          const unused = candidates.filter(p => !usedPilots.has(p.id)), available = unused.length ? unused : candidates;
          if (!available.length) continue;
          const def = available[nextInt(s.rng, available.length)]!;
          let id: string;
          do { id = `enemy-${sortie.id}-${pilotSerial++}`; } while (s.roster.persons[id] || persons[id]);
          const person = instantiatePerson(ctx.db, id, def.id), role = def.kind === "soul" ? "soul" : "pilot";
          person.seat = { mech: `enemy-${enemy.length}`, role };
          persons[id] = person; usedPilots.add(def.id);
          spawn.persons!.push({ id, seat: role });
        }
        enemy.push(spawn);
      }
      continue;
    }
    if (!allowed.includes(grade)) continue;
    const pool = candidates.filter(m => m.grade === grade);
    const count = Math.max(0, Math.floor(encounter.budgetByGrade[grade] ?? 0));
    if (count && !pool.length) throw new Error(`missing monster grade: ${grade}`);
    for (let i = 0; i < count; i++) enemy.push({ monster: pool[nextInt(s.rng, pool.length)]!.id, at: "zone" });
  }
  // 裂縫 opening 期只有先鋒、錨尚未到（data-model-world-map 狀態機）：接約時快照為 opening 就不放潮錨本尊。
  if (!encounter.units && (snapshot.depth === "core" || encounter.anchorHere) && snapshot.phase !== "opening" && familyDef?.anchor) enemy.push({ monster: familyDef.anchor, at: "zone" });
  if (!enemy.length) throw new Error("empty encounter budget");
  const ordered = [...sortie.units].sort((a, b) => a.mech < b.mech ? -1 : 1);
  const player: UnitSpawn[] = ordered.map(unit => {
    const mech = s.mechs[unit.mech]!, frame = ctx.db.require("frame", mech.frame);
    const seats = ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []);
    const spawn: UnitSpawn = { mech: frame.id, at: "zone", persons: [],
      ...(mech.core !== (frame.core ?? true) ? { core: mech.core } : {}), ...(unit.crew ? { crew: unit.crew } : {}) };
    // 活捕以 species 的本能控制與行動池出戰，磨損只提高本場起點。
    const species = ctx.db.all("species").find(sp => sp.capture.frame === frame.id);
    if (unit.controlMode === "instinct" && species) {
      const monster = ctx.db.all("monster").find(m => m.species === species.id && m.grade === frame.grade);
      if (!monster) throw new Error(`missing captured monster: ${frame.id}`);
      const initial = instantiatePools(species.pools, species.baseAttrsByGrade[monster.grade] ?? {}, species.tags).instinct?.cur ?? 0;
      const wear = s.restraint.beasts[mech.id]?.wear ?? 0;
      return { monster: monster.id, at: "zone", pools: { instinct: initial + Math.max(0, wear - 50) / 2 } };
    }
    for (const seat of seats) {
      const pid = unit.seats[seat.id]; if (!pid) continue;
      const p = structuredClone(s.roster.persons[pid]!);
      const role = ctx.db.require("person", p.def).kind === "soul" ? "soul" : "pilot";
      p.seat = { mech: mech.id, role: seat.accepts.includes(role) ? role : "passenger" };
      if ((s.roster.employment[pid]?.mood ?? 0) < 0) { p.morale = "shaken"; inject(s, ctx, p, "effect/morale-shaken", sortie.id); }
      // SPEC-GAP：活捕按本線契約無人物座位，bond 只存營運資料，沒有 burdenLimit 注入目標。
      for (const entry of sortie.injected) if (entry.target === "person" ? entry.id === pid : entry.id === mech.id) inject(s, ctx, p, entry.effect, sortie.id);
      const original = ctx.db.require("person", p.def);
      if ("tree" in original.growth) for (const n of ctx.db.require("soultree", original.growth.tree).nodes) {
        if (!p.will.soulTree?.nodes.includes(n.id)) continue;
        const before = p.contribs.length;
        inject(s, ctx, p, n.perk, sortie.id);
        const mastery = s.roster.mastery[pid]?.[n.id] ?? 0;
        for (const c of p.contribs.slice(before)) c.value = evalNum(c.value, { ref: objectRefs({ self: { attrs: p.attrsBase, pools: p.pools } }) }) * mastery;
      }
      // SPEC-GAP：trust 未定映射係數／效果 id，保留營運資料，不能臆造 contested 平衡值。
      persons[pid] = p;
      spawn.persons!.push({ id: pid, seat: p.seat.role });
    }
    return spawn;
  });
  // SPEC-GAP：opening 期還沒有錨與核區可守，殺光先鋒即關閉裂縫（rifts.ts vanguard-killed）；此時任何契約的戰場目標都改為殲滅先鋒。
  const opening = snapshot.phase === "opening";
  const objectives: Objective[] = (opening ? [{ kind: "eliminate" as const, params: {} }] : template?.stages?.[contract!.stageIdx]?.objectives ?? template?.objectives ?? [{ kind: "eliminate" as const, params: {} }]).map(o => ({
    kind: o.kind, params: {
      ...structuredClone(o.params),
      ...(o.kind === "hold" && o.params.zone === undefined ? { zone: reachableHoldZone(ctx, map, player) } : {}),
    }, for: "player", onComplete: o.optional ? "continue" as const : "win" as const }));
  const temporaryIds: Record<string, string> = {};
  for (const objective of objectives) {
    // anchored 清剿有錨在場時只要求殺錨；不把游離子體一起清光當作關閉裂縫的必要條件。
    if (!opening && template?.kind === "clear" && objective.kind === "eliminate"
      && familyDef?.anchor && enemy.some(u => u.monster === familyDef.anchor)) {
      objective.kind = "killTarget"; objective.params = { target: familyDef.anchor };
    }
    if (objective.kind === "escort") {
      // SPEC-GAP：現有內容無運輸機，使用沒有固有武器與預設配裝的徒步 frame 代表被護送人員。
      const frame = ctx.db.all("frame").find(f => !f.innateAbilities.length && !Object.keys(f.defaultLoadout ?? {}).length
        && ctx.db.require("bodyplan", f.bodyPlan).parts.some(p => p.seats?.some(seat => seat.accepts.includes("pilot"))));
      const def = ctx.db.all("person").find(p => p.kind !== "soul");
      if (!frame || !def) {
        // SPEC-GAP：內容包沒有非戰鬥單位時，僅要求存活至戰場時限。
        objective.kind = "survive"; objective.params = { rounds: ctx.db.rules.constants.opsBattleMaxRounds! };
        continue;
      }
      const unit = `player-${player.length}`;
      // 沿用外援的 id 對照入口，避免 runSortie 把被護送人員當成名冊機甲讀取。
      temporaryIds[unit] = `${sortie.id}/escort-${player.length}`;
      let id = `escort-${sortie.id}-${player.length}`;
      while (persons[id] || s.roster.persons[id]) id += "-escort";
      const person = instantiatePerson(ctx.db, id, def.id); person.seat = { mech: unit, role: "pilot" }; persons[id] = person;
      player.push({ mech: frame.id, at: "zone", components: {}, persons: [{ id, seat: "pilot" }] });
      objective.params = { ...objective.params, target: unit, unit };
    } else if (objective.kind === "killTarget") {
      const tags = Array.isArray(objective.params.tags) ? objective.params.tags.filter((t): t is string => typeof t === "string") : [];
      const target = typeof objective.params.target === "string" ? objective.params.target : undefined;
      const matches = (spawn: UnitSpawn): boolean => {
        if (target && !(spawn.monster && spawn.monster === ctx.db.get("monster", target)?.id
          || spawn.mech && spawn.mech === ctx.db.get("frame", target)?.id)) return false;
        if (spawn.monster) {
          const m = ctx.db.require("monster", spawn.monster), species = ctx.db.require("species", m.species);
          return tags.every(tag => tag === "epithet" ? m.grade === "A" && !!m.epithet : m.tags.includes(tag) || species.tags.includes(tag));
        }
        return !!spawn.mech && tags.every(tag => ctx.db.require("frame", spawn.mech!).tags.includes(tag));
      };
      let index = enemy.findIndex((spawn, i) => target === `enemy-${i}` || matches(spawn));
      if (index < 0) {
        const pool = ctx.db.all("monster").filter(m => matches({ monster: m.id, at: "zone" }));
        const monster = pool.find(m => ctx.db.require("species", m.species).family === snapshot.family) ?? pool[0];
        if (!monster) throw new Error(`missing killTarget monster: ${tags.join(",")}`);
        index = enemy.length; enemy.push({ monster: monster.id, at: "zone" });
      }
      const unit = `enemy-${index}`;
      objective.params = { ...objective.params, target: unit, unit };
    }
  }
  // SPEC-GAP：明示敵軍勝利條件，避免玩家全滅後 clear 目標永遠無法結束。
  objectives.push({ kind: "eliminate", params: {}, for: "enemy", onComplete: "win" });
  const lordScript = scripts.find(script => sortie.lordEncounter?.lord === script.lord
    || template?.id === script.contracts[0]?.template && s.namedLords?.[script.lord]?.status === "northward");
  if (lordScript) {
    const at = { x: map.width - 1, y: 0 };
    map.deployZones.enemy = map.deployZones.enemy!.filter(c => c.x !== at.x || c.y !== at.y);
    if (!map.deployZones.enemy.length) throw new Error("presence requires spare edge cell");
    enemy.push({ monster: lordScript.lord, at, presence: { aura: lordScript.aura,
      engageable: sortie.lordEncounter?.beat === "gate", captureLocked: s.namedLords?.[lordScript.lord]?.captured ?? false } });
    if (sortie.lordEncounter?.beat === "gate") {
      objectives.splice(0, objectives.length, { kind: "survive", params: { rounds: ctx.db.rules.constants.opsBattleMaxRounds! }, for: "player", onComplete: "win" },
        { kind: "eliminate", params: {}, for: "enemy", onComplete: "win" });
    }
  }
  const playerFaction = ctx.db.require("faction", "faction/migrant-crew").id;
  const enemyFaction = encounter.faction ? ctx.db.require("faction", encounter.faction) : ctx.db.all("faction").find(f => f.tags.includes("kaiju"));
  if (!enemyFaction) throw new Error("missing monster faction");
  // SPEC-GAP：encounter／contract 沒有 rounds 欄；營運戰鬥統一使用內容常數。
  const rounds = ctx.db.rules.constants.opsBattleMaxRounds;
  if (!Number.isSafeInteger(rounds) || rounds! <= 0) throw new Error("missing positive opsBattleMaxRounds");
  const scenario: SortieScenario = { id: `ops:scenario/${sortie.id}`, map: map.id, slots: {
    player: { faction: playerFaction, units: player }, enemy: { faction: enemyFaction.id, units: enemy } }, objectives,
    rounds, rules: { conventionalFactor: ctx.db.rules.constants.conventionalFactor ?? 0.1 }, seed: nextU32(s.rng),
    mapDef: map, personStates: persons, ops: { map, unitIds: ordered.map(u => u.mech),
      ...(Object.keys(temporaryIds).length ? { forceIds: temporaryIds } : {}) } };
  if (sortie.lordEncounter && lordScript) { scenario.name = "吉大港守牆"; scenario.brief = lordScript.gate.text; }
  else if (template?.text) { scenario.name = template.name; scenario.brief = template.text; }
  // SPEC-GAP：支援沒有 conventional-arms frame／能力內容；不憑空造可攻擊的船或砲台。
  return scenario;
}
