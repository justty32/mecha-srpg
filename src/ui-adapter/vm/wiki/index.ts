import { categoryGroup, kindLabel, kindOrder } from "./kinds.ts";
import { extractLinkTargets } from "./markdown.ts";
import { dateSortKey } from "./timeline.ts";
import type { Category, EntryRef, RawFile, TimelineItem, WikiEntry, WikiIndex } from "./types.ts";
import { publicFiles } from "./visibility.ts";

const ID = /^(?:([a-z][a-z0-9-]*):)?([a-z][a-z0-9-]*\/[a-z0-9][a-z0-9._-]*)$/u;
const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => typeof v === "string" ? v : "";
const strings = (v: unknown): string[] => typeof v === "string" ? [v] : Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
const unique = (v: string[]): string[] => [...new Set(v.filter(Boolean))];

export function buildWikiIndex(rawFiles: RawFile[]): WikiIndex {
  // lore 的 hidden 真相在這裡就拿掉，之後的搜尋、引用、年表都只看得到外界版本。
  const files = publicFiles(rawFiles);
  const entries = new Map<string, WikiEntry>();
  const issues: WikiIndex["issues"] = [];
  const timelineFiles: RawFile[] = [];
  const packs = unique(files.map(f => f.pack));
  const resolve: WikiIndex["resolve"] = (raw, fromPack) => {
    const match = ID.exec(raw);
    if (!match) return undefined;
    if (match[1]) return entries.has(raw) ? raw : null;
    const candidates = unique([fromPack, "base", ...packs]);
    return candidates.map(pack => `${pack}:${raw}`).find(key => entries.has(key)) ?? null;
  };
  for (const file of files) {
    const { pack, path, data } = file;
    const issue = (message: string): void => { issues.push({ file: `${pack}/${path}`, message }); };
    if (!record(data)) { issue("JSON 頂層必須是物件"); continue; }
    if (pack === "lore" && path === "timeline.json") {
      if (!Array.isArray(data.entries)) issue("年表 entries 必須是陣列");
      else timelineFiles.push(file);
      continue;
    }
    if (Object.hasOwn(data, "id") && typeof data.id !== "string") { issue("id 必須是字串"); continue; }
    if (data.id === "") { issue("id 不可為空字串"); continue; }
    const id = typeof data.id === "string" ? data.id : `file/${path.replace(/\.json$/u, "")}`;
    // SPEC-GAP：無 id 的根目錄檔沒有目錄名，以 file 分類；有目錄時取最近的父目錄。
    const kind = typeof data.id === "string" ? id.split("/")[0]! : path.split("/").at(-2) ?? "file";
    const key = `${pack}:${id}`;
    if (entries.has(key)) issue(`重複條目 ${key}，採用後一筆`);
    entries.set(key, {
      key, pack, id, kind, category: `${pack}:${kind}`, path, data,
      name: str(data.name) || str(data.title) || id.split("/").at(-1)!,
      aka: unique(strings(data.aka)), summary: str(data.summary) || str(data.description),
      body: str(data.body), tags: unique(strings(data.tags)), facets: {}, refs: [],
    });
  }

  // 名稱先全部定案，後續引用標籤才不會取到暫時的 id。
  const named = new Set<string>();
  const nameEntry = (entry: WikiEntry, visiting = new Set<string>()): string => {
    if (named.has(entry.key) || visiting.has(entry.key)) return entry.name;
    visiting.add(entry.key);
    const data = entry.data as Record<string, unknown>;
    if (!str(data.name) && !str(data.title)) {
      const target = resolve(str(data.species), entry.pack);
      const species = target ? entries.get(target) : undefined;
      if (species) entry.name = [nameEntry(species, visiting), str(data.grade)].filter(Boolean).join(" ");
    }
    visiting.delete(entry.key);
    named.add(entry.key);
    return entry.name;
  };
  for (const entry of entries.values()) nameEntry(entry);

  const makeRef = (raw: string, pack: string, field: string, rel?: string): EntryRef | undefined => {
    const target = resolve(raw, pack);
    if (target === undefined) return undefined;
    return { raw, target, label: target ? entries.get(target)!.name : raw, field, ...(rel ? { rel } : {}) };
  };
  const backlinks: WikiIndex["backlinks"] = new Map();
  for (const entry of entries.values()) {
    const seen = new Set<string>();
    const add = (raw: string, field: string, rel?: string, note?: string): void => {
      const ref = makeRef(raw, entry.pack, field, rel);
      if (ref && note !== undefined) ref.note = note;
      const token = JSON.stringify([field, raw]);
      if (ref && !seen.has(token)) { seen.add(token); entry.refs.push(ref); }
    };
    const scan = (value: unknown, field: string, rel?: string, ancestors = new Set<object>(), note?: string): void => {
      if (typeof value === "string") { add(value, field, rel, note); return; }
      if (typeof value !== "object" || value === null || ancestors.has(value)) return;
      ancestors.add(value);
      if (Array.isArray(value)) value.forEach((v, i) => scan(v, `${field}[${i}]`, rel, ancestors, note));
      else {
        const obj = value as Record<string, unknown>;
        const inRelations = /^relations(?:\[|\.|$)/u.test(field);
        const relation = inRelations ? str(obj.stance) || str(obj.relation) || str(obj.type) || str(obj.kind) || str(obj.rel) || rel : rel;
        const relationNote = inRelations && typeof obj.note === "string" ? obj.note : note;
        for (const [key, v] of Object.entries(obj)) {
          // SPEC-GAP：頂層 id 是本條目身分，body 由 markdown 掃描，不視為整段引用。
          if (!field && (key === "id" || key === "body")) continue;
          const child = field ? `${field}.${key}` : key;
          add(key, child, inRelations && typeof v === "string" ? v : relation, relationNote);
          scan(v, child, relation, ancestors, relationNote);
        }
      }
      ancestors.delete(value);
    };
    scan(entry.data, "");
    for (const raw of extractLinkTargets(entry.body)) add(raw, "body");
    for (const ref of entry.refs) {
      if (ref.target === null) continue;
      const refs = backlinks.get(ref.target) ?? [];
      refs.push({ from: entry.key, fromName: entry.name, field: ref.field, ...(ref.rel ? { rel: ref.rel } : {}) });
      backlinks.set(ref.target, refs);
    }
    const data = entry.data as Record<string, unknown>;
    const facet = (name: string, values: string[]): void => {
      const all = unique(values);
      if (all.length) entry.facets[name] = all;
    };
    facet("grade", [...strings(data.grade), ...strings(data.gradeRange)]);
    const speciesKey = resolve(str(data.species), entry.pack);
    const species = speciesKey ? entries.get(speciesKey)?.data : undefined;
    facet("family", strings(data.family).length ? strings(data.family) : record(species) ? strings(species.family) : []);
    const refFacet = (v: unknown): string[] => strings(v).map(raw => resolve(raw, entry.pack) ?? raw);
    facet("faction", [
      ...entry.refs.flatMap(ref => ref.target && entries.get(ref.target)?.kind === "faction" ? [ref.target] : []),
      ...(entry.pack === "lore" ? [...refFacet(data.faction), ...refFacet(data.factions)] : []),
    ]);
    facet("era", [...refFacet(data.era), ...refFacet(data.period)]);
    facet("cls", strings(data.cls));
    facet("kind", strings(data.kind));
    facet("tag", entry.tags);
  }

  const categories = new Map<string, Category>();
  for (const entry of entries.values()) {
    const existing = categories.get(entry.category);
    if (existing) { existing.count++; continue; }
    categories.set(entry.category, {
      key: entry.category, pack: entry.pack, kind: entry.kind, group: categoryGroup(entry.pack, entry.path),
      label: entry.kind === "event" && entry.pack === "lore" ? "大事件"
        : entry.kind === "event" && entry.pack === "base" ? "營運事件" : kindLabel(entry.kind), count: 1,
    });
  }
  const timeline: TimelineItem[] = [];
  let sourceIndex = 0;
  // SPEC-GAP：未列入 timeline.json 的事件也進年表；有 event 引用則不重複加入。
  const listedEvents = new Set(timelineFiles.flatMap(file => (file.data as { entries: unknown[] }).entries
    .flatMap(row => record(row) ? [resolve(str(row.event), file.pack)] : [])));
  const eventRows = [...entries.values()].filter(e => e.pack === "lore" && e.kind === "event" && !listedEvents.has(e.key))
    .flatMap(e => {
      const data = e.data as Record<string, unknown>;
      return data.date === undefined || data.occurs === "possible" ? [] : [{ ...data, title: e.name, event: e.id }];
    });
  const timelineSources = [...timelineFiles, { pack: "lore", path: "events/", data: { entries: eventRows } }];
  for (const file of timelineSources) {
    const rows = (file.data as { entries: unknown[] }).entries;
    for (const row of rows) {
      const index = sourceIndex++;
      if (!record(row)) { issues.push({ file: `${file.pack}/${file.path}`, message: "年表項目必須是物件" }); continue; }
      const date = typeof row.date === "number" ? String(row.date) : str(row.date);
      const sortKey = dateSortKey(date);
      const eventKey = resolve(str(row.event), file.pack);
      const eventData = eventKey ? entries.get(eventKey)?.data : undefined;
      // occurs: possible（開局後可能發生、日期不定）的事件不進年表。
      if (record(eventData) && eventData.occurs === "possible") continue;
      const eraRaw = str(row.era) || str(row.period) || (record(eventData) ? str(eventData.period) || str(eventData.era) : "");
      const eraEntry = [...entries.values()].find(e => e.pack === file.pack && e.kind === "era" && e.name === eraRaw);
      const era = eraRaw ? makeRef(eraRaw, file.pack, "era") ?? {
        raw: eraRaw, target: eraEntry?.key ?? null, label: eraEntry?.name ?? eraRaw, field: "era",
      } : null;
      timeline.push({
        index, date, sortKey, title: str(row.title), summary: str(row.summary), era,
        event: makeRef(str(row.event), file.pack, "event") ?? null,
        factions: strings(row.factions).flatMap((raw, i) => {
          const ref = makeRef(raw, file.pack, `factions[${i}]`);
          return ref ? [ref] : [];
        }), tags: unique(strings(row.tags)),
      });
    }
  }
  const groups = ["lore", "game", "ops", "other"];
  return {
    entries, resolve, backlinks, issues,
    categories: [...categories.values()].sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group)
      || kindOrder(a.group, a.kind) - kindOrder(b.group, b.kind)
      || a.label.localeCompare(b.label, "zh-Hant") || a.key.localeCompare(b.key)),
    timeline: timeline.sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.index - b.index),
  };
}
