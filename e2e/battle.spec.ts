// 端對端（Playwright headless Chromium）：載入、結束回合（按鈕＋快捷鍵＋確認）、大地圖捲動，
// 以及 lead-ui-fix 的試玩回饋：行動後浮出選單、縮放（記住設定）、跳過動畫、小地圖自動貼合。
import { test, expect, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadContentDirs } from "../src/content/loader.ts";
import { runBattle, scenarioToSetup } from "../src/sim/run.ts";
import type { BattleState, BattleOutcome, Command } from "../src/core/types-state.ts";

// 同一次既有headless驗證可選存圖；未設輸出路徑時不寫檔。
const battleShot = async (page: Page, name: string): Promise<void> => {
  const directory = process.env.BATTLE_SHOTS;
  if (!directory) return;
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: join(directory, `${name}.png`), fullPage: true });
};

type Snap = {
  activeUnit: string | null; round: number; playerTurn: boolean; busy: unknown; confirm: { text: string } | null;
  quickMenu: { options: { id: string }[] } | null; selected: { id: string } | null; map: { width: number; height: number };
};

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

const snap = (page: Page) => page.evaluate(() => (window as unknown as { __battle: { snapshot(): Snap } }).__battle.snapshot());
const settle = (page: Page) => page.evaluate(() => { (window as unknown as { __battle: { settle(): void } }).__battle.settle(); });
const cellWidth = async (page: Page) => (await page.locator('[data-ui="board"] [data-x][data-y]').first().boundingBox())!.width;

async function viewportPos(page: Page): Promise<{ x: number; y: number }> {
  const text = (await page.locator('[data-ui="viewport-pos"]').textContent()) ?? "";
  const m = /(\d+)\s*,\s*(\d+)/.exec(text);
  if (!m) throw new Error(`viewport-pos 讀不到座標：${text}`);
  return { x: Number(m[1]), y: Number(m[2]) };
}

test("載入：戰場方格、回合、固定指令面板與快捷鍵標示都在", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  expect(await board.locator("[data-x][data-y]").count()).toBeGreaterThan(50);
  await expect(page.locator('[data-ui="round"]')).toContainText("1");
  for (const id of ["move", "standby", "defer", "end", "eject", "retreat", "skip"]) {
    await expect(page.locator(`[data-ui="commands"] button[data-cmd="${id}"]`)).toBeVisible();
  }
  await expect(page.locator('[data-ui="commands"] button[data-cmd="end"] kbd')).toHaveText(/E/i);
  await board.locator("[data-x][data-y]").first().click();
  await expect(page.locator('[data-ui="inspect"]')).not.toBeEmpty();
  await expect(page.locator('[data-ui="log"]')).toBeVisible();
  await battleShot(page, "battle-desktop-1280");
  expect(errors).toEqual([]);
});

test("行動後浮出下一步選單：點可達格移動後仍選取同一台，選單含待機", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  await settle(page);
  const before = await snap(page);
  expect(before.playerTurn).toBe(true);
  const reach = page.locator('[data-ui="board"] .highlight-reach');
  expect(await reach.count()).toBeGreaterThan(0);
  // [lead-wiki] 殼導航列讓戰場矮 40px，格子位置會變；挑一個中心點沒被回合開始的浮出選單蓋住的可達格。
  const open = await reach.evaluateAll(cells => cells.map((cell, i) => {
    const r = cell.getBoundingClientRect();
    return cell.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)) ? i : -1;
  }).filter(i => i >= 0));
  expect(open.length).toBeGreaterThan(0);
  await reach.nth(open[Math.floor(open.length / 2)]!).click();
  await expect(page.locator('[data-ui="quick-menu"]')).toBeVisible();
  await expect(page.locator('[data-ui="quick-menu"] button[data-cmd="standby"]')).toBeVisible();
  const after = await snap(page);
  expect(after.activeUnit).toBe(before.activeUnit);
  expect(after.selected?.id).toBe(before.activeUnit);
  // 選單上按待機 → 換下一台（AI 演出跳過後輪回我方）
  await page.locator('[data-ui="quick-menu"] button[data-cmd="standby"]').click();
  await settle(page);
  const next = await snap(page);
  expect(next.activeUnit !== before.activeUnit || next.round > before.round).toBe(true);
  expect(errors).toEqual([]);
});

test("結束回合：還有未行動機體時第一次 E 出確認，再按 E 才推進；按鈕同樣可用", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  await settle(page);
  const log = page.locator('[data-ui="log"] li');
  const before = await snap(page);
  const n0 = await log.count();
  await page.locator("body").press("e");
  await expect(page.locator('[data-ui="confirm"]')).toBeVisible();
  await expect(page.locator('[data-ui="confirm"]')).toContainText(/還有 \d+ 台未行動/);
  expect((await snap(page)).activeUnit).toBe(before.activeUnit);
  await page.locator("body").press("e");
  await settle(page);
  await expect(page.locator('[data-ui="confirm"]')).toBeHidden();
  await expect.poll(async () => await log.count()).toBeGreaterThan(n0);
  const mid = await snap(page);
  expect(mid.round > before.round || mid.activeUnit !== before.activeUnit).toBe(true);
  // 按鈕＋確認框的「確定」
  const n1 = await log.count();
  await page.locator('[data-ui="commands"] button[data-cmd="end"]').click();
  if (await page.locator('[data-ui="confirm"]').isVisible()) await page.locator('[data-ui="confirm-accept"]').click();
  await settle(page);
  await expect.poll(async () => await log.count()).toBeGreaterThan(n1);
  expect(errors).toEqual([]);
});

test("縮放：+ 放大、− 縮小、0 回自動貼合；設定存進 localStorage，重新載入後保留", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  const auto = await cellWidth(page);
  await page.locator("body").press("+");
  await expect.poll(() => cellWidth(page)).toBeGreaterThan(auto);
  const zoomed = await cellWidth(page);
  expect(await page.evaluate(() => localStorage.getItem("mecha-srpg.ui.zoom"))).not.toBe("auto");
  await page.reload();
  await expect.poll(() => cellWidth(page)).toBeCloseTo(zoomed, 0);
  await page.locator("body").press("-");
  await expect.poll(() => cellWidth(page)).toBeLessThan(zoomed);
  await page.locator('[data-ui="zoom-fit"]').click();
  await expect.poll(() => cellWidth(page)).toBeCloseTo(auto, 0);
  // Ctrl＋滾輪也縮放
  await page.locator('[data-ui="board"]').hover();
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -200);
  await page.keyboard.up("Control");
  await expect.poll(() => cellWidth(page)).toBeGreaterThan(auto);
  expect(errors).toEqual([]);
});

test("小地圖自動貼合：20×20 地圖格子放大到填滿戰場面板的一邊", async ({ page }) => {
  await page.goto("/?anim=off");
  await page.evaluate(() => { try { localStorage.removeItem("mecha-srpg.ui.zoom"); } catch { /* 無 */ } });
  await page.reload();
  const s = await snap(page);
  const board = (await page.locator('[data-ui="board"]').boundingBox())!;
  const panel = (await page.locator('[data-ui="board"]').locator("xpath=ancestor::*[contains(@class,'board-viewport')]").boundingBox())!;
  expect(s.map.width).toBeLessThanOrEqual(40);
  expect(Math.max(board.width / panel.width, board.height / panel.height)).toBeGreaterThan(0.85);
});

test("跳過動畫：敵方回合播放中按 Esc，立刻跳到輪回我方", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=on");
  await settle(page);
  await page.locator("body").press("e");
  if ((await snap(page)).confirm) await page.locator("body").press("e");
  await expect.poll(async () => (await snap(page)).busy !== null).toBe(true);
  await expect(page.locator('[data-ui="commands"] button[data-cmd="skip"]')).toBeEnabled();
  await page.locator("body").press("Escape");
  const after = await snap(page);
  expect(after.busy).toBeNull();
  expect(after.playerTurn || after.activeUnit === null).toBe(true);
  await expect(page.locator('[data-ui="fx-layer"] > *')).toHaveCount(0);
  // 動畫設定可切換並記住
  await page.locator('[data-ui="anim-toggle"]').click();
  expect(await page.evaluate(() => localStorage.getItem("mecha-srpg.ui.anim"))).toBe("fast");
  expect(errors).toEqual([]);
});

test("大地圖 160×160：快捷鍵與滾輪捲動可視區，只渲染可視區的格", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?scenario=debug-big&size=160&anim=off");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  const cells = await board.locator("[data-x][data-y]").count();
  expect(cells).toBeGreaterThan(50);
  expect(cells).toBeLessThan(160 * 160 / 4);
  await page.locator('[data-ui="scroll-left"]').click();
  const p0 = await viewportPos(page);
  await page.locator("body").press("Shift+ArrowRight");
  await expect.poll(async () => (await viewportPos(page)).x).toBeGreaterThan(p0.x);
  const p1 = await viewportPos(page);
  await board.hover();
  await page.mouse.wheel(0, 300);
  await expect.poll(async () => (await viewportPos(page)).y).not.toBe(p1.y);
  const p2 = await viewportPos(page);
  await expect(board.locator(`[data-x="${p2.x}"][data-y="${p2.y}"]`)).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("觀戰：?spectate=1&anim=off 載入後經 settle 回合或事件有前進、無頁面錯誤", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?spectate=1&anim=off");
  await expect(page.locator('[data-ui="board"]')).toBeVisible();
  const first = await snap(page);
  expect(first.playerTurn).toBe(false);
  for (let i = 0; i < 3; i++) { await settle(page); await page.waitForTimeout(50); }
  const after = await snap(page) as Snap & { log: unknown[]; outcome: unknown };
  expect(after.round > first.round || after.log.length > 0 || after.outcome !== null).toBe(true);
  expect(errors).toEqual([]);
});

test("可互動戰場：地物與回收物可見，支援攻擊送入原戰鬥", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?scenario=playable-battlefield&anim=off");
  await settle(page);
  const board = page.locator('[data-ui="board"]');
  const wall = board.locator('[data-x="4"][data-y="3"]');
  await expect(wall).toHaveAttribute("title", /可破壞地物 HP 60\/60/u);
  await expect(board.locator('[data-x="3"][data-y="3"]')).toHaveAttribute("title", /機械殘骸/u);
  await expect(board.locator('[data-x="3"][data-y="4"]')).toHaveAttribute("title", /怪獸屍體/u);
  await expect(page.locator('[data-ui="commands"] [data-cmd="interact:rubble-stock"]')).toBeVisible();
  const { db } = loadContentDirs(["content/base"]);
  const definition = db.require("ability", "ability/battlefield-support");
  const cost = definition.costs.find(cost => cost.owner === "person" && cost.pool === "ap")!.amount;
  if (typeof cost !== "number") throw new Error("支援彈AP成本必須可核對");
  const actionAudit = () => page.evaluate(() => {
    const battle = (window as unknown as { __battle: {
      snapshot(): { operator: { id: string; pools: { id: string; cur: number }[] } | null };
      audit(): { commands: Command[] };
    } }).__battle;
    const actor = battle.snapshot().operator!;
    return { actor: actor.id, ap: actor.pools.find(pool => pool.id.endsWith(":ap"))!.cur, commands: battle.audit().commands };
  });
  const traceDirectory = process.env.BATTLE_TRACE;
  if (traceDirectory) await page.evaluate(() => {
    type Trace = { entries: unknown[]; read(): unknown };
    const target = window as unknown as { __battle: { peek(): { mode: unknown; message: unknown; activeUnit: unknown; operator?: { pools: unknown } }; audit(): { commands: unknown[] } }; __battleTrace?: Trace };
    const wall = document.querySelector<HTMLElement>('[data-ui="board"] [data-x="4"][data-y="3"]');
    const describe = (node: EventTarget | null): unknown => {
      if (!(node instanceof Element)) return node === document ? "document" : node === window ? "window" : null;
      const element = node as HTMLElement;
      return { tag: element.tagName, cls: element.className, ui: element.dataset.ui, x: element.dataset.x, y: element.dataset.y,
        cmd: element.dataset.cmd, text: element.textContent?.slice(0, 100), connected: element.isConnected };
    };
    const read = () => {
      const snapshot = target.__battle.peek(), audit = target.__battle.audit();
      const current = document.querySelector<HTMLElement>('[data-ui="board"] [data-x="4"][data-y="3"]');
      return { mode: snapshot.mode, message: snapshot.message, activeUnit: snapshot.activeUnit, pools: snapshot.operator?.pools,
        commandCount: audit.commands.length, lastCommands: audit.commands.slice(-3),
        wall: { originalConnected: wall?.isConnected, currentConnected: current?.isConnected, sameNode: current === wall,
          original: describe(wall), current: describe(current), title: current?.title, rect: current?.getBoundingClientRect().toJSON() } };
    };
    const entries: unknown[] = [];
    const record = (phase: string) => (event: Event) => {
      if (entries.length >= 120) return;
      const mouse = event as MouseEvent;
      entries.push({ phase, event: event.type, time: performance.now(), x: mouse.clientX, y: mouse.clientY,
        target: describe(event.target), path: event.composedPath().map(describe),
        hit: describe(document.elementFromPoint(mouse.clientX, mouse.clientY)), state: read() });
    };
    for (const event of ["pointerdown", "pointerup", "click"]) {
      document.addEventListener(event, record("document-capture"), { capture: true, passive: true });
      document.addEventListener(event, record("document-bubble"), { passive: true });
      const shell = document.querySelector(".battle-view");
      shell?.addEventListener(event, record("shell-capture"), { capture: true, passive: true });
      shell?.addEventListener(event, record("shell-bubble-after-handler"), { passive: true });
    }
    entries.push({ phase: "installed", state: read() });
    target.__battleTrace = { entries, read };
  });
  const before = await actionAudit();
  try {
  await page.locator('[data-ui="commands"]').getByRole("button", { name: /^支援爆破彈/u }).click();
  if (traceDirectory) await page.evaluate(() => { const trace = (window as unknown as { __battleTrace: { entries: unknown[]; read(): unknown } }).__battleTrace; trace.entries.push({ phase: "after-ability-normal-click", state: trace.read() }); });
  const beforeHover = { board: await board.boundingBox(), cell: await wall.boundingBox() };
  await wall.hover();
  expect(await board.boundingBox()).toEqual(beforeHover.board);
  expect(await wall.boundingBox()).toEqual(beforeHover.cell);
  await page.evaluate(() => {
    const target = window as unknown as { __wallClickRoute: { type: string; x: string | null; y: string | null }[] };
    target.__wallClickRoute = [];
    for (const type of ["pointerdown", "pointerup", "click"]) document.addEventListener(type, event => {
      const cell = (event.target as Element | null)?.closest?.('[data-ui="board"] [data-x][data-y]');
      target.__wallClickRoute.push({ type: event.type, x: cell?.getAttribute("data-x") ?? null, y: cell?.getAttribute("data-y") ?? null });
    }, { capture: true, passive: true });
  });
  await wall.click();
  const route = await page.evaluate(() => (window as unknown as { __wallClickRoute: { type: string; x: string | null; y: string | null }[] }).__wallClickRoute);
  expect(route).toEqual(["pointerdown", "pointerup", "click"].map(type => ({ type, x: "4", y: "3" })));
  if (traceDirectory) await page.evaluate(() => { const trace = (window as unknown as { __battleTrace: { entries: unknown[]; read(): unknown } }).__battleTrace; trace.entries.push({ phase: "after-wall-normal-click", state: trace.read() }); });
  await expect(wall).toHaveAttribute("title", /HP 40\/60/u);
  const after = await actionAudit();
  expect(after.actor).toBe(before.actor);
  expect(after.ap).toBe(before.ap - cost);
  expect(after.commands).toHaveLength(before.commands.length + 1);
  expect(after.commands.at(-1)).toMatchObject({ kind: "useAbility", actor: before.actor, ability: definition.id, target: { cell: { x: 4, y: 3 } } });
  } finally {
    if (traceDirectory) {
      const trace = await page.evaluate(() => {
        const trace = (window as unknown as { __battleTrace: { entries: unknown[]; read(): unknown } }).__battleTrace;
        return { entries: trace.entries, final: trace.read() };
      });
      await mkdir(traceDirectory, { recursive: true });
      await writeFile(join(traceDirectory, "battle-interaction-events.json"), JSON.stringify(trace, null, 2));
    }
  }
  expect(errors).toEqual([]);
});

test("正式情境選單可進混合兵種並返回回收戰場", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/?anim=off");
  const select = page.getByLabel("戰鬥情境", { exact: true });
  await expect(select.locator("option")).toHaveCount(3);
  await select.selectOption("scenario/combined-arms-battlefield");
  await expect(page).toHaveURL(/scenario=scenario%2Fcombined-arms-battlefield/u);
  await expect(page.locator('[data-ui="topbar"] h1')).toContainText("常規地面編組");
  await expect(page.locator('[data-ui="board"] .unit-badge.side-self')).toHaveCount(5);
  await page.getByLabel("戰鬥情境", { exact: true }).selectOption("scenario/playable-battlefield");
  await expect(page.locator('[data-ui="topbar"] h1')).toContainText("廢墟回收");
  expect(errors).toEqual([]);
});

test("正式default觀戰與node同seed命令、hash及逐單位真終局一致", async ({ page }) => {
  const errors = watchErrors(page), seed = 1;
  const { db, errors: contentErrors } = loadContentDirs(["content/base"]);
  expect(contentErrors).toEqual([]);
  const definition = db.require("scenario", "scenario/skirmish-whitegloves");
  expect(definition.rounds).toBe(20); // 正式內容實值；不為節奏稽核延長戰局。
  const expected = runBattle({ db, sim: scenarioToSetup(db, definition.id, seed), seed });
  expect(expected.stopped).toBe("outcome");
  expect(expected.state.rt?.outcome?.reason).toBe("eliminate"); // timeout／擊退不能冒稱全殲終局。
  const numeric = (state: BattleState) => ({
    units: Object.values(state.units).sort((a, b) => a.id.localeCompare(b.id)).map(unit => ({ id: unit.id, pos: unit.pos, moveSpent: unit.moveSpent ?? 0, pools: unit.pools, parts: unit.parts })),
    persons: Object.values(state.persons).sort((a, b) => a.id.localeCompare(b.id)).map(person => ({ id: person.id, attrs: person.attrsBase, pools: person.pools })),
  });
  await page.goto("/?seed=1&spectate=1&anim=off");
  await expect(page.locator('[data-ui="topbar"] h1')).toContainText("正面交戰・不可撤離");
  await settle(page);
  const audit = await page.evaluate(() => (window as unknown as { __battle: { audit(): {
    round: number; outcome: BattleOutcome | null; hash: string; commands: Command[]; numeric: ReturnType<typeof numeric>;
    units: { id: string; owner: string; status: string }[]; deathIds: string[]; retreatCount: number; ejectCount: number;
  } } }).__battle.audit());
  expect(audit.outcome).not.toBeNull();
  expect(audit.outcome?.reason).toBe("eliminate");
  expect(audit.outcome).toEqual(expected.state.rt?.outcome);
  expect(audit.round).toBe(expected.state.round);
  expect(audit.commands).toEqual(expected.commands);
  expect(audit.hash).toBe(expected.hash);
  expect(audit.numeric).toEqual(numeric(expected.state));
  expect(audit.retreatCount).toBe(0); expect(audit.ejectCount).toBe(0);
  const originals = ["player-0", "player-1", "player-2", "player-3", "enemy-0", "enemy-1", "enemy-2", "enemy-3"];
  expect(audit.units.map(unit => unit.id).sort()).toEqual([...originals].sort());
  for (const id of originals) {
    expect(audit.units.find(unit => unit.id === id)?.status, id).toBe(expected.state.rt?.unitStatus[id]);
  }
  expect(audit.deathIds).toEqual(expected.state.log.events.filter(event => event.type === "UnitDied").map(event => String(event.payload.unit)));
  await expect(page.locator('[data-ui="outcome"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test("360窄窗戰場可操作，部位與log循文件排版不遮蓋或橫向溢出", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/?anim=off");
  const board = page.locator('[data-ui="board"]');
  await expect(board).toBeVisible();
  const cell = board.locator('[data-x][data-y]').first();
  await cell.click();
  await expect(page.locator('[data-ui="inspect"]')).not.toBeEmpty();
  const sizes = await page.evaluate(() => {
    const field = document.querySelector(".battle-field")!.getBoundingClientRect();
    const parts = document.querySelector('[data-ui="parts"]')!.getBoundingClientRect();
    const log = document.querySelector(".log-panel")!.getBoundingClientRect();
    return { width: document.documentElement.scrollWidth, viewport: innerWidth, fieldBottom: field.bottom, partsTop: parts.top, partsBottom: parts.bottom, logTop: log.top };
  });
  await expect(page.locator('[data-ui="quick-menu"]')).toBeHidden();
  expect(sizes.width).toBeLessThanOrEqual(sizes.viewport);
  expect(sizes.partsTop).toBeGreaterThanOrEqual(sizes.fieldBottom);
  expect(sizes.logTop).toBeGreaterThanOrEqual(sizes.partsBottom);
  expect(await page.locator('.battle-field [data-ui="part-picker"]').count()).toBe(0);
  await battleShot(page, "battle-mobile-360");
});

test("桌面靠下格長浮出選單留在戰場內，捲到尾項仍可正常待機", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 560 });
  await page.goto("/?anim=off"); await settle(page);
  await page.locator("body").press("c");
  const before = await snap(page);
  const actorCell = page.locator('[data-ui="board"] .unit-badge.active').locator("..");
  const x = Number(await actorCell.getAttribute("data-x")), y = Number(await actorCell.getAttribute("data-y"));
  const lower = page.locator(`[data-ui="board"] [data-x="${x}"][data-y="${y + 1}"]`);
  await expect(lower).toHaveClass(/highlight-reach/u);
  await lower.click();
  const menu = page.locator('[data-ui="quick-menu"]');
  await expect(menu).toBeVisible();
  const geometry = () => page.evaluate(() => {
    const menu = document.querySelector<HTMLElement>('[data-ui="quick-menu"]')!;
    const bounds = document.querySelector(".board-viewport")!.getBoundingClientRect(), rect = menu.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
      boundLeft: Math.max(0, bounds.left), boundRight: Math.min(innerWidth, bounds.right), boundTop: Math.max(0, bounds.top), boundBottom: Math.min(innerHeight, bounds.bottom),
      scrollHeight: menu.scrollHeight, clientHeight: menu.clientHeight };
  });
  const short = await geometry();
  expect(short.left).toBeGreaterThanOrEqual(short.boundLeft);
  expect(short.right).toBeLessThanOrEqual(short.boundRight);
  expect(short.top).toBeGreaterThanOrEqual(short.boundTop);
  expect(short.bottom).toBeLessThanOrEqual(short.boundBottom);
  expect(short.scrollHeight).toBeGreaterThan(short.clientHeight);
  const last = menu.getByRole("button").last();
  await last.scrollIntoViewIfNeeded();
  const tail = await last.boundingBox(), menuRect = await menu.boundingBox();
  expect(tail!.y).toBeGreaterThanOrEqual(menuRect!.y);
  expect(tail!.y + tail!.height).toBeLessThanOrEqual(menuRect!.y + menuRect!.height);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(menu).toBeVisible();
  await battleShot(page, "battle-desktop-quickmenu-1280");
  await menu.locator('[data-cmd="standby"]').click(); await settle(page);
  const after = await snap(page);
  expect(after.activeUnit !== before.activeUnit || after.round > before.round).toBe(true);
});
