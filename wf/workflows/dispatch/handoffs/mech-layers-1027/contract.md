# 機甲階層契約 v1（鎖定）

現有family、layers畫序、preset與接點保留。唯一新資料來源是art/svg-study-1027/mech-layers.json；美術工維護SVG及此JSON，程式工依此契約實作，不互寫。

## 資料

```json
{
  "version": 1,
  "family": "bulwark-800",
  "nodes": [
    {"id":"arm-left","parent":null,"label":"左臂（機體左）","level":"major"},
    {"id":"arm-left-shoulder","parent":"arm-left","label":"左肩總成","level":"middle"},
    {"id":"arm-left-shoulder-shell","parent":"arm-left-shoulder","label":"左肩外甲","level":"leaf","purpose":"armor"}
  ]
}
```

大層root parent=null；中層只屬一大層；葉只屬一中層。無多父／循環／重複id。每節點中文label。葉purpose限structure/armor/decoration（結構／外甲／裝飾），用途不等於深度。大層至少頭、軀幹、左右臂、骨盆、左右腿、左右武器。機體左＝畫面右。

葉對應來源symbol內有實際可見幾何的g或圖形：加 data-mech-node="葉id"。SVG元素id本身保持全檔唯一，可含風格前綴；data-mech-node語意跨三風格穩定共用。同一語意葉可有多個跨symbol片段；只計一次。不得同一片段有兩個葉標記祖先、不得空g。葉內可包含構成同一零件的描邊／陰影。全部可見幾何都要受某葉控制，不能只圈細節而留下關不掉的臂輪廓。

## 有效計數與控制

取Assembly.assemble產生的當前selected symbol IDs，收集其data-mech-node（不含未選風格）；去重後才是當前有效葉集合，三preset各>=100、目標約120。每葉實際含path/rect/ellipse/circle/polygon/polyline/line/use之一，幾何非空。父僅在有當前葉後代時呈現；有效葉數另顯示可見數。標題／空容器／每顆螺絲灌數不計。不能靠重新命名同一線段湊數。

可見性純邏輯存在mech-tree.js（globalThis.MechTree），不碰DOM；state保存節點自身偏好和solo ID，effective=自身及祖先偏好與solo子樹限制。solo顯示所選子樹（暫時忽略該子樹原隱藏偏好以確保真正單看），退出不改原偏好。換件保留穩定語意偏好，未裝葉不計。reset清除偏好/solo。fallback停用樹控，回部件模式恢復。

展示機甲當前instance複製已選symbol的可控幾何、命名空間化id與本機引用；僅對instance下data-mech-node施加display，不改共享defs或其他預覽。保留來源transform、style及原畫序。換件/配色後重新綁樹可見性。UI用原生details/summary、label checkbox和button保留鍵盤語義；初始展開大層、中層收合。

## 領地與驗收分工

astra：mech-parts.svg、mech-layers.json、art-REPORT.md。sol：mech-tree.js、mech-tree-ui.js、mech-tree.css、demo.js、rebuild.py、index.template.html與生成index.html/bulwark三圖、check-tree.cjs及code-REPORT.md。原assembly.js公開API盡量不變；若必要可由sol修改。不得修改人物輸出（rebuild可加僅機甲模式或確保原人物byte不變）。領導：子brief/STATUS/本契約、README/SOURCES、驗證證據與總REPORT。mech-manifest.json保留原值，新增層資料不塞manifest。

先astra寫語意資料，再sol用真實資料驗證；sol可先依契約寫邏輯，不等美術。若契約有無法滿足的具體點，在各工REPORT/狀態說明，由領導裁定，勿擅改欄位。新資產與機械細節是美術提案，不新增世界事實。

## v1.1 母brief新增硬限制與動畫（優先於上述舊限制）

語意隱含root第1層，大/中/葉分別2/3/4層。實際SVG從畫布1算起，含use展開、組裝wrapper最深5。來源symbol內容要扁平：symbol→單一transform美術group→葉直接圖形，或symbol→葉group→圖形且transform就地繼承；不保留多重無用group。程式instance目標svg(1)→assembly(2)→symbol幾何group(3)→葉group或直接圖形(4)→圖形(5)，不再加part wrapper；必要data-part直接標幾何group。完整SVG輸出也展開flatten可視幾何，避免use wrapper疊超5。defs資源不是視覺層，但其被引用的symbol要展開計數。

新增動畫資料採來源葉圖形/葉內附屬效果上的data-mech-effect值sensor/sheen/vent/energy/particle（可空白分隔多值）；附屬效果仍在其葉控制範圍，效果非額外灌數葉。astra負責實際效果幾何、local gradient/mask/clipPath/filter及mech-effects.css；啟動感測/甲面掠光/散熱或能量至少3種不同視覺。幾何/效果共用來源、不增加重複手維護稿。

sol負責mech-motion.js的JS時序（可純狀態+DOM適配分函式），機甲instance設data-mech-phase=idle/sensors/sweep/energy，data-mech-play=running/paused，data-mech-reduced=true/false。astra CSS只依這些屬性及data-mech-effect設計，各phase約1.2秒、單次總3.6秒後回idle。播放從頭或暫停續播、暫停凍結CSS動畫及JS時鐘、還原回idle清除時間。初始idle；reduced-motion靜態高亮無位移/閃爍。選取節點後對其可見葉加data-mech-selected=true，astra設計高亮；隱藏葉display:none遮全部附屬效果。

新增領地：astra可寫mech-effects.css；sol可寫mech-motion.js，嵌入CSS連結，接啟動/暫停/還原按鈕，純時序測試。最新總gate50檔/6MB。Node驗證深度及動作狀態；領導PNG用靜態phase/效果關鍵影格，不能冒稱瀏覽器動畫目視通過。

## 收尾裁示

換件/配色重建instance一律重置演出（idle、elapsed0、取消timer），再按播放從頭開始；不承諾跨重建續接CSS時間。還原可見性與還原演出分開。左右臂仍獨立於武器，各在UI標明不含武器，新增成對臂+武器顯隱直接設定兩節點偏好並退出solo；不新增依賴架構。效果強化只在既有葉內擴展寬分支，不改本體造型或葉數。
