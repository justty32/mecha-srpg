# 任務：寫月面大填充計畫——盤點月面 lore 缺口、設計 30–45 件新 lore、分批並起草產出交接書（只寫計畫，不寫 content 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`（白手套、鐵偶、群像）、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（節點 N04、N07、N09 與「崩年的底色」）、`wf/workflows/planning/design-notes/world/history-lines/d-moon.md`、`wf/workflows/planning/design-notes/world/magnates.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/before-collapse.md`、`wf/workflows/planning/design-notes/world/before-collapse-powers.md`、`wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`（產出交接書的範本）、`content/batches/2026-10/am-01.json`（manifest 範本）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。月面既有 lore：`grep -l '"world": *"moon"' content/lore/*/*.json` 全讀，另讀 `content/lore/factions/` 下 selene、backside、whitegloves、ground-union、migrant-crew 與任何月面相關勢力、人物（`grep -rl 塞勒涅 content/lore` 找）。年表用 `python3 wf/tools/tabledb.py wf/workflows/planning/design-notes/world/history-timeline.json grep 月` 這類查，不整份讀。

## 背景與唯一目標

上一輪填充刻意延後月面；現在月面 lore 只有 5 個地點。使用者給的月面讀法：**塞勒涅是管家**——公司中等大小，錢是「穹頂下的錢」（富豪群像的錢，不是公司的錢）。範圍：塞勒涅、靜海與月面城市、穹頂下的富豪群像（**不點名富豪**）、月之暗面（走私網，口語暗面；月面地理仍叫背面）、鐵偶、白手套、地勤與罷工、渡月船。守 D 線與 N04、N07、N09（已寫的不推翻）。本線是計畫段：**盤點、設計全部新件、分批、起草產出交接書與 manifest**；產出由別的 sol 工人照你的稿做。

## 計畫必含（照順序）

1. **已讀清單**。
2. **盤點**：月面既有 lore 逐件一行（id、類型、一句、掛點）；D 線、N04／N07／N09 與年表上的月面條目；**缺口表**（地點、勢力、人物群像、事件、日常畫面各缺什麼）。
3. **設計理念**：五到八句——月面怎麼寫才不是「帳本與法條」，而是人、畫面、神話的光（穹頂下的光、月壤、背面的墟帶、渡月船的窗）。
4. **新件表**：30–45 件，類型配比自己定但要涵蓋：月面城市與穹頂區（含靜海周邊）、渡月港與渡月船（船、船員、航程）、地勤與罷工（事件與人）、鐵偶與白手套（怎麼被看見）、月之暗面（暗面的碼頭與人）、穹頂下的富豪群像（以「他們的生活與身邊的人」寫，不點名）、背面墟帶周邊的人（恩底彌翁等古代機本身維持高高在上）。每件：id（先 `ls content/lore/「類型」/` 確認不撞）、類型、中文名、一句定位、掛點（節點／主線／年表／底色句）、可見度設計（secrets／rumor 有無）、是否 `occurs: possible`、年表條目建議（`timeline-add`）、對既有檔的插入建議（`inserts`）、新名詞（標提案）。人物可具名，但富豪、家族、公司不具名。
5. **營運鉤子建議**（不在本線產出）：月面 lore 怎麼在地球營運裡被遇到（例：渡月港的契約、暗面的走私、白手套催收、罷工新聞）；列 5–15 條，每條一句＋需要的 base 類別；需要引擎支援的（如月面營運）列 engine-backlog 候選。
6. **分批**：切 3–4 批（`bf-moon-01`…），每批 ≤ 15 檔、新檔限 `content/lore/{places,factions,characters,events}/`；每批列完整檔案清單。
7. **產出交接書稿**：每批一份，存 `cx-bf-moon-NN.md`，**照範本 `lead-fill-am/cx-am-01.md` 的骨架與段落**（先讀、背景、方法與禁忌引用 bf-common.md、範圍排除法、逐檔規格、必用工具、資源與禁區、工作、交付、驗收 4 條、失敗處置、回報），差異：① worktree 是 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-NN/`；② 報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-moon-NN/`；③ **只新增、不改既有檔**，插入需求寫 `inserts.json`、年表寫 `timeline-add.json`（格式照 bf-common.md）；④ 我是誰 `cx-bf-moon-NN`、團隊 `teams/bigfill`；⑤ 子代理上限 1。逐檔規格寫到產出工人不必再設計（id、類型、名、掛點、body 要點三到五句、relations／places 等欄位值），但不要替它寫 body 全文。每份跑 `python3 wf/tools/brief_lint.py 「檔」 --strict` 到 0。
8. **manifest 稿**：每批一份 `bf-moon-NN.manifest.json`，照 `content/batches/2026-10/am-01.json` 格式，`mode: add`、`status: draft`、`allow.kinds` 只列該批用到的 lore 目錄、`allow.modify` 空、`base` 寫 `"TBD"`、`reportDir` 指上面報告目錄、`checks` 照範本。
9. **需求與待決**：需要領導或使用者決定的事（含你新造的名詞）。

## 產出

全部寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/`：`plan.md`（≤ 45 KB）、`review-draft.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，每件一列，白話 ≤ 60 字）、`cx-bf-moon-NN.md`（每批一份）、`bf-moon-NN.manifest.json`（每批一份）。

## 範圍（排除法寫死）

- 只寫上列目錄內的檔。其餘全部唯讀：不寫任何 `content/` 檔、`src/`、`test/`、`wf/` 其他檔；不 commit。
- 不做：地球上的地點與人物（加深區另一條線在做，月面相關的地球端只限渡月港所在城市的「港」本身且要先 `grep` 確認沒有既有檔）；萬潮葬王；base 檔。
- 件數 gate：新件超過 45 就刪到 45、少於 30 就補到 30。容量 gate：plan.md 超過 45 KB 精簡；超過 60 KB 停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 「資料檔」 grep 「詞」`／`find k=v` | 查 history-timeline.json、history-nodes.json、`content/lore/timeline.json`、glossary.json，不整份讀 |
| `grep -rn 「詞」 /home/lorkhan/repo/game_dev/mecha-srpg/content/lore` | 名字撞不撞、既有寫法 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py 「交接書稿」 --strict` | 每份產出交接書稿 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-moon-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫產出目錄；其餘唯讀。草稿放 `/tmp/cx-bf-moon-plan/`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意；它也要親讀 AGENTS.md 與 bf-common.md；只准寫 `/tmp/cx-bf-moon-plan/`。
- **分清錯誤來源**：點名工具壞掉、沙箱拒寫 → `BLOCKED`；自己打錯 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-plan --up PROGRESS '已讀完先讀清單，開始盤點月面' < /dev/null`）。
2. 盤點（第 2 段）。
3. 設計、分批（第 3–6、9 段）、寫 review-draft.json。
4. 起草產出交接書與 manifest（第 7–8 段），brief_lint 0。
5. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md` |
| review 草稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/review-draft.json` |
| 交接書稿與 manifest 稿 | 同目錄 `cx-bf-moon-NN.md`、`bf-moon-NN.manifest.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 4 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–9 段。
2. review-draft.json 合法、30–45 列、每列白話 ≤ 60 字；新 id 全計畫內不重複、不撞既有檔。
3. 每批一份交接書稿（brief_lint --strict 0）與一份 manifest 稿（合法 JSON）。
4. 新件表 0 個點名富豪／家族／公司、0 個古代機被操縱或交易的寫法、0 個萬潮葬王相關件。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-moon-plan`。本線團隊：`teams/bigfill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-moon-plan --up DONE '月面計畫完成：N 件、M 批' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-bf-*` 屬 `teams/bigfill`）。
