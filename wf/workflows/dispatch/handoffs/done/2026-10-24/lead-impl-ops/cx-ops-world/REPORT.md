# cx-ops-world：世界、航行、市場與契約已交付，固定 14 tests 全通過

## 做了什麼

完成裂縫七態、每日潮壓與大潮泊松生成、蝕域深度與城邦失守、行動抽牌及冷卻、最短天數航行與改道、淺蝕遭遇、市場刷新與交易、探勘 Prompt 入口，以及契約 offered 快照、並行接受、談判、取消追款、到期、分段／部分成功結算和頭數去重。所有金錢與存量變化經 post；指令拒絕先驗後改。

固定五條驗收結果：

1. 指定 ops runner：56 tests／56 pass／0 fail，其中本線恰好 14 個 test()（rifts 4、pressure 2、nodes 1、travel 2、market 2、contracts 3）；npm run typecheck exit 0；npm run check exit 0、0 errors／0 warnings。沙箱外 npm test 仍由領導重跑。
2. node src/ops/content/check.ts content/base：exit 0、0 errors／0 warnings。
3. 指定禁止依賴 grep 無命中；src/ops/state 與 src/ops/content 無本線修改。
4. 各段及 cmd 均從 world/index.ts 或 contracts/index.ts 匯出，名稱與交接契約一致。
5. 本 REPORT 含四段及三個介面／欄位／SPEC-GAP 附表，另附活捕裁示 TODO。

中途曾遇 UI 及 test/ai 的共享型別紅燈，未改別線；最後原指令已通過。只執行交接書固定驗收，未加碼整場模擬或其他檢查。

## 產出（檔清單）

全部新增：程式／測試 19 檔、內容 2 檔、本 REPORT 1 檔，合計 22 檔，容量低於 200 KB。未修改既有內容檔；未 commit。以下連結供領導逐檔檢視。

<!-- wf-nav -->
- [world/nodes.ts](../../../../../../../../src/ops/world/nodes.ts)
- [world/nodes.test.ts](../../../../../../../../src/ops/world/nodes.test.ts)
- [world/rifts.ts](../../../../../../../../src/ops/world/rifts.ts)
- [world/rifts.test.ts](../../../../../../../../src/ops/world/rifts.test.ts)
- [world/pressure.ts](../../../../../../../../src/ops/world/pressure.ts)
- [world/pressure.test.ts](../../../../../../../../src/ops/world/pressure.test.ts)
- [world/actions.ts](../../../../../../../../src/ops/world/actions.ts)
- [world/travel.ts](../../../../../../../../src/ops/world/travel.ts)
- [world/travel.test.ts](../../../../../../../../src/ops/world/travel.test.ts)
- [world/market.ts](../../../../../../../../src/ops/world/market.ts)
- [world/market.test.ts](../../../../../../../../src/ops/world/market.test.ts)
- [world/explore.ts](../../../../../../../../src/ops/world/explore.ts)
- [world/index.ts](../../../../../../../../src/ops/world/index.ts)
- [world/test-support.ts](../../../../../../../../src/ops/world/test-support.ts)
- [contracts/lifecycle.ts](../../../../../../../../src/ops/contracts/lifecycle.ts)
- [contracts/negotiate.ts](../../../../../../../../src/ops/contracts/negotiate.ts)
- [contracts/tally.ts](../../../../../../../../src/ops/contracts/tally.ts)
- [contracts/contracts.test.ts](../../../../../../../../src/ops/contracts/contracts.test.ts)
- [contracts/index.ts](../../../../../../../../src/ops/contracts/index.ts)
- [actions/ops-world.json](../../../../../../../../content/base/world/actions/ops-world.json)
- [markets/chittagong.json](../../../../../../../../content/base/world/markets/chittagong.json)
- [REPORT.md](REPORT.md)

## 沒做到或證據不足的

沙箱外 npm test、commit、最終 diff 計數由領導接手。尚未接階段 3 的 tick／sortie／choose；本線交付段函式與入口，不自行編排全戰役。未新增異形／菌絲裂縫內容，因 core 沒有可引用的對應族。selfClose 以記憶體模板測試，不造假 core id。

市場目前支援實物 component／frame 與 stock 帳項。尚無合法 ticket／soul-rental 商品實例化契約，這兩種非 stock 商品回 unsupported-item，交後續內容與招募介面整合。實物買賣寫 cash 與零數量 stock:inventory 對帳列，身分只在 Inventory；沒有把獨立實物轉成可數存量。component 依 hp／layersAdd 折價，frame 依全身層 HP 與內容整備係數折價。

新事件 CityLost、FuelUsed、Sailed、TravelBlocked、WorldAction、ContractNegotiated、ContractStage 需由後續文字整合補模板；本線不改 text 領地。所有 payload 只有 id／有限數字。

## 需要決定的事

無需使用者再決定。本線採交接書允許的最小 SPEC-GAP 解法；領導整合 types、code map 與階段 3 呼叫順序即可。探勘入口保留隊伍及層數，後續 choose 按既有事件 next 續鏈、處理每層時間與效果。

## 給 tick 編排的段函式與指令處理清單

段 2 依序呼叫 worldDaily2、contractsDaily2。前者已包含 riftsDaily2、pressureDaily2、nodesDaily2、actionsDaily2，**不要再重複呼叫其子段**。為遵守 architecture 的 world／contracts 互不相依，actions 保留生成請求的 actor 脈絡，contractsDaily2 消化 pendingContracts 並建立 offered 快照；pendingEvents 留給段 4。段 3 呼叫 travelDaily3；段 7 呼叫 contractsDaily7 與 marketsDaily7。

以下 C<V> 表示 Extract<OpsCommand, { v: V }>；所有段及指令就地修改 s。

```ts
worldDaily2(s: CampaignState, ctx: OpsCtx): void
riftsDaily2(s: CampaignState, ctx: OpsCtx): void
pressureDaily2(s: CampaignState, ctx: OpsCtx): void
nodesDaily2(s: CampaignState, ctx: OpsCtx): void
actionsDaily2(s: CampaignState, ctx: OpsCtx): void
contractsDaily2(s: CampaignState, ctx: OpsCtx): void
travelDaily3(s: CampaignState, ctx: OpsCtx): void
contractsDaily7(s: CampaignState, ctx: OpsCtx): void
marketsDaily7(s: CampaignState, ctx: OpsCtx): void
cmdMap(s: CampaignState, ctx: OpsCtx, cmd: C<"map">): CmdResult
cmdSail(s: CampaignState, ctx: OpsCtx, cmd: C<"sail">): CmdResult
cmdDock(s: CampaignState, ctx: OpsCtx, cmd: C<"dock">): CmdResult
cmdDrift(s: CampaignState, ctx: OpsCtx, cmd: C<"drift">): CmdResult
cmdTrade(s: CampaignState, ctx: OpsCtx, cmd: C<"trade">): CmdResult
cmdExplore(s: CampaignState, ctx: OpsCtx, cmd: C<"explore">): CmdResult
cmdBoard(s: CampaignState, ctx: OpsCtx, cmd: C<"board">): CmdResult
cmdAccept(s: CampaignState, ctx: OpsCtx, cmd: C<"accept">): CmdResult
cmdDrop(s: CampaignState, ctx: OpsCtx, cmd: C<"drop">): CmdResult
```

戰果與查詢介面：

```ts
onBattleRift(s: CampaignState, ctx: OpsCtx, riftId: string, outcome: RiftBattleOutcome): void
offerContract(s: CampaignState, ctx: OpsCtx, templateId: string, issuerId: string, target: {node: string; rift?: string}): ContractState | undefined
negotiate(state: NegotiationState, ask: Ask, rng: RngState): NegotiationResult
tallyHeads(contract: ContractState, unitDiedEvents: readonly UnitDiedEvent[]): number
settleContract(s: CampaignState, ctx: OpsCtx, id: string, outcome: "done" | "failed" | "partial"): void
shortestPath(s: CampaignState, ctx: OpsCtx, from: string, to: string): TravelPath | undefined
marketPrice(s: CampaignState, ctx: OpsCtx, market: MarketDef, item: MarketDef["lists"][number]["items"][number], condition?: number): number
```

RiftBattleOutcome 為 anchor-killed／anchor-captured／defended／lost／vanguard-killed。onBattleRift 不清 pendingBattle，由出戰編排負責。大潮有 active seal／defend 且浮船在核區或相鄰節點時建立空 units 的防守 pendingBattle，交出戰層配兵；同日重複 defended 不會跳過第二次防守。sealed 降潮壓一次，此後每潮月退一區。

cmdAccept 帶 ask 時僅談判，無 ask 才接受；擲骰失敗仍是成功執行指令（ok:true），不算拒絕。negotiate 不改輸入契約或 RNG，回傳新 state／rng。tallyHeads 的事件須先由出戰層篩成該契約敵軍死亡，unit id 須在戰役內唯一。到期日當天仍可履約，次日轉 expired／failed；取消與終局結算有 settled 防重跑。

ship.route.to 是終點、via 是尚未抵達的節點序列、daysLeft 是當前一段。ship.at 留在最後抵達節點；改道從它重算，已耗燃料不退。燃料每段開始時 post 扣 stock:fuel，船池同步扣；cmdSail 設 pendingTicks 為新路徑天數，tick 自行扣 pendingTicks。途中段剩餘天數大於 0 時不能 dock；drift 可停止航行，ambush 時需支付內容定義的撤退燃料。map／board 只驗證，畫面由 text 讀 state。

## 想加進 types.ts 的欄位

| 位置 | 欄位（目前局部型別） |
|---|---|
| CampaignState | actionCooldowns?: Record<string, number>；actionDrawDays?: Record<string, number> |
| CampaignState | markets?: Record<Id, {refreshedDay: number; stock: Record<Id, number>}> |
| CampaignState | drifting?: boolean；contractsRepMonth?: number |
| CampaignState | exploration?: {node: Id; party: Id[]; layer: number} |
| pendingContracts[] | issuer?: Id；rift?: Id；node?: Id |
| RiftState | defendedDay?: number；recedeDay?: number |
| WorldActionDef | rules?: WorldRules（含 negotiation 係數） |

欄位均純資料，延遲初始化，不需修改 newCampaign 即可使用。係數來源為 action/ops-world.rules；該牌 valid 永假、weight 0，不參與行動抽牌。

## SPEC-GAP 清單

- 世界係數暫存不抽牌的 action/ops-world.rules。
- 世界／契約邊界：生成佇列由 contractsDaily2 消化。
- 防守戰延後當日裁決；同日不能連封兩階段。
- 改道以最後抵達節點重算；via 記剩餘節點。
- 探勘隊伍／層數、市場庫存、冷卻採區域型別。
- 獨立實物用零量 stock:inventory 對帳列。
- 只有現存蟲族 owner；無新族內容或 core 假引用。
- 談判帶 ask 只改條款；無 ask 才接受。

## TODO（活捕裁示）位置清單

依 2026-10-24T08:31 上游 orders：沒有馴化／餵養／飼料／飢餓／獸欄。新市場未加 feed 或 stock:feed，交易測試使用 fuel；既有內容不刪。

| 位置 | 後續清理 |
|---|---|
| content/base/world/markets/dhaka.json | 既有 feed 列與 stock:feed |
| content/base/world/campaign-start/default.json | 既有 stock:feed 開局量 |
| src/ops/state/types.ts | feed、PenState、StableState、stablePens 舊欄位 |
| src/ops/world/market.ts | 相容舊存檔：仍禁止賣出被 stable.pens 引用的機甲 |
| src/ops/text/render.ts | 既有 stock:feed 面板（非本線領地） |

## 以後交接書該點名的工具

無。
