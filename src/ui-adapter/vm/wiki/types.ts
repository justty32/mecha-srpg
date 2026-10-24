// ui-adapter/vm/wiki/types — 百科（wiki）vm↔dom 凍結契約（lead-wiki 寫死；改動要領導同意）。
// 方向：DOM 入口用 import.meta.glob 收集 content/<pack>/**/*.json → RawFile[] → buildWikiIndex（純邏輯，node 可測）
// → 各頁的 view model（純資料）→ DOM 只負責畫。vm/wiki 不碰 DOM、不 import rules／ai／sim／content loader。
// 內容來源兩種：世界觀 content/lore/（pack "lore"）與遊戲資料 content/base/（pack "base"，含 world/ 營運資料）；
// 之後可能有更多 pack，一律依 pack 名稱泛化處理，不寫死任何內容 id。

/** 一個 JSON 檔。pack＝content/ 底下的目錄名（"base"、"lore"…）；path＝相對 pack 根，例 "frames/hound-mk2.json"、"world/nodes/dhaka.json"。 */
export type RawFile = { pack: string; path: string; data: unknown };

/** 條目鍵：`${pack}:${id}`，例 "base:frame/hound-mk2"、"lore:faction/selene-whitegloves"。
 *  沒有 id 欄的檔（registries、rules、lore 的 timeline.json 以外的無 id 檔）用 `${pack}:file/${path 去掉 .json}`。 */
export type EntryKey = string;

/** 條目大類：lore＝世界觀；game＝戰鬥內容（base 非 world/）；ops＝營運資料（base 的 world/）；other＝其他 pack。 */
export type CategoryGroup = "lore" | "game" | "ops" | "other";

/** 一個引用（JSON 值裡的 id 字串、lore 的 relations／gameRefs、markdown 連結）。 */
export type EntryRef = {
  raw: string;                 // 原字串，例 "faction/migrant-crew"、"base:frame/hound-mk2"
  target: EntryKey | null;     // 解析到的條目；null＝壞引用（畫成灰色「未建立」）
  label: string;               // 顯示文字：解析到就是目標的 name，否則 raw
  field: string;               // 出處欄位路徑，例 "relations.faction/x"、"innateAbilities[0]"、"body"、"gameRefs[1]"
  note?: string;               // [lead-wiki r2] 關係備註（lore relations 的 note）
  rel?: string;                // 關係詞（lore relations 的 type／kind／rel，或 base factions 的 relations 值，例 "hostile"）
};

export type WikiEntry = {
  key: EntryKey;
  pack: string;
  id: string;                  // 原 id（無 id 檔為 "file/<path>"）
  kind: string;                // id 的 kind 段（"frame"、"faction"、"faction-ops"、"character"…）；無 id 檔取目錄名
  category: string;            // 所屬 Category.key
  name: string;                // 顯示名：name → title → id 最後一段（例 monster 沒 name 時用 species 名＋grade，見 cards）
  aka: string[];               // 別名（lore 的 aka；字串或陣列都收）
  summary: string;             // 一句摘要（lore summary；遊戲資料由 cards 產一句，或空字串）
  body: string;                // markdown 原文（lore body；沒有就空字串）
  tags: string[];
  /** 篩選用面向，值都是字串（引用面向放 EntryKey）：grade、family（族）、faction、era、tag、kind… 有才放。 */
  facets: Record<string, string[]>;
  refs: EntryRef[];            // 本條目的所有出向引用（去重：同 field＋raw 只一筆）
  path: string;                // 原檔 path（"frames/x.json"）
  data: unknown;               // 原始 JSON（cards 用；DOM 不直接讀）
};

export type Category = {
  key: string;                 // `${pack}:${kind}`，例 "lore:faction"、"base:frame"、"base:node"
  pack: string;
  kind: string;
  group: CategoryGroup;
  label: string;               // 中文名（已知 kind 有對照表，未知 kind 用 kind 原字）
  count: number;
};

/** 年表一筆（content/lore/timeline.json 的 entries；欄位容錯，缺的給空值）。 */
export type TimelineItem = {
  index: number;               // 原陣列序（同日期時保序）
  date: string;                // 原字串，例 "2061"、"2108-03"、"2108-03-14"
  sortKey: string;             // 可字典序比較的鍵（年補零到 6 位＋月日），解析失敗就放原字串
  title: string;
  summary: string;
  event: EntryRef | null;      // 指向 lore 事件條目
  era: EntryRef | null;        // 指向 lore 時代條目（era 欄可為 id 或名稱；解不到就 target null、label 原字）
  factions: EntryRef[];
  tags: string[];
};

export type EraSection = { era: EntryRef | null; label: string; items: TimelineItem[] };   // era null＝「未分時代」

/** 反向引用：誰（from）在哪個欄位指向我。 */
export type BackRef = { from: EntryKey; fromName: string; field: string; rel?: string };
/** 壞引用：from 條目的 ref 解析不到（ref.target === null）。 */
export type BrokenRef = { from: EntryKey; fromName: string; ref: EntryRef };

export type BuildIssue = { file: string; message: string };   // 建索引時的容錯紀錄（壞 JSON 結構、重複 key…），不拋錯

export type WikiIndex = {
  entries: Map<EntryKey, WikiEntry>;
  categories: Category[];                       // 排序：group（lore→game→ops→other）再 label
  backlinks: Map<EntryKey, BackRef[]>;          // 目標 → 指向它的引用（只收解析成功的）
  timeline: TimelineItem[];                     // 已依 sortKey、index 排序
  issues: BuildIssue[];
  /** 解析引用字串：
   *  "pack:kind/name" → 該 pack；"kind/name" → 先 fromPack，再其他 pack（lore 找不到時找 base）；
   *  不是 id 形狀（/^[a-z][a-z0-9-]*\/[a-z0-9][a-z0-9._-]*$/，可帶 "pack:" 前綴）→ undefined（表示「不是引用，當一般文字」）；
   *  是 id 形狀但不存在 → null（壞引用）。 */
  resolve(raw: string, fromPack: string): EntryKey | null | undefined;
};

// ── 分類清單頁 ──────────────────────────────────────────────

export type SortKey = "name" | "grade" | "id";
export type ListQuery = { category: string; sort?: SortKey; desc?: boolean; filters?: Record<string, string> };   // filters：facet 名 → 值
export type FacetOption = { value: string; label: string; count: number };
export type ListRow = { key: EntryKey; name: string; summary: string; grade?: string; tags: string[]; facets: Record<string, string[]> };
export type ListView = {
  category: Category;
  rows: ListRow[];
  facets: { name: string; label: string; options: FacetOption[] }[];   // 只列此分類實際出現的面向；label 中文（等級、族、勢力、時代、標籤）
  query: ListQuery;
};

// ── 搜尋 ────────────────────────────────────────────────────

export type SearchField = "name" | "aka" | "summary" | "body" | "id" | "tag";
export type SearchHit = { key: EntryKey; name: string; category: string; score: number; field: SearchField; snippet: string };

// ── markdown（最小子集；DOM 一律用 textContent／createElement 畫，不用 innerHTML）─────

export type MdInline =
  | { t: "text"; v: string }
  | { t: "strong"; c: MdInline[] }
  | { t: "em"; c: MdInline[] }
  | { t: "code"; v: string }
  | { t: "br" }
  /** 內部連結：[文字](kind/name)、[文字](base:kind/name)、[[kind/name]]、[[kind/name|文字]] → ref；
   *  外部連結只收 http(s)://，其他 scheme（javascript: 等）退成純文字 text。 */
  | { t: "link"; ref: EntryRef; c: MdInline[] }
  | { t: "extlink"; href: string; c: MdInline[] };

export type MdBlock =
  | { t: "h"; level: 1 | 2 | 3 | 4 | 5 | 6; c: MdInline[] }
  | { t: "p"; c: MdInline[] }
  | { t: "ul" | "ol"; items: MdBlock[][] }                // 每個 item 是 block 陣列（巢狀清單＝item 裡再有 ul/ol）
  | { t: "table"; head: MdInline[][]; align: ("left" | "center" | "right" | null)[]; rows: MdInline[][][] }
  | { t: "quote"; c: MdBlock[] }
  | { t: "pre"; v: string }
  | { t: "hr" };

/** 連結解析器：給 markdown 用（由 index.resolve 包成）。回 undefined＝不是內部 id 形狀。 */
export type LinkResolver = (raw: string) => EntryRef | undefined;

// ── 詳情頁（資料卡）────────────────────────────────────────

/** 卡片上的一個值。 */
export type CardValue =
  | { t: "text"; v: string }
  | { t: "num"; v: number; unit?: string }
  | { t: "ref"; ref: EntryRef }                           // 連結或灰色「未建立」
  | { t: "list"; items: CardValue[] }
  | { t: "tags"; items: string[] }
  /** [lead-wiki r2] 物件值：小型 key-value（例 層的 resist {kinetic:0.5}、ancientMech）；DOM 畫成緊湊的「標籤 值」格。 */
  | { t: "kv"; rows: { label: string; value: CardValue }[] };

export type CardSection =
  | { t: "kv"; title: string; rows: { label: string; value: CardValue }[] }
  | { t: "table"; title: string; columns: string[]; rows: CardValue[][] }
  | { t: "list"; title: string; items: CardValue[] }
  | { t: "md"; title: string; blocks: MdBlock[] }
  /** 原始資料：沒有專屬呈現的欄位一律走這裡（遞迴 key-value；id 形狀字串變 ref），保證新欄位不漏。 */
  | { t: "raw"; title: string; rows: { label: string; value: CardValue }[] };

export type EntryPage = {
  key: EntryKey;
  title: string;
  subtitle: string;                                       // 分類 label · id
  badges: string[];                                       // 等級、族、cls、kind 之類的短標籤
  summary: string;
  aka: string[];
  sections: CardSection[];                                // 順序：概要 kv → 專屬段（部位與層、資源池、能力…）→ 本文 md → 關係 → raw
  backlinks: { category: string; label: string; refs: BackRef[] }[];    // 依來源分類分組（label＝分類中文名）
  breadcrumbs: { label: string; category?: string }[];
};

// ── 年表、勢力關係 ──────────────────────────────────────────

export type TimelineQuery = { faction?: EntryKey; era?: EntryKey; tag?: string };
export type TimelineView = { sections: EraSection[]; factions: FacetOption[]; eras: FacetOption[]; query: TimelineQuery; total: number };

/** 勢力關係矩陣：base factions 的 relations（值 hostile／neutral／allied…）＋lore factions 的 relations（容錯 object 或 array）。 */
export type RelationTone = "allied" | "friendly" | "neutral" | "tense" | "hostile" | "other";
/** rel＝原字（"hostile"、"敵對"…）；label＝中文顯示（hostile→敵對、neutral→中立、allied→同盟…，中文原樣）；tone 給 DOM 上色。[lead-wiki r2] 加 label／tone。 */
export type RelationCell = { from: EntryKey; to: EntryKey; rel: string; label: string; tone: RelationTone; note?: string; source: "lore" | "game" };
export type RelationsView = { factions: { key: EntryKey; name: string; group: CategoryGroup }[]; cells: RelationCell[]; rels: string[] };

// ── 首頁 ────────────────────────────────────────────────────

export type HomeView = {
  groups: { group: CategoryGroup; label: string; categories: Category[] }[];
  totals: { entries: number; lore: number; game: number; ops: number; timeline: number; broken: number };
  broken: BrokenRef[];                                    // 最多 30 筆壞引用，給內容作者看
};

// ── 路由（hash；location.search 的 ?scenario= 等戰鬥參數不動）────────────

/** 百科內的視圖。 */
export type WikiView =
  | { v: "home" }
  | { v: "cat"; query: ListQuery }
  | { v: "entry"; key: EntryKey }
  | { v: "search"; q: string }
  | { v: "timeline"; query: TimelineQuery }
  | { v: "relations" };

/** 整個網頁的頁面。ops＝「營運」預留位（目前顯示「尚未開放」）。 */
export type AppRoute = { page: "battle" } | { page: "ops" } | { page: "wiki"; view: WikiView };
