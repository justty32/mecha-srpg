import type { ContentDB } from "../content/contentdb.ts";
import type { Id } from "../core/ids.ts";
import type { FactionSlot } from "../core/types-def.ts";
import type { GameEvent } from "../core/events.ts";
import type { BattleOutcome, BattleState, Command } from "../core/types-state.ts";
import { cloneBattleState } from "../core/clone-state.ts";
import { hashLog } from "../core/eventlog.ts";
import { movementBudget, partHitInfo, inspectDefense, injuryEffectApplies, isDead, aimInfo, layerDefs, locomotionOf, partDefs, abilitiesOf, battleResult, checkAbility, createBattle, currentActor, damageFactor, previewCommand, rt,
  startBattle, tryCommand } from "../rules/index.ts";
import type { PartHitInfo, DefenseInfo, BattleResult, Result } from "../rules/index.ts";
import { createFactionAI, observeEvents, runUnitTurn, startRound } from "../ai/index.ts";
import type { FactionAI, RulesQuery } from "../ai/index.ts";
import { createRulesQuery } from "../ai/adapters/rules-adapter.ts";
import type { SimSetup } from "./run.ts";
import { emptyKnowledge, observe as observeKnowledge, updateKnowledge } from "../ai/index.ts";

export type SessionOptions = { db: ContentDB; sim: SimSetup; seed: number; human?: FactionSlot[]; maxSteps?: number };
export type AbilityTarget = NonNullable<Extract<Command, { kind: "useAbility" }>["target"]>;
export type LegalActions = { actor: Id | null; reachable: Record<string, number>;
  abilities: { ability: Id; targets: AbilityTarget[] }[]; wait: boolean; retreat: boolean; eject: boolean; end: boolean };
export type PartTargetInfo = PartHitInfo & { chance: number; aim: { radius: number; error: number; distance: number; lateral: number; maneuver: number; cover: number; skill: number };
  fatalOnBreak: boolean; defense: DefenseInfo | null;
  layers: { type: string; hp: number; max: number }[]; functions: string[]; disabledAbilities: Id[]; effectsOnBreak: Id[]; mobilityAfter: string | null };
export type SessionStep = { actor: Id; cmd: Command; events: GameEvent[] };
export type SessionSubmitResult = Result | { ok: false; rejection: { code: "max-steps" | "busy" } };
export type SessionObserver = (step: SessionStep) => void;
/** 查詢介面（給 ui-adapter 等不直接依賴 ai／rules 的呼叫端）。 */
export type SessionQuery = RulesQuery;
type PendingTurn = { actor: Id; slot: FactionSlot; from: number;
  entries: { cmd: Command; ok: boolean }[]; index: number; limited: boolean };

/** state 與 commands 僅供讀取；所有推進均經 submit／stepAi，建立時不自動跑 AI。 */
export class BattleSession {
  private readonly s: BattleState;
  private readonly db: ContentDB;
  private readonly sim: SimSetup;
  private readonly seed: number;
  private readonly human: Set<FactionSlot>;
  private readonly maxSteps: number;
  private readonly query: RulesQuery;
  private readonly history: Command[] = [];
  private readonly ais = new Map<FactionSlot, FactionAI>();
  private readonly observers = new Set<SessionObserver>();
  private round = -1;
  private attempts = 0;
  private pending: PendingTurn | null = null;
  private stalled = false;
  private busy = false;

  constructor(opts: SessionOptions) {
    const maxSteps = opts.maxSteps ?? 10000;
    if (!Number.isInteger(maxSteps) || maxSteps < 0) throw new Error("maxSteps 必須是非負整數");
    this.db = opts.db; this.sim = opts.sim; this.seed = opts.seed; this.maxSteps = maxSteps;
    this.human = new Set(opts.human ?? []);
    this.s = createBattle(opts.db, opts.sim.setup, opts.seed);
    this.query = createRulesQuery(opts.db);
    startBattle({ db: this.db, s: this.s });
  }

  get state(): Readonly<BattleState> { return this.s; }
  get commands(): readonly Command[] { return this.history; }
  currentActor(): Id | null { return currentActor(this.s); }
  isHumanTurn(): boolean {
    const actor = this.currentActor();
    return !this.outcome() && actor !== null && this.human.has(this.s.units[actor]!.owner);
  }
  outcome(): BattleOutcome | null { return rt(this.s).outcome; }
  result(): BattleResult | null { return battleResult({ db: this.db, s: this.s }); }
  hash(): string { return hashLog(this.s.log); }
  preview(cmd: Command): ReturnType<typeof previewCommand> { return previewCommand({ db: this.db, s: this.s }, cmd); }
  /** 傷害修正鏈的確定性倍率（近戰／遠程增傷 × 全局修正表 × 抵抗性；不含暴擊與層）；估算顯示用，不改 state。 */
  damageFactor(actor: Id, ability: Id, target: Id): number { return damageFactor({ db: this.db, s: this.s }, actor, ability, target); }
  observe(fn: SessionObserver): () => void {
    this.observers.add(fn);
    return () => { this.observers.delete(fn); };
  }

  movementBudget(id: Id): ReturnType<typeof movementBudget> { return movementBudget({ db: this.db, s: this.s }, id); }

  partTargetInfo(actor: Id, ability: Id, target: Id, part?: string): PartTargetInfo {
    const ctx = { db: this.db, s: this.s }, geometry = aimInfo(ctx, actor, ability, target, part);
    const definition = part === undefined ? undefined : partDefs(ctx, target).find(p => p.id === part);
    const before = abilitiesOf(ctx, target), cloned = cloneBattleState(this.s), after = { db: this.db, s: cloned };
    if (part !== undefined && cloned.units[target]?.parts[part]) cloned.units[target]!.parts[part]!.broken = true;
    const remaining = abilitiesOf(after, target);
    return { ...geometry, ...partHitInfo(ctx, target, part, this.db.require("ability", ability).partPattern, inspectDefense(ctx, actor, ability, target)), fatalOnBreak: part !== undefined && isDead(after, target), defense: inspectDefense(ctx, actor, ability, target),
      layers: definition ? layerDefs(ctx, target, definition.id).map((layer, index) => ({ type: layer.type, hp: this.s.units[target]!.parts[definition.id]!.layers[index]!.hp, max: layer.hp })) : [],
      functions: definition ? [...definition.functions] : [], disabledAbilities: before.filter(id => !remaining.includes(id)),
      effectsOnBreak: (definition?.onBroken ?? []).filter(ref => injuryEffectApplies(ctx, this.db.require("effect", typeof ref === "string" ? ref : ref.effect), { unit: target, ...(part ? { part } : {}) })).map(ref => typeof ref === "string" ? ref : ref.effect), mobilityAfter: locomotionOf(after, target) };
  }

  legalActions(unit: Id | null = this.currentActor()): LegalActions {
    const actions: LegalActions = { actor: unit, reachable: {}, abilities: [], wait: false, retreat: false, eject: false, end: false };
    if (unit === null || unit !== this.currentActor() || this.outcome() || this.attempts >= this.maxSteps) return actions;
    const ctx = { db: this.db, s: this.s };
    if (!["none", "disabled"].includes(this.s.units[unit]!.controlMode)) actions.reachable = this.query.reachable(this.s, unit);
    for (const ability of abilitiesOf(ctx, unit)) {
      const def = this.db.require("ability", ability), targets: AbilityTarget[] = [];
      if (def.mode === "reaction" || def.mode === "passive") continue;
      const add = (target: AbilityTarget): void => {
        if (checkAbility(ctx, unit, ability, target) === null) targets.push(target);
      };
      if (def.target.kind === "self") add({ unit });
      else if (def.target.kind === "unit" || def.target.kind === "part") {
        for (const target of Object.keys(this.s.units).sort()) {
          if (def.target.kind === "unit") add({ unit: target });
          if (def.partAim?.allowed) for (const part of Object.keys(this.s.units[target]!.parts).sort()) add({ unit: target, part });
        }
        if (["unit", "part"].includes(def.target.kind) && def.packets.length) {
          for (let y = 0; y < this.s.map.height; y++) for (let x = 0; x < this.s.map.width; x++) add({ cell: { x, y } });
        }
      } else {
        for (let y = 0; y < this.s.map.height; y++) for (let x = 0; x < this.s.map.width; x++) add({ cell: { x, y } });
      }
      actions.abilities.push({ ability, targets });
    }
    for (const kind of ["wait", "retreat", "eject", "end"] as const) actions[kind] = this.preview({ kind, actor: unit }).result.ok;
    return actions;
  }

  // 與 runBattle 相同：新陣營及輪次只在開始處理下一個單位回合時同步。
  private prepare(): void {
    for (const slot of Object.keys(this.s.factions).sort()) {
      if (this.human.has(slot) || this.ais.has(slot)) continue;
      const profile = this.sim.slotProfiles[slot];
      const ai = createFactionAI({ slot, seed: this.seed, policy: profile?.policy,
        params: profile?.params, unitPolicies: this.sim.unitPolicies[slot] });
      this.ais.set(slot, ai);
      if (this.round === this.s.round) startRound(ai, this.query, this.s);
    }
    if (this.round !== this.s.round) {
      this.round = this.s.round;
      for (const ai of this.ais.values()) startRound(ai, this.query, this.s);
    }
  }

  private observeOthers(slot: FactionSlot, from: number): void {
    const events = this.s.log.events.slice(from);
    for (const [other, ai] of this.ais) if (other !== slot) observeEvents(ai, this.query, this.s, events);
  }

  private execute(cmd: Command): Result {
    this.attempts++;
    const result = tryCommand({ db: this.db, s: this.s }, cmd);
    if (result.ok) this.history.push(structuredClone(cmd));
    return result;
  }

  private notify(cmd: Command, events: GameEvent[]): SessionStep {
    const step = { actor: cmd.actor, cmd: structuredClone(cmd), events };
    for (const observer of this.observers) observer(step);
    return step;
  }

  submit(cmd: Command): SessionSubmitResult {
    if (this.outcome()) return { ok: false, rejection: { code: "battle-over" } };
    if (this.busy) return { ok: false, rejection: { code: "busy" } };
    if (!this.isHumanTurn()) return { ok: false, rejection: { code: "not-active" } };
    if (this.attempts >= this.maxSteps) return { ok: false, rejection: { code: "max-steps" } };
    this.busy = true;
    try {
      this.prepare();
      const slot = this.s.units[this.currentActor()!]!.owner, from = this.s.log.events.length;
      const result = this.execute(cmd);
      this.observeOthers(slot, from);
      if (result.ok) this.notify(cmd, result.events);
      return result;
    } finally { this.busy = false; }
  }

  private planTurn(actor: Id): void {
    this.prepare();
    const slot = this.s.units[actor]!.owner;
    const pending: PendingTurn = { actor, slot, from: this.s.log.events.length, entries: [], index: 0, limited: false };
    const limit = Symbol("maxSteps"), copy = structuredClone(this.s);
    try {
      // 使用真正 AI 搭配狀態副本：RNG、知識、代理記憶與策略 closure 只前進一次。
      // 佇列耗盡前不再呼叫 AI；其他陣營仍待真狀態完成整個回合才觀測。
      runUnitTurn(this.ais.get(slot)!, this.query, copy, actor, (s, cmd) => {
        if (this.attempts + pending.entries.length >= this.maxSteps) throw limit;
        const result = tryCommand({ db: this.db, s }, cmd);
        pending.entries.push({ cmd: structuredClone(cmd), ok: result.ok });
        return result;
      });
    } catch (error) {
      if (error !== limit) throw error;
      pending.limited = true;
    }
    this.pending = pending;
  }

  private drainTail(pending: PendingTurn): void {
    while (pending.index < pending.entries.length) {
      const entry = pending.entries[pending.index++]!;
      if (this.execute(entry.cmd).ok !== entry.ok) throw new Error("AI 佇列與真狀態不一致；state 僅供讀取");
    }
    this.finishTurn(pending);
  }

  private finishTurn(pending: PendingTurn): void {
    // runBattle 在上限中斷 runUnitTurn 時也不會通知其他陣營。
    if (!pending.limited) this.observeOthers(pending.slot, pending.from);
    this.stalled = !pending.entries.some(entry => entry.ok) && this.currentActor() === pending.actor;
    this.pending = null;
  }

  stepAi(): SessionStep | null {
    if (this.busy || this.outcome() || this.isHumanTurn() || this.attempts >= this.maxSteps || this.stalled) return null;
    const actor = this.currentActor();
    if (actor === null) return null;
    this.busy = true;
    try {
      if (!this.pending) this.planTurn(actor);
      const pending = this.pending!;
      while (pending.index < pending.entries.length) {
        const entry = pending.entries[pending.index++]!, result = this.execute(entry.cmd);
        if (result.ok !== entry.ok) throw new Error("AI 佇列與真狀態不一致；state 僅供讀取");
        if (!result.ok) continue;
        // 最後一個成功指令之後只剩被拒指令時一併消化並收尾，免得下一次呼叫空回一個 null。
        if (!pending.entries.slice(pending.index).some(e => e.ok)) this.drainTail(pending);
        return this.notify(entry.cmd, result.events);
      }
      if (this.pending) this.finishTurn(pending);
      return null;
    } finally { this.busy = false; }
  }

  /** 內容資料庫（唯讀）。欄位 `db` 為既有 private，故以此名公開。 */
  get contentDb(): ContentDB { return this.db; }
  /** 規則查詢介面；同上，既有 private `query` 以此名公開。 */
  get rulesQuery(): SessionQuery { return this.query; }

  /**
   * 為某陣營維護 state.knowledge[slot]：立即以全部既有事件更新一次，之後每個成功指令
   * （submit 與 stepAi）先於之後註冊的 observer 更新。knowledge 不進 hashLog、AI 不讀它。
   */
  trackKnowledge(slot: FactionSlot): () => void {
    const refresh = (events: readonly GameEvent[]): void => {
      const s = this.s, q = this.query;
      s.knowledge[slot] = observeKnowledge(q, s, updateKnowledge(q, s, slot, s.knowledge[slot] ?? emptyKnowledge()), slot, events);
    };
    refresh(this.s.log.events);
    return this.observe(step => refresh(step.events));
  }

  runAiUntilHuman(): number {
    const before = this.history.length;
    while (this.stepAi() !== null) { /* 每次恰好一個成功指令。 */ }
    return this.history.length - before;
  }
}

export function createSession(opts: SessionOptions): BattleSession { return new BattleSession(opts); }
