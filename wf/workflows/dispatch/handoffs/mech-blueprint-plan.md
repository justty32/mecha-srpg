# 任務：規劃由配置與骨架驅動的機甲零件重做

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，親自讀 `wf/WORKFLOWS.md`、`wf/workflows/common/user.md`、`wf/workflows/team-model.md`、`wf/workflows/planning.md`、`wf/workflows/common/conventions.md`、`wf/workflows/common/code-map.md`、`wf/workflows/dispatch/README.md` 與 `wf/workflows/common/data-files.md`。

## 背景與唯一目標

使用者否定先畫整台 SVG 再任意拆方框的做法，要求重做：先由程式自上而下定頭身手腳及中層、下層的大小、位置與占用範圍，再逐件獨立畫 SVG，由下而上組裝。使用者提供 `/tmp/codex-clipboard-8Uo05b.png`，需親自 view_image：白色分片包覆裝甲、藍色尖長裝甲、暗色關節／內骨架、前後遮擋與有意義的零件。以此為結構與造型密度參考，先重做一台完整原型。

最新必須：將來可能操控動作並接 Spine 類骨架；現在就分離骨架、附件插槽、繪製順序與 SVG 幾何，定局部座標、pivot、接點、父子變換及關節活動空間。第一版含抬臂、屈肘、屈膝的動作檢驗。此為獨立美術原型，不改遊戲架構、不代定 Fable 待決機制。

## 範圍（排除法寫死）

- 唯讀既有 `art/svg-study-1027/` 與必要機甲 handoff；只寫 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/mech-blueprint-plan/` 中的規劃、契約及 REPORT。
- 規劃新的 `art/mech-blueprint/` 原型；現有展示入口可加明確連結導流至重做版，不刪原資產、不重製人物／城市、不接遊戲、不做 Spine 匯出器或安裝 Spine。
- 先做一種風格、一台完整可動原型，不要求沿用舊 140 葉數灌數。保留最多五層視覺 SVG 限制；語意樹／骨架與渲染樹應能分離，不能為限制而破壞真正關節鏈。
- 件數 gate：規劃產物最多 5 檔；容量 gate：總計 200 KB。若超過回報，不擴張。

## 必用工具

| 工具 | 用途 |
|---|---|
| `view_image` | 親看使用者貼圖 |
| `rg`、唯讀 shell | 核對既有原型 |
| `python3 wf/tools/brief_lint.py` | 有產出下階段 brief 時自查 |
| `bash wf/tools/wf-lint.sh --strict .` | 文件檢查；既有問題清楚區分 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫自己的 REPORT 與上列目錄中的新規劃。
- 規劃模型 gpt-6-astra；本線不派子 agent、不實作、不 commit/push。使用者允許後續實作 agent 自由派子 agent，模型自由；平行工人最多 3、全機重負載最多 1 仍適用。
- 不碰鍵鼠螢幕、不開 GUI、不下載、不裝依賴、不動其他未追蹤檔、不刪檔、不改全域設定。

## 工作

1. 閱讀規矩與參考圖，查現有來源是怎麼產生的，指出要替換的製作方式。
2. 產出可直接執行的 PLAN 與資料 CONTRACT：配置程式先算每層位置／輪廓範圍／接點，再發給美術逐件畫；rig 的 bind pose／local transform／slots／attachments／draw order／joint limits 與視覺階層分開。區分機構總成與實際可畫零件，真正形狀範圍不能只用 bbox 糊弄。
3. 定首次完整原型的合理零件清單與分組、工人明列寫集（程式 sol、美術 astra）、可驗收的配置圖／零件檢視／組裝動作演示。建議以多邊形包絡及可視化越界診斷驗證，明確處理關節跨界和重疊例外。不要承諾未驗證的 Spine 格式相容。
4. 回報：最重要設計判斷、工期範圍、可開實作的精確檔案契約。設計資料 >1 KB 的同質清單遵 wf-table/1。

## 交付

- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/mech-blueprint-plan/PLAN.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/mech-blueprint-plan/CONTRACT.md`
- `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/mech-blueprint-plan/REPORT.md`
- 可另有至多兩個規劃資料檔。

## 驗收（固定 3 條）

1. PLAN 與 CONTRACT 明列流程、檔案寫集、單件生成先後與具體完成條件，可交下一位領導直接執行。
2. 骨架／零件／畫序分離與動作驗證、活動空間、局部幾何和逐層包絡都有定義；親看參考圖並在 REPORT 記錄現況證據。
3. REPORT 記錄文件檢查結果與未解問題，不冒稱已完成實作或可匯入 Spine。

## 完成回報

原生 agent 用工具回報 DONE／BLOCKED 與 5 行摘要、REPORT 絕對路徑，不寄 inbox。完成即停，不自行派工。
