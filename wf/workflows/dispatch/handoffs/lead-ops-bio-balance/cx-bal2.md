# 任務：查清 greedy 戰役為什麼輸，並用合理的數值重調平衡（第二輪）

> 領導 `lead-ops-bio-balance` 寫給 codex 工人 `cx-bal2`。**交接書是唯一契約**：沒寫的授權等於沒有。ops 共用慣例沿用 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md` 的 §2、§3。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。**第一輪的報告必讀**：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal/REPORT.md`（手段、每輪數字）。背景：`wf/workflows/dispatch/handoffs/lead-integ-battle/REPORT.md`「撤離修正後 ops greedy」段。

## 背景與唯一目標

第一輪（已併進 main 工作樹、**未 commit**）做了補彈，並用三招湊到判準：新武器 `content/base/abilities/arc-pulse.json`（命中 100、熱 60、球形半徑 4——遠超既有武器）、開局換兩台新 `frame/moji-tern-guard`、月薪砍到原本的 1/7（駕駛 140→20）。現況（main 工作樹，`node wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts`）：首戰 2/5 勝，第 3 潮月五個 seed 都 7 人，第 12 潮月 4/5 seed 0 人、每個 seed 12 潮月戰績多為 0–1 勝 4–7 敗。領導判斷：數值是湊出來的、不是調出來的——**敗因沒查清**（第一輪 R1–R8 武器加到荒謬仍全敗，換機體才贏）。唯一目標：**先查清敗因，再用合理數值調到判準**。

## 範圍（排除法寫死）

- 只做：
  - **診斷**：擴充 `wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts`：加 `--sorties` 旗標，每場出戰再印一行 JSON：seed、日、契約種類與目標 kind、我方出戰機體、戰鬥結束原因（全滅／輪數用完／撤離／目標達成——從 `BattleResult` 或事件判）、輪數、我方損失機甲數與死亡人數、敵方擊殺數；加 `--content DIR` 旗標（預設 `content/base`）以便用臨時內容副本做對照實驗（副本放 `/tmp/cx-bal2/`）。用它回答三個問題並寫進 REPORT：(1) 輸的主因是什麼（按場次歸類計數）；(2) 為什麼第一輪武器加到荒謬、獵犬仍全敗（例：hound 機體／部位／槽位、AI 不出手、彈藥、命中、撤離門檻）；(3) 為什麼 12 潮月後人會走光（欠薪？戰死？契約太少？——列每個 seed 的離隊與死亡數）。
  - **平衡**：改 `content/base/`（含 `world/`）的資料檔，包含第一輪新增的那幾個檔。**數值合理性約束（硬性）**：`arc-pulse` 的每 AP 傷害期望值不超過既有非傳統武器 `ability/heat-lance-thrust` 的 1.5 倍、`accuracy` 不高於既有武器的最大值、範圍半徑 ≤ 1（或改成單體）；開局月薪不低於原值的 1/2（駕駛 ≥ 70、技師 ≥ 90、船員 ≥ 50）；不改 `content/base/rules/`、`content/base/registries/`。可動的槓桿：開局機體與武器配置、新武器數值、契約報酬（`world/contracts/`）、蟲群預算與地圖（`world/encounters/`）、利率／泊費／租金（`world/services/crew.json` 的經濟鍵，不碰生物系鍵）、市場彈價。
  - **cash 變負**：查出是哪一筆支出讓 `cash` 低於 0（spec 寫 cash 不足時薪水走全團等比例欠薪）；若是 `src/ops/crew/wages.ts` 或 `src/ops/world/` 的支出沒走欠薪／拒付邏輯，**只准修那個支出函式**（最小改動＋1 個測試），否則只寫 REPORT。
  - **例外重現**：第一輪 REPORT 提到 B1（補彈後、平衡前）seed 4 拋「貢獻值尚未求值」。用 `--content` 指向「`content/base` 副本＋開局換回三台原獵犬＋原月薪」重跑 seed 4；能重現就把完整 stack trace 與最小重現指令寫進 REPORT（**不修** `src/rules`／`src/core`）。
  - 黃金：ops 黃金 `src/ops/sim/fixtures/campaign-hash.json` 用 `GOLDEN_UPDATE=1 node --test src/ops/sim/golden.test.ts` 更新，REPORT 寫原因。
- 不做：`src/rules/`、`src/ai/`、`src/core/`、`src/content/`、`src/sim/`、`src/ui-adapter/`、`e2e/`、`test/`；`src/ops/` 除上述 cash 修正外一律不改；生物系（`src/ops/crew/restraint.ts`、`world/beasts/`、`world/rooms/`）；spec 與 `wf/`（`balance-probe.ts` 與 REPORT 除外）。
- 件數 gate：新增＋修改檔合計超過 25 個就停下回報；容量 gate：diff 超過 120 KB 就停下回報。

## 判準

`balance-probe.ts`（seed 1–5，greedy，12 潮月）：(a) 首戰合計 **≥ 2 勝**；(b) 第 3 潮月五個 seed 人數都 **> 0**；(c) 第 12 潮月**至少 3 個 seed 人數 > 0**（做不到就停在最接近處、記數字與卡點）。同時 (d) 首戰不得 5/5 全勝。每調一輪記一行。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-bal2 --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts` | 診斷與每輪量測 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | 改到戰鬥內容後確認五行仍 `pass:true` |
| `node src/ops/content/check.ts content/base` | 改內容後 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時副本只放 `/tmp/cx-bal2/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：工作樹裡已有第一輪未 commit 的改動，commit 由領導做；你在 REPORT 列出檔案清單。
- `test/golden/`（規則黃金）不得變。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`（會毀掉未 commit 的第一輪改動）；不 `rm -rf`；刪檔只准刪 `content/base/components/siege-plate.json`（第一輪留下未用的檔）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞。

## 工作

1. 擴充 probe、跑現況診斷、回答三個問題；`inbox_poll --once`。
2. 例外重現、cash 變負查因（必要時修＋1 測試）；`inbox_poll --once`。
3. 依診斷調數值（先套合理性約束，再調到判準）；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal2/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 內容與（必要時）cash 修正 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/` |
| 量測腳本 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal2/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加三個附表：「診斷」（三個問題的答案＋場次歸類計數）、「平衡數字」（現況與每輪，seed 1–5：首戰、勝敗數、第 3／12 潮月人數與現金）、「手段（檔案：第一輪值→最終值）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. 沙箱外 `npm test` 0 fail；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. `node src/ops/content/check.ts content/base` exit 0；`npm run sim:campaign -- --months 12 --policy idle` 與 `--policy greedy` 都印 `OK`。
3. `balance-probe.ts` 輸出滿足判準 (a)(b)(d)，(c) 達成或 REPORT 記最接近數字（由領導重跑）。
4. `arc-pulse` 與開局月薪符合「數值合理性約束」。
5. `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` 五行都 `pass:true`；`test/golden/` 無改動。
6. REPORT 存在且有四段＋三個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 發 `FAILED`；判準 (c) 調不到不算失敗，發 `DONE` 並記數字。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bal2`。本線團隊：`teams/bio-balance`。上線先發 `wf/tools/inbox_mail.sh cx-bal2 --up PROGRESS 'cx-bal2 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-bal2 --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal2/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
