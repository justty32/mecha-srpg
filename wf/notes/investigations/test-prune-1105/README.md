# 測試瘦身盤點 2026-11-05

[investigations](../README.md)｜逐檔清單 [prune.json](prune.json)｜基準 [verify-head-1105](../../../workflows/dispatch/handoffs/verify-head-1105/REPORT.md)

本階段只審查、只規劃，沒有刪改任何測試，也沒有跑 node。testing 是單檔工作流（[testing.md](../../../workflows/testing.md)），所以本筆記放在 investigations。

## 問題

使用者要求「測試盡量刪一刪」。要逐檔判斷哪些測試該保留、合併、刪除，估算刪後剩多少案、全套省多少時間，並找出需要使用者拍板的檔案，以及和試玩修正線衝突的檔案。

## 方法

- 逐檔案數與耗時取自 HEAD 基準 `suite.tap`：1143 案，nice 19、concurrency 1，共 1690 秒。用測試名稱把 TAP 頂層案對回 169 個來源檔，含迴圈生成的子案。
- `src/mcp/ui.test.ts` 的 2 案不在基準內，另外補上。e2e 與 python 的案數用 grep 估。
- 由頂層加兩個 Sonnet 子 agent 分批審查。審查讀斷言形狀，不只看檔名。長檔用 grep 抓 `hash`、`.length, N`、中文字串、內容 id 與精確分數。
- 頂層複核了黃金機制（`test/golden.test.ts`、`test/campaigns/campaigns.test.ts`、`src/ops/sim/golden.test.ts`），並改判 `src/content/lint.test.ts`。
- 試玩修正線的衝突，依兩個來源判斷：該 worktree 分支相對 main 的已提交 diff（只用 git 讀，沒進目錄），以及 [試玩報告](../../../workflows/dispatch/handoffs/playtest-1105/REPORT.md) 列的修正範圍。

## 發現

**統計**（node 套件 170 檔／1145 案）：

| 裁定 | 檔數 | 案數 | 預估刪除案數 |
|---|---|---|---|
| 保留 | 144 | 956 | 98（其中 42 檔「留檔、刪部分案」） |
| 合併 | 8 | 48 | 19 |
| 刪除 | 18 | 141 | 103（其中 7 檔仍留少數案） |
| 合計 | 170 | 1145 | **約 220** |

- e2e 4 檔共 25 案，建議刪 10 案（版面幾何、手機尺寸、localStorage 細節）。
- python 4 檔共 89 案，全留：屬工作流工具測試，不在 `npm test` 裡，不擋開發。
- art 8 檔共 86 案屬範圍外（離線美術試作，不在 glob 裡）。

**刪除集中在三塊**：

1. UI 文案與 class 斷言，以及工單命名的檔（回饋 N、B0x、K1／K2、R0x、U02、W0x）。例如 `vm/feedback`、`ops/vm/ops-updates`、`wiki/cards-new`、`wiki/index-new`、`dom/render`、`ops/dom/render`、`dom/uifix`。
2. AI 評分精確值與 profile 微調。例如 `ai/score`、`ai/playtest-fixes`、`ai/demo-duration`，以及 `ai/intent`、`ai/unit-roles`、`ai/tactics-coverage` 的一部分。
3. 綁定真實內容 id 或數量的斷言。例如 `world/third-blade-ops`、`sim/combined-arms`、`sortie/encounter` 的六個具名遭遇、`lords` 寫死的王跡原文與 9 格、`rnd` 的血統 id。另有單行計數斷言，改行即可：28 動詞、place 10、ledger 4／roster 7、actor 5、frame≥2。

**原則上全留**：

- `src/core`（rng 參考序列、numexpr、eventlog）。
- `src/rules` 全部：都用 `rtest`／`cb` 合成 fixture，不吃真實數值。
- `test/rules/regress`、`test/sim/save`、`test/sim/invariants`、`fuzz`、`vm/boundary`。
- MCP 的 protocol、batch、e2e、sortie。
- 載入器與 schema（`content`、`ops/content/*`）。
- ops 規則：帳本、債務、傭兵、戰爭、航行。

**時間**：

- 全套 1690 秒裡有 5 檔佔 1000 秒：`war-invariants` 619、`sim/campaign` 155、`campaigns` 80、`health` 62、`ops/vm/controller` 51。
- 以預設 concurrency 8 跑時，`war-invariants` 單檔就是整體牆鐘時間的下限，所以縮它是最大的一筆。

## 結論

**刪後剩約 925 案**，約為現在的 81%。案數降得不多，**時間省得多**：

| 改法 | 省 |
|---|---|
| `war-invariants`：6seed×3 策略×6 月、逐日檢查 → 2seed×3×4 月、每 7 日抽查 | 約 460 秒 |
| `sim/campaign`：刪 random×3seed 與假 runner 兩案 | 約 135 秒 |
| `ops-relic` 移出預設跑 | 76 秒 |
| `health` 改成合成列純函式測 | 61 秒 |
| `entry`／`replay` 共用同一場戰役 | 約 33 秒 |
| UI、AI、sim 長案刪減 | 約 85 秒 |
| `lords`、`board`、`mcp/campaign`、`cli` | 約 45 秒 |

- 合計約省 890 秒：序列跑 1690 秒 → 約 800 秒，縮短約 53%。
- 預設並行跑的牆鐘時間由 `war-invariants` 決定，預估從約 10 分鐘降到 2～3 分鐘。這是推估，沒有量過，要實跑一次確認。

**黃金建議**：

- 戰鬥黃金（`test/golden`）6 條留 3 條：`combat-layers`、`combat-conduct`、`people-capture`，涵蓋層結算、傳導、捕捉與 spawn。刪 `tenth`、`eject`、`berserk`：這三項已有 `flow`、`will`、`regress` 的規則測試。
- 營運黃金留 2 條：`src/ops/sim/golden`（30～60 指令，2.9 秒）和 `ops-war-assault`。其餘 `betrayal`、`leak`、`merc-join`、`grid-actors` 拿掉 `hash.json` 比對，只留事件子序列與行為斷言。`ops-relic` 移出預設跑。
- `sortie/encounter` 的 fnv 指紋 2 條刪除。
- `test/sim`、MCP 裡的 hash 都是同一次執行內兩條路徑互比，不是錄好的值，改數值不必重錄，全部保留。
- 使用者已不追認 `a3407d97` 的黃金改寫。在 10/28 九條比對完成前，任何黃金都不重錄、不刪：先比對，再瘦身。

**需使用者拍板**（刪了會降低真實保護力，共 11 檔）：

1. `test/golden`：錄製型的戰鬥決定性只剩 3 條。
2. `src/ops/sim/golden`：作為營運主黃金，但它的 hash 是 `a3407d97` 重錄的，未獲追認。
3. `campaigns` 與 `grid-actors`：放掉 4 條 hash 和 `ops-relic`，等於放掉長程存檔相容的整體把關。
4. `health`：不再跑 greedy 12 蝕月，AI、蝕、遭遇三者的整體退化改靠手動量測。
5. `war-invariants`：覆蓋面從 18 組逐日檢查降為 6 組抽查。
6. `ai/intent` 刪 8 案：都是撤退意圖的細節，試玩線正在改棄守區。
7. `sim/combined-arms` 刪 7 案：這是唯一真實常規車加怪獸的端到端驗收。留 2 案，併入 `seams`。
8. `ops/vm/ops-updates` 整檔刪：R05 大潮預報演算法沒有其他測試，刪前要補一案純函式測試。
9. `e2e/battle` 與 `e2e/ops-map`：手機與窄窗版面案可能擋過真實溢出 bug。

**和試玩修正線衝突**（25 檔，排在它 merge 之後處理）：

- **該線已直接改到**：`src/mcp/battle.test.ts`。該線還新增了 `src/mcp/playtest-1105.test.ts`、`test/content/playtest-1105.test.ts`，merge 後要一併審。
- **命中與準度**：`rules/aim`、`rules/attack`、`rules/contribs`、`test/rules/monster-def`、`test/rules/regress`（ISS-012）、`sim/run`、`ai/part-aim`、`ai/demo-duration`、`test/golden`。
- **AI 行為**：`ai/intent`、`ai/score`、`ai/balance`、`ai/playtest-fixes`、`ai/knowledge`、`ops/sim/health`、`ops/sim/policies`。
- **MCP 與 UI 標籤**：`mcp/battle-info`、`vm/viewmodel`、`vm/controller`、`vm/feedback`、`dom/render`、`wiki/cards`。
- **士氣效果名與遭遇內容**：`sortie/entry`、`sortie/encounter`、`ops/sim/policies`。

其餘約 145 檔可以先做，但全套驗收仍要等 merge 後一次跑。

**建議順序**：

1. 先做「不衝突、不需拍板」的刪除與合併：約 150 案，加上計數斷言的單行修改。
2. 試玩線 merge 後，處理 25 個衝突檔。
3. 黃金比對線結束、使用者拍板後，處理黃金與長跑測試的縮減。

每階段跑一次全套，綠燈且案數符合預估才 commit。刪檔前依使用者偏好要先問。

## 來源

- 逐檔裁定、理由、衝突與拍板旗標、基準秒數：[prune.json](prune.json)。
- 案數與耗時取自 `wf/workflows/dispatch/handoffs/verify-head-1105/suite.tap` 和 `sources.txt`。
- 試玩修正線的已提交 diff：`git diff main...worktree-agent-a28ab34454695e99f --stat`。
- 未提交改動看不到，所以衝突清單是依修正範圍推估的。

## 第一階段結果（2026-11-05 執行）

使用者 2026-11-05 授權：拍板項全部同意，但黃金類和 25 個衝突檔這次不動。

**做了什麼**：動了 56 個測試檔（含 e2e 4 檔；改 48、刪 7、增 1），整檔刪除的 7 檔是：`third-blade-ops`、`dom/grid-view`、`ops/vm/ops-updates`、`wiki/cards-new`、`wiki/index-new`、`test/sim/combined-arms`、`test/sim/replay`（後兩檔的保留案分別移到 `seams`、`test/sim/session`）。新增 1 案 `src/ui-adapter/ops/vm/calendar.test.ts`，以純函式測大潮預報 `nextGreatTide`。已拍板並在本階段完成的有 `war-invariants`、`combined-arms`、`ops-updates`、e2e 版面案。

**案數**：node 全套 1143 → **1012**，全綠，淨減 131 案，計畫 135 案，差 3%。差異來源：
- `lords` 有兩案改成併入，沒有刪，因為它們是 shiftBlight 改區與 RNG 獨立的唯一覆蓋。
- `rep-gate` 的「固定 frame 清單」用的是合成 model，判定應保留。
- 各檔的案數有幾處算法差異，例如 describe 內的案、迴圈生成的案。

e2e 由 29 案減到 19 案。依「一次只准一個 node」的規矩**未實跑**。計畫用 grep 數 e2e，`battle`、`ops-map` 的 mouse／touch 迴圈少算了 4 案。

**耗時**：
- 序列全套（nice 19、concurrency 1）**估算**約 1060 秒，瘦身前 1690 秒。估法是基準各案的 duration 減掉被刪的案，再加上新案在單檔批次的實測值。
- 本階段的實測 4501 秒不可比：同時段另一條線在 /mnt/c 上大量 `git rm`，平常 1～3 秒的案被拖到 70～108 秒。
- `war-invariants` 單檔 619 → 約 150 秒。

**覆蓋缺口**：`cards-new` 刪除後，下列項目在非衝突的 wiki 測試裡沒有對應覆蓋，第二階段處理 `cards.test.ts` 時考慮補：
- W01 怪獸蛻變目標
- W03 部件修正／附加層／共鳴
- W03 天象湧現卡
- W04 枚舉轉中文

**沒做的選做項**：
- `mcp/campaign` 的 campaign_auto 改 idle：沒有把握語意不變。
- `lords` 北行存讀 36 秒的案沒有縮。
- `ops/sim/replay` 承接 `entry` 兩案：`entry` 在衝突清單裡。

## 剩餘階段

**第二階段**，試玩修正線 merge 後處理衝突檔，約 79 案：
- `ai/intent` 8 案（已拍板）
- `ops/sim/health` 改合成列純函式（已拍板，約省 60 秒）
- `vm/feedback` 12 案、`dom/render` 12 案、`viewmodel` 7 案、`policies` 6 案、`score` 5 案、`wiki/cards` 5 案、`encounter` 5 案（不含指紋）、`vm/controller` 4 案、`playtest-fixes` 4 案
- `battle-info`、`attack`、`demo-duration`、`sim/run` 各 2 案
- `balance`、`entry` 各 1 案。`entry` 要併進 `ops/sim/replay`，並把 months 2 改 1。
- 同步審試玩線新增的 `src/mcp/playtest-1105.test.ts`、`test/content/playtest-1105.test.ts`。
- `aim`、`contribs`、`knowledge`、`part-aim`、`monster-def`、`regress`、`mcp/battle` 不刪案，只需依該線改動同步。

**第三階段**，黃金比對線完成、使用者裁決 `a3407d97` 之後：
- `test/golden` 6 條留 3 條。
- `src/ops/sim/golden` 的 hash 重新認定。
- `campaigns`：`ops-relic` 移出預設跑；`betrayal`／`leak`／`merc-join` 拿掉 hash。
- `grid-actors` 拿掉 `hash.json` 比對。
- `encounter` 的 fnv 指紋 2 案刪除。

兩階段做完，預估序列全套約 800 秒。
