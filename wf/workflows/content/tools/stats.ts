// 內容數值分佈統計。用法：node stats.ts [--content content/base] [--json <out>]
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const argv = process.argv.slice(2);
const opt = (k: string, d: string): string => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const CONTENT = opt('--content', 'content/base');
const OUT = opt('--json', '');   // 空＝不寫檔，只印摘要
const ORDER = ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const gi = (g: string): number => ORDER.indexOf(g);

type Obj = any;
const isNum = (v: any): v is number => typeof v === 'number' && Number.isFinite(v);
const r1 = (x: number): number => Math.round(x * 10) / 10;
function stat(a: number[]): any {
  const s = a.filter(isNum).sort((x, y) => x - y);
  const n = s.length;
  if (!n) return { n: 0, min: null, p10: null, median: null, p90: null, max: null };
  const p = (q: number): number => r1(s[Math.min(n - 1, Math.max(0, Math.ceil(q * n) - 1))]);
  return { n, min: r1(s[0]), p10: p(0.1), median: p(0.5), p90: p(0.9), max: r1(s[n - 1]) };
}
function load(dir: string): Obj[] {
  const out: Obj[] = [];
  let names: string[] = [];
  try { names = readdirSync(join(CONTENT, dir)).filter((f) => f.endsWith('.json')).sort(); } catch { return out; }
  for (const f of names) {
    try { out.push(JSON.parse(readFileSync(join(CONTENT, dir, f), 'utf8'))); }
    catch (e) { console.error(`parse error ${dir}/${f}: ${(e as Error).message}`); }
  }
  return out;
}
// 分組累加器：group -> {n, fields}
function mk() {
  const g: Record<string, { n: number; f: Record<string, number[]> }> = {};
  return {
    add(key: string, rec: Record<string, any>) {
      const o = (g[key] ??= { n: 0, f: {} });
      o.n++;
      for (const [k, v] of Object.entries(rec)) if (isNum(v)) (o.f[k] ??= []).push(v);
    },
    out(): any {
      const r: any = {};
      for (const k of Object.keys(g).sort()) {
        r[k] = { n: g[k].n };
        for (const [f, a] of Object.entries(g[k].f)) r[k][f] = stat(a);
      }
      return r;
    },
  };
}
const cnt = (m: Record<string, number>, k: any): void => { const s = String(k); m[s] = (m[s] ?? 0) + 1; };
const sum = (a: any[]): number => a.reduce((s: number, x: any) => s + (isNum(x) ? x : 0), 0);

const D: Record<string, Obj[]> = {};
for (const k of ['frames', 'bodyplans', 'components', 'abilities', 'effects', 'species', 'monsters', 'persons', 'scenarios', 'maps', 'terrains']) D[k] = load(k);
D.models = load('world/models');
const byId = (a: Obj[]): Record<string, Obj> => Object.fromEntries(a.map((x) => [x.id, x]));
const plans = byId(D.bodyplans), maps = byId(D.maps), speciesM = byId(D.species), abMap = byId(D.abilities);

function planInfo(p: Obj): Record<string, number> {
  const r: Record<string, number> = { totalHp: 0, partCount: 0, layerCount: 0, structuralHp: 0, armorHp: 0, coreParts: 0 };
  const rs: Record<string, number[]> = { kinetic: [], pierce: [], thermal: [], acid: [], energy: [] };
  for (const part of p?.parts ?? []) {
    r.partCount++;
    if ((part.functions ?? []).includes('core')) r.coreParts++;
    for (const l of part.layers ?? []) {
      const hp = isNum(l.hp) ? l.hp : 0;
      r.totalHp += hp; r.layerCount++;
      if (l.structural === true) r.structuralHp += hp;
      if (['armor', 'shield', 'chitin'].includes(l.type)) r.armorHp += hp;
      for (const k of Object.keys(rs)) rs[k].push(l.resist?.[k] ?? 0);
    }
  }
  for (const k of Object.keys(rs)) r['resist' + k[0].toUpperCase() + k.slice(1) + 'Avg'] = rs[k].length ? sum(rs[k]) / rs[k].length : 0;
  return r;
}
const pool = (pools: Obj[], id: string): Obj => (pools ?? []).find((p) => p.id === id) ?? {};

// 1 frames
const fr = mk(), frAll = mk();
for (const f of D.frames) {
  const pi = planInfo(plans[f.bodyPlan]);
  const rec = {
    totalHp: pi.totalHp, partCount: pi.partCount, layerCount: pi.layerCount, structuralHp: pi.structuralHp, armorHp: pi.armorHp, coreParts: pi.coreParts,
    heatMax: pool(f.pools, 'heat').max, heatRegen: Math.abs(pool(f.pools, 'heat').regen), chargeMax: pool(f.pools, 'charge').max, chargeRegen: Math.abs(pool(f.pools, 'charge').regen),
    initiative: f.baseAttrs?.initiative, perception: f.baseAttrs?.perception, evasion: f.baseAttrs?.evasion,
    innateCount: (f.innateAbilities ?? []).length, loadoutCount: Object.keys(f.defaultLoadout ?? {}).length, burden: f.burden,
  };
  fr.add(`${f.cls}/${f.grade}`, rec); frAll.add(f.grade, rec);
}
const frames = fr.out(); frames.byGradeAll = frAll.out();

// 2 monsters
const mo = mk(), moFam = mk();
const monsterSpecies: Record<string, number> = {};
for (const m of D.monsters) {
  const sp = speciesM[m.species]; if (!sp) { console.error(`monster ${m.id}: species ${m.species} not found`); continue; }
  const pi = planInfo(plans[sp.bodyPlan]); const a = sp.baseAttrsByGrade?.[m.grade] ?? {};
  const rec = { totalHp: pi.totalHp, partCount: pi.partCount, coreParts: pi.coreParts, structuralHp: pi.structuralHp, initiative: a.initiative, perception: a.perception, accuracy: a.accuracy, evasion: a.evasion,
    abilityCount: (sp.abilities ?? []).length, resistKineticAvg: pi.resistKineticAvg, resistPierceAvg: pi.resistPierceAvg, resistThermalAvg: pi.resistThermalAvg, resistAcidAvg: pi.resistAcidAvg, resistEnergyAvg: pi.resistEnergyAvg };
  mo.add(m.grade, rec); moFam.add(sp.family ?? '?', rec); cnt(monsterSpecies, m.species);
}
const monsters = mo.out(); monsters.byFamily = moFam.out();

// 3 abilities
const owner: Record<string, string> = {};
for (const f of D.frames) for (const a of f.innateAbilities ?? []) owner[a] ??= f.cls === 'mechanical' ? `mechanical/${f.grade}` : f.cls === 'ancient' ? 'ancient/S' : `kaiju/${f.grade}`;
for (const s of D.species) {
  const top = [...(s.gradeRange ?? [])].sort((a, b) => gi(b) - gi(a))[0] ?? '?';
  for (const a of s.abilities ?? []) owner[a] ??= `kaiju/${top}`;
}
for (const c of D.components) for (const a of c.abilities ?? []) owner[a] ??= String(c.id).replace(/^component\//, '').startsWith('mx-') ? 'mechanical/comp' : 'other';
const ab = mk(), abNo = mk();
const targetKinds: any = {}, modes: any = {}, tactics: any = {}, friendly: any = {}, damageTypes: any = {};
let exprCount = 0;
const nv = (v: any): number | undefined => { if (isNum(v)) return v; if (v && typeof v === 'object') exprCount++; return undefined; };
for (const a of D.abilities) {
  const costs = a.costs ?? [], prod = a.produces ?? [], pk = a.packets ?? [];
  const apCost = sum(costs.filter((c: Obj) => c.pool === 'ap').map((c: Obj) => nv(c.amount)));
  const key = owner[a.id] ?? 'other';
  cnt(targetKinds, a.target?.kind); cnt(modes, a.mode); cnt(friendly, a.target?.friendly);
  for (const t of Object.keys(a.ai?.tactics ?? {})) cnt(tactics, t);
  for (const p of pk) cnt(damageTypes, p.type);
  if (!pk.length) { abNo.add(key, { apCost, cooldown: nv(a.cooldown) }); continue; }
  const dmg = sum(pk.map((p: Obj) => nv(p.amount)));
  const crits = pk.map((p: Obj) => nv(p.crit)).filter(isNum);
  ab.add(key, {
    apCost, damage: dmg, damagePerAp: apCost > 0 ? dmg / apCost : undefined, rangeMin: nv(a.target?.range?.min), rangeMax: nv(a.target?.range?.max), accuracy: nv(a.accuracy),
    armorPen: sum(pk.map((p: Obj) => nv(p.armorPen))), crit: crits.length ? Math.max(...crits) : undefined, cooldown: nv(a.cooldown), usesPerBattle: nv(a.usesPerBattle),
    otherCostTotal: sum(costs.filter((c: Obj) => c.pool !== 'ap').map((c: Obj) => nv(c.amount))), producesHeat: sum(prod.filter((c: Obj) => c.pool === 'heat').map((c: Obj) => nv(c.amount))),
    effectsOnHit: sum((a.effects ?? []).filter((e: Obj) => e.on === 'hit').map((e: Obj) => (e.apply ?? []).length)),
  });
}
const abilities: any = ab.out();
abilities.noPackets = abNo.out(); abilities.targetKinds = targetKinds; abilities.modes = modes; abilities.tactics = tactics; abilities.friendly = friendly; abilities.damageTypes = damageTypes; abilities.exprCount = exprCount;

// 4 components
const co = mk();
for (const c of D.components) co.add(c.slot ?? '?', { hp: c.hp, size: c.size, mass: c.mass, poolMax: c.pools?.[0]?.max, abilityCount: (c.abilities ?? []).length, layersAddHp: sum((c.layersAdd ?? []).map((l: Obj) => l.layer?.hp)) });
const components = co.out();

// 5 effects
const ef = mk(), byPath: Record<string, number[]> = {};
const clockKinds: any = {}, stackPolicies: any = {}, hookNames: any = {};
for (const e of D.effects) {
  ef.add(e.scope ?? '?', { clockN: e.clock?.n }); cnt(clockKinds, e.clock?.kind); cnt(stackPolicies, e.stack?.policy);
  for (const h of Object.keys(e.hooks ?? {})) cnt(hookNames, h);
  for (const c of e.contribs ?? []) (byPath[c.path] ??= []).push(isNum(c.value) ? c.value : NaN);
}
const effects: any = ef.out();
effects.contribsByPath = Object.fromEntries(Object.keys(byPath).sort().map((p) => [p, { ...stat(byPath[p]), count: byPath[p].length }]));
effects.clockKinds = clockKinds; effects.stackPolicies = stackPolicies; effects.hookNames = hookNames;

// 6 persons
const pe = mk();
for (const p of D.persons) {
  const a = p.attrs ?? {}, len = (x: any): number => (Array.isArray(x) ? x.length : x && typeof x === 'object' ? Object.keys(x).length : 0);
  pe.add(p.kind ?? '?', { accuracy: a.accuracy, evasion: a.evasion, resolve: a.resolve, initiative: a.initiative, perception: a.perception, control: a.control,
    hpMax: pool(p.pools, 'hp').max, apMax: pool(p.pools, 'ap').max, fatigueMax: pool(p.pools, 'fatigue').max, traitCount: len(p.traits), beliefCount: len(p.will?.beliefs) });
}
const persons = pe.out();

// 7 scenarios
const upl: number[] = [], slotsC: number[] = [], rounds: number[] = [], area: number[] = [], objectiveKinds: any = {}, onComplete: any = {};
for (const s of D.scenarios) {
  const sl = Object.values(s.slots ?? {}) as Obj[];
  slotsC.push(sl.length); for (const x of sl) upl.push((x.units ?? []).length);
  if (isNum(s.rounds)) rounds.push(s.rounds);
  const m = maps[s.map]; if (m) area.push(m.width * m.height);
  for (const o of s.objectives ?? []) {
    cnt(objectiveKinds, o.kind);
    const oc = Array.isArray(o.onComplete) ? o.onComplete : [o.onComplete];
    for (const c of oc) cnt(onComplete, c && typeof c === 'object' ? (c.kind ?? c.type ?? Object.keys(c)[0]) : c);
  }
}
const scenarios = { unitsPerSlot: stat(upl), slotsCount: stat(slotsC), rounds: stat(rounds), mapArea: stat(area), objectiveKinds, onComplete };

// 8 terrains
const legs: number[] = [], covers: number[] = [], heights: number[] = [];
let nullCount = 0, destructibleCount = 0, blocksLosCount = 0;
for (const t of D.terrains) {
  const l = t.moveCost?.leg; if (isNum(l)) legs.push(l); else nullCount++;
  if (isNum(t.cover)) covers.push(t.cover); if (isNum(t.height)) heights.push(t.height);
  if (t.destructible) destructibleCount++; if (t.blocksLos) blocksLosCount++;
}
const terrains = { moveCostLeg: stat(legs), nullCount, cover: stat(covers), height: stat(heights), destructibleCount, blocksLosCount };

// 9 models
const md = mk();
for (const m of D.models) md.add(String(m.tier), { cost: m.cost });
const models = md.out();

const meta = { content: CONTENT, generated: new Date().toISOString().slice(0, 10), fileCounts: Object.fromEntries(Object.entries(D).map(([k, v]) => [k, v.length])) };
const result = { frames, monsters, abilities, components, effects, persons, scenarios, terrains, models, meta };
if (OUT) { try { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, JSON.stringify(result, null, 1)); } catch (e) { console.error(`write failed: ${(e as Error).message}`); } }

// 摘要
const rng = (s: any): string => (s && s.n ? `med=${s.median} p10–p90=${s.p10}–${s.p90}` : 'n/a');
function lines(label: string, grp: any, fields: string[]): void {
  for (const k of Object.keys(grp)) {
    if (k === 'byGradeAll' || k === 'byFamily' || k === 'noPackets' || typeof grp[k]?.n !== 'number' || !grp[k].n) continue;
    console.log(`${label} ${k} n=${grp[k].n} ` + fields.map((f) => `${f} ${rng(grp[k][f])}`).join(' | '));
  }
}
lines('frames', frames, ['totalHp', 'heatMax', 'initiative']);
lines('monsters', monsters, ['totalHp', 'partCount', 'accuracy']);
lines('monsters.family', monsters.byFamily, ['totalHp']);
lines('abilities', abilities, ['apCost', 'damage', 'damagePerAp', 'rangeMax']);
lines('abilities.noPackets', abilities.noPackets, ['apCost']);
lines('components', components, ['hp', 'mass']);
lines('effects', effects, ['clockN']);
lines('persons', persons, ['accuracy', 'hpMax', 'traitCount']);
lines('models', models, ['cost']);
console.log(`scenarios unitsPerSlot ${rng(scenarios.unitsPerSlot)} | slots ${rng(scenarios.slotsCount)} | rounds ${rng(scenarios.rounds)} | mapArea ${rng(scenarios.mapArea)}`);
console.log(`terrains moveCostLeg ${rng(terrains.moveCostLeg)} null=${nullCount} | cover ${rng(terrains.cover)} | height ${rng(terrains.height)} | destructible=${destructibleCount} blocksLos=${blocksLosCount}`);
console.log(`abilities targetKinds ${JSON.stringify(targetKinds)} modes ${JSON.stringify(modes)} exprCount=${exprCount}`);
console.log(`meta ${JSON.stringify(meta)}`);
if (OUT) console.log(`wrote ${OUT}`);
