# 任務：為 2108 年地月機甲戰爭寫出第一版世界觀與營運層構想（Fable 規劃線）

> 你是 **Fable 規劃**線 `plan-world`，由頂層（主 session Fable）用 Agent tool 派出。使用者已裁示「未裁示的都隨意，想看 AI 的創造力，讓 Fable 去規劃」——所以這條線要**大膽提案、說明理由**，不是列選項回來問。**交接書是唯一契約**：沒寫的授權等於沒有。

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`，再照它讀 `wf/workflows/planning.md`、`wf/workflows/planning/design-notes.md`（使用者裁示原文，**全部為準**）、`wf/workflows/decisions.md`、`wf/workflows/common/user.md`、`wf/STRUCTURE.md`（8 KB／1 KB 門檻與資料檔規則）、`wf/workflows/common/data-files.md`——親自讀。

## 背景與唯一目標

使用者要把專案重做成網頁文字機甲 SRPG（偏 MUD、方格戰場、BB 式「機甲即裝備」）。世界觀他只定了骨架：2108 年、地球＋月球、三類機甲（機械／生物系捕捉改裝／古代遺跡唯一品）、怪獸從空間裂縫出現會占地盤衍生子體、等級 SSS–D（SSS 一隻最終 boss、SS 五隻「四天王」）、戰場之間有營運層。唯一目標：**寫出一份自洽、有創意、可直接餵給戰鬥與營運 spec 的世界觀＋營運層構想**，讓使用者讀完能說「就這樣」或逐點改。戰鬥數值規則與技術棧不在本線（另有兩條調查線在跑）。

## 範圍（排除法寫死）

只做下面列出的事；沒列的一律不做，遇到「順手也該做」的寫進 REPORT 的「需要決定的事」。

- 只做：世界設定（2108 的地球與月球長什麼樣、裂縫從何而來的在地解釋、人類如何組織抵抗）；玩家組織是什麼、為何像傭兵團營運；敵對勢力（含要不要有人類機甲敵人，你決定）；裂縫與地盤規則（怎麼開、地盤怎麼長、子體與母體、能否封閉／收復）；怪獸生態與等級觀（D–S 的角色定位、五隻 SS 與一隻 SSS 的**概念設計**各一段：名字、形態、地盤、威脅方式）；遺跡與古代機甲（怎麼找、為何獨一無二、取得代價）；三類機甲的取得與養成迴圈；地月移動與營運時間尺度；駕駛員與生物系機甲的特殊互動（同調／暴走之類，你決定）；整體基調與一段開場敘事樣稿（文字遊戲要靠文字，給使用者感受文風）。每節標明「使用者裁示」與「我的提案」，提案附一句理由與一個被你放棄的替代案。
- 不做：戰鬥數值與公式；部位／裝備的具體數值表；技術棧與程式碼；改 `SPEC.md`／`PROJECT.md`（頂層之後整合）；改 design-notes（那是使用者原話）。
- 件數 gate：怪獸概念設計超過 12 隻、勢力超過 6 個就停下精簡；容量 gate：產物總量超過 200 KB 就停下回報。時間 gate：開工起 60 分鐘內收線，沒做完的寫進「沒做到」。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py` | 任何超過 1 KB 的表（怪獸表、勢力表、興趣點表）寫成 wf-table/1 json，不留在 md |
| `bash wf/tools/wf-lint.sh --strict .` | 寫完後跑，要 exit 0（單檔 8 KB 內、條列 1 KB 內） |

## 資源與禁區

- **唯讀調查線**：不寫任何既有檔，只寫 `wf/workflows/planning/specs/world/` 底下的新檔與自己的 REPORT（`wf/workflows/dispatch/handoffs/plan-world/REPORT.md`）。

共通禁區：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；本線不 commit（頂層收線時統一 commit）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；不改專案內任何既有檔；不查網（這是創作，不是考據；需要常識用你自己的）；子代理上限 1 個 Sonnet（只准用來幫你校對一致性，不准代寫）。分清錯誤來源：工具出錯→發 `BLOCKED`；自己的草稿不滿意→自己改。

## 工作

1. 讀完先讀清單；把 design-notes 的每條裁示抄成一張「不可違反清單」放在腦中（不用輸出）。
2. 先寫 `wf/workflows/planning/specs/world/README.md`：一頁總覽（基調、一句話設定、各子檔導航、十句話的世界簡史），≤ 8 KB。
3. 分子檔寫，各 ≤ 8 KB：`setting.md`（2108 地月、裂縫起源、人類現況）、`factions.md`（玩家組織＋敵我勢力）、`rifts-and-territory.md`（裂縫與地盤規則）、`monsters.md`（生態、等級觀、SS 五隻＋SSS 的概念設計；表格進 `monsters.json`）、`ruins-and-ancient.md`（遺跡與古代機甲）、`mech-lifecycles.md`（三類機甲取得／養成迴圈、駕駛員與生物機甲互動）、`operations.md`（營運層迴圈、地月移動、時間尺度）、`opening.md`（開場敘事樣稿 600–1200 字）。每節「使用者裁示／我的提案／理由／放棄的替代案」四標記。
4. 跑 `wf-lint.sh --strict .`，修到 0。
5. 寫 REPORT：四段＋「最想請使用者看的 5 個提案」＋「我替使用者做掉的決定清單（可一鍵推翻）」。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-world/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 世界觀構想（資料夾） | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/world/`（README 為入口） |
| 怪獸表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/planning/specs/world/monsters.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/plan-world/REPORT.md` |

## 驗收（固定 5 條，一條不多，做完就停）

1. `wf/workflows/planning/specs/world/README.md` 與第 3 步列的 8 個子檔都存在，每檔 ≤ 8192 bytes。
2. `monsters.json` 存在、`python3 wf/tools/tabledb.py` 讀得出、含 5 隻 SS 與 1 隻 SSS，共 6–12 列。
3. 每個子檔 `grep -c '我的提案'` ≥ 1 且 `grep -c '使用者裁示'` ≥ 1。
4. `bash wf/tools/wf-lint.sh --strict .` exit 0。
5. REPORT 存在，含「最想請使用者看的 5 個提案」與「我替使用者做掉的決定清單」兩段。

## 失敗怎麼處置（兩種要分開）

- 寫出來與 design-notes 裁示衝突（自己對照發現）→ 改到不衝突，不算失敗。
- 工具或環境出錯（lint 跑不動、目錄寫不進去）→ 不回滾，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

我是 `plan-world`，團隊無（直屬頂層）。你是 Claude 子 agent，不走 inbox：終局直接在回覆裡給 5 行摘要＋REPORT 路徑＋STATUS（`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED` 之一），第一行要是自足的一句結論。不要用結束回合當等待；不要問使用者問題，想問的寫進「我替使用者做掉的決定清單」。


## 完成證據（調度者 2026-10-23 收線）

1. `planning/specs/world/` README＋8 子檔皆存在，最大 mech-lifecycles 8,044 bytes。2. `monsters.json` 10 列（D 2／C 3／B 3／A 2），欄位含 parent／children／territory，無 S／SS／SSS。3. 每子檔「我的提案」「使用者裁示」各 ≥ 1（調度者逐檔 grep）。4. `wf-lint.sh --strict .` exit 0。5. REPORT 含「最想請使用者看的 5 個提案」與「我替使用者做掉的決定清單」。三道中途改令（SS／SSS 留白、古代異能與多資源、人機關係與 AI 提案）皆已吃進。
