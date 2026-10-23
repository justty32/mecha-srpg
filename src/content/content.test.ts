import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs, loadPacks } from "./loader.ts";
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
