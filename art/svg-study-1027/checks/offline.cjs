'use strict';

module.exports = function ({ assert, fs, path, vm, root, read, data, xml, index, manifest, planFor }) {
  const html = read('index.html');
  for (const name of ['assembly.js', 'mech-tree.js', 'mech-motion.js', 'mech-tree-ui.js', 'demo.js', 'mech-tree.css', 'mech-effects.css']) {
    assert(html.includes(`="${name}"`), `缺離線引用 ${name}`);
    assert(fs.existsSync(path.join(root, name)));
  }
  assert(!/\bfetch\s*\(/.test(read('demo.js') + read('mech-tree-ui.js') + read('mech-motion.js')));
  for (const attr of ['data-mech-tree', 'data-mech-reset', 'data-mech-solo-exit', 'data-mech-play-button', 'data-mech-pause-button', 'data-mech-motion-reset', 'data-mech-arm-pair']) assert(html.includes(attr));
  assert(html.includes('還原可見性') && html.includes('還原演出'));
  const embedded = name => JSON.parse(html.match(new RegExp(`<script type="application/json" ${name}>([\\s\\S]*?)</script>`))[1]);
  assert.deepEqual(embedded('data-mech-layers'), data);
  assert.deepEqual(embedded('data-mech-symbol-leaves'), index);
  for (const attr of ['data-family="portrait"', 'data-layer-switch', 'data-hotspot', 'data-replay']) assert(html.includes(attr));
  const css = read('mech-effects.css');
  for (const key of ['data-mech-phase', 'data-mech-play', 'data-mech-reduced', 'data-mech-selected', 'prefers-reduced-motion', 'paused']) assert(css.includes(key), `效果CSS缺 ${key}`);
  assert(read('mech-tree.css').includes('display: none !important'));
  for (const name of ['assembly.js', 'mech-tree.js', 'mech-motion.js', 'mech-tree-ui.js', 'demo.js', 'check-tree.cjs']) new vm.Script(read(name), { filename: name });
  console.log(JSON.stringify({ result: 'PASS', presets: Object.fromEntries(Object.keys(manifest.presets).map(key => [key, new Set(planFor(key).layers.flatMap(({ id }) => index[id])).size])), runtimeDepth: xml.runtimeDepth, outputDepth: xml.outputDepth, checks: '父子偏好/單看/還原/左右臂連武器批次/換件配色/fallback/instance隔離/原生控件/3600ms暫停續播/重建歸零完整播放/減少動態/隱藏同步/離線嵌入/JS語法；無瀏覽器驗證' }, null, 2));
};
