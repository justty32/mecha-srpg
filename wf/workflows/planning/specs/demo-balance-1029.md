# 預設交戰節奏歷史契約

**最高驗收已由 [十回合全殲或全員重傷](demo-severity-1029.md) 取代；本文二十回合目標僅歷史。**

**最新命中／傷勢與防禦由 [combat-aim-injuries](combat-aim-injuries-1029.md)／[combat-defense](combat-defense-1029.md) 覆蓋。下列舊+15、核心曝光A/B及其數值候選只保留歷史比較，不再作實作契約；原4v4及真死亡證據仍保留，時間與重傷目標依上方新契約。**

[執行與量測](../plans/demo-balance-1029.md)｜[戰場底座](playable-battlefield-1029.md)

## 目標與不可替代條件

預設 `scenario/skirmish-whitegloves` 雙方積極進攻，在20回合內由正常勝負規則分出勝方。保留原4名玩家機體／人物及4台core:false遠控燕鷗、原地圖與部署區、部位、掩體、兵種差異。不能換弱對手、刪敵人、偷偷改部署，也不能把20回合timeout計作成功；本輪量測不要求雙方50%勝率，但要公開勝負分布與玩家一面倒的風險。

目前情境rounds20只是截止：`rules/objectives.ts` 會設winner:null/reason:timeout。探針以scenarioToSetup的opts.rounds=60觀察真終局，產品仍不得以延長截止冒充20內成功。最高驗收為終局round≤20，原始4v4至少一方四個原始unit全部status=dead且各有UnitDied、該方alive=0；winner非null、reason非timeout只是必要非充分。60回合仍未全殲另列未達。宣稱僅限已驗seed，不保證任何任意seed或消極玩法。

## 唯讀證據與根因候選

燕鷗charge初始60、regen10，輝光連吼每發消耗15/AP3、傷害22、heat15，因此資源耗完後平均射擊頻率受限；這是資料算式，不是已觀察空轉。機體baseAttrs沒有accuracy，敵方遠控又沒有person；現有roleAttr因此從0起算。玩家有約50–55的人物accuracy，不能把同一燕鷗frame加accuracy修遠控，否則玩家一併飽和到95。

berserk策略積極追近，但攻擊估值主要是固定分加距離，不比較真實傷害／成本，可能偏好頭吼8傷而非主武器。tactical會估計部位、擊殺與效果收益，也可能保命、撤退、支援；故主驗使用公開固定的積極tactical參數，berserk僅交叉診斷，不能擇最好看的結果報告。

## 最小準度接線契約

改 `src/rules/contribs.ts` 的roleAttr及相關單檔測試，新增ScenarioDef.rules.scriptedAccuracyBase選填，經sim/run.ts傳到BattleSetup.rules、flow.ts寫RulesRuntime局部override；constant同名缺省0，只在 `content/base/scenarios/skirmish-whitegloves.json` 設候選45，其他情境原值0。只有role=accuracy、沒有person、controlMode=scripted、frame.baseAttrs未顯式宣告對應accuracy屬性時，使用runtime局部override ?? constant ?? 0作機體基礎；再保留既有contrib加減。若原實作以unitAttr已計contrib，可在原值上加fallback，不能Math.max抹去負面修正。

真人／機魂駕駛、instinct怪獸、已有明確accuracy（包含顯式0）的frame均不適用。這是無人物控制準度的缺省值，不是假人物、不是新對手，不改roleAttr其他角色。一般attackAccuracyBonus=15維持既有已量值，不再雙重提高。距離／掩體／精準部位懲罰與5–95上限都保留。若新值仍不足，候選40、45、50用相同小樣本比較，不能任意推至必中。

不採AP band補準度或component attrMods，避免語意隱藏與Fable待決題。

## 硬剛的可重現定義

正式情境的player與enemy都指定下述aiprofile，使用同一組參數：band1、attackRatio0、holdRatio0、retreatMinRound999、retreatForceRatio0、retreat0、ejectBelow0、waitScore0、endScore0.0001、attack2、attackArea2、disable1、heal0、buff0、protect0、survive0、dangerK0、reposition0.3；另加intentMinRound999、commanderScatter0、humanCommanderScatter0、pilotFleeHp0、individualFleeHp0、rotateRounds0。其餘候選數／預覽seed／AP規則沿引擎預設。策略優先推進與輸出，不為避險扣分、不自願撤退；保留部位擊殺評估與合法射程。不修改battle state讓人憑空回AP或越牆。

士氣效果、失控與武器／腿損壞仍生效；本demo明定不可撤離，記錄士氣崩潰而不讓離場充當勝利。新增 `content/base/aiprofiles/demo-hardclash.json`，policy tactical、params為上述固定組；default情境兩slots.ai均指aiprofile/demo-hardclash。正常預設頁觀戰使用同一profile，玩家手動仍自由。probe必須讀正式profile，不再私覆policy/params；單位policy未有額外覆寫就不改。抽3場舊tactical與berserk只作附加診斷，不作主要成功證據。

## 數值調整順序與邊界

已取得實測反例：單seed regen15為25回合，升radiant30反而60timeout，cleave28僅24回合。停止輪流抬槍／降敵準度，採 [核心致命比例證據與A/B候選](../../dispatch/handoffs/playable-design-1029/core-lethality-evidence.md)：共同local45／regen15／radiant22／cleave20，A四個原編組bodyplan核心exposure1→2；B加核心最後結構層HP75%。保留外甲、部位戰術、抗性與原4v4，固定三seed比較後才擴樣本。共享影響13定義與精確檔案見證據；這不是只改demo的局部效果。

不得用每回合強殺／流血、把失能算死或取消凡鐵抗性來過關。預期主要樣本10–16回合留餘裕、最慢20；尚未跑新候選，不能宣稱已做到。

## 三組比較

A為原數值bonus0／遠控缺省0，B為此前bonus15／遠控缺省0，C為bonus15／demo局部缺省與最小節奏調整。三組用相同正式hardclash與noRetreat，另報原tactical對照；A/B用可追溯loader副本，不回退共享工作樹。混合場重甲已由隊長派改扣甲C，常規步兵須核凡鐵標籤，不利用誤當精粹穿甲過驗收。

## 硬剛契約補洞：勢力意圖不能偷撤

已回報45準度三seed在9回合enemy勝、卻有3 retreat／1 death，這不是硬剛通過證據。`planIntent`的intentMinRound預設8獨立於舊retreatMinRound，會按戰況或預估無法取勝切全隊retreat。上述六個新profile值分別關閉勢力放棄、首領死亡潰散、低HP主動逃離與輪替；rotateHp/rotatePool0仍擋不住負面效果或shaken觸發，須rotateRounds0。此999只覆蓋本輪20／60回合驗證，不宣稱無限回合禁撤。

最新使用者裁示優先：不接受任何撤退或棄機作硬剛勝利，採既有BattleSetup.noRetreat。新增 `ScenarioDef.rules.noRetreat?:boolean`（缺省false），`sim/run.ts scenarioToSetup`傳到setup.noRetreat；flow既有初始化存runtime並由retreat規則拒絕離場。僅default demo設rules.noRetreat:true，brief公開「正面交戰，不撤離」；其他情境保持原樣。schema新增選填boolean，不新增勝負判定或強制處決。

A/B/C三組全部用同noRetreat與正式profile，不能只C禁撤而宣稱傷害改善。profile ejectBelow0與六意圖參數保留；任何retreat/eject指令或對應離場事件都不合格，包括士氣fleeing造成的離場。撤回retreatOnBreaking提案，不新增該參數。士氣效果仍照常，policyFor仍可能令fleeing單位逃向邊緣停留；若拖慢戰局照實算未達標，不偷偷關士氣。

## 全殲而非離場的證據

固定初始每slot四個unit id，逐場輸出alive、dead、retreated、derelict、captured及Ejected事件數；dead按唯一id計，不能把召喚物／棄機步兵拿來湊四死。至少一方原始四台全部dead且各有UnitDied；retreat/eject皆0，失能仍活、士氣崩潰、據點與timeout皆非全殲。勝方可以傷亡，重點是敵方四台真正死亡。不得新增回合傷害、強殺或勝負捷徑。
