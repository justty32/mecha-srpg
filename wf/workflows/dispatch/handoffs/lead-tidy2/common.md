# lead-tidy2 工人共通規則

[lead-tidy2 交接區](.)

所有 cx-td2-* 工人都要遵守本檔；各自的交接書只寫差異。專案根 `/home/lorkhan/repo/game_dev/mecha-srpg`（下稱 ROOT）。

## 先讀（親自讀）

`ROOT/AGENTS.md`、`ROOT/wf/STRUCTURE.md`、`ROOT/wf/workflows/common/user.md`，再讀交接書點名的工作流入口。

## 現役的其他線（不准碰它們的東西）

- `lead-engine-next`：`src/`（除了交接書明列給你的檔）、`content/base/`、`content/index/`、`test/`、`wf/workflows/dispatch/handoffs/lead-engine-next/`、`wf/inbox/teams/engnext/`、`wf/inbox/mail/lead-engine-next/`。它的 codex 工人同時在改 src，**別跑會改到別人檔的格式化或批次替換**。
- `lead-bigfill`：`content/lore/`、`content/base/` 內容資料、`wf/workflows/dispatch/handoffs/lead-bigfill/`、`wf/inbox/teams/bigfill/`、`wf/inbox/mail/lead-bigfill/`。
- 其他 lead 線與頂層同時在用 git；工作樹裡別人的未提交改動**不准還原、不准覆蓋**。

## 共通禁區

不碰鍵盤滑鼠螢幕、不開 GUI；**不 commit**（領導統一 commit）、不 push、不建分支、不 git reset／checkout／stash；不刪檔、不 `rm`（要丟的東西搬到 `ROOT/wf/workflows/dispatch/handoffs/lead-tidy2/trash/<你的線名>/` 並在 REPORT 列出）；搬檔一律 `git mv`（已追蹤檔）；不改 `.gitignore`、`AGENTS.md` 實質內容、`~/.codex/config.toml`；不裝依賴；**不改任何文字的原意**（拆檔只搬段落，措辭不改；連結路徑修正不算改原意）。子代理上限 2 個。不用 inbox 回報，寫 REPORT 即可。

**分清錯誤來源**：工具或環境出錯（沙箱拒寫、指令不存在）→ 停下，把情況寫進 REPORT 的「沒做到」並結束；自己寫的臨時腳本出錯 → 自己修。沙箱內 `node --test` 計數不準是已知現象，領導會在沙箱外重跑，不要因此判失敗。

## 交付

REPORT 直接寫檔到交接書指定的絕對路徑。四段：做了什麼／產出（含 moves.tsv 路徑，若有搬檔）／沒做到或證據不足的／需要決定的事；末尾「以後交接書該點名的工具」。回覆只要 5 行摘要＋REPORT 路徑。
