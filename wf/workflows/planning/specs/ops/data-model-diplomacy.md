# data-model-diplomacy — 勢力間外交：關係值與離散態、條約、變化驅動、對作戰的影響、與戰場陣營的銜接

[ops README](README.md)｜裁示原文 [design-notes/world](../../design-notes/world.md)（2026-10-24 勢力間衝突與外交）｜作戰 [data-model-operations-war](data-model-operations-war.md)｜core 陣營 [core/data-model-world](../core/data-model-world.md)

裁示：勢力之間有動態外交（同盟、友好、中立、緊張、敵對…隨事件變化），不只共抗裂獸也會互相衝突；傭兵可被雙方雇用、選邊，選邊影響聲望與外交後果。`FactionDef.relations` 是 core 的靜態標籤，戰場陣營由情境再映射——本檔的動態關係只住在營運層。

## 關係 Relation（每對活勢力一筆，無向）

```ts
type RelState = "war" | "hostile" | "tense" | "neutral" | "friendly" | "allied";
type Relation = { a: Id; b: Id; value: number /*−100..100*/; state: RelState; baseline: number;
  treaties: TreatyState[]; grievances: { day: number; kind: string; w: number }[]; weariness: number; since: number };
// CampaignState 加：relations: Record<`${Id}|${Id}`, Relation>（a < b 字典序）
```

**離散態由 `value` 加滯後決定**：進 `war` 需 `value ≤ −60` **且**有 `casusBelli`（宿怨權重 ≥ 3 或作戰牌 `declareWar` 抽中）；離開 `war` 只靠停火條約。`hostile` (−60, −30]、`tense` (−30, −10]、`neutral` (−10, 10)、`friendly` [10, 40)、`allied` 需 `≥ 40` **且**有 `alliance` 條約，否則停在 `friendly`。離態門檻比進態寬 10 點（滯後），關係不會每天抖。玩家不在這張表裡：玩家與勢力的關係仍是單向的 `FactionState.rep`；玩家對外交的影響走 rep 與 `memory`（驅動表 `player-*` 列）。

## 條約 TreatyDef／TreatyState

```ts
type TreatyDef = { id: Id; kind: "ceasefire" | "nonaggression" | "alliance" | "trade" | "tribute" | "shell-pact" | "proxy";
  days: NumExpr; requires: { minState: RelState; cond?: Cond }; terms: OpsEffect[] /*簽約即生效*/; onExpire: OpsEffect[]; breakIf: Cond };
type TreatyState = { def: Id; signedDay: number; endDay: number; broken?: { day: number; by: Id } };
```

量級：停火 1–3 蝕月（到期回 `hostile`，期間 `weariness` 每日 −2）；互不侵犯 3 蝕月；同盟 6 蝕月、自動續約直到任一方拒絕；貿易＝兩方市場互列對方可售機型與 `priceMods` 折價；進貢＝每蝕月帳本流（弱方付、換 `nonaggression`）；古約＝共享古代機的研發（兩方都 `LineageOpened`，見研發檔）；代理＝A 出錢讓第三方（含玩家）打 B 的 `raid`，不曝光就不算戰爭行為。**背盟**：`breakIf` 成立（如 `nonaggression` 下對對方發起奪點）→ `TreatyBroken`、驅動表 `treaty-broken` 列、背者 `prestige −`。簽約與宣戰都是行動牌（`actor:"faction"`），`valid` 查 `relations`，所以一切變化仍走抽牌。

## 變化驅動

全部列在 [diplomacy-drivers.json](diplomacy-drivers.json)（17 列）。欄位：`id`／`trigger` 觸發時點／`delta` 數值變化（量級）／`decay` 是否進宿怨與衰減／`who` 作用對象／`note`。四類來源：**漂移**（每蝕月朝 `baseline` 回 2、宿怨半衰）、**地圖**（鄰接區域被對方的裂縫蝕化、共享裂縫威脅、同一古代機或裂縫的競爭）、**作戰結果**（奪點／圍城／曝光的襲擾、解圍、技術流出、取得新古代機）、**玩家**（選邊參戰、背盟、持古代機）。`baseline` 由內容 `affinity.json` 給每對（缺省 0；同文化 +10；內容標 `rivalry` 的宿敵對 −20），是世界不出事時的歸宿。

**防退化三道閘**：(1) 漂移回 `baseline` 讓無事件的對子回中立；(2) `weariness`：交戰每日 +1，≥ 40 後停火牌權重隨之放大，蝕壓高檔時再 +5／大潮——沒有永久戰爭；(3) `alliance-burden`：同盟 ≥ 3 個的勢力再簽盟權重 ×0.2、漂移多 −1——沒有全員同盟。測試斷言見 [war-testing](war-testing.md)。

## 對作戰生成的影響

作戰牌的 `requiresRelation` 查這張表：奪點／圍城／封港需 `war`，襲擾需 ≥ `tense`（`covert` 襲擾在 `tense` 下是代理戰爭，曝光才算宣戰行為），解圍只對 `allied` 或 `friendly` 且有 `alliance` 的對象。`allied` 對會成為同一作戰的 `coActors`（戰力相加、分贓按投入）。關係也改契約板：`hostile` 以上的勢力不互相開放市場與 `join`；`war` 雙方同時對同一作戰發 `join`（雙方皆可雇用）。勢力 `lifecycle.absorbedBy` 可由 `war` 下連續失去全部區域觸發（被吞）。

## 與 core 戰場陣營的銜接

core 只認 `FactionDef.relations: ally|neutral|hostile`（靜態）與情境 `slots[].allies`（情境層同盟，聯集後對稱化；`neutral` 在戰場算敵對）。營運層**不改 FactionDef**：`generateScenario` 把參戰各方映射到 slot（`player`／`ally`／`enemy`／`third`…），再依本檔的 `RelState` 填 `allies`：同一作戰 `coActors` 與玩家雇主 → 與 `player` 互為 ally；`friendly` 以上但未參戰者不上場；其餘全部敵對。所以戰場上只有「我方／敵方／失控」三種臉，複雜的外交留在地圖上——和 core 的「neutral 視為敵對」一致。

## 替使用者做掉的決定

1. **關係是一個值＋滯後離散態、同盟與戰爭都要條約或宿怨才進**：純數值會每天抖，純離散沒有「快要翻臉」的預兆。
2. **玩家不進關係表、只用 rep**：玩家是傭兵不是國家；選邊的後果全落在逐勢力聲望上，與既有設計一致。
3. **防退化用漂移、厭戰、同盟負擔三道閘**，不用硬上限：世界可以短暫大戰或大結盟，但會自己退潮。
4. **代理戰爭＝不曝光的襲擾**：給「被雙方雇用」一個規則化的灰色地帶，曝光機率吃玩家留下的痕跡。
5. **古代機與技術是外交籌碼**：取古代機引覬覦、流出結宿怨，把研發線與外交線綁在一起。
