import { test } from "node:test";
import assert from "node:assert/strict";
import { GREAT_TIDE, omenFlag, omens, stage, syncOmenFlags, tide } from "./omens.ts";
import { clock } from "./clock.ts";
import type { CalendarDef, OmenDef } from "./types.ts";
import { loadWorldDirs } from "../content/load.ts";

const cal: CalendarDef = { id: "calendar/tide", daysPerMonth: 28, spring: [1, 15], neap: [7, 21], monthsPerYear: 13, epochMonth: 0 };
const omen = (id: string, extra: Partial<OmenDef>): OmenDef => ({ id: `omen/${id}`, name: id, layer: "sky", effects: [], tags: [], ...extra });

test("stage：潮前三日、漲潮、退潮三日、小潮、平潮", () => {
  assert.deepEqual([1, 2, 4, 5, 7, 12, 14, 15, 18, 19, 21, 26, 28].map(d => stage(d, cal)),
    ["spring", "ebb", "ebb", "neap", "slack", "rising", "rising", "spring", "ebb", "neap", "slack", "rising", "rising"]);
  assert.equal(stage(3, { ...cal, stageWindow: 1 }), "neap");
});

test("tide：潮級基本值與漲潮日的天象修正（delta 上限 3、set 優先、多 set 取最大）", () => {
  const perigee = omen("perigee", { layer: "distance", cycle: { periodMonths: 2, offsetDays: 0, durationDays: 1 }, tideDelta: 1 });
  const eclipse = omen("eclipse", { layer: "eclipse", cycle: { periodMonths: 2, offsetDays: 0, durationDays: 1 }, tideDelta: 1 });
  const veiled = omen("veiled", { layer: "eclipse", cycle: { periodMonths: 2, offsetDays: 0, durationDays: 1 }, setTide: 1 });
  const big = omen("big", { layer: "scripted", at: [{ month: 0, dom: 1 }], setTide: 4 });
  assert.deepEqual([6, 1, 11, 0].map(d => tide(d, cal, [])), [0, 1, 1, 2]);
  assert.equal(tide(0, cal, [perigee]), 3);
  assert.equal(tide(28, cal, [perigee]), 2, "窗外");
  assert.equal(tide(0, cal, [perigee, eclipse, { ...eclipse, id: "omen/e2" }]), 3, "delta 上限 3");
  assert.equal(tide(0, cal, [perigee, veiled]), 1, "枯潮壓過迫月");
  assert.equal(tide(0, cal, [perigee, veiled, big]), 4, "連珠壓過枯潮");
  assert.equal(tide(1, cal, [omen("wide", { layer: "distance", cycle: { periodMonths: 1, offsetDays: 0, durationDays: 28 }, tideDelta: 1 })]), 1, "非漲潮日不吃修正");
});

test("omens：cycle 相位自蝕曆元年起、排定型與湧現型", () => {
  const sky = omen("s", { cycle: { periodMonths: 3, offsetDays: -2, durationDays: 5 } });
  const shifted: CalendarDef = { ...cal, epochMonth: 1 };
  assert.deepEqual(omens(2, cal, [sky]), ["omen/s"]);
  assert.deepEqual(omens(3, cal, [sky]), []);
  assert.deepEqual(omens(84 - 2, cal, [sky]), ["omen/s"]);
  assert.deepEqual(omens(84 - 28 - 2, shifted, [sky]), ["omen/s"], "epochMonth 平移相位");
  const p = omen("p", { layer: "distance", cycle: { periodMonths: 1, offsetDays: 0, durationDays: 1 } });
  const skies = ["a", "b", "c"].map(id => omen(id, { cycle: { periodMonths: 1, offsetDays: 0, durationDays: 1 } }));
  const syz = omen("syz", { layer: "scripted", at: [{ month: 5, dom: 15 }], emerge: { requires: ["omen/p"], layer: "sky", min: 3 } });
  assert.ok(omens(0, cal, [p, ...skies, syz]).includes("omen/syz"));
  assert.ok(!omens(0, cal, [p, ...skies.slice(1), syz]).includes("omen/syz"), "星候不足");
  assert.ok(omens(5 * 28 + 14, cal, [syz]).includes("omen/syz"), "排定日");
});

test("omen 旗：寫入 `omen:<名>`、窗外刪除、不碰其他旗", () => {
  assert.equal(omenFlag("base:omen/mars-at-heart"), "omen:mars-at-heart");
  const flags: Record<string, number> = { anchorable: 1, "omen:old": 1 };
  syncOmenFlags(flags, ["base:omen/new"]);
  assert.deepEqual(flags, { anchorable: 1, "omen:new": 1 });
});

test("base 蝕曆：連珠潮只在開局第 40 蝕月初一排定、之後十年內不湧現；大潮每年兩三次", () => {
  const { world, errors } = loadWorldDirs(["content/base"]);
  assert.deepEqual(errors, []);
  const c = world.require("calendar", "base:calendar/tide"), defs = world.all("omen");
  assert.equal(defs.length, 15);
  let greats = 0;
  const syzygy: string[] = [];
  for (let day = 0; day < 10 * 13 * 28; day++) {
    const k = clock(day, c, defs);
    if (k.tide >= GREAT_TIDE) greats++;
    if (k.tide === 4) syzygy.push(`${k.month}/${k.dom}`);
  }
  assert.deepEqual(syzygy, ["40/1"]);
  assert.ok(greats >= 20 && greats <= 30, String(greats));
  assert.equal(clock(0, c, defs).year, 20);
});

test("日結：tick 寫 omen 旗與潮級，事件 when 可用 omen／tide tag 與 calendar.tide", async () => {
  const { fixture } = await import("../world/test-support.ts");
  const { tick } = await import("../time/tick.ts");
  const { evalOpsCond } = await import("../content/cond.ts");
  const { s, ctx } = fixture();
  assert.equal(s.flags["omen:dark-spring"], 1, "開局初一即寫旗");
  s.clock = clock(40 * 28 - 1, ctx.world.require("calendar", s.calendar), ctx.world.all("omen"));
  tick(s, ctx);
  assert.equal(s.clock.month, 40); assert.equal(s.clock.tide, 4);
  assert.equal(s.flags["omen:grand-syzygy"], 1);
  assert.ok(evalOpsCond(s, ctx, { tag: "omen:grand-syzygy" }));
  assert.ok(evalOpsCond(s, ctx, { tag: "tide:spring" }));
  assert.ok(evalOpsCond(s, ctx, { cmp: { a: { ref: "calendar.tide" }, op: ">=", b: 4 } }));
  while (s.pendingChoices.length) s.pendingChoices.shift();
  delete (s as { time?: unknown }).time;
  tick(s, ctx);
  assert.equal(s.flags["omen:grand-syzygy"], undefined, "窗外刪旗");
  assert.ok(evalOpsCond(s, ctx, { tag: "tide:ebb" }));
});

test("check：天象週期驗證能擋壞資料、base 全過", async () => {
  const { omenErrors } = await import("../content/check.ts");
  const { world } = loadWorldDirs(["content/base"]);
  assert.deepEqual(omenErrors(world), []);
  const bad: OmenDef[] = [
    omen("frac", { cycle: { periodMonths: 1.01, offsetDays: 0, durationDays: 1 } }),
    omen("never", { layer: "distance", cycle: { periodMonths: 1, offsetDays: 3, durationDays: 1 }, tideDelta: 1 }),
    omen("dom", { layer: "scripted", at: [{ month: 1, dom: 29 }] }),
    omen("ref", { layer: "scripted", at: [{ month: 1, dom: 1 }], emerge: { requires: ["omen/missing"], layer: "sky", min: 3 } }),
    omen("kind", { cycle: { periodMonths: 1, offsetDays: 0, durationDays: 1 }, effects: [{ kind: "nope" }] }),
  ];
  const fake = { ...world, all: ((kind: string) => kind === "omen" ? bad : world.all(kind as "calendar")) as typeof world.all, get: ((kind: string, id: string) => kind === "omen" ? bad.find(b => b.id === id) : world.get(kind as "calendar", id)) as typeof world.get };
  const errors = omenErrors(fake);
  for (const id of ["frac", "never", "dom", "ref", "kind"]) assert.ok(errors.some(e => e.startsWith(`omen/${id}`)), `${id}: ${errors.join("; ")}`);
});

test("base 迫月週期 7.5 蝕月（210 日）：大潮輪流落在朔潮與望潮", () => {
  const { world } = loadWorldDirs(["content/base"]);
  const c = world.require("calendar", "base:calendar/tide"), defs = world.all("omen");
  const perigee = defs.find(d => d.id.endsWith("omen/perigee"))!;
  assert.equal(perigee.cycle!.periodMonths, 7.5);
  const doms = new Set<number>();
  for (let day = 0; day < 40 * 13 * 28; day++) {
    if (omens(day, c, defs).some(id => id.endsWith("omen/perigee")) && stage(day % c.daysPerMonth + 1, c) === "spring") doms.add(day % c.daysPerMonth + 1);
  }
  assert.deepEqual([...doms].sort((a, b) => a - b), [1, 15], "迫月漲潮日既落初一也落十五");
});
