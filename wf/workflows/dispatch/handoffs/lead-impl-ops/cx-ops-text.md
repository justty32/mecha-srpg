# 任務：營運層文字介面指令層——`src/ops/text`（純邏輯，無 DOM）

> 領導 `lead-impl-ops` 寫給 codex 工人 `cx-ops-text`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`（§3 慣例、§5 交付形狀），照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md`、地基 REPORT `wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-foundation/REPORT.md`（介面摘要）、`src/ops/state/types.ts`；spec `wf/workflows/planning/specs/ops/` 的 `text-ui-contract.md`、`content-format-ops.md`、`architecture-ops.md`；世界觀樣例 `wf/workflows/planning/specs/world/opening.md`——親自讀。

## 背景與唯一目標

地基已在 main。本線與 `cx-ops-world`、`cx-ops-crew` 同時跑，三者領地互斥。唯一目標：一行文字 → `OpsCommand`（27 動詞）、`CampaignState`＋`CampaignEvent[]` → `Screen`（房間描述、log、panels、actions、prompt），全是純函式。DOM 不在本線。

## 範圍（排除法寫死）

- 只做：
  - `src/ops/text/`：`verbs.ts`（27 動詞的中文與 ASCII 別名表、每個動詞的參數文法）、`parse.ts`（`parse(line, state, world): OpsCommand | ParseError`；名字或 id、前綴模糊比對唯一才接受、否則 `ParseError` 帶候選「你是指：…」；未知動詞的錯誤列出合法動詞）、`templates.ts`（`{a.b}` 插值、`CampaignEvent` → log 行，五種 kind）、`rooms.ts`（房間描述：固定句＋狀態片語表，條件經 foundation 的 `cond.ts`）、`render.ts`（`render(state, events, world, db): Screen`；`actions` 只放當下合理的捷徑，**每個都必須是 `parse` 得回同一 `OpsCommand` 的形狀**；`Screen.prompt` 從 `s.pendingChoices` 第一筆組）、`format.ts`（`formatCommand(cmd, state, world): string`——`OpsCommand` 轉回一行可 `parse` 的文字，供恆等測試）、`index.ts`。
  - `content/base/world/` 的 `rooms/ dialogues/ events/ templates/`：補齊船上 6 房與條件房 `mycelium`、`templates/` 覆蓋 foundation `EVENT_TYPES` 的每一型（讓 check 的 template warning 歸零）、對白至少 2 人、事件至少 4 條（含一條兩段 `next` 鏈）。**只准新增或補欄**；既有檔的修改寫進 REPORT。
  - 測試：`src/ops/text/*.test.ts`。
- 不做：任何指令的**執行**（`parse` 只產 `OpsCommand`，不改 state）；`src/ops/` 的 `state/ content/ world/ contracts/ crew/ time/ sortie/ sim/`（`types.ts` 要加欄位 → 先在自己模組內定義區域型別、標 `SPEC-GAP`、寫進 REPORT）；任何 DOM、`src/ui-*`；`src/` 其他目錄、`schemas/`、`test/`、`package.json`、`content/base/` 的上列以外資料夾；`legacy/`、`wf/`（REPORT 與 inbox 除外）。
- 件數 gate：新增＋修改檔合計超過 45 個就停下回報；容量 gate：本線 diff 超過 200 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **12** 個 `test()`：parse 5（27 動詞的中文形逐一 parse 成功——一個 test 內迴圈；ASCII 別名逐一；模糊比對唯一接受；模糊比對多義回候選；未知動詞錯誤列出合法動詞）、format 1（27 動詞 `parse(formatCommand(cmd))` 深相等）、templates 2（插值；每個 `EVENT_TYPES` 都有模板）、rooms 2（狀態片語隨 state 變；條件房 `mycelium` 只在條件成立時出現在 exits）、render 2（`newCampaign` 開局的 Screen 形狀完整且可 JSON 化；`Screen.actions` 每個 `cmd` 經 `formatCommand`→`parse` 恆等）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`；`npm run typecheck`；`npm run check`；`node src/ops/content/check.ts content/base`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-text --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 改內容後（template warning 應歸零） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ops-text/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內計數不準不算阻塞；`src/ops/world`、`src/ops/contracts`、`src/ops/crew`（同時在寫）或 `src/sim`、`test/sim` 的紅燈 → 不是你的事、不改。

## 工作

1. `verbs.ts`、`parse.ts`、`format.ts` 與測試；`inbox_poll --once`。
2. `templates.ts`＋`templates/` 內容、`rooms.ts`＋`rooms/` 內容與測試；`inbox_poll --once`。
3. `render.ts` 與測試；補 `dialogues/`、`events/`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-text/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/text/` |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/` 的四個資料夾 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-text/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「匯出函式清單」（每個一行簽名）、「想加進 types.ts 的欄位」與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `src/ops/text` 0 fail 且恰好 12 個 `test()`；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `node src/ops/content/check.ts content/base` exit 0，且沒有 template 覆蓋類 warning。
3. `grep -rln "document\.\|window\.\|src/rules\|src/ai" src/ops/text` 0 命中；`src/ops/state/`、`src/ops/content/` 無本線改動。
4. `parse`、`render`、`formatCommand` 從 `src/ops/text/index.ts` 匯出。
5. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-text`。本線團隊：`teams/ops`。上線先發 `wf/tools/inbox_mail.sh cx-ops-text --up PROGRESS 'cx-ops-text 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-text --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-text/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
