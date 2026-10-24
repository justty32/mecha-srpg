// 規則回歸測試：fuzz（test/fuzz/）與實戰抓到的 bug，每條先寫失敗測試再修。
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createBattle, startBattle, personAttr, currentActor, tryCommand, checkAbility, abilitiesOf, rt, applyEffect } from "../../src/rules/index.ts";
import type { BattleSetup } from "../../src/rules/index.ts";

const { db } = loadContentDirs(["content/base"]);
const humans = db.all("person").filter(p => p.kind === "human").map(p => p.id).sort();
const attr = Object.keys(db.require("person", humans[0]!).attrs).sort()[0]!;
function pilotedFrame(): { frame: string; seat: string } {
  for (const frame of db.ids("frame").sort()) {
    const seat = db.require("bodyplan", db.require("frame", frame).bodyPlan).parts.flatMap(p => p.seats ?? [])
      .find(s => s.accepts[0] === "pilot");
    if (seat) return { frame, seat: seat.id };
  }
  throw new Error("內容包沒有駕駛座機體");
}

test("回歸：匯入人物現況的 contrib 值是 NumExpr 物件時於匯入時求值，不拋「貢獻值尚未求值」", () => {
  // 營運層（ops sortie 機魂樹 mastery、opseffect 預掛效果）會把未求值的 NumExpr 放進 PersonState.contribs。
  const { frame, seat } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-contrib-expr", map: { width: 3, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 2, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame, persons: [{ id: "p", def: humans[0]!, seat,
        state: { contribs: [{ id: "ops-1", source: "ops:test", path: `self.attrs.${attr}`, op: "add", value: { product: [3, 2] } }] } }] },
      { id: "b", owner: "enemy", pos: { x: 2, y: 0 }, frame }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  assert.doesNotThrow(() => startBattle(ctx));
  assert.equal(s.persons.p!.contribs.find(c => c.id === "ops-1")!.value, 6);
  assert.equal(personAttr(ctx, "p", attr), (db.require("person", humans[0]!).attrs[attr] ?? 0) + 6);
});

test("回歸：撤離決定勝負後不再寫任何事件（BattleEnd 必為最後一筆）", () => {
  const { frame, seat } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-retreat-end", map: { width: 3, height: 1, fill: db.ids("terrain").sort()[0]!,
    exits: [{ x: 0, y: 0 }, { x: 2, y: 0 }] }, objectives: [], maxRounds: 3, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame, persons: [{ id: "pa", def: humans[0]!, seat }] },
      { id: "b", owner: "enemy", pos: { x: 2, y: 0 }, frame, persons: [{ id: "pb", def: humans[0]!, seat }] }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  const actor = currentActor(s)!;
  assert.ok(tryCommand(ctx, { kind: "retreat", actor }).ok);
  assert.ok(rt(s).outcome);
  assert.equal(s.log.events.at(-1)!.type, "BattleEnd");
});

test("回歸：能力 produces 指向機體沒有的池時不可用（checkAbility 拒絕），不在執行中拋「缺少池」", () => {
  // 例：生物機體（無 heat 池）的 graft 槽裝了會產生 heat 的機械部件。
  let found: { frame: string; slot: string; component: string; ability: string; seat: string } | undefined;
  search: for (const frame of db.ids("frame").sort()) {
    const f = db.require("frame", frame), pools = new Set(f.pools.map(p => p.id)), plan = db.require("bodyplan", f.bodyPlan);
    const seat = plan.parts.flatMap(p => p.seats ?? []).find(s => s.accepts[0] === "pilot");
    if (!seat) continue;
    for (const part of plan.parts) for (const slot of part.slots) {
      for (const c of db.all("component").filter(c => c.slot === slot.type).sort((a, b) => a.id < b.id ? -1 : 1)) {
        const own = new Set([...pools, ...c.pools.map(p => p.id)]);
        const ability = c.abilities.map(id => db.require("ability", id)).find(a => a.mode === "activated" && !a.actorRole
          && a.costs.every(x => x.owner === "person" ? x.pool === "ap" : own.has(x.pool))
          && a.produces.some(x => x.owner === "mech" && !own.has(x.pool)));
        if (ability) { found = { frame, slot: slot.id, component: c.id, ability: ability.id, seat: seat.id }; break search; }
      }
    }
  }
  assert.ok(found, "內容包裡找不到 produces 缺池的合法組合；回歸條件需改用測試包");
  const setup: BattleSetup = { id: "regress-produces", map: { width: 8, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 2, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame: found.frame, components: { [found.slot]: found.component },
        persons: [{ id: "pa", def: humans[0]!, seat: found.seat }] },
      { id: "b", owner: "enemy", pos: { x: 1, y: 0 }, frame: found.frame }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  assert.ok(abilitiesOf(ctx, "a").includes(db.require("ability", found.ability).id));
  rt(s).active = "a";
  for (const target of [undefined, { unit: "a" }, { unit: "b" }, { cell: { x: 1, y: 0 } }]) {
    assert.doesNotThrow(() => checkAbility(ctx, "a", found!.ability, target));
    assert.notEqual(checkAbility(ctx, "a", found!.ability, target), null);
    assert.doesNotThrow(() => tryCommand(ctx, { kind: "useAbility", actor: "a", ability: found!.ability, ...(target ? { target } : {}) }));
  }
});

test("回歸：person scope 的效果掛到沒有人物的目標（無駕駛怪獸）時略過，不拋「缺少人物」", () => {
  // 內容線回報：攻擊命中怪獸時，能力 on:hit 掛 scope:"person" 效果會中斷整場戰鬥。
  const effect = db.all("effect").filter(e => e.scope === "person" && !e.save && !e.immuneTags?.length).map(e => e.id).sort()[0]!;
  const monster = db.require("monster", db.ids("monster").sort()[0]!);
  const setup: BattleSetup = { id: "regress-person-scope", map: { width: 3, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 2, units: [
      { id: "m", owner: "enemy", pos: { x: 0, y: 0 }, monster: { species: monster.species, grade: monster.grade } },
      { id: "b", owner: "player", pos: { x: 2, y: 0 }, frame: pilotedFrame().frame }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  const before = s.log.events.length;
  assert.doesNotThrow(() => applyEffect(ctx, effect, { unit: "m" }, "test"));
  assert.equal(applyEffect(ctx, effect, { unit: "m" }, "test"), null);
  assert.equal(s.log.events.length, before);
});

test("回歸：雙方都只剩無人可下指令的單位時，戰局照輪推進到 maxRounds 以 timeout 結束，而非停在輪末沒有結果", () => {
  // 例：雙方都是無駕駛機體（controlMode none）或過熱停機；舊版 advance 在輪末直接 return，outcome 永遠是 null。
  const { frame } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-stall", map: { width: 3, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 3, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame }, { id: "b", owner: "enemy", pos: { x: 2, y: 0 }, frame }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  assert.equal(currentActor(s), null);
  assert.deepEqual(rt(s).outcome, { winner: null, reason: "timeout" });
  assert.equal(s.round, 3);
  assert.equal(s.log.events.at(-1)!.type, "BattleEnd");
});
