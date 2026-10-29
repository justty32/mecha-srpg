import { readFileSync } from "node:fs";
import { loadContentDirs } from "../../../../../src/content/loader.ts";
import { scenarioToSetup } from "../../../../../src/sim/run.ts";
import { createBattle } from "../../../../../src/rules/flow.ts";
import { startBattle } from "../../../../../src/rules/turn.ts";
import { tryCommand, abilitiesOf, checkAbility } from "../../../../../src/rules/command.ts";
import { hitChance, damageFactor } from "../../../../../src/rules/attack.ts";
import { resistance } from "../../../../../src/rules/resistance.ts";
import { commanderOf, distance, rt, terrainAt } from "../../../../../src/rules/state.ts";
import { movementBudget } from "../../../../../src/rules/movement.ts";
import { hashLog } from "../../../../../src/core/eventlog.ts";
import type { Command } from "../../../../../src/core/types-state.ts";
const input = process.argv[2];
const records = readFileSync(input!, "utf8").trim().split("\n").map(line => JSON.parse(line));
const trace = records.find(r => r.trace && r.seed === 7), expected = records.find(r => r.seed === 7 && r.casualties);
if (!trace || !expected) throw new Error("missing seed7 trace");
const base = loadContentDirs(["content/base"]).db;
const defs = new Map<string, ReturnType<typeof base.require<"bodyplan">>>();
if (trace.configuration === "coreHp") for (const [name, hp] of [["biped-standard", 38], ["biped-light", 45], ["insect-reaper", 30], ["ancient-warden", 60]] as const) {
  const def = structuredClone(base.require("bodyplan", `bodyplan/${name}`));
  const core = def.parts.find(p => p.functions.includes("core"))!;
  core.exposure = 2; core.layers.findLast(l => l.structural)!.hp = hp;
  defs.set(def.id, def);
}
const lookup = (kind: string, id: string) => kind === "bodyplan" ? defs.get(id.includes(":") ? id : `base:${id}`) : undefined;
const db = { ...base, require: ((kind: string, id: string) => lookup(kind, id) ?? base.require(kind as "frame", id)) as typeof base.require,
  get: ((kind: string, id: string) => lookup(kind, id) ?? base.get(kind as "frame", id)) as typeof base.get };
const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", 7, { rounds: 60 });
const state = createBattle(db, sim.setup, 7), ctx = { db, s: state };
startBattle(ctx);
for (const cmd of trace.commands as Command[]) {
  const tail = state.round >= Math.max(1, expected.rounds - 2);
  if (tail && cmd.actor === "player-2") {
    const actor = state.units[cmd.actor]!, pid = commanderOf(ctx, cmd.actor);
    const targets = Object.values(state.units).filter(u => u.owner !== actor.owner && rt(state).unitStatus[u.id] === "active");
    const choices = targets.flatMap(target => abilitiesOf(ctx, cmd.actor).map(ability => ({ target: target.id, ability,
      rejection: checkAbility(ctx, cmd.actor, ability, { unit: target.id }), distance: distance(actor.pos, target.pos), cover: terrainAt(ctx, target.pos).cover,
      chance: hitChance(ctx, cmd.actor, ability, target.id), damageFactor: damageFactor(ctx, cmd.actor, ability, target.id), resistance: resistance(ctx, cmd.actor, ability, target.id),
      targetParts: target.parts })));
    process.stdout.write(JSON.stringify({ round: state.round, command: cmd, actor: { movement: movementBudget(ctx, cmd.actor), pos: actor.pos, control: actor.controlMode, pools: actor.pools,
      person: pid ? { id: pid, pools: state.persons[pid]!.pools, morale: state.persons[pid]!.morale, contribs: state.persons[pid]!.contribs } : null }, choices }) + "\n");
  }
  const result = tryCommand(ctx, cmd);
  if (!result.ok) throw new Error(`replay rejected ${JSON.stringify(cmd)}:${result.rejection.code}`);
  if (tail) process.stdout.write(JSON.stringify({ round: state.round, command: cmd, events: result.events.filter(e => ["Hit", "Miss", "LayerDamaged", "UnitDied", "Moved"].includes(e.type)) }) + "\n");
}
const hash = hashLog(state.log);
if (hash !== expected.hash) throw new Error(`tail replay hash mismatch: ${hash} vs ${expected.hash}`);
process.stdout.write(JSON.stringify({ verifiedReplayHash: hash }) + "\n");
