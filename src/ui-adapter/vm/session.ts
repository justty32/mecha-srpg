import type { ContentDB } from "../../content/contentdb.ts";
import type { Id } from "../../core/ids.ts";
import type { FactionSlot } from "../../core/types-def.ts";
import type { GameEvent } from "../../core/events.ts";
import type { BattleOutcome, BattleState, Command } from "../../core/types-state.ts";
import type { SimSetup } from "../../sim/run.ts";
import { createSession } from "../../sim/session.ts";
import type { BattleSession as SimSession, SessionQuery, SessionStep, SessionSubmitResult } from "../../sim/session.ts";

/** spectate：全 AI 對戰（sim 無人類陣營），playerSlot 只當視角。 */
export type SessionOptions = { db: ContentDB; sim: SimSetup; seed: number; playerSlot?: FactionSlot; autoAdvance?: boolean; spectate?: boolean };

// sim BattleSession 的薄包裝：所有推進只經 sim 的 submit／stepAi；本層只負責 batches、observers 與玩家視角。
export class BattleSession {
  readonly db: ContentDB;
  readonly state: BattleState;
  readonly playerSlot: FactionSlot;
  readonly autoAdvance: boolean;
  readonly spectate: boolean;
  readonly batches: { command: Command; events: GameEvent[]; visible: Id[] }[] = [];
  /** 每個成功指令前後各呼叫一次（前一次讓 viewmodel 拍敵方部件快照）。 */
  readonly observers = new Set<() => void>();
  readonly query: SessionQuery;
  private readonly inner: SimSession;
  private last: SessionStep | null = null;

  constructor(opts: SessionOptions) {
    this.db = opts.db;
    this.playerSlot = opts.playerSlot ?? "player";
    this.autoAdvance = opts.autoAdvance ?? true;
    this.spectate = opts.spectate ?? false;
    this.inner = createSession({ db: opts.db, sim: opts.sim, seed: opts.seed,
      human: this.spectate ? [] : [this.playerSlot], maxSteps: Number.MAX_SAFE_INTEGER });
    // sim 對外給 Readonly；ui-adapter 沿用既有可寫型別（測試會直接改 knowledge 模擬視野）。
    this.state = this.inner.state as BattleState;
    this.query = this.inner.rulesQuery;
    this.inner.trackKnowledge(this.playerSlot);
    this.inner.observe(step => { this.last = step; });
    if (this.autoAdvance) this.advanceAi();
  }

  /** 成功指令序列（僅供讀取；型別沿用舊介面）。 */
  get commands(): Command[] { return this.inner.commands as Command[]; }
  activeUnit(): Id | null { return this.inner.currentActor(); }
  isPlayerTurn(): boolean { return this.inner.isHumanTurn(); }
  outcome(): BattleOutcome | null { return this.inner.outcome(); }

  /** 包一次 sim 推進：前 observer → 推進 → 若有成功指令則推 batch、後 observer。 */
  private track<T>(advance: () => T): T {
    for (const observer of this.observers) observer();
    const visible = [...(this.state.knowledge[this.playerSlot]?.visible ?? [])];
    this.last = null;
    const result = advance();
    const step = this.last as SessionStep | null;
    if (step) {
      this.batches.push({ command: this.inner.commands.at(-1)!, events: step.events,
        visible: [...new Set([...visible, ...(this.state.knowledge[this.playerSlot]?.visible ?? [])])] });
      for (const observer of this.observers) observer();
    }
    return result;
  }

  private stepOnce(): SessionStep | null { return this.track(() => this.inner.stepAi()); }

  private turnKey(): string {
    const actor = this.activeUnit();
    return `${actor}:${this.state.log.events.findLast(e => e.type === "TurnStart" && e.payload.unit === actor)?.seq}`;
  }

  submit(cmd: Command): SessionSubmitResult {
    if (this.outcome()) return { ok: false, rejection: { code: "battle-over" } };
    if (!this.isPlayerTurn()) return { ok: false, rejection: { code: "not-active" } };
    const result = this.track(() => this.inner.submit(cmd));
    if (result.ok && this.autoAdvance) this.advanceAi();
    return result;
  }

  /** 跑完一台 AI 的單位回合（行動者換人、分勝負或 sim 停下為止）。 */
  stepAi(): { actor: Id | null; events: GameEvent[] } {
    const actor = this.activeUnit();
    if (this.outcome() || this.isPlayerTurn() || actor === null) return { actor: null, events: [] };
    const key = this.turnKey(), from = this.state.log.events.length;
    let progressed = false, retried = false;
    for (;;) {
      if (!this.stepOnce()) {
        // sim 在收掉上一回合殘留的失敗指令時會回一次 null；沒進展才再試一次。
        if (progressed || retried) break;
        retried = true; continue;
      }
      progressed = true;
      if (this.outcome() || this.turnKey() !== key) break;
    }
    return { actor, events: this.state.log.events.slice(from) };
  }

  /** 連續跑 AI 直到輪到玩家或分勝負；maxSteps 為本次最多成功指令數。 */
  advanceAi(maxSteps = 10000): number {
    if (!Number.isSafeInteger(maxSteps) || maxSteps < 0) throw new Error("maxSteps 必須是非負整數");
    const before = this.commands.length;
    let retried = false;
    while (!this.outcome() && !this.isPlayerTurn() && this.activeUnit() !== null && this.commands.length - before < maxSteps) {
      if (this.stepOnce()) retried = false;
      else if (retried) break;
      else retried = true;
    }
    return this.commands.length - before;
  }
}
