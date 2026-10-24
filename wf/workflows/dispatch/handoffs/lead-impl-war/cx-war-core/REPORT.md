# cx-war-core 作戰核心與外交交接：BLOCKED

## 做了什麼

終局 BLOCKED：六項固定驗收中第2項尚未成立。新增fuzz測試在單獨執行仍超過20秒上限，位於本線禁區；另有G6的實際後果尚未完整落地，需要領導決定涉及市場/服務/勢力經濟的跨線補作。保留所有成果與證據，未宣稱DONE。

實作獨立 warRng、Loc轉接、常備軍及補員、十種作戰模板與階段機、抽象結算、六態滯後外交、七類條約介面、14列非玩家驅動，接入世界第2段。merc/rnd按交接書只留stub與機型池。開局候鳥號明確是玩家船團（faction/migrant-crew、ship/migrant-bird與start/default），排除外交；裂獸亦排除。

初始化8個非玩家人類勢力、28對關係、9血統、30機型、8古代殼；原3個勢力定義只修改selene的roster。新增勢力限定war牌道，不放大既有契約牌抽取。成功奪點更新ownerOverride與territoryNow，攻堅實際設unanchored。細部規格未落地項見第三段，不能據測試綠燈宣稱它們已完成。

固定六項驗收：

1. typecheck exit 0；world內容檢查與npm run check皆0 errors/0 warnings。
2. war單元64項全綠；相關既有回歸合計72項全綠。完整npm test最後一次106檔：103通過、3失敗（兩項MCP沙箱失敗與新加入fuzz的20秒併行逾時）。`npm test -- --test-concurrency=1`亦為103/106（後置旗標未達到預期串行效果）；單獨fuzz測試2過、1於20秒逾時，30場模擬最終硬違規0但測試本身未通過。未改斷言、未停用測試或放寬timeout。
3. 舊ops測試不改斷言；新war內容缺席時initWar不加狀態欄、不消耗rng。原golden因本線重產轉綠。
4. seeds 1/2/3 各24潮月均OK，皆有war、ceasefire、NodeTransferred、OperationResolved；每日最多3/5/3場，最長22/25/23天；war最高1/28，同盟最高1/28、0、1/28。逐月如下，完整原始輸出見idle-1/2/3.log。
5. seed 1完整CLI實測4.014秒（user3.47/system0.12），低於7.2秒。效能快取只作用不可變內容；終止作戰丟棄不再用的gp/出資快照。
6. Loc grep只有loc.ts兩行，完整輸出見loc-grep.log：locNode與sameRegion存取region，其餘ops（含非測試）無命中。

## 產出（含完整檔案清單）

完整絕對路徑清單在[files.json](files.json)。程式新增/修改共25檔（含golden fixture）、內容新增80檔、程式diff約100KB；均未達30/120/150KB gate。沒有commit，沒有改別線檔案。對外型別變更表在[types.json](types.json)，SPEC-GAP完整表在[spec-gaps.json](spec-gaps.json)，每日極值與事件計數在[simulation.json](simulation.json)。

新事件：OperationStarted、OperationPhase、OperationEngaged、OperationResolved、OperationFailed、OperationAborted、ShellSeized、NodeTransferred、RelationChanged、TreatySigned、TreatyExpired、TreatyBroken、WarDeclared、TechLeaked。沿用RiftPhase、NodeReclaimed、WorldAction；RelationChanged僅由世界第2段flush發出。

黃金hash依GOLDEN_UPDATE=1重產：`16912a55fda78809`（263 events）→`ed3afe0c8cbd743b`（291 events）；day均31。

## 沒做到或證據不足的

參戰契約與研發推進按授權留stub；released/join統計現為0。未修改spec、code-map或上層SESSION-LOG（超出本線寫入範圍，交領導維護）。

除了交接書明示的stub，尚有真正未完成的規格後果：市場補貨、封港關閉服務、圍城人口減損、勢力現金/stock與trade/tribute/proxy/shell-pact經濟/研發條款。目前僅保存旗標或提供條約介面；詳見G6，不能當作完整的這些玩法。第三刃/背面走私網的holder與maker也只是代管映射（G2）。

開工npm test實際沙箱輸出104檔101綠3紅：MCP cli/e2e與ops golden。它與交接書記載509項4紅不同，故保留新證據，不拿舊計數替代。本線期間其他線測試持續變動；最後完整suite多出fuzz逾時，單獨執行亦重現（fuzz-alone.log，test/fuzz/fuzz.test.ts:127）。解除條件：對應線修復該測試或在可滿足既定20秒上限的環境重跑；本線不得修改test/fuzz或測試上限。

## 需要決定的事

需領導確認G2的代管勢力與G7攻堅大潮確認策略，以及G6未完成後果應另派線或允許補齊所需世界市場/勢力經濟欄位。第2項尚有非本線新增紅燈，需對應線解除後再收線。G6若屬本線必交，需具體放行市場/服務模組或另派線完成；目前不把僅有旗標當成已實現的經濟效果。本線未擅改任何既有測試斷言。

### 三個seed的24潮月idle摘要

seed 1（月／作戰／war／allied／釋出／join）：

```text
1 / 0 / 1 / 0 / 0 / 0
2 / 0 / 0 / 0 / 0 / 0
3 / 0 / 0 / 0 / 0 / 0
4 / 0 / 0 / 0 / 0 / 0
5 / 0 / 0 / 0 / 0 / 0
6 / 0 / 0 / 0 / 0 / 0
7 / 1 / 0 / 0 / 0 / 0
8 / 2 / 0 / 0 / 0 / 0
9 / 0 / 0 / 0 / 0 / 0
10 / 0 / 0 / 0 / 0 / 0
11 / 2 / 0 / 0 / 0 / 0
12 / 0 / 0 / 0 / 0 / 0
13 / 1 / 0 / 1 / 0 / 0
14 / 0 / 0 / 1 / 0 / 0
15 / 1 / 0 / 1 / 0 / 0
16 / 0 / 0 / 1 / 0 / 0
17 / 1 / 0 / 1 / 0 / 0
18 / 2 / 0 / 1 / 0 / 0
19 / 0 / 0 / 1 / 0 / 0
20 / 0 / 0 / 1 / 0 / 0
21 / 0 / 0 / 1 / 0 / 0
22 / 2 / 0 / 1 / 0 / 0
23 / 0 / 0 / 1 / 0 / 0
24 / 2 / 0 / 1 / 0 / 0
```

seed 2（月／作戰／war／allied／釋出／join）：

```text
1 / 0 / 1 / 0 / 0 / 0
2 / 0 / 0 / 0 / 0 / 0
3 / 1 / 0 / 0 / 0 / 0
4 / 1 / 0 / 0 / 0 / 0
5 / 1 / 0 / 0 / 0 / 0
6 / 2 / 0 / 0 / 0 / 0
7 / 0 / 0 / 0 / 0 / 0
8 / 1 / 0 / 0 / 0 / 0
9 / 1 / 0 / 0 / 0 / 0
10 / 0 / 0 / 0 / 0 / 0
11 / 1 / 0 / 0 / 0 / 0
12 / 1 / 0 / 0 / 0 / 0
13 / 0 / 0 / 0 / 0 / 0
14 / 0 / 0 / 0 / 0 / 0
15 / 1 / 0 / 0 / 0 / 0
16 / 1 / 0 / 0 / 0 / 0
17 / 1 / 0 / 0 / 0 / 0
18 / 2 / 0 / 0 / 0 / 0
19 / 0 / 0 / 0 / 0 / 0
20 / 1 / 0 / 0 / 0 / 0
21 / 1 / 0 / 0 / 0 / 0
22 / 2 / 0 / 0 / 0 / 0
23 / 1 / 0 / 0 / 0 / 0
24 / 0 / 0 / 0 / 0 / 0
```

seed 3（月／作戰／war／allied／釋出／join）：

```text
1 / 0 / 1 / 0 / 0 / 0
2 / 1 / 0 / 0 / 0 / 0
3 / 2 / 0 / 0 / 0 / 0
4 / 1 / 0 / 0 / 0 / 0
5 / 0 / 0 / 0 / 0 / 0
6 / 2 / 0 / 0 / 0 / 0
7 / 3 / 0 / 0 / 0 / 0
8 / 2 / 0 / 0 / 0 / 0
9 / 2 / 0 / 0 / 0 / 0
10 / 1 / 0 / 0 / 0 / 0
11 / 0 / 0 / 0 / 0 / 0
12 / 1 / 0 / 0 / 0 / 0
13 / 1 / 1 / 0 / 0 / 0
14 / 1 / 1 / 0 / 0 / 0
15 / 1 / 1 / 0 / 0 / 0
16 / 0 / 0 / 0 / 0 / 0
17 / 1 / 0 / 0 / 0 / 0
18 / 2 / 1 / 0 / 0 / 0
19 / 2 / 0 / 0 / 0 / 0
20 / 2 / 0 / 0 / 0 / 0
21 / 0 / 0 / 0 / 0 / 0
22 / 1 / 0 / 1 / 0 / 0
23 / 1 / 0 / 1 / 0 / 0
24 / 0 / 0 / 1 / 0 / 0
```

### 以後交接書該點名的工具

`inbox_poll.sh --once`、`inbox_mail.sh --up`、`node --test --test-isolation=none`（取得真實子測試計數）、`node --test --test-concurrency=1 --test-reporter=tap ...`（旗標應置於glob前；本次後置npm旗標無效）、shell `time`（本機沒有/usr/bin/time）、`node --cpu-prof --cpu-prof-dir=/tmp/cx-war-core`、`GOLDEN_UPDATE=1`、Loc grep與tabledb。
