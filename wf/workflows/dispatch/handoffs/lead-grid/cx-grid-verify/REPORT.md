# cx-grid-verify — FAILED

未達交接書固定六條驗收；保留現況，沒有 commit／push。資料截至 2026-10-24，量測使用真實政策與戰鬥 runner。

## 做了什麼

停泊時略過接觸與蝕域野群，進入目的地 footprint 後立即套用保護；裂獸失守地例外。巡邏只依 rep≤−30／war 判敵意；wary 只報 Sighted 並繞船。

加入 `sim:grid-health` 與單 seed 回歸；修正失守領地占用發約機會、greedy 付費買維修料、往返油量、近港補給、缺貨等待、履約與期限選擇。依 **19:48 lead-grid orders**，補 structure 重建所需既有維修係數及付料測試；這是授權補洞，不當作調參旋鈕。

完整改動清單：[files.json](files.json)，共 40 檔（排除黃金 28），均屬交接書範圍或上述 repair.json 授權；單一新檔最大為 tuning.json（34,307 bytes），未觸發 50 檔／40 KB gate。未修改其他線的工作。兩支 e2e 已讀，保留原測試流程。

## 產出

固定六條驗收狀態：

1. typecheck、check 均 exit 0；check 有既存 8 個 warning、0 errors。
2. `npm test`：tests 146、pass 139、fail 7。該次另有 tick／pressure fixture 失敗，已依新接觸半徑與潮壓設定修正，兩檔定向重跑 2/2 通過；未再整套重跑。剩餘非環境失敗為健康回歸及 MCP 契約過期，不能稱全綠。
3. 三類測試通過；`node src/ops/world/encounter.test.ts` 共 10/10。
4. 預設 12 潮月量測 exit 1：idle 三組 PASS，greedy／random 六組 FAIL。
5. 24 潮月未過：seed 3 第 420 天終局；第二年現金非負僅 1/3（需 ≥2），greedy 三組遭遇率均不足。
6. REPORT 與範圍清單已建立。

三類測試名稱：

- 「停泊安全：敵對接觸不開遭遇且 AI 不追船，失守城例外」
- 「巡邏敵意：初始聲望與 hostile 外交不停船，rep −30 或 war 才攔截」
- 「wary 只發 Sighted：商隊與獵團依 stance、不停船且 AI 繞船」

另有付料 structure rebuild、失守領地改由可用勢力發約，以及政策購料／缺貨等待測試。`GOLDEN_UPDATE=1 node --test test/campaigns/*.test.ts` 兩檔全過；短戰役黃金亦重產通過，保留戰役事件子序列、附帶損失、背叛聲望與技術外流斷言。

調參前（已修停泊／敵意）→最終；長陸陸格分母 16,300：

| seed | 第24月蝕格 | 第13–24月最大增量 | 第二年月均現金 | 終局日 |
|---|---|---|---|---|
| 1 | 39.97→11.33% | 5.38→0.60% | -1690.00→-1308.60 | 無→無 |
| 2 | 50.72→15.29% | 5.73→1.09% | -1195.15→-1715.50 | 616→無 |
| 3 | 44.55→15.82% | 5.85→1.20% | -2157.33→0.00 | 無→420 |

最終蝕格及增量三組均過；第12月蝕格 5.40%／5.69%／6.18%、人口 63–112／91–152／47–123 亦過。第二年現金依 `(第24月末−第12月末)/12`；seed 3 終局後現金維持 0，不能拿這個零變化當可玩性證據。

逐旋鈕與三 seed 結果：[tuning.json](tuning.json)；隨機政策試驗：[random-trials.json](random-trials.json)；最終逐月原值：[final-months.json](final-months.json)。保留的數值為潮壓蝕格係數 1→0、insect anchorAge spread 0.25→0.1、swarm contact 2→3、每日遭遇上限 2→1、scout 冷卻 8→2、報酬 1800→3600；**這些是未通過整體驗收的現況，不是完成版平衡建議**。

預設 `npm run sim:grid-health` 最終輸出全文：

```text
> mecha-srpg@0.1.0 sim:grid-health
> node src/ops/sim/health.ts

idle seed=1 months=12 end=168 blight12=5.44% maxGrowth12=0.38% maxGrowth13..24=0.00% actors=63..112 encounters=6/168=0.0357/day maxDaily=1 cash=1200.00->0.00 cashMean13..24=0.00 PASS
idle seed=2 months=12 end=168 blight12=5.18% maxGrowth12=0.34% maxGrowth13..24=0.00% actors=48..114 encounters=11/168=0.0655/day maxDaily=1 cash=1200.00->0.00 cashMean13..24=0.00 PASS
idle seed=3 months=12 end=168 blight12=5.21% maxGrowth12=0.45% maxGrowth13..24=0.00% actors=47..112 encounters=9/168=0.0536/day maxDaily=1 cash=1200.00->0.00 cashMean13..24=0.00 PASS
greedy seed=1 months=12 end=none blight12=5.40% maxGrowth12=0.40% maxGrowth13..24=0.00% actors=63..112 encounters=5/336=0.0149/day maxDaily=1 cash=1200.00->15703.25 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
greedy seed=2 months=12 end=none blight12=5.69% maxGrowth12=0.48% maxGrowth13..24=0.00% actors=91..152 encounters=0/336=0.0000/day maxDaily=0 cash=1200.00->22312.02 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
greedy seed=3 months=12 end=none blight12=6.18% maxGrowth12=0.57% maxGrowth13..24=0.00% actors=47..123 encounters=0/336=0.0000/day maxDaily=0 cash=1200.00->0.00 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
random seed=1 months=12 end=168 blight12=5.16% maxGrowth12=0.35% maxGrowth13..24=0.00% actors=47..112 encounters=5/168=0.0298/day maxDaily=1 cash=1200.00->1200.00 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
random seed=2 months=12 end=308 blight12=5.09% maxGrowth12=0.47% maxGrowth13..24=0.00% actors=80..136 encounters=27/308=0.0877/day maxDaily=1 cash=1200.00->1340.17 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
random seed=3 months=12 end=252 blight12=5.39% maxGrowth12=0.47% maxGrowth13..24=0.00% actors=46..126 encounters=19/252=0.0754/day maxDaily=1 cash=1200.00->-562.00 cashMean13..24=0.00 FAIL (encounters-outside-0.1..0.4)
```

三個 `npm run sim:campaign -- --months 24 --seed N` 均實跑 exit 0；其 OK 僅表示模擬 invariant 通過，不能代替健康門檻。`npm run sim:grid-health -- --months 24 --policy greedy` exit 1。完整指令輸出在 `/tmp/cx-grid-verify/final-*.log`。

## 沒做到或證據不足的

未修到第 2、4、5 條全過，故回報 FAILED。安全港減少遭遇；增加裂獸密度／半徑曾提高遭遇，但也增加耗油與機體損失。已試過的政策與供給／報酬調整仍無法同時達標，未修改退化下限或用舊結果冒充最終結果。

SPEC-GAP：wary 不停船依本交接書優先於舊 spec。19:10 orders 僅豁免 idle 遭遇下限，仍檢查平均≤0.4、單日≤2；greedy／random 保持 0.1–0.4。遭遇率分母為首12月內終局前天數；終局後僅續跑世界以量完整月份的蝕格與人口，第二年現金仍如實列出。

`src/mcp/campaign.test.ts:170` 的真實出戰重播測試收到 `inactive-contract`，直接執行也失敗，屬非沙箱問題。MCP cli／e2e 與 worldgen 子行程的 EPERM 為交接書已知沙箱限制；不能以它們解釋前述契約失敗。Playwright 依交接書留給領導在沙箱外執行，未宣稱 e2e 綠燈。

`wf-lint --strict` exit 1：範圍外 ROSTER oversize、CLAIMS BIGLIST；broken=0。未改寫這些檔案，也未把它們新增為第七條驗收。

## 需要決定的事

領導需決定下一輪如何處理長期補給、政策選約與遭遇率的取捨，及 MCP 測試過期契約的處置；不能直接把本線收為 DONE。code-map／舊 spec 與沙箱外 npm test／e2e 由領導同步及重跑。

## 以後交接書該點名的工具

`node path/to/test.ts` 可顯示沙箱 `node --test` 隱去的 assertion；月末狀態與指令紀錄可區分補給停滯、機體耗損與單純報酬不足。
