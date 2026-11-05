import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "./parse.ts";
import { VERBS } from "./verbs.ts";
import { formatCommand } from "./format.ts";
import { examples, fixture } from "./fixtures.ts";
import type { OpsCommand } from "../state/types.ts";

test("parse：動詞中文逐一產生預期指令且不改 state", () => {
  const { state, world } = fixture(), before = structuredClone(state);
  for (const e of examples) assert.deepEqual(parse(e.zh, state, world), e.cmd, e.zh);
  assert.deepEqual(state, before);
  for (const bad of ["等 -1", "等 1.5", "圖 多餘", '出戰 {"day":"bad"}', "排 repair", '談 "未結束']) assert.ok("error" in parse(bad, state, world), bad);
});
test("parse：ASCII 別名逐一成功；全部動詞與選填參數 formatCommand 後可 parse 回同一指令", () => {
  const { state, world } = fixture();
  for (const e of examples) assert.deepEqual(parse(e.zh.replace(/^\S+/, e.cmd.v), state, world), e.cmd);
  const optional: OpsCommand[] = [{ v: "look" }, { v: "talk", who: "person-1", topic: '含 空白與"引號"' }, { v: "board" },
    { v: "sail", to: "base:place/dhaka", via: [] }, { v: "sortie", sortie: {} }, { v: "assign", person: "person-1" },
    { v: "trade", market: "base:market/dhaka", buy: [], sell: [] }, { v: "help" }, { v: "explore", ruin: "base:place/old-array", party: [] }];
  for (const cmd of [...examples.map(e => e.cmd), ...optional]) assert.deepEqual(parse(formatCommand(cmd, state, world), state, world), cmd);
});
test("parse：唯一前綴名稱可接受", () => {
  const { state, world } = fixture();
  assert.deepEqual(parse("走 機", state, world), { v: "go", room: "hangar" });
  assert.deepEqual(parse("談 阿九", state, world), { v: "talk", who: "person-1" });
});
test("parse：多義前綴回傳候選", () => {
  const { state, world } = fixture(), result = parse("看 犬", state, world);
  assert.ok("error" in result);
  assert.match(result.error, /你是指：/);
  assert.deepEqual(result.candidates, ["mech-8", "mech-9"]);
});
test("parse：未知動詞列出全部合法動詞", () => {
  const { state, world } = fixture(), result = parse("跳舞", state, world);
  assert.ok("error" in result);
  for (const entry of VERBS) { assert.ok(result.error.includes(entry.zh)); assert.ok(result.error.includes(entry.v)); }
});
