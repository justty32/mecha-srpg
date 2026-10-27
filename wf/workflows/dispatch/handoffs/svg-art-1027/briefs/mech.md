# 任務：製作mech原生向量樣張

> 已執行契約；下方派工、原路徑及狀態保留歷史快照。[同批交接書](README.md)｜[本批交付與報告](../README.md)。

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
繪製堅盾-I型全身四分之三機甲。親讀 content/base/frames/bulwark-i.json、bodyplans/mx-biped-d.json、components/mx-scatter-rune.json、mx-iron-repeater.json、composite-plate.json、world/models/bulwark-i.json。左臂散紋吼砲、右臂凡鐵連吼、軀幹外掛複合裝甲，雙腿與頭感測器完整。注意左右是機體自身左右；左右武器group標明。厚重守點輪廓、關節連接、裝甲厚度、透視一致，不自行加手持盾。形狀配色均美術提案。

## 範圍
只寫 art/svg-study-1027/ 的 bulwark.svg 與本報告夾的 mech-REPORT.md。除此以外路徑一律不可寫；不做HTML、CSS、content、src、legacy或設定修改。不做遊戲整合。
件數 gate：最多3個檔；容量 gate：最多300KB，超過停下回報。

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
產出手寫path與幾何SVG，透明背景；viewBox、title、desc、具名group，禁script、foreignObject、image、外部資源。圖內不寫文字，title/desc可寫繁中。高品質完整構圖，縮到64px仍有辨識度。完成自查並寫來源與美術推定。

## 交付
SVG目的地：`/mnt/c/code/mine/mecha-srpg/art/svg-study-1027/`。
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/mech-REPORT.md`。

## 驗收（固定2條）
1. 指定SVG均存在，XML可解析，title/desc與分組齊全，沒有點陣外連或腳本，圖像對應上列設定。
2. REPORT列來源、美術提案、自查結果；終局回覆DONE或BLOCKED與產物路徑。不宣稱目視驗證。
