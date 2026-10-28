親讀原交接、content README/batch/world-pillars及適用子檔、mechs/bio-monsters/abilities-effects/acceptance-playtest、style、conventions/code-map；依候選查numeric-bands/templates、現有近鄰與已匯入exm/exk，再讀command/movement/pools/attack/layers/state/loader與AI候選生成的相關行。具體檔案及指紋在[已讀清單](readlist.json)，上輪共用工作流閱讀沿用，不擴讀全庫。

## 產出

DONE：固定四概念，機甲CM兩件、怪獸CK兩件，主線全數核可並已自行交sol；設計線子代理0，未派工。[PLAN](PLAN.md)、[review](review.json)四列、[CM頁](CM-mechs.md)、[CK頁](CK-monsters.md)與[精確寫集](write-sets.json)齊備。CM六個新JSON、CK十三個，互不依賴，各自一展示。機甲批先交，沒有等待怪獸整批才提供可審文件。已修歧義：species維持必填俗名name；B/C monster不加個體name/epithet，其餘核可設計保留。

## 證據

[近鄰證據](evidence.json)每件三筆，保留實際欄位及SHA256；[引用清單](references.json)分既有與本批預定新增。並燭比伏架／汲光／留像的部位拓撲；燼鐘比開扇／汲光／破城槌的熱資源時序；偏弓比吐棘者／背針／空帆的射程、足與自護；沉顎比棧背／背針／燼吻的指定部位、AP競爭與招式替換。

原碼支持broken槍架停裝配招、單／雙履判定、heat require及攻擊後produces、unit最小射程、partAim候選與命中懲罰、原生怪獸AP回復。新規則動詞為零。靜態文件核對見[validation](validation.json)：四列欄位、白話長度、引用、近鄰、十九個新id／檔名、命名澄清與容量；新id和兩怪俗名以限定內容類別rg查無佔用，另核實際路徑。引用核對抓到展示基準的縮寫bulwark-iv，已更正為既有frame/bulwark-iv-rampart，未變更概念。git diff --check限交付目錄；未追蹤交付另做行尾空白與JSON／tabledb核對。

## 限制

本線沒有執行npm、sim、probe、GUI、MCP戰鬥或任何測試；依交接禁令也未啟動全庫lint。靜態文件核對不等於內容已過載入或戰鬥驗收。自然AI、五seed、MCP auto及三回合手動均是交給sol的待驗方案，平衡最多兩輪。兩機僅展示，未接model／營運／聲望取得；兩怪也未接遭遇池，生物frame捕後用駕駛AP，不能宣稱原生沉顎的7AP限制仍然存在。innate不因顎／冠破而消失，已明列，不新增引擎綁定。過時EF-13與現有覆寫實作差異留註，本輪不修工作流。

只寫本交付目錄，未改content/src、未commit/push。共享工作樹已有其他線的lore與batch manifest，均保留；不宣稱全工作樹乾淨。兩個Python附件只重現規畫表與靜態文件核對，不是遊戲實作。

## 需要決定

無待核可概念；四件與兩批寫集皆已核可，交由主線與sol完成實作驗收。若自然AI無法蓄燼鳴鐘／使用支援或新招，按兩輪上限回報原因，不靠預熱、預置buff、手動代打掩飾。依最新指示本輪到此停止，下一輪等主線另發，不自行擴張。
