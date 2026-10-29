# 最小完整可互動戰場（2026-10-29）

[核心規格](core/README.md)｜[執行計畫](../plans/playable-battlefield-1029.md)

**新版優先：**舊命中僅歷史；命中、2–6格移動與≤10回合重創依[核心導航](core/README.md)，物件仍依本文。

## 方案與取捨

既有featureHp僅初始化，attack.ts未扣地物hp；沿用destructible.becomes補結算。正式情境與營運接線檔見plan。Fable尺寸／常駐修正／取得路徑三題不代決。

早期候選保留加減式命中與原本 RNG，新增內容常數 `attackAccuracyBonus`，引擎缺省0，base包候選值15。固定奈洛比情境實測：距離3普通身體57→72%、同武器指定部位42→57%、距離6瓦礫36→51%；每類同200 seed實抽分別108→138、80→108、68→99次命中，極差射擊仍不保證命中。只對敵對命中公式加一次；友方／self既有100%不變。此段是已被取代的候選量測，不再據此調值。

可破壞格遵循既有 scenario 核心提案：cell、ball、line攻擊的受影響格，各吃一次傷害包總和；單體 unit/part 以unit為目標時不傷腳下地物；一般傷害武器也可明確用cell選可破壞格，見下方新裁決。範圍選格與單位選取共享幾何規則，格子排序採row-major，避免重複扣血。第一版只用既有傷害 amount，無機甲抗性／外甲倍率、暴擊或地形命中骰；對固定地物命中100%。非傷害能力不傷地物。命中單位與地物是各自獨立結算，不能因單位 miss 讓整個爆炸不傷牆。cone沿用同幾何亦可支援，但驗收至少涵蓋cell與ball。

血量歸零即換成已解析的 `becomes` 地形並發 `FeatureDestroyed {x,y,from,to}`；非致死發 `FeatureDamaged {x,y,amount,hp}`。新地形可破壞則初始化其hp，否則移除該格featureHp。後續LOS、通行與命中即讀新地形。掩體35變瓦礫15時，對該格單位的下一次相同射擊增加20百分點（仍受上下限）；不再另給「破壞掩體」加成。既有瓦礫 leg/track成本2、hover/flight成本1保留；不把瓦礫做成純貼圖。

最小版不實作額外倒塌傷害與新抗性表；這兩項是原提案的選填擴充，第一版資料不填，不能宣稱已有。

## 引擎與畫面凍結契約

在 `src/core/types-def.ts` 匯出 `BattlefieldObjectDef = {id:string; name:string; kind:"pickup"|"wreck"|"corpse"|"debris"; at:Cell; effects?:EffectRef[]; salvage?:Record<string,number>; debris?:number}`，`MapDef.objects?: BattlefieldObjectDef[]`。`src/core/types-state.ts` 匯出 `BattlefieldObjectState = BattlefieldObjectDef & {collected?:boolean; sourceUnit?:Id}`；`MapState.objects?: BattlefieldObjectState[]`。缺省空陣列保留舊存檔相容，全部為可JSON化資料。MapDef→BattleSetup.map→MapState必須完整複製，不共享可變陣列。

新增 `Command = {kind:"interact"; actor:Id; object:string}` 分支。物件效果是既有EffectRef；可拾取收益可為effects、salvage或debris；三者皆無才僅檢視。互動限定目前可行動的單位，在同格或八鄰格（沿用distance≤1）、物件未領取且含實際收益；沿用控制權與戰局結束檢查。先驗證物件、距離、效果引用與成本，再扣 `battlefieldInteractApCost`（base值1，舊包缺省1），透過既有applyEffect套給actor，標記collected並發 `BattlefieldObjectCollected {unit,object,x,y}`。重複、越界、不足AP拒絕且不改狀態／RNG；預覽在clone上執行，不能先吃掉補給。

pickup首件使用新 `effect/battlefield-resupply`，onApply走實際資源變更verb，以 `do:"pool", owner:"mech", pool:"charge", delta:20` 回復燕鷗已有charge池並受max限制；效果數值走JSON。不能重用僅emit `FieldResupplyRequested` 的 `effect/bf-field-resupply`：該資料本身不構成補給實效。缺乏對應池、已滿且沒有其他有效收益時禁用拾取並告知原因；不可讓UI顯示補給成功而池不變。

UnitDied後以穩定id `remains:<unit-id>` 新增一次物件，runtime.monsters存在者kind=corpse，其餘非徒步機體kind=wreck；保留sourceUnit與死亡位置，不覆蓋地形、不佔行動序列、不增加勝負目標。徒步死亡不生成「機甲殘骸」。依使用者新裁決，機械殘骸回收stock:scrap，怪獸屍體回收stock:flesh；數量走內容常數，不發部件或生物改裝資格。重播、存讀與重複死亡通知不得重複生成。

UI在CellView增加選填 `featureHp` 與 `objects` 呈現欄（具體畫面型別由UI線持有），讀state.map.objects並濾collected。物件可與活單位同格，格內顯示種類標記，詳情可查看全名／遺體來源／補給作用；按鈕送上述Command，交既有session.submit。仍遵守VM→DOM邊界，不從DOM import rules。地圖原有全圖地形情報不縮限；死亡遺體只在玩家目擊死亡或該位置重新可見時公開，不能從sourceUnit洩漏迷霧內敵軍死亡。

## 立即可做的支援與拆牆資料

`frames/battlefield-support.json` 沿用bodyplan/infantry（沒有slots，不硬塞components），innateAbilities指定新 `abilities/battlefield-support.json`「支援爆破彈」：ball、radius0、range1..4、los=true、friendly=no、person AP2、kinetic20、accuracy20、produces空、require空。搭合法既有人物pilot，在player slot可正常指揮；兩發可拆40hp壁壘，對單位仍擲命中。這提供可指揮支援攻擊；普通武器明確點牆的支援也必須落地。展示補給放在燕鷗能接近的位置，scenario初始charge低於max，拾取後能立刻看到charge增加20。

## 使用者即時裁決：實際回收與一般武器打地物（優先契約）

一般傷害能力useAbility的target只填cell且該格可破壞，代表明確打地物；checkAbility允許原unit/part型能力此目標，不要求part。照常檢查能力、控制權、成本、射程、LOS，結算只打地物，不順帶選格上單位。UI必須在一般武器目標模式提供可破壞格，不能只靠爆破技能繞過需求。無packets的技能不得打牆。

MapState另有選填 `salvage:{object:string;fromUnit?:Id;owner:FactionSlot;materials:Record<string,number>}[]` 與 `debrisAmmo:Record<Id,number>`，缺省空。interact拾取debris時把內容宣告數量加actor碎石彈數；拾取wreck/corpse時記帶owner的salvage並collected，不重複發效果。三種物件全部有用途：瓦礫提供投擲碎石、殘骸提供scrap、屍體提供flesh。

新增Command `{kind:"throwDebris",actor:Id,target:Id}`；同一行動入口驗證可見敵對目標、距離、LOS、AP與碎石數，成功耗一份碎石並造成實際kinetic傷害（沿用層結算），不得換成憑空buff。AP／射程／傷害與回收量放constants；可用初版候選AP1、range3、damage12、每瓦礫堆debris1、殘骸scrap5、屍體flesh5，未量測前不宣稱平衡。碎石取得不摧毀整格瓦礫，單一堆領完不可無限重生；地物首次崩塌可生成穩定id的debris物件一次。

`rules/flow.ts battleResult()`把已拾salvage轉既有loot，loot項新增選填owner?:FactionSlot、collected?:boolean，已拾來源帶兩欄且collected=true；舊loot缺省維持舊語意，營運只收玩家所得，明確回收不綁winner（撤離也應保有已帶走材料，具體沿用營運戰果政策）。`src/ops/sortie/apply.ts`已有材料驗證、stock入帳及容量溢出stash；需接owner過濾與去重。怪獸既有拆／留整屍選擇不得對已回收屍體再發整屍：用回收sourceUnit判斷，已拆材料一次入庫，跳過該屍體延後選項；不得把fromUnit改成假id規避。既有玩家機甲部件殘留回收亦須比對避免同一材料發兩份。營運／引擎線需共同驗證同一結果只結算一次。

這些是本輪最低交付，僅顯示物件不算完成；Fable三題仍不受改動。命中+15三類分布量測見上方；預覽與實際chance同公式，另有崩塌改掩體後預覽回歸。
