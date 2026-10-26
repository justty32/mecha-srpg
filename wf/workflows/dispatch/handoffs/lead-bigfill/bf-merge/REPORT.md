# 已讀清單

相對路徑均以 `/home/lorkhan/repo/game_dev/mecha-srpg/` 為根，逐檔親自讀取：

- `AGENTS.md`
- `wf/workflows/content/README.md`
- `wf/workflows/content/batch.md`
- `wf/workflows/content/ops-content.md`
- `content/lore/README.md`
- `wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`（含重負載限制）
- `wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md` 第 2 節

另讀本線交接書，以及工作樹的 SESSION-LOG、WAIT_USER、WORKFLOWS、common/user、common/data-files、inbox/README。

## 結果與範圍

終局 `BLOCKED`：三項內容檢查通過，但指定 content_gate 的規則無法驗收本任務指定的工作樹與插入方式。保持插入結果供領導接手；未宣稱 DONE，未改閘門或擴大 manifest 的 allow.kinds。

共處理 17 批：72 條 inserts 套用 58、同值去重略過 14；timeline-add 套用 23，另補 8 條既定事件年表以達 main 的 0 警告基準，年表總新增 31（191→222）。既有年表另有 4 處僅補 event 鍵，已計入 58 條 inserts。

改動 39 個既有檔，最大檔案增量為 timeline.json 的 10,107 bytes；均低於 80 檔／30 KB 門檻。既有值保持；只插入指定檔案，未修改預先帶入的 215 個新檔、src、test、黃金、索引、批次帳本或 .git，未 commit。JSON 使用原檔縮排；diff 中刪除行來自陣列新增項時的逗號／空陣列展開，與物件補鍵時的逗號。

## 套用統計

略過的 14 條全部是跨批相同港口 tag，原因均為「同檔同路徑同值重複」。缺目標、缺 id、既有鍵異值均為 0。逐條證據在 [application-log.json](application-log.json)。

| 批次 | inserts 套用 | 略過 | 年表插入 |
|---|---:|---:|---:|
| bf-deep-01 | 5 | 0 | 3 |
| bf-deep-02 | 1 | 0 | 4 |
| bf-deep-03 | 9 | 0 | 4 |
| bf-deep-04 | 2 | 0 | 6 |
| bf-deep-05 | 4 | 0 | 1 |
| bf-deep-06 | 3 | 0 | 5 |
| bf-moon-01 | 5 | 0 | 0 |
| bf-moon-02 | 4 | 0 | 0 |
| bf-moon-03 | 3 | 0 | 0 |
| bf-play-01 | 8 | 0 | 0 |
| bf-play-02 | 7 | 1 | 0 |
| bf-play-03 | 4 | 2 | 0 |
| bf-play-04 | 0 | 3 | 0 |
| bf-play-05 | 0 | 2 | 0 |
| bf-play-06 | 0 | 2 | 0 |
| bf-play-07 | 0 | 3 | 0 |
| bf-play-08 | 3 | 1 | 0 |

補齊的 8 條年表是月面三批空 timeline-add 未列出的已發生事件：日期、標題、摘要、era、factions 全取既有事件欄位，無新寫敘事，並依日期插入同年 year-only 區段。8 條詳見 application-log 的 validation-repair 列。沒有把 occurs: possible 事件加入年表。新檔格式修正 0。

## 三項檢查

每次檢查前均執行指定 pgrep；排除僅在自身啟動參數中出現關鍵字的 sandbox/shell 後，無其他測試／sim／fuzz 行程，三項依序執行。未跑 npm test、e2e、sim、fuzz、content_accept 或額外驗收。

- `node content/lore/check.ts`：exit 0，末行 `errors=0 warnings=0`。main 同 HEAD 的唯讀 git archive 基準亦為 `errors=0 warnings=0`；初次合併檢查 8 個未入年表警告，補齊後歸零。
- `npm run check`：exit 0，末行 `OK 0 errors, 10 warnings`。
- `npm run typecheck`：exit 0，末個非空輸出行 `> tsc --noEmit && tsc --noEmit -p tsconfig.ui.json`。

原始輸出：[main lore](main-lore.log)、[lore](lore.log)、[check](check.log)、[typecheck](typecheck.log)。

## 閘門與需要決定

按照指定命令以 [bf-merge.manifest.json](bf-merge.manifest.json) 自驗，exit 1，末行：

```text
FAIL batch=bf-merge mode=add approved=38 violations=216
```

原始證據：[gate.log](gate.log)。工具本身執行成功，但契約不能表達本線的兩種情形，因此按「工具壞／測不出來」回 BLOCKED：

1. 215 個預先帶入的未追蹤新檔全部報 PATH，因交接書固定 `allow.kinds: []`，閘門卻掃描整個 worktree，沒有只驗本線既有檔的篩選接口。未刪除、搬走、隱藏或追蹤這些檔來繞過驗收。
2. `content/lore/timeline.json` 報 SUPERSET：`$.entries[5]（舊元素不見或被改）`。現有 superset 對陣列元素用完整相等比對；本任務要求在既有年表物件補 event 鍵，因此物件不再與原物件完整相等。2066 渡月航路定班，以及 2105 仙台、2107 白汊、2107 舊船覆幕共四處皆只補缺鍵，沒有改原欄位。需領導安排支援既有物件補鍵、且能排除預帶新檔的正式閘門驗收；本線未獲授權修改工具或 manifest 固定要求。

既有 setKey 異值與缺 id：無。改過的 tag 共 29 筆（21 個 `地方史`、8 個補齊條目的月面分類），均轉為既有 timeline tag，按事件意義使用 dig、mech、monster、relief、rumor、memorial、reconstruction、debt、trade、labor、politics、migrant-crew；逐筆對照在 [tag-changes.json](tag-changes.json)，請領導審閱。補入的 8 條均已確定發生，未將其改成 possible 來消除警告。

## git diff --stat 原文

```text
 content/base/world/factions-ops/anvil-hunters.json |   4 +-
 content/base/world/factions-ops/dhaka-weavers.json |   4 +-
 .../base/world/factions-ops/imperial-court.json    |   4 +-
 .../base/world/factions-ops/inner-sea-houses.json  |   3 +-
 .../base/world/factions-ops/japan-umbrella.json    |   4 +-
 content/base/world/factions-ops/nairobi.json       |   3 +-
 .../factions-ops/north-american-umbrella.json      |   3 +-
 content/base/world/factions-ops/quito.json         |   3 +-
 .../base/world/factions-ops/residual-league.json   |   5 +-
 .../base/world/factions-ops/russia-umbrella.json   |   3 +-
 .../base/world/factions-ops/salt-gull-hunters.json |   4 +-
 .../world/factions-ops/selene-whitegloves.json     |   4 +-
 content/base/world/places/chittagong.json          |   3 +-
 content/base/world/places/dhaka.json               |   4 +-
 content/base/world/places/singapore.json           |   3 +-
 content/lore/characters/claire-renaud.json         |   8 +-
 content/lore/characters/eugenia-ferrero.json       |   5 +
 content/lore/characters/kim-haneul.json            |   5 +
 content/lore/characters/lena-visser.json           |   8 +-
 content/lore/characters/marta-bellini.json         |   8 +-
 content/lore/characters/oskar-lind.json            |   8 +-
 content/lore/characters/wanjiku-kamau.json         |   5 +
 content/lore/factions/backside.json                |   3 +-
 content/lore/factions/ground-union.json            |   7 +-
 content/lore/factions/japan-umbrella.json          |   3 +
 content/lore/factions/league.json                  |   3 +-
 content/lore/factions/nairobi.json                 |   3 +-
 content/lore/factions/north-american-umbrella.json |   3 +-
 content/lore/factions/quito.json                   |   3 +-
 content/lore/factions/salt-gull.json               |   3 +-
 content/lore/factions/selene.json                  |   4 +-
 content/lore/factions/shell-society.json           |   3 +-
 content/lore/factions/shell-wardens.json           |   3 +-
 content/lore/factions/sydney.json                  |   3 +-
 content/lore/factions/tide-creed.json              |   3 +-
 content/lore/factions/whitegloves.json             |   3 +-
 content/lore/places/ferry-lane.json                |   3 +-
 content/lore/places/tranquility-city.json          |   3 +-
 content/lore/timeline.json                         | 416 ++++++++++++++++++++-
 39 files changed, 534 insertions(+), 36 deletions(-)
```

## 固定三條驗收

1. 通過：lore 0 錯／0 警告，check 0 errors，typecheck exit 0。
2. 阻塞：指定 content_gate 未回 OK；完整證據與兩個規則衝突如上。
3. 通過：本 REPORT 含逐批套用統計與 git diff --stat。

base：`8a48e7ef3e982b278e382d8a166cfc05a8564428`。未自行追加驗收項目。
