import { createRng } from "../../core/rng.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import { nodeLoc } from "./loc.ts";
import { factionModelPool, initRnd } from "./rnd.ts";
import { factionId, nextRelationState, relationKey } from "./relations.ts";
export function warFactionIds(s: CampaignState, ctx: OpsCtx): string[] {
  return Object.keys(s.factions).sort().filter(id => {
    const f = s.factions[id]!, def = ctx.world.require("faction-ops", f.def), core = ctx.db.get("faction", def.faction);
    return f.alive && !!core && !core.tags.includes("kaiju") && core.id.split(":").at(-1) !== "faction/migrant-crew";
  });
}
export function initWar(s: CampaignState, ctx: OpsCtx, seed: number): void {
  const cfg = ctx.world.all("forces")[0];
  if (!cfg || !ctx.world.all("operation").length) return;
  s.warRng = createRng(seed, 0x5741); s.operations = {}; s.models = {}; s.shells = {}; s.relations = {};
  const ids = warFactionIds(s, ctx);
  for (const id of ids) {
    const f = s.factions[id]!, def = ctx.world.require("faction-ops", id), pool = factionModelPool(s, ctx, id);
    const home = f.territoryNow[0]; if (!home) continue;
    for (const node of f.territoryNow) if (!ctx.world.require("node", node).owner) s.nodes[node]!.ownerOverride = def.faction;
    const units = (def.roster ?? []).flatMap(u => {
      const model = "model" in u ? ctx.world.get("model", u.model) : ctx.world.all("model").find(m => m.frame === u.frame);
      return model && pool.includes(model.id) ? [{ model: model.id, count: u.count, readiness: 1 }] : [];
    });
    f.forces = { units, supply: cfg.initialSupply, morale: 0, pos: nodeLoc(ctx, home), speed: cfg.speed }; f.shells = []; f.ops = []; f.prestige = 0;
  }
  for (const shell of cfg.shells) {
    const copy = structuredClone(shell);
    if (typeof copy.holder === "string" && copy.holder !== "player") copy.holder = factionId(s, ctx, copy.holder) ?? copy.holder;
    s.shells[copy.id] = copy;
    if (typeof copy.holder === "string") s.factions[copy.holder]?.shells?.push(copy.id);
  }
  initRnd(s, ctx, ids);
  const aff = ctx.world.all("affinity")[0];
  for (let i = 0; i < ids.length; i++) for (const b of ids.slice(i + 1)) {
    const a = ids[i]!, pair = aff?.pairs.find(p => relationKey(factionId(s, ctx, p.a) ?? p.a, factionId(s, ctx, p.b) ?? p.b) === relationKey(a, b));
    const ta = ctx.world.require("faction-ops", a).tags, tb = ctx.world.require("faction-ops", b).tags;
    const baseline = pair?.baseline ?? (pair?.rivalry ? -20 : ta.some(t => t.startsWith("culture:") && tb.includes(t)) ? 10 : 0);
    const r = { a, b, value: pair?.value ?? baseline, baseline, state: "neutral" as const, treaties: [], grievances: [], weariness: 0, since: s.clock.day };
    s.relations[relationKey(a, b)] = { ...r, state: nextRelationState(r, false, false) };
  }
}
