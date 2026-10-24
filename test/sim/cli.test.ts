import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { hashLog } from "../../src/core/eventlog.ts";
import type { EventLog } from "../../src/core/events.ts";
import { main } from "../../src/sim/cli.ts";
import { parseSave } from "../../src/sim/save.ts";

const args = ["--scenario", "scenario/skirmish-whitegloves", "--seed", "1", "--rounds", "3"];
const dir = "/tmp/cx-sim-engine/cli-tests";

test("CLI：回 0 並印勝負、輪數、存活、事件與 hash", () => {
  const lines: string[] = [];
  assert.equal(main([...args, "--ai-vs-ai"], line => lines.push(line)), 0);
  for (const prefix of ["勝負:", "輪數: 3", "存活 player:", "存活 enemy:", "事件:"]) assert.ok(lines.some(line => line.startsWith(prefix)));
  assert.ok(lines.some(line => /^hash: [0-9a-f]{16}$/.test(line)));
});

test("CLI：--out 寫出可 parse 的事件日誌", () => {
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/events.json`, lines: string[] = [];
  assert.equal(main([...args, "--out", path], line => lines.push(line)), 0);
  const log = JSON.parse(readFileSync(path, "utf8")) as EventLog;
  assert.ok(log.events.length > 0);
  assert.ok(log.events.some(event => event.type === "BattleEnd"));
  assert.ok(lines.includes(`hash: ${hashLog(log)}`));
});

test("CLI：--save 後 --load 重播得到同一 hash", () => {
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/save.json`, before: string[] = [], after: string[] = [];
  assert.equal(main([...args, "--save", path], line => before.push(line)), 0);
  const save = parseSave(readFileSync(path, "utf8"));
  assert.equal(save.snapshot, undefined);
  assert.ok(save.commands.length > 0);
  assert.equal(main(["--load", path], line => after.push(line)), 0);
  assert.equal(after.find(line => line.startsWith("hash:")), before.find(line => line.startsWith("hash:")));
});
