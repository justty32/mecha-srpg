# cx-gb-load REPORT

STATUS：DONE（固定五條通過；全套測試紅燈已按契約記錄）。依交接書固定五條驗收收尾；未 commit。

## 做了什麼

34 台 mechanical 中填妥 **33 台 defaultLoadout**；`frame/infantry` 的 `bodyplan/infantry` 所有部位皆無 slot，依契約跳過。30 台 mx 機逐一採用 mech catalog 建議；其餘三台採用 catalog 標為 C 級的既有元件：燕鷗＝輝光連吼＋白瓷殼甲，燕鷗護衛＝鳴刃＋裂鱗爆甲，獵犬-II＝鳴刃＋縛獸拘束矢。獵犬無 charge 池，因此選只產 heat 的鳴刃；三台主武器皆無 conventional-arms 標籤。

75 個 spawn 全數換回 frame-swaps 的 old 型號。既有情境無 components，換回後每個情境人類方皆有非凡兵傷害能力，因此未觸發新增 components 的例外。24 情境補 name 與 1–3 句 brief；22 名取 content-battle catalog，另兩名自訂。簡介按目前 objective 描述，例如 mirror-choir-vigil 是守點四輪，未沿用 catalog 過時的十輪生存說明。

### 改了建議

| 項目 | 數量 | 說明 |
|---|---:|---|
| catalog 配裝替換 | 0 | 30 台建議的槽位皆存在且型別相符，全部原樣採用。 |

### 固定五條驗收

1. `npm run check`：**OK 0 errors, 0 warnings**（配裝後、情境完成後各一次）；mechanical 配裝 **33/34**，唯一跳過 infantry，理由如上。
2. 換機表檢查：**75/75**。下列一行可重現：

```sh
python3 -c 'import sys,json,pathlib;sys.path.insert(0,"wf/tools");from tabledb import load;r=load("wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/frame-swaps.json").rows;print(str(sum(json.loads(pathlib.Path("content/base/scenarios",x["scenario"].split("/")[1]+".json").read_text())["slots"][x["slot"].rsplit("-",1)[0]]["units"][int(x["slot"].rsplit("-",1)[1])]["mech"]==x["old"] for x in r))+"/75")'
```

3. name／brief 非空 **24/24**；24 檔全文禁用詞 **0 命中**。下列指令無輸出、exit 1 代表 0 命中：

```sh
rg -n '電磁|電壓|電流|電池|伏特|瓦|焦耳|千瓦|電子|電路|晶片|電腦|程式碼|演算法|量子|奈米|核融合|核分裂|反應爐|口徑|毫米|公厘|mm|彈道學|軌道力學|推進劑|火箭燃料|Δv|公里／秒|聲納|雷達|衛星|無線電|飛彈|砲彈|子彈|坦克|戰鬥機|電能|熱量|電弧|散熱|拘束彈' content/base/scenarios/*.json
```

4. sweep-after：**24 行／120 場，0 例外**，已拷入 REPORT 目錄。逐情境勝方分布、draw 與總平手率見下表。
5. 本 REPORT 已包含四段、改了建議表、平手率表、失敗測試清單與工具段。

### 平手率表

每情境 seed 1–5。勝方欄 P＝player、E＝enemy、A＝ally、T＝third；「—」表示無勝者，draw 另列。

| 情境 | before 勝方 | draw | after 勝方 | draw |
|---|---|---:|---|---:|
| badlands-sweep | P1 | 4 | — | 5 |
| beachhead-landing | P5 | 0 | P5 | 0 |
| beast-stampede | P2 | 3 | P5 | 0 |
| breach-defense | — | 5 | — | 5 |
| convoy-run | — | 5 | P5 | 0 |
| crater-three-way | — | 5 | E2 | 3 |
| delta-four-way | — | 5 | — | 5 |
| dream-bed-burn | — | 5 | P1 | 4 |
| glade-spore-hold | — | 5 | — | 5 |
| hive-burrow-clearing | P5 | 0 | P5 | 0 |
| lunar-blockade-run | P5 | 0 | P5 | 0 |
| mirror-choir-vigil | P5 | 0 | P5 | 0 |
| mirror-survive | P5 | 0 | P5 | 0 |
| nest-core-assault | P3 | 2 | — | 5 |
| overpass-wager | — | 5 | P1 | 4 |
| quarry-duel | P1 | 4 | — | 5 |
| rift-edge-nest | P5 | 0 | P5 | 0 |
| rival-claim-jump | E1 | 4 | E2 | 3 |
| shell-excavation-escort | — | 5 | E1、P4 | 0 |
| siege-beetle-convoy | — | 5 | P5 | 0 |
| skirmish-whitegloves | — | 5 | — | 5 |
| tidal-flat-evac | — | 5 | P5 | 0 |
| unbound-raid | — | 5 | P4 | 1 |
| waste-encirclement | P5 | 0 | P5 | 0 |

**總平手率：before 77/120＝64.17%；after 50/120＝41.67%，變化 -22.50 個百分點。**

勝方合計：before E1、P42；after E5、P65。after 共 120 場，例外 0。

before 採領導提供的 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/lead-gaps-battle/sweep-before.jsonl`；after 使用同目錄 psweep.sh，以目前工作樹跑 24 情境 × 5 seed。命令依交接書，另設 `TMPDIR=/tmp/cx-gb-load`，使工具內 mktemp 留在本線臨時目錄。兩次量測之間其他線也修改工作樹，差異只能視為前後觀察，不能全歸因於配裝。

## 產出（改動檔清單）

完整清單見 [changed-files.json](changed-files.json)：33 frames＋24 scenarios＋4 交付證據＝**61 檔**，低於 62 檔 gate。本線內容差異 40,055 bytes，含交付證據仍低於 300 KB。沒有修改其他 frame 欄位、部件、引擎或測試。

新量測原檔 `/tmp/cx-gb-load/sweep-after.jsonl`，交付副本 [sweep-after.jsonl](sweep-after.jsonl)。REPORT 位於 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-load/REPORT.md`。

## 沒做到或證據不足的

`npm run typecheck` exit 0；`node --test --test-isolation=none 'src/content/*.test.ts'` 10/10 通過。單場 `node src/sim/cli.ts --scenario scenario/skirmish-whitegloves --seed 1` 正常結束：第 20 輪 timeout 平手，hash `750ba75ae2c57f77`。

`npm test` exit 1：沙箱隔離模式回報 124 個檔級結果，112 pass／12 fail，並非精確單元計數。依交接書改跑 `node --test --test-isolation=none --test-reporter=tap 'test/sim/*.test.ts' 'test/ai/*.test.ts' 'src/mcp/*.test.ts'`，exit 1：**162 tests／153 pass／7 fail／2 skip**。兩個 skip 均為既有 ui_screenshot 測試，headless Chromium 回 Operation not permitted；未另行開 GUI。

### 失敗測試清單

完整測試名稱、位置及錯誤見 [test-failures.json](test-failures.json)（12 筆隔離檔級失敗＋7 筆非隔離斷言失敗）。非隔離失敗摘要：

| 測試 | 原因 |
|---|---|
| batch 情境 metadata | 對凍結的 name 賦值，TypeError。 |
| batch 到 AI／結束 | batch.outcome 為空，斷言失敗。 |
| campaign_act sortie | 指令回 already-there。 |
| socket CLI | 啟動斷言 expected true／actual false，無錯誤文字。 |
| stdio 玩家重播 | server 提前退出 0。 |
| stdio battle_auto | server 提前退出 0。 |
| probe jobs 1／2 | burst-30 使用數 8／16，輸出不相同。 |

隔離模式失敗檔：`src/mcp/{batch,campaign,cli,e2e}.test.ts`、`src/ops/content/cond.test.ts`、`src/ops/crew/crew.test.ts`、`src/ops/sim/{golden,war-invariants}.test.ts`、`src/ops/sortie/entry.test.ts`、`src/ops/world/rifts.test.ts`、`test/sim/{cli,seams}.test.ts`。隔離輸出只提供 test failed；沒有詳細重跑證據的項目不臆測根因。

兩個 batch 失敗屬測試啟動時版本；後續唯讀觀察已見另一線改成 clone fixture 與 final.outcome，本線沒有重跑證據，不能宣稱已綠。非隔離 sim CLI／seams 通過。ops golden 失敗只取得檔級訊息，不能斷言單純為配裝引起的 hash 改變。

測試原始輸出在 `/tmp/cx-gb-load/npm-test.log`、`/tmp/cx-gb-load/test-focused.log`；check／typecheck／content 與單場輸出也保留在同一臨時目錄。固定 hash 與超出本線範圍的紅燈僅記錄，未改測試或其他線的程式。

## 需要決定的事

領導收整測試與其他線改動後，依契約在沙箱外做最終測試；優先判定 probe 單工與 worker 的內容一致性、campaign 的 already-there，以及子程序退出原因。本線不改這些引擎／測試檔。

catalog 的 bulwark-i-beacon、shellsoc-ls3 建議配裝仍以凡兵為主；依交接書原樣填入，沒有另加武器。若未來要保證每一種摹機都能單獨有效對獸，需另行決定是否調整這兩台建議。

平手率的變化與仍有平手的情境交由領導決定後續平衡；本線未為追求勝率改數值、目標、輪數或 AI。另一線獲准修改 unbound-raid 的 at，該站位不屬本線成果。

## 以後交接書該點名的工具

無。
