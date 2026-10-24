import { readFileSync, writeFileSync } from "node:fs";
import { loadContentDirs } from "../content/loader.ts";
import { hashLog } from "../core/eventlog.ts";
import { battleResult, isActive } from "../rules/index.ts";
import { runBattle, scenarioToSetup } from "./run.ts";
import { createSave, loadSave, parseSave, serializeSave } from "./save.ts";
import type { SaveFile } from "./save.ts";

export function main(argv: string[], out: (line: string) => void = console.log): number {
  try {
    const options = new Map<string, string>();
    for (let i = 0; i < argv.length; i++) {
      const key = argv[i]!;
      if (key === "--ai-vs-ai") continue;
      if (!["--scenario", "--seed", "--rounds", "--out", "--save", "--load", "--packs"].includes(key)) throw new Error(`未知選項：${key}`);
      const value = argv[++i];
      if (!value || value.startsWith("--") || options.has(key)) throw new Error(`選項缺值或重複：${key}`);
      options.set(key, value);
    }
    const numberOption = (key: string): number | undefined => {
      const value = options.get(key);
      if (value === undefined) return undefined;
      const n = Number(value);
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(n) || (key === "--rounds" && n < 1)) throw new Error(`非法數字：${key}`);
      return n;
    };
    const seedOption = numberOption("--seed"), rounds = numberOption("--rounds");
    const { db, errors } = loadContentDirs((options.get("--packs") ?? "content/base").split(","));
    if (errors.length) throw new Error(`內容載入失敗：${JSON.stringify(errors)}`);
    const load = options.get("--load");
    let save: SaveFile;
    let stopped = "replay";
    let state;
    if (load) {
      if (options.has("--scenario") || seedOption !== undefined || rounds !== undefined) throw new Error("--load 不接受 scenario／seed／rounds 覆蓋");
      save = parseSave(readFileSync(load, "utf8"));
      const loaded = loadSave(db, save, { verifySnapshot: true });
      state = loaded.state;
      loaded.warnings.forEach(warning => out(`warning: ${warning}`));
    } else {
      const scenario = options.get("--scenario");
      if (!scenario) throw new Error("需要 --scenario 或 --load");
      const def = db.require("scenario", scenario), seed = seedOption ?? def.seed ?? 1;
      const sim = scenarioToSetup(db, def, seed, { rounds });
      const run = runBattle({ db, sim, seed });
      state = run.state;
      stopped = run.stopped;
      save = createSave(db, { scenario: sim.scenario, seed, commands: run.commands, setup: sim.setup });
    }
    const ctx = { db, s: state }, result = battleResult(ctx);
    out(`勝負: ${result?.winner ?? (result ? "平手" : "未決")} (${result?.reason ?? stopped})`);
    out(`輪數: ${state.round}`);
    for (const slot of Object.keys(state.factions).sort()) {
      out(`存活 ${slot}: ${Object.values(state.units).filter(unit => unit.owner === slot && isActive(ctx, unit.id)).length}`);
    }
    const counts: Record<string, number> = {};
    for (const event of state.log.events) counts[event.type] = (counts[event.type] ?? 0) + 1;
    out(`事件: ${JSON.stringify(Object.fromEntries(Object.keys(counts).sort().map(type => [type, counts[type]])))}`);
    out(`hash: ${hashLog(state.log)}`);
    const logPath = options.get("--out"), savePath = options.get("--save");
    if (logPath) writeFileSync(logPath, JSON.stringify(state.log, null, 2));
    if (savePath) writeFileSync(savePath, serializeSave(save));
    return 0;
  } catch (error) {
    out(`錯誤: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
