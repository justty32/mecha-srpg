import test from "node:test";
import assert from "node:assert/strict";
import { createSession, runBattle, scenarioToSetup } from "../../src/sim/index.ts";
import { db } from "./helpers.ts";

// lead-ui-session 回報的怪處：AI 最後一個成功指令之後若還有被拒指令，舊版 stepAi 會在回合末多回一次 null，
// 讓 `while (stepAi())` 與 runAiUntilHuman 在戰鬥中途停下。修正後全 AI 只在分出勝負時回 null，指令序列不變。
for (const [scenario, seed] of [["scenario/skirmish-whitegloves", 1], ["scenario/skirmish-whitegloves", 2], ["scenario/rift-edge-nest", 1]] as const) {
  test(`stepAi：全 AI 只在戰鬥結束時回 null（${scenario} seed ${seed}）`, () => {
    const sim = scenarioToSetup(db, scenario, seed, { rounds: 3 });
    const session = createSession({ db, sim, seed });
    let steps = 0;
    while (session.stepAi()) steps++;
    assert.ok(session.outcome(), `第 ${steps} 步後回 null 但戰鬥未結束（actor=${session.currentActor()}）`);
    const expected = runBattle({ db, sim, seed });
    assert.equal(steps, expected.commands.length);
    assert.equal(session.hash(), expected.hash);
  });
}

test("stepAi：runAiUntilHuman 一次跑完全 AI 戰鬥", () => {
  const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1, { rounds: 3 });
  const session = createSession({ db, sim, seed: 1 });
  const count = session.runAiUntilHuman();
  assert.ok(session.outcome());
  assert.equal(count, runBattle({ db, sim, seed: 1 }).commands.length);
  assert.equal(session.stepAi(), null);
});

test("stepAi：佇列尾端殘留被拒指令時，最後一個成功指令就收尾、不再空回 null", () => {
  const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1, { rounds: 2 });
  const session = createSession({ db, sim, seed: 1 });
  // 白箱：在每個 AI 回合佇列尾端補一個必被拒的指令（回合已結束後再 end），重現「成功之後還有失敗指令」。
  const inner = session as unknown as { planTurn(actor: string): void; pending: { entries: { cmd: unknown; ok: boolean }[] } };
  const plan = inner.planTurn.bind(session);
  inner.planTurn = (actor: string) => {
    plan(actor);
    inner.pending.entries.push({ cmd: { kind: "end", actor }, ok: false });
  };
  let steps = 0;
  while (session.stepAi()) steps++;
  assert.ok(session.outcome(), `第 ${steps} 步後回 null 但戰鬥未結束`);
  const expected = runBattle({ db, sim, seed: 1 });
  assert.equal(steps, expected.commands.length);
  assert.equal(session.hash(), expected.hash);
});
