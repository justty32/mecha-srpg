# REPORT — lead-tune：戰鬥／營運後期調校（engine-backlog P1 #2–4、#6，P2 #7–8）

[handoffs](../README.md)｜[engine-backlog](../engine-backlog.md)

STATUS：**DONE**（2026-10-24，頂層代存）。領導 Opus；工人全用 codex `gpt-6-astra`（reasoning high，`codex exec`，交接書皆過 `brief_lint --strict`），共六條：`cx-tune-part`、`cx-tune-intent`、`cx-tune-human`（兩輪）、`cx-tune-anchor`（兩輪）、`cx-tune-multi`、`cx-tune-scen`。交接書與工人 REPORT 在本目錄的同名檔與子目錄。

## Commit

| commit | 內容 | 工人 |
|---|---|---|
| `b95dcd4` | 效果實例 owner 不再寫 `part: undefined` 之類的空鍵（P1 #6） | cx-tune-part |
| `77ea5bb` | 個體撤退觀察期 `individualRetreatMinRound`=3（P1 #2） | cx-tune-intent |
| `2948c52` | 五份人類遭遇編成下修（P2 #7） | cx-tune-human |
| `45f33ab` | 斬首／捕獲的可達性改用致死 HP；巢母核心 105→42（P1 #3） | cx-tune-anchor |
| `7937da5` | berserk 追擊目標與撤退優先序修正（多方 timeout，P2 #8） | cx-tune-multi |
| `a8d30f4` | 六個過易情境改部署／編成／守點輪數（ISS-043，P2 #8） | cx-tune-scen |

另有 `668d2a1`、`326c40b`（CLAIMS 登記）、`5d4ae96`（收線）。

## 前後數字（同一基底 `b95dcd4`，只差本線改動）

前＝`baseline/`；後＝`after/`（`b95dcd4` 加本線全部 diff 的乾淨 worktree，不含 lead-grid 遷移）。

| 量測 | 前 | 後 | 工具 |
|---|---|---|---|
| 營運 greedy seed 1–5×12 潮月：出戰 | 89 | 62 | `tools/ops-tally.ts`＋`ops-sum.py` |
| 　勝＋擊退 | 29＋6＝35 | 30＋11＝41 | 同上 |
| 　撤退（其中第 1 輪就撤） | 54（48） | 20（0） | 同上 |
| 　平均輪數 | 4.0 | 5.7 | 同上 |
| 凍結 anchored 26 場玩家勝 | 9 | 14 | lead-ai-objective `battle-bench.ts --phase anchored` |
| 人類遭遇六份×seed 1–10（default 全機庫） | 16/60 | 37/60（各 3–8） | `cx-tune-human/human-bench.ts` |
| 戰鬥 sweep 26 情境×5 seed：timeout 平手 | 10（7.7%） | 5（3.8%） | `tools/psweep.sh`＋lead-tune-battle `sweep-sum.py` |
| 　平均輪數 | 12.45 | 12.66 | 同上 |
| 　勝方 player／ally／enemy／third | 55／22／21／2% | 54／19／26／1% | 同上 |
| 　rift-edge-nest 玩家陣營 | 4/5 | 4/5 | 同上 |
| crater-three-way／delta-four-way timeout（seed 1–10） | 6／9 | 1／0 | lead-playtest `sweep.ts` |
| 護送四情境＋月面封鎖＋碎鏡守夜 | 4–5 輪 5/5 速勝 | seed 1–10 勝 3–8、平均 7–17 輪 | 同上 |

出戰數 89→62 不是退步。舊數字含 48 場「第 1 輪撤、再重打」的灌水；`tools/day-tally.ts` 顯示 greedy 336 天裡「無進行中契約」的等待佔 141–255 天（多數 seed 約 250 天）。**出戰數由契約供給決定**，已併入 engine-backlog 第 5 列（第二年經濟，大地圖上重調），並通知 lead-grid。

## 驗收

在乾淨 worktree（`a8d30f4` 的內容）跑：`npm test` 874/874；`npm run check` 0 錯 8 警告；`npm run typecheck` 0；`npm run test:e2e` 13/13；`npm run fuzz -- --runs 2000 --mode mix` 2000 場 0 硬違規、全部不變量 0；6 個黃金全程未變。

`bash wf/tools/wf-lint.sh --strict .`：0 壞連結；剩兩項不屬本線——`design-notes/terms.md` 超過 8 KB、CLAIMS 現役表 >1 KB（別線的登記）。本線的 ROSTER 格已合併為一格。

## 根因與判斷

- **首輪撤退**：營運 `src/ops/sortie/scenario.ts` 對 mood<0 的駕駛注入 `morale-shaken`，進場即 breaking 士氣，`individualRetreat` 立刻成立（機體 HP 其實夠）。AI 端改成前 3 輪只在本場受火、受創或士氣再惡化時才個體撤。ops 端要不要在出戰前回復士氣，交 lead-grid 判斷。
- **anchored**：`unreachable` 對 killTarget 加總目標全部部位的 HP（巢母 1580），但 `isDead` 只要求所有 core 部位毀損，高估十幾倍，第 8 輪就判不可達而撤。改用致死 HP 後，核心只需降到 42（原 105）。工人第一輪把核心砍到 21（一發弧光就秒，nest-core-assault 4–7 輪速勝），**領導否決**；第二輪加硬限制「核心 ≥42」並修 AI，nest-core-assault 平均 19.2 輪。
- **人類遭遇**：第一輪用 `fixture()` 的單機當玩家隊，把每份遭遇砍成 1 台敵機——這是交接書寫錯。第二輪改用 default 開局全機庫（3 台 C 級）重調。
- **多方 timeout**：berserk 以「最近的可見單位」為追擊目標，第三方部署緊鄰時永遠在追打不到的友軍；設定檔 berserk 又蓋過撤退命令。修正後，只有真正失控（`controlMode === "berserk"`）才拒絕撤退。

## 剩餘與需要決定的事

1. ops 士氣：出戰前是否回復 mood／士氣（`src/ops/`，lead-grid 領地）。AI 端已緩解，不急。
2. 解拘者現為通用長槍 V1×3（教團 B 級機太強），白手套借 IX-01。lead-content 已新增 7 台人類對手機，下一輪平衡可接進遭遇，換機後要重跑 `human-bench.ts`。
3. 情境 brief 文字（siege-beetle-convoy／shell-excavation-escort 的敵種、mirror-choir-vigil 守點 10 輪、tide-unshacklers 編成）已發信請 lead-rename 同步（lead-rename 已收線，頂層轉交 lead-world-land）。
4. anchored 仍有 12/26 敗，多數是核心沒受傷（命中散到其他部位）。下一步可做瞄核心評分，或讓傷害速率只算核心命中。本線之後 greedy 營運路徑沒有再出現 anchored 出戰，全營運驗證要等大地圖。
5. seal／opening 契約 6/6 撤退（第 2–5 輪、受火後）：先鋒偏強或玩家隊偏弱，屬平衡後續。
6. engine-backlog 第 16 列（指揮者 tag、輪替接補給、字串意圖欄）未做，需要動 aiprofile schema。
7. scratchpad 留有 worktree：`wt-intent`、`wt-part`、`wt-human`、`wt-anchor`、`wt-scen`、`wt-multi`、`wt-base`、`wt-merge`、`wt-final`、`wt-after`。移除屬刪檔，待頂層同意後 `git worktree remove`。

## 以後交接書該點名的工具

- `tools/ops-tally.ts`：營運逐場戰果與首輪撤退。
- `tools/day-tally.ts`：greedy 每天在等什麼。
- `tools/r1-probe.ts`：印「第 1 輪撤退」出戰的事件。
- `tools/psweep.sh`：情境數以實際枚舉為準，現為 26–28。
- lead-tune-battle 的 `sweep-sum.py`：指定情境的篩選不認 `base:` 前綴。
- 追蹤 AI 判斷可用 Node `registerHooks` 唯讀插樁（工人自行發現）。
