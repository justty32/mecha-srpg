import type { ContentDB } from "../../src/content/contentdb.ts";
import { createRng, nextInt } from "../../src/core/rng.ts";
import type { BattleSetup, UnitInit } from "../../src/rules/index.ts";
import { createBattle, layerDefs, partDefs } from "../../src/rules/index.ts";
import { scenarioToSetup } from "../../src/sim/run.ts";
import type { SimSetup } from "../../src/sim/run.ts";

export type Mode = "ai" | "random" | "scenario";

/** 內容池每次由 DB 列舉；固定 stream 與排序讓 seed 可重現。 */
export function generate(db: ContentDB, seed: number, mode: Mode): SimSetup {
  const rng = createRng(seed, 801), int = (lo: number, hi: number) => lo + nextInt(rng, hi - lo + 1);
  const pick = <T>(xs: readonly T[]): T => {
    if (!xs.length) throw new Error("抽樣池為空");
    return xs[nextInt(rng, xs.length)]!;
  };
  if (mode === "scenario") return scenarioToSetup(db, pick(db.ids("scenario")), seed);
  const large = int(1, 100) <= 5;
  const width = large ? int(40, 64) : int(3, 24), height = large ? int(40, 64) : int(3, 24);
  const terrains = db.ids("terrain"), factions = db.ids("faction");
  const cells = Array.from({ length: width * height }, (_, i) => ({ at: { x: i % width, y: Math.floor(i / width) },
    terrain: pick(int(0, 3) === 0 ? terrains : terrains.slice(0, 3)) }));
  const exits = cells.filter(c => c.at.x === 0 || c.at.y === 0 || c.at.x === width - 1 || c.at.y === height - 1)
    .filter(() => int(0, 3) === 0).map(c => ({ ...c.at }));
  const slots = Array.from({ length: int(2, 4) }, (_, i) => `s${i}`);
  const allies = Object.fromEntries(slots.map(s => [s, [] as string[]]));
  // s0 與 s1 保留敵對；其他邊獨立且對稱抽樣。
  for (let i = 0; i < slots.length; i++) for (let j = i + 1; j < slots.length; j++) {
    if ((i !== 0 || j !== 1) && int(0, 3) === 0) {
      allies[slots[i]!]!.push(slots[j]!); allies[slots[j]!]!.push(slots[i]!);
    }
  }
  const units: UnitInit[] = [], count = int(slots.length, Math.min(12, cells.length));
  const compact = int(1, 100) <= 70, side = Math.ceil(Math.sqrt(count)) * 2 + 2;
  const windowWidth = Math.min(width, side), windowHeight = Math.min(height, side);
  const left = compact ? int(0, width - windowWidth) : 0, top = compact ? int(0, height - windowHeight) : 0;
  const free = cells.map(c => c.at).filter(p => !compact
    || (p.x >= left && p.x < left + windowWidth && p.y >= top && p.y < top + windowHeight));
  // 約 10% 場次強制同類；其餘仍逐單位獨立抽樣。
  const sameKind = int(1, 100) <= 10 ? int(0, 1) : null;
  // 密集混合場的 s0／s1 明確敵對，分別部署無駕駛怪獸與機甲。
  const duel = compact && sameKind === null ? int(0, 1) : null;
  const components = db.all("component"), persons = db.all("person");
  for (let i = 0; i < count; i++) {
    const id = `u${i}`, owner = i < slots.length ? slots[i]! : pick(slots);
    const pos = free.splice(nextInt(rng, free.length), 1)[0]!;
    if ((sameKind ?? (duel !== null && i < 2 ? (duel + i) % 2 : int(0, 1))) === 0) {
      const monster = db.require("monster", pick(db.ids("monster")));
      units.push({ id, owner, pos, monster: { species: monster.species, grade: monster.grade } });
    } else {
      const frame = db.require("frame", pick(db.ids("frame")));
      const parts = db.require("bodyplan", frame.bodyPlan).parts;
      const installed: Record<string, string> = {}, crew: NonNullable<UnitInit["persons"]> = [];
      for (const part of parts) {
        for (const slot of part.slots) {
          const compatible = components.filter(c => c.slot === slot.type);
          if (compatible.length && int(0, 3) !== 0) installed[slot.id] = pick(compatible).id;
        }
        for (const seat of part.seats ?? []) {
          const compatible = persons.filter(p => p.kind === "soul" ? seat.accepts.includes("soul")
            : seat.accepts.includes("pilot") || seat.accepts.includes("passenger"));
          if (compatible.length && int(0, 3) !== 0) crew.push({ id: `${id}-${seat.id}`, def: pick(compatible).id, seat: seat.id });
        }
      }
      units.push({ id, owner, pos, frame: frame.id, components: installed, persons: crew });
    }
  }
  stress(db, seed, units);
  const maxRounds = int(3, 20), objectives: BattleSetup["objectives"] = [];
  if (int(0, 1)) for (let i = 0, n = int(1, 2); i < n; i++) {
    const kind = pick(["eliminate", "survive", "reachExit", "killTarget"] as const);
    const owner = pick(kind === "killTarget" ? slots.filter(s => slots.some(t => s !== t && !allies[s]!.includes(t))) : slots);
    const target = pick(units.filter(u => kind === "killTarget" ? u.owner !== owner && !allies[owner]!.includes(u.owner) : u.owner === owner));
    if (kind === "reachExit" && !exits.length) exits.push({ x: 0, y: 0 });
    objectives.push({ kind, for: owner, onComplete: "win", params: kind === "survive" ? { rounds: int(1, maxRounds) }
      : kind === "reachExit" || kind === "killTarget" ? { unit: target.id } : {} });
  }
  const setup: BattleSetup = { id: `fuzz-${seed}`, allies, factions: Object.fromEntries(slots.map(s => [s, pick(factions)])),
    map: { width, height, fill: terrains[0]!, cells, exits,
      ...(int(0, 3) === 0 ? { globals: { tide: int(0, 3), light: int(0, 100) / 100 } } : {}) }, units, objectives, maxRounds };
  const unitPolicies: SimSetup["unitPolicies"] = Object.fromEntries(slots.map(s => [s, {}]));
  for (const u of units) if (u.monster) unitPolicies[u.owner]![u.id] = db.require("aiprofile", db.require("species", u.monster.species).aiProfile).policy;
  return { scenario: null, setup, slotProfiles: Object.fromEntries(slots.map(s => [s, { policy: "tactical", params: {} }])), unitPolicies };
}

/**
 * 壓力旋鈕（獨立 RNG stream，不擾動上面的抽樣）：約 30% 場對部分單位預先打壞非核心部位的層、
 * 並把隨機資源池（熱量、承擔、本能…）推到高檔，讓失控、停機、捕捉、部位毀損傳導等路徑在短局內出現。
 * 核心部位一律不動（開局即死亡不是合法情境）。
 */
function stress(db: ContentDB, seed: number, units: UnitInit[]): void {
  const rng = createRng(seed, 803), int = (lo: number, hi: number) => lo + nextInt(rng, hi - lo + 1);
  if (int(1, 100) > 30) return;
  const poolIds = [...new Set([...db.all("frame").flatMap(f => f.pools), ...db.all("component").flatMap(c => c.pools),
    ...db.all("person").flatMap(p => p.pools), ...db.all("species").flatMap(s => s.pools)].map(p => p.id))].sort();
  for (const u of units) {
    if (int(1, 100) > 40) continue;
    if (poolIds.length) {
      const pools: Record<string, number> = {};
      for (let i = 0, n = int(1, 2); i < n; i++) pools[poolIds[nextInt(rng, poolIds.length)]!] = int(0, 300);
      u.pools = pools;
    }
    const probe = createBattle(db, { id: "fuzz-stress-probe", map: { width: 1, height: 1, fill: db.ids("terrain")[0]!, exits: [] },
      units: [{ ...u, pos: { x: 0, y: 0 }, persons: [] }], objectives: [] }, 1), ctx = { db, s: probe };
    const parts: NonNullable<UnitInit["parts"]> = {};
    for (const part of partDefs(ctx, u.id)) {
      if (part.functions.includes("core") || int(0, 1) === 0) continue;
      const defs = layerDefs(ctx, u.id, part.id);
      const layers = defs.map(d => {
        const hp = int(0, 3) === 0 ? 0 : Math.floor(d.hp * int(1, 100) / 100);
        return { hp, broken: hp <= 0 };
      });
      const structural = defs.map((d, i) => d.structural ? i : -1).filter(i => i >= 0);
      parts[part.id] = { layers, broken: structural.length > 0 && structural.every(i => layers[i]!.broken) };
    }
    if (Object.keys(parts).length) u.parts = parts;
  }
}
