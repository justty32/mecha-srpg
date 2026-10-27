import { stat, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
export async function createEvidenceBudget(root, evidence) {
  const owned = [
    'render.ts',
    'build-viewer.ts',
    'viewer.js',
    'viewer/drawing.js',
    'viewer/controls.js',
    'viewer/diagnostics.js',
    'viewer/README.md',
    'style-responsive.css',
    'headless-budget.mjs',
    'style.css',
    'index.template.html',
    'verify.ts',
    'headless.mjs',
    'README.md',
    'index.html',
    'generated/assembled.svg',
    'generated/exploded.svg',
    'generated/validation.json',
    'generated/viewer-data.json',
  ];
  const sourceBytes = (
    await Promise.all(owned.map(async (path) => (await stat(new URL(path, root))).size))
  ).reduce((a, b) => a + b, 0);
  async function evidenceBudget() {
    const pngs = (await readdir(evidence)).filter((n) => n.endsWith('.png'));
    assert(pngs.length <= 7, 'Evidence must stay within seven PNGs');
    const bytes =
      sourceBytes +
      (await Promise.all(pngs.map(async (n) => (await stat(new URL(n, evidence))).size))).reduce(
        (a, b) => a + b,
        0,
      );
    assert(
      bytes <= 4970000,
      'Viewer output exceeds 5MB after reserving 30KB for interaction/report',
    );
    return { pngs: pngs.length, bytesExcludingLogAndReport: bytes, reservedBytes: 30000 };
  }
  return evidenceBudget;
}
