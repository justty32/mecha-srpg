# 任務：讓每個 AI 陣營帶意圖、達不到就撤離，規則層把「對手撤光」判成擊退勝，取代 timeout 平手

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-intent`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。使用者裁示原文：`wf/workflows/planning/design-notes/mechanics.md` 末兩段（「以『意圖受挫撤退』取代平手」與補充「所以不是說必須全殲滅」）——**先讀**。程式：`src/rules/objectives.ts`（`objectiveDone`、`evaluateObjectives`；`eliminate` 已把 retreated 視為非 active）、`src/rules/flow.ts`（`retreat`）、`src/ai/retreat.ts`（現有撤離門檻）、`src/ai/score.ts`、`src/ai/objectives.ts`、`src/ai/policies/{tactical,flee,swarm}.ts`、`src/ai/strategy.ts`、`content/base/aiprofiles/`。前一位 AI 工人報告：`wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md`、`wf/workflows/dispatch/handoffs/lead-ai-objective/REPORT.md`。

## 背景與唯一目標

現在 24 情境×5 seed 約六成打滿輪數平手。使用者裁示：怪獸與勢力都有自己的意圖，發現達不到就撤退；讓對手意圖受挫撤退就是勝利（擊退），不必全殲。**唯一目標：AI 會依意圖可達性撤離、規則層給出明確的擊退結果，24 情境×5 seed 的 timeout 平手率 < 15%，且勝負分布不一面倒。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：
  1. **規則層擊退**：`BattleOutcome` 加可選 `detail?: "eliminated" | "repelled"`（`src/core/types-state.ts` 只新增可選欄）。`eliminate` 達成時，若敗方至少一台是 `retreated` 則 `detail:"repelled"`，否則**不寫 detail**（保持舊事件 payload，黃金 hash 不變）。另加通用判定：**某 slot 的所有敵對 slot 都已沒有 active 單位、且其中至少一台是撤離的** → 該 slot 勝、`reason:"repelled"`（在既有目標檢查之後、timeout 之前；多方局照既有勝方 SPEC-GAP 規則延伸，寫進 REPORT）。地圖 `exits` 為空時，撤離的可用格怎麼定（例如四邊格）由你提案實作並寫 REPORT 的 SPEC-GAP；內容地圖若更適合直接補 `exits`，可改 `content/base/maps/`。測試 `test/rules/repel.test.ts`。
  2. **AI 意圖**：每個 AI slot 推導一個意圖（來源依序：情境目標 `for` 該 slot 的 objective → aiprofile `params.intent` → 怪獸族行為／tags：spawner＝守巢、territorial＝奪點、其餘獵食；勢力預設殲滅），寫在 `src/ai/`（新檔 `src/ai/intent.ts`）。每輪開始評估可達性（戰力比、己方損失比、目標進度、剩餘輪數 vs 需要輪數），判定達不到 → 該 slot 進入撤離模式：可移動單位往最近可撤格走並 `retreat`；**不能移動的單位（無移動力、巢穴、潮錨）不撤**，其護衛照撤。門檻全部是 aiprofile `params`（例如 `intentGiveUpRatio`、`intentGiveUpLoss`、`intentMinRound`），預設值寫在 DEFAULTS。玩家 slot（非 AI）不受影響。測試 `test/ai/intent.test.ts`（意圖推導、達不到才撤、固定單位不撤、門檻參數生效）。
  3. **情境目標**：本線授權調整 `content/base/scenarios/` 的目標寫法配合擊退（例如主目標改 eliminate＋擊退、或補 objective 使撤離有意義）；**不改 `skirmish-whitegloves`、`rift-edge-nest` 的目標語意**。每檔改了什麼列表。可調既有 aiprofile 的 params（`content/base/aiprofiles/`）。
  5. **個體意圖與指揮者**（使用者補充，見 mechanics.md 末段「個體意圖與指揮者」）。至少做：(a) **個體逃跑**：怪獸單位重傷（總層 HP 比低於族參數）就往撤離格逃並撤離；駕駛員依士氣（`breaking`／`fleeing`）與傷勢自行撤退（接既有 `retreat.ts`）；某些族發狂沿用既有 berserk／instinct 機制，不新增規則。(b) **人類指揮者後撤輪替**：每個 AI slot 依規則選定指揮者（有指令權的人物中 resolve／等級最高者，或 aiprofile 指定 tag），指揮者在場時，把受損過重、資源池（矢／燼等）不足、士氣差或帶負面效果的單位**暫時撤到後方**（遠離敵人、靠近友軍後方的格，不撤離戰場），恢復或輪到時再前壓；(c) **怪獸指揮者陣亡潰散**：怪獸陣營的指揮者＝母體（spawner）、潮錨（tag）或王級（S 以上）個體；指揮者在時只下簡單指令（集結、圍攻、護巢）；**指揮者陣亡 → 陣營意圖退化成個體本能**（依族參數一定比例潰散撤離）。人類指揮者陣亡同樣退化（士氣檢定或撤離傾向上升，你定）。參數全部進 aiprofile `params` 或 species tags／既有 `behaviors` 不新增欄（要新增欄就寫 REPORT 提案，不改 schema）。測試併入 `test/ai/intent.test.ts`（再加 ≥3 條：重傷逃跑、後撤輪替、指揮者陣亡潰散）。做不完的部分寫 REPORT 給下一條線。REPORT 另附「意圖兩層設計摘要」一段（給規劃線補 spec）。
  4. **量測**：開工與完成各跑 `{SP}/psweep.sh /home/lorkhan/repo/game_dev/mecha-srpg /tmp/cx-gb-intent/sweep-XXX.jsonl`；平手率＝winner 為 draw 或 stop 的比例。目標 < 15%；勝負分布：玩家方勝率在 35%–80% 之間（不一面倒）。另跑 `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored` 前後（營運不回寫，只看戰場）。
- 不做：`src/ops/`（營運回寫由 lead-gaps-ops 做）、`src/mcp/`、`src/content/`、`src/sim/`（只 import；`session.ts` 不改）、`src/ui-adapter/`、`schemas/`（若要加 aiprofile 欄位用 params，不改 schema）、spec；`content/` 除 scenarios／aiprofiles／maps 以外全部；黃金檔不重產——黃金若變紅，逐個寫原因交領導。
- 件數 gate：改動＋新增檔超過 55 個就停下回報；容量 gate：diff 超過 200 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-intent --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/psweep.sh` 參數：REPO目錄 輸出檔 | 24 情境×5 seed 平行 sweep（約 3–5 分鐘） |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored` | 營運 anchored 凍結戰場 |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | Wait 比例 < 0.5 回歸 |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 效能 ms／步 ≤ 開工 1.5 倍 |
| `GOLDEN_UPDATE` 不准設 | 黃金只報告 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-intent/`；臨時檔只放 `/tmp/cx-gb-intent/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；開工 sweep／bench；讀裁示與程式；`inbox_poll --once`。
2. 規則層擊退＋測試；`inbox_poll --once`。
3. AI 意圖＋撤離＋測試；`inbox_poll --once`。
4. 情境／aiprofile 調整，反覆 sweep 到達標（或確定達不到，寫原因）；`inbox_poll --once`。
5. `test/rules/`、`test/ai/`、`test/sim/`、`test/golden.test.ts` 跑一次；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-intent/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/rules/objectives.ts`（必要時 `flow.ts`）、`src/core/types-state.ts`（只加可選欄）、`src/ai/intent.ts`（新）、`src/ai/` 其他檔 |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/rules/repel.test.ts`、`test/ai/intent.test.ts` |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/{scenarios,aiprofiles,maps}/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-intent/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `test/rules/repel.test.ts` ≥3 條（eliminate 撤光＝repelled、通用擊退判勝、全死時無 detail）、`test/ai/intent.test.ts` ≥7 條（含重傷逃跑、後撤輪替、指揮者陣亡潰散），全過且能變紅（REPORT 一句說怎麼證）。
2. 完成 sweep：24 情境×5 seed timeout 平手率（REPORT 給開工／完成兩個數字與每情境勝方分布表），目標 < 15%；玩家方勝率在 35%–80%。未達標要寫卡在哪幾個情境與原因。
3. `test/golden.test.ts` 結果：不變，或逐個列出變的黃金與原因（不重產）。
4. skirmish seed 1–5 Wait 比例 < 0.5；bench ms／步 ≤ 開工 1.5 倍；`npm run typecheck` 0 錯。
5. REPORT 存在且有四段＋意圖推導表（來源→意圖→撤離條件）＋意圖兩層設計摘要（個體層／指揮者層，含做完與未做）＋情境改動表＋SPEC-GAP 提案（無出口地圖的撤離、多方擊退勝方）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-intent`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-intent --up PROGRESS 'cx-gb-intent 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-intent --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-intent/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-intent --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。
