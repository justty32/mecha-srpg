# 任務：製作scene原生向量樣張

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
作業場景：靜海修船塢。親讀 content/lore/places/tranquility-repair-dock.json。白色艙板沿吊架展開如翼，船腹下細小工人、交接等待處、未合好艙門，塢口露出黑天。呈現工人可站立、行走與撤架的實際空間與巨大尺度；不畫未設定科技，不新增具名角色或建築。
幾何與手寫path，硬邊陰影與克制色盤，環境構圖透明底（不鋪滿畫布的不透明背景），空間留白可透出展示頁底色，必要建築/船體等實體可不透明。全圖為視覺草案，具體造型、配色、視角與未具名人物外觀皆標美術提案。不要把提案寫成正史。

## 範圍
只寫 art/svg-study-1027/repair-dock.svg 與本報告夾的 scene-REPORT.md。除此以外路徑一律不可寫；不做HTML、CSS、content、src、legacy或原始設定修改、不做遊戲整合。
件數 gate：最多2個檔；容量 gate：最多300KB，超過停下回報。

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
產出手寫path與幾何SVG，透明背景；viewBox、title、desc、具名group，禁script、foreignObject、image、外部資源。圖內不寫文字，title/desc可寫繁中。高品質完整構圖，縮到320px仍有空間層次。完成自查並寫來源與美術推定。

## 交付
SVG目的地：`/mnt/c/code/mine/mecha-srpg/art/svg-study-1027/`。
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/scene-REPORT.md`。

## 驗收（固定2條）
1. 指定SVG均存在，XML可解析，title/desc與分組齊全，沒有點陣外連或腳本，圖像對應上列設定。
2. REPORT列來源、美術提案、自查結果；終局回覆DONE或BLOCKED與產物路徑。不宣稱目視驗證。
