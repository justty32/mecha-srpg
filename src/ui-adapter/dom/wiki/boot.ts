import { buildWikiIndex } from "../../vm/wiki/index.ts";
import { homeView } from "../../vm/wiki/home.ts";
import { listCategory } from "../../vm/wiki/list.ts";
import { searchWiki } from "../../vm/wiki/search.ts";
import { entryPage } from "../../vm/wiki/cards.ts";
import { timelineView } from "../../vm/wiki/timeline.ts";
import { relationsView } from "../../vm/wiki/relations.ts";
import { wikiKeyHints } from "../../vm/wiki/keys.ts";
import { wikiHref } from "../../vm/route.ts";
import type { RawFile, ListQuery, TimelineQuery } from "../../vm/wiki/types.ts";
import { mountWiki } from "./mount.ts";
import type { WikiApi, WikiMount } from "./mount.ts";
import "./wiki.css";

export function bootWiki(root: HTMLElement, navigate: (hash: string, replace?: boolean) => void): WikiMount {
  // content/index（生成的內容索引）與 content/batches（批次帳本）是 agent 用的帳本，不是百科條目。
  const modules = import.meta.glob<{ default: unknown }>(["/content/**/*.json", "!/content/index/**", "!/content/batches/**"], { eager: true });
  const files: RawFile[] = Object.entries(modules).map(([file, module]) => {
    const [pack, ...path] = file.slice("/content/".length).split("/");
    return { pack: pack!, path: path.join("/"), data: module.default };
  });
  const index = buildWikiIndex(files);
  const api: WikiApi = {
    home: () => homeView(index),
    list: (query: ListQuery) => listCategory(index, query),
    search: (query: string) => searchWiki(index, query),
    entry: (key: string) => entryPage(index, key),
    timeline: (query: TimelineQuery) => timelineView(index, query),
    relations: () => relationsView(index),
  };
  return mountWiki(root, { api, href: wikiHref, navigate, keyHints: wikiKeyHints() });
}
