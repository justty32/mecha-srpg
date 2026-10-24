import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../sortie/test-support.ts";
import { applyCommand } from "../time/index.ts";
import { createOpsCtx } from "../content/start.ts";
import { greedy } from "./policies.ts";

test("greedy 不派核心、腿、武器毀損或無彈機，沒有能戰鬥的機甲就等待", () => {
  for (const damage of ["torso", "legs", "right-arm", "weapon", "ammo", "empty", "working"] as const) {
    const { s, ctx, mech, contract } = fixture();
    s.ship.at = contract.target.node;
    const unit = s.mechs[mech]!;
    if (damage === "ammo") unit.pools["ammo-30"]!.cur = 0;
    else if (damage === "empty") unit.parts["right-arm"]!.components["right-weapon"] = null;
    else if (damage === "weapon") {
      const layer = unit.parts["right-arm"]!.layers.at(-1)!; layer.hp = 0; layer.broken = true;
    } else if (damage !== "working") unit.parts[damage]!.broken = true;
    if (damage === "working") s.jobs.push({ id: "working", kind: "repair", target: mech, part: "torso", layer: 0,
      needHours: 2, doneHours: 1, materials: {}, paid: true, priority: 0 });
    const cmd = greedy(s, ctx);
    assert.equal(cmd.v, "sortie", damage);
    if (cmd.v !== "sortie") throw new Error("expected sortie");
    assert.ok(cmd.sortie.units!.length > 0);
    assert.ok(cmd.sortie.units!.every(u => u.mech !== mech), damage);
    s.hangar.bays = [mech];
    assert.deepEqual(greedy(s, ctx), { v: "wait", days: 1 }, damage);
  }
});

test("greedy 對受損層排 repair／rebuild，交給既有 queue 計價且不重複排程", () => {
  for (const hp of [25, 0]) {
    const { s, ctx, mech } = fixture();
    s.hangar.bays = [mech];
    s.mechs[mech]!.parts.legs!.layers[0]!.hp = hp;
    s.mechs[mech]!.parts.legs!.broken = hp === 0;
    const before = structuredClone(s), cmd = greedy(s, ctx);
    assert.deepEqual(s, before);
    assert.deepEqual(cmd, { v: "queue", job: { kind: hp === 0 ? "rebuild" : "repair", target: mech, part: "legs", layer: 0 } });
    const queued = applyCommand(s, ctx.db, ctx.world, cmd);
    assert.equal(queued.result.ok, true);
    assert.equal(queued.state.jobs.length, 1);
    assert.ok(queued.state.jobs[0]!.needHours > 0);
    assert.ok(Object.values(queued.state.jobs[0]!.materials).some(n => n! > 0));
    assert.notEqual(greedy(queued.state, createOpsCtx(queued.state, ctx.db, ctx.world)).v, "queue");
  }
});
