# 任務：照已審計畫新增怪獸擴充第 05 批——曲針、空帆、雙影、垂幕（恰好 34 檔，batch kaiju2-05）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/battle-field.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/playtest.md`、`content/lore/style.md`、`content/lore/README.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-kaiju2/cx-kj2-05.md`。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔（含 `templates.json`、`engine-facts.json`、`ability-forms.json`）也請讀過；`kj2-plan/roster.json` 是逐種明細（主 repo 路徑 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-plan/roster.json`），用 `python3 wf/tools/tabledb.py` 依 `batch=kj2-05` 查。

## 背景與唯一目標

使用者覺得怪物種類太少。計畫（gpt-6-astra 寫、領導審過，第 12 段「領導審定」優先於其他段）定了 24 種新物種、6 批。你負責第 05 批：照計畫第 5 段通則、roster 中 `batch=kj2-05` 的四列、第 6 段二名、第 7 段 lore、第 9 段本批檔案清單，做出**恰好 34 檔**並自測。**數值照計畫的同級暫填，不做平衡**（使用者：後期再調）。計畫與本交接書衝突時以本交接書為準。

## 方法與禁忌（必守）

- 每種掛到設定：照 roster `hook` 欄（節點／主線／年表／崩年底色句／既有生態設定）；lore 地點檔寫明牠為什麼在那裡、平常在哪被看見、誰最常遇到。REPORT 逐種寫掛點。
- 怪獸多從海洋來、環太平洋為主、內陸少；菌絲沿淡水、不靠海；**不用潮差、潮高推凶度**。
- **對面無臉**（怪獸沒有人格化指揮者、不談、不怕）；怪獸不是畜牲（不寫餵、馴、乖、飼料、獸欄、寵物）。
- 等級不是成長階段；**A 級才寫 `name`＋`epithet`**（tags 加 `named`），B 以下不寫；不做 S、SS、SSS；不碰萬潮葬王與桑托斯灣區核心。
- 不新增 registries 值；不寫 `territorial`、`molt`、`partsOverride`、`attrMods`、`extraAbilities`。
- 不拿其他作品類比；**中文命名避免直譯**（兩步命名，英文原名寫 `naming.json`）；潮→蝕（世界觀詞）；名稱照計畫第 12 段審定後的文字，不自行改回；新寫的部位名、地點文字避開「動詞＋顏色當受詞」與撞日常詞。新名詞在 naming.json 標「提案」。
- 新文字 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞）、0 個 style.md 禁用詞。

## 範圍（排除法寫死）

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-kaiju2/wt-kj2-05/` 新增下列**恰好 34 檔**：
- `content/base/species/bent-needle.json`
- `content/base/bodyplans/alien-bent-needle.json`
- `content/base/frames/bio-bent-needle.json`
- `content/base/frames/corpse-bent-needle.json`
- `content/base/monsters/bent-needle-d.json`
- `content/base/abilities/kx-bent-needle-pick.json`
- `content/base/species/hollow-sail.json`
- `content/base/bodyplans/alien-hollow-sail.json`
- `content/base/frames/bio-hollow-sail.json`
- `content/base/frames/corpse-hollow-sail.json`
- `content/base/monsters/hollow-sail-c.json`
- `content/base/abilities/kx-hollow-sail-cast.json`
- `content/base/abilities/kx-hollow-sail-fold.json`
- `content/base/effects/kx-hollow-sail-folded.json`
- `content/base/species/paired-wake.json`
- `content/base/bodyplans/alien-paired-wake.json`
- `content/base/frames/bio-paired-wake.json`
- `content/base/frames/corpse-paired-wake.json`
- `content/base/monsters/paired-wake-b.json`
- `content/base/abilities/kx-paired-wake-rend.json`
- `content/base/abilities/kx-paired-wake-cross.json`
- `content/base/species/dusk-fold.json`
- `content/base/bodyplans/alien-dusk-fold.json`
- `content/base/frames/bio-dusk-fold.json`
- `content/base/frames/corpse-dusk-fold.json`
- `content/base/monsters/dusk-fold-a.json`
- `content/base/abilities/kx-dusk-fold-rain.json`
- `content/base/abilities/kx-dusk-fold-dim.json`
- `content/base/abilities/kx-dusk-fold-withdraw.json`
- `content/base/effects/kx-dusk-fold-dimmed.json`
- `content/base/effects/kx-dusk-fold-veiled.json`
- `content/base/aiprofiles/kx-dusk-drift.json`
- `content/lore/places/auckland-empty-berths.json`
- `content/base/scenarios/kj2-05-demo.json`
- lore 地點檔照 `content/lore/README.md` places 欄位與計畫第 7、12 段；展示情境照計畫第 9 段「展示共通配置」，id 以 `scenario/kj2-` 開頭。
- 不做：修改或刪除任何既有檔（**`content/base/world/` 一律不碰；`content/lore/timeline.json` 與任何既有 lore 檔一律不碰**）；`src/`、`schemas/`、`test/`、`wf/`（除報告目錄）、`content/index/`、`content/batches/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（scratch、driver、log 一律放 `/tmp/cx-kj2-05/`）。
- 件數 gate：新增超過 34 件就停下回報；容量 gate：單檔超過 16 KB、或合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一種跑；收尾末行 `OK 0 errors`，新警告逐條寫進 REPORT |
| `node content/lore/check.ts` | 寫完 lore 地點檔跑，0 錯 |
| `npm run content:probe -- 物種id們 --n 5` | 收尾跑：本批 4 個新 monster 與參照 monster/sac-d monster/spitter-c monster/mirror-b monster/mirror-a，數字並列進 REPORT |
| `npm run typecheck` | 收尾跑，0 |
| `npm test` | 收尾跑一次；沙箱內 mcp、worldgen、grid、content/index 類檔級失敗是已知環境現象，照實記錄，其他失敗才算問題 |
| `python3 wf/tools/tabledb.py 檔.json find k=v` | 讀 wf-table/1 資料檔（實際路徑 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj2-05 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。本批不要求 MCP 試玩。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-05/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 2 個**：模型隨意，只准為推進正事開（例：一種物種交一個）；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受本交接書範圍約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。

## 工作

1. 讀「先讀」全部與計畫（尤其第 5、9、12 段）、roster 本批四列；讀第 9 段範本代號對應的範本檔。上線發 `PROGRESS`。
2. 逐種寫檔；每種寫完 `npm run check`。寫 lore 地點檔、展示情境。
3. lore check、probe、typecheck、`npm test` 收尾；寫 `naming.json`、`review.json`、`timeline-add.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-05/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-kaiju2/wt-kj2-05/content/` 下 |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-05/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-05/review.json` |
| 年表草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-05/timeline-add.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-kaiju2/kj2-05/REPORT.md` |

`naming.json` 用 wf-table/1：columns `["id","nameEn","meaning","nameZh","method","status"]`，涵蓋本批 species、bodyplan、frame、能力、效果、aiprofile、二名、地點、情境的顯示名。`review.json` 用 wf-table/1：columns `["檔","類別","名稱","白話","掛到"]`，**本批每個新檔一列**（34 列），從計畫 `review-draft.json` 出發；`白話` 一到兩句、**不超過 60 字**。`timeline-add.json` 照計畫第 12 段第 4 條，1 條。

REPORT 結構：**第一段「已讀清單」**；接著四段（做了什麼；產出——每種一行：id、定位、掛到哪；probe 與參照數字、超帶欄位與理由；沒做到或證據不足的；需要決定的事與需要引擎支援的玩法）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 5 條，一條不多，做完就停）

1. worktree 內改動**只有**上列 34 個新檔（`git status --short` 除 `node_modules` 外只見這些）。
2. `npm run check` 末行 `OK 0 errors`；`node content/lore/check.ts` 0 錯；`npm run typecheck` 0；`npm test` 結果照實記錄。
3. `content:probe` 本批 4 個新 monster 0 例外、每個新能力都被 AI 用過至少 1 次（沒用到的寫原因），數字與參照並列在 REPORT。
4. `naming.json`、`review.json`（34 列、白話 ≤ 60 字）、`timeline-add.json` 齊；B 以下 monster 檔 0 個 `name`／`epithet`；新文字 0 個舊詞與禁用詞。
5. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj2-05`。本線團隊：`teams/kaiju2`。上線先發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj2-05 --up PROGRESS '已讀完，開始寫 kj2-05' < /dev/null`）。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj2-05 --up DONE '一句自足結論' /tmp/cx-kj2-05/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增上列 34 個檔＋報告目錄的交付檔＋自測」；`content/base/world/`、`content/lore/timeline.json` 與任何既有檔一律不動——此條優先於工作步驟中任何看似需要改檔的情況。
