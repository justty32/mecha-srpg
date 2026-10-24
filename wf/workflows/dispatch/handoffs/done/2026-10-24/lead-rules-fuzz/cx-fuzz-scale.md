# 任務：把 `test/fuzz/` 加速並擴大覆蓋，讓一輪數千場能在 10 分鐘內跑完

> 領導 `lead-rules-fuzz` 寫給 codex 工人 `cx-fuzz-scale`。**交接書是唯一契約**。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；然後讀前一條工人的 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-harness.md` 與同目錄 `cx-fuzz-harness/REPORT.md`，以及 `test/fuzz/` 全部五檔——親自讀。

## 背景與唯一目標

`test/fuzz/`（前一條工人寫的）可用但太慢、太溫和：600 秒只跑 145 場（ai 1.3 秒／場、scenario 6 秒／場——大地圖每步 `legalActions` 掃全圖格）；隨機情境單位散在大地圖上、3～12 輪內很少交戰，抓到的規則問題只有兩類。唯一目標：**加速＋加密度**，讓 `--runs 3000` 在 10 分鐘內跑完，且每場有更多交戰。規則 bug 由領導修（領導同時在改 `src/rules/`，你**不得修改 `src/` 任何檔**）。

## 範圍（排除法寫死）

- 只做 `test/fuzz/` 內的改動（可新增檔），與你的 REPORT。
- 不做：`src/**`、`content/**`、`test/` 其他目錄、`package.json`、`wf/`（REPORT 除外）；不刪既有不變量、不放寬既有不變量判準、不加 `KNOWN` 白名單。
- 件數 gate：`test/fuzz/` 超過 10 個檔就停下回報；容量 gate：`test/fuzz/` 總大小超過 100 KB 就停下回報。

## 要做的五件事

1. **平行**：`cli.ts` 加 `--jobs N`（預設 `os.availableParallelism()-1`，最少 1），用 node 內建 `node:worker_threads` 或 `node:child_process` 把 seed 均分給 N 個工作者；**輸出（違規清單、分組、計數）必須與 `--jobs 1` 逐字相同**（依 seed 排序合併；耗時行除外）。`--max-ms` 在平行下仍有效。
2. **密度**：`gen.ts` 的隨機情境改為多數場（約 70%）把所有單位放進一個緊湊區塊（例如邊長 `ceil(sqrt(單位數))*2+2` 的窗，窗位置隨機）；其餘保持現行散布。`maxRounds` 改 3～20。另加約 10% 的「同類對打」場：全部單位都是怪獸或全部是機甲，以覆蓋兩類各自的互動。生成仍只從 DB 列舉、不寫死 id。
3. **scenario 模式加速**：不要每步呼叫會掃全圖的 `session.legalActions()`；在 `drive.ts` 寫一個等價但有界的列舉（移動用 `session.rulesQuery.reachable`；unit／part 目標只列存活單位；cell／line／cone／ball 目標只列以行動者為中心、`range.max` 求值後的方框內格，再用 `checkAbility` 過濾——`checkAbility`、`abilitiesOf` 從 `src/rules/index.ts` import），並每 50 步抽一次與 `session.legalActions()` 比對「有界列舉 ⊆ session 列舉」；不一致記為新不變量 `legal-enum`。random 模式（小圖）照舊用 `session.legalActions()`。
4. **ai 模式加速**：`ai-determinism` 的第二次 `runBattle` 改為只在 `seed % 5 === 0` 的場跑；`preview-pure` 抽樣間隔維持 10 步。量一次 `--mode ai --runs 40` 的熱點（`node --cpu-prof --cpu-prof-dir=/tmp/cx-fuzz-scale/prof test/fuzz/cli.ts …`），若熱點在 fuzz 工具自己（不在 src），就優化工具。
5. **中途存讀檔**：`save-roundtrip` 除了終局外，再在每場中途某一步（由 seed 決定）對當下狀態做一次（`createSave` 帶 snapshot → `serializeSave` → `parseSave` → `loadSave(verifySnapshot:true)`）。

另外：`fuzz.test.ts` 的 30 場快速版**改成實跑**（拿掉 skip），但用 `--jobs 1`、固定 seed、只跑 random＋ai 兩種模式各 15 場（不跑 scenario，太慢），整檔 20 秒內；斷言零硬違規——**現在領導已修掉 events（BattleEnd 後 TurnEnd）與缺 heat 池兩組**，若快速版仍抓到違規，把違規 seed 寫進 REPORT 並把快速版的 seed 換成目前乾淨的一組（不准放寬檢查），讓 `npm test` 可以綠。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node test/fuzz/cli.ts --runs 3000 --seed 1 --max-ms 600000` | 最後交數字（預設 jobs） |
| `node test/fuzz/cli.ts --runs 60 --seed 9 --jobs 1` 與 `--jobs 4` | 驗平行輸出逐字相同 |
| `node --test test/fuzz/fuzz.test.ts` | 快速版與自我測試 |
| `npm run typecheck` | 你的檔要過型別檢查（UI 段若因別線半成品紅，只看根 tsconfig 那段，REPORT 說明） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-fuzz-scale --once` | 每完成一件事讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線 PROGRESS 與終局回報 |

## 資源與禁區

- **可寫程式碼線**：只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/test/fuzz/` 與你的 REPORT 目錄；**不要 commit**（REPORT 列檔案清單，領導 commit）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`（暫存放 `/tmp/cx-fuzz-scale/`）；不改 `~/.codex/config.toml`；**不安裝任何套件**；不碰 `.gitignore`；整檔改寫用單一 Update 操作；子代理上限 0 個；不上網。
- 工作樹裡有其他線未提交的半成品，以及領導正在改的 `src/rules/`；它們造成的紅燈不是你的事，**不要碰**。
- **分清錯誤來源**：沙箱拒寫、node 跑不了、worker_threads 被沙箱擋 → `BLOCKED`；沙箱內 `node --test` 計數不準不算阻塞。

## 工作

1. 依序做五件事＋快速版，每件做完跑 `--runs 60 --seed 9` 確認無 `gen-error`，`inbox_poll --once`。
2. 跑 3000 場，輸出存 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-scale/run-3000.txt`；對每組新違規挑一個 seed `--verbose`，REPORT 寫一句成因判斷（規則 bug／AI bug／內容資料錯誤／工具誤報），**不修 src**。
3. 寫 REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-scale/REPORT.md`，不要只貼在回覆裡。**

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| fuzz 工具改動 | `/home/lorkhan/repo/game_dev/mecha-srpg/test/fuzz/` |
| 3000 場輸出 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-scale/run-3000.txt` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rules-fuzz/cx-fuzz-scale/REPORT.md` |

REPORT 四段（做了什麼／產出（檔清單）／沒做到或證據不足的／需要決定的事），加「前後數字表」（各模式秒／場、3000 場總耗時、jobs 數）、「違規分組表」（不變量、訊息、場數、重跑 seed、成因判斷），末尾加「以後交接書該點名的工具」。

## 驗收（固定 5 條，一條不多，做完就停）

1. `--runs 60 --seed 9 --jobs 1` 與 `--jobs 4` 的輸出除耗時行外逐字相同，且 `gen-error` 為 0。
2. `node --test test/fuzz/fuzz.test.ts` 0 fail 且快速版實跑（非 skip），單檔 20 秒內。
3. `run-3000.txt` 存在，實跑場數 ≥ 3000 或寫明 `--max-ms` 截斷時的實跑場數，耗時 ≤ 660 秒。
4. `grep -rE "\"(frame|component|person|monster|terrain|faction|species)/" test/fuzz/` 零命中；`grep -rn "Math.random\|Date.now" test/fuzz/gen.ts test/fuzz/drive.ts test/fuzz/invariants.ts` 零命中。
5. REPORT 存在且有四段＋兩張表。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（平行輸出不一致、自我測試紅）→ 修工具；修不好就退回該項、保留其他，發 `FAILED`，REPORT 寫證據。
- **測不出來**（node 跑不了、沙箱擋寫）→ 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。
- fuzz 抓到規則違規是預期的成功結果，不是失敗。

## 完成／阻塞回報（必做）

- 我是誰：`cx-fuzz-scale`。本線團隊：`teams/rules-fuzz`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-fuzz-scale --up STATUS '一句自足結論' 正文檔路徑`（STATUS 換成 PROGRESS／DONE／BLOCKED／FAILED；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論，不可只寫「完成」。
