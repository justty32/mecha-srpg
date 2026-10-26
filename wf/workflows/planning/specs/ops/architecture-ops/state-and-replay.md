[architecture-ops 入口](../architecture-ops.md)

# 狀態、事件與重播存檔

## 狀態與事件

```ts
type CampaignState = { version: 2; clock: Clock; rng: RngState; pressure: number;
  maps: Record<Id, { blight: Record<CellKey, { rift: Id; patch: Id }>; known: Record<CellKey, KnownCell>; wreckage: Record<CellKey, LootBundle[]> }>;   // world-grid
  places: Record<Id, PlaceState>; patches: Record<Id, BlightPatch>; actors: Record<Id, ActorState>;   // 原 nodes 改名 places
  rifts: Record<Id, RiftState>; factions: Record<Id, FactionState>;
  ship: ShipState; roster: RosterState; hangar: HangarState; restraint: RestraintBay; mechs: Record<Id, MechState>;
  inventory: Inventory; ledger: Ledger; research: Record<Id, ResearchState>; jobs: Job[];
  contracts: Record<Id, ContractState>; pendingChoices: Prompt[]; pendingTicks: number; pendingBattle?: Sortie; pendingEncounter?: Encounter;
  lore: string[]; flags: Record<string, number>; log: CampaignEvent[];
  operations: Record<Id, OperationState>; relations: Record<string, Relation>; shells: Record<Id, ShellState>; models: Record<Id, ModelState> };   // 第二輪：ops/war
type CampaignEvent = { seq: number; day: number; type: string; payload: Record<string, unknown> };
```

事件類型（節選）：`DayStart`、`DaySummary`、`RiftPhase`、`PatchBlighted`／`PatchReceded`、`CityLost`／`PlaceReclaimed`、`Arrived`、`Sighted`、`EncounterOffered`、`Evaded`、`Intercepted`、`EventOffered`、`Chosen`、`JobDone`、`WearWarning`、`BrokeLoose`、`Sustained`、`Stiffened`、`Mounted`、`Molted`、`Brooded`, `Mutated`、`Accompanied`、`NodeMastered`、`WagePaid`、`WageOwed`、`InterestPosted`、`Posted`（每筆帳）、`ContractOffered/Accepted/Done/Failed/Cancelled/Expired`、`Hired`、`Left`、`Died`、`BattleResolved`、`Woken`、`Named`、`CampaignEnd`；war：`OperationStarted/Phase/Engaged/Resolved/Failed/Aborted`、`RelationChanged`、`WarDeclared`、`TreatySigned/Broken/Expired`、`ShellSeized`、`PlaceTransferred`（原 `NodeTransferred`）、`LineageOpened/Stalled`、`ModelReleased`、`TechLeaked`、`AllySupplied`、`MechLoaned/Returned/Lost`、`OrderViolated`、`Betrayed`。payload 只放 id 與數字；文字由 `ops/text` 組。

## 決定性與重播

營運 RNG 是獨立 PCG32 串流（`campaign.rng`），每場戰鬥的 seed 由它抽出；`OpsCommand` 序列是存檔真相。`replayCampaign(start, commands) → CampaignEvent[]`，同輸入逐位元相同；戰鬥結果在重播時**不重跑**，從 `BattleResolved.payload` 內嵌的 `BattleResult` 摘要（狀態差分）回放——完整戰鬥日誌另存，驗 hash 即可。

## 存檔

沿用 core `SaveFile`：`campaignBlob = { state: CampaignState（snapshot）, commands: OpsCommand[], battles: { sortie: Id; seed: number; commands: Command[]; logHash: string }[] }`。載入時可選「重播校驗」：重跑 commands 比對 snapshot hash。內容包版本不符拒載；`version: 2`（方格版）不提供 v1 轉換。`maps[].blight` 由 `patches` 推導、載入時重建。

