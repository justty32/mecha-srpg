# 任務：製作剩餘環境與戰場美術有界批次

> 已執行契約；下方派工、原路徑及狀態保留歷史快照。[同批交接書](README.md)｜[本批交付與報告](../README.md)。

先讀：AGENTS.md、wf/workflows/common/user.md、母brief wf/workflows/dispatch/handoffs/svg-art-1027.md。親自讀本線適用規矩；沿用已整理的來源與選角，不重做世界設定研究。具體圖像規格一次讀本夾 scene.md、tiles.md、effects.md 與 art/svg-study-1027/art-direction.md。這三份是同一批次參考，不另外開子工或逐類重讀全部規矩。

## 背景與唯一目標
由 gpt-6-astra 完成靜海修船塢一張、地面/道路/瓦礫/掩體四地格、射擊/命中/爆炸三特效與effects.css。先依scene.md畫可停留作業空間，再依tiles.md/effects.md畫低干擾戰場素材。已有選角來源與CSS接口沿用，不研究新引擎、不做新世界事實。全為美術提案。

## 範圍
只寫 art/svg-study-1027/repair-dock.svg、tile-ground.svg、tile-road.svg、tile-rubble.svg、tile-cover.svg、fx-shot.svg、fx-hit.svg、fx-explosion.svg、effects.css 與本報告夾 batch-REPORT.md。
不做：其他美術（人物/機甲/城市由別線負責）、HTML/JS/生成器、content/src/legacy/設定、其他路徑、遊戲整合。
件數 gate：最多10個檔；容量 gate：最多700KB，超過停下回報。
三份參考子brief原有REPORT要求由本批次統一batch-REPORT.md取代，不寫scene/tiles/effects三份報告，避免重複。

## 必用工具
| 工具 | 用途 |
|---|---|
| rg | 定向讀設定與DOM戰場 |
| Python標準庫XML解析 | 固定結構自查 |
| git diff --check | 空白檢查 |

## 資源與禁區
可寫程式碼線，模型gpt-6-astra。子代理上限0，外部codex工人全機本任務上限3，本線不開子工。全機最多一個重負載，本線只做輕量XML自查。
不GUI、不鍵鼠螢幕、不桌面截圖、不上網、不下載、不安裝、不imagegen、不npm、不啟動伺服器、不commit/push、不刪檔、不改config、不寫域外。不要找渲染工具或自行做PNG，領導已有librsvg離線流程。不要輸出base64長log。只跑下面固定兩條驗收，完成即報告終局，不反覆加驗。

## 工作
九個美術檔與一份短報告。viewBox、title/desc、透明、具名g、禁script/foreignObject/image/外連/點陣。場景與材質用幾何及手寫path，品質優先但不延伸用途；地格俯視正方與單位辨識優先。特效接口嚴格依effects.md，manual .play啟動、一次不超800ms、回到透明、不infinite，reduced motion短淡出。

## 交付
美術：`/mnt/c/code/mine/mecha-srpg/art/svg-study-1027/`。
REPORT：`/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/svg-art-1027/batch-REPORT.md`。

## 驗收（固定2條）
1. 8份SVG與effects.css均存在，XML/metadata/純向量/無外連通過，場景依來源且未載細節標提案；地格與特效符合既定接口。
2. batch-REPORT列來源與美術推定、檔案、自查與未目視限制；完成回覆DONE或BLOCKED及報告路徑，立即終局，不另找工具。
