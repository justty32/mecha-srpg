import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createEnv } from "./tool.ts";
import { createBattleHub, createBattleTools } from "./battle.ts";
import { BattleView } from "./battle-view.ts";

const env = createEnv();
function harness() {
  const hub = createBattleHub(env), tools = createBattleTools(env, hub);
  const call = async (name: string, args: Record<string, unknown>) => {
    const result = await tools.find(t => t.name === name)!.handler(args);
    return { text: result.content.filter(c => c.type === "text").map(c => c.text)[0]!, data: result.structuredContent as any };
  };
  const start = async (scenario: string) => {
    // autoAdvance：AI 推進到第一次輪到玩家，測試不依賴情境的先攻順序。
    const result = await call("battle_new", { scenario: `scenario/${scenario}`, seed: 1 });
    return { ...result, id: result.data.id as string, battle: hub.get(result.data.id) };
  };
  return { hub, call, start };
}

test("三情境的執行期目標：hold 區域與進度、killTarget 剩餘、escort 對象與出口", async () => {
  const h = harness(), hold = await h.start("glade-spore-hold");
  assert.match(hold.text, /守住區域 x14–17,y15–18（16 格）連續 8 輪/u);
  const s = hold.battle.session.state, objective = s.rt!.objectives.find(o => o.kind === "hold")!;
  s.rt!.holdProgress = { [JSON.stringify(objective)]: { round: 3, count: 3 } };
  const observed = await h.call("battle_observe", { id: hold.id });
  const info = observed.data.objectives.find((o: any) => o.kind === "hold");
  assert.deepEqual({ current: info.progress.current, required: info.progress.required, cells: info.progress.zone.length }, { current: 3, required: 8, cells: 16 });
  assert.match(observed.text, /目前 3／8/u);
  // 目標行在單位列表之前（單位行以「slot-序號 」開頭）。
  assert.ok(observed.text.indexOf("我方勝") >= 0 && observed.text.indexOf("我方勝") < observed.text.search(/^[a-z]+-\d+ /mu));

  const kill = await h.start("waste-encirclement"), ks = kill.battle.session.state;
  const ko = kill.data.objectives.find((o: any) => o.kind === "killTarget");
  assert.equal(ko.progress.remaining, 3); assert.equal(ko.progress.total, 3);
  assert.deepEqual(ko.progress.targets.map((t: any) => t.id), ["enemy-0", "enemy-1", "enemy-2"]);
  ks.rt!.unitStatus["enemy-0"] = "dead";
  assert.match((await h.call("battle_observe", { id: kill.id })).text, /剩 2／3/u);
  const convoy = await h.start("convoy-run"), escort = convoy.data.objectives.find((o: any) => o.kind === "escort");
  assert.deepEqual(escort.progress.targets.map((t: any) => t.id), ["convoy-0", "convoy-1"]);
  assert.deepEqual(escort.progress.exits, convoy.battle.session.state.rt!.exits);
  assert.match(convoy.text, /護送.*convoy-0.*convoy-1.*出口 18 格/u);
});

test("盟軍永遠可見；失聯敵方即使 knowledge 移除仍保留快照，目標不洩漏位置", async () => {
  const { start } = harness(), { battle } = await start("waste-encirclement"), { session: s, view } = battle;
  const state = s.state, k = state.knowledge.player!, enemy = state.units["enemy-0"]!, ally = state.units["ally-0"]!;
  k.visible = [enemy.id]; k.lastSeen[enemy.id] = { cell: { ...enemy.pos }, round: state.round };
  view.capture();
  const old = view.units("full").find(u => u.id === enemy.id)!;
  k.visible = []; delete k.lastSeen[enemy.id];
  enemy.pos = { x: 63, y: 39 }; enemy.parts[Object.keys(enemy.parts)[0]!]!.layers[0]!.hp = 0;
  state.rt!.unitStatus[enemy.id] = "dead";
  ally.pos = { x: 0, y: 0 };
  const units = view.units("full"), stale = units.find(u => u.id === enemy.id)!;
  assert.equal(stale.stale, true); assert.deepEqual(stale.pos, old.pos); assert.equal(stale.hpPercent, old.hpPercent);
  assert.match(stale.summary, /最後所見第 1 輪/u);
  assert.deepEqual(units.find(u => u.id === ally.id)!.pos, ally.pos);
  assert.equal(units.find(u => u.id === ally.id)!.stale, false);
  const target = (view.objectives().find(o => o.kind === "killTarget")!.progress.targets as any[]).find(t => t.id === enemy.id);
  assert.deepEqual(target.pos, old.pos); assert.equal(target.stale, true);
  // 在未曾取得目標快照的視圖中，真實存在但遠在視野外的敵人位置必須是 null。
  k.lastSeen = {}; state.log.events = [];
  state.rt!.unitStatus[enemy.id] = "active";
  const unseen = new BattleView(s, "player", false);
  const unknown = unseen.objectives().find(o => o.kind === "killTarget")!;
  assert.match(unknown.text, /位置未知/u);
  assert.equal((unknown.progress.targets as any[]).find(t => t.id === enemy.id).pos, null);
});

test("ASCII 單位與地形符號不相交，出口穿透迷霧，地形與全域效果有現況", async () => {
  const h = harness(), glade = await h.start("glade-spore-hold"), { view, session } = glade.battle;
  const map = view.map(), unitChars = new Set(map.legend.flatMap(u => [...u.glyph]));
  assert.ok(unitChars.size); assert.ok(map.terrainLegend.length);
  for (const t of map.terrainLegend) for (const glyph of t.glyph) assert.equal(unitChars.has(glyph), false, `${t.name} 不得與單位同符號`);
  assert.match(map.key, /掩蔽 \d+；移動成本/u);
  assert.ok(map.terrainLegend.some(t => t.effects.some(e => /（.*）/u.test(e))));
  assert.match(glade.text, /全域效果：光照 0.6/u);
  const convoy = await h.start("convoy-run"), exit = convoy.battle.session.state.rt!.exits[0]!;
  const exitMap = convoy.battle.view.map({ x: 75, y: 0, w: 5, h: 20 });
  assert.ok(Object.values(convoy.battle.session.state.units).filter(u => u.owner === "player")
    .every(u => convoy.battle.session.rulesQuery.distance(u.pos, exit) > convoy.battle.session.rulesQuery.perception(convoy.battle.session.state, u.id)));
  assert.equal(exitMap.ascii.split("\n")[exit.y - exitMap.window.y + 1]![5 + (exit.x - exitMap.window.x) * exitMap.cellWidth], ">");
  assert.ok(exitMap.ascii.includes("?"));
  // 窄窗口尾端的 15 不得只剩 1。
  const narrow = view.map({ x: 0, y: 0, w: 16, h: 1 }).ascii.split("\n")[0]!;
  assert.ok(narrow.includes("10")); assert.equal(narrow.trimEnd().endsWith("1"), false);
  assert.equal(session.state.map.width, 32);
});

test("nearestEnemy 只選敵對，非當前敵方不洩漏能力；conventional-arms 對蟲的估算 ×0.1", async () => {
  const h = harness(), { id, battle } = await h.start("glade-spore-hold"), s = battle.session, state = s.state;
  // 輪到持有 conventional-arms 能力的我方機為止（情境換機後先攻順序可能不同）。
  const conventional = (unit: string) => s.rulesQuery.abilitiesOf(state, unit).some(a => s.rulesQuery.abilityDef(a).tags.includes("conventional-arms"));
  for (let i = 0; i < 8 && !conventional(s.currentActor()!); i++) await h.call("battle_act", { id, action: { kind: "end" } });
  const actor = s.currentActor()!;
  assert.ok(conventional(actor));
  const u = state.units[actor]!, enemy = state.units["enemy-0"]!;
  // 固定射線與敵方距離，避免此測試依賴地形遮蔽或命中 RNG。
  const plain = env.battleDb().all("terrain").find(t => !t.blocksLos && t.moveCost.leg === 1)!;
  state.map.terrain.fill(plain.id);
  enemy.pos = { x: u.pos.x - 2, y: u.pos.y };
  state.knowledge.player!.visible = [enemy.id]; battle.view.capture();
  const before = s.hash(), legal = await h.call("battle_legal_actions", { id });
  assert.ok(legal.data.playerTurn); assert.equal(legal.data.nearestEnemy.id, enemy.id);
  assert.ok(s.rulesQuery.hostile(state, actor, legal.data.nearestEnemy.id));
  assert.ok(!legal.data.abilities.some((a: any) => a.reason?.includes("最近敵方 ally")));
  const ability = legal.data.abilities.find((a: any) => s.rulesQuery.abilityDef(a.id).tags.includes("conventional-arms"));
  assert.ok(ability);
  const target = ability.targets.find((t: any) => t.target.unit === enemy.id); assert.ok(target);
  const base = s.rulesQuery.abilityDef(ability.id).packets.reduce((n, p) => n + s.rulesQuery.evalNum(state, p.amount, actor, enemy.id), 0);
  assert.ok(Math.abs(target.damageIfHit - base * 0.1) < 0.051); assert.equal(target.damageIfHit, 0.8);
  assert.match(legal.text, /命中 [\d.]+%／約 0.8/u); assert.match(legal.text, /eject（不可逆）/u);
  assert.equal(s.hash(), before);
  const other = await h.call("battle_legal_actions", { id, unit: enemy.id });
  assert.equal(other.data.playerTurn, false); assert.equal(other.data.nearestEnemy, null); assert.deepEqual(other.data.abilities, []);
  const ally = await h.call("battle_legal_actions", { id, unit: "ally-0" }); assert.equal(ally.data.playerTurn, false);
});

test("顯示小數不改 state；事件／單位中文與工具錯誤、游標", async () => {
  const h = harness(), { id, battle } = await h.start("glade-spore-hold"), s = battle.session, state = s.state, actor = s.currentActor()!, unit = state.units[actor]!;
  const part = Object.keys(unit.parts)[0]!, layer = unit.parts[part]!.layers[0]!;
  layer.hp = 7.200000000000003;
  const commander = s.rulesQuery.commanderOf(state, actor)!;
  state.persons[commander]!.pools.ap!.cur = 7.200000000000003;
  battle.view.track(() => {
    state.log.events.push({ seq: state.log.events.length, round: state.round, type: "LayerDamaged", payload: { unit: actor, part, amount: 7.200000000000003 } });
    state.log.events.push({ seq: state.log.events.length, round: state.round, type: "Hit", payload: { unit: actor, target: actor, ability: "ability/mx-head-vulcan", chance: 24.333333333 } });
    state.log.events.push({ seq: state.log.events.length, round: state.round, type: "EffectApplied", payload: { owner: actor, effect: "effect/rooted" } });
  });
  const observed = await h.call("battle_observe", { id, detail: "full" }), own = observed.data.units.find((u: any) => u.id === actor);
  assert.equal(own.parts[0].layers[0].hp, 7.2); assert.equal(layer.hp, 7.200000000000003);
  assert.ok(!observed.text.includes("000000000"));
  const events = await h.call("battle_events", { id });
  assert.match(events.text, /7.2 點傷害/u); assert.match(events.text, /命中 24.3%/u); assert.match(events.text, /根系纏縛/u);
  assert.equal((await h.call("battle_events", { id, since: 99999 })).data.next, 99999);
  await assert.rejects(h.call("battle_load", { save: "garbage" }), /存檔不是合法 JSON/u);
  await assert.rejects(h.call("battle_new", { scenario: "scenario/glade-spore-hold", playerSlot: "missing" }), /可選 slot：ally、enemy、player/u);
  await assert.rejects(h.call("battle_act", { id, action: { kind: "move", to: { x: 999, y: 999 } } }), /不可達/u);
  // 把盟軍放到行動者身旁的可走格，再移動過去：應回「目標格被佔」而非不可達。
  const plainCell = env.battleDb().all("terrain").find(t => !t.blocksLos && t.moveCost.leg === 1)!;
  const beside = { x: unit.pos.x + (unit.pos.x + 1 < state.map.width ? 1 : -1), y: unit.pos.y };
  state.map.terrain[beside.y * state.map.width + beside.x] = plainCell.id;
  for (const other of Object.values(state.units)) if (other.id !== "ally-0" && other.pos.x === beside.x && other.pos.y === beside.y) other.pos = { x: 0, y: 0 };
  state.units["ally-0"]!.pos = { ...beside };
  await assert.rejects(h.call("battle_act", { id, action: { kind: "move", to: beside } }), /目標格被佔/u);
  const legal = await h.call("battle_legal_actions", { id }), [x, y] = legal.data.moves[0].split(":")[0].split(",").map(Number);
  state.persons[commander]!.pools.ap!.cur = 0;
  const hash = s.hash();
  await assert.rejects(h.call("battle_act", { id, action: { kind: "move", to: { x, y } } }), /ap 不足/u);
  assert.equal(state.persons[commander]!.pools.ap!.cur, 0); assert.equal(s.hash(), hash);
  state.rt!.unitStatus[actor] = "dead";
  assert.match(battle.view.units("brief").find(u => u.id === actor)!.summary, /機體損毀/u);
});

test("cli call／list 的靜態相依只含 node，serve 才載入遊戲", () => {
  const source = readFileSync(resolve(import.meta.dirname, "cli.ts"), "utf8");
  const imports = [...source.matchAll(/^import\s+(?!type\b).*?from\s+["']([^"']+)["']/gmu)].map(m => m[1]!);
  assert.ok(imports.length > 0); assert.ok(imports.every(id => id.startsWith("node:")));
  assert.match(source, /await import\("\.\/server\.ts"\)/u);
});
