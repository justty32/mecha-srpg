import { loadWorldDirs } from "../../../../../../../src/ops/content/load.ts";
import { runCampaign } from "../../../../../../../src/ops/sim/campaign.ts";
import { defaultBattleRunner } from "../../../../../../../src/ops/sim/battle.ts";
import type { BattleResult } from "../../../../../../../src/ops/sortie/apply.ts";
import type { CampaignState, Sortie } from "../../../../../../../src/ops/state/types.ts";

const args = process.argv.slice(2);
const sorties = args.includes("--sorties");
const contentAt = args.indexOf("--content");
if (contentAt >= 0 && !args[contentAt + 1]) throw new Error("--content needs DIR");
const content = contentAt >= 0 ? args[contentAt + 1]! : "content/base";
const seeds = args.filter((arg, index) => arg !== "--sorties" && arg !== "--content" && (contentAt < 0 || index !== contentAt + 1)).map(Number);
const { db, world, errors } = loadWorldDirs([content]);
if (errors.length) throw new Error(JSON.stringify(errors));

for (const seed of seeds.length ? seeds : [1, 2, 3, 4, 5]) {
  if (!Number.isSafeInteger(seed)) throw new Error(`invalid seed: ${seed}`);
  const sortieRows: Record<string, unknown>[] = [];
  const battle = (s: CampaignState, ctx: Parameters<typeof defaultBattleRunner>[1], sortie: Sortie) => {
    const contract = sortie.contract ? s.contracts[sortie.contract] : undefined;
    const template = contract ? world.get("contract", contract.template) : undefined;
    const ownIds = new Set(sortie.units.map(unit => unit.mech));
    const ownPersons = new Set(sortie.units.flatMap(unit => Object.values(unit.seats).filter((id): id is string => id !== null)));
    const frames = sortie.units.map(unit => ({ id: unit.mech, frame: s.mechs[unit.mech]?.frame ?? null }));
    const outcome = defaultBattleRunner(s, ctx, sortie);
    const result: BattleResult | undefined = outcome.result;
    if (result) {
      const events = result.events ?? [];
      const ownRetreated = result.units.filter(unit => ownIds.has(unit.id) && unit.status === "retreated").length;
      const endCategory = result.reason === "timeout" ? "round-limit" : result.winner === "player" ? "objective"
        : ownRetreated > 0 ? "retreat" : "annihilation";
      sortieRows.push({ type: "sortie", seed, day: sortie.day, contractKind: template?.kind ?? null,
        targetDepth: contract?.target.snapshot?.depth ?? null,
        targetPhase: contract?.target.snapshot?.phase ?? null,
        targetKind: contract?.target.snapshot?.phase === "opening" ? "eliminate"
          : template?.stages?.[contract?.stageIdx ?? 0]?.objectives[0]?.kind ?? template?.objectives[0]?.kind ?? null,
        mechs: frames, winner: result.winner, reason: result.reason, endCategory, rounds: result.rounds,
        ownMechsLost: result.units.filter(unit => ownIds.has(unit.id) && ["dead", "derelict-lost"].includes(unit.status)).length,
        ownPersonsDead: result.persons.filter(person => ownPersons.has(person.id) && person.status === "dead").length,
        enemiesKilled: result.units.filter(unit => !ownIds.has(unit.id) && unit.status === "dead").length,
        enemiesRemaining: result.units.filter(unit => !ownIds.has(unit.id) && unit.status !== "dead").length,
        remainingFrames: result.units.filter(unit => !ownIds.has(unit.id) && unit.status !== "dead").map(unit => unit.state.frame),
        ownRetreated,
        ownAbilityUses: events.filter(event => event.type === "AbilityUsed" && ownIds.has(String(event.payload.unit))).length,
        arcUses: events.filter(event => event.type === "AbilityUsed" && String(event.payload.ability).endsWith("ability/arc-pulse")).length,
        ownHits: events.filter(event => event.type === "Hit" && ownIds.has(String(event.payload.unit))).length });
    }
    return outcome;
  };
  const result = runCampaign({ db, world, start: "default", months: 12, seed, policy: "greedy", battle });
  const battles = result.state.log.filter(event => event.type === "BattleResolved");
  const outcome = (winner: unknown) => winner === "player" ? "win" : "loss";
  const first = battles[0];
  const month = (n: number) => {
    const row = result.summary.find(item => item.month === n);
    return row ? { persons: row.persons, cash: row.cash, debt: row.debt } : null;
  };
  if (sorties) for (const row of sortieRows) console.log(JSON.stringify(row));
  let cash = 0;
  const crossings = result.state.ledger.entries.filter(entry => entry.account === "cash").flatMap(entry => {
    const before = cash; cash += entry.delta;
    return before >= 0 && cash < 0 ? [{ day: entry.day, reason: entry.reason, delta: entry.delta, before, after: cash }] : [];
  });
  console.log(JSON.stringify({ seed,
    firstBattle: { result: first ? outcome(first.payload.winner) : "none", day: first?.day ?? null },
    wins: battles.filter(event => outcome(event.payload.winner) === "win").length,
    losses: battles.filter(event => outcome(event.payload.winner) === "loss").length,
    month3: month(3), month12: month(12),
    left: result.state.log.filter(event => event.type === "Left").length,
    died: result.state.log.filter(event => event.type === "Died").length,
    cashCrossings: crossings }));
}
