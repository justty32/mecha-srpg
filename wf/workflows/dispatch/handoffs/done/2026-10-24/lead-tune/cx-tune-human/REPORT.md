# cx-tune-human — 第二輪：default 全機庫遭遇調整完成

STATUS：DONE。2026-10-24 15:57 上線、16:06 完成量測（Asia/Taipei），60 分鐘內交付。基底 `b95dcd4`，未 commit。本報告取代第一輪 REPORT；以下證據全部為第二輪重新執行。

## 做了什麼

從第一輪六檔現狀調整名額，玩家改用 default 開局的完整三台 C 級機庫，依正式 greedy 的 allUnits 派員。最終六份各勝 3–8 場，合計 **37/60（61.7%）**；原始 HEAD 編成在相同玩家隊下為 **16/60（26.7%）**。第一輪單敵機編成在此隊伍下為 60/60，見 [start-round2.jsonl](start-round2.jsonl)。

玩家組成與實際開局配裝：

- `mech-10`：C 級 `frame/hound-mk2`；`person/ren-kasai` 駕駛、`person/glove` 機魂；右武器 `component/autocannon-30`。
- `mech-8`：C 級 `frame/moji-tern-guard`；`person/chen-xiaohai` 駕駛；右武器 `component/autocannon-30`、左武器 `component/arc-emitter`。
- `mech-9`：C 級 `frame/moji-tern-guard`；`person/ilse-brandt` 駕駛；配裝同 mech-8。

default 名冊共七人，依 greedy 座位分配實際登機三名駕駛與一名機魂，其餘留船。使用 `fixture()` 內的 `newCampaign(start/default, 7)` 建構完整初始狀態，將出戰清單替換為 greedy 的完整派員結果；保留 fixture 的契約、節點與營運 RNG。契約目標沿用人類遭遇測試的 eliminate 組法。

量測經 `sortieBattleSetup` 呼叫 `generateScenario`，並套用正式營運 prepareSetup 的實際武器、部位、資源、人物與控制模式，避免直接 scenarioToSetup 取到 frame 的預設配裝。部署位置由 `scenarioToSetup(..., seed)` 決定，戰鬥由 `runBattle(..., seed)` 執行，seed 為 1–10；前後方法完全一致。勝方為 player 算勝，包括對方撤退形成的玩家勝利。

前後數字表（「舊」為 HEAD `b95dcd4`；各列十場，平均輪數含勝敗）：

| 遭遇 | 舊編成 → 新編成 | 舊勝 → 新勝 | 平均輪數：舊 → 新 |
|---|---|---|---|
| league-blight-checkpoint | D×3 → D×4 | 10 → 6 | 10.2 → 13.7 |
| rival-anvil-carcass | C×3 → C×3 | 6 → 6 | 12.4 → 12.4 |
| rival-saltgull-ambush | C×4 → C×2 | 0 → 8 | 11.2 → 10.3 |
| selene-whiteglove-audit | C×3＋B×1 → D×1＋C×2 | 0 → 6 | 13.3 → 12.8 |
| smuggler-farside-ship | A×4 → A×2 | 0 → 8 | 10.5 → 9.9 |
| tide-unshacklers | B×5 → D×3 | 0 → 3 | 12.5 → 12.2 |

檢查站原始 D×3 對完整機庫過弱，依勝率目標增至 D×4；鐵砧恢復原始 C×3 即達標。白手套追加既有 IX-01，沿用白手套原駕駛池；解拘者使用第一輪追加的長槍 V1。鐵砧與鹽鷗保留第一輪追加的 D 級條目，但目前沒有 D 級名額，不會抽出。其他原有機體與配裝保持原值。

固定四條驗收：

1. `node /tmp/cx-tune-human/human-bench.ts`：直接讀工作樹六份實檔，無候選覆寫參數；**6、6、8、6、8、3 勝，37/60，pass:true，exit 0**。逐 seed 勝方與輪數見 [before-round2.jsonl](before-round2.jsonl)、[after-round2.jsonl](after-round2.jsonl)。
2. `node --test --test-isolation=none src/ops/sortie/encounter.test.ts`：**14/14 通過，exit 0**，見 [encounter-final-round2.log](encounter-final-round2.log)。
3. `npm run check`：開工與最終均 **0 errors, 12 warnings，exit 0**，見 [check-before-round2.log](check-before-round2.log)、[check-after-round2.log](check-after-round2.log)。
4. 本 REPORT 已覆寫為第二輪版本，包含四段與前後數字表。

## 產出（改動檔清單）

工作樹：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-human`。下列六檔均位於其 `content/base/world/encounters/`：

- `league-blight-checkpoint.json`
- `rival-anvil-carcass.json`
- `rival-saltgull-ambush.json`
- `selene-whiteglove-audit.json`
- `smuggler-farside-ship.json`
- `tide-unshacklers.json`

相對 HEAD：6 檔、14 行新增、10 行刪除、diff 4,081 bytes，符合件數／容量 gate。變動只涉及 budgetByGrade 與 units 的既有 frame／person 引用。開工已有的未追蹤 node_modules 連結保留。

交付目錄：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tune/cx-tune-human/`。重跑 [human-bench.ts](human-bench.ts) 時 cwd 必須為上述 worktree；所有 src import 都是該 worktree 的絕對路徑。無參數量最終實檔；第一個參數給 [old-round2.json](old-round2.json) 可重跑 HEAD 原始編成基準；第二個參數可指定單一遭遇名稱。證據均使用 round2 檔名，第一輪留存輸出不作本輪驗收依據。

## 沒做到或證據不足的

無未達驗收項。結果範圍為 default 全機庫、固定營運生成 RNG、六份遭遇與部署／戰鬥 seed 1–10。尚未包含 cx-tune-intent 的撤退邏輯變更；合併後由領導依交接書重測。未新增驗收項目。

## 需要決定的事

本線無待決定事項；領導可整合六檔、合併撤退邏輯後重測並 commit。

以後交接書該點名的工具：`src/ops/sortie/run.ts` 的 `sortieBattleSetup`（完整營運配裝／狀態建構）、`src/ops/sim/policies.ts` 的 `greedy`（直接取得 allUnits 派員結果）。
