# cx-tune-scen 完成回報

STATUS：DONE。固定 4 條驗收全部通過；已停止調參。量測使用 worktree HEAD `326c40b` 的引擎與本線六情境改動，未 commit。

## 做了什麼

只調整六情境的單位部署、敵方既有型號與數量、守點輪數及情境期限。六情境官方 seed 1–10 全達玩家勝 3–8 場、平均至少 7 輪；全 26 情境 × seed 1–5 的四個數字也全達標。內容檢查由開工至最終均為 0 errors、8 warnings。

原本快速收場的原因（以本線開工實測為準）：

- `convoy-run`：車隊距東口33格，敵軍在後，4輪撤離。
- `siege-beetle-convoy`：車隊距東口28格，敵軍也在後，4輪撤離。
- `tidal-flat-evac`：難民距北口15／16格，追兵落後，4輪撤離。
- `shell-excavation-escort`：南邊整排可撤；路程28格，平均4輪。
- `lunar-blockade-run`：領頭機距最近出口17格，多數5輪突圍。
- `mirror-choir-vigil`：守點門檻4輪，十場有九場第4輪勝。

### 前後數字表

| 情境 | 改了什麼 | 玩家勝場／10 | 平均輪數 |
|---|---|---:|---:|
| convoy-run | 車隊西移、分段伏擊 | 10 → 7 | 4.0 → 13.5 |
| siege-beetle-convoy | 車隊西移、伏擊、13輪期限 | 10 → 8 | 4.0 → 10.5 |
| tidal-flat-evac | 北撤路程加長、調整攔截 | 10 → 7 | 4.0 → 10.7 |
| shell-excavation-escort | 北端出發、菌柱阻路、白手套換機 | 7 → 8 | 4.0 → 7.0 |
| lunar-blockade-run | 後衛向西分散 | 8 → 8 | 6.8 → 7.3 |
| mirror-choir-vigil | 守點10輪、增援群喉 | 10 → 3 | 4.7 → 16.9 |

| 全 sweep 指標 | 開工 | 最終 |
|---|---|---|
| timeout 平手率 | 10/130（7.69%） | 11/130（8.46%） |
| 平均輪數 | 12.45 | 14.04 |
| rift-edge-nest 玩家陣營勝 | 4/5 | 4/5 |
| 決勝場勝方分布 | player 55.0%／ally 22.5%／enemy 20.8%／third 1.7% | player 47.1%／ally 22.7%／enemy 28.6%／third 1.7% |

勝方分布以非平手場次為分母；rift 玩家陣營包含 ally。六情境十個 seed 的 timeout：convoy-run 為 seed 4、7；siege-beetle-convoy 為 seed 7、8。攻城甲蟲護送的壓力包含 13 輪交付期限；其兩場未勝是 timeout。全 sweep 只採 seed 1–5，timeout 淨增加1場。

驗證工具均依交接書：六情境用 `sweep.ts --seeds 1,2,3,4,5,6,7,8,9,10`，全 sweep 用 `psweep.sh`，彙總用 `sweep-sum.py`，內容用 `npm run check`。未加跑其他驗收項目。

## 產出（改動檔清單）

程式碼工作樹：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/wt-scen`。改動恰為6個情境檔，diff 15,062 bytes，低於30 KB；文字、其他情境、src、map／frame／monster／aiprofile、索引與黃金檔均未改。

- `content/base/scenarios/convoy-run.json`
- `content/base/scenarios/siege-beetle-convoy.json`
- `content/base/scenarios/tidal-flat-evac.json`
- `content/base/scenarios/shell-excavation-escort.json`
- `content/base/scenarios/lunar-blockade-run.json`
- `content/base/scenarios/mirror-choir-vigil.json`

最終量測：[six-final.jsonl](six-final.jsonl)、[sweep-final.jsonl](sweep-final.jsonl)。
開工證據：[six-baseline.jsonl](six-baseline.jsonl)、[sweep-baseline.jsonl](sweep-baseline.jsonl)。
內容檢查：[開工](check-baseline.txt)、[最終](check-final.txt)。

## 沒做到或證據不足的

固定驗收無缺項。證據範圍為本 worktree 的全 AI 戰鬥與指定 seed；尚未包含另一線的 AI／巢母改動，合併後數字由領導依既定安排重量。

依禁區保留文字原樣：siege 與 shell 的敵方編成已有變更，mirror 的守點由4輪改為10輪，相關 brief 的敵種／輪數描述待文字線同步。

## 需要決定的事

無新增裁示。請領導按既定流程整合與 commit，並將上述 brief 差異交文字線處理；本線不做 commit。

以後交接書該點名的工具：無。
