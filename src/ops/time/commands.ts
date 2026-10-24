import type { ContentDB } from "../../content/contentdb.ts";
import type { CampaignState, CampaignEvent, OpsCommand, OpsCtx, Sortie } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { createOpsCtx } from "../content/start.ts";
import { evalOpsCond } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";
import { nextId } from "../state/ids.ts";
import * as worldCommands from "../world/index.ts";
import * as contracts from "../contracts/index.ts";
import * as crew from "../crew/index.ts";
import { currentRoom, describeRoom, roomDefinition } from "../text/index.ts";
import type { TextState } from "../text/index.ts";
import { advanceDays, stageCtx, offerEvent, queuedEvents } from "./tick.ts";
import type { TickCtx } from "./tick.ts";

export type CmdResult = { ok: true } | { ok: false; error: string };
export type BattleRunner = (s: CampaignState, ctx: OpsCtx, sortie: Sortie) => CmdResult;
export type CommandOptions = { battle?: BattleRunner; onDay?: (s: CampaignState) => void };
const ok: CmdResult = { ok: true };
const fail = (error: string): CmdResult => ({ ok: false, error });

function choose(s: CampaignState, ctx: TickCtx, cmd: Extract<OpsCommand, { v: "choose" }>): CmdResult {
  const prompt = s.pendingChoices[0], index = cmd.choice - 1, choice = prompt?.choices[index];
  if (!Number.isInteger(index) || !prompt || !choice) return fail("invalid-choice");
  const scope = { node: s.ship.at, ...(prompt.person ? { person: prompt.person } : {}) };
  if (choice.requires && !evalOpsCond(s, ctx, choice.requires, scope)) return fail("choice-disabled");
  const naming = (prompt as Partial<crew.NamingPrompt>).naming;
  // SPEC-GAP：數字 choose 無文字欄；自填保留給 applyName，不捏造名稱。
  if (naming?.customChoice === index) return fail("name-required");
  const fourth = stageCtx(ctx, 4);
  if (!applyOpsEffects(s, fourth, choice.effects, scope)) return fail("effect-rejected");
  s.pendingChoices.shift();
  fourth.emit("Chosen", { choice: cmd.choice, ...(prompt.event ? { event: prompt.event } : {}) });
  const next = choice.next ?? (prompt.event ? ctx.world.get("event", prompt.event)?.next : undefined);
  if (next) offerEvent(s, fourth, next);
  queuedEvents(s, fourth);
  if (!s.pendingChoices.length) advanceDays(s, ctx, 0);
  return ok;
}

// SPEC-GAP：text 只提供 parse/render；缺少的三個 cmd 在編排邊界做最小處理。
function textCommand(s: TextState, ctx: OpsCtx, cmd: Extract<OpsCommand, { v: "go" | "look" | "talk" }>): CmdResult {
  if (cmd.v === "go") {
    const room = roomDefinition(cmd.room, ctx.world)?.id.split("/").at(-1);
    if (!room || !describeRoom(currentRoom(s), s, ctx.world, ctx.db).exits.includes(room)) return fail("no-exit");
    (s.text ??= {}).room = room; return ok;
  }
  if (cmd.v === "look") {
    if (!cmd.target || roomDefinition(cmd.target, ctx.world) || s.roster.persons[cmd.target] || s.mechs[cmd.target] || s.contracts[cmd.target] || ctx.world.get("node", cmd.target)) return ok;
    return fail("unknown-target");
  }
  const person = s.roster.persons[cmd.who];
  if (!person) return fail("unknown-person");
  if (!s.ship.rooms[currentRoom(s)]?.persons.includes(cmd.who)) return fail("person-not-here");
  const topic = ctx.world.all("dialogue").filter(d => d.person === person.def).flatMap(d => d.topics)
    .find(t => (!cmd.topic || t.topic === cmd.topic) && evalOpsCond(s, ctx, t.when, { person: cmd.who }));
  if (!topic) return fail("no-topic");
  if (!applyOpsEffects(s, ctx, topic.effects ?? [], { person: cmd.who })) return fail("effect-rejected");
  if (topic.choices?.length) s.pendingChoices.push({ text: topic.lines.join("\n"), choices: structuredClone(topic.choices), person: cmd.who });
  ctx.emit("Talked", { person: cmd.who }); return ok;
}
function dispatch(s: CampaignState, ctx: TickCtx, cmd: OpsCommand, opts: CommandOptions): CmdResult {
  if (s.pendingChoices.length && !["choose", "wait", "look", "save", "load", "help"].includes(cmd.v)) return fail("pending-choice");
  switch (cmd.v) {
    case "wait":
      if (!Number.isSafeInteger(cmd.days) || cmd.days < 1 || !Number.isSafeInteger(s.pendingTicks + cmd.days)) return fail("invalid-days");
      advanceDays(s, ctx, cmd.days); return ok;
    case "choose": return choose(s, ctx, cmd);
    case "sail": { const result = worldCommands.cmdSail(s, ctx, cmd); if (result.ok) advanceDays(s, ctx, 0); return result; }
    case "map": return worldCommands.cmdMap(s, ctx, cmd);
    case "dock": return worldCommands.cmdDock(s, ctx, cmd);
    case "drift": return worldCommands.cmdDrift(s, ctx, cmd);
    case "trade": return worldCommands.cmdTrade(s, ctx, cmd);
    case "explore": return worldCommands.cmdExplore(s, ctx, cmd);
    case "board": return contracts.cmdBoard(s, ctx, cmd);
    case "accept": return contracts.cmdAccept(s, ctx, cmd);
    case "drop": return contracts.cmdDrop(s, ctx, cmd);
    case "assign": return crew.cmdAssign(s, ctx, cmd);
    case "queue": return crew.cmdQueue(s, ctx, cmd);
    case "reorder": return crew.cmdReorder(s, ctx, cmd);
    case "accompany": return crew.cmdAccompany(s, ctx, cmd);
    case "hire": return crew.cmdHire(s, ctx, cmd);
    case "fire": return crew.cmdFire(s, ctx, cmd);
    case "wake": return crew.cmdWake(s, ctx, cmd);
    case "pay": return crew.cmdPay(s, ctx, cmd);
    case "devour": return crew.cmdDevour(s, ctx, cmd);
    case "go": case "look": case "talk": return textCommand(s, ctx, cmd);
    case "sortie": {
      if (!opts.battle) return fail("no-battle-runner");
      const input = { ...s.pendingBattle, ...cmd.sortie };
      const sortie: Sortie = { id: input.id ?? nextId(s, "sortie"), day: s.clock.day, node: input.node ?? s.ship.at,
        trigger: input.trigger ?? (input.contract ? "contract" : "ambush"), units: input.units ?? [],
        supplies: input.supplies ?? { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: s.ship.hull.cur > 0 }, injected: input.injected ?? [],
        ...(input.contract ? { contract: input.contract } : {}), ...(input.rift ? { rift: input.rift } : {}),
        ...(input.operation ? { operation: input.operation } : {}) };
      return opts.battle(s, ctx, sortie);
    }
    case "save": ctx.emit("SaveRequested"); return ok;
    case "load":
      if (!Number.isSafeInteger(cmd.slot) || cmd.slot < 0) return fail("invalid-slot");
      ctx.emit("LoadRequested", { slot: cmd.slot }); return ok;
    case "help": return ok;
  }
}
export function applyCommand(input: CampaignState, db: ContentDB, world: WorldDB, cmd: OpsCommand, opts: CommandOptions = {}): {
  state: CampaignState; events: CampaignEvent[]; result: CmdResult;
} {
  const state = structuredClone(input), ctx: TickCtx = { ...createOpsCtx(state, db, world), onDay: opts.onDay };
  const result = dispatch(state, ctx, cmd, opts);
  // 模組的複合效果或注入 runner 即使先改後拒絕，也不可洩漏部分交易。
  return result.ok ? { state, events: state.log.slice(input.log.length), result } : { state: structuredClone(input), events: [], result };
}
