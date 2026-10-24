// ISS-001 情境裝配：UnitSpawn.components 與 FrameDef.defaultLoadout（scenarioToSetup 接上、載入器驗相容）。
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs, loadPacks, readPackDir } from "../../src/content/loader.ts";
import { createBattle, startBattle, abilitiesOf } from "../../src/rules/index.ts";
import { scenarioToSetup } from "../../src/sim/run.ts";

const { db: base } = loadContentDirs(["content/base"]);
// 找一台有座位、有槽、且有兩種相容部件的機體（全從內容列舉，不寫死 id）。
const pick = (() => {
  for (const frame of base.all("frame").sort((a, b) => a.id < b.id ? -1 : 1)) {
    for (const part of base.require("bodyplan", frame.bodyPlan).parts) for (const slot of part.slots) {
      const fits = base.all("component").filter(c => c.slot === slot.type && c.abilities.length > 0).sort((a, b) => a.id < b.id ? -1 : 1);
      if (fits.length >= 2) return { frame, slot: slot.id, a: fits[0]!, b: fits[1]!,
        other: base.all("component").find(c => c.slot !== slot.type)! };
    }
  }
  throw new Error("內容包沒有可裝兩種部件的槽");
})();
const map = base.all("map").sort((a, b) => a.width * a.height - b.width * b.height)[0]!;

function pack(frameExtra: Record<string, unknown>, spawns: Record<string, unknown>[]) {
  const { id: _id, ...frame } = structuredClone(pick.frame) as unknown as Record<string, unknown>;
  const files: Record<string, unknown> = {
    "pack.json": { id: "ltest", version: "0.0.1", depends: ["base"] },
    "frames/lt-frame.json": { ...frame, id: "frame/lt-frame", ...frameExtra },
    "scenarios/lt-scen.json": { id: "scenario/lt-scen", map: map.id, objectives: [], slots: {
      player: { faction: base.ids("faction").sort()[0], units: spawns.map((s, i) => s.monster ? { at: { x: i, y: 0 }, ...s } : { mech: "ltest:frame/lt-frame", at: { x: i, y: 0 }, ...s }) },
      enemy: { faction: base.ids("faction").sort()[0], units: [{ mech: "ltest:frame/lt-frame", at: { x: 0, y: map.height - 1 } }] } } },
  };
  return loadPacks([readPackDir("content/base"), { root: "ltest", files }]);
}

test("ISS-001：未給 components 套 defaultLoadout；給了整組取代（含空物件＝不裝）", () => {
  const { db, errors } = pack({ defaultLoadout: { [pick.slot]: pick.a.id } },
    [{}, { components: {} }, { components: { [pick.slot]: pick.b.id } }]);
  assert.deepEqual(errors, []);
  const setup = scenarioToSetup(db, "ltest:scenario/lt-scen", 1).setup;
  const [d, empty, custom] = setup.units.filter(u => u.owner === "player");
  assert.deepEqual(d!.components, { [pick.slot]: pick.a.id });
  assert.deepEqual(empty!.components ?? {}, {});
  assert.deepEqual(custom!.components, { [pick.slot]: pick.b.id });
  // 敵方也吃 defaultLoadout；開戰後部件能力可用。
  const enemy = setup.units.find(u => u.owner === "enemy")!;
  assert.deepEqual(enemy.components, { [pick.slot]: pick.a.id });
  const s = createBattle(db, setup, 1), ctx = { db, s };
  startBattle(ctx);
  for (const ability of pick.a.abilities) assert.ok(abilitiesOf(ctx, d!.id).includes(db.require("ability", ability).id));
  for (const ability of pick.b.abilities) assert.ok(abilitiesOf(ctx, custom!.id).includes(db.require("ability", ability).id));
});

test("ISS-001：載入器擋下不存在的槽、槽型不符、怪獸 spawn 帶 components", () => {
  const badSlot = pack({ defaultLoadout: { "no-such-slot": pick.a.id } }, [{}]);
  assert.ok(badSlot.errors.some(e => /defaultLoadout/.test(e.path) && /slot/.test(e.message)), JSON.stringify(badSlot.errors));
  const badType = pack({}, [{ components: { [pick.slot]: pick.other.id } }]);
  assert.ok(badType.errors.some(e => /components/.test(e.path) && /slot type/.test(e.message)), JSON.stringify(badType.errors));
  const missing = pack({ defaultLoadout: { [pick.slot]: "base:component/no-such-thing" } }, [{}]);
  assert.ok(missing.errors.length > 0);
  const monster = pack({}, [{ monster: base.ids("monster").sort()[0], components: { [pick.slot]: pick.a.id } }]);
  assert.ok(monster.errors.some(e => /components/.test(e.path)), JSON.stringify(monster.errors));
});
