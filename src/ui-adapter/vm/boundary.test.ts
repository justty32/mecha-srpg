import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

// 模組邊界（architecture.md）：ui-adapter 只依賴 core＋sim，不得 import src/rules、src/ai（含 import type）。
const root = resolve(import.meta.dirname, "../../..");
const uiDir = join(root, "src/ui-adapter");
const banned = ["src/rules", "src/ai"].map(p => join(root, p));
const SPEC = /(?:\bimport|\bexport)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

function specifiers(source: string): string[] {
  return [...source.matchAll(SPEC)].map(m => m[1] ?? m[2] ?? m[3]!);
}

function violations(file: string, source: string): string[] {
  return specifiers(source).filter(spec => {
    if (!spec.startsWith(".")) return false;
    const target = resolve(dirname(file), spec);
    return banned.some(dir => target === dir || target.startsWith(dir + sep));
  });
}

function tsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? tsFiles(path) : entry.name.endsWith(".ts") ? [path] : [];
  });
}

test("boundary 自測：rules／ai 的 import、import type、export from 會被擋，sim 放行", () => {
  // 樣本以 up 拼路徑，避免本檔原文被 grep 驗收或下面的全檔掃描誤判。
  const file = join(uiDir, "vm/sample.ts"), up = "../../";
  for (const line of [`import {x} from "${up}rules/index.ts";`, `import type {y} from "${up}ai/index.ts";`,
    `export * from "${up}ai/x.ts";`, `const m = await import("${up}rules/flow.ts");`, `import "${up}ai/index.ts";`])
    assert.equal(violations(file, line).length, 1, line);
  assert.deepEqual(violations(file, `import { createSession } from "${up}sim/session.ts";`), []);
  assert.deepEqual(violations(file, `import type { Id } from "${up}core/ids.ts";`), []);
  assert.equal(violations(file, `import {\n  a,\n  b,\n} from "${up}rules/index.ts";`).length, 1, "多行 import");
});

test("boundary：src/ui-adapter/**/*.ts 不 import src/rules、src/ai", () => {
  const files = tsFiles(uiDir);
  assert.ok(files.length > 10, "應掃到 ui-adapter 的檔案");
  const bad = files.flatMap(file => violations(file, readFileSync(file, "utf8")).map(spec => `${relative(root, file)} → ${spec}`));
  assert.deepEqual(bad, []);
});
