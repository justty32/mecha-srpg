// lead-tune-battle 量測：greedy 營運（同 npm run sim:campaign）seed 逐一跑 12 潮月，統計每個裂縫潮相的出戰數與玩家勝場、對巢母命中。
// 用法：node <本檔> [--months 12] [seed…]（預設 seed 1–5）；每 seed 一行 JSON，最後一行彙總。
import { loadWorldDirs } from "../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../src/ops/sim/campaign.ts";
import { defaultBattleRunner } from "../../../../../src/ops/sim/battle.ts";
import type { CampaignState, OpsCtx, Sortie } from "../../../../../src/ops/state/types.ts";

const args = process.argv.slice(2);
const mi = args.indexOf("--months"), months = mi >= 0 ? Number(args.splice(mi, 2)[1]) : 12;
const seeds = args.length ? args.map(Number) : [1, 2, 3, 4, 5];
const { db, world, errors } = loadWorldDirs(["content/base"]);
if (errors.length) throw new Error(JSON.stringify(errors));
const total: Record<string, { n: number; wins: number; anchorKilled: number; nmHits: number }> = {};
for (const seed of seeds) {
  const per: typeof total = {};
  const battle = (s: CampaignState, ctx: OpsCtx, sortie: Sortie) => {
    const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
    const phase = contract?.target.snapshot?.phase ?? "none";
    const out = defaultBattleRunner(s, ctx, sortie);
    const r = (out as { result?: { winner?: string; units?: { id: string; status: string; state: { frame: string } }[]; events?: { type: string; payload: Record<string, unknown> }[] } }).result;
    const own = new Set(sortie.units.map(u => u.mech));
    const nm = new Set((r?.units ?? []).filter(u => u.state.frame.endsWith("nestmother")).map(u => u.id));
    for (const bucket of [per, total]) {
      const b = bucket[phase] ??= { n: 0, wins: 0, anchorKilled: 0, nmHits: 0 };
      b.n++; if (r?.winner === "player") b.wins++;
      b.anchorKilled += (r?.units ?? []).filter(u => nm.has(u.id) && u.status === "dead").length;
      b.nmHits += (r?.events ?? []).filter(e => e.type === "Hit" && own.has(String(e.payload.unit)) && nm.has(String(e.payload.target))).length;
    }
    return out;
  };
  runCampaign({ db, world, start: "default", months, seed, policy: "greedy", battle });
  console.log(JSON.stringify({ seed, phases: per }));
}
console.log(JSON.stringify({ seeds, total }));
