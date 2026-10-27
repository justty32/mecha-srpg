'use strict';

module.exports = function ({ assert, manifest, planFor, fallback, Element, a, b, doc, hiddenState }) {
  // 可控時鐘驗證真實DOM適配的播放、暫停、續播、重播、fallback與減少動態。
  let time = 0;
  let nextTimer = 0;
  const timers = new Map();
  const media = { matches: false, addEventListener(name, listener) { this.listener = listener; } };
  const motionRoot = new Element('fieldset', {}, [
    new Element('button', { 'data-mech-play-button': '' }), new Element('button', { 'data-mech-pause-button': '' }),
    new Element('button', { 'data-mech-motion-reset': '' }), new Element('p', { 'data-mech-motion-status': '' })
  ]);
  const motion = MechMotion.mount(motionRoot, {
    now: () => time,
    schedule: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, at: time + delay }); return id; },
    cancel: id => timers.delete(id), media
  });
  function elapse(delta) {
    const target = time + delta;
    while (true) {
      const next = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      time = next[1].at; timers.delete(next[0]); next[1].callback();
    }
    time = target;
  }
  const clickMotion = attr => motionRoot.querySelector(`[${attr}]`).fire('click');
  motion.bind(planFor('cold'), a);
  assert.equal(a.getAttribute('data-mech-phase'), 'idle');
  clickMotion('data-mech-play-button');
  assert.equal(motion.getState().phase, 'sensors');
  elapse(600); clickMotion('data-mech-pause-button');
  assert.equal(motion.getState().elapsed, 600);
  assert.equal(a.getAttribute('data-mech-play'), 'paused');
  elapse(5000); assert.equal(motion.getState().elapsed, 600);
  clickMotion('data-mech-play-button');
  elapse(599); assert.equal(motion.getState().phase, 'sensors');
  elapse(1); assert.equal(motion.getState().phase, 'sweep');
  media.listener({ matches: true });
  assert.equal(a.getAttribute('data-mech-reduced'), 'true');
  assert.equal(motion.getState().phase, 'sweep');
  elapse(1200); assert.equal(motion.getState().phase, 'energy');
  MechTreeUI.applyVisibility(a, hiddenState);
  assert(a.querySelectorAll('[data-mech-hidden]').length > 0, '演出不能清掉隱藏葉');
  function assertFreshSequence(reason) {
    assert.equal(motion.getState().phase, 'idle', reason);
    assert.equal(motion.getState().elapsed, 0, reason);
    assert.equal(timers.size, 0, reason);
    clickMotion('data-mech-play-button');
    elapse(1199); assert.equal(motion.getState().phase, 'sensors', reason);
    elapse(1); assert.equal(motion.getState().phase, 'sweep', reason);
    elapse(1200); assert.equal(motion.getState().phase, 'energy', reason);
    elapse(1199); assert.equal(motion.getState().phase, 'energy', reason);
    elapse(1); assert.equal(motion.getState().phase, 'idle', reason);
    assert.equal(timers.size, 0, reason);
  }
  const swapRecipe = Assembly.recipeFromPreset(manifest, 'feral');
  ArtDemo.assemble(doc, b, manifest, swapRecipe.parts);
  motion.bind(Assembly.assemble(manifest, swapRecipe), b);
  assertFreshSequence('播放途中換件後重新完整播放3600ms');
  clickMotion('data-mech-play-button'); elapse(1600);
  const paintRecipe = { ...swapRecipe, colors: { '#263e40': '#445566' } };
  ArtDemo.assemble(doc, b, manifest, paintRecipe.parts, paintRecipe.colors);
  motion.bind(Assembly.assemble(manifest, paintRecipe), b);
  assertFreshSequence('播放途中配色重建後重新完整播放3600ms');
  clickMotion('data-mech-play-button'); elapse(1300);
  const phaseWrites = [];
  const originalSet = b.setAttribute.bind(b);
  b.setAttribute = (name, value) => { if (name === 'data-mech-phase') phaseWrites.push(value); originalSet(name, value); };
  clickMotion('data-mech-play-button'); assert.equal(motion.getState().phase, 'sensors');
  assert.deepEqual(phaseWrites.slice(-2), ['idle', 'sensors'], '重播必須重啟CSS相位');
  clickMotion('data-mech-motion-reset'); assert.equal(motion.getState().elapsed, 0);
  assert.equal(motion.getState().phase, 'idle'); assert.equal(timers.size, 0);
  clickMotion('data-mech-play-button');
  motion.bind(fallback, null); assert.equal(timers.size, 0); assert(motionRoot.querySelector('[data-mech-play-button]').disabled);
  motion.bind(planFor('cold'), a); assert.equal(a.getAttribute('data-mech-phase'), 'idle');
  assert.equal(a.getAttribute('data-mech-reduced'), 'true');
};
