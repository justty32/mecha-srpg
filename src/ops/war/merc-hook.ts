import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { OperationState } from "./types.ts";
export function onMuster(_s: CampaignState, _ctx: OpsCtx, _op: OperationState): void {}
export function playerEngages(_s: CampaignState, _ctx: OpsCtx, _op: OperationState): boolean { return false; }
export function onOperationEnd(_s: CampaignState, _ctx: OpsCtx, _op: OperationState): void {}
