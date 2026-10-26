import { layerTypeLabel } from "../labels.ts";
import { relationLabel } from "./relations.ts";
import { visibilityOf } from "./visibility.ts";
import type { CardSection, CardValue, EntryRef, WikiEntry, WikiIndex } from "./types.ts";

type Data = Record<string, unknown>;
type Row = { label: string; value: CardValue };
export const object = (value: unknown): Data | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Data : undefined;
const own = (data: Data, field: string): boolean => Object.hasOwn(data, field);
export const text = (v: string): CardValue => ({ t: "text", v });
const labels: Record<string, string> = {
  cls: "機體類型", grade: "等級", kind: "種類", family: "族", gradeRange: "等級範圍",
  bodyPlan: "構型", species: "物種", epithet: "二名／稱號", title: "稱號", nickname: "小名",
  nameEn: "英文原名", etymology: "意涵", aka: "別名", names: "命名表", naming: "命名慣例", epithets: "稱號表", mode: "模式",
  slot: "槽位", size: "尺寸", mass: "質量", hp: "生命", origin: "來源", scope: "作用範圍",
  width: "寬度", height: "高度", map: "地圖", era: "時代", faction: "勢力", factions: "勢力",
  date: "日期", place: "地點", scale: "規模", sensing: "感知", strategy: "策略",
  min: "下限", max: "上限", initial: "初始值", regen: "恢復", pool: "資源池", owner: "持有者",
  amount: "數量", type: "類型", id: "識別碼", name: "名稱", capKind: "上限類型",
  inverted: "反向", bands: "區間效果", onDepleted: "耗盡效果", accuracy: "命中修正",
  founded: "成立", hq: "總部", leaders: "領袖", ideology: "信條", places: "據點", mechSeries: "衍型機系列",
  mercPolicy: "對傭兵", generosity: "大方度", reliability: "守約度", note: "備註", ancientMech: "藍本古代機",
  foundAt: "發現地", foundDate: "發現時間", pilot: "駕駛員", gameRef: "遊戲資料", doctrine: "研發特色",
  born: "生", died: "歿", role: "身分", mech: "座機", period: "時代", characters: "人物",
  region: "地區", continent: "大洲", world: "天體", status2108: "2108 現況", from: "起始", to: "結束",
  structural: "結構層", breakEffect: "破壞效果",
};
export const label = (field: string): string => labels[field] ?? field;

export class CardBuilder {
  index: WikiIndex;
  entry: WikiEntry;
  data: Data;
  used = new Set(["id", "name"]);
  sections: CardSection[] = [];
  overview: Row[] = [];

  constructor(index: WikiIndex, entry: WikiEntry) {
    this.index = index;
    this.entry = entry;
    this.data = object(entry.data) ?? {};
  }

  ref(raw: string, field: string, force = false): EntryRef | undefined {
    const target = this.index.resolve(raw, this.entry.pack);
    if (target === undefined && !force) return undefined;
    return { raw, target: target ?? null, label: target ? this.index.entries.get(target)?.name ?? raw : raw, field };
  }

  value(value: unknown, field: string, depth = 0): CardValue {
    if (typeof value === "number") return { t: "num", v: value };
    if (typeof value === "string") {
      const ref = this.ref(value, field);
      return ref ? { t: "ref", ref } : text(value);
    }
    if (depth > 3 && value !== null && typeof value === "object") return text(JSON.stringify(value));
    if (Array.isArray(value)) return { t: "list", items: value.map((v, i) => this.value(v, `${field}[${i}]`, depth + 1)) };
    const data = object(value);
    if (data) return { t: "kv", rows: this.rows(data, field, depth) };
    return text(value === null ? "null" : value === undefined ? "—" : String(value));
  }

  rows(value: unknown, field = "", depth = 0): Row[] {
    const data = object(value);
    if (!data) return [{ label: field || "value", value: this.value(value, field) }];
    // lore 物件內的 visibility 只是標記（hidden 已在建索引前拿掉），不當資料列顯示。
    return Object.entries(data).filter(([k]) => !(this.entry.pack === "lore" && k === "visibility")).map(([k, v]): Row => {
      const path = field ? `${field}.${k}` : k;
      const keyRef = this.ref(k, path);
      // SPEC-GAP：kv 標籤只能是文字；物件鍵引用另放對象欄，保留可點連結。
      if (keyRef) return { label: keyRef.label, value: { t: "kv", rows: [
        { label: "對象", value: { t: "ref", ref: keyRef } }, { label: "值", value: this.value(v, path, depth + 1) },
      ] } };
      return { label: label(k), value: this.value(v, path, depth + 1) };
    });
  }

  summary(fields: string[], overrides: Record<string, string> = {}): void {
    for (const field of fields) if (own(this.data, field) && !this.used.has(field)) {
      this.used.add(field);
      this.overview.push({ label: overrides[field] ?? label(field), value: this.value(this.data[field], field) });
    }
  }

  kv(field: string, title: string): void {
    if (!own(this.data, field)) return;
    this.used.add(field);
    this.sections.push({ t: "kv", title, rows: this.rows(this.data[field], field) });
  }

  list(field: string, title: string): void {
    if (!own(this.data, field)) return;
    this.used.add(field);
    const value = this.data[field];
    const items = Array.isArray(value) ? value : [value];
    this.sections.push({ t: "list", title, items: items.map((v, i) => this.value(v, `${field}[${i}]`)) });
  }

  table(field: string, title: string): void {
    if (!own(this.data, field)) return;
    this.used.add(field);
    const value = this.data[field];
    if (!Array.isArray(value)) {
      const rows = this.rows(value, field);
      this.sections.push({ t: "table", title, columns: ["欄位", "值"], rows: rows.map(r => [text(r.label), r.value]) });
      return;
    }
    // 欄位取聯集，避免新加的池、傷害包欄位因固定欄位表而消失。
    const columns = [...new Set(value.flatMap(v => Object.keys(object(v) ?? {})))];
    const scalar = value.some(v => !object(v));
    this.sections.push({
      t: "table", title, columns: [...columns.map(label), ...(scalar ? ["值"] : [])],
      rows: value.map((v, i) => [
        ...columns.map(k => this.value(object(v)?.[k], `${field}[${i}].${k}`)),
        ...(scalar ? [object(v) ? text("—") : this.value(v, `${field}[${i}]`)] : []),
      ]),
    });
  }

  bodyParts(): void {
    if (!Array.isArray(this.data.parts)) { this.kv("parts", "部位與層"); return; }
    this.used.add("parts");
    const rows: CardValue[][] = [];
    const seats: CardValue[][] = [];
    const registry = (kind: string): Record<string, { name: string }> => {
      const source = this.index.entries.get(`${this.entry.pack}:file/registries/${kind}`)
        ?? this.index.entries.get(`base:file/registries/${kind}`);
      const entries = object(source?.data)?.entries;
      return Object.fromEntries((Array.isArray(entries) ? entries : []).flatMap(value => {
        const row = object(value);
        return typeof row?.id === "string" && typeof row.name === "string" ? [[row.id, { name: row.name }]] : [];
      }));
    };
    const damageNames = registry("damage-types");
    // SPEC-GAP：既有 label 函式要求完整 DB，實際只讀 layer-types；提供該欄的唯讀適配，不載入遊戲 DB。
    const labelDb = { registries: { "layer-types": registry("layer-types") } } as Parameters<typeof layerTypeLabel>[0];
    this.data.parts.forEach((part, i) => {
      const data = object(part);
      if (!data) { rows.push([this.value(part, `parts[${i}]`), ...Array.from({ length: 8 }, () => text("—"))]); return; }
      const path = `parts[${i}]`;
      const detail = Object.fromEntries(Object.entries(data).filter(([k]) => !["id", "name", "layers", "seats", "exposure", "slots", "functions"].includes(k)));
      const layers = Array.isArray(data.layers) ? data.layers : [data.layers];
      for (const [j, layer] of (layers.length ? layers : [undefined]).entries()) {
        const layerData = object(layer) ?? {};
        const layerPath = `${path}.layers[${j}]`;
        const resist: CardValue = { t: "kv", rows: Object.entries(object(layerData.resist) ?? {}).map(([k, v]) => ({
          label: damageNames[k]?.name ?? k, value: this.value(v, `${layerPath}.resist.${k}`),
        })) };
        const notes = Object.fromEntries(Object.entries(layerData).filter(([k]) => !["id", "name", "type", "hp", "resist"].includes(k)));
        const noteRows = this.rows(notes, layerPath);
        if (j === 0 && Object.keys(detail).length) noteRows.push({ label: "部位備註", value: this.value(detail, path) });
        rows.push([j === 0 ? this.value(data.name ?? data.id, `${path}.name`) : text(""),
          this.value(data.exposure, `${path}.exposure`), this.value(data.slots, `${path}.slots`),
          this.value(data.functions, `${path}.functions`), this.value(layerData.name ?? layerData.id ?? j + 1, layerPath),
          text(typeof layerData.type === "string" ? layerTypeLabel(labelDb, layerData.type) : "—"),
          this.value(layerData.hp, `${layerPath}.hp`), resist, { t: "kv", rows: noteRows }]);
      }
      if (own(data, "seats")) seats.push([this.value(data.name ?? data.id, `${path}.name`), this.value(data.seats, `${path}.seats`)]);
    });
    this.sections.push({ t: "table", title: "部位與層", columns: ["部位", "暴露", "槽位", "功能", "層", "種類", "HP", "抗性", "備註"], rows });
    if (seats.length) this.sections.push({ t: "table", title: "座位", columns: ["部位", "座位"], rows: seats });
    this.table("seats", "座位");
  }

  expandBody(): void {
    this.summary(["bodyPlan"]);
    const raw = this.data.bodyPlan;
    if (typeof raw !== "string") return;
    const ref = this.ref(raw, "bodyPlan", true)!;
    // 構型欄是明確引用，格式壞掉時仍讓畫面標示未建立。
    const row = this.overview.find(r => r.label === label("bodyPlan"));
    if (row) row.value = { t: "ref", ref };
    const entry = ref.target ? this.index.entries.get(ref.target) : undefined;
    if (!entry) return;
    const body = new CardBuilder(this.index, entry);
    body.bodyParts();
    this.sections.push(...body.sections);
  }

  relations(): void {
    const value = this.data.relations;
    if (!own(this.data, "relations")) return;
    this.used.add("relations");
    const mapping = object(value);
    const items = Array.isArray(value) ? value.map((v, i) => ({ value: v, path: `relations[${i}]`, target: undefined as string | undefined }))
      : mapping ? Object.entries(mapping).map(([target, v]) => ({ value: v, path: `relations.${target}`, target }))
      : [{ value, path: "relations", target: undefined }];
    const rows = items.map(item => {
      const data = object(item.value);
      const target = item.target ?? data?.faction ?? data?.character ?? data?.place ?? data?.event ?? data?.id ?? data?.target;
      const relation = data?.stance ?? data?.relation ?? data?.type ?? data?.kind ?? data?.rel ?? (typeof item.value === "string" && item.target ? item.value : "");
      const ref = typeof target === "string" ? this.ref(target, item.path, true) : undefined;
      if (ref && typeof relation === "string") ref.rel = relation;
      if (ref && typeof data?.note === "string") ref.note = data.note;
      return [ref ? { t: "ref", ref } as CardValue : this.value(target, item.path),
        this.value(typeof relation === "string" ? relationLabel(relation) + (visibilityOf(data) === "rumor" ? "（傳聞）" : "") : relation, `${item.path}.rel`),
        this.value(data?.note ?? "", `${item.path}.note`)];
    });
    this.sections.push({ t: "table", title: "關係", columns: ["對象", "關係", "備註"], rows });
  }
}

