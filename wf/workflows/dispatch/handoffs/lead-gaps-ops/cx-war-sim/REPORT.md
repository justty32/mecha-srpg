# cx-war-sim 完成回報：固定六條驗收達成，五條黃金可重跑

## 做了什麼

在每日 `checkInvariants` 增加關係、作戰、戰力、研發、引用、借機與外源帳來源檢查；新增純函式 `war-metrics.ts` 逐日累計比例、戰力、作戰數與場次上限，CLI 每月欄位與 `war統計` 共用同一結果。CLI 加 `--continue-after-end`，並在未走滿請求潮月時明確報 `campaign-ended-early`。

六個固定 seed × idle/random/merc × 六潮月的每日不變量、七日等待時序、第二段外交事件、月初機型釋出與含 join 戰鬥紀錄的無重跑重播已測；固定 runner 回寫營運戰果，真戰鬥留給 CLI。

內容調數：宿敵 `content/base/world/affinity.json` 唯一 `rivalry:true` 列 `baseline` −20→−30，其他 −20 未動。曾試 `operations/seize.json` 的 `weight` 1→2；同一程式與內容快照下 24 潮月 seed 1/2 作戰完成數 42→32／43→41，依交接書回退為 1。沒有改公式或其他戰爭內容。

### 固定六條驗收

1. `npm run typecheck` exit 0；`node src/ops/content/check.ts content/base` exit 0、0 errors（34 個別線怪物內容警告）。
2. `node --test --test-isolation=none test/campaigns/campaigns.test.ts` 五條綠；`node --test --test-isolation=none src/ops/sim/war-invariants.test.ts` 五項綠，21.48 秒（≤60 秒）。`node --test` 預設隔離模式同樣 exit 0。
3. `npm test` 132 檔，128 綠、4 紅：`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/sim/golden.test.ts`、`src/ops/sortie/entry.test.ts`；本線新增檔未紅。既有 ops golden fixture 依交接禁止重產。
4. 下列 14 組 12／24 潮月 CLI 均加 `--continue-after-end`，每組印足指定月數、`OK`、`war統計.errors=[]`。欄序為 `檔名: war統計 JSON`：

```text
idle-12-seed-1.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":21,"maxOperations":3,"maxDays":22,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.7407407407407407,"errors":[]}
idle-12-seed-2.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":20,"maxOperations":4,"maxDays":19,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.6370370370370371,"errors":[]}
idle-12-seed-3.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":24,"maxOperations":3,"maxDays":20,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0,"maxWarStreakDays":36,"minMajorStates":3,"minPowerRatio":0.6222222222222222,"errors":[]}
greedy-12-seed-1.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":18,"maxOperations":3,"maxDays":25,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.7407407407407407,"errors":[]}
merc-12-seed-1.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":20,"maxOperations":3,"maxDays":25,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.7407407407407407,"errors":[]}
merc-12-seed-2.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":10,"maxOperations":2,"maxDays":23,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.6370370370370371,"errors":[]}
merc-12-seed-3.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":28,"maxOperations":3,"maxDays":26,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.5481481481481482,"errors":[]}
idle-24-seed-1.log: {"enteredWar":4,"ceasefires":3,"NodeTransferred":2,"OperationResolved":42,"maxOperations":3,"maxDays":22,"maxWarRatio":0.044444444444444446,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":40,"minMajorStates":3,"minPowerRatio":0.7407407407407407,"errors":[]}
idle-24-seed-2.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":43,"maxOperations":4,"maxDays":20,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.6370370370370371,"errors":[]}
idle-24-seed-3.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":47,"maxOperations":4,"maxDays":22,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0,"maxWarStreakDays":36,"minMajorStates":3,"minPowerRatio":0.6222222222222222,"errors":[]}
greedy-24-seed-1.log: {"enteredWar":2,"ceasefires":2,"NodeTransferred":2,"OperationResolved":29,"maxOperations":3,"maxDays":25,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":41,"minMajorStates":3,"minPowerRatio":0.7407407407407407,"errors":[]}
merc-24-seed-1.log: {"enteredWar":2,"ceasefires":2,"NodeTransferred":2,"OperationResolved":30,"maxOperations":3,"maxDays":25,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":42,"minMajorStates":3,"minPowerRatio":0.7407407407407407,"errors":[]}
merc-24-seed-2.log: {"enteredWar":1,"ceasefires":1,"NodeTransferred":1,"OperationResolved":34,"maxOperations":3,"maxDays":23,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.022222222222222223,"maxWarStreakDays":39,"minMajorStates":3,"minPowerRatio":0.6370370370370371,"errors":[]}
merc-24-seed-3.log: {"enteredWar":4,"ceasefires":3,"NodeTransferred":1,"OperationResolved":60,"maxOperations":4,"maxDays":26,"maxWarRatio":0.022222222222222223,"maxAlliedRatio":0.044444444444444446,"maxWarStreakDays":46,"minMajorStates":3,"minPowerRatio":0.5481481481481482,"errors":[]}
```

5. idle seed 1/2/3 的 24 潮月都有 war、停火、NodeTransferred、ModelReleased；seed 1 單跑約 6.66 秒（24 行、OK，低於 8 秒）。
6. merc 三 seed 的 24 潮月 join-pay 結算合計 27 筆（≥5）。同一快照的 24 潮月調數前後對照如下，最終內容僅留宿敵 baseline 調數；三 seed 的作戰完成數、奪點數不減，比例型不變量全成立。

| seed | 作戰完成 前→後 | 奪點 前→後 | war 最大比例 前→後 |
|---:|---:|---:|---:|
| 1 | 42→42 | 2→2 | 0.0444→0.0444 |
| 2 | 43→43 | 1→1 | 0.0222→0.0222 |
| 3 | 47→47 | 1→1 | 0.0222→0.0222 |

前後日誌由 `/tmp/cx-war-sim/controlled` 同一程式快照各跑 24 潮月；`both-{1,2,3}.log` 留存兩項都套用後的退化證據，`only-seize-*`、`only-rivalry-*` 留存單項定位證據。

### 24 潮月摘要

欄序：月 / 作戰 / war / allied / 釋出 / join。

**idle seed 1**

```text
1 / 0 / 1 / 0 / 16 / 0
2 / 0 / 0 / 0 / 17 / 0
3 / 2 / 0 / 0 / 17 / 0
4 / 0 / 0 / 0 / 18 / 0
5 / 0 / 0 / 0 / 18 / 0
6 / 1 / 0 / 0 / 19 / 0
7 / 2 / 0 / 0 / 20 / 0
8 / 0 / 0 / 0 / 20 / 0
9 / 3 / 0 / 0 / 21 / 0
10 / 1 / 0 / 0 / 23 / 0
11 / 1 / 0 / 1 / 23 / 0
12 / 0 / 0 / 1 / 24 / 0
13 / 0 / 0 / 1 / 24 / 0
14 / 1 / 0 / 1 / 24 / 0
15 / 1 / 0 / 1 / 25 / 0
16 / 0 / 1 / 1 / 25 / 0
17 / 2 / 2 / 1 / 25 / 0
18 / 1 / 1 / 1 / 25 / 0
19 / 2 / 0 / 1 / 25 / 0
20 / 0 / 0 / 1 / 25 / 0
21 / 1 / 0 / 1 / 25 / 0
22 / 1 / 0 / 1 / 25 / 0
23 / 3 / 0 / 1 / 25 / 0
24 / 0 / 1 / 1 / 25 / 0
```

**merc seed 1**

```text
1 / 0 / 1 / 0 / 16 / 0
2 / 0 / 0 / 0 / 17 / 0
3 / 2 / 0 / 0 / 17 / 1
4 / 1 / 0 / 0 / 18 / 2
5 / 0 / 0 / 0 / 18 / 2
6 / 3 / 0 / 0 / 19 / 4
7 / 1 / 0 / 0 / 20 / 6
8 / 2 / 0 / 0 / 20 / 6
9 / 1 / 0 / 0 / 20 / 7
10 / 0 / 0 / 0 / 20 / 7
11 / 2 / 0 / 1 / 20 / 9
12 / 0 / 0 / 1 / 22 / 10
13 / 0 / 1 / 1 / 23 / 10
14 / 1 / 1 / 1 / 24 / 11
15 / 0 / 0 / 1 / 24 / 12
16 / 0 / 0 / 1 / 24 / 13
17 / 0 / 0 / 1 / 24 / 13
18 / 1 / 0 / 1 / 25 / 13
19 / 0 / 0 / 1 / 25 / 13
20 / 1 / 0 / 1 / 25 / 13
21 / 0 / 0 / 1 / 25 / 13
22 / 1 / 0 / 1 / 25 / 13
23 / 0 / 0 / 1 / 25 / 13
24 / 1 / 0 / 1 / 25 / 13
```

### merc 24 潮月結算

| seed | join 接受 | 走完 join-pay | 戰鬥勝／敗 | join-pay 總額 |
|---:|---:|---:|---:|---:|
| 1 | 13 | 13 | 17/8 | 19724.318182 |
| 2 | 12 | 12 | 29/2 | 18000.000000 |
| 3 | 2 | 2 | 0/0 | 3000.000000 |

### 五條黃金事件子序列與 hash

- `ops-war-assault`：OperationStarted(assault) → OperationEngaged(operation-9) ×3 → RiftPhase(unanchored) → OperationResolved(operation-9)；hash `dba9d1fb3f90bab3`，1895 events，day 168。
- `ops-merc-join`：ContractAccepted(join, contract-27) → Arrived(delta) → BattleResolved(operation-2) → OperationResolved(operation-2) → JoinSettled(contract-27)；獨立核對 join-pay 與 attachedLoss>0；hash `20fe1f9ee0b51592`，326 events，day 29。
- `ops-betrayal`：ContractAccepted(A contract-27) → ContractCancelled(A) → ContractAccepted(B contract-30) → Betrayed(A)；獨立核對 rep −40 與 blacklist；hash `3058900ca455e148`，136 events，day 12。
- `ops-relic`：OperationStarted(relic-hunt) → ShellSeized(old-array) → LineageOpened(old-array) → ModelReleased(old-array-ii)；hash `11250d4339db994d`，1954 events，day 168。
- `ops-leak`：MechLoaned(union-fr7) → TechLeaked(union-fr7, by player)；maker rep 0→−15，成交當日軍械市場仍無該型，下次弦月市場列出；hash `cc82fa2c211b3f7d`，61 events，day 6。借機以領導放行的 JSON `setup.loan` 補丁建立，合約的 `loans` 與 `merc.loans`、機體 `owner:"faction"`／`loaned`、機庫與背包均按真實借機形狀填入；未改共用合約內容。

## 產出（含完整檔案清單）

程式／測試：`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/invariants.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/cli.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/war-metrics.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sim/war-invariants.test.ts`、`/home/lorkhan/repo/game_dev/mecha-srpg/test/campaigns/campaigns.test.ts`。

五條黃金：`/home/lorkhan/repo/game_dev/mecha-srpg/test/campaigns/` 下 `ops-war-assault.json`、`ops-war-assault.hash.json`、`ops-merc-join.json`、`ops-merc-join.hash.json`、`ops-betrayal.json`、`ops-betrayal.hash.json`、`ops-relic.json`、`ops-relic.hash.json`、`ops-leak.json`、`ops-leak.hash.json`。內容：`/home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/affinity.json`。

證據資料夾：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-war-sim/`。其中全部 `.log`：

```text
after-1.log
after-2.log
after-3.log
before-1.log
before-2.log
before-3.log
both-1.log
both-2.log
both-3.log
greedy-12-seed-1.log
greedy-24-seed-1.log
idle-12-seed-1.log
idle-12-seed-2.log
idle-12-seed-3.log
idle-24-seed-1.log
idle-24-seed-2.log
idle-24-seed-3.log
merc-12-seed-1.log
merc-12-seed-2.log
merc-12-seed-3.log
merc-24-seed-1.log
merc-24-seed-2.log
merc-24-seed-3.log
npm-test.log
only-rivalry-1.log
only-rivalry-2.log
only-rivalry-3.log
only-seize-1.log
only-seize-2.log
only-seize-3.log
without-flag-idle-24-seed-1.log
without-flag-merc-24-seed-3.log
```

本 `REPORT.md` 同在上述資料夾；未 commit。程式／測試共 5 檔，內容 1 檔；程式、黃金、內容與 REPORT 合計差異約 73 KB，低於 12 檔／25 檔／80 KB gate（模擬日誌為另列證據）。黃金 hash 依工作樹產生，領導收線時應在乾淨 worktree 重產；`src/ops/sim/fixtures/campaign-hash.json` 未動。

## 沒做到或證據不足的

`ops-leak` 的市場驗證使用 `base:market/war-armory`，因現有內容沒有位於 restricted 機製造勢力領地且販售機架的市場；故已證明「下一次弦月市場列出該型」，未能逐字證明「他家市場」。測試內的 `MechLoaned` 由開局 JSON 補丁建立，不是玩家實際接受 join 的操作事件。要端到端驗證實際 join 借出 restricted 機，需另改共用合約借機型號。

另兩條黃金只覆蓋已可達的戰爭事件：`ops-war-assault` 尚未證明後續 `sealing`（玩家需接受並打贏封裂防守）；`ops-relic` 尚未證明兩勢力 `same-target → tense`（目前凍結指令只有一勢力尋殼）。這些缺口不以 hash 通過冒充已驗。

不加 `--continue-after-end` 的 `idle --months 24 --seed 1` 在第 6 潮月、day 168 因 `CampaignEnd(ship-seized)` 停機，CLI 明確報 `campaign-ended-early`；不加旗標的 `merc --months 24 --seed 3` 在最新工作樹跑滿 24 潮月。證據見 `without-flag-*.log`。

`npm test` 的既有四紅由別線程式與舊 golden fixture 造成：`src/ops/sim/golden.test.ts` 目前事件數 337／hash `b134009c04569305`，fixture 為 295／`ff0f5a61ffac4a93`；`src/ops/sortie/entry.test.ts` 是戰果 JSON 來回後 `owner.layer/part` 的 undefined 欄位差異；MCP cli/e2e 為原有環境紅燈。沒有修禁區或重產舊 fixture。

另依頂層 AGENTS 跑 `bash wf/tools/wf-lint.sh --strict .`，exit 1：既有 `wf/workflows/inbox/ROSTER.md` 超 8 KB、`wf/workflows/dispatch/CLAIMS.md` 表格過大，另有 `legacy/docs/README.md`、`content/README.md` 大導覽清單。本線 REPORT 無 lint 違規；這項不在交接書固定六條驗收內。

## 需要決定的事

固定六條驗收均已達成。若後續要把黃金擴到 war-testing 逐字的全鏈路，需給 `sealing`、兩勢力同殼，以及 restricted 製造勢力自家機架市場的可重播起點；本線依交接書的固定驗收停在此處。範圍外 `src/ops/war/`、`src/ops/world/`、`src/ops/sortie/`、`src/ops/time/` 本線沒有修改。

### 以後交接書該點名的工具

`inbox_poll.sh --once`、`inbox_mail.sh --up`、`node --test --test-isolation=none`（真子測試數）、`--continue-after-end`（世界模擬要走滿潮月）、`GOLDEN_UPDATE=1`、同快照 `/tmp` 內容雙版本對照、`rg -c '^潮月 '`（避免早停仍印 OK）、`git diff --numstat`。
