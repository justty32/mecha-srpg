// 唯讀、固定 seed 的 AI 自護／支援基準；在 repo 根以 node 執行，stdout 只有 JSON。
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadContentDirs } from '../../../../../../src/content/loader.ts';
import { planProbe, probe } from '../../../../../../src/sim/probe.ts';
import { scenarioToSetup, runBattle } from '../../../../../../src/sim/run.ts';
import type { DynamicScenario, SimSetup } from '../../../../../../src/sim/run.ts';
import { createBattle, startBattle, currentActor, battleResult } from '../../../../../../src/rules/index.ts';
import { createFactionAI, startRound, runUnitTurn, observeEvents } from '../../../../../../src/ai/index.ts';
import { createRulesQuery, createRulesExec } from '../../../../../../src/ai/adapters/rules-adapter.ts';
import { hashLog } from '../../../../../../src/core/eventlog.ts';

const root = resolve(import.meta.dirname, '../../../../../..');
if (process.cwd() !== root) throw new Error(`請在 repo 根執行：${root}`);
const started = Date.now(), limit = 15 * 60 * 1000;
const guard = () => { if (Date.now() - started > limit) throw new Error('BLOCKED: 單次量測超過 15 分鐘'); };
const short = (id: string) => id.replace(/^base:/, '');
const raw = (folder: string) => readdirSync(`content/base/${folder}`).filter(f => f.endsWith('.json')).sort()
  .map(f => ({ path: `content/base/${folder}/${f}`, def: JSON.parse(readFileSync(`content/base/${folder}/${f}`, 'utf8')) }));
const abilities = raw('abilities'), frames = raw('frames'), components = raw('components'), species = raw('species'), monsters = raw('monsters');
const effects = new Map(raw('effects').map(x => [x.def.id, x.def]));
const changed: Record<string, string> = Object.fromEntries([
  'kx-lantern-keel-gather', 'kx-hinge-crab-shelter', 'kx-bell-borer-close', 'kx-shelf-back-shelter',
  'kx-reef-antler-brace', 'kx-drowned-grove-veil',
].map(id => [`ability/${id}`, 'protect']));
changed['ability/kx-hollow-sail-fold'] = 'escape';
changed['ability/kx-dusk-fold-withdraw'] = 'escape';
const effectDefs = (d: any): any[] => d.effects.flatMap((g: any) => g.apply.map((r: any) => effects.get(typeof r === 'string' ? r : r.effect)));
const inventory = abilities.filter(({ def: d }) => {
  const t = d.target, w = d.ai.tactics;
  const defensive = effectDefs(d).some(e => e.contribs.some((c: any) => c.path.endsWith('.evasion') && typeof c.value === 'number' && c.value > 0));
  const ally = t.kind !== 'self' && ['only', 'yes'].includes(t.friendly) && ['buff', 'protect', 'heal'].some(k => k in w);
  return t.kind === 'self' && (defensive || 'protect' in w || 'escape' in w) || ally || ['ability/kx-storm-mane-rise', 'ability/kx-shell-ear-hush'].includes(d.id);
}).map(({ path, def: d }) => {
  const componentIds = components.filter(c => c.def.abilities.includes(d.id)).map(c => c.def.id);
  const frameIds = frames.filter(f => f.def.innateAbilities.includes(d.id)
    || Object.values(f.def.defaultLoadout ?? {}).some(c => componentIds.includes(String(c)))).map(f => f.def.id);
  const monsterIds = monsters.filter(m => species.find(s => s.def.id === m.def.species)!.def.abilities.includes(d.id)
    || (m.def.extraAbilities ?? []).includes(d.id)).map(m => m.def.id);
  const selected = [...new Set([...monsterIds.slice(0, 1), ...frameIds.slice(0, 2)])];
  // 六台排燼持有者全量；其他能力至少兩個可用載體（若內容真的只有一個則明列）。
  if (d.id === 'ability/m2-relieve-ally') selected.splice(0, selected.length, ...frameIds);
  if (selected.length < 2) selected.push(...monsterIds.filter(id => !selected.includes(id)).slice(0, 2 - selected.length));
  return { id: d.id, name: d.name, path, tactics: d.ai.tactics,
    originalTactics: changed[d.id] ? { [changed[d.id]!]: 1 } : d.ai.tactics,
    originalSource: changed[d.id] ? 'kj2-plan/roster.json abilities（主分支首次入庫已是 buff）' : '目前分類；非八招改鍵',
    changedByKaiju2: !!changed[d.id], holders: { frames: frameIds, monsters: monsterIds, components: componentIds }, measuredCarriers: selected,
    effects: [...new Set(effectDefs(d).map(e => e.id))].map(id => {
      const e = effects.get(id); return { id, clock: e.clock, stack: e.stack, contribs: e.contribs, hooks: e.hooks };
    }) };
});
if (inventory.length > 40) throw new Error(`BLOCKED: 能力件數 gate ${inventory.length}>40`);
const { db, errors } = loadContentDirs(['content/base']);
if (errors.length) throw new Error(JSON.stringify(errors));
const seeds = [1, 2], rounds = 12;
const ids = inventory.map(a => a.id);

// 沿 runBattle 的公共 sim／AI／rules API 驅動，僅增加回合觀察；不修改 repo 或內容 DB。
function observed(sim: SimSetup, seed: number, injured = false) {
  guard();
  const state = createBattle(db, sim.setup, seed), q = createRulesQuery(db), exec = createRulesExec(db);
  if (injured) for (const part of Object.values(state.units['player-1']!.parts)) for (const l of part.layers) l.hp *= 0.5;
  const owned = q.abilitiesOf(state, 'player-0').map(short).filter(a => ids.includes(a));
  const ais = new Map(Object.keys(state.factions).sort().map(slot => [slot, createFactionAI({ slot, seed,
    ...sim.slotProfiles[slot], unitPolicies: sim.unitPolicies[slot] })]));
  const turns = new Set<number>(), uses: Record<string, number> = {}, firstRoundUses: Record<string, number> = {};
  let round = -1, steps = 0;
  startBattle({ db, s: state });
  while (!state.rt?.outcome) {
    guard();
    if (++steps > 10000) throw new Error('未結算：maxSteps');
    const actor = currentActor(state);
    if (actor === null) throw new Error('未結算：stalled');
    if (round !== state.round) { round = state.round; for (const ai of ais.values()) startRound(ai, q, state); }
    const slot = state.units[actor]!.owner, from = state.log.events.length, turnRound = state.round;
    const cmds = runUnitTurn(ais.get(slot)!, q, state, actor, exec);
    if (actor === 'player-0' && cmds.length) {
      turns.add(turnRound); // Wait 再入同一 round 不重算；死亡／停機而沒有成功指令不計。
      for (const c of cmds) if (c.kind === 'useAbility') {
        const id = short(c.ability); uses[id] = (uses[id] ?? 0) + 1;
        if (turnRound === 1) firstRoundUses[id] = (firstRoundUses[id] ?? 0) + 1;
      }
    }
    for (const [other, ai] of ais) if (other !== slot) observeEvents(ai, q, state, state.log.events.slice(from));
    if (!cmds.length && currentActor(state) === actor) throw new Error(`未結算：無指令 ${actor}`);
  }
  const result = battleResult({ db, s: state });
  if (!result) throw new Error('缺少戰果');
  return { seed, winner: result.winner, reason: result.reason, rounds: state.round, hash: hashLog(state.log),
    opportunities: Object.fromEntries(owned.map(id => [id, turns.size])), uses, firstRoundUses };
}
const scenarios: any[] = [];
function measure(name: string, carrier: string, scenario: DynamicScenario, injured = false) {
  const trials = seeds.map(seed => observed(scenarioToSetup(db, scenario, seed), seed, injured));
  const wins = trials.filter(t => t.winner === 'player').length;
  const draws = trials.filter(t => t.winner === null).length;
  scenarios.push({ name, carrier, seeds, roundsLimit: scenario.rounds, wins, losses: trials.length - wins - draws, draws,
    winRate: wins / trials.length, trials });
}
const carriers = [...new Set(inventory.flatMap(a => a.measuredCarriers))].sort();
for (const carrier of carriers) {
  const plan = planProbe(db, carrier, { rounds });
  for (const pairing of plan.pairings) measure(`probe:${carrier}:${pairing.name}`, carrier, pairing.scenario);
}

// 真實六台支援機 + 有 heat 的隊友；無改能力、權重或載體，僅在記憶體設定情境起始狀態。
const supportFrames = inventory.find(a => a.id === 'ability/m2-relieve-ally')!.measuredCarriers;
for (const carrier of supportFrames) for (const condition of ['heat-high', 'heat-low', 'wounded']) {
  const pairing = planProbe(db, carrier, { rounds: 4 }).pairings[0]!;
  const sc = structuredClone(pairing.scenario);
  sc.id = `scenario/ai-support-${condition}`;
  sc.mapDef = { id: sc.map, name: '支援對照平地', width: 16, height: 7, cells: '.'.repeat(112),
    legend: { '.': 'terrain/plain' }, deployZones: {}, exits: [] };
  sc.slots.player!.units[0]!.at = { x: 3, y: 3 };
  sc.slots.player!.units.push({ mech: 'frame/bulwark-i', at: { x: 4, y: 3 },
    persons: [{ id: 'person/chen-xiaohai', seat: 'pilot' }], pools: { heat: condition === 'heat-high' ? 110 : 0 } });
  sc.slots.enemy!.units[0]!.at = { x: 7, y: 3 };
  measure(`${condition}:${carrier}`, carrier, sc, condition === 'wounded');
}

// 對應必用 CLI（另於 shell 原樣執行）；重跑腳本直接用同一 probe API，不依賴子行程 stdout。
guard();
const probeArgs = ['run', 'content:probe', '--', ...supportFrames, '--n', '2', '--seed', '1', '--jobs', '2', '--rounds', '12', '--json', '-'];
const cli = await probe(db, supportFrames, { n: 2, seed: 1, jobs: 1, rounds: 12 });
if (cli.results.some((r: any) => r.pairings.some((p: any) => p.exceptions))) throw new Error('content:probe 有例外');
const probeCli = cli.results.map((r: any) => ({ id: r.id, pairings: r.pairings.map((p: any) => ({ name: p.name,
  n: p.n, wins: p.wins, losses: p.losses, draws: p.draws, winRate: p.winRate, protagonistAbilityUses: p.protagonistAbilityUses })) }));
guard();
const skirmishCommand = ['src/sim/measure.ts', 'scenario/skirmish-whitegloves', '1', '2', '3', '4', '5'];
// 與 src/sim/measure.ts 相同的統計口徑；該 CLI 另於 shell 原樣執行。
const skirmish = [1, 2, 3, 4, 5].map(seed => {
  guard();
  const sim = scenarioToSetup(db, 'scenario/skirmish-whitegloves', seed), run = runBattle({ db, sim, seed });
  const kinds: Record<string, number> = {}, ev: Record<string, number> = {};
  for (const c of run.commands) kinds[c.kind] = (kinds[c.kind] ?? 0) + 1;
  for (const e of run.state.log.events) ev[e.type] = (ev[e.type] ?? 0) + 1;
  const total = ev.TurnEnd ?? 0, waits = kinds.wait ?? 0;
  return { seed, waitRatio: +(waits / Math.max(1, total)).toFixed(3), waits, unitTurns: total,
    pass: waits / Math.max(1, total) < 0.5 || (run.result?.winner ?? null) !== null, kinds,
    winner: run.result?.winner ?? null, reason: run.result?.reason ?? run.stopped, rounds: run.state.round,
    roundsLimit: sim.setup.maxRounds ?? null, hits: ev.Hit ?? 0, misses: ev.Miss ?? 0, deaths: ev.UnitDied ?? 0, hash: run.hash };
});
guard();
const totals = inventory.map(a => ({ id: a.id, uses: scenarios.reduce((sum, s) => sum + s.trials.reduce((n: number, t: any) => n + (t.uses[a.id] ?? 0), 0), 0),
  opportunities: scenarios.reduce((sum, s) => sum + s.trials.reduce((n: number, t: any) => n + (t.opportunities[a.id] ?? 0), 0), 0) }));
console.log(JSON.stringify({ version: 1, seeds, rounds, inventory, totals, scenarios, probeCli,
  commands: { probe: ['npm', ...probeArgs], skirmish: ['node', ...skirmishCommand] }, skirmish,
  definitions: { uses: 'player-0 成功 UseAbility 指令數；排除 reaction、對手、隊友',
    opportunities: '初始持有該能力的 player-0 存活且成功行動的 distinct round；含 End/Wait，Wait 重入不重算；不代表能力可支付或已過 cooldown',
    sample: '自然 probe 每種可用載體至多三個；六台排燼載體全量；另有高燼／低燼／半血雙人場，僅在記憶體改起始狀態',
    profileCaveat: 'scenarioToSetup 只傳 species policy，未傳 species params；此基準忠實保留現行 sim 行為' } }, null, 2));
