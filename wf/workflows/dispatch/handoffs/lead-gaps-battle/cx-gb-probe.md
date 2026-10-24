# 任務：做 npm run content:probe：對指定內容自動配同級基準對手跑 N 場，輸出勝率、輪數、平手率、能力使用與數值帶超標

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-probe`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。程式：`src/sim/run.ts`（`scenarioToSetup` 吃記憶體 `DynamicScenario`、`runBattle`）、`src/sim/measure.ts`、`test/fuzz/{cli,worker}.ts`（平行 worker 寫法照抄）、`wf/workflows/dispatch/handoffs/lead-playtest/sweep.ts`（量測欄位）。數值帶：`wf/workflows/content/numeric-bands.json`（規劃線正在寫，開工與收尾各讀一次）。REPORT：`wf/workflows/dispatch/handoffs/lead-content-battle/REPORT.md`（measure 不尊重情境 rounds）。

## 背景與唯一目標

使用者要讓 codex 填內容後自己量平衡。現在只有一次性的 sweep／smoke 腳本。**唯一目標：一支正式指令 `npm run content:probe -- 一個或多個id`，codex 填完一件 frame／monster／ability／scenario 就能跑、看得懂結果、拿得到 JSON。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：
  1. 新增 `src/sim/probe.ts`（CLI＋可 import 的 `probe(db, ids, opts)`）、`src/sim/probe-worker.ts`（worker_threads，平行跑場；輸出與 `--jobs 1` 逐字相同）、`src/sim/probe-baselines.json`（每級 D／C／B／A／S 的基準單位：一台基準摹機（frame id＋**明寫 components**，不依賴 defaultLoadout）＋駕駛人物 id、一隻基準怪獸（monster id）；以及 `bands`：從 numeric-bands.json 抄出可機器比較的區間——至少「摹機總層 HP」「怪獸總層 HP」「AP 成本」「單發傷害」「射程」「armorPen」——檔內註明來源與日期）。
  2. 依 id 種類自動配對（地圖用 `content/base/maps/` 裡一張約 16×16～24×24 的開闊圖，寫進 baselines 檔）：**frame** → 主角機（裝 defaultLoadout，沒有就空手並警示）＋基準駕駛，分別對同級基準摹機與同級基準怪獸各 N 場；**monster** → 對同級基準摹機 2 台（台數寫在 baselines，可調）N 場；**ability** → 找出帶它的載體（frame innate、component 經 defaultLoadout 掛在哪台 frame、species／monster），挑第一個載體照上面跑，並特別報該能力使用次數；**scenario** → 直接跑情境 N 個 seed（用情境自己的 rounds）。
  3. 輸出（人看的中文摘要＋`--json FILE` 或 `--json -`）：每個 id、每組對戰：勝率（主角方）、敗率、平手率、平均輪數、每個能力被 AI 使用次數（數 UseAbility 成功的事件）、**主角從未使用的能力**、超出 bands 的欄位（例如「總層 HP 1450 > A 級上限 1100」）、例外數。選項：`--n 20`（預設 20）、`--seed 1`（起始 seed，seed 依序遞增）、`--jobs`（預設 min(8, CPU 數)）、`--rounds`（覆寫輪數，預設 20）、`--content DIR`（可重複，預設 content/base）。
  4. `package.json` 的 `scripts` 加一行 `"content:probe": "node src/sim/probe.ts"`（只加這一行）。
  5. `src/sim/measure.ts`：未給輪數時改用情境自己的 `rounds`（content-battle REPORT 需要決定第 5 點）；`test/ai/balance.test.ts` 若因此變紅，記錄不改。
  6. 測試 `test/sim/probe.test.ts`：配對邏輯（四種 id 各一）、`--jobs 1` 與 `--jobs 2` 結果相同、bands 超標偵測（餵一個超標的記憶體內容）、JSON 形狀。
- 不做：`src/sim/session.ts`、`src/sim/run.ts`（只 import）、`src/rules/`、`src/ai/`、`src/ops/`、`src/mcp/`、`src/content/`、`content/`（任何內容檔）、`schemas/`、`wf/`（你的 REPORT 除外）；不改 numeric-bands.json。
- 件數 gate：改動＋新增檔超過 10 個就停下回報；容量 gate：diff 超過 100 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-probe --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `node test/fuzz/cli.ts --help` | 平行 worker 與確定性輸出的既有寫法 |
| `npm run content:probe -- frame/longspear-v4 monster/tidewolf-c ability/mx-head-vulcan scenario/quarry-duel` | 完成時的範例輸出（貼進 REPORT） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-probe/`；臨時檔只放 `/tmp/cx-gb-probe/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ai/`、`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；讀程式與 numeric-bands；挑基準單位（每級挑「數值最接近帶中位數」的現有 frame／monster，理由寫 REPORT）；`inbox_poll --once`。
2. 寫 probe.ts／worker／baselines／script；`inbox_poll --once`。
3. 改 measure.ts；寫測試；`inbox_poll --once`。
4. 跑範例輸出（含 `--json -` 的前 40 行）與計時；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-probe/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/sim/probe.ts`、`src/sim/probe-worker.ts`、`src/sim/probe-baselines.json`、`src/sim/measure.ts`、`package.json`（一行） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/sim/probe.test.ts` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-probe/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `npm run content:probe -- frame/longspear-v4 monster/tidewolf-c ability/mx-head-vulcan scenario/quarry-duel` exit 0，輸出含勝率、平均輪數、平手率、能力使用次數、從未使用的能力、超出數值帶的欄位（REPORT 貼全文與耗時）。
2. `--json -` 輸出可被 `JSON.parse`；`--jobs 1` 與 `--jobs 4` 的 JSON 相同（REPORT 附比對指令與結果）。
3. `node --test --test-isolation=none test/sim/probe.test.ts` 全過，至少 6 條；`npm run typecheck` 0 錯。
4. `node src/sim/measure.ts scenario/convoy-run 1` 的輪數上限等於該情境 `rounds`（REPORT 附輸出）。
5. REPORT 存在且有四段＋基準單位表（等級／frame＋components／駕駛／怪獸／挑選理由）＋用法段（可直接抄進 README）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-probe`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-probe --up PROGRESS 'cx-gb-probe 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-probe --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-probe/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-probe --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。
