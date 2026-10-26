import type { ContentDB } from "../../content/contentdb.ts";
import type { BattleState } from "../../core/types-state.ts";
import type { GameEvent } from "../../core/events.ts";
import type { LogKind, LogLine } from "./types.ts";
import { layerTypeLabel } from "./labels.ts";

export function unitName(db: ContentDB, state: BattleState, id: string): string {
  const u = state.units[id];
  if (!u) return id || "單位";
  const namedPresence = state.rt?.presences?.[id] && state.rt.monsters[id]?.def;
  if (namedPresence) return db.require("monster", namedPresence).name ?? db.require("species", u.frame).name;
  const body = db.get("frame", u.frame) ?? db.get("species", u.frame);
  const pilot = Object.values(u.seats).map(pid => pid ? state.persons[pid] : undefined).find(p => p?.seat?.role === "pilot");
  return pilot ? `${db.require("person", pilot.def).name}／${body?.name ?? u.frame}` : body?.name ?? u.frame;
}

export const REJECTION_TEXT: Readonly<Record<string, string>> = {
  "battle-over": "戰鬥已結束", "not-active": "目前不是這台單位的玩家回合", "bad-actor": "找不到行動單位",
  "no-commander": "沒有可下令的人員", "unknown-ability": "此單位沒有這項能力", "require-failed": "未滿足能力使用條件",
  "out-of-range": "目標超出射程", "no-los": "視線遭地形阻擋", "bad-target": "目標不合法", "bad-part": "部位不合法",
  "cannot-pay": "資源不足", "cooldown": "能力仍在冷卻", "uses-exhausted": "本場使用次數已用盡", "bad-path": "無法沿此路徑移動",
  "no-locomotion": "移動部位無法運作", "wait-used": "本輪已經延後過", "not-at-exit": "必須在出口格才能撤離",
  "no-retreat": "此戰鬥禁止撤離", "no-space": "附近沒有可用空格", "unsupported": "不支援此指令",
};
export function rejectionText(code: string): string { return REJECTION_TEXT[code] ?? `無法執行指令（${code}）`; }

export function eventText(db: ContentDB, state: BattleState, evt: GameEvent): LogLine | null {
  const p = evt.payload, value = (key: string) => String(p[key] ?? "");
  const name = (key: string) => {
    const id = value(key), person = state.persons[id];
    return person ? db.require("person", person.def).name : unitName(db, state, id);
  };
  const unit = name("unit"), ability = db.get("ability", value("ability"))?.name ?? "能力";
  const u = state.units[value("unit")], body = u && (db.get("frame", u.frame) ?? db.get("species", u.frame));
  const part = body ? db.require("bodyplan", body.bodyPlan).parts.find(x => x.id === p.part)?.name ?? value("part") : value("part");
  const layer = layerTypeLabel(db, value("layerType"));
  const morale: Record<string, string> = { steady: "穩定", shaken: "動搖", breaking: "崩潰", fleeing: "逃離" };
  let text: string, kind: LogKind;
  switch (evt.type) {
    case "TurnStart": text = `輪到${unit}行動`; kind = "turn"; break;
    case "Moved": text = `${unit}移動至（${Array.isArray(p.to) ? p.to.join("，") : "未知"}）`; kind = "move"; break;
    case "AbilityUsed": text = `${unit}使用「${ability}」`; kind = "system"; break;
    case "Hit": text = `${unit}的「${ability}」命中${name("target")}`; kind = "hit"; break;
    case "Miss": text = `${unit}的「${ability}」未命中${name("target")}`; kind = "miss"; break;
    case "LayerDamaged": text = `${unit}的${part}／${layer}受到 ${value("amount")} 點傷害`; kind = "damage"; break;
    case "LayerBroken": text = `${unit}的${part}／${layer}破損`; kind = "break"; break;
    case "PartBroken": text = `${unit}的${part}毀損`; kind = "break"; break;
    case "EffectApplied": text = `${name("owner")}受到「${db.get("effect", value("effect"))?.name ?? "效果"}」影響`; kind = "effect"; break;
    case "PresenceEngaged": text = `${name("by")}迎戰${unit}`; kind = "system"; break;
    case "UnitDied": text = `${unit}被擊毀`; kind = "death"; break;
    case "MoraleChanged": text = `${name("person")}的士氣變為${morale[value("to")] ?? value("to")}`; kind = "morale"; break;
    case "RoundStart": text = `第 ${evt.round} 輪開始`; kind = "turn"; break;
    case "BattleEnd": text = p.winner === null ? "戰鬥結束，平局" : `戰鬥結束，${value("winner")}陣營獲勝`; kind = "system"; break;
    default: return null;
  }
  return { seq: evt.seq, round: evt.round, text, kind };
}
