// ui-adapter/ops/dom/ui — 營運 DOM 共用小工具：建元素、畫 OpsButton、量條、點擊登記表。
import type { OpsButton, OpsUiAction } from "../vm/types.ts";

/** 可點元素 → 要送出的 action；每個掛載點自己一份，避免巢狀模組重複送出。 */
export type ActionRegistry = WeakMap<Element, OpsUiAction>;

export function el<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, text = "", className = ""): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

/** tooltip 文字：說明＋（缺的話）快捷鍵行；不能按時 reason 放末行。 */
export function tipText(b: Pick<OpsButton, "tooltip" | "key" | "enabled" | "reason">): string {
  const lines = [b.tooltip];
  if (b.key && !b.tooltip.includes(`快捷鍵：${b.key}`)) lines.push(`快捷鍵：${b.key}`);
  if (!b.enabled && b.reason) lines.push(b.reason);
  return lines.filter(Boolean).join("\n");
}

/** OpsButton → <span.ops-btn data-tip><button data-action-id>label<kbd>key</kbd></button></span>。
 * 外層 span 也帶 data-tip：disabled 按鈕在部分瀏覽器收不到 mouseover，tooltip 靠外層顯示。 */
export function opsButton(doc: Document, b: OpsButton, registry: ActionRegistry): HTMLSpanElement {
  const wrap = el(doc, "span", "", "ops-btn");
  const button = el(doc, "button");
  button.type = "button";
  button.dataset.actionId = b.id;
  button.dataset.group = b.group;
  button.disabled = !b.enabled;
  button.classList.toggle("active", !!b.active);
  if (b.tone) button.classList.add(`tone-${b.tone}`);
  button.append(el(doc, "span", b.label, "ops-btn-label"));
  if (b.key) button.append(el(doc, "kbd", b.key));
  const tip = tipText(b);
  button.dataset.tip = wrap.dataset.tip = tip;
  button.setAttribute("aria-label", b.key ? `${b.label}（${b.key}）` : b.label);
  if (!b.enabled) wrap.tabIndex = 0;
  registry.set(button, b.action);
  wrap.append(button);
  return wrap;
}

export function buttonRow(doc: Document, buttons: OpsButton[], registry: ActionRegistry, className = "ops-buttons"): HTMLDivElement {
  const row = el(doc, "div", "", className);
  for (const b of buttons) row.append(opsButton(doc, b, registry));
  return row;
}

/** 量條：max null＝無上限（滿格）。 */
export function meter(doc: Document, label: string, cur: number, max: number | null, tone = ""): HTMLDivElement {
  const row = el(doc, "div", "", "ops-meter-row");
  row.append(el(doc, "span", `${label} ${cur} / ${max === null ? "∞" : max}`));
  const track = el(doc, "div", "", `ops-meter${tone ? ` tone-${tone}` : ""}`);
  const fill = el(doc, "span");
  fill.style.width = `${max === null ? 100 : max <= 0 ? 0 : Math.max(0, Math.min(1, cur / max)) * 100}%`;
  track.append(fill);
  row.append(track);
  return row;
}

/** 在 boundary 內由 target 往上找第一個已登記的元素。 */
export function registeredAction(registry: ActionRegistry, target: EventTarget | null, boundary: Element): { node: Element; action: OpsUiAction } | null {
  let node = target as Element | null;
  while (node && node !== boundary) {
    const action = registry.get(node);
    if (action) return (node as HTMLButtonElement).disabled ? null : { node, action };
    node = node.parentElement;
  }
  return null;
}

/** JSON 比對快取：資料沒變就不重畫該段。 */
export function changeCache(): (key: string, data: unknown) => boolean {
  const cache = new Map<string, string>();
  return (key, data) => {
    const value = JSON.stringify(data);
    if (cache.get(key) === value) return false;
    cache.set(key, value);
    return true;
  };
}

export function table(doc: Document, head: string[], rows: (string | number | Node)[][]): HTMLTableElement {
  const t = el(doc, "table", "", "ops-table");
  const thead = el(doc, "thead");
  const hr = el(doc, "tr");
  for (const h of head) hr.append(el(doc, "th", h));
  thead.append(hr);
  const body = el(doc, "tbody");
  for (const r of rows) {
    const tr = el(doc, "tr");
    for (const c of r) {
      const td = el(doc, "td");
      if (typeof c === "object") td.append(c); else td.textContent = String(c);
      tr.append(td);
    }
    body.append(tr);
  }
  t.append(thead, body);
  return t;
}
