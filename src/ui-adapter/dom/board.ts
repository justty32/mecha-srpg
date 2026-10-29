import type { CellView, UiSnapshot } from "../vm/types.ts";
import { createGridView } from "./grid-view.ts";

function paintCell(node: HTMLDivElement, cell: CellView): void {
  const doc = node.ownerDocument;
  node.dataset.x = String(cell.x);
  node.dataset.y = String(cell.y);
  const bloodState = cell.unit?.blood;
  const critical = !!bloodState?.vital && bloodState.min !== undefined && bloodState.max !== null && bloodState.max > bloodState.min && (bloodState.cur - bloodState.min) / (bloodState.max - bloodState.min) <= 0.3;
  node.className = ["battle-cell", critical && "blood-critical", cell.highlight && `highlight-${cell.highlight}`,
    cell.cursor && "cursor", cell.selected && "selected", cell.intent && "intent"].filter(Boolean).join(" ");
  node.style.backgroundColor = cell.terrain.color;
  node.title = `${cell.terrain.name}${cell.unit ? ` · ${cell.unit.name}` : ""}${cell.unit?.notice ? `\n${cell.unit.notice}` : ""}${cell.travelNote ? `\n${cell.travelNote}` : ""}`;
  if (cell.feature) node.title += `\n可破壞地物 HP ${cell.feature.hp}/${cell.feature.max} · 選擇攻擊後點此格`;
  for (const object of cell.objects ?? []) node.title += `\n${object.name} · ${object.note}`;
  if (cell.unit) {
    node.title += `\n結構完整度：${cell.unit.hpRatio === null ? "未知" : `${Math.round(cell.unit.hpRatio * 100)}%`}（核心破壞仍可能致命）`;
    if (cell.unit.stale) node.title += `\n最後所見：${cell.unit.seenRound == null ? "未知輪次" : `第 ${cell.unit.seenRound} 輪`}`;
    if (cell.unit.blood) node.title += `\n血量 ${cell.unit.blood.cur}/${cell.unit.blood.max ?? "∞"}${critical ? " · 瀕危" : ""}${cell.unit.blood.bleeding ? " · 流血中" : ""}`;
  }
  node.dataset.tip = node.title;
  node.setAttribute("aria-label", `${cell.x},${cell.y} ${node.title}`);
  const glyph = doc.createElement("span");
  glyph.className = "terrain-glyph";
  glyph.textContent = cell.terrain.glyph;
  node.replaceChildren(glyph);
  if (cell.feature) {
    const marker = doc.createElement("span"); marker.className = "feature-marker";
    marker.textContent = `HP ${cell.feature.hp}`; node.append(marker);
  }
  if (cell.objects?.length) {
    const marker = doc.createElement("span"); marker.className = "object-marker";
    marker.textContent = cell.objects.map(o => o.kind === "wreck" ? "骸" : o.kind === "corpse" ? "屍" : "拾").join("");
    node.append(marker);
  }
  if (cell.unit) {
    const badge = doc.createElement("span");
    badge.className = `unit-badge side-${cell.unit.side}${cell.unit.active ? " active" : ""}${cell.unit.stale ? " stale" : ""} status-${cell.unit.status}`;
    badge.textContent = cell.unit.label;
    if (cell.unit.status === "presence") {
      const marker = doc.createElement("span");
      marker.className = "presence-marker";
      marker.textContent = "在場";
      badge.append(marker);
    }
    const hp = doc.createElement("span");
    hp.className = `cell-hp${cell.unit.hpRatio === null ? " unknown" : ""}${cell.unit.stale ? " stale" : ""}`;
    hp.setAttribute("aria-label", "結構完整度");
    const fill = doc.createElement("span");
    fill.style.width = `${Math.max(0, Math.min(1, cell.unit.hpRatio ?? 0)) * 100}%`;
    hp.append(fill);
    node.append(badge, hp);
    if (cell.unit.hpRatio === null) { const unknown = doc.createElement("span"); unknown.className = "structure-unknown"; unknown.textContent = "？"; node.append(unknown); }
    if (cell.unit.blood) {
      const blood = doc.createElement("span"); blood.className = `cell-blood${critical ? " critical" : ""}${cell.unit.blood.bleeding ? " bleeding" : ""}`; blood.textContent = critical ? "危" : cell.unit.blood.bleeding ? "流" : "血";
      blood.title = `血量 ${cell.unit.blood.cur}/${cell.unit.blood.max ?? "∞"}`; node.append(blood);
    }
  }
}

export function createBoard(board: HTMLElement, cellSize: number): (s: UiSnapshot) => void {
  const draw = createGridView<CellView & { classes: string[] }>(board, paintCell);
  board.style.setProperty("--cell-size", `${cellSize}px`);
  return s => draw({ size: { w: s.map.width, h: s.map.height }, viewport: s.viewport,
    cell: (x, y) => ({ ...s.cells[(y - s.viewport.y) * s.viewport.w + x - s.viewport.x]!, classes: [] }),
    dirty: () => s.dirty === "all" ? "all" : new Set(s.dirty) });
}
