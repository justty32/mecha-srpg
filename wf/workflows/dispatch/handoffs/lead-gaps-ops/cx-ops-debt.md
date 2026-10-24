# 任務：債務機制（每潮月最低償還、欠繳階梯、提前還本、還清開信貸），並修招募重複具名人物與士氣套到同源複本

> 領導 `lead-gaps-ops` 寫給 codex 工人 `cx-ops-debt`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。背景：`wf/workflows/dispatch/handoffs/plan-spec-integrate/REPORT.md`（「三提案」(b) 債務，頂層已採用）、`wf/workflows/dispatch/handoffs/lead-content-world/REPORT.md`（「需要決定」第 4 條）。spec：`wf/workflows/planning/specs/ops/data-model-economy-research.md`（「債 Debt 與塞勒涅催收」、帳本規則）、`time-and-tick.md`（第 6 段帳本、結束條件）、`data-model-factions-contracts.md`（白手套只由催收鏈觸發）。程式：`src/ops/crew/{wages,shared,recruit,roster}.ts`、`src/ops/state/{ledger,types,events}.ts`、`src/ops/time/{tick,commands}.ts`、`src/ops/world/market.ts`、`src/ops/content/opseffect.ts`（`mood` 分支）、`src/ops/sim/{campaign,policies}.ts`（只讀）、`content/base/world/services/crew.json`（`interestRate`、`dockFee`）、`content/base/world/campaign-start/default.json`（開局 `debt`）。

## 背景與唯一目標

現在的債只有「大潮第 1 天 `debt += debt×interestRate`」與 `pay debt X`：不付也沒有任何後果，債只會滾。頂層已採用提案 (b)。另外招募池會抽出已在名冊上的具名人物，`mood` 效果以 person def 為 key 時會套到同 def 的每個複本。**唯一目標：債成為有規則、有出口、有後果的壓力源（照下面的階梯），並通過 greedy 判準；順手修掉招募重複與士氣外溢。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **常數**放 `content/base/world/services/crew.json`（不寫死在程式）：`amortMonths: 24`、`arrearsRepPenalty: 10`、`seizeCreditRatio: 0.6`、`sanctionFeeMult: 2`、`creditLimit`（量級＝開局債的 1/4）、`creditRate`（同 `interestRate`）。
2. **狀態**：`CampaignState` 加可選欄 `debtState?: { arrears: number; due: number; paid: number; seized: Id[]; credit?: { limit: number } }`（`src/ops/state/types.ts` 只用 patch 追加可選欄，別條線也在同檔追加，不重排、不整檔改寫；新事件型別追加到 `src/ops/state/events.ts` 的清單尾端）。舊存檔沒有 `debtState` 要能照常跑（第一次用時才建）。
3. **每潮月結算**（掛在現有付息那段，`wages.ts`）：先結上一期——`paid < due` → `arrears += 1`、塞勒涅（`factions-ops/selene-whitegloves`）rep −`arrearsRepPenalty`、發 `DebtArrears{arrears, due, paid}`；否則 `arrears = 0`。再付息、開新一期：`due = max(本期利息, 付息前本金 / amortMonths)`、`paid = 0`；現金 ≥ `due` 時**自動扣繳**（`post` 兩筆，`reason:"debt-installment"`），不足則不扣、等玩家當期補繳。
4. **手動 `pay debt X`**：先算入本期 `paid`；本期繳足時若 `arrears > 0` → `arrears −1`、發 `DebtCured`；超過 `due` 的部分就是**提前還本**（自然降低下期 `本金/amortMonths`）。所有幣變動只經 `post`（帳本守恆）。
5. **欠繳階梯**（依 `arrears` 到達的級數，各級只觸發一次、`arrears` 回落後可再觸發）：
   - **1**：事件「確認償還意願」（新 `content/base/world/events/debt-*.json`，兩三個選項，第一個選項無 `requires`、不賺不賠；可有「立刻補繳」選項）。
   - **2**：白手套追擊——大地圖行動者未落地，用**事件＋扣押**近似：發事件並扣押一台機甲（不在出戰中、市值最高者；從 `inventory`／`s.mechs` 移除、座位上的人退回船艙），以市值 × `seizeCreditRatio` 抵債（`post`，`reason:"debt-seizure"`），發 `MechSeized`，id 記進 `seized`。沒有可扣的機甲就跳過扣押、只發事件。
   - **3**：制裁——塞勒涅市場（`markets/` 中所在節點屬塞勒涅 `territory` 的市場）拒絕賣給玩家（`trade` 的 buy 回錯誤碼 `selene-embargo`，sell 照常），全部港費（`wages.ts` 的 `dockFee`）× `sanctionFeeMult`；`arrears` 回到 < 3 自動解除。
   - **4 以上**：終局鏈——發最後通牒事件；下一期仍未繳足 → 發 `CampaignEnd{reason:"ship-seized"}`，讓 `runCampaign` 停下（照現有「名冊駕駛為零」的終局處理方式；先讀 `src/ops/sim/campaign.ts` 怎麼停，**不改 `sim/`**——若停不下來要改 `sim/` 就記 REPORT 交領導）。
6. **還清開信貸**：`debt` 歸零時發 `DebtCleared`、開 `credit = { limit: creditLimit }`；新指令 `{ v: "borrow"; amount: number }`（`OpsCommand` 追加、`time/commands.ts` 分派）：`amount ≤ limit − 目前債`，`post` 現金＋債，之後照同一套分期規則。文字動詞（「借」）**不要加**——`src/ops/text/` 是 `cx-ops-board` 的領地，領導收線時補；REPORT 記一句。
7. **文案**：新事件型別（`DebtArrears`、`DebtCured`、`MechSeized`、`DebtCleared`、`SeleneEmbargo` 等）的文字放**新檔** `content/base/world/templates/debt.json`（`templates/` 會載入整個資料夾；**不要改** `templates/default.json`，那是 `cx-ops-board` 的）。
8. **招募重複具名人物**：`recruitsDaily7` 抽候選時排除「person def 已在名冊上、或已在同批／他池候選中」的背景；池抽空了就少給幾個候選，不拋錯。**士氣同源複本**：`opseffect.ts` 的 `mood` 分支，key 是 person def 時只套到**該 def 最早的那一個實例**（id 排序最小者），key 是人物實例 id 時照舊；`all` 照舊。`opseffect.ts` 同檔有 `cx-ops-enc` 在改貢獻值那段——**只改 `mood` 分支與你新增的效果詞彙**，只用 patch。
9. **判準（頂層定的門檻，照跑）**：`amortMonths = 24` 下跑 greedy 12 潮月 × seed 1–5，記每個 seed 的最大 `arrears` 與是否存活（未 `CampaignEnd` 且名冊駕駛 > 0）；**「`arrears` 最大值 ≤ 1 且存活」的 seed ≥ 4** 就維持 24；否則把 `amortMonths` 改 36 再跑一次，兩組數字都進 REPORT。另跑 idle 12 潮月 seed 1，記它走到階梯第幾級、第幾天（idle 只等、應會一路欠到終局或接近終局——這是預期）。統計可寫 `/tmp/cx-ops-debt/` 下的小腳本呼叫 `runCampaign`（`sim/cli.ts` 是 `cx-war-sim` 的，不改）。

## 範圍（排除法寫死）

- 只做：`src/ops/crew/{wages,shared,recruit}.ts`、`src/ops/crew/debt.ts`（新，可選；邏輯多就拆出來）、`src/ops/world/market.ts`（只制裁拒售）、`src/ops/time/commands.ts`（只 `borrow`）、`src/ops/time/tick.ts`（只在必要時掛鉤）、`src/ops/content/opseffect.ts`（只 `mood` 分支與新效果詞彙）、`src/ops/state/{types,events}.ts`（只追加）、`content/base/world/services/crew.json`（只加常數）、`content/base/world/events/debt-*.json`（新）、`content/base/world/templates/debt.json`（新）、對應測試檔（同目錄 `*.test.ts`，新增或只加測試）。
- 不做：`src/ops/world/{rifts,nodes,travel}.ts`、`src/ops/sortie/`、`src/ops/contracts/tally.ts`、`src/ops/sim/`（`cx-ops-fix`、`cx-war-sim`）、`src/ops/contracts/lifecycle.ts`、`src/ops/text/`、`src/ops/content/start.ts`、`src/ops/crew/names.ts`（`cx-ops-board`）、`src/ops/content/check.ts`（`cx-ops-enc`）、`src/ops/war/`、`content/base/world/templates/default.json`、其他 `content/`、`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec。
- 黃金 hash：**不要重產** `src/ops/sim/fixtures/campaign-hash.json`（領導收線時統一重產）；ops 黃金紅燈不算你的紅燈，REPORT 一句話說明本線為何改變它。
- 件數 gate：程式檔（新增＋修改）超過 12 個、或內容檔改動超過 10 個就停下回報；容量 gate：程式 diff 超過 50 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-debt --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 內容改完後 0 錯 |
| `node src/ops/sim/cli.ts --months 12 --policy greedy --seed N` | 回歸與判準 |
| `npm test`、`npm run typecheck`、`npm run check` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-ops-debt/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（同團隊 `cx-ops-fix`、`cx-ops-board`、`cx-ops-enc`、`cx-war-sim`，以及 `lead-ai-objective` 的 `src/ai/`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 常數、狀態、每潮月結算、手動繳款與提前還本（第 1–4 點）＋測試；`inbox_poll --once`。
2. 欠繳階梯四級、信貸（第 5–7 點）＋測試；`inbox_poll --once`。
3. 招募重複與士氣同源（第 8 點）＋測試；`inbox_poll --once`。
4. 判準（第 9 點）、寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-debt/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與內容 | 「範圍」列的路徑 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-debt/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：判準表（seed × 最大 arrears × 存活 × 期末現金／債，24 與（若有）36 兩組）、idle seed 1 的階梯時間線、新事件型別與錯誤碼清單、對外型別變更、末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯；`npm run check` 0 錯。
2. 新測試全綠：最低償還額＝`max(利息, 本金/amortMonths)`；現金足自動扣繳、不足 `arrears+1` 且 rep −10；當期補繳 `arrears−1`；提前還本降低下期應繳；帳本守恆（重算 balances 等於折疊）。
3. 新測試全綠：階梯四級各一條（事件、扣押抵六成、拒售＋港費 ×2 與解除、終局 `CampaignEnd`）；還清後 `borrow` 可借、超額回錯。
4. 新測試全綠：招募候選不含名冊上已有的 person def；def 為 key 的 `mood` 只動最早實例。
5. `npm test`：`src/ops/**` 無新紅燈（別線造成的、ops 黃金 hash 不算）。
6. 判準表（第 9 點）在 REPORT，且 `node src/ops/sim/cli.ts --months 12 --policy greedy --seed 1` 與 `--policy merc --seed 1` 印 `OK`。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-debt`。本線團隊：`teams/gaps-ops`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-ops-debt --up PROGRESS 'cx-ops-debt 上線，開始債務機制' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-debt --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-debt/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
