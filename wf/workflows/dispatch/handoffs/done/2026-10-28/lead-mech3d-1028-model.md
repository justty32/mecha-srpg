# 任務：以凍結top-down配置逐葉建模衡岳真3D機甲

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`，以及 `wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`、`wf/workflows/common/data-files.md`。已親讀不必重複，不能僅靠上層摘要。

## 背景與唯一目標

你是同一astra Lovelace，原生工具回傳，子代理上限0。本輪你同時持有藝術比例及配置程式，完整先寫top-down→檢查與hash凍結jobs→才bottom-up逐葉mesh→逐層組裝一台全新『衡岳』。Canvas已69403bc2交付，不讀/參考其造型或模型。

## 範圍（排除法寫死）

只寫 `/mnt/c/code/mine/mecha-srpg/art/mech-3d/model/`，包括純layout/rig/接合/工作單/針對測試、真體積葉mesh與材質、凍結證據、短README/REPORT。每源模組最多300行，拆責任不造大型框架。
不做：任何遊戲src/content/spec、根package/lock、Canvas來源或成果、其他art、舊SVG/rig/圖片/資料、viewer/或wf；不把Canvas片拉厚、不用貼圖板、無多台/完整物理/IK/步行。不得參考重用舊造型。
件數 gate：目標約96葉/總<=220，硬上限120葉/240節點；容量 gate：整個產物25MB不含ignored工具/依賴，PNG至多5張且盡量8MB內。任一超限先回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node --test art/mech-3d/model/*.test.js` | 純配置/rig及葉契約有意義正反例 |
| `python3 wf/tools/tabledb.py` | 大於1KB清單的配置/工作單分批存取 |
| 本輪model生成器 | 驗配置、生成凍結jobs/hash與可核先後證據 |

## 資源與禁區

可寫程式碼線，僅model/。原生回傳不寄頂層inbox；不下載安裝、不commit/push、不刪檔、不分支/rebase/reset、不GUI/鍵鼠桌面、不改config/.gitignore/根package。子代理0，總實質工人2。重負載由領導安排，同機1；不自己啟動browser。工具出錯回BLOCKED，自己的腳本錯自行修。下載由sol辦已告知three0.186.1/esbuild0.28.2/platformbinary，其他依賴先回報主線告知。

## 工作

衡岳：低重心拱形雙肩、內收頭艙、厚腰髖寬足、短杖＋左盾，暖灰陶瓷/深藍灰骨架/少量暗紅/暖白感測光。Y上Z前X右。必有封閉真體積、厚度、倒角/凹槽，正側背皆有內容；背面雙背柱/維修脊/排氣，非薄片堆疊。每個零件有承力/機構/防護功能，不螺絲灌數。

先程式明列整機→頭/軀幹/雙臂雙腿/裝備→子總成→機構組→葉，各層局部座標/3D包絡/樞紐/方向接點/父子變換/畫序或透明處理。純配置與rig在Node可驗；配方從整機top-down分配，runtime不能葉auto-fit父。先提供可讀API給sol，函式名可你與sol直接協調，必含layout配置驗證、僅驗過可產jobs、姿態求值、createLeafMesh(THREE,job)或等價葉入口；配置與mesh同人但不准提前造mesh。凍結hash與驗證證據回領導核過即開畫，不等報告排版。

從第一版驗實際接點同位＋有界承力覆蓋：肩座包軸，上臂樑伸入肩肘、肘膝叉耳包軸、脛架接踝、腰架連股；腕/足/持杖盾亦實際連上。bounds包含或相交不等於輪廓連續，需明定可驗接觸區與葉幾何覆蓋，加入本次關鍵非法配置/斷連反例即可，不廣開測試。姿態僅肩/肘/膝、idle/guard/低姿，無IK/物理/步行。

凍結後以葉mesh開始，再機構組/子總成/大部位組裝，保留可核順序。Mesh有有限bounds/真正厚度與側背結構，封閉幾何、法線/材質/陰影合理，不能靠正面遮住空洞。與sol（01a1808b-3bf6-77d1-8dbd-4e4990d7f2c8）直接協調明確ESM接口與Three傳入方式，不互寫。

第一個完整模型可渲染時立即通知sol與領導出圖，不能等行政文件。首圖看基本可辨連續、正側背真體積；過關即收尾，細部列限制不無限追完美。需要改幾何由你升版本重驗凍結，viewer不能偷偷偏移掩飾。

## 交付

REPORT：`/mnt/c/code/mine/mecha-srpg/art/mech-3d/model/REPORT.md`，短列做了什麼／產出／沒做到或證據不足／需要決定的事／以後交接該點名工具。API/凍結jobs/hash/檢查先交，不等REPORT排版。原生回傳階段及DONE，不寄頂層inbox。

## 驗收（固定 2 條）

1. layout/rig/接合/jobs hash與非法配置反例通過；明列top-down分配、先凍結後建mesh證據可核，不超120葉/240節點。
2. 每葉mesh映射齊全、有限bounds/厚度/關鍵連接與工作單一致，bottom-up組裝順序可核；完整正側背模型可交sol離線build，視覺另由PNG親看，不能假稱通過。

## 失敗怎麼處置

自己的錯只修model/，不回滾其他線。環境擋如實BLOCKED；不拿數量或場景存在冒充實際渲染。純幾何與接口先收斂，無大型框架或新工作流。

## 正式配置凍結放行

領導親跑8/8與generate --check verified，180節點/96葉/depth4、56接合/112實體內覆蓋球、每層有限方向dock通過。planHash `511bda9b72e880dc807c8a46f2cd8bd73341def16f9df8def082211e73bfd7a2`，jobsHash `2efb0fa259d36d6393634e64e00b1b45aff90535d7e922d261a9214bb507bb47`。manifest保留meshExistedAtFreeze:false。已即時原生工具授權依凍結jobs bottom-up逐葉建mesh，再逐層組裝，不等行政文件。

## 主線首圖後有界返工

連續真體積已過，視覺需一輪：可讀暗面罩/感測光；胸肩股脛各別功能輪廓，不統一倒角方塊；少量暗分縫/內構/排氣與紅識別，不螺絲湊數。astra改top-down形狀/可見性規格、validate/hash升版後mesh，保留承力接合，不擴框架。UI只改初始hero斜角，正側背仍切換，不挪模型。文件最後，先hero圖給主線判。PNG改最多6張總8MB，整包25MB不變。

## 造型核准後唯一遮擋修正

主線親看hero通過新版基本造型/厚度/關節，停止美術擴改。1.1.1只眉甲局部z .62→.54，其餘造型/接合/節點不動。領導親跑model9/9與generate --check verified，planHash `29db6c1fc23f101bc3b6678bf28ba93dbab116c42c366161bc0e9d06df6e4991`、jobsHash `7c974ab8d01f4bf05fbfd1c6540713dc56e65dfebe82b416723efc3a0c1bb654` 已工具正式放行mesh對應。實際front/hero射線確認後UI全驗與收尾，不擴框架。

## 完成證據

2026-10-28 DONE。最終1.1.1模型15/15、generate --check verified、180步bottom-up及112實三角面承力球證據；領導已親跑。主線已親看hero/側背接受低多邊形prototype，造型停止。 原生工具終局回傳，不額外寄DONE信。git log依本輪統一main提交核對，commit/push歸領導。
