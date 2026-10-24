import { test } from "node:test";
import assert from "node:assert/strict";
import { newCampaign } from "../content/start.ts";
import { fixture } from "./fixtures.ts";
import { parse, render, formatCommand } from "./index.ts";

test("render：newCampaign 開局 Screen 完整、可 JSON 化且無副作用", () => {
  const { db, world } = fixture(), state = newCampaign(db, world, "start/default", 7), before = structuredClone(state);
  const screen = render(state, state.log, world, db);
  assert.equal(screen.room.id, "bridge"); assert.ok(screen.room.title); assert.ok(screen.room.desc.length); assert.ok(screen.room.exits.length);
  assert.equal(screen.log.length, state.log.length); assert.equal(screen.panels.ledger?.length, 4); assert.equal(screen.panels.roster?.length, 7);
  assert.ok(Array.isArray(screen.panels.rifts)); assert.ok(Array.isArray(screen.panels.queue)); assert.ok(screen.actions.length);
  assert.deepEqual(JSON.parse(JSON.stringify(screen)), screen); assert.deepEqual(state, before);
});
test("render：每個 action 都可 format→parse 恆等，prompt 使用第一筆並禁用不符條件選項", () => {
  const { state, db, world } = fixture();
  state.restraint.beasts["mech-8"] = { mech: "mech-8", kind: "live", wear: 60, vitality: 100, bond: {} };
  for (const room of ["bridge", "hangar", "restraint", "galley", "medbay", "cargo"]) {
    state.text!.room = room;
    for (const action of render(state, [], world, db).actions) assert.deepEqual(parse(formatCommand(action.cmd, state, world), state, world), action.cmd);
  }
  state.pendingChoices.push({ text: "先選這個", choices: [{ text: "可以", effects: [] }, { text: "還不行", requires: { tag: "locked-choice" }, effects: [] }] }, { text: "下一個", choices: [] });
  const screen = render(state, [], world, db);
  assert.equal(screen.prompt?.text, "先選這個"); assert.ok(screen.prompt?.choices[1]?.disabled);
  assert.ok(!screen.actions.some(a => a.cmd.v === "choose" && a.cmd.choice === 2));
  assert.ok(!screen.actions.some(a => a.cmd.v === "wait"));
  for (const action of screen.actions) assert.deepEqual(parse(formatCommand(action.cmd, state, world), state, world), action.cmd);
});
