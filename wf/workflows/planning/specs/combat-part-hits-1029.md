# 單次攻擊命中多部位

[命中與傷勢](combat-aim-injuries-1029.md)｜[防禦](combat-defense-1029.md)

## 本輪實作與現況證據

使用者要求一次攻擊可傷多部位，本輪實作。原resolveAbility每個受擊unit只pickPart一次，所有packets打同部位；area是多unit而非多part。conduct主要傳人物／座位，不代替部位擴散。保留不宣告partPattern的單點攻擊，不做全彈道或無上限連鎖。

新增 `src/rules/part-hits.ts` 與同名測試；其餘core/types-def、schema、attack/layers/defense、sim/session、UI及三ability／七bodyplan皆在既有修改集合。現況unique約112，預估114–118，不超140；隊長仍按實數核算。engine持有邏輯與型別，UI線持內容JSON與畫面。暫停新20seed大批，完整新契約接好再量原4v4全殲。

## 資料型別

AbilityDef.partPattern選填聯集：spread為 `{kind:"spread";fractions:number[];selection:"adjacent"|"exposed"}`；fractions長2–3，每值非負、第一值正、總和≤1。penetrate為 `{kind:"penetrate";maxParts:2|3;falloff:number;selection:"adjacent"}`，0<falloff≤1。未宣告維持單點，不能因為有多packet自動多打一份傷害。

BodyPlanDef.partAdjacency選填 `Record<PartId,PartId[]>`。資料視為無向圖、對稱化並去重，未知id與自連在content驗證拒絕。穿透只能沿有效圖相鄰關係逐段推進，沒有圖／合法鄰居即停在主位，不能按id跳到遠器官。選鄰居時先取exposure較高者，同值用id穩定排序；id只破同一合法鄰域內的平手，不創造路徑。

七圖採最小真結構中樞：標準雙足torso連head、雙臂、legs、radiator、power-unit；輕雙足torso連雙臂、legs、radiator、power-unit；鐮肢thorax連head、雙scythe、abdomen、legs；古代shell-core連雙臂、legs；吐棘low-core連thorn-crown與三腿；飛翼heart-shrine連crown、雙翼、sting、lantern；常規車hull連turret、tracks、radiator。均用現有精確part id，不新增虛構器官。

## 命中與總傷預算

對每個受擊unit只做一次幾何命中，指定部位是primary／進入點；未指定仍按pickPart決定primary。各次級部位不另擲命中骰。每packet的modifiedAmount、暴擊與全局倍率只求一次，得到本packet有限預算D；不得到每part重擲crit或再乘倍率。area仍可各unit依既有規則各判一次，此模式只改單unit內部的傷害分配。

spread先在傷害前凍結目標部位：primary後從直接鄰接或全身exposed候選排序取足數，不能重複part。各片輸入D×fraction；缺少候選的份額丟棄，不灌回primary。各部位仍逐層算裝甲、抵抗性與傷勢；直接傷害總額不超D，暴擊後D增加是原有語意。

penetrate第一部位輸入D；只有真穿出完整部位層序列的remaining>0，才把remaining×falloff送下一個健全相鄰部位。每段重複此守恆步驟，不重算D，最多maxParts。沿路visited防再次打同部位／同層，穿透到不能越過的內層就停止；凡鐵reach限制不能藉跨部位繞過。防護完全吸收時後方傷害必為0。

layers提供 `applyPacketDetailed(...):{steps,remaining}`，保留原applyPacket回steps的相容包裝。remaining來自同一真結算，不用另跑預覽估計、不以「初始傷害減HP下降」假算，因為抗性與阻隔會消耗或阻止能量。每個實際受傷部位正常觸發onLayerBroken／onBroken／出血／功能失能；若目標死亡，停止該unit後續部位。不能對屍體追加傷勢或重複UnitDied。

## 盾的部分遮擋與穿透

同一攻擊受擊unit的防禦最多消耗一次準備，不按packet或part重扣。spread的防禦容量用primary份額的預裝甲impact，不把旁波全部量算進盾；只將主片改送盾臂或招架臂，其餘片照原部位結算。若改送後與另一片同part，合併份額後一次結算，避免同層重複出血。

penetrate防禦若成立，盾臂作第一入口、計入maxParts，沿完整盾與盾臂層真扣傷。只有穿出remaining才乘falloff送原指定主部位，這是防禦攔截形成的有效連接；之後必沿body圖。盾擋完後原主部位與後方皆0，不能繞盾把完整D再給核心。若盾部位等於原主部位只結算一次；visited及總部位上限仍生效。招架減傷只乘一次，不在每段重複套用。

Hit可保originalPart與實際第一承傷part，另列PartHit／parts資料供畫面。ability.effects的hit/always每unit只套一次，location.part用防禦後實際第一承傷部位，不能波及三處便上三次debuff，也不能隔盾直接給原核心附傷。

## 三個代表與UI契約

`content/base/abilities/mx-radiant-shot.json`：penetrate/maxParts2/falloff.5/adjacent。`reaper-cleave.json`：spread/fractions[.7,.3]/adjacent。`battlefield-support.json`：spread/fractions[.6,.25,.15]/exposed。不增加原packet總量；三者分別代表穿透射擊、橫掃近戰與爆炸多部位。其他武器保持單點直到另有資料宣告。

PartTargetInfo新增pattern（single/spread/penetrate）、maxParts、partHits `{part,fraction:number|null,conditional:boolean,primary:boolean}[]`、possibleParts。指定入口時spread給確定候選與份額，penetrate後方fraction=null且conditional=true，標「需穿過前部位，遞減後才波及」。普通未指定partHits為空、只列possibleParts/maxParts，不能把所有可能部位寫成同時必傷。單點指定時fraction1。

UI選部位顯示「主命中／進入點」與可能波及、各份額或穿透條件，防禦預覽說明盾只攔主片／貫穿須先穿盾。preview與執行共用part-hits選路與分配；預覽不得消耗RNG／準備次數或提前觸發出血。

## 必要驗收

一個射擊、一個近戰、一個範圍代表在真情境各可一次傷兩或三部位，且單點能力仍只傷一處。一次命中不重骰，crit／倍率只算一次，固定總量不因可用部位多而膨脹；缺鄰接、吸收完或maxParts到達就停止。盾全擋後方0、只擋主片旁波仍傷、visited防重、準備只扣1次、不同部位傷勢真發生、死亡一次。反例必能抓到直接複製D到各part、忽略圖跳核心或重上bleed。存讀／重播／預覽與實判一致後，才回原default4v4≤20一方原始四台全dead驗收。
