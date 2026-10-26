# 任務：照已審計畫新增獸族 D 級新物種「礁背」全套 7 檔（batch kj-05）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/playtest.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05-plan/plan.md`（**領導審過的計畫，本批設計依據**）、`wf/workflows/dispatch/handoffs/lead-fill-kaiju/cx-kj-05.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔（含 `templates.json`、`engine-facts.json`、`ability-forms.json`）也請讀過。

## 背景與唯一目標

四族各只有一種 D 級。計畫（gpt-6-astra 寫、領導審過）定了一種環太平洋舊港岸線常見的獸族 D 級「礁背」（`species/breaksurf`）。你負責照計畫第 5、6 段做出 7 檔並自測。**數值照計畫的同級暫填，不做平衡**（使用者：數值最後統一調）；文筆不必強求，只要不違禁忌。計畫與本交接書衝突時以本交接書為準。

## 方法（必守）

- 掛點照計畫第 4 段（海洋與潮汐裁示、底色 1.4／1.5、F 線）；REPORT 寫明。
- **對面無臉**；怪獸不是畜牲（不寫餵、馴、乖）；D 級**不寫** `name`／`epithet`。
- 不新增 registries 值；不寫 `territorial`、`molt`。
- 不拿其他作品類比；中文命名避免直譯（兩步命名）；潮→蝕（世界觀詞）；不用潮差解釋凶度。新名詞標提案，列 `naming.json`。

## 範圍（排除法寫死）

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-05/` 新增計畫第 6 段列的**恰好 7 檔**：`content/base/species/breaksurf.json`、`bodyplans/quadruped-breaksurf.json`、`frames/bio-breaksurf.json`、`frames/corpse-breaksurf.json`、`monsters/breaksurf-d.json`、`abilities/kx-breaksurf-gore.json`、`abilities/kx-breaksurf-roll.json`（後六個同在 `content/base/` 下）。
- 不做：修改或刪除任何既有檔（**`world/rifts/`、`world/encounters/`、`world/beasts/` 一律不碰**——接營運由領導做）；不建情境、效果、AI profile；`content/lore/`、`src/`、`schemas/`、`test/`、`wf/`（除報告目錄）、`content/index/`、`content/batches/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（scratch、driver、log 一律放 `/tmp/cx-kj-05/`）。
- 件數 gate：新增超過 7 件就停下回報；容量 gate：單檔超過 16 KB、或合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一檔跑；收尾末行 `OK 0 errors`，新警告逐條寫進 REPORT |
| `npm run content:probe` | 收尾跑：新 monster 與兩個參照（見「工作」第 3 步）各 `--n 5`，數字並列進 REPORT |
| `npm run typecheck` | 收尾跑，0 |
| `npm test` | 收尾跑一次；沙箱內 mcp、worldgen、grid、content/index 類檔級失敗是已知環境現象（上兩批實證），照實記錄，其他失敗才算問題 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v` | 讀 wf-table/1 資料檔（實際路徑 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj-05 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。本批不要求 MCP 試玩。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。

## 工作

1. 讀「先讀」全部與計畫；讀計畫第 6 段的範本檔。
2. 寫 7 檔；每檔後 `npm run check`。
3. probe（新：breaksurf-d；參照：tidewolf-d、mite-d，皆 monster kind）、typecheck、`npm test` 收尾；寫 `naming.json`、`review.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-05/content/base/` 下 |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05/review.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-fill-kaiju/kj-05/REPORT.md` |

`naming.json` 用 wf-table/1：columns `["id","nameEn","meaning","nameZh","method","status"]`，涵蓋 species、bodyplan、兩 frame、兩招的顯示名。`review.json` 用 wf-table/1：columns `["檔","類別","名稱","白話","掛到"]`，1 列（species 檔代表），從計畫 `review-draft.json` 出發；`白話` 一到兩句、**不超過 60 字**。

REPORT 結構：**第一段「已讀清單」**；接著四段（做了什麼；產出——每檔一行：id、定位、掛到哪；probe 與參照數字、超帶欄位與理由；沒做到或證據不足的；需要決定的事）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動**只有** 7 個新檔（`git status --short` 除 `node_modules` 外只見這些）。
2. `npm run check` 末行 `OK 0 errors`；`npm run typecheck` 0；`npm test` 結果照實記錄。
3. `content:probe` 新 monster 0 例外、兩招都被 AI 用過至少 1 次，數字與參照並列在 REPORT。
4. `naming.json`、`review.json` 齊（白話 ≤ 60 字）；0 個 `name`／`epithet` 在 monster 檔；新文字 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞）、0 個 style.md 禁用詞。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj-05`。本線團隊：`teams/kaiju`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj-05 --up DONE '一句自足結論' /tmp/cx-kj-05/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-kj-05 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增計畫列的 7 個 base 檔＋報告目錄的交付檔＋自測」；`world/` 下任何檔一律不動——此條優先於工作步驟中任何看似需要改檔的情況。
