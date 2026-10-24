# 任務：修試玩回報的三個營運死局（ISS-030 anchored 平手死局、ISS-031 船被蝕核困住、ISS-033 opening 裂縫無限刷）

> 領導 `lead-impl-war` 寫給 codex 工人 `cx-ops-fix`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。背景：`wf/workflows/dispatch/handoffs/lead-playtest/issues.json` 的 ISS-030、ISS-031、ISS-033 三列（用 python 查）、`wf/workflows/dispatch/handoffs/lead-ops-bio-balance/REPORT.md`（opening 期凍結 phase、「anchored 後打巢母全敗」）。spec：`wf/workflows/planning/specs/ops/data-model-world-map.md`（裂縫七態、蝕域）、`battle-interface.md`（三、戰果回寫）、`data-model-factions-contracts.md`（契約失敗與部分成功）、`time-and-tick.md`（航行）。程式：`src/ops/world/{rifts,nodes,travel}.ts`、`src/ops/sortie/apply.ts`、`src/ops/contracts/tally.ts`。

## 背景與唯一目標

試玩 seed 5 走進三個死局：(030) anchored 裂縫的 clear／seal 用起始 3 台機必定 20 輪平手，契約失敗，玩家沒有後果明確的出路；(031) 船停的節點被蝕線吞成 core 後所有航線關閉，船永久困住；(033) opening 期裂縫打贏 8 次仍是 opening，同節點無限刷 2800 的契約。**唯一目標：讓這三種狀況都有規則化的出口，並各用測試釘住。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **ISS-033**：查 `onBattleRift`／`apply.ts` 為何 opening 期勝仗沒關裂縫（`rifts.ts` 有 vanguard-killed 路徑；接約時凍結了 phase）。修到：opening 期契約勝（殲滅先鋒）→ 裂縫 `closed`（或依 spec 狀態機的正確下一態），同一裂縫不再發新契約。測試：同一裂縫打贏一次後不再出現可接的同裂縫契約。
2. **ISS-030**：平手（回合上限、雙方都未達成）的後果要明確且不是死局：契約記一次「未竟」（`partial` 或失敗，依 spec「部分成功→半額」判斷，選一個寫進 REPORT），玩家可以再出戰一次或放棄；**不改戰鬥規則與 AI**（AI 目標意識是別線），也不偷改敵方強度。若 spec 沒定，選最小解法：平手＝契約保持 active、扣一次出場耗損、允許在期限內重打；並讓 greedy 政策遇到同一契約連續 2 次平手就 `drop`（`src/ops/sim/policies.ts` 只加這段）。
3. **ISS-031**：船所在節點變成 core（或周圍航線因蝕化關閉）時要有出口：允許「付燃料強行撤離」到最近的可通節點（沿用 `time-and-tick` 的「玩家可付燃料撤退」與既有 `drift`／`retreatFuel` 規則），或讓船所在節點的出邊對「離開」方向不因蝕化關閉——選一個寫進 REPORT。測試：構造船在 core 節點、全部鄰路蝕化的 state，玩家仍有至少一個合法指令能離開。
4. 三項各至少一條會變紅的測試（先在改前證明會失敗，REPORT 一句話記怎麼證的）。

## 範圍（排除法寫死）

- 只做：`src/ops/world/{rifts,nodes,travel}.ts`、`src/ops/sortie/apply.ts`、`src/ops/contracts/tally.ts`、`src/ops/sim/policies.ts`（只第 2 點的 greedy 放棄邏輯）、對應測試檔（同目錄 `*.test.ts`，新增或只加測試）。
- 不做：`src/ops/war/`、`src/ops/sortie/scenario.ts`、`src/ops/contracts/lifecycle.ts`、`src/ops/text/`、`src/ops/content/`（同時在跑的 `cx-ops-board` 的領地）、`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec、`content/`。
- 黃金 hash：`src/ops/sim/fixtures/campaign-hash.json` 若因本線變動，`GOLDEN_UPDATE=1` 重產並記舊→新。
- 件數 gate：程式檔（新增＋修改）超過 10 個就停下回報；容量 gate：程式 diff 超過 40 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-fix --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/sim/cli.ts --months 12 --policy greedy --seed 5` | 試玩 seed 的回歸 |
| `npm test`、`npm run typecheck` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-ops-fix/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（含同時在跑的 `cx-ops-board`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. ISS-033；`inbox_poll --once`。
2. ISS-031；`inbox_poll --once`。
3. ISS-030；`inbox_poll --once`。
4. 跑 greedy seed 1、5 的 12 潮月；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-ops-fix/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | 「範圍」列的路徑 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-ops-fix/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：三項各自選的解法與 spec 依據、greedy seed 1／5 改前改後的 12 潮月摘要、末尾「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run typecheck` exit 0。
2. 三項各至少一條新測試、全綠，且 REPORT 記了改前會紅的證據。
3. `npm test`：`src/ops/**` 無新紅燈（別線造成的列名不算）。
4. `node src/ops/sim/cli.ts --months 12 --policy greedy --seed 5`（另 seed 1）印 `OK`；seed 5 不再出現同一 opening 裂縫勝仗 ≥ 2 次、不再有船困在同節點 ≥ 28 天（REPORT 附統計）。
5. `node src/ops/sim/cli.ts --months 12 --policy idle --seed 1` 印 `OK`。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-fix`。本線團隊：`teams/impl-war`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-ops-fix --up PROGRESS 'cx-ops-fix 上線，開始修三個營運死局' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-fix --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-ops-fix/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
