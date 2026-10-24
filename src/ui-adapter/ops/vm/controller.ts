import type { ContentDB } from "../../../content/contentdb.ts";
import type { WorldDB } from "../../../ops/content/worlddb.ts";
import type { CampaignState, OpsCommand, Sortie } from "../../../ops/state/types.ts";
import { newCampaign, createOpsCtx } from "../../../ops/content/start.ts";
import { applyCommand, advanceDays } from "../../../ops/time/index.ts";
import type { BattleRunner, CmdResult } from "../../../ops/time/index.ts";
import { applyName } from "../../../ops/crew/names.ts";
import type { NamingPrompt } from "../../../ops/crew/names.ts";
import { defaultBattleRunner } from "../../../ops/sim/battle.ts";
import type { CampaignCommand } from "../../../ops/sim/campaign.ts";
import { createCampaignBlob, serializeCampaign, loadCampaign, parseCampaign } from "../../../ops/sim/save.ts";
import { sortieBattleSetup, applySortieResult } from "../../../ops/sortie/run.ts";
import { generateScenario } from "../../../ops/sortie/scenario.ts";
import { validateSortie } from "../../../ops/sortie/validate.ts";
import type { BattleResult } from "../../../ops/sortie/apply.ts";
import { canonicalJson } from "../../../core/eventlog.ts";
import { BattleSession, BattleController } from "../../vm/index.ts";
import { draftSortie, draftError, defaultUnit, controlMode, seatDefs, seatOptions } from "./formation.ts";
import { buildSnapshot } from "./snapshot.ts";
import type { ViewState } from "./snapshot.ts";
import { bindButtons, mergedBindings, resolveButtonKey } from "./keymap.ts";
import type { Binding } from "./keymap.ts";
import { displayName, label, rejection } from "./labels.ts";
import type { OpsKeyInput, OpsSnapshot, OpsUiAction, BattleReport } from "./types.ts";

export type OpsControllerOptions = { db: ContentDB; world: WorldDB; start?: string; seed: number; spectate?: boolean };
type LiveBattle = { controller: BattleController; session: BattleSession; cmd: Extract<OpsCommand, { v: "sortie" }>; sortie: Sortie; title: string };
export class OpsController {
  private current: CampaignState;
  private readonly opts: OpsControllerOptions;
  private readonly start: string;
  private readonly bindings: Binding[];
  private commands: CampaignCommand[] = [];
  private live: LiveBattle | null = null;
  private customNamed = false;
  private ui: ViewState = { tab: "ship", node: null, contract: null, mech: null, person: null, draft: null, battle: null, report: null, message: null, showHelp: false };

  constructor(opts: OpsControllerOptions) {
    this.opts = opts; this.start = opts.start ?? "start/default";
    this.current = newCampaign(opts.db, opts.world, this.start, opts.seed);
    this.bindings = mergedBindings(opts.world);
  }
  static fromSave(opts: OpsControllerOptions, text: string): OpsController {
    const blob = parseCampaign(text), controller = new OpsController({ ...opts, start: blob.start, seed: blob.seed });
    controller.current = loadCampaign(opts.db, opts.world, text);
    controller.commands = structuredClone(blob.commands); return controller;
  }
  serialize(): string {
    if (this.customNamed) throw new Error("自填命名尚無指令形式，本局無法存檔");
    if (this.live) throw new Error("請先完成戰鬥並返回營運再存檔");
    return serializeCampaign(createCampaignBlob(this.start, this.opts.seed, this.commands, this.current));
  }
  get state(): Readonly<CampaignState> { return structuredClone(this.current); }
  battleController(): BattleController | null { return this.live?.controller ?? null; }
  private ctx() { return createOpsCtx(this.current, this.opts.db, this.opts.world); }
  snapshot(): OpsSnapshot {
    const snapshot = buildSnapshot(this.current, this.ctx(), this.ui);
    bindButtons(snapshot, this.bindings); return structuredClone(snapshot);
  }
  key(k: OpsKeyInput): OpsUiAction | null { return resolveButtonKey(this.snapshot(), this.bindings, k); }

  private execute(cmd: OpsCommand, battle: BattleRunner = defaultBattleRunner): { ok: boolean; result?: BattleResult } {
    const record: CampaignCommand = structuredClone(cmd), captured: { result?: BattleResult } = {};
    const recording: BattleRunner = (s, ctx, sortie) => {
      const outcome = battle(s, ctx, sortie) as CmdResult & { result?: BattleResult };
      const result = outcome.ok && outcome.result ? structuredClone(outcome.result) : undefined;
      if (result) for (const entry of [...result.units, ...result.persons]) for (const pool of Object.values(entry.state.pools))
        if (pool.max === Infinity) pool.max = Number.MAX_SAFE_INTEGER;
      record.battle = { sortie: structuredClone(sortie), outcome: outcome.ok ? { ok: true } : { ok: false, error: outcome.error },
        ...(result ? { result } : {}), rng: structuredClone(s.rng), effectCounter: s.effectCounter };
      if (result) captured.result = result;
      return outcome;
    };
    const output = applyCommand(this.current, this.opts.db, this.opts.world, cmd, { battle: recording });
    this.commands.push(record); this.current = output.state;
    if (!output.result.ok) this.ui.message = rejection(output.result.error);
    return { ok: output.result.ok, ...captured };
  }
  private advance(until: "day" | "event"): void {
    for (let day = 0; day < (until === "day" ? 1 : 28); day++) {
      if (this.current.pendingChoices.length || this.current.pendingBattle || this.current.log.some(e => e.type === "CampaignEnd")) return;
      const before = this.current, offers = new Set(Object.values(before.contracts).filter(c => c.status === "offered").map(c => c.id));
      if (!this.execute({ v: "wait", days: 1 }).ok) return;
      const after = this.current;
      if (after.pendingChoices.length || after.pendingBattle || after.log.slice(before.log.length).some(e => e.type === "Arrived" || e.type === "CampaignEnd")
        || Object.values(after.contracts).some(c => c.status === "offered" && !offers.has(c.id))
        || Object.values(after.rifts).some(r => before.rifts[r.id]?.phase !== r.phase) || after.clock.day === before.clock.day) return;
    }
  }
  private report(before: CampaignState, result: BattleResult): BattleReport {
    const after = this.current, name = (id: string) => displayName(before, this.opts.db, this.opts.world, id);
    const cashDelta = after.ledger.balances.cash - before.ledger.balances.cash;
    const lines = [`現金變化：${cashDelta >= 0 ? "+" : ""}${cashDelta}`];
    for (const c of Object.values(after.contracts)) if (c.status !== before.contracts[c.id]?.status)
      lines.push(`${name(c.target.node)}契約：${label(c.status)}`);
    for (const r of Object.values(after.rifts)) if (r.phase !== before.rifts[r.id]?.phase) lines.push(`${name(r.node)}裂縫：${label(r.phase)}`);
    for (const u of result.units) lines.push(`${before.mechs[u.id] ? name(u.id) : name(u.state.frame)}：${label(u.status)}`);
    for (const p of result.persons) lines.push(`${before.roster.persons[p.id] ? name(p.id) : name(p.state.def)}：${label(p.status)}`);
    lines.push(`戰利品：${result.loot.length} 筆`);
    const resolved = after.log.slice(before.log.length).find(e => e.type === "BattleResolved");
    if (resolved) lines.push(`戰果已登錄：第 ${resolved.day} 日`);
    return { title: "戰果報告", winnerText: result.winner === "player" ? "我方勝利" : result.winner ? "我方戰敗" : "平局", rounds: result.rounds, cashDelta, lines };
  }
  private launch(mode: "command" | "auto"): void {
    const draft = this.ui.draft; if (!draft) { this.ui.message = "請先開啟出戰編成"; return; }
    const error = draftError(this.current, this.ctx(), draft); if (error) { this.ui.message = error; return; }
    const input: Partial<Sortie> = structuredClone(draft);
    if (!this.current.pendingBattle) delete input.id;
    const cmd: Extract<OpsCommand, { v: "sortie" }> = { v: "sortie", sortie: input }, before = this.current;
    if (mode === "auto") {
      const output = this.execute(cmd);
      if (output.ok && output.result) { this.ui.report = this.report(before, output.result); this.ui.draft = null; }
      return;
    }
    const captured: { setup?: Extract<ReturnType<typeof sortieBattleSetup>, { ok: true }>; sortie?: Sortie } = {};
    const output = applyCommand(before, this.opts.db, this.opts.world, cmd, { battle: (s, ctx, sortie) => {
      const setup = sortieBattleSetup(s, ctx, sortie); if (!setup.ok) return setup;
      captured.setup = setup; captured.sortie = structuredClone(sortie);
      return { ok: false, error: "ui-deferred" };
    } });
    if (!captured.setup || !captured.sortie) {
      this.ui.message = output.result.ok ? "無法建立戰場" : rejection(output.result.error); return;
    }
    const title = `${displayName(before, this.opts.db, this.opts.world, draft.node)}出戰`;
    const session = new BattleSession({ db: this.opts.db, sim: captured.setup.sim, seed: captured.setup.seed, autoAdvance: false, spectate: this.opts.spectate });
    this.live = { controller: new BattleController({ session, title }), session, sortie: captured.sortie, cmd, title };
    this.ui.battle = { title, spectate: !!this.opts.spectate };
  }
  private battleDone(): void {
    const live = this.live;
    if (!live || !live.session.outcome()) { this.ui.message = "戰鬥尚未分出勝負"; return; }
    const result = live.session.result(); if (!result) { this.ui.message = "戰果尚未產生"; return; }
    const before = this.current;
    const output = this.execute(live.cmd, (s, ctx, sortie) => {
      if (canonicalJson(sortie) !== canonicalJson(live.sortie)) return { ok: false, error: "sortie-mismatch" };
      const valid = validateSortie(s, ctx, sortie); if (!valid.ok) return valid;
      generateScenario(s, ctx, sortie);
      const copy = structuredClone(result);
      for (const unit of copy.units) if (s.mechs[unit.id] && sortie.units.some(u => u.mech === unit.id && u.controlMode === "instinct")) unit.state.frame = s.mechs[unit.id]!.frame;
      applySortieResult(s, ctx, sortie, copy);
      return { ok: true, result: copy };
    });
    if (output.ok && output.result) {
      this.ui.report = this.report(before, output.result); this.live = null; this.ui.battle = null; this.ui.draft = null;
    }
  }
  dispatch(action: OpsUiAction): OpsSnapshot {
    this.ui.message = null;
    if (this.live && action.type !== "battleDone") { this.ui.message = "戰鬥進行中"; return this.snapshot(); }
    const choosing = action.type === "nameSubmit" || action.type === "cmd" && action.cmd.v === "choose";
    if (this.current.pendingChoices.length && !choosing && action.type !== "battleDone") { this.ui.message = "先回應事件"; return this.snapshot(); }
    if (this.current.log.some(e => e.type === "CampaignEnd") && ["cmd", "advance", "sortieOpen", "sortieLaunch", "nameSubmit"].includes(action.type)) {
      this.ui.message = "戰役已結束"; return this.snapshot();
    }
    switch (action.type) {
      case "cmd": {
        const before = this.current, output = this.execute(action.cmd);
        if (!output.ok) break;
        switch (action.cmd.v) {
          case "map": this.ui.tab = "world"; break;
          case "board": this.ui.tab = "contracts"; this.ui.contract = action.cmd.contract ?? null; break;
          case "help": this.ui.showHelp = !this.ui.showHelp; break;
          case "look": {
            const id = action.cmd.target;
            if (id && this.current.mechs[id]) { this.ui.mech = id; this.ui.tab = "mechs"; }
            if (id && this.current.roster.persons[id]) { this.ui.person = id; this.ui.tab = "roster"; }
            break;
          }
          case "sortie": if (output.result) this.ui.report = this.report(before, output.result); break;
          case "save": if (this.customNamed) this.ui.message = "自填命名尚無指令形式，本局無法存檔"; break;
        }
        break;
      }
      case "tab": this.ui.tab = action.tab; break;
      case "selectNode": this.ui.node = action.node; break;
      case "selectContract": this.ui.contract = action.contract; break;
      case "selectMech": this.ui.mech = action.mech; break;
      case "selectPerson": this.ui.person = action.person; break;
      case "advance": this.advance(action.until); break;
      case "sortieOpen": this.ui.draft = draftSortie(this.current, this.ctx(), action.contract ?? this.ui.contract ?? undefined); break;
      case "sortieToggle": {
        const draft = this.ui.draft; if (!draft || !this.current.mechs[action.mech]) break;
        const index = draft.units.findIndex(u => u.mech === action.mech);
        if (index >= 0) draft.units.splice(index, 1);
        else draft.units.push(defaultUnit(this.current, this.ctx(), action.mech, new Set(draft.units.flatMap(u => Object.values(u.seats).filter((id): id is string => !!id)))));
        break;
      }
      case "sortieSeat": {
        const unit = this.ui.draft?.units.find(u => u.mech === action.mech); if (!unit) break;
        if (!seatDefs(this.current, this.ctx(), action.mech).some(s => s.id === action.seat)
          || action.person !== null && !seatOptions(this.current, this.ctx(), action.mech, action.seat).includes(action.person)) { this.ui.message = "人物與座位不相容"; break; }
        unit.seats[action.seat] = action.person; unit.controlMode = controlMode(this.current, this.ctx(), unit); break;
      }
      case "sortieLaunch": this.launch(action.mode); break;
      case "sortieCancel": this.ui.draft = null; break;
      case "battleDone": this.battleDone(); break;
      case "dismissReport": this.ui.report = null; break;
      case "toggleHelp": this.ui.showHelp = !this.ui.showHelp; break;
      case "cancel": if (this.ui.showHelp) this.ui.showHelp = false; else if (this.ui.report) this.ui.report = null; else this.ui.draft = null; break;
      case "nameSubmit": {
        const naming = (this.current.pendingChoices[0] as Partial<NamingPrompt> | undefined)?.naming;
        if (!naming) { this.ui.message = "目前沒有命名事件"; break; }
        const copy = structuredClone(this.current), ctx = createOpsCtx(copy, this.opts.db, this.opts.world);
        const result = applyName(copy, ctx, naming.mech, naming.by, action.name);
        if (!result.ok) { this.ui.message = rejection(result.error); break; }
        if (!copy.pendingChoices.length) advanceDays(copy, ctx, 0);
        // SPEC-GAP：自填命名沒有可重播的 OpsCommand，因此此後明確拒絕序列化。
        this.current = copy; this.customNamed = true; this.ui.message = "自填命名尚無指令形式，本局無法存檔"; break;
      }
    }
    return this.snapshot();
  }
}
