import test from "node:test";
import assert from "node:assert/strict";
import { applyBattleResult } from "./apply.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { checkLedger } from "../state/ledger.ts";
import { fixture, result } from "./test-support.ts";

test("alive 機甲以差分保留戰前損傷，不補滿", () => {
  const { s, ctx, sortie, mech, person } = fixture(), battle = result();
  const full = structuredClone(s.mechs[mech]!), part = Object.keys(full.parts).sort()[0]!;
  const max = full.parts[part]!.layers[0]!.hp;
  s.mechs[mech]!.parts[part]!.layers[0]!.hp = max - 7;
  full.parts[part]!.layers[0]!.hp = max - 3;
  battle.units.push({ id: mech, status: "alive", state: full });
  const p = structuredClone(s.roster.persons[person]!);
  s.roster.persons[person]!.pools.hp!.cur -= 4;
  p.pools.hp!.cur -= 2;
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
