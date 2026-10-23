import type { RngState } from "./types-state.ts";

const MASK64 = (1n << 64n) - 1n;
const U32_SIZE = 2 ** 32;
const MULTIPLIER = 6364136223846793005n;

function hex64(value: bigint): string {
  return (value & MASK64).toString(16).padStart(16, "0");
}

export function createRng(seed: number, stream: number = 54): RngState {
  for (const value of [seed, stream]) {
    if (!Number.isInteger(value) || value < 0 || value > 2 ** 53) {
      throw new RangeError("seed 與 stream 必須是 0..2^53 的整數");
    }
  }
  const rng = { state: hex64(0n), inc: hex64((BigInt(stream) << 1n) | 1n) };
  nextU32(rng);
  rng.state = hex64(BigInt(`0x${rng.state}`) + BigInt(seed));
  nextU32(rng);
  return rng;
}

export function nextU32(rng: RngState): number {
  const oldState = BigInt(`0x${rng.state}`);
  rng.state = hex64(oldState * MULTIPLIER + BigInt(`0x${rng.inc}`));
  const shifted = Number((((oldState >> 18n) ^ oldState) >> 27n) & 0xffffffffn);
  const rotation = Number(oldState >> 59n);
  return ((shifted >>> rotation) | (shifted << ((-rotation) & 31))) >>> 0;
}

export function nextFloat(rng: RngState): number {
  return nextU32(rng) / U32_SIZE;
}

export function nextInt(rng: RngState, n: number): number {
  if (!Number.isInteger(n) || n < 1 || n > U32_SIZE) {
    throw new RangeError("n 必須是 1..2^32 的整數");
  }
  const threshold = U32_SIZE % n;
  let value: number;
  do {
    value = nextU32(rng);
  } while (value < threshold);
  return value % n;
}

export function rollInt(rng: RngState, lo: number, hi: number): number {
  // SPEC-GAP：區間端點限安全整數，寬度沿用 nextInt 的 1..2^32。
  if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi)) {
    throw new RangeError("區間端點必須是安全整數");
  }
  return lo + nextInt(rng, hi - lo + 1);
}

export function d100(rng: RngState): number {
  return nextInt(rng, 100);
}

export function chance(rng: RngState, p: number): boolean {
  return nextFloat(rng) < p;
}

export function pickWeighted<T>(rng: RngState, items: readonly T[], weight: (t: T) => number): T {
  const weights = items.map(weight);
  // SPEC-GAP：負值與非有限權重無合法機率意義，統一拒絕。
  if (weights.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError("權重必須是非負有限數字");
  }
  const total = weights.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total) || total <= 0) throw new RangeError("總權重必須是正有限數字");
  const draw = nextFloat(rng) * total;
  let cumulative = 0;
  let lastPositive = 0;
  for (let i = 0; i < items.length; i++) {
    const value = weights[i]!;
    if (value > 0) lastPositive = i;
    cumulative += value;
    if (draw < cumulative) return items[i]!;
  }
  // 浮點乘法可能將抽樣值捨入總權重；仍只回傳正權重項目。
  return items[lastPositive]!;
}

export function cloneRng(rng: RngState): RngState {
  return { state: rng.state, inc: rng.inc };
}
