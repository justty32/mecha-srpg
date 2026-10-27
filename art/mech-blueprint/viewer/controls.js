function pause() {
  state.playing = false;
  $('play').textContent = '播放';
}
document.querySelectorAll('[data-mode]').forEach(
  (button) =>
    (button.onclick = () => {
      state.mode = button.dataset.mode;
      document
        .querySelectorAll('[data-mode]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      draw();
    }),
);
['skeleton', 'envelopes', 'contacts'].forEach((id) => ($(id).onchange = draw));
$('restore').onclick = () => {
  state.hidden.clear();
  state.solo = null;
  document.querySelectorAll('[data-visibility]').forEach((c) => (c.checked = true));
  draw();
};
$('solo').onclick = () => {
  const a = attachments.get(state.selected);
  state.solo = a?.layout || state.selected;
  draw();
};
$('pose').onchange = () => {
  pause();
  state.t = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0;
  draw();
};
$('progress').oninput = () => {
  pause();
  state.t = Number($('progress').value) / 1000;
  draw();
};
$('bind').onclick = () => {
  pause();
  state.t = 0;
  draw();
};
let previous = 0;
function tick(now) {
  if (!state.playing) return;
  const duration = data.poses.sequence.find((s) => s.to === target().id)?.duration || 1500;
  state.t = Math.min(1, state.t + (now - previous) / Math.max(100, duration));
  previous = now;
  if (state.t === 1) pause();
  draw();
  if (state.playing) requestAnimationFrame(tick);
}
$('play').onclick = () => {
  if (state.playing) {
    pause();
    draw();
    return;
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    state.t = 1;
    draw();
    return;
  }
  if (state.t === 1) state.t = 0;
  state.playing = true;
  $('play').textContent = '暫停';
  previous = performance.now();
  requestAnimationFrame(tick);
};
