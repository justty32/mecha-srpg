import type { CampaignEvent, CampaignState } from "../state/types.ts";

export type WarMetrics = {
  initialPower: number; minPowerRatio: number; maxOperations: number; maxDays: number;
  maxWarRatio: number; maxAlliedRatio: number; maxWarStreakDays: number;
  minMajorStates: number; days: number; errors: string[];
  operations: number; war: number; allied: number; released: number; joins: number;
};
const terminal = new Set(["done", "failed", "aborted"]);
const major = new Set(["state", "city", "company", "cult", "guild"]);
function power(s: CampaignState): number {
  return Object.values(s.factions).reduce((n, f) => n + (f.forces?.units ?? []).reduce((sum, u) => sum + u.count * u.readiness, 0), 0);
}
export function initialWarMetrics(s: CampaignState): WarMetrics {
  return { initialPower: power(s), minPowerRatio: 1, maxOperations: 0, maxDays: 0, maxWarRatio: 0, maxAlliedRatio: 0,
    maxWarStreakDays: 0, minMajorStates: 6, days: 0, errors: [], operations: 0, war: 0, allied: 0, released: 0, joins: 0 };
}
export function updateWarMetrics(previous: WarMetrics, s: CampaignState): WarMetrics {
  const alive = Object.entries(s.factions).filter(([, f]) => f.alive).map(([id]) => id);
  const pairs = alive.length * (alive.length - 1) / 2;
  const rels = Object.values(s.relations ?? {}).filter(r => s.factions[r.a]?.alive && s.factions[r.b]?.alive);
  const war = rels.filter(r => r.state === "war").length;
  const allied = rels.filter(r => r.state === "allied").length;
  const majorStates = new Set(rels.filter(r => major.has(s.factions[r.a]!.scaleNow) && major.has(s.factions[r.b]!.scaleNow)).map(r => r.state)).size;
  const ops = Object.values(s.operations ?? {});
  const operations = ops.filter(o => !terminal.has(o.phase)).length;
  const maxDays = ops.reduce((n, o) => Math.max(n, (terminal.has(o.phase) ? o.phaseEnd : s.clock.day) - o.startDay), previous.maxDays);
  const maxWarStreakDays = rels.filter(r => r.state === "war").reduce((n, r) => Math.max(n, s.clock.day - r.since), previous.maxWarStreakDays);
  const ratio = previous.initialPower > 0 ? power(s) / previous.initialPower : 1;
  const errors = [...previous.errors];
  const add = (condition: boolean, message: string) => { if (condition && !errors.includes(message)) errors.push(message); };
  add(war > pairs * .3, "war ratio > 30%");
  add(allied > pairs * .4, "allied ratio > 40%");
  add(majorStates < 3, "major states < 3");
  add(maxWarStreakDays > 6 * 28, "war streak > 6 months");
  add(ratio < .3, "world power < 30%");
  add(operations > 15, "operations > 15");
  add(maxDays > 45, "operation > 45 days");
  return { ...previous, days: previous.days + 1, minPowerRatio: Math.min(previous.minPowerRatio, ratio),
    maxOperations: Math.max(previous.maxOperations, operations), maxDays, maxWarStreakDays,
    maxWarRatio: Math.max(previous.maxWarRatio, pairs ? war / pairs : 0),
    maxAlliedRatio: Math.max(previous.maxAlliedRatio, pairs ? allied / pairs : 0),
    minMajorStates: Math.min(previous.minMajorStates, majorStates), errors,
    operations, war, allied, released: Object.values(s.models ?? {}).filter(m => m.releasedDay !== undefined).length,
    joins: s.log.filter(e => e.type === "ContractAccepted" && e.payload.kind === "join").length };
}
export function warStatistics(m: WarMetrics, events: readonly CampaignEvent[]) {
  return { enteredWar: events.filter(e => e.type === "RelationChanged" && e.payload.to === "war").length,
    ceasefires: events.filter(e => e.type === "TreatySigned" && e.payload.kind === "ceasefire").length,
    PlaceTransferred: events.filter(e => e.type === "PlaceTransferred").length,
    OperationResolved: events.filter(e => e.type === "OperationResolved").length,
    maxOperations: m.maxOperations, maxDays: m.maxDays, maxWarRatio: m.maxWarRatio, maxAlliedRatio: m.maxAlliedRatio,
    maxWarStreakDays: m.maxWarStreakDays, minMajorStates: m.minMajorStates, minPowerRatio: m.minPowerRatio, errors: m.errors };
}
