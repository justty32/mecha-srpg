import type { Id } from "../../core/ids.ts";
import { controlLabel, moraleLabel, roleLabel, statusLabel } from "./labels.ts";
import { cellKey } from "../../core/ids.ts";
import type { GameEvent } from "../../core/events.ts";
import type { PoolDecl } from "../../core/types-def.ts";
import type { BattleSession } from "./session.ts";
import type { CellView, CommandOption, LogLine, UnitView } from "./types.ts";
import { DEFAULT_KEYMAP, keyLabel } from "./keymap.ts";
import { eventText, rejectionText, unitName } from "./text.ts";

export class BattleViewModel {
  readonly session: BattleSession;
  viewport = { x: 0, y: 0, w: 40, h: 25 };
  private eventCursor = 0;
  private previousCells = new Set<string>();
  private commandCache: { key: string; options: CommandOption[] } | null = null;

  constructor(session: BattleSession) { this.session = session; this.setViewport(0, 0); }

  setViewport(x: number, y: number, w = this.viewport.w, h = this.viewport.h): void {
    const map = this.session.state.map;
    const integer = (n: number, fallback: number) => Number.isFinite(n) ? Math.trunc(n) : fallback;
    w = Math.max(1, Math.min(map.width, integer(w, 40)));
    h = Math.max(1, Math.min(map.height, integer(h, 25)));
    this.viewport = { x: Math.max(0, Math.min(map.width - w, integer(x, 0))),
      y: Math.max(0, Math.min(map.height - h, integer(y, 0))), w, h };
  }

  cell(x: number, y: number): CellView {
    const { state: s, db, query: q, playerSlot } = this.session;
    if (!q.inBounds(s, { x, y })) throw new Error("座標超出地圖");
    const t = db.require("terrain", s.map.terrain[y * s.map.width + x]!);
    const cell: CellView = { x, y, terrain: { id: t.id, name: t.name, glyph: t.glyph, color: t.color } };
    const id = q.unitAt(s, { x, y });
    if (!id || (s.units[id]!.owner !== playerSlot && !s.knowledge[playerSlot]?.visible.includes(id))) return cell;
    const view = this.unit(id), u = s.units[id]!, monster = db.get("species", u.frame);
    const pilot = Object.values(u.seats).map(pid => pid ? s.persons[pid] : undefined).find(p => p?.seat?.role === "pilot");
    const pilotName = pilot ? db.require("person", pilot.def).name : null;
    const label = monster ? [...monster.name].slice(0, 2).join("")
      : pilotName ? `${[...pilotName][0] ?? ""}${[...view.frameName][0] ?? ""}` : [...view.frameName].slice(0, 2).join("");
    const layers = view.parts.flatMap(p => p.layers).filter(l => l.hp !== null);
    const max = layers.reduce((n, l) => n + l.max, 0), hp = layers.reduce((n, l) => n + (l.hp ?? 0), 0);
    cell.unit = { id, label, name: view.name, owner: view.owner, side: view.side,
      active: id === this.session.activeUnit(), hpRatio: max ? Math.max(0, Math.min(1, hp / max)) : 0,
      status: view.status === "derelict" ? "derelict" : "active" };
    return cell;
  }

  dirty(): Set<string> {
    const s = this.session.state, changed = new Set<string>(), current = new Set<string>();
    for (const u of Object.values(s.units)) if (u.owner === this.session.playerSlot || s.knowledge[this.session.playerSlot]?.visible.includes(u.id)) current.add(cellKey(u.pos.x, u.pos.y));
    for (const key of current) if (!this.previousCells.has(key)) changed.add(key);
    for (const key of this.previousCells) if (!current.has(key)) changed.add(key);
    const events = s.log.events.slice(this.eventCursor);
    if (events.length) {
      for (const key of current) changed.add(key);
      for (const key of this.previousCells) changed.add(key);
    }
    for (const e of events) {
      const id = e.payload.unit;
      if (typeof id === "string" && s.units[id]?.owner !== this.session.playerSlot
        && !s.knowledge[this.session.playerSlot]?.visible.includes(id)) continue;
      for (const key of ["from", "to", "cell"]) {
        const p = e.payload[key];
        if (Array.isArray(p) && p.length === 2 && p.every(n => typeof n === "number")) changed.add(cellKey(Number(p[0]), Number(p[1])));
      }
    }
    this.eventCursor = s.log.events.length; this.previousCells = current;
    return changed;
  }

  unit(id: Id): UnitView {
    const { state: s, db, query: q, playerSlot } = this.session, u = s.units[id];
    if (!u) throw new Error(`找不到單位：${id}`);
    const own = u.owner === playerSlot, frame = db.get("frame", u.frame) ?? db.require("species", u.frame);
    const knowledge = s.knowledge[playerSlot], known = knowledge?.revealed[id];
    const persons = own ? Object.entries(u.seats).flatMap(([seat, pid]) => {
      const p = pid ? s.persons[pid] : undefined;
      return p ? [{ id: p.id, name: db.require("person", p.def).name, seat, role: roleLabel(p.seat?.role ?? "passenger"), morale: moraleLabel(p.morale) }] : [];
    }) : [];
    const parts = q.partDefs(s, id).map(part => {
      const defs = q.layerDefs(s, id, part.id);
      const layers = defs.map((def, i) => {
        const hp = own ? u.parts[part.id]!.layers[i]!.hp : known?.[part.id]?.[i]?.hp ?? null;
        return { type: db.registries["layer-types"][def.type]?.name ?? def.type, hp, max: def.hp, broken: hp !== null && hp <= 0 };
      });
      return { id: part.id, name: part.name, layers,
        broken: own ? u.parts[part.id]!.broken : layers.some((l, i) => defs[i]!.structural && l.broken) };
    });
    const declarations: PoolDecl[] = [...frame.pools];
    if (own) for (const part of Object.values(u.parts)) for (const component of Object.values(part.components)) {
      if (component) declarations.push(...db.require("component", component).pools);
    }
    const pools = own ? Object.entries(u.pools).map(([pool, p]) => ({ id: pool,
      name: declarations.find(d => d.id === pool)?.name ?? pool, cur: p.cur, max: Number.isFinite(p.max) ? p.max : null })) : [];
    if (own) for (const person of persons) {
      const p = s.persons[person.id]!, def = db.require("person", p.def);
      for (const [pool, value] of Object.entries(p.pools)) pools.push({ id: `${person.id}:${pool}`,
        name: `${person.name}／${def.pools.find(d => d.id === pool)?.name ?? pool}`, cur: value.cur,
        max: Number.isFinite(value.max) ? value.max : null });
    }
    // SPEC-GAP：知識沒有敵方池／人物／效果／控制權；省略，位置只採 visible 或 lastSeen，未知用 (-1,-1)。
    return { id, name: own ? unitName(db, s, id) : frame.name, frameName: frame.name, owner: u.owner,
      side: own ? "self" : "enemy", pos: { ...(own || knowledge?.visible.includes(id) ? u.pos : knowledge?.lastSeen[id]?.cell ?? { x: -1, y: -1 }) },
      controlMode: own ? controlLabel(u.controlMode) : "未知", status: own || knowledge?.visible.includes(id) ? statusLabel(s.rt?.unitStatus[id] ?? "active") : "未知",
      persons, parts, pools, effects: own ? u.effects.filter(e => !db.require("effect", e.effect).ui.hidden)
        .map(e => ({ id: e.effect, name: db.require("effect", e.effect).name, stacks: e.stacks, remaining: e.remaining })) : [] };
  }

  text(evt: GameEvent): LogLine | null { return eventText(this.session.db, this.session.state, evt); }

  commands(unitId: Id): CommandOption[] {
    const { state: s, query: q } = this.session;
    if (!this.session.isPlayerTurn() || unitId !== this.session.activeUnit()) return [];
    const cacheKey = `${unitId}:${s.round}:${s.rt?.actionSeq}:${s.log.events.length}`;
    if (this.commandCache?.key === cacheKey) return structuredClone(this.commandCache.options);
    const options: CommandOption[] = [];
    const add = (option: CommandOption, action: string) => {
      option.key = keyLabel(DEFAULT_KEYMAP, action);
      if (option.reason) option.tooltip += `\n${option.reason}`;
      if (option.key) option.tooltip += `\n快捷鍵：${option.key}`;
      options.push(option);
    };
    const canMove = Object.keys(q.reachable(s, unitId)).length > 0;
    add({ id: "move", label: "移動", group: "move", tooltip: "選擇可達格移動", enabled: canMove,
      ...(canMove ? {} : { reason: "沒有可達格" }), action: { type: "beginMove" } }, "beginMove");
    q.abilitiesOf(s, unitId).forEach((id, i) => {
      const a = q.abilityDef(id), rejected = q.checkAbility(s, unitId, id);
      const passive = a.mode === "passive" || a.mode === "reaction", range = q.abilityRange(s, unitId, id);
      const costs = a.costs.map(c => `${c.pool} ${q.evalNum(s, c.amount, unitId)}`).join("、") || "無";
      const reason = passive ? "此能力自動觸發" : rejected ? rejectionText(rejected.code) : undefined;
      add({ id: `ability:${id}`, label: a.name, group: "ability", tooltip: `消耗：${costs}\n射程：${range.min}–${range.max}`,
        enabled: !reason, ...(reason ? { reason } : {}), action: { type: "beginAbility", ability: id } }, `abilitySlot:${i + 1}`);
    });
    for (const [id, type, label] of [["wait", "wait", "待機"], ["end", "endTurn", "結束回合"],
      ["eject", "eject", "棄機"], ["retreat", "retreat", "撤離"]] as const) {
      const pos = s.units[unitId]!.pos;
      const reason = type === "wait" && s.rt?.waitUsed.includes(unitId) ? rejectionText("wait-used")
        : type === "retreat" && s.rt?.noRetreat ? rejectionText("no-retreat")
        : type === "retreat" && !s.rt?.exits.some(p => p.x === pos.x && p.y === pos.y) ? rejectionText("not-at-exit")
        : type === "eject" && !q.commanderOf(s, unitId) ? rejectionText("no-commander") : undefined;
      add({ id, label, group: type === "eject" || type === "retreat" ? "system" : "turn", tooltip: label,
        enabled: !reason, ...(reason ? { reason } : {}), action: { type } }, type);
    }
    this.commandCache = { key: cacheKey, options };
    return structuredClone(options);
  }
}
