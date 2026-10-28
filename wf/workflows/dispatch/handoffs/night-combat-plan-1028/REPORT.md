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

## 22:01 有界平衡建議（讀既有結果，未另跑測試）

依主線插單親讀night-combat-lead-1028/cm的REPORT、CM01/CM02五seed摘要與seed1的input／事件，另彙總兩組五seed命中；核對/tmp/night-combat-lead-1028/wt-cm兩新frame、基準frame、bodyplan與配裝。這是第一輪真實結果的診斷建議，不是已完成第二輪平衡，也不替先前REPORT的「未測」改成設計線有測。

先處理比較偏差：十場固定新機player(2,6)、基準enemy(17,6)，同葛西蓮、focus-fire，但skirmish-20的兩側接敵路徑不同，五seed未交換側。CM01每場基準先手、卻由並燭先取得攻擊；seed1伏架首輪走位，第二輪花AP架砲，第三輪才首次射擊，並燭已累積三射。因此「先動」不等於「先打」，不能把5/5直接歸因並燭傷害。CM02每場燼鐘先手仍輸，先手不足以解釋它偏弱。兩組seed1皆為撤退判負、無死亡，不是摧毀核心。第二輪在相同seed對照加交換slot/座標的鏡像配對（只調驗證fixture、既有AI與配裝不動），把側別、首個合法攻擊回合、支援AP與撤退原因一起列出。

CM01唯一優先旋鈕：若鏡像後仍偏強，將新bodyplan的gun-mast exposure由1.5試2.0，允許範圍2.0–2.5，其餘HP、傷害、資源不動。依據：兩邊同槍同池，並燭優勢含伏架支援耗時；seed1並燭13次射擊對伏架7射＋3架，槍架直到第7輪才破外甲，集中武器的代價沒有充分發生。提高突出槍架被普通射擊抽中的權重，直接驗原設計弱點，不砍共享槍。這也可能減少軀幹受擊，不保證總生存下降；要看槍架結構破壞／失雙槍回合與整體結果，不因只改一個數便宣稱通過。若換側就消除5/5，先保留1.5，不為過單邊門檻硬改。

CM02唯一優先旋鈕：新frame.baseAttrs.accuracy由2試6，建議範圍6–8，其他數據與寒泉保留。五seed合計只有9/39次攻擊命中（約23%），實際chance多為35%，最低20%；seed1七擊全Miss、對基準造成0層傷害，故先處理有效命中而非把18傷害膨脹。新招自然蓄燼已成立，每場1–2次；不是預熱不足或寒泉必定搶走燼。基準有疾焰背翼主動閃避、長程追矢、六件重配裝及厚架，燼鐘只有三件、短程鋸與熱門檻扇面；同B不代表等配裝價值。加4至6點準度同時改善鋸與鐘，保留接敵與蓄燼代價；不得改既有熔鋸／背翼或AI。

以上每機只一項候選改動，鏡像驗證優先；計入原定最多兩輪，不加新waiver、不把混級展示5/5勝當平衡證明。若第二輪仍一邊倒，照實退回／暫緩收件，不再加第二旋鈕或擴測。保留heat29/30、槍架與單雙履既有機制證據；精確實作由主線決定。
