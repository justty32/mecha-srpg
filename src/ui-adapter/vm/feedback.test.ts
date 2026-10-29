import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { createContentDB } from "../../content/contentdb.ts";
import type { ContentDB } from "../../content/contentdb.ts";
import { CONTENT_KINDS } from "../../core/ids.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { hashLog } from "../../core/eventlog.ts";
import { BattleSession } from "./session.ts";
import { BattleController, controllerForScenario } from "./controller.ts";
import { DEFAULT_KEYMAP, resolveKey, validateKeymap } from "./keymap.ts";
import { layerTypeLabel } from "./labels.ts";

const { db } = loadContentDirs(["content/base"]);
const scenario = "scenario/skirmish-whitegloves";
function closeSim(content = db, aiFirst = false) {
  const sim = scenarioToSetup(content, scenario, 1);
  sim.setup.map = { width: 20, height: 20, fill: "terrain/plain", exits: [] };
  sim.setup.units = sim.setup.units.filter(u => u.id === "player-2" || u.id === "enemy-0");
  sim.setup.units.find(u => u.id === "player-2")!.pos = { x: 2, y: 2 };
  sim.setup.units.find(u => u.id === "enemy-0")!.pos = { x: 3, y: 2 };
  if (aiFirst) for (const u of sim.setup.units) u.owner = u.owner === "player" ? "enemy" : "player";
  return sim;
}
function closeController(seed = 1, content = db) {
  return new BattleController({ session: new BattleSession({ db: content, sim: closeSim(content), seed, autoAdvance: false }) });
}
function aiController() {
  const sim = closeSim(db, true);
  sim.setup.units.find(u => u.id === "player-2")!.pos = { x: 17, y: 17 };
  return new BattleController({ session: new BattleSession({ db, sim, seed: 1, autoAdvance: false }), viewport: { w: 5, h: 5 } });
}
function reachable(c: BattleController) {
  const actor = c.session.activeUnit()!, s = c.session.state;
  const [key] = Object.keys(c.session.query.reachable(s, actor)); assert.ok(key);
  const [x, y] = key.split(",").map(Number); return { x: x!, y: y! };
}
function settle(c: BattleController) {
  let snap = c.snapshot(), n = 0;
  while (snap.busy) { assert.ok(++n < 1000); snap = c.dispatch({ type: "step" }); }
  return snap;
}

test("回饋 1：stepAi 與 advanceAi 同 seed 同指令逐筆一致", () => {
  const sim = scenarioToSetup(db, scenario, 1);
  const stepped = new BattleSession({ db, sim, seed: 1, autoAdvance: false });
  const all = new BattleSession({ db, sim, seed: 1 });
  for (let i = 0; i < 8 && !all.outcome(); i++) {
    while (!stepped.isPlayerTurn() && !stepped.outcome()) assert.ok(stepped.stepAi().actor);
    assert.deepEqual(stepped.commands, all.commands);
    const cmd = { kind: "end" as const, actor: all.activeUnit()! };
    assert.ok(stepped.submit(cmd).ok); assert.ok(all.submit(cmd).ok);
  }
  while (!stepped.isPlayerTurn() && !stepped.outcome()) stepped.stepAi();
  assert.deepEqual(stepped.commands, all.commands);
  assert.equal(hashLog(stepped.state.log), hashLog(all.state.log));
  assert.deepEqual(stepped.stepAi(), { actor: null, events: [] });
});

test("回饋 2：autoAdvance false 保留 AI busy，逐步推進至玩家", () => {
  const c = aiController(); assert.ok(c.snapshot().busy); assert.equal(c.session.commands.length, 0);
  const result = settle(c); assert.equal(result.busy, null); assert.equal(result.playerTurn, true);
  assert.equal(result.selected?.id, result.activeUnit); assert.ok(result.quickMenu);
});

test("回饋 3：step 先聚焦進 viewport，第二次才執行 AI", () => {
  const c = aiController(), before = c.session.commands.length, actor = c.session.activeUnit()!;
  const first = c.dispatch({ type: "step" }), pos = c.session.state.units[actor]!.pos, v = first.viewport;
  assert.equal(c.session.commands.length, before);
  assert.ok(pos.x >= v.x && pos.x < v.x + v.w && pos.y >= v.y && pos.y < v.y + v.h);
  c.dispatch({ type: "step" }); assert.ok(c.session.commands.length > before);
});

test("回饋 4：skip 與 busy cancel 清除 busy／fx 並增加 epoch", () => {
  for (const type of ["skip", "cancel", "confirm"] as const) {
    const c = aiController(), before = c.snapshot().fx.epoch;
    const after = c.dispatch({ type });
    assert.equal(after.busy, null); assert.equal(after.fx.epoch, before + 1); assert.deepEqual(after.fx.items, []);
  }
});

test("回饋 5：移動合成單一路徑與單行記錄，記錄可聚焦", () => {
  const c = closeController(), actor = c.session.activeUnit()!, from = { ...c.session.state.units[actor]!.pos };
  const before = c.snapshot().log.filter(l => l.kind === "move").length;
  const to = { x: 2, y: 4 }; assert.ok(c.session.query.pathTo(c.session.state, actor, to)!.length > 1);
  c.dispatch({ type: "beginMove" }); const result = c.dispatch({ type: "clickCell", ...to });
  const paths = result.fx.items.filter(fx => fx.kind === "path"); assert.equal(paths.length, 1);
  assert.equal(paths[0]!.group, 0);
  assert.deepEqual(paths[0]!.cells[0], from); assert.deepEqual(paths[0]!.cells.at(-1), to);
  const lines = result.log.filter(l => l.kind === "move"); assert.equal(lines.length, before + 1);
  assert.match(lines.at(-1)!.text, /移動（2，2）→（2，4）/u); assert.deepEqual(lines.at(-1)!.at, to);
  assert.deepEqual(c.dispatch({ type: "focusLog", seq: lines.at(-1)!.seq }).cursor, to);
});

test("回饋 6：攻擊線與命中部位傷害／未命中浮字", () => {
  let hit = false, miss = false;
  for (let seed = 1; seed <= 30 && (!hit || !miss); seed++) {
    const c = closeController(seed), actor = c.session.activeUnit()!;
    // 靜止近身普通射擊已可必中；真橫移讓誤差圓產生可驗的命中與未命中分支。
    c.session.state.units["enemy-0"]!.motion = { dx: 0, dy: 2 };
    const chance = c.session.partTargetInfo(actor, "ability/reaper-cleave", "enemy-0").chance;
    assert.ok(chance > 0 && chance < 100);
    c.dispatch({ type: "beginAbility", ability: "ability/reaper-cleave" });
    const picked = c.dispatch({ type: "clickCell", x: 3, y: 2 });
    assert.ok(picked.mode.kind === "part");
    const ordinary = picked.mode.options.find(option => option.part === null)!;
    assert.ok(ordinary.enabled);
    const before = c.session.commands.length;
    const result = c.dispatch({ type: "pickPart", n: ordinary.n });
    assert.equal(c.session.commands.length, before + 1);
    const command = c.session.commands.at(-1)!;
    assert.ok(command.kind === "useAbility");
    assert.equal(command.target?.unit, "enemy-0"); assert.equal(command.target?.part, undefined);
    assert.ok(result.log.some(line => line.kind === "hit" || line.kind === "miss"));
    const attack = result.fx.items.find(f => f.kind === "attack"); assert.ok(attack && attack.kind === "attack");
    assert.deepEqual(attack.from, { x: 2, y: 2 }); assert.deepEqual(attack.to, { x: 3, y: 2 });
    if (attack.hit) {
      hit = true; const damage = result.fx.items.find(f => f.kind === "float" && f.tone === "damage");
      assert.ok(damage && damage.kind === "float"); assert.match(damage.text, /\p{Script=Han}.* −\d/u);
    } else { miss = true; assert.ok(result.fx.items.some(f => f.kind === "float" && f.tone === "miss" && f.text === "未命中")); }
  }
  assert.ok(hit && miss);
});

test("回饋 7：指令成功保留選取與下一步待機選單", () => {
  const c = closeController(), actor = c.session.activeUnit();
  const after = c.dispatch({ type: "clickCell", ...reachable(c) });
  assert.equal(after.selected?.id, actor); assert.equal(after.mode.kind, "idle");
  assert.ok(after.quickMenu?.options.some(o => o.id === "standby"));
  assert.deepEqual(after.quickMenu?.at, c.session.state.units[actor!]!.pos);
});

test("回饋 8：idle 可達格高亮且直接移動", () => {
  const c = closeController(), to = reachable(c), actor = c.session.activeUnit()!;
  assert.equal(c.snapshot().cells.find(p => p.x === to.x && p.y === to.y)?.highlight, "reach");
  const result = c.dispatch({ type: "clickCell", ...to }); assert.equal(result.mode.kind, "idle");
  assert.deepEqual(c.session.state.units[actor]!.pos, to); assert.equal(c.session.commands[0]?.kind, "move");
});

test("回饋 9：移動與能力用盡時自動待機並提示", () => {
  const c = closeController(), { state: s, query: q } = c.session, actor = c.session.activeUnit()!;
  for (const ability of q.abilitiesOf(s, actor)) s.units[actor]!.cooldowns[ability] = 99;
  const commander = q.commanderOf(s, actor)!; s.persons[commander]!.pools.ap!.cur = 1;
  const after = c.dispatch({ type: "clickCell", ...reachable(c) });
  assert.deepEqual(c.session.commands.slice(0, 2).map(c => c.kind), ["move", "end"]);
  assert.equal(after.message, "行動點用完，自動待機"); assert.notEqual(after.activeUnit, actor);
});

test("回饋 10：結束回合先確認台數，其他操作清除，確認後本輪我方全待機", () => {
  const c = controllerForScenario(db, scenario, 1), round = c.session.state.round;
  const before = c.session.commands.length, first = c.dispatch({ type: "endTurn" });
  assert.match(first.confirm!.text, /還有 4 台未行動/u); assert.equal(c.session.commands.length, before);
  assert.equal(c.dispatch({ type: "zoom", dir: 1 }).confirm, null);
  assert.ok(c.dispatch({ type: "endTurn" }).confirm); const second = c.dispatch({ type: "endTurn" });
  assert.equal(second.confirm, null); assert.ok(c.session.commands.length > before);
  const after = settle(c); assert.ok(after.outcome || after.round > round);
  assert.ok(c.session.commands.filter(cmd => c.session.state.units[cmd.actor]!.owner === "player").every(cmd => cmd.kind === "end"));
  const moved = closeController(); moved.dispatch({ type: "clickCell", ...reachable(moved) });
  assert.equal(moved.dispatch({ type: "endTurn" }).confirm, null);
});

test("回饋 11：固定指令恆在；敵方回合原因與結束回合仍可用", () => {
  const c = aiController(), result = c.snapshot();
  assert.deepEqual(result.commands.slice(0, 7).map(c => c.id), ["move", "standby", "defer", "end", "eject", "retreat", "skip"]);
  for (const id of ["move", "standby", "defer", "eject", "retreat"]) {
    const option = result.commands.find(c => c.id === id)!;
    assert.equal(option.enabled, false); assert.match(option.reason!, /敵方回合中/u);
  }
  assert.equal(result.commands.find(c => c.id === "end")!.enabled, true);
  assert.equal(result.commands.find(c => c.id === "skip")!.key, "Esc");
  const epoch = result.fx.epoch; assert.ok(c.dispatch({ type: "endTurn" }).confirm);
  c.dispatch({ type: "endTurn" }); const after = settle(c); assert.ok(after.round > result.round || after.outcome);
  assert.equal(after.fx.epoch, epoch);
});

test("回饋 12：可見敵方即時 hp，離開視野保留快照與殘影", () => {
  const c = closeController(), k = c.session.state.knowledge.player!, enemy = c.session.state.units["enemy-0"]!;
  k.visible = [enemy.id]; const seen = c.vm.unit(enemy.id);
  assert.equal(seen.stale, false); assert.ok(seen.parts.every(p => p.layers.every(l => l.hp !== null)));
  k.lastSeen[enemy.id] = { cell: { ...enemy.pos }, round: c.session.state.round }; k.visible = [];
  for (const part of Object.values(enemy.parts)) for (const layer of part.layers) layer.hp = 0;
  const stale = c.vm.unit(enemy.id); assert.equal(stale.stale, true); assert.deepEqual(stale.parts, seen.parts);
  assert.equal(stale.seenRound, seen.seenRound); assert.equal(c.vm.cell(enemy.pos.x, enemy.pos.y).unit?.stale, true);
});

test("回饋 13：瞄準部位與 part 目標可選取，取消回 target，數字鍵送出部位", () => {
  // 測試unit/part兩種目標變體與指定部位數字鍵；不更改正式內容或規則。
  for (const kind of ["unit", "part"] as const) {
    const defs = Object.fromEntries(CONTENT_KINDS.map(kind => [kind, Object.fromEntries(db.all(kind).map(def => [def.id, structuredClone(def)]))])) as Parameters<typeof createContentDB>[3];
    const ability = defs.ability![db.require("ability", "ability/reaper-cleave").id]!;
    ability.partAim = { allowed: true, penalty: 12 }; ability.target.kind = kind;
    const content: ContentDB = createContentDB([...db.packs], db.registries, db.rules, defs);
    const c = closeController(1, content); c.dispatch({ type: "beginAbility", ability: ability.id });
    let picked = c.dispatch({ type: "clickCell", x: 3, y: 2 }); assert.equal(picked.mode.kind, "part");
    assert.equal(c.dispatch({ type: "cancel" }).mode.kind, "target");
    picked = c.dispatch({ type: "clickCell", x: 3, y: 2 }); assert.ok(picked.mode.kind === "part");
    assert.equal(picked.mode.options[0]!.part === null, kind === "unit");
    const option = picked.mode.options.find(o => o.part !== null && o.enabled)!; assert.ok(option);
    const expected = c.session.partTargetInfo(c.session.activeUnit()!, ability.id, "enemy-0", option.part!);
    assert.equal(option.chance, expected.chance);
    assert.ok(option.chance !== null && option.chance >= 0 && option.chance <= 100);
    assert.match(option.aimNote, /誤差圓/u);
    assert.equal(/命中 −12/u.test(option.label), false);
    c.dispatch({ type: kind === "unit" ? "pickPart" : "abilitySlot", n: option.n });
    const command = c.session.commands.find(cmd => cmd.kind === "useAbility");
    assert.ok(command && command.kind === "useAbility"); assert.equal(command.target?.part, option.part);
  }
});

test("回饋 14：新快捷鍵、加號與層種類中文名", () => {
  assert.deepEqual(validateKeymap(DEFAULT_KEYMAP), []);
  for (const input of [{ key: "+" }, { key: "+", shiftKey: true }, { key: "=" }])
    assert.deepEqual(resolveKey(DEFAULT_KEYMAP, input), { type: "zoom", dir: 1 });
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "w" }), { type: "standby" });
  assert.deepEqual(resolveKey(DEFAULT_KEYMAP, { key: "d" }), { type: "defer" });
  assert.equal(layerTypeLabel(db, "armor"), "裝甲");
});
