# 任務：依程式工作單逐件繪製獨立機甲SVG部件

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/common/data-files.md`，親自讀，再讀 `wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md`、`CONTRACT.md`、parts.json與execution.json。親看 `/tmp/codex-clipboard-8Uo05b.png`。

## 背景與唯一目標

配置程式先輸出真實包絡、活動區、接點與局部座標，你再一件一件畫獨立SVG，最後由另一條程式線組裝。美術重點為白色包覆分片裝甲、藍色尖長甲、暗內骨架、清楚關節間隙與遮擋，不得用方框或僅描工作單輪廓充交付。不要湊舊140層，以64件有意義機構與造型為目標。

## 範圍（排除法寫死）

首12試接通過後已分工：你只寫 `art/mech-blueprint/parts/` 下頭部6、軀幹10、骨盆6、左臂10共32份正式工作單SVG，以及唯一 `art/mech-blueprint/data/attachments.json` 匯總64件；自己的REPORT只寫本brief同目錄 `art-report.md`。源檔命名以正式work-orders及parts清單為準，每attachment一份SVG，assembly只資料分組。先讀工作單再畫，不從任何已完成整機圖抽取路徑或任意拆分。

不做：lower-write-set.json明列的背包4、右臂10、雙腿18件（含你首12中已移交的左腿3件），核心程式、design/rig/slots/draw-order/poses/overlaps、generated、HTML/展示/README、舊美術、其他wf/SESSION/CLAIMS、src/遊戲/spec/依賴/lockfile、他線未追蹤檔。件數 gate：最多34檔（32SVG、attachments與REPORT）；容量 gate：最多4 MB，任一超過先回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `view_image` | 親看參考與新組裝姿態PNG |
| 原生agent工具 | 對領導、core、viewer回報接合需求 |
| `node` | 讀實際工作單與schema |
| `git status --short` | 檢查明確寫集 |

## 資源與禁區

可寫程式碼線，美術模型gpt-6-astra，原生agent啟動/回傳。子代理上限0；團隊同時工人最多3。禁止GUI、桌面鍵鼠、headful、下載、安裝、刪檔、repo外修改、commit/push、全域設定、分支/reset/rebase。不要跑npm/全套或未排程headless/重負載，渲染由領導排程。可做讀寫檔純產生，不取資源鎖。

## 工作

1. 確認generated/work-orders.json確由配置先產，讀每件包絡/keepOut/接點/viewBox與role。骨支點不可bbox自動置中，左右分開正規化局部座標與光向；包絡不足先報core，不自己改配置。
2. 分件畫多面切角、覆甲厚度、機械脊肋、軸套與必要散熱/感測等細節；同片陰影刻線留同SVG。機械結構須服務輪廓與接合，不能大量螺絲灌數。每件獨立源SVG，根g唯一ID可擷取；局部defs僅漸層等純資源，引用ID全域唯一。
3. 精確遵守有限幾何：polygon/circle/ellipse/rect/絕對M L Z path，禁止素材transform/clip/mask、use與曲線。素材最多根g+一層surface，不嵌套出超過五層；描邊保守計入occupancy。任何美術新增語法需先向領導報，不自行擴parser。
4. attachments.json依schema回填source/element/layout/viewBox/occupancy/contacts，occupied輪廓必須含所有可見描邊；實心區不侵keepOut。初版只定2D動作，肩甲附獨立骨，武器跟手骨；跨兩骨液壓件不可硬綁一骨。完成後配合viewer的新姿態PNG親看並修接縫/離體。

## 交付

獨立SVG在 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/parts/`；附件對應 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/data/attachments.json`；REPORT `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mech-blueprint/art-report.md`。

REPORT寫做了什麼、產出、沒做到/證據不足、需要決定的事，末尾附以後交接書該點名的工具。原生回報DONE/BLOCKED與五行摘要；未親看新成品姿態要如實說，不當完成目視驗收。

## 驗收（固定4條，做完就停）

1. 本線32個有意義attachment各自一份源SVG，附件匯總完整64件；每件從程式工作單畫，無整機抽拆、無方框填格或螺絲湊層。
2. attachments.json與每件局部座標/接點/包絡一致，語法/層深/引用符合契約，不修改配置與overlaps。
3. 組裝親看能見包覆白甲、尖長藍甲、暗骨架與關節間隙；動作若有接縫/離體則在本線源SVG或回報core修，留下具體檢查記錄。
4. REPORT完整、白名單內寫集、無自行背景程序、未commit/push；需主觀畫風認可仍交使用者。
