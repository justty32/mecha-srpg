import { placeDef, allPlaces } from "../world/places.ts";
import { nearbyPlaces } from "../world/places.ts";
import { nextFloat, pickWeighted } from "../../core/rng.ts";
import type { CampaignState, OpsCtx } from "../state/types.ts";
import type { OperationDef, OperationState, Phase, ForceUnit } from "./types.ts";
import { evalOpsCond, evalOpsNum } from "../content/cond.ts";
import { applyOpsEffects } from "../content/opseffect.ts";
import { placeAt, marchPath, placeLoc, sameRegion } from "./loc.ts";
import { spawnActor, despawnActor } from "../world/actors.ts";
import { mergeUnits, modelPower, riftStrength, strength } from "./forces.ts";
import { resolveEngage } from "./resolve.ts";
import { factionId, hasTreaty, relation, relationRank } from "./relations.ts";
import { drive, operationDiplomacy } from "./drivers.ts";
import { breakTreaty } from "./treaties.ts";
import { nextSpring } from "../world/rifts.ts";
import { onMuster, onOperationEnd, playerEngages } from "./merc-hook.ts";
import { onOperationSuccess } from "./rnd.ts";
import { mercDaily } from "./merc.ts";
import { blightAt, patchDepth } from "../world/blight.ts";
import { removePatch } from "../world/patches.ts";
import { locAt } from "./loc.ts";
export function activeOperation(op: OperationState): boolean { return !["done", "failed", "aborted"].includes(op.phase); }
export function placeOwner(s: CampaignState, ctx: OpsCtx, node: string): string | undefined {
  const raw = s.places[node]?.ownerOverride ?? placeDef(s, ctx, node)?.owner;
  return raw ? factionId(s, ctx, raw) : Object.keys(s.factions).sort().find(id => s.factions[id]!.territoryNow.includes(node));
}
export function operationTargets(s: CampaignState, ctx: OpsCtx, actor: string, def: OperationDef): OperationState["target"][] {
  const targets: OperationState["target"][] = [];
  if (def.kind === "relief") {
    for (const op of Object.values(s.operations ?? {})) if (activeOperation(op) && ["siege", "assault"].includes(ctx.world.require("operation", op.def).kind)) {
      const owner = op.target.faction ?? placeOwner(s, ctx, (placeAt(s, ctx, op.target.loc) ?? "")), r = owner ? relation(s, actor, owner) : undefined;
      if (owner === actor || r && (r.state === "allied" || r.state === "friendly" && hasTreaty(s, ctx, r, "alliance"))) targets.push({ ...op.target, faction: owner });
    }
    return targets;
  }
  if (def.targetSel === "ruin-shell") {
    for (const shell of Object.values(s.shells ?? {}).sort((a, b) => a.id.localeCompare(b.id))) if (typeof shell.holder === "object") targets.push({ loc: placeLoc(s, ctx, shell.holder.ruin), shell: shell.id });
  } else if (def.targetSel === "rift-core") {
    for (const r of Object.values(s.rifts).sort((a, b) => a.id.localeCompare(b.id))) if (r.phase === "anchored") targets.push({ loc: placeLoc(s, ctx, r.site), rift: r.id });
  } else if (def.targetSel === "shallow-place" || def.kind === "contain") {
    for (const patch of Object.values(s.patches)) {
      const depth = patchDepth(s, ctx, patch);
      if (def.kind === "contain" ? depth !== "core" : depth === "shallow") targets.push({ loc: locAt(ctx, patch.map, patch.cells[0]!), rift: patch.rift });
    }
  } else if (def.targetSel === "enemy-place" || def.targetSel === "port") {
    for (const n of allPlaces(s, ctx)) {
      const owner = placeOwner(s, ctx, n.id), r = owner ? relation(s, actor, owner) : undefined;
      if (!owner || !r || owner === actor || !s.factions[owner]?.alive) continue;
      if (def.targetSel === "port" && n.kind !== "port") continue;
      if (def.kind === "siege" && n.kind !== "city") continue;
      if (def.requiresRelation && relationRank[r.state] > relationRank[def.requiresRelation]) continue;
      if (hasTreaty(s, ctx, r, "ceasefire")) continue;
      targets.push({ loc: placeLoc(s, ctx, n.id), faction: owner });
    }
  } else {
    // SPEC-GAP：本波護送維持同圖地盤地點間的抽象格路線，未綁第三波商隊行動者。
    for (const home of [...s.factions[actor]!.territoryNow].sort()) for (const destination of nearbyPlaces(s, ctx, home)) {
      targets.push({ loc: placeLoc(s, ctx, destination), lane: [placeLoc(s, ctx, home), placeLoc(s, ctx, destination)] });
    }
  }
  return targets;
}
export function targetStrength(s: CampaignState, ctx: OpsCtx, target: OperationState["target"], def: OperationDef): number {
  if (def.kind === "relief") {
    const siege = Object.values(s.operations ?? {}).find(o => activeOperation(o) && ["siege", "assault"].includes(ctx.world.require("operation", o.def).kind) && sameRegion(o.target.loc, target.loc));
    if (siege) return strength(siege.force, siege.power ?? modelPower(ctx));
  }
  if (target.rift && s.rifts[target.rift]) return riftStrength(s, ctx, s.rifts[target.rift]!);
  if (target.faction && s.factions[target.faction]?.forces) return Math.max(1, strength(s.factions[target.faction]!.forces!, modelPower(ctx)));
  return ctx.world.all("forces")[0]!.rift.width;
}
export function operationAllowed(s: CampaignState, ctx: OpsCtx, actor: string, def: OperationDef, target: OperationState["target"]): boolean {
  const f = s.factions[actor], force = f?.forces;
  if (!s.warRng || !f?.alive || !force || !def.actorScales.includes(f.scaleNow) || force.supply < 40 || (f.ops?.length ?? 0) >= (f.scaleNow === "state" ? 2 : 1)) return false;
  if (!evalOpsCond(s, ctx, def.valid, { faction: actor, targetFaction: target.faction, node: (placeAt(s, ctx, target.loc) ?? ""), rift: target.rift })) return false;
  if (def.kind === "contain" && nextSpring(s, ctx) - s.clock.day > 5) return false;
  if (def.requiresRelation && target.faction) {
    const r = relation(s, actor, target.faction);
    if (!r || relationRank[r.state] > relationRank[def.requiresRelation] || hasTreaty(s, ctx, r, "ceasefire")) return false;
  }
  return strength(force, modelPower(ctx)) >= 0.8 * targetStrength(s, ctx, target, def) && marchPath(s, ctx, force.pos, target.loc) !== undefined;
}
export function startOperation(s: CampaignState, ctx: OpsCtx, actorInput: string, id: string, explicit?: OperationState["target"]): OperationState | undefined {
  const actor = factionId(s, ctx, actorInput), def = ctx.world.get("operation", id); if (!actor || !def || !s.operations || !s.warRng) return;
  const targets = (explicit ? [explicit] : operationTargets(s, ctx, actor, def)).filter(t => operationAllowed(s, ctx, actor, def, t));
  if (!targets.length) return;
  const target = pickWeighted(s.warRng, targets, () => 1), main = s.factions[actor]!.forces!, power = modelPower(ctx);
  const fraction = Math.max(0.2, Math.min(0.8, evalOpsNum(s, ctx, def.commit, { faction: actor })));
  const units = main.units.map(u => ({ ...u, count: Math.floor(u.count * fraction) })).filter(u => u.count > 0);
  if (!units.length) return;
  // 作戰 id 使用自身流水，避免改動既有契約與人物 id 序列。
  const opId = `operation-${Object.keys(s.operations).length + 1}`;
  const op: OperationState = { id: opId, def: def.id, actor, coActors: [], target: structuredClone(target), phase: "muster", startDay: s.clock.day,
    phaseEnd: s.clock.day + phaseDays(s, ctx, def, "muster", actor), force: { ...structuredClone(main), units, path: marchPath(s, ctx, main.pos, target.loc) },
    enemyStr: targetStrength(s, ctx, target, def), progress: 0, engagesLeft: phaseDays(s, ctx, def, "engage", actor), mercSlots: [], exposed: !def.covert, log: [], power,
    contributions: { [actor]: structuredClone(units) } };
  for (const u of units) main.units.find(x => x.model === u.model)!.count -= u.count;
  if (def.kind === "contain") op.phaseEnd = Math.min(op.phaseEnd, nextSpring(s, ctx) - 1);
  for (const other of Object.values(s.operations).sort((a, b) => a.id.localeCompare(b.id))) if (activeOperation(other) && other.actor !== actor &&
    (target.shell && other.target.shell === target.shell || target.rift && other.target.rift === target.rift && def.kind === "assault")) drive(s, ctx, "same-target", actor, other.actor, op);
  // 友軍共同投入；從各自常備軍扣除，結束時按投入比例返還。
  for (const id of Object.keys(s.factions).sort()) {
    const r = relation(s, actor, id), ally = s.factions[id]!, home = ally.forces;
    if (id === actor || !home || !ally.alive || home.supply < 40 || (ally.ops?.length ?? 0) >= (ally.scaleNow === "state" ? 2 : 1)) continue;
    if (r?.state !== "allied" && !op.coActors.includes(id)) continue;
    if (home.pos.map !== main.pos.map) continue;
    const committed = home.units.map(u => ({ ...u, count: Math.floor(u.count * fraction) })).filter(u => u.count > 0);
    if (!committed.length) continue;
    for (const u of committed) home.units.find(x => x.model === u.model)!.count -= u.count;
    op.contributions![id] = committed; mergeUnits(op.force, committed); if (!op.coActors.includes(id)) op.coActors.push(id); (ally.ops ??= []).push(opId);
  }
  op.initialStr = strength(op.force, power);
  if (def.kind === "relief") op.reliefOf = Object.values(s.operations).find(o => activeOperation(o) && ["siege", "assault"].includes(ctx.world.require("operation", o.def).kind) && sameRegion(o.target.loc, target.loc))?.id;
  s.operations[opId] = op; (s.factions[actor]!.ops ??= []).push(opId);
  const rel = target.faction ? relation(s, actor, target.faction) : undefined;
  if (rel && ["seize", "siege", "blockade"].includes(def.kind)) for (const treaty of rel.treaties) if (["nonaggression", "alliance"].includes(ctx.world.require("treaty", treaty.def).kind)) breakTreaty(s, ctx, rel, treaty, actor);
  ctx.emit("OperationStarted", { operation: op.id, actor, def: def.id, kind: def.kind, node: (placeAt(s, ctx, target.loc) ?? "") }); onMuster(s, ctx, op); return op;
}
function phaseDays(s: CampaignState, ctx: OpsCtx, def: OperationDef, phase: Phase, actor: string): number {
  return Math.max(1, Math.ceil(evalOpsNum(s, ctx, def.phases.find(p => p.phase === phase)?.days ?? 1, { faction: actor })));
}
function setPhase(s: CampaignState, ctx: OpsCtx, op: OperationState, to: Phase): void {
  op.phase = to; op.phaseEnd = s.clock.day + phaseDays(s, ctx, ctx.world.require("operation", op.def), to, op.actor);
  if (to === "march") {
    const actor = spawnActor(s, ctx, { id: `force:${op.id}`, kind: "force", at: op.force.pos, faction: op.actor,
      operation: op.id, str: strength(op.force, op.power ?? modelPower(ctx)), goal: { type: "goto", target: op.target.loc } });
    if (actor) actor.mp = ctx.world.require("actor", "actor/force").mp * op.force.speed;
  }
  if (to === "aftermath") despawnActor(s, ctx, `force:${op.id}`, "aftermath");
  ctx.emit("OperationPhase", { operation: op.id, phase: to });
}
function returnForces(s: CampaignState, op: OperationState): void {
  const entries = Object.entries(op.contributions ?? { [op.actor]: op.force.units }).sort(([a], [b]) => a.localeCompare(b));
  const totals: Record<string, number> = {};
  for (const [, units] of entries) for (const u of units) totals[u.model] = (totals[u.model] ?? 0) + u.count;
  const remaining = Object.fromEntries(op.force.units.map(u => [u.model, u.count]));
  for (const [i, [id, units]] of entries.entries()) {
    const f = s.factions[id]; if (!f?.forces) continue;
    mergeUnits(f.forces, units.map(u => {
      const survivor = op.force.units.find(x => x.model === u.model);
      const count = i === entries.length - 1 ? remaining[u.model] ?? 0 : Math.floor((survivor?.count ?? 0) * u.count / totals[u.model]!);
      remaining[u.model] = (remaining[u.model] ?? 0) - count;
      return { model: u.model, count, readiness: survivor?.readiness ?? 0 };
    }));
    f.ops = f.ops?.filter(id => id !== op.id);
  }
}
export function endOperation(s: CampaignState, ctx: OpsCtx, op: OperationState, outcome: "done" | "failed" | "aborted"): void {
  if (!activeOperation(op)) return;
  const def = ctx.world.require("operation", op.def);
  if (outcome === "failed" && def.covert && op.target.faction && s.warRng && !op.log.some(e => e.kind === "player-exposure")) {
    op.exposed = nextFloat(s.warRng) < 0.3 || op.exposed;
    if (op.exposed) drive(s, ctx, "op-success-against", op.actor, op.target.faction);
  }
  if (outcome !== "done") applyOpsEffects(s, ctx, outcome === "failed" ? def.onFail : def.onAbort, operationScope(s, ctx, op));
  op.phase = outcome; op.phaseEnd = s.clock.day;
  despawnActor(s, ctx, `force:${op.id}`, outcome);
  ctx.emit(outcome === "done" ? "OperationResolved" : outcome === "failed" ? "OperationFailed" : "OperationAborted", { operation: op.id, actor: op.actor, days: s.clock.day - op.startDay });
  returnForces(s, op); onOperationEnd(s, ctx, op);
  // 已結束的作戰不再需要結算快照；避免每次指令複製所有歷史作戰的機型表與出資副本。
  delete op.power; delete op.contributions; delete op.force.path;
}
export function operationScope(s: CampaignState, ctx: OpsCtx, op: OperationState) { return { operation: op.id, faction: op.actor, targetFaction: op.target.faction, node: (placeAt(s, ctx, op.target.loc) ?? ""), rift: op.target.rift }; }
export function operationsDaily2c(s: CampaignState, ctx: OpsCtx): void {
  if (!s.operations || !s.warRng) return;
  mercDaily(s, ctx);
  const maxDays = ctx.world.all("forces")[0]!.maxDays;
  for (const id of Object.keys(s.operations).sort()) {
    let op = s.operations[id]!; if (!activeOperation(op)) continue;
    const def = ctx.world.require("operation", op.def);
    if (s.clock.day - op.startDay >= maxDays) { endOperation(s, ctx, op, "aborted"); continue; }
    if (op.phase === "muster" && s.clock.day >= op.phaseEnd) setPhase(s, ctx, op, "march");
    if (op.phase === "march") {
      const actor = s.actors[`force:${op.id}`];
      const arrived = !!actor?.destination && actor.lastPlanDay !== undefined && !actor.path?.length &&
        actor.pos.map === actor.destination.map && actor.pos.cell.x === actor.destination.cell.x && actor.pos.cell.y === actor.destination.cell.y;
      if (arrived && (def.kind !== "contain" || s.clock.phase === "spring")) setPhase(s, ctx, op, "engage");
    }
    if (op.phase === "engage") {
      // SPEC-GAP：沿用作戰記錄欄名 containedPlaces，內容改存本潮蝕塊 id。
      if (def.kind === "contain" && s.clock.phase === "spring") op.containedPlaces = s.log.filter(e => e.day === s.clock.day && e.type === "PlaceBlighted" && e.payload.rift === op.target.rift).map(e => String(e.payload.patch));
      if (def.kind === "siege") for (const faction of Object.keys(s.factions).sort()) {
        if (faction === op.actor || faction === op.target.faction) continue;
        if (s.factions[faction]!.territoryNow.some(n => nearbyPlaces(s, ctx, (placeAt(s, ctx, op.target.loc) ?? "")).includes(n)))
          applyOpsEffects(s, ctx, [{ relation: { a: op.actor, b: faction, delta: -1, reason: "siege-trade" } }], operationScope(s, ctx, op));
      }
      if (op.target.rift && s.clock.phase === "spring") { const r = s.rifts[op.target.rift]; if (r && r.phase === "anchored") op.enemyStr = Math.max(op.enemyStr, riftStrength(s, ctx, r)); }
      if (playerEngages(s, ctx, op)) continue;
      const result = resolveEngage(op, s.warRng); nextFloat(s.warRng);
      const next = result.phase; result.phase = "engage"; s.operations[id] = op = result;
      op.log.push({ day: s.clock.day, kind: "engage", v: op.progress });
      ctx.emit("OperationEngaged", { operation: id, progress: op.progress, enemyStr: op.enemyStr });
      if (next === "failed" || next === "aborted") endOperation(s, ctx, op, next);
      else if (next === "resolve") setPhase(s, ctx, op, "resolve");
      continue;
    }
    if (op.phase === "resolve" && s.clock.day >= op.phaseEnd) {
      if (def.covert && !op.log.some(e => e.kind === "player-exposure")) op.exposed = nextFloat(s.warRng) < 0.3 || op.exposed;
      const targetPlace = placeAt(s, ctx, op.target.loc);
      const cellClear = def.onSuccess.some(e => "setPlace" in e && e.setPlace.clearBlight) && !targetPlace;
      applyOpsEffects(s, ctx, def.onSuccess.filter(e => !("transferShell" in e && s.shells?.[op.target.shell ?? ""]?.holder === "player") &&
        !("setPlace" in e && e.setPlace.clearBlight && (!targetPlace || def.kind === "contain"))), operationScope(s, ctx, op));
      if (cellClear && def.kind !== "contain") {
        const blight = blightAt(s, ctx, op.target.loc);
        if (blight && blight.depth !== "core") removePatch(s, ctx, blight.patch);
      }
      if (def.kind === "contain") for (const id of op.containedPlaces ?? []) {
        const patch = s.patches[id];
        if (patch && patch.rift === op.target.rift && s.rifts[patch.rift]?.patches[0] !== id) removePatch(s, ctx, id);
      }
      if (def.covert && op.exposed && op.target.faction) {
        const r = relation(s, op.actor, op.target.faction);
        if (r) for (const t of r.treaties) if (ctx.world.require("treaty", t.def).kind === "nonaggression") breakTreaty(s, ctx, r, t, op.actor);
      }
      if (!op.log.some(e => e.kind === "proxy-accounted")) operationDiplomacy(s, ctx, op);
      if (op.reliefOf && s.operations[op.reliefOf] && activeOperation(s.operations[op.reliefOf]!)) endOperation(s, ctx, s.operations[op.reliefOf]!, "failed");
      s.factions[op.actor]!.prestige = (s.factions[op.actor]!.prestige ?? 0) + 1;
      onOperationSuccess(s, ctx, op); setPhase(s, ctx, op, "aftermath");
    } else if (op.phase === "aftermath" && s.clock.day >= op.phaseEnd) endOperation(s, ctx, op, "done");
  }
}
