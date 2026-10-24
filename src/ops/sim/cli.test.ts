import test from "node:test";
import assert from "node:assert/strict";
import { main } from "./cli.ts";
test("CLI idle 兩蝕月回傳 0", () => {
  assert.equal(main(["--months", "2", "--policy", "idle", "--seed", "1"]), 0);
});
