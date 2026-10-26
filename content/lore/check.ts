// content/lore 驗證：node content/lore/check.ts（Node ≥ 22，零依賴，只用可擦除的 TS 語法）
// 檢查：JSON 合法、必填欄、id 與檔名一致、枚舉值、交叉引用存在、gameRefs 格式、timeline 排序與 era 存在、可見度標記。
import fs from "node:fs";
import path from "node:path";

const root = path.dirname(new URL(import.meta.url).pathname);
const errors: string[] = [];
const warns: string[] = [];

type Rec = Record<string, unknown>;
type Spec = { dir: string; kind: string; required: string[]; optional: string[]; refs: (r: Rec, where: string) => void };

const ids = new Set<string>();
const docs: { file: string; kind: string; rec: Rec }[] = [];

const STANCES = new Set(["同盟", "友好", "中立", "緊張", "敵對"]);
const FACTION_TYPES = new Set(["大勢力", "小勢力", "獵團", "企業", "宗教", "軍事", "其他"]);
const CHAR_KINDS = new Set(["human", "soul", "other"]);
const WORLDS = new Set(["earth", "moon", "orbit"]);
const CONTINENTS = new Set(["亞洲", "歐洲", "非洲", "北美", "南美", "大洋洲", "南極", "月面", "軌道"]);
const DATE_RE = /^-?\d{1,5}(-\d{2}){0,2}$/;
// 可見度（隱藏真相標記）：public 外界公認（預設）／rumor 外界只當傳聞／hidden 外界不知道（百科不顯示）。
const VIS = new Set(["public", "rumor", "hidden"]);
const COMMON_OPTIONAL = ["visibility", "fieldVisibility", "secrets"];
const NO_FIELD_VIS = new Set(["id", "name", "visibility", "fieldVisibility", "secrets"]);
const GAMEREF_RE = /^base:[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/;

function isStrArr(v: unknown): v is string[] { return Array.isArray(v) && v.every((x) => typeof x === "string"); }

function readDir(dir: string): string[] {
  const p = path.join(root, dir);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(dir, f));
}

function loadJson(file: string): Rec | null {
  try {
    const v = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    if (typeof v !== "object" || v === null || Array.isArray(v)) { errors.push(`${file}: 不是 JSON 物件`); return null; }
    return v as Rec;
  } catch (e) { errors.push(`${file}: JSON 解析失敗：${(e as Error).message}`); return null; }
}

function ref(id: unknown, kind: string, where: string) {
  if (typeof id !== "string") { errors.push(`${where}: 引用不是字串 (${JSON.stringify(id)})`); return; }
  if (!id.startsWith(kind + "/")) { errors.push(`${where}: 引用 ${id} 應為 ${kind}/…`); return; }
  if (!ids.has(id)) errors.push(`${where}: 引用 ${id} 不存在`);
}
function refArr(v: unknown, kind: string, where: string) {
  if (!isStrArr(v)) { errors.push(`${where}: 應為字串陣列`); return; }
  for (const x of v) ref(x, kind, where);
}
function checkGameRefs(v: unknown, where: string) {
  if (!isStrArr(v)) { errors.push(`${where}.gameRefs: 應為字串陣列`); return; }
  for (const x of v) if (!GAMEREF_RE.test(x)) errors.push(`${where}.gameRefs: ${x} 格式應為 base:<kind>/<name>`);
}
function checkVis(v: unknown, where: string) {
  if (v !== undefined && !VIS.has(v as string)) errors.push(`${where}.visibility: ${JSON.stringify(v)} 應為 public／rumor／hidden`);
}
// 每種檔共用的可見度欄：visibility（整筆）、fieldVisibility（頂層欄 → 可見度）、secrets（不公開的真相或傳聞）。
function checkVisibility(rec: Rec, where: string) {
  checkVis(rec.visibility, where);
  const fv = rec.fieldVisibility;
  if (fv !== undefined) {
    if (typeof fv !== "object" || fv === null || Array.isArray(fv)) errors.push(`${where}.fieldVisibility: 應為物件`);
    else for (const [k, v] of Object.entries(fv as Rec)) {
      if (NO_FIELD_VIS.has(k)) errors.push(`${where}.fieldVisibility.${k}: 這欄不能單獨標可見度`);
      else if (!(k in rec)) errors.push(`${where}.fieldVisibility.${k}: 條目沒有這欄`);
      if (!VIS.has(v as string)) errors.push(`${where}.fieldVisibility.${k}: ${JSON.stringify(v)} 應為 public／rumor／hidden`);
    }
  }
  const sec = rec.secrets;
  if (sec === undefined) return;
  if (!Array.isArray(sec)) { errors.push(`${where}.secrets: 應為陣列`); return; }
  for (const [i, s] of (sec as Rec[]).entries()) {
    const w = `${where}.secrets[${i}]`;
    if (typeof s !== "object" || s === null) { errors.push(`${w}: 應為物件`); continue; }
    if (typeof s.text !== "string" || !s.text) errors.push(`${w}.text: 缺或非字串`);
    if (s.visibility !== "rumor" && s.visibility !== "hidden") errors.push(`${w}.visibility: 必填，應為 rumor／hidden`);
    if (s.date !== undefined && !DATE_RE.test(s.date as string)) errors.push(`${w}.date: ${s.date} 格式錯`);
    if (s.note !== undefined && typeof s.note !== "string") errors.push(`${w}.note: 應為字串`);
    if (s.knownBy !== undefined) {
      if (!isStrArr(s.knownBy)) errors.push(`${w}.knownBy: 應為字串陣列`);
      else for (const id of s.knownBy) ref(id, id.split("/")[0] === "character" ? "character" : "faction", `${w}.knownBy`);
    }
    for (const k of Object.keys(s)) if (!["text", "visibility", "date", "knownBy", "note"].includes(k)) warns.push(`${w}: 未登記欄位 ${k}`);
  }
}
function checkBody(rec: Rec, where: string) {
  const b = rec.body;
  if (typeof b !== "string") return;
  const n = b.replace(/\s/g, "").length;
  if (n < 200) warns.push(`${where}: body 只有 ${n} 字（目標 300–1500）`);
  if (n > 2200) warns.push(`${where}: body ${n} 字（目標 300–1500）`);
  if (/<[a-z][^>]*>/i.test(b)) errors.push(`${where}: body 含 HTML`);
}

const specs: Spec[] = [
  {
    dir: "factions", kind: "faction",
    required: ["id", "name", "aka", "type", "scale", "founded", "hq", "leaders", "ideology", "summary", "body", "relations", "gameRefs", "tags"],
    optional: ["places", "ancientMech", "mechSeries", "mercPolicy"],
    refs(r, w) {
      if (!FACTION_TYPES.has(r.type as string)) errors.push(`${w}.type: ${r.type} 不在枚舉內`);
      refArr(r.leaders, "character", `${w}.leaders`);
      if (!Array.isArray(r.relations)) errors.push(`${w}.relations: 應為陣列`);
      else for (const [i, rel] of (r.relations as Rec[]).entries()) {
        ref(rel.faction, "faction", `${w}.relations[${i}]`);
        if (rel.faction === r.id) errors.push(`${w}.relations[${i}]: 指向自己`);
        if (!STANCES.has(rel.stance as string)) errors.push(`${w}.relations[${i}].stance: ${rel.stance} 不在枚舉內`);
        if (typeof rel.note !== "string") errors.push(`${w}.relations[${i}].note: 缺`);
        checkVis(rel.visibility, `${w}.relations[${i}]`);
      }
      if (r.places !== undefined) refArr(r.places, "place", `${w}.places`);
      if (r.ancientMech !== undefined) {
        const a = r.ancientMech as Rec;
        if (typeof a !== "object" || a === null) errors.push(`${w}.ancientMech: 應為物件`);
        else {
          for (const k of ["name", "foundDate", "doctrine"]) if (typeof a[k] !== "string") errors.push(`${w}.ancientMech.${k}: 缺或非字串`);
          ref(a.foundAt, "place", `${w}.ancientMech.foundAt`);
          if (a.pilot !== null && a.pilot !== undefined) ref(a.pilot, "character", `${w}.ancientMech.pilot`);
          if (a.gameRef !== null && a.gameRef !== undefined && !GAMEREF_RE.test(a.gameRef as string)) errors.push(`${w}.ancientMech.gameRef 格式`);
          checkVis(a.visibility, `${w}.ancientMech`);
        }
      }
      if (r.mechSeries !== undefined && !isStrArr(r.mechSeries)) errors.push(`${w}.mechSeries: 應為字串陣列`);
      if (r.mercPolicy !== undefined) {
        const m = r.mercPolicy as Rec;
        for (const k of ["generosity", "reliability"]) {
          const v = m?.[k];
          if (typeof v !== "number" || v < 1 || v > 5) errors.push(`${w}.mercPolicy.${k}: 應為 1–5`);
        }
        if (typeof m?.note !== "string") errors.push(`${w}.mercPolicy.note: 缺`);
      }
      if (r.type === "大勢力") for (const h of ["## 軍事組織與作戰風格", "## 對傭兵：態度與補給", "## 藍本古代機與研發路線", "## 外交"])
        if (!(r.body as string).includes(h)) warns.push(`${w}: 大勢力 body 缺小節「${h}」`);
    },
  },
  {
    dir: "characters", kind: "character",
    required: ["id", "name", "aka", "born", "faction", "role", "summary", "body", "relations", "events", "gameRefs", "tags"],
    optional: ["died", "kind", "mech"],
    refs(r, w) {
      if (r.faction !== null) ref(r.faction, "faction", `${w}.faction`);
      if (!Array.isArray(r.relations)) errors.push(`${w}.relations: 應為陣列`);
      else for (const [i, rel] of (r.relations as Rec[]).entries()) {
        ref(rel.character, "character", `${w}.relations[${i}]`);
        if (rel.character === r.id) errors.push(`${w}.relations[${i}]: 指向自己`);
        if (typeof rel.relation !== "string" || typeof rel.note !== "string") errors.push(`${w}.relations[${i}]: 缺 relation／note`);
        checkVis(rel.visibility, `${w}.relations[${i}]`);
      }
      refArr(r.events, "event", `${w}.events`);
      if (r.kind !== undefined && !CHAR_KINDS.has(r.kind as string)) errors.push(`${w}.kind: ${r.kind} 不在枚舉內`);
    },
  },
  {
    dir: "events", kind: "event",
    required: ["id", "name", "date", "period", "summary", "body", "factions", "characters", "places", "consequences", "tags"],
    optional: ["kind", "occurs"],
    refs(r, w) {
      if (r.occurs !== undefined && r.occurs !== "possible") errors.push(`${w}.occurs: ${JSON.stringify(r.occurs)} 應為 possible`);
      if (!DATE_RE.test(r.date as string)) errors.push(`${w}.date: ${r.date} 不是 YYYY／YYYY-MM／YYYY-MM-DD`);
      ref(r.period, "era", `${w}.period`);
      refArr(r.factions, "faction", `${w}.factions`);
      refArr(r.characters, "character", `${w}.characters`);
      refArr(r.places, "place", `${w}.places`);
      if (!isStrArr(r.consequences)) errors.push(`${w}.consequences: 應為字串陣列`);
    },
  },
  {
    dir: "places", kind: "place",
    required: ["id", "name", "region", "continent", "summary", "body", "factions", "gameRefs", "tags"],
    optional: ["aka", "world", "kind", "status2108"],
    refs(r, w) {
      refArr(r.factions, "faction", `${w}.factions`);
      if (r.world !== undefined && !WORLDS.has(r.world as string)) errors.push(`${w}.world: ${r.world} 不在枚舉內`);
      if (!CONTINENTS.has(r.continent as string)) errors.push(`${w}.continent: ${r.continent} 不在枚舉內`);
    },
  },
  {
    dir: "eras", kind: "era",
    required: ["id", "name", "from", "to", "summary", "body"],
    optional: [],
    refs() {},
  },
];

// 第一輪：載入、必填、id／檔名
for (const s of specs) {
  for (const file of readDir(s.dir)) {
    const rec = loadJson(file);
    if (!rec) continue;
    const base = path.basename(file, ".json");
    const expect = `${s.kind}/${base}`;
    if (rec.id !== expect) errors.push(`${file}: id ${JSON.stringify(rec.id)} 應為 ${expect}`);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(base)) errors.push(`${file}: 檔名須為 kebab-case`);
    for (const k of s.required) if (!(k in rec)) errors.push(`${file}: 缺必填欄 ${k}`);
    for (const k of Object.keys(rec)) if (!s.required.includes(k) && !s.optional.includes(k) && !COMMON_OPTIONAL.includes(k)) warns.push(`${file}: 未登記欄位 ${k}`);
    for (const k of ["name", "summary", "body"]) if (k in rec && typeof rec[k] !== "string") errors.push(`${file}.${k}: 應為字串`);
    if ("aka" in rec && !isStrArr(rec.aka)) errors.push(`${file}.aka: 應為字串陣列`);
    if ("tags" in rec && !isStrArr(rec.tags)) errors.push(`${file}.tags: 應為字串陣列`);
    if ("gameRefs" in rec) checkGameRefs(rec.gameRefs, file);
    if (typeof rec.id === "string") { if (ids.has(rec.id)) errors.push(`${file}: id 重複`); ids.add(rec.id); }
    docs.push({ file, kind: s.kind, rec });
  }
}
// 第二輪：引用
for (const d of docs) {
  const s = specs.find((x) => x.kind === d.kind)!;
  s.refs(d.rec, d.file);
  checkVisibility(d.rec, d.file);
  checkBody(d.rec, d.file);
}

// timeline
const tlFile = "timeline.json";
const tl = fs.existsSync(path.join(root, tlFile)) ? loadJson(tlFile) : (errors.push(`${tlFile}: 不存在`), null);
let tlCount = 0;
if (tl) {
  if (tl.contract !== "lore-timeline/1") errors.push(`${tlFile}: contract 應為 lore-timeline/1`);
  if (!Array.isArray(tl.entries)) errors.push(`${tlFile}: entries 應為陣列`);
  else {
    const key = (d: string) => d.split("-").length && (() => {
      const neg = d.startsWith("-");
      const parts = (neg ? d.slice(1) : d).split("-").map(Number);
      const y = neg ? -parts[0] : parts[0];
      return y * 10000 + (parts[1] ?? 0) * 100 + (parts[2] ?? 0);
    })();
    let prev = -Infinity;
    for (const [i, e] of (tl.entries as Rec[]).entries()) {
      const w = `${tlFile}.entries[${i}]`;
      tlCount++;
      for (const k of ["date", "title", "summary", "era", "factions", "tags"]) if (!(k in e)) errors.push(`${w}: 缺 ${k}`);
      if (!DATE_RE.test(e.date as string)) { errors.push(`${w}.date: ${e.date} 格式錯`); continue; }
      const k = key(e.date as string);
      if (k < prev) errors.push(`${w}: 日期 ${e.date} 未排序`);
      prev = k;
      ref(e.era, "era", `${w}.era`);
      if (e.event !== undefined && e.event !== null) ref(e.event, "event", `${w}.event`);
      if ("factions" in e) refArr(e.factions, "faction", `${w}.factions`);
      if ("tags" in e && !isStrArr(e.tags)) errors.push(`${w}.tags: 應為字串陣列`);
      checkVis(e.visibility, w);
      if (k > 21089999 && !(e.tags as string[] | undefined)?.includes("rumor")) errors.push(`${w}: 2108 之後的條目須帶 tag rumor`);
    }
  }
}

// 每個事件至少被年表引用一次（警告）
if (tl && Array.isArray(tl.entries)) {
  const covered = new Set((tl.entries as Rec[]).map((e) => e.event).filter(Boolean));
  for (const d of docs) if (d.kind === "event" && !covered.has(d.rec.id)) warns.push(`${d.file}: 未出現在 timeline`);
}

const perCont: Record<string, number> = {};
for (const d of docs) if (d.kind === "place") perCont[d.rec.continent as string] = (perCont[d.rec.continent as string] ?? 0) + 1;
for (const c of CONTINENTS) if ((perCont[c] ?? 0) < 3) warns.push(`places: 大洲「${c}」只有 ${perCont[c] ?? 0} 個地點（目標 ≥ 3）`);
console.log(`places per continent: ${JSON.stringify(perCont)}`);
const counts: Record<string, number> = {};
for (const d of docs) counts[d.kind] = (counts[d.kind] ?? 0) + 1;
console.log(`counts: ${JSON.stringify(counts)} timeline=${tlCount}`);
for (const w of warns) console.log(`WARN ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`errors=${errors.length} warnings=${warns.length}`);
process.exit(errors.length ? 1 : 0);
