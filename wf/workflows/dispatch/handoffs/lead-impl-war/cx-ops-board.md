# 任務：把休眠的 11 份契約模板接上勢力發包，並修試玩回報的契約板／名冊／log 問題（ISS-032、034、038、039）

> 領導 `lead-impl-war` 寫給 codex 工人 `cx-ops-board`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。背景：`wf/workflows/dispatch/handoffs/lead-content-world/REPORT.md`（「需要決定」第 1、3、4 條）、`wf/workflows/dispatch/handoffs/lead-playtest/issues.json` 的 ISS-032、ISS-034、ISS-038、ISS-039 四列（用 `python3 wf/tools/tabledb.py` 或 python 查）、`wf/workflows/dispatch/handoffs/lead-impl-war/{cx-war-core,cx-war-merc}/REPORT.md`（勢力、war 牌道、join 契約）。spec：`wf/workflows/planning/specs/ops/data-model-factions-contracts.md`、`mercenary-contracts.md`（`kind:"join"`）、`text-ui-contract.md`。程式：`src/ops/contracts/`、`src/ops/world/actions.ts`、`src/ops/sortie/scenario.ts`、`src/ops/content/start.ts`、`src/ops/text/`、`src/ops/state/types.ts`。

## 背景與唯一目標

`content/base/world/contracts/` 有 11 份新模板（收復、守城、護送、偵察、奪回遺物、參戰型三段、獵殺二名怪、處理同業、走私上月、清剿、封印）全部休眠——沒有勢力把它們列進 `contractKinds`、沒有對應行動牌、`issuerKinds` 裡還有 `league`／`militia`／`hunters`／`scholars` 這類不是 `scaleNow` 的值。試玩又發現：開局 56 天零契約、可接無航線可達的契約、起始名冊重名與 id 外露、log 有 id／空字串／無文案事件。**唯一目標：讓契約板在開局就有多種契約可接（且接得到的都到得了），並讓名冊與 log 對玩家可讀。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **發包**：為每份模板決定發包勢力（`factions-ops/*.json` 的 `contractKinds`；勢力列表見 `content/base/world/factions-ops/`），並加**非 war 牌道**的發包行動牌 `content/base/world/actions/board-*.json`（照 `post-clear.json`／`post-seal.json` 的形狀；`valid`／`weight`／`cooldownDays` 讓開局第一週內板上至少 2 份契約、之後穩定 3–8 份）。`issuerKinds` 對不上 `scaleNow` 的，改模板的 `issuerKinds` 成真的規模值（state／city／company／guild／band／cult），**不改** `contracts/lifecycle.ts` 的 `eligible` 語意。非裂縫契約（escort、scout、survey、smuggle、rival、defend）目前 `contractsDaily2` 要求要有裂縫才發——找出最小改動讓它們可以只指節點發包（`target.node`），裂縫類照舊。
2. **參戰型**：`join-faction-front.json` 改成 `kind:"join"`＋`join: JoinTerms`（照 `op-join-*.json` 的寫法）並接上 `cx-war-merc` 的 join 流程（作戰 muster 時發），三段 `stages` 若 join 流程用不到就移除並在 REPORT 說明；不新增第二套參戰邏輯。
3. **戰鬥內單位 id**：護送（escort 的被護送者）與獵殺（killTarget 的二名怪）在 `sortie/scenario.ts` 生成情境時填 `params.unit`／`params.units`（`src/sim/run.ts` 的 `scenarioToSetup` 已會把情境 `target` 翻成 unit id——讀它決定填哪個欄位）；被護送者需要一台單位就從內容裡挑一個既有的非戰鬥 frame 或 monster 生成，挑不到就記 REPORT、該契約先只用 survive。
4. **ISS-034**：`cmdAccept` 拒絕 `shortestPath` 到不了目標節點的契約（錯誤碼 `unreachable`）；契約板顯示（`text/`）對不可達契約標 disabled。
5. **ISS-032**：開局 56 天零契約——上面第 1 點應已解決，寫測試斷言 seed 1–5 第 14 天前板上 ≥ 2 份可達契約。另查「工作樹 greedy 1 潮月 seed 1–7 全無出戰、HEAD `70628f7` 有出戰」：在乾淨 worktree（`git worktree add --detach /tmp/cx-ops-board/wt 70628f7`、`/tmp/cx-ops-board/wt2 HEAD`）各跑 `runCampaign` greedy 1 潮月 seed 1–7 數 `BattleResolved`，二分找出是哪個 commit 造成（`git log --oneline 70628f7..HEAD`），REPORT 寫結論；是內容或你本線可修的就修，是別線程式就只記錄。收尾 `git worktree remove` 你建的 worktree。**若沙箱擋住 `git worktree add`（`.git/` 唯讀），不算阻塞**：改用 `git show 70628f7:路徑 > /tmp/cx-ops-board/…` 比對可疑檔，或只記「需領導在沙箱外二分」，驗收第 5 條改以此說明為準。
6. **ISS-038**：開局名冊人物重名／id 當名字（`mech-8`、兩個「葛西 蓮」）——`content/start.ts` 與人物命名處讓同一 def 的多個實例取不同名字（沿用 `crew/names.ts` 的命名池），機甲顯示名不要是 id。
7. **ISS-039**：log 文字——空字串（「你付給  17.5 幣薪水」「轉為 。」）、id／英文外露、浮點尾數、無文案事件。名稱解析放 `src/ops/text/`（人物、勢力、節點、裂縫、契約、機甲、機型 id → 中文名，取不到時退回可讀的短名，絕不印空字串）；金額格式化成整數或一位小數；`templates/default.json` 補作戰／外交／研發／參戰新事件的文案（事件清單見三份 war REPORT 的「新事件」）。寫一條測試：跑 seed 1 的 30 天，所有 log 文字不含空的「  」雙空格佔位、不含 `/`（id 樣式）、不含超過兩位小數的數字。

## 範圍（排除法寫死）

- 只做：`content/base/world/factions-ops/`（改 `contractKinds`）、`content/base/world/actions/board-*.json`（新）、`content/base/world/contracts/`（改 `issuerKinds`、`join-faction-front.json` 改型；不刪檔）、`content/base/world/templates/default.json`（只加條目）、`src/ops/contracts/lifecycle.ts`、`src/ops/sortie/scenario.ts`（只第 3 點）、`src/ops/content/start.ts`、`src/ops/crew/names.ts`、`src/ops/text/`、對應測試檔（同目錄 `*.test.ts`，新增或只加測試）。
- 不做：`src/ops/war/`、`src/ops/sortie/apply.ts`、`src/ops/world/`（同時在跑的 `cx-ops-fix` 的領地）、`src/ops/contracts/tally.ts`（同上）、`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec、其他 `content/`。
- 黃金 hash：`src/ops/sim/fixtures/campaign-hash.json` 你可以 `GOLDEN_UPDATE=1` 重產，REPORT 記舊→新（領導收線時在乾淨 worktree 再核一次）。
- 件數 gate：程式檔（新增＋修改）超過 15 個、或內容檔改動超過 40 個就停下回報；容量 gate：程式 diff 超過 60 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-ops-board --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/content/check.ts content/base` | 內容改完後 0 錯 |
| `node src/ops/sim/cli.ts --months 12 --policy greedy --seed N` | 契約板與出戰 |
| `npm test`、`npm run typecheck`、`npm run check` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔與 worktree 只放 `/tmp/cx-ops-board/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`、`git worktree add --detach`／`git worktree remove`（只限你在 `/tmp/cx-ops-board/` 建的）、`git log`／`git show`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（含同時在跑的 `cx-ops-fix`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 發包、模板 issuerKinds、非裂縫契約可發、join 改型；`inbox_poll --once`。
2. 單位 id（第 3 點）、ISS-034；`inbox_poll --once`。
3. ISS-032 調查與測試；`inbox_poll --once`。
4. ISS-038、ISS-039；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-ops-board/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式與內容 | 「範圍」列的路徑 |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-ops-board/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：11 份模板 × 發包勢力表、ISS-032 二分結論、log 文字前後對照 10 行、對外型別或錯誤碼變更、末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯；`npm run check` 0 錯。
2. 新測試全綠：seed 1–5 第 14 天前板上 ≥ 2 份可達契約；`accept` 不可達契約回 `unreachable`；開局名冊無重名、無 id 當名；seed 1 的 30 天 log 文字三條規則（第 7 點）。
3. `npm test`：`src/ops/**` 無新紅燈（別線造成的列名不算）。
4. 12 潮月 greedy seed 1–3：每個 seed 契約板上出現過至少 6 種不同模板、`ContractAccepted` ≥ 3（REPORT 附統計）。
5. ISS-032 二分有結論（哪個 commit、為什麼），附指令輸出。
6. `node src/ops/sim/cli.ts --months 12 --policy idle --seed 1` 與 `--policy merc --seed 1` 印 `OK`。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-ops-board`。本線團隊：`teams/impl-war`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-ops-board --up PROGRESS 'cx-ops-board 上線，開始接契約板' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-ops-board --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-ops-board/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
