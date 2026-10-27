# 任務：製作portraits共享美術部件原型

> 已執行契約；下方派工、原路徑及狀態保留歷史快照。[同批交接書](README.md)｜[本批交付與報告](../README.md)。

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
在原有kamau.svg/samir.svg初稿基礎，依主線退修改成明確日式動漫，並一次做好紙娃娃部件。先親讀portrait舊稿、來源與母brief。少密集鼻唇溝/多邊形碎陰影；日漫眼型/上眼線、簡鼻、成組髮束、乾淨線稿與2~3階大面積賽璐璐陰影。不能只放大眼睛或幾何logo化。卡茂34歲外貌無角鱗，薩米爾60歲外貌（非45歲臉），不要都少年化。保留原服裝結構與可辨識年齡差。五官不靠密集刻線表現老化。全部未載細節標美術提案。
viewBox統一0 0 640 720，family為portrait-640。layers依遮擋順序為clothes、face、eyes、mouth、hair。每類至少兩選項：既定卡茂/薩米爾，id例如portrait-face-kamau與portrait-face-samir；eyes含眉眼，mouth含鼻口與必要鬚，hair含頭髮。不要把五官畫進face造成換五官仍殘留眼睛；不要把頭髮畫進face。共同臉部中心、眼線、鼻口、衣領接點，兩角色髮型臉型需互換仍可用；若膚色差異，頸/耳歸face，避免衣服夾帶不同膚色皮膚。保持多組自由組合後不出現懸空五官或髮際孔洞。
presets key為kamau、samir，能重建兩名原角色。只寫新部件來源與manifest，暫不改完整肖像SVG（由領導生成覆蓋，避免兩份手維護）。

部件檔是唯一幾何來源：root svg內defs置symbol，每symbol viewBox等於共用root，symbol內具名g；不用CSS變數、不用filter、不用嵌圖。共用全域座標，use以完整width/height插入，避免領導替你調錨點。symbol id全檔唯一，圖形只在symbol定義一次。manifest固定JSON：family、viewBox（字串）、layers（順序字串陣列）、anchors（具名座標物件）、options（每layer對應陣列，每項id/label）、presets（key對應label/title/desc/parts；parts對應layer到symbol id）。options只列可換部件；不可換共用層也列單一選項。presets必須列全部layers。不產出生成程式，領導負責按manifest重建完整SVG，勿手維護重複幾何。REPORT交代錨點、遮擋與可相容限制，實際選項數及來源。

## 範圍
只寫 art/svg-study-1027/ 的 portrait-parts.svg、portrait-manifest.json 與本報告夾 portraits-REPORT.md。沒列的一律不可寫，不做生成腳本/JS/HTML、不做其他美術、content/src/legacy/設定或遊戲整合。
件數 gate：最多3檔；容量 gate：最多450KB，超過停下回報。

## 必用工具
| 工具 | 用途 |
|---|---|
| rg | 查來源 |
| Python標準庫XML解析 | 檢查SVG |
| git diff --check | 空白檢查 |

## 資源與禁區
可寫程式碼線，模型 gpt-6-astra，子代理上限0。不開GUI、不碰鍵鼠螢幕、不截桌面、不上網、不下載、不安裝、不imagegen、不npm、不啟動伺服器、不commit/push、不刪檔、不改config、不寫任何未列路徑。平行工人最多3，全機最多一個重負載，本線不跑重負載。
本環境沒有原生agent工具，領導以codex exec收取終局；本任務明定寫域優先，不寫inbox或ROSTER，以報告檔與最後回覆供領導前景監看收件。

## 工作
親讀來源與現有成果，直接做部件及manifest原型，XML解析與預設對應自查。REPORT用精簡證據，不貼全log。只做本線固定驗收，不開子代理，不新增架構。

## 交付
SVG目的地：`/mnt/c/code/mine/mecha-srpg/art/svg-study-1027/`。
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/portraits-REPORT.md`。

## 驗收（固定2條）
1. 部件XML/manifest JSON可解析，symbol id唯一，全部選項與presets引用存在，viewBox/錨點/遮擋契約齊全；無外連/點陣/腳本。
2. 指定部件來源可還原既定人物或三風格機甲，換件有真實可見造型差異，REPORT列來源/推定/檢查與限制，回傳DONE/BLOCKED。目視未做要明說。

## 主線目視退修：先卡茂一張（最新優先）
現有大眼正面平塗稿已被主線及領導目視退回：依然西式向量肖像，不是日式機戰動漫。不要用report文字宣稱符合，不是再放大眼睛。先只改卡茂的5個symbol，保留共用接點與薩米爾部件，不延伸全部組合，先讓領導重建渲染。
視覺要求：成年男性機戰動畫角色設定稿，34歲氣質。乾淨有粗細的動漫線條，流暢帶顴顎轉折的臉部輪廓，眼睛有狹長上眼線與眼角設計，眼神帶疲倦警覺的表情；不要圓鼓對稱杏眼與粗實心眉。鼻子只用短簡影線與少量側面陰影，不畫寫實鼻翼鼻孔輪廓。嘴只保留有表情的一至兩條簡線與少量下唇陰影，不畫完整厚嘴唇。不要鼻唇溝、口周鬍鬚描邊與下巴鬍子圖標。頭髮改成設計過的短捲成組髮束，外輪廓由有方向的塊束起伏而非一頂扇貝邊帽；用少數大束陰影而非均勻小波浪。臉上2~3階大面積明暗，要有可讀光向，不能一塊橢圓膚色加側面窄條。服裝保留立領肩部補強，減少圖標感、以褶線與厚度呈現。
在640×720原接點框架內完成角色設計，不用移位作弊。嚴格先卡茂；REPORT只報這張退修。可讀現有PNG，勿輸出base64長log。只寫既定portrait-parts.svg、portrait-manifest.json（如需）、portraits-REPORT.md，不改生成完整圖。

## 再補充：單張立繪先過品質（優先於先固定紙娃娃）
主線看現稿仍不過：巨大對稱橢圓眼、完整雙唇、雲朵髮塊、正面avatar。先用固定輕微3/4視角重畫卡茂，肩胸也轉折，成年杏眼收斂，上眼線楔形強弱、眉與視線有態度，鼻僅少量側線及陰影，嘴一條有表情細線+微小下唇光面，短捲髮束有節奏方向非圓雲帽。先單張真正日式機戰動畫立繪過主線目視，再搬同族紙娃娃接點；不要為了維持現在正面接點犧牲品質。其他族部件可先保留，暫不承諾交叉組合通過。領導已有程式框架，無需本線寫JS。首張可改用完整立繪fallback提案，但先只修改既定部件來源以重建，不另開泛泛規矩閱讀。

## 首張已過主線：最後對齊家族並收線（最新優先）
主線已實看kamau-3q-review.png：明確日式動漫，髮束/杏眼/簡鼻口/肩胸姿態符合方向，首張可收供使用者最後審。停止卡茂反覆重畫，保留其設計與接點。
同一人物線沿已接受卡茂的輕微3/4家族接點，修薩米爾60歲外貌，不回舊前視avatar；年長感以臉頰鬆垂、眼皮/眉神/髮線/灰鬚表現，少線、不碎寫實鼻唇溝。可年長專用鬚部件，但兩種臉/髮/眉眼/鼻口/衣服互換要自然，頸口/髮際/眼線與服裝接口一致。必要更新portrait-manifest.json錨點與相容說明，不擴schema。
只寫既有portrait-parts.svg、portrait-manifest.json、portraits-REPORT.md。完成固定靜態自查即終局，不找渲染工具、不base64、不額外試驗。領導會用現有流程重建2預設+2交叉contact給主線。不要重畫已接受卡茂，不開其他角色或新架構。
