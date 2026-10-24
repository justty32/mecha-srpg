import type { AppRoute, ListQuery, WikiView } from "./wiki/types.ts";

const home = (): AppRoute => ({ page: "wiki", view: { v: "home" } });

export function parseHash(hash: string): AppRoute {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const split = raw.indexOf("?");
  const path = split < 0 ? raw : raw.slice(0, split);
  if (path === "/ops") return { page: "ops" };
  if (!path.startsWith("/wiki")) return { page: "battle" };
  try {
    const params = new Map<string, string>();
    for (const pair of (split < 0 ? "" : raw.slice(split + 1)).split("&")) {
      if (!pair) continue;
      const equal = pair.indexOf("=");
      const decode = (value: string): string => decodeURIComponent(value.replace(/\+/gu, " "));
      const name = decode(equal < 0 ? pair : pair.slice(0, equal));
      if (!params.has(name)) params.set(name, decode(equal < 0 ? "" : pair.slice(equal + 1)));
    }
    const parts = path.split("/");
    if (parts.length === 4 && parts[3]) {
      const key = decodeURIComponent(parts[3]);
      if (parts[2] === "e") return { page: "wiki", view: { v: "entry", key } };
      if (parts[2] === "c") {
        const query: ListQuery = { category: key };
        const sort = params.get("sort");
        if (sort === "name" || sort === "grade" || sort === "id") query.sort = sort;
        if (params.has("desc")) query.desc = params.get("desc") === "1";
        const filters = Object.fromEntries([...params].filter(([name]) => name !== "sort" && name !== "desc"));
        if (Object.keys(filters).length) query.filters = filters;
        return { page: "wiki", view: { v: "cat", query } };
      }
    }
    if (path === "/wiki/s") return { page: "wiki", view: { v: "search", q: params.get("q") ?? "" } };
    if (path === "/wiki/timeline") {
      const query = Object.fromEntries(["faction", "era", "tag"].flatMap(key => params.has(key) ? [[key, params.get(key)!]] : []));
      return { page: "wiki", view: { v: "timeline", query } };
    }
    if (path === "/wiki/relations") return { page: "wiki", view: { v: "relations" } };
  } catch { /* SPEC-GAP：壞百分比編碼與未知百科路徑同樣回首頁。 */ }
  return home();
}

function queryString(pairs: [string, string][]): string {
  return pairs.length ? `?${pairs.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")}` : "";
}

export function wikiHref(view: WikiView): string {
  switch (view.v) {
    case "home": return "#/wiki";
    case "entry": return `#/wiki/e/${encodeURIComponent(view.key)}`;
    case "search": return `#/wiki/s${queryString([["q", view.q]])}`;
    case "relations": return "#/wiki/relations";
    case "timeline": return `#/wiki/timeline${queryString(Object.entries(view.query))}`;
    case "cat": {
      const pairs: [string, string][] = [];
      if (view.query.sort) pairs.push(["sort", view.query.sort]);
      if (view.query.desc !== undefined) pairs.push(["desc", view.query.desc ? "1" : "0"]);
      for (const [key, value] of Object.entries(view.query.filters ?? {})) {
        if (key !== "sort" && key !== "desc") pairs.push([key, value]);
      }
      return `#/wiki/c/${encodeURIComponent(view.query.category)}${queryString(pairs)}`;
    }
  }
}

export function formatRoute(route: AppRoute): string {
  return route.page === "wiki" ? wikiHref(route.view) : `#/${route.page}`;
}
