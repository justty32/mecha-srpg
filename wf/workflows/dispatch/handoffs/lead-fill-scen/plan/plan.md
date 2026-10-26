# 戰鬥情境與戰場地圖大填充計畫（cx-fs-plan）

48 個新情境＋15 張新地圖＋0 新地形＝63 件，分7批；全是計畫稿，尚未產出content。每台新機至少3個新情境、每種新獸至少2個新情境。入口限定 `?scenario=fs-批號-名稱`；不接遭遇池、不加契約、不動既有內容或黃金。

## 1. 已讀清單

已親自讀 `/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，及交接書點名的使用者偏好、fs-common、content README／batch／battle-field／playtest／polish、lore README、fill-rulings、基調審查、mech2與kaiju2收線報告及計畫、kj2-01範本、core scenario／map／terrain契約與code-map。完整逐檔絕對路徑見 [已讀清單](readlist.json)，包含相關源碼、索引與實際掛點。

索引及舊計畫資料表用tabledb按batch、關鍵字或必要欄位讀取，未把整份lore分片灌入context。舊機甲計畫的四個event檔名已過時，實際使用 `event/workshop-outline-appendix`、`event/harbor-last-watch`、`event/seven-seals-diverge`、`event/lamplit-return-trials`。機甲舊計畫說移動類別尚未生效的段落也已過時，以下依code優先。

開場已讀SESSION-LOG（5項）與WAIT_USER（1項），跑頂層收信工具；本線每步跑inbox_poll。SESSION-LOG與ROSTER由領導持有，本線不越界編輯。調查時讀到HEAD為 `1d3cc64c9dbf0de0517f460207cd6f7aff6813e6`；主樹有其他線活動，這是調查點，不是尚未建立worktree的base。領導派工時把各manifest的TBD換成實際整合commit。

## 2. 引擎事實

ScenarioDef實際支援id、map、slots、objectives、rounds、seed，以及可選name／brief／nameEn／etymology、rules.conventionalFactor。slot含faction、units、可選ai與allies。UnitSpawn支援mech或monster擇一、at座標或zone、persons的id／seat、grade、components、core、crew、pools。grade與pools本批不覆寫；components若給就整組取代frame.defaultLoadout，不是補差。這次所有機甲有明列pilot，各自使用現有完整defaultLoadout；沒有把省略persons誤當作會自動冒出機魂。現在沒有駕駛、機魂或crew的機甲controlMode會是none，舊文件的「省略persons讓instinct開」不適用機械系。

MapDef支援id、nameEn／etymology、width／height、cells字串或rle物件、legend、features（at／terrain／hp）、deployZones、exits、globals。MapDef沒有name欄，中文地圖名留etymology及review。cells不含換行且格數須等於寬乘高；features是覆蓋地形與地物HP，不能寫互動閘門。deployZones按slot設，固定at仍需合法與不重疊；本批兩者一起列。exits明列西側4格，不依賴預設邊界。

TerrainDef支援id、name／nameEn／etymology、glyph、color、moveCost、height、cover、blocksLos、onEnter、onTurnStart、destructible{hp,becomes}、tags。五個moveCost鍵為leg／track／hover／flight／burrow，null不可進；沒有tide或amphibious第六鍵。glyph用小寫。terrain效果對flight／burrow也會套用；不能把cost1誤寫成免疫酸沼、纏根或月面效果。既有ruin-tower高3、regolith-pit高-1，是現況，不照原則文件的建議0–2去改。

七種目標kind及完整params／實際語義在 [目標表](objectives.json)。引擎先按宣告順序找達成且非continue的目標；survive僅輪末，hold連續輪末計數。每場玩家eliminate lose擺第一，護送再列每台目標死亡lose，最後才是敵方時限勝利。killTarget用def id會匹配全場同def所有單位，必須全死；capture／reachExit消費單一unit，不能只有由def target產生的units陣列。固定單位執行期id是slot-index（如ally-0），所以工人不能重排units。escort可跨owner指定單位；hold的盟軍能站在旁邊且不算敵人，但不能代玩家累計佔領，故參戰局盟軍也有自己的同目標win。

移動每步用目的格的moveCost，加上向上高度差×moveHeightCost；鄰接按Chebyshev距離，包含斜走，不能穿過佔位單位。沒有可用locomotion部位就不能移動；有部位卻未標登記類別就當leg。輪座、吊架用track；舟架與針魚用hover（潮行是顯示語，不是新registry）；分翼用flight；拓影用burrow。新獸除固定菌絲外大多沿leg，燈腹與空帆名字或外形不會授予飛行，泥母也不因此能穿牆。

可直接查 [既有地形全表](inventory.json) 的terrains列比較成本；幾個決定設計的例子：淺灘leg2／track3／hover1／flight1／burrow不可；裂渠leg3／track不可／hover1／flight1／burrow不可；殘牆leg與track與hover不可、flight1、burrow2；酸沼leg3、track與burrow不可、hover與flight1。即使能穿殘牆，LOS仍按地形遮擋，不能保證隔牆射擊。多足機只壞一足不保證減速；掛在該足上的機械武器會失效，但怪獸內建招只承諾既有onBroken效果。

globals.tide可以是只引用battle.round的NumExpr；light是常數，均須既有effect引用才影響戰局。含裂渠／潮間地形的圖只用一條曲線：前5輪0、第6輪起1，既有bf-tide-drag據此改initiative；不改水位、不解釋獸凶度。其餘圖tide0、light1。陸地或月面沒有暗藏天象加成。

黃金查證：`test/golden.test.ts`遍歷的是`test/scenarios/*.json`的固定setup與指令，並非base全部scenario；營運`src/ops/sortie/scenario.ts`從contract、encounter、rift、world terrain生成戰局，map只在encounter明示引用時讀取，不會把新增base scenario自動加入池。`test/campaigns/`與`src/ops/sim/golden.test.ts`依既有世界與指令重播，grid-health跑營運政策，沒有遍歷base scenario。**本批只新增未被引用的scenario/map，預期不改戰鬥黃金、campaign黃金或grid-health；改到遭遇／契約／地形池、既有被引用資料或規則才會沿依賴影響它們。** 新增壞引用仍可能讓全庫載入check失敗，不能把「不動黃金」當「不用check」。content:index一致性由領導整合時更新，工人不改索引；這不是本計畫新增驗收項。

做不到或仍需正式功能的項目及影響／建議列 [引擎候選](engine-backlog.json)，共8列。友方卸燼與自護AI已在現況code-map列出support.ts實作，不重開舊68／73號缺口；不承諾每局一定施放，實際使用留產出探針紀錄。capture雖可用，這輪不拿活捕當主目標；工程機不寫成修橋、拖機或治療。

## 3. 盤點與出場覆蓋

[盤點表](inventory.json) 共84列：40情境、21地圖、23地形。scenario列含map、尺寸、地形集合、目標配方與逐slot出場機／獸；map列列出尺寸、地形與使用情境；terrain列有五鍵成本、高度、掩蔽、效果及使用地圖。可依id串接，沒有把資料在本文複製第二份。專線既有內容只作完整盤點的唯讀基準，不是本輪新增候選。

[coverage.json](coverage.json) 固定五欄「實體、類型、區、出場情境數、建議」。出場情境數只算現有不同scenario id，同場多台同型仍算1。機獸按UnitSpawn直接引用；地點按lore.gameRefs或完整名稱明示於情境name／brief，地貌相似或勢力出場不硬算地點覆蓋。這個保守口徑下零出場是24台新機、20台其他主要機型、11隻其他獸、86個地點；24種新獸已有kj2展示，仍缺第二種戰術用途。地點涵蓋東亞／群島／中亞、南亞、歐洲／內海、非洲／西亞、美洲、海上／殘聯、月面／軌道；本輪不宣稱95地點全數補滿。

另列17個既有戰鬥faction的現有／新增出場，區分使用勢力機型和代表該勢力作戰。朝廷、日傘、俄傘、北美、內海機型、基多、奈洛比、學會、鐵砧、鹽鷗、殘聯、塞勒涅、沐蝕會都有代表配置；第三刃沒有正確的base faction，沿候鳥參考編隊展示針魚／鰩魚，不把鹽鷗maker債說成兩家合併。怪獸共用faction/rift-insects為技術容器，不把四族全寫成蟲。

[新48種逐項覆蓋](roster-coverage.json) 凍結24機＋24獸的結構、移動、既有配裝／能力、每一個新出場id與次數；兩次不同情境才算兩次，不靠同場複製或母體出生湊數。新機最低3場、新獸最低2場。六隻A級二名留在各自已有地點，每隻至少兩種可能遭遇；重播與不同目標不宣告同一個體在史線中死兩次。

## 4. 設計理念

每張圖先給一條大家走得通的外緣乾道，再把更短的水路或穿牆路留給不同移動類別。輪座必須守住繞路的時間，舟架與分翼則把省下的路程拿去接敵或護撤。四足前武器、吊架配重、分翼武器與尾系統分別成為對手可以拆開的弱點。巢母場不把初始小獸當真正繫子，而讓能力生出的鏈條與守區時限產生取捨。定點菌絲、遠射死角與多核獸各要求不同的站位及拆部位順序，不能只替換外形。高級獸場同時提供守住、撐過或削弱的答案，六隻二名各保留地域的光。每一場用一句現場能喊的話或能看見的畫面把戰術掛回有人生活的地方。

## 5. 新地形清單

**0種。** 現有淺灘、裂渠、潮間、殘牆、壁壘、街道、高架、酸沼、菌毯與月壤已足夠；閘肩、堤岸、巷口與浮橋的畫面用地圖組合表達，不為同成本換名造新定義。因此本輪沒有新的moveCost／cover／height／glyph數值可填，也沒有跨批共用新地形依賴。15圖所有legend只指向既有23地形中的子集。

## 6. 新地圖清單

[地圖規格](maps.json) 共15列，每列有id、名稱與英文意涵、24×20尺寸、精確地形格數、地勢一句、deployZones、exits、globals、lore掛點，以及可直接展開的矩形塗地順序。這是逐檔設計規格，不是content成品；工人只展開cells與legend，不再自行設計地圖。

矩形座標0起算且含端點。底地形填滿後依序覆寫，外緣乾道y=2、3、16、17覆寫為底地形，再清部署格，最後中央4格置補給碑。靠中央的牆渠保留，使track繞外緣、hover走水、flight／burrow穿牆有可見距離差；不是人人沿中央通路直走。所有圖leg成本1格均超過六成；具體比例已列，不用隨機塗圖保證。

player四格、enemy六格、ally六格、third兩格都明列；各情境只用其中所需固定格。玩家對敵最近Chebyshev距離13格，第三方距玩家至少15格；護送ally用東北(17,2)/(18,2)，到西側出口至少17／18格，超過圖寬三分之二。一般參戰ally用西南四格，雙向allies；部署不貼敵。巢母四周留空，不把地物堵滿出生口。

涵蓋八打雁河口／仙台海崖、吉大港黑幫長巷／庫爾納空廠酸渠、鹿特丹半沉泊道／阿爾卑斯高地墟、蘇伊士固定閘肩／奈洛比高原／巴拿馬閘城、西雅圖糧埠／瓦港外階、奧克蘭空泊／五湖淡水岸、暗埠貨棧／靜海外坪。地圖沿既有place，不新發明lore地點；閘門不會因名字自動開閉。

## 7. 新情境表

[情境規格](scenarios.json) 恰好48列，id全部以fs-開頭。逐列完整給中文名、brief、map、玩家／敵／盟軍／第三方slot與機／獸、固定部署與駕駛、objectives完整params、rounds、seed、類型配方、移動或生態展示、place及補充event掛點、入口與遭遇池／契約引用false。不存在「由工人自選機型／座標／目標」的留白。

本批類型分布：斬首7場、守區8輪12場、清剿7場、撐8輪撤守8場、人對人點殺4場、三方混戰2場、雙機護送6場、指定機撤離2場。斬首／清剿／點殺／混戰rounds30，守區／護送／撤離rounds20；存活型以8輪達成，不為湊時長拖到timeout。敵方時限win是明寫的任務失敗期限，勝負按宣告順序；三方達時限同時符合時敵方在前，這是已知平手裁決順序，並非第三方沒有win。

機甲全部沿現況defaultLoadout，不把四足或舟架視為免費能力；player一般3台、怪獸2–3隻，A場加4台盟軍時也只用既有武器與數值。原battle-field建議的4–10敵是常見配方而非必須湊滿，本輪A／B混編以同級主力承擔，低級機做輪座、偵察、工程或掩護工作；數值未驗平衡，不承諾勝率。

所有具名駕駛都只在全場一台機。人物／勢力配置是可重播的參考試機編隊，brief不改寫人物投靠與歷史在場；新機2108試作以possible事件作補充掛點，不能把它們塞回2104史實。白手套陣營的有人核心機是保全／型錄代理，不能稱成無核心鐵偶。月面只有機械系，沒有搬運活獸或讓古代機當可擊殺敵人。

## 8. 分批

[批次表](batches.json) 為唯一件數清單：fs-01至fs-06各7情境，fs-07為6情境；fs-04有3專用地圖，其餘各2圖；共48情境、15圖。每批最多7情境，低於上限12，總檔數最多10。順序可依領導排程，因各批只引用已整合mech2／kaiju2和自身map，七批互不依賴。

fs-01先展示兩種母鏈與仙台遠射；fs-02放城市巷戰、空廠酸渠；fs-03讓內海水路與高地墟形成對照；fs-04是閘城輪值、高原人戰與三方競逐；fs-05守住兩座美洲港口的畫面；fs-06分異形海岸與固定淡水菌絲；fs-07只做月面機械交戰。各批獨立跑其新情境，不需先把另一批搬進worktree。

## 9. 產出交接書稿

七份稿已按kj2-01範本骨架與fs-common組成，逐檔規格引用本計畫的batch列，直接列出允許新增的完整檔名。各稿含親讀清單、範圍與件數／容量gate、工作步驟、必用工具、固定四條驗收、資源禁區與終局寄信。子代理上限1。worktree根固定為交接書指定scratchpad的lead-fill-scen/wt-fs-NN，報告在本線fs-NN/，不是plan/。

AI對AI命令已親自實跑：`npm run sim -- --scenario scenario/kj2-03-demo --seed 210803 --ai-vs-ai`，exit0、enemy勝、reason eliminate、15輪、hash `2d4769d5d480212c`；完整輸出 [probe-trial.txt](probe-trial.txt)。這證明指令可用，不是48個尚未產出情境的實測。cli沒有--help實作，已直接查原碼，工人不會被指去跑無效旗標。

每份稿把本批每個scenario的本seed與seed+10000兩次指令寫死，沒有會意外掃全庫的glob。產出線只跑check 0 errors、typecheck 0、逐場sim與review／REPORT，按固定四條收工；不增MCP、平衡門檻、全套npm test或黃金重錄。sim真實結果含勝負／原因／輪數與log；timeout可揭露為任務達上限，但未決、例外不能假稱通過。最終逐稿brief_lint --strict結果見本節末尾驗證紀錄。

<!-- wf-nav -->
- [fs-01交接書](cx-fs-01.md)
- [fs-02交接書](cx-fs-02.md)
- [fs-03交接書](cx-fs-03.md)
- [fs-04交接書](cx-fs-04.md)
- [fs-05交接書](cx-fs-05.md)
- [fs-06交接書](cx-fs-06.md)
- [fs-07交接書](cx-fs-07.md)

## 10. manifest稿

每批一份content-batch/1，沿kaiju2-01格式，mode add、status draft、base TBD、author產出gpt-6.1-sol、lead-fill-scen、reportDir與mustRead齊。allow.kinds依要求列base/scenarios／base/maps／base/terrains，但files與ids名單沒有terrain，不能因此任意加地形。namePrefix各限fs-NN-，modify空陣列；files明列9／9／9／10／9／9／8個未存在路徑。

checks只用驗收工具認得的check／typecheck／readlist；probe與playtest為null，不把sim冒充content:probe。逐場sim的義務在交接書固定第3條及REPORT，領導收件依該證據審；manifest註明此差異。產出工人不寫manifest、index或commit，領導審定後建立worktree並填base，收線再按原有整合流程。

<!-- wf-nav -->
- [fs-01 manifest](fs-01.manifest.json)
- [fs-02 manifest](fs-02.manifest.json)
- [fs-03 manifest](fs-03.manifest.json)
- [fs-04 manifest](fs-04.manifest.json)
- [fs-05 manifest](fs-05.manifest.json)
- [fs-06 manifest](fs-06.manifest.json)
- [fs-07 manifest](fs-07.manifest.json)

## 11. 需求與待決

本輪**沒有必須先補的lore地點**，15張圖掛到15個已存在的place。需要後續補的是反向導航：lore的gameRefs目前不會自動列出fs情境，若要在百科「直接開戰」而非輸入?scenario，另派lore／UI線；本輪只在scenario etymology與review保留掛點。所有新增中文名仍標提案，交領導與使用者審基調；既有地名不改。

第三刃戰鬥faction與營運maker代理尚未正名，另案處理；沒有用新增faction繞過範圍。人員是展示編隊，若日後要做正式史實劇情，需按人物時間線改成有授權的真實出戰組合或新增匿名駕駛模板，本輪不自行新增人物。月面低空穿短牆只是格成本展示；真高度、真窒息、動態閘、拖機、部分失足、固定捕獲目標別名與棲位池按引擎候選另案。

48場目前是具體可產出的規格，尚未取得各新場實測勝負；產出時跑已寫死的命令。AI棲位與支援表現依整合base可能變化，工人記證據，不改AI或調數值。六隻A級二名只在各自lore掛點重播，S級與古代機不新增出場；萬潮葬王、tidespine、wc、王跡、北行專線新增件數為0。既有盤點中的專線記錄不是本輪內容，不能交工人照抄。

本線驗收只用交接書固定4條：1–11段齊；coverage與review合法且review 50–80列、白話≤60字、無撞檔／重複；每批交接書brief_lint 0與manifest齊、24機24獸各至少2場；禁區新增0件。驗證結果另見 [acceptance.json](acceptance.json)，不另開第五條驗收。主代理自行完成，子代理0；沒有外部服務與網路查詢，成本未取得計量不虛報。
