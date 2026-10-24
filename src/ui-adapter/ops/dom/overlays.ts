// ui-adapter/ops/dom/overlays — 疊層：事件 prompt（含命名輸入）、出戰編成、戰果報告、快捷鍵說明。
import type { OpsSnapshot, OpsUiAction, PromptView, SortieView, BattleReport } from "../vm/types.ts";
import { buttonRow, changeCache, el, type ActionRegistry } from "./ui.ts";

export type Overlays = { paint(s: OpsSnapshot): void };

function dialog(doc: Document, ui: string, title: string): HTMLElement {
  const box = el(doc, "section", "", "ops-dialog");
  box.dataset.ui = ui;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-label", title);
  return box;
}

/** 自有按鈕（不是 OpsButton）：DOM 決定文字與 action。 */
function plainButton(doc: Document, registry: ActionRegistry, ui: string, label: string, action: OpsUiAction, key?: string): HTMLButtonElement {
  const b = el(doc, "button", "", "ops-plain");
  b.type = "button";
  b.dataset.ui = ui;
  b.append(el(doc, "span", label, "ops-btn-label"));
  if (key) b.append(el(doc, "kbd", key));
  b.dataset.tip = key ? `${label}\n快捷鍵：${key}` : label;
  registry.set(b, action);
  return b;
}

export function createOverlays(layer: HTMLElement, registry: ActionRegistry, onAction: (a: OpsUiAction) => void): Overlays {
  const doc = layer.ownerDocument;
  const changed = changeCache();
  const prompt = el(doc, "div", "", "ops-overlay");
  const sortie = el(doc, "div", "", "ops-overlay");
  const report = el(doc, "div", "", "ops-overlay");
  const help = el(doc, "div", "", "ops-overlay");
  layer.append(sortie, report, prompt, help);

  const paintPrompt = (p: PromptView): void => {
    const box = dialog(doc, "ops-prompt", "事件");
    box.append(...p.text.split("\n").map(line => el(doc, "p", line)));
    const choices = el(doc, "div", "", "ops-choices");
    for (const c of p.choices) {
      const wrap = el(doc, "span", "", "ops-btn");
      const b = el(doc, "button");
      b.type = "button";
      b.dataset.choice = String(c.n);
      b.disabled = !c.enabled;
      b.append(el(doc, "span", `${c.n}. ${c.text}`, "ops-btn-label"));
      if (c.key) b.append(el(doc, "kbd", c.key));
      const tip = [c.text, c.key ? `快捷鍵：${c.key}` : "", !c.enabled && c.reason ? c.reason : ""].filter(Boolean).join("\n");
      b.dataset.tip = wrap.dataset.tip = tip;
      if (!c.enabled) wrap.tabIndex = 0;
      registry.set(b, { type: "cmd", cmd: { v: "choose", choice: c.n } });
      wrap.append(b);
      choices.append(wrap);
    }
    box.append(choices);
    if (p.naming) {
      const form = el(doc, "div", "", "ops-naming");
      const input = el(doc, "input");
      input.type = "text";
      input.dataset.ui = "ops-name-input";
      input.placeholder = p.naming.placeholder;
      input.maxLength = 40;
      const submit = el(doc, "button", "", "ops-plain");
      submit.type = "button";
      submit.dataset.ui = "ops-name-submit";
      submit.append(el(doc, "span", "送出", "ops-btn-label"), el(doc, "kbd", "Enter"));
      submit.dataset.tip = "用輸入的名字\n快捷鍵：Enter（輸入框內）";
      const send = (): void => { const name = input.value.trim(); if (name) onAction({ type: "nameSubmit", name }); };
      submit.addEventListener("click", send);
      input.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); send(); } });
      form.append(input, submit);
      box.append(form);
    }
    prompt.replaceChildren(box);
  };

  const paintSortie = (v: SortieView): void => {
    const box = dialog(doc, "ops-sortie", "出戰編成");
    box.classList.add("wide");
    box.append(el(doc, "h2", v.title), el(doc, "p", `戰場：${v.nodeName}`, "muted"));
    const list = el(doc, "div", "", "ops-sortie-units");
    for (const u of v.units) {
      const card = el(doc, "div", "", `ops-sortie-unit${u.included ? " included" : ""}${u.enabled ? "" : " disabled"}`);
      card.dataset.mech = u.mech;
      const label = el(doc, "label", "", "ops-sortie-pick");
      const check = el(doc, "input");
      check.type = "checkbox";
      check.dataset.ui = "sortie-toggle";
      check.dataset.mech = u.mech;
      check.checked = u.included;
      check.disabled = !u.enabled;
      label.append(check, el(doc, "strong", u.name));
      if (!u.enabled && u.reason) { label.dataset.tip = u.reason; label.append(el(doc, "span", u.reason, "muted")); }
      card.append(label);
      for (const s of u.seats) {
        const row = el(doc, "label", "", "ops-seat");
        const select = el(doc, "select");
        select.dataset.seat = s.seat;
        select.dataset.mech = u.mech;
        select.disabled = !u.included;
        const empty = el(doc, "option", "（空位）");
        empty.value = "";
        select.append(empty);
        for (const o of s.options) {
          const opt = el(doc, "option", o.name);
          opt.value = o.id;
          select.append(opt);
        }
        select.value = s.person ?? "";
        row.append(el(doc, "span", s.seatName), select);
        card.append(row);
      }
      list.append(card);
    }
    box.append(list);
    const error = el(doc, "p", v.error ?? "編成可出戰。", v.error ? "ops-error" : "ops-ok");
    error.dataset.ui = "sortie-error";
    box.append(error, buttonRow(doc, v.buttons, registry));
    sortie.replaceChildren(box);
  };

  const paintReport = (r: BattleReport): void => {
    const box = dialog(doc, "ops-report", "戰果報告");
    box.append(el(doc, "h2", r.title), el(doc, "p", `${r.winnerText}・${r.rounds} 輪`, "ops-report-winner"),
      el(doc, "p", `現金 ${r.cashDelta > 0 ? "+" : r.cashDelta < 0 ? "−" : "±"}${Math.abs(r.cashDelta)}`, r.cashDelta < 0 ? "neg" : "pos"));
    const ul = el(doc, "ul", "", "ops-report-lines");
    for (const line of r.lines) ul.append(el(doc, "li", line));
    box.append(ul, plainButton(doc, registry, "ops-report-dismiss", "關閉報告", { type: "dismissReport" }, "Esc"));
    report.replaceChildren(box);
  };

  const paintHelp = (hints: OpsSnapshot["keyHints"]): void => {
    const box = dialog(doc, "ops-help", "快捷鍵說明");
    const t = el(doc, "table", "", "ops-table");
    const body = el(doc, "tbody");
    for (const h of hints) {
      const tr = el(doc, "tr");
      const keys = el(doc, "td");
      for (const k of h.keys) keys.append(el(doc, "kbd", k === " " ? "Space" : k));
      tr.append(el(doc, "th", h.label), keys);
      body.append(tr);
    }
    t.append(body);
    box.append(el(doc, "h2", "快捷鍵說明"), t, plainButton(doc, registry, "ops-help-close", "關閉", { type: "toggleHelp" }, "Esc"));
    help.replaceChildren(box);
  };

  sortie.addEventListener("change", event => {
    const t = event.target as HTMLInputElement | HTMLSelectElement;
    const mech = t.dataset.mech;
    if (!mech) return;
    if (t.dataset.ui === "sortie-toggle") onAction({ type: "sortieToggle", mech });
    else if (t.dataset.seat) onAction({ type: "sortieSeat", mech, seat: t.dataset.seat, person: t.value || null });
  });

  return {
    paint(s) {
      prompt.hidden = !s.prompt;
      sortie.hidden = !s.sortie;
      report.hidden = !s.report;
      help.hidden = !s.showHelp;
      if (changed("prompt", s.prompt) && s.prompt) paintPrompt(s.prompt);
      if (changed("sortie", s.sortie) && s.sortie) paintSortie(s.sortie);
      if (changed("report", s.report) && s.report) paintReport(s.report);
      if (changed("help", [s.showHelp, s.keyHints]) && s.showHelp) paintHelp(s.keyHints);
      layer.hidden = !(s.prompt || s.sortie || s.report || s.showHelp);
    },
  };
}
