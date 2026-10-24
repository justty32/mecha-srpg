# 任務：在獨立 worktree 裡做入港自動補彈，並把 greedy 戰役調到首戰打得贏、三潮月不走光

> 領導 `lead-ops-bio-balance` 寫給 codex 工人 `cx-bal`。**交接書是唯一契約**：沒寫的授權等於沒有。ops 共用慣例沿用 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-ops/contract.md` 的 §2、§3、§5。

**你的工作目錄是 git worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt-bal`（下稱 WT，detached HEAD，與 main 同一個 commit 起點）。** 所有程式、內容、量測腳本、REPORT 都寫在 WT 裡；領導之後把你的 diff 併回 main。同時有另一個工人在 main 改生物系（獸欄→拘束艙），所以 WT 裡的 `src/ops/crew/stable.ts` 等舊獸欄程式**你不要碰**。

先讀（在 WT 裡讀即可，內容與 main 相同）：`AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——親自讀。背景：`wf/workflows/dispatch/handoffs/lead-integ-battle/REPORT.md`（「撤離修正後 ops greedy」段：首戰全敗的原因）；spec `wf/workflows/planning/specs/ops/data-model-economy-research.md`、`time-and-tick.md`、`battle-interface.md`。

## 背景與唯一目標

`node src/ops/sim/cli.ts --policy greedy` 現在 seed 1–5、7 首戰全敗，第 3 潮月剩 0–1 人：開局三台獵犬只有 30mm 機砲（傳統兵器打怪獸一成傷害、彈藥 12 發用完不補），薪水每日約 35、首約 400。頂層定了**補彈**規則（入港自動補滿、按市價從帳本扣款、付不起補到付得起為止）。唯一目標：做出補彈，並只用內容與 ops 經濟參數把 greedy 戰役調到判準。

## 範圍（排除法寫死）

- 只做：
  - **補彈**：新檔 `src/ops/world/resupply.ts` 匯出 `resupplyDaily7(s, ctx)`，從 `src/ops/world/index.ts` 匯出，接進 `src/ops/time/tick.ts` 的 `finishDay` 第 7 段（`marketsDaily7` 之後，一行）。規則：船**停泊（dock）在有市場的節點**時，對玩家所有機甲（`s.mechs` 中屬玩家者，按 mech id 字典序、再按 pool id 字典序）把 id 以 `ammo` 開頭、`cur < max` 的 pool 補滿；單價取該節點市場新增的 list kind `"ammo"`（`items[].def` 是 pool id，`basePrice` 是每發價格，套既有 `priceMods`）；沒有標價的彈種不補；`cash` 不夠就逐發補到付不起為止（不欠款、不讓 cash 變負）。錢只經 `post`（`reason:"resupply"`）；發事件 `Resupplied { mech, pool, rounds, cost }`（加進 `src/ops/state/events.ts`、模板 `content/base/world/templates/*.json`）。`MarketDef` 的 kind 聯集加 `"ammo"`（`src/ops/state/types.ts` **只改這一處**）。`content/base/world/markets/*.json` 加 ammo 列。
  - **測試** `src/ops/world/resupply.test.ts`：恰好 **3** 個 `test()`——停泊補滿且 cash 減少量＝Σ發數×單價、`checkLedger` 空；cash 不足時只補到付得起、cash ≥ 0；航行中（或未停泊）不補、state 不變。
  - **平衡**：只准改 `content/base/`（含 `world/`）的資料檔與新增資料檔。可用手段：開局給打得動怪獸的非傳統武器（優先**新增** component／ability 檔，不改既有戰鬥內容）或配一台生物／古代機、首約報酬、薪水、利率、蟲群預算（`world/encounters/`）、市場彈價。
  - **量測腳本**：新檔 `WT/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts`：`node balance-probe.ts [seed…]`（預設 1–5），每 seed 一行 JSON：`firstBattle`（`"win"`／`"loss"`／`"none"` 與天數）、12 潮月內戰鬥勝／敗數、第 3 與第 12 潮月的 `persons`／`cash`／`debt`。只 import `src/`，不改 `src/ops/sim/`。
  - 黃金：ops 黃金 `src/ops/sim/fixtures/campaign-hash.json` 若變，用 `GOLDEN_UPDATE=1 node --test src/ops/sim/golden.test.ts` 更新並在 REPORT 說明原因。
- 不做：`content/base/rules/`、`content/base/registries/`（核心規則，十分律 `conventionalFactor` 等不准動）；`src/rules/`、`src/ai/`、`src/core/`、`src/content/`、`src/sim/`、`src/ui-adapter/`、`e2e/`、`test/`；`src/ops/` 中除上列三檔（`world/resupply.ts`、`world/resupply.test.ts`、`world/index.ts`）與 `time/tick.ts` 一行、`state/types.ts` 一處、`state/events.ts` 之外的任何檔；生物系相關（`src/ops/crew/`、`world/rooms/`、`world/ship.json` 的 rooms／capacity、`world/services/crew.json` 的 feed／hunger／stable 鍵、`stock:feed`）；spec 與 `wf/`（REPORT 與量測腳本除外）。
- 件數 gate：新增＋修改檔合計超過 30 個就停下回報；容量 gate：diff 超過 150 KB 就停下回報。

## 判準（平衡目標）

`node src/ops/sim/cli.ts --policy greedy --months 12 --seed N`，N＝1–5：(a) 五個 seed 的首戰合計**至少 2 勝**；(b) 五個 seed 第 3 潮月人數都 **> 0**；(c) 盡量讓第 12 潮月人數 > 0，做不到就記數字。先跑 `balance-probe.ts` 記**改動前基準**（補彈接上前一次、接上後一次），每調一輪記一行。不要追求「全勝」——過強也算失衡，REPORT 寫你停在哪、為什麼。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bal --once` | 每完成一個工作步驟跑一次，讀 orders（**用 main 的絕對路徑**，不要用 WT 裡的 `wf/tools`）|
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（同上，main 絕對路徑）|
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | 改到戰鬥內容後確認五個 seed 仍 `pass:true` |
| `node src/ops/content/check.ts content/base` | 改內容後 |

## 資源與禁區

- **可寫程式碼線**：只寫 WT 裡「範圍」列的路徑；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`（在 WT 裡跑）。**不要 commit**：WT 是 detached HEAD，commit 由領導做；你在 REPORT 列出檔案清單。
- `test/golden/`（規則黃金）不得變；變了代表你動到既有戰鬥內容，改用新增檔或停下回報。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git worktree` 任何操作；不寫 main repo（`/home/lorkhan/repo/game_dev/mecha-srpg/`）除了 `wf/inbox/`；不 `rm` 任何檔、不 `rm -rf`；不改 `~/.codex/config.toml`；**不安裝任何套件**（WT 的 `node_modules` 是指向 main 的 symlink，不要動）；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞。

## 工作

1. 寫 `balance-probe.ts`，跑基準（改動前）；`inbox_poll --once`。
2. 補彈＋3 個測試＋市場彈價；再跑基準；`inbox_poll --once`。
3. 調平衡（每輪一行數字）直到判準 (a)(b) 成立；跑 measure 與規則黃金確認沒動到核心；`inbox_poll --once`。
4. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt-bal/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式、內容、測試 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt-bal/`（範圍列的路徑）|
| 量測腳本 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt-bal/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts` |
| REPORT | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt-bal/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加兩個附表：「平衡數字」（基準、補彈後、每輪調整後，seed 1–5 各一列：首戰、勝敗數、第 3／12 潮月人數與現金）與「用了哪些手段（檔案：舊值→新值）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. WT 裡沙箱外 `npm test` 0 fail，新增恰好 3 個 `test()`；`npm run typecheck` exit 0；`npm run check` 0 errors（由領導重跑）。
2. WT 裡 `node src/ops/content/check.ts content/base` exit 0；`npm run sim:campaign -- --months 12 --policy idle` 與 `--policy greedy` 都印 `OK`。
3. WT 裡 `node wf/workflows/dispatch/handoffs/lead-ops-bio-balance/balance-probe.ts` 的輸出滿足判準 (a)(b)（由領導重跑）。
4. WT 裡 `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` 五行都 `pass:true`；`test/golden/` 無改動。
5. WT 的 `git status --short` 只含「範圍」列的路徑。
6. REPORT 存在且有四段＋兩個附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**或判準調不到且已窮盡授權手段 → 發 `FAILED`（調不到判準時改發 `DONE` 也可，但 REPORT 要寫最接近的數字與卡在哪）。
- **測不出來**（node 跑不了 TS、沙箱擋寫）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bal`。本線團隊：`teams/bio-balance`。上線先發 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bal --up PROGRESS 'cx-bal 上線開工' < /dev/null`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bal --up DONE '（一句自足結論）' /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt-bal/wf/workflows/dispatch/handoffs/lead-ops-bio-balance/cx-bal/REPORT.md`（`DONE` 換成實際 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記，你不用寫。
