import type { BattleSession } from "../sim/session.ts";
import type { GameEvent } from "../core/events.ts";
import type { Cell, Objective, EffectRef, NumExpr } from "../core/types-def.ts";
import { evalNum } from "../core/numexpr.ts";
import { eventText, unitName } from "../ui-adapter/vm/text.ts";
import { controlLabel, layerTypeLabel, moraleLabel, statusLabel } from "../ui-adapter/vm/labels.ts";

export const displayNumber = (n: number): number => Number.isFinite(n) ? Math.round(n * 10) / 10 : n;
/** 只複製顯示資料，不能把四捨五入值寫回 state／存檔。 */
export function displayValues<T>(value: T): T {
  if (typeof value === "number") return displayNumber(value) as T;
  if (Array.isArray(value)) return value.map(displayValues) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, displayValues(v)])) as T;
  return value;
}
const shortId = (id: string) => id.split("/").at(-1)!;
const pools = (all: Record<string, { cur: number; max: number }>) =>
  Object.entries(all).map(([k, p]) => `${k} ${displayNumber(p.cur)}/${Number.isFinite(p.max) ? displayNumber(p.max) : "∞"}`).join(" ");
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
  friendly(slot: string): boolean {
    return !this.hostileSlots(this.playerSlot, slot);
  }
  hostileSlots(a: string, b: string): boolean {
    const { state: s, rulesQuery: q } = this.session;
    return q.hostileSlots?.(s, a, b) ?? (a === "berserk" || b === "berserk" || (a !== b && !s.rt?.allies[a]?.includes(b)));
  }
  slotName(slot: string): string {
    const faction = this.session.state.factions[slot]?.faction;
    return slot === this.playerSlot ? "我方" : this.session.contentDb.get("faction", faction ?? "")?.name ?? slot;
  }
  contentName(kind: "effect" | "ability" | "terrain", id: string): string {
    return this.session.contentDb.get(kind, id)?.name || shortId(id);
  }
  known(id: string): boolean {
    const s = this.session.state;
    return this.spectate || (!!s.units[id] && this.friendly(s.units[id]!.owner)) || this.visible().includes(id);
  }
  name(id: string): string {
    const s = this.session.state, db = this.session.contentDb, u = s.units[id];
    if (!u) return id;
    return this.spectate || this.friendly(u.owner) ? unitName(db, s, id)
      : (db.get("frame", u.frame) ?? db.get("species", u.frame))?.name ?? id;
  }
  private liveUnit(id: string) {
    const { state: s, rulesQuery: q, contentDb: db } = this.session, u = s.units[id]!;
    const own = this.spectate || this.friendly(u.owner);
    const parts = q.partDefs(s, id).map(p => ({ id: p.id, name: p.name, broken: u.parts[p.id]!.broken,
      layers: q.layerDefs(s, id, p.id).map((l, i) => ({ type: layerTypeLabel(db, l.type),
        hp: u.parts[p.id]!.layers[i]!.hp, max: u.parts[p.id]!.layers[i]!.maxHp ?? l.hp, broken: u.parts[p.id]!.layers[i]!.broken })) }));
    const layers = parts.flatMap(p => p.layers), max = layers.reduce((n, l) => n + l.max, 0);
    return displayValues({ id, name: this.name(id), owner: u.owner, pos: { ...u.pos }, seenRound: s.round,
      status: s.rt?.unitStatus[id] === "dead" ? "機體損毀" : statusLabel(s.rt?.unitStatus[id] ?? "active"),
      control: own ? controlLabel(u.controlMode) : "未知", hpPercent: max ? Math.round(100 * layers.reduce((n, l) => n + l.hp, 0) / max) : 0,
      parts, ...(own ? { pools: structuredClone(u.pools), effects: u.effects.filter(e => !db.require("effect", e.effect).ui.hidden)
        .map(e => ({ name: this.contentName("effect", e.effect), stacks: e.stacks, remaining: e.remaining })),
      persons: Object.values(u.seats).flatMap(pid => {
        const p = pid ? s.persons[pid] : undefined;
        return p ? [{ id: p.id, name: db.require("person", p.def).name, morale: moraleLabel(p.morale), pools: structuredClone(p.pools) }] : [];
      }) } : {}) });
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
      return !unit || this.friendly(s.units[unit]!.owner) || visible.includes(unit);
    };
    for (const event of events) {
      if (!this.spectate && Object.values(event.payload).some(v => typeof v === "string" && !allowed(v))) continue;
      const effect = db.get("effect", String(event.payload.effect ?? ""));
      if (effect?.ui.hidden) continue;
      const line = eventText(db, s, { ...event, payload: displayValues(event.payload) });
      if (line && event.type === "BattleEnd" && typeof event.payload.winner === "string") line.text = `戰鬥結束，${this.slotName(event.payload.winner)}獲勝`;
      if (line && event.type === "EffectApplied" && typeof event.payload.effect === "string") {
        line.text = line.text.replace(/「[^」]*」/u, `「${this.contentName("effect", event.payload.effect)}」`);
      }
      if (line && ["AbilityUsed", "Hit", "Miss"].includes(event.type) && typeof event.payload.ability === "string") {
        line.text = line.text.replace(/「[^」]*」/u, `「${this.contentName("ability", event.payload.ability)}」`);
      }
      // 僅使用事件攜帶的當時命中率，不能拿結算後的 state 倒推。
      if (line && (event.type === "Hit" || event.type === "Miss") && typeof event.payload.chance === "number") {
        line.text += `（命中 ${displayNumber(event.payload.chance)}%）`;
      }
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
      // knowledge 可能移除失聯敵方；保留本視圖快照，絕不以離場狀態偷讀即時位置。
      const remembered = this.seen.get(id), visible = this.known(id);
      const last = knowledge?.lastSeen[id] ?? (remembered ? { cell: remembered.pos, round: remembered.seenRound } : undefined);
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
  objectives() {
    const { state: s, rulesQuery: q } = this.session, rt = s.rt!;
    const objectives: Objective[] = rt.objectives.length ? rt.objectives : Object.keys(s.factions).filter(slot => slot !== "berserk")
      .map(slot => ({ kind: "eliminate", for: slot, onComplete: "win", params: {} }));
    const cellText = (c: Cell) => `(${c.x},${c.y})`;
    return objectives.map(o => {
      const ids = [...new Set([...(Array.isArray(o.params.units) ? o.params.units.filter((id): id is string => typeof id === "string") : []),
        ...(typeof o.params.unit === "string" ? [o.params.unit] : [])])];
      const targets = ids.map(id => {
        const u = s.units[id], visible = !!u && this.known(id), old = this.seen.get(id);
        const last = s.knowledge[this.playerSlot]?.lastSeen[id] ?? (old ? { cell: old.pos, round: old.seenRound } : undefined);
        return { id, name: this.name(id), pos: visible ? { ...u!.pos } : last ? { ...last.cell } : null,
          stale: !visible, seenRound: visible ? s.round : last?.round ?? null };
      });
      const names = targets.map(t => `${t.name}〔${t.id}〕${t.stale ? t.pos ? `（最後所見 ${cellText(t.pos)}、第 ${t.seenRound} 輪）` : "（位置未知）" : ` ${cellText(t.pos!)}`}`).join("、");
      const progress: Record<string, unknown> = {};
      let text: string;
      switch (o.kind) {
        case "killTarget": {
          const remaining = ids.filter(id => rt.unitStatus[id] !== "dead").length;
          Object.assign(progress, { targets, remaining, total: ids.length });
          text = `擊殺 ${names}（剩 ${remaining}／${ids.length}）`; break;
        }
        case "hold": {
          const zone = (Array.isArray(o.params.zone) ? o.params.zone : []).filter((c): c is Cell => !!c && typeof c === "object" && "x" in c && "y" in c && typeof c.x === "number" && typeof c.y === "number");
          const current = rt.holdProgress?.[JSON.stringify(o)]?.count ?? 0, required = o.params.rounds;
          Object.assign(progress, { current, required, zone });
          const area = zone.length ? `區域 x${Math.min(...zone.map(c => c.x))}–${Math.max(...zone.map(c => c.x))},y${Math.min(...zone.map(c => c.y))}–${Math.max(...zone.map(c => c.y))}（${zone.length} 格）` : "存活單位";
          text = `守住${area}連續 ${required} 輪（目前 ${current}／${required}；${zone.length ? "區內有敵方或無本方單位則歸零" : "無本方存活單位則歸零"}）`; break;
        }
        case "escort": case "reachExit": {
          const arrived = ids.filter(id => rt.unitStatus[id] === "retreated" || (s.units[id] && q.isActive(s, id) && rt.exits.some(c => q.distance(c, s.units[id]!.pos) === 0))).length;
          Object.assign(progress, { targets, arrived, total: ids.length, exits: rt.exits.map(c => ({ ...c })) });
          text = `${o.kind === "escort" ? "護送" : "引導"} ${names} 到出口（已到 ${arrived}／${ids.length}；出口 ${rt.exits.length} 格：${rt.exits.map(cellText).join("、")}）`; break;
        }
        case "survive": {
          const required = typeof o.params.rounds === "number" ? o.params.rounds : rt.maxRounds, remaining = Math.max(0, (required ?? s.round) - s.round);
          Object.assign(progress, { current: s.round, required, remaining });
          text = `撐過第 ${required} 輪（剩 ${remaining} 輪）`; break;
        }
        case "capture":
          Object.assign(progress, { targets, captured: ids.filter(id => rt.unitStatus[id] === "captured" && s.units[id]?.owner === o.for).length });
          text = `俘虜 ${names}`; break;
        case "eliminate": {
          const slots = Array.isArray(o.params.slots) ? o.params.slots.filter((v): v is string => typeof v === "string")
            : Object.keys(s.factions).filter(slot => slot !== "berserk" && this.hostileSlots(o.for, slot));
          Object.assign(progress, { slots });
          text = `殲滅${slots.map(slot => slot === this.playerSlot ? "我方" : `${this.slotName(slot)}〔${slot}〕`).join("與")}`; break;
        }
      }
      const side = this.friendly(o.for) ? o.for === this.playerSlot ? "我方" : `盟軍〔${o.for}〕` : `敵方〔${o.for}〕`;
      return { kind: o.kind, for: o.for, onComplete: o.onComplete, text: `${side}${{ win: "勝", lose: "敗", continue: "階段目標" }[o.onComplete]}：${text}`, progress };
    });
  }
  globals() {
    const s = this.session.state, globals = s.rt?.globals ?? {};
    return { ...(globals.tide !== undefined ? { tide: displayNumber(evalNum(globals.tide, { ref: () => s.round })) } : {}),
      ...(globals.light !== undefined ? { light: displayNumber(globals.light) } : {}) };
  }
  private effectSummary(ref: EffectRef): string {
    const { contentDb: db } = this.session, id = typeof ref === "string" ? ref : ref.effect, def = db.get("effect", id);
    if (!def) return shortId(id);
    const value = (n: NumExpr) => typeof n === "number" ? String(displayNumber(n)) : "隨條件變動";
    const changes = def.contribs.map(c => {
      const key = c.path.split(".").at(-1)!, label = db.registries.attrs[key]?.name ?? key;
      return `${label}${{ add: "加", mul: "乘", set: "設為", min: "至少", max: "至多" }[c.op]}${value(c.value)}`;
    });
    const hooks = Object.entries(def.hooks).flatMap(([when, actions]) => (actions ?? []).map(a => {
      const trigger = ({ onEnter: "進入時", onApply: "施加時", onExpire: "結束時", onTick: "週期", onTurnStart: "回合開始", onTurnEnd: "回合結束", onMove: "移動時" } as Record<string, string>)[when] ?? when;
      const action = a.do === "pool" ? `${a.pool} 加 ${value(a.delta)}` : a.do === "apply" ? `施加 ${a.effects.map(e => this.contentName("effect", typeof e === "string" ? e : e.effect)).join("、")}`
        : a.do === "damage" ? `造成 ${a.packets.map(p => `${p.type} ${value(p.amount)}`).join("、")} 傷害`
        : ({ remove: "移除效果", setControl: "改變控制模式", moraleCheck: "檢定士氣", spawn: "生成單位", emit: "觸發事件" } as Record<string, string>)[a.do];
      return `${trigger}${action}`;
    }));
    return `${this.contentName("effect", id)}（${[...changes, ...hooks].join("，") || "施加狀態標記"}）`;
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
    // 大寫專供單位（超過 26 台用 AA…）；地形只用小寫／標點／數字，兩集合不相交。
    const unitGlyph = (index: number): string => index < 26 ? String.fromCharCode(65 + index) : unitGlyph(Math.floor(index / 26) - 1) + unitGlyph(index % 26);
    const terrainIds = [...new Set(s.map.terrain)].sort(), symbols = [...".#~^:=;!$%&*+-/\\|_0123456789abcdefghijklmnopqrstuvwxyz"];
    const terrainGlyphs = new Map(terrainIds.map((id, i) => [id, symbols[i] ?? `_${i}`]));
    const legend = this.units("brief").filter(u => u.stale || q.isActive(s, u.id)).map((u, i) => ({ glyph: unitGlyph(i),
      id: u.id, name: u.name, owner: u.owner, pos: u.pos, stale: u.stale }));
    const cellWidth = Math.max(1, ...legend.map(u => u.glyph.length), ...[...terrainGlyphs.values()].map(g => g.length));
    const header = Array<string>(w * cellWidth).fill(" ");
    for (let xx = x; xx < x + w; xx++) if (xx % 5 === 0 && (xx - x) * cellWidth + String(xx).length <= header.length) {
      [...String(xx)].forEach((c, i) => { header[(xx - x) * cellWidth + i] = c; });
    }
    const lines = [`     ${header.join("")}`], terrains = new Set<string>(), drawn = new Set<string>();
    for (let yy = y; yy < y + h; yy++) {
      let row = yy % 5 === 0 ? String(yy).padStart(4) + " " : "     ";
      for (let xx = x; xx < x + w; xx++) {
        const unit = legend.find(u => u.pos.x === xx && u.pos.y === yy && !u.stale);
        const terrain = s.map.terrain[yy * s.map.width + xx]!;
        if (unit) drawn.add(unit.glyph); else if (canSee({ x: xx, y: yy })) terrains.add(terrain);
        const exit = s.rt?.exits.some(p => p.x === xx && p.y === yy);
        row += (exit ? ">" : unit?.glyph ?? (!canSee({ x: xx, y: yy }) ? "?" : terrainGlyphs.get(terrain)!)).padEnd(cellWidth);
      }
      lines.push(row);
    }
    const terrainLegend = [...terrains].sort().map(id => {
      const t = db.require("terrain", id);
      return { id, glyph: terrainGlyphs.get(id)!, name: this.contentName("terrain", id), cover: displayNumber(t.cover),
        moveCost: displayValues(t.moveCost), blocksLos: t.blocksLos,
        effects: [...t.onEnter.map(e => `進入：${this.effectSummary(e)}`), ...t.onTurnStart.map(e => `回合開始：${this.effectSummary(e)}`)] };
    });
    const key = ["> 出口（靜態；有單位時仍畫出口，單位見圖例座標）", "? 不可見", ...terrainLegend.map(t =>
      `${t.glyph} ${t.name}：掩蔽 ${t.cover}；移動成本 ${Object.entries(t.moveCost).map(([k, v]) => `${k} ${v ?? "不可通行"}`).join("/")}${t.blocksLos ? "；擋視線" : ""}${t.effects.length ? `；${t.effects.join("；")}` : ""}`)].join("\n");
    return { ascii: lines.join("\n"), legend: legend.filter(u => drawn.has(u.glyph)), terrainLegend, cellWidth, window: { x, y, w, h }, key };
  }
}
