# 任務：實作 AI 的知識、危險圖、估值三檔與規則替身（stub），附 22 個測試

> 領導 `lead-impl-ai` 寫給 codex 工人 `cx-ai-knowledge-score`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含 `contract.md`（同目錄）——它的 §0、§2、§3、§4、§5 是你的匯出介面，名稱與簽名照抄。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/contract.md`、凍結檔 `src/ai/rules-query.ts`、`src/ai/policy.ts`、`src/core/{ids,types-def,types-state,events,rng,numexpr,eventlog}.ts`（**都不可修改**）、spec `wf/workflows/planning/specs/core/ai.md`——親自讀。

## 背景與唯一目標

AI 層（`src/ai/`）只依賴 core 與 `RulesQuery` 介面；規則層正由別的團隊並行實作，所以 AI 先用替身測。另一條工人線 `cx-ai-policies` 同時在寫 strategy／agent／policies，**它會 import 你的三檔與 stub**，所以匯出名稱與簽名必須與 contract 完全一致。唯一目標：交出 `knowledge.ts`、`danger.ts`、`score.ts` 與 `test/ai/stub-rules.ts`。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建這 9 個檔，一個不多）：`src/ai/knowledge.ts`、`src/ai/danger.ts`、`src/ai/score.ts`、`test/ai/stub-rules.ts`、`test/ai/fixtures/abilities.json`、`test/ai/stub-rules.test.ts`、`test/ai/knowledge.test.ts`、`test/ai/danger.test.ts`、`test/ai/score.test.ts`；外加你的 REPORT。
- 不做：`src/ai/` 的其他檔（strategy／agent／index／policies／adapters 屬別線或領導）；改 `src/core/`、`src/rules/`、`src/content/`、`content/`、`package.json`、`tsconfig.json`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；import `src/rules/` 或 `src/content/`；安裝任何套件；新增 contract 以外的匯出（stub 檔除外，可多匯出測試 helper）。
- 件數 gate：新檔超過 10 個就停下回報；容量 gate：9 個檔合計超過 120 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

共 **22** 個 `test()`：`stub-rules.test.ts` 4、`knowledge.test.ts` 6、`danger.test.ts` 4、`score.test.ts` 8。必須涵蓋：stub 的 reachable 被牆與單位擋、命中後層由外往內扣與死亡、previewCommand 不改原狀態、retreat 只在 exit 合法；knowledge 的視野內可見／視野外不可見（**遮蔽**）、lastSeen 過 ttl 移除、publicLayers 內層 hp 為 null、scan 能力經 `observe` **揭露**內層實值、maskedState 刪掉不可見敵人且把未偵察內層估成滿 HP、輸入不被改；danger 的射程＋移動範圍、ZoC 加成、lastSeen 常數、無攻擊能力者不貢獻；score 的 targetValue 表格（grade × threat × hp × focus，表格驅動）、want 表格（低血量 survive 上升、兵力劣勢 retreat 非 0）、previewOutcome 只在命中次平均、attackArea 友傷扣分、scoreCandidate 對高價值目標給高分、不同 seed 下 previewOutcome 決定性相同。

**constraints id**：`DC-C09`、`DC-T08` 各至少出現在一個 knowledge 測試名稱或註解裡。

跑法：專案根 `node --test --test-isolation=none --test-reporter=tap 'test/ai/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數會不準；最終計數由領導在沙箱外重算）；型別檢查 `npm run typecheck`（只用 `test/types/node-shim.d.ts` 宣告過的 node API；缺的寫進 REPORT，不要自己補）。注意 `cx-ai-policies` 的測試檔也在 `test/ai/`，它們可能因為你的檔還沒寫完而紅——那不歸你管，只看你的 4 支。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一個檔對跑一次 `wf/tools/inbox_poll.sh cx-ai-knowledge-score --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 9 個檔與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-ai-knowledge-score-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內 `node --test` 計數不準**不算阻塞**；你自己的程式或測試錯 → 自己修。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `test/ai/stub-rules.ts`＋`fixtures/abilities.json`（至少五個能力：近戰 `claw`、遠程 `rifle`（los）、偵察 `scan`（tags 含 `scan`、tactics `scout`、無 packets）、範圍 `mortar`（ball、radius 1、tactics `attackArea`）、友方 `repair`（friendly only、tactics `heal`）；全部 id 用 `"stub:ability/claw"` 這種形式，成本 `pool:"ap"`）＋測試，跑綠；`inbox_poll --once`。
2. `knowledge.ts`、`danger.ts`＋測試，跑綠；`inbox_poll --once`。
3. `score.ts`＋測試，跑綠；`npm test` 中既有測試不得因你變紅。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-knowledge-score/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/{knowledge,danger,score}.ts` |
| 替身與測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/` 下 6 個檔 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-knowledge-score/REPORT.md` |

REPORT 四段（做了什麼／產出（9 個檔的清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 沙箱外 4 支測試檔恰好 22 個 `test()` 全過，`npm run typecheck` 輸出中本線 9 個檔 0 錯誤（由領導重跑）。
2. 三個實作檔與 stub 的匯出名與 contract §2–§5 一致（實作檔不多不少）。
3. `src/ai/{knowledge,danger,score}.ts` 不含 `../rules`、`../content` 的 import；`DC-C09`、`DC-T08` grep 得到於 `test/ai/knowledge.test.ts`。
4. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ai-knowledge-score`。本線團隊：`teams/ai`。上線先發 `wf/tools/inbox_mail.sh cx-ai-knowledge-score --up PROGRESS 'cx-ai-knowledge-score 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ai-knowledge-score --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-knowledge-score/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
