# rules-attack-resolution — 命中、部位、層序列、傳導、傷害修正鏈

[core README](README.md)｜層與部位資料 [data-model-mech](data-model-mech.md)｜效果資料 [data-model-abilities-effects](data-model-abilities-effects.md)

裁示：可指定部位（付依武器精準度的懲罰），不指定依暴露權重隨機；同一擊沿層序列結算、擊穿的層當下失效、再依部位與層的傳導效果結算駕駛員（decisions 第 3、4 題）；層 HP 預設磨損裝甲、可宣告 `ablative=false` 成不消耗減傷（ToME 第 6 題）；傳統兵器對怪獸傷害十分之一（世界規則）。

## 一次 UseAbility 的結算管線

```
① 選目標格/單位 [+part]  ② 命中骰  ③ 選部位  ④ 對每個 DamagePacket：修正鏈 → 沿層序列
⑤ 層/部位毀損鉤子  ⑥ 傳導到座位人物  ⑦ 能力 on:hit / on:miss 效果  ⑧ 死亡/毀損/士氣檢定  ⑨ 事件
```

每步都寫事件（architecture §事件日誌），UI 與測試讀事件、不讀中間變數。

## ② 命中（CMB-09 改造＋TM-47 不採用曲線）

`hitChance = clamp(accuracyRole(攻方指令權者) + ability.accuracy + 距離修正 + 高差修正 − evasionRole(守方) − terrain.cover − partAimPenalty, 5, 95)`，擲 `rng.d100 < hitChance` 命中。區間常數在 `rules/constants.json`。沒有「盾擋骰」：盾是層（CMB-10 改造）。遮擋：射線上有單位時依 `blocksLos` 與遮擋規則改目標，散射不做（CMB-11 改造：只保留換目標、不做未命中散射）。

## ③ 選部位

- 指定部位（`cmd.part` 且 `ability.partAim.allowed`）：命中懲罰 `partAim.penalty`（通常引用武器精準度），選中即該部位。
- 未指定：在**未毀損**部位中按 `exposure × 姿態修正 × 攻擊方向修正` 加權抽一個；全毀則擊中 `core` 功能部位（若也毀則單位早已死亡）。
- `ability.ai.targetPref.parts` 只影響 AI 要不要指定，不影響規則。

## ④ 傷害修正鏈（CMB-14 改造，節點固定、內容在資料）

對每個 packet 依序：`amount` 求值 → 攻方 `onHit` contribs（倍率）→ **全局修正表** `rules/damage-modifiers.json`（每列 `{sourceTag, targetTag, factor}`；內建一列 `conventional-arms × kaiju → 0.1`，即十分之一規則，不解釋）→ 暴擊（TM-49 改造：`crit` 機率成功則 ×critFactor）→ 守方 `incomingReduce` contribs（TM-45）→ 進入層序列。

## ④ 沿層序列（核心演算法）

```
remaining = packet.amount
for layer in part.layers（由外到內，跳過 broken）:
  if packet.layerFilter 且 layer.type ∉ layerFilter: continue        // 例：EMP 穿過 flesh 只打 shield/component
  pass = remaining × layer.passThrough[type]                             // 先分出直接穿過的部分
  hit  = remaining − pass
  hit  = hit × (1 − max(0, layer.resist[type] − packet.resistPen))       // TM-41/42 材質抗性與穿透
  if layer.ablative:
      absorbed = min(hit, layer.hp)；layer.hp −= absorbed；remaining = pass + (hit − absorbed)
      if layer.hp == 0: layer.broken = true；fire onLayerBroken[type]、conduct(when=layerBroken)
  else:
      remaining = pass + max(0, hit − reduce.flat) × (1 − reduce.pct)     // 不消耗的減傷層（護盾力場、能量膜）
  fire layer.onHit、conduct(when=layerHit, layer)                        // 不論是否擊穿
  if remaining <= 0: break
if 本部位所有 structural 層 broken: part.broken = true；fire part.onBroken；conduct(when=partBroken)
溢出的 remaining 丟棄（不傳給下一個部位）
```

**護甲穿透**：`armorPen` 把一部分傷害改走 `passThrough`（`pass += hit × armorPen`，上限 1）——BB 的「穿透傷」與 ToME 的 apr 統一成同一旋鈕（CMB-13／TM-48 合成）。層被擊穿後**當下失效**：同一擊後續 packet 與之後所有攻擊都跳過它，直到修理或 regen 把 hp 拉回 >0（護盾類）。

## ⑤⑥ 毀損鉤子與傳導

- `onLayerBroken`／`onBroken` 的效果清單決定後果：腿毀→`locomotion` 功能喪失效果；感測器毀→感測半徑 contribs −；武器掛架毀→其上部件能力不可用；生物內臟毀→`bio-acid` 池 regen 轉負……全是資料。
- `ConductRule` 依 `when`／`layer` 匹配，對 `to` 指定的座位人物擲 `chance` 後掛 `effects`：座艙殼層被擊穿→駕駛員 `injury:temporary` 候選表抽一條、重擊再擲永久傷機率（decisions 第 5 題）；生物機甲 flesh 層受創→承擔量＋（意志承擔橋段）；古代機甲核心層受創→共鳴值暫時下滑……人物死亡＝座位清空，單位依 `controlMode` 轉由另一人物或 `soul` 控制，都沒有則成為無人單位（可被捕獲／回收）。
- 單位**死亡**：所有 `core` 功能部位毀損，或情境宣告的致死條件。怪獸「核」就是 core 功能部位的 organ 層。

## ⑧ 後續

命中後：守方士氣檢定（部位毀損、重傷事件）、XP（CHR-17 改造：擊殺者獨享 60%、其餘平分給同 slot 在場單位；常數可調）、連鎖事件（spawner 母體死亡→子體 `tether` 處理）。

## 替使用者做掉的決定

1. **命中採 BB 門檻＋上下限，不採 ToME 攻防差曲線**：門檻式數字對玩家透明、與部位懲罰相加直觀。
2. **不做未命中散射**：BB 的散射有 BusyStack 問題且對大規模戰場計算貴；留 `blocksLos` 遮擋換目標。
3. **溢出傷害不傳到鄰接部位**：讓「打穿一個部位」有明確上限；想要貫穿效果用 `line` 目標型。
4. **armorPen 統一成「改走 passThrough」**：一個旋鈕同時表達 BB 穿透與 ToME apr。
5. **十分之一規則放在全局修正表而非程式**：使用者說「這是世界規則」，用一列資料表達，想改 0.1 改數字即可。
