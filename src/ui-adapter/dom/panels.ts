import type { UiSnapshot, UnitView } from "../vm/types.ts";

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
  node.replaceChildren(element(doc, "h2", "單位"));
  if (!unit) {
    node.append(element(doc, "p", "尚未選取單位"));
    return;
  }
  node.append(element(doc, "h3", unit.name, `side-${unit.side}`),
    element(doc, "p", `${unit.frameName} · ${unit.pos.x},${unit.pos.y} · ${unit.controlMode} · ${unit.status}`));
  for (const person of unit.persons) {
    node.append(element(doc, "p", `${person.role}：${person.name} · 士氣 ${person.morale}`));
  }
  for (const part of unit.parts) {
    const section = element(doc, "section", "", part.broken ? "broken" : "");
    section.append(element(doc, "h4", `${part.name}${part.broken ? "（損毀）" : ""}`));
    for (const layer of part.layers) section.append(meter(doc, `${layer.type}${layer.broken ? "（損毀）" : ""}`, layer.hp, layer.max));
    node.append(section);
  }
  for (const pool of unit.pools) node.append(meter(doc, pool.name, pool.cur, pool.max));
  const effects = element(doc, "div", "", "effects");
  for (const effect of unit.effects) effects.append(element(doc, "span", `${effect.name} ×${effect.stacks} · 剩餘 ${effect.remaining ?? "∞"}`, "effect-badge"));
  node.append(effects);
}

export type PanelNodes = Record<"commands" | "unit" | "inspect" | "log" | "message" | "outcome" | "help", HTMLElement>;

export function createPanels(nodes: PanelNodes): (s: UiSnapshot) => void {
  const doc = nodes.unit.ownerDocument;
  const cache = new Map<string, string>();
  const changed = (key: string, data: unknown): boolean => {
    const value = JSON.stringify(data);
    if (cache.get(key) === value) return false;
    cache.set(key, value);
    return true;
  };
  return (s) => {
    if (changed("commands", s.commands)) {
      nodes.commands.replaceChildren();
      for (const [group, label] of [["move", "移動"], ["ability", "能力"], ["turn", "回合"], ["system", "系統"]] as const) {
        const section = element(doc, "section", "", "command-group");
        section.append(element(doc, "h3", label));
        for (const command of s.commands.filter(c => c.group === group)) {
          const button = element(doc, "button", command.label, command.active ? "active" : "");
          button.type = "button";
          button.dataset.cmd = command.id;
          button.disabled = !command.enabled;
          button.title = [command.tooltip,
            command.reason && !command.tooltip.includes(command.reason) ? command.reason : "",
            command.key && !command.tooltip.includes(`快捷鍵：${command.key}`) ? `快捷鍵：${command.key}` : "",
          ].filter(Boolean).join("\n");
          button.dataset.tip = button.title;
          if (command.key) button.append(element(doc, "kbd", command.key));
          // disabled 按鈕無法取得鍵盤焦點，包裝層提供相同提示。
          const wrapper = element(doc, "span", "", "command-option");
          if (!command.enabled) {
            wrapper.tabIndex = 0;
            wrapper.dataset.tip = button.title;
            wrapper.title = button.title;
          }
          wrapper.append(button);
          section.append(wrapper);
        }
        nodes.commands.append(section);
      }
    }
    if (changed("unit", s.selected)) unitPanel(nodes.unit, s.selected);
    if (changed("inspect", s.inspect)) {
      const info = s.inspect;
      nodes.inspect.replaceChildren(element(doc, "h2", `查看 ${info.x},${info.y}`),
        element(doc, "h3", info.terrainName), element(doc, "p", info.terrainNote));
      if (info.unit) nodes.inspect.append(element(doc, "p", `${info.unit.name} · ${info.unit.frameName} · ${info.unit.status}`, `side-${info.unit.side}`));
    }
    if (changed("log", s.log)) {
      nodes.log.replaceChildren(...s.log.map(line => {
        const li = element(doc, "li", line.text);
        li.dataset.kind = line.kind;
        return li;
      }));
      nodes.log.scrollTop = nodes.log.scrollHeight;
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
