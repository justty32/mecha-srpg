import type { ContentDB } from "../../content/contentdb.ts";
import type { Cond } from "../../core/types-def.ts";
import type { CampaignState, RoomDef, Screen } from "../state/types.ts";
import { evalOpsCond } from "../content/cond.ts";
import type { WorldDB } from "../content/worlddb.ts";
import type { TextState } from "./parse.ts";
import { interpolate } from "./templates.ts";

// SPEC-GAP：RoomDef 沒有開放條件；由目的房間的 requires 決定出口是否顯示。
export type TextRoomDef = RoomDef & { requires?: Cond };
export function roomDefinition(id: string, world: WorldDB): TextRoomDef | undefined {
  return world.get("room", id.includes("/") ? id : `room/${id}`);
}
export function roomAvailable(id: string, state: CampaignState, world: WorldDB, db: ContentDB): boolean {
  const room = roomDefinition(id, world);
  return !!room && (!room.requires || evalOpsCond(state, { world, db }, room.requires,
    { tags: state.stable.myceliumRoom ? ["mycelium-room"] : [] }));
}
export function describeRoom(id: string, state: CampaignState, world: WorldDB, db: ContentDB): Screen["room"] {
  const room = roomDefinition(id, world);
  if (!room || !roomAvailable(id, state, world, db)) return { id, title: "未開放的房間", desc: ["門尚未開放。"], exits: [] };
  const values = { campaign: state, ship: state.ship, stable: state.stable, ledger: state.ledger, flags: state.flags, calendar: state.clock };
  return { id: room.id.split("/").at(-1)!, title: room.title,
    desc: [...room.base, ...room.phrases.filter(p => evalOpsCond(state, { world, db }, p.when)).map(p => p.text)].map(t => interpolate(t, values)),
    exits: room.exits.filter(exit => roomAvailable(exit, state, world, db)).map(exit => roomDefinition(exit, world)!.id.split("/").at(-1)!) };
}
export function currentRoom(state: TextState): string { return state.text?.room ?? "bridge"; }
