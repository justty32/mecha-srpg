# 任務：把戰鬥模擬加速到每步 ≤ 3 ms，且行為完全不變（全部 hash 不變）

> 領導 `lead-integ-battle` 寫給 codex 工人 `cx-ib-perf`。**交接書是唯一契約**；同目錄 [contract.md](contract.md) 屬本交接書的一部分。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/contract.md`——親自讀。

## 背景與唯一目標

ops 出戰一場要跑數分鐘（24 ms／步，skirmish 20 輪約 19 秒）。熱點已量好（contract §一.2）。唯一目標：**純效能優化、行為零改變**——同 seed 的事件日誌 hash 全部不變，同時把每步耗時壓到 ≤ 3 ms。

## 範圍（排除法寫死）

- 只做：`src/rules/*.ts`、`src/ai/**/*.ts`、`src/sim/run.ts`、`src/content/contentdb.ts`、`src/core/*.ts` 的**效能改動**，及其測試檔（只准新增測試，不改既有斷言）。可行方向（自行判斷取捨）：預覽／遮罩狀態不深拷 `log.events`（先 grep 確認規則與 AI 沒有讀歷史事件；`seq` 只要對外日誌不變即可）、`reachable` 改用正確的優先佇列並在單次呼叫內快取 locomotion／佔位、`pathTo` 與 `reachable` 共用結果（同一 state 版本內快取，狀態一變就失效）、ContentDB 查表快取 `parseId`、`unitAt` 建索引、`dangerMap`／`maskedState` 減少重算。
- 不做：任何改變行為的事（AI 選招、規則結果、事件內容與順序都不能變）；`src/ai/score.ts` 的 `want()` 函式本體與 `DEFAULTS` 常數（別的工人在改）；`src/ops/`、`content/`、`schemas/`、`src/ui-adapter/`、`e2e/`、`package.json`、`wf/`（REPORT 除外）。
- 件數 gate：改動檔超過 20 個就停下回報；容量 gate：diff 超過 80 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 第 1 步記基準、之後每次優化後量（hash 必須等於基準） |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1` | 同上，skirmish 的 hash 與耗時 |
| `node --cpu-prof --cpu-prof-dir=/tmp/cx-ib-perf/prof wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 200` | 找下一個熱點 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-ib-perf --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；工作目錄是你的 worktree（`-C`）。**不要 commit**，在 REPORT 列檔案清單。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-ib-perf/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- **分清錯誤來源**：沙箱拒寫、node 跑不了 → `BLOCKED`；沙箱內測試計數不準不算阻塞。

## 工作

1. 記基準：`bench-ops.ts 500` 的 ms／msPerStep／hash、skirmish seed 1 的耗時與 hash、`npm test` 耗時；寫進 REPORT。
2. 逐項優化，每項後重量 bench 與 skirmish hash；hash 一變就退回該項。`inbox_poll --once`。
3. `npm test`、`npm run typecheck`、`npm run check` 全綠；`git diff --stat` 確認只動範圍內檔。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-perf/REPORT.md`（主 repo 的路徑，不是 worktree 的），不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式改動 | 你的 worktree 內（`-C` 目錄）|
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-perf/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「前後數字表」（bench ms／步、skirmish 秒、npm test 秒、各 hash 前後），末尾加「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. `bench-ops.ts 500` 的 hash 與基準相同，且 msPerStep ≤ 3（做不到就附 profile 前 15 熱點說明卡在哪）。
2. skirmish seed 1 的 hash 仍是 `0613183bba2e5c5f`。
3. worktree 內 `npm test` 0 fail、`npm run typecheck` exit 0、`npm run check` 0 errors；既有測試斷言沒有被改。
4. REPORT 存在且有四段＋前後數字表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（hash 變了且找不到原因）→ 退回造成變動的那項，其他保留，REPORT 寫證據；整體無法達標發 `FAILED`。
- **測不出來**（node 跑不了、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ib-perf`。本線團隊：`teams/integ-battle`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-ib-perf --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。
