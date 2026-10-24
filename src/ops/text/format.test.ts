import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./parse.ts";
import { formatCommand } from "./format.ts";
import { examples, fixture } from "./fixtures.ts";
import type { OpsCommand } from "../state/types.ts";

test("format：28 動詞與選填參數可 parse 回同一指令", () => {
  const { state, world } = fixture();
  const optional: OpsCommand[] = [{ v: "look" }, { v: "talk", who: "person-1", topic: '含 空白與"引號"' }, { v: "board" },
    { v: "sail", to: "base:place/dhaka", via: [] }, { v: "sortie", sortie: {} }, { v: "assign", person: "person-1" },
    { v: "trade", market: "base:market/dhaka", buy: [], sell: [] }, { v: "help" }, { v: "explore", ruin: "base:place/old-array", party: [] }];
  for (const cmd of [...examples.map(e => e.cmd), ...optional]) assert.deepEqual(parse(formatCommand(cmd, state, world), state, world), cmd);
});

test("sail 三型與 via：parse(formatCommand()) 往返一致", () => {
  const { state, world } = fixture();
  const commands: OpsCommand[] = [
    { v: "sail", to: "base:place/dhaka" },
    { v: "sail", to: { x: 120, y: 44 } },
    { v: "sail", to: { actor: "鹽鷗" } },
    { v: "sail", to: "base:place/selene-city", via: ["base:place/singapore", { x: 120, y: 44 }] },
  ];
  for (const cmd of commands) assert.deepEqual(parse(formatCommand(cmd, state, world), state, world), cmd);
  assert.deepEqual(parse("航 120,44", state, world), commands[1]);
  assert.deepEqual(parse("航 @鹽鷗", state, world), commands[2]);
});
