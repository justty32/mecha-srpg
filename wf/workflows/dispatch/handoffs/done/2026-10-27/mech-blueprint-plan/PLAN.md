# 一台機甲：先配置、逐件畫、再組裝

先讀：`AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`，再讀本目錄 [CONTRACT](CONTRACT.md)。這份是可交領導執行的計畫，規劃線不實作、不派工。

## 方案與取捨

先完成一台白色分片甲、藍色長尖甲、暗色內骨架的完整原型。固定視角的2D剛性零件已能驗證模組化與動作；不建立通用動畫引擎，不引入3D、mesh、IK或Spine匯出。每件實際 attachment 各自一份 SVG；總成只存在於資料分組，不能把已畫大圖切片冒充逐件生成。

規劃清單已抽到 [parts.json](parts.json)（64件、25總成、8大部位）。欄位 id／major／assembly／bone 對應穩定身份與分組；material／shape／purpose 是具體美術工作要求；phase 決定先骨架再外甲的製作順序；file 是下一階段唯一源檔寫集。陰影、刻線、螺絲不作新附件；單件內可有實際細節群組，視覺深度仍最多五層。

寫集、API與種子已抽到 [execution.json](execution.json)（17列）。欄位 id／kind 供定向取用；owner 是唯一寫入者；stage 是執行閘門；detail 含檔案、數值與固定驗收。原型預估102檔、最多104檔，不要求把既有140葉重新湊滿。

## 步驟與單件先後

G0：領導依 execution 的三份寫集開程式配置sol、展示sol與美術astra；最多三工人。先讓配置線建立schema、矩陣和診斷；展示線可先作UI及純render API，使用清楚標示的占位圖，不把占位當完成。美術待工作單就緒才開始製件。

G1：配置線由畫布與比例種子算8大部位的非矩形包絡，再算25機構總成、18骨與64件局部空間。每層都先有尺寸／位置／輪廓／接點，再往下一層。產出 layout、work-orders、兩張SVG配置圖與diagnostics。先完成錯pivot、越界尖角、凹區邊穿越能變紅的測試，核對bind與動作的活動空間。領導確認有數值的64件工作單與revision後才開G2。

G2：美術先做12件試接：head-helmet、head-face、torso-frame、torso-breast-left、pelvis-frame、arm-left-shoulder-yoke、arm-left-shoulder-cap、arm-left-elbow-hinge、arm-left-forearm-shell、leg-left-thigh-frame、leg-left-knee-bearing、leg-left-shin-shell。這批覆蓋全身、甲片、暗機構與關節，使用與最終相同的檔名及工作單。展示線立即組裝檢查矩陣、局部座標與接縫；失敗回配置或該件修改，不能整台裁切掩蓋。

G3：試接通過後，美術依parts.phase逐批補齊，phase1暗骨架→phase2機構與手→phase3白甲及藍翼→phase4感測器。每件流程固定為讀工作單、畫局部SVG、回填occupancy／接點／revision、單件越界檢查、放入裝配。白甲要有主面／厚邊／陰影，暗骨架從縫隙露出，藍片是獨立長甲而不是換色白甲。遇到空間不夠時退回配置線修改種子並升revision，禁止美術偷偷移pivot。

G4：展示線收64件，完成配置／分件／組裝三模式、語意樹及動作進度控制，產生單一可file開啟的HTML。core保留overlaps寫權；viewer只顯示有界的投影遮擋例外。七個姿態（含bind）與六條動作路徑各21點採樣，產生完整圖、分件圖、動作拼圖、最多7張PNG與診斷JSON。領導核檔案與容量後收件；本輪不擴成第二機型。

## 必用工具

| 工具 | 用途 |
|---|---|
| `view_image` | 藝術親看使用者參考圖、PNG交付目視 |
| `rg`、`node` | 唯讀調查、純TS生成、指定單檔測試 |
| `python3 wf/tools/brief_lint.py` | 領導開工前檢查自己的brief |
| `bash wf/tools/wf-lint.sh --strict .` | 文件與連結驗收 |

## 範圍與交付

唯一原型根為 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/`。程式線18檔、美術線65檔、展示線最多21檔的完整展開規則在execution；沒有同時寫同一檔。件數 gate：150檔；容量 gate：15MB，所有source、generated與證據都計入，任一將超過先回報，不擴域。PLAN／CONTRACT／兩表／REPORT五份規劃交付都位於 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/mech-blueprint-plan/`，總計不超200KB。

不做遊戲接線、人物、城市、第二畫風、武器系統、Spine安裝或匯出器，不改既有美術幾何，不刪原資產。舊展示僅可由領導依父brief權限加新頁連結；全域導航由領導整合，不交工人。

## 資源與禁區

實作屬可寫程式碼線；規劃本線只有本目錄五檔寫權。領導sol、程式sol、美術astra，原生子agent以工具回報；領導子代理上限3，規劃線上限0。全機重負載最多1，工人只跑本線單檔；不跑整包npm，不開GUI、不碰鍵鼠螢幕、不下載、不安裝、不動全域設定、不刪檔。規劃線不commit/push；實作commit/push依其父brief。

## 驗收（固定3條）

1. 配置先於美術，有64張可重現工作單、各層非矩形包絡、骨支點與活動空間；錯誤輸入能使診斷失敗，來源／生成／revision不混淆。
2. 64個實體件各有獨立SVG與局部座標，能逐件關閉／單看；整機具白甲包暗骨架與藍翼層疊，實際SVG最多五層，原圖沒有先畫完整再硬拆。
3. 抬臂、屈肘、屈膝含左右對應的六條路徑與接點／limits／有界遮擋全部有證據；file展示、靜態PNG、單檔測試、文件檢查和未驗項在REPORT分開記，未驗瀏覽器不得稱已驗，未做Spine匯出不得稱相容。

## 時間與回報

以三工人可用且本機工具齊全估計：G1約10–20分鐘，首12件與最小展示約15–30分鐘，64件及動作修正再30–60分鐘；完整原型約55–110分鐘，非承諾時限。約20分鐘窗口應優先交可視配置或已驗的局部試接，不犧牲製作順序去假報整機完成。無需等待本文件排版才啟動，CONTRACT與兩份資料已可執行。

實作領導完成後用原生工具回報DONE／BLOCKED、五行判斷與REPORT絕對路徑；規劃線完成即停，不監工。
