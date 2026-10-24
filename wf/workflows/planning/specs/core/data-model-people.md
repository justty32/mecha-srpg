# data-model-people — 人物：駕駛員與機魂共用的骨架

[core README](README.md)｜規則在 [rules-people](rules-people.md)｜能力與效果 [data-model-abilities-effects](data-model-abilities-effects.md)

裁示：駕駛員＝BB 的「兄弟」；機魂（機械系 AI）**是另一個駕駛員**、不是部件；意志軸三用法（共鳴／承擔／天賦樹）是人物與部件資料上的欄位，不是機甲類別分支。所以只有一種實體 `Person`，`kind` 只影響成長來源與可讀性，不影響任何規則分派。

## PersonDef（內容檔）與 PersonState（存檔）

```ts
type PersonDef = {
  id: Id; name: string; kind: "human" | "soul";      // soul＝機魂
  attrs: Record<AttrId, number>;                    // 基本屬性（命中/迴避/決心/反應/感知/操控…由 attrs 登記表定義）
  traits: Id[]; perks: Id[];                        // 皆為 Effect（永久、scope=person）
  pools: PoolDecl[];                                // 人物自帶的池：AP、疲勞必有；可再加（例：機魂的「運算裕度」）
  will: WillDef;                                    // 意志軸，見下
  growth: HumanGrowth | SoulGrowth;                 // 成長來源，唯一依 kind 分流的欄位
  tags: string[];                                   // 給效果條件與 AI 用（例：soul、veteran、cult）
};
type PersonState = {
  def: Id; attrsBase: Record<AttrId, number>;       // 升級後的底值；當前值＝底值＋貢獻清單（TM-34）
  contribs: Contribution[]; pools: Record<PoolId, PoolState>;
  effects: EffectInstance[];                        // 傷勢、士氣、承擔帶、共鳴帶……全是效果實例
  morale: MoraleStage; will: WillState; xp: number; level: number;
  seat?: { mech: Id; role: SeatRole };              // 在哪台機甲的哪個座位
};
```

屬性名不寫死在程式：`content/<pack>/attrs.json` 登記 `AttrId`、顯示名、下限上限；規則只引用 `attrs.json` 裡宣告為 `role` 的屬性（`role: "accuracy" | "evasion" | "resolve" | "initiative" | "perception" | "control"`），讓內容包能換名、加屬性而不改程式。

## 意志軸 WillDef／WillState（三用法同一欄位組）

```ts
type WillDef = {
  beliefs: string[];                // 信念標籤（例：復仇、守護、求知）——共鳴比對用
  burdenLimit: NumExpr;             // 承擔上限（預設引用 resolve 屬性）
  resonanceAffinity?: Record<string, number>;   // 對某些信念標籤的額外契合
};
type WillState = {
  burden: number;                   // 承擔量（0..∞；超過 burdenLimit 進失控檢定）
  resonance: Record<Id /*frame 或 component*/, number>;  // 與各古代機體／部件的共鳴值 0..1
  soulTree?: { nodes: Id[]; research: number; companionship: number };  // 機魂天賦樹
};
```

三用法對應：**共鳴**＝古代機體／古代部件在資料裡宣告 `resonance: { beliefs, threshold, deeds }`，人物與之比對得到 0..1，是其神異能力的可用門檻與加成（rules-people §共鳴）；**承擔**＝生物機體／生物部件宣告 `burden: NumExpr`（本回合要承擔多少），人物累積到 `WillState.burden`，愈高愈強、超限失控；**機魂天賦樹**＝`kind=soul` 的人物以 `research`（科研方向投入）與 `companionship`（陪伴時數）兩種點數解鎖 `soulTree.nodes`（節點即 perk，Effect）。機械系機甲裝了生物／古代部件，就同時觸發前兩者——由部件資料驅動，不看機甲類別。

## 成長來源

```ts
type HumanGrowth = { xpCurve: Id; levelDice: Record<AttrId, number[]>; perkPointsAt: number[] };
type SoulGrowth  = { tree: Id; researchPerDirection: Record<string, number>; companionshipRate: NumExpr };
```

人類走 BB 式：擊殺即發 XP（CHR-17）、升級用生成時預骰的骰（CHR-06）、perk 點數依層級解鎖（CHR-08）。機魂不吃 XP：營運層每日把科研方向投入與陪伴時數寫進 `soulTree`，戰鬥引擎只讀節點。兩者的 perk 都是 Effect，規則一致。

## 士氣、傷勢、疲勞

- **士氣**：`MoraleStage = "steady" | "shaken" | "breaking" | "fleeing"`，掛在人物上（decisions 第 2 題）。檢定事件由 `content/.../morale-events.json` 宣告（友軍陣亡、部位毀損、受重傷、承擔超限……），每筆有觸發條件與難度 NumExpr。機魂也有士氣欄，只是它的內容包通常宣告不同的觸發（例：對恐懼免疫、對訊號干擾脆弱）。
- **傷勢**：Effect，`scope=person`、`tags` 含 `injury:temporary` 或 `injury:permanent`。暫時傷帶 `clock: {kind:"days", n}` 由營運層遞減；永久傷 `clock: permanent`，只有帶 `cleanse: ["injury:permanent"]` 的外部效果能移除（CHR-11）。
- **疲勞**：人物的池 `fatigue`（反向池，越高越糟），壓 AP 上限與命中（CMB-03）；在本人回合開始回復。

## 座艙關係 SeatRole 與控制模式

機體的 `cockpit` 部位宣告 `seats: SeatDecl[]`；人物進座位得到 `SeatRole = "pilot" | "soul" | "passenger"`。機甲的指令權由 `controlMode` 決定（存在 MechState）：`"pilot"`（人開，機魂給被動加成）、`"soul"`（機魂開，人只用自身能力）、`"shared"`（能力資料用 `actorRole` 指定由誰出手、成本從誰的池扣）、`"contested"`（每回合開始做控制檢定，贏者本回合握指令權；機魂研發方向可偏向爭奪）；另有三個非選擇值：`"none"`（無人且無本能：棄機後的空機體／derelict）、`"instinct"`（**無座位人物的怪獸由本能驅動**：野生裂獸、無拘束出戰的活捕獸；指令交 AI 用族的 `aiProfile`，能力成本裡「人物的池」改扣機體同名池——sim 線 2026-10-24 實作）、`"disabled"`（停機帶效果強制）。失控（承擔超限）是 `controlMode` 被效果強制改成 `"berserk"`——詳 rules-people。**怪獸意識不是人物**（2026-10-24 裁示）：活捕獸的「狂暴意志」只以機體側資料表達——`instinct` 池、機體 `burden` 宣告、族 `aiProfile`——不佔座位、不用 `Person` 骨架；屍體改裝的生物機體則無 `instinct` 池、`burden` 為 0，與摹機同規則。

## 替使用者做掉的決定

1. **只有一個 Person 型別**，`kind` 只分流成長欄位：避免規則層出現 `if soul` 分支，機魂天賦即 perk。
2. **屬性名在資料登記、規則只引用 role**：換名、加屬性不改程式；代價是規則層要多一層查表。
3. **士氣掛機魂上也成立**：機魂的「崩潰」用內容包定義成不同觸發，程式不特判。
4. **控制模式四種＋berserk＋instinct**：使用者只提到「協作／代駕／爭奪」，我加了 `shared` 讓能力資料指定出手者，供「人機合擊」橋段用；`instinct` 與 `none` 分開，是為了讓棄機空殼與無人怪獸在 AI 與 UI 上都不混。
5. **承擔上限預設引用 resolve 屬性**：BB 的決心本就是心志，不另造屬性；內容包可改 NumExpr。
