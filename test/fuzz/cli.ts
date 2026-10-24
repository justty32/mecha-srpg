import { writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import { setTimeout, clearTimeout } from "node:timers";
import { join } from "node:path";
import type { Finding, Trial } from "./drive.ts";
import type { Work } from "./worker.ts";
import type { Mode } from "./gen.ts";
import { firstLine, groupKey, NAMES } from "./invariants.ts";

export async function runCli(args: string[] = process.argv.slice(2)) {
  let runs = 200, seed = 1, mode: Mode | "mix" = "mix", verbose = false, json: string | undefined, maxMs = Infinity;
  let jobs = Math.max(1, availableParallelism() - 1);
  let seeds: number[] | undefined;
  const number = (value: string | undefined): number => {
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n < 0) throw new Error(`必須為非負安全整數：${value}`);
    return n;
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--runs": runs = number(args[++i]); break;
      case "--seed": seed = number(args[++i]); break;
      case "--seeds": {
        const value = args[++i];
        if (!value) throw new Error("--seeds 缺少固定 seed 清單");
        seeds = value.split(",").map(number);
        if (new Set(seeds).size !== seeds.length) throw new Error("--seeds 不可重複");
        break;
      }
      case "--max-ms": maxMs = number(args[++i]); break;
      case "--jobs": jobs = number(args[++i]); if (!jobs) throw new Error("--jobs 必須至少為 1"); break;
      case "--verbose": verbose = true; break;
      case "--json": json = args[++i]; if (!json) throw new Error("--json 缺路徑"); break;
      case "--mode": {
        const value = args[++i];
        if (value !== "mix" && value !== "ai" && value !== "random" && value !== "scenario") throw new Error(`未知模式 ${value}`);
        mode = value; break;
      }
      default: throw new Error(`未知參數 ${args[i]}`);
    }
  }
  if (!Number.isSafeInteger(seed + Math.max(0, runs - 1))) throw new Error("seed 範圍溢出");
  if (seeds && seeds.length !== runs) throw new Error("--seeds 件數必須等於 --runs");
  const started = Date.now(), deadline = Number.isFinite(maxMs) ? started + maxMs : Number.MAX_SAFE_INTEGER;
  const counts = { ai: 0, random: 0, scenario: 0 }, modeMs = { ai: 0, random: 0, scenario: 0 };
  const trials: Trial[] = [];
  let contentCounts: unknown = {};
  const workerCount = Math.min(jobs, runs);
  const workers = Array.from({ length: workerCount }, (_, offset) => {
    const work: Work = { seed, seeds, runs, offset, jobs: workerCount, mode, deadline };
    const child = new Worker(join(import.meta.dirname, "worker.ts"), { workerData: work });
    const done = new Promise<void>((resolve, reject) => {
      let timedOut = false;
      const timer = Number.isFinite(maxMs) ? setTimeout(() => { timedOut = true; void child.terminate(); }, Math.max(0, deadline - Date.now())) : undefined;
      child.on("message", (message: { trial?: Trial; elapsedMs?: number; counts?: unknown; error?: string }) => {
        if (message.trial) { trials.push(message.trial); modeMs[message.trial.mode] += message.elapsedMs!; }
        if (message.counts) contentCounts = message.counts;
        if (message.error) reject(new Error(message.error));
      });
      child.on("error", reject);
      child.on("exit", code => {
        clearTimeout(timer);
        if (timedOut || code === 0) resolve();
        else reject(new Error(`worker exit ${code}`));
      });
    });
    return { child, done };
  });
  try { await Promise.all(workers.map(w => w.done)); }
  finally { await Promise.all(workers.map(({ child }) => child.terminate())); }
  trials.sort((a, b) => a.seed - b.seed);
  const scenarios: Record<string, number> = {}, invariantRuns: Record<string, number> = Object.fromEntries([...NAMES, "gen-error", "setup-rejected", "legal-rejected", "no-termination", "ai-rejected"].map(n => [n, 0]));
  const findings: Finding[] = [], groups = new Map<string, { invariant: string; message: string; runs: number; example: Finding }>();
  let completed = 0, hardRuns = 0;
  for (const trial of trials) {
    completed++; counts[trial.mode]++;
    if (trial.scenario) scenarios[trial.scenario] = (scenarios[trial.scenario] ?? 0) + 1;
    if (trial.issues.some(x => !x.warning)) hardRuns++;
    for (const invariant of new Set(trial.issues.map(x => x.invariant))) invariantRuns[invariant] = (invariantRuns[invariant] ?? 0) + 1;
    for (const issue of trial.issues) {
      findings.push(issue);
      const key = groupKey(issue.invariant, issue.message), group = groups.get(key);
      if (group) group.runs++;
      else groups.set(key, { invariant: issue.invariant, message: firstLine(issue.message).replace(/\d+/g, "#"), runs: 1, example: issue });
    }
  }
  const elapsedMs = Date.now() - started, grouped = [...groups.values()];
  const summary = { requested: runs, completed, counts, elapsedMs, maxMs: Number.isFinite(maxMs) ? maxMs : null,
    jobs: workers.length, modeMs, hardRuns, invariantRuns, scenarios, contentCounts, groups: grouped, findings,
    trials: trials.map(t => ({ seed: t.seed, mode: t.mode, steps: t.steps, midSaveStep: t.midSaveStep })) };
  console.log(`場數 ${completed}/${runs}; 模式 ${JSON.stringify(counts)}; 耗時 ${elapsedMs} ms; 硬違規場數 ${hardRuns}`);
  console.log(`耗時明細 jobs=${workers.length}; 各模式累計 ms ${JSON.stringify(modeMs)}`);
  console.log(`不變量違規場數 ${JSON.stringify(invariantRuns)}`);
  console.log(`違規分組 ${grouped.length} 組（同不變量＋訊息首行去數字；count 為場數）`);
  for (const g of grouped) console.log(`${g.invariant} | ${g.runs} | ${g.message} | seed=${g.example.seed} mode=${g.example.mode}`);
  console.log("前 20 筆違規：");
  for (const f of findings.slice(0, 20)) {
    console.log(`${f.warning ? "WARN" : "FAIL"} seed=${f.seed} mode=${f.mode} ${f.invariant}: ${firstLine(f.message)}`);
    console.log(`node test/fuzz/cli.ts --seed ${f.seed} --runs 1 --mode ${f.mode} --verbose`);
  }
  if (verbose) for (const f of findings) console.log(JSON.stringify(f, null, 2));
  if (json) writeFileSync(json, `${JSON.stringify(summary, null, 2)}\n`);
  return summary;
}
if (import.meta.main) runCli().then(summary => { process.exitCode = summary.hardRuns ? 1 : 0; })
  .catch(error => { console.error(error); process.exitCode = 1; });
