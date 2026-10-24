import type { CampaignState, OpsCtx } from "../state/types.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { crew, fail, ok, peekCrew, rules } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

export function soulNodes(s: CampaignState, ctx: OpsCtx, soul: string) {
  const p = s.roster.persons[soul], def = p && ctx.db.get("person", p.def);
  return def && "tree" in def.growth ? ctx.db.require("soultree", def.growth.tree).nodes : [];
}
export function openSoulNode(s: CampaignState, ctx: OpsCtx, soul: string, node: string): CmdResult {
  const tree = s.roster.persons[soul]?.will.soulTree, def = soulNodes(s, ctx, soul).find(n => n.id === node);
  if (!tree || !def) return fail("unknown-soul-node");
  if (tree.nodes.includes(node)) return fail("node-already-open");
  if (!def.requires.every(id => tree.nodes.includes(id))) return fail("node-prerequisite");
  if (!ctx.world.all("research").some(r => s.research[r.id]?.done && r.unlocks.some(u => u.kind === "soul-node" && (u.id === node || u.id === def.perk)))) return fail("research-required");
  tree.nodes.push(node); (s.roster.mastery[soul] ??= {})[node] = 0;
  applyOpsEffect(s, ctx, { applyEffect: { target: "person", id: soul, effect: def.perk } }, { person: soul });
  // 節點效果先掛零貢獻，出戰注入才能按 mastery 套用，避免未練熟即全額。
  const p = s.roster.persons[soul]!, effectId = ctx.db.require("effect", def.perk).id;
  const ids = new Set(p.effects.filter(e => e.effect === effectId).flatMap(e => e.contribIds));
  p.contribs = p.contribs.filter(c => !ids.has(c.id));
  ctx.emit("SoulNodeOpened", { soul, node }); return ok;
}
export function cmdAccompany(s: CampaignState, ctx: OpsCtx, cmd: Command<"accompany">): CmdResult {
  const soul = s.roster.persons[cmd.soul], by = s.roster.persons[cmd.by];
  if (!soul?.will.soulTree || !by || cmd.by === cmd.soul) return fail("invalid-companions");
  const node = cmd.node ?? soul.will.soulTree.nodes[0];
  if (!node || !soul.will.soulTree.nodes.includes(node) || !soulNodes(s, ctx, cmd.soul).some(n => n.id === node)) return fail("node-not-open");
  const rt = peekCrew(s);
  if (rt?.accompanied[cmd.soul] === s.clock.day || rt?.accompanied[cmd.by] === s.clock.day ||
    Object.entries(rt?.companions ?? {}).some(([id, pair]) => pair.day === s.clock.day && (id === cmd.soul || pair.by === cmd.by || id === cmd.by || pair.by === cmd.soul))) return fail("slot-used");
  crew(s).companions[cmd.soul] = { by: cmd.by, node, day: s.clock.day }; return ok;
}
export function soulDaily5(s: CampaignState, ctx: OpsCtx): void {
  const rt = peekCrew(s); if (!rt) return;
  for (const soul of Object.keys(rt.companions).sort()) {
    const pair = rt.companions[soul]!, tree = s.roster.persons[soul]?.will.soulTree;
    delete rt.companions[soul];
    const node = soulNodes(s, ctx, soul).find(n => n.id === pair.node);
    if (!tree || !node || !tree.nodes.includes(pair.node) || !s.roster.persons[pair.by] || pair.day < s.clock.day - 1) continue;
    if (rt.accompanied[soul] === s.clock.day || rt.accompanied[pair.by] === s.clock.day) continue;
    const need = node.companionship ?? rules(ctx).soulNeedHours;
    const mastery = s.roster.mastery[soul] ??= {}, before = mastery[node.id] ?? 0;
    mastery[node.id] = Math.min(1, Math.max(0, before + (need > 0 ? 1 / need : 1)));
    tree.companionship++; const trust = s.roster.trust[soul] ??= {}; trust[pair.by] = (trust[pair.by] ?? 0) + 1;
    rt.accompanied[soul] = s.clock.day; rt.accompanied[pair.by] = s.clock.day;
    ctx.emit("Accompanied", { soul, by: pair.by, node: node.id, mastery: mastery[node.id]! });
    if (before < 1 && mastery[node.id] === 1) ctx.emit("NodeMastered", { soul, node: node.id });
  }
}
