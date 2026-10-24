import { loadContentDirs } from "../../src/content/loader.ts";
import { parentPort, workerData } from "node:worker_threads";
import { performance } from "node:perf_hooks";
import { runTrial } from "./drive.ts";
import type { Mode } from "./gen.ts";

export type Work = { seed: number; seeds?: number[]; runs: number; offset: number; jobs: number; mode: Mode | "mix"; deadline: number };
// 等分連續 seed 區段，避免 jobs 是 3 的倍數時工作者只分到同一模式。
const work = workerData as Work;
if (parentPort) {
  try {
    const { db, errors } = loadContentDirs(["content/base"]);
    if (errors.length) throw new Error(`content load failed: ${JSON.stringify(errors)}`);
    parentPort.postMessage({ counts: db.counts() });
    const modes: Mode[] = ["ai", "random", "scenario"];
    const begin = Math.floor(work.offset * work.runs / work.jobs), end = Math.floor((work.offset + 1) * work.runs / work.jobs);
    for (let i = begin; i < end && Date.now() < work.deadline; i++) {
      const mode = work.mode === "mix" ? modes[i % 3]! : work.mode, started = performance.now();
      const trial = runTrial(db, work.seeds?.[i] ?? work.seed + i, mode);
      parentPort.postMessage({ trial, elapsedMs: performance.now() - started });
    }
  } catch (error) {
    parentPort.postMessage({ error: error instanceof Error ? error.stack : String(error) });
  } finally { parentPort.close(); }
}
