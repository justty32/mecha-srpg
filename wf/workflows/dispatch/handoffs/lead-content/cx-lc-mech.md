# 任務：在隔離 worktree 新增人類對手衍型機與配裝（batch lc-mech-01）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/world-pillars/world.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/engine-facts.json`、`wf/workflows/content/templates.json`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`content/lore/style.md`、`wf/workflows/planning/design-notes/terms.md`、`wf/workflows/content/world-pillars/mechs.md`、`wf/workflows/content/mechs.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/ability-forms.json`、`wf/workflows/content/numeric-bands.json`、`wf/workflows/content/battle-field.md`、`wf/workflows/content/acceptance-playtest.md`、`wf/workflows/content/playtest-baselines.json`、`wf/workflows/content/playtest.md`、`wf/workflows/planning/design-notes/mechs.md`、`src/mcp/README.md`（相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同）。`wf/workflows/content/` 其餘檔也請讀過。

## 背景與唯一目標

lore 裡好幾個勢力寫了自家機型（`content/lore/factions/*.json` 的 `mechSeries`），遊戲資料卻沒有對應的 frame——玩家碰到這些勢力時只會看到借來的別家機。本批**只新增** 5–7 台這類人類對手衍型機（各附 `defaultLoadout`）、它們需要的部件／能力／效果，以及 1–2 個人對人展示情境；產出會被路徑閘門與驗收鏈檢查，通過才帶回主 repo。

## 範圍（排除法寫死）

只做下面列出的事；**沒列的一律不做**，遇到「順手也該改」的東西寫進 REPORT 的「需要決定的事」，不要動手。

- 只做：在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/lc/wt-lc-mech-01/` 新增：
  - `content/base/frames/{勢力前綴}-{名}.json` **5–7 台**：從下列「lore 有名、base 沒 frame」的機型挑（優先順序照列）：基多 `禿鷲-II`（C）、`安地斯壁`（B，重裝）、`雷鳥`（A）；奈洛比 `牧杖-III型`（C，帶獸部件接口——本批只做機械件，接口寫進敘述與 REPORT）、`牧者`（B，軛騎指揮機）；鹽鷗 `潮鷗-長槍`（隊長機）；達卡／殘聯 `犁`（D，工程機）；流浪獵團 `燕鷗攻堅型`（犁改）。動筆前先 `ls content/base/frames` 與 `grep` 名字確認真的還沒有；名字沿用 lore 已寫的中文名（lore 是既有設定），英文原名照兩步命名補進 `naming.json`。檔名用勢力前綴（`quito-`、`nairobi-`、`saltgull-`、`league-`、`migrant-`…），id＝`frame/{檔名}`。
  - 每台照 `wf/workflows/content/mechs.md`：`defaultLoadout`（slot id 查該 bodyplan 檔、型別相符、只限 `cls:"mechanical"`）、每台至少一把**不帶** `conventional-arms` 的武器、tags 含 `mech`、`human`、**既有**的一個 `lineage-*`（只用 `content/base/frames` 裡已出現的 lineage tag；該勢力沒有自己的血統就挑最接近的既有血統並在 REPORT 寫理由，**不新增 lineage tag**）、勢力 tag、隊長機加 `captain`。bodyplan 用既有 `bodyplan/mx-*`，不新增。
  - `content/base/components/`、`abilities/`、`effects/` 新檔：只補這幾台真的需要的（可重用既有 `mx-*` 部件；新部件／能力／效果合計 ≤ 6 檔），檔名同樣用勢力前綴。
  - `content/base/scenarios/{前綴}-*.json` 1–2 個：人對人展示情境（玩家用開局機或既有機＋既有駕駛員，敵方放本批新機；玩家落敗條件、rounds 20–30、部署相距 ≥10，照 battle-field.md），給 MCP 試玩用（MCP 只載 `content/base`）。
  - **注意（codex-batches 原註）**：人類遭遇現在偏難、待平衡線處理——**不要靠把新機做弱來平衡**，數值照 numeric-bands 該級帶；`world/models`、`world/encounters` 不寫（新機要進營運遭遇或市場，寫進 REPORT「需要決定」）。
- **用語（新詞，必守）**：古代機本體就叫「古代機」、外層叫「裝甲」（**不用「殼」，也不用已作廢的「原鞘」系列詞**）；衍型機（舊稱摹機）、衍一／衍二、衍式兵器；鎧甲（舊殼甲）、靈目（舊殼目）、矢（舊殼矢：凡鐵矢、光矢、追矢、拘束矢）；世界觀的「潮」改「蝕」——蝕潮（口語「蝕」）、第一次蝕潮、蝕月、蝕盛／蝕歇（舊大潮／小潮）、蝕錨、蝕壓；蝕域不變。原文 `wf/workflows/planning/design-notes/terms.md`（以末段為準）。既有檔裡的舊詞**不要改**（另有改名線全庫處理）；你引用既有專名時（例如既有勢力名「殼學會」、既有地名）照原名寫，不自創替代名。與海洋本義相關的「潮」（潮間帶、潮汐）不在此列。
- **命名兩步**（`wf/workflows/content/polish.md`「首要標準」）：每個新名字先取英文原名（可帶拉丁／古典語根），想清楚意涵，再意譯（概念詞）或音譯（專有名詞）；不逐字直譯，寫完自問「這是不是英文詞換成漢字」。**英文原名不放 `aka`**（`aka` 只放中文別名）；英文原名與意涵寫進命名表 `naming.json`（見交付）。
- 不做：修改或刪除任何既有檔；`src/`、`schemas/`、`test/`、`wf/`（除交付的報告目錄）、`content/index/`、`content/batches/`、`package.json`、`content/base/world/lineages/`、`content/base/world/models/`、registries 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（driver、FIFO、筆記、log 一律放 `/tmp/cx-lc-mech/`）——閘門會把非允許路徑的新檔或改動記成越界。
- 件數 gate：新增／修改檔超過 16 件就停下回報；容量 gate：**你新增的**單檔超過 16 KB，或你新增／插入的內容合計超過 1 MB 就停下回報（既有例外檔 `content/lore/timeline.json` 本身已約 35 KB，不算觸發；只看你插入的量）。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一檔跑一次，末行要 `OK 0 errors` |
| `npm run content:probe -- {新 frame／ability id…} --n 5 --json -` | 自測勝率、平手率、能力使用、超帶欄位；同時跑同級參照（清單見工作第 4 步） |
| `node src/mcp/server.ts`（**stdio**，JSON-RPC 一行一則） | MCP 試玩（規程見 acceptance-playtest.md 第三節）。**沙箱禁止 Unix socket listen（EPERM），不要用 `cli.ts serve --socket`**；照 `src/mcp/e2e.test.ts` 的 `withServer` 寫一支 driver 放 `/tmp/cx-lc-mech/`（initialize → notifications/initialized → tools/call），或 `mkfifo /tmp/cx-lc-mech/in` 讓背景 `node src/mcp/server.ts < /tmp/cx-lc-mech/in > /tmp/cx-lc-mech/out.jsonl` 常駐、逐行寫請求。工具名與參數同 `src/mcp/README.md`。收工結束自己的行程 |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空（黃金不變） |
| `python3 wf/tools/tabledb.py {檔.json} find k=v`（或 `grep RE`、`columns`） | 讀規矩裡的 wf-table/1 資料檔（AGENTS 寫的 tabledb 在本專案的實際路徑是 `wf/tools/tabledb.py`；不整份讀） |
| `wf/tools/inbox_poll.sh cx-lc-mech --once` | 每完成一步讀 orders／mail（在主 repo 路徑跑：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh`） |
| `wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與「交付」列的報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-mech-01/`；可跑 testing 工作流列的驗證指令與測試；**不 commit**。

**共通禁區**（每條線都適用）：不碰鍵盤、滑鼠、螢幕（不送按鍵、不截圖、不搶焦點）；不開 GUI 視窗；**不 push、不建分支、不 rebase／reset 別人的 commit**；**不 commit**（沙箱下 `.git` 唯讀，commit 由領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。MCP 的 `ui_screenshot` 不要用。
**子代理上限 2 個**：可以再派子 agent，模型隨意（量大呆板的活可用 gpt-6-luna 省成本），只准為推進正事開；子 agent 若做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，它們一樣只能寫本 worktree 的允許路徑（同一個閘門會檢查）。REPORT 記下開了幾個、什麼模型、做了什麼、品質如何。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑（例如找不到檔就換正確路徑）、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。（2026-10-24 試點兩條線因把 `tools/tabledb.py` 打成相對 worktree 根的錯路徑就停下，這不該停。）沙箱內 `node --test` 計數不準（每檔只算 1 項）是已知現象，不算阻塞，照實寫進 REPORT 即可。

## 工作

1. 讀「先讀」全部；讀候選勢力的 lore 檔（`content/lore/factions/{quito,nairobi,salt-gull,league,dhaka-weavers,migrant-crew}.json`）與同血統既有 frame、`world/lineages/*.json` 的 `traits.silhouette`。
2. 定機型表（每台：id、等級、勢力、血統、定位、建議配裝）與命名表（英文原名｜意涵｜中文名）。
3. 寫 frames＋新部件／能力／效果；每檔後 `npm run check`。
4. `content:probe` 自測每台新機與新能力（5 seed 0 例外、新能力有被 AI 用），並跑同級參照（D `frame/union-fr7`、C `frame/bulwark-ii`／`frame/longspear-v4`、B `frame/bulwark-iv-rampart`／`frame/selene-crescent-g5`、A `frame/selene-aurora`）；失衡照 acceptance-playtest「怎麼調」改（不靠把機做弱）。
5. 寫 1–2 個展示情境；MCP 試玩至少 3 場（至少 1 場手打；MCP 走 stdio，見必用工具表）：每場原始輸出存 `mcp-log/{場次}.txt`（含 `outcome`），量測寫進 `playtest.json`。 `playtest.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-24","columns":["scenario","seed","rounds","winner","reason","mode","ourLosses","enemyLosses","newAbilityUses","aiUsed","log"],"link_columns":["log"],"rows":[…]}`；`mode` 填 `mcp-manual`／`mcp-auto`／`mcp-spectate`；`log` 相對 playtest.json。
6. `npm test` 收尾；寫 `naming.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-mech-01/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新內容檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/1f7a129f-b648-43e0-9706-bbc73b5f0325/scratchpad/lc/wt-lc-mech-01/content/（範圍列的路徑）` |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-mech-01/naming.json` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-mech-01/REPORT.md` |
| 試玩紀錄 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-mech-01/playtest.json` |
| MCP 原始 log | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-content/lc-mech-01/mcp-log/*.txt` |

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-24","columns":["id","nameEn","meaning","nameZh","method"],"rows":[…]}`，`method` 填意譯／音譯／混用；涵蓋每個新檔的顯示名（含新人物、新地點、新招式、新事件標題）。

REPORT 結構：**第一段「已讀清單」**（逐行列你親自讀過的檔路徑）；接著四段（做了什麼；產出——機型表（每台 id／等級／勢力／血統／定位）、數值帶逐項「指標＝值（帶內／帶外＋理由）」、probe 數字與參照並列、MCP 每場一行；沒做到或證據不足的；需要決定的事）；再一段「子代理」（開了幾個、模型、做什麼、品質）；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 7 條，一條不多，做完就停）

1. worktree 內的改動**只有**範圍列的新檔（`git -C . status --short` 除 `node_modules` 外只見這些），件數 ≤ 16。
2. worktree 內 `npm run check` 末行 `OK 0 errors`；`npm test` 0 fail 且黃金目錄無改動。
3. 新 frame 5–7 台，每台有 `defaultLoadout`、至少一把非凡兵武器、tags 含 `mech`／`human`／既有 `lineage-*`。
4. `content:probe` 每台 `--n 5` 數字與同級參照數字並列在 REPORT。
5. `playtest.json` ≥ 3 列 MCP 場次，每列 `log` 檔存在且含 `outcome`；格式見下。
6. `naming.json` 涵蓋每個新檔的顯示名；新內容的敘述與命名 0 個舊詞（殼／摹／殼甲／殼目／殼矢／原鞘；引用既有專名例外）。
7. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西；某個子代理的產出若不在這張清單上，就不要開它。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的**（跑成了，結果和預期不符）→ 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來**（沒跑成、拿不到證據）→ **保持現狀**，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-lc-mech`。本線團隊：`teams/lead-content`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-lc-mech --up DONE '一句自足結論' /tmp/cx-lc-mech/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）——它會依團隊名冊自動送到領導。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；**卡住超過 10 分鐘先發 `BLOCKED`**，不可無聲等待。
- **等別人時用前景** `wf/tools/inbox_poll.sh cx-lc-mech --wait --timeout 540`，**不要用結束回合當等待**。
- 標題要是自足的一句結論，不可只寫「完成」「報告」。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 背景與工作一致性：唯一目標是「只新增範圍內的新檔＋自測」；任何需要改既有檔的需求一律寫進 REPORT，不動手——此條優先於工作步驟中任何看似需要改檔的情況。
