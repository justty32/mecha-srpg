// 領導 lead-integ-battle 的基準腳本：取 ops greedy seed 7 的第一場出戰，部署欄移到 x=2（與撤離欄 x=0 分開），
// 計時 runBattle 固定步數。用法（在 repo 或 worktree 根）：
//   node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts [maxSteps=500] [deployX=2]
// 輸出一行 JSON：ms、msPerStep、stopped、round、commands、hash。行為不變的優化 hash 必須不變。
import { loadWorldDirs } from "../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../src/ops/sim/campaign.ts";
import { generateScenario } from "../../../../../src/ops/sortie/scenario.ts";
import type { SortieScenario } from "../../../../../src/ops/sortie/scenario.ts";
import { runBattle, scenarioToSetup } from "../../../../../src/sim/index.ts";

const maxSteps = Number(process.argv[2] ?? 500), deployX = Number(process.argv[3] ?? 2);
const { db, world, errors } = loadWorldDirs(["content/base"]);
if (errors.length) throw new Error(JSON.stringify(errors));
let done = false;
runCampaign({ db, world, start: "default", months: 3, seed: 7, policy: "greedy", battle: (s, ctx, sortie) => {
  if (done) return { ok: false, error: "bench-skip" };
  done = true;
  const oldDB = ctx.db;
  const scenario = generateScenario(structuredClone(s), ctx, sortie) as SortieScenario;
  const zone = scenario.ops.map.deployZones.player;
  if (zone && !scenario.ops.map.cells) throw new Error("unexpected map");
  if (zone) for (const cell of zone) cell.x = Math.min(deployX, scenario.ops.map.width - 1);
  const sim = scenarioToSetup(ctx.db, scenario, scenario.seed!);
  const t = performance.now();
  const run = runBattle({ db: ctx.db, sim, seed: scenario.seed!, maxSteps });
  const ms = performance.now() - t;
  ctx.db = oldDB;
  console.log(JSON.stringify({ ms: Math.round(ms), msPerStep: +(ms / Math.max(1, run.commands.length + run.rejected)).toFixed(2),
    stopped: run.stopped, round: run.state.round, commands: run.commands.length, winner: run.result?.winner ?? null, hash: run.hash }));
  return { ok: false, error: "bench-done" };
} });
