import { parentPort, workerData } from "node:worker_threads";
import { createContentDB } from "../content/contentdb.ts";
import { runProbeTrial } from "./probe.ts";
import type { ProbeWork } from "./probe.ts";

if (parentPort) {
  const work = workerData as ProbeWork, db = createContentDB(...work.snapshot);
  for (const task of work.tasks) parentPort.postMessage({ group: task.group, trial: runProbeTrial(db, task.pairing, task.seed) });
  parentPort.close();
}
