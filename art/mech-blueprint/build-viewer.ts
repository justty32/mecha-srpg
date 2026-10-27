import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import { loadBlueprint } from './build.ts';
import { buildLayout } from './layout.ts';
import { verifyBlueprint } from './verify.ts';
import { renderBlueprint, explodedMatrix } from './render.ts';
import type { Attachment, Diagnostic, OverlapRule } from './schema.ts';
async function inlineViewer(source: string, directory: string): Promise<string> {
  const markers = [...source.matchAll(/\/\* @inline (viewer\/[a-z-]+\.js) \*\//g)];
  for (const marker of markers)
    source = source.replace(marker[0], await readFile(resolve(directory, marker[1]!), 'utf8'));
  return source;
}
export async function buildViewer(directory = fileURLToPath(new URL('./', import.meta.url))) {
  const blueprint = await loadBlueprint(directory),
    layoutResult = buildLayout(blueprint),
    diagnostics: Diagnostic[] = [...layoutResult.diagnostics];
  async function json(name: string) {
    return JSON.parse(await readFile(resolve(directory, 'data', name + '.json'), 'utf8'));
  }
  let attachments: Attachment[] = [],
    overlaps: OverlapRule[] = [];
  try {
    const data = await json('attachments');
    attachments = Array.isArray(data) ? data : data.attachments;
    if (!Array.isArray(attachments)) throw new Error('attachments must be an array');
  } catch (e) {
    attachments = [];
    diagnostics.push({ code: 'attachments-data', severity: 'error', ids: [], message: String(e) });
  }
  try {
    const data = await json('overlaps');
    overlaps = Array.isArray(data) ? data : (data.rules ?? data.overlaps);
    if (!Array.isArray(overlaps)) throw new Error('overlaps must be an array');
  } catch (e) {
    overlaps = [];
    diagnostics.push({ code: 'overlaps-data', severity: 'error', ids: [], message: String(e) });
  }
  const sources: Record<string, string> = {};
  for (const a of attachments)
    try {
      const path = resolve(directory, a.source);
      if (!path.startsWith(resolve(directory) + sep))
        throw new Error('Source escapes blueprint directory');
      sources[a.id] = await readFile(path, 'utf8');
    } catch (e) {
      diagnostics.push({ code: 'source-read', severity: 'error', ids: [a.id], message: String(e) });
    }
  const input = {
    ...blueprint,
    layout: layoutResult.layout,
    orders: layoutResult.workOrders,
    attachments,
    sources,
    overlaps,
  };
  const verified = verifyBlueprint(input);
  diagnostics.push(...verified.diagnostics);
  const validation = {
    version: blueprint.design.version,
    summary: verified.summary,
    errors: diagnostics.filter((d) => d.severity === 'error').length,
    diagnostics,
  };
  const [template, style, rigSource, viewer] = await Promise.all(
    ['index.template.html', 'style.css', 'rig.ts', 'viewer.js'].map((name) =>
      readFile(resolve(directory, name), 'utf8'),
    ),
  );
  const responsiveStyle = await readFile(resolve(directory, 'style-responsive.css'), 'utf8');
  const viewerRuntime = await inlineViewer(viewer!, directory);
  const rigRuntime =
    stripTypeScriptTypes(rigSource!, { mode: 'strip' })
      .replace(/^import[^\n]*\n/gm, '')
      .replace(/\bexport\s+/g, '') +
    '\n' +
    explodedMatrix.toString();
  if (/^\s*(import|export)\b/m.test(rigRuntime))
    throw new Error('Unresolved runtime module syntax');
  const invalidSources = new Set(
    diagnostics.filter((d) => d.code === 'svg-geometry').flatMap((d) => d.ids),
  );
  const safeSources = Object.fromEntries(
    Object.entries(sources).filter(([id]) => !invalidSources.has(id)),
  );
  const rendered = renderBlueprint(
    { ...input, sources: safeSources, diagnostics },
    {
      template: template!,
      style: style! + '\n' + responsiveStyle,
      rigRuntime,
      viewer: viewerRuntime,
    },
  );
  const files: Record<string, string> = {
    'index.html': rendered.html,
    'generated/assembled.svg': rendered.assembled,
    'generated/exploded.svg': rendered.exploded,
    'generated/validation.json': JSON.stringify(validation, null, 2) + '\n',
    'generated/viewer-data.json': JSON.stringify(rendered.viewerData) + '\n',
  };
  // 本線整體5MB上限；先限制此批生成輸出，避免大診斷寫滿工作區。
  const bytes = Object.values(files).reduce((n, s) => n + Buffer.byteLength(s), 0);
  if (bytes > 3500000)
    throw new Error(`Generated viewer output ${bytes} bytes exceeds reserved 3.5MB budget`);
  await mkdir(resolve(directory, 'generated'), { recursive: true });
  for (const [path, content] of Object.entries(files))
    await writeFile(resolve(directory, path), content);
  return validation;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await buildViewer();
  console.log(JSON.stringify({ errors: r.errors, ...r.summary }));
  if (r.errors) process.exitCode = 1;
}
