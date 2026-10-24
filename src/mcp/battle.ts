import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Command } from "../core/types-state.ts";
import type { Cell } from "../core/types-def.ts";
import { canonicalJson } from "../core/eventlog.ts";
import { createSession } from "../sim/session.ts";
import type { BattleSession } from "../sim/session.ts";
import { runBattle, scenarioToSetup } from "../sim/run.ts";
import type { SimSetup } from "../sim/run.ts";
import { createSave, serializeSave, parseSave } from "../sim/save.ts";
import { rejectionText } from "../ui-adapter/vm/text.ts";
import { BattleView, displayNumber, displayValues } from "./battle-view.ts";
import type { EventLine } from "./battle-view.ts";
import { isObject, validateSchema } from "./schema.ts";
import { okResult, ToolError } from "./tool.ts";
import type { JsonSchema, McpEnv, ToolDef } from "./tool.ts";

const str: JsonSchema = { type: "string" }, bool: JsonSchema = { type: "boolean" };
const integer: JsonSchema = { type: "integer", minimum: 0 }, positive: JsonSchema = { type: "integer", minimum: 1 };
const object = (properties: Record<string, JsonSchema>, required: string[] = []): JsonSchema & { type: "object" } =>
  ({ type: "object", properties, required, additionalProperties: false });
const cell = object({ x: integer, y: integer }, ["x", "y"]);
const actionSchema: JsonSchema = { anyOf: [
  object({ kind: { enum: ["move"] }, actor: str, path: { type: "array", items: cell } }, ["kind", "path"]),
  object({ kind: { enum: ["move"] }, actor: str, to: cell }, ["kind", "to"]),
  object({ kind: { enum: ["useAbility"] }, actor: str, ability: str, target: object({ unit: str, part: str, cell }) }, ["kind", "ability"]),
  object({ kind: { enum: ["wait", "end", "retreat", "eject"] }, actor: str }, ["kind"]),
] };
/** 同一台連續逐格移動的事件併成一行，省 token；其餘原樣。 */
export function mergeMoves(lines: EventLine[]): EventLine[] {
  const out: (EventLine & { steps?: number; who?: string })[] = [];
  for (const line of lines) {
    const m = /^(.+)移動至（\d+，\d+）(〔[^〕]*〕)?$/u.exec(line.text), last = out.at(-1);
    if (m && last && last.who === m[1]! + (m[2] ?? "") && last.round === line.round) { last.text = line.text; last.steps!++; continue; }
    out.push({ ...line, ...(m ? { who: m[1]! + (m[2] ?? ""), steps: 1 } : {}) });
  }
  return out.map(({ steps, who: _, ...l }) => steps && steps > 1 ? { ...l, text: `${l.text}（${steps} 步）` } : l);
}
/** 「輪到誰」一行；玩家回合附上座位人員的 ap，省一次 observe。 */
function turnLine(b: Battle): string {
  const s = b.session, status = b.view.status();
  if (status.outcome) return `戰鬥結束：${status.outcome.winner ? b.view.slotName(status.outcome.winner) : "平局"}（${status.outcome.reason}）`;
  const actor = status.current?.id, unit = actor ? s.state.units[actor] : undefined;
  const ap = status.current?.playerTurn && unit ? Object.values(unit.seats).flatMap(pid => {
    const pool = pid ? s.state.persons[pid]?.pools.ap : undefined;
    return pool ? [`${displayNumber(pool.cur)}/${displayNumber(pool.max)}`] : [];
  }).join("、") : "";
  return `輪到 ${actor ?? "無"} ${status.current?.name ?? ""}（${status.current?.playerTurn ? "玩家" : "AI"}${ap ? `，ap ${ap}` : ""}）`;
}
type Battle = { session: BattleSession; view: BattleView; sim: SimSetup; seed: number; playerSlot: string; spectate: boolean; autoAdvance: boolean; campaign?: boolean; applied?: boolean };
const turnKey = (s: BattleSession) => `${s.currentActor()}:${s.state.log.events.findLast(e => e.type === "TurnStart")?.seq}`;

/** pathTo 把地形與 AP 都折成 null；僅在失敗時用副本放寬 AP，再問相同規則。 */
function moveFailure(s: BattleSession, actor: string, to: Cell): string {
  const q = s.rulesQuery, state = s.state;
  if (!q.inBounds(state, to)) return "不可達：目標格超出地圖";
  const occupant = q.unitAt(state, to);
  if (occupant && occupant !== actor) return "目標格被佔";
  const copy = structuredClone(state), commander = q.commanderOf(copy, actor);
  const pool = commander ? copy.persons[commander]?.pools.ap : copy.units[actor]?.pools.ap;
  if (!pool) return "不可達：沒有移動資源";
  // 同時放寬正向與反向 AP 池；只做可達查詢，不執行指令或消耗 RNG。
  pool.cur = Number.MAX_SAFE_INTEGER / 4; pool.max = Number.MAX_SAFE_INTEGER / 2;
  return q.pathTo(copy, actor, to) ? "ap 不足：目標格超過本回合可移動範圍" : "不可達：路徑、地形或移動狀態不允許";
}

function advance(b: Battle, until = "human", max = 2000): number {
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
    const data = { id, playerSlot: b.playerSlot, spectate: b.spectate, autoAdvance: b.autoAdvance,
      ...b.view.status(), objectives: b.view.objectives(), globals: b.view.globals(), units: b.view.units(detail), ...(map ? { map: b.view.map(window) } : {}) };
    const turn = turnLine(b);
    // 每台的 summary 只放 text；JSON 不重複整段字串（也不重複 ascii 地圖），省一半 token。
    const json = { ...data, units: data.units.map(({ summary: _, ...u }) => u), ...(data.map ? { map: { window: data.map.window, legend: data.map.legend, terrainLegend: data.map.terrainLegend, cellWidth: data.map.cellWidth } } : {}) };
    const globals = Object.entries(data.globals).map(([key, value]) => `${key === "tide" ? "潮汐" : "光照"} ${value}`).join("；") || "無";
    return okResult(`${id} 第 ${data.round}/${data.rounds ?? "∞"} 輪；${turn}\n${data.objectives.map(o => o.text).join("\n")}\n全域效果：${globals}\n${data.units.map(u => u.summary).join("\n")}`
      + (data.map ? `\n${data.map.ascii}\n${data.map.key}\n${data.map.legend.map(u => `${u.glyph}=${u.id} ${u.name}`).join("；")}` : ""), json);
  };
  const register = (b: Battle) => { const id = `b${nextId++}`; battles.set(id, b); return observation(id, b); };
  return { get, build, observation, register, advance,
    find: (id: string) => battles.get(id), close: (id: string) => battles.delete(id) };
}
export type BattleHub = ReturnType<typeof createBattleHub>;

export function createBattleTools(env: McpEnv, hub: BattleHub = createBattleHub(env)): ToolDef[] {
  const { get, build, observation, register } = hub;
  const scenario = (name: string, seed?: number, rounds?: number) => {
    const db = env.battleDb(), def = db.get("scenario", name);
    if (!def) throw new ToolError(`找不到情境 ${name}；請呼叫 battle_list_scenarios。`);
    const actualSeed = seed ?? def.seed ?? 1;
    return { seed: actualSeed, sim: scenarioToSetup(db, def, actualSeed, { rounds }) };
  };
  const activity = (id: string, b: Battle, from: number, extra: Record<string, unknown> = {}) => {
    // 事件行只放 text（逐格移動併成一行）；JSON 只給計數與游標，完整事件用 battle_events。
    const lines = mergeMoves(b.view.events.filter(e => e.seq >= from)), events = lines.slice(0, 40), omitted = lines.length - events.length;
    const status = b.view.status();
    return okResult(`${events.map(e => `[${e.seq}] 第${e.round}輪 ${e.text}`).join("\n")}${omitted ? `\n另有 ${omitted} 行，請用 battle_events 讀取。` : ""}\n`
      + turnLine(b), { id, ...status, eventLines: lines.length, omitted, since: from, next: b.session.state.log.events.length, ...extra });
  };
  const tool = (name: string, description: string, properties: Record<string, JsonSchema>, required: string[], handler: ToolDef["handler"]): ToolDef =>
    ({ name, title: description.split("。")[0], description, inputSchema: object(properties, required), handler });
  return [
    tool("battle_list_scenarios", "列出戰鬥情境、地圖、陣營與目標。", {}, [], () => {
      const db = env.battleDb();
      const scenarios = db.all("scenario").map(sc => {
        const map = db.require("map", sc.map);
        return { id: sc.id, map: { width: map.width, height: map.height },
          slots: Object.entries(sc.slots).map(([slot, v]) => ({ slot, faction: v.faction, units: v.units.length })),
          rounds: sc.rounds ?? null, objectives: sc.objectives.map(o => o.kind) };
      });
      return okResult(scenarios.map(s => `${s.id} ${s.map.width}×${s.map.height} ${s.slots.map(v => `${v.slot}:${v.units}台`).join(" ")}`).join("\n"), { scenarios });
    }),
    tool("battle_new", "建立戰鬥。預設玩家 player、自動推進 AI；spectate 為全 AI 觀戰。", { scenario: str, seed: integer, playerSlot: str, spectate: bool, rounds: positive, autoAdvance: bool }, ["scenario"], args => {
      const { sim, seed } = scenario(args.scenario as string, args.seed as number | undefined, args.rounds as number | undefined);
      const slots = Object.keys(sim.setup.factions ?? {}).sort();
      const requested = args.playerSlot as string | undefined;
      if (requested !== undefined && !slots.includes(requested)) throw new ToolError(`不存在的 playerSlot：${requested}；可選 slot：${slots.join("、")}`);
      const playerSlot = requested ?? (slots.includes("player") ? "player" : slots[0]!);
      const b = build(sim, seed, playerSlot, (args.spectate as boolean | undefined) ?? false, (args.autoAdvance as boolean | undefined) ?? true);
      if (b.autoAdvance) advance(b, "human", Number.MAX_SAFE_INTEGER);
      return register(b);
    }),
    tool("battle_observe", "觀察戰況。brief 每台一行，full 含部位層；map 顯示 ASCII 地圖，未知格為 ?。", {
      id: str, detail: { enum: ["brief", "full"] }, map: bool, window: object({ x: integer, y: integer, w: positive, h: positive }, ["x", "y", "w", "h"]),
    }, ["id"], a => observation(a.id as string, get(a.id), a.detail as "brief" | "full" | undefined, a.map as boolean | undefined, a.window as { x: number; y: number; w: number; h: number } | undefined)),
    tool("battle_legal_actions", "列出可執行動作。moves 是可達格 \"x,y:AP成本\"，移動送 {kind:\"move\",to:{x,y}}；能力目標與 options 的 action 可原樣送給 battle_act。", { id: str, unit: str }, ["id"], a => {
      const b = get(a.id), s = b.session, q = s.rulesQuery, state = s.state, unit = (a.unit as string | undefined) ?? s.currentActor();
      if (unit && !state.units[unit]) throw new ToolError(`找不到單位：${unit}`);
      if (unit && !b.view.known(unit)) throw new ToolError("無法查詢不可見敵方的動作。");
      if (unit && unit !== s.currentActor() && !b.view.friendly(state.units[unit]!.owner)) {
        return okResult(`${unit}：不是此單位的回合；不提供敵方戰術細節。`, { actor: unit, playerTurn: false, moves: [], nearestEnemy: null, abilities: [], options: [] });
      }
      const legal = s.legalActions(unit);
      // 可達格壓成 "x,y:cost"（依 y、x 排序），送 battle_act 時套 moveAction 範本填 to。
      const moves = Object.entries(legal.reachable).map(([key, cost]) => { const [x, y] = key.split(",").map(Number); return { x: x!, y: y!, cost }; })
        .sort((a, b) => a.y - b.y || a.x - b.x).map(m => `${m.x},${m.y}:${m.cost}`);
      // 已知敵方（看得到的用現位置，看不到的用最後所見）中最近的一台，供「0 目標」說明。
      const nearest = unit ? b.view.units("brief").filter(u => q.hostile(state, unit, u.id) && (u.stale || q.isActive(state, u.id))).flatMap(u => {
        return [{ id: u.id, name: u.name, distance: q.distance(state.units[unit]!.pos, u.pos), stale: u.stale }];
      }).sort((a, b) => a.distance - b.distance)[0] ?? null : null;
      const noTarget = (range: { min: number; max: number }) => !nearest ? `射程 ${range.min}–${range.max}；尚未發現敵方`
        : `射程 ${range.min}–${range.max}；最近敵方 ${nearest.id} ${nearest.stale ? "最後所見" : ""}距離 ${nearest.distance}`
          + (nearest.distance > range.max ? "，需再接近" : nearest.distance < range.min ? "，太近" : "，射程內但視線受阻或目標條件不符");
      const abilities = unit ? q.abilitiesOf(state, unit).map(id => {
        const def = q.abilityDef(id), rejected = q.checkAbility(state, unit, id), range = q.abilityRange(state, unit, id);
        const targets = (legal.abilities.find(v => v.ability === id)?.targets ?? []).filter(t => !t.unit || b.view.known(t.unit)).map(target => ({
          target, name: target.unit ? b.view.name(target.unit) : "地圖格", partName: target.unit && target.part ? q.partDefs(state, target.unit).find(p => p.id === target.part)?.name : undefined,
          distance: q.distance(state.units[unit]!.pos, target.cell ?? state.units[target.unit ?? unit]!.pos),
          hitChance: target.unit ? displayNumber(q.hitChance(state, unit, id, target.unit, target.part)) : null,
          ...(target.unit ? { damageIfHit: displayNumber(def.packets.reduce((sum, packet) => {
            const sourceTags = [...q.unitTags(state, unit), ...def.tags], targetTags = q.unitTags(state, target.unit!);
            const factor = env.battleDb().rules.damageModifiers.filter(row => sourceTags.includes(row.sourceTag) && targetTags.includes(row.targetTag))
              .reduce((value, row) => value * row.factor, 1);
            return sum + Math.max(0, q.evalNum(state, packet.amount, unit, target.unit) * factor);
          }, 0)) } : {}),
          action: { kind: "useAbility", actor: unit, ability: id, target },
        }));
        const reason = def.mode === "passive" || def.mode === "reaction" ? "自動觸發能力"
          : unit !== s.currentActor() ? "不是此單位的回合" : !targets.length ? (rejected ? `${rejectionText(rejected.code)}${state.units[unit]!.cooldowns[id] ? `（剩 ${state.units[unit]!.cooldowns[id]}）` : ""}` : `沒有合法目標：${noTarget(range)}`) : null;
        // 能力效果一行：傷害包（類型 數值）與施加效果名，讓 agent 不必翻內容檔。
        const effectName = (ref: string | { effect: string }) => b.view.contentName("effect", typeof ref === "string" ? ref : ref.effect);
        const does = [...def.packets.map(p => `${p.type} ${displayNumber(typeof p.amount === "number" ? p.amount : q.evalNum(state, p.amount, unit))}`),
          ...def.effects.map(e => `${{ hit: "命中", miss: "未中", self: "自身", cell: "地格", always: "必定" }[e.on]}：${e.apply.map(effectName).join("、")}`)].join("；");
        return { id, name: b.view.contentName("ability", id), does, costs: def.costs.map(c => ({ pool: c.pool, owner: c.owner, amount: displayNumber(q.evalNum(state, c.amount, unit)) })),
          range, cooldown: state.units[unit]!.cooldowns[id] ?? 0, reason, targets };
      }) : [];
      const options = (["wait", "end", "retreat", "eject"] as const).filter(k => legal[k]).map(kind => ({ action: { kind, actor: unit! }, irreversible: kind === "retreat" || kind === "eject" }));
      return okResult(`${unit ?? "無行動者"}：${moves.length} 個可達格；${abilities.length ? abilities.map(v => `${v.name} ${v.targets.length}目標${v.reason ? `（${v.reason}）`
        : v.targets.length ? `：${v.targets.slice(0, 4).map(t => `${t.target.unit ?? `${t.target.cell?.x},${t.target.cell?.y}`}${t.partName ? `/${t.partName}` : ""}${t.hitChance === null ? "" : ` 命中 ${t.hitChance}%／約 ${t.damageIfHit}`}`).join("、")}${v.targets.length > 4 ? "…" : ""}` : ""}`).join("；") : "無能力"}；${options.map(o => `${o.action.kind}${o.irreversible ? "（不可逆）" : ""}`).join("、")}\n傷害為估算：傷害包 × 全域修正，未計部位減傷、抗性與暴擊。`,
        displayValues({ actor: unit, playerTurn: unit === s.currentActor() && s.isHumanTurn(), moves, moveAction: '{"kind":"move","to":{"x":X,"y":Y}}', nearestEnemy: nearest, abilities, options,
          damageEstimate: "傷害包 × 全域修正，未計部位減傷、抗性與暴擊" }));
    }),
    tool("battle_act", "執行 action。actor 可省略；move 可用 to 座標簡寫。", { id: str, action: actionSchema }, ["id", "action"], a => {
      const b = get(a.id), s = b.session, raw = a.action as Record<string, unknown>, ended = s.outcome();
      if (ended) throw new ToolError(`戰鬥已結束：${ended.winner ? b.view.slotName(ended.winner) : "平局"}（${ended.reason}）；可 battle_save 或 battle_close。`);
      const actor = (raw.actor as string | undefined) ?? s.currentActor();
      if (!actor || !s.state.units[actor]) throw new ToolError(`${rejectionText("bad-actor")}；請呼叫 battle_legal_actions。`);
      let cmd: Command;
      if (raw.kind === "move" && raw.to) {
        const path = s.rulesQuery.pathTo(s.state, actor, raw.to as Cell);
        if (!path) throw new ToolError(`${moveFailure(s, actor, raw.to as Cell)}；請呼叫 battle_legal_actions。`);
        cmd = { kind: "move", actor, path };
      } else cmd = { ...raw, actor } as Command;
      const from = s.state.log.events.length, result = b.view.track(() => s.submit(cmd));
      if (!result.ok) throw new ToolError(`${cmd.kind === "move" && ["bad-path", "no-locomotion"].includes(result.rejection.code) ? "不可達：路徑或移動部位不允許" : rejectionText(result.rejection.code)}；請呼叫 battle_legal_actions。`);
      const aiCommands = b.autoAdvance ? advance(b, "human", Number.MAX_SAFE_INTEGER) : 0;
      return activity(a.id as string, b, from, { command: cmd, aiCommands });
    }),
    tool("battle_step_ai", "推進 AI：command 一指令、unit 一台、human 到玩家、end 到結束（遇玩家仍停止）。", {
      id: str, until: { enum: ["command", "unit", "human", "end"] }, max: positive,
    }, ["id"], a => {
      const b = get(a.id), from = b.session.state.log.events.length;
      const commands = advance(b, a.until as string | undefined, a.max as number | undefined);
      return activity(a.id as string, b, from, { commands });
    }),
    tool("battle_auto", "全 AI 跑完戰鬥，回勝負、存活、事件計數與 sim 相同的 hash。", { scenario: str, seed: integer, rounds: positive }, ["scenario"], a => {
      const { sim, seed } = scenario(a.scenario as string, a.seed as number | undefined, a.rounds as number | undefined);
      const run = runBattle({ db: env.battleDb(), sim, seed }), state = run.state;
      const alive = Object.fromEntries(Object.keys(state.factions).sort().map(slot => [slot,
        Object.values(state.units).filter(u => u.owner === slot && state.rt?.unitStatus[u.id] === "active").length]));
      const eventCounts: Record<string, number> = {};
      for (const e of state.log.events) eventCounts[e.type] = (eventCounts[e.type] ?? 0) + 1;
      const outcome = state.rt?.outcome ?? null;
      const winnerName = outcome?.winner ? env.battleDb().get("faction", state.factions[outcome.winner]?.faction ?? "")?.name ?? outcome.winner : outcome ? "平局" : "未決";
      return okResult(`勝負：${winnerName}（${outcome?.reason ?? run.stopped}）；第 ${state.round} 輪；${run.commands.length} 指令；hash ${run.hash}`,
        { outcome, winner: outcome?.winner ?? null, reason: outcome?.reason ?? null, rounds: state.round, stopped: run.stopped, alive, eventCounts, commands: run.commands.length, hash: run.hash });
    }),
    tool("battle_save", "保存戰鬥。path 相對專案根或絕對；省略則回存檔字串。", { id: str, path: str }, ["id"], a => {
      const b = get(a.id);
      if (b.campaign) throw new ToolError("戰役出戰的戰鬥請用 campaign_save 存整個戰役");
      const save = createSave(env.battleDb(), { scenario: b.sim.scenario, seed: b.seed, commands: [...b.session.commands], setup: b.sim.setup });
      const text = JSON.stringify({ format: "mecha-srpg-mcp-battle/1", playerSlot: b.playerSlot, spectate: b.spectate,
        autoAdvance: b.autoAdvance, rounds: b.sim.setup.maxRounds ?? null, hash: b.session.hash(), save: JSON.parse(serializeSave(save)) });
      if (a.path !== undefined) {
        const path = resolve(env.root, a.path as string); writeFileSync(path, text);
        return okResult(`已保存 ${a.id} 至 ${path}`, { id: a.id, path, hash: b.session.hash() });
      }
      return okResult(`已保存 ${a.id}；將 save 字串傳給 battle_load。`, { id: a.id, save: text, hash: b.session.hash() });
    }),
    tool("battle_load", "從 save 字串或 path 重播存檔，驗證 AI 指令與 hash，建立新 session。", { save: str, path: str }, [], a => {
      if ((a.save === undefined) === (a.path === undefined)) throw new ToolError("save 與 path 必須擇一。");
      const source = a.save !== undefined ? a.save as string : readFileSync(resolve(env.root, a.path as string), "utf8");
      let wrapper: unknown;
      try { wrapper = JSON.parse(source); } catch { throw new ToolError("存檔不是合法 JSON；請傳入 battle_save 產生的完整 save 字串。"); }
      if (!isObject(wrapper) || wrapper.format !== "mecha-srpg-mcp-battle/1" || typeof wrapper.playerSlot !== "string"
        || typeof wrapper.spectate !== "boolean" || typeof wrapper.autoAdvance !== "boolean" || typeof wrapper.hash !== "string"
        || !(wrapper.rounds === null || typeof wrapper.rounds === "number" && Number.isSafeInteger(wrapper.rounds) && wrapper.rounds > 0)) throw new ToolError("存檔包裝格式不合。");
      const save = parseSave(JSON.stringify(wrapper.save));
      if (!save.scenario || !save.setup) throw new ToolError("存檔缺少 scenario／setup。");
      const currentPacks = createSave(env.battleDb(), { scenario: save.scenario, seed: save.seed, commands: [] }).contentPacks;
      if (canonicalJson(currentPacks) !== canonicalJson(save.contentPacks)) throw new ToolError("內容包版本／hash 不符。");
      const { sim } = scenario(save.scenario, save.seed, wrapper.rounds === null ? undefined : wrapper.rounds as number);
      sim.setup = save.setup;
      if (!Object.hasOwn(sim.setup.factions ?? {}, wrapper.playerSlot)) throw new ToolError("存檔 playerSlot 不存在。");
      const b = build(sim, save.seed, wrapper.playerSlot, wrapper.spectate, wrapper.autoAdvance);
      for (const [index, cmd] of save.commands.entries()) {
        const errors = validateSchema(actionSchema, cmd);
        if (errors.length) throw new ToolError(`存檔指令 ${index}：${errors.join("；")}`);
        if (b.session.isHumanTurn()) {
          const result = b.view.track(() => b.session.submit(cmd));
          if (!result.ok) throw new ToolError(`存檔指令 ${index}：${rejectionText(result.rejection.code)}`);
        } else {
          let step = b.view.track(() => b.session.stepAi());
          if (!step) step = b.view.track(() => b.session.stepAi());
          if (!step || canonicalJson(step.cmd) !== canonicalJson(cmd)) throw new ToolError(`存檔 AI 指令 ${index} 不一致。`);
        }
      }
      if (b.session.hash() !== wrapper.hash) throw new ToolError("存檔 hash 與重播結果不一致。");
      return register(b);
    }),
    tool("battle_events", "讀可見事件中文行。since 是含該序號的游標，next 可供下次查詢。", { id: str, since: integer, limit: positive }, ["id"], a => {
      const b = get(a.id), since = (a.since as number | undefined) ?? 0, limit = (a.limit as number | undefined) ?? 100;
      const available = b.view.events.filter(e => e.seq >= since), events = available.slice(0, limit);
      const next = Math.max(since, available.length > events.length ? events.at(-1)!.seq + 1 : b.session.state.log.events.length);
      return okResult(events.map(e => `[${e.seq}] 第${e.round}輪 ${e.text}`).join("\n") || "沒有新事件。", { events, next });
    }),
    tool("battle_close", "關閉戰鬥並釋放 session。", { id: str }, ["id"], a => {
      get(a.id); hub.close(a.id as string); return okResult(`已關閉 ${a.id}`, { id: a.id, closed: true });
    }),
  ];
}
