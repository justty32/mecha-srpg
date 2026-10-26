# 任務：替月面 lore 補一批地球營運接口的產出交接書稿（bf-play-08，只寫計畫稿，不寫 content 檔）

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；計畫開頭列「已讀清單」）：`AGENTS.md`、`wf/workflows/content/ops-content.md`、`content/lore/style.md`、`content/lore/style/people.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/bf-common.md`（含「重負載限制」）、`wf/workflows/dispatch/handoffs/lead-bigfill/play-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/moon-rulings.md`、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/plan.md`（第 2 節引擎事實、第 7 節月面空位）、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-01.md`（產出交接書範本）、`wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/bf-play-01.manifest.json`（manifest 範本）、`wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/ops-hooks.json`、`wf/workflows/dispatch/handoffs/lead-bigfill/moon-plan/review-draft.json`（月面 36 件 lore id）。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。月面 lore 新檔尚未入 main，內容在 `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-moon-01/`、`wt-bf-moon-02/`、`wt-bf-moon-03/` 的 `content/lore/` 下（唯讀）。

## 背景與唯一目標

月面 lore（靜海渡月港、望鄉號、白手套下船、暗埠、罷工對峙…）已產出，但營運裡遇不到。照 play-plan 第 7 節的四個接口與 ops-hooks.json，設計 **15–20 個地球端營運檔**（契約組 contract＋encounter＋action 3–4 組、事件 6–8 件、對話 2–4 則），讓玩家在地球港口遇到月面的人與消息。照 play-rulings 與 moon-rulings 的基調（每件一道光：奇觀、能吼的話或真代價）。

## 產出

全寫在 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/`：`cx-bf-play-08.md`（照 cx-bf-play-01.md 骨架，worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-bigfill/wt-bf-play-08/`、報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/bf-play-08/`、我是誰 `cx-bf-play-08`；可引用月面 lore id 當掛點（合併時一起入庫），引擎引用只用 HEAD 已有的 base id）、`bf-play-08.manifest.json`（照 bf-play-01.manifest.json，base `"TBD"`）、`moon-hooks-review.json`（wf-table/1，columns `["檔","類別","名稱","白話","掛到"]`，每件一列，白話 ≤ 60 字）。

## 範圍（排除法寫死）

- 只寫上列三個檔。
- 不做：任何 `content/` 檔、`src/`、`test/`、`wf/` 其他檔；不 commit；月面地圖或月面營運（需要引擎的寫進交接書稿「engine-backlog 候選」段）；萬潮葬王、AI。
- 件數 gate：營運檔超過 20 刪到 20、少於 15 補到 15。容量 gate：交接書稿超過 40 KB 精簡；超過 60 KB 停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py` 檔案 `grep` 關鍵詞 | 查 ops-hooks、review-draft |
| `ls /home/lorkhan/repo/game_dev/mecha-srpg/content/base/world/{contracts,encounters,actions,events,dialogues}` 與 bf-play-01–07 交接書稿的檔案清單 | 路徑不撞 |
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/brief_lint.py /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-08.md --strict` | 交接書稿 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 回報 |

## 資源與禁區

- **唯讀調查線**；草稿放 `/tmp/cx-bf-play-moonplan/`。不跑 `npm test` 等重負載（bf-common「重負載限制」）。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 1 個**。
- **分清錯誤來源**：工具壞或沙箱拒寫 → `BLOCKED`；自己打錯 → 自己修。

## 工作

1. 讀「先讀」。
2. 設計 15–20 件、寫三個產出檔，brief_lint 0。
3. 回報。

## 交付

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 交接書稿 | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-08.md` |
| manifest 稿、review | 同目錄 `bf-play-08.manifest.json`、`moon-hooks-review.json` |

回覆只要 3 行摘要。

## 驗收（固定 3 條，一條不多，做完就停）

1. cx-bf-play-08.md brief_lint --strict 0；manifest 合法 JSON。
2. moon-hooks-review.json 15–20 列、白話 ≤ 60 字；路徑不撞既有檔與 bf-play-01–07。
3. 0 個月面地圖／月面營運檔、0 個萬潮葬王與 AI 件。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`。
- **測不出來** → 保持現狀，發 `BLOCKED`。

## 完成／阻塞回報（必做）

- 我是誰：`cx-bf-play-moonplan`。本線團隊：`teams/bigfill`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-bf-play-moonplan --up DONE '月面營運接口交接書稿完成：N 件' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-bigfill/play-plan/cx-bf-play-08.md`（STATUS、N 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`。
