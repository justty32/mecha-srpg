# 任務：建立全新礁鷹分層配置核心

先讀：`/mnt/c/code/mine/mecha-srpg/AGENTS.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/user.md`、`wf/workflows/testing.md`、`wf/workflows/common/data-files.md`，親讀不得只靠摘要。

## 背景與唯一目標

建立不依賴 DOM 或 Konva 的全新配置與 rig 核心。核心通過後，astra 才依工作單畫圖；不得自行設計造型。角色 gpt-6.1-sol；原生代理工具啟動與回報，子代理上限 0。

## 範圍（排除法寫死）

只寫 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/core/` 的 JS ESM 核心、測試、生成 JSON 與接口文件。只做全新礁鷹配置，不做 drawing、UI 或下載。
不讀取、不參考任何既有 art（含 SVG、rig、資料、圖片），不寫遊戲 src/content/spec、根 package/lock、其他 wf 或舊原型。
件數 gate：有意義葉最多160、總節點最多260；容量 gate：產物15MB不含node_modules，任一超限先回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `node --test art/canvas-mech/core/*.test.js` | 核心有意義單元與反例 |
| `python3 wf/tools/brief_lint.py wf/workflows/dispatch/handoffs/lead-canvas-1028-core.md --strict` | 契約驗證 |

## 資源與禁區

可寫程式碼線：僅明列 core 目錄；不 commit、不 push、不刪檔、不建分支、不 rebase/reset、不GUI、不鍵鼠桌面、不安裝下載依賴、不改 config 或 .gitignore。重負載0，平行工人總限3。工具環境出錯回報 BLOCKED，自己的腳本錯自行修正。

## 工作

建立 configureMech(design):AssemblyPlan、validateAssembly(plan)、createLeafJobs(plan)（僅驗過可產生）、evaluatePose(plan,pose):FrameState，drawLeaf(ctx,job,visualState) 僅定契約不畫。每層有 id,parentId,localTransform,尺寸及包絡,pivot,接點,父子變換與畫序映射；語義樹/rig/畫序分開。top-down 分配，驗過生成逐葉 jobs，給凍結版本與摘要 hash。rig 支援父動子隨與連桿端點。

採礁鷹固定前側3/4：低頭弧胸、後掠散熱鰭、寬脛分趾、近側楔盾遠側短砲。材質骨白甲/深紫灰內構/氧化銅散熱/琥珀光。不可用電磁砲文案。

真正樹：root→軀幹→胸艙（承力框組→胸樑/側肋/肩座；外殼組→中央弧甲/側甲/下緣面）、腹腰（旋接組→腰環/腹節/連桿；護甲組→腹甲/髖側片）、背散熱（支架組→背樑/鰭座；散熱組→鰭/導管/排氣口）。頭→感測艙/頸座→光學/頸機構→葉。兩臂各→肩（軸/浮甲組）、上臂（承力/甲殼）、肘前臂（鉸/雙桿/護甲）、手（掌腕、各指總成→指節機構→殼/軸/腹）。兩腿各→髖股（接/框/甲）、膝脛（鉸/伸縮/甲）、足（踝/跟/分趾）。裝備→盾（臂接/骨架/分瓣甲）、砲（握持/機匣/導軌/口）。每組實際有功能，不能平鋪葉、不能螺絲灌數。

畫序遠肢→背架→軀幹→近肢→裝備，可獨立肩甲膝甲排序。姿態待機/舉盾瞄準（近肩約65肘95，可驗後調）/低姿支撐（近膝約60遠25），不宣稱腳接地IK。請自行合理訂全新幾何分配，不畫美術。

job 須含 ancestorPath、localGeometry（局部包絡與可用尺寸）、材質、遮擋、接點、pivot、圖層鍵；完整接口提供 astra 可寫獨立 drawing/，每葉可回傳 Canvas painter，不能讀舊圖。核心文件清楚列實際欄位、單位、角度、矩陣順序與繪製轉換由誰負責。

## 交付

REPORT 寫 `/mnt/c/code/mine/mecha-srpg/art/canvas-mech/core/REPORT.md`，列做了什麼／產出／沒做到或證據不足／需要決定的事／以後交接書該點名的工具。完成用原生工具回傳狀態摘要、明確函式接口與檔案路徑。

## 驗收（固定 2 條）

1. 配置與 rig 單元及反例通過：錯 parent、循環、包絡越界、不合法 pivot/接點、節點/葉 gate、未驗工作單被擋；父動子隨有數值證據。
2. top-down 完整配置與逐葉工作單生成且驗證通過，版本/接口/hash 可凍結，沒有 drawing 實作或任何舊 art 參照。

## 失敗怎麼處置

測出壞的自行修 core；測不出來保持現狀回報 BLOCKED，證據不足不得稱通過。不要自行回滾其他線檔案。

## v1.1 召回修訂（主線親看首圖後授權）

首圖視覺不過：idle/分解0散件。與astra（01a18085-17a7-7272-9aa5-a11413f86440）直接協作，先取得藝術比例及具體幾何/接點清單，再改core。必要新版1.1.0、全驗與凍結新plan/jobs hash後，drawing才重畫。保留既有外殼畫法與功能層樹。

必修頭頸胸、肩上臂肘前臂手腕、腰腹盆骨、股膝脛、踝足趾、盾瓣承力及短砲機匣砲口。驗收不能只有父子包絡containment，必須實際接點同位及承力輪廓連續；只加本次關鍵連接/空隙有界幾何或明定接點到覆蓋檢查及反例，不廣開測試。不可所有片往中心移、不可renderer縮空間或偷偷偏移。

astra定藝術比例，sol只落配置、rig、檢查、凍結；無IK/碰撞/物理拓展。重配清單與舊新差異寫core既有REPORT即可，不另開報告線。規模上限160葉/260節點/15MB不變。

## 完成證據

2026-10-28 DONE。v1.1.0核心46/46、generate --check、52接合/104覆蓋與三姿態同位通過；領導已親跑，core/REPORT.md保存雙hash。 原生工具終局回傳，不走頂層inbox。統一以本輪Canvas提交為git log核對依據；未改領地外檔案，commit/push由領導執行。
