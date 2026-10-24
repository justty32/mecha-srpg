import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { hashLog } from "../../core/eventlog.ts";
import { BattleController, controllerForScenario } from "./controller.ts";
import { BattleSession } from "./session.ts";
import { bigMapSim } from "./debug-maps.ts";

const { db } = loadContentDirs(["content/base"]);
function controller(): BattleController { return controllerForScenario(db, "scenario/skirmish-whitegloves", 1); }

test("controller：移動模式高亮可達格，點格移動", () => {
  const c = controller(), actor = c.session.activeUnit()!;
  const snapshot = c.dispatch({ type: "beginMove" }), cell = snapshot.cells.find(p => p.highlight === "reach");
  assert.equal(snapshot.mode.kind, "move"); assert.ok(cell);
  const after = c.dispatch({ type: "clickCell", x: cell.x, y: cell.y });
  assert.deepEqual(c.session.state.units[actor]!.pos, { x: cell.x, y: cell.y });
  assert.equal(after.mode.kind, "idle"); assert.equal(after.message, null);
});
test("controller：能力目標模式點合法目標產生命中或未命中文字", () => {
  const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1);
  sim.setup.map = { width: 8, height: 8, fill: "terrain/plain", exits: [] };
  sim.setup.units = sim.setup.units.filter(u => u.id === "player-2" || u.id === "enemy-0");
  sim.setup.units.find(u => u.id === "player-2")!.pos = { x: 2, y: 2 };
  sim.setup.units.find(u => u.id === "enemy-0")!.pos = { x: 3, y: 2 };
  const c = new BattleController({ session: new BattleSession({ db, sim, seed: 1 }) });
  const targeting = c.dispatch({ type: "beginAbility", ability: "ability/reaper-cleave" });
  assert.equal(targeting.mode.kind, "target");
  assert.equal(targeting.cells.find(cell => cell.x === 3 && cell.y === 2)?.highlight, "target");
  const result = c.dispatch({ type: "clickCell", x: 3, y: 2 });
  assert.equal(result.message, null);
  assert.ok(result.log.some(line => (line.kind === "hit" || line.kind === "miss") && /命中/u.test(line.text)));
  assert.ok(result.commands.every(cmd => !cmd.key || cmd.tooltip.endsWith(`快捷鍵：${cmd.key}`)));
});
test("controller：拒絕指令顯示原因並保留模式", () => {
  const c = controller(); c.dispatch({ type: "beginMove" });
  const pos = c.session.state.units[c.session.activeUnit()!]!.pos;
  const snapshot = c.dispatch({ type: "clickCell", ...pos });
  assert.ok(snapshot.message); assert.equal(snapshot.mode.kind, "move");
});
test("controller：E 與 endTurn 結果相同", () => {
  const a = controller(), b = controller();
  assert.deepEqual(a.key({ key: "e" }), b.dispatch({ type: "endTurn" }));
  assert.equal(hashLog(a.session.state.log), hashLog(b.session.state.log));
  assert.equal(a.key({ key: "F12" }), null);
});
test("controller：游標移出視窗自動捲動並標全重畫", () => {
  const c = new BattleController({ session: new BattleSession({ db, sim: bigMapSim(db, 160, 1), seed: 1 }), viewport: { w: 40, h: 25 } });
  c.snapshot();
  const snapshot = c.dispatch({ type: "cursor", dx: 80, dy: 60 });
  assert.equal(snapshot.dirty, "all");
  assert.ok(snapshot.cursor.x >= snapshot.viewport.x && snapshot.cursor.x < snapshot.viewport.x + snapshot.viewport.w);
  assert.ok(snapshot.cursor.y >= snapshot.viewport.y && snapshot.cursor.y < snapshot.viewport.y + snapshot.viewport.h);
  assert.equal(snapshot.cells.length, 40 * 25);
});
test("controller：只靠 dispatch 玩到結局或三十輪", () => {
  const c = controller(); let snapshot = c.snapshot(), steps = 0;
  while (!snapshot.outcome && snapshot.round < 30) {
    assert.ok(snapshot.playerTurn); assert.ok(++steps <= 200);
    snapshot = c.dispatch({ type: "endTurn" });
  }
  assert.ok(snapshot.outcome || snapshot.round >= 30);
  if (snapshot.outcome) { assert.match(snapshot.outcome.text, /戰鬥結束/u); assert.deepEqual(snapshot.commands, []); }
});
