import type { ContentDB } from "../../content/contentdb.ts";
import type { Id } from "../../core/ids.ts";
import type { FactionSlot } from "../../core/types-def.ts";
import type { BattleOutcome, BattleState, Command } from "../../core/types-state.ts";
import type { SimSetup } from "../../sim/run.ts";
import { createBattle, startBattle, currentActor, tryCommand, rt } from "../../rules/index.ts";
import type { Result } from "../../rules/index.ts";
import { createFactionAI, startRound, runUnitTurn, observeEvents, updateKnowledge, observe, emptyKnowledge } from "../../ai/index.ts";
import type { FactionAI, RulesQuery } from "../../ai/index.ts";
import { createRulesQuery } from "../../ai/adapters/rules-adapter.ts";

export type SessionOptions = { db: ContentDB; sim: SimSetup; seed: number; playerSlot?: FactionSlot };

// SPEC-GAP：互動逐步 API 尚未進 sim；本檔集中所有規則與 AI 存取。
export class BattleSession {
  readonly db: ContentDB;
  readonly state: BattleState;
  readonly playerSlot: FactionSlot;
  readonly commands: Command[] = [];
  readonly query: RulesQuery;
  private readonly sim: SimSetup;
  private readonly seed: number;
  private readonly ais = new Map<FactionSlot, FactionAI>();
  private round = -1;

  constructor(opts: SessionOptions) {
    this.db = opts.db; this.sim = opts.sim; this.seed = opts.seed;
    this.playerSlot = opts.playerSlot ?? "player";
    this.state = createBattle(opts.db, opts.sim.setup, opts.seed);
    this.query = createRulesQuery(opts.db);
    startBattle({ db: this.db, s: this.state });
    this.refreshKnowledge(0);
    this.advanceAi();
  }

  activeUnit(): Id | null { return currentActor(this.state); }
  isPlayerTurn(): boolean {
    const actor = this.activeUnit();
    return !this.outcome() && actor !== null && this.state.units[actor]?.owner === this.playerSlot;
  }
  outcome(): BattleOutcome | null { return rt(this.state).outcome; }

  private refreshKnowledge(from: number): void {
    // SPEC-GAP：規則層不維護陣營知識；沿用 AI 的觀測器更新玩家知識，不改事件或 RNG。
    const s = this.state, q = this.query;
    s.knowledge[this.playerSlot] = observe(q, s,
      updateKnowledge(q, s, this.playerSlot, s.knowledge[this.playerSlot] ?? emptyKnowledge()),
      this.playerSlot, s.log.events.slice(from));
  }

  private execute(cmd: Command): Result {
    const from = this.state.log.events.length, slot = this.state.units[cmd.actor]?.owner;
    const result = tryCommand({ db: this.db, s: this.state }, cmd);
    if (result.ok) {
      this.commands.push(structuredClone(cmd));
      this.refreshKnowledge(from);
      for (const [other, ai] of this.ais) if (other !== slot) observeEvents(ai, this.query, this.state, result.events);
    }
    return result;
  }

  submit(cmd: Command): Result {
    if (this.outcome()) return { ok: false, rejection: { code: "battle-over" } };
    if (!this.isPlayerTurn()) return { ok: false, rejection: { code: "not-active" } };
    const result = this.execute(cmd);
    if (result.ok) this.advanceAi();
    return result;
  }

  advanceAi(maxSteps = 10000): number {
    if (!Number.isSafeInteger(maxSteps) || maxSteps < 0) throw new Error("maxSteps 必須是非負整數");
    const before = this.commands.length, limit = Symbol("AI 步數上限");
    let attempts = 0;
    try {
      while (!this.outcome() && !this.isPlayerTurn() && attempts < maxSteps) {
        const actor = this.activeUnit();
        if (actor === null) break;
        for (const slot of Object.keys(this.state.factions).sort()) {
          if (slot === this.playerSlot || this.ais.has(slot)) continue;
          const profile = this.sim.slotProfiles[slot];
          const ai = createFactionAI({ slot, seed: this.seed, policy: profile?.policy,
            params: profile?.params, unitPolicies: this.sim.unitPolicies[slot] });
          this.ais.set(slot, ai);
          if (this.round === this.state.round) startRound(ai, this.query, this.state);
        }
        if (this.round !== this.state.round) {
          this.round = this.state.round;
          for (const ai of this.ais.values()) startRound(ai, this.query, this.state);
        }
        const count = this.commands.length, slot = this.state.units[actor]!.owner;
        runUnitTurn(this.ais.get(slot)!, this.query, this.state, actor, (_s, cmd) => {
          if (attempts >= maxSteps) throw limit;
          attempts++;
          return this.execute(cmd);
        });
        if (this.commands.length === count && this.activeUnit() === actor) break;
      }
    } catch (error) { if (error !== limit) throw error; }
    return this.commands.length - before;
  }
}
