# data-model-factions-contracts — 勢力與聲望、契約生命週期、談判、世界行動牌

[ops README](README.md)｜世界觀來源 [world/factions](../world/factions.md)｜core 的 FactionDef 在 [core/data-model-world](../core/data-model-world.md)

裁示：勢力可以大大小小、很多（資料驅動）；敵對人類機甲要但少數（約兩成，world 暫定裁示）；多份契約並行有時限、敵軍接約前依裂縫地盤固定、不隨玩家戰力縮放（decisions 戰鬥十題 10）；名聲是逐勢力的聲望表。

## 勢力營運側 FactionOpsDef（不改 core 的 FactionDef）

```ts
type FactionOpsDef = {
  faction: Id;                                              // 指向 core FactionDef（戰場陣營與 AI 策略在那邊）
  scale: string; territory: Id[] /*node*/;                 // 可為空（遊牧獵團、走私網）
  stance: { player: number; bio: number; ancient: number; soul: number; league: number };   // −2..+2 五格態度
  contractKinds: Id[] /*ContractTemplate*/; services: ServiceId[];
  reputationTiers: { at: number; grants: Id[] /*service／market list／契約級別*/; name: string }[];
  lifecycle?: { growOn: Cond; shrinkOn: Cond; absorbedBy?: Id };   // 生滅：條件達成時 scale 升降或併入
  naming?: { mechStages: { grade: Grade[]; pattern: string }[]; ancient: "mythic-by-finder" | string; flavor: string };   // 命名慣例（內容規範）
  tags: string[];
};
type FactionState = { def: Id; rep: number /*−100..100*/; scaleNow: string; territoryNow: Id[];
  alive: boolean; memory: { day: number; kind: string; ref?: Id }[] /*最近 N 筆對玩家的記憶*/ };
```

殘聯是傘：它自己是一個勢力（獵牌、評等、通緝），三十一座城邦各是一個勢力（各自發契約）。**聲望逐勢力**，無全局名聲；殘聯評等由 `rep` 分層決定契約級別與型錄摹機等級。`stance.bio`／`ancient`／`soul` 讓同一件事（你帶了一隻 B 級進城）對不同勢力產生不同 rep 變化——由事件表引用這些格子，不在程式裡分支。開局約 40 個勢力，5–8 個大。`naming` 只是給內容與生成器用的慣例欄（2026-10-24 補充裁示）：機械系名稱分階段——代號→系列＋型號→愈高階愈中二，`pattern` 依開發勢力喜好（塞勒涅型錄體、殘聯軍械庫編號體…）；古代機甲原始無名，`ancient` 預設由發現者的人以神話命名（殼學會、潮信會各有一套）。程式不解讀內容，只在生成機甲名與事件文字時取用。

## 契約 ContractTemplate 與 ContractState

```ts
type ContractTemplate = { id: Id; kind: "clear" | "seal" | "reclaim" | "escort" | "scout" | "rival" | "survey" | "defend" | "smuggle" | "join";   // join＝參戰型，見 mercenary-contracts
  issuerKinds: string[]; requiresRep: number; gradeRange: Grade[];
  objectives: ObjectiveTemplate[];                          // 展開成情境 Objective（battle-interface）
  pay: { base: NumExpr; perHead?: NumExpr; bonus?: { cond: Cond; amount: NumExpr }[] };
  advanceMax: number /*0..1*/; deadlineDays: NumExpr; supplies?: Id[] /*附帶：空援券、拘束彈*/;
  onComplete: Id[] /*OpsEffect*/; onFail: Id[]; onCancel: Id[]; stages?: StageTemplate[] /*多段*/ };
type ContractState = { id: Id; template: Id; issuer: Id; target: { node: Id; rift?: Id };
  status: "offered" | "active" | "stage" | "done" | "failed" | "cancelled" | "expired";
  terms: { total: number; advance: number; perHead: number }; paidAdvance: boolean; heads: Record<Id, number>;
  offeredDay: number; deadlineDay: number; stageIdx: number; annoyance: number /*談判累積厭煩*/ };
```

生命週期：`offered`（契約板，到期清除）→ 接受 → `active`（多份並行無上限，但每份都有 `deadlineDay`，重疊時間是玩家的問題）→ 多段者走 `stage` → 結算 `done`／`failed`／`cancelled`。取消：扣該勢力 rep、追回已付預付款（追不回則記入債）、跑 `onCancel`（一次性，存檔有旗標防重跑）。**敵軍編成在 `offered` 時就由目標節點的 `RiftState`（寬度、深度、族、錨齡）定死**，寫進 `ContractState.target` 的快照；玩家變強不改它。防守／收復類允許部分成功（守住但設施損失→半額）。

## 談判 Negotiation

接約前可選：加總額、加預付、改按頭（`perHead`）。每次要求 `annoyance += 1`，擲 `d100 < issuer.rep − annoyance × k` 成功則改條件，失敗則 `annoyance` 再加；超過模板 `annoyanceMax` 雇主收回契約並扣 rep。預付上限 `advanceMax`。談判是純函式 `(state, ask, rng) → (state', result)`，供 text 層與 AI 測試呼叫。

## 世界行動牌 WorldAction（勢力模擬）

```ts
type WorldActionDef = { id: Id; actor: "faction" | "rift" | "world"; valid: Cond; weight: NumExpr; cooldownDays: number;
  effects: Id[] /*OpsEffect：postContract / spawnRival / shiftStance / openRoute / raiseFare / loseCity…*/ };
```

每天（非大潮）每個活勢力最多抽一張：先過 `valid`，再按 `weight` 加權抽一張執行，設冷卻。大潮日裂縫與勢力都行動。**勢力的自主作戰、宣戰、簽約也是牌**（效果 `startOperation`／`relation`／`treaty`），勢力因此有常備軍 `FactionState.forces`、關係表與研發狀態——分別在 [data-model-operations-war](data-model-operations-war.md)、[data-model-diplomacy](data-model-diplomacy.md)、[data-model-faction-rnd](data-model-faction-rnd.md)；`FactionOpsDef.roster` 改填 `ModelDef` id 當開局常備軍。這是 BB `OPS-21` 的採用：契約刷新、競爭獵團出現、勢力生滅、價格變動全部走牌，程式只提供抽牌與 `OpsEffect` 詞彙。`OpsEffect` 是營運層的效果詞彙表（`ledger`／`rep`／`flag`／`spawnContract`／`spawnEvent`／`setNode`／`setRift`／`applyEffect(person|mech)`），與 core 的 `HookAction` 同構但作用在 `CampaignState`。

## 競爭獵團與人類敵人

競爭獵團是 `scale:"band"` 的勢力，帶 `roster` 快照（幾台什麼等級的摹機，抽象預算，不逐台追蹤）；牌 `contestContract` 讓它們搶同一份契約（先到者得，玩家在途中會收到「鹽鷗接走了」的訊息）；牌 `ambush` 產生對人戰鬥（情境敵方由其 `roster` 預算生成，掉落摹機部件）。白手套只由「債務催收」事件鏈觸發；解拘者只在潮信會 `stance.player ≤ −1` 且玩家有生物機甲時出牌。人類敵人出現率由牌權重調到約兩成。

## 替使用者做掉的決定

1. **FactionOpsDef 與 core FactionDef 分檔**：不改 core spec；戰場只認 FactionDef，營運只認 OpsDef。
2. **並行契約無上限、只用期限約束**：BB 單一 Active 太緊，「接太多」的懲罰由時間與聲望自然產生。
3. **敵軍編成在 offered 時快照**：裁示要固定不縮放；快照還讓「拖到深蝕才去」的後果可預告。
4. **取消契約追回預付、追不回入債**：債是本作的核心壓力源，讓違約也走債。
5. **競爭獵團用抽象預算 roster**（OPS-22 改造）：不逐台模擬，但掉落真實部件實例；日後要「可耗盡的敵方」再升級。
