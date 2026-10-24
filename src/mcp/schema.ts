import type { JsonSchema } from "./tool.ts";

export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** 只驗證凍結契約的子集；default 是文件，不會偷偷改參數。 */
export function validateSchema(schema: JsonSchema, value: unknown, path = "參數"): string[] {
  const errors: string[] = [];
  if (schema.anyOf && !schema.anyOf.some(s => validateSchema(s, value, path).length === 0)) {
    errors.push(`${path}：不符合任一允許格式（${schema.anyOf.map(s => validateSchema(s, value, path).join("；")).join("／")}）`);
  }
  const valid = schema.type === undefined || (schema.type === "object" ? isObject(value)
    : schema.type === "array" ? Array.isArray(value)
    : schema.type === "integer" ? typeof value === "number" && Number.isSafeInteger(value)
    : schema.type === "number" ? typeof value === "number" && Number.isFinite(value)
    : typeof value === schema.type);
  if (!valid) return [...errors, `${path}：必須是 ${schema.type}`];
  if (schema.enum && !schema.enum.some(v => v === value)) errors.push(`${path}：必須是 ${schema.enum.join("、")} 之一`);
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}：不得小於 ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}：不得大於 ${schema.maximum}`);
  }
  if (isObject(value)) {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}：必填欄位`);
    for (const [key, child] of Object.entries(value)) {
      const field = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : undefined;
      if (field) errors.push(...validateSchema(field, child, `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${path}.${key}：不允許的欄位`);
    }
  }
  if (Array.isArray(value) && schema.items) value.forEach((v, i) => errors.push(...validateSchema(schema.items!, v, `${path}[${i}]`)));
  return errors;
}
