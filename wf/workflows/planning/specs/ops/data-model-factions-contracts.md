# data-model-factions-contracts — 勢力與聲望、契約生命週期、談判、世界行動牌

[ops README](README.md)｜世界觀來源 [world/factions](../world/factions.md)｜core 的 FactionDef 在 [core/data-model-world](../core/data-model-world.md)

裁示：勢力可以大大小小、很多（資料驅動）；敵對人類機甲要但少數（約兩成，world 暫定裁示）；多份契約並行有時限、敵軍接約前依裂縫地盤固定、不隨玩家戰力縮放（decisions 戰鬥十題 10）；名聲是逐勢力的聲望表。

## 勢力營運側 FactionOpsDef（不改 core 的 FactionDef）

```ts
type FactionOpsDef = {
  faction: Id;                                              // 指向 core FactionDef（戰場陣營與 AI 策略在那邊）
  scale: string; territory: Id[] /*place（world-grid；原 node）*/;   // 可為空（遊牧獵團、走私網）
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

殘聯是傘：它自己是一個勢力（獵牌、評等、通緝），三十一座城邦各是一個勢力（各自發契約）。**聲望逐勢力**，無全局名聲；殘聯評等由 `rep` 分層決定契約級別與型錄衍型機等級。`stance.bio`／`ancient`／`soul` 讓同一件事（你帶了一隻 B 級進城）對不同勢力產生不同 rep 變化——由事件表引用這些格子，不在程式裡分支。開局約 40 個勢力，5–8 個大。`naming` 是給內容與生成器用的慣例欄（2026-10-24 裁示）：機械系名稱分階段——代號→系列＋型號→愈高階愈中二，`pattern` 依開發勢力喜好；古代機甲原始無名，`ancient` 預設由發現者以神話命名。程式只在生成機甲名與事件文字時取用。

**契約與談判**（ContractTemplate／EnemySnapshot／ContractState、生命週期與取消、敵軍編成快照、清剿打什麼、談判 Negotiation）→ [data-model-factions-contracts/contracts](data-model-factions-contracts/contracts.md)

## 世界行動牌 WorldAction（勢力模擬）

```ts
type WorldActionDef = { id: Id; actor: "faction" | "rift" | "world"; valid: Cond; weight: NumExpr; cooldownDays: number;
  effects: Id[] /*OpsEffect：postContract / spawnRival / shiftStance / openRoute / raiseFare / loseCity…*/ };
```

每天（非漲潮）每個活勢力最多抽一張：先過 `valid`，再按 `weight` 加權抽一張執行，設冷卻。漲潮日裂縫與勢力都行動。**勢力的自主作戰、宣戰、簽約也是牌**（效果 `startOperation`／`relation`／`treaty`），勢力因此有常備軍 `FactionState.forces`、關係表與研發狀態——分別在 [data-model-operations-war](data-model-operations-war.md)、[data-model-diplomacy](data-model-diplomacy.md)、[data-model-faction-rnd](data-model-faction-rnd.md)；`FactionOpsDef.roster` 改填 `ModelDef` id 當開局常備軍。這是 BB `OPS-21` 的採用：契約刷新、競爭獵團出現、勢力生滅、價格變動全部走牌，程式只提供抽牌與 `OpsEffect` 詞彙。`OpsEffect` 是營運層的效果詞彙表（`ledger`／`rep`／`flag`／`spawnContract`／`spawnEvent`／`setPlace`（原 `setNode`）／`setRift`／`spawnActor`／`setGoal`／`reveal`／`applyEffect(person|mech)`），與 core 的 `HookAction` 同構但作用在 `CampaignState`。護送契約綁 `caravan` 行動者、參戰契約綁 `force` 行動者（`target.actor`）。

## 競爭獵團與人類敵人

競爭獵團是 `scale:"band"` 的勢力，帶 `roster` 快照（幾台什麼等級的衍型機，抽象預算，不逐台追蹤）；牌 `contestContract` 讓它們搶同一份契約（先到者得，玩家在途中會收到「鹽鷗接走了」的訊息）；牌 `ambush` 產生對人戰鬥（情境敵方由其 `roster` 預算生成，掉落衍型機部件）。白手套只由「債務催收」事件鏈觸發；解拘者只在沐蝕會 `stance.player ≤ −1` 且玩家有生物機甲時出牌。人類敵人出現率由牌權重調到約兩成。

## 替使用者做掉的決定

1. **FactionOpsDef 與 core FactionDef 分檔**：戰場只認 FactionDef，營運只認 OpsDef。
2. **並行契約無上限、只用期限約束**：「接太多」的懲罰由時間與聲望自然產生。
3. **敵軍編成在 offered 時快照（含 `phase`）**：裁示要固定不縮放；快照讓「拖到錨坐下才去」的後果可預告。
4. **取消契約追回預付、追不回入債**：債是核心壓力源，違約也走債。
5. **競爭獵團用抽象預算 roster**（OPS-22 改造）：不逐台模擬，但掉落真實部件實例。
