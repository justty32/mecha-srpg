import test from "node:test";
import assert from "node:assert/strict";
import { apparentAge } from "./age.ts";
import { loadContentDirs } from "../content/loader.ts";

test("apparentAge：年資、驅動時數、整年與四捨五入；無年齡與機魂回 null", () => {
  const growth = loadContentDirs(["content/base"]).db.rules.cockpit!.growth!;
  const def = { kind: "human" as const, age: 35, activeYears: 16 };
  assert.equal(apparentAge(def, {}, 0, growth), 23);
  assert.equal(apparentAge(def, { driveHours: growth.driveHoursPerYear }, growth.daysPerYear, growth), 23);
  assert.equal(apparentAge({ kind: "human", age: 40 }, {}, growth.daysPerYear - 1, growth), 40);
  assert.equal(apparentAge({ kind: "human", age: 40 }, {}, growth.daysPerYear, growth), 41);
  assert.equal(apparentAge({ kind: "human" }, {}, 0, growth), null);
  assert.equal(apparentAge({ kind: "soul", age: 40 }, {}, 0, growth), null);
});
