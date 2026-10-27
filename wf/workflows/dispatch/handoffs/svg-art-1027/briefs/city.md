# 任務：製作city原生向量樣張

> 已執行契約；下方派工、原路徑及狀態保留歷史快照。[同批交接書](README.md)｜[本批交付與報告](../README.md)。

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/dispatch/README.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md、wf/workflows/common/code-map.md 與母brief wf/workflows/dispatch/handoffs/svg-art-1027.md；親自讀，不只靠摘要。

## 背景與唯一目標
親讀 art/svg-study-1027/art-direction.md 與 content/lore/places/busan.json，畫同一釜山城邦三版：busan.svg冷鋼重工、busan-ritual.svg祕儀科技、busan-feral.svg狂潮異形。山坡入海、貨櫃港運轉、吊臂彩幡、燈籠、黑金機庫為共同設定。三版物件拓撲與主要地標語義相同，但天際線、建築外殼、港機械輪廓、材質與構圖節奏須實質不同，不能只換色。鋼鐵科技厚重神秘狂野恐怖；狂潮也不新增生物建築事實。全為美術提案。
每份SVG root viewBox="0 0 1200 720"，六個直屬獨立具名g，各id精確為 background、far、mid、foreground、dynamic、interactive。背景天空/天象但勿鋪滿不透明rect，保留透明畫布邊緣與天空部分留白；遠景山城市；中景街區港池；前景欄杆管線；動態船旗煙；互動機庫商店碼頭。每層至少有實際幾何內容。
互動層放三個具體可見建築或碼頭group，id分別 hotspot-hangar、hotspot-shop、hotspot-dock，data-hotspot分別hangar/shop/dock，role="button"、tabindex="0"、aria-label繁中清楚，不含SVG script或事件屬性。互動物件本體只放interactive層，關該層時物件與熱點一起消失，勿把本體畫在mid又另放空熱區。三版共享語義與大致位置，勿引入具名新地標。
另寫city-motion.css，動畫僅 .city-view.animate [data-moving] 觸發，每段不超過4秒且只播一次，無animate不動；dynamic層內船旗煙的子g加data-moving="ship"/"flag"/"smoke"，全部至少一個。CSS prefers-reduced-motion:reduce 要禁位移縮放旋轉（可直接animation:none）。不做JS或頁面，領導整合inline SVG、開關與鍵盤事件。

## 範圍
只寫 art/svg-study-1027/ 的 busan.svg、busan-ritual.svg、busan-feral.svg、city-motion.css 與本報告夾 city-REPORT.md。沒列路徑不可寫；不做其他圖、不改content/src/legacy/設定、不做HTML或遊戲整合。
件數 gate：最多5檔；容量 gate：最多600KB，超過停下回報。

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
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/city-REPORT.md`。

## 驗收（固定2條）
1. 指定SVG均存在，XML可解析，title/desc與分組齊全，沒有點陣外連或腳本，圖像對應上列設定。
2. REPORT列來源、美術提案、自查結果；終局回覆DONE或BLOCKED與產物路徑。不宣稱目視驗證。
