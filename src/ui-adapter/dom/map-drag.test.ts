import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { mountMapDrag } from './map-drag.ts';

function fixture() {
  const win = new Window(), surface = win.document.createElement('div'), cell = win.document.createElement('div');
  surface.append(cell); win.document.body.append(surface);
  const moves: number[][] = []; let clicks = 0, x = 10, y = 20;
  const drag = mountMapDrag(surface as unknown as HTMLElement, { start: () => ({ x, y, cellSize: 24 }), move: (nx, ny) => { x = nx; y = ny; moves.push([x, y]); } });
  surface.addEventListener('click', () => clicks++); surface.addEventListener('dblclick', () => clicks++);
  const pointer = (type: string, x: number, y = 0, id = 1, target = cell) => target.dispatchEvent(new win.PointerEvent(type, { pointerId: id, pointerType: 'touch', isPrimary: id === 1, clientX: x, clientY: y, bubbles: true, cancelable: true }));
  const click = (type = 'click', detail = 1) => cell.dispatchEvent(new win.MouseEvent(type, { bubbles: true, cancelable: true, detail }));
  return { win, surface, cell, drag, moves, pointer, click, clicks: () => clicks, close() { drag.destroy(); win.close(); } };
}
test('閾值以起點距離判斷；微抖輕點保留，拖後吞click/dblclick但下一次輕點恢復', () => {
  const f = fixture();
  try {
    f.pointer('pointerdown', 0); for (let i = 0; i < 8; i++) { f.pointer('pointermove', 6); f.pointer('pointermove', 0); }
    f.pointer('pointerup', 0); f.click(); assert.equal(f.clicks(), 1); assert.deepEqual(f.moves, []);
    f.pointer('pointerdown', 0); f.pointer('pointermove', 8); assert.equal(f.drag.active, true);
    f.pointer('pointermove', -50, 25); f.pointer('pointermove', -51, 26); f.pointer('pointerup', -51, 26);
    assert.deepEqual(f.moves, [[12, 19]]); f.click(); f.click('dblclick'); assert.equal(f.clicks(), 1);
    f.click('click', 0); assert.equal(f.clicks(), 2);
    f.pointer('pointerdown', 0); f.pointer('pointerup', 0); f.click(); assert.equal(f.clicks(), 3);
  } finally { f.close(); }
});
test('cancel、多指、未capture離開與外部取消均清理，控制不啟動手勢', () => {
  const f = fixture();
  try {
    f.pointer('pointerdown', 0); f.pointer('pointermove', 30); f.pointer('pointercancel', 30); assert.equal(f.drag.active, false); f.click(); assert.equal(f.clicks(), 0);
    f.pointer('pointerdown', 0); f.pointer('pointerdown', 10, 0, 2); f.pointer('pointerup', 0); f.click(); assert.equal(f.clicks(), 0);
    f.pointer('pointerup', 10, 0, 2); f.pointer('pointerdown', 0); f.pointer('pointerup', 0); f.click(); assert.equal(f.clicks(), 1);
    f.pointer('pointerdown', 0); f.pointer('pointerleave', 0, 0, 1, f.surface); assert.equal(f.drag.active, false);
    f.pointer('pointerup', 0); f.pointer('pointerdown', 0); f.drag.cancel(); assert.equal(f.drag.active, false); f.pointer('pointerup', 0);
    const button = f.win.document.createElement('button'); f.surface.append(button); f.pointer('pointerdown', 0, 0, 1, button); assert.equal(f.drag.active, false);
  } finally { f.close(); }
});

test('邊界clamp後同一手勢立即反向，不累積越界距離', () => {
  const win = new Window(), node = win.document.createElement('div'); win.document.body.append(node);
  let x = 0;
  const drag = mountMapDrag(node as unknown as HTMLElement, { start: () => ({ x, y: 0, cellSize: 24 }), move: next => { x = Math.max(0, next); } });
  const send = (type: string, clientX: number) => node.dispatchEvent(new win.PointerEvent(type, { pointerId: 1, pointerType: 'touch', isPrimary: true, clientX, bubbles: true }));
  try { send('pointerdown', 0); send('pointermove', 120); assert.equal(x, 0); send('pointermove', 96); assert.equal(x, 1); }
  finally { drag.destroy(); win.close(); }
});
