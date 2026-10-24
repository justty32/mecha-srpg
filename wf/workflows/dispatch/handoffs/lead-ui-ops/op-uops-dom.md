# 任務：實作營運畫面的 DOM 層（面板、世界圖、船艙、名冊、機甲、帳本、市場、契約、日曆、事件），並接上戰鬥畫面與 e2e

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（含 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。spec：`wf/workflows/planning/specs/ops/text-ui-contract.md`。使用者 UI 回饋（營運畫面也要遵守）：`wf/workflows/dispatch/handoffs/lead-ui-fix/feedback.md`。

## 背景與唯一目標

營運層要有網頁畫面，風格與現有戰鬥畫面一致（使用者說配色 OK：參考 `src/ui-adapter/dom/style.css` 的色票與按鈕／kbd／面板樣式）。vm 與 DOM 只經**凍結契約** `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/vm/types.ts` 往來（**不可改**；不夠就寫 REPORT）。vm（`OpsController`）由 codex 工人 `cx-uops-vm` 同時在寫，**分兩階段**：

- **階段一（現在）**：只靠 types.ts＋你自己寫的 fixture `OpsSnapshot`，做完 DOM 渲染與 happy-dom 測試。
- **階段二（領導通知 vm 已落地後才做）**：接真 `OpsController`、戰鬥銜接、入口、e2e、headless 截圖。

唯一目標：**營運畫面可用滑鼠與快捷鍵玩完「開新戰役→推進→接約→出戰→戰鬥→回營運看戰果」**。

## 設計（領導已定，照做；細節你判斷）

1. `src/ui-adapter/ops/dom/render.ts`：`mountOps(root, { onAction(a: OpsUiAction): void; onKey(k: OpsKeyInput): boolean }): OpsView`，`OpsView = { render(s: OpsSnapshot): void; setActive(on: boolean): void /* 戰鬥中停收鍵盤並隱藏 */; destroy(): void }`。根元素 `[data-ui="ops"]`，class `ops-view`。
2. 佈局（面板常駐，不因分頁、prompt、捲動而消失或移位）：頂列 `[data-ui="ops-header"]`（日期／潮相／現金／債／所在地／航程／燃料／船體＋`timeButtons`＋說明鈕）；左欄 `[data-ui="ops-tabs"]`（分頁按鈕）＋常駐小表（裂縫、工時佇列）；主區 `[data-ui="ops-main"]` 依 `tab` 畫：`ship`（房間標題、描述、房間按鈕 rooms／room 兩組）、`world`（**SVG** 世界圖 `[data-ui="world-map"]`：航線線段、節點圓（屬性 `data-node` 放節點 id），蝕域／裂縫／勢力／所在地／目的地用顏色與標記區分，點節點送 `selectNode`；右側節點詳情與按鈕）、`contracts`（列表＋詳情＋按鈕）、`roster`、`mechs`（含稱號、生物系磨損／活性條）、`ledger`、`market`、`calendar`（本潮月逐日格，大潮／小潮標色）；右欄記錄 `[data-ui="ops-log"]`（kind 五色：info／warn／money／blood／soul）。
2b. **世界圖要做成可替換模組（使用者 2026-10-24 新裁示）**：營運大地圖之後會改成**方格式、自由移動**（spec 未改）。這一版照 `WorldView` 的節點／航線呈現即可，但：(a) 世界圖獨立成 `src/ui-adapter/ops/dom/world-map.ts`，對外只有 `mountWorldMap(root, { onAction }): { render(view: WorldView): void; destroy(): void }`，render.ts 只透過這個介面用它，日後整檔換掉不影響其他分頁；(b) 可視區、縮放、捲動、高亮盡量重用戰鬥畫面的方格元件（`src/ui-adapter/dom/zoom.ts` 的純函式、`board.ts`／style.css 的格子與高亮樣式能用就 import，**不改**那些檔）；(c) **不要投入節點圖專屬的花樣**（不做動畫、力導向互動、曲線航線等），簡單 SVG 線＋圓＋標籤即可。
3. 疊層：`prompt` 非 null → 置中對話框 `[data-ui="ops-prompt"]`（選項按鈕 `[data-choice=n]` 標鍵；`naming` 非 null 時加 `input[data-ui="ops-name-input"]`＋送出鈕送 `nameSubmit`）；`sortie` → 編成面板 `[data-ui="ops-sortie"]`（機體勾選、座位下拉 `select[data-seat]`、錯誤訊息、按鈕）；`report` → 戰果報告 `[data-ui="ops-report"]`；`showHelp` → 快捷鍵表 `[data-ui="ops-help"]`；`message` → 提示列。
4. 所有按鈕：button 元素、屬性 `data-action-id` 放按鈕 id、文字後 `<kbd>` 標 key、`data-tip` 放 tooltip（重用 `src/ui-adapter/dom/tooltip.ts` 的 `mountTooltip`）、`enabled:false` → `disabled` 且 tooltip 末行寫 reason。點擊送 `button.action`。DOM 只 import `../vm/types.ts` 的型別（`main.ts` 例外）。
5. 鍵盤：`keydown` 掛 document；焦點在 input／textarea／select 時不攔（Esc 除外）；`setActive(false)` 時不收。按鍵交給 `onKey`。
6. 樣式 `src/ui-adapter/ops/dom/ops.css`：全部選擇器以 `.ops-view` 起頭，不改戰鬥 CSS。
7. **階段二**：
   - `src/ui-adapter/ops/dom/battle-host.ts`：`hostBattle(root, controller /* 戰鬥 vm BattleController */, { spectate, onDone(): void }): { destroy(): void }`——仿 `src/ui-adapter/dom/main.ts` 的 `start()`（`mountBattle`、演出計時 `step`、`skip`、動畫／縮放設定讀寫 localStorage 同鍵、`resolveKey(DEFAULT_KEYMAP, k)`），**不改 `src/ui-adapter/dom/` 任何檔**；戰鬥 `UiAction` 若有 `navigate` 型別就忽略。分出勝負後畫面上出現 `button[data-ui="battle-return"]`「返回營運」（快捷鍵 Enter），按了呼叫 `onDone`。e2e 掛鉤 `window.__opsBattle = { snapshot(), settle() }`。
   - `src/ui-adapter/ops/dom/main.ts`：`mountOpsPage(container: HTMLElement): { destroy(): void }`——用 `import.meta.glob("/content/base/**/*.json", { eager: true })`＋`packsFromGlob`（`src/ui-adapter/content-browser.ts`）＋`loadWorldPacks`（`src/ops/content/load.ts`）載內容；讀 `location.search` 的 `seed`（預設 1）、`spectate=1`；建 `OpsController`；`snapshot.battle` 非 null 時 `opsView.setActive(false)`、在 container 內另開一層掛 `hostBattle`，`onDone` → `dispatch({type:"battleDone"})`、destroy 戰鬥層、恢復營運。存檔：`cmd` 為 `{v:"save"}` 且成功後把 `controller.serialize()` 寫進 localStorage `mecha-srpg.ops.save`（try/catch，失敗顯示提示）；頂列加「讀檔」鈕（DOM 自己的，`data-action-id="dom:load"`）用 `OpsController.fromSave`。e2e 掛鉤 `window.__ops = { snapshot(), dispatch(a) }`。
   - 入口：**不改** `index.html`、`src/ui-adapter/dom/main.ts`、`vite.config.ts`（別條線 `lead-wiki` 正在改殼與導航，那邊有 `#/ops` 路由與 `[data-page="ops"]` 容器；接線由領導做）。為了 e2e，你新增 `src/ui-adapter/ops/dom/standalone.ts`（`mountOpsPage(document.getElementById("app")!)`）供領導接線；e2e 先寫好，入口 URL 由領導告訴你。
   - e2e `e2e/ops-campaign.spec.ts`（Playwright headless，照現有 `playwright.config.ts`）：開新戰役（seed 3）→ 回應開場事件 → 用快捷鍵推進到下個事件數次直到有契約 → 接約 → 航行 → 出戰（`spectate=1` 或 `__opsBattle.settle()` 加速）→ 按「返回營運」→ 看到戰果報告、記錄有戰鬥結果。
   - headless 截圖（Playwright `page.screenshot`，存 `wf/workflows/dispatch/handoffs/lead-ui-ops/op-uops-dom/shots/`）：船艙、世界圖、契約、機甲、編成、戰果報告各一張，自己看過確認沒有重疊、截斷、空白大洞。

## 範圍（排除法寫死）

- 只寫：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/dom/`（新檔）、`/home/lorkhan/repo/game_dev/mecha-srpg/e2e/ops-campaign.spec.ts`（新檔，階段二）、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/op-uops-dom/`（REPORT 與截圖）。
- 不做：`src/ui-adapter/ops/vm/`（codex 工人在寫；發現 vm 的 bug 寫進 REPORT 或回覆領導，**不要改**）、`src/ui-adapter/` 其他檔、`src/ops/`、`content/`、`index.html`、`vite.config.ts`、`playwright.config.ts`、`tsconfig*.json`（typecheck 的 glob 由領導加：`tsconfig.ui.json` 會納入 `src/ui-adapter/ops/dom/**`、`tsconfig.json` 會排除它）、`package.json`、既有 e2e、`wf/` 其他檔。
- 件數 gate：新檔超過 16 個就停下回報；容量 gate：新增程式碼（含測試與 CSS）超過 2500 行就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node --test 'src/ui-adapter/ops/dom/*.test.ts'` | 每改一段後（happy-dom，寫法參考 `src/ui-adapter/dom/render.test.ts`） |
| `npm run typecheck`、`npm run test:dom`、`npm run build` | 每階段收尾 |
| `npx playwright test e2e/ops-campaign.spec.ts` | 階段二（headless） |
| `git status --short` | 收尾核只動到範圍內的檔 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑上表指令。**不 commit**（領導 commit），REPORT 列新增檔清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗（Playwright 只准 headless）；不 push、不建分支、不 rebase／reset；不 `git add`／`git commit`；不 `rm -rf`、不刪整檔；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一寫入操作；子代理上限 0 個。別線未提交的改動讓你沒碰的測試紅燈時**不要修它的檔**，在 REPORT 記紅在哪。不上網。

**分清錯誤來源**：工具或環境出錯 → 停下回報 BLOCKED；自己寫的程式出錯 → 自己修。

## 工作

1. 讀 types.ts、戰鬥 DOM（`src/ui-adapter/dom/render.ts`、`panels.ts`、`tooltip.ts`、`style.css`、`main.ts`）學風格與寫法。
2. 階段一：fixture `src/ui-adapter/ops/dom/fixtures.ts`（涵蓋每個分頁、prompt＋naming、sortie、report、disabled 按鈕）→ render.ts／各分頁模組／ops.css → happy-dom 測試 → 回覆領導「階段一完成」（5 行摘要），**停下等領導通知**。
3. 階段二：照設計第 7 點做；e2e 綠、截圖看過。
4. 寫 REPORT。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/op-uops-dom/REPORT.md`；寫不了檔就把全文放回覆。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| DOM 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/ops/dom/` |
| e2e | `/home/lorkhan/repo/game_dev/mecha-srpg/e2e/ops-campaign.spec.ts` |
| 截圖 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/op-uops-dom/shots/*.png` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ui-ops/op-uops-dom/REPORT.md` |

REPORT 四段（做了什麼／產出／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. 階段一：`node --test 'src/ui-adapter/ops/dom/*.test.ts'` exit 0，測試涵蓋：八個分頁各畫出主區、按鈕標 kbd 與 tooltip、disabled 按鈕有 reason、點按鈕送出該按鈕的 action、prompt／naming／sortie／report／help 疊層、世界圖節點點擊送 `selectNode`。
2. 階段一：`npm run typecheck` exit 0（領導加 glob 後）。
3. 階段二：`npx playwright test e2e/ops-campaign.spec.ts` 綠（headless），走完設計第 7 點的流程。
4. 階段二：`npm run test:dom`、`npm run build` exit 0。
5. 階段二：六張截圖存在，REPORT 逐張寫一句你看到的排版狀態。
6. `git status --short` 顯示你只新增了範圍內的檔。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 回覆 FAILED，REPORT 寫證據。
- **測不出來**（沒跑成、拿不到證據）→ 不回滾、保持現狀，回覆 BLOCKED 並寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`op-uops-dom`（Claude 子 agent，團隊：無；在行程內，不走 inbox）。
- 每階段結束在回覆給 5 行摘要＋REPORT 路徑；終局標 `DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一，標題要是自足的一句結論。
