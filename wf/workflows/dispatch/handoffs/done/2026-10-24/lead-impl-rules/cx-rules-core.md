# 任務：實作 rules 核心五檔（狀態存取、貢獻值、資源池、效果、鉤子／信號／指令登記）與 26 個測試

> 領導 `lead-impl-rules` 寫給 codex 工人 `cx-rules-core`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含 `contract.md`（同目錄）——它的 §0、§2、§3、§4 是你的匯出介面，名稱與簽名照抄。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/contract.md`、凍結檔 `src/core/{ids,types-def,types-state,events,rng,numexpr,eventlog}.ts` 與 `src/content/{contentdb,registry,loader}.ts`（**都不可修改**）、spec `wf/workflows/planning/specs/core/rules-resources-effects.md`、`data-model-mech.md`、`data-model-abilities-effects.md`——親自讀。

## 背景與唯一目標

地基（core 型別、RNG、NumExpr、事件日誌、content 載入）已完成，`npm test` 39 過，node 24 原生跑 `.ts`，typescript 是唯一 devDependency（只做型別檢查）。**前一任工人在工作樹留下半成品** `src/rules/{state,contribs,pools}.ts` 與 `src/rules/state.test.ts`（中止時未驗收、未 commit）：可沿用或整檔重寫，由你判斷；它們算在下面 10 個檔內。唯一目標：交出 `src/rules/` 的**規則核心五檔**，讓之後兩條平行線（combat、people-flow）只依賴你的匯出就能寫。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建這 10 個檔，一個不多）：`src/rules/state.ts`、`contribs.ts`、`pools.ts`、`effects.ts`、`hooks.ts`，與同名 `.test.ts` 五支；外加你的 REPORT。
- 不做：combat／people-flow 的 12 個檔與 `index.ts`；改 `src/core/`、`src/content/`、`content/`、`schemas/`、`package.json`、`tsconfig.json`、`test/`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；安裝任何套件；新增 contract 以外的匯出。
- 件數 gate：新檔超過 11 個就停下回報；容量 gate：10 個程式檔合計超過 120 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

共 **26** 個 `test()`：`state.test.ts` 5、`contribs.test.ts` 5、`pools.test.ts` 6、`effects.test.ts` 6、`hooks.test.ts` 4。必須涵蓋：makeUnit 用 `frame/hound-mk2`＋`component/autocannon-30` 組出池合併與部件層（`layerDefs` 末層 type component）、怪獸 `species/tidewolf` grade C 的 `frameView`；statValue 的 set→add→mul→min/max 順序（表格驅動）與按 id 撤回；regenTick ①–⑤（含 soft 池超載留存、hard 夾限、decayCurve）、canPay 的 inverted＋allowOverload、帶切換掛撤 `effect/overheat-1`→`overheat-2`、onDepleted；五種疊加政策（表格驅動）、ownerTurns 遞減撤除、whileSource 依來源撤除、immuneTags；鉤子排序（order→id）、鉤子中新增效果進 pending 不補跑、未登記動詞寫 HookSkipped、signal 依 order 呼叫。

**constraints id**：下列 7 個 id 每個至少出現在一個你的測試名稱或註解裡：`DC-C01`、`DC-T02`、`DC-T03`、`DC-T04`、`DC-T05`、`DC-T09`、`DN-M-08`。

跑法（沙箱內計數會不準，見下）：專案根 `node --test --test-isolation=none --test-reporter=tap 'src/rules/*.test.ts'`；型別檢查用 `npm run typecheck`（`tsc --noEmit`；typescript 已由領導裝為唯一 devDependency，node 內建模組型別由 `test/types/node-shim.d.ts` 提供，只用其中宣告的 API，缺的寫進 REPORT 不要自己補）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一個檔對跑一次 `wf/tools/inbox_poll.sh cx-rules-core --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 10 個檔與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：沙箱的 `.git` 可能唯讀，commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-rules-core-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內 `node --test` 子測試計數不準**不算阻塞**（領導會在沙箱外重算）；你自己的程式或測試錯 → 自己修。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `state.ts`＋測試，跑綠；`inbox_poll --once`。
2. `contribs.ts`、`pools.ts`＋測試，跑綠；`inbox_poll --once`。
3. `effects.ts`、`hooks.ts`＋測試，跑綠（`npm test` 全綠：既有 38 個不得變紅）。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-core/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/{state,contribs,pools,effects,hooks}.ts` 與同名 `.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-core/REPORT.md` |

REPORT 四段（做了什麼／產出（10 個檔的清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 沙箱外 `npm test` exit 0、`# fail 0`，本線 5 支測試檔恰好 26 個 `test()`，`npm run typecheck` 輸出中本線 10 個檔 0 錯誤（由領導重跑）。
2. 五個實作檔的匯出名與 contract §2、§3 完全一致（不多不少）。
3. 7 個 constraints id 都 grep 得到於 `src/rules/*.test.ts`。
4. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rules-core`。本線團隊：`teams/rules`。上線先發 `wf/tools/inbox_mail.sh cx-rules-core --up PROGRESS 'cx-rules-core 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-rules-core --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-rules/cx-rules-core/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
