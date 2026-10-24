# cx-ib-tune REPORT

STATUS：DONE。固定四條驗收全部通過；未 commit。

## 做了什麼

`scenario.ts` 把契約／階段 hold 目標缺少的 zone 展開成敵方部署區格子，包含 role:"anchor"；明列 zone 原樣保留，rounds 不變。SPEC-GAP：以敵方部署區代表核區。

`policies.ts` 的 greedy 在配員前排除核心或 locomotion 毀損、沒有可用主動能力、所需彈藥池為零，以及修理已開工的機甲。能力來源包含 frame 固有能力與未毀部件，檢查部件 HP 層；只使用營運狀態與 ContentDB，未 import rules／ai。沒有可出戰機甲時 wait 1。

受損部位層先排既有 queue 指令：一般受損 repair，結構 HP 歸零 rebuild；重複工作不再排，工時、材料、支付與施工沿用 workqueue。缺少合法修理配方就略過，避免非法指令循環。補彈規格沒有明文操作，沒有發明補彈機制。

固定驗收結果：

1. seed 7 的 3／12 潮月各一場，day31、3 台、139 Hit；出戰快照的核心／腿皆完好，每台有 burst-30 與 12 發彈藥。玩家對敵 Hit 5、敵對玩家 Hit 70，確有交戰；之後沒有殘廢機出戰。
2. greedy／idle 的 `node src/ops/sim/cli.ts --months 12 --seed 7 --policy ...` 均 exit 0；greedy wall time **2.453 秒**，低於 60 秒。每輪程式修改後的 3 潮月 CLI 也 exit 0。
3. 恰好新增 3 個 test()。修改前各新增案例均 assertion 失敗；修改後通過。`npm test` exit 0，沙箱按檔計數 80 pass／0 fail；`npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` exit 0、0 errors／0 warnings。黃金檔沒有變更。
4. 本 REPORT 已寫入指定主 repo 絕對路徑，含四段、改前／改後戰果表與各潮月人數／cash 附表。

### 戰果表改前

greedy seed 7、3 潮月；同數值列合併列出所有 day，沒有省略任何戰鬥。Hit 是 result.events 的原始 Hit 數，包含 self。第二場已混入殘廢／無彈機；day35 起皆為腿與雙臂全毀、零彈藥、無可用能力的單機。

| day | winner | reason | rounds | 機數 | Hit |
|---|---|---|---:|---:|---:|
| 31 | player | hold | 5 | 3 | 88 |
| 33 | null | timeout | 20 | 2 | 187 |
| 35、39、47、51、55、59、63、67、71、75、79、83 | player | hold | 5 | 1 | 40 |
| 37、41、45、49、53、57、61、65、69、73、77、81 | null | timeout | 20 | 1 | 160 |

### 戰果表改後

所有指定樣本均 exit 0，表列每一場。各場出戰快照均無核心／locomotion 毀損，每台至少一個可用能力；每個樣本都只有首戰，之後沒有可出戰機甲。Hit 仍按原始事件計數，另列雙向交戰命中，避免把 self Hit 當敵我交戰。

| 潮月／seed | day | winner | reason | rounds | 機數 | Hit | 玩家→敵／敵→玩家 |
|---|---:|---|---|---:|---:|---:|---|
| 3／7 | 31 | enemy | eliminate | 9 | 3 | 139 | 5／70 |
| 12／7 | 31 | enemy | eliminate | 9 | 3 | 139 | 5／70 |
| 12／1 | 31 | enemy | eliminate | 6 | 3 | 126 | 5／81 |
| 12／2 | 17 | enemy | eliminate | 5 | 3 | 111 | 6／73 |
| 12／3 | 17 | enemy | eliminate | 6 | 3 | 113 | 3／78 |

### 各潮月人數與 cash

每格「人數／cash」。seed 7 的 3 潮月結果等於 12 潮月的前 3 列；seed 1–3 均為改後 greedy 12 潮月。人數與勝負比例不是驗收條件。

| 潮月 | 改前 s7 | 改後 s7 | 改後 s1 | 改後 s2 | 改後 s3 | idle s7 |
|---:|---|---|---|---|---|---|
| 1 | 7／164 | 7／164 | 7／164 | 7／190 | 7／190 | 7／164 |
| 2 | 7／1582 | 5／0 | 3／0 | 4／0 | 4／0 | 4／-48 |
| 3 | 7／3402 | 1／0 | 1／0 | 1／0 | 1／0 | 0／-104 |
| 4 | — | 0／0 | 1／0 | 0／0 | 0／0 | 0／-160 |
| 5 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-216 |
| 6 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-272 |
| 7 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-328 |
| 8 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-384 |
| 9 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-440 |
| 10 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-496 |
| 11 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-552 |
| 12 | — | 0／0 | 0／0 | 0／0 | 0／0 | 0／-608 |

## 產出（檔清單）

程式只在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt/tune` 修改：

- `src/ops/sortie/scenario.ts`
- `src/ops/sim/policies.ts`
- `src/ops/sortie/scenario.test.ts`：新增 1 個 test，含缺 zone、anchor、既有 zone、階段目標。
- `src/ops/sim/policies.test.ts`：新檔，2 個 test，分別驗戰力篩選與修理排程。

另有本 REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-tune/REPORT.md`。4 個程式／測試檔加 1 個 REPORT，程式 diff 含新測試約 10,320 bytes；含 REPORT 仍低於 40 KB、8 檔 gate。未修改其他程式、content、spec、套件或黃金 hash；既有 node_modules symlink 與 worktree 下未追蹤的交接資料不是本線產出。

原始證據在 `/tmp/cx-ib-tune/`：`campaign-details.ts` 包 runCampaign.battle 呼叫正式 runSortie，產生 `before-3-7.jsonl` 與 `after-{3,12}-7.jsonl`／`after-12-{1,2,3}.jsonl`；後者另有 `events-*.json` 保存事件。測試輸出是 `red-policy.log`／`red-scenario.log`、`green-policy.log`／`green-scenario.log`、`final-test.log`、`typecheck.log`、`ops-check.log`。CLI 證據是 `step2-cli.log`、`greedy12-cli.log`、`greedy12-time.log`、`idle12-cli.log`。臨時腳本未放進 repo。

## 沒做到或證據不足的

沒有未通過的固定驗收。改後全部指定 seed 都在首戰戰敗，沒有留下可出戰機甲；因此正式樣本的 queue 次數為 0，不能宣稱已由長期戰役證明修復後重新出戰。repair／rebuild 的合法排程、工時材料計價、不重複及不修改輸入，由新增測試實測。

既有 workqueue 只支援 bodyplan 定義的部位層修理；附加部件 HP 層不在它的修理目標內。本線會排除毀損武器的機甲，未擴寫 workqueue 或新增部件維修規則。能力可用性依交接書採部件狀態與彈藥池 > 0，不模擬 rules 的距離、AP、冷卻等即時戰場合法性。

改前 zero-capability 單機仍有 40／160 Hit，說明原始 Hit 計數可能全由敵方 self 能力產生；報告保留原始值，改後另用事件 unit／target 辨識雙向命中。未改 AI 偵察／移動、hold 規則本體或內容平衡。

## 需要決定的事

補彈仍需設計決策：`specs/ops/data-model-economy-research.md` 只有 `stock:ammo-30` 帳戶型別例子，帳本、市場、修理與 battle-interface 都沒有把庫存轉入機甲彈藥池的動作、時機、比例或成本。應由後續規格決定補彈方式；本線不發明，無彈機由 greedy 留船。

「核區＝敵方部署區」依交接書授權落為 SPEC-GAP。若要持續多場戰役或改善存活率，需另行決定補給、部件維修與戰力平衡；本次不以這些改動補勝率。

### 以後交接書該點名的工具

保留正式 `runCampaign`＋`runSortie` 包裝腳本，除了原始 Hit，應列 event.payload.unit／target 的雙向命中與出戰機狀態。`node <file>.test.ts` 可顯示沙箱中的具體 assertion；`npm test` 仍以 fail 數為準。這個環境沒有 `/usr/bin/time`（初次計時嘗試 exit 127，沒有啟動 node）；已用 Python `time.monotonic()`＋`subprocess.run` 成功量正式 CLI wall time。繼續點名 inbox_poll.sh／inbox_mail.sh 與指定 REPORT 絕對路徑。
