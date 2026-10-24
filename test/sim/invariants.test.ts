import test from "node:test";
import assert from "node:assert/strict";
import { CONTENT_KINDS } from "../../src/core/ids.ts";
import type { BattleState } from "../../src/core/types-state.ts";
import { hashLog } from "../../src/core/eventlog.ts";
import { poolDecls } from "../../src/rules/index.ts";
import { replay } from "../../src/sim/replay.ts";
import { db, trajectories } from "./helpers.ts";

test("不變量：20 seeds 每條指令後 hard 池皆在 [min,max]", () => {
  let checked = 0;
  for (const run of trajectories()) for (const s of run.states) {
    const owners = [...Object.keys(s.units).sort().map(unit => ({ unit })), ...Object.keys(s.persons).sort().map(person => ({ person }))];
    for (const owner of owners) {
      const state = "unit" in owner ? s.units[owner.unit]! : s.persons[owner.person]!;
      const declarations = poolDecls({ db, s }, owner);
      const fallback = "unit" in owner ? Object.values(s.units[owner.unit]!.parts).flatMap(part =>
        Object.values(part.components).flatMap(id => id ? db.require("component", id).pools : [])) : [];
      for (const [id, pool] of Object.entries(state.pools)) {
        const decl = declarations.find(d => d.id === id) ?? fallback.find(d => d.id === id);
        assert.ok(decl, `找不到 ${id} 宣告`);
        if (decl.capKind !== "hard") continue;
        checked++;
        assert.ok(pool.cur >= decl.min && pool.cur <= pool.max, `seed ${run.seed} ${state.id}.${id}=${pool.cur}, [${decl.min},${pool.max}]`);
      }
    }
  }
  assert.ok(checked > 0);
});

test("不變量：20 seeds 每條指令後 broken 層 hp 為零", () => {
  let broken = 0;
  for (const run of trajectories()) for (const s of run.states) for (const unit of Object.values(s.units)) {
    for (const part of Object.values(unit.parts)) for (const layer of part.layers) if (layer.broken) {
      broken++;
      assert.equal(layer.hp, 0, `seed ${run.seed} ${unit.id}`);
    }
  }
  assert.ok(broken > 0, "隨機軌跡必須實際打壞過層");
});

test("不變量：20 seeds 每條指令後 contrib source 都存在", () => {
  const definitions = new Set(CONTENT_KINDS.flatMap(kind => db.ids(kind)));
  let checked = 0;
  const check = (s: BattleState): void => {
    const containers = [...Object.values(s.units), ...Object.values(s.persons)];
    const effects = [...containers.flatMap(owner => owner.effects), ...s.pending, ...(s.rt?.fieldEffects ?? [])];
    const sources = new Set([...definitions, ...Object.keys(s.units), ...Object.keys(s.persons), ...effects.map(effect => `fx:${effect.uid}`),
      ...Object.values(s.units).flatMap(unit => unit.sustained.map(ability => `sustain:${unit.id}:${ability}`))]);
    for (const owner of containers) for (const contribution of owner.contribs) {
      checked++;
      assert.ok(sources.has(contribution.source), `不存在的 source：${contribution.source}`);
    }
  };
  for (const run of trajectories()) for (const s of run.states) check(s);
  assert.ok(checked > 0, "隨機軌跡必須產生貢獻");
  const corrupt = structuredClone(trajectories()[0]!.states[0]!);
  Object.values(corrupt.units)[0]!.contribs.push({ id: "bad", source: "nonexistent", path: "self.attrs.initiative", op: "add", value: 1 });
  assert.throws(() => check(corrupt), /不存在的 source/);
});

test("不變量：20 seeds 每條指令後事件 seq 連續", () => {
  for (const run of trajectories()) for (const s of run.states) {
    assert.ok(s.log.events.length > 0);
    s.log.events.forEach((event, index) => assert.equal(event.seq, index, `seed ${run.seed}`));
  }
});

test("不變量：20 seeds 整局重播一致", () => {
  const started = Date.now();
  for (const run of trajectories()) {
    const actual = replay(db, run.setup, run.seed, run.commands), expected = run.states.at(-1)!;
    assert.equal(hashLog(actual.log), hashLog(expected.log), `seed ${run.seed}`);
    assert.deepEqual(actual, expected);
  }
  assert.ok(Date.now() - started < 30000, "不變量重播超過 30 秒");
});
