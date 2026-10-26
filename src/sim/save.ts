import type { ContentDB } from "../content/contentdb.ts";
import { CONTENT_KINDS } from "../core/ids.ts";
import type { Id } from "../core/ids.ts";
import type { BattleState, Command } from "../core/types-state.ts";
import type { BattleSetup } from "../rules/index.ts";
import { canonicalJson, fnv1a64 } from "../core/eventlog.ts";
import { scenarioToSetup } from "./run.ts";
import { replay } from "./replay.ts";

export type SaveFile = { version: 1; contentPacks: { id: string; version: string; hash: string }[];
  scenario: Id | null; seed: number; commands: Command[]; setup?: BattleSetup;
  snapshot?: BattleState; campaignBlob?: unknown };

export function packHash(db: ContentDB, packId: string): string {
  const pack = db.packs.find(p => p.id === packId);
  if (!pack) throw new Error(`未知內容包：${packId}`);
  const defs = Object.fromEntries(CONTENT_KINDS.map(kind => [kind, db.all(kind).filter(def => def.id.startsWith(`${packId}:`))]));
  // SPEC-GAP：ContentDB 已合併規則／登記表，沒有來源資訊；每包納入完整有效表，保守偵測跨包變動。
  return fnv1a64(canonicalJson({ pack, defs, rules: db.rules, registries: db.registries }));
}

export function createSave(db: ContentDB, a: { scenario: Id | null; seed: number; commands: Command[];
  setup?: BattleSetup; snapshot?: BattleState; campaignBlob?: unknown }): SaveFile {
  return { version: 1, contentPacks: db.packs.map(pack => ({ id: pack.id, version: pack.version, hash: packHash(db, pack.id) })),
    ...structuredClone(a) };
}

type ObjectValue = Record<string, unknown>;
function object(v: unknown): v is ObjectValue { return v !== null && typeof v === "object" && !Array.isArray(v); }

// SPEC-GAP：非有限數字用 $sim:number 編碼；原有 $sim 欄位的物件轉義，campaignBlob 不會撞標記。
function encode(v: unknown): unknown {
  if (typeof v === "number" && !Number.isFinite(v)) return { $sim: "number", value: String(v) };
  if (Array.isArray(v)) return v.map(encode);
  if (object(v)) {
    const entries = Object.entries(v).filter(([, value]) => value !== undefined).map(([key, value]) => [key, encode(value)]);
    return Object.hasOwn(v, "$sim") ? { $sim: "object", value: entries } : Object.fromEntries(entries);
  }
  return v;
}

function decode(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(decode);
  if (!object(v)) return v;
  if (v.$sim === "number" && Object.keys(v).length === 2) {
    if (v.value === "Infinity") return Infinity;
    if (v.value === "-Infinity") return -Infinity;
    if (v.value === "NaN") return NaN;
    throw new Error("非法數字編碼");
  }
  if (v.$sim === "object" && Object.keys(v).length === 2 && Array.isArray(v.value)) {
    if (!v.value.every(pair => Array.isArray(pair) && pair.length === 2 && typeof pair[0] === "string")) throw new Error("非法物件編碼");
    return Object.fromEntries(v.value.map(([key, value]) => [key, decode(value)]));
  }
  if (Object.hasOwn(v, "$sim")) throw new Error("未知存檔編碼");
  return Object.fromEntries(Object.entries(v).map(([key, value]) => [key, decode(value)]));
}

const string = (v: unknown): v is string => typeof v === "string";
const integer = (v: unknown): v is number => typeof v === "number" && Number.isSafeInteger(v);
const cell = (v: unknown): boolean => object(v) && integer(v.x) && integer(v.y);
function command(v: unknown): boolean {
  if (!object(v) || !string(v.actor)) return false;
  switch (v.kind) {
    case "move": return Array.isArray(v.path) && v.path.every(cell);
    case "useAbility": return string(v.ability) && (v.target === undefined || (object(v.target)
      && (v.target.unit === undefined || string(v.target.unit)) && (v.target.part === undefined || string(v.target.part))
      && (v.target.cell === undefined || cell(v.target.cell))));
    case "engagePresence": return string(v.target);
    case "end": case "wait": case "eject": case "retreat": return true;
    default: return false;
  }
}
function setupShape(v: unknown): boolean {
  return object(v) && string(v.id) && object(v.map) && integer(v.map.width) && v.map.width > 0
    && integer(v.map.height) && v.map.height > 0 && string(v.map.fill) && Array.isArray(v.map.exits) && v.map.exits.every(cell)
    && (v.map.cells === undefined || (Array.isArray(v.map.cells) && v.map.cells.every(c => object(c) && cell(c.at) && string(c.terrain))))
    && Array.isArray(v.units) && v.units.every(u => object(u) && string(u.id) && string(u.owner) && cell(u.pos)
      && (string(u.frame) || (object(u.monster) && string(u.monster.species) && string(u.monster.grade)))
      && (u.presence === undefined || (object(u.presence) && string(u.presence.aura)
        && (u.presence.engageable === undefined || typeof u.presence.engageable === "boolean")
        && (u.presence.captureLocked === undefined || typeof u.presence.captureLocked === "boolean")))
      && (u.persons === undefined || (Array.isArray(u.persons) && u.persons.every(p => object(p) && string(p.id) && string(p.def) && string(p.seat)))))
    && Array.isArray(v.objectives) && v.objectives.every(o => object(o) && string(o.kind) && object(o.params) && string(o.for) && string(o.onComplete))
    && (v.maxRounds === undefined || (integer(v.maxRounds) && v.maxRounds > 0));
}
function snapshotShape(v: unknown): boolean {
  return object(v) && integer(v.round) && Array.isArray(v.order) && v.order.every(string)
    && object(v.units) && Object.values(v.units).every(u => object(u) && string(u.id) && string(u.frame)
      && string(u.owner) && cell(u.pos) && object(u.parts) && object(u.pools) && Array.isArray(u.contribs) && Array.isArray(u.effects))
    && object(v.persons) && Object.values(v.persons).every(p => object(p) && string(p.id) && string(p.def)
      && object(p.pools) && Array.isArray(p.contribs) && Array.isArray(p.effects))
    && object(v.map) && integer(v.map.width) && integer(v.map.height) && Array.isArray(v.map.terrain) && v.map.terrain.every(string)
    && object(v.factions) && object(v.knowledge) && object(v.rng) && string(v.rng.state) && string(v.rng.inc)
    && (v.rt === undefined || (object(v.rt) && (v.rt.presences === undefined || (object(v.rt.presences)
      && Object.values(v.rt.presences).every(p => object(p) && string(p.aura)
        && (p.engageable === undefined || typeof p.engageable === "boolean")
        && (p.captureLocked === undefined || typeof p.captureLocked === "boolean")
        && (p.engaged === undefined || typeof p.engaged === "boolean"))))))
    && Array.isArray(v.pending) && object(v.log) && Array.isArray(v.log.events)
    && v.log.events.every(e => object(e) && integer(e.seq) && integer(e.round) && string(e.type) && object(e.payload));
}
function validate(v: unknown): asserts v is SaveFile {
  if (!object(v) || v.version !== 1 || !(v.scenario === null || string(v.scenario))
    || !integer(v.seed) || v.seed < 0 || !Array.isArray(v.commands) || !v.commands.every(command)
    || !Array.isArray(v.contentPacks) || !v.contentPacks.every(p => object(p) && string(p.id) && string(p.version)
      && string(p.hash) && /^[0-9a-f]{16}$/.test(p.hash))
    || (v.setup !== undefined && !setupShape(v.setup)) || (v.snapshot !== undefined && !snapshotShape(v.snapshot))
    || (v.scenario === null && v.setup === undefined && v.snapshot === undefined)) throw new Error("存檔形狀或 version 不合");
}

export function serializeSave(save: SaveFile): string {
  validate(save);
  return JSON.stringify(encode(save));
}
export function parseSave(text: string): SaveFile {
  const save: unknown = decode(JSON.parse(text));
  validate(save);
  return save;
}

export function loadSave(db: ContentDB, save: SaveFile, opts?: { verifySnapshot?: boolean }): { state: BattleState; warnings: string[] } {
  validate(save);
  // 載入順序影響未限定 id 的覆蓋，亦屬存檔的內容環境。
  const mismatch = db.packs.length !== save.contentPacks.length || save.contentPacks.some((p, i) =>
    db.packs[i]?.id !== p.id || db.packs[i]?.version !== p.version || packHash(db, p.id) !== p.hash);
  if (mismatch) {
    if (!save.snapshot) throw new Error("內容包版本／hash 不符且無 snapshot");
    return { state: structuredClone(save.snapshot), warnings: ["內容包版本／hash 不符；以 snapshot 載入，未驗證重播。"] };
  }
  if (save.snapshot && !opts?.verifySnapshot) return { state: structuredClone(save.snapshot), warnings: [] };
  const setup = save.setup ?? (save.scenario ? scenarioToSetup(db, save.scenario, save.seed).setup : undefined);
  if (!setup) throw new Error("重播需要 setup 或 scenario");
  const state = replay(db, setup, save.seed, save.commands);
  if (save.snapshot && canonicalJson(encode(state)) !== canonicalJson(encode(save.snapshot))) throw new Error("snapshot 與重播狀態不符");
  return { state, warnings: [] };
}
