# 任務：實作 spawner tether dieWithParent，並補 AI 剩餘三項（swarm 不動、未交戰退回中央停住、範圍能力保留 AP 站位）與 unbound-raid 站位

> 領導 `lead-gaps-battle` 寫給 codex 工人 `cx-gb-ai`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`（及 `code-map.json`）、`wf/workflows/common/user.md`——**親自讀，不靠本交接書的摘要**。內容寫法的引擎事實：`wf/workflows/content/engine-facts.json`、數值帶 `wf/workflows/content/numeric-bands.json`（用 python 查，不整份貼進 context）。背景：`wf/workflows/dispatch/handoffs/lead-ai-objective/REPORT.md`（「判斷」「剩餘工作」）、同目錄 `cx-aio-{core,tactics,play}/REPORT.md`。程式：`src/ai/policies/{tactical,swarm}.ts`、`src/ai/score.ts`、`src/ai/knowledge.ts`、`src/rules/flow.ts`（`registerVerb("spawn")`）、死亡判定所在的 rules 模組（grep `UnitDied`）、`src/core/types-def.ts` 的 `SpeciesDef.behaviors.spawner.tether`。

## 背景與唯一目標

lead-ai-objective 收線留下：規則沒實作 `tether:"dieWithParent"`（母體死子蟲同死）；AI 三個缺口；`unbound-raid` 第三方只打 ally 是站位造成。頂層定 anchored（營運打巢母錨）可打贏的判準：**開局兩台 20 輪內打完錨的期望命中數 ≤ 40**（用 `battle-bench.ts` 量）。**唯一目標：這五件各自落地並有測試或量測證據。**

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：
  1. **tether**：spawn 動詞產生的單位記錄母體（`RulesRuntime` 只新增可選欄），母體死亡（UnitDied）時，species `behaviors.spawner.tether === "dieWithParent"` 的子單位一起死（照既有死亡流程發事件，順序確定）；`freeOnParentDeath` 維持現狀。測試 `test/rules/tether.test.ts` ≥ 2 條（同死、free 不死）。`src/rules/flow.ts` 另一位工人也在改（capture／battleResult 段）——改前重讀、只局部 patch。
  2. **swarm 整場不動**：`swarm.ts` 的母體距離篩選移到 `tactical.ts` 截斷候選之前（重現 `scenario/convoy-run` seed 1 enemy-2 (62,8)、enemy-4 (70,7)）。
  3. **未交戰退回中央停住**：評分在「可見目標、`knowledge.lastSeen`、回退中央」三者間比較，有 lastSeen 時往最後所見推進；**不讀隱藏位置**（補測試）。重現 `scenario/tidal-flat-evac`、`scenario/quarry-duel` seed 1。
  4. **範圍能力保留 AP 站位**：`tactical.ts` 補格段讓 ball／line／cone 能力也能「移動到可施放位置並保留 AP」。
  5. **unbound-raid 站位**：只改 `content/base/scenarios/unbound-raid.json` 各 spawn 的 `at`（或部署區相關欄），讓第三方與 ally／enemy 距離相近；**改前重讀**（另一位工人同時在改這檔的 `mech`、`name`、`brief` 欄，不要動那些欄）。量 seed 1–5 第三方打 ally／enemy 次數前後。
  6. 量測：`node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored`（開工／完成）；另算「開局兩台 20 輪內打完錨的期望命中數」（錨＝巢母核心／需毀部位的總層 HP ÷ 開局機的平均單發傷害，考慮部位等機率；寫清算法），REPORT 給數字並判斷是否 ≤ 40；不達標只寫需要決定的事（例如用 MonsterDef partsOverride 調巢母血量），**不改怪獸內容**。
- 測試：`test/ai/` 新增 `test/ai/gaps-fixes.test.ts`（2–4 各 ≥1 條，能變紅）。
- 不做：`src/sim/`、`src/ops/`、`src/mcp/`、`src/content/`、`src/ui-adapter/`、`schemas/`；`content/` 除 unbound-raid 的站位欄以外全部；`src/rules/` 除 tether 所需的最小改動；sustained 主動關閉、passive；黃金檔不重產。
- 件數 gate：改動＋新增檔超過 12 個就停下回報；容量 gate：diff 超過 100 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-gb-ai --once` | 每完成一個工作步驟跑一次，讀 orders（新 order 優先於交接書） |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文一律給檔案） |
| `npm run check`、`npm run typecheck`、`node --test --test-isolation=none 測試檔` | 每步驗證 |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/battle-bench.ts /tmp/cx-aio-core/frozen.json --phase anchored` | anchored 凍結戰場重打（開工／完成） |
| `node wf/workflows/dispatch/handoffs/lead-ai-objective/scenario-measure.ts scenario/convoy-run 1 2 3 4 5` | 情境原輪數量測（convoy-run、tidal-flat-evac、quarry-duel、unbound-raid） |
| `node src/sim/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` | Wait 比例回歸（< 0.5） |
| `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 500` | 效能：ms／步 ≤ 開工 1.5 倍 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT 目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/`；臨時檔只放 `/tmp/cx-gb-ai/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`。**不要 commit**（領導做）；REPORT 列出你改了哪些檔。
- 工作樹裡有**別線同時在改**的檔（`src/ops/`、`content/base/world/`、本隊其他工人的領地）——不碰、不還原、不格式化。本隊其他工人同時在改 `src/content/loader.ts` 等共用檔時，**每次修改前重新讀該檔、只做局部 patch**，不整檔重寫。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 commit、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（用 `--test-isolation=none`，最終由領導在沙箱外重跑）；別線未提交改動造成的紅燈寫進 REPORT，不算你的錯、也不要去修。

## 工作

1. 上線 PROGRESS；開工量測；查根因；`inbox_poll --once`。
2. 做 1（tether）＋測試；`inbox_poll --once`。
3. 做 2–4＋測試；`inbox_poll --once`。
4. 做 5、6；`test/ai/`、`test/sim/`、`test/rules/` 跑一次；寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/`、`src/rules/`（tether 最小改動）、`src/core/types-state.ts`（只新增可選欄） |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/rules/tether.test.ts`、`test/ai/gaps-fixes.test.ts` |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/scenarios/unbound-raid.json`（只站位） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md` |

REPORT 四段（做了什麼／產出（改動檔清單）／沒做到或證據不足的／需要決定的事），末尾加「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `test/rules/tether.test.ts` ≥2 條、`test/ai/gaps-fixes.test.ts` ≥3 條，全過且能變紅（REPORT 一句說怎麼證）；`test/ai/`、`test/sim/`、`test/rules/` 0 fail（沙箱內不準時領導重跑）。
2. convoy-run seed 1 的 enemy-2、enemy-4 整場移動步數 > 0；quarry-duel、tidal-flat-evac seed 1 有交戰（REPORT 給前後數字）。
3. unbound-raid seed 1–5 第三方打 enemy 次數前後表；skirmish seed 1–5 Wait 比例 < 0.5；bench ms／步 ≤ 開工 1.5 倍。
4. REPORT 給 anchored 凍結 15 場前後勝場與命中、「期望命中數」算法與數字、是否 ≤ 40。
5. REPORT 存在且有四段＋量測表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**且修不好 → 保留改動、發 `FAILED`，REPORT 寫證據（不回滾，領導判斷）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-gb-ai`。本線團隊：`teams/gaps-battle`。上線先發 `wf/tools/inbox_mail.sh cx-gb-ai --up PROGRESS 'cx-gb-ai 上線開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-gb-ai --up DONE '（一句自足結論）' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md`（`DONE` 換成實際 STATUS：`DONE`／`BLOCKED`／`NEEDS-USER`／`FAILED`）；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-gb-ai --wait --timeout 540`（逾時再跑一輪），不要用結束回合當等待。標題要是自足的一句結論。
