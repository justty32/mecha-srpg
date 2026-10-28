# 任務：依凍結工作單逐葉繪製全新礁鷹

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`；已親讀者免重讀，接口仍需讀實檔。

## 背景與唯一目標

Lovelace astra 為本輪唯一美術工人，原生工具回傳，子代理上限0。依完整 top-down 驗證過且凍結版本的葉工作單，由最底層逐葉畫再逐層組裝一台礁鷹。此交接預先登記，領導明確發出凍結版本與檢查證據前禁止開畫。

## 範圍（排除法寫死）

只寫 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/drawing/`（含Canvas葉painter、葉契約檢查、製作來源與REPORT）。唯讀本輪 core/ 與領導給的凍結工作單。
不做：不讀取/參考/搬用任何舊art造型、SVG、rig、資料或圖片；不寫core/viewer/遊戲src/content/spec/根package/lock/wf；不先畫整機再拆、不平鋪假樹、不螺絲灌數。件數 gate：最多160有意義葉、最多總260節點（上限而非最低門檻）；容量 gate：全部產物15MB不含node_modules，任一超限回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node --test art/canvas-mech/drawing/*.test.js` | 逐葉契約與反例 |
| 本輪core驗證與工作單生成器 | 確認版本hash與真實逐葉來源 |

## 資源與禁區

可寫程式碼線，只寫drawing/。不下載安裝、不GUI、不鍵鼠桌面、不刪檔、不commit/push、不分支/rebase/reset、不改config/.gitignore。未授權重負載；如需headless圖驗交領導安排。不得代改核心幾何；空間不夠先回報修改工作單並重新驗證凍結。

## 工作

礁鷹固定前側3/4，低頭弧胸、後掠散熱鰭、寬脛分趾、近側楔盾遠側短砲，骨白甲/深紫灰內構/氧化銅散熱/琥珀光。短砲/光矢砲，不用電磁砲或硬科學文案。

按每個job的ancestorPath、localGeometry、材質、遮擋、接點、pivot、畫序鍵，以Canvas路徑/曲線/裁切/漸層/反光/陰影畫獨立有辨識度葉件。每葉內明暗是畫法，不另灌零件。可共用材質工具，但不能所有葉共用矩形輪廓敷衍。drawLeaf(ctx,job,visualState)最終實際簽名、局部原點、matrix由誰apply，以凍結core/API.md為唯一契約；不在本brief憑空改接口。

記錄先逐葉、再機構/裝甲組、再子總成、大部位、整機的組裝順序與已核對job ID，不能只交整台視覺。高完成度先一台完整，葉的輪廓必須支持待機/舉盾/低姿的重疊與動作。請回報跨葉遮擋或包絡問題，由領導裁決。

## 交付

REPORT寫 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/drawing/REPORT.md`，列做了什麼／產出／沒做到或證據不足／需要決定的事／以後交接書該點名的工具；原生回傳摘要及實際接口，不寄頂層inbox。

## 驗收（固定 2 條）

1. 凍結jobs每葉有對應Canvas painter、ID/版本hash一致、無孤兒或漏葉，契約正例及反例通過。
2. 完成bottom-up逐層組裝紀錄，整機可交viewer整合，來源全新且未使用舊art；視覺仍由領導實際PNG親看，不假稱已驗。

## 失敗怎麼處置

自己的程式錯自行修drawing；工具環境擋回報BLOCKED；配置幾何不合理則先提必要修訂，不可越權改core。未凍結前保持等待。

## 正式凍結派工（2026-10-28）

領導親跑44/44核心測試通過，generate.js --check verified；184節點、94葉、最大深度5。接口1.0.0，schema reef-hawk-assembly/1。planHash `50b30df1e262b5ef604d8c4e60cfa680d68ef065f1834611232f750bda17af40`，jobsHash `53fb13f36cbf065fcb0c81d74a8c2b0d437195003bbce8414fbc13e13c00b42c`。

正式工作單：`/mnt/c/code/mine/mecha-srpg/art/canvas-mech/core/leaf-jobs.json`，wf-table/1，94件在rows，以tabledb分批查，不整份塞context。配置 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/core/assembly-plan.json`；明確接口 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/core/API.md` 與 index.d.ts。manifest frozen:true。現在可以按葉→機構/裝甲組→子總成→大部位→整機逐層畫與組裝。

繪圖正式入口 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/drawing/index.js` 匯出 drawLeaf(ctx,job,visualState)。viewer先套一次worldMatrix，葉只局部bounds，不重套、連桿不重算。此凍結後幾何不擅改，若視覺空間不合理回報必要修訂再驗。

## 首圖不過後 v1.1 協作

主線親看首圖確認散件，授權與core直接協作。astra先給具體比例/局部配置/接點覆蓋清單，core升版重驗凍結後才修新版畫件。保留外殼畫法，必修頭頸胸、肩臂肘腕、腰盆、股膝脛、踝足趾與盾承力。禁止viewer偏移或renderer縮空間。第一張新版完整圖仍優先回傳，不等文件。

## v1.1 正式放行

領導親跑46/46與generate --check verified，已即時工具放行，不等行政排版。1.1.0，184節點94葉；52接合、104requiredCoverage。planHash `f1b97b47699338a391a1f739c92cdf51e68169df5203f3e6c9f9d4735669bcfa`，jobsHash `aedd37267a21e6edeb197fd0c4339a16d4919bdd3252d622180ec56743362d7b`。依新版API/jobs必要修主輪廓接合與凍結映射，立即第二圖，不擴美感。

## 完成證據

2026-10-28 DONE。drawing9/9正反例通過，184步bottom-up紀錄完整；主線/領導/astra/UI親看1.1待機基本整機通過，drawing/REPORT.md保存限制。 原生工具終局回傳，不走頂層inbox。統一以本輪Canvas提交為git log核對依據；未改領地外檔案，commit/push由領導執行。
