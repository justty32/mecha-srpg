import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import { createRng, nextInt } from "../../src/core/rng.ts";
import type { BattleState, Command } from "../../src/core/types-state.ts";
import { createBattle, startBattle, currentActor, rt, tryCommand, previewCommand, abilitiesOf, checkAbility } from "../../src/rules/index.ts";
import type { BattleSetup, UnitInit } from "../../src/rules/index.ts";
import { runBattle, scenarioToSetup } from "../../src/sim/run.ts";

export const { db, errors } = loadContentDirs(["content/base"]);
assert.deepEqual(errors, []);
export const scenarioId = "scenario/skirmish-whitegloves";
export function sample(seed = 1, scenario = scenarioId) {
  const sim = scenarioToSetup(db, scenario, seed, { rounds: 3 });
  return { sim, run: runBattle({ db, sim, seed }) };
}

type Trajectory = { seed: number; setup: BattleSetup; commands: Command[]; states: BattleState[] };
let cached: Trajectory[] | undefined;

// 固定 20 seed，共享已保存的逐指令狀態；五個 test 各自檢查一項不變量。
export function trajectories(): Trajectory[] {
  if (cached) return cached;
  const started = Date.now();
  cached = Array.from({ length: 20 }, (_, i) => {
    const seed = i + 1, rng = createRng(seed, 313), units: UnitInit[] = [];
    const free = Array.from({ length: 6 }, (_, n) => ({ x: n % 2, y: Math.floor(n / 2) }));
    const count = 2 + nextInt(rng, 5);
    for (let n = 0; n < count; n++) {
      const id = `unit-${n}`, pos = free.splice(nextInt(rng, free.length), 1)[0]!;
      const owner = n % 2 === 0 ? "player" : "enemy";
      if (n % 2 && !(n === 1 && seed % 2)) {
        const species = nextInt(rng, 2) ? "species/tidewolf" : "species/nestmother";
        units.push({ id, owner, pos, monster: { species, grade: db.require("species", species).gradeRange[0]! } });
      } else {
        const frame = n % 2 ? "frame/hound-mk2" : nextInt(rng, 2) ? "frame/hound-mk2" : "frame/infantry";
        const seats = db.require("bodyplan", db.require("frame", frame).bodyPlan).parts.flatMap(p => p.seats ?? []);
        const seat = seats.find(s => s.accepts.includes("pilot"))!;
        units.push({ id, owner, pos, frame, persons: [{ id: `${id}-pilot`, def: "person/ren-kasai", seat: seat.id }],
          ...(frame === "frame/hound-mk2" ? { components: { "right-weapon": "component/autocannon-30" } } : {}) });
      }
    }
    const setup: BattleSetup = { id: `random-${seed}`, map: { width: 2, height: 3, fill: "terrain/plain", exits: [] },
      units, objectives: [], maxRounds: 5 };
    const s = createBattle(db, setup, seed), ctx = { db, s }, commands: Command[] = [];
    startBattle(ctx);
    const states = [structuredClone(s)];
    const actions = new Map<string, number>();
    for (let step = 0; step < 600 && !rt(s).outcome; step++) {
      const actor = currentActor(s);
      if (!actor) break;
      const candidates: Command[] = [{ kind: "end", actor }, { kind: "wait", actor }];
      const pos = s.units[actor]!.pos;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx || dy) candidates.push({ kind: "move", actor, path: [{ x: pos.x + dx, y: pos.y + dy }] });
      }
      for (const ability of abilitiesOf(ctx, actor)) {
        const def = db.require("ability", ability);
        if (def.mode !== "activated" && def.mode !== "sustained") continue;
        // 固定小情境維持 2–6 單位，只從不召喚的合法能力抽樣。
        if (def.tags.includes("spawn")) continue;
        for (const unit of Object.keys(s.units).sort()) {
          const target = def.target.kind === "self" ? undefined : { unit };
          if (checkAbility(ctx, actor, ability, target) === null) {
            // 攻擊候選加權仍由固定 RNG 抽取，讓小地圖涵蓋損傷與效果。
            for (let weight = 0; weight < 4; weight++) candidates.push({ kind: "useAbility", actor, ability, ...(target ? { target } : {}) });
          }
          if (def.target.kind === "self") break;
        }
      }
      const key = `${s.round}:${actor}`, acted = actions.get(key) ?? 0;
      // 移動規則容許「無進展但成功」；只抽真的走到目的地的路徑，每單位每輪十六次後結束。
      const legal = (acted >= 16 ? [{ kind: "end" as const, actor }] : candidates).filter(command => {
        const preview = previewCommand(ctx, command);
        if (!preview.result.ok) return false;
        if (command.kind !== "move") return true;
        const at = preview.state.units[actor]!.pos, to = command.path.at(-1)!;
        return at.x === to.x && at.y === to.y;
      });
      assert.ok(legal.length > 0);
      const command = legal[nextInt(rng, legal.length)]!;
      assert.ok(tryCommand(ctx, command).ok);
      commands.push(command);
      actions.set(key, acted + 1);
      states.push(structuredClone(s));
    }
    assert.ok(rt(s).outcome, `seed ${seed} 未跑完`);
    assert.ok(commands.length > 0);
    return { seed, setup, commands, states };
  });
  assert.ok(Date.now() - started < 30000, "隨機小情境生成超過 30 秒");
  return cached;
}
