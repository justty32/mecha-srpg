// lead-playtest 量測：全部情境 × seed，AI 對 AI，用情境自己的輪數；每情境一行 JSON（勝方分布、輪數、死亡、hash）。
// 用法：node <本檔> [--seeds 1,2,3,4,5] [--content DIR] [scenario…]
import { loadContentDirs } from "../../../../../../../src/content/loader.ts";
import { runBattle, scenarioToSetup } from "../../../../../../../src/sim/run.ts";

const args = process.argv.slice(2);
const opt = (k: string) => { const i = args.indexOf(k); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const seeds = (opt("--seeds") ?? "1,2,3,4,5").split(",").map(Number), content = opt("--content") ?? "content/base";
const { db, errors } = loadContentDirs([content]);
if (errors.length) throw new Error(JSON.stringify(errors.slice(0, 3)));
const ids = args.length ? args : db.all("scenario").map(s => s.id).sort();
for (const id of ids) {
  const t0 = Date.now(), winners: Record<string, number> = {}, rows: unknown[] = [];
  for (const seed of seeds) {
    try {
      const sim = scenarioToSetup(db, id, seed), run = runBattle({ db, sim, seed });
      const w = run.result?.winner ?? (run.result ? "draw" : `stop:${run.stopped}`);
      winners[w] = (winners[w] ?? 0) + 1;
      const deaths = run.state.log.events.filter(e => e.type === "UnitDied").length;
      rows.push({ seed, w, reason: run.result?.reason ?? run.stopped, r: run.state.round, max: sim.setup.maxRounds ?? null, deaths, hash: run.hash });
    } catch (e) { winners.error = (winners.error ?? 0) + 1; rows.push({ seed, error: String(e).slice(0, 160) }); }
  }
  console.log(JSON.stringify({ id, winners, ms: Date.now() - t0, rows }));
}
