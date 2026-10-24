# battle-interface／apply-result — 戰果回寫 applyBattleResult（八組回寫欄位）

[battle-interface 入口](../battle-interface.md)｜[ops README](../README.md)｜core 出口 [core/rules-battle-flow](../../core/rules-battle-flow.md)（`BattleResult`）

## 三、戰果回寫 applyBattleResult

`applyBattleResult(campaign, sortie, result: BattleResult) → (campaign', CampaignEvent[])`，純函式。**回寫欄位**共八組，逐組如下。

**`units[].status`／`state`**：`alive` → `MechState.parts`／`pools`（戰鬥限定池不存在於機甲；`heat`（燼）等依 `PoolDecl.decayCurve` 歸基線；`ammo*` 池由停泊時的補給補滿，見經濟檔）原樣寫回機庫；`dead` → 殘骸：拆成 `LootBundle`（可回收部件保留層 HP、材料進帳本），古代機甲 `dead` 改為 `dormant`＋`grudge`；`retreated` → 同 alive；`derelict-recovered` → 回機庫，座位清空；`derelict-lost` → 從機庫移除、寫 `LostMech` 事件（勢力記憶：競爭獵團可能撿去）；`captured` → 新 `BeastState(kind:"live", wear:0)`，拘束艙無空位則留在該格的 `wreckage` 一天；可拘束族的 `dead` 可改選**留整屍**（`CarcassState`，占一位，供屍體改裝）。

**`persons[].status`／`state`／`xpGained`**：`alive` → 原樣寫回（傷勢、hp 池、共鳴、`burden` 依內容包衰減或歸零、soulTree 不變）；`xpGained` 已含在 state 的 `xp`，營運層只在回船時結升級；`dead` → `RosterState.dead`、全團 mood −1、該人 `boundTo` 部件留下、認主機甲 `dormant`。

**`loot[]`**：`components` → Inventory（戰損 HP 保留）、`materials` → 帳本 `stock:*`（每筆 `reason` 帶 `result.log` 的 hash）；容量不足的留在 `PlaceState.wreckage`（野外格掛 `maps[].wreckage[cell]`），**下一天**仍可取、再過一天消失（CHR-20 答案）。

**契約（`ContractState`）**：`heads` 按有效戰果計（`UnitDied` 事件中敵方單位、同一單位只算一次，不算部位）；目標完成 → `done`、付尾款（`cash +`）與 `onComplete`；失敗 → `failed`；部分成功 → 半額。

**裂縫（`RiftState.phase`）**：敵方 `anchor` 單位 `dead` 或 `captured` → `unanchored`；`seal` 類情境勝 → `sealing`；**`opening` 期**清剿勝且先鋒全滅 → 直接 `closed`（快照 `phase` 接約當天凍結；拖過第四天照 `opening` 打但半額、關不掉已 `anchored` 的）；游態巢母死 → 刪 `opening` 候選。

**聲望（`FactionState.rep`）**：契約模板與事件表的 `rep` 變動；在城邦邊使用空援／艦砲誤傷設施 → 城邦 rep −。

**耗材（`Inventory.tickets`）**：`airstrikeTickets` 按 `AbilityUsed` 事件實際使用數扣；拘束矢按 `capture` 能力使用數扣。

**記錄（`CampaignEvent`）**：`{type:"BattleResolved", payload:{sortie, hash(result.log), rounds, winner}}`，重播用。
