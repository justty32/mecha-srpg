# rules-resources-effects — 資源更新時機、閾值帶、效果時鐘、疊加、屬性貢獻

[core README](README.md)｜資料 [data-model-mech](data-model-mech.md)、[data-model-abilities-effects](data-model-abilities-effects.md)

裁示（decisions ToME 八題）：AP／疲勞是人物池、同一機制；上限分 hard／soft、熱量預設 soft；再生在該單位回合開始；效果時鐘預設按受影響單位回合遞減、可改全場輪；效果帶 scope、同名故障依部位分開；屬性採逐筆加減、按編號撤回（TM-34／TM-50）。

## 資源池實例與求值

`PoolState = { cur: number; max: number; regen: number; band: number }`。`max`／`regen` 是**派生值**：每次任何 contribs 變動（部件裝卸、效果掛撤、部位毀損）後對該單位重算；重算只重算受影響的 path（contribs 以 `path` 索引），不全量重建（不採 BB CMB-16 全重算）。

**時機**（TM-04 改造）：在該單位 **TurnStart** 依序：① 對每個池 `cur += regen`（人物池與機甲池都算）；② 有 `decayCurve` 的池再 `cur += (baseline − cur) × rate`（TM-05）；③ 夾限：`hard` 池 `clamp(min, max)`；`soft` 池只夾 `min`，超過 `max` 的部分留著進超載帶；④ 重算 `band` 並掛撤帶效果；⑤ `cur <= min` 且有 `onDepleted` → 掛效果、撤除 `removeOnZero` 的 sustained（TM-12）。輪邊界不碰單位池。

## 閾值帶 PoolBand

```ts
type PoolBand = { from: NumExpr; to: NumExpr | null; effects: EffectRef[]; label?: string };
```

池值落入哪一帶就掛哪一帶的效果（互斥、自動切換、效果 `clock:"whileSource"`）。燼（`heat`）soft 池的典型帶：`[0,max)` 無；`[max, 1.25max)` 燼滯（性能懲罰）；`[1.25max, 1.5max)` 燼爆（每回合隨機部件受損（`onTurnStart` 鉤子 `damage` 動作，`layerFilter:["component"]`））；`≥1.5max` 停機（`setControl: "disabled"`）。承擔池、本能池、轉速池都用同一結構，內容包填不同帶。

## 成本與產出

`costs` 在 `tryCommand` ③ 一次判定全部：一般池 `cur − amount >= min`；反向池（`inverted`）`cur + amount <= max`，若 `allowOverload` 且 `capKind:"soft"` 則放行（TM-07）。`produces` 在執行後入池，同樣受 hard／soft 夾限。sustained 能力：啟用時鎖住 `sustain.lock` 的量（`max` 減少而非 `cur` 減少，TM-10），每 TurnEnd 扣 `drain`（TM-11），池見底依 `removeOnZero` 撤除。

## 效果時鐘

| `clock.kind` | 遞減點 | 撤除點 |
|---|---|---|
| `ownerTurns`（預設） | 受影響單位 TurnStart | 遞減到 0 的那個 TurnStart、在資源更新**之前** |
| `rounds` | 輪始 | 同上，輪始 |
| `uses` | 每次被 `onHit`／`onBeingHit` 鉤子消費 | 歸零即撤 |
| `days` | 營運層換日 | 同上 |
| `whileSource` | 不遞減 | 來源（部件、帶、sustained、地形格）消失即撤（CMB-19／TM-35） |
| `permanent` | 不遞減 | 只有 `remove` 動作依 tags 清除 |

受影響單位＝效果 `scope` 所在容器的單位：`part`／`layer`／`mech` 看機甲，`person` 看人物所在單位（人物不在單位內則在營運層以 `days` 處理）。`cell`／`faction`／`battle` scope 一律用 `rounds`。

## 疊加（CMB-21＋TM-29 合成）

套用同 id 效果到同一容器時依 `stack.policy`：`refresh` 重設時鐘；`stack` 新增一個實例直到 `max`；`merge` 以 `mergeOp` 合併量或時長成一個實例；`ignore` 不動；`separate` 永遠各算。`scope=part` 且 `perPartSeparate` 時以（效果 id、部位）為鍵；同一輪內剛加入待安裝（pending）的效果再被加入時直接忽略（CMB-18/21 行為）。

## 屬性貢獻 Contribution 的套用與撤回

每筆貢獻在掛上時分配遞增 id、存進容器 `contribs`；撤除依 id 刪除後重算該 `path`。運算順序：先全部 `set`（取最後一筆）、再 `add` 相加、再 `mul` 連乘、最後 `min`／`max` 夾。路徑可指向：人物屬性、機體屬性、池的 `max`／`regen`、層的 `resist`／`regen`、能力的 `accuracy`／`cooldown`。同一來源（source id）被移除時其全部貢獻連帶撤除（TM-35）。

## 鉤子分派順序

同一事件觸發多個效果鉤子時依（效果 `order` 欄→效果 id 字典序）排列（CMB-15 採用），`order` 預設 100。鉤子執行中新增的效果進 pending、移除的標 garbage，本事件結束後才安裝／回收（CMB-18）；新加入者不補跑本事件。

## 替使用者做掉的決定

1. **派生值局部重算、不全量重建**：大地圖多單位時全重算太貴；代價是 contribs 要以 path 索引。
2. **帶效果用 `whileSource` 時鐘且互斥**：切帶時自動撤舊掛新，不需內容包手寫撤除。
3. **sustained 鎖住的是 `max` 不是 `cur`**：ToME 原意，讓「撐著光幕就少一截流光可用」直觀。
4. **效果撤除在資源更新之前**：讓「中毒最後一跳」發生在上回合、不與本回合再生打架。
5. **pending 效果再加入直接忽略**：沿用 BB，避免同一事件內遞迴刷新。
