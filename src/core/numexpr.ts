import type { NumExpr, Cond } from "./types-def.ts";

export const REF_ROOTS: readonly string[] = ["self", "target", "part", "layer", "battle", "rng"];
export type EvalCtx = { ref(path: string): number; hasTag?(tag: string): boolean };
export class NumExprError extends Error {}

function finite(value: number): number {
  if (!Number.isFinite(value)) throw new NumExprError("NumExpr 結果必須是有限數字");
  return value;
}

export function evalNum(expr: NumExpr, ctx: EvalCtx): number {
  let value: number;
  if (typeof expr === "number") value = expr;
  else if ("ref" in expr) {
    value = ctx.ref(expr.ref);
    value = value * (expr.mul ?? 1) + (expr.add ?? 0);
    if (expr.min !== undefined) value = Math.max(value, expr.min);
    if (expr.max !== undefined) value = Math.min(value, expr.max);
  } else if ("sum" in expr) {
    value = expr.sum.reduce((sum, item) => sum + evalNum(item, ctx), 0);
  } else if ("product" in expr) {
    value = expr.product.reduce((product, item) => product * evalNum(item, ctx), 1);
  } else {
    value = evalNum(evalCond(expr.pick.if, ctx) ? expr.pick.then : expr.pick.else, ctx);
  }
  return finite(value);
}

export function evalCond(cond: Cond, ctx: EvalCtx): boolean {
  if (cond.tag !== undefined && !ctx.hasTag) throw new NumExprError("tag 條件需要 hasTag");
  if (cond.tag !== undefined && !ctx.hasTag!(cond.tag)) return false;
  if (cond.not !== undefined && evalCond(cond.not, ctx)) return false;
  if (cond.all !== undefined && !cond.all.every((item) => evalCond(item, ctx))) return false;
  if (cond.any !== undefined && !cond.any.some((item) => evalCond(item, ctx))) return false;
  if (cond.cmp !== undefined) {
    const { a, op, b } = cond.cmp;
    const left = evalNum(a, ctx);
    const right = evalNum(b, ctx);
    switch (op) {
      case "<": return left < right;
      case "<=": return left <= right;
      case "==": return left === right;
      case ">=": return left >= right;
      case ">": return left > right;
      default: throw new NumExprError(`未知比較運算子：${op}`);
    }
  }
  return true;
}

export function objectRefs(roots: Record<string, unknown>): (path: string) => number {
  return (path) => {
    let value: unknown = roots;
    for (const key of path.split(".")) {
      if (value === null || typeof value !== "object" || !Object.hasOwn(value, key)) {
        throw new NumExprError(`找不到數值路徑：${path}`);
      }
      value = (value as Record<string, unknown>)[key];
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new NumExprError(`路徑必須指向有限數字：${path}`);
    }
    return value;
  };
}

export function collectRefs(x: NumExpr | Cond): string[] {
  const refs = new Set<string>();
  function visit(value: unknown): void {
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    const object = value as Record<string, unknown>;
    if (typeof object.ref === "string") refs.add(object.ref);
    Object.values(object).forEach(visit);
  }
  visit(x);
  return [...refs].sort();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unknownKeys(value: Record<string, unknown>, allowed: readonly string[], at: string): string[] {
  return Object.keys(value).filter((key) => !allowed.includes(key))
    .map((key) => `${at}.${key}: 未知鍵`);
}

export function checkNumExpr(x: unknown, at: string = "$"): string[] {
  if (typeof x === "number") return Number.isFinite(x) ? [] : [`${at}: 必須是有限數字`];
  if (!isObject(x)) return [`${at}: 必須是數字或 NumExpr 物件`];
  const shapes = ["ref", "sum", "product", "pick"].filter((key) => Object.hasOwn(x, key));
  const errors: string[] = [];
  if (shapes.length !== 1) errors.push(`${at}: 必須恰好有一個形狀鍵 ref／sum／product／pick`);
  errors.push(...unknownKeys(x, shapes.includes("ref")
    ? [...shapes, "mul", "add", "min", "max"] : shapes, at));
  for (const shape of shapes) {
    if (shape === "ref") {
      if (typeof x.ref !== "string" || !REF_ROOTS.includes(x.ref.split(".")[0]!)) {
        errors.push(`${at}.ref: 必須是字串且根屬於 REF_ROOTS`);
      }
      for (const key of ["mul", "add", "min", "max"]) {
        if (Object.hasOwn(x, key) && (typeof x[key] !== "number" || !Number.isFinite(x[key]))) {
          errors.push(`${at}.${key}: 必須是有限數字`);
        }
      }
    } else if (shape === "sum" || shape === "product") {
      const items = x[shape];
      if (!Array.isArray(items)) errors.push(`${at}.${shape}: 必須是陣列`);
      else for (let i = 0; i < items.length; i++) {
        errors.push(...checkNumExpr(items[i], `${at}.${shape}[${i}]`));
      }
    } else {
      const pick = x.pick;
      if (!isObject(pick)) errors.push(`${at}.pick: 必須是物件`);
      else {
        errors.push(...unknownKeys(pick, ["if", "then", "else"], `${at}.pick`));
        errors.push(...checkCond(pick.if, `${at}.pick.if`));
        errors.push(...checkNumExpr(pick.then, `${at}.pick.then`));
        errors.push(...checkNumExpr(pick.else, `${at}.pick.else`));
      }
    }
  }
  return errors;
}

export function checkCond(x: unknown, at: string = "$"): string[] {
  if (!isObject(x)) return [`${at}: 必須是 Cond 物件`];
  const errors = unknownKeys(x, ["tag", "not", "all", "any", "cmp"], at);
  if (Object.hasOwn(x, "tag") && typeof x.tag !== "string") errors.push(`${at}.tag: 必須是字串`);
  if (Object.hasOwn(x, "not")) errors.push(...checkCond(x.not, `${at}.not`));
  for (const key of ["all", "any"]) {
    if (!Object.hasOwn(x, key)) continue;
    const items = x[key];
    if (!Array.isArray(items)) errors.push(`${at}.${key}: 必須是陣列`);
    else for (let i = 0; i < items.length; i++) {
      errors.push(...checkCond(items[i], `${at}.${key}[${i}]`));
    }
  }
  if (Object.hasOwn(x, "cmp")) {
    const cmp = x.cmp;
    if (!isObject(cmp)) errors.push(`${at}.cmp: 必須是物件`);
    else {
      errors.push(...unknownKeys(cmp, ["a", "op", "b"], `${at}.cmp`));
      errors.push(...checkNumExpr(cmp.a, `${at}.cmp.a`));
      errors.push(...checkNumExpr(cmp.b, `${at}.cmp.b`));
      if (typeof cmp.op !== "string" || !["<", "<=", "==", ">=", ">"].includes(cmp.op)) {
        errors.push(`${at}.cmp.op: 未知比較運算子`);
      }
    }
  }
  return errors;
}
