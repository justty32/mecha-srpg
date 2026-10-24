import test from "node:test";
import assert from "node:assert/strict";
import type { AbilityDef, ComponentDef, EffectDef, FrameDef, MonsterDef, PoolDecl, SpeciesDef } from "../core/types-def.ts";
import { loadPacks } from "./loader.ts";
import type { LoadResult, PackFiles } from "./loader.ts";
import { lintContent } from "./lint.ts";

function fixture() {
  const pool: PoolDecl = { id: "heat", name: "熱量", min: 0, max: 100, capKind: "hard", inverted: true,
    initial: 0, regen: 0, bands: [] };
  const ability: AbilityDef = {
    id: "ability/strike", name: "打擊", mode: "activated", costs: [{ owner: "mech", pool: "heat", amount: 1 }],
    produces: [], require: [], target: { kind: "unit", range: { min: 0, max: 1 }, los: true, friendly: "no" },
    packets: [{ type: "kinetic", amount: 10 }], effects: [], tags: [], ai: { tactics: { attack: 1 } },
  };
  const frame: FrameDef = { id: "frame/trial", name: "試作", cls: "mechanical", grade: "C",
    bodyPlan: "bodyplan/trial", baseAttrs: {}, pools: [pool], innateAbilities: [ability.id],
    repairPolicy: "repair-or-replace", tags: [] };
  const effect: EffectDef = { id: "effect/trial", name: "效果", scope: "mech", clock: { kind: "permanent" },
    stack: { policy: "refresh" }, contribs: [], hooks: {}, tags: [], ui: { badge: "試" } };
  const species: SpeciesDef = { id: "species/trial", name: "試獸", family: "trial", bodyPlan: frame.bodyPlan,
    gradeRange: ["C"], baseAttrsByGrade: { C: {} }, pools: [], abilities: [], tags: [],
    capture: { requireIntact: [], requireBroken: [], ability: ability.id, frame: frame.id }, aiProfile: "aiprofile/trial" };
  const monster: MonsterDef = { id: "monster/trial", species: species.id, grade: "C", tags: [] };
  const component: ComponentDef = { id: "component/trial", name: "部件", slot: "weapon", size: 1, mass: 1,
    origin: "mechanical", pools: [], abilities: [], tags: [] };
  const extra: Record<string, unknown> = {};
  return { ability, frame, effect, pool, species, monster, component, extra };
}
type Fixture = ReturnType<typeof fixture>;
function load(f: Fixture): LoadResult {
  const packs: PackFiles[] = [{ root: "memory", files: {
    "pack.json": { id: "test", version: "0.1.0", depends: [] },
    "registries/tactics.json": { kind: "tactics", entries: ["attack", "buff", "custom"].map(id => ({ id, name: id })) },
    "registries/damage-types.json": { kind: "damage-types", entries: [{ id: "kinetic", name: "動能" }] },
    "registries/slot-types.json": { kind: "slot-types", entries: [{ id: "weapon", name: "武器" }] },
    "registries/part-functions.json": { kind: "part-functions", entries: [{ id: "core", name: "核心" }] },
    "bodyplans/trial.json": { id: "bodyplan/trial", parts: [] },
    "abilities/strike.json": f.ability, "frames/trial.json": f.frame, "effects/trial.json": f.effect,
    "species/trial.json": f.species, "monsters/trial.json": f.monster, "components/trial.json": f.component,
    "aiprofiles/trial.json": { id: "aiprofile/trial", name: "AI", policy: "tactical", params: {} },
    ...f.extra,
  } }];
  const result = loadPacks(packs);
  assert.ok(result.errors.every(i => !i.ruleId)); // 一般載入路徑不執行 lint。
  lintContent(result.db, packs, result.errors, result.warnings);
  return result;
}

// 固定十類：壞輸入命中指定 id／分級，再確認修正後不命中；不以 schema 錯誤冒充 lint 證據。
function redGreen(id: string, severity: "errors" | "warnings", red: (f: Fixture) => void, green: (f: Fixture) => void): void {
  const f = fixture();
  red(f);
  const bad = load(f), hits = bad[severity].filter(i => i.ruleId === id);
  assert.ok(hits.length > 0, `${id} 應變紅：${JSON.stringify(bad.errors)}`);
  assert.ok(hits.every(i => i.file.startsWith("memory/") && i.path.startsWith("$")));
  // 負成本會同時命中數值錯誤與方向警告。
  assert.ok(bad.errors.every(i => i.ruleId === id || (id === "inverted-direction" && i.ruleId === "num-nonnegative")));
  if (severity === "warnings") assert.ok(!bad.errors.some(i => i.ruleId === id));
  green(f);
  const good = load(f);
  assert.deepEqual(good.errors, []);
  assert.deepEqual(good[severity].filter(i => i.ruleId === id), []);
}

test("num-packet-ratio：三個比例欄上下界與效果 hook packets", () => {
  for (const key of ["armorPen", "resistPen", "crit"] as const) for (const n of [-0.1, 1.1]) {
    redGreen("num-packet-ratio", "errors", f => { f.ability.packets[0]![key] = n; },
      f => { f.ability.packets[0]![key] = n < 0 ? 0 : 1; });
  }
  redGreen("num-packet-ratio", "errors", f => {
    f.effect.hooks.onTick = [{ do: "damage", target: "self", packets: [{ type: "kinetic", amount: 1, armorPen: 10 }] }];
  }, f => { f.effect.hooks.onTick = []; });
});

// 領導收尾 order 新增的 band-* 警告；仍以同一 loadPacks 紅綠驗證，不增加驗收指令。
test("band-armorpen：0.6 警告、0.5 合法、動態式跳過", () => {
  redGreen("band-armorpen", "warnings", f => { f.ability.packets[0]!.armorPen = 0.6; },
    f => { f.ability.packets[0]!.armorPen = 0.5; });
  const f = fixture(); f.ability.packets[0]!.armorPen = { sum: [0.6] };
  assert.deepEqual(load(f).warnings, []);
});

test("band-accuracy：±25 警告，±20 合法，動態式跳過", () => {
  for (const sign of [-1, 1]) redGreen("band-accuracy", "warnings", f => { f.ability.accuracy = sign * 25; },
    f => { f.ability.accuracy = sign * 20; });
  const f = fixture(); f.ability.accuracy = { sum: [25] };
  assert.deepEqual(load(f).warnings, []);
});

test("band-evasion：效果加值 23 警告，22 合法；非 add／動態值跳過", () => {
  redGreen("band-evasion", "warnings", f => {
    f.effect.contribs = [{ path: "self.attrs.evasion", op: "add", value: 23, source: f.effect.id }];
  }, f => { f.effect.contribs[0]!.value = 22; });
  for (const value of [23, { sum: [23] }]) {
    const f = fixture(); f.effect.contribs = [{ path: "self.attrs.evasion", op: typeof value === "number" ? "set" : "add", value, source: f.effect.id }];
    assert.deepEqual(load(f).warnings, []);
  }
});

function body(f: Fixture, hp: number, resist: number): void {
  f.extra["registries/layer-types.json"] = { kind: "layer-types", entries: [{ id: "armor", name: "裝甲" }] };
  f.extra["bodyplans/trial.json"] = { id: "bodyplan/trial", parts: [{ id: "core", name: "核心", exposure: 1,
    layers: [{ type: "armor", hp, resist: { kinetic: resist }, structural: true, ablative: true, passThrough: {} }],
    slots: [], functions: ["core"], onLayerBroken: {}, onBroken: [], conduct: [] }] };
}

test("band-resist：層抗性 0.85 警告，0.8 合法", () => {
  redGreen("band-resist", "warnings", f => body(f, 100, 0.85), f => body(f, 100, 0.8));
});

test("band-frame-hp：S 摹機基礎總層 HP 1201 警告，1200 合法", () => {
  redGreen("band-frame-hp", "warnings", f => { f.frame.grade = "S"; body(f, 1201, 0); },
    f => body(f, 1200, 0));
});

test("band-damage：單體 48／範圍 26，動態封包不求總和", () => {
  for (const kind of ["unit", "ball", "line", "cone"] as const) {
    const limit = kind === "unit" ? 48 : 26;
    redGreen("band-damage", "warnings", f => { f.ability.target.kind = kind; f.ability.packets[0]!.amount = limit + 1; },
      f => { f.ability.packets[0]!.amount = limit; });
  }
  const f = fixture(); f.ability.packets[0]!.amount = { sum: [100] };
  assert.deepEqual(load(f).warnings, []);
});

test("band-person-hp：人物 hp.max 71 警告，70 合法", () => {
  const set = (f: Fixture, max: number): void => {
    f.extra["curves/trial.json"] = { id: "curve/trial", name: "曲線", points: [0] };
    f.extra["persons/trial.json"] = { id: "person/trial", name: "人物", kind: "human", attrs: {}, traits: [], perks: [],
      pools: [{ ...f.pool, id: "hp", max, inverted: false }], will: { beliefs: [], burdenLimit: 0 },
      growth: { xpCurve: "curve/trial", levelDice: {}, perkPointsAt: [] }, tags: [] };
  };
  redGreen("band-person-hp", "warnings", f => set(f, 71), f => set(f, 70));
});

test("band-cover：地形 cover 51 警告，50 合法", () => {
  const set = (f: Fixture, cover: number): void => {
    f.extra["terrains/trial.json"] = { id: "terrain/trial", name: "地形", glyph: ".", color: "gray", moveCost: {},
      height: 0, cover, blocksLos: false, onEnter: [], onTurnStart: [], tags: [] };
  };
  redGreen("band-cover", "warnings", f => set(f, 51), f => set(f, 50));
});

test("num-accuracy：上下界", () => {
  for (const n of [-101, 101]) redGreen("num-accuracy", "errors", f => { f.ability.accuracy = n; },
    f => { f.ability.accuracy = n < 0 ? -100 : 100; });
});

test("num-range：負 min、負 max 與逆序，各自有合法界線", () => {
  for (const range of [{ min: -1, max: 1 }, { min: 0, max: -1 }, { min: 2, max: 1 }]) {
    redGreen("num-range", "errors", f => { f.ability.target.range = range; },
      f => { f.ability.target.range = { min: 0, max: 0 }; });
  }
});

test("num-nonnegative：cost、cooldown、usesPerBattle 不可負，零合法", () => {
  for (const key of ["cost", "cooldown", "usesPerBattle"] as const) {
    const set = (f: Fixture, n: number): void => {
      if (key === "cost") f.ability.costs[0]!.amount = n;
      else f.ability[key] = n;
    };
    redGreen("num-nonnegative", "errors", f => set(f, -1), f => set(f, 0));
  }
});

test("attack-cost：空成本攻擊錯誤，反應技／無傷害豁免；非字面 NumExpr 不求值", () => {
  for (const fix of [(f: Fixture) => { f.ability.mode = "reaction"; },
    (f: Fixture) => { f.ability.packets = []; },
    (f: Fixture) => { f.ability.costs = [{ owner: "mech", pool: "heat", amount: 1 }]; }]) {
    redGreen("attack-cost", "errors", f => { f.ability.costs = []; }, fix);
  }
  const f = fixture();
  f.ability.accuracy = { sum: [101] };
  f.ability.target.range = { min: { sum: [-1] }, max: { ref: "self.pools.heat.max" } };
  f.ability.cooldown = { product: [-1, 1] };
  f.ability.costs[0]!.amount = { sum: [-1] };
  f.ability.packets[0]!.armorPen = { sum: [10] };
  f.ability.packets[0]!.resistPen = { ref: "self.attrs.resolve" };
  f.ability.packets[0]!.crit = { product: [2, 2] };
  assert.deepEqual(load(f).errors, []);
});

test("inverted-direction：負成本與散熱正產出；正常發熱與非反向池不誤報", () => {
  redGreen("inverted-direction", "warnings", f => { f.ability.costs[0]!.amount = -1; },
    f => { f.ability.costs[0]!.amount = 1; });
  for (const byTag of [false, true]) redGreen("inverted-direction", "warnings", f => {
    if (byTag) f.ability.tags = ["heat-sink"];
    else f.ability.name = "排燼";
    f.ability.produces = [{ owner: "mech", pool: "heat", amount: 2 }];
  }, f => { f.ability.produces[0]!.amount = -2; });
  redGreen("inverted-direction", "warnings", f => {
    f.ability.name = "冷卻"; f.ability.produces = [{ owner: "mech", pool: "heat", amount: 1 }];
  }, f => { f.pool.inverted = false; });
  const f = fixture();
  f.ability.tags = ["conventional-arms"];
  f.ability.produces = [{ owner: "mech", pool: "heat", amount: 1 }];
  assert.deepEqual(load(f).warnings, []);
});

test("monster-person-effect：species／monster 專用能力，frame／component 共用豁免", () => {
  for (const source of ["species", "monster"] as const) for (const shared of ["frame", "component"] as const) {
    redGreen("monster-person-effect", "warnings", f => {
      f.frame.innateAbilities = [];
      if (source === "species") f.species.abilities = [f.ability.id];
      else f.monster.extraAbilities = [f.ability.id];
      f.effect.scope = "person";
      f.ability.effects = [{ on: "self", apply: [f.effect.id, { effect: f.effect.id }] }];
    }, f => {
      if (shared === "frame") f.frame.innateAbilities = [f.ability.id];
      else f.component.abilities = [f.ability.id];
    });
  }
});

test("ai-shape：模式、反應事件／tag、部位與 tactics；範圍／持續能力合法", () => {
  redGreen("ai-shape", "warnings", f => { f.ability.mode = "passive"; }, f => { f.ability.mode = "activated"; });
  redGreen("ai-shape", "warnings", f => {
    f.ability.mode = "reaction"; f.ability.trigger = { event: "unknown", oncePer: "action" }; f.ability.tags = ["melee"];
  }, f => { f.ability.trigger!.event = "enemyLeavesAdjacent"; f.ability.ai.tactics = {}; });
  redGreen("ai-shape", "warnings", f => {
    f.ability.mode = "reaction"; f.ability.trigger = { event: "enemyLeavesAdjacent", oncePer: "turn" };
  }, f => { f.ability.tags = ["melee"]; });
  redGreen("ai-shape", "warnings", f => { f.ability.target.kind = "part"; }, f => {
    f.ability.partAim = { allowed: true, penalty: 0 }; f.ability.ai.targetPref = { parts: ["core"] };
  });
  for (const tactics of [{}, { attack: 0 }, { custom: 1 }]) redGreen("ai-shape", "warnings",
    f => { f.ability.ai.tactics = tactics; }, f => { f.ability.ai.tactics = { attack: { sum: [1] } }; });
  for (const kind of ["self", "unit", "cell", "ball", "line", "cone"] as const) {
    const f = fixture(); f.ability.mode = "sustained"; f.ability.target.kind = kind;
    f.ability.target.friendly = "only"; f.ability.ai.tactics = { buff: 1 };
    assert.deepEqual(load(f).warnings, []);
  }
});

test("soft-overflow-band：空／只達 max 警告；max 以上及動態界線豁免", () => {
  for (const bounded of [false, true]) redGreen("soft-overflow-band", "warnings", f => {
    f.pool.capKind = "soft";
    f.pool.bands = bounded ? [{ from: 0, to: 100, effects: [] }] : [];
  }, f => { f.pool.bands.push({ from: 100, to: null, effects: [] }); });
  for (const to of [101, { ref: "self.pools.heat.max", mul: 2 }]) {
    const f = fixture(); f.pool.capKind = "soft"; f.pool.bands = [{ from: 0, to, effects: [] }];
    assert.deepEqual(load(f).warnings, []);
  }
});

test("mechanical-unarmed：無預設配裝又無內建攻擊才警告", () => {
  for (const fix of [(f: Fixture) => { f.frame.defaultLoadout = {}; },
    (f: Fixture) => { f.frame.innateAbilities = [f.ability.id]; },
    (f: Fixture) => { f.frame.cls = "ancient"; }]) {
    redGreen("mechanical-unarmed", "warnings", f => { f.frame.innateAbilities = []; }, fix);
  }
});
