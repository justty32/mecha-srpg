// lead-tune 量測：greedy 營運 N 潮月，統計政策每天選了什麼（指令種類、wait 的成因粗分），看出戰數被什麼卡住。
// 用法：node <本檔> [--months 12] [seed…]（預設 seed 1–5）；每 seed 一行 JSON。
import { loadWorldDirs } from "../../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../../src/ops/sim/campaign.ts";
import { greedy } from "../../../../../../src/ops/sim/policies.ts";
import { defaultBattleRunner } from "../../../../../../src/ops/sim/battle.ts";
import type { CampaignState, OpsCtx } from "../../../../../../src/ops/state/types.ts";
const args = process.argv.slice(2);
const mi = args.indexOf("--months"), months = mi >= 0 ? Number(args.splice(mi, 2)[1]) : 12;
const seeds = args.length ? args.map(Number) : [1, 2, 3, 4, 5];
const { db, world } = loadWorldDirs(["content/base"]);
for (const seed of seeds) {
  const kinds: Record<string, number> = {};
  const policy = (s: CampaignState, ctx: OpsCtx) => {
    const cmd = greedy(s, ctx);
    let key = cmd.v as string;
    if (cmd.v === "wait") {
      const unsteady = Object.keys(s.roster.persons).filter(id => (s.roster.employment[id]?.mood ?? 0) < 0).length;
      const active = Object.values(s.contracts).some(c => !c.operation && ["active", "stage"].includes(c.status));
      key = s.ship.route ? "wait:sailing" : !active ? "wait:noContract" : unsteady ? "wait:crewMood" : "wait:other";
    }
    kinds[key] = (kinds[key] ?? 0) + 1;
    return cmd;
  };
  const { state } = runCampaign({ db, world, start: "default", months, seed, policy, battle: defaultBattleRunner });
  const cash = state.ledger.balances.cash;
  console.log(JSON.stringify({ seed, kinds, cash, day: state.clock.day }));
}
