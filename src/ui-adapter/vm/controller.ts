import type { ContentDB } from "../../content/contentdb.ts";
import { scenarioTitle } from "./labels.ts";
import type { Id } from "../../core/ids.ts";
import { cellKey } from "../../core/ids.ts";
import type { Cell } from "../../core/types-def.ts";
import type { Command } from "../../core/types-state.ts";
import { scenarioToSetup } from "../../sim/run.ts";
import { BattleSession } from "./session.ts";
import { BattleViewModel } from "./viewmodel.ts";
import { DEFAULT_KEYMAP, keyLabel, resolveKey } from "./keymap.ts";
import { rejectionText } from "./text.ts";
import type { CellView, CommandOption, KeyInput, KeymapFile, LogLine, Mode, UiAction, UiSnapshot } from "./types.ts";

export type ControllerOptions = { session: BattleSession; title?: string; keymap?: KeymapFile; viewport?: { w: number; h: number } };
type Target = NonNullable<Extract<Command, { kind: "useAbility" }>["target"]>;

export class BattleController {
  readonly session: BattleSession;
  readonly vm: BattleViewModel;
  private readonly title: string;
  private readonly keymap: KeymapFile;
  private cursor: Cell;
  private mode: Mode = { kind: "idle" };
  private selected: Id | null;
  private message: string | null = null;
  private showHelp = false;
  private lastViewport = "";
  private lastCells = new Map<string, string>();
  private logCursor = 0;
  private log: LogLine[] = [];
  private reachCache: { key: string; cells: Set<string> } | null = null;

  constructor(opts: ControllerOptions) {
    this.session = opts.session; this.vm = new BattleViewModel(opts.session);
    this.title = opts.title ?? "戰術戰鬥"; this.keymap = structuredClone(opts.keymap ?? DEFAULT_KEYMAP);
    if (opts.viewport) this.vm.setViewport(0, 0, opts.viewport.w, opts.viewport.h);
    this.selected = this.session.isPlayerTurn() ? this.session.activeUnit()
      : Object.values(this.session.state.units).find(u => u.owner === this.session.playerSlot)?.id ?? null;
    this.cursor = { ...(this.selected ? this.session.state.units[this.selected]!.pos : { x: 0, y: 0 }) };
    this.ensureCursor();
  }

  private ensureCursor(): void {
    const v = this.vm.viewport, c = this.cursor;
    this.vm.setViewport(c.x < v.x ? c.x : c.x >= v.x + v.w ? c.x - v.w + 1 : v.x,
      c.y < v.y ? c.y : c.y >= v.y + v.h ? c.y - v.h + 1 : v.y);
  }

  private targetAt(ability: Id, cell: Cell): Target {
    const { query: q, state: s } = this.session, actor = this.session.activeUnit()!;
    const a = q.abilityDef(ability);
    if (a.target.kind === "self") return { unit: actor };
    if (a.target.kind !== "unit" && a.target.kind !== "part") return { cell: { ...cell } };
    const id = this.vm.cell(cell.x, cell.y).unit?.id;
    if (!id) return {};
    if (a.target.kind !== "part") return { unit: id };
    // SPEC-GAP：凍結操作沒有選部位；選宣告順序中第一個合法部位，仍由規則驗證。
    const part = q.partDefs(s, id).find(p => !q.checkAbility(s, actor, ability, { unit: id, part: p.id }));
    return { unit: id, ...(part ? { part: part.id } : {}) };
  }

  private reachable(): Set<string> {
    const s = this.session.state, actor = this.session.activeUnit();
    if (!actor || !this.session.isPlayerTurn()) return new Set();
    const key = `${actor}:${s.round}:${s.rt?.actionSeq}:${s.log.events.length}`;
    if (this.reachCache?.key !== key) this.reachCache = { key, cells: new Set(Object.keys(this.session.query.reachable(s, actor))) };
    return this.reachCache.cells;
  }

  private send(cmd: Command): void {
    const result = this.session.submit(cmd);
    if (!result.ok) { this.message = rejectionText(result.rejection.code); return; }
    this.mode = { kind: "idle" }; this.message = null;
    if (this.session.isPlayerTurn()) this.selected = this.session.activeUnit();
  }

  private beginAbility(ability: Id): void {
    const actor = this.session.activeUnit();
    if (!actor || !this.session.isPlayerTurn()) { this.message = rejectionText("not-active"); return; }
    const { query: q, state: s } = this.session;
    const rejected = q.checkAbility(s, actor, ability);
    if (rejected) { this.message = rejectionText(rejected.code); return; }
    const a = q.abilityDef(ability);
    if (a.mode === "passive" || a.mode === "reaction") { this.message = rejectionText("require-failed"); return; }
    this.selected = actor;
    if (a.target.kind === "self") this.send({ kind: "useAbility", actor, ability: a.id });
    else this.mode = { kind: "target", ability: a.id, abilityName: a.name };
  }

  private click(cell: Cell): void {
    if (!this.session.query.inBounds(this.session.state, cell)) { this.message = "座標超出地圖"; return; }
    this.cursor = { ...cell }; this.ensureCursor();
    const actor = this.session.activeUnit();
    if (this.mode.kind === "idle") {
      const unit = this.vm.cell(cell.x, cell.y).unit;
      if (unit?.owner === this.session.playerSlot) this.selected = unit.id;
    } else if (!actor || !this.session.isPlayerTurn()) this.message = rejectionText("not-active");
    else if (this.mode.kind === "move") {
      const path = this.session.query.pathTo(this.session.state, actor, cell);
      if (!path?.length) this.message = rejectionText("bad-path");
      else this.send({ kind: "move", actor, path });
    } else {
      const target = this.targetAt(this.mode.ability, cell);
      this.send({ kind: "useAbility", actor, ability: this.mode.ability, target });
    }
  }

  dispatch(a: UiAction): UiSnapshot {
    this.message = null;
    const s = this.session.state, actor = this.session.activeUnit();
    switch (a.type) {
      case "clickCell": this.click({ x: a.x, y: a.y }); break;
      case "hoverCell": if (this.session.query.inBounds(s, a)) this.cursor = { x: a.x, y: a.y }; break;
      case "cursor": {
        const offset = (n: number) => Number.isFinite(n) ? Math.trunc(n) : 0;
        this.cursor = { x: Math.max(0, Math.min(s.map.width - 1, this.cursor.x + offset(a.dx))),
          y: Math.max(0, Math.min(s.map.height - 1, this.cursor.y + offset(a.dy))) };
        this.ensureCursor(); break;
      }
      case "confirm": this.click(this.cursor); break;
      case "cancel": if (this.mode.kind === "idle") this.showHelp = false; this.mode = { kind: "idle" }; break;
      case "scroll": this.vm.setViewport(this.vm.viewport.x + a.dx, this.vm.viewport.y + a.dy); break;
      case "setViewport": this.vm.setViewport(a.x, a.y); break;
      case "resize": this.vm.setViewport(this.vm.viewport.x, this.vm.viewport.y, a.w, a.h); break;
      case "centerActive": if (actor) {
        this.cursor = { ...s.units[actor]!.pos };
        this.vm.setViewport(this.cursor.x - Math.floor(this.vm.viewport.w / 2), this.cursor.y - Math.floor(this.vm.viewport.h / 2));
      } break;
      case "nextUnit": {
        const own = Object.values(s.units).filter(u => u.owner === this.session.playerSlot && this.session.query.isActive(s, u.id)).map(u => u.id).sort();
        if (own.length) {
          this.selected = own[(own.indexOf(this.selected ?? "") + 1) % own.length]!;
          this.cursor = { ...s.units[this.selected]!.pos }; this.ensureCursor(); this.mode = { kind: "idle" };
        }
        break;
      }
      case "beginMove":
        if (!this.session.isPlayerTurn()) this.message = rejectionText("not-active");
        else if (!this.reachable().size) this.message = "沒有可達格";
        else { this.selected = actor; this.mode = { kind: "move" }; }
        break;
      case "beginAbility": this.beginAbility(a.ability); break;
      case "abilitySlot": {
        const ability = actor && this.session.query.abilitiesOf(s, actor)[a.n - 1];
        if (ability) this.beginAbility(ability); else this.message = "此位置沒有能力";
        break;
      }
      case "endTurn": case "wait": case "eject": case "retreat":
        if (actor) this.send({ kind: a.type === "endTurn" ? "end" : a.type, actor });
        else this.message = rejectionText(this.session.outcome() ? "battle-over" : "not-active");
        break;
      case "toggleHelp": this.showHelp = !this.showHelp; break;
    }
    return this.snapshot();
  }

  key(k: KeyInput): UiSnapshot | null {
    const action = resolveKey(this.keymap, k);
    return action ? this.dispatch(action) : null;
  }

  private commands(): CommandOption[] {
    if (!this.session.isPlayerTurn()) return [];
    const actor = this.session.activeUnit()!, abilities = this.session.query.abilitiesOf(this.session.state, actor);
    const options = this.selected ? this.vm.commands(this.selected) : [];
    if (this.mode.kind !== "idle") options.push({ id: "cancel", label: "取消", group: "system", tooltip: "取消目前操作",
      enabled: true, action: { type: "cancel" } });
    return options.map(option => {
      const action = option.action, binding = action.type === "beginAbility" ? `abilitySlot:${abilities.indexOf(action.ability) + 1}` : action.type;
      const key = keyLabel(this.keymap, binding), tooltip = option.tooltip.replace(/\n快捷鍵：[^\n]*$/u, "");
      return { ...option, key, tooltip: key ? `${tooltip}\n快捷鍵：${key}` : tooltip,
        active: action.type === "beginMove" ? this.mode.kind === "move"
          : action.type === "beginAbility" && this.mode.kind === "target" && this.mode.ability === action.ability };
    });
  }

  snapshot(): UiSnapshot {
    const { state: s, query: q, db } = this.session, v = this.vm.viewport, actor = this.session.activeUnit();
    const cells: CellView[] = [], changed = this.vm.dirty(), fingerprints = new Map<string, string>();
    const move = this.mode.kind === "move" ? this.reachable() : null;
    const ability = this.mode.kind === "target" ? this.mode.ability : null;
    const range = ability && actor ? q.abilityRange(s, actor, ability) : null;
    for (let y = v.y; y < v.y + v.h; y++) for (let x = v.x; x < v.x + v.w; x++) {
      const cell = this.vm.cell(x, y), key = cellKey(x, y);
      if (x === this.cursor.x && y === this.cursor.y) cell.cursor = true;
      if (cell.unit?.id === this.selected) cell.selected = true;
      if (move?.has(key)) cell.highlight = "reach";
      if (range && actor && ability && this.session.isPlayerTurn()) {
        const distance = q.distance(s.units[actor]!.pos, cell);
        if (distance >= range.min && distance <= range.max) {
          cell.highlight = "range";
          if (!q.checkAbility(s, actor, ability, this.targetAt(ability, cell))) cell.highlight = "target";
        }
      }
      const fingerprint = JSON.stringify(cell); fingerprints.set(key, fingerprint);
      if (this.lastCells.get(key) !== fingerprint) changed.add(key);
      cells.push(cell);
    }
    const viewportKey = JSON.stringify(v), dirty = viewportKey !== this.lastViewport ? "all" : [...changed];
    this.lastViewport = viewportKey; this.lastCells = fingerprints;
    for (const event of s.log.events.slice(this.logCursor)) {
      const units = [event.payload.unit, event.payload.target, event.payload.owner, event.payload.person]
        .filter((id): id is string => typeof id === "string");
      const visible = units.some(id => s.units[id]?.owner === this.session.playerSlot
        || s.knowledge[this.session.playerSlot]?.visible.includes(id)
        || (s.persons[id]?.seat && s.units[s.persons[id]!.seat!.mech]?.owner === this.session.playerSlot));
      if (units.length && !visible) continue;
      const line = this.vm.text(event); if (line) this.log.push(line);
    }
    this.logCursor = s.log.events.length; this.log = this.log.slice(-200);
    const inspected = this.vm.cell(this.cursor.x, this.cursor.y), terrain = db.require("terrain", inspected.terrain.id);
    const outcome = this.session.outcome();
    return { title: this.title, round: s.round, maxRounds: s.rt?.maxRounds ?? null, activeUnit: actor,
      playerTurn: this.session.isPlayerTurn(), outcome: outcome ? { ...outcome,
        text: outcome.winner === null ? "戰鬥結束：平局" : outcome.winner === this.session.playerSlot ? "戰鬥結束：我方勝利" : "戰鬥結束：我方戰敗" } : null,
      map: { width: s.map.width, height: s.map.height }, viewport: { ...v }, cells, dirty,
      cursor: { ...this.cursor }, mode: { ...this.mode }, selected: this.selected ? this.vm.unit(this.selected) : null,
      inspect: { ...this.cursor, terrainName: terrain.name, terrainNote: `高度 ${terrain.height}／掩護 ${terrain.cover}${terrain.blocksLos ? "／阻擋視線" : ""}`,
        ...(inspected.unit ? { unit: this.vm.unit(inspected.unit.id) } : {}) },
      commands: this.commands(), log: this.log.map(line => ({ ...line })), message: this.message,
      keyHints: this.keymap.bindings.map(b => ({ action: b.action, label: b.label, keys: [...b.keys] })), showHelp: this.showHelp };
  }
}

export function controllerForScenario(db: ContentDB, scenario: Id, seed: number, opts?: { viewport?: { w: number; h: number } }): BattleController {
  // SPEC-GAP：ScenarioDef 沒有 name，標題採內容 id，不在程式寫死情境名稱。
  return new BattleController({ session: new BattleSession({ db, sim: scenarioToSetup(db, scenario, seed), seed }),
    title: scenarioTitle(db.require("scenario", scenario).id), viewport: opts?.viewport });
}
