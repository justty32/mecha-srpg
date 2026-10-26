import { fixture } from "../../../../../../../../src/ops/sortie/test-support.ts";
import { sortieBattleSetup } from "../../../../../../../../src/ops/sortie/run.ts";
import { createWorldDB } from "../../../../../../../../src/ops/content/worlddb.ts";
import { scenarioToSetup, runBattle } from "../../../../../../../../src/sim/index.ts";
import { greedy } from "../../../../../../../../src/ops/sim/policies.ts";
import { readFileSync } from "node:fs";

// 第二輪：fixture 以 newCampaign(start/default, 7) 建完整機庫；使用 greedy 的 allUnits 派員。
// 保留測試的契約／地圖生成 RNG，部署及戰鬥 seed 為 1–10。
// sortieBattleSetup 內呼叫 generateScenario 並帶入營運實際配裝、部位、資源及控制模式。
// 可選參數為量測用編成覆寫 JSON；未給參數時只量工作樹的六份內容。
const names = ["league-blight-checkpoint", "rival-anvil-carcass", "rival-saltgull-ambush", "selene-whiteglove-audit", "smuggler-farside-ship", "tide-unshacklers"];
const overrides = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")) : {};
const selected = process.argv[3] ? names.filter(n => n === process.argv[3]) : names;
const summaries = [];
for (const name of selected) {
  const trials = [];
  for (let seed = 1; seed <= 10; seed++) {
    const { s, ctx, sortie, contract } = fixture();
    s.ship.at = sortie.node;
    const command = greedy(s, ctx);
    if (command.v !== "sortie") throw new Error(`greedy did not sortie: ${command.v}`);
    sortie.units = command.sortie.units;
    if (sortie.units.length !== 3) throw new Error(`expected full default hangar, got ${sortie.units.length}`);
    const original = ctx.world;
    const base = original.require("encounter", `encounter/${name}`);
    const encounter = { ...base, ...overrides[name] };
    const template = { ...original.require("contract", contract.template), encounter: [encounter.id], objectives: [{ kind: "eliminate" as const, params: {} }] };
    const patch = createWorldDB(original.packs, { contract: { [template.id]: template }, encounter: { [encounter.id]: encounter } });
    ctx.world = { ...original, get: (kind, id) => patch.get(kind, id) ?? original.get(kind, id),
      require: (kind, id) => patch.get(kind, id) ?? original.require(kind, id),
      all: kind => [...original.all(kind).filter(d => !patch.get(kind, d.id)), ...patch.all(kind)] };
    const prepared = sortieBattleSetup(s, ctx, sortie);
    if (!prepared.ok) throw new Error(prepared.error);
    const sc = prepared.scenario, sim = prepared.sim;
    // 只替換部署 seed；沿用正式營運 prepareSetup 的單位 id 與完整初始狀態。
    const deployed = scenarioToSetup(ctx.db, sc, seed);
    for (let i = 0; i < sim.setup.units.length; i++) sim.setup.units[i]!.pos = deployed.setup.units[i]!.pos;
    if (seed === 1) console.log(JSON.stringify({ kind: "formation", name, budget: encounter.budgetByGrade,
      player: sim.setup.units.filter(u => u.owner === "player").map(u => ({ id: u.id, frame: u.frame, grade: ctx.db.require("frame", u.frame!).grade, components: u.components, persons: u.persons?.map(p => ({ id: p.id, def: p.def, seat: p.seat })) })),
      enemy: sc.slots.enemy!.units.map(u => ({ frame: u.mech, persons: u.persons?.map(p => sc.personStates![p.id]!.def) })) }));
    const run = runBattle({ db: ctx.db, sim, seed });
    if (!run.result) throw new Error(`${name}/${seed}: ${run.stopped}`);
    const trial = { kind: "trial", name, seed, winner: run.result.winner, reason: run.result.reason, rounds: run.result.rounds, win: run.result.winner === "player" };
    trials.push(trial); console.log(JSON.stringify(trial));
  }
  const summary = { kind: "summary", name, wins: trials.filter(t => t.win).length, total: trials.length,
    averageRounds: trials.reduce((n, t) => n + t.rounds, 0) / trials.length };
  summaries.push(summary); console.log(JSON.stringify(summary));
}
const wins = summaries.reduce((n, s) => n + s.wins, 0), total = summaries.reduce((n, s) => n + s.total, 0);
console.log(JSON.stringify({ kind: "total", wins, total, rate: wins / total, pass: summaries.every(s => s.wins >= 3 && s.wins <= 8) && wins / total >= .4 && wins / total <= .75 }));
