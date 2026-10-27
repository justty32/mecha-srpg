# 任務：製作effects戰場美術樣張

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
三種戰鬥特效：射擊、命中、爆炸。三份獨立透明SVG，viewBox="0 0 128 128"，低成本幾何與手寫path，不用filter。另做effects.css，以 .fx-stage.play[data-effect="shot"] .fx-art （hit/explosion同理）啟動一次動畫，沒有play則opacity:0；結束必回opacity:0，總時長各不超過800ms，不可infinite，不可全頁閃光。用transform/opacity等CSS keyframes，不用SMIL或SVG script。prefers-reduced-motion: reduce 時改成120ms單次淡出，不scale/rotate/translate，不長時間遮單位。動畫只針對 .fx-art，示意單位不動。領導用 img.fx-art 引用SVG，外容器為 div.fx-stage，data-effect指定shot/hit/explosion，按鈕由領導接線；請嚴格照此接口。
只讀 src/ui-adapter/dom/board.ts、style.css、fx.ts、grid-view.ts，核對既有DOM正方格與疊層；只試作不改src。全部標美術提案，不新增世界設定。

## 範圍
只寫 art/svg-study-1027/ 的 fx-shot.svg、fx-hit.svg、fx-explosion.svg、effects.css 與本報告夾 effects-REPORT.md。除此之外路徑不可寫。不做展示HTML、其他美術、content、src、legacy、原始設定或遊戲整合。
件數 gate：最多5個檔；容量 gate：最多200KB，超過停下回報。

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
產出手寫path與幾何SVG，透明背景；viewBox、title、desc、具名group，禁script、foreignObject、image、外部資源。圖內不寫文字，title/desc可寫繁中。高品質完整構圖，縮到48px仍有辨識度。完成自查並寫來源與美術推定。

## 交付
SVG目的地：`/mnt/c/code/mine/mecha-srpg/art/svg-study-1027/`。
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/effects-REPORT.md`。

## 驗收（固定2條）
1. 指定SVG均存在，XML可解析，title/desc與分組齊全，沒有點陣外連或腳本，圖像對應上列設定。
2. REPORT列來源、美術提案、自查結果；終局回覆DONE或BLOCKED與產物路徑。不宣稱目視驗證。
