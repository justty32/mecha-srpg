/* 單次3.6秒時序與DOM適配；純函式可用Node驗證，初始靜止。 */
(() => {
  'use strict';
  const phaseDuration = 1200;
  const duration = phaseDuration * 3;
  function createState(reduced = false) {
    return { elapsed: 0, phase: 'idle', play: 'paused', reduced: Boolean(reduced) };
  }
  function reset(state) {
    return createState(state.reduced);
  }
  function play(state) {
    return state.phase === 'idle' ? { ...state, elapsed: 0, phase: 'sensors', play: 'running' } : { ...state, play: 'running' };
  }
  function pause(state) {
    return { ...state, play: 'paused' };
  }
  function advance(state, delta) {
    if (!Number.isFinite(delta) || delta < 0) throw new Error('時間增量必須非負');
    if (state.play !== 'running') return state;
    const elapsed = state.elapsed + delta;
    if (elapsed >= duration) return reset(state);
    return { ...state, elapsed, phase: ['sensors', 'sweep', 'energy'][Math.floor(elapsed / phaseDuration)] };
  }
  function setReduced(state, reduced) {
    return { ...state, reduced: Boolean(reduced) };
  }
  function apply(instance, state) {
    if (!instance) return;
    instance.setAttribute('data-mech-phase', state.phase);
    instance.setAttribute('data-mech-play', state.play);
    instance.setAttribute('data-mech-reduced', String(state.reduced));
  }
  function mount(root, options = {}) {
    const now = options.now || (() => performance.now());
    const schedule = options.schedule || ((callback, delay) => setTimeout(callback, delay));
    const cancel = options.cancel || (timer => clearTimeout(timer));
    const media = options.media || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    let state = createState(media?.matches);
    let instance;
    let enabled = false;
    let timer;
    let last = now();
    const startButton = root.querySelector('[data-mech-play-button]');
    const pauseButton = root.querySelector('[data-mech-pause-button]');
    const resetButton = root.querySelector('[data-mech-motion-reset]');
    const status = root.querySelector('[data-mech-motion-status]');
    function tick() {
      const current = now();
      state = advance(state, Math.max(0, current - last));
      last = current;
    }
    function refresh() {
      apply(instance, state);
      startButton.disabled = !enabled;
      pauseButton.disabled = !enabled || state.play !== 'running';
      resetButton.disabled = !enabled;
      startButton.textContent = state.phase !== 'idle' && state.play === 'paused' ? '繼續播放' : '啟動／從頭播放';
      const names = { idle: '靜止', sensors: '感測器啟動', sweep: '甲面掠光', energy: '散熱與能量流' };
      status.textContent = enabled ? `${names[state.phase]}${state.phase !== 'idle' && state.play === 'paused' ? '（已暫停）' : ''}${state.reduced ? '；減少動態：靜態高亮' : ''}。` : '完整立繪模式停用演出。';
    }
    function arm() {
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      if (enabled && state.play === 'running') timer = schedule(() => {
        timer = undefined;
        tick();
        refresh();
        arm();
      }, phaseDuration - state.elapsed % phaseDuration);
    }
    startButton.addEventListener('click', () => {
      if (!enabled) return;
      tick();
      // 執行中按播放由頭開始；暫停中按播放則續播。
      const restart = state.play === 'running';
      state = play(restart ? reset(state) : state);
      if (restart && instance) {
        // 同一phase重播也先結束舊CSS動畫，再由refresh套新phase。
        instance.setAttribute('data-mech-phase', 'idle');
        instance.getBoundingClientRect?.();
      }
      last = now();
      refresh();
      arm();
    });
    pauseButton.addEventListener('click', () => {
      if (!enabled) return;
      tick();
      state = pause(state);
      refresh();
      arm();
    });
    resetButton.addEventListener('click', () => {
      state = reset(state);
      last = now();
      refresh();
      arm();
    });
    media?.addEventListener('change', event => {
      tick();
      state = setReduced(state, event.matches);
      refresh();
      arm();
    });
    refresh();
    return {
      bind(plan, nextInstance) {
        // 重建幾何的CSS時鐘由頭開始，JS亦歸零，不沿用舊instance時間。
        enabled = plan.kind === 'parts';
        instance = nextInstance;
        state = reset(state);
        last = now();
        refresh();
        arm();
      },
      getState: () => state
    };
  }
  globalThis.MechMotion = { phaseDuration, duration, createState, reset, play, pause, advance, setReduced, apply, mount };
})();
