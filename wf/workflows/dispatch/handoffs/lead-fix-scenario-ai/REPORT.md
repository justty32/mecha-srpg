# REPORT — lead-fix-scenario-ai（2026-10-24，頂層代存）

STATUS：DONE。commit：`316fe34` 程式與測試、`415f786` 交接書與文件。工人 REPORT：[cx-fix-seams](cx-fix-seams/REPORT.md)、[cx-fix-ai](cx-fix-ai/REPORT.md)。

## 做了什麼
- (a) slot 同盟：`ScenarioDef.slots[].allies?`（新增）∪ FactionDef `ally` 關係 → BattleSetup.allies → RulesRuntime.allies（對稱）→ `hostileSlots()`；`hostile()`、AI（`src/ai/hostility.ts`）都走它；eliminate 只計敵對 slot；rift-edge-nest ally 加 `allies:["player"]`；FactionState.faction 改填 def id。
- (b) killTarget：內容 `target`（def id）由 `scenarioToSetup` 翻成 `units`／`unit`；全部死才達成；未知目標 throw。
- (c) `battle.tide`／`battle.light` 可求值；destructible 格初始化 featureHp（feature hp 優先）。
- 附帶：hooks.test 永久替換 spawn verb 造成 rift 重播測試污染，改成 finally 還原。
- AI：根因＝未接敵時 move 收益恆 0、Wait 固定 +0.02 必勝（改前 19 次出手全是自我增益）。waitScore 0.02→0；dangerK 0.05→0.01 且只扣增量危險；未接敵朝地圖中央偵察。
- 量測腳本 `src/sim/measure.ts`。

## 平衡前後（skirmish 20 輪；Wait 比例＝wait／單位回合）
| seed | 改前 | 改後 Wait | 改後勝負 | 命中／死亡 |
|---|---|---|---|---|
| 1 | 1.00／平手 | 0 | 平手（時限） | 67／3 |
| 2 | 1.00／平手 | 0 | player（17 輪） | 52／3 |
| 3 | 1.00／平手 | 0 | player（17 輪） | 56／4 |
| 4 | 1.00／平手 | 0 | player（20 輪） | 66／3 |
| 5 | 1.00／平手 | 0 | player（18 輪） | 60／3 |
| 6–10 | — | 0 | player 3、平手 2 | 47–75／2–3 |

十分律：skirmish 沒有 kaiju，未套用；預估與實際傷害抽樣一致；規則不改。

## 測試
npm test 297/297（本線 +12）；check 0 errors；typecheck 0。黃金 8 個未變。sim hash skirmish seed 1 `f754e05183afd077`→`0613183bba2e5c5f`（AI 選招改變）。

## 沒做到
地物受損機制（spec 未定）；AI 不會主動 Wait；十分律對 kaiju 的壓低程度未量。

## 需要決定的事（頂層 2026-10-24 處理）
1. 世界 neutral 在戰場算敵對 → 維持（頂層定，使用者可推翻）。
2. `allies`、killTarget 翻譯、地物受損補進 spec → 交 plan-spec-sync。
3. skirmish 敵方 10 seed 0 勝 → 試玩後定。

## 以後交接書該點名的工具
`node src/sim/measure.ts [scenario] [seed…]`
