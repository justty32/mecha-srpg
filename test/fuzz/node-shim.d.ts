// 本工具新增的 node 內建介面；沿用專案最小墊片，不安裝 @types/node。
declare module "node:os" { export function availableParallelism(): number }
declare module "node:timers" {
  export function setTimeout(fn: () => void, ms: number): object;
  export function clearTimeout(timer: object | undefined): void;
}
declare module "node:perf_hooks" { export const performance: { now(): number } }
declare module "node:worker_threads" {
  export const workerData: unknown;
  export const parentPort: { postMessage(value: unknown): void; close(): void } | null;
  export class Worker {
    constructor(path: string, options: { workerData: unknown });
    terminate(): Promise<number>;
    on(event: "message", listener: (message: { trial?: import("./drive.ts").Trial; elapsedMs?: number; counts?: unknown; error?: string }) => void): void;
    on(event: "error", listener: (error: Error) => void): void;
    on(event: "exit", listener: (code: number) => void): void;
  }
}
