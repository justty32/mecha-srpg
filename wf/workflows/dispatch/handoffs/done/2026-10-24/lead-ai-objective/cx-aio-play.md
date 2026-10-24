# 任務：修試玩回報的三個 AI 行為問題（flee 車隊不動、單回合來回踱步／護衛不開火、第三方目標偏向）

> 領導 `lead-ai-objective` 寫給 codex 工人 `cx-aio-play`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。本線接在 `cx-aio-core`、`cx-aio-tactics` 之後（都已 commit：`25b69c0`、`8f3d70e`），先讀兩份 REPORT。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。前兩線 REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-core/REPORT.md`、`.../cx-aio-tactics/REPORT.md`。試玩問題表：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/issues.json` 的 ISS-005、ISS-013（用 `python3 wf/tools/tabledb.py` 或 python 讀，不整份貼進 context）。程式：`src/ai/agent.ts`（`takeTurn` 一回合多動作迴圈）、`src/ai/policies/{flee,tactical}.ts`、`src/ai/score.ts`、`src/ai/strategy.ts`、`src/ai/danger.ts`。

## 背景與唯一目標

試玩線第 1 輪回報三個 AI 問題。領導預查（`convoy-run` seed 1，3 輪）：
- **ISS-005**：`convoy` slot（aiprofile `convoy-runner`，policy `flee`）兩台 `hound-mk2` 有駕駛、整場 0 步。疑因：`flee` 的 `score` 是**絕對值**（`距離×fleeDistance − 危險 − 到出口距離×fleeExitDistance`），離出口 33 格時所有移動都是負分，`selectCandidate` 只收正分 → 直接 End。
- **ISS-013 踱步**：`ally-0` 第 1 輪先走 8 格到 (44,9) 又走回 (47,8)——`takeTurn` 允許同一回合多個純移動指令，每個各自評分，第二步把第一步抵銷。同場 player 兩台、enemy 數隻整場不動、看得到敵人的護衛不開火（原因未查）。
- **ISS-013 偏向**：`unbound-raid` seed 1，第三方 `third`（rift-insects，focus-fire）打 ally 63 次、打 enemy 2 次——可能只是站位，也可能是威脅／集火評估偏向，要查清。

**唯一目標：查清並修好這三個 AI 行為問題，每項有測試。**

## 範圍（排除法寫死）

- 只做：改 `src/ai/agent.ts`、`src/ai/policies/flee.ts`、`src/ai/policies/tactical.ts`、`src/ai/score.ts`、`src/ai/strategy.ts`、`src/ai/danger.ts`、`src/ai/objectives.ts`（只在查出根因在此時）；新增 `test/ai/playtest-fixes.test.ts`。
- 修法方向（領導定；細節你定，偏離寫 REPORT）：flee 改成「相對於現在位置的進展分」（往出口、遠離危險為正），站上出口仍 `fleeRetreat` 撤離；一個單位回合內**純移動指令最多 `maxPureMoves` 次**（新參數，預設 1；先移動再出手的候選不受限）；「不動／不開火」與「第三方偏向」先查根因，是 AI 的問題才修，是內容（沒武器、沒 AP、射程）或規則的問題就只寫 REPORT，不改。
- 不做：`src/rules/`、`src/core/`、`src/sim/`、`src/ops/`、`src/ui-adapter/`、`src/mcp/`、`content/`（**任何內容檔都不改**，含 aiprofiles——試玩線正在調）、spec、`wf/`（你的 REPORT 除外）、`test/golden/`、其他 `test/` 檔。不改 `src/ai/rules-query.ts` 介面。
- 件數 gate：新增＋修改檔合計超過 8 個就停下回報；容量 gate：diff 超過 50 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-aio-play --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node wf/workflows/dispatch/handoffs/lead-playtest/sweep.ts` | 全情境 × seed 1–5 AI 對 AI：開工與完成各跑一次（唯讀使用，不改檔） |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | Wait 比例回歸 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/scenario-measure.ts scenario/rift-edge-nest 1 2 3 4 5` | 回歸 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored` | 營運 anchored 15 場（我方損失不得變多） |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 效能：ms／步 ≤ 開工 1.5 倍 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-aio-play/`。可跑 `node`、`node --test`、`npm test`、`npm run typecheck`。**不要 commit**（領導做）。工作樹有別線未 commit 的改動（規則、內容）——不碰、不還原；比較新舊 AI 一律在**同一時刻工作樹**下做（前兩線用 Node `registerHooks` 載入 git HEAD 的 `src/ai` 當對照，可沿用）。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`）。

## 工作

1. 開工量測（sweep、skirmish、rift、anchored、bench）；查三個問題的根因（每個寫一句證據）；`inbox_poll --once`。
2. 修 flee、純移動上限；查清「不動／不開火」與「第三方偏向」，屬 AI 的修；測試；`inbox_poll --once`。
3. 完成量測；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-play/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/`（範圍列的檔） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/playtest-fixes.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-play/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），附「根因表（問題、根因、證據、屬 AI／內容／規則、處置）」「量測表（開工／完成：sweep 每情境勝方分布、skirmish Wait 比例與勝負、rift 勝負、anchored 勝場與我方損失、bench）」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. `test/ai/playtest-fixes.test.ts` 至少 4 條：flee 單位離出口很遠仍會朝出口移動、站上出口會撤離；一個單位回合內純移動不超過 `maxPureMoves`；護衛在敵人進入射程時會出手（若根因不在 AI，改為記錄並以測試鎖住 AI 端行為）；第三方偏向（若屬 AI）修正後的選擇測試。每條能變紅（REPORT 一句說怎麼證的）。
2. 沙箱外 `test/ai/`、`test/sim/` 0 fail；`npm run typecheck` 對你改的檔 0 錯（領導重跑）。
3. `convoy-run` 與 `tidal-flat-evac` seed 1：convoy slot 單位整場移動步數 > 0，且結束時離最近出口的距離比開場小（REPORT 給數字）。
4. skirmish seed 1–5 Wait 比例 < 0.5；rift-edge-nest seed 1–5 winner 非 null；anchored 15 場我方損失（`ownLost` 合計）不多於開工。
5. bench ms／步 ≤ 開工 1.5 倍；sweep 開工／完成兩份輸出存在 `/tmp/cx-aio-play/` 並摘進量測表。
6. REPORT 存在且有四段＋兩附表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留程式、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-aio-play`。本線團隊：`teams/ai-objective`。上線先發 `wf/tools/inbox_mail.sh cx-aio-play --up PROGRESS 'cx-aio-play 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-aio-play --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-ai-objective/cx-aio-play/REPORT.md`（`DONE` 換成實際 STATUS 之一）；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。ROSTER 已由領導代登記。
