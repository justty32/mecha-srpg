# 任務：在隔離 worktree 把 20 份 wf 文件裡的舊用語換成定案新詞（docs-2）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/polish.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/terms-rename.json`（相對 worktree 根；`terms-rename.json` 用 `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/terms-rename.json find 類別=古代機` 依五個類別——古代機、機甲、蝕、專有名詞、保留——分次讀完，不整份 cat）。

## 背景與唯一目標

內容檔（content/）正由其他批次照 `terms-rename.json` 換新用語；spec 與工作流文件也要同步，否則下一批寫內容的人會照文件寫回舊詞。本批唯一目標：把下列文件裡的舊詞照表換掉，原意不變。

## 範圍（排除法寫死）

- 只改這 20 份（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-2/`）：
  - `wf/workflows/planning/specs/core/README.md`
  - `wf/workflows/planning/specs/core/ai.md`
  - `wf/workflows/planning/specs/core/content-format.md`
  - `wf/workflows/planning/specs/core/data-model-abilities-effects.md`
  - `wf/workflows/planning/specs/core/data-model-people.md`
  - `wf/workflows/planning/specs/core/glossary.json`
  - `wf/workflows/planning/specs/core/rules-attack-resolution.md`
  - `wf/workflows/planning/specs/core/rules-turn-and-actions.md`
  - `wf/workflows/planning/specs/world/README.md`
  - `wf/workflows/planning/specs/world/bio-mechs.md`
  - `wf/workflows/planning/specs/world/factions.md`
  - `wf/workflows/planning/specs/world/machine-souls.md`
  - `wf/workflows/planning/specs/world/mech-lifecycles.md`
  - `wf/workflows/planning/specs/world/monsters.json`
  - `wf/workflows/planning/specs/world/monsters.md`
  - `wf/workflows/planning/specs/world/opening.md`
  - `wf/workflows/planning/specs/world/operations.md`
  - `wf/workflows/planning/specs/world/rifts-and-territory.md`
  - `wf/workflows/planning/specs/world/ruins-and-ancient.md`
  - `wf/workflows/planning/specs/world/setting.md`
- 只換用語：句子結構、數字、表格欄位、連結、程式識別字（`shellKin`、`tide`、`shell`、id、檔名、路徑、英文鍵）一律不動；引用使用者原話的引號內文字（「使用者原話：」「使用者：」後的引文）**不改**，保留原話。
- 不做：上列以外的任何檔（尤其 `design-notes/` 其他檔、`decisions/`、`dispatch/handoffs/`、`content/`、`src/`）；不新增、不刪除檔；不 commit；worktree 內不要留其他檔（筆記放 `/tmp/cx-rn-d2/`）。
- 件數 gate：改動檔超過 20 份就停下回報；容量 gate：任一檔改後行數與原檔不同（除 docs-3 的「用語過渡」改寫）就停下回報。任一觸發都停。

## 換詞規則（照 terms-rename.json；以下是判斷要點）

1. 表上有的照表換（殼學會→稽古學會、殼守→守寢人、殼訊→夢召、殼緣→古緣、潮信會→沐蝕會、渡潮船→渡月船、源潮→源流、摹機→衍型機、殼甲→鎧甲、殼目→靈目、殼矢→矢、潮月→蝕月、潮錨→蝕錨、潮壓→蝕壓、第一次潮→第一次蝕潮、《潮獵》→《蝕潮獵團》…）。
2. 單字「殼」：指古代機本體→「古代機」；外層→「裝甲」；遺跡黑話→「墟」；甲殼、地殼等本義與 layer 名（`chitin` 甲殼）不改。**不准用「古機」縮寫**。spec 裡描述資料欄位時，欄位 id 不改、只改中文說明（例：「`shellKin`（殼緣）」→「`shellKin`（古緣）」）。
3. 單字「潮」：指裂縫週期湧現→「蝕潮」（口語「蝕」）；**大潮、小潮、平潮、退潮、漲潮照用**，不要寫「蝕盛」「蝕歇」；海洋本義與海洋意象專名不改（見表「保留」列）。
4. 「摹」：摹機→衍型機、摹一→衍一；動詞→仿／仿造。
5. 表外又非換不可的複合詞：依表構詞（墟／古／寢／骸），在 REPORT「需要決定」列出。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/terms-rename.json find 類別=保留` | 讀定案表（在 worktree 根跑） |
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-2 grep -nE '殼|摹|潮|鞘' -- wf` | 改完確認殘留，每處要有理由 |
| `bash wf/tools/wf-lint.sh --strict .`（在 worktree 根） | 改完跑；你改的檔不得新增違規 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-rn-d2 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫文件）：只寫上列檔案（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/docs-2/`；**不 commit**。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作；不用 MCP。子代理上限 1 個，模型隨意，也要親讀「先讀」。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → `BLOCKED`；自己打錯指令或路徑 → 自己修、繼續做。

## 工作

1. 讀「先讀」全部。
2. 逐檔換詞。
3. grep 殘留、跑 wf-lint。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/docs-2/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的文件 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-2/…`（上列路徑） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/docs-2/REPORT.md` |

REPORT：**第一段「已讀清單」**；「做了什麼」（每檔換了幾處、換了哪些詞，一行一檔）；「殘留」（每處殘留＋理由，可按規則分組）；「沒做到或證據不足的」；「需要決定的事」；「子代理」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 4 條，一條不多，做完就停）

1. worktree 內改動只落在上列檔案（`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-docs-2 status --short` 除 `node_modules` 外只見這些）。
2. `bash wf/tools/wf-lint.sh --strict .` 對你改的檔 0 新違規。
3. 殘留每處在 REPORT 有理由；文中沒有「古機」「蝕盛」「蝕歇」（引述使用者原話者除外）。
4. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rn-d2`。本線團隊：`teams/lead-rename`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rn-d2 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rn-d2 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-rename/docs-2/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。標題要自足。契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「照表換詞」；其他需求一律寫進 REPORT，不動手。
