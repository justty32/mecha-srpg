import { dailySummary } from "../time/tick.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { loadWorldDirs } from "../content/load.ts";
import { runCampaign } from "./campaign.ts";
import { policies } from "./policies.ts";
import type { PolicyName } from "./policies.ts";
import { defaultBattleRunner } from "./battle.ts";
import { initialWarMetrics, updateWarMetrics, warStatistics } from "./war-metrics.ts";
import { checkInvariants } from "./invariants.ts";

export function main(args: string[]): number {
  let start = "default", months = 12, seed = 7, policy: PolicyName = "greedy", noBattle = false, continueAfterEnd = false;
  for (let i = 0; i < args.length; i++) {
    const key = args[i]!;
    if (key === "--no-battle") { noBattle = true; continue; }
    if (key === "--continue-after-end") { continueAfterEnd = true; continue; }
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
  let metrics = initialWarMetrics(newCampaign(db, world, start.includes("/") ? start : `start/${start}`, seed));
  let minActors = Infinity, maxActors = 0, maxEncounters = 0, maxTickMs = 0, tickMs = 0, ticks = 0;
  // idle 的多日等待仍逐日 tick；事件會暫停並續跑，省掉每一天額外的 wait 指令快照。
  const idleTarget = firstDay + months * world.require("calendar", world.require("start", start.includes("/") ? start : `start/${start}`).calendar ?? world.all("calendar")[0]!.id).daysPerMonth;
  const selectedPolicy = policy === "idle" ? ((s, ctx) => {
    const cmd = policies.idle(s, ctx);
    return cmd.v === "wait" ? { v: "wait" as const, days: Math.max(1, idleTarget - s.clock.day) } : cmd;
  }) satisfies import("./policies.ts").Policy : policy;
  const result = runCampaign({ onTick(ms) { ticks++; tickMs += ms; maxTickMs = Math.max(maxTickMs, ms); }, onDay(s) {
    const errors = checkInvariants(s, world);
    if (errors.length) throw new Error(`day=${s.clock.day}: ${errors.join("; ")}`);
    metrics = updateWarMetrics(metrics, s);
    const count = Object.keys(s.actors).length;
    minActors = Math.min(minActors, count); maxActors = Math.max(maxActors, count);
    maxEncounters = Math.max(maxEncounters, s.log.filter(e => e.day === s.clock.day && e.type === "EncounterOffered").length);
    const period = world.require("calendar", s.calendar).daysPerMonth, elapsed = s.clock.day - firstDay;
    if (elapsed > 0 && elapsed % period === 0) {
      const row = { ...dailySummary(s, createOpsCtx(s, db, world)), month: elapsed / period, day: s.clock.day };
      console.log(`潮月 ${row.month} day=${row.day} cash=${row.cash} debt=${row.debt} 人數=${row.persons} 拘束艙生物機甲數=${row.beasts} 蝕格數=${row.blighted} 裂縫數=${row.rifts} 行動者=${row.actors} 累計遭遇=${row.encounters} 作戰=${metrics.operations} war=${metrics.war} allied=${metrics.allied} 釋出=${metrics.released} join=${metrics.joins}`);
    }
  }, db, world, start, months, seed, policy: selectedPolicy, continueAfterEnd, ...(noBattle ? {} : { battle: defaultBattleRunner }) });
  if (result.summary.length !== months) {
    // 戰役終局（債務扣船、名冊無駕駛）是合法結局：印出終局行；沒有終局事件卻提早停才算錯。
    const end = result.state.log.find(e => e.type === "CampaignEnd");
    if (!end) throw new Error(`campaign-ended-early: requested=${months} completed=${result.summary.length} day=${result.state.clock.day}`);
    console.log(`終局 day=${end.day} reason=${String(end.payload.reason ?? "")} 完成潮月=${result.summary.length}/${months}（加 --continue-after-end 讓世界跑滿）`);
  }

  const events = result.state.log;
  if (policy === "merc") {
    const joins = events.filter(e => e.type === "ContractAccepted" && e.payload.kind === "join");
    const battles = events.filter(e => e.type === "BattleResolved" && e.payload.operation);
    console.log(`merc統計 ${JSON.stringify({ joins: joins.length, wins: battles.filter(e => ["player", "ally"].includes(String(e.payload.winner))).length,
      losses: battles.filter(e => !["player", "ally"].includes(String(e.payload.winner))).length,
      pay: result.state.ledger.entries.filter(e => e.reason === "join-pay").reduce((n, e) => n + e.delta, 0) })}`);
    for (const accepted of joins) {
      const contract = accepted.payload.contract, operation = accepted.payload.operation;
      const sequence = events.filter(e => e === accepted || e.type === "BattleResolved" && e.payload.contract === contract
        || ["OperationResolved", "OperationFailed", "OperationAborted"].includes(e.type) && e.payload.operation === operation
        || e.type === "AllySupplied" && e.payload.contract === contract && ["settlement", "departure"].includes(String(e.payload.reason))
        || e.type === "JoinSettled" && e.payload.contract === contract);
      const refs = new Set(sequence.filter(e => e.type === "OperationResolved" || e.type === "AllySupplied").map(e => `event-${e.seq}`));
      console.log(`join事件 ${JSON.stringify({ contract, operation, sequence: sequence.map(e => ({ day: e.day, type: e.type, ...e.payload })),
        ledger: result.state.ledger.entries.filter(e => e.reason === "join-pay" && !!e.ref && refs.has(e.ref)) })}`);
    }
  }
  console.log(`war統計 ${JSON.stringify(warStatistics(metrics, events))}`);
  const end = events.find(e => e.type === "CampaignEnd");
  const activeDays = Math.max(1, (end?.day ?? result.state.clock.day) - firstDay);
  const encounters = events.filter(e => e.type === "EncounterOffered" && (!end || e.seq < end.seq)).length;
  console.log(`actor統計 ${JSON.stringify({ minActors, maxActors, encounters, activeDays, endDay: end?.day ?? null,
    encountersPerDay: encounters / activeDays, maxEncounters,
    maxTickMs, meanTickMs: tickMs / Math.max(1, ticks) })}`);
  console.log("OK");
  return 0;
}
if (import.meta.main) process.exit(main(process.argv.slice(2)));
