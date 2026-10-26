// ui-adapter/ops/dom/tabs — 主區八個分頁的畫法（世界圖另在 world-map.ts，經 mountWorldMap 介面掛入）。
import type { OpsSnapshot, OpsTab, OpsUiAction, ContractView, MechRow } from "../vm/types.ts";
import { buttonRow, changeCache, el, meter, table, type ActionRegistry } from "./ui.ts";
import { mountWorldMap } from "./world-map.ts";

export const TAB_ORDER: OpsTab[] = ["ship", "world", "contracts", "roster", "mechs", "ledger", "market", "calendar"];

const money = (n: number): string => `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("en-US")}`;
const signed = (n: number): string => `${n > 0 ? "+" : n < 0 ? "−" : "±"}${Math.abs(n).toLocaleString("en-US")}`;

/** 列表中可點的一列（選取用，不是 OpsButton）。 */
function pickRow(doc: Document, registry: ActionRegistry, action: OpsUiAction, selected: boolean, ...children: (string | Node)[]): HTMLLIElement {
  const li = el(doc, "li", "", `ops-pick${selected ? " selected" : ""}`);
  li.tabIndex = 0;
  li.setAttribute("role", "button");
  li.setAttribute("aria-pressed", String(selected));
  for (const c of children) li.append(typeof c === "string" ? el(doc, "span", c) : c);
  registry.set(li, action);
  return li;
}

function contractDetail(doc: Document, c: ContractView, registry: ActionRegistry): HTMLElement {
  const box = el(doc, "section", "", "ops-detail");
  box.append(el(doc, "h2", c.title), el(doc, "p", `${c.kindName}・委託：${c.issuerName}・地點：${c.nodeName}・${c.statusName}`),
    table(doc, ["總酬", "預付", "人頭", "期限"], [[money(c.total), money(c.advance), money(c.perHead), `第 ${c.deadlineDay} 日（剩 ${c.daysLeft} 天）`]]));
  if (c.text) box.append(el(doc, "p", c.text));
  if (c.enemy) box.append(el(doc, "p", `敵情：${c.enemy}`, "ops-enemy"));
  box.append(buttonRow(doc, c.buttons, registry));
  return box;
}

function mechDetail(doc: Document, m: MechRow, registry: ActionRegistry): HTMLElement {
  const box = el(doc, "section", "", "ops-detail");
  box.dataset.mech = m.id;
  box.append(el(doc, "h2", m.name));
  const titles = el(doc, "div", "", "ops-titles");
  for (const t of m.titles) {
    const chip = el(doc, "span", t.name, `ops-chip title-${t.kind}`);
    chip.dataset.tip = t.kindName;
    titles.append(chip);
  }
  box.append(titles, el(doc, "p", `${m.frameName}・${m.grade} 級・${m.whereName}`));
  if (m.beast) {
    const beast = el(doc, "div", "", "ops-beast");
    beast.dataset.ui = "beast";
    beast.append(el(doc, "h3", m.beast.kindName), meter(doc, "磨損", m.beast.wear, 100, "wear"), meter(doc, "活性", m.beast.vitality, 100, "vitality"));
    if (m.beast.sustainDue !== null) beast.append(el(doc, "p", `維持期限：第 ${m.beast.sustainDue} 日`));
    box.append(beast);
  }
  const parts = el(doc, "div", "", "ops-parts");
  for (const p of m.parts) {
    const row = meter(doc, `${p.name}${p.broken ? "（損毀）" : ""}`, p.hp, p.max, p.broken ? "broken" : "");
    if (p.broken) row.classList.add("broken");
    parts.append(row);
  }
  box.append(el(doc, "h3", "部件"), parts);
  if (m.pools.length) {
    box.append(el(doc, "h3", "資源"));
    for (const p of m.pools) box.append(meter(doc, p.name, p.cur, p.max));
  }
  box.append(el(doc, "h3", "座位"), table(doc, ["座位", "人員"], m.seats.map(s => [s.seatName, s.personName ?? "（空）"])));
  if (m.jobs.length) {
    box.append(el(doc, "h3", "佇列"));
    const ul = el(doc, "ul");
    for (const j of m.jobs) ul.append(el(doc, "li", j));
    box.append(ul);
  }
  box.append(buttonRow(doc, m.buttons, registry));
  return box;
}

export type TabPanes = { panes: Record<OpsTab, HTMLElement>; paint(s: OpsSnapshot): void; destroy(): void };

export function createTabs(main: HTMLElement, registry: ActionRegistry, onAction: (a: OpsUiAction) => void): TabPanes {
  const doc = main.ownerDocument;
  const changed = changeCache();
  const panes = {} as Record<OpsTab, HTMLElement>;
  for (const tab of TAB_ORDER) {
    const pane = el(doc, "section", "", `ops-pane pane-${tab}`);
    pane.dataset.tab = tab;
    pane.hidden = true;
    panes[tab] = pane;
    main.append(pane);
  }
  const world = mountWorldMap(panes.world, { onAction });
  const painters: Record<Exclude<OpsTab, "world">, (s: OpsSnapshot) => [unknown, () => Node[]]> = {
    ship: s => [[s.room, s.roomButtons], () => {
      const rooms = s.roomButtons.filter(b => b.group === "rooms");
      const local = s.roomButtons.filter(b => b.group !== "rooms");
      return [el(doc, "h2", s.room.title), ...s.room.desc.map(d => el(doc, "p", d, "ops-room-desc")),
        el(doc, "h3", "本房動作"), buttonRow(doc, local, registry, "ops-buttons room-actions"),
        el(doc, "h3", "移動到"), buttonRow(doc, rooms, registry, "ops-buttons room-exits")];
    }],
    contracts: s => [s.contracts, () => {
      if (!s.contracts.length) return [el(doc, "h2", "契約"), el(doc, "p", "目前沒有可接或進行中的契約。", "muted")];
      const list = el(doc, "ul", "", "ops-list");
      for (const c of s.contracts) {
        list.append(pickRow(doc, registry, { type: "selectContract", contract: c.id }, c.selected,
          el(doc, "strong", c.title), `${c.statusName}・${money(c.total)}・剩 ${c.daysLeft} 天`));
      }
      const sel = s.contracts.find(c => c.selected);
      const split = el(doc, "div", "", "ops-split");
      split.append(list, sel ? contractDetail(doc, sel, registry) : el(doc, "p", "選一份契約查看詳情。", "muted ops-detail"));
      return [el(doc, "h2", "契約"), split];
    }],
    roster: s => [s.roster, () => [el(doc, "h2", "名冊"), (() => {
      const t = table(doc, ["姓名", "職務", "生命", "士氣", "薪", "欠薪", "座位", "狀態", "驅動時數", "年齡"], s.roster.map(p => [
        p.name, p.roleName, p.hp ? `${p.hp.cur}/${p.hp.max}` : "—", p.mood, money(p.wage), p.owed ? money(p.owed) : "—", p.seat ?? "—", p.status, p.driveHours ?? 0, p.apparentAge == null ? "—" : `外貌 ${p.apparentAge} 歲（實齡 ${p.realAge}）`]));
      const rows = t.querySelectorAll("tbody > tr");
      s.roster.forEach((p, i) => {
        const tr = rows[i] as HTMLTableRowElement;
        tr.dataset.person = p.id;
        tr.className = `ops-pick kind-${p.kind}${p.selected ? " selected" : ""}`;
        tr.tabIndex = 0;
        registry.set(tr, { type: "selectPerson", person: p.id });
      });
      return t;
    })()]],
    mechs: s => [s.mechs, () => {
      const list = el(doc, "ul", "", "ops-list");
      for (const m of s.mechs) {
        const li = pickRow(doc, registry, { type: "selectMech", mech: m.id }, m.selected, el(doc, "strong", m.name), `${m.frameName}・${m.whereName}`);
        if (m.beast) li.append(el(doc, "span", m.beast.kindName, "ops-chip beast"));
        list.append(li);
      }
      const sel = s.mechs.find(m => m.selected) ?? s.mechs[0];
      const split = el(doc, "div", "", "ops-split");
      split.append(list, sel ? mechDetail(doc, sel, registry) : el(doc, "p", "機庫是空的。", "muted ops-detail"));
      return [el(doc, "h2", "機甲"), split];
    }],
    ledger: s => [s.ledger, () => [el(doc, "h2", "帳本"),
      table(doc, ["帳戶", "餘額"], s.ledger.accounts.map(a => [a.name, money(a.balance)])),
      el(doc, "h3", "近期流水"),
      table(doc, ["日", "帳戶", "金額", "事由"], s.ledger.recent.map(r => {
        const amount = el(doc, "span", signed(r.delta), r.delta < 0 ? "neg" : "pos");
        return [r.day, r.name, amount, r.reason];
      }))]],
    market: s => [s.market, () => {
      const m = s.market;
      if (!m.available) return [el(doc, "h2", "市場"), el(doc, "p", m.reason ?? "目前無法交易。", "muted")];
      return [el(doc, "h2", m.name ?? "市場"), table(doc, ["品項", "類別", "價格", "庫存", "聲望門檻", ""], m.items.map(i =>
        [i.name, i.kindName, money(i.price), i.stock, i.reputation ? `${i.reputation.factionName}聲望 ${i.reputation.need}（目前 ${i.reputation.have}）` : "無", buttonRow(doc, i.buttons, registry)]))];
    }],
    calendar: s => [[s.calendar, s.header], () => {
      const c = s.calendar;
      const grid = el(doc, "div", "", "ops-calendar");
      grid.dataset.ui = "calendar-grid";
      for (const d of c.days) {
        const cell = el(doc, "div", `${d.dom}・${d.stageName}・${d.tideName}（${d.tide}）`, `ops-day phase-${d.phase}${d.today ? " today" : ""}${d.deadline ? " deadline" : ""}`);
        cell.dataset.dom = String(d.dom);
        cell.dataset.stage = d.stage; cell.dataset.tide = String(d.tide);
        cell.dataset.tip = `第 ${d.dom} 日・${{ spring: "漲潮", neap: "小潮", ordinary: "平潮" }[d.phase]}・${d.stageName}・潮級 ${d.tide}（${d.tideName}）${d.deadline ? "・有期限" : ""}${d.today ? "・今天" : ""}`;
        grid.append(cell);
      }
      const legend = el(doc, "div", "", "ops-cal-legend");
      for (const [p, t] of [["spring", "漲潮"], ["neap", "小潮"], ["ordinary", "平潮"]]) legend.append(el(doc, "span", t, `ops-day phase-${p}`));
      const omens = el(doc, "section", "", "ops-omens");
      omens.dataset.ui = "calendar-omens";
      omens.append(el(doc, "h3", "當日天象"));
      if (!c.omens.length) omens.append(el(doc, "p", "無天象。"));
      for (const omen of c.omens) {
        const link = el(doc, "a", omen.name); link.href = omen.href;
        const entry = el(doc, "p");
        entry.append(link, `・${omen.layerName}・${omen.tideEffect}${omen.text ? `：${omen.text}` : ""}`);
        omens.append(entry);
      }
      const up = el(doc, "ul", "", "ops-upcoming");
      for (const u of c.upcoming) up.append(el(doc, "li", `第 ${u.day} 日：${u.text}`));
      return [el(doc, "h2", `第 ${c.month + 1} 蝕月（今天第 ${c.dom} / ${c.daysPerMonth} 日）`),
        el(doc, "p", `當日潮候：${s.header.stageName}・潮級 ${s.header.tide}（${s.header.tideName}）`),
        el(doc, "p", c.nextSpringIn === 0 ? "今天是漲潮日。" : `距下次漲潮 ${c.nextSpringIn} 天。`),
        el(doc, "p", c.nextGreatTide ? `下一次大潮：${c.nextGreatTide.daysAway === 0 ? "今天" : `第 ${c.nextGreatTide.day} 日（距今 ${c.nextGreatTide.daysAway} 天）`}・潮級 ${c.nextGreatTide.tide}${c.nextGreatTide.omens.length ? `・${c.nextGreatTide.omens.map(o => o.name).join("、")}` : ""}` : "下一次大潮：期限內無（未來 800 天）。"), grid,
        legend, omens, el(doc, "h3", "近期"), up];
    }],
  };
  return {
    panes,
    paint(s) {
      for (const tab of TAB_ORDER) panes[tab].hidden = tab !== s.tab;
      world.render(s.world);
      for (const [tab, painter] of Object.entries(painters) as [Exclude<OpsTab, "world">, typeof painters.ship][]) {
        const [data, build] = painter(s);
        if (changed(tab, data)) panes[tab].replaceChildren(...build());
      }
    },
    destroy() { world.destroy(); },
  };
}
