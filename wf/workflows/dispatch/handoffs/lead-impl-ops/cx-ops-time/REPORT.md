# cx-ops-time：八段時間與戰役模擬完成，固定 13 tests 全過

## 做了什麼

完成 tick 八段編排、每日事件抽取、待選暫停及跨日續跑、applyCommand 複製與拒絕回滾、所有既有 cmd 分派，以及 wait／choose／sortie／save／load／help。船務只接 shipDaily5，不接獸欄或餵食；摘要獸數計算機庫中的生物機甲。

完成 runCampaign、idle／greedy／random、每日不變量斷言、重播、campaignBlob 序列化與重播 hash 校驗、CLI、40 條固定指令的黃金戰役。battle.ts 最後建立；當時 sortie/index.ts 已存在，直接包 runSortie，無需等待或降級為 sortie-missing。重播測試實際包含 BattleResolved，兩次重跑戰鬥與原戰役 state hash 相同。

固定五條驗收，未加項：

1. 指定 `node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'`：77 tests、77 pass、0 fail；本線恰好 13 個 test()，分配 tick 4、commands 2、campaign 3、replay/save 2、golden 1、cli 1。最後 `npm run typecheck` exit 0；`npm run check` exit 0、0 errors／0 warnings。沙箱外 npm test 留給領導。
2. 專案根執行 idle 與 greedy --no-battle 的 12 潮月 CLI，均 exit 0、12 行摘要、尾行 OK；真實戰鬥 greedy 同樣通過，原樣輸出附後。
3. 指定禁依賴 grep 無命中（grep exit 1）。本線只新增 time／sim 程式與本 REPORT，另依授權操作 inbox；未改其他線程式。
4. tick、applyCommand 由 time/index.ts 匯出；runCampaign、replayCampaign、checkInvariants 由 sim/index.ts 匯出。
5. REPORT 有四段與三個附表，並列後續工具。

13 條內的驗證另包含：錯帳、斷 pen 引用及越界 mastery 會被不變量檢查擋下；竄改 snapshotHash 會拒載；runner 先改後拒絕也完整回滾。這些為原指定 test() 的斷言，未新增測試條數。

## 產出（檔清單）

程式、測試、fixtures 合計 19 個新增檔、38,273 bytes；加 REPORT 共 20 個檔，低於 25 檔／150 KB gate。未 commit。下列為逐檔導航。

<!-- wf-nav -->
- [time/tick.ts](../../../../../../src/ops/time/tick.ts)
- [time/commands.ts](../../../../../../src/ops/time/commands.ts)
- [time/index.ts](../../../../../../src/ops/time/index.ts)
- [time/tick.test.ts](../../../../../../src/ops/time/tick.test.ts)
- [time/commands.test.ts](../../../../../../src/ops/time/commands.test.ts)
- [sim/campaign.ts](../../../../../../src/ops/sim/campaign.ts)
- [sim/policies.ts](../../../../../../src/ops/sim/policies.ts)
- [sim/invariants.ts](../../../../../../src/ops/sim/invariants.ts)
- [sim/replay.ts](../../../../../../src/ops/sim/replay.ts)
- [sim/save.ts](../../../../../../src/ops/sim/save.ts)
- [sim/battle.ts](../../../../../../src/ops/sim/battle.ts)
- [sim/cli.ts](../../../../../../src/ops/sim/cli.ts)
- [sim/index.ts](../../../../../../src/ops/sim/index.ts)
- [sim/campaign.test.ts](../../../../../../src/ops/sim/campaign.test.ts)
- [sim/replay.test.ts](../../../../../../src/ops/sim/replay.test.ts)
- [sim/golden.test.ts](../../../../../../src/ops/sim/golden.test.ts)
- [sim/cli.test.ts](../../../../../../src/ops/sim/cli.test.ts)
- [sim/fixtures/campaign.json](../../../../../../src/ops/sim/fixtures/campaign.json)
- [sim/fixtures/campaign-hash.json](../../../../../../src/ops/sim/fixtures/campaign-hash.json)
- [REPORT.md](REPORT.md)

## 沒做到或證據不足的

沙箱外 npm test、最終 git diff 計數與 commit 依交接書留給領導；未改 code map、共用 types 或 package.json。早期 typecheck 的 sortie/run.test.ts TestContext.todo 錯誤由其他線修正，最後原指令通過。

命名 Prompt 的預設名字可透過 choose 套用 nameMech；自填選項回 name-required，因 OpsCommand.choose 只有數字，不能攜帶文字。自填仍可由既有 crew.applyName 入口完成，未擅加動詞或修改共用型別。

save/load 指令只記事件；sim/save 提供純序列化、解析與載入校驗，檔案 I/O 由呼叫端負責。blob 按交接書只含 start、seed、commands、snapshotHash，未另加內容包版本欄。hash 沿用 core 的 canonicalJson＋fnv1a64。黃金戰役為 40 條指令、seed 7；`GOLDEN_UPDATE=1 node --test --test-isolation=none src/ops/sim/golden.test.ts` 可重產事件日誌 hash。

## 需要決定的事

無需使用者追加決策。本次不擴大驗收；領導可依固定五條重跑並提交。共用型別整理時可納入 TimeState.time 的當日續點；自填命名文字入口與不重跑戰鬥的重播格式留待後續契約。

## greedy 12 潮月的 CLI 輸出

命令：`node src/ops/sim/cli.ts --months 12 --seed 7 --policy greedy`，exit 0。

```text
潮月 1 day=28 cash=164 debt=25200 人數=7 機庫中的生物機甲數=0 蝕化節點數=0 裂縫數=2
潮月 2 day=56 cash=0 debt=26460 人數=6 機庫中的生物機甲數=0 蝕化節點數=5 裂縫數=4
潮月 3 day=84 cash=0 debt=27783 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 4 day=112 cash=0 debt=29172.15 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 5 day=140 cash=0 debt=30630.7575 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 6 day=168 cash=0 debt=32162.295375 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 7 day=196 cash=0 debt=33770.41014375 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 8 day=224 cash=0 debt=35458.9306509375 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 9 day=252 cash=0 debt=37231.87718348438 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 10 day=280 cash=0 debt=39093.471042658595 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 11 day=308 cash=0 debt=41048.14459479153 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
潮月 12 day=336 cash=0 debt=43100.5518245311 人數=0 機庫中的生物機甲數=0 蝕化節點數=8 裂縫數=4
OK
```

## 別模組的 bug 與繞法

sortie.validateSortie 接受全空座位的機械機體，營運人物離隊後可能反覆 battle-maxSteps。重現：default、seed 7、greedy；修正前診斷於 day 170，contract-76、base:node/salt-flat、rift-19，sortie 的 mech-10／mech-8／mech-9 全部 pilot:null、soul:null。診斷將 runSortie 的 maxSteps 設 100 時，170／171／172 日皆回 battle-maxSteps，12 潮月共 26 次；預設 10000 步的舊 CLI 因耗時手動中止。最小繞法放在本線 policies：只送可控制的機體，無可出戰者 wait 1。正式 defaultBattleRunner 仍用 runSortie 原預設，沒有縮小戰鬥步數。修正後正式 CLI 正常完成；未改 sortie。

text/index.ts 沒有契約原先點名的 cmdLook／cmdTalk／cmdGo。本線 commands.ts 使用既有房間、對話與條件查詢補最小實作，未更改文字模組。next 事件目標不參加每日獨立抽牌，避免 credit-call 續篇每日重播；明示的 pendingEvents 與 choose.next 仍可進入。

## SPEC-GAP 清單

| 缺口 | 本線最小解 |
|---|---|
| 半日續點 | time.resume=5；pendingTicks 只記餘日 |
| tick 回傳 void | 就地編排；applyCommand 複製與回滾 |
| text 無 cmd | commands 補 look／talk／go |
| 事件鏈抽取 | next 目標不獨立抽牌 |
| 自填名稱 | 回 name-required，保留 applyName |
| 零耗日策略 | 每次行動後至少推進一天 |
| 全空座位出戰 | greedy 無可控機體則等待 |
| spec 不重跑戰鬥 | v1 按交接書重跑同 RNG 戰鬥 |

## 以後交接書該點名的工具

無。
