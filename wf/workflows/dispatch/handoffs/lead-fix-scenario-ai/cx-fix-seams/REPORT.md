# cx-fix-seams — 情境三處接縫修正

## 做了什麼

依交接書依序完成 (a)(b)(c)，每項先跑失敗測試再實作；新增恰好 9 個 `test()`，既有測試未刪除。每項完成後皆跑 `npm run check`、`npm run typecheck` 與 `inbox_poll.sh cx-fix-seams --once`。

(a) 情境 slot allies 與世界 ally 關係取聯集，createBattle 對稱化並保存；保留世界 neutral 在戰場敵對的裁定。FactionState 填 faction def id，未提供 factions 的直接 setup 沿用 slot。`hostileSlots` 由 `rules/index.ts` 原有 `export * from "./state.ts"` 匯出，RulesQuery 與 adapter 已接好。eliminate 預設只計敵對 active 單位，明列 slots 與排除 berserk 的行為保留。

(b) scenarioToSetup 保留作者的 target，轉成排序的 units 或單一 unit；未知目標拋錯。killTarget 判定兩種執行期鍵的非空聯集全部 dead。rift 測試驗證解析結果為 `["enemy-0"]`，將該單位標 dead 並送出既有 unitDied 信號後，BattleEnd 為 `{winner:"player", reason:"killTarget"}`。

(c) globals 經 scenarioToSetup 進 runtime，tide 使用只支援 battle.round 的環境求值，light 讀地圖值。地圖最終 destructible 格初始化 featureHp，feature hp（含 0）優先，未提供用地形預設；非 destructible 格無 HP。正式地圖未修改。

全套驗證暴露既有 hooks 測試把正式 spawn 登記永久替換，rift 的新行為走到 spawn 時因此拋「缺少單位：u」。保留兩個既有測試的斷言，改成 finally 恢復原 handler；registerVerb 回傳原 handler 供恢復，正常登記行為不變。

驗證：本線 9/9 通過；黃金 8/8 通過；最終 `npm run check` 為 `OK 0 errors, 0 warnings`；最終 `npm run typecheck` exit 0。交接書指定全套命令 `node --test --test-isolation=none --test-reporter=tap 'src/**/*.test.ts' 'test/**/*.test.ts'` 為 297/297、0 fail、0 skip、exit 0（含 AI，沙箱內計數供參考）。全套通過後，測試清理從 t.after 改為相容既有型別宣告的 finally，相關 hooks＋replay 再驗 8/8、0 fail，typecheck exit 0。原始輸出在 `/tmp/cx-fix-seams/full-final.log`、`hooks-replay-final.log`。固定 gate 的 hostileSlots 三檔均命中、rift ally 欄位存在、core diff 刪除行 0。未 commit。

## 產出（改、增的檔清單）

以下相對專案根 `/home/lorkhan/repo/game_dev/mecha-srpg/`，本線合計 15 檔（含本 REPORT），diff 加新檔小於 45 KB，未達 25 檔／100 KB gate。

- 修改 `content/base/scenarios/rift-edge-nest.json`
- 修改 `schemas/content.schema.json`
- 修改 `src/core/types-def.ts`
- 修改 `src/core/types-state.ts`
- 修改 `src/rules/state.ts`
- 修改 `src/rules/flow.ts`
- 修改 `src/rules/objectives.ts`
- 修改 `src/rules/hooks.ts`
- 修改 `src/rules/hooks.test.ts`
- 修改 `src/sim/run.ts`
- 修改 `src/ai/rules-query.ts`
- 修改 `src/ai/adapters/rules-adapter.ts`
- 新增 `test/sim/seams.test.ts`
- 新增 `test/scenarios/pack/maps/seams-globals.json`
- 新增本 `REPORT.md`

## 沒做到或證據不足的

沙箱外 `npm test` 與最終計數由領導依契約重跑。本線未改 `test/ai/` 或 ops；階段 (a)(b) typecheck 曾因 AI stub 缺 allies 失敗，已寄 PROGRESS 請領導轉知；階段 (c) 曾遇 ops/world/actions.ts 的 TS2322。首輪全套另有 AI sentinel 測試失敗；其他工作線補正後，最終全套與 typecheck 均已通過，無剩餘阻塞。

未做地物受損或變廢墟機制，這是交接書的明確排除項。

## 需要決定的事

無新增待裁定事項；下列 SPEC-GAP 依交接書裁定實作或保留，供領導後續同步 spec。

## 先紅證據

三次均在對應實作修改前執行 `node --test --test-isolation=none --test-reporter=tap test/sim/seams.test.ts`，摘要依序為 0 pass／3 fail、3 pass／3 fail、6 pass／3 fail；修正後依序 3/3、6/6、9/9 通過。原始暫存輸出在 `/tmp/cx-fix-seams/red-a.log`、`red-b.log`、`red-c.log`。

```text
(a) not ok 1 - 同盟：rift ally 的 friendly:no 能力拒絕玩家目標
    ERR_ASSERTION: actual 'out-of-range', expected 'bad-target'
(b) not ok 4 - killTarget：rift 目標解析為 units，死亡信號產生 player 勝利 BattleEnd
    ERR_ASSERTION: actual undefined, expected ['enemy-0']
(c) not ok 8 - 地圖：setup globals 隨 round 求值，未宣告或舊存檔回零，tide 只認 round
    error: '不支援路徑：battle.tide'
```

## 黃金變動原因

未變。先跑 `node --test --test-isolation=none test/golden.test.ts`，8/8 通過，未執行 GOLDEN_UPDATE。

## SPEC-GAP 清單

- 世界 neutral 在戰場視為敵對；只有同 slot 或明確 ally 排除敵對，berserk 永遠敵對。
- 地圖未宣告 tide／light 時使用 0；舊 runtime 缺欄位採相同預設。
- Objective.params 未定義目標鍵；依裁定採內容 target、規則 units／unit，保留原 target。
- spec 未定如何攻擊地物；本線只初始化 HP，不做地物受損／變廢墟。
- 原有情境 rules 覆蓋尚未接入規則層的缺口保留，未擴大本線範圍。

## core 型別新增欄位清單

- `ScenarioDef.slots[slot].allies?: FactionSlot[]`：以交集型別擴充，保留既有欄位行，符合 core diff 僅新增行的硬條件。
- `RulesRuntime.allies: Record<FactionSlot, FactionSlot[]>`。
- `RulesRuntime.globals: { tide?: NumExpr; light?: number }`，另新增 NumExpr 型別匯入。

## 以後交接書該點名的工具

無。
