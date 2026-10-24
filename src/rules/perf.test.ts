import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../content/loader.ts";
import { cloneBattleState } from "../core/clone-state.ts";
import { appendEvent } from "../core/eventlog.ts";
import { cellKey } from "../core/ids.ts";
import { createRng } from "../core/rng.ts";
import { createRulesQuery } from "../ai/adapters/rules-adapter.ts";
import { createAgent, emptyKnowledge, registerPolicy, takeTurn, updateKnowledge } from "../ai/index.ts";
import { createStubRules, makeStubBattle } from "../../test/ai/stub-rules.ts";
import { createBattle, killPerson, recoverBerserk, reachable, rt, stepCost } from "./index.ts";

const { db } = loadContentDirs(["content/base"]);
function state() {
  return createBattle(db, {
    id: "perf-regression", map: { width: 7, height: 5, fill: "terrain/plain", exits: [] }, objectives: [],
    units: [
      { id: "a", owner: "blue", frame: "frame/hound-mk2", pos: { x: 1, y: 2 },
        persons: [{ id: "pilot", def: "person/ren-kasai", seat: "pilot" }] },
      { id: "b", owner: "red", monster: { species: "species/tidewolf", grade: "D" }, pos: { x: 3, y: 2 } },
    ],
  }, 1);
}

test("狀態複製保留完整資料且預覽修改不會滲回原狀態", () => {
  const s = state();
  s.persons.pilot!.pools.ap!.max = Infinity;
  appendEvent(s.log, { round: 1, type: "Moved", payload: { from: [1, 2], to: [2, 2] } });
  const before = structuredClone(s), copy = cloneBattleState(s);
  assert.deepEqual(copy, before);
  copy.units.a!.pos.x++;
  copy.persons.pilot!.pools.ap!.cur--;
  (copy.log.events[0]!.payload.from as number[])[0] = 99;
  copy.log.events[0]!.type = "Changed";
  appendEvent(copy.log, { round: 2, type: "Extra" });
  assert.deepEqual(s, before);
});

test("預測歷史保留死亡去重與失控恢復，新增事件內容和序號不變", () => {
  const s = state();
  appendEvent(s.log, { round: 1, type: "PersonDied", payload: { person: "pilot", unit: "a" } });
  appendEvent(s.log, { round: 1, type: "ControlChanged", payload: { unit: "a", from: "pilot", to: "berserk" } });
  appendEvent(s.log, { round: 2, type: "Moved", payload: { unit: "a", to: [1, 2] } });
  appendEvent(s.log, { round: 2, type: "ControlChanged", payload: { unit: "a", from: "instinct", to: "berserk" } });
  s.units.a!.controlMode = "berserk";
  rt(s).berserkFrom.a = "blue";
  const full = cloneBattleState(s), compact = createRulesQuery(db).predictionState!(s);
  assert.equal(compact.log.events.length, 3);
  const fullStart = full.log.events.length, compactStart = compact.log.events.length;
  for (const copy of [full, compact]) {
    killPerson({ db, s: copy }, "pilot", "a");
    recoverBerserk({ db, s: copy }, "a");
    assert.equal(copy.units.a!.controlMode, "instinct");
    assert.equal(copy.persons.pilot!.seat?.mech, "a");
  }
  assert.deepEqual(compact.log.events.slice(compactStart), full.log.events.slice(fullStart));
  assert.deepEqual({ ...compact, log: null }, { ...full, log: null });
  const again = createRulesQuery(db).predictionState!(compact);
  assert.equal(appendEvent(again.log, { round: 3, type: "Extra" }).seq, full.log.events.length);
});

test("堆積搜尋與原排序搜尋的成本及格子順序相同", () => {
  const terrains = db.all("terrain").map(t => t.id);
  for (const ap of [0, 2, 7, 12]) for (const status of ["active", "derelict", "dead"] as const) {
    const s = state(), ctx = { db, s };
    s.persons.pilot!.pools.ap!.cur = ap;
    rt(s).unitStatus.b = status;
    s.map.terrain = s.map.terrain.map((_, i) => terrains[(i * 3 + ap) % terrains.length]!);
    const start = s.units.a!.pos, result: Record<string, number> = { [cellKey(start.x, start.y)]: 0 };
    const queue = [{ cell: start, cost: 0 }];
    while (queue.length) {
      queue.sort((a, b) => a.cost - b.cost || a.cell.y - b.cell.y || a.cell.x - b.cell.x);
      const current = queue.shift()!;
      if (current.cost !== result[cellKey(current.cell.x, current.cell.y)]) continue;
      for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
        const next = { x: current.cell.x + x, y: current.cell.y + y };
        const cost = stepCost(ctx, "a", current.cell, next);
        if (cost === null) continue;
        const total = current.cost + cost, key = cellKey(next.x, next.y);
        if (total > ap || total >= (result[key] ?? Infinity)) continue;
        result[key] = total; queue.push({ cell: next, cost: total });
      }
    }
    assert.deepEqual(Object.entries(reachable(ctx, "a")), Object.entries(result));
  }
});

test("快照的 reachable 與 pathTo 一致，普通查詢與新快照讀到最新 AP", () => {
  const s = state(), q = createRulesQuery(db), snapshot = q.forSnapshot!(s);
  const cells = snapshot.reachable(s, "a"), before = { ...cells };
  for (const key of Object.keys(cells)) {
    const [x, y] = key.split(",").map(Number);
    assert.deepEqual(snapshot.pathTo(s, "a", { x: x!, y: y! }), q.pathTo(s, "a", { x: x!, y: y! }));
    cells[key] = -1;
  }
  assert.deepEqual(snapshot.reachable(s, "a"), before);
  s.persons.pilot!.pools.ap!.cur = 0;
  assert.deepEqual(q.reachable(s, "a"), {});
  assert.deepEqual(q.forSnapshot!(s).reachable(s, "a"), {});
  assert.deepEqual(snapshot.reachable(cloneBattleState(s), "a"), {});
});

test("AI 成功移動與遭拒之後都重建決策快照", () => {
  const { q, exec } = createStubRules();
  const s = makeStubBattle({ width: 6, height: 3, units: [
    { id: "a", owner: "blue", pos: { x: 0, y: 1 }, abilities: [], ap: 8 },
  ] }, 31);
  const seen: number[] = [];
  registerPolicy({ id: "perf-refresh", band: 1,
    propose: (_ctx, agent) => [
      { move: { x: 1, y: 1 }, cmd: { kind: "eject", actor: agent.unit } },
      { cmd: { kind: "end", actor: agent.unit } },
    ],
    score: (ctx, _agent, candidate) => {
      seen.push(ctx.view.units.a!.pos.x);
      return candidate.cmd.kind === "eject" ? 2 : 1;
    },
  });
  const commands = takeTurn({ q, exec, s, slot: "blue", know: updateKnowledge(q, s, "blue", emptyKnowledge()),
    assignment: null, params: {}, rng: createRng(31, 101) }, createAgent("a", "perf-refresh"));
  assert.deepEqual(commands.map(c => c.kind), ["move", "end"]);
  assert.deepEqual(seen, [0, 0, 1]);
});
