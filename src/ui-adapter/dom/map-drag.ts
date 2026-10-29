/** 單指地圖拖曳；保留原生輕點，只有跨閾值才取得 capture。 */
export function mountMapDrag(surface: HTMLElement, options: {
  start(): { x: number; y: number; cellSize: number } | null;
  move(x: number, y: number): void;
}) {
  const doc = surface.ownerDocument, host = doc.defaultView;
  let gesture: { id: number; px: number; py: number; x: number; y: number; cellSize: number; dx: number; dy: number; dragging: boolean } | null = null;
  const pointers = new Set<number>();
  let suppress = false, blocked = false;
  const oldTouch = surface.style.touchAction, oldSelect = surface.style.userSelect, oldCursor = surface.style.cursor;
  surface.style.touchAction = 'none'; surface.style.userSelect = 'none'; surface.style.cursor = 'grab';
  const cancel = () => {
    const previous = gesture; gesture = null;
    if (previous?.dragging) suppress = true;
    surface.style.cursor = 'grab';
    if (previous && surface.hasPointerCapture?.(previous.id)) surface.releasePointerCapture(previous.id);
  };
  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.add(e.pointerId);
    if (pointers.size > 1) { blocked = true; suppress = true; cancel(); return; }
    if (!surface.contains(e.target as Node) || blocked) return;
    if ((e.target as Element | null)?.closest('button, input, textarea, select, a, [role="menu"], [data-ui="quick-menu"], .world-minimap')) return;
    if (e.isPrimary === false || surface.closest('[hidden]')) return;
    suppress = false;
    const start = options.start(); if (!start || start.cellSize <= 0) return;
    gesture = { ...start, id: e.pointerId, px: e.clientX, py: e.clientY, dx: 0, dy: 0, dragging: false };
  };
  const move = (e: PointerEvent) => {
    const g = gesture; if (!g || g.id !== e.pointerId) return;
    if (surface.closest('[hidden]')) { cancel(); return; }
    const px = e.clientX - g.px, py = e.clientY - g.py;
    if (!g.dragging) {
      if (Math.hypot(px, py) < 8) return;
      g.dragging = true; suppress = true; surface.style.cursor = 'grabbing';
      try { surface.setPointerCapture?.(g.id); } catch { /* 指標已被瀏覽器取消時仍清理本次手勢。 */ }
    }
    e.preventDefault();
    const dx = Math.trunc(-px / g.cellSize), dy = Math.trunc(-py / g.cellSize);
    if (dx !== g.dx || dy !== g.dy) {
      g.dx = dx; g.dy = dy;
      const x = g.x + dx, y = g.y + dy;
      options.move(x, y);
      // clamp 後以真正視野修正基準，反向拖曳不需先還清越界距離。
      const actual = options.start();
      if (actual) { g.x += actual.x - x; g.y += actual.y - y; }
    }
  };
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (gesture?.id === e.pointerId) cancel();
    if (!pointers.size) blocked = false;
  };
  const leave = (e: PointerEvent) => { if (gesture?.id === e.pointerId && !gesture.dragging) cancel(); };
  const lost = (e: PointerEvent) => { if (e.target === surface && gesture?.id === e.pointerId) cancel(); };
  const click = (e: MouseEvent) => {
    if ((suppress || blocked) && e.detail !== 0) { e.preventDefault(); e.stopImmediatePropagation(); }
  };
  const blur = () => { cancel(); pointers.clear(); blocked = false; };
  const visibility = () => { if (doc.hidden || surface.closest('[hidden]')) blur(); };
  doc.addEventListener('pointerdown', down, true);
  doc.addEventListener('pointermove', move, { capture: true, passive: false });
  doc.addEventListener('pointerup', up, true); doc.addEventListener('pointercancel', up, true);
  surface.addEventListener('pointerleave', leave); surface.addEventListener('lostpointercapture', lost);
  surface.addEventListener('click', click, true); surface.addEventListener('dblclick', click, true);
  host?.addEventListener('blur', blur); doc.addEventListener('visibilitychange', visibility);
  const observer = host?.MutationObserver ? new host.MutationObserver(visibility) : null;
  observer?.observe(doc.documentElement, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  return { get active() { return gesture !== null || blocked; }, cancel, destroy() {
    blur(); observer?.disconnect();
    doc.removeEventListener('pointerdown', down, true); doc.removeEventListener('pointermove', move, true);
    doc.removeEventListener('pointerup', up, true); doc.removeEventListener('pointercancel', up, true);
    surface.removeEventListener('pointerleave', leave); surface.removeEventListener('lostpointercapture', lost);
    surface.removeEventListener('click', click, true); surface.removeEventListener('dblclick', click, true);
    host?.removeEventListener('blur', blur); doc.removeEventListener('visibilitychange', visibility);
    surface.style.touchAction = oldTouch; surface.style.userSelect = oldSelect; surface.style.cursor = oldCursor;
  } };
}
