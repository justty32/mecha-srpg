# 任務：製作variants共享美術部件原型

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
保留主線已目視可用的bulwark.svg骨架/接點，將該稿轉成共享symbol來源並增加三套風格可換部件，不先手畫完整變體。親讀art-direction.md與母brief；frame/bodyplan/components來源沿用mech.md。機械雙足，左散紋吼砲右凡鐵連吼、軀幹外掛複合裝甲不變；勿鏡像後換錯左右，武器組symbol包含左右兩件外觀並標data-side，不改數值或正史。固定四分之三接點與共享四肢，外殼肩甲/肢體覆甲可屬armor，換甲後外輪廓實質不同。
viewBox統一0 0 800 960，family為bulwark-800，layers順序為limbs、torso、head、armor、weapons。limbs/torso可共用單一symbol，其餘各3選項cold/ritual/feral，至少兩類同時替換呈現真差異。冷鋼沿用原基準承重方切輪廓（原配色可保留說明）；祕儀骨白黑金暗紫，流線殼板與儀式排列，仍機械非魔法設定；狂潮煤黑暗紅病綠，金屬曲板、管束、不對稱破甲，不能生物化。三者頭/肩/裝甲/武器輪廓明顯不同不只換色。固定接點但形狀盡心，鋼鐵厚重神秘狂野恐怖，工業材質用少量清楚硬邊層次。
presets key為cold、ritual、feral。只寫部件來源與manifest，不改原bulwark.svg、不新寫完整變體，由領導生成重建。

部件檔是唯一幾何來源：root svg內defs置symbol，每symbol viewBox等於共用root，symbol內具名g；不用CSS變數、不用filter、不用嵌圖。共用全域座標，use以完整width/height插入，避免領導替你調錨點。symbol id全檔唯一，圖形只在symbol定義一次。manifest固定JSON：family、viewBox（字串）、layers（順序字串陣列）、anchors（具名座標物件）、options（每layer對應陣列，每項id/label）、presets（key對應label/title/desc/parts；parts對應layer到symbol id）。options只列可換部件；不可換共用層也列單一選項。presets必須列全部layers。不產出生成程式，領導負責按manifest重建完整SVG，勿手維護重複幾何。REPORT交代錨點、遮擋與可相容限制，實際選項數及來源。

## 範圍
只寫 art/svg-study-1027/ 的 mech-parts.svg、mech-manifest.json 與本報告夾 variants-REPORT.md。沒列的一律不可寫，不做生成腳本/JS/HTML、不做其他美術、content/src/legacy/設定或遊戲整合。
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
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/variants-REPORT.md`。

## 驗收（固定2條）
1. 部件XML/manifest JSON可解析，symbol id唯一，全部選項與presets引用存在，viewBox/錨點/遮擋契約齊全；無外連/點陣/腳本。
2. 指定部件來源可還原既定人物或三風格機甲，換件有真實可見造型差異，REPORT列來源/推定/檢查與限制，回傳DONE/BLOCKED。目視未做要明說。
