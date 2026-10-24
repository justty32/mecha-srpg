# cx-gb-ai 完成回報

STATUS：DONE（本線固定五條驗收完成；anchored 的 ≤40 內容門檻未達，依約留決策、不改怪獸）。

## 做了什麼

依交接書只處理 tether、三項 AI 缺口、unbound 站位與固定量測。親讀指定 AGENTS、wf 規矩、資料表及前輪報告；未開子代理、未 commit。

spawn 以可選 `RulesRuntime.spawnParents` 記母體；母體物種為 dieWithParent 時，子單位共用既有死亡流程發 UnitDied／unitDied／unitRemoved，母體先、子單位依 id 深度優先；freeOnParentDeath 保留子單位。swarm 的距離限制移到 tactical 所有移動候選截斷前。候選與評分共用可見敵人→lastSeen→中央的追蹤資料；只讀公開陣營與記憶座標，不讀隱藏位置。補射擊格涵蓋 ball／line／cone，經移動預覽及能力合法性檢查保留 AP。

unbound 只改 enemy 三台與 third 三隻的 at。third=(19,8)/(18,7)/(20,7)，enemy=(26,12)/(25,11)/(25,12)；第三方距最近 ally／enemy 分別約 7/6、6/7、8/5 格，雙方都可接觸。保留其他線的 mech／name／brief。

新增 tether 2 條、AI 3 條全綠。反證：Node registerHooks 載開工碼時 4 fail；反轉 tether 條件時 2 fail（包含 free 不死），聯集涵蓋全部 5 條；兩次程序均 exit 1。隱藏位置測試把真實敵方 pos 改成會 throw 的 getter，候選與評分仍成功。範圍能力單條測試逐一走 ball／line／cone。

固定五條驗收：第 1 條新增測試合格、合跑複驗155過0失敗；第 2–4 條證據如下；第 5 條本報告已寫檔。沒有增加驗收條目。

| 量測 | 開工 | 完成 |
|---|---:|---:|
| convoy seed1 enemy-2／4 移動格數 | 7／4 | 7／8 |
| convoy 指定舊座標 enemy-2／4 | 8／0 | 20／15 |
| tidal seed1 攻擊嘗試／命中 | 3／0 | 5／0 |
| quarry seed1 攻擊嘗試／命中 | 281／61 | 281／61 |
| anchored 凍結15場：勝場／巢母命中 | 0／50 | 0／51 |
| bench ms／步 | 32.69 | 41.74 |

移動格數＝成功 move 指令 path.length 加總；攻擊嘗試＝Hit＋Miss，tidal 有交戰但 seed1 仍全部未命中。開工時內容線已變更 convoy 全體站位；另以當前情境在記憶體只把 enemy-2、enemy-4 放回交接點名 (62,8)、(70,7)，舊碼與新碼對照如表，未修改該情境內容。這不是原始整份舊內容的重建。

skirmish seed1–5 Wait 比例均 0 <0.5。效能 41.74 ≤32.69×1.5=49.035 ms／步，同為60指令、hash 7dcff3308145c454；共享工作樹及主機負載可能影響絕對耗時。

第三方攻擊表（Hit＋Miss，按出手者與目標 owner 統計）：

| seed | 打 ally 前→後 | 打 enemy 前→後 |
|---|---:|---:|
| 1 | 0→35 | 0→30 |
| 2 | 23→6 | 0→29 |
| 3 | 26→16 | 0→23 |
| 4 | 69→11 | 0→26 |
| 5 | 25→6 | 0→26 |

指定 scenario-measure 原輪數、seed1–5 四情境均有開工／完成輸出；詳細值與 hash 在 `/tmp/cx-gb-ai/{convoy-run,tidal-flat-evac,quarry-duel,unbound-raid}-{before,after}.log`。細分移動與第三方計數在 `trace-*-{before,after}.log`。同時刻重放舊 AI 的 tidal／quarry 輸出與開工 scenario-measure hash 相符。anchored 用指定 `/tmp/cx-aio-core/frozen.json`，未重新捕獲，原始證據 `anchored-before.log`／`anchored-after.log`。

期望命中算法（按交接書指定 HP／單發傷害口徑）：以開局原兩台 moji-tern-guard，各取對 kaiju 的最強單發 arc-pulse=21，平均=(21+21)/2=21。唯一必毀核心 core-belly 的總層 HP=100+120+150=370；8 部位 exposure 全1。固定初始等機率 p=1/8，估算 N=370÷(21×1/8)=140.95 次成功命中（先把核心所需發數取整則18×8=144）。兩台每輪各一次有效命中的20輪預算為40，140.95>40，未達標。這是固定部位機率、忽略其他部位先破後重新分配機率及實戰 AP／熱／命中率的估算，不宣稱是真規則精確隨機期望。輸入與算法程式在 `/tmp/cx-gb-ai/expectation.ts`／`expectation.log`。同時工作樹的 default 開局已增為3台；依本交接書只算原前兩台，不把第三台混入分母。

## 產出（改動檔清單）

共11檔（含本報告），本線 patch 加新增檔約25 KB，低於12檔／100 KB gate；共用檔以開工快照比對本線局部差異。

- src/core/types-state.ts
- src/rules/attack.ts
- src/rules/flow.ts
- src/ai/knowledge.ts
- src/ai/score.ts
- src/ai/policies/tactical.ts
- src/ai/policies/swarm.ts
- test/rules/tether.test.ts
- test/ai/gaps-fixes.test.ts
- content/base/scenarios/unbound-raid.json
- wf/workflows/dispatch/handoffs/lead-gaps-battle/cx-gb-ai/REPORT.md

## 沒做到或證據不足的

AI／sim／rules 固定合跑最終155 tests、155 pass、0 fail（`node --test --test-isolation=none 'test/ai/*.test.ts' 'test/sim/*.test.ts' 'test/rules/*.test.ts'`，exit0，`/tmp/cx-gb-ai/suites-recheck.log`）。首次154過1失敗源於別線 attack-cost 檢查與 pp-break-limb fixture 衝突；領導 orders 通知 cx-gb-check 已解除，依指令重跑轉綠。本線沒有改 loader／fixture；保留首次輸出 `/tmp/cx-gb-ai/suites-final.log`。沙箱外複驗由領導負責。

各工作步驟的 check／typecheck 與指定新測試已跑；最後 `npm run check`、`npm run typecheck` 均 exit0，check 有既有／別線內容 warning。證據 `/tmp/cx-gb-ai/check-{tether,ai,final}.log`、`typecheck-{tether,ai,final}.log`、`tether.log`、`gaps.log`、`red-before.log`、`red-tether-mutation.log`。`wf-lint --strict .` exit1：ROSTER.md 26612 bytes 超8KB、CLAIMS.md 表1940 bytes 超1KB；broken=0，本線 REPORT 沒有違規。未修改這兩份別線共用文件；證據 `/tmp/cx-gb-ai/wf-lint.log`。

## 需要決定的事

anchored 的 ≤40 門檻未達；依約只回報，不改怪獸內容。若保留平均單發21與固定8部位模型，核心總層 HP 要 ≤105 才能到40；可由領導決定是否用 MonsterDef.partsOverride 降核心 HP，或另定兼顧破部位重分配的精確判準。

領導負責 commit 與 code map 的測試導航同步，以及共用 ROSTER／CLAIMS 的文件 lint 違規。本線不擴張到 src/content／fixture／怪獸內容。

以後交接書該點名的工具：Node registerHooks（舊碼對照與 mutation 反證）；`/tmp/cx-gb-ai/trace.ts`（成功移動格數與第三方 Hit＋Miss）；`/tmp/cx-gb-ai/expectation.ts`（兩台開局機與核心期望命中估算）。
