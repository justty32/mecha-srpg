# cx-ops-crew 船務與人員交付

## 做了什麼

依交接書實作名冊、等比例欠薪、利息與付款、招募、醫務、共用工時佇列、科研、機庫指派、機魂開節點與陪伴、古代認主及命名。錢與材料皆經 post，指令拒絕前不改 state，亂數只使用 campaign.rng；新增內容未修改既有 JSON。

已套用 orders 的 2026-10-24 活捕裁示：stable 舊碼保留並標 TODO，但不由 shipDaily5 呼叫、不由 index 匯出；ledgerDaily6 不再執行飼料支出。測試保留 **14 個 test()**，其中 3 個 stable 測試依 orders 標 TODO 註解，僅直測舊模組，不代表目前玩法。

指定驗證：`node --test --test-isolation=none --test-reporter=tap 'src/ops/**/*.test.ts'` 最後一次 56 pass／0 fail，crew 14 pass；`npm run check` 及 `node src/ops/content/check.ts content/base` 均 exit 0、0 errors、0 warnings。禁依賴搜尋 0 命中，state/content 沒有本線改動。`npm run typecheck` 曾通過，但最後一次因其他線進行中的修改 exit 1，詳細證據見下段，不能宣稱全專案已綠。

本線 20 個新增程式／內容檔共 59,254 bytes，加 REPORT 仍低於 45 檔／200 KB。未 commit；沙箱外 npm test、最終 typecheck 與計數仍由領導依交接書重跑。

## 產出（檔清單）

以下均相對專案根 `/home/lorkhan/repo/game_dev/mecha-srpg`。

`src/ops/crew/`：

```text
shared.ts
roster.ts
wages.ts
recruit.ts
medbay.ts
workqueue.ts
research.ts
hangar.ts
stable.ts
soul.ts
names.ts
index.ts
crew.test.ts
```

`content/base/world/`（全部新增）：

```text
services/crew.json
jobs/repair-cockpit.json
jobs/repair-shell.json
jobs/install.json
jobs/graft.json
jobs/incubate.json
research/soul-heart.json
```

交付文件：`wf/workflows/dispatch/handoffs/lead-impl-ops/cx-ops-crew/REPORT.md`。

## 沒做到或證據不足的

最後一次 typecheck 的紅燈均在本線領地外，未擅改：

```text
src/ops/world/actions.ts(11,9): TS2322 kind: string 不能指派 faction | rift | world
test/ai/stub-rules.ts(37,19): TS2353 RulesRuntime 尚無 globals
test/sim/seams.test.ts(112,30),(123,13): TS2339 map 型別尚無 globals
test/sim/seams.test.ts(130,13),(132,13): TS2339 RulesRuntime 尚無 globals
```

前一輪曾是 test/ai/stub-rules.ts 缺 allies，已上報領導；其他線修改後錯誤形狀如上。crew 沒有型別錯誤。未額外擴大測試或驗收條數。

core 沒有 withering／grudge Effect，因此先寫旗標；service/crew 可配置實際效果 id 後掛載。現有 base 無可供 mutate 的異形變體、沒有 molt 宣告，保留的舊 stable 支援配置但已停接。新活捕流程待 spec 改寫，不在本次自行補規則。

一般佇列的 install／graft 以既有 ComponentInstance 與 slot 為最小接點；core／Job 尚無完整屍體部位移植及改裝配方資料，mod 需提供 CrewJobDef.result 才能排入。育魂內容暫以 stock:core-C 代替尚無模板的空魂核，借用現有 glove 人物樹；未虛構 core id。現有 base 人物的 levelDice 為空，預骰與升級流程已具備，但固定 14 測試沒有額外覆蓋此路徑。

## 需要決定的事

本線沒有需要使用者追加決策的事。領導依固定驗收處理全專案 typecheck 與整合；新活捕規則按 orders 等 spec，不沿用舊 stable。

tick 第 5 段只呼叫 shipDaily5；它已包含工時、陪伴、醫務與機庫，請勿再逐一重複呼叫。第 6 段呼叫 ledgerDaily6，第 7 段分別呼叫 recruitsDaily7／rosterDaily7。回船當天呼叫 rosterReturn；開局人物若要生成時預骰，可先呼叫 prepareGrowth，招募者已自動呼叫。職員薪水依 calendar.daysPerMonth 攤提；priority 數值越小越先，工時不跨日累存。

cmdAccompany 排一個時段，由下一次 soulDaily5 結算；同日每個參與者只能用一次。openSoulNode 需研究完成且前置已開；節點效果實例保留，但不預掛滿額 contribution，出戰層須按 mastery 注入。租賃整合可寫 crew.rentals[person] 為每月租金，ledgerDaily6 在 dom=1 扣款。

命名 Prompt 有 naming metadata；前三個選項帶 nameMech OpsEffect。自填選項索引為 3（零起算），編排層收文字後呼叫 applyName；它會移除相符命名 Prompt。若前三項也走 applyName，編排層不可再次 shift。culture 優先取招募背景，其次人物 culture:* tag，缺省讀 service/crew.defaultCulture。

## 給 tick 編排的段函式與指令處理清單

下列縮寫：S=CampaignState、C=OpsCtx、R=CmdResult，Cmd<V>=Extract<OpsCommand,{v:V}>。均由 `src/ops/crew/index.ts` 匯出。

### 每日段

```ts
shipDaily5(s: S, ctx: C): void
ledgerDaily6(s: S, ctx: C): void
recruitsDaily7(s: S, ctx: C): void
rosterDaily7(s: S, ctx: C): void
workqueueDaily5(s: S, ctx: C): void
soulDaily5(s: S, ctx: C): void
medbayDaily5(s: S, ctx: C): void
hangarDaily5(s: S, ctx: C): void
```

### 指令

```ts
cmdAssign(s: S, ctx: C, cmd: Cmd<"assign">): R
cmdQueue(s: S, ctx: C, cmd: Cmd<"queue">): R
cmdReorder(s: S, ctx: C, cmd: Cmd<"reorder">): R
cmdAccompany(s: S, ctx: C, cmd: Cmd<"accompany">): R
cmdHire(s: S, ctx: C, cmd: Cmd<"hire">): R
cmdFire(s: S, ctx: C, cmd: Cmd<"fire">): R
cmdWake(s: S, ctx: C, cmd: Cmd<"wake">): R
cmdPay(s: S, ctx: C, cmd: Cmd<"pay">): R
```

### 回船與資料接點

```ts
rosterReturn(s: S, ctx: C): void
registerDeath(s: S, ctx: C, id: string, cause: string): void
prepareGrowth(s: S, ctx: C, id: string): void
openSoulNode(s: S, ctx: C, soul: string, node: string): R
applyName(s: S, ctx: C, mech: string, by: string, name: string): R
```

stableDaily5／cmdFeed 依最新 orders 不列為可用公開接點。

## 想加進 types.ts 的欄位

| 型別 | 欄位與本線位置 |
|---|---|
| CampaignState | crew?: CrewRuntime，完整定義在 shared.ts |
| CrewRuntime | candidates/recruitDays/cultures、companions/accompanied、bonds、rentals、growth/perkPoints |
| 舊 CrewRuntime | fed/feedDue/molting 僅保留，不接現行玩法 |
| ServiceDef | crew?: CrewRules["crew"]，營運數值與可選效果 |
| Job／JobDef | slot/recipe/rejectChance/result；配方另含 materials |
| Prompt | naming?: {mech, by, customChoice} |

## SPEC-GAP 清單

| 缺口 | 最小解 |
|---|---|
| 日程、招募、成長存檔欄位未定 | crew 區域交集型別 |
| 工時 priority 與結餘未定 | 小值先做、當日剩餘歸零 |
| 材料開工與第 6 段帳本矛盾 | 開工立即 post；日常支出在第 6 段 |
| cockpit-shell 缺修理係數 | 新增 repair-cockpit，不改既有檔 |
| withering／grudge 無 core 效果 | 先旗標、效果 id 由內容選配 |
| 自填命名無指令 | NamingPrompt＋applyName |
| 移植、改裝、空魂核缺資料 | 既有部件／可選配方／核帳替代 |
| 開局缺生成預骰 | prepareGrowth；回船時懶初始化 |

## TODO（活捕裁示）位置清單

| 檔案 | 函式／位置 |
|---|---|
| stable.ts | 檔頭、cmdFeed、stableDaily5（含族行為）；全部停接 |
| wages.ts | retiredFeedExpense；不呼叫 |
| index.ts | shipDaily5 移除 stable；停止公開匯出 |
| hangar.ts | cmdAssign 不再檢查 tameDays／taming／molting |
| workqueue.ts | workqueueDaily5 不再套蛻皮鎖或預扣飼料 |
| crew.test.ts | 三個 stable test 及直接 import 均標 TODO |

services/crew.json 的舊 feed/stable 數值與 shared.ts 的舊狀態欄位隨舊碼保留，不從現行 shipDaily5 使用。

## 以後交接書該點名的工具

無。
