# cx-ops-foundation：營運地基完成，16 條測試通過

## 做了什麼

完成 contract 階段 1：全部營運型別、事件／帳本／曆／ID、唯讀 WorldDB、多 pack 載入與引用檢查、條件求值、OpsEffect、實體工廠與 newCampaign。起始 world 有 8 節點、12 路線、1 蟲族裂縫模板、2 遭遇、3 勢力、2 契約、2 行動牌、6 房間及其餘必要資料。全程在專案根跑 npm／node，未 commit。

固定五項驗收（不增項）：

1. 本機指定 runner：恰好 16 tests、16 pass、0 fail；靜態 test() 亦 16。npm run typecheck exit 0；npm run check exit 0、0 errors／0 warnings。沙箱外 npm test 由領導重跑。
2. node src/ops/content/check.ts content/base：exit 0，OK 0 errors, 0 warnings。
3. content-format-ops 的 19 個資料夾各有 JSON；calendar.json、ferry.json、ship.json 與 campaign-start/default.json 全有。
4. 指定 grep 的 src/rules／src/ai 搜尋 0 命中（grep exit 1）。
5. 本 REPORT 含四段、介面摘要、SPEC-GAP 與工具段。

測試分配：ledger 4、clock 2、ids 1、load/check 4、cond/opseffect 3、instantiate/start 2。壞路線、斷事件、非法帳目均用記憶體 pack 注入，未改 base。JSON 往返、來源帳事件與非負存量均已斷言。

## 產出（檔清單）

以下為供領導逐檔開啟的導航。程式／測試 18 檔、world 52 檔，加本 REPORT 共 71 檔，總量低於 100 KB（gate：90 檔／250 KB）。未修改範圍外檔案。

### src/ops/state

- [clock.test.ts](../../../../../../../../src/ops/state/clock.test.ts)
- [clock.ts](../../../../../../../../src/ops/state/clock.ts)
- [events.ts](../../../../../../../../src/ops/state/events.ts)
- [ids.test.ts](../../../../../../../../src/ops/state/ids.test.ts)
- [ids.ts](../../../../../../../../src/ops/state/ids.ts)
- [ledger.test.ts](../../../../../../../../src/ops/state/ledger.test.ts)
- [ledger.ts](../../../../../../../../src/ops/state/ledger.ts)
- [types.ts](../../../../../../../../src/ops/state/types.ts)

### src/ops/content

- [check.ts](../../../../../../../../src/ops/content/check.ts)
- [cond.test.ts](../../../../../../../../src/ops/content/cond.test.ts)
- [cond.ts](../../../../../../../../src/ops/content/cond.ts)
- [instantiate.ts](../../../../../../../../src/ops/content/instantiate.ts)
- [load.test.ts](../../../../../../../../src/ops/content/load.test.ts)
- [load.ts](../../../../../../../../src/ops/content/load.ts)
- [opseffect.ts](../../../../../../../../src/ops/content/opseffect.ts)
- [start.test.ts](../../../../../../../../src/ops/content/start.test.ts)
- [start.ts](../../../../../../../../src/ops/content/start.ts)
- [worlddb.ts](../../../../../../../../src/ops/content/worlddb.ts)

### content/base/world

- [actions/post-clear.json](../../../../../../../../content/base/world/actions/post-clear.json)
- [actions/post-seal.json](../../../../../../../../content/base/world/actions/post-seal.json)
- [backgrounds/refugee.json](../../../../../../../../content/base/world/backgrounds/refugee.json)
- [calendar.json](../../../../../../../../content/base/world/calendar.json)
- [campaign-start/default.json](../../../../../../../../content/base/world/campaign-start/default.json)
- [contracts/clear.json](../../../../../../../../content/base/world/contracts/clear.json)
- [contracts/seal.json](../../../../../../../../content/base/world/contracts/seal.json)
- [dialogues/ren-kasai.json](../../../../../../../../content/base/world/dialogues/ren-kasai.json)
- [encounters/insect-deep.json](../../../../../../../../content/base/world/encounters/insect-deep.json)
- [encounters/insect-shallow.json](../../../../../../../../content/base/world/encounters/insect-shallow.json)
- [events/ruin-entry.json](../../../../../../../../content/base/world/events/ruin-entry.json)
- [events/ruin-return.json](../../../../../../../../content/base/world/events/ruin-return.json)
- [factions-ops/migrant-crew.json](../../../../../../../../content/base/world/factions-ops/migrant-crew.json)
- [factions-ops/rift-insects.json](../../../../../../../../content/base/world/factions-ops/rift-insects.json)
- [factions-ops/selene-whitegloves.json](../../../../../../../../content/base/world/factions-ops/selene-whitegloves.json)
- [ferry.json](../../../../../../../../content/base/world/ferry.json)
- [jobs/repair.json](../../../../../../../../content/base/world/jobs/repair.json)
- [markets/dhaka.json](../../../../../../../../content/base/world/markets/dhaka.json)
- [names/mythic-bengal.json](../../../../../../../../content/base/world/names/mythic-bengal.json)
- [nodes/chittagong.json](../../../../../../../../content/base/world/nodes/chittagong.json)
- [nodes/delta.json](../../../../../../../../content/base/world/nodes/delta.json)
- [nodes/dhaka.json](../../../../../../../../content/base/world/nodes/dhaka.json)
- [nodes/old-array.json](../../../../../../../../content/base/world/nodes/old-array.json)
- [nodes/reed-marsh.json](../../../../../../../../content/base/world/nodes/reed-marsh.json)
- [nodes/ridge.json](../../../../../../../../content/base/world/nodes/ridge.json)
- [nodes/salt-flat.json](../../../../../../../../content/base/world/nodes/salt-flat.json)
- [nodes/singapore.json](../../../../../../../../content/base/world/nodes/singapore.json)
- [recruit-pools/dhaka.json](../../../../../../../../content/base/world/recruit-pools/dhaka.json)
- [research/restraint.json](../../../../../../../../content/base/world/research/restraint.json)
- [rifts/insect.json](../../../../../../../../content/base/world/rifts/insect.json)
- [rooms/bridge.json](../../../../../../../../content/base/world/rooms/bridge.json)
- [rooms/cargo.json](../../../../../../../../content/base/world/rooms/cargo.json)
- [rooms/galley.json](../../../../../../../../content/base/world/rooms/galley.json)
- [rooms/hangar.json](../../../../../../../../content/base/world/rooms/hangar.json)
- [rooms/medbay.json](../../../../../../../../content/base/world/rooms/medbay.json)
- [rooms/stable.json](../../../../../../content/base/world/rooms/stable.json)
- [routes/chittagong-delta.json](../../../../../../../../content/base/world/routes/chittagong-delta.json)
- [routes/chittagong-singapore.json](../../../../../../../../content/base/world/routes/chittagong-singapore.json)
- [routes/delta-old-array.json](../../../../../../../../content/base/world/routes/delta-old-array.json)
- [routes/delta-reed-marsh.json](../../../../../../../../content/base/world/routes/delta-reed-marsh.json)
- [routes/dhaka-chittagong.json](../../../../../../../../content/base/world/routes/dhaka-chittagong.json)
- [routes/dhaka-delta.json](../../../../../../../../content/base/world/routes/dhaka-delta.json)
- [routes/dhaka-ridge.json](../../../../../../../../content/base/world/routes/dhaka-ridge.json)
- [routes/old-array-ridge.json](../../../../../../../../content/base/world/routes/old-array-ridge.json)
- [routes/reed-marsh-old-array.json](../../../../../../../../content/base/world/routes/reed-marsh-old-array.json)
- [routes/reed-marsh-salt-flat.json](../../../../../../../../content/base/world/routes/reed-marsh-salt-flat.json)
- [routes/ridge-salt-flat.json](../../../../../../../../content/base/world/routes/ridge-salt-flat.json)
- [routes/singapore-salt-flat.json](../../../../../../../../content/base/world/routes/singapore-salt-flat.json)
- [services/market.json](../../../../../../../../content/base/world/services/market.json)
- [services/medbay.json](../../../../../../../../content/base/world/services/medbay.json)
- [ship.json](../../../../../../../../content/base/world/ship.json)
- [templates/default.json](../../../../../../../../content/base/world/templates/default.json)

REPORT 自身：[REPORT.md](REPORT.md)。

## 沒做到或證據不足的

沙箱外 npm test 與 commit／最終計數依交接書留給領導。早期曾見其他線新增 ui-adapter 導致全域 typecheck 失敗，未改該線；最後原指令已通過（包含新增的 UI tsconfig）。

核心效果只預掛實例及 contribution，不在營運執行戰鬥 hooks；spawnContract／spawnEvent 只排佇列，後續工人需消化。交叉檢查涵蓋交接書指定項目及表達式形狀，並非所有 Def 的完整 JSON Schema。

起始內容以既有 core 為準：三台 C 級獵犬 Mk2；五駕駛、一技師、一機魂由現有模板建立獨立實例，人物模板有重複。無 D 級摹機、專屬技師、密封艙或月面地形可引用，未虛構 core ID；渡輪先只有一個地球港、requires 空陣列。

## 需要決定的事

本線無需使用者決定即可交付。後續內容擴充時再補 D 級摹機、獨立人物與渡輪密封艙；本次不改 core 或擴大驗收。領導負責後續 code map 與沙箱外驗收。

## 對後續工人的介面摘要

以下每個匯出函式一行；可省略的 scope 預設 {}。所有步驟就地改 s；createOpsCtx 綁定同一個 s，換 state 後必須重建 ctx。

```ts
nextId(s: Pick<CampaignState, "idCounter">, prefix: string): string
clock(day: number, cal: CalendarDef): Clock
eventRef(event: CampaignEvent): string
emit(s: Pick<CampaignState, "clock" | "log">, type: string, payload?: Record<string, unknown>): CampaignEvent
isAccount(value: unknown): value is Account
foldBalances(entries: readonly LedgerEntry[]): Record<Account, number>
post(s: Pick<CampaignState, "ledger" | "clock" | "log">, ctx: Pick<OpsCtx, "emit">, entry: PostEntry): boolean
checkLedger(s: Pick<CampaignState, "ledger" | "log">): string[]
createWorldDB(packs: readonly PackDef[], tables: WorldTables): WorldDB
loadWorldPacks(packs: PackFiles[]): WorldLoadResult
loadWorldDirs(dirs: string[]): WorldLoadResult
checkWorld(db: ContentDB, world: WorldDB): WorldCheckResult
opsEvalCtx(s: CampaignState, ctx: Pick<OpsCtx, "db" | "world">, scope?: OpsScope): EvalCtx
evalOpsNum(s: CampaignState, ctx: Pick<OpsCtx, "db" | "world">, expr: NumExpr, scope?: OpsScope): number
evalOpsCond(s: CampaignState, ctx: Pick<OpsCtx, "db" | "world">, cond: Cond, scope?: OpsScope): boolean
instantiatePools(declarations: readonly PoolDecl[], attrs: Record<string, number>, tags?: readonly string[]): Record<string, PoolState>
instantiatePerson(db: ContentDB, id: string, def: string): PersonState
instantiateMech(db: ContentDB, id: string, frameId: string): MechState
applyOpsEffect(s: CampaignState, ctx: OpsCtx, effect: OpsEffect, scope?: OpsScope): boolean
applyOpsEffects(s: CampaignState, ctx: OpsCtx, effects: readonly OpsEffect[], scope?: OpsScope): boolean
createOpsCtx(s: CampaignState, db: ContentDB, world: WorldDB): OpsCtx
newCampaign(db: ContentDB, world: WorldDB, startId: string, seed: number): CampaignState
```

WorldDB.get(kind,id) 回 Def 或 undefined、require(kind,id) 缺值拋錯、all(kind) 按完整 id 排序；資料深凍結，all 回新的陣列。省 pack 的查詢由後載 pack 優先；覆寫另一 pack 的同 id 要在 JSON 明填完整 id。load 回 {db,world,errors,warnings}；另呼叫 checkWorld 取得交叉檢查 {errors,warnings}。

帳本 post 的 seq/day 自填；外源 ref 必須取 eventRef(ctx.emit(...))，counter 帳由呼叫方配對。餘額只能透過 post；stock 不足回 false 且不留帳／事件，無效帳目拋錯。applyOpsEffects 按陣列順序執行，遇 false 停止，不自動回滾前面效果，需原子交易的呼叫端先檢查全部材料。

內容 kind 固定由 WORLD_FOLDERS 映射；勢力用 faction-ops、招募用 recruit、開局用 start。factions 的 state key 是 FactionOpsDef.id（非 core faction id）。scope 支援 rift/faction/person/mech/node/contract 的實體 id 與 tags；rep 的 issuer 取 scope.faction 或 scope.contract.issuer。

OPS_REF_ROOTS 為 campaign/rift/faction/person/mech/node/calendar/debt/ledger/inventory/ship/stable/contract/flags。特殊值含 rift.widthIndex（D=1）、calendar.daysToNextSpring、debt.ratio、stable.penCount、person.attrs／mood；數值路徑不明就拋錯，flags 缺值視為 0。Cond 沿用 core cmp/tag/all/any/not，未採 spec 範例中未在 core 定義的糖語法。

pendingContracts 是 {template,near?}[]；pendingEvents 是完整 EventDef id[]。techHours 是工時池；idCounter 供所有實體共用；effectCounter 供效果 uid。emit payload 僅接受 id 字串與有限數字，名稱本文存在 roster.names；Named 只記 mech/by/index。

## SPEC-GAP 清單

- 工廠在允許依賴之外：本線建立最小空裝備／空座位實體。
- 無上限池以 Number.MAX_SAFE_INTEGER 保存，避免 Infinity。
- 事件無 id：來源採 event-<seq>；新增開局／效果來源事件。
- 未展開的 Prompt、Row、Stage、Loot、Room 等採最小純資料。
- OpsEffect 無登記檔：採 inline 聯集；原範例糖語法轉 core Cond。
- 勢力／對白／模板補 id；裸模板包 entries；kind 依 contract 單數。
- 開局人物增 role/wage 與可選 soulNodes；借用既有 C 級機體、人模。
- 船池補預設；ratio 取開局本金，下一大潮嚴格晚於今日。
- 效果預掛不執行戰場 hooks；實體序號、待辦與工時加簿記欄。

## 以後交接書該點名的工具

無。
