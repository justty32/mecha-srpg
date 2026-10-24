import type { UiSnapshot } from "../vm/types.ts";

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function fitCellSize(panelW: number, panelH: number, mapW: number, mapH: number): number {
  return clamp(Math.floor(Math.min(panelW / mapW, panelH / mapH)), 24, 72);
}

export function zoomStep(size: number, dir: 1 | -1): number {
  return clamp(dir === 1 ? size * 1.25 : size / 1.25, 12, 96);
}

/** 保留錨格中心在可視區內的相對位置；地圖邊界優先。 */
export function anchorViewport(old: UiSnapshot["viewport"], next: { w: number; h: number },
  at: UiSnapshot["cursor"], map: UiSnapshot["map"]): { x: number; y: number } {
  const axis = (origin: number, span: number, newSpan: number, cell: number, total: number): number => {
    const ratio = clamp((cell - origin + .5) / span, 0, 1);
    const desired = Math.round(cell + .5 - ratio * newSpan);
    return clamp(clamp(desired, cell - newSpan + 1, cell), 0, Math.max(0, total - newSpan));
  };
  return { x: axis(old.x, old.w, next.w, at.x, map.width), y: axis(old.y, old.h, next.h, at.y, map.height) };
}
