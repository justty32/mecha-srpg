# cx-grid-verify2 — DONE（依交接書沙箱例外）

2026-10-24；teams/grid，上游 lead-grid。只採固定五條驗收；未 commit／push，保留其他線改動。

## 做了什麼

修正 MCP 測試的過期前提：原本 day 32 接 day 33 到期、需航行 5 天的契約，day 41 才出戰。現在依公開 travel／deadline 欄位選可履約契約，並確認抵達時仍 active；真實戰果、記錄與存讀檔 hash 斷言完整保留。

`sim:grid-health` 以首 12 潮月、終局前的遭遇數除以實際移動日。`shipMovedDay` 內部標記由每日回呼去重，涵蓋航行、航道在途及成功迴避走格；等船、停泊、無油不計。補上 greedy 每 seed 至少 3 次、全政策單日上限、12 月增量及 24 月末現金判準，移除第二年現金斜率 gate。

greedy 缺料不再永久等待空市場：比較補貨日與其他有貨市場的航程。random 有往返油量與現金時隨機選航程，完成後再抽目的地；遭遇優先在合法迴避／交涉間隨機選擇。數值只保留 swarm 接觸 3→2、護送契約 pay.base 3200→6400；生成量仍為 20。失敗與撤回試驗逐項記錄，沒有改文案、蝕格係數或戰術 AI。

改動清單見 [files.json](files.json)：18 件，扣除 4 件黃金後 gate 為 14／50；所有路徑均在授權範圍。最大新檔為 tuning.json，低於 40 KB。黃金重產時攻堅的待選回應由 36 次改為實際 33 次，原攻堅、拔錨、參戰付款、背叛及外流斷言保留。兩支 e2e 已讀，既有遭遇迴避後重下航行邏輯仍適用，無修改。

## 產出

新增測試「random 有補給時隨機航行、航程中等待，政策不改寫狀態」。既有 MCP 重播、移動日／等船／無油測試及健康輕量測試同步；健康測試以不合格遭遇、人口、蝕格、單日次數、提早終局與零現金輸入證明會變紅。

固定五條驗收：

1. `npm run typecheck`、`npm run check` 均 exit 0；內容 0 errors／8 既有 warnings。
2. `npm test`：146 檔，143 過、3 個已知沙箱例外，exit 1，沒有業務斷言失敗。前輪另抓到統計事件缺文字模板，已改為內部標記並通過可讀性回歸。最終 MCP 直接執行 6/6、健康輕量 1/1；政策定向 10/10、移動 8/8。完整 suite 已覆蓋最後版本。
3. `npm run sim:grid-health`：12 潮月九組全 PASS、exit 0，全文如下。
4. greedy seed 1–3 的正式 `npm run sim:campaign -- --months 24 --seed N` 均 exit 0、到 day 672，無終局；健康量測如下表，全 PASS。
5. REPORT、調參表與檔案清單存在，件數／容量 gate 未觸發，沒有範圍外修改。

`GOLDEN_UPDATE=1 node --test test/campaigns/*.test.ts` 2/2 檔通過；營運短黃金重產 1/1，後續完整 npm test 也通過黃金重播。原始輸出皆在 `/tmp/cx-grid-verify2/`：`final-typecheck.log`、`final-check.log`、`final-test.log`、`final-mcp-campaign.log`、`final-ops-sim-health.log`、`golden-final.log`、`final-campaign1.log` 至 `final-campaign3.log`。

| seed | 終局 | 第24月現金 | 第24月蝕格／陸格 | 第13–24月最大月增量 |
|---|---|---:|---:|---:|
| 1 | 無 | 2123.25 | 2367/16300（14.52%） | 147（0.90%） |
| 2 | 無 | 94909.96 | 2179/16300（13.37%） | 170（1.04%） |
| 3 | 無 | 10676.83 | 2680/16300（16.44%） | 221（1.36%） |

調參前後：本線新量測基線 greedy 為 5/27、0/10、0/4；最終為 45/117、24/95、25/112。random 基線 5/16、27/47、19/55；最終 13/45、18/65、15/101。seed 3 的 24 月基線 day 420 終局、末現金 0，最終無終局且 10676.83。分母均為實際移動日。完整歷程見 [tuning.json](tuning.json)，72 筆逐月值見 [final-months.json](final-months.json)；前線 25 列保留旋鈕與值，結果指回原表，避免複製膨脹。

預設量測最終輸出全文：

```text

> mecha-srpg@0.1.0 sim:grid-health
> node src/ops/sim/health.ts

idle seed=1 months=12 end=168 blight12=5.54% maxGrowth12=0.50% maxGrowth13..24=0.00% actors=63..112 encounters=4/4=1.0000/sailing-day maxDaily=1 cash=1200.00->0.00 cashMean13..24=0.00 PASS
idle seed=2 months=12 end=168 blight12=5.08% maxGrowth12=0.36% maxGrowth13..24=0.00% actors=79..114 encounters=6/6=1.0000/sailing-day maxDaily=1 cash=1200.00->0.00 cashMean13..24=0.00 PASS
idle seed=3 months=12 end=168 blight12=5.19% maxGrowth12=0.40% maxGrowth13..24=0.00% actors=47..112 encounters=4/4=1.0000/sailing-day maxDaily=1 cash=1200.00->0.00 cashMean13..24=0.00 PASS
greedy seed=1 months=12 end=none blight12=5.82% maxGrowth12=0.55% maxGrowth13..24=0.00% actors=79..122 encounters=45/117=0.3846/sailing-day maxDaily=1 cash=1200.00->10816.88 cashMean13..24=0.00 PASS
greedy seed=2 months=12 end=none blight12=5.20% maxGrowth12=0.34% maxGrowth13..24=0.00% actors=91..114 encounters=24/95=0.2526/sailing-day maxDaily=1 cash=1200.00->95843.03 cashMean13..24=0.00 PASS
greedy seed=3 months=12 end=none blight12=5.28% maxGrowth12=0.48% maxGrowth13..24=0.00% actors=46..120 encounters=25/112=0.2232/sailing-day maxDaily=1 cash=1200.00->11679.40 cashMean13..24=0.00 PASS
random seed=1 months=12 end=168 blight12=5.45% maxGrowth12=0.51% maxGrowth13..24=0.00% actors=91..112 encounters=13/45=0.2889/sailing-day maxDaily=1 cash=1200.00->-276.00 cashMean13..24=0.00 PASS
random seed=2 months=12 end=280 blight12=5.12% maxGrowth12=0.44% maxGrowth13..24=0.00% actors=55..115 encounters=18/65=0.2769/sailing-day maxDaily=1 cash=1200.00->-225.65 cashMean13..24=0.00 PASS
random seed=3 months=12 end=168 blight12=5.34% maxGrowth12=0.45% maxGrowth13..24=0.00% actors=89..128 encounters=15/101=0.1485/sailing-day maxDaily=1 cash=1200.00->-748.00 cashMean13..24=0.00 PASS
```

## 沒做到或證據不足的

沙箱外完整 npm test 與 Playwright 未執行；三個例外是 MCP socket CLI、MCP stdio 子行程與 worldgen spawnSync，符合交接書所列沙箱限制，交領導外跑。本報告不宣稱沙箱外驗收已完成。

SPEC-GAP：交接書的新判準優先於舊 spec。idle 只查每日上限，所以其列即使顯示率 1.0 仍 PASS；greedy／random 仍查 0.1–0.4。終局後只續跑世界以量滿月份，遭遇與移動日均截止終局。random 的航行優先與補料等待是模擬政策修正，沒有改玩家規則。第二年現金斜率只顯示、不作 gate，本線未處理第二年經濟另案。

## 需要決定的事

領導於沙箱外重跑完整 npm test／兩支 e2e，並在收線時同步 code-map／spec（本線禁止寫入那些 wf 路徑）。其餘無。

## 以後交接書該點名的工具

`node path/to/test.ts`：沙箱測試僅顯示檔級失敗時，用來定位實際 assertion；已由前線指出，本線沿用。無新增。
