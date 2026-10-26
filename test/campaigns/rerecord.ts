// 黃金戰役重錄：世界軌跡變了（新機型、曆法、規則）導致凍結指令被拒或戰鬥紀錄對不上時，
// 照原指令的「意圖」重走一次並覆寫 <name>.json 的 commands；hash 另用 GOLDEN_UPDATE=1 重產。
// 用法（專案根）：node test/campaigns/rerecord.ts [name…]（預設全部）；--dry 只印結果不寫檔。
// 規則：choose 只在有待決提示時下；其他指令先照原樣下，被拒才把提示選 1 再試；sortie 等到 pendingBattle 出現再出擊，
// 戰鬥紀錄沿用原紀錄的戰果、改寫成當下的 sortie 與編號；原指令走完仍缺事件子序列，就逐日等（選 1）到湊齊或滿 EXTEND_DAYS（預設 240）天。
import { readFileSync, writeFileSync } from "node:fs";
import { canonicalJson } from "../../src/core/eventlog.ts";
import { newCampaign } from "../../src/ops/content/start.ts";
import type { CampaignCommand } from "../../src/ops/sim/campaign.ts";
import { applySortieResult } from "../../src/ops/sortie/run.ts";
import type { CampaignState, Sortie } from "../../src/ops/state/types.ts";
import { applyCommand } from "../../src/ops/time/index.ts";
import type { BattleRunner } from "../../src/ops/time/index.ts";
import { fixture } from "../../src/ops/world/test-support.ts";
import { containsInOrder, sequences, setupState } from "./golden-spec.ts";
import type { Golden } from "./golden-spec.ts";

type BattleRecord = NonNullable<CampaignCommand["battle"]>;
const EXTEND_DAYS = Number(process.env.EXTEND_DAYS ?? 240);

function remap(record: BattleRecord, from: string, to: string): BattleRecord {
  const text = JSON.stringify(record).split(`"${from}"`).join(`"${to}"`).split(`"${from}/`).join(`"${to}/`);
  return JSON.parse(text) as BattleRecord;
}

export function rerecord(name: string): { input: Golden; ok: boolean; notes: string[] } {
  const input = JSON.parse(readFileSync(`${import.meta.dirname}/${name}.json`, "utf8")) as Golden;
  const { ctx } = fixture(input.seed);
  let state: CampaignState = input.setup ? setupState(ctx, input) : newCampaign(ctx.db, ctx.world, `start/${input.start}`, input.seed);
  const out: CampaignCommand[] = [], notes: string[] = [];
  const apply = (command: CampaignCommand): boolean => {
    const record = command.battle;
    let consumed = false;
    // 與 replayCampaign 相同的消費方式，確保重錄出的紀錄能原樣重播。
    const battle: BattleRunner | undefined = record && ((s, c, sortie) => {
      if (canonicalJson(sortie) !== canonicalJson(record.sortie)) throw new Error("battle-record-sortie-mismatch");
      consumed = true;
      if (!record.outcome.ok) return record.outcome;
      s.rng = structuredClone(record.rng); s.effectCounter = record.effectCounter;
      if (record.result) applySortieResult(s, c, sortie, record.result);
      return record.outcome;
    });
    const output = applyCommand(state, ctx.db, ctx.world, command, { battle });
    if (!output.result.ok) return false;
    if (record && !consumed) throw new Error(`${name}: unused-battle-record`);
    state = output.state; out.push(command);
    return true;
  };
  const prompts = () => {
    for (let guard = 0; (state.pendingChoices.length || state.pendingEncounter) && guard < 50; guard++)
      if (!apply({ v: "choose", choice: 1 })) throw new Error(`${name}: day ${state.clock.day} 提示無法選 1`);
  };
  for (const [i, command] of input.commands.entries()) {
    if (command.v === "choose") { if (state.pendingChoices.length || state.pendingEncounter) apply(command); continue; }
    if (command.v === "wait") {
      if (apply(command)) continue;
      prompts();
      if (!apply(command)) notes.push(`#${i} wait 被拒（day ${state.clock.day}${state.pendingBattle ? "，有待出擊戰鬥" : ""}），略過`);
      continue;
    }
    if (command.v === "sortie") {
      prompts();
      for (let guard = 0; !state.pendingBattle && guard < 30; guard++) { if (!apply({ v: "wait", days: 1 })) break; prompts(); }
      const pending = state.pendingBattle;
      if (!pending) throw new Error(`${name}: #${i} 等不到可出擊的戰鬥`);
      const sortie: Sortie = { ...structuredClone(pending), units: structuredClone(command.sortie.units ?? []) }, from = command.sortie.id ?? sortie.id;
      const battle = command.battle && { ...remap(command.battle, from, sortie.id), sortie: structuredClone(sortie),
        rng: structuredClone(state.rng), effectCounter: state.effectCounter };
      if (sortie.id !== command.sortie.id || sortie.day !== command.sortie.day) notes.push(`#${i} sortie ${command.sortie.id}@${command.sortie.day} → ${sortie.id}@${sortie.day}`);
      if (!apply({ ...command, sortie, ...(battle ? { battle } : {}) })) throw new Error(`${name}: #${i} sortie 被拒`);
      continue;
    }
    if (apply(command)) continue;
    prompts();
    if (!apply(command)) throw new Error(`${name}: #${i} ${JSON.stringify(command)} 被拒（day ${state.clock.day}）`);
  }
  prompts();
  const sequence = sequences[name]!;
  for (let day = 0; !containsInOrder(state.log, sequence) && day < EXTEND_DAYS; day++) {
    if (!apply({ v: "wait", days: 1 })) { notes.push(`延長第 ${day} 天 wait 被拒（day ${state.clock.day}）`); break; }
    prompts();
    if (day === 0) notes.push("原指令走完仍缺子序列，逐日延長");
  }
  return { input: { ...input, commands: out }, ok: containsInOrder(state.log, sequence), notes };
}

if (import.meta.main) {
  const args = process.argv.slice(2), dry = args.includes("--dry");
  const names = args.filter(a => !a.startsWith("--"));
  for (const name of names.length ? names : Object.keys(sequences)) {
    const { input, ok, notes } = rerecord(name);
    console.log(`${name}: ${ok ? "子序列齊" : "子序列缺"}，${input.commands.length} 條指令${notes.length ? `；${notes.join("；")}` : ""}`);
    if (ok && !dry) writeFileSync(`${import.meta.dirname}/${name}.json`, `${JSON.stringify(input, null, 2)}\n`);
  }
}
