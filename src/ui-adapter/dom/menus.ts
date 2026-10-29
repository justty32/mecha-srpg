import type { UiSnapshot } from "../vm/types.ts";
import { element, updateCommand } from "./panels.ts";

export function createMenus(stage: HTMLElement, field: HTMLElement, partsHost: HTMLElement): (s: UiSnapshot, size: number) => void {
  const doc = stage.ownerDocument;
  const quick = element(doc, "nav", "", "battle-popover");
  quick.dataset.ui = "quick-menu";
  quick.setAttribute("aria-label", "下一步行動");
  const part = element(doc, "section", "", "part-picker");
  part.dataset.ui = "part-picker";
  part.setAttribute("aria-label", "選擇部位");
  const confirm = element(doc, "section", "", "battle-popover confirm-dialog");
  confirm.dataset.ui = "confirm";
  confirm.setAttribute("role", "alertdialog");
  const text = element(doc, "p");
  const accept = element(doc, "button", "確定"), cancel = element(doc, "button", "取消");
  accept.type = cancel.type = "button";
  accept.dataset.ui = "confirm-accept"; cancel.dataset.ui = "confirm-cancel";
  confirm.append(text, accept, cancel);
  stage.append(quick);
  partsHost.append(part);
  field.append(confirm);
  quick.hidden = part.hidden = confirm.hidden = true;
  let quickKey = "", partKey = "", wasPart = false, abilityBeforePart = "";
  return (s, size) => {
    const menu = s.quickMenu, v = s.viewport;
    quick.hidden = !menu || menu.at.x < v.x || menu.at.y < v.y || menu.at.x >= v.x + v.w || menu.at.y >= v.y + v.h;
    if (menu && !quick.hidden) {
      const key = JSON.stringify(menu.options);
      if (key !== quickKey) {
        quickKey = key;
        quick.replaceChildren(...menu.options.map(command => {
          const button = element(doc, "button");
          updateCommand(button, command);
          return button;
        }));
      }
      const stageRect = stage.getBoundingClientRect();
      const bounds = (stage.closest<HTMLElement>(".board-viewport") ?? field).getBoundingClientRect();
      const edge = 6, host = doc.defaultView;
      const left = Math.max(0, bounds.left) + edge, top = Math.max(0, bounds.top) + edge;
      const right = Math.min(host?.innerWidth ?? bounds.right, bounds.right) - edge;
      const bottom = Math.min(host?.innerHeight ?? bounds.bottom, bounds.bottom) - edge;
      quick.style.maxWidth = `${Math.max(0, right - left)}px`;
      quick.style.maxHeight = `${Math.max(0, bottom - top)}px`;
      quick.style.transform = "none";
      quick.style.left = "0px"; quick.style.top = "0px";
      const rect = quick.getBoundingClientRect();
      const rightHalf = menu.at.x - v.x >= v.w / 2, bottomHalf = menu.at.y - v.y >= v.h / 2;
      const anchorX = stageRect.left + (menu.at.x - v.x + (rightHalf ? 0 : 1)) * size;
      const anchorY = stageRect.top + (menu.at.y - v.y + .5) * size;
      const desiredX = anchorX - (rightHalf ? rect.width : 0), desiredY = anchorY - (bottomHalf ? rect.height : 0);
      const x = Math.max(left, Math.min(desiredX, right - rect.width));
      const y = Math.max(top, Math.min(desiredY, bottom - rect.height));
      quick.style.left = `${x - stageRect.left}px`;
      quick.style.top = `${y - stageRect.top}px`;
    }
    const entering = s.mode.kind === "part" && !wasPart;
    const leaving = s.mode.kind !== "part" && wasPart;
    if (s.mode.kind === "part") abilityBeforePart = s.mode.ability;
    part.hidden = s.mode.kind !== "part";
    if (s.mode.kind === "part") {
      const key = JSON.stringify(s.mode);
      if (key !== partKey) {
        partKey = key;
        const focused = part.contains(doc.activeElement) ? (doc.activeElement as HTMLElement).dataset.partN : undefined;
        const scroller = partsHost.closest<HTMLElement>(".battle-sidebar") ?? partsHost;
        const scroll = scroller.scrollTop;
        part.replaceChildren(element(doc, "h2", `${s.mode.abilityName}：選擇部位`), ...s.mode.options.map(option => {
          const button = element(doc, "button", "", "part-option");
          const chance = option.chance === null ? "命中率未知" : option.chance >= 100 ? "100% 必中" : `${option.chance.toFixed(1)}% 命中`;
          button.append(element(doc, "strong", option.label), element(doc, "span", chance, "part-chance"));
          const protection = option.protection.map(l => `${l.type} ${l.hp === null ? "？" : l.hp}/${l.max}`).join(" · ");
          button.append(element(doc, "span", `剩餘防護：${protection || "未觀測"}`, "part-protection"),
            element(doc, "span", `功能：${option.functions.join("、") || "無宣告功能"}`, "part-functions"),
            element(doc, "span", `破壞後果：${option.consequences.join("；")}`, "part-consequences"),
            element(doc, "span", option.aimNote, "part-aim"));
          for (const note of option.hitNotes ?? []) button.append(element(doc, "span", note, "part-hits"));
          if (option.defenseNote) button.append(element(doc, "span", option.defenseNote, "part-defense"));
          button.type = "button";
          button.dataset.partN = String(option.n);
          button.disabled = !option.enabled;
          button.dataset.tip = button.title = [option.label, chance, protection, ...option.consequences, ...(option.hitNotes ?? []), option.aimNote, option.defenseNote, option.reason, `快捷鍵：${option.n}`].filter(Boolean).join("\n");
          button.append(element(doc, "kbd", String(option.n)));
          return button;
        }));
        scroller.scrollTop = scroll;
        if (focused) part.querySelector<HTMLButtonElement>(`[data-part-n="${focused}"]`)?.focus({ preventScroll: true });
      }
    }
    if (entering) {
      part.querySelector<HTMLButtonElement>("button:enabled")?.focus({ preventScroll: true });
      if ((doc.defaultView?.innerWidth ?? 1200) < 760) partsHost.scrollIntoView?.({ block: "nearest" });
    }
    if (leaving) {
      const command = Array.from(stage.closest(".battle-view")?.querySelectorAll<HTMLButtonElement>("[data-cmd]") ?? []).find(button => button.dataset.cmd === `ability:${abilityBeforePart}` && !button.disabled);
      command?.focus({ preventScroll: true });
    }
    wasPart = s.mode.kind === "part";
    confirm.hidden = s.confirm === null;
    text.textContent = s.confirm?.text ?? "";
    confirm.setAttribute("aria-label", s.confirm?.text ?? "確認操作");
  };
}
