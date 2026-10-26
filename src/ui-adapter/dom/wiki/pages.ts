import type { EntryStatus, FacetOption, HomeView, ListView, RelationsView, SearchHit, SortKey, TimelineView, WikiView } from "../../vm/wiki/types.ts";
import { element, renderRef, viewLink } from "./markdown-dom.ts";
import type { Href } from "./markdown-dom.ts";

type Navigate = (view: WikiView) => void;

function statusBadges(doc: Document, status: EntryStatus): HTMLElement[] {
  const labels = [status.occurs === "possible" ? "可能發生" : "", status.visibility === "rumor" ? "傳聞" : ""];
  return labels.filter(Boolean).map(label => {
    const badge = element(doc, "span", label);
    badge.className = "wiki-badge";
    return badge;
  });
}

function page(doc: Document, name: string, title: string): HTMLElement {
  const section = element(doc, "section");
  section.dataset.ui = `wiki-${name}`;
  section.append(element(doc, "h1", title));
  return section;
}

function select(doc: Document, label: string, options: FacetOption[], value: string, change: (value: string) => void, all = true): HTMLLabelElement {
  const wrapper = element(doc, "label", `${label} `);
  const input = element(doc, "select");
  if (all) {
    const option = element(doc, "option", "全部");
    option.value = "";
    input.append(option);
  }
  for (const item of options) {
    const option = element(doc, "option", `${item.label}${item.count >= 0 ? `（${item.count}）` : ""}`);
    option.value = item.value;
    input.append(option);
  }
  input.value = value;
  input.addEventListener("change", () => change(input.value));
  wrapper.append(input);
  return wrapper;
}

export function renderHome(doc: Document, home: HomeView, href: Href): HTMLElement {
  const node = page(doc, "home", "百科總覽");
  const totals = element(doc, "dl");
  totals.className = "wiki-totals";
  const labels = { entries: "條目", lore: "世界觀", game: "遊戲資料", ops: "營運", timeline: "年表事件", broken: "未建立引用" };
  for (const key of Object.keys(labels) as (keyof typeof labels)[]) {
    totals.append(element(doc, "dt", labels[key]), element(doc, "dd", String(home.totals[key])));
  }
  node.append(totals);
  if (home.totals.lore === 0) node.append(element(doc, "p", "世界觀資料尚未建立（content/lore/）"));
  for (const group of home.groups) {
    const section = element(doc, "section");
    section.dataset.group = group.group;
    section.append(element(doc, "h2", group.label));
    const cards = element(doc, "div");
    cards.className = "wiki-categories";
    for (const category of group.categories) {
      const link = viewLink(doc, "", { v: "cat", query: { category: category.key } }, href);
      const count = element(doc, "span", String(category.count));
      count.className = "wiki-count";
      count.setAttribute("aria-label", `${category.count} 筆`);
      link.append(element(doc, "span", category.label), count);
      link.className = "wiki-category";
      link.dataset.cat = category.key;
      cards.append(link);
    }
    section.append(cards);
    node.append(section);
  }
  const broken = element(doc, "section");
  broken.append(element(doc, "h2", "未建立引用（內容作者）"));
  const list = element(doc, "ul");
  for (const item of home.broken) {
    const li = element(doc, "li");
    li.append(viewLink(doc, item.fromName, { v: "entry", key: item.from }, href), doc.createTextNode(`：${item.ref.raw}`));
    list.append(li);
  }
  broken.append(list);
  node.append(broken);
  return node;
}

export function renderList(doc: Document, view: ListView, href: Href, navigate: Navigate): HTMLElement {
  const node = page(doc, "list", view.category.label);
  const controls = element(doc, "div");
  controls.className = "wiki-controls";
  const sort = select(doc, "排序", [
    { value: "name", label: "名稱", count: -1 }, { value: "grade", label: "等級", count: -1 }, { value: "id", label: "ID", count: -1 },
  ], view.query.sort ?? "name", value => navigate({ v: "cat", query: { ...view.query, sort: value as SortKey } }), false);
  sort.querySelector("select")!.dataset.ui = "wiki-sort";
  const desc = element(doc, "button", view.query.desc ? "降冪 ↓" : "升冪 ↑");
  desc.type = "button";
  desc.setAttribute("aria-label", "切換排序方向");
  desc.addEventListener("click", () => navigate({ v: "cat", query: { ...view.query, desc: !view.query.desc } }));
  controls.append(sort, desc);
  for (const facet of view.facets) {
    const filter = select(doc, facet.label, facet.options, view.query.filters?.[facet.name] ?? "", value => {
      const filters = { ...view.query.filters };
      if (value) filters[facet.name] = value;
      else delete filters[facet.name];
      navigate({ v: "cat", query: { ...view.query, filters } });
    });
    filter.querySelector("select")!.dataset.facet = facet.name;
    controls.append(filter);
  }
  node.append(controls);
  const list = element(doc, "ul");
  list.className = "wiki-rows";
  for (const row of view.rows) {
    const item = element(doc, "li");
    item.dataset.ui = "wiki-row";
    item.dataset.key = row.key;
    const link = viewLink(doc, row.name, { v: "entry", key: row.key }, href);
    link.dataset.key = row.key;
    item.append(link);
    item.append(...statusBadges(doc, row));
    if (row.id) {
      const id = element(doc, "small", row.id);
      id.className = "wiki-row-id";
      item.append(id);
    }
    if (row.grade) {
      const badge = element(doc, "span", row.grade);
      badge.className = "wiki-badge wiki-grade";
      item.append(badge);
    }
    if (row.summary) {
      const summary = element(doc, "span", row.summary);
      summary.className = "wiki-row-summary";
      summary.title = row.summary;
      item.append(summary);
    }
    if (row.tags.length) {
      const tags = element(doc, "small", row.tags.join("、"));
      tags.className = "wiki-row-tags";
      item.append(tags);
    }
    for (const facet of row.displayFacets ?? []) {
      const value = element(doc, "small", `${facet.label}：${facet.values.join("、")}`);
      value.className = "wiki-row-facet";
      item.append(value);
    }
    list.append(item);
  }
  node.append(list);
  if (!view.rows.length) node.append(element(doc, "p", "沒有符合條件的條目。"));
  return node;
}

export function renderSearch(doc: Document, hits: SearchHit[], q: string, href: Href): HTMLElement {
  const node = page(doc, "results", `搜尋：${q}`);
  const list = element(doc, "ul");
  list.className = "wiki-rows";
  for (const hit of hits) {
    const item = element(doc, "li");
    const link = viewLink(doc, hit.name, { v: "entry", key: hit.key }, href);
    link.dataset.key = hit.key;
    item.append(link, ...statusBadges(doc, hit), element(doc, "small", ` · ${hit.category}`), element(doc, "p", hit.snippet));
    list.append(item);
  }
  node.append(list);
  if (!hits.length) node.append(element(doc, "p", q ? "沒有符合的條目。" : "輸入名稱、別名或關鍵字搜尋。"));
  return node;
}

export function renderTimeline(doc: Document, view: TimelineView, href: Href, navigate: Navigate): HTMLElement {
  const node = page(doc, "timeline", "年表");
  const controls = element(doc, "div");
  controls.className = "wiki-controls";
  for (const [key, label, options] of [["faction", "勢力", view.factions], ["era", "時代", view.eras]] as const) {
    const filter = select(doc, label, options, view.query[key] ?? "", value => {
      const query = { ...view.query };
      if (value) query[key] = value;
      else delete query[key];
      navigate({ v: "timeline", query });
    });
    filter.querySelector("select")!.dataset.ui = `wiki-tl-${key}`;
    controls.append(filter);
  }
  node.append(controls, element(doc, "p", `${view.total} 筆事件`));
  for (const section of view.sections) {
    const era = element(doc, "section");
    era.dataset.era = section.era ? section.era.target ?? section.era.raw : "none";
    const heading = element(doc, "h2");
    heading.append(section.era ? renderRef(doc, section.era, href) : doc.createTextNode(section.label));
    era.append(heading);
    for (const item of section.items) {
      const article = element(doc, "article");
      article.dataset.ui = "wiki-tl-item";
      const title = element(doc, "h3");
      title.append(element(doc, "span", `${item.date} · `));
      title.append(item.event ? renderRef(doc, { ...item.event, label: item.title }, href) : doc.createTextNode(item.title));
      title.append(...statusBadges(doc, item));
      article.append(title, element(doc, "p", item.summary));
      for (const faction of item.factions) article.append(renderRef(doc, faction, href), doc.createTextNode(" "));
      era.append(article);
    }
    node.append(era);
  }
  return node;
}

export function renderRelations(doc: Document, view: RelationsView, href: Href): HTMLElement {
  const node = page(doc, "relations", "勢力關係");
  const scroll = element(doc, "div");
  scroll.className = "wiki-table-scroll";
  scroll.tabIndex = 0;
  scroll.setAttribute("role", "region");
  scroll.setAttribute("aria-label", "勢力關係矩陣，可水平捲動");
  const table = element(doc, "table");
  table.className = "wiki-relations-table";
  table.append(element(doc, "caption", "列勢力 → 欄勢力"));
  const factionLink = (key: string, name: string): HTMLElement => renderRef(doc, { raw: key, target: key, label: name, field: "relations" }, href);
  const head = element(doc, "thead");
  const heading = element(doc, "tr");
  heading.append(element(doc, "th", "勢力"));
  for (const faction of view.factions) {
    const cell = element(doc, "th");
    cell.scope = "col";
    cell.title = faction.name;
    cell.append(factionLink(faction.key, faction.name));
    heading.append(cell);
  }
  head.append(heading);
  const body = element(doc, "tbody");
  const cells = new Map<string, typeof view.cells>();
  for (const cell of view.cells) {
    const key = JSON.stringify([cell.from, cell.to]);
    const values = cells.get(key) ?? [];
    values.push(cell);
    cells.set(key, values);
  }
  for (const from of view.factions) {
    const row = element(doc, "tr");
    const header = element(doc, "th");
    header.scope = "row";
    header.append(factionLink(from.key, from.name));
    row.append(header);
    for (const to of view.factions) {
      const cell = element(doc, "td");
      cell.dataset.from = from.key;
      cell.dataset.to = to.key;
      const relations = cells.get(JSON.stringify([from.key, to.key])) ?? [];
      for (const relation of relations) {
        const value = element(doc, "div", relation.label);
        value.dataset.rel = relation.rel;
        value.className = `wiki-rel rel-${relation.tone}`;
        cell.classList.add(`rel-${relation.tone}`);
        if (relation.note) value.title = relation.note;
        value.append(element(doc, "small", ` · ${relation.source === "lore" ? "世界觀" : "遊戲"}`));
        cell.append(value);
      }
      if (!relations.length) cell.textContent = "—";
      row.append(cell);
    }
    body.append(row);
  }
  table.append(head, body);
  scroll.append(table);
  node.append(scroll);
  const list = element(doc, "section");
  list.className = "wiki-relations-list";
  list.append(element(doc, "h2", "關係清單"));
  const names = new Map(view.factions.map(faction => [faction.key, faction.name]));
  for (const faction of view.factions) {
    const relations = view.cells.filter(cell => cell.from === faction.key);
    if (!relations.length) continue;
    const section = element(doc, "section");
    section.dataset.from = faction.key;
    const title = element(doc, "h3");
    title.append(factionLink(faction.key, faction.name));
    section.append(title);
    const items = element(doc, "ul");
    for (const relation of relations) {
      const item = element(doc, "li");
      const label = element(doc, "span", relation.label);
      label.className = `rel-${relation.tone}`;
      if (relation.note) label.title = relation.note;
      item.append(factionLink(relation.to, names.get(relation.to) ?? relation.to), doc.createTextNode("："), label,
        element(doc, "small", `（${relation.source === "lore" ? "世界觀" : "遊戲"}）`));
      if (relation.note) item.append(doc.createTextNode(` · ${relation.note}`));
      items.append(item);
    }
    section.append(items);
    list.append(section);
  }
  node.append(list);
  return node;
}
