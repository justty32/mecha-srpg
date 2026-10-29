# 幾何命中與base傷勢：實作凍結契約

[近戰防禦](combat-defense-1029.md)｜[多部位命中](combat-part-hits-1029.md)｜[二十回合全殲](demo-balance-1029.md)｜[每回合移動額度](combat-movement-1029.md)

## 範圍與所有權

本輪實作，不只提案。engine持有core型別／registry／schema／rules／sim與純查詢；UI持有7bodyplan、指定frame/species/ability/effect JSON與ui-adapter。舊核心HP／曝光試驗不採為最終方案，先還原原值再建立真功能與傷勢。估總unique產品125–135，接近140，隊長逐批計數；不擴DF完整器官、反擊、連段或新物理引擎。

## 命中是中心對齊的等效圓近似

新增BodyPlanDef.targetRadius選填（格，缺省1），PartDef.targetRadius選填（缺省bodyRadius×.35），AbilityDef.aim選填 `{dispersion,trackingDelay,projectileSpeed,windup?}`。三主參數缺省constants為.08/.1/20，近戰windup缺省.8。前者表示每格距離的散布／追蹤延遲回合／每回合格數，不宣稱是真實物理尺寸。

MechState.motion選填 `{dx,dy}` 是本次自身回合實際moveAlong移動的累積位移；自身回合開始清零，保留到下次自己回合。只記實際完成路徑，部分阻擋不算未走完部分。純JSON存讀一致；舊檔缺值即0。射線方向以Euclidean單位向量，distance仍沿現有格距。vPerp=min(1.5,abs(cross(motion,shotDirection)))，直衝／直退橫分量0。

新增attr maneuver；vEff=min(2,vPerp+max(0,maneuver))。失去locomotion時vEff=0；主動maneuver還要求存在可通行、未占用側移鄰格，不能穿牆或憑空穿人。這是預付閃避能力的可用空間，不再重扣AP，也不要用已扣光AP後的reachable結果取消預付迴避。舊evasion不再直接扣命中。

skill=clamp(50/max(1,roleAccuracy),.5,2)。射擊r=(distance×dispersion+vEff×(trackingDelay+distance/projectileSpeed))×skill；近戰時間項改windup。指定部位再將r乘(1+partAim.penalty/100)，普通不指定不加此項。R=選中body或part半徑×sqrt(1-clamp(terrain.cover/100,0,1))。r≤R且R>0時chance100，否則100×(R/r)²；R=0為0，不設5%底或95%頂，不疊舊accuracy-evasion公式或+15。友方／self既有100保留。

完全遮蔽（cover≥100）單位目標與原LOS阻擋在checkAbility拒絕；地物自身仍能選作破壞目標。已有los=false越障能力保留其射線規則，不憑空揭露迷霧敵人。100%預覽必須實際命中，不偷偷加第二次miss骰。命中後才走部位層、裝甲與抗性。

## 等效尺寸與能力資料

7bodyplan整體半徑：biped-standard1、biped-light.85、insect-reaper1、ancient-warden1.25、alien-spitter.8、insect-lancewing.7、battlefield-ground-vehicle.65。core部位為body×.6；一般頭／sensor×.22、臂／鐮×.32、腿×.4、翼×.5。例外：reaper腹×.45；飛翼crown×.22、sting×.25、lantern×.4；車turret×.45、tracks×.5；吐棘三腿各×.3。這是露出目標尺度，不是佔格碰撞。

kx-thorn-snipe精確射擊aim=.06/.08/30；mx-radiant-shot與shell-lance=.08/.1/20；kx-thorn-volley與kx-acid-sting=.12/.15/12；mx-singing-slash、reaper-cleave、kx-wing-dive近戰windup.8。原partAim.allowed不支持者本批允許，原penalty已存在則保留，新增預設10；部位差異主要由半徑、遮蔽、橫移和狀態導出，不是每處同一扣分。

mx-flaring去掉舊evasion15，改maneuver1.5，既有閃身AP1／flare-fuel1／heat10不改。近距大目標仍可能100%，遠距小部位和付費迴避才降低；不能把機動宣稱為無條件必中閃躲。

## 功能必須真的關閉

BodyPlanDef.abilityParts選填 `Record<Id,{parts:PartId[],min:number}>`，abilitiesOf按有效body定義篩選：指定器官完整數不足就不可用，preview與command共用。鐮肢cleave／charge綁兩scythe至少1；古代shell-lance綁right-arm1；吐棘volley／snipe綁thorn-crown1；飛翼dive綁兩wing至少2、acid-sting綁sting1。裝配武器仍走既有武器層／掛載臂毀損規則。未映射能力維持舊語意，不影響未遷移base。

PartDef.mobility選填LocomotionClass陣列；BodyPlanDef.mobilityMinimum選填各類所需完整部位數，缺省1。標準／輕型／鐮肢／古代腿為leg；車tracks為track；吐棘三腿leg且minimum2；飛翼兩翼flight且minimum2，無腿不憑空給leg。flight失效但真有健全leg者才可落地走。拾石／投擲至少一個真完整manipulator，無手車不能把車體當手；回收與補給另沿既有工具互動。

## 生體流血與機械失能

PoolDecl.vital選填boolean，僅unit vital池耗盡以正常killUnit／UnitDied流程結算。blood池max100、initial100、regen0、hard、非inverted，給frame/bio-reaper及species/reaper、spitter、lancewing。機械和未宣告循環的其他共享frame不自動長血池。

六新effect：injury-bleeding-light/heavy為scope part、perPartSeparate true、permanent、refresh，contrib blood.regen分別-6/-12，tags bleeding；sensor為mech永久refresh，accuracy-15/perception-2；cooling為mech永久refresh，heat.regen+10；power為mech永久refresh，charge.regen-8；stabilized為mech ownerTurns1，onApply remove tags bleeding、不回血。無對應池者跳過相應傷勢且query不報假後果，不能拋錯。

生體非core頭／腹輕出血，鐮／翼／腿重出血；由onBroken觸發，完好者不流血，core毀損沿直接死亡。止血ability battlefield-stabilize AP3/CD2、友方unit range0..1、LOS、always套stabilized，不長回肢體。授予爆破班與bio-reaper及上述species；無核心班的basicAbilities白名單僅解除可用性過濾，不授全體此能力。AI是否會善用要另驗。

機械兩種雙足head onBroken sensor；各新增真radiator（armor10/structure20，radius.25，exposure.5，function cooling）與power-unit（armor15/structure25，radius.3，exposure.5，function power），各onBroken對應effect。車只新增radiator armor10/structure15、radius.2/exposure.5，無charge所以不新增假power損傷。古代warden無charge，不套泛用power；其右臂損毀禁源光、腿斷失移動是本批真差異，不能只貼無效debuff。

## UI與必驗反例

session.partTargetInfo回chance、aim `{radius,error,distance,lateral,maneuver,cover,skill}`、layers `{type,hp|null,max}`、functions、disabledAbilities、effectsOnBreak ids、mobilityAfter、fatalOnBreak（clone斷部位後isDead）。不是UI將function文字翻成假效果。敵方仍沿即時／最後所見與未知HP遮罩，不直接洩漏完整state。

驗近距大部位100且實骰不miss、直衝不額外橫閃、側移與付費閃避有收益但無腿／無空間不能用、遠小部位較難；預覽不改motion/RNG。驗真斷器官禁技能、雙翼斷墜地失flight、三腿斷兩不能站、斷臂不能抓、受傷血耗盡真死／止血停止／機械不流血、傳統機械冷卻供能失效與古代不冒充同池。存讀與重播一致，再重跑原default4v4≤20一方四個原始id全dead。新契約尚在實作，不能拿舊曝光試驗冒充驗收。
