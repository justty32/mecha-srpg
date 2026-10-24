import type { ContentDB } from "../../content/contentdb.ts";
import type { ContentKind } from "../../core/ids.ts";
import type { DefByKind, EffectRef, MapDef, PersonDef, ScenarioDef, UnitSpawn } from "../../core/types-def.ts";
import type { PersonState } from "../../core/types-state.ts";
import { GRADES } from "../../core/types-def.ts";
import { chance, nextInt, nextU32, pickWeighted } from "../../core/rng.ts";
import { evalNum, objectRefs } from "../../core/numexpr.ts";
import { evalOpsNum } from "../content/cond.ts";
import type { CampaignState, EnemySnapshot, OpsCtx, Sortie } from "../state/types.ts";

// SPEC-GAP：ScenarioDef 僅有 map id，UnitSpawn 無完整人物入口；附純資料快照並在 ctx.db 掛只讀 overlay。
export type SortieScenario = ScenarioDef & { ops: { map: MapDef; persons: Record<string, PersonState>; personDefs: PersonDef[]; unitIds: string[] } };
export function scenarioDB(db: ContentDB, scenario: SortieScenario): ContentDB {
  const get = <K extends ContentKind>(kind: K, id: string): DefByKind[K] | undefined => {
    if (kind === "map" && id === scenario.map) return scenario.ops.map as DefByKind[K];
    if (kind === "person") {
      const def = scenario.ops.personDefs.find(p => p.id === id);
      if (def) return def as DefByKind[K];
    }
    return db.get(kind, id);
  };
  return { ...db, get, require<K extends ContentKind>(kind: K, id: string): DefByKind[K] {
    const value = get(kind, id); if (!value) throw new Error(`missing ${kind}: ${id}`); return value;
  }, all<K extends ContentKind>(kind: K): DefByKind[K][] {
    const ids = new Set(db.ids(kind));
    if (kind === "map") ids.add(scenario.map);
    if (kind === "person") scenario.ops.personDefs.forEach(p => ids.add(p.id));
    return [...ids].sort().map(id => get(kind, id)!);
  }, ids(kind) { return this.all(kind).map(d => d.id); }, counts() {
    const counts = db.counts(); counts.map = this.ids("map").length; counts.person = this.ids("person").length; return counts;
  } };
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

function effective(person: PersonState, path: string, base: number): number {
  const ev = { ref: objectRefs({ self: { attrs: person.attrsBase, pools: person.pools } }), hasTag: () => false };
  const cs = person.contribs.filter(c => c.path === path).map(c => ({ ...c, n: evalNum(c.value, ev) }));
  let n = base;
  for (const c of cs) if (c.op === "set") n = c.n;
  n += cs.filter(c => c.op === "add").reduce((v, c) => v + c.n, 0);
  n *= cs.filter(c => c.op === "mul").reduce((v, c) => v * c.n, 1);
  for (const c of cs) if (c.op === "min") n = Math.min(n, c.n); else if (c.op === "max") n = Math.max(n, c.n);
  return n;
}

function personDefinition(ctx: OpsCtx, p: PersonState, id: string): PersonDef {
  const def = structuredClone(ctx.db.require("person", p.def)); def.id = id;
  // SPEC-GAP：sim 不接 PersonState；以暫時 Def 傳屬性／池貢獻，hooks、士氣狀態與意志仍待完整入口。
  def.attrs = { ...p.attrsBase };
  for (const c of p.contribs) if (c.path.startsWith("self.attrs.")) def.attrs[c.path.slice("self.attrs.".length)] ??= 0;
  for (const attr of Object.keys(def.attrs).sort()) def.attrs[attr] = effective(p, `self.attrs.${attr}`, def.attrs[attr]!);
  const ev = { ref: objectRefs({ self: { attrs: def.attrs, pools: p.pools } }), hasTag: (tag: string) => def.tags.includes(tag) };
  for (const pool of def.pools) {
    if (pool.max !== null) pool.max = effective(p, `self.pools.${pool.id}.max`, evalNum(pool.max, ev));
    pool.regen = effective(p, `self.pools.${pool.id}.regen`, evalNum(pool.regen, ev));
  }
  return def;
}

export function generateScenario(s: CampaignState, ctx: OpsCtx, sortie: Sortie): ScenarioDef {
  const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
  const rift = s.rifts[sortie.rift ?? contract?.target.rift ?? ""];
  const riftDef = rift ? ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(d => d.family === rift.family) : undefined;
  const node = ctx.world.require("node", sortie.node);
  const snapshot: EnemySnapshot = contract?.target.snapshot ?? { family: riftDef?.family ?? ctx.world.all("encounter")[0]!.family,
    width: rift?.width ?? "D", depth: s.nodes[sortie.node]?.blight?.depth ?? "shallow", anchorAge: rift?.anchorAge ?? 0,
    ...(riftDef?.monsters ? { monsters: riftDef.monsters } : {}) };
  const templates = ctx.world.all("encounter").filter(e => e.family === snapshot.family);
  // SPEC-GAP：base 缺 core 遭遇，沿用同族 deep（再 shallow）的地圖配方，仍生成錨本體。
  const encounter = templates.find(e => e.depth === snapshot.depth) ?? templates.find(e => e.depth === "deep") ?? templates[0];
  if (!encounter) throw new Error(`missing encounter: ${snapshot.family}/${snapshot.depth}`);
  const scope = { node: sortie.node, ...(rift ? { rift: rift.id } : {}) };
  const width = Math.max(4, Math.floor(evalOpsNum(s, ctx, encounter.size.w, scope))), height = Math.max(1, Math.floor(evalOpsNum(s, ctx, encounter.size.h, scope)));
  const mix = encounter.terrainMix.flatMap(entry => entry.terrain === "$node"
    ? node.terrainPool.map(terrain => ({ terrain, w: entry.w / node.terrainPool.length })) : [entry]);
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
  const familyDef = ctx.world.all("rift").find(d => d.family === snapshot.family);
  const allowed = familyDef?.gradeByWidth[snapshot.width] ?? GRADES.slice(0, GRADES.indexOf(snapshot.width) + 1);
  const candidates = (snapshot.monsters ?? ctx.db.ids("monster")).map(id => ctx.db.require("monster", id))
    .filter(m => ctx.db.require("species", m.species).family === snapshot.family).sort((a, b) => a.id < b.id ? -1 : 1);
  // SPEC-GAP：budgetByGrade 沒有單價與 anchorAge 係數，採各級名額，不按玩家強弱縮放。
  for (const grade of GRADES) {
    if (!allowed.includes(grade)) continue;
    const pool = candidates.filter(m => m.grade === grade);
    const count = Math.max(0, Math.floor(encounter.budgetByGrade[grade] ?? 0));
    if (count && !pool.length) throw new Error(`missing monster grade: ${grade}`);
    for (let i = 0; i < count; i++) enemy.push({ monster: pool[nextInt(s.rng, pool.length)]!.id, at: "zone" });
  }
  if ((snapshot.depth === "core" || encounter.anchorHere) && familyDef?.anchor) enemy.push({ monster: familyDef.anchor, at: "zone" });
  if (!enemy.length) throw new Error("empty encounter budget");
  const persons: Record<string, PersonState> = {}, personDefs: PersonDef[] = [];
  const ordered = [...sortie.units].sort((a, b) => a.mech < b.mech ? -1 : 1);
  const player: UnitSpawn[] = ordered.map(unit => {
    const mech = s.mechs[unit.mech]!, frame = ctx.db.require("frame", mech.frame);
    const seats = ctx.db.require("bodyplan", frame.bodyPlan).parts.flatMap(p => p.seats ?? []);
    const spawn: UnitSpawn = { mech: frame.id, at: "zone", persons: [] };
    // TODO(2026-10-24 裁示)：活捕不造怪獸人物；轉回 species 出戰才能取得 core 的 instinct 與行動池。
    const species = ctx.db.all("species").find(sp => sp.capture.frame === frame.id);
    if (unit.controlMode === "instinct" && species) {
      const monster = ctx.db.all("monster").find(m => m.species === species.id && m.grade === frame.grade);
      if (!monster) throw new Error(`missing captured monster: ${frame.id}`);
      return { monster: monster.id, at: "zone" };
    }
    for (const seat of seats) {
      const pid = unit.seats[seat.id]; if (!pid) continue;
      const p = structuredClone(s.roster.persons[pid]!);
      const role = ctx.db.require("person", p.def).kind === "soul" ? "soul" : "pilot";
      p.seat = { mech: mech.id, role: seat.accepts.includes(role) ? role : "passenger" };
      if ((s.roster.employment[pid]?.mood ?? 0) < 0) { p.morale = "shaken"; inject(s, ctx, p, "effect/morale-shaken", sortie.id); }
      // TODO(2026-10-24 裁示)：不做 hunger → instinct、bond → burdenLimit 注入。
      for (const entry of sortie.injected) if (entry.target === "person" ? entry.id === pid : entry.id === mech.id) inject(s, ctx, p, entry.effect, sortie.id);
      const original = ctx.db.require("person", p.def);
      if ("tree" in original.growth) for (const n of ctx.db.require("soultree", original.growth.tree).nodes) {
        if (!p.will.soulTree?.nodes.includes(n.id)) continue;
        const before = p.contribs.length;
        inject(s, ctx, p, n.perk, sortie.id);
        const mastery = s.roster.mastery[pid]?.[n.id] ?? 0;
        for (const c of p.contribs.slice(before)) c.value = { product: [c.value, mastery] };
      }
      // SPEC-GAP：trust 未定映射係數／效果 id，保留營運資料，不能臆造 contested 平衡值。
      const defId = `ops:person/${sortie.id}-${pid}`;
      persons[pid] = p; personDefs.push(personDefinition(ctx, p, defId));
      spawn.persons!.push({ id: defId, seat: p.seat.role });
    }
    return spawn;
  });
  const template = contract ? ctx.world.require("contract", contract.template) : undefined;
  const objectives = (template?.stages?.[contract!.stageIdx]?.objectives ?? template?.objectives ?? [{ kind: "eliminate" as const, params: {} }]).map(o => ({
    kind: o.kind, params: structuredClone(o.params), for: "player", onComplete: o.optional ? "continue" as const : "win" as const }));
  // SPEC-GAP：明示敵軍勝利條件，避免玩家全滅後 clear 目標永遠無法結束。
  objectives.push({ kind: "eliminate", params: {}, for: "enemy", onComplete: "win" });
  const playerFaction = ctx.db.require("faction", "faction/migrant-crew").id;
  const enemyFaction = ctx.db.all("faction").find(f => f.tags.includes("kaiju"));
  if (!enemyFaction) throw new Error("missing monster faction");
  // SPEC-GAP：encounter／contract 沒有 rounds 欄；營運戰鬥統一使用內容常數。
  const rounds = ctx.db.rules.constants.opsBattleMaxRounds;
  if (!Number.isSafeInteger(rounds) || rounds! <= 0) throw new Error("missing positive opsBattleMaxRounds");
  const scenario: SortieScenario = { id: `ops:scenario/${sortie.id}`, map: map.id, slots: {
    player: { faction: playerFaction, units: player }, enemy: { faction: enemyFaction.id, units: enemy } }, objectives,
    rounds, rules: { conventionalFactor: ctx.db.rules.constants.conventionalFactor ?? 0.1 }, seed: nextU32(s.rng),
    ops: { map, persons, personDefs, unitIds: ordered.map(u => u.mech) } };
  // SPEC-GAP：支援沒有 conventional-arms frame／能力內容；不憑空造可攻擊的船或砲台。
  ctx.db = scenarioDB(ctx.db, scenario);
  return scenario;
}
