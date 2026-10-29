import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "./loader.ts";
import { validateAgainst } from "./schema.ts";
const { db } = loadContentDirs(["content/base"]);

test("spread schema擋超量/零主片/過多片，合法份額可過", () => {
  const ability = structuredClone(db.require("ability", "ability/mx-radiant-shot"));
  const variant = (fractions: number[]) => ({ ...ability, partPattern: { kind: "spread", fractions, selection: "adjacent" } });
  assert.deepEqual(validateAgainst("ability", variant([0.6, 0.25, 0.15])), []);
  for (const fractions of [[0.8, 0.4], [0, 0.5], [0.25, 0.25, 0.25, 0.25], [-0.1, 0.5]]) assert.ok(validateAgainst("ability", variant(fractions)).length > 0);
  assert.ok(validateAgainst("ability", { ...ability, partPattern: { kind: "penetrate", maxParts: 4, falloff: 0.5, selection: "adjacent" } }).length > 0);
  assert.ok(validateAgainst("ability", { ...ability, partPattern: { kind: "penetrate", maxParts: 2, falloff: 0, selection: "adjacent" } }).length > 0);
});

test("body圖拒未知部位/自連，單向真圖可過", () => {
  const body = structuredClone(db.require("bodyplan", "bodyplan/biped-standard"));
  assert.deepEqual(validateAgainst("bodyplan", { ...body, partAdjacency: { torso: ["head"] } }), []);
  for (const graph of [{ torso: ["torso"] }, { torso: ["missing"] }, { missing: ["torso"] }]) assert.ok(validateAgainst("bodyplan", { ...body, partAdjacency: graph }).length > 0);
});

test("species移動額度只擴真SpeciesDef，spawn species仍接受Id引用", () => {
  const species = structuredClone(db.require("species", "species/tidewolf"));
  assert.deepEqual(validateAgainst("species", { ...species, moveBudget: 6 }), []);
  assert.ok(validateAgainst("species", { ...species, moveBudget: -1 }).length > 0);
  const effect = structuredClone(db.require("effect", "effect/injury-sensor"));
  const spawn = { ...effect, hooks: { onApply: [{ do: "spawn", species: species.id, grade: "D", at: "adjacent" }] } };
  assert.deepEqual(validateAgainst("effect", spawn), []);
  assert.ok(validateAgainst("effect", { ...effect, hooks: { onApply: [{ do: "spawn", species: { id: species.id }, grade: "D", at: "adjacent" }] } }).length > 0);
});
