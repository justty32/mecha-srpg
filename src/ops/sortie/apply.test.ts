import test from "node:test";
import assert from "node:assert/strict";
import { applyBattleResult } from "./apply.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { checkLedger } from "../state/ledger.ts";
import { fixture, result } from "./test-support.ts";
import { offerContract, cmdDrop, contractsDaily7 } from "../contracts/index.ts";

test("alive 機甲與人物直接寫回已含舊傷的戰果", () => {
  const { s, ctx, sortie, mech, person } = fixture(), battle = result();
  const full = structuredClone(s.mechs[mech]!), part = Object.keys(full.parts).sort()[0]!;
  const max = full.parts[part]!.layers[0]!.hp;
  s.mechs[mech]!.parts[part]!.layers[0]!.hp = max - 7;
  full.parts[part]!.layers[0]!.hp = max - 10;
  battle.units.push({ id: mech, status: "alive", state: full });
  const p = structuredClone(s.roster.persons[person]!);
  s.roster.persons[person]!.pools.hp!.cur -= 4;
  p.pools.hp!.cur -= 6;
  battle.persons.push({ id: person, status: "alive", state: p, xpGained: 0 });
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(s.mechs[mech]!.parts[part]!.layers[0]!.hp, max - 10);
  assert.equal(s.roster.persons[person]!.pools.hp!.cur, p.pools.hp!.max - 6);
  assert.equal(s.clock.day, sortie.day);
});
test("敵方 anchor dead 使裂縫 unanchored，契約同一單位只算一次", () => {
  const { s, ctx, sortie, contract } = fixture(), battle = result();
  const anchor = instantiateMech(ctx.db, "anchor-unit", "frame/bio-nestmother"); anchor.owner = "enemy";
  const dead = { id: anchor.id, status: "dead" as const, state: anchor };
  battle.units.push(dead, structuredClone(dead));
  battle.events = [0, 1].map(seq => ({ seq, round: 1, type: "UnitDied", payload: { unit: anchor.id } }));
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(s.rifts[sortie.rift!]!.phase, "unanchored");
  assert.equal(Object.values(contract.heads).reduce((a, b) => a + b, 0), 1);
  assert.equal(contract.status, "done");
  const after = structuredClone(s);
  applyBattleResult(s, ctx, sortie, battle);
  assert.deepEqual(s, after);
});
test("loot 材料經 post，checkLedger 無錯且來源含戰鬥 hash", () => {
  const { s, ctx, sortie } = fixture(), battle = result();
  const before = s.ledger.balances["stock:scrap"]!;
  battle.loot.push({ fromUnit: "enemy-0", components: [], materials: { scrap: 7 } });
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(s.ledger.balances["stock:scrap"], before + 7);
  assert.ok(s.ledger.entries.some(e => e.reason === `battle-loot:${battle.log.hash}` && e.account === "stock:scrap" && e.ref));
  assert.deepEqual(checkLedger(s), []);
  assert.ok(s.log.some(e => e.type === "BattleResolved" && e.payload.hash === battle.log.hash && e.payload.rounds === battle.rounds));
});

test("opening 清剿先鋒勝利關閉裂縫，同裂縫不再提供新契約", () => {
  for (const status of ["dead", "retreated", "captured"] as const) {
    const { s, ctx, sortie, contract } = fixture(), battle = result();
    const rift = s.rifts[sortie.rift!]!;
    rift.phase = "opening"; delete rift.anchor;
    contract.target.snapshot!.phase = "opening";
    const otherOffer = offerContract(s, ctx, "contract/seal", contract.issuer, contract.target)!;
    assert.equal(otherOffer.status, "offered");
    const vanguard = instantiateMech(ctx.db, "vanguard", "frame/bio-mite");
    vanguard.owner = status === "captured" ? "player" : "enemy";
    battle.units.push({ id: vanguard.id, status, state: vanguard });
    applyBattleResult(s, ctx, sortie, battle);
    assert.equal(rift.phase, "closed");
    assert.equal(offerContract(s, ctx, contract.template, contract.issuer, contract.target), undefined);
    assert.equal(otherOffer.status, "expired");
    assert.ok(!Object.values(s.contracts).some(c => c.target.rift === rift.id && c.status === "offered"));
  }
});

test("回合上限平手保留契約與耗損，期限內可重打或放棄、逾期照常失敗", () => {
  for (const exit of ["retry", "drop", "expire"] as const) {
    const { s, ctx, sortie, contract, mech } = fixture(), battle = result();
    battle.winner = null; battle.reason = "timeout"; battle.rounds = 20;
    const worn = structuredClone(s.mechs[mech]!);
    worn.parts.torso!.layers[0]!.hp -= 3;
    worn.pools["ammo-30"]!.cur -= 1;
    battle.units.push({ id: mech, status: "alive", state: worn });
    const cash = s.ledger.balances.cash;
    applyBattleResult(s, ctx, sortie, battle);
    assert.equal(contract.status, "active");
    assert.ok(!contract.settled);
    assert.equal(s.ledger.balances.cash, cash);
    assert.equal(s.mechs[mech]!.parts.torso!.layers[0]!.hp, worn.parts.torso!.layers[0]!.hp);
    assert.equal(s.mechs[mech]!.pools["ammo-30"]!.cur, worn.pools["ammo-30"]!.cur);
    if (exit === "retry") {
      applyBattleResult(s, ctx, { ...sortie, id: "sortie-retry" }, result());
      assert.equal(contract.status, "done");
    } else if (exit === "drop") {
      assert.deepEqual(cmdDrop(s, ctx, { v: "drop", contract: contract.id }), { ok: true });
      assert.equal(contract.status, "cancelled");
    } else {
      s.clock.day = contract.deadlineDay + 1;
      contractsDaily7(s, ctx);
      assert.equal(contract.status, "failed");
    }
  }
});

test("非作戰護送友軍死亡不算敵方頭數、不回收屍體或戰利品", () => {
  const { s, ctx, sortie, contract, mech } = fixture(), battle = result();
  const escort = instantiateMech(ctx.db, `${sortie.id}/escort-0`, "frame/bio-nestmother");
  escort.owner = "player";
  const enemy = structuredClone(s.mechs[mech]!); enemy.id = "enemy-unit"; enemy.owner = "enemy";
  battle.units.push({ id: escort.id, status: "dead", state: escort }, { id: enemy.id, status: "dead", state: enemy });
  battle.events = [escort.id, enemy.id].map((unit, seq) => ({ seq, round: 1, type: "UnitDied", payload: { unit } }));
  battle.loot.push({ fromUnit: escort.id, components: [], materials: { scrap: 3 } });
  const scrap = s.ledger.balances["stock:scrap"];
  applyBattleResult(s, ctx, sortie, battle);
  assert.deepEqual(contract.heads, { [`${sortie.id}/${enemy.id}`]: 1 });
  assert.equal(s.rifts[sortie.rift!]!.phase, "anchored");
  assert.equal(s.pendingChoices.length, 0);
  assert.equal(s.ledger.balances["stock:scrap"], scrap);
  assert.equal(s.mechs[escort.id], undefined);
});

test("玩家明確回收材料走ledger，重複來源與重結算不重領，撤退仍保留", () => {
  const { s, ctx, sortie } = fixture(), battle = result();
  battle.winner = "enemy"; battle.reason = "withdrew";
  const before = s.ledger.balances["stock:scrap"]!;
  const pickup = { fromUnit: "wreck-source", owner: "player" as const, collected: true, components: [], materials: { scrap: 5 } };
  battle.loot.push(pickup, structuredClone(pickup), { fromUnit: pickup.fromUnit, components: [], materials: { scrap: 5 } });
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(s.ledger.balances["stock:scrap"], before + 5);
  assert.deepEqual(checkLedger(s), []);
  const after = structuredClone(s);
  applyBattleResult(s, ctx, sortie, battle);
  assert.deepEqual(s, after);
});

test("回收容量不足只存可容納材料，其餘stash於出戰地點", () => {
  const { s, ctx, sortie } = fixture(), battle = result();
  const used = s.inventory.components.length + s.inventory.relics.length + Object.entries(s.ledger.balances)
    .filter(([key]) => key.startsWith("stock:") && key !== "stock:fuel").reduce((sum, [, amount]) => sum + amount, 0);
  s.ship.capacity.cargo = used + 2;
  const before = s.ledger.balances["stock:flesh"] ?? 0;
  battle.loot.push({ fromUnit: "corpse-source", owner: "player", collected: true, components: [], materials: { flesh: 5 } });
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(s.ledger.balances["stock:flesh"], before + 2);
  assert.ok(s.places[sortie.place!]!.wreckage.some(bundle => bundle.materials["stock:flesh"] === 3));
  assert.deepEqual(checkLedger(s), []);
});

test("已回收怪獸不再給拆／整屍選擇，非玩家回收也不入我方庫", () => {
  for (const owner of ["player", "enemy"] as const) {
    const { s, ctx, sortie } = fixture(), battle = result();
    const beast = instantiateMech(ctx.db, "collected-beast", "frame/bio-nestmother"); beast.owner = "enemy";
    battle.units.push({ id: beast.id, status: "dead", state: beast });
    battle.loot.push({ fromUnit: beast.id, owner, collected: true, components: [], materials: { flesh: 5 } });
    const before = s.ledger.balances["stock:flesh"] ?? 0;
    applyBattleResult(s, ctx, sortie, battle);
    assert.equal(s.pendingChoices.length, 0);
    assert.equal(s.ledger.balances["stock:flesh"] ?? 0, before + (owner === "player" ? 5 : 0));
  }
});

test("自機殘骸已轉材料回收不再發部件，非玩家材料不入庫或stash", () => {
  const { s, ctx, sortie, mech } = fixture(), battle = result();
  battle.units.push({ id: mech, status: "dead", state: structuredClone(s.mechs[mech]!) });
  battle.loot.push({ fromUnit: mech, owner: "enemy", collected: true, components: [], materials: { scrap: 5 } });
  const components = structuredClone(s.inventory.components), scrap = s.ledger.balances["stock:scrap"];
  const wreckage = structuredClone(s.places[sortie.place!]!.wreckage);
  applyBattleResult(s, ctx, sortie, battle);
  assert.deepEqual(s.inventory.components, components);
  assert.equal(s.ledger.balances["stock:scrap"], scrap);
  assert.deepEqual(s.places[sortie.place!]!.wreckage, wreckage);
});
