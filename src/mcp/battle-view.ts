import type { BattleSession } from "../sim/session.ts";
import type { GameEvent } from "../core/events.ts";
import type { Cell } from "../core/types-def.ts";
import { eventText, unitName } from "../ui-adapter/vm/text.ts";
import { controlLabel, layerTypeLabel, moraleLabel, statusLabel } from "../ui-adapter/vm/labels.ts";

const pools = (all: Record<string, { cur: number; max: number }>) =>
  Object.entries(all).map(([k, p]) => `${k} ${p.cur}/${Number.isFinite(p.max) ? p.max : "∞"}`).join(" ");
export type EventLine = { seq: number; round: number; text: string };
export class BattleView {
  readonly session: BattleSession;
  readonly playerSlot: string;
  readonly spectate: boolean;
  private seen = new Map<string, ReturnType<BattleView["liveUnit"]>>();
  readonly events: EventLine[] = [];
  constructor(session: BattleSession, playerSlot: string, spectate: boolean) {
    this.session = session; this.playerSlot = playerSlot; this.spectate = spectate;
    session.trackKnowledge(playerSlot);
    this.capture();
    this.collect(session.state.log.events, this.visible());
  }
  visible(): string[] { return this.session.state.knowledge[this.playerSlot]?.visible ?? []; }
  known(id: string): boolean {
    const s = this.session.state;
    return this.spectate || s.units[id]?.owner === this.playerSlot || this.visible().includes(id);
  }
  name(id: string): string {
    const s = this.session.state, db = this.session.contentDb, u = s.units[id];
    if (!u) return id;
    return this.spectate || u.owner === this.playerSlot ? unitName(db, s, id)
      : (db.get("frame", u.frame) ?? db.get("species", u.frame))?.name ?? id;
  }
  private liveUnit(id: string) {
    const { state: s, rulesQuery: q, contentDb: db } = this.session, u = s.units[id]!;
    const own = this.spectate || u.owner === this.playerSlot;
    const parts = q.partDefs(s, id).map(p => ({ id: p.id, name: p.name, broken: u.parts[p.id]!.broken,
      layers: q.layerDefs(s, id, p.id).map((l, i) => ({ type: layerTypeLabel(db, l.type),
        hp: u.parts[p.id]!.layers[i]!.hp, max: u.parts[p.id]!.layers[i]!.maxHp ?? l.hp, broken: u.parts[p.id]!.layers[i]!.broken })) }));
    const layers = parts.flatMap(p => p.layers), max = layers.reduce((n, l) => n + l.max, 0);
    return { id, name: this.name(id), owner: u.owner, pos: { ...u.pos }, status: statusLabel(s.rt?.unitStatus[id] ?? "active"),
      control: own ? controlLabel(u.controlMode) : "未知", hpPercent: max ? Math.round(100 * layers.reduce((n, l) => n + l.hp, 0) / max) : 0,
      parts, ...(own ? { pools: structuredClone(u.pools), effects: u.effects.filter(e => !db.require("effect", e.effect).ui.hidden)
        .map(e => ({ name: db.require("effect", e.effect).name, stacks: e.stacks, remaining: e.remaining })),
      persons: Object.values(u.seats).flatMap(pid => {
        const p = pid ? s.persons[pid] : undefined;
        return p ? [{ id: p.id, name: db.require("person", p.def).name, morale: moraleLabel(p.morale), pools: structuredClone(p.pools) }] : [];
      }) } : {}) };
  }
  capture(): void {
    for (const id of Object.keys(this.session.state.units)) if (this.known(id)) this.seen.set(id, this.liveUnit(id));
  }
  track<T>(fn: () => T): T {
    this.capture();
    const visible = this.visible(), from = this.session.state.log.events.length;
    const result = fn();
    this.capture();
    this.collect(this.session.state.log.events.slice(from), [...new Set([...visible, ...this.visible()])]);
    return result;
  }
  private collect(events: readonly GameEvent[], visible: string[]): void {
    const { state: s, contentDb: db } = this.session;
    const allowed = (id: string) => {
      const unit = s.units[id] ? id : s.persons[id]?.seat?.mech;
      return !unit || s.units[unit]?.owner === this.playerSlot || visible.includes(unit);
    };
    for (const event of events) {
      if (!this.spectate && Object.values(event.payload).some(v => typeof v === "string" && !allowed(v))) continue;
      const effect = db.get("effect", String(event.payload.effect ?? ""));
      if (effect?.ui.hidden) continue;
      const line = eventText(db, s, event);
      // 敵方只顯示機體名（多台同名），附上事件涉及的單位 id 才分得出是誰。
      const ids = [...new Set(Object.values(event.payload).filter((v): v is string => typeof v === "string" && (!!s.units[v] || !!s.persons[v])))];
      if (line) this.events.push({ seq: line.seq, round: line.round, text: ids.length ? `${line.text}〔${ids.join(",")}〕` : line.text });
    }
  }
  status() {
    const s = this.session, actor = s.currentActor();
    return { round: s.state.round, rounds: s.state.rt?.maxRounds ?? null,
      current: actor ? { id: actor, name: this.known(actor) ? this.name(actor) : "未發現的敵方單位", playerTurn: s.isHumanTurn() } : null,
      outcome: s.outcome(), hash: s.hash() };
  }
  units(detail: "brief" | "full") {
    const s = this.session.state, knowledge = s.knowledge[this.playerSlot];
    return Object.keys(s.units).sort().flatMap(id => {
      // 見過的單位一旦離場（擊毀、撤退…），視野清單會移除它；改顯示實際狀態，免得把殘骸當成「作戰中」的最後所見。
      const gone = (s.rt?.unitStatus[id] ?? "active") !== "active" && this.seen.has(id);
      const visible = this.known(id) || gone, last = knowledge?.lastSeen[id];
      if (!visible && !last) return [];
      const snapshot = visible ? this.liveUnit(id) : this.seen.get(id);
      const pos = visible ? s.units[id]!.pos : last!.cell;
      const base = { id, name: this.name(id), owner: s.units[id]!.owner, pos: { ...pos }, stale: !visible,
        seenRound: visible ? s.round : last!.round, hpPercent: snapshot?.hpPercent ?? null };
      const summary = `${id} ${base.name} (${pos.x},${pos.y}) ${snapshot?.status ?? "未知"} ${snapshot?.control ?? "未知"} HP ${base.hpPercent ?? "?"}%`
        + (snapshot?.pools && Object.keys(snapshot.pools).length ? ` ${pools(snapshot.pools)}` : "")
        + (snapshot?.persons?.length ? `｜${snapshot.persons.map(p => `${p.name} ${p.morale} ${pools(p.pools)}`).join("；")}` : "")
        + (!visible ? `【最後所見第 ${last!.round} 輪】` : "");
      return [{ ...(detail === "full" ? snapshot : {}), ...base, summary }];
    });
  }
  map(window?: { x: number; y: number; w: number; h: number }) {
    const { state: s, rulesQuery: q, contentDb: db } = this.session, actor = s.units[this.session.currentActor() ?? ""];
    // 大地圖一定開窗（預設以行動者為中心）；小地圖有給 window 也照辦。
    const large = s.map.width > 40 || s.map.height > 40 || !!window;
    const w = Math.min(s.map.width, large ? Math.min(window?.w ?? 40, 40) : s.map.width);
    const h = Math.min(s.map.height, large ? Math.min(window?.h ?? 40, 40) : s.map.height);
    const x = Math.max(0, Math.min(s.map.width - w, large ? window?.x ?? (actor?.pos.x ?? 0) - Math.floor(w / 2) : 0));
    const y = Math.max(0, Math.min(s.map.height - h, large ? window?.y ?? (actor?.pos.y ?? 0) - Math.floor(h / 2) : 0));
    const own = Object.values(s.units).filter(u => u.owner === this.playerSlot && q.isActive(s, u.id));
    const canSee = (p: Cell) => this.spectate || own.some(u => q.distance(u.pos, p) <= q.perception(s, u.id) && q.los(s, u.pos, p));
    let friend = 0, enemy = 0;
    const legend = this.units("brief").filter(u => (s.rt?.unitStatus[u.id] ?? "active") === "active").map(u => ({ glyph: String.fromCharCode(u.owner === this.playerSlot ? 65 + friend++ % 26 : 97 + enemy++ % 26),
      id: u.id, name: u.name, pos: u.pos, stale: u.stale }));
    const header = Array<string>(w).fill(" ");
    for (let xx = x; xx < x + w; xx++) if (xx % 5 === 0) [...String(xx)].forEach((c, i) => { if (xx - x + i < w) header[xx - x + i] = c; });
    const lines = [`     ${header.join("")}`], terrains = new Set<string>(), drawn = new Set<string>();
    for (let yy = y; yy < y + h; yy++) {
      let row = yy % 5 === 0 ? String(yy).padStart(4) + " " : "     ";
      for (let xx = x; xx < x + w; xx++) {
        const unit = legend.find(u => u.pos.x === xx && u.pos.y === yy && !u.stale);
        const terrain = s.map.terrain[yy * s.map.width + xx]!;
        if (unit) drawn.add(unit.glyph); else if (canSee({ x: xx, y: yy })) terrains.add(terrain);
        row += unit?.glyph ?? (!canSee({ x: xx, y: yy }) ? "?" : s.rt?.exits.some(p => p.x === xx && p.y === yy) ? ">"
          : db.require("terrain", terrain).glyph);
      }
      lines.push(row);
    }
    // 地形圖例只列窗口內看得到的；單位字母大寫＝我方、小寫＝其他陣營（見 legend）。
    const key = ["> 出口", "? 不可見", ...[...terrains].sort().map(id => {
      const t = db.require("terrain", id);
      return `${t.glyph}=${t.name}${t.cover ? ` 掩護${t.cover}` : ""}${t.blocksLos ? " 擋視線" : ""}`;
    })].join("；");
    return { ascii: lines.join("\n"), legend: legend.filter(u => drawn.has(u.glyph)), window: { x, y, w, h }, key };
  }
}
