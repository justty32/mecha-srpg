import type { Id } from "../../core/ids.ts";
import { controlLabel, moraleLabel, roleLabel, statusLabel, layerTypeLabel, poolLabel, movementLabel, frameClassLabel,
  familyLabel, targetShapeLabel, effectTimingLabel, functionLabel, damageTypeLabel } from "./labels.ts";
import { cellKey } from "../../core/ids.ts";
import type { GameEvent } from "../../core/events.ts";
import type { PoolDecl, NumExpr } from "../../core/types-def.ts";
import type { BattleSession } from "./session.ts";
import type { CellView, CommandOption, LogLine, UnitView } from "./types.ts";
import { DEFAULT_KEYMAP, keyLabel } from "./keymap.ts";
import { eventText, rejectionText, unitName } from "./text.ts";

export class BattleViewModel {
  readonly session: BattleSession;
  viewport = { x: 0, y: 0, w: 40, h: 25 };
  private eventCursor = 0;
  private previousCells = new Set<string>();
  private seen = new Map<Id, { parts: UnitView["parts"]; round: number }>();

  constructor(session: BattleSession) {
    this.session = session; this.setViewport(0, 0);
    session.observers.add(() => this.captureVisible());
    this.captureVisible();
  }

  captureVisible(): void {
    for (const id of this.session.state.knowledge[this.session.playerSlot]?.visible ?? []) this.unit(id);
  }

  setViewport(x: number, y: number, w = this.viewport.w, h = this.viewport.h): void {
    const map = this.session.state.map;
    const integer = (n: number, fallback: number) => Number.isFinite(n) ? Math.trunc(n) : fallback;
    w = Math.max(1, Math.min(map.width, integer(w, 40)));
    h = Math.max(1, Math.min(map.height, integer(h, 25)));
    this.viewport = { x: Math.max(0, Math.min(map.width - w, integer(x, 0))),
      y: Math.max(0, Math.min(map.height - h, integer(y, 0))), w, h };
  }

  /** SPEC-GAP：SessionQuery 未提供有效移動類別／單步成本，只顯示內容宣告的基礎成本。 */
  movementClass(id: Id): string {
    const { state: s, db } = this.session, u = s.units[id]!;
    const frame = db.get("frame", u.frame) ?? db.require("species", u.frame);
    return frame.tags.find(tag => Object.hasOwn(db.registries.locomotion, tag)) ?? "leg";
  }

  cell(x: number, y: number, selected: Id | null = null): CellView {
    const { state: s, db, query: q, playerSlot } = this.session;
    if (!q.inBounds(s, { x, y })) throw new Error("座標超出地圖");
    const t = db.require("terrain", s.map.terrain[y * s.map.width + x]!);
    const cell: CellView = { x, y, terrain: { id: t.id, name: t.name, glyph: t.glyph, color: t.color } };
    const knowledge = s.knowledge[playerSlot];
    if (selected && s.units[selected] && (s.units[selected]!.owner === playerSlot || knowledge?.visible.includes(selected) || s.rt?.presences?.[selected])) {
      const movement = this.movementClass(selected), cost = t.moveCost[movement];
      cell.travelNote = `地形基礎通行（${movementLabel(movement)}）：${cost == null ? "不可通行" : `成本 ${cost}`}；實際可達格依移動預覽`;
    }
    let id = q.unitAt(s, { x, y });
    if (id && s.units[id]!.owner !== playerSlot && !knowledge?.visible.includes(id) && !s.rt?.presences?.[id]) id = null;
    if (!id) id = Object.keys(knowledge?.lastSeen ?? {}).sort().find(candidate => {
      const last = knowledge!.lastSeen[candidate]!;
      return s.units[candidate]?.owner !== playerSlot && !knowledge?.visible.includes(candidate)
        && last.cell.x === x && last.cell.y === y;
    }) ?? null;
    if (!id || !s.units[id]) return cell;
    const view = this.unit(id), u = s.units[id]!, monster = db.get("species", u.frame);
    const pilot = Object.values(u.seats).map(pid => pid ? s.persons[pid] : undefined).find(p => p?.seat?.role === "pilot");
    const pilotName = pilot ? db.require("person", pilot.def).name : null;
    const label = monster ? [...view.name].slice(0, 2).join("")
      : pilotName ? `${[...pilotName][0] ?? ""}${[...view.frameName][0] ?? ""}` : [...view.frameName].slice(0, 2).join("");
    const layers = view.parts.flatMap(p => p.layers).filter(l => l.hp !== null);
    const max = layers.reduce((n, l) => n + l.max, 0), hp = layers.reduce((n, l) => n + (l.hp ?? 0), 0);
    if (view.selectable === false) cell.selectable = false;
    cell.unit = { id, label, name: view.name, owner: view.owner, side: view.side,
      ...((view.presenceNote || view.auraNotes?.length) ? { notice: [view.presenceNote, ...(view.auraNotes ?? [])].filter(Boolean).join("\n") } : {}),
      active: !view.stale && id === this.session.activeUnit(), hpRatio: max ? Math.max(0, Math.min(1, hp / max)) : 0,
      ...(view.selectable === false ? { selectable: false } : {}),
      stale: view.stale, status: s.rt?.unitStatus[id] === "presence" ? "presence" : view.status === statusLabel("derelict") ? "derelict" : "active" };
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
    const publicPresence = !!s.rt?.presences?.[id], presence = s.rt?.unitStatus[id] === "presence";
    const knowledge = s.knowledge[playerSlot], known = knowledge?.revealed[id], visible = own || publicPresence || !!knowledge?.visible.includes(id);
    const species = visible ? db.get("species", u.frame) : undefined, behaviors = species?.behaviors;
    const persons = own ? Object.entries(u.seats).flatMap(([seat, pid]) => {
      const p = pid ? s.persons[pid] : undefined;
      return p ? [{ id: p.id, name: db.require("person", p.def).name, seat, role: roleLabel(p.seat?.role ?? "passenger"), morale: moraleLabel(p.morale) }] : [];
    }) : [];
    let parts = q.partDefs(s, id).map(part => {
      const defs = q.layerDefs(s, id, part.id);
      const layers = defs.map((def, i) => {
        const hp = visible ? u.parts[part.id]!.layers[i]!.hp : known?.[part.id]?.[i]?.hp ?? null;
        return { type: layerTypeLabel(db, def.type), hp, max: def.hp, broken: hp !== null && hp <= 0 };
      });
      return { id: part.id, name: part.name, layers,
        ...(own ? { functions: part.functions.map(f => functionLabel(db, f)),
          components: Object.entries(u.parts[part.id]!.components).flatMap(([slot, id], i) => {
            if (!id) return [];
            const component = db.require("component", id);
            const functions = [
              ...component.abilities.map(a => `能力：${db.require("ability", a).name}`),
              ...component.pools.map(p => `資源：${p.name}`),
              ...(component.poolMods ?? []).map(p => `調整資源：${this.poolName(u.id, "mech", p.pool)}`),
              ...(component.attrMods?.length ? ["調整機體性能"] : []),
              ...(component.layersAdd?.length ? ["加裝防護層"] : []),
            ];
            return [{ id, slot: `插槽 ${part.slots.findIndex(s => s.id === slot) + 1 || i + 1}`, name: component.name,
              functions: functions.length ? functions : part.functions.map(f => functionLabel(db, f)) }];
          }) } : {}),
        broken: visible ? u.parts[part.id]!.broken : layers.some((l, i) => defs[i]!.structural && l.broken) };
    });
    if (!own && visible) this.seen.set(id, { parts: structuredClone(parts), round: s.round });
    else if (!own && this.seen.has(id)) parts = structuredClone(this.seen.get(id)!.parts);
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
    return { ...(presence ? { selectable: false } : {}), id, name: own || publicPresence || (visible && db.get("species", u.frame)) ? unitName(db, s, id) : frame.name, frameName: frame.name, owner: u.owner,
      ...(presence ? { presenceNote: "在場／不可交戰：迎戰前不能攻擊或捕捉，仍佔據此格。" } : {}),
      ...(publicPresence && (presence || q.isActive(s, id)) ? { auraNotes: [
        `光環：${db.require("effect", s.rt!.presences![id]!.aura).name}（影響全場敵我作戰單位）`,
      ] } : {}),
      side: own ? "self" : "enemy", pos: { ...(visible ? u.pos : knowledge?.lastSeen[id]?.cell ?? { x: -1, y: -1 }) },
      movementName: movementLabel(this.movementClass(id)), frameClassName: frameClassLabel("cls" in frame ? frame.cls : "bio"),
      ...(species ? { familyName: familyLabel(species.family), ecologyNotes: [
        ...(behaviors?.molt ? ["蛻皮：條件成熟時會蛻變成另一形態。"] : []),
        ...(behaviors?.spawner ? ["育幼：會孵育子獸加入戰場。"] : []),
        ...(behaviors?.telegraph ? ["預告：具備攻擊前兆；此處是物種特徵，並非當下攻擊意圖。"] : []),
      ] } : {}),
      controlMode: own ? controlLabel(u.controlMode) : "未知", status: presence ? "在場／不可交戰" : visible ? statusLabel(s.rt?.unitStatus[id] ?? "active") : "未知",
      stale: !visible, seenRound: own ? null : this.seen.get(id)?.round ?? null,
      persons, parts, pools, effects: own ? u.effects.filter(e => !db.require("effect", e.effect).ui.hidden)
        .map(e => ({ id: e.effect, name: db.require("effect", e.effect).name, stacks: e.stacks, remaining: e.remaining })) : [] };
  }

  text(evt: GameEvent): LogLine | null { return eventText(this.session.db, this.session.state, evt); }

  poolName(unitId: Id, owner: "mech" | "person", pool: string): string {
    const { state: s, db, query: q } = this.session;
    const commander = owner === "person" ? q.commanderOf(s, unitId) : null;
    const declarations = owner === "mech" ? q.poolDecls(s, unitId)
      : commander ? db.require("person", s.persons[commander]!.def).pools : [];
    return declarations.find(d => d.id === pool)?.name ?? poolLabel(pool);
  }

  /** 尚未選目標，不把依賴 target 的式子誤算成零傷害。這是能力資料說明，非結算預測。 */
  abilityDescription(unitId: Id, abilityId: Id): string {
    const { state: s, db, query: q } = this.session, a = q.abilityDef(abilityId);
    const value = (expr: NumExpr): string => JSON.stringify(expr).includes('"target.') ? "依目標而定" : String(q.evalNum(s, expr, unitId));
    const range = q.abilityRange(s, unitId, abilityId);
    const resources = (entries: typeof a.costs) => entries.map(c => `${this.poolName(unitId, c.owner, c.pool)} ${value(c.amount)}`).join("、") || "無";
    const damage = a.packets.map(p => `${damageTypeLabel(db, p.type)} ${value(p.amount)}`).join("、") || "無";
    const effects = a.effects.flatMap(e => e.apply.flatMap(ref => {
      const effect = db.require("effect", typeof ref === "string" ? ref : ref.effect);
      return effect.ui.hidden ? [] : [`${effectTimingLabel(e.on)}：${effect.name}${typeof ref !== "string" && ref.chance !== undefined ? `（機率 ${value(ref.chance)}%）` : ""}`];
    })).join("、") || "無";
    const shape = targetShapeLabel(a.target.kind), radius = a.target.radius;
    return [`消耗：${resources(a.costs)}`, `射程：${range.min}–${range.max}`,
      `範圍：${shape}${radius === undefined ? "" : `／半徑 ${value(radius)} 格`}`,
      `傷害（基礎）：${damage}`, `效果：${effects}`, `產出：${resources(a.produces)}`,
      `冷卻：${value(a.cooldown ?? 0)} 回合`].join("\n");
  }

  commands(unitId: Id | null): CommandOption[] {
    const { state: s, query: q } = this.session;
    const unavailable = this.session.outcome() ? "戰鬥已結束" : !this.session.isPlayerTurn() ? "敵方回合中"
      : !unitId ? "尚未選擇棋子" : unitId !== this.session.activeUnit() ? "不是這台的回合" : undefined;
    const options: CommandOption[] = [];
    const add = (option: CommandOption, action: string) => {
      option.key = keyLabel(DEFAULT_KEYMAP, action);
      if (option.reason) option.tooltip += `\n${option.reason}`;
      if (option.key) option.tooltip += `\n快捷鍵：${option.key}`;
      options.push(option);
    };
    const canMove = !unavailable && !!unitId && Object.keys(q.reachable(s, unitId)).length > 0;
    add({ id: "move", label: "移動", group: "move", tooltip: "選擇可達格移動", enabled: canMove,
      ...(canMove ? {} : { reason: unavailable ?? "沒有可達格" }), action: { type: "beginMove" } }, "beginMove");
    for (const [id, type, label] of [["standby", "standby", "待機"], ["defer", "defer", "延後"], ["end", "endTurn", "結束回合"],
      ["eject", "eject", "棄機"], ["retreat", "retreat", "撤離"], ["skip", "skip", "跳過"]] as const) {
      const pos = unitId ? s.units[unitId]?.pos : undefined;
      const reason = type === "endTurn" ? (this.session.outcome() ? "戰鬥已結束" : undefined)
        : type === "skip" ? (!this.session.autoAdvance && !this.session.isPlayerTurn() && !this.session.outcome() && this.session.activeUnit() ? undefined : "目前沒有演出")
        : unavailable ?? (type === "defer" && s.rt?.waitUsed.includes(unitId!) ? rejectionText("wait-used")
        : type === "retreat" && s.rt?.noRetreat ? rejectionText("no-retreat")
        : type === "retreat" && !s.rt?.exits.some(p => p.x === pos?.x && p.y === pos?.y) ? rejectionText("not-at-exit")
        : type === "eject" && !q.commanderOf(s, unitId!) ? rejectionText("no-commander") : undefined);
      add({ id, label, group: type === "eject" || type === "retreat" ? "system" : "turn", tooltip: label,
        enabled: !reason, ...(reason ? { reason } : {}), action: { type } }, type);
    }
    if (unitId && s.units[unitId]?.owner === this.session.playerSlot) q.abilitiesOf(s, unitId).forEach((id, i) => {
      const a = q.abilityDef(id), rejected = q.checkAbility(s, unitId, id);
      const passive = a.mode === "passive" || a.mode === "reaction";
      const reason = unavailable ?? (passive ? "此能力自動觸發" : rejected ? rejectionText(rejected.code) : undefined);
      add({ id: `ability:${id}`, label: a.name, group: "ability", tooltip: this.abilityDescription(unitId, id),
        enabled: !reason, ...(reason ? { reason } : {}), action: { type: "beginAbility", ability: id } }, `abilitySlot:${i + 1}`);
    });
    for (const target of Object.keys(s.rt?.presences ?? {}).sort()) {
      const p = s.rt!.presences![target]!;
      if (s.rt!.unitStatus[target] !== "presence" || p.engaged) continue;
      const reason = unavailable ?? (!p.engageable ? "此戰場不可主動迎戰" : undefined);
      add({ id: `engagePresence:${target}`, label: `迎戰${unitName(this.session.db, s, target)}`, group: "system",
        tooltip: "確認迎戰後，這個在場單位才可成為攻擊與捕捉目標", enabled: !reason,
        ...(reason ? { reason } : {}), action: { type: "engagePresence", target } }, "engagePresence");
    }
    return options;
  }
}
