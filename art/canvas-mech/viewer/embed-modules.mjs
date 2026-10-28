import { readFile } from 'node:fs/promises';
import { dirname, resolve, sep, relative } from 'node:path';

// 保留 ESM 語意，把相對 import 改成 HTML 內嵌的 data URL。
// 不需額外 bundler，也不會在 file: 執行時讀取外部模組。
export function createModuleEmbedder(base, { importMap = false } = {}) {
  const cache = new Map();
  const entries = new Map();
  async function embed(path, chain = []) {
    const absolute = resolve(base, path);
    if (!absolute.startsWith(resolve(base) + sep)) throw new Error('模組不可離開 canvas-mech');
    if (chain.includes(absolute)) throw new Error(`內嵌器不支援循環模組：${absolute}`);
    if (cache.has(absolute)) return cache.get(absolute);
    const key = `@canvas-mech/${relative(base, absolute).split(sep).join('/')}`;
    const register = url => {
      if (importMap) entries.set(key, url);
      const reference = importMap ? key : url;
      cache.set(absolute, reference);
      return reference;
    };
    const source = await readFile(absolute, 'utf8');
    if (absolute.endsWith('.json')) {
      JSON.parse(source);
      const url = `data:application/json;base64,${Buffer.from(source).toString('base64')}`;
      return register(url);
    }
    if (/\bimport\s*\(/.test(source)) throw new Error(`內嵌來源不得動態 import：${absolute}`);
    const pattern = /(^\s*(?:import|export)\s+(?:[^;'"=]*?\s+from\s*)?)(['"])([^'"\n]+)\2/gm;
    const matches = [...source.matchAll(pattern)];
    let output = '';
    let cursor = 0;
    for (const match of matches) {
      const specifier = match[3];
      if (!specifier.startsWith('.')) throw new Error(`只支援離線相對 ESM import：${specifier}`);
      const dependency = resolve(dirname(absolute), specifier);
      if (!/\.(?:js|json)$/.test(dependency)) throw new Error(`只支援明列 .js／.json 模組：${specifier}`);
      if (dependency.endsWith('.json')) {
        const tail = source.slice(match.index + match[0].length);
        if (!/^\s+with\s*\{\s*type\s*:\s*(['"])json\1\s*\}/.test(tail)) {
          throw new Error(`JSON import 必須明列 with { type: 'json' }：${specifier}`);
        }
      }
      const url = await embed(dependency, [...chain, absolute]);
      output += source.slice(cursor, match.index) + match[1] + JSON.stringify(url);
      cursor = match.index + match[0].length;
    }
    output += source.slice(cursor);
    const url = `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
    return register(url);
  }
  return { embed, get moduleCount() { return cache.size; }, get importMap() { return { imports: Object.fromEntries(entries) }; } };
}
