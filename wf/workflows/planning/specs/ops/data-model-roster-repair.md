# data-model-roster-repair — 人員（招募、薪水、休養、離隊）、工時佇列、修理與部件庫存、機庫

[ops README](README.md)｜世界觀來源 [world/mech-lifecycles](../world/mech-lifecycles.md)｜機甲資料 [core/data-model-mech](../core/data-model-mech.md)｜帳本在 [data-model-economy-research](data-model-economy-research.md)｜生物系營運在 [data-model-beasts](data-model-beasts.md)

裁示：駕駛員＝BB 的兄弟（特質、傷勢、士氣、成長），人比機器貴；傷勢分暫時與永久、戰後不補滿；部位歸零可修（費時費錢）或換，古代只修不換（decisions 戰鬥十題 5、6）；生物系活捕上拘束器硬壓、無馴化無餵養、屍體改裝另一條路（2026-10-24）；機魂不招募、用育的或租的。三類機甲的營運主軸：機械＝改裝保養＋培養機魂、古代＝駕駛員心智成長、生物＝改裝保養＋對抗怪獸。

## 名冊 RosterState

```ts
type RosterState = { persons: Record<Id, PersonState>;        // core 型別原樣存，含傷勢 Effect 與 soulTree
  employment: Record<Id, { since: number; wage: number; owed: number; mood: number /*−3..+3*/; role: "pilot" | "technician" | "medic" | "crew"; seat?: Id }>;
  trust: Record<Id /*soul*/, Record<Id /*person*/, number>>;   // 機魂對人的信任（陪伴累積；出戰時注入）
  mastery: Record<Id /*soul*/, Record<Id /*node*/, number>>;   // 天賦節點熟練 0..1（經濟檔「開／練熟」）
  names: Record<Id /*mech*/, { name: string; by: Id /*person|faction|"wild"*/; day: number; kind: "title" | "registry" | "nickname" | "dread" | "epithet" }[]>;   // 多稱號（古代用 title；生物系四種見 beasts）
  dead: { person: Id; day: number; cause: string }[] };
```

**薪水**：每人每天 `wage/28` 應付，日結時全團合計一次；`cash` 不足 → **全團等比例欠薪**（`owed` 累加，mood −1／天，不看名冊順序；DAT-12 的答案）。**mood** 是營運層心情（與戰鬥士氣分開）：欠薪、同伴死亡、戰敗、艙內獸掙脫降；發薪、勝利、酒艙事件升；進戰場時 `mood < 0` 讓起始 `MoraleStage` 從 `shaken` 起算（寫進情境 `UnitSpawn` 的效果）。`mood ≤ −3` 且弦月 → 離隊檢定；離隊者帶走自己 `boundTo` 的部件，機甲留下（OPS-07 答案）。**休養**：人物 `hp` 池每天回復 NumExpr（醫務艙×2，有 `medic` ×3）；`injury:temporary` 的 `days` 時鐘每日 −1；`injury:permanent` 只能靠城邦 `medbay` 服務的 `cleanse`（貴、只對白名單傷）。**成長**：XP 已在戰鬥發放，升級在營運層按 core `HumanGrowth` 結算（升級時機＝回船當天）；古代系駕駛員的「心智成長」＝信念與共鳴值（`WillState`）在對話與事件中推動，是古代系的營運主軸。

## 招募 RecruitPoolDef

`{ id; place: Id /*原 node*/; sources: { background: Id; weight: NumExpr }[]; size: number; refreshOn: "quarter" }`。弦月刷新；背景（`persons/backgrounds/*.json`：退役機甲師、難民孩子、殼學會學生、潮信會叛教者……）給屬性範圍、起始特質、聘金與薪水倍率（生成時抽一次保存，CHR-03）。難民營出高 `獸緣`、殘聯名冊出有傷的老手。**機魂不在池裡**：租（塞勒涅 `soul-rental` 市場列）、育（佇列）、或黑市野魂（事件）。

## 工時佇列 WorkQueue（修理、科研、移植、育魂、拘束維護共用）

```ts
type Job = { id: Id; kind: "repair" | "rebuild" | "research" | "graft" | "incubate" | "install" | "mod" | "restrain" | "mount" | "embalm" | "prune";
  target: Id; needHours: number; doneHours: number; materials: Record<Account, number>; paid: boolean; priority: number };
```

每天 `techHours = Σ technician.attrs.craft`（屬性在 `attrs.json` 登記；core 的 `role` 聯集沒有 `craft`，營運層以 `attrs.json` 的 `tags: ["craft"]` 自行查，不動 core 型別——是否把 `craft` 加進 role 聯集列 REPORT 建議）。玩家排 `priority`；工時按序灌入，材料在 job 開始時一次扣（不足則 job 不開始，不會「扣一半」）。**修理**：目標是某部位某層；每點層 HP 的工時與材料由層種類登記（`registries/layer-types.json` 加 `repair: { hoursPerHp, material: Account, perHp }`——core 登記檔可加欄位，不改 core 型別）。結構層歸零（部位毀損）→ `rebuild` job：工時×3、材料×2；`repairPolicy:"repair-only"` 的古代機甲材料欄固定是 `stock:core-*`（吃核），不可 `install` 換部件。**換部件**＝`install` job（拆下的進 Inventory，保留 HP）。**移植**（生物系換部件）＝`graft`：來源是同族屍體部位（`stock:flesh`＋一個 `PartTemplate`），異族 `rejectChance`，失敗材料全失。**生物系四種 job**（`restrain` 拘束器維護、`mount` 屍體改裝、`embalm` 防腐、`prune` 修剪）細則在 [data-model-beasts](data-model-beasts.md)。**魂核**是部件，壞了走 `repair`；機魂的「損耗」是它的傷勢 Effect，走醫務艙邏輯但由技師治。

## 機庫 HangarState 與拘束艙

```ts
type HangarState = { bays: (Id | null)[]; dormant: Id[] /*未認主的殼*/ };
```

摹機與古代機甲占機庫位；生物系（活捕獸、屍體改裝機、整屍）占拘束艙位，狀態型別 `RestraintBay`／`BeastState`／`CarcassState` 與磨損、失控、族別維持、屍體改裝全在 [data-model-beasts](data-model-beasts.md)。死亡：屍體拆成 `stock:core-<grade>` 與材料，寫帳本；可拘束族的屍體可改留整屍。

## 古代機甲的人與名

認主後 `PersonState.will.resonance[frame]` 鎖定，該人物 `employment.seat` 不可改；離開該機 >1 潮月掛 `withering` 效果；駕駛員死亡 → 機甲 `dormant` 並掛 `grudge` flag（下個認主者多一條負面特質）。這些全是 Effect 與 flag，不是新規則。

**古代機甲原始無名**（2026-10-24 裁示）：古代 `FrameDef.name` 在內容檔只是目錄代號（「青藏一號殼」）；人叫它的名字存在 `RosterState.names[mech]`（`kind:"title"`），可多個、可改。`喚` 成功當夜 `prompt`「給它一個名字」：三個候選從 `names/mythic-<culture>.json` 依認主者的 `culture` tag 抽（北歐、希臘、埃及、印度、中國、日本、兩河……各一表）＋一格自填；之後勢力事件可再加稱號（殼學會登錄名、潮信會聖名——`OpsEffect: nameMech`），顯示最新一個、`看` 列全部。改名是事件不是動詞。摹機也可用 `names`（隊長機冠名、綽號），預設仍顯示 `FrameDef.name`；機械系名字的分階段規範是內容包的事（[factions-contracts](data-model-factions-contracts.md) `naming` 欄），ops 不生成。生物系的登記號／小名／凶名／二名見 [data-model-beasts](data-model-beasts.md)。

## 替使用者做掉的決定

1. **全團等比例欠薪、不看名冊順序**：BB 的隱藏順序不公平；欠薪天數掛每人身上可見。
2. **一個工時池、多種 job 共用**：修理、科研、拘束維護搶同一群技師，是「修還是研還是壓」的真實取捨。
3. **材料開工時一次扣、不夠不開工**：避免「修一半卡住」的半成品狀態。
4. **同調只加承擔上限、不加屬性**：讓生物系的養成全落在意志軸上，與 core 一致。
5. **離隊者帶走綁定部件、留下機甲**：人比機器貴——他的槍是他的，船上的機甲是團的。
6. **稱號是營運狀態、不是 FrameDef 欄位**：古代殼無名、生物系預設只有登記號，名字跟著「誰叫過它」走；命名表進內容包，程式只抽。
