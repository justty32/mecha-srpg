# cx-ops-intent：正式擊退與活捕個體回寫完成，四條驗收完成（DONE）

## 做了什麼

已親自讀交接指定的 AGENTS、feature-dev、testing 與 testing-checks、conventions、user、code-map、dev-env、inbox 規矩及兩份背景 REPORT，並查閱 c2ae883、b23c936。上線已寄 PROGRESS；每步已輪詢 orders。本次基準為 HEAD `2a9a78801e150ccf7cc94efdb66bb624734b97b1` 加共用工作樹。

monster.def：實查 `src/sim/run.ts` 的 scenarioToSetup 已填 `def: monster.id`，`runSortie` 與 `sortieBattleSetup` 都沿用，prepareSetup 也未移除。因此不重複增加接線，不改 run.ts／scenario.ts；新增測試從營運 sortieBattleSetup 進實際 createBattle，確認敵獸覆寫 HP、敵獸與玩家活捕獸 accuracy +6，以及每隻怪獸都保留 def。玩家已存部位的耗損仍優先，不藉初始化回滿血。這是對交接背景「營運沒傳 def」的實查修正。

擊退：規則 battleResult 實際回傳 `{ ...outcome }`，所以正式欄位位於 `result.detail`；但 BattleResult 型別尚未列出。營運端以 `Pick<BattleOutcome, "detail">` 補相容型別，classifyOutcome 優先讀 repelled：player／ally 勝為 repelled，對方勝為 withdrew。原 withdrawn、reason 與 units 推斷保留給舊結果。測試從真實 battleResult 取出 detail，提供相反的單位狀態，確認正式欄位優先。

monster id：活捕優先讀 units[].monster；只在缺 id 的舊結果才走 frame／同族同級唯一個體後備。實測 mirror-a 是 A 級，但 capture.frame 的 bio-mirror 是 B 級，原 admitBeast 會因此漏掉二名；本線在 apply.ts 完成入艙後，依原 monster.grade 套用二名，沒有修改拘束艙模組。測試放入兩隻同族同級 A 級鏡肢、不同二名，分別捕捉兩者，並驗舊結果後備。

## 產出（含完整檔案清單）

本線程式 3 檔，相對開工快照的 unified diff 共 10,048 bytes，未超 8 檔／25 KB gate；完整差異另存 `/tmp/cx-ops-intent/own.diff`。未 commit，未重產黃金 hash，未改其他線檔案。

- `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/apply.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/outcome.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/src/ops/sortie/intent.test.ts`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-gaps-ops/cx-ops-intent/REPORT.md`

固定四條驗收，沒有新增 gate：

1. `npm run typecheck` exit 0，兩段 tsc 通過。日誌 `/tmp/cx-ops-intent/typecheck.log`。
2. 新測試 3 pass／0 fail，exit 0；第 1、2、3 點各一條。日誌 `/tmp/cx-ops-intent/new-green.log`。修改前紅燈證據如下。
3. `npm test` exit 1，沙箱檔級摘要 129 pass／4 fail；ops 只有黃金 hash 與可在本線修改前快照重現的 entry 存檔舊錯，無本線新增紅燈。日誌 `/tmp/cx-ops-intent/npm-test.log`，歸因見下一節。
4. `node src/ops/sim/cli.ts --months 12 --policy greedy --seed N`，N=1、2、3，以及 `--policy merc --seed 1`，四組皆到第 12 潮月 day=336、exit 0、印 OK。日誌 `/tmp/cx-ops-intent/greedy-{1,2,3}.log` 與 `/tmp/cx-ops-intent/merc-1.log`。

紅綠證據：以 registerHooks 在記憶體載入開工時 apply.ts／outcome.ts，最終新測試 1 pass／2 fail，exit 1；分類預期 repelled 卻得 withdrew，捕捉預期「千面獨禱」卻得 undefined。日誌 `/tmp/cx-ops-intent/new-red-final.log`，hook `/tmp/cx-ops-intent/baseline.mjs`，原檔快照 `/tmp/cx-ops-intent/{apply,outcome}.before.ts`。monster.def 測試在開工前已綠，不能冒稱修前為紅；另用 `/tmp/cx-ops-intent/missing-def.mjs` 在記憶體移除共用轉換中的 def，該測試即 0 pass／1 fail、exit 1，證明能攔截漏傳，日誌 `/tmp/cx-ops-intent/def-red.log`。全程沒有還原共用工作樹或落盤修改 sim。

量測只觀察，不修 AI／規則。下表讀同次 CLI 最終的 BattleResolved.outcome 與 rounds；以 `NODE_OPTIONS='--import /tmp/cx-ops-intent/count-outcomes.mjs'` 注入計數輸出，沒有修改 CLI 或另跑替代模擬。

| greedy 12 潮月 | win | repelled | withdrew | lost | timeout | 合計 |
|---|---:|---:|---:|---:|---:|---:|
| seed 1 | 7 | 5 | 19 | 0 | 0 | 31 |
| seed 2 | 12 | 6 | 9 | 0 | 0 | 27 |
| seed 3 | 9 | 8 | 5 | 0 | 0 | 22 |

| 玩家撤退的戰鬥結束輪次 | seed 1 | seed 2 | seed 3 |
|---|---:|---:|---:|
| 1 | 12 | 0 | 0 |
| 3 | 0 | 1 | 0 |
| 4 | 1 | 2 | 2 |
| 5 | 2 | 0 | 0 |
| 6 | 3 | 3 | 2 |
| 7 | 0 | 2 | 0 |
| 8 | 1 | 1 | 1 |
| 合計 | 19 | 9 | 5 |

未列輪次均為 0。輪次是本場 BattleResult.rounds／BattleResolved.rounds，並非每台玩家單位各自按下撤退的輪次。前線舊測 seed 1 為 61 次，本次為 19 次；共用 HEAD／工作樹與當時不同，不能將差額歸因於本線修改。

## 沒做到或證據不足的

完整 npm test 仍有四個失敗檔：`src/mcp/cli.test.ts`、`src/mcp/e2e.test.ts`、`src/ops/sim/golden.test.ts`、`src/ops/sortie/entry.test.ts`。MCP 超出本線範圍，沒有進一步斷言其根因；黃金 hash 依交接豁免且未重產。

entry.test.ts 直接執行與載入本線開工快照各為 6 pass／1 fail、exit 1；同在第 108 行 parseCampaign(source) 與 blob deepEqual 失敗，diff 都是 effect.owner 的 part:undefined／layer:undefined 被 JSON 丟棄。證據 `/tmp/cx-ops-intent/entry-current.log`、`/tmp/cx-ops-intent/entry-baseline.log`，與開場頂層信件及 cx-ops-retreat REPORT 所記已知問題一致，故非本線新錯。

未執行固定四條以外的 check、lint、fuzz、e2e 或其他政策模擬。沒有改 spec／code map；新測試位置及兩個既有模組的改動已完整列於本報告，供領導收線同步。

## 需要決定的事

無使用者決策或阻塞。請領導收線時納入上述三個程式檔與本 REPORT，保留其他線改動；rules 的 BattleResult 型別可由該線後續補上 detail，既存 entry 存檔錯誤仍由原責任線處理。

以後交接書該點名的工具：`node <test-file.ts>` 可取得沙箱內逐條 assertion；`node:module.registerHooks` 可用開工快照驗紅、注入漏傳欄位以及在同次 CLI 收集分類與輪次，不必改禁區檔案；`NODE_OPTIONS=--import` 可在原 CLI 命令保留 import.meta.main；本線只在 `/tmp/cx-ops-intent/` 放 hook、快照及日誌。
