// 最小 node 型別墊片：本專案只准裝 typescript 一個 devDependency（不裝 @types/node），
// `npm run typecheck`（tsc --noEmit）靠這份宣告認得測試與載入器用到的 node 內建模組與全域。
// 只宣告專案實際用到的介面；要用新的 node API 先在這裡補宣告。執行期無作用（.d.ts）。

declare var console: { log(...args: unknown[]): void; error(...args: unknown[]): void; warn(...args: unknown[]): void };
declare var process: {
  argv: string[]; env: Record<string, string | undefined>; exitCode: number | undefined;
  cwd(): string; exit(code?: number): never;
};
declare function structuredClone<T>(value: T): T;
declare class TextEncoder { encode(input?: string): Uint8Array }
interface ImportMeta { main: boolean; url: string; dirname: string; filename: string }

declare module "node:test" {
  type TestFn = (t: TestContext) => void | Promise<void>;
  type TestOptions = { skip?: boolean | string; todo?: boolean | string; only?: boolean; timeout?: number };
  interface TestContext { name: string; test(name: string, fn: TestFn): Promise<void>; skip(msg?: string): void }
  interface TestApi {
    (name: string, fn: TestFn): Promise<void>;
    (name: string, options: TestOptions, fn: TestFn): Promise<void>;
  }
  export const test: TestApi;
  export const it: TestApi;
  export function describe(name: string, fn: () => void | Promise<void>): Promise<void>;
  export function before(fn: () => void | Promise<void>): void;
  export function after(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export default test;
}

declare module "node:assert/strict" {
  type Matcher = RegExp | ((err: unknown) => boolean) | (new (...args: any[]) => unknown) | object;
  interface Assert {
    (value: unknown, message?: string): asserts value;
    ok(value: unknown, message?: string): asserts value;
    equal<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    strictEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    notStrictEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    deepStrictEqual<T>(actual: unknown, expected: T, message?: string): asserts actual is T;
    notDeepEqual(actual: unknown, expected: unknown, message?: string): void;
    throws(fn: () => unknown, expected?: Matcher | string, message?: string): void;
    doesNotThrow(fn: () => unknown, message?: string): void;
    rejects(fn: Promise<unknown> | (() => Promise<unknown>), expected?: Matcher, message?: string): Promise<void>;
    match(value: string, re: RegExp, message?: string): void;
    fail(message?: string): never;
  }
  const assert: Assert;
  export default assert;
}

declare module "node:fs" {
  interface Dirent { name: string; isFile(): boolean; isDirectory(): boolean }
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function writeFileSync(path: string, data: string): void;
  export function existsSync(path: string): boolean;
  export function readdirSync(path: string): string[];
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

declare module "node:path" {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
  export function dirname(p: string): string;
  export function basename(p: string, ext?: string): string;
  export function relative(from: string, to: string): string;
  export const sep: string;
}
