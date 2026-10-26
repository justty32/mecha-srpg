# 任務：照計畫表新增 5 件美洲事件——兩夜二名獸、借山空返、雪底留名、空碗迎船

先讀：`/home/lorkhan/repo/game_dev/mecha-srpg/AGENTS.md`（**親自讀，不靠本交接書的摘要**；REPORT 第一段「已讀清單」逐行列出）：`AGENTS.md`、`wf/workflows/common/user.md`、`wf/workflows/content/README.md`、`wf/workflows/content/batch.md`、`wf/workflows/content/polish.md`、`wf/workflows/content/lore-text.md`、`wf/workflows/content/world-pillars.md`、`content/lore/README.md`、`content/lore/style.md`、`wf/workflows/dispatch/handoffs/plan-tone-review/review.md`、`wf/workflows/dispatch/handoffs/lead-tone-fix/plan/plan.md`、`wf/workflows/dispatch/handoffs/lead-tone-fix/plan/items.json`、`wf/workflows/dispatch/handoffs/lead-tone-fix/plan/new-events.json`、本交接書。路徑相對 repo 根 `/home/lorkhan/repo/game_dev/mecha-srpg/`。

## 背景與唯一目標

Fable 基調審查（使用者「照 Fable」）指出美洲 28 件裡沒有一隻二名獸、沒有一場有人吼出聲的守城。本線唯一目標：在隔離 worktree `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-02` 的 `content/lore/events/` 新增 `plan/new-events.json` 的 5 件事件，一件一檔、檔名＝id 的 name 段。

## 怎麼寫

- 格式照 `content/lore/README.md` 的 events 欄位表；範本讀 `content/lore/events/red-eye-first-seen.json`、`content/lore/events/wreck-crown.json` 整檔。必填：`id`、`name`、`summary`、`body`、`tags`、`date`、`period`、`factions`、`characters`、`places`、`consequences`；`kind` 照表。欄值（日期、引用、tags）照 new-events.json，不自己改。
- `body` 400–1200 字、三到五個 `## ` 小標，外界口吻；大綱的事實、二名與「吼的句子」原文寫進正文。summary 一句（可用白話欄改寫）；consequences 2–4 條，寫守住／失去／留下的實際後果。
- 兩隻二名獸是怪獸擴充線規劃中的新物種（礁角、青鬣）：正文只寫俗名、二名與樣子（白色分叉角掛滿斷索；青色長鬣立起像懸住的暴雨），**不寫數值、部位表或 species id**。獸受挫撤走、未被凡鐵殺死；怪獸不是畜牲，不替牠寫意圖。
- 小人物（露西亞、艾妲、伊蕾娜、岸工）只在正文出現，不加 characters 引用、不新增人物檔；露西亞在兩件瓦爾帕萊索事件是同一人。
- 文筆守禁忌：style.md 禁用詞、不直譯腔、不拿其他作品類比、正文不出現設計層字眼（節點、底色、提案、裁定、開局、模板）。
- 不寫年表（領導改）；每寫完一檔在 worktree 根跑 `node content/lore/check.ts`（新事件未進年表會出警告，可接受，錯誤必須 0）。

## 範圍（排除法寫死）

- 只做：worktree 內 `content/lore/events/` 新增 5 檔（id 照 new-events.json）；報告目錄 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/tf-02/`。
- 不做：修改任何既有檔（含 timeline.json、地點檔）、`content/base/`、`src/`、manifest、`content/index/`；不刪檔；worktree 內不要留其他檔（臨時腳本放 `/tmp/cx-tf-02/`）；不 commit。
- 件數 gate：新增超過 5 檔就停下回報；容量 gate：任一檔 body 超過 1500 字就停下回報。

## 必用工具

| 工具 | 用在哪一步 |
|---|---|
| `python3 -c 'import json…'` | 讀 new-events.json rows |
| `node content/lore/check.ts`（worktree 根） | 每檔寫完 0 錯 |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_poll.sh cx-tf-02 --once` | 每完成一步讀 orders |
| `/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh` | 終局回報 |

## 資源與禁區

- **可寫程式碼線**（本線只寫 lore 資料檔）：只寫「範圍」列的路徑。
- **共通禁區**：不碰鍵盤、滑鼠、螢幕；不開 GUI；不 push、不建分支、不 rebase／reset；不 commit（領導做）；不 `rm -rf`；不改 `~/.codex/config.toml`；不安裝依賴；不用 MCP；不上網。
- **子代理上限 2 個**，模型隨意；它們也要親讀 AGENTS.md 與 `wf/workflows/content/README.md`，受同一範圍約束，同一檔只給一個人寫。
- **分清錯誤來源**：點名的工具本身壞掉、沙箱拒寫 → 發 `BLOCKED`；自己打錯指令或路徑 → 自己修。

## 工作

1. 讀「先讀」；上線發 `PROGRESS`（`inbox_mail.sh cx-tf-02 --up PROGRESS '已讀完，開始寫事件' < /dev/null`）。
2. 逐件寫檔，每檔跑 lore check。
3. 寫 REPORT 並回報。

## 交付

**REPORT 直接寫檔**到 `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/tf-02/REPORT.md`。回覆只要 5 行摘要＋REPORT 路徑。

| 產物 | 路徑（絕對路徑）|
|------|----------------|
| 5 件新事件 | `/tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-02/content/lore/events/…` |
| REPORT | `/home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/tf-02/REPORT.md` |

REPORT 四段：已讀清單；逐件 id｜name｜summary 全文｜body 字數｜吼的句子是否原文入正文；沒做到的與理由；需要決定的事。

## 驗收（固定 3 條，一條不多，做完就停）

1. worktree 根 `node content/lore/check.ts` 回 `errors=0`。
2. 5 件都在 REPORT 有一列。
3. `git -C /tmp/claude-1000/-home-lorkhan-repo-game-dev-mecha-srpg/0f9b4c05-fb1f-4c91-bdb2-4d3d26486a03/scratchpad/lead-tone-fix/wt-tf-02 status --short` 只列 `content/lore/events/` 下這 5 個新檔。

## 失敗怎麼處置（兩種要分開）

- **測出來是壞的** → 自己修到符合；修不好發 `FAILED`，寫明哪條不符。
- **測不出來** → 保持現狀，發 `BLOCKED`，寫卡在哪與解除條件。

## 完成／阻塞回報（必做）

- 我是誰：`cx-tf-02`。本線團隊：`teams/tone`。上線先發 `PROGRESS`。
- 終局：`/home/lorkhan/repo/game_dev/mecha-srpg/wf/tools/inbox_mail.sh cx-tf-02 --up DONE 'tf-02 完成：N 件' /home/lorkhan/repo/game_dev/mecha-srpg/wf/workflows/dispatch/handoffs/lead-tone-fix/tf-02/REPORT.md`（STATUS、N 照實際換）。
- 結束時必發終局 STATUS 之一：`DONE` / `BLOCKED` / `NEEDS-USER` / `FAILED`；卡住超過 10 分鐘先發 `BLOCKED`。

ROSTER 格已由領導代登記（`cx-tf-02` 屬 `teams/tone`）。
