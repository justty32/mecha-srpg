// session 與指令歷史各自封存在工具組中；不依賴協定層。
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { newCampaign, createOpsCtx } from "../ops/content/start.ts";
import type { CampaignState, OpsCommand } from "../ops/state/types.ts";
import { applyCommand } from "../ops/time/index.ts";
import type { BattleRunner, CmdResult } from "../ops/time/index.ts";
import { render, parse, VERBS, currentRoom } from "../ops/text/index.ts";
import { defaultBattleRunner, runCampaign, campaignHash, createCampaignBlob, serializeCampaign, parseCampaign, loadCampaign } from "../ops/sim/index.ts";
import { dailySummary } from "../ops/time/tick.ts";
import type { CampaignCommand } from "../ops/sim/campaign.ts";
import { campaignView } from "./campaign-view.ts";
import { okResult, errorResult, ToolError } from "./tool.ts";
import type { McpEnv, ToolDef, ToolResult, JsonSchema } from "./tool.ts";

type Session = { id: string; start: string; seed: number; state: CampaignState; commands: CampaignCommand[]; viewed: number };
type BattleRecord = NonNullable<CampaignCommand["battle"]>;
const idSchema: JsonSchema = { type: "string", description: "campaign_new／load 回傳的 id" };
const seedSchema: JsonSchema = { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER };
const startSchema: JsonSchema = { type: "string", default: "default" };

function integer(value: unknown, label: string, min = 0): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min) throw new ToolError(`${label} 必須是不小於 ${min} 的安全整數。`);
  return value;
}
function startId(value: unknown): string {
  const start = value ?? "default";
  if (typeof start !== "string" || !start.trim()) throw new ToolError("start 必須是開局名稱。");
  return start.includes("/") ? start : `start/${start}`;
}
function explain(code: string): string {
  const messages: Record<string, string> = {
    "pending-choice": "要先 choose 處理待選事件。", "invalid-choice": "請選擇畫面列出的選項序號。",
    "choice-disabled": "此選項的條件尚未成立。", "name-required": "此選項需要另行輸入名稱，請選擇其他選項。",
    "invalid-days": "天數必須是正整數。", "no-exit": "目前房間沒有這個出口。",
    "not-offered": "這份契約目前無法承接。", "empty-sortie": "請在 sortie.units 提供出戰機甲、seats 與 controlMode。",
    "pending-encounter": "請先處理待選事件或出戰。", "insufficient-cash": "現金不足。",
    "insufficient-fuel": "燃料不足。", "ship-not-overhead": "船不在目標上空，請先航行或關閉 shipOverhead。",
    "not-docked": "請先在目標節點停泊。", "inactive-contract": "出戰契約尚未承接或已結束。",
  };
  return messages[code] ?? "指令未符合目前條件；請查看畫面與 campaign_actions，調整參數後重試。";
}

// 與 runCampaign 相同：記錄生成後 RNG、戰果與效果流水號，重播不重新抽戰鬥。
function recordingBattle(record: CampaignCommand): BattleRunner {
  return (state, ctx, sortie) => {
    const outcome = defaultBattleRunner(state, ctx, sortie) as CmdResult & { result?: BattleRecord["result"] };
    const result = outcome.ok && outcome.result ? structuredClone(outcome.result) : undefined;
    if (result) for (const entry of [...result.units, ...result.persons]) for (const pool of Object.values(entry.state.pools)) {
      if (pool.max === Infinity) pool.max = Number.MAX_SAFE_INTEGER;
    }
    record.battle = { sortie: structuredClone(sortie), outcome: outcome.ok ? { ok: true } : { ok: false, error: outcome.error },
      ...(result ? { result } : {}), rng: structuredClone(state.rng), effectCounter: state.effectCounter };
    return outcome;
  };
}

function battleSummary(record: CampaignCommand) {
  const battle = record.battle, result = battle?.result;
  if (!battle || !result) return undefined;
  const units = new Set(battle.sortie.units.map(u => u.mech));
  const people = new Set(battle.sortie.units.flatMap(u => Object.values(u.seats)));
  return { winner: result.winner ?? "none", outcome: result.winner === "player" ? "勝利" : result.winner ? "敗北" : "未分勝負",
    rounds: result.rounds,
    losses: { mechs: result.units.filter(u => units.has(u.id) && ["dead", "derelict-lost"].includes(u.status)).map(u => u.id),
      persons: result.persons.filter(p => people.has(p.id) && (p.status === "dead" || p.state.pools.hp?.cur === 0)).map(p => p.id) } };
}

export function createCampaignTools(env: McpEnv): ToolDef[] {
  const sessions = new Map<string, Session>();
  let serial = 0;
  const session = (id: unknown): Session => {
    const found = typeof id === "string" && sessions.get(id);
    if (!found) throw new ToolError(`找不到戰役 ${String(id)}；請先 campaign_new 或 campaign_load。`);
    return found;
  };
  const add = (state: CampaignState, start: string, seed: number, commands: CampaignCommand[] = []) => {
    const s: Session = { id: `c${++serial}`, state, start, seed, commands, viewed: 0 };
    sessions.set(s.id, s); return s;
  };
  const view = (s: Session, limit = 20, map = false): ToolResult => {
    const output = campaignView(env, s.id, s.state, s.state.log.slice(s.viewed), limit, false, map);
    s.viewed = s.state.log.length;
    return okResult(output.summary, output.data);
  };
  const execute = (s: Session, cmd: OpsCommand, advance = false): ToolResult => {
    const { db, world } = env.world(), beforeDay = s.state.clock.day, beforeRoom = currentRoom(s.state);
    const record: CampaignCommand = structuredClone(cmd);
    const output = applyCommand(s.state, db, world, cmd, { battle: recordingBattle(record) });
    s.state = output.state;
    s.commands.push(record);
    if (!output.result.ok) return errorResult(`${output.result.error}：${explain(output.result.error)}`, { error: output.result.error });
    const rendered = campaignView(env, s.id, s.state, output.events, 20, currentRoom(s.state) === beforeRoom && cmd.v !== "look", cmd.v === "map"), battle = battleSummary(record);
    const advancedDays = s.state.clock.day - beforeDay, stopped = s.state.pendingChoices.length > 0;
    const progress = advance ? `已推進 ${advancedDays} 天${stopped ? "；待選事件使時間暫停，要先 choose，選完會接續剩餘天數" : ""}。\n` : "";
    const battleText = battle ? `出戰${battle.outcome}，${battle.rounds} 輪；我方機甲損失 ${battle.losses.mechs.length}${battle.losses.mechs.length ? `（${battle.losses.mechs.join("、")}）` : ""}、人員死亡 ${battle.losses.persons.length}${battle.losses.persons.length ? `（${battle.losses.persons.join("、")}）` : ""}。\n` : "";
    // act 的畫面不消耗顯式 view 游標；下一次 view 仍可讀取自上次 view 以來的事件。
    return okResult([rendered.summary, progress.trim(), battleText.trim()].filter(Boolean).join("\n"), {
      id: s.id, eventLog: rendered.data.log, logOmitted: rendered.data.logOmitted,
      ...(battle ? { battle } : {}), ...(advance ? { requestedDays: cmd.v === "wait" ? cmd.days : 0, advancedDays, stoppedForChoice: stopped } : {}),
      view: rendered.data,
    });
  };
  const define = (name: string, description: string, properties: Record<string, JsonSchema>, required: string[],
    handler: ToolDef["handler"]): ToolDef => ({ name, description,
    inputSchema: { type: "object", properties, required, additionalProperties: false },
    async handler(args) {
      try { return await handler(args); }
      catch (error) { return errorResult(`營運工具失敗：${error instanceof Error ? error.message : String(error)}`); }
    },
  });
  return [
    define("campaign_new", "開新戰役，回傳 id 與畫面摘要。", { seed: seedSchema, start: startSchema }, ["seed"], args => {
      const seed = integer(args.seed, "seed"), start = startId(args.start), { db, world } = env.world();
      return view(add(newCampaign(db, world, start, seed), start, seed));
    }),
    define("campaign_view", "看畫面與自上次 view 以來的新 log；log 為最多行數（預設 20），較早的省略行數另列；map=true 附世界圖（航行天數／燃料）。", {
      id: idSchema, log: { type: "integer", minimum: 0, default: 20 }, map: { type: "boolean", description: "附世界圖：可達節點的航行天數與燃料" },
    }, ["id"], args => view(session(args.id), args.log === undefined ? 20 : integer(args.log, "log"), args.map === true)),
    define("campaign_actions", "列出可原樣傳給 campaign_act.command 的 cmd；verbs=true 另附文字指令動詞表。", { id: idSchema, verbs: { type: "boolean" } }, ["id"], args => {
      const s = session(args.id), { db, world } = env.world(), screen = render(s.state, [], world, db);
      const actions = screen.actions.map(({ label, cmd, key, disabled }) => ({ label, cmd, ...(key ? { key } : {}), ...(disabled ? { disabled } : {}) }));
      for (const contract of Object.values(s.state.contracts).filter(c => c.status === "offered")) actions.push({
        label: `承接契約 ${contract.id}`, cmd: { v: "accept", contract: contract.id }, ...(screen.prompt ? { disabled: "要先 choose" } : {}),
      });
      // 已承接且船在目標節點的契約：直接給可出戰的 sortie cmd（機庫裡已派駕駛的機甲全上）。
      const crewed = s.state.hangar.bays.flatMap(m => { const mech = m ? s.state.mechs[m] : undefined;
        return mech?.seats.pilot ? [{ mech: mech.id, seats: { ...mech.seats }, controlMode: "pilot" as const }] : []; });
      for (const contract of Object.values(s.state.contracts).filter(c => ["active", "stage"].includes(c.status) && c.target.node === s.state.ship.at && !s.state.pendingBattle)) {
        const disabled = screen.prompt ? "要先 choose" : !crewed.length ? "機庫沒有已派駕駛的機甲；先 assign" : undefined;
        actions.push({ label: `出戰契約 ${contract.id}（${crewed.length} 台，AI 自動結算）`,
          cmd: { v: "sortie", sortie: { contract: contract.id, node: contract.target.node, units: crewed } } as OpsCommand, ...(disabled ? { disabled } : {}) });
      }
      if (s.state.pendingBattle) actions.push({ label: "出戰（AI 自動結算）", cmd: { v: "sortie", sortie: {} },
        ...(screen.prompt ? { disabled: "要先 choose" } : {}) });
      // text 列出每項（序號、標籤、停用原因），JSON 給 cmd；動詞表 1 KB 以上，只在 verbs=true 時附。
      const lines = actions.map((a, i) => `${i + 1}. ${a.label}${a.disabled ? `（停用：${a.disabled}）` : ""}`);
      return okResult(`${screen.prompt ? "要先 choose。\n" : ""}${lines.join("\n")}\n將 actions[序號-1].cmd 原樣傳給 campaign_act.command；其他指令可用 text 文字送（verbs=true 看動詞表）。出戰編成若為空，需補 sortie.units。`,
        { id: s.id, actions, ...(args.verbs === true ? { verbs: VERBS.map(v => ({ ...v })) } : {}) });
    }),
    define("campaign_act", "送 command 或 text，二擇一；出戰由 AI 結算並保存重播紀錄。", {
      id: idSchema, command: { type: "object", properties: { v: { type: "string", enum: VERBS.map(v => v.v) } }, required: ["v"] },
      text: { type: "string" },
    }, ["id"], args => {
      const s = session(args.id);
      if ((args.command !== undefined) === (args.text !== undefined)) throw new ToolError("command 與 text 必須二擇一。");
      let cmd: OpsCommand;
      if (args.text !== undefined) {
        if (typeof args.text !== "string") throw new ToolError("text 必須是文字。");
        const parsed = parse(args.text, s.state, env.world().world);
        if ("error" in parsed) return errorResult(parsed.error, { error: parsed.error, candidates: parsed.candidates ?? [] });
        cmd = parsed;
      } else {
        const raw = args.command;
        if (!raw || typeof raw !== "object" || Array.isArray(raw) || !("v" in raw) || !VERBS.some(v => v.v === raw.v) || "battle" in raw) {
          throw new ToolError("command 需要合法的 v 與指令參數；battle 紀錄由工具產生。");
        }
        cmd = structuredClone(raw) as OpsCommand;
      }
      return execute(s, cmd);
    }),
    define("campaign_advance", "等待 days 天；遇待選事件暫停，choose 後接續剩餘天數。", {
      id: idSchema, days: { type: "integer", minimum: 1 },
    }, ["id", "days"], args => execute(session(args.id), { v: "wait", days: integer(args.days, "days", 1) }, true)),
    define("campaign_auto", "全自動跑 N 潮月，回每月摘要、最終帳本與 hash；不建立互動 session。", {
      seed: seedSchema, months: { type: "integer", minimum: 0 },
      policy: { type: "string", enum: ["idle", "greedy", "random"] }, start: startSchema,
      battles: { type: "boolean", default: true },
    }, ["seed", "months", "policy"], args => {
      const seed = integer(args.seed, "seed"), months = integer(args.months, "months"), start = startId(args.start);
      const policy = args.policy;
      if (policy !== "idle" && policy !== "greedy" && policy !== "random") throw new ToolError("policy 須為 idle、greedy 或 random。");
      if (args.battles !== undefined && typeof args.battles !== "boolean") throw new ToolError("battles 必須是布林值。");
      const { db, world } = env.world();
      const output = runCampaign({ db, world, seed, months, start, policy, ...(args.battles === false ? {} : { battle: defaultBattleRunner }) });
      const final = dailySummary(output.state, createOpsCtx(output.state, db, world)), hash = campaignHash(output.state);
      return okResult(`自動完成 ${months} 潮月（${policy}）：現金 ${final.cash}、債務 ${final.debt}、人數 ${final.persons}；${output.commands.length} 條指令；hash=${hash}。`,
        { summary: output.summary, final, commandCount: output.commands.length, hash });
    }),
    define("campaign_save", "回傳可重播的 blob；可選 path 寫入檔案（相對專案根或絕對路徑）。", {
      id: idSchema, path: { type: "string" },
    }, ["id"], args => {
      const s = session(args.id), blob = createCampaignBlob(s.start, s.seed, s.commands, s.state);
      const path = filePath(args.path);
      if (path) writeFileSync(path, serializeCampaign(blob));
      return okResult(`戰役 ${s.id} 已存檔${path ? `至 ${path}` : "（blob）"}；共 ${s.commands.length} 條指令。`,
        { id: s.id, blob, ...(path ? { path } : {}) });
    }),
    define("campaign_load", "從 blob（物件或 JSON 字串）或 path 二擇一重播，成功後回新 id。", {
      blob: { anyOf: [{ type: "object" }, { type: "string" }] }, path: { type: "string" },
    }, [], args => {
      if ((args.blob !== undefined) === (args.path !== undefined)) throw new ToolError("blob 與 path 必須二擇一。");
      const path = filePath(args.path);
      const source = path ? readFileSync(path, "utf8") : typeof args.blob === "string" ? args.blob : JSON.stringify(args.blob);
      if (!source) throw new ToolError("blob 必須是存檔物件或 JSON 字串。");
      const blob = parseCampaign(source), { db, world } = env.world();
      // 目前 loadCampaign 只消費 blob 中的 battle 紀錄；仍傳入同一個 runner 契約。
      const state = loadCampaign(db, world, blob, recordingBattle({ v: "sortie", sortie: {} }));
      return view(add(state, blob.start, blob.seed, blob.commands));
    }),
    define("campaign_close", "關閉一個戰役 session。", { id: idSchema }, ["id"], args => {
      const s = session(args.id);
      sessions.delete(s.id);
      return okResult(`戰役 ${s.id} 已關閉。`, { id: s.id, closed: true });
    }),
  ];

  function filePath(value: unknown): string | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "string" || !value.trim()) throw new ToolError("path 必須是非空路徑。");
    return resolve(env.root, value);
  }
}
