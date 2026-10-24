import type { ContentDB } from "../../content/contentdb.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import type { SimSetup } from "../../sim/run.ts";

export function bigMapSim(db: ContentDB, size: number, seed: number): SimSetup {
  if (!Number.isSafeInteger(size) || size < 8) throw new Error("大地圖邊長必須是至少 8 的整數");
  const sim = scenarioToSetup(db, "scenario/skirmish-whitegloves", seed);
  const terrain = db.all("terrain").filter(t => !t.onEnter.length && !t.onTurnStart.length
    && Object.values(t.moveCost).some(cost => cost !== null));
  if (!terrain.length) throw new Error("內容包缺少可用地形");
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = i % size, y = Math.floor(i / size);
    const index = ((Math.floor(x / 8) + Math.floor(y / 8) + Math.trunc(seed)) % terrain.length + terrain.length) % terrain.length;
    return { at: { x, y }, terrain: terrain[index]!.id };
  });
  const players = sim.setup.units.filter(u => u.owner === "player").slice(0, 2);
  const enemies = sim.setup.units.filter(u => u.owner !== "player").slice(0, 2);
  players.forEach((u, i) => { u.pos = { x: 1, y: 1 + i * 2 }; });
  enemies.forEach((u, i) => { u.pos = { x: size - 2, y: size - 2 - i * 2 }; });
  // 出生點使用相同可步行地形，避免地形條紋讓測試單位無路可走。
  const floor = terrain.find(t => !t.blocksLos && Object.values(t.moveCost).every(cost => cost !== null)) ?? terrain[0]!;
  for (const u of [...players, ...enemies]) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) cells[(u.pos.y + dy) * size + u.pos.x + dx]!.terrain = floor.id;
  }
  return { ...sim, scenario: null, setup: { ...sim.setup, id: `debug-${size}-${seed}`, units: [...players, ...enemies],
    map: { width: size, height: size, fill: floor.id, cells, exits: [{ x: 0, y: 0 }, { x: size - 1, y: size - 1 }] } } };
}
