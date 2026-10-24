import type { CampaignState, Job, OpsCommand, Sortie } from "../state/types.ts";
import type { WorldDB } from "../content/worlddb.ts";
import { findVerb, LEGAL_VERBS, VERBS } from "./verbs.ts";

export type ParseError = { error: string; candidates?: string[] };
import { entityName, textContext } from "./names.ts";
import type { TextState } from "./names.ts";
import { marketListings } from "../world/market.ts";
import { allPlaces, placeDef } from "../world/places.ts";
import { peekCrew } from "../crew/shared.ts";
export { entityName } from "./names.ts";
export type { TextState } from "./names.ts";
type Candidate = { id: string; names: string[] };
type Domain = "room" | "person" | "mech" | "place" | "contract" | "job" | "market" | "research" | "item" | "candidate" | "actor" | "all";

function candidates(domain: Domain, state: TextState, world: WorldDB): Candidate[] {
  const result: Candidate[] = [];
  const add = (id: string, ...names: string[]) => result.push({ id, names: [id, id.replace(/^[^:]+:/, ""), id.split("/").at(-1)!, entityName(id, state, world), ...names] });
  const include = (d: Domain) => domain === d || domain === "all";
  if (include("room")) for (const def of world.all("room")) add(def.id.split("/").at(-1)!, def.id, def.title, `room/${def.id.split("/").at(-1)!}`);
  if (include("actor")) for (const actor of Object.values(state.actors).sort((a, b) => a.id.localeCompare(b.id))) add(actor.id);
  if (include("person")) for (const id of Object.keys(state.roster.persons).sort()) add(id, state.roster.persons[id]!.def);
  if (include("mech")) for (const id of Object.keys(state.mechs).sort()) add(id, state.mechs[id]!.frame.split("/").at(-1)!);
  if (include("place")) for (const def of allPlaces(state, { world })) add(def.id, def.name);
  if (include("contract")) for (const id of Object.keys(state.contracts).sort()) {
    const c = state.contracts[id]!;
    add(id, c.template.split("/").at(-1)!, placeDef(state, { world }, c.target.place)?.name ?? "");
  }
  if (include("job")) for (const job of state.jobs) add(job.id);
  const ctx = textContext(world);
  if (include("candidate")) for (const c of Object.values(peekCrew(state)?.candidates ?? {})) add(c.id, ctx?.db.get("person", c.person.def)?.name ?? "應徵者");
  if (include("market")) for (const def of world.all("market")) add(def.id, placeDef(state, { world }, def.place)?.name ?? "");
  if (include("research")) for (const def of world.all("research")) add(def.id, def.name);
  if (include("item")) {
    for (const item of state.inventory.components) add(item.id, item.def);
    if (ctx) for (const market of world.all("market")) for (const { item } of marketListings(state, ctx, market)) add(item.def);
  }
  return result;
}
function resolve(word: string, domain: Domain, state: TextState, world: WorldDB): string {
  const entries = candidates(domain, state, world);
  const exactId = entries.find(c => c.id === word);
  if (exactId) return exactId.id;
  const exact = entries.filter(c => c.names.includes(word));
  const matches = [...new Map((exact.length ? exact : entries.filter(c => c.names.some(n => n.startsWith(word)))).map(c => [c.id, c])).values()].sort((a, b) => a.id.localeCompare(b.id));
  if (matches.length === 1) return matches[0]!.id;
  if (matches.length > 1) throw { error: `你是指：${matches.map(c => `${entityName(c.id, state, world)}（${c.id}）`).join("、")}`, candidates: matches.slice(0, 8).map(c => c.id) } satisfies ParseError;
  if (domain === "actor") return word; // 存檔重播可引用尚未生成的 id；執行時再驗存在。
  // SPEC-GAP：招募候選池及 core 物品 DB 不在 parse 簽名內；明確 id 留給執行端驗存在。
  if ((domain === "candidate" || domain === "item") && /^(?:[\w-]+:[\w-]+\/|[\w-]+\/|[\w]+-\d|stock:)[\w./:-]*$/.test(word)) return word;
  throw { error: `找不到${word}。`, candidates: [...new Map(entries.map(c => [c.id, c])).values()].slice(0, 8).map(c => `${entityName(c.id, state, world)}（${c.id}）`) } satisfies ParseError;
}

// 引號字串與 JSON 物件各為一個參數；不執行輸入文字。
function tokenize(line: string): string[] {
  const tokens: string[] = [];
  for (let i = 0; i < line.length;) {
    if (/\s/.test(line[i]!)) { i++; continue; }
    const start = i;
    if (line[i] === '"') {
      i++;
      while (i < line.length && line[i] !== '"') { if (line[i] === "\\") i++; i++; }
      if (i >= line.length) throw new Error("引號未結束");
      tokens.push(JSON.parse(line.slice(start, ++i)) as string);
    } else if (line[i] === "{" || line[i] === "[") {
      let depth = 0, quoted = false;
      do {
        const ch = line[i++]!;
        if (quoted && ch === "\\") { i++; continue; }
        if (ch === '"') quoted = !quoted;
        if (!quoted) { if (ch === "{" || ch === "[") depth++; if (ch === "}" || ch === "]") depth--; }
      } while (i < line.length && (depth > 0 || quoted));
      if (depth || quoted) throw new Error("JSON 未結束");
      tokens.push(line.slice(start, i));
    } else {
      while (i < line.length && !/\s/.test(line[i]!)) i++;
      tokens.push(line.slice(start, i));
    }
    if (i < line.length && !/\s/.test(line[i]!)) throw new Error("參數間需要空白");
  }
  return tokens;
}

const jobKinds = ["repair", "rebuild", "research", "graft", "incubate", "install", "mod", "restrain", "mount", "embalm", "prune"];
function structured<T>(text: string, kind: "job" | "sortie"): T {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("需要 JSON 物件");
  const allowed = kind === "job" ? ["id", "kind", "target", "needHours", "doneHours", "materials", "paid", "priority", "part", "layer", "component"]
    : ["id", "day", "contract", "loc", "place", "rift", "trigger", "units", "supplies", "injected", "actors", "ambush", "operation"];
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`未知欄位 ${key}`);
  const v = value as Record<string, unknown>;
  for (const key of ["id", "target", "part", "component", "contract", "place", "rift"]) if (key in v && typeof v[key] !== "string") throw new Error(`${key} 必須是 id／文字`);
  for (const key of ["needHours", "doneHours", "priority", "layer", "day"]) if (key in v && (typeof v[key] !== "number" || !Number.isFinite(v[key]))) throw new Error(`${key} 必須是有限數字`);
  if ("kind" in v && !jobKinds.includes(v.kind as string)) throw new Error("未知工作種類");
  if ("paid" in v && typeof v.paid !== "boolean") throw new Error("paid 必須是布林值");
  if ("trigger" in v && !["contract", "ambush", "defend", "ruin-exit", "collection", "intercept", "operation"].includes(v.trigger as string)) throw new Error("未知出戰來源");
  // 複合編成的遊戲規則由執行端驗證；此處只允許有限、純 JSON 資料。
  const visit = (x: unknown): void => {
    if (typeof x === "number" && !Number.isFinite(x)) throw new Error("數字必須有限");
    if (x && typeof x === "object") for (const [k, child] of Object.entries(x)) {
      if (["__proto__", "constructor", "prototype"].includes(k)) throw new Error("非法欄位");
      visit(child);
    }
  };
  visit(value);
  return value as T;
}

export function parse(line: string, state: CampaignState, world: WorldDB): OpsCommand | ParseError {
  let grammar = "", activeDomain: Domain | undefined;
  try {
    const args = tokenize(line), word = args.shift() ?? "";
    const shortcut = ({ 修: "repair", 研: "research", 植: "graft", 育: "incubate" } as Record<string, string>)[word];
    const v = shortcut ? "queue" : word === "買" || word === "賣" ? "trade" : findVerb(word);
    if (!v) return { error: `未知動詞「${word}」。合法動詞：${LEGAL_VERBS}` };
    grammar = `${VERBS.find(entry => entry.v === v)!.zh} ${VERBS.find(entry => entry.v === v)!.grammar}`;
    const take = () => { const arg = args.shift(); if (arg === undefined || arg === "") throw new Error("缺少參數"); return arg; };
    const id = (domain: Domain) => { activeDomain = domain; return resolve(take(), domain, state, world); };
    const num = (min = 0) => { const raw = take(), n = Number(raw); if (!/^\d+$/.test(raw) || !Number.isSafeInteger(n) || n < min) throw new Error(`需要不小於 ${min} 的整數`); return n; };
    let cmd: OpsCommand;
    switch (v) {
      case "map": case "dock": case "drift": case "save": cmd = { v }; break;
      case "look": cmd = args.length ? { v, target: id("all") } : { v }; break;
      case "talk": { const who = id("person"); cmd = { v, who, ...(args.length ? { topic: args.splice(0).join(" ") } : {}) }; break; }
      case "go": cmd = { v, room: id("room") }; break;
      case "sail": {
        const waypoint = (word: string) => {
          if (/^\d+,\d+$/.test(word)) {
            const [x, y] = word.split(",").map(Number);
            if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y)) throw new Error("座標須為整數");
            return { x: x!, y: y! };
          }
          return resolve(word, "place", state, world);
        };
        const target = take();
        const to = target.startsWith("@") ? { actor: state.actors[target.slice(1)] ? target.slice(1) : resolve(target.slice(1), "actor", state, world) } : waypoint(target);
        if (typeof to === "object" && "actor" in to && !to.actor) throw new Error("缺少行動者名稱");
        cmd = { v, to };
        if (args.length) { if (!["經", "via"].includes(take())) throw new Error("航點前要寫經／via"); cmd.via = args.splice(0).map(waypoint); }
        break;
      }
      case "wait": cmd = { v, days: num(1) }; break;
      case "board": cmd = args.length ? { v, contract: id("contract") } : { v }; break;
      case "accept": case "drop": {
        if (args[0] === "契約") take();
        const contract = id("contract"); cmd = { v, contract };
        if (v === "accept" && args.length) {
          const ask = ({ 加價: "total", 預付: "advance", 按頭: "perHead", total: "total", advance: "advance", perHead: "perHead" } as const)[take() as "加價"];
          if (!ask) throw new Error("議價須為加價、預付或按頭");
          cmd = { v, contract, ask };
        } break;
      }
      case "sortie": cmd = { v, sortie: args.length ? structured<Partial<Sortie>>(take(), "sortie") : {} }; break;
      case "assign": {
        cmd = { v, person: id("person") };
        if (args.length && !["職務", "role"].includes(args[0]!)) {
          const mech = id("mech");
          const seat = args.length && !["職務", "role"].includes(args[0]!) ? take() : Object.keys(state.mechs[mech]!.seats).sort()[0];
          if (!seat) throw new Error("請指定座位");
          cmd.seat = { mech, seat };
        }
        if (args.length) { if (!["職務", "role"].includes(take())) throw new Error("職務前需要 role"); cmd.role = take(); } break;
      }
      case "queue": {
        if (args[0]?.startsWith("{")) cmd = { v, job: structured<Partial<Job>>(take(), "job") };
        else { const kind = shortcut ?? take(); if (!jobKinds.includes(kind)) throw new Error("未知工作種類");
          const target = id(kind === "research" ? "research" : "mech");
          cmd = { v, job: { kind: kind as Job["kind"], target, ...(args.length ? { part: take() } : {}) } }; }
        break;
      }
      case "reorder": cmd = { v, job: id("job"), priority: num() }; break;
      case "devour": cmd = { v, beast: id("mech"), amount: num(1) }; break;
      case "accompany": { const soul = id("person"), by = id("person"); cmd = { v, soul, by, ...(args.length ? { node: take() } : {}) }; break; }
      case "trade": {
        cmd = { v, market: id("market") };
        if (word === "買" || word === "賣") args.unshift(word);
        while (args.length) {
          const mode = take(), key = mode === "買" || mode === "buy" ? "buy" : mode === "賣" || mode === "sell" ? "sell" : undefined;
          if (!key || cmd[key]) throw new Error("買賣清單需各用一次買／賣");
          cmd[key] = [];
          while (args.length && !["買", "賣", "buy", "sell"].includes(args[0]!)) cmd[key]!.push(id("item"));
        } break;
      }
      case "hire": cmd = { v, candidate: id("candidate") }; break;
      case "fire": cmd = { v, person: id("person") }; break;
      case "explore": { const ruin = id("place"); cmd = { v, ruin, party: args.splice(0).map(a => resolve(a, "person", state, world)) }; break; }
      case "wake": cmd = { v, shell: id("mech"), by: id("person") }; break;
      case "choose": cmd = { v, choice: num(1) }; break;
      case "pay": { const account = ["債", "debt"].includes(args[0]!) ? (take(), "debt") : id("person"); cmd = { v, account, amount: num(1) }; break; }
      case "borrow": cmd = { v, amount: num(1) }; break;
      case "load": cmd = { v, slot: num() }; break;
      case "help": cmd = args.length ? { v, v2: take() } : { v }; break;
      default: throw new Error("此動詞尚未提供文字語法");
    }
    if (args.length) throw new Error("多餘參數");
    return cmd;
  } catch (error) {
    if (error && typeof error === "object" && "error" in error) return error as ParseError;
    return { error: `${error instanceof Error ? error.message : "參數錯誤"}。用法：${grammar}。合法動詞：${LEGAL_VERBS}`, ...(activeDomain ? { candidates: candidates(activeDomain, state, world).slice(0, 8).map(c => `${entityName(c.id, state, world)}（${c.id}）`) } : {}) };
  }
}
