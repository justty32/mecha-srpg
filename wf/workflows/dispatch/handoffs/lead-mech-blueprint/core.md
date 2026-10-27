# 任務：實作唯一機甲配置、骨架與幾何驗證核心

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`、`wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/feature-dev/README.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/testing.md`、`wf/workflows/common/data-files.md`；親自讀，再讀規劃的 `wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md` 與 `CONTRACT.md`。若PLAN還未出，先照CONTRACT寫schema/純矩陣，資料待完整execution/parts就緒再建。

## 背景與唯一目標

機甲先由程式自上而下分配空間、支點與真實形狀包絡，輸出逐件工作單後才畫。你負責唯一配置與驗證核心，不畫美術，不編另一套契約。完整規劃資料正式落地前只做型別及純矩陣。

頂層開工補充優先於尚待修正契約：每個實際attachment各自一份獨立SVG源檔，assembly只是資料分組；預期40–70個有意義零件而非湊百層。geometry只實作這批美術必要的有限語法，未支援即明確拒絕，不擴為通用引擎。

## 範圍（排除法寫死）

只寫 `art/mech-blueprint/schema.ts`、`layout.ts`、`rig.ts`、`geometry.ts`、`build.ts`、`blueprint.test.ts`、`tsconfig.json`；`data/design.json`、`rig.json`、`slots.json`、`draw-order.json`、`poses.json`、`overlaps.json`；生成檔只寫 `generated/layout.json`、`work-orders.json`、`diagnostics.json`、`layout.svg`、`work-orders.svg`。自己的REPORT只寫本brief同目錄的 `core-report.md`。若規劃execution指定不同檔名，先向領導回報，不自行擴寫集。

不做：美術SVG、attachments對應、HTML/展示/README、其他wf、src/遊戲/spec/依賴/lockfile、主線SESSION/CLAIMS、既有未追蹤檔。件數 gate：最多18個程式/資料/生成檔及一份REPORT；容量 gate：最多3 MB，任一超過停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| 原生agent工具 | 里程碑及終局回報領導 |
| `node` | 原生執行TS配置核心 |
| `node --test` | 領導排程後只跑blueprint.test.ts |
| `git status --short` | 核對明確寫集 |

## 資源與禁區

可寫程式碼線；模型gpt-6.1-sol，原生agent啟動與回傳。子代理上限0；團隊平行工人最多3。禁止GUI、桌面鍵鼠、headful、下載、安裝、刪檔、repo外修改、commit/push、改全域設定、建分支/reset/rebase。不要跑npm或全套測試。單檔測試等領導明確排程，重負載先報領導並以nice -n 19執行；全機同時最多一個重負載。

## 工作

1. 讀契約，落實schema/矩陣/幾何；盡快通知領導穩定API，供展示線並行。不可降低實際SVG幾何驗證、region差集或21點姿態採樣要求。
2. 正式execution/parts資料到齊後，自上而下輸出layout/work-orders及配置SVG，先自查每張工作單有效，通知領導啟動美術。位置/外形參數採資料，不從完成整機抽拆；不湊140層。
3. 核心驗證採實際可失敗案例：無效parent/循環、接點錯位、包絡超出/keepOut、畫序/缺件；補可重建一致性。把與渲染器接線所需API和指令放REPORT，不寫展示線檔案。

## 交付

REPORT：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-mech-blueprint/core-report.md`。原型檔均位於 `/home/lorkhan/repo/game_dev/mecha-srpg/art/mech-blueprint/`，上述範圍為完整寫集。

REPORT寫做了什麼、產出、沒做到或證據不足、需要決定的事；末尾寫以後交接書該點名的工具。原生回報DONE/BLOCKED及五行摘要，不能僅貼程式碼。

## 驗收（固定4條，做完就停）

1. schema、矩陣與設計種子遵守CONTRACT，骨架/配置/語意/畫序分離，左右座標與delta一致。
2. 工作單與配置SVG可由build重建，每件有非矩形包絡、局部接點與支點，資料引用完整；種子不是從整機完成圖抽取。
3. 核心驗證有契約要求的實際反例與確定性重建測試；告知領導精確指令，僅跑排定單檔測試。
4. REPORT交付並核對git status只寫白名單，沒有自己啟動的背景行程；無commit/push。
