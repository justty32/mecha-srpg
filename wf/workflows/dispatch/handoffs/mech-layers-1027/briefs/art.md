# 任務：保持已接受機甲造型，實作百層語意幾何

> 已執行契約；下方派工、原路徑及狀態保留歷史快照。[同批交接書](README.md)｜[本批交付與報告](../README.md)｜[目前 API 契約](../contract.md)。

先讀：AGENTS.md、wf/WORKFLOWS.md、wf/workflows/common/user.md、wf/workflows/team-model.md、wf/workflows/feature-dev/README.md、wf/workflows/common/conventions.md；本輪母brief與同目錄contract.md。親讀必要規矩，沿用現有資產，不重讀前輪logs。

## 必用工具

| 工具 | 用途 |
|---|---|
| Python XML/JSON | 本機資料與幾何核對 |
| Node內建 | 有界純邏輯檢查 |
| git diff --check | 本線空白檢查 |

## 資源與禁區

可寫程式碼線，只寫明列路徑。子代理上限0；整體平行最多3工、最多一重負載，本線不得跑npm或遊戲測試。禁止GUI/鍵鼠桌面、上網/下載/安裝、伺服器、刪除、commit/push、改config、遊戲/content/src/legacy、其他美術或舊歷史報告。不要自行找渲染工具或重探瀏覽器，PNG由領導做。

本輪依母brief寫域，不寫共享ROSTER/CLAIMS/inbox；領導在本輪STATUS記領地與工況。以本輪REPORT和exec終局作回報；要傳消息可寫自己的REPORT，領導輪詢。完成後直接終局退出，不留背景工。

## 範圍

只寫art/svg-study-1027/mech-parts.svg、art/svg-study-1027/mech-layers.json及本輪art-REPORT.md。不做其他檔案、生成圖、框架。件數 gate：3檔；容量 gate：新增1MB，超過停下回報。

## 工作

沿contract.md，保持現有三套輪廓與配色、共用接點和畫序，astra親自設計有義拆層及必要可見機械細節。每preset>=100真實葉（約120）；大量現有path可合理歸面板/套環/活塞/管線/熱口/燈號等，不切單條線或螺絲湊數。全部可見幾何含左右臂骨架、外甲、手部必須屬實際語意葉，關臂不殘留其輪廓。武器大層可獨立；REPORT說明左臂與左武器分別控制。三風格共用穩定語意ID；同葉跨symbol多片段仍算一葉。葉用途structure/armor/decoration正確。

先寫mech-layers.json後補SVG，程式工並行依契約。完成只做以下固定核對，別加渲染探查。主線已有原美術目視接受，不重畫人物城市。

## 交付

直接共享工作區。寫 `/mnt/c/code/mine/mecha-srpg/wf/workflows/dispatch/handoffs/mech-layers-1027/art-REPORT.md`，記模型、三preset葉數及用途/語意例子、保持造型情況和提案邊界，終局DONE或具體阻塞。

## 驗收（固定3條）

1. XML/JSON有效、所有id唯一、樹大中葉父子無循環，葉都有真實非空幾何。
2. 依原manifest的每preset選symbol去重計數各>=100；引用正確，無未選風格灌數，記用途計數。
3. 保留現有三風格和左右武器，不修改領地外檔案，git diff --check通過，REPORT落地後退出。

## 最新追加（必讀contract v1.1）

使用者追加五層硬上限、奢華SVG效果。你同步負責mech-effects.css及來源中的效果幾何，新增此一檔寫域，件數gate4檔、容量1MB。至少感測啟動、甲面掠光、能量/散熱三種不同視覺，允許本機gradient/mask/clip/filter。與sol的data屬性接口見contract.md v1.1。SVG可視展開含assembly最深5，請扁平到單一外transform組＋葉組＋圖形，不留舊多重group。驗收第1條增加深度，第2條增加3效果不同幾何與CSS初始靜止/reduced-motion；仍固定3條。先讀更新母brief。

## 主線目視後唯一有界強化

已看layers-contact/effects-contact，基礎造型與分層可收，不重畫。僅強化效果，400px展示需一眼分辨：感測啟動有可見校準環/掃描光帶，能量增加有方向的電暈弧/粒子軌跡/散熱羽流。沿三風格色系，不頻繁強閃、不靠全機opacity脈衝。所有新圖形仍附既有葉、寬分支最深5，無新語意層數灌數。請在既有mech-parts.svg與mech-effects.css更新，其他不動；母brief允許新增合理本機gradient/filter資源。REPORT記本次增強與最明顯靜態keyframe的opacity/transform/clip數值或凍結方法，領導依實際效果來源產PNG。不再做前輪全部驗證，只核新增引用/深度/效果受葉控即可。
