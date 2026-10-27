# 任務：組裝獨立機甲零件並交付離線互動展示與動作證據

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`，親自讀，再讀 `wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md`、`CONTRACT.md`、execution.json。核心線未完成時先依契約搭接，不發明第二份schema。

## 背景與唯一目標

用程式配置工作單產出的獨立SVG組裝一台可動2D機甲，提供配置、分件、骨架與動作的完整可檢視入口。每個attachment是一份獨立源SVG；組裝頁內複製生成內容可以，但來源不得變成一台完整圖再拆。

## 範圍（排除法寫死）

只寫 `art/mech-blueprint/render.ts`、`build-viewer.ts`、`viewer.js`、`style.css`、`index.template.html`、`index.html`、`README.md`、`verify.ts`、`headless.mjs`；`generated/assembled.svg`、`exploded.svg`、`validation.json`、`viewer-data.json`；證據放 `evidence/`，最多7張PNG及一份interaction.json。自己的REPORT只寫本brief同目錄 `viewer-report.md`。execution若定不同檔名先報領導。

不做：核心schema/layout/rig/geometry/build/blueprint.test、design/rig/slots/draw-order/poses/overlaps、art attachments.json或parts SVG、美術造型、舊展示與wf整合文件、src/遊戲/spec/依賴/lockfile、SESSION/CLAIMS、他線未追蹤檔。件數 gate：最多23檔（含REPORT與證據）；容量 gate：最多5 MB，任一超過停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| 原生agent工具 | 向領導回報API與里程碑 |
| `node` | 執行組裝、驗證與headless程式 |
| `view_image` | 親看新原型PNG |
| Playwright headless | 領導排程後實際操作file入口並存證據 |
| `git status --short` | 核對白名單 |

## 資源與禁區

可寫程式碼線，gpt-6.1-sol，原生啟動及回傳。子代理上限0；團隊平行工人最多3。禁止GUI、鍵鼠桌面、headful、下載、安裝、刪檔、repo外修改、commit/push、全域設定、分支/reset/rebase。不要跑npm、全套測試或未排程headless。重負載由領導排程，啟動前確認無他線重負載並使用nice -n 19；全機最多一個重負載。

## 工作

1. 跟core線協調穩定schema/矩陣API，讀唯一配置與工作單，組裝採世界矩陣扁平化，視覺深度最多5，draw-order與骨架分離；不限制骨架資料鏈。
2. 展示提供配置、獨立分件、組裝及骨架/接點/包絡疊圖；語意樹可關大中細、單看、還原，選件顯示局部原點/接點。抬臂屈肘屈膝及左右對應可播暫停、拖進度、回bind，尊重減少動態。
3. 接入geometry作實際SVG核對與21點姿態診斷，只讀core持有的overlaps；若確需新增逐對有界例外，回報core，不能為消紅線修改例外。缺件或壞資料可見失敗。動作只限已定2D，不宣稱任意轉身、Spine匯入或3D碰撞。
4. README記原理、重建、已驗/未驗；headless程式用既有@playwright/test與本機快取，file可開、無fetch、無pageerror。先完成程式再報領導排程，存bind、exploded、抬臂、屈肘、屈膝PNG及互動紀錄，親看接合並回報需美術修正點。

## 交付

入口 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/index.html`；說明 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/README.md`；REPORT `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mech-blueprint/viewer-report.md`。

REPORT四段：做了什麼、產出、沒做到/證據不足、需要決定的事；末尾附以後交接書該點名的工具。終局原生回傳DONE/BLOCKED及五行摘要。

## 驗收（固定4條，做完就停）

1. file入口可操作三模式、語意樹/單看還原/選件/骨架/關節動作；runtime最多5層，不以DOM骨架作唯一真相。
2. 同一來源可重建組裝/分件與頁面，骨架/slot/draw-order分離，實際幾何診斷可報確切部件ID與紅色問題區。
3. 領導排程的headless實際操作成功，有新姿態PNG與互動紀錄並親看；不得以先前舊原型證據冒充。
4. README及REPORT完整、寫集吻合、無未收工背景程序、未commit/push；不足如實回報。
