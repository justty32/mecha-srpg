import test from "node:test";
import assert from "node:assert/strict";
import { applyBattleResult } from "./apply.ts";
import { fixture, result } from "./test-support.ts";
import { greedy } from "../sim/policies.ts";
import { nextSpring, riftsDaily2 } from "../world/rifts.ts";
import { mercFixture, mercResult } from "../war/merc-fixture.ts";
import { forceUnitId, applyOperationBattle } from "../war/merc.ts";
import { relation } from "../war/relations.ts";
import { cmdAccept } from "../contracts/lifecycle.ts";

for (const outcome of ["win", "repelled", "withdrew", "timeout"] as const) test(`契約 ${outcome}：結案報酬或保留重打`, () => {
  const { s, ctx, sortie, contract, mech } = fixture(), battle = result();
  const own = structuredClone(s.mechs[mech]!);
  contract.terms = { total: 1000, advance: 100, perHead: 0 }; contract.paidAdvance = true;
  battle.units = [{ id: mech, status: outcome === "withdrew" ? "retreated" : "alive", state: own },
    { id: "enemy", status: outcome === "repelled" ? "retreated" : "alive", state: { ...own, owner: "enemy" } }];
  if (outcome === "withdrew") battle.winner = "enemy";
  if (outcome === "timeout") { battle.winner = null; battle.reason = "timeout"; }
  const cash = s.ledger.balances.cash;
  applyBattleResult(s, ctx, sortie, battle);
  const retry = outcome === "withdrew" || outcome === "timeout";
  assert.equal(contract.status, retry ? "active" : "done");
  assert.equal(s.ledger.balances.cash - cash, retry ? 0 : outcome === "repelled" ? 500 : 900);
  assert.equal(contract.consecutiveDraws, retry ? 1 : 0);
  if (retry) {
    applyBattleResult(s, ctx, { ...sortie, id: "retry" }, battle);
    assert.equal(contract.consecutiveDraws, 2);
    assert.deepEqual(greedy(s, ctx), { v: "drop", contract: contract.id });
  }
});

test("清剿擊退依死亡比率付 0.6 + 0.4 × killRatio，其他契約全額", () => {
  for (const template of ["contract/clear", "contract/seal"]) {
    const { s, ctx, sortie, contract, mech } = fixture(), battle = result();
    contract.template = ctx.world.require("contract", template).id;
    contract.terms = { total: 1000, advance: 0, perHead: 0 }; contract.heads = {};
    const own = structuredClone(s.mechs[mech]!);
    battle.units = ["dead", "retreated"].map((status, i) => ({ id: `enemy-${i}`, status: status as "dead" | "retreated", state: { ...own, owner: "enemy" } }));
    const cash = s.ledger.balances.cash;
    applyBattleResult(s, ctx, sortie, battle);
    assert.equal(contract.status, "done");
    assert.equal(s.ledger.balances.cash - cash, template === "contract/clear" ? 800 : 1000);
  }
});

for (const phase of ["opening", "anchored"] as const) test(`裂縫 ${phase} 擊退：關閉或跳過一次擴張`, () => {
  const { s, ctx, sortie } = fixture(), battle = result();
  const rift = s.rifts[sortie.rift!]!; rift.phase = phase;
  battle.reason = "repelled"; battle.winner = null;
  const due = nextSpring(s, ctx); rift.nextCheck = due;
  const cal = ctx.world.require("calendar", s.calendar), dom = s.clock.dom;
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(rift.phase, phase === "opening" ? "closed" : "anchored");
  if (phase === "anchored") {
    assert(rift.nextCheck > due);
    const zones = [...rift.zones], age = rift.anchorAge;
    s.clock.dom = (dom - 1 + due - s.clock.day) % cal.daysPerMonth + 1;
    s.clock.day = due; s.clock.phase = "spring";
    riftsDaily2(s, ctx);
    assert.deepEqual(rift.zones, zones); assert.equal(rift.anchorAge, age);
    const next = rift.nextCheck;
    s.clock.dom = (s.clock.dom - 1 + next - s.clock.day) % cal.daysPerMonth + 1; s.clock.day = next;
    riftsDaily2(s, ctx); assert.equal(rift.anchorAge, age + 1);
  }
});

test("seal 擊退仍守住裂縫", () => {
  const { s, ctx, sortie, contract } = fixture(), battle = result();
  contract.template = ctx.world.require("contract", "contract/seal").id;
  s.rifts[sortie.rift!]!.phase = "unanchored";
  battle.reason = "repelled"; battle.winner = null;
  applyBattleResult(s, ctx, sortie, battle);
  assert.equal(s.rifts[sortie.rift!]!.phase, "sealing"); assert.equal(contract.status, "done");
});

for (const side of ["actor", "target"] as const) test(`作戰發起方撤退：玩家站 ${side}，進度回退、士氣與關係下降、終局按邊結算`, () => {
  const f = mercFixture(), { s, ctx, op, c, other, model } = f;
  let so;
  if (side === "actor") so = f.sortie();
  else {
    assert(cmdAccept(s, ctx, { v: "accept", contract: other.id }).ok);
    // fixture 的出戰 helper 只預設 actor；沿用其編隊、換成已選 target 契約。
    c.status = "expired";
    so = { id: "target-sortie", day: s.clock.day, node: s.ship.at, trigger: "operation" as const,
      operation: op.id, contract: other.id, units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] };
    op.phase = "engage";
  }
  const selected = side === "actor" ? c : other, battle = mercResult();
  selected.merc!.terms.orders = [];
  op.progress = .6;
  const own = structuredClone(s.mechs[s.hangar.bays.find((id): id is string => !!id)!]!);
  const id = forceUnitId(so.id, side === "actor" ? "friend" : "enemy", model, 0);
  battle.units = [{ id, status: "retreated", state: { ...own, owner: side === "actor" ? "ally" : "enemy" } }];
  battle.winner = side === "actor" ? "enemy" : "player";
  const value = relation(s, op.actor, op.target.faction!)!.value;
  applyOperationBattle(s, ctx, so, battle);
  assert(Math.abs(op.progress - .4) < 1e-10); assert.equal(op.force.morale, -1);
  assert.equal(relation(s, op.actor, op.target.faction!)!.value, value - 1);
  assert.equal(selected.status, "active");
  applyOperationBattle(s, ctx, { ...so, id: "second" }, battle);
  assert.equal(op.force.morale, -2); assert.equal(op.phase, "failed");
  assert.equal(selected.status, side === "target" ? "done" : "failed");
});
