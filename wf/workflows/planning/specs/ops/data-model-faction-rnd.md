# data-model-faction-rnd — 勢力研發推進：藍本血統、通用系列、機型池隨時間擴大、技術流出

[ops README](README.md)｜裁示原文 [design-notes/mechs](../../design-notes/mechs.md)（2026-10-24 研發路線源自古代機甲、研發隨時間線推進、通用機甲系列）｜作戰 [data-model-operations-war](data-model-operations-war.md)｜市場 [data-model-economy-research](data-model-economy-research.md)｜命名 [data-model-factions-contracts](data-model-factions-contracts.md)

裁示：各勢力依其保有的古代機甲不同，研發的機甲各有特色；取得新古代機開新分支；時間推進、機型愈來愈多；至少一條通用系列（開源／逆向／流出／分享／年代早）各方都造、都買得到，各家做本地化改型。玩家自己的科研（`ResearchDef`）不在此——這裡是**世界**的研發。

## 血統 LineageDef（`lineages/<id>.json`）

```ts
type LineageDef = { id: Id; name: string; source: Id /*ancient FrameDef*/ | "generic"; holder?: Id /*開局持有勢力；generic 無*/;
  traits: { partsBias: string[] /*slot-type tags*/; pools: Id[]; abilityTags: string[]; silhouette: string /*外形語彙*/; naming: Id /*FactionOpsDef.naming 風格*/ };
  tags: string[] };
```

血統是「這一脈衍型機像誰」：源自哪台古代機就偏向它的部件、資源池與能力傾向（源質脈動、潮歌共鳴、鐵壁……用世界的語言命名，不用工程術語）。同血統彼此相似、異血統差異大。**通用血統**（`source:"generic"`）不綁古代機、人人可用；使用者定三條通用血統與定位（2026-10-24）：**堅盾＝防守**（厚層、掩護、守點）、**長槍＝遠程**（射程、壓制）、**鐵劍＝通用基本型**（均衡、便宜、新手與民兵的第一台）；內容 `lineages/universal-{bulwark,longspear}` 已有，鐵劍待內容補。勢力取得古代機（`ShellState.holder` 變更）→ 2 蝕月後 `LineageOpened`，該勢力多一條血統；失古代機 → 該血統對它 `stalled`（已釋出機型保留，不再出新型）。

## 機型 ModelDef（ops 側登記，`models/<id>.json`；core `FrameDef` 不改）

```ts
type ModelDef = { id: Id; frame: Id /*mechanical FrameDef*/; lineage: Id; maker: Id /*faction*/ | "generic";
  series: string; mark: number; role: "line" | "variant" | "captain";      // 量產型／本地化改型／隊長機
  tier: Grade; cost: number /*研發點*/; requires: Id[] /*前置機型*/;
  availableFrom: { month: number } | { event: Id } | { lineage: Id /*血統開啟即排程*/ };
  exportPolicy: "open" | "licensed" | "restricted"; generic: boolean; tags: string[] };
type ModelState = { def: Id; releasedDay?: number; genericSince?: number; by: Id /*實際釋出者*/ };
// FactionState 加：rnd: { points: number; current?: { model: Id; done: number }; released: Id[]; lineages: Id[]; stalled: Id[] }
```

`FrameDef` 仍是戰鬥用的機體資料；`ModelDef` 是它在世界裡的「身世」：誰造、哪一脈、第幾代、何時登場。一個 `FrameDef` 可對應多個 `ModelDef`（同機不同勢力的本地化改型只差 `maker`、`series` 與命名）。`availableFrom` 是**首次登場**：`month` 用於通用系列與開局已存在的機型（開局 `month 0` 的即為「年代早」），`lineage` 用於血統機（血統開啟後進該勢力研發佇列），`event` 用於劇情機。`requires` 是前置（上一代、或通用基底）。`generic:true` 的機型人人可造；`exportPolicy` 管市場：`open` 任何市場可列、`licensed` 只列給 `maker` 的 `friendly` 以上、`restricted` 只在 `maker` 自己的區域。

## 推進（tick 第 2f 段，每蝕月第 1 天）

每勢力 `rnd.points += income`，`income` 量級：state 12、company 10、city 5、guild／band 1；每持有一條活血統 +2、每條 `trade` 條約 +1、`war` 中 −3、`supply < 30` 再 −2、區域被奪每區 −1。沒有 `current` 就從可選池挑：`requires` 已全部釋出、`lineage` 在自己的 `lineages` 且未 `stalled`、`availableFrom` 已到；挑法加權——偏自己 `naming` 風格與最近戰損多的 `tier`（打輸了想要更強的）。`done += points`，`done ≥ cost` → `ModelReleased`、`released.push`、`points` 歸零。`cost` 量級：D 5、C 15、B 40、A 100 點，所以一座城約每 3–4 蝕月出一台 C、一國每蝕月一台 D 或兩蝕月一台 C。**隊長機**（`role:"captain"`）只在作戰勝利的 `aftermath` 擲出：同系列最近型號 +1 `mark`、冠名（`naming` 的中二級）、數量恆為 1、進該分遣隊。開局機型池約：通用 2 系列 × 3 型＋每個大勢力 1–3 型；12 蝕月後約翻倍。

## 機型池怎麼被用

- **勢力部隊**：補員從 `released` 抽，權重 ∝ `(今 − releasedDay + 1 蝕月)⁻¹ × tierMult`，舊型多、新型少、隊長機唯一。
- **市場**：`MarketDef.lists` 的 `frame`／`component` 列不再列死機型，改列 `{ lineage?, maker?, tierMax }` 篩選器；刷新時從**可見機型**抽——通用全開、`open` 全開、`licensed` 看節點 owner 與 `maker` 關係、`restricted` 只在 maker 區域。新型上市價 ×1.5，一蝕月後回基準。
- **敵方情境**：對人作戰與競爭獵團 `ambush` 的 `UnitSpawn` 從該勢力 `released`（獵團從 `generic`＋買得到的）抽，人物臨時生成；所以玩家在第 10 蝕月遇到的塞勒涅白手套，開的是第 10 蝕月的型號。
- **玩家**：買、撿、拆的是同一池；`ResearchDef` 的 `unlocks` 可指向 `ModelDef`（獵團自己也能造通用改型）。

## 技術流出 `leakModel`

`OpsEffect leakModel { model; by? }` 把機型改成 `generic:true, genericSince`、`exportPolicy:"open"`，寫 `TechLeaked`，驅動表 `tech-leak` 列結宿怨。來源四種：(1) 作戰——奪點／襲擾踩到 `maker` 標 `workshop` 的區域且成功，擲 `0.3 × tier 係數`；(2) 事件——叛逃技師、黑市拍賣（`events/`）；(3) 條約——`trade` 連續 6 蝕月、或 `shell-pact`，到期 `licensed → open`；(4) **玩家**——把 `restricted`／`licensed` 機型（撿的、借的）賣進市場或交給另一勢力，流出且 `maker rep −15`。流出的機型進通用池，所有勢力可做 `variant`——這就是「通用系列愈來愈多」的來源之一；年代早的另一半在內容裡直接 `generic:true`。

## 內容佈局（補 content-format-ops）

`content/<pack>/world/` 新增 `lineages/`、`models/`、`operations/`、`treaties/`、`forces/replenish.json`、`affinity.json`；`factions-ops/` 的 `roster` 改填 `model` id。`npm run check` 加驗：`ModelDef.frame` 存在且 `cls:"mechanical"`、`requires` 無環、`lineage.holder` 是活勢力、每個勢力至少能抽到一型（通用保底）。既有 `content/base/frames/` 機械系要補 `models/` 列（content 線）。

## 替使用者做掉的決定

1. **ModelDef 與 FrameDef 分家**：戰鬥不認「誰造的」，世界才認；core 零修改，`FrameDef` 一台可被多家本地化。
2. **研發點數制、每蝕月結一次**：與補員、條約同節拍；數字全在內容。
3. **隊長機只從勝仗裡誕生**：使用者說「多次迭代後弄出一台隊長機」，勝利是最自然的迭代。
4. **市場列篩選器而非死清單**：機型池會長，死清單一定過時。
5. **玩家轉賣是流出來源**：讓「借來的機別亂賣」成為真實的誘惑與代價。
