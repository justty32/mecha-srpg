# cx-fp-golden

已讀清單：
- `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`
- `wf/workflows/common/user.md`
- `wf/workflows/testing.md`
- `test/campaigns/rerecord.ts`（含檔頭說明）
- `test/campaigns/golden-spec.ts`
- `wf/workflows/dispatch/handoffs/lead-fill-pilots/fp-common.md`

另讀工作樹入口、SESSION-LOG、WAIT_USER、WORKFLOWS、conventions、code-map、dev-env 與五個目標測試檔；新信箱無信。

工作樹 HEAD：`f3592fef`。僅執行指定單檔測試與必要重錄，不跑 npm test／e2e／sim CLI／fuzz、不 commit／push。

開場 `git status --short` 已有 `?? node_modules`：它是指向 `/home/lorkhan/repo/game_dev/mecha-srpg/node_modules` 的既有符號連結，本線未建立、修改或刪除；結案另列本線變更。

## 驗收 1：指定五檔逐檔驗證

`GOLDEN_UPDATE=1` 重產後已移除該變數，五檔依序重跑皆 exit 0，合計 **31 pass／0 fail**。指令均為 `node --test --test-isolation=none <單檔>`；不隔離子程序讓 reporter 能顯示每個子測試的 pass/fail，仍只有一個檔案執行。

| 單檔 | pass | fail |
|---|---:|---:|
| `src/ops/crew/crew.test.ts` | 13 | 0 |
| `src/ops/sim/campaign.test.ts` | 6 | 0 |
| `src/ops/sim/golden.test.ts` | 1 | 0 |
| `src/mcp/campaign.test.ts` | 6 | 0 |
| `test/campaigns/campaigns.test.ts` | 5 | 0 |

原始驗證紀錄位於 `/tmp/cx-fp-golden/`，各檔名以路徑的 `/` 換成 `_` 後附 `.log`；結果彙總為 `verification.json`。沒有跳過、取消測試。

## 驗收 2：變更範圍

本線修改均為測試或測試 fixtures，沒有非測試 src、content 變更。開場既有的未追蹤 `node_modules` 連結仍原樣存在。以下貼原始 `git -C <worktree> status --short`（未隱藏既有連結）：

```text
 M src/mcp/campaign.test.ts
 M src/ops/crew/crew.test.ts
 M src/ops/sim/campaign.test.ts
 M src/ops/sim/fixtures/campaign-hash.json
 M test/campaigns/campaigns.test.ts
 M test/campaigns/golden-spec.ts
 M test/campaigns/ops-betrayal.hash.json
 M test/campaigns/ops-merc-join.hash.json
 M test/campaigns/ops-merc-join.json
 M test/campaigns/ops-relic.hash.json
 M test/campaigns/ops-relic.json
 M test/campaigns/ops-war-assault.hash.json
?? node_modules
```

## 驗收 3：每個改動檔與原因

`src/ops/crew/crew.test.ts`：新增池改變第一個候選的地點；改選船已停靠且付得起聘金的候選。完整 state 決定性、聘金扣款、名冊加一與帳本斷言保留。

`src/ops/sim/campaign.test.ts`：seed 7 的新招募軌跡使無駕駛員終局提前；固定期望由 132 天／4 次月結改為 104 天／3 次。每日不變量、唯一終局與故意污染資料的反向驗證保留。

`src/mcp/campaign.test.ts`：新遭遇軌跡令五日航程拖成十一日，原 `contract-261` 在第 40 天抵達時已超過第 39 天期限。承接門檻的途中事件餘裕由 2 日改為 7 日，仍實際航行、確認契約有效、跑真實 AI 戰鬥、存檔再載入並比對 snapshot hash；失敗訊息補完整契約，修正原有「30 天」註解為實際 60 次迴圈。

`test/campaigns/ops-merc-join.json`：改接新軌跡中的 `contract-363`，仍參與 `operation-5`、前往 ridge；重錄四次 sortie 的編號（370、374、377、380）、對應紀錄與 RNG，保留原戰果。69 條指令、結束第 50 天。

`test/campaigns/golden-spec.ts` 與 `test/campaigns/campaigns.test.ts`：傭兵加入及結算的契約參照由 126 換為 363；事件子序列、附屬部隊損失大於零與 join-pay 帳目斷言原樣保留。

`test/campaigns/ops-relic.json`：原 504 天不足；用 `EXTEND_DAYS=1008 node test/campaigns/rerecord.ts ops-relic` 逐日延長，工具在第 896 天滿足完整子序列後停止。保留奪取 old-array 殼、開啟 old-array 血統與發表 old-array-ii，沒有跳過或替換事件；1056 條指令。

以下五個 hash 均由 `GOLDEN_UPDATE=1 node --test --test-isolation=none <對應單檔>` 產生。共同原因是新增 40 個招募池的抽樣消耗改變後續亂數軌跡；沒有修改遊戲邏輯或內容。

- `src/ops/sim/fixtures/campaign-hash.json`：固定指令的事件軌跡改變；`07c3c825c99f6b2c` → `3c8814d7d531c515`，799 → 795 事件，仍第 31 天。
- `test/campaigns/ops-war-assault.hash.json`：招募後事件軌跡改變；`dae8ea5472ada9e6` → `8f5c3d2665ae48b1`，504 → 503 事件，仍第 16 天。原指令及攻城子序列皆可沿用。
- `test/campaigns/ops-relic.hash.json`：招募軌跡改變後逐日延長至機型發表；`2910e229aebb4d67` → `7d50e9aa5867bcb1`，9469 → 19897 事件，第 504 → 896 天。
- `test/campaigns/ops-merc-join.hash.json`：招募軌跡改變契約與出擊流水號，重錄同一作戰；`98f70fcd3e4edccc` → `5f4014ad02b75c28`，1295 → 1299 事件，仍第 50 天。
- `test/campaigns/ops-betrayal.hash.json`：招募軌跡使事件內容改變；`564c4fe4b670953f` → `db09bf4e32f144ad`，仍 259 事件、第 6 天。原承接、取消、倒戈序列與聲望／黑名單斷言保留。

`ops-leak` 的重產值與原值相同，沒有檔案變更。`rerecord.ts`、ops-war-assault 與 ops-betrayal 的指令檔也沒有差異。不新增驗收、不跑全套 npm test／e2e／sim CLI／fuzz、不 commit、不 push、不裝依賴、不刪檔、不動主工作樹。
