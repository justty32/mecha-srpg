# data-model-economy-research — 帳本、庫存、市場、債、科研、機魂天賦樹的「開／練熟」

[ops README](README.md)｜世界觀來源 [world/mech-lifecycles](../world/mech-lifecycles.md)、[world/machine-souls](../world/machine-souls.md)｜人物資料在 [core/data-model-people](../core/data-model-people.md)

裁示：機械系靠科研靠錢、吃營運能力；機魂天賦樹吃錢（科研方向）與時間（陪伴）；錢只有一種「幣」、開局背塞勒涅船債、每潮月付息（world 暫定裁示）。數值只給量級。

## 帳本 Ledger（唯一改錢與存量的路徑）

```ts
type Account = "cash" | "debt" | `stock:${string}`;              // stock:core-<grade> / stock:flesh / stock:chitin / stock:scrap / stock:mycelium / stock:fuel / stock:ammo-30…
type LedgerEntry = { seq: number; day: number; account: Account; delta: number;
  reason: string; ref?: Id /*contract／event／sale／repair job*/; counter?: Account };
type Ledger = { entries: LedgerEntry[]; balances: Record<Account, number> };
```

規則：(1) **所有**幣與存量變動只能經 `post(entry)`；`balances` 是 `entries` 的折疊，測試重算必相等（帳本守恆）。(2) `cash` 可負（欠薪、欠港費）但 `stock:*` 不可負（`post` 拒絕並回傳失敗，由呼叫端決定政策）。(3) 進出對沖：買賣寫兩筆（`cash` 與 `stock`，互填 `counter`）；外部來源（契約金、戰利品）寫一筆、`reason` 必填來源事件 id——不變量測試檢查每筆外源都有對應 `CampaignEvent`。(4) `debt` 是負債帳：每潮月第 1 天 `post(debt, +principal×rate)`；付款 `post(cash,−x)`＋`post(debt,−x)`。存量單位：裂晶「核」按等級分 `stock:core-D..A`；材料按族（`flesh`／`chitin`／`mycelium`）；`scrap` 是摹機通用料，也是拘束器維護與屍體改裝的材料；`flesh` 兼作蟲族／獸族吞屍的屍體（不另設帳）；`fuel`（氦與電合併成一池，簡化）。

## 實物庫存 Inventory（有身分的東西不進帳本）

`inventory: { components: ComponentInstance[]; mechs: Id[] /*MechState 在 hangar*/; relics: RelicInstance[]; tickets: { airstrike: number; restraint: number } }`。`ComponentInstance = { id; def: Id; layerHp?: number; origin: "loot" | "bought" | "made"; boundTo?: Id }`——戰場撿的部件保留戰損 HP（CHR-19 問題的答案：**不另加隨機折損**，戰損本身就是折損）。容量看 `ShipState.capacity.cargo`（體積＝Σ `ComponentDef.size`）；超過不能起航，不會自動丟。

## 市場 MarketDef 與價格

```ts
type MarketDef = { id: Id; node: Id; lists: { kind: "component" | "frame" | "carcass" | "fuel" | "material" | "ticket" | "soul-rental"; items: { def: Id; weight: number; stockMax: number }[] }[];
  priceMods: { tag: string; mult: NumExpr }[]; refreshOn: "quarter" /*弦月*/; buysBack: boolean };
```

價格＝`basePrice × 狀態折價（部件按剩餘層 HP 比例、機甲按各部位加總＋機體整備係數）× 勢力 rep 折扣 × 節點局勢（`NodeState.flags` 查 `priceMods`）`。弦月刷新：清庫存、以當天 seed 重抽；玩家賣出的實物不保留（BB OPS-10 原意，簡單）。核的售價隨等級指數上升（D 數十、C 百餘、A 數千幣量級）；核同時是古代機甲的修理材料與屍體改裝的動力——這是「賣、修、還是裝屍」三方的衝突點；`carcass` 列賣整屍（黑市，供屍體改裝）。

## 債 Debt 與塞勒涅催收

開局 `debt` 約 20 個潮月薪水量級、利率每潮月 5% 量級。利息日付不出：`debt += 利息`、塞勒涅 rep −；連續 2 潮月未付 → 世界行動牌 `collection-visit` 有效（白手套事件鏈：先談、再扣押一台機甲、最後是一場戰鬥）。還清債務不是終局，只是少一個雇主的耐心。

## 科研 ResearchDef（開節點、解鎖項目）

```ts
type ResearchDef = { id: Id; name: string; direction: string /*cooling／sensing／restraint／soul-calc／soul-hand／soul-heart／graft…*/;
  cost: { coin: number; techHours: number }; requires: Id[]; consumes?: Record<Account, number> /*例：stock:core-C 1*/;
  unlocks: ({ kind: "component" | "modification" | "service" | "soul-node"; id: Id })[] };
type ResearchState = { def: Id; hoursDone: number; coinPaid: boolean; done: boolean };
```

科研是**工時池**的用途之一：每天技師（人物 `tags` 含 `technician`）各產 `techHours`，玩家把工時分配給「修理」「科研」「移植」「育魂」四條佇列（見 [data-model-roster-repair](data-model-roster-repair.md)）。科研項目滿工時且付幣即 `done`，解鎖的 `component` 進型錄可買／可造、`modification` 是對既有部件的改裝配方、`soul-node` 是機魂天賦樹節點的「可開」資格。沒有科技樹分支鎖；`requires` 只是前置。

## 機魂天賦樹：開（科研）與練熟（陪伴）

core 的 `SoulTreeDef` 節點有 `cost.research`／`cost.companionship`；營運層把它拆成兩個動作：**開**＝對應 `ResearchDef` 完成且付幣 → `soulTree.nodes.push(node)`，節點 perk 掛上但熟練 0；**練熟**＝每天一個「時段」由一位人物執行 `陪 <機魂>`，該機魂 `companionship += 1`，玩家指定正在練的節點（或預設最早開的）`mastery += 1/needHours`，到 1 為全額。`mastery`、`trust` 都是**營運層狀態**（`RosterState.mastery[soul][node]`、`RosterState.trust[soul][person]`，core 的 `WillState.soulTree` 沒有這兩欄、也不需要）：出戰時由 `Sortie.injected` 翻成 contribution——節點 perk 的貢獻 × mastery、`contested` 檢定加 trust 修正（[battle-interface](battle-interface.md)）。副作用：陪伴者 `trust += 1`；陪滿 N 時段有機率抽一條性格特質。塞勒涅租賃與複本機魂：所有節點 `mastery = 0`、`trust` 空；租金每潮月計入 `cash`。**育魂**＝一條特殊佇列：空魂核部件＋工時＋幣，一個潮月量級完成 → 新 `PersonDef(kind:"soul")` 實例，三根方向各一個根節點已開、零練熟。

## 替使用者做掉的決定

1. **單一 Ledger、balances 是折疊**：守恆測試只需重算；BB 的「帳本與倉庫分流」保留為 `stock:*` 與 `Inventory` 的分界——有身分的進 Inventory，可數的進帳本。
2. **部件回收保留戰損、不加隨機折損**：少一個玩家看不見的骰子。
3. **氦與電合併成一個 fuel 池**：兩種燃料只會讓採買選單變長。
4. **mastery 乘在貢獻上、不另造機制**：「開了不等於熟」用 core 既有的 contribution 乘法表達。
5. **科研無分支鎖、只有前置**：天賦樹的「選方向」在機魂節點上，摹機科研保持扁平好讀。
