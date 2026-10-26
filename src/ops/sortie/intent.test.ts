import test from "node:test";
import assert from "node:assert/strict";
import { loadPacks, readPackDir } from "../../content/loader.ts";
import type { MonsterDef } from "../../core/types-def.ts";
import { battleResult, createBattle, rt, unitAttr } from "../../rules/index.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { admitBeast } from "../crew/restraint.ts";
import { applyBattleResult } from "./apply.ts";
import { classifyOutcome } from "./outcome.ts";
import { sortieBattleSetup } from "./run.ts";
import { fixture, result } from "./test-support.ts";

test("營運出戰敵獸與玩家活捕獸保留 monster.def，覆寫部位與屬性生效", () => {
  const { s, ctx, sortie, contract } = fixture(), pack = readPackDir("content/base");
  // 裂縫名單擴充後固定本測試的候選，確保 D 級抽到蝕蟲（lead-kaiju2）。
  contract.target.snapshot!.monsters = ["monster/mite-d", "monster/reaper-c", "monster/nestmother-landlord"];
  const original = ctx.db.require("monster", "monster/mite-d"), species = ctx.db.require("species", original.species);
  const part = ctx.db.require("bodyplan", species.bodyPlan).parts[0]!;
  const layers = part.layers.map(layer => ({ ...layer, hp: layer.hp + 17 }));
  pack.files["monsters/mite-d.json"] = { ...pack.files["monsters/mite-d.json"] as MonsterDef,
    partsOverride: [{ id: part.id, layers }],
    attrMods: [{ source: "ability/restrain", path: "self.attrs.accuracy", op: "add", value: 6 }] };
  const loaded = loadPacks([pack]); assert.deepEqual(loaded.errors, []); ctx.db = loaded.db;
  const mech = instantiateMech(ctx.db, "captured-mite", "frame/bio-mite", { restraint: "component/shell-pin-restraint" });
  assert.ok(admitBeast(s, ctx, mech));
  mech.parts[part.id]!.layers[0]!.hp -= 3;
  sortie.units = [{ mech: mech.id, seats: {}, controlMode: "instinct" }];
  const setup = sortieBattleSetup(s, ctx, sortie); assert.ok(setup.ok);
  const state = createBattle(ctx.db, setup.sim.setup, setup.seed), battleCtx = { db: ctx.db, s: state };
  const monsters = setup.sim.setup.units.filter(unit => unit.monster);
  assert.ok(monsters.every(unit => unit.monster!.def));
  const enemy = monsters.find(unit => unit.owner === "enemy" && unit.monster!.def === original.id);
  assert.ok(enemy);
  assert.deepEqual(state.units[enemy.id]!.parts[part.id]!.layers.map(layer => layer.hp), layers.map(layer => layer.hp));
  assert.equal(unitAttr(battleCtx, enemy.id, "accuracy"), species.baseAttrsByGrade[original.grade]!.accuracy! + 6);
  const own = monsters.find(unit => unit.id === mech.id); assert.equal(own?.monster?.def, original.id);
  assert.equal(unitAttr(battleCtx, mech.id, "accuracy"), species.baseAttrsByGrade[original.grade]!.accuracy! + 6);
  // 活捕已存部位的耗損仍優先於新建怪獸的初始 HP。
  assert.deepEqual(state.units[mech.id]!.parts[part.id]!.layers, mech.parts[part.id]!.layers);
});

test("正式 detail 擊退依勝方分類，優先於舊 units 推斷，缺 detail 仍相容", () => {
  const { s, ctx, sortie, mech } = fixture();
  const state = createBattle(ctx.db, { id: "repelled", units: [], objectives: [],
    map: { width: 1, height: 1, fill: "terrain/plain", exits: [] } }, 1);
  for (const winner of ["player", "ally", "enemy"] as const) {
    rt(state).outcome = { winner, reason: "eliminate", detail: "repelled" };
    const battle = battleResult({ db: ctx.db, s: state })!;
    // 故意讓單位快照指向相反結果，釘住正式欄位優先權。
    battle.units = [{ id: mech, status: winner === "enemy" ? "alive" : "retreated", state: structuredClone(s.mechs[mech]!) },
      { id: "enemy", status: winner === "enemy" ? "retreated" : "alive", state: { ...structuredClone(s.mechs[mech]!), owner: "enemy" } }];
    assert.equal(classifyOutcome(battle, sortie).outcome, winner === "enemy" ? "withdrew" : "repelled");
  }
  const legacy = result();
  legacy.units = [{ id: "enemy", status: "retreated", state: { ...structuredClone(s.mechs[mech]!), owner: "enemy" } }];
  assert.equal(classifyOutcome(legacy, sortie).outcome, "repelled");
});

test("同族同級兩隻 A 級怪活捕依 monster id 帶入各自二名，舊結果保留後備", () => {
  for (const captured of ["mirror-a", "intent-mirror", "legacy"] as const) {
    const { s, ctx, sortie } = fixture(), pack = readPackDir("content/base");
    const first = ctx.db.require("monster", captured === "legacy" ? "monster/nestmother-landlord" : "monster/mirror-a");
    if (captured !== "legacy") pack.files["monsters/intent-mirror.json"] = {
      ...pack.files["monsters/mirror-a.json"] as MonsterDef, id: "monster/intent-mirror", epithet: "第二面鏡" };
    const loaded = loadPacks([pack]); assert.deepEqual(loaded.errors, []); ctx.db = loaded.db;
    const ids = captured === "legacy" ? [first.id] : [first.id, ctx.db.require("monster", "monster/intent-mirror").id];
    const battle = result();
    for (const id of ids) {
      const monster = ctx.db.require("monster", id), species = ctx.db.require("species", monster.species);
      const mech = instantiateMech(ctx.db, id, species.capture.frame);
      const caught = captured === "legacy" || id === ctx.db.require("monster", `monster/${captured}`).id;
      mech.owner = caught ? "player" : "enemy";
      battle.units.push({ id, ...(captured === "legacy" ? {} : { monster: id }), status: caught ? "captured" : "alive", state: mech });
    }
    applyBattleResult(s, ctx, sortie, battle);
    const beast = Object.values(s.restraint.beasts).find(beast => s.flags[`captured:${beast.mech}`]); assert.ok(beast);
    assert.equal(s.roster.names[beast.mech]!.find(name => name.kind === "epithet")?.name,
      captured === "intent-mirror" ? "第二面鏡" : first.epithet);
  }
});
