// 營運畫面只傳可供決策的摘要；指令紀錄與完整狀態留在 session。
import type { CampaignEvent, CampaignState, OpsCommand, Screen, Sortie } from "../ops/state/types.ts";
import type { BattleResult, sortieBattleSetup } from "../ops/sortie/index.ts";
import { render, eventLog, entityName, VERBS, describeRoom, roomDefinition } from "../ops/text/index.ts";
import type { McpEnv } from "./tool.ts";
import { createOpsCtx } from "../ops/content/start.ts";
import { shortestPath } from "../ops/world/travel.ts";
import { instantiateMech } from "../ops/content/instantiate.ts";
import { evalOpsCond } from "../ops/content/cond.ts";
import type { CrewState } from "../ops/crew/index.ts";
import { researchReady } from "../ops/crew/research.ts";
import { marketPrice, cmdTrade } from "../ops/world/index.ts";
import type { MarketState } from "../ops/world/index.ts";

export const money = (value: number): string => value.toFixed(2);
// 只格式化呈現；原始數值、cmd、重播 blob 不經此函式。
export function displayText(text: string): string {
  return text.replace(/(?<![\w/.-])-?\d+\.\d+(?:e[+-]?\d+)?(?![\w/.-])/giu, value => money(Number(value)));
}
export function campaignName(env: McpEnv, state: CampaignState, id: string): string {
  const { db, world } = env.world(), person = state.roster.persons[id];
  const resource = ({ "stock:fuel": "燃料", "stock:scrap": "廢料", "stock:flesh": "血肉材料", "stock:chitin": "甲殼材料", "ammo-30": "凡鐵彈藥" } as Record<string, string>)[id];
  if (resource) return resource;
  const named = entityName(id, state, world);
  if (state.roster.names[id]?.length) return named;
  if (person) return db.get("person", person.def)?.name ?? named;
  const frame = state.mechs[id]?.frame ?? id;
  const frameName = db.get("frame", frame)?.name;
  if (state.mechs[id] && frameName && Object.values(state.mechs).filter(m => m.frame === frame).length > 1) return `${frameName}（${id}）`;
  const monster = db.get("monster", id);
  return db.get("frame", frame)?.name ?? monster?.name ?? (monster ? db.get("species", monster.species)?.name : undefined) ?? db.get("species", id)?.name
    ?? db.get("component", id)?.name ?? db.get("person", id)?.name ?? named;
}
function personName(env: McpEnv, state: CampaignState, id: string): string {
  const name = campaignName(env, state, id);
  return Object.keys(state.roster.persons).filter(p => campaignName(env, state, p) === name).length > 1 ? `${name}（${id}）` : name;
}
export function mechInfo(env: McpEnv, state: CampaignState, id: string) {
  const { db } = env.world(), mech = state.mechs[id]!, frame = db.require("frame", mech.frame), body = db.require("bodyplan", frame.bodyPlan);
  const equipment = Object.entries(mech.parts).flatMap(([part, p]) => Object.entries(p.components).flatMap(([slot, id]) => {
    if (!id) return [];
    const def = state.inventory.components.find(c => c.id === id)?.def ?? id;
    return [{ part, slot, id, def, name: campaignName(env, state, def) }];
  }));
  const fresh = instantiateMech(db, id, mech.frame, Object.fromEntries(equipment.map(c => [c.slot, c.def])));
  return { id, name: campaignName(env, state, id), frame: mech.frame, frameName: frame.name,
    pilot: mech.seats.pilot ? personName(env, state, mech.seats.pilot) : "未派駕駛", seats: { ...mech.seats }, controlMode: mech.controlMode,
    dormant: state.hangar.dormant.includes(id), equipment,
    parts: Object.entries(mech.parts).map(([id, p]) => ({ id, name: body.parts.find(d => d.id === id)?.name ?? id, broken: p.broken,
      layers: p.layers.map((l, i) => { const max = l.maxHp ?? fresh.parts[id]?.layers[i]?.hp ?? 0;
        return { hp: l.hp, max, percent: max > 0 ? Math.round(l.hp / max * 10000) / 100 : 0, broken: l.broken || l.hp <= 0 }; }) })),
    pools: Object.entries(mech.pools).map(([id, p]) => ({ id, cur: p.cur, max: p.max })),
    repairs: state.jobs.filter(j => j.target === id && ["repair", "rebuild"].includes(j.kind)).map(j => ({ ...j })),
  };
}
function mechText(m: ReturnType<typeof mechInfo>): string {
  return `${m.name}（${m.frameName}）｜駕駛 ${m.pilot}${m.dormant ? "；休眠" : ""}\n` +
    `部位：${m.parts.map(p => `${p.name}${p.broken ? "[損毀]" : ""} ${p.layers.map(l => `${l.percent}%${l.broken ? "[損毀]" : ""}`).join("/")}`).join("；")}\n` +
    `裝備：${m.equipment.map(c => c.name).join("、") || "無"}；彈藥／資源：${m.pools.map(p => `${p.id} ${p.cur}/${p.max}`).join("、") || "無"}；待修：${m.repairs.map(j => `${j.kind} ${j.part ?? "全機"} ${j.doneHours}/${j.needHours}工時`).join("、") || "無"}`;
}
export function promptInfo(screen: Screen) {
  const prompt = screen.prompt;
  if (!prompt) return undefined;
  const choices = prompt.choices.map(c => ({ ...c, cmd: { v: "choose" as const, choice: c.n } }));
  return { text: prompt.text, choices, summary: `要先 choose：${prompt.text}\n${choices.map(c => `${c.n}. ${c.text}${c.disabled ? `（停用：${c.disabled}）` : ""} ${JSON.stringify(c.cmd)}`).join("\n")}` };
}
export function screenText(env: McpEnv, state: CampaignState, screen: Screen): string {
  const labels: Record<string, string> = { ledger: "帳本", roster: "人員", rifts: "裂縫", queue: "工單", ship: "船舶", beasts: "拘束艙", names: "命名" };
  return [`${screen.room.title}｜出口：${screen.room.exits.join("、") || "無"}`, ...screen.room.desc,
    ...Object.entries(screen.panels).filter(([, rows]) => rows.length).map(([key, rows]) => `${labels[key] ?? key}：${rows.map(row => {
      if (key === "roster" && typeof row.id === "string") return `${personName(env, state, row.id)} ${row.role} 欠薪 ${money(Number(row.owed ?? 0))}`;
      return Object.entries(row).map(([k, v]) => `${k}=${v}`).join(" ");
    }).join("；")}`),
    ...screen.log.map(l => `[第 ${l.day} 天] ${l.text}`),
    `動作：${screen.actions.map(a => `${a.label}${a.disabled ? `（停用：${a.disabled}）` : ""} ${JSON.stringify(a.cmd)}`).join("；")}`,
    screen.handoff ? `戰場：${JSON.stringify(screen.handoff.battle)}` : "",
  ].filter(Boolean).join("\n");
}
/** ops 沒有專屬 Screen 的查看指令，依原始狀態補資料，不執行任何效果。 */
export function commandInfo(env: McpEnv, state: CampaignState, cmd: OpsCommand): string {
  const { db, world } = env.world();
  if (cmd.v === "help") return VERBS.filter(v => !cmd.v2 || v.v === cmd.v2 || v.zh === cmd.v2)
    .map(v => `${v.zh}/${v.v} ${v.grammar}`).join("\n") || "未知動詞；help 不帶參數可看全部指令。";
  if (cmd.v === "talk") {
    const person = state.roster.persons[cmd.who];
    const topic = world.all("dialogue").filter(d => d.person === person?.def).flatMap(d => d.topics)
      .find(t => (!cmd.topic || t.topic === cmd.topic) && evalOpsCond(state, { db, world }, t.when, { person: cmd.who }));
    return topic ? `${personName(env, state, cmd.who)}：${topic.lines.join("\n")}` : "";
  }
  if (cmd.v === "look" && cmd.target) {
    if (state.mechs[cmd.target]) return mechText(mechInfo(env, state, cmd.target));
    const p = state.roster.persons[cmd.target], e = state.roster.employment[cmd.target];
    if (p) return `${personName(env, state, p.id)}｜職能 ${e?.role ?? "未指派"}｜等級 ${p.level}｜士氣 ${p.morale}\n` +
      `薪資 ${money(e?.wage ?? 0)}；欠薪 ${money(e?.owed ?? 0)}；${Object.entries(p.pools).map(([k, v]) => `${k} ${v.cur}/${v.max}`).join("；")}\n屬性：${JSON.stringify(p.attrsBase)}`;
    if (roomDefinition(cmd.target, world)) return describeRoom(cmd.target, state, world, db).desc.join("\n");
    const node = world.get("node", cmd.target);
    if (node) return `${node.name}｜${node.kind}｜服務：${node.services.join("、")}`;
  }
  const contract = cmd.v === "board" ? cmd.contract : cmd.v === "look" && cmd.target && state.contracts[cmd.target] ? cmd.target : undefined;
  if (cmd.v === "board" || contract) return `契約板：\n${Object.values(state.contracts).filter(c => !contract || c.id === contract).map(c =>
    `${c.id} ${c.status} → ${campaignName(env, state, c.target.node)}｜酬 ${money(c.terms.total)} 預付 ${money(c.terms.advance)} 每頭 ${money(c.terms.perHead)}｜期限 day ${c.deadlineDay}｜${world.get("contract", c.template)?.objectives.map(o => o.kind).join("、") ?? c.template}`
  ).join("\n") || "目前無契約"}`;
  return "";
}

export function sortiePreview(env: McpEnv, state: CampaignState, sortie: Sortie, setup: Extract<ReturnType<typeof sortieBattleSetup>, { ok: true }>) {
  const { db, world } = env.world(), scenario = setup.scenario;
  const enemies: { id: string; name: string; grade: string; count: number }[] = [];
  for (const unit of scenario.slots.enemy?.units ?? []) {
    const id = unit.monster ?? unit.mech!, monster = db.get("monster", id), frame = db.get("frame", id);
    const name = monster?.name ?? (monster ? db.require("species", monster.species).name : frame?.name) ?? id;
    const grade = monster?.grade ?? frame?.grade ?? unit.grade ?? "未知";
    const old = enemies.find(e => e.id === id && e.grade === grade);
    if (old) old.count++; else enemies.push({ id, name, grade, count: 1 });
  }
  const objectives = scenario.objectives.filter(o => o.for === "player").map(o => {
    const target = [o.params.unit, ...(Array.isArray(o.params.units) ? o.params.units : [])].filter(v => typeof v === "string").join("、");
    const text = { eliminate: "殲滅敵軍", survive: `存活至第 ${o.params.rounds ?? scenario.rounds} 輪`,
      hold: `控制指定區域 ${o.params.rounds ?? "指定"} 輪`, escort: `護送${target || "指定單位"}到出口`,
      capture: `捕獲${target || "指定目標"}`, reachExit: `${target || "指定單位"}到達出口`, killTarget: `擊毀${target || "指定目標"}` }[o.kind];
    return `${text}（${o.onComplete === "win" ? "達成獲勝" : o.onComplete === "lose" ? "達成戰敗" : "支線目標"}）`;
  });
  const rift = state.rifts[sortie.rift ?? state.contracts[sortie.contract ?? ""]?.target.rift ?? ""];
  const family = rift && (world.get("rift", rift.family) ?? world.all("rift").find(d => d.family === rift.family));
  const anchor = rift && db.get("monster", rift.anchor ?? family?.anchor ?? "");
  // 動態 MapDef 沒有 name；以出戰地點命名，不捏造靜態地圖名稱。
  const map = { id: scenario.map, name: `${world.require("node", sortie.node).name}戰場`, width: scenario.ops.map.width, height: scenario.ops.map.height };
  const riftInfo = rift ? { id: rift.id, phase: rift.phase, anchor: anchor?.name ?? (anchor ? db.require("species", anchor.species).name : null), anchorGrade: anchor?.grade ?? null } : null;
  const objective = objectives.join("；") + "。";
  const summary = `${map.name} ${map.width}×${map.height}｜敵方：${enemies.map(e => `${e.name} ${e.grade}級×${e.count}`).join("、")}\n目標：${objective} 輪數上限 ${scenario.rounds}。\n` +
    (riftInfo ? `裂縫 ${riftInfo.phase}；錨 ${riftInfo.anchor ?? "無"}（${riftInfo.anchorGrade ?? "無"}級）` : "此出戰沒有關聯裂縫。" );
  return { map, enemies, objective, maxRounds: scenario.rounds, rift: riftInfo, summary };
}

export function battleReport(env: McpEnv, before: CampaignState, after: CampaignState, sortie: Sortie, result: BattleResult) {
  const { db } = env.world(), name = (id: string) => campaignName(env, before, id);
  const cashDelta = after.ledger.balances.cash - before.ledger.balances.cash;
  const contracts = Object.values(after.contracts).filter(c => c.status !== before.contracts[c.id]?.status)
    .map(c => ({ id: c.id, node: name(c.target.node), before: before.contracts[c.id]?.status ?? "無", after: c.status }));
  const rifts = Object.values(after.rifts).filter(r => r.phase !== before.rifts[r.id]?.phase)
    .map(r => ({ id: r.id, node: name(r.node), before: before.rifts[r.id]?.phase ?? "無", after: r.phase }));
  const status = (s: string) => ({ alive: "存活", dead: "陣亡", retreated: "撤退存活", captured: "被捕獲", "derelict-lost": "機甲流失", "derelict-recovered": "棄機回收" }[s] ?? s);
  const mechs = sortie.units.map(u => {
    const entry = result.units.find(e => e.id === u.mech), frame = db.get("frame", before.mechs[u.mech]?.frame ?? "");
    const body = frame && db.get("bodyplan", frame.bodyPlan);
    const brokenParts = Object.entries(entry?.state.parts ?? {}).filter(([, p]) => p.broken || p.layers.some(l => l.broken || l.hp <= 0))
      .map(([id]) => body?.parts.find(p => p.id === id)?.name ?? id);
    return { id: u.mech, name: name(u.mech), status: entry ? status(entry.status) : "未回報", brokenParts };
  });
  const persons = [...new Set(sortie.units.flatMap(u => Object.values(u.seats).filter((p): p is string => !!p)))].map(id => {
    const entry = result.persons.find(p => p.id === id);
    return { id, name: name(id), status: entry ? status(entry.state.pools.hp?.cur === 0 ? "dead" : entry.status) : "未回報" };
  });
  const enemy = result.units.filter(u => !sortie.units.some(own => own.mech === u.id));
  const enemyRow = (u: typeof enemy[number]) => ({ id: u.id, name: name(u.state.frame) });
  const destroyed = enemy.filter(u => u.status === "dead").map(enemyRow), captured = enemy.filter(u => u.status === "captured").map(enemyRow);
  const lines = ["戰果報告", `現金變化：${cashDelta >= 0 ? "+" : ""}${money(cashDelta)}`,
    `契約狀態：${contracts.map(c => `${c.node} ${c.id} ${c.before}→${c.after}`).join("；") || "無變化"}`,
    `裂縫相位：${rifts.map(r => `${r.node} ${r.before}→${r.after}`).join("；") || "無變化"}`,
    ...mechs.map(m => `${m.name}：${m.status}；損毀部位 ${m.brokenParts.join("、") || "無"}`),
    ...persons.map(p => `${p.name}：${p.status}`), `擊毀敵方：${destroyed.map(e => e.name).join("、") || "無"}`,
    `捕獲敵方：${captured.map(e => e.name).join("、") || "無"}`, `戰利品：${result.loot.length} 筆`];
  return { cashDelta, contracts, rifts, mechs, persons, destroyed, captured, lootCount: result.loot.length, lines };
}

export function campaignCatalog(env: McpEnv, state: CampaignState) {
  const { db, world } = env.world(), ctx = createOpsCtx(state, db, world);
  type Item = { id: string; name: string; label: string; cmd?: OpsCommand; disabled?: string; price?: number; stock?: number; market?: string; mode?: string;
    role?: string; wage?: number; fee?: number; requires?: string[]; cost?: object; hint?: string };
  const market: Item[] = [], recruits: Item[] = [], research: Item[] = [];
  const blocked = state.pendingChoices.length ? "要先 choose" : state.pendingBattle ? "先處理待出戰" : undefined;
  const docked = !state.ship.route && !(state as CampaignState & { drifting?: boolean }).drifting;
  if (docked) for (const m of world.all("market").filter(m => m.node === state.ship.at)) for (const list of m.lists) for (const item of list.items) {
    const price = marketPrice(state, ctx, m, item), name = campaignName(env, state, item.def);
    const stock = (state as MarketState).markets?.[m.id]?.stock[item.def] ?? item.stockMax;
    const supported = item.basePrice !== undefined && (["component", "frame"].includes(list.kind) || item.def.startsWith("stock:"));
    market.push({ id: item.def, name, market: m.id, mode: "buy", price, stock,
      label: `買 ${name}（${item.def}）${money(price)} 幣，庫存 ${stock}`,
      cmd: { v: "trade", market: m.id, buy: [item.def] },
      ...(!supported || blocked || stock < 1 ? { disabled: blocked ?? (!supported ? "ops 尚不支援此品項交易" : "缺貨") } : {}) });
    if (!m.buysBack) continue;
    const ids = list.kind === "component" ? state.inventory.components.filter(c => c.def === item.def || db.get("component", c.def)?.id === item.def).map(c => c.id)
      : list.kind === "frame" ? state.inventory.mechs.filter(id => db.get("frame", state.mechs[id]?.frame ?? "")?.id === item.def)
      : (state.ledger.balances[item.def as keyof typeof state.ledger.balances] ?? 0) >= 1 ? [item.def] : [];
    for (const id of ids) {
      // 使用既有交易入口在副本報價，包含實物損傷折價與可售條件。
      const copy = structuredClone(state), cmd: OpsCommand = { v: "trade", market: m.id, sell: [id] };
      const quoted = cmdTrade(copy, createOpsCtx(copy, db, world), cmd);
      if (!quoted.ok) continue;
      const price = copy.ledger.balances.cash - state.ledger.balances.cash;
      market.push({ id, name, market: m.id, mode: "sell", price, cmd, label: `賣 ${name}（${id}）${money(price)} 幣` });
    }
  }
  if (!state.ship.route) for (const c of Object.values((state as CrewState).crew?.candidates ?? {}).filter(c => c.node === state.ship.at)) {
    const name = db.get("person", c.person.def)?.name ?? world.get("background", c.background)?.name ?? c.id;
    const disabled = blocked ?? (Object.keys(state.roster.persons).length >= state.ship.capacity.berths ? "沒有床位" : undefined);
    recruits.push({ id: c.id, name, role: "pilot", wage: c.wage, fee: c.fee,
      label: `招募 ${name}（${c.id}）｜職能 駕駛（pilot）｜薪資 ${money(c.wage)}，聘金 ${money(c.fee)}`,
      cmd: { v: "hire", candidate: c.id }, ...(disabled ? { disabled } : {}) });
  }
  // 研究在船內排工，沒有節點服務限制；沿用 queue 的先決條件。
  for (const r of world.all("research").filter(r => !state.research[r.id]?.done)) {
    const disabled = blocked ?? (!researchReady(state, ctx, r) ? "前置研究／解鎖未完成" : state.jobs.some(j => j.kind === "research" && j.target === r.id) ? "已排入工單" : undefined);
    research.push({ id: r.id, name: r.name, requires: [...r.requires], cost: { ...r.cost, consumes: r.consumes ?? {} },
      label: `研究 ${r.name}（${r.id}）｜${money(r.cost.coin)} 幣／${r.cost.techHours}工時｜前置 ${r.requires.map(id => campaignName(env, state, id)).join("、") || "無"}｜材料 ${JSON.stringify(r.consumes ?? {})}`,
      cmd: { v: "queue", job: { kind: "research", target: r.id } }, ...(disabled ? { disabled } : {}) });
  }
  return { market, recruits, research };
}

export function availableIds(env: McpEnv, state: CampaignState, text: string): string[] {
  const { world } = env.world(), word = text.trim().split(/\s/u)[0];
  const verb = VERBS.find(v => v.v === word || v.zh === word)?.v;
  let ids: string[];
  if (verb === "trade" || word === "買" || word === "賣") {
    const markets = world.all("market").filter(m => m.node === state.ship.at);
    ids = [...markets.map(m => m.id), ...markets.flatMap(m => m.lists.flatMap(l => l.items.map(i => i.def))), ...state.inventory.components.map(c => c.id)];
  } else if (verb === "hire") ids = Object.values((state as CrewState).crew?.candidates ?? {}).filter(c => c.node === state.ship.at).map(c => c.id);
  else if (word === "研" || verb === "queue") ids = world.all("research").map(r => r.id);
  else if (verb === "sail" || verb === "explore") ids = world.all("node").map(n => n.id);
  else if (verb === "board" || verb === "accept" || verb === "drop") ids = Object.keys(state.contracts);
  else if (verb === "go") ids = world.all("room").map(r => r.id);
  else ids = [...Object.keys(state.mechs), ...Object.keys(state.roster.persons), ...Object.keys(state.contracts)];
  return [...new Set(ids)].slice(0, 10);
}

/** brief：省略房間描述散文（act 結果房間沒變時用），JSON 一律不重複描述。 */
export function campaignView(env: McpEnv, id: string, state: CampaignState, events: CampaignEvent[], limit = 20, brief = false, showMap = false) {
  const { db, world } = env.world(), screen = render(state, events, world, db);
  // ops 的 map 指令沒有輸出（DOM 自己畫世界圖）；MCP 這裡補上可達節點的天數與燃料，sail 才有依據。
  const ctx = createOpsCtx(state, db, world), here = state.ship.at;
  const travel = (node: string) => { const p = shortestPath(state, ctx, here, node); return p ? { days: p.days, fuel: p.fuel } : null; };
  // ops 沒寫文案的事件只會顯示「未登錄事件：X」，對決策沒資訊；併成一行計數，不佔 log 名額。
  const rows = events.map(e => eventLog(e, state, world)), unlogged: Record<string, number> = {};
  const useful = rows.filter(r => { const m = /^未登錄事件：(.+)。$/u.exec(r.text); if (m) unlogged[m[1]!] = (unlogged[m[1]!] ?? 0) + 1; return !m; });
  const log = limit === 0 ? [] : useful.slice(-limit);
  const omitted = useful.length - log.length;
  const panels: Record<string, object[]> = Object.fromEntries(Object.entries(screen.panels).filter(([, rows]) => rows.length));
  const contracts = Object.values(state.contracts).filter(c => ["offered", "active", "stage"].includes(c.status)).map(c => ({
    id: c.id, status: c.status, template: c.template, issuer: c.issuer, target: c.target.node, total: c.terms.total,
    advance: c.terms.advance, perHead: c.terms.perHead, deadlineDay: c.deadlineDay,
    travel: c.target.node === here ? { days: 0, fuel: 0 } : travel(c.target.node),
  }));
  if (contracts.length) panels.contracts = contracts;
  const hangar = [...new Set([...state.hangar.bays, ...state.hangar.dormant, ...state.restraint.slots])]
    .flatMap(id => id && state.mechs[id] ? [mechInfo(env, state, id)] : []);
  if (hangar.length) panels.hangar = hangar;
  const roster = Object.keys(state.roster.persons).sort().map(id => ({ id, name: personName(env, state, id),
    role: state.roster.employment[id]?.role ?? "未指派", wage: state.roster.employment[id]?.wage ?? 0, owed: state.roster.employment[id]?.owed ?? 0 }));
  panels.roster = roster;
  const worldMap = showMap ? world.all("node").filter(n => n.id !== here).flatMap(n => {
    const t = travel(n.id); return t ? [{ id: n.id, name: n.name, kind: n.kind, ...t }] : [];
  }).sort((a, b) => a.days - b.days || a.id.localeCompare(b.id)) : [];
  if (showMap) panels.worldMap = worldMap;
  const pendingBattle = state.pendingBattle && {
    id: state.pendingBattle.id, node: state.pendingBattle.node, trigger: state.pendingBattle.trigger,
    contract: state.pendingBattle.contract, units: structuredClone(state.pendingBattle.units),
    hint: "可送 sortie；若 units 為空，請在 sortie.units 提供機甲、seats 與 controlMode。",
  };
  const prompt = promptInfo(screen);
  const data = { ...(prompt ? { prompt, hint: "要先 choose，選項序號從 1 起。" } : {}),
    id, clock: { ...state.clock }, room: { id: screen.room.id, title: screen.room.title, exits: screen.room.exits }, panels, log, logOmitted: omitted,
    pendingTicks: state.pendingTicks, ...(pendingBattle ? { pendingBattle } : {}) };
  const summary = [prompt?.summary ?? "",
    `${id}｜潮月 ${state.clock.month} 第 ${state.clock.dom} 天（day=${state.clock.day}）｜${screen.room.title}`,
    ...(brief ? [] : screen.room.desc), `現金 ${money(state.ledger.balances.cash)}；債務 ${money(state.ledger.balances.debt)}；人數 ${Object.keys(state.roster.persons).length}。`,
    ...hangar.map(mechText), `人員：${roster.map(p => `${p.name} ${p.role} 薪資 ${money(p.wage)} 欠薪 ${money(p.owed)}`).join("；")}`,
    showMap ? `世界圖（自 ${here}；天數／燃料）：${worldMap.map(n => `${n.id} ${n.name} ${n.days}天/${n.fuel}`).join("；") || "沒有可達節點"}` : "",
    contracts.length ? `契約：${contracts.map(c => `${c.id} ${c.status} ${c.template.replace(/^.*\//u, "")}（${c.issuer.replace(/^.*\//u, "")}）→ ${c.target} 酬 ${c.total}${c.advance ? ` 預付 ${c.advance}` : ""}${c.perHead ? ` 每頭 ${c.perHead}` : ""} 期限 day ${c.deadlineDay}${c.travel ? `（${c.travel.days}天/燃料${c.travel.fuel}）` : "（無航線）"}`).join("；")}` : "",
    pendingBattle ? `待出戰：${pendingBattle.trigger}，${pendingBattle.hint}` : "",
    ...log.map(row => `[第 ${row.day} 天] ${row.text}`), omitted ? `另有 ${omitted} 行較早紀錄未顯示。` : "",
    Object.keys(unlogged).length ? `（無文案事件：${Object.entries(unlogged).map(([k, n]) => `${k}×${n}`).join("、")}）` : "",
  ].filter(Boolean).join("\n");
  return { data, summary: displayText(summary) };
}
