import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../content/loader.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { cellKey } from "../../core/ids.ts";
import { BattleSession } from "./session.ts";
import { BattleViewModel } from "./viewmodel.ts";
import { bigMapSim } from "./debug-maps.ts";

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
  session.state.knowledge.player!.visible = ["enemy-0"];
  session.state.knowledge.player!.revealed = {};
  const unseen = vm.unit("enemy-0");
  assert.ok(unseen.parts.length); assert.ok(unseen.parts.every(p => p.layers.every(l => l.hp === null)));
  assert.deepEqual(unseen.pools, []); assert.deepEqual(unseen.persons, []); assert.deepEqual(unseen.effects, []);
  const part = unseen.parts[0]!;
  session.state.knowledge.player!.revealed["enemy-0"] = { [part.id]: [{ type: "armor", max: 90, hp: 7 }] };
  assert.equal(vm.unit("enemy-0").parts[0]!.layers[0]!.hp, 7);
});
