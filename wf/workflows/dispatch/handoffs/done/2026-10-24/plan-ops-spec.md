# 任務：寫營運層 spec 第一版——世界圖、勢力、裂縫與地盤、契約、資源與科研、機魂成長、修理與人員、時間（Fable 規劃線）

> 你是 **Fable 規劃**線 `plan-ops-spec`，由頂層（主 session Fable）用 Agent tool 派出。核心引擎 spec 只管一場戰鬥；戰鬥之間的一切（營運層）還沒有 spec。使用者裁示「未裁示的都隨意，想看 AI 的創造力」——拿不準的自己決定並說明理由。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/planning.md`、`wf/workflows/planning/design-notes.md` 與兩個子檔（裁示原文，全部為準）、`wf/workflows/decisions.md`、`wf/STRUCTURE.md`、`wf/workflows/common/data-files.md`；世界觀第二版全部：`wf/workflows/planning/specs/world/`（README、setting、factions、rifts-and-territory、monsters、ruins-and-ancient、mech-lifecycles、machine-souls、operations、opening）；核心 spec：`wf/workflows/planning/specs/core/README.md`、`data-model-people.md`、`data-model-mech.md`、`data-model-world.md`、`content-format.md`、`architecture.md`、`glossary.json`；BB 營運參考：`wf/workflows/dispatch/handoffs/lead-combat-ref/mechanics.json` 的 `domain=營運` 列（`tabledb.py` 查）——親自讀。

## 背景與唯一目標

世界觀已定（潮月節拍、蝕域、潮錨、獵團與浮船、開放勢力、殼訊與十分律、三類機甲的取得迴圈、機魂天賦樹吃錢與陪伴）。唯一目標：**寫出一份能切線實作的營運層 spec**——資料模型（世界圖節點與路線、勢力與聲望、裂縫與蝕域狀態機、契約、資源與帳本、科研與機魂天賦樹的「開／練熟」、修理與部件庫存、人員招募與休養、遺跡探勘入口、地月渡輪）、回合與時間（潮月 28 天的 tick、每日結算順序）、與戰鬥層的接口（出戰編成→情境生成→戰果回寫：傷勢、損毀部位、捕獲、聲望、酬金）、文字介面契約（指令列與選單的最小集合）、內容格式與資料夾佈局（與 `content/base/` 並列的 `content/base/world/`）、headless 測試策略（模擬 N 個潮月不拋錯、帳本守恆）。數值只給量級。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：`wf/workflows/planning/specs/ops/` 下 README＋子檔（各 ≤ 8 KB）：`data-model-world-map.md`、`data-model-factions-contracts.md`、`data-model-economy-research.md`、`data-model-roster-repair.md`、`time-and-tick.md`、`battle-interface.md`、`text-ui-contract.md`、`content-format-ops.md`、`architecture-ops.md`（模組 `src/ops/` 的邊界與測試策略），表格進 json（`constraints-ops.json`：每列來源裁示／對應節）；每檔結尾「替使用者做掉的決定」；REPORT。
- 不做：戰鬥規則（core spec 管）；數值平衡；程式碼；劇情文本；改 world／core spec（衝突→REPORT 提出，附建議修法）；SS／SSS。
- 件數 gate：子檔超過 12 個就停下合併；容量 gate：產物超過 250 KB 就停下回報。時間 gate：開工起 90 分鐘內收線。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 查 BB 營運列與 glossary；寫 `constraints-ops.json`（wf-table/1） |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完後跑，要 exit 0 |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫 `wf/workflows/planning/specs/ops/` 底下的新檔與自己的 REPORT（`wf/workflows/dispatch/handoffs/plan-ops-spec/REPORT.md`）。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；本線不 commit（頂層收線時統一 commit）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不查網；子代理上限 1 個 Sonnet（只准校對一致性）。分清錯誤來源：工具出錯→`BLOCKED`；草稿不滿意→自己改。

## 工作

1. 讀完先讀清單；抄「不可違反清單」成 `constraints-ops.json`。
2. 先寫 README（目標、非目標、模組圖 Mermaid、與 core 的接口一句、子檔導航）；分子檔寫；每檔 ≤ 8 KB、條列 ≤ 1 KB。
3. 跑 `wf-lint.sh --strict .` 修到 0；寫 REPORT：四段＋「最想請使用者看的 5 個設計決定」＋「替使用者做掉的決定清單」＋「建議的實作切線（檔案清單）」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-ops-spec/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 營運層 spec | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/ops/` |
| 不可違反清單 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/ops/constraints-ops.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-ops-spec/REPORT.md` |

## 驗收（固定 5 條，一條不多，做完就停）

1. `specs/ops/README.md` 含 Mermaid 模組圖與子檔導航；子檔 8–12 個，每檔 ≤ 8192 bytes。
2. `constraints-ops.json` 存在、tabledb 讀得出、≥ 20 列，每列有來源與對應節；design-notes 中營運／世界觀相關粗體段皆有對應。
3. `battle-interface.md` 含「出戰編成→情境生成→戰果回寫」三段且列出回寫欄位；`content-format-ops.md` 每種資料有一個 JSON 範例。
4. `bash wf/tools/wf-lint.sh --strict .` exit 0。
5. REPORT 含「最想請使用者看的 5 個設計決定」「替使用者做掉的決定清單」「建議的實作切線」三段。

## 失敗怎麼處置（兩種要分開）

- 與裁示衝突（自查發現）→ 改到不衝突。
- 工具或環境出錯→不回滾，發 `BLOCKED`。

## 完成／阻塞回報（必做）

我是 `plan-ops-spec`，團隊無（直屬頂層）。你是 Claude 子 agent，不走 inbox：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。不要問使用者問題，想問的寫進「替使用者做掉的決定清單」。
