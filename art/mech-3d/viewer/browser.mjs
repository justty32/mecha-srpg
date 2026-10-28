import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

export const delay = milliseconds => new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));

export async function launchBrowser(repo) {
  const scratch = resolve(repo, 'node_modules/.mech3d-tools');
  const run = new Date().toISOString().replace(/[:.]/g, '-');
  const profile = resolve(scratch, `browser-${run}`);
  await mkdir(profile, { recursive: true });
  const executable = resolve(homedir(), '.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');
  const environment = {
    ...process.env,
    LD_LIBRARY_PATH: resolve(repo, 'node_modules/.canvas-headless/root/usr/lib/x86_64-linux-gnu'),
    XDG_CACHE_HOME: resolve(scratch, 'xdg-cache'), XDG_CONFIG_HOME: resolve(scratch, 'xdg-config'),
  };
  const ldd = execFileSync('ldd', [executable], { env: environment, encoding: 'utf8' });
  if (ldd.includes('not found')) throw new Error('既有 Chromium 缺函式庫，停止啟動');
  const child = spawn(executable, [
    '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu-sandbox',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist', '--enable-webgl', '--disable-background-networking',
    '--disable-component-update', '--disable-default-apps', '--disable-extensions',
    '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, `--disk-cache-dir=${resolve(scratch, 'browser-cache')}`, 'about:blank',
  ], { env: environment, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', bytes => { stderr += bytes; });
  let endpoint;
  for (let index = 0; index < 200; index++) {
    if (child.exitCode !== null) throw new Error(`Chromium 提早退出 ${child.exitCode}: ${stderr.slice(-500)}`);
    const port = await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8').catch(() => '');
    if (port) {
      const [number, path] = port.trim().split('\n');
      endpoint = `ws://127.0.0.1:${number}${path}`;
      break;
    }
    await delay(100);
  }
  if (!endpoint) { child.kill('SIGTERM'); throw new Error('Chromium DevTools 未啟動'); }
  return {
    endpoint, profile,
    async close(cdp) {
      if (cdp) await cdp.call('Browser.close', {}, null).catch(() => {});
      if (child.exitCode === null) await Promise.race([new Promise(resolveExit => child.once('exit', resolveExit)), delay(2000)]);
      if (child.exitCode === null) child.kill('SIGTERM');
      cdp?.close();
      await writeFile(resolve(scratch, `chromium-${run}.log`), stderr);
    },
  };
}
