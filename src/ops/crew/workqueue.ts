import { chance } from "../../core/rng.ts";
import type { Account, CampaignState, Job, JobDef, OpsCtx } from "../state/types.ts";
import { nextId } from "../state/ids.ts";
import { isAccount } from "../state/ledger.ts";
import { instantiateMech, instantiatePerson } from "../content/instantiate.ts";
import { beastRules } from "./restraint.ts";
import { applyOpsEffect } from "../content/opseffect.ts";
import { finishResearch, researchReady } from "./research.ts";
import { compareId, employment, expense, fail, ok, peekCrew } from "./shared.ts";
import type { CmdResult, Command } from "./shared.ts";

// SPEC-GAP：Job 無 slot／配方／移植失敗率；欄位留在本模組，仍可 JSON 存檔。
export type CrewJob = Job & { slot?: string; recipe?: string; rejectChance?: number; result?: string };
export type CrewJobDef = JobDef & { materials?: Partial<Record<Account, number>>; result?: string; rejectChance?: number };
function partTemplate(s: CampaignState, ctx: OpsCtx, target: string, part?: string) {
  const mech = s.mechs[target]; if (!mech) return undefined;
  return ctx.db.require("bodyplan", ctx.db.require("frame", mech.frame).bodyPlan).parts.find(p => p.id === part);
}
export function cmdQueue(s: CampaignState, ctx: OpsCtx, cmd: Command<"queue">): CmdResult {
  const input = cmd.job as Partial<CrewJob>, kind = input.kind, target = input.target;
  if (!kind || !target || !["repair", "rebuild", "research", "graft", "incubate", "install", "mod", "restrain", "mount", "embalm", "prune"].includes(kind)) return fail("invalid-job");
  if (!Number.isFinite(input.priority ?? 0)) return fail("invalid-priority");
  let needHours = 0, materials: Partial<Record<Account, number>> = {}, canonical = target;
  let slot: string | undefined, recipe: CrewJobDef | undefined;
  if (kind === "restrain" || kind === "mount" || kind === "embalm" || kind === "prune") {
    const beast = s.restraint.beasts[target], carcass = s.restraint.carcasses.find(c => c.id === target);
    const cfg = kind === "prune" ? ctx.world.get("beasts", "beasts/mycelium") : beastRules(s, ctx, target);
    if (!cfg || kind === "restrain" && beast?.kind !== "live" || kind === "embalm" && beast?.kind !== "corpse" || kind === "mount" && !carcass || kind === "prune" && !s.restraint.myceliumRoom) return fail("invalid-beast-job");
    if (kind === "prune") { canonical = "mycelium"; needHours = cfg.prune.hours; }
    else {
      const grade = carcass?.grade ?? ctx.db.require("frame", s.mechs[target]!.frame).grade, mult = cfg.gradeMult[grade];
      if (!mult) return fail("missing-grade-cost");
      needHours = cfg[kind].hours * (kind === "mount" ? mult * mult : mult);
      materials = { "stock:scrap": cfg[kind].scrap * mult };
      if (kind === "mount") {
        if (!ctx.db.get("frame", `frame/corpse-${carcass!.species.split("/").at(-1)}`)) return fail("missing-corpse-frame");
        materials[`stock:core-${grade}`] = 1;
      }
    }
  } else if (kind === "repair" || kind === "rebuild") {
    const mech = s.mechs[target], template = partTemplate(s, ctx, target, input.part), layer = input.layer;
    if (!mech || !template || layer === undefined || !Number.isInteger(layer) || !template.layers[layer] || !mech.parts[template.id]?.layers[layer]) return fail("invalid-repair-target");
    const def = template.layers[layer]!, state = mech.parts[template.id]!.layers[layer]!;
    const missing = Math.max(0, (state.maxHp ?? def.hp) - state.hp), rebuild = def.structural && state.hp <= 0;
    if (!missing || rebuild !== (kind === "rebuild")) return fail("invalid-repair-kind");
    const coefficients = ctx.world.all("job").filter(j => j.kind === "repair");
    const config = coefficients.find(j => j.hoursPerHp?.[def.type] !== undefined);
    if (!config?.hoursPerHp || !config.perHp || !config.material?.[def.type]) return fail("missing-repair-coefficients");
    const frame = ctx.db.require("frame", mech.frame);
    const material: Account = frame.repairPolicy === "repair-only" ? `stock:core-${frame.grade}` : config.material[def.type]!;
    needHours = missing * config.hoursPerHp[def.type]! * (rebuild ? config.rebuildMult?.hours ?? 1 : 1);
    materials[material] = missing * config.perHp[def.type]! * (rebuild ? config.rebuildMult?.material ?? 1 : 1);
  } else if (kind === "research") {
    const def = ctx.world.get("research", target); if (!def) return fail("unknown-research");
    if (s.research[def.id]?.done) return fail("research-done");
    if (!researchReady(s, ctx, def)) return fail("research-prerequisite");
    canonical = def.id; needHours = def.cost.techHours; materials = { ...def.consumes };
    materials.cash = (materials.cash ?? 0) + def.cost.coin;
  } else {
    recipe = (input.recipe ? ctx.world.get("job", input.recipe) : ctx.world.all("job").find(j => j.kind === kind)) as CrewJobDef | undefined;
    if (!recipe || recipe.kind !== kind || recipe.needHours === undefined) return fail("missing-job-recipe");
    needHours = recipe.needHours; materials = { ...recipe.materials }; materials.cash = (materials.cash ?? 0) + (recipe.coin ?? 0);
    if (kind === "incubate") {
      if (!recipe.person || ctx.db.get("person", recipe.person)?.kind !== "soul") return fail("missing-soul-template");
      if (Object.keys(s.roster.persons).length + s.jobs.filter(j => j.kind === "incubate").length >= s.ship.capacity.berths) return fail("no-berth");
    } else {
      const mech = s.mechs[target], part = partTemplate(s, ctx, target, input.part);
      if (!mech || !part || !input.component) return fail("invalid-install-target");
      if (ctx.db.require("frame", mech.frame).repairPolicy === "repair-only") return fail("repair-only");
      const component = s.inventory.components.find(c => c.id === input.component), def = component && ctx.db.get("component", component.def);
      if (!component || !def || component.boundTo && !s.roster.persons[component.boundTo]) return fail("unknown-component");
      slot = part.slots.find(v => (!input.slot || input.slot === v.id) && v.type === def.slot && v.size >= def.size)?.id;
      if (!slot || !Object.hasOwn(mech.parts[part.id]!.components, slot)) return fail("no-compatible-slot");
      if (kind === "mod" && (!recipe.result || !ctx.db.get("component", recipe.result))) return fail("missing-modification-result");
    }
  }
  if (!Number.isFinite(needHours) || needHours <= 0 || Object.entries(materials).some(([a, n]) => !isAccount(a) || a === "debt" || !Number.isFinite(n) || n! < 0)) return fail("invalid-job-cost");
  if (s.jobs.some(j => j.kind === kind && j.target === canonical && j.part === input.part && j.layer === input.layer || input.component && j.component === input.component)) return fail("job-already-queued");
  const job: CrewJob = { id: nextId(s, "job"), kind, target: canonical, needHours, doneHours: 0, materials, paid: false, priority: input.priority ?? 0,
    ...(input.part !== undefined ? { part: input.part } : {}), ...(input.layer !== undefined ? { layer: input.layer } : {}),
    ...(input.component ? { component: input.component } : {}), ...(slot ? { slot } : {}),
    ...(recipe ? { recipe: recipe.id, ...(recipe.rejectChance !== undefined ? { rejectChance: recipe.rejectChance } : {}), ...(recipe.result ? { result: recipe.result } : {}) } : {}) };
  s.jobs.push(job); return ok;
}
export function cmdReorder(s: CampaignState, _ctx: OpsCtx, cmd: Command<"reorder">): CmdResult {
  const job = s.jobs.find(j => j.id === cmd.job); if (!job) return fail("unknown-job");
  if (!Number.isFinite(cmd.priority)) return fail("invalid-priority");
  job.priority = cmd.priority; return ok;
}
function finishJob(s: CampaignState, ctx: OpsCtx, job: CrewJob): void {
  if (job.kind === "restrain") s.restraint.beasts[job.target]!.wear = 0;
  else if (job.kind === "mount") {
    const carcass = s.restraint.carcasses.find(c => c.id === job.target)!;
    const mech = instantiateMech(ctx.db, nextId(s, "mech"), `frame/corpse-${carcass.species.split("/").at(-1)}`);
    for (const [id, part] of Object.entries(carcass.parts)) if (mech.parts[id]) mech.parts[id]!.layers = structuredClone(part.layers);
    mech.controlMode = "pilot"; s.mechs[mech.id] = mech; s.inventory.mechs.push(mech.id);
    s.restraint.slots[carcass.slot] = mech.id;
    s.restraint.beasts[mech.id] = { mech: mech.id, kind: "corpse", wear: 0, vitality: 0, bond: {} };
    s.flags[`embalmMonth:${mech.id}`] = s.clock.month + 1;
    if (s.roster.names[carcass.id]) { s.roster.names[mech.id] = s.roster.names[carcass.id]!.filter(n => n.kind !== "epithet"); delete s.roster.names[carcass.id]; }
    s.restraint.carcasses = s.restraint.carcasses.filter(c => c.id !== carcass.id);
    ctx.emit("Mounted", { carcass: carcass.id, mech: mech.id });
  } else if (job.kind === "embalm") s.flags[`embalmMonth:${job.target}`] = s.clock.month + 1;
  else if (job.kind === "prune") {
    const room = s.restraint.myceliumRoom!; room.lastPrune = s.clock.day; room.layers = 0; room.growth = 0;
  } else if (job.kind === "research") finishResearch(s, ctx, job.target, job.doneHours);
  else if (job.kind === "repair" || job.kind === "rebuild") {
    const part = s.mechs[job.target]?.parts[job.part!], template = partTemplate(s, ctx, job.target, job.part), layer = part?.layers[job.layer!];
    if (part && template && layer) { layer.hp = layer.maxHp ?? template.layers[job.layer!]!.hp; layer.broken = false;
      part.broken = template.layers.some((l, i) => l.structural && part.layers[i]!.hp <= 0); }
  } else if (job.kind === "incubate") {
    const def = ctx.world.require("job", job.recipe!), id = nextId(s, "person"), p = instantiatePerson(ctx.db, id, def.person!);
    s.roster.persons[id] = p; s.roster.employment[id] = employment(s, 0, "crew");
    const person = ctx.db.require("person", p.def);
    if ("tree" in person.growth) for (const node of ctx.db.require("soultree", person.growth.tree).nodes.filter(n => !n.requires.length)) {
      p.will.soulTree!.nodes.push(node.id); (s.roster.mastery[id] ??= {})[node.id] = 0;
      applyOpsEffect(s, ctx, { applyEffect: { target: "person", id, effect: node.perk } });
    }
    p.contribs = []; s.roster.trust[id] = {}; s.ship.rooms.galley?.persons.push(id);
  } else {
    if (job.kind === "graft" && chance(s.rng, job.rejectChance ?? 0)) { ctx.emit("GraftRejected", { job: job.id, mech: job.target }); return; }
    const component = s.inventory.components.find(c => c.id === job.component), part = s.mechs[job.target]?.parts[job.part!];
    if (component && part && job.slot) {
      if (job.kind === "mod" && job.result) component.def = job.result;
      // Inventory 保存所有有身分的部件；slots 是裝配關係，拆下仍留原件與 layerHp。
      part.components[job.slot] = component.id;
    }
  }
  ctx.emit("JobDone", { job: job.id, target: job.target });
}
export function workqueueDaily5(s: CampaignState, ctx: OpsCtx): void {
  const craft = Object.keys(ctx.db.registries.attrs).sort().find(id => id === "craft" || ctx.db.registries.attrs[id]!.tags?.includes("craft"));
  const base = ctx.world.require("job", "job/repair").technicianHours ?? 0;
  for (const id of Object.keys(s.roster.employment).sort()) if (s.roster.employment[id]!.role === "technician") s.techHours += craft ? s.roster.persons[id]?.attrsBase[craft] ?? 0 : base;
  const owed = Math.min(s.techHours, s.flags.restraintHoursOwed ?? 0);
  if (owed) { s.techHours -= owed; s.flags.restraintHoursOwed! -= owed; }
  const done = new Set<string>();
  // SPEC-GAP：priority 越小越先；剩餘當日工時不跨日累積。
  for (const job of [...s.jobs].sort((a, b) => a.priority - b.priority || compareId(a.id, b.id)) as CrewJob[]) {
    if (s.techHours <= 0) break;
    if (job.kind === "incubate" && Object.keys(s.roster.persons).length >= s.ship.capacity.berths) continue;
    if (job.kind === "mount" ? !s.restraint.carcasses.some(c => c.id === job.target) : !["research", "incubate", "prune"].includes(job.kind) && !s.mechs[job.target]) continue;
    if (s.flags[`molting:${job.target}`]) continue;
    if (!job.paid) {
      const accounts = Object.keys(job.materials).sort() as Account[];
      if (accounts.some(a => (s.ledger.balances[a] ?? 0) < job.materials[a]!)) continue;
      for (const account of accounts) expense(s, ctx, account, job.materials[account]!, "JobStarted", { job: job.id });
      job.paid = true;
    }
    const hours = Math.min(s.techHours, job.needHours - job.doneHours); job.doneHours += hours; s.techHours -= hours;
    if (job.kind === "research") {
      const state = s.research[job.target] ??= { def: job.target, hoursDone: 0, coinPaid: false, done: false };
      state.hoursDone = job.doneHours; state.coinPaid = true;
    }
    if (job.doneHours >= job.needHours) { finishJob(s, ctx, job); done.add(job.id); }
  }
  s.jobs = s.jobs.filter(j => !done.has(j.id)); s.techHours = 0;
}
