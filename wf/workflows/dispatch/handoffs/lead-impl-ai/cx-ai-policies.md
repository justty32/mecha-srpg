# 任務：實作 AI 的陣營策略、單位代理、六個可插拔 policy 與入口，附 18 個測試含 AI 對 AI 煙霧測試

> 領導 `lead-impl-ai` 寫給 codex 工人 `cx-ai-policies`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含 `contract.md`（同目錄）——它的 §0、§6、§7、§8、§9 是你的匯出介面，名稱與簽名照抄；§2–§5 是你要呼叫的別線匯出。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/contract.md`、凍結檔 `src/ai/rules-query.ts`、`src/ai/policy.ts`、`src/core/{ids,types-def,types-state,events,rng}.ts`（**都不可修改**）、spec `wf/workflows/planning/specs/core/ai.md`——親自讀。

## 背景與唯一目標

AI 層（`src/ai/`）只依賴 core 與 `RulesQuery` 介面，先用替身測。另一條工人線 `cx-ai-knowledge-score` **同時**在寫 `src/ai/{knowledge,danger,score}.ts` 與替身 `test/ai/stub-rules.ts`——你照 contract §2–§5 的簽名 import 它們。唯一目標：交出 strategy／agent／index 與六個 policy，讓 sim 能用 `createFactionAI`＋`runUnitTurn` 跑 AI 對 AI。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做（新建這 13 個檔，一個不多）：`src/ai/strategy.ts`、`src/ai/agent.ts`、`src/ai/index.ts`、`src/ai/policies/{tactical,berserk,swarm,sentinel,flee,scripted}.ts`、`test/ai/policies.test.ts`、`test/ai/agent.test.ts`、`test/ai/strategy.test.ts`、`test/ai/smoke.test.ts`；外加你的 REPORT。
- 不做：`src/ai/{knowledge,danger,score}.ts`、`test/ai/stub-rules.ts`、`test/ai/fixtures/`（別線；**它們有 bug 也不要改**，寫進 REPORT）；`src/ai/adapters/`（領導）；改 `src/core/`、`src/rules/`、`src/content/`、`content/`、`package.json`、`tsconfig.json`、`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）；import `src/rules/` 或 `src/content/`；安裝任何套件；telegraph／意圖宣告（`precommit` 不實作）。
- 件數 gate：新檔超過 14 個就停下回報；容量 gate：13 個檔合計超過 120 KB 就停下回報。

## 等別線（寫死）

先照契約寫好你的程式碼。**跑你的測試前**，確認這三個檔都存在：`src/ai/score.ts`、`test/ai/stub-rules.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-knowledge-score/REPORT.md`；不在就每 60 秒查一次（前景 `sleep 60` 迴圈），最多等 30 分鐘；逾時發 `BLOCKED`（標題寫「等 cx-ai-knowledge-score 逾時」），程式碼保持現狀。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

共 **18** 個 `test()`：`policies.test.ts` 8（tactical 2：射程內優先攻擊、射程外會移動接近；berserk 1：只剩友方時攻擊友方；swarm 1：離母體太遠時朝母體移動；sentinel 1：不離開守點去追；flee 2：在 exit 上選 retreat、不在 exit 上遠離敵人；scripted 1：依序執行腳本步驟、用完 end）、`agent.test.ts` 4（policyFor 的 berserk 與 fleeing 接管、被拒候選剔除重選、回傳只含成功指令且以 end 結尾、maxActions 上限）、`strategy.test.ts` 3（stance 隨兵力比、接敵登記上限、focus 選擇）、`smoke.test.ts` 3（stub 規則下兩陣營各 3 單位 AI 對 AI 跑 10 輪不拋錯；同 seed 跑兩次指令序列 `JSON.stringify` 相同；混用六種 policy 跑 10 輪不拋錯）。用 contract §5 的 stub 與 fixtures 能力（`stub:ability/claw` 等）。

**constraints id**：`DN-M-02`、`DN-M-12`、`PW-07` 各至少出現在一個你的測試名稱或註解裡（DN-M-02：地圖尺寸是資料、單位數不限；DN-M-12：AI 只經 RulesQuery 解耦；PW-07：意圖宣告本版不做、precommit 不被呼叫）。

跑法：專案根 `node --test --test-isolation=none --test-reporter=tap 'test/ai/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數會不準；最終計數由領導在沙箱外重算）；型別檢查 `npm run typecheck`（只用 `test/types/node-shim.d.ts` 宣告過的 node API；缺的寫進 REPORT，不要自己補）。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh` | 每完成一個檔對跑一次 `wf/tools/inbox_poll.sh cx-ai-policies --once` 讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的 13 個檔與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存搬 `/tmp/cx-ai-policies-trash/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫、等別線逾時 → 發 `BLOCKED`；沙箱內 `node --test` 計數不準**不算阻塞**；你自己的程式或測試錯 → 自己修；別線檔案的 bug → 不改，REPORT 附重現步驟。契約有洞 → 註解 `SPEC-GAP`＋最小解＋REPORT，不要停。

## 工作

1. `policies/tactical.ts`、`strategy.ts`、`agent.ts`；`inbox_poll --once`。
2. 其餘五個 policy 與 `index.ts`；`inbox_poll --once`。
3. 等別線（見上）→ 寫 4 支測試、跑綠；`npm test` 中既有測試不得因你變紅。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-policies/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/{strategy,agent,index}.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/policies/` 六檔 |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/{policies,agent,strategy,smoke}.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-policies/REPORT.md` |

REPORT 四段（做了什麼／產出（13 個檔的清單）／沒做到或證據不足的／需要決定的事），加「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. 沙箱外 4 支測試檔恰好 18 個 `test()` 全過，`npm run typecheck` 輸出中本線 13 個檔 0 錯誤（由領導重跑）。
2. 匯出名與 contract §6–§9 一致；六個 policy 的 id 都經 `registerPolicy` 登記（`policyIds()` 含六個）。
3. 本線 9 個程式檔不含 `../rules`、`../content`（policies 內為 `../../rules`、`../../content`）的 import；`DN-M-02`、`DN-M-12`、`PW-07` grep 得到於 `test/ai/*.test.ts`。
4. REPORT 存在且有四段＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫、等別線逾時）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ai-policies`。本線團隊：`teams/ai`。上線先發 `wf/tools/inbox_mail.sh cx-ai-policies --up PROGRESS 'cx-ai-policies 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ai-policies --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ai/cx-ai-policies/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`（「等別線」那 30 分鐘不算卡住）。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
