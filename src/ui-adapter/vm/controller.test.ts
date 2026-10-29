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
  const picked = c.dispatch({ type: "clickCell", x: 3, y: 2 });
  assert.equal(picked.mode.kind, "part");
  if (picked.mode.kind !== "part") return;
  const ordinary = picked.mode.options.find(option => option.part === null)!;
  assert.ok(ordinary.enabled);
  const before = c.session.commands.length;
  const result = c.dispatch({ type: "pickPart", n: ordinary.n });
  assert.equal(result.message, null);
  assert.equal(result.mode.kind, "idle");
  assert.equal(c.session.commands.length, before + 1);
  const command = c.session.commands.at(-1)!;
  assert.ok(command.kind === "useAbility");
  assert.equal(command.target?.unit, "enemy-0"); assert.equal(command.target?.part, undefined);
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
    assert.ok(++steps <= 200);
    snapshot = c.dispatch({ type: snapshot.busy ? "skip" : "endTurn" });
  }
  assert.ok(snapshot.outcome || snapshot.round >= 30);
  if (snapshot.outcome) { assert.match(snapshot.outcome.text, /戰鬥結束/u); assert.ok(snapshot.commands.every(c => !c.enabled)); }
});

function battlefieldController(): BattleController {
  const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1);
  sim.setup.units = sim.setup.units.filter(u => u.id === "player-0" || u.id === "enemy-0");
  sim.setup.units.find(u => u.id === "player-0")!.pos = { x: 2, y: 2 };
  sim.setup.units.find(u => u.id === "enemy-0")!.pos = { x: 17, y: 17 };
  return new BattleController({ session: new BattleSession({ db, sim, seed: 1 }) });
}

test("controller：一般攻擊可點地物，回收拒絕保留狀態", () => {
  const c = battlefieldController(), s = c.session.state, actor = c.session.activeUnit()!, pos = s.units[actor]!.pos;
  const at = { x: pos.x + 1, y: pos.y }, index = at.y * s.map.width + at.x;
  s.map.terrain[index] = "terrain/ruin-wall"; s.map.featureHp[`${at.x},${at.y}`] = 60;
  c.dispatch({ type: "beginAbility", ability: "ability/mx-head-vulcan" });
  const after = c.dispatch({ type: "clickCell", ...at });
  assert.equal(after.message, null);
  assert.ok(s.map.featureHp[`${at.x},${at.y}`]! < 60);
  assert.deepEqual(c.session.commands.findLast(cmd => cmd.kind === "useAbility")?.target, { cell: at });
  const before = JSON.stringify(s);
  const rejected = c.dispatch({ type: "interact", object: "missing-object" });
  assert.ok(rejected.message);
  assert.equal(JSON.stringify(s), before);
});

test("controller：物件收益與地物HP可查看，遠距回收清楚禁用", () => {
  const c = battlefieldController(), s = c.session.state;
  s.map.objects = [{ id: "scrap-ui", name: "測試殘骸", kind: "wreck", at: { x: 19, y: 19 }, salvage: { metal: 2 } }];
  const snapshot = c.dispatch({ type: "hoverCell", x: 19, y: 19 });
  assert.match(snapshot.inspect.objects?.[0]?.note ?? "", /metal \+2/u);
  const command = snapshot.commands.find(cmd => cmd.id === "interact:scrap-ui");
  assert.equal(command?.enabled, false);
  assert.match(command?.reason ?? "", /射程/u);
  assert.match(command?.tooltip ?? "", /AP 1/u);
});

test("controller：補給滿池拒絕不扣AP，成功回收後格標記及按鈕消失", () => {
  const c = battlefieldController(), s = c.session.state, actor = c.session.activeUnit()!, u = s.units[actor]!;
  s.map.objects = [{ id: "supply-ui", name: "流光匣", kind: "pickup", at: { ...u.pos }, effects: ["effect/battlefield-resupply"] }];
  u.pools.charge!.cur = u.pools.charge!.max;
  const before = JSON.stringify(s);
  const denied = c.dispatch({ type: "interact", object: "supply-ui" });
  assert.ok(denied.message); assert.equal(JSON.stringify(s), before);
  u.pools.charge!.cur = 10;
  const result = c.dispatch({ type: "interact", object: "supply-ui" });
  assert.equal(result.message, null);
  assert.equal(u.pools.charge!.cur, 30);
  assert.equal(result.cells.find(cell => cell.x === u.pos.x && cell.y === u.pos.y)?.objects?.length, 0);
  assert.equal(result.commands.some(cmd => cmd.id === "interact:supply-ui"), false);
  const after = JSON.stringify(s);
  c.dispatch({ type: "interact", object: "supply-ui" });
  assert.equal(JSON.stringify(s), after);
});


test("controller：不可撤離情境標題明示正面交戰，一般情境保留原名", () => {
  const definition = db.require("scenario", "scenario/skirmish-whitegloves");
  assert.equal(controllerForScenario(db, definition.id, 1).snapshot().title, `${definition.name} · 正面交戰・不可撤離`);
  const ordinary = db.require("scenario", "scenario/playable-battlefield");
  assert.equal(controllerForScenario(db, ordinary.id, 1).snapshot().title, ordinary.name);
  assert.equal(definition.name, "白手套的索債戰書");
});

test("controller：普通與部位命中率沿原預覽，防護遵循已知快照", () => {
  const c = battlefieldController(), s = c.session.state, actor = c.session.activeUnit()!, enemy = s.units["enemy-0"]!;
  enemy.pos = { x: s.units[actor]!.pos.x + 2, y: s.units[actor]!.pos.y };
  s.knowledge.player!.visible = [enemy.id];
  const ability = c.session.query.abilitiesOf(s, actor).find(id => c.session.query.abilityDef(id).partAim?.allowed)!;
  assert.ok(ability);
  c.dispatch({ type: "beginAbility", ability });
  const snapshot = c.dispatch({ type: "clickCell", ...enemy.pos });
  assert.equal(snapshot.mode.kind, "part");
  if (snapshot.mode.kind !== "part") return;
  assert.equal(snapshot.partsUnit?.id, enemy.id);
  assert.equal(snapshot.activeUnit, actor);
  const hover = c.dispatch({ type: "hoverCell", x: 0, y: 0 });
  assert.equal(hover.partsUnit?.id, enemy.id, "瞄準時空格hover不得換部位對象");
  const count = c.session.commands.length;
  c.dispatch({ type: "pickPart", n: 999 });
  assert.equal(c.session.commands.length, count, "非法部位編號不得送入戰鬥");
  assert.equal(c.session.activeUnit(), actor);
  assert.ok(snapshot.mode.options.some(o => o.part === null));
  for (const option of snapshot.mode.options) {
    const preview = c.session.preview({ kind: "useAbility", actor, ability, target: { unit: enemy.id, ...(option.part === null ? {} : { part: option.part }) } }).result;
    if (!preview.ok) continue;
    const event = preview.events.find(e => (e.type === "Hit" || e.type === "Miss") && e.payload.target === enemy.id);
    assert.equal(option.chance, event?.payload.chance);
    assert.match(option.aimNote, /露出半徑.*誤差圓/u);
    assert.ok(option.protection.length);
  }
  const ordinary = snapshot.mode.options.find(o => o.part === null)!;
  assert.ok(ordinary.hitNotes?.some(note => note.includes("不代表全部受傷")));
  const part = snapshot.mode.options.find(o => o.part !== null)!;
  assert.ok(part.hitNotes?.some(note => note.includes("主命中")));
  c.vm.unit(enemy.id);
  s.knowledge.player!.visible = [];
  const last = c.vm.partTargetDetails(actor, ability, enemy.id, part.part);
  assert.equal(last.chance, null);
  assert.match(last.aimNote, /未知/u);
  for (const p of Object.values(enemy.parts)) for (const l of p.layers) l.hp = 1;
  assert.deepEqual(c.vm.partTargetDetails(actor, ability, enemy.id, part.part).protection, last.protection);
});

test("回收戰場支援彈正常選能力再點牆一次即扣AP並拆牆，無第二確認", () => {
  const c = controllerForScenario(db, "scenario/playable-battlefield", 1), actor = c.session.activeUnit()!;
  const ability = db.require("ability", "ability/battlefield-support"), s = c.session.state;
  const pid = c.session.query.commanderOf(s, actor)!, ap = s.persons[pid]!.pools.ap!.cur;
  assert.ok(c.session.query.abilitiesOf(s, actor).includes(ability.id));
  assert.equal(c.dispatch({ type: "beginAbility", ability: ability.id }).mode.kind, "target");
  const before = c.session.commands.length;
  const result = c.dispatch({ type: "clickCell", x: 4, y: 3 });
  assert.equal(result.mode.kind, "idle"); assert.equal(result.message, null);
  assert.equal(s.map.featureHp["4,3"], 40);
  assert.equal(s.persons[pid]!.pools.ap!.cur, ap - 2);
  assert.equal(c.session.commands.length, before + 1);
});
