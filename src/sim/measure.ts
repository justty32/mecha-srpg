// 平衡量測：skirmish 指定 seed 跑 20 輪，印 Wait 比例與勝負。
// Wait 比例＝wait 指令數／單位回合數（TurnEnd 事件數）：每個單位回合至多 Wait 一次，1.0＝每回合都先 Wait。
// 判準（lead-fix-scenario-ai）：每個 seed 都要 waitRatio < 0.5 或 winner 非 null。
// 用法：node src/sim/measure.ts [scenario] [seeds...]
import { loadContentDirs } from "../content/loader.ts";
import { runBattle, scenarioToSetup } from "./run.ts";

const [scenario = "scenario/skirmish-whitegloves", ...rest] = process.argv.slice(2);
const seeds = rest.length ? rest.map(Number) : [1, 2, 3, 4, 5];
const { db, errors } = loadContentDirs(["content/base"]);
if (errors.length) throw new Error(JSON.stringify(errors));
for (const seed of seeds) {
  const sim = scenarioToSetup(db, scenario, seed, { rounds: 20 });
  const run = runBattle({ db, sim, seed });
  const kinds: Record<string, number> = {};
  for (const c of run.commands) kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
  const ev: Record<string, number> = {};
  for (const e of run.state.log.events) ev[e.type] = (ev[e.type] ?? 0) + 1;
  const total = ev.TurnEnd ?? 0, waits = kinds.wait ?? 0;
  console.log(JSON.stringify({ seed, waitRatio: +(waits / Math.max(1, total)).toFixed(3), waits, unitTurns: total, pass: waits / Math.max(1, total) < 0.5 || (run.result?.winner ?? null) !== null, kinds,
    winner: run.result?.winner ?? null, reason: run.result?.reason ?? run.stopped, rounds: run.state.round,
    hits: ev.Hit ?? 0, misses: ev.Miss ?? 0, deaths: ev.UnitDied ?? 0, hash: run.hash }));
}
