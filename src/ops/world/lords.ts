import { cloneRng, createRng, nextInt } from "../../core/rng.ts";
import { GRADES } from "../../core/types-def.ts";
import type { Cell, Grade } from "../../core/types-def.ts";
import type { CalendarDef, CampaignState, LordScript, NamedLordState, OpsCtx, OpsEffect } from "../state/types.ts";
import { skyAt } from "../state/clock.ts";
import { allPlaces } from "./places.ts";
import { cellKey, footprintOf, gridOf, neighbors } from "./grid.ts";
import { blightPassable } from "./patches.ts";
import { rebuildBlightIndex } from "./blight.ts";
import { nextId } from "../state/ids.ts";
import { placeLoc } from "../war/loc.ts";

export function lordScripts(ctx: Pick<OpsCtx, "world">): LordScript[] {
  return ctx.world.all("action").flatMap(a => a.lordScript ? [a.lordScript] : []);
}
export function northwardCandidates(ctx: Pick<OpsCtx, "world">, script: LordScript, cal: CalendarDef, startDay = 0): number[] {
  const [lo, hi] = script.windowMonths;
  if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || lo < 0 || hi < lo || hi > 240) return [];
  const result: number[] = [];
  let prior = false;
  for (let day = startDay + 1; day < (hi + 1) * cal.daysPerMonth; day++) {
    const clock = skyAt(day, cal, ctx.world.all("omen")).clock;
    if (clock.month >= lo && clock.tide >= script.minTide && prior) result.push(day);
    if (clock.tide >= script.minTide) prior = true;
  }
  return result;
}
export function initNamedLords(s: CampaignState, ctx: OpsCtx, startId: string, seed: number): void {
  for (const script of lordScripts(ctx).filter(c => c.startIds.includes(startId))) {
    const candidates = northwardCandidates(ctx, script, ctx.world.require("calendar", s.calendar), s.clock.day);
    if (!candidates.length) throw new Error("empty named lord tide candidates");
    // 複製開局原始流；不消耗主、war 或 actor 流，也不在讀檔時重抽。
    const rng = cloneRng(createRng(seed));
    const day = candidates[nextInt(rng, candidates.length)]!;
    (s.namedLords ??= {})[script.lord] = { loc: structuredClone(script.route[0]!.loc), heading: "none", sinceDay: s.clock.day,
      status: "present", northwardDay: day, routeIndex: 0, moved: false, visited: [0], gate: "unseen", captured: false, battleFinished: false };
  }
}
export function lordTrace(s: CampaignState, ctx: Pick<OpsCtx, "world">): { lord: string; text: string; sinceDay: number; status: NamedLordState["status"] }[] {
  return lordScripts(ctx).flatMap(script => {
    const lord = s.namedLords?.[script.lord];
    return lord ? [{ lord: script.lord, text: script.trace[lord.status], sinceDay: lord.sinceDay, status: lord.status }] : [];
  });
}
function sameCells(a: Cell[], b: Cell[]): boolean {
  const keys = new Set(a.map(cellKey));
  return keys.size === a.length && a.length === b.length && b.every(c => keys.has(cellKey(c)));
}
/** SPEC-GAP：只由具名腳本授權的一區建立無核心永久淺蝕；正常裂縫不能持有這種 patch。 */
export function shiftBlight(s: CampaignState, ctx: OpsCtx, effect: Extract<OpsEffect, { blightShift: unknown }>["blightShift"]): boolean {
  const script = lordScripts(ctx).find(c => c.blight.area === effect.area);
  if (!script || effect.to !== "shallow") return false;
  const flag = `blightShift:${effect.area}`;
  if (s.flags[flag]) return true;
  if (!sameCells(effect.cells, script.blight.cells)) return false;
  const map = gridOf(ctx.world, script.blight.map);
  if (effect.cells.some(c => !blightPassable(map, c))) return false;
  const cities = new Set(allPlaces(s, ctx).filter(p => p.map === map.id && p.kind === "city").flatMap(p => footprintOf(p).map(cellKey)));
  const available = effect.cells.filter(c => !s.maps[map.id]!.blight[cellKey(c)] && !cities.has(cellKey(c)));
  const remaining = new Map(available.map(c => [cellKey(c), c])), chunks: Cell[][] = [];
  for (const cell of available) {
    if (!remaining.delete(cellKey(cell))) continue;
    const chunk = [cell];
    for (let i = 0; i < chunk.length; i++) for (const next of neighbors(map, chunk[i]!)) {
      if (remaining.delete(cellKey(next))) chunk.push(next);
    }
    chunks.push(chunk.sort((a, b) => a.y - b.y || a.x - b.x));
  }
  chunks.sort((a, b) => b.length - a.length || a[0]!.y - b[0]!.y || a[0]!.x - b[0]!.x);
  const cells = chunks[0] ?? [];
  s.flags[flag] = 1;
  if (!cells.length) { ctx.emit("WanchaoBlightSkipped", { area: effect.area, cells: 0 }); return true; }
  const id = `event:${effect.area}`;
  if (s.patches[id]) throw new Error(`event patch collision: ${id}`);
  s.patches[id] = { id, rift: "", map: map.id, cells: structuredClone(cells), sinceDay: s.clock.day, origin: "event", depthOverride: "shallow" };
  rebuildBlightIndex(s);
  ctx.emit("WanchaoBlightShift", { area: effect.area, patch: id, cells: cells.length });
  return true;
}
export function routeGrades(s: CampaignState, script: LordScript | undefined, loc: NamedLordState["loc"], grades: Grade[], sourceRift?: string): Grade[] {
  if (!script) return grades;
  const lord = s.namedLords?.[script.lord];
  if (sourceRift && lord?.northRift === sourceRift && lord.northBranch === "raised") return grades;
  if (!lord?.routeBoosts?.some(b => b.day === s.clock.day && b.map === loc.map && b.region === loc.region)) return grades;
  const top = Math.max(...grades.map(g => GRADES.indexOf(g))), cap = GRADES.indexOf(script.gradeCap);
  return GRADES.slice(0, Math.min(cap, top + script.routeDelta) + 1);
}
function traceChanged(s: CampaignState, ctx: OpsCtx, script: LordScript, lord: NamedLordState): void {
  ctx.emit("WanchaoTrace", { lord: script.lord, text: script.trace[lord.status] });
}
export function namedLordsDaily2(s: CampaignState, ctx: OpsCtx): void {
  for (const script of lordScripts(ctx)) {
    const lord = s.namedLords?.[script.lord]; if (!lord) continue;
    if (!lord.moved && s.clock.day === lord.northwardDay) {
      lord.routeBoosts = [];
      for (const [index, stop] of script.route.entries()) {
        lord.loc = structuredClone(stop.loc); lord.routeIndex = index;
        if (!lord.visited.includes(index)) lord.visited.push(index);
        lord.sinceDay = s.clock.day; lord.heading = "north";
        if (!lord.routeBoosts.some(b => b.map === stop.loc.map && b.region === stop.loc.region))
          lord.routeBoosts.push({ map: stop.loc.map, region: stop.loc.region, day: s.clock.day, delta: script.routeDelta });
        ctx.emit("WanchaoRoute", { lord: script.lord, index, loc: stop.loc });
      }
      const distance = (r: CampaignState["rifts"][string]) => Math.abs(r.at.cell.x - script.branchRiftAt.x) + Math.abs(r.at.cell.y - script.branchRiftAt.y);
      const rift = Object.values(s.rifts).filter(r => r.at.map === lord.loc.map && !["sealed", "receding", "closed"].includes(r.phase)
        && distance(r) <= script.branchRadius).sort((a, b) => distance(a) - distance(b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))[0];
      lord.northBranch = rift ? "raised" : "passed";
      if (rift) { rift.width = GRADES[Math.min(GRADES.indexOf(script.gradeCap), GRADES.indexOf(rift.width) + 1)]!; lord.northRift = rift.id; }
      if (!shiftBlight(s, ctx, script.blight)) throw new Error("invalid north coast blight shift");
      lord.moved = true; lord.status = "northward";
      traceChanged(s, ctx, script, lord);
      ctx.emit("WanchaoNorthward", { lord: script.lord, northBranch: lord.northBranch });
      for (const type of script.news) if (type !== "WanchaoSeventhNews" || s.patches[`event:${script.blight.area}`]) ctx.emit(type, { lord: script.lord });
      s.pendingContracts.push(...structuredClone(script.contracts));
    }
    if (lord.status === "northward" && s.clock.day > lord.northwardDay + script.observationDays) {
      lord.status = "gone"; lord.sinceDay = s.clock.day; traceChanged(s, ctx, script, lord);
      const scout = script.contracts[0]?.template;
      for (const c of Object.values(s.contracts)) if (c.template === scout && c.status === "offered") {
        c.status = "expired"; c.settled = true; ctx.emit("ContractExpired", { contract: c.id });
      }
    }
  }
}
export function inLordBay(s: CampaignState, script: LordScript): boolean {
  return s.ship.pos.map === script.gate.map && script.gate.allowedRegions.includes(s.ship.pos.region);
}
export function namedLordsDaily4(s: CampaignState, ctx: OpsCtx): void {
  if (s.pendingChoices.length || s.pendingBattle) return;
  for (const script of lordScripts(ctx)) {
    const lord = s.namedLords?.[script.lord]; if (!lord) continue;
    const gate = script.gate;
    if (lord.gate === "unseen" && (s.clock.month > gate.month || s.clock.month === gate.month && s.clock.dom > gate.dom)) lord.gate = "closed";
    if (lord.gate === "unseen" && s.clock.month === gate.month && s.clock.dom === gate.dom && s.flags[`omen:${gate.omen.split("/").at(-1)}`]) {
      if (!inLordBay(s, script)) { lord.gate = "closed"; continue; }
      lord.gate = "offered"; lord.gateDay = s.clock.day;
      s.pendingChoices.push({ text: gate.text, choices: structuredClone(gate.choices) });
      ctx.emit("WanchaoGateOffered", { lord: script.lord }); return;
    }
    if (!lord.moved || s.clock.day > lord.northwardDay + script.observationDays) continue;
    for (const [index, prompt] of script.routePrompts.entries()) {
      const flag = `lordPrompt:${script.lord}:${index}`;
      if (s.flags[flag] || s.ship.pos.map !== lord.loc.map || !prompt.regions.includes(s.ship.pos.region)) continue;
      if (index === 1 && !s.flags[`blightShift:${script.blight.area}`]) continue;
      s.flags[flag] = 1;
      s.pendingChoices.push({ text: prompt.text, choices: structuredClone(prompt.choices) }); return;
    }
  }
}
export function applyLordChoice(s: CampaignState, ctx: OpsCtx, input: Extract<OpsEffect, { lordChoice: unknown }>["lordChoice"]): boolean {
  const script = lordScripts(ctx).find(c => c.lord === input.lord), lord = s.namedLords?.[input.lord];
  if (!script || !lord) return false;
  if (input.choice === "inquire") {
    if (!lord.moved || !lord.northBranch) return false;
    ctx.emit(lord.northBranch === "raised" ? "WanchaoBranchRaised" : "WanchaoBranchPassed", { lord: script.lord }); return true;
  }
  if (lord.gate !== "offered" || lord.gateDay !== s.clock.day || s.clock.month !== script.gate.month || s.clock.dom !== script.gate.dom || !inLordBay(s, script) || s.pendingBattle || lord.battleFinished) return false;
  if (input.choice === "decline") {
    lord.gate = "closed"; lord.status = "gone"; lord.sinceDay = s.clock.day;
    ctx.emit("WanchaoGateDeclined", { lord: script.lord }); return true;
  }
  if (input.choice !== "accept") return false;
  const id = nextId(s, "sortie"); lord.gate = "accepted"; lord.gateSortie = id;
  s.pendingBattle = { id, day: s.clock.day, trigger: "defend", lordEncounter: { lord: script.lord, beat: "gate" },
    place: script.gate.place, loc: placeLoc(s, ctx, script.gate.place), units: [],
    supplies: { airstrikeTickets: 0, restraintRounds: 0, shipOverhead: false }, injected: [] };
  return true;
}
