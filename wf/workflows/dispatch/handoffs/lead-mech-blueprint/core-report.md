# 機甲配置核心交付

配置與承力整合 DONE，最終凍結 `blueprint-4`；64件、25總成、8大部位、18骨。美術來源與展示不在本線寫集。實際來源若再出問題可喚醒，不將配置通過當作完整瀏覽器驗收。

## 重建與寫集

原型位於 [art/mech-blueprint](../../../../../art/mech-blueprint/)。`node art/mech-blueprint/build.ts` 只讀同目錄TS與data/design、rig、slots、draw-order、poses五份JSON，不依賴wf規劃表、交接腳本、/tmp圖或舊整機。overlaps是data內的配置來源。來源與生成分離，五生成檔是layout.json、work-orders.json、diagnostics.json、layout.svg、work-orders.svg。最近build為64件／0錯。

來源design保存大部位非矩形走廊、機構bounds、正規化形狀、部件角色及禁區；allocateDesign逐層計算四層Region與frame。超界修子分配，沒有擴大父矩形吞錯。每件獨立parts/<id>.svg，assembly只是資料分組，螺絲陰影不灌件數。

layout/workOrders記錄revision及五輸入canonical SHA256：`56f22cc1ef0e8ddadfb3510c05cf5e6261daa249ff97b1c3d7fdf5eab9cd889a`。生成結果不可手改；工作單域變動需升版。Attachment.workOrderRevision必填，不符會紅。

本線18檔共2,039,929 bytes，低於3MB；另一本報告。七個程式／設定為schema、layout、rig、geometry、build、blueprint.test、tsconfig；六份data為design、rig、slots、draw-order、poses、overlaps；五份generated如前。rev2–4修改schema的extensions/OverlapIntent、layout的窄域/骨鏈疊圖/planOverlapRules、geometry凸包、test回歸、design、draw-order、poses、overlaps及五生成檔；rig/build/tsconfig保留既有核心。其他展示與美術檔均保留，沒有越權寫入。

## 穩定API與限制

build.ts導出loadBlueprint(directory?)、build(directory?)及buildLayout(blueprint)；後者回傳layout、workOrders、diagnostics、svg、workOrdersSvg。完整樹在generated/layout.nodes；來源design.nodes為空，不能繞過配置計算。兩張配置SVG分別是全機包絡＋親子骨pivot世界點疊圖，以及64份局部包絡／原點／接點拼版。

rig.ts提供worldMatrices、slotMatrices、frameMatrix、六參數矩陣運算及interpolatePose/sampleTransition；角度是bind delta，正向順時針，機體左為畫面右，21點採樣下限不能降低。肩甲獨立骨，以0.35跟隨上臂。未做IK、鏡射縮放、mesh或Spine匯出。

geometry.ts提供凸Region交集／差集／包含、座標轉換及bounds；parseSvgGeometry(svg,elementId)從實際來源產生含描邊Region。只收polygon、circle、ellipse、無圓角rect、絕對M/L/Z閉合path；凹polygon耳切。拒絕transform、clip、mask、use、相對path、曲線及未知可見幾何；描邊必須round cap/join；圓與橢圓保守展平誤差低於0.75u。不引入幾何庫。

validateAttachmentGeometry驗引用、revision、viewBox、actual對工作單(+2u)、actual對occupancy(+0.75u)、keepOut及≤1u接點；allowedOverlap只扣明列pair/pose/zone。單件diagnostic.region為局部座標，由viewer轉世界；配置diagnostic.region已為世界。

軸套socket明列pivot[0,0]；前臂／股／脛框有near/far與targetBone/targetAt，實際驗跨骨對接，沒有只比同一frame的metadata。頸、肩、腰、髖也指向真骨點。這仍不足以證明實體連接，因此另核真SVG承力鏈。

## 接合修正與凍結

rev2新增11件的真機構域：torso-frame頸座與雙肩叉、pelvis-frame中央腰軸與真髖八角、backpack-frame噴口橫支、雙胸白甲包覆、雙前臂框腕桿、雙股框股根、雙脛框踝桿。其父assembly/major只加相應窄通道；slots不動。白胸6點已證凸，右側鏡像寬0.94並保留原域。另53件幾何可重驗沿用，再更新正式metadata。

rev2宣告後發現胸腹承力筒遺漏及頸軸僅尖下巴接觸，故升rev3，沒有靜改凍結版：torso-frame加x±12,y45..112腹筒；頸頂到y-142寬±8、y-131寬±12，再接既有±14,y-116..-60。頸在face後方，真源實畫到-140形成插接；chest及torso父層是相同窄域。右上臂暗榫在原域延y140→141.1，左肩榫原域延伸，沒有新增件。

抬臂seed±65使手超1000畫布約37u，改±45。屈肘改上臂±55／前臂∓95，讓手避髖；兩側手對6個pelvis件各21點，共252次實際幾何檢查均無相交，沒有新增手髖豁免。屈膝種子保留，全部仍是固定視角2D演出，不宣稱3D物理。

## 有限遮擋授權

最終127組意圖pair、867條單pose zone，intents保留在data/overlaps.json。原118pair先限定同assembly、指定相鄰肢段軸端、固定腰肋、背包後投影、肩髖安裝，再由畫前工作單+2u與21點交集生成有限凸zone，完全不讀actual碰撞來自動白名單。不同pose各自一條；左前臂對胸中央、左手對右手、脛甲對前裙、上臂對股甲皆不授權。

原領導核准額冠↔面罩及眉甲↔面罩，根據原parts既定包覆用途。rev2由明確真機構提案與新領導核准，僅加窄頸↔面罩、雙腕桿↔手套、中央腰軸↔腹甲/腹脊、雙真髖↔股根。rev3只加胸腹窄筒↔腹脊，同頸pair依深插通道重算。新pair的regionA/regionB明存intents，不能擴成整片。

例如pelvis局部zone：腹甲x±14.04/y-33.04..-10.96、腹脊x±14.04/y-33.04..-15.96；左右髖各只在約24.22×27.10域。腕zone限forearm x±9.04/y170.96..177.04；新胸腹zone限torso x±14.04/y100.96..114.04。數值含2u描邊預算；沒有萬用pose或全臂豁免。

rev4修正左腕zone漏角：世界往返產生同x的1e-13雜訊，排序＋近共線刪點錯吞左上端點；凸包改1e-8網格去重並統一-0，planOverlapRules直接在a局部取交集。全127意圖重算，未手補三角或新增豁免。

## 驗證證據

凍結前核10類介面、左右展開24對：頭頸、胸肩、肩上臂、肘兩端、腕、胸腹、腹腰髖、髖股、膝兩端、踝兩端。第一輪24×127發現胸腹全斷與右肘sample18–20暗榫脫接；不能把它當白甲活動縫。源修正後再核bind＋六路徑各21點，共3048/3048實際Region交集為正、0斷鏈，耗2.16s。最小正指標2.990799；Region凸片可能重疊，該數字只是交集正性指標，不能當精確物理面積。藝術兩線另各自獨立核承力鏈。

依排程 `nice -n 19 node --test art/mech-blueprint/blueprint.test.ts`：12/12、exit0，875.846699ms；局部strict tsc獨立exit0。第11真源負例157.441106ms；第12凸包反例、127點局部一致、錯frame必紅及全867zone確定性重建571.901354ms。保留deepEqual，首輪僅因-0與JSON的0差異失敗，正規化後全過。五生成檔重建前後SHA256全同、overlaps byte不變、sourceHash仍56f22c…，不需再升metadata。

11例保留真來源整合負例，不因metadata過渡而弱化：原真胸甲／肩甲先通過，記憶體移真胸甲(-90,0)須包絡紅且原胸框zone不能吞，移真肩甲(-45,25)須keepOut紅；檔案不改。其他例覆蓋delta/pivot、parent/循環/follow、limits與21點、凹Region邊穿越、畫序/缺件/父包含、跨骨錯位、實際SVG不支援語法、假occupancy、過期revision及64件確定性重建。

未跑npm／全套／GUI／下載；本線沒有commit/push或背景行程。64源與file展示的完整整合驗證、PNG及瀏覽器感官驗收由領導／viewer交付，不能以本報告代替。

以後交接書應點名：原生agent里程碑工具、node原生TS、領導排程node --test、局部tsc、git status，以及規劃資料表讀取工具。
