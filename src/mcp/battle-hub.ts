import { createSession } from "../sim/session.ts";
import type { BattleSession } from "../sim/session.ts";
import type { SimSetup } from "../sim/run.ts";
import { BattleView, displayNumber } from "./battle-view.ts";
import { okResult, ToolError } from "./tool.ts";
import type { McpEnv } from "./tool.ts";

/** 「輪到誰」一行；玩家回合附上座位人員的 ap，省一次 observe。 */
export function turnLine(b: Battle): string {
  const s = b.session, status = b.view.status();
  if (status.outcome) return `戰鬥結束：${status.outcome.winner ? b.view.slotName(status.outcome.winner) : "平局"}（${status.outcome.reason}）`;
  const actor = status.current?.id, unit = actor ? s.state.units[actor] : undefined;
  const ap = status.current?.playerTurn && unit ? Object.values(unit.seats).flatMap(pid => {
    const pool = pid ? s.state.persons[pid]?.pools.ap : undefined;
    return pool ? [`${displayNumber(pool.cur)}/${displayNumber(pool.max)}`] : [];
  }).join("、") : "";
  return `輪到 ${actor ?? "無"} ${status.current?.name ?? ""}（${status.current?.playerTurn ? "玩家" : "AI"}${ap ? `，ap ${ap}` : ""}）`;
}
export type Battle = { session: BattleSession; view: BattleView; sim: SimSetup; seed: number; playerSlot: string; spectate: boolean; autoAdvance: boolean; campaign?: boolean; applied?: boolean };
const turnKey = (s: BattleSession) => `${s.currentActor()}:${s.state.log.events.findLast(e => e.type === "TurnStart")?.seq}`;

export function advance(b: Battle, until = "human", max = 2000): number {
  const s = b.session, before = s.commands.length, key = turnKey(s);
  let retried = false;
  while (!s.outcome() && !s.isHumanTurn() && s.currentActor() !== null && s.commands.length - before < max) {
    const step = b.view.track(() => s.stepAi());
    if (!step) { if (retried) break; retried = true; continue; }
    retried = false;
    if (until === "command" || (until === "unit" && turnKey(s) !== key)) break;
  }
  return s.commands.length - before;
}

/** 一個 server 共用流水號與 session；獨立工具組仍可各自建立 hub。 */
export function createBattleHub(env: McpEnv) {
  const battles = new Map<string, Battle>();
  let nextId = 1;
  const get = (id: unknown): Battle => {
    const b = battles.get(String(id));
    if (!b) throw new ToolError(`找不到戰鬥 ${String(id)}；請先呼叫 battle_new。`);
    return b;
  };
  const build = (sim: SimSetup, seed: number, playerSlot: string, spectate: boolean, autoAdvance: boolean): Battle => {
    const session = createSession({ db: env.battleDb(), sim, seed, human: spectate ? [] : [playerSlot], maxSteps: Number.MAX_SAFE_INTEGER });
    return { session, sim, seed, playerSlot, spectate, autoAdvance, view: new BattleView(session, playerSlot, spectate) };
  };
  const observation = (id: string, b: Battle, detail: "brief" | "full" = "brief", map = false, window?: { x: number; y: number; w: number; h: number }) => {
    const sc = b.sim.scenario ? env.battleDb().get("scenario", b.sim.scenario) : undefined;
    const metadata = { ...(sc?.name !== undefined ? { name: sc.name } : {}), ...(sc?.brief !== undefined ? { brief: sc.brief } : {}) };
    const data = { id, ...metadata, playerSlot: b.playerSlot, spectate: b.spectate, autoAdvance: b.autoAdvance,
      ...b.view.status(), objectives: b.view.objectives(), globals: b.view.globals(), units: b.view.units(detail), ...(map ? { map: b.view.map(window) } : {}) };
    const turn = turnLine(b);
    // 每台的 summary 只放 text；JSON 不重複整段字串（也不重複 ascii 地圖），省一半 token。
    const json = { ...data, units: data.units.map(({ summary: _, ...u }) => u), ...(data.map ? { map: { window: data.map.window, legend: data.map.legend, terrainLegend: data.map.terrainLegend, cellWidth: data.map.cellWidth } } : {}) };
    const globals = Object.entries(data.globals).map(([key, value]) => `${key === "tide" ? "潮汐" : "光照"} ${value}`).join("；") || "無";
    return okResult(`${sc?.name !== undefined ? `${sc.name}\n` : ""}${sc?.brief !== undefined ? `${sc.brief}\n` : ""}${id} 第 ${data.round}/${data.rounds ?? "∞"} 輪；${turn}\n${data.objectives.map(o => o.text).join("\n")}\n全域效果：${globals}\n${data.units.map(u => u.summary).join("\n")}`
      + (data.map ? `\n${data.map.ascii}\n${data.map.key}\n${data.map.legend.map(u => `${u.glyph}=${u.id} ${u.name}`).join("；")}` : ""), json);
  };
  const register = (b: Battle) => { const id = `b${nextId++}`; battles.set(id, b); return observation(id, b); };
  return { get, build, observation, register, advance,
    find: (id: string) => battles.get(id), close: (id: string) => battles.delete(id) };
}
export type BattleHub = ReturnType<typeof createBattleHub>;

