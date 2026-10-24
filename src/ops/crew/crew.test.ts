import { test } from "node:test";
import assert from "node:assert/strict";
import { loadWorldDirs } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { clock } from "../state/clock.ts";
import { eventRef } from "../state/events.ts";
import { checkLedger, post } from "../state/ledger.ts";
import type { Account, CampaignState } from "../state/types.ts";
import { applyName, cmdAccompany, cmdHire, cmdPay, cmdQueue, cmdReorder, cmdWake,
  ledgerDaily6, openSoulNode, recruitsDaily7, soulDaily5, workqueueDaily5 } from "./index.ts";
import { crew, rules } from "./shared.ts";
import { leave } from "./roster.ts";

const { db, world } = loadWorldDirs(["content/base"]);
function setup() {
  const s = newCampaign(db, world, "start/default", 7), ctx = createOpsCtx(s, db, world);
  s.clock = clock(1, world.require("calendar", s.calendar));
  return { s, ctx };
}
function balance(s: CampaignState, account: Account, value: number): void {
  const ctx = createOpsCtx(s, db, world), ref = eventRef(ctx.emit("Fixture", { account }));
  assert.equal(post(s, ctx, { account, delta: value - (s.ledger.balances[account] ?? 0), reason: "fixture", ref }), true);
}
function ancient(s: CampaignState) {
  const id = "ancient-test", by = Object.keys(s.roster.persons).sort()[0]!;
  s.mechs[id] = instantiateMech(db, id, "frame/ancient-rearguard"); s.hangar.dormant.push(id);
  s.roster.persons[by]!.will.resonance[s.mechs[id]!.frame] = 1; s.flags["held-the-line"] = 1;
  return { id, by };
}
function soul(s: CampaignState) { return Object.keys(s.roster.persons).sort().find(id => s.roster.persons[id]!.will.soulTree)!; }

test("wages：全團等比例欠薪、mood −1 且不受名冊順序影響", () => {
  const { s, ctx } = setup(), due = Object.values(s.roster.employment).reduce((sum, e) => sum + e.wage / 28, 0);
  balance(s, "cash", due / 2); const other = structuredClone(s);
  other.roster.employment = Object.fromEntries(Object.entries(other.roster.employment).reverse());
  ledgerDaily6(s, ctx); ledgerDaily6(other, createOpsCtx(other, db, world));
  for (const e of Object.values(s.roster.employment)) { assert.equal(e.owed, e.wage / 56); assert.equal(e.mood, -1); }
  assert.deepEqual(s, other); assert.deepEqual(checkLedger(s), []);
});
test("wages：只有大潮第 1 天把月息入 debt", () => {
  const { s, ctx } = setup(), principal = s.ledger.balances.debt;
  s.clock = clock(14, world.require("calendar", s.calendar)); ledgerDaily6(s, ctx); assert.equal(s.ledger.balances.debt, principal);
  s.clock = clock(28, world.require("calendar", s.calendar)); ledgerDaily6(s, ctx);
  assert.equal(s.ledger.balances.debt, principal * (1 + rules(ctx).interestRate));
  assert.equal(s.log.filter(e => e.type === "InterestPosted").length, 1); assert.deepEqual(checkLedger(s), []);
});
test("wages：cmdPay 對沖兩筆、拒絕不變且 checkLedger 空", () => {
  const { s, ctx } = setup(), before = s.ledger.entries.length, cash = s.ledger.balances.cash, debt = s.ledger.balances.debt;
  assert.deepEqual(cmdPay(s, ctx, { v: "pay", account: "debt", amount: 100 }), { ok: true });
  assert.equal(s.ledger.entries.length, before + 2); assert.equal(s.ledger.balances.cash, cash - 100); assert.equal(s.ledger.balances.debt, debt - 100);
  assert.equal(s.ledger.entries.at(-2)!.counter, "debt"); assert.equal(s.ledger.entries.at(-1)!.counter, "cash"); assert.deepEqual(checkLedger(s), []);
  const snapshot = structuredClone(s); assert.equal(cmdPay(s, ctx, { v: "pay", account: "debt", amount: cash * 2 }).ok, false); assert.deepEqual(s, snapshot);
});
test("workqueue：每日工時先灌 priority 小者並支援重排", () => {
  const { s, ctx } = setup(), mech = Object.keys(s.mechs).sort()[0]!, part = s.mechs[mech]!.parts.torso!;
  part.layers[0]!.hp -= 10;
  assert.equal(cmdQueue(s, ctx, { v: "queue", job: { kind: "repair", target: mech, part: "torso", layer: 0, priority: 0 } }).ok, true);
  assert.equal(cmdQueue(s, ctx, { v: "queue", job: { kind: "research", target: "research/soul-heart", priority: 5 } }).ok, true);
  const repair = s.jobs[0]!, research = s.jobs[1]!;
  assert.equal(cmdReorder(s, ctx, { v: "reorder", job: research.id, priority: -1 }).ok, true);
  workqueueDaily5(s, ctx); assert.equal(research.doneHours, 8); assert.equal(repair.doneHours, 0); assert.equal(repair.paid, false);
  assert.equal(cmdReorder(s, ctx, { v: "reorder", job: repair.id, priority: -2 }).ok, true);
  workqueueDaily5(s, ctx); assert.equal(s.jobs.some(j => j.id === repair.id), false); assert.equal(research.doneHours, 11);
  assert.equal(part.layers[0]!.hp, 60); assert.deepEqual(checkLedger(s), []);
});
test("workqueue：材料不足不開工、不扣任一材料或幣", () => {
  const { s, ctx } = setup(), target = Object.keys(s.mechs).sort()[0]!;
  s.mechs[target]!.parts.torso!.layers[0]!.hp = 1; balance(s, "stock:scrap", 0);
  assert.equal(cmdQueue(s, ctx, { v: "queue", job: { kind: "repair", target, part: "torso", layer: 0 } }).ok, true);
  const ledger = structuredClone(s.ledger); workqueueDaily5(s, ctx);
  assert.equal(s.jobs[0]!.paid, false); assert.equal(s.jobs[0]!.doneHours, 0); assert.deepEqual(s.ledger, ledger);
});
test("workqueue：結構歸零 rebuild 工時 ×3、材料 ×2", () => {
  const { s, ctx } = setup(), target = Object.keys(s.mechs).sort()[0]!, mech = s.mechs[target]!;
  const template = db.require("bodyplan", db.require("frame", mech.frame).bodyPlan).parts.find(p => p.layers.some(l => l.structural))!;
  const layer = template.layers.findIndex(l => l.structural), def = template.layers[layer]!, coeff = world.all("job").find(j => j.hoursPerHp?.[def.type] !== undefined)!;
  mech.parts[template.id]!.layers[layer]!.hp = 0;
  assert.equal(cmdQueue(s, ctx, { v: "queue", job: { kind: "rebuild", target, part: template.id, layer } }).ok, true);
  assert.equal(s.jobs[0]!.needHours, def.hp * coeff.hoursPerHp![def.type]! * 3);
  assert.equal(s.jobs[0]!.materials[coeff.material![def.type]!], def.hp * coeff.perHp![def.type]! * 2);
});
test("soul：科研工時與付幣完成後開節點，mastery 為零", () => {
  const { s, ctx } = setup(), id = soul(s), before = structuredClone(s);
  assert.equal(openSoulNode(s, ctx, id, "heart-1").ok, false); assert.deepEqual(s, before);
  assert.equal(cmdQueue(s, ctx, { v: "queue", job: { kind: "research", target: "research/soul-heart" } }).ok, true);
  for (let i = 0; i < 7; i++) workqueueDaily5(s, ctx);
  const research = world.require("research", "research/soul-heart"); assert.equal(s.research[research.id]!.done, true);
  assert.equal(s.ledger.balances.cash, 1200 - research.cost.coin);
  assert.equal(openSoulNode(s, ctx, id, "heart-1").ok, true); assert.equal(s.roster.mastery[id]!["heart-1"], 0);
  assert.ok(s.roster.persons[id]!.will.soulTree!.nodes.includes("heart-1")); assert.deepEqual(checkLedger(s), []);
});
test("soul：每天限一時段、陪伴累積 mastery 永不超過 1", () => {
  const { s, ctx } = setup(), id = soul(s), by = Object.keys(s.roster.persons).sort()[0]!;
  for (let day = 1; day <= 30; day++) {
    s.clock = clock(day, world.require("calendar", s.calendar));
    assert.equal(cmdAccompany(s, ctx, { v: "accompany", soul: id, by, node: "calc-1" }).ok, true);
    const before = structuredClone(s); assert.equal(cmdAccompany(s, ctx, { v: "accompany", soul: id, by }).ok, false); assert.deepEqual(s, before);
    soulDaily5(s, ctx); assert.ok(s.roster.mastery[id]!["calc-1"]! <= 1);
  }
  assert.equal(s.roster.mastery[id]!["calc-1"], 1); assert.equal(s.roster.trust[id]![by], 30); assert.equal(s.roster.persons[id]!.will.soulTree!.companionship, 30);
});
test("names：非大潮 cmdWake 被拒且整個 state 不變", () => {
  const { s, ctx } = setup(), { id, by } = ancient(s), before = structuredClone(s);
  assert.deepEqual(cmdWake(s, ctx, { v: "wake", shell: id, by }), { ok: false, error: "not-spring-night" }); assert.deepEqual(s, before);
});
test("names：喚成功推三候選＋自填 Prompt，applyName 記名與 Named 事件", () => {
  const { s, ctx } = setup(), { id, by } = ancient(s); s.clock = clock(14, world.require("calendar", s.calendar));
  assert.equal(cmdWake(s, ctx, { v: "wake", shell: id, by }).ok, true);
  assert.equal(s.pendingChoices.length, 1); assert.equal(s.pendingChoices[0]!.choices.length, 4);
  assert.equal(new Set(s.pendingChoices[0]!.choices.slice(0, 3).map(c => c.text)).size, 3);
  assert.equal(crew(s).bonds[id]!.person, by); assert.equal(s.hangar.dormant.includes(id), false);
  assert.equal(applyName(s, ctx, id, by, "守望者").ok, true);
  assert.deepEqual(s.roster.names[id], [{ name: "守望者", by, day: s.clock.day, kind: "title" }]);
  assert.equal(s.pendingChoices.length, 0); assert.deepEqual(s.log.at(-1)!.payload, { mech: id, by, index: 0 }); assert.equal(s.log.at(-1)!.type, "Named");
});
test("recruit：弦月候選決定性，聘金入帳、名冊多一人且 id 可重播", () => {
  const first = setup(), second = setup();
  for (const { s, ctx } of [first, second]) {
    const existing = Object.keys(s.roster.persons).find(id => s.roster.persons[id]!.def === db.require("person", "person/chen-xiaohai").id)!;
    leave(s, ctx, existing);
    s.clock = clock(6, world.require("calendar", s.calendar)); recruitsDaily7(s, ctx);
    const candidate = crew(s).candidates[Object.keys(crew(s).candidates).sort()[0]!]!, count = Object.keys(s.roster.persons).length, cash = s.ledger.balances.cash;
    assert.equal(cmdHire(s, ctx, { v: "hire", candidate: candidate.id }).ok, true);
    assert.equal(Object.keys(s.roster.persons).length, count + 1); assert.equal(s.ledger.balances.cash, cash - candidate.fee); assert.deepEqual(checkLedger(s), []);
  }
  assert.deepEqual(first.s, second.s);
});

test("recruit：名冊與各池候選的人物定義不重複；抽空的池保持空白", () => {
  const { s, ctx } = setup();
  s.clock = clock(6, world.require("calendar", s.calendar)); recruitsDaily7(s, ctx);
  const roster = new Set(Object.values(s.roster.persons).map(p => p.def));
  const defs = Object.values(crew(s).candidates).map(c => c.person.def);
  assert.ok(defs.every(def => !roster.has(def)));
  assert.equal(new Set(defs).size, defs.length);
  assert.equal(Object.values(crew(s).candidates).filter(c => c.pool === world.require("recruit", "recruit/dhaka").id).length, 0);
});
