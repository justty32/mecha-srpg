# cx-fuzz-scale REPORT

## 做了什麼

固定五條驗收均通過。正式 `--runs 3000 --seed 1 --max-ms 600000` 使用預設 15 工，600.105 秒完成 **749／3000 場**，依時限截斷；未達「十分鐘完整跑完 3000 場」的原始效能目標，符合驗收第 3 條明訂的截斷回報條件。原批次有 11 場硬違規、15 場 AI 警告，共四組；gen-error、legal-enum、replay-hash、save-roundtrip 都為 0。

CLI 加入 `--jobs`，預設 `availableParallelism()-1`、至少 1；worker_threads 等分連續 seed 區段，逐場回傳、依 seed 排序合併。連續區段避免 jobs 為 3 的倍數時，每個工作者只分到同一模式。父執行緒在期限到時 terminate 工作者，保留已完成場；截斷後 seed 不一定連續，JSON 保留實際 seed 清單。最初 child_process 版本遇停止行程 EPERM，已改為可正常終止的 worker_threads，未留下該阻塞。

生成器約 70% 緊湊部署、10% 強制同類對打，maxRounds 為 3～20；內容仍由 DB 列舉。依 orders，密集混合場的 s0／s1 保持敵對，前兩隻分別為機甲與無駕駛怪獸，因此約九成密集場具備這個跨類交戰組合。

scenario 改用 reachable、存活單位／部位及射程方框列舉；射程依能力 actorRole 的人物上下文求值，候選仍由 checkAbility 過濾。每 50 步抽完整 legalActions 比較子集合，新增 legal-enum，並在既有自我測試加入正常與故意破壞的輸入。random 維持完整 legalActions。AI 第二次 runBattle 僅在 seed % 5 === 0 執行，preview-pure 維持每 10 步。

每場另驗一個由 seed 決定的非終局前綴存檔，完整呼叫 createSave(snapshot)、serializeSave、parseSave、loadSave(verifySnapshot:true)。若戰鬥比預定步數早結束，改驗最後保存的非終局前綴。正式批次 746 場完成此檢查，其中 646 場位於第 1 步之後、100 場是開局後的第 0 步；另 3 場 AI 首次 runBattle 拋錯，未取得可驗的中途指令前綴。終局檢查保留。

快速版已移除 skip，經同一 CLI 的 `--jobs 1` 路徑，random／ai 各完整跑 15 場。新增 `--seeds` 供固定短局清單使用，沒有修改生成結果或過濾違規。固定 seed 為 1295、2218、2569、2833、2908、3195、3852、4479、4498、5272、5613、6349、6971、8336、8527。自我測試改用小圖 seed 2218；AI hash 檢查的正反例只需一條指令，完整戰鬥由快速版驗證。

驗收證據：jobs 1／4 的 60 場都完成，僅替換摘要耗時數字、排除耗時明細行後文字逐字相同；JSON 排除 elapsedMs／modeMs／jobs 後完全相同，包含計數、分組、findings 與中途存檔步數。最終 `node --test test/fuzz/fuzz.test.ts` 0 fail、0 skip，整檔 **14.684 秒**；沙箱以檔案計 1 test，直接執行另證明 3 個測試均通過、30 場實跑，整檔 17.525 秒。npm run typecheck 根與 UI 兩段皆通過。兩式靜態搜尋零命中。test/fuzz 為 7 檔、46,836 bytes。

### 前後數字表

| 項目 | 前線基準 | 本線 jobs=1／60 場 | 本線正式限時批次 |
|---|---:|---:|---:|
| ai 秒／場 | 約 1.3 | 6.843 | 8.374 |
| random 秒／場 | 未單獨量測 | 1.227 | 3.122 |
| scenario 秒／場 | 約 6 | 20.575 | 23.517 |
| 實跑／要求場數 | 145／2000 | 60／60 | 749／3000 |
| 總耗時（秒） | 602.822 | 573.566 | 600.105 |
| jobs | 1 | 1 | 15 |

秒／場以各模式累計工作者牆鐘時間除以完成場數計算，不是 CPU 時間。新生成密度、輪數、內容與共享規則版本均不同；批次互有重疊，主機 load 曾超過 200，故不能直接比較單場加速倍率。15 工的另一次 60 場為 135.587 秒、4 工為 226.318 秒。正式總吞吐約為前線的 5.2 倍，仍不足 3000 場目標。

指定的 `--mode ai --runs 40` CPU profile 已執行，jobs=1、110.380 秒；此量測在中途存檔與最終 orders 調整前。87,230 個 worker samples 中，src 的 clone-state 占 36.28%、layerDefs 7.39%、canonical encode 7.27%；fuzz 的 encode 自身占 1.46%，checkState 累計約 1.28%。主要熱點在 src，因此遵守禁區未修改來源規則或 AI。

### 違規分組表

| 不變量 | 訊息摘要 | 場數 | 重跑 seed（ai） | 成因判斷 |
|---|---|---:|---:|---|
| ai-rejected | 拒絕指令 | 15 | 7 | AI bug，警告 |
| layer-hp | head 結構／部位不一致 | 5 | 211 | 規則 bug |
| events | 終局後 PoolChanged | 3 | 607 | 規則 bug |
| no-throw | 缺 instinct 池 | 3 | 1447 | 規則 bug |

四組均已依要求各挑一個 seed 用 `--verbose` 重跑。seed 7、211、607 重跑無任何違規；seed 1447 重跑僅剩 1 次 AI rejected，原硬違規未再現。這不代表原批次誤報：共享 src 在批次期間由領導更新，原結果與後續重跑不是同一來源版本。

layer-hp 的原例在 seed 211、第 156 步出現：已毀部位的結構層再生、part.broken 未同步；目前 turn.ts 已新增毀損部位不再生的保護。events 原例 seed 607、第 391 步，能力擊殺結算已寫 BattleEnd，後續 produces 寫 PoolChanged；目前 objectives.ts 已延後終局事件至結算收尾。缺 instinct 的 stack 指向 hooks 的 pool 動作、effects.install；目前 hooks.ts 已改成只對實際具有該池的 owner 執行。AI 警告只知 runBattle 的 rejected 計數，不能從現有回傳值斷言具體被拒分支。以上均未由本線修改。

## 產出（檔清單）

程式碼位於 [test/fuzz](../../../../../../../../test/fuzz)：修改 cli.ts、gen.ts、drive.ts、invariants.ts、fuzz.test.ts；新增 worker.ts、node-shim.d.ts。沒有修改 src、content、其他 test 目錄、package.json；沒有 commit。

正式證據：[run-3000.txt](run-3000.txt)／[JSON](run-3000.json)、[單工輸出](jobs-1.txt)／[JSON](jobs-1.json)、[四工輸出](jobs-4.txt)／[JSON](jobs-4.json)、[逐字比較](parallel-check.txt)。JSON 保留每場 seed、模式、步數與 midSaveStep。

其餘證據：[自我測試](self-test.txt)、[直接執行](self-test-direct.txt)、[型別檢查](typecheck.txt)、[靜態搜尋與大小](static-checks.txt)、[CPU profile 摘要](profile-summary.txt)、[40 場量測](profile-run.txt)。原始 cpuprofile 在 `/tmp/cx-fuzz-scale/prof/`。

分組重跑：[seed 7](verbose-7.txt)、[seed 211](verbose-211.txt)、[seed 607](verbose-607.txt)、[seed 1447](verbose-1447.txt)。階段驗證為 step-1.txt、step-2.txt、step-3.txt 與最終 run-60.txt；最初快速版失敗保留於 self-test-initial.txt。

## 沒做到或證據不足的

沒有在十分鐘完整跑完 3000 場；600 秒截止時完成 749 場，其餘未計入通過或失敗。也沒有在每個例外中止場取得中途存檔證據：3 場在 AI 首次 runBattle 內拋錯，回傳命令前綴之前就中止。未宣稱量化證明每場攻擊次數增加；已落實密度與敵對跨類部署條件。

原快速版連續 seed 1～15 在高負載下逾時，未取得完整 30 場結果；開發中的其他抽樣曾見 seed 17／ai 終局後 PoolChanged、profile 的 seed 3／ai 結構／部位不一致，已保留問題而未放寬判準。改用短局 seed 後，高負載測試仍曾超時；最終在長批次結束後通過 14.684 秒。20 秒是本次量測結果，不保證任意主機負載或後續內容更新仍能符合。

child_process 時期的第 4／5 階段與早期比對／3000 場嘗試，因停止行程 EPERM 風險而中止，換成 worker_threads 後重新完成最終 60 場、單工／四工比對與正式限時批次；未把中止的批次算成完成。沒有 KNOWN 白名單，沒有移除或放寬不變量。依固定五條驗收停止，未加跑全倉 npm test、build 或 wf-lint。

## 需要決定的事

請領導依現有權限處理後續 src／AI 效能與剩餘 AI rejected；若仍要求 3000 場完整跑完，需另開來源層效能工作，不能把本次 749 場說成 3000 場。原三組硬違規的代表 seed 在共享新版規則已無硬違規，是否擴大修正後回歸由領導決定。本線固定驗收已完成，無需使用者補授權。

## 以後交接書該點名的工具

保留既定 CLI、node --test、typecheck、inbox 工具；另點名直接執行測試檔，以辨識沙箱檔案計數與實際 3 個測試。效能任務宜要求記錄主機負載、CPU profile 的 worker 檔、來源版本，以及避免同時跑其他量測的條件。需強制時間截止時，worker_threads 的 terminate 可避免子行程訊號遭 EPERM 的環境限制。
