// 規則回歸測試：fuzz（test/fuzz/）與實戰抓到的 bug，每條先寫失敗測試再修。
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { resolveAbility, eject, createBattle, startBattle, personAttr, currentActor, tryCommand, checkAbility, abilitiesOf, rt, applyEffect, runActions, applyPacket, layerDefs } from "../../src/rules/index.ts";
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

test("回歸：多方局 lose 目標定局時，勝方取與敗方敵對的存活 slot，不挑到敗方盟軍", () => {
  // a(s0) 與 b(s1) 同盟、c(s2) 敵對；s0 的 survive 失敗條件以 lose 表達：字典序第一個存活 slot 是盟軍 s1。
  const { frame, seat } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-lose-ally", allies: { s0: ["s1"], s1: ["s0"] },
    map: { width: 5, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] }, maxRounds: 5,
    objectives: [{ kind: "survive", params: { rounds: 1 }, for: "s0", onComplete: "lose" }], units: [
      { id: "a", owner: "s0", pos: { x: 0, y: 0 }, frame, persons: [{ id: "pa", def: humans[0]!, seat }] },
      { id: "b", owner: "s1", pos: { x: 2, y: 0 }, frame, persons: [{ id: "pb", def: humans[0]!, seat }] },
      { id: "c", owner: "s2", pos: { x: 4, y: 0 }, frame, persons: [{ id: "pc", def: humans[0]!, seat }] }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  for (let i = 0; i < 20 && !rt(s).outcome; i++) assert.ok(tryCommand(ctx, { kind: "end", actor: currentActor(s)! }).ok);
  assert.deepEqual(rt(s).outcome, { winner: "s2", reason: "survive" });
});

test("回歸：效果動作 do:pool 對沒有該池的單位略過，不拋「缺少池」", () => {
  // 例：補給碑地形效果對無 ammo 池的單位。
  const monster = db.require("monster", db.ids("monster").sort()[0]!);
  const setup: BattleSetup = { id: "regress-pool-verb", map: { width: 3, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 2, units: [
      { id: "m", owner: "enemy", pos: { x: 0, y: 0 }, monster: { species: monster.species, grade: monster.grade } },
      { id: "b", owner: "player", pos: { x: 2, y: 0 }, frame: pilotedFrame().frame }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  assert.doesNotThrow(() => runActions(ctx, [{ do: "pool", owner: "mech", pool: "fuzz-no-such-pool", delta: 5 }], { inst: null, self: { unit: "m" }, source: "test" }));
});

test("回歸：已毀部位的結構層不在 TurnStart regen 回血（part.broken 與結構層 broken 保持一致）", () => {
  // 例：菌族 rotwarden 的 arm/head flesh 層帶 regen；舊版會把已毀部位的層補回 hp>0、part.broken 卻仍為 true。
  let found: { species: string; grade: string; part: string } | undefined;
  for (const sp of db.all("species").sort((a, b) => a.id < b.id ? -1 : 1)) {
    const part = db.require("bodyplan", sp.bodyPlan).parts.find(p => !p.functions.includes("core") && p.layers.some(l => l.structural && l.regen !== undefined));
    if (part) { found = { species: sp.id, grade: sp.gradeRange[0]!, part: part.id }; break; }
  }
  assert.ok(found, "內容包裡沒有帶 regen 結構層的非核心部位；回歸條件需改用測試包");
  const setup: BattleSetup = { id: "regress-regen-broken", map: { width: 5, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 4, units: [
      { id: "m", owner: "enemy", pos: { x: 0, y: 0 }, monster: { species: found.species, grade: found.grade as "D" } },
      { id: "b", owner: "player", pos: { x: 4, y: 0 }, frame: pilotedFrame().frame }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  const type = Object.keys(layerDefs(ctx, "m", found.part)[0]!.resist).sort()[0] ?? "kinetic";
  for (let i = 0; i < 20 && !s.units.m!.parts[found.part]!.broken; i++) applyPacket(ctx, "m", found.part, { type, amount: 100000 }, null);
  assert.ok(s.units.m!.parts[found.part]!.broken);
  for (let i = 0; i < 20 && !rt(s).outcome; i++) {
    assert.ok(tryCommand(ctx, { kind: "end", actor: currentActor(s)! }).ok);
    const defs = layerDefs(ctx, "m", found.part), layers = s.units.m!.parts[found.part]!.layers;
    assert.ok(defs.every((d, j) => !d.structural || layers[j]!.broken), "已毀部位的結構層被 regen 補回");
  }
});

test("回歸：一擊殺死最後敵人時，該指令的後續結算（produces 入池等）都記在 BattleEnd 之前", () => {
  // 舊版 unitDied 當下就寫 BattleEnd，之後同一指令的 produces 仍寫 PoolChanged，BattleEnd 不是最後一筆。
  let found: { frame: string; slot: string; component: string; ability: string; seat: string; range: number } | undefined;
  search: for (const frame of db.ids("frame").sort()) {
    const f = db.require("frame", frame), plan = db.require("bodyplan", f.bodyPlan);
    const seat = plan.parts.flatMap(p => p.seats ?? []).find(s => s.accepts[0] === "pilot");
    if (!seat) continue;
    for (const part of plan.parts) for (const slot of part.slots) {
      for (const c of db.all("component").filter(c => c.slot === slot.type).sort((a, b) => a.id < b.id ? -1 : 1)) {
        const own = new Set([...f.pools.map(p => p.id), ...c.pools.map(p => p.id)]);
        const a = c.abilities.map(id => db.require("ability", id)).find(a => a.mode === "activated" && !a.actorRole && a.target.kind === "unit"
          && a.packets.length > 0 && !a.require.length && typeof a.target.range.min === "number" && typeof a.target.range.max === "number"
          && a.costs.every(x => x.owner === "person" ? x.pool === "ap" : own.has(x.pool))
          && a.produces.some(x => x.owner === "mech" && own.has(x.pool)));
        if (a) { found = { frame, slot: slot.id, component: c.id, ability: a.id, seat: seat.id, range: Math.max(1, a.target.range.min as number) }; break search; }
      }
    }
  }
  assert.ok(found, "內容包裡找不到帶 produces 的單體攻擊部件");
  const victim = pilotedFrame().frame, vplan = db.require("bodyplan", db.require("frame", victim).bodyPlan);
  // 受害者所有部位的層都只剩 1 hp：任何命中都會擊毀部位，含 core。
  const parts = Object.fromEntries(vplan.parts.map(p => [p.id, { broken: false, layers: p.layers.map(() => ({ hp: 0.001, broken: false })) }]));
  let checked = 0;
  for (let seed = 1; seed <= 40 && checked === 0; seed++) {
    const setup: BattleSetup = { id: "regress-kill-produces", map: { width: found.range + 1, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
      objectives: [], maxRounds: 2, units: [
        { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame: found.frame, components: { [found.slot]: found.component },
          persons: [{ id: "pa", def: humans[0]!, seat: found.seat }] },
        { id: "z", owner: "enemy", pos: { x: found.range, y: 0 }, frame: victim, parts }] };
    const s = createBattle(db, setup, seed), ctx = { db, s };
    startBattle(ctx);
    if (currentActor(s) !== "a" || checkAbility(ctx, "a", found.ability, { unit: "z" }) !== null) continue;
    assert.ok(tryCommand(ctx, { kind: "useAbility", actor: "a", ability: found.ability, target: { unit: "z" } }).ok);
    if (!rt(s).outcome) continue;
    checked++;
    assert.equal(s.log.events.at(-1)!.type, "BattleEnd");
  }
  assert.ok(checked > 0, "40 個 seed 都沒有一擊定局");
});

test("回歸：UnitInit.pools 匯入值超出 hard 池範圍時夾到 [min,max]（soft 池只夾 min）", () => {
  const { frame, seat } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-init-pools", map: { width: 3, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 2, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame, persons: [{ id: "pa", def: humans[0]!, seat }], pools: { hp: 99999, ap: -50 } },
      { id: "b", owner: "enemy", pos: { x: 2, y: 0 }, frame }] };
  const s = createBattle(db, setup, 1), p = s.persons.pa!;
  assert.ok(p.pools.hp && p.pools.ap, "測試人物需有 hp 與 ap 池");
  assert.ok(p.pools.hp.cur <= p.pools.hp.max, `hp ${p.pools.hp.cur} > ${p.pools.hp.max}`);
  assert.ok(p.pools.ap.cur >= 0, `ap ${p.pools.ap.cur} < min`);
});

test("回歸（ISS-011）：徒步步兵單位不能再棄機（沒有機體可棄）", () => {
  const { frame, seat } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-eject-infantry", map: { width: 4, height: 2, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 3, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame, persons: [{ id: "pa", def: humans[0]!, seat }] },
      { id: "b", owner: "enemy", pos: { x: 3, y: 1 }, frame, persons: [{ id: "pb", def: humans[0]!, seat }] }] };
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  assert.equal(eject(ctx, "a"), null);
  assert.ok(s.units["a-inf"], "棄機後應有步兵單位");
  assert.deepEqual(eject(ctx, "a-inf"), { code: "no-commander", detail: "infantry" });
});

test("回歸（ISS-012）：friendly:\"only\" 的友方能力不擲命中骰，不會同時寫 Miss 與效果", () => {
  const a = db.all("ability").filter(x => x.target.friendly === "only" && x.target.kind === "unit" && x.packets.length === 0
    && x.effects.some(e => e.on === "hit" || e.on === "always")).map(x => x.id).sort()[0];
  assert.ok(a, "內容包沒有 friendly:only 的單體增益能力");
  const { frame, seat } = pilotedFrame();
  const setup: BattleSetup = { id: "regress-friendly-only", map: { width: 4, height: 1, fill: db.ids("terrain").sort()[0]!, exits: [] },
    objectives: [], maxRounds: 3, units: [
      { id: "a", owner: "player", pos: { x: 0, y: 0 }, frame, persons: [{ id: "pa", def: humans[0]!, seat }] },
      { id: "f", owner: "player", pos: { x: 1, y: 0 }, frame, persons: [{ id: "pf", def: humans[0]!, seat }] },
      { id: "z", owner: "enemy", pos: { x: 3, y: 0 }, frame }] };
  for (let seed = 1; seed <= 30; seed++) {
    const s = createBattle(db, setup, seed), ctx = { db, s };
    startBattle(ctx);
    const before = s.log.events.length;
    resolveAbility(ctx, "a", a, { unit: "f" });
    const events = s.log.events.slice(before);
    assert.equal(events.filter(e => e.type === "Miss").length, 0, `seed ${seed} 友方增益擲出未命中`);
    assert.equal(events.find(e => e.type === "Hit")?.payload.roll, null);
  }
});
