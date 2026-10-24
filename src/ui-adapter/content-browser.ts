// ui-adapter/content-browser — 瀏覽器端載入內容包：Vite 的 import.meta.glob 把 content/<pack>/**/*.json 打包進來，
// 交給 content 的 loadPacks（純函式，不碰 fs）。node 端改用 loadContentDirs。
import { loadPacks } from "../content/loader.ts";
import type { LoadResult, PackFiles } from "../content/loader.ts";

/** 把 glob 結果（鍵為 "/content/base/abilities/x.json"）依 pack 目錄分組成 PackFiles。 */
export function packsFromGlob(modules: Record<string, unknown>): PackFiles[] {
  const byRoot = new Map<string, Record<string, unknown>>();
  for (const key of Object.keys(modules).sort()) {
    const m = /^\/?(content\/[^/]+)\/(.+\.json)$/.exec(key);
    if (!m) continue;
    const root = m[1]!, rel = m[2]!;
    const mod = modules[key] as { default?: unknown };
    const files = byRoot.get(root) ?? Object.create(null) as Record<string, unknown>;
    files[rel] = mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
    byRoot.set(root, files);
  }
  return [...byRoot].map(([root, files]) => ({ root, files }));
}

export function loadBrowserContent(modules: Record<string, unknown>): LoadResult {
  return loadPacks(packsFromGlob(modules));
}
