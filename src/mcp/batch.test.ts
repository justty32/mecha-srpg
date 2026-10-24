import test from "node:test";
import assert from "node:assert/strict";
import { createContentDB } from "../content/contentdb.ts";
import { CONTENT_KINDS } from "../core/ids.ts";
import { createEnv } from "./tool.ts";
import { createBattleTools } from "./battle.ts";
import { createServer } from "./protocol.ts";

const scenario = "scenario/skirmish-whitegloves";
function setup(metadata?: boolean) {
  const env = createEnv();
  if (metadata !== undefined) {
    const db = env.battleDb();
    const defs = Object.fromEntries(CONTENT_KINDS.map(kind => [kind, Object.fromEntries(db.all(kind).map(d => [d.id, structuredClone(d)]))])) as Parameters<typeof createContentDB>[3];
    const def = defs.scenario![db.require("scenario", scenario).id]!;
    if (metadata) { def.name = "批次測試情境"; def.brief = "測試精簡戰況與情境文字。"; }
    else { delete def.name; delete def.brief; }
    const fixtureDb = createContentDB([...db.packs], db.registries, db.rules, defs);
    env.battleDb = () => fixtureDb;
  }
  const server = createServer({ tools: createBattleTools(env), name: "batch", version: "1" });
  const call = async (name: string, args: object = {}) => {
    const reply = JSON.parse((await server.handle(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } })))!);
    assert.ok(!reply.error && !reply.result.isError, JSON.stringify(reply));
    return reply.result.structuredContent as Record<string, any>;
  };
  return { env, call };
}

test("批次拒絕即停保留前步；stopOnReject=false 繼續下一步", async () => {
  const { call } = setup(), initial = await call("battle_new", { scenario, seed: 1, autoAdvance: false }), id = initial.id;
  const legal = await call("battle_legal_actions", { id });
  const [x, y] = legal.moves[0].split(":")[0].split(",").map(Number);
  const bad = { kind: "move", to: { x: 9999, y: 9999 } };
  const result = await call("battle_act_many", { id, actions: [{ kind: "move", to: { x, y } }, bad, { kind: "end" }] });
  assert.deepEqual(result.results.map((r: any) => r.ok), [true, false]);
  assert.match(result.results[1].reason, /超出地圖/);
  assert.equal(result.stopped, "rejected"); assert.equal(result.remaining, 1);
  assert.notEqual(result.hash, initial.hash); assert.equal(result.current.id, initial.current.id);
  const next = await call("battle_act_many", { id, stopOnReject: false, actions: [bad, { kind: "end" }] });
  assert.deepEqual(next.results.map((r: any) => r.ok), [false, true]);
  assert.notEqual(next.current?.id, initial.current.id);
});

test("批次 observe 與 battle_observe 相同，情境 name／brief 有則顯示、無則省略", async () => {
  const { env, call } = setup(true), def = env.battleDb().require("scenario", scenario);
  const listed = (await call("battle_list_scenarios")).scenarios.find((s: any) => s.id === def.id);
  assert.equal(listed.name, def.name); assert.equal(listed.brief, def.brief);
  const initial = await call("battle_new", { scenario, seed: 1 }), id = initial.id;
  assert.equal(initial.name, def.name); assert.equal(initial.brief, def.brief);
  const result = await call("battle_act_many", { id, actions: [{ kind: "end" }], observe: true });
  assert.deepEqual(result.observation, await call("battle_observe", { id }));
  assert.ok(result.eventLines > 0); assert.ok(Array.isArray(result.aiEvents));
  const plainCall = setup(false).call;
  const plain = await plainCall("battle_new", { scenario, seed: 1 });
  assert.ok(!("name" in plain)); assert.ok(!("brief" in plain));
  assert.ok(!("observation" in await plainCall("battle_act_many", { id: plain.id, actions: [] })));
});

test("all 列本輪玩家單位、限制輸出且不推進狀態；已結束及觀戰單位排除", async () => {
  const { call } = setup(), initial = await call("battle_new", { scenario, seed: 1, autoAdvance: false }), id = initial.id;
  const full = await call("battle_legal_actions", { id });
  const all = await call("battle_legal_actions", { id, unit: "all", maxMoves: 1, maxTargets: 1 });
  assert.ok(all.units.length > 1);
  assert.ok(all.units.every((u: any) => u.actor.startsWith("player-") && u.moves.length <= 1 && u.abilities.every((a: any) => a.targets.length <= 1)));
  const current = all.units.find((u: any) => u.playerTurn);
  assert.equal(current.actor, initial.current.id);
  assert.deepEqual(current.moves, full.moves.slice(0, 1));
  assert.equal(current.movesOmitted, full.moves.length - 1);
  assert.ok(all.units.filter((u: any) => !u.playerTurn).every((u: any) => !u.moves.length && !u.options.length));
  assert.equal((await call("battle_observe", { id })).hash, initial.hash);
  await call("battle_act", { id, action: { kind: "end" } });
  assert.ok(!(await call("battle_legal_actions", { id, unit: "all" })).units.some((u: any) => u.actor === initial.current.id));
  const watched = await call("battle_new", { scenario, seed: 1, spectate: true, autoAdvance: false });
  assert.deepEqual((await call("battle_legal_actions", { id: watched.id, unit: "all" })).units, []);
});

test("批次到 AI／戰鬥結束即停；until=player 推進到人類且遵守 max", async () => {
  const { call } = setup(), initial = await call("battle_new", { scenario, seed: 1, autoAdvance: false }), id = initial.id;
  const ended = await call("battle_act_many", { id, actions: Array.from({ length: 20 }, () => ({ kind: "end" })) });
  assert.equal(ended.stopped, "not-player"); assert.ok(ended.remaining > 0);
  assert.equal(ended.current.playerTurn, false); assert.equal(ended.aiCommands, 0);
  const capped = await call("battle_step_ai", { id, until: "player", max: 1 });
  assert.ok(capped.commands <= 1);
  const stepped = await call("battle_step_ai", { id, until: "player" });
  assert.ok(stepped.current?.playerTurn || stepped.outcome);
  const again = await call("battle_step_ai", { id, until: "player" });
  assert.equal(again.commands, 0); assert.equal(again.hash, stepped.hash);
  const auto = await call("battle_new", { scenario, seed: 1, rounds: 1 });
  const batch = await call("battle_act_many", { id: auto.id, actions: Array.from({ length: 20 }, () => ({ kind: "end" })), observe: true });
  assert.ok(batch.remaining > 0); assert.ok(batch.aiCommands > 0);
  let final = batch;
  for (let guard = 0; guard < 10 && !final.outcome; guard++) final = await call("battle_act_many", { id: auto.id, actions: Array.from({ length: 20 }, () => ({ kind: "end" })) });
  assert.ok(final.outcome);
  assert.ok(batch.aiEvents.length > 0);
  const over = await call("battle_act_many", { id: auto.id, actions: [{ kind: "end" }] });
  assert.equal(over.stopped, "battle-over"); assert.deepEqual(over.results, []);
});
