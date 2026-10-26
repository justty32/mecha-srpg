# 任務：照計畫表改 30 個 lore 檔——美洲地點補記號、錢與法理收斂、撤四件併入主檔

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/README.md`（含可見度）、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/plan/plan.md`、`wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/plan/items.json`、本交接書。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

Fable 基調審查（使用者「照 Fable」）指出美洲地點是模板填空、「地契押給月亮」一類錢與法理的句子重複太多。本線只做計畫表 `items.json` 裡 `批` 為 `tf-01` 的列，在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-01` 裡照每列「處置」改「檔」的「欄」。處置給了替換句就照用；給的是畫面與方向就寫成外界口吻的正文，事實不增不刪。讀列：`python3 -c 'import json;[print(r) for r in json.load(open("/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/plan/items.json"))["rows"] if r["批"]=="tf-01"]'`。

## 怎麼改

- 先讀目標檔現況再改；改完的句子要和前後文接得順。只改處置點名的句子與欄位，其餘不動、不順手潤飾。
- 文筆只守禁忌：style.md 禁用詞、不直譯腔、不拿其他作品類比、正文不出現設計層字眼（節點、底色、N03、提案、裁定、開局、模板）；真相不寫進 summary／body。
- 文字欄（`name`、`summary`、`body`、`relations[].note`、`secrets[].text`／`note`）照常改。下列是領導**預先核可**的非文字改動，只准這幾處：四個撤件（estuary-exchange、another-ledger、djibouti-charter、inland-registers）根加 `"visibility": "hidden"`；`places/montreal.json` 的 `secrets` 追加一列；`places/yangtze-mouth.json` 的 `status2108`；`places/zamboanga.json` 的 `aka`；`places/surat-key-court.json` 的 `aka` 刪一個值；被改到的 `consequences` 字串（陣列長度不變）。
- I25 墨西哥城那支獵團叫「赤鞍獵團」（不是斷桅；斷桅是卡塔赫納的牆）。
- 撤件的內容要真的併進主檔（主檔讀起來要包含那件事），原檔 body 不動、只改 summary 與加 visibility。
- 地點檔的「記號」要先有畫面再有制度：照處置把開篇換成那個記號，制度收短到末段，事實不刪。
- tf-02 會另寫五件新事件（`plan/new-events.json`）：地點正文提到那幾夜時用事件名當文字（例「萬窗喪鐘夜」），不要寫 markdown 連結。
- 每改完一檔在 worktree 根跑 `node content/lore/check.ts`。

## 範圍（排除法寫死）

- 只做：worktree 內 `content/batches/2026-10/tf-01.json` 的 `allow.polishFiles` 所列檔；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/tf-01/`。
- 不做：`content/lore/timeline.json`（年表由領導改）、其他 lore 檔、`content/base/`、`src/`、design-notes、manifest、`content/index/`；不新增、不刪除任何檔；worktree 內不要留其他檔（臨時腳本放 `/tmp/cx-tf-01/`）；不 commit。
- 件數 gate：要改的檔超過 polishFiles 數就停下回報；容量 gate：任一檔 body 淨增超過 900 字就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 -c 'import json…'`（上方讀列指令） | 讀 items.json 本批列 |
| `node content/lore/check.ts`（worktree 根） | 每檔改完 0 錯 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-tf-01 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本線只寫 lore 資料檔）：只寫「範圍」列的路徑。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 commit（領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意；它們也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，受同一範圍約束，同一檔只給一個人改。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-tf-01 --up PROGRESS '已讀完，開始改檔' < /dev/null`）。
2. 逐列改檔，每檔跑 lore check。
3. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔**到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/tf-01/REPORT.md`。回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 改好的檔 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-01/content/lore/…` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/tf-01/REPORT.md` |

REPORT 四段：已讀清單；逐列「序｜檔:欄｜舊句→新句」（舊新各 ≤ 120 字，大改寫附新 summary 全文）；沒做到的列與理由；需要決定的事。

## 驗收（固定 3 條，一條不多，做完就停）

1. worktree 根 `node content/lore/check.ts` 回 `errors=0`。
2. 本批每個序號在 REPORT 有一行「舊→新」，或寫明沒做的理由。
3. `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-01 status --short` 只列 `polishFiles` 內的檔。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tf-01`。本線團隊：`teams/tone`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-tf-01 --up DONE 'tf-01 完成：N 列、M 檔' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/done/2026-10-26/lead-tone-fix/tf-01/REPORT.md`（STATUS、N、M 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-tf-01` 屬 `teams/tone`）。
