import schema from "../../schemas/content.schema.json" with { type: "json" };
import type { ContentKind } from "../core/ids.ts";

export type SchemaError = { path: string; message: string };
export type SchemaName = ContentKind | "pack" | "registry" | "rules-constants" | "rules-damage-modifiers" | "rules-morale-events" | "rules-injuries";
export const CONTENT_SCHEMA: Record<string, unknown> = schema;
type Schema = {
  type?: string | string[]; required?: string[]; properties?: Record<string, Schema>;
  additionalProperties?: boolean | Schema; items?: Schema; enum?: unknown[]; const?: unknown;
  minimum?: number; maximum?: number; minItems?: number; oneOf?: Schema[]; anyOf?: Schema[]; $ref?: string;
};

function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>;
  return Object.keys(left).length === Object.keys(right).length &&
    Object.keys(left).every(key => Object.hasOwn(right, key) && equal(left[key], right[key]));
}

function matchesType(type: string, value: unknown): boolean {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return typeof value === "number" && Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  return typeof value === type;
}

function validate(rule: Schema, value: unknown, path: string): SchemaError[] {
  const errors: SchemaError[] = [];
  const fail = (message: string, at = path) => errors.push({ path: at, message });
  if (rule.$ref) {
    const name = rule.$ref.startsWith("#/$defs/") ? rule.$ref.slice(8) : "";
    const defs = CONTENT_SCHEMA.$defs as Record<string, Schema>;
    if (!Object.hasOwn(defs, name)) fail(`unknown schema reference ${rule.$ref}`);
    else errors.push(...validate(defs[name]!, value, path));
  }
  if (rule.type && !(Array.isArray(rule.type) ? rule.type : [rule.type]).some(type => matchesType(type, value))) {
    fail(`expected type ${[rule.type].flat().join(" | ")}`);
    return errors;
  }
  if (Object.hasOwn(rule, "const") && !equal(value, rule.const)) fail(`expected constant ${JSON.stringify(rule.const)}`);
  if (rule.enum && !rule.enum.some(candidate => equal(value, candidate))) fail(`expected one of ${JSON.stringify(rule.enum)}`);
  for (const keyword of ["oneOf", "anyOf"] as const) {
    const choices = rule[keyword];
    if (!choices) continue;
    const results = choices.map(choice => validate(choice, value, path));
    const count = results.filter(result => result.length === 0).length;
    if (keyword === "oneOf" ? count !== 1 : count === 0) {
      fail(`${keyword}: expected ${keyword === "oneOf" ? "exactly one" : "at least one"} matching alternative`);
      // 最接近的分支保留實際欄位路徑，方便定位巢狀內容錯誤。
      if (count === 0) errors.push(...results.reduce((best, result) => result.length < best.length ? result : best));
    }
  }
  if (typeof value === "number") {
    if (rule.minimum !== undefined && value < rule.minimum) fail(`must be >= ${rule.minimum}`);
    if (rule.maximum !== undefined && value > rule.maximum) fail(`must be <= ${rule.maximum}`);
  }
  if (Array.isArray(value)) {
    if (rule.minItems !== undefined && value.length < rule.minItems) fail(`requires at least ${rule.minItems} items`);
    if (rule.items) value.forEach((item, index) => errors.push(...validate(rule.items!, item, `${path}[${index}]`)));
  } else if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of rule.required ?? []) if (!Object.hasOwn(object, key)) fail("required property missing", `${path}.${key}`);
    for (const [key, item] of Object.entries(object)) {
      if (rule.properties && Object.hasOwn(rule.properties, key)) errors.push(...validate(rule.properties[key]!, item, `${path}.${key}`));
      else if (rule.additionalProperties === false) fail("additional property not allowed", `${path}.${key}`);
      else if (typeof rule.additionalProperties === "object") errors.push(...validate(rule.additionalProperties, item, `${path}.${key}`));
    }
  }
  return errors;
}

export function validateAgainst(name: SchemaName, value: unknown): SchemaError[] {
  return validate({ $ref: `#/$defs/${name}` }, value, "$");
}
