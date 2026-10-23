import type { Id } from "../core/ids.ts";
import type { HookAction, HookName } from "../core/types-def.ts";
import type { Command, EffectInstance } from "../core/types-state.ts";
import type { EventPayload } from "../core/events.ts";
import { evalNum } from "../core/numexpr.ts";
import { constant, emit, evalCtxFor, person, seatsOf, unit } from "./state.ts";
import type { Ctx, Rejection } from "./state.ts";
import { applyEffect, consumeUse, effectsOf, flushPending, removeByTags } from "./effects.ts";
import type { EffectTarget } from "./effects.ts";
import { changePool } from "./pools.ts";

export type HookCtx = { inst: EffectInstance | null; self: EffectTarget; source: Id };
export type VerbHandler = (ctx: Ctx, action: HookAction, hc: HookCtx) => void;
const verbs = new Map<HookAction["do"], VerbHandler>();
export function registerVerb(verb: HookAction["do"], h: VerbHandler): void { verbs.set(verb, h); }
export function runActions(ctx: Ctx, actions: readonly HookAction[], hc: HookCtx): void {
  for (const action of actions) {
    const handler = verbs.get(action.do);
    if (handler) handler(ctx, action, hc);
    else emit(ctx, "HookSkipped", { verb: action.do });
  }
}
export function dispatchHook(ctx: Ctx, hook: HookName, target: EffectTarget): void {
  const instances = effectsOf(ctx, target).sort((a, b) => {
    const da = ctx.db.require("effect", a.effect), db = ctx.db.require("effect", b.effect);
    return (da.order ?? constant(ctx, "defaultEffectOrder")) - (db.order ?? constant(ctx, "defaultEffectOrder"))
      || (a.effect < b.effect ? -1 : a.effect > b.effect ? 1 : 0) || a.uid - b.uid;
  });
  // SPEC-GAP：凍結 runtime 缺 depth，使用 pending 負 uid 標記支援巢狀分派；不寫入日誌。
  const marker: EffectInstance = { uid: -1, effect: "", source: "", scope: "battle", owner: {}, remaining: null, magnitude: 0, stacks: 0, contribIds: [] };
  ctx.s.pending.push(marker);
  try {
    for (const inst of instances) {
      // 快照中已被撤除者不再執行。
      if (!effectsOf(ctx, target).some(e => e.uid === inst.uid)) continue;
      const actions = ctx.db.require("effect", inst.effect).hooks[hook];
      if (!actions?.length) continue;
      runActions(ctx, actions, { inst, self: inst.owner, source: inst.source });
      if (hook === "onHit" || hook === "onBeingHit") consumeUse(ctx, inst.uid);
    }
  } finally {
    ctx.s.pending.splice(ctx.s.pending.indexOf(marker), 1);
    flushPending(ctx);
  }
}
export type SignalName = "roundStart" | "roundEnd" | "turnStartPre" | "turnStartPost" | "turnEnd" | "layerBroken"
  | "partBroken" | "conducted" | "unitDied" | "unitRemoved" | "abilityResolved" | "poolDepleted" | "personDied";
export type SignalHandler = (ctx: Ctx, p: EventPayload) => void;
const signals = new Map<SignalName, Map<string, { order: number; h: SignalHandler }>>();
export function onSignal(name: SignalName, key: string, order: number, h: SignalHandler): void {
  if (!signals.has(name)) signals.set(name, new Map());
  signals.get(name)!.set(key, { order, h });
}
export function signal(ctx: Ctx, name: SignalName, p: EventPayload): void {
  const handlers = [...(signals.get(name) ?? [])].sort(([a, x], [b, y]) => x.order - y.order || (a < b ? -1 : a > b ? 1 : 0));
  for (const [, { h }] of handlers) h(ctx, p);
}
export type CommandHandler = (ctx: Ctx, cmd: Command) => Rejection | null;
const commands = new Map<Command["kind"], CommandHandler>();
export function registerCommand(kind: Command["kind"], h: CommandHandler): void { commands.set(kind, h); }
export function commandHandler(kind: Command["kind"]): CommandHandler | undefined { return commands.get(kind); }

registerVerb("pool", (ctx, action, hc) => {
  if (action.do !== "pool") return;
  const uid = hc.self.unit ?? (hc.self.person ? person(ctx, hc.self.person).seat?.mech : undefined);
  const owner = action.owner === "person" && hc.self.person ? { person: hc.self.person }
    : action.owner === "mech" && uid ? { unit: uid } : null;
  // SPEC-GAP：沒有相符擁有者的 pool 動作略過，避免替內容挑選座位。
  if (owner) changePool(ctx, owner, action.pool, evalNum(action.delta, evalCtxFor(ctx, hc.self)), `effect:${hc.inst?.uid ?? "action"}`);
});
registerVerb("apply", (ctx, action, hc) => {
  if (action.do !== "apply") return;
  const uid = hc.self.unit ?? (hc.self.person ? person(ctx, hc.self.person).seat?.mech : undefined);
  let targets: EffectTarget[];
  if (action.to === "self") targets = [hc.self];
  else if (action.to === "seats") targets = uid ? seatsOf(ctx, uid).map(s => ({ person: s.person })) : [];
  else if (action.to === "cell") targets = hc.self.cell ? [{ cell: hc.self.cell }] : uid ? [{ cell: unit(ctx, uid).pos }] : [];
  else targets = Object.hasOwn(ctx.s.persons, hc.source) ? [{ person: hc.source }]
    : Object.hasOwn(ctx.s.units, hc.source) ? [{ unit: hc.source }] : [];
  for (const target of targets) for (const effect of action.effects) applyEffect(ctx, effect, target, hc.source);
});
registerVerb("remove", (ctx, action, hc) => {
  if (action.do === "remove") removeByTags(ctx, hc.self, action.tags);
});
registerVerb("emit", (ctx, action, hc) => {
  if (action.do !== "emit") return;
  const ev = evalCtxFor(ctx, hc.self);
  emit(ctx, action.event, Object.fromEntries(Object.keys(action.payload ?? {}).sort().map(key => [key, evalNum(action.payload![key]!, ev)])));
});
