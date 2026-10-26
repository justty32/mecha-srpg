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

見 [機型、機型池與內容佈局](data-model-faction-rnd/models-and-markets.md#機型-modeldefops-側登記modelsjsoncore-framedef-不改)：機型型別、部隊與市場取用、內容佈局與設計決定。

## 推進（tick 第 2f 段，每蝕月第 1 天）

每勢力 `rnd.points += income`，`income` 量級：state 12、company 10、city 5、guild／band 1；每持有一條活血統 +2、每條 `trade` 條約 +1、`war` 中 −3、`supply < 30` 再 −2、區域被奪每區 −1。沒有 `current` 就從可選池挑：`requires` 已全部釋出、`lineage` 在自己的 `lineages` 且未 `stalled`、`availableFrom` 已到；挑法加權——偏自己 `naming` 風格與最近戰損多的 `tier`（打輸了想要更強的）。`done += points`，`done ≥ cost` → `ModelReleased`、`released.push`、`points` 歸零。`cost` 量級：D 5、C 15、B 40、A 100 點，所以一座城約每 3–4 蝕月出一台 C、一國每蝕月一台 D 或兩蝕月一台 C。**隊長機**（`role:"captain"`）只在作戰勝利的 `aftermath` 擲出：同系列最近型號 +1 `mark`、冠名（`naming` 的中二級）、數量恆為 1、進該分遣隊。開局機型池約：通用 2 系列 × 3 型＋每個大勢力 1–3 型；12 蝕月後約翻倍。

## 機型池怎麼被用

見 [機型、機型池與內容佈局](data-model-faction-rnd/models-and-markets.md#機型池怎麼被用)。

## 技術流出 `leakModel`

`OpsEffect leakModel { model; by? }` 把機型改成 `generic:true, genericSince`、`exportPolicy:"open"`，寫 `TechLeaked`，驅動表 `tech-leak` 列結宿怨。來源四種：(1) 作戰——奪點／襲擾踩到 `maker` 標 `workshop` 的區域且成功，擲 `0.3 × tier 係數`；(2) 事件——叛逃技師、黑市拍賣（`events/`）；(3) 條約——`trade` 連續 6 蝕月、或 `shell-pact`，到期 `licensed → open`；(4) **玩家**——把 `restricted`／`licensed` 機型（撿的、借的）賣進市場或交給另一勢力，流出且 `maker rep −15`。流出的機型進通用池，所有勢力可做 `variant`——這就是「通用系列愈來愈多」的來源之一；年代早的另一半在內容裡直接 `generic:true`。

## 內容佈局（補 content-format-ops）

見 [機型、機型池與內容佈局](data-model-faction-rnd/models-and-markets.md#內容佈局補-content-format-ops)。

## 替使用者做掉的決定

見 [機型、機型池與內容佈局](data-model-faction-rnd/models-and-markets.md#替使用者做掉的決定)。
