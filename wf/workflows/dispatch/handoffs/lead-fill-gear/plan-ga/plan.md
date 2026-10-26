# ga 非核心裝備擴充計畫

本線 cx-fg-plan-ga；2026-10-26；只產出計畫，未寫 content、未 commit。40 件裝備（四槽各10），附8個能力、8個效果，**合計56個新檔**；四批各14檔。裝備預算等級為D2／C19／B17／A2；供貨掛點為舊廠25、鐵砧3、學會5、塞勒涅7。所有新中文名皆為提案。這是功能型配裝軌；勢力型錄與專屬整套設計交 gm，武器交 gw，戰利品原料交 gl。

## 已讀清單

親讀清單已抽到 [read-list.json](read-list.json)，包括根 AGENTS.md、gear-common、全部點名內容規則、兩份核心資料模型與營運經濟模型、fill-rulings、magnates 及五份已收線報告。lead-mech2、lead-kaiju2 的實際檔名是小寫 report.md，已讀該檔；另三份是 REPORT.md。開場已跑待辦計數並讀 SESSION-LOG／WAIT_USER，inbox/new 無信。因本線只准寫 plan-ga，未追加主 SESSION-LOG、ROSTER 或 CLAIMS。

查既有資料先用 content/index/base-component.json 的欄位與篩選結果，透過 tabledb Python介面逐筆定位小檔，再核實槽位；實檔計數與索引一致。未整份讀大型索引。補讀了槽位登記、同槽部件與能力範本、五種骨架、現有市場／研究索引及局部引擎實作。舊文 EF-16 與 numeric-bands 的抵抗性描述已落後，以 lead-resist 的已落地結果為準；本軌無攻擊包，不另造精粹等級或傷害例外。

## 盤點與缺口

逐件盤點已抽到 [inventory.json](inventory.json)（28列），按類別／廠商／等級的數量在 [inventory-summary.json](inventory-summary.json)。每列保留實際機制與來源，能看出既有件究竟加什麼。既有 ComponentDef 沒有 grade／maker，索引的等級與廠商也多為空；28件全部列為「等級未登記」，不能從名字或所裝機型捏造 D–A 分布。廠商只認 oa-* 的原文明載與鐵劍通用標籤，其餘標未登記；機械／生物／古代來源不當作廠商。

裝甲8件：多為 torso 加厚；白瓷偏 thermal／energy，裂鱗偏 kinetic／pierce，月輝為流光續盾，菌絲有承擔。缺少單一傷害類型的選配、頭部及非雙足武器足保護、能確實觸發的反拘束操作。舊菌絲／白瓷有抗性0.3，本線不沿用超出新件≤0.25的數字，也不改舊件。

系統7件：排燼、流光容量、裂晶心爐、冕環與順行筋組，加上排燼扶架。缺口是「容量、續航、短時爆發」的明確交換；不能把所有排燼件都寫成無代價升級。扶架的友方AI缺口仍須按實際版本觀察。

感測5件：定準、鷹瞳幾乎都加準頭；千目、嗅針是標記；骸片要求共鳴。缺口是近身避讓、先手、測繪、準頭與視野的取捨，以及短距友方報點。新件不用古代全知，也不把 perception 說成新增射程或透視。

背掛8件：3件凡鐵遠射、1件生物近戰、2件機動增益、灰霧與排燼架。武器已佔半數，缺少不射擊的護送、保護特定骨架與開場資源選擇；本線新增10件皆不帶傷害包。registry 沒有獨立腿槽或引擎槽，機動件使用 systemMount／backMount，不擅加槽。

## 設計理念（七句）

一件先決定駕駛在戰場上捨得放棄什麼，再給它一項擅長的事。
裝甲分清能量、衝擊、灼燒、酸蝕、穿刺與保護部位，厚胸甲不能同時替腿擋矢。
反拘束用可操作的解扣或重新站穩，只解除指定標籤，不把減益清光。
感測有看得廣、盯得準、先發現和替人報點幾種工作，靈目不會知道一切。
背掛把護送、資源備份和異形骨架保護帶進選配，機動加值不冒充飛行或瞬移。
舊廠靠公版非核心件續命，學會、鐵砧與塞勒涅的專用件則明寫代價與聲望需求。
數值先照同級帶填，保留使用次數與資源約束，之後的統一平衡不能抹掉各件用途。

## 新件表與完整規格

新件表已抽到 [new-items.json](new-items.json)（56列），不在本文留副本；白話版在 [review-draft.json](review-draft.json)（56列）。欄位包括 id、檔、批、類型／槽位、中文名、nameEn、一句定位、掛點及來源、廠商、等級、數值帶、AI戰術鍵、聲望門檻、新名詞、差異與代價、安裝條件、示範載體、市場／研發／掉落建議、規格與驗證情境。`規格` 已把每檔機制欄填到可直接產出；工人只需依命名規則潤飾 etymology，不再設計機制。

本表的「等級」是採購與數值預算，不能寫入 ComponentDef.grade。hp／mass按 numeric-bands 的D12/2、C16/3、B18/4、A22/5取值；該列原為武器size帶，非武器沿現有槽容量：裝甲／系統／感測size1、背掛size2。外加每層25–45 HP、resist≤0.25；多部位各25不是全機共享血量。常駐屬性各項絕對值≤5且配代價；短效依C／B帶與用途，先手+12、閃避最高+10，效果持續1–2回合。所有主動招AP3、cooldown3、每戰2次，傷害包空。池增減沿既有同類件的量級；數值暫填並記錄，不把未測勝率當保證。

## 分批與產出交接稿

分批表在 [batches.json](batches.json)，每批14檔，批內含10件部件與各2件能力／效果。批間不引用新id，可由領導獨立排程；manifest.files及逐檔表是精確邊界，fa-前綴不是擴寫許可。

| 批次 | 交接稿 | manifest稿 | 逐檔規格 |
|---|---|---|---|
| 01 裝甲 | [cx-fg-ga-01.md](cx-fg-ga-01.md) | [fg-ga-01.manifest.json](fg-ga-01.manifest.json) | [fg-ga-01.specs.json](fg-ga-01.specs.json) |
| 02 系統 | [cx-fg-ga-02.md](cx-fg-ga-02.md) | [fg-ga-02.manifest.json](fg-ga-02.manifest.json) | [fg-ga-02.specs.json](fg-ga-02.specs.json) |
| 03 感測 | [cx-fg-ga-03.md](cx-fg-ga-03.md) | [fg-ga-03.manifest.json](fg-ga-03.manifest.json) | [fg-ga-03.specs.json](fg-ga-03.specs.json) |
| 04 背掛 | [cx-fg-ga-04.md](cx-fg-ga-04.md) | [fg-ga-04.manifest.json](fg-ga-04.manifest.json) | [fg-ga-04.specs.json](fg-ga-04.specs.json) |

manifest 均 mode:add、status:draft、base:TBD；領導審核後才填base及建worktree。gear-common 禁MCP優先於通用批次流程，產出稿改用scratch的runBattle五seed與tryCommand有效使用證據；不會為通過自動probe而追加frame或展示情境。主動支援AI有歷史缺口，須分別記AI與人工使用，不能把人工操作偽報自動。正式content_accept由領導按checks收件；各產出稿固定四條驗收。

## 市場／掉落／研發掛接建議

逐件掛接已抽到 [attachments.json](attachments.json)（40列），含精確component id、市場、weight／stockMax／暫價、聲望、發布條件與載體。主入口為 war-armory／old-array／salt-flat；塞勒涅型錄走 singapore。這些是交gm的插入建議，ga不寫市場，也不碰禁止修改的chittagong／dhaka。

舊廠公版件建議公開；帶勢力專用定位的件依 D10／C20／B35／A55／S80，**目前不能僅靠tag生效**，必須等部件門檻落地才列入可買庫存。研發以既有 research/forge-composite 為前置的新分支提案，不直接改舊研究，也不假定解鎖後已有製造UI。通用三系公開不表示它裝上的私有件也公開。

本輪全是機械製品，沒有任何一隻怪直接掉整套成品；gl可接人類敵機戰損回收，按每件id保留實物HP。若將來做獸材外甲，需另設拆取原料→加工／移植路徑與burden，不把這40件改成怪獸養殖品。古代機本體、機魂人物與新國家機型皆不在此輪。

## 需求與待決

部件聲望門檻：src/ops/war/rnd.ts 的repGate只收ModelDef；market.ts的購買鎖以frame/model反查；ops內容檢查的overrides也只認model。請引擎線提供component的maker／tier門檻支援，再由gm上架私有件；本稿不新增死欄、不填假的overrides。未完成時仍可新增部件內容供展示，但不上架出售。

精準反拘束：扳扣脫網只remove immobilized，落樁站穩只remove stagger；remove採任一tag相符，不能寫debuff或restraint做廣域清除（後者會碰拘束器毀損狀態）。已核mx-netted有immobilized、m2-dragged有stagger；kx-breakwater-clinger-snared只有debuff，兩招都不宣稱能解。無統一拘束分類的補齊交引擎／整理線，本線不改既有效果。

骨架掛位：layersAdd只按part id插入；舟架是mast、分翼是nose，不是head。眉梁／鐵眉限head；護足限四足front-left；護舷限兩浮架；留翼限兩主翼。這些均有現存示範骨架。不存在的part不應被算成成功安裝；要在市場篩選與裝備UI顯示相容性，交引擎／介面線。留翼與守燈背幕若裝兩套會疊層，本稿只建議一機一套；引擎尚無去重裝備規則，不宣稱已鎖。

資源相容：poolMods不替缺池機體建池；明列heat／charge條件的件只能在池齊全時推薦。留光背匣是唯一主動宣告charge池的成品，初始20、回復0；仍不賦予無核心單位使用精粹招的資格。燼max加大不會自動推遲既有bands絕對閾值，不把壓燼件寫成免過熱。

AI／真位移：自護與友方支援按buff主鍵寫；若新引擎已修好仍照實測，不改既有AI或補招。轉風只改屬性，飛行／涉水／拖友／多足斷足移速等另由已登記引擎需求處理。

跨軌去重：gm保留廠商整套特色件、上架與服務主導；本軌只提供四槽功能件與既有廠商掛點，請合併時以「槽位＋用途＋代價」比對，不以改名假裝不同。gw不新增本軌八個支援動詞；gl不另複製本軌機械成品。此處只交需求，不向其他線寫檔或寄信。

Lore／使用者：40件裝備與16個動詞／狀態的提案名、供貨風味與暫價交領導基調審查；掛點只承接既有勢力與崩年背景，不補造歷史定案。沒有新增國家、巨頭、具名人物、年表事件或S級機魂。數值統一調整留後續，不阻止這份計畫交付。
