import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./parse.ts";
import { formatCommand } from "./format.ts";
import { fixture } from "./fixtures.ts";
import type { OpsCommand } from "../state/types.ts";

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
