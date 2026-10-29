# 一整個自身回合的移動額度

[命中與傷勢](combat-aim-injuries-1029.md)｜[全殲量測](demo-balance-1029.md)

## 使用者裁示與現況

機甲與怪獸平地一整個自身回合採五級：超重2、重3、普通4、輕5、超輕6。級別按機體／物種的體型、裝備與機動職責明示，不從grade推導，不假稱真實噸位。地形、負載、腿傷可降低；多次move、AP恢復或Wait不能重領額度。保持現有格距、斜走、部署與地圖，不靠拉近敵人偷補戰鬥節奏。

現有movement.moveAlong逐步只扣AP，reachable也只用AP當搜尋預算，所以AP高者一回合可走過多格。beginTurn已有resumed旗標，Wait續行不重置motion／defense，可用同一接縫重置移動額度。唯讀查rules真實位置寫入只有moveAlong，另一處是反應判定副本；reaper-charge是有射程的傷害能力，沒有位移，不可宣稱它是另有免費路程的衝刺。

## 型別與時效

FrameDef.moveBudget、SpeciesDef.moveBudget均選填非負有限數，未宣告使用content constants.moveBudgetDefault=4。FrameDef.moveLoadCapacity選填非負有限數；沒有校過重量的資料不宣告容量，不按0處理。若species日後承載配件，同一選填欄可用，但本輪無須虛構獸體載重。

MechState.moveSpent選填非負數，舊檔缺值視0。只在beginTurn(resumed=false)清零；Wait後resumed=true、AP回復／交換控制者／preview都不清。存讀保存已花額度，不能重讀回滿。新battle初始0；對舊存檔只保證欄位相容，不可能復原舊版本從未記錄的歷史位移。

species經state.ts的frameView手工轉FrameDef，必須傳moveBudget，否則怪獸資料失效。定義層／state／save不放函式或Map。

## 預算式與共用執行

base取frame/species moveBudget或default4。mass是各已裝slot中component.mass總和，壞掉但未卸除仍有重量；不臆測機體總噸數，也不把無質量資料的回收材料當已校準負載。只有明寫capacity時loadPenalty=ceil(max(0,mass-capacity)/moveLoadStep)，moveLoadStep由constants給5；capacity缺省時penalty0。

先依現有mobility／mobilityMinimum與rooted等狀態判能否移動，不能移動則effective=0。能移動時，integrity為目前移動類別相關部位的structural層現HP總和／原maxHP總和，包含已壞支撐部位的原HP分母；不以全身或裝甲HP代腿結構。若無structural定義則退回1，夾0..1。legacy未宣告mobility時取locomotion功能部位。

effective=floor(max(0,base-loadPenalty)×(.5+.5×integrity))。remaining=max(0,effective-moveSpent)，reachableBudget=min(APremaining,remaining)。這讓半損支撐部位降低路程，而全失支撐仍由原功能規則直接不能走。不是永久砍掉所有受傷機體相同格數。

每一步成本沿既有地形moveCost加上正高差成本，但最少1；不可通行仍null。stepCost與reachable內部搜尋必須同一算法，不能一邊min1另一邊免費。moveAlong在每一步前重算合法性、AP與moveSpent+stepCost≤effective，成功實走才同扣AP與增加spent；受反應打壞腿可中途停止，未走完部分不扣、不記motion。不得只在controller或AI限制move指令次數。

AI的reachable／pathTo／先移動再攻擊預覽都走同規則。這是普通移動上限，不限制分幾次走；4點可走2+2，不能2+2後回AP再走4。若將來新增真正衝刺，必須有資料宣告額外額度與實際AP／燃料等成本，不得由技能名稱、標籤或AI私有捷徑繞過。本輪不新做衝刺機制。預付閃避不改格座標、不重領移動額度，仍依既有腿功能與側方空間條件。

## 代表資料

frame明列moji-tern4、hound-mk2為5、bio-reaper4、ancient-rearguard3；battlefield-tank／missile-truck／engineer均3，battlefield-support4。再加frame bulwark-iv-rampart2、shellsoc-pin-04為6。species明列reaper4、spitter3、lancewing5、mite6、hinge-crab3、bulwark2，其餘暫用default4，不能說所有大量舊內容都逐台完成速度設計。

代表合計16份既有JSON，名稱對應content/base/frames或species下同名.json。城垣的mx-biped-heavy、盾陣與重甲雙背掛火力支持超重盾牆定位；LS-4自身etymology明說多目血統輕機先探路標記再撤回，並使用mx-biped-scout，支持超輕偵察機動定位。盾甲的quadruped-bulwark名為行城之軀、前牆360HP；蝕蟲的insect-mite全體層耐久僅60HP，分別作巨軀與小群獸代表。這些是配置依據，不拿S/B/D級代重量；同base仍受自身配件負載修正。UI可依明示base2..6標示五級，不增加enum或重量物理系統。

負載容量僅五台已有配裝者：moji8、hound8、tank12、missile12、engineer10。唯讀查現有裝配mass分別4、4、7、6、4，皆留明確餘裕；這是遊戲質量單位的初始設定，不假稱公斤或工程實測。其他frame缺欄不受負載懲罰。資料落既有content/base/frames、species與rules/constants.json，不寫死產品數值於TS。

## UI、檔案所有權與驗收

engine新增session.movementBudget(unit)純query：`{base,mass,capacity:number|null,loadPenalty,integrity,effective,spent,remaining,apRemaining,reachableBudget}`。UI顯「本回合移動剩N／有效M（平地約N格）」與地形、負載、支撐受傷原因，不自行重算。非平地餘3點不代表可走三格瓦礫；格子高亮與實走一致。

engine持core/types-def/state、schema、rules/state/movement/turn、sim/query adapters與測試；UI持上述JSON及vm/types/viewmodel、panels呈現。預估新增unique為movement-budget.test.ts一檔及尚未修改的至多四份frame/species；加上五級補齊的城垣、LS-4、盾甲三份既有資料，現約115–120估增至123–128，其他已修改路徑不重計。隊長按實數守140／25MB；不加新資產。

必要反例：AP9健康普通4只可走4；拆兩次指令仍總4；AP補滿不增剩額；Wait續回合不重設，下個真自身回合重設；五級健康平地2／3／4／5／6，怪獸資料經frameView不丟；瓦礫／上坡多耗額；缺capacity不懲罰，明示超載與腿結構受傷可解釋，腿全斷0；存讀剩額一致、preview不消耗、AI不越界。移動途中反應損腿後不能繼續用舊budget。

原25/25全殲結果屬舊移動歷史，不能沿用。新規格接好後重新量測原default4v4≤20回合一方原始四台全dead，並核正式頁remaining／reachable／實走同源。設計線未跑任何測試或新大批。
