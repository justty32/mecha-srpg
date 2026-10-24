import { formatRoute, parseHash, wikiHref } from "../vm/route.ts";
import { resolveWikiKey } from "../vm/wiki/keys.ts";
import type { AppRoute } from "../vm/wiki/types.ts";
import type { KeyInput } from "../vm/types.ts";
import type { WikiMount } from "./wiki/mount.ts";

export type ShellPages = Record<AppRoute["page"], HTMLElement>;
export type ShellOptions = {
  onRoute(route: AppRoute, pages: ShellPages): void;
  getWiki(): WikiMount | null;
  onBattleKey?(key: KeyInput): boolean;
};

export function mountShell(root: HTMLElement, opts: ShellOptions) {
  const doc = root.ownerDocument, host = doc.defaultView!;
  const nav = doc.createElement("nav");
  nav.dataset.ui = "app-nav";
  nav.setAttribute("aria-label", "主導航");
  const pages = {} as ShellPages;
  const links = new Map<AppRoute["page"], HTMLAnchorElement>();
  for (const [page, label] of [["battle", "戰鬥"], ["wiki", "百科 F1"], ["ops", "營運"]] as const) {
    const link = doc.createElement("a");
    link.dataset.nav = page;
    link.href = `#/${page}`;
    link.textContent = label;
    nav.append(link);
    links.set(page, link);
    const container = doc.createElement("section");
    container.dataset.page = page;
    container.hidden = true;
    pages[page] = container;
  }
  pages.ops.textContent = "營運畫面尚未開放";
  root.replaceChildren(nav, pages.battle, pages.wiki, pages.ops);
  let current: AppRoute = { page: "battle" };
  const show = (): void => {
    const route = parseHash(host.location.hash);
    const returning = current.page !== "battle" && route.page === "battle";
    current = route;
    for (const page of ["battle", "wiki", "ops"] as const) {
      pages[page].hidden = route.page !== page;
      if (page === route.page) links.get(page)!.setAttribute("aria-current", "page");
      else links.get(page)!.removeAttribute("aria-current");
    }
    opts.onRoute(route, pages);
    if (returning) host.dispatchEvent(new host.Event("resize"));
  };
  const navigate = (hash: string, replace = false): void => {
    // 僅更換 hash，保留 scenario／seed／size／anim／spectate 等 query。
    if (replace) { host.history.replaceState(null, "", hash); show(); }
    else if (host.location.hash === hash) show();
    else host.location.hash = hash;
  };
  const keydown = (event: KeyboardEvent): void => {
    if (root.closest("[hidden]")) return;
    const active = doc.activeElement as HTMLElement | null;
    const target = event.target as HTMLElement | null;
    const editing = active?.matches("input, textarea, select") || target?.matches?.("input, textarea, select");
    // 輸入中只認 F1／Escape；其他鍵照常打字（不攔、不 stopPropagation，輸入框自己的 listener 仍收得到）。
    if (editing && event.key !== "F1" && event.key !== "Escape") return;
    if (current.page === "battle") {
      // 輸入元件中的 F1／Esc 仍交給既有戰鬥 keymap；其他按鍵由戰鬥 listener 收。
      if (editing && opts.onBattleKey?.(event)) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (current.page !== "wiki" || pages.wiki.closest("[hidden]")) return;
    const action = resolveWikiKey(event);
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    const wiki = opts.getWiki();
    switch (action) {
      case "nav:battle": navigate(formatRoute({ page: "battle" })); break;
      case "wiki:home": navigate(wikiHref({ v: "home" })); break;
      case "wiki:timeline": navigate(wikiHref({ v: "timeline", query: {} })); break;
      case "wiki:relations": navigate(wikiHref({ v: "relations" })); break;
      case "wiki:search": wiki?.focusSearch(); break;
      case "wiki:help": wiki?.toggleHelp(); break;
      case "wiki:sidebar": wiki?.toggleSidebar(); break;
      case "wiki:blur": active?.blur(); break;
    }
  };
  host.addEventListener("hashchange", show);
  doc.addEventListener("keydown", keydown, true);
  show();
  return {
    pages, navigate,
    destroy(): void {
      host.removeEventListener("hashchange", show);
      doc.removeEventListener("keydown", keydown, true);
      root.replaceChildren();
    },
  };
}
