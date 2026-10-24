import test from "node:test";
import assert from "node:assert/strict";
import { canonicalJson } from "../../src/core/eventlog.ts";
import { createSession, runBattle, scenarioToSetup } from "../../src/sim/index.ts";
import type { SessionStep, SimSetup } from "../../src/sim/index.ts";
import { db, scenarioId } from "./helpers.ts";

const setup = (): SimSetup => scenarioToSetup(db, scenarioId, 1, { rounds: 3 });

test("全 AI：逐指令跑完與 runBattle 的 skirmish seed 1／3 輪 hash 相同", () => {
  const sim = setup(), session = createSession({ db, sim, seed: 1 });
  while (session.stepAi()) { /* 跑到結束。 */ }
  const expected = runBattle({ db, sim, seed: 1 });
  const first = session.state.log.events.findIndex((event, i) => canonicalJson(event) !== canonicalJson(expected.state.log.events[i] ?? null));
  assert.equal(session.hash(), expected.hash, `第一個差異事件 index=${first}: ${JSON.stringify(session.state.log.events[first])}`);
  assert.deepEqual(session.commands, expected.commands);
  assert.ok(session.outcome());
});

test("stepAi 每次只推進一個成功指令，observer 在套用後收到同一批事件", () => {
  const session = createSession({ db, sim: setup(), seed: 1, maxSteps: 4 });
  const observed: SessionStep[] = [];
  const unsubscribe = session.observe(step => {
    assert.deepEqual(session.commands.at(-1), step.cmd);
    observed.push(step);
  });
  for (let i = 0; i < 4; i++) {
    const from = session.state.log.events.length, count = session.commands.length;
    const step = session.stepAi();
    assert.ok(step);
    assert.equal(session.commands.length, count + 1);
    assert.equal(step.actor, step.cmd.actor);
    assert.deepEqual(step.events, session.state.log.events.slice(from));
    assert.equal(observed.length, count + 1);
  }
  unsubscribe();
  assert.equal(session.stepAi(), null);
  assert.equal(session.runAiUntilHuman(), 0);
  assert.equal(session.hash(), runBattle({ db, sim: setup(), seed: 1, maxSteps: 4 }).hash);
});

test("人類 slot：非人類回合拒絕 submit，人類回合接受合法指令", () => {
  const sim = setup(), initial = createSession({ db, sim, seed: 1 });
  const firstSlot = initial.state.units[initial.currentActor()!]!.owner;
  const human = Object.keys(initial.state.factions).filter(slot => slot !== firstSlot);
  const session = createSession({ db, sim, seed: 1, human });
  const before = canonicalJson(session.state);
  assert.deepEqual(session.submit({ kind: "end", actor: session.currentActor()! }), { ok: false, rejection: { code: "not-active" } });
  assert.equal(canonicalJson(session.state), before);
  assert.ok(session.runAiUntilHuman() > 0);
  assert.ok(session.isHumanTurn());
  assert.equal(session.stepAi(), null);
  assert.ok(session.submit({ kind: "end", actor: session.currentActor()! }).ok);
});

test("legalActions：抽樣列出的各能力目標在同一初始狀態均能 submit", () => {
  const sim: SimSetup = { scenario: null, slotProfiles: {}, unitPolicies: {}, setup: {
    id: "session-targets", maxRounds: 3, objectives: [],
    map: { width: 4, height: 3, fill: "terrain/plain", exits: [] },
    units: ["player", "enemy"].map((owner, i) => ({ id: owner, owner, pos: { x: i + 1, y: 1 },
      frame: "frame/hound-mk2", components: { "right-weapon": "component/autocannon-30" },
      persons: [{ id: `${owner}-pilot`, def: "person/ren-kasai", seat: "pilot" }] })),
  } };
  const make = () => createSession({ db, sim, seed: 1, human: ["player", "enemy"] });
  const session = make(), legal = session.legalActions();
  assert.ok(legal.actor);
  assert.ok(legal.end);
  assert.ok(Object.keys(legal.reachable).length > 0);
  assert.equal(session.legalActions("missing").abilities.length, 0);
  let checked = 0;
  for (const { ability, targets } of legal.abilities) for (const target of targets) {
    const result = make().submit({ kind: "useAbility", actor: legal.actor, ability, target });
    assert.ok(result.ok, `${ability} ${JSON.stringify(target)}: ${JSON.stringify(result)}`);
    checked++;
  }
  assert.ok(checked > 0, "必須實際抽到能力目標，不能空集合通過");
});

test("preview 回傳規則結果與事件，前後 state canonical JSON 完全相同", () => {
  const session = createSession({ db, sim: setup(), seed: 1, human: ["player", "enemy"] });
  const before = canonicalJson(session.state), hash = session.hash();
  const preview = session.preview({ kind: "end", actor: session.currentActor()! });
  assert.ok(preview.result.ok);
  assert.ok(preview.result.events.length > 0);
  assert.notEqual(canonicalJson(preview.state), before);
  assert.equal(canonicalJson(session.state), before);
  assert.equal(session.hash(), hash);
  assert.equal(session.commands.length, 0);
});

test("結束後 submit／stepAi 拒絕推進且 result 非 null", () => {
  const session = createSession({ db, sim: setup(), seed: 1, human: ["player", "enemy"] });
  assert.equal(session.result(), null);
  let actor = session.currentActor()!;
  for (let i = 0; !session.outcome() && i < 100; i++) {
    actor = session.currentActor()!;
    assert.ok(session.submit({ kind: "end", actor }).ok);
  }
  assert.ok(session.outcome());
  const before = canonicalJson(session.state), count = session.commands.length;
  assert.deepEqual(session.submit({ kind: "end", actor }), { ok: false, rejection: { code: "battle-over" } });
  assert.equal(session.stepAi(), null);
  assert.equal(session.runAiUntilHuman(), 0);
  assert.ok(session.result());
  assert.equal(canonicalJson(session.state), before);
  assert.equal(session.commands.length, count);
});

test("trackKnowledge：成功指令後更新該 slot 的 visible／lastSeen，不影響 hash；取消後不再更新", () => {
  const sim = setup(), session = createSession({ db, sim, seed: 1 });
  const stop = session.trackKnowledge("player");
  let seenAt = -1;
  for (let i = 0; session.stepAi(); i++) if (seenAt < 0 && session.state.knowledge.player!.visible.length > 0) seenAt = i;
  assert.ok(seenAt >= 0, "全場應至少看見一台敵機");
  assert.ok(Object.keys(session.state.knowledge.player!.lastSeen).length > 0);
  assert.deepEqual(session.state.knowledge.enemy!.visible, [], "未追蹤的 slot 不更新");
  assert.equal(session.hash(), runBattle({ db, sim, seed: 1 }).hash);
  stop();
  const other = createSession({ db, sim, seed: 1 }), unsubscribe = other.trackKnowledge("player");
  unsubscribe();
  while (other.stepAi()) { /* 跑到結束。 */ }
  assert.deepEqual(other.state.knowledge.player!.visible, []);
});

test("trackKnowledge 先於之後註冊的 observer 更新", () => {
  const session = createSession({ db, sim: setup(), seed: 1 });
  session.trackKnowledge("player");
  const fresh: boolean[] = [];
  session.observe(() => {
    const k = session.state.knowledge.player!;
    fresh.push(k.visible.every(id => k.lastSeen[id]?.round === session.state.round));
  });
  while (session.stepAi()) { /* 跑到結束。 */ }
  assert.ok(fresh.length > 0 && fresh.every(Boolean));
});

test("contentDb／rulesQuery：公開唯讀內容與查詢介面", () => {
  const session = createSession({ db, sim: setup(), seed: 1 }), actor = session.currentActor()!;
  assert.equal(session.contentDb, db);
  assert.ok(session.contentDb.require("frame", session.state.units[actor]!.frame));
  assert.ok(Object.keys(session.rulesQuery.reachable(session.state, actor)).length > 0);
  assert.ok(session.rulesQuery.abilitiesOf(session.state, actor).length > 0);
});
