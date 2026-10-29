# 最小近戰防禦：真承傷、有限招架

[命中與傷勢](combat-aim-injuries-1029.md)｜[多部位分配與部分遮擋](combat-part-hits-1029.md)

## 實作範圍

本輪真正實作，不只設計；不加反擊或連段。增量預估8–9unique檔：rules/defense.ts與測試、新component/battlefield-shield、新ability/battlefield-parry、新effect/battlefield-off-balance，既有mx-guard-stance、mx-guarding、mx-singing-blade與playable-battlefield示範情境；部分已在本輪改動，隊長以unique實數控140。core／schema／attack／turn／sim／UI沿既有所有權。

## 凍結型別與時效

AbilityDef.defense選填 `{kind:"block"|"parry";charges:number;maxImpact:number;maxSizeRatio:number;damageFactor?:number;onOverload?:EffectRef[]}`。MechState.defense選填 `{ability:Id;kind:"block"|"parry";part:PartId;charges:number}`。準備時挑有效部位：block需真存活shield層；parry需完整手臂及仍可用melee配件。無資格拒絕、不扣費。先付能力AP，準備直到下個自身回合開始清除；重開替換而非疊加，存讀保留。顯示種類、承傷部位、剩次數與失效時點。

## 單一命中判定之後的防禦

幾何命中未中不消耗準備；已命中後防禦不再擲骰。取攻方bodyRadius/守方bodyRadius與未經守方裝甲減傷的傷害包amount總和，分別對maxSizeRatio/maxImpact。合法block將命中改送盾臂，沿真shield→臂甲層結算；盾破的超額仍沿同部位向內，不免費蒸發。合法parry僅限近戰range≤1且kinetic/pierce實體傷害包，改送武器臂並乘damageFactor；不能招架光束或遠砲。

每次成功防禦消耗一charge；盾／武器／手臂破立即失去後續防禦。超尺寸或衝擊則原目標照傷、清準備並套onOverload失衡。普通射擊／格擋／招架不是三重獨立骰。主動閃避仍只影響那一次幾何命中，須完整移動功能、側移空間與預付AP／燃料／熱，裝甲最後按實際承傷部位處理。

## 精確資料

battlefield-shield為weaponMount size1/mass3/mechanical/hp20，abilities含mx-guard-stance，pools空、tags shield。layersAdd在left-arm insertAt0放shield層hp60、ablative true、structural false、kinetic resist.2／pierce.1、passThrough空。只在正式playable-battlefield的燕鷗left-weapon配盾，components同時明列原right-weapon mx-radiant-rifle、armor-mount mx-porcelain-plate，不改default skirmish原裝備。

盾陣原AP3/CD2保留，defense為block／charges2／maxImpact60／ratio2／onOverload battlefield-off-balance；移除mx-guarding的evasion假盾，最多留無contrib的badge。新parry為self/友方、AP2/CD1，packets空，defense為parry／charges1／maxImpact35／ratio1.5／factor.5／同overload，ai protect1。既有mx-singing-blade.abilities追加parry，仍需真可用武器與手臂。

off-balance為mech、ownerTurns2、refresh，accuracy-10、maneuver乘0，無額外AP傷害，確保跨到下一次自身回合有可見代價。當前回合到下次自身回合的效果時鐘要測，不把一開始就過期的badge當失衡。

## 驗收

預付防禦後才可承傷，未準備時不攔；盾層HP真減／破盾／臂可受超額傷；連續命中耗盡兩次準備；招架對近戰實體有效、遠射／光束／過大衝擊不合法，過載有失衡。斷盾臂／武器後不能重開；預覽與實判一致、存讀一致。UI必顯示本次幾何命中率與若命中由何部位防禦，不能把「必中」誤寫成必傷原瞄準器官。所有新功能尚待實作與隊長排程測試。
