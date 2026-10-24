# cx-ib-term REPORT

## 做了什麼

完成 hold／escort 結束條件、self 必中與怪獸命中屬性、ops 武器開局／部署分離／20 輪上限、已交戰才撤離的門檻。新增 `test()` **7 個**：目標 3、命中 1、開局與情境 2、撤離 1；沒有增加驗收條件。

固定五條驗收結果：

1. `node wf/workflows/dispatch/handoffs/lead-integ-battle/bench-ops.ts 3000 2`：`stopped=outcome`、round=5、commands=224、winner=player、hash=`735b3c9848bbb523`。
2. `node src/ops/sim/cli.ts --months 3 --seed 7 --policy greedy` exit 0；兩場 outcome，player／enemy 各勝一場；第 3 潮月 2 人。
3. `--months 12 --seed 7 --policy greedy` 與 `--policy idle` 都 exit 0。
4. `npm test`：exit 1，75 pass／1 fail（沙箱以測試檔計數），51.63 秒；唯一失敗為 `test/ai/integration.test.ts`。`npm run typecheck` exit 0；`npm run check` 與 `node src/ops/content/check.ts content/base` 均 exit 0、0 errors／0 warnings。唯一已知 integration 失敗見第三段，領導 09:20 orders 指定合併時處理。
5. 本 REPORT 已寫入交接指定的主 repo 絕對路徑；含四段、戰果／hash／數值／SPEC-GAP 四表。

每項實作後都有跑 npm test 與 bench；bench 四階段均 outcome／第 5 輪，hash 依序 `f94acc34ac0ec9a1`、`5d763a1b2789c237`、`735b3c9848bbb523`、`735b3c9848bbb523`。中間測試錯誤已修，integration 禁區缺陷未改。

指定既有情境量測 `node src/sim/measure.ts scenario/rift-edge-nest 1`：exit 0，seed=1、pass=true、waitRatio=0、winner=null、reason=timeout、rounds=20；457 單位回合，975 次能力、497 Hit／478 Miss、16 死亡，hash=`18f7c93e6416bc42`。Hit 含 self 必中事件，非純敵我傷害命中率。

### 每場戰果表

敵方「蟲群」＝`mite-d` ×4＋`nestmother-landlord` ×1。潮月採人類顯示的第 N 月（state.clock.month 為 0 起算）；兩場分別 day31、day33，都在第 2 潮月。

| 策略／期間 | 潮月／日 | 敵方組成 | winner | reason | rounds | stopped | 玩家／敵方能力次數 |
|---|---|---|---|---|---|---|---|
| greedy 3 | 2／31 | 蟲群 | player | hold | 5 | outcome | 12／148 |
| greedy 3 | 2／33 | 蟲群 | enemy | eliminate | 8 | outcome | 0／259 |
| greedy 12 | 2／31 | 蟲群 | player | hold | 5 | outcome | 12／148 |
| greedy 12 | 2／33 | 蟲群 | enemy | eliminate | 8 | outcome | 0／259 |

逐場證據由 `/tmp/cx-ib-term/campaign-details.ts` 包 `runCampaign.battle`，呼叫正式 `runSortie` 並讀其 result；結果在 `greedy3-details.jsonl`／`greedy12-details.jsonl`。能力次數含 self 支援（不是命中數），因此不能把敵方 148／259 次全解讀成傷害攻擊。第二場玩家已無能力出手，仍被敵軍消滅；未補彈、未調強弱來硬湊輸贏。greedy 第 5 月歸零、idle 第 3 月歸零；12 月驗收只要求 exit 0。

### 黃金 hash 變動表

沒有需要重產的黃金 hash。已跑固定規則黃金（8 pass）及營運黃金（1 pass）；下表路徑前綴為 `test/golden/`。

| 檔 | 舊 → 新 | 原因 |
|---|---|---|
| `combat-conduct.hash` | `02429ecee80e088a` → `02429ecee80e088a` | 未變；固定指令未觸及本次改動。 |
| `combat-layers.hash` | `ff765945dad0d274` → `ff765945dad0d274` | 未變；固定指令未觸及本次改動。 |
| `combat-tenth.hash` | `969fa5e9e4e214fa` → `969fa5e9e4e214fa` | 未變；固定指令未觸及本次改動。 |
| `people-berserk.hash` | `f7f2de6106b4efd1` → `f7f2de6106b4efd1` | 未變；固定指令未觸及本次改動。 |
| `people-capture.hash` | `f7a55f7012a0b0a0` → `f7a55f7012a0b0a0` | 未變；固定指令未觸及本次改動。 |
| `people-eject.hash` | `c86ec6aa436d1dfa` → `c86ec6aa436d1dfa` | 未變；固定指令未觸及本次改動。 |
| `src/ops/sim/fixtures/campaign-hash.json` | `545be0239746ade5` → `545be0239746ade5` | 未變；固定指令戰役無受影響的真實戰鬥，282 events／day31。 |

`test/ai/balance.test.ts` 與 `test/sim/*` 由 npm test 驗證，沒有 hash 斷言要更新。bench hash 改變是命中 RNG、怪獸屬性及部署改動的預期結果；bench 不是黃金 fixture。

### 新增內容數值與 aiprofile 參數表

| 來源／鍵 | 數值 | 選擇依據 |
|---|---|---|
| species mite／tidewolf D | accuracy 50、evasion 5 | 人類 accuracy 50–55 作起點 |
| species reaper／tidewolf C | accuracy 55、evasion 8 | 較 D 級小幅提升 |
| species tidewolf B | accuracy 60、evasion 10 | 依級遞增 |
| species nestmother A | accuracy 65、evasion 12 | 依級遞增，未硬調驗收 |
| rules.constants.opsBattleMaxRounds | 20 | 模板無 rounds；有限輪兜底 |
| score.DEFAULTS.retreatForceRatio | 0.5 | 保留原門檻 |
| score.DEFAULTS.retreatMinRound | 3 | 先讓雙方有交戰機會 |
| score.DEFAULTS.retreatDamage | 0.35 | 己方總層 HP 損失門檻 |
| start/default 三台 hound | right-weapon＝autocannon-30 | 沿用既有武器：hp 20、ammo-30 12 |

三個 retreat 參數可由 aiprofile.params 覆寫；沒有改既有 aiprofiles JSON。breaking／fleeing 不受交戰和輪數門檻限制。

### SPEC-GAP 清單

| 缺口 | 最小實作 |
|---|---|
| hold 區域／進度未定 | zone 為 Cell[]；區內有 for 方 active 且無敵對 active，連續輪末滿 rounds；同輪只累計一次，序列化進可選 holdProgress |
| 無 zone／role:anchor 語意未定 | 無 zone 視為全圖存活計時，不要求清空敵軍；anchor role 當無 zone |
| escort 完成未定 | unit／units 指定者全部 active 站出口或已 retreated；空名單／缺單位／死亡皆不完成 |
| self 命中未明文例外 | chance=100、roll=null，不擲命中骰；無單位目標原本即不擲骰，保留並測試 |
| ops 模板無輪數欄 | 使用正整數內容常數 opsBattleMaxRounds；到限沿用既有 timeout（winner=null） |
| 起始機甲裝備格式 | 接受字串或 {frame, components?}；裝槽驗 type／size，建立附加層與部件池；舊字串仍合法 |
| 已交戰、總受損定義 | 己方曾受傷或雙向 Hit／Miss；總層 HP 對內容上限，死亡單位剩餘 HP 算 0，友軍包含盟友 |
| 部署分離 | 玩家 x=1..2、出口 x=0、敵方最右；生成圖最小寬 4，固定圖不足寬時拒絕 |

## 產出（檔清單）

程式只在指定 worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/e2644cc1-6954-4d88-a70e-dde3806fa378/scratchpad/wt/term`。共 **20 個程式／內容／測試檔**，未 commit。另有本主 repo REPORT。既有未追蹤 `node_modules` symlink 與 `wf/.../lead-integ-battle/` 是派工環境，不列入本線修改。

| 目錄 | 修改／新增檔名 |
|---|---|
| content/base/rules | constants.json |
| content/base/species | mite.json、nestmother.json、reaper.json、tidewolf.json |
| content/base/world/campaign-start | default.json |
| src/ai | score.ts、retreat.ts（新） |
| src/core | types-state.ts（僅新增可選欄） |
| src/ops/content | check.ts、instantiate.ts、start.ts、start.test.ts |
| src/ops/sortie | scenario.ts |
| src/ops/state | types.ts（StartDef.mechs 支援舊／新格式） |
| src/rules | attack.ts、attack.test.ts、objectives.ts、objectives.test.ts |
| test/ai | score.test.ts |

`src/ops/content/load.ts` 既有 normalize 已會遞迴正規化 frame／components 引用，不需改碼；測試透過 loadWorldPacks 證明新格式可用。score.ts 除必要的 helper import 外，只新增 DEFAULTS 鍵與替換 want().retreat 一行。diff 加新 retreat.ts 約 34,650 bytes，小於 80 KB，檔數未超過 25。

原始執行證據均在 `/tmp/cx-ib-term/`：`step1..4-test.log`、`step1..4-bench.log`、`final-test.log`、`typecheck.log`、`check.log`、`world-check.log`、三份 `*-cli.log`、兩份戰果 jsonl、`measure.log`、`golden.log`、`ops-golden.log`、`integration-debug.log`。

## 沒做到或證據不足的

`npm test` 的 `test/ai/integration.test.ts` seed5 仍失敗：`2 !== 0`（rejected 應為 0）。重現：`node test/ai/integration.test.ts`。命中提升後 wolf2 於第 4 輪殺死最後敵軍，outcome 已是 `{winner:"enemy",reason:"eliminate"}`、active=null，AI 仍送兩次 `{kind:"end",actor:"wolf2"}`，均被拒 `battle-over`。診斷腳本僅在 /tmp，沒有修改測試斷言；缺陷在本線禁區 `src/ai/agent.ts`。

領導於 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/inbox/orders/cx-ib-term.md` 的 **2026-10-24 09:20 orders** 明示：此缺口由領導合併時修，本線只記錄，其他驗收照舊。因此此項是已轉交的整合缺口，不宣稱 worktree 全測綠燈。

bench 直接 scenarioToSetup，未經 runSortie.prepareSetup，不能單獨證明武器已注入；武器以起始資料測試與正式戰役第一場 12 次玩家能力為證。第二場玩家能力 0，交戰證據不等於「每場雙方都有開火」；報告保留實測結果，沒有把補彈或營運戰損重設擴入本次範圍。

## 需要決定的事

領導已承接 agent.ts 終局後多送 End 的修復；合併後需使既有 integration 測試恢復。其餘 SPEC-GAP 使用交接書授權的最小解法，未等待使用者決策。若後續要求第二場也必須由玩家開火，需另處理營運補彈；本次不改。

### 以後交接書該點名的工具

`node <test-file>.test.ts` 能在沙箱顯示實際 assertion（npm test 有時只顯示檔案失敗）；`/tmp` 包 runCampaign.battle＋正式 runSortie 可列逐場戰果與能力次數。既有 bench 未走裝備注入，應明示此限制；大型 rift-edge-nest 的 measure 應附預期耗時／逾時處置。保留 `inbox_poll --once` 與 `inbox_mail --up` 的 orders／終局回報。
