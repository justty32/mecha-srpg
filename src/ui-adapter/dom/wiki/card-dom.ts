import type { CardSection, CardValue, EntryPage } from "../../vm/wiki/types.ts";
import { element, renderBlocks, renderRef, viewLink } from "./markdown-dom.ts";
import type { Href } from "./markdown-dom.ts";

function renderValue(doc: Document, value: CardValue, href: Href): HTMLElement {
  switch (value.t) {
    case "text": return element(doc, "span", value.v);
    case "num": return element(doc, "span", `${value.v}${value.unit ? ` ${value.unit}` : ""}`);
    case "ref": return renderRef(doc, value.ref, href);
    case "kv": {
      const list = element(doc, "dl");
      list.className = "wiki-kv";
      for (const row of value.rows) {
        const content = element(doc, "dd");
        content.append(renderValue(doc, row.value, href));
        list.append(element(doc, "dt", row.label), content);
      }
      return list;
    }
    case "tags": {
      const tags = element(doc, "span");
      for (const text of value.items) {
        const tag = element(doc, "span", text);
        tag.className = "wiki-badge";
        tags.append(tag);
      }
      return tags;
    }
    case "list": {
      // SPEC-GAP：未定「短文字」字數，依明定的八項門檻呈現，文字由 CSS 自然換行。
      const isInline = (item: CardValue): boolean => item.t !== "kv"
        && (item.t !== "list" || item.items.length <= 8 && item.items.every(isInline));
      if (value.items.length <= 8 && value.items.every(isInline)) {
        const list = element(doc, "span");
        list.className = "wiki-inline-list";
        value.items.forEach((item, index) => {
          if (index > 0) list.append(doc.createTextNode("、"));
          list.append(renderValue(doc, item, href));
        });
        return list;
      }
      const list = element(doc, "ul");
      for (const valueItem of value.items) {
        const item = element(doc, "li");
        item.append(renderValue(doc, valueItem, href));
        list.append(item);
      }
      return list;
    }
  }
}

function renderSection(doc: Document, section: CardSection, href: Href): HTMLElement {
  const node = element(doc, section.t === "raw" ? "details" : "section");
  node.dataset.section = section.t;
  node.append(element(doc, section.t === "raw" ? "summary" : "h2", section.title));
  switch (section.t) {
    case "kv": case "raw": {
      const list = element(doc, "dl");
      list.className = "wiki-kv";
      for (const row of section.rows) {
        const value = element(doc, "dd");
        value.append(renderValue(doc, row.value, href));
        list.append(element(doc, "dt", row.label), value);
      }
      node.append(list);
      break;
    }
    case "table": {
      const table = element(doc, "table");
      const head = element(doc, "thead");
      const headings = element(doc, "tr");
      for (const column of section.columns) {
        const th = element(doc, "th", column);
        th.scope = "col";
        headings.append(th);
      }
      head.append(headings);
      const body = element(doc, "tbody");
      for (const row of section.rows) {
        const tr = element(doc, "tr");
        for (const value of row) {
          const cell = element(doc, "td");
          cell.append(renderValue(doc, value, href));
          tr.append(cell);
        }
        body.append(tr);
      }
      table.append(head, body);
      node.append(table);
      break;
    }
    case "list": node.append(renderValue(doc, { t: "list", items: section.items }, href)); break;
    case "md": node.append(renderBlocks(doc, section.blocks, href)); break;
  }
  return node;
}

export function renderEntry(doc: Document, page: EntryPage, href: Href): HTMLElement {
  const article = element(doc, "article");
  article.dataset.ui = "wiki-entry";
  article.dataset.key = page.key;
  const crumbs = element(doc, "nav");
  crumbs.setAttribute("aria-label", "所在分類");
  page.breadcrumbs.forEach((crumb, index) => {
    if (index > 0) crumbs.append(doc.createTextNode(" / "));
    crumbs.append(crumb.category
      ? viewLink(doc, crumb.label, { v: "cat", query: { category: crumb.category } }, href)
      : element(doc, "span", crumb.label));
  });
  article.append(crumbs, element(doc, "h1", page.title), element(doc, "p", page.subtitle));
  for (const text of page.badges) {
    const badge = element(doc, "span", text);
    badge.className = "wiki-badge";
    article.append(badge);
  }
  if (page.aka.length) article.append(element(doc, "p", `別名：${page.aka.join("、")}`));
  if (page.summary) article.append(element(doc, "p", page.summary));
  for (const section of page.sections) article.append(renderSection(doc, section, href));
  const backlinks = element(doc, "section");
  backlinks.dataset.ui = "wiki-backlinks";
  backlinks.append(element(doc, "h2", "反向引用"));
  for (const group of page.backlinks) {
    const section = element(doc, "section");
    section.dataset.category = group.category;
    section.append(element(doc, "h3", group.label));
    const list = element(doc, "ul");
    for (const ref of group.refs) {
      const item = element(doc, "li");
      item.append(renderRef(doc, { raw: ref.from, target: ref.from, label: ref.fromName, field: ref.field }, href));
      item.append(doc.createTextNode(` · ${ref.field}${ref.rel ? ` · ${ref.rel}` : ""}`));
      list.append(item);
    }
    section.append(list);
    backlinks.append(section);
  }
  article.append(backlinks);
  return article;
}
