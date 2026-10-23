# 任務：實作 sim 模組（跑局、重播、存檔、CLI）與 22 個測試，含不變量與重播一致性測試

> 領導 `lead-impl-sim` 寫給 codex 工人 `cx-sim-engine`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`——§2 是你的匯出介面，名稱與簽名照抄。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/contract.md`、spec `wf/workflows/planning/specs/core/architecture.md`（決定性與重播、存檔格式、headless 測試策略 (3)(6)）、`wf/workflows/dispatch/handoffs/lead-impl-ai/REPORT.md`（「sim 的接法」）、`test/ai/integration.test.ts`、`test/golden.test.ts`、`src/rules/index.ts`、`src/ai/index.ts`、`src/core/{ids,types-def,types-state,events,eventlog,rng}.ts`——親自讀。

## 背景與唯一目標

規則層與 AI 層都已落地，但還沒有「跑一場完整戰鬥、存下來、重播驗證」的模組。唯一目標：照 contract §2 交出 `src/sim/{run,replay,save,cli}.ts`，讓 `npm run sim -- --scenario scenario/skirmish-whitegloves --seed 1` 能印出結果，並用不變量與重播一致性測試把決定性釘住。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建，一個不多）：`src/sim/run.ts`、`src/sim/replay.ts`、`src/sim/save.ts`、`src/sim/cli.ts`、`src/sim/index.ts`（re-export）、`test/sim/run.test.ts`、`test/sim/replay.test.ts`、`test/sim/save.test.ts`、`test/sim/cli.test.ts`、`test/sim/invariants.test.ts`，可另加一個測試輔助 `test/sim/helpers.ts`；修改 `package.json` 只加一行 script `"sim": "node src/sim/cli.ts"`；外加你的 REPORT。
- 不做：`src/rules/`、`src/ai/`、`content/`、`test/scenarios/`、`test/golden/`、`test/ai/`（另一條工人線 `cx-sim-gaps` 同時在改，**它們有 bug 也不要改**，寫進 REPORT）；`src/core/`、`src/content/`、`schemas/`、`tsconfig.json`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；ui-adapter；安裝任何套件；平衡數值。
- 件數 gate：新檔超過 12 個就停下回報；容量 gate：新檔合計超過 120 KB 就停下回報。

## 等別線（寫死）

`cx-sim-gaps` 正在把 rules 常數搬回 `content/base/`、讓怪獸能行動。**它交件前，只載入 `content/base` 跑戰鬥會丟「缺少常數」**。做法：先寫程式碼；開發時可暫時用 `["content/base", "test/scenarios/pack"]` 載入。**最終測試一律只載入 `content/base`**，跑最終測試前確認 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-gaps/REPORT.md` 存在；不在就每 60 秒查一次（前景 `sleep 60` 迴圈），最多等 40 分鐘；逾時發 `BLOCKED`（標題寫「等 cx-sim-gaps 逾時」），程式碼保持現狀。對方改動期間你的開發測試偶發紅燈是正常的。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

共 **22** 個 `test()`：
- `run.test.ts` 5：scenarioToSetup 把 `scenario/skirmish-whitegloves` 轉成 8 單位且部署格兩兩不同、都在 deployZones；同 seed 兩次 `runBattle` 的 commands 與 hash 相同；不同 seed hash 不同；script 玩家照序送指令、用完送 end；`rejected` 為 0（architecture (4)）。
- `replay.test.ts` 4：`replay(run.commands)` 的 hash 等於 `run.hash`（兩個 base 情境各一）；竄改一個指令 → `ReplayError` 帶正確 index；`rerunAiAndCompare` 同 seed 回 `ok:true`。
- `save.test.ts` 5：serialize→parse 來回相等；含 snapshot 時 `loadSave(verifySnapshot)` 通過（含 `Infinity` 池）；`packHash` 對內容變動敏感（用 `createContentDB` 或改一份複本證明會變）；pack hash 不符且無 snapshot → 丟 Error；不符但有 snapshot → 載入並有 warning。
- `cli.test.ts` 3：`main([...])` 回 0 並印出勝負／輪數／存活／hash 行；`--out` 寫出可 parse 的事件日誌；`--save` 後 `--load` 重播得同一 hash。
- `invariants.test.ts` 5（architecture (3)）：用固定的 N 個 seed（N ≥ 20，跑總時間 < 30 秒）生成隨機小情境（base 的 frame／species、隨機位置、2–6 單位）＋隨機合法指令（用 `previewCommand`／`checkAbility` 或試送 `tryCommand` 篩合法），每條指令後斷言：hard 池在 `[min,max]`；`broken` 層 hp 為 0；每個 contrib 的 source 存在（你定義「存在」並寫進 REPORT）；事件 seq 連續；整局 replay 一致。一個不變量一個 test。

測試裡的戰鬥輪數要壓小（例 `rounds: 3`），**整個 `test/sim/` 在沙箱外跑完 < 60 秒**。另外用 CLI 實測 `scenario/rift-edge-nest --rounds 50` 一次，把耗時與結果寫進 REPORT（不寫成測試）。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'test/sim/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數會不準；最終計數由領導在沙箱外重算）；`npm run typecheck`（只用 `test/types/node-shim.d.ts` 宣告過的 node API；缺的寫進 REPORT，不要自己補——cli 需要的 `process.argv`／`process.exit`／`fs` 若 shim 沒有，用 `globalThis` 取或寫 REPORT）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-sim-engine --once` | 每完成一個檔跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run typecheck` | 每個檔寫完後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的檔與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run sim`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-sim-engine/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫、等別線逾時 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修；別線檔案的 bug → 不改，REPORT 附重現步驟。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `run.ts`、`replay.ts`；`inbox_poll --once`。
2. `save.ts`、`cli.ts`、`index.ts`、`package.json` 的 script；`inbox_poll --once`。
3. 等別線（見上）→ 寫 5 支測試、跑綠；`npm test` 中既有測試不得因你變紅。
4. CLI 實測 rift-edge-nest 50 輪；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-engine/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/sim/{run,replay,save,cli,index}.ts` |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/sim/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-engine/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」、「rift-edge-nest 50 輪實測」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `test/sim/` 5 支測試恰好 22 個 `test()` 全過、總耗時 < 60 秒；`npm run typecheck` exit 0（由領導重跑）。
2. 匯出名與 contract §2 一致；`src/sim/` 不 import `src/ui-adapter` 或任何 DOM 型別；測試只載入 `content/base`（`grep -rn "test/scenarios/pack" test/sim/` 0 命中）。
3. `npm run sim -- --scenario scenario/skirmish-whitegloves --seed 1` exit 0 並印出 hash；同指令跑兩次 hash 相同。
4. `package.json` 只多了 `sim` 一個 script，dependencies／devDependencies 不變。
5. REPORT 存在且有四段＋SPEC-GAP 清單＋rift-edge-nest 實測。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫、等別線逾時）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-sim-engine`。本線團隊：`teams/sim`。上線先發 `wf/tools/inbox_mail.sh cx-sim-engine --up PROGRESS 'cx-sim-engine 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-sim-engine --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-engine/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`（「等別線」那 40 分鐘不算卡住）。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
