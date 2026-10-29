# 本輪最小代表編組：常規車輛與怪獸群

[生態發想](battlefield-object-ideas-1029.md)｜[戰場底座](playable-battlefield-1029.md)

## 已核真相與範圍

使用者要求本輪落地常規非機甲地面部隊，不接受將機甲改label。初查AT-12／GL-02雖是履帶外形，tags仍有mech／夸父譜系，故撤回純重用原frame方案。保留可用凡鐵武器與工程配件，新增專用常規車體與三個frame。cls=mechanical只是共用引擎的機械類型，不代表機甲；scenario部署core:false、車體僅有人類pilot座位、無soul座位／charge池／mech或lineage標籤，顯示名稱明確是常規車輛。

新增內容六檔：`content/base/bodyplans/battlefield-ground-vehicle.json`，`content/base/frames/battlefield-tank.json`、`battlefield-missile-truck.json`、`battlefield-engineer.json`，`content/base/maps/combined-arms-battlefield.json`、`content/base/scenarios/combined-arms-battlefield.json`。ID與檔名一致。入口 `?scenario=combined-arms-battlefield`，既有導航的情境選單可發現；普通sol寫產品內容，本線不實作。新增測試為 `test/sim/combined-arms.test.ts`，排程權在隊長。

## 車體、配裝與可用性契約

共用bodyplan三部位：hull車體含armor30、cockpit-shell30，functions core/cockpit，僅pilot座位；turret火力平台含armor20、structure20，functions weaponMount/sensor，slots main-gun:weaponMount size2、back-1:backMount size2、system-1:systemMount size1；tracks履帶含armor15、structure20，function locomotion。結構層標structural=true、裝甲false，其餘必填欄沿合法bodyplan慣例。這裡core功能是致命結構部位，不是機甲核心；機甲核心由spawn.core=false明確關閉。

三frame gradeD、cls mechanical、bodyPlan上述新ID、tags ground-vehicle/conventional-arms/human/track，無innate。heat池max120、initial0、regen-15，soft/inverted，沿既有過熱bands。沒有charge池；所有彈藥由實際配件提供，不憑空無限射擊。坦克叫「常規履帶戰車」，main-gun配 `component/autocannon-30`、back-1配 `component/mx-falling-star-mortar`；飛彈車叫「常規飛彈車」，main-gun同連吼、back-1配 `component/mx-hunter-darts`；工程車叫「排熱工程車」，main-gun同連吼、system-1配 `component/m2-relief-cradle`。frame defaultLoadout寫完整，其餘空slot無須亂填。

重要接線：`isDriven`對core:false回false，`abilitiesOf`會過濾非basic的innate，故不能靠新增innate能力假裝可用。這次走既有component能力且不含drivenOnlyTags，真pilot提供AP，三台均可玩家指揮。體型差異目前只有語意／部位／數值定位，所有單位仍一格；沒有實體尺寸碰撞，不宣稱車輛能真的鑽機甲腳間。

## 精確部署

24×18地圖，固定位置，deployZones與之對應；seed2108、rounds30，雙方既有eliminate目標。player使用faction/migrant-crew；坦克(3,6)配person/mara-okoye且heat30；飛彈車(3,10)配person/aigerim-sarsen；工程車(2,7)配person/chen-xiaohai。這三台全部core:false。燕鷗frame/moji-tern在(4,8)配person/ren-kasai、charge10，保留正常機甲核心作尺度與補給對照；既有frame/battlefield-support在(4,11)配person/alina-trofimova。以上人物已查AP9，足以施放AP5迫砲；seat皆pilot。

enemy沿正式playable情境的敵對faction/selene-whitegloves，不創新勢力：monster/mite-d在(12,3)、(13,8)、(12,14)，monster/spitter-c在(17,10)，monster/bulwark-b在(17,6)。小群獸是三個真單位；沿既有species能力／AI，沒有新巨獸種。brief明示蝕蟲為小型群獸、吐棘者後排射手、盾甲重甲壓力；不以統一kaiju tag冒稱每個都是巨大體型。

fill terrain/plain；x9、y5至11放terrain/ruin-wall但y8留通口，兩端可繞行；terrain/rubble放(7,6)、(7,10)、(10,8)。charge補給在(4,7)，碎石物件在(5,8)，出口(0,8)。不覆蓋scenario conventionalFactor，不偷偷取消凡鐵對怪獸的既有限制。若試跑過難，先報部署、路線、目標與回合限證據，不能擅改怪獸本體。

## 火力與工程角色的實際界線

墜星迫砲已是ball radius1、range4–12、los=false、AP5、6發、heat+12、冷卻1、kinetic26，可做抽象越障砲擊；不是只有直射，也不是物理拋物線、飛行時間或彈著預告。追矢range3–9、los=false、AP4、4發、heat+10、pierce34、armorPen0.25，指定部位懲罰10；沒有新雷達鎖定或攔截。los=false仍不授權知道迷霧敵位。

工程車的 `m2-relieve-ally` 是1–3格、AP3、冷卻2，友軍heat-15並暫增evasion6。可排熱、用連吼攻擊／拆地物、透過interact回收；不叫救援車，不聲稱補甲、拖機或救出乘員。開始時坦克heat30，保證有可觀察收益。常規車輛與怪獸仍遵守相同命中、部位、地形與行動成本。

## 完成條件

正式loader載入六檔並驗引用／裝配；確認三車core:false且abilitiesOf真的列出配件能力，不只檢查JSON。實際指令使坦克／飛彈彈數減少，工程車令坦克heat下降，三類怪獸各有合法行動。獨立驗迫砲跨blocksLos障礙成功而普通los=true射擊受阻；不要只驗內容寫false。

從正常入口完成拆牆、拾石投擲、擊殺留下殘骸或屍體、回收材料，正常結束戰局。UI可辨識三種常規車輛與機甲，測試按隊長排程，不虛報手感或勝率。雷達、防空攔截、鑽地出土、寄生護衛、救援拖曳與多格體積只留發想；這張代表情境不是全部兵種系統完成。
