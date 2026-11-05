// playtest-1105 試玩回歸：效果顯示名、情境簡介文案、出生點不在封閉房間。
import test from "node:test";
import assert from "node:assert/strict";
import { loadContentDirs } from "../../src/content/loader.ts";
import type { Cell } from "../../src/core/types-def.ts";

const { db, errors } = loadContentDirs(["content/base"]);
assert.deepEqual(errors, []);

test("效果顯示名不是英文 id（士氣 shaken／breaking／fleeing 曾直接外露）", () => {
  for (const id of db.ids("effect")) {
    const effect = db.require("effect", id);
    assert.ok(!/^[a-z][a-z-]*$/u.test(effect.name), `${id} 的 name 是英文 id：${effect.name}`);
  }
  assert.equal(db.require("effect", "effect/morale-shaken").name, "動搖");
});

test("情境簡介：不夾英文原名或開發者用語，也沒有兩份一字不差", () => {
  const seen = new Map<string, string>();
  for (const id of db.ids("scenario")) {
    const brief = db.require("scenario", id).brief;
    if (!brief) continue;
    assert.ok(!/[A-Za-z]{3,}/u.test(brief), `${id} 簡介夾英文`);
    assert.ok(!/尚無.*規則|借機把|SPEC|TODO/u.test(brief), `${id} 簡介夾開發者用語`);
    assert.ok(!seen.has(brief), `${id} 與 ${seen.get(brief)} 簡介相同`);
    seen.set(brief, id);
  }
});

test("情境明列的出生點不在牆圍起的房間：四個方向至少兩向連續 4 格可通行", () => {
  for (const id of db.ids("scenario")) {
    const sc = db.require("scenario", id), map = db.get("map", sc.map);
    if (!map || typeof map.cells !== "string") continue;
    const cells = [...map.cells];
    const wall = (c: Cell): boolean => {
      if (c.x < 0 || c.y < 0 || c.x >= map.width || c.y >= map.height) return true;
      const terrain = db.get("terrain", map.legend[cells[c.y * map.width + c.x]!] ?? "");
      return !terrain || terrain.moveCost.leg == null;
    };
    for (const [slot, def] of Object.entries(sc.slots)) def.units.forEach((u, i) => {
      if (u.at === "zone") return;
      const at = u.at;
      const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) =>
        [1, 2, 3, 4].every(k => !wall({ x: at.x + dx! * k, y: at.y + dy! * k }))).length;
      assert.ok(open >= 2, `${id} ${slot}#${i} 出生在 (${at.x},${at.y})，只有 ${open} 個方向走得出去`);
    });
  }
});
