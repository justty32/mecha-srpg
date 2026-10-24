# rules-turn-and-actions — 回合結構、速度排序、AP 與移動、行動入口

[core README](README.md)｜資料 [data-model-abilities-effects](data-model-abilities-effects.md)｜資源與效果時機 [rules-resources-effects](rules-resources-effects.md)

裁示：BB 式速度排序行動制（decisions 戰鬥十題前提）；AP 是人物的資源池、與機甲的池同機制（ToME 第 1 題）；資源在單位自己回合開始結算、全場輪邊界只處理全局事件（第 3 題）。

## 名詞

- **輪（round）**：所有存活單位各行動一次。**回合（turn）**：一個單位的行動段。
- **單位（unit）**：一個 `MechState`（含怪獸、棄機後的徒步駕駛員也是 frame=`infantry` 的 MechState）。
- **指令權者**：依 `controlMode` 決定本回合替該單位下指令的人物；AP 從他的池扣。

## 一輪的順序（CMB-01 採用）

1. **輪始**：`battle.round += 1`；跑全局事件（蝕壓變化、情境腳本、`clock.kind="rounds"` 的效果遞減）；spawner 族結算生成。
2. **排序**：每單位 `initiative = roleAttr(initiative of 指令權者) + frame.baseAttrs.initiative + contribs − fatigue.cur × k`（k 在 rules 常數檔），高者先；同分依 `unitId` 字典序（決定性）。本輪排序只算一次；輪中加入的單位排隊尾。
3. **逐單位回合**：對排序中每個未行動單位做 §回合流程。
4. **輪末**：未行動者（因效果跳過）視為行動過；清 Wait 旗標；寫 `RoundEnd` 事件。

## 一個回合的流程

1. **TurnStart**：若 `controlMode="contested"` 先做控制檢定；跑該單位與其座位人物的 `onTurnStart` 鉤子；資源更新（rules-resources-effects §時機）；`clock.kind="ownerTurns"` 效果遞減、歸零者撤除；冷卻 −1；護盾類層 regen。
2. **行動階段**：指令權者反覆下 `Command` 直到 AP 不足或選 End／Wait。`Command = Move | UseAbility | Wait | End | Eject | Retreat`。
3. **Wait**（CMB-02 採用）：保留剩餘 AP，移到本輪隊尾，本輪再輪到時**不再**跑 TurnStart 的資源更新；每輪只能 Wait 一次。
4. **TurnEnd**：跑 `onTurnEnd` 鉤子；sustained 能力的 drain 結算（TM-11）；寫 `TurnEnd` 事件。

## AP 與移動

- AP 是人物池 `ap`（`capKind:"hard"`、`regen` 回滿到上限、上限受疲勞與傷勢的 contribs 壓低——CMB-03 改造：疲勞回復在本人 TurnStart 固定量，不裁切）。
- **移動**：`Move(path)` 逐格結算（CMB-06 改造）：每步成本 `terrain.moveCost[locomotion] + 高差成本`，付不起整步不扣、停在上一格；每步進格後依序：觸發 `onEnter` 效果 → 檢查 reaction 能力（機會攻擊，`trigger.event="enemyLeavesAdjacent"`）→ 若被打死／被定身則停止。`locomotion` 由 body plan 中 `functions` 含 `locomotion` 的部位決定；全部毀損＝只能 Wait／End／Eject。
- **控制區（ZoC）**：相鄰敵方單位的格子離開時觸發 reaction；尋路偏好成本與實扣分離（CMB-06）。

## 行動入口：玩家與 AI 同一條（TM-22、AI-04）

```ts
function tryCommand(state, cmd): Result<Event[], Rejection>
// 順序：① 合法性（指令權、單位存活、能力 require） ② 目標合法（範圍、LOS、friendly、部位可瞄準）
//      ③ 成本可支付（所有 costs 一起判，soft 池看 allowOverload） ④ 扣成本、起冷卻、寫 AbilityUsed 事件
//      ⑤ 執行（命中→層序列→效果→傳導） ⑥ produces 入池 ⑦ 回傳事件；Rejection 帶原因碼給 UI 與 AI
```

- **預覽**：`previewCommand(state, cmd)` 用同一條路徑在複製的狀態上跑，**無副作用**（修正 BB DAT-02 原版預覽有副作用）；AI 估值用它。
- **失敗政策**（TM-08／TM-54 合成）：① ② ③ 任一失敗＝不扣任何東西；④ 之後的失敗（未命中、目標消失）**不退費**。

## 反應能力 reaction

`mode:"reaction"` 的能力由事件觸發：`enemyLeavesAdjacent`（機會攻擊，CMB-07 改造：挑該單位 AP 最低的合法近戰能力、免費執行）、`attackedAndMissed`（反擊，CMB-08：同一動作只觸發一次，`oncePer:"action"`）、`allyTargeted`（掩護）、`layerBroken`（自動開盾）。反應不消耗 AP、但消耗其宣告的其他池；每個事件每單位每回合至多觸發 `trigger.oncePer` 所限次數。

## 替使用者做掉的決定

1. **同分先攻依 unitId 字典序**：決定性重播需要，不另擲骰。
2. **輪中加入的單位排隊尾**（spawner 子體、入場援軍）：避免中途重排造成「被插隊」。
3. **Wait 每輪一次**：BB 相同；阻止無限延後。
4. **移動不足整步不扣、停在上一格**：BB 行為，玩家可預測；AI 尋路用相同成本表。
5. **反應能力不消耗 AP**：BB 機會攻擊免費；若要有限制，用 `oncePer` 與其他池成本，不動 AP。
