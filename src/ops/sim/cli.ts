import { dailySummary } from "../time/tick.ts";
import { createOpsCtx } from "../content/start.ts";
import { loadWorldDirs } from "../content/load.ts";
import { runCampaign } from "./campaign.ts";
import { policies } from "./policies.ts";
import type { PolicyName } from "./policies.ts";
import { defaultBattleRunner } from "./battle.ts";

export function main(args: string[]): number {
  let start = "default", months = 12, seed = 7, policy: PolicyName = "greedy", noBattle = false;
  for (let i = 0; i < args.length; i++) {
    const key = args[i]!;
    if (key === "--no-battle") { noBattle = true; continue; }
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error(`missing value: ${key}`);
    switch (key) {
      case "--start": start = value; break;
      case "--months": months = Number(value); break;
      case "--seed": seed = Number(value); break;
      case "--policy":
        if (!Object.hasOwn(policies, value)) throw new Error(`unknown policy: ${value}`);
        policy = value as PolicyName; break;
      default: throw new Error(`unknown option: ${key}`);
    }
  }
  const { db, world, errors } = loadWorldDirs(["content/base"]);
  if (errors.length) throw new Error(JSON.stringify(errors));
  const firstDay = world.require("start", start.includes("/") ? start : `start/${start}`).day;
  let maxOperations = 0, maxWarRatio = 0, maxAlliedRatio = 0, maxDays = 0;
  // idle 的多日等待仍逐日 tick；事件會暫停並續跑，省掉每一天額外的 wait 指令快照。
  const idleTarget = firstDay + months * world.require("calendar", world.require("start", start.includes("/") ? start : `start/${start}`).calendar ?? world.all("calendar")[0]!.id).daysPerMonth;
  const selectedPolicy = policy === "idle" ? ((s, ctx) => {
    const cmd = policies.idle(s, ctx);
    return cmd.v === "wait" ? { v: "wait" as const, days: Math.max(1, idleTarget - s.clock.day) } : cmd;
  }) satisfies import("./policies.ts").Policy : policy;
  const result = runCampaign({ onDay(s) {
    const period = world.require("calendar", s.calendar).daysPerMonth, elapsed = s.clock.day - firstDay;
    if (elapsed > 0 && elapsed % period === 0) {
      const row = { ...dailySummary(s, createOpsCtx(s, db, world)), month: elapsed / period, day: s.clock.day };
      console.log(`潮月 ${row.month} day=${row.day} cash=${row.cash} debt=${row.debt} 人數=${row.persons} 拘束艙生物機甲數=${row.beasts} 蝕化節點數=${row.blighted} 裂縫數=${row.rifts} 作戰=${row.operations ?? 0} war=${row.war ?? 0} allied=${row.allied ?? 0} 釋出=${row.released ?? 0} join=${row.joins ?? 0}`);
    }
    const ops = Object.values(s.operations ?? {}), rels = Object.values(s.relations ?? {}).filter(r => s.factions[r.a]?.alive && s.factions[r.b]?.alive);
    maxOperations = Math.max(maxOperations, ops.filter(o => !["done", "failed", "aborted"].includes(o.phase)).length);
    maxWarRatio = Math.max(maxWarRatio, rels.filter(r => r.state === "war").length / (rels.length || 1));
    maxAlliedRatio = Math.max(maxAlliedRatio, rels.filter(r => r.state === "allied").length / (rels.length || 1));
    for (const op of ops) maxDays = Math.max(maxDays, (["done", "failed", "aborted"].includes(op.phase) ? op.phaseEnd : s.clock.day) - op.startDay);
  }, db, world, start, months, seed, policy: selectedPolicy, ...(noBattle ? {} : { battle: defaultBattleRunner }) });

  const events = result.state.log;
  console.log(`war統計 ${JSON.stringify({ enteredWar: events.filter(e => e.type === "RelationChanged" && e.payload.to === "war").length,
    ceasefires: events.filter(e => e.type === "TreatySigned" && e.payload.kind === "ceasefire").length,
    NodeTransferred: events.filter(e => e.type === "NodeTransferred").length, OperationResolved: events.filter(e => e.type === "OperationResolved").length,
    maxOperations, maxDays, maxWarRatio, maxAlliedRatio })}`);
  console.log("OK");
  return 0;
}
if (import.meta.main) process.exit(main(process.argv.slice(2)));
