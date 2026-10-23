# 任務：寫出網頁版機甲 SRPG 的核心引擎 spec 第一版（資料模型、戰鬥規則、AI、內容格式、架構）

> 你是 **Fable 規劃**線 `plan-spec`，由頂層（主 session Fable）用 Agent tool 派出。使用者裁示「未裁示的都隨意，想看 AI 的創造力」——拿不準的地方**自己決定並說明理由**，列進「替使用者做掉的決定」。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/planning.md`、`wf/workflows/planning/design-notes.md` 與其兩個子檔（使用者裁示原文，**全部為準**）、`wf/workflows/decisions.md`（技術棧、戰鬥十題、ToME 八題——已拍板，照用）、`wf/workflows/common/user.md`、`wf/STRUCTURE.md`、`wf/workflows/common/data-files.md`、`wf/workflows/common/conventions.md`——親自讀。參考材料（唯讀，用 `python3 wf/tools/tabledb.py` 查、不整份讀進 context）：`wf/workflows/dispatch/handoffs/lead-combat-ref/mechanics.json`（BB 卷 107 列）、`wf/workflows/dispatch/handoffs/lead-tome4-ref/mechanics-tome4.json`（ToME 卷 60 列，`note` 欄標了兩卷衝突）、`wf/workflows/dispatch/handoffs/lead-techstack/REPORT.md`、`wf/workflows/planning/specs/world/README.md`（只取名詞與基調；世界觀內容使用者還在改，不要寫進 spec）。

## 背景與唯一目標

專案重做為網頁文字機甲 SRPG（純 TS＋Vite，邏輯與 DOM 分離，headless 可測）。使用者的裁示一致指向「一切資料驅動、可擴充」：部位是多層序列、機甲有零到多個資源池、部位壞掉的後果與傳到駕駛員的方式是效果清單、三類機甲（機械／生物／古代）用同一骨架、駕駛員與機魂是同一種人物實體、AI 要資料驅動。唯一目標：**寫出一份能直接交給實作團隊切線的核心引擎 spec**——實作者讀完知道每個模組的邊界、每種資料長什麼樣、每條規則怎麼結算、怎麼在 node 裡 headless 測。世界觀內容、數值平衡、UI 美術不在本線。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：(1) 總覽與術語表；(2) 資料模型——人物（駕駛員／機魂共用骨架、意志軸三用法：共鳴／承擔／機魂天賦樹）、機甲與機體（body plan、部位、層序列、資源池）、部件、能力（成本／冷卻／目標／效果／AI 戰術權重）、效果（scope、時鐘、疊加、傳導）、地形、勢力、怪獸族／個體（含可選的 spawner／molt 行為）；(3) 戰鬥規則——行動順序（速度制）、行動經濟（AP 為資源池）、攻擊結算（指定部位／暴露權重→層序列→效果→傳導到人物）、資源更新時機、效果時鐘、士氣階段、傷勢、撤離與棄機、捕捉、失控（承擔超限）、傳統兵器十分之一規則、勝負；(4) AI——陣營共享感測、以能力宣告的戰術權重選招、目標估值、可插拔策略；(5) 內容資料格式——JSON schema 層級的定義（欄位、型別、必填、範例各一）與資料夾佈局，說清楚「新增一台機甲／一個部件／一個駕駛員／一種地形／一族怪獸」各要改哪些檔；(6) 程式架構——模組邊界（core／rules／ai／content／sim／ui-adapter）、事件日誌與可重播、seeded RNG、存檔格式、headless 測試策略與驗收用的模擬跑法、可視區渲染的介面契約；(7) 兩卷機制表的採用對照（哪些列進了哪一節，用 id 引用）；(8) REPORT。
- 不做：世界觀內容與劇情；具體數值表與平衡；UI 版面與文案；程式碼（可以有型別定義的片段，但不是實作）；改 `SPEC.md`／`PROJECT.md`／`README.md`／design-notes／decisions。
- 件數 gate：spec 子檔超過 14 個就停下合併；容量 gate：產物總量超過 300 KB 就停下回報。時間 gate：開工起 90 分鐘內收線，沒做完的寫進「沒做到」。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 查兩卷機制表；spec 內超過 1 KB 的表（欄位表、採用對照表、術語表）寫成 wf-table/1 json |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完後跑，要 exit 0（單檔 8 KB 內、條列 1 KB 內） |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫 `wf/workflows/planning/specs/core/` 底下的新檔與自己的 REPORT（`wf/workflows/dispatch/handoffs/plan-spec/REPORT.md`）。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；本線不 commit（頂層收線時統一 commit）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不改專案內任何既有檔；不查網；子代理上限 2 個 Sonnet（只准用來對照機制表與檢查一致性，不准代寫 spec）。分清錯誤來源：工具出錯→發 `BLOCKED`；自己的草稿不滿意→自己改。

## 工作

1. 讀完先讀清單；把 design-notes 與 decisions 的每條裁示抄成「不可違反清單」（可放 `specs/core/constraints.json`，wf-table/1，每列：來源、一句話、對應 spec 節）。
2. 先寫 `specs/core/README.md`：一頁總覽（目標、非目標、模組圖用 Mermaid、子檔導航、術語表指向 json），≤ 8 KB。
3. 分子檔寫，各 ≤ 8 KB，建議：`data-model-people.md`、`data-model-mech.md`（body plan／部位／層／資源池／部件）、`data-model-abilities-effects.md`、`data-model-world.md`（地形／勢力／怪獸族）、`rules-turn-and-actions.md`、`rules-attack-resolution.md`、`rules-resources-effects.md`、`rules-people.md`（士氣／傷勢／意志三用法／失控）、`rules-battle-flow.md`（部署／撤離／捕捉／勝負／傳統兵器）、`ai.md`、`content-format.md`（schema 與資料夾佈局、新增 X 要改哪些檔）、`architecture.md`（模組邊界、事件日誌、RNG、存檔、headless 測試）、`adoption.json`（兩卷機制表採用對照，wf-table/1）。
4. 每個子檔結尾一段「替使用者做掉的決定」（沒有就寫「無」）。跑 `wf-lint.sh --strict .`，修到 0。
5. 寫 REPORT：四段＋「最想請使用者看的 5 個設計決定」＋「替使用者做掉的決定清單（彙整）」＋「建議的實作切線（按資料夾／檔案清單切，給 dispatch 用）」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-spec/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 核心引擎 spec（資料夾） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/`（README 為入口） |
| 不可違反清單 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/constraints.json` |
| 機制表採用對照 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/core/adoption.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-spec/REPORT.md` |

## 驗收（固定 6 條，一條不多，做完就停）

1. `specs/core/README.md` 存在且含 Mermaid 模組圖與子檔導航；子檔數 10–14，每檔 ≤ 8192 bytes。
2. `constraints.json` 存在、`python3 wf/tools/tabledb.py` 讀得出、每列有「來源」與「對應 spec 節」，且 design-notes 兩個子檔裡每個粗體裁示段至少對應一列。
3. `adoption.json` 存在、tabledb 讀得出、至少 60 列，每列引用 BB 卷或 ToME 卷的 id 並標採用／改造／不採用與落在哪一節。
4. `content-format.md` 含「新增一台機甲／一個部件／一個駕駛員／一種地形／一族怪獸」五條各自要改哪些檔的說明，且每種資料有一個 JSON 範例。
5. `bash wf/tools/wf-lint.sh --strict .` exit 0。
6. REPORT 存在，含「最想請使用者看的 5 個設計決定」「替使用者做掉的決定清單」「建議的實作切線」三段。

## 失敗怎麼處置（兩種要分開）

- 寫出來與裁示衝突（自己對照 constraints 發現）→ 改到不衝突，不算失敗。
- 工具或環境出錯（lint 跑不動、目錄寫不進去）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

我是 `plan-spec`，團隊無（直屬頂層）。你是 Claude 子 agent，不走 inbox：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。不要用結束回合當等待；不要問使用者問題，想問的寫進「替使用者做掉的決定清單」。
