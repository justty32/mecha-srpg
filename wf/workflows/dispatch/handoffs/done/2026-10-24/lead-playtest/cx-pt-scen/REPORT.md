# cx-pt-scen REPORT

## 做了什麼

**資料與量測交付完成；狀態 BLOCKED：完整測試仍有 3 個 MCP 檔失敗，不能宣稱五條全部通過。**

22 個可改情境共 110 場：timeout 從 **84/110（76.36%）降至 48/110（43.64%）**，達到 ≤60%。before、after 各覆蓋 24 情境 × seed 1–5，沒有 error；沒有任何情境 5/5 在 ≤3 輪分出勝負。每情境前後勝負分布、輪數與剩餘 timeout 原因見 [comparisons.json](comparisons.json)（24 列）。以上以本次實測 before 為準。

只修改 22 個情境與 2 個 aiprofile。四場護送改用明列全部 `convoy-N` 的 escort，並逐台 `killTarget` lose；22 場都有玩家與戰鬥盟軍全滅的明確敗北條件。所有可改情境的型號斬首目標改成單位 id，採石場與灘頭指定 enemy-0 為斬首指揮目標。同一情境人物 id 不重複，替補均取現有人物並保留人物種類。

75 台玩家／盟軍／車隊過渡換機，逐台「情境、slot、舊→新、理由」換機表見 [frame-swaps.json](frame-swaps.json)（75 列）。替代型都有非 conventional-arms 內建攻擊；crater 的 kaiju 機亦納入判定。敵方不換機，徒步護送人員保留。

八場大圖／混戰（badlands、delta、overpass、rival、unbound、crater、nest、beast）重排部署；不同 slot 間最近距離至少 10 格，third 到玩家至少 11 格。waste 的包圍不改。siege 車隊距出口改為 28 格；shell 車隊距出口亦改為 28 格，以防新 flee 三輪內撤完。四場護送 20 場全部第 4 輪完成，45 個「車隊單位×seed」均至少移動四次且全部 retreated；9 台車隊開場都存在地形可走的出口路徑。比較表同列保留位移與路徑證據。

配合另一線完成 flee 相對距離公式，convoy-runner 的出口權重改為 2、避敵 0.2、危險 0.02。sniper-perch 提高 attack 至 3、endScore 降至 0.000001；採石場診斷 seed 1 在 20 輪實際攻擊 100 次，glade 的玩家狙擊也有開火。其他四個允許調整的 aiprofile 沒有修改。

月面突圍改由圖中央起步，5 seeds 都第 5 輪勝出。鏡面守夜改守 (13,12) 四輪，該格不在玩家開場位置，必須移動才能完成；5 seeds 都第 4 輪勝出。需要消耗戰的情境上限延至 30 輪；菌床／巢母／崖牙的場內 grade 分別調為 C／B／B。未新增情境、地圖或任意超時自動勝利。

固定五條驗收狀態：

1. `npm run check`：**0 errors、0 warnings**。最新完整 `npm test`：**111 pass、3 fail（114 個測試檔）**；`test/golden.test.ts` 與 `src/ops/sim/golden.test.ts` 均通過，本線未改黃金檔。此條尚未通過。
2. before／after 各 24×5、0 error；可改情境 timeout 43.64%，達標。七場 5/5 timeout 的原因逐場列在比較表，依交接書允許的說明方式交付。
3. 四場護送全部使用單位 id、失敗逐台列出；22 場明列玩家與盟軍全滅敗北。兩個禁改 fixture 原有 enemy eliminate win 已提供玩家／盟軍全滅敗北出口。
4. 22 個可改情境沒有重複人物。兩個禁改 fixture 的既存重複保留，詳見第三段。
5. 本 REPORT 四段齊，換機表與前後分布表均已附資料檔。

量測指令（在主 repo 執行；after 使用同工具分批跑後依 scenario 合併）：

```sh
node wf/workflows/dispatch/handoffs/lead-playtest/sweep.ts --seeds 1,2,3,4,5
npm run check
npm test
```

驗收 3、4 的檢查指令與實際輸出（在主 repo 執行）：

```sh
python3 - <<'PY'
from pathlib import Path
import json,collections
files=sorted(Path('content/base/scenarios').glob('*.json'))
excluded={'skirmish-whitegloves','rift-edge-nest'}
missing=[];duplicate=[];escort={};fixture=[]
for p in files:
 s=json.loads(p.read_text());ids=[x['id'] for v in s['slots'].values() for u in v['units'] for x in u.get('persons',[])]
 dup={k:v for k,v in collections.Counter(ids).items() if v>1}
 if p.stem in excluded:
  if dup:fixture.append({p.stem:dup})
  continue
 if dup:duplicate.append(p.stem)
 if not any(o['kind']=='eliminate' and o['onComplete']=='lose' and o['for']=='player' and 'player' in o['params'].get('slots',[]) for o in s['objectives']):missing.append(p.stem)
 if 'convoy' in s['slots']:
  expected=[f'convoy-{i}' for i in range(len(s['slots']['convoy']['units']))]
  actual=[o['params'].get('units') for o in s['objectives'] if o['kind']=='escort']
  failure=[o['params'].get('target') for o in s['objectives'] if o['kind']=='killTarget' and o['onComplete']=='lose']
  escort[p.stem]=actual==[expected] and failure==expected
print(json.dumps({'modifiable':len(files)-len(excluded),'missingLoss':missing,'duplicatePersons':duplicate,'escortUnitIdsAndPerUnitFailure':escort,'unchangedFixtureDuplicates':fixture},ensure_ascii=False))
PY
```

```json
{"modifiable": 22, "missingLoss": [], "duplicatePersons": [], "escortUnitIdsAndPerUnitFailure": {"convoy-run": true, "shell-excavation-escort": true, "siege-beetle-convoy": true, "tidal-flat-evac": true}, "unchangedFixtureDuplicates": [{"rift-edge-nest": {"person/glove": 5}}, {"skirmish-whitegloves": {"person/glove": 4}}]}
```

## 產出（檔清單）

主 repo 直接修改，無 commit；沒有 restore、刪除或覆蓋其他線改動。24 個內容檔，加 5 個交付檔，合計 29 檔；最大情境 7,070 bytes，均低於 gate。地圖未修改。

`content/base/aiprofiles/`：`convoy-runner.json`、`sniper-perch.json`。

`content/base/scenarios/`：badlands-sweep.json, beachhead-landing.json, beast-stampede.json, breach-defense.json, convoy-run.json, crater-three-way.json, delta-four-way.json, dream-bed-burn.json, glade-spore-hold.json, hive-burrow-clearing.json, lunar-blockade-run.json, mirror-choir-vigil.json, mirror-survive.json, nest-core-assault.json, overpass-wager.json, quarry-duel.json, rival-claim-jump.json, shell-excavation-escort.json, siege-beetle-convoy.json, tidal-flat-evac.json, unbound-raid.json, waste-encirclement.json。

交付位於 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-playtest/cx-pt-scen/`：

- [REPORT.md](REPORT.md)：本報告與檢查指令。
- [sweep-before.jsonl](sweep-before.jsonl)：開工基準 24×5。
- [sweep-after.jsonl](sweep-after.jsonl)：最終結果 24×5。
- [frame-swaps.json](frame-swaps.json)：75 台逐台換機表。
- [comparisons.json](comparisons.json)：24 情境前後勝負、輪數、原因、護送位移與路徑；file_path 可定位情境檔。

## 沒做到或證據不足的

已按使用者要求在三次連續完整測試紅燈後發 BLOCKED。引擎修正後再跑完整測試，AI 與營運 golden 已轉綠，最新剩下 `src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/mcp/battle-info.test.ts` 三個 MCP 檔失敗。程序測試回報 server 提前退出 0／socket ready=false；battle-info 失敗於第 32 行 ally-0 位置、第 101 行玩家先手、第 136 行佔格文案假設。敗北目標會提及盟軍，換機及人物去重亦會改先手。證據已投遞領導，本線不跨界修改。

七場全 timeout：badlands-sweep、breach-defense、crater-three-way、delta-four-way、dream-bed-burn、glade-spore-hold、rival-claim-jump。比較表逐場列理由；清場／斬首仍受內建攻擊與厚重部位生命限制，守區仍被殘存敵人干擾。seed 1 診斷確認 breach 的 (21,16)、(22,16) 與 glade 的 (16,18) 尚有具核心生命的敵人留在守區，連續 hold 未完成。未以無條件計時勝利掩蓋平局。

部署間距已有座標證據；八場是否每個 seed 都在第 2–4 輪接敵，沒有另外完整逐場證明，不作保證。兩個禁改情境檔與 HEAD 位元組相同，但各自原有 person/glove 重複：skirmish 4 次、rift 5 次。若把「人物不重複」要求擴到這兩檔，會與交接書禁止修改它們衝突。

before 為開工前內容與引擎；after 為另一線修正 flee／AI 後的批次與兩場護送最後重測。差異含並行引擎改善，不能全歸因本線調參。

## 需要決定的事

無使用者授權待決。解除 BLOCKED 的條件：MCP 負責線修復上述三個測試檔所涉問題，再由領導執行完整 `npm test` 確認 0 fail。本線的資料與報告已交付，不再擴大驗收或修改範圍。

以後交接書該點名的工具：無。
