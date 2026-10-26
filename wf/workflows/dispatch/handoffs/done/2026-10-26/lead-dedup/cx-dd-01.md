# 任務：照去重計畫表改 35 個 lore 檔——統一矛盾、收斂重複設定句、換掉設計層用字

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`content/lore/README.md`（含「可見度」與事件 `occurs` 欄）、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/fill-rulings.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/plan/plan.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/plan/findings.json`、本交接書。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

去重線已寫好計畫表 `findings.json`（92 列）。本線唯一目標：在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-dedup/wt-dd-01` 裡，**只執行下列序號的列**，每列照「處置」寫死的內容改「目標」指定的檔與欄：

`2 3 5 8 11 12 13 15 16 17 18 19 20 21 24 27 28 30 32 34 35 36 37 39 40 41 42 88 89 90 91 92`

（序 31、52 改的是設定筆記，由領導自己做；改法為 `keep`、`needs-user` 的列一律**不動**。）

## 怎麼改

- 先讀目標檔現況再改；處置給了替換句就照用，給的是方向（如序 92）就寫一兩句外界口吻、不加新情節。改完的句子要和前後文接得順。
- **只改處置點名的句子與欄位**，其餘一字不動；不順手潤飾。文筆只守禁忌：不直譯腔、不拿其他作品類比、正文不出現設計層字眼（節點、底色句、N03、提案、裁定）。
- 文字欄（`summary`、`body`、`name`、`aka`、`relations[].note`）照常改。下列是領導**預先核可**的非文字改動，只准這幾處：序 3 `scale`、序 5 `founded`、序 41 `consequences`（陣列長度不變）、序 35 在 `events/aegir-wakes.json` 根加 `"occurs": "possible"`（其他欄不動）、序 18／24／30／39／42 的 `timeline.json`（序 18 改日期與 era 並移到正確排序位置；序 24 插一條；序 39 刪一條重複並給保留那條補 `event`；序 30／42 改 summary）。
- `timeline.json` 用小腳本按「日期＋title」定位、只改那幾筆，**不可整份重寫或重排其他條目**；改完排序仍要合 README（年-only 排在該年月份之前）。
- 每改完一檔跑一次 `node content/lore/check.ts`（在 worktree 根）。

## 範圍（排除法寫死）

- 只寫：worktree 內 `content/lore/` 下 `content/batches/2026-10/dd-01.json` 的 `allow.polishFiles` 所列 35 檔；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/dd-01/`。
- 不做：其他 lore 檔、`content/base/`、`src/`、design-notes、manifest、`content/index/`；不新增、不刪除任何檔；worktree 內不要留其他檔（臨時腳本放 `/tmp/cx-dd-01/`）；不 commit。
- 件數 gate：要改的檔超過 35 個就停下回報；容量 gate：任一檔的 body 淨增超過 600 字就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 /home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/tabledb.py 資料檔 grep 關鍵詞` | 查 findings.json（rows 已是列）；timeline 的 entries 自己用 python json 讀 |
| `node content/lore/check.ts`（worktree 根） | 每檔改完 0 錯 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-dd-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本線只寫 lore 資料檔）：只寫「範圍」列的路徑。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 commit（領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意；它們也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，受同一範圍約束，同一檔只給一個人改。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-dd-01 --up PROGRESS '已讀完，開始改檔' < /dev/null`）。
2. 逐列改檔，每檔跑 lore check。
3. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔**到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/dd-01/REPORT.md`。回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改好的 35 檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-dedup/wt-dd-01/content/lore/…` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/dd-01/REPORT.md` |

REPORT 四段：已讀清單；逐列「序｜檔:欄｜舊句→新句」（舊新各 ≤ 120 字）；沒做到的列與理由；需要決定的事。

## 驗收（固定 3 條，一條不多，做完就停）

1. worktree 根 `node content/lore/check.ts` 回 `errors=0`。
2. 上列 32 個序號每個在 REPORT 有一行「舊→新」，或寫明沒做的理由。
3. `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-dedup/wt-dd-01 status --short` 只列 `polishFiles` 內的檔。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-dd-01`。本線團隊：`teams/dedup`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-dd-01 --up DONE 'dd-01 完成：N 列、M 檔' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-dedup/dd-01/REPORT.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-dd-01` 屬 `teams/dedup`）。
