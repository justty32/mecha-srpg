// 情境黃金測試（architecture §headless 測試策略 (2)）：固定 seed＋指令序列 → 事件日誌 hash。
// 情境檔 test/scenarios/*.json，黃金檔 test/golden/<id>.hash（一行 16 hex，hashLog＝fnv1a64(canonicalJson(events))）。
// 改規則後要重產：GOLDEN_UPDATE=1 node --test test/golden.test.ts，再用 diff 事件日誌 review。
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { loadContentDirs } from "../src/content/loader.ts";
import { hashLog, typeSequence, eventsOfType } from "../src/core/eventlog.ts";
import type { Command } from "../src/core/types-state.ts";
import type { BattleState } from "../src/core/types-state.ts";
import type { BattleSetup, RejectCode } from "../src/rules/index.ts";

// 逐模組動態載入（各模組載入時登記動詞／信號／指令）。開發中某模組還不存在時，
// 整組黃金測試標 skip 並寫明缺哪個；收線驗收要求 0 skip。
const MODULES = ["state", "contribs", "pools", "effects", "hooks", "turn", "movement", "command", "attack", "layers",
  "conduct", "morale", "injury", "will", "control", "flow", "objectives"];
const missing: string[] = [];
const mods: Record<string, Record<string, unknown>> = {};
for (const m of MODULES) {
  try { mods[m] = await import(`../src/rules/${m}.ts`); } catch (e) { missing.push(`${m}（${(e as Error).message.split("\n")[0]}）`); }
}
const skip = missing.length ? `rules 模組未齊：${missing.join("、")}` : false;
const createBattle = mods.flow?.createBattle as unknown as (db: unknown, setup: BattleSetup, seed: number) => BattleState;
const startBattle = mods.turn?.startBattle as unknown as (ctx: { db: unknown; s: BattleState }) => void;
const tryCommand = mods.command?.tryCommand as unknown as (ctx: { db: unknown; s: BattleState }, c: Command) =>
  { ok: true } | { ok: false; rejection: { code: string } };

type Step = Command | { cmd: Command; reject: RejectCode };
type Scenario = {
  id: string; seed: number; setup: BattleSetup; commands: Step[];
  expect: { sequence?: string[]; minCounts?: Record<string, number>; outcome?: { winner: string | null } };
};

const SCEN_DIR = "test/scenarios";
const GOLD_DIR = "test/golden";
const update = process.env.GOLDEN_UPDATE === "1";
const { db, errors } = loadContentDirs(["content/base", "test/scenarios/pack"]);
const files = (existsSync(SCEN_DIR) ? readdirSync(SCEN_DIR) : []).filter((f) => f.endsWith(".json")).sort();
const runs: Record<string, BattleState> = {};

function run(sc: Scenario): BattleState {
  const s = createBattle(db, sc.setup, sc.seed);
  const ctx = { db, s };
  startBattle(ctx);
  sc.commands.forEach((step, i) => {
    const isWrapped = "cmd" in step;
    const cmd = isWrapped ? step.cmd : step;
    const r = tryCommand(ctx, cmd);
    if (isWrapped) {
      assert.equal(r.ok, false, `${sc.id} 指令 #${i} 應被拒絕`);
      if (!r.ok) assert.equal(r.rejection.code, step.reject, `${sc.id} 指令 #${i} 拒絕碼`);
    } else {
      assert.ok(r.ok, `${sc.id} 指令 #${i} ${JSON.stringify(cmd)} 被拒：${r.ok ? "" : JSON.stringify(r.rejection)}`);
    }
  });
  return s;
}

function isSubsequence(needle: string[], hay: string[]): boolean {
  let j = 0;
  for (const t of hay) if (j < needle.length && t === needle[j]) j++;
  return j === needle.length;
}

test("內容包載入 0 錯誤（黃金情境前置）", () => {
  assert.deepEqual(errors, []);
});

for (const f of files) {
  const sc = JSON.parse(readFileSync(`${SCEN_DIR}/${f}`, "utf8")) as Scenario;
  test(`黃金情境 ${sc.id}：連跑兩次 hash 一致且等於黃金檔`, { skip }, () => {
    const a = run(sc);
    const b = run(sc);
    const ha = hashLog(a.log);
    assert.equal(hashLog(b.log), ha, "同 seed 同指令兩次 hash 不同（決定性破了）");
    const types = typeSequence(a.log);
    if (sc.expect.sequence) assert.ok(isSubsequence(sc.expect.sequence, types), `關鍵事件序列不符：${sc.expect.sequence.join("→")}`);
    for (const [t, n] of Object.entries(sc.expect.minCounts ?? {})) {
      assert.ok(eventsOfType(a.log, t).length >= n, `${t} 少於 ${n} 筆`);
    }
    if (sc.expect.outcome) assert.equal(a.rt?.outcome?.winner ?? null, sc.expect.outcome.winner);
    const goldPath = `${GOLD_DIR}/${sc.id}.hash`;
    if (update) writeFileSync(goldPath, `${ha}\n`);
    else assert.equal(ha, readFileSync(goldPath, "utf8").trim(), `${sc.id} hash 與黃金檔不同；確認是預期改動後用 GOLDEN_UPDATE=1 重產`);
    runs[sc.id] = a;
  });
}

test("黃金情境合計含層結算與傳導事件", { skip }, () => {
  const all = Object.values(runs);
  assert.ok(all.length >= 6, `黃金情境至少 6 個，實際 ${all.length}`);
  for (const t of ["LayerDamaged", "LayerBroken", "Conducted"]) {
    assert.ok(all.some((s) => eventsOfType(s.log, t).length > 0), `沒有任何情境含 ${t}`);
  }
});
