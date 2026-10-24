# 任務：調 tactical AI 的佔位係數與評分，讓 skirmish 20 輪內 Wait 比例 < 50% 或分出勝負；並讓 AI 的敵我判斷跟 slot 同盟走

> 領導 `lead-fix-scenario-ai` 寫給 codex 工人 `cx-fix-ai`。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`test/README.md`；spec 讀 `wf/workflows/planning/specs/core/ai.md`（候選生成、估值、want）與 `rules-attack-resolution.md`（十分律／常規兵器係數那段）；背景讀 `wf/workflows/dispatch/handoffs/lead-impl-sim/REPORT.md` 的「判斷」段——親自讀。

## 背景與唯一目標

`npm run sim -- --scenario scenario/skirmish-whitegloves --seed N` 在 seed 1–5 全部 20 輪時限平手、0 死亡：160 個單位回合有 160 次 Wait（每個單位每回合都先 Wait 到隊尾、再 End），整場只出手 19 次。原因推測是 `src/ai/score.ts` 的 `DEFAULTS` 佔位係數（`waitScore: 0.02`、`endScore`、`dangerK: 0.05`、`reposition`、`moveCost`…）讓「Wait」比「靠近／開火」分數高，外加十分律把預估傷害壓得很低。唯一目標：**只改 AI 係數與評分**，讓下面的量測判準過。

附帶一件小事（同一批檔）：另一條工人線 `cx-fix-seams` 正在讓 rules 支援 slot 同盟，並在 `RulesQuery` 加**可選**方法 `hostileSlots?(s, a, b)`。AI 裡用 `owner !== slot` 判敵人的地方要改成走它。

## 量測判準（領導已寫好量測腳本，照用，不准改它）

`node wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5`

每行一個 seed 的 JSON：`waitRatio`＝wait 指令數／單位回合數（TurnEnd 數），`winner`、`reason`、`hits`、`deaths`、`pass`（`waitRatio < 0.5 || winner !== null`）。**改前基準**（領導 2026-10-24 實測）：5 個 seed 全部 `waitRatio: 1`、`winner: null`、`deaths: 0`、`pass: false`。**過關＝5 個 seed 全部 `pass: true`**。另跑一次 seed 6–10 只記錄、不要求過。

## 範圍（排除法寫死）

- 只寫：`src/ai/` 底下除了 `rules-query.ts` 與 `adapters/` 以外的檔；`content/base/aiprofiles/*.json` 的 `params` 數值；`test/ai/`；你的 REPORT 與 `wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-ai/` 底下的附件。
- 不做：`src/rules/`、`src/sim/`、`src/core/`、`src/ai/rules-query.ts`、`src/ai/adapters/`（`cx-fix-seams` 同時在寫）；`content/base/` 其他目錄（**不改地圖、情境、機體、武器、規則常數**，不給 skirmish 情境加 `ai` 欄）；`test/sim/`、`test/scenarios/`、`measure.ts`；`src/ops/`、`src/ui-adapter/`、`package.json`、lock、spec。**不准為了過判準改測試佈置、地圖或規則**；十分律若看起來不合理，只寫進 REPORT，不改規則。
- 件數 gate：修改＋新增的檔合計超過 12 個就停下回報；容量 gate：本線 diff 超過 60 KB 就停下回報。

## 工作

1. **同盟敵我（先做，小）**：在 `src/ai/` 加一個 helper（例：`isHostileSlot(q, s, a, b)`＝`q.hostileSlots ? q.hostileSlots(s, a, b) : (a === "berserk" || b === "berserk" || a !== b)`），把 `score.ts`（move 的 enemies、`forceRatio`）、`strategy.ts`（enemies）、`danger.ts`（危險來源）裡以 `owner !== slot`／`=== slot` 判敵友的地方改走它；`knowledge.ts` 的可見集合不改（看得見盟友沒關係）。`RulesQuery` 上的 `hostileSlots` 在你開工時可能還不存在——**用 `(q as { hostileSlots?: … }).hostileSlots` 之類的可選存取寫，不要等它**，也不要去改 `rules-query.ts`。加 1 個測試（stub 提供 `hostileSlots` 讓兩個 slot 互盟 → danger／strategy 不把盟友當敵人）。
2. **量基準**：跑量測腳本確認與上面的基準一致；找出 Wait 勝出的原因（印幾個單位回合的候選分數，寫成你自己的臨時腳本，放 `/tmp/cx-fix-ai/`，不進 repo）。
3. **調係數與評分**：改 `score.ts` 的 `DEFAULTS` 數值與評分式（例：Wait 只在「等一下更好」時才有分、靠近敵人的 move 要贏過原地 Wait、命中率×預估傷害的尺度）。可以改 `tactical.ts` 的候選生成。`waitScore`、`dangerK` 的語意若要改，寫在 REPORT。係數維持「`DEFAULTS` 可被 aiprofile `params` 覆蓋」的既有模式。
4. **觀察十分律**：對 skirmish 幾次攻擊比較「AI 預估傷害」與「實際 LayerDamaged」，記錄十分律／常規兵器係數把傷害壓到多少、是否讓攻擊評分系統性過低；結論寫 REPORT（是 AI 估值問題就在 AI 修，是規則數值問題只記不改）。
5. 跑量測過關；跑全套測試；寫 REPORT；回報。

## 測試（寫死；`node:test`＋`node:assert/strict`）

新增 **2 到 4 個** `test()`：1 個同盟敵我（工作 1）；至少 1 個平衡回歸（例：在 `test/ai/` 用 `content/base` 跑 skirmish seed 1 的 20 輪，斷言 Wait 比例 < 0.5 或有勝方——可 import `src/sim/run.ts` 的 `scenarioToSetup`／`runBattle`，但不改它）。既有 `test/ai/` 測試只准因評分改動而**修改斷言數值並在 REPORT 逐條說明為什麼**，不准刪、不准放寬到失去意義。

跑法（專案根）：`node --test --test-isolation=none --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'`（沙箱內計數可能不準，最終由領導在沙箱外重算）；`npm run check`；`npm run typecheck`。`src/rules/`、`test/sim/` 若因 `cx-fix-seams` 進行中而紅，不是你的事、不改。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/measure.ts …` | 工作 2、5 的量測（唯一判準來源） |
| `wf/tools/inbox_poll.sh cx-fix-ai --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報（正文給你的 REPORT 檔） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑；可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim`。**不要 commit**：commit 與計數驗收由領導在沙箱外做；你在 REPORT 列出檔案清單。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不刪任何檔（不 `rm`、不 `git rm`）；暫存放 `/tmp/cx-fix-ai/`；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個。

**分清錯誤來源**：node 跑不了 `.ts`、沙箱拒寫 → 發 `BLOCKED`；沙箱內計數不準不算阻塞；你自己的程式或測試錯 → 自己修。調了 3 輪以上仍過不了判準 → 不要硬湊，發 `FAILED` 並在 REPORT 寫你看到的根因（是不是規則面的問題）。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-ai/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| AI 修改 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ai/` |
| 測試 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/ai/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-ai/REPORT.md` |

REPORT 四段（做了什麼／產出（改、增的檔清單）／沒做到或證據不足的／需要決定的事），加「Wait 勝出根因」、「係數前後對照表」（鍵、舊值、新值、理由）、「量測前後表」（seed 1–10 各一列：waitRatio、winner、reason、hits、deaths）、「十分律觀察」，末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. `node wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/measure.ts scenario/skirmish-whitegloves 1 2 3 4 5` 五行全部 `"pass":true`（領導重跑）。
2. 沙箱外 `npm test` 中 `src/rules/`、`test/sim/` 以外 0 fail，且本線新增 2–4 個 test；`npm run check` 0 errors；`npm run typecheck` exit 0（領導重跑）。
3. `git diff --stat` 中本線改動只落在 `src/ai/`（不含 `rules-query.ts`、`adapters/`）、`content/base/aiprofiles/`、`test/ai/`。
4. `grep -rn "owner !== ctx.slot\|owner !== slot" src/ai/score.ts src/ai/strategy.ts src/ai/danger.ts` 0 命中（敵我改走同盟 helper）。
5. REPORT 存在且有四段＋根因＋係數對照表＋量測前後表＋十分律觀察。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（調不過判準、或改壞既有行為修不好）→ 保留改動，發 `FAILED`，REPORT 附量測輸出與根因判斷。
- **測不出來**（沒跑成）→ 不回滾、保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fix-ai`。本線團隊：`teams/fix`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-fix-ai --up PROGRESS '開工' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-fix-ai --up DONE '本線結論一句話' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-ai/REPORT.md`（`DONE` 依實況換成 `FAILED`／`BLOCKED`／`NEEDS-USER`，標題換成你的結論）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
