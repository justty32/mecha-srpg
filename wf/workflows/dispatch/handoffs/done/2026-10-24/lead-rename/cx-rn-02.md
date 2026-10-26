# 任務：在隔離 worktree 把 19 個既有內容檔的舊用語換成定案新詞（batch rename-02，lore 人物）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，下列每個路徑都要出現，驗收會逐條比對）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/planning/design-notes/terms-rename.json`（相對路徑都相對你的工作目錄 worktree，內容與主 repo 相同；`terms-rename.json` 是 wf-table/1 資料檔，用 `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/terms-rename.json find 類別=古代機`（類別五個：古代機、機甲、蝕、專有名詞、保留）分次讀完，不要整份 cat）。

## 背景與唯一目標

使用者定了一批新用語（古代機不再叫「殼」、摹機改衍型機、世界觀的「潮」改「蝕潮」），衍生詞已由改名線經 agy 審查定案，全表在 `terms-rename.json`。本批唯一目標：把下列檔案文字欄裡的舊詞照表換掉，讓句子讀起來仍是自然的中文。

## 範圍（排除法寫死）

- 只改這 19 個檔（worktree：`/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-02/`）：
  - `content/lore/characters/ines-huaman.json`
  - `content/lore/characters/irina-voronina.json`
  - `content/lore/characters/joao-ferreira.json`
  - `content/lore/characters/jonas-halvorsen.json`
  - `content/lore/characters/kim-haneul.json`
  - `content/lore/characters/kofi-mensah.json`
  - `content/lore/characters/kuafu.json`
  - `content/lore/characters/lobsang.json`
  - `content/lore/characters/m3.json`
  - `content/lore/characters/mara-okoye.json`
  - `content/lore/characters/markus-njoroge.json`
  - `content/lore/characters/mina-darzi.json`
  - `content/lore/characters/molly-van-den-berg.json`
  - `content/lore/characters/not-yet.json`
  - `content/lore/characters/nur.json`
  - `content/lore/characters/ogun-adeyemi.json`
  - `content/lore/characters/okamoto-mayu.json`
  - `content/lore/characters/old-man.json`
  - `content/lore/characters/old-pigeon.json`
- 只改文字欄：`name`、`title`、`summary`、`body`、`desc`、`description`、`text`、`label`、`brief`、`lines`、`phrase`、`phrases`、`badge`、`note`、`aka`、`epithet`、`flavor`；lore 檔另可改這些敘述欄：`consequences`、`role`、`scale`、`doctrine`、`ideology`、`silhouette`、`status2108`、`region`、`hq`、`mechSeries`、`relation`、`tags`（`tags` 只改中文標籤裡的舊詞）。id、檔名、數字、引用（`kind/name` 形式）、鍵、陣列長度一律不動——閘門逐節點比對，動了就退件。
- 不做：上列以外的任何檔（含 `timeline.json`、`glossary.json`、`style.md`、`content/index/`、`content/batches/`、`src/`、`wf/` 除報告目錄）；不新增、不刪除檔；不 commit；worktree 內不要留任何其他檔（筆記、腳本放 `/tmp/cx-rn-02/`）。
- 件數 gate：改動檔超過 19 個就停下回報；容量 gate：任何單檔改後比原檔長 20% 以上就停下回報（換詞不該讓檔案變長很多）。任一觸發都停。

## 換詞規則（照 terms-rename.json；以下是判斷要點，不是全表）

1. **表上有的照表換**，包括專有名詞（例：殼學會→稽古學會、殼守→守寢人、殼訊→夢召、潮信會→沐蝕會、渡潮船→渡月船、摹一聯合→衍一聯合、第一次潮→第一次蝕潮、潮月→蝕月、潮錨→蝕錨）。
2. **單字「殼」看指什麼**：古代機本體→「古代機」（行文可用「它」「那台」避免重複）；古代機外層→「裝甲」；獵團黑話指遺跡→「墟」；**甲殼、地殼、鹽殼、船殼、蟲殼、褪殼、結殼等本義不改**（蟲族部位與招式如「闔殼封闕」「聖殼崩紋」保留）。古代機的稱呼「X殼」→「X」（潮衣殼→潮衣、靜海殼→靜海）；以古代機出土地命名的地名「X殼」→「X之墟」。**不准用「古機」這個縮寫**。
3. **單字「潮」看指什麼**：裂縫的週期湧現→「蝕潮」（口語可單用「蝕」）；**大潮、小潮、平潮、退潮、漲潮照用**（使用者定案：蝕潮的強弱起落用潮汐語彙形容，含「大潮之夜」「大潮期」），**不要寫「蝕盛」「蝕歇」**；海洋本義（潮汐、潮間帶、潮水、潮濕、鹹潮、黑潮）與海洋意象的專名（潮鰭、潮鷗、潮狼、潮脊、潮神、掠潮、躍潮…，見表「保留」列）不改；「獸潮」不改。
4. **「摹」**：摹機→衍型機、摹一／摹二→衍一／衍二；動詞「摹」（照著仿造）→仿、仿造、照著造，挑順口的。
5. **新造詞**：表上沒有、又非換不可的複合詞（例如「殼腔」「殼門」），依表的構詞取 墟／古／寢／骸 單字或改寫句子，並在 REPORT「需要決定」列出你的選擇。不要自創表外的新專名。
6. **翻譯腔重審**：只在你換詞的那句話裡順手修明顯的翻譯腔（英文語序、冗長的「的」「被」「進行」），保留原意與事件走向，不新增人物、不改事實、不重寫整段；名字本身翻譯腔重但不含舊詞的，只寫進 REPORT 建議，不改。
7. 禁用詞照 `content/lore/style.md`。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/terms-rename.json find 類別=保留`（或 `grep RE`） | 讀 terms-rename.json（tabledb 實際路徑 `wf/tools/tabledb.py`，在 worktree 根跑） |
| `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-02 grep -nE '殼|摹|潮|鞘' -- content` | 改完逐檔確認殘留，每個殘留都要能對到表的「保留」列或規則 2–3 |
| `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯） | 改完跑；**不用跑 `npm test`**（領導驗收會跑） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-rn-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本批只寫內容檔）：只寫上列檔案（在 worktree 內）與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-rename/rename-02/`；**不 commit**（沙箱下 `.git` 唯讀）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（`wf/workflows/dispatch/lessons.md`）；不用 MCP。
- **子代理上限 1 個**，模型隨意；它若做實質工作也要親自讀「先讀」全部，受同一閘門約束；REPORT 記成本與品質。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑、臨時腳本出錯 → 自己修、繼續做。沙箱內 `node --test` 計數不準是已知現象。

## 工作

1. 讀「先讀」全部（terms-rename.json 五個類別都讀）。
2. 逐檔改：先 grep 該檔舊詞，逐處依規則判斷，改文字欄。
3. 全部改完 grep 殘留、跑檢查。
4. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-rename/rename-02/REPORT.md`**，回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改過的內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-02/content/…`（上列路徑） |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-rename/rename-02/REPORT.md` |

REPORT 結構：**第一段「已讀清單」**（逐行列親自讀過的路徑）；「做了什麼」；「逐檔對照」（每檔一小節，列每處「舊片段 → 新片段」，片段取含舊詞的半句即可）；「殘留」（每處殘留舊字＋理由，對到表的哪一列或規則幾）；「沒做到或證據不足的」；「需要決定的事」（表外新造詞、翻譯腔重的名字建議）；「子代理」；末尾「以後交接書該點名的工具」（沒有寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動只落在上列檔案（`git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/rename/wt-rename-02 status --short` 除 `node_modules` 外只見這些）。
2. `npm run check`（末行 `OK 0 errors`）、`node content/lore/check.ts`（0 錯） 全過。
3. 上列檔案的舊詞殘留，每一處都在 REPORT「殘留」段有理由；文中沒有「古機」「蝕盛」「蝕歇」「原鞘」。
4. REPORT 有逐檔對照。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就保留現狀、REPORT 寫證據，發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-rn-02`。本線團隊：`teams/lead-rename`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rn-02 --up PROGRESS '開工' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-rn-02 --up DONE '一句自足結論' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-24/lead-rename/rename-02/REPORT.md`（STATUS 換成實際狀態）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「照表換詞＋換詞處順手修翻譯腔」；任何需要改其他檔或改結構的需求一律寫進 REPORT，不動手。
