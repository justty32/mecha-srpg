# 任務：把作戰／外交／參戰／研發的不變量與五條黃金戰役寫成測試，並跑通 12／24 潮月 idle、greedy、merc 模擬（切線 5：ops-war-sim）

> 領導 `lead-impl-war` 寫給 codex 工人 `cx-war-sim`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。spec：`wf/workflows/planning/specs/ops/war-testing.md`（全篇，主契約），其餘 `data-model-operations-war.md`、`data-model-diplomacy.md`、`mercenary-contracts.md`、`data-model-faction-rnd.md` 按需查。前三條線的成果：`wf/workflows/dispatch/handoffs/lead-impl-war/{cx-war-core,cx-war-merc,cx-war-rnd}/REPORT.md`。程式：`src/ops/war/`、`src/ops/sim/`（`campaign`、`invariants`、`policies`、`replay`、`golden.test.ts`、`cli`）、`test/golden.test.ts`（既有規則黃金的寫法）。

## 背景與唯一目標

作戰、外交、參戰、研發四塊都已實作並有單元測試，但 `war-testing.md` 的潮月模擬、不變量、黃金戰役還沒有。**唯一目標：把 war-testing 的不變量與五條黃金戰役落成可重跑的測試，並證明 12 與 24 潮月的 idle／greedy／merc 模擬不拋錯、世界在動、不退化、帳本守恆。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **不變量**：`src/ops/sim/invariants.ts` 的 `checkInvariants` 加 war 段（**每天都會跑，必須便宜**）：`value ∈ [−100,100]`、`progress ∈ [0,1]`、戰力 ≥ 0、`rnd.points ≥ 0`、`relations` 鍵 `a<b` 且無自對、`OperationState.target.loc`／`mercSlots[].contract`／`ShellState.holder`／`ModelState.def` 指向存在實體、借機歸還後 `inventory.mechs` 不含勢力借機、`faction-supply`／`join-pay`／`loan-loss` 外源帳都有來源事件 `ref`。跨日的比例型不變量（`war` ≤ 活勢力對數 30%、`allied` ≤ 40%、大勢力間 ≥ 3 種 RelState、單對連續 war ≤ 6 潮月、全世界總戰力 ≥ 開局 30%、每天作戰數 ∈ [0,15]、單場 ≤ 45 天）放新檔 `src/ops/sim/war-metrics.ts`（純函式，吃 `onDay` 逐日累計），由測試與 CLI 共用；`src/ops/sim/cli.ts` 每潮月那行與末尾 `war統計` 改用它（不改既有欄位的格式）。
2. **屬性測試**：`src/ops/sim/war-invariants.test.ts`——隨機 policy（`idle`／`random`／`merc`）× 隨機 seed（固定一組 6 個，寫死在檔內）× 6 潮月，全部不變量成立；**全檔 ≤ 60 秒**（必要時 `merc` 用假 battle runner 回固定勝負，真戰鬥留給 CLI）。時序：`等 7`＝7×`等 1`（含作戰與外交事件序列）、`RelationChanged` 只在第 2 段（事件 payload 的 `stage`）、研發事件只在每潮月第 1 天；重播：含作戰與 join 戰鬥的 campaign 經 `replayCampaign` 逐位元相同、戰鬥不重跑。
3. **黃金戰役五條**（`test/campaigns/`，新目錄）：每條一個 `名稱.json`（`start`、`seed`、`commands`，必要時 `setup` 對開局 state 的小補丁——只准改 `relations`／`shells`／`operations`／`factions.*.rep`／`ship.at` 這類戰爭欄位，補丁內容寫死在 json）、一個 `名稱.hash.json`（`GOLDEN_UPDATE=1` 重產）、一個共用 `test/campaigns/campaigns.test.ts`：斷言 war-testing 列出的**事件子序列依序出現**＋事件日誌 hash 相符。五條：`ops-war-assault`、`ops-merc-join`、`ops-betrayal`、`ops-relic`、`ops-leak`，內容照 war-testing「黃金戰役」段。指令序列可以先用政策跑出來再凍結成 json。
4. **模擬驗收**：跑 `node src/ops/sim/cli.ts --months 12|24 --policy idle|greedy|merc --seed 1`（另 idle 與 merc 加 seed 2、3），存輸出到你的交付資料夾。若比例型不變量不成立，**可以調戰爭內容的數值**（`content/base/world/{operations,treaties,forces,affinity.json,actions/war-*.json,lineages,models}`），不改程式公式；調整一項記一行。
5. **黃金 hash 的工作樹問題**：工作樹裡別線（lead-content-world 等）未提交的內容會讓既有 `src/ops/sim/fixtures/campaign-hash.json` 與你的黃金在工作樹與乾淨 HEAD 不同——你照工作樹產生即可，**領導收線時在乾淨 worktree 重產**；REPORT 註明。

## 範圍（排除法寫死）

- 只做：`src/ops/sim/{invariants,cli}.ts`（只加）、`src/ops/sim/war-metrics.ts`（新）、`src/ops/sim/war-invariants.test.ts`（新）、`test/campaigns/`（新）、上面第 4 點列的戰爭內容資料夾（只調數值）。
- 不做：`src/ops/war/`、`src/ops/sortie/`、`src/ops/contracts/`、`src/ops/world/`、`src/ops/time/` 的程式——**發現 bug 不要自己修**，寫進 REPORT「需要決定的事」（附重現指令）並發 `BLOCKED`（若它擋住驗收）；`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec、其他 `content/`。
- 件數 gate：程式／測試檔（新增＋修改）超過 12 個、或內容檔改動超過 25 個就停下回報；容量 gate：diff 超過 80 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-war-sim --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/sim/cli.ts --months 24 --policy idle --seed N` 等 | 模擬驗收 |
| `GOLDEN_UPDATE=1 node --test test/campaigns/campaigns.test.ts` | 產黃金 hash |
| `npm test`、`npm run typecheck` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-war-sim/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. `war-metrics.ts`、不變量、CLI；`inbox_poll --once`。
2. 屬性與時序／重播測試；`inbox_poll --once`。
3. 五條黃金戰役；`inbox_poll --once`。
4. 模擬驗收與內容調數；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-sim/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 測試與工具 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/war-metrics.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/war-invariants.test.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/test/campaigns/` |
| 模擬輸出 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-sim/`（每個 policy×months×seed 一個 `.log`） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-sim/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：五條黃金的事件子序列與 hash、seed 1 的 24 潮月 idle 與 merc 每潮月一行（作戰、war、allied、釋出、join）、merc 政策 24 潮月的 join 次數／勝敗／結算總額、內容調數清單、末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯。
2. `node --test test/campaigns/campaigns.test.ts` 5 條全綠；`node --test src/ops/sim/war-invariants.test.ts` 全綠且 ≤ 60 秒（REPORT 附秒數）。
3. `npm test`：`src/ops/**` 與 `test/campaigns/` 無新紅燈（別線造成的紅燈列名不算）。
4. 12 與 24 潮月：`--policy idle`（seed 1、2、3）、`--policy greedy`（seed 1）、`--policy merc`（seed 1、2、3）全部印 `OK`，且 `war-metrics` 的比例型不變量全成立（REPORT 附各 run 的 `war統計`）。
5. 24 潮月 idle 每個 seed：至少 1 次 `war`、1 次停火、1 次 `ModelReleased`、1 次 `NodeTransferred`；seed 1 的 24 潮月 idle 總時間 ≤ 8 秒。
6. 24 潮月 merc 三個 seed 合計：至少 5 次 join 走完 aftermath 結算（`join-pay` 帳）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（程式 bug）→ 不修程式，REPORT 附重現指令，發 `BLOCKED`（擋驗收）或寫進「需要決定的事」（不擋）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-war-sim`。本線團隊：`teams/impl-war`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-war-sim --up PROGRESS 'cx-war-sim 上線，開始戰爭模擬與黃金' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-war-sim --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-sim/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
