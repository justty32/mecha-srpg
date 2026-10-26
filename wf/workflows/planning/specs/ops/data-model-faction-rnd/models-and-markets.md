[data-model-faction-rnd 入口](../data-model-faction-rnd.md)

# 機型、機型池與內容佈局

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

## 機型池怎麼被用

- **勢力部隊**：補員從 `released` 抽，權重 ∝ `(今 − releasedDay + 1 蝕月)⁻¹ × tierMult`，舊型多、新型少、隊長機唯一。
- **市場**：`MarketDef.lists` 的 `frame`／`component` 列不再列死機型，改列 `{ lineage?, maker?, tierMax }` 篩選器；刷新時從**可見機型**抽——通用全開、`open` 全開、`licensed` 看節點 owner 與 `maker` 關係、`restricted` 只在 maker 區域。新型上市價 ×1.5，一蝕月後回基準。
- **敵方情境**：對人作戰與競爭獵團 `ambush` 的 `UnitSpawn` 從該勢力 `released`（獵團從 `generic`＋買得到的）抽，人物臨時生成；所以玩家在第 10 蝕月遇到的塞勒涅白手套，開的是第 10 蝕月的型號。
- **玩家**：買、撿、拆的是同一池；`ResearchDef` 的 `unlocks` 可指向 `ModelDef`（獵團自己也能造通用改型）。

SPEC-GAP 補（2026-10-26 lead-rep）：未流出、`maker` 為勢力的機型，玩家購買須對 maker 聲望 ≥ `action/ops-world.rules.repGate`（`overrides[id] ?? byTier[tier]`）；通用與已流出機型公開。各市場付款前驗證，不足回 `reputation-required`；固定 frame 清單有任一無門檻 model 即公開，否則取最低門檻。達標的已釋出非隊長私有機可在符合篩選器的市場列出。通用血統上的私有機只由 maker 釋出與研發。玩家尚無研發機型／補員帶機入口。

## 內容佈局（補 content-format-ops）

`content/<pack>/world/` 新增 `lineages/`、`models/`、`operations/`、`treaties/`、`forces/replenish.json`、`affinity.json`；`factions-ops/` 的 `roster` 改填 `model` id。`npm run check` 加驗：`ModelDef.frame` 存在且 `cls:"mechanical"`、`requires` 無環、`lineage.holder` 是活勢力、每個勢力至少能抽到一型（通用保底）。既有 `content/base/frames/` 機械系要補 `models/` 列（content 線）。

## 替使用者做掉的決定

1. **ModelDef 與 FrameDef 分家**：戰鬥不認「誰造的」，世界才認；core 零修改，`FrameDef` 一台可被多家本地化。
2. **研發點數制、每蝕月結一次**：與補員、條約同節拍；數字全在內容。
3. **隊長機只從勝仗裡誕生**：使用者說「多次迭代後弄出一台隊長機」，勝利是最自然的迭代。
4. **市場列篩選器而非死清單**：機型池會長，死清單一定過時。
5. **玩家轉賣是流出來源**：讓「借來的機別亂賣」成為真實的誘惑與代價。
