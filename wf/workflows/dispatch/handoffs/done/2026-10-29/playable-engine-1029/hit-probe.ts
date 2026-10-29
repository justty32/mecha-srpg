import { loadContentDirs } from "../../../../../../../src/content/loader.ts";
import { scenarioToSetup } from "../../../../../../../src/sim/run.ts";
import { createBattle } from "../../../../../../../src/rules/flow.ts";
import { startBattle } from "../../../../../../../src/rules/turn.ts";
import { hitChance } from "../../../../../../../src/rules/attack.ts";
import { abilitiesOf, checkAbility } from "../../../../../../../src/rules/command.ts";
import { commanderOf, terrainAt } from "../../../../../../../src/rules/state.ts";
import { createRng, d100 } from "../../../../../../../src/core/rng.ts";
const base = loadContentDirs(["content/base"]).db;
const db = { ...base, rules: { ...base.rules, constants: { ...base.rules.constants } } };
const sim = scenarioToSetup(db, "scenario/nairobi-joint-cordon", 2108);
const state = createBattle(db, sim.setup, 2108), ctx = { db, s: state };
startBattle(ctx);
const target = "enemy-0";
const choice = Object.keys(state.units).filter(id => state.units[id]!.owner === "player").sort().flatMap(actor =>
  abilitiesOf(ctx, actor).filter(id => {
    const a = db.require("ability", id);
    return a.packets.length && a.target.friendly === "no" && ["unit", "part"].includes(a.target.kind) && a.partAim?.allowed;
  }).map(ability => ({ actor, ability })))[0];
if (!choice) throw new Error("scenario has no legal aimed weapon");
const { actor, ability } = choice;
const part = Object.keys(state.units[target]!.parts).find(id => !state.units[target]!.parts[id]!.broken)!;
const cases = [{ name: "ordinary-body", distance: 3, cover: false, aimed: false },
  { name: "precision-part", distance: 3, cover: false, aimed: true },
  { name: "far-cover", distance: 6, cover: true, aimed: false }];
const rows = cases.flatMap(c => {
  state.units[actor]!.pos = { x: 1, y: 1 }; state.units[target]!.pos = { x: 1 + c.distance, y: 1 };
  const plain = db.require("terrain", "terrain/plain").id;
  state.map.terrain.fill(plain);
  if (c.cover) state.map.terrain[1 * state.map.width + 1 + c.distance] = db.require("terrain", "terrain/rubble").id;
  return [0, 15].map(bonus => {
    db.rules.constants.attackAccuracyBonus = bonus;
    const rejection = checkAbility(ctx, actor, ability, { unit: target, ...(c.aimed ? { part } : {}) });
    if (rejection) throw new Error(JSON.stringify({ case: c.name, actor, ability, rejection }));
    const probability = hitChance(ctx, actor, ability, target, c.aimed ? part : undefined);
    let hits = 0;
    for (let seed = 1; seed <= 200; seed++) if (d100(createRng(seed)) < probability) hits++;
    return { case: c.name, actor, commander: commanderOf(ctx, actor), target, ability, part: c.aimed ? part : null,
      distance: c.distance, cover: terrainAt(ctx, state.units[target]!.pos).cover, bonus, probability, hits, samples: 200 };
  });
});
process.stdout.write(JSON.stringify({ scenario: sim.scenario, seed: 2108, rows }, null, 2) + "\n");
