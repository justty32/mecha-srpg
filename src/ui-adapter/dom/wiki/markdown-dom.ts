import type { EntryRef, MdBlock, MdInline, WikiView } from "../../vm/wiki/types.ts";

export type Href = (view: WikiView) => string;

export function element<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, text?: string): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function viewLink(doc: Document, label: string, view: WikiView, href: Href): HTMLAnchorElement {
  const link = element(doc, "a", label);
  link.href = href(view);
  link.dataset.wikiLink = "";
  return link;
}

export function renderRef(doc: Document, ref: EntryRef, href: Href): HTMLElement {
  if (ref.target !== null) {
    const link = viewLink(doc, ref.label, { v: "entry", key: ref.target }, href);
    link.dataset.ref = ref.target;
    return link;
  }
  const span = element(doc, "span", `${ref.label}（未建立）`);
  span.className = "wiki-broken";
  span.dataset.broken = ref.raw;
  return span;
}

function renderInline(doc: Document, items: MdInline[], href: Href): DocumentFragment {
  const fragment = doc.createDocumentFragment();
  for (const item of items) {
    switch (item.t) {
      case "text": fragment.append(doc.createTextNode(item.v)); break;
      case "code": fragment.append(element(doc, "code", item.v)); break;
      case "br": fragment.append(element(doc, "br")); break;
      case "strong": case "em": {
        const node = element(doc, item.t);
        node.append(renderInline(doc, item.c, href));
        fragment.append(node);
        break;
      }
      case "link": {
        const node = renderRef(doc, item.ref, href);
        if (item.ref.target !== null) node.replaceChildren(renderInline(doc, item.c, href));
        fragment.append(node);
        break;
      }
      case "extlink": {
        if (!/^https?:\/\//iu.test(item.href)) {
          fragment.append(renderInline(doc, item.c, href));
          break;
        }
        const node = element(doc, "a");
        node.href = item.href;
        node.rel = "noopener noreferrer";
        node.target = "_blank";
        node.append(renderInline(doc, item.c, href));
        fragment.append(node);
        break;
      }
    }
  }
  return fragment;
}

export function renderBlocks(doc: Document, blocks: MdBlock[], href: Href): DocumentFragment {
  const fragment = doc.createDocumentFragment();
  for (const block of blocks) {
    switch (block.t) {
      case "h": case "p": {
        const node = element(doc, block.t === "h" ? `h${block.level}` : "p");
        node.append(renderInline(doc, block.c, href));
        fragment.append(node);
        break;
      }
      case "ul": case "ol": {
        const list = element(doc, block.t);
        for (const blocks of block.items) {
          const item = element(doc, "li");
          item.append(renderBlocks(doc, blocks, href));
          list.append(item);
        }
        fragment.append(list);
        break;
      }
      case "table": {
        const table = element(doc, "table");
        const head = element(doc, "thead");
        const body = element(doc, "tbody");
        const row = (cells: MdInline[][], header: boolean): HTMLTableRowElement => {
          const tr = element(doc, "tr");
          cells.forEach((items, index) => {
            const cell = element(doc, header ? "th" : "td");
            if (header) cell.scope = "col";
            const align = block.align[index];
            if (align) cell.style.textAlign = align;
            cell.append(renderInline(doc, items, href));
            tr.append(cell);
          });
          return tr;
        };
        head.append(row(block.head, true));
        for (const cells of block.rows) body.append(row(cells, false));
        table.append(head, body);
        fragment.append(table);
        break;
      }
      case "quote": {
        const quote = element(doc, "blockquote");
        quote.append(renderBlocks(doc, block.c, href));
        fragment.append(quote);
        break;
      }
      case "pre": {
        const pre = element(doc, "pre");
        pre.append(element(doc, "code", block.v));
        fragment.append(pre);
        break;
      }
      case "hr": fragment.append(element(doc, "hr")); break;
    }
  }
  return fragment;
}
