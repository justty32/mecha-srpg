# 任務：在隔離 worktree 新增巢母 C／B 與一種環太平洋岸異形 C 級新物種的可玩資料（batch kj-02）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 開頭要列「已讀清單」，本行每個路徑都要出現，驗收會逐條比對）、`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/bio-monsters.md`、`wf/workflows/content/numeric-bands.md`、`wf/workflows/content/abilities-effects.md`、`wf/workflows/content/playtest.md`、`wf/workflows/content/acceptance-playtest.md`、`content/lore/style.md`、`wf/workflows/planning/specs/world/monsters.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/cx-kj-02.md`（本檔）。相對路徑都相對你的工作目錄 worktree；內容與主 repo 相同。`wf/workflows/content/` 其餘檔（含 `templates.json`、`engine-facts.json`、`numeric-bands.json`、`ability-forms.json`）也請讀過。

## 背景與唯一目標

兩個缺口：(一) 設定說「窄裂縫的蝕錨是同種的縮小版、等級與寬度相同」（`specs/world/monsters.md`），年表也有「寬度 C 的巢母」（2103 第一隻被捕的巢母、2108 達卡北郊裂縫第四天巢母剛坐下），但遊戲裡巢母只有 A 級一隻；(二) 怪獸多從海洋來、環太平洋為主（裁示），現有異形 C 級只有吐棘者一種，沒有一種是「隨漲潮從港口與防波堤爬上岸」的常見獸。本批只補這兩件，**數值比照既有同級，不做平衡**（使用者：數值微調後期再做）。

## 方法（必守）

- 每件掛到設定：巢母 C／B 掛 `specs/world/monsters.md`「等級觀」與年表 2103／2108；新物種掛「海洋與潮汐」裁示（`wf/workflows/planning/design-notes/world/history-lines.md` 框架段）、底色 1.4（精粹在海邊）、F 線（蝕線＝海岸線）。REPORT 寫明。
- **對面無臉**：怪獸是天氣不是角色；文字欄不寫心思、謀略、對白。怪獸不是畜牲（守則 B1–B6：不寫餵、馴、乖）。
- 不拿其他作品類比；中文命名避免直譯（兩步命名，見 polish.md「首要標準」；招式名寫動作與畫面，不寫生物學名詞）；潮→蝕（世界觀詞），海洋本義的潮汐照用；**不用潮差解釋凶度**。
- 已裁示的不推翻；新名詞標「提案」，列進 `naming.json`。B 以下**不寫** `name`／`epithet`。
- 不新增 registries 值；不寫 `territorial`、`molt`（死資料）。

## 範圍（排除法寫死）

只做下面兩件；**沒列的一律不做**，「順手也該改」的寫進 REPORT「需要決定的事」。

- 只做（工作目錄 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-02/`）：
  1. **巢母 C／B**：
     - 修改 `content/base/species/nestmother.json`，**只插入**：`gradeRange` 在 `"A"` 前插入 `"C"`、`"B"`；`baseAttrsByGrade` 加 `C`、`B` 兩鍵（照 bio-monsters.md 屬性帶，巢母慢：initiative 偏低，同 A 的個性）。既有鍵與值一個字不改。
     - 新增 `content/base/monsters/nestmother-c.json`、`nestmother-b.json`：`grade` C／B、`tags: []`、無 `name`／`epithet`；用 `partsOverride` 把各部位層 HP 縮到 C 帶（總層 HP 300–480）與 B 帶（800–1400），部位 id 與層種類照 `bodyplans/insect-nestmother.json` 與 `monsters/nestmother-landlord.json`，核心部位照 A 的比例縮（engine-backlog 第 3 列：核心過厚會讓清剿打不下來）。
  2. **環太平洋岸異形 C 級新物種一族**（id 英文 kebab 自取，先 `ls` 避免撞名；以下以大寫 `SP` 代表你取的 kebab 名）：形象是隨漲潮從港口、防波堤、碼頭樁爬上岸、平時貼在岸線結構上的東西；異形規則：不對稱、一側高抗一側 0、意圖只顯示一半（`behaviors.telegraph:true`）、無錨、不蛻皮。新增：
     - `species/SP.json`（`family:"alien"`、`gradeRange:["C"]`、AI profile 用既有的 `aiprofile/kx-alien-stalker` 或其他既有 profile、tags `["kaiju","alien"]`、capture 照異形既有寫法、`capture.frame` 指向下列 bio frame）
     - `bodyplans/alien-SP.json`（至少一個 core 部位、每部位最後一層 `structural:true`、core 帶 restraint／cockpit 槽與 pilot 座）
     - `frames/bio-SP.json`、`frames/corpse-SP.json`（照 bio-monsters.md「活捕／屍體改裝」規則與既有 `bio-spitter`、`corpse-spitter`）
     - `monsters/SP-c.json`
     - `abilities/kx-SP-*.json` 2 個、`effects/kx-SP-*.json` 0–1 個（傷害 C 帶 12–20、AP 成本約每 6 傷 1 AP；至少一個是異形擅長的 debuff 或貼身限制類，形態照 `ability-forms.json` 選 AI 會用的寫法；`ui.badge` 中文 2–4 字）
  3. （可選）試玩展示情境 1 個：`content/base/scenarios/kj-NAME.json`，讓新單位能在 MCP 裡出場；不需要可不做。
- 新增＋修改檔合計 **≤ 12 件**。
- 不做：修改或刪除上列以外的任何既有檔（**`world/rifts/`、`world/encounters/`、`world/beasts/` 一律不碰**——接進營運會改戰役黃金，由領導另做）；`content/lore/`、`src/`、`schemas/`、`test/`、`wf/`（除報告目錄）、`content/index/`、`content/batches/` 一律不碰；不 commit。
- worktree 內**不要留任何其他檔**（scratch pack、driver、log、socket 一律放 `/tmp/cx-kj-02/`）。
- 件數 gate：新增＋修改超過 12 件就停下回報；容量 gate：單檔超過 16 KB，或合計超過 1 MB 就停下回報。任一觸發都停。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `npm run check` | 每寫完一檔跑；收尾末行 `OK 0 errors`，新警告逐條寫進 REPORT |
| `npm run content:probe` | 收尾跑：三個新 monster id 各 `--n 5`；另跑四個參照 id 同條件（見「工作」第 4 步），兩組數字都進 REPORT |
| `node src/mcp/server.ts`（stdio，driver 照 `src/mcp/e2e.test.ts` 的 `withServer`） | MCP 試玩：至少 2 場、新單位每個至少出場一次、至少 1 場手打；紀錄照 playtest.md 寫 playtest.json 與原始輸出目錄 |
| `npm test` | 收尾跑一次：0 fail，且 `git status --short test/golden src/ops/sim/fixtures` 空 |
| `npm run typecheck` | 收尾跑，0 |
| `python3 wf/tools/tabledb.py {檔.json} find k=v` | 讀 wf-table/1 資料檔（實際路徑 `wf/tools/tabledb.py`；不整份讀） |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-kj-02 --once` | 每完成一步讀 orders／mail |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報（正文一律給檔案） |

不准上網。沙箱禁止 Unix socket listen（`cli.ts serve --socket` 會 EPERM），MCP 一律走 stdio。

## 資源與禁區

- **可寫程式碼線**：只寫「範圍」列的路徑與報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-02/`；可跑上表指令；**不 commit**。

**共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI 視窗；不 push、不建分支、不 rebase／reset；不 commit（沙箱下 `.git` 唯讀）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不碰 `.gitignore`；整檔改寫用單一 Update 操作（見 `wf/workflows/dispatch/lessons.md`）。
**子代理上限 1 個**：模型隨意，只准為推進正事開；做實質工作也要親自讀 `AGENTS.md` 與 `wf/workflows/content/` 全部，同受閘門約束；REPORT 記成本與品質。

**分清錯誤來源**：本交接書點名的工具本身壞掉、權限被擋、沙箱拒寫 → 停下發 `BLOCKED`；你自己打錯指令或路徑、自己寫的臨時腳本出錯 → 自己修、繼續做，不算阻塞。沙箱內 `node --test` 計數不準是已知現象，照實寫進 REPORT。

## 工作

1. 讀「先讀」全部；讀 `content/base/species/{nestmother,spitter,mirror,choir,sac}.json`、`bodyplans/{insect-nestmother,alien-spitter,alien-mirror}.json`、`monsters/{nestmother-landlord,spitter-c,mirror-b}.json`、`frames/{bio-spitter,corpse-spitter}.json`、`abilities/kx-*`、`effects/kx-*` 中異形的範本；`templates.json` 的怪獸列。
2. 定設計表（id、顯示名、英文原名、部位與層、弱點傷害型、兩招）與命名表。
3. 寫檔；每檔後 `npm run check`。
4. probe（新：`nestmother-c`、`nestmother-b`、`SP-c`；參照：`spitter-c`、`reaper-c`、`lancewing-b`、`nestmother-landlord`，皆 monster kind）、MCP 試玩、`npm run typecheck`、`npm test` 收尾；寫 `naming.json`、`review.json`、`playtest.json`、REPORT 並回報。

## 交付

**REPORT 是交付物：直接寫檔到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-02/REPORT.md`，不要只貼在回覆裡。** 回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 新增與修改檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-fill-kaiju/wt-kj-02/content/base/` 下 |
| 命名表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-02/naming.json` |
| 白話審查表 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-02/review.json` |
| 試玩紀錄 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-02/playtest.json`＋同目錄 `mcp-log/` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-fill-kaiju/kj-02/REPORT.md` |

`naming.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["id","nameEn","meaning","nameZh","method","status"],"rows":[…]}`，涵蓋新物種、bio／corpse frame、能力、效果的顯示名。

`review.json` 用 wf-table/1：`{"contract":"wf-table/1","source":"REPORT.md","extracted":"2026-10-26","columns":["檔","類別","名稱","白話","掛到"],"rows":[…]}`，**每件新東西一列**（新物種一列以 species 檔為代表、巢母 C／B 各一列；frame／能力不必各列）：`類別`＝物種／怪獸個體；`白話`＝一到兩句、**不超過 60 字**，給沒讀過設定的人看：它是什麼、為什麼存在；`掛到`＝設定段落／年表條目／底色句。

REPORT 結構：**第一段「已讀清單」**；接著四段（做了什麼；產出——每檔一行：id、等級、定位、掛到哪；probe 與參照數字、試玩摘要、超出數值帶的欄位與理由；沒做到或證據不足的；需要決定的事）；再一段「子代理」；末尾「以後交接書該點名的工具」（沒有就寫「無」）。

## 驗收（固定 6 條，一條不多，做完就停）

1. worktree 內的改動**只有**範圍列的檔（`git status --short` 除 `node_modules` 外只見這些），合計 ≤ 12 件；`species/nestmother.json` 的 diff 只有插入。
2. `npm run check` 末行 `OK 0 errors`；`npm run typecheck` 0；`npm test` 0 fail 且黃金未動。
3. `content:probe` 三個新 monster 0 例外，數字與參照並列在 REPORT；新能力至少被 AI 用過 1 次。
4. `playtest.json` ≥ 2 列，每列 `log` 指向的檔存在。
5. `naming.json`、`review.json` 齊（白話 ≤ 60 字）；新內容 0 個舊詞（殼作古代機外層、摹、殼甲、殼目、殼矢、原鞘、潮作世界觀詞）、0 個 style.md 禁用詞；B 以下 0 個 `name`／`epithet`。
6. REPORT 第一段「已讀清單」列出「先讀」行全部路徑。

不要為了「更保險」加驗其他東西。

## 失敗怎麼處置

- **測出來是壞的** → 修到符合；修不好就把該檔留著、REPORT 寫證據，發 `FAILED`。不要刪既有檔、不要改別的檔來湊。
- **測不出來** → 保持現狀，發 `BLOCKED`，REPORT 寫卡在哪與解除條件。不准拿舊輸出冒充新證據。

## 完成／阻塞回報（必做）

- 我是誰：`cx-kj-02`。本線團隊：`teams/kaiju`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-kj-02 --up DONE '一句自足結論' /tmp/cx-kj-02/final.md`（STATUS 換成實際狀態；沒有正文檔就加 `< /dev/null`）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`，不可無聲等待。
- 等別人時用前景 `wf/tools/inbox_poll.sh cx-kj-02 --wait --timeout 540`，不要用結束回合當等待。
- 標題要是自足的一句結論。完整契約：`wf/workflows/inbox/PROTOCOL.md`。

ROSTER 格已由領導代登記。

> 唯一目標是「只新增／插入範圍列的 base 檔＋報告目錄的交付檔＋自測」；`world/` 下任何檔一律不動，接營運的需求寫進 REPORT——此條優先於工作步驟中任何看似需要改檔的情況。
