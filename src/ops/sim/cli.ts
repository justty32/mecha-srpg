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
  const result = runCampaign({ db, world, start, months, seed, policy, ...(noBattle ? {} : { battle: defaultBattleRunner }) });
  for (const row of result.summary) console.log(`潮月 ${row.month} day=${row.day} cash=${row.cash} debt=${row.debt} 人數=${row.persons} 拘束艙生物機甲數=${row.beasts} 蝕化節點數=${row.blighted} 裂縫數=${row.rifts}`);
  console.log("OK");
  return 0;
}
if (import.meta.main) process.exit(main(process.argv.slice(2)));
