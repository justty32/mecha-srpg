# cx-fuzz-harness REPORT

## 做了什麼

新增零依賴、固定 RNG stream 的戰鬥 fuzz。ai／random／scenario 三模式與 mix 輪替；DB 列舉全部內容，包含 5% 大圖、同盟、機甲／怪獸、相容槽位與人物、目標及輪數上限。每場上限 4,000 次指令，每單位每輪 12 次後強制 end。

17 條具名檢查已接入；AI 用成功指令逐步重建，其餘每條成功指令後檢查。每 10 步驗 preview 純度及接受結果。終局／停止前綴驗重播、完整 state、存檔，AI 另重跑比 hash。只有 AI rejected 是警告；硬違規令 CLI exit 1。同組每場只記第一次，跨場計違規場數。

固定五條驗收的前兩項已有證據：兩次 `--runs 50 --seed 7` 都完成 50 場（ai 17／random 17／scenario 16），耗時 141,154／140,562 ms；扣掉耗時摘要行後，違規清單逐字相同，JSON findings 相同，gen-error 均為 0。每批有 3 場硬違規、2 場 AI 警告。

`node --test test/fuzz/fuzz.test.ts` exit 0。沙箱 runner 以整檔計 1 test；直接執行同檔可見 2 條自我測試通過、30 場快速測試 skip、0 fail。所有具名檢查皆餵正確與故意破壞的輸入，包含指定五項，以及「日誌不變但完整 state 被竄改」的重播驗證。`npm run typecheck` 曾 exit 0；保存的最後一次則於 UI 型別檢查報 `src/ui-adapter/dom/main.ts(120,16)` 缺 `../ops/dom/main.ts`。含 test/fuzz 的根 tsconfig 已通過，本線未動 src。

固定五條驗收的靜態搜尋兩式均零命中。test/fuzz 共 5 檔、35,771 bytes，低於 8 檔／80 KB gate。`--runs 2000 --seed 1 --max-ms 600000` 已完成：實跑 145 場，耗時 602,822 ms（超過預算的最後一場完成後停止），ai 49／random 48／scenario 48，涵蓋全部 18 個 scenario。10 場硬違規、3 場 AI 警告，共四組；gen-error=0、setup-rejected=0。沒有池／層／重播／存檔或其他不變量違規，但例外中止場不會完成其後的終局檢查。exit 1 是找到規則問題的預期結果。

## 產出（檔清單）

程式碼均在 `/home/lorkhan/repo/game_dev/mecha-srpg/test/fuzz/`：

- [gen.ts](../../../../../../../../test/fuzz/gen.ts)：資料驅動情境生成。
- [invariants.ts](../../../../../../../../test/fuzz/invariants.ts)：17 條具名檢查、錯誤與狀態編碼。
- [drive.ts](../../../../../../../../test/fuzz/drive.ts)：三模式驅動與逐步檢查。
- [cli.ts](../../../../../../../../test/fuzz/cli.ts)：CLI、分組、JSON、時間預算、重跑指令。
- [fuzz.test.ts](../../../../../../../../test/fuzz/fuzz.test.ts)：正常／破壞輸入自我測試及先 skip 的快速版。

本報告目錄的證據為 [run-2000.txt](run-2000.txt)、[run-2000.json](run-2000.json)、兩次 [run-50-a.txt](run-50-a.txt)／[run-50-b.txt](run-50-b.txt) 與同名 JSON、[self-test.txt](self-test.txt)、[self-test-direct.txt](self-test-direct.txt)、[typecheck.txt](typecheck.txt)、[static-checks.txt](static-checks.txt)。逐組重跑見下表與後文連結。只寫此目錄及 test/fuzz；未 commit。

## 沒做到或證據不足的

開發用 `--runs 200 --seed 1` 已啟動，但在固定五條驗收完成後依「做完就停」手動中止（exit 130），不宣稱完整跑完 200 場。正式證據採已完整輸出摘要的 2,000 場目標／600 秒預算量測，實跑 145 場。

30 場快速版依契約保持 skip，檔案執行低於 15 秒；未聲稱啟用後 30 場均能於 15 秒內跑完，啟用時會受 15 秒測試 timeout 保護。真情境包含 60×60 大圖，單場可達數十秒；CLI 的 max-ms 在場與場之間檢查，會完成已開始的場才停，因此可略超時間預算。未增列驗收、未跑全倉測試或 wf-lint。

同 seed/mode 的重現以前提「相同來源程式及內容 DB」為準。兩次 50 場批次完全一致；之後 seed26 最新程序未再現舊程序記錄的 BattleEnd 後 TurnEnd，seed27 scenario 則已穩定重現同組違規。因此保留原批次證據，不能將後續不同環境的未再現解讀成工具白名單或規則已修證明。當時有其他線持續改動共享工作樹；內容件數相同也不保證內容值相同。

## 需要決定的事

請領導處理規則／內容 bug，並在修正後決定何時打開快速版；本線不修 src 或 content，也不加 npm script。slot 型別相容但部件產出池不存在（seed35 random）的組合，需由規則合法性或內容宣告決定處理方式，不能讓生成器暗中排除。

## 違規分組表

以下場數來自 145 場正式時間預算量測，訊息簡寫；完整首行、stack 前五行及每場發現保留於 run-2000.json。四組皆已用指定 seed、mode、`--runs 1 --verbose` 重跑，仍能出現同組違規。

| 不變量 | 訊息 | 場數 | seed／mode | 成因判斷 |
|---|---|---:|---|---|
| events | BattleEnd 後 TurnEnd | 7 | 2／random | 規則 bug |
| ai-rejected | AI rejected 指令 | 3 | 22／ai | AI bug，僅警告 |
| no-throw | legalActions/previewCommand/submit 缺 heat 池 | 2 | 35／random | 規則／內容組合缺口 |
| no-throw | AI runBattle 缺 heat 池 | 1 | 67／ai | 同上，從 AI 預覽觸發 |

[seed2 詳細輸出](verbose-2.txt)：retreat 先透過 objective 判勝寫 BattleEnd，tryCommand 尾端見 actor 不 active 又呼叫 endTurn，寫出 TurnEnd；應在規則端保護終局。seed27 scenario 也重現同組（[輸出](verbose-27.txt)）。

[seed22 詳細輸出](verbose-22.txt)：runBattle 回報 1 次 rejected，重跑仍為警告；依契約歸 AI 線，既有 RunResult 沒有被拒指令明細，不能進一步斷言是哪個策略分支。

[seed35 詳細輸出](verbose-35.txt)：bio-reaper 的 graft 槽抽到 mx-purge-censer，機體只有 instinct、部件只有 purge-oil，mx-purge-flame 卻 produces heat。legalActions 納入該能力，preview 在 changePool 拋「缺少池」。相容 slot 合法組合缺少資源宣告／合法性保護，非生成器誤報。

[seed67 詳細輸出](verbose-67.txt)：corpse-reaper 的 graft 槽抽到 mx-molten-saw，亦缺 heat；AI 評分預覽沿相同 changePool 路徑拋例外。按訊息首行的 phase 規則分為另一組，根因與 seed35 同類，不能當作 AI rejected 警告吞掉。

## 白名單與誤報判斷

沒有 KNOWN 白名單。以下為符合現行狀態模型的比較語意，不會把已發現的違規轉成通過。

`canonicalJson` 本身拒絕 Infinity，但 PoolState 明定 max 可為 Infinity。完整狀態比較先對非有限數字作保留型別的標記編碼，再 canonicalize；cur／regen 仍須有限，max 可為數字且非 NaN。事件 payload 不允許任何 Infinity：本專案事件 API 只接受有限數字，沒有需例外放行的 max payload。

捕捉會替換 frame 並保留原身體；captured 層仍檢查有限、非負及 broken ⇒ hp=0，無法拿新 frame 的層定義作原身體上限。captured／derelict 不檢查結構層與 part.broken 雙向等價。其他單位依 layerDefs 比對上限。死亡／撤離者可留在整輪歷史 order，規則以 isActive 跳過；檢查的是後續實際選出的 actor 與事件，不把歷史留存當成違規。

derelict 和其他非 active 狀態一樣不能行動，恢復 active 後解除當前禁行紀錄，以支援占據後重新加入。dead-dont-act 按新事件序列追蹤 UnitDied／Retreated／Captured／Ejected，連同同條指令內後續事件一起檢查。person.seat 不存 SeatId，因此座位雙向驗證採「恰好一個席位指向人物，且人物反指同一機體」。

輪上限採 `round <= maxRounds`：現行規則於該輪 RoundEnd 定局，沒有允許 maxRounds+1。BattleResult 將 active 映成 alive，derelict 映成 recovered／lost，其他狀態逐項相符。每場未終止不等於已證明規則無限迴圈，no-termination 只代表步數上限或無 actor 停滯，訊息附輪數與步數供領導判斷。

## 以後交接書該點名的工具

既定的 fuzz CLI、node --test、typecheck、inbox 工具已足夠。建議一併點名「直接 node 執行同一測試檔」以確認沙箱內各測試與 skip 的實際計數；並要求 verbose 重跑時記錄原批次內容版本，避免並行內容更新造成 seed 對應情境改變。
