import { test } from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "./load.ts";
import { newCampaign, createOpsCtx } from "./start.ts";
import { evalOpsCond, evalOpsNum } from "./cond.ts";
import { applyOpsEffect, applyOpsEffects } from "./opseffect.ts";
import { checkLedger } from "../state/ledger.ts";

function fixture() {
  const { db, world } = loadWorldDirs(["content/base"]), s = newCampaign(db, world, "start/default", 7);
  return { s, db, world, ctx: createOpsCtx(s, db, world) };
}
test("cond：core 表達式與營運 ref 根共同求值", () => {
  const { s, ctx } = fixture();
  assert.equal(evalOpsNum(s, ctx, { product: [2, { ref: "ledger.balances.cash" }] }), 2400);
  assert.equal(evalOpsNum(s, ctx, { ref: "calendar.daysToNextSpring" }), 14);
  assert.equal(evalOpsNum(s, ctx, { ref: "debt.ratio" }), 1);
  assert.equal(evalOpsNum(s, ctx, { ref: "flags.absent" }), 0);
  assert.equal(evalOpsCond(s, ctx, { all: [{ tag: "opening-funeral" }, { cmp: { a: { ref: "restraint.beastCount" }, op: "==", b: 0 } }] }), true);
  assert.equal(evalOpsCond(s, ctx, { cmp: { a: { ref: "campaign.pressure" }, op: ">", b: 0 } }), false);
  const person = Object.keys(s.roster.persons).sort()[0]!;
  assert.equal(evalOpsNum(s, ctx, { ref: "person.level" }, { person }), 1);
  assert.throws(() => evalOpsNum(s, ctx, { ref: "battle.round" }));
  assert.throws(() => evalOpsNum(s, ctx, { ref: "campaign.missing" }));
});
test("opseffect：帳本、聲望、旗標、心情與工時", () => {
  const { s, ctx } = fixture();
  assert.equal(applyOpsEffects(s, ctx, [{ ledger: { account: "cash", delta: 50, reason: "event" } }, { rep: { issuer: 200 } },
    { flag: "paid" }, { mood: { all: -10 } }, { techHours: 4 }], { faction: "base:faction-ops/migrant-crew" }), true);
  assert.equal(s.ledger.balances.cash, 1250);
  assert.equal(s.factions["base:faction-ops/migrant-crew"]!.rep, 100);
  assert.equal(s.flags.paid, 1); assert.equal(s.techHours, 4);
  assert.ok(Object.values(s.roster.employment).every(e => e.mood === -3));
  assert.deepEqual(checkLedger(s), []);
  const before = structuredClone(s);
  assert.equal(applyOpsEffect(s, ctx, { ledger: { account: "stock:flesh", delta: -100, reason: "devour" } }), false);
  assert.deepEqual(s, before);
});
test("opseffect：節點、裂縫、命名、核心效果與延後生成佇列", () => {
  const { s, ctx } = fixture();
  const mech = Object.keys(s.mechs).sort()[0]!, person = Object.keys(s.roster.persons).sort()[0]!;
  s.rifts["rift-100"] = { id: "rift-100", node: s.ship.at, family: "insect", width: "C", phase: "opening", openedDay: 0, anchorAge: 0, zones: [], fedCount: 0, nextCheck: 14 };
  const patch = { flags: ["visited"] };
  applyOpsEffects(s, ctx, [{ setNode: { id: "node/dhaka", patch } }, { setRift: { id: "rift-100", patch: { phase: "anchored" } } },
    { nameMech: { mech, name: "迦樓羅", by: person } }, { applyEffect: { target: "person", id: person, effect: "effect/injury-concussion" } },
    { spawnContract: "contract/clear", near: "territory" }, { spawnEvent: "event/ruin-entry" }]);
  patch.flags.push("caller-change");
  assert.deepEqual(s.nodes[s.ship.at]!.flags, ["visited"]);
  assert.equal(s.rifts["rift-100"]!.phase, "anchored");
  assert.equal(s.roster.names[mech]![0]!.name, "迦樓羅");
  assert.equal(s.roster.persons[person]!.effects[0]!.remaining, 3);
  assert.equal(s.roster.persons[person]!.contribs.length, 1);
  applyOpsEffect(s, ctx, { applyEffect: { target: "person", id: person, effect: "effect/injury-concussion" } });
  assert.equal(s.roster.persons[person]!.effects.length, 1);
  assert.deepEqual(s.pendingContracts, [{ template: "base:contract/clear", near: "territory" }]);
  assert.deepEqual(s.pendingEvents, ["base:event/ruin-entry"]);
  assert.deepEqual(s.contracts, {}); assert.deepEqual(s.pendingChoices, []);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
});
