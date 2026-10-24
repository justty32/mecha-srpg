export function mountTooltip(root: HTMLElement): { refresh(): void; destroy(): void } {
  const doc = root.ownerDocument;
  const tip = doc.createElement("div");
  tip.dataset.ui = "tooltip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  root.append(tip);
  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;
  const target = (event: Event): HTMLElement | null => {
    const node = event.target as HTMLElement | null;
    const found = node?.closest?.<HTMLElement>("[data-tip]");
    return found && root.contains(found) ? found : null;
  };
  const refresh = (): void => {
    if (hovered && !root.contains(hovered)) hovered = null;
    if (focused && !root.contains(focused)) focused = null;
    const anchor = hovered ?? focused;
    tip.hidden = !anchor;
    if (!anchor) return;
    tip.textContent = anchor.dataset.tip ?? anchor.title;
    const rect = anchor.getBoundingClientRect();
    const view = doc.defaultView;
    tip.style.left = `${Math.max(8, Math.min(rect.left, (view?.innerWidth ?? 1024) - tip.offsetWidth - 8))}px`;
    tip.style.top = `${Math.max(8, Math.min(rect.bottom + 6, (view?.innerHeight ?? 768) - tip.offsetHeight - 8))}px`;
  };
  const over = (event: Event): void => { hovered = target(event); refresh(); };
  const out = (event: MouseEvent): void => {
    const next = event.relatedTarget as Node | null;
    if (hovered && next && hovered.contains(next)) return;
    hovered = null;
    refresh();
  };
  const focus = (event: Event): void => { focused = target(event); refresh(); };
  const blur = (): void => { focused = null; refresh(); };
  root.addEventListener("mouseover", over);
  root.addEventListener("mouseout", out);
  root.addEventListener("focusin", focus);
  root.addEventListener("focusout", blur);
  return { refresh, destroy() {
    root.removeEventListener("mouseover", over);
    root.removeEventListener("mouseout", out);
    root.removeEventListener("focusin", focus);
    root.removeEventListener("focusout", blur);
    tip.remove();
  } };
}
