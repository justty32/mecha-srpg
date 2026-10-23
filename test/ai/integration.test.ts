// AI × 真規則整合：rules-adapter 把 src/rules/ 包成 RulesQuery，用 content/base 的機甲與裂獸跑 AI 對 AI。
// DN-M-12：AI 只經 RulesQuery／ExecCommand 接規則，換掉 stub 不改 AI 本體。
import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import type { Command } from "../../src/core/types-state.ts";
import { createBattle, startBattle, currentActor, rt } from "../../src/rules/index.ts";
import type { BattleSetup } from "../../src/rules/index.ts";
import { createFactionAI, startRound, runUnitTurn, observeEvents } from "../../src/ai/index.ts";
import { createRulesExec, createRulesQuery } from "../../src/ai/adapters/rules-adapter.ts";

const { db, errors } = loadContentDirs(["content/base", "test/scenarios/pack"])   // 與 golden 同：rules 常數暫放測試 pack（見 REPORT）;

const setup: BattleSetup = {
  id: "ai-integration",
  map: { width: 10, height: 8, fill: "terrain/plain", exits: [{ x: 0, y: 4 }] },
  units: [
    { id: "hound", owner: "player", frame: "frame/hound-mk2", pos: { x: 1, y: 3 },
      components: { "right-weapon": "component/autocannon-30" },
      persons: [{ id: "ren", def: "person/ren-kasai", seat: "pilot" }] },
    { id: "rival", owner: "enemy", frame: "frame/hound-mk2", pos: { x: 7, y: 2 },
      components: { "right-weapon": "component/autocannon-30" },
      persons: [{ id: "mara", def: "person/mara-okoye", seat: "pilot" }] },
    { id: "wolf2", owner: "enemy", monster: { species: "species/tidewolf", grade: "D" }, pos: { x: 8, y: 5 } },
  ],
  objectives: [],
  maxRounds: 6,
};

function run(seed: number): { commands: Command[]; rejected: number } {
  const q = createRulesQuery(db), exec = createRulesExec(db), s = createBattle(db, setup, seed);
  let rejected = 0;
  const counting: typeof exec = (state, cmd) => {
    const r = exec(state, cmd);
    if (!r.ok) rejected++;
    return r;
  };
  const ais = ["player", "enemy"].map((slot) => createFactionAI({ slot, seed }));
  const commands: Command[] = [];
  startBattle({ db, s });
  let round = -1;
  for (let guard = 0; guard < 200; guard++) {
    const actor = currentActor(s);
    if (actor === null || rt(s).outcome) break;
    if (s.round !== round) { round = s.round; for (const ai of ais) startRound(ai, q, s); }
    const ai = ais.find((a) => a.slot === s.units[actor]!.owner)!;
    const from = s.log.events.length;
    const issued = runUnitTurn(ai, q, s, actor, counting);
    commands.push(...issued);
    for (const other of ais) if (other !== ai) observeEvents(other, q, s, s.log.events.slice(from));
    if (currentActor(s) === actor && issued.length === 0) break;   // 防呆：AI 沒推進回合
  }
  return { commands, rejected };
}

test("integration：rules-adapter 下 AI 對 AI 跑完不拋錯且有出手", () => {
  assert.deepEqual(errors, []);
  const r = run(5);
  assert.ok(r.commands.length > 0);
  assert.ok(r.commands.some((c) => c.kind === "end"));
  assert.ok(r.commands.some((c) => c.kind === "useAbility" && c.actor === "hound"));
  assert.ok(r.commands.some((c) => c.kind === "useAbility" && c.actor === "rival"));
  assert.equal(r.rejected, 0);   // architecture headless (4)：AI 不下非法指令
});

test("integration：真規則下同 seed 兩次指令序列相同", () => {
  assert.equal(JSON.stringify(run(9).commands), JSON.stringify(run(9).commands));
});
