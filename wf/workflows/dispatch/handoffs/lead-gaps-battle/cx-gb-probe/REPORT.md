# cx-gb-probe 完成回報

## 做了什麼

新增正式 `content:probe` 指令與可 import 的非同步 `probe(db, ids, opts)`。frame 對同級基準機／怪各 N 場，monster 對兩台同級機，ability 以完整 id 字典序選第一個實際載體（含 innate、defaultLoadout 部件、species、monster extraAbilities），scenario 直接使用情境。每組列勝／敗／平手、平均輪數、AI 成功 AbilityUsed 事件次數、主角未使用能力、指定能力次數、建議帶偏離與例外。反應技能的 AbilityUsed 不算 AI UseAbility。

worker_threads 使用呼叫端 ContentDB 快照，支援記憶體修改；按組別與 seed 排序彙整，輸出不含耗時或 jobs 等非確定欄位。JSON stdout 純 JSON，中文摘要送 stderr；檔案輸出時摘要仍在 stdout。成功率分母為請求場數 N；例外不算平手；平均輪數只計完成場次，全部例外時為 null。

measure 移除硬寫的 20 輪，加入 roundsLimit 讓情境上限可直接驗收。未改 balance.test.ts。

### 基準單位

基準依領導追加 order 改用 `wf/workflows/content/playtest-baselines.json`，各級取第一台機／第一隻怪獸。列號以工具 0-based index 計，括號是人數的第幾列。表中 frame／monster 省略種類前綴；P＝`person/chen-xiaohai`，V＝`person/arun-velan`，均放 pilot；V 具有 ancient-candidate tag。

| 級 | frame＋components | 駕駛 | monster | 挑選理由 |
|---|---|---|---|---|
| D | bulwark-i＋D 裝配 | P | mite-d | playtest-baselines 第 0 列（第 1 筆） |
| C | bulwark-ii＋C 裝配 | P | reaper-c | 第 1 列（第 2 筆） |
| B | bulwark-iv-rampart＋B 裝配 | P | siegebeetle-b | 第 2 列（第 3 筆） |
| A | selene-aurora＋A 裝配 | P | cliffjaw-red-eye | 第 3 列（第 4 筆） |
| S | ancient-rearguard＋{} | V | tidespine-chittagong | 第 4 列（第 5 筆） |

所有 component id 以下省略 `component/mx-`。D 裝配＝left-weapon:iron-repeater；C＝left-weapon:rune-rifle、right-weapon:iron-repeater，照來源列明寫武器。

B 裝配＝left-weapon:scatter-rune、right-weapon:xingtian-replica、armor-mount:runeweave-plate、back-1:ash-mist、back-2:falling-star-mortar、system-1:frost-fins、system-2:essence-cell。

A 裝配＝right-weapon:hush-pulse、left-weapon:radiant-rifle、sensor-mount:thousand-eye、back-1:ash-mist、back-2:tide-leap、armor-mount:moonveil、system-1:essence-cell、system-2:rift-heart。B／A／S 來源沒明寫配裝，故取開發當時 frame.defaultLoadout 固定存入 baselines，執行時不靠 defaultLoadout 隱式補裝。

圖選 `map/lunar-quarry-16`，16×16，部署 (3,2) 與 (11,2)，第二台在 (11,3)，上方為開闊月壤；保留原圖地形與光照，不改內容。JSON 註明來源與各級 sourceRow。

數值帶在每次 probe 執行時直接讀 `wf/workflows/content/numeric-bands.json`（`--bands FILE` 可覆寫），沒有另存一份數字。支援六項建議區間、S 級摹機 HP 硬上限、單體／範圍傷害硬上限、armorPen 硬上限；開工與收尾均讀取來源核對。無法對應或解析的列與部分欄位在 `uncheckedBands`／中文「未檢查的帶」列明。射程比較 rangeMax 近遠程聯集；HP 含部位覆寫與外掛層。動態 NumExpr 只對 self.grade 求值，其餘明列未量測。

## 產出（改動檔清單）

程式／資料：`src/sim/probe.ts`、`src/sim/probe-worker.ts`、`src/sim/probe-baselines.json`、`src/sim/measure.ts`；`package.json` 只加 content:probe 一行；測試 `test/sim/probe.test.ts`；本 REPORT。共 7 檔，低於 10 檔 gate；新增檔全文加既有檔 diff 約 51 KB，低於 100 KB。沒有 commit。

### 用法（可直接抄進 README）

```sh
npm run content:probe -- frame/longspear-v4 monster/tidewolf-c ability/mx-head-vulcan scenario/quarry-duel
npm run content:probe -- frame/longspear-v4 --n 20 --seed 1 --jobs 4 --rounds 20 --json /tmp/probe.json
npm run --silent content:probe -- scenario/quarry-duel --json - > /tmp/probe.json
node src/sim/probe.ts frame/longspear-v4 --content content/base --content path/to/pack --bands wf/workflows/content/numeric-bands.json --json -
```

預設 n=20、seed=1（逐場加一）、jobs=min(8,CPU 數)、內容 content/base；自動配對上限 20 輪，scenario 使用自身 rounds，`--rounds` 可覆寫兩者。`--content` 可重複，指定時取代預設路徑。`--bands FILE` 可指定其他 wf-table 數值帶檔案，預設 `wf/workflows/content/numeric-bands.json`。`--json FILE` 寫檔；`--json -` 的 stdout 是純 JSON，摘要在 stderr；經 npm 管線解析請加 `--silent`，避免 npm 自己的啟動橫幅。

```ts
import { probe } from "./src/sim/probe.ts";
const result = await probe(db, ["frame/longspear-v4"], { n: 20, seed: 1, jobs: 4 });
```

### 固定驗收 1：完整範例與計時

指令就是交接書指定的四個 id，依領導新 order 基準執行；每組 20 場，共 120 場。exit=0; elapsed=60.091s。所有組別例外數為 0。計時包含同機其他線與本線 JSON 比對的並行負載。

```text
> mecha-srpg@0.1.0 content:probe
> node src/sim/probe.ts frame/longspear-v4 monster/tidewolf-c ability/mx-head-vulcan scenario/quarry-duel

數值帶來源：wf/workflows/content/numeric-bands.json
未檢查的帶：第 1 列 摹機 部位與層：未對應本次六項量測；第 2 列 摹機 baseAttrs initiative／perception／evasion：未對應本次六項量測；第 3 列 摹機 heat 池 max／regen／帶：未對應本次六項量測；第 4 列 摹機 charge 池 max／regen：未對應本次六項量測；第 5 列 部件 武器 hp／size／mass／矢池：未對應本次六項量測；第 8 列 能力 傷害／AP：未對應本次六項量測；第 9 列 能力 射程 min–max：只檢查 rangeMax 聯集，min／次數／地圖大小條件未檢查；第 10 列 能力 accuracy 加值／armorPen／crit：只檢查 armorPen，accuracy／crit 未檢查；第 11 列 能力 cooldown／usesPerBattle：未對應本次六項量測；第 13 列 怪獸 部位數／核數／exposure：未對應本次六項量測；第 14 列 怪獸 baseAttrsByGrade accuracy／evasion／initiative／perception：未對應本次六項量測；第 15 列 怪獸 層 resist：未對應本次六項量測；第 16 列 生物機甲 burden（每回合承擔）／instinct 池：未對應本次六項量測；第 17 列 古代機 總層 HP／baseAttrs／能力數：未對應本次六項量測；第 18 列 效果 contribs 幅度（短效 1–3 回合）：未對應本次六項量測；第 19 列 人物 六屬性／hp／AP／fatigue：未對應本次六項量測；第 20 列 情境 每 slot 單位數／slot 數／輪數／地圖面積：未對應本次六項量測；第 21 列 地形 moveCost leg／cover／height：未對應本次六項量測；第 22 列 營運 機型 cost／拘束磨損／吞屍量／工時：未對應本次六項量測；第 23 列 營運 事件／契約金額：未對應本次六項量測
frame/longspear-v4（載體 base:frame/longspear-v4）
超出數值帶的欄位：base:ability/mx-ember-salvo 射程 7 > C 級上限 5；base:ability/mx-head-vulcan AP 成本 2 < C 級下限 3；base:ability/mx-head-vulcan 單發傷害 8 < C 級下限 12；base:ability/mx-radiant-shot 射程 7 > C 級上限 5；base:ability/mx-radiant-shot 單發傷害 22 > C 級上限 20；base:ability/mx-rune-shot 射程 6 > C 級上限 5
對 frame/bulwark-ii ×1：20 場；勝率 70.0%；敗率 0.0%；平手率 30.0%；平均輪數 11.65（上限 20）；例外數 0
能力使用次數：{"base:ability/mx-ember-salvo":59,"base:ability/mx-guard-stance":117,"base:ability/mx-head-vulcan":140,"base:ability/mx-iron-burst":89,"base:ability/mx-radiant-shot":180,"base:ability/mx-rune-shot":144}
主角從未使用的能力：無
對 monster/reaper-c ×1：20 場；勝率 55.0%；敗率 10.0%；平手率 35.0%；平均輪數 14.25（上限 20）；例外數 0
能力使用次數：{"base:ability/mx-ember-salvo":12,"base:ability/mx-head-vulcan":156,"base:ability/mx-radiant-shot":264,"base:ability/mx-rune-shot":105,"base:ability/reaper-charge":55,"base:ability/reaper-cleave":298}
主角從未使用的能力：無
monster/tidewolf-c（載體 base:monster/tidewolf-c）
超出數值帶的欄位：無
對 frame/bulwark-ii ×2：20 場；勝率 0.0%；敗率 80.0%；平手率 20.0%；平均輪數 9.50（上限 20）；例外數 0
能力使用次數：{"base:ability/bite":301,"base:ability/mx-guard-stance":189,"base:ability/mx-iron-burst":144,"base:ability/mx-rune-shot":173,"base:ability/pounce":1}
主角從未使用的能力：無
ability/mx-head-vulcan（載體 base:frame/bulwark-i-beacon）
超出數值帶的欄位：base:ability/mx-guard-stance 射程 0 < D 級下限 1；base:ability/mx-iron-sweep AP 成本 4 > D 級上限 3；base:ability/mx-iron-sweep 射程 5 > D 級上限 4；base:ability/mx-iron-sweep 單發傷害 12 > D 級上限 9；base:ability/mx-shard-lob 射程 5 > D 級上限 4；base:ability/mx-shard-lob 單發傷害 14 > D 級上限 9
對 frame/bulwark-i ×1：20 場；勝率 15.0%；敗率 40.0%；平手率 45.0%；平均輪數 18.75（上限 20）；例外數 0
能力使用次數：{"base:ability/mx-frame-strike":234,"base:ability/mx-guard-stance":366,"base:ability/mx-head-vulcan":239,"base:ability/mx-iron-burst":200,"base:ability/mx-iron-sweep":120,"base:ability/mx-shard-lob":100}
主角從未使用的能力：無
指定能力 base:ability/mx-head-vulcan 主角使用次數：239
對 monster/mite-d ×1：20 場；勝率 0.0%；敗率 0.0%；平手率 100.0%；平均輪數 20.00（上限 20）；例外數 0
能力使用次數：{"base:ability/mite-swarm-bite":440,"base:ability/mx-guard-stance":188,"base:ability/mx-head-vulcan":196,"base:ability/mx-iron-sweep":119,"base:ability/mx-shard-lob":128}
主角從未使用的能力：無
指定能力 base:ability/mx-head-vulcan 主角使用次數：196
scenario/quarry-duel（載體 base:scenario/quarry-duel）
超出數值帶的欄位：base:frame/bio-reaper 摹機總層 HP 425 > C 級上限 420；base:frame/corpse-reaper 摹機總層 HP 425 > C 級上限 420
對 base:scenario/quarry-duel：20 場；勝率 0.0%；敗率 0.0%；平手率 100.0%；平均輪數 30.00（上限 30）；例外數 0
能力使用次數：{"base:ability/mx-head-vulcan":3275,"base:ability/mx-radiant-shot":834,"base:ability/reaper-charge":26,"base:ability/reaper-cleave":1212}
主角從未使用的能力：無
```

### 固定驗收 2：JSON 與 jobs 確定性

以下兩個指令都 exit 0（每組 n=2，覆蓋四種 id）。

```sh
node src/sim/probe.ts frame/longspear-v4 monster/tidewolf-c ability/mx-head-vulcan scenario/quarry-duel --n 2 --jobs 1 --json - > /tmp/cx-gb-probe/order-jobs1.json
node src/sim/probe.ts frame/longspear-v4 monster/tidewolf-c ability/mx-head-vulcan scenario/quarry-duel --n 2 --jobs 4 --json - > /tmp/cx-gb-probe/order-jobs4.json
node --input-type=module - <<'JS'
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const one = readFileSync('/tmp/cx-gb-probe/order-jobs1.json', 'utf8');
const four = readFileSync('/tmp/cx-gb-probe/order-jobs4.json', 'utf8');
JSON.parse(one); JSON.parse(four);
assert.equal(one, four);
console.log('JSON.parse: PASS; jobs 1 === jobs 4 (byte-for-byte): PASS');
JS
```

實際結果：`JSON.parse: PASS; jobs 1 === jobs 4 (byte-for-byte): PASS`。`--json -` 前 40 行：

```json
{
  "version": 1,
  "n": 2,
  "seed": 1,
  "bandsSource": "wf/workflows/content/numeric-bands.json",
  "uncheckedBands": [
    "第 1 列 摹機 部位與層：未對應本次六項量測",
    "第 2 列 摹機 baseAttrs initiative／perception／evasion：未對應本次六項量測",
    "第 3 列 摹機 heat 池 max／regen／帶：未對應本次六項量測",
    "第 4 列 摹機 charge 池 max／regen：未對應本次六項量測",
    "第 5 列 部件 武器 hp／size／mass／矢池：未對應本次六項量測",
    "第 8 列 能力 傷害／AP：未對應本次六項量測",
    "第 9 列 能力 射程 min–max：只檢查 rangeMax 聯集，min／次數／地圖大小條件未檢查",
    "第 10 列 能力 accuracy 加值／armorPen／crit：只檢查 armorPen，accuracy／crit 未檢查",
    "第 11 列 能力 cooldown／usesPerBattle：未對應本次六項量測",
    "第 13 列 怪獸 部位數／核數／exposure：未對應本次六項量測",
    "第 14 列 怪獸 baseAttrsByGrade accuracy／evasion／initiative／perception：未對應本次六項量測",
    "第 15 列 怪獸 層 resist：未對應本次六項量測",
    "第 16 列 生物機甲 burden（每回合承擔）／instinct 池：未對應本次六項量測",
    "第 17 列 古代機 總層 HP／baseAttrs／能力數：未對應本次六項量測",
    "第 18 列 效果 contribs 幅度（短效 1–3 回合）：未對應本次六項量測",
    "第 19 列 人物 六屬性／hp／AP／fatigue：未對應本次六項量測",
    "第 20 列 情境 每 slot 單位數／slot 數／輪數／地圖面積：未對應本次六項量測",
    "第 21 列 地形 moveCost leg／cover／height：未對應本次六項量測",
    "第 22 列 營運 機型 cost／拘束磨損／吞屍量／工時：未對應本次六項量測",
    "第 23 列 營運 事件／契約金額：未對應本次六項量測"
  ],
  "results": [
    {
      "id": "frame/longspear-v4",
      "carrier": "base:frame/longspear-v4",
      "focusAbility": null,
      "warnings": [],
      "bands": [
        {
          "id": "base:ability/mx-ember-salvo",
          "grade": "C",
          "field": "射程",
          "value": 7,
          "min": 1,
```

### 固定驗收 3：測試與型別

`node --test --test-isolation=none test/sim/probe.test.ts`：7/7 通過（四類配對、jobs 1/2、超標與正常雙向檢查、JSON／事件計數）。依賴線內容更新後重跑結果如下。

```text
✔ frame 配同級摹機與怪獸，主角 defaultLoadout 與基準明寫配裝分開 (12.037732ms)
✔ monster 對同級兩台基準摹機 (0.656075ms)
✔ ability 找第一個載體；component defaultLoadout 與 monster extraAbilities 也可找到 (104.349056ms)
✔ scenario 用情境 rounds，明寫 rounds 才覆寫 (2.370106ms)
✔ jobs 1 與 2 結果逐字相同，記憶體內容可跨 worker (2619.291494ms)
✔ bands 能檢出超標記憶體內容；正常 HP 不誤報 (61.580301ms)
✔ JSON 形狀與 AbilityUsed 計數、從未使用能力一致 (539.686764ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4023.700333
```

`npm run typecheck`：最後一次 0 錯。過程曾遇其他線 `src/content/lint.ts` 的 `LoadIssue.ruleId` 型別錯誤，已寄 PROGRESS；該線修正後轉綠，本線沒有越界修改。`npm run check`：0 errors，38 warnings 為既有內容 capture frame 與新 partsOverride 層 HP 差異，沒有改動該內容。

### 固定驗收 4：measure 情境上限

`node src/sim/measure.ts scenario/convoy-run 1`，exit 0。讀取 `content/base/scenarios/convoy-run.json` 得 rounds=20；實測 roundsLimit=20，該 seed 在第 4 輪 escort 勝利，提早結束不代表上限錯誤。

```json
{"seed":1,"waitRatio":0,"waits":0,"unitTurns":46,"pass":true,"kinds":{"move":38,"useAbility":16,"end":45,"retreat":2},"winner":"player","reason":"escort","rounds":4,"roundsLimit":20,"hits":4,"misses":12,"deaths":0,"hash":"0198cece99ab46fb"}
```

### 固定驗收 5：REPORT

本檔包含指定四段、基準單位表、挑選理由、可抄入 README 的用法、完整範例與驗收證據。

## 沒做到或證據不足的

沒有擴充固定五項驗收。未跑全套 npm test、額外 fuzz、balance.test.ts 或 GUI。交接書要求的 `node test/fuzz/cli.ts --help` 實際 exit 1（未知參數 --help）；已直接讀 cli／worker 實作完成 worker 模式參照。

bands 是建議區間警示，不代表硬性內容錯誤；帶內不代表已平衡。純增益／self 射程 0、反應技 AP 0 也可能報低於建議帶。硬上限僅解析已對應六項欄位的明確數值語句；其他語意條件不宣稱已檢查。frame 不論 cls 都使用摹機 HP 帶，bio／ancient 對照僅供參考。動態數值不能靜態判定時警示，不冒充已比較。SS／SSS 無本次基準，會明確拒絕。沒 player 的 scenario 以第一個 slot 為主角並警示。不能找到載體的能力明確報錯；不擅自替內容配裝。

## 需要決定的事

新增 sim 模組與測試的 code-map／README 同步交領導處理：本線 wf 寫入範圍僅 REPORT，所以未修改 code-map。此輪同時有別線補 defaultLoadout／partsOverride，最終範例已使用新配裝，缺 defaultLoadout 的警示仍保留。基準與明寫配裝依追加 order 固定；未覆蓋的數值帶（包含 bio／ancient 專用規則）是否後續納入，交領導決定，本次不加做。

## 以後交接書該點名的工具

`node src/sim/probe.ts … --json -` 與 `npm run --silent content:probe -- … --json -`；`node:worker_threads`；`node test/fuzz/cli.ts --help` 目前不可用，應點名原始碼。
