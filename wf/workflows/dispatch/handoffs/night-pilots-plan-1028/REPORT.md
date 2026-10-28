已親讀本brief、ancient-people、style/people、data-model-people，沿用共通wf與acceptance-playtest；tabledb有界查人物索引及numeric-bands人物列。讀兩名新候選的四個既有person近鄰、ZIP八人現有lore正文、前輪四生活人物設計，核對長槍-V4與兩個trait原檔，最後單點追makePerson／makeUnit／personAttr／roleAttr建構與計算。具體來源見[readlist](readlist.json)。

## 產出

DONE，兩概念與完整配方已獲主線核可。[PLAN](PLAN.md)、[review](review.json)、[SHOWCASE](SHOWCASE.md)固定2person＋2lore＋1scenario五檔，皆night-p-前綴，一檔≤16KB、總≤80KB。瑟琳主動為命中紀錄選錯目標，後果不立即洗白；馬特烏斯貪額外獵獲、假報失敗，花自己的錢脫困仍講黑色笑話。敘事與數值各有取捨，不採ZIP八人／夜間四人的主要情節，沒有互相改寫同一事件。

## 證據

每人兩個既有person近鄰，同列原attrs/traits/HP、lore短介、敘事與數值差異。人類六屬性與HP在既有建議帶，AP9、fatigue100/-15，growth沿ren-kasai；perks空、無新能力。既有trait皆scope:person/permanent，數值加減從實檔讀出。

關鍵限制已向主線回報並獲接受：makePerson自然路徑不自動掛traits，故原先「有效」特質算術已改標稱，不冒充實際值。實際自然person值為瑟琳56/6/44/5/7/46、馬特烏斯48/9/56/7/6/50（準／迴／志／反應／感知／操控）；同長槍展示仍有準度與速度的取捨。不預填效果或修引擎。靜態引用／欄位／五檔／短介／原始特質算術核對見[validation](validation.json)與[references](references.json)；未宣稱戰鬥已平衡。

## 限制

只展示，未接戰役招募、背景池、市場或劇情解鎖。兩人成人現役、未認主，只開公版機。lore人物relations/events空，gameRefs對應各自person，沒有新大戰果、待裁決人物或反向關係改寫。自然AI、五seed及MCP皆為sol待驗方案，設計線沒有執行任何測試。只寫本報告目錄，子代理0，未改content/src、未commit/push。

插單CM診斷已另存原戰鬥REPORT；主線最後裁示CM六檔整批留隔離draft，不拆收，本線不再調整或補waiver。CK instinct soft/bands空的原設計意圖已回主線，僅披露無band懲罰，不等於整個生物系無代價。

## 需要決定

無待核可設計；主線已核可兩人、五檔與自然base值展示限制。實作驗收由主線／sol處理。本線終局停止，不再開設計或子代理，釋出所占工位。
