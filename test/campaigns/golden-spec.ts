// 黃金戰役共用：輸入格式、事件子序列、setup 起點。campaigns.test.ts 驗證、rerecord.ts 重錄都從這裡讀。
import assert from "node:assert/strict";
import type { Loc } from "../../src/ops/war/types.ts";
import { placeAt } from "../../src/ops/war/loc.ts";
import type { CampaignEvent, CampaignState, ContractState, OpsCtx, RiftState } from "../../src/ops/state/types.ts";
import type { CampaignCommand } from "../../src/ops/sim/campaign.ts";
import { createOpsCtx, newCampaign } from "../../src/ops/content/start.ts";
import { instantiateMech } from "../../src/ops/content/instantiate.ts";
import { marketListings } from "../../src/ops/world/market.ts";

export type Golden = { start: string; seed: number; commands: CampaignCommand[];
  setup?: { rifts?: Record<string, Pick<RiftState, "width" | "anchorAge">>; factions?: Record<string, { rep: number }>; ship?: { pos: Loc };
    loan?: { id: string; contract: string; model: string; issuer: string } } };
export type Step = { type: string; field?: string; value?: string };
export const warOnly = new Set(["OperationStarted", "OperationEngaged", "OperationResolved", "RiftPhase", "ShellSeized", "LineageOpened", "ModelReleased",
  "ContractAccepted", "ContractCancelled", "Arrived", "BattleResolved", "JoinSettled", "Betrayed", "MechLoaned", "TechLeaked"]);
export const sequences: Record<string, Step[]> = {
  "ops-war-assault": [
    { type: "OperationStarted", field: "kind", value: "assault" },
    { type: "OperationEngaged", field: "operation", value: "operation-1" },
    { type: "OperationEngaged", field: "operation", value: "operation-1" },
    { type: "RiftPhase", field: "to", value: "unanchored" },
    { type: "OperationResolved", field: "operation", value: "operation-1" },
  ],
  "ops-relic": [
    { type: "OperationStarted", field: "kind", value: "relic-hunt" },
    { type: "ShellSeized", field: "shell", value: "shell/old-array" },
    { type: "LineageOpened", field: "lineage", value: "base:lineage/old-array" },
    { type: "ModelReleased", field: "model", value: "base:model/old-array-ii" },
  ],
  "ops-merc-join": [
    { type: "ContractAccepted", field: "contract", value: "contract-128" },
    { type: "Arrived", field: "place", value: "base:place/ridge" },
    { type: "BattleResolved", field: "operation", value: "operation-5" },
    { type: "OperationResolved", field: "operation", value: "operation-5" },
    { type: "JoinSettled", field: "contract", value: "contract-128" },
  ],
  "ops-betrayal": [
    { type: "ContractAccepted", field: "contract", value: "contract-66" },
    { type: "ContractCancelled", field: "contract", value: "contract-66" },
    { type: "ContractAccepted", field: "contract", value: "contract-62" },
    { type: "Betrayed", field: "contract", value: "contract-66" },
  ],
  "ops-leak": [
    { type: "MechLoaned", field: "model", value: "base:model/union-fr7" },
    { type: "TechLeaked", field: "model", value: "base:model/union-fr7" },
  ],
};
export function containsInOrder(log: CampaignEvent[], steps: Step[]): boolean {
  let next = 0;
  for (const event of log.filter(e => warOnly.has(e.type))) {
    const step = steps[next];
    if (step && event.type === step.type && (!step.field || String(event.payload[step.field]) === step.value)) next++;
  }
  return next === steps.length;
}
// 有 setup 的戰役從改過的新戰役起跑（指令不帶戰鬥紀錄）；沒有 setup 的走 replayCampaign。
export function setupState(ctx: OpsCtx, input: Golden): CampaignState {
  const state = newCampaign(ctx.db, ctx.world, `start/${input.start}`, input.seed);
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
  }
  return state;
}
