import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "./protocol.ts";
import { okResult } from "./tool.ts";
import { validateSchema } from "./schema.ts";

test("協定：版本、工具、錯誤、通知與 ping", async () => {
  const server = createServer({ name: "測試", version: "1", tools: [
    { name: "echo", description: "回音", inputSchema: { type: "object", properties: { n: { type: "integer" } }, required: ["n"] }, handler: a => okResult("成功", a) },
    { name: "throw", description: "丟錯", inputSchema: { type: "object" }, handler: () => { throw new Error("故意失敗"); } },
  ] });
  const call = async (method: string, params?: unknown) => JSON.parse((await server.handle(JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })))!);
  for (const version of ["2025-06-18", "2025-03-26", "2024-11-05", "unknown"]) {
    const init = (await call("initialize", { protocolVersion: version })).result;
    assert.equal(init.protocolVersion, version === "unknown" ? "2025-06-18" : version);
    assert.deepEqual(init.capabilities, { tools: { listChanged: false } });
  }
  for (const tool of (await call("tools/list")).result.tools) {
    assert.ok(tool.name && tool.description); assert.equal(tool.inputSchema.type, "object"); assert.equal(tool.handler, undefined);
  }
  assert.equal((await call("tools/call", { name: "echo", arguments: { n: 2 } })).result.structuredContent.n, 2);
  assert.equal((await call("tools/call", { name: "echo", arguments: { n: "bad" } })).result.isError, true);
  assert.equal((await call("tools/call", { name: "throw" })).result.isError, true);
  assert.equal((await call("tools/call", { name: "missing" })).error.code, -32602);
  assert.equal((await call("tools/call", { name: "echo", arguments: [] })).error.code, -32602);
  assert.equal((await call("missing")).error.code, -32601);
  assert.equal(JSON.parse((await server.handle("{"))!).error.code, -32700);
  for (const invalid of [[], null, {}, { jsonrpc: "2.0", method: "ping", id: {} }]) assert.equal(JSON.parse((await server.handle(JSON.stringify(invalid)))!).error.code, -32600);
  for (const method of ["notifications/initialized", "ping", "unknown"]) assert.equal(await server.handle(JSON.stringify({ jsonrpc: "2.0", method })), null);
  assert.deepEqual((await call("ping")).result, {});
});

test("schema 子集：正反例與中文欄位路徑", () => {
  const schema = { type: "object" as const, properties: { rows: { type: "array" as const, items: { type: "integer" as const, minimum: 1, maximum: 3 } },
    value: { anyOf: [{ type: "string" as const, enum: ["好"] }, { type: "boolean" as const }] } }, required: ["rows", "value"], additionalProperties: false };
  assert.deepEqual(validateSchema(schema, { rows: [1, 3], value: true }), []);
  assert.deepEqual(validateSchema(schema, { rows: [], value: "好" }), []);
  assert.match(validateSchema(schema, { rows: [0, 4, 1.5], value: "錯", extra: 1 }).join("；"), /參數.rows\[0\].*不得小於/u);
  assert.ok(validateSchema(schema, {}).length === 2);
  assert.ok(validateSchema({ type: "number" }, Infinity).length);
});
