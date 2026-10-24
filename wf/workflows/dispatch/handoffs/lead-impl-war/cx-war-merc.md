# 任務：實作傭兵參戰契約（切線 3：ops-merc）——join 契約、合編與指揮權、勢力補給、借機、選邊與背叛、作戰情境生成與回寫、merc 政策

> 領導 `lead-impl-war` 寫給 codex 工人 `cx-war-merc`。**交接書是唯一契約**：沒寫的授權等於沒有；沒寫的禁區等於允許。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/feature-dev/README.md`、`wf/workflows/testing.md`（及 `testing-checks.json`）、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`——**親自讀**。spec（`wf/workflows/planning/specs/ops/`）：`mercenary-contracts.md`（全篇，主契約）、`battle-interface.md`（情境生成第 7 步與回寫）、`data-model-operations-war.md`（「玩家參戰的那一場」）、`data-model-diplomacy.md`（「對作戰生成的影響」「與 core 戰場陣營的銜接」）、`diplomacy-drivers.json` 的 `player-join`／`player-betray`／`player-shell` 三列、`war-testing.md`（「單元・參戰」與黃金 (2)(3)）、`data-model-factions-contracts.md`（`kind:"join"`）。前一條線的成果：`wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-core/REPORT.md`（作戰核心與外交的 API、hook、SPEC-GAP）。程式：`src/ops/war/`（全部）、`src/ops/contracts/`、`src/ops/sortie/`、`src/ops/sim/policies.ts`、`src/ops/state/types.ts`、`src/sim/run.ts` 的 `scenarioToSetup`（`slots[].allies`、unit id 怎麼產生）。

## 背景與唯一目標

勢力作戰已能自己跑（`cx-war-core`），但玩家不能參戰。**唯一目標：照 `mercenary-contracts.md` 讓玩家經既有四動詞（看板、接、棄、出戰）接參戰型契約、跟到分遣隊所在區域、在 engage 日打一場戰術戰鬥，戰果回寫作戰進度與友軍折損，並在 aftermath 結算薪酬、聲望與外交連帶；不加新動詞、不加房間。**

## 設計（領導定，照做；細節可微調，偏離寫進 REPORT）

1. **hook 填實**：`src/ops/war/merc-hook.ts` 三個函式是給你填的（`onMuster`、`playerEngages`、`onOperationEnd`），呼叫點已在 `war/operations.ts`；除非 REPORT 說明理由，不改 `operations.ts`。參戰邏輯放新檔 `src/ops/war/merc.ts`（必要時再拆 `merc-supply.ts`、`merc-settle.ts`）。
2. **契約型別只加可選欄**：`ContractTemplate.kind` 加 `"join"`、模板可選 `join?: JoinTerms`；`ContractState` 可選 `operation?`、`side?`、`loans?`、`violations?`；`Sortie.trigger` 加 `"operation"`、可選 `operation?`。join 模板是新內容檔 `content/base/world/contracts/op-join-*.json`（先 `ls content/base/world/contracts/`，**`join-faction-front.json` 是別線的檔，不要改、不要撞名**）。
3. **發約**：`onMuster` 在 `def.merc` 有值的作戰進 muster 時發 `join`，上限 `merc.slots`，`sides:"both"` 雙方各一份；接受檢查（`rep ≥ minRep`、戰力點 ≥ `minStrength`、不在 `blacklist:勢力id`、`exclusive` 下無對方 join 進行中）放 `merc.ts`，在 `contracts/lifecycle.ts` 的 `cmdAccept` 裡對 `kind:"join"` 呼叫一次（最小改動）。接一份 → 另一份 `expired`＋對方 `memory: refused-us`。
4. **參戰**：`playerEngages` ＝契約 active、作戰在 engage、船與分遣隊同區域（**一律用 `war/loc.ts` 的函式判斷，不直接比 `region`**）→ 寫 `pendingBattle`（`trigger:"operation"`、`operation`、`contract`），回 true。
5. **情境生成第 7 步**：`sortie/scenario.ts` 的 `generateScenario` 在 `trigger:"operation"` 時分支到新檔 `src/ops/sortie/operation-scenario.ts`：敵方（裂獸由裂縫快照；人類由目標勢力分遣隊 `ForceUnit` 經 `ModelDef.frame` 抽 `UnitSpawn`、人物臨時生成或無座位 AI 機）、友軍依 `command`（independent→`ally` slot、`allies` 雙向；attached→1–3 台放進 `player` slot；mixed＝兩者）、友軍規模＝分遣隊戰力 ×0.3..0.6、玩家 `win` 目標＋`orders`（optional）＋敵方 eliminate。戰場陣營映射照 diplomacy「與 core 戰場陣營的銜接」。**`BattleResult.units` 已涵蓋所有 slot（領導查過 `src/rules/flow.ts` `battleResult`）**，不必改 core；請寫一條測試證明 ally 單位出現在結果裡。
6. **回寫**：`sortie/apply.ts` 在 operation 分支呼叫新函式（放 `war/merc.ts`）：勝→`progress += 0.4 × 規模係數`、敵 `enemyStr` 依死亡單位折算；敗→`morale −1`；ally／attached 的 `dead` 寫回 `force.units` 折損；軍令判定 `violations`；殼在玩家手上→`ShellState.holder:"player"`（私吞）。
7. **補給四檔**：照 spec 表；全部是營運層效果、全走 `post`／`techHours`／`Sortie.injected`，`reason` 標 `faction-supply`／`join-pay`／`loan-loss`，`ref` 指來源事件（`AllySupplied`、`OperationResolved`）。三條帳本守恆照跑。借機＝臨時 `MechState` 進機庫位、契約結束必還；還機後 `inventory.mechs` 不含借來的機（加進 `sim/invariants.ts`）。
8. **結算與外交**：aftermath（`onOperationEnd`）照 spec 公式算 `pay`、扣項、rep；`player-join`、`player-betray`、`player-shell` 三列驅動；背叛三形狀（exclusive 擋在 accept；`drop` 後 ≤ 7 天接對方＝`Betrayed`；私吞）；`blacklist:勢力id` 旗 3 潮月；代理戰爭曝光機率。
9. **`merc` 政策**：`src/ops/sim/policies.ts` 加 `merc`（`PolicyName` 擴充，CLI `--policy merc` 可用）：有 pendingBattle 就全員出戰；有 active join 就 `sail` 到分遣隊區域；否則接最近的 join；違令隨機（用 RNG 快照，不改 state，照 `random` 政策的做法）；沒有 join 可接時退回 greedy 行為。
10. **CLI**：`cli.ts` 每潮月那行的 `join=` 改成真的玩家 join 累計數。

## 範圍（排除法寫死）

- 只做：`src/ops/war/merc-hook.ts`、`src/ops/war/merc*.ts`（新）、`src/ops/sortie/{scenario,apply,validate}.ts`（只加 operation 分支）、`src/ops/sortie/operation-scenario.ts`（新）、`src/ops/contracts/lifecycle.ts`（只在 `cmdAccept`／`cmdDrop` 加 join 分支）、`src/ops/state/types.ts`（只加可選欄與 union 成員）、`src/ops/sim/{policies,cli,invariants}.ts`（只加）、`content/base/world/contracts/op-join-*.json`（新）、單元測試 `src/ops/war/merc*.test.ts`、`src/ops/sortie/operation-scenario.test.ts`。
- **`src/ops/sortie/run.ts` 不要改**（裡面有 lead-ui-ops 未提交的 `sortieBattleSetup` 段）；真的非改不可就停下發 `BLOCKED` 說明。
- 不做：研發（`war/rnd.ts`、`lineages`／`models` 邏輯、市場篩選、`leakModel`）——那是同時在跑的 `cx-war-rnd` 的領地，**不要碰 `src/ops/war/rnd*.ts`、`src/ops/world/market.ts`**；黃金戰役 `test/campaigns/`（下一條線）；`src/core/`、`src/rules/`、`src/sim/`、`src/ai/`、`src/ui-adapter/`、`src/mcp/`、spec、其他 `content/`。
- 與 `cx-war-rnd` 共用的檔（`src/ops/state/types.ts`、`src/ops/content/check.ts`、`src/ops/sim/cli.ts`）：**只做小塊追加、不重排、不重寫既有行**；看到對方的改動不要動它。
- 件數 gate：程式檔（新增＋修改）超過 20 個就停下回報；容量 gate：程式 diff 超過 100 KB 就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `wf/tools/inbox_poll.sh cx-war-merc --once` | 每完成一個工作步驟跑一次，讀 orders |
| `wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |
| `node src/ops/sim/cli.ts --months 12 --policy merc --seed N` | 參戰迴圈端對端（真戰鬥） |
| `node src/ops/content/check.ts content/base` | 內容加完後 0 錯 |
| `npm test`、`npm run typecheck` | 收尾 |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與你的 REPORT；臨時檔只放 `/tmp/cx-war-merc/`。可跑 `node`、`node --test`、`npm test`、`npm run check`、`npm run typecheck`、`npm run sim:campaign`。**不要 commit**：commit 由領導做；你在 REPORT 列出檔案清單。
- 工作樹裡有別條線未 commit 的改動（含同時在跑的 `cx-war-rnd`）——**不要碰、不要還原**；`npm test` 若因別線半成品紅燈，記下哪些測試、照跑你自己的測試檔與 `src/ops/**`，不算阻塞。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset、不 `git stash`／`git checkout -- 檔名`／`git restore`；不 `rm -rf`；不刪任何檔；不改 `~/.codex/config.toml`；不安裝任何套件；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 1 個（只准為推進正事開）；不上網。

**分清錯誤來源**：沙箱拒寫、node 跑不了 `.ts` → 發 `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞（領導會在沙箱外重跑）。

## 工作

1. 型別、join 模板、發約與接受檢查、選邊；`inbox_poll --once`。
2. 參戰：`playerEngages`、情境生成第 7 步、回寫；`inbox_poll --once`。
3. 補給四檔、借機、結算、背叛、外交連帶；`inbox_poll --once`。
4. `merc` 政策、CLI；跑 12 潮月 merc（seed 1、2、3）；`inbox_poll --once`。
5. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-merc/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 程式 | `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/war/merc*.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/operation-scenario.ts` 與「範圍」列的改檔 |
| 內容 | `/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/contracts/op-join-*.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-merc/REPORT.md` |

REPORT 四段（做了什麼／產出（含完整檔案清單）／沒做到或證據不足的／需要決定的事），另加：對外型別變更表（給 lead-ui-ops／lead-mcp）、新事件清單、`SPEC-GAP` 清單、三個 seed 的 12 潮月 merc 摘要（每潮月一行＋join 次數、勝敗、結算金額）、末尾「以後交接書該點名的工具」。

## 驗收（固定 6 條，一條不多，做完就停）

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` 0 錯。
2. `src/ops/war/merc*.test.ts`＋`src/ops/sortie/operation-scenario.test.ts` 至少 25 項、全綠，涵蓋 war-testing「單元・參戰」每一條（accept 四個拒絕條件、exclusive 下對方 expired、三種背叛各一例、補給四檔對帳本與 techHours、pay 公式與貢獻比）＋ally 單位出現在 `BattleResult.units`＋ally 死亡寫回分遣隊。
3. `npm test`：`src/ops/**` 無新紅燈（別線造成的紅燈列名不算）。
4. `node src/ops/sim/cli.ts --months 12 --policy merc --seed 1`（另跑 seed 2、3）不拋錯，且三個 seed 合計至少 3 次 join 走完 `ContractAccepted(join) → BattleResolved → OperationResolved` 或 `OperationFailed` → `Posted`／帳本 `join-pay`（REPORT 附事件序列摘錄）。
5. idle／greedy 不受影響：`node src/ops/sim/cli.ts --months 12 --policy idle --seed 1` 與 `--policy greedy --seed 1` 不拋錯。
6. `run.ts` 未改：`git diff --stat src/ops/sortie/run.ts` 只顯示 lead-ui-ops 原有的改動（約 11 行增）。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 修；修不好就發 `FAILED`，REPORT 寫證據（不要回滾別線的檔）。
- **測不出來**（沒跑成、拿不到證據）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-war-merc`。本線團隊：`teams/impl-war`。上線先發 `PROGRESS`：`wf/tools/inbox_mail.sh cx-war-merc --up PROGRESS 'cx-war-merc 上線，開始參戰契約' < /dev/null`。
- 終局：`wf/tools/inbox_mail.sh cx-war-merc --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-impl-war/cx-war-merc/REPORT.md`（STATUS 換成實際終局）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論，不可只寫「完成」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。
