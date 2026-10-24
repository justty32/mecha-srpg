import test from "node:test";
import assert from "node:assert/strict";
import { runCli } from "./cli.ts";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createBattle, startBattle, poolDecls, partDefs, rt, currentActor } from "../../src/rules/index.ts";
import type { Ctx } from "../../src/rules/index.ts";
import { generate } from "./gen.ts";
import { boundedLegalActions } from "./drive.ts";
import { createSession } from "../../src/sim/session.ts";
import { aiDeterminism, aiLegal, contribValid, cooldowns, deadDontAct, deathConsistency, effectsValid, events,
  layerHp, legalEnum, newMemory, noThrow, poolBounds, positions, previewPure, replayHash, saveRoundtrip, seats, termination } from "./invariants.ts";
import { runBattle } from "../../src/sim/run.ts";
import type { Add } from "./invariants.ts";

const { db, errors } = loadContentDirs(["content/base"]);

test("fuzz 工具自我測試：正常前綴通過，竄改池／層／貢獻／事件／重播會變紅", () => {
  assert.deepEqual(errors, []);
  const sim = generate(db, 2218, "random"), state = createBattle(db, sim.setup, 2218);
  startBattle({ db, s: state });
  const check = (fn: (ctx: Ctx, add: Add) => void, corrupt: (ctx: Ctx) => void, name: string): void => {
    const clean: string[] = [], dirty: string[] = [];
    fn({ db, s: state }, invariant => clean.push(invariant));
    assert.deepEqual(clean, [], `${name} 正常狀態應通過`);
    const ctx = { db, s: structuredClone(state) };
    corrupt(ctx);
    fn(ctx, invariant => dirty.push(invariant));
    assert.ok(dirty.includes(name), `${name} 必須抓到竄改`);
  };
  check(poolBounds, ctx => {
    const owners = [...Object.keys(ctx.s.units).map(unit => ({ unit })), ...Object.keys(ctx.s.persons).map(person => ({ person }))];
    for (const owner of owners) {
      const container = "unit" in owner ? ctx.s.units[owner.unit]! : ctx.s.persons[owner.person]!;
      const decl = poolDecls(ctx, owner).find(d => d.capKind === "hard" && Number.isFinite(container.pools[d.id]?.max));
      if (decl) { container.pools[decl.id]!.cur = container.pools[decl.id]!.max + 1; return; }
    }
    assert.fail("測試前提：必須存在有限 hard 池");
  }, "pool-bounds");
  check(layerHp, ctx => {
    const layer = Object.values(Object.values(ctx.s.units)[0]!.parts)[0]!.layers[0]!;
    layer.broken = true; layer.hp = 5;
  }, "layer-hp");
  check(contribValid, ctx => {
    Object.values(ctx.s.units)[0]!.contribs.push({ id: "corrupt", source: "missing-source", path: "self.attrs.initiative", op: "add", value: 1 });
  }, "contrib-valid");
  check((ctx, add) => events(ctx, add, newMemory()), ctx => {
    assert.ok(ctx.s.log.events.length >= 2);
    ctx.s.log.events.splice(0, 1);
  }, "events");
  check((ctx, add) => replayHash(db, sim.setup, 2218, [], ctx.s, add), ctx => {
    ctx.s.log.events[0]!.payload.corrupt = 1;
  }, "replay-hash");
  // 日誌相同仍須檢查完整 state，不能只比 hash。
  check((ctx, add) => replayHash(db, sim.setup, 2218, [], ctx.s, add), ctx => {
    Object.values(ctx.s.units)[0]!.pos.x++;
  }, "replay-hash");
});

test("fuzz 工具自我測試：其餘具名檢查能拒絕對應壞輸入", () => {
  const sim = generate(db, 2218, "random"), state = createBattle(db, sim.setup, 2218);
  startBattle({ db, s: state });
  const check = (name: string, fn: (ctx: Ctx, add: Add) => void, corrupt: (ctx: Ctx) => void): void => {
    const clean: string[] = [], dirty: string[] = [];
    fn({ db, s: state }, n => clean.push(n));
    assert.deepEqual(clean, [], name);
    const ctx = { db, s: structuredClone(state) };
    corrupt(ctx); fn(ctx, n => dirty.push(n));
    assert.ok(dirty.includes(name), `${name} 必須變紅`);
  };
  check("death-consistency", deathConsistency, ctx => {
    const u = Object.values(ctx.s.units)[0]!;
    const cores = partDefs(ctx, u.id).filter(p => p.functions.includes("core"));
    assert.ok(cores.length);
    for (const p of cores) u.parts[p.id]!.broken = true;
    rt(ctx.s).unitStatus[u.id] = "active";
  });
  check("dead-dont-act", (ctx, add) => deadDontAct(ctx, add, newMemory()), ctx => {
    const id = Object.keys(ctx.s.units)[0]!;
    rt(ctx.s).active = id; rt(ctx.s).unitStatus[id] = "dead";
  });
  check("positions", positions, ctx => { Object.values(ctx.s.units)[0]!.pos.x = -1; });
  check("seats", seats, ctx => { Object.values(ctx.s.units)[0]!.seats.corrupt = "missing-person"; });
  check("effects-valid", effectsValid, ctx => {
    ctx.s.pending.push({ uid: 999, effect: db.ids("effect")[0]!, source: "test", scope: "mech", owner: { unit: "missing-unit" },
      remaining: -1, magnitude: 1, stacks: 0, contribIds: [] });
  });
  check("cooldowns", cooldowns, ctx => { Object.values(ctx.s.units)[0]!.cooldowns.corrupt = -1; });
  check("termination", termination, ctx => {
    rt(ctx.s).outcome = { winner: "missing-slot", reason: "test" };
    ctx.s.round = rt(ctx.s).maxRounds! + 1;
  });
  const thrown: string[] = [];
  assert.equal(noThrow(n => thrown.push(n), "test", () => 1)?.value, 1);
  assert.equal(noThrow(n => thrown.push(n), "test", () => { throw new Error("intentional"); }), undefined);
  assert.deepEqual(thrown, ["no-throw"]);
  const previewIssues: string[] = [], actor = currentActor(state)!;
  assert.ok(actor);
  previewPure({ db, s: state }, { kind: "end", actor }, () => ({ ok: true }), n => previewIssues.push(n));
  assert.equal(previewIssues.length, 0);
  previewPure({ db, s: state }, { kind: "end", actor }, () => ({ ok: false }), n => previewIssues.push(n));
  assert.deepEqual(previewIssues, ["preview-pure"]);
  const saved: string[] = [];
  saveRoundtrip(db, sim.setup, 2218, [], state, n => saved.push(n));
  assert.equal(saved.length, 0);
  const corrupt = structuredClone(state); corrupt.round++;
  assert.throws(() => saveRoundtrip(db, sim.setup, 2218, [], corrupt, n => saved.push(n)), /snapshot/);
  // 自我測試只需一條指令即可證明 hash 比對會接受／拒絕；完整戰鬥交快速版。
  const run = runBattle({ db, sim, seed: 2218, maxSteps: 1 }), ai: string[] = [];
  aiDeterminism(db, sim, 2218, run.hash, 1, n => ai.push(n));
  assert.equal(ai.length, 0);
  aiDeterminism(db, sim, 2218, "corrupt-hash", 1, n => ai.push(n));
  assert.deepEqual(ai, ["ai-determinism"]);
  const warnings: string[] = [];
  aiLegal(0, n => warnings.push(n)); assert.equal(warnings.length, 0);
  aiLegal(1, (n, _message, warning) => { assert.equal(warning, true); warnings.push(n); });
  assert.deepEqual(warnings, ["ai-rejected"]);
  const session = createSession({ db, sim, seed: 2218, human: Object.keys(sim.slotProfiles) });
  const bounded = boundedLegalActions(session), full = session.legalActions(), enumerations: string[] = [];
  legalEnum(bounded, full, n => enumerations.push(n));
  assert.equal(enumerations.length, 0);
  const corruptEnum = structuredClone(bounded);
  corruptEnum.reachable["-1,-1"] = 1;
  legalEnum(corruptEnum, full, n => enumerations.push(n));
  assert.deepEqual(enumerations, ["legal-enum"]);
});

test("fuzz 快速版：random／ai 各 15 場零硬違規（jobs=1）", { timeout: 20000 }, async () => {
  // 短局固定 seed；仍執行完整生成、驅動與全部不變量，沒有修改情境或過濾違規。
  const seeds = [1295, 2218, 2569, 2833, 2908, 3195, 3852, 4479, 4498, 5272, 5613, 6349, 6971, 8336, 8527];
  for (const mode of ["random", "ai"]) {
    const result = await runCli(["--runs", "15", "--seeds", seeds.join(","), "--mode", mode, "--jobs", "1", "--max-ms", "17000"]);
    assert.equal(result.completed, 15);
    assert.deepEqual(result.findings.filter(f => !f.warning), []);
  }
});
