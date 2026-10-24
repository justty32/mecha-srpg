import { rebuildBlightIndex } from "../world/blight.ts";
import { placeAt } from "../war/loc.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { readPackDir } from "../../content/loader.ts";
import { loadWorldDirs, loadWorldPacks } from "../content/load.ts";
import { createOpsCtx, newCampaign } from "../content/start.ts";
import { instantiateMech } from "../content/instantiate.ts";
import { applyOpsEffects, stiffen } from "../content/opseffect.ts";
import { clock } from "../state/clock.ts";
import { checkLedger, post } from "../state/ledger.ts";
import { eventRef } from "../state/events.ts";
import type { Account, Sortie } from "../state/types.ts";
import { applyBattleResult } from "../sortie/apply.ts";
import { result } from "../sortie/test-support.ts";
import { applyCommand } from "../time/commands.ts";
import { checkWorld } from "../content/check.ts";
import { admitBeast, cmdDevour, restraintDaily5 } from "./restraint.ts";
import { cmdQueue, workqueueDaily5 } from "./workqueue.ts";

function setup(family?: "alien" | "mycelium") {
  const pack = readPackDir("content/base");
  if (family) (pack.files["species/tidewolf.json"] as { family: string }).family = family;
  const { db, world } = family ? loadWorldPacks([pack]) : loadWorldDirs(["content/base"]);
  const s = newCampaign(db, world, "start/default", 7), ctx = createOpsCtx(s, db, world);
  s.pendingChoices = [];
  const day = (n: number) => { s.clock = clock(n, world.require("calendar", s.calendar)); };
  const stock = (account: Account, n: number) => post(s, ctx, { account, delta: n - (s.ledger.balances[account] ?? 0), reason: "fixture", ref: eventRef(ctx.emit("Fixture", { amount: n })) });
  const add = (frame = "frame/bio-mite", id = "beast-test") => { const mech = instantiateMech(db, id, frame); assert(admitBeast(s, ctx, mech)); return s.restraint.beasts[id]!; };
  return { s, ctx, db, world, day, stock, add };
}

test("捕獲入拘束艙並登記，A 級沿用野生二名", () => {
  for (const [frame, epithet] of [["frame/bio-mite", undefined], ["frame/bio-nestmother", "千囊房東"]] as const) {
    const { s, ctx } = setup(), battle = result(), captured = instantiateMech(ctx.db, "enemy-0", frame);
    const sortie: Sortie = { id: "capture-test", day: 0, place: placeAt(s, ctx, s.ship.pos), loc: structuredClone(s.ship.pos), trigger: "ambush", units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] };
    battle.units.push({ id: captured.id, status: "captured", state: captured });
    applyBattleResult(s, ctx, sortie, battle);
    const id = s.restraint.slots[0]!, beast = s.restraint.beasts[id]!;
    assert.equal(beast.kind, "live"); assert.equal(beast.wear, 0); assert.equal(beast.vitality, 100);
    assert.equal(s.hangar.bays.includes(id), false); assert.match(s.roster.names[id]![0]!.name, /^蟲-\d+$/);
    assert.equal(s.roster.names[id]![0]!.kind, "registry");
    assert.equal(s.roster.names[id]!.find(n => n.kind === "epithet")?.name, epithet);
    if (epithet) assert.equal(s.roster.names[id]!.find(n => n.kind === "epithet")?.by, "wild");
  }
});
test("每日磨損依等級與傷勢，滿值推三選且 choose 硬壓回 60", () => {
  const { s, ctx, add, day } = setup(), d = add(), a = add("frame/bio-nestmother", "beast-a");
  day(1); restraintDaily5(s, ctx); assert.equal(d.wear, 3); assert.equal(a.wear, 15);
  s.mechs[d.mech]!.parts.body!.layers[0]!.hp--; day(2); restraintDaily5(s, ctx); assert.equal(d.wear, 7.5);
  d.wear = 49; day(3); restraintDaily5(s, ctx); assert(s.log.some(e => e.type === "WearWarning" && e.payload.mech === d.mech));
  d.wear = 99; day(4); restraintDaily5(s, ctx);
  assert.equal(s.pendingChoices[0]!.choices.length, 3); assert(s.log.some(e => e.type === "BrokeLoose"));
  const chosen = applyCommand(s, ctx.db, ctx.world, { v: "choose", choice: 1 });
  assert(chosen.result.ok); assert.equal(chosen.state.restraint.beasts[d.mech]!.wear, 60); assert.equal(chosen.state.flags.restraintHoursOwed, 8);
});
test("restrain job 材料開工一次扣，完成磨損歸零", () => {
  const { s, ctx, add, stock } = setup(), beast = add(); beast.wear = 70;
  stock("stock:scrap", 20);
  assert(cmdQueue(s, ctx, { v: "queue", job: { kind: "restrain", target: beast.mech } }).ok);
  workqueueDaily5(s, ctx); assert.equal(beast.wear, 0); assert.equal(s.ledger.balances["stock:scrap"], 18); assert.equal(s.jobs.length, 0);
  assert.deepEqual(checkLedger(s), []);
});
test("投屍扣 flesh 且帳本守恆，錯過第一大潮減 25、同月第二大潮不扣", () => {
  const { s, ctx, add, day, stock } = setup(), beast = add(); stock("stock:flesh", 4);
  assert(cmdDevour(s, ctx, { v: "devour", beast: beast.mech, amount: 1 }).ok);
  assert.equal(s.ledger.balances["stock:flesh"], 3); assert.deepEqual(checkLedger(s), []);
  day(28); restraintDaily5(s, ctx); assert.equal(beast.vitality, 100);
  day(56); restraintDaily5(s, ctx); assert.equal(beast.vitality, 75);
  day(70); restraintDaily5(s, ctx); assert.equal(beast.vitality, 75);
});
test("活性歸零 Stiffened 並同位轉整屍", () => {
  const { s, ctx, add, day } = setup(), beast = add(), slot = s.restraint.slots.indexOf(beast.mech);
  beast.vitality = 25; day(28); restraintDaily5(s, ctx);
  assert.equal(s.restraint.slots[slot], beast.mech); assert.equal(s.restraint.beasts[beast.mech], undefined);
  assert.equal(s.restraint.carcasses[0]!.slot, slot); assert.equal(s.restraint.carcasses[0]!.id, beast.mech);
  assert(s.log.some(e => e.type === "Stiffened"));
});
test("mount 無核不開工，扣核與 scrap 後完成 corpse 機體；整屍選項拆優先", () => {
  const { s, ctx, add, stock } = setup(), beast = add(); stiffen(s, ctx, beast.mech);
  stock("stock:scrap", 30); stock("stock:core-D", 0);
  assert(cmdQueue(s, ctx, { v: "queue", job: { kind: "mount", target: beast.mech } }).ok);
  const ledger = structuredClone(s.ledger); workqueueDaily5(s, ctx); assert.equal(s.jobs[0]!.paid, false); assert.deepEqual(s.ledger, ledger);
  stock("stock:core-D", 1); workqueueDaily5(s, ctx);
  assert.equal(s.jobs[0]!.paid, true); assert.equal(s.ledger.balances["stock:core-D"], 0); assert.equal(s.ledger.balances["stock:scrap"], 10);
  workqueueDaily5(s, ctx); workqueueDaily5(s, ctx);
  const id = s.restraint.slots[0]!;
  assert.equal(s.restraint.beasts[id]!.kind, "corpse"); assert.match(s.mechs[id]!.frame, /frame\/corpse-mite$/);
  assert.equal(s.mechs[id]!.pools.instinct, undefined); assert(Object.hasOwn(s.mechs[id]!.seats, "pilot"));
  assert.equal(ctx.db.require("frame", s.mechs[id]!.frame).burden, 0); assert(s.log.some(e => e.type === "Mounted")); assert.deepEqual(checkLedger(s), []);
  const battle = result(), dead = instantiateMech(ctx.db, "enemy-0", "frame/bio-mite"); dead.owner = "enemy";
  battle.units.push({ id: dead.id, state: dead, status: "dead" }); battle.loot.push({ fromUnit: dead.id, components: [], materials: { flesh: 1 } });
  applyBattleResult(s, ctx, { id: "dead-test", day: 0, place: placeAt(s, ctx, s.ship.pos), loc: structuredClone(s.ship.pos), trigger: "ambush", units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] }, battle);
  assert.equal(s.pendingChoices[0]!.choices[0]!.text, "拆");
  assert(applyOpsEffects(s, ctx, s.pendingChoices[0]!.choices[1]!.effects)); assert.equal(s.restraint.carcasses.length, 1);
});
test("異形 tide-soak 蝕化或同節點 anchored 回滿，錯過減 20", () => {
  const { s, ctx, add, day } = setup("alien"), beast = add("frame/bio-tidewolf");
  beast.vitality = 60; s.patches["test-patch"] = { id: "test-patch", rift: "test-rift", map: s.ship.pos.map, cells: [s.ship.pos.cell], sinceDay: 0 }; rebuildBlightIndex(s);
  day(28); restraintDaily5(s, ctx); assert.equal(beast.vitality, 100);
  delete s.patches["test-patch"]; rebuildBlightIndex(s); day(56); restraintDaily5(s, ctx); assert.equal(beast.vitality, 80);
  s.rifts.test = { id: "test", site: placeAt(s, ctx, s.ship.pos)!, at: structuredClone(s.ship.pos), family: "alien", width: "D", phase: "anchored", openedDay: 0, anchorAge: 0, patches: [], fedCount: 0, nextCheck: 0 };
  day(84); restraintDaily5(s, ctx); assert.equal(beast.vitality, 100);
});
test("菌房每潮月排 prune，未完成 layers 增長；keymap 重鍵載入拒絕", () => {
  const { s, ctx, add, day } = setup("mycelium"); add("frame/bio-tidewolf");
  day(28); restraintDaily5(s, ctx); assert.equal(s.jobs.filter(j => j.kind === "prune").length, 1);
  day(56); restraintDaily5(s, ctx); assert.equal(s.restraint.myceliumRoom!.layers, 1);
  restraintDaily5(s, ctx); assert.equal(s.restraint.myceliumRoom!.layers, 1);
  assert(s.log.some(e => e.type === "MyceliumOvergrown")); workqueueDaily5(s, ctx); assert.equal(s.restraint.myceliumRoom!.layers, 0);
  const pack = readPackDir("content/base"), keymap = pack.files["world/keymap-ops.json"] as { bindings: { action: string; keys: string[]; label: string; context: string }[] };
  keymap.bindings.push({ ...keymap.bindings[0]!, action: "duplicate" });
  const bad = loadWorldPacks([pack]); assert(bad.errors.some(e => e.message.includes("duplicate"))); assert(checkWorld(bad.db, bad.world).errors.some(e => e.includes("duplicate")));
  keymap.bindings.pop(); const good = loadWorldPacks([pack]); assert.deepEqual(good.errors, []); assert.deepEqual(checkWorld(good.db, good.world).errors, []);
});
