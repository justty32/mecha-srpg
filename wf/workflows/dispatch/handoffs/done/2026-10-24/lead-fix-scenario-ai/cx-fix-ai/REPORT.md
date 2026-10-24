# cx-fix-ai — tactical 解除空等並接上 slot 同盟

STATUS：**DONE**。2026-10-24；seed 1–5 全部 pass，seed 6–10 已記錄；本線未 commit，依交接書只做固定五條驗收。沙箱外重算由領導負責。

## 做了什麼

同盟判斷集中在可選 `hostileSlots` helper；move 敵人集合、strategy 目標、danger 來源與兵力比都使用它。沒有該查詢時保留 slot 不同即敵對與 berserk 敵我不分的回退。`knowledge.ts` 未改。

未接敵時，tactical 的候選排序與移動評分朝公開地圖中央偵察；已接敵仍按已知敵人距離評分。沒有讀取視野外敵人的位置。Wait 預設取消獎分；危險改扣移動增加的部分，避免原地出手被無條件判成負收益。所有調整係數仍由 `{ ...DEFAULTS, ...ctx.params }` 覆蓋。

新增恰好 3 個 test：同盟 danger／strategy／兵力比、原始 skirmish seed 1 二十輪平衡回歸、偵察移動／原地攻擊危險／profile 覆蓋。依上游 08:31 orders，測試替身只補 `allies: {}`、`globals: {}`。

### Wait 勝出根因

基準 seed 1–5 都是 Wait 160／TurnEnd 160、零死亡、timeout，與交接書一致。seed 1 hash 為 `f754e05183afd077`。

臨時診斷腳本 `/tmp/cx-fix-ai/inspect.ts` 印出前兩輪候選：round 1 `player-2` 與 `player-0` 都是 Wait 0.02、End 0.01、最佳 Move 0，沒有合法對敵能力候選。看不到敵人時，原先 nearest 一律 0，移動沒有接近收益；候選又依座標排序，缺乏偵察方向。固定正分的 Wait 每輪必勝，耗盡可用能力後也比 End 高。

seed 1 原本的 19 次 `useAbility` 全是 `rearguard-oath` 自我支援，3 次 Hit 也都是它，沒有真正對敵攻擊；所以「19 次出手」不能當成對敵攻擊量。十分律不是這份基準停滯的直接原因。

另一個評分不對稱是 Wait／End 不扣危險、原地攻擊卻扣完整 heat map；以增量危險修正。沒有為通過門檻修改情境、地圖、武器、單位或規則。

### 係數前後對照表

| 鍵 | 舊值 | 新值 | 理由 |
|---|---|---|---|
| waitScore | 0.02 | 0 | 不獎勵無已知收益的空等 |
| dangerK | 0.05 | 0.01 | 新增威脅仍有代價，避免蓋過接近收益 |
| endScore | 0.01 | 0.01 | 保留守點策略可直接選出 End |
| reposition | 0.3 | 0.3 | 未接敵時改計接近地圖中央的距離 |
| moveCost | 0.01 | 0.01 | 移動後施放能力的步數成本不變 |

`waitScore` 仍是 profile 可覆蓋的固定分，只改預設值；預設 tactical 因此不會主動 Wait，本線沒有實作延遲行動的預測。`dangerK` 語意由「目的地總威脅係數」改成 `max(0, danger(destination) - danger(origin))` 的係數；降低危險不額外產生正分，escape 原有需求評分保留。

調整共兩輪：第一輪曾將 End 設 0，完整測試發現 sentinel 無正分候選，第二輪還原 0.01，未放寬該測試。既有 `score.test.ts` 只改兩項精確數值斷言：Move 從 `0.3 - 0.05 * 2` 改為 `0.3 - 0.01 * 2`，Wait 從 0.02 改為 0；原因分別為 dangerK 與 waitScore 的預設值變更。

### 量測前後表

每格為「前→後」；`—` 表示改前未測。前後都使用交接書原始 `measure.ts`，未改量測腳本。seed 1–5 最終全部 `pass:true`；seed 6–10 只記錄（本次也均為 true），不另設通過要求。

|seed|waitRatio|winner|reason|hits|deaths|
|---|---|---|---|---|---|
|1|1→0|null→null|timeout→timeout|3→67|0→3|
|2|1→0|null→player|timeout→eliminate|6→52|0→3|
|3|1→0|null→player|timeout→eliminate|7→56|0→4|
|4|1→0|null→player|timeout→eliminate|7→66|0→3|
|5|1→0|null→player|timeout→eliminate|6→60|0→3|
|6|—→0|—→null|—→timeout|—→54|—→2|
|7|—→0|—→player|—→eliminate|—→75|—→3|
|8|—→0|—→null|—→timeout|—→47|—→2|
|9|—→0|—→player|—→eliminate|—→65|—→3|
|10|—→0|—→player|—→eliminate|—→55|—→3|

最終 seed 1：175 次能力使用（156 次帶傷害），67 Hit、3 死亡、20 輪 timeout；hash `0613183bba2e5c5f`。seed 2–5 分別於第 17、17、20、18 輪 player 勝；勝負與死亡只作記錄，不新增門檻。

### 十分律觀察

`content/base/rules/damage-modifiers.json` 的規則是 `conventional-arms × kaiju → 0.1`。此 skirmish 的敵方是 `human, mech`，沒有 kaiju；對它們此列不套用，即係數 1。24 點常規傷害只有對 kaiju 才會先變成 2.4（層抗性等後續修正另計），不能把本情境所有傷害都當成十分之一。

以 `/tmp/cx-fix-ai/damage.ts` 重跑 seed 1，逐條重播實際指令，在執行前用 maskedState 呼叫 `previewOutcome`，對照實際 `LayerDamaged`。抽樣如下（預估為命中條件下的傷害，實際未命中為 0）：

| 輪／能力／目標 | packet | AI 預估 | 命中率 | 實際 LayerDamaged |
|---|---:|---:|---:|---:|
| 2／reaper-cleave／enemy-1 頭 | 20 | 20 | 40% | 20 |
| 2／reaper-cleave／enemy-1 左臂 | 20 | 20 | 40% | 20 |
| 6／shell-lance／enemy-2 左臂 | 32 | 32 | 42% | 30 + 2 |
| 8／shell-lance／enemy-2 腿 | 32 | 32 | 42% | 32 |

這些樣本預估與實際相符，期望傷害尺度分別是 8、13.44；score 再除以剩餘總 HP 並乘目標價值，原有算法未改。最終診斷局的 156 次帶傷害能力指令全部有 preview 命中樣本（134 次 cleave、20 次 shell-lance、2 次 charge）。沒有證據支持以修改十分律或放大預估傷害解決本次停滯，因此保留規則與傷害預估。

## 產出（改、增的檔清單）

- 新增 `src/ai/hostility.ts`。
- 修改 `src/ai/danger.ts`、`src/ai/strategy.ts`、`src/ai/score.ts`。
- 修改 `src/ai/policies/tactical.ts`。
- 新增 `test/ai/balance.test.ts`（3 tests）。
- 修改 `test/ai/score.test.ts`、`test/ai/stub-rules.ts`。
- 新增本 REPORT：`wf/workflows/dispatch/handoffs/lead-fix-scenario-ai/cx-fix-ai/REPORT.md`。

合計 9 檔（8 個程式／測試檔＋REPORT），不超過 12 檔 gate。共用工作區的 `rules-query.ts`／`adapters/` 等他線修改不屬於本線 diff。

固定驗收證據：最終量測結果見上表；全套指定指令 `node --test --test-isolation=none --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'` 為 296 tests／295 pass／1 fail，唯一失敗在交接書排除的 `test/sim/replay.test.ts`，其餘 0 fail。本線新增 3 tests。`npm run check` exit 0、0 errors／0 warnings；`npm run typecheck` exit 0（含 UI tsconfig）。原始 `owner !== ctx.slot`／`owner !== slot` 搜尋在指定三檔 0 命中。本線程式 diff 只在授權的 AI／test 路徑；含 REPORT 的 diff 與新增檔合計約 20 KB，低於 60 KB gate。

完整暫存證據在 `/tmp/cx-fix-ai/`：`before.jsonl`、`final-main.jsonl`、`final-extra.jsonl`、`inspect-before.jsonl`、`damage-final.jsonl`、`tests-final.tap`、`check-final.log`、`typecheck-final.log`。診斷腳本也只留在該暫存目錄。

## 沒做到或證據不足的

沙箱外 `npm test` 與最終計數依契約由領導執行。本線以 `--test-isolation=none` 跑全套；`test/sim/replay.test.ts` 的 rift-edge-nest 案例受 `src/rules/hooks.test.ts:53` 共用 hook 影響，報「缺少單位：u」，兩輪均相同，未越界修改。此判斷來自錯誤堆疊；未加跑交接書以外的隔離驗證。

朝中央偵察是有限啟發式，不保證所有地圖都能找到敵人；Wait 預設為 0 也不代表已有成熟的時機等待策略。上述限制不新增驗收條件。seed 6–10 改前未量測；本情境未觸發十分律，沒有聲稱測過常規兵器對 kaiju 的實際傷害。

## 需要決定的事

無。本線不要求調整十分律或新增驗收。

## 以後交接書該點名的工具

無。
