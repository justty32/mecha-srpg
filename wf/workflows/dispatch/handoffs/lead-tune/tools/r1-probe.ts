// lead-tune 診斷：greedy 營運跑到第一場「玩家撤退且第 1 輪就有 Retreated」的出戰，印該場第 1–2 輪事件摘要與玩家單位開場 HP 比例。
// 用法：node <本檔> [seed] [第幾場符合者，預設 1]
import { loadWorldDirs } from "../../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../../src/ops/sim/campaign.ts";
import { defaultBattleRunner } from "../../../../../../src/ops/sim/battle.ts";
import { classifyOutcome } from "../../../../../../src/ops/sortie/outcome.ts";
import type { CampaignState, OpsCtx, Sortie } from "../../../../../../src/ops/state/types.ts";
const [seed = 1, nth = 1] = process.argv.slice(2).map(Number);
const { db, world } = loadWorldDirs(["content/base"]);
let hit = 0;
const battle = (s: CampaignState, ctx: OpsCtx, sortie: Sortie) => {
  const out = defaultBattleRunner(s, ctx, sortie);
  const r = (out as any).result;
  if (!r || hit >= nth) return out;
  const { outcome } = classifyOutcome(r, sortie);
  const ev = (r.events ?? r.log?.events ?? []) as { type: string; round: number; payload: any }[];
  const own = new Set(r.units.filter((u: any) => u.state.owner === "player").map((u: any) => u.id));
  if (outcome !== "withdrew" || !ev.some(e => e.type === "Retreated" && e.round <= 1 && own.has(e.payload.unit))) return out;
  if (++hit < nth) return out;
  console.log(JSON.stringify({ sortie: sortie.id, contract: sortie.contract, units: sortie.units.map(u => u.mech), result: { winner: r.winner, reason: r.reason, detail: r.detail, rounds: r.rounds, withdrawn: r.withdrawn } }));
  for (const u of r.units) console.log("unit", u.id, u.state.owner, u.status, u.state.frame);
  for (const e of ev.filter(e => e.round <= 2 && !["LayerDamaged"].includes(e.type))) console.log(e.round, e.type, JSON.stringify(e.payload).slice(0, 160));
  return out;
};
runCampaign({ db, world, start: "default", months: 12, seed, policy: "greedy", battle });
