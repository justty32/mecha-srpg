import type { CampaignState, OpsCtx } from "../state/types.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { marketPrice } from "./market.ts";

export function resupplyDaily7(s: CampaignState, ctx: OpsCtx): void {
  if (s.ship.route || (s as CampaignState & { drifting?: boolean }).drifting) return;
  const market = ctx.world.all("market").filter(item => item.node === s.ship.at)
    .sort((a, b) => a.id.localeCompare(b.id))[0];
  if (!market) return;
  const prices = new Map(market.lists.filter(list => list.kind === "ammo")
    .flatMap(list => list.items.map(item => [item.def, marketPrice(s, ctx, market, item)] as const)));
  for (const mechId of Object.keys(s.mechs).sort()) {
    const mech = s.mechs[mechId]!;
    if (mech.owner !== "player") continue;
    for (const poolId of Object.keys(mech.pools).sort()) {
      const pool = mech.pools[poolId]!, price = prices.get(poolId);
      if (!poolId.startsWith("ammo") || pool.cur >= pool.max || price === undefined || !Number.isFinite(price) || price < 0) continue;
      const missing = Math.max(0, Math.floor(pool.max - pool.cur));
      const cash = s.ledger.balances.cash;
      if (cash < 0) continue;
      let rounds = price === 0 ? missing : Math.min(missing, Math.floor(cash / price));
      while (rounds > 0 && rounds * price > cash) rounds--;
      while (rounds < missing && (rounds + 1) * price <= cash) rounds++;
      if (rounds === 0) continue;
      const cost = rounds * price;
      const ref = eventRef(ctx.emit("Resupplied", { mech: mechId, pool: poolId, rounds, cost }));
      post(s, ctx, { account: "cash", delta: -cost, reason: "resupply", ref });
      pool.cur += rounds;
    }
  }
}
