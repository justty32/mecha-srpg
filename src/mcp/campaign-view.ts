// 營運畫面只傳可供決策的摘要；指令紀錄與完整狀態留在 session。
import type { CampaignEvent, CampaignState } from "../ops/state/types.ts";
import { render, eventLog, entityName } from "../ops/text/index.ts";
import type { McpEnv } from "./tool.ts";
import { createOpsCtx } from "../ops/content/start.ts";
import { shortestPath } from "../ops/world/travel.ts";

/** brief：省略房間描述散文（act 結果房間沒變時用），JSON 一律不重複描述。 */
export function campaignView(env: McpEnv, id: string, state: CampaignState, events: CampaignEvent[], limit = 20, brief = false, showMap = false) {
  const { db, world } = env.world(), screen = render(state, [], world, db);
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
  const hangar = [...new Set([...state.hangar.bays, ...state.restraint.slots])].flatMap(id => {
    const mech = id && state.mechs[id];
    return mech ? [{ id: mech.id, frame: mech.frame, name: entityName(mech.id, state, world),
      controlMode: mech.controlMode, seats: { ...mech.seats }, dormant: state.hangar.dormant.includes(mech.id) }] : [];
  });
  if (hangar.length) panels.hangar = hangar;
  const worldMap = showMap ? world.all("node").filter(n => n.id !== here).flatMap(n => {
    const t = travel(n.id); return t ? [{ id: n.id, name: n.name, kind: n.kind, ...t }] : [];
  }).sort((a, b) => a.days - b.days || a.id.localeCompare(b.id)) : [];
  if (showMap) panels.worldMap = worldMap;
  const pendingBattle = state.pendingBattle && {
    id: state.pendingBattle.id, node: state.pendingBattle.node, trigger: state.pendingBattle.trigger,
    contract: state.pendingBattle.contract, units: structuredClone(state.pendingBattle.units),
    hint: "可送 sortie；若 units 為空，請在 sortie.units 提供機甲、seats 與 controlMode。",
  };
  const data = { ...(screen.prompt ? { prompt: screen.prompt, hint: "要先 choose，選項序號從 1 起。" } : {}),
    id, clock: { ...state.clock }, room: { id: screen.room.id, title: screen.room.title, exits: screen.room.exits }, panels, log, logOmitted: omitted,
    pendingTicks: state.pendingTicks, ...(pendingBattle ? { pendingBattle } : {}) };
  const summary = [screen.prompt ? `要先 choose：${screen.prompt.text}\n${screen.prompt.choices.map(c => `${c.n}. ${c.text}${c.disabled ? `（${c.disabled}）` : ""}`).join("\n")}` : "",
    `${id}｜潮月 ${state.clock.month} 第 ${state.clock.dom} 天（day=${state.clock.day}）｜${screen.room.title}`,
    ...(brief ? [] : screen.room.desc), `現金 ${state.ledger.balances.cash}；債務 ${state.ledger.balances.debt}；人數 ${Object.keys(state.roster.persons).length}。`,
    showMap ? `世界圖（自 ${here}；天數／燃料）：${worldMap.map(n => `${n.id} ${n.name} ${n.days}天/${n.fuel}`).join("；") || "沒有可達節點"}` : "",
    contracts.length ? `契約：${contracts.map(c => `${c.id} ${c.status} ${c.template.replace(/^.*\//u, "")}（${c.issuer.replace(/^.*\//u, "")}）→ ${c.target} 酬 ${c.total}${c.advance ? ` 預付 ${c.advance}` : ""}${c.perHead ? ` 每頭 ${c.perHead}` : ""} 期限 day ${c.deadlineDay}${c.travel ? `（${c.travel.days}天/燃料${c.travel.fuel}）` : "（無航線）"}`).join("；")}` : "",
    pendingBattle ? `待出戰：${pendingBattle.trigger}，${pendingBattle.hint}` : "",
    ...log.map(row => `[第 ${row.day} 天] ${row.text}`), omitted ? `另有 ${omitted} 行較早紀錄未顯示。` : "",
    Object.keys(unlogged).length ? `（無文案事件：${Object.entries(unlogged).map(([k, n]) => `${k}×${n}`).join("、")}）` : "",
  ].filter(Boolean).join("\n");
  return { data, summary };
}
