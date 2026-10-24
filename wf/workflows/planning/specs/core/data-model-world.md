# data-model-world — 地形、地圖、勢力、怪獸族與個體、情境

[core README](README.md)｜戰局規則 [rules-battle-flow](rules-battle-flow.md)｜AI 的陣營層 [ai](ai.md)

裁示：地圖有大有小、尺寸是資料；方格（真格子）；怪獸多族（蟲／獸／異形／菌絲……），族是 body plan 與層組合的分類；母體／子體與蛻皮只是某些族的可選行為；等級 D–SSS，SS／SSS 先不設計；勢力大小不限、很多；傳統兵器可存在。

## 地形 TerrainDef 與地圖 MapDef

```ts
type TerrainDef = {
  id: Id; name: string; glyph: string; color: string;                   // 給 ui-adapter 的最小呈現契約
  moveCost: Record<LocomotionClass, number | null>;                     // null＝不可進（leg/track/hover/flight/burrow/amphibious…由登記檔定義）
  height: number; cover: number; blocksLos: boolean;                    // cover 加到被攻擊方防禦
  onEnter: EffectRef[]; onTurnStart: EffectRef[];                       // 例：酸沼每回合腐蝕 flesh 層；菌絲地侵蝕 component 層
  destructible?: { hp: number; becomes: Id };                           // 建築被打壞變廢墟
  tags: string[];                                                       // water、urban、ruin、mycelium…
};
type MapDef = { id: Id; width: number; height: number;                  // 任意尺寸；>120×120 由 ui-adapter 可視區渲染
  cells: string;                                                        // 每格一個 glyph，查 legend；或 { rle: string }
  legend: Record<string, Id>; features?: { at: Cell; terrain: Id; hp?: number }[];
  deployZones: Record<FactionSlot, Cell[]>; exits: Cell[];              // exits＝撤離邊；預設四邊全部
  globals?: { tide?: NumExpr; light?: number };                         // battle.* 可引用的全局值
};
```

## 勢力 FactionDef（世界圖上的任何集團）

```ts
type FactionDef = {
  id: Id; name: string; scale: "band" | "company" | "city" | "cult" | "swarm" | "state";   // 只是標籤
  relations: Record<Id, "ally" | "neutral" | "hostile">;              // 戰場陣營由情境再映射
  strategy: Id;                                                       // ai 策略插件 id（見 ai.md）
  sensing: "shared";                                                  // 本版唯一值；保留欄位供日後「各機獨立」
  tags: string[];                                                     // human、kaiju、conventional-arms…
};
```

戰場上的「陣營」是情境把多個 FactionDef 映射到 `FactionSlot`（player／enemy／third…）的結果；同 slot 共享感測。怪獸的「裂獸」也是 FactionDef（`tags:["kaiju"]`），失控單位會被移到情境預留的 `berserk` slot（對所有人敵對）。

## 怪獸族與個體、情境（子檔）

<!-- wf-nav -->
- **怪獸族 SpeciesDef 與個體 MonsterDef**（族、等級、捕捉、spawner／molt／telegraph／territorial 可選行為）→ [data-model-world/monsters](data-model-world/monsters.md)
- **情境 ScenarioDef**（UnitSpawn、Objective、同盟與敵對、killTarget、全局值、可破壞格、地物受損提案、2026-10-24 補的決定 6–8）→ [data-model-world/scenario](data-model-world/scenario.md)

## 替使用者做掉的決定

1. **族的 `family` 開放字串、四族只是預設值**：使用者用了「等」字，不封閉。
2. **菌絲族給 `territorial` 行為**（把格子改成菌絲地形）：使用者形容菌絲是「地形化／擴散型」，用地形改寫表達最省。
3. **意圖宣告 `telegraph` 掛在族上而非全局**：Into the Breach 式可見意圖是裂獸的特色，人類機甲不透明。
4. **陣營 slot 與 FactionDef 分離**：勢力「很多、大小不限」，但一場戰鬥只需要少量 slot；失控者有專屬 slot。
5. **地圖 cells 用字串＋legend**：比二維陣列省 JSON 體積、人可讀、支援 RLE；大地圖靠可視區渲染不靠壓資料。
