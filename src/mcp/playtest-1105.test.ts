// playtest-1105 試玩回歸：陣亡敵方殘影、怪獸形態名、招架說明。
import { test } from "node:test";
import assert from "node:assert/strict";
import { createEnv } from "./tool.ts";
import { createBattleHub, createBattleTools } from "./battle.ts";
import { BattleView } from "./battle-view.ts";
import { createSession } from "../sim/session.ts";
import { scenarioToSetup } from "../sim/run.ts";

const env = createEnv();
const harness = () => {
  const hub = createBattleHub(env), tools = createBattleTools(env, hub);
  const call = async (name: string, args: Record<string, unknown>) => {
    const result = await tools.find(t => t.name === name)!.handler(args);
    return { text: result.content.filter(c => c.type === "text").map(c => c.text)[0]!, data: result.structuredContent as any };
  };
  return { hub, call };
};

test("親眼看到陣亡的敵方不再以 stale 殘影留在 units，改列 departed；知識也不留 lastSeen", () => {
  const db = env.battleDb(), seed = 11;
  const session = createSession({ db, sim: scenarioToSetup(db, "scenario/exm-crossline", seed), seed, human: [], maxSteps: 4000 });
  const view = new BattleView(session, "player", false);
  let dead: string | undefined;
  for (let i = 0; i < 4000 && !session.outcome(); i++) {
    if (view.track(() => session.stepAi()) === null) break;
    dead = view.departed()[0]?.id;
    if (dead) break;
  }
  assert.ok(dead, "樣本內應有一隻敵方在我方眼前陣亡");
  assert.equal(session.state.rt!.unitStatus[dead!], "dead");
  assert.ok(!view.units("brief").some(u => u.id === dead), "陣亡敵方不應留在 units");
  assert.equal(session.state.knowledge.player?.lastSeen[dead!], undefined, "親眼看到陣亡就不留最後所見");
  assert.match(view.departed()[0]!.status, /陣亡/u);
  // 我方單位帶狀態欄，被擊毀時看得出來。
  assert.ok(view.units("brief").filter(u => u.owner === "player").every(u => typeof u.status === "string" && u.status !== "未知"));
});

test("怪獸形態顯示名：敵方鹽針・倒鉤等形態名出現在 MCP 單位名", async () => {
  const { call, hub } = harness();
  const started = await call("battle_new", { scenario: "scenario/exk-four-corners", seed: 7, autoAdvance: false });
  const b = hub.get(started.data.id), s = b.session.state;
  const enemyNames = Object.keys(s.units).filter(id => s.units[id]!.owner === "enemy").map(id => b.view.name(id));
  for (const form of ["倒鉤", "鎖翅", "燼吻", "背針"]) assert.ok(enemyNames.some(n => n.includes(form)), `敵方應顯示形態名 ${form}：${enemyNames.join("、")}`);
  const db = env.battleDb();
  const forms = db.ids("monster").filter(id => id.includes("monster/exk-"));
  assert.equal(forms.length, 8, "exk 八個形態都要檢查（id 帶 pack 前綴）");
  for (const id of forms) {
    const m = db.require("monster", id);
    assert.ok(m.name && m.name.includes(db.require("species", m.species).name), `${id} 缺顯示名或未含物種名`);
  }
});

test("武器招架在 legal_actions 的 does 不是空字串，說明招架的承傷方式", async () => {
  const { call, hub } = harness();
  const started = await call("battle_new", { scenario: "scenario/exk-four-corners", seed: 7, autoAdvance: false });
  const s = hub.get(started.data.id).session;
  const unit = Object.keys(s.state.units).find(id => s.state.units[id]!.owner === "player" && s.rulesQuery.abilitiesOf(s.state, id).some(a => a.endsWith("ability/battlefield-parry")));
  assert.ok(unit, "情境內應有帶武器招架的我方機");
  const legal = await call("battle_legal_actions", { id: started.data.id, unit });
  const parry = legal.data.abilities.find((a: { id: string }) => a.id.endsWith("ability/battlefield-parry"));
  assert.ok(parry.does.length > 0, "招架說明不得為空");
  assert.match(parry.does, /招架.*1 次.*武器臂/u);
});
