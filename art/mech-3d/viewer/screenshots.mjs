import assert from 'node:assert/strict';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function measureArtifacts(directory) {
  let bytes = 0;
  let pngCount = 0;
  let pngBytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      const child = await measureArtifacts(path);
      bytes += child.bytes; pngCount += child.pngCount; pngBytes += child.pngBytes;
    } else {
      const size = (await stat(path)).size;
      bytes += size;
      if (entry.name.endsWith('.png')) { pngCount++; pngBytes += size; }
    }
  }
  return { bytes, pngCount, pngBytes };
}

export function createScreenshotWriter(cdp, base) {
  return async name => {
    assert.ok(['hero', 'front', 'side', 'back', 'guard', 'exploded'].includes(name), '只能保存約定6張PNG');
    const before = await measureArtifacts(base);
    const path = resolve(base, 'viewer/evidence', `${name}.png`);
    const previous = await stat(path).then(file => file.size).catch(() => 0);
    assert.ok(before.pngCount + (previous ? 0 : 1) <= 6, 'PNG超過6張');
    const shot = await cdp.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const bytes = Buffer.from(shot.data, 'base64');
    const projected = { bytes: before.bytes - previous + bytes.length, pngBytes: before.pngBytes - previous + bytes.length };
    assert.ok(projected.bytes <= 25_000_000, `產物超25MB：${projected.bytes}`);
    assert.ok(projected.pngBytes <= 8_000_000, `PNG超8MB目標，先回報領導：${projected.pngBytes}`);
    await writeFile(path, bytes);
    return { path, bytes: bytes.length, ...projected };
  };
}
