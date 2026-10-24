// lead-ai-objective 量測：同 src/sim/measure.ts，但用情境自己的輪數（或 --rounds N），並印目標相關計數。
// 用法：node <本檔> [scenario] [--rounds N] [seed…]
import { loadContentDirs } from "../../../../../../../src/content/loader.ts";
import { runBattle, scenarioToSetup } from "../../../../../../../src/sim/run.ts";

const args = process.argv.slice(2);
const at = args.indexOf("--rounds"), rounds = at >= 0 ? Number(args[at + 1]) : undefined;
const rest = args.filter((_, i) => at < 0 || (i !== at && i !== at + 1));
const [scenario = "scenario/skirmish-whitegloves", ...seedArgs] = rest;
const seeds = seedArgs.length ? seedArgs.map(Number) : [1, 2, 3, 4, 5];
const { db, errors } = loadContentDirs(["content/base"]);
if (errors.length) throw new Error(JSON.stringify(errors));
for (const seed of seeds) {
  const sim = scenarioToSetup(db, scenario, seed, rounds ? { rounds } : undefined);
  const run = runBattle({ db, sim, seed });
  const kinds: Record<string, number> = {};
  for (const c of run.commands) kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
  const ev: Record<string, number> = {};
  for (const e of run.state.log.events) ev[e.type] = (ev[e.type] ?? 0) + 1;
  const total = ev.TurnEnd ?? 0, waits = kinds.wait ?? 0;
  const targets = new Set(sim.setup.objectives.flatMap(o => [o.params.unit, ...(Array.isArray(o.params.units) ? o.params.units : [])])
    .filter((id): id is string => typeof id === "string"));
  const targetHits = run.state.log.events.filter(e => e.type === "Hit" && targets.has(String(e.payload.target))).length;
  console.log(JSON.stringify({ seed, winner: run.result?.winner ?? null, reason: run.result?.reason ?? run.stopped, rounds: run.state.round,
    waitRatio: +(waits / Math.max(1, total)).toFixed(3), unitTurns: total, hits: ev.Hit ?? 0, deaths: ev.UnitDied ?? 0,
    retreats: kinds.retreat ?? 0, targetHits, hash: run.hash }));
}
