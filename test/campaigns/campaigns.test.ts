import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fixture } from "../../src/ops/world/test-support.ts";
import { replayCampaign } from "../../src/ops/sim/replay.ts";
import { campaignHash } from "../../src/ops/sim/save.ts";
import { createOpsCtx } from "../../src/ops/content/start.ts";
import { applyCommand } from "../../src/ops/time/index.ts";
import { marketListings } from "../../src/ops/world/market.ts";
import { containsInOrder, sequences, setupState } from "./golden-spec.ts";
import type { Golden } from "./golden-spec.ts";

for (const [name, sequence] of Object.entries(sequences)) test(`黃金戰役 ${name}`, () => {
  const path = `${import.meta.dirname}/${name}`;
  const input = JSON.parse(readFileSync(`${path}.json`, "utf8")) as Golden;
  const { ctx } = fixture(input.seed);
  let state = input.setup ? setupState(ctx, input) : replayCampaign(ctx.db, ctx.world, input.start, input.seed, input.commands);
  if (input.setup) {
    for (const command of input.commands) {
      const output = applyCommand(state, ctx.db, ctx.world, command);
      assert(output.result.ok, `${name} 指令被拒：${JSON.stringify(command)}`);
      state = output.state;
      if (input.setup.loan && command.v === "trade") {
        assert.equal(state.factions[input.setup.loan.issuer]!.rep, -15);
        const market = ctx.world.require("market", "market/war-armory");
        assert(!marketListings(state, createOpsCtx(state, ctx.db, ctx.world), market).some(l => l.item.model === input.setup!.loan!.model));
      }
    }
  }
  assert(containsInOrder(state.log, sequence), `${name} 事件子序列缺失`);
  if (name === "ops-merc-join") {
    assert(state.contracts["contract-126"]?.merc?.attachedLoss && state.contracts["contract-126"]!.merc!.attachedLoss > 0);
    assert(state.ledger.entries.some(e => e.reason === "join-pay" && e.ref));
  }
  if (name === "ops-betrayal") {
    assert(state.log.some(e => e.type === "ReputationChanged" && e.payload.reason === "player-betray" && e.payload.delta === -40));
    assert((state.flags["blacklist:base:faction-ops/residual-league"] ?? 0) > state.clock.day);
  }
  if (name === "ops-leak") {
    const loan = input.setup!.loan!;
    assert.equal(state.factions[loan.issuer]!.rep, -15);
    assert(!state.inventory.mechs.includes(loan.id));
    assert(!state.mechs[loan.id]);
    assert(state.log.some(e => e.type === "TechLeaked" && e.payload.model === loan.model && e.payload.by === "player"));
    assert.equal(state.clock.phase, "neap", JSON.stringify({ clock: state.clock, pending: state.pendingChoices }));
    const market = ctx.world.require("market", "market/war-armory");
    assert(marketListings(state, createOpsCtx(state, ctx.db, ctx.world), market).some(l => l.item.model === loan.model));
  }
  const actual = { logHash: campaignHash(state.log), events: state.log.length, day: state.clock.day };
  if (process.env.GOLDEN_UPDATE === "1") writeFileSync(`${path}.hash.json`, `${JSON.stringify(actual, null, 2)}\n`);
  assert.deepEqual(actual, JSON.parse(readFileSync(`${path}.hash.json`, "utf8")));
});
