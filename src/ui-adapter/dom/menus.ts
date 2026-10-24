import type { UiSnapshot } from "../vm/types.ts";
import { element, updateCommand } from "./panels.ts";

export function createMenus(stage: HTMLElement, field: HTMLElement): (s: UiSnapshot, size: number) => void {
  const doc = stage.ownerDocument;
  const quick = element(doc, "nav", "", "battle-popover");
  quick.dataset.ui = "quick-menu";
  quick.setAttribute("aria-label", "下一步行動");
  const part = element(doc, "section", "", "battle-popover part-picker");
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
  field.append(part, confirm);
  quick.hidden = part.hidden = confirm.hidden = true;
  let quickKey = "", partKey = "";
  return (s, size) => {
    const menu = s.quickMenu, v = s.viewport;
    quick.hidden = !menu || menu.at.x < v.x || menu.at.y < v.y || menu.at.x >= v.x + v.w || menu.at.y >= v.y + v.h;
    if (menu && !quick.hidden) {
      const rightHalf = menu.at.x - v.x >= v.w / 2, bottomHalf = menu.at.y - v.y >= v.h / 2;
      quick.style.left = `${(menu.at.x - v.x + (rightHalf ? 0 : 1)) * size}px`;
      quick.style.top = `${(menu.at.y - v.y + .5) * size}px`;
      quick.style.transform = `translate(${rightHalf ? "-100%" : "0"}, ${bottomHalf ? "-100%" : "0"})`;
      const key = JSON.stringify(menu.options);
      if (key !== quickKey) {
        quickKey = key;
        quick.replaceChildren(...menu.options.map(command => {
          const button = element(doc, "button");
          updateCommand(button, command);
          return button;
        }));
      }
    }
    part.hidden = s.mode.kind !== "part";
    if (s.mode.kind === "part") {
      const key = JSON.stringify(s.mode);
      if (key !== partKey) {
        partKey = key;
        part.replaceChildren(element(doc, "h2", `${s.mode.abilityName}：選擇部位`), ...s.mode.options.map(option => {
          const button = element(doc, "button", option.label);
          button.type = "button";
          button.dataset.partN = String(option.n);
          button.disabled = !option.enabled;
          button.dataset.tip = button.title = `${option.reason ?? option.label}\n快捷鍵：${option.n}`;
          button.append(element(doc, "kbd", String(option.n)));
          return button;
        }));
      }
    }
    confirm.hidden = s.confirm === null;
    text.textContent = s.confirm?.text ?? "";
    confirm.setAttribute("aria-label", s.confirm?.text ?? "確認操作");
  };
}
