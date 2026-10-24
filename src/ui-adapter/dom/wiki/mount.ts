import type { EntryPage, HomeView, ListQuery, ListView, RelationsView, SearchHit, TimelineQuery, TimelineView, WikiView } from "../../vm/wiki/types.ts";
import { element, viewLink } from "./markdown-dom.ts";
import { renderEntry } from "./card-dom.ts";
import { renderHome, renderList, renderRelations, renderSearch, renderTimeline } from "./pages.ts";

export type WikiApi = {
  home(): HomeView;
  list(query: ListQuery): ListView | null;
  search(query: string): SearchHit[];
  entry(key: string): EntryPage | null;
  timeline(query: TimelineQuery): TimelineView;
  relations(): RelationsView;
};
export type WikiMountOptions = {
  api: WikiApi;
  href(view: WikiView): string;
  navigate(hash: string, replace?: boolean): void;
  keyHints: { label: string; keys: string[] }[];
};
export type WikiMount = {
  show(view: WikiView): void;
  focusSearch(): void;
  toggleHelp(): void;
  toggleSidebar(): void;
  destroy(): void;
};

export function mountWiki(root: HTMLElement, opts: WikiMountOptions): WikiMount {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  let destroyed = false;
  let timer: number | undefined;
  const previousUi = root.getAttribute("data-ui");
  const hadClass = root.classList.contains("wiki-view");
  root.classList.add("wiki-view");
  root.dataset.ui = "wiki";
  const header = element(doc, "header");
  header.className = "wiki-header";
  const search = element(doc, "input");
  search.type = "search";
  search.dataset.ui = "wiki-search";
  search.placeholder = "搜尋百科…";
  search.setAttribute("aria-label", "搜尋百科");
  const sidebarButton = element(doc, "button", "分類");
  sidebarButton.type = "button";
  sidebarButton.dataset.ui = "wiki-sidebar-toggle";
  sidebarButton.setAttribute("aria-expanded", "false");
  const helpButton = element(doc, "button", "快捷鍵說明");
  helpButton.type = "button";
  helpButton.setAttribute("aria-expanded", "false");
  header.append(element(doc, "strong", "百科"), search, sidebarButton, helpButton);
  const sidebar = element(doc, "nav");
  sidebar.dataset.ui = "wiki-sidebar";
  sidebar.setAttribute("aria-label", "百科分類");
  for (const [label, view] of [["首頁", { v: "home" }], ["年表", { v: "timeline", query: {} }], ["勢力關係", { v: "relations" }]] as const) {
    sidebar.append(viewLink(doc, label, view, opts.href));
  }
  for (const group of opts.api.home().groups) {
    const section = element(doc, "section");
    section.append(element(doc, "h2", group.label));
    for (const category of group.categories) {
      const link = viewLink(doc, "", { v: "cat", query: { category: category.key } }, opts.href);
      const count = element(doc, "span", String(category.count));
      count.className = "wiki-count";
      count.setAttribute("aria-label", `${category.count} 筆`);
      link.append(element(doc, "span", category.label), count);
      link.dataset.cat = category.key;
      section.append(link);
    }
    sidebar.append(section);
  }
  const main = element(doc, "main");
  main.dataset.ui = "wiki-main";
  const help = element(doc, "aside");
  help.dataset.ui = "wiki-help";
  help.hidden = true;
  help.setAttribute("aria-label", "百科快捷鍵說明");
  help.append(element(doc, "h2", "快捷鍵說明"));
  const hints = element(doc, "table");
  for (const hint of opts.keyHints) {
    const row = element(doc, "tr");
    const keys = element(doc, "td");
    for (const key of hint.keys) keys.append(element(doc, "kbd", key), doc.createTextNode(" "));
    row.append(element(doc, "th", hint.label), keys);
    hints.append(row);
  }
  help.append(hints);
  root.replaceChildren(header, sidebar, main, help);

  const setSidebar = (open: boolean): void => {
    root.classList.toggle("wiki-sidebar-open", open);
    sidebarButton.setAttribute("aria-expanded", String(open));
  };
  const cancelSearch = (): void => {
    if (timer !== undefined) win?.clearTimeout(timer);
    timer = undefined;
  };
  const navigate = (view: WikiView): void => opts.navigate(opts.href(view));
  const onInput = (): void => {
    cancelSearch();
    timer = win?.setTimeout(() => {
      timer = undefined;
      if (!destroyed) opts.navigate(opts.href({ v: "search", q: search.value }), true);
    }, 120);
  };
  const onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = event.target;
    if (!win || !(target instanceof win.Element)) return;
    const link = target.closest<HTMLAnchorElement>("a[data-wiki-link]");
    if (!link || !root.contains(link)) return;
    event.preventDefault();
    cancelSearch();
    if (sidebar.contains(link)) setSidebar(false);
    opts.navigate(link.getAttribute("href")!);
  };
  const onKey = (event: KeyboardEvent): void => {
    if (root.closest("[hidden]")) return;
    const active = doc.activeElement;
    if (event.key === "Escape" && active && root.contains(active) && active.matches("input, select, textarea")) {
      (active as HTMLElement).blur();
      event.preventDefault();
    }
  };
  const toggleHelp = (): void => {
    if (destroyed) return;
    help.hidden = !help.hidden;
    helpButton.setAttribute("aria-expanded", String(!help.hidden));
  };
  const toggleSidebar = (): void => {
    if (!destroyed) setSidebar(!root.classList.contains("wiki-sidebar-open"));
  };
  search.addEventListener("input", onInput);
  root.addEventListener("click", onClick);
  doc.addEventListener("keydown", onKey);
  sidebarButton.addEventListener("click", toggleSidebar);
  helpButton.addEventListener("click", toggleHelp);

  return {
    show(view) {
      if (destroyed) return;
      cancelSearch();
      if (view.v === "search" && search.value !== view.q) search.value = view.q;
      let content: HTMLElement;
      switch (view.v) {
        case "home": content = renderHome(doc, opts.api.home(), opts.href); break;
        case "cat": {
          const result = opts.api.list(view.query);
          // SPEC-GAP：空分類／條目的頁面未定義，最小解為清楚的未建立提示。
          content = result ? renderList(doc, result, opts.href, navigate) : element(doc, "p", "分類未建立。");
          break;
        }
        case "entry": {
          const result = opts.api.entry(view.key);
          content = result ? renderEntry(doc, result, opts.href) : element(doc, "p", "條目未建立。");
          break;
        }
        case "search": content = renderSearch(doc, opts.api.search(view.q), view.q, opts.href); break;
        case "timeline": content = renderTimeline(doc, opts.api.timeline(view.query), opts.href, navigate); break;
        case "relations": content = renderRelations(doc, opts.api.relations(), opts.href); break;
      }
      main.replaceChildren(content);
      main.scrollTop = 0;
      for (const link of sidebar.querySelectorAll<HTMLAnchorElement>("a[data-wiki-link]")) {
        const selected = view.v === "cat" && link.dataset.cat === view.query.category || link.getAttribute("href") === opts.href(view);
        if (selected) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    },
    focusSearch() { if (!destroyed && !root.closest("[hidden]")) search.focus(); },
    toggleHelp,
    toggleSidebar,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelSearch();
      doc.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      search.removeEventListener("input", onInput);
      sidebarButton.removeEventListener("click", toggleSidebar);
      helpButton.removeEventListener("click", toggleHelp);
      root.replaceChildren();
      root.classList.remove("wiki-sidebar-open");
      if (!hadClass) root.classList.remove("wiki-view");
      if (previousUi === null) root.removeAttribute("data-ui");
      else root.setAttribute("data-ui", previousUi);
    },
  };
}
