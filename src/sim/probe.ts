import { readFileSync, writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import { join } from "node:path";
import { createContentDB } from "../content/contentdb.ts";
import type { ContentDB } from "../content/contentdb.ts";
import { loadContentDirs } from "../content/loader.ts";
import { CONTENT_KINDS, kindOf } from "../core/ids.ts";
import type { Grade, NumExpr, UnitSpawn } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { runBattle, scenarioToSetup } from "./run.ts";
import type { DynamicScenario } from "./run.ts";
import baselines from "./probe-baselines.json" with { type: "json" };

export type ProbeOptions = { n?: number; seed?: number; jobs?: number; rounds?: number; bands?: string };
type ProbeGrade = keyof typeof baselines.grades;
function probeGrade(grade: Grade): ProbeGrade {
  if (grade === "D" || grade === "C" || grade === "B" || grade === "A" || grade === "S") return grade;
  throw new Error(`沒有 ${grade} 級基準（僅支援 D／C／B／A／S）`);
}
export type Pairing = { name: string; scenario: DynamicScenario; protagonist: string };
export type BandFinding = { id: string; grade: Grade; field: string; value: number; min: number; max: number; message: string };
export type ProbePlan = { id: string; carrier: string; focusAbility: string | null; warnings: string[]; bands: BandFinding[]; pairings: Pairing[] };
export type Trial = { seed: number; winner: string | null; rounds: number; abilityUses: Record<string, number>;
  protagonistAbilityUses: Record<string, number>; error: string | null };
type Task = { group: number; pairing: Pairing; seed: number };
export type DbSnapshot = Parameters<typeof createContentDB>;
export type ProbeWork = { snapshot: DbSnapshot; tasks: Task[] };

type BandKey = "frameHp" | "monsterHp" | "ap" | "damage" | "range" | "armorPen";
type BandLimit = { range: [number, number]; hardMax?: number; areaMax?: number };
type Bands = { source: string; unchecked: string[]; limits: Partial<Record<BandKey, Partial<Record<ProbeGrade, BandLimit>>>> };
function readBands(source = "wf/workflows/content/numeric-bands.json"): Bands {
  const data: unknown = JSON.parse(readFileSync(source, "utf8"));
  if (!data || typeof data !== "object" || !("rows" in data) || !Array.isArray(data.rows)) throw new Error(`${source} 必須包含 rows 陣列`);
  const result: Bands = { source, unchecked: [], limits: {} };
  const range = (text: string): [number, number] | null => {
    const m = /^([+-]?\d+(?:\.\d+)?)(?:\s*[–—-]\s*([+-]?\d+(?:\.\d+)?))?$/u.exec(text.trim());
    if (!m) return null;
    const min = Number(m[1]), max = Number(m[2] ?? m[1]);
    return min <= max ? [min, max] : null;
  };
  for (const [index, raw] of data.rows.entries()) {
    if (!raw || typeof raw !== "object") { result.unchecked.push(`第 ${index} 列：格式無法解析`); continue; }
    const row = raw as Record<string, unknown>, category = String(row.類別 ?? ""), metric = String(row.指標 ?? "");
    const label = `第 ${index} 列 ${category} ${metric}`;
    const key: BandKey | undefined = category === "摹機" && metric === "總層 HP" ? "frameHp"
      : category === "怪獸" && metric.startsWith("總層 HP") ? "monsterHp"
      : category === "能力" && metric.startsWith("AP 成本") ? "ap"
      : category === "能力" && metric.startsWith("單發傷害") ? "damage"
      : category === "能力" && metric.startsWith("射程") ? "range"
      : category === "能力" && metric.includes("armorPen") ? "armorPen" : undefined;
    if (!key) { result.unchecked.push(`${label}：未對應本次六項量測`); continue; }
    const limits: Partial<Record<ProbeGrade, BandLimit>> = {}, prose = String(row.建議區間與硬上限 ?? "");
    for (const grade of Object.keys(baselines.grades) as ProbeGrade[]) {
      let cell = String(row[grade] ?? ""), parsed: [number, number] | null;
      if (key === "armorPen") cell = cell.split("／")[1] ?? "";
      if (key === "range") {
        const ranges = cell.split("／").map(s => range(s.replace(/\s*(近戰|狙擊)$/u, "")));
        parsed = ranges.every(r => r !== null) ? [Math.min(...ranges.map(r => r![0])), Math.max(...ranges.map(r => r![1]))] : null;
      } else parsed = range(cell);
      if (!parsed) { result.unchecked.push(`${label} ${grade}：無法解析 ${cell}`); continue; }
      const limit: BandLimit = { range: parsed };
      const hard = key === "damage" ? /單體硬上限\s*(\d+(?:\.\d+)?)/u.exec(prose)
        : key === "armorPen" ? /armorPen[^；]*硬上限\s*(\d+(?:\.\d+)?)/u.exec(prose)
        : new RegExp(`(?:^|[；，])\\s*${grade} 硬上限\\s*(\\d+(?:\\.\\d+)?)`, "u").exec(prose)
          ?? /^硬上限\s*(\d+(?:\.\d+)?)/u.exec(prose);
      if (hard) limit.hardMax = Number(hard[1]);
      if (key === "damage") {
        const area = /範圍每目標\s*(\d+(?:\.\d+)?)/u.exec(prose);
        if (area) limit.areaMax = Number(area[1]);
      }
      limits[grade] = limit;
    }
    result.limits[key] = limits;
    if (key === "armorPen") result.unchecked.push(`${label}：只檢查 armorPen，accuracy／crit 未檢查`);
    if (key === "range") result.unchecked.push(`${label}：只檢查 rangeMax 聯集，min／次數／地圖大小條件未檢查`);
  }
  for (const key of ["frameHp", "monsterHp", "ap", "damage", "range", "armorPen"] as const)
    if (!result.limits[key]) result.unchecked.push(`${key}：缺少可辨識的來源列`);
  return result;
}

// 傳資料快照而非重讀磁碟：import 呼叫端的記憶體修改也必須進 worker。
export function snapshotDb(db: ContentDB): DbSnapshot {
  const defs = Object.fromEntries(CONTENT_KINDS.map(kind => [kind, Object.fromEntries(db.all(kind).map(d => [d.id, d]))]));
  return [[...db.packs], db.registries, db.rules, defs];
}

function unitAbilities(db: ContentDB, spawn: UnitSpawn): string[] {
  if (spawn.monster) {
    const monster = db.require("monster", spawn.monster);
    return [...new Set([...db.require("species", monster.species).abilities, ...(monster.extraAbilities ?? [])]
      .map(id => db.require("ability", id).id))].sort();
  }
  const frame = db.require("frame", spawn.mech!);
  return [...new Set([...frame.innateAbilities, ...Object.values(spawn.components ?? frame.defaultLoadout ?? {})
    .flatMap(id => db.require("component", id).abilities)].map(id => db.require("ability", id).id))].sort();
}

function crew(db: ContentDB, frameId: string, grade: Grade): NonNullable<UnitSpawn["persons"]> {
  const baseline = baselines.grades[probeGrade(grade)];
  const seats = db.require("bodyplan", db.require("frame", frameId).bodyPlan).parts.flatMap(p => p.seats ?? []);
  if (seats.some(s => s.accepts.includes("pilot"))) return [{ id: baseline.seat === "pilot" ? baseline.person : baselines.grades.C.person, seat: "pilot" }];
  if (seats.some(s => s.accepts.includes("soul"))) return [{ id: baselines.fallbackSoul, seat: "soul" }];
  return [];
}

function scanBands(db: ContentDB, spawn: UnitSpawn, warnings: string[], bands: Bands): BandFinding[] {
  const monster = spawn.monster ? db.require("monster", spawn.monster) : undefined;
  const frame = spawn.mech ? db.require("frame", spawn.mech) : undefined;
  const grade = probeGrade(spawn.grade ?? monster?.grade ?? frame!.grade), id = monster?.id ?? frame!.id;
  const species = monster ? db.require("species", monster.species) : undefined;
  const body = db.require("bodyplan", species?.bodyPlan ?? frame!.bodyPlan);
  const parts = body.parts.map(p => ({ ...p, ...monster?.partsOverride?.find(o => o.id === p.id) }));
  const hp = parts.reduce((sum, p) => sum + p.layers.reduce((n, l) => n + l.hp, 0), 0)
    + Object.values(spawn.components ?? frame?.defaultLoadout ?? {}).reduce((sum, c) => sum
      + (db.require("component", c).layersAdd ?? []).reduce((n, l) => n + l.layer.hp, 0), 0);
  const findings: BandFinding[] = [];
  const check = (owner: string, field: string, value: number, key: BandKey, area = false) => {
    const limit = bands.limits[key]?.[grade];
    if (!limit) return;
    const [min, max] = limit.range;
    if (value < min || value > max) findings.push({ id: owner, grade, field, value, min, max,
      message: `${field} ${value} ${value < min ? `< ${grade} 級下限 ${min}` : `> ${grade} 級上限 ${max}`}` });
    const hardMax = area ? limit.areaMax ?? limit.hardMax : limit.hardMax;
    if (hardMax !== undefined && value > hardMax) findings.push({ id: owner, grade, field: `${field} 硬上限`, value, min: 0, max: hardMax,
      message: `${field} ${value} > ${grade} 級${area ? "範圍每目標" : ""}硬上限 ${hardMax}` });
  };
  check(id, monster ? "怪獸總層 HP" : "摹機總層 HP", hp, monster ? "monsterHp" : "frameHp");
  // 動態戰場／目標數值無單一靜態值，明列未量測，避免捏造為零。
  const number = (expr: NumExpr): number => evalNum(expr, { ref(path) {
    if (path === "self.grade") return "DCBAS".indexOf(grade);
    throw new Error(`動態數值 ${path}`);
  } });
  for (const abilityId of unitAbilities(db, spawn)) {
    const a = db.require("ability", abilityId);
    const checks: [string, () => number, BandKey][] = [
      ["AP 成本", () => a.costs.filter(c => c.pool === "ap").reduce((s, c) => s + number(c.amount), 0), "ap"],
      ["射程", () => number(a.target.range.max), "range"],
    ];
    if (a.packets.length) checks.push(
      ["單發傷害", () => a.packets.reduce((s, p) => s + number(p.amount), 0), "damage"],
      ["armorPen", () => Math.max(...a.packets.map(p => number(p.armorPen ?? 0))), "armorPen"],
    );
    for (const [field, value, band] of checks) {
      try { check(a.id, field, value(), band, band === "damage" && ["ball", "line", "cone"].includes(a.target.kind)); }
      catch (error) { warnings.push(`${a.id} ${field} 未量測：${String(error)}`); }
    }
  }
  return findings;
}

export function planProbe(db: ContentDB, id: string, opts: ProbeOptions = {}, numericBands = readBands(opts.bands)): ProbePlan {
  const warnings: string[] = [];
  let carrier = id, focusAbility: string | null = null;
  if (kindOf(id) === "ability") {
    focusAbility = db.require("ability", id).id;
    const candidates = [...db.all("frame").filter(f => unitAbilities(db, { mech: f.id, at: "zone" }).includes(focusAbility!)).map(f => f.id),
      ...db.all("monster").filter(m => unitAbilities(db, { monster: m.id, at: "zone" }).includes(focusAbility!)).map(m => m.id)].sort();
    if (!candidates.length) throw new Error(`${id} 找不到載體（frame innate／defaultLoadout／species／monster）`);
    carrier = candidates[0]!;
  }
  if (kindOf(carrier) === "scenario") {
    const scenario = structuredClone(db.require("scenario", carrier));
    scenario.rounds = opts.rounds ?? scenario.rounds ?? 20;
    // SPEC-GAP：情境未宣告主角時，優先 player，否則取字典序第一 slot。
    const protagonist = Object.hasOwn(scenario.slots, "player") ? "player" : Object.keys(scenario.slots).sort()[0]!;
    if (protagonist !== "player") warnings.push(`情境沒有 player；以 ${protagonist} 為主角方`);
    const bands = scenario.slots[protagonist]!.units.flatMap(s => scanBands(db, s, warnings, numericBands));
    return { id, carrier: scenario.id, focusAbility, warnings: [...new Set(warnings)], bands, pairings: [{ name: scenario.id, scenario, protagonist }] };
  }
  const kind = kindOf(carrier);
  if (kind !== "frame" && kind !== "monster") throw new Error(`不支援的 id：${id}`);
  const def = db.require(kind, carrier), baseline = baselines.grades[probeGrade(def.grade)];
  const hero: UnitSpawn = { at: { ...baselines.playerAt } };
  if (kind === "frame") {
    const frame = db.require("frame", carrier);
    hero.mech = frame.id; hero.components = { ...frame.defaultLoadout }; hero.persons = crew(db, frame.id, def.grade);
    if (!frame.defaultLoadout) warnings.push(`${frame.id} 沒有 defaultLoadout：空手（仍保留內建能力）`);
  } else hero.monster = def.id;
  const mech = (): UnitSpawn => ({ mech: baseline.frame, components: { ...baseline.components },
    persons: [{ id: baseline.person, seat: baseline.seat as "pilot" | "soul" }], at: { ...baselines.enemyAt } });
  const opponents: { name: string; units: UnitSpawn[] }[] = kind === "frame"
    ? [{ name: `${baseline.frame} ×1`, units: [mech()] }, { name: `${baseline.monster} ×1`, units: [{ monster: baseline.monster, at: { ...baselines.enemyAt } }] }]
    : [{ name: `${baseline.frame} ×${baselines.monsterOpponents}`, units: Array.from({ length: baselines.monsterOpponents }, (_, i) => ({ ...mech(), at: { x: baselines.enemyAt.x, y: baselines.enemyAt.y + i } })) }];
  const bands = scanBands(db, hero, warnings, numericBands);
  return { id, carrier: def.id, focusAbility, warnings: [...new Set(warnings)], bands, pairings: opponents.map(o => ({ name: o.name, protagonist: "player",
    scenario: { id: "scenario/content-probe", map: baselines.map, rounds: opts.rounds ?? 20,
      slots: { player: { faction: baselines.playerFaction, units: [hero] }, enemy: { faction: baselines.enemyFaction, units: o.units } },
      objectives: [{ kind: "eliminate", params: {}, for: "player", onComplete: "win" }, { kind: "eliminate", params: {}, for: "enemy", onComplete: "win" }] } })) };
}

export function runProbeTrial(db: ContentDB, pairing: Pairing, seed: number): Trial {
  const trial: Trial = { seed, winner: null, rounds: 0, abilityUses: {}, protagonistAbilityUses: {}, error: null };
  try {
    const sim = scenarioToSetup(db, pairing.scenario, seed), run = runBattle({ db, sim, seed });
    trial.winner = run.result?.winner ?? null; trial.rounds = run.state.round;
    if (!run.result) throw new Error(`戰鬥未結算：${run.stopped}`);
    for (const event of run.state.log.events) {
      if (event.type !== "AbilityUsed") continue;
      const ability = String(event.payload.ability), unit = String(event.payload.unit);
      // reaction 也發 AbilityUsed，但不是 AI 成功執行 UseAbility。
      if (db.require("ability", ability).mode === "reaction") continue;
      trial.abilityUses[ability] = (trial.abilityUses[ability] ?? 0) + 1;
      if (run.state.units[unit]?.owner === pairing.protagonist)
        trial.protagonistAbilityUses[ability] = (trial.protagonistAbilityUses[ability] ?? 0) + 1;
    }
  } catch (error) { trial.error = error instanceof Error ? error.message : String(error); }
  return trial;
}

function integer(n: number, label: string, min: number): number {
  if (!Number.isSafeInteger(n) || n < min) throw new Error(`${label} 必須是 >= ${min} 的安全整數`);
  return n;
}

export async function probe(db: ContentDB, ids: string[], opts: ProbeOptions = {}) {
  const n = integer(opts.n ?? 20, "n", 1), seed = integer(opts.seed ?? 1, "seed", 0);
  const jobs = integer(opts.jobs ?? Math.min(8, availableParallelism()), "jobs", 1);
  if (opts.rounds !== undefined) integer(opts.rounds, "rounds", 1);
  integer(seed + n - 1, "seed 範圍", 0);
  if (!ids.length) throw new Error("至少指定一個 id");
  const numericBands = readBands(opts.bands);
  const plans = ids.map(id => planProbe(db, id, opts, numericBands)), pairings = plans.flatMap(p => p.pairings);
  const tasks = pairings.flatMap((pairing, group) => Array.from({ length: n }, (_, i) => ({ group, pairing, seed: seed + i })));
  const rows: { group: number; trial: Trial }[] = [];
  if (jobs === 1) for (const t of tasks) rows.push({ group: t.group, trial: runProbeTrial(db, t.pairing, t.seed) });
  else {
    const count = Math.min(jobs, tasks.length), snapshot = snapshotDb(db);
    const workers = Array.from({ length: count }, (_, i) => {
      const workerData: ProbeWork = { snapshot, tasks: tasks.slice(Math.floor(i * tasks.length / count), Math.floor((i + 1) * tasks.length / count)) };
      const child = new Worker(join(import.meta.dirname, "probe-worker.ts"), { workerData });
      const done = new Promise<void>((resolve, reject) => {
        child.on("message", (message: unknown) => rows.push(message as { group: number; trial: Trial }));
        child.on("error", reject);
        child.on("exit", code => code === 0 ? resolve() : reject(new Error(`probe worker exit ${code}`)));
      });
      return { child, done };
    });
    try { await Promise.all(workers.map(w => w.done)); }
    finally { await Promise.all(workers.map(w => w.child.terminate())); }
  }
  rows.sort((a, b) => a.group - b.group || a.trial.seed - b.trial.seed);
  let group = 0;
  const results = plans.map(plan => ({ ...plan, pairings: plan.pairings.map(pairing => {
    const currentGroup = group++;
    const trials = rows.filter(r => r.group === currentGroup).map(r => r.trial);
    const successful = trials.filter(t => !t.error);
    const wins = successful.filter(t => t.winner === pairing.protagonist).length;
    const draws = successful.filter(t => t.winner === null).length, losses = successful.length - wins - draws;
    const merge = (key: "abilityUses" | "protagonistAbilityUses") => {
      const counts: Record<string, number> = {};
      for (const t of trials) for (const [id, count] of Object.entries(t[key])) counts[id] = (counts[id] ?? 0) + count;
      return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
    };
    const abilityUses = merge("abilityUses"), protagonistAbilityUses = merge("protagonistAbilityUses");
    const abilities = [...new Set(pairing.scenario.slots[pairing.protagonist]!.units.flatMap(s => unitAbilities(db, s)))].sort();
    return { name: pairing.name, protagonist: pairing.protagonist, roundsLimit: pairing.scenario.rounds!, n,
      wins, losses, draws, winRate: wins / n, lossRate: losses / n, drawRate: draws / n,
      averageRounds: successful.length ? successful.reduce((sum, t) => sum + t.rounds, 0) / successful.length : null,
      abilityUses, protagonistAbilityUses, neverUsedAbilities: abilities.filter(a => !protagonistAbilityUses[a]),
      focusAbilityUses: plan.focusAbility ? protagonistAbilityUses[plan.focusAbility] ?? 0 : null,
      exceptions: n - successful.length, trials };
  }) }));
  return { version: 1, n, seed, bandsSource: numericBands.source, uncheckedBands: numericBands.unchecked, results };
}

export function formatProbe(result: Awaited<ReturnType<typeof probe>>): string {
  const lines: string[] = [];
  lines.push(`數值帶來源：${result.bandsSource}`);
  lines.push(`未檢查的帶：${result.uncheckedBands.join("；") || "無"}`);
  for (const entry of result.results) {
    lines.push(`${entry.id}（載體 ${entry.carrier}）`);
    for (const warning of entry.warnings) lines.push(`警示：${warning}`);
    lines.push(`超出數值帶的欄位：${entry.bands.length ? entry.bands.map(b => `${b.id} ${b.message}`).join("；") : "無"}`);
    for (const p of entry.pairings) {
      lines.push(`對 ${p.name}：${p.n} 場；勝率 ${(p.winRate * 100).toFixed(1)}%；敗率 ${(p.lossRate * 100).toFixed(1)}%；平手率 ${(p.drawRate * 100).toFixed(1)}%；平均輪數 ${p.averageRounds?.toFixed(2) ?? "無"}（上限 ${p.roundsLimit}）；例外數 ${p.exceptions}`);
      lines.push(`能力使用次數：${JSON.stringify(p.abilityUses)}`);
      lines.push(`主角從未使用的能力：${p.neverUsedAbilities.join("、") || "無"}`);
      if (entry.focusAbility) lines.push(`指定能力 ${entry.focusAbility} 主角使用次數：${p.focusAbilityUses}`);
      for (const t of p.trials) if (t.error) lines.push(`例外 seed=${t.seed}：${t.error}`);
    }
  }
  return lines.join("\n");
}

export async function runCli(args = process.argv.slice(2)) {
  const opts: ProbeOptions = {}, ids: string[] = [], dirs: string[] = [];
  let json: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (["--n", "--seed", "--jobs", "--rounds"].includes(arg)) {
      const key = arg.slice(2) as "n" | "seed" | "jobs" | "rounds";
      opts[key] = integer(Number(args[++i]), key, key === "seed" ? 0 : 1);
    } else if (arg === "--json" || arg === "--content" || arg === "--bands") {
      const value = args[++i]; if (!value || value.startsWith("--")) throw new Error(`${arg} 缺少值`);
      if (arg === "--json") json = value; else if (arg === "--bands") opts.bands = value; else dirs.push(value);
    } else if (arg.startsWith("--")) throw new Error(`未知參數：${arg}`);
    else ids.push(arg);
  }
  const { db, errors } = loadContentDirs(dirs.length ? dirs : ["content/base"]);
  if (errors.length) throw new Error(JSON.stringify(errors));
  const result = await probe(db, ids, opts), summary = formatProbe(result);
  if (json === "-") { console.error(summary); console.log(JSON.stringify(result, null, 2)); }
  else { console.log(summary); if (json) writeFileSync(json, `${JSON.stringify(result, null, 2)}\n`); }
  return result;
}

if (import.meta.main) runCli().then(result => {
  process.exitCode = result.results.some(r => r.pairings.some(p => p.exceptions)) ? 1 : 0;
}).catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
