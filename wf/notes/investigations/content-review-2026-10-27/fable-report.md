# Fable 設計報告（2026-11-05）

[題綱](fable-brief.md)｜[審閱入口](README.md)｜[非人物清單摘要](content.md)

## 方法與限制

唯讀調查 HEAD `4d47f485`：親讀 rules／ops／sim 相關檔與 9 件部件 JSON、engine-backlog 74–77、fill-rulings、lead-fill-gear 計畫與 ga／gl REPORT；用 python 掃 74 bodyplan／216 frame／187 component 的槽與尺寸。依規矩**未跑 node／npm**，所有驗證都標待執行；不以舊測試數字宣稱 HEAD 通過。未改程式碼、內容、數值，未 commit。注意 HEAD 比 10/27 審閱多出 59 台 frame（expansion-1028），結論已按 HEAD 重算。

## 三題摘要

**SIZE-01～09** → [fable-size](fable-size.md)。全庫 armorMount／systemMount 槽全為 size 1（連 ancient 骨架都沒有這兩種槽），9 件零槽可裝；size 2 來自 gl 計畫誤用武器帶。推薦 **A：保留 size 2，把 5 個重型 bodyplan 的 torso 甲槽／一個系統槽升到 2**（純資料、size 1 件照裝、既有配裝不動），讓 9 件成重型機專用拆件；退而求其次 C（A／S 四件留 2、B 五件縮 1）。

**LINK-01／74** → [fable-link01](fable-link01.md)＋[設計](fable-link01-design.md)。已證實 rules 零消費 poolMods／attrMods，ga 四批實測差值全 0；contribs／recomputePool／毀損重算基礎設施都在。推薦**只在戰鬥 makeUnit 掛 contribs**（initializePools 後、init.pools 夾限前），source 用 `component:<slot>`，部件層毀時按 source 撤；營運側不建 contribs 故天然不重複；戰鬥存檔整份序列化、營運格式不變。代價：68 台 frame 與 5 情境用到 8 件 mx-* 修正件，黃金必重錄。

**LINK-02／75–77** → [fable-link02](fable-link02.md)。聲望門檻只認 ModelDef、部件上架無 requires 欄、研究只寫無人讀的 flag、戰後 loot.components 永遠空、`stock:fl-*` 無產出；另有 4 件 fm-* 已無門檻上架。推薦 **E1：MarketDef item 加 `requires`（聲望／研究）**，門檻逐列填、不預設全鎖；接著 **E3′ 獸屍拆解按 species 表給 stock:fl-***；ComponentDef 加 maker（E2）等裁示；遭遇塞件等掉落（D2）無效，別做。

## 需使用者裁決（白話）

1. 巨獸甲要不要「只有重型機裝得下」？要 → 升哪幾種重型骨架（建議 5 種 24 台，保守 2 種 10 台）；不要 → 9 件縮成 size 1。
2. 被動修正先只修戰鬥結算、機庫顯示延後可以嗎？黃金重錄要和國家機甲那輪（backlog 55）合併嗎？共鳴門檻先不做？
3. 勢力特色部件要不要像機甲一樣刷聲望？要的話門檻同機型表還是低一階？已上架的 4 件 fm-* 先下架嗎？
4. gl 拆件材料從獸屍「拆」直接給材料，還是改成掉部件實物？

## 交接

三題都是「要動手」：裁決後進 [planning](../../../workflows/planning.md)；engine-backlog 74–77 不重登，收線時更新該列。engine-facts EF-02／EF-13 與 content/mechs.md 的 attrMods 說法要隨 74 同步。
