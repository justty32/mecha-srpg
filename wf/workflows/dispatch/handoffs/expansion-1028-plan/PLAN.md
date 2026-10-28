# 10/28 首輪擴充計畫

規劃基線 `c09b026919eeee03cde68c0f1eb0d289ad4cbe7c`。本文件是可執行的內容契約，**不是完成驗收或舊稿轉正**；普通產出及 focused 驗證交由 sol，領導另收最終實測證據。

## 已收斂範圍

24 個主體：8 台既有世系的新機型、8 個具部位與招式取捨的怪獸形態變體、8 位 human 駕駛／人物。怪獸不是 8 個新 species，也不是替既有個體取名。三批各自只引用同一 BASE 或自己的新檔，可以獨立驗證；不為機甲另造 8 位人，不讓人物跨引用新機甲。

機甲批 `exm-`：8 frame＋8 model＋2 scenario＝18 檔。人物批 `exp-`：8 person＋8 lore character＋2 scenario＝18 檔。怪獸批 `exk-`：8 MonsterDef＋8 ability＋2 effect＋2 scenario＝20 檔。合計 **56 個內容檔案**；不含規劃／驗收報告。每內容檔 ≤16 KB；本輪無新 bodyplan。規劃表可到64 KB、總報告≤1 MB。超過先退回，不靠刪舊檔或改 schema 消化。

完整逐件契約見 [review.json](review.json)（24列）、[concept-dedupe.json](concept-dedupe.json)（24列）。各類工作細節分別是 [mechs-ready.json](mechs-ready.json)、[people-ready.json](people-ready.json)、[monsters-ready.json](monsters-ready.json)。[attachments.json](attachments.json) 列精確六個展示檔及覆蓋分組；機甲與人物展示契約已交工人，怪獸沿領導已發的 `exk-four-corners`（K01–04）與 `exk-split-roots`（K05–08）。展示不得新增地圖、人物、效果或跨批引用來擴檔。

## 差異與世界限制

機甲以控制／自解、射域、資源循環及脆弱承載位置區分，不把既有型號換色；兩件共用汲光件不等於同一定位。所有型錄保持原 lineage、maker、前置型號與有界營運價格；槽位、承載、戰鬥能力須用當前引擎查驗，不能把附屬敘述當已實作機制。

怪獸保留原 species 的招式及生命週期，只加一招；每件有明示部位交換。D–B不加 `name`／`epithet`；短俗稱寫在 etymology、覆寫部位名及 review，nameEn 解釋形態。**K07、K08最終均改用 C 級 species/stalk**：前者柱冠雙核、320 HP且取消外皮再生，根維持非核機動以免捕獲條件矛盾；後者核心由柱身移至高曝光40 HP穗冠、失去sensor，總410 HP。這不是原提案 D燈芯毯／C葦織：其 capture frame 的部位不相容，已明確撤回。新能力原路徑及效果總數不變。

人物的中心是未解決的選擇，不是八個補位職業或制度代言人。戰鬥traits沿用既有內容，需查實際加成後的屬性；劇情不能拿勝負當家人、戀情、信仰或日常支配欲的自動答案。P08只寫等候古機回望的主觀願望，不宣布夸父正式拒認、取代既有駕駛或揭示古代機內心。歷史待裁決 **P01腿傷衝突仍未決**，不要與本計畫同編號人物混淆。

英文命名理由逐件列於review：frame用schema允許的nameEn／etymology；若補aka，必須是 `{faction,name}` 物件而非字串。怪獸不藉英文給低階個體偷加獨名。人物以自然姓名及音譯為主，不從姓名宣告民族本質。

## 查證邊界與規矩

本人先讀本地AGENTS、WORKFLOWS、user/working/art、team-model及dispatch，並讀content全部適用根流程及world-pillars子檔、lore/style/people、core/world資料契約和相關設計裁示。索引／批次表走tabledb，近似內容再定點讀全文。開場已讀SESSION-LOG、WAIT_USER及歷史pending；inbox沒有本輪新令，**未續跑舊任務**。[read-evidence.json](read-evidence.json) 留閱讀範圍與證據位置。

比對基線投影涵蓋202 frames、66 monsters／54 species、186 persons、289 lore characters、88 scenarios，另比對wl／wn／wm尚未驗收批次的角色、玩法、敘事及展示意圖。這是全庫摘要／配裝／角色投影＋最近全文核讀，不宣稱2804筆全文逐字驗收或絕無任何重合。去重表同時列最接近的既有／draft與本輪互相近似者；完稿若失去列明差別，須退修，而非只補一段命名解釋。

當前 code/tests 優先於過期 engine-facts 摘要。MonsterDef 的 extraAbilities／partsOverride／attrMods 已有實作；extraAbilities只能追加，partsOverride只能覆寫既有part，layers/functions整欄替換。loader還要求覆寫part ID與層數和capture.frame相容；K07/08已依此換源。捕獲後重建既有bio-stalk等frame，**不得承諾新變體的能力／形態會保留**。未將「破攻具即封新招」「翼必飛行」「鑽地招真的位移」當引擎功能。

## 交付與驗證責任

本線只寫自己的新規劃檔與 `/tmp/expansion-1028-plan/`，未寫正式內容、engine、schema、spec，未commit／push、安裝、GUI或重測。其他工作線同時新增的batch manifest不屬於本線修改。

靜態自查已確認24列主體、56個唯一路徑、18／18／20批量、每條白話≤60字、所有既有參考範本存在、所有規劃表根層contract為wf-table/1。實際數值、schema、ops／lore引用、效果池行為、捕獲及AI選招仍由產出線驗證；反應招K01須單獨觸發檢查，其餘新招必有AbilityUsed證據。尤其K07雙核的死亡條件與K08失sensor的實際效果不可只看文案。領導統一跑重測並遵守全機僅一個重負載，MCP用stdio而非GUI；不把既有10個loader warnings寫成本輪新問題或零警告。

本輪可恢復規劃問題均已回報並修正：tabledb以`-I`啟動找不到同目錄module，改標準python呼叫；一次Path物件誤傳改字串；少數猜測的檔／part ID改用實際存在值；根層metadata與怪獸展示分組已對齊領導契約。沒有未處理的權限拒絕；不確定項保留為focused驗證，不以規劃完成假裝產品驗收。
