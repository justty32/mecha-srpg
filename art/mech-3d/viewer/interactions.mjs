import assert from 'node:assert/strict';
import { delay } from './browser.mjs';

export async function testInteractions(cdp, initial, expected, screenshot, onCheck = () => {}) {
  const checks = [];
  const snap = () => cdp.evaluate('window.__mech3d.snapshot()');
  const check = async (name, callback) => { await callback(); checks.push(name); onCheck(name); };
  const select = async (selector, value) => cdp.evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('change',{bubbles:true}))})()`);
  await check('凍結葉／節點／接合映射與實際3D渲染', async () => {
    assert.equal(initial.leafCount, expected.leafCount);
    assert.equal(initial.nodeCount, expected.nodeCount);
    assert.equal(initial.connectionCount, expected.connectionCount);
    assert.equal(initial.coverageCount, expected.coverageCount);
    assert.equal(initial.visibleIds.length, expected.leafCount);
    assert.ok(initial.solidCount >= expected.leafCount);
  });
  await check('Orbit真實拖曳與正側背相機／像素', async () => {
    const rect = await cdp.evaluate('(() => {const r=document.querySelector("#scene canvas").getBoundingClientRect();return {x:r.x+r.width*.55,y:r.y+r.height*.4}})()');
    await cdp.call('Input.dispatchMouseEvent', { type: 'mousePressed', ...rect, button: 'left', clickCount: 1 });
    for (let step = 1; step <= 6; step++) await cdp.call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x + step * 24, y: rect.y + step * 4, button: 'left', buttons: 1 });
    await cdp.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: rect.x + 144, y: rect.y + 24, button: 'left', clickCount: 1 });
    assert.notDeepEqual((await snap()).camera, initial.camera);
    const samples = [];
    for (const name of ['front', 'side', 'back']) {
      await cdp.click(`[data-camera="${name}"]`);
      await delay(100);
      assert.equal((await snap()).preset, name);
      const pixels = await cdp.evaluate('window.__mech3d.pixels()');
      assert.ok(pixels.unique > 5);
      samples.push(JSON.stringify(pixels.rgba));
      await screenshot(name);
    }
    assert.equal(new Set(samples).size, 3, '三個方向像素不能相同');
    await cdp.click('[data-camera="front"]');
  });
  await check('真物件Raycaster點選與層樹同步', async () => {
    const candidate = initial.visibleIds.find(id => id.includes('head') && id.endsWith('housing'));
    assert.ok(candidate);
    const point = await cdp.evaluate(`window.__mech3d.project(${JSON.stringify(candidate)})`);
    await cdp.call('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await cdp.call('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    const picked = await snap();
    const selected = picked.selectedId;
    assert.ok(selected && initial.visibleIds.includes(selected), JSON.stringify({ selected, point, lastPick: picked.lastPick }));
    assert.equal(await cdp.evaluate(`document.querySelector('[data-action="select"][data-node-id="${selected}"]').parentElement.classList.contains('selected')`), true);
  });
  await check('全部真實層級顯隱／Solo／選取與父層傳遞', async () => {
    const result = await cdp.evaluate(`(() => {
      const api=window.__mech3d,all=api.snapshot().visibleIds,failures=[];
      const buttons=[...document.querySelectorAll('[data-action="visible"]')];
      for(const button of buttons){const id=button.dataset.nodeId,affected=all.filter(leaf=>leaf===id||leaf.startsWith(id+'.'));
        button.click();let s=api.snapshot();if(s.visibleIds.length!==all.length-affected.length||affected.some(leaf=>s.visibleIds.includes(leaf)))failures.push('hide:'+id);
        button.click();if(api.snapshot().visibleIds.length!==all.length)failures.push('show:'+id);
        document.querySelector('[data-action="select"][data-node-id="'+id+'"]').click();if(api.snapshot().selectedId!==id)failures.push('select:'+id);
        document.querySelector('[data-action="solo"][data-node-id="'+id+'"]').click();s=api.snapshot();if(s.visibleIds.length!==affected.length||s.visibleIds.some(leaf=>!affected.includes(leaf)))failures.push('solo:'+id);
        document.querySelector('#clear-solo').click();
      }return {count:buttons.length,failures};})()`);
    assert.equal(result.count, expected.nodeCount);
    assert.deepEqual(result.failures, []);
    await cdp.click('#reset');
    await cdp.evaluate('window.__mech3d.pixels()');
    const before = (await snap()).triangles;
    await cdp.evaluate(`window.__mech3d.visible('root',false)`);
    await cdp.evaluate('window.__mech3d.pixels()');
    const hidden = await snap();
    assert.equal(hidden.visibleIds.length, 0);
    assert.ok(hidden.triangles < before, '隱藏模型後真渲染三角形必須降低');
    await cdp.click('#show-all');
  });
  await check('肩肘膝正式rig、父動子隨', async () => {
    const hand = initial.visibleIds.find(id => id.startsWith('root.arm-left.hand.') && id.endsWith('core'));
    const foot = initial.visibleIds.find(id => id.startsWith('root.leg-left.foot.') && id.endsWith('heel'));
    assert.ok(hand && foot);
    await cdp.key('#shoulder', 'Home', 36);
    const shoulder = await snap();
    assert.notDeepEqual(shoulder.matrices[hand], initial.matrices[hand]);
    assert.deepEqual(shoulder.matrices[foot], initial.matrices[foot]);
    await cdp.key('#elbow', 'Home', 36);
    assert.notDeepEqual((await snap()).matrices[hand], shoulder.matrices[hand]);
    await cdp.key('#knee', 'End', 35);
    assert.notDeepEqual((await snap()).matrices[foot], initial.matrices[foot]);
    await cdp.click('#reset');
  });
  await check('三預設、播放停與精確回初始', async () => {
    await select('#pose', 'guard');
    assert.notDeepEqual((await snap()).matrices, initial.matrices);
    await delay(100);
    await screenshot('guard');
    await select('#pose', 'low');
    assert.notDeepEqual((await snap()).matrices, initial.matrices);
    await cdp.click('#reset');
    await cdp.click('#play');
    assert.equal((await snap()).playing, true, '播放按鈕未啟動');
    let advanced = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      advanced = await cdp.evaluate(`(() => {const s=window.__mech3d.snapshot();return s.pose?.id==='playback'&&Math.abs(s.pose.angles['root.arm-left']??0)>.05})()`);
      if (advanced) break;
      await delay(80);
    }
    assert.equal(advanced, true, '播放未實際推進正式關節角度');
    await cdp.click('#play');
    const paused = await snap();
    assert.equal(paused.playing, false);
    assert.notDeepEqual(paused.matrices, initial.matrices);
    await delay(120);
    assert.deepEqual((await snap()).matrices, paused.matrices);
    await cdp.click('#reset');
    assert.deepEqual((await snap()).matrices, initial.matrices);
  });
  await check('分層爆炸0／1／全部與還原', async () => {
    await cdp.key('#explode', 'End', 35);
    const exploded = await snap();
    assert.equal(exploded.explode, 1);
    assert.notDeepEqual(exploded.matrices, initial.matrices);
    await cdp.key('#depth', 'Home', 36);
    assert.deepEqual((await snap()).matrices, initial.matrices);
    assert.equal((await snap()).visibleIds.length, expected.leafCount);
    await cdp.key('#depth', 'ArrowRight', 39);
    const first = await snap();
    assert.notDeepEqual(first.matrices, initial.matrices);
    await cdp.key('#depth', 'End', 35);
    assert.notDeepEqual((await snap()).matrices, first.matrices);
    await delay(100);
    await screenshot('exploded');
    await cdp.click('#reset');
    assert.deepEqual((await snap()).matrices, initial.matrices);
  });
  await check('反例拒絕非法節點／姿態／爆炸', async () => {
    const rejected = await cdp.evaluate(`(() => {let n=0;const api=window.__mech3d;for(const fn of [()=>api.select('unknown'),()=>api.visible('unknown',false),()=>api.solo('unknown'),()=>api.pose({id:'bad',angles:{unknown:1}}),()=>api.pose({id:'bad',angles:{'root.arm-left':999}}),()=>api.explode(2)])try{fn()}catch{n++}return n})()`);
    assert.equal(rejected, 6);
    assert.deepEqual((await snap()).matrices, initial.matrices);
  });
  await check('DPR／響應式真畫布尺寸', async () => {
    await select('#dpr', '2');
    await delay(80);
    const high = await snap();
    assert.equal(high.dpr, 2);
    assert.equal(high.canvasWidth, high.width * 2);
    assert.equal(high.canvasHeight, high.height * 2);
    await select('#dpr', '1');
    await cdp.call('Emulation.setDeviceMetricsOverride', { width: 720, height: 1000, deviceScaleFactor: 1, mobile: false });
    await delay(100);
    assert.ok((await snap()).width >= 700);
  });
  return checks;
}
