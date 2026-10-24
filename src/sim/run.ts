import type { ContentDB } from "../content/contentdb.ts";
import type { Id } from "../core/ids.ts";
import { cellKey } from "../core/ids.ts";
import type { Cell, FactionSlot, MapDef, ScenarioDef } from "../core/types-def.ts";
import type { BattleState, Command, PersonState } from "../core/types-state.ts";
import { createRng, nextInt } from "../core/rng.ts";
import { hashLog } from "../core/eventlog.ts";
import { createBattle, startBattle, currentActor, rt, battleResult } from "../rules/index.ts";
import type { BattleSetup, BattleResult, UnitInit } from "../rules/index.ts";
import { createFactionAI, startRound, runUnitTurn, observeEvents } from "../ai/index.ts";
import type { AiParams, FactionAI } from "../ai/index.ts";
import { createRulesQuery, createRulesExec } from "../ai/adapters/rules-adapter.ts";

export type PlayerSpec = { kind: "ai"; policy?: Id; params?: AiParams } | { kind: "script"; commands: Command[] };
export type SimSetup = { scenario: Id | null; setup: BattleSetup;
  slotProfiles: Record<FactionSlot, { policy: Id; params: AiParams }>;
  unitPolicies: Record<FactionSlot, Record<Id, Id>> };
export type RunOptions = { db: ContentDB; sim: SimSetup; seed: number;
  players?: Partial<Record<FactionSlot, PlayerSpec>>; maxSteps?: number };
export type RunResult = { state: BattleState; commands: Command[]; rejected: number;
  stopped: "outcome" | "stalled" | "maxSteps"; result: BattleResult | null; hash: string };

function mapCells(map: MapDef): NonNullable<BattleSetup["map"]["cells"]> {
  let glyphs: string[];
  if (typeof map.cells === "string") glyphs = [...map.cells];
  else {
    // SPEC-GAP：RLE 文法未定，採「正整數＋單一 glyph」，空白分隔可省略。
    glyphs = [];
    const encoded = map.cells.rle.replace(/\s+/gu, "");
    let consumed = "";
    for (const match of encoded.matchAll(/([1-9][0-9]*)([^0-9])/gu)) {
      consumed += match[0];
      const count = Number(match[1]);
      if (glyphs.length + count > map.width * map.height) throw new Error("RLE 超出地圖大小");
      glyphs.push(...Array<string>(count).fill(match[2]!));
    }
    if (consumed !== encoded) throw new Error("非法 RLE");
  }
  if (glyphs.length !== map.width * map.height) throw new Error("地圖格數不符");
  const cells: NonNullable<BattleSetup["map"]["cells"]> = glyphs.map((glyph, i) => {
    const terrain = map.legend[glyph];
    if (!terrain) throw new Error(`未知地圖 glyph：${glyph}`);
    return { at: { x: i % map.width, y: Math.floor(i / map.width) }, terrain };
  });
  // feature 後覆蓋 glyph 地形，hp 一併交規則層初始化；未指定則用地形預設。
  cells.push(...structuredClone(map.features ?? []));
  return cells;
}

export type DynamicScenario = ScenarioDef & { mapDef?: MapDef; personStates?: Record<Id, PersonState> };

export function scenarioToSetup(db: ContentDB, scenario: Id | DynamicScenario, seed: number, opts?: { rounds?: number }): SimSetup {
  const sc: DynamicScenario = typeof scenario === "string" ? db.require("scenario", scenario) : scenario;
  const map = sc.mapDef ?? db.require("map", sc.map), cells = mapCells(map), rng = createRng(seed);
  const occupied = new Set<string>();
  const valid = (at: Cell): boolean => Number.isInteger(at.x) && Number.isInteger(at.y)
    && at.x >= 0 && at.y >= 0 && at.x < map.width && at.y < map.height;
  for (const slot of Object.keys(sc.slots).sort()) for (const spawn of sc.slots[slot]!.units) {
    if (spawn.at === "zone") continue;
    const key = cellKey(spawn.at.x, spawn.at.y);
    if (!valid(spawn.at) || occupied.has(key)) throw new Error("非法固定部署格");
    occupied.add(key);
  }
  const units: UnitInit[] = [], slotProfiles: SimSetup["slotProfiles"] = {}, unitPolicies: SimSetup["unitPolicies"] = {};
  const factions: Record<FactionSlot, Id> = {}, allies: Record<FactionSlot, FactionSlot[]> = {};
  for (const slot of Object.keys(sc.slots).sort()) {
    const entry = sc.slots[slot]!;
    const faction = db.require("faction", entry.faction);
    factions[slot] = faction.id;
    allies[slot] = [...new Set([...(entry.allies ?? []), ...Object.keys(sc.slots).filter(other => {
      if (other === slot) return false;
      const peer = db.require("faction", sc.slots[other]!.faction);
      return faction.relations[peer.id] === "ally" || peer.relations[faction.id] === "ally";
    })])].sort();
    const profile = entry.ai ? db.require("aiprofile", entry.ai) : undefined;
    slotProfiles[slot] = { policy: profile?.policy ?? "tactical", params: { ...profile?.params } };
    unitPolicies[slot] = {};
    entry.units.forEach((spawn, index) => {
      const id = `${slot}-${index}`;
      let pos: Cell;
      if (spawn.at === "zone") {
        const available = (map.deployZones[slot] ?? []).filter(at => valid(at) && !occupied.has(cellKey(at.x, at.y)));
        if (!available.length) throw new Error(`部署區格數不足：${slot}`);
        pos = { ...available[nextInt(rng, available.length)]! };
        occupied.add(cellKey(pos.x, pos.y));
      } else pos = { ...spawn.at };
      const monster = spawn.monster ? db.require("monster", spawn.monster) : undefined;
      const body = monster ? db.require("species", monster.species).bodyPlan : db.require("frame", spawn.mech!).bodyPlan;
      const seats = db.require("bodyplan", body).parts.flatMap(part => part.seats ?? []);
      const used = new Set<string>();
      const persons = (spawn.persons ?? []).map(person => {
        const seat = seats.find(s => s.accepts.includes(person.seat) && !used.has(s.id));
        if (!seat) throw new Error(`缺少 ${person.seat} 座位：${id}`);
        used.add(seat.id);
        // SPEC-GAP：同一人物 Def 可重複出場，實例以單位＋座位識別。
        const state = sc.personStates?.[person.id];
        return state ? { id: state.id, def: state.def, seat: seat.id,
          state: structuredClone({ pools: state.pools, effects: state.effects, contribs: state.contribs,
            morale: state.morale, will: state.will, attrsBase: state.attrsBase, xp: state.xp, level: state.level }) }
          : { id: `${id}-${seat.id}`, def: person.id, seat: seat.id };
      });
      // ISS-001：情境給 components 就整組取代機體 defaultLoadout；id 一律解析成完整 id。
      const loadout = monster ? undefined : spawn.components ?? db.require("frame", spawn.mech!).defaultLoadout;
      const components = loadout ? Object.fromEntries(Object.keys(loadout).sort().map(s => [s, db.require("component", loadout[s]!).id])) : undefined;
      units.push({ id, owner: slot, pos, persons, ...(spawn.pools ? { pools: structuredClone(spawn.pools) } : {}),
        ...(components ? { components } : {}),
        ...(monster ? { monster: { species: monster.species, grade: spawn.grade ?? monster.grade, def: monster.id } } : { frame: spawn.mech! }) });
      if (monster) {
        const species = db.require("species", monster.species);
        unitPolicies[slot]![id] = db.require("aiprofile", species.aiProfile).policy;
      }
    });
  }
  // 內容 target 保留供作者辨識；規則只消費執行期 unit／units。
  const objectives = structuredClone(sc.objectives);
  for (const objective of objectives) {
    const target = objective.params.target;
    if (typeof target !== "string") continue;
    const matches = Object.keys(sc.slots).flatMap(slot => sc.slots[slot]!.units.flatMap((spawn, index) =>
      spawn.mech === target || spawn.monster === target ? [`${slot}-${index}`] : [])).sort();
    if (matches.length) objective.params.units = matches;
    else if (units.some(u => u.id === target)) objective.params.unit = target;
    else throw new Error(`objective 目標不存在：${target}`);
  }
  // SPEC-GAP：情境規則覆蓋尚無規則層入口。
  const setup: BattleSetup = { id: sc.id, factions, allies, map: { width: map.width, height: map.height,
    fill: cells[0]!.terrain, cells, exits: structuredClone(map.exits),
    ...(map.globals ? { globals: structuredClone(map.globals) } : {}) }, units, objectives };
  const rounds = opts?.rounds ?? sc.rounds;
  if (rounds !== undefined) {
    if (!Number.isInteger(rounds) || rounds < 1) throw new Error("rounds 必須是正整數");
    setup.maxRounds = rounds;
  }
  return { scenario: sc.id, setup, slotProfiles, unitPolicies };
}

export function runBattle(opts: RunOptions): RunResult {
  const { db, sim, seed } = opts, maxSteps = opts.maxSteps ?? 10000;
  if (!Number.isInteger(maxSteps) || maxSteps < 0) throw new Error("maxSteps 必須是非負整數");
  const state = createBattle(db, sim.setup, seed), q = createRulesQuery(db), exec = createRulesExec(db);
  const commands: Command[] = [], ais = new Map<string, FactionAI>(), cursors = new Map<string, number>();
  let rejected = 0, attempts = 0, round = -1;
  const limit = Symbol("maxSteps");
  const recording: typeof exec = (s, cmd) => {
    if (attempts >= maxSteps) throw limit;
    attempts++;
    const result = exec(s, cmd);
    if (result.ok) commands.push(structuredClone(cmd));
    else rejected++;
    return result;
  };
  let stopped: RunResult["stopped"] = "stalled";
  startBattle({ db, s: state });
  try {
    while (!rt(state).outcome) {
      if (attempts >= maxSteps) { stopped = "maxSteps"; break; }
      const actor = currentActor(state);
      if (actor === null) break;
      for (const slot of Object.keys(state.factions).sort()) {
        if (ais.has(slot) || opts.players?.[slot]?.kind === "script") continue;
        const player = opts.players?.[slot], profile = sim.slotProfiles[slot];
        const ai = createFactionAI({ slot, seed, policy: player?.policy ?? profile?.policy,
          params: { ...profile?.params, ...player?.params }, unitPolicies: sim.unitPolicies[slot] });
        ais.set(slot, ai);
        if (round === state.round) startRound(ai, q, state);
      }
      if (round !== state.round) {
        round = state.round;
        for (const ai of ais.values()) startRound(ai, q, state);
      }
      const slot = state.units[actor]!.owner, player = opts.players?.[slot];
      const from = state.log.events.length, before = commands.length;
      if (player?.kind === "script") {
        const cursor = cursors.get(slot) ?? 0;
        const cmd = player.commands[cursor] ?? { kind: "end", actor };
        cursors.set(slot, cursor + 1);
        recording(state, cmd);
      } else runUnitTurn(ais.get(slot)!, q, state, actor, recording);
      for (const [otherSlot, ai] of ais) if (otherSlot !== slot) observeEvents(ai, q, state, state.log.events.slice(from));
      if (commands.length === before && currentActor(state) === actor) break;
    }
  } catch (error) {
    if (error !== limit) throw error;
    stopped = "maxSteps";
  }
  if (rt(state).outcome) stopped = "outcome";
  const result = battleResult({ db, s: state });
  if (result) result.events = structuredClone(state.log.events);
  return { state, commands, rejected, stopped, result, hash: hashLog(state.log) };
}
