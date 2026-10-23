# 任務：補上三個整合缺口——怪獸本能控制、規則常數與步兵／士氣／失控內容回 base、pack-hunter 指向 swarm，並重產黃金 hash

> 領導 `lead-impl-sim` 寫給 codex 工人 `cx-sim-gaps`。**交接書是唯一契約**：沒寫的授權等於沒有。本交接書包含同目錄的 `contract.md`——§0 已由領導做完，§1 是你的裁定，照做。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；然後讀契約 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/contract.md`、規則線 REPORT `wf/workflows/dispatch/handoffs/lead-impl-rules/REPORT.md`、AI 線 REPORT `wf/workflows/dispatch/handoffs/lead-impl-ai/REPORT.md`（「需要決定的事」1–3 就是本線三件事）——親自讀。

## 背景與唯一目標

規則、AI、base 內容三條線各自收線後留下三個接縫：沒有駕駛員的怪獸 `controlMode` 是 `none`、整場不動；rules 需要的 13 個常數與步兵／士氣／失控內容只在測試包 `test/scenarios/pack/`，只載入 `content/base` 跑不起戰鬥；`aiprofile/pack-hunter` 指向不存在的 policy。唯一目標：照 contract §1 補好這三個接縫，讓「只載入 `content/base`」就能讓 AI 對 AI 打一場、怪獸會出手。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：
  - `src/rules/` 中為 (a) 所需的修改（預期 `state.ts`、`control.ts`、`turn.ts`、`command.ts`、`pools.ts`、`movement.ts` 之內），與對應測試新增在既有的 `src/rules/*.test.ts`。
  - `content/base/`：`rules/constants.json` 合併 13 鍵；新增 `frames/infantry.json`、`bodyplans/infantry.json`、`effects/morale-{shaken,breaking,fleeing}.json`、`effects/berserk.json`（內容照測試包原檔）；`species/*.json` 四族各加 `ap` 池；`aiprofiles/pack-hunter.json` 的 `policy` 改 `"swarm"`。
  - `test/scenarios/pack/`：**刪除** contract §1(b) 列的 9 個檔（`rules/constants.json`、`frames/infantry.json`、`bodyplans/infantry.json`、3 個 morale、`berserk.json`、`terrains/plain.json`）；`species/pp-tidewolf.json` 加 `ap` 池。逐檔用 `rm` 加完整檔名（一次一個檔），不准 `rm -r`、不准 `git rm`。
  - `test/scenarios/*.json`：因怪獸開始行動而需要補 `end` 等指令時可改指令序列（`expect` 的關鍵事件序列不准放寬）；`test/golden/*.hash` 重產。
  - `test/ai/integration.test.ts`：只載入 `content/base`；加斷言 `wolf2` 至少下過一個 `move` 或 `useAbility`。`test/ai/` 新增一個測試（可放進既有的 `policies.test.ts`）：base 所有 aiprofile 的 policy 都在 `policyIds()`。
  - `test/README.md` 中提到「常數在測試包」的句子改正。
- 不做：`src/sim/`、`test/sim/`、`package.json`（另一條工人線 `cx-sim-engine` 同時在寫，**它的檔有問題也不要改**）；`src/core/`、`src/content/`、`schemas/`（§0 領導已改）；新 policy 檔；平衡數值調整；其餘 SPEC-GAP（reaction、removeOnZero 等）；`legacy/`、`wf/`（除了你的 REPORT 與 inbox 回報）。
- 件數 gate：新增＋修改＋刪除的檔合計超過 35 個就停下回報；容量 gate：本線 diff 超過 150 KB 就停下回報。

## 測試（寫死條數；`node:test`＋`node:assert/strict`）

新增恰好 **4** 個 `test()`：rules 3（怪獸無人時 controlMode 為 `instinct`；instinct 怪獸能 move 並用能力、扣機體 `ap`、回合開始 regen 回來；棄機後的 derelict 仍為 `none` 且 beginTurn 自動結束）＋ai 1（aiprofile policy 皆已登記）。既有測試只准因本線改動而**修改**（例如 integration 改載入、黃金重產），不准刪。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'`（沙箱內不加 `--test-isolation=none` 計數會不準；最終計數由領導在沙箱外重算）；`npm run check`；`npm run typecheck`。黃金重產：`GOLDEN_UPDATE=1 node --test --test-isolation=none test/golden.test.ts`。**重產前**先用一支你自己的臨時腳本（放 `/tmp/cx-sim-gaps/`）把 6 個情境的事件日誌存 `/tmp/cx-sim-gaps/before/`（每情境一檔，檔名＝情境 id），重產後存 `after/`，REPORT 寫每個情境 diff 的原因。注意 `cx-sim-engine` 的 `test/sim/` 測試在你改完前可能是紅的或不存在——**判斷綠燈時只看 `test/sim/` 以外**。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-sim-gaps --once` | 每完成一個缺口跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |
| `npm run check`、`npm run typecheck` | 每個缺口完成後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你只在 REPORT 列出檔案清單（含刪除的）。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-sim-gaps/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修；`test/sim/` 紅 → 不是你的事，不改。

## 工作

1. (b) 內容回 base、刪測試包重複；確認 `npm run check` 0 錯；`inbox_poll --once`。
2. (a) 本能控制＋3 個 rules 測試；`inbox_poll --once`。
3. (c) pack-hunter＋ai 測試；integration 只載入 base 並斷言 wolf2 出手。
4. 存 before 日誌（在第 1 步之前的 HEAD 狀態也可以用 `git stash` 以外的方法取得——最簡單是**第 1 步動手前先存 before**）→ 重產黃金 → 存 after → 比對。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-gaps/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 規則修改 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/` |
| base 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/` |
| 測試與黃金 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-gaps/REPORT.md` |

REPORT 四段（做了什麼／產出（改、增、刪的檔清單）／沒做到或證據不足的／需要決定的事），加「黃金 diff 原因表」與「SPEC-GAP 清單」，末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. 沙箱外 `npm test` 中 `test/sim/` 以外 0 fail，且比 164 多恰好 4 個 test；`npm run check` 0 errors；`npm run typecheck` exit 0（由領導重跑）。
2. `test/scenarios/pack/` 不再有 contract §1(b) 列的 9 個檔；`content/base/rules/constants.json` 含 19 鍵；`grep -rn "test/scenarios/pack" test/ai/` 0 命中。
3. `test/ai/integration.test.ts` 斷言 wolf2 有出手且 rejected 為 0，並通過。
4. `content/base/aiprofiles/pack-hunter.json` 的 policy 為 `swarm`；6 個黃金 hash 已重產且兩兩不同。
5. REPORT 存在且有四段＋黃金 diff 原因表＋SPEC-GAP 清單。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`，REPORT 附失敗輸出。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-sim-gaps`。本線團隊：`teams/sim`。上線先發 `wf/tools/inbox_mail.sh cx-sim-gaps --up PROGRESS 'cx-sim-gaps 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-sim-gaps --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-sim/cx-sim-gaps/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
