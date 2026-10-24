import { nextFloat } from "../../core/rng.ts";
import type { CampaignState, ContractState, ContractTemplate, OpsCtx, Sortie, Ask, ObjectiveTemplate } from "../state/types.ts";
import type { JoinTerms, OperationState, ForceState } from "./types.ts";
import type { BattleResult } from "../sortie/apply.ts";
import { classifyOutcome, retreatRules } from "../sortie/outcome.ts";
import { evalOpsNum } from "../content/cond.ts";
import { nextId } from "../state/ids.ts";
import { eventRef } from "../state/events.ts";
import { post } from "../state/ledger.ts";
import { locNode, nodeLoc, sameRegion } from "./loc.ts";
import { modelPower, strength } from "./forces.ts";
import { allies, drive } from "./drivers.ts";
import { changeRelation, factionId } from "./relations.ts";
import { terminalPhase } from "./resolve.ts";
import { endOperation } from "./operations.ts";
import { lendMechs, returnLoans, supplyBattle, supplyDaily } from "./merc-supply.ts";

/** SPEC-GAP：戰果簿記與平衡係數放 join 模板及可選存檔欄；不擴充核心實體。 */
export type MercRecord = { terms: JoinTerms; initialEnemy: number; playerHeads: number; enemyPower: number; battles: number;
  attachedLoss: number; droppedDay?: number; suppliedDay?: number; medicalUntil?: number; cleansed?: boolean;
  loans: Record<string, { model: string; hp: number; lost?: boolean; destroyed?: boolean }>; betrayed?: boolean; diplomacy?: boolean };
export type MercRules = { progress: number; allyFraction: [number, number]; attachedMax: number; headPower: number;
  lossPerPower: number; loanPrice: number; violationShare: number; violationRep: number; dismissal: number;
  betrayalDays: number; blacklistMonths: number; exposure: number; baseExposure: number; technicianCount: number; scrapLimit: number;
  restraintRounds: number; briefing?: string; cleanse: string[]; winRep: [number, number]; enemyRep: [number, number] };
export function mercRules(ctx: OpsCtx, c: ContractState): MercRules {
  return (ctx.world.require("contract", c.template) as ContractTemplate & { mercRules: MercRules }).mercRules;
}
export function joinTerms(ctx: OpsCtx, c: ContractState): JoinTerms {
  const terms = c.merc?.terms ?? ctx.world.require("contract", c.template).join;
  if (!terms) throw new Error(`missing join terms: ${c.id}`);
  return terms;
}
export function joinOperation(s: CampaignState, c: ContractState): OperationState | undefined { return s.operations?.[c.operation ?? ""]; }
export function joinForce(s: CampaignState, c: ContractState, op: OperationState): ForceState {
  return c.side === "target" ? s.factions[c.issuer]!.forces! : op.force;
}
export function playerStrength(s: CampaignState, ctx: OpsCtx): number {
  const gp = ctx.world.all("forces")[0]?.gp;
  return [...new Set([...s.hangar.bays, ...s.restraint.slots])].reduce<number>((sum, id) => {
    const mech = id ? s.mechs[id] : undefined;
    if (!mech || s.hangar.dormant.includes(id!) || Object.values(mech.parts).every(p => p.broken)) return sum;
    return sum + (gp?.[ctx.db.require("frame", mech.frame).grade] ?? 0);
  }, 0);
}
export function onMuster(s: CampaignState, ctx: OpsCtx, op: OperationState): void {
  const def = ctx.world.require("operation", op.def), merc = def.merc;
  if (!merc || merc.slots <= 0 || op.mercSlots.length) return;
  const template = ctx.world.get("contract", `contract/op-join-${merc.supply}`);
  if (!template?.join) return;
  const sides: ("actor" | "target")[] = merc.sides === "both" && op.target.faction ? ["actor", "target"] : ["actor"];
  for (const side of sides) {
    const issuer = side === "actor" ? op.actor : op.target.faction!;
    if (!s.factions[issuer]?.alive) continue;
    // 沿用既有 offerContract 的可見門檻；接受時仍重新檢查，避免無法接的高階 join 搶先佔板。
    if (s.factions[issuer]!.rep < Math.max(template.requiresRep, merc.minRep)) continue;
    const id = nextId(s, "contract"), rift = s.rifts[op.target.rift ?? ""];
    const family = rift && (ctx.world.get("rift", rift.family) ?? ctx.world.all("rift").find(f => f.family === rift.family));
    const c: ContractState = { id, template: template.id, issuer, operation: op.id, side, loans: [], violations: 0,
      target: { node: locNode(op.target.loc), ...(rift ? { rift: rift.id, snapshot: { family: family?.family ?? rift.family, width: rift.width,
        depth: s.nodes[locNode(op.target.loc)]?.blight?.depth ?? "shallow", anchorAge: rift.anchorAge, phase: rift.phase, monsters: family?.monsters } } : {}) },
      status: "offered", terms: { total: evalOpsNum(s, ctx, template.pay.base, { faction: issuer }), advance: 0, perHead: 0 },
      paidAdvance: false, heads: {}, offeredDay: s.clock.day,
      deadlineDay: op.startDay + (ctx.world.all("forces")[0]?.maxDays ?? 45) + 1, stageIdx: 0, annoyance: 0,
      merc: { terms: { ...structuredClone(template.join), share: merc.share }, initialEnemy: side === "actor" ? op.enemyStr : strength(op.force, modelPower(ctx)),
        playerHeads: 0, enemyPower: 0, battles: 0, attachedLoss: 0, loans: {} } };
    s.contracts[id] = c; op.mercSlots.push({ contract: id, side });
    ctx.emit("ContractOffered", { contract: id, issuer, node: c.target.node, operation: op.id, kind: "join", side });
  }
}
export function joinRejection(s: CampaignState, ctx: OpsCtx, c: ContractState): string | undefined {
  const op = joinOperation(s, c), terms = joinTerms(ctx, c);
  if (!op || !["muster", "march", "engage"].includes(op.phase) || !s.factions[c.issuer]?.alive) return "operation-unavailable";
  const def = ctx.world.require("operation", op.def);
  if (s.factions[c.issuer]!.rep < Math.max(ctx.world.require("contract", c.template).requiresRep, def.merc?.minRep ?? 0)) return "join-reputation";
  if (playerStrength(s, ctx) < evalOpsNum(s, ctx, terms.minStrength)) return "join-strength";
  if ((s.flags[`blacklist:${c.issuer}`] ?? 0) > s.clock.day) return "join-blacklist";
  const opponent = c.side === "target" ? op.actor : op.target.faction;
  if (Object.values(s.contracts).some(other => other.id !== c.id && other.operation && other.issuer === opponent && ["active", "stage"].includes(other.status)
    && (terms.exclusive || joinTerms(ctx, other).exclusive))) return "join-exclusive";
  return undefined;
}
export function acceptJoin(s: CampaignState, ctx: OpsCtx, c: ContractState, ask?: Ask): { ok: true } | { ok: false; error: string } {
  const error = joinRejection(s, ctx, c); if (error) return { ok: false, error };
  // join 的分成與借機損失是軍方制式條款；不沿用按頭談判，以免雙重計價。
  if (ask) return { ok: false, error: "join-fixed-terms" };
  const op = joinOperation(s, c)!, cfg = mercRules(ctx, c);
  c.status = "active"; c.paidAdvance = true;
  ctx.emit("ContractAccepted", { contract: c.id, operation: op.id, kind: "join", side: c.side });
  for (const other of Object.values(s.contracts)) {
    if (other.operation === op.id && other.side !== c.side && other.status === "offered") {
      other.status = "expired";
      s.factions[other.issuer]!.memory.push({ day: s.clock.day, kind: "refused-us", ref: c.id });
      ctx.emit("ContractExpired", { contract: other.id, reason: "side-chosen" });
    }
    if (other.issuer === (c.side === "target" ? op.actor : op.target.faction) && other.merc?.droppedDay !== undefined
      && s.clock.day - other.merc.droppedDay <= cfg.betrayalDays && !other.merc.betrayed) betray(s, ctx, other, c.issuer, "switch-side");
  }
  lendMechs(s, ctx, c);
  if (!ctx.world.require("operation", op.def).covert) joinDiplomacy(s, ctx, c, op);
  return { ok: true };
}
export function rep(s: CampaignState, ctx: OpsCtx, id: string | undefined, amount: number, reason: string): void {
  if (!id || !s.factions[id]) return;
  const f = s.factions[id]!; f.rep = Math.max(-100, Math.min(100, f.rep + amount));
  ctx.emit("ReputationChanged", { faction: id, delta: amount, reason });
}
export function joinDiplomacy(s: CampaignState, ctx: OpsCtx, c: ContractState, op: OperationState): void {
  if (c.merc?.diplomacy) return;
  if (c.merc) c.merc.diplomacy = true;
  const enemy = c.side === "target" ? op.actor : op.target.faction;
  if (enemy) {
    rep(s, ctx, enemy, -mercRules(ctx, c).enemyRep[0], "player-join");
    s.factions[enemy]?.memory.push({ day: s.clock.day, kind: "fought-against", ref: c.id });
    for (const id of allies(s, enemy)) if (id !== c.issuer) rep(s, ctx, id, -5, "player-join");
  }
  for (const id of allies(s, c.issuer)) if (id !== enemy) rep(s, ctx, id, 2, "player-join");
}
export function betray(s: CampaignState, ctx: OpsCtx, c: ContractState, beneficiary: string | undefined, reason: string): void {
  if (c.merc?.betrayed) return;
  if (c.merc) c.merc.betrayed = true;
  rep(s, ctx, c.issuer, -40, "player-betray");
  rep(s, ctx, factionId(s, ctx, "faction/residual-league"), -15, "player-betray");
  rep(s, ctx, beneficiary, 10, "player-betray");
  s.flags[`blacklist:${c.issuer}`] = s.clock.day + mercRules(ctx, c).blacklistMonths * ctx.world.require("calendar", s.calendar).daysPerMonth;
  if (beneficiary) changeRelation(s, ctx, c.issuer, beneficiary, -6, "player-betray", 1);
  s.factions[c.issuer]!.memory.push({ day: s.clock.day, kind: "betrayed", ref: c.id });
  ctx.emit("Betrayed", { contract: c.id, victim: c.issuer, beneficiary: beneficiary ?? "player", reason });
}
export function mercDaily(s: CampaignState, ctx: OpsCtx): void {
  for (const key of Object.keys(s.flags)) if (key.startsWith("blacklist:") && s.flags[key]! <= s.clock.day) delete s.flags[key];
  for (const c of Object.values(s.contracts).sort((a, b) => a.id.localeCompare(b.id))) if (c.operation && c.status === "active") supplyDaily(s, ctx, c);
}
export function playerEngages(s: CampaignState, ctx: OpsCtx, op: OperationState): boolean {
  if (op.phase !== "engage" || s.ship.route) return false;
  const c = op.mercSlots.map(slot => s.contracts[slot.contract]!).find(c => c.status === "active");
  if (!c || !sameRegion(nodeLoc(ctx, s.ship.at), joinForce(s, c, op).pos)) return false;
  if (s.pendingBattle) return s.pendingBattle.operation === op.id;
  const sortie: Sortie = { id: nextId(s, "sortie"), day: s.clock.day, node: locNode(joinForce(s, c, op).pos), trigger: "operation",
    operation: op.id, contract: c.id, rift: op.target.rift, units: [], supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] };
  supplyBattle(s, ctx, c, sortie); s.pendingBattle = sortie;
  ctx.emit("OperationEngaged", { operation: op.id, contract: c.id, sortie: sortie.id, player: 1 });
  return true;
}
export function joinPay(s: CampaignState, ctx: OpsCtx, c: ContractState, op: OperationState, dropped = false): { pay: number; contribution: number } {
  const terms = joinTerms(ctx, c), m = c.merc!, cfg = mercRules(ctx, c);
  const remaining = c.side === "target" ? strength(op.force, modelPower(ctx)) : op.enemyStr;
  const abstractHeads = Math.max(0, m.initialEnemy - remaining - m.enemyPower) / cfg.headPower;
  const totalHeads = Object.keys(c.heads).length + abstractHeads;
  const contribution = totalHeads > 0 ? Math.min(1, m.playerHeads / totalHeads) : 0;
  const share = dropped ? 0 : Math.max(0, evalOpsNum(s, ctx, terms.share) - (c.violations ?? 0) * cfg.violationShare);
  return { pay: evalOpsNum(s, ctx, terms.base) + share * c.terms.total * contribution - m.attachedLoss, contribution };
}
function settleJoin(s: CampaignState, ctx: OpsCtx, c: ContractState, op: OperationState, dropped: boolean): void {
  if (c.settled) return;
  const { pay, contribution } = joinPay(s, ctx, c, op, dropped);
  const event = [...s.log].reverse().find(e => e.type === "OperationResolved" && e.payload.operation === op.id);
  const ref = eventRef(event ?? ctx.emit("AllySupplied", { contract: c.id, operation: op.id, reason: dropped ? "departure" : "settlement" }));
  post(s, ctx, { account: "cash", delta: pay, reason: "join-pay", ref });
  const loss = returnLoans(s, ctx, c, ref);
  c.settled = true; c.status = dropped ? "cancelled" : (c.side === "target" ? op.phase !== "done" : op.phase === "done") ? "done" : "failed";
  const cfg = mercRules(ctx, c), won = c.status === "done";
  rep(s, ctx, c.issuer, dropped ? -5 : c.merc!.battles > 0 ? won ? cfg.winRep[0] + Math.round((cfg.winRep[1] - cfg.winRep[0]) * contribution) : 2 : 0, "join-settle");
  if (s.pendingBattle?.contract === c.id) delete s.pendingBattle;
  ctx.emit("JoinSettled", { contract: c.id, operation: op.id, pay: pay - loss, contribution, status: c.status });
}
export function dropJoin(s: CampaignState, ctx: OpsCtx, c: ContractState): void {
  c.merc!.droppedDay = s.clock.day;
  settleJoin(s, ctx, c, joinOperation(s, c)!, true);
  ctx.emit("ContractCancelled", { contract: c.id, kind: "join" });
}
export function onOperationEnd(s: CampaignState, ctx: OpsCtx, op: OperationState): void {
  for (const slot of op.mercSlots) {
    const c = s.contracts[slot.contract]; if (!c) continue;
    if (c.status === "active") settleJoin(s, ctx, c, op, false);
    else if (c.status === "offered") { c.status = "expired"; ctx.emit("ContractExpired", { contract: c.id }); }
  }
}

/** 編碼保留 force 模型對位，不依賴 UI 或重跑 ScenarioGen。 */
export function forceUnitId(sortie: string, side: "friend" | "enemy", model: string, index: number, attached = false): string {
  return `${sortie}/force/${side}/${encodeURIComponent(model)}/${index}${attached ? "/attached" : ""}`;
}
export function forceUnitModel(id: string): string | undefined {
  const match = /\/force\/(?:friend|enemy)\/([^/]+)\/\d+(?:\/attached)?$/.exec(id);
  return match ? decodeURIComponent(match[1]!) : undefined;
}
function orderDone(order: ObjectiveTemplate, result: BattleResult): boolean {
  const p = order.params, target = p.unit ?? p.target;
  const targets = result.units.filter(u => u.id === target || u.state.frame === target || Array.isArray(p.units) && p.units.includes(u.id));
  if (order.kind === "killTarget") return targets.length > 0 && targets.every(u => u.status === "dead");
  if (order.kind === "capture") return targets.some(u => u.status === "captured" && u.state.owner === "player");
  if (order.kind === "reachExit" || order.kind === "escort") return targets.length > 0 && targets.every(u => u.status === "retreated");
  if (order.kind === "eliminate") return result.units.filter(u => u.state.owner === "enemy").every(u => ["dead", "captured", "retreated", "derelict-lost"].includes(u.status));
  if (order.kind === "survive") return result.rounds >= Number(p.rounds) && result.units.some(u => u.state.owner === "player" && u.status !== "dead");
  // BattleResult 不傳 hold 累積值；由首個 Moved.from／最終位置還原開局，再逐輪重播位置與退出事件。
  const positions = new Map(result.units.map(u => [u.id, { ...u.state.pos }]));
  const moved = new Set<string>();
  for (const e of result.events ?? []) if (e.type === "Moved" && typeof e.payload.unit === "string" && Array.isArray(e.payload.from) && !moved.has(e.payload.unit)) {
    moved.add(e.payload.unit); positions.set(e.payload.unit, { x: Number(e.payload.from[0]), y: Number(e.payload.from[1]) });
  }
  const enemyX = Math.max(...result.units.filter(u => u.state.owner === "enemy").map(u => positions.get(u.id)!.x));
  const zone = Array.isArray(p.zone) ? p.zone as { x: number; y: number }[] : undefined;
  const removed = new Set<string>(); let held = 0;
  for (const e of result.events ?? []) {
    if (e.type === "Moved" && typeof e.payload.unit === "string" && Array.isArray(e.payload.to)) positions.set(e.payload.unit, { x: Number(e.payload.to[0]), y: Number(e.payload.to[1]) });
    if (["UnitDied", "Retreated", "UnitRetreated", "Captured", "UnitCaptured", "MechLost"].includes(e.type) && typeof e.payload.unit === "string") removed.add(e.payload.unit);
    if (e.type !== "RoundEnd") continue;
    const occupants = result.units.filter(u => { const pos = positions.get(u.id); return !removed.has(u.id) && pos && (zone ? zone.some(c => c.x === pos.x && c.y === pos.y) : pos.x === enemyX); });
    held = occupants.some(u => u.state.owner === "player") && !occupants.some(u => u.state.owner === "enemy") ? held + 1 : 0;
    if (held >= Number(p.rounds)) return true;
  }
  return false;
}
export function applyOperationBattle(s: CampaignState, ctx: OpsCtx, sortie: Sortie, result: BattleResult): void {
  const c = s.contracts[sortie.contract ?? ""], op = c && joinOperation(s, c); if (!c?.merc || !op || c.settled) return;
  const m = c.merc, cfg = mercRules(ctx, c), power = modelPower(ctx), force = joinForce(s, c, op);
  const briefing = cfg.briefing && ctx.db.get("effect", cfg.briefing)?.id;
  for (const person of Object.values(s.roster.persons)) {
    const temporary = person.effects.filter(e => e.source === sortie.id && e.effect === briefing);
    const ids = new Set(temporary.flatMap(e => e.contribIds));
    person.effects = person.effects.filter(e => !temporary.includes(e)); person.contribs = person.contribs.filter(e => !ids.has(e.id));
  }
  m.battles++; m.medicalUntil = s.clock.day + 1;
  for (const u of result.units) {
    if (u.status !== "dead") continue;
    const model = forceUnitModel(u.id);
    if (u.id.includes("/force/friend/")) {
      const entry = force.units.find(f => f.model === model); if (entry) entry.count = Math.max(0, entry.count - 1);
      if (u.id.endsWith("/attached")) m.attachedLoss += (power[model ?? ""] ?? cfg.headPower) * cfg.lossPerPower;
    } else if (u.state.owner === "enemy") {
      const key = `${sortie.id}/${u.id}`; if (c.heads[key]) continue; c.heads[key] = 1;
      const killer = result.events?.find(e => e.type === "UnitDied" && e.payload.unit === u.id)?.payload.killer;
      if (result.units.some(k => k.id === killer && k.state.owner === "player")) m.playerHeads++;
      const amount = power[model ?? ""] ?? cfg.headPower; m.enemyPower += amount;
      if (c.side === "target") { const entry = op.force.units.find(f => f.model === model); if (entry) entry.count = Math.max(0, entry.count - 1); }
      else op.enemyStr = Math.max(0, op.enemyStr - amount);
    }
  }
  const { outcome } = classifyOutcome(result, sortie), retreat = retreatRules(ctx);
  const friends = result.units.filter(u => u.id.includes("/force/friend/"));
  const friendWithdrew = (result as BattleResult & { withdrawn?: string[] }).withdrawn?.includes("ally")
    || friends.length > 0 && friends.every(u => u.status === "dead" || u.status === "retreated") && friends.some(u => u.status === "retreated");
  const won = !friendWithdrew && (outcome === "win" || outcome === "repelled");
  const ownWithdrew = outcome === "withdrew" || friendWithdrew;
  const actorWithdrew = c.side === "target" ? outcome === "repelled" : ownWithdrew;
  const targetWithdrew = c.side === "target" ? ownWithdrew : outcome === "repelled";
  if (actorWithdrew) {
    op.progress = Math.max(0, op.progress - retreat.progressLoss);
    op.force.morale = Math.max(-2, op.force.morale - retreat.moraleLoss);
  } else if (won && c.side !== "target") {
    // SPEC-GAP：規模係數以本場擊破／剩餘敵戰力折算，上限 1，單場最多推進 0.4。
    const scale = Math.min(1, Math.max(cfg.allyFraction[0], m.enemyPower / Math.max(cfg.headPower, m.initialEnemy)));
    op.progress = Math.min(1, op.progress + cfg.progress * scale);
  } else if (!won && c.side === "target") op.progress = Math.min(1, op.progress + cfg.progress);
  else if (!won) force.morale = Math.max(-2, force.morale - 1);
  else op.force.morale = Math.max(-2, op.force.morale - 1);
  if (targetWithdrew && op.target.faction) {
    const defender = s.factions[op.target.faction]?.forces;
    if (defender) defender.morale = Math.max(-2, defender.morale - retreat.moraleLoss);
  }
  if ((actorWithdrew || targetWithdrew) && op.target.faction) {
    changeRelation(s, ctx, op.actor, op.target.faction, retreat.relationDelta, "operation-retreat");
  }
  for (const order of joinTerms(ctx, c).orders) if (!orderDone(order, result)) {
    c.violations = (c.violations ?? 0) + 1; rep(s, ctx, c.issuer, -cfg.violationRep, "join-orders");
    ctx.emit("OrderViolated", { contract: c.id, sortie: sortie.id, violations: c.violations });
  }
  const shell = s.shells?.[op.target.shell ?? ""];
  // 核心沒有攜物欄；尋殼 reachExit 的玩家單位即搬運者（SPEC-GAP）。
  if (shell && result.winner === "player" && result.reason === "reachExit") {
    shell.holder = "player";
    for (const id of [c.issuer, factionId(s, ctx, "faction/selene-whitegloves"), factionId(s, ctx, "faction/residual-league")]) if (id && !shell.knownBy.includes(id)) shell.knownBy.push(id);
    betray(s, ctx, c, undefined, "shell-kept");
    for (const id of shell.knownBy) if ((ctx.world.get("faction-ops", id)?.stance.ancient ?? 0) <= -1) rep(s, ctx, id, -10, "player-shell");
    ctx.emit("ShellSeized", { shell: shell.id, holder: "player", operation: op.id });
  }
  if (ctx.world.require("operation", op.def).covert && !op.exposed) {
    const probability = Math.min(1, cfg.baseExposure + result.units.filter(u => u.state.owner === "player" && u.status !== "retreated").length * cfg.exposure);
    op.exposed = nextFloat(s.warRng ?? s.rng) < probability;
    op.log.push({ day: s.clock.day, kind: "player-exposure", v: probability });
    if (op.exposed) {
      joinDiplomacy(s, ctx, c, op);
      if (op.target.faction) drive(s, ctx, "op-success-against", op.actor, op.target.faction);
      op.log.push({ day: s.clock.day, kind: "proxy-accounted", v: 1 });
      ctx.emit("ProxyExposed", { operation: op.id, contract: c.id, employer: op.actor, player: 1 });
    }
  }
  op.force.supply = Math.max(0, op.force.supply - 10); op.engagesLeft--;
  op.log.push({ day: s.clock.day, kind: "player", v: op.progress });
  const phase = terminalPhase(op) ?? (op.engagesLeft <= 0 ? "failed" : undefined);
  if (phase === "resolve") { op.phase = "resolve"; op.phaseEnd = s.clock.day + 1; }
  else if (phase) endOperation(s, ctx, op, phase);
  if ((c.violations ?? 0) >= cfg.dismissal && !c.settled) { s.factions[c.issuer]!.memory.push({ day: s.clock.day, kind: "insubordinate", ref: c.id }); dropJoin(s, ctx, c); }
}
