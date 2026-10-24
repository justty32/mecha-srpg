# data-model-beasts — 生物系營運：拘束艙、活捕與屍體改裝、磨損與失控、族別維持、命名

[ops README](README.md)｜世界觀來源 [world/mech-lifecycles](../world/mech-lifecycles.md)、[world/monsters](../world/monsters.md)｜名冊與佇列在 [data-model-roster-repair](data-model-roster-repair.md)

裁示（2026-10-24）：生物系分**屍體改裝**（無意識、安全、開銷大、不會成長）與**活捕**（有意識、**無馴化**、捕到直接上拘束器硬壓；同調／承擔／暴走保留）；怪獸意識**不是人物**，以機體側資料表達；**沒有餵養**——不設飼料、飢餓、畜欄；族別例外：蟲族、獸族吞屍保持活性，異形、菌絲另定；生物系的營運主軸是**對抗怪獸、防止失控**（拘束器維護、失控風險管理）。

## 拘束艙 RestraintBay（取代第一版的畜欄概念）

```ts
type RestraintBay = { slots: (Id | null)[] /*活捕獸與屍體各占一位*/; beasts: Record<Id, BeastState>;
  carcasses: CarcassState[]; myceliumRoom?: { layers: number; growth: number; lastPrune: number } };
type BeastState = { mech: Id; kind: "live" | "corpse";
  wear: number /*拘束器磨損 0..100，只 live*/; vitality: number /*活性 0..100，只 live*/; sustainDue?: number /*族別維持到期日*/;
  bond: Record<Id /*person*/, number> /*同調 0..100，只 live*/; nextMolt?: number; nextMutate?: number; broodDay?: number };
type CarcassState = { id: Id; species: Id; grade: Grade; parts: MechState["parts"]; decayPerDay: number; slot: number };
```

船上房間 `restraint`（拘束艙）取代 `stable`；容量欄 `capacity.restraintSlots`。怪獸意識不佔座位、不是 `PersonState`：牠的「意志」就是 core 機體上的 `instinct` 池與 `burden` 宣告，牠的「行為」就是族的 `aiProfile`——營運層只管拘束器狀態與族別維持。

## 活捕：拘束、磨損、失控

**捕到即入艙**：`BattleResult` 的 `captured` → `BeastState{kind:"live", wear:0, vitality:100}`，沒有馴化期；要出戰只需至少一個拘束裝置 `install`（族方案不同：蟲族殼釘有型錄件、獸族軛鞍、異形量身工時三倍）。**磨損**：牠每天都在掙，`wear += wearPerDay[grade]`（量級 D 3、C 5、B 8、A 15／天；受傷或剛失控過的 ×1.5）。`wear ≥ 50`：警戒，出戰時注入 `instinct` 起始值 `+ (wear − 50)/2`（取代第一版「飢餓推高本能」）；`wear ≥ 100`：**掙脫事件**（BB 式三選：硬壓——技師工時、有人受傷的機率，`wear → 60`；放走——除名、鄰近裂縫 `fedCount` 不計；殺——進 `carcasses`）。**維護**：工時佇列 `kind:"restrain"` job（工時與 `stock:scrap` 隨等級），完成 `wear → 0`；這是生物系的日常保養，與修理搶同一群技師。**同調** `bond[person]`：共同出戰每場 +；戰場上 `burdenLimit × (1 + bond/200)` 注入；`bond ≥ 60` 解鎖「獸性」特質抽取。**族行為**（只對宣告的族）：獸族 `molt`（`nextMolt` 到期且本潮月有 `sustain`，蛻皮窗口內不可出戰、拘束裝置全部失效需重裝）；蟲族 `brood`（巢母每大潮生 1 隻 D 入艙，殘聯視同養裂）；異形 `mutate`（每潮月第 1 天重抽 `partsOverride`，但只在本潮月有潮浸時）。

## 族別維持 Sustain（不是餵養：一潮月一次的族行為）

`beasts/<family>.json` 宣告 `sustain`，全族共用、D–A 只差量。

**蟲族、獸族 `devour`**：每潮月一次把屍體丟給牠——動詞 `投 <獸> <數>` 扣 `stock:flesh`（量級 D 1、C 2、B 4、A 8）；到期未投 `vitality −25`；`sustainDue` 重設到下個大潮。

**異形 `tide-soak`（替使用者做掉的決定）**：牠靠裏側的潮而不靠肉——大潮日船停在蝕化節點（淺蝕以上）或與 `anchored` 裂縫相鄰，`vitality → 100`、當潮月可變異；錯過一個大潮 `vitality −20`。於是帶著異形就得定期開進危險的地方。

**菌絲 `prune`（替使用者做掉的決定）**：共生層與菌房不需任何補給、自己會長；維持＝**修剪**：每潮月一個 `prune` job（工時小、無材料），不剪則共生層往駕駛艙部位 `layersAdd`（傳導傷到人）、菌房兩潮月不剪蔓延到機庫（事件、工時損失）。

**活性歸零**：`vitality ≤ 0` → `Stiffened` 事件，`BeastState` 轉 `CarcassState`（同一位）：拘束器與同調作廢，只能 `mount` 或拆材料。

## 屍體改裝 Mount

來源：戰果 `dead` 且族可拘束的單位，回寫時三選——拆（`LootBundle`）、留整屍（`CarcassState`，占一位，`decayPerDay` 讓肉層上限每天 −10% 直到開工）、或活捕獸僵死。`kind:"mount"` job：工時 `base × gradeMult²`、材料 `stock:scrap × k` 加**一顆同級以上的核** `stock:core-<grade>` 當動力（屍體沒有自己的核，所以與賣核、修古代機甲競爭）。完成 → `BeastState{kind:"corpse"}`，機體資料 `frames/corpse-<species>.json`：`cls:"bio"`、**無 `instinct` 池、`burden` 為 0**、肉層不再生、`controlMode` 與摹機相同。**不會成長**：無 `bond`、無族行為、無二名積累；可 `graft`（移植）與 `install`。保養：每潮月 `embalm` job（防腐，工時＋`stock:scrap`），否則肉與內臟層上限每潮月 −10%。D／C 可改裝但費用高過一台同級摹機——「通常只用於高級怪獸」是價格造成的，不是硬規則。

## 生物系的命名

生物系預設沒有名字，`FrameDef.name` 只顯示族名；稱號走 `RosterState.names[mech]`，每筆多一欄 `kind`：

- **登記號 `registry`**：入艙時自動依 `beasts/<family>.json` 的 `registryPattern` 編（例：`犬-03`、`蟲-11`），不含畜欄類字眼。
- **小名 `nickname`**：用久了才有——同一駕駛員同調 `bond ≥ 40` 或出戰滿 10 場時 `prompt`「給牠一個小名」（候選從 `names/nick-<family>.json` 抽 3＋自填）；屍體改裝也可取（技師取）。
- **凶名 `dread`**：外人給的——累計殺敵或進城事件達門檻時由勢力事件 `nameMech` 寫入（例：潮信會叫牠「吃鐵的」）。
- **二名 `epithet`**：**A 級以上才有**，野生時就帶（`MonsterDef.epithet`，例：崖牙「赤眼兇星」），捕獲後沿用、`by` 填 `wild`；B 以下永遠沒有。

顯示順序：二名＋小名 > 小名 > 登記號；`看` 列全部。

## 替使用者做掉的決定

1. **磨損取代飢餓**：第一版「飢餓推高本能」改成「拘束器磨損推高本能起點、滿了掙脫」——同樣是每天累積的壓力，但主詞是對抗不是照顧。
2. **族別維持一潮月一次、不是每天**：蟲獸吞屍、異形潮浸、菌絲修剪都綁大潮節拍，避免退化成日常餵食。
3. **異形靠潮浸**：讓異形成為「要開進蝕域才養得住」的機甲，與沙盒航行掛鉤。
4. **菌絲靠修剪**：它的問題從來不是活不下去而是長太快，維持機制因此是壓制而非供給。
5. **屍體改裝吃一顆核當動力**：把「開銷大」落在最稀缺的資源上，與古代修理、賣核三方競爭。
6. **活性歸零不是死亡而是僵死成屍體**：給玩家一條「活捕失敗→屍體改裝」的回收路。
7. **稱號分四 kind、二名綁 A 級**：沿用 `names` 多稱號結構，不另造欄位。
