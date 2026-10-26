# cx-tune-intent — 帶入低士氣不再造成無交火首輪撤退

STATUS：**DONE**。固定五條驗收完成；第 1 條採「剩餘皆合理」分支。未 commit、未改 ops／規則／內容／黃金、未開子代理、未上網。

## 做了什麼

親讀主 repo AGENTS.md、wf/WORKFLOWS.md、SESSION-LOG.md、WAIT_USER.md、feature-dev/README.md、testing.md 與 testing-checks.json 相關列、common/conventions.md、common/code-map.md 與 code-map.json 的 ai 列、common/user.md、common/data-files.md、dev-env.md、inbox/README.md 與 PROTOCOL.md；另讀指定 mechanics.md 裁示及三份前線 REPORT。除頂層檔外，上述路徑均在 wf/workflows/ 下。交接書與 orders 亦依規輪詢；上線 PROGRESS 已送。

在 HEAD b95dcd4 的指定 worktree 重跑正式基準。根因是 **individualRetreat 對進場已有 breaking 士氣立即回 true**，並蓋過 regroup；不是 intentMinRound=8 的陣營撤退。追蹤中 mech-8 HP 183.42/408、mech-10 HP 98/180，皆高於 pilotFleeHp=0.2；駕駛 HP 60/60。pilotFleeHp 實際比較的是機體層 HP，名稱不代表人物 HP。營運出口靠近部署區使離場更快，但不是本次需要修改 ops 的根因。

新增共用 individualRetreatReady：預設第 3 輪以前，帶入傷勢／低士氣不能單憑舊狀態自行撤退；本場受敵方 Hit／Miss、正量 LayerDamaged，或人物士氣轉入 breaking／fleeing 時可提早撤。判斷接到個體撤退、fleeing 策略接管與戰術撤退評分，避免只修一條分支。明示 flee 策略、陣營撤退、護送目標出口與 berserk 的既有語意保留。門檻為 SPEC-GAP 的最小策略實作，未改 spec。

### 根因表

場次皆為 seed 3；n 是原版 r1-probe 的第 n 個符合者。各場撤退前均無敵火／本場士氣變更；trace 確認帶入 breaking 直接觸發個體撤退。

| 模板 | 場次／n | 誰撤 | 觸發條件 |
|---|---|---|---|
| scout-rift-margin | sortie-123／5 | mech-8、10 | 帶入 breaking |
| escort-sealed-convoy | sortie-128／7 | mech-8、10；escort-2 | 前二者 breaking；護送者完成出口 |
| clear | sortie-189／17 | mech-8、10 | 帶入 breaking |
| defend-citywall | sortie-215／22 | mech-8、10 | 帶入 breaking |

重現：在工作樹跑 `node wf/workflows/dispatch/handoffs/lead-tune/tools/r1-probe.ts 3 N`（N=5、7、17、22；基準程式）。原始證據 `/tmp/cx-tune-intent/probe-3-{5,7,17,22}.log`、`trace-3-*.log`；唯讀追蹤入口 `trace.mjs`。另按指定跑過 `r1-probe.ts 1 2`，該 seed 基準只有一場符合者，因此該次未印第 2 場，未冒充有效探針。

### 參數表

| aiprofile params 鍵 | 舊值→新值 | 意義 |
|---|---|---|
| individualRetreatMinRound | 無→3 | 無本場壓力時最早自行撤退輪；設 1 可恢復首輪判斷 |
| pilotFleeHp／individualFleeHp | .2／.25→不變 | 人類／怪獸機體層 HP 比例門檻 |
| intentMinRound | 8→8 | 陣營意圖撤退最早輪數 |

唯一新增門檻在 retreat.ts 的 DEFAULTS，併入 intent.ts 的 DEFAULTS；只接受數字覆寫，未改任何 aiprofile。

### 前後數字表

營運：greedy seed 1–5，各 12 潮月，五個獨立行程，原版 ops-tally／ops-sum。

| 指標 | 正式基準 | 最終 |
|---|---:|---:|
| 出戰數 | 89 | 61 |
| 勝 | 29 | 30 |
| 擊退 | 6 | 6 |
| 撤退 | 54 | 25 |
| lost／timeout | 0／0 | 0／0 |
| withdrewR1 | 48（53.93%） | 7（11.48%） |
| 平均輪數 | 354/89＝3.98 | 355/61＝5.82 |
| anchored 出戰／勝／撤退 | 4／0／4 | 0／0／0 |
| anchored 首輪撤／巢母命中 | 4／0 | 0／0 |

**原始 withdrewR1 並未低於 10%；七場逐場解釋如下，依驗收的例外分支通過。** seed 1 sortie-92 及 seed 3 sortie-128、130、146、158：首輪只撤了各場 escort-2，屬正常護送出口；名冊機體沒有首輪撤。seed 4 sortie-94 的 mech-9 先被 enemy-1 射擊 Miss，sortie-97 的 mech-8 先被 enemy-1、2 射擊 Miss，才自行撤離，屬實際受火後的求生。排除護送對象後，實際首輪機體撤退為 2/61＝3.28%，皆有敵火證據。

殘餘證據 `/tmp/cx-tune-intent/residual-seed{1,3,4}.log`；重現 `node /tmp/cx-tune-intent/residual-probe.ts SEED 1`。此診斷副本只移除原工具「只印第 n 場」上限並加入模板，未改規則或戰果分類。escort-sealed-convoy 的 escort 是 optional，仍需 survive 6 輪；護送者離場不等於整個契約勝利，沒有把分類當作 ops bug 修。

戰鬥：指定 psweep 實際枚舉 **26 情境×5 seed＝130 場**，交接書的 24 情境是文字落差；基準與最終均採同一工具與同一組情境，未追加別組驗收。

| 指標 | 正式基準 | 最終 |
|---|---:|---:|
| timeout 平手 | 10/130＝7.69% | 10/130＝7.69% |
| 平均輪數 | 12.45 | 12.45 |
| player／ally／enemy／third 勝場 | 66／27／25／2 | 66／27／25／2 |
| 勝方比例（排除平手） | 55%／22.5%／20.83%／1.67% | 同左 |
| rift-edge-nest 玩家陣營勝 | 4/5（ally） | 4/5（ally） |
| 逐場結果與 hash 有變 | — | 0/130 |

rift 玩家陣營沿前線口徑含 ally；原始 winner 是 ally 4、enemy 1，並非 player 4。四數字均達標，最大單一勝方 55% <70%。

固定五條驗收：

1. 七場剩餘首輪撤退已逐場分類，均為護送出口或受敵火；採合理例外分支。
2. sweep timeout <10%、平均 10–16、rift 玩家陣營 ≥3/5、任一勝方 <70%，全部通過。
3. 恰新增 3 條測試：進場重傷／低士氣與護送出口、首輪本場壓力與友軍出手區別、params 貫穿策略與評分；修改前跑這三條全部 AssertionError（3 fail），修改後全部過，反證見 red-base.log。
4. `node --test --test-isolation=none test/golden.test.ts test/ai/*.test.ts`：105 pass、0 fail、exit 0。六個黃金 combat-conduct／combat-layers／combat-tenth／people-berserk／people-capture／people-eject 全不變；`npm run typecheck` exit 0。未設 GOLDEN_UPDATE。
5. 本 REPORT 有四段、根因表、參數表與前後數字表；最終資料已存到指定目錄。

## 產出（改動檔清單）

程式工作樹：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-intent`。

- src/ai/retreat.ts：共用進場觀察門檻與本場壓力辨識。
- src/ai/intent.ts：個體撤退使用共用門檻，匯入 DEFAULTS。
- src/ai/agent.ts：fleeing 策略接管套用門檻及 params。
- src/ai/score.ts：撤退評分帶入目前單位。
- test/ai/intent.test.ts：新增上述 3 條測試。
- test/ai/agent.test.ts：既有 fleeing 接管測試改在第 3 輪。
- test/ai/score.test.ts：既有 breaking 評分測試加入首輪門檻與覆寫。

程式與測試 diff **7 檔、11,099 bytes**，未觸發 12 檔／60 KB gate。開工已有 untracked node_modules 與 handoff 工具，未計為本線新增。

正式產物目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-intent/`，含本 REPORT、`ops-final-seed1.jsonl` 至 `ops-final-seed5.jsonl`、`sweep-final.jsonl`。

基準與測試證據在 `/tmp/cx-tune-intent/`：ops-base-seed{1..5}.jsonl、sweep-base.jsonl、red-base.log、suites-final.log、typecheck-final.log。最終來源自 v1 量測啟動後未再修改；其後僅修正既有測試的 round=0 fixture，並重跑最終測試與型別檢查。

## 沒做到或證據不足的

營運出戰 89→61，anchored 4→0；不能宣稱 anchored 勝率改善，也沒有同一凍結戰場的反事實比較。營運路徑會隨戰果改變，未加驗交接書以外的經濟、派遣或 anchored 專案。仍有 25 場撤退；本線只處理首輪無本場壓力的立即離場，沒有取消後續求生。

新增門檻是有限觀察期，達第 3 輪可因仍然帶傷／低士氣而撤，並非永久禁止舊傷撤離。沒有改 ops 的部署、出戰人選或士氣恢復。戰鬥既有 10 場 timeout 保留，總比例已達標，不另開修正。

## 需要決定的事

無新增授權需求。交領導整合未提交的 7 檔；anchored 無最終樣本與營運出戰數下降已明列，未另開工作或擴充驗收。

以後交接書該點名的工具：Node registerHooks（唯讀追蹤判斷）；r1-probe 宜支援一次列出全部符合者及只計名冊機體的首輪撤退，避免護送出口混入 withdrewR1；psweep 的情境數應由內容枚舉結果記錄。
