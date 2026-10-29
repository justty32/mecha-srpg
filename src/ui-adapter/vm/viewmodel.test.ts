import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { cellKey } from "../../core/ids.ts";
import { BattleSession } from "./session.ts";
import { BattleViewModel } from "./viewmodel.ts";
import { bigMapSim } from "./debug-maps.ts";
import { movementLabel, frameClassLabel } from "./labels.ts";
import { BattleController } from "./controller.ts";

const { db } = loadContentDirs(["content/base"]);
function fixture(): { session: BattleSession; vm: BattleViewModel } {
  const session = new BattleSession({ db, sim: scenarioToSetup(db, "scenario/skirmish-whitegloves", 1), seed: 1 });
  return { session, vm: new BattleViewModel(session) };
}

test("viewmodel：viewport 夾在一般與 160×160 地圖內", () => {
  const { vm } = fixture();
  vm.setViewport(-10, -2, 1000, 1000);
  assert.deepEqual(vm.viewport, { x: 0, y: 0, w: vm.session.state.map.width, h: vm.session.state.map.height });
  const sim = bigMapSim(db, 160, 1), large = new BattleViewModel(new BattleSession({ db, sim, seed: 1 }));
  large.setViewport(999, 999, 40, 25);
  assert.deepEqual(large.viewport, { x: 120, y: 135, w: 40, h: 25 });
  assert.equal(sim.setup.units.filter(u => u.owner === "player").length, 2);
  assert.ok(sim.setup.units.filter(u => u.owner !== "player").length >= 2);
  const own = sim.setup.units.find(u => u.owner === "player")!, enemy = sim.setup.units.find(u => u.owner !== "player")!;
  assert.ok(large.session.query.distance(own.pos, enemy.pos) > 100);
  assert.deepEqual(bigMapSim(db, 160, 1), sim);
});
test("viewmodel：cell 地形取自內容包", () => {
  const { vm, session } = fixture(), cell = vm.cell(0, 0);
  const terrain = db.require("terrain", session.state.map.terrain[0]!);
  assert.deepEqual(cell.terrain, { id: terrain.id, name: terrain.name, glyph: terrain.glyph, color: terrain.color });
});
test("viewmodel：未見敵軍不出現在格子", () => {
  const { session, vm } = fixture(), enemy = session.state.units["enemy-0"]!;
  session.state.knowledge.player!.visible = [];
  assert.equal(vm.cell(enemy.pos.x, enemy.pos.y).unit, undefined);
  session.state.knowledge.player!.visible = [enemy.id];
  assert.equal(vm.cell(enemy.pos.x, enemy.pos.y).unit?.id, enemy.id);
});
test("viewmodel：移動 dirty 包含起訖格且讀取後清空", () => {
  const { session, vm } = fixture(), actor = session.activeUnit()!, from = { ...session.state.units[actor]!.pos };
  vm.dirty();
  const reachable = Object.keys(session.query.reachable(session.state, actor));
  assert.ok(reachable.length);
  const [x, y] = reachable[0]!.split(",").map(Number), to = { x: x!, y: y! };
  const path = session.query.pathTo(session.state, actor, to); assert.ok(path);
  assert.equal(session.submit({ kind: "move", actor, path }).ok, true);
  const dirty = vm.dirty(); assert.ok(dirty.has(cellKey(from.x, from.y))); assert.ok(dirty.has(cellKey(to.x, to.y)));
  assert.equal(vm.dirty().size, 0);
});
test("viewmodel：敵方未偵察層 hp 為 null，已偵察值使用知識", () => {
  const { session, vm } = fixture();
  session.state.knowledge.player!.visible = [];
  session.state.knowledge.player!.revealed = {};
  const unseen = vm.unit("enemy-0");
  assert.ok(unseen.parts.length); assert.ok(unseen.parts.every(p => p.layers.every(l => l.hp === null)));
  assert.deepEqual(unseen.pools, []); assert.deepEqual(unseen.persons, []); assert.deepEqual(unseen.effects, []);
  const part = unseen.parts[0]!;
  session.state.knowledge.player!.revealed["enemy-0"] = { [part.id]: [{ type: "armor", max: 90, hp: 7 }] };
  assert.equal(vm.unit("enemy-0").parts[0]!.layers[0]!.hp, 7);
});

test("B01：成本依 owner 使用宣告池名，特殊池仍顯示中文", () => {
  const { session, vm } = fixture(), actor = session.activeUnit()!;
  const commander = session.query.commanderOf(session.state, actor)!;
  const person = db.require("person", session.state.persons[commander]!.def);
  assert.equal(vm.poolName(actor, "person", "ap"), person.pools.find(p => p.id === "ap")!.name);
  for (const pool of session.query.poolDecls(session.state, actor)) assert.equal(vm.poolName(actor, "mech", pool.id), pool.name);
  assert.equal(vm.poolName(actor, "mech", "rune-round"), "符文彈");
  for (const command of vm.commands(actor).filter(c => c.group === "ability")) {
    assert.equal(/\b(?:ap|charge|fatigue|rune-round|ammo-30)\b/u.test(command.tooltip), false);
  }
});

test("B02：五種移動與機體類別用中文，地形成本是靜態宣告", () => {
  assert.deepEqual(["leg", "track", "hover", "flight", "burrow"].map(movementLabel), ["步行", "履帶", "潮行", "飛行", "掘進"]);
  assert.deepEqual(["mechanical", "bio", "ancient"].map(frameClassLabel), ["機械", "生體", "古代機"]);
  const { session, vm } = fixture(), actor = session.activeUnit()!;
  const frame = db.require("frame", session.state.units[actor]!.frame);
  assert.equal(vm.unit(actor).frameClassName, frame.cls === "bio" ? "生體" : frame.cls === "ancient" ? "古代機" : "機械");
  assert.ok(vm.unit(actor).movementName);
  session.state.map.terrain[0] = "terrain/tide-channel";
  const movement = vm.movementClass(actor), cost = db.require("terrain", "terrain/tide-channel").moveCost[movement];
  assert.match(vm.cell(0, 0, actor).travelNote!, cost == null ? /不可通行/ : new RegExp(`成本 ${cost}`));
  assert.match(vm.cell(0, 0, actor).travelNote!, /基礎通行.*實際可達格依移動預覽/);
  assert.equal(vm.cell(0, 0).travelNote, undefined);
});

test("B03：能力說明包含傷害、效果、產出、冷卻與五種形狀半徑", () => {
  const { session, vm } = fixture(), actor = session.activeUnit()!;
  const shapes = { ball: "球", line: "線", cone: "錐", self: "自身", unit: "單體" };
  for (const [kind, name] of Object.entries(shapes)) {
    const a = db.all("ability").find(a => a.target.kind === kind)!;
    const text = vm.abilityDescription(actor, a.id);
    assert.ok(text.includes(`範圍：${name}`));
    for (const label of ["消耗：", "射程：", "傷害（基礎）：", "效果：", "產出：", "冷卻："]) assert.ok(text.includes(label));
    if (a.target.radius !== undefined) assert.match(text, /半徑 .+ 格/);
  }
  const damaging = db.all("ability").find(a => a.packets.some(p => typeof p.amount === "number"))!;
  assert.ok(vm.abilityDescription(actor, damaging.id).includes(String(damaging.packets.find(p => typeof p.amount === "number")!.amount)));
  const effect = db.all("ability").find(a => a.effects.some(e => e.apply.some(ref => !db.require("effect", typeof ref === "string" ? ref : ref.effect).ui.hidden)))!;
  const ref = effect.effects.flatMap(e => e.apply).find(ref => !db.require("effect", typeof ref === "string" ? ref : ref.effect).ui.hidden)!;
  assert.ok(vm.abilityDescription(actor, effect.id).includes(db.require("effect", typeof ref === "string" ? ref : ref.effect).name));
});

test("B04：我方已裝部件與中文功能可見，敵方不洩漏配裝", () => {
  const { session, vm } = fixture();
  const own = Object.values(session.state.units).find(u => u.owner === session.playerSlot && Object.values(u.parts).some(p => Object.values(p.components).some(Boolean)))!;
  assert.ok(own);
  for (const part of vm.unit(own.id).parts) {
    const installed = Object.values(own.parts[part.id]!.components).filter(Boolean);
    assert.deepEqual(part.components?.map(c => c.name), installed.map(id => db.require("component", id!).name));
    for (const component of part.components ?? []) {
      assert.ok(component.functions.length);
      assert.equal(/locomotion|weaponMount|cockpit/.test(component.functions.join(" ")), false);
    }
  }
  session.state.knowledge.player!.visible = ["enemy-0"];
  assert.ok(vm.unit("enemy-0").parts.every(p => p.components === undefined && p.functions === undefined));
  session.state.knowledge.player!.visible = [];
  assert.ok(vm.unit("enemy-0").parts.every(p => p.components === undefined));
});

test("B05：可見怪獸用個體名與稱號，未見敵軍仍隱藏", () => {
  const { session, vm } = monsterFixture();
  const enemy = session.state.units["named"]!, monster = db.require("monster", "monster/tidespine-chittagong");
  session.state.knowledge.player!.visible = [];
  assert.equal(vm.unit(enemy.id).name, db.require("species", monster.species).name);
  assert.equal(vm.cell(enemy.pos.x, enemy.pos.y).unit, undefined);
  session.state.knowledge.player!.visible = [enemy.id];
  assert.equal(vm.unit(enemy.id).name, "吉大港的那隻「萬潮葬王」");
  assert.equal(vm.cell(enemy.pos.x, enemy.pos.y).unit?.label, "吉大");
  assert.equal(vm.cell(enemy.pos.x, enemy.pos.y).unit?.name, vm.unit(enemy.id).name);
});

function monsterFixture(def = "monster/tidespine-chittagong") {
  const monster = db.require("monster", def), sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 1);
  const original = sim.setup.units.find(u => u.owner !== "player")!;
  sim.setup.units = sim.setup.units.filter(u => u.id !== original.id);
  sim.setup.units.push({ id: "named", owner: "enemy", pos: original.pos,
    monster: { species: monster.species, grade: monster.grade, def: monster.id } });
  const session = new BattleSession({ db, sim, seed: 1, autoAdvance: false });
  return { session, vm: new BattleViewModel(session) };
}

test("B06：四怪獸家族與三生態說明只在可見時公開", () => {
  const expected: Record<string, string> = { alien: "異形", beast: "野獸", insect: "蟲類", mycelium: "菌絲" };
  for (const [family, name] of Object.entries(expected)) {
    const monster = db.all("monster").find(m => db.require("species", m.species).family === family)!;
    const { session, vm } = monsterFixture(monster.id);
    session.state.knowledge.player!.visible = ["named"];
    assert.equal(vm.unit("named").familyName, name);
    session.state.knowledge.player!.visible = [];
    assert.equal(vm.unit("named").familyName, undefined);
    assert.equal(vm.unit("named").ecologyNotes, undefined);
  }
  for (const [behavior, label] of [["molt", "蛻皮"], ["spawner", "育幼"], ["telegraph", "預告"]] as const) {
    const monster = db.all("monster").find(m => db.require("species", m.species).behaviors?.[behavior])!;
    const { session, vm } = monsterFixture(monster.id);
    session.state.knowledge.player!.visible = ["named"];
    const text = vm.unit("named").ecologyNotes!.join(" ");
    assert.ok(text.includes(label));
    if (behavior === "telegraph") assert.match(text, /並非當下攻擊意圖/);
  }
});

test("K2：presence 公開標記、不可交戰說明、迎戰灰鈕原因與潮懼光環", () => {
  const { session, vm } = monsterFixture(), s = session.state;
  s.rt!.presences = { named: { aura: "effect/kx-tidal-dread", engageable: false } };
  s.rt!.unitStatus.named = "presence";
  s.knowledge.player!.visible = [];
  const lord = vm.unit("named"), pos = s.units.named!.pos;
  assert.equal(lord.selectable, false);
  assert.match(lord.presenceNote!, /不可交戰.*不能攻擊或捕捉/);
  assert.match(lord.auraNotes!.join(" "), /滅港潮懼.*全場敵我/);
  const badge = vm.cell(pos.x, pos.y).unit!;
  assert.equal(badge.status, "presence"); assert.equal(badge.selectable, false);
  assert.match(badge.notice!, /不可交戰/); assert.match(badge.notice!, /滅港潮懼/);
  const actor = session.activeUnit()!;
  const disabled = vm.commands(actor).find(c => c.id === "engagePresence:named")!;
  assert.equal(disabled.enabled, false); assert.equal(disabled.reason, "此戰場不可主動迎戰");
  assert.ok(disabled.tooltip.includes(disabled.reason!));
  const controller = new BattleController({ session });
  const snapshot = controller.dispatch({ type: "hoverCell", ...pos });
  assert.match(snapshot.inspect.unit!.presenceNote!, /不可交戰/);
  assert.match(snapshot.inspect.unit!.auraNotes!.join(" "), /滅港潮懼/);
  assert.equal(snapshot.cells.find(c => c.x === pos.x && c.y === pos.y)!.unit!.status, "presence");
  s.rt!.presences.named!.engageable = true;
  assert.equal(vm.commands(actor).find(c => c.id === "engagePresence:named")!.enabled, true);
  assert.equal(vm.commands(null).find(c => c.id === "engagePresence:named")!.reason, "尚未選擇棋子");
  s.rt!.presences.named!.engaged = true; s.rt!.unitStatus.named = "active";
  assert.equal(vm.commands(actor).some(c => c.id === "engagePresence:named"), false);
  assert.equal(vm.unit("named").presenceNote, undefined);
  assert.ok(vm.unit("named").auraNotes?.length);
  s.rt!.unitStatus.named = "captured";
  assert.equal(vm.unit("named").auraNotes, undefined);
});

test("穿透沿共享query顯示盾臂到瞄準部位，只有分散攻擊說盾僅主片", () => {
  const { session, vm } = fixture(), target = "enemy-0", actor = "player-0", ability = "ability/mx-radiant-shot";
  session.state.knowledge.player!.visible = [target];
  const base = session.partTargetInfo(actor, ability, target, "torso");
  session.partTargetInfo = () => ({ ...base, pattern: "penetrate", maxParts: 2,
    partHits: [{ part: "left-arm", fraction: 1, conditional: false, primary: true }, { part: "torso", fraction: null, conditional: true, primary: false }],
    possibleParts: ["left-arm", "torso"] });
  const details = vm.partTargetDetails(actor, ability, target, "torso"), text = details.hitNotes!.join("\n");
  assert.match(text, /可能穿透路徑：左臂 → 軀幹/u);
  assert.match(text, /承傷臂計入上限/u);
  assert.match(text, /僅實際剩餘能量.*無餘量即止/u);
  assert.equal(/盾擋僅保護主片|旁波/u.test(text), false);
  assert.equal(/盾擋只保護主片/u.test(vm.abilityDescription(actor, ability)), false);
  assert.match(vm.abilityDescription("player-2", "ability/reaper-cleave"), /盾擋只保護主片/u);
});

test("移動面板沿共享query顯回合額度與原因，敵方不洩漏spent", () => {
  const { session, vm } = fixture();
  session.movementBudget = () => ({ base: 5, mass: 13, capacity: 8, loadPenalty: 1, integrity: 0.75,
    effective: 3, spent: 1, remaining: 2, apRemaining: 1, reachableBudget: 1 });
  const own = vm.unit("player-0").movement!;
  assert.deepEqual([own.remaining, own.limit, own.spent], [2, 3, 1]);
  assert.match(own.notes.join("\n"), /平地約 1 格/u);
  assert.match(own.notes.join("\n"), /完整度 75%/u);
  assert.match(own.notes.join("\n"), /機動定位：輕 · 基礎移動上限 5/u);
  assert.match(own.notes.join("\n"), /負載 13／容量 8；負載扣減 1/u);
  session.state.knowledge.player!.visible = ["enemy-0"];
  assert.equal(vm.unit("enemy-0").movement, undefined);
  session.state.knowledge.player!.visible = [];
  assert.equal(vm.unit("enemy-0").movement, undefined);
});

test("格旗結構完整度排除甲盾，無結構或未知結構回null", () => {
  const { session, vm } = fixture(), own = session.state.units["player-0"]!;
  assert.equal(vm.cell(own.pos.x, own.pos.y).unit?.hpRatio, 1);
  for (const [id, part] of Object.entries(own.parts)) for (const [i, layer] of part.layers.entries()) {
    if (!session.query.layerDefs(session.state, own.id, id)[i]!.structural) { layer.hp = 0; layer.broken = true; }
  }
  assert.equal(vm.cell(own.pos.x, own.pos.y).unit?.hpRatio, 1, "只有甲盾損失不能降低結構完整度");
  const original = vm.unit.bind(vm);
  vm.unit = id => { const view = original(id); return { ...view, parts: view.parts.map(p => ({ ...p, layers: p.layers.map(l => ({ ...l, structural: false })) })) }; };
  assert.equal(vm.cell(own.pos.x, own.pos.y).unit?.hpRatio, null);
  vm.unit = id => { const view = original(id); return { ...view, parts: view.parts.map(p => ({ ...p, layers: p.layers.map(l => ({ ...l, hp: l.structural ? null : l.hp })) })) }; };
  assert.equal(vm.cell(own.pos.x, own.pos.y).unit?.hpRatio, null);
});

test("敵格結構只沿最後所見，不讀敵方現時傷害或血池", () => {
  const { session, vm } = fixture(), enemy = session.state.units["enemy-0"]!, k = session.state.knowledge.player!;
  k.visible = [enemy.id]; k.lastSeen[enemy.id] = { cell: { ...enemy.pos }, round: session.state.round };
  vm.captureVisible();
  const visible = vm.cell(enemy.pos.x, enemy.pos.y).unit!;
  k.visible = [];
  enemy.pools.blood = { cur: 1, max: 100, regen: -12, band: 0 };
  for (const part of Object.values(enemy.parts)) for (const layer of part.layers) layer.hp = 0;
  const stale = vm.cell(enemy.pos.x, enemy.pos.y).unit!;
  assert.equal(stale.stale, true); assert.equal(stale.hpRatio, visible.hpRatio);
  assert.equal(stale.blood, undefined);
});
