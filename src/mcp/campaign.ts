// session 與指令歷史各自封存在工具組中；不依賴協定層。
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { newCampaign, createOpsCtx } from "../ops/content/start.ts";
import type { CampaignState, OpsCommand } from "../ops/state/types.ts";
import { applyCommand } from "../ops/time/index.ts";
import type { BattleRunner } from "../ops/time/index.ts";
import { render, parse, VERBS, currentRoom } from "../ops/text/index.ts";
import { defaultBattleRunner, runCampaign, campaignHash, createCampaignBlob, serializeCampaign, parseCampaign, loadCampaign } from "../ops/sim/index.ts";
import { dailySummary } from "../ops/time/tick.ts";
import type { CampaignCommand } from "../ops/sim/campaign.ts";
import { canonicalJson } from "../core/eventlog.ts";
import { sortieBattleSetup, validateSortie, generateScenario } from "../ops/sortie/index.ts";
import { applySortieResult } from "../ops/sortie/run.ts";
import { createBattleHub } from "./battle.ts";
import type { BattleHub } from "./battle.ts";
import { campaignView, commandInfo, promptInfo, displayText, money, sortiePreview, battleReport, campaignCatalog, availableIds, screenText } from "./campaign-view.ts";
import { okResult, errorResult, ToolError } from "./tool.ts";
import type { McpEnv, ToolDef, ToolResult, JsonSchema } from "./tool.ts";

import { idSchema, seedSchema, startSchema, sortieOptions, requireIdle, integer, startId, explain, recordingBattle, battleSummary } from "./campaign-support.ts";
import type { Session, BattleRecord } from "./campaign-support.ts";

export function createCampaignTools(env: McpEnv, hub: BattleHub = createBattleHub(env)): ToolDef[] {
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
    return okResult(output.summary + (s.pending ? `\n出戰進行中：戰鬥 ${s.pending.battle}` : ""),
      { ...output.data, ...(s.pending ? { sortieBattle: s.pending.battle } : {}) });
  };
  const execute = (s: Session, cmd: OpsCommand, advance = false, runner?: BattleRunner): ToolResult => {
    const { db, world } = env.world(), beforeDay = s.state.clock.day, beforeRoom = currentRoom(s.state);
    const before = s.state;
    const info = commandInfo(env, s.state, cmd);
    const record: CampaignCommand = structuredClone(cmd);
    const output = applyCommand(s.state, db, world, cmd, { battle: recordingBattle(record, runner) });
    s.state = output.state;
    s.commands.push(record);
    if (!output.result.ok) {
      const prompt = promptInfo(render(s.state, [], world, db));
      return errorResult(`${output.result.error}：${explain(output.result.error)}${prompt ? `\n${prompt.summary}` : ""}`,
        { error: output.result.error, ...(prompt ? { prompt } : {}) });
    }
    const rendered = campaignView(env, s.id, s.state, output.events, 20, currentRoom(s.state) === beforeRoom && cmd.v !== "look", cmd.v === "map"), battle = battleSummary(record);
    const report = record.battle?.result ? battleReport(env, before, s.state, record.battle.sortie, record.battle.result) : undefined;
    const advancedDays = s.state.clock.day - beforeDay, stopped = s.state.pendingChoices.length > 0 || !!s.state.pendingEncounter;
    const progress = advance ? `已推進 ${advancedDays} 天${stopped ? "；待選事件使時間暫停，要先 choose，選完會接續剩餘天數" : ""}。\n` : "";
    const battleText = battle ? `出戰${battle.outcome}，${battle.rounds} 輪；我方機甲損失 ${battle.losses.mechs.length}${battle.losses.mechs.length ? `（${battle.losses.mechs.join("、")}）` : ""}、人員死亡 ${battle.losses.persons.length}${battle.losses.persons.length ? `（${battle.losses.persons.join("、")}）` : ""}。\n` : "";
    // act 的畫面不消耗顯式 view 游標；下一次 view 仍可讀取自上次 view 以來的事件。
    const inspection = ["look", "board", "help", "talk"].includes(cmd.v) ? render(s.state, output.events, world, db) : undefined;
    return okResult([rendered.summary, info, inspection ? `${screenText(env, s.state, inspection)}${output.events.length ? `\n事件：${JSON.stringify(output.events)}` : ""}` : "", progress.trim(), battleText.trim(), report?.lines.join("\n")].filter(Boolean).join("\n"), {
      id: s.id, eventLog: rendered.data.log, logOmitted: rendered.data.logOmitted,
      ...(battle ? { battle } : {}), ...(report ? { report } : {}), ...(advance ? { requestedDays: cmd.v === "wait" ? cmd.days : 0, advancedDays, stoppedForChoice: stopped } : {}),
      view: rendered.data, ...(inspection ? { screen: inspection, events: output.events, commandInfo: info } : {}),
    });
  };
  const sortieInput = (s: Session, value: unknown): Extract<OpsCommand, { v: "sortie" }> => {
    let input = value;
    if (input === undefined) {
      const options = sortieOptions(s.state, env.world().world).filter(o => !o.disabled);
      if (options.length !== 1) throw new ToolError(options.length > 1 ? "有多個可出戰契約，請明給 sortie。" : "沒有可出戰項目，請查看 campaign_actions 或明給 sortie。");
      input = options[0]!.sortie;
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ToolError("sortie 必須是出戰物件。");
    return { v: "sortie", sortie: structuredClone(input) };
  };
  const preview = (s: Session, cmd: Extract<OpsCommand, { v: "sortie" }>) => {
    const { db, world } = env.world();
    let info: ReturnType<typeof sortiePreview> | undefined;
    const output = applyCommand(s.state, db, world, cmd, { battle: (state, ctx, sortie) => {
      const setup = sortieBattleSetup(state, ctx, sortie); if (!setup.ok) return setup;
      info = sortiePreview(env, state, sortie, setup);
      return { ok: false, error: "mcp-preview" };
    } });
    return info ?? { error: output.result.ok ? "無法建立預覽" : output.result.error,
      summary: `無法預覽：${output.result.ok ? "無法建立戰場" : explain(output.result.error)}` };
  };
  const define = (name: string, description: string, properties: Record<string, JsonSchema>, required: string[],
    handler: ToolDef["handler"]): ToolDef => ({ name, description,
    inputSchema: { type: "object", properties, required, additionalProperties: false },
    async handler(args) {
      try {
        const result = await handler(args);
        // 可重播的 blob 與 structuredContent 維持精確值；文字欄才做顯示格式化。
        if (result.content[0]?.type === "text") result.content[0].text = displayText(result.content[0].text);
        if (name !== "campaign_save" && result.content[1]?.type === "text") result.content[1].text = JSON.stringify(result.structuredContent,
          (_key, value: unknown) => typeof value === "number" && Number.isFinite(value) ? Number(value.toFixed(2)) : value);
        return result;
      }
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
    define("campaign_actions", "列出 cmd（傳 campaign_act.command）或 tool＋args（呼叫指定工具）；verbs=true 另附文字指令動詞表。", { id: idSchema, verbs: { type: "boolean" } }, ["id"], args => {
      const s = session(args.id), { db, world } = env.world(), screen = render(s.state, [], world, db);
      if (s.pending) {
        const actions = [
          { label: "回寫戰果（campaign_sortie_finish）", tool: "campaign_sortie_finish", args: { id: s.id } },
          { label: "取消出戰（campaign_sortie_cancel）", tool: "campaign_sortie_cancel", args: { id: s.id } },
        ];
        return okResult(`出戰進行中：戰鬥 ${s.pending.battle}\n${actions.map(a => a.label).join("\n")}\n請用 tool 指定的工具傳入 args。`, { id: s.id, actions });
      }
      const actions: { label: string; cmd?: OpsCommand; key?: string; disabled?: string; tool?: string; args?: Record<string, unknown>; preview?: ReturnType<typeof preview> }[] =
        screen.actions.map(({ label, cmd, key, disabled }) => ({ label, cmd, ...(key ? { key } : {}), ...(disabled ? { disabled } : {}) }));
      for (const contract of Object.values(s.state.contracts).filter(c => c.status === "offered")) actions.push({
        label: `承接契約 ${contract.id}`, cmd: { v: "accept", contract: contract.id }, ...(screen.prompt ? { disabled: "要先 choose" } : {}),
      });
      for (const option of sortieOptions(s.state, env.world().world)) {
        const disabled = screen.prompt ? "要先 choose" : option.disabled;
        const info = preview(s, { v: "sortie", sortie: option.sortie });
        actions.push({ label: `${option.label}（AI 自動結算）`, cmd: { v: "sortie", sortie: option.sortie }, preview: info, ...(disabled ? { disabled } : {}) },
          { label: `互動${option.label}（campaign_sortie_begin）`, tool: "campaign_sortie_begin", args: { id: s.id, sortie: option.sortie }, preview: info, ...(disabled ? { disabled } : {}) });
      }
      const catalog = campaignCatalog(env, s.state);
      actions.push(...catalog.market, ...catalog.recruits, ...catalog.research);
      // text 列出每項（序號、標籤、停用原因），JSON 給 cmd；動詞表 1 KB 以上，只在 verbs=true 時附。
      const lines = actions.map((a, i) => `${i + 1}. ${a.label}${a.disabled ? `（停用：${a.disabled}）` : ""}${a.preview ? `\n${a.preview.summary}` : ""}`);
      return okResult(`${screen.prompt ? "要先 choose。\n" : ""}${lines.join("\n")}\n有 cmd 的項目將 cmd 傳給 campaign_act.command；有 tool 的項目呼叫該工具並傳入 args（互動出戰用 campaign_sortie_begin）。其他指令可用 text 文字送（verbs=true 看動詞表）。出戰編成若為空，需補 sortie.units。`,
        { id: s.id, actions, catalog, ...(args.verbs === true ? { verbs: VERBS.map(v => ({ ...v })) } : {}) });
    }),
    define("campaign_sortie_preview", "唯讀出戰情報：地圖、敵軍、目標、輪數與裂縫；sortie 與 begin 相同。", {
      id: idSchema, sortie: { type: "object", properties: { units: { type: "array", items: { type: "object", properties: {
        mech: { type: "string" }, seats: { type: "object" }, controlMode: { type: "string" }, crew: { type: "string", enum: ["ai"], description: "AI 自駕或輔駕；空座位時以 scripted 控制" },
      } } } } },
    }, ["id"], args => {
      const s = session(args.id), info = preview(s, sortieInput(s, args.sortie));
      const prompt = promptInfo(render(s.state, [], env.world().world, env.world().db));
      return "error" in info ? errorResult(`${info.summary}${prompt ? `\n${prompt.summary}` : ""}`, { error: info.error, ...(prompt ? { prompt } : {}) })
        : okResult(info.summary, { id: s.id, preview: info });
    }),
    define("campaign_sortie_begin", "建立戰役互動出戰；用 battle_* 指揮，結束後 campaign_sortie_finish 回寫，或 campaign_sortie_cancel 取消。", {
      id: idSchema, sortie: { type: "object", properties: { units: { type: "array", items: { type: "object", properties: {
        mech: { type: "string" }, seats: { type: "object" }, controlMode: { type: "string" }, crew: { type: "string", enum: ["ai"], description: "AI 自駕或輔駕；空座位時以 scripted 控制" },
      } } } } }, spectate: { type: "boolean" }, autoAdvance: { type: "boolean", default: true },
    }, ["id"], args => {
      const s = session(args.id); requireIdle(s);
      const cmd = sortieInput(s, args.sortie), { db, world } = env.world();
      const captured: { setup?: Extract<ReturnType<typeof sortieBattleSetup>, { ok: true }>; sortie?: BattleRecord["sortie"] } = {};
      const output = applyCommand(s.state, db, world, cmd, { battle: (state, ctx, sortie) => {
        const setup = sortieBattleSetup(state, ctx, sortie); if (!setup.ok) return setup;
        captured.setup = setup; captured.sortie = structuredClone(sortie);
        return { ok: false, error: "mcp-deferred" };
      } });
      if (!captured.setup || !captured.sortie) {
        const error = output.result.ok ? "無法建立戰場" : output.result.error;
        const prompt = promptInfo(render(s.state, [], world, db));
        return errorResult(`${error}：${explain(error)}${prompt ? `\n${prompt.summary}` : ""}`, { error, ...(prompt ? { prompt } : {}) });
      }
      const b = hub.build(captured.setup.sim, captured.setup.seed, "player", args.spectate === true, args.autoAdvance !== false);
      b.campaign = true;
      if (b.autoAdvance) hub.advance(b, "human", Number.MAX_SAFE_INTEGER);
      const observed = hub.register(b), battle = observed.structuredContent!.id as string;
      s.pending = { battle, cmd, sortie: captured.sortie };
      return okResult(`戰役 ${s.id} 互動出戰：${battle}\n${(observed.content[0] as { text: string }).text}`,
        { ...observed.structuredContent, campaign: s.id, battle, sortie: structuredClone(captured.sortie) });
    }),
    define("campaign_sortie_finish", "把已結束的互動出戰戰果回寫戰役，保留戰鬥供 battle_events 查閱。", { id: idSchema }, ["id"], args => {
      const s = session(args.id), pending = s.pending;
      if (!pending) throw new ToolError("沒有進行中的互動出戰；已回寫的戰鬥不能再次 finish。");
      const b = hub.find(pending.battle);
      if (!b) throw new ToolError(`戰鬥 ${pending.battle} 已關閉；請 campaign_sortie_cancel 解除出戰。`);
      if (b.applied) throw new ToolError("此戰鬥已回寫，不能再次 finish。");
      if (!b.session.outcome()) throw new ToolError(`戰鬥尚未結束：第 ${b.session.state.round} 輪，輪到 ${b.session.currentActor() ?? "無"}（${b.session.isHumanTurn() ? "玩家" : "AI"}）。`);
      const result = b.session.result();
      if (!result) throw new ToolError("戰果尚未產生。");
      const output = execute(s, pending.cmd, false, (state, ctx, sortie) => {
        if (canonicalJson(sortie) !== canonicalJson(pending.sortie)) return { ok: false, error: "sortie-mismatch" };
        const valid = validateSortie(state, ctx, sortie); if (!valid.ok) return valid;
        generateScenario(state, ctx, sortie);
        const copy = structuredClone(result);
        // runBattle 額外附上完整事件；營運戰後處理也會消費它，需保持同一戰果格式。
        copy.events = structuredClone(b.session.state.log.events);
        for (const unit of copy.units) if (state.mechs[unit.id] && sortie.units.some(u => u.mech === unit.id && u.controlMode === "instinct")) unit.state.frame = state.mechs[unit.id]!.frame;
        applySortieResult(state, ctx, sortie, copy);
        return { ok: true, result: copy };
      });
      if (!output.isError) { b.applied = true; delete s.pending; }
      return output;
    }),
    define("campaign_sortie_cancel", "取消互動出戰並關閉戰鬥，戰役狀態不變。", { id: idSchema }, ["id"], args => {
      const s = session(args.id);
      if (!s.pending) throw new ToolError("沒有進行中的互動出戰。");
      const battle = s.pending.battle; hub.close(battle); delete s.pending;
      return okResult(`已取消 ${battle}；戰役 ${s.id} 狀態不變。`, { id: s.id, battle, cancelled: true });
    }),
    define("campaign_act", "送 command 或 text，二擇一；出戰由 AI 結算並保存重播紀錄。", {
      id: idSchema, command: { type: "object", properties: { v: { type: "string", enum: VERBS.map(v => v.v) } }, required: ["v"] },
      text: { type: "string" },
    }, ["id"], args => {
      const s = session(args.id); requireIdle(s);
      if ((args.command !== undefined) === (args.text !== undefined)) throw new ToolError("command 與 text 必須二擇一。");
      let cmd: OpsCommand;
      if (args.text !== undefined) {
        if (typeof args.text !== "string") throw new ToolError("text 必須是文字。");
        const parsed = parse(args.text, s.state, env.world().world);
        if ("error" in parsed) {
          const candidates = [...new Set([...(parsed.candidates ?? []), ...availableIds(env, s.state, args.text)])].slice(0, 10);
          return errorResult(`${parsed.error}\n可用的 id：${candidates.join("、") || "目前沒有符合此類指令的項目"}`, { error: parsed.error, candidates });
        }
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
    }, ["id", "days"], args => {
      const s = session(args.id); requireIdle(s);
      return execute(s, { v: "wait", days: integer(args.days, "days", 1) }, true);
    }),
    define("campaign_auto", "全自動跑 N 蝕月，回每月摘要、最終帳本與 hash；不建立互動 session。", {
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
      return okResult(`自動完成 ${months} 蝕月（${policy}）：現金 ${money(final.cash)}、債務 ${money(final.debt)}、人數 ${final.persons}；${output.commands.length} 條指令；hash=${hash}。`,
        { summary: output.summary, final, commandCount: output.commands.length, hash });
    }),
    define("campaign_save", "回傳可重播的 blob；可選 path 寫入檔案（相對專案根或絕對路徑）。", {
      id: idSchema, path: { type: "string" },
    }, ["id"], args => {
      const s = session(args.id), blob = createCampaignBlob(s.start, s.seed, s.commands, s.state);
      const path = filePath(args.path);
      if (path) writeFileSync(path, serializeCampaign(blob));
      const bytes = new TextEncoder().encode(serializeCampaign(blob)).length;
      const warning = !path && bytes > 200 * 1024 ? "警告：blob 超過 200 KB，建議用 campaign_save 的 path 寫檔，再以 campaign_load 的 path 載入。" : undefined;
      return okResult(`戰役 ${s.id} 已存檔${path ? `至 ${path}` : "（blob）"}；共 ${s.commands.length} 條指令。${warning ? `\n${warning}` : ""}`,
        { id: s.id, blob, bytes, ...(warning ? { warning } : {}), ...(path ? { path } : {}) });
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
