# gw 武器填充計畫（計畫稿，2026-10-26）

## 已讀清單

已親讀任務、gear-common與點名規矩；完整逐檔記錄在 [read-list.json](read-list.json)（68列）。包含根AGENTS、user、content README／batch／mechs／abilities-effects／numeric-bands／engine-facts／world-pillars／polish、lore README／style、fill-rulings、五份前線REPORT、magnates、兩份core資料模型及ops economy-research。數值帶與索引以tabledb條件查詢、分段讀取；沒有整份dump索引。開場SESSION-LOG計6列、WAIT_USER計1列已讀；new信箱無新信。只寫本plan-gw，未改SESSION-LOG、ROSTER或其他軌資料。

本輪直接交付48個內容檔的計畫：24武器、24能力、0新增效果，四批各12檔。計畫書與表格不是已落地遊戲內容；後續產出工人依稿寫入隔離worktree。取樣HEAD為 `a1463faeb0712226b1e537e48844e6727829f83f`；manifest仍照要求保留TBD。

## 盤點：weaponMount 31件與缺口

逐件、部位容量、現用機型、種類及歸屬證據已抽到 [inventory.json](inventory.json)（31列）。索引與實體component目錄都數得31件；分類優先序為臂甲→拘束→純控制→範圍→近戰→單射，不重複計數。

| 主類 | 件數 | 缺口 |
|---|---:|---|
| 單體近戰 | 10 | 多為泛用傷害，缺明標材料等級的小槽入門件 |
| 單體射擊 | 10 | 大量size2、精粹未明標；貼身盲區與代價選擇不夠清楚 |
| 範圍 | 8 | 全是ball，沒有真正line／cone傷害武器 |
| 拘束 | 1 | 只有縛獸拘束矢，缺零傷、短索、遠捕與晚期選擇 |
| 純控制 | 1 | 繫泊鉗的line，無傷害；不算範圍火力 |
| 其他／臂甲 | 1 | 擋矢臂甲佔weaponMount但不授能力，不冒算武器 |

來源為mechanical28／bio2／ancient1；真正具傷害的29件中，5件能力帶conventional-arms、24件依機體等級取精粹，明填essence的0件。廠商不能從檔名強行認定：兩件有第三刃血統標籤、兩件有通用鐵劍系列標籤、一件臂甲由舊廠lore點名，另外26件未明載製造者。本輪在etymology補明確掛點，不虛構ComponentDef沒有的maker欄。

component本身沒有grade欄，不能把現用機型級別當武器材料等級。按mechanical frame.defaultLoadout反查，D/C/B/A/S各使用11/16/19/14/2種現有weaponMount件，跨級重複使用不重計總庫存；S唯一機械型蝕光-無月只用星痕貫矛與寂滅脈衝。frame檔現有mechanical79含infantry；排除步兵為78種機型，與lead-mech2一致。槽普遍可容size1–2，高級重型槽可容3；新件全部≤2，避免靠換骨架才裝得上。

舊庫還有兩個「凡鐵連吼」同名id；本線不改它們，交去重整合處理。backMount武器沒有算進31件，也不納入本軌新增。

## 設計理念（七句）

先讓玩家選接敵距離、是否留活口與這回合能否再移動，再讓品級決定打得穿哪種獸。凡鐵保留便宜、少池負擔的對人工作，不用誇張傷害冒充對獸主力。精粹D至S直接標在能力，換上高階機也不能把D級短刃洗成S級武器。近戰保留低流光負擔與部位瞄準，遠射付盲區、矢數或流光，範圍武器付每目標較低傷害。拘束區分零傷收捕與帶傷破甲，不把高級拘束器說成能馴服任何怪獸。工坊、獵團與公司都沿既有歷史和供料能力創作，高階件明寫外購材料、門檻與使用代價。效果直接沿用既有失衡、標記、縛網、壓制與牽滯，把件數留給會改變配裝選擇的武器。

## 新件表與可實作規格

已抽到 [new-items.json](new-items.json)（48列），一個未來content檔一列，武器與配套能力分開計數。欄位包含id、類型、中文名、nameEn、一句定位、掛點、廠商、等級、精粹、關鍵數值帶、AI戰術鍵、聲望門檻、新名詞、取捨、範本、檔與欄位規格。「欄位規格」是完整新增定義；工人不必發明能力或重算數值。計畫元資料不擅加進遊戲schema；中文名與招名全標提案。

白話表 [review-draft.json](review-draft.json) 同數48列、每列≤60字，名稱與檔案逐一對應。掛接表 [hooks.json](hooks.json) 24列，包含市場id、逐件item暫價／權重／存量、研發前置、補給與門檻。以上AI清單依wf-table/1存資料檔，plan只保留導覽與摘要。

| 等級 | 新武器 | 凡鐵 | 明標同級精粹 | 三種以上選擇的代表 |
|---|---:|---:|---:|---|
| D | 5 | 2 | 3 | 楔刃／扣足矢／門鉤，再選凡撬斧或凡點吼 |
| C | 5 | 1 | 4 | 旋鉚鑿／汀光矢槍／停步索／扇潮矢筒 |
| B | 5 | 1 | 4 | 掠水長鉤／照隙長槍／千鈞拘束槍／截浪貫矛 |
| A | 5 | 1 | 4 | 折潮重斧／月衡長弓／抱礁拘束鉗／燼雨爐 |
| S | 4 | 0 | 4 | 斷城鏜／巡天長弩／留岸拘束柱／照海紋砲 |

[grade-coverage.json](grade-coverage.json)逐級列同級frame、實際right-weapon槽容量與池；每級至少3種，S件只給可換件的機械型機，不讓古代機改裝。新武器24把中，純近戰主批6、射擊主批6、拘束／壓制主批6、範圍主批6；這是批次目的分類，實際門鉤是近距ball、抱礁鉗兼近戰與拘束，沒有宣稱互斥統計。

同級數值沿numeric-bands：部件D12HP／size1／mass2，C16／2／3，B20／2／4，A22／2／5，S24／2／5。單體主傷依D5–9、C12–20、B18–26、A24–34、S30–40；凡鐵D10與C24是1.2–1.25倍暫例，範圍皆≤26，armorPen≤0.35。拘束零傷與微傷不抬成主傷；範圍約單體六至七成；單體帶效果按八成；表內「帶外說明」保留例外與理由。accuracy與crit取同級帶，無傷拘束不憑空加穿甲或暴擊。基本攻擊AP≤4，A／S重招可5–6；強招帶冷卻或次數限制，S十格狙擊min4且uses3。

武器不自給流光：D不用charge，C以上需charge的列要裝在有池機上。燼以costs heat正值表示，無allowOverload；矢池hard、initial=max、regen0。池宣告不是新增registry，ammo-fw-bind僅新增部件自有池並列補給需求。凡鐵能力與本體皆帶conventional-arms；精粹能力明填essence。屬性減益沿mech scope，照海紋砲只打shield／component，不能當全層殺傷；所有效果都已存在，不新增同義效果。

去重取捨：D門鉤選鄰格小圓域＋牽滯，C扇筒是純傷cone；B貫矛是全層pierce線，S照海是限定光幕／掛件的energy線；C停步索是可重用帶傷，D扣足與B千鈞是有限矢零傷，S留岸是有限次數零傷、消耗大量流光。每種分工都有資料欄位支撐，不宣稱未實作的拖位、推撞、地形燃燒、穿牆或射界。

## 分批與產出交接稿

| 批次 | 內容 | 檔數 | 交接稿 | manifest |
|---|---|---:|---|---|
| fg-gw-01 | 近戰6組 | 12 | [cx-fg-gw-01.md](cx-fg-gw-01.md) | [稿](fg-gw-01.manifest.json) |
| fg-gw-02 | 射擊6組 | 12 | [cx-fg-gw-02.md](cx-fg-gw-02.md) | [稿](fg-gw-02.manifest.json) |
| fg-gw-03 | 拘束5組＋凡鐵壓制1組 | 12 | [cx-fg-gw-03.md](cx-fg-gw-03.md) | [稿](fg-gw-03.manifest.json) |
| fg-gw-04 | 範圍6組 | 12 | [cx-fg-gw-04.md](cx-fg-gw-04.md) | [稿](fg-gw-04.manifest.json) |

完整逐批檔案清單由各manifest.files列出，與new-items的批次相互核對。四批各自封閉，只引用本批新能力與既有效果，可獨立產出。工人模型gpt-6.1-sol、子代理上限1；計畫線未啟用子代理。領導啟動前填base、建立指定worktree、部署manifest；目前只有稿，不建立工作樹、不commit。

## 市場／掉落／研發掛接建議

公開低階件先接新加坡／吉大港，對人重火力接德爾塔market/war-armory，拘束與勘測件接market/old-array，逐件以hooks表為準。舊廠凡鐵屬公開通用品；堅盾、長槍、鐵劍共用圖不鎖聲望。勢力招牌件依D10/C20/B35/A55/S80寫定門檻；目前引擎只鎖機型，故所有勢力武器暫緩實際上架，不能填死資料當作已鎖。第三刃B件也必須等正確營運勢力，不能沿用鹽鷗。

掉落來源的5組對應在 [loot-links.json](loot-links.json)：蝕蟲D→楔刃／門鉤用料、沫顎C→汀光／扇筒用料、盾甲B→長鉤／貫矛用料、垂幕A→月衡／燼雨用料、S料待接來源。怪獸只拆下材料或拘束後取材，不掉完整工廠槍；垂幕A目前只在展示情境，不能寫成已在營運量產材料。S不新增常態領主或古代機交易來源。

研究依hooks表指定的既有research作前置：forge-composite承凡鐵修造、forge-tide-lance承流刃與範圍件、restraint／restraint-lock承拘束、shell-translation承照隙、crystal-refining承遠射。這些是下一批的配方／解鎖建議，不改現有研究，不宣稱完成前置就自動解鎖新件。價格先沿300／660／1800／4800／15000量級、凡鐵七五折，待gm統調；高級物料的消耗與供應不由本線補造。

## 需求與待決

完整8項已抽到 [needs.json](needs.json)，標出負責線、原始證據與保守落地方式。阻止正式上架的主要事項是部件聲望鎖、第三刃營運id、S料／配方與拘束矢供給；計畫與內容定義可先完成。

抵抗性特別註記：共通任務寫「凡鐵依機體級差減半」，但查到現行code與world spec是精粹依級差×0.5、凡鐵固定外甲係數且內層與核0。此差異照GW-01交領導裁定，不偷偷改引擎，也不把尚未實作的規則寫成驗證通過。engine-facts EF-16仍寫舊全局規則，EF-14仍說沒有defaultLoadout，也都已過時；本計畫依現行欄位與已收線REPORT使用essence與明確配裝。

S只代表材料與定位，不新增機魂性格、不讓工坊掌握S精煉；新中文名與產品來歷等既定人審。ga持有裝甲、系統、背掛，gm持有市場與勢力配套，gl持有戰利品；本軌不寫上述檔案。

## 步驟／驗證（僅原任務固定4條）

1. plan含已讀、盤點、七句理念、新件表、分批、掛接與需求；所有長表按wf-table/1外置並連結。
2. review-draft每新檔一列，共48列，白話≤60字，與新件表及manifest對齊。
3. 四份交接稿brief_lint --strict為0，四份manifest合法且mode add、status draft、base TBD、每批12檔。
4. 完成回覆五行摘要＋plan.md路徑，驗收後停止；不跑遊戲測試或擴大範圍。
