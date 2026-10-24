import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs, loadPacks, readPackDir } from "./loader.ts";
import type { PackFiles } from "./loader.ts";
import { validateAgainst } from "./schema.ts";

function pack(files: Record<string, unknown>, id = "test", depends: string[] = []): PackFiles {
  return { root: id, files: { "pack.json": { id, version: "0.1.0", depends }, ...files } };
}

function ability() {
  return {
    id: "ability/strike", name: "打擊", mode: "activated", costs: [], produces: [], require: [],
    target: { kind: "unit", range: { min: 1, max: 1 }, los: true, friendly: "no" },
    packets: [], effects: [], tags: [], ai: { tactics: { attack: 1 } },
  };
}

const tactics = { kind: "tactics", entries: [{ id: "attack", name: "攻擊" }] };
const base = loadContentDirs(["content/base"]);

test("base 內容包載入零錯誤", () => {
  assert.deepEqual(base.errors, []);
});

test("指定內容種類件數不低於地基範例", () => {
  // 內容包會長大（content 線起），只驗下限，不寫死等號。
  const counts = base.db.counts();
  assert.ok(counts.frame >= 2);
  assert.ok(counts.component >= 1);
  assert.ok(counts.person >= 2);
  assert.ok(counts.terrain >= 1);
  assert.ok(counts.species >= 1);
});

test("DB 定義內的參照補上 pack 前綴", () => {
  assert.equal(base.db.require("frame", "base:frame/hound-mk2").bodyPlan, "base:bodyplan/biped-light");
});

test("懸空內容參照回報欄位路徑", () => {
  const result = loadPacks([pack({ "frames/trial.json": {
    id: "frame/trial", name: "試作", cls: "mechanical", grade: "C", bodyPlan: "bodyplan/missing",
    baseAttrs: {}, pools: [], innateAbilities: [], repairPolicy: "repair-or-replace", tags: [],
  } })]);
  assert.deepEqual(result.errors.map(({ path, message }) => ({ path, message })), [
    { path: "$.bodyPlan", message: "missing reference test:bodyplan/missing" },
  ]);
});

test("未登記的層種類回報錯誤", () => {
  const result = loadPacks([pack({ "bodyplans/trial.json": {
    id: "bodyplan/trial", parts: [{ id: "core", name: "核心", exposure: 1,
      layers: [{ type: "unknown-layer", hp: 10, ablative: true, resist: {}, passThrough: {}, structural: true }],
      slots: [], functions: [], onLayerBroken: {}, onBroken: [], conduct: [],
    }],
  } })]);
  assert.deepEqual(result.errors.map(({ path, message }) => ({ path, message })), [
    { path: "$.parts[0].layers[0].type", message: "unregistered layer-types: unknown-layer" },
  ]);
});

test("檔名與 id 不一致時拒絕載入", () => {
  const result = loadPacks([pack({ "curves/trial.json": { id: "curve/other", name: "曲線", points: [0] } })]);
  assert.deepEqual(result.errors.map(({ path, message }) => ({ path, message })), [
    { path: "$.id", message: "id kind or name differs from file path" },
  ]);
});

test("內容 NumExpr 不得引用 rng 根", () => {
  const result = loadPacks([pack({
    "registries/tactics.json": tactics,
    "abilities/strike.json": { ...ability(), accuracy: { ref: "rng.next" } },
  })]);
  assert.deepEqual(result.errors.map(({ path, message }) => ({ path, message })), [
    { path: "$.accuracy.ref", message: "invalid NumExpr root: rng.next" },
  ]);
});

test("能力成本不得引用未宣告的池", () => {
  const result = loadPacks([pack({
    "registries/tactics.json": tactics,
    "abilities/strike.json": { ...ability(), costs: [{ pool: "missing-pool", owner: "mech", amount: 1 }] },
  })]);
  assert.deepEqual(result.errors.map(({ path, message }) => ({ path, message })), [
    { path: "$.costs[0].pool", message: "undeclared pool missing-pool" },
  ]);
});

test("依賴後載入的 pack 覆寫同 id，並產生警告", () => {
  const result = loadPacks([
    pack({ "curves/trial.json": { id: "base:curve/trial", name: "新版", points: [0, 20] } }, "mod", ["base"]),
    pack({ "curves/trial.json": { id: "curve/trial", name: "原版", points: [0, 10] } }, "base"),
  ]);
  assert.deepEqual(result.errors, []);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0]!.message, "overrides base:curve/trial");
  assert.equal(result.db.require("curve", "base:curve/trial").name, "新版");
});

test("schema 同時抓到缺必填欄與多餘欄", () => {
  const errors = validateAgainst("curve", { id: "curve/trial", points: [0], extra: true });
  assert.deepEqual(errors, [
    { path: "$.name", message: "required property missing" },
    { path: "$.extra", message: "additional property not allowed" },
  ]);
});

// 個體覆寫用完整 base 作合法對照，再每次只破壞一條規則。
function monsterPack() {
  const files = readPackDir("content/base");
  const species = base.db.require("species", "species/hound");
  const body = base.db.require("bodyplan", species.bodyPlan);
  const monster = { id: "monster/loader-test", species: species.id, grade: "C", tags: [],
    partsOverride: body.parts.map(part => ({ id: part.id, layers: structuredClone(part.layers), functions: [...part.functions] })) };
  files.files["monsters/loader-test.json"] = monster;
  return { files, monster };
}
for (const [name, mutate, message] of [
  ["部位 id 不存在", (m: ReturnType<typeof monsterPack>["monster"]) => { m.partsOverride[0]!.id = "missing"; }, "unknown monster part"],
  ["最內層不是結構層", (m: ReturnType<typeof monsterPack>["monster"]) => { m.partsOverride[0]!.layers.at(-1)!.structural = false; }, "last monster layer must be structural"],
  ["沒有核心", (m: ReturnType<typeof monsterPack>["monster"]) => { for (const p of m.partsOverride) p.functions = p.functions.filter(f => f !== "core"); }, "monster requires a core part"],
  ["捕捉後層數不符", (m: ReturnType<typeof monsterPack>["monster"]) => { m.partsOverride[0]!.layers.shift(); }, "capture layer count differs"],
] as const) test(`MonsterDef 載入檢查：${name}`, () => {
  const { files, monster } = monsterPack();
  assert.deepEqual(loadPacks([files]).errors, []);
  mutate(monster);
  assert.ok(loadPacks([files]).errors.some(e => e.message.includes(message)));
});
test("soulGrade 只允許機魂，合法機魂通過、人類拒絕", () => {
  const files = readPackDir("content/base");
  const soul = Object.values(files.files).find(v => typeof v === "object" && v !== null && "kind" in v && v.kind === "soul") as Record<string, unknown>;
  soul.soulGrade = "S";
  assert.deepEqual(loadPacks([files]).errors, []);
  const human = Object.values(files.files).find(v => typeof v === "object" && v !== null && "kind" in v && v.kind === "human") as Record<string, unknown>;
  human.soulGrade = "C";
  assert.ok(loadPacks([files]).errors.some(e => e.message === "soulGrade only allowed on souls"));
});
test("MonsterDef 捕捉 HP 上限不同只警告", () => {
  const { files, monster } = monsterPack();
  monster.partsOverride[0]!.layers[0]!.hp += 10;
  const result = loadPacks([files]);
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some(e => e.message.includes("capture layer HP differs")));
});
test("MonsterDef 捕捉 HP 不同的警告每隻怪獸只一條、列出全部部位", () => {
  const { files, monster } = monsterPack();
  for (const part of monster.partsOverride) part.layers[0]!.hp += 10;
  const warnings = loadPacks([files]).warnings.filter(e => e.file.includes("loader-test") && e.message.includes("capture layer HP differs"));
  assert.equal(warnings.length, 1);
  for (const part of monster.partsOverride) assert.ok(warnings[0]!.message.includes(part.id!), part.id);
});
