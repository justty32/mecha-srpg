# rules-people — 士氣、傷勢、共鳴、承擔與失控、機魂成長、控制權

[core README](README.md)｜資料 [data-model-people](data-model-people.md)｜效果機制 [rules-resources-effects](rules-resources-effects.md)

裁示：BB 階段制士氣（動搖／崩潰／逃跑）掛駕駛員上、不做 SRW 氣力；傷勢分暫時與永久（機率）；古代機甲自己選主人、主人的意志與信念共鳴；生物系看意志是否堅韌、承擔愈多愈強、超限發狂敵我不分；機魂是另一個駕駛員、天賦樹靠科研方向與陪伴；機械系裝異系部件同樣觸發。

## 士氣（BB 階段制）

階段 `steady → shaken → breaking → fleeing`，每降一階掛對應效果（命中／AP 上限 contribs 遞減）。**檢定**由 `morale-events.json` 宣告的事件觸發：`moraleCheck(dc)`＝擲 `d100 < resolveRole + contribs − dc` 成功則不動，失敗降一階；成功且處於非 steady 時，連續兩次成功升一階（回穩）。`fleeing` 單位由 AI 接管移動（即使是玩家單位，AI-16 改造），朝最近 `exits` 逃，到邊即撤離（視為 Retreat）。機魂的士氣事件由其內容包決定；預設包裡機魂對「友軍陣亡」免疫、對「感測器毀損」「訊號干擾」檢定。承擔超限、看見同族被捕等事件也可宣告在表裡。

## 傷勢

座艙傳導命中駕駛員時（rules-attack-resolution ⑥），從 `injuries.json` 以傷害類型與層種類過濾候選、加權抽一條 `injury:temporary` 效果；若該擊對人物 HP 類池造成的量 ≥ `permanentThreshold`（常數），再擲 `permanentChance` 成功則改抽 `injury:permanent`。暫時傷 `days` 時鐘由營運層遞減；永久傷只能被 `cleanse` 類效果移除（CHR-10/11）。人物沒有獨立 HP 數字：人物 `hp` 是一個 hard 池（`inverted:false`、`onDepleted`＝死亡），讓傷害、治療、持續傷都走池機制。

## 共鳴（古代系的人機關係）

```ts
type ResonanceReq = { beliefs: string[]; threshold: number; deeds?: string[]; rejects?: string[] };
```

`resonance[frame] = (|beliefs ∩ person.will.beliefs| + Σ affinity + deedsDone) / (|beliefs| + |deeds|)`，再被 `rejects` 命中的標籤扣到 0。這是**門檻與加成**：古代機體的 `innateAbilities` 在 `require` 寫 `resonance >= threshold`；`resonance-band-*` 效果給加成。古代機甲「自己選主人」＝只有共鳴 ≥ threshold 的人物能進駕駛座（`seat.require`），其他人坐進去只能移動與基本行動。共鳴值在戰鬥中可被事件推動：`deeds`（例：在此機體上完成某情境目標）由營運層／情境寫入 `WillState`；戰鬥內受創（核心層）可暫時 −（效果 contribs）。裝古代**部件**同理：部件的 `resonance` 不達標時其 `abilities` 不可用、`attrMods` 不生效（嫁接裁示）。

## 承擔與失控（生物系的人機關係）

生物機體／生物部件每回合把 `burden` 求值加到指令權者 `WillState.burden`（TurnStart）；被宣告為「承擔推高」的能力（例：`tags:["burden-push"]`）可主動再加。承擔池用 `PoolDecl` 表達（`id:"burden"`、`inverted:true`、`capKind:"soft"`、`max = will.burdenLimit`），帶：`[0,0.5max)` 無；`[0.5max,max)` 怪獸力量加成Ⅰ；`[max,1.5max)` 加成Ⅱ＋每 TurnStart **失控檢定** `moraleCheck`-同式但以 resolve 對 `(burden − max)/max × k`；`≥1.5max` 直接失控。**失控**＝效果 `berserk` 的 `setControl:"berserk"`：單位移到情境的 `berserk` slot、由 `ai` 以 `aiProfile=berserk` 接管、對所有陣營敵對（敵我不分）；每 TurnStart 擲回穩檢定，成功或 burden 掉回 `<max` 則恢復原 slot 與 controlMode。承擔的衰減走 `decayCurve`（toward 0），離開戰鬥後營運層決定是否歸零。古代部件與生物部件同裝一台時兩套同時算，互不抵銷。

## 機魂成長與控制權

機魂天賦樹 `SoulTreeDef = { id; nodes: { id; perk: Id; cost: { research?: number; companionship?: number }; requires: Id[]; direction: string }[] }`。營運層每日累加 `research`（科研方向投入）與 `companionship`（駕駛員或科研人員陪伴時數，吃營運時間），解鎖是純資料檢查。節點的 `direction` 標籤（例：`autonomy`、`assist`、`tactical`）會影響：`controlMode:"contested"` 的控制檢定（autonomy 節點數加到機魂方）、機魂能否單獨駕駛（需至少一個 `autonomy` 節點）、`shared` 模式下機魂可代出手的能力集合。**控制檢定**：`d100 + pilot.control + contribs` 對 `d100 + soul.control + autonomyNodes × k`，贏者本回合握指令權；輸方仍可用自己的 `actorRole` 能力。失去駕駛員（死亡／棄機）時機魂若可單獨駕駛則自動接手，否則單位癱瘓。**2026-10-24 晚裁示：機魂不能獨駕、不可複製**（world spec `machine-souls.md`）——目標規則是失去駕駛員即癱瘓、`autonomy` 只留在控制檢定；引擎現行的單獨駕駛判定列在 engine-backlog，落地前內容不要再寫要獨駕的樹。

## 戰後延續

人物離開戰鬥時：`fatigue`、士氣效果、`burden`（依內容包衰減）、`uses` 時鐘效果清除；`hp` 池、傷勢、共鳴值、機魂樹保留（CHR-16 改造：不補滿、不重置永久傷）。

## 替使用者做掉的決定

1. **人物 HP 也是池**：讓「傷害傳到駕駛員」與其他池更新共用一條規則；池見底＝死亡。
2. **共鳴是比對出來的分數、不是手填數字**：信念標籤讓營運層的對話／事件能自然推動共鳴。
3. **失控是換 slot 與 AI profile、不是新規則**：所有「敵我不分」行為由 ai 的 berserk 策略與既有能力表達。
4. **承擔超限分兩段**：先檢定後必失控，保留「賭一把」的熱血橋段又有硬天花板。
5. **控制檢定用 autonomy 節點數當機魂籌碼**：讓天賦樹方向真的影響戰鬥中的人機關係，而非只加數字。
