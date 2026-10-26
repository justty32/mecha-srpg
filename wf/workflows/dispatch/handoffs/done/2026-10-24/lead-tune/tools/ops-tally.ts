// lead-tune 量測：greedy 營運 12 潮月（同 npm run sim:campaign），逐場出戰統計戰果分類、輪數、玩家撤退發生輪、巢母命中。
// 用法：node <本檔> [--months 12] [--detail] [seed…]（預設 seed 1–5）；每 seed 一行 JSON（--detail 另印逐場），最後一行彙總。
import { loadWorldDirs } from "../../../../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../../../../src/ops/sim/campaign.ts";
import { defaultBattleRunner } from "../../../../../../../../src/ops/sim/battle.ts";
import { classifyOutcome } from "../../../../../../../../src/ops/sortie/outcome.ts";
import type { CampaignState, OpsCtx, Sortie } from "../../../../../../../../src/ops/state/types.ts";

const args = process.argv.slice(2);
const flag = (k: string) => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
const mi = args.indexOf("--months"), months = mi >= 0 ? Number(args.splice(mi, 2)[1]) : 12;
const detail = flag("--detail");
const seeds = args.length ? args.map(Number) : [1, 2, 3, 4, 5];
const { db, world, errors } = loadWorldDirs(["content/base"]);
if (errors.length) throw new Error(JSON.stringify(errors));
type Ev = { type: string; round: number; payload: Record<string, unknown> };
type Bucket = { n: number; win: number; repelled: number; withdrew: number; lost: number; timeout: number; withdrewR1: number; withdrewByR3: number; rounds: number; anchorKilled: number; nmHits: number };
const blank = (): Bucket => ({ n: 0, win: 0, repelled: 0, withdrew: 0, lost: 0, timeout: 0, withdrewR1: 0, withdrewByR3: 0, rounds: 0, anchorKilled: 0, nmHits: 0 });
const total: Record<string, Bucket> = { all: blank() };
for (const seed of seeds) {
  const per: Record<string, Bucket> = { all: blank() };
  const battle = (s: CampaignState, ctx: OpsCtx, sortie: Sortie) => {
    const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
    const phase = contract?.target.snapshot?.phase ?? (sortie.trigger === "operation" ? "operation" : contract ? "contract" : "none");
    const out = defaultBattleRunner(s, ctx, sortie);
    const r = (out as { result?: Parameters<typeof classifyOutcome>[0] & { events?: Ev[] } }).result;
    if (!r) return out;
    const { outcome } = classifyOutcome(r, sortie);
    const events = (r.events ?? (r as unknown as { log?: { events?: Ev[] } }).log?.events ?? []) as Ev[];
    const own = new Set(r.units.filter(u => u.state.owner === "player").map(u => u.id));
    const firstRetreat = events.find(e => e.type === "Retreated" && own.has(String(e.payload.unit)))?.round;
    const nm = new Set(r.units.filter(u => (u.state as { frame?: string }).frame?.endsWith("nestmother")).map(u => u.id));
    for (const bucket of [per, total]) for (const key of ["all", phase]) {
      const b = bucket[key] ??= blank();
      b.n++; b[outcome]++; b.rounds += r.rounds ?? 0;
      if (outcome === "withdrew" && firstRetreat != null && firstRetreat <= 1) b.withdrewR1++;
      if (outcome === "withdrew" && firstRetreat != null && firstRetreat <= 3) b.withdrewByR3++;
      b.anchorKilled += r.units.filter(u => nm.has(u.id) && u.status === "dead").length;
      b.nmHits += events.filter(e => e.type === "Hit" && own.has(String(e.payload.unit)) && nm.has(String(e.payload.target))).length;
    }
    if (detail) console.log(JSON.stringify({ seed, sortie: sortie.id, template: contract?.template ?? null, trigger: sortie.trigger ?? null, phase, outcome, rounds: r.rounds, firstRetreat: firstRetreat ?? null, winner: r.winner, reason: r.reason }));
    return out;
  };
  runCampaign({ db, world, start: "default", months, seed, policy: "greedy", battle });
  console.log(JSON.stringify({ seed, phases: per }));
}
console.log(JSON.stringify({ seeds, months, total }));
