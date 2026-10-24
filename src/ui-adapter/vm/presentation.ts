import type { Cell } from "../../core/types-def.ts";
import type { GameEvent, PayloadValue } from "../../core/events.ts";
import type { BattleSession } from "./session.ts";
import type { Fx, LogLine } from "./types.ts";
import { eventText, unitName } from "./text.ts";

const cell = (value: PayloadValue | undefined): Cell | undefined => Array.isArray(value)
  && typeof value[0] === "number" && typeof value[1] === "number" ? { x: value[0], y: value[1] } : undefined;
type NewFx = Fx extends infer F ? F extends Fx ? Omit<F, "id"> : never : never;

/** 依成功指令切批；事件位置從移動序列回推，不受同一 AI 回合後續移動影響。 */
export class BattlePresentation {
  log: LogLine[] = [];
  fx: { epoch: number; items: Fx[] } = { epoch: 0, items: [] };
  private cursor = 0;
  private nextId = 1;

  clearFx(): void { this.fx = { epoch: this.fx.epoch + 1, items: [] }; }

  collect(session: BattleSession, silentPlayerEnds = false): void {
    const { state: s } = session, pending = s.log.events.slice(this.cursor);
    if (!pending.length) return;
    const positions = new Map(Object.values(s.units).map(u => [u.id, { ...u.pos }]));
    for (const e of [...pending].reverse()) if (e.type === "Moved") {
      const from = cell(e.payload.from); if (from) positions.set(String(e.payload.unit), from);
    }
    const batches = session.batches.filter(b => b.events.some(e => e.seq >= pending[0]!.seq));
    const bySeq = new Map(batches.flatMap(b => b.events.map(e => [e.seq, b] as const)));
    let start = 0, group = 0;
    while (start < pending.length) {
      const batch = bySeq.get(pending[start]!.seq);
      let end = start + 1;
      while (end < pending.length && bySeq.get(pending[end]!.seq) === batch) end++;
      const animate = !!batch && !(silentPlayerEnds && batch.command.kind === "end" && s.units[batch.command.actor]?.owner === session.playerSlot);
      this.batch(session, pending.slice(start, end), batch?.visible ?? s.knowledge[session.playerSlot]?.visible ?? [], positions, group, animate);
      if (animate) group += 3;
      start = end;
    }
    this.cursor = s.log.events.length;
    this.log = this.log.slice(-200); this.fx.items = this.fx.items.slice(-64);
  }

  private batch(session: BattleSession, events: GameEvent[], visible: string[], positions: Map<string, Cell>, group: number, animate: boolean): void {
    const { state: s, db, query: q, playerSlot } = session;
    const paths = new Map<string, { fx: Extract<Fx, { kind: "path" }>; line: LogLine }>();
    const damages = new Map<string, { amount: number; fx: Extract<Fx, { kind: "float" }>; part: string }>();
    const add = (fx: NewFx): Fx => {
      const item = { ...fx, id: this.nextId++ } as Fx;
      if (animate) this.fx.items.push(item);
      return item;
    };
    const position = (id: string): Cell | undefined => positions.get(id) ?? positions.get(s.persons[id]?.seat?.mech ?? "");
    for (const e of events) {
      const p = e.payload, id = String(p.unit ?? ""), to = cell(p.to);
      if (e.type === "Moved" && to) positions.set(id, to);
      const ids = [p.unit, p.target, p.owner, p.person].filter((v): v is string => typeof v === "string");
      if (ids.length && !ids.some(u => s.units[u]?.owner === playerSlot || visible.includes(u)
        || s.units[s.persons[u]?.seat?.mech ?? ""]?.owner === playerSlot)) continue;
      const effect = e.type === "EffectApplied" ? db.get("effect", String(p.effect)) : undefined;
      if (effect?.ui.hidden) continue;
      const at = e.type === "Moved" ? to : position(String(p.target ?? p.unit ?? p.owner ?? p.person ?? ""));
      const line = eventText(db, s, e);
      if (e.type === "Moved" && to && cell(p.from) && line) {
        let path = paths.get(id);
        if (!path) {
          path = { fx: add({ kind: "path", group, cells: [cell(p.from)!] }) as Extract<Fx, { kind: "path" }>, line };
          paths.set(id, path); this.log.push(line);
        }
        path.fx.cells.push({ ...to }); path.line.at = { ...to };
        const from = path.fx.cells[0]!;
        path.line.text = `${unitName(db, s, id)} 移動（${from.x}，${from.y}）→（${to.x}，${to.y}）`;
      } else if (line) this.log.push({ ...line, ...(at ? { at: { ...at } } : {}) });
      const part = s.units[id] ? q.partDefs(s, id).find(part => part.id === p.part)?.name ?? String(p.part ?? "") : "";
      if (e.type === "Hit" || e.type === "Miss") {
        const from = position(id), target = position(String(p.target));
        if (from && target) add({ kind: "attack", group: group + 1, from: { ...from }, to: { ...target }, hit: e.type === "Hit" });
        if (target && e.type === "Miss") add({ kind: "float", group: group + 2, at: { ...target }, text: "未命中", tone: "miss" });
      } else if (e.type === "LayerDamaged" && at) {
        const key = `${id}:${String(p.part)}`, amount = Number(p.amount ?? 0);
        let damage = damages.get(key);
        if (!damage) {
          damage = { amount: 0, part, fx: add({ kind: "float", group: group + 2, at: { ...at }, text: "", tone: "damage" }) as Extract<Fx, { kind: "float" }> };
          damages.set(key, damage);
        }
        damage.amount += amount; damage.fx.text = `${damage.part} −${damage.amount}`;
      } else if (at && e.type === "PartBroken") add({ kind: "float", group: group + 2, at: { ...at }, text: `${part}損毀`, tone: "break" });
      else if (at && effect) add({ kind: "float", group: group + 2, at: { ...at }, text: effect.name, tone: "status" });
      else if (at && e.type === "ControlChanged" && p.to === "berserk") add({ kind: "float", group: group + 2, at: { ...at }, text: "暴走", tone: "status" });
    }
  }
}
