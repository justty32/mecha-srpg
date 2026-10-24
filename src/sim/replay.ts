import type { ContentDB } from "../content/contentdb.ts";
import type { BattleState, Command } from "../core/types-state.ts";
import { canonicalJson, hashLog } from "../core/eventlog.ts";
import { createBattle, startBattle, tryCommand } from "../rules/index.ts";
import type { BattleSetup } from "../rules/index.ts";
import { runBattle } from "./run.ts";
import type { RunOptions } from "./run.ts";

export class ReplayError extends Error {
  index: number;
  command: Command;
  code: string;
  constructor(index: number, command: Command, code: string) {
    super(`重播指令 #${index} 被拒絕：${code}`);
    this.name = "ReplayError";
    this.index = index;
    this.command = structuredClone(command);
    this.code = code;
  }
}

export function replay(db: ContentDB, setup: BattleSetup, seed: number, commands: Command[]): BattleState {
  const state = createBattle(db, setup, seed), ctx = { db, s: state };
  startBattle(ctx);
  commands.forEach((command, index) => {
    const result = tryCommand(ctx, command);
    if (!result.ok) throw new ReplayError(index, command, result.rejection.code);
  });
  return state;
}

export function verifyReplay(db: ContentDB, run: { setup: BattleSetup; seed: number; commands: Command[]; hash: string }): { ok: boolean; hash: string } {
  const hash = hashLog(replay(db, run.setup, run.seed, run.commands).log);
  return { ok: hash === run.hash, hash };
}

export function rerunAiAndCompare(opts: RunOptions, expected: Command[]): { ok: boolean; firstDiff: number | null } {
  const actual = runBattle(opts).commands;
  for (let index = 0; index < Math.max(actual.length, expected.length); index++) {
    if (!actual[index] || !expected[index] || canonicalJson(actual[index]) !== canonicalJson(expected[index])) {
      return { ok: false, firstDiff: index };
    }
  }
  return { ok: true, firstDiff: null };
}
