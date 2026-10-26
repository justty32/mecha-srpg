# 已讀清單

親自讀取主 repo `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，以及 worktree 的 `AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`wf/workflows/planning/specs/core/ai.md`。以 tabledb 查驗證表第 0、3、5、6、9 列與 code-map 的 ai 列。
完整讀取 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-plan/PLAN.md` 及 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/cx-en-ai.md`；另讀 WORKFLOWS、SESSION-LOG、WAIT_USER、dev-env、data-files、inbox README／PROTOCOL，依步驟輪詢 orders。沒有派子代理。

## 做了什麼

新增 `src/ai/support.ts`：共用現有三個固定 seed 的 preview 差值，計算實際增閃、治療及有需求的池卸載，採最大 tactic 係數並扣施放成本；沒有額外模擬攻擊。protect 移除護衛指派硬閘，指派改作受益目標加權；escape 納入原地防護，零收益支援不可由 objectiveMove 救回。攻擊增益保留舊公式，混合招取較大者。以實際戰鬥 roleAttr 合計機體與指令權者屬性，避免 evalNum 只讀人物而漏算機體增閃。
支援成功後記 actor／round／ability，Wait 重入也不再提出；異名 refresh 效果依實際差值歸零。berserk 允許正收益自護，以及有實際新屬性且施放後仍有合法攻擊的 self buff。tactical 增加最多 maxSupportMoves 個低成本合法支援格；sentinel／regroup／swarm 回防／回巢加不移位支援。補 AI spec 各一小段，八招依獨立 A/B 決定分類。
沒有改 rules／ops／sim／UI／MCP／core、能力數值、profile 參數、黃金期望；沒有 commit。flee／scripted 保持原策略。code-map 由領導同步。`node_modules` 原有未追蹤符號連結未動。

`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-engine-next/wt-ai status --short` 原文：

```text
 M content/base/abilities/kx-bell-borer-close.json
 M content/base/abilities/kx-drowned-grove-veil.json
 M content/base/abilities/kx-dusk-fold-withdraw.json
 M content/base/abilities/kx-hinge-crab-shelter.json
 M content/base/abilities/kx-hollow-sail-fold.json
 M content/base/abilities/kx-lantern-keel-gather.json
 M content/base/abilities/kx-reef-antler-brace.json
 M content/base/abilities/kx-shelf-back-shelter.json
 M src/ai/adapters/rules-adapter.ts
 M src/ai/agent.ts
 M src/ai/policies/berserk.ts
 M src/ai/policies/regroup.ts
 M src/ai/policies/sentinel.ts
 M src/ai/policies/swarm.ts
 M src/ai/policies/tactical.ts
 M src/ai/rules-query.ts
 M src/ai/score.ts
 M test/ai/score.test.ts
 M test/ai/stub-rules.ts
 M test/ai/tactics-coverage.test.ts
 M wf/workflows/planning/specs/core/ai.md
?? node_modules
?? src/ai/support.ts
?? test/ai/support.test.ts
```

## 產出

交付目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-engine-next/ai-01`。`after-buff.json`、`after.json` 保留 38 招 totals、18 個支援需求對照、skirmish 與 probe 摘要；每份記原始完整 stdout SHA-256、152 情境／304 場來源，完整 stdout 留在 `/tmp/cx-en-ai/`。以緊湊 JSON 保持單一新交付檔小於 25 KB。另有 `ab.json`（wf-table/1）。

驗證：`npm run check` 最後為 `OK 0 errors, 10 warnings`；`npm run typecheck` exit 0；`node --test test/ai/support.test.ts` exit 0。支援測試實際 9 項，全綠，涵蓋固定前五項及合法性／支援站位／回防限制；AI 共 18 檔全綠。沙箱 node --test 以每檔 1 項計數，以 exit code 為準。最終 npm test：# tests 153；# pass 149；# fail 4；exit 1，紅檔如下（依 orders 例外處理）。

38 招使用次數／出手機會（修前 baseline.json 對照最終 after.json；機會是成功行動的不同 round，並非合法可施放次數）：

|能力（ability/）|修前 使用／機會|修後 使用／機會|
|---|---:|---:|
|ax-brinemother-brood|0/27|0/27|
|ax-lotus-reborn|0/32|0/32|
|ax-plumed-featherwind|0/32|0/32|
|ax-psychopomp-procession|0/27|0/27|
|ax-skybearer-hold-sky|0/22|0/22|
|ax-skybearer-unburden|0/22|0/22|
|ax-watchhorn-bifrost|0/21|0/21|
|ax-watchhorn-gjallarhorn|0/21|0/21|
|cx3-call-the-tide|12/32|12/33|
|kx-bell-borer-close|26/80|28/80|
|kx-brood-call|22/81|23/80|
|kx-carapace-brace|0/75|28/82|
|kx-drowned-grove-veil|8/24|8/24|
|kx-dusk-fold-withdraw|18/51|23/72|
|kx-hinge-crab-shelter|28/76|30/79|
|kx-hollow-sail-fold|30/68|30/72|
|kx-lantern-keel-gather|29/75|29/77|
|kx-mirror-turn|0/71|36/77|
|kx-reef-antler-brace|17/75|27/76|
|kx-shelf-back-shelter|30/78|30/80|
|kx-shell-ear-hush|18/90|18/91|
|kx-shield-raise|0/80|38/82|
|kx-split-fin-swerve|7/79|20/77|
|kx-spore-shroud|0/76|28/84|
|kx-star-howl|19/76|18/72|
|kx-storm-mane-rise|18/84|22/82|
|kx-surf-runner-skip|9/96|26/85|
|m2-relieve-ally|44/347|21/347|
|mx-anvil-roar|4/33|4/32|
|mx-ash-screen|37/237|72/234|
|mx-aurora-veil|18/64|24/62|
|mx-flare-dodge|47/86|47/89|
|mx-guard-stance|36/97|44/94|
|mx-moonless-command|7/22|5/27|
|mx-old-city-wall|29/199|34/199|
|mx-tide-leap-up|30/97|44/96|
|mx-white-night-fade|3/32|12/32|
|rearguard-oath|0/30|0/30|

六台卸燼支援機；每格是兩 seed 合計的第一輪 m2-relieve-ally 使用次數：

|機體|修前高燼／低燼|修後高燼／低燼|
|---|---:|---:|
|frame/cn-yoke-i|0/0|1/0|
|frame/innersea-lantern|0/0|2/0|
|frame/ix-porter-ii|0/0|2/0|
|frame/ix-wain-01|2/2|2/0|
|frame/league-gantry-02|2/2|2/0|
|frame/league-last-ferry|0/0|2/0|

八招 A/B：每次只將該一招由 buff 換原分類，其餘七招保留 buff；同引擎、同 seeds／載體／情境。空放為相同滿血零威脅快照的首選使用次數；重放為同效果已存在的真 preview 對照，兩種分類皆為 0。

|能力|buff 使用／機會|原分類 使用／機會|無威脅 buff→原|決定|
|---|---:|---:|---:|---|
|kx-bell-borer-close|28/80|28/80|0→0|protect|
|kx-drowned-grove-veil|8/24|8/24|0→0|protect|
|kx-dusk-fold-withdraw|23/72|23/72|0→0|escape|
|kx-hinge-crab-shelter|30/79|30/79|0→0|protect|
|kx-hollow-sail-fold|30/72|30/72|1→0|escape|
|kx-lantern-keel-gather|29/77|29/77|0→0|protect|
|kx-reef-antler-brace|27/76|27/76|0→0|protect|
|kx-shelf-back-shelter|30/80|30/80|0→0|protect|

skirmish 五 seed（原 CLI）：

|seed|waitRatio|pass|winner|
|---|---:|---|---|
|1|0|true|player|
|2|0|true|player|
|3|0|true|player|
|4|0|true|player|
|5|0|true|player|

bench 同一指定命令 500：改前 **3.54 ms／步**；改後 **4.6 ms／步**，比率 1.299，門檻 4.602 ms／步，通過。改後 hash `7a4b6f110edbde0a`。

`npm run fuzz -- --runs 60 --mode mix --seed 1`：exit 0；場數 60/60; 模式 {"ai":20,"random":20,"scenario":20}; 耗時 181541 ms; 硬違規場數 0

紅檔與一行證據：

- `src/mcp/cli.test.ts`：socket server 子行程未輸出 ready 即退出，assert ready=false（沙箱 spawn 例外）。
- `src/mcp/e2e.test.ts`：server 提前退出 0，無 stdout／stderr（沙箱 spawn 例外）。
- `src/ops/content/worldgen.test.ts`：spawnSync node EPERM（沙箱 spawn 例外）。
- `src/ops/sim/health.test.ts`：encounters-outside-0.1..0.4；依 16:06 orders 比照黃金。

`test/golden/`、`test/campaigns/`、`src/ops/sim/fixtures/` 對應測試未紅，未重錄。grid-health 的 HEAD AI 原版副本測試 exit 0；原版與最終版同 greedy seed 1、12 月量測如下：

```text
greedy seed=1 months=12 end=none blight12=5.30% maxGrowth12=0.42% maxGrowth13..24=0.00% actors=79..115 encounters=37/114=0.3246/sailing-day maxDaily=1 cash=1200.00->30206.56 cashMean13..24=0.00 PASS
greedy seed=1 months=12 end=none blight12=5.93% maxGrowth12=0.58% maxGrowth13..24=0.00% actors=91..161 encounters=72/112=0.6429/sailing-day maxDaily=1 cash=1200.00->30308.56 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
```

## 沒做到或證據不足的

沙箱內無法取得 spawn CLI 三檔的有效端到端證據；領導 15:56 orders 已排除並接手沙箱外重跑。grid-health 的遭遇率隨 AI 軌跡改變而紅，領導 16:06 orders 指定比照黃金，不改門檻、不為它調 AI。沒有把這四個紅檔宣稱全綠。沒有重錄黃金或跑 Playwright e2e／wf-lint；後兩項由領導執行。
兩 seed 是診斷樣本，不能當長期勝率估計。古代招零次仍可能受共鳴或合法性限制，沒有為保證使用而改能力條件。依 Voff 裁示，純攻擊增益仍沿用舊估值，本線沒有宣稱已解決其所有需求辨識。

## 需要決定的事

G（species profile params 併入一般評分）依領導裁示不做：現況仍只把物種 policy 帶入，params 主要來自 slot；未來若採 `{...species.params,...slot.params}`，會改變全部怪獸的 attack／band 等行為，應獨立評估與量測，不能混在本線支援收益。
領導接手 code-map 同步、沙箱外 npm test，以及合併另一條線後的黃金／grid-health seed 處理。本線五條驗收以交接書及兩則 orders 為準，沒有新增條目；其餘沒有待使用者選擇。

## 以後交接書該點名的工具

保留 measure-support.ts、bench-ops.ts 與 tabledb；同時說明量測 JSON 可交付小於 25 KB 的驗收摘要（保留原始 stdout hash），避免完整 240 KB 輸出與新檔 gate 衝突。點名 RulesQuery.roleAttr：evalNum 的 self.attrs 在有人物時只看人物，不能代表機體＋人物的實際戰鬥屬性。另預先點名沙箱 spawn 三檔的例外與 grid-health 的軌跡處理方式。
