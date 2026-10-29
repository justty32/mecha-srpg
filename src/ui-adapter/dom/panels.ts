import type { CommandOption, UiSnapshot, UnitView } from "../vm/types.ts";

export function element<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, text = "", className = ""): HTMLElementTagNameMap[K] {
  const node = doc.createElement(tag);
  node.textContent = text;
  node.className = className;
  return node;
}

function meter(doc: Document, label: string, current: number | null, max: number | null): HTMLElement {
  const row = element(doc, "div", "", "meter-row");
  row.append(element(doc, "span", `${label} ${current === null ? "？" : current} / ${max === null ? "∞" : max}`));
  const track = element(doc, "div", "", `meter${current === null ? " unknown" : ""}`);
  const fill = element(doc, "span");
  fill.style.width = `${current === null ? 0 : max === null ? 100 : max <= 0 ? 0 : Math.max(0, Math.min(1, current / max)) * 100}%`;
  track.append(fill);
  row.append(track);
  return row;
}

function unitPanel(node: HTMLElement, unit: UnitView | null): void {
  const doc = node.ownerDocument;
  node.classList.toggle("stale", unit?.stale ?? false);
  node.replaceChildren(element(doc, "h2", "操作者"));
  if (!unit) {
    node.append(element(doc, "p", "尚未選取單位"));
    return;
  }
  node.append(element(doc, "h3", unit.name, `side-${unit.side}`),
    element(doc, "p", `${unit.frameName} · ${unit.pos.x},${unit.pos.y} · ${unit.controlMode} · ${unit.status}`));
  if (unit.stale) node.append(element(doc, "p", unit.seenRound === null ? "尚未觀測" : `最後所見：第 ${unit.seenRound} 輪`, "stale-note"));
  const detail = element(doc, "details", "", "operator-details");
  detail.append(element(doc, "summary", "移動原因與人物詳情"));
  if (unit.movementName || unit.frameClassName) detail.append(element(doc, "p", [unit.frameClassName, unit.movementName].filter(Boolean).join(" · ")));
  if (unit.movement) {
    const move = unit.movement;
    node.append(element(doc, "p", `本回合移動剩 ${move.remaining}／上限 ${move.limit} · 已花 ${move.spent}`, "movement-budget"));
    for (const note of move.notes) detail.append(element(doc, "p", note, "movement-note"));
  }
  if (unit.familyName) detail.append(element(doc, "p", `怪獸家族：${unit.familyName}`));
  for (const note of unit.ecologyNotes ?? []) detail.append(element(doc, "p", note));
  if (unit.defenseNote) node.append(element(doc, "p", unit.defenseNote, "defense-note"));
  if (unit.presenceNote) node.append(element(doc, "p", unit.presenceNote, "presence-note"));
  for (const note of unit.auraNotes ?? []) detail.append(element(doc, "p", note, "aura-note"));
  for (const person of unit.persons) detail.append(element(doc, "p", `${person.role}：${person.name} · 士氣 ${person.morale}`));
  const isAp = (id: string) => id === "ap" || id.endsWith(":ap");
  for (const pool of [...unit.pools].sort((a, b) => Number(isAp(b.id)) - Number(isAp(a.id)))) {
    const row = meter(doc, pool.name, pool.cur, pool.max);
    if (pool.id.includes(":") && !isAp(pool.id)) detail.append(row);
    else node.append(row);
  }
  node.append(detail);
  const effects = element(doc, "div", "", "effects");
  for (const effect of unit.effects) effects.append(element(doc, "span", `${effect.name} ×${effect.stacks} · 剩餘 ${effect.remaining ?? "∞"}`, "effect-badge"));
  node.append(effects);
}

function partsPanel(node: HTMLElement, unit: UnitView | null, aiming: boolean): void {
  const doc = node.ownerDocument;
  node.classList.toggle("stale", unit?.stale ?? false);
  node.replaceChildren(element(doc, "h2", "部位與傷勢"));
  if (!unit) { node.append(element(doc, "p", "選擇單位查看部位與傷勢")); return; }
  node.append(element(doc, "h3", `${aiming ? "瞄準" : "查看"}：${unit.name}`, `side-${unit.side}`));
  if (unit.stale) node.append(element(doc, "p", unit.seenRound === null ? "尚未觀測" : `最後所見：第 ${unit.seenRound} 輪`, "stale-note"));
  if (unit.movementName || unit.frameClassName) node.append(element(doc, "p", [unit.frameClassName, unit.movementName].filter(Boolean).join(" · ")));
  if (unit.familyName) node.append(element(doc, "p", `怪獸家族：${unit.familyName}`));
  for (const note of unit.ecologyNotes ?? []) node.append(element(doc, "p", note));
  const blood = unit.pools.find(pool => pool.id === "blood");
  if (blood) node.append(meter(doc, "血量", blood.cur, blood.max));
  else if (unit.side === "enemy") node.append(element(doc, "p", "血量與持續傷勢：未觀測", "unknown-note"));
  if (aiming) { node.append(element(doc, "p", "點選下方部位即攻擊；取消返回能力選擇")); return; }
  for (const part of unit.parts) {
    const section = element(doc, "section", "", part.broken ? "broken" : "");
    section.append(element(doc, "h4", `${part.name}${part.broken ? "（損毀）" : ""}`));
    if (part.functions?.length) section.append(element(doc, "p", `部位功能：${part.functions.join("、")}`));
    for (const component of part.components ?? []) section.append(element(doc, "p",
      `${component.slot}：${component.name} · ${component.functions.join("、") || "被動部件"}`, "installed-component"));
    for (const layer of part.layers) section.append(meter(doc, `${layer.structural ? "結構" : "防護"} · ${layer.type}${layer.broken ? "（損毀）" : ""}`, layer.hp, layer.max));
    for (const effect of unit.effects.filter(effect => effect.part === part.id)) section.append(element(doc, "p", `持續傷勢：${effect.name} ×${effect.stacks}`, "part-injury"));
    node.append(section);
  }

}

export type PanelNodes = Record<"commands" | "unit" | "inspect" | "log" | "message" | "outcome" | "help" | "parts", HTMLElement>;

export function updateCommand(button: HTMLButtonElement, command: CommandOption): void {
  button.type = "button";
  button.dataset.cmd = command.id;
  button.disabled = !command.enabled;
  button.classList.toggle("active", !!command.active);
  button.title = [command.tooltip,
    command.reason && !command.tooltip.includes(command.reason) ? command.reason : "",
    command.key && !command.tooltip.includes(`快捷鍵：${command.key}`) ? `快捷鍵：${command.key}` : "",
  ].filter(Boolean).join("\n");
  button.dataset.tip = button.title;
  button.textContent = command.label;
  if (command.key) button.append(element(button.ownerDocument, "kbd", command.key));
}

export function createPanels(nodes: PanelNodes): (s: UiSnapshot) => void {
  const doc = nodes.unit.ownerDocument;
  const buttons = new Map<string, { button: HTMLButtonElement; wrapper: HTMLElement }>();
  const cache = new Map<string, string>();
  const changed = (key: string, data: unknown): boolean => {
    const value = JSON.stringify(data);
    if (cache.get(key) === value) return false;
    cache.set(key, value);
    return true;
  };
  return (s) => {
    if (changed("commands", s.commands)) {
      for (const [id, entry] of buttons) entry.wrapper.hidden = !s.commands.some(c => c.id === id);
      for (const [index, command] of s.commands.entries()) {
        let entry = buttons.get(command.id);
        if (!entry) {
          const wrapper = element(doc, "span", "", "command-option");
          const button = element(doc, "button");
          wrapper.append(button);
          entry = { wrapper, button };
          buttons.set(command.id, entry);
        }
        const { button, wrapper } = entry;
        updateCommand(button, command);
        wrapper.hidden = false;
        wrapper.tabIndex = command.enabled ? -1 : 0;
        wrapper.dataset.tip = wrapper.title = button.title;
        // 僅排序有變才搬節點；enabled 切換時保留焦點與位置。
        if (nodes.commands.children[index] !== wrapper) nodes.commands.insertBefore(wrapper, nodes.commands.children[index] ?? null);
      }
    }
    const operator = s.operator ?? s.selected;
    if (changed("unit", operator)) {
      const open = nodes.unit.querySelector<HTMLDetailsElement>("details")?.open ?? false;
      unitPanel(nodes.unit, operator);
      const detail = nodes.unit.querySelector<HTMLDetailsElement>("details");
      if (detail) detail.open = open;
    }
    const partsUnit = s.partsUnit ?? s.inspect.unit ?? s.selected;
    if (changed("parts", [partsUnit, s.mode.kind === "part"])) partsPanel(nodes.parts, partsUnit, s.mode.kind === "part");
    if (changed("inspect", s.inspect)) {
      const info = s.inspect;
      nodes.inspect.replaceChildren(element(doc, "h2", `查看 ${info.x},${info.y}`),
        element(doc, "h3", info.terrainName), element(doc, "p", info.terrainNote));
      if (info.feature) nodes.inspect.append(element(doc, "p", `可破壞地物 HP ${info.feature.hp}/${info.feature.max} · 選擇一般攻擊後點此格`));
      for (const object of info.objects ?? []) nodes.inspect.append(element(doc, "p", `${object.name} · ${object.note} · 使用「回收${object.name}」按鈕`));
      if (info.unit) nodes.inspect.append(element(doc, "p", `${info.unit.name} · ${info.unit.frameName} · ${info.unit.status}`, `side-${info.unit.side}`));
      if (info.unit?.defenseNote) nodes.inspect.append(element(doc, "p", info.unit.defenseNote, "defense-note"));
      if (info.unit?.presenceNote) nodes.inspect.append(element(doc, "p", info.unit.presenceNote, "presence-note"));
      for (const note of info.unit?.auraNotes ?? []) nodes.inspect.append(element(doc, "p", note, "aura-note"));
    }
    if (changed("log", s.log)) {
      const follow = nodes.log.scrollHeight - nodes.log.scrollTop - nodes.log.clientHeight <= 24;
      nodes.log.replaceChildren(...s.log.map(line => {
        const li = element(doc, "li", line.text);
        li.dataset.kind = line.kind;
        if (line.at) {
          li.dataset.seq = String(line.seq);
          li.tabIndex = 0;
          li.setAttribute("role", "button");
          li.title = `查看 ${line.at.x},${line.at.y}`;
        }
        return li;
      }));
      if (follow) nodes.log.scrollTop = nodes.log.scrollHeight;
    }
    nodes.message.hidden = s.message === null;
    nodes.message.textContent = s.message;
    nodes.outcome.hidden = s.outcome === null;
    nodes.outcome.textContent = s.outcome?.text ?? "";
    nodes.help.hidden = !s.showHelp;
    if (changed("help", s.keyHints)) {
      const table = element(doc, "table");
      const body = element(doc, "tbody");
      for (const hint of s.keyHints) {
        const row = element(doc, "tr");
        const keys = element(doc, "td");
        for (const key of hint.keys) keys.append(element(doc, "kbd", key === " " ? "Space" : key));
        row.append(element(doc, "th", hint.label), keys);
        body.append(row);
      }
      table.append(body);
      nodes.help.replaceChildren(element(doc, "h2", "快捷鍵說明"), table);
    }
  };
}
