# 任務：寫地球 lore 加深計畫——各區人物與事件再補一層、二名獸之夜、古代機周邊，設計 50–80 件、分批並起草產出交接書（只寫計畫，不寫 content 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`wf/workflows/content/ancient-people.md`、`wf/workflows/content/polish.md`（「首要標準」命名）、`content/lore/README.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/verdicts.json`（tabledb 查）、`wf/workflows/dispatch/handoffs/lead-dedup/review-all.json`（上一輪 183 件，tabledb 查）、`wf/workflows/dispatch/handoffs/lead-kaiju2/report.md`、`wf/workflows/dispatch/handoffs/lead-mech2/report.md`、`wf/workflows/dispatch/handoffs/lead-tone-fix/report.md`、`wf/workflows/planning/design-notes/world/history-lines.md`（節點與「崩年的底色」）、`wf/workflows/planning/design-notes/world/history-lines/b-ancient.md`、`wf/workflows/planning/design-notes/world/history-lines/f-rift-line.md`、`wf/workflows/planning/design-notes/world/polity.md`、`wf/workflows/planning/design-notes/world/city-types.md`、`wf/workflows/planning/design-notes/world/great-tide.md`、`wf/workflows/dispatch/handoffs/lead-fill-am/cx-am-01.md`（產出交接書範本）、`content/batches/2026-10/am-01.json`（manifest 範本）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。既有 lore 用 `ls`、`grep`、`content/index/` 分片（tabledb）盤點，**不整份讀大檔**。

## 背景與唯一目標

上一輪各區 lore 已鋪開，Fable 基調審查說：光分布不均、帳務法理重複、有些區只有制度沒有人。本線目標：**地球各區再補一層，以「人、畫面、獸、神話的光」為主**：

- **A. 各區人物與事件**：東亞、南亞、歐洲／內海、非洲／西亞、美洲、海上與殘聯（環太平洋）各補人物與事件；優先補基調審查點名的冷處（美洲五座模板地點、lead-aegir 四個文書職人物所在的城、沒有人開過機甲的地方）——用**新檔**補（例：一個在那座城開機甲的人、一個那座城才有的夜），不改舊檔。
- **B. 二名獸之夜再補**：既有 A 級二名個體（`grep -l '"named"' content/base/monsters/*.json` 與 lore 的二名）盤點哪幾隻還沒有一個「某地某夜叫出名字」的事件，補夜；kaiju2 新增的 6 隻二名優先（已被採用的不重複）。
- **C. 古代機周邊**：古代機（夸父、刑天、恩底彌翁除外——它在月面歸另一線、維拉科查、處容、迦梨、恩凱、埃吉爾、赫卡忒…）身邊的人與地方——守寢人、稽古學會、看守的崗、朝拜的村、拾骸片的孩子；**古代機本身高高在上**：不寫它動（既有 lore 已寫的除外）、不寫誰認主、不被交易。

## 計畫必含（照順序）

1. **已讀清單**。
2. **盤點**：按區列既有 lore（地點、人物、事件件數＋代表件），標出冷處（只有制度沒有人、沒有獸、沒有光）；二名個體 × 已有夜事件對照；古代機 × 周邊 lore 對照。
3. **設計理念**：五到八句。
4. **新件表**：50–80 件，A／B／C 三類都要有（建議 A 約六成、B 約兩成、C 約兩成），每區至少 5 件。每件：id（先 `ls content/lore/「類型」/` 確認不撞）、類型（`characters`／`events`／`places`；`factions` 盡量不加）、中文名、一句定位（人／畫面／獸／光哪一個）、掛點（節點／主線／年表／底色句）、可見度設計、是否 `occurs: possible`、年表條目建議、對既有檔的插入建議（例：人物掛進地點的 `characters`）、新名詞（標提案）。**排除**：月面與塞勒涅本部（月面線在做）、萬潮葬王與吉大港北行、以帳／地契／城約為主角的件。
5. **分批**：切 4–6 批（`bf-deep-01`…），每批 ≤ 15 檔、一批盡量一區或一類；每批列完整檔案清單。
6. **產出交接書稿**：每批一份 `cx-bf-deep-NN.md`，**照範本 `lead-fill-am/cx-am-01.md` 的骨架與段落**，差異：① worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-deep-NN/`；② 報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-deep-NN/`；③ **只新增、不改既有檔**，插入需求寫 `inserts.json`、年表寫 `timeline-add.json`（格式照 bf-common.md）；④ 我是誰 `cx-bf-deep-NN`、團隊 `teams/bigfill`；⑤ 子代理上限 1。逐檔規格寫到產出工人不必再設計（id、類型、名、掛點、body 要點三到五句、關聯欄位值），不替它寫全文。每份跑 `python3 wf/tools/brief_lint.py 「檔」 --strict` 到 0。
7. **manifest 稿**：每批一份 `bf-deep-NN.manifest.json`，照 `content/batches/2026-10/am-01.json`，`mode: add`、`status: draft`、`allow.kinds` 只列該批 lore 目錄、`allow.modify` 空、`base` 寫 `"TBD"`、`reportDir` 指報告目錄。
8. **營運鉤子建議**：哪些新件適合在營運裡被遇到（契約、事件、對話），5–15 條，一句一條（不在本線產出）。
9. **需求與待決**。

## 產出

全部寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/`：`plan.md`（≤ 50 KB）、`review-draft.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，每件一列，白話 ≤ 60 字）、`cx-bf-deep-NN.md`、`bf-deep-NN.manifest.json`。

## 範圍（排除法寫死）

- 只寫上列目錄內的檔。
- 不做：不寫任何 `content/` 檔、`src/`、`test/`、`wf/` 其他檔；不 commit。
- 件數 gate：新件超過 80 刪到 80、少於 50 補到 50。容量 gate：plan.md 超過 50 KB 精簡；超過 70 KB 停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 「資料檔」 grep 「詞」`／`find k=v` | 查 history-timeline.json、`content/lore/timeline.json`、verdicts.json、review-all.json、`content/index/` 分片，不整份讀 |
| `grep -rn 「詞」 /home/lorkhan/repo/game_dev/mecha-srpg/content` | 名字撞不撞、既有寫法 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py 「交接書稿」 --strict` | 每份產出交接書稿 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-bf-deep-plan --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 上線與終局回報 |

## 資源與禁區

- **唯讀調查線**：只寫產出目錄；其餘唯讀。草稿放 `/tmp/cx-bf-deep-plan/`。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意（盤點可交一個）；它也要親讀 AGENTS.md 與 bf-common.md；只准寫 `/tmp/cx-bf-deep-plan/`。
- **分清錯誤來源**：點名工具壞掉、沙箱拒寫 → `BLOCKED`；自己打錯 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-plan --up PROGRESS '已讀完先讀清單，開始盤點各區' < /dev/null`）。
2. 盤點（第 2 段）。
3. 設計、分批（第 3–5、8–9 段）、寫 review-draft.json。
4. 起草產出交接書與 manifest（第 6–7 段），brief_lint 0。
5. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 計畫 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/plan.md` |
| review 草稿 | 同目錄 `review-draft.json` |
| 交接書稿與 manifest 稿 | 同目錄 `cx-bf-deep-NN.md`、`bf-deep-NN.manifest.json` |

回覆只要 5 行摘要＋計畫路徑。

## 驗收（固定 4 條，一條不多，做完就停）

1. plan.md 存在，含「計畫必含」1–9 段。
2. review-draft.json 合法、50–80 列、每列白話 ≤ 60 字；新 id 全計畫內不重複、不撞既有檔。
3. 每批一份交接書稿（brief_lint --strict 0）與 manifest 稿（合法 JSON）。
4. 新件表 0 個以帳／地契／城約為主角的件、0 個古代機認主或被交易、0 個月面或萬潮葬王件。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-deep-plan`。本線團隊：`teams/bigfill`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-deep-plan --up DONE '加深計畫完成：N 件、M 批' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/deep-plan/plan.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-bf-*` 屬 `teams/bigfill`）。
