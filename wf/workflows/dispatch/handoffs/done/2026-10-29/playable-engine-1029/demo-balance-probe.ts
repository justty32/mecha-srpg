import { analyzeSeverity } from "./severity.ts";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { packHash } from "../../../../../../../src/sim/save.ts";
import { loadContentDirs } from "../../../../../../../src/content/loader.ts";
import { runBattle, scenarioToSetup } from "../../../../../../../src/sim/run.ts";
import { movementBudget } from "../../../../../../../src/rules/movement.ts";
import { createBattle } from "../../../../../../../src/rules/flow.ts";
import { abilitiesOf, checkAbility, tryCommand } from "../../../../../../../src/rules/command.ts";
import { commanderOf } from "../../../../../../../src/rules/state.ts";
import { startBattle } from "../../../../../../../src/rules/turn.ts";
import { hashLog } from "../../../../../../../src/core/eventlog.ts";
const loaded = loadContentDirs(["content/base"]);
if (loaded.errors.length) throw new Error(JSON.stringify(loaded.errors));
const base = loaded.db;
const sources = ["src/core/types-def.ts", "src/core/types-state.ts", "src/rules/aim.ts", "src/rules/attack.ts", "src/rules/command.ts", "src/rules/contribs.ts", "src/rules/defense.ts", "src/rules/effects.ts", "src/rules/flow.ts", "src/rules/layers.ts", "src/rules/movement.ts", "src/rules/part-hits.ts", "src/rules/turn.ts", "src/rules/state.ts", "src/core/clone-state.ts", "src/sim/session.ts", "src/sim/save.ts", "src/ai/agent.ts", "src/sim/run.ts"];
const sourceDigest = createHash("sha256");
for (const name of sources) sourceDigest.update(name).update(readFileSync(new URL(`../../../../../${name}`, import.meta.url)));
const sourceHash = sourceDigest.digest("hex");
const params = { band: 1, attackRatio: 0, holdRatio: 0, retreatMinRound: 999, retreatForceRatio: 0, retreat: 0, ejectBelow: 0, waitScore: 0, endScore: 0.0001, attack: 2, attackArea: 2, disable: 1, heal: 0, buff: 0, protect: 0, survive: 0, dangerK: 0, reposition: 0.3, intentMinRound: 999, commanderScatter: 0, humanCommanderScatter: 0, pilotFleeHp: 0, individualFleeHp: 0, rotateRounds: 0 };
const scenarioId = process.env.PROBE_SCENARIO ?? "scenario/skirmish-whitegloves";
const mode = process.argv[2] ?? "both";
const configurations = [
  { name: "original", attackAccuracyBonus: 0, scriptedAccuracyBase: 0 },
  { name: "bonus15", attackAccuracyBonus: 15, scriptedAccuracyBase: 0 },
  { name: "local45", attackAccuracyBonus: 15, scriptedAccuracyBase: 45 },
];
const selected = mode === "formal" ? [{ name: "formal", attackAccuracyBonus: base.rules.constants.attackAccuracyBonus ?? 0, scriptedAccuracyBase: base.require("scenario", scenarioId).rules?.scriptedAccuracyBase ?? 0 }] : ["coreExposure", "coreHp"].includes(mode) ? [{ name: mode, attackAccuracyBonus: 15, scriptedAccuracyBase: 45 }] : mode === "local40" ? [{ name: "local40", attackAccuracyBonus: 15, scriptedAccuracyBase: 40 }] : mode === "both" ? configurations : configurations.filter(c => c.name === mode);
if (!selected.length) throw new Error("mode: original | bonus15 | local45 | both");
const requested = process.argv.slice(3).map(Number);
const seeds = requested.length ? requested : [...Array.from({ length: 20 }, (_, i) => i + 1), 101, 137, 211, 307, 509];
const results: Record<string, unknown>[] = [];
const traced = new Set<string>();
for (const configuration of selected) {
  const { scriptedAccuracyBase, attackAccuracyBonus } = configuration;
  const moji = base.require("frame", "frame/moji-tern");
  const reaper = base.require("ability", "ability/reaper-cleave");
  const originalReaper = { ...reaper, packets: reaper.packets.map((p, i) => i === 0 ? { ...p, amount: 20 } : p) };
  const radiant = base.require("ability", "ability/mx-radiant-shot");
  const originalRadiant = { ...radiant, packets: radiant.packets.map((p, i) => i === 0 ? { ...p, amount: 22 } : p) };
  const originalMoji = { ...moji, pools: moji.pools.map(p => p.id === "charge" ? { ...p, regen: 10 } : p) };
  const baseline = ["original", "bonus15"].includes(configuration.name);
  const overrides = new Map<string, unknown>();
  if (baseline) for (const def of [originalMoji, originalRadiant, originalReaper]) overrides.set(def.id, def);
  const coreChanges = [
    { name: "biped-standard", part: "torso", hp: 50, reduced: 38 },
    { name: "biped-light", part: "torso", hp: 60, reduced: 45 },
    { name: "insect-reaper", part: "thorax", hp: 40, reduced: 30 },
    { name: "ancient-warden", part: "shell-core", hp: 80, reduced: 60 },
  ];
  if (baseline || configuration.name.startsWith("core")) for (const change of coreChanges) {
    const def = structuredClone(base.require("bodyplan", `bodyplan/${change.name}`));
    const part = def.parts.find(p => p.id === change.part)!;
    part.exposure = baseline ? 1 : 2;
    part.layers.findLast(l => l.structural)!.hp = configuration.name === "coreHp" ? change.reduced : change.hp;
    overrides.set(def.id, def);
  }
  const lookup = (kind: string, id: string) => overrides.get(id.includes(":") ? id : `base:${id}`);
  const baselineContent = { ...base,
    require: ((kind: string, id: string) => lookup(kind, id) ?? base.require(kind as "frame", id)) as typeof base.require,
    get: ((kind: string, id: string) => lookup(kind, id) ?? base.get(kind as "frame", id)) as typeof base.get };
  const db = configuration.name === "formal" ? base : { ...baselineContent, rules: { ...base.rules, constants: { ...base.rules.constants, attackAccuracyBonus, scriptedAccuracyBase: 0 } } };
  const configurationHash = packHash(db, "base");
  for (const seed of seeds) {
    const started = Date.now();
    const sim = scenarioToSetup(db, scenarioId, seed, { rounds: 60 });
    if (scenarioId === "scenario/skirmish-whitegloves" && (sim.setup.units.filter(u => u.owner === "player").length !== 4 || sim.setup.units.filter(u => u.owner === "enemy").length !== 4)) throw new Error("default must remain 4v4");
    if (configuration.name !== "formal") sim.setup.rules = { ...sim.setup.rules, scriptedAccuracyBase };
    const initial = createBattle(db, sim.setup, seed);
    const pools = Object.fromEntries(Object.values(initial.units).map(u => [u.id, Object.fromEntries(Object.entries(u.pools).map(([id, p]) => [id, p.cur]))]));
    for (const slot of ["player", "enemy"]) {
      const actual = sim.slotProfiles[slot];
      if (scenarioId === "scenario/skirmish-whitegloves" && (actual?.policy !== "tactical" || Object.entries(params).some(([key, value]) => actual.params[key] !== value))) throw new Error("formal demo-hardclash profile mismatch");
    }
    const run = runBattle({ db, sim, seed });
    const moveAudit = Object.fromEntries(Object.values(initial.units).map(u => [u.id, { base: movementBudget({ db, s: initial }, u.id).base, spent: 0, steps: 0, maxSpent: 0, maxSteps: 0 }]));
    const morale = Object.fromEntries(Object.values(initial.persons).map(p => [p.id, p.morale]));
    const retreats: { round: number; unit: string; morale: string | null }[] = [];
    let unitTurns = 0, idleTurns = 0, moveOnlyTurns = 0, emptyResourceIdleTurns = 0, used = false, moved = false, lastAttackRound = 0;
    const kinds: Record<string, number> = {}, counts: Record<string, number> = {}, abilitiesUsed: Record<string, number> = {};
    const perRound: Record<string, { hits: number; misses: number; damage: number; deaths: number }> = {};
    let firstDamageRound: number | null = null;
    for (const cmd of run.commands) kinds[cmd.kind] = (kinds[cmd.kind] ?? 0) + 1;
    for (const event of run.state.log.events) {
      counts[event.type] = (counts[event.type] ?? 0) + 1;
      const rr = perRound[event.round] ??= { hits: 0, misses: 0, damage: 0, deaths: 0 };
      if (event.type === "Hit" && event.payload.roll !== null) rr.hits++;
      if (event.type === "Miss" && event.payload.roll !== null) rr.misses++;
      if (event.type === "LayerDamaged") { rr.damage += Number(event.payload.amount); if (Number(event.payload.amount) > 0) firstDamageRound ??= event.round; }
      if (event.type === "UnitDied") rr.deaths++;
      if (event.type === "AbilityUsed" && typeof event.payload.ability === "string") abilitiesUsed[event.payload.ability] = (abilitiesUsed[event.payload.ability] ?? 0) + 1;
      if (event.type === "MoraleChanged" && typeof event.payload.person === "string" && typeof event.payload.to === "string") morale[event.payload.person] = event.payload.to as typeof morale[string];
      if (event.type === "Retreated" && typeof event.payload.unit === "string") {
        const commander = commanderOf({ db, s: initial }, event.payload.unit);
        retreats.push({ round: event.round, unit: event.payload.unit, morale: commander ? morale[commander] ?? null : null });
      }
      if (event.type === "TurnStart") {
        used = false; moved = false;
        const entry = typeof event.payload.unit === "string" ? moveAudit[event.payload.unit] : undefined;
        if (entry && !event.payload.resumed) { entry.spent = 0; entry.steps = 0; }
      }
      if (event.type === "Moved" && typeof event.payload.unit === "string") {
        const entry = moveAudit[event.payload.unit];
        if (entry) { entry.spent += Number(event.payload.cost); entry.steps++; entry.maxSpent = Math.max(entry.maxSpent, entry.spent); entry.maxSteps = Math.max(entry.maxSteps, entry.steps); }
      }
      if (event.type === "AbilityUsed") { used = true; lastAttackRound = event.round; }
      if (event.type === "Moved") moved = true;
      if (event.type === "PoolChanged" && typeof event.payload.owner === "string" && typeof event.payload.pool === "string" && typeof event.payload.to === "number") {
        const owner = pools[event.payload.owner]; if (owner) owner[event.payload.pool] = event.payload.to;
      }
      if (event.type === "TurnEnd") {
        unitTurns++;
        if (!used) {
          idleTurns++;
          if (moved) moveOnlyTurns++;
          const values = typeof event.payload.unit === "string" ? pools[event.payload.unit] : undefined;
          // 明列為池耗空觀察值，不把所有無攻擊回合誤稱資源死鎖。
          if (values && Object.entries(values).some(([id, cur]) => id !== "heat" && cur <= 0)) emptyResourceIdleTurns++;
        }
      }
    }
    const casualties = Object.fromEntries(["player", "enemy"].map(slot => {
      const ids = sim.setup.units.filter(u => u.owner === slot).map(u => u.id);
      const status = (id: string) => run.state.rt?.unitStatus[id];
      const deathEvents = new Set(run.state.log.events.filter(e => e.type === "UnitDied" && typeof e.payload.unit === "string" && ids.includes(e.payload.unit)).map(e => e.payload.unit));
      return [slot, { ids, deadIds: ids.filter(id => status(id) === "dead"), deathEventIds: [...deathEvents].sort(), total: ids.length, alive: ids.filter(id => status(id) !== "dead").length, dead: ids.filter(id => status(id) === "dead").length,
        deathEvents: deathEvents.size, retreated: ids.filter(id => status(id) === "retreated").length, derelict: ids.filter(id => status(id) === "derelict").length, captured: ids.filter(id => status(id) === "captured").length,
        ejected: run.state.log.events.filter(e => e.type === "Ejected" && typeof e.payload.unit === "string" && ids.includes(e.payload.unit)).length }];
    }));
    const annihilated = Object.entries(casualties).filter(([, side]) => side.total > 0 && side.dead === side.total && side.deathEvents === side.total).map(([slot]) => slot);
    const severity = process.env.PROBE_OBJECTIVE === "severe10" ? analyzeSeverity(db, sim.setup, seed, run.commands, run.hash) : null;
    const movementAuditPass = Object.values(moveAudit).every(entry => entry.maxSpent <= entry.base && entry.maxSteps <= entry.maxSpent);
    const row = { severity, movementModel: "per-owner-turn-budget-v1", moveAudit, movementAuditPass, sourceHash, configurationHash, hitModel: "target-circle-motion-v1", configuration: configuration.name, elapsedMs: Date.now() - started, chargeRegen: db.require("frame", moji.id).pools.find(p => p.id === "charge")?.regen, radiantDamage: db.require("ability", radiant.id).packets[0]?.amount, reaperDamage: db.require("ability", reaper.id).packets[0]?.amount, reaperApCost: db.require("ability", reaper.id).costs.find(c => c.pool === "ap")?.amount, cores: coreChanges.map(change => { const p = db.require("bodyplan", `bodyplan/${change.name}`).parts.find(p => p.id === change.part)!; return { bodyplan: change.name, exposure: p.exposure, structuralHp: p.layers.findLast(l => l.structural)!.hp }; }), attackAccuracyBonus, scriptedAccuracyBase, seed, cohort: seed >= 101 ? "holdout" : "calibration", scenario: sim.scenario,
      rounds: run.state.round, winner: run.result?.winner ?? null, reason: run.result?.reason ?? run.stopped,
      timeout: run.result?.reason === "timeout", stopped: run.stopped, commands: run.commands.length, within20: movementAuditPass && annihilated.length > 0 && run.result?.winner !== null && !!run.result && run.result.reason !== "timeout" && run.state.round <= 20 && !run.commands.some(c => c.kind === "retreat" || c.kind === "eject"), casualties, annihilated,
      unitTurns, idleTurns, moveOnlyTurns, emptyResourceIdleTurns, lastAttackRound, hits: counts.Hit ?? 0, misses: counts.Miss ?? 0,
      deaths: counts.UnitDied ?? 0, abilitiesUsed, perRound, firstDamageRound, retreats, voluntaryRetreats: retreats.filter(r => !["breaking", "fleeing"].includes(r.morale ?? "")).length, rejected: run.rejected, kinds, hash: hashLog(run.state.log),
      remaining: Object.values(run.state.units).map(u => ({ id: u.id, abilities: run.state.rt?.unitStatus[u.id] === "active" ? abilitiesOf({ db, s: run.state }, u.id).filter(id => db.require("ability", id).packets.length) : [], pos: u.pos, parts: Object.fromEntries(Object.entries(u.parts).map(([id, p]) => [id, { hp: p.layers.reduce((n, l) => n + l.hp, 0), broken: p.broken }])), status: run.state.rt?.unitStatus[u.id], pools: Object.fromEntries(Object.entries(u.pools).map(([id, p]) => [id, p.cur])) })) };
    // Explicit audit switch retains all commands even for successful short battles.
    if (process.env.PROBE_TRACE === "1" && (!process.env.PROBE_TRACE_SEEDS || process.env.PROBE_TRACE_SEEDS.split(",").map(Number).includes(seed))) {
      const state = createBattle(db, sim.setup, seed), ctx = { db, s: state };
      startBattle(ctx);
      const snapshot = () => Object.values(state.units).map(u => ({
        id: u.id, status: state.rt?.unitStatus[u.id], pos: { ...u.pos },
        movement: movementBudget(ctx, u.id),
        commander: commanderOf(ctx, u.id),
        pools: Object.fromEntries(Object.entries(u.pools).map(([id, pool]) => [id, pool.cur])),
        parts: Object.fromEntries(Object.entries(u.parts).map(([id, part]) => [id, {
          broken: part.broken, layers: part.layers.map(layer => layer.hp),
        }])),
      }));
      const chase = [];
      for (const [index, command] of run.commands.entries()) {
        const round = state.round, before = round >= 8 && round <= 11 ? snapshot() : null;
        const eventStart = state.log.events.length;
        const result = tryCommand(ctx, command);
        if (!result.ok) throw new Error(`trace replay rejected:${result.rejection.code}`);
        if (before) chase.push({ index, round, command, before, after: snapshot(),
          events: state.log.events.slice(eventStart) });
      }
      const replayHash = hashLog(state.log);
      if (replayHash !== hashLog(run.state.log)) throw new Error("trace replay log mismatch");
      process.stdout.write(JSON.stringify({ trace: true, traceVersion: "commands-and-chase-v1",
        configuration: configuration.name, configurationHash, sourceHash, seed,
        commands: run.commands, chase, replayHash }) + "\n");
    }
    if (row.rounds > 20 && !traced.has(configuration.name)) {
      traced.add(configuration.name);
      const state = createBattle(db, sim.setup, seed), replayCtx = { db, s: state }, diagnostics = [];
      startBattle(replayCtx);
      let attacked = false;
      for (const command of run.commands) {
        if (command.kind === "useAbility") attacked = true;
        if (command.kind === "end") {
          if (!attacked && state.round >= 20 && diagnostics.length < 3) {
            const reasons: Record<string, number> = {}; let legalDamage = 0;
            for (const ability of abilitiesOf(replayCtx, command.actor)) {
              if (!db.require("ability", ability).packets.length) continue;
              for (const target of Object.values(state.units).filter(u => u.owner !== state.units[command.actor]!.owner)) {
                const rejection = checkAbility(replayCtx, command.actor, ability, { unit: target.id });
                if (!rejection) legalDamage++; else reasons[rejection.code] = (reasons[rejection.code] ?? 0) + 1;
              }
            }
            diagnostics.push({ round: state.round, actor: command.actor, morale: Object.values(state.units[command.actor]!.seats).filter(Boolean).map(id => state.persons[id!]?.morale), legalDamage, reasons, pools: state.units[command.actor]!.pools });
          }
          attacked = false;
        }
        const result = tryCommand(replayCtx, command); if (!result.ok) throw new Error(`diagnostic replay rejected:${result.rejection.code}`);
        if (diagnostics.length >= 3) break;
      }
      process.stdout.write(JSON.stringify({ trace: true, configuration: configuration.name, seed, diagnostics, commands: run.commands }) + "\n");
    }
    results.push(row); process.stdout.write(JSON.stringify(row) + "\n");
  }
}
for (const configuration of selected) for (const cohort of ["calibration", "holdout"]) {
  const rows = results.filter(row => row.configuration === configuration.name && row.cohort === cohort);
  if (!rows.length) continue;
  const rounds = rows.map(row => Number(row.rounds)).sort((a, b) => a - b);
  process.stdout.write(JSON.stringify({ summary: true, configuration: configuration.name, cohort, n: rows.length,
    rounds: { min: rounds[0], median: rounds[Math.floor(rounds.length / 2)], p90: rounds[Math.max(0, Math.ceil(rounds.length * 0.9) - 1)], max: rounds.at(-1), mean: rounds.reduce((a, b) => a + b, 0) / rounds.length },
    within20: rows.filter(row => row.within20).length, timeouts: rows.filter(row => row.timeout).length,
    winners: Object.fromEntries([...new Set(rows.map(row => String(row.winner)))].map(winner => [winner, rows.filter(row => String(row.winner) === winner).length])),
    idleTurns: rows.reduce((sum, row) => sum + Number(row.idleTurns), 0), emptyResourceIdleTurns: rows.reduce((sum, row) => sum + Number(row.emptyResourceIdleTurns), 0) }) + "\n");
}
