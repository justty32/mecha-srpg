# 任務：營運出戰接上規則線的怪獸 def 與擊退結果（UnitInit.monster.def、BattleOutcome.detail:"repelled"、戰果 monster id）

> 領導 `lead-gaps-ops` 寫給 codex 工人 `cx-ops-intent`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。背景：`wf/workflows/dispatch/handoffs/lead-gaps-battle/REPORT.md`（第 2 項「等級影響血量」、追加項「意圖撤退與指揮者」、「給其他線」段）、`wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-retreat/REPORT.md`（`classifyOutcome` 現況：還沒有正式欄位，用 units 推斷）。commit：`git show --stat c2ae883 b23c936`。程式：`src/ops/sortie/{run,apply,outcome,scenario}.ts`、`src/sim/run.ts`（`scenarioToSetup` 怎麼填 `monster.def`）、`src/rules/flow.ts`（`BattleResult`、`BattleOutcome.detail`、`units[].monster`）。

## 背景與唯一目標

規則線已收線：MonsterDef 的 `partsOverride`／`attrMods`／`extraAbilities`／tags 只在 `UnitInit.monster.def` 有值時生效；對手撤光判擊退勝，`BattleOutcome.detail:"repelled"`；`BattleResult.units[]` 帶每台怪獸的 monster id（含被捕捉的）。營運出戰目前沒傳 def，回寫還在用 units 推斷擊退、用「同族同級唯一個體」猜二名。**唯一目標：營運戰鬥用到完整怪獸 def，回寫改讀正式欄位，各有測試釘住。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **monster.def**：找出營運出戰組 `UnitInit` 的路徑（`sortie/run.ts` 的 prepareSetup 或沿用 `scenarioToSetup`），讓每台怪獸（敵方與玩家活捕出戰的）都帶 `monster.def`。測試：一隻有 `partsOverride` 或 `attrMods` 的 monster 經營運出戰後，戰鬥內部位／屬性等於 def 覆寫值。
2. **擊退**：`classifyOutcome` 優先讀 `detail === "repelled"`（照規則線實際欄位位置，可能在 `result.reason`／`result.detail`／outcome 物件，讀程式決定），舊的 units 推斷保留為後備；測試兩種都餵。
3. **monster id**：`apply.ts` 活捕回寫（`SPEC-GAP：BattleResult 不保留 monster id` 那段）改讀 `units[].monster`，拿掉「同族同級只能一隻」的猜測（後備仍保留給舊結果）；二名（epithet）照實際個體帶入。測試：同族同級兩隻不同二名的 A 級怪，捕到哪隻就帶哪隻的二名。
4. **量測（只量不修）**：`cx-ops-retreat` 統計到 greedy 12 潮月 seed 1 玩家撤退 61 次。用現在的 HEAD＋工作樹重跑 greedy 12 潮月 seed 1–3，統計各分類次數與玩家撤退發生在第幾輪（分佈），寫進 REPORT；**不改 AI 或規則**。

## 範圍（排除法寫死）

- 只做：`src/ops/sortie/{run,apply,outcome}.ts`、對應測試檔（同目錄 `*.test.ts`，新增或只加測試）。
- 不做：`src/ops/sortie/scenario.ts`（若 def 必須在這裡填，改動限一行並記 REPORT）、`src/ops/` 其他目錄、`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/content/`、`src/ui-adapter/`、`src/mcp/`、spec、`content/`。
- 黃金 hash：**不要重產** `src/ops/sim/fixtures/campaign-hash.json` 與 `test/campaigns/*.hash.json`。
- 件數 gate：程式檔（新增＋修改）超過 8 個就停下回報；容量 gate：程式 diff 超過 25 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-intent --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/sim/cli.ts --months 12 --policy greedy --seed N` | 回歸 |
| `npm test`、`npm run typecheck` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-ops-intent/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`、`git log`／`git show`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（同團隊其他工人、`lead-gaps-battle`、`lead-ai-objective`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. monster.def（第 1 點）；`inbox_poll --once`。
2. 擊退與 monster id（第 2、3 點）；`inbox_poll --once`。
3. 量測（第 4 點）、跑驗收、寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-intent/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | 「範圍」列的路徑 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-intent/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：第 4 點分類次數與撤退輪次分佈、末尾「以後交接書該點名的工具」。

## 驗收（固定 4 條，一條不多，做完就停）

1. `npm run typecheck` exit 0。
2. 新測試全綠（第 1、2、3 點各至少一條），REPORT 記改前會紅的證據。
3. `npm test`：`src/ops/**` 無新紅燈（黃金 hash 不算）。
4. `node src/ops/sim/cli.ts --months 12 --policy greedy --seed 1`（另 seed 2、3）與 `--policy merc --seed 1` 印 `OK`；第 4 點量測表在 REPORT。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-intent`。本線團隊：`teams/gaps-ops`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-ops-intent --up PROGRESS 'cx-ops-intent 上線，開始接怪獸 def 與擊退' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-intent --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-intent/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
