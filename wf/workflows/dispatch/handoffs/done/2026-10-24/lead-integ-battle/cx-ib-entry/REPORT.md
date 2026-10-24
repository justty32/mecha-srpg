# cx-ib-entry REPORT

STATUS：DONE。固定五項驗收全部通過。

## 做了什麼

已完成正式戰鬥入口與營運遷移。UnitInit 接受部位現況、控制模式、單位效果及人物現況；未給新欄位時維持既有預設。快照均深拷貝，人物現況優先於舊 pools 捷徑，匯入效果／貢獻的流水號會推進 runtime 計數器。

scenarioToSetup 接受內嵌 mapDef 與 personStates；人物實例不必登記在 ContentDB，仍引用既有 PersonDef 模板。ops 不再覆蓋 ContentDB。runBattle 預設將完整 state.log.events 的獨立副本放入 BattleResult.events，無開關；直接呼叫 rules.battleResult 仍維持原有輸出。計功依 UnitDied，耗材依 AbilityUsed，戰後部位與人物 HP 直接寫回。

重播格式（SPEC-GAP）：runCampaign 的 commands[].battle 保存實際 sortie、runner 成敗、BattleResult、營運 RNG、effectCounter。重播恢復營運游標後，經共用 applySortieResult 處理排隊與戰果，不生成情境、不呼叫 runner。舊 runner 參數保留呼叫相容性但不使用。BattleResult 內池 max=Infinity 在紀錄時轉為 MAX_SAFE_INTEGER，與既有營運回寫表示一致，因此可直接 JSON 序列化而不變成 null；不需修改 CampaignState。

固定五項驗收：

1. 新增恰好 7 個 test()（entry.test.ts）；npm test exit 0，沙箱輸出 79 檔、79 pass、0 fail；npm run typecheck exit 0；npm run check 與 ops content/check 均 exit 0、0 errors。既有 apply.test.ts 僅更新兩個案例的輸入契約，未增測試數。
2. `grep -n "scenarioDB\|ctx.db = " src/ops/sortie/*.ts` 無命中（exit 1）。DB 測試用會拋錯的 setter 同時禁止中途替換。
3. 三潮月 greedy 在兩階段均 exit 0；十二潮月 seed 7 的 idle 與 greedy 均 exit 0（day 336，輸出 OK）。
4. core 無修改；rules 型別只有新增可選欄，既有欄位及 BattleSetup 不變。
5. REPORT 已寫入指定主 repo 絕對路徑，具四段及三附表。11 個程式／測試檔，另 1 個 REPORT；tracked diff 37,732 bytes，加新測試 6,299 bytes 約 44 KB，未達 20 檔／80 KB gate。

證據在 `/tmp/cx-ib-entry/`：step2-test.log、final-test.log、typecheck.log、check.log、ops-check.log、step2-cli.log、step3-cli.log、greedy12.log、idle12.log。七項測試涵蓋指定狀態／事件／DB／重播／存檔要求；同一測試內亦確認錯誤 sortie 紀錄、負計數器與缺戰果存檔會被拒絕。

## 產出（檔清單）

所有程式修改均在指定 entry worktree，未 commit。

- `src/rules/state.ts`
- `src/rules/flow.ts`
- `src/sim/run.ts`
- `src/ops/sortie/scenario.ts`
- `src/ops/sortie/run.ts`
- `src/ops/sortie/apply.ts`
- `src/ops/sortie/apply.test.ts`
- `src/ops/sortie/entry.test.ts`（新增）
- `src/ops/sim/campaign.ts`
- `src/ops/sim/replay.ts`
- `src/ops/sim/save.ts`

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-integ-battle/cx-ib-entry/REPORT.md`。

## 沒做到或證據不足的

未擴增交接書以外的驗收。既有無戰鬥紀錄可重播；舊版已打戰鬥但未存戰果的檔案不能憑空還原，loadCampaign 會以 snapshot hash 不符拒載。自訂 runner 若做任意營運修改卻不回傳 BattleResult，不屬本紀錄契約；既有無副作用假 runner 仍支援。支援火力內容、活捕獸 TODO 等排除項維持原樣。

## 需要決定的事

無待決事項。戰果存放位置、事件預設附帶及有限池表示依交接書授權採上述方案；領導可直接檢閱修改與整合。

## 新增欄位表

| 型別 | 欄 | 可選 | 語意 |
|---|---|---|---|
| UnitInit | parts | 是 | 各部位 layers.hp／broken 與部位 broken |
| UnitInit | controlMode／effects | 是 | 控制模式與單位效果快照 |
| UnitInit.persons[] | state | 是 | pools、effects、contribs、morale、will、attrsBase、xp、level 的部分現況 |
| BattleResult | events | 是 | GameEvent[] 完整獨立副本 |
| DynamicScenario | mapDef／personStates | 是 | MapDef 與人物實例字典 |
| CampaignCommand | battle | 是 | sortie、outcome、可選 result、rng、effectCounter |

## 刪掉的繞法清單

| 原繞法 | 正式替代 |
|---|---|
| scenarioDB overlay／暫換 ctx.db | mapDef＋personStates |
| 臨時 PersonDef／烘焙人物貢獻 | persons[].state |
| 部位與人物 HP 差分回寫 | 現況帶入、戰果直接寫回 |
| 成功指令拼 AbilityUsed、最後狀態拼 UnitDied | BattleResult.events |
| 重播重新生成情境與跑戰鬥 | 指令紀錄戰果＋共用回寫入口 |

## 黃金 hash 變動表

| 項目 | 舊＝新 | 原因 |
|---|---|---|
| combat-conduct | 02429ecee80e088a | 無變動 |
| combat-layers | ff765945dad0d274 | 無變動 |
| combat-tenth | 969fa5e9e4e214fa | 無變動 |
| people-berserk | f7f2de6106b4efd1 | 無變動 |
| people-capture | f7a55f7012a0b0a0 | 無變動 |
| people-eject | c86ec6aa436d1dfa | 無變動 |
| ops campaign | 545be0239746ade5 | 固定紀錄無戰鬥，仍 282 events、day 31 |

所有黃金檔均未修改；既有 AI／sim hash 斷言由 npm test 一併通過。新重播／存檔測試比較原跑與重播 state hash 相等。

## 以後交接書該點名的工具

沿用本次工具即可：npm test／typecheck／check、ops content/check、ops sim/cli（3 潮月與 12 潮月）、grep（禁用繞法與新增 test 數）、git diff（型別與容量）、inbox_poll.sh 與 inbox_mail.sh。沙箱 npm test 可能按檔計數，新增七條以 test() 原始碼數及該檔 0 fail 為證。
