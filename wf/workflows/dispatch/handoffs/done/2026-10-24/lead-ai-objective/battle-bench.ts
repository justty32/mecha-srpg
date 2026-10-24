// lead-ai-objective 量測工具：把 greedy 營運的每場出戰凍結成「出戰前營運狀態＋sortie」，之後用目前的 AI 重打同一批戰場。
// 用法：
//   node <本檔> --capture OUT.json [seed…]   跑 greedy 12 潮月，存每場出戰前的狀態（預設 seed 1–5）
//   node <本檔> IN.json [--phase anchored]  用目前程式重打凍結的戰場，每場一行 JSON＋最後一行彙總
// 凍結集與營運路徑無關，適合比較 AI 改動；最終驗收仍以 balance-probe.ts 的全營運為準。
import { readFileSync, writeFileSync } from "node:fs";
import { loadWorldDirs } from "../../../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../../../src/ops/sim/campaign.ts";
import { defaultBattleRunner } from "../../../../../../../src/ops/sim/battle.ts";
import { runSortie } from "../../../../../../../src/ops/sortie/run.ts";
import type { CampaignState, OpsCtx, Sortie } from "../../../../../../../src/ops/state/types.ts";

type Frozen = { seed: number; day: number; phase: string | null; kind: string | null; s: CampaignState; sortie: Sortie };
const args = process.argv.slice(2);
const { db, world, errors } = loadWorldDirs(["content/base"]);
if (errors.length) throw new Error(JSON.stringify(errors));

if (args[0] === "--capture") {
  const out = args[1];
  if (!out) throw new Error("--capture needs OUT.json");
  const seeds = args.slice(2).map(Number);
  const frozen: Frozen[] = [];
  for (const seed of seeds.length ? seeds : [1, 2, 3, 4, 5]) {
    const battle = (s: CampaignState, ctx: OpsCtx, sortie: Sortie) => {
      const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
      const template = contract ? world.get("contract", contract.template) : undefined;
      frozen.push({ seed, day: sortie.day, phase: contract?.target.snapshot?.phase ?? null, kind: template?.kind ?? null,
        s: structuredClone(s), sortie: structuredClone(sortie) });
      return defaultBattleRunner(s, ctx, sortie);
    };
    runCampaign({ db, world, start: "default", months: 12, seed, policy: "greedy", battle });
  }
  writeFileSync(out, JSON.stringify(frozen));
  console.log(`captured ${frozen.length} sorties → ${out}`);
} else {
  const file = args[0];
  if (!file) throw new Error("usage: battle-bench.ts IN.json [--phase P]");
  const phaseAt = args.indexOf("--phase"), phase = phaseAt >= 0 ? args[phaseAt + 1] : undefined;
  const frozen = (JSON.parse(readFileSync(file, "utf8")) as Frozen[]).filter(f => !phase || f.phase === phase);
  let wins = 0, rounds = 0, nmHits = 0;
  for (const f of frozen) {
    const ctx: OpsCtx = { db, world, emit: (type, payload) => ({ type, payload: payload ?? {}, day: 0, seq: 0 }) as never };
    const s = structuredClone(f.s), own = new Set(f.sortie.units.map(u => u.mech));
    const out = runSortie(s, ctx, f.sortie);
    const r = out.result;
    if (r?.winner === "player") wins++;
    rounds += r?.rounds ?? 0;
    nmHits += (r?.events ?? []).filter(e => e.type === "Hit" && own.has(String(e.payload.unit))
      && r?.units.find(u => u.id === e.payload.target)?.state.frame.endsWith("nestmother")).length;
    const events = r?.events ?? [];
    console.log(JSON.stringify({ seed: f.seed, day: f.day, phase: f.phase, kind: f.kind, mechs: own.size,
      winner: r?.winner ?? null, reason: r?.reason ?? (out.ok ? null : out.error), rounds: r?.rounds ?? null,
      ownRetreated: r?.units.filter(u => own.has(u.id) && u.status === "retreated").length ?? 0,
      ownLost: r?.units.filter(u => own.has(u.id) && ["dead", "derelict-lost"].includes(u.status)).length ?? 0,
      enemiesKilled: r?.units.filter(u => !own.has(u.id) && u.status === "dead").length ?? 0,
      remaining: r?.units.filter(u => !own.has(u.id) && u.status !== "dead").map(u => u.state.frame.split("/").at(-1)) ?? [],
      ownHits: events.filter(e => e.type === "Hit" && own.has(String(e.payload.unit))).length,
      nmHits: events.filter(e => e.type === "Hit" && own.has(String(e.payload.unit))
        && r?.units.find(u => u.id === e.payload.target)?.state.frame.endsWith("nestmother")).length }));
  }
  console.log(JSON.stringify({ total: frozen.length, wins, winRate: +(wins / Math.max(1, frozen.length)).toFixed(3),
    avgRounds: +(rounds / Math.max(1, frozen.length)).toFixed(2), nmHits }));
}
