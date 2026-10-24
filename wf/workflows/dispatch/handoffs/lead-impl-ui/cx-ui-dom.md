# 任務：實作 ui-adapter 的 DOM 層 src/ui-adapter/dom/（戰場方格、面板、指令按鈕＋快捷鍵標示、tooltip、戰鬥記錄、說明面板、CSS）與 14 個 happy-dom 測試

> 領導 `lead-impl-ui` 寫給 codex 工人 `cx-ui-dom`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（§0 呈現方針、§2 依賴規則）。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/contract.md`、`src/ui-adapter/vm/types.ts`（你唯一的輸入輸出型別）、`src/ui-adapter/vm/keymap.json`、spec `wf/workflows/planning/specs/core/architecture.md`（ui-adapter 的介面契約、headless 測試策略 (5)）、`tsconfig.ui.json`、`node_modules/happy-dom/README.md`——親自讀。

## 背景與唯一目標

網頁戰鬥畫面還沒有。邏輯層 `src/ui-adapter/vm/` 由另一條線 `cx-ui-vm` 同時寫，它產 `UiSnapshot`；你**只看 types.ts**，不 import vm 的任何實作。唯一目標：交出 `mountBattle`，把任意 `UiSnapshot` 畫成一般網頁遊戲畫面，並把點擊／滑鼠滾輪／按鍵轉成 `UiAction`／`KeyInput` 回呼出去。

## 介面（寫死，照抄）

```ts
// src/ui-adapter/dom/render.ts
import type { UiSnapshot, UiAction, KeyInput } from "../vm/types.ts";
export type MountOptions = {
  onAction(a: UiAction): void;
  onKey(k: KeyInput): boolean;     // true＝已處理 → 你要 preventDefault
  cellSize?: number;               // 每格 px，預設 32
};
export type BattleView = { render(s: UiSnapshot): void; destroy(): void };
export function mountBattle(root: HTMLElement, opts: MountOptions): BattleView;
```

- 只用 `root.ownerDocument`／`root.ownerDocument.defaultView`，**不碰全域 `document`／`window`**（測試用 happy-dom 的 `new Window()` 建文件，不註冊全域）。
- 鍵盤：在 `root.ownerDocument` 掛 keydown；焦點在 input／textarea 時不攔；組 `KeyInput`（`key` 照 `KeyboardEvent.key`，帶 ctrl/alt/shift）呼叫 `onKey`。
- 可視格數：mount 時與 ResizeObserver（有才用）依戰場容器大小算 `w=floor(寬/cellSize)`、`h=floor(高/cellSize)`，夾在 [8, 60]，變了就 `onAction({type:"resize",w,h})`；量不到（happy-dom 寬高 0）就不送。
- 滑鼠：點格 → `clickCell`；移入格 → `hoverCell`；戰場上滾輪 → `scroll`（每 notch 3 格，Shift 滾輪＝水平）；按鈕 → 該 `CommandOption.action`。
- 渲染：戰場格是 `viewport.w × viewport.h` 個 div（CSS grid），**重用節點**：同 viewport 尺寸時只改 `dirty` 列的格（`"all"` 全改）；尺寸變了才重建。格背景用 `terrain.color`、角落小字 `terrain.glyph`；單位用色塊徽章顯示 `label`，`side` 決定顏色（self 藍、ally 綠、enemy 紅、neutral 灰），`hpRatio` 畫一條細血條，`active` 加外框動畫；`highlight`／`cursor`／`selected` 用 class。格的 `title` 寫地形名＋單位名。

## 畫面佈局與 DOM 錨點（寫死，e2e 與測試靠它）

| 區塊 | 錨點 | 內容 |
|---|---|---|
| 頂列 | `[data-ui="topbar"]` | 情境名、`[data-ui="round"]`（「第 N 輪」＋上限）、輪到誰、`[data-ui="viewport-pos"]`（「x,y」可視區左上） |
| 戰場 | `[data-ui="board"]`，格 `[data-x][data-y]`（地圖絕對座標） | 方格；四邊各一顆捲動鈕 `[data-ui="scroll-up|down|left|right"]`（送 `scroll` 10 格） |
| 指令列 | `[data-ui="commands"]`，按鈕 `button[data-cmd]`（值＝`CommandOption.id`） | 依 group 分段（移動／能力／回合／系統）；按鈕上 `<kbd>` 顯示 `key`；`disabled` 對應 `enabled`；`title` 與自繪 tooltip 都放 `tooltip`（含 reason）；`active` 加 class |
| 單位面板 | `[data-ui="unit"]` | `selected`：名稱、機體、駕駛員（座位、士氣）、部位×層 hp 條（hp null 顯示「？」）、資源池條、效果 badge（stacks／剩餘） |
| 查看卡 | `[data-ui="inspect"]` | `inspect`：座標、地形名與說明、該格單位摘要 |
| 戰鬥記錄 | `[data-ui="log"]`，每行 `li[data-kind]` | `log` 全部，新的在下、自動捲到底；kind 決定顏色 |
| 提示 | `[data-ui="message"]` | `message`（null 時隱藏） |
| 結算 | `[data-ui="outcome"]` | `outcome` 非 null 時顯示 `outcome.text` 的面板 |
| 說明 | `[data-ui="help"]` | `showHelp` 時顯示 `keyHints` 表（label＋`<kbd>` 鍵）；頂列另有 `button[data-ui="help-toggle"]` 送 `toggleHelp`，上面標 `?` |

自繪 tooltip：滑鼠移入有 `data-tip` 的元素時在旁邊顯示一個 `[data-ui="tooltip"]` 浮層（純 CSS＋少量 JS 即可），內容同 `title`；鍵盤焦點也觸發。CSS 放 `src/ui-adapter/dom/style.css`（由 main.ts import；用 CSS 變數、深色背景、等寬數字），不引外部字型與圖片。

## 範圍（排除法寫死）

- 只做（新建）：`src/ui-adapter/dom/render.ts`、可再拆最多 4 個模組（例 `board.ts`、`panels.ts`、`tooltip.ts`、`keys.ts`）、`style.css`、測試假資料 `fixtures.ts`、測試 `render.test.ts`、`input.test.ts`；外加你的 REPORT。
- 不做：`src/ui-adapter/dom/main.ts` 與 `index.html`（領導接線）、`src/ui-adapter/vm/`（別線；types.ts 不夠用 → 寫 REPORT，不改）、`e2e/`、`vite.config.ts`、`playwright.config.ts`、各 tsconfig、`package.json`、`src/` 其他目錄、`content/`、`test/`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）。不 import rules／ai／sim／content／vm 實作（只准 `import type` 自 `../vm/types.ts`）。
- 件數 gate：新檔超過 10 個就停下回報；容量 gate：新檔合計超過 80 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`＋`happy-dom` 的 `Window`）

共 **14** 個 `test()`，snapshot 由 `fixtures.ts` 手造（含一份 160×160 地圖、viewport 30×20 的）：
- `render.test.ts` 9：格數＝w×h 且 `data-x/data-y` 是絕對座標；地形色與單位徽章 label／side class；`dirty` 只改列出的格（其他格節點同一個物件）；viewport 移動後格座標更新；指令按鈕有 `data-cmd`、`<kbd>` 鍵、disabled 與 tooltip 含 reason；單位面板 hp null 顯示「？」；log 行數與 kind；outcome 面板顯示；`showHelp` 顯示 keyHints 表。
- `input.test.ts` 5：點格送 `clickCell`（座標正確）；點按鈕送該 action；按 `e` 呼叫 `onKey` 且回 true 時 `defaultPrevented`；input 有焦點時不攔鍵；滾輪送 `scroll`。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ui-adapter/dom/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數不準；最終計數由領導在沙箱外重算）；`npm run typecheck`（dom 走 `tsconfig.ui.json`，有 DOM lib＋@types/node）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ui-dom --once` | 每完成一個檔跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run typecheck` | 每個檔寫完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run typecheck`、`npx vite build`（輸出到 `/tmp/cx-ui-dom/dist`，用 `--outDir`）。**不要 commit**；不開瀏覽器、不跑 Playwright、不起 dev server。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ui-dom/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、happy-dom 載不起、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `fixtures.ts`、戰場格渲染＋相關 render 測試；`inbox_poll --once`。
2. 指令列、面板、log、outcome、help、tooltip＋其餘 render 測試；`inbox_poll --once`。
3. 輸入（點、滾輪、鍵、resize）＋`input.test.ts`；`style.css`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-dom/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、CSS、測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ui-adapter/dom/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-dom/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `src/ui-adapter/dom/` 2 支測試恰好 14 個 `test()` 全過；`npm run typecheck` exit 0（由領導重跑）。
2. 非測試檔的 import 只有 `import type … from "../vm/types.ts"` 與同目錄模組（`grep -n "^import" src/ui-adapter/dom/*.ts` 由領導看）；非測試檔不出現全域 `document`／`window`（`grep -nE "(^|[^.A-Za-z])(document|window)\." src/ui-adapter/dom/*.ts` 只命中測試檔）。
3. 上表每個 `data-ui` 錨點與 `data-cmd`／`data-x`／`data-y` 都在程式裡出現。
4. 範圍外檔案沒被改（`git status --short` 只見範圍內新檔）。
5. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（happy-dom 起不來、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ui-dom`。本線團隊：`teams/ui`。上線先發 `wf/tools/inbox_mail.sh cx-ui-dom --up PROGRESS 'cx-ui-dom 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ui-dom --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ui/cx-ui-dom/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
