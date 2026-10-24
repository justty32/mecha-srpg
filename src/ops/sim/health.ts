import { loadWorldDirs } from "../content/load.ts";
import { newCampaign } from "../content/start.ts";
import { gridOf } from "../world/grid.ts";
import { runCampaign } from "./campaign.ts";
import { defaultBattleRunner } from "./battle.ts";
import type { PolicyName } from "./policies.ts";
import type { CampaignState } from "../state/types.ts";

export type HealthRow = {
  policy: PolicyName; seed: number; months: number; endDay: number | null; days: number;
  land: number; blight12: number; blightFinal: number; maxGrowth12: number; maxGrowthYear2: number;
  actorsMin: number; actorsMax: number; encounters: number; sailingDays: number; maxEncounters: number;
  cashFirst: number; cashLast: number; cashYear2Mean: number;
  monthly: { month: number; blight: number; cash: number }[];
};

/** 只使用真實政策與戰鬥；終局後只續跑世界以取得完整人口及蝕格統計。 */
export function measureHealth(policy: PolicyName, seed: number, months = 12, onMonth?: (row: HealthRow["monthly"][number], state: CampaignState) => void): HealthRow {
  const { db, world, errors } = loadWorldDirs(["content/base"]);
  if (errors.length) throw new Error(JSON.stringify(errors));
  const initial = newCampaign(db, world, "start/default", seed), firstDay = initial.clock.day;
  const period = world.require("calendar", initial.calendar).daysPerMonth;
  const map = world.require("map", "map/longland").id, land = gridOf(world, map).land;
  const sailingDays = new Set<number>();
  let previous = Object.keys(initial.maps[map]!.blight).length;
  const row: HealthRow = { policy, seed, months, endDay: null, days: 0, land,
    blight12: 0, blightFinal: previous, maxGrowth12: 0, maxGrowthYear2: 0,
    actorsMin: Object.keys(initial.actors).length, actorsMax: Object.keys(initial.actors).length,
    encounters: 0, sailingDays: 0, maxEncounters: 0, cashFirst: initial.ledger.balances.cash, cashLast: 0, cashYear2Mean: 0, monthly: [] };
  const { state } = runCampaign({ db, world, start: "default", seed, months, policy,
    battle: defaultBattleRunner, continueAfterEnd: true, onDay(s) {
      const elapsed = s.clock.day - firstDay;
      if (elapsed <= 12 * period && s.flags.shipMovedDay === s.clock.day &&
        !s.log.some(e => e.type === "CampaignEnd" && e.day < s.clock.day)) sailingDays.add(s.clock.day);
      if (elapsed <= 12 * period) {
        const count = Object.keys(s.actors).length;
        row.actorsMin = Math.min(row.actorsMin, count); row.actorsMax = Math.max(row.actorsMax, count);
      }
      if (elapsed > 0 && elapsed % period === 0 && elapsed <= months * period) {
        const month = elapsed / period, blight = Object.keys(s.maps[map]!.blight).length;
        row.monthly.push({ month, blight, cash: s.ledger.balances.cash });
        onMonth?.(row.monthly.at(-1)!, s);
        if (month <= 12) row.maxGrowth12 = Math.max(row.maxGrowth12, blight - previous);
        else row.maxGrowthYear2 = Math.max(row.maxGrowthYear2, blight - previous);
        if (month === 12) row.blight12 = blight;
        previous = blight; row.blightFinal = blight;
      }
    } });
  const end = state.log.find(e => e.type === "CampaignEnd");
  row.endDay = end?.day ?? null; row.days = state.clock.day - firstDay;
  row.sailingDays = sailingDays.size;
  row.encounters = state.log.filter(e => e.type === "EncounterOffered" && e.day <= firstDay + 12 * period && (!end || e.seq < end.seq)).length;
  const daily = new Map<number, number>();
  for (const e of state.log) if (e.type === "EncounterOffered" && e.day <= firstDay + 12 * period && (!end || e.seq < end.seq)) daily.set(e.day, (daily.get(e.day) ?? 0) + 1);
  row.maxEncounters = Math.max(0, ...daily.values());
  row.cashLast = state.ledger.balances.cash;
  row.cashYear2Mean = months === 24 ? (row.monthly[23]!.cash - row.monthly[11]!.cash) / 12 : 0;
  return row;
}

export function healthFailures(row: HealthRow): string[] {
  const failures: string[] = [];
  if (row.monthly.length !== row.months) failures.push("incomplete-months");
  if (row.blight12 / row.land >= 0.15) failures.push("blight12>=15%");
  if (row.maxGrowth12 / row.land >= 0.03) failures.push("growth1..12>=3%");
  if (row.actorsMin < 40 || row.actorsMax > 200) failures.push("actors-outside-40..200");
  const rate = row.sailingDays ? row.encounters / row.sailingDays : 0;
  // verify2 交接書：idle 只查單日上限；其他政策按實際移動日計率。
  if (row.policy !== "idle" && (rate < 0.1 || rate > 0.4)) failures.push("encounters-outside-0.1..0.4");
  if (row.policy === "greedy" && row.encounters < 3) failures.push("greedy-encounters<3");
  if (row.maxEncounters > 2) failures.push("daily-encounters>2");
  if (row.months === 24 && row.policy === "greedy") {
    if (row.endDay !== null && row.endDay < row.days) failures.push("ended-before-month24");
    if (row.cashLast <= 0) failures.push("cash24<=0");
    if (row.blightFinal / row.land >= 0.25) failures.push("blight24>=25%");
    if (row.maxGrowthYear2 / row.land >= 0.03) failures.push("growth13..24>=3%");
  }
  return failures;
}

export function formatHealth(row: HealthRow): string {
  const failures = healthFailures(row), pct = (n: number) => `${(100 * n / row.land).toFixed(2)}%`;
  return `${row.policy} seed=${row.seed} months=${row.months} end=${row.endDay ?? "none"}` +
    ` blight12=${pct(row.blight12)}${row.months === 24 ? ` blight24=${pct(row.blightFinal)}` : ""}` +
    ` maxGrowth12=${pct(row.maxGrowth12)} maxGrowth13..24=${pct(row.maxGrowthYear2)}` +
    ` actors=${row.actorsMin}..${row.actorsMax} encounters=${row.encounters}/${row.sailingDays}=${(row.sailingDays ? row.encounters / row.sailingDays : 0).toFixed(4)}/sailing-day maxDaily=${row.maxEncounters}` +
    ` cash=${row.cashFirst.toFixed(2)}->${row.cashLast.toFixed(2)} cashMean13..24=${row.cashYear2Mean.toFixed(2)}` +
    ` ${failures.length ? `FAIL (${failures.join(",")})` : "PASS"}`;
}

export function main(args: string[]): number {
  let months = 12;
  let selected: PolicyName[] = ["idle", "greedy", "random"], seeds = [1, 2, 3];
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i], value = args[i + 1];
    if (key === "--months" && [12, 24].includes(Number(value))) months = Number(value);
    else if (key === "--policy" && ["idle", "greedy", "random"].includes(value ?? "")) selected = [value as PolicyName];
    else if (key === "--seed" && [1, 2, 3].includes(Number(value))) seeds = [Number(value)];
    else throw new Error(`invalid option: ${key} ${value}`);
  }
  const rows: HealthRow[] = [];
  for (const policy of selected) for (const seed of seeds) {
    const row = measureHealth(policy, seed, months); rows.push(row); console.log(formatHealth(row));
  }
  return rows.every(r => !healthFailures(r).length) ? 0 : 1;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
