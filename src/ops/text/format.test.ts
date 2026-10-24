import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./parse.ts";
import { formatCommand } from "./format.ts";
import { examples, fixture } from "./fixtures.ts";
import type { OpsCommand } from "../state/types.ts";

test("format：27 動詞與選填參數可 parse 回同一指令", () => {
  const { state, world } = fixture();
  const optional: OpsCommand[] = [{ v: "look" }, { v: "talk", who: "person-1", topic: '含 空白與"引號"' }, { v: "board" },
    { v: "sail", to: "base:node/dhaka", via: [] }, { v: "sortie", sortie: {} }, { v: "assign", person: "person-1" },
    { v: "trade", market: "base:market/dhaka", buy: [], sell: [] }, { v: "help" }, { v: "explore", ruin: "base:node/old-array", party: [] }];
  for (const cmd of [...examples.map(e => e.cmd), ...optional]) assert.deepEqual(parse(formatCommand(cmd, state, world), state, world), cmd);
});
