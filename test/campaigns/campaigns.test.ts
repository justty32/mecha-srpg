import { placeAt } from "../../src/ops/war/loc.ts";
import type { Loc } from "../../src/ops/war/types.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fixture } from "../../src/ops/world/test-support.ts";
import type { CampaignEvent, ContractState, RiftState } from "../../src/ops/state/types.ts";
import type { CampaignCommand } from "../../src/ops/sim/campaign.ts";
import { replayCampaign } from "../../src/ops/sim/replay.ts";
import { campaignHash } from "../../src/ops/sim/save.ts";
import { createOpsCtx, newCampaign } from "../../src/ops/content/start.ts";
import { instantiateMech } from "../../src/ops/content/instantiate.ts";
import { applyCommand } from "../../src/ops/time/index.ts";
import { marketListings } from "../../src/ops/world/market.ts";

type Golden = { start: string; seed: number; commands: CampaignCommand[];
  setup?: { rifts?: Record<string, Pick<RiftState, "width" | "anchorAge">>; factions?: Record<string, { rep: number }>; ship?: { pos: Loc };
    loan?: { id: string; contract: string; model: string; issuer: string } } };
type Step = { type: string; field?: string; value?: string };
const warOnly = new Set(["OperationStarted", "OperationEngaged", "OperationResolved", "RiftPhase", "ShellSeized", "LineageOpened", "ModelReleased",
  "ContractAccepted", "ContractCancelled", "Arrived", "BattleResolved", "JoinSettled", "Betrayed", "MechLoaned", "TechLeaked"]);
const sequences: Record<string, Step[]> = {
  "ops-war-assault": [
    { type: "OperationStarted", field: "kind", value: "assault" },
    { type: "OperationEngaged", field: "operation", value: "operation-4" },
    { type: "OperationEngaged", field: "operation", value: "operation-4" },
    { type: "RiftPhase", field: "to", value: "unanchored" },
    { type: "OperationResolved", field: "operation", value: "operation-4" },
  ],
  "ops-relic": [
    { type: "OperationStarted", field: "kind", value: "relic-hunt" },
    { type: "ShellSeized", field: "shell", value: "shell/old-array" },
    { type: "LineageOpened", field: "lineage", value: "base:lineage/old-array" },
    { type: "ModelReleased", field: "model", value: "base:model/old-array-ii" },
  ],
  "ops-merc-join": [
    { type: "ContractAccepted", field: "contract", value: "contract-67" },
    { type: "Arrived", field: "place", value: "base:place/salt-flat" },
    { type: "BattleResolved", field: "operation", value: "operation-2" },
    { type: "OperationResolved", field: "operation", value: "operation-2" },
    { type: "JoinSettled", field: "contract", value: "contract-67" },
  ],
  "ops-betrayal": [
    { type: "ContractAccepted", field: "contract", value: "contract-71" },
    { type: "ContractCancelled", field: "contract", value: "contract-71" },
    { type: "ContractAccepted", field: "contract", value: "contract-74" },
    { type: "Betrayed", field: "contract", value: "contract-71" },
  ],
  "ops-leak": [
    { type: "MechLoaned", field: "model", value: "base:model/union-fr7" },
    { type: "TechLeaked", field: "model", value: "base:model/union-fr7" },
  ],
};
function containsInOrder(log: CampaignEvent[], steps: Step[]): boolean {
  let next = 0;
  for (const event of log.filter(e => warOnly.has(e.type))) {
    const step = steps[next];
    if (step && event.type === step.type && (!step.field || String(event.payload[step.field]) === step.value)) next++;
  }
  return next === steps.length;
}
for (const [name, sequence] of Object.entries(sequences)) test(`黃金戰役 ${name}`, () => {
  const path = `${import.meta.dirname}/${name}`;
  const input = JSON.parse(readFileSync(`${path}.json`, "utf8")) as Golden;
  const { ctx } = fixture(input.seed);
  let state = input.setup ? newCampaign(ctx.db, ctx.world, `start/${input.start}`, input.seed) :
    replayCampaign(ctx.db, ctx.world, input.start, input.seed, input.commands);
  if (input.setup) {
    for (const [id, patch] of Object.entries(input.setup.rifts ?? {})) Object.assign(state.rifts[id]!, patch);
    for (const [id, patch] of Object.entries(input.setup.factions ?? {})) state.factions[id]!.rep = patch.rep;
    if (input.setup.ship) state.ship.pos = structuredClone(input.setup.ship.pos);
    if (input.setup.loan) {
      const { id, contract, model, issuer } = input.setup.loan;
      const definition = ctx.world.require("model", model);
      assert.equal(definition.exportPolicy, "restricted");
      assert.equal(ctx.world.require("faction-ops", issuer).faction, definition.maker);
      const mech = { ...instantiateMech(ctx.db, id, definition.frame), owner: "faction" as const, loaned: contract };
      const bay = state.hangar.bays.indexOf(null);
      assert(bay >= 0, "借機需要空機庫格");
      state.mechs[id] = mech;
      state.hangar.bays[bay] = id;
      state.inventory.mechs.push(id);
      const template = ctx.world.require("contract", "contract/op-join-arsenal");
      const loanHp = Object.values(mech.parts).reduce((n, part) => n + part.layers.reduce((sum, layer) => sum + layer.hp, 0), 0);
      const record: ContractState = { id: contract, template: template.id, issuer, loans: [id], target: { place: placeAt(state, ctx, state.ship.pos)! },
        status: "active", terms: { total: 0, advance: 0, perHead: 0 }, paidAdvance: true, heads: {}, offeredDay: state.clock.day,
        deadlineDay: state.clock.day + 45, stageIdx: 0, annoyance: 0,
        merc: { terms: { ...structuredClone(template.join!), loan: { models: [model], max: 1 } }, initialEnemy: 0,
          playerHeads: 0, enemyPower: 0, battles: 0, attachedLoss: 0, loans: { [id]: { model, hp: loanHp } } } };
      state.contracts[contract] = record;
      createOpsCtx(state, ctx.db, ctx.world).emit("MechLoaned", { contract, mech: id, model });
      const market = ctx.world.require("market", "market/war-armory");
      assert(!marketListings(state, createOpsCtx(state, ctx.db, ctx.world), market).some(l => l.item.model === model));
    }
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
    assert(state.contracts["contract-67"]?.merc?.attachedLoss && state.contracts["contract-67"]!.merc!.attachedLoss > 0);
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
