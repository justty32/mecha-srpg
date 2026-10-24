# data-model-world／monsters — 怪獸族 SpeciesDef 與個體 MonsterDef

[data-model-world 入口](../data-model-world.md)｜[core README](../README.md)｜捕捉規則 [rules-battle-flow](../rules-battle-flow.md)｜意圖宣告 [ai](../ai.md)

## 怪獸族 SpeciesDef 與個體 MonsterDef

```ts
type SpeciesDef = {
  id: Id; name: string; family: "insect" | "beast" | "aberrant" | "mycelial" | string;   // 開放字串
  bodyPlan: Id; gradeRange: Grade[];                                   // 本族會出現的等級（不是成長階段）
  baseAttrsByGrade: Record<Grade, Record<AttrId, number>>;
  pools: PoolDecl[]; abilities: Id[];                                   // 族共通能力
  capture: { requireIntact: PartFunction[]; requireBroken: PartFunction[]; ability: Id; frame: Id };   // 捕後變哪個 FrameDef
  behaviors?: {                                                        // 全部可選，只有某些族有
    spawner?: { child: Id; cadence: NumExpr; max: number; tether: "dieWithParent" | "freeOnParentDeath" };
    molt?: { to: Id /*SpeciesDef*/; when: Cond; duringMoltEffects: EffectRef[] };
    telegraph?: boolean;                                               // 意圖提前一回合可見（ai.md）
    territorial?: { spreads: Id /*TerrainDef*/; cadence: NumExpr };    // 菌絲族把地形改成菌絲地
  };
  aiProfile: Id; tags: string[];
};
type MonsterDef = { id: Id; species: Id; grade: Grade; name?: string;   // 命名個體（S 以上多半在此）
  attrMods?: Contribution[]; extraAbilities?: Id[]; partsOverride?: Partial<PartDef>[]; tags: string[] };
```

怪獸的戰場實例就是 `MechState`（frame 指向由 species＋grade 合成的虛擬 FrameDef），座位為空；捕捉後把 `capture.frame` 當新 frame、保留各層 HP。「B 級不是 C 級蛻變而來」：`gradeRange` 列出本族各等級**各自生成**，`molt` 只在宣告了的族才存在。
